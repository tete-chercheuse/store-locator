/**
 * Version de `maplibre-gl` dont provient le worker empaqueté dans
 * `dist/store-locator-worker.cjs`.
 *
 * **Donnée générée — ne pas retoucher à la main.** Après une montée de version
 * de `maplibre-gl` : `node scripts/bundle-worker.mjs`.
 *
 * Sert au garde de compatibilité de `map/worker.ts` : le worker et le thread
 * principal échangent par un protocole interne, qu'aucune promesse publique ne
 * stabilise entre versions.
 */
export declare const BUNDLED_WORKER_VERSION = "6.9.0";
