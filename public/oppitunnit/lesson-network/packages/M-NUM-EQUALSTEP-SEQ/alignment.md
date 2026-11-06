# M-NUM-EQUALSTEP-SEQ — actual Lite reconciliation

{
  "goal": "Opit tunnistamaan jonon, jossa hypyt ovat yhtä pitkiä, ja jatkamaan sitä.",
  "goalOrigin": "GOALS fallback in index.ts",
  "nodeRevision": "audit1-2026-10-28",
  "validRevisions": [
    "audit1-2026-10-28"
  ],
  "motionOverlay": false,
  "intro": "Loikka hyppää aina yhtä pitkän hypyn. Mihin se hyppää seuraavaksi?",
  "reward": "Löysit hyppyjen säännön!",
  "families": {
    "rule": {
      "taskKind": "choice",
      "seed": 1,
      "phase": "guided",
      "say": "Kuinka pitkä on jokainen hyppy?",
      "hint": "Paljonko on luvusta 5 lukuun 7?",
      "explain": "5, 7, 9, 11: joka hyppy on + 2.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "text": "+1",
            "speak": "+1"
          },
          {
            "text": "+2",
            "speak": "+2"
          },
          {
            "text": "+4",
            "speak": "+4"
          }
        ],
        "answer": 1,
        "why": [
          "Jos hyppy olisi 1, 5:n jälkeen tulisi 6, ei 7.",
          null,
          "Jos hyppy olisi 4, 5:n jälkeen tulisi 9, ei 7."
        ]
      },
      "registry": {
        "node": "M-NUM-EQUALSTEP-SEQ",
        "tag": "rule",
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
        "html": "<svg viewBox=\"0 0 274 90\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"38\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"38\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">5</text><ellipse cx=\"104\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"104\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">7</text><ellipse cx=\"170\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"170\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">9</text><ellipse cx=\"236\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"236\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">11</text><g>\n    <ellipse cx=\"38\" cy=\"27.15\" rx=\"13.65\" ry=\"7.15\" fill=\"#3e9b54\"/>\n    <ellipse cx=\"38\" cy=\"21.3\" rx=\"13\" ry=\"8.06\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"44.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"44.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"32.019999999999996\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"45.02\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"29.939999999999998\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <circle cx=\"46.06\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <path d=\"M32.15 21.95 Q38 27.15 43.85 21.95\" stroke=\"#1f4d2b\" stroke-width=\"1.04\" fill=\"none\" stroke-linecap=\"round\"/>\n  </g></svg>"
      }
    },
    "extend": {
      "taskKind": "build",
      "seed": 2,
      "phase": "guided",
      "say": "Jatka jonoa kahdella kivellä.",
      "hint": "Hyppy on 2. Lisää 2 viimeiseen lukuun.",
      "explain": "0, 2, 4, 6, 8: joka kerta + 2.",
      "task": {
        "kind": "build",
        "tokens": [
          "6",
          "8",
          "7"
        ],
        "target": "6 8",
        "mode": "seq",
        "max": 2
      },
      "registry": {
        "node": "M-NUM-EQUALSTEP-SEQ",
        "tag": "extend",
        "outcome": "rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään)",
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
        "html": "<svg viewBox=\"0 0 340 90\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"38\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"38\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">0</text><ellipse cx=\"104\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"104\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">2</text><ellipse cx=\"170\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"170\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">4</text><ellipse cx=\"236\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"var(--sun)\"/><text x=\"236\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#3a2c00\">?</text><ellipse cx=\"302\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"var(--sun)\"/><text x=\"302\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#3a2c00\">?</text><g>\n    <ellipse cx=\"38\" cy=\"27.15\" rx=\"13.65\" ry=\"7.15\" fill=\"#3e9b54\"/>\n    <ellipse cx=\"38\" cy=\"21.3\" rx=\"13\" ry=\"8.06\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"44.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"44.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"32.019999999999996\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"45.02\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"29.939999999999998\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <circle cx=\"46.06\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <path d=\"M32.15 21.95 Q38 27.15 43.85 21.95\" stroke=\"#1f4d2b\" stroke-width=\"1.04\" fill=\"none\" stroke-linecap=\"round\"/>\n  </g></svg>"
      }
    },
    "which": {
      "taskKind": "choice",
      "seed": 4,
      "phase": "guided",
      "say": "Missä jonossa hypyt ovat kaikki yhtä pitkiä?",
      "hint": "Laske jokaisen hypyn pituus: paljonko luku kasvaa?",
      "explain": "2, 4, 6, 8: joka kerta + 2.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "text": "2, 4, 7, 9",
            "speak": "2, 4, 7, 9"
          },
          {
            "text": "2, 3, 5, 8",
            "speak": "2, 3, 5, 8"
          },
          {
            "text": "2, 4, 6, 8",
            "speak": "2, 4, 6, 8"
          }
        ],
        "answer": 2,
        "why": [
          "Hypyt: 2, 3, 2. Keskimmäinen on pidempi.",
          "Hypyt: 1, 2, 3. Ne pitenevät.",
          null
        ],
        "cols": 1
      },
      "registry": {
        "node": "M-NUM-EQUALSTEP-SEQ",
        "tag": "which",
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
    "step2": {
      "taskKind": "choice",
      "seed": 7,
      "phase": "guided",
      "say": "Hypyt ovat yhtä pitkiä. Mikä numero on seuraavassa kivessä?",
      "hint": "Paljonko luku kasvaa joka kerta?",
      "explain": "0, 2, 4, 6: joka kerta + 2.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "6"
          },
          {
            "big": "5"
          },
          {
            "big": "8"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "Hyppy ei ole yksi vaan 2.",
          "8 on kahden hypyn päässä: ennen sitä tulee 6."
        ]
      },
      "registry": {
        "node": "M-NUM-EQUALSTEP-SEQ",
        "tag": "step2",
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
        "html": "<svg viewBox=\"0 0 274 90\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"38\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"38\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">0</text><ellipse cx=\"104\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"104\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">2</text><ellipse cx=\"170\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"170\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">4</text><ellipse cx=\"236\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"var(--sun)\"/><text x=\"236\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#3a2c00\">?</text><g>\n    <ellipse cx=\"38\" cy=\"27.15\" rx=\"13.65\" ry=\"7.15\" fill=\"#3e9b54\"/>\n    <ellipse cx=\"38\" cy=\"21.3\" rx=\"13\" ry=\"8.06\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"44.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"44.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"32.019999999999996\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"45.02\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"29.939999999999998\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <circle cx=\"46.06\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <path d=\"M32.15 21.95 Q38 27.15 43.85 21.95\" stroke=\"#1f4d2b\" stroke-width=\"1.04\" fill=\"none\" stroke-linecap=\"round\"/>\n  </g></svg>"
      }
    },
    "step5": {
      "taskKind": "choice",
      "seed": 9,
      "phase": "guided",
      "say": "Hypyt ovat yhtä pitkiä. Mikä numero on seuraavassa kivessä?",
      "hint": "Paljonko luku kasvaa joka kerta?",
      "explain": "15, 20, 25, 30: joka kerta + 5.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "35"
          },
          {
            "big": "26"
          },
          {
            "big": "30"
          }
        ],
        "answer": 2,
        "why": [
          "35 on kahden hypyn päässä: ennen sitä tulee 30.",
          "Hyppy ei ole yksi vaan 5.",
          null
        ]
      },
      "registry": {
        "node": "M-NUM-EQUALSTEP-SEQ",
        "tag": "step5",
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
        "html": "<svg viewBox=\"0 0 274 90\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"38\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"38\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">15</text><ellipse cx=\"104\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"104\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">20</text><ellipse cx=\"170\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"170\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">25</text><ellipse cx=\"236\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"var(--sun)\"/><text x=\"236\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#3a2c00\">?</text><g>\n    <ellipse cx=\"38\" cy=\"27.15\" rx=\"13.65\" ry=\"7.15\" fill=\"#3e9b54\"/>\n    <ellipse cx=\"38\" cy=\"21.3\" rx=\"13\" ry=\"8.06\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"44.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"44.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"32.019999999999996\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"45.02\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"29.939999999999998\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <circle cx=\"46.06\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <path d=\"M32.15 21.95 Q38 27.15 43.85 21.95\" stroke=\"#1f4d2b\" stroke-width=\"1.04\" fill=\"none\" stroke-linecap=\"round\"/>\n  </g></svg>"
      }
    },
    "step10": {
      "taskKind": "choice",
      "seed": 14,
      "phase": "guided",
      "say": "Hypyt ovat yhtä pitkiä. Mikä numero on seuraavassa kivessä?",
      "hint": "Paljonko luku kasvaa joka kerta?",
      "explain": "10, 20, 30, 40: joka kerta + 10.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "50"
          },
          {
            "big": "40"
          },
          {
            "big": "31"
          }
        ],
        "answer": 1,
        "why": [
          "50 on kahden hypyn päässä: ennen sitä tulee 40.",
          null,
          "Hyppy ei ole yksi vaan 10."
        ]
      },
      "registry": {
        "node": "M-NUM-EQUALSTEP-SEQ",
        "tag": "step10",
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
        "html": "<svg viewBox=\"0 0 274 90\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"38\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"38\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">10</text><ellipse cx=\"104\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"104\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">20</text><ellipse cx=\"170\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"170\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">30</text><ellipse cx=\"236\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"var(--sun)\"/><text x=\"236\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#3a2c00\">?</text><g>\n    <ellipse cx=\"38\" cy=\"27.15\" rx=\"13.65\" ry=\"7.15\" fill=\"#3e9b54\"/>\n    <ellipse cx=\"38\" cy=\"21.3\" rx=\"13\" ry=\"8.06\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"44.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"44.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"32.019999999999996\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"45.02\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"29.939999999999998\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <circle cx=\"46.06\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <path d=\"M32.15 21.95 Q38 27.15 43.85 21.95\" stroke=\"#1f4d2b\" stroke-width=\"1.04\" fill=\"none\" stroke-linecap=\"round\"/>\n  </g></svg>"
      }
    },
    "transfer": {
      "taskKind": "choice",
      "seed": 1,
      "phase": "transfer",
      "say": "Yhden kiven numero puuttuu. Mikä siinä on?",
      "hint": "Katso kahta ensimmäistä kiveä: kuinka pitkä hyppy on?",
      "explain": "Hyppy on 5: 5, 10, 15, 20.",
      "task": {
        "kind": "choice",
        "options": [
          {
            "big": "15"
          },
          {
            "big": "25"
          },
          {
            "big": "11"
          }
        ],
        "answer": 0,
        "why": [
          null,
          "25 tulisi viimeisen kiven jälkeen.",
          "Hyppy ei ole yksi vaan 5."
        ]
      },
      "registry": {
        "node": "M-NUM-EQUALSTEP-SEQ",
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
        "kind": "static",
        "html": "<svg viewBox=\"0 0 274 90\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><ellipse cx=\"38\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"38\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">5</text><ellipse cx=\"104\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"104\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">10</text><ellipse cx=\"170\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"var(--sun)\"/><text x=\"170\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#3a2c00\">?</text><ellipse cx=\"236\" cy=\"56\" rx=\"29\" ry=\"20\" fill=\"#9aa3a8\"/><text x=\"236\" y=\"64\" text-anchor=\"middle\" font-size=\"24\" font-weight=\"800\" fill=\"#fff\">20</text><g>\n    <ellipse cx=\"38\" cy=\"27.15\" rx=\"13.65\" ry=\"7.15\" fill=\"#3e9b54\"/>\n    <ellipse cx=\"38\" cy=\"21.3\" rx=\"13\" ry=\"8.06\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"44.5\" cy=\"14.149999999999999\" r=\"4.42\" fill=\"#5cbf6c\"/>\n    <circle cx=\"31.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"44.5\" cy=\"13.89\" r=\"2.6\" fill=\"#fff\"/>\n    <circle cx=\"32.019999999999996\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"45.02\" cy=\"14.149999999999999\" r=\"1.3\" fill=\"#1b2a22\"/>\n    <circle cx=\"29.939999999999998\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <circle cx=\"46.06\" cy=\"20.65\" r=\"1.3\" fill=\"#f2a7a0\" opacity=\".7\"/>\n    <path d=\"M32.15 21.95 Q38 27.15 43.85 21.95\" stroke=\"#1f4d2b\" stroke-width=\"1.04\" fill=\"none\" stroke-linecap=\"round\"/>\n  </g></svg>"
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
      "say": "Loikka hyppää aina kaksi eteenpäin: kaksi, neljä, kuusi, kahdeksan, kymmenen. Joka hypyllä luku kasvaa kahdella.",
      "kind": "animation",
      "duration": 6.6,
      "width": 320,
      "height": 120,
      "label": "Loikka hyppää 4 kertaa eteenpäin luvusta 2",
      "snapshots": [
        {
          "time": 0,
          "caption": "Loikka on luvussa 2. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "9cb2af5f14e6da38fab04e695606b1063d67e42fce205612e30c1f4d74178413"
        },
        {
          "time": 0.16499999999999998,
          "caption": "Loikka on luvussa 2. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "9cb2af5f14e6da38fab04e695606b1063d67e42fce205612e30c1f4d74178413"
        },
        {
          "time": 0.32999999999999996,
          "caption": "Loikka on luvussa 2. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "9cb2af5f14e6da38fab04e695606b1063d67e42fce205612e30c1f4d74178413"
        },
        {
          "time": 0.49499999999999994,
          "caption": "Loikka on luvussa 2. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "9cb2af5f14e6da38fab04e695606b1063d67e42fce205612e30c1f4d74178413"
        },
        {
          "time": 0.6599999999999999,
          "caption": "Loikka on luvussa 2. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "9cb2af5f14e6da38fab04e695606b1063d67e42fce205612e30c1f4d74178413"
        },
        {
          "time": 0.825,
          "caption": "2…",
          "sha256": "1d6ca6e7989ae7acc71bdb76557d796dd2b375b137d24483b429bdf1d99b7b34"
        },
        {
          "time": 0.9899999999999999,
          "caption": "2…",
          "sha256": "2d9edce6a54b5cc3be0b63bc53c73cae986aa6f618a5b0d48f9838169e379feb"
        },
        {
          "time": 1.1549999999999998,
          "caption": "2…",
          "sha256": "846dbd09a4527841899bc85e53f23990b4561376e7d7bb3ddd42ca7d420ddcbc"
        },
        {
          "time": 1.3199999999999998,
          "caption": "2…",
          "sha256": "6606587a61e1072088fbd388fb80e3b63d4f7dbaa54ef0995af42886c6e51caa"
        },
        {
          "time": 1.4849999999999999,
          "caption": "2…",
          "sha256": "54a395452abe00b3fd7cf329925ca0334ee2f5faa5f9e7a03158336338401bdb"
        },
        {
          "time": 1.65,
          "caption": "2…",
          "sha256": "0d035aa4e5fd30db807af764ee5ba8d349a43774d52011978e969dee18be7c30"
        },
        {
          "time": 1.815,
          "caption": "2, 4…",
          "sha256": "a5c34e8e1acf93c678a2448846f4645acde0cd2901a325c95f7fddacc970dcf5"
        },
        {
          "time": 1.9799999999999998,
          "caption": "2, 4…",
          "sha256": "7cc4f6df9ea9aadd5bb449bcc68d2e240eb9fb9e67959a7adae3a509003f5e99"
        },
        {
          "time": 2.145,
          "caption": "2, 4…",
          "sha256": "0b746490237fc6d851ade2a53f7e1bf6275feaddcd419cdad0d8ce03ecf479ba"
        },
        {
          "time": 2.3099999999999996,
          "caption": "2, 4…",
          "sha256": "56834d238c5a452e5c0340d90df177728b181562d4a0b051776690647a2ad536"
        },
        {
          "time": 2.475,
          "caption": "2, 4…",
          "sha256": "601e01371547adb2e831d32013987ff8f57107f65157757bae362f9823016a1c"
        },
        {
          "time": 2.6399999999999997,
          "caption": "2, 4…",
          "sha256": "621131b1f9d995dc2c0167a764721c9ce81728538cb0e6e92880dfb30c10875a"
        },
        {
          "time": 2.8049999999999997,
          "caption": "2, 4, 6…",
          "sha256": "ad8d0381e386a8eaa14c6d08903678fa5de9444a5a7a5364750efb5acfbbacc2"
        },
        {
          "time": 2.9699999999999998,
          "caption": "2, 4, 6…",
          "sha256": "c1fb7fa268980afc4224f867ba6501e8f1b20db4a6885b57ee0139c8019a2c24"
        },
        {
          "time": 3.135,
          "caption": "2, 4, 6…",
          "sha256": "93a9335885ad66ec8c722bc520699ea54c2c248af9352bd277e769887028d1ab"
        },
        {
          "time": 3.3,
          "caption": "2, 4, 6…",
          "sha256": "5173eef3f32166e9fe93d238a6a50608798bd6ced5f8c5f1f90258fafabc75c2"
        },
        {
          "time": 3.465,
          "caption": "2, 4, 6…",
          "sha256": "ee8053c8000a74b828562005150f7c721ed48cf432b4975f8eb37b321ae43b03"
        },
        {
          "time": 3.63,
          "caption": "2, 4, 6…",
          "sha256": "772bd8bae14b64597368ad5b7db598ab582f91501393ad4e51277ebd90417929"
        },
        {
          "time": 3.7949999999999995,
          "caption": "2, 4, 6…",
          "sha256": "772bd8bae14b64597368ad5b7db598ab582f91501393ad4e51277ebd90417929"
        },
        {
          "time": 3.9599999999999995,
          "caption": "2, 4, 6, 8…",
          "sha256": "f59665d803e7f340233881448d45e45e4d4b4b5976326bec687027b0bf677c62"
        },
        {
          "time": 4.125,
          "caption": "2, 4, 6, 8…",
          "sha256": "aa29057f9ac482e8c530e8fc33f1682df44f8207daf2c46e49aca650f92ea405"
        },
        {
          "time": 4.29,
          "caption": "2, 4, 6, 8…",
          "sha256": "0e8caa2b4c983c0300ba2905ffa577428263855e0dad5eb3d044bee2e7ac6b8f"
        },
        {
          "time": 4.455,
          "caption": "2, 4, 6, 8…",
          "sha256": "f11b84b045c868cac1d105424e98f743eaa582d7103fc307fed40dafe767df8f"
        },
        {
          "time": 4.619999999999999,
          "caption": "2, 4, 6, 8…",
          "sha256": "05749e491e90905246f3e4cf404debc0e0e623cba3f70ec2cc8bc97ceb043bb8"
        },
        {
          "time": 4.784999999999999,
          "caption": "2, 4, 6, 8…",
          "sha256": "05749e491e90905246f3e4cf404debc0e0e623cba3f70ec2cc8bc97ceb043bb8"
        },
        {
          "time": 4.95,
          "caption": "2, 4, 6, 8, 10. Neljä hyppyä, joka hypyllä 2: Loikka on luvussa 10.",
          "sha256": "dce5d28d470d5b0df5c40e3d6dbdf67bca5131ff91cade726a36e7fc547b135d"
        },
        {
          "time": 5.115,
          "caption": "2, 4, 6, 8, 10. Neljä hyppyä, joka hypyllä 2: Loikka on luvussa 10.",
          "sha256": "dce5d28d470d5b0df5c40e3d6dbdf67bca5131ff91cade726a36e7fc547b135d"
        },
        {
          "time": 5.279999999999999,
          "caption": "2, 4, 6, 8, 10. Neljä hyppyä, joka hypyllä 2: Loikka on luvussa 10.",
          "sha256": "dce5d28d470d5b0df5c40e3d6dbdf67bca5131ff91cade726a36e7fc547b135d"
        },
        {
          "time": 5.444999999999999,
          "caption": "2, 4, 6, 8, 10. Neljä hyppyä, joka hypyllä 2: Loikka on luvussa 10.",
          "sha256": "dce5d28d470d5b0df5c40e3d6dbdf67bca5131ff91cade726a36e7fc547b135d"
        },
        {
          "time": 5.609999999999999,
          "caption": "2, 4, 6, 8, 10. Neljä hyppyä, joka hypyllä 2: Loikka on luvussa 10.",
          "sha256": "dce5d28d470d5b0df5c40e3d6dbdf67bca5131ff91cade726a36e7fc547b135d"
        },
        {
          "time": 5.775,
          "caption": "2, 4, 6, 8, 10. Neljä hyppyä, joka hypyllä 2: Loikka on luvussa 10.",
          "sha256": "dce5d28d470d5b0df5c40e3d6dbdf67bca5131ff91cade726a36e7fc547b135d"
        },
        {
          "time": 5.9399999999999995,
          "caption": "2, 4, 6, 8, 10. Neljä hyppyä, joka hypyllä 2: Loikka on luvussa 10.",
          "sha256": "dce5d28d470d5b0df5c40e3d6dbdf67bca5131ff91cade726a36e7fc547b135d"
        },
        {
          "time": 6.1049999999999995,
          "caption": "2, 4, 6, 8, 10. Neljä hyppyä, joka hypyllä 2: Loikka on luvussa 10.",
          "sha256": "dce5d28d470d5b0df5c40e3d6dbdf67bca5131ff91cade726a36e7fc547b135d"
        },
        {
          "time": 6.27,
          "caption": "2, 4, 6, 8, 10. Neljä hyppyä, joka hypyllä 2: Loikka on luvussa 10.",
          "sha256": "dce5d28d470d5b0df5c40e3d6dbdf67bca5131ff91cade726a36e7fc547b135d"
        },
        {
          "time": 6.435,
          "caption": "2, 4, 6, 8, 10. Neljä hyppyä, joka hypyllä 2: Loikka on luvussa 10.",
          "sha256": "dce5d28d470d5b0df5c40e3d6dbdf67bca5131ff91cade726a36e7fc547b135d"
        },
        {
          "time": 6.6,
          "caption": "2, 4, 6, 8, 10. Neljä hyppyä, joka hypyllä 2: Loikka on luvussa 10.",
          "sha256": "dce5d28d470d5b0df5c40e3d6dbdf67bca5131ff91cade726a36e7fc547b135d"
        }
      ]
    },
    {
      "say": "Pidempi hyppy: viisi kerrallaan. Nolla, viisi, kymmenen, viisitoista, kaksikymmentä.",
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
    },
    {
      "say": "Kun tiedät hypyn pituuden, tiedät seuraavan luvun. Hypyn pituuden saat, kun katsot, paljonko luku kasvaa kiveltä seuraavalle.",
      "kind": "animation",
      "duration": 6.6,
      "width": 320,
      "height": 120,
      "label": "Loikka hyppää 4 kertaa eteenpäin luvusta 0",
      "snapshots": [
        {
          "time": 0,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "db745bde8b8078e085af2d530c9429ff20f57ab13a8962cf9036112f545572f2"
        },
        {
          "time": 0.16499999999999998,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "db745bde8b8078e085af2d530c9429ff20f57ab13a8962cf9036112f545572f2"
        },
        {
          "time": 0.32999999999999996,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "db745bde8b8078e085af2d530c9429ff20f57ab13a8962cf9036112f545572f2"
        },
        {
          "time": 0.49499999999999994,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "db745bde8b8078e085af2d530c9429ff20f57ab13a8962cf9036112f545572f2"
        },
        {
          "time": 0.6599999999999999,
          "caption": "Loikka on luvussa 0. Hän hyppää neljä kertaa eteenpäin.",
          "sha256": "db745bde8b8078e085af2d530c9429ff20f57ab13a8962cf9036112f545572f2"
        },
        {
          "time": 0.825,
          "caption": "0…",
          "sha256": "ca7ac06dfc0f38f781c6c3ce6347952fb9d5e0287afad008f7211b59ca2d4b77"
        },
        {
          "time": 0.9899999999999999,
          "caption": "0…",
          "sha256": "fb215d43ec68bb7bc367407f98bf73ba1a57b89e5ee2f063da12c460dadf7beb"
        },
        {
          "time": 1.1549999999999998,
          "caption": "0…",
          "sha256": "aa0562245a33a956d697b60426a09a2f749587fb231ab86c7bd5f33c737cf847"
        },
        {
          "time": 1.3199999999999998,
          "caption": "0…",
          "sha256": "715c969cae33a91c854c6447f984c64f411698ead86cc8ed76ea120a469157d3"
        },
        {
          "time": 1.4849999999999999,
          "caption": "0…",
          "sha256": "1401f6f99895cd0d5fcfc012541cf2b7981fb9213548eff507a68a5eb36710a5"
        },
        {
          "time": 1.65,
          "caption": "0…",
          "sha256": "4ea0e6e7c5beb93d287a99c1f6896981e546f1be7462be825c602b021dd5cb14"
        },
        {
          "time": 1.815,
          "caption": "0, 10…",
          "sha256": "bb416f8bf888f617a055202795fde1a29e64d92e7a3bd485dc07cb8640917450"
        },
        {
          "time": 1.9799999999999998,
          "caption": "0, 10…",
          "sha256": "8386d1635b90b19dfaf9db3d3ea7dcaa668371c9592354eafd2c98042fc85857"
        },
        {
          "time": 2.145,
          "caption": "0, 10…",
          "sha256": "c1f7dbc3a47d267a8d96b4e15132598804b3d246b8a0dd90be7c533f0a9c078c"
        },
        {
          "time": 2.3099999999999996,
          "caption": "0, 10…",
          "sha256": "f59b87eadd32d2d74db552a4b1e2efe02253220d0beaf317efc9330554ae3f5e"
        },
        {
          "time": 2.475,
          "caption": "0, 10…",
          "sha256": "1b690122c1f9d94b9262d8bbeb6df7fbe8813c51e921bffef30dcf860bc87c80"
        },
        {
          "time": 2.6399999999999997,
          "caption": "0, 10…",
          "sha256": "df23c7040b64b56abe0f754a0ce251db4893c57478aff1ead82e7d5318d560d4"
        },
        {
          "time": 2.8049999999999997,
          "caption": "0, 10, 20…",
          "sha256": "f7455b1d0f61e70d804986520bfa3c184fd80310fb6d938e3393c1b1399ad3f3"
        },
        {
          "time": 2.9699999999999998,
          "caption": "0, 10, 20…",
          "sha256": "499ddfcf012f096a8292a837d8bb4f7e48378bc50d329baccfd7cfd375ec83d3"
        },
        {
          "time": 3.135,
          "caption": "0, 10, 20…",
          "sha256": "e9e37b8a37299a52337cb852596e441989127789f2d7cae814d4f8a1ec8ac3ca"
        },
        {
          "time": 3.3,
          "caption": "0, 10, 20…",
          "sha256": "02c7cfb297eda869a8558c0101043e4d241b1db4900ba86275c55f65e4605e4a"
        },
        {
          "time": 3.465,
          "caption": "0, 10, 20…",
          "sha256": "9d7e691954aaba548f90ffed3a747a1e3ea274534234e57f8210c740e2f2c570"
        },
        {
          "time": 3.63,
          "caption": "0, 10, 20…",
          "sha256": "2b01a8270e368591af9821ebbb4cf91404aaab4f7a225acc30f736df0683ba60"
        },
        {
          "time": 3.7949999999999995,
          "caption": "0, 10, 20…",
          "sha256": "2b01a8270e368591af9821ebbb4cf91404aaab4f7a225acc30f736df0683ba60"
        },
        {
          "time": 3.9599999999999995,
          "caption": "0, 10, 20, 30…",
          "sha256": "199361fc03991436d5c8727e2a5116736a0998fd33fd34128464c19c0c10ced9"
        },
        {
          "time": 4.125,
          "caption": "0, 10, 20, 30…",
          "sha256": "626269c969c03ecd0793db74e7d1fe6d3405db483ff24207f622091ba4671d17"
        },
        {
          "time": 4.29,
          "caption": "0, 10, 20, 30…",
          "sha256": "b3c608afd8c68135a075284bad6688ec93b58c9d459b82665a7b1dbd271b7b80"
        },
        {
          "time": 4.455,
          "caption": "0, 10, 20, 30…",
          "sha256": "f378d1a8c5d04c6a630ade3ad422e65edf5f60c2569258572883e1b6d15b27d7"
        },
        {
          "time": 4.619999999999999,
          "caption": "0, 10, 20, 30…",
          "sha256": "553681087a0189d6ddae5b0bdb04a4b481df613cfad239f4bef99e9f209ae5bc"
        },
        {
          "time": 4.784999999999999,
          "caption": "0, 10, 20, 30…",
          "sha256": "553681087a0189d6ddae5b0bdb04a4b481df613cfad239f4bef99e9f209ae5bc"
        },
        {
          "time": 4.95,
          "caption": "0, 10, 20, 30, 40. Neljä hyppyä, joka hypyllä 10: Loikka on luvussa 40.",
          "sha256": "377a9b64ee93a51d3fe03fbfa5f45e9faf8af7579fee5311696cd3ce6e99c8cd"
        },
        {
          "time": 5.115,
          "caption": "0, 10, 20, 30, 40. Neljä hyppyä, joka hypyllä 10: Loikka on luvussa 40.",
          "sha256": "377a9b64ee93a51d3fe03fbfa5f45e9faf8af7579fee5311696cd3ce6e99c8cd"
        },
        {
          "time": 5.279999999999999,
          "caption": "0, 10, 20, 30, 40. Neljä hyppyä, joka hypyllä 10: Loikka on luvussa 40.",
          "sha256": "377a9b64ee93a51d3fe03fbfa5f45e9faf8af7579fee5311696cd3ce6e99c8cd"
        },
        {
          "time": 5.444999999999999,
          "caption": "0, 10, 20, 30, 40. Neljä hyppyä, joka hypyllä 10: Loikka on luvussa 40.",
          "sha256": "377a9b64ee93a51d3fe03fbfa5f45e9faf8af7579fee5311696cd3ce6e99c8cd"
        },
        {
          "time": 5.609999999999999,
          "caption": "0, 10, 20, 30, 40. Neljä hyppyä, joka hypyllä 10: Loikka on luvussa 40.",
          "sha256": "377a9b64ee93a51d3fe03fbfa5f45e9faf8af7579fee5311696cd3ce6e99c8cd"
        },
        {
          "time": 5.775,
          "caption": "0, 10, 20, 30, 40. Neljä hyppyä, joka hypyllä 10: Loikka on luvussa 40.",
          "sha256": "377a9b64ee93a51d3fe03fbfa5f45e9faf8af7579fee5311696cd3ce6e99c8cd"
        },
        {
          "time": 5.9399999999999995,
          "caption": "0, 10, 20, 30, 40. Neljä hyppyä, joka hypyllä 10: Loikka on luvussa 40.",
          "sha256": "377a9b64ee93a51d3fe03fbfa5f45e9faf8af7579fee5311696cd3ce6e99c8cd"
        },
        {
          "time": 6.1049999999999995,
          "caption": "0, 10, 20, 30, 40. Neljä hyppyä, joka hypyllä 10: Loikka on luvussa 40.",
          "sha256": "377a9b64ee93a51d3fe03fbfa5f45e9faf8af7579fee5311696cd3ce6e99c8cd"
        },
        {
          "time": 6.27,
          "caption": "0, 10, 20, 30, 40. Neljä hyppyä, joka hypyllä 10: Loikka on luvussa 40.",
          "sha256": "377a9b64ee93a51d3fe03fbfa5f45e9faf8af7579fee5311696cd3ce6e99c8cd"
        },
        {
          "time": 6.435,
          "caption": "0, 10, 20, 30, 40. Neljä hyppyä, joka hypyllä 10: Loikka on luvussa 40.",
          "sha256": "377a9b64ee93a51d3fe03fbfa5f45e9faf8af7579fee5311696cd3ce6e99c8cd"
        },
        {
          "time": 6.6,
          "caption": "0, 10, 20, 30, 40. Neljä hyppyä, joka hypyllä 10: Loikka on luvussa 40.",
          "sha256": "377a9b64ee93a51d3fe03fbfa5f45e9faf8af7579fee5311696cd3ce6e99c8cd"
        }
      ]
    }
  ]
}

## Authored interpretation

Only M-NUM-07 is required in the canonical graph; full AND group retained. No new prerequisite gate. Current audit1 NodeSpec and actual family branches supersede stale COVERAGE rows. Own typed/select/multiselect tasks retain the mathematical outcomes but do not claim the same pupil UI or oral fluency. Speaking, naming objects and help are optional. Native package is standalone and does not alter Lite.

Tuettu tunnistus ja kahden luvun jatko eivät osoita kaikkien lukujonojen sääntöjen hallintaa tai kertotaulumuistia. Tässä tasavälisyys tarkoittaa samaa positiivista lisäystä; ei kaikkia matemaattisia jonoja eikä negatiivisia lukuja.

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
