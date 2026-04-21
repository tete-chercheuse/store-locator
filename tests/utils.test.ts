import { describe, expect, it } from 'vitest';
import { formValues, normalizeStores } from '../src/utils/utils';

describe('normalizeStores', () => {
  it('converts plain coordinate stores to a GeoJSON FeatureCollection', () => {
    const stores = normalizeStores([
      {
        id: 'store-1',
        name: 'Cafe',
        lat: '16.2411',
        lng: -61.5336,
      },
    ]);

    expect(stores).toEqual({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Point',
            coordinates: [-61.5336, 16.2411],
          },
          properties: {
            id: 'store-1',
            name: 'Cafe',
            lat: '16.2411',
            lng: -61.5336,
          },
        },
      ],
    });
  });

  it('keeps GeoJSON feature arrays as a FeatureCollection', () => {
    const stores = normalizeStores([
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [-61.52, 16.22],
        },
        properties: {
          id: 'store-2',
        },
      },
    ]);

    expect(stores?.type).toBe('FeatureCollection');
    expect(stores?.features).toHaveLength(1);
    expect(stores?.features[0].properties?.id).toBe('store-2');
  });

  it('throws when coordinates are missing', () => {
    expect(() => normalizeStores([{ id: 'broken-store' } as never])).toThrow('[store-locator] - Invalid store coordinates');
  });
});

describe('formValues', () => {
  it('aggregates repeated form keys into arrays', () => {
    document.body.innerHTML = `
      <form>
        <input checked name="category" type="checkbox" value="Coffee" />
        <input checked name="category" type="checkbox" value="Bakery" />
        <input name="city" type="radio" value="Pointe-a-Pitre" checked />
      </form>
    `;

    const form = document.querySelector('form');

    expect(form).not.toBeNull();
    expect(formValues(form as HTMLFormElement)).toEqual({
      category: ['Coffee', 'Bakery'],
      city: 'Pointe-a-Pitre',
    });
  });
});
