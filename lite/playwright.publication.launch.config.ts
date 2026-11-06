// Use the same publication assertions against each supported browser engine.
import { defineConfig, devices } from '@playwright/test';
import base from './playwright.publication.config';

export default defineConfig({
  ...base,
  outputDir: 'launch-publication-test-results',
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
});
