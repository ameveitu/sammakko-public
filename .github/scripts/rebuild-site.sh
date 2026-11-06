#!/usr/bin/env bash
# Rebuild from the checked commit, and compare every path and byte with the gated jobs.
set -euo pipefail
(cd lite && npm ci && npm run build)
(cd public/oppitunnit && npm ci && SAMMAKKO_SITE_PACKAGE=1 node lesson-network/build.mjs)
test "$(bash .github/scripts/tree-digest.sh lite/dist)" = "${LITE_DIGEST:?}"
test "$(bash .github/scripts/tree-digest.sh public/oppitunnit/lesson-network/site)" = "${LESSON_DIGEST:?}"
