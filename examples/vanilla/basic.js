import L from 'leaflet';
import StoreLocator from 'store-locator';

const stores = [
  {
    store: 'Maison Rivera',
    category: 'Bakery',
    address: '12 rue Frébault',
    city: 'Pointe-a-Pitre',
    country: 'Guadeloupe',
    lat: 16.2411,
    lng: -61.5336,
  },
  {
    store: 'Cafe du Port',
    category: 'Coffee',
    address: '4 quai Lefebvre',
    city: 'Pointe-a-Pitre',
    country: 'Guadeloupe',
    lat: 16.2397,
    lng: -61.5361,
  },
];

new StoreLocator({
  stores,
  selectors: {
    wrapper: '.store-locator',
    map: 'store-locator-map',
    filters: '.store-locator-filters',
  },
  map: {
    locate: true,
    markers: {
      popup: (feature) => L.popup().setContent(`
        <strong>${feature.properties.store}</strong><br />
        ${feature.properties.address}<br />
        ${feature.properties.city} - ${feature.properties.country}
      `),
    },
  },
});
