import { afterEach, describe, expect, it, vi } from 'vitest';
import StoreLocator from '../src/store-locator';
import { BUNDLED_WORKER_VERSION } from '../src/map/worker-version';
import { mapLibreMockState, setWorkerUrl } from './mocks/maplibre-gl';

const stores = [{ id: 'store-1', name: 'Cafe', lat: 16.2411, lng: -61.5336 }];

const mountMapElement = (): HTMLElement => {
  const element = document.createElement('div');

  document.body.appendChild(element);

  return element;
};

const creer = async (map?: Record<string, unknown>): Promise<StoreLocator> => {
  const locator = new StoreLocator({ stores, elements: { map: mountMapElement() }, map });

  await locator.whenReady();

  return locator;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('version du worker empaqueté', () => {
  it('suit la version de maplibre-gl installée', async () => {
    // Garde de dérive : le worker livré est un instantané. Sans ce contrôle,
    // une montée de version laisserait la librairie servir l'ancien worker à un
    // thread principal plus récent — et le refus du garde de compatibilité
    // priverait alors tout le monde du chemin sans configuration.
    //
    // Pour le remettre à jour : `node scripts/bundle-worker.mjs`
    const { readFileSync } = await import('node:fs');
    const installee = JSON.parse(readFileSync('node_modules/maplibre-gl/package.json', 'utf8')) as { version: string; };

    expect(BUNDLED_WORKER_VERSION).toBe(installee.version);
  });
});

describe('configureWorker', () => {
  it('désigne le worker embarqué quand rien n\'est configuré', async () => {
    const locator = await creer();

    expect(mapLibreMockState.workerUrl).toMatch(/\/store-locator-worker\.cjs$/);

    locator.destroy();
  });

  it('désigne le worker avant de construire la carte', async () => {
    // MapLibre acquiert son pool de workers dès qu'il instancie son `Style`,
    // donc dans le constructeur. Un `setWorkerUrl` postérieur n'aurait aucun
    // effet sur la carte en cours.
    const locator = await creer();
    const ordreSetWorkerUrl = setWorkerUrl.mock.invocationCallOrder[0];
    const ordreConstruction = mapLibreMockState.maps[0].on.mock.invocationCallOrder[0];

    expect(ordreSetWorkerUrl).toBeLessThan(ordreConstruction);

    locator.destroy();
  });

  it('respecte l\'URL imposée par l\'appelant', async () => {
    const locator = await creer({ workerUrl: '/maplibre/maplibre-gl-worker.mjs' });

    expect(mapLibreMockState.workerUrl).toBe('/maplibre/maplibre-gl-worker.mjs');

    locator.destroy();
  });

  it('impose l\'URL de l\'appelant même sur une version incompatible', async () => {
    // C'est la sortie de secours du garde : si l'appelant sert lui-même les
    // fichiers de sa version, aucune raison de la lui refuser.
    mapLibreMockState.version = '7.0.0';

    const avertir = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const locator = await creer({ workerUrl: '/maplibre/maplibre-gl-worker.mjs' });

    expect(mapLibreMockState.workerUrl).toBe('/maplibre/maplibre-gl-worker.mjs');
    expect(avertir).not.toHaveBeenCalled();

    locator.destroy();
  });

  it('ne touche pas à une URL déjà posée par l\'application', async () => {
    // `setWorkerUrl` est global à MapLibre. Écraser un réglage de l'application
    // casserait sa configuration au premier store locator monté.
    mapLibreMockState.workerUrl = '/le-mien.mjs';

    const locator = await creer();

    expect(mapLibreMockState.workerUrl).toBe('/le-mien.mjs');

    locator.destroy();
  });

  it('tolère un écart de correctif, sémantiquement sans rupture', async () => {
    const [majeure, mineure] = BUNDLED_WORKER_VERSION.split('.');

    mapLibreMockState.version = `${majeure}.${mineure}.99`;

    const avertir = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const locator = await creer();

    expect(mapLibreMockState.workerUrl).toMatch(/\/store-locator-worker\.cjs$/);
    expect(avertir).not.toHaveBeenCalled();

    locator.destroy();
  });

  it('refuse son worker sur une autre mineure, et le dit', async () => {
    // Le worker et le thread principal échangent par un protocole interne.
    // Refuser est la défaillance la plus sûre : un message précis plutôt qu'une
    // carte grise, sans tuile et sans erreur.
    const [majeure, mineure] = BUNDLED_WORKER_VERSION.split('.');

    mapLibreMockState.version = `${majeure}.${Number(mineure) + 1}.0`;

    const avertir = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const locator = await creer();

    expect(mapLibreMockState.workerUrl).toBe('');

    const message = avertir.mock.calls[0]?.[0] as string;

    expect(message).toContain(BUNDLED_WORKER_VERSION);
    expect(message).toContain(mapLibreMockState.version);
    expect(message).toContain('map.workerUrl');

    locator.destroy();
  });

  it('refuse aussi sur une majeure différente', async () => {
    mapLibreMockState.version = '7.0.0';

    const avertir = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const locator = await creer();

    expect(mapLibreMockState.workerUrl).toBe('');
    expect(avertir).toHaveBeenCalledTimes(1);

    locator.destroy();
  });
});
