import 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.locatecontrol';

/**
 * Extends multiple object into one
 * @param {Boolean} deep Enable extend for deep object properties
 * @param {Array} objects List of objects to merged
 * @return {Object} Objects merged into one
 */
const extend = (deep = false, ...objects) => {
  let extended = {}; // Merge the object into the extended object

  let merge = obj => {
    for (let prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        // If deep merge and property is an object, merge properties
        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          extended[prop] = extend(true, extended[prop], obj[prop]);
        } else {
          extended[prop] = obj[prop];
        }
      }
    }
  }; // Loop through each object and conduct a merge


  objects.forEach(object => {
    merge(object);
  });
  return extended;
};
/**
 * Get values from a form
 * @param {HTMLElement} form element
 * @return {Object} json values
 */

const formValues = form => {
  const formData = new FormData(form);
  let object = {};
  formData.forEach((value, key) => {
    if (!Reflect.has(object, key)) {
      object[key] = value;
      return;
    }

    if (!Array.isArray(object[key])) {
      object[key] = [object[key]];
    }

    object[key].push(value);
  });
  return object;
};

/**
 * store-locator default options
 * @module store-locator/defaultOptions
 */
var defaultOptions = {
  stores: null,
  map: {
    refreshRecenter: false,
    initialSettings: {
      zoom: 2,
      lat: 0,
      lng: 0
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
    }
  },
  selectors: {
    wrapper: '.store-locator',
    map: 'store-locator-map',
    filters: '.store-locator-filters'
  }
};

/**
 * Store Locator
 * @module StoreLocator
 */

class StoreLocator {
  /**
   * Instanciate the constructor
   * @constructor
   * @param {Object} options Store Locator options
   */
  constructor(options) {
    this.options = defaultOptions;
    this.map = null;
    this.clusters = null;
    this.filters = null;
    this.options = extend(true, defaultOptions, options);

    if (this.options.stores === null) {
      throw new Error('[store-locator] - No stores available');
    }

    this._initMap();

    this._initFilters();
  }

  refreshClusters(filters = null, recenter = this.options.map.refreshRecenter) {
    this.clusters.clearLayers();
    let stores = { ...this.options.stores
    };

    if (filters) {
      stores.features = stores.features.filter(store => {
        let keep = false;
        Object.entries(filters).forEach(([filter, value]) => {
          if (!value.length || Array.isArray(value) && value.includes(store.properties[filter]) || store.properties[filter].includes(value)) {
            keep = true;
          }
        });
        return keep;
      });
    }

    if (stores.features.length) {
      const geoJson = L.geoJSON(stores, {
        pointToLayer: (feature, latlng) => {
          let marker = L.marker(latlng);

          if (typeof this.options.map.markers.popup === 'function') {
            const popup = this.options.map.markers.popup(feature);

            if (typeof this.options.map.markers.popup === 'string' || popup instanceof L.Popup) {
              marker.bindPopup(popup);
            }
          }

          if (typeof this.options.map.markers.icon === 'function') {
            const icon = this.options.map.markers.icon(feature);

            if (icon instanceof L.Icon) {
              marker.setIcon(icon);
            }
          }

          marker.on('click', () => this.map.setView(marker.getLatLng()));
          return marker;
        }
      });
      this.clusters.addLayer(geoJson);

      if (recenter) {
        this.map.fitBounds(this.clusters.getBounds());
      }
    }
  }

  _initMap() {
    this.map = L.map(this.options.selectors.map, this.options.map.options).setView([this.options.map.initialSettings.lat, this.options.map.initialSettings.lng], this.options.map.initialSettings.zoom);
    L.tileLayer(this.options.map.tiles.url, this.options.map.tiles.options).addTo(this.map);
    L.control.locate().addTo(this.map);
    this.clusters = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: 12
    });
    this.map.addLayer(this.clusters);
    this.refreshClusters(null, true);
  }

  _initFilters() {
    this.filters = document.querySelector(this.options.selectors.filters);

    if (this.filters.elements.length) {
      for (let field of this.filters.elements) {
        field.addEventListener('change', () => this.refreshClusters(formValues(this.filters)));
      }
    }
  }

}

export default StoreLocator;
