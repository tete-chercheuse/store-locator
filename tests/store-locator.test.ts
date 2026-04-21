import { describe, expect, it } from 'vitest';
import L from 'leaflet';
import StoreLocator from '../src/store-locator';
import { leafletMockState } from './mocks/leaflet';

describe('StoreLocator', () => {
  it('initializes the map and creates clustered GeoJSON markers', () => {
    const mapElement = document.createElement('div');
    document.body.appendChild(mapElement);

    const locator = new StoreLocator({
      stores: [
        { id: 'store-1', name: 'Cafe', lat: 16.2411, lng: -61.5336 },
        { id: 'store-2', name: 'Bakery', lat: 16.2062, lng: -61.4932 },
      ],
      elements: {
        map: mapElement,
      },
      map: {
        markers: {
          popup: (feature) => L.popup().setContent(feature.properties.name as string),
          icon: () => L.icon({ iconUrl: '/pin.svg' }),
        },
      },
    });

    expect(leafletMockState.maps).toHaveLength(1);
    expect(leafletMockState.clusters).toHaveLength(1);
    expect(leafletMockState.geoJSONCalls).toHaveLength(1);
    expect(leafletMockState.geoJSONCalls[0].stores.features).toHaveLength(2);
    expect(leafletMockState.markers).toHaveLength(2);
    expect(leafletMockState.markers[0].bindPopup).toHaveBeenCalledTimes(1);
    expect(leafletMockState.markers[0].setIcon).toHaveBeenCalledTimes(1);
    expect(leafletMockState.maps[0].fitBounds).toHaveBeenCalledTimes(1);

    leafletMockState.markers[0].trigger('click');
    expect(leafletMockState.maps[0].setView).toHaveBeenCalledWith({ lat: 16.2411, lng: -61.5336 });

    locator.destroy();
  });

  it('refreshes markers from form filters', () => {
    document.body.innerHTML = `
      <div class="store-locator">
        <form class="store-locator-filters">
          <label><input checked name="category" type="radio" value="" />Toutes</label>
          <label><input name="category" type="radio" value="Coffee" />Coffee</label>
          <label><input name="category" type="radio" value="Bakery" />Bakery</label>
        </form>
      </div>
    `;

    const mapElement = document.createElement('div');
    document.body.querySelector('.store-locator')?.appendChild(mapElement);

    const locator = new StoreLocator({
      stores: [
        { id: 'store-1', name: 'Cafe', category: 'Coffee', lat: 16.2411, lng: -61.5336 },
        { id: 'store-2', name: 'Bakery', category: 'Bakery', lat: 16.2062, lng: -61.4932 },
      ],
      elements: {
        map: mapElement,
      },
    });

    expect(leafletMockState.geoJSONCalls.at(-1)?.stores.features).toHaveLength(2);

    const coffeeInput = document.querySelector<HTMLInputElement>('input[value="Coffee"]');

    expect(coffeeInput).not.toBeNull();

    if(!coffeeInput) {
      throw new Error('Coffee input not found');
    }

    coffeeInput.checked = true;
    coffeeInput.dispatchEvent(new Event('change', { bubbles: true }));

    expect(leafletMockState.geoJSONCalls.at(-1)?.stores.features).toHaveLength(1);
    expect(leafletMockState.geoJSONCalls.at(-1)?.stores.features[0].properties?.category).toBe('Coffee');

    locator.destroy();
  });

  it('cleans up the Leaflet map instance on destroy', () => {
    const mapElement = document.createElement('div');
    document.body.appendChild(mapElement);

    const locator = new StoreLocator({
      stores: [{ id: 'store-1', lat: 16.2411, lng: -61.5336 }],
      elements: {
        map: mapElement,
      },
    });

    const map = leafletMockState.maps[0];

    locator.destroy();

    expect(map.off).toHaveBeenCalledTimes(1);
    expect(map.remove).toHaveBeenCalledTimes(1);
    expect(locator.map).toBeNull();
    expect(locator.clusters).toBeNull();
    expect(locator.filters).toBeNull();
  });
});
