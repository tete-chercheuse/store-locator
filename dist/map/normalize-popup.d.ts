/**
 * Traduction du contrat public de popup vers le contenu et les `PopupOptions`
 * de MapLibre.
 *
 * L'instance `Popup` est construite ailleurs (`map/marker-sync.ts`) afin que ce
 * module n'importe aucune valeur de `maplibre-gl` et reste testable sans mock.
 */
import type { PopupOptions } from 'maplibre-gl';
import type { StoreLocatorPopupContent, StoreLocatorPopupValue } from '../types';
export interface NormalizedPopup {
    content: StoreLocatorPopupContent;
    options: PopupOptions;
}
export declare const normalizePopup: (value: StoreLocatorPopupValue | undefined) => NormalizedPopup | null;
