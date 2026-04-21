import type { StoreLocatorMapConfig, StoreLocatorResolvedOptions, StoreLocatorSelectors } from '../types';

const defaultMapOptions: StoreLocatorMapConfig = {
  refreshRecenter: false,
  initialRecenter: true,
  locate: false,
  options: {
    zoom: 2,
    maxZoom: 18,
    minZoom: 2,
    center: [0, 0],
    gestureHandling: true,
  },
  tiles: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
    options: {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
    },
  },
  markers: {
    icon: null,
    popup: null,
    clustersOptions: {
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: 15,
    },
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
