import { describe, expect, it } from 'vitest';
import { filterFeatures, isEmptyFilterValue, matchesStoreProperty, normalizeFilterValues } from '../src/utils/filters';
import type { StoreLocatorFeatureCollection } from '../src/types';

const collection: StoreLocatorFeatureCollection = {
  type: 'FeatureCollection',
  features: [
    { type: 'Feature', id: 0, geometry: { type: 'Point', coordinates: [1, 1] }, properties: { category: 'Coffee', city: 'Paris' } },
    { type: 'Feature', id: 1, geometry: { type: 'Point', coordinates: [2, 2] }, properties: { category: 'Bakery', city: 'Paris' } },
    { type: 'Feature', id: 2, geometry: { type: 'Point', coordinates: [3, 3] }, properties: { category: ['Coffee', 'Bakery'], city: 'Lyon' } },
  ],
};

describe('normalizeFilterValues', () => {
  it('wraps a single value into an array', () => {
    expect(normalizeFilterValues('Coffee')).toEqual(['Coffee']);
  });

  it('drops empty, null and undefined entries', () => {
    expect(normalizeFilterValues(['Coffee', '', null as never, undefined as never])).toEqual(['Coffee']);
  });

  it('returns an empty array for a nullish value', () => {
    expect(normalizeFilterValues(null)).toEqual([]);
  });
});

describe('isEmptyFilterValue', () => {
  it('treats the empty string as empty', () => {
    expect(isEmptyFilterValue('')).toBe(true);
  });

  it('treats a populated value as non-empty', () => {
    expect(isEmptyFilterValue('Coffee')).toBe(false);
  });
});

describe('matchesStoreProperty', () => {
  it('matches a scalar property against a scalar filter', () => {
    expect(matchesStoreProperty('Coffee', 'Coffee')).toBe(true);
    expect(matchesStoreProperty('Bakery', 'Coffee')).toBe(false);
  });

  it('matches an array property against any filter value', () => {
    expect(matchesStoreProperty(['Coffee', 'Bakery'], 'Bakery')).toBe(true);
  });

  it('compares by string coercion', () => {
    expect(matchesStoreProperty(42, '42')).toBe(true);
  });

  it('rejects a nullish property', () => {
    expect(matchesStoreProperty(null, 'Coffee')).toBe(false);
    expect(matchesStoreProperty(undefined, 'Coffee')).toBe(false);
  });
});

describe('filterFeatures', () => {
  it('returns a fresh collection holding every feature when no filter is given', () => {
    const result = filterFeatures(collection, null);

    // Le résultat part directement dans `setData` de MapLibre : rendre la
    // collection d'origine réutiliserait une référence que l'appelant possède.
    expect(result).not.toBe(collection);
    expect(result.features).not.toBe(collection.features);
    expect(result.features).toHaveLength(3);
  });

  it('returns every feature when the filter value is empty', () => {
    expect(filterFeatures(collection, { category: '' }).features).toHaveLength(3);
    expect(filterFeatures(collection, { category: [] }).features).toHaveLength(3);
  });

  it('tolerates a feature whose properties bag is null', () => {
    // `"properties": null` est du GeoJSON conforme. `normalizeStores` le
    // normalise en amont, mais `filterFeatures` est exporté et peut recevoir
    // une collection non normalisée.
    const withoutProperties: StoreLocatorFeatureCollection = {
      type: 'FeatureCollection',
      features: [
        { type: 'Feature', id: 0, geometry: { type: 'Point', coordinates: [1, 1] }, properties: null as never },
      ],
    };

    expect(filterFeatures(withoutProperties, { category: 'Coffee' }).features).toHaveLength(0);
    expect(filterFeatures(withoutProperties, null).features).toHaveLength(1);
  });

  it('keeps only the features matching a single filter', () => {
    const result = filterFeatures(collection, { category: 'Coffee' });

    expect(result.features.map((feature) => feature.id)).toEqual([0, 2]);
  });

  it('combines several filters with a logical AND', () => {
    const result = filterFeatures(collection, { category: 'Coffee', city: 'Lyon' });

    expect(result.features.map((feature) => feature.id)).toEqual([2]);
  });

  it('accepts an array filter as a logical OR', () => {
    // La première valeur ne correspond à rien, et l'ensemble ne couvre pas
    // toutes les features : le test distingue donc un OU fonctionnel d'un
    // filtre ignoré comme d'une lecture de la seule première valeur.
    expect(filterFeatures(collection, { city: ['Berlin', 'Lyon'] }).features.map((feature) => feature.id))
      .toEqual([2]);

    expect(filterFeatures(collection, { city: ['Paris', 'Berlin'] }).features.map((feature) => feature.id))
      .toEqual([0, 1]);
  });

  it('returns an empty collection when nothing matches', () => {
    const result = filterFeatures(collection, { category: 'Wineshop' });

    expect(result).toEqual({ type: 'FeatureCollection', features: [] });
  });

  it('does not mutate the source collection', () => {
    filterFeatures(collection, { category: 'Coffee' });

    expect(collection.features).toHaveLength(3);
  });
});
