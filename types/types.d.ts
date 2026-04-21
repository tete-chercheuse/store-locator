import './leaflet-plugins';
import type * as GeoJSON from 'geojson';
import type * as L from 'leaflet';

export type StoreLocatorProperties = Record<string, unknown>;
export type StoreLocatorCoordinateValue = number | `${number}`;
export type StoreLocatorFilterValue = string | string[];
export type StoreLocatorFilters = Record<string, StoreLocatorFilterValue>;

export type StoreLocatorFeature<P extends StoreLocatorProperties = StoreLocatorProperties> = GeoJSON.Feature<GeoJSON.Point, P>;
export type StoreLocatorFeatureCollection<P extends StoreLocatorProperties = StoreLocatorProperties> = GeoJSON.FeatureCollection<GeoJSON.Point, P>;

export type StoreLocatorCoordinateStore<P extends StoreLocatorProperties = StoreLocatorProperties> =
  P & (
    | { lat: StoreLocatorCoordinateValue; lng: StoreLocatorCoordinateValue; }
    | { lat: StoreLocatorCoordinateValue; lon: StoreLocatorCoordinateValue; }
    | { lat: StoreLocatorCoordinateValue; longitude: StoreLocatorCoordinateValue; }
    | { latitude: StoreLocatorCoordinateValue; lng: StoreLocatorCoordinateValue; }
    | { latitude: StoreLocatorCoordinateValue; lon: StoreLocatorCoordinateValue; }
    | { latitude: StoreLocatorCoordinateValue; longitude: StoreLocatorCoordinateValue; }
  );

export type StoreLocatorStoresInput<P extends StoreLocatorProperties = StoreLocatorProperties> =
  | StoreLocatorFeatureCollection<P>
  | StoreLocatorFeature<P>[]
  | StoreLocatorCoordinateStore<P>[];

export type StoreLocatorPopupFactory<P extends StoreLocatorProperties = StoreLocatorProperties> =
  | StoreLocatorPopupValue
  | ((feature: StoreLocatorFeature<P>) => StoreLocatorPopupValue | undefined);

export type StoreLocatorPopupContent = string | HTMLElement;

export type StoreLocatorPopupOptions = L.PopupOptions & {
  content?: StoreLocatorPopupContent | null;
};

export type StoreLocatorPopupValue =
  | StoreLocatorPopupContent
  | StoreLocatorPopupOptions
  | L.Popup
  | null;

export type StoreLocatorIconOptions = L.IconOptions;

export type StoreLocatorIconValue =
  | string
  | StoreLocatorIconOptions
  | L.Icon
  | L.DivIcon
  | null;

export type StoreLocatorIconFactory<P extends StoreLocatorProperties = StoreLocatorProperties> =
  | StoreLocatorIconValue
  | ((feature: StoreLocatorFeature<P>) => StoreLocatorIconValue | undefined);

export interface StoreLocatorMapOptions extends L.MapOptions {
  zoom: number;
  maxZoom: number;
  minZoom: number;
  center: L.LatLngExpression;
  gestureHandling?: boolean;
}

export interface StoreLocatorTilesOptions {
  url: string;
  options: L.TileLayerOptions;
}

export interface StoreLocatorMarkerOptions<P extends StoreLocatorProperties = StoreLocatorProperties> {
  popup: StoreLocatorPopupFactory<P>;
  icon: StoreLocatorIconFactory<P>;
  clustersOptions: L.MarkerClusterGroupOptions;
}

export interface StoreLocatorMapConfig<P extends StoreLocatorProperties = StoreLocatorProperties> {
  refreshRecenter: boolean;
  initialRecenter: boolean;
  locate: boolean;
  options: StoreLocatorMapOptions;
  tiles: StoreLocatorTilesOptions;
  markers: StoreLocatorMarkerOptions<P>;
}

export interface StoreLocatorSelectors {
  wrapper: string;
  map: string;
  filters: string;
}

export interface StoreLocatorElements {
  wrapper: HTMLElement | null;
  map: HTMLElement | null;
  filters: HTMLFormElement | null;
}

export interface StoreLocatorOptions<P extends StoreLocatorProperties = StoreLocatorProperties> {
  stores: StoreLocatorStoresInput<P>;
  map?: Partial<Omit<StoreLocatorMapConfig<P>, 'tiles' | 'markers'>> & {
    tiles?: Partial<StoreLocatorTilesOptions>;
    markers?: Partial<StoreLocatorMarkerOptions<P>>;
  };
  selectors?: Partial<StoreLocatorSelectors>;
  elements?: Partial<StoreLocatorElements>;
}

export interface StoreLocatorResolvedOptions<P extends StoreLocatorProperties = StoreLocatorProperties> {
  stores: StoreLocatorFeatureCollection<P> | null;
  map: StoreLocatorMapConfig<P>;
  selectors: StoreLocatorSelectors;
  elements: StoreLocatorElements;
}
