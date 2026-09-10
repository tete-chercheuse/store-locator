import { describe, expect, it } from 'vitest';
import { POPUP_GAP, popupOffsetForIcon } from '../src/map/popup-offset';

describe('popupOffsetForIcon', () => {
  it('returns null when the icon size is unknown', () => {
    // Sans dimensions, aucune géométrie à dériver : on laisse MapLibre décider.
    expect(popupOffsetForIcon(undefined, 'bottom')).toBeNull();
  });

  it('places the popup above a bottom-anchored pin, clear of its top edge', () => {
    // Cas de référence : un pin de 40 × 44 dont la pointe est sur la coordonnée.
    // L'icône occupe donc de y = -44 à y = 0.
    const offset = popupOffsetForIcon([40, 44], 'bottom');

    expect(offset?.bottom).toEqual([0, -44 - POPUP_GAP]);
  });

  it('places the popup below the icon when it flips to a top anchor', () => {
    const offset = popupOffsetForIcon([40, 44], 'bottom');

    expect(offset?.top).toEqual([0, POPUP_GAP]);
  });

  it('clears the icon horizontally on the side anchors', () => {
    const offset = popupOffsetForIcon([40, 44], 'bottom');

    // Ancrage gauche de la popup : elle s'étend vers la droite, elle doit donc
    // partir du bord droit de l'icône.
    expect(offset?.left).toEqual([20 + POPUP_GAP, -22]);
    expect(offset?.right).toEqual([-20 - POPUP_GAP, -22]);
  });

  it('centres the box on the coordinate for a centre-anchored icon', () => {
    // Une icône centrée occupe de -h/2 à +h/2.
    const offset = popupOffsetForIcon([40, 44], 'center');

    expect(offset?.bottom).toEqual([0, -22 - POPUP_GAP]);
    expect(offset?.top).toEqual([0, 22 + POPUP_GAP]);
  });

  it('treats an omitted anchor as MapLibre does, that is centre', () => {
    expect(popupOffsetForIcon([40, 44], undefined)).toEqual(popupOffsetForIcon([40, 44], 'center'));
  });

  it('handles a corner-anchored icon', () => {
    // `bottom-left` place le coin bas-gauche de l'icône sur la coordonnée :
    // elle occupe donc de x = 0 à x = 40 et de y = -44 à y = 0.
    const offset = popupOffsetForIcon([40, 44], 'bottom-left');

    expect(offset?.bottom).toEqual([20, -44 - POPUP_GAP]);
    expect(offset?.right).toEqual([-POPUP_GAP, -22]);
  });

  it('provides an entry for every anchor MapLibre may choose', () => {
    const offset = popupOffsetForIcon([40, 44], 'bottom');

    expect(Object.keys(offset ?? {}).sort()).toEqual([
      'bottom', 'bottom-left', 'bottom-right', 'center',
      'left', 'right', 'top', 'top-left', 'top-right',
    ]);
  });

  it('scales with the icon, which is the whole point', () => {
    const petit = popupOffsetForIcon([20, 20], 'bottom');
    const grand = popupOffsetForIcon([80, 100], 'bottom');

    expect(petit?.bottom).toEqual([0, -20 - POPUP_GAP]);
    expect(grand?.bottom).toEqual([0, -100 - POPUP_GAP]);
  });
});
