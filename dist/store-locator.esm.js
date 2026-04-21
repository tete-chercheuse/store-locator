import L from 'leaflet';
import 'leaflet-gesture-handling';
import 'leaflet.markercluster';
import 'leaflet.locatecontrol';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';

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

var defaultMapOptions = {
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
};
var defaultSelectors = {
  wrapper: '.store-locator',
  map: 'store-locator-map',
  filters: '.store-locator-filters'
};
var defaultOptions = {
  stores: null,
  map: defaultMapOptions,
  selectors: defaultSelectors,
  elements: {
    wrapper: null,
    map: null,
    filters: null
  }
};

var LATITUDE_KEYS = ['lat', 'latitude'];
var LONGITUDE_KEYS = ['lng', 'lon', 'longitude'];
var isPlainObject = function isPlainObject(value) {
  return Object.prototype.toString.call(value) === '[object Object]';
};
var isDomElement = function isDomElement(value) {
  return value !== null && typeof value === 'object' && 'nodeType' in value && value.nodeType === 1;
};
var isFormElement = function isFormElement(value) {
  if (!isDomElement(value)) {
    return false;
  }
  return value.tagName === 'FORM';
};
var _extend = function extend(deep) {
  if (deep === void 0) {
    deep = false;
  }
  var extended = {};
  var merge = function merge(object) {
    if (!object) {
      return;
    }
    for (var prop in object) {
      if (!Object.prototype.hasOwnProperty.call(object, prop)) {
        continue;
      }
      var value = object[prop];
      if (deep && isPlainObject(value)) {
        extended[prop] = _extend(true, extended[prop], value);
        continue;
      }
      extended[prop] = value;
    }
  };
  [].slice.call(arguments, 1).forEach(merge);
  return extended;
};
var formValues = function formValues(form) {
  var formData = new FormData(form);
  var values = {};
  formData.forEach(function (rawValue, key) {
    var value = "" + rawValue;
    if (!Reflect.has(values, key)) {
      values[key] = value;
      return;
    }
    if (!Array.isArray(values[key])) {
      values[key] = [values[key]];
    }
    values[key].push(value);
  });
  return values;
};
var resolveElement = function resolveElement(target, root, fallbackToId) {
  if (root === void 0) {
    root = null;
  }
  if (fallbackToId === void 0) {
    fallbackToId = false;
  }
  if (isDomElement(target)) {
    return target;
  }
  if (typeof document === 'undefined' || typeof target !== 'string') {
    return null;
  }
  var lookupRoot = root && 'querySelector' in root ? root : document;
  if (fallbackToId) {
    var byId = document.getElementById(target);
    if (byId) {
      return byId;
    }
  }
  return lookupRoot.querySelector(target);
};
var getNumericValue = function getNumericValue(object, keys) {
  for (var _iterator = _createForOfIteratorHelperLoose(keys), _step; !(_step = _iterator()).done;) {
    var key = _step.value;
    var rawValue = object[key];
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      continue;
    }
    var value = Number(rawValue);
    if (!Number.isNaN(value)) {
      return value;
    }
  }
  return null;
};
var isGeoJsonFeature = function isGeoJsonFeature(store) {
  if (!isPlainObject(store)) {
    return false;
  }
  if (store.type !== 'Feature' || !isPlainObject(store.geometry)) {
    return false;
  }
  return store.geometry.type === 'Point' && Array.isArray(store.geometry.coordinates);
};
var normalizeStores = function normalizeStores(stores) {
  if (stores === null || stores === undefined) {
    return null;
  }
  if (isPlainObject(stores) && stores.type === 'FeatureCollection' && Array.isArray(stores.features)) {
    return stores;
  }
  if (!Array.isArray(stores)) {
    throw new Error('[store-locator] - Invalid stores format');
  }
  if (stores.every(function (store) {
    return isGeoJsonFeature(store);
  })) {
    return {
      type: 'FeatureCollection',
      features: [].concat(stores)
    };
  }
  return {
    type: 'FeatureCollection',
    features: stores.map(function (store) {
      if (!isPlainObject(store)) {
        throw new Error('[store-locator] - Invalid stores format');
      }
      var lat = getNumericValue(store, LATITUDE_KEYS);
      var lng = getNumericValue(store, LONGITUDE_KEYS);
      if (lat === null || lng === null) {
        throw new Error('[store-locator] - Invalid store coordinates');
      }
      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        properties: _extends({}, store)
      };
    })
  };
};

var normalizeFilterValues = function normalizeFilterValues(value) {
  return (Array.isArray(value) ? value : [value]).filter(function (item) {
    return item !== '' && item !== null && item !== undefined;
  }).map(function (item) {
    return "" + item;
  });
};
var isEmptyFilterValue = function isEmptyFilterValue(value) {
  return !normalizeFilterValues(value).length;
};
var matchesStoreProperty = function matchesStoreProperty(property, filter) {
  if (property === null || property === undefined) {
    return false;
  }
  var values = normalizeFilterValues(filter);
  if (!values.length) {
    return true;
  }
  var properties = (Array.isArray(property) ? property : [property]).map(function (item) {
    return "" + item;
  });
  return values.some(function (value) {
    return properties.includes(value);
  });
};
/**
 * Store Locator
 * @module StoreLocator
 */
var StoreLocator = /*#__PURE__*/function () {
  /**
   * Instantiate StoreLocator
   * @param options Store locator options
   */
  function StoreLocator(options) {
    this.options = void 0;
    this.map = null;
    this.clusters = null;
    this.filters = null;
    this.filterFields = [];
    this.filterChangeHandler = null;
    this.resizeObserver = null;
    this.options = this.createOptions(options);
    if (this.options.stores === null) {
      throw new Error('[store-locator] - No stores available');
    }
    this.initMap();
    this.setFilters();
  }
  var _proto = StoreLocator.prototype;
  _proto.setStores = function setStores(stores, filters, recenter, maxZoom) {
    if (filters === void 0) {
      filters = null;
    }
    if (recenter === void 0) {
      recenter = this.options.map.refreshRecenter;
    }
    if (maxZoom === void 0) {
      maxZoom = null;
    }
    this.options.stores = normalizeStores(stores);
    this.refreshClusters(filters, recenter, maxZoom);
  };
  _proto.setFilters = function setFilters(filters, wrapper) {
    var _this$options$element3,
      _this = this;
    if (filters === void 0) {
      var _this$options$element;
      filters = (_this$options$element = this.options.elements.filters) != null ? _this$options$element : this.options.selectors.filters;
    }
    if (wrapper === void 0) {
      var _this$options$element2;
      wrapper = (_this$options$element2 = this.options.elements.wrapper) != null ? _this$options$element2 : this.options.selectors.wrapper;
    }
    this.detachFilters();
    if (typeof filters === 'string') {
      this.options.selectors.filters = filters;
      this.options.elements.filters = null;
    } else {
      this.options.elements.filters = isFormElement(filters) ? filters : null;
    }
    if (typeof wrapper === 'string') {
      this.options.selectors.wrapper = wrapper;
      this.options.elements.wrapper = null;
    } else {
      this.options.elements.wrapper = wrapper;
    }
    var wrapperElement = this.resolveWrapperElement();
    var filtersElement = (_this$options$element3 = this.options.elements.filters) != null ? _this$options$element3 : resolveElement(this.options.selectors.filters, wrapperElement);
    if (!filtersElement || !filtersElement.elements.length) {
      this.filters = null;
      return;
    }
    this.filters = filtersElement;
    this.filterFields = Array.from(this.filters.elements);
    this.filterChangeHandler = function () {
      return _this.refreshClusters(formValues(_this.filters));
    };
    for (var _iterator = _createForOfIteratorHelperLoose(this.filterFields), _step; !(_step = _iterator()).done;) {
      var field = _step.value;
      field.addEventListener('change', this.filterChangeHandler);
    }
    this.refreshClusters(formValues(this.filters));
  };
  _proto.refreshClusters = function refreshClusters(filters, recenter, maxZoom) {
    var _this2 = this;
    if (filters === void 0) {
      filters = null;
    }
    if (recenter === void 0) {
      recenter = this.options.map.refreshRecenter;
    }
    if (maxZoom === void 0) {
      maxZoom = null;
    }
    if (!this.clusters || !this.options.stores) {
      return;
    }
    this.clusters.clearLayers();
    var stores = _extends({}, this.options.stores, {
      features: [].concat(this.options.stores.features)
    });
    if (filters) {
      stores.features = stores.features.filter(function (store) {
        return Object.entries(filters).every(function (_ref) {
          var _store$properties;
          var filter = _ref[0],
            value = _ref[1];
          if (isEmptyFilterValue(value)) {
            return true;
          }
          return matchesStoreProperty((_store$properties = store.properties) == null ? void 0 : _store$properties[filter], value);
        });
      });
    }
    if (!stores.features.length) {
      return;
    }
    var geoJson = L.geoJSON(stores, {
      pointToLayer: function pointToLayer(feature, latlng) {
        var marker = L.marker(latlng);
        var popup = _this2.resolvePopup(feature);
        var icon = _this2.resolveIcon(feature);
        if (typeof popup === 'string' || popup instanceof L.Popup) {
          marker.bindPopup(popup);
        }
        if (icon instanceof L.Icon) {
          marker.setIcon(icon);
        }
        marker.on('click', function () {
          var _this2$map;
          return (_this2$map = _this2.map) == null ? void 0 : _this2$map.setView(marker.getLatLng());
        });
        return marker;
      }
    });
    this.clusters.addLayer(geoJson);
    if (recenter) {
      var _this$map;
      (_this$map = this.map) == null || _this$map.fitBounds(this.clusters.getBounds(), {
        maxZoom: maxZoom != null ? maxZoom : undefined
      });
    }
  };
  _proto.invalidateSize = function invalidateSize(options) {
    var _this$map2;
    (_this$map2 = this.map) == null || _this$map2.invalidateSize(options);
  };
  _proto.destroy = function destroy() {
    var _this$resizeObserver;
    this.detachFilters();
    (_this$resizeObserver = this.resizeObserver) == null || _this$resizeObserver.disconnect();
    this.resizeObserver = null;
    if (this.map) {
      this.map.off();
      this.map.remove();
    }
    this.map = null;
    this.clusters = null;
    this.filters = null;
  };
  _proto.createOptions = function createOptions(options) {
    var mergedOptions = _extend(true, defaultOptions, options);
    return _extends({}, mergedOptions, {
      stores: normalizeStores(options.stores)
    });
  };
  _proto.initMap = function initMap() {
    var _this3 = this;
    var mapContainer = this.resolveMapElement();
    if (!mapContainer) {
      throw new Error('[store-locator] - Map container not found');
    }
    if (mapContainer._leaflet_id) {
      throw new Error('[store-locator] - Map container is already initialized. ' + 'Call destroy() on the previous instance before creating a new one on the same element.');
    }
    this.map = L.map(mapContainer, this.options.map.options);
    L.tileLayer(this.options.map.tiles.url, this.options.map.tiles.options).addTo(this.map);
    if (this.options.map.locate) {
      L.control.locate().addTo(this.map);
    }
    this.map.on('click', function () {
      var _this3$map;
      return (_this3$map = _this3.map) == null ? void 0 : _this3$map.scrollWheelZoom.enable();
    });
    this.map.on('mouseout', function () {
      var _this3$map2;
      return (_this3$map2 = _this3.map) == null ? void 0 : _this3$map2.scrollWheelZoom.disable();
    });
    this.clusters = L.markerClusterGroup(this.options.map.markers.clustersOptions);
    this.map.addLayer(this.clusters);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(function () {
        var _this3$map3;
        (_this3$map3 = _this3.map) == null || _this3$map3.invalidateSize();
      });
      this.resizeObserver.observe(mapContainer);
    }
    this.refreshClusters(null, true, this.options.map.initialRecenter ? null : this.options.map.options.zoom);
  };
  _proto.resolveMapElement = function resolveMapElement() {
    var _this$options$element4;
    return (_this$options$element4 = this.options.elements.map) != null ? _this$options$element4 : resolveElement(this.options.selectors.map, null, true);
  };
  _proto.resolveWrapperElement = function resolveWrapperElement() {
    var _this$options$element5;
    return (_this$options$element5 = this.options.elements.wrapper) != null ? _this$options$element5 : resolveElement(this.options.selectors.wrapper);
  };
  _proto.resolvePopup = function resolvePopup(feature) {
    var popup = this.options.map.markers.popup;
    return typeof popup === 'function' ? popup(feature) : popup;
  };
  _proto.resolveIcon = function resolveIcon(feature) {
    var icon = this.options.map.markers.icon;
    return typeof icon === 'function' ? icon(feature) : icon;
  };
  _proto.detachFilters = function detachFilters() {
    if (this.filterFields.length && this.filterChangeHandler) {
      for (var _iterator2 = _createForOfIteratorHelperLoose(this.filterFields), _step2; !(_step2 = _iterator2()).done;) {
        var field = _step2.value;
        field.removeEventListener('change', this.filterChangeHandler);
      }
    }
    this.filterFields = [];
    this.filterChangeHandler = null;
  };
  return StoreLocator;
}();

export { StoreLocator as default };
