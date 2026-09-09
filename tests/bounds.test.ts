import { describe, expect, it } from 'vitest';
import { computeBounds } from '../src/map/bounds';
import type { StoreLocatorFeatureCollection } from '../src/types';

const collectionOf = (coordinates: Array<[number, number]>): StoreLocatorFeatureCollection => ({
  type: 'FeatureCollection',
  features: coordinates.map((coordinate, index) => ({
    type: 'Feature',
    id: index,
    geometry: { type: 'Point', coordinates: coordinate },
    properties: {},
  })),
});

describe('computeBounds', () => {
  it('returns null for an empty collection', () => {
    expect(computeBounds(collectionOf([]))).toBeNull();
  });

  it('returns a degenerate box for a single point', () => {
    expect(computeBounds(collectionOf([[2.35, 48.85]]))).toEqual([[2.35, 48.85], [2.35, 48.85]]);
  });

  it('returns south-west and north-east corners', () => {
    const bounds = computeBounds(collectionOf([
      [2.35, 48.85],
      [-0.12, 51.5],
      [13.4, 52.52],
    ]));

    expect(bounds).toEqual([[-0.12, 48.85], [13.4, 52.52]]);
  });

  it('handles negative coordinates on both axes', () => {
    const bounds = computeBounds(collectionOf([
      [-61.5336, 16.2411],
      [-61.4932, 16.2062],
    ]));

    expect(bounds).toEqual([[-61.5336, 16.2062], [-61.4932, 16.2411]]);
  });

  it('ignores features carrying non-finite coordinates', () => {
    const collection = collectionOf([[2.35, 48.85]]);

    collection.features.push({
      type: 'Feature',
      id: 1,
      geometry: { type: 'Point', coordinates: [Number.NaN, 10] },
      properties: {},
    });

    expect(computeBounds(collection)).toEqual([[2.35, 48.85], [2.35, 48.85]]);
  });
});
