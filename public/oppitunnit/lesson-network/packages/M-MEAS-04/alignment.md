# Actual Lite alignment — M-MEAS-04

Frozen canonical objective: **Pituuden mittaaminen yksikön avulla**, grades1-2, procedure/atomic, entrynone. Prerequisite groups kept exactly: `[{"all_of": ["M-MEAS-03"], "rationale": "v0.1:n required-esitiedot siirretty v0.2:ssa eksplisiittiseen AND-ryhmään."}]`.

Required M-MEAS-03 (centimetre and ruler interval). Iteration/tiling applied procedurally; no extra M-MEAS-01 hard gate, conversion fluency, fraction or object naming demand. Screen geometry not physical cm calibration.

Source `src/content/added181.ts`, actual revision audit1-2026-10-28 (valid same); global fallback lite181-2026-10-27. Full raw NodeSpec and immutable source hashes in lesson.json. index.ts registers this spec; no SIMS overlay. Families registry defaults apply, with no target-specific declaration/activity-use/dynamic rule.

## Actual demos

- layScene(5): sequential1cm unit copies
- rulerScene(2,8): count6 intervals after moving stick
- twoUnitScene(6,2): same length6 small or3 large units

## Actual family inventory

- `units` / numeric: n3..9. One labelled1cm piece each; count all units; whyAt n±1.
- `offset` / numeric: a1..4,len3..7,b=a+len. Ruler12, length intervals, whyAt len+1 vs endpointb; same-key collision at a1 gives endpoint feedback precedence.
- `unitSize` / choice: big2/3,n2..4. Same object; smaller units give more pieces; picture two independently sized SVG viewports needs caution.
- `transfer` / choice: a3..6,len4..8,b=a+len. Broken ruler14; reject endpoint length and tick-count error.

Intro/reward/demo/hints/explanations/transfer are retained verbatim in metadata rawNodeSpec for comparison. Rewards remain unapproved legacy claims; no awarded learner state is imported.

## Audit and reconciliation

audit/LESSON_AUDIT.md overview19 and detailed M-MEAS-04 lines301ff.3 actual demos vs2 coverage. whyAt collision a1 noted by audit. Current unitRow rect widths unit-2 leave visual gutters although comment says no gaps; original authored tile boundaries use true abutment.

Constructive layout has individual piece-start controls, add/remove and shared geometry. Check sorted coverage, then report value/unit; arbitrary row order accepted. Detect gap, overlap, start/end faults separately. A correct numeral cannot hide bad layout. Both6cm and correctly named piece count accepted. Helper boundary overlay preserves still-valid answer.

Scope: All target lengths6cm; targets0..6 or2..8 in model coordinates. Selected piece1cm or2cm, maximum8 pieces within0..12cm drawing; positions editable in1cm steps. Report6cm or correct number of selected-size pieces. No fractional remainder piece.

Limits: Virtual tiling and reported measurement do not verify physical alignment, ruler handling, reading strategy, independence or learning efficacy.

Lite, graph, registry and shared runtime remain unedited. Historical audit test passes do not validate this new lesson. Publication/licensing and human/learner review remain separate.
