# Lite-yhteensovitus: M-MULTAB-LOW

Tarkka NodeSpec: src/content/facts.ts:713–766, audit1-2026-10-28; validRevs sama. Intro ja goal ovat täsmällisessä raakainventoinnissa /tmp/sammakko-B08-Mill-prep-2026-10-29/raw-lite-nodes.json, ja sisältöinventointi sisältyy myös tämän paketin lesson.json-metadataan.

## Todellinen opetus- ja perheinventointi

{
  "source": "src/content/facts.ts:713–766",
  "rev": "audit1-2026-10-28",
  "goalOwn": true,
  "intro": "Kertopajassa simpukoita lasketaan riveittäin. Kertotaulu on oikotie.",
  "demos": [
    "rowsScene(3,5)",
    "rowsScene(2,7)",
    "doubleRowsScene(6)",
    "turnScene(3,4)",
    "static card10×6=60,5×6=60:2=30"
  ],
  "families": [
    {
      "tag": "fact",
      "task": "numeric",
      "range": "a1/2/3/4/5/10,b1..10,product1..100",
      "hintsExplain": "Per-table optional strategies; whyAt add-vs-product, one row missing/extra."
    },
    {
      "tag": "array",
      "task": "choice",
      "range": "a,b2..5",
      "hintsExplain": "Each row/total; alts/pickNum removes duplicate or numerically correct distractors before feedback mapping."
    },
    {
      "tag": "strategy",
      "task": "choice",
      "range": "4×b,b3..9",
      "hintsExplain": "Two doubles vs addfactors or addone rather than wholerow. Recognition is not free strategy construction."
    },
    {
      "tag": "grid",
      "task": "grid",
      "range": "rows2..5,cols2..8",
      "hintsExplain": "Construct specified row/col counts; legacy swapped orientation is context mismatch not false numeric product."
    },
    {
      "tag": "transfer",
      "task": "numeric",
      "range": "jumpa2/3/4/5/10, countb3..9,product6..90",
      "hintsExplain": "Start0, each jumpa; pictureonlyfirst2jumps, hints/explain and onejump errors."
    }
  ],
  "audit": "Detailed430–432 adds grid and3animations. Current total5demos, not COVERAGE3; COVERAGE omits grid and retains stale revision. Reward mastery language unapproved/not imported.",
  "mediaLimits": "Rows show cumulative supplied counts; optional aid not unassisted recall. turnScene same array rotation; doubleRows copies block with explicit addition, not constant-cardinality rearrangement.",
  "registry": "Explicit own audit1 NodeSpec goal, globalfallbacklite181-2026-10-27. kit.cases all named ordinary families guided/independent/retrieval, separate transfer. No SIMS overlay, no explicit target families.ts declarations or manifest activity-use rows; default outcomes and no dynamic rule on canonical nodes.",
  "rawNodeSpec": "raw-lite-nodes.json#M-MULTAB-LOW"
}

## Toteutus ja vertailu

Lite rowsScene, turnScene ja doubleRowsScene ideat sekä fact/array/strategy; ×1 ja 5/10 avataan vapaaehtoisesti. Loikkatransfer selitetään omalla neljän kolmen loikan esimerkillä.

Vastaus voi tulla heti. Valinnainen rivikuva näyttää kaikki pisteet, askel merkitsee laskettuja rivejä. Jäykkä neljänneskäännös säilyttää jokaisen pisteen identiteetin, koon ja keskinäiset etäisyydet. Taulun tai rivikoon muutos vaihtaa tehtävän; avun kääntö/lasku säilyttää tulon.

## Korjaukset ja ehdotukset Lite-sovittajalle

Lite grid arvioi rivien/sarakkeiden orientaation kontekstia; oma tulotarkistus ei julista vaihdettua yhtä suurta tuloa vääräksi. 2×2=2+2 ei saa väärän laskutavan palautetta. Reward hallussa -väitettä ei kopioida. Lite-lähteitä ei muuteta.

## Rajat

Rivin vaiheistaminen ja kääntö ovat tarjottua apua, eivät vapaan rivistön rakentamisen tai strategian tuottamisen arviointia. grid on inventoitu, mutta sen rakennusnäyttöä ei väitetä. Loikkatehtävä ei mittaa oikeaa hyppimistä.

Numero on valitun tulon matalan panoksen palaute. Ei todiste ulkoa muistamisesta, tietystä strategiasta, fyysisestä rivistön rakentamisesta tai kaikkien taulujen hallinnasta.

`families.ts`, registry index, kit.cases, moottorin tarkistus ja relevantit animaatiot luettu varsinaisesta lähteestä. Dynaamista SIMS-overlaytä ei näille kolmelle. Muiden KC:iden näihin kohteisiin osoittava tuki ei ole uusi kohdeperhe. Graafia, required/strong-suhteita, legacy-peliä tai jaettua tilaa ei muuteta. Ei riippumattoman tai ihmiskatselmuksen hyväksyntää kirjoittajan omista testeistä.

## Authored stylesheet inclusion correction

Main found that declaring lesson.css does not load it. The authored body now contains its own declared local stylesheet link. The prior source composition manually injected a head link and masked this omission; that old QA is not evidence of authored CSS inclusion. Native author checks now require the body link, actual stylesheet request and computed styles. Old sources and receipts are preserved externally. No shared compiler/framework changes.
