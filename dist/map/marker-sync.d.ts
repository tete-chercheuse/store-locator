import type { Map as MapLibreMap } from 'maplibre-gl';
import type { StoreLocatorFeature, StoreLocatorFeatureCollection, StoreLocatorIconValue, StoreLocatorPopupValue, StoreLocatorProperties } from '../types';
export interface MarkerSyncOptions<P extends StoreLocatorProperties> {
    map: MapLibreMap;
    resolveIcon: (feature: StoreLocatorFeature<P>) => StoreLocatorIconValue | undefined;
    resolvePopup: (feature: StoreLocatorFeature<P>) => StoreLocatorPopupValue | undefined;
    onMarkerClick: (feature: StoreLocatorFeature<P>) => void;
}
export declare class MarkerSync<P extends StoreLocatorProperties> {
    private readonly map;
    private readonly resolveIcon;
    private readonly resolvePopup;
    private readonly onMarkerClick;
    private readonly markers;
    private readonly features;
    private readonly handler;
    private started;
    constructor(options: MarkerSyncOptions<P>);
    start(): void;
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
     */
    setFeatures(collection: StoreLocatorFeatureCollection<P>): void;
    sync(): void;
    destroy(): void;
    private clear;
    /**
     * Retire un marqueur et détache son écouteur.
     *
     * `Marker.remove()` ne détache que ses propres écouteurs. Le nôtre survivrait
     * sur un élément fourni par l'appelant et réutilisé d'un rendu à l'autre,
     * s'y empilant à chaque cycle et retenant l'instance au passage.
     */
    private removeMarker;
    private createMarker;
}
