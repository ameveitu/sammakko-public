# Lite-yhteensovitus: M-MULTAB-HIGH

Tarkka NodeSpec: src/content/written.ts:264–313, audit1-2026-10-28; validRevs sama. Intro ja goal ovat täsmällisessä raakainventoinnissa /tmp/sammakko-B08-Mill-prep-2026-10-29/raw-lite-nodes.json, ja sisältöinventointi sisältyy myös tämän paketin lesson.json-metadataan.

## Todellinen opetus- ja perheinventointi

{
  "source": "src/content/written.ts:264–313",
  "rev": "audit1-2026-10-28",
  "goalOwn": true,
  "intro": "Verstaan seinällä on kertotaulut. Isot taulut saa pienistä, kun tietää tempun.",
  "demos": [
    "trickScene(9,7):10rows minus1row",
    "trickScene(6,7):5rows plus1row",
    "trickScene(8,6):double4rows",
    "trickScene(7,8):5rows plus2rows"
  ],
  "families": [
    {
      "tag": "nine",
      "task": "numeric",
      "range": "k3..9,product27..81",
      "hintsExplain": "10k−k, common remove1/remove9 errors. whyAt10k−9 coincides with correct81 at k9 but numeric success priority protects correct answer; do not copy a negative-feedback key for correct answer."
    },
    {
      "tag": "six",
      "task": "numeric",
      "range": "k3..9,product18..54",
      "hintsExplain": "5k+k, exclude collision5k+6=6k whenk6."
    },
    {
      "tag": "trick",
      "task": "choice",
      "range": "a6/8/9;k4..9 excludingk=a and8×4",
      "hintsExplain": "Numerically equivalent strategy accepted ifnotdistractor; sourceavoids equal alternative collisions. No free strategy evidence."
    },
    {
      "tag": "fact",
      "task": "choice",
      "range": "a6..9,b3..9,product18..81",
      "hintsExplain": "Known5/4/10 row blocks; addfactor and neighboring product feedback."
    },
    {
      "tag": "transfer",
      "task": "numeric",
      "range": "given4k,k3..9;ask8k,product24..72",
      "hintsExplain": "Double whole known4k, not add4 or one k row."
    }
  ],
  "audit": "Detailed662–664 adds7demo, trick family andwhyAt; COVERAGE omits trick, says2demos not4 andstaleglobalrevision.",
  "mediaLimits": "trickScene addition/deletion changes counted set; removed nine row remains ghosted at15percentopacity. New model must distinguish excluded row from active9rows, conserve IDs and not count ghost as target.",
  "registry": "Explicit own audit1 NodeSpec goal, globalfallbacklite181-2026-10-27. kit.cases all named ordinary families guided/independent/retrieval, separate transfer. No SIMS overlay, no explicit target families.ts declarations or manifest activity-use rows; default outcomes and no dynamic rule on canonical nodes.",
  "rawNodeSpec": "raw-lite-nodes.json#M-MULTAB-HIGH"
}

## Toteutus ja vertailu

Lite kaikki neljä trickScene esimerkkiä vastaavina selityksinä: 6=5+1,7=5+2,8=4+4,9=10−1. fact/nine/six sekä annetusta4k⇒8k-transfer.

Kaikki 260 sisäistä rivijakoa sallitaan. 5+1,5+2,4+4 annettuina esimerkkeinä; oppija saa vaihtaa jakoa. 10-rivin malli erottelee mukana olevat pisteet yliviivatuista poistetuista, samoilla identiteeteillä. Osatulot annetaan avussa; LOW ei ole kova portti.

## Korjaukset ja ehdotukset Lite-sovittajalle

Lite nine whyAt[10k−9] osuu oikeaan vastaukseen k=9; moottorin success-prioriteetti suojaa sitä, mutta oma tarkistus varmistaa oikean arvon aina ensin. Poistettu rivi ei jää samanarvoiseksi haamupistejoukoksi: yliviivaus ja aktiivisten määrä eksplisiittiset. Lite-lähteitä ei muuteta.

## Rajat

Lite trick on strategian tunnistamisvalinta; oma malli laajentaa sallittuihin vaihtoehtoisiin jakoihin. Tuotetun laskustrategian hallintaa ei päätellä numerovastauksesta. Kaikki välitulot saa katsoa; alempien taulujen muistia ei salaa vaadita.

Numerovastaus ei osoita tietyn hajotelman rakentamista, täydellistä sujuvuutta, fyysistä poistamista tai pysyvää muistamista. Valittu mallijako ei ole arvioitava algoritmipakko.

`families.ts`, registry index, kit.cases, moottorin tarkistus ja relevantit animaatiot luettu varsinaisesta lähteestä. Dynaamista SIMS-overlaytä ei näille kolmelle. Muiden KC:iden näihin kohteisiin osoittava tuki ei ole uusi kohdeperhe. Graafia, required/strong-suhteita, legacy-peliä tai jaettua tilaa ei muuteta. Ei riippumattoman tai ihmiskatselmuksen hyväksyntää kirjoittajan omista testeistä.

## Authored stylesheet inclusion correction

Main found that declaring lesson.css does not load it. The authored body now contains its own declared local stylesheet link. The prior source composition manually injected a head link and masked this omission; that old QA is not evidence of authored CSS inclusion. Native author checks now require the body link, actual stylesheet request and computed styles. Old sources and receipts are preserved externally. No shared compiler/framework changes.
