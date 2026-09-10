// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { injectMapLibreCss } from '../src/map/inject-css';

describe('injectMapLibreCss sans DOM', () => {
  it('ne lève pas quand il n\'y a pas de document', () => {
    // Le module est importé par le point d'entrée, donc évalué au rendu côté
    // serveur des applications React. Il ne doit rien y tenter.
    expect(typeof document).toBe('undefined');
    expect(() => injectMapLibreCss()).not.toThrow();
  });
});
