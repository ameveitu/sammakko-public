# Lite-yhteensovitus: M-NUM-14

{
  "source": "src/content/measure.ts443–492",
  "nodeRevision": "audit1-2026-10-28",
  "validRevs": [
    "audit1-2026-10-28"
  ],
  "ownGoal": false,
  "effectiveGoalSource": "src/content/goals.ts20 filled by index.ts n.goal??=GOALS[n.id]",
  "goal": "Opit, että mittaustuloksen luku kertoo, montako mittapalaa esine on.",
  "intro": "Kun mittaat, luku kertoo, kuinka monta palaa pitkä esine on.",
  "reward": "Osaat kertoa mittauksen luvulla! — not adopted as a mastery claim",
  "demos": [
    "layScene(6): same-sized pieces laid and counted; record 6 palaa.",
    "twoUnitScene(6,2): same ribbon6small/3big; compare numeral and unit."
  ],
  "families": [
    {
      "tag": "read",
      "kind": "choice",
      "domain": "n2..9; near(r,n,2,1,10)",
      "premise": "unitsArt(n) complete row under ribbon",
      "hintExplainFeedback": "Count pieces under ribbon; numeral n; too few pieces omitted vs too many counted twice."
    },
    {
      "tag": "make",
      "kind": "choice",
      "domain": "n3..8; near(r,n,2,2,9)",
      "premise": "Choose one of three already drawn ribbons matching stated count.",
      "hintExplainFeedback": "Count shown pieces; alternatives report their actual counts. Does not demonstrate constructing a measurement."
    },
    {
      "tag": "unit",
      "kind": "choice",
      "domain": "small4/6/8, big2/3/4, second unit twice pitch",
      "premise": "Same ribbon measured twice with different unit sizes, not two separate lengths.",
      "hintExplainFeedback": "Same ribbon; larger numerical result from smaller units does not imply longer ribbon."
    },
    {
      "tag": "transfer",
      "kind": "choice",
      "domain": "a3..9,b=a+(-3,-2,2,3), b0..12",
      "premise": "Two named sticks expressed in pieces; hint supplies same-sized pieces.",
      "hintExplainFeedback": "Compare counts only with common equal unit. Affected endpoints include b0; avoid literal nonzero physical stick of length0 in new examples."
    }
  ],
  "media": [
    "measureanim.ts layScene and twoUnitScene fully read/extracted.",
    "measure.ts twoUnitArt fully read; kit.unitsArt static source read.",
    "Piece glyphs inset2 at each end; decorative gaps and rendered widths do not precisely double although unit pitches do. New diagrams will explicitly abut unit boundaries and keep whole length fixed."
  ],
  "audit": "LESSON_AUDIT286–289: old one static demo replaced by two animations and unit family. COVERAGE56/244/655–657 omit unit, say1demo, old global rev. Historical browser/mastery claims are not imported approvals.",
  "registry": "Explicit own AUDIT_REV. GOALS fallback only for goal. Actual index no SIMS target for14. No explicit families.ts target/wildcard or actual graph.coverage row; dynamic null. Ordinary3families available guided/independent/retrieval; separate transfer."
}

## Toteutus

Luvun kirjaus itsenäiseen kenttään ja mittapalan valinta, jolloin merkintä muodostuu luvusta ja valitusta palasta. Koko mittaus näkyy aina ennen vastaamista. Vaihtoehtoinen laskuapu näyttää numeroita, ei vaadi laskentapainalluksia. Kaikki palat näkyvät koko ajan.

## Vertailu ja rajat

read ja make ovat Litessä kuvan/lukumäärän valintoja; oma harjoitus kirjoittaa luvun ja esittää mittapalan. unit säilyy saman nauhan6small/3big esimerkkinä ja valintana. Transfer samankokoisilla paloilla4vs7 selitetään, ei väitetä erilliseksi fyysiseksi vertailukokeeksi.

Tuettu annetun mallin mittausmerkintä ei todista fyysistä latomista, todellista pituuden mittaamista, itsenäistä laskentastrategiaa, muistamista tai pysyvää osaamista. Standalone ei luo formaalia prosessirubriikkia, henkilöhistoriaa tai pelihallintaa.

## Korjattu tai rajattu

Mittapalojen varsinaiset rajat ovat täsmälleen vastakkain, toisin kuin Liten dekoratiivisesti sisennetyt palaglyfit. Saman nauhan päätepisteet säilyvät mittapalan vaihtuessa, ja ison palan leveys on täsmälleen kaksi pientä. Positiiviset nauhat; ei Liten siirtogeneraattorin nollapalan fyysistä keppiä. M-MEAS-01 jää vahvaksi tueksi, ei lisäportiksi.

Varsinainen Lite, graafi, AND/OR-ryhmät, required/strong-suhteet, legacy-peli ja jaettu tila jäävät muuttumattomiksi. Tarkka NodeSpec, perheiden vihjeet/selitykset, demo/siirtogeneraattori ja immutable-lähdetiivisteet ovat tämän paketin lesson.json alignment-tietueessa; alkuperäiset authority/production-181-v2/lite-polussa. Audit/COVERAGE ovat aiempia väitteitä, eivät tämän sisällön hyväksyntää. Täsmällinen nykyinen katselmointi on erillinen.
