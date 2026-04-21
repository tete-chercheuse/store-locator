import L from 'leaflet';
import 'leaflet-gesture-handling';
import 'leaflet.markercluster';
import 'leaflet.locatecontrol';
import 'leaflet/dist/leaflet.css';
import 'leaflet-gesture-handling/dist/leaflet-gesture-handling.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';

function _extends() {
  return _extends = Object.assign ? Object.assign.bind() : function (n) {
    for (var e = 1; e < arguments.length; e++) {
      var t = arguments[e];
      for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]);
    }
    return n;
  }, _extends.apply(null, arguments);
}
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}

const defaultMapOptions = {
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
const defaultSelectors = {
  wrapper: '.store-locator',
  map: 'store-locator-map',
  filters: '.store-locator-filters'
};
const defaultOptions = {
  stores: null,
  map: defaultMapOptions,
  selectors: defaultSelectors,
  elements: {
    wrapper: null,
    map: null,
    filters: null
  }
};

const LATITUDE_KEYS = ['lat', 'latitude'];
const LONGITUDE_KEYS = ['lng', 'lon', 'longitude'];
const isPlainObject = value => {
  return Object.prototype.toString.call(value) === '[object Object]';
};
const isDomElement = value => {
  return value !== null && typeof value === 'object' && 'nodeType' in value && value.nodeType === 1;
};
const isFormElement = value => {
  if (!isDomElement(value)) {
    return false;
  }
  return value.tagName === 'FORM';
};
const extend = (deep = false, ...objects) => {
  const extended = {};
  const merge = object => {
    if (!object) {
      return;
    }
    for (const prop in object) {
      if (!Object.prototype.hasOwnProperty.call(object, prop)) {
        continue;
      }
      const value = object[prop];
      if (deep && isPlainObject(value)) {
        extended[prop] = extend(true, extended[prop], value);
        continue;
      }
      extended[prop] = value;
    }
  };
  objects.forEach(merge);
  return extended;
};
const formValues = form => {
  const formData = new FormData(form);
  const values = {};
  formData.forEach((rawValue, key) => {
    const value = `${rawValue}`;
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
const resolveElement = (target, root = null, fallbackToId = false) => {
  if (isDomElement(target)) {
    return target;
  }
  if (typeof document === 'undefined' || typeof target !== 'string') {
    return null;
  }
  const lookupRoot = root && 'querySelector' in root ? root : document;
  if (fallbackToId) {
    const byId = document.getElementById(target);
    if (byId) {
      return byId;
    }
  }
  return lookupRoot.querySelector(target);
};
const getNumericValue = (object, keys) => {
  for (const key of keys) {
    const rawValue = object[key];
    if (rawValue === null || rawValue === undefined || rawValue === '') {
      continue;
    }
    const value = Number(rawValue);
    if (!Number.isNaN(value)) {
      return value;
    }
  }
  return null;
};
const isGeoJsonFeature = store => {
  if (!isPlainObject(store)) {
    return false;
  }
  if (store.type !== 'Feature' || !isPlainObject(store.geometry)) {
    return false;
  }
  return store.geometry.type === 'Point' && Array.isArray(store.geometry.coordinates);
};
const normalizeStores = stores => {
  if (stores === null || stores === undefined) {
    return null;
  }
  if (isPlainObject(stores) && stores.type === 'FeatureCollection' && Array.isArray(stores.features)) {
    return stores;
  }
  if (!Array.isArray(stores)) {
    throw new Error('[store-locator] - Invalid stores format');
  }
  if (stores.every(store => isGeoJsonFeature(store))) {
    return {
      type: 'FeatureCollection',
      features: [...stores]
    };
  }
  return {
    type: 'FeatureCollection',
    features: stores.map(store => {
      if (!isPlainObject(store)) {
        throw new Error('[store-locator] - Invalid stores format');
      }
      const lat = getNumericValue(store, LATITUDE_KEYS);
      const lng = getNumericValue(store, LONGITUDE_KEYS);
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

const _excluded = ["content"];
const normalizeFilterValues = value => {
  return (Array.isArray(value) ? value : [value]).filter(item => item !== '' && item !== null && item !== undefined).map(item => `${item}`);
};
const isEmptyFilterValue = value => {
  return !normalizeFilterValues(value).length;
};
const matchesStoreProperty = (property, filter) => {
  if (property === null || property === undefined) {
    return false;
  }
  const values = normalizeFilterValues(filter);
  if (!values.length) {
    return true;
  }
  const properties = (Array.isArray(property) ? property : [property]).map(item => `${item}`);
  return values.some(value => properties.includes(value));
};
const isIconOptions = value => {
  return typeof value === 'object' && value !== null && 'iconUrl' in value && typeof value.iconUrl === 'string';
};
const normalizeIconValue = value => {
  if (value === null || value === undefined) {
    return value;
  }
  if (value instanceof L.Icon) {
    return value;
  }
  if (typeof value === 'string') {
    return L.icon({
      iconUrl: value
    });
  }
  if (isIconOptions(value)) {
    return L.icon(value);
  }
  return undefined;
};
const isHtmlElement = value => {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
};
const isPopupOptions = value => {
  return typeof value === 'object' && value !== null && !isHtmlElement(value);
};
const normalizePopupValue = value => {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'string' || isHtmlElement(value) || value instanceof L.Popup) {
    return value;
  }
  if (isPopupOptions(value)) {
    const {
        content
      } = value,
      options = _objectWithoutPropertiesLoose(value, _excluded);
    const popup = L.popup(options);
    if (content !== null && content !== undefined) {
      popup.setContent(content);
    }
    return popup;
  }
  return undefined;
};
/**
 * Store Locator
 * @module StoreLocator
 */
class StoreLocator {
  /**
   * Instantiate StoreLocator
   * @param options Store locator options
   */
  constructor(options) {
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
  setStores(stores, filters = null, recenter = this.options.map.refreshRecenter, maxZoom = null) {
    this.options.stores = normalizeStores(stores);
    this.refreshClusters(filters, recenter, maxZoom);
  }
  setFilters(filters = (_this$options$element => (_this$options$element = this.options.elements.filters) != null ? _this$options$element : this.options.selectors.filters)(), wrapper = (_this$options$element2 => (_this$options$element2 = this.options.elements.wrapper) != null ? _this$options$element2 : this.options.selectors.wrapper)()) {
    var _this$options$element3;
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
    const wrapperElement = this.resolveWrapperElement();
    const filtersElement = (_this$options$element3 = this.options.elements.filters) != null ? _this$options$element3 : resolveElement(this.options.selectors.filters, wrapperElement);
    if (!filtersElement || !filtersElement.elements.length) {
      this.filters = null;
      return;
    }
    this.filters = filtersElement;
    this.filterFields = Array.from(this.filters.elements);
    this.filterChangeHandler = () => this.refreshClusters(formValues(this.filters));
    for (const field of this.filterFields) {
      field.addEventListener('change', this.filterChangeHandler);
    }
    this.refreshClusters(formValues(this.filters));
  }
  refreshClusters(filters = null, recenter = this.options.map.refreshRecenter, maxZoom = null) {
    if (!this.clusters || !this.options.stores) {
      return;
    }
    this.clusters.clearLayers();
    const stores = _extends({}, this.options.stores, {
      features: [...this.options.stores.features]
    });
    if (filters) {
      stores.features = stores.features.filter(store => {
        return Object.entries(filters).every(([filter, value]) => {
          var _store$properties;
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
    const geoJson = L.geoJSON(stores, {
      pointToLayer: (feature, latlng) => {
        const marker = L.marker(latlng);
        const popup = this.resolvePopup(feature);
        const icon = this.resolveIcon(feature);
        if (popup !== null && popup !== undefined) {
          marker.bindPopup(popup);
        }
        if (icon) {
          marker.setIcon(icon);
        }
        marker.on('click', () => {
          var _this$map;
          return (_this$map = this.map) == null ? void 0 : _this$map.setView(marker.getLatLng());
        });
        return marker;
      }
    });
    this.clusters.addLayer(geoJson);
    if (recenter) {
      var _this$map2;
      (_this$map2 = this.map) == null || _this$map2.fitBounds(this.clusters.getBounds(), {
        maxZoom: maxZoom != null ? maxZoom : undefined
      });
    }
  }
  invalidateSize(options) {
    var _this$map3;
    (_this$map3 = this.map) == null || _this$map3.invalidateSize(options);
  }
  destroy() {
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
  }
  createOptions(options) {
    const mergedOptions = extend(true, defaultOptions, options);
    return _extends({}, mergedOptions, {
      stores: normalizeStores(options.stores)
    });
  }
  initMap() {
    const mapContainer = this.resolveMapElement();
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
    this.map.on('click', () => {
      var _this$map4;
      return (_this$map4 = this.map) == null ? void 0 : _this$map4.scrollWheelZoom.enable();
    });
    this.map.on('mouseout', () => {
      var _this$map5;
      return (_this$map5 = this.map) == null ? void 0 : _this$map5.scrollWheelZoom.disable();
    });
    this.clusters = L.markerClusterGroup(this.options.map.markers.clustersOptions);
    this.map.addLayer(this.clusters);
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        var _this$map6;
        (_this$map6 = this.map) == null || _this$map6.invalidateSize();
      });
      this.resizeObserver.observe(mapContainer);
    }
    this.refreshClusters(null, true, this.options.map.initialRecenter ? null : this.options.map.options.zoom);
  }
  resolveMapElement() {
    var _this$options$element4;
    return (_this$options$element4 = this.options.elements.map) != null ? _this$options$element4 : resolveElement(this.options.selectors.map, null, true);
  }
  resolveWrapperElement() {
    var _this$options$element5;
    return (_this$options$element5 = this.options.elements.wrapper) != null ? _this$options$element5 : resolveElement(this.options.selectors.wrapper);
  }
  resolvePopup(feature) {
    const popup = this.options.map.markers.popup;
    return normalizePopupValue(typeof popup === 'function' ? popup(feature) : popup);
  }
  resolveIcon(feature) {
    const icon = this.options.map.markers.icon;
    return normalizeIconValue(typeof icon === 'function' ? icon(feature) : icon);
  }
  detachFilters() {
    if (this.filterFields.length && this.filterChangeHandler) {
      for (const field of this.filterFields) {
        field.removeEventListener('change', this.filterChangeHandler);
      }
    }
    this.filterFields = [];
    this.filterChangeHandler = null;
  }
}

export { StoreLocator as default };
