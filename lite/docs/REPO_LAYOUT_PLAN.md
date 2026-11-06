# Historical plan — superseded by the current repository layout

This document preserves the pre-migration plan. The current layout and delivery workflow are defined by [the root README](../../README.md) and [DELIVERY_FI.md](../../docs/DELIVERY_FI.md). The private monorepo move and G01–G03 integration have since been performed; the original text below is historical, not a pending instruction.

---

# Repository layout plan: `lite/` and later `full/`

Status: plan only. Nothing here has been done. The move is a separate pull request of its own, after the GitHub review 1 fixes (`review-gh1-storage-safety`) are merged.

## Goal

Today the repository root *is* Sammakko Lite. Later the same repository should also hold the full Sammakko client:

```
lite/   Sammakko Lite (this code, moved unchanged)
full/   the stand-alone full client (later; may connect to the main Sammakko servers when the user chooses)
shared/ only if something is really shared later; not created in the move PR
```

## Rules for the move PR

1. **Move only.** `git mv` of the current files into `lite/`. No code, content, test or `rev` change in the same PR, so the diff is reviewable as renames (`git diff -M --stat` shows 100 % renames, except the paths listed in step 3).
2. **Source layout is not URL layout.** Lite is built with `base: './'`. Every asset, `lite-runtime.json`, `canonical-ids.json` and the character PNGs are fetched relative to `index.html`, so where the source sits in the repository does not change any URL. A deployment path (for example `/lite/`) is chosen at deploy time, not by the folder name.
3. **Paths that must change** (and nothing else):
   - `.github/workflows/ci.yml`: `working-directory: lite`, `cache-dependency-path: lite/package-lock.json`, `node-version-file: lite/.nvmrc`, artifact path `lite/test-results/`.
   - `.claude/launch.json` (local only): the `cwd` of the Lite configurations.
   - Documentation links that use repository paths (`docs/…`, `public/…`) from outside `lite/`.
4. **Save compatibility.** The `localStorage` key stays `sammakko-lite-2` (and the backup key `sammakko-lite-2-unreadable`). The full client must use its own key. Lite saves are per origin: a deployment on a new origin starts with an empty save, which must be said in the release note, not "fixed" by sharing keys between apps.
5. **KC route.** `#kc/<encodeURIComponent(id)>` and `lite-runtime.json` stay the same. Sol's bridge (`docs/sol/LITE_KC_BRIDGE.md`) resolves links relative to the deployed `index.html`, so it needs no change.

## Checks for the move PR

- `npm ci && npx tsc --noEmit && npx vitest run && npx vite build` inside `lite/`, same counts as before the move.
- `cmp lite/dist/lite-runtime.json lite/public/lite-runtime.json`.
- The Playwright suite on the served build at the root **and on a subpath**: serve `lite/dist` under `/lite/` (for example `vite preview --base /lite/` or a static server with a prefix) and check:
  - the first load, the 24 character PNGs and the fonts load (no 404 in the network log);
  - `lite-runtime.json` and `canonical-ids.json` load from the subpath;
  - `#kc/` known / unknown / malformed links, and reload on the subpath keeps the page and the save;
  - the two-tab regression.
- No test, item manifest or `rev` changes in the diff.

## Not in the move PR

Any feature, the full client, a backend, accounts, curriculum changes, or deployment.
