import { describe, expect, it } from 'vitest';
import defaultOptions, { OPENFREEMAP_BRIGHT } from '../src/utils/default-options';

describe('defaultOptions', () => {
  it('uses the OpenFreeMap Bright vector style', () => {
    expect(OPENFREEMAP_BRIGHT).toBe('https://tiles.openfreemap.org/styles/bright');
    expect(defaultOptions.map.style).toBe(OPENFREEMAP_BRIGHT);
  });

  it('declares the map center in MapLibre order', () => {
    expect(defaultOptions.map.options.center).toEqual([0, 0]);
    expect(defaultOptions.map.options.cooperativeGestures).toBe(true);
  });

  it('enables the navigation control, which MapLibre does not add by default', () => {
    expect(defaultOptions.map.navigation).toBe(true);
    expect(defaultOptions.map.locate).toBe(false);
  });

  it('configures clustering with MapLibre-native option names', () => {
    expect(defaultOptions.map.clusters).toMatchObject({
      enabled: true,
      radius: 50,
      maxZoom: 14,
      minPoints: 2,
    });
  });

  it('applies a fitBounds padding so pins do not touch the edges', () => {
    expect(defaultOptions.map.fitBoundsOptions.padding).toBe(48);
  });

  it('caps the fitBounds zoom so a single result does not slam to street level', () => {
    expect(defaultOptions.map.fitBoundsOptions.maxZoom).toBe(16);
  });

  it('no longer exposes the removed Leaflet-era options', () => {
    const clusters = defaultOptions.map.clusters as Record<string, unknown>;

    expect(defaultOptions.map).not.toHaveProperty('tiles');
    expect(clusters).not.toHaveProperty('showCoverageOnHover');
    expect(clusters).not.toHaveProperty('spiderfyOnMaxZoom');
    expect(clusters).not.toHaveProperty('disableClusteringAtZoom');
  });
});
