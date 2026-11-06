# Toteutuksen ja Liten rajat — M-NEG-03

{
  "nodeSpecId": "M-NEG-03",
  "liteContentRevision": "lite181-2026-10-27",
  "nodeRevision": "audit1-2026-10-28",
  "sourcePath": "authority/production-181-v2/lite/src/content/written.ts:774–850",
  "actualInventory": {
    "revision": "audit1-2026-10-28",
    "goal": "Opit vertaamaan ja järjestämään negatiivisia lukuja: lukusuoralla oikealla on aina suurempi.",
    "intro": "Jäälahdella mitataan pakkasia. Kumpi on kylmempi, −7 vai −3 astetta?",
    "rewardNotAdopted": "Vertaat negatiivisia lukuja varmasti!",
    "demoCount": 2,
    "itemsSampled": 2048,
    "byPhase": {
      "guided": {
        "colder": 134,
        "symbol": 120,
        "bigger": 131,
        "order": 127
      },
      "independent": {
        "colder": 134,
        "symbol": 120,
        "bigger": 131,
        "order": 127
      },
      "transfer": {
        "transfer": 512
      },
      "retrieval": {
        "colder": 134,
        "symbol": 120,
        "bigger": 131,
        "order": 127
      }
    },
    "sample": {
      "colder": {
        "phase": "guided",
        "seed": 1,
        "say": "Aamulla oli −2 °C ja illalla −6 °C. Kumpi oli kylmempi?",
        "task": {
          "kind": "choice",
          "options": [
            {
              "text": "Ilta"
            },
            {
              "text": "Aamu"
            }
          ],
          "answer": 0,
          "why": [
            null,
            "Kylmempi on se, jossa lukema on pienempi: kauempana nollasta alaspäin."
          ],
          "cols": 2
        },
        "hint": "Kummassa mittarissa pinta on alempana?",
        "explain": "−6 < −2, joten −6 °C on kylmempi."
      },
      "symbol": {
        "phase": "guided",
        "seed": 4,
        "say": "Mikä merkki tulee väliin? −4 ? −1",
        "task": {
          "kind": "choice",
          "options": [
            {
              "big": "<"
            },
            {
              "big": "="
            },
            {
              "big": ">"
            }
          ],
          "answer": 0,
          "why": [
            null,
            "Luvut eivät ole samat.",
            "Väärin päin: −4 on vasemmalla eli pienempi."
          ],
          "cols": 3
        },
        "hint": "Merkin kärki osoittaa pienempään. Pienempi on lukusuoralla vasemmalla.",
        "explain": "−4 on vasemmalla, joten −4 < −1."
      },
      "bigger": {
        "phase": "guided",
        "seed": 7,
        "say": "Kumpi luku on suurempi: −6 vai −5?",
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
            "Tämä on kauempana nollasta vasemmalla: se on pienempi."
          ]
        },
        "hint": "Suurempi on lukusuoralla oikealla, lähempänä nollaa.",
        "explain": "−5 on lukusuoralla oikeammalla, joten −5 > −6."
      },
      "order": {
        "phase": "guided",
        "seed": 12,
        "say": "Järjestä luvut pienimmästä suurimpaan.",
        "task": {
          "kind": "place",
          "slots": [
            {
              "id": "p0",
              "text": "pienin"
            },
            {
              "id": "p1",
              "text": ""
            },
            {
              "id": "p2",
              "text": ""
            },
            {
              "id": "p3",
              "text": "suurin"
            }
          ],
          "tokens": [
            {
              "id": "n1",
              "text": "1"
            },
            {
              "id": "n-5",
              "text": "−5"
            },
            {
              "id": "n-2",
              "text": "−2"
            },
            {
              "id": "n-8",
              "text": "−8"
            }
          ],
          "answer": {
            "p0": "n-8",
            "p1": "n-5",
            "p2": "n-2",
            "p3": "n1"
          },
          "why": {
            "p0": "Pienin on kauimpana vasemmalla: −8.",
            "p1": "−5 on −8:n oikealla ja −2:n vasemmalla.",
            "p2": "−2 on −5:n oikealla ja 1:n vasemmalla.",
            "p3": "Suurin on ainoa positiivinen: 1."
          }
        },
        "hint": "Mitä kauempana vasemmalla nollasta, sitä pienempi.",
        "explain": "−8 < −5 < −2 < 1."
      },
      "transfer": {
        "phase": "transfer",
        "seed": 1,
        "say": "Sukeltaja Aava on −8 metrissä ja sukeltaja Loikka −10 metrissä. Kumpi on syvemmällä?",
        "task": {
          "kind": "choice",
          "options": [
            {
              "text": "Loikka"
            },
            {
              "text": "Aava"
            }
          ],
          "answer": 0,
          "why": [
            null,
            "Syvemmällä on se, jonka lukema on pienempi."
          ],
          "cols": 2
        },
        "hint": "Syvemmällä tarkoittaa kauempana pinnasta (nollasta) alaspäin: pienempi luku.",
        "explain": "−10 < −8: −10 metriä on syvemmällä."
      }
    },
    "registry": "Direct actual NodeSpec; global index/families/motionsims inspected, no target SIMS/family override, own goal/rev retained."
  },
  "taskFamilies": [
    "bigger",
    "order",
    "colder",
    "symbol",
    "transfer"
  ],
  "familyTreatment": {
    "bigger": "Compare two negatives, one −6..−12 and one−1..−5; choice with left/right why.",
    "order": "Four shuffled signed values (three negatives/one positive), place by increasing value with slot whys.",
    "colder": "Compare supplied morning/evening °C values on two same-scale thermometers.",
    "symbol": "Choose <,=,> including equal negatives; source tries to separate adjacent labels.",
    "transfer": "Compare two below-surface signed heights; deeper means lower signed height."
  },
  "introDemoTreatment": "Frost comparison and −7/−3 line hops, then moving thermometer−3/−7. Own sortable record activity replaces recognition-only route and automatic confidence reward.",
  "animationInventory": "Read neganim thermoScene1–39, iceHops44–86, lineSortScene92–128, unit interpolation/caption and manual replacement limits. Original SVG subjects only; supplied PNG mascots are not redrawn.",
  "registry": "Actual index preserves own goal/AUDIT_REV; family defaults, no target-specific family/SIMS override for these3. GOALS fallback exists globally but own goals already supplied.",
  "audit": {
    "path": "authority/production-181-v2/lite/audit/LESSON_AUDIT.md",
    "rows": "106 /591–593",
    "scope": "Read actual critique/correction, not just index. Historical source tests/native are not this package evidence."
  },
  "coverageReconciliation": "Old COVERAGE omits symbol.",
  "comparison": "Retain comparison, ordered list, equality sign, cold/height contexts. Model is freely controllable, then four readings are constructed in order by direct typing or value-card clicks. Repeated identical values accepted by multiplicity; no arbitrary object identity/name gate.",
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
