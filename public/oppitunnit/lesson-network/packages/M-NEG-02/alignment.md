# Lite-inventaario ja erot — M-NEG-02

{
  "liteContentRevision": "lite181-2026-10-27",
  "nodeRevision": "audit1-2026-10-28",
  "nodeSpecPath": "authority/production-181-v2/lite/src/content/saari1.ts",
  "actualInventory": {
    "revision": "audit1-2026-10-28",
    "fallbackGoal": "Opit sijoittamaan negatiiviset luvut lukusuoralle nollan vasemmalle puolelle.",
    "demoCount": 3,
    "itemsSampled": 2048,
    "byPhase": {
      "guided": {
        "order": 134,
        "sort": 120,
        "place": 131,
        "read": 127
      },
      "independent": {
        "order": 134,
        "sort": 120,
        "place": 131,
        "read": 127
      },
      "transfer": {
        "transfer": 512
      },
      "retrieval": {
        "order": 134,
        "sort": 120,
        "place": 131,
        "read": 127
      }
    },
    "sample": {
      "order": {
        "phase": "guided",
        "seed": 1,
        "say": "Mikä luvuista on pienin?",
        "task": {
          "kind": "choice",
          "options": [
            {
              "big": "−5"
            },
            {
              "big": "6"
            },
            {
              "big": "−3"
            }
          ],
          "answer": 0,
          "why": [
            null,
            "Positiivinen luku on suurempi kuin negatiivinen.",
            "−3 on lähempänä nollaa, joten se on suurempi kuin −5."
          ]
        },
        "hint": "Pienin on lukusuoralla kauimpana vasemmalla.",
        "explain": "Pienin on se, joka on lukusuoralla kauimpana vasemmalla: −5."
      },
      "sort": {
        "phase": "guided",
        "seed": 4,
        "say": "Laita luvut järjestykseen pienimmästä suurimpaan.",
        "task": {
          "kind": "place",
          "slots": [
            {
              "id": "s0",
              "text": "1. pienin"
            },
            {
              "id": "s1",
              "text": "2."
            },
            {
              "id": "s2",
              "text": "3."
            },
            {
              "id": "s3",
              "text": "4. suurin"
            }
          ],
          "tokens": [
            {
              "id": "v3",
              "text": "2",
              "speak": "2"
            },
            {
              "id": "v1",
              "text": "−3",
              "speak": "−3"
            },
            {
              "id": "v0",
              "text": "−6",
              "speak": "−6"
            },
            {
              "id": "v2",
              "text": "−1",
              "speak": "−1"
            }
          ],
          "answer": {
            "s0": "v0",
            "s1": "v1",
            "s2": "v2",
            "s3": "v3"
          },
          "why": {
            "s0": "Pienin on −6: se on kauimpana vasemmalla.",
            "s1": "Toiseksi pienin on −3.",
            "s2": "Toiseksi suurin on −1.",
            "s3": "Suurin on 2: se on kauimpana oikealla."
          }
        },
        "hint": "Mitä kauempana nollasta vasemmalla, sitä pienempi luku. −8 on pienempi kuin −2.",
        "explain": "Vasemmalta oikealle: −6 < −3 < −1 < 2."
      },
      "place": {
        "phase": "guided",
        "seed": 7,
        "say": "Napauta lukusuoralta luku −1.",
        "task": {
          "kind": "line",
          "min": -8,
          "max": 8,
          "step": 1,
          "answer": -1,
          "labelEvery": 2
        },
        "hint": "Negatiiviset luvut ovat nollan vasemmalla puolella.",
        "explain": "−1 on 1 askelta nollasta vasemmalle."
      },
      "read": {
        "phase": "guided",
        "seed": 12,
        "say": "Mikä luku sammakon kohdalla on?",
        "task": {
          "kind": "choice",
          "options": [
            {
              "big": "−6"
            },
            {
              "big": "−5"
            },
            {
              "big": "6"
            }
          ],
          "answer": 0,
          "why": [
            null,
            "Laske askeleet lähimmästä numerosta.",
            "Katso, kummalla puolella nollaa sammakko on."
          ]
        },
        "hint": "Onko sammakko nollan vasemmalla vai oikealla? Laske askeleet nollasta.",
        "explain": "Sammakko on 6 askelta nollasta vasemmalle: −6."
      },
      "transfer": {
        "phase": "transfer",
        "seed": 1,
        "say": "Sukeltaja on kohdassa −3 metriä. Hän sukeltaa 2 metriä syvemmälle. Napauta, missä hän on nyt.",
        "task": {
          "kind": "line",
          "min": -8,
          "max": 8,
          "step": 1,
          "answer": -5,
          "labelEvery": 2,
          "whyAt": {
            "5": "Sukeltaja on pinnan alla, joten luku on negatiivinen.",
            "-1": "Syvemmälle on lukusuoralla vasemmalle, ei oikealle.",
            "-3": "Tämä on lähtökohta. Sukella vielä syvemmälle."
          }
        },
        "hint": "Lähde kohdasta −3 ja hyppää 2 askelta vasemmalle.",
        "explain": "Syvemmälle on vasemmalle päin: −3 − 2 = −5."
      }
    },
    "findings": [
      {
        "code": "ZERO_CALLED_POSITIVE",
        "phase": "guided",
        "seed": 3,
        "task": {
          "kind": "choice",
          "options": [
            {
              "big": "0"
            },
            {
              "big": "−5"
            },
            {
              "big": "−2"
            }
          ],
          "answer": 1,
          "why": [
            "Positiivinen luku on suurempi kuin negatiivinen.",
            null,
            "−2 on lähempänä nollaa, joten se on suurempi kuin −5."
          ]
        }
      }
    ],
    "registry": "Direct NodeSpec plus actual index/families inspection: no SIMS entry for these IDs; own AUDIT_REV; GOALS fallback if undefined."
  },
  "taskFamilies": [
    "place",
    "read",
    "order",
    "sort",
    "transfer"
  ],
  "familyTreatment": {
    "place": "Place a target −7..−1 on the line.",
    "read": "Read r.int(−7,7)||−3: zero is excluded by fallback.",
    "order": "Choose smallest among signed integers; source feedback can call zero positive.",
    "sort": "Place ordered signed integers on a line; hints left-to-right.",
    "transfer": "Depth change from a negative height, explicit surface reference."
  },
  "demos": [
    "−4 and +4 opposite sides at equal distance, −6<−2<3, diver −2−3=−5."
  ],
  "introAndReward": {
    "intro": "Ice number line; negatives left of zero.",
    "ownTreatment": "Retain signed-position purpose; omit reward wording asserting established skill.",
    "hintExplainInventory": "Exact sampled family hint/explanation retained in actualInventory.sample; all source branches independently read in saari1.ts.",
    "sourceLines": "602–674"
  },
  "animations": {
    "source": "neganim.ts iceHops; pics.ts numberLineArt",
    "actualRead": "Full relevant helper geometry/captions/phase logic read. Source iceHops uses timed .55-second steps; own manual steps depict unit intervals, not elapsed time. coordWalk traces x then y and shows region/sign labels.",
    "ownTreatment": "Free marker movement with unit-interval arcs, independent reading/placement and depth example.",
    "limits": "No copied art, no runtime oracle or generic KC/game mapping change."
  },
  "registry": {
    "index": "CONTENT_REV fallback; own AUDIT_REV preserved; own missing goal supplied from GOALS.",
    "families": "No targeted family override for own node.",
    "SIMS": "Neither own node in SIMS; no .6/.35/.5 overlay inherited.",
    "coverage": "COVERAGE omits sort and lists two rather than actual three demos."
  },
  "audit": {
    "path": "authority/production-181-v2/lite/audit/LESSON_AUDIT.md",
    "relevant": "Own rows and detailed iceHops/sort or coordWalk/sortQ review, around lines587–600. PEDAGOGY_REFERENCES and engine/types read.",
    "limits": "Inherited technical checks are historical; no efficacy/human approval transferred."
  },
  "comparison": "Use concrete height and equal intervals before signed notation checks. Free construction/reading, zero and positive positions supplement Lite negative placement. Order comparison taught with explained figures instead of another mandatory recognition gate.",
  "reconciliations": [
    "Exact source guided seed3 order has options0,−5,−2 and feedback for0 calls it positive; own teaching explicitly says zero is neither positive nor negative. Read zero coverage restored."
  ],
  "sourceHashes": {
    "reference/inputs/canonical-690-graph.json": "17eca8c1675ffe14aa3d6836e1ce7109020f440b22df09b7a7b15a8e95bb39fb",
    "authority/production-181-v2/lite/src/content/saari1.ts": "0f0722dc20192b7414d481efe1b66251b3f8665baf07b107fb5be7872b0c0a25",
    "authority/production-181-v2/lite/src/content/neganim.ts": "38429c827f5637f57b054cade85b40cc9f36396e27cee3d79e99e526b89766a4",
    "authority/production-181-v2/lite/src/content/pics.ts": "799cfe129124e88a5f577575f5d6e56ad390ffac8cdb41ce790184b0657b6711",
    "authority/production-181-v2/lite/src/content/index.ts": "8f16c2b9948ae3652929092414c6694e6c9421a83e94052035d02dc3841896c8",
    "authority/production-181-v2/lite/src/content/families.ts": "b221e08f8c6bad3d559aae20eac57fa9de7704d3541b6a49f142047fbbec1903",
    "authority/production-181-v2/lite/src/content/goals.ts": "732d66480e4ac3efae1f1eba38e9bc844db6707725bec7c4721777d8598f2e7e",
    "authority/production-181-v2/lite/src/content/kit.ts": "95a1ea48a8152caaca4a63c36a5d0a14e31a2bc51136e0535f320fec3da81bad",
    "authority/production-181-v2/lite/src/content/audit-rev.ts": "78a9737d2dbb5eb3b8aaa01fad9875c64f98cb3048b89b30030cb46b4aea644f",
    "authority/production-181-v2/lite/src/content/motionsims.ts": "18925da01c1a4e237a1381b51f49af9ec8ee46dffb0d86b598f413de6401d2ba",
    "authority/production-181-v2/lite/src/engine/types.ts": "1691c1ec54ee12823d8b8dce2dd0f798d8b9a5b704658460d06796dd508bd533",
    "authority/production-181-v2/lite/audit/LESSON_AUDIT.md": "bc9979f2e5174f9c4039fbbd009d6d0cc341d59c451467e6d53c7e72299ee00b",
    "authority/production-181-v2/lite/docs/PEDAGOGY_REFERENCES.md": "d18d901f2001a7c931ad72c55ce2921676234735bae83356b241d78841da4d1f",
    "authority/production-181-v2/lite/COVERAGE.md": "49b94c0a19a6b5ab747aec95a95f5b45b4247be8ded226725ace6156bea18427",
    "AUTHORING.md": "06f86d3f8280df43b93a80c72ddcf7e51ceee2cd098edf42b2980e615253ab9f",
    "INTERACTION_FEEDBACK_CONTRACT.md": "b32d4d23dfa0947aecc1331987d3a56c6bff6d866f0cc7999e927d721fc6b317",
    "evidence/production/B11/AUTHORING_HOST_CLARIFICATION_FI.md": "9cf96652028cf9f4a78589b283d9a4dc5981e993ad2300f539f1028aa6f86c7d"
  },
  "limits": "Immutable Lite/graph preserved. No full process rubric, retention or independent learner evidence."
}

2048 todellisen muuttumattoman generaattorin otosta/solmu, neljä vaihetta, tallennettu omassa väliaikaisessa Lite-inventaariossa. Tämä on lähdekoodin tarkistus, ei Liten selainkoe tai oppimisen näyttö. Kaikki intro/demo/hint/explain/transfer-käsittelyt ja audittirajat on erotettu omasta suunnittelusta.
