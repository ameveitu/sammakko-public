# Lite and frozen alignment

{
  "definition": "src/content/written.ts:564–625",
  "objective": "Interpret a multiple-operation expression, with item-dependent operation prerequisites.",
  "demo": "Three exprScene demos2+3×4,(2+3)×4,18:(4−1)+2×5.",
  "families": [
    "mulFirst choice",
    "paren numeric",
    "steps three ordered slots",
    "sub numeric",
    "transfer ticket+programme choice"
  ],
  "hints": "Identify multiplication, grouped bracket part; provide operation-specific wrong-value explanations and transferred repeated per-person total.",
  "media": [
    "writtenanim.ts138–211 exprScene: finite row reductions, actual precedence; timing is illustrative, not physics",
    "engine/types.ts numeric/place/build contracts"
  ],
  "audit": "LESSON_AUDIT.md112 and653–655: notebook/steps, missing whyAt/hints and prior overflow fixed in Lite; reported historical browser checks are not our evidence.",
  "coverageDifference": "COVERAGE113/301,878–881 omit steps and still list2demos; actual NodeSpec has3.",
  "extends": "Default+/- only route; original group drawings before general rule, controllable one-part reduction, optional full visited rows. Short part-construction task accepts both independent complete parts of the complex expression. Numeric answers remain direct.",
  "corrected": "Do not require multiplication/division globally. Do not treat one canonical displayed route as all valid reasoning. Every shown = must compare same-valued full expressions.",
  "limits": "Whole arithmetic with exact nonzero division in authored scope; no powers, variables or arbitrary algebra-equivalence engine. Short answers do not prove independent full procedure."
}

Full frozen canonical node/prerequisite groups and exact source hashes are in lesson.json. No Lite graph, game or material files changed.
