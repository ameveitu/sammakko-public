Nykyinen tuotantovaltuutus: käyttäjä antoi 181 oppitunnin tuotantopromptin Phase1.1:n jälkeen. Katso PRODUCTION_181_RESUME.md ja authority/production-181-v2/SOL_181_LESSON_PRODUCTION.txt. Alla oleva Phase1.1:n odotus kuvaa historiallista lähtötilannetta. Tuotantopaketteihin hyväksytään vain tarkasti valitut181; muut509 pysyvät pohjina. Jaetut hahmo-PNG:t ovat shared/-hakemistossa, paikallinen CSS sallitaan ilmoitettuna resurssina ilman ulkoisia riippuvuuksia. Verkkolähteet annetaan research-tietueissa.

# Phase 1.1: yhden KC-paketin kirjoitus ja päivitys

Nykyinen käyttäjätehtävä todentaa teknisen sisääntulon. Varsinainen 181 oppitunnin tuotanto odottaa käyttäjän erillistä tuotantopromptia. Muut 509 pysyvät sivupohjina. Mukana olevat kaksi testipakettia eivät opeta KC:iden aiheita.

## Lähdeomistus ja sopimus

Kirjoita `lesson-network/packages/<kanoninen-KC>/lesson.json` ja sen viittaamat tiedostot. `records/`, `checkpoints/` ja `site/` ovat johdettuja: niiden käsin muokkaaminen ei ole tuettu kirjoitusreitti. `derived-records.json` havaitsee tietueisiin tehdyt muutokset ja pysäyttää rakennuksen säilyttäen muokatun tiedoston. Säilytä muutos lähdepaketissa ennen johdetun tietueen palauttamista.

JSON sisältää täsmälleen seuraavat avaimet:

- `schemaVersion: 1`, `kcId` (hakemiston nimi ja kanoninen tunnus), `revision` (positiivinen kokonaisluku/numerojono).
- `state: draft` oikeille myöhemmille luonnoksille. `technical_fixture` sallitaan vain `fixtures/`-hakemistossa ja erillisessä testirakennuksessa.
- `body`: paikallinen HTML-fragmentti. `module`: paikallinen itsenäinen ES-moduuli tai `null`.
- `assets`: `{path, sha256}`-tietueiden lista. Fragmentin kuvat/linkit osoittavat näihin paikallisiin resursseihin tai fragmenttitunnuksiin. Kuviin kuuluu tekstivastine. Ei ulkoisia resursseja, inline-skriptejä, tapahtumakäsittelijöitä tai dokumentin runkotageja. Näillä rajoilla ei vielä toteuteta verkkolähdelinkkejä; lähde-URL:t kuuluvat `research`-tietueisiin.
- `research`: lähdetietueiden lista (tyhjä ei-opetuksellisissa testeissä).
- `reviews`: `{kind, state, revision, note}`-historia. `kind` on `content|human|alignment`, tila `pending|reviewed|not_applicable|unknown`. Vain täsmälleen nykyistä sisältöversiota koskeva tietue on voimassa; vanha historia säilyy `stale`-tilassa.
- `alignment`: lähdebuildin, tehtäväperheiden ja yhteensovitusrajojen tietue; `planning`: kirjoittajan suunnittelutiedot; `extensions`: eksplisiittiset omat lisäkentät. Nämä säilyvät kokonaisina. Tuntematon ylimmän tason avain hylätään täsmällisellä virheellä.

Sisältöversio on `revision@SHA256`; tiiviste kattaa koostamisen lähteet, tutkimuksen, suunnittelun, yhteensovituksen ja resurssit. Katselmushistoria on erillinen, jotta sen lisääminen ei luo kehäriippuvuutta. Nosta revision-lukua muokatessasi sisältöä; myös unohtunut korotus muuttaa tiivistettä eikä peri hyväksyntää. Rakennus ei myönnä pedagogista, ihmisen, oppilasjakelun tai julkaisun hyväksyntää. Kaikki tuetut tuotantopaketit ovat tässä sopimusversiossa luonnoksia; myöhempi hyväksymispolitiikka täytyy toteuttaa erikseen.

## Tekninen kokeilu

Kopioi malliksi `fixtures/M-ALG-08/` staattiselle paketille tai `fixtures/M-SCALE-02/` vuorovaikutukselle. Testeissä käytetään olemassa olevia KC-tunnuksia. Älä siirrä testimerkkejä tavalliseen tuotantolähteeseen.

```sh
npm ci
node lesson-network/build.mjs
node lesson-network/verify.mjs
LESSON_FIXTURES=1 node lesson-network/build.mjs
node lesson-network/test-ingestion.mjs
node lesson-network/test-game-actions.mjs
python3 -m http.server 4191 --bind 127.0.0.1 --directory lesson-network
# toisessa terminaalissa:
node lesson-network/browser-phase1_1.mjs
```

Avaa normaali `http://127.0.0.1:4191/site/` tai erillinen `http://127.0.0.1:4191/fixture-preview/site/lessons/M-ALG-08.html`. Vuorovaikutustesti on M-SCALE-02. Tarvittaessa asenna Chromium: `npx playwright install chromium`.

Lisää paketti → rakenna → tarkastele → muokkaa body.html:ää/revisionia → rakenna uudelleen → tarkista. Muuttumattomien KC-sivujen tavut ja muokkausajat säilyvät. Yhteisen kuoren muutos saa muuttaa kaikkia sivuja. Testi todentaa tämän 689 muun sivun vertailulla, kahdella uusintarakennuksella, uuden paketin lisäyksellä sekä väärän tunnuksen, puuttuvan kuvan ja ylimääräisen kentän virheillä.

## Moduuliraja

Valinnainen moduuli viedään vain oman KC:n `site/content/<KC>/`-hakemistoon. Jaettu loader tuodaan vain moduulia tarvitsevalle sivulle. Moduuli vie `mount(host)`-funktion, joka palauttaa `pause()`, `resume()`, `reset()` ja `dispose()`. Moduuli omistaa luomansa kuuntelijat, ajastimet ja piirtosilmukat ja poistaa ne disposessa. Loader välittää dokumentin näkyvyystilan, pysäyttää poistuttaessa ja lataa bfcache-palautuksessa uuden dokumentin turvallista mountia varten. Reset ei saa asentaa uutta kuuntelijaa. Ensimmäinen sopimus vaatii itsenäisen moduulin ilman import-riippuvuuksia; tuleva WebGL voidaan niputtaa tätä rajaa käyttäväksi moduuliksi vasta perustellussa tehtävässä.

## Virheet ja viimeinen toimiva tuloste

Rakennus koostaa kaiken erillisessä väliaikaishakemistossa ja suorittaa koko verkon tarkistuksen ennen julkaisua. Virhe ei korvaa viimeisiä toimivia sivuja. `build-status.json` kertoo epäonnistumisesta ja vanhan tulosteen säilymisestä; vanhan sivun aiempi tarkistus ei väitä uutta virheellistä lähdettä toimivaksi. Onnistuneessa julkaisussa tiedostot vaihdetaan atomisesti yksi kerrallaan; tämä ei ole usean tiedoston käyttöjärjestelmätason transaktio sähkökatkoa vastaan. Uusinta korjaa kesken jääneen julkaisun. `LESSON_BATCH_LIMIT` on vanha tekninen sisäinen probe eikä osittaisen tulosteen julkaisuvaltuutus: julkaisuraja vaatii koko verkon tarkistuksen.

## Paketti

`python3 lesson-network/export.py` tuottaa Phase1_1 ZIP:n. Se sisältää tämän alijärjestelmän lähteen, normaalin verkon ja erillisen testiesikatselun. Alkuperäiset peli-/kanoniset aineistot ovat mukana vain säilytettyinä inventoinnin lähteinä. Gitin puuttuessa vienti käyttää alkuperäisen `EXPORT_MANIFEST.json`:n lähderevisiota ja merkitsee alkuperän eksplisiittisesti; ylemmän vieraan Git-repositorion HEAD ei kelpaa. Vanhaa revisiota ei väitetä uuden itsenäisen muokkauksen Git-commitiksi.
