# SCI-ENV-TOOL-01 — actual Lite alignment / draft revision 1

Canonical objective: **Yksinkertaisen tutkimus- tai mittausvälineen käyttäminen**. Grade 1–2; procedure; domain_entry; mastery role atomic. Required relation is SCI-ENV-SAFE-01, type safety_gate: practical safety condition, explicitly not a conceptual hard prerequisite. Strong prerequisite support: SCI-ENV-OBSERVE-01. Canonical groups are empty; do not manufacture an all_of group or conceptual lock.

Actual source saari2.ts `SAARI2_NODES`, exact NodeSpec.id `SCI-ENV-TOOL-01`, stop `Välinevaja`, audit revision `audit1-2026-10-28`, index fallback `lite181-2026-10-27`. Read registry index.ts and motionsims.ts; this ID is absent from SIMS, so no `sim` family. families.ts uses default outcomes; scope task-context rows have no specific declaration for this ID. These defaults do not demonstrate real tool handling. All relevant byte hashes are in lesson.json.

## Source inventory

Intro says every measurement tool has its purpose. Goal (goals.ts) is selecting a tool, real use with adult. Reward additionally says read a value from a picture.

Three demos from toolanim.ts: `matchToolScene` pairs water/boat/stone/floating with temperature/length/mass/time tools; `zeroScene(7)` slides stick from ruler edge to zero, correcting initially too-small reading (5.7cm in the diagram); `tareScene(300,50)` removes stone, zeros empty scale, reweighs. Captions and geometry read, not just NodeSpec names.

Families: `tool` choice (thermometer, ruler, scale, stopwatch, measuring vessel) with quantity/unit hints; `use` choice (zero start, wait for thermometer equilibrium, empty scale zero); `read` numeric ruler length from nonzero start, length = end minus start with endpoint/tick error feedback; `tare` numeric offset subtraction with wrong-reading/addition reasons; `pick` sort object names into length/mass/temperature categories, hints and supplied explanations. `transfer`: choose two measurements now/one week later for plant growth, explains difference. Normal phases share five base generators via kit.ts/cases, transfer dedicated. Actual types.ts supports these forms. Source world is Aarresaaristo, whereas authoritative canonical band is 1–2.

Audit row124 and detailed toolanim/read/tare/pick discussion inspected; reported historical tests are not current proof. COVERAGE.md has older tool/use-only family rows and two-demo count; actual code has five normal families and three demos.

## Authored treatment and source comparison

The canonical OR wording permits a simple research tool. We select a hand magnifier, using the primary GLOBE/UCAR teaching activity to compare the same material with/without magnification and adjust distance. Original paper-dot and fabric-thread diagrams make visible what changes (view) and what does not (object). No copied worksheets or story. ACS instructions/adult-permission principles support the safe tabletop option.

Misconception: a larger-looking dot did not grow. Transfer: the same looking procedure reveals threads in familiar fabric. Module action changes selected area and three qualitative focus states, checks both location and view and gives separate feedback. It is explicitly a schematic, not a ray-optics simulation; no units or numerical readings. Physical practice is optional, supervised and restricted to familiar paper/fabric; adult chooses intact age-appropriate hand lens. This screen cannot prove grip, visual acuity, safe operation or actual observation. Text alternative supplies detail as support. No storage/mastery claims.

## Reconciliation for Opus

- Refresh source coverage/demo inventory.
- read/tare arithmetic and unit reading go beyond the canonical node's declared safety/observation parents. Either teach/support these dependencies per task or reserve them for suitable later lessons. Do not require subtraction to begin using a simple research tool.
- pick names only an object, but a stone can have length, mass and temperature. State the measurement question, not a unique inherent tool for each object name.
- Nonzero-start ruler methods are valid when handled as end-minus-start; avoid treating zero alignment as the only mathematically possible method.

No Lite/graph edits. Independent content/alignment and human reviews pending.

## Technical verification — 2026-10-29

9 Node testcases across the three assigned packages passed, including rejected/boundary cases. The isolated source package loader/composer and asset hashes passed. Actual constructive practice actions, correct/wrong feedback, Enter activation, native targets >44px, all image loads, no horizontal overflow, pause/reset/resume, double-dispose and remount with exactly one action per click passed in Chromium. Views: phone390×844 and desktop1280×900; static examples also checked without JS. Full phone and practice screenshots were visually inspected; data-card images were compacted locally after discovering the shared shell stretches inline SVGs. No shared CSS changed. Preview/harness and screenshots are under /tmp, not generated lesson-network outputs. This is an author technical self-check, not independent approval, physical compliance or human validation. Main must still build and review integration.

## B02 bounded magnification correction — revision 2, 2026-10-29

Review identified invented features in the dynamic zoom and inconsistent static dot spacing/radius factors. Corrected only this package: each dynamic paper view now has the same four dots; fabric preserves two horizontal and two vertical threads, including colour. One local feature representation is reused at scale1 and scale2.5 with translation, uniformly scaling coordinates, radii and line widths. Static magnifier.svg likewise uses identical four-dot geometry and uniform scale2.5. fabric.svg, body, shared CSS and other packages were left alone. Six scoped Node tests passed, including independent parsing of rendered SVG counts/geometry and static asset geometry. Original revision1 browser/self-check records remain historical; renewed independent review and shared integration belong to main. No shared build run.
