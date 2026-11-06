# M-MEAS-09 — actual Lite inventory and reconciliation

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
  "stop": "Litra ja desi",
  "icon": "🥛",
  "goal": "Opit valitsemaan, mitataanko litroina vai desilitroina.",
  "intro": "Mehua myydään litroina ja desilitroina. Desilitra on pieni mitta, litra iso.",
  "reward": "Litrassa on kymmenen desiä: mehukauppa pyörii!",
  "nodeLines": "ranta2.ts951–1028",
  "families": [
    "unit",
    "ten",
    "compare",
    "fill",
    "transfer"
  ],
  "taskKinds": [
    "choice",
    "fill"
  ],
  "demos": [
    {
      "say": "Ten1dl pours reach1l line",
      "media": "dlFillScene(10)"
    },
    {
      "say": "Eight1dl pours remain below1l line despite8>1",
      "media": "dlFillScene(8)"
    },
    {
      "say": "1l=10dl",
      "media": "static labelled equality"
    }
  ],
  "items": {
    "unit": "Glass/cup/yoghurt→dl;bath/bucket/aquarium→l, small/large choice.",
    "ten": "l1..3→l*10dl versus l*100dl/l dl.",
    "compare": "1l versus6/8/9/12/15dl, compare after supplied10dl relation.",
    "fill": "targets5,7,10,10,12,15,20dl;cap10or20; targetformattedl+dl whereappropriate; steps1dl.",
    "transfer": "l1/2 bottle into2/5dl glasses; asks numberfullglasses, implicitly quotition. Correct distinct from litre*glasssize and totaldl."
  },
  "mediaInventory": [
    "measureanim.dlText mixed wholel+dl",
    "jugBody fixed-width receiving jug with dl ticks/litre lines,rotating cup and clipped level liquid",
    "dlFillScene(0.7+n*1.05 duration) repeatedpours cup→jug",
    "widgets.fill queued700msadd/350mssub,capguard,readout,lockedsubmit+say",
    "check.fill scalar target plus litre-as-one-dl misconception",
    "pics.VESSELS elsewhere qualitative volumes, not calibrated tools"
  ],
  "audit": {
    "row": 58,
    "detailLines": "LESSON_AUDIT458–460",
    "coverageOmissions": [
      "fill",
      "third demo"
    ]
  },
  "reconcile": [
    "Actual repeated1dl volume transfer before equality; capacity versus current amount distinguished.",
    "Make water supply/refills explicit; cup+jug+supply conserve quantity through animation. No unaccounted refill or flow while receiver unchanged.",
    "Two comparable whole-dl quantities; optional physical2dlglasses exploration if needed, no new division hard gate.",
    "Higher water surface/large numeral alone does not determine more; all model containers/units clearly labelled."
  ]
}

## Project treatment
Litre/decilitre relation through explicit unit-transfer diagram and calibrated jug. Fixed finite20dl supply+measure+jug conserved through add/return phases; repair8dl or11dl to1l. No quotient or physicalpour certification.

The frozen canonical metadata below is retained exactly. RequiredAND grouping and concept/atomic role are not changed. No new hard number/multiplication/division gates are inferred from Lite examples.

{
  "id": "M-MEAS-09",
  "subject": "mathematics",
  "grade_band": "1-2",
  "topic_area": "Geometria ja mittaaminen",
  "parent_concept": "Tilavuusyksiköt",
  "title": "Litra ja desilitra yksikköinä",
  "short_description": "Litra ja desilitra yksikköinä",
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
      "id": "M-MEAS-08",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "M-MEAS-08 on tämän osaamiskohteen välitön välttämätön esitieto."
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
        "M-MEAS-08",
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
    "Tilavuusyksiköt"
  ]
}

## Meaning of the interaction
State is exact source+unitmeasure+jug, always20dl. One800ms transfer fills a unitmeasure, then empties into destination; return uses reversed state/route. Dashed route is a quantity diagram, not an unphysical gravity simulation. Same normalized progress drives all3amounts/levels. No invisiblerefills. Currentnumeric labels withheld forfractional intermediate values; integer targets do not demand decimal reading. Check disabled whilebusy; no queued action backlog. Help highlights fixedlitreline without changing answer.

## Runtime and evidence
Owned input/change commits; explicit checks read editable visible answer fields/case. Correct and incorrect verdicts retire after semantic edits; truth-preserving views/helpers preserve valid feedback. Self-contained mount with pause/resume/reset/dispose; no imports/storage/mastery. Ownpuretests and source validation are author technical checks, not independent or human approval. Final compiledsite QA must bind exactrevision after mainbuild. Supplied art and all originalsubjectassets are explicitly hashed.
