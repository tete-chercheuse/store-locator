import StoreLocator from 'store-locator';

type DemoStore = {
  id: string;
  store: string;
  category: 'Bakery' | 'Coffee';
  address: string;
  city: string;
  country: string;
  icon: string;
  lat: number;
  lng: number;
};

const stores: DemoStore[] = [
  {
    id: 'bakery-1',
    store: 'Maison Rivera',
    category: 'Bakery',
    address: '12 rue Frébault',
    city: 'Pointe-a-Pitre',
    country: 'Guadeloupe',
    icon: '/icons/bakery.svg',
    lat: 16.2411,
    lng: -61.5336,
  },
  {
    id: 'coffee-1',
    store: 'Cafe du Port',
    category: 'Coffee',
    address: '4 quai Lefebvre',
    city: 'Pointe-a-Pitre',
    country: 'Guadeloupe',
    icon: '/icons/coffee.svg',
    lat: 16.2397,
    lng: -61.5361,
  },
];

const wrapper = document.querySelector('.store-locator') as HTMLElement | null;
const filters = document.querySelector('.store-locator-filters') as HTMLFormElement | null;
const map = document.getElementById('store-locator-map');

const storeLocator = new StoreLocator<DemoStore>({
  stores,
  elements: {
    wrapper,
    filters,
    map,
  },
  map: {
    locate: true,
    markers: {
      popup: (feature) => feature.properties.store,
      icon: (feature) => ({
        iconUrl: feature.properties.icon,
        iconSize: [40, 44],
        iconAnchor: [20, 44],
        popupAnchor: [0, -44],
      }),
    },
  },
});

storeLocator.invalidateSize();
