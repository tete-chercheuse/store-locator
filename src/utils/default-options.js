/**
 * store-locator default options
 * @module store-locator/defaultOptions
 */
export default {
  stores: null,
  map: {
    initialSettings: {
      zoom: 2,
      lat: 0,
      lng: 0,
    },
    options: {
      scrollWheelZoom: false
    },
    tiles: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      options: {
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
        minZoom: 2
      }
    },
    markers: {
      icon: null,
      popup: null
    },
    refreshRecenter: true,
  },
  selectors: {
    wrapper: '.store-locator',
    map: 'store-locator-map',
    filters: '.store-locator-filters',
  }
};

