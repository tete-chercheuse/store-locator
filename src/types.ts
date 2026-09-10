import type * as GeoJSON from 'geojson';
import type {
  ExpressionSpecification,
  MapOptions as MapLibreMapOptions,
  MarkerOptions,
  PaddingOptions,
  PopupOptions,
  StyleSpecification,
} from 'maplibre-gl';

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

/**
 * Bounds géographiques au format `[[ouest, sud], [est, nord]]`.
 * Compatible `LngLatBoundsLike` sans dépendre de la classe `LngLatBounds`,
 * ce qui garde `map/bounds.ts` testable sans mock.
 */
export type StoreLocatorBounds = [[number, number], [number, number]];

/**
 * Options d'icône, alignées sur `MarkerOptions` de MapLibre.
 * `url` et `size` sont des raccourcis : la librairie construit l'élément `<img>`.
 * `element` court-circuite tout et utilise le DOM fourni tel quel.
 *
 * Fournir au moins l'un des deux : un objet sans `url` ni `element` ne produit
 * aucune icône, et le marqueur retombe sur le pin par défaut de MapLibre. Les
 * deux champs restent facultatifs pour que les surcharges partielles par
 * fusion ou par spread demeurent naturelles.
 */
export interface StoreLocatorIconOptions {
  url?: string;
  size?: [number, number];
  element?: HTMLElement;
  anchor?: MarkerOptions['anchor'];
  offset?: MarkerOptions['offset'];
  className?: string;
  rotation?: number;
}

export type StoreLocatorIconValue =
  | string
  | HTMLElement
  | StoreLocatorIconOptions
  | null;

export type StoreLocatorIconFactory<P extends StoreLocatorProperties = StoreLocatorProperties> =
  | StoreLocatorIconValue
  | ((feature: StoreLocatorFeature<P>) => StoreLocatorIconValue | undefined);

export type StoreLocatorPopupContent = string | HTMLElement;

/**
 * Options de popup, alignées sur `PopupOptions` de MapLibre.
 * Attention : `maxWidth` est une chaîne CSS (`'280px'`), pas un nombre.
 */
export interface StoreLocatorPopupOptions extends PopupOptions {
  content?: StoreLocatorPopupContent | null;
}

export type StoreLocatorPopupValue =
  | StoreLocatorPopupContent
  | StoreLocatorPopupOptions
  | null;

export type StoreLocatorPopupFactory<P extends StoreLocatorProperties = StoreLocatorProperties> =
  | StoreLocatorPopupValue
  | ((feature: StoreLocatorFeature<P>) => StoreLocatorPopupValue | undefined);

/** Valeur littérale ou expression MapLibre pilotée par les données. */
export type StoreLocatorPaintValue<T> = T | ExpressionSpecification;

export interface StoreLocatorClusterOptions {
  enabled: boolean;
  /** `clusterRadius` en pixels. */
  radius: number;
  /** `clusterMaxZoom` : zoom au-delà duquel les points ne sont plus regroupés. */
  maxZoom: number;
  /** `clusterMinPoints` : nombre minimal de points pour former un cluster. */
  minPoints: number;
  color: StoreLocatorPaintValue<string>;
  size: StoreLocatorPaintValue<number>;
  strokeColor: StoreLocatorPaintValue<string>;
  strokeWidth: StoreLocatorPaintValue<number>;
  textColor: StoreLocatorPaintValue<string>;
  textSize: StoreLocatorPaintValue<number>;
  /** Police du compteur. Doit exister dans les glyphes du style chargé. */
  textFont: StoreLocatorPaintValue<string[]>;
}

export interface StoreLocatorMapOptions extends Omit<MapLibreMapOptions, 'container' | 'style'> {
  zoom: number;
  minZoom: number;
  maxZoom: number;
  /** ⚠️ Ordre MapLibre : `[longitude, latitude]`. */
  center: [number, number];
  cooperativeGestures: boolean;
}

export interface StoreLocatorFitBoundsOptions {
  /**
   * Marge appliquée au recentrage. Un nombre pour une marge uniforme, ou un
   * objet `{ top, bottom, left, right }` pour une marge asymétrique — utile
   * lorsqu'un panneau de filtres occupe un côté de la carte et masquerait
   * les pins ajustés sous lui.
   */
  padding: number | PaddingOptions;
  maxZoom?: number;
}

export interface StoreLocatorMarkerOptions<P extends StoreLocatorProperties = StoreLocatorProperties> {
  popup: StoreLocatorPopupFactory<P>;
  icon: StoreLocatorIconFactory<P>;
}

export interface StoreLocatorMapConfig<P extends StoreLocatorProperties = StoreLocatorProperties> {
  refreshRecenter: boolean;
  initialRecenter: boolean;
  /** Ajoute un `GeolocateControl`. */
  locate: boolean;
  /** Ajoute un `NavigationControl`. MapLibre n'ajoute aucun contrôle de zoom par défaut. */
  navigation: boolean;
  /**
   * Injecte la feuille de style de MapLibre, embarquée dans la librairie.
   * `false` rend la main à l'application, qui doit alors charger
   * `maplibre-gl/dist/maplibre-gl.css` elle-même.
   */
  injectCss: boolean;
  /** Nonce posé sur la balise `<style>` injectée, pour une CSP sans `'unsafe-inline'`. */
  cssNonce: string | null;
  /**
   * Fournit une image transparente pour toute icône réclamée par le style et
   * absente de son sprite, ce qui est le cas de plusieurs POI d'OpenFreeMap
   * Bright. `false` restitue les avertissements de MapLibre.
   *
   * Les identifiants concernés restent lisibles par `unresolvedImages`.
   */
  resolveMissingImages: boolean;
  style: string | StyleSpecification;
  options: StoreLocatorMapOptions;
  markers: StoreLocatorMarkerOptions<P>;
  clusters: StoreLocatorClusterOptions;
  fitBoundsOptions: StoreLocatorFitBoundsOptions;
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
  map?: Partial<Omit<StoreLocatorMapConfig<P>, 'options' | 'markers' | 'clusters' | 'fitBoundsOptions'>> & {
    options?: Partial<StoreLocatorMapOptions>;
    markers?: Partial<StoreLocatorMarkerOptions<P>>;
    clusters?: Partial<StoreLocatorClusterOptions>;
    fitBoundsOptions?: Partial<StoreLocatorFitBoundsOptions>;
  };
  selectors?: Partial<StoreLocatorSelectors>;
  elements?: Partial<StoreLocatorElements>;
}

export interface StoreLocatorResolvedOptions<P extends StoreLocatorProperties = StoreLocatorProperties> {
  /**
   * Reste nullable après résolution : `StoreLocatorOptions.stores` est requis
   * et non nullable, donc `null` ne peut provenir que d'un appelant qui
   * contourne le contrat typé — du JavaScript, des données faiblement typées,
   * un cast. Le constructeur lève alors une erreur explicite.
   */
  stores: StoreLocatorFeatureCollection<P> | null;
  map: StoreLocatorMapConfig<P>;
  selectors: StoreLocatorSelectors;
  elements: StoreLocatorElements;
}
