# M-MEAS-03 — actual Lite inventory and reconciliation

{
  "sourceFile": "authority/production-181-v2/lite/src/content/ranta2.ts",
  "nodeRevision": "audit1-2026-10-28",
  "validRevs": [
    "audit1-2026-10-28"
  ],
  "sourceBuild": "lite181-2026-10-27",
  "phaseRule": "cases: all named branches in guided/independent/retrieval, dedicated transfer; no guidedTags restriction",
  "registry": "index fills GOALS; none of assigned IDs in SIMS, no motion overlay. No own DECL or graph.coverage rows; family kind outcomes use defaults. Dynamic rule null.",
  "auditLimit": "Historical synthetic technical author reports only; no approval/efficacy implied. COVERAGE summaries omit new constructive families and retain stale global revision.",
  "stop": "Mittanauha",
  "icon": "📏",
  "goal": "Opit mittaamaan senttimetreinä ja metreinä.",
  "intro": "Aava mittaa viiritankoa. Pieniä asioita mitataan senttimetreinä, isoja metreinä.",
  "reward": "Osaat valita metrin tai sentin ja lukea viivoitinta!",
  "nodeLines": "ranta2.ts695–767",
  "families": [
    "unit",
    "estimate",
    "mark",
    "ruler",
    "transfer"
  ],
  "taskKinds": [
    "choice",
    "line"
  ],
  "demos": [
    {
      "say": "One centimetre per interval;0→6 counts six gaps",
      "media": "rulerScene(0,6)"
    },
    {
      "say": "Nonzero start2→7; five intervals, end label not length",
      "media": "rulerScene(2,7)"
    },
    {
      "say": "Ten10cm pieces form100cm=1m",
      "media": "metreScene()"
    }
  ],
  "items": {
    "unit": "Pencil/ant/book→cm; classroom/pool/tree height→m. Categorical small/large advice, hand-palm hint.",
    "estimate": "Pencil15cm/15m/1cm, door2m/2cm/20m, frog8cm/8m/80m, bed2m/2cm/20cm. Approximate size knowledge assumed.",
    "mark": "a0..3,len2..6,b=a+len. line0..10 with cm, identify endb. Hint counted intervals; whyAt wrong-origin/one-short/one-long.",
    "ruler": "a0or1..3,len3..7,b<=10. rulerArt10 exact endpoints; answerlen, distractors endpointb andlen±1 de-duplicated.",
    "transfer": "1m vs80/90/95cm, choose longer including equality distractor. Relation supplied in hint."
  },
  "mediaInventory": [
    "startArt(a) ruler geometry",
    "pics.rulerArt default straight stick",
    "measureanim.rulerScene slides stick then counts intervals",
    "measureanim.metreScene10pieces, count10..100",
    "ui/anim.ts actual Clock playback/hidden-tab cleanup",
    "ui/widgets.ts line and engine/check.ts whyAt"
  ],
  "audit": {
    "row": 18,
    "detailLines": "LESSON_AUDIT296–300",
    "coverageOmissions": [
      "mark",
      "third demo"
    ]
  },
  "reconcile": [
    "Keep interval counting and origin repair, with accurate labelled endpoints. Screen pixels are not actual centimetres.",
    "Both m andcm can express any length; teach convenient units, not categorical physical impossibility of the other.",
    "No arbitrary object names, hand-size/body-step exact standards, subtraction gate or long conversion drill."
  ]
}

## Project treatment
Whole centimetre ruler intervals with movable origin; supplied metre100cm relation and alternate1m/100cm answers. Unit concept, not independent physical ruler-use proficiency.

The frozen canonical metadata below is retained exactly. RequiredAND grouping and concept/atomic role are not changed. No new hard number/multiplication/division gates are inferred from Lite examples.

{
  "id": "M-MEAS-03",
  "subject": "mathematics",
  "grade_band": "1-2",
  "topic_area": "Geometria ja mittaaminen",
  "parent_concept": "Pituusyksiköt",
  "title": "Metri ja senttimetri pituuden yksikköinä",
  "short_description": "Metri ja senttimetri pituuden yksikköinä",
  "source_basis": "direct_curriculum",
  "curriculum_refs": [
    "OPH-POPS2014-MATH-VL1-2-S3"
  ],
  "evidence_notes": "Ehdokasnoodi. Arviointinäyttö, virhekäsitykset ja oppimispolku täsmennetään sisältösuunnittelussa.",
  "status": "candidate",
  "required_root": false,
  "root_kind": "none",
  "node_kind": "concept",
  "relations": [
    {
      "id": "M-MEAS-02",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "M-MEAS-02 on tämän osaamiskohteen välitön välttämätön esitieto."
    },
    {
      "id": "M-MEAS-01",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "M-MEAS-01 on tämän osaamiskohteen välitön välttämätön esitieto."
    }
  ],
  "prerequisite_groups": [
    {
      "all_of": [
        "M-MEAS-02",
        "M-MEAS-01"
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
    "Geometria ja mittaaminen",
    "Pituusyksiköt"
  ]
}

## Meaning of the interaction
Length answer is checked, not alignment method. Ruler position can change without invalidating a correct length because the fixedobject and unit stay the same; feedback avoids stale endpointnumbers. A new case, reportedvalue or unit changes answer meaning. Exact1m and100cm alternatives both accepted for metre case. The scaled screen is not an actual physical ruler.

## Runtime and evidence
Owned input/change commits; explicit checks read editable visible answer fields/case. Correct and incorrect verdicts retire after semantic edits; truth-preserving views/helpers preserve valid feedback. Self-contained mount with pause/resume/reset/dispose; no imports/storage/mastery. Ownpuretests and source validation are author technical checks, not independent or human approval. Final compiledsite QA must bind exactrevision after mainbuild. Supplied art and all originalsubjectassets are explicitly hashed.
