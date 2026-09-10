import { expect, test, type Page } from '@playwright/test';
import type * as GeoJSON from 'geojson';
import type { GeoJSONSource, Map as MapLibreMap } from 'maplibre-gl';

/**
 * Point d'ancrage exposé par les deux démos : les clusters sont rendus sur le
 * canvas WebGL et ne sont atteignables que par l'API de la carte, jamais par un
 * sélecteur CSS.
 */
declare global {
  interface Window {
    __storeLocator?: { map: MapLibreMap | null };
  }
}

const SOURCE_ID = 'store-locator';
const CLUSTER_LAYER_ID = 'store-locator-clusters';

const countSourceFeatures = async (page: Page): Promise<number> => {
  return await page.evaluate(async (sourceId) => {
    const source = window.__storeLocator!.map!.getSource(sourceId) as GeoJSONSource;
    const data = await source.getData() as GeoJSON.FeatureCollection;

    return data.features.length;
  }, SOURCE_ID);
};

const countRenderedClusters = async (page: Page): Promise<number> => {
  return await page.evaluate((layerId) => {
    return window.__storeLocator!.map!
      .queryRenderedFeatures({ layers: [layerId] })
      .length;
  }, CLUSTER_LAYER_ID);
};

const assertDemo = async (page: Page, url: string): Promise<void> => {
  const consoleErrors: string[] = [];
  const pageErrors: string[] = [];

  page.on('console', (message) => {
    if(message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });

  page.on('pageerror', (error) => {
    pageErrors.push(String(error));
  });

  await page.goto(url);

  // Le conteneur porte la classe MapLibre dès l'instanciation.
  await expect(page.locator('.store-locator-map')).toHaveClass(/maplibregl-map/);
  await expect(page.locator('.store-locator-map .maplibregl-canvas')).toBeVisible();

  // `loaded()` ne passe à `true` qu'à la fin du rendu qui émet `load` : la
  // source et les couches de la librairie sont donc déjà en place.
  await page.waitForFunction(() => Boolean(window.__storeLocator?.map?.loaded?.()));

  // Les contrôles ajoutés par la librairie.
  await expect(page.locator('.maplibregl-ctrl-zoom-in')).toBeVisible();
  await expect(page.locator('.maplibregl-ctrl-geolocate')).toBeVisible();

  // L'attribution OpenStreetMap / OpenMapTiles, obligation du fond de carte.
  await expect(page.locator('.maplibregl-ctrl-attrib')).toContainText(/OpenStreetMap/i);

  const initialCount = await countSourceFeatures(page);

  expect(initialCount).toBeGreaterThan(0);

  // Les clusters sont rendus sur le canvas WebGL : ils ne sont atteignables
  // que par l'API de la carte, pas par un sélecteur CSS.
  await expect.poll(async () => await countRenderedClusters(page)).toBeGreaterThan(0);

  // Les points non clusterisés, eux, restent des marqueurs DOM synchronisés par
  // la librairie : c'est le seul témoin observable de `MarkerSync`.
  await expect.poll(async () => await page.locator('.maplibregl-marker').count()).toBeGreaterThan(0);

  await page.check('input[value="Wineshops"]');
  await expect(page.locator('input[value="Wineshops"]')).toBeChecked();

  await expect.poll(async () => await countSourceFeatures(page)).toBeLessThan(initialCount);

  expect(pageErrors).toEqual([]);
  expect(consoleErrors).toEqual([]);
};

test('la démo vanilla charge la carte et les filtres', async ({ page }) => {
  await assertDemo(page, '/demo/vanilla/');
});

test('la démo react charge la carte et les filtres', async ({ page }) => {
  await assertDemo(page, '/demo/react/');
});
