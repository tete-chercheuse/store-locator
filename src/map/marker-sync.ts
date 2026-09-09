/**
 * Cycle de vie des marqueurs DOM.
 *
 * `querySourceFeatures` sert uniquement à savoir **quels** points sont non
 * clusterisés dans les tuiles chargées. Les coordonnées et les propriétés
 * proviennent, elles, de la collection en mémoire : l'encodage en tuile
 * vectorielle dégrade la précision des coordonnées et sérialise les propriétés
 * imbriquées en chaînes JSON.
 */
import { Marker, Popup } from 'maplibre-gl';
import type { MapGeoJSONFeature, Map as MapLibreMap } from 'maplibre-gl';
import type {
  StoreLocatorFeature,
  StoreLocatorFeatureCollection,
  StoreLocatorIconValue,
  StoreLocatorPopupValue,
  StoreLocatorProperties,
} from '../types';
import { normalizeIcon } from './normalize-icon';
import { normalizePopup } from './normalize-popup';
import { SOURCE_ID, UNCLUSTERED_FILTER } from './cluster-source';

/**
 * Le handler ignore volontairement la charge utile de l'événement. MapLibre v6
 * a supprimé `MapDataEvent` au profit de `MapSourceDataEvent`, et `sourcedata`
 * se déclenche pour chaque tuile : la seule question utile est « resynchroniser
 * maintenant ? », pas « qu'est-ce qui a changé ? ».
 */
const SYNC_EVENTS = ['move', 'moveend', 'sourcedata', 'idle'] as const;

export interface MarkerSyncOptions<P extends StoreLocatorProperties> {
  map: MapLibreMap;
  resolveIcon: (feature: StoreLocatorFeature<P>) => StoreLocatorIconValue | undefined;
  resolvePopup: (feature: StoreLocatorFeature<P>) => StoreLocatorPopupValue | undefined;
  onMarkerClick: (feature: StoreLocatorFeature<P>) => void;
}

export class MarkerSync<P extends StoreLocatorProperties> {
  private readonly map: MapLibreMap;
  private readonly resolveIcon: MarkerSyncOptions<P>['resolveIcon'];
  private readonly resolvePopup: MarkerSyncOptions<P>['resolvePopup'];
  private readonly onMarkerClick: MarkerSyncOptions<P>['onMarkerClick'];

  private readonly markers = new Map<string | number, Marker>();
  private readonly features = new Map<string | number, StoreLocatorFeature<P>>();
  private readonly handler = (): void => this.sync();

  private started = false;

  constructor(options: MarkerSyncOptions<P>) {
    this.map = options.map;
    this.resolveIcon = options.resolveIcon;
    this.resolvePopup = options.resolvePopup;
    this.onMarkerClick = options.onMarkerClick;
  }

  start(): void {
    if(this.started) {
      return;
    }

    for(const event of SYNC_EVENTS) {
      this.map.on(event, this.handler);
    }

    this.started = true;
  }

  /** Remplace la collection de référence et retire les marqueurs orphelins. */
  setFeatures(collection: StoreLocatorFeatureCollection<P>): void {
    this.features.clear();

    for(const feature of collection.features) {
      if(feature.id !== undefined) {
        this.features.set(feature.id, feature);
      }
    }

    for(const [id, marker] of this.markers) {
      if(!this.features.has(id)) {
        marker.remove();
        this.markers.delete(id);
      }
    }
  }

  sync(): void {
    if(!this.map.getSource(SOURCE_ID) || !this.map.isSourceLoaded(SOURCE_ID)) {
      return;
    }

    const rendered = this.map.querySourceFeatures(SOURCE_ID, {
      filter: UNCLUSTERED_FILTER,
    }) as MapGeoJSONFeature[];

    const visible = new Set<string | number>();

    for(const tileFeature of rendered) {
      const id = tileFeature.id;

      if(id === undefined || visible.has(id)) {
        continue;
      }

      visible.add(id);

      if(this.markers.has(id)) {
        continue;
      }

      const feature = this.features.get(id);

      if(!feature) {
        continue;
      }

      this.markers.set(id, this.createMarker(feature));
    }

    for(const [id, marker] of this.markers) {
      if(!visible.has(id)) {
        marker.remove();
        this.markers.delete(id);
      }
    }
  }

  destroy(): void {
    this.clear();
    this.features.clear();

    if(this.started) {
      for(const event of SYNC_EVENTS) {
        this.map.off(event, this.handler);
      }

      this.started = false;
    }
  }

  private clear(): void {
    for(const marker of this.markers.values()) {
      marker.remove();
    }

    this.markers.clear();
  }

  private createMarker(feature: StoreLocatorFeature<P>): Marker {
    const iconOptions = normalizeIcon(this.resolveIcon(feature));
    const marker = new Marker(iconOptions ?? undefined);

    marker.setLngLat(feature.geometry.coordinates as [number, number]);

    const popup = normalizePopup(this.resolvePopup(feature));

    if(popup) {
      const instance = new Popup(popup.options);

      if(typeof popup.content === 'string') {
        instance.setHTML(popup.content);
      }
      else {
        instance.setDOMContent(popup.content);
      }

      marker.setPopup(instance);
    }

    marker.getElement().addEventListener('click', () => this.onMarkerClick(feature));
    marker.addTo(this.map);

    return marker;
  }
}
