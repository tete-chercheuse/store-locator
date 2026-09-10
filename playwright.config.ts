import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  // Les démos chargent le style et les tuiles depuis OpenFreeMap. Un réessai
  // absorbe un aléa réseau ponctuel sans masquer une régression reproductible :
  // contrairement à un filtre sur le texte des erreurs, un réessai reste visible
  // dans le rapport, marqué « flaky ».
  retries: 1,
  use: {
    baseURL: 'http://127.0.0.1:4173',
    headless: true,
  },
  webServer: {
    command: 'npm run demo:serve',
    port: 4173,
    reuseExistingServer: true,
  },
});
