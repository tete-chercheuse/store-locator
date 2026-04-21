import 'leaflet';

declare module 'leaflet-gesture-handling';
declare module 'leaflet.markercluster';
declare module 'leaflet.locatecontrol';

declare module '*.css';

declare module 'leaflet' {
  interface MapOptions {
    gestureHandling?: boolean;
  }

  interface MarkerClusterGroupOptions extends LayerOptions {
    showCoverageOnHover?: boolean;
    spiderfyOnMaxZoom?: boolean;
    disableClusteringAtZoom?: number;
  }

  function markerClusterGroup(options?: MarkerClusterGroupOptions): FeatureGroup<Layer>;

  namespace control {
    function locate(options?: ControlOptions & Record<string, unknown>): Control;
  }
}
