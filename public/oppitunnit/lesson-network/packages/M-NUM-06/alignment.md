# M-NUM-06 — actual Lite reconciliation

{
  "canonical": {
    "id": "M-NUM-06",
    "subject": "mathematics",
    "grade_band": "1-2",
    "topic_area": "Luvut ja laskutoimitukset",
    "parent_concept": "Nolla",
    "title": "Nollan ymmärtäminen lukumääränä ja lukuna",
    "short_description": "Nollan ymmärtäminen lukumääränä ja lukuna",
    "source_basis": "pedagogically_derived",
    "curriculum_refs": [
      "OPH-POPS2014-MATH-VL1-2-S2"
    ],
    "evidence_notes": "Ehdokasnoodi. Arviointinäyttö, virhekäsitykset ja oppimispolku täsmennetään sisältösuunnittelussa.",
    "status": "candidate",
    "required_root": false,
    "root_kind": "none",
    "node_kind": "concept",
    "relations": [
      {
        "id": "M-NUM-03",
        "relation_type": "prerequisite",
        "strength": "required",
        "rationale": "M-NUM-03 on tämän osaamiskohteen välitön välttämätön esitieto."
      }
    ],
    "prerequisite_groups": [
      {
        "all_of": [
          "M-NUM-03"
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
      "Luvut ja laskutoimitukset",
      "Nolla"
    ]
  },
  "goal": "Opit, että nolla tarkoittaa: ei yhtään.",
  "goalOrigin": "GOALS fallback in index.ts",
  "nodeRevision": null,
  "validRevisions": null,
  "globalFallback": "lite181-2026-10-27",
  "motionOverlay": false,
  "intro": "Aavan pesä on tyhjä: poikaset ovat jo lentäneet. Kun ei ole yhtään, sanotaan nolla. Katsotaan, miten nolla syntyy.",
  "reward": "Nolla on luku: se tarkoittaa, ettei ole yhtään!",
  "families": {
    "count": {
      "taskKind": "choice",
      "seed": 1,
      "phase": "guided",
      "say": "Montako marjaa rasiassa on?",
      "hint": null,
      "explain": "Rasia on tyhjä. Yhtään ei ole: nolla.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "1",
            "speak": "yksi"
          },
          {
            "big": "10",
            "speak": "kymmenen"
          },
          {
            "big": "0",
            "speak": "nolla"
          }
        ],
        "answer": 2,
        "why": [
          "Rasiassa ei ole yhtään, ei edes yhtä.",
          "Kymmenessä on nolla perässä, mutta se on iso luku.",
          null
        ]
      },
      "registry": {
        "node": "M-NUM-06",
        "tag": "count",
        "outcome": "valitsee oikean vaihtoehdon",
        "assumed": [],
        "supplied": [],
        "coTaught": [],
        "incidental": {},
        "support": [],
        "source": [
          "oletus"
        ]
      },
      "media": {
        "kind": "static",
        "html": "<svg viewBox=\"0 0 180 130\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"4\" width=\"172\" height=\"100\" rx=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-opacity=\".35\" stroke-width=\"3\"/></svg>"
      }
    },
    "takeAll": {
      "taskKind": "choice",
      "seed": 2,
      "phase": "guided",
      "say": "Lautasella on kolme marjaa. Loikka syö ne kaikki. Montako jää?",
      "hint": null,
      "explain": "Kaikki kolme syötiin, joten jäi nolla.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "0",
            "speak": "nolla"
          },
          {
            "big": "1",
            "speak": "yksi"
          },
          {
            "big": "3",
            "speak": "kolme"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "Yksikään ei jäänyt.",
          "Ne kaikki syötiin."
        ]
      },
      "registry": {
        "node": "M-NUM-06",
        "tag": "takeAll",
        "outcome": "valitsee oikean vaihtoehdon",
        "assumed": [],
        "supplied": [],
        "coTaught": [],
        "incidental": {},
        "support": [],
        "source": [
          "oletus"
        ]
      },
      "media": {
        "kind": "animation",
        "duration": 5.700000000000001,
        "width": 320,
        "height": 150,
        "label": "3 esinettä, joista Loikka syö 3"
      }
    },
    "empty": {
      "taskKind": "choice",
      "seed": 7,
      "phase": "guided",
      "say": "Missä rasiassa ei ole yhtään?",
      "hint": null,
      "explain": "Tyhjässä rasiassa on nolla.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "art": "<svg viewBox=\"0 0 120 100\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"4\" width=\"112\" height=\"70\" rx=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-opacity=\".35\" stroke-width=\"3\"/><circle cx=\"28.882973627249402\" cy=\"49.76843357235193\" r=\"11.700000000000001\" fill=\"#4a5bd4\"/><circle cx=\"24.982973627249404\" cy=\"45.86843357235193\" r=\"2.6\" fill=\"#fff\" opacity=\".6\"/><circle cx=\"24.576123331611356\" cy=\"16.566006568819283\" r=\"11.700000000000001\" fill=\"#4a5bd4\"/><circle cx=\"20.676123331611358\" cy=\"12.666006568819283\" r=\"2.6\" fill=\"#fff\" opacity=\".6\"/></svg>"
          },
          {
            "art": "<svg viewBox=\"0 0 120 100\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"4\" width=\"112\" height=\"70\" rx=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-opacity=\".35\" stroke-width=\"3\"/><circle cx=\"24.88987192598482\" cy=\"50.76056812312454\" r=\"11.700000000000001\" fill=\"#4a5bd4\"/><circle cx=\"20.989871925984822\" cy=\"46.860568123124544\" r=\"2.6\" fill=\"#fff\" opacity=\".6\"/></svg>"
          },
          {
            "art": "<svg viewBox=\"0 0 120 100\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"4\" width=\"112\" height=\"70\" rx=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-opacity=\".35\" stroke-width=\"3\"/></svg>"
          }
        ],
        "answer": 2,
        "why": [
          "Tässä on jotain.",
          "Tässä on jotain.",
          null
        ]
      },
      "registry": {
        "node": "M-NUM-06",
        "tag": "empty",
        "outcome": "valitsee oikean vaihtoehdon",
        "assumed": [],
        "supplied": [],
        "coTaught": [],
        "incidental": {},
        "support": [],
        "source": [
          "oletus"
        ]
      },
      "media": {
        "kind": "none"
      }
    },
    "transfer": {
      "taskKind": "choice",
      "seed": 1,
      "phase": "transfer",
      "say": "Loikka laskee hyppykiviä alaspäin: neljä, kolme, kaksi, yksi... Mikä luku tulee seuraavaksi?",
      "hint": null,
      "explain": "Yhden jälkeen alaspäin tulee nolla: kivi, jolla ei ole yhtään.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "2",
            "speak": "kaksi"
          },
          {
            "big": "10",
            "speak": "kymmenen"
          },
          {
            "big": "0",
            "speak": "nolla"
          }
        ],
        "answer": 2,
        "why": [
          "Kaksi tuli jo. Alaspäin mennään pienempään.",
          "Kymmenen on paljon. Alaspäin ykkösen jälkeen tulee nolla.",
          null
        ]
      },
      "registry": {
        "node": "M-NUM-06",
        "tag": "transfer",
        "outcome": "valitsee oikean vaihtoehdon",
        "assumed": [],
        "supplied": [],
        "coTaught": [],
        "incidental": {},
        "support": [],
        "source": [
          "oletus"
        ]
      },
      "media": {
        "kind": "none"
      }
    }
  },
  "phaseCounts": {
    "guided": 512,
    "independent": 512,
    "retrieval": 512,
    "transfer": 512
  },
  "demos": [
    {
      "say": "Lautasella on kolme marjaa. Katso, kun Loikka syö ne yksi kerrallaan: kolme, kaksi, yksi…",
      "kind": "animation",
      "duration": 5.700000000000001,
      "width": 320,
      "height": 150,
      "label": "3 esinettä, joista Loikka syö 3",
      "snapshots": [
        {
          "time": 0,
          "caption": "Lautasella on kolme.",
          "sha256": "5c4901130ded19f70cd0b44ad3d5a44251c4584f96731968d3b3226e4ce244a4"
        },
        {
          "time": 0.14250000000000002,
          "caption": "Lautasella on kolme.",
          "sha256": "5c4901130ded19f70cd0b44ad3d5a44251c4584f96731968d3b3226e4ce244a4"
        },
        {
          "time": 0.28500000000000003,
          "caption": "Lautasella on kolme.",
          "sha256": "5c4901130ded19f70cd0b44ad3d5a44251c4584f96731968d3b3226e4ce244a4"
        },
        {
          "time": 0.42750000000000005,
          "caption": "Lautasella on kolme.",
          "sha256": "5c4901130ded19f70cd0b44ad3d5a44251c4584f96731968d3b3226e4ce244a4"
        },
        {
          "time": 0.5700000000000001,
          "caption": "Lautasella on kolme.",
          "sha256": "5c4901130ded19f70cd0b44ad3d5a44251c4584f96731968d3b3226e4ce244a4"
        },
        {
          "time": 0.7125000000000001,
          "caption": "Lautasella on kolme.",
          "sha256": "5c4901130ded19f70cd0b44ad3d5a44251c4584f96731968d3b3226e4ce244a4"
        },
        {
          "time": 0.8550000000000001,
          "caption": "Lautasella on kolme.",
          "sha256": "0e5b75eb711992596b619a3fa81c64d20652117ae3c04db6627234aae13086bc"
        },
        {
          "time": 0.9975000000000002,
          "caption": "Lautasella on kolme.",
          "sha256": "a762527ed0e67dcf87443515353a1b359e1c720baea7184103d83e1f43f16c40"
        },
        {
          "time": 1.1400000000000001,
          "caption": "Lautasella on kolme.",
          "sha256": "c667d54bce248d2bcdf6d9699a24b0211bbeb4ebd19178b4fcc266d5a758bb0a"
        },
        {
          "time": 1.2825000000000002,
          "caption": "Lautasella on kolme.",
          "sha256": "5c64b12e66a204af6ebfb88d199c88100767465c367bfd448c31c3c15b4a1225"
        },
        {
          "time": 1.4250000000000003,
          "caption": "Lautasella on kolme.",
          "sha256": "cf608fad7d4bfc240693fbc637683cec769b52f6fe5a89ad92804b71fe164137"
        },
        {
          "time": 1.5675000000000003,
          "caption": "Lautasella on kolme.",
          "sha256": "42784d26c4821533617f5511a074ba047954f73722229e336258963f53d3cfda"
        },
        {
          "time": 1.7100000000000002,
          "caption": "Lautasella on kolme.",
          "sha256": "42784d26c4821533617f5511a074ba047954f73722229e336258963f53d3cfda"
        },
        {
          "time": 1.8525000000000003,
          "caption": "Lautasella on kolme.",
          "sha256": "42784d26c4821533617f5511a074ba047954f73722229e336258963f53d3cfda"
        },
        {
          "time": 1.9950000000000003,
          "caption": "Loikka söi yksi. Jäljellä kaksi.",
          "sha256": "a8e44d66b8e9ed9da19cdd8792db4c28cef822736ef9a12bedf1ee692a31cad9"
        },
        {
          "time": 2.1375,
          "caption": "Loikka söi yksi. Jäljellä kaksi.",
          "sha256": "93e94a7ab304f9a557ce382fad68284c8a1f61d82c1542bfbfc1d2e1996d4d13"
        },
        {
          "time": 2.2800000000000002,
          "caption": "Loikka söi yksi. Jäljellä kaksi.",
          "sha256": "84f7b14a6fd403aae7155c46907806cc3fe854967b3e8a90525454ccc06e5455"
        },
        {
          "time": 2.4225000000000003,
          "caption": "Loikka söi yksi. Jäljellä kaksi.",
          "sha256": "02df8b3229747f0d9a9578bddb1594d62f29bf0991ec7b136e85eeea3c816986"
        },
        {
          "time": 2.5650000000000004,
          "caption": "Loikka söi yksi. Jäljellä kaksi.",
          "sha256": "45f90aeb9d2113ba5029bf33027c13b8bc39d6116f3ac641fe3dbe7a1fc33516"
        },
        {
          "time": 2.7075000000000005,
          "caption": "Loikka söi yksi. Jäljellä kaksi.",
          "sha256": "45f90aeb9d2113ba5029bf33027c13b8bc39d6116f3ac641fe3dbe7a1fc33516"
        },
        {
          "time": 2.8500000000000005,
          "caption": "Loikka söi yksi. Jäljellä kaksi.",
          "sha256": "45f90aeb9d2113ba5029bf33027c13b8bc39d6116f3ac641fe3dbe7a1fc33516"
        },
        {
          "time": 2.9925000000000006,
          "caption": "Loikka söi yksi. Jäljellä kaksi.",
          "sha256": "45f90aeb9d2113ba5029bf33027c13b8bc39d6116f3ac641fe3dbe7a1fc33516"
        },
        {
          "time": 3.1350000000000007,
          "caption": "Loikka söi kaksi. Jäljellä yksi.",
          "sha256": "b686e5a0cc976dc73f196ef2267c85e6467d88666bbbabe1fbbe298668cad909"
        },
        {
          "time": 3.2775000000000007,
          "caption": "Loikka söi kaksi. Jäljellä yksi.",
          "sha256": "96de35e3f9a79d4ed8f7426506650d2ce108804ec3e6827798ef3f26a0b01f0b"
        },
        {
          "time": 3.4200000000000004,
          "caption": "Loikka söi kaksi. Jäljellä yksi.",
          "sha256": "6e6b4c01d8d54c1f5b5ecb55f3eeaaaba8c660c79ec4a3483267ad248d04e486"
        },
        {
          "time": 3.562500000000001,
          "caption": "Loikka söi kaksi. Jäljellä yksi.",
          "sha256": "81d91d0ac4decfa610da3791d505bb3d3d7d244f4690e0f9c11f4424259a2781"
        },
        {
          "time": 3.7050000000000005,
          "caption": "Loikka söi kaksi. Jäljellä yksi.",
          "sha256": "9eeaace3b84722ca1dda880174478e65064a1d38b2a76f4db9f2b7ab10962c65"
        },
        {
          "time": 3.847500000000001,
          "caption": "Loikka söi kaksi. Jäljellä yksi.",
          "sha256": "9eeaace3b84722ca1dda880174478e65064a1d38b2a76f4db9f2b7ab10962c65"
        },
        {
          "time": 3.9900000000000007,
          "caption": "Loikka söi kaksi. Jäljellä yksi.",
          "sha256": "9eeaace3b84722ca1dda880174478e65064a1d38b2a76f4db9f2b7ab10962c65"
        },
        {
          "time": 4.132500000000001,
          "caption": "Loikka söi kolme. Jäljellä nolla.",
          "sha256": "d85cdc320af294d2d77795871e063fa245a301babe49ef07e11bc73fcdbd1c50"
        },
        {
          "time": 4.275,
          "caption": "Loikka söi kolme. Jäljellä nolla.",
          "sha256": "d85cdc320af294d2d77795871e063fa245a301babe49ef07e11bc73fcdbd1c50"
        },
        {
          "time": 4.417500000000001,
          "caption": "Loikka söi kolme. Jäljellä nolla.",
          "sha256": "d85cdc320af294d2d77795871e063fa245a301babe49ef07e11bc73fcdbd1c50"
        },
        {
          "time": 4.5600000000000005,
          "caption": "Loikka söi kolme. Jäljellä nolla.",
          "sha256": "d85cdc320af294d2d77795871e063fa245a301babe49ef07e11bc73fcdbd1c50"
        },
        {
          "time": 4.702500000000001,
          "caption": "Loikka söi kolme. Jäljellä nolla.",
          "sha256": "d85cdc320af294d2d77795871e063fa245a301babe49ef07e11bc73fcdbd1c50"
        },
        {
          "time": 4.845000000000001,
          "caption": "Loikka söi kolme. Jäljellä nolla.",
          "sha256": "d85cdc320af294d2d77795871e063fa245a301babe49ef07e11bc73fcdbd1c50"
        },
        {
          "time": 4.987500000000001,
          "caption": "Loikka söi kolme. Jäljellä nolla.",
          "sha256": "d85cdc320af294d2d77795871e063fa245a301babe49ef07e11bc73fcdbd1c50"
        },
        {
          "time": 5.130000000000001,
          "caption": "Loikka söi kolme. Jäljellä nolla.",
          "sha256": "d85cdc320af294d2d77795871e063fa245a301babe49ef07e11bc73fcdbd1c50"
        },
        {
          "time": 5.272500000000001,
          "caption": "Loikka söi kolme. Jäljellä nolla.",
          "sha256": "d85cdc320af294d2d77795871e063fa245a301babe49ef07e11bc73fcdbd1c50"
        },
        {
          "time": 5.415000000000001,
          "caption": "Loikka söi kolme. Jäljellä nolla.",
          "sha256": "d85cdc320af294d2d77795871e063fa245a301babe49ef07e11bc73fcdbd1c50"
        },
        {
          "time": 5.557500000000001,
          "caption": "Loikka söi kolme. Jäljellä nolla.",
          "sha256": "d85cdc320af294d2d77795871e063fa245a301babe49ef07e11bc73fcdbd1c50"
        },
        {
          "time": 5.700000000000001,
          "caption": "Loikka söi kolme. Jäljellä nolla.",
          "sha256": "d85cdc320af294d2d77795871e063fa245a301babe49ef07e11bc73fcdbd1c50"
        }
      ]
    },
    {
      "say": "Nyt korissa ei ole yhtään marjaa. Yhtään ei ole: se on nolla. Numerona nolla kirjoitetaan näin.",
      "kind": "static",
      "html": "<svg viewBox=\"0 0 180 130\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"4\" y=\"4\" width=\"172\" height=\"100\" rx=\"12\" fill=\"none\" stroke=\"currentColor\" stroke-opacity=\".35\" stroke-width=\"3\"/><text x=\"90\" y=\"124\" text-anchor=\"middle\" font-size=\"20\" font-weight=\"800\" fill=\"currentColor\">0</text></svg>"
    }
  ]
}

## Authored mapping

{
  "empty": "empty/nonempty classification grounded in visible regions",
  "count": "numeric amount including0 andpositive control",
  "takeAll": "real observable departure; no static crossed-out substitute",
  "transfer": "new emptycontext; providedone-tozero boundary optional"
}

Zero has no own NodeSpec revision; effective fallback is lite181-2026-10-27, while audit says no revision change. Transfer countdown is not a new hard backward-fluency gate. Own bounded tray/task distinguishes blank fromzero; actual controllable movement replaces mere crossed-out stills.

## Evidence and lifecycle

Supported absence↔quantity↔numeral concept, not independent field observation, physical emptying, oral recitation, general subtraction or personal mastery.

Both semanticinput/change and explicit current-visible-answer checks; model/help and truth-preserving rearrangement preserve separate valid verdicts. Pause freezes every owned control, reset preservespause, dispose removes owned listeners/RAF, remount single. No sharedstate, graph, game semantic-choice branch, formal process/rubric or personal mastery created.
