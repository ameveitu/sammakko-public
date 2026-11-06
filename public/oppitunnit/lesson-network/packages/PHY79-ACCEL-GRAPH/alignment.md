# PHY79-ACCEL-GRAPH — integraatiorajan säilyttäminen

{
  "canonicalRole": "integration",
  "requiredGroups": [
    {
      "all_of": [
        "PHY79-ACCEL-MOTION-GRAPH",
        "PHY79-ACCEL-VT-GRAPH"
      ],
      "rationale": "Integraationoodi saavutetaan, kun kaikki korkean varmuuden auditissa erotetut atomiset alitaidot hallitaan."
    }
  ],
  "actualLiteGoal": "Opit yhdistämään saman liikkeen matka–aika- ja nopeus–aika-kuvaajan: vaakasuora s–t ↔ v = 0, suora s–t ↔ vaakasuora v–t, jyrkkenevä s–t ↔ nouseva v–t, loivenevä s–t ↔ laskeva v–t.",
  "intro": "Sama liike voidaan näyttää matka–aika- ja nopeus–aika-kuvaajana. Yhdistä ne.",
  "families": [
    "accel",
    "pairs",
    "rest",
    "steady",
    "transfer"
  ],
  "phaseCounts": {
    "guided": 128,
    "independent": 128,
    "retrieval": 128,
    "transfer": 128
  },
  "demos": [
    {
      "say": "Katso sammakkoa ja kahta kynää yhtä aikaa. Ensin sammakko lepää, sitten kiihdyttää, loikkii tasaisesti ja lopuksi hidastaa. Vasen kuvaaja näyttää matkan, oikea nopeuden.",
      "kind": "animation",
      "duration": 14.5,
      "width": 320,
      "height": 236,
      "label": "matka–aika- ja nopeus–aika-kuvaaja syntyvät yhtä aikaa"
    },
    {
      "say": "Muistisääntö: nopeus–aika-kuvaajan korkeus kertoo, kuinka jyrkkä matka–aika-kuvaaja on. Tasainen liike: matka–aika on nouseva suora, nopeus–aika vaakasuora viiva.",
      "kind": "static",
      "html": "<div style=\"display:flex;gap:8px;flex-wrap:wrap;justify-content:center\"><svg viewBox=\"0 0 180 140\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"38\" y1=\"110\" x2=\"38\" y2=\"24\" stroke=\"var(--line)\"/><line x1=\"64\" y1=\"110\" x2=\"64\" y2=\"24\" stroke=\"var(--line)\"/><line x1=\"90\" y1=\"110\" x2=\"90\" y2=\"24\" stroke=\"var(--line)\"/><line x1=\"116\" y1=\"110\" x2=\"116\" y2=\"24\" stroke=\"var(--line)\"/><line x1=\"142\" y1=\"110\" x2=\"142\" y2=\"24\" stroke=\"var(--line)\"/><line x1=\"168\" y1=\"110\" x2=\"168\" y2=\"24\" stroke=\"var(--line)\"/><line x1=\"38\" y1=\"110\" x2=\"168\" y2=\"110\" stroke=\"var(--line)\"/><line x1=\"38\" y1=\"88.5\" x2=\"168\" y2=\"88.5\" stroke=\"var(--line)\"/><line x1=\"38\" y1=\"67\" x2=\"168\" y2=\"67\" stroke=\"var(--line)\"/><line x1=\"38\" y1=\"45.5\" x2=\"168\" y2=\"45.5\" stroke=\"var(--line)\"/><line x1=\"38\" y1=\"24\" x2=\"168\" y2=\"24\" stroke=\"var(--line)\"/><path d=\"M38 24 V110 H168\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\"/><text x=\"168\" y=\"137\" text-anchor=\"end\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\">t (s)</text><text x=\"42\" y=\"22\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\">s (m)</text><polyline points=\"38,110 43.416666666666664,106.86458333333333 48.833333333333336,103.72916666666667 54.25,100.59375 59.66666666666667,97.45833333333333 65.08333333333334,94.32291666666666 70.5,91.1875 75.91666666666666,88.05208333333334 81.33333333333334,84.91666666666666 86.75,81.78125 92.16666666666667,78.64583333333333 97.58333333333333,75.51041666666667 103,72.375 108.41666666666667,69.23958333333333 113.83333333333333,66.10416666666667 119.25,62.96875 124.66666666666667,59.83333333333333 130.08333333333331,56.69791666666667 135.5,53.5625 140.91666666666669,50.42708333333333 146.33333333333334,47.29166666666666 151.75,44.15625 157.16666666666666,41.02083333333334 162.58333333333334,37.88541666666666 168,34.75\" fill=\"none\" stroke=\"var(--pond)\" stroke-width=\"3.5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></svg><svg viewBox=\"0 0 180 140\" width=\"100%\" role=\"img\" aria-hidden=\"true\" xmlns=\"http://www.w3.org/2000/svg\"><line x1=\"38\" y1=\"110\" x2=\"38\" y2=\"24\" stroke=\"var(--line)\"/><line x1=\"64\" y1=\"110\" x2=\"64\" y2=\"24\" stroke=\"var(--line)\"/><line x1=\"90\" y1=\"110\" x2=\"90\" y2=\"24\" stroke=\"var(--line)\"/><line x1=\"116\" y1=\"110\" x2=\"116\" y2=\"24\" stroke=\"var(--line)\"/><line x1=\"142\" y1=\"110\" x2=\"142\" y2=\"24\" stroke=\"var(--line)\"/><line x1=\"168\" y1=\"110\" x2=\"168\" y2=\"24\" stroke=\"var(--line)\"/><line x1=\"38\" y1=\"110\" x2=\"168\" y2=\"110\" stroke=\"var(--line)\"/><line x1=\"38\" y1=\"88.5\" x2=\"168\" y2=\"88.5\" stroke=\"var(--line)\"/><line x1=\"38\" y1=\"67\" x2=\"168\" y2=\"67\" stroke=\"var(--line)\"/><line x1=\"38\" y1=\"45.5\" x2=\"168\" y2=\"45.5\" stroke=\"var(--line)\"/><line x1=\"38\" y1=\"24\" x2=\"168\" y2=\"24\" stroke=\"var(--line)\"/><path d=\"M38 24 V110 H168\" stroke=\"currentColor\" stroke-width=\"2\" fill=\"none\"/><text x=\"168\" y=\"137\" text-anchor=\"end\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\">t (s)</text><text x=\"42\" y=\"22\" font-size=\"12\" font-weight=\"700\" fill=\"currentColor\">v (m/s)</text><polyline points=\"38,67 168,67\" fill=\"none\" stroke=\"var(--red)\" stroke-width=\"3.5\" stroke-linejoin=\"round\" stroke-linecap=\"round\"/></svg></div>"
    }
  ]
}

Actual pairs-lajittelu näkyy generaattorissa vaikka vanha COVERAGE ei listaa sitä kaikissa kohdissa. Korvaava kahden kuvauksen tehtävä kohdistaa tuen kumpaankin lapseen ja vaatii molemmat ennen paikallista correct-palautetta. Tämä ei ole täysi muodollinen integraation arviointi eikä lapsille ruiskuteta hallintatunnuksia. Siirtotehtävissä vaiheet ja sama aikaväli näkyvät molemmissa kuvissa. Laskenta ja derivaatta eivät ole uusia kovia esitietoja. Paikka x ja matka s yhtyvät vain ilmoitetussa positiivisen nopeuden mallissa.
