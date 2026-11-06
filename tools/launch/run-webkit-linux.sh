#!/bin/sh
# Run inside the pinned Playwright Linux image. Host sources are read-only.
set -eu
mkdir -p /tmp/sammakko-lite
cp /source/lite/package.json /source/lite/package-lock.json /source/lite/playwright*.ts /source/lite/vite.config.ts /tmp/sammakko-lite/
cp -R /source/lite/e2e /source/lite/dist /tmp/sammakko-lite/
cd /tmp/sammakko-lite
npm ci --ignore-scripts --no-audit --no-fund
save_diagnostics() {
  sammakko_exit=$?
  if [ -d launch-browser-test-results ]; then
    cp -R launch-browser-test-results /evidence/
  fi
  exit "$sammakko_exit"
}
trap save_diagnostics EXIT
PLAYWRIGHT_JSON_OUTPUT_FILE=/evidence/lite-webkit-cli.json node node_modules/@playwright/test/cli.js test --config=playwright.launch.config.ts --project=webkit --reporter=list,json
