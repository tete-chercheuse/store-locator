/**
 * Calcul du décalage de popup à partir de la géométrie de l'icône.
 *
 * MapLibre ne le fait pas pour un élément personnalisé. Son `Marker.setPopup`
 * n'applique sa table de décalages par ancrage que si `_defaultMarker` est
 * vrai ; avec un `element` fourni — notre cas systématique — il retombe sur
 * l'offset du marqueur, généralement `[0, 0]`. La popup s'ancre alors sur la
 * coordonnée elle-même, c'est-à-dire par-dessus l'icône.
 *
 * Leaflet dérivait ce décalage de `iconSize` et `popupAnchor`. Ce module
 * rétablit le même principe : la popup se place juste à l'extérieur de la
 * boîte de l'icône, du côté correspondant à l'ancrage que MapLibre a choisi.
 *
 * Le décalage est retourné sous forme d'objet indexé par ancrage, et non de
 * simple tuple : c'est ce qui permet à la popup de rester correctement placée
 * quand MapLibre la fait basculer, par exemple près du bord haut de la carte.
 *
 * Module pur : aucun import runtime, donc testable sans mock.
 */
import type { MarkerOptions, PointLike, PositionAnchor } from 'maplibre-gl';

/** Espace laissé entre le bord de l'icône et celui de la popup, en pixels. */
export const POPUP_GAP = 8;

export type PopupOffsetByAnchor = { [_ in PositionAnchor]: PointLike; };

/**
 * Position du point d'ancrage à l'intérieur de l'élément, mesurée depuis son
 * coin haut-gauche. MapLibre place ce point sur la coordonnée géographique.
 */
const anchorPoint = (
  [width, height]: [number, number],
  anchor: PositionAnchor,
): [number, number] => {
  const x = anchor.includes('left') ? 0 : anchor.includes('right') ? width : width / 2;
  const y = anchor.includes('top') ? 0 : anchor.includes('bottom') ? height : height / 2;

  return [x, y];
};

/**
 * Construit la table de décalages pour une icône de taille et d'ancrage donnés.
 *
 * Retourne `null` quand la taille est inconnue — une icône fournie sous forme
 * d'élément DOM brut, par exemple, dont les dimensions ne sont pas mesurables
 * avant insertion dans le document. MapLibre garde alors la main.
 */
export const popupOffsetForIcon = (
  size: [number, number] | undefined,
  anchor: MarkerOptions['anchor'],
): PopupOffsetByAnchor | null => {
  if(!size) {
    return null;
  }

  const [width, height] = size;
  const [ax, ay] = anchorPoint(size, anchor ?? 'center');

  // Boîte de l'icône, relative à la coordonnée géographique.
  const left = -ax;
  const right = width - ax;
  const top = -ay;
  const bottom = height - ay;
  const midX = (left + right) / 2;
  const midY = (top + bottom) / 2;

  // L'ancrage nomme la partie de la popup posée sur le point : `bottom`
  // signifie donc que la popup s'étend vers le haut, et doit partir du bord
  // supérieur de l'icône.
  return {
    'center': [midX, midY],
    'bottom': [midX, top - POPUP_GAP],
    'bottom-left': [right, top - POPUP_GAP],
    'bottom-right': [left, top - POPUP_GAP],
    'top': [midX, bottom + POPUP_GAP],
    'top-left': [right, bottom + POPUP_GAP],
    'top-right': [left, bottom + POPUP_GAP],
    'left': [right + POPUP_GAP, midY],
    'right': [left - POPUP_GAP, midY],
  };
};
