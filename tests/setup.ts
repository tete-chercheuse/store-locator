import { afterEach, vi } from 'vitest';
import { resetMapLibreMocks } from './mocks/maplibre-gl';

vi.mock('maplibre-gl', async () => {
  return await import('./mocks/maplibre-gl');
});

vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

afterEach(() => {
  // Garde nécessaire : `tests/normalize-icon.ssr.test.ts` s'exécute sous
  // l'environnement `node`, où `document` n'existe pas.
  if(typeof document !== 'undefined') {
    document.body.innerHTML = '';
  }

  resetMapLibreMocks();
});
