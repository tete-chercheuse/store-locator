#!/usr/bin/env bash
# Vérifie que le mock `maplibre-gl` reste assignable à l'API réelle.
#
# `tsconfig.json` ne couvre que `src/**`, donc `npm run typecheck` ignore
# `tests/`. Sans ce contrôle, une divergence de signature entre le mock et
# `maplibre-gl` reste invisible : c'est ainsi qu'un test peut rester vert
# pendant que la librairie casse en navigateur.
set -euo pipefail

cd "$(dirname "$0")/.."

npx tsc --noEmit --strict \
  --target ES2022 \
  --lib DOM,DOM.Iterable,ES2022 \
  --module ESNext \
  --moduleResolution Bundler \
  --skipLibCheck \
  tests/mocks/maplibre-gl.ts

echo "mock conforme à l'API maplibre-gl"
