# Lite-yhteensovitus: M-GMEAS-01

Tarkka NodeSpec: src/content/added181.ts:128–189, audit1-2026-10-28; validRevs sama. Intro ja goal ovat täsmällisessä raakainventoinnissa /tmp/sammakko-B08-Mill-prep-2026-10-29/raw-lite-nodes.json, ja sisältöinventointi sisältyy myös tämän paketin lesson.json-metadataan.

## Todellinen opetus- ja perheinventointi

{
  "source": "src/content/added181.ts:128–189",
  "rev": "audit1-2026-10-28",
  "goalOwn": true,
  "intro": "Lentopajan siiven reunaan liimataan nauha. Kuinka pitkä nauha tarvitaan?",
  "demos": [
    "perimScene rectangle4×2 P12cm",
    "perimScene cellBoundary4-cell L P10cm, counttrue",
    "perimScene triangle3-4-5 P12cm"
  ],
  "families": [
    {
      "tag": "rect",
      "task": "numeric",
      "range": "a2..7,b1..4,P6..22cm",
      "hintsExplain": "Opposite sides; add4 lengths. whyAt half-circuit and noncolliding area value."
    },
    {
      "tag": "grid",
      "task": "numeric",
      "range": "4 fixed cell sets, P10/10/12/14cm",
      "hintsExplain": "Unit boundary edges only; includes concave shapes, not interior grid lines."
    },
    {
      "tag": "same",
      "task": "sort",
      "range": "P1=10/12,P2=14/16,4 rectangles",
      "hintsExplain": "Same perimeter can occur for different side pairs; every row explained."
    },
    {
      "tag": "meaning",
      "task": "choice",
      "range": "a3..5,b2..3",
      "hintsExplain": "Boundary vs filled interior; perimeter like fence/tape."
    },
    {
      "tag": "transfer",
      "task": "numeric",
      "range": "triangle sides3/4/5,5/5/6,4/4/4,6/8/10; sum12/16/12/24m",
      "hintsExplain": "All3 sides; no need identify arbitrary shape names to calculate."
    }
  ],
  "audit": "Detailed657–659 adds trace/unroll, same sorting and whyAt; COVERAGE omits same, reports2demos not3 and stale global rev.",
  "mediaLimits": "cellBoundary maps a single simple connected boundary. perimScene may use different U for original and straightened LU; do not silently copy visual scale shrink. Preserve common unit or explicitly label separate view scale.",
  "registry": "Explicit own audit1 NodeSpec goal, globalfallbacklite181-2026-10-27. kit.cases all named ordinary families guided/independent/retrieval, separate transfer. No SIMS overlay, no explicit target families.ts declarations or manifest activity-use rows; default outcomes and no dynamic rule on canonical nodes.",
  "rawNodeSpec": "raw-lite-nodes.json#M-GMEAS-01"
}

## Toteutus ja vertailu

Lite rect/grid/meaning ja yhteisen piirin idea opetetaan esimerkeillä. Transfer metreinä annettuun kolmion aitaan.

Alkuperäiset kortin ja L-muodon SVG:t; suljettu reitti, jälki ja suoristettu nauha samalla 18 px / malliyksikkö -asteikolla. Kolme annettua mallia, luku+yksikkö -vastaus. Automaattinen jäljitys 2 malliyksikköä/toistosekunti, ei väitettä todellisesta liikkumisnopeudesta. Pysäytys/askel/alku. Valinnainen jäljitys ei muuta vastaussääntöä.

## Korjaukset ja ehdotukset Lite-sovittajalle

PerimScene käyttää U ja LU eri asteikkoja; oma malli käyttää samaa mittakaavaa reitillä ja suoralla nauhalla. Ei kopioitua laajempaa pinta-ala-/kertolaskuedellytystä. Lite-lähteitä ei muuteta.

## Rajat

Lite same on lajittelu; tässä sama piiri eri muodoilla on selitetty vertailu ja valinnainen tutkimus, ei lajittelusuorituksen arviointi. Ei kaikkien Lite satunnaisgeneraattorien kattamista yhdellä rajatulla harjoituksella.

Ruudun cm/m ovat mallin annettuja pituuksia, eivät fyysisiä näyttömittoja. Oikea vastaus ei todista käytettyä reittiä, itsenäistä mittaamista, pysyvyyttä tai pinta-alan osaamista.

`families.ts`, registry index, kit.cases, moottorin tarkistus ja relevantit animaatiot luettu varsinaisesta lähteestä. Dynaamista SIMS-overlaytä ei näille kolmelle. Muiden KC:iden näihin kohteisiin osoittava tuki ei ole uusi kohdeperhe. Graafia, required/strong-suhteita, legacy-peliä tai jaettua tilaa ei muuteta. Ei riippumattoman tai ihmiskatselmuksen hyväksyntää kirjoittajan omista testeistä.

## Revision 2 — review corrections

Primary prompt and answer labels explicitly request a whole number in the GIVEN side unit. A converted equivalent length is not mathematically wrong; conversion/decimals are outside this bounded exercise. Frozen points/labels include every nested coordinate array, preventing accidental import mutation from changing the model while static SVG remains unchanged. Original r1 package and freeze receipt preserved externally.

## Authored stylesheet inclusion correction

Main found that declaring lesson.css does not load it. The authored body now contains its own declared local stylesheet link. The prior source composition manually injected a head link and masked this omission; that old QA is not evidence of authored CSS inclusion. Native author checks now require the body link, actual stylesheet request and computed styles. Old sources and receipts are preserved externally. No shared compiler/framework changes.
