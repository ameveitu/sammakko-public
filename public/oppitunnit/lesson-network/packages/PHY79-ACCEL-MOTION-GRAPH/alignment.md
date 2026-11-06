# PHY79-ACCEL-MOTION-GRAPH — lähteet ja rajaus

{
  "canonicalRole": "process",
  "requiredGroups": [
    {
      "all_of": [
        "PHY79-ACCEL-CONCEPT"
      ],
      "rationale": "Kaikki listatut ydinesitiedot tarvitaan."
    }
  ],
  "actualLiteGoal": "Opit tunnistamaan matka–aika-kuvaajasta, kasvaako vai pieneneekö nopeus: jyrkkenevä kaari = nopeus kasvaa, loivenevä kaari = nopeus pienenee.",
  "demos": [
    "Kaksi sammakkoa. Tasa loikkii koko ajan samaa vauhtia, Kiito kiihdyttää. Radalle jää merkki joka sekunti: Tasan merkit ovat tasavälein, Kiidon merkit harvenevat.",
    "Nyt Hiipu hidastaa. Joka sekunti se ehtii lyhyemmän matkan, joten merkit tihenevät ja kuvaaja loivenee."
  ],
  "families": {
    "decel": {
      "taskKind": "choice",
      "registry": {
        "node": "PHY79-ACCEL-MOTION-GRAPH",
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
    "steps": {
      "taskKind": "sort",
      "registry": {
        "node": "PHY79-ACCEL-MOTION-GRAPH",
        "tag": "steps",
        "outcome": "lajittelee jokaisen kuvan oikeaan laatikkoon",
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
        "node": "PHY79-ACCEL-MOTION-GRAPH",
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
        "node": "PHY79-ACCEL-MOTION-GRAPH",
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
        "node": "PHY79-ACCEL-MOTION-GRAPH",
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
      "taskKind": "choice",
      "registry": {
        "node": "PHY79-ACCEL-MOTION-GRAPH",
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
  }
}

Oikea prosessirooli ja vain jäädytetyt vaaditut esitiedot säilyvät. Opetettava tulkinta ei muutu laskennan/formaalin rubriikin hallinnaksi. Omat alkuperäiset laskettavat kuvat; käyrää paikkaa ei esitetä virheellisesti suorana. Ajanhetki, aikaväli, nopeus, kiihtyvyys ja keskiarvo eroteltu. Lisäesimerkin jakolaskuun tarjotaan tuki, ei uutta kovaa esitietoporttia.
