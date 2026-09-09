/**
 * Source GeoJSON clusterisée et couches de rendu.
 *
 * Trois couches sont ajoutées :
 *  - `store-locator-clusters` : les bulles de cluster (rendu GPU)
 *  - `store-locator-cluster-count` : le compteur, en `symbol`
 *  - `store-locator-points` : une couche invisible sur les points non
 *    clusterisés, indispensable car `querySourceFeatures` ne retourne des
 *    features que pour les tuiles chargées, et une source sans couche n'en
 *    charge aucune.
 */
import type { FilterSpecification, GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';
import type {
  StoreLocatorClusterOptions,
  StoreLocatorFeatureCollection,
  StoreLocatorProperties,
} from '../types';

export const SOURCE_ID = 'store-locator';
export const CLUSTER_LAYER_ID = 'store-locator-clusters';
export const CLUSTER_COUNT_LAYER_ID = 'store-locator-cluster-count';
export const POINT_LAYER_ID = 'store-locator-points';

export const UNCLUSTERED_FILTER: FilterSpecification = ['!', ['has', 'point_count']];
const CLUSTERED_FILTER: FilterSpecification = ['has', 'point_count'];

export const addClusterSource = <P extends StoreLocatorProperties>(
  map: MapLibreMap,
  collection: StoreLocatorFeatureCollection<P>,
  clusters: StoreLocatorClusterOptions,
): void => {
  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: collection,
    cluster: clusters.enabled,
    clusterRadius: clusters.radius,
    clusterMaxZoom: clusters.maxZoom,
    clusterMinPoints: clusters.minPoints,
  });

  map.addLayer({
    id: POINT_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: UNCLUSTERED_FILTER,
    paint: {
      'circle-radius': 0,
      'circle-opacity': 0,
    },
  });

  if(!clusters.enabled) {
    return;
  }

  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: CLUSTERED_FILTER,
    paint: {
      'circle-color': clusters.color,
      'circle-radius': clusters.size,
      'circle-stroke-color': clusters.strokeColor,
      'circle-stroke-width': clusters.strokeWidth,
    },
  });

  map.addLayer({
    id: CLUSTER_COUNT_LAYER_ID,
    type: 'symbol',
    source: SOURCE_ID,
    filter: CLUSTERED_FILTER,
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': clusters.textFont,
      'text-size': clusters.textSize,
      'text-allow-overlap': true,
    },
    paint: {
      'text-color': clusters.textColor,
    },
  });
};

export const setClusterData = <P extends StoreLocatorProperties>(
  map: MapLibreMap,
  collection: StoreLocatorFeatureCollection<P>,
): void => {
  const source = map.getSource(SOURCE_ID) as GeoJSONSource | undefined;

  // MapLibre v6 : setData ne retourne plus `this` et n'accepte plus de second argument.
  source?.setData(collection);
};
