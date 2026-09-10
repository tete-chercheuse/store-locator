/**
 * Instanciation de la `Map` MapLibre et des contrôles.
 *
 * MapLibre n'ajoute aucun contrôle de zoom par défaut, contrairement à Leaflet :
 * `navigation` comble cet écart. L'attribution, elle, est ajoutée
 * automatiquement par MapLibre et alimentée par le style OpenFreeMap — ne pas
 * la désactiver, elle satisfait l'obligation OpenStreetMap / OpenMapTiles. Elle
 * est simplement repliée au chargement — voir `attribution.ts`.
 */
import { GeolocateControl, Map as MapLibreMap, NavigationControl } from 'maplibre-gl';
import type { StoreLocatorMapConfig, StoreLocatorProperties } from '../types';
import { collapseAttribution } from './attribution';

/**
 * Conteneurs portant déjà une carte vivante. Remplace la sonde `_leaflet_id`
 * de la v2 sans écrire dans le DOM.
 */
const initializedContainers = new WeakSet<HTMLElement>();

export const releaseContainer = (container: HTMLElement): void => {
  initializedContainers.delete(container);
};

export const createMap = <P extends StoreLocatorProperties>(
  container: HTMLElement,
  config: StoreLocatorMapConfig<P>,
): MapLibreMap => {
  if(initializedContainers.has(container)) {
    throw new Error(
      '[store-locator] - Map container is already initialized. ' +
      'Call destroy() on the previous instance before creating a new one on the same element.',
    );
  }

  const map = new MapLibreMap({
    ...config.options,
    container,
    style: config.style,
  });

  // Marqué dès que la carte existe, et avant l'ajout des contrôles : ceux-ci
  // construisent du DOM et peuvent donc échouer. Une carte vivante sur un
  // conteneur non enregistré laisserait le garde-fou en autoriser une seconde.
  initializedContainers.add(container);

  // Après la construction : c'est elle qui ajoute l'`AttributionControl`, et
  // c'est son DOM que le repli va chercher.
  collapseAttribution(map);

  if(config.navigation) {
    map.addControl(new NavigationControl());
  }

  if(config.locate) {
    map.addControl(new GeolocateControl({
      trackUserLocation: true,
      showUserLocation: true,
    }));
  }

  return map;
};
