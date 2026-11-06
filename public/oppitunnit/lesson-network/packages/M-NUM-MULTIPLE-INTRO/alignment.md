# M-NUM-MULTIPLE-INTRO — actual Lite reconciliation

{
  "goal": "Opit, mihin lukuihin päädyt, kun hyppäät nollasta aina saman verran.",
  "goalOrigin": "GOALS fallback in index.ts",
  "nodeRevision": "audit1-2026-10-28",
  "validRevisions": [
    "audit1-2026-10-28"
  ],
  "motionOverlay": false,
  "intro": "Loikka lähtee nollasta ja hyppää aina saman verran. Mihin kiviin se osuu?",
  "reward": "Tiedät, mihin Loikka osuu!",
  "families": {
    "nth": {
      "taskKind": "line",
      "seed": 1,
      "phase": "guided",
      "say": "Loikka hyppää nollasta kaksi kerrallaan. Napauta kivi, jolle hän osuu kolmannella hypyllä.",
      "hint": "Laske hypyt sormilla: ensimmäinen päättyy kivelle 2, toinen kivelle 4…",
      "explain": "2, 4, 6: 3. hyppy päättyy kivelle 6.",
      "task": {
        "kind": "line",
        "min": 0,
        "max": 10,
        "step": 1,
        "answer": 6,
        "labelEvery": 1,
        "whyAt": {
          "3": "3 on hyppyjen määrä. Jokainen hyppy on 2 pitkä.",
          "4": "Se on hyppy 2. Hyppää vielä kerran.",
          "8": "Se on jo hyppy 4: yksi liikaa."
        }
      },
      "registry": {
        "node": "M-NUM-MULTIPLE-INTRO",
        "tag": "nth",
        "outcome": "merkitsee kohdan lukusuoralle",
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
    "hits": {
      "taskKind": "choice",
      "seed": 4,
      "phase": "guided",
      "say": "Loikka hyppää nollasta kaksi kerrallaan. Osuuko hän kivelle 4?",
      "hint": "Laske 2 kerrallaan: 2, 4, 6…",
      "explain": "4 on hyppyjen 2, 4, … joukossa.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "text": "Kyllä"
          },
          {
            "text": "Ei"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "Osuu: 2, 4."
        ],
        "cols": 2
      },
      "registry": {
        "node": "M-NUM-MULTIPLE-INTRO",
        "tag": "hits",
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
    "k5": {
      "taskKind": "choice",
      "seed": 6,
      "phase": "guided",
      "say": "Loikka hyppää aina viisi kiveä kerrallaan nollasta. Mihin näistä se osuu?",
      "hint": "Laske hypyt: 5, 10, 15…",
      "explain": "Hypyt: 5, 10. Loikka osuu kiveen 10.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "9"
          },
          {
            "big": "10"
          },
          {
            "big": "12"
          }
        ],
        "answer": 1,
        "why": [
          "Hypyt menevät 5, 10, 15… Kivi 9 jää hyppyjen väliin.",
          null,
          "Hypyt menevät 5, 10, 15… Kivi 12 jää hyppyjen väliin."
        ]
      },
      "registry": {
        "node": "M-NUM-MULTIPLE-INTRO",
        "tag": "k5",
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
        "html": "<svg viewBox=\"0 0 320 100\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"10\" y1=\"70\" x2=\"310\" y2=\"70\" stroke=\"currentColor\" stroke-width=\"2\"/><line x1=\"10\" y1=\"64\" x2=\"10\" y2=\"76\" stroke=\"currentColor\"/><text x=\"10\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">0</text><line x1=\"25\" y1=\"64\" x2=\"25\" y2=\"76\" stroke=\"currentColor\"/><text x=\"25\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">1</text><line x1=\"40\" y1=\"64\" x2=\"40\" y2=\"76\" stroke=\"currentColor\"/><text x=\"40\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">2</text><line x1=\"55\" y1=\"64\" x2=\"55\" y2=\"76\" stroke=\"currentColor\"/><text x=\"55\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">3</text><line x1=\"70\" y1=\"64\" x2=\"70\" y2=\"76\" stroke=\"currentColor\"/><text x=\"70\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">4</text><line x1=\"85\" y1=\"64\" x2=\"85\" y2=\"76\" stroke=\"currentColor\"/><text x=\"85\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">5</text><line x1=\"100\" y1=\"64\" x2=\"100\" y2=\"76\" stroke=\"currentColor\"/><text x=\"100\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">6</text><line x1=\"115\" y1=\"64\" x2=\"115\" y2=\"76\" stroke=\"currentColor\"/><text x=\"115\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">7</text><line x1=\"130\" y1=\"64\" x2=\"130\" y2=\"76\" stroke=\"currentColor\"/><text x=\"130\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">8</text><line x1=\"145\" y1=\"64\" x2=\"145\" y2=\"76\" stroke=\"currentColor\"/><text x=\"145\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">9</text><line x1=\"160\" y1=\"64\" x2=\"160\" y2=\"76\" stroke=\"currentColor\"/><text x=\"160\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">10</text><line x1=\"175\" y1=\"64\" x2=\"175\" y2=\"76\" stroke=\"currentColor\"/><text x=\"175\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">11</text><line x1=\"190\" y1=\"64\" x2=\"190\" y2=\"76\" stroke=\"currentColor\"/><text x=\"190\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">12</text><line x1=\"205\" y1=\"64\" x2=\"205\" y2=\"76\" stroke=\"currentColor\"/><text x=\"205\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">13</text><line x1=\"220\" y1=\"64\" x2=\"220\" y2=\"76\" stroke=\"currentColor\"/><text x=\"220\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">14</text><line x1=\"235\" y1=\"64\" x2=\"235\" y2=\"76\" stroke=\"currentColor\"/><text x=\"235\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">15</text><line x1=\"250\" y1=\"64\" x2=\"250\" y2=\"76\" stroke=\"currentColor\"/><text x=\"250\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">16</text><line x1=\"265\" y1=\"64\" x2=\"265\" y2=\"76\" stroke=\"currentColor\"/><text x=\"265\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">17</text><line x1=\"280\" y1=\"64\" x2=\"280\" y2=\"76\" stroke=\"currentColor\"/><text x=\"280\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">18</text><line x1=\"295\" y1=\"64\" x2=\"295\" y2=\"76\" stroke=\"currentColor\"/><text x=\"295\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">19</text><line x1=\"310\" y1=\"64\" x2=\"310\" y2=\"76\" stroke=\"currentColor\"/><text x=\"310\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">20</text><path d=\"M10 66 Q47.5 28 85 66\" fill=\"none\" stroke=\"var(--pond)\" stroke-width=\"3\"/><path d=\"M85 66 Q122.5 28 160 66\" fill=\"none\" stroke=\"var(--pond)\" stroke-width=\"3\"/></svg>"
      }
    },
    "k2": {
      "taskKind": "choice",
      "seed": 7,
      "phase": "guided",
      "say": "Loikka hyppää aina kaksi kiveä kerrallaan nollasta. Mihin näistä se osuu?",
      "hint": "Laske hypyt: 2, 4, 6…",
      "explain": "Hypyt: 2, 4. Loikka osuu kiveen 4.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "5"
          },
          {
            "big": "4"
          },
          {
            "big": "3"
          }
        ],
        "answer": 1,
        "why": [
          "Hypyt menevät 2, 4, 6… Kivi 5 jää hyppyjen väliin.",
          null,
          "Hypyt menevät 2, 4, 6… Kivi 3 jää hyppyjen väliin."
        ]
      },
      "registry": {
        "node": "M-NUM-MULTIPLE-INTRO",
        "tag": "k2",
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
        "html": "<svg viewBox=\"0 0 320 100\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"10\" y1=\"70\" x2=\"310\" y2=\"70\" stroke=\"currentColor\" stroke-width=\"2\"/><line x1=\"10\" y1=\"64\" x2=\"10\" y2=\"76\" stroke=\"currentColor\"/><text x=\"10\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">0</text><line x1=\"35\" y1=\"64\" x2=\"35\" y2=\"76\" stroke=\"currentColor\"/><text x=\"35\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">1</text><line x1=\"60\" y1=\"64\" x2=\"60\" y2=\"76\" stroke=\"currentColor\"/><text x=\"60\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">2</text><line x1=\"85\" y1=\"64\" x2=\"85\" y2=\"76\" stroke=\"currentColor\"/><text x=\"85\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">3</text><line x1=\"110\" y1=\"64\" x2=\"110\" y2=\"76\" stroke=\"currentColor\"/><text x=\"110\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">4</text><line x1=\"135\" y1=\"64\" x2=\"135\" y2=\"76\" stroke=\"currentColor\"/><text x=\"135\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">5</text><line x1=\"160\" y1=\"64\" x2=\"160\" y2=\"76\" stroke=\"currentColor\"/><text x=\"160\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">6</text><line x1=\"185\" y1=\"64\" x2=\"185\" y2=\"76\" stroke=\"currentColor\"/><text x=\"185\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">7</text><line x1=\"210\" y1=\"64\" x2=\"210\" y2=\"76\" stroke=\"currentColor\"/><text x=\"210\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">8</text><line x1=\"235\" y1=\"64\" x2=\"235\" y2=\"76\" stroke=\"currentColor\"/><text x=\"235\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">9</text><line x1=\"260\" y1=\"64\" x2=\"260\" y2=\"76\" stroke=\"currentColor\"/><text x=\"260\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">10</text><line x1=\"285\" y1=\"64\" x2=\"285\" y2=\"76\" stroke=\"currentColor\"/><text x=\"285\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">11</text><line x1=\"310\" y1=\"64\" x2=\"310\" y2=\"76\" stroke=\"currentColor\"/><text x=\"310\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">12</text><path d=\"M10 66 Q35 40 60 66\" fill=\"none\" stroke=\"var(--pond)\" stroke-width=\"3\"/><path d=\"M60 66 Q85 40 110 66\" fill=\"none\" stroke=\"var(--pond)\" stroke-width=\"3\"/></svg>"
      }
    },
    "k3": {
      "taskKind": "choice",
      "seed": 12,
      "phase": "guided",
      "say": "Loikka hyppää aina kolme kiveä kerrallaan nollasta. Mihin näistä se osuu?",
      "hint": "Laske hypyt: 3, 6, 9…",
      "explain": "Hypyt: 3, 6. Loikka osuu kiveen 6.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "5"
          },
          {
            "big": "8"
          },
          {
            "big": "6"
          }
        ],
        "answer": 2,
        "why": [
          "Hypyt menevät 3, 6, 9… Kivi 5 jää hyppyjen väliin.",
          "Hypyt menevät 3, 6, 9… Kivi 8 jää hyppyjen väliin.",
          null
        ]
      },
      "registry": {
        "node": "M-NUM-MULTIPLE-INTRO",
        "tag": "k3",
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
        "html": "<svg viewBox=\"0 0 320 100\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"10\" y1=\"70\" x2=\"310\" y2=\"70\" stroke=\"currentColor\" stroke-width=\"2\"/><line x1=\"10\" y1=\"64\" x2=\"10\" y2=\"76\" stroke=\"currentColor\"/><text x=\"10\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">0</text><line x1=\"26.666666666666668\" y1=\"64\" x2=\"26.666666666666668\" y2=\"76\" stroke=\"currentColor\"/><text x=\"26.666666666666668\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">1</text><line x1=\"43.333333333333336\" y1=\"64\" x2=\"43.333333333333336\" y2=\"76\" stroke=\"currentColor\"/><text x=\"43.333333333333336\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">2</text><line x1=\"60\" y1=\"64\" x2=\"60\" y2=\"76\" stroke=\"currentColor\"/><text x=\"60\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">3</text><line x1=\"76.66666666666667\" y1=\"64\" x2=\"76.66666666666667\" y2=\"76\" stroke=\"currentColor\"/><text x=\"76.66666666666667\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">4</text><line x1=\"93.33333333333334\" y1=\"64\" x2=\"93.33333333333334\" y2=\"76\" stroke=\"currentColor\"/><text x=\"93.33333333333334\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">5</text><line x1=\"110\" y1=\"64\" x2=\"110\" y2=\"76\" stroke=\"currentColor\"/><text x=\"110\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">6</text><line x1=\"126.66666666666667\" y1=\"64\" x2=\"126.66666666666667\" y2=\"76\" stroke=\"currentColor\"/><text x=\"126.66666666666667\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">7</text><line x1=\"143.33333333333334\" y1=\"64\" x2=\"143.33333333333334\" y2=\"76\" stroke=\"currentColor\"/><text x=\"143.33333333333334\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">8</text><line x1=\"160\" y1=\"64\" x2=\"160\" y2=\"76\" stroke=\"currentColor\"/><text x=\"160\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">9</text><line x1=\"176.66666666666669\" y1=\"64\" x2=\"176.66666666666669\" y2=\"76\" stroke=\"currentColor\"/><text x=\"176.66666666666669\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">10</text><line x1=\"193.33333333333334\" y1=\"64\" x2=\"193.33333333333334\" y2=\"76\" stroke=\"currentColor\"/><text x=\"193.33333333333334\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">11</text><line x1=\"210\" y1=\"64\" x2=\"210\" y2=\"76\" stroke=\"currentColor\"/><text x=\"210\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">12</text><line x1=\"226.66666666666669\" y1=\"64\" x2=\"226.66666666666669\" y2=\"76\" stroke=\"currentColor\"/><text x=\"226.66666666666669\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">13</text><line x1=\"243.33333333333334\" y1=\"64\" x2=\"243.33333333333334\" y2=\"76\" stroke=\"currentColor\"/><text x=\"243.33333333333334\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">14</text><line x1=\"260\" y1=\"64\" x2=\"260\" y2=\"76\" stroke=\"currentColor\"/><text x=\"260\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">15</text><line x1=\"276.6666666666667\" y1=\"64\" x2=\"276.6666666666667\" y2=\"76\" stroke=\"currentColor\"/><text x=\"276.6666666666667\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">16</text><line x1=\"293.33333333333337\" y1=\"64\" x2=\"293.33333333333337\" y2=\"76\" stroke=\"currentColor\"/><text x=\"293.33333333333337\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">17</text><line x1=\"310\" y1=\"64\" x2=\"310\" y2=\"76\" stroke=\"currentColor\"/><text x=\"310\" y=\"94\" text-anchor=\"middle\" font-size=\"12\" fill=\"currentColor\">18</text><path d=\"M10 66 Q35 36 60 66\" fill=\"none\" stroke=\"var(--pond)\" stroke-width=\"3\"/><path d=\"M60 66 Q85 36 110 66\" fill=\"none\" stroke=\"var(--pond)\" stroke-width=\"3\"/></svg>"
      }
    },
    "transfer": {
      "taskKind": "multi",
      "seed": 1,
      "phase": "transfer",
      "say": "Loikka hyppää kolme kerrallaan nollasta. Valitse kaikki kivet, joihin se osuu.",
      "hint": "Aloita nollasta ja laske kolme kerrallaan.",
      "explain": "Loikka osuu kiviin 3, 6, 9, 12.",
      "task": {
        "kind": "multi",
        "options": [
          {
            "big": "1"
          },
          {
            "big": "2"
          },
          {
            "big": "3"
          },
          {
            "big": "4"
          },
          {
            "big": "5"
          },
          {
            "big": "6"
          },
          {
            "big": "7"
          },
          {
            "big": "8"
          },
          {
            "big": "9"
          },
          {
            "big": "10"
          },
          {
            "big": "11"
          },
          {
            "big": "12"
          }
        ],
        "answer": [
          2,
          5,
          8,
          11
        ],
        "cols": 4
      },
      "registry": {
        "node": "M-NUM-MULTIPLE-INTRO",
        "tag": "transfer",
        "outcome": "valitsee kaikki oikeat vaihtoehdot eikä muita",
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
      "say": "Loikka hyppää kolme kerrallaan: nollasta kolmeen, kolmesta kuuteen, kuudesta yhdeksään, yhdeksästä kahteentoista. Muihin kiviin hän ei osu.",
      "kind": "animation",
      "duration": 6.6,
      "width": 320,
      "height": 120,
      "label": "Loikka hyppää 4 kertaa eteenpäin luvusta 0",
      "snapshots": [
        {
          "time": 0,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "954bb46c6edb6de74fd0fa86aca707a9ca65c30696944d7facb29d34ae16090c"
        },
        {
          "time": 0.16499999999999998,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "954bb46c6edb6de74fd0fa86aca707a9ca65c30696944d7facb29d34ae16090c"
        },
        {
          "time": 0.32999999999999996,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "954bb46c6edb6de74fd0fa86aca707a9ca65c30696944d7facb29d34ae16090c"
        },
        {
          "time": 0.49499999999999994,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "954bb46c6edb6de74fd0fa86aca707a9ca65c30696944d7facb29d34ae16090c"
        },
        {
          "time": 0.6599999999999999,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "954bb46c6edb6de74fd0fa86aca707a9ca65c30696944d7facb29d34ae16090c"
        },
        {
          "time": 0.825,
          "caption": "0…",
          "sha256": "2ae6799ce6785de96603fd512ecb37a38995c784a73a76bdd65b70343fbcf9fd"
        },
        {
          "time": 0.9899999999999999,
          "caption": "0…",
          "sha256": "9b7fac4bea1b00a99c5da7d4c93e04c2317e501f35cec8f546bc8a4e5311aa4f"
        },
        {
          "time": 1.1549999999999998,
          "caption": "0…",
          "sha256": "2c6eaed8d49171631394a4fad704c03cc01738b9ca72c45e22742fe4cf124d80"
        },
        {
          "time": 1.3199999999999998,
          "caption": "0…",
          "sha256": "43f82eda4d9fb75e40e87afc843df31eb0c3ef597f5460d90ad577a0d6fdfe1c"
        },
        {
          "time": 1.4849999999999999,
          "caption": "0…",
          "sha256": "04e7812952c50319d497e1a9831a2cf829476006f5b0d3f26dc6f538154eb0a6"
        },
        {
          "time": 1.65,
          "caption": "0…",
          "sha256": "29ab66eaf08a777f52c1f1c6341aa83dfdd6b11a95c7ee488a5ade6139446b90"
        },
        {
          "time": 1.815,
          "caption": "0, 3…",
          "sha256": "c480ac1bc63c3d89a5c608535524fd54597491abeeb975d668fbca7b65c20663"
        },
        {
          "time": 1.9799999999999998,
          "caption": "0, 3…",
          "sha256": "703408814cc27755857ae9c3b04264d8738a85a968a6a7be9ee76e462d7e4fa6"
        },
        {
          "time": 2.145,
          "caption": "0, 3…",
          "sha256": "bc70a2fb0fc5f9e0b71661c3d066f8c16a1dcb18e3214f10f96f2fd2cb752e2d"
        },
        {
          "time": 2.3099999999999996,
          "caption": "0, 3…",
          "sha256": "2d990b0a2ff181732449b620e4a984768f5302d7db268f444930ff333f3a9f7b"
        },
        {
          "time": 2.475,
          "caption": "0, 3…",
          "sha256": "16b41d912185fd9ebdbd450b497bacc10f7287edd1dc8028a6df39440a36b3e6"
        },
        {
          "time": 2.6399999999999997,
          "caption": "0, 3…",
          "sha256": "8248a052fca65b9b25fddc92e814df989c0298f32ebd59fdf8cd547547081cdd"
        },
        {
          "time": 2.8049999999999997,
          "caption": "0, 3, 6…",
          "sha256": "6dc6687263ccd9003a0d4cd9abdb3b6840dbd6f99a7992cc53ca92e88fe8842b"
        },
        {
          "time": 2.9699999999999998,
          "caption": "0, 3, 6…",
          "sha256": "0b08db6bfe37f3654dddc481aa12e05204eb5a5feb679e2033d1de282ac0f062"
        },
        {
          "time": 3.135,
          "caption": "0, 3, 6…",
          "sha256": "5353665ef2bed2fc9eaf82c73f17db83f08979ae542b9e86e0c8a05429f17213"
        },
        {
          "time": 3.3,
          "caption": "0, 3, 6…",
          "sha256": "106b8f170fdb02a5317569ffcc7f5764c6f41d76c2f58dfad7cbbab2fb1b2552"
        },
        {
          "time": 3.465,
          "caption": "0, 3, 6…",
          "sha256": "1a3536857b120e619ffa8553cec2b15bc42bd3ada7ba09ba48e0630129d2e75c"
        },
        {
          "time": 3.63,
          "caption": "0, 3, 6…",
          "sha256": "0e31fbbc5ccfb6271f9ebf8d92fa8b052d23c1bbcf888d8123072599b9c8e2e8"
        },
        {
          "time": 3.7949999999999995,
          "caption": "0, 3, 6…",
          "sha256": "0e31fbbc5ccfb6271f9ebf8d92fa8b052d23c1bbcf888d8123072599b9c8e2e8"
        },
        {
          "time": 3.9599999999999995,
          "caption": "0, 3, 6, 9…",
          "sha256": "a26987f6c21573307d572c9359e4023d89e250ffaea35fccbf9a1045a4997c3b"
        },
        {
          "time": 4.125,
          "caption": "0, 3, 6, 9…",
          "sha256": "ecb2632cd02325e56278e328d14c0c1defd6f2867c28fd15bf06b267344930a7"
        },
        {
          "time": 4.29,
          "caption": "0, 3, 6, 9…",
          "sha256": "c4f7524411fad1e68c13a4b3868907df6b7ae8fac4e0155a3d9da5ed9bd34909"
        },
        {
          "time": 4.455,
          "caption": "0, 3, 6, 9…",
          "sha256": "2164d44bbfe38aebd3d5f155793a99a8c8eeef754a422255890d0f3357d5d532"
        },
        {
          "time": 4.619999999999999,
          "caption": "0, 3, 6, 9…",
          "sha256": "e286bf0b4baafb9f1fae9f3e473964384b6b2529834da035c28334cdfdab865a"
        },
        {
          "time": 4.784999999999999,
          "caption": "0, 3, 6, 9…",
          "sha256": "e286bf0b4baafb9f1fae9f3e473964384b6b2529834da035c28334cdfdab865a"
        },
        {
          "time": 4.95,
          "caption": "0, 3, 6, 9, 12. Neljä hyppyä, joka hypyllä 3: Loikka on luvussa 12.",
          "sha256": "9ce15fc9dd6280ecb290bd973d4901d7c72375a3ac72ae152e962e38a7e57db2"
        },
        {
          "time": 5.115,
          "caption": "0, 3, 6, 9, 12. Neljä hyppyä, joka hypyllä 3: Loikka on luvussa 12.",
          "sha256": "9ce15fc9dd6280ecb290bd973d4901d7c72375a3ac72ae152e962e38a7e57db2"
        },
        {
          "time": 5.279999999999999,
          "caption": "0, 3, 6, 9, 12. Neljä hyppyä, joka hypyllä 3: Loikka on luvussa 12.",
          "sha256": "9ce15fc9dd6280ecb290bd973d4901d7c72375a3ac72ae152e962e38a7e57db2"
        },
        {
          "time": 5.444999999999999,
          "caption": "0, 3, 6, 9, 12. Neljä hyppyä, joka hypyllä 3: Loikka on luvussa 12.",
          "sha256": "9ce15fc9dd6280ecb290bd973d4901d7c72375a3ac72ae152e962e38a7e57db2"
        },
        {
          "time": 5.609999999999999,
          "caption": "0, 3, 6, 9, 12. Neljä hyppyä, joka hypyllä 3: Loikka on luvussa 12.",
          "sha256": "9ce15fc9dd6280ecb290bd973d4901d7c72375a3ac72ae152e962e38a7e57db2"
        },
        {
          "time": 5.775,
          "caption": "0, 3, 6, 9, 12. Neljä hyppyä, joka hypyllä 3: Loikka on luvussa 12.",
          "sha256": "9ce15fc9dd6280ecb290bd973d4901d7c72375a3ac72ae152e962e38a7e57db2"
        },
        {
          "time": 5.9399999999999995,
          "caption": "0, 3, 6, 9, 12. Neljä hyppyä, joka hypyllä 3: Loikka on luvussa 12.",
          "sha256": "9ce15fc9dd6280ecb290bd973d4901d7c72375a3ac72ae152e962e38a7e57db2"
        },
        {
          "time": 6.1049999999999995,
          "caption": "0, 3, 6, 9, 12. Neljä hyppyä, joka hypyllä 3: Loikka on luvussa 12.",
          "sha256": "9ce15fc9dd6280ecb290bd973d4901d7c72375a3ac72ae152e962e38a7e57db2"
        },
        {
          "time": 6.27,
          "caption": "0, 3, 6, 9, 12. Neljä hyppyä, joka hypyllä 3: Loikka on luvussa 12.",
          "sha256": "9ce15fc9dd6280ecb290bd973d4901d7c72375a3ac72ae152e962e38a7e57db2"
        },
        {
          "time": 6.435,
          "caption": "0, 3, 6, 9, 12. Neljä hyppyä, joka hypyllä 3: Loikka on luvussa 12.",
          "sha256": "9ce15fc9dd6280ecb290bd973d4901d7c72375a3ac72ae152e962e38a7e57db2"
        },
        {
          "time": 6.6,
          "caption": "0, 3, 6, 9, 12. Neljä hyppyä, joka hypyllä 3: Loikka on luvussa 12.",
          "sha256": "9ce15fc9dd6280ecb290bd973d4901d7c72375a3ac72ae152e962e38a7e57db2"
        }
      ]
    },
    {
      "say": "Viisi kerrallaan: viisi, kymmenen, viisitoista, kaksikymmentä. Laske hypyt: neljännellä hypyllä Loikka on kivellä kaksikymmentä.",
      "kind": "animation",
      "duration": 6.6,
      "width": 320,
      "height": 120,
      "label": "Loikka hyppää 4 kertaa eteenpäin luvusta 0",
      "snapshots": [
        {
          "time": 0,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "57c161095883e2664cf40d07f28a678fad952aa037196c677d68c159fa454d80"
        },
        {
          "time": 0.16499999999999998,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "57c161095883e2664cf40d07f28a678fad952aa037196c677d68c159fa454d80"
        },
        {
          "time": 0.32999999999999996,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "57c161095883e2664cf40d07f28a678fad952aa037196c677d68c159fa454d80"
        },
        {
          "time": 0.49499999999999994,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "57c161095883e2664cf40d07f28a678fad952aa037196c677d68c159fa454d80"
        },
        {
          "time": 0.6599999999999999,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "57c161095883e2664cf40d07f28a678fad952aa037196c677d68c159fa454d80"
        },
        {
          "time": 0.825,
          "caption": "0…",
          "sha256": "c62545ef2b0910908be52276fd6da33dc40d03b6ea8015f138df3689fc862744"
        },
        {
          "time": 0.9899999999999999,
          "caption": "0…",
          "sha256": "cad2fe8d0b462b61d699db5ec5eaa484df7b9f179fa308a52a16a0565b6d5fe9"
        },
        {
          "time": 1.1549999999999998,
          "caption": "0…",
          "sha256": "29599a7a37fe7e2a4ecd035a7cff375fc55fd62a7730e0afd756fdf6080d784d"
        },
        {
          "time": 1.3199999999999998,
          "caption": "0…",
          "sha256": "f720876cbbb7c6e64aa55d08597870ac4ec3843d3e89b971d141fbf95e357c3c"
        },
        {
          "time": 1.4849999999999999,
          "caption": "0…",
          "sha256": "c122c330f6672c9b4b35651fe8e3d984f04b821f8387bc5a70a6b3253bce77c5"
        },
        {
          "time": 1.65,
          "caption": "0…",
          "sha256": "7947a10628756ba293f31434066891297fa88a6214c3369777c147a4fc4f2801"
        },
        {
          "time": 1.815,
          "caption": "0, 5…",
          "sha256": "2f61cfb5f6b63d818e1f8b3e2209ab53b7ba04ebb31ff7d281e133db815cb5c4"
        },
        {
          "time": 1.9799999999999998,
          "caption": "0, 5…",
          "sha256": "accd18d7b3ce570e24dd9c3f6dbf9243fd79cacf6609639b8a098e59a6b9698f"
        },
        {
          "time": 2.145,
          "caption": "0, 5…",
          "sha256": "3db801caa56c77904278ef872efb37a06dafa20d4820fcb7c12680a78f542fcd"
        },
        {
          "time": 2.3099999999999996,
          "caption": "0, 5…",
          "sha256": "21026eda5df053c0c3b6f8f9cf6bca96f32dd10b4823cf08967bb3329b1f3a97"
        },
        {
          "time": 2.475,
          "caption": "0, 5…",
          "sha256": "13b9b3b85c08433858c400c5bdbecdfd7e80818c5fdbb6c71c2d0680701b1988"
        },
        {
          "time": 2.6399999999999997,
          "caption": "0, 5…",
          "sha256": "a4998d1f38241dd47bd96e127d6af3093ed6d4f52fbf36e9be11b408864c077a"
        },
        {
          "time": 2.8049999999999997,
          "caption": "0, 5, 10…",
          "sha256": "4263dfd797514a674dbfe5068949263b54702da11b4f931ddd08dc93785b6ac2"
        },
        {
          "time": 2.9699999999999998,
          "caption": "0, 5, 10…",
          "sha256": "bda212c9092f47a966bc1a34a8881fbf20887e03776b4ff088c7a76d626f2d2b"
        },
        {
          "time": 3.135,
          "caption": "0, 5, 10…",
          "sha256": "a9d76683cae64df8ceb091a6f95b41b1374a3d60e8001913e86914f37bb766e4"
        },
        {
          "time": 3.3,
          "caption": "0, 5, 10…",
          "sha256": "fe29167b59c91ef3df5463586241f51041dd79b80df828ae689b7ac7766eb8d1"
        },
        {
          "time": 3.465,
          "caption": "0, 5, 10…",
          "sha256": "2d62d1fda0c99c91c8c7f09cf9284401c642674f486421dc96bcc59af5bf1325"
        },
        {
          "time": 3.63,
          "caption": "0, 5, 10…",
          "sha256": "1947e4c03f4488bfd809d279bfc68dd5f9bfde56a078d90fb6ebb7a31337293b"
        },
        {
          "time": 3.7949999999999995,
          "caption": "0, 5, 10…",
          "sha256": "1947e4c03f4488bfd809d279bfc68dd5f9bfde56a078d90fb6ebb7a31337293b"
        },
        {
          "time": 3.9599999999999995,
          "caption": "0, 5, 10, 15…",
          "sha256": "1fd91607a3e80ba3bde6daf22db2dc3f9bbc64c1b4f5e24655f684800482afbc"
        },
        {
          "time": 4.125,
          "caption": "0, 5, 10, 15…",
          "sha256": "2ff2eb58d8e9a96f7e46bdbcd8c0925911a81f0c52989152cc8616b21edd9fb5"
        },
        {
          "time": 4.29,
          "caption": "0, 5, 10, 15…",
          "sha256": "9294a098761c7222800db6c1f4eb033dc7e0fee471e1a18cf49ac83242abc5ed"
        },
        {
          "time": 4.455,
          "caption": "0, 5, 10, 15…",
          "sha256": "8d7c4759c956825c32376c7e4351f0a4f2286af613a4617dcbed750a775f5db1"
        },
        {
          "time": 4.619999999999999,
          "caption": "0, 5, 10, 15…",
          "sha256": "7d3718c489d4087f9284e2d596ff4c7660c0a7feda6cbb17313d4c1d5679088d"
        },
        {
          "time": 4.784999999999999,
          "caption": "0, 5, 10, 15…",
          "sha256": "7d3718c489d4087f9284e2d596ff4c7660c0a7feda6cbb17313d4c1d5679088d"
        },
        {
          "time": 4.95,
          "caption": "0, 5, 10, 15, 20. Neljä hyppyä, joka hypyllä 5: Loikka on luvussa 20.",
          "sha256": "ff074d6fa55c3d024652b5ae4feaba148e51fc549a4f40b06b5d868d100b4575"
        },
        {
          "time": 5.115,
          "caption": "0, 5, 10, 15, 20. Neljä hyppyä, joka hypyllä 5: Loikka on luvussa 20.",
          "sha256": "ff074d6fa55c3d024652b5ae4feaba148e51fc549a4f40b06b5d868d100b4575"
        },
        {
          "time": 5.279999999999999,
          "caption": "0, 5, 10, 15, 20. Neljä hyppyä, joka hypyllä 5: Loikka on luvussa 20.",
          "sha256": "ff074d6fa55c3d024652b5ae4feaba148e51fc549a4f40b06b5d868d100b4575"
        },
        {
          "time": 5.444999999999999,
          "caption": "0, 5, 10, 15, 20. Neljä hyppyä, joka hypyllä 5: Loikka on luvussa 20.",
          "sha256": "ff074d6fa55c3d024652b5ae4feaba148e51fc549a4f40b06b5d868d100b4575"
        },
        {
          "time": 5.609999999999999,
          "caption": "0, 5, 10, 15, 20. Neljä hyppyä, joka hypyllä 5: Loikka on luvussa 20.",
          "sha256": "ff074d6fa55c3d024652b5ae4feaba148e51fc549a4f40b06b5d868d100b4575"
        },
        {
          "time": 5.775,
          "caption": "0, 5, 10, 15, 20. Neljä hyppyä, joka hypyllä 5: Loikka on luvussa 20.",
          "sha256": "ff074d6fa55c3d024652b5ae4feaba148e51fc549a4f40b06b5d868d100b4575"
        },
        {
          "time": 5.9399999999999995,
          "caption": "0, 5, 10, 15, 20. Neljä hyppyä, joka hypyllä 5: Loikka on luvussa 20.",
          "sha256": "ff074d6fa55c3d024652b5ae4feaba148e51fc549a4f40b06b5d868d100b4575"
        },
        {
          "time": 6.1049999999999995,
          "caption": "0, 5, 10, 15, 20. Neljä hyppyä, joka hypyllä 5: Loikka on luvussa 20.",
          "sha256": "ff074d6fa55c3d024652b5ae4feaba148e51fc549a4f40b06b5d868d100b4575"
        },
        {
          "time": 6.27,
          "caption": "0, 5, 10, 15, 20. Neljä hyppyä, joka hypyllä 5: Loikka on luvussa 20.",
          "sha256": "ff074d6fa55c3d024652b5ae4feaba148e51fc549a4f40b06b5d868d100b4575"
        },
        {
          "time": 6.435,
          "caption": "0, 5, 10, 15, 20. Neljä hyppyä, joka hypyllä 5: Loikka on luvussa 20.",
          "sha256": "ff074d6fa55c3d024652b5ae4feaba148e51fc549a4f40b06b5d868d100b4575"
        },
        {
          "time": 6.6,
          "caption": "0, 5, 10, 15, 20. Neljä hyppyä, joka hypyllä 5: Loikka on luvussa 20.",
          "sha256": "ff074d6fa55c3d024652b5ae4feaba148e51fc549a4f40b06b5d868d100b4575"
        }
      ]
    }
  ]
}

## Authored interpretation

Only M-NUM-07 is required in the canonical graph; full AND group retained. No new prerequisite gate. Current audit1 NodeSpec and actual family branches supersede stale COVERAGE rows. Own typed/select/multiselect tasks retain the mathematical outcomes but do not claim the same pupil UI or oral fluency. Speaking, naming objects and help are optional. Native package is standalone and does not alter Lite.

Päätepisteen tai tuetun ryhmäkokonaismäärän löytäminen ei osoita kertotaulun ulkoa muistamista, kertolaskumerkin käyttöä tai itsenäistä ryhmittelystrategiaa. Mallit käyttävät positiivista askelta 2, 3 tai 5 ja enintään viittä askelta; lähtö ja nolla askelta näytetään erikseen.

[
  {
    "kind": "STALE_COVERAGE",
    "detail": "COVERAGE omits actual NUM08 hop, equalstep rule/extend and multiple nth/hits; actual NodeSpec rev audit1 is authority."
  },
  {
    "kind": "PROMPT_SUPPORT",
    "detail": "Saying number names or counting on fingers is optional, not a response gate."
  },
  {
    "kind": "MULTIPLE_SCENE_RANGE",
    "detail": "k5 item can ask25 while scene only shows0..20 and first2hops. Own diagrams contain every displayed target and explicitly label start0 as0jumps."
  },
  {
    "kind": "GEOMETRY",
    "detail": "Do not inherit equal-spaced cards as a metric numberline. Affine x(number) with equal unit tick distance; animation counts completed arrivals."
  }
]

Motion uses original affine numberline geometry and a neutral pointer, not a vector replacement mascot. Labels describe completed arrivals and explicitly identify in-flight motion. Multiple counting groups contain each equal unit once. Own model changing/help preserve practice verdict; dependent answer/task edits retire it. Explicit Check snapshots current visible response before task synchronization. No formal learner process/rubric or personal mastery.
