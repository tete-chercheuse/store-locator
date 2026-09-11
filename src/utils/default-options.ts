import type { StoreLocatorMapConfig, StoreLocatorResolvedOptions, StoreLocatorSelectors } from '../types';
import defaultStyle from '../styles/default-style';

/**
 * Style Bright public d'OpenFreeMap : sans clé d'API, sans quota.
 *
 * Ce n'est plus le défaut — voir `src/styles/default-style.ts` — mais il reste
 * exporté pour pouvoir y revenir en une ligne : `map: { style: OPENFREEMAP_BRIGHT }`.
 */
export const OPENFREEMAP_BRIGHT = 'https://tiles.openfreemap.org/styles/bright';

const defaultMapOptions: StoreLocatorMapConfig = {
  refreshRecenter: false,
  initialRecenter: true,
  locate: false,
  navigation: true,
  injectCss: true,
  cssNonce: null,
  workerUrl: null,
  resolveMissingImages: true,
  style: defaultStyle,
  options: {
    zoom: 2,
    maxZoom: 18,
    // Pas de plancher de zoom. `minZoom: 2`, héritée de la v2, écrasait
    // silencieusement le recentrage initial : sur un jeu de données
    // multi-continental, `fitBounds` calculait un zoom de 1,48 qui était
    // ramené à 2, laissant un tiers des magasins hors écran. Un plancher est
    // légitime pour un locator régional — c'est alors à l'appelant de le poser.
    minZoom: 0,
    center: [0, 0],
    cooperativeGestures: true,
    // Pas d'`attributionControl` ici : l'objet fourni *remplace* les défauts de
    // MapLibre au lieu de les compléter, et ferait donc disparaître son
    // `customAttribution`. `compact: true` est déjà le défaut ; le repli au
    // chargement se joue ailleurs — voir `map/attribution.ts`.
  },
  markers: {
    icon: null,
    popup: null,
  },
  clusters: {
    enabled: true,
    radius: 50,
    // Zoom au-delà duquel les points ne sont plus regroupés. Mesuré sur Paris :
    // à 14, un cluster de deux ou trois magasins ne s'ouvrait qu'à z15, soit le
    // niveau de la rue. À 11, il s'ouvre à z12, niveau du quartier.
    maxZoom: 11,
    minPoints: 2,
    color: '#2563eb',
    size: 18,
    strokeColor: '#ffffff',
    strokeWidth: 2,
    textColor: '#ffffff',
    textSize: 12,
    textFont: ['Noto Sans Regular'],
  },
  fitBoundsOptions: {
    padding: 48,
    // Sans plafond, une collection réduite à un seul point donne une emprise
    // dégénérée et `fitBounds` retombe sur le `maxZoom` de la carte, soit 18.
    // Filtrer jusqu'à un unique magasin projetterait donc au niveau du bâtiment,
    // sur des tuiles surzoomées. 16 montre le magasin dans sa rue.
    maxZoom: 16,
  },
};

const defaultSelectors: StoreLocatorSelectors = {
  wrapper: '.store-locator',
  map: 'store-locator-map',
  filters: '.store-locator-filters',
};

const defaultOptions: StoreLocatorResolvedOptions = {
  stores: null,
  map: defaultMapOptions,
  selectors: defaultSelectors,
  elements: {
    wrapper: null,
    map: null,
    filters: null,
  },
};

export default defaultOptions;
