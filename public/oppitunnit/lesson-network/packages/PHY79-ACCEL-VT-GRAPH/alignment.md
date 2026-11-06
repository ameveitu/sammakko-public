# PHY79-ACCEL-VT-GRAPH — lähteet ja rajaus

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
  "actualLiteGoal": "Opit lukemaan kiihtyvyyden nopeus–aika-kuvaajasta: viivan jyrkkyys = nopeuden muutos jaettuna ajalla. Nouseva viiva → a > 0, vaakasuora → a = 0, laskeva → a < 0.",
  "demos": [
    "Sammakko kiihdyttää tasaisesti. Mittari ja kynä näyttävät nopeuden joka hetki. Lopuksi piirretään kolmio: välillä 2–6 s nopeus kasvaa 8 m/s. a = 8 m/s / 4 s = 2 m/s².",
    "Nyt vaiheita on useampi: kiihdytys, tasainen vauhti, jarrutus ja taas tasainen vauhti. Seuraa, miten viivan suunta kertoo kiihtyvyyden merkin."
  ],
  "families": {
    "sign": {
      "taskKind": "choice",
      "registry": {
        "node": "PHY79-ACCEL-VT-GRAPH",
        "tag": "sign",
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
    "slopes": {
      "taskKind": "place",
      "registry": {
        "node": "PHY79-ACCEL-VT-GRAPH",
        "tag": "slopes",
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
    "steeper": {
      "taskKind": "choice",
      "registry": {
        "node": "PHY79-ACCEL-VT-GRAPH",
        "tag": "steeper",
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
    "read": {
      "taskKind": "numeric",
      "registry": {
        "node": "PHY79-ACCEL-VT-GRAPH",
        "tag": "read",
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
    "transfer": {
      "taskKind": "choice",
      "registry": {
        "node": "PHY79-ACCEL-VT-GRAPH",
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
