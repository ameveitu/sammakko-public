// Exact launch scope through the actual production UI, without a solution oracle.
import { defineConfig } from '@playwright/test';
import base from './playwright.config';

export default defineConfig({
  ...base,
  testDir: 'launch-tests',
  timeout: 600_000,
  outputDir: 'launch-browser-test-results/scope',
});
