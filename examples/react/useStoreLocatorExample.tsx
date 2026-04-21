import * as L from 'leaflet';
import { useRef } from 'react';
import { useStoreLocator } from 'store-locator/react';

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
];

export function UseStoreLocatorExample() {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const filtersRef = useRef<HTMLFormElement | null>(null);

  useStoreLocator({
    stores,
    wrapperRef,
    mapRef,
    filtersRef,
    options: {
      map: {
        locate: true,
        markers: {
          popup: (feature) => L.popup().setContent(feature.properties.name),
        },
      },
    },
  });

  return (
    <div ref={wrapperRef}>
      <form ref={filtersRef} className="store-locator-filters">
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
      <div ref={mapRef} style={{ minHeight: 480 }} />
    </div>
  );
}
