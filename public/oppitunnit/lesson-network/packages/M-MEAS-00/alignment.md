# M-MEAS-00 — Lite comparison, revision 1

Read 2026-10-29. Exact NodeSpec.id: `M-MEAS-00`, stop `Kumpi pidempi`, node revision `AUDIT_REV = audit1-2026-10-28`; global fallback `lite181-2026-10-27`. These are imported source labels, not this package's approval or revision. Actual source hashes are in lesson.json. Canonical objective: **Mitattavien ominaisuuksien suora vertaaminen**, grade 1–2, pedagogically_derived. No required prerequisites or groups. `M-TH-01` is strong prerequisite support, never a mandatory gate. No counting, shape names or unit symbols assumed.

## Actual inventory

- Intro: Aava builds a pennant and asks which ribbon is longer. Goal in goals.ts includes direct comparison of length and weight.
- Demo: `alignScene([6,7],[4,0])` corrects the displaced-end illusion; `alignScene([5,5],[0,4])` teaches equality. Third demo `balanceScene` compares large light balloon with small heavy stone.
- `aligned` → `ribbons`: unequal integer lengths 3–10, common start; `tricky` → `ribbons`: shorter ribbon starts farther right, visible end can mislead; `equal` → `ribbons`: equal length 4–9 with displaced starts. `rib()` supplies common-start hint and correct explanation, not object names.
- `heavy` → `choice`: balance tipping or level, large/light and small/heavy objects; hints heavier side goes down, explanations and specific wrong-answer reasons. Level case uses identical pictured objects on both sides.
- `transfer` → `choice`: towers on different plinths, compares tower height excluding plinth. Hint and explanation count unit blocks above the plinth. This adds a counting demand to a foundational direct-comparison objective.
- `kit.ts/cases`: guided/independent/retrieval choose from the same four normal family keys, transfer uses its dedicated branch. Not four distinct difficulty levels. `families.ts` contains no special declaration for this KC; default `ribbons` outcome is comparing lengths; default `choice` is selecting an option. Scope task-context rows do not declare these families specially.
- Relevant animations: `alignScene`, `balanceScene`, `towersArt` in measure.ts read directly; measureanim.ts provides later unit/ruler scenes, not the direct-comparison demo. Those later-unit scenes are outside this lesson's requirement.
- `LESSON_AUDIT.md` row 12 and dedicated section describe the added heavy family, moving common-start demos, ribbon error feedback and repaired balance tilt. Its browser/tsc/vitest statements are historical source claims, not tests rerun here.
- `COVERAGE.md` row and family inventory omit `heavy`; detailed demo count says two though current source contains three. `SOL_INTEGRATION.md` describes only eight task types, while actual engine/types.ts includes more. Current code inventory above takes precedence; no Lite change made.

## Authored comparison

Inherited: Aava, two ribbons, common start, equality, separate height/weight attributes. Extended: real paper-strip bridge, original before/after SVG and constant-width step exploration with no unit ticks, three deterministic pairs, named A/B labels independent of colour, teacher-supported offline transfer, exit prompt. Corrected locally: tower example aligns floors visually without requiring block counting; equal answer explicitly includes matching end points; no delayed-start claim that comparison is impossible by every method. An unaligned pair can still be answered correctly without being forced to click an alignment button.

Two main examples are explained before practice: misleading ribbon end (misconception), towers with plinth (transfer). Equality is a thinking pause and a separately checked pair. Weight is an optional separate balance example; the main ribbon practice does not assess it. Static text and diagrams remain useful with JS disabled. No efficacy, retention, independence or physical-measurement claim. No game link added; actual game-route decisions remain with the shared resolver.

## Reconciliation for Opus

1. Refresh COVERAGE.md to list `heavy` and three actual demos; do not use its stale rows as complete family inventory.
2. Consider removing mandatory block-counting from direct-height transfer, or declare that task-level dependency explicitly. This package instead compares whole tower heights on a shared floor.
3. `alignScene` initial caption says one cannot know yet when starts differ. Common alignment is a useful method, but not a logical necessity for all ways of judging a visible length. Prefer explaining why **the end position alone** is insufficient.

These are review proposals only. No canonical graph, Lite source, shared runtime, production status or generated file was edited. Content/alignment independent review and human review remain pending.

## Effective registry check

`src/content/index.ts` ALL/NODES composition, goal filling, SIM_SHARE and SIMS wrapper were read alongside the entire `motionsims.ts`. This exact ID is absent from SIMS. Thus no `sim` family is added and its audit node revision remains effective. Other environmental motion IDs are separately mapped; they are not this general observation/direct-comparison KC. Registry, SIMS and kit source hashes are included in lesson.json.

## Technical verification — 2026-10-29

Own Node tests pass (7 tests total across the two assigned packages). Temporary isolated Chromium preview at 390×844: all declared images loaded, every practice button exceeded 44 px height, no horizontal overflow or page JS errors, correct and wrong feedback checked, Enter activation worked. Pause disabled native child buttons; reset retained the paused state; resume restored controls. Dispose twice was harmless and detached listeners; remount advanced exactly once. Static worked examples remained visible with JavaScript off. Full-page and practice screenshots were visually inspected; labels were enlarged after the first inspection. Screenshot/harness files reside only under /tmp (sammakko-own-two-browser.mjs, KC-practice.png, KC-full.png). This bypassed no shared build: it mounted the actual package module in an isolated copy with the current shell CSS. Shared compiled-page integration remains the main agent’s verification. No independent review or human review has happened.
