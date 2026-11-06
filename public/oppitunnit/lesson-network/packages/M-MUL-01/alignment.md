# Actual Lite alignment — M-MUL-01

Frozen canonical objective: **Kertolasku yhtä suurten ryhmien toistumisena**, grades1-2, procedure/atomic, entrynone. Prerequisite groups kept exactly: `[{"all_of": ["M-ADD-01"], "rationale": "Yhtä suurten ryhmien toistuminen rakentuu yhteenlaskun yhdistämismerkityksen päälle."}]`.

Required M-ADD-01 only. M-NUM-16 is strong support, not compulsory skip-count/memorised table gate. Repeated addition and multiplication notation explicitly introduced. Fixed group-factor description is not used to reject a commuted true expression.

Source `src/content/arith.ts`, actual revision audit1-2026-10-28 (valid same); global fallback lite181-2026-10-27. Full raw NodeSpec and immutable source hashes in lesson.json. index.ts registers this spec; no SIMS overlay. Families registry defaults apply, with no target-specific declaration/activity-use/dynamic rule.

## Actual demos

- packScene(marja,3,2): whole bags fill, cumulative2/4/6, addition then product
- packScene(simpukka,4,3): factor roles explicitly described

## Actual family inventory

- `total` / choice: k2..4,g2..4. Add all bag contents. Distractor filtering avoids numeric collision at2×2 and feedback uses distractor value.
- `expr` / choice: k2..4,g2..5 with g!=k. Select repeated addition, not free multiplication sentence creation; hint one addend per bag.
- `pack` / pack: k2..4,g2..4. Construct each bag count; widget taps+undo, auto speech and submission lock are legacy UI, not lesson requirements. Legacy check findIndex alone accepts empty or sparse counts; new dense exact guards do not.
- `equal` / choice: k3,g2..4. Choose equal bags vs one altered by±1.
- `transfer` / choice: k3/4,g2/3,extra1..3. Add loose objects once after product; no extra to every group.

Intro/reward/demo/hints/explanations/transfer are retained verbatim in metadata rawNodeSpec for comparison. Rewards remain unapproved legacy claims; no awarded learner state is imported.

## Audit and reconciliation

audit/LESSON_AUDIT.md overview23 and equal-groups critique/correction after ADD-01: adds pack microgame, fixes total feedback mapping and expr/transfer language. Coverage stale: omits pack family/task and keeps old global revision; actual node audit1.

Native per-group amounts construct the representation with few clicks; specific group mismatch precedes final total check. Same-sum unequal repair contrasts2/3/1 with2/2/2. Transfer shows4×3+2. Optional stepped model separate from practice preserves valid verdict. No semantic-factor-choice expansion in legacy runtime.

Scope: Core3 groups2, repair2/3/1 to2/2/2, transfer4 groups3 plus2 loose. Each group controlled by a native amount0–6; report whole total. Optional separate3×2 step model. Finite context, no unrestricted expression parser.

Limits: Constructing supplied group counts and writing total is bounded practice; no free equation writing, physical packing, independent retention, fluency, efficacy or personal mastery claim.

Lite, graph, registry and shared runtime remain unedited. Historical audit test passes do not validate this new lesson. Publication/licensing and human/learner review remain separate.
