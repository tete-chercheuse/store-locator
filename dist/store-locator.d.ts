import type { Map as MapLibreMap } from 'maplibre-gl';
import type { StoreLocatorFilters, StoreLocatorOptions, StoreLocatorProperties, StoreLocatorResolvedOptions, StoreLocatorStoresInput } from './types';
import { OPENFREEMAP_BRIGHT } from './utils/default-options';
/**
 * Store Locator
 *
 * **Le CSS de MapLibre n'est pas importé par ce module** : c'est à l'application
 * de le charger, soit `import 'maplibre-gl/dist/maplibre-gl.css'` avec un
 * bundler, soit une balise `<link>` sans bundler.
 *
 * L'importer ici casserait le chemin sans bundler. microbundle externalise
 * `maplibre-gl`, spécificateur CSS compris, qui survit donc tel quel dans le
 * bundle publié ; une importmap ne peut pas le résoudre, un `.css` ne pouvant
 * pas être servi comme module script. Or c'est exactement le chemin
 * d'installation que le README annonce, depuis GitHub et sans étape de build.
 *
 * @module StoreLocator
 */
export default class StoreLocator<P extends StoreLocatorProperties = StoreLocatorProperties> {
    options: StoreLocatorResolvedOptions<P>;
    map: MapLibreMap | null;
    filters: HTMLFormElement | null;
    private markerSync;
    private container;
    private styleLoaded;
    private isDestroyed;
    private pending;
    private readonly readyPromise;
    private resolveReady;
    private filterFields;
    private filterChangeHandler;
    /**
     * `true` dès que `destroy()` a été appelé.
     *
     * `destroy()` résout délibérément `whenReady()` pour ne laisser aucun
     * appelant en attente. Sans ce drapeau, un consommateur qui attend la
     * promesse ne pourrait pas distinguer « la carte est prête » de
     * « l'instance a été détruite » — les deux résolvent avec la même valeur.
     */
    get destroyed(): boolean;
    /**
     * Instancie le store locator et démarre la carte.
     * @param options Options du store locator
     */
    constructor(options: StoreLocatorOptions<P>);
    /**
     * Résout quand le style MapLibre est chargé et que les couches sont en place.
     * Résout également, avec l'instance détruite, si `destroy()` est appelé avant.
     */
    whenReady(): Promise<this>;
    /** Remplace les données affichées et rafraîchit la carte. */
    setStores(stores: StoreLocatorStoresInput<P>, filters?: StoreLocatorFilters | null, recenter?: boolean, maxZoom?: number | null): void;
    /** Associe ou réassocie le formulaire de filtres. */
    setFilters(filters?: string | HTMLFormElement | null, wrapper?: string | HTMLElement | null): void;
    /** Réapplique les filtres à la source et resynchronise les marqueurs. */
    refresh(filters?: StoreLocatorFilters | null, recenter?: boolean, maxZoom?: number | null): void;
    /** Relance le calcul de taille de la carte. Utile après un affichage différé. */
    resize(): void;
    /** Détruit la carte et libère tous les écouteurs. */
    destroy(): void;
    private createOptions;
    private initMap;
    private handleStyleLoad;
    private bindClusterInteractions;
    private fitToCollection;
    private resolveMapElement;
    private resolveWrapperElement;
    private resolvePopup;
    private resolveIcon;
    private detachFilters;
}
export { OPENFREEMAP_BRIGHT };
export type { StoreLocatorBounds, StoreLocatorClusterOptions, StoreLocatorCoordinateStore, StoreLocatorCoordinateValue, StoreLocatorElements, StoreLocatorFeature, StoreLocatorFeatureCollection, StoreLocatorFilterValue, StoreLocatorFilters, StoreLocatorFitBoundsOptions, StoreLocatorIconFactory, StoreLocatorIconOptions, StoreLocatorIconValue, StoreLocatorMapConfig, StoreLocatorMapOptions, StoreLocatorMarkerOptions, StoreLocatorOptions, StoreLocatorPaintValue, StoreLocatorPopupContent, StoreLocatorPopupFactory, StoreLocatorPopupOptions, StoreLocatorPopupValue, StoreLocatorProperties, StoreLocatorResolvedOptions, StoreLocatorSelectors, StoreLocatorStoresInput, } from './types';
