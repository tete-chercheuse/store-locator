import { describe, expect, it } from 'vitest';
import StoreLocator from '../src/store-locator';
import { mapLibreMockState } from './mocks/maplibre-gl';

const stores = [{ id: 'store-1', name: 'Cafe', lat: 16.2411, lng: -61.5336 }];

/** Les trois icônes réellement réclamées par OpenFreeMap Bright et absentes de son sprite. */
const ABSENTES = ['bollard', 'bicycle_parking', 'swimming_pool'];

const mountMapElement = (): HTMLElement => {
  const element = document.createElement('div');

  document.body.appendChild(element);

  return element;
};

describe('images de style manquantes', () => {
  it('résout les icônes que le sprite ne contient pas', async () => {
    const locator = new StoreLocator({ stores, elements: { map: mountMapElement() } });

    await locator.whenReady();

    const map = mapLibreMockState.maps[0];

    for(const id of ABSENTES) {
      expect(await map.requestImage(id)).toBe('resolue');
    }

    locator.destroy();
  });

  it('fournit un pixel transparent, qui ne dessine rien', async () => {
    const locator = new StoreLocator({ stores, elements: { map: mountMapElement() } });

    await locator.whenReady();

    const map = mapLibreMockState.maps[0];

    await map.requestImage('bollard');

    // Un pixel opaque apparaîtrait comme une pastille sur chaque POI concerné.
    expect(map.images.get('bollard')).toEqual({ width: 1, height: 1, data: new Uint8Array(4) });

    locator.destroy();
  });

  it('n\'émet plus styleimagemissing, l\'image n\'étant plus manquante', async () => {
    // C'est cet événement qui accompagne l'avertissement de MapLibre : le même
    // `unresolvedIds` décide des deux.
    const locator = new StoreLocator({ stores, elements: { map: mountMapElement() } });

    await locator.whenReady();

    const map = mapLibreMockState.maps[0];
    const manquantes: string[] = [];

    map.on('styleimagemissing', (event) => manquantes.push((event as { id: string; }).id));

    await map.requestImage('bollard');

    expect(manquantes).toEqual([]);

    locator.destroy();
  });

  it('n\'écrase pas une icône déjà enregistrée par l\'application', async () => {
    // MapLibre ne convoque le résolveur que pour les identifiants absents.
    // C'est ce qui garantit qu'un pixel transparent ne vienne pas se substituer
    // à un vrai pictogramme fourni par l'appelant.
    const locator = new StoreLocator({ stores, elements: { map: mountMapElement() } });

    await locator.whenReady();

    const map = mapLibreMockState.maps[0];
    const sienne = { width: 2, height: 2, data: new Uint8Array(16) };

    map.addImage('bollard', sienne);

    expect(await map.requestImage('bollard')).toBe('resolue');
    expect(map.images.get('bollard')).toBe(sienne);
    expect(locator.unresolvedImages).toEqual([]);

    locator.destroy();
  });

  it('garde les identifiants lisibles, pour qu\'un addImage oublié reste trouvable', async () => {
    const locator = new StoreLocator({ stores, elements: { map: mountMapElement() } });

    await locator.whenReady();

    const map = mapLibreMockState.maps[0];

    await map.requestImage('swimming_pool');
    await map.requestImage('mon-pin-maison');

    expect(locator.unresolvedImages).toEqual(['swimming_pool', 'mon-pin-maison']);

    locator.destroy();
  });

  it('restitue les avertissements quand resolveMissingImages vaut false', async () => {
    const locator = new StoreLocator({
      stores,
      elements: { map: mountMapElement() },
      map: { resolveMissingImages: false },
    });

    await locator.whenReady();

    const map = mapLibreMockState.maps[0];

    expect(map.setMissingStyleImageResolver).not.toHaveBeenCalled();
    expect(await map.requestImage('bollard')).toBe('manquante');
    expect(locator.unresolvedImages).toEqual([]);

    locator.destroy();
  });
});
