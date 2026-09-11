/**
 * URL du worker de MapLibre.
 *
 * MapLibre ne sait pas fonctionner sans worker : `Dispatcher.initActors` lève
 * `No actors found` si le pool est vide, et c'est là que vivent les *worker
 * sources* `vector` et `geojson` — donc l'analyse de chaque tuile, et
 * supercluster, c'est-à-dire notre clustering.
 *
 * Or il déduit l'URL de son worker de `import.meta.url` et abandonne si ce
 * n'est pas une URL `http(s)`. Webpack réécrivant cette expression en URL
 * `file://` du module, l'URL retombe sur `''` et `new Worker('')` va chercher
 * la page HTML comme script : carte grise, sans erreur en console.
 *
 * La librairie livre donc son propre worker, empaqueté en un fichier autonome
 * par `scripts/bundle-worker.mjs`, et le désigne par
 * `new URL('./…', import.meta.url)`. Ce motif est compris de Webpack, Vite,
 * Turbopack et Rollup, qui émettent le fichier et réécrivent l'URL ; sans
 * bundler, `import.meta.url` est déjà l'URL réelle du module publié, et le
 * fichier en est le voisin.
 *
 * MapLibre n'expose que `setWorkerUrl(string)` : ni instance de `Worker`, ni
 * fabrique. C'est pourquoi il faut passer par une URL, et donc par un fichier
 * sans aucun import — un bundler n'émet pas le graphe d'un `new URL`.
 */
import { getVersion, getWorkerUrl, setWorkerUrl } from 'maplibre-gl';
import { BUNDLED_WORKER_VERSION } from './worker-version';

/** Réduit `6.9.1` à `6.9` : le grain auquel le protocole est réputé stable. */
const mineure = (version: string): string => version.split('.').slice(0, 2).join('.');

const avertir = (message: string): void => {
  console.warn(`[store-locator] ${message}`);
};

/**
 * Désigne le worker embarqué, sauf si l'appelant a déjà pris la main.
 *
 * @param workerUrl URL imposée par l'appelant, qui court-circuite tout.
 */
export const configureWorker = (workerUrl?: string | null): void => {
  if(workerUrl) {
    setWorkerUrl(workerUrl);
    return;
  }

  // Déjà configuré, par l'application ou par un précédent appel : on ne touche
  // pas. `setWorkerUrl` est global à MapLibre, pas propre à une carte.
  if(getWorkerUrl()) {
    return;
  }

  const installee = getVersion();

  /**
   * Le worker et le thread principal échangent par un protocole interne :
   * codes de messages, `RequestResponseMessageMap`, et un registre de
   * sérialisation indexé par nom de classe. Les trois sont restés identiques de
   * 6.8.0 à 6.9.0, mais aucune promesse publique ne les stabilise. Refuser un
   * worker d'une autre mineure est la défaillance la plus sûre : un message
   * précis plutôt qu'une carte grise.
   */
  if(mineure(installee) !== mineure(BUNDLED_WORKER_VERSION)) {
    avertir(
      `Le worker embarqué vient de maplibre-gl ${BUNDLED_WORKER_VERSION}, or ${installee} est installée. ` +
      'Il n\'est pas utilisé : le protocole entre le worker et le thread principal est interne à MapLibre. ' +
      `Aligne maplibre-gl sur ${mineure(BUNDLED_WORKER_VERSION)}.x, ou passe map.workerUrl.`,
    );

    return;
  }

  setWorkerUrl(new URL('./store-locator-worker.cjs', import.meta.url).href);
};
