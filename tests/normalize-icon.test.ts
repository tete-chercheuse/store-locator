import { describe, expect, it } from 'vitest';
import { normalizeIcon } from '../src/map/normalize-icon';

describe('normalizeIcon', () => {
  it('returns null for nullish values so MapLibre uses its default pin', () => {
    expect(normalizeIcon(null)).toBeNull();
    expect(normalizeIcon(undefined)).toBeNull();
  });

  it('builds an image element from a bare URL string', () => {
    const options = normalizeIcon('/pin.svg');
    const element = options?.element as HTMLImageElement;

    expect(element).toBeInstanceOf(HTMLImageElement);
    expect(element.getAttribute('src')).toBe('/pin.svg');
    expect(element.getAttribute('alt')).toBe('');
  });

  it('passes a raw HTMLElement straight through', () => {
    const node = document.createElement('div');

    expect(normalizeIcon(node)?.element).toBe(node);
  });

  it('builds a sized image element from url and size', () => {
    const options = normalizeIcon({ url: '/pin.svg', size: [40, 44] });
    const element = options?.element as HTMLImageElement;

    expect(element.width).toBe(40);
    expect(element.height).toBe(44);
    expect(element.style.width).toBe('40px');
    expect(element.style.height).toBe('44px');
  });

  it('forwards the MapLibre marker options', () => {
    const options = normalizeIcon({
      url: '/pin.svg',
      anchor: 'bottom',
      offset: [0, -4],
      className: 'store-pin',
      rotation: 15,
    });

    expect(options).toMatchObject({
      anchor: 'bottom',
      offset: [0, -4],
      className: 'store-pin',
      rotation: 15,
    });
  });

  it('prefers an explicit element over a url', () => {
    const node = document.createElement('span');
    const options = normalizeIcon({ element: node, url: '/pin.svg' });

    expect(options?.element).toBe(node);
  });

  it('returns null when the object carries neither url nor element', () => {
    expect(normalizeIcon({ anchor: 'bottom' })).toBeNull();
  });

  it('does not set an anchor when the caller omits it', () => {
    expect(normalizeIcon('/pin.svg')).not.toHaveProperty('anchor');
  });
});
