import { StoreLocatorMap } from 'store-locator/react';

type ExampleStore = {
  id: string;
  name: string;
  category: 'Bakery' | 'Coffee';
  address: string;
  city: string;
  lat: number;
  lng: number;
};

const stores: ExampleStore[] = [
  {
    id: 'bakery-1',
    name: 'Maison Rivera',
    category: 'Bakery',
    address: '12 rue Frébault',
    city: 'Pointe-a-Pitre',
    lat: 16.2411,
    lng: -61.5336,
  },
  {
    id: 'coffee-1',
    name: 'Cafe du Port',
    category: 'Coffee',
    address: '4 quai Lefebvre',
    city: 'Pointe-a-Pitre',
    lat: 16.2397,
    lng: -61.5361,
  },
  {
    id: 'coffee-2',
    name: 'Brulerie du Bourg',
    category: 'Coffee',
    address: '18 rue du General de Gaulle',
    city: 'Le Gosier',
    lat: 16.2062,
    lng: -61.4932,
  },
];

export function StoreLocatorMapExample() {
  return (
    <StoreLocatorMap<ExampleStore>
      stores={stores}
      className="store-locator"
      mapStyle={{ minHeight: 480, borderRadius: 16, overflow: 'hidden' }}
      options={{
        map: {
          refreshRecenter: true,
          markers: {
            popup: (feature) => `
              <strong>${feature.properties.name}</strong><br />
              ${feature.properties.address}<br />
              ${feature.properties.city}
            `,
          },
        },
      }}
    >
      <form className="store-locator-filters">
        <label>
          <input defaultChecked name="category" type="radio" value="" />
          Toutes
        </label>
        <label>
          <input name="category" type="radio" value="Bakery" />
          Boulangeries
        </label>
        <label>
          <input name="category" type="radio" value="Coffee" />
          Cafes
        </label>
      </form>
    </StoreLocatorMap>
  );
}

export default StoreLocatorMapExample;
