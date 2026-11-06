# M-ADD-SUB-01 — actual Lite and frozen role

{
  "canonical": {
    "id": "M-ADD-SUB-01",
    "subject": "mathematics",
    "grade_band": "1-2",
    "topic_area": "Luvut ja laskutoimitukset",
    "parent_concept": "Laskutoimitusten yhteys",
    "title": "Yhteen- ja vähennyslaskun käänteinen yhteys",
    "short_description": "Yhteen- ja vähennyslaskun käänteinen yhteys",
    "source_basis": "direct_curriculum",
    "curriculum_refs": [
      "OPH-POPS2014-MATH-VL1-2-S2"
    ],
    "evidence_notes": "Ehdokasnoodi. Arviointinäyttö, virhekäsitykset ja oppimispolku täsmennetään sisältösuunnittelussa.",
    "status": "candidate",
    "required_root": false,
    "root_kind": "none",
    "node_kind": "procedure",
    "relations": [
      {
        "id": "M-ADD-01",
        "relation_type": "prerequisite",
        "strength": "required",
        "rationale": "M-ADD-01 on tämän osaamiskohteen välitön välttämätön esitieto."
      },
      {
        "id": "M-SUB-01",
        "relation_type": "prerequisite",
        "strength": "required",
        "rationale": "M-SUB-01 on tämän osaamiskohteen välitön välttämätön esitieto."
      }
    ],
    "prerequisite_groups": [
      {
        "all_of": [
          "M-ADD-01",
          "M-SUB-01"
        ],
        "rationale": "v0.1:n required-esitiedot siirretty v0.2:ssa eksplisiittiseen AND-ryhmään."
      }
    ],
    "foundation_entry": false,
    "zero_required_indegree": false,
    "foundation_entry_rationale": null,
    "entry_role": "none",
    "mastery_role": "atomic",
    "concept_path": [
      "Matematiikka",
      "Luvut ja laskutoimitukset",
      "Laskutoimitusten yhteys"
    ]
  },
  "node": "facts.ts274–338; explicit goal; audit1-2026-10-28",
  "demo": [
    "familyScene(simpukka,3,4): join, operand reversal, removeB, removeA, four facts accumulate; opacity/lift indicates removed rather than separately located sets",
    "lineHops5,+3 then8,-3 actual separate timelines; no shared-clock claim"
  ],
  "families": {
    "family": "a,b2..9;c=a+b, choose related subtraction from two false equations",
    "undo": "a2..9,b2..8; after receipt c, recover originala with subtraction/check addition",
    "check": "c8..18,b2..c−2; choose a+b=c to check given subtraction; other additions are mathematically true but unrelated",
    "write": "a2..8,b2..9 bumped ifequal; buildfact c−b=a; actualsameFact validates arithmetic+fullbag tokens and accepts c−a=b and mirrored equations",
    "transfer": "a3..9,b2..9: select nonmember a−b=c vs two validfamilyfacts"
  },
  "media": "Actual familyScene/lineHops, countanim side helpers, anim/ease/Clock; build widget reusable tokens not one-use; sameFact is arithmetic and tokenbag, no domain-specific scope expansion needed.",
  "reconciliation": [
    "Use spatially separate returned/removed pieces, fixedidentities/sizes and conservedwhole; no invisible disappearance or inferredthirdremoval.",
    "Do not require four distinct equations whena=b; zero edge explicitly optional/support.",
    "Small fixed0..10 scope and guided subtraction completion; no arbitrary legacy semanticchoice extension, parser or multiplication.",
    "COVERAGE omits write and 3rddemo; actualsource wins."
  ]
}

## Authored treatment

Bounded concrete inverse relation with all original pieces continuously accounted for; five transitions join, removeB, restoreB, removeA, restoreA. Actual sameFact accepts both valid subtractions; authored fixed-format completion explicitly checks the corresponding triples instead of broadening the general parser. Equal parts produce one distinct subtraction, zero cases explicit optional exploration. Main inverse-number task and optional fact completion have separate feedback; playback is guidance, not a response event.

Author-developed guided number response and one subtraction-completion with fixed symbols. Both related subtractions accepted, equal parts deduplicated; not unconstrained sentence construction, independent strategy or full fact-family mastery.

Both input/change commits, explicit visible-current-value checks and strict primitive selectors. Exact dense arrays/own indices and finite bounds; no identity/order rejection of equivalent sets. Native controls remain stable for focus. Pause/reset/dispose and listener/frame ownership bounded to this host; no storage, personal history or new shared learning policy. Different-agent independent and human reviews remain pending. Scope is exactly this selected node;509 scaffolds and graph unchanged.
