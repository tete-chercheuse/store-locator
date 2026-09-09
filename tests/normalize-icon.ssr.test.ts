// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { normalizeIcon } from '../src/map/normalize-icon';

describe('normalizeIcon sans DOM', () => {
  it('returns null instead of throwing when there is no document', () => {
    expect(typeof document).toBe('undefined');
    expect(normalizeIcon('/pin.svg')).toBeNull();
    expect(normalizeIcon({ url: '/pin.svg', size: [40, 44] })).toBeNull();
  });
});
