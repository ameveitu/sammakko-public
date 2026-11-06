# SCI-ENV-SAFE-01 — actual Lite alignment / draft revision 1

Canonical objective: **Annettujen turvallisuusohjeiden noudattaminen**. Grade 1–2; node_kind process_skill; entry/mastery role operational; operational_gate true. No required/strong relations or groups. This package preserves those facts but cannot approve physical compliance or unlock a safety gate.

Actual source: thinking.ts `THINKING_NODES`, exact NodeSpec.id `SCI-ENV-SAFE-01`, stop `Turvallinen tutkija`. `AUDIT_REV = audit1-2026-10-28`, global index fallback `lite181-2026-10-27`. Full file hashes are in lesson.json. Registry index.ts merges THINKING_NODES, fills missing goals, and wraps only SIMS-mapped IDs. This ID is absent from motionsims.ts SIMS; there is no additional `sim` family or revision override. families.ts has no specific declaration, and the scope task_context_coverage has no assigned-ID row. Defaults describe response forms, not physical competence.

## Source inventory

Intro explicitly distinguishes stories/pictures from real supervised tools. Goal is recognizing safe conduct; reward also warns about adult presence. This is narrower than the canonical operational wording, honestly so.

Three demos: safeanim.ts `prepScene()` listens, waits, shows goggles and task; `hazardScene('lasi')` stops, backs away and calls an adult; `hazardScene('pullo')` rejects tasting/smelling unknown contents. Read both the timed captions and the actual drawings. prepScene depicts bubbles and goggles, not the harmless paper task used here.

Families `s0`–`s5`: choices from SAFE items on heat/adult supervision, splash goggles, broken glass, unknown bottle, permission/instructions and long hair. Each has specific distractor reasons, a general safety hint and explanation. `order` uses place tokens: full instruction → wait for permission → follow task → clean/wash, with per-slot reasons. `sort` classifies selected SAFE_OK/BAD acts. `transfer` uses water by an electrical cable; tell adult and do not move cable yourself. Normal guided/independent/retrieval phases select from these eight normal keys via kit.ts/cases; transfer is its own branch.

LESSON_AUDIT row65 reports prep/hazard animation, four hazards, ordering/sorting and hints. COVERAGE.md still lists only choices/s0–s5 and says two demos; code now has place/sort and three demos. Historical audit validation is not rerun or claimed as this package's test.

## Authored treatment and source comparison

Inherited: named Aava, listen/read whole instruction, wait for adult permission, do not touch shards, ask for help. Original diagrams are an instruction-to-permission path and a clear unoccupied area around pictured shards. Replaced risky experiment context with actual safe paper observation supervised by an adult. ACS primary guidance corroborates full directions, adult approval and activity-specific protection. Its older classroom booklet corroborates reporting glass breakage and adult cleanup. No fire, chemicals, smelling or tasting experiment is supplied.

Misconception example: familiarity with a tool does not replace this task's instructions/permission. Transfer example: unexpected breakage changes the plan and requires stopping, distance and reporting. The module constructs the actual given instruction sequence; emergency protection cards are accepted in any order, since speaking while remaining away is valid. Card selection is a represented action, not a claim the learner actually read/heard/complied. Static teaching survives without JS. No stored mastery, observations or safety certification.

## Reconciliation for Opus

- Refresh stale COVERAGE family/demo counts.
- Keep operational physical-compliance claims separate from picture recognition/ordering. This canonical safety_gate must not be satisfied by this package's screen answers.
- prepScene's generic goggles step is suitable only when required by the real task's instructions. Avoid implying every observation task needs splash goggles, or that approval alone makes a dangerous activity suitable.

Only proposals in this file; Lite/canonical/shared state unchanged. Independent content/alignment and human review pending.

## Technical verification — 2026-10-29

9 Node testcases across the three assigned packages passed, including rejected/boundary cases. The isolated source package loader/composer and asset hashes passed. Actual constructive practice actions, correct/wrong feedback, Enter activation, native targets >44px, all image loads, no horizontal overflow, pause/reset/resume, double-dispose and remount with exactly one action per click passed in Chromium. Views: phone390×844 and desktop1280×900; static examples also checked without JS. Full phone and practice screenshots were visually inspected; data-card images were compacted locally after discovering the shared shell stretches inline SVGs. No shared CSS changed. Preview/harness and screenshots are under /tmp, not generated lesson-network outputs. This is an author technical self-check, not independent approval, physical compliance or human validation. Main must still build and review integration.
