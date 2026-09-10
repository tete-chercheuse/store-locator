import { useState, useRef, useEffect, createElement } from 'react';
import { Map as Map$1, NavigationControl, GeolocateControl, Marker, Popup } from 'maplibre-gl';

function _arrayLikeToArray(r, a) {
  (null == a || a > r.length) && (a = r.length);
  for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e];
  return n;
}
function _defineProperties(e, r) {
  for (var t = 0; t < r.length; t++) {
    var o = r[t];
    o.enumerable = o.enumerable || !1, o.configurable = !0, "value" in o && (o.writable = !0), Object.defineProperty(e, _toPropertyKey(o.key), o);
  }
}
function _createClass(e, r, t) {
  return r && _defineProperties(e.prototype, r), t && _defineProperties(e, t), Object.defineProperty(e, "prototype", {
    writable: !1
  }), e;
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
function _objectWithoutPropertiesLoose(r, e) {
  if (null == r) return {};
  var t = {};
  for (var n in r) if ({}.hasOwnProperty.call(r, n)) {
    if (-1 !== e.indexOf(n)) continue;
    t[n] = r[n];
  }
  return t;
}
function _toPrimitive(t, r) {
  if ("object" != typeof t || !t) return t;
  var e = t[Symbol.toPrimitive];
  if (void 0 !== e) {
    var i = e.call(t, r || "default");
    if ("object" != typeof i) return i;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return ("string" === r ? String : Number)(t);
}
function _toPropertyKey(t) {
  var i = _toPrimitive(t, "string");
  return "symbol" == typeof i ? i : i + "";
}
function _unsupportedIterableToArray(r, a) {
  if (r) {
    if ("string" == typeof r) return _arrayLikeToArray(r, a);
    var t = {}.toString.call(r).slice(8, -1);
    return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0;
  }
}

/** Style vectoriel Bright servi par OpenFreeMap : sans clé d'API, sans quota. */
var OPENFREEMAP_BRIGHT = 'https://tiles.openfreemap.org/styles/bright';
var defaultMapOptions = {
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
    cooperativeGestures: true
  },
  markers: {
    icon: null,
    popup: null
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
    textFont: ['Noto Sans Regular']
  },
  fitBoundsOptions: {
    padding: 48,
    // Sans plafond, une collection réduite à un seul point donne une emprise
    // dégénérée et `fitBounds` retombe sur le `maxZoom` de la carte, soit 18.
    // Filtrer jusqu'à un unique magasin projetterait donc au niveau du bâtiment,
    // sur des tuiles surzoomées. 16 montre le magasin dans sa rue.
    maxZoom: 16
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
 * Retourne une nouvelle `FeatureCollection` ne contenant que les features
 * satisfaisant tous les filtres. Les filtres vides sont ignorés.
 */
var filterFeatures = function filterFeatures(collection, filters) {
  if (!filters) {
    return _extends({}, collection, {
      features: [].concat(collection.features)
    });
  }
  return _extends({}, collection, {
    features: collection.features.filter(function (feature) {
      return Object.entries(filters).every(function (_ref) {
        var _feature$properties;
        var filter = _ref[0],
          value = _ref[1];
        if (isEmptyFilterValue(value)) {
          return true;
        }
        return matchesStoreProperty((_feature$properties = feature.properties) == null ? void 0 : _feature$properties[filter], value);
      });
    })
  });
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
/**
 * Met chaque feature en conformité avec les garanties de `StoreLocatorFeature`.
 *
 * Deux normalisations, volontairement réunies ici pour que le contrat ne
 * diverge pas d'une branche d'entrée à l'autre.
 *
 * **`id` séquentiel.** C'est la clé de diff des marqueurs et de déduplication
 * entre tuiles. Elle écrase systématiquement un `id` racine fourni par
 * l'appelant, y compris numérique : conditionner l'assignation exposerait à
 * des collisions entre identifiants métier et index générés. L'identifiant
 * métier reste disponible dans `properties`.
 *
 * Conséquence assumée : l'`id` étant positionnel, réordonner les mêmes stores
 * change tous les identifiants et provoque la reconstruction de tous les
 * marqueurs.
 *
 * **`properties` non nul.** `"properties": null` est du GeoJSON conforme à la
 * norme, mais `StoreLocatorFeature<P>` promet aux factories `icon` et `popup`
 * que `feature.properties` est toujours accessible. On normalise vers `{}`
 * plutôt que de rejeter : refuser casserait des données utilisateur valides.
 *
 * Le cast `{} as P` n'est honnête que si `P` n'a aucune clé requise. Une
 * feature dont les propriétés arrivent nulles perd donc les champs que son
 * type déclare. C'est la contrepartie acceptée d'un assainissement en
 * frontière : l'alternative — élargir le retour en `Partial<P>` — taxerait
 * tous les consommateurs pour un cas marginal.
 */
var normalizeFeatures = function normalizeFeatures(features) {
  return features.map(function (feature, index) {
    var _feature$properties;
    return _extends({}, feature, {
      id: index,
      properties: (_feature$properties = feature.properties) != null ? _feature$properties : {}
    });
  });
};
/**
 * Normalise les données d'entrée en `FeatureCollection` GeoJSON.
 *
 * Accepte trois formes : une `FeatureCollection`, un tableau de `Feature`
 * GeoJSON, ou un tableau d'objets plats porteurs de coordonnées. Les trois
 * passent par {@link normalizeFeatures}, qui garantit l'`id` de diff et un
 * sac de propriétés lisible. L'entrée n'est jamais mutée.
 */
var normalizeStores = function normalizeStores(stores) {
  if (stores === null || stores === undefined) {
    return null;
  }
  if (isPlainObject(stores) && stores.type === 'FeatureCollection' && Array.isArray(stores.features)) {
    return _extends({}, stores, {
      features: normalizeFeatures(stores.features)
    });
  }
  if (!Array.isArray(stores)) {
    throw new Error('[store-locator] - Invalid stores format');
  }
  if (stores.every(function (store) {
    return isGeoJsonFeature(store);
  })) {
    return {
      type: 'FeatureCollection',
      features: normalizeFeatures(stores)
    };
  }
  return {
    type: 'FeatureCollection',
    features: normalizeFeatures(stores.map(function (store) {
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
    }))
  };
};

var computeBounds = function computeBounds(collection) {
  var west = Number.POSITIVE_INFINITY;
  var south = Number.POSITIVE_INFINITY;
  var east = Number.NEGATIVE_INFINITY;
  var north = Number.NEGATIVE_INFINITY;
  var found = false;
  for (var _iterator = _createForOfIteratorHelperLoose(collection.features), _step; !(_step = _iterator()).done;) {
    var feature = _step.value;
    var _feature$geometry$coo = feature.geometry.coordinates,
      lng = _feature$geometry$coo[0],
      lat = _feature$geometry$coo[1];
    if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
      continue;
    }
    west = Math.min(west, lng);
    east = Math.max(east, lng);
    south = Math.min(south, lat);
    north = Math.max(north, lat);
    found = true;
  }
  return found ? [[west, south], [east, north]] : null;
};

/**
 * Conteneurs portant déjà une carte vivante. Remplace la sonde `_leaflet_id`
 * de la v2 sans écrire dans le DOM.
 */
var initializedContainers = new WeakSet();
var releaseContainer = function releaseContainer(container) {
  initializedContainers["delete"](container);
};
var createMap = function createMap(container, config) {
  if (initializedContainers.has(container)) {
    throw new Error('[store-locator] - Map container is already initialized. ' + 'Call destroy() on the previous instance before creating a new one on the same element.');
  }
  var map = new Map$1(_extends({}, config.options, {
    container: container,
    style: config.style
  }));
  // Marqué dès que la carte existe, et avant l'ajout des contrôles : ceux-ci
  // construisent du DOM et peuvent donc échouer. Une carte vivante sur un
  // conteneur non enregistré laisserait le garde-fou en autoriser une seconde.
  initializedContainers.add(container);
  if (config.navigation) {
    map.addControl(new NavigationControl());
  }
  if (config.locate) {
    map.addControl(new GeolocateControl({
      trackUserLocation: true,
      showUserLocation: true
    }));
  }
  return map;
};

var SOURCE_ID = 'store-locator';
var CLUSTER_LAYER_ID = 'store-locator-clusters';
var CLUSTER_COUNT_LAYER_ID = 'store-locator-cluster-count';
var POINT_LAYER_ID = 'store-locator-points';
var UNCLUSTERED_FILTER = ['!', ['has', 'point_count']];
var CLUSTERED_FILTER = ['has', 'point_count'];
var addClusterSource = function addClusterSource(map, collection, clusters) {
  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: collection,
    cluster: clusters.enabled,
    clusterRadius: clusters.radius,
    clusterMaxZoom: clusters.maxZoom,
    clusterMinPoints: clusters.minPoints
  });
  map.addLayer({
    id: POINT_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: UNCLUSTERED_FILTER,
    paint: {
      'circle-radius': 0,
      'circle-opacity': 0
    }
  });
  if (!clusters.enabled) {
    return;
  }
  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: 'circle',
    source: SOURCE_ID,
    filter: CLUSTERED_FILTER,
    paint: {
      'circle-color': clusters.color,
      'circle-radius': clusters.size,
      'circle-stroke-color': clusters.strokeColor,
      'circle-stroke-width': clusters.strokeWidth
    }
  });
  map.addLayer({
    id: CLUSTER_COUNT_LAYER_ID,
    type: 'symbol',
    source: SOURCE_ID,
    filter: CLUSTERED_FILTER,
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': clusters.textFont,
      'text-size': clusters.textSize,
      'text-allow-overlap': true
    },
    paint: {
      'text-color': clusters.textColor
    }
  });
};
var setClusterData = function setClusterData(map, collection) {
  var source = map.getSource(SOURCE_ID);
  // MapLibre v6 : setData ne retourne plus `this` et n'accepte plus de second argument.
  source == null || source.setData(collection);
};

var isHtmlElement$1 = function isHtmlElement(value) {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
};
var isIconOptions = function isIconOptions(value) {
  return typeof value === 'object' && value !== null && !isHtmlElement$1(value);
};
var createImageElement = function createImageElement(url, size) {
  if (typeof document === 'undefined') {
    return null;
  }
  var image = document.createElement('img');
  image.src = url;
  image.alt = '';
  image.style.display = 'block';
  if (size) {
    image.width = size[0];
    image.height = size[1];
    image.style.width = size[0] + "px";
    image.style.height = size[1] + "px";
  }
  return image;
};
var withMarkerOptions = function withMarkerOptions(element, options) {
  var markerOptions = {
    element: element
  };
  if (options.anchor !== undefined) {
    markerOptions.anchor = options.anchor;
  }
  if (options.offset !== undefined) {
    markerOptions.offset = options.offset;
  }
  if (options.className !== undefined) {
    markerOptions.className = options.className;
  }
  if (options.rotation !== undefined) {
    markerOptions.rotation = options.rotation;
  }
  return markerOptions;
};
var normalizeIcon = function normalizeIcon(value) {
  var _value$element;
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string') {
    var _element = createImageElement(value);
    return _element ? {
      element: _element
    } : null;
  }
  if (isHtmlElement$1(value)) {
    return {
      element: value
    };
  }
  if (!isIconOptions(value)) {
    return null;
  }
  var element = (_value$element = value.element) != null ? _value$element : value.url ? createImageElement(value.url, value.size) : null;
  return element ? withMarkerOptions(element, value) : null;
};

var _excluded = ["content"];
var isHtmlElement = function isHtmlElement(value) {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
};
var isPopupOptions = function isPopupOptions(value) {
  return typeof value === 'object' && value !== null && !isHtmlElement(value);
};
var normalizePopup = function normalizePopup(value) {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'string' || isHtmlElement(value)) {
    return {
      content: value,
      options: {}
    };
  }
  if (!isPopupOptions(value)) {
    return null;
  }
  var content = value.content,
    options = _objectWithoutPropertiesLoose(value, _excluded);
  if (content === null || content === undefined) {
    return null;
  }
  return {
    content: content,
    options: options
  };
};

/**
 * Le handler ignore volontairement la charge utile de l'événement. MapLibre v6
 * a supprimé `MapDataEvent` au profit de `MapSourceDataEvent`, et `sourcedata`
 * se déclenche pour chaque tuile : la seule question utile est « resynchroniser
 * maintenant ? », pas « qu'est-ce qui a changé ? ».
 */
/**
 * `move` est volontairement absent : `Marker` lie déjà son propre `_update` sur
 * cet événement, donc les positions suivent la carte sans nous. La seule chose
 * que `sync()` observe est *quelles tuiles sont chargées*, ce qui ne change que
 * sur `sourcedata`, `moveend` et `idle`. L'y ajouter coûterait un balayage
 * complet des tuiles à chaque frame de chaque déplacement, sans rien apporter.
 */
var SYNC_EVENTS = ['moveend', 'sourcedata', 'idle'];
var MarkerSync = /*#__PURE__*/function () {
  function MarkerSync(options) {
    var _this = this;
    this.map = void 0;
    this.resolveIcon = void 0;
    this.resolvePopup = void 0;
    this.onMarkerClick = void 0;
    this.markers = new Map();
    this.features = new Map();
    this.handler = function () {
      return _this.sync();
    };
    this.started = false;
    this.map = options.map;
    this.resolveIcon = options.resolveIcon;
    this.resolvePopup = options.resolvePopup;
    this.onMarkerClick = options.onMarkerClick;
  }
  var _proto = MarkerSync.prototype;
  _proto.start = function start() {
    if (this.started) {
      return;
    }
    for (var _i = 0, _SYNC_EVENTS = SYNC_EVENTS; _i < _SYNC_EVENTS.length; _i++) {
      var event = _SYNC_EVENTS[_i];
      this.map.on(event, this.handler);
    }
    this.started = true;
  }
  /**
   * Remplace la collection de référence et retire les marqueurs périmés.
   *
   * Élaguer sur la seule absence de l'`id` ne suffit pas. Les `id` sont
   * positionnels : `setStores` réattribue `0..n-1`, donc un `id` peut survivre
   * en désignant un tout autre magasin. Le marqueur construit depuis l'ancienne
   * feature resterait alors en place — anciennes coordonnées, ancienne popup —
   * et `sync()` ne le réparerait jamais, puisqu'il passe son tour dès que
   * `markers.has(id)` est vrai.
   *
   * La comparaison porte donc sur l'identité de la feature. `filterFeatures`
   * préserve les références d'origine, un simple filtrage ne provoque donc
   * aucune reconstruction ; `normalizeStores` crée des objets neufs, un
   * `setStores` en provoque bien une.
   */;
  _proto.setFeatures = function setFeatures(collection) {
    this.features.clear();
    for (var _iterator = _createForOfIteratorHelperLoose(collection.features), _step; !(_step = _iterator()).done;) {
      var feature = _step.value;
      if (feature.id !== undefined) {
        this.features.set(feature.id, feature);
      }
    }
    for (var _iterator2 = _createForOfIteratorHelperLoose(this.markers), _step2; !(_step2 = _iterator2()).done;) {
      var _step2$value = _step2.value,
        id = _step2$value[0],
        tracked = _step2$value[1];
      if (this.features.get(id) !== tracked.feature) {
        this.removeMarker(id);
      }
    }
  };
  _proto.sync = function sync() {
    if (!this.map.getSource(SOURCE_ID) || !this.map.isSourceLoaded(SOURCE_ID)) {
      return;
    }
    // `validate: false` : la validation par défaut sérialise tout le style à
    // chaque appel — une centaine de couches pour le fond OpenFreeMap Bright.
    // `UNCLUSTERED_FILTER` est une constante de module, donc déjà validée.
    var rendered = this.map.querySourceFeatures(SOURCE_ID, {
      filter: UNCLUSTERED_FILTER,
      validate: false
    });
    var visible = new Set();
    for (var _iterator3 = _createForOfIteratorHelperLoose(rendered), _step3; !(_step3 = _iterator3()).done;) {
      var tileFeature = _step3.value;
      var _id = tileFeature.id;
      if (_id === undefined || visible.has(_id)) {
        continue;
      }
      visible.add(_id);
      if (this.markers.has(_id)) {
        continue;
      }
      var feature = this.features.get(_id);
      if (!feature) {
        continue;
      }
      this.markers.set(_id, this.createMarker(feature));
    }
    for (var _i2 = 0, _arr = [].concat(this.markers.keys()); _i2 < _arr.length; _i2++) {
      var id = _arr[_i2];
      if (!visible.has(id)) {
        this.removeMarker(id);
      }
    }
  };
  _proto.destroy = function destroy() {
    this.clear();
    this.features.clear();
    if (this.started) {
      for (var _i3 = 0, _SYNC_EVENTS2 = SYNC_EVENTS; _i3 < _SYNC_EVENTS2.length; _i3++) {
        var event = _SYNC_EVENTS2[_i3];
        this.map.off(event, this.handler);
      }
      this.started = false;
    }
  };
  _proto.clear = function clear() {
    for (var _i4 = 0, _arr2 = [].concat(this.markers.keys()); _i4 < _arr2.length; _i4++) {
      var id = _arr2[_i4];
      this.removeMarker(id);
    }
  }
  /**
   * Retire un marqueur et détache son écouteur.
   *
   * `Marker.remove()` ne détache que ses propres écouteurs. Le nôtre survivrait
   * sur un élément fourni par l'appelant et réutilisé d'un rendu à l'autre,
   * s'y empilant à chaque cycle et retenant l'instance au passage.
   */;
  _proto.removeMarker = function removeMarker(id) {
    var tracked = this.markers.get(id);
    if (!tracked) {
      return;
    }
    tracked.marker.getElement().removeEventListener('click', tracked.onClick);
    tracked.marker.remove();
    this.markers["delete"](id);
  };
  _proto.createMarker = function createMarker(feature) {
    var _this2 = this;
    var iconOptions = normalizeIcon(this.resolveIcon(feature));
    var marker = new Marker(iconOptions != null ? iconOptions : undefined);
    marker.setLngLat(feature.geometry.coordinates);
    var popup = normalizePopup(this.resolvePopup(feature));
    if (popup) {
      var instance = new Popup(popup.options);
      if (typeof popup.content === 'string') {
        instance.setHTML(popup.content);
      } else {
        instance.setDOMContent(popup.content);
      }
      marker.setPopup(instance);
    }
    var onClick = function onClick() {
      return _this2.onMarkerClick(feature);
    };
    marker.getElement().addEventListener('click', onClick);
    marker.addTo(this.map);
    return {
      marker: marker,
      feature: feature,
      onClick: onClick
    };
  };
  return MarkerSync;
}();

/**
 * Store Locator
 *
 * **Le CSS de MapLibre n'est pas importé par ce module** : c'est à l'application
 * de le charger, soit `import 'maplibre-gl/dist/maplibre-gl.css'` avec un
 * bundler, soit une balise `<link>` sans bundler.
 *
 * L'importer ici casserait le chemin sans bundler. microbundle externalise
 * `maplibre-gl`, spécificateur CSS compris, qui survit donc tel quel dans le
 * bundle publié ; une importmap ne peut pas le résoudre, un `.css` ne pouvant
 * pas être servi comme module script. Or c'est exactement le chemin
 * d'installation que le README annonce, depuis GitHub et sans étape de build.
 *
 * @module StoreLocator
 */
var StoreLocator = /*#__PURE__*/function () {
  /**
   * Instancie le store locator et démarre la carte.
   * @param options Options du store locator
   */
  function StoreLocator(options) {
    var _this = this;
    this.options = void 0;
    this.map = null;
    this.filters = null;
    this.markerSync = null;
    this.container = null;
    this.styleLoaded = false;
    this.isDestroyed = false;
    this.pending = null;
    this.readyPromise = void 0;
    this.resolveReady = void 0;
    this.filterFields = [];
    this.filterChangeHandler = null;
    this.options = this.createOptions(options);
    if (this.options.stores === null) {
      throw new Error('[store-locator] - No stores available');
    }
    this.readyPromise = new Promise(function (resolve) {
      _this.resolveReady = resolve;
    });
    this.pending = {
      filters: null,
      recenter: true,
      maxZoom: this.options.map.initialRecenter ? null : this.options.map.options.zoom
    };
    this.initMap();
    this.setFilters();
  }
  /**
   * Résout quand le style MapLibre est chargé et que les couches sont en place.
   * Résout également, avec l'instance détruite, si `destroy()` est appelé avant.
   */
  var _proto = StoreLocator.prototype;
  _proto.whenReady = function whenReady() {
    return this.readyPromise;
  }
  /** Remplace les données affichées et rafraîchit la carte. */;
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
    this.refresh(filters, recenter, maxZoom);
  }
  /** Associe ou réassocie le formulaire de filtres. */;
  _proto.setFilters = function setFilters(filters, wrapper) {
    var _this$options$element3,
      _this2 = this;
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
      return _this2.refresh(formValues(_this2.filters));
    };
    for (var _iterator = _createForOfIteratorHelperLoose(this.filterFields), _step; !(_step = _iterator()).done;) {
      var field = _step.value;
      field.addEventListener('change', this.filterChangeHandler);
    }
    this.refresh(formValues(this.filters));
  }
  /** Réapplique les filtres à la source et resynchronise les marqueurs. */;
  _proto.refresh = function refresh(filters, recenter, maxZoom) {
    var _this$markerSync, _this$markerSync2;
    if (filters === void 0) {
      filters = null;
    }
    if (recenter === void 0) {
      recenter = this.options.map.refreshRecenter;
    }
    if (maxZoom === void 0) {
      maxZoom = null;
    }
    if (!this.map || !this.options.stores) {
      return;
    }
    if (!this.styleLoaded) {
      var _ref, _this$pending, _this$pending$recente, _this$pending2, _ref2, _this$pending3;
      this.pending = {
        // `null` ne porte aucune information de filtrage : `setStores` le passe
        // par défaut, sans rien savoir des filtres. L'écraser rendrait la mise
        // en file dépendante de l'ordre d'appel — un `setStores` après un
        // `setFilters` effacerait silencieusement les filtres du formulaire.
        filters: (_ref = filters != null ? filters : (_this$pending = this.pending) == null ? void 0 : _this$pending.filters) != null ? _ref : null,
        recenter: recenter || ((_this$pending$recente = (_this$pending2 = this.pending) == null ? void 0 : _this$pending2.recenter) != null ? _this$pending$recente : false),
        maxZoom: (_ref2 = maxZoom != null ? maxZoom : (_this$pending3 = this.pending) == null ? void 0 : _this$pending3.maxZoom) != null ? _ref2 : null
      };
      return;
    }
    var collection = filterFeatures(this.options.stores, filters);
    setClusterData(this.map, collection);
    (_this$markerSync = this.markerSync) == null || _this$markerSync.setFeatures(collection);
    (_this$markerSync2 = this.markerSync) == null || _this$markerSync2.sync();
    if (recenter) {
      this.fitToCollection(collection, maxZoom);
    }
  }
  /** Relance le calcul de taille de la carte. Utile après un affichage différé. */;
  _proto.resize = function resize() {
    var _this$map;
    (_this$map = this.map) == null || _this$map.resize();
  }
  /** Détruit la carte et libère tous les écouteurs. */;
  _proto.destroy = function destroy() {
    var _this$markerSync3, _this$map2;
    this.detachFilters();
    (_this$markerSync3 = this.markerSync) == null || _this$markerSync3.destroy();
    this.markerSync = null;
    (_this$map2 = this.map) == null || _this$map2.remove();
    if (this.container) {
      releaseContainer(this.container);
    }
    this.container = null;
    this.map = null;
    this.filters = null;
    this.styleLoaded = false;
    this.isDestroyed = true;
    this.resolveReady(this);
  };
  _proto.createOptions = function createOptions(options) {
    var mergedOptions = _extend(true, defaultOptions, options);
    return _extends({}, mergedOptions, {
      stores: normalizeStores(options.stores)
    });
  };
  _proto.initMap = function initMap() {
    var _this3 = this;
    var container = this.resolveMapElement();
    if (!container) {
      throw new Error('[store-locator] - Map container not found');
    }
    this.container = container;
    this.map = createMap(container, this.options.map);
    this.markerSync = new MarkerSync({
      map: this.map,
      resolveIcon: function resolveIcon(feature) {
        return _this3.resolveIcon(feature);
      },
      resolvePopup: function resolvePopup(feature) {
        return _this3.resolvePopup(feature);
      },
      onMarkerClick: function onMarkerClick(feature) {
        var _this3$map;
        (_this3$map = _this3.map) == null || _this3$map.easeTo({
          center: feature.geometry.coordinates
        });
      }
    });
    // Pas de ResizeObserver de notre côté : MapLibre observe déjà le
    // conteneur depuis son constructeur, en throttlant à 50 ms.
    this.map.on('load', function () {
      return _this3.handleStyleLoad();
    });
  };
  _proto.handleStyleLoad = function handleStyleLoad() {
    var _this$pending4, _this$markerSync4, _this$markerSync5, _this$markerSync6;
    if (!this.map || !this.options.stores) {
      return;
    }
    var pending = (_this$pending4 = this.pending) != null ? _this$pending4 : {
      filters: null,
      recenter: true,
      maxZoom: null
    };
    this.pending = null;
    var collection = filterFeatures(this.options.stores, pending.filters);
    addClusterSource(this.map, collection, this.options.map.clusters);
    this.bindClusterInteractions();
    (_this$markerSync4 = this.markerSync) == null || _this$markerSync4.setFeatures(collection);
    (_this$markerSync5 = this.markerSync) == null || _this$markerSync5.start();
    (_this$markerSync6 = this.markerSync) == null || _this$markerSync6.sync();
    this.styleLoaded = true;
    if (pending.recenter) {
      this.fitToCollection(collection, pending.maxZoom);
    }
    this.resolveReady(this);
  };
  _proto.bindClusterInteractions = function bindClusterInteractions() {
    if (!this.map || !this.options.map.clusters.enabled) {
      return;
    }
    var map = this.map;
    map.on('click', CLUSTER_LAYER_ID, function (event) {
      var _event$features, _feature$properties;
      var feature = (_event$features = event.features) == null ? void 0 : _event$features[0];
      var clusterId = feature == null || (_feature$properties = feature.properties) == null ? void 0 : _feature$properties.cluster_id;
      // `feature` est redondant à l'exécution — sans feature, pas de
      // `clusterId` — mais le cast ci-dessus coupe le lien d'inférence, et
      // `feature` resterait `possibly undefined` dans le `.then()`.
      if (!feature || clusterId === undefined) {
        return;
      }
      var source = map.getSource(SOURCE_ID);
      if (!(source != null && source.getClusterExpansionZoom)) {
        return;
      }
      void source.getClusterExpansionZoom(clusterId).then(function (zoom) {
        map.easeTo({
          center: feature.geometry.coordinates,
          zoom: zoom
        });
      });
    });
    map.on('mouseenter', CLUSTER_LAYER_ID, function () {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', CLUSTER_LAYER_ID, function () {
      map.getCanvas().style.cursor = '';
    });
  };
  _proto.fitToCollection = function fitToCollection(collection, maxZoom) {
    var bounds = computeBounds(collection);
    if (!bounds || !this.map) {
      return;
    }
    this.map.fitBounds(bounds, _extends({}, this.options.map.fitBoundsOptions, maxZoom !== null ? {
      maxZoom: maxZoom
    } : {}));
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
  return _createClass(StoreLocator, [{
    key: "destroyed",
    get:
    /**
     * `true` dès que `destroy()` a été appelé.
     *
     * `destroy()` résout délibérément `whenReady()` pour ne laisser aucun
     * appelant en attente. Sans ce drapeau, un consommateur qui attend la
     * promesse ne pourrait pas distinguer « la carte est prête » de
     * « l'instance a été détruite » — les deux résolvent avec la même valeur.
     */
    function get() {
      return this.isDestroyed;
    }
  }]);
}();

var toError = function toError(error) {
  return error instanceof Error ? error : new Error('[store-locator/react] - Failed to initialize StoreLocator');
};
var useStoreLocator = function useStoreLocator(_ref) {
  var _wrapperRef$current, _filtersRef$current;
  var stores = _ref.stores,
    options = _ref.options,
    mapRef = _ref.mapRef,
    wrapperRef = _ref.wrapperRef,
    filtersRef = _ref.filtersRef,
    _ref$disabled = _ref.disabled,
    disabled = _ref$disabled === void 0 ? false : _ref$disabled,
    onReady = _ref.onReady;
  var _useState = useState(null),
    instance = _useState[0],
    setInstance = _useState[1];
  var _useState2 = useState(null),
    error = _useState2[0],
    setError = _useState2[1];
  var _useState3 = useState(false),
    ready = _useState3[0],
    setReady = _useState3[1];
  var storesRef = useRef(stores);
  var optionsRef = useRef(options);
  var onReadyRef = useRef(onReady);
  storesRef.current = stores;
  optionsRef.current = options;
  onReadyRef.current = onReady;
  var currentWrapper = (_wrapperRef$current = wrapperRef == null ? void 0 : wrapperRef.current) != null ? _wrapperRef$current : null;
  var currentFilters = (_filtersRef$current = filtersRef == null ? void 0 : filtersRef.current) != null ? _filtersRef$current : null;
  useEffect(function () {
    if (disabled || !mapRef.current) {
      setInstance(null);
      setError(null);
      setReady(false);
      return;
    }
    var locator = null;
    var cancelled = false;
    var timer = setTimeout(function () {
      if (!mapRef.current) {
        return;
      }
      try {
        var _optionsRef$current, _wrapperRef$current2, _filtersRef$current2;
        locator = new StoreLocator(_extends({}, (_optionsRef$current = optionsRef.current) != null ? _optionsRef$current : {}, {
          stores: storesRef.current,
          elements: {
            map: mapRef.current,
            wrapper: (_wrapperRef$current2 = wrapperRef == null ? void 0 : wrapperRef.current) != null ? _wrapperRef$current2 : null,
            filters: (_filtersRef$current2 = filtersRef == null ? void 0 : filtersRef.current) != null ? _filtersRef$current2 : null
          }
        }));
        setInstance(locator);
        setError(null);
        setReady(false);
        // whenReady() attend le chargement du style : avant lui, la source et
        // les couches n'existent pas encore.
        //
        // Deux gardes, pour deux causes distinctes. `value.destroyed` couvre un
        // `destroy()` déclenché par l'appelant sur l'instance qu'il détient
        // alors que le composant reste monté : le nettoyage de l'effet ne passe
        // pas, donc `cancelled` reste faux, et `destroy()` résolvant
        // délibérément la promesse, `onReady` partirait pour une instance morte.
        //
        // `cancelled` couvre le démontage. Il est de fait redondant, puisque le
        // nettoyage appelle `destroy()` et pose donc `destroyed` — vérifié par
        // mutation. On le conserve néanmoins : c'est le garde idiomatique lié au
        // cycle de vie de l'effet, et s'en passer coupleraient la sûreté du hook
        // à un détail interne de `StoreLocator`.
        void locator.whenReady().then(function (value) {
          if (cancelled || value.destroyed) {
            return;
          }
          setReady(true);
          onReadyRef.current == null || onReadyRef.current(value);
        });
      } catch (nextError) {
        setError(toError(nextError));
        setInstance(null);
        setReady(false);
      }
    }, 0);
    return function () {
      cancelled = true;
      clearTimeout(timer);
      if (locator) {
        locator.destroy();
        setInstance(function (currentInstance) {
          return currentInstance === locator ? null : currentInstance;
        });
        setReady(false);
      }
    };
  }, [disabled, filtersRef, mapRef, wrapperRef]);
  useEffect(function () {
    if (!instance) {
      return;
    }
    instance.setStores(stores);
  }, [instance, stores]);
  useEffect(function () {
    if (!instance) {
      return;
    }
    instance.setFilters(currentFilters, currentWrapper);
  }, [currentFilters, currentWrapper, instance]);
  return {
    instance: instance,
    error: error,
    ready: ready
  };
};
var StoreLocatorMap = function StoreLocatorMap(_ref2) {
  var stores = _ref2.stores,
    options = _ref2.options,
    filtersRef = _ref2.filtersRef,
    disabled = _ref2.disabled,
    onReady = _ref2.onReady,
    className = _ref2.className,
    style = _ref2.style,
    mapClassName = _ref2.mapClassName,
    mapStyle = _ref2.mapStyle,
    children = _ref2.children;
  var wrapperRef = useRef(null);
  var mapRef = useRef(null);
  useStoreLocator({
    stores: stores,
    options: options,
    filtersRef: filtersRef,
    mapRef: mapRef,
    wrapperRef: wrapperRef,
    disabled: disabled,
    onReady: onReady
  });
  return createElement('div', {
    ref: wrapperRef,
    className: className,
    style: style
  }, children, createElement('div', {
    ref: mapRef,
    className: mapClassName,
    style: mapStyle != null ? mapStyle : {
      minHeight: 400
    }
  }));
};

export { StoreLocatorMap, useStoreLocator };
