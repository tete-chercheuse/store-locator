/**
 * Calcul de l'emprise géographique d'une collection de points.
 *
 * Retourne un tuple `[[ouest, sud], [est, nord]]` plutôt qu'une instance
 * `LngLatBounds`, pour rester indépendant de `maplibre-gl` et donc testable
 * sans mock. `Map.fitBounds()` accepte ce format (`LngLatBoundsLike`).
 *
 * Limite connue : les collections chevauchant l'antiméridien produisent une
 * emprise qui fait le tour du globe. C'était déjà le comportement de la v2.
 */
import type { StoreLocatorBounds, StoreLocatorFeatureCollection, StoreLocatorProperties } from '../types';
export declare const computeBounds: <P extends StoreLocatorProperties>(collection: StoreLocatorFeatureCollection<P>) => StoreLocatorBounds | null;
