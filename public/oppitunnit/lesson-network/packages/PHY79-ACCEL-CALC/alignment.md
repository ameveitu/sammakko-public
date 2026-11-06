# PHY79-ACCEL-CALC — actualsource comparison

{
  "canonicalRole": "atomic",
  "requiredGroups": [
    {
      "all_of": [
        "PHY79-ACCEL-CONCEPT"
      ],
      "rationale": "Kaikki listatut ydinesitiedot tarvitaan."
    }
  ],
  "actualLiteGoal": "Opit laskemaan kiihtyvyyden: nopeuden muutos jaettuna ajalla, a = (v_loppu − v_alku) / t – myös jarrutuksessa, jolloin tulos on negatiivinen.",
  "demos": [
    "Vene kulkee aluksi 2 m/s ja kiihdyttää 3 sekuntia. Katso taulukkoa: nopeus kasvaa 2 → 4 → 6 → 8 m/s. Joka sekunti +2 m/s.",
    "Sama laskulla: nopeuden muutos on loppunopeus miinus alkunopeus, 8 − 2 = 6 m/s. Muutos tapahtui 3 sekunnissa, joten a = 6 m/s / 3 s = 2 m/s².",
    "Jarrutuksessa loppunopeus on pienempi kuin alkunopeus, joten muutos on negatiivinen: (0 − 12) m/s / 3 s = −4 m/s²."
  ],
  "families": {
    "moving": {
      "taskKind": "numeric",
      "registry": {
        "node": "PHY79-ACCEL-CALC",
        "tag": "moving",
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
    "build": {
      "taskKind": "place",
      "registry": {
        "node": "PHY79-ACCEL-CALC",
        "tag": "build",
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
    "rest": {
      "taskKind": "numeric",
      "registry": {
        "node": "PHY79-ACCEL-CALC",
        "tag": "rest",
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
      "taskKind": "numeric",
      "registry": {
        "node": "PHY79-ACCEL-CALC",
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
