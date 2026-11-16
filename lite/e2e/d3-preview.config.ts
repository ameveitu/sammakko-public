import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: '.', testMatch: process.env.D3_INCLUDE_D2 ? ['**/d3-*.spec.ts', '**/d2-progression.spec.ts'] : '**/d3-*.spec.ts', workers: 1, retries: 0, reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:5335/', trace: 'retain-on-failure' },
  projects: [
    { name: 'chromium', testIgnore: '**/d3-touch.spec.ts', use: { ...devices['Desktop Chrome'] } },
    { name: 'touch-chromium', testMatch: '**/d3-touch.spec.ts', use: { ...devices['Pixel 7'] } },
  ],
  webServer: [{ command: 'npx vite preview --host 127.0.0.1 --port 5335 --strictPort', url: 'http://127.0.0.1:5335/', reuseExistingServer: true }],
});
