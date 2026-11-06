# SCI-ENV-RECORD-01 — actual Lite alignment and reconciliation

{
  "base": [
    "build",
    "count",
    "check",
    "transfer"
  ],
  "overlay": [],
  "demos": [
    "tripScene(niitty,kallio,ranta; kukka,kivi,kala; true; counts2,1,3)",
    "presentScene(same3records)"
  ],
  "media": [
    "science.ts recordTask/tripScene/presentScene/presentArt",
    "science.ts PLACES/ITEMS/AT/cnt",
    "ui/art.ts THINGS plus duck/frog legacy art",
    "ui/anim.ts Clock and manual playback"
  ],
  "details": {
    "build": "place: recordTask3; place/item binding, no quantities",
    "count": "place: watched tripScene fill=false ns1..3; three place rows and three correct item/count cards plus one wrong-count card",
    "check": "choice: watched trip compared with3notebook pictures; distractors rotate item bindings or change one count",
    "transfer": "place: recordTask4 fix=true, cyclically swapped item bindings, quantities not recorded"
  }
}

## Effective registry
{
  "sourceBuild": "lite181-2026-10-27",
  "perNodeRevision": "audit1-2026-10-28",
  "validRevisions": [
    "audit1-2026-10-28"
  ],
  "motionFallbackRevision": "motion1-2026-10-27 not replacing explicit audit revision",
  "goals": "GOALS fills missing NodeSpec goal. Motion goal says speed-up/slow-down but actual family set has no slow-down branch.",
  "casePhases": "cases chooses named base branches in guided/independent/retrieval, dedicated transfer; no guidedTags restriction for either.",
  "simulationShares": {
    "guided": 0.6,
    "independent": 0.35,
    "retrieval": 0.5,
    "transfer": 0
  },
  "scope": "SIMS affects motion-change only; no record override. Index comment every-retrieval conflicts with executable0.5.",
  "familyRegistry": "No own DECL or manifest demand rows; default choice/place outcomes; empty assumed/supplied/coTaught/support/incidental and null dynamic rule. No formal outcome inference."
}

## Historical audit
{"row": 69, "detail": "trip+count→presentation demos, new count placement, animated check"}
These are imported synthetic author claims, not current package approval or human evidence. Actual current families take precedence over stale COVERAGE. No own family DECL or manifest demands; defaults do not validate canonical competence.

## Correction/extension
Lite build/count/check each evidence narrower aspects; transfer is four-place repair without quantities. The new construction carries the same simulated observation through a learner-owned record and into a learner-assembled presentation. Record→presentation consistency alone is insufficient: source→record fidelity is checked too. No decorative auto-poster credited as full construction; given card/format support and free-design limits explicit. No Lite source edits.

## Frozen canonical
{
  "id": "SCI-ENV-RECORD-01",
  "subject": "science",
  "grade_band": "1-2",
  "topic_area": "Tutkimisen taidot",
  "parent_concept": "Tulosten kirjaaminen",
  "title": "Havaintojen taltioiminen ja esittäminen",
  "short_description": "Havaintojen taltioiminen ja esittäminen",
  "node_kind": "integration",
  "source_basis": "direct_curriculum",
  "curriculum_refs": [
    "ENV12-T5-T13"
  ],
  "relations": [
    {
      "id": "SCI-ENV-RECORD-DATA-01",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "SCI-ENV-RECORD-01 on v0.2:ssa integraationoodi; atominen alitaito SCI-ENV-RECORD-DATA-01 vaaditaan kokonaisuuden hallintaan."
    },
    {
      "id": "SCI-ENV-PRESENT-DATA-01",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "SCI-ENV-RECORD-01 on v0.2:ssa integraationoodi; atominen alitaito SCI-ENV-PRESENT-DATA-01 vaaditaan kokonaisuuden hallintaan."
    }
  ],
  "prerequisite_groups": [
    {
      "all_of": [
        "SCI-ENV-RECORD-DATA-01",
        "SCI-ENV-PRESENT-DATA-01"
      ],
      "rationale": "Integraationoodi saavutetaan, kun kaikki korkean varmuuden auditissa erotetut atomiset alitaidot hallitaan."
    }
  ],
  "evidence_notes": "v0.2-integraationoodi. Atomiset mastery-tilat: SCI-ENV-RECORD-DATA-01, SCI-ENV-PRESENT-DATA-01. Lisäksi vaaditaan erillinen integraatio-/soveltamisnäyttö ennen täydellistä masteryä.",
  "foundation_entry": false,
  "zero_required_indegree": false,
  "status": "candidate_refactored_integration",
  "entry_role": "none",
  "mastery_role": "integration",
  "split_children": [
    "SCI-ENV-RECORD-DATA-01",
    "SCI-ENV-PRESENT-DATA-01"
  ],
  "integration_of": [
    "SCI-ENV-RECORD-DATA-01",
    "SCI-ENV-PRESENT-DATA-01"
  ],
  "dynamic_prerequisite_rule": null,
  "concept_path": [
    "Ympäristöoppi / luonnontieteellinen perusta",
    "Tutkimisen taidot",
    "Tulosten kirjaaminen"
  ]
}

No graph/role changes, public deployment claims, invented learner observations, self-approval or formal mastery. Runtime routes remain shared resolver responsibility.
