import 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.locatecontrol';

import { extend, formValues } from './utils/utils';
import defaultOptions from './utils/default-options';

/**
 * Store Locator
 * @module StoreLocator
 */
export default class StoreLocator {

  options = defaultOptions;
  map = null;
  clusters = null;
  filters = null;

  /**
   * Instanciate the constructor
   * @constructor
   * @param {Object} options Store Locator options
   */
  constructor(options) {

    this.options = extend(true, defaultOptions, options);

    if(this.options.stores === null) {
      throw new Error('[store-locator] - No stores available');
    }

    this._initMap();
    this._initFilters();
  }

  refreshClusters(filters = null, recenter = this.options.map.refreshRecenter) {

    this.clusters.clearLayers();

    let stores = { ...this.options.stores };

    if(filters) {

      stores.features = stores.features.filter(store => {
        let keep = false;

        Object.entries(filters).forEach(([filter, value]) => {
          if(!value.length || (Array.isArray(value) && value.includes(store.properties[filter])) || (store.properties[filter].includes(value))) {
            keep = true;
          }
        });

        return keep;
      });
    }

    if(stores.features.length) {

      const geoJson = L.geoJSON(stores, {
        pointToLayer: (feature, latlng) => {

          let marker = L.marker(latlng);

          if(typeof this.options.map.markers.popup === 'function') {

            const popup = this.options.map.markers.popup(feature);

            if(typeof this.options.map.markers.popup === 'string' || popup instanceof L.Popup) {
              marker.bindPopup(popup);
            }
          }

          if(typeof this.options.map.markers.icon === 'function') {

            const icon = this.options.map.markers.icon(feature);

            if(icon instanceof L.Icon) {
              marker.setIcon(icon);
            }
          }

          marker.on('click', () => this.map.setView(marker.getLatLng()));

          return marker;
        },
      });

      this.clusters.addLayer(geoJson);

      if(recenter) {
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
      disableClusteringAtZoom: 12,
    });

    this.map.addLayer(this.clusters);

    this.refreshClusters(null, true);
  }

  _initFilters() {

    this.filters = document.querySelector(this.options.selectors.filters);

    if(this.filters.elements.length) {

      for(let field of this.filters.elements) {
        field.addEventListener('change', () => this.refreshClusters(formValues(this.filters)));
      }
    }
  }
}
