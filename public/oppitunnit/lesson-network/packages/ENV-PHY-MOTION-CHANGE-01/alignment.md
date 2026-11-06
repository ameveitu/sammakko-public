# ENV-PHY-MOTION-CHANGE-01 — actual Lite alignment and reconciliation

{
  "base": [
    "stop",
    "turn",
    "faster",
    "steady",
    "next",
    "transfer"
  ],
  "overlay": [
    "sim"
  ],
  "demos": [
    "swimScene(motion(stop),stop)",
    "swimScene(motion(faster),faster)",
    "swimScene(motion(turn),turn)"
  ],
  "media": [
    "science.ts motion/stripArt/stackAt/swimScene",
    "motionsims.ts SIMS",
    "ui/anim.ts Clock-based scene",
    "ui/motion.ts track/strobe/timeline",
    "engine/motion.ts Run/frameAt/Clock"
  ],
  "details": {
    "stop": "choice: real-time swim, later positions identical",
    "turn": "choice: real-time swim, signed position change reverses",
    "faster": "choice: piecewise increasing displacement per equal STEP",
    "steady": "choice: same displacement and direction each equal STEP",
    "next": "choice: stated continuation rule plus observed four-position run; select fifth snapshot strip",
    "transfer": "place: go/stop/back static leaf strips, ordered by supplied narrative",
    "sim": "choice: shared player steady/faster/stop only, straight12/end6, one clock; strobe/timeline/track; dt1"
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
{"row": 72, "detail": "real-time swim builds snapshots; gaps, next branch, stack labels"}
These are imported synthetic author claims, not current package approval or human evidence. Actual current families take precedence over stale COVERAGE. No own family DECL or manifest demands; defaults do not validate canonical competence.

## Correction/extension
Actual dynamic motion precedes static explanation. Slow-down is taught explicitly because the old goal mentions it although no slow-down family exists. No mandatory strobo inference; no generic wrong-answer claim that a turning object never changed speed. Questions target continued motion, pace or direction separately; transfer sequence is observed as actual motion before ordering. No Lite source edits.

## Frozen canonical
{
  "id": "ENV-PHY-MOTION-CHANGE-01",
  "subject": "science",
  "grade_band": "1-2",
  "topic_area": "Fysiikan alkutiedot",
  "parent_concept": "Liike",
  "title": "Liikkeen muutoksen havainnointi",
  "short_description": "Liikkeen muutoksen havainnointi",
  "node_kind": "concept",
  "source_basis": "pedagogically_derived",
  "curriculum_refs": [
    "ENV12-S4"
  ],
  "relations": [
    {
      "id": "SCI-ENV-OBSERVE-01",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "Liikkeen havainnointi perustuu yleiseen havainnointitaitoon."
    },
    {
      "id": "ENV-PHY-MOTION-OBS-01",
      "relation_type": "prerequisite",
      "strength": "required",
      "rationale": "Liikkeen muutos edellyttää ensin liikkeen tunnistamista."
    }
  ],
  "prerequisite_groups": [
    {
      "all_of": [
        "SCI-ENV-OBSERVE-01",
        "ENV-PHY-MOTION-OBS-01"
      ],
      "rationale": "Muutos tunnistetaan jo havaitussa liikkeessä."
    }
  ],
  "evidence_notes": "v0.2-refaktorissa erotettu noodista ENV-PHY-MOTION-01 itsenäiseksi evidenssikohteeksi.",
  "foundation_entry": false,
  "zero_required_indegree": false,
  "status": "candidate_refactored",
  "entry_role": "none",
  "mastery_role": "atomic",
  "split_from": "ENV-PHY-MOTION-01",
  "concept_path": [
    "Ympäristöoppi / luonnontieteellinen perusta",
    "Fysiikan alkutiedot",
    "Liike"
  ]
}

No graph/role changes, public deployment claims, invented learner observations, self-approval or formal mastery. Runtime routes remain shared resolver responsibility.
