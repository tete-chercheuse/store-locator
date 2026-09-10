/**
 * Traduction du contrat public d'icône vers les `MarkerOptions` de MapLibre.
 *
 * N'importe aucune valeur de `maplibre-gl` (types seulement) : ce module est
 * testable sans mock. Aucun ancrage implicite n'est imposé — l'ancrage MapLibre
 * par défaut (`center`) s'applique si l'appelant n'en fournit pas.
 */
import type { MarkerOptions } from 'maplibre-gl';
import type { StoreLocatorIconValue } from '../types';
export declare const normalizeIcon: (value: StoreLocatorIconValue | undefined) => MarkerOptions | null;
