import { afterEach, vi } from 'vitest';
import { resetMapLibreMocks } from './mocks/maplibre-gl';

vi.mock('maplibre-gl', async () => {
  return await import('./mocks/maplibre-gl');
});

afterEach(() => {
  // Garde nécessaire : `tests/normalize-icon.ssr.test.ts` s'exécute sous
  // l'environnement `node`, où `document` n'existe pas.
  if(typeof document !== 'undefined') {
    document.body.innerHTML = '';

    // La feuille de MapLibre est injectée dans `<head>`, et son injection est
    // idempotente : la laisser en place ferait passer pour « déjà injectée »
    // toute carte créée par un test ultérieur.
    document.head.innerHTML = '';
  }

  resetMapLibreMocks();
});
