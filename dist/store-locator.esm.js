import 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.locatecontrol';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _createForOfIteratorHelperLoose(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;
      return function () {
        if (i >= o.length) return {
          done: true
        };
        return {
          done: false,
          value: o[i++]
        };
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  it = o[Symbol.iterator]();
  return it.next.bind(it);
}

/**
 * Extends multiple object into one
 * @param {Boolean} deep Enable extend for deep object properties
 * @param {Array} objects List of objects to merged
 * @return {Object} Objects merged into one
 */
var extend = function extend(deep) {
  if (deep === void 0) {
    deep = false;
  }

  var extended = {}; // Merge the object into the extended object

  var merge = function merge(obj) {
    for (var prop in obj) {
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


  [].slice.call(arguments, 1).forEach(function (object) {
    merge(object);
  });
  return extended;
};
/**
 * Get values from a form
 * @param {HTMLElement} form element
 * @return {Object} json values
 */

var formValues = function formValues(form) {
  var formData = new FormData(form);
  var object = {};
  formData.forEach(function (value, key) {
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
    },
    refreshRecenter: true
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

var StoreLocator = /*#__PURE__*/function () {
  /**
   * Instanciate the constructor
   * @constructor
   * @param {Object} options Store Locator options
   */
  function StoreLocator(options) {
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

  var _proto = StoreLocator.prototype;

  _proto.refreshClusters = function refreshClusters(filters, recenter) {
    var _this = this;

    if (filters === void 0) {
      filters = null;
    }

    if (recenter === void 0) {
      recenter = this.options.map.refreshRecenter;
    }

    this.clusters.clearLayers();

    var stores = _extends({}, this.options.stores);

    if (filters) {
      stores.features = stores.features.filter(function (store) {
        var keep = false;
        Object.entries(filters).forEach(function (_ref) {
          var filter = _ref[0],
              value = _ref[1];

          if (!value.length || Array.isArray(value) && value.includes(store.properties[filter]) || store.properties[filter].includes(value)) {
            keep = true;
          }
        });
        return keep;
      });
    }

    if (stores.features.length) {
      var geoJson = L.geoJSON(stores, {
        pointToLayer: function pointToLayer(feature, latlng) {
          var marker = L.marker(latlng);

          if (typeof _this.options.map.markers.popup === 'function') {
            var popup = _this.options.map.markers.popup(feature);

            if (typeof _this.options.map.markers.popup === 'string' || popup instanceof L.Popup) {
              marker.bindPopup(popup);
            }
          }

          if (typeof _this.options.map.markers.icon === 'function') {
            var icon = _this.options.map.markers.icon(feature);

            if (icon instanceof L.Icon) {
              marker.setIcon(icon);
            }
          }

          marker.on('click', function () {
            return _this.map.setView(marker.getLatLng());
          });
          return marker;
        }
      });
      this.clusters.addLayer(geoJson);

      if (recenter) {
        this.map.fitBounds(this.clusters.getBounds());
      }
    }
  };

  _proto._initMap = function _initMap() {
    this.map = L.map(this.options.selectors.map, this.options.map.options).setView([this.options.map.initialSettings.lat, this.options.map.initialSettings.lng], this.options.map.initialSettings.zoom);
    L.tileLayer(this.options.map.tiles.url, this.options.map.tiles.options).addTo(this.map);
    L.control.locate().addTo(this.map);
    this.clusters = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: false,
      disableClusteringAtZoom: 12
    });
    this.map.addLayer(this.clusters);
    this.refreshClusters();
  };

  _proto._initFilters = function _initFilters() {
    var _this2 = this;

    this.filters = document.querySelector(this.options.selectors.filters);

    if (this.filters.elements.length) {
      for (var _iterator = _createForOfIteratorHelperLoose(this.filters.elements), _step; !(_step = _iterator()).done;) {
        var field = _step.value;
        field.addEventListener('change', function () {
          return _this2.refreshClusters(formValues(_this2.filters));
        });
      }
    }
  };

  return StoreLocator;
}();

export default StoreLocator;
