import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import StoreLocator from '../src/store-locator';
import maplibreCss, { MAPLIBRE_CSS_VERSION } from '../src/styles/maplibre-css';
import { mapLibreMockState } from './mocks/maplibre-gl';

const SELECTEUR = 'style[data-store-locator-css]';

const stores = [{ id: 'store-1', name: 'Cafe', lat: 16.2411, lng: -61.5336 }];

const mountMapElement = (): HTMLElement => {
  const element = document.createElement('div');

  document.body.appendChild(element);

  return element;
};

const feuilles = (): HTMLStyleElement[] => [...document.head.querySelectorAll<HTMLStyleElement>(SELECTEUR)];

describe('feuille de style embarquée', () => {
  it('porte les règles de MapLibre, pas une chaîne vide', () => {
    // Un module généré vide passerait toutes les assertions de présence.
    expect(maplibreCss.length).toBeGreaterThan(50_000);
    expect(maplibreCss).toContain('.maplibregl-map');
    expect(maplibreCss).toContain('.maplibregl-ctrl-attrib');
    expect(maplibreCss).toContain('.maplibregl-popup');
    expect(maplibreCss).toContain('.maplibregl-marker');
  });

  it('est autonome : aucune url() ni import à résoudre', () => {
    // Une url() externe ou un @import casserait l'embarquement en silence, la
    // ressource étant alors résolue contre la page hôte.
    const cibles = [...maplibreCss.matchAll(/url\(\s*([^)]*)/g)]
      .map((m) => m[1].trim().replace(/^["']|["']$/g, ''));

    expect(cibles.length).toBeGreaterThan(0);
    expect(cibles.every((cible) => cible.startsWith('data:'))).toBe(true);
    expect(maplibreCss).not.toContain('@import');
    expect(maplibreCss).not.toContain('@font-face');
  });

  it('déclare la version de maplibre-gl dont elle provient', () => {
    expect(MAPLIBRE_CSS_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });

  it('correspond à la feuille de la version installée', () => {
    // Garde de dérive. La copie embarquée est un instantané : sans ce contrôle,
    // une montée de version de `maplibre-gl` laisserait la librairie servir la
    // mise en forme de l'ancienne, sans le moindre signal.
    //
    // Pour la remettre à jour : `node scripts/import-maplibre-css.mjs`
    const installee = JSON.parse(readFileSync('node_modules/maplibre-gl/package.json', 'utf8')) as { version: string; };

    expect(MAPLIBRE_CSS_VERSION).toBe(installee.version);
    expect(maplibreCss).toBe(readFileSync('node_modules/maplibre-gl/dist/maplibre-gl.css', 'utf8').trim());
  });
});

describe('injection', () => {
  it('injecte la feuille à la création de la carte', async () => {
    const locator = new StoreLocator({ stores, elements: { map: mountMapElement() } });

    await locator.whenReady();

    expect(feuilles()).toHaveLength(1);
    expect(feuilles()[0].textContent).toBe(maplibreCss);

    locator.destroy();
  });

  it('injecte avant de construire la carte, pas après', async () => {
    // MapLibre bâtit le DOM de ses contrôles dans son constructeur. Une feuille
    // arrivée ensuite les laisserait paraître un instant non mis en forme —
    // invisible pour une assertion sur l'état final.
    const locator = new StoreLocator({ stores, elements: { map: mountMapElement() } });

    await locator.whenReady();

    expect(mapLibreMockState.maps[0].stylesAtConstruction).toBe(1);

    locator.destroy();
  });

  it('passe devant les feuilles de l\'application, qui gardent la priorité', async () => {
    // À spécificité égale, la dernière règle déclarée gagne. La feuille de la
    // librairie doit donc arriver en tête de `<head>`, sinon elle écraserait
    // les personnalisations de l'application.
    const feuilleApplication = document.createElement('style');

    feuilleApplication.textContent = '.maplibregl-popup { max-width: 420px; }';
    document.head.append(feuilleApplication);

    const locator = new StoreLocator({ stores, elements: { map: mountMapElement() } });

    await locator.whenReady();

    const enfants = [...document.head.children];

    expect(enfants.indexOf(feuilles()[0])).toBeLessThan(enfants.indexOf(feuilleApplication));

    locator.destroy();
  });

  it('n\'injecte qu\'une fois pour deux cartes sur la même page', async () => {
    const premier = new StoreLocator({ stores, elements: { map: mountMapElement() } });
    const second = new StoreLocator({ stores, elements: { map: mountMapElement() } });

    await premier.whenReady();
    await second.whenReady();

    expect(feuilles()).toHaveLength(1);

    premier.destroy();
    second.destroy();
  });

  it('rend la main à l\'application quand injectCss vaut false', async () => {
    const locator = new StoreLocator({
      stores,
      elements: { map: mountMapElement() },
      map: { injectCss: false },
    });

    await locator.whenReady();

    expect(feuilles()).toHaveLength(0);

    locator.destroy();
  });

  it('pose le nonce fourni, pour une CSP sans unsafe-inline', async () => {
    const locator = new StoreLocator({
      stores,
      elements: { map: mountMapElement() },
      map: { cssNonce: 'r4nd0m' },
    });

    await locator.whenReady();

    // `nonce` est reflété en propriété et non en attribut : les navigateurs
    // masquent l'attribut après analyse, pour qu'un script injecté ne puisse
    // pas le lire.
    expect(feuilles()[0].nonce).toBe('r4nd0m');

    locator.destroy();
  });

  it('n\'ajoute aucun nonce quand l\'appelant n\'en fournit pas', async () => {
    const locator = new StoreLocator({ stores, elements: { map: mountMapElement() } });

    await locator.whenReady();

    expect(feuilles()[0].getAttribute('nonce')).toBeNull();

    locator.destroy();
  });
});
