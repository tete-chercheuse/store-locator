/**
 * store-locator default options
 * @module store-locator/defaultOptions
 */
export default {
  stores: null,
  map: {
    refreshRecenter: false,
    options: {
      scrollWheelZoom: false,
      zoom: 2,
      maxZoom: 20,
      minZoom: 2,
      center: [0, 0],
    },
    tiles: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
      }
    },
    markers: {
      icon: null,
      popup: null,
    },
  },
  selectors: {
    wrapper: '.store-locator',
    map: 'store-locator-map',
    filters: '.store-locator-filters',
  }
};

