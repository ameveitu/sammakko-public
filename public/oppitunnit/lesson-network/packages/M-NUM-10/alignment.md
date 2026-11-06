# M-NUM-10 — actual Lite reconciliation

{
  "canonical": {
    "id": "M-NUM-10",
    "subject": "mathematics",
    "grade_band": "1-2",
    "topic_area": "Luvut ja laskutoimitukset",
    "parent_concept": "Suuruus",
    "title": "Kahden luonnollisen luvun suuruuden vertaaminen",
    "short_description": "Kahden luonnollisen luvun suuruuden vertaaminen",
    "source_basis": "direct_curriculum",
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
      },
      {
        "id": "M-NUM-07",
        "relation_type": "prerequisite",
        "strength": "strong",
        "rationale": "M-NUM-07 tukee olennaisesti oppimista, mutta puute voidaan korjata noodin sisällä."
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
      "Suuruus"
    ]
  },
  "goal": "Opit päättelemään, kumpi kahdesta luvusta on suurempi.",
  "goalOrigin": "NodeSpec.goal",
  "nodeRevision": "audit1-2026-10-28",
  "validRevisions": [
    "audit1-2026-10-28"
  ],
  "globalFallback": "lite181-2026-10-27",
  "motionOverlay": false,
  "intro": "Kaislanippuja kerätään lauttaa varten. Kumpi kasa on suurempi?",
  "reward": "Osaat verrata lukuja: ensin kympit, sitten ykköset!",
  "families": {
    "symbol": {
      "taskKind": "choice",
      "seed": 1,
      "phase": "guided",
      "say": "Mikä merkki sopii ruutuun?",
      "hint": "Merkin kärki osoittaa pienempää lukua.",
      "explain": "5 < 98: kärki osoittaa pienempää lukua 5.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "="
          },
          {
            "big": ">"
          },
          {
            "big": "<"
          }
        ],
        "answer": 2,
        "why": [
          "5 ja 98 eivät ole yhtä suuret.",
          "Kärki osoittaa nyt suurempaa lukua. Kärjen pitää osoittaa pienempää.",
          null
        ]
      },
      "registry": {
        "node": "M-NUM-10",
        "tag": "symbol",
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
        "html": "<div class=\"formula\">5 □ 98</div>"
      }
    },
    "order": {
      "taskKind": "place",
      "seed": 4,
      "phase": "guided",
      "say": "Järjestä kaislakasat: pienin ensin, suurin viimeiseksi.",
      "hint": "Katso ensin kympit. Jos kympit ovat samat, katso ykköset.",
      "explain": "31 < 36 < 40. Kympit ensin, sitten ykköset.",
      "task": {
        "kind": "place",
        "slots": [
          {
            "id": "pienin",
            "text": "Pienin"
          },
          {
            "id": "keski",
            "text": "Keskimmäinen"
          },
          {
            "id": "suurin",
            "text": "Suurin"
          }
        ],
        "tokens": [
          {
            "id": "v31",
            "text": "31",
            "speak": "kolmekymmentäyksi"
          },
          {
            "id": "v36",
            "text": "36",
            "speak": "kolmekymmentäkuusi"
          },
          {
            "id": "v40",
            "text": "40",
            "speak": "neljäkymmentä"
          }
        ],
        "answer": {
          "pienin": "v31",
          "keski": "v36",
          "suurin": "v40"
        }
      },
      "registry": {
        "node": "M-NUM-10",
        "tag": "order",
        "outcome": "sijoittaa osat oikeille paikoille",
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
    "bigger": {
      "taskKind": "choice",
      "seed": 7,
      "phase": "guided",
      "say": "Kumpi luku on suurempi?",
      "hint": "Vertaa ensin kymppejä.",
      "explain": "97 on suurempi kuin 15. Verrataan ensin kymppejä, sitten ykkösiä.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "97",
            "speak": "yhdeksänkymmentäseitsemän"
          },
          {
            "big": "15",
            "speak": "viisitoista"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "Luvussa 15 on 1 kymppiä, luvussa 97 9. Kympit ratkaisevat."
        ],
        "cols": 2
      },
      "registry": {
        "node": "M-NUM-10",
        "tag": "bigger",
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
    "tens": {
      "taskKind": "choice",
      "seed": 12,
      "phase": "guided",
      "say": "Kumpi luku on suurempi?",
      "hint": null,
      "explain": "24 on suurempi: siinä on 2 kymppiä, luvussa 18 vain 1.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "18",
            "speak": "kahdeksantoista"
          },
          {
            "big": "24",
            "speak": "kaksikymmentäneljä"
          }
        ],
        "answer": 1,
        "why": [
          "Luvussa 18 on enemmän ykkösiä, mutta vähemmän kymppejä. Kympit ratkaisevat.",
          null
        ],
        "cols": 2
      },
      "registry": {
        "node": "M-NUM-10",
        "tag": "tens",
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
        "html": "<svg viewBox=\"0 0 200 106\" width=\"100%\" role=\"img\" aria-label=\"1 nippua ja 8 kaislaa\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"6\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"10.4\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"14.8\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"19.200000000000003\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"23.6\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"8\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"12.4\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"16.8\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"21.200000000000003\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"25.6\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"4\" y=\"50\" width=\"26\" height=\"9\" rx=\"3\" fill=\"var(--red)\"/><rect x=\"50\" y=\"10\" width=\"4\" height=\"88\" rx=\"2\" fill=\"#8fae5d\"/><ellipse cx=\"52\" cy=\"10\" rx=\"3\" ry=\"6\" fill=\"#8a5a33\"/><rect x=\"60\" y=\"10\" width=\"4\" height=\"88\" rx=\"2\" fill=\"#8fae5d\"/><ellipse cx=\"62\" cy=\"10\" rx=\"3\" ry=\"6\" fill=\"#8a5a33\"/><rect x=\"70\" y=\"10\" width=\"4\" height=\"88\" rx=\"2\" fill=\"#8fae5d\"/><ellipse cx=\"72\" cy=\"10\" rx=\"3\" ry=\"6\" fill=\"#8a5a33\"/><rect x=\"80\" y=\"10\" width=\"4\" height=\"88\" rx=\"2\" fill=\"#8fae5d\"/><ellipse cx=\"82\" cy=\"10\" rx=\"3\" ry=\"6\" fill=\"#8a5a33\"/><rect x=\"90\" y=\"10\" width=\"4\" height=\"88\" rx=\"2\" fill=\"#8fae5d\"/><ellipse cx=\"92\" cy=\"10\" rx=\"3\" ry=\"6\" fill=\"#8a5a33\"/><rect x=\"100\" y=\"10\" width=\"4\" height=\"88\" rx=\"2\" fill=\"#8fae5d\"/><ellipse cx=\"102\" cy=\"10\" rx=\"3\" ry=\"6\" fill=\"#8a5a33\"/><rect x=\"110\" y=\"10\" width=\"4\" height=\"88\" rx=\"2\" fill=\"#8fae5d\"/><ellipse cx=\"112\" cy=\"10\" rx=\"3\" ry=\"6\" fill=\"#8a5a33\"/><rect x=\"120\" y=\"10\" width=\"4\" height=\"88\" rx=\"2\" fill=\"#8fae5d\"/><ellipse cx=\"122\" cy=\"10\" rx=\"3\" ry=\"6\" fill=\"#8a5a33\"/></svg><svg viewBox=\"0 0 200 106\" width=\"100%\" role=\"img\" aria-label=\"2 nippua ja 4 kaislaa\" xmlns=\"http://www.w3.org/2000/svg\"><rect x=\"6\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"10.4\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"14.8\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"19.200000000000003\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"23.6\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"8\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"12.4\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"16.8\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"21.200000000000003\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"25.6\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"4\" y=\"50\" width=\"26\" height=\"9\" rx=\"3\" fill=\"var(--red)\"/><rect x=\"40\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"44.4\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"48.8\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"53.2\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"57.6\" y=\"10\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"42\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"46.4\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"50.8\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"55.2\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"59.6\" y=\"13\" width=\"3.4\" height=\"88\" rx=\"1.6\" fill=\"#8fae5d\"/><rect x=\"38\" y=\"50\" width=\"26\" height=\"9\" rx=\"3\" fill=\"var(--red)\"/><rect x=\"84\" y=\"10\" width=\"4\" height=\"88\" rx=\"2\" fill=\"#8fae5d\"/><ellipse cx=\"86\" cy=\"10\" rx=\"3\" ry=\"6\" fill=\"#8a5a33\"/><rect x=\"94\" y=\"10\" width=\"4\" height=\"88\" rx=\"2\" fill=\"#8fae5d\"/><ellipse cx=\"96\" cy=\"10\" rx=\"3\" ry=\"6\" fill=\"#8a5a33\"/><rect x=\"104\" y=\"10\" width=\"4\" height=\"88\" rx=\"2\" fill=\"#8fae5d\"/><ellipse cx=\"106\" cy=\"10\" rx=\"3\" ry=\"6\" fill=\"#8a5a33\"/><rect x=\"114\" y=\"10\" width=\"4\" height=\"88\" rx=\"2\" fill=\"#8fae5d\"/><ellipse cx=\"116\" cy=\"10\" rx=\"3\" ry=\"6\" fill=\"#8a5a33\"/></svg>"
      }
    },
    "transfer": {
      "taskKind": "choice",
      "seed": 1,
      "phase": "transfer",
      "say": "Loikalla on 33 kaislaa, Aavalla 24. Kummalla on enemmän?",
      "hint": "Vertaa ensin kymppejä, sitten ykkösiä.",
      "explain": "33 on suurempi kuin 24.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "text": "Loikalla"
          },
          {
            "text": "Aavalla"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "24 on pienempi kuin 33. Vertaa ensin kymppejä."
        ],
        "cols": 2
      },
      "registry": {
        "node": "M-NUM-10",
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
      "say": "Rakennetaan luvut 41 ja 38 nipuista. Kymppejä verrataan ensin: neljä nippua on enemmän kuin kolme. Ykkösiä ei tarvitse edes katsoa.",
      "kind": "animation",
      "duration": 4.6,
      "width": 320,
      "height": 190,
      "label": "Luvut 41 ja 38 kaislanippuina",
      "snapshots": [
        {
          "time": 0,
          "caption": "Ensin kympit…",
          "sha256": "f8759dd8c4944f70575c56ff4182b68ac57b4fdec33ae2a17d4a22ca95a78011"
        },
        {
          "time": 0.11499999999999999,
          "caption": "Ensin kympit…",
          "sha256": "f8759dd8c4944f70575c56ff4182b68ac57b4fdec33ae2a17d4a22ca95a78011"
        },
        {
          "time": 0.22999999999999998,
          "caption": "Ensin kympit…",
          "sha256": "f8759dd8c4944f70575c56ff4182b68ac57b4fdec33ae2a17d4a22ca95a78011"
        },
        {
          "time": 0.345,
          "caption": "Ensin kympit…",
          "sha256": "f8759dd8c4944f70575c56ff4182b68ac57b4fdec33ae2a17d4a22ca95a78011"
        },
        {
          "time": 0.45999999999999996,
          "caption": "Ensin kympit…",
          "sha256": "f8759dd8c4944f70575c56ff4182b68ac57b4fdec33ae2a17d4a22ca95a78011"
        },
        {
          "time": 0.575,
          "caption": "Ensin kympit…",
          "sha256": "f8759dd8c4944f70575c56ff4182b68ac57b4fdec33ae2a17d4a22ca95a78011"
        },
        {
          "time": 0.69,
          "caption": "Ensin kympit…",
          "sha256": "d48ea5a429fcfd8eeac242b5a871076b4fa7c9851359acb9862868710a0bb14b"
        },
        {
          "time": 0.8049999999999999,
          "caption": "Ensin kympit…",
          "sha256": "d48ea5a429fcfd8eeac242b5a871076b4fa7c9851359acb9862868710a0bb14b"
        },
        {
          "time": 0.9199999999999999,
          "caption": "Ensin kympit…",
          "sha256": "d48ea5a429fcfd8eeac242b5a871076b4fa7c9851359acb9862868710a0bb14b"
        },
        {
          "time": 1.035,
          "caption": "Ensin kympit…",
          "sha256": "d48ea5a429fcfd8eeac242b5a871076b4fa7c9851359acb9862868710a0bb14b"
        },
        {
          "time": 1.15,
          "caption": "Ensin kympit…",
          "sha256": "d48ea5a429fcfd8eeac242b5a871076b4fa7c9851359acb9862868710a0bb14b"
        },
        {
          "time": 1.265,
          "caption": "Ensin kympit…",
          "sha256": "d131a980eb584f5dbeda918db8ab555d5126461a2364f5135c811f9c91ec918e"
        },
        {
          "time": 1.38,
          "caption": "Ensin kympit…",
          "sha256": "d131a980eb584f5dbeda918db8ab555d5126461a2364f5135c811f9c91ec918e"
        },
        {
          "time": 1.4949999999999999,
          "caption": "Ensin kympit…",
          "sha256": "d131a980eb584f5dbeda918db8ab555d5126461a2364f5135c811f9c91ec918e"
        },
        {
          "time": 1.6099999999999999,
          "caption": "Ensin kympit…",
          "sha256": "d131a980eb584f5dbeda918db8ab555d5126461a2364f5135c811f9c91ec918e"
        },
        {
          "time": 1.725,
          "caption": "Ensin kympit…",
          "sha256": "d131a980eb584f5dbeda918db8ab555d5126461a2364f5135c811f9c91ec918e"
        },
        {
          "time": 1.8399999999999999,
          "caption": "Ensin kympit…",
          "sha256": "dfff282ef9f19fd58f2cc2b51cacaf94d7f6e4b525bc885739046784c879f531"
        },
        {
          "time": 1.9549999999999996,
          "caption": "Ensin kympit…",
          "sha256": "dfff282ef9f19fd58f2cc2b51cacaf94d7f6e4b525bc885739046784c879f531"
        },
        {
          "time": 2.07,
          "caption": "Ensin kympit…",
          "sha256": "dfff282ef9f19fd58f2cc2b51cacaf94d7f6e4b525bc885739046784c879f531"
        },
        {
          "time": 2.1849999999999996,
          "caption": "Ensin kympit…",
          "sha256": "dfff282ef9f19fd58f2cc2b51cacaf94d7f6e4b525bc885739046784c879f531"
        },
        {
          "time": 2.3,
          "caption": "Ensin kympit…",
          "sha256": "dfff282ef9f19fd58f2cc2b51cacaf94d7f6e4b525bc885739046784c879f531"
        },
        {
          "time": 2.415,
          "caption": "Ensin kympit…",
          "sha256": "401fc525b32e3a6e7291b1ce97cd1c1038d71906fe4e75f26a6ed5c734b06393"
        },
        {
          "time": 2.53,
          "caption": "Ensin kympit…",
          "sha256": "401fc525b32e3a6e7291b1ce97cd1c1038d71906fe4e75f26a6ed5c734b06393"
        },
        {
          "time": 2.645,
          "caption": "Ensin kympit…",
          "sha256": "401fc525b32e3a6e7291b1ce97cd1c1038d71906fe4e75f26a6ed5c734b06393"
        },
        {
          "time": 2.76,
          "caption": "Ensin kympit…",
          "sha256": "401fc525b32e3a6e7291b1ce97cd1c1038d71906fe4e75f26a6ed5c734b06393"
        },
        {
          "time": 2.8749999999999996,
          "caption": "Ensin kympit…",
          "sha256": "401fc525b32e3a6e7291b1ce97cd1c1038d71906fe4e75f26a6ed5c734b06393"
        },
        {
          "time": 2.9899999999999998,
          "caption": "Ensin kympit…",
          "sha256": "401fc525b32e3a6e7291b1ce97cd1c1038d71906fe4e75f26a6ed5c734b06393"
        },
        {
          "time": 3.1049999999999995,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "401fc525b32e3a6e7291b1ce97cd1c1038d71906fe4e75f26a6ed5c734b06393"
        },
        {
          "time": 3.2199999999999998,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "401fc525b32e3a6e7291b1ce97cd1c1038d71906fe4e75f26a6ed5c734b06393"
        },
        {
          "time": 3.3349999999999995,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "401fc525b32e3a6e7291b1ce97cd1c1038d71906fe4e75f26a6ed5c734b06393"
        },
        {
          "time": 3.45,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "5fe18241cd0f96903eea8034485aecd6a1820a322abface4a4bfad0b18fa81b8"
        },
        {
          "time": 3.565,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "5fe18241cd0f96903eea8034485aecd6a1820a322abface4a4bfad0b18fa81b8"
        },
        {
          "time": 3.6799999999999997,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "5fe18241cd0f96903eea8034485aecd6a1820a322abface4a4bfad0b18fa81b8"
        },
        {
          "time": 3.7949999999999995,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "5fe18241cd0f96903eea8034485aecd6a1820a322abface4a4bfad0b18fa81b8"
        },
        {
          "time": 3.9099999999999993,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "5fe18241cd0f96903eea8034485aecd6a1820a322abface4a4bfad0b18fa81b8"
        },
        {
          "time": 4.025,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "5fe18241cd0f96903eea8034485aecd6a1820a322abface4a4bfad0b18fa81b8"
        },
        {
          "time": 4.14,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "5fe18241cd0f96903eea8034485aecd6a1820a322abface4a4bfad0b18fa81b8"
        },
        {
          "time": 4.255,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "5fe18241cd0f96903eea8034485aecd6a1820a322abface4a4bfad0b18fa81b8"
        },
        {
          "time": 4.369999999999999,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "5fe18241cd0f96903eea8034485aecd6a1820a322abface4a4bfad0b18fa81b8"
        },
        {
          "time": 4.484999999999999,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "5fe18241cd0f96903eea8034485aecd6a1820a322abface4a4bfad0b18fa81b8"
        },
        {
          "time": 4.6,
          "caption": "Kymppejä: 4 ja 3. 41 on suurempi.",
          "sha256": "5fe18241cd0f96903eea8034485aecd6a1820a322abface4a4bfad0b18fa81b8"
        }
      ]
    },
    {
      "say": "Jos kymppejä on yhtä monta, ratkaisevat ykköset: 52 ja 57.",
      "kind": "animation",
      "duration": 8.32,
      "width": 320,
      "height": 190,
      "label": "Luvut 52 ja 57 kaislanippuina",
      "snapshots": [
        {
          "time": 0,
          "caption": "Ensin kympit…",
          "sha256": "a7c270d5b777884159d35ad90d074f12832b486c24264140901ca84326bab24e"
        },
        {
          "time": 0.20800000000000002,
          "caption": "Ensin kympit…",
          "sha256": "a7c270d5b777884159d35ad90d074f12832b486c24264140901ca84326bab24e"
        },
        {
          "time": 0.41600000000000004,
          "caption": "Ensin kympit…",
          "sha256": "a7c270d5b777884159d35ad90d074f12832b486c24264140901ca84326bab24e"
        },
        {
          "time": 0.624,
          "caption": "Ensin kympit…",
          "sha256": "3532e5ca404ef3f5afcf9078b78a2fb20afea55c3878da35fc4fe7f8ac166f19"
        },
        {
          "time": 0.8320000000000001,
          "caption": "Ensin kympit…",
          "sha256": "3532e5ca404ef3f5afcf9078b78a2fb20afea55c3878da35fc4fe7f8ac166f19"
        },
        {
          "time": 1.04,
          "caption": "Ensin kympit…",
          "sha256": "3532e5ca404ef3f5afcf9078b78a2fb20afea55c3878da35fc4fe7f8ac166f19"
        },
        {
          "time": 1.248,
          "caption": "Ensin kympit…",
          "sha256": "d40e724f464d125278cdfd4bca998d549be75aa10e5d8f1e22cda297173e3122"
        },
        {
          "time": 1.456,
          "caption": "Ensin kympit…",
          "sha256": "d40e724f464d125278cdfd4bca998d549be75aa10e5d8f1e22cda297173e3122"
        },
        {
          "time": 1.6640000000000001,
          "caption": "Ensin kympit…",
          "sha256": "d40e724f464d125278cdfd4bca998d549be75aa10e5d8f1e22cda297173e3122"
        },
        {
          "time": 1.8719999999999999,
          "caption": "Ensin kympit…",
          "sha256": "f73c8b0eb7729463372a1843c1dad7219cbb5945d718740ef132f1f3d9a5f00e"
        },
        {
          "time": 2.08,
          "caption": "Ensin kympit…",
          "sha256": "f73c8b0eb7729463372a1843c1dad7219cbb5945d718740ef132f1f3d9a5f00e"
        },
        {
          "time": 2.2880000000000003,
          "caption": "Ensin kympit…",
          "sha256": "f73c8b0eb7729463372a1843c1dad7219cbb5945d718740ef132f1f3d9a5f00e"
        },
        {
          "time": 2.496,
          "caption": "Ensin kympit…",
          "sha256": "7485fc277678669a7494a6b31899d82b21a9797d3390b252a16ec14bd4abf7cd"
        },
        {
          "time": 2.7039999999999997,
          "caption": "Ensin kympit…",
          "sha256": "7485fc277678669a7494a6b31899d82b21a9797d3390b252a16ec14bd4abf7cd"
        },
        {
          "time": 2.912,
          "caption": "Ensin kympit…",
          "sha256": "7485fc277678669a7494a6b31899d82b21a9797d3390b252a16ec14bd4abf7cd"
        },
        {
          "time": 3.12,
          "caption": "Ensin kympit…",
          "sha256": "6d2e8ca985897482fcdaa7d74c8e5676d79f409a5c0e2f06b9667617ac5480e5"
        },
        {
          "time": 3.3280000000000003,
          "caption": "Ensin kympit…",
          "sha256": "6d2e8ca985897482fcdaa7d74c8e5676d79f409a5c0e2f06b9667617ac5480e5"
        },
        {
          "time": 3.536,
          "caption": "Ensin kympit…",
          "sha256": "6d2e8ca985897482fcdaa7d74c8e5676d79f409a5c0e2f06b9667617ac5480e5"
        },
        {
          "time": 3.7439999999999998,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "6d2e8ca985897482fcdaa7d74c8e5676d79f409a5c0e2f06b9667617ac5480e5"
        },
        {
          "time": 3.9520000000000004,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "6d2e8ca985897482fcdaa7d74c8e5676d79f409a5c0e2f06b9667617ac5480e5"
        },
        {
          "time": 4.16,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "6d2e8ca985897482fcdaa7d74c8e5676d79f409a5c0e2f06b9667617ac5480e5"
        },
        {
          "time": 4.368,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "6d2e8ca985897482fcdaa7d74c8e5676d79f409a5c0e2f06b9667617ac5480e5"
        },
        {
          "time": 4.5760000000000005,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "601a8bcaf115abef9d30aef5848e12665a71e85480fb3e67b8e938142263feaf"
        },
        {
          "time": 4.784000000000001,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "2568be724a942ee5111f616d2666c515185ae1fa40618d5e11ffed37f20160ff"
        },
        {
          "time": 4.992,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "2568be724a942ee5111f616d2666c515185ae1fa40618d5e11ffed37f20160ff"
        },
        {
          "time": 5.2,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "7e1c30b645d9c88489903bd019db7b6f2b30b08ecf69facd33b5d52851b53f64"
        },
        {
          "time": 5.4079999999999995,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "7e1c30b645d9c88489903bd019db7b6f2b30b08ecf69facd33b5d52851b53f64"
        },
        {
          "time": 5.6160000000000005,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "f954093c334a44a1bb6e396de82b06a7b9bc5e2662666325377263a8855c6b7a"
        },
        {
          "time": 5.824,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "f954093c334a44a1bb6e396de82b06a7b9bc5e2662666325377263a8855c6b7a"
        },
        {
          "time": 6.032,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "3e789dfa34ac7ecc2fa1eb6dbef346745287ba1c95c387d9910dbd8afc1f945a"
        },
        {
          "time": 6.24,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "f1be23d7892a68af89971ab7627e81f45e164654747f5f96be18085405e956bc"
        },
        {
          "time": 6.448,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "f1be23d7892a68af89971ab7627e81f45e164654747f5f96be18085405e956bc"
        },
        {
          "time": 6.656000000000001,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "0a3a36e54bac154126e8a920f4b28193e6fb9268d8c419551b5c2a16bbe86d4b"
        },
        {
          "time": 6.864,
          "caption": "Kymppejä on yhtä monta. Sitten ykköset…",
          "sha256": "0a3a36e54bac154126e8a920f4b28193e6fb9268d8c419551b5c2a16bbe86d4b"
        },
        {
          "time": 7.072,
          "caption": "Ykkösiä: 2 ja 7. 57 on suurempi.",
          "sha256": "0a3a36e54bac154126e8a920f4b28193e6fb9268d8c419551b5c2a16bbe86d4b"
        },
        {
          "time": 7.279999999999999,
          "caption": "Ykkösiä: 2 ja 7. 57 on suurempi.",
          "sha256": "917d48e82a3dfe80bdde868c4799d04d6d5605b97e4bee46119ba17de3a6060e"
        },
        {
          "time": 7.4879999999999995,
          "caption": "Ykkösiä: 2 ja 7. 57 on suurempi.",
          "sha256": "917d48e82a3dfe80bdde868c4799d04d6d5605b97e4bee46119ba17de3a6060e"
        },
        {
          "time": 7.696000000000001,
          "caption": "Ykkösiä: 2 ja 7. 57 on suurempi.",
          "sha256": "917d48e82a3dfe80bdde868c4799d04d6d5605b97e4bee46119ba17de3a6060e"
        },
        {
          "time": 7.904000000000001,
          "caption": "Ykkösiä: 2 ja 7. 57 on suurempi.",
          "sha256": "917d48e82a3dfe80bdde868c4799d04d6d5605b97e4bee46119ba17de3a6060e"
        },
        {
          "time": 8.112,
          "caption": "Ykkösiä: 2 ja 7. 57 on suurempi.",
          "sha256": "917d48e82a3dfe80bdde868c4799d04d6d5605b97e4bee46119ba17de3a6060e"
        },
        {
          "time": 8.32,
          "caption": "Ykkösiä: 2 ja 7. 57 on suurempi.",
          "sha256": "917d48e82a3dfe80bdde868c4799d04d6d5605b97e4bee46119ba17de3a6060e"
        }
      ]
    },
    {
      "say": "Merkki osoittaa kärjellä pienempää ja avautuu suurempaa kohti: 41 > 38.",
      "kind": "static",
      "html": "<div class=\"formula\">41 > 38</div>"
    }
  ]
}

## Authored mapping

{
  "bigger": "correctgreaternumber withvisiblepremises",
  "tens": "documentco-taughtplacevalue, donotassumefrozengraphhasMPLACE prerequisite",
  "symbol": "optionalmeaningfirst < > =; no KC-specificgamebranch",
  "order": "Actualnewerplace family acknowledged; optionalconstructive3cardordering",
  "transfer": "character/collectionmappingexplicit"
}

Actual newer order/place family retained. Own direct comparison includes equality/zero and all given units. Canonical requires onlyM-NUM-03; M-NUM-07 staysstrong. Optional tens/ones model is explained in place, not promoted to requiredM-PLACE-02. Lite bigger seed17809 can generate100 despite its two-digit setup; own fixed cases/numberdomain staybounded. Latent tensRace(22,22) incorrectly crowns one side and says22isgreater; own ties never name a winner. Source tensRace uses stylized6-reed bundles; owned countable frames contain exactly10 equalunits. No Lite/game edits.

## Evidence and lifecycle

Supportedcomparisonandoptionalordering only. No observedstrategy, oralreading, physicalmatching, generalplacevalue orpersonalformalmastery inference.

Both semanticinput/change and explicit current-visible-answer checks; model/help and truth-preserving rearrangement preserve separate valid verdicts. Pause freezes every owned control, reset preservespause, dispose removes owned listeners/RAF, remount single. No sharedstate, graph, game semantic-choice branch, formal process/rubric or personal mastery created.
