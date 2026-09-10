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
export declare const POPUP_GAP = 8;
export type PopupOffsetByAnchor = {
    [_ in PositionAnchor]: PointLike;
};
/**
 * Construit la table de décalages pour une icône de taille et d'ancrage donnés.
 *
 * Retourne `null` quand la taille est inconnue — une icône fournie sous forme
 * d'élément DOM brut, par exemple, dont les dimensions ne sont pas mesurables
 * avant insertion dans le document. MapLibre garde alors la main.
 */
export declare const popupOffsetForIcon: (size: [number, number] | undefined, anchor: MarkerOptions["anchor"]) => PopupOffsetByAnchor | null;
