# Lite-inventaario ja erot — M-COORD-02

{
  "liteContentRevision": "lite181-2026-10-27",
  "nodeRevision": "audit1-2026-10-28",
  "nodeSpecPath": "authority/production-181-v2/lite/src/content/saari1.ts",
  "actualInventory": {
    "revision": "audit1-2026-10-28",
    "fallbackGoal": "Opit käyttämään koordinaatistoa myös negatiivisilla luvuilla.",
    "demoCount": 3,
    "itemsSampled": 2048,
    "byPhase": {
      "guided": {
        "quadrant": 134,
        "sortQ": 120,
        "plot": 131,
        "read": 127
      },
      "independent": {
        "quadrant": 134,
        "sortQ": 120,
        "plot": 131,
        "read": 127
      },
      "transfer": {
        "transfer": 512
      },
      "retrieval": {
        "quadrant": 134,
        "sortQ": 120,
        "plot": 131,
        "read": 127
      }
    },
    "sample": {
      "quadrant": {
        "phase": "guided",
        "seed": 1,
        "say": "Missä neljänneksessä kohta (5, −4) on?",
        "task": {
          "kind": "choice",
          "options": [
            {
              "big": "I"
            },
            {
              "big": "II"
            },
            {
              "big": "III"
            },
            {
              "big": "IV"
            }
          ],
          "answer": 3,
          "why": [
            "Neljänneksessä I x on positiivinen ja y positiivinen.",
            "Neljänneksessä II x on negatiivinen ja y positiivinen.",
            "Neljänneksessä III x on negatiivinen ja y negatiivinen.",
            null
          ],
          "cols": 4
        },
        "hint": "I oikealla ylhäällä, sitten vastapäivään II, III ja IV.",
        "explain": "x on positiivinen (oikea), y negatiivinen (alas): neljännes IV."
      },
      "sortQ": {
        "phase": "guided",
        "seed": 4,
        "say": "Lajittele kohdat oikeaan neljännekseen.",
        "task": {
          "kind": "sort",
          "items": [
            {
              "text": "(−1, −4)"
            },
            {
              "text": "(−4, 3)"
            },
            {
              "text": "(4, −2)"
            },
            {
              "text": "(4, 4)"
            },
            {
              "text": "(−3, 3)"
            }
          ],
          "cats": [
            {
              "label": "I (+, +)"
            },
            {
              "label": "II (−, +)"
            },
            {
              "label": "III (−, −)"
            },
            {
              "label": "IV (+, −)"
            }
          ],
          "answer": [
            2,
            1,
            3,
            0,
            1
          ],
          "why": [
            "(−1, −4): x miinus (vasen), y miinus (alas) → III.",
            "(−4, 3): x miinus (vasen), y plus (ylös) → II.",
            "(4, −2): x plus (oikea), y miinus (alas) → IV.",
            "(4, 4): x plus (oikea), y plus (ylös) → I.",
            "(−3, 3): x miinus (vasen), y plus (ylös) → II."
          ]
        },
        "hint": "Katso vain merkkejä: (+, +) I, (−, +) II, (−, −) III, (+, −) IV.",
        "explain": "(−1, −4) → III, (−4, 3) → II, (4, −2) → IV, (4, 4) → I, (−3, 3) → II."
      },
      "plot": {
        "phase": "guided",
        "seed": 7,
        "say": "Merkitse kohta (−5, 4).",
        "task": {
          "kind": "plot",
          "xs": [
            -5
          ],
          "ys": [
            4
          ],
          "xMin": -5,
          "xMax": 5,
          "yMin": -4,
          "yMax": 4,
          "xStep": 1,
          "yStep": 1,
          "xLabel": "x",
          "yLabel": "y"
        },
        "hint": "Miinus x: vasemmalle. Miinus y: alas.",
        "explain": "(−5, 4): 5 vasemmalle ja 4 ylös."
      },
      "read": {
        "phase": "guided",
        "seed": 12,
        "say": "Missä laiva on?",
        "task": {
          "kind": "choice",
          "options": [
            {
              "big": "(4, 1)"
            },
            {
              "big": "(−4, 1)"
            },
            {
              "big": "(−4, −1)"
            }
          ],
          "answer": 1,
          "why": [
            "Katso, onko laiva nollan vasemmalla vai oikealla puolella.",
            null,
            "Katso, onko laiva nollan ylä- vai alapuolella."
          ]
        },
        "hint": "Ensin x: vasemmalla miinus. Sitten y: alhaalla miinus.",
        "explain": "4 vasemmalle, 1 ylös: (−4, 1)."
      },
      "transfer": {
        "phase": "transfer",
        "seed": 1,
        "say": "Majakka on kohdassa (3, −3). Sen peilikuva on x-akselin toisella puolella yhtä kaukana. Merkitse peilikuva.",
        "task": {
          "kind": "plot",
          "xs": [
            3
          ],
          "ys": [
            3
          ],
          "xMin": -5,
          "xMax": 5,
          "yMin": -4,
          "yMax": 4,
          "xStep": 1,
          "yStep": 1,
          "xLabel": "x",
          "yLabel": "y"
        },
        "hint": "x-akselin yli: kävele akselille ja saman verran yli. x pysyy samana.",
        "explain": "Peilaus x-akselin yli vaihtaa y:n merkin: (3, 3)."
      }
    },
    "findings": [],
    "registry": "Direct NodeSpec plus actual index/families inspection: no SIMS entry for these IDs; own AUDIT_REV; GOALS fallback if undefined."
  },
  "taskFamilies": [
    "quadrant",
    "sortQ",
    "plot",
    "read",
    "transfer"
  ],
  "familyTreatment": {
    "quadrant": "Nonzero signed points; choice of quadrant.",
    "sortQ": "Five distinct nonzero points sorted into four quadrants; actual source excludes axis/origin. Own lesson adds explicit boundary cases.",
    "plot": "Signed x −5..5, y −4..4; actual generator can reach axes/origin.",
    "read": "Nonzero coordinates chosen from alternatives. Two sign-flip distractors retained; swapped-coordinate candidate sliced out before delivery.",
    "transfer": "Mirror a signed point in x or y axis; co-taught M-SYM-01."
  },
  "demos": [
    "(−3,2): x then y, I→II→III→IV quadrants, (2,3) mirrored in y-axis."
  ],
  "introAndReward": {
    "intro": "Sea extends around the island into negative coordinates.",
    "ownTreatment": "Retain spatial purpose with supplied PNG; omit Lite reward wording that asserts complete four-quadrant mastery.",
    "hintExplainInventory": "Exact sampled family hint/explanation retained in actualInventory.sample; all source branches independently read in saari1.ts.",
    "sourceLines": "676–756"
  },
  "animations": {
    "source": "saari1.ts coordWalk; pics.ts gridParts",
    "actualRead": "Full relevant helper geometry/captions/phase logic read. Source iceHops uses timed .55-second steps; own manual steps depict unit intervals, not elapsed time. coordWalk traces x then y and shows region/sign labels.",
    "ownTreatment": "Free direct point selection, keyboard and numeric alternatives. Optional manual x/y route",
    "limits": "No copied art, no runtime oracle or generic KC/game mapping change."
  },
  "registry": {
    "index": "CONTENT_REV fallback; own AUDIT_REV preserved; own missing goal supplied from GOALS.",
    "families": "Transfer M-COORD-02 coTaught M-SYM-01; not added as a canonical gate.",
    "SIMS": "Neither own node in SIMS; no .6/.35/.5 overlay inherited.",
    "coverage": "COVERAGE omits sortQ and lists two rather than actual three demos."
  },
  "audit": {
    "path": "authority/production-181-v2/lite/audit/LESSON_AUDIT.md",
    "relevant": "Own rows and detailed iceHops/sort or coordWalk/sortQ review, around lines587–600. PEDAGOGY_REFERENCES and engine/types read.",
    "limits": "Inherited technical checks are historical; no efficacy/human approval transferred."
  },
  "comparison": "Construct both reading and plotting with visible axes and finite-domain truth. Any route to correct point accepted; ordered pair stays x,y. All four regions plus axes/origin, optional mirror transfer and paper observation. Fixed short checks do not establish the frozen process role.",
  "reconciliations": [
    "Read swapped-coordinate distractor exists in source candidate list but is sliced out; new checks explicitly diagnose swaps. Axes/origin are boundaries, not quadrants."
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
