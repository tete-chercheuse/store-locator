import type { StoreLocatorResolvedOptions } from '../types';
/**
 * Style Bright public d'OpenFreeMap : sans clé d'API, sans quota.
 *
 * Ce n'est plus le défaut — voir `src/styles/default-style.ts` — mais il reste
 * exporté pour pouvoir y revenir en une ligne : `map: { style: OPENFREEMAP_BRIGHT }`.
 */
export declare const OPENFREEMAP_BRIGHT = "https://tiles.openfreemap.org/styles/bright";
declare const defaultOptions: StoreLocatorResolvedOptions;
export default defaultOptions;
