import { describe, expect, it } from 'vitest';
import { MarkerSync } from '../src/map/marker-sync';
import { Map as MockMap, mapLibreMockState } from './mocks/maplibre-gl';
import { SOURCE_ID } from '../src/map/cluster-source';
import type { StoreLocatorFeatureCollection } from '../src/types';

const collectionOf = (
  stores: Array<{ id: number; name: string; coordinates: [number, number]; }>,
): StoreLocatorFeatureCollection => ({
  type:     'FeatureCollection',
  features: stores.map((store) => ({
    type:       'Feature',
    id:         store.id,
    geometry:   { type: 'Point', coordinates: store.coordinates },
    properties: { name: store.name },
  })),
});

/** Simule les features que MapLibre renverrait pour les tuiles chargées. */
const renderIds = (ids: number[]): void => {
  mapLibreMockState.sourceFeatures.length = 0;
  mapLibreMockState.sourceFeatures.push(...ids.map((id) => ({ id })));
};

const createSync = (): {
  sync: MarkerSync;
  map: InstanceType<typeof MockMap>;
  clicks: () => number;
} => {
  const map = new MockMap({ container: document.createElement('div') });

  map.addSource(SOURCE_ID, { data: {} });

  let clicked = 0;

  const sync = new MarkerSync({
    map:           map as never,
    resolveIcon:   () => null,
    resolvePopup:  (feature) => `<b>${feature.properties.name as string}</b>`,
    onMarkerClick: () => { clicked += 1; },
  });

  return { sync, map, clicks: () => clicked };
};

const liveMarkers = () => mapLibreMockState.markers.filter((marker) => marker.added);

describe('MarkerSync', () => {
  it('creates one marker per unclustered feature', () => {
    const { sync } = createSync();

    sync.setFeatures(collectionOf([
      { id: 0, name: 'Cafe', coordinates: [1, 2] },
      { id: 1, name: 'Bakery', coordinates: [3, 4] },
    ]));

    renderIds([0, 1]);
    sync.sync();

    expect(liveMarkers()).toHaveLength(2);
    expect(liveMarkers()[0].lngLat).toEqual([1, 2]);
  });

  it('deduplicates a feature returned from several tiles', () => {
    const { sync } = createSync();

    sync.setFeatures(collectionOf([{ id: 0, name: 'Cafe', coordinates: [1, 2] }]));

    renderIds([0, 0, 0]);
    sync.sync();

    expect(liveMarkers()).toHaveLength(1);
  });

  it('reuses existing markers instead of rebuilding them on every sync', () => {
    // Si `visible.add(id)` passait après le court-circuit `markers.has(id)`,
    // chaque marqueur existant serait moissonné puis reconstruit à chaque
    // synchronisation — un cycle complet de destruction sur chaque événement.
    const { sync } = createSync();

    sync.setFeatures(collectionOf([{ id: 0, name: 'Cafe', coordinates: [1, 2] }]));
    renderIds([0]);

    sync.sync();
    sync.sync();
    sync.sync();

    expect(mapLibreMockState.markers).toHaveLength(1);
    expect(liveMarkers()).toHaveLength(1);
  });

  it('removes a marker whose feature left the loaded tiles', () => {
    const { sync } = createSync();

    sync.setFeatures(collectionOf([
      { id: 0, name: 'Cafe', coordinates: [1, 2] },
      { id: 1, name: 'Bakery', coordinates: [3, 4] },
    ]));

    renderIds([0, 1]);
    sync.sync();

    renderIds([0]);
    sync.sync();

    expect(liveMarkers()).toHaveLength(1);
    expect(liveMarkers()[0].lngLat).toEqual([1, 2]);
  });

  it('rebuilds a marker when a reused id now denotes a different store', () => {
    // Régression. Les `id` sont positionnels : `setStores` réattribue `0..n-1`,
    // donc un `id` peut survivre en désignant un autre magasin. Élaguer sur la
    // seule absence de clé laissait le marqueur de l'ancienne feature en place,
    // avec ses anciennes coordonnées et son ancienne popup, et `sync()` ne le
    // réparait jamais puisqu'il court-circuite sur `markers.has(id)`.
    const { sync } = createSync();

    renderIds([0]);

    sync.setFeatures(collectionOf([{ id: 0, name: 'Cafe', coordinates: [1, 2] }]));
    sync.sync();

    sync.setFeatures(collectionOf([{ id: 0, name: 'Wineshop', coordinates: [9, 9] }]));
    sync.sync();

    expect(liveMarkers()).toHaveLength(1);
    expect(liveMarkers()[0].lngLat).toEqual([9, 9]);
    expect(mapLibreMockState.popups.at(-1)?.html).toBe('<b>Wineshop</b>');
  });

  it('keeps markers untouched when filtering preserves feature identity', () => {
    // `filterFeatures` conserve les objets d'origine, donc un filtrage ne doit
    // provoquer aucune reconstruction — c'est le pendant du test précédent.
    const { sync } = createSync();
    const collection = collectionOf([
      { id: 0, name: 'Cafe', coordinates: [1, 2] },
      { id: 1, name: 'Bakery', coordinates: [3, 4] },
    ]);

    renderIds([0, 1]);
    sync.setFeatures(collection);
    sync.sync();

    sync.setFeatures({ ...collection, features: [collection.features[0]] });
    renderIds([0]);
    sync.sync();

    expect(mapLibreMockState.markers).toHaveLength(2);
    expect(liveMarkers()).toHaveLength(1);
  });

  it('does nothing when the source is absent or its tiles are not loaded', () => {
    const map = new MockMap({ container: document.createElement('div') });
    const sync = new MarkerSync({
      map:           map as never,
      resolveIcon:   () => null,
      resolvePopup:  () => null,
      onMarkerClick: () => undefined,
    });

    sync.setFeatures(collectionOf([{ id: 0, name: 'Cafe', coordinates: [1, 2] }]));
    renderIds([0]);

    // Aucune source déclarée : `querySourceFeatures` ne doit jamais être appelé.
    sync.sync();

    expect(map.querySourceFeatures).not.toHaveBeenCalled();
    expect(mapLibreMockState.markers).toHaveLength(0);
  });

  it('detaches its map listeners and its marker listeners on destroy', () => {
    const { sync, map, clicks } = createSync();

    sync.start();
    sync.setFeatures(collectionOf([{ id: 0, name: 'Cafe', coordinates: [1, 2] }]));
    renderIds([0]);
    sync.sync();

    const element = liveMarkers()[0].element;

    element.dispatchEvent(new Event('click'));
    expect(clicks()).toBe(1);

    sync.destroy();

    expect(Object.values(map.handlers).every((handlers) => handlers.length === 0)).toBe(true);
    expect(liveMarkers()).toHaveLength(0);

    // `Marker.remove()` ne détache que ses propres écouteurs. L'élément peut
    // être fourni et réutilisé par l'appelant, donc le nôtre doit partir aussi.
    element.dispatchEvent(new Event('click'));
    expect(clicks()).toBe(1);
  });

  it('does not listen to move, which MapLibre already handles for marker positions', () => {
    // `Marker` lie son propre `_update` sur `move`. Y brancher `sync()` en plus
    // coûterait un balayage complet des tuiles à chaque frame de déplacement,
    // sans rien apporter. La décision est épinglée ici parce qu'elle ne se voit
    // pas dans le comportement — seulement dans le coût.
    const { sync, map } = createSync();

    sync.start();

    expect(Object.keys(map.handlers).sort()).toEqual(['idle', 'moveend', 'sourcedata']);
  });

  it('is idempotent on repeated destroy', () => {
    const { sync } = createSync();

    sync.start();
    sync.destroy();

    expect(() => sync.destroy()).not.toThrow();
  });
});
