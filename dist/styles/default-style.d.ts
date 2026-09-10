/**
 * Style vectoriel par défaut : une variante de OpenFreeMap Bright.
 *
 * **Données générées — ne pas retoucher à la main.** Repasse par Maputnik, puis :
 *
 * ```bash
 * node scripts/import-style.mjs <ton-export.json>
 * ```
 *
 * Embarqué plutôt que référencé par URL : c'est un aller-retour réseau de moins
 * sur le chemin critique du premier affichage. Pour revenir au style public,
 * `OPENFREEMAP_BRIGHT` reste exporté par la librairie.
 *
 * Polices utilisées : Noto Sans Bold, Noto Sans Italic, Noto Sans Regular.
 * La valeur par défaut de `clusters.textFont` doit figurer dans cette liste,
 * sinon le compteur des clusters ne s'affichera pas.
 */
import type { StyleSpecification } from 'maplibre-gl';
declare const style: StyleSpecification;
export default style;
