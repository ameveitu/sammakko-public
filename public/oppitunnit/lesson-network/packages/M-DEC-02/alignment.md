# Actual Lite reconciliation — M-DEC-02

{
  "intro": "Helmiruudukossa on sata ruutua. Yksi ruutu on sadasosa.",
  "goal": "Opit sadasosat: kun kokonainen jaetaan sataan osaan, yksi osa on 0,01.",
  "goalOwn": true,
  "rev": "audit1-2026-10-28",
  "families": {
    "digit": {
      "phase": "guided",
      "seed": 0,
      "say": "Luvussa 0,13 mikä numero kertoo kymmenesosat?",
      "hint": "Ensimmäinen numero pilkun jälkeen on kymmenesosat, toinen sadasosat.",
      "explain": "Heti pilkun jälkeen tulevat kymmenesosat (1), sitten sadasosat (3).",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "1",
            "speak": "yksi"
          },
          {
            "big": "0",
            "speak": "nolla"
          },
          {
            "big": "3",
            "speak": "kolme"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "Tämä numero on ennen pilkkua: kokonaiset.",
          "Tämä on sadasosien paikalla, toinen pilkun jälkeen."
        ]
      },
      "sceneType": "undefined",
      "registry": {
        "node": "M-DEC-02",
        "tag": "digit",
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
    "equal": {
      "phase": "guided",
      "seed": 1,
      "say": "Valitse kaikki, jotka ovat yhtä paljon kuin 0,1.",
      "hint": "Yksi sarake on 0,1 ja siinä on 10 ruutua eli 10 sadasosaa.",
      "explain": "0,1 = 0,10 = 1 kymmenesosaa = 10 sadasosaa.",
      "task": {
        "kind": "multi",
        "options": [
          {
            "big": "1 sadasosaa"
          },
          {
            "big": "0,10"
          },
          {
            "big": "10 sadasosaa"
          },
          {
            "big": "1 kymmenesosaa"
          },
          {
            "big": "1"
          }
        ],
        "answer": [
          1,
          2,
          3
        ],
        "cols": 2,
        "why": [
          "1 sadasosaa = 0,01, kymmenen kertaa vähemmän.",
          "0,10: perään lisätty nolla ei muuta arvoa.",
          "1 saraketta = 10 ruutua = 10 sadasosaa.",
          "1 kymmenesosaa = 0,1.",
          "1 on 1 kokonaista, ei osa yhdestä."
        ]
      },
      "sceneType": "function",
      "registry": {
        "node": "M-DEC-02",
        "tag": "equal",
        "outcome": "valitsee kaikki oikeat vaihtoehdot eikä muita",
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
    "same": {
      "phase": "guided",
      "seed": 4,
      "say": "Montako sadasosaa on 0,3?",
      "hint": "Yksi sarake on kymmenen sadasosaa.",
      "explain": "0,3 = 0,30: 3 saraketta, joissa kussakin 10 ruutua, on 30 sadasosaa.",
      "task": {
        "kind": "numeric",
        "answer": 30
      },
      "sceneType": "function",
      "registry": {
        "node": "M-DEC-02",
        "tag": "same",
        "outcome": "kirjoittaa luvun",
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
    "grid": {
      "phase": "guided",
      "seed": 7,
      "say": "Mikä desimaaliluku kertoo väritetyn osan?",
      "hint": "Laske ensin täydet sarakkeet (kymmenesosat), sitten irtoruudut (sadasosat).",
      "explain": "1 täyttä saraketta ja 5 ruutua: 0,15.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "0,15"
          },
          {
            "big": "1,5"
          },
          {
            "big": "0,51"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "Ruudukko on jaettu sataan osaan, ei kymmeneen.",
          "Täydet sarakkeet ovat kymmenesosia, irtoruudut sadasosia."
        ]
      },
      "sceneType": "function",
      "registry": {
        "node": "M-DEC-02",
        "tag": "grid",
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
      "say": "Simpukkakoru maksaa 2 euroa 1 senttiä. Miten hinta kirjoitetaan euroina?",
      "hint": "Eurossa on sata senttiä. Yksi sentti on 0,01 €.",
      "explain": "Sentti on sadasosa eurosta: 1 senttiä = 0,01 €. Yhteensä 2,01 €.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "2,1 €"
          },
          {
            "big": "2,001 €"
          },
          {
            "big": "2,01 €"
          }
        ],
        "answer": 2,
        "why": [
          "Sentti on sadasosa eurosta. 5 senttiä on 0,05 €, ei 0,5 €.",
          "Sentti on sadasosa, ei tuhannesosa eurosta.",
          null
        ]
      },
      "sceneType": "undefined",
      "registry": {
        "node": "M-DEC-02",
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
      "say": "Ruudukossa on sata ruutua. Ensin väritetään kolme kokonaista saraketta: kolme kymmenesosaa. Sitten seitsemän yksittäistä ruutua: seitsemän sadasosaa. Yhteensä nolla pilkku kolme seitsemän.",
      "type": "function"
    },
    {
      "say": "Kolme saraketta on kolme kymmenesosaa. Kun ruudut näkyvät, niitä on kolmekymmentä: kolmekymmentä sadasosaa. Siksi nolla pilkku kolme on yhtä paljon kuin nolla pilkku kolme nolla.",
      "type": "function"
    }
  ],
  "sampled": 2048
}

Actual Lite grid/digit/equal/same plus eurotransfer, own goal/audit1. Old coverage omits equal and underreportsmulti outcome.

Source hundredsScene supports build/same. Its right readout and tiny9pxcolumnlabels are replaced by a stacked whole grid and readable labels. Partial-source columnfillreadouts need not be copied as learner evidence.

New partition animation leaves coloured area constant, revealing equal subdivisions of exactsamewhole. No shrinking/rescaled counterpart pretending unit conservation.

Construction count + decimal naming checked together, equivalent decimal forms accepted;0.3/0.30 samevalue notcompeting distractors.

Frozen role atomic; required groups [{"all_of": ["M-DEC-01"], "rationale": "v0.1:n required-esitiedot siirretty v0.2:ssa eksplisiittiseen AND-ryhmään."}]. No graph/game/state changes.

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
  "src/content/decimals.ts": "7ada1da383cb235ec320e4f4da2150c79ddb02fcd5334874a5c59fd05ae8c21e",
  "src/content/decanim.ts": "714c5d2eccee47d74d6ff7d67c04de3a5ccda3cc2b1551005396773d36af4d24",
  "src/content/parts.ts": "724aed2cf6df91996c55fdeafaa67b5cc3fc10b5ef68e47d4f4c968d4855efd5"
}
