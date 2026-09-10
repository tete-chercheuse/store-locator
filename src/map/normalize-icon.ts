/**
 * Traduction du contrat public d'icône vers les `MarkerOptions` de MapLibre.
 *
 * N'importe aucune valeur de `maplibre-gl` (types seulement) : ce module est
 * testable sans mock. Aucun ancrage implicite n'est imposé — l'ancrage MapLibre
 * par défaut (`center`) s'applique si l'appelant n'en fournit pas.
 */
import type { MarkerOptions } from 'maplibre-gl';
import type { StoreLocatorIconOptions, StoreLocatorIconValue } from '../types';

const isHtmlElement = (value: unknown): value is HTMLElement => {
  return typeof HTMLElement !== 'undefined' && value instanceof HTMLElement;
};

const isIconOptions = (value: unknown): value is StoreLocatorIconOptions => {
  return typeof value === 'object' && value !== null && !isHtmlElement(value);
};

const createImageElement = (url: string, size?: [number, number]): HTMLImageElement | null => {
  if(typeof document === 'undefined') {
    return null;
  }

  const image = document.createElement('img');

  image.src = url;
  image.alt = '';
  image.style.display = 'block';

  if(size) {
    image.width = size[0];
    image.height = size[1];
    image.style.width = `${size[0]}px`;
    image.style.height = `${size[1]}px`;
  }

  return image;
};

const withMarkerOptions = (
  element: HTMLElement,
  options: StoreLocatorIconOptions,
): MarkerOptions => {
  const markerOptions: MarkerOptions = { element };

  if(options.anchor !== undefined) {
    markerOptions.anchor = options.anchor;
  }

  if(options.offset !== undefined) {
    markerOptions.offset = options.offset;
  }

  if(options.className !== undefined) {
    markerOptions.className = options.className;
  }

  if(options.rotation !== undefined) {
    markerOptions.rotation = options.rotation;
  }

  return markerOptions;
};

/**
 * Dimensions déclarées de l'icône, quand elles le sont.
 *
 * Exposé parce que le placement de la popup en dérive : sans taille, aucune
 * géométrie à partir de laquelle décaler. Une icône fournie sous forme
 * d'élément DOM brut n'en a pas — ses dimensions ne sont pas mesurables avant
 * insertion dans le document.
 */
export const iconSize = (value: StoreLocatorIconValue | undefined): [number, number] | undefined => {
  if(value === null || value === undefined || typeof value === 'string' || isHtmlElement(value)) {
    return undefined;
  }

  return isIconOptions(value) ? value.size : undefined;
};

export const normalizeIcon = (value: StoreLocatorIconValue | undefined): MarkerOptions | null => {
  if(value === null || value === undefined) {
    return null;
  }

  if(typeof value === 'string') {
    const element = createImageElement(value);

    return element ? { element } : null;
  }

  if(isHtmlElement(value)) {
    return { element: value };
  }

  if(!isIconOptions(value)) {
    return null;
  }

  const element = value.element ?? (value.url ? createImageElement(value.url, value.size) : null);

  return element ? withMarkerOptions(element, value) : null;
};
