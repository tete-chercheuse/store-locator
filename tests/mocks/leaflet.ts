import { vi } from 'vitest';

type EventHandler = (...args: unknown[]) => void;

export class Popup {
  content: string | HTMLElement = '';

  constructor(public readonly options?: Record<string, unknown>) {}

  setContent(content: string | HTMLElement) {
    this.content = content;
    return this;
  }
}

export class Icon {
  constructor(public readonly options?: Record<string, unknown>) {}
}

export class DivIcon extends Icon {}

export interface MockMarker {
  latlng: { lat: number; lng: number; };
  popup: string | HTMLElement | Popup | null;
  icon: Icon | DivIcon | null;
  bindPopup: ReturnType<typeof vi.fn>;
  setIcon: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  getLatLng: ReturnType<typeof vi.fn>;
  trigger: (event: string) => void;
}

export interface MockClusterGroup {
  options: Record<string, unknown> | undefined;
  layers: unknown[];
  clearLayers: ReturnType<typeof vi.fn>;
  addLayer: ReturnType<typeof vi.fn>;
  getBounds: ReturnType<typeof vi.fn>;
}

export interface MockMap {
  container: Element | string;
  options: Record<string, unknown> | undefined;
  layers: unknown[];
  handlers: Record<string, EventHandler[]>;
  addLayer: ReturnType<typeof vi.fn>;
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  fitBounds: ReturnType<typeof vi.fn>;
  setView: ReturnType<typeof vi.fn>;
  invalidateSize: ReturnType<typeof vi.fn>;
  scrollWheelZoom: {
    enable: ReturnType<typeof vi.fn>;
    disable: ReturnType<typeof vi.fn>;
  };
  trigger: (event: string) => void;
}

export const leafletMockState = {
  maps: [] as MockMap[],
  markers: [] as MockMarker[],
  clusters: [] as MockClusterGroup[],
  geoJSONCalls: [] as Array<{
    stores: Record<string, unknown>;
    options: Record<string, unknown>;
    layer: Record<string, unknown>;
  }>,
  tileLayers: [] as Array<{ url: string; options: Record<string, unknown> | undefined; addTo: ReturnType<typeof vi.fn>; }>,
  locateControls: [] as Array<{ addTo: ReturnType<typeof vi.fn>; }>,
};

const createMap = (container: Element | string, options?: Record<string, unknown>): MockMap => {
  const handlers: Record<string, EventHandler[]> = {};
  const layers: unknown[] = [];

  const map: MockMap = {
    container,
    options,
    layers,
    handlers,
    addLayer: vi.fn((layer: unknown) => {
      layers.push(layer);
      return map;
    }),
    on: vi.fn((event: string, handler: EventHandler) => {
      handlers[event] ??= [];
      handlers[event].push(handler);
      return map;
    }),
    off: vi.fn(() => map),
    remove: vi.fn(() => undefined),
    fitBounds: vi.fn(() => map),
    setView: vi.fn(() => map),
    invalidateSize: vi.fn(() => map),
    scrollWheelZoom: {
      enable: vi.fn(),
      disable: vi.fn(),
    },
    trigger: (event: string) => {
      for(const handler of handlers[event] ?? []) {
        handler();
      }
    },
  };

  leafletMockState.maps.push(map);

  return map;
};

const createMarker = (latlng: { lat: number; lng: number; }): MockMarker => {
  const handlers: Record<string, EventHandler[]> = {};

  const marker: MockMarker = {
    latlng,
    popup: null,
    icon: null,
    bindPopup: vi.fn((popup: string | HTMLElement | Popup) => {
      marker.popup = popup;
      return marker;
    }),
    setIcon: vi.fn((icon: Icon | DivIcon) => {
      marker.icon = icon;
      return marker;
    }),
    on: vi.fn((event: string, handler: EventHandler) => {
      handlers[event] ??= [];
      handlers[event].push(handler);
      return marker;
    }),
    getLatLng: vi.fn(() => latlng),
    trigger: (event: string) => {
      for(const handler of handlers[event] ?? []) {
        handler();
      }
    },
  };

  leafletMockState.markers.push(marker);

  return marker;
};

const createClusterGroup = (options?: Record<string, unknown>): MockClusterGroup => {
  const cluster: MockClusterGroup = {
    options,
    layers: [],
    clearLayers: vi.fn(() => {
      cluster.layers.length = 0;
    }),
    addLayer: vi.fn((layer: unknown) => {
      cluster.layers.push(layer);
      return cluster;
    }),
    getBounds: vi.fn(() => ({
      type: 'mock-bounds',
      layerCount: cluster.layers.length,
    })),
  };

  leafletMockState.clusters.push(cluster);

  return cluster;
};

const map = vi.fn((container: Element | string, options?: Record<string, unknown>) => {
  return createMap(container, options);
});

const tileLayer = vi.fn((url: string, options?: Record<string, unknown>) => {
  const layer = {
    url,
    options,
    addTo: vi.fn(() => layer),
  };

  leafletMockState.tileLayers.push(layer);

  return layer;
});

const marker = vi.fn((latlng: { lat: number; lng: number; }) => {
  return createMarker(latlng);
});

const markerClusterGroup = vi.fn((options?: Record<string, unknown>) => {
  return createClusterGroup(options);
});

const geoJSON = vi.fn((stores: { features?: Array<Record<string, unknown>>; }, options: { pointToLayer?: (feature: any, latlng: { lat: number; lng: number; }) => unknown; } = {}) => {
  const markers = (stores.features ?? []).map((feature) => {
    const coordinates = (feature.geometry as { coordinates: [number, number]; }).coordinates;
    const latlng = { lat: coordinates[1], lng: coordinates[0] };

    return options.pointToLayer?.(feature, latlng);
  });

  const layer = {
    type: 'geojson',
    stores,
    options,
    markers,
  };

  leafletMockState.geoJSONCalls.push({ stores, options, layer });

  return layer;
});

const popup = vi.fn((options?: Record<string, unknown>) => new Popup(options));
const icon = vi.fn((options?: Record<string, unknown>) => new Icon(options));
const divIcon = vi.fn((options?: Record<string, unknown>) => new DivIcon(options));

const control = {
  locate: vi.fn(() => {
    const locateControl = {
      addTo: vi.fn(() => locateControl),
    };

    leafletMockState.locateControls.push(locateControl);

    return locateControl;
  }),
};

const leaflet = {
  map,
  tileLayer,
  marker,
  markerClusterGroup,
  geoJSON,
  popup,
  icon,
  divIcon,
  control,
  Popup,
  Icon,
  DivIcon,
};

export const resetLeafletMocks = () => {
  leafletMockState.maps.length = 0;
  leafletMockState.markers.length = 0;
  leafletMockState.clusters.length = 0;
  leafletMockState.geoJSONCalls.length = 0;
  leafletMockState.tileLayers.length = 0;
  leafletMockState.locateControls.length = 0;

  map.mockClear();
  tileLayer.mockClear();
  marker.mockClear();
  markerClusterGroup.mockClear();
  geoJSON.mockClear();
  popup.mockClear();
  icon.mockClear();
  divIcon.mockClear();
  control.locate.mockClear();
};

export default leaflet;
