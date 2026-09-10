/**
 * Images de style manquantes.
 *
 * Les couches POI d'OpenFreeMap Bright tirent le nom de leur icône directement
 * de la donnée des tuiles :
 *
 * ```json
 * "icon-image": ["match", ["get","subclass"], ["florist","furniture"],
 *                ["get","subclass"], ["get","class"]]
 * ```
 *
 * Le vocabulaire `class`/`subclass` d'OpenMapTiles est plus large que les 264
 * icônes du sprite : `bollard`, `bicycle_parking` ou `swimming_pool` n'y sont
 * pas. MapLibre réclame donc des images inexistantes et journalise, une fois par
 * identifiant, un avertissement de plusieurs lignes. L'écart est en amont — le
 * style Bright public porte les mêmes expressions — et touche tout site bâti
 * dessus.
 *
 * On enregistre une image 1×1 transparente pour chaque identifiant réclamé.
 * `_getImagesForIds` retire alors l'identifiant de ses `unresolvedIds` avant la
 * boucle qui appelle `warnOnce` : l'avertissement et l'événement
 * `styleimagemissing` disparaissent tous les deux. Le POI s'affiche avec son
 * libellé sans pictogramme, ce qui est déjà le rendu actuel — seule la console
 * change.
 *
 * Les identifiants restent collectés et lisibles par `unresolvedImages` : un
 * `addImage` oublié dans l'application ne doit pas être noyé par ce silence.
 *
 * Une réserve à connaître : MapLibre ne convoque le résolveur que pour les
 * identifiants absents, donc une image déjà enregistrée par l'application n'est
 * jamais écrasée — mais l'inverse ne tient pas. Si une tuile réclame `bollard`
 * avant que l'application ne l'enregistre, c'est notre pixel qui occupe la
 * place, et son `addImage` lèvera. Dans ce cas, `updateImage` prend le relais,
 * ou `resolveMissingImages: false` rend la main.
 */
import type { Map as MapLibreMap } from 'maplibre-gl';

/** Pixel entièrement transparent, en RGBA. */
const PIXEL_TRANSPARENT = { width: 1, height: 1, data: new Uint8Array(4) };

export const resolveMissingImages = (map: MapLibreMap, collecte: Set<string>): void => {
  map.setMissingStyleImageResolver((id) => {
    collecte.add(id);
    map.addImage(id, PIXEL_TRANSPARENT);
  });
};
