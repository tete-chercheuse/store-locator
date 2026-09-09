/**
 * Filtrage des features, indépendant du moteur de carte.
 * Aucun import de `maplibre-gl` : ce module est testable sans mock.
 */
import type {
  StoreLocatorFeatureCollection,
  StoreLocatorFilterValue,
  StoreLocatorFilters,
  StoreLocatorProperties,
} from '../types';

export const normalizeFilterValues = (value: StoreLocatorFilterValue | null | undefined): string[] => {
  return (Array.isArray(value) ? value : [value])
    .filter((item): item is string => item !== '' && item !== null && item !== undefined)
    .map((item) => `${item}`);
};

export const isEmptyFilterValue = (value: StoreLocatorFilterValue | null | undefined): boolean => {
  return !normalizeFilterValues(value).length;
};

export const matchesStoreProperty = (property: unknown, filter: StoreLocatorFilterValue): boolean => {
  if(property === null || property === undefined) {
    return false;
  }

  const values = normalizeFilterValues(filter);

  if(!values.length) {
    return true;
  }

  const properties = (Array.isArray(property) ? property : [property]).map((item) => `${item}`);

  return values.some((value) => properties.includes(value));
};

/**
 * Retourne une nouvelle `FeatureCollection` ne contenant que les features
 * satisfaisant tous les filtres. Les filtres vides sont ignorés.
 */
export const filterFeatures = <P extends StoreLocatorProperties>(
  collection: StoreLocatorFeatureCollection<P>,
  filters: StoreLocatorFilters | null,
): StoreLocatorFeatureCollection<P> => {
  if(!filters) {
    return { ...collection, features: [...collection.features] };
  }

  return {
    ...collection,
    features: collection.features.filter((feature) => {
      return Object.entries(filters).every(([filter, value]) => {
        if(isEmptyFilterValue(value)) {
          return true;
        }

        return matchesStoreProperty(feature.properties?.[filter], value);
      });
    }),
  };
};
