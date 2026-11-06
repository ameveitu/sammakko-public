# PHY79-VT-GRAPH — actualsource comparison

{
  "canonicalRole": "process",
  "requiredGroups": [
    {
      "all_of": [
        "PHY79-SPEED-CONCEPT",
        "PHY79-GRAPH-01"
      ],
      "rationale": "Kaikki listatut ydinesitiedot tarvitaan."
    }
  ],
  "actualLiteGoal": "Opit lukemaan nopeus–aika-kuvaajasta, kasvaako, pysyykö vai pieneneekö nopeus, ja mikä nopeus on tiettynä hetkenä.",
  "demos": [
    "Seuraa sammakkoa, nopeusmittaria ja kynää. Ensin nopeus kasvaa, sitten se pysyy samana ja lopuksi pienenee nollaan. Vihreät pisteet näyttävät, kuinka pitkälle sammakko pääsee joka sekunti.",
    "Tärkeä ansa: vaakasuora viiva ei tarkoita paikallaan oloa. Tässä nopeus pysyy 10 m/s, joten sammakko liikkuu tasaisesti koko ajan. Paikallaan ollessa viiva kulkisi nollan kohdalla."
  ],
  "families": {
    "decel": {
      "taskKind": "choice",
      "registry": {
        "node": "PHY79-VT-GRAPH",
        "tag": "decel",
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
    "phases": {
      "taskKind": "place",
      "registry": {
        "node": "PHY79-VT-GRAPH",
        "tag": "phases",
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
    "accel": {
      "taskKind": "choice",
      "registry": {
        "node": "PHY79-VT-GRAPH",
        "tag": "accel",
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
    "rest": {
      "taskKind": "choice",
      "registry": {
        "node": "PHY79-VT-GRAPH",
        "tag": "rest",
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
    "steady": {
      "taskKind": "choice",
      "registry": {
        "node": "PHY79-VT-GRAPH",
        "tag": "steady",
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
      "taskKind": "numeric",
      "registry": {
        "node": "PHY79-VT-GRAPH",
        "tag": "transfer",
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
    }
  },
  "motionOverlay": true
}

OlderCOVERAGE summaries are historical; actual story/phases/build andupdateddemos retained. Parent preflight corrects cumulativepath/direction ambiguity, mutually exclusive positive-steady versuszero-rest descriptions, anddifferent-time intervals. Sourcegrade/roles/groups preserved. No formalrubricmastery orlearnerhistory claim.
