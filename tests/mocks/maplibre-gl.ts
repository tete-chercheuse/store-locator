import { vi } from 'vitest';
import type { Mock } from 'vitest';

/**
 * Ce module exporte une classe nommée `Map`, qui masque le `Map` natif dans
 * toute la portée du fichier. On capture la référence native avant l'ombrage.
 */
const NativeMap = globalThis.Map;

type EventHandler = (...args: unknown[]) => void;

/**
 * Les deux méthodes sont typées par leur signature concrète plutôt qu'en
 * `ReturnType<typeof vi.fn>`, qui vaut `any` et rendrait toute garde de dérive
 * décorative — `any` étant assignable à n'importe quoi.
 */
export interface MockGeoJSONSource {
  id: string;
  data: Record<string, unknown>;
  options: Record<string, unknown>;
  setData: Mock<(data: Record<string, unknown>) => Promise<void>>;
  getClusterExpansionZoom: Mock<(clusterId: number) => Promise<number>>;
}

export interface MockMap {
  container: HTMLElement;
  options: Record<string, unknown>;
  sources: Map<string, MockGeoJSONSource>;
  layers: Array<Record<string, unknown>>;
  controls: unknown[];
  handlers: Record<string, EventHandler[]>;
  removed: boolean;
  canvas: { style: CSSStyleDeclaration; };
  on: ReturnType<typeof vi.fn>;
  off: ReturnType<typeof vi.fn>;
  addControl: ReturnType<typeof vi.fn>;
  addSource: ReturnType<typeof vi.fn>;
  getSource: ReturnType<typeof vi.fn>;
  removeSource: ReturnType<typeof vi.fn>;
  addLayer: ReturnType<typeof vi.fn>;
  getLayer: ReturnType<typeof vi.fn>;
  removeLayer: ReturnType<typeof vi.fn>;
  querySourceFeatures: ReturnType<typeof vi.fn>;
  getCanvas: ReturnType<typeof vi.fn>;
  getContainer: ReturnType<typeof vi.fn>;
  easeTo: ReturnType<typeof vi.fn>;
  fitBounds: ReturnType<typeof vi.fn>;
  resize: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
  isSourceLoaded: ReturnType<typeof vi.fn>;
  isStyleLoaded: ReturnType<typeof vi.fn>;
  loaded: ReturnType<typeof vi.fn>;
  /** Déclenche manuellement un événement. `layerId` cible les handlers de couche. */
  trigger: (event: string, payload?: unknown, layerId?: string) => void;
}

export interface MockMarker {
  options: Record<string, unknown> | undefined;
  lngLat: [number, number] | null;
  popup: MockPopup | null;
  element: HTMLElement;
  added: boolean;
  removed: boolean;
  setLngLat: ReturnType<typeof vi.fn>;
  setPopup: ReturnType<typeof vi.fn>;
  getElement: ReturnType<typeof vi.fn>;
  addTo: ReturnType<typeof vi.fn>;
  remove: ReturnType<typeof vi.fn>;
}

export interface MockPopup {
  options: Record<string, unknown> | undefined;
  html: string | null;
  domContent: HTMLElement | null;
  setHTML: ReturnType<typeof vi.fn>;
  setDOMContent: ReturnType<typeof vi.fn>;
}

export const mapLibreMockState = {
  maps: [] as MockMap[],
  markers: [] as MockMarker[],
  popups: [] as MockPopup[],
  navigationControls: [] as Array<Record<string, unknown> | undefined>,
  geolocateControls: [] as Array<Record<string, unknown> | undefined>,
  /** Features renvoyées par `querySourceFeatures`. Alimenté par les tests. */
  sourceFeatures: [] as Array<Record<string, unknown>>,
  /** Quand `true`, chaque `Map` émet `load` au microtask suivant sa création. */
  autoLoad: true,
};

const layerEventKey = (event: string, layerId: string): string => `${event}::${layerId}`;

class MockMapImpl implements MockMap {
  container: HTMLElement;
  options: Record<string, unknown>;
  sources = new NativeMap<string, MockGeoJSONSource>();
  layers: Array<Record<string, unknown>> = [];
  controls: unknown[] = [];
  handlers: Record<string, EventHandler[]> = {};
  removed = false;

  // MapLibre v6 retourne un `Subscription`, pas la carte. Rendre `this` ici
  // laisserait passer un chaînage à la Leaflet — `map.on(…).on(…)` — qui est
  // fatal en navigateur.
  on = vi.fn((event: string, second: unknown, third?: unknown) => {
    const isLayerHandler = typeof second === 'string';
    const key = isLayerHandler ? layerEventKey(event, second) : event;
    const handler = (isLayerHandler ? third : second) as EventHandler;

    this.handlers[key] ??= [];
    this.handlers[key].push(handler);

    return { unsubscribe: () => this.off(event, handler) };
  });

  // Détache réellement : un `off` sans effet rendrait creuse toute assertion
  // de nettoyage des écouteurs.
  off = vi.fn((event: string, handler: EventHandler, layerId?: string) => {
    const key = layerId ? layerEventKey(event, layerId) : event;
    const handlers = this.handlers[key];
    const index = handlers?.indexOf(handler) ?? -1;

    if(handlers && index !== -1) {
      handlers.splice(index, 1);
    }

    return this;
  });

  addControl = vi.fn((control: unknown) => {
    this.controls.push(control);
    return this;
  });

  addSource = vi.fn((id: string, options: Record<string, unknown>) => {
    const source: MockGeoJSONSource = {
      id,
      data: options.data as Record<string, unknown>,
      options,
      // La vraie méthode retourne `Promise<void>` en v6 et a perdu son second
      // paramètre. La mise à jour est ici synchrone — simplification assumée,
      // pour qu'un test puisse observer les données juste après l'appel.
      setData: vi.fn((data: Record<string, unknown>): Promise<void> => {
        source.data = data;
        return Promise.resolve();
      }),
      getClusterExpansionZoom: vi.fn(() => Promise.resolve(12)),
    };

    this.sources.set(id, source);

    return this;
  });

  getSource = vi.fn((id: string) => this.sources.get(id));

  removeSource = vi.fn((id: string) => {
    this.sources.delete(id);
    return this;
  });

  addLayer = vi.fn((layer: Record<string, unknown>) => {
    this.layers.push(layer);
    return this;
  });

  getLayer = vi.fn((id: string) => this.layers.find((layer) => layer.id === id));

  removeLayer = vi.fn((id: string) => {
    this.layers = this.layers.filter((layer) => layer.id !== id);
    return this;
  });

  // Copie défensive : la vraie méthode retourne un tableau neuf, et une
  // implémentation qui trierait le résultat corromprait sinon l'état partagé.
  querySourceFeatures = vi.fn(() => [...mapLibreMockState.sourceFeatures]);

  // Instance stable, comme le vrai `HTMLCanvasElement`. Renvoyer un objet neuf
  // à chaque appel rendrait invisible toute écriture sur `style.cursor`.
  canvas = { style: {} as CSSStyleDeclaration };
  getCanvas = vi.fn(() => this.canvas);

  // Le vrai `getContainer()` retourne l'élément, jamais l'identifiant : MapLibre
  // résout la chaîne dès son constructeur, et lève si elle ne désigne rien.
  getContainer = vi.fn(() => this.container);

  easeTo = vi.fn(() => this);
  fitBounds = vi.fn(() => this);
  resize = vi.fn(() => this);

  remove = vi.fn(() => {
    this.removed = true;
    // La vraie méthode démonte tout. Sans cela, une assertion de destruction
    // passerait alors que les écouteurs et les sources survivent.
    this.handlers = {};
    this.sources.clear();
    this.layers = [];
  });

  isSourceLoaded = vi.fn(() => true);
  isStyleLoaded = vi.fn(() => true);
  loaded = vi.fn(() => true);

  constructor(options: Record<string, unknown>) {
    const container = typeof options.container === 'string'
      ? document.getElementById(options.container)
      : options.container as HTMLElement;

    if(!container) {
      throw new Error(`Container '${options.container as string}' not found.`);
    }

    this.container = container;
    this.options = options;

    mapLibreMockState.maps.push(this);

    if(mapLibreMockState.autoLoad) {
      queueMicrotask(() => this.trigger('load'));
    }
  }

  trigger(event: string, payload?: unknown, layerId?: string): void {
    const key = layerId ? layerEventKey(event, layerId) : event;

    for(const handler of this.handlers[key] ?? []) {
      handler(payload);
    }
  }
}

class MockMarkerImpl implements MockMarker {
  options: Record<string, unknown> | undefined;
  lngLat: [number, number] | null = null;
  popup: MockPopup | null = null;
  element: HTMLElement;
  added = false;
  removed = false;

  setLngLat = vi.fn((lngLat: [number, number]) => {
    this.lngLat = lngLat;
    return this;
  });

  setPopup = vi.fn((popup: MockPopup) => {
    this.popup = popup;
    return this;
  });

  getElement = vi.fn(() => this.element);

  addTo = vi.fn(() => {
    this.added = true;
    return this;
  });

  remove = vi.fn(() => {
    this.removed = true;
    this.added = false;
    return this;
  });

  constructor(options?: Record<string, unknown>) {
    this.options = options;
    this.element = (options?.element as HTMLElement | undefined) ?? document.createElement('div');

    mapLibreMockState.markers.push(this);
  }
}

class MockPopupImpl implements MockPopup {
  options: Record<string, unknown> | undefined;
  html: string | null = null;
  domContent: HTMLElement | null = null;

  setHTML = vi.fn((html: string) => {
    this.html = html;
    return this;
  });

  setDOMContent = vi.fn((node: HTMLElement) => {
    this.domContent = node;
    return this;
  });

  constructor(options?: Record<string, unknown>) {
    this.options = options;
    mapLibreMockState.popups.push(this);
  }
}

class MockNavigationControl {
  constructor(public readonly options?: Record<string, unknown>) {
    mapLibreMockState.navigationControls.push(options);
  }
}

class MockGeolocateControl {
  constructor(public readonly options?: Record<string, unknown>) {
    mapLibreMockState.geolocateControls.push(options);
  }
}

export const resetMapLibreMocks = (): void => {
  mapLibreMockState.maps.length = 0;
  mapLibreMockState.markers.length = 0;
  mapLibreMockState.popups.length = 0;
  mapLibreMockState.navigationControls.length = 0;
  mapLibreMockState.geolocateControls.length = 0;
  mapLibreMockState.sourceFeatures.length = 0;
  mapLibreMockState.autoLoad = true;
};

export const Map = MockMapImpl;
export const Marker = MockMarkerImpl;
export const Popup = MockPopupImpl;
export const NavigationControl = MockNavigationControl;
export const GeolocateControl = MockGeolocateControl;

/**
 * Gardes de dérive.
 *
 * `tsconfig.json` ne couvre que `src/**`, donc rien ne relie ce mock au vrai
 * type `maplibre-gl`. Sans ces assertions, une divergence de signature reste
 * invisible : c'est exactement ainsi qu'un test peut rester vert pendant que
 * la librairie casse en navigateur.
 *
 * L'assignation par méthode mord là où un `extends` sur la classe entière
 * ne mordait pas — les champs `vi.fn` portent des signatures trop permissives
 * pour qu'un test conditionnel discrimine.
 *
 * Contrôle : `./scripts/check-mock-drift.sh`
 */
declare const __map: MockMapImpl;
declare const __source: MockGeoJSONSource;

/** `Map.on` retourne un `Subscription` en v6, pas la carte. */
export const __driftOn: ReturnType<import('maplibre-gl').Map['on']> =
  null as unknown as ReturnType<typeof __map.on>;

/** `GeoJSONSource.setData` retourne `Promise<void>` en v6. */
export const __driftSetData: ReturnType<import('maplibre-gl').GeoJSONSource['setData']> =
  null as unknown as ReturnType<typeof __source.setData>;

/** `getClusterExpansionZoom` est passé en promesse. */
export const __driftClusterZoom: ReturnType<import('maplibre-gl').GeoJSONSource['getClusterExpansionZoom']> =
  null as unknown as ReturnType<typeof __source.getClusterExpansionZoom>;
