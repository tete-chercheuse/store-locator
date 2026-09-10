import { describe, expect, it } from 'vitest';
import StoreLocator from '../src/store-locator';
import { mapLibreMockState } from './mocks/maplibre-gl';
import { CLUSTER_COUNT_LAYER_ID, CLUSTER_LAYER_ID, POINT_LAYER_ID, SOURCE_ID } from '../src/map/cluster-source';

const twoStores = [
  { id: 'store-1', name: 'Cafe', category: 'Coffee', lat: 16.2411, lng: -61.5336 },
  { id: 'store-2', name: 'Bakery', category: 'Bakery', lat: 16.2062, lng: -61.4932 },
];

const mountMapElement = (): HTMLElement => {
  const element = document.createElement('div');

  document.body.appendChild(element);

  return element;
};

/** Simule les features que MapLibre renverrait pour les tuiles chargées. */
const renderSourceFeatures = (ids: number[]): void => {
  mapLibreMockState.sourceFeatures.length = 0;
  mapLibreMockState.sourceFeatures.push(...ids.map((id) => ({ id })));
};

describe('StoreLocator', () => {
  it('creates the map, the clustered source and its three layers', async () => {
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
    });

    await locator.whenReady();

    const map = mapLibreMockState.maps[0];

    expect(mapLibreMockState.maps).toHaveLength(1);
    expect(map.sources.get(SOURCE_ID)?.options).toMatchObject({
      cluster: true,
      clusterRadius: 50,
      clusterMaxZoom: 11,
      clusterMinPoints: 2,
    });
    expect(map.layers.map((layer) => layer.id)).toEqual([
      POINT_LAYER_ID,
      CLUSTER_LAYER_ID,
      CLUSTER_COUNT_LAYER_ID,
    ]);

    locator.destroy();
  });

  it('adds a navigation control by default and no geolocate control', async () => {
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
    });

    await locator.whenReady();

    expect(mapLibreMockState.navigationControls).toHaveLength(1);
    expect(mapLibreMockState.geolocateControls).toHaveLength(0);

    locator.destroy();
  });

  it('adds a geolocate control when locate is enabled', async () => {
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
      map: { locate: true },
    });

    await locator.whenReady();

    expect(mapLibreMockState.geolocateControls).toHaveLength(1);

    locator.destroy();
  });

  it('passes the embedded style object and the default center to the map', async () => {
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
    });

    await locator.whenReady();

    const options = mapLibreMockState.maps[0].options;

    expect(options).toMatchObject({ center: [0, 0], cooperativeGestures: true });

    // Le style par défaut est un objet embarqué, plus une URL : ce qui est
    // transmis à MapLibre doit être la spécification elle-même.
    expect((options.style as { version: number; }).version).toBe(8);

    locator.destroy();
  });

  it('forwards a caller-supplied center to MapLibre without reordering it', async () => {
    // Le défaut [0, 0] est symétrique et ne prouve donc rien sur l'ordre des
    // coordonnées, qui est LE piège de cette migration : Leaflet attendait
    // [lat, lng], MapLibre attend [lng, lat]. Ce test épingle le contrat de
    // passe-plat avec une valeur asymétrique — Paris.
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
      map: { options: { center: [2.3522, 48.8566] } },
    });

    await locator.whenReady();

    expect(mapLibreMockState.maps[0].options.center).toEqual([2.3522, 48.8566]);

    locator.destroy();
  });

  it('fits the map to the store bounds on the initial render', async () => {
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
    });

    await locator.whenReady();

    expect(mapLibreMockState.maps[0].fitBounds).toHaveBeenCalledWith(
      [[-61.5336, 16.2062], [-61.4932, 16.2411]],
      { padding: 48, maxZoom: 16 },
    );

    locator.destroy();
  });

  it('creates one marker per unclustered feature returned by the source', async () => {
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
      map: {
        markers: {
          icon: (feature) => ({ url: `/${feature.properties.id as string}.svg`, size: [40, 44], anchor: 'bottom' }),
          popup: (feature) => `<b>${feature.properties.name as string}</b>`,
        },
      },
    });

    await locator.whenReady();

    renderSourceFeatures([0, 1]);
    mapLibreMockState.maps[0].trigger('moveend');

    expect(mapLibreMockState.markers).toHaveLength(2);
    expect(mapLibreMockState.markers[0].lngLat).toEqual([-61.5336, 16.2411]);
    expect(mapLibreMockState.markers[0].options).toMatchObject({ anchor: 'bottom' });
    expect(mapLibreMockState.popups[0].setHTML).toHaveBeenCalledWith('<b>Cafe</b>');

    locator.destroy();
  });

  it('deduplicates features returned from several tiles', async () => {
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
    });

    await locator.whenReady();

    renderSourceFeatures([0, 0, 1, 1]);
    mapLibreMockState.maps[0].trigger('moveend');

    expect(mapLibreMockState.markers).toHaveLength(2);

    locator.destroy();
  });

  it('removes markers whose feature left the loaded tiles', async () => {
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
    });

    await locator.whenReady();

    renderSourceFeatures([0, 1]);
    mapLibreMockState.maps[0].trigger('moveend');

    renderSourceFeatures([0]);
    mapLibreMockState.maps[0].trigger('moveend');

    expect(mapLibreMockState.markers.filter((marker) => marker.added)).toHaveLength(1);

    locator.destroy();
  });

  it('centers the map when a marker is clicked', async () => {
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
    });

    await locator.whenReady();

    renderSourceFeatures([0]);
    mapLibreMockState.maps[0].trigger('moveend');

    mapLibreMockState.markers[0].element.dispatchEvent(new Event('click'));

    expect(mapLibreMockState.maps[0].easeTo).toHaveBeenCalledWith({ center: [-61.5336, 16.2411] });

    locator.destroy();
  });

  it('refreshes the source data from form filters', async () => {
    document.body.innerHTML = `
      <div class="store-locator">
        <form class="store-locator-filters">
          <label><input checked name="category" type="radio" value="" />Toutes</label>
          <label><input name="category" type="radio" value="Coffee" />Coffee</label>
        </form>
      </div>
    `;

    const mapElement = document.createElement('div');

    document.body.querySelector('.store-locator')?.appendChild(mapElement);

    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mapElement },
    });

    await locator.whenReady();

    const source = mapLibreMockState.maps[0].sources.get(SOURCE_ID);

    expect((source?.data as { features: unknown[]; }).features).toHaveLength(2);

    const coffeeInput = document.querySelector<HTMLInputElement>('input[value="Coffee"]');

    if(!coffeeInput) {
      throw new Error('Coffee input not found');
    }

    coffeeInput.checked = true;
    coffeeInput.dispatchEvent(new Event('change', { bubbles: true }));

    expect(source?.setData).toHaveBeenCalledTimes(1);
    expect((source?.data as { features: Array<{ properties: { category: string; }; }>; }).features).toHaveLength(1);
    expect((source?.data as { features: Array<{ properties: { category: string; }; }>; }).features[0].properties.category).toBe('Coffee');

    locator.destroy();
  });

  it('keeps the initial recenter intent when a filter form is attached before load', async () => {
    document.body.innerHTML = `
      <div class="store-locator">
        <form class="store-locator-filters">
          <label><input checked name="category" type="radio" value="" />Toutes</label>
        </form>
      </div>
    `;

    const mapElement = document.createElement('div');

    document.body.querySelector('.store-locator')?.appendChild(mapElement);

    // setFilters() déclenche un refresh avec recenter=false avant le chargement
    // du style. Il ne doit pas annuler le recentrage initial.
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mapElement },
    });

    await locator.whenReady();

    expect(mapLibreMockState.maps[0].fitBounds).toHaveBeenCalledTimes(1);

    locator.destroy();
  });

  it('does not let a later setStores discard filters queued before load', async () => {
    // Les intentions en attente sont fusionnées, mais `filters` était écrasé.
    // Or `setStores` passe `null` par défaut, sans rien savoir des filtres :
    // l'ordre des appels décidait donc silencieusement du résultat. Ici le
    // filtre est posé d'abord, puis un `setStores` arrive avant le `load`.
    mapLibreMockState.autoLoad = false;

    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
    });

    locator.refresh({ category: 'Coffee' });
    locator.setStores(twoStores);

    mapLibreMockState.maps[0].trigger('load');
    await locator.whenReady();

    const source = mapLibreMockState.maps[0].sources.get(SOURCE_ID);
    const features = (source?.data as { features: Array<{ properties: { category: string; }; }>; }).features;

    expect(features).toHaveLength(1);
    expect(features[0].properties.category).toBe('Coffee');

    locator.destroy();
  });

  it('queues a refresh issued before the style has loaded', async () => {
    mapLibreMockState.autoLoad = false;

    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
    });

    locator.setStores([{ id: 'store-3', name: 'Wineshop', lat: 1, lng: 1 }]);

    expect(mapLibreMockState.maps[0].sources.size).toBe(0);

    mapLibreMockState.maps[0].trigger('load');
    await locator.whenReady();

    const source = mapLibreMockState.maps[0].sources.get(SOURCE_ID);

    expect((source?.data as { features: unknown[]; }).features).toHaveLength(1);

    locator.destroy();
  });

  it('throws when the container already carries a live map', async () => {
    const mapElement = mountMapElement();

    const first = new StoreLocator({ stores: twoStores, elements: { map: mapElement } });

    await first.whenReady();

    expect(() => new StoreLocator({ stores: twoStores, elements: { map: mapElement } }))
      .toThrow('[store-locator] - Map container is already initialized.');

    first.destroy();

    expect(() => new StoreLocator({ stores: twoStores, elements: { map: mapElement } })).not.toThrow();
  });

  it('tears the map down on destroy', async () => {
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
    });

    await locator.whenReady();

    renderSourceFeatures([0, 1]);
    mapLibreMockState.maps[0].trigger('moveend');

    const map = mapLibreMockState.maps[0];

    locator.destroy();

    expect(map.remove).toHaveBeenCalledTimes(1);
    expect(mapLibreMockState.markers.every((marker) => marker.removed)).toBe(true);
    expect(locator.map).toBeNull();
    expect(locator.filters).toBeNull();
  });

  it('forwards resize to the map', async () => {
    const locator = new StoreLocator({
      stores: twoStores,
      elements: { map: mountMapElement() },
    });

    await locator.whenReady();
    locator.resize();

    expect(mapLibreMockState.maps[0].resize).toHaveBeenCalledTimes(1);

    locator.destroy();
  });

  it('throws when no stores are provided', () => {
    expect(() => new StoreLocator({ stores: null as never, elements: { map: mountMapElement() } }))
      .toThrow('[store-locator] - No stores available');
  });
});
