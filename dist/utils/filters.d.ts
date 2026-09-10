/**
 * Filtrage des features, indépendant du moteur de carte.
 * Aucun import de `maplibre-gl` : ce module est testable sans mock.
 */
import type { StoreLocatorFeatureCollection, StoreLocatorFilterValue, StoreLocatorFilters, StoreLocatorProperties } from '../types';
export declare const normalizeFilterValues: (value: StoreLocatorFilterValue | null | undefined) => string[];
export declare const isEmptyFilterValue: (value: StoreLocatorFilterValue | null | undefined) => boolean;
export declare const matchesStoreProperty: (property: unknown, filter: StoreLocatorFilterValue) => boolean;
/**
 * Retourne une nouvelle `FeatureCollection` ne contenant que les features
 * satisfaisant tous les filtres. Les filtres vides sont ignorés.
 */
export declare const filterFeatures: <P extends StoreLocatorProperties>(collection: StoreLocatorFeatureCollection<P>, filters: StoreLocatorFilters | null) => StoreLocatorFeatureCollection<P>;
