/**
 * Instanciation de la `Map` MapLibre et des contrôles.
 *
 * MapLibre n'ajoute aucun contrôle de zoom par défaut, contrairement à Leaflet :
 * `navigation` comble cet écart. L'attribution, elle, est ajoutée
 * automatiquement par MapLibre et alimentée par le style OpenFreeMap — ne pas
 * la désactiver, elle satisfait l'obligation OpenStreetMap / OpenMapTiles. Elle
 * est simplement repliée au chargement — voir `attribution.ts`.
 */
import { Map as MapLibreMap } from 'maplibre-gl';
import type { StoreLocatorMapConfig, StoreLocatorProperties } from '../types';
export declare const releaseContainer: (container: HTMLElement) => void;
export declare const createMap: <P extends StoreLocatorProperties>(container: HTMLElement, config: StoreLocatorMapConfig<P>, unresolvedImages: Set<string>) => MapLibreMap;
