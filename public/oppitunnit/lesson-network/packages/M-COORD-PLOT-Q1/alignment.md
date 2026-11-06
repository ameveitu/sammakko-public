# Actual Lite reconciliation — M-COORD-PLOT-Q1

{
  "intro": "Nyt sinä kätket aarteita. Merkitse kartalle tarkka paikka.",
  "goal": "Opit merkitsemään pisteen ruudukkoon, kun sen luvut annetaan.",
  "goalOwn": false,
  "rev": "audit1-2026-10-28",
  "families": {
    "onAxis": {
      "phase": "guided",
      "seed": 0,
      "say": "Merkitse palmu kohtaan (2, 0).",
      "hint": "Toinen luku on nolla: et nouse ollenkaan.",
      "explain": "Nolla ylös: piste on x-akselilla kohdassa 2.",
      "task": {
        "kind": "plot",
        "xs": [
          2
        ],
        "ys": [
          0
        ],
        "xMax": 6,
        "yMax": 6,
        "xMin": 0,
        "yMin": 0,
        "xStep": 1,
        "yStep": 1,
        "xLabel": "x",
        "yLabel": "y"
      },
      "sceneType": "undefined",
      "registry": {
        "node": "M-COORD-PLOT-Q1",
        "tag": "onAxis",
        "outcome": "piirtää pisteet kuvaajaan",
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
    "story": {
      "phase": "guided",
      "seed": 1,
      "say": "Kartan ohje: kulje nollasta 1 ruutua itään (oikealle) ja 4 ruutua pohjoiseen (ylös). Merkitse paikka.",
      "hint": "Itä on oikealla ja pohjoinen ylhäällä.",
      "explain": "Itään 1 ja pohjoiseen 4: kohta (1, 4).",
      "task": {
        "kind": "plot",
        "xs": [
          1
        ],
        "ys": [
          4
        ],
        "xMax": 6,
        "yMax": 6,
        "xMin": 0,
        "yMin": 0,
        "xStep": 1,
        "yStep": 1,
        "xLabel": "x",
        "yLabel": "y"
      },
      "sceneType": "undefined",
      "registry": {
        "node": "M-COORD-PLOT-Q1",
        "tag": "story",
        "outcome": "piirtää pisteet kuvaajaan",
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
    "fromShip": {
      "phase": "guided",
      "seed": 4,
      "say": "Laiva on kohdassa (1, 0). Aarre on laivasta 1 ruutua oikealle ja 2 ruutua ylös. Merkitse aarre.",
      "hint": "Lähde nyt laivasta, ei nollasta.",
      "explain": "x: 1 + 1 = 2, y: 0 + 2 = 2. Aarre on kohdassa (2, 2).",
      "task": {
        "kind": "plot",
        "xs": [
          2
        ],
        "ys": [
          2
        ],
        "xMax": 6,
        "yMax": 6,
        "xMin": 0,
        "yMin": 0,
        "xStep": 1,
        "yStep": 1,
        "xLabel": "x",
        "yLabel": "y"
      },
      "sceneType": "function",
      "registry": {
        "node": "M-COORD-PLOT-Q1",
        "tag": "fromShip",
        "outcome": "piirtää pisteet kuvaajaan",
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
    "plot": {
      "phase": "guided",
      "seed": 7,
      "say": "Merkitse aarre kohtaan (1, 6).",
      "hint": "Ensin 1 oikealle, sitten 6 ylös.",
      "explain": "(1, 6): 1 oikealle ja 6 ylös.",
      "task": {
        "kind": "plot",
        "xs": [
          1
        ],
        "ys": [
          6
        ],
        "xMax": 6,
        "yMax": 6,
        "xMin": 0,
        "yMin": 0,
        "xStep": 1,
        "yStep": 1,
        "xLabel": "x",
        "yLabel": "y"
      },
      "sceneType": "undefined",
      "registry": {
        "node": "M-COORD-PLOT-Q1",
        "tag": "plot",
        "outcome": "piirtää pisteet kuvaajaan",
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
      "say": "Kaksi aarretta: merkitse kohdat (2, 1) ja (1, 2).",
      "hint": "Merkitse yksi kohta kerrallaan: ensin oikealle, sitten ylös.",
      "explain": "(2, 1) ja (1, 2) ovat eri paikat: järjestys ratkaisee.",
      "task": {
        "kind": "plot",
        "xs": [
          2,
          1
        ],
        "ys": [
          1,
          2
        ],
        "xMax": 6,
        "yMax": 6,
        "xMin": 0,
        "yMin": 0,
        "xStep": 1,
        "yStep": 1,
        "xLabel": "x",
        "yLabel": "y"
      },
      "sceneType": "undefined",
      "registry": {
        "node": "M-COORD-PLOT-Q1",
        "tag": "transfer",
        "outcome": "piirtää pisteet kuvaajaan",
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
      "say": "Kohta (3, 5): lähde nollasta, kulje kolme oikealle ja sitten viisi ylös. Napauta siihen risteykseen.",
      "type": "function"
    },
    {
      "say": "Jos toinen luku on nolla, et nouse ollenkaan: piste jää akselille. Kohta (4, 0) on vaaka-akselilla.",
      "type": "function"
    },
    {
      "say": "Paikan voi kertoa myös toisesta paikasta käsin. Laivasta (1, 2) kolme oikealle ja kaksi ylös päästään kohtaan (4, 4).",
      "type": "function"
    }
  ],
  "sampled": 2048
}

Actual Lite families plot/onAxis/story/fromShip and two-point transfer; NodeSpecaudit1/globalfallbacklite181.

Coverage omits fromShip/third demo and reports old fallback revision.

Legacy plot checker usesSet, deduplicating responses; here required count,dense pairs,duplicates/extra guards and allpointorders accepted.

Original small grid ticklabels font11 are enlarged; native keyboard/directfields avoid requiring a smalltargettap. Zero axis/origin are boundary, not strictquadrantIinterior.

Frozen role atomic; required groups [{"all_of": ["M-GEO-02", "M-NUM-07"], "rationale": "v0.1:n required-esitiedot siirretty v0.2:ssa eksplisiittiseen AND-ryhmään."}]. No graph/game/state changes.

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
