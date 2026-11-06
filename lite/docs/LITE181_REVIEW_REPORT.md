# Lite 181: katselmuskorjaukset, hahmot ja Lentopaja – raportti

Päivitetty 29.10.2026. Uusin kierros: [Katselmus 2](#katselmus-2-29102026). Ensimmäisen kierroksen ohje: `prompts/OPUS_LITE_181_REVIEW_FIX_AND_SPRITES.txt` (Sol 181 handover v2).

## Toistettavuus

- Haara `lite-mvp-177`. Lähtökohta `7fbf29d` (auditointikierros 181). Tämän työn commitit: `e9847af`, `f9ffdc5`, `b50bc52`, `4dcca20`, `b6b5531`, `5c6773c` ja tämä raportti.
- Laajuus: 181 noodia. `CONTENT_REV` `lite181-2026-10-27`, `AUDIT_REV` `audit1-2026-10-28`, `REVIEW_REV` `review1-2026-10-29`, `MOTION_REV` `motion1-2026-10-27`.
- Ei remotea, ei pushattu, ei julkaistu.

## Testit (ajettu `5c6773c`:ssä)

```
npx tsc --noEmit                → OK
npx vitest run                  → Test Files 18 passed | 1 skipped (19)
                                  Tests 1633 passed | 1 skipped (1634)
npm run build                   → OK (vain chunk-kokovaroitus)
```

Tämän kierroksen sweep tehtiin väliaikaisella testillä, joka ajoi vain nimetyt noodit (59 noodia). Se on korvattu pysyvällä `tests/sweep.test.ts`:llä, joka ajaa oletuksena kaikki 181 noodia. Ks. Katselmus 2.

## Katselmuksen kohdat

| Kohta | Tila | Missä |
|---|---|---|
| L181-01 M-PLACE-05 kaatuu luvulla 7777 | korjattu | e9847af, tests/review181 |
| L181-02 samanarvoiset vaihtoehdot (M-TH-08, M-SYM-MINUS) | korjattu | e9847af |
| L181-03 liikeoppitunnit alkavat yhteisellä soittimella | korjattu osittain: demot kyllä, kertauksen kuvaaja–tapahtuma-parit avoinna | e9847af |
| L181-04 soikio kaarenpituudella, 10× merkitty | korjattu | e9847af |
| L181-05 testiajo kirjataan vasta loppuun soitettuna | korjattu | e9847af |
| L181-06 tuottamissääntö kuudessa oppitunnissa | korjattu (REVIEW_REV) | e9847af |
| L181-07 kattavuustunnistimet | osittain: kaksoispistejako, koordinaatit, annetut faktat; ei kaikkia | f9ffdc5 |
| L181-08 ensimmäinen migraatio säilyttää palkinnot | korjattu | f9ffdc5 |
| L181-09 aikuisen suhdeluku vain tuoreista | korjattu | e9847af |
| L181-10 ohjattu vastaus ei ole suora tehtävä | korjattu | f9ffdc5 |
| L181-11 testaajatila lukee vain omat tapahtumat | korjattu | f9ffdc5 |
| L181-12 yhteinen tallennusilmoitus pajassa ja lennossa | korjattu | f9ffdc5 |
| L181-13 saapumisajat ovat oikeita kellonaikoja | korjattu | f9ffdc5 |
| L181-14 M-TH-02 kuviot samassa mittakaavassa | korjattu | f9ffdc5 |
| L181-15 SPEED-REARR sekuntikello | korjattu | e9847af |
| Sweep M-TH-08, M-GEO-04, M-TH-02 | korjattu | 5c6773c |
| Rakennustehtävän laatat lukittuvat näkyvästi Valmis-painalluksen jälkeen | korjattu | 5c6773c |

M-TH-08:n ja M-TH-02:n muutokset koskevat vain palautetta, joten `rev` pysyi. M-GEO-04:n kulmatehtävän väärät vaihtoehdot muuttuivat, mutta oikea vastaus ja tehtäväperhe eivät. `rev` pysyi `AUDIT_REV`:nä. Jos Sol haluaa erottaa vastaukset tarkemmin, se vaatii uuden `rev`-arvon.

## Hahmot pelissä (b50bc52, 4dcca20)

- Aava (keltainen ankanpoikanen) ja Loikka (sininen sammakko) ovat PNG-kuvina (`public/characters/`) esittelyissä, kehuissa, kisaradoilla ja lentäjän apuna.
- Sulka on yhä SVG eikä käytä Aavan kuvaa.
- Lisenssi on omistajan päätös (`docs/characters/CREDITS.md`).
- Tallennukset: jokainen yritys kirjaa `rev`-arvon. Vanhat revisiot pysyvät voimassa `validRevs`-listan kautta. Testit: tests/review181, tests/race.

## Selainreitit (sisäinen selainpaneeli, dev-palvelin)

| Reitti | Mobiili | Työpöytä | Tila |
|---|---|---|---|
| Laskeminen (Laskuloru, M-NUM-01, väärä vastaus, tukitarjous, tukiretki ja paluu) | ajettu | ei ajettu | toimii |
| Aika (M-TIME-03, yhteinen soitin, loppu 4 s, Aava-PNG) | ajettu | ei ajettu | toimii |
| Fysiikka (PHY79-DIST-TIME: välinevalinta ja viivain 10 m) | ajettu | PHY79-SPEED-CONCEPT ajettu | toimii |
| Loikka (rehellinen hyppyvahvistus, ohitetut merkitty päätellyiksi ☆) | ajettu | ei ajettu | toimii |
| Tuet (kaksi virhettä → "Yritä uudelleen avun kanssa", Tukiretki-banneri, "Palaa nyt") | ajettu | ei ajettu | toimii |
| Lento (Aava kyydissä, apulaisen repliikit vaihtuvat) | ei ajettu tällä kierroksella | ajettu | toimii |
| Rantakisa 18 m (arvausvaihtoehdot, väliajat Loikka 6 s, Aava 9 s) | aiempi istunto | ajettu | toimii, ks. avoimet |
| Tallennus (5 yritystä revisioineen säilyy uudelleenlatauksessa, aikuisen näkymä) | ajettu | ei ajettu | toimii |

Kuvakaappaukset: `qa/journeys/`, `qa/lentopaja/`.

Paneeli raportoi sivun piilotetuksi, joten liikesoitin pysähtyy suunnitellusti ("Tauko: sivu oli piilossa."). Loppuasennot tarkistettiin "Näytä loppu" -painikkeella. Reaaliaikaista toistoa ei voinut todentaa.

## Katselmus 2 (29.10.2026)

Lähde: `Sammakko_Lite_181_Uusin_katselmus.zip` (SHA-256 `06c563a323e168b30f34d5694f7a1ee2a8421ba4c857b33d2709042010d292fe`), katselmoitu lähde `d8f8495`. Katselmuksen koetinskriptejä ei ajettu; löydökset toistettiin omilla testeillä ja selainajoilla.

Revisiot: uusi `REVIEW2_REV` `review2-2026-10-29`. Sen saivat M-GEO-04, M-TH-02, M-TH-08, M-PLACE-05 ja kuusi tuottamisoppituntia. Kaikki vanhat revisiot pysyvät `validRevs`-listassa. `CONTENT_REV` ei muuttunut.

| Kohta | Arvio | Tila | Toteutus | Testi |
|---|---|---|---|---|
| U01 paljastettu vastaus laskettiin itsenäiseksi | aiheellinen | korjattu | Peitetyn kellon avaus kirjaa `help: ['reveal']`; oikea vastaus on neutraali (ei putkeen, ei suhdelukuun). Lapselle näytetään huomautus ja Jatka-painike. Liikedemo kysyy ensin, vastaus seuraavalla sivulla. | review2 U01, selain |
| U02 tunnistaminen luettiin kirjoittamiseksi | aiheellinen | korjattu | Tuottamisperheet kavennettu: build, record, list, column/transfer. translate, parts, outfits ja step ovat tunnistamista. Sääntö koskee REVIEW2_REV-vastauksia. | review2 U02, review181 L181-06 |
| U03 myöhempi tuotos ei päivittänyt vanhaa tarkistusta | aiheellinen | korjattu | Tuotos lasketaan myös tarkistuksen jälkeen. Aikuinen näkee "tarkistettu tunnistamalla", kunnes tuotos nähdään; harjoittelu ohjaa tuotostehtävään. | review2 U03, selain |
| U04 koevihko ei näyttänyt juuri ajettua koetta | aiheellinen | korjattu | Vihko päivittyy heti testiajon jälkeen. | selain |
| U05 "Vedä" ei toiminut nopealla vedolla | aiheellinen | korjattu | Vetokuuntelijat ikkunatasolla; napautus–napautus toimii yhä. | selain (M-TH-08) |
| U06 parit: kaksi korttia sopi samaan paikkaan | aiheellinen | korjattu | M-TH-08 arpoo uudelleen, kunnes jokainen kortti sopii vain omaan paikkaansa. M-PLACE-05:n harhautuskortit ovat erilaisia. | review2 U06 (4000 siementä riippumattomalla tarkistimella) |
| U07 koko testinäyttö ei ollut toistettavissa | aiheellinen | korjattu | `tests/sweep.test.ts` ajaa kaikki 181 noodia normaalissa ajossa; tyhjä `NODE_IDS` on virhe. Väliaikaiset zz-testit poistettu. | sweep |
| U08 sisältöversio vs. tehtävän toistettavuus | aiheellinen | korjattu | `rev` = toistotunniste, `validRevs` = näytön voimassaolo. `tests/item-manifest.json` tallentaa tehtävien tiivisteet; testi kaatuu, jos tehtävät muuttuvat ilman uutta `rev`-arvoa. M-MEAS-08:n satunnainen SVG-tunniste tehtiin deterministiseksi. | item-manifest, review2 U08 |
| Aloitus: Lentopaja vs. aiheet | aiheellinen | korjattu | Aloitusnäytössä kaksi valintaa: "Rakenna Aavan kanssa" ja "Valitse aihe". | selain |
| Lentopaja mobiilissa | aiheellinen | korjattu | Mittaustilassa navigointi ja ohjeet piiloon; 390 px:ssä ohjaimet 397 px:n kohdalla (ennen n. 1150 px). Kisaan "Lopeta kisa". | selain |
| Opettajan suora linkki KC:hen | – | ei toteutettu | Reittiä ei ole, eikä syntaksia keksitty. Avoin integraatiokohta Solin kanssa. | – |

Testit (ajettu tämän commitin lähteellä):

```
npx tsc --noEmit                → OK
npx vitest run                  → Test Files 18 passed | 1 skipped (19)
                                  Tests 1827 passed | 1 skipped (1828)
npm run build                   → OK (vain chunk-kokovaroitus)
npx vitest run tests/sweep.test.ts
  181 noodia × 100 siementä × 4 vaihetta, 0 kovaa virhettä
  laatuliput (tests/sweep-baseline.json, 63 noodia; saa vähentyä, ei kasvaa):
  nohint 5509, choice-nowhy 1519, nowhyAt 3403, multi-nowhy 334, deadWhyAt 70
```

`deadWhyAt` tarkoittaa virhepalautetta, joka on avainnettu oikeaan vastaukseen eikä siksi koskaan näy (8 noodia: M-ADD-100, M-ADD-SUB-01, M-DEC-DECOMPOSE, M-MULTAB-ALL, M-MULTAB-HIGH, M-SUB-20, M-SUB-FACT-10, M79-INT-ADD). Ei vaikuta tarkistukseen; tekstit avoinna.

Selainreitit (sisäinen selainpaneeli, dev-palvelin; kuvat `qa/review2/`):

| Reitti | Leveys | Tila |
|---|---|---|
| Aloitus, kaksi valintaa | 390 | ajettu, toimii (01) |
| Rantakisa 6 m, mittaustila, Lopeta kisa | 390 | ajettu, toimii (02) |
| Testiajo: ei kirjausta ennen ajoa, 5 m/s → 4 s, tuplakirjaus estetty, vihko heti | 390 | ajettu, toimii (03) |
| Liikedemo: sivu 1 kysyy, sivu 2 vastaa | 390 | ajettu, toimii (04) |
| PHY79-SPEED-REARR: paljastus neutraali, huomautus ja Jatka, aikuisella "3 ei laskettu" | 390 | ajettu, toimii (05) |
| M-TH-08 parit vetämällä ja napauttamalla | 390 | ajettu, toimii (06) |
| Vanha AUDIT_REV-tarkistus → "tarkistettu tunnistamalla" → harjoittelu ohjaa rakentamiseen → "tarkistettu ★" | 390 | ajettu, toimii |
| Ohjattu runko (M-NUM-01), reitti 'guided' vihkoon | 390 | ajettu, toimii |
| Rantakisa 12 m arvaus ja vertailu | 1280 | ajettu, toimii (07) |
| Lento vain pelitilaan; vanhat 177-palkinnot ja testaajaerottelu | – | ei ajettu selaimessa; kattavat tests/game.test.ts ja staattinen tarkistus |

Avoimet tämän kierroksen jälkeen:

1. Opettajan suora KC-linkki: toteutettu Katselmus 3:ssa (V4-03).
2. `deadWhyAt`-tekstit 8 noodissa.
3. Lapsen kartta näytti "⭐ Tarkistettu: osasit itse" myös tunnistamalla tarkistetulle: korjattu Katselmus 3:ssa.
4. Lento ja 177-migraatio ajettu vain testeillä tällä kierroksella.
5. Ensimmäisen kierroksen avoimet kohdat 1–6 alla ovat yhä voimassa.

## Katselmus 3 / Lite4 (29.10.2026)

Lähde: `Sammakko_Lite4_Katselmus_ja_jatkotehtava.zip` (SHA-256 `95b22540f856ce1c47ef929db95743ec8ece819f0ffd1a7b6184413a9006f80b`), katselmoitu lähde `97aa110`. Katselmuksen koetinskriptejä ei ajettu. Löydökset toistettiin omilla testeillä (`tests/v4.test.ts`) ja selainajoilla.

Revisiot: ei muutoksia. Tehtävät ja tuottamissääntö pysyivät ennallaan, ja `tests/item-manifest.json` täsmää. Muuttuivat vain väitteiden tekstit, laskuri ja reitti, joten mikään `rev` ei vaihtunut.

| Kohta | Arvio | Tila | Toteutus | Testi |
|---|---|---|---|---|
| V4-01 M-WRADD: loppusumma luettiin muistinumeron käytöksi | aiheellinen | korjattu (vaihtoehto a: kapeampi väite) | Tuotosehto on ennallaan: lapsi laskee summan itse (column/transfer). Kaikki väitepinnat sanovat nyt vain sen, mitä havaittiin. **Perhekuvaus:** column ja transfer = summa lasketaan itse, menetelmää tai kirjoitettua muistinumeroa ei näy; step = muistinumero lisätään yhdessä numerossa; ones, where ja check = tunnistetaan valmiista laskusta. **Palkinto:** "Laskit summat itse ja tunnistit, mihin muistinumero kuuluu!". **Aikuiselle:** `produceWhat` = "summan laskemista itse". **Vienti:** `produced` ja `produces`. Oikea päässälasku hyväksytään yhä, eikä vanha suoritus katoa. Lyhyttä menetelmäaskelta (C02) ei lisätty, koska se olisi uusi tehtävätyyppi ja vaatisi uuden `rev`-arvon. | v4 V4-01, selain |
| V4-02 "tarkistettu tunnistamalla" puuttui yhteenvedosta | aiheellinen | korjattu | Uusi `src/ui/status.ts` antaa jokaiselle aiheelle tasan yhden tilan. Samaa funktiota käyttävät rivi, yhteenveto ja vienti. Yhteenveto näyttää "tarkistettu tunnistamalla" ja "aiemmassa versiossa tehty" -ryhmät, kun niitä on; osien summa on aina 181. Lapsen kartta sanoo tunnistamistarkistuksesta "⭐ Tarkistettu: tunnistit oikeat vastaukset" (Katselmus 2:n avoin kohta 3). | v4 V4-02: 181 = 1 tunnistamalla + 4 päätelty + 176; kahdeksan tilan fixture; vanha → uusi build säilyttää historian |
| V4-03 suora KC-peliosoite puuttui | aiheellinen | toteutettu | **Reitti:** yksi muoto, `#kc/<encodeURIComponent(id)>` (`src/route.ts`). Se toimii ensilatauksessa, uudelleenlatauksessa ja `hashchange`-tapahtumassa. Osoitteen vaihto pysäyttää käynnissä olevan oppitunnin (`stopLesson`) ja puheen. Kartalle-painike tyhjentää osoitteen, jolloin selaimen Takaisin toimii. **Palautesivut:** väärä muoto → "Linkki ei toimi"; kanoninen mutta Liten ulkopuolinen aihe → "Aihetta ei ole tässä versiossa" ja otsikko; tuntematon → "Tuntematon aihe". Jokaisella sivulla lukee "Mitään ei avattu eikä tallennettu.". **Aikuisen graafi:** pelilinkki, "Kopioi pelilinkki" ja "Avaa uudessa välilehdessä". Localhostissa näkyy varoitus, että linkki toimii vain tällä koneella; muuten "Oppilaiden pääsyä … ei ole varmistettu". **Saatavuuslista:** `public/lite-runtime.json` sisältää reitin, revision, graafin ja kanonisen tiivisteen, 181 id:tä, `lessonRev` ja `deployment` (ei osoitetta, ei varmistettu). Testi kaatuu, jos lista ei vastaa buildia. Esitietolukkoja ei lisätty. **Solille:** `docs/sol/LITE_KC_BRIDGE.md`. | v4 V4-03, selain |

Hyväksymistapaukset (`ACCEPTANCE_CASES.md`):

| ID | Tila | Todiste |
|---|---|---|
| C01 | täyttyy | v4 V4-01; selain: M-WRADD 390 px, oikea päässälasku 438 + 277 hyväksytty, uusi palkintoteksti (`qa/v4/02`) |
| C02 | ei tehty | Uusi menetelmäaskel vaatisi uuden tehtävätyypin; valittiin kapeampi väite (a). |
| C03 | täyttyy | v4 V4-02 review-fixture |
| C04 | täyttyy | v4 V4-02 kahdeksan tilan fixture: rivi, yhteenveto ja vienti samasta `statusOf`-funktiosta |
| C05 | täyttyy | v4 V4-02 legacy → build: `produced` täydentyy, `checkedAt` ja 5 historiariviä säilyvät; review2 U03 |
| C06 | täyttyy | review2 U01; selain: sekuntikellon paljastus → `help: ['reveal']`, huomautus ja Jatka (`qa/v4/05`) |
| C07 | testeillä | review2 U04 / game-testit. Tällä kierroksella selaimessa ajettiin vain vihko pikatarkistuksen jälkeen ("Potkuri: suoraan haasteella" näkyi heti); koeajoa ilman runkoa ei voi tehdä. |
| C08 | täyttyy | selain 390 px: ralli-järjestely kahdella napautuksella ja yhdellä vedolla (`qa/v4/03`). Oikeaa kosketuslaitetta ei testattu. |
| C09 | täyttyy | selain: tyhjä tallennus + `#kc/M-TH-08` → oikea aihe, 0 yritystä, 0 tapahtumaa |
| C10 | täyttyy | selain: liikedemo käynnissä (39 kuvaa / 0,8 s) → osoite `#kc/M-TH-08` → 0 animaatiokuvaa seuraavan 1,5 s aikana; uudelleenlataus säilyttää aiheen; Kartalle → Takaisin palaa edelliseen aiheeseen |
| C11 | täyttyy | selain: `#kc/M-TH-05` (kanoninen, ei Litessä), `#kc/M-NOPE-99`, `#kc/xyz`, `#kc/%E0%A4%A`; yrityksiä yhä 0 |
| C12 | täyttyy | v4 runtime-manifest -testi; selain: kopioitu linkki `http://localhost:5201/#kc/M-TH-08` ja localhost-varoitus (`qa/v4/01`) |
| C13 | täyttyy | v4 invariantit: 181 id:tä, 338 relaatiota (238+77+11+11+1), 24 PNG:tä tiivisteineen (`tests/png-manifest.json`), kanoninen sha täsmää |
| C14 | täyttyy | alla; selainajot tuotantobuildilla (`vite preview`), ei katselmoijan harnessia |

Testit (ajettu tämän commitin lähteellä):

```
npx tsc --noEmit                → OK
npx vitest run                  → Test Files 19 passed | 1 skipped (20)
                                  Tests 1842 passed | 1 skipped (1843)
npm run build                   → OK (vain chunk-kokovaroitus; canonical-ids erillinen 48 kB chunk)
tests/item-manifest.test.ts     → ei muutoksia tehtäviin
tests/sweep.test.ts             → 0 kovaa virhettä, laatuliput ennallaan (deadWhyAt 70)
```

Selainajot: sisäinen selainpaneeli, `vite preview` (tuotantobuildi), 1280 px ja 390 px. Kuvat ovat kansiossa `qa/v4/`. Konsolissa ei ollut virheitä. Tallennus oli aluksi tyhjä ja tyhjennettiin lopuksi.

Palautelista: `deadWhyAt` (8 noodia) jäi ennalleen. Tekstit koskevat oikeaan vastaukseen avainnettua virhepalautetta, joka ei koskaan näy lapselle. Niitä ei poistettu lukujen kaunistamiseksi eikä tilalle keksitty vihjeitä.

Rajoitukset:

1. **Julkaisu:** Liteä ei ole julkaistu. Oppilaiden pääsy mihinkään osoitteeseen on varmistamatta (`deployment.studentReachability: unverified`).
2. **Ei identiteettiä:** linkki ei kanna oppilaan tietoa. Edistyminen on selainkohtainen.
3. **C02:** M-WRADD ei näytä menetelmän tai muistinumeron kirjoittamista.
4. **C07:** koeajo ajettiin selaimessa vain edellisellä kierroksella.
5. **Kosketus:** oikeaa kosketuslaitetta ei testattu.

Pilottilista (lapsi + opettaja; ei vielä tehty):

- [ ] Kirjaa buildin `contentRev` ja `graphSha256` tiedostosta `lite-runtime.json` sekä laite ja selain.
- [ ] Opettaja avaa yhden aiheen `#kc/`-linkillä. Aukeaako oikea aihe, ja jääkö aikuisen näkymän laskuri ennalleen?
- [ ] Lapsi: Aavan nimi ja rooli, seuraava pelitavoite, mitä omassa kokeessa muuttui, mitä haluaa tehdä seuraavaksi.
- [ ] Opettaja: yksi laskupolku (esim. M-WRADD) ja yksi aika- tai nopeuspolku. Vastaavatko tavoite, tuki ja aikuisen näkymän tila toisiaan?
- [ ] Kirjaa annetut avut (demo, vihje, paljastus) ja havainnot sellaisinaan. Ei tehokkuusväitteitä ilman vertailua.

## GitHub-katselmus 1 (G01–G03, 30.10.2026)

Lähde: `Sammakko_GitHub_Code_Review_1d6799d.zip` (SHA-256 `511e4b566c331535fb2c2459c5c82feceafb28d8d8f3a59ed53499a47119f7a4`), katselmoitu lähde `main` = `1d6799d`. Työ on haarassa `review-gh1-storage-safety`. Katselmuksen koetinskriptejä ei ajettu. Löydökset toistettiin omilla testeillä: `tests/gh1.test.ts` ja selaintestit `e2e/kc-and-tabs.spec.ts`.

Revisiot: ei muutoksia. Tehtävät eivät muuttuneet, eikä mikään `rev` vaihtunut. Tallennusavain on yhä `sammakko-lite-2`.

| Kohta | Arvio | Tila | Toteutus | Testi |
|---|---|---|---|---|
| G01 vanha välilehti ylikirjoitti toisen välilehden tallennuksen | aiheellinen (toistui vanhassa buildissa: 3/3 kahden välilehden selaintestiä kaatui) | korjattu | **Käytäntö:** jokainen muutos tehdään tuoreimpaan tallennettuun tallenteeseen, ei sivun vanhaan kopioon. Vastaukset ja tapahtumat (muistiinpanot, "myöhemmin", "hämmentävää") vain lisätään. Jos kaksi välilehteä kirjoittaa lähes yhtä aikaa ja toisen rivi jää pois, välilehti lisää omat rivinsä takaisin, kun se seuraavan kerran lukee tallenteen (`storage`-tapahtuma, uudelleenpiirto tai seuraava vastaus). Rivejä ei palauteta "nollaa kaikki" -toiminnon yli (uusi `created`) eikä testaajarivejä "nollaa testaaja" -toiminnon yli (`testerResetAt`). **Peli:** löydöt, tehtävät ja asetukset muutetaan tuoreimpaan pelitilaan (`saveGame`). Tehtävä myönnetään vain kerran, ja toisen välilehden peli säilyy (`ensureGame`). Kartta ja aluelista piirtyvät uudelleen, kun toinen välilehti tallentaa; käynnissä olevaa oppituntia ja aikuisen sivua (kirjoitettava muistiinpano) ei keskeytetä. Aikuisen tallennusrivillä kerrotaan tämä käytäntö. **Rajoitus:** kahden välilehden yhtäaikainen muutos samaan pelin kenttään (esim. siipien muoto) noudattaa viimeisimmän kirjoittajan arvoa. Ansaitut tehtävät johdetaan vastauksista uudelleen. | gh1 G01 (5 testiä, jotka kaatuvat ilman korjausta), e2e: stale B vaihtaa maailmaa, vastaukset molemmissa, muistiinpano + vastaus |
| G02 valinnaisten kenttien tyyppejä ei tarkistettu | aiheellinen | korjattu | `attemptOk` / `eventOk` tarkistavat jokaisen kentän tyypin: `help` (merkkijonotaulukko), `syn`, `legacy`, `math`, `proc`, `replay` (totuusarvo), `rev`, `resp`, `mode`, `sess`, `from`, `scn`, `mission` (merkkijono), `seed` ja `at` (äärellinen luku). Väärän muotoinen rivi jätetään pois. Sitä ei muunneta, eli väärä `help` ei koskaan muutu muotoon "ei apua". Muu historia säilyy. Alkuperäinen teksti kopioidaan avaimeen `sammakko-lite-2-unreadable`. Aikuisen ilmoitus kertoo, montako riviä jätettiin pois. Sama tarkistus koskee toisen välilehden kirjoittamaa tallennetta. | gh1 G02 (15 testiä: `help:{}`, `help:1`, `help:[1]`, `help:"reveal"`, väärät totuusarvot, `seed`, `at`, `mode`, tapahtumat, ehjä tallenne, toisen välilehden tallenne) |
| G03 kanonisen otsikkolistan latausvirhe näkyi tuntemattomana aiheena | aiheellinen | korjattu | Lista on nyt tavallinen tiedosto `public/canonical-ids.json` (ei koodipala), joten uudelleenyritys oikeasti hakee sen uudelleen (`src/canonical.ts`, aikakatkaisu 10 s, muodon tarkistus). Virhe näyttää "Aiheluetteloa ei saatu ladattua" sekä painikkeet "Yritä uudelleen" ja "Kartalle". Myöhässä tuleva vastaus vanhaan osoitteeseen ei korvaa uudempaa sivua (`routeSeq` ja osoitteen tarkistus). Mikään linkki-, virhe- tai uudelleenyrityspolku ei tallenna yritystä, päätelmää tai palkintoa. `lite-runtime.json` kertoo listan ja virhekäytännön. | gh1 G03, e2e: 503 → virhe → uudelleenyritys → "Tuntematon aihe"; hidas virhe vanhalle linkille ei korvaa uutta oppituntia |

**CI:** `.github/workflows/ci.yml` (Node `.nvmrc` = 24, `npm ci`, lukitut riippuvuudet, `@playwright/test` 1.58.2). Vaiheet: tsc, vitest, build, `cmp` ajonaikaiselle manifestille ja otsikkolistalle, 181 id:n tarkistus, Playwright Chromium palvellussa tuotantobuildissa (`vite preview`).

Ajettu paikallisesti (macOS, Node 24.14.0, npm 11.9.0):

- `npx tsc --noEmit`: ei virheitä.
- `npx vitest run`: 1864 passed, 1 skipped (21 tiedostoa, joista 1 ohitettu).
- `npm run build`: onnistui. `cmp` dist ↔ public: `lite-runtime.json` ja `canonical-ids.json` identtiset; manifestissa 181 id:tä.
- `npx playwright test`: 7 passed. Samat 7 testiä vanhaa buildia `1d6799d` vasten: 1 passed, 6 failed (G01: 3/3, G03: 3/3; vanhassa buildissa ei ollut otsikkolistaa erillisenä tiedostona).

Ei ajettu: GitHub Actions -ajoa ei ole vielä nähty (tulos näkyy, kun haara on GitHubissa). Oikeaa kosketuslaitetta ja muita selaimia kuin Chromiumia ei testattu. Kahden välilehden testit ajettiin yhdessä selainkontekstissa, joka jakaa `localStorage`-tallennuksen kuten kaksi välilehteä.

Säilytetty: M-WRADD:n kapeampi väite, tunnistamalla tarkistettu lasketaan kerran, paljastus on apua, 181 id:tä, 338 suhdetta, 24 PNG-kuvaa, vapaat hypyt.

Repositorion siirto (`lite/`, myöhemmin `full/`) ei kuulu tähän. Suunnitelma erillistä siirto-PR:ää varten: `docs/REPO_LAYOUT_PLAN.md`.

## Avoimet ja tunnetut ongelmat (kierros 1)

1. Lennon rengas 3 menee osittain "Kivikaari"-tekstin päälle.
2. PHY79-SPEED-CONCEPT-oppitunnin raceScene käyttää yhä 🐸-emojia eikä PNG-kuvaa. Muitakin SVG- ja emoji-ajan sijoituksia on jäljellä.
3. M-TIME-03:n malliesimerkin teksti kertoo vastauksen ennen toistoa.
4. Rantakisa käyttää vain suoraa rataa.
5. Kisan ennätystä ei voitu todentaa tässä paneelissa (sivu piilossa). Mobiilissa se todennettiin aiemmassa istunnossa.
6. L181-07 on osittain tehty. L181-03:n kertausparit ovat auki. PHY79-NUMVALUE:n kokonaislukuarvoilta puuttuu `whyAt`.
7. Koko 181 noodin sweep ajetaan nyt normaalissa testiajossa (Katselmus 2).
8. Kehitysselaimen tallennuksessa on testimerkintöjä. Ne eivät ole oikean käyttäjän vastauksia.

## Ihmispalaute

Lapsilta, opettajilta tai muilta ihmisiltä ei ole kerätty palautetta. Tämän raportin havainnot ovat automaattisten testien ja Opuksen selainajojen tuloksia.

## Sol

Ehdotukset Solille: `docs/sol/LITE181_SUGGESTIONS_FOR_SOL.json`, 8 KC:tä sekä yhteiset käytännöt (Katselmus 2 lisäsi tuottamissäännön, paljastetun vastauksen ja revisiot). KC-silta: `docs/sol/LITE_KC_BRIDGE.md` ja `public/lite-runtime.json`. Sama KC-tunniste ja `rev` yhdistävät työt. Testi `tests/sol-suggestions.test.ts` tarkistaa ne. Solin tiedostoja ja kanonisia luetteloita ei ole muutettu.
