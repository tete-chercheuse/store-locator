#!/usr/bin/env node
/**
 * Empaquette le worker de MapLibre en un fichier autonome, livré dans `dist/`.
 *
 *   node scripts/bundle-worker.mjs
 *
 * Pourquoi ce détour. MapLibre déduit l'URL de son worker de `import.meta.url`,
 * et abandonne si ce n'est pas une URL `http(s)` :
 *
 *   function defaultWorkerUrl() {
 *     const moduleUrl = import.meta.url;
 *     if (!/^https?:/.test(moduleUrl)) return "";
 *     …
 *   }
 *
 * Webpack réécrit `import.meta.url` en URL `file://` du module : le garde saute,
 * l'URL retombe sur `''`, et `new Worker('')` va chercher la page HTML comme
 * script. Le symptôme est une carte grise, sans erreur en console, alors que le
 * TileJSON et le sprite — chargés par le thread principal — aboutissent.
 *
 * Pourquoi empaqueter plutôt que recopier les deux fichiers d'origine.
 * `maplibre-gl-worker.mjs` importe `./maplibre-gl-shared.mjs` par un
 * spécificateur relatif littéral. Les bundlers n'émettent qu'un seul fichier
 * pour un `new URL('./x', import.meta.url)`, sans son graphe : il faut donc un
 * fichier sans aucun import. C'est aussi ce qui libère du nommage — plus de
 * paire de fichiers à garder côte à côte sous leur nom exact.
 *
 * Format IIFE et extension `.cjs` : MapLibre décide du type de worker sur ce
 * seul suffixe — `asModule = url.endsWith('.cjs') ? false : true`. Un worker
 * classique est reconnu partout, là où un worker de module demande Firefox 114
 * ou plus.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { build } from 'esbuild';

const SOURCE = 'node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs';
const CIBLE = 'dist/store-locator-worker.cjs';
const VERSION = 'src/map/worker-version.ts';

const { version } = JSON.parse(readFileSync('node_modules/maplibre-gl/package.json', 'utf8'));

const resultat = await build({
  entryPoints: [SOURCE],
  outfile: CIBLE,
  bundle: true,
  format: 'iife',
  target: 'es2022',
  minify: true,
  // La licence BSD de MapLibre exige que sa notice accompagne le code.
  legalComments: 'inline',
  logLevel: 'warning',
  metafile: true,
});

const code = readFileSync(CIBLE, 'utf8');
const sortie = Object.values(resultat.metafile.outputs)[0];

/**
 * Le metafile plutôt qu'une expression sur le code : le fichier contient le mot
 * `import` dans un message d'erreur et dans deux `await import()` dynamiques —
 * le mécanisme `importScriptInWorkers` de MapLibre, légitime et interne. Seul
 * un import **statique** non résolu rendrait le fichier non autonome, donc le
 * worker silencieusement cassé chez tout consommateur à bundler.
 */
const statiques = sortie.imports.filter((i) => i.kind === 'import-statement');

if(statiques.length) {
  console.error(`Le worker empaqueté garde ${statiques.length} import statique(s) : il n'est pas autonome.`);
  statiques.forEach((i) => console.error('  ' + i.path));
  process.exit(1);
}

// L'effet de bord qui fait vivre le worker. Sans lui, le fichier se charge et
// ne répond jamais.
if(!code.includes('self.worker')) {
  console.error('L\'affectation `self.worker` a disparu : le worker ne répondrait pas.');
  process.exit(1);
}

writeFileSync(VERSION, `/**
 * Version de \`maplibre-gl\` dont provient le worker empaqueté dans
 * \`dist/store-locator-worker.cjs\`.
 *
 * **Donnée générée — ne pas retoucher à la main.** Après une montée de version
 * de \`maplibre-gl\` : \`node scripts/bundle-worker.mjs\`.
 *
 * Sert au garde de compatibilité de \`map/worker.ts\` : le worker et le thread
 * principal échangent par un protocole interne, qu'aucune promesse publique ne
 * stabilise entre versions.
 */
export const BUNDLED_WORKER_VERSION = '${version}';
`);

console.log(`Worker empaqueté depuis ${SOURCE}`);
console.log(`  version maplibre-gl : ${version}`);
console.log(`  sortie              : ${CIBLE}`);
console.log(`  poids               : ${(sortie.bytes / 1024).toFixed(1)} ko`);
