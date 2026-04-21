import { afterEach, vi } from 'vitest';
import { resetLeafletMocks } from './mocks/leaflet';

vi.mock('leaflet', async () => {
  return await import('./mocks/leaflet');
});

vi.mock('leaflet-gesture-handling', () => ({}));
vi.mock('leaflet.markercluster', () => ({}));
vi.mock('leaflet.locatecontrol', () => ({}));

vi.mock('leaflet/dist/leaflet.css', () => ({}));
vi.mock('leaflet-gesture-handling/dist/leaflet-gesture-handling.css', () => ({}));
vi.mock('leaflet.markercluster/dist/MarkerCluster.css', () => ({}));
vi.mock('leaflet.markercluster/dist/MarkerCluster.Default.css', () => ({}));
vi.mock('leaflet.locatecontrol/dist/L.Control.Locate.css', () => ({}));

afterEach(() => {
  document.body.innerHTML = '';
  resetLeafletMocks();
});
