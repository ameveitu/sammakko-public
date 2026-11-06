# M-TH-04: todellinen Lite-yhteensovitus

NodeSpec.id `M-TH-04`, NodeSpec.rev AUDIT_REV=`audit1-2026-10-28`; registry CONTENT_REV=`lite181-2026-10-27`. Lähdetiedostojen täsmälliset tiivisteet lesson.json/alignment/sourceFiles-kentässä.

## Intro, tavoite, mallit, tehtävät, vihjeet, selitykset ja audit

{
  "objective": "Notice how a pattern repeats or grows, and continue it.",
  "intro": "Aava makes stone and shell rows.",
  "demo": [
    "ABB repeated twice, then next A; patternScene",
    "ABC,ABC,A partial unit, then B; patternScene",
    "growScene(2,2): old figure retained plus two new dots"
  ],
  "families": {
    "repeat": "choose next shape, at least2 unit repeats plus partial phase",
    "extend": "construct3 next pictures in palette, position-specific why, empty/replace possible",
    "grow": "arithmetic sequence s=1..5,d=2..5; choose fifth term",
    "dots": "growing visual s=1..3,d=2..3; choose next total",
    "transfer": "given ABB rule; identify erroneous position in9 symbols; bad index3..8"
  },
  "hints": [
    "find repeat unit and phase",
    "construct from the remaining partial unit",
    "identify increment, not automatically +1",
    "new dots show increment",
    "transfer: walk in groups of3"
  ],
  "explanations": [
    "unit and next element",
    "specific target for each of3 slots",
    "last+d, not extra step",
    "new-dot count",
    "repair exact wrong phase"
  ],
  "audit": "LESSON_AUDIT repeating/growing section: bracket unit, show additions, add extend; why differs by phase and growth error. Coverage is stale: omits extend and retains old revision.",
  "animationReading": "patternScene lays items/brackets full and partial units; reveal=false hides next. growScene keeps old dots and colours new; reveal=false last figure becomes ?."
}

## Perherekisterin ja ajonaikaisten kerrosten rajat

{
  "rule": null,
  "declarations": "No per-node/wildcard/family DECL override; generic choice/extend outcomes.",
  "support": [
    "M-TH-01 (canonical strong process_support)"
  ]
}

Manifestin target-kohtaisia coverage-overlays-rivejä näille3:lle ei ole. index.ts/GOALS/revOf ei muuta näiden perheitä; SIMS-mappi ei sisällä näitä tunnuksia. Kovat prerequisite_groups ovat tyhjät; kanoniset vahvat tuet ja dynaaminen M-REP-04-sääntö säilyvät. Tätä ei korvata atomi/mastery-väitteellä.

## Toteutuksen vertailu ja Opukselle kirjattu rajaus

Lite repeat/extend/grow/dots opettavat monia jatkoja, siirto etsii virhekohtaa järjestyslukuna. Tässä lapsi rakentaa/korjaa omat3 kuvapaikkaansa ilman kohteiden nimeämistä; toinen konstruktio lisää pisteitä. ABB:n yhtä pidempi toistuva lohko on myös kelvollinen kuvailu, eikä lyhintä jaksoa vaadita.

COVERAGE.md ei ole ajantasainen näille: M-REP-04 lähteessä3 mallia ja5 perhettä, M-TH-04 lähteessä3 mallia ja5 perhettä (extend mukana), M-TH-07 lähteessä4 mallia ja6 perhettä (valid mukana). Tämä on lähdelukuhavainto, ei väite satunnaissiementen ajoista. Liteä tai sen audit-historiaa ei muokata.

## Näytön rajat

Tämä tarkistus koskee sovittua toistoa ja +2-kasvua; äärellinen alku ei määritä ainoaa ääretöntä sääntöä. Mallissa annetaan lukumääriä ja kuusi vanhaa pistettä kopioituna. AB:n konkreettinen aloitus ja ABB:n kahden kokonaisen sekä yhden osittaisen jakson jatkaminen kolmella kuvalla. Muokattava oma jatko korvaa erillisen valmiin virherivin tehtävän. Kasvu: mallin2,4,6 jälkeen kuusi vanhaa kopioituna ja omien uusien pisteiden lisääminen/poisto; tavoite2 uutta. Avoimet muut säännöt jäävät opettajan keskusteluun.

Kaikki mallit ja toiminnat ovat paikallisia, ei oppimistapahtumia tai pysyvää tilaa. Ihmiskatselmus ja pääajon riippumaton katselmus odottavat. Luonnostila säilyy. Pelilinkkien todentaminen ja koko690-verkon build/verify jäävät pääajolle.

## Omat tarkistukset

Ajettavat: `node lesson-network/packages/M-TH-04/tests.mjs` ja sama `--browser`. Testiharness koostaa vain omat lähteet, CSS:n ja PNG-viitteet muistiin; se ei tee yhteistä buildiä tai muuta records/site/shared-tilaa. Todelliset tulokset kirjataan vasta ajon jälkeen.

## Teknisesti jäädytettävä lähde, 2026-10-29

Kirjoittajan oma lähdeskeema/JS/CSS/resurssitiiviste- ja kanonisen roolin tarkistus läpäisty eristetyllä pakettikopiolla. Node-toimintalogiikka sekä Chromiumin390/1280 px rakentelu-, korjaus-, resurssi-, ohjainkoko-, ylivuoto-, tauko/alustus/dispose/remount- ja no-JS-tarkistukset läpäisty. Ruutukuvista tarkastettu omat kaaviot ja rakentelun esitys. Tämä ei ole riippumaton katselmus eikä ihmisvalidointi. Integroitu kuori tarkistetaan pääajossa tiedostolla lesson-network/production-browser-B03-foundation.mjs, jota ei ajettu ennen livebuildiä.

Regressio: checkContinuation vaatii tiheän kolmen paikan taulukon, hylkää extra/malformed/holes/unsupported-arvot ja virheellisen sääntö-/vaihemäärityksen. Kaikki3 oikeaa paikkaa ja vaiheeseen sopiva pidempi toistuva lohko kelpaavat.

## Targeted independent-review correction — 2026-10-29

B03-FND-02: Erasing a populated repeat slot replaces only repeat feedback with neutral support. Support/model changes do not erase checked answer feedback. Real DOM correct round/angular/round → erase active third slot yields empty third and support; checked wrong angular → erase yields support; refill restores correct; support-only toggle keeps verdict. Author pure/schema/hash/lint and source-browser390/1280 checks passed. Original independent rejection remains historical evidence; this changed content requires targeted Hume rereview. No self-approval, integrated build, or human validation claimed.
