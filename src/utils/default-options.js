/**
 * store-locator default options
 * @module store-locator/defaultOptions
 */
export default {
  stores: null,
  map: {
    refreshRecenter: false,
    initialRecenter: true,
    locate: true,
    options: {
      scrollWheelZoom: false,
      zoom: 2,
      maxZoom: 18,
      minZoom: 2,
      center: [0, 0],
    },
    tiles: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd'
      }
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
  },
  selectors: {
    wrapper: '.store-locator',
    map: 'store-locator-map',
    filters: '.store-locator-filters',
  }
};

