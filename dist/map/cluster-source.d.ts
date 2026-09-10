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
import type { FilterSpecification, Map as MapLibreMap } from 'maplibre-gl';
import type { StoreLocatorClusterOptions, StoreLocatorFeatureCollection, StoreLocatorProperties } from '../types';
export declare const SOURCE_ID = "store-locator";
export declare const CLUSTER_LAYER_ID = "store-locator-clusters";
export declare const CLUSTER_COUNT_LAYER_ID = "store-locator-cluster-count";
export declare const POINT_LAYER_ID = "store-locator-points";
export declare const UNCLUSTERED_FILTER: FilterSpecification;
export declare const addClusterSource: <P extends StoreLocatorProperties>(map: MapLibreMap, collection: StoreLocatorFeatureCollection<P>, clusters: StoreLocatorClusterOptions) => void;
export declare const setClusterData: <P extends StoreLocatorProperties>(map: MapLibreMap, collection: StoreLocatorFeatureCollection<P>) => void;
