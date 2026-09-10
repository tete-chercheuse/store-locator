import type { StoreLocatorFeatureCollection, StoreLocatorFilters, StoreLocatorProperties, StoreLocatorStoresInput } from '../types';
type AnyRecord = Record<string, unknown>;
export declare const isPlainObject: (value: unknown) => value is AnyRecord;
export declare const isDomElement: <T extends Element = HTMLElement>(value: unknown) => value is T;
export declare const isFormElement: (value: unknown) => value is HTMLFormElement;
export declare const extend: <T extends object>(deep?: boolean, ...objects: Array<AnyRecord | null | undefined>) => T;
export declare const formValues: (form: HTMLFormElement) => StoreLocatorFilters;
export declare const resolveElement: <T extends Element = HTMLElement>(target: string | T | null | undefined, root?: ParentNode | null, fallbackToId?: boolean) => T | null;
/**
 * Normalise les données d'entrée en `FeatureCollection` GeoJSON.
 *
 * Accepte trois formes : une `FeatureCollection`, un tableau de `Feature`
 * GeoJSON, ou un tableau d'objets plats porteurs de coordonnées. Les trois
 * passent par {@link normalizeFeatures}, qui garantit l'`id` de diff et un
 * sac de propriétés lisible. L'entrée n'est jamais mutée.
 */
export declare const normalizeStores: <P extends StoreLocatorProperties>(stores: StoreLocatorStoresInput<P> | null | undefined) => StoreLocatorFeatureCollection<P> | null;
export {};
