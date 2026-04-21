import L from 'leaflet';
import 'leaflet-gesture-handling';
import 'leaflet.markercluster';
import 'leaflet.locatecontrol';

import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';

import type {
  StoreLocatorFeature,
  StoreLocatorFilterValue,
  StoreLocatorFilters,
  StoreLocatorOptions,
  StoreLocatorProperties,
  StoreLocatorResolvedOptions,
  StoreLocatorStoresInput,
} from './types';
import defaultOptions from './utils/default-options';
import { extend, formValues, isFormElement, normalizeStores, resolveElement } from './utils/utils';

const normalizeFilterValues = (value: StoreLocatorFilterValue | null | undefined): string[] => {
  return (Array.isArray(value) ? value : [value])
    .filter((item): item is string => item !== '' && item !== null && item !== undefined)
    .map((item) => `${item}`);
};

const isEmptyFilterValue = (value: StoreLocatorFilterValue | null | undefined): boolean => {
  return !normalizeFilterValues(value).length;
};

const matchesStoreProperty = (property: unknown, filter: StoreLocatorFilterValue): boolean => {
  if(property === null || property === undefined) {
    return false;
  }

  const values = normalizeFilterValues(filter);

  if(!values.length) {
    return true;
  }

  const properties = (Array.isArray(property) ? property : [property]).map((item) => `${item}`);

  return values.some((value) => properties.includes(value));
};

/**
 * Store Locator
 * @module StoreLocator
 */
export default class StoreLocator<P extends StoreLocatorProperties = StoreLocatorProperties> {
  options: StoreLocatorResolvedOptions<P>;
  map: L.Map | null = null;
  clusters: L.FeatureGroup<L.Layer> | null = null;
  filters: HTMLFormElement | null = null;

  private filterFields: Element[] = [];
  private filterChangeHandler: (() => void) | null = null;
  private resizeObserver: ResizeObserver | null = null;

  /**
   * Instantiate StoreLocator
   * @param options Store locator options
   */
  constructor(options: StoreLocatorOptions<P>) {
    this.options = this.createOptions(options);

    if(this.options.stores === null) {
      throw new Error('[store-locator] - No stores available');
    }

    this.initMap();
    this.setFilters();
  }

  setStores(
    stores: StoreLocatorStoresInput<P>,
    filters: StoreLocatorFilters | null = null,
    recenter = this.options.map.refreshRecenter,
    maxZoom: number | null = null,
  ): void {
    this.options.stores = normalizeStores(stores);
    this.refreshClusters(filters, recenter, maxZoom);
  }

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
    this.filterChangeHandler = () => this.refreshClusters(formValues(this.filters as HTMLFormElement));

    for(const field of this.filterFields) {
      field.addEventListener('change', this.filterChangeHandler);
    }

    this.refreshClusters(formValues(this.filters));
  }

  refreshClusters(
    filters: StoreLocatorFilters | null = null,
    recenter = this.options.map.refreshRecenter,
    maxZoom: number | null = null,
  ): void {
    if(!this.clusters || !this.options.stores) {
      return;
    }

    this.clusters.clearLayers();

    const stores = {
      ...this.options.stores,
      features: [...this.options.stores.features],
    };

    if(filters) {
      stores.features = stores.features.filter((store) => {
        return Object.entries(filters).every(([filter, value]) => {
          if(isEmptyFilterValue(value)) {
            return true;
          }

          return matchesStoreProperty(store.properties?.[filter], value);
        });
      });
    }

    if(!stores.features.length) {
      return;
    }

    const geoJson = L.geoJSON(stores, {
      pointToLayer: (feature: StoreLocatorFeature<P>, latlng: L.LatLng) => {
        const marker = L.marker(latlng);
        const popup = this.resolvePopup(feature);
        const icon = this.resolveIcon(feature);

        if(typeof popup === 'string' || popup instanceof L.Popup) {
          marker.bindPopup(popup);
        }

        if(icon instanceof L.Icon) {
          marker.setIcon(icon);
        }

        marker.on('click', () => this.map?.setView(marker.getLatLng()));

        return marker;
      },
    });

    this.clusters.addLayer(geoJson);

    if(recenter) {
      this.map?.fitBounds(this.clusters.getBounds(), { maxZoom: maxZoom ?? undefined });
    }
  }

  invalidateSize(options?: Parameters<L.Map['invalidateSize']>[0]): void {
    this.map?.invalidateSize(options);
  }

  destroy(): void {
    this.detachFilters();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;

    if(this.map) {
      this.map.off();
      this.map.remove();
    }

    this.map = null;
    this.clusters = null;
    this.filters = null;
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
    const mapContainer = this.resolveMapElement();

    if(!mapContainer) {
      throw new Error('[store-locator] - Map container not found');
    }

    if((mapContainer as HTMLElement & { _leaflet_id?: number; })._leaflet_id) {
      throw new Error(
        '[store-locator] - Map container is already initialized. ' +
        'Call destroy() on the previous instance before creating a new one on the same element.',
      );
    }

    this.map = L.map(mapContainer, this.options.map.options);

    L.tileLayer(this.options.map.tiles.url, this.options.map.tiles.options).addTo(this.map);

    if(this.options.map.locate) {
      L.control.locate().addTo(this.map);
    }

    this.map.on('click', () => this.map?.scrollWheelZoom.enable());
    this.map.on('mouseout', () => this.map?.scrollWheelZoom.disable());

    this.clusters = L.markerClusterGroup(this.options.map.markers.clustersOptions);
    this.map.addLayer(this.clusters);

    if(typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.map?.invalidateSize();
      });
      this.resizeObserver.observe(mapContainer);
    }

    this.refreshClusters(
      null,
      true,
      this.options.map.initialRecenter ? null : this.options.map.options.zoom,
    );
  }

  private resolveMapElement(): HTMLElement | null {
    return this.options.elements.map ?? resolveElement<HTMLElement>(this.options.selectors.map, null, true);
  }

  private resolveWrapperElement(): HTMLElement | null {
    return this.options.elements.wrapper ?? resolveElement<HTMLElement>(this.options.selectors.wrapper);
  }

  private resolvePopup(feature: StoreLocatorFeature<P>): string | L.Popup | null | undefined {
    const popup = this.options.map.markers.popup;

    return typeof popup === 'function'
      ? popup(feature)
      : popup;
  }

  private resolveIcon(feature: StoreLocatorFeature<P>): L.Icon | L.DivIcon | null | undefined {
    const icon = this.options.map.markers.icon;

    return typeof icon === 'function'
      ? icon(feature)
      : icon;
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

export type {
  StoreLocatorCoordinateStore,
  StoreLocatorCoordinateValue,
  StoreLocatorElements,
  StoreLocatorFeature,
  StoreLocatorFeatureCollection,
  StoreLocatorFilterValue,
  StoreLocatorFilters,
  StoreLocatorIconFactory,
  StoreLocatorMapConfig,
  StoreLocatorMarkerOptions,
  StoreLocatorOptions,
  StoreLocatorPopupFactory,
  StoreLocatorProperties,
  StoreLocatorResolvedOptions,
  StoreLocatorSelectors,
  StoreLocatorStoresInput,
  StoreLocatorTilesOptions,
} from './types';
