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
import { injectMapLibreCss } from './inject-css';
import { resolveMissingImages } from './missing-images';
import { configureWorker } from './worker';

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
  unresolvedImages: Set<string>,
): MapLibreMap => {
  if(initializedContainers.has(container)) {
    throw new Error(
      '[store-locator] - Map container is already initialized. ' +
      'Call destroy() on the previous instance before creating a new one on the same element.',
    );
  }

  // Avant la construction : MapLibre bâtit aussitôt le DOM de ses contrôles, et
  // une feuille arrivée après laisserait paraître un instant leur version non
  // mise en forme.
  if(config.injectCss) {
    injectMapLibreCss(config.cssNonce ?? undefined);
  }

  // Avant la construction également : MapLibre acquiert son pool de workers dès
  // qu'il instancie son `Style`, donc `setWorkerUrl` doit être passé avant.
  configureWorker(config.workerUrl);

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

  if(config.resolveMissingImages) {
    resolveMissingImages(map, unresolvedImages);
  }

  if(config.navigation) {
    map.addControl(new NavigationControl());
  }

  if(config.locate) {
    // Les défauts de la librairie, qu'un objet fourni complète ou corrige. Le
    // cas à connaître est `positionOptions` : MapLibre y impose
    // `maximumAge: 0`, qui interdit toute position en cache. Sur macOS,
    // CoreLocation répond alors volontiers `kCLErrorLocationUnknown` plutôt
    // qu'un relevé, et rien ici ne permettait de l'assouplir.
    map.addControl(new GeolocateControl({
      trackUserLocation: true,
      showUserLocation: true,
      ...(config.locate === true ? {} : config.locate),
    }));
  }

  return map;
};
