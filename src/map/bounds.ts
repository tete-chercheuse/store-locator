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

export const computeBounds = <P extends StoreLocatorProperties>(
  collection: StoreLocatorFeatureCollection<P>,
): StoreLocatorBounds | null => {
  let west = Number.POSITIVE_INFINITY;
  let south = Number.POSITIVE_INFINITY;
  let east = Number.NEGATIVE_INFINITY;
  let north = Number.NEGATIVE_INFINITY;
  let found = false;

  for(const feature of collection.features) {
    const [lng, lat] = feature.geometry.coordinates;

    if(!Number.isFinite(lng) || !Number.isFinite(lat)) {
      continue;
    }

    west = Math.min(west, lng);
    east = Math.max(east, lng);
    south = Math.min(south, lat);
    north = Math.max(north, lat);
    found = true;
  }

  return found ? [[west, south], [east, north]] : null;
};
