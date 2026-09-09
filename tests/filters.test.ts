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
  it('returns every feature when no filter is given', () => {
    expect(filterFeatures(collection, null).features).toHaveLength(3);
  });

  it('returns every feature when the filter value is empty', () => {
    expect(filterFeatures(collection, { category: '' }).features).toHaveLength(3);
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
    const result = filterFeatures(collection, { city: ['Paris', 'Lyon'] });

    expect(result.features).toHaveLength(3);
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
