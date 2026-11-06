# M-TH-07: todellinen Lite-yhteensovitus

NodeSpec.id `M-TH-07`, NodeSpec.rev AUDIT_REV=`audit1-2026-10-28`; registry CONTENT_REV=`lite181-2026-10-27`. Lähdetiedostojen täsmälliset tiivisteet lesson.json/alignment/sourceFiles-kentässä.

## Intro, tavoite, mallit, tehtävät, vihjeet, selitykset ja audit

{
  "objective": "Find all possibilities systematically, without omissions.",
  "intro": "Keep one choice fixed while varying the others.",
  "demo": [
    "guessOutfitsScene:6 draws,4 unique outcomes of6,2 absent",
    "systemOutfitsScene:2 hats ×3 scarves, one fixed hat each row",
    "digitTreeScene([1,2,3]):2-digit numbers without repeated digit",
    "handshakeScene(4):unordered pairs and running3+2+1"
  ],
  "families": {
    "outfits": "numeric total for a,b=2..4; targeted whyAt for a+b and only one category",
    "digits": "choose missing valid2-digit string; different wrong reasons: repeated digit/already listed/foreign digit",
    "system": "choose named organised strategy; chance and a+b distractors",
    "valid": "sort six numeral strings into valid/invalid (two predicates)",
    "list": "combos: explicitly enumerate every hat/scarf pair once, dimensions2..3 each",
    "transfer": "numeric handshakes for3/4/5; targeted double count and first-person-only errors"
  },
  "hints": [
    "fix one shirt/hat, vary second category",
    "group by leading digit",
    "avoid omissions and repeats",
    "check allowed alphabet and no repeated digit",
    "first fixed hat then scarves",
    "list pairings without old pairs"
  ],
  "explanations": [
    "a×b after concrete combinations",
    "full ordered digit list",
    "why organisation covers all",
    "validity of each string",
    "all list pairs",
    "n−1+n−2+...+1"
  ],
  "audit": "LESSON_AUDIT:4 new time-based scenes; valid sort; differentiated whyAt. Actual6 families including transfer; coverage omits valid and undercounts models.",
  "sourceCaution": "guessOutfitsScene final caption generalises randomness too strongly: random searches can finish, but lack a completeness certificate unless checked. Phrase only the demonstrated incomplete search."
}

## Perherekisterin ja ajonaikaisten kerrosten rajat

{
  "rule": null,
  "coTaught": [
    {
      "kc": "M-MUL-01",
      "where": "explanation: rows × options"
    }
  ],
  "support": [
    "M-MUL-01"
  ],
  "limit": "Only list constructs the exhaustive combination set; other original families provide totals, classification or method recognition."
}

Manifestin target-kohtaisia coverage-overlays-rivejä näille3:lle ei ole. index.ts/GOALS/revOf ei muuta näiden perheitä; SIMS-mappi ei sisällä näitä tunnuksia. Kovat prerequisite_groups ovat tyhjät; kanoniset vahvat tuet ja dynaaminen M-REP-04-sääntö säilyvät. Tätä ei korvata atomi/mastery-väitteellä.

## Toteutuksen vertailu ja Opukselle kirjattu rajaus

Lite list on todellinen luettelointi, muut perheet eivät yksin osoita sitä. Tässä listan järjestystä ei automaattisesti lajitella. Siirto rakentaa järjestyksettömät yhteydet, koska pelkkä6-vastaus ei osoita niiden löytämistä. Satunnainenkin etsintä voi valmistua; ei toisteta source guessOutfitsScene -loppukuvatekstin liiallista yleistystä.

COVERAGE.md ei ole ajantasainen näille: M-REP-04 lähteessä3 mallia ja5 perhettä, M-TH-04 lähteessä3 mallia ja5 perhettä (extend mukana), M-TH-07 lähteessä4 mallia ja6 perhettä (valid mukana). Tämä on lähdelukuhavainto, ei väite satunnaissiementen ajoista. Liteä tai sen audit-historiaa ei muokata.

## Näytön rajat

Täydellinen lopputulos ei yksin osoita käytettyä hakustrategiaa. Annettu matemaattinen joukko tarkistetaan, ei prosessiroolin yleistä hallintaa tai siirtovaikutusta. Kaksi pohjaa ja kolme kuviota: kuusi eri paria, mikä tahansa lisäysjärjestys, poisto ja kohdennettu pyydetty hakuvihje. Siirtotehtävä rakentaa kaikki neljän nimetyn rastin6 järjestyksetöntä yhteyttä. Kertolaskua ei vaadita; ei numeropuu- tai kolmannen valintajoukon pakkoa.

Kaikki mallit ja toiminnat ovat paikallisia, ei oppimistapahtumia tai pysyvää tilaa. Ihmiskatselmus ja pääajon riippumaton katselmus odottavat. Luonnostila säilyy. Pelilinkkien todentaminen ja koko690-verkon build/verify jäävät pääajolle.

## Omat tarkistukset

Ajettavat: `node lesson-network/packages/M-TH-07/tests.mjs` ja sama `--browser`. Testiharness koostaa vain omat lähteet, CSS:n ja PNG-viitteet muistiin; se ei tee yhteistä buildiä tai muuta records/site/shared-tilaa. Todelliset tulokset kirjataan vasta ajon jälkeen.

## Teknisesti jäädytettävä lähde, 2026-10-29

Kirjoittajan oma lähdeskeema/JS/CSS/resurssitiiviste- ja kanonisen roolin tarkistus läpäisty eristetyllä pakettikopiolla. Node-toimintalogiikka sekä Chromiumin390/1280 px rakentelu-, korjaus-, resurssi-, ohjainkoko-, ylivuoto-, tauko/alustus/dispose/remount- ja no-JS-tarkistukset läpäisty. Ruutukuvista tarkastettu omat kaaviot ja rakentelun esitys. Tämä ei ole riippumaton katselmus eikä ihmisvalidointi. Integroitu kuori tarkistetaan pääajossa tiedostolla lesson-network/production-browser-B03-foundation.mjs, jota ei ajettu ennen livebuildiä.

## Targeted independent-review correction — 2026-10-29

B03-FND-03: Both record checkers first require an array with at most six entries, every numeric index an own populated canonical string. Holes, undefined, extra slots, nonarrays, unsupported/prototype-name values and inherited-only entries cannot pass. Exact five links plus length6 hole and allPairs plus length7 hole reject. Both checkers reject17 malformed shapes each and still accept full forward/reverse dense lists. Existing720 pair permutations, all bounded subsets, duplicate and endpoint-order checks preserved. Author pure/schema/hash/lint and source-browser390/1280 checks passed. Original independent rejection remains historical evidence; this changed content requires targeted Hume rereview. No self-approval, integrated build, or human validation claimed.
