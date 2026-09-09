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
          id: 0,
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

  it('assigns sequential numeric ids across the whole collection', () => {
    const stores = normalizeStores([
      { name: 'A', lat: 1, lng: 1 },
      { name: 'B', lat: 2, lng: 2 },
      { name: 'C', lat: 3, lng: 3 },
    ]);

    expect(stores?.features.map((feature) => feature.id)).toEqual([0, 1, 2]);
  });

  it('overwrites a caller-provided root id, even a numeric one', () => {
    const stores = normalizeStores([
      {
        type: 'Feature',
        id: 999,
        geometry: { type: 'Point', coordinates: [-61.52, 16.22] },
        properties: { id: 'store-2' },
      },
    ]);

    expect(stores?.features[0].id).toBe(0);
    expect(stores?.features[0].properties?.id).toBe('store-2');
  });

  it('assigns ids to an incoming FeatureCollection too', () => {
    const stores = normalizeStores({
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [1, 1] },
          properties: { name: 'A' },
        },
        {
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [2, 2] },
          properties: { name: 'B' },
        },
      ],
    });

    expect(stores?.features.map((feature) => feature.id)).toEqual([0, 1]);
  });

  it('normalizes a null properties bag to an empty object', () => {
    // `"properties": null` est du GeoJSON conforme à la norme, mais
    // StoreLocatorFeature<P> promet aux factories icon/popup que
    // `feature.properties` est toujours lisible. On normalise plutôt que de
    // rejeter : refuser casserait des données utilisateur valides.
    const stores = normalizeStores([
      {
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [1, 1] },
        properties: null,
      } as never,
    ]);

    expect(stores?.features[0].properties).toEqual({});
  });

  it('does not mutate the input collection', () => {
    const input = {
      type: 'FeatureCollection' as const,
      features: [
        {
          type: 'Feature' as const,
          geometry: { type: 'Point' as const, coordinates: [1, 1] },
          properties: { name: 'A' },
        },
      ],
    };

    normalizeStores(input);

    expect(input.features[0]).not.toHaveProperty('id');
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
