# M-NUM-08 — actual Lite reconciliation

{
  "goal": "Opit jatkamaan lukujonoa taaksepäin.",
  "goalOrigin": "NodeSpec.goal",
  "nodeRevision": "audit1-2026-10-28",
  "validRevisions": [
    "audit1-2026-10-28"
  ],
  "motionOverlay": false,
  "intro": "Loikka hyppää numerokiviä takaisin rantaan päin: luvut pienenevät yksi kerrallaan.",
  "reward": "Loikka pääsi takaperin takaisin rantaan!",
  "families": {
    "before": {
      "taskKind": "choice",
      "seed": 1,
      "phase": "guided",
      "say": "Mikä luku on juuri ennen lukua 3?",
      "hint": "Laske taaksepäin luvusta 3 yksi askel.",
      "explain": "Ennen lukua 3 tulee 2, joka on yhtä pienempi.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "2",
            "speak": "kaksi"
          },
          {
            "big": "1",
            "speak": "yksi"
          },
          {
            "big": "4",
            "speak": "neljä"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "1 on kaksi pienempi. Juuri ennen tarkoittaa yhtä pienempää.",
          "Se tulee luvun jälkeen."
        ]
      },
      "registry": {
        "node": "M-NUM-08",
        "tag": "before",
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
    "gap": {
      "taskKind": "choice",
      "seed": 4,
      "phase": "guided",
      "say": "Mikä luku puuttuu taaksepäin menevästä jonosta?",
      "hint": "Lue jono ääneen alusta: mikä luku jää väliin?",
      "explain": "15, 14, 13, 12.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "16",
            "speak": "kuusitoista"
          },
          {
            "big": "11",
            "speak": "yksitoista"
          },
          {
            "big": "14",
            "speak": "neljätoista"
          }
        ],
        "answer": 2,
        "why": [
          "Jono pienenee: puuttuva on pienempi kuin 15.",
          "11 tulisi vasta jonon lopussa.",
          null
        ]
      },
      "registry": {
        "node": "M-NUM-08",
        "tag": "gap",
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
        "html": "<svg viewBox=\"0 0 274 90\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"38\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"38\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">15</text><ellipse cx=\"104\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"var(--sun)\"/><text x=\"104\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#3a2c00\">?</text><ellipse cx=\"170\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"170\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">13</text><ellipse cx=\"236\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"236\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">12</text><g>\n    <ellipse cx=\"38\" cy=\"27.15\" rx=\"13.65\" ry=\"7.15\" fill=\"#3e9b54\"/>\n    <ellipse cx=\"38\" cy=\"21.3\" rx=\"13\" ry=\"8.06\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"44.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"44.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"32.019999999999996\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"45.02\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"29.939999999999998\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <circle cx=\"46.06\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <path d=\"M32.15 21.95 Q38 27.15 43.85 21.95\" stroke=\"#1f4d2b\" stroke-width=\"1.04\" fill=\"none\" stroke-linecap=\"round\"/>\n  </g></svg>"
      }
    },
    "next": {
      "taskKind": "choice",
      "seed": 7,
      "phase": "guided",
      "say": "Mikä luku tulee seuraavaksi, kun lasketaan taaksepäin?",
      "hint": null,
      "explain": "7, 6, 5, 4: joka kerta yksi vähemmän.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "4",
            "speak": "neljä"
          },
          {
            "big": "6",
            "speak": "kuusi"
          },
          {
            "big": "8",
            "speak": "kahdeksan"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "Se luku on jo jonossa.",
          "Jono pienenee, ei kasva."
        ]
      },
      "registry": {
        "node": "M-NUM-08",
        "tag": "next",
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
        "html": "<svg viewBox=\"0 0 274 90\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"38\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"38\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">7</text><ellipse cx=\"104\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"104\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">6</text><ellipse cx=\"170\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"170\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">5</text><ellipse cx=\"236\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"var(--sun)\"/><text x=\"236\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#3a2c00\">?</text><g>\n    <ellipse cx=\"38\" cy=\"27.15\" rx=\"13.65\" ry=\"7.15\" fill=\"#3e9b54\"/>\n    <ellipse cx=\"38\" cy=\"21.3\" rx=\"13\" ry=\"8.06\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"44.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"44.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"32.019999999999996\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"45.02\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"29.939999999999998\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <circle cx=\"46.06\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <path d=\"M32.15 21.95 Q38 27.15 43.85 21.95\" stroke=\"#1f4d2b\" stroke-width=\"1.04\" fill=\"none\" stroke-linecap=\"round\"/>\n  </g></svg>"
      }
    },
    "hop": {
      "taskKind": "line",
      "seed": 12,
      "phase": "guided",
      "say": "Loikka on luvussa 7 ja hyppää kolme kertaa yhden taaksepäin. Napauta, mihin hän päätyy.",
      "hint": "Sano jokaisesta hypystä luku: 6, …",
      "explain": "7, 6, 5, 4: 3 hyppyä taaksepäin.",
      "task": {
        "kind": "line",
        "min": 0,
        "max": 10,
        "step": 1,
        "answer": 4,
        "whyAt": {
          "5": "Lähtöluku 7 ei ole hyppy. Ensimmäinen hyppy vie lukuun 6.",
          "7": "Loikka ei vielä hypännyt.",
          "10": "Taaksepäin luvut pienenevät: hyppää vasemmalle."
        }
      },
      "registry": {
        "node": "M-NUM-08",
        "tag": "hop",
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
        "kind": "static",
        "html": "<svg viewBox=\"0 0 330 104\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"8\" y1=\"70\" x2=\"322\" y2=\"70\" stroke=\"currentColor\" stroke-width=\"2.5\"/><path d=\"M326 70l-8 -5v10z\" fill=\"currentColor\"/><line x1=\"16\" y1=\"61\" x2=\"16\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"3\"/><text x=\"16\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"800\" fill=\"currentColor\">0</text><line x1=\"45.8\" y1=\"61\" x2=\"45.8\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"45.8\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">1</text><line x1=\"75.6\" y1=\"61\" x2=\"75.6\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"75.6\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">2</text><line x1=\"105.39999999999999\" y1=\"61\" x2=\"105.39999999999999\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"105.39999999999999\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">3</text><line x1=\"135.2\" y1=\"61\" x2=\"135.2\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"135.2\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">4</text><line x1=\"165\" y1=\"61\" x2=\"165\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"165\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">5</text><line x1=\"194.79999999999998\" y1=\"61\" x2=\"194.79999999999998\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"194.79999999999998\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">6</text><line x1=\"224.6\" y1=\"61\" x2=\"224.6\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"224.6\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">7</text><line x1=\"254.4\" y1=\"61\" x2=\"254.4\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"254.4\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">8</text><line x1=\"284.2\" y1=\"61\" x2=\"284.2\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"284.2\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">9</text><line x1=\"314\" y1=\"61\" x2=\"314\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"314\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">10</text><circle cx=\"224.6\" cy=\"56\" r=\"9\" fill=\"#5cbf6c\"/><circle cx=\"220.6\" cy=\"50\" r=\"3\" fill=\"#fff\"/><circle cx=\"228.6\" cy=\"50\" r=\"3\" fill=\"#fff\"/></svg>"
      }
    },
    "transfer": {
      "taskKind": "line",
      "seed": 1,
      "phase": "transfer",
      "say": "Loikka on kivellä 15. Hän hyppää kolme kertaa yhden kiven taaksepäin. Mihin hän päätyy? Napauta lukusuoralta.",
      "hint": "Laske hypyt sormilla ja sano jokaisen kiven numero.",
      "explain": "15, 14, 13, 12. Loikka on kivellä 12.",
      "task": {
        "kind": "line",
        "min": 0,
        "max": 20,
        "step": 1,
        "answer": 12,
        "labelEvery": 5,
        "whyAt": {
          "13": "Lähtökivi 15 ei ole hyppy. Ensimmäinen hyppy vie kivelle 14.",
          "18": "Taaksepäin luvut pienenevät: vasemmalle."
        }
      },
      "registry": {
        "node": "M-NUM-08",
        "tag": "transfer",
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
        "kind": "static",
        "html": "<svg viewBox=\"0 0 330 104\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"8\" y1=\"70\" x2=\"322\" y2=\"70\" stroke=\"currentColor\" stroke-width=\"2.5\"/><path d=\"M326 70l-8 -5v10z\" fill=\"currentColor\"/><line x1=\"16\" y1=\"61\" x2=\"16\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"3\"/><text x=\"16\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"800\" fill=\"currentColor\">0</text><line x1=\"30.9\" y1=\"65\" x2=\"30.9\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"45.8\" y1=\"65\" x2=\"45.8\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"60.699999999999996\" y1=\"65\" x2=\"60.699999999999996\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"75.6\" y1=\"65\" x2=\"75.6\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"90.5\" y1=\"61\" x2=\"90.5\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"90.5\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">5</text><line x1=\"105.39999999999999\" y1=\"65\" x2=\"105.39999999999999\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"120.3\" y1=\"65\" x2=\"120.3\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"135.2\" y1=\"65\" x2=\"135.2\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"150.1\" y1=\"65\" x2=\"150.1\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"165\" y1=\"61\" x2=\"165\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"165\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">10</text><line x1=\"179.9\" y1=\"65\" x2=\"179.9\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"194.79999999999998\" y1=\"65\" x2=\"194.79999999999998\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"209.70000000000002\" y1=\"65\" x2=\"209.70000000000002\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"224.6\" y1=\"65\" x2=\"224.6\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"239.5\" y1=\"61\" x2=\"239.5\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"239.5\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">15</text><line x1=\"254.4\" y1=\"65\" x2=\"254.4\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"269.29999999999995\" y1=\"65\" x2=\"269.29999999999995\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"284.2\" y1=\"65\" x2=\"284.2\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"299.09999999999997\" y1=\"65\" x2=\"299.09999999999997\" y2=\"75\" stroke=\"currentColor\" stroke-width=\"1.8\"/><line x1=\"314\" y1=\"61\" x2=\"314\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"314\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">20</text><circle cx=\"239.5\" cy=\"56\" r=\"9\" fill=\"#5cbf6c\"/><circle cx=\"235.5\" cy=\"50\" r=\"3\" fill=\"#fff\"/><circle cx=\"243.5\" cy=\"50\" r=\"3\" fill=\"#fff\"/></svg>"
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
      "say": "Eteenpäin luvut kasvavat. Taaksepäin ne pienenevät: joka hypyllä yksi vähemmän. Kahdeksan, seitsemän, kuusi, viisi.",
      "kind": "animation",
      "duration": 5.6,
      "width": 320,
      "height": 120,
      "label": "Loikka hyppää 3 kertaa taaksepäin luvusta 8",
      "snapshots": [
        {
          "time": 0,
          "caption": "Loikka on luvussa 8. Hän hyppää kolme kertaa taaksepäin.",
          "sha256": "544750e2b1ec865878e48b41ae6ef9b3af2a7cf80626482749584cc8604df8b4"
        },
        {
          "time": 0.13999999999999999,
          "caption": "Loikka on luvussa 8. Hän hyppää kolme kertaa taaksepäin.",
          "sha256": "544750e2b1ec865878e48b41ae6ef9b3af2a7cf80626482749584cc8604df8b4"
        },
        {
          "time": 0.27999999999999997,
          "caption": "Loikka on luvussa 8. Hän hyppää kolme kertaa taaksepäin.",
          "sha256": "544750e2b1ec865878e48b41ae6ef9b3af2a7cf80626482749584cc8604df8b4"
        },
        {
          "time": 0.41999999999999993,
          "caption": "Loikka on luvussa 8. Hän hyppää kolme kertaa taaksepäin.",
          "sha256": "544750e2b1ec865878e48b41ae6ef9b3af2a7cf80626482749584cc8604df8b4"
        },
        {
          "time": 0.5599999999999999,
          "caption": "Loikka on luvussa 8. Hän hyppää kolme kertaa taaksepäin.",
          "sha256": "544750e2b1ec865878e48b41ae6ef9b3af2a7cf80626482749584cc8604df8b4"
        },
        {
          "time": 0.7,
          "caption": "Loikka on luvussa 8. Hän hyppää kolme kertaa taaksepäin.",
          "sha256": "544750e2b1ec865878e48b41ae6ef9b3af2a7cf80626482749584cc8604df8b4"
        },
        {
          "time": 0.8399999999999999,
          "caption": "8…",
          "sha256": "6f624b3d26a1f6b70c41834111ef35eafbcf0938ddc52a8141357d5ca9bd9813"
        },
        {
          "time": 0.9799999999999999,
          "caption": "8…",
          "sha256": "36cbd2442da0a3f85c42877da9caae285da13cb226048f7b3affd979142154e0"
        },
        {
          "time": 1.1199999999999999,
          "caption": "8…",
          "sha256": "4a73eaf6906b9b78509976bbdd2a3727b8aad3c2ba0e1eab094e342928264aa4"
        },
        {
          "time": 1.26,
          "caption": "8…",
          "sha256": "2a562961f1d8c4ffdcbbba4122201ac51bdc95fb9ec3b4e94c3e771ae3078d6f"
        },
        {
          "time": 1.4,
          "caption": "8…",
          "sha256": "72046d0fe9badd2fe421d3da97b1797b23398a74a52bb8238a57c37bfee367da"
        },
        {
          "time": 1.5399999999999998,
          "caption": "8…",
          "sha256": "5618a27817d09ac88aeae32a1fc479749ede133a00df27c00ef40e5520ec4954"
        },
        {
          "time": 1.6799999999999997,
          "caption": "8…",
          "sha256": "5618a27817d09ac88aeae32a1fc479749ede133a00df27c00ef40e5520ec4954"
        },
        {
          "time": 1.8199999999999998,
          "caption": "8, 7…",
          "sha256": "4e5bd7c2a22e4c54dfed1cee356c019a5b6705f5492714d1791b4ad4bd641f0b"
        },
        {
          "time": 1.9599999999999997,
          "caption": "8, 7…",
          "sha256": "46bcf739941e6fcd5cd5debbe383b5e9e209c47404c9be9b08ee7e8e75f68a7e"
        },
        {
          "time": 2.1,
          "caption": "8, 7…",
          "sha256": "b8c49dcd2d4e2dba63b1466e50a0449b6dc515da33d5c8342c82b499e8a43792"
        },
        {
          "time": 2.2399999999999998,
          "caption": "8, 7…",
          "sha256": "aaf7e1b393854bcbe6364bb51dd606df196e3623d757b8ef9a4494fe998dcde0"
        },
        {
          "time": 2.38,
          "caption": "8, 7…",
          "sha256": "ccb07a5c81edd357fe85b5fe4c9f8b144cb08b4703befccc953f814566d982d6"
        },
        {
          "time": 2.52,
          "caption": "8, 7…",
          "sha256": "ebb58dd767c78faef04fdbae525928f17db64bd624a188ca96c7a2196bfb718b"
        },
        {
          "time": 2.6599999999999997,
          "caption": "8, 7…",
          "sha256": "ebb58dd767c78faef04fdbae525928f17db64bd624a188ca96c7a2196bfb718b"
        },
        {
          "time": 2.8,
          "caption": "8, 7…",
          "sha256": "ebb58dd767c78faef04fdbae525928f17db64bd624a188ca96c7a2196bfb718b"
        },
        {
          "time": 2.94,
          "caption": "8, 7, 6…",
          "sha256": "aa312047efafd69778987a4565ed5838b12f2b18c73b2eff9ff0137ded716666"
        },
        {
          "time": 3.0799999999999996,
          "caption": "8, 7, 6…",
          "sha256": "c1c65aee50cd625da8def52d87ac37bc855e806e6a970cb890c9998a5c9bbaab"
        },
        {
          "time": 3.2199999999999998,
          "caption": "8, 7, 6…",
          "sha256": "5b11cfabb629070cd9cc86e8df1bf95ad4780b7cda21796456ebc93977962639"
        },
        {
          "time": 3.3599999999999994,
          "caption": "8, 7, 6…",
          "sha256": "cb3d5e9825a1dbc40cf08bda3e304ea0e526265532612b3d95ce6ea67769ccf1"
        },
        {
          "time": 3.5,
          "caption": "8, 7, 6…",
          "sha256": "c4bbb48bfdda84faf895bb84727f258cc01ef7ef828ca943e23d15c97315ecb5"
        },
        {
          "time": 3.6399999999999997,
          "caption": "8, 7, 6…",
          "sha256": "c4bbb48bfdda84faf895bb84727f258cc01ef7ef828ca943e23d15c97315ecb5"
        },
        {
          "time": 3.78,
          "caption": "8, 7, 6…",
          "sha256": "c4bbb48bfdda84faf895bb84727f258cc01ef7ef828ca943e23d15c97315ecb5"
        },
        {
          "time": 3.9199999999999995,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        },
        {
          "time": 4.06,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        },
        {
          "time": 4.2,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        },
        {
          "time": 4.34,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        },
        {
          "time": 4.4799999999999995,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        },
        {
          "time": 4.619999999999999,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        },
        {
          "time": 4.76,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        },
        {
          "time": 4.9,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        },
        {
          "time": 5.04,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        },
        {
          "time": 5.18,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        },
        {
          "time": 5.319999999999999,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        },
        {
          "time": 5.459999999999999,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        },
        {
          "time": 5.6,
          "caption": "8, 7, 6, 5. Kolme hyppyä: Loikka on luvussa 5.",
          "sha256": "f19bdde4db1c74a727ac406079fbeaffdeae719caac848af2ba371ec94ecafac"
        }
      ]
    },
    {
      "say": "Taaksepäin mentäessä kaksikymmentä vaihtuu yhdeksääntoista: kaksikymmentäyksi, kaksikymmentä, yhdeksäntoista, kahdeksantoista.",
      "kind": "animation",
      "duration": 5.6,
      "width": 320,
      "height": 120,
      "label": "Loikka hyppää 3 kertaa taaksepäin luvusta 21",
      "snapshots": [
        {
          "time": 0,
          "caption": "Loikka on luvussa 21. Hän hyppää kolme kertaa taaksepäin.",
          "sha256": "b19737be5d1b53ff5930f7b0691c278746e7a7311042d931f7d00c7e006cc8ac"
        },
        {
          "time": 0.13999999999999999,
          "caption": "Loikka on luvussa 21. Hän hyppää kolme kertaa taaksepäin.",
          "sha256": "b19737be5d1b53ff5930f7b0691c278746e7a7311042d931f7d00c7e006cc8ac"
        },
        {
          "time": 0.27999999999999997,
          "caption": "Loikka on luvussa 21. Hän hyppää kolme kertaa taaksepäin.",
          "sha256": "b19737be5d1b53ff5930f7b0691c278746e7a7311042d931f7d00c7e006cc8ac"
        },
        {
          "time": 0.41999999999999993,
          "caption": "Loikka on luvussa 21. Hän hyppää kolme kertaa taaksepäin.",
          "sha256": "b19737be5d1b53ff5930f7b0691c278746e7a7311042d931f7d00c7e006cc8ac"
        },
        {
          "time": 0.5599999999999999,
          "caption": "Loikka on luvussa 21. Hän hyppää kolme kertaa taaksepäin.",
          "sha256": "b19737be5d1b53ff5930f7b0691c278746e7a7311042d931f7d00c7e006cc8ac"
        },
        {
          "time": 0.7,
          "caption": "Loikka on luvussa 21. Hän hyppää kolme kertaa taaksepäin.",
          "sha256": "b19737be5d1b53ff5930f7b0691c278746e7a7311042d931f7d00c7e006cc8ac"
        },
        {
          "time": 0.8399999999999999,
          "caption": "21…",
          "sha256": "1a649af6f81faa40b0cc8bfb29ac8d3c3b08ec12b4d0bdce5c0ee43a80d1f100"
        },
        {
          "time": 0.9799999999999999,
          "caption": "21…",
          "sha256": "b7e19fb1e8d57babd786e9a0fe5948cfc3862f9ca75b4c53630a732661839cda"
        },
        {
          "time": 1.1199999999999999,
          "caption": "21…",
          "sha256": "08f48f30ab86fe2f9b3484eec5cbfc01268b142e6113eb3985c75afa7dd9eed7"
        },
        {
          "time": 1.26,
          "caption": "21…",
          "sha256": "8b13a3cc782f64b37e47756d8bb93ccbb18633c42798e4162d7a7fd2e3cdcc14"
        },
        {
          "time": 1.4,
          "caption": "21…",
          "sha256": "11ee5c94addeb06f72a6690ac25beed5180709ac9fdd9e1beec38a7d6dc73592"
        },
        {
          "time": 1.5399999999999998,
          "caption": "21…",
          "sha256": "8b7def25b5f4bb47c3832d1d6c07fd0b282cc453310b88bafbeaa02c614828f9"
        },
        {
          "time": 1.6799999999999997,
          "caption": "21…",
          "sha256": "8b7def25b5f4bb47c3832d1d6c07fd0b282cc453310b88bafbeaa02c614828f9"
        },
        {
          "time": 1.8199999999999998,
          "caption": "21, 20…",
          "sha256": "bb0031f7f376ff5f1f7f986c86f07bdf4aff4a16a269d6c14af86e09b0a935f4"
        },
        {
          "time": 1.9599999999999997,
          "caption": "21, 20…",
          "sha256": "e0af0036979edaba4ab05fd3f03eefbbf303b77891de2a2067abd07074697513"
        },
        {
          "time": 2.1,
          "caption": "21, 20…",
          "sha256": "900f44b743329837b2bf8de7e30bc6a6cee746ecbb9849bb041052eef685ebae"
        },
        {
          "time": 2.2399999999999998,
          "caption": "21, 20…",
          "sha256": "6e72e0ee636983a93b5535c6115eea6ad698ac99749798504529a833347c59a1"
        },
        {
          "time": 2.38,
          "caption": "21, 20…",
          "sha256": "78867665c8f9d7505b82e812762b76eac982f5807578e793dc7e9fbcb5abd428"
        },
        {
          "time": 2.52,
          "caption": "21, 20…",
          "sha256": "ddb0334a4ed0f36241b7763fcfc6bbd8f61cd0c2a1d3bbeadcd4714746bf1d1e"
        },
        {
          "time": 2.6599999999999997,
          "caption": "21, 20…",
          "sha256": "ddb0334a4ed0f36241b7763fcfc6bbd8f61cd0c2a1d3bbeadcd4714746bf1d1e"
        },
        {
          "time": 2.8,
          "caption": "21, 20…",
          "sha256": "ddb0334a4ed0f36241b7763fcfc6bbd8f61cd0c2a1d3bbeadcd4714746bf1d1e"
        },
        {
          "time": 2.94,
          "caption": "21, 20, 19…",
          "sha256": "cabbcfd4f27982195d6bf2e20050b4b72fcf5ffbd184e6dd9212b7d9d4c19771"
        },
        {
          "time": 3.0799999999999996,
          "caption": "21, 20, 19…",
          "sha256": "9dfe4962f6bdde03582f50ea12c8c92dfaab8312acf96b31c4cfd24a6fa5688d"
        },
        {
          "time": 3.2199999999999998,
          "caption": "21, 20, 19…",
          "sha256": "cb90a75300afc3edcb1732d501d555b80c5733ca651161d85f0cc2c542d5950e"
        },
        {
          "time": 3.3599999999999994,
          "caption": "21, 20, 19…",
          "sha256": "d994cdcbb09574f3e71ef078857b7dab316b0dc1223e1b3cb3d6946ff4d04d35"
        },
        {
          "time": 3.5,
          "caption": "21, 20, 19…",
          "sha256": "dee9124166e45261a717d1fdaea76c9c2ba80d4f99a45c16e984bc657c075b35"
        },
        {
          "time": 3.6399999999999997,
          "caption": "21, 20, 19…",
          "sha256": "dee9124166e45261a717d1fdaea76c9c2ba80d4f99a45c16e984bc657c075b35"
        },
        {
          "time": 3.78,
          "caption": "21, 20, 19…",
          "sha256": "dee9124166e45261a717d1fdaea76c9c2ba80d4f99a45c16e984bc657c075b35"
        },
        {
          "time": 3.9199999999999995,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        },
        {
          "time": 4.06,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        },
        {
          "time": 4.2,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        },
        {
          "time": 4.34,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        },
        {
          "time": 4.4799999999999995,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        },
        {
          "time": 4.619999999999999,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        },
        {
          "time": 4.76,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        },
        {
          "time": 4.9,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        },
        {
          "time": 5.04,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        },
        {
          "time": 5.18,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        },
        {
          "time": 5.319999999999999,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        },
        {
          "time": 5.459999999999999,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        },
        {
          "time": 5.6,
          "caption": "21, 20, 19, 18. Kolme hyppyä: Loikka on luvussa 18.",
          "sha256": "ebfb14a34f250a4e800542b85617b3ee28569e88cfe84b5d9492233ec20a78b4"
        }
      ]
    },
    {
      "say": "Lähtökivi ei ole hyppy. Ensimmäinen hyppy vie luvusta 13 lukuun 12.",
      "kind": "static",
      "html": "<svg viewBox=\"0 0 330 104\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"8\" y1=\"70\" x2=\"322\" y2=\"70\" stroke=\"currentColor\" stroke-width=\"2.5\"/><path d=\"M326 70l-8 -5v10z\" fill=\"currentColor\"/><line x1=\"16\" y1=\"61\" x2=\"16\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"16\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">8</text><line x1=\"53.25\" y1=\"61\" x2=\"53.25\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"53.25\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">9</text><line x1=\"90.5\" y1=\"61\" x2=\"90.5\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"90.5\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">10</text><line x1=\"127.75\" y1=\"61\" x2=\"127.75\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"127.75\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">11</text><line x1=\"165\" y1=\"61\" x2=\"165\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"165\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">12</text><line x1=\"202.25\" y1=\"61\" x2=\"202.25\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"202.25\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">13</text><line x1=\"239.5\" y1=\"61\" x2=\"239.5\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"239.5\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">14</text><line x1=\"276.75\" y1=\"61\" x2=\"276.75\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"276.75\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">15</text><line x1=\"314\" y1=\"61\" x2=\"314\" y2=\"79\" stroke=\"currentColor\" stroke-width=\"1.8\"/><text x=\"314\" y=\"96\" text-anchor=\"middle\" font-size=\"13\" font-weight=\"600\" fill=\"currentColor\">16</text><path d=\"M202.25 64 Q183.625 23.72 165 64\" fill=\"none\" stroke=\"var(--pond)\" stroke-width=\"2.5\"/><path d=\"M165 65l8 -5 -1 7z\" fill=\"var(--pond)\"/><text x=\"183.625\" y=\"39.86\" text-anchor=\"middle\" font-size=\"12\" font-weight=\"800\" fill=\"var(--pond)\">−1</text><circle cx=\"202.25\" cy=\"56\" r=\"9\" fill=\"#5cbf6c\"/><circle cx=\"198.25\" cy=\"50\" r=\"3\" fill=\"#fff\"/><circle cx=\"206.25\" cy=\"50\" r=\"3\" fill=\"#fff\"/></svg>"
    }
  ]
}

## Authored interpretation

Only M-NUM-07 is required in the canonical graph; full AND group retained. No new prerequisite gate. Current audit1 NodeSpec and actual family branches supersede stale COVERAGE rows. Own typed/select/multiselect tasks retain the mathematical outcomes but do not claim the same pupil UI or oral fluency. Speaking, naming objects and help are optional. Native package is standalone and does not alter Lite.

Tuettu luvun kirjoittaminen tai mallin katsominen ei osoita suullista lukujonosujuvuutta, vähennyslaskun yleistä hallintaa, fyysistä liikkumista tai muistamista. Nimettyjen tehtävien luvut ovat 0–30; ei nollan alittavia siirtoja.

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
