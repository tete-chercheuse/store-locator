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
import type { Map as MapLibreMap } from 'maplibre-gl';
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
/**
 * `move` est volontairement absent : `Marker` lie déjà son propre `_update` sur
 * cet événement, donc les positions suivent la carte sans nous. La seule chose
 * que `sync()` observe est *quelles tuiles sont chargées*, ce qui ne change que
 * sur `sourcedata`, `moveend` et `idle`. L'y ajouter coûterait un balayage
 * complet des tuiles à chaque frame de chaque déplacement, sans rien apporter.
 */
const SYNC_EVENTS = ['moveend', 'sourcedata', 'idle'] as const;

export interface MarkerSyncOptions<P extends StoreLocatorProperties> {
  map: MapLibreMap;
  resolveIcon: (feature: StoreLocatorFeature<P>) => StoreLocatorIconValue | undefined;
  resolvePopup: (feature: StoreLocatorFeature<P>) => StoreLocatorPopupValue | undefined;
  onMarkerClick: (feature: StoreLocatorFeature<P>) => void;
}

/**
 * Un marqueur et ce qui a servi à le construire.
 *
 * La feature est conservée pour détecter qu'un `id` réutilisé désigne désormais
 * un autre magasin, et l'écouteur pour pouvoir le détacher : `Marker.remove()`
 * ne connaît que ses propres écouteurs, et l'appelant peut fournir un élément
 * qu'il possède et réutilise.
 */
interface TrackedMarker<P extends StoreLocatorProperties> {
  marker: Marker;
  feature: StoreLocatorFeature<P>;
  onClick: () => void;
}

export class MarkerSync<P extends StoreLocatorProperties> {
  private readonly map: MapLibreMap;
  private readonly resolveIcon: MarkerSyncOptions<P>['resolveIcon'];
  private readonly resolvePopup: MarkerSyncOptions<P>['resolvePopup'];
  private readonly onMarkerClick: MarkerSyncOptions<P>['onMarkerClick'];

  private readonly markers = new Map<string | number, TrackedMarker<P>>();
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

  /**
   * Remplace la collection de référence et retire les marqueurs périmés.
   *
   * Élaguer sur la seule absence de l'`id` ne suffit pas. Les `id` sont
   * positionnels : `setStores` réattribue `0..n-1`, donc un `id` peut survivre
   * en désignant un tout autre magasin. Le marqueur construit depuis l'ancienne
   * feature resterait alors en place — anciennes coordonnées, ancienne popup —
   * et `sync()` ne le réparerait jamais, puisqu'il passe son tour dès que
   * `markers.has(id)` est vrai.
   *
   * La comparaison porte donc sur l'identité de la feature. `filterFeatures`
   * préserve les références d'origine, un simple filtrage ne provoque donc
   * aucune reconstruction ; `normalizeStores` crée des objets neufs, un
   * `setStores` en provoque bien une.
   */
  setFeatures(collection: StoreLocatorFeatureCollection<P>): void {
    this.features.clear();

    for(const feature of collection.features) {
      if(feature.id !== undefined) {
        this.features.set(feature.id, feature);
      }
    }

    for(const [id, tracked] of this.markers) {
      if(this.features.get(id) !== tracked.feature) {
        this.removeMarker(id);
      }
    }
  }

  sync(): void {
    if(!this.map.getSource(SOURCE_ID) || !this.map.isSourceLoaded(SOURCE_ID)) {
      return;
    }

    // `validate: false` : la validation par défaut sérialise tout le style à
    // chaque appel — une centaine de couches pour le fond OpenFreeMap Bright.
    // `UNCLUSTERED_FILTER` est une constante de module, donc déjà validée.
    const rendered = this.map.querySourceFeatures(SOURCE_ID, {
      filter: UNCLUSTERED_FILTER,
      validate: false,
    });

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

    for(const id of [...this.markers.keys()]) {
      if(!visible.has(id)) {
        this.removeMarker(id);
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
    for(const id of [...this.markers.keys()]) {
      this.removeMarker(id);
    }
  }

  /**
   * Retire un marqueur et détache son écouteur.
   *
   * `Marker.remove()` ne détache que ses propres écouteurs. Le nôtre survivrait
   * sur un élément fourni par l'appelant et réutilisé d'un rendu à l'autre,
   * s'y empilant à chaque cycle et retenant l'instance au passage.
   */
  private removeMarker(id: string | number): void {
    const tracked = this.markers.get(id);

    if(!tracked) {
      return;
    }

    tracked.marker.getElement().removeEventListener('click', tracked.onClick);
    tracked.marker.remove();
    this.markers.delete(id);
  }

  private createMarker(feature: StoreLocatorFeature<P>): TrackedMarker<P> {
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

    const onClick = (): void => this.onMarkerClick(feature);

    marker.getElement().addEventListener('click', onClick);
    marker.addTo(this.map);

    return { marker, feature, onClick };
  }
}
