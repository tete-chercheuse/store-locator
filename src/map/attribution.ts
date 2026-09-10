/**
 * Repli de l'attribution au chargement.
 *
 * MapLibre affiche son `AttributionControl` **déplié**, même en mode compact :
 * `_updateCompact` pose `maplibregl-compact` et `maplibregl-compact-show`
 * ensemble. Seule la seconde commande l'ouverture, et rien ne la retire avant
 * le premier déplacement de la carte — c'est le rôle de `_updateCompactMinimize`,
 * branché sur `drag`. Sa documentation est explicite : « the attribution control
 * is expanded (regardless of map width) ».
 *
 * Il n'existe pas d'API publique de repli : `_toggleAttribution` est privée et
 * bascule au lieu de replier. On retire donc `maplibregl-compact-show`, ce que
 * `_updateCompactMinimize` fait déjà à l'identique — même classe, même absence
 * de retouche à l'attribut `open` du `<details>`, dont dépend le basculement au
 * clic. Le repli emprunte ainsi le chemin de MapLibre lui-même.
 *
 * Le moment, lui, dépend de la façon dont l'attribution se remplit :
 *
 * - avec un `customAttribution` — le défaut de MapLibre — le contrôle a du
 *   contenu dès son `onAdd`, donc les deux classes sont déjà posées quand la
 *   carte revient du constructeur. D'où l'appel synchrone ;
 * - sans contenu au départ, `maplibregl-attrib-empty` bloque `_updateCompact` ;
 *   les classes n'arrivent qu'au premier `styledata` porteur d'attributions.
 *   Notre écouteur, enregistré après celui du contrôle, passe dans la même
 *   dépêche : aucun affichage déplié transitoire.
 */
import type { Map as MapLibreMap } from 'maplibre-gl';

const ATTRIBUTION = '.maplibregl-ctrl-attrib';
const COMPACT = 'maplibregl-compact';
const COMPACT_SHOW = 'maplibregl-compact-show';

export const collapseAttribution = (map: MapLibreMap): void => {
  const replier = (): void => {
    const controle = map.getContainer().querySelector(ATTRIBUTION);

    if(!controle) {
      return;
    }

    controle.classList.remove(COMPACT_SHOW);

    // Une fois `maplibregl-compact` posée, la branche d'ajout de
    // `_updateCompact` est gardée par son absence : elle ne repose plus rien.
    // Le repli tient donc seul, et se désabonner évite de refermer dans le dos
    // de qui vient d'ouvrir le panneau.
    if(controle.classList.contains(COMPACT)) {
      subscription.unsubscribe();
    }
  };

  const subscription = map.on('styledata', replier);

  replier();
};
