import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { port: 5200, strictPort: true },
  test: { environment: 'node', exclude: ['e2e/**', 'launch-tests/**', 'publication-tests/**', 'node_modules/**'] },
} as never);
