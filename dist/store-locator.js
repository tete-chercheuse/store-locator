require('leaflet');
require('leaflet.markercluster');
require('leaflet.locatecontrol');
require('@raruto/leaflet-gesture-handling');
require('leaflet/dist/leaflet.css');
require('leaflet.markercluster/dist/MarkerCluster.css');
require('leaflet.markercluster/dist/MarkerCluster.Default.css');
require('leaflet.locatecontrol/dist/L.Control.Locate.css');
require('@raruto/leaflet-gesture-handling/dist/leaflet-gesture-handling.css');

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _createForOfIteratorHelperLoose(r, e) {
  var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (t) return (t = t.call(r)).next.bind(t);
  if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) {
    t && (r = t);
    var o = 0;
    return function () {
      return o >= r.length ? {
        done: !0
      } : {
        done: !1,
        value: r[o++]
      };
    };
  }
  throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
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
  var extended = {};

  // Merge the object into the extended object
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
  };

  // Loop through each object and conduct a merge
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
    refreshRecenter: false,
    initialRecenter: true,
    locate: false,
    options: {
      zoom: 2,
      maxZoom: 18,
      minZoom: 2,
      center: [0, 0],
      gestureHandling: true
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
        disableClusteringAtZoom: 15
      }
    }
  },
  selectors: {
    wrapper: '.store-locator',
    map: 'store-locator-map',
    filters: '.store-locator-filters'
  }
};

var L = window['L'];

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
  _proto.refreshClusters = function refreshClusters(filters, recenter, maxZoom) {
    var _this = this;
    if (filters === void 0) {
      filters = null;
    }
    if (recenter === void 0) {
      recenter = this.options.map.refreshRecenter;
    }
    if (maxZoom === void 0) {
      maxZoom = null;
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
        this.map.fitBounds(this.clusters.getBounds(), {
          maxZoom: maxZoom
        });
      }
    }
  };
  _proto._initMap = function _initMap() {
    var _this2 = this;
    this.map = L.map(this.options.selectors.map, this.options.map.options);
    L.tileLayer(this.options.map.tiles.url, this.options.map.tiles.options).addTo(this.map);
    if (this.options.locate) {
      L.control.locate().addTo(this.map);
    }
    this.map.on('click', function () {
      return _this2.map.scrollWheelZoom.enable();
    });
    this.map.on('mouseout', function () {
      return _this2.map.scrollWheelZoom.disable();
    });
    this.clusters = L.markerClusterGroup(this.options.map.markers.clustersOptions);
    this.map.addLayer(this.clusters);
    this.refreshClusters(null, true, this.options.map.initialRecenter ? null : this.options.map.options.zoom);
  };
  _proto._initFilters = function _initFilters() {
    var _this3 = this;
    var wrapper = document.querySelector(this.options.selectors.wrapper);
    if (wrapper) {
      this.filters = wrapper.querySelector(this.options.selectors.filters);
      if (this.filters && this.filters.elements.length) {
        for (var _iterator = _createForOfIteratorHelperLoose(this.filters.elements), _step; !(_step = _iterator()).done;) {
          var field = _step.value;
          field.addEventListener('change', function () {
            return _this3.refreshClusters(formValues(_this3.filters));
          });
        }
      }
    }
  };
  return StoreLocator;
}();

module.exports = StoreLocator;
