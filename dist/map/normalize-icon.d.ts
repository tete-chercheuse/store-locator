/**
 * Traduction du contrat public d'icône vers les `MarkerOptions` de MapLibre.
 *
 * N'importe aucune valeur de `maplibre-gl` (types seulement) : ce module est
 * testable sans mock. Aucun ancrage implicite n'est imposé — l'ancrage MapLibre
 * par défaut (`center`) s'applique si l'appelant n'en fournit pas.
 */
import type { MarkerOptions } from 'maplibre-gl';
import type { StoreLocatorIconValue } from '../types';
/**
 * Dimensions déclarées de l'icône, quand elles le sont.
 *
 * Exposé parce que le placement de la popup en dérive : sans taille, aucune
 * géométrie à partir de laquelle décaler. Une icône fournie sous forme
 * d'élément DOM brut n'en a pas — ses dimensions ne sont pas mesurables avant
 * insertion dans le document.
 */
export declare const iconSize: (value: StoreLocatorIconValue | undefined) => [number, number] | undefined;
export declare const normalizeIcon: (value: StoreLocatorIconValue | undefined) => MarkerOptions | null;
