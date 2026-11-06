# ENV-PHY-MOTION-OBS-01 — actual Lite reconciliation

NodeSpec/source: science.ts; CONTENT_REV lite181-2026-10-27; per-node audit1-2026-10-28.

science.ts demo pondScene drift/colour/still and back/still/drift; third demo static framesArt. Families moved,still,colour are static two-frame choice; spot is a real-time multi selection over drift/back/colour/still; transfer is a three-frame out-and-back choice. motionsims.ts adds sim with one leaf, fixed landmark, straight track10,end6 and v1 or0; ui/motion.ts shows track/timeline. index.ts executable overlay shares guided.6/independent.35/retrieval.5/transfer0. The comment's “every retrieval” is inaccurate; use executable values. Audit revision audit1-2026-10-28 stays because NodeSpec already supplies it, not the stale COVERAGE motion revision. No own family demand declarations/coverage rows.

Do not copy pondScene's bob=Math.sin(t*2.2+i)*1.5 into a nonmoving leaf: it changes y relative to fixed stone even for still/colour. Do not copy still's assertion “same position in both photos → did not move”; endpoint equality is insufficient. The scripted moving/still whole trajectory is known, so explain that bounded model without generalising beyond observed evidence. Retain useful fixed reference, return-to-start and multi-object observation ideas. Record these as reconciliation notes, leave imported Lite untouched.

## Canonical and evidence boundaries
{
  "id": "ENV-PHY-MOTION-OBS-01",
  "subject": "science",
  "grade_band": "1-2",
  "topic_area": "Fysiikan alkutiedot",
  "parent_concept": "Liike",
  "title": "Liikkeen havainnointi",
  "short_description": "Liikkeen havainnointi",
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
    }
  ],
  "prerequisite_groups": [
    {
      "all_of": [
        "SCI-ENV-OBSERVE-01"
      ],
      "rationale": "Yleinen havainnointi on ydinesitieto."
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

No own family DECL or manifest coverage rows; default outcomes do not prove competence. Historical audit claims are unapproved synthetic self-checks, not approval for this package. Imported Lite unchanged. No verified public pupil route authored; resolver remains main responsibility.

The new package supplies original complete Finnish instruction and actual model-based practice. All model observations are labelled simulated/given. No invented learner records, formal mastery, retention, learning efficacy or independent/human approval.
