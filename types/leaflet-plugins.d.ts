import 'leaflet';

declare module 'leaflet' {
  interface MapOptions {
    gestureHandling?: boolean;
  }

  interface MarkerClusterGroupOptions extends LayerOptions {
    showCoverageOnHover?: boolean;
    spiderfyOnMaxZoom?: boolean;
    disableClusteringAtZoom?: number;
  }
}
