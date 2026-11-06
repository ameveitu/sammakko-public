# Source findings for the Opus implementation

These findings concern the uploaded Lite snapshot. Verify each against the current working branch before changing it; do not reintroduce a defect that has already been repaired. Paths below are relative to the Lite repository.

## Correctness and interaction fixes

| Finding | Source location | Intended correction |
| --- | --- | --- |
| Tap-every-object can earn counting status while the app prints/speaks the number sequence | `src/content/numbers.ts`, `src/ui/widgets.ts`, `src/engine/check.ts` | Keep useful guided play; require the learner's relevant count response for direct counting evidence, or classify the activity as supported practice |
| “Harjoittele lisää” can immediately show the old reward without new attempts | `src/ui/lesson.ts`, `src/ui/worldmap.ts` | Replay has its own session completion condition and starts real new practice |
| Failed retrieval can become “vahva” on immediate return and retry | `src/engine/evidence.ts`, `src/engine/store.ts`, `src/content/world.ts` | Separate immediate practice/recovery from a later recall observation; keep optional continuation |
| Old “secure” state ignores later retrieval errors | `src/engine/evidence.ts` | Use dated bounded observations and current difficulty; a lasting world reward need not imply lasting mastery |
| Every learned descendant infers all required ancestors; wording can overstate what was shown | `src/engine/store.ts`, `src/ui/worldmap.ts` | Retain routing freedom, record the inference source and distinguish it from direct checks |
| Counting taps override quiet mode | `src/ui/widgets.ts`, `src/ui/speech.ts` | Ordinary answer actions respect quiet mode; an explicitly chosen listen action may speak |
| Development clock control appears in ordinary UI | `src/main.ts` | Keep time-travel controls in development/test UI only |
| localStorage failures silently fall back to memory | `src/engine/store.ts` | Keep a usable fallback and display session-only save status |

Counting completion, replay and immediate-retrieval behavior were reproduced in the earlier browser audit. Later-error handling and the remaining listed paths were also inspected in source. These are development findings, not child/teacher feedback.

## Content corrections

- `src/content/saari1.ts`: replacing the first letter `n` corrupts Finnish text such as “Sukeltaja on n metriä.” Use a real placeholder or interpolation.
- `src/content/ranta2.ts` and `saari1.ts`: a question about the digit 4 in 44 must identify which occurrence/place it means.
- `src/content/ranta2.ts`: repair the duplicated number word in the countdown-to-zero example.
- `src/content/physics.ts`: a decreasing curve must be labelled as position/distance from an origin where appropriate, not accumulated distance travelled.
- `src/content/saari2.ts`: tool-choice rewards must not claim demonstrated physical tool use.
- Equation and conversion families: see the task-coverage mappings and scope report in `reference/`. Include the needed supporting skills and apply corrections consistently across families; do not narrow the lessons merely to hold a node count.

## Scope and documentation corrections

`src/data/graph.json` contains 107 nodes, while README/DESIGN still describe 52. `tools/import-graph.mjs` can overwrite the projection with the older 52-node slice; prevent accidental use for this MVP. `tools/import-stem.mjs` documents the 107 selection but relies on an HTML overview absent from the inspected snapshot. Use canonical data and a reproducible projection workflow for the expanded, required-and-strong complete manifest.

The source now has eight task kinds; older prose says seven. The current docs also claim that reading is unnecessary. Replace that audience claim with the owner's current lowercase-reader target. Optional narration can remain.

Preserve the canonical dynamic prerequisite metadata that the Lite projection currently drops. Do not treat every zero-hard-prerequisite entry as a foundation. Preserve all dynamic rules in the final manifest, not only the three visible in the old 107.

## What this list does not require

This is not an instruction to import the full learner model, repair all historical original-Sammakko findings, implement all 690 lessons, or make comprehensive accessibility a Lite release gate. Fix actual defects affecting the stated audience, scoped teaching validity, progression truthfulness or the requested game experience.

