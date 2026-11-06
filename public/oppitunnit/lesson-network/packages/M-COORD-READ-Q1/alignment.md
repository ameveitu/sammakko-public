# Actual Lite reconciliation — M-COORD-READ-Q1

{
  "intro": "Vanhassa kartassa on ruudukko. Aarteen paikka kerrotaan kahdella luvulla.",
  "goal": "Opit lukemaan pisteen paikan ruudukosta kahdella luvulla.",
  "goalOwn": false,
  "rev": "audit1-2026-10-28",
  "families": {
    "whichPin": {
      "phase": "guided",
      "seed": 0,
      "say": "Mikä lippu on kohdassa (1, 2)?",
      "hint": "Kulje ensin 1 oikealle, sitten 2 ylös.",
      "explain": "Kohta (1, 2): 1 oikealle, 2 ylös. Siellä on lippu C.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "text": "A"
          },
          {
            "text": "B"
          },
          {
            "text": "C"
          }
        ],
        "answer": 2,
        "why": [
          "Tämä on kohta, jossa luvut ovat väärin päin.",
          "Tämä lippu on kohdassa (2, 1).",
          null
        ],
        "cols": 3
      },
      "sceneType": "function",
      "registry": {
        "node": "M-COORD-READ-Q1",
        "tag": "whichPin",
        "outcome": "valitsee oikean vaihtoehdon",
        "assumed": [],
        "supplied": [],
        "coTaught": [],
        "incidental": {},
        "support": [],
        "source": [
          "oletus"
        ]
      }
    },
    "axis": {
      "phase": "guided",
      "seed": 1,
      "say": "Missä palmu on? Se on akselin päällä.",
      "hint": "Palmu on vaaka-akselilla. Montako ylös?",
      "explain": "Palmu on 3 oikealla, mutta ei yhtään ylhäällä: (3, 0).",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "(3, 0)"
          },
          {
            "big": "(0, 3)"
          },
          {
            "big": "(3, 3)"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "Väärin päin: ensin x, sitten y.",
          "Toinen luku on nolla, koska palmu on akselilla."
        ]
      },
      "sceneType": "function",
      "registry": {
        "node": "M-COORD-READ-Q1",
        "tag": "axis",
        "outcome": "valitsee oikean vaihtoehdon",
        "assumed": [],
        "supplied": [],
        "coTaught": [],
        "incidental": {},
        "support": [],
        "source": [
          "oletus"
        ]
      }
    },
    "label": {
      "phase": "guided",
      "seed": 4,
      "say": "Kirjoita kartan merkit muistiin. Vie jokaiselle merkille oikea paikka. Yksi kortti jää yli.",
      "hint": "Yksi merkki kerrallaan: ensin oikealle, sitten ylös. Varo väärin päin olevaa korttia.",
      "explain": "A (1, 2), B (4, 1), C (6, 4). Kortti (4, 6) on väärin päin.",
      "task": {
        "kind": "place",
        "slots": [
          {
            "id": "A",
            "text": "A Lippu"
          },
          {
            "id": "B",
            "text": "B Rasti"
          },
          {
            "id": "C",
            "text": "C Palmu"
          }
        ],
        "tokens": [
          {
            "id": "1-2",
            "text": "(1, 2)"
          },
          {
            "id": "6-4",
            "text": "(6, 4)"
          },
          {
            "id": "4-1",
            "text": "(4, 1)"
          },
          {
            "id": "swap",
            "text": "(4, 6)"
          }
        ],
        "answer": {
          "A": "1-2",
          "B": "4-1",
          "C": "6-4"
        },
        "why": {
          "A": "Lippu A: 1 oikealle ja 2 ylös, eli (1, 2).",
          "B": "Rasti B: 4 oikealle ja 1 ylös, eli (4, 1).",
          "C": "Palmu C: 6 oikealle ja 4 ylös, eli (6, 4)."
        }
      },
      "sceneType": "function",
      "registry": {
        "node": "M-COORD-READ-Q1",
        "tag": "label",
        "outcome": "sijoittaa osat oikeille paikoille",
        "assumed": [],
        "supplied": [],
        "coTaught": [],
        "incidental": {},
        "support": [],
        "source": [
          "oletus"
        ]
      }
    },
    "read": {
      "phase": "guided",
      "seed": 7,
      "say": "Missä aarre on?",
      "hint": "Lähde nollasta. Laske ensin oikealle, sitten ylös.",
      "explain": "1 oikealle ja 5 ylös: (1, 5).",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "(1, 5)"
          },
          {
            "big": "(5, 1)"
          },
          {
            "big": "(1, 4)"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "Luvut ovat väärin päin. Ensin x (oikealle), sitten y (ylös).",
          "Tämä on ruudun liian alhaalla: laske ylös uudelleen."
        ]
      },
      "sceneType": "function",
      "registry": {
        "node": "M-COORD-READ-Q1",
        "tag": "read",
        "outcome": "valitsee oikean vaihtoehdon",
        "assumed": [],
        "supplied": [],
        "coTaught": [],
        "incidental": {},
        "support": [],
        "source": [
          "oletus"
        ]
      }
    },
    "transfer": {
      "phase": "transfer",
      "seed": 0,
      "say": "Laiva on kohdassa (1, 1). Se purjehtii 2 ruutua oikealle. Missä laiva on nyt?",
      "hint": "Oikealle mennessä muuttuu vain ensimmäinen luku.",
      "explain": "Oikealle muuttuu vain x: 1 + 2 = 3. Uusi paikka (3, 1).",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "(3, 1)"
          },
          {
            "big": "(3, 3)"
          },
          {
            "big": "(1, 3)"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "Laiva liikkui vain yhteen suuntaan.",
          "Oikealle muuttuu x, ei y."
        ]
      },
      "sceneType": "function",
      "registry": {
        "node": "M-COORD-READ-Q1",
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
      }
    }
  },
  "demos": [
    {
      "say": "Paikka luetaan aina samassa järjestyksessä: ensin x eli montako ruutua oikealle, sitten y eli montako ylös.",
      "type": "function"
    },
    {
      "say": "Aarre on kohdassa neljä oikealle ja kaksi ylös. Se kirjoitetaan (4, 2). Kohta (2, 4) olisi aivan eri paikka.",
      "type": "function"
    }
  ],
  "sampled": 2048
}

Actual Lite READ families read/whichPin/axis/label and transfer, own audit1; source goal supplied by goals.ts, default family outcomes and no target SIMS override.

Old coverage omits label and extra demo; actual registry samples2048 items before authoring.

Reading uses locating/projecting to axes, not only recognising a labelled option. Authored help traces from the point to the axes; this is drawing support, not negative physical travel or formal process evidence.

Lite ship transfer can reach y7 and mixes movement with reading; new given leiripaikka stays within0–6 and does not claim separate movement/cardmatching evidence.

No forced ABC/objectname response. Allzero axis/origin cases explicitly boundary;strictquadrantI hasx>0,y>0.

Frozen role process; required groups [{"all_of": ["M-GEO-02", "M-NUM-07"], "rationale": "v0.1:n required-esitiedot siirretty v0.2:ssa eksplisiittiseen AND-ryhmään."}]. No graph/game/state changes.

Exact source hashes
{
  "src/content/index.ts": "8f16c2b9948ae3652929092414c6694e6c9421a83e94052035d02dc3841896c8",
  "src/content/families.ts": "b221e08f8c6bad3d559aae20eac57fa9de7704d3541b6a49f142047fbbec1903",
  "src/content/goals.ts": "732d66480e4ac3efae1f1eba38e9bc844db6707725bec7c4721777d8598f2e7e",
  "src/content/kit.ts": "95a1ea48a8152caaca4a63c36a5d0a14e31a2bc51136e0535f320fec3da81bad",
  "src/content/audit-rev.ts": "78a9737d2dbb5eb3b8aaa01fad9875c64f98cb3048b89b30030cb46b4aea644f",
  "src/engine/types.ts": "1691c1ec54ee12823d8b8dce2dd0f798d8b9a5b704658460d06796dd508bd533",
  "src/engine/check.ts": "f5e2838356d5bb41b695855ce40914b964b95f98e3e2b11795859b684ecc9f8f",
  "audit/LESSON_AUDIT.md": "bc9979f2e5174f9c4039fbbd009d6d0cc341d59c451467e6d53c7e72299ee00b",
  "docs/PEDAGOGY_REFERENCES.md": "d18d901f2001a7c931ad72c55ce2921676234735bae83356b241d78841da4d1f",
  "COVERAGE.md": "49b94c0a19a6b5ab747aec95a95f5b45b4247be8ded226725ace6156bea18427",
  "src/content/saari1.ts": "0f0722dc20192b7414d481efe1b66251b3f8665baf07b107fb5be7872b0c0a25",
  "src/content/pics.ts": "799cfe129124e88a5f577575f5d6e56ad390ffac8cdb41ce790184b0657b6711"
}
