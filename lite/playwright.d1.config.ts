// Isolated D1 diagnostics; the standard production contract stays on 5202/5203.
import { defineConfig } from '@playwright/test';
import config from './playwright.config';
export default defineConfig({
  ...config,
  use: { ...config.use, baseURL: 'http://127.0.0.1:5255/' },
  webServer: [
    { command: 'npx vite preview --host 127.0.0.1 --port 5255 --strictPort', url: 'http://127.0.0.1:5255/', reuseExistingServer: false },
    { command: 'npx vite preview --base /lite/ --host 127.0.0.1 --port 5256 --strictPort', url: 'http://127.0.0.1:5256/lite/', reuseExistingServer: false },
  ],
});
