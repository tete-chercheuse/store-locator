import type * as L from 'leaflet';
import type {
  StoreLocatorFilters,
  StoreLocatorOptions,
  StoreLocatorProperties,
  StoreLocatorResolvedOptions,
  StoreLocatorStoresInput,
} from './types';

export default class StoreLocator<P extends StoreLocatorProperties = StoreLocatorProperties> {
  options: StoreLocatorResolvedOptions<P>;
  map: L.Map | null;
  clusters: L.FeatureGroup<L.Layer> | null;
  filters: HTMLFormElement | null;

  constructor(options: StoreLocatorOptions<P>);

  setStores(
    stores: StoreLocatorStoresInput<P>,
    filters?: StoreLocatorFilters | null,
    recenter?: boolean,
    maxZoom?: number | null
  ): void;

  setFilters(filters?: string | HTMLFormElement | null, wrapper?: string | HTMLElement | null): void;
  refreshClusters(filters?: StoreLocatorFilters | null, recenter?: boolean, maxZoom?: number | null): void;
  invalidateSize(options?: Parameters<L.Map['invalidateSize']>[0]): void;
  destroy(): void;
}

export type {
  StoreLocatorCoordinateStore,
  StoreLocatorCoordinateValue,
  StoreLocatorElements,
  StoreLocatorFeature,
  StoreLocatorFeatureCollection,
  StoreLocatorFilterValue,
  StoreLocatorFilters,
  StoreLocatorIconFactory,
  StoreLocatorIconOptions,
  StoreLocatorIconValue,
  StoreLocatorMapConfig,
  StoreLocatorMapOptions,
  StoreLocatorMarkerOptions,
  StoreLocatorOptions,
  StoreLocatorPopupFactory,
  StoreLocatorPopupContent,
  StoreLocatorPopupOptions,
  StoreLocatorPopupValue,
  StoreLocatorProperties,
  StoreLocatorResolvedOptions,
  StoreLocatorSelectors,
  StoreLocatorStoresInput,
  StoreLocatorTilesOptions,
} from './types';
