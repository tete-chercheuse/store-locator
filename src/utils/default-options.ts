import type { StoreLocatorMapConfig, StoreLocatorResolvedOptions, StoreLocatorSelectors } from '../types';

/** Style vectoriel Bright servi par OpenFreeMap : sans clé d'API, sans quota. */
export const OPENFREEMAP_BRIGHT = 'https://tiles.openfreemap.org/styles/bright';

const defaultMapOptions: StoreLocatorMapConfig = {
  refreshRecenter: false,
  initialRecenter: true,
  locate: false,
  navigation: true,
  style: OPENFREEMAP_BRIGHT,
  options: {
    zoom: 2,
    maxZoom: 18,
    minZoom: 2,
    center: [0, 0],
    cooperativeGestures: true,
  },
  markers: {
    icon: null,
    popup: null,
  },
  clusters: {
    enabled: true,
    radius: 50,
    maxZoom: 14,
    minPoints: 2,
    color: '#2563eb',
    size: 18,
    strokeColor: '#ffffff',
    strokeWidth: 2,
    textColor: '#ffffff',
    textSize: 12,
    textFont: ['Noto Sans Regular'],
  },
  fitBoundsOptions: {
    padding: 48,
  },
};

const defaultSelectors: StoreLocatorSelectors = {
  wrapper: '.store-locator',
  map: 'store-locator-map',
  filters: '.store-locator-filters',
};

const defaultOptions: StoreLocatorResolvedOptions = {
  stores: null,
  map: defaultMapOptions,
  selectors: defaultSelectors,
  elements: {
    wrapper: null,
    map: null,
    filters: null,
  },
};

export default defaultOptions;
