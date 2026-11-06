# Toteutuksen ja Liten rajat — M79-INT-ORDER

{
  "nodeSpecId": "M79-INT-ORDER",
  "liteContentRevision": "lite181-2026-10-27",
  "nodeRevision": "audit1-2026-10-28",
  "sourcePath": "authority/production-181-v2/lite/src/content/algebra79.ts:68–118",
  "actualInventory": {
    "revision": "audit1-2026-10-28",
    "goal": "Opit vertaamaan ja järjestämään negatiivisia ja positiivisia kokonaislukuja lukusuoran avulla: oikealla on aina suurempi.",
    "intro": "Talvinen lampi. Negatiiviset luvut järjestetään lukusuoralla: oikealla aina suurempi.",
    "rewardNotAdopted": "Järjestät kokonaisluvut varmasti!",
    "demoCount": 2,
    "itemsSampled": 2048,
    "byPhase": {
      "guided": {
        "place": 113,
        "split": 93,
        "order": 99,
        "compare": 101,
        "sign": 106
      },
      "independent": {
        "place": 113,
        "split": 93,
        "order": 99,
        "compare": 101,
        "sign": 106
      },
      "transfer": {
        "transfer": 512
      },
      "retrieval": {
        "place": 113,
        "split": 93,
        "order": 99,
        "compare": 101,
        "sign": 106
      }
    },
    "sample": {
      "place": {
        "phase": "guided",
        "seed": 1,
        "say": "Napauta lukusuoralta −2.",
        "task": {
          "kind": "line",
          "min": -10,
          "max": 10,
          "step": 1,
          "answer": -2,
          "labelEvery": 5,
          "whyAt": {
            "2": "Tämä on 2, nollasta oikealle. Miinusmerkkinen luku on vasemmalla.",
            "-1": "Yksi askel liian lähellä nollaa. Laske askeleet nollasta.",
            "-3": "Yksi askel liian kauas. Laske askeleet nollasta."
          }
        },
        "hint": "Negatiiviset luvut ovat nollasta vasemmalle.",
        "explain": "−2 on 2 askelta nollasta vasemmalle."
      },
      "split": {
        "phase": "guided",
        "seed": 4,
        "say": "Lajittele luvut: ovatko ne pienempiä vai suurempia kuin −4?",
        "task": {
          "kind": "sort",
          "items": [
            {
              "text": "−6"
            },
            {
              "text": "−10"
            },
            {
              "text": "1"
            },
            {
              "text": "−3"
            },
            {
              "text": "0"
            }
          ],
          "cats": [
            {
              "label": "Pienempi kuin −4 ❄️"
            },
            {
              "label": "Suurempi kuin −4 ☀️"
            }
          ],
          "answer": [
            0,
            0,
            1,
            1,
            1
          ],
          "why": [
            "−6 on lukusuoralla vasemmalla puolella lukua −4.",
            "−10 on lukusuoralla vasemmalla puolella lukua −4.",
            "1 on lukusuoralla oikealla puolella lukua −4.",
            "−3 on lukusuoralla oikealla puolella lukua −4.",
            "0 on lukusuoralla oikealla puolella lukua −4."
          ]
        },
        "hint": "Kuvittele lukusuora. Kaikki −4:n vasemmalla puolella olevat ovat pienempiä.",
        "explain": "Pienempiä: −6, −10. Suurempia: 1, −3, 0."
      },
      "order": {
        "phase": "guided",
        "seed": 6,
        "say": "Mikä on järjestys pienimmästä suurimpaan?",
        "task": {
          "kind": "choice",
          "options": [
            {
              "text": "0, −5, 6, −7"
            },
            {
              "text": "−7, −5, 0, 6"
            },
            {
              "text": "−5, −7, 0, 6"
            }
          ],
          "answer": 1,
          "why": [
            "Tässä on järjestetty etäisyyden nollasta mukaan, ei lukusuoran mukaan.",
            null,
            "Negatiiviset ovat väärin päin: −7 on pienempi kuin −5."
          ],
          "cols": 1
        },
        "hint": "Aloita vasemmanpuoleisimmasta: kumpi negatiivisista on kauempana nollasta?",
        "explain": "Lukusuoralla vasemmalta oikealle: −7 < −5 < 0 < 6."
      },
      "compare": {
        "phase": "guided",
        "seed": 7,
        "say": "Kumpi on suurempi: −6 vai −5?",
        "task": {
          "kind": "choice",
          "options": [
            {
              "big": "−5"
            },
            {
              "big": "−6"
            }
          ],
          "answer": 0,
          "why": [
            null,
            "−6 on kauempana nollasta vasemmalla, joten se on pienempi."
          ],
          "cols": 2
        },
        "hint": "Kumpi on lukusuoralla oikeammalla? Ajattele lämpömittaria: kumpi on lämpimämpi?",
        "explain": "−5 on oikeammalla lukusuoralla."
      },
      "sign": {
        "phase": "guided",
        "seed": 12,
        "say": "Kumpi merkki: −11 □ −9?",
        "task": {
          "kind": "choice",
          "options": [
            {
              "big": "<"
            },
            {
              "big": ">"
            }
          ],
          "answer": 0,
          "why": [
            null,
            "Kärki osoittaisi lukuun −9, mutta pienempi on −11: se on vasemmalla."
          ],
          "cols": 2
        },
        "hint": "Kärki osoittaa pienempään.",
        "explain": "−11 < −9: −9 on oikeammalla."
      },
      "transfer": {
        "phase": "transfer",
        "seed": 1,
        "say": "Missä kaupungissa oli lämpimintä?",
        "task": {
          "kind": "choice",
          "options": [
            {
              "text": "Inari"
            },
            {
              "text": "Oulu"
            },
            {
              "text": "Kuopio"
            }
          ],
          "answer": 2,
          "why": [
            "−19 on kylmempi kuin −3.",
            "−11 on kylmempi kuin −3.",
            null
          ]
        },
        "hint": "Lämpimin on suurin luku: se, joka on lähimpänä nollaa.",
        "explain": "Suurin lämpötila on lämpimin: −3 °C (Kuopio)."
      }
    },
    "registry": "Direct actual NodeSpec; global index/families/motionsims inspected, no target SIMS/family override, own goal/rev retained."
  },
  "taskFamilies": [
    "compare",
    "sign",
    "order",
    "place",
    "split",
    "transfer"
  ],
  "familyTreatment": {
    "compare": "Larger of two negatives, left/right position.",
    "sign": "< or > for unequal integers.",
    "order": "Mixed signed list; wrong absolute-value ordering vs correct numerical ordering.",
    "place": "Place negative integer on a line with sign/off-by-one whys.",
    "split": "Classify five unique points as less/greater than negative pivot.",
    "transfer": "Read supplied fictional town temperatures and choose greatest/warmer; nearest-zero hint is only valid because source uses all negatives."
  },
  "introDemoTreatment": "Animated lineSort[-3,5,−8,0], then thermometer−3/−7. Own pivot exploration and generically checked constructed pairs replace a fixed answer choice.",
  "animationInventory": "Read neganim thermoScene1–39, iceHops44–86, lineSortScene92–128, unit interpolation/caption and manual replacement limits. Original SVG subjects only; supplied PNG mascots are not redrawn.",
  "registry": "Actual index preserves own goal/AUDIT_REV; family defaults, no target-specific family/SIMS override for these3. GOALS fallback exists globally but own goals already supplied.",
  "audit": {
    "path": "authority/production-181-v2/lite/audit/LESSON_AUDIT.md",
    "rows": "195 /1184–1186",
    "scope": "Read actual critique/correction, not just index. Historical source tests/native are not this package evidence."
  },
  "coverageReconciliation": "Old COVERAGE omits split and understates actual2 demos as1.",
  "comparison": "Retain position, signed comparison, pivot split and contextual threshold. Learner constructs any supported pair satisfying a general predicate, with multiple valid answers and explicit strict/inclusive boundaries. Distance is contrasted, not substituted for order.",
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
