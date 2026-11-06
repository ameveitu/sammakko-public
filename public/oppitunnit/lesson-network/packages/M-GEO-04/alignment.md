# M-GEO-04 — Lite-yhteensovitus ja Opus-huomiot

NodeSpec M-GEO-04; CONTENT_REV lite181-2026-10-27; rev/validRevs audit1-2026-10-28. Muuttumaton Lite-lähde authority/production-181-v2/lite.

## Todelliset perheet
- `find`: choice: rotated shapes; notA excludes square/rectangle category collisions
- `name`: choice: name a drawn shape; inclusive labels not offered as mutually exclusive distractors
- `sort`: sort: triangles,squares,circles in varied rotations; absent from stale COVERAGE row
- `corners`: choice: corner counts0,3,4 with traceScene; no independent drawing evidence
- `transfer`: choice: identify nontriangle, either open boundary or one curved side; rotated/narrow triangles remain valid

## Demot ja rekisteri
geoanim.ts:traceScene
geoanim.ts:turnScene
parts.ts:shapeSvg/isA/notA
cases samples all named branches in guided/independent/retrieval; transfer uses separate branch; no guidedTags restriction.
GOALS supplies missing FRAC02 goal; GEO04 goal is explicit.
No SIMS overlay for either assigned KC.
No own DECL or scope coverage target rows; default choice/sort/place outcomes, empty assumed/supplied/coTaught/support/incidental; null dynamic rule.
Default registry does not establish canonical competence or justify task-context demands.
Auditin rivi 60 ilmoittaa tehty/korjattu. Historiallinen synteettinen itsekoe ei ole oppimisvaikuttavuuden näyttöä tai hyväksyntä tälle paketille. Funktionaalinen uusi perhe puuttuu vanhasta COVERAGE-taulukosta.

## Säilytetty, laajennettu ja korjattu
- Inclusive squares-as-rectangles relation and valid rotated/narrow triangles; open/curved-side nontriangle transfer.
- Property-based controlled trace/rotation and multiselection that includes squares among rectangles.
- Square requires equal sides AND right angles; a rhombus is an explicit nonexample.
- Circle tangent direction changes continuously, without sharp corners; do not copy no-turn caption.

## Täsmälliset lähdehuomiot
- thinking.ts name, guided seed14: “Neljä yhtä pitkää sivua: neliö.” Puuttuva kulmaehto korjataan omassa opetuksessa, ei Liteä muuttamalla.
- thinking.ts corners, guided seed30: kynän jokainen suunnanmuutos esitetään kulmana; geoanim.ts traceScene sanoo ympyrän kynän olevan kääntymättä. Oikea ero on terävä kulma vs tasainen kaarevuus.
- parts.ts isA/notA:n neliö⊂suorakulmio säilyy oikeana. Neliötä ei hylätä suorakulmioryhmästä.

## Kanoninen rooli ja rajat
Vuosiluokat 1-2; concept/atomic. Required-ryhmät säilyvät: [{"all_of": ["M-GEO-01"], "rationale": "v0.1:n required-esitiedot siirretty v0.2:ssa eksplisiittiseen AND-ryhmään."}]
Rajatut valmiit geometriset mallit; ei yleinen vapaiden käyttäjäpolygonien tunnistin.
Ei pinta-aloja, piirejä, koordinaatteja, kulmien astemittaa tai symmetrian arviointia.
Ruuturyhmittely ei todenna fyysistä rakentamista, itsenäistä piirtämistä, kaikkien kuvioiden tunnistamista tai pysyvää osaamista.
Valmiit tuet ja korostus eivät ole itsenäistä näyttöä.

Tekijä ei hyväksy omaa pakettiaan riippumattomasti. Toinen arvioija ja pääintegroija katselmoivat. Ei ihmistestausta, lapsihavaintoja tai julkisten oppilaspelireittien varmennusta.
