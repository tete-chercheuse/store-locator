import type {
  StoreLocatorFeature,
  StoreLocatorFeatureCollection,
  StoreLocatorFilters,
  StoreLocatorProperties,
  StoreLocatorStoresInput,
} from '../types';

type AnyRecord = Record<string, unknown>;

const LATITUDE_KEYS = ['lat', 'latitude'] as const;
const LONGITUDE_KEYS = ['lng', 'lon', 'longitude'] as const;

export const isPlainObject = (value: unknown): value is AnyRecord => {
  return Object.prototype.toString.call(value) === '[object Object]';
};

export const isDomElement = <T extends Element = HTMLElement>(value: unknown): value is T => {
  return value !== null && typeof value === 'object' && 'nodeType' in value && (value as { nodeType: number }).nodeType === 1;
};

export const isFormElement = (value: unknown): value is HTMLFormElement => {
  if(!isDomElement<HTMLFormElement>(value)) {
    return false;
  }

  return value.tagName === 'FORM';
};

export const extend = <T extends object>(deep = false, ...objects: Array<AnyRecord | null | undefined>): T => {
  const extended: AnyRecord = {};

  const merge = (object: AnyRecord | null | undefined): void => {
    if(!object) {
      return;
    }

    for(const prop in object) {
      if(!Object.prototype.hasOwnProperty.call(object, prop)) {
        continue;
      }

      const value = object[prop];

      if(deep && isPlainObject(value)) {
        extended[prop] = extend(true, extended[prop] as AnyRecord | undefined, value);
        continue;
      }

      extended[prop] = value;
    }
  };

  objects.forEach(merge);

  return extended as T;
};

export const formValues = (form: HTMLFormElement): StoreLocatorFilters => {
  const formData = new FormData(form);
  const values: StoreLocatorFilters = {};

  formData.forEach((rawValue, key) => {
    const value = `${rawValue}`;

    if(!Reflect.has(values, key)) {
      values[key] = value;
      return;
    }

    if(!Array.isArray(values[key])) {
      values[key] = [values[key]];
    }

    (values[key] as string[]).push(value);
  });

  return values;
};

export const resolveElement = <T extends Element = HTMLElement>(
  target: string | T | null | undefined,
  root: ParentNode | null = null,
  fallbackToId = false,
): T | null => {
  if(isDomElement<T>(target)) {
    return target;
  }

  if(typeof document === 'undefined' || typeof target !== 'string') {
    return null;
  }

  const lookupRoot = root && 'querySelector' in root ? root : document;

  if(fallbackToId) {
    const byId = document.getElementById(target);

    if(byId) {
      return byId as unknown as T;
    }
  }

  return lookupRoot.querySelector<T>(target);
};

const getNumericValue = (object: Record<string, unknown>, keys: readonly string[]): number | null => {
  for(const key of keys) {
    const rawValue = object[key];

    if(rawValue === null || rawValue === undefined || rawValue === '') {
      continue;
    }

    const value = Number(rawValue);

    if(!Number.isNaN(value)) {
      return value;
    }
  }

  return null;
};

const isGeoJsonFeature = <P extends StoreLocatorProperties>(store: unknown): store is StoreLocatorFeature<P> => {
  if(!isPlainObject(store)) {
    return false;
  }

  if(store.type !== 'Feature' || !isPlainObject(store.geometry)) {
    return false;
  }

  return store.geometry.type === 'Point' && Array.isArray(store.geometry.coordinates);
};

export const normalizeStores = <P extends StoreLocatorProperties>(
  stores: StoreLocatorStoresInput<P> | null | undefined,
): StoreLocatorFeatureCollection<P> | null => {
  if(stores === null || stores === undefined) {
    return null;
  }

  if(isPlainObject(stores) && stores.type === 'FeatureCollection' && Array.isArray(stores.features)) {
    return stores as StoreLocatorFeatureCollection<P>;
  }

  if(!Array.isArray(stores)) {
    throw new Error('[store-locator] - Invalid stores format');
  }

  if(stores.every((store) => isGeoJsonFeature<P>(store))) {
    return {
      type:     'FeatureCollection',
      features: [...stores],
    };
  }

  return {
    type:     'FeatureCollection',
    features: stores.map((store) => {
      if(!isPlainObject(store)) {
        throw new Error('[store-locator] - Invalid stores format');
      }

      const lat = getNumericValue(store, LATITUDE_KEYS);
      const lng = getNumericValue(store, LONGITUDE_KEYS);

      if(lat === null || lng === null) {
        throw new Error('[store-locator] - Invalid store coordinates');
      }

      return {
        type:       'Feature',
        geometry:   {
          type:        'Point',
          coordinates: [lng, lat],
        },
        properties: { ...store } as P,
      };
    }),
  };
};
