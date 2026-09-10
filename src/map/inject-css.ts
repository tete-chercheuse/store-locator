/**
 * Injection de la feuille de style de MapLibre.
 *
 * Sans elle, la carte s'affiche mais les contrôles de zoom sont empilés sans
 * mise en forme, les popups sont mal positionnées et l'attribution est
 * illisible. C'était jusqu'ici à l'application de la charger, ce qui faisait
 * perdre le plus de temps à l'installation.
 *
 * Insérée **en tête** de `<head>`, et non à la fin : à spécificité égale, la
 * dernière règle déclarée gagne. En fin de `<head>`, la librairie écraserait
 * donc les personnalisations de l'application ; en tête, c'est l'inverse.
 *
 * Une balise `<style>` plutôt qu'un `<link>` : il n'y a pas d'URL à pointer.
 * Une CSP sans `style-src 'unsafe-inline'` exige alors un nonce — d'où
 * `cssNonce`. Sinon, `injectCss: false` rend la main à l'application.
 */
import css from '../styles/maplibre-css';

const MARQUEUR = 'data-store-locator-css';

export const injectMapLibreCss = (nonce?: string): void => {
  // Rendu côté serveur : rien à injecter, et la carte ne s'y construit pas.
  if(typeof document === 'undefined') {
    return;
  }

  // Idempotent : plusieurs cartes sur une même page partagent la feuille.
  if(document.head.querySelector(`style[${MARQUEUR}]`)) {
    return;
  }

  const balise = document.createElement('style');

  balise.setAttribute(MARQUEUR, '');

  if(nonce) {
    balise.nonce = nonce;
  }

  balise.textContent = css;

  document.head.prepend(balise);
};
