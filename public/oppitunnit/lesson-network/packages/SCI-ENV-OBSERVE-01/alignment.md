# SCI-ENV-OBSERVE-01 — Lite comparison, revision 1

Read 2026-10-29. Exact NodeSpec.id: `SCI-ENV-OBSERVE-01`, stop `Tarkka silmä`, node revision `AUDIT_REV = audit1-2026-10-28`; global fallback `lite181-2026-10-27`. See actual source hashes in lesson.json. Canonical objective: **Havainnon tekeminen ilmiöstä tai kohteesta**, grade 1–2, pedagogically_derived, foundation split from SCI-ENV-OBS-01. No required/strong relations or prerequisite groups. Description/recording are separate downstream KCs; supported short statements here do not claim to assess them.

## Actual inventory

- Intro: Aava studies the shore and looks carefully; goals.ts says look closely and tell what was seen.
- Demo 1: `lookScene({kind:'lehti',color:0,mark:true})`, colour then hole, notes appear, proposed cause is stamped as not visible. Demo 2: brown smooth mushroom, toxicity claim is not revealed by picture. Both are actual timed drawing sequences in science.ts, not in a separate animation file.
- Objects: leaf, shell, mushroom; three colours per kind; mark boolean. MARK pairs include hole/intact, stripes/no stripes, dots/smooth. EXPL contains caterpillar/previous fall date, shell age/wave, mushroom toxicity/overnight growth. None can be resolved from the given still picture.
- `match` → `choice`: match both colour and mark, specific distractor feedback; hint compare colour then small marks. `feature` → `choice`: visible mark vs its opposite; hint look carefully, explanation repeats mark. `colour` → `choice`: supplied image colour, not typical colour knowledge, specific feedback and hint.
- `sort` → `sort`: classify two visible facts and two EXPL claims as picture-visible or guess; per-item reasons, look-at-the-picture hint, concluding explanation.
- `transfer` → `choice`: visible positive mark versus two EXPL claims; reasons say claim could be true but not visible; hint distinguishes observation and guess.
- `kit.ts/cases`: guided/independent/retrieval select among the four normal keys; transfer uses its own branch. `families.ts` has no special KC override: choice outcome is selecting an option, sort outcome is sorting pictures. Neither default proves conducting an observation of a physical object. No special scope task-context declaration for these families was found.
- `LESSON_AUDIT.md` row 66 records observation animation, observation/guess sorting and why feedback. It does not supply learner validation. `COVERAGE.md` omits `sort` and says one demo although actual source has two. Imported PEDAGOGY_REFERENCES contains broad references but no targeted primary observation/inference lesson. New retrievals are documented in lesson.json/research.md.
- Actual engine/types.ts NodeSpec/Item/Task contract read; no persistence/evidence engine is imported here. SOL_INTEGRATION.md's eight-task list is an older description.

## Authored comparison

Inherited: named Aava, leaf hole, close looking, visible fact versus suggested cause, picture limit. Extended: original two-sided leaf model with a reverse-only spot, original cup diagram, visual evidence versus tactile information, optional known-paper senses activity, possibility of multiple causes, optional harder case (even a nearby caterpillar does not prove it made the hole). No voice confirmation, mandatory audio, shape naming, scored writing or recording.

Corrected locally: observation is not only seeing; inference is a possible evidence-based explanation, not automatically false. Leaf hole and cup droplets appear in fully explained examples before practice. Safe sensory observation has an adult-guided physical option; the screen cannot verify it. Avoids teaching texture from absent dots: a still drawing does not establish smoothness. No mushroom tasting, handling or identification exercise. Static body remains a complete teaching sequence without module. Module adds voluntary turning and four short feedback checks; choices can be revisited or skipped. No storage, mastery claim or game route invented.

## Reconciliation for Opus

1. Update COVERAGE.md to include `sort` and the two actual demos.
2. The plain `sort`/`lookScene` wording can turn all unpictured statements into “arvaus”. Prefer distinguishing a plausible explanation from a directly observed fact without labelling the explanation false.
3. Consider replacing `Sienen hattu on sileä` as something visually proven merely by absence of drawn dots. Describe only the shown feature or obtain appropriate physical observation.
4. Broaden the conceptual explanation to senses beyond sight while keeping screen evidence explicitly visual. Do not convert a correct screen choice into physical observation or safety competence.

Proposals only; no Lite or canonical modifications. Independent content/alignment review and human review are pending.

## Effective registry check

`src/content/index.ts` ALL/NODES composition, goal filling, SIM_SHARE and SIMS wrapper were read alongside the entire `motionsims.ts`. This exact ID is absent from SIMS. Thus no `sim` family is added and its audit node revision remains effective. Other environmental motion IDs are separately mapped; they are not this general observation/direct-comparison KC. Registry, SIMS and kit source hashes are included in lesson.json.

## Technical verification — 2026-10-29

Own Node tests pass (7 tests total across the two assigned packages). Temporary isolated Chromium preview at 390×844: all declared images loaded, every practice button exceeded 44 px height, no horizontal overflow or page JS errors, correct and wrong feedback checked, Enter activation worked. Pause disabled native child buttons; reset retained the paused state; resume restored controls. Dispose twice was harmless and detached listeners; remount advanced exactly once. Static worked examples remained visible with JavaScript off. Full-page and practice screenshots were visually inspected; labels were enlarged after the first inspection. Screenshot/harness files reside only under /tmp (sammakko-own-two-browser.mjs, KC-practice.png, KC-full.png). This bypassed no shared build: it mounted the actual package module in an isolated copy with the current shell CSS. Shared compiled-page integration remains the main agent’s verification. No independent review or human review has happened.
