import { describe, expect, it } from 'vitest';
import { normalizePopup } from '../src/map/normalize-popup';

describe('normalizePopup', () => {
  it('returns null for nullish values', () => {
    expect(normalizePopup(null)).toBeNull();
    expect(normalizePopup(undefined)).toBeNull();
  });

  it('wraps a bare string as HTML content with empty options', () => {
    expect(normalizePopup('<b>Cafe</b>')).toEqual({
      content: '<b>Cafe</b>',
      options: {},
    });
  });

  it('wraps a bare HTMLElement as DOM content', () => {
    const node = document.createElement('div');

    expect(normalizePopup(node)).toEqual({ content: node, options: {} });
  });

  it('splits content away from the MapLibre popup options', () => {
    expect(normalizePopup({
      content: '<b>Cafe</b>',
      maxWidth: '280px',
      closeButton: false,
      className: 'store-popup',
    })).toEqual({
      content: '<b>Cafe</b>',
      options: {
        maxWidth: '280px',
        closeButton: false,
        className: 'store-popup',
      },
    });
  });

  it('returns null when the options object carries no content', () => {
    expect(normalizePopup({ maxWidth: '280px' })).toBeNull();
  });

  it('returns null when content is explicitly null', () => {
    expect(normalizePopup({ content: null, maxWidth: '280px' })).toBeNull();
  });
});
