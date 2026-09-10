import { describe, expect, it } from 'vitest';
import defaultOptions, { OPENFREEMAP_BRIGHT } from '../src/utils/default-options';
import type { StyleSpecification } from 'maplibre-gl';

describe('defaultOptions', () => {
  it('embeds a self-contained OpenFreeMap style object', () => {
    const style = defaultOptions.map.style as StyleSpecification;

    expect(typeof style).toBe('object');
    expect(style.version).toBe(8);
    expect(style.layers.length).toBeGreaterThan(0);

    // Sources, glyphes et sprite doivent rester sur OpenFreeMap : aucune clé
    // d'API, aucun quota. Un style qui pointerait ailleurs passerait sinon
    // inaperçu jusqu'à la première requête refusée.
    const urls = [
      style.glyphs,
      typeof style.sprite === 'string' ? style.sprite : '',
      ...Object.values(style.sources).map((source) => ('url' in source ? source.url : '')),
      ...Object.values(style.sources).flatMap((source) => ('tiles' in source ? source.tiles ?? [] : [])),
    ].filter(Boolean) as string[];

    expect(urls.length).toBeGreaterThan(0);
    expect(urls.every((url) => url.startsWith('https://tiles.openfreemap.org/'))).toBe(true);
  });

  it('declares a font that the embedded style actually serves', () => {
    // Le compteur des clusters est une couche `symbol` : une police absente des
    // glyphes du style ne s'afficherait pas, sans erreur bloquante.
    const style = defaultOptions.map.style as StyleSpecification;
    const disponibles = new Set(
      style.layers.flatMap((layer) => {
        const font = 'layout' in layer ? layer.layout?.['text-font'] : undefined;

        return Array.isArray(font) ? font.filter((f): f is string => typeof f === 'string') : [];
      }),
    );

    for(const police of defaultOptions.map.clusters.textFont as string[]) {
      expect(disponibles).toContain(police);
    }
  });

  it('still exports the public Bright style, to switch back in one line', () => {
    expect(OPENFREEMAP_BRIGHT).toBe('https://tiles.openfreemap.org/styles/bright');
  });

  it('declares the map center in MapLibre order', () => {
    expect(defaultOptions.map.options.center).toEqual([0, 0]);
    expect(defaultOptions.map.options.cooperativeGestures).toBe(true);
  });

  it('sets no zoom floor, which would silently override the initial fit', () => {
    // Mesuré : avec minZoom à 2, un jeu multi-continental faisait calculer un
    // zoom de 1,48 à fitBounds, ramené à 2, laissant 66 des 214 magasins hors
    // écran sans le moindre signal.
    expect(defaultOptions.map.options.minZoom).toBe(0);
  });

  it('enables the navigation control, which MapLibre does not add by default', () => {
    expect(defaultOptions.map.navigation).toBe(true);
    expect(defaultOptions.map.locate).toBe(false);
  });

  it('configures clustering with MapLibre-native option names', () => {
    expect(defaultOptions.map.clusters).toMatchObject({
      enabled: true,
      radius: 50,
      maxZoom: 11,
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
