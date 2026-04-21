import L from 'leaflet';
import 'leaflet-gesture-handling';
import 'leaflet.markercluster';
import 'leaflet.locatecontrol';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import type { StoreLocatorFilters, StoreLocatorOptions, StoreLocatorProperties, StoreLocatorResolvedOptions, StoreLocatorStoresInput } from './types';
/**
 * Store Locator
 * @module StoreLocator
 */
export default class StoreLocator<P extends StoreLocatorProperties = StoreLocatorProperties> {
    options: StoreLocatorResolvedOptions<P>;
    map: L.Map | null;
    clusters: L.FeatureGroup<L.Layer> | null;
    filters: HTMLFormElement | null;
    private filterFields;
    private filterChangeHandler;
    private resizeObserver;
    /**
     * Instantiate StoreLocator
     * @param options Store locator options
     */
    constructor(options: StoreLocatorOptions<P>);
    setStores(stores: StoreLocatorStoresInput<P>, filters?: StoreLocatorFilters | null, recenter?: boolean, maxZoom?: number | null): void;
    setFilters(filters?: string | HTMLFormElement | null, wrapper?: string | HTMLElement | null): void;
    refreshClusters(filters?: StoreLocatorFilters | null, recenter?: boolean, maxZoom?: number | null): void;
    invalidateSize(options?: Parameters<L.Map['invalidateSize']>[0]): void;
    destroy(): void;
    private createOptions;
    private initMap;
    private resolveMapElement;
    private resolveWrapperElement;
    private resolvePopup;
    private resolveIcon;
    private detachFilters;
}
export type { StoreLocatorCoordinateStore, StoreLocatorCoordinateValue, StoreLocatorElements, StoreLocatorFeature, StoreLocatorFeatureCollection, StoreLocatorFilterValue, StoreLocatorFilters, StoreLocatorIconFactory, StoreLocatorMapConfig, StoreLocatorMarkerOptions, StoreLocatorOptions, StoreLocatorPopupFactory, StoreLocatorProperties, StoreLocatorResolvedOptions, StoreLocatorSelectors, StoreLocatorStoresInput, StoreLocatorTilesOptions, } from './types';
