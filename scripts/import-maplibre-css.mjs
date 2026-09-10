#!/usr/bin/env node
/**
 * Recopie la feuille de style de MapLibre dans le module embarqué.
 *
 *   node scripts/import-maplibre-css.mjs
 *
 * À relancer après chaque montée de version de `maplibre-gl` : la garde de
 * dérive de `tests/inject-css.test.ts` échoue tant que ce n'est pas fait.
 *
 * La feuille est autonome — ses 39 `url()` sont toutes des SVG en `data:`,
 * aucun `@import`, aucun `@font-face` : l'embarquer ne perd rien.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';

const SOURCE = 'node_modules/maplibre-gl/dist/maplibre-gl.css';
const CIBLE = 'src/styles/maplibre-css.ts';

const css = readFileSync(SOURCE, 'utf8').trim();
const { version } = JSON.parse(readFileSync('node_modules/maplibre-gl/package.json', 'utf8'));

// Le contenu est extrait puis testé, plutôt que filtré par une expression :
// un `(["']?)` optionnel devant un `(?!data:)` rétrograde sur le guillemet et
// finit par tout valider.
const cibles = [...css.matchAll(/url\(\s*([^)]*)/g)]
  .map((m) => m[1].trim().replace(/^["']|["']$/g, ''));
const externes = cibles.filter((cible) => !cible.startsWith('data:'));

if(externes.length) {
  console.error(`${externes.length} url() non embarquée(s) sur ${cibles.length} : la feuille n'est plus autonome.`);
  externes.forEach((cible) => console.error('  ' + cible.slice(0, 100)));
  process.exit(1);
}

/**
 * Un littéral gabarit serait plus lisible dans la sortie, mais le CSS de
 * MapLibre contient des `${...}` dans ses SVG encodés en `data:`, qui y seraient
 * interprétés comme des interpolations. `JSON.stringify` échappe tout.
 */
const contenu = `/**
 * Feuille de style de MapLibre GL JS ${version}, embarquée.
 *
 * **Données générées — ne pas retoucher à la main.** Après une montée de version
 * de \`maplibre-gl\` :
 *
 * \`\`\`bash
 * node scripts/import-maplibre-css.mjs
 * \`\`\`
 *
 * Embarquée pour que la librairie s'installe sans étape de chargement de CSS.
 * L'importer depuis le point d'entrée ne marcherait que pour les applications à
 * bundler : microbundle externalise \`maplibre-gl\`, sous-chemin CSS compris, et
 * le spécificateur nu survivrait dans le bundle publié, où aucune importmap ne
 * peut le résoudre.
 *
 * @license 3-Clause BSD — MapLibre GL JS, https://github.com/maplibre/maplibre-gl-js/blob/v${version}/LICENSE.txt
 */

/** Version de \`maplibre-gl\` d'où provient cette feuille. */
export const MAPLIBRE_CSS_VERSION = '${version}';

const css = ${JSON.stringify(css)};

export default css;
`;

writeFileSync(CIBLE, contenu);

console.log(`Feuille importée depuis ${SOURCE}`);
console.log(`  version maplibre-gl : ${version}`);
console.log(`  poids               : ${(css.length / 1024).toFixed(1)} ko, ${(gzipSync(Buffer.from(css)).length / 1024).toFixed(1)} ko gzippés`);
console.log(`  poids du module     : ${(gzipSync(Buffer.from(contenu)).length / 1024).toFixed(1)} ko gzippés`);
