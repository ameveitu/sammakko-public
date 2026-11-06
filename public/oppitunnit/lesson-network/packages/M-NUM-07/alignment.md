# M-NUM-07 — actual Lite reconciliation

{
  "canonical": {
    "id": "M-NUM-07",
    "subject": "mathematics",
    "grade_band": "1-2",
    "topic_area": "Luvut ja laskutoimitukset",
    "parent_concept": "Lukujono",
    "title": "Lukujonon jatkaminen eteenpäin",
    "short_description": "Lukujonon jatkaminen eteenpäin",
    "source_basis": "direct_curriculum",
    "curriculum_refs": [
      "OPH-POPS2014-MATH-VL1-2-S2"
    ],
    "evidence_notes": "Ehdokasnoodi. Arviointinäyttö, virhekäsitykset ja oppimispolku täsmennetään sisältösuunnittelussa.",
    "status": "candidate",
    "required_root": false,
    "root_kind": "none",
    "node_kind": "procedure",
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
      "Lukujono"
    ]
  },
  "goal": "Opit jatkamaan lukujonoa eteenpäin.",
  "goalOrigin": "GOALS fallback in index.ts",
  "nodeRevision": "audit1-2026-10-28",
  "validRevisions": [
    "audit1-2026-10-28"
  ],
  "globalFallback": "lite181-2026-10-27",
  "motionOverlay": false,
  "intro": "Loikka hyppii numerokiviä lammen yli. Mikä numero on seuraavassa kivessä?",
  "reward": "Loikka pääsi lammen yli!",
  "families": {
    "big": {
      "taskKind": "choice",
      "seed": 1,
      "phase": "guided",
      "say": "Mikä numero on seuraavassa kivessä?",
      "hint": "Sano luvut ääneen.",
      "explain": "17, 18, 19, 20: joka kerta + 1.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "20"
          },
          {
            "big": "18"
          },
          {
            "big": "21"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "18 on jo kivissä. Jono menee eteenpäin.",
          "21 hyppää yhden kiven yli: ennen sitä tulee 20."
        ]
      },
      "registry": {
        "node": "M-NUM-07",
        "tag": "big",
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
        "html": "<svg viewBox=\"0 0 274 90\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"38\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"38\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">17</text><ellipse cx=\"104\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"104\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">18</text><ellipse cx=\"170\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"170\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">19</text><ellipse cx=\"236\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"var(--sun)\"/><text x=\"236\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#3a2c00\">?</text><g>\n    <ellipse cx=\"38\" cy=\"27.15\" rx=\"13.65\" ry=\"7.15\" fill=\"#3e9b54\"/>\n    <ellipse cx=\"38\" cy=\"21.3\" rx=\"13\" ry=\"8.06\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"44.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"44.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"32.019999999999996\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"45.02\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"29.939999999999998\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <circle cx=\"46.06\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <path d=\"M32.15 21.95 Q38 27.15 43.85 21.95\" stroke=\"#1f4d2b\" stroke-width=\"1.04\" fill=\"none\" stroke-linecap=\"round\"/>\n  </g></svg>"
      }
    },
    "order": {
      "taskKind": "build",
      "seed": 4,
      "phase": "guided",
      "say": "Numerot putosivat kiviltä. Laita ne takaisin järjestykseen pienimmästä alkaen.",
      "hint": "Aloita luvusta 8 ja lisää aina yksi.",
      "explain": "8, 9, 10, 11, 12: joka kivellä yksi enemmän, myös kymmenen yli.",
      "task": {
        "kind": "build",
        "tokens": [
          "10",
          "12",
          "11",
          "8",
          "9"
        ],
        "target": "8 9 10 11 12",
        "mode": "seq",
        "max": 5
      },
      "registry": {
        "node": "M-NUM-07",
        "tag": "order",
        "outcome": "rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään)",
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
    "small": {
      "taskKind": "choice",
      "seed": 7,
      "phase": "guided",
      "say": "Mikä numero on seuraavassa kivessä?",
      "hint": "Sano luvut ääneen.",
      "explain": "1, 2, 3, 4: joka kerta + 1.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "4"
          },
          {
            "big": "5"
          },
          {
            "big": "2"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "5 hyppää yhden kiven yli: ennen sitä tulee 4.",
          "2 on jo kivissä. Jono menee eteenpäin."
        ]
      },
      "registry": {
        "node": "M-NUM-07",
        "tag": "small",
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
        "html": "<svg viewBox=\"0 0 274 90\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"38\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"38\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">1</text><ellipse cx=\"104\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"104\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">2</text><ellipse cx=\"170\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"170\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">3</text><ellipse cx=\"236\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"var(--sun)\"/><text x=\"236\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#3a2c00\">?</text><g>\n    <ellipse cx=\"38\" cy=\"27.15\" rx=\"13.65\" ry=\"7.15\" fill=\"#3e9b54\"/>\n    <ellipse cx=\"38\" cy=\"21.3\" rx=\"13\" ry=\"8.06\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"44.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"44.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"32.019999999999996\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"45.02\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"29.939999999999998\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <circle cx=\"46.06\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <path d=\"M32.15 21.95 Q38 27.15 43.85 21.95\" stroke=\"#1f4d2b\" stroke-width=\"1.04\" fill=\"none\" stroke-linecap=\"round\"/>\n  </g></svg>"
      }
    },
    "teen": {
      "taskKind": "choice",
      "seed": 12,
      "phase": "guided",
      "say": "Mikä numero on seuraavassa kivessä?",
      "hint": "Sano luvut ääneen.",
      "explain": "8, 9, 10, 11: joka kerta + 1.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "11"
          },
          {
            "big": "9"
          },
          {
            "big": "12"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "9 on jo kivissä. Jono menee eteenpäin.",
          "12 hyppää yhden kiven yli: ennen sitä tulee 11."
        ]
      },
      "registry": {
        "node": "M-NUM-07",
        "tag": "teen",
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
        "html": "<svg viewBox=\"0 0 274 90\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"38\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"38\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">8</text><ellipse cx=\"104\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"104\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">9</text><ellipse cx=\"170\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"170\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">10</text><ellipse cx=\"236\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"var(--sun)\"/><text x=\"236\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#3a2c00\">?</text><g>\n    <ellipse cx=\"38\" cy=\"27.15\" rx=\"13.65\" ry=\"7.15\" fill=\"#3e9b54\"/>\n    <ellipse cx=\"38\" cy=\"21.3\" rx=\"13\" ry=\"8.06\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"44.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"44.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"32.019999999999996\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"45.02\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"29.939999999999998\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <circle cx=\"46.06\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <path d=\"M32.15 21.95 Q38 27.15 43.85 21.95\" stroke=\"#1f4d2b\" stroke-width=\"1.04\" fill=\"none\" stroke-linecap=\"round\"/>\n  </g></svg>"
      }
    },
    "transfer": {
      "taskKind": "choice",
      "seed": 1,
      "phase": "transfer",
      "say": "Yhdestä kivestä on numero kulunut pois. Mikä siinä oli?",
      "hint": "Mikä luku tulee heti luvun 18 jälkeen?",
      "explain": "18, 19, 20: puuttuva on 19.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "22"
          },
          {
            "big": "20"
          },
          {
            "big": "19"
          }
        ],
        "answer": 2,
        "why": [
          "22 tulisi vasta viimeisen kiven jälkeen.",
          "20 on jo seuraavassa kivessä.",
          null
        ]
      },
      "registry": {
        "node": "M-NUM-07",
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
        "kind": "static",
        "html": "<svg viewBox=\"0 0 274 90\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"38\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"38\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">18</text><ellipse cx=\"104\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"var(--sun)\"/><text x=\"104\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#3a2c00\">?</text><ellipse cx=\"170\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"170\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">20</text><ellipse cx=\"236\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"236\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">21</text><g>\n    <ellipse cx=\"38\" cy=\"27.15\" rx=\"13.65\" ry=\"7.15\" fill=\"#3e9b54\"/>\n    <ellipse cx=\"38\" cy=\"21.3\" rx=\"13\" ry=\"8.06\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"44.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"44.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"32.019999999999996\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"45.02\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"29.939999999999998\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <circle cx=\"46.06\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <path d=\"M32.15 21.95 Q38 27.15 43.85 21.95\" stroke=\"#1f4d2b\" stroke-width=\"1.04\" fill=\"none\" stroke-linecap=\"round\"/>\n  </g></svg>"
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
      "say": "Loikka hyppää kiveltä kivelle. Joka hypyllä luku kasvaa yhdellä: neljä, viisi, kuusi. Seuraavana on seitsemän.",
      "kind": "animation",
      "duration": 5,
      "width": 320,
      "height": 130,
      "label": "Loikka hyppii kiveltä kivelle ja laskee",
      "snapshots": [
        {
          "time": 0,
          "caption": "Mikä luku on seuraavassa kivessä?",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.125,
          "caption": "Mikä luku on seuraavassa kivessä?",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.25,
          "caption": "Mikä luku on seuraavassa kivessä?",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.375,
          "caption": "Mikä luku on seuraavassa kivessä?",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.5,
          "caption": "Mikä luku on seuraavassa kivessä?",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.625,
          "caption": "Mikä luku on seuraavassa kivessä?",
          "sha256": "6659d7ffcdddef0f2ba44572d9c351810bbac423d5a243b21e1351f47f244007"
        },
        {
          "time": 0.75,
          "caption": "Mikä luku on seuraavassa kivessä?",
          "sha256": "73be4cac7aef7fe087820afb4616111474fb4a5a4cfac820b50b421e8ee179f2"
        },
        {
          "time": 0.875,
          "caption": "Mikä luku on seuraavassa kivessä?",
          "sha256": "5791e457607d19a8585c3998241c0f57d1d247cba44370e48fc91fd64c69b531"
        },
        {
          "time": 1,
          "caption": "Mikä luku on seuraavassa kivessä?",
          "sha256": "0fbabe3f9b5c36389f7e9914ac9e628aed1bd7c13659b66c8e11e52f4ed684d4"
        },
        {
          "time": 1.125,
          "caption": "Mikä luku on seuraavassa kivessä?",
          "sha256": "3c61bf8f6e556919ae02705113bc6bfc58b204a194d4f08fb80b7503be218c0a"
        },
        {
          "time": 1.25,
          "caption": "4…",
          "sha256": "c34fdc11006d188dac9d19caef5da5724f21156e6ed43b6096dc3faa8d0686a5"
        },
        {
          "time": 1.375,
          "caption": "4…",
          "sha256": "c34fdc11006d188dac9d19caef5da5724f21156e6ed43b6096dc3faa8d0686a5"
        },
        {
          "time": 1.5,
          "caption": "4…",
          "sha256": "c34fdc11006d188dac9d19caef5da5724f21156e6ed43b6096dc3faa8d0686a5"
        },
        {
          "time": 1.625,
          "caption": "4…",
          "sha256": "1afd32af4d711d78e747e6de7090e0a4f0359a171e5d71567899a3117d7e2cc9"
        },
        {
          "time": 1.75,
          "caption": "4…",
          "sha256": "584b41e3989c2307cda53d6554ec8b8d6a5e803093e847bbdb612dd6ffb52b55"
        },
        {
          "time": 1.875,
          "caption": "4…",
          "sha256": "74470d2b2e7849400f1e1c91203a63911ce219424619f2c390fcdbc5f096dfd6"
        },
        {
          "time": 2,
          "caption": "4…",
          "sha256": "5ae13e94da58354601decc2c94e23c91e4175edfa2890a52d068dabf2b8c9faf"
        },
        {
          "time": 2.125,
          "caption": "4…",
          "sha256": "ad9cafd38309eebf12a64f0005a1490332ef2516ebafb0f7e35d4b206f111ad4"
        },
        {
          "time": 2.25,
          "caption": "4, 5…",
          "sha256": "7f0e9edb04adc09414bbad24f6f359618a0f2fa06404768a608563f7d8ff65e2"
        },
        {
          "time": 2.375,
          "caption": "4, 5…",
          "sha256": "7f0e9edb04adc09414bbad24f6f359618a0f2fa06404768a608563f7d8ff65e2"
        },
        {
          "time": 2.5,
          "caption": "4, 5…",
          "sha256": "70552c889c74e1d750305c1356a200777c8ccb3af7d197543d396c3d220957a8"
        },
        {
          "time": 2.625,
          "caption": "4, 5…",
          "sha256": "784716a77a69d3c2598fa51f8833834fe3266412e5b95a2d5f3b717e38d08262"
        },
        {
          "time": 2.75,
          "caption": "4, 5…",
          "sha256": "79c64e095af60533153d1a6dd7248060598690703fd631da4426a588e816403b"
        },
        {
          "time": 2.875,
          "caption": "4, 5…",
          "sha256": "bf012343889c25e4ac0c482214fd15017efadafc6f42757538865b93f71cc009"
        },
        {
          "time": 3,
          "caption": "4, 5…",
          "sha256": "aa70e0b5d2dd206d82618eadcbfa8b5cceaa9608277338faf2b0ed85e3bdba3c"
        },
        {
          "time": 3.125,
          "caption": "4, 5, 6…",
          "sha256": "def6c7e5a0150285ab0552f23a8b6395581710dcffc7eaf7f979a74ada8f680f"
        },
        {
          "time": 3.25,
          "caption": "4, 5, 6…",
          "sha256": "def6c7e5a0150285ab0552f23a8b6395581710dcffc7eaf7f979a74ada8f680f"
        },
        {
          "time": 3.375,
          "caption": "4, 5, 6…",
          "sha256": "3cd5aebb9e6aace9bc101e7b92de79e3994c2fa85b289ad0c5d7d833226aed78"
        },
        {
          "time": 3.5,
          "caption": "4, 5, 6…",
          "sha256": "26e419f0156d858d8ec03b0b7dddf98154b5b160cacc8dea7b1204c30cbc9608"
        },
        {
          "time": 3.625,
          "caption": "4, 5, 6…",
          "sha256": "ed190fbf96888eb3f4a43c95b102ec1a006735065fd2bf51eb84844fbf418bd6"
        },
        {
          "time": 3.75,
          "caption": "4, 5, 6…",
          "sha256": "8c595a53db6b2fe826b37f1abf01145082e13718ff1f184cf4197957518b2c57"
        },
        {
          "time": 3.875,
          "caption": "4, 5, 6…",
          "sha256": "b5874e391d797789b52f9abae0d7077354e9afd77077d2bbf5fd4b6afb8f417b"
        },
        {
          "time": 4,
          "caption": "4, 5, 6, 7: joka hypyllä yksi lisää.",
          "sha256": "43e118e84de3b9ca27711055862c6c2662df7f649b43578474eb6a0891dd5d57"
        },
        {
          "time": 4.125,
          "caption": "4, 5, 6, 7: joka hypyllä yksi lisää.",
          "sha256": "43e118e84de3b9ca27711055862c6c2662df7f649b43578474eb6a0891dd5d57"
        },
        {
          "time": 4.25,
          "caption": "4, 5, 6, 7: joka hypyllä yksi lisää.",
          "sha256": "43e118e84de3b9ca27711055862c6c2662df7f649b43578474eb6a0891dd5d57"
        },
        {
          "time": 4.375,
          "caption": "4, 5, 6, 7: joka hypyllä yksi lisää.",
          "sha256": "43e118e84de3b9ca27711055862c6c2662df7f649b43578474eb6a0891dd5d57"
        },
        {
          "time": 4.5,
          "caption": "4, 5, 6, 7: joka hypyllä yksi lisää.",
          "sha256": "43e118e84de3b9ca27711055862c6c2662df7f649b43578474eb6a0891dd5d57"
        },
        {
          "time": 4.625,
          "caption": "4, 5, 6, 7: joka hypyllä yksi lisää.",
          "sha256": "43e118e84de3b9ca27711055862c6c2662df7f649b43578474eb6a0891dd5d57"
        },
        {
          "time": 4.75,
          "caption": "4, 5, 6, 7: joka hypyllä yksi lisää.",
          "sha256": "43e118e84de3b9ca27711055862c6c2662df7f649b43578474eb6a0891dd5d57"
        },
        {
          "time": 4.875,
          "caption": "4, 5, 6, 7: joka hypyllä yksi lisää.",
          "sha256": "43e118e84de3b9ca27711055862c6c2662df7f649b43578474eb6a0891dd5d57"
        },
        {
          "time": 5,
          "caption": "4, 5, 6, 7: joka hypyllä yksi lisää.",
          "sha256": "43e118e84de3b9ca27711055862c6c2662df7f649b43578474eb6a0891dd5d57"
        }
      ]
    },
    {
      "say": "Kymmenen jälkeen tulee yksitoista, sitten kaksitoista. Luku kasvaa edelleen yhdellä.",
      "kind": "animation",
      "duration": 5,
      "width": 320,
      "height": 130,
      "label": "Loikka hyppii kiveltä kivelle ja laskee",
      "snapshots": [
        {
          "time": 0,
          "caption": "",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.125,
          "caption": "",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.25,
          "caption": "",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.375,
          "caption": "",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.5,
          "caption": "",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.625,
          "caption": "",
          "sha256": "6659d7ffcdddef0f2ba44572d9c351810bbac423d5a243b21e1351f47f244007"
        },
        {
          "time": 0.75,
          "caption": "",
          "sha256": "73be4cac7aef7fe087820afb4616111474fb4a5a4cfac820b50b421e8ee179f2"
        },
        {
          "time": 0.875,
          "caption": "",
          "sha256": "5791e457607d19a8585c3998241c0f57d1d247cba44370e48fc91fd64c69b531"
        },
        {
          "time": 1,
          "caption": "",
          "sha256": "0fbabe3f9b5c36389f7e9914ac9e628aed1bd7c13659b66c8e11e52f4ed684d4"
        },
        {
          "time": 1.125,
          "caption": "",
          "sha256": "3c61bf8f6e556919ae02705113bc6bfc58b204a194d4f08fb80b7503be218c0a"
        },
        {
          "time": 1.25,
          "caption": "9",
          "sha256": "d46939a6ed1747e2bf48284ad9603f6d64ff6aba8d9eda1660875b251ee11602"
        },
        {
          "time": 1.375,
          "caption": "9",
          "sha256": "d46939a6ed1747e2bf48284ad9603f6d64ff6aba8d9eda1660875b251ee11602"
        },
        {
          "time": 1.5,
          "caption": "9",
          "sha256": "d46939a6ed1747e2bf48284ad9603f6d64ff6aba8d9eda1660875b251ee11602"
        },
        {
          "time": 1.625,
          "caption": "9",
          "sha256": "bf10ef2797901a022b2f943e2b7d1d02094c9161e45b37762fe143fab5148c2f"
        },
        {
          "time": 1.75,
          "caption": "9",
          "sha256": "76c1ebcf983131a676342ebf4ebd7bf89e3e624bd6335c9459e8675921bfcfb8"
        },
        {
          "time": 1.875,
          "caption": "9",
          "sha256": "fcf663ca1fcf8b12999d00e926b3bfc049ae5967569e51a06e2f430305ef4a65"
        },
        {
          "time": 2,
          "caption": "9",
          "sha256": "c766bbc9f65295db7eec5e1e6c5ced65f1bdb5c66433defe4d88bebf9386077b"
        },
        {
          "time": 2.125,
          "caption": "9",
          "sha256": "28ac858c50f805de24f3b9b00b709082fb8af4b9fed0a79edfb8981cb6c27253"
        },
        {
          "time": 2.25,
          "caption": "9, 10",
          "sha256": "9e85b8285029e39292eb6bab982205542d7a73246efd7ed610676eb8fb02e6a1"
        },
        {
          "time": 2.375,
          "caption": "9, 10",
          "sha256": "9e85b8285029e39292eb6bab982205542d7a73246efd7ed610676eb8fb02e6a1"
        },
        {
          "time": 2.5,
          "caption": "9, 10",
          "sha256": "7d49503ba36331f5ca782ec00528ba68c0d6801063a823634fedc3cef422af69"
        },
        {
          "time": 2.625,
          "caption": "9, 10",
          "sha256": "43f58d51afcaba5308be76ed4ae303a7970805f3b27aa4c07f6f0c6862916f5c"
        },
        {
          "time": 2.75,
          "caption": "9, 10",
          "sha256": "333201f88ccbdf47cda87e781e2e154ad564b88c5232106ed32bccce2afb15e6"
        },
        {
          "time": 2.875,
          "caption": "9, 10",
          "sha256": "5e6f4815afb28d69a139061c4aed9a72c4bb86be703b2ad5d238cdf99b0ae616"
        },
        {
          "time": 3,
          "caption": "9, 10",
          "sha256": "cce03f4c75a4728f1a245501d4ecd3c7a651f9c0d06cedf5a714040fca4ca00c"
        },
        {
          "time": 3.125,
          "caption": "9, 10, 11",
          "sha256": "fc833945ee41d4f6fc7ad07d544ede65536de99b815081d05cfdf7b9fff9a43b"
        },
        {
          "time": 3.25,
          "caption": "9, 10, 11",
          "sha256": "fc833945ee41d4f6fc7ad07d544ede65536de99b815081d05cfdf7b9fff9a43b"
        },
        {
          "time": 3.375,
          "caption": "9, 10, 11",
          "sha256": "bba7ee7cbf6bd127650b0b7541410a1f366becea7ebb1eeac3cecf3bf23184e5"
        },
        {
          "time": 3.5,
          "caption": "9, 10, 11",
          "sha256": "9b239b40676254bafcc0bf9263f9e69bcc975bb3e5cd5bc8b4e2ee1aa92185a2"
        },
        {
          "time": 3.625,
          "caption": "9, 10, 11",
          "sha256": "f2bbe2221e6035495d3086c88f9c8c8dbb021339eed889859283aa2fe886db24"
        },
        {
          "time": 3.75,
          "caption": "9, 10, 11",
          "sha256": "9bfdca27783bb62ebde313f528fdc51f642c46e58e98bff56442a300021ddd50"
        },
        {
          "time": 3.875,
          "caption": "9, 10, 11",
          "sha256": "4e78df3ac1f4317bd0e16d884f76409b01a679712205381f70c635e1f4ed9fd3"
        },
        {
          "time": 4,
          "caption": "9, 10, 11, 12",
          "sha256": "9d6021277ad7fc19b52d3c9491963ba7e3bf10f6fe8a6ea64fd53c898a94802f"
        },
        {
          "time": 4.125,
          "caption": "9, 10, 11, 12",
          "sha256": "9d6021277ad7fc19b52d3c9491963ba7e3bf10f6fe8a6ea64fd53c898a94802f"
        },
        {
          "time": 4.25,
          "caption": "9, 10, 11, 12",
          "sha256": "9d6021277ad7fc19b52d3c9491963ba7e3bf10f6fe8a6ea64fd53c898a94802f"
        },
        {
          "time": 4.375,
          "caption": "9, 10, 11, 12",
          "sha256": "9d6021277ad7fc19b52d3c9491963ba7e3bf10f6fe8a6ea64fd53c898a94802f"
        },
        {
          "time": 4.5,
          "caption": "9, 10, 11, 12",
          "sha256": "9d6021277ad7fc19b52d3c9491963ba7e3bf10f6fe8a6ea64fd53c898a94802f"
        },
        {
          "time": 4.625,
          "caption": "9, 10, 11, 12",
          "sha256": "9d6021277ad7fc19b52d3c9491963ba7e3bf10f6fe8a6ea64fd53c898a94802f"
        },
        {
          "time": 4.75,
          "caption": "9, 10, 11, 12",
          "sha256": "9d6021277ad7fc19b52d3c9491963ba7e3bf10f6fe8a6ea64fd53c898a94802f"
        },
        {
          "time": 4.875,
          "caption": "9, 10, 11, 12",
          "sha256": "9d6021277ad7fc19b52d3c9491963ba7e3bf10f6fe8a6ea64fd53c898a94802f"
        },
        {
          "time": 5,
          "caption": "9, 10, 11, 12",
          "sha256": "9d6021277ad7fc19b52d3c9491963ba7e3bf10f6fe8a6ea64fd53c898a94802f"
        }
      ]
    },
    {
      "say": "Yhdeksäntoista jälkeen alkaa uusi kymmenen: kaksikymmentä, sitten kaksikymmentäyksi.",
      "kind": "animation",
      "duration": 5,
      "width": 320,
      "height": 130,
      "label": "Loikka hyppii kiveltä kivelle ja laskee",
      "snapshots": [
        {
          "time": 0,
          "caption": "",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.125,
          "caption": "",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.25,
          "caption": "",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.375,
          "caption": "",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.5,
          "caption": "",
          "sha256": "cf6a25518ab1a7b10f12c091ab192530da73c064150e0b60eb70f8a3b5d4a7f7"
        },
        {
          "time": 0.625,
          "caption": "",
          "sha256": "6659d7ffcdddef0f2ba44572d9c351810bbac423d5a243b21e1351f47f244007"
        },
        {
          "time": 0.75,
          "caption": "",
          "sha256": "73be4cac7aef7fe087820afb4616111474fb4a5a4cfac820b50b421e8ee179f2"
        },
        {
          "time": 0.875,
          "caption": "",
          "sha256": "5791e457607d19a8585c3998241c0f57d1d247cba44370e48fc91fd64c69b531"
        },
        {
          "time": 1,
          "caption": "",
          "sha256": "0fbabe3f9b5c36389f7e9914ac9e628aed1bd7c13659b66c8e11e52f4ed684d4"
        },
        {
          "time": 1.125,
          "caption": "",
          "sha256": "3c61bf8f6e556919ae02705113bc6bfc58b204a194d4f08fb80b7503be218c0a"
        },
        {
          "time": 1.25,
          "caption": "18",
          "sha256": "bbe75bb07da4efcb845c7ee4eaaf5d72209e2d057e40ebd25c01d36d9b66dd25"
        },
        {
          "time": 1.375,
          "caption": "18",
          "sha256": "bbe75bb07da4efcb845c7ee4eaaf5d72209e2d057e40ebd25c01d36d9b66dd25"
        },
        {
          "time": 1.5,
          "caption": "18",
          "sha256": "bbe75bb07da4efcb845c7ee4eaaf5d72209e2d057e40ebd25c01d36d9b66dd25"
        },
        {
          "time": 1.625,
          "caption": "18",
          "sha256": "4b7532993bbc5f1e333e932a34502648fce34f449f498517cb4b9f4330ebcd00"
        },
        {
          "time": 1.75,
          "caption": "18",
          "sha256": "9147fab0ebcf42b36a2aa5bde40c6e08da42ee838be7ebc2aed0c76679f654ed"
        },
        {
          "time": 1.875,
          "caption": "18",
          "sha256": "9a7f14d2b2064b02457ef44a101a474fe2a4f8a307bfafb89d8430ac0fb7dda8"
        },
        {
          "time": 2,
          "caption": "18",
          "sha256": "4f6da78f2ea97344fd11cb4ff754b895f8cd06550a8a4eabb068edf02196b8de"
        },
        {
          "time": 2.125,
          "caption": "18",
          "sha256": "6858694ef3e3fe5a8ee7eb825a7e31b132f505802f5c31f8eb6c676bf5772531"
        },
        {
          "time": 2.25,
          "caption": "18, 19",
          "sha256": "1f6da50f567c16e3ee5d480692387ef07f50aa51cd763d08699c0d5e511c1152"
        },
        {
          "time": 2.375,
          "caption": "18, 19",
          "sha256": "1f6da50f567c16e3ee5d480692387ef07f50aa51cd763d08699c0d5e511c1152"
        },
        {
          "time": 2.5,
          "caption": "18, 19",
          "sha256": "428fa397ca1f0bed6d483edc8070c455b8c84c5096e13485fa9697f1f45e3474"
        },
        {
          "time": 2.625,
          "caption": "18, 19",
          "sha256": "8e49c8c968f294d4429698eb3c5110ae9e063f70a40f124d697b838e347e7a6e"
        },
        {
          "time": 2.75,
          "caption": "18, 19",
          "sha256": "f2b7ac615cde2b2511291b8555d8636de16bd38eef7b7f8c7f3746e6a9ee69cf"
        },
        {
          "time": 2.875,
          "caption": "18, 19",
          "sha256": "b3af6ae33ae3ab311c9a5f61492acb6d64cde108bd1d3cffd3379402c01c835e"
        },
        {
          "time": 3,
          "caption": "18, 19",
          "sha256": "8e7262a194dc32daceef9402059cd8761c293ec2d0092f31fdf6eed6ff71af5d"
        },
        {
          "time": 3.125,
          "caption": "18, 19, 20: 19:n jälkeen tulee 20.",
          "sha256": "9ab8bc798be12c5a550a904b15de12fdd9e8cdb56fdbf6169007b16bd60cbd08"
        },
        {
          "time": 3.25,
          "caption": "18, 19, 20: 19:n jälkeen tulee 20.",
          "sha256": "9ab8bc798be12c5a550a904b15de12fdd9e8cdb56fdbf6169007b16bd60cbd08"
        },
        {
          "time": 3.375,
          "caption": "18, 19, 20: 19:n jälkeen tulee 20.",
          "sha256": "dfb22ebd4dc814af3c2400af6eb6805ca97ab1867119cf8629e6d9cdd96ab7ae"
        },
        {
          "time": 3.5,
          "caption": "18, 19, 20: 19:n jälkeen tulee 20.",
          "sha256": "f0e459cbdb16f24e43ddf8d98067c107951fd729d9b063a4314ff7ff1a9770a3"
        },
        {
          "time": 3.625,
          "caption": "18, 19, 20: 19:n jälkeen tulee 20.",
          "sha256": "c4562b32311c07afd5c9ec3b2345d190a7d9835a244d24d96ef059680f6718a2"
        },
        {
          "time": 3.75,
          "caption": "18, 19, 20: 19:n jälkeen tulee 20.",
          "sha256": "306b64b90fcbe80b3ee50eb19941a1edcbd94697bd38170101f8ab3d71acb966"
        },
        {
          "time": 3.875,
          "caption": "18, 19, 20: 19:n jälkeen tulee 20.",
          "sha256": "f2b416689c56526413877307c6396bae256eb7605f831451574127bd05d2ce8b"
        },
        {
          "time": 4,
          "caption": "18, 19, 20, 21: 19:n jälkeen tulee 20.",
          "sha256": "87703051e0c7df449850f7a7c9db82e44f0b0b03fc85a035421ae906b3c40736"
        },
        {
          "time": 4.125,
          "caption": "18, 19, 20, 21: 19:n jälkeen tulee 20.",
          "sha256": "87703051e0c7df449850f7a7c9db82e44f0b0b03fc85a035421ae906b3c40736"
        },
        {
          "time": 4.25,
          "caption": "18, 19, 20, 21: 19:n jälkeen tulee 20.",
          "sha256": "87703051e0c7df449850f7a7c9db82e44f0b0b03fc85a035421ae906b3c40736"
        },
        {
          "time": 4.375,
          "caption": "18, 19, 20, 21: 19:n jälkeen tulee 20.",
          "sha256": "87703051e0c7df449850f7a7c9db82e44f0b0b03fc85a035421ae906b3c40736"
        },
        {
          "time": 4.5,
          "caption": "18, 19, 20, 21: 19:n jälkeen tulee 20.",
          "sha256": "87703051e0c7df449850f7a7c9db82e44f0b0b03fc85a035421ae906b3c40736"
        },
        {
          "time": 4.625,
          "caption": "18, 19, 20, 21: 19:n jälkeen tulee 20.",
          "sha256": "87703051e0c7df449850f7a7c9db82e44f0b0b03fc85a035421ae906b3c40736"
        },
        {
          "time": 4.75,
          "caption": "18, 19, 20, 21: 19:n jälkeen tulee 20.",
          "sha256": "87703051e0c7df449850f7a7c9db82e44f0b0b03fc85a035421ae906b3c40736"
        },
        {
          "time": 4.875,
          "caption": "18, 19, 20, 21: 19:n jälkeen tulee 20.",
          "sha256": "87703051e0c7df449850f7a7c9db82e44f0b0b03fc85a035421ae906b3c40736"
        },
        {
          "time": 5,
          "caption": "18, 19, 20, 21: 19:n jälkeen tulee 20.",
          "sha256": "87703051e0c7df449850f7a7c9db82e44f0b0b03fc85a035421ae906b3c40736"
        }
      ]
    }
  ]
}

## Authored mapping

{
  "small": "nextnumber lowrange",
  "teen": "9/10andteen boundary",
  "big": "19/20/29/30 withgivenprefix",
  "order": "Actualnewerbuild/seq family retained asoptionalcardconstruction, not stalecoverageonly",
  "transfer": "visiblemissingmiddleterm"
}

Actual order/build family and third demo are retained in inventory, unlike stale coverage. Counting aloud is optional support, not required response. Original equal-spaced cards and marker synchronize completed arrival, caption and numeric labels.

## Evidence and lifecycle

Finite supported sequence continuation/building, not proof of oral number-name fluency, whole0–100sequence, general addition, memory or independent physical hopping.

Both semanticinput/change and explicit current-visible-answer checks; model/help and truth-preserving rearrangement preserve separate valid verdicts. Pause freezes every owned control, reset preservespause, dispose removes owned listeners/RAF, remount single. No sharedstate, graph, game semantic-choice branch, formal process/rubric or personal mastery created.
