import {defineConfig, devices} from '@playwright/test';

const external = process.env.PUBLICATION_BASE_URL;
export default defineConfig({
  testDir:'publication-tests',
  fullyParallel:false,
  workers:1,
  retries:0,
  timeout:30_000,
  reporter:[['list']],
  outputDir:'publication-test-results',
  use:{baseURL:external ?? 'http://127.0.0.1:5210', trace:'retain-on-failure', screenshot:'only-on-failure'},
  projects:[{name:'chromium', use:{...devices['Desktop Chrome']}}],
  webServer:external ? undefined : {
    command:'node ../.github/scripts/serve-site.mjs',
    url:'http://127.0.0.1:5210/',
    reuseExistingServer:false,
    timeout:30_000,
  },
});
