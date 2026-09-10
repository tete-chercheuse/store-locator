import { describe, expect, it } from 'vitest';
import StoreLocator from '../src/store-locator';
import { collapseAttribution } from '../src/map/attribution';
import { Map as MockMapClass, mapLibreMockState } from './mocks/maplibre-gl';
import type { Map as MapLibreMap } from 'maplibre-gl';

const COMPACT = 'maplibregl-compact';
const COMPACT_SHOW = 'maplibregl-compact-show';

const stores = [{ id: 'store-1', name: 'Cafe', lat: 16.2411, lng: -61.5336 }];

const mountMapElement = (): HTMLElement => {
  const element = document.createElement('div');

  document.body.appendChild(element);

  return element;
};

/**
 * Reproduit le DOM que pose `AttributionControl`. `<details>` et `<summary>`
 * sont les balises réelles : le repli laisse `open` en place et ne tient qu'à
 * la classe, c'est donc la structure qu'il faut soumettre au test.
 */
const renderAttribution = (container: HTMLElement, ...classes: string[]): HTMLElement => {
  const controle = document.createElement('details');

  controle.className = ['maplibregl-ctrl', 'maplibregl-ctrl-attrib', ...classes].join(' ');
  controle.setAttribute('open', '');
  controle.appendChild(document.createElement('summary'));
  container.appendChild(controle);

  return controle;
};

/** Une carte du mock, vue comme une `Map` MapLibre par le code testé. */
const createMockMap = (container: HTMLElement): MapLibreMap =>
  new MockMapClass({ container }) as unknown as MapLibreMap;

describe('collapseAttribution', () => {
  it('replie une attribution déjà compacte au moment de l\'appel', () => {
    // Chemin nominal : avec le `customAttribution` par défaut de MapLibre, le
    // contrôle a du contenu dès son `onAdd`, donc les deux classes sont posées
    // avant que la carte ne revienne du constructeur.
    const container = mountMapElement();
    const map = createMockMap(container);
    const attribution = renderAttribution(container, COMPACT, COMPACT_SHOW);

    collapseAttribution(map);

    expect(attribution.classList.contains(COMPACT_SHOW)).toBe(false);
    expect(attribution.classList.contains(COMPACT)).toBe(true);
  });

  it('replie au premier styledata quand le contrôle est encore vide', () => {
    // Sans attribution à afficher, `maplibregl-attrib-empty` bloque
    // `_updateCompact` : les classes n'arrivent qu'avec le premier style porteur
    // d'attributions. Un repli qui ne jouerait qu'à l'appel les manquerait.
    const container = mountMapElement();
    const map = createMockMap(container);

    collapseAttribution(map);

    const attribution = renderAttribution(container, COMPACT, COMPACT_SHOW);

    mapLibreMockState.maps[0].trigger('styledata');

    expect(attribution.classList.contains(COMPACT_SHOW)).toBe(false);
  });

  it('laisse ouvert le panneau que l\'utilisateur vient de déplier', () => {
    // Un `styledata` arrive à chaque source chargée, bien après le repli
    // initial. Sans désabonnement, chacun refermerait le panneau dans le dos de
    // qui vient de cliquer sur le bouton ⓘ.
    const container = mountMapElement();
    const map = createMockMap(container);
    const attribution = renderAttribution(container, COMPACT, COMPACT_SHOW);

    collapseAttribution(map);
    attribution.classList.add(COMPACT_SHOW);
    mapLibreMockState.maps[0].trigger('styledata');

    expect(attribution.classList.contains(COMPACT_SHOW)).toBe(true);
  });

  it('ne touche pas à l\'attribut open, dont dépend le basculement au clic', () => {
    // `_updateCompactMinimize` replie de la même façon : la classe seule. Le
    // `<details>` reste `open`, et c'est `_toggleAttribution` qui l'ajuste au
    // clic. Le lui retirer ici désynchroniserait la première bascule.
    const container = mountMapElement();
    const map = createMockMap(container);
    const attribution = renderAttribution(container, COMPACT, COMPACT_SHOW);

    collapseAttribution(map);

    expect(attribution.hasAttribute('open')).toBe(true);
  });

  it('reste inerte quand l\'appelant a désactivé le contrôle', () => {
    const container = mountMapElement();
    const map = createMockMap(container);

    expect(() => collapseAttribution(map)).not.toThrow();
    expect(container.querySelector('.maplibregl-ctrl-attrib')).toBeNull();
  });
});

describe('StoreLocator', () => {
  it('replie l\'attribution de la carte qu\'il crée', async () => {
    const element = mountMapElement();
    const locator = new StoreLocator({ stores, elements: { map: element } });

    await locator.whenReady();

    const attribution = renderAttribution(element, COMPACT, COMPACT_SHOW);

    mapLibreMockState.maps[0].trigger('styledata');

    expect(attribution.classList.contains(COMPACT_SHOW)).toBe(false);

    locator.destroy();
  });

  it('laisse MapLibre poser ses options d\'attribution par défaut', async () => {
    // Un objet `attributionControl` remplace les défauts au lieu de les
    // compléter : le fournir, ne serait-ce que pour `compact: true` — déjà le
    // défaut — ferait disparaître le `customAttribution` de MapLibre.
    const locator = new StoreLocator({ stores, elements: { map: mountMapElement() } });

    await locator.whenReady();

    expect(mapLibreMockState.maps[0].options).not.toHaveProperty('attributionControl');

    locator.destroy();
  });
});
