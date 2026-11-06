# Toteutuksen ja Liten rajat — M79-INT-DIST

{
  "nodeSpecId": "M79-INT-DIST",
  "liteContentRevision": "lite181-2026-10-27",
  "nodeRevision": "audit1-2026-10-28",
  "sourcePath": "authority/production-181-v2/lite/src/content/algebra79.ts:121–167",
  "actualInventory": {
    "revision": "audit1-2026-10-28",
    "goal": "Opit laskemaan kahden kokonaisluvun etäisyyden lukusuoralla ja luvun itseisarvon: etäisyys on askelten määrä, ei koskaan negatiivinen.",
    "intro": "Kahden luvun etäisyys on askelten määrä lukusuoralla. Etäisyys ei ole koskaan negatiivinen.",
    "rewardNotAdopted": "Mittaat etäisyyksiä lukusuoralla!",
    "demoCount": 3,
    "itemsSampled": 2048,
    "byPhase": {
      "guided": {
        "abs": 134,
        "pairs": 120,
        "across": 131,
        "same": 127
      },
      "independent": {
        "abs": 134,
        "pairs": 120,
        "across": 131,
        "same": 127
      },
      "transfer": {
        "transfer": 512
      },
      "retrieval": {
        "abs": 134,
        "pairs": 120,
        "across": 131,
        "same": 127
      }
    },
    "sample": {
      "abs": {
        "phase": "guided",
        "seed": 1,
        "say": "|−2| = ?",
        "task": {
          "kind": "numeric",
          "answer": 2,
          "unit": "",
          "whyAt": {
            "-2": "Itseisarvo on etäisyys, eikä se ole koskaan negatiivinen."
          }
        },
        "hint": "Itseisarvo on luvun etäisyys nollasta.",
        "explain": "−2 on 2 askeleen päässä nollasta."
      },
      "pairs": {
        "phase": "guided",
        "seed": 4,
        "say": "Yhdistä jokainen pari oikeaan etäisyyteen. Yksi lappu jää yli.",
        "task": {
          "kind": "place",
          "slots": [
            {
              "id": "s0",
              "text": "−3 ja 3 → ▢"
            },
            {
              "id": "s1",
              "text": "−7 ja −2 → ▢"
            },
            {
              "id": "s2",
              "text": "|−7| → ▢"
            }
          ],
          "tokens": [
            {
              "id": "x",
              "text": "9"
            },
            {
              "id": "d1",
              "text": "5"
            },
            {
              "id": "d2",
              "text": "7"
            },
            {
              "id": "d0",
              "text": "6"
            }
          ],
          "answer": {
            "s0": "d0",
            "s1": "d1",
            "s2": "d2"
          },
          "why": {
            "s0": "Eri puolilla nollaa: 3 + 3 = 6.",
            "s1": "Samalla puolella: 7 − 2 = 5.",
            "s2": "−7 on 7 askeleen päässä nollasta."
          }
        },
        "hint": "Ovatko luvut nollan eri puolilla (lisää) vai samalla puolella (vähennä)?",
        "explain": "Lappu 9 jää yli."
      },
      "across": {
        "phase": "guided",
        "seed": 7,
        "say": "Kuinka kaukana toisistaan ovat −1 ja 8?",
        "task": {
          "kind": "numeric",
          "answer": 9,
          "unit": "",
          "whyAt": {
            "7": "Vähensit numerot toisistaan. Luvut ovat nollan eri puolilla, joten askeleet lasketaan yhteen.",
            "-9": "Etäisyys ei ole koskaan negatiivinen."
          }
        },
        "hint": "Laske askeleet nollaan ja nollasta eteenpäin.",
        "explain": "1 askelta nollaan ja 8 siitä: 9."
      },
      "same": {
        "phase": "guided",
        "seed": 12,
        "say": "Kuinka kaukana toisistaan ovat −6 ja −3?",
        "task": {
          "kind": "numeric",
          "answer": 3,
          "unit": "",
          "whyAt": {
            "9": "Laskit yhteen, mutta luvut ovat nollan samalla puolella: matka ei kulje nollan kautta. Vähennä.",
            "-3": "Etäisyys ei ole koskaan negatiivinen."
          }
        },
        "hint": "Molemmat ovat nollan vasemmalla puolella. Kulkeeko matka nollan kautta?",
        "explain": "Molemmat ovat nollan samalla puolella: 6 − 3 = 3."
      },
      "transfer": {
        "phase": "transfer",
        "seed": 1,
        "say": "Sukeltaja on 11 m merenpinnan alapuolella (−11 m). Lokki lentää 4 m yläpuolella. Kuinka kaukana ne ovat toisistaan pystysuunnassa?",
        "task": {
          "kind": "numeric",
          "answer": 15,
          "unit": "m",
          "whyAt": {
            "7": "Merenpinta on niiden välissä, joten matkat lasketaan yhteen.",
            "-7": "Etäisyys ei ole koskaan negatiivinen."
          }
        },
        "hint": "Merenpinta on nolla. Laske matka pintaan ja pinnasta ylös.",
        "explain": "11 m pintaan ja 4 m siitä ylös: 15 m."
      }
    },
    "registry": "Direct actual NodeSpec; global index/families/motionsims inspected, no target SIMS/family override, own goal/rev retained."
  },
  "taskFamilies": [
    "across",
    "same",
    "abs",
    "pairs",
    "transfer"
  ],
  "familyTreatment": {
    "across": "Negative-to-positive distance, zero crossing, whyAt for absolute digit-difference and negative result.",
    "same": "Two negative endpoints, subtract magnitudes to get interval length, no zero detour.",
    "abs": "Absolute value of negative integer, distance to zero.",
    "pairs": "Three across/same/absolute expressions matched to lengths; extra distractor, hints/explanations.",
    "transfer": "Same-vertical below/above-sea-level distances, declared metres/reference."
  },
  "introDemoTreatment": "Across−4→0→3; same-side−9→−4; absolute±6→0. Own reversible manual interval trace adds identical endpoints, zero and two opposite equally-distant outputs.",
  "animationInventory": "Read neganim thermoScene1–39, iceHops44–86, lineSortScene92–128, unit interpolation/caption and manual replacement limits. Original SVG subjects only; supplied PNG mascots are not redrawn.",
  "registry": "Actual index preserves own goal/AUDIT_REV; family defaults, no target-specific family/SIMS override for these3. GOALS fallback exists globally but own goals already supplied.",
  "audit": {
    "path": "authority/production-181-v2/lite/audit/LESSON_AUDIT.md",
    "rows": "196 /1188–1190",
    "scope": "Read actual critique/correction, not just index. Historical source tests/native are not this package evidence."
  },
  "coverageReconciliation": "Old COVERAGE omits pairs and understates actual3 demos as2 in the old summary.",
  "comparison": "Retain across/same/absolute/height distinctions. Construct interval trace, reverse and reflect endpoints, then check length or either order of both opposite positions. State distance≥0, not strictly positive; arbitrary endpoints and zero reinforce symmetry.",
  "assumptionsAndLimits": "Canonical prerequisite AND groups preserved. NEG03 is only strong support for both M79 nodes; not a new gate. Own narrow format/domains declared; no copied automatic mastery/confidence reward.",
  "sourceHashes": {
    "reference/inputs/canonical-690-graph.json": "17eca8c1675ffe14aa3d6836e1ce7109020f440b22df09b7a7b15a8e95bb39fb",
    "authority/production-181-v2/lite/src/content/written.ts": "58ee93036fb7417e8324072db5be810426a99db346c23ef0651c9525a9bfd0c6",
    "authority/production-181-v2/lite/src/content/algebra79.ts": "76919f14b71155725ddc08bbc5b4180cdd965a4089da40601a08f38a277122c0",
    "authority/production-181-v2/lite/src/content/neganim.ts": "38429c827f5637f57b054cade85b40cc9f36396e27cee3d79e99e526b89766a4",
    "authority/production-181-v2/lite/src/content/families.ts": "b221e08f8c6bad3d559aae20eac57fa9de7704d3541b6a49f142047fbbec1903",
    "authority/production-181-v2/lite/src/content/motionsims.ts": "18925da01c1a4e237a1381b51f49af9ec8ee46dffb0d86b598f413de6401d2ba",
    "authority/production-181-v2/lite/src/content/index.ts": "8f16c2b9948ae3652929092414c6694e6c9421a83e94052035d02dc3841896c8",
    "authority/production-181-v2/lite/src/content/goals.ts": "732d66480e4ac3efae1f1eba38e9bc844db6707725bec7c4721777d8598f2e7e",
    "authority/production-181-v2/lite/src/content/kit.ts": "95a1ea48a8152caaca4a63c36a5d0a14e31a2bc51136e0535f320fec3da81bad",
    "authority/production-181-v2/lite/src/content/pics.ts": "799cfe129124e88a5f577575f5d6e56ad390ffac8cdb41ce790184b0657b6711",
    "authority/production-181-v2/lite/src/engine/types.ts": "1691c1ec54ee12823d8b8dce2dd0f798d8b9a5b704658460d06796dd508bd533",
    "authority/production-181-v2/lite/audit/LESSON_AUDIT.md": "bc9979f2e5174f9c4039fbbd009d6d0cc341d59c451467e6d53c7e72299ee00b",
    "authority/production-181-v2/lite/docs/PEDAGOGY_REFERENCES.md": "d18d901f2001a7c931ad72c55ce2921676234735bae83356b241d78841da4d1f",
    "authority/production-181-v2/lite/COVERAGE.md": "49b94c0a19a6b5ab747aec95a95f5b45b4247be8ded226725ace6156bea18427",
    "AUTHORING.md": "06f86d3f8280df43b93a80c72ddcf7e51ceee2cd098edf42b2980e615253ab9f",
    "INTERACTION_FEEDBACK_CONTRACT.md": "b32d4d23dfa0947aecc1331987d3a56c6bff6d866f0cc7999e927d721fc6b317",
    "evidence/production/B11/AUTHORING_HOST_CLARIFICATION_FI.md": "9cf96652028cf9f4a78589b283d9a4dc5981e993ad2300f539f1028aa6f86c7d",
    "evidence/production/B12/REPAIR_NOTES_FI.md": "a4ea9405c36008d6b390bbb0019a89e2814a9100ccfab86a33d11e72531ea2a5"
  },
  "reconciliations": [
    "Immutable Lite not modified. IM source sorted-temperature worked list error recorded in research, own examples calculated independently. All-negative nearest-zero shortcut is not generalized to positives."
  ]
}

2048 todellisen generaattorin otosta/solmu neljän vaiheen läpi; alkuperäinen inventaario säilytetään tempissä. Ei Liten käynnistyksen tai oppimistuloksen todistetta. Jaettu runtime/graafi ja vanhat139 lähteet säilytetään.
