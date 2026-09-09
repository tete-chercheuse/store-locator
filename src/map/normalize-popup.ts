/**
 * Traduction du contrat public de popup vers le contenu et les `PopupOptions`
 * de MapLibre.
 *
 * L'instance `Popup` est construite ailleurs (`map/marker-sync.ts`) afin que ce
 * module n'importe aucune valeur de `maplibre-gl` et reste testable sans mock.
 */
import type { PopupOptions } from 'maplibre-gl';
import type { StoreLocatorPopupContent, StoreLocatorPopupOptions, StoreLocatorPopupValue } from '../types';

export interface NormalizedPopup {
  content: StoreLocatorPopupContent;
  options: PopupOptions;
}

const isHtmlElement = (value: unknown): value is HTMLElement => {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
};

const isPopupOptions = (value: unknown): value is StoreLocatorPopupOptions => {
  return typeof value === 'object' && value !== null && !isHtmlElement(value);
};

export const normalizePopup = (value: StoreLocatorPopupValue | undefined): NormalizedPopup | null => {
  if(value === null || value === undefined) {
    return null;
  }

  if(typeof value === 'string' || isHtmlElement(value)) {
    return { content: value, options: {} };
  }

  if(!isPopupOptions(value)) {
    return null;
  }

  const { content, ...options } = value;

  if(content === null || content === undefined) {
    return null;
  }

  return { content, options };
};
