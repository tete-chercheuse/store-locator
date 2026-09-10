#!/usr/bin/env node
/**
 * Importe un style MapLibre exporté depuis Maputnik vers le module embarqué.
 *
 *   node scripts/import-style.mjs ~/Downloads/mon-style.json
 *
 * Valide le style, normalise ce que les types de MapLibre refusent alors que
 * son parseur l'accepte, puis réécrit `src/styles/default-style.ts`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { validateStyleMin } from '@maplibre/maplibre-gl-style-spec';

const source = process.argv[2];

if(!source) {
  console.error('Usage : node scripts/import-style.mjs <chemin-du-style.json>');
  process.exit(1);
}

const style = JSON.parse(readFileSync(source, 'utf8'));

const erreurs = validateStyleMin(style);

if(erreurs.length) {
  console.error(`Style invalide, ${erreurs.length} erreur(s) :`);
  erreurs.forEach((e) => console.error('  ' + e.message));
  process.exit(1);
}

/**
 * Maputnik peut laisser un paramètre surnuméraire sur `linear`, reste d'un
 * passage depuis `exponential`. Le parseur de MapLibre l'ignore et son
 * validateur ne s'en plaint pas, mais ses types exigent `["linear"]` seul.
 * `["linear", 1]` est mathématiquement identique : la normalisation ne change
 * donc rien au rendu.
 */
let normalises = 0;

const normalise = (noeud) => {
  if(Array.isArray(noeud)) {
    if(noeud[0] === 'linear' && noeud.length > 1) {
      normalises += 1;
      return ['linear'];
    }

    return noeud.map(normalise);
  }

  if(noeud && typeof noeud === 'object') {
    return Object.fromEntries(Object.entries(noeud).map(([k, v]) => [k, normalise(v)]));
  }

  return noeud;
};

const propre = normalise(style);

// Les métadonnées d'éditeur ne servent à rien au runtime.
delete propre.metadata;
propre.layers?.forEach((couche) => delete couche.metadata);

/**
 * Maputnik ajoute ses propres clés à la racine — un `id` interne, notamment.
 * MapLibre les ignore au runtime, mais son type `StyleSpecification` les
 * refuse. On ne garde donc que les clés de la spécification, en journalisant
 * ce qui est écarté pour que rien ne disparaisse en silence.
 */
const CLES_SPEC = new Set([
  'version', 'name', 'metadata', 'center', 'centerAltitude', 'zoom', 'bearing',
  'pitch', 'roll', 'light', 'lights', 'sky', 'terrain', 'fog', 'projection',
  'sources', 'sprite', 'glyphs', 'transition', 'layers', 'state', 'schema',
  'imports', 'camera', 'indoor', 'iconsets', 'models',
]);

const ecartees = Object.keys(propre).filter((cle) => !CLES_SPEC.has(cle));

for(const cle of ecartees) {
  delete propre[cle];
}

const polices = new Set();

for(const couche of propre.layers ?? []) {
  const police = couche.layout?.['text-font'];

  if(Array.isArray(police)) {
    police.forEach((p) => typeof p === 'string' && polices.add(p));
  }
}

const contenu = `/**
 * Style vectoriel par défaut : une variante de OpenFreeMap Bright.
 *
 * **Données générées — ne pas retoucher à la main.** Repasse par Maputnik, puis :
 *
 * \`\`\`bash
 * node scripts/import-style.mjs <ton-export.json>
 * \`\`\`
 *
 * Embarqué plutôt que référencé par URL : c'est un aller-retour réseau de moins
 * sur le chemin critique du premier affichage. Pour revenir au style public,
 * \`OPENFREEMAP_BRIGHT\` reste exporté par la librairie.
 *
 * Polices utilisées : ${[...polices].sort().join(', ') || 'aucune'}.
 * La valeur par défaut de \`clusters.textFont\` doit figurer dans cette liste,
 * sinon le compteur des clusters ne s'affichera pas.
 */
import type { StyleSpecification } from 'maplibre-gl';

const style: StyleSpecification = ${JSON.stringify(propre)};

export default style;
`;

writeFileSync('src/styles/default-style.ts', contenu);

const brut = JSON.stringify(propre).length;

console.log(`Style importé depuis ${source}`);
console.log(`  couches            : ${propre.layers?.length ?? 0}`);
console.log(`  sources            : ${Object.keys(propre.sources ?? {}).join(', ')}`);
console.log(`  polices            : ${[...polices].sort().join(', ') || 'aucune'}`);
console.log(`  poids              : ${(brut / 1024).toFixed(1)} ko, ${(gzipSync(Buffer.from(contenu)).length / 1024).toFixed(1)} ko gzippés`);
console.log(`  interpolations normalisées : ${normalises}`);
console.log(`  clés hors spécification écartées : ${ecartees.length ? ecartees.join(', ') : 'aucune'}`);
