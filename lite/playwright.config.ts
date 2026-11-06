// Browser checks against the served production build, both at / and /lite/.
// Run `npm run build` first; CI does. Chromium only.
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: { baseURL: 'http://127.0.0.1:5202/', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    { command: 'npx vite preview --host 127.0.0.1 --port 5202 --strictPort', url: 'http://127.0.0.1:5202/', reuseExistingServer: false, timeout: 60_000 },
    { command: 'npx vite preview --base /lite/ --host 127.0.0.1 --port 5203 --strictPort', url: 'http://127.0.0.1:5203/lite/', reuseExistingServer: false, timeout: 60_000 },
  ],
});
