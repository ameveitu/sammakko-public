# M-REP-04: todellinen Lite-yhteensovitus

NodeSpec.id `M-REP-04`, NodeSpec.rev AUDIT_REV=`audit1-2026-10-28`; registry CONTENT_REV=`lite181-2026-10-27`. Lähdetiedostojen täsmälliset tiivisteet lesson.json/alignment/sourceFiles-kentässä.

## Intro, tavoite, mallit, tehtävät, vihjeet, selitykset ja audit

{
  "objective": "Opit kirjoittamaan tilanteen lyhyesti numeroilla ja merkeillä.",
  "intro": "Aava records a thought briefly in numbers and signs.",
  "demo": [
    "signScene(kala,3,2,+): incoming objects, sign and equation",
    "pairScene(kivi,7,4,cmp): pairing then comparison sign",
    "translateScene: five = eight minus three, chunk by chunk"
  ],
  "families": {
    "add": "choose scene-matching equation; signScene(...,false) conceals operation/result notation",
    "compare": "choose a<b/a>b with Loikka first, a≠b; pairing model",
    "words": "choose symbolic version of more/less verbal comparison",
    "build": "build/fact addition or subtraction story, reusable number and sign tokens; max7",
    "transfer": "choose k×g for shell array; k=2..4,g=2..5 adjusted if equal"
  },
  "hints": [
    "add: initial/change/result",
    "compare: smaller value and sign tip",
    "words: larger/smaller and change",
    "build: first quantity, operation/change, equals/result",
    "transfer: row count and equal row size"
  ],
  "explanations": [
    "operation meaning plus arithmetic",
    "comparison direction",
    "explicit calculation for words",
    "build permits commuted addition",
    "transfer rows × row size"
  ],
  "audit": "LESSON_AUDIT: add must not reveal +; pairing replaces hard-to-compare static rows; translateScene and specific why/hint updates. Actual code includes build too.",
  "sourceContract": "sameFact checks a true equality with the same numeric/operator token bag; accepts swapped equation sides and commuted addition; it is not an unrestricted context-semantic judge."
}

## Perherekisterin ja ajonaikaisten kerrosten rajat

{
  "rule": "requires_relevant_content_symbol_knowledge",
  "assumed": [
    "M-SYM-PLUS",
    "M-SYM-MINUS",
    "M-SYM-EQUAL"
  ],
  "support": [
    "M-SYM-PLUS",
    "M-SYM-MINUS"
  ],
  "transferAssumed": [
    "M-MUL-01",
    "M-MUL-02"
  ],
  "limit": "Recognition and build token composition; no free-writing observation."
}

Manifestin target-kohtaisia coverage-overlays-rivejä näille3:lle ei ole. index.ts/GOALS/revOf ei muuta näiden perheitä; SIMS-mappi ei sisällä näitä tunnuksia. Kovat prerequisite_groups ovat tyhjät; kanoniset vahvat tuet ja dynaaminen M-REP-04-sääntö säilyvät. Tätä ei korvata atomi/mastery-väitteellä.

## Toteutuksen vertailu ja Opukselle kirjattu rajaus

Lite-rekisterin yleiset symbolioletukset plus/miinus/yhtäsuuruus kirjataan item-tasolle; päässä käytetään M-ADD-01 ja symbolit+,=, vähennyskierroksessa M-SUB-01 ja −. Ei required-graafimuutosta. Lite compare ja kertolaskusiirto ovat tämän rajatun ydinpolun ulkopuolella. sameFact-sopimuksen tavoin oikeat puolenvaihdot ja vaihdannainen summa kelpaavat. Myös6−4=2 hyväksytään saman kokonaisuuden/osan totena suhteena, eikä sitä väitetä tapahtumajärjestyksen kuvaukseksi.

COVERAGE.md ei ole ajantasainen näille: M-REP-04 lähteessä3 mallia ja5 perhettä, M-TH-04 lähteessä3 mallia ja5 perhettä (extend mukana), M-TH-07 lähteessä4 mallia ja6 perhettä (valid mukana). Tämä on lähdelukuhavainto, ei väite satunnaissiementen ajoista. Liteä tai sen audit-historiaa ei muokata.

## Näytön rajat

Tuttu sisältö ja symbolit ovat tehtäväkohtaisia oletuksia. Merkkipalojen bounded yhtälö ei osoita vapaata kirjoitustaitoa, laskutaidon riippumattomuutta tai yleistä esittämisen hallintaa. Kaksi rajattua sisältöesimerkkiä: 3+2=5 ja 6−2=4 sekä samojen lukujen ja tämän kierroksen laskumerkin kaikki todet yhtälömuodot. Pääpaletti vain numerot, + tai − ja =. Ei <,>,×-käyttöä, vapaata käsinkirjoitusta tai kaikkien esittämissisältöjen arviointia.

Kaikki mallit ja toiminnat ovat paikallisia, ei oppimistapahtumia tai pysyvää tilaa. Ihmiskatselmus ja pääajon riippumaton katselmus odottavat. Luonnostila säilyy. Pelilinkkien todentaminen ja koko690-verkon build/verify jäävät pääajolle.

## Omat tarkistukset

Ajettavat: `node lesson-network/packages/M-REP-04/tests.mjs` ja sama `--browser`. Testiharness koostaa vain omat lähteet, CSS:n ja PNG-viitteet muistiin; se ei tee yhteistä buildiä tai muuta records/site/shared-tilaa. Todelliset tulokset kirjataan vasta ajon jälkeen.

## Teknisesti jäädytettävä lähde, 2026-10-29

Kirjoittajan oma lähdeskeema/JS/CSS/resurssitiiviste- ja kanonisen roolin tarkistus läpäisty eristetyllä pakettikopiolla. Node-toimintalogiikka sekä Chromiumin390/1280 px rakentelu-, korjaus-, resurssi-, ohjainkoko-, ylivuoto-, tauko/alustus/dispose/remount- ja no-JS-tarkistukset läpäisty. Ruutukuvista tarkastettu omat kaaviot ja rakentelun esitys. Tämä ei ole riippumaton katselmus eikä ihmisvalidointi. Integroitu kuori tarkistetaan pääajossa tiedostolla lesson-network/production-browser-B03-foundation.mjs, jota ei ajettu ennen livebuildiä.

## Targeted independent-review correction — 2026-10-29

B03-FND-01: Actual token insertion replaces the expression verdict with neutral support feedback. Model-only steps retain the checked expression verdict. Real DOM correct5=2+3 → append5 displays5=2+3 5 with support; recheckretry → append2 returns support; model-only step keeps correct. All equivalent true forms retained. Author pure/schema/hash/lint and source-browser390/1280 checks passed. Original independent rejection remains historical evidence; this changed content requires targeted Hume rereview. No self-approval, integrated build, or human validation claimed.
