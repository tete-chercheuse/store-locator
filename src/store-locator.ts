import type * as GeoJSON from 'geojson';
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import type {
  StoreLocatorFeature,
  StoreLocatorFeatureCollection,
  StoreLocatorFilters,
  StoreLocatorIconValue,
  StoreLocatorOptions,
  StoreLocatorPopupValue,
  StoreLocatorProperties,
  StoreLocatorResolvedOptions,
  StoreLocatorStoresInput,
} from './types';
import defaultOptions, { OPENFREEMAP_BRIGHT } from './utils/default-options';
import { filterFeatures } from './utils/filters';
import { extend, formValues, isFormElement, normalizeStores, resolveElement } from './utils/utils';
import { computeBounds } from './map/bounds';
import { createMap, releaseContainer } from './map/create-map';
import { CLUSTER_LAYER_ID, SOURCE_ID, addClusterSource, setClusterData } from './map/cluster-source';
import { MarkerSync } from './map/marker-sync';

/**
 * Rafraîchissement mis en attente tant que le style MapLibre n'est pas chargé.
 *
 * Les intentions doivent être **fusionnées**, pas écrasées. En v2, le
 * constructeur appelait `refreshClusters(null, true, …)` puis `setFilters()`
 * relançait un rendu sans recentrage — les deux s'exécutaient dans l'ordre, de
 * façon synchrone. En v3 les deux sont différés jusqu'à `load` : un simple
 * écrasement ferait perdre le recentrage initial dès qu'un formulaire de
 * filtres est présent.
 */
interface PendingRefresh {
  filters: StoreLocatorFilters | null;
  recenter: boolean;
  maxZoom: number | null;
}

/**
 * Store Locator
 * @module StoreLocator
 */
export default class StoreLocator<P extends StoreLocatorProperties = StoreLocatorProperties> {
  options: StoreLocatorResolvedOptions<P>;
  map: MapLibreMap | null = null;
  filters: HTMLFormElement | null = null;

  private markerSync: MarkerSync<P> | null = null;
  private container: HTMLElement | null = null;
  private styleLoaded = false;
  private pending: PendingRefresh | null = null;
  private readonly readyPromise: Promise<this>;
  private resolveReady!: (instance: this) => void;

  private filterFields: Element[] = [];
  private filterChangeHandler: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;

  /**
   * Instancie le store locator et démarre la carte.
   * @param options Options du store locator
   */
  constructor(options: StoreLocatorOptions<P>) {
    this.options = this.createOptions(options);

    if(this.options.stores === null) {
      throw new Error('[store-locator] - No stores available');
    }

    this.readyPromise = new Promise<this>((resolve) => {
      this.resolveReady = resolve;
    });

    this.pending = {
      filters: null,
      recenter: true,
      maxZoom: this.options.map.initialRecenter ? null : this.options.map.options.zoom,
    };

    this.initMap();
    this.setFilters();
  }

  /**
   * Résout quand le style MapLibre est chargé et que les couches sont en place.
   * Résout également, avec l'instance détruite, si `destroy()` est appelé avant.
   */
  whenReady(): Promise<this> {
    return this.readyPromise;
  }

  /** Remplace les données affichées et rafraîchit la carte. */
  setStores(
    stores: StoreLocatorStoresInput<P>,
    filters: StoreLocatorFilters | null = null,
    recenter = this.options.map.refreshRecenter,
    maxZoom: number | null = null,
  ): void {
    this.options.stores = normalizeStores(stores);
    this.refresh(filters, recenter, maxZoom);
  }

  /** Associe ou réassocie le formulaire de filtres. */
  setFilters(
    filters: string | HTMLFormElement | null = this.options.elements.filters ?? this.options.selectors.filters,
    wrapper: string | HTMLElement | null = this.options.elements.wrapper ?? this.options.selectors.wrapper,
  ): void {
    this.detachFilters();

    if(typeof filters === 'string') {
      this.options.selectors.filters = filters;
      this.options.elements.filters = null;
    }
    else {
      this.options.elements.filters = isFormElement(filters) ? filters : null;
    }

    if(typeof wrapper === 'string') {
      this.options.selectors.wrapper = wrapper;
      this.options.elements.wrapper = null;
    }
    else {
      this.options.elements.wrapper = wrapper;
    }

    const wrapperElement = this.resolveWrapperElement();
    const filtersElement = this.options.elements.filters ?? resolveElement<HTMLFormElement>(this.options.selectors.filters, wrapperElement);

    if(!filtersElement || !filtersElement.elements.length) {
      this.filters = null;
      return;
    }

    this.filters = filtersElement;
    this.filterFields = Array.from(this.filters.elements);
    this.filterChangeHandler = () => this.refresh(formValues(this.filters as HTMLFormElement));

    for(const field of this.filterFields) {
      field.addEventListener('change', this.filterChangeHandler);
    }

    this.refresh(formValues(this.filters));
  }

  /** Réapplique les filtres à la source et resynchronise les marqueurs. */
  refresh(
    filters: StoreLocatorFilters | null = null,
    recenter = this.options.map.refreshRecenter,
    maxZoom: number | null = null,
  ): void {
    if(!this.map || !this.options.stores) {
      return;
    }

    if(!this.styleLoaded) {
      this.pending = {
        filters,
        recenter: recenter || (this.pending?.recenter ?? false),
        maxZoom: maxZoom ?? this.pending?.maxZoom ?? null,
      };
      return;
    }

    const collection = filterFeatures(this.options.stores, filters);

    setClusterData(this.map, collection);
    this.markerSync?.setFeatures(collection);
    this.markerSync?.sync();

    if(recenter) {
      this.fitToCollection(collection, maxZoom);
    }
  }

  /** Relance le calcul de taille de la carte. Utile après un affichage différé. */
  resize(): void {
    this.map?.resize();
  }

  /** Détruit la carte et libère tous les écouteurs. */
  destroy(): void {
    this.detachFilters();

    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    this.markerSync?.destroy();
    this.markerSync = null;

    this.map?.remove();

    if(this.container) {
      releaseContainer(this.container);
    }

    this.container = null;
    this.map = null;
    this.filters = null;
    this.styleLoaded = false;
    this.resolveReady(this);
  }

  private createOptions(options: StoreLocatorOptions<P>): StoreLocatorResolvedOptions<P> {
    const mergedOptions = extend<StoreLocatorResolvedOptions<P>>(
      true,
      defaultOptions as unknown as Record<string, unknown>,
      options as unknown as Record<string, unknown>,
    );

    return {
      ...mergedOptions,
      stores: normalizeStores(options.stores),
    };
  }

  private initMap(): void {
    const container = this.resolveMapElement();

    if(!container) {
      throw new Error('[store-locator] - Map container not found');
    }

    this.container = container;
    this.map = createMap(container, this.options.map);

    this.markerSync = new MarkerSync<P>({
      map: this.map,
      resolveIcon: (feature) => this.resolveIcon(feature),
      resolvePopup: (feature) => this.resolvePopup(feature),
      onMarkerClick: (feature) => {
        this.map?.easeTo({ center: feature.geometry.coordinates as [number, number] });
      },
    });

    this.map.on('load', () => this.handleStyleLoad());

    if(typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.map?.resize());
      this.resizeObserver.observe(container);
    }
  }

  private handleStyleLoad(): void {
    if(!this.map || !this.options.stores) {
      return;
    }

    const pending = this.pending ?? { filters: null, recenter: true, maxZoom: null };

    this.pending = null;

    const collection = filterFeatures(this.options.stores, pending.filters);

    addClusterSource(this.map, collection, this.options.map.clusters);
    this.bindClusterInteractions();

    this.markerSync?.setFeatures(collection);
    this.markerSync?.start();
    this.markerSync?.sync();

    this.styleLoaded = true;

    if(pending.recenter) {
      this.fitToCollection(collection, pending.maxZoom);
    }

    this.resolveReady(this);
  }

  private bindClusterInteractions(): void {
    if(!this.map || !this.options.map.clusters.enabled) {
      return;
    }

    const map = this.map;

    map.on('click', CLUSTER_LAYER_ID, (event) => {
      const feature = event.features?.[0];
      const clusterId = feature?.properties?.cluster_id as number | undefined;

      // `feature` est redondant à l'exécution — sans feature, pas de
      // `clusterId` — mais le cast ci-dessus coupe le lien d'inférence, et
      // `feature` resterait `possibly undefined` dans le `.then()`.
      if(!feature || clusterId === undefined) {
        return;
      }

      const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;

      if(!source?.getClusterExpansionZoom) {
        return;
      }

      void source.getClusterExpansionZoom(clusterId).then((zoom: number) => {
        map.easeTo({
          center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
          zoom,
        });
      });
    });

    map.on('mouseenter', CLUSTER_LAYER_ID, () => {
      map.getCanvas().style.cursor = 'pointer';
    });

    map.on('mouseleave', CLUSTER_LAYER_ID, () => {
      map.getCanvas().style.cursor = '';
    });
  }

  private fitToCollection(collection: StoreLocatorFeatureCollection<P>, maxZoom: number | null): void {
    const bounds = computeBounds(collection);

    if(!bounds || !this.map) {
      return;
    }

    this.map.fitBounds(bounds, {
      ...this.options.map.fitBoundsOptions,
      ...(maxZoom !== null ? { maxZoom } : {}),
    });
  }

  private resolveMapElement(): HTMLElement | null {
    return this.options.elements.map ?? resolveElement<HTMLElement>(this.options.selectors.map, null, true);
  }

  private resolveWrapperElement(): HTMLElement | null {
    return this.options.elements.wrapper ?? resolveElement<HTMLElement>(this.options.selectors.wrapper);
  }

  private resolvePopup(feature: StoreLocatorFeature<P>): StoreLocatorPopupValue | undefined {
    const popup = this.options.map.markers.popup;

    return typeof popup === 'function' ? popup(feature) : popup;
  }

  private resolveIcon(feature: StoreLocatorFeature<P>): StoreLocatorIconValue | undefined {
    const icon = this.options.map.markers.icon;

    return typeof icon === 'function' ? icon(feature) : icon;
  }

  private detachFilters(): void {
    if(this.filterFields.length && this.filterChangeHandler) {
      for(const field of this.filterFields) {
        field.removeEventListener('change', this.filterChangeHandler);
      }
    }

    this.filterFields = [];
    this.filterChangeHandler = null;
  }
}

export { OPENFREEMAP_BRIGHT };

export type {
  StoreLocatorBounds,
  StoreLocatorClusterOptions,
  StoreLocatorCoordinateStore,
  StoreLocatorCoordinateValue,
  StoreLocatorElements,
  StoreLocatorFeature,
  StoreLocatorFeatureCollection,
  StoreLocatorFilterValue,
  StoreLocatorFilters,
  StoreLocatorFitBoundsOptions,
  StoreLocatorIconFactory,
  StoreLocatorIconOptions,
  StoreLocatorIconValue,
  StoreLocatorMapConfig,
  StoreLocatorMapOptions,
  StoreLocatorMarkerOptions,
  StoreLocatorOptions,
  StoreLocatorPaintValue,
  StoreLocatorPopupContent,
  StoreLocatorPopupFactory,
  StoreLocatorPopupOptions,
  StoreLocatorPopupValue,
  StoreLocatorProperties,
  StoreLocatorResolvedOptions,
  StoreLocatorSelectors,
  StoreLocatorStoresInput,
} from './types';
