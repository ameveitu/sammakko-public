# Yleiset virheet ja korjaukset — 181-julkaisusta kohti 690:tä

Päätös ja suunnitelma 2.11.2026. Omistajan linjaus on annettu 181-äänikatselmuksen jälkeen. Teknisten havaintojen ja määrien lähdeversio on [e14c6dc](https://github.com/ameveitu/Sammakko/commit/e14c6dcf2c75ef451e93b278dceb8c9b6d5a99ac). Tämä on korjausten työpohja, ei kuitti niiden toteutuksesta.

## 1. Omistajan päätös 181-julkaisulle

Nykyinen äänenlaatu ja puhemuotojen tunnetut puutteet sallitaan 181-julkaisussa. Puhemuotoja ei korjata nyt. Ihmiskatselmointi ajoitetaan tarkoituksella 181-julkaisun jälkeiseen aikaan; täysi ihmisbeta kuuluu vasta täyden Sammakon vaiheeseen. Käytettävissä on tällä hetkellä projektin tekijä, eikä opettaja- tai oppilasryhmää oleteta olevan.

Äänipilotti saa olla mukana 181-julkaisussa. Kaikkien raitojen ihmiskuuntelu, niiden muuttaminen `approved`-tilaan tai manifestin `pilot: false` eivät ole tämän julkaisun ennakkoehtoja. Tämä päätös korvaa aiempien äänisuunnitelmien ja katselmusten tätä tiukemman kuunteluvaatimuksen 181-vaiheen osalta.

Julkaisulupa ja tehty katselmointi ovat eri tietoja:

| Tieto | Merkitys 181-vaiheessa |
|---|---|
| Omistajan päätös tässä dokumentissa | Nykyinen äänipilotti ja sen tunnetut laaturajoitteet sallitaan julkaisuun. |
| Puheen `approved` | Tallenteella on alkuperätietoon kirjattu hyväksyntä; aiemmat todelliset hyväksynnät säilyvät. |
| Puheen `provisional` ja manifestin `pilot: true` | Tallenne on käytössä pilotissa. Yksilöityä ihmiskuuntelun hyväksyntää ei ole kirjattu. |
| Oppimateriaalin ihmisarvioinnin `pending` | Ihmisarviointi odottaa myöhempää vaihetta. Tila ei tarkoita GitHubin manuaalista hyväksymisodotusta. |
| Tekninen testikuitti | Kuvaa vain siinä nimetyt, kyseiselle lähdeversiolle suoritetut tarkistukset. |

Omistajan päätös ei muuta `provisional`-raitoja massana `approved`-tilaan eikä ihmisarviointia tehdyksi. Äänen laatuhyväksyntä ei myöskään sulje teknisiä vikamerkintöjä.

Nykyiset tekniset koonti-, toisto- ja julkaisutarkistukset säilyvät. Jäljempänä oleva tekninen korjausjono ei yksin muodosta uutta julkaisukieltoa. Katselmoinnin lykkääminen ei edellytä testien poistamista tai vanhojen arviointien esittämistä uuden revision hyväksyntänä.

690-julkaisun valmistelussa käytetään tätä korjausrekisteriä. Täyden Sammakon ihmisbetan ajankohta ja toteutustapa suunnitellaan sen vaiheen resurssien mukaan. Tätä dokumenttia ei tulkita uudeksi kaikkien raitojen ennakkokuunteluvaatimukseksi 690:lle eikä luvaksi toteuttaa nyt jäljellä olevia 509 sisältöä.

## 2. Lähtötilanne

Luvut on sidottu lähdeversioon `e14c6dc`; ne eivät ole myöhempien versioiden automaattinen laatulupaus.

| Kohde | Tilanne |
|---|---|
| Ydinpuheet | 58 tallennetta, hyväksynnät kirjattu. |
| Tehosteet | 27 varianttia / 12 perhettä, hyväksynnät kirjattu. |
| Liten laajennuksen katalogi | 3 479 repliikkiä. |
| Laajennus pilotissa | 3 366 `provisional`-repliikkiä; ihmiskuuntelua ei ole kirjattu. |
| Vertailupoikkeamat | 113 repliikkiä paketista pois. Poikkeama ei yksin todista virheellistä ääntä. |
| Jakelumanifesti | 3 424 puherepliikkiä ja 27 tehostetta; `pilot: true`. |
| Puheen pakkaus | Ydin 80 kbps, Lite-laajennus 32 kbps; nykyinen laatu sallittu 181-vaiheeseen. |

Lähteet: [manifesti](../../lite/public/audio/manifest.json), [käyttöohje](AUDIO_FI.md), [historiallinen toteutusraportti](REVIEW_FI.md), [äänten alkuperätiedot](../../audio/provenance/).

## 3. Yleiset virheet ja myöhemmät korjaukset

Tässä rekisterissä `siirretty` tarkoittaa tarkoituksella myöhemmäksi ajoitettua työtä. Se ei tarkoita, että havainto olisi korjattu tai että 181-julkaisu odottaisi sen valmistumista.

| Tunnus | Virheluokka ja näyttö | Myöhempi korjaus | Tila / erä |
|---|---|---|---|
| A-01 | Matemaattisen ryhmittelyn ilmaisu katoaa, kun puhemuunnos poistaa sulut. Todellinen tuotettu esimerkki on kirjattu alla. | Korjaa yhteinen sääntö tai kirjoita yksilöity puhemuoto. Selvitä kaikki saman säännön käsittelemät repliikit. | Siirretty / B2. Ei korjata nyt. |
| A-02 | Luvut, yksiköt, taivutus ja merkit vaativat kattavamman tarkastelun. Tämä on tarkastettava virheluokka, ei väite kaikkien näiden tekstien virheellisyydestä. | Ryhmittele havaitut tapaukset sääntöperheittäin ja korjaa vain vaikutuksen alainen aineisto. | Siirretty / B2. |
| A-03 | Automaattisessa litterointivertailussa on 113 poikkeamaa. | Erota todellinen tekstiero, kirjoitusasuvaihtelu, puhemuunnoksen ongelma ja epäselvä tapaus ennen uusintatuotantoa. | Siirretty / B1–B2. |
| A-04 | Litterointivertailun `digits-read`-polku poistaa sanavälit. Paikallinen esimerkki ”Isoisä odottaa.” / ”Iso isä odottaa.” hyväksytään samaksi. Tämä ei osoita juuri kyseistä virhettä nykyisissä tallenteissa. | Säilytä sanajako ja käsittele lukujen kirjoitusasu rajatuilla säännöillä. Arvioi muuttuneen tarkistuksen vaikutus aiempiin tuloksiin. | Siirretty / B1. |
| A-05 | Ääntäminen, suomen pitkät ja lyhyet äänteet, nimet, rytmi ja katkenneet äänteet voivat vaatia uusia ottoja. Nykyinen laatu on omistajan sallima. | Kokoa palaute virheperheiksi; vertaa ja tuota uudelleen vain ongelmalliset otot. | Siirretty / B3. |
| A-06 | 32 kbps:n pakkauksen vaikutusta suomen äänteisiin ja puhelintoistoon ei ole kuunteluvertailulla osoitettu. | Vertaa rajattua otosta WAV-masteriin ja suurempaan bittinopeuteen. Pakkaa tarvittaessa masterista uudelleen ilman uutta API-tuotantoa. | Siirretty / B3. |
| A-07 | Vaihtuvien tehtävätekstien ja puuttuvien tallenteiden selainääni voi poiketa kiinteistä hahmoäänistä. | Kokoa palautetta tilanteista ja laitteista. Arvioi kiinteän kattavuuden lisäys ennen uuden dynaamisen palvelun suunnittelua. | Hyväksytty 181-rajoite / B4. |

### A-01: tallennettu esimerkki, säilytetään korjauserään

- Repliikki-ID: `lite.PHY79-ACCEL-CALC.katsotaan-vastaus-a-4-0-m-s--405afc`.
- Näyttöteksti: ”Katsotaan vastaus: a = (4 − 0) m/s / 2 s = 2 m/s².”
- Nykyinen puheteksti: ”Katsotaan vastaus: aa on neljä miinus nolla metriä sekunnissa jaettuna kahdella sekunnilla on kaksi metriä sekunnissa toiseen.”
- Havainto: puheesta ei käy yksiselitteisesti ilmi, että koko nopeuksien erotus jaetaan ajalla.
- Automaattinen tulos: `transcriptCheck.exact: true`; se vertaa puhetta jo muodostettuun skriptiin.
- Tallenteen tila: `provisional`.
- Jakelutiedoston SHA-256: `bff3ee33bea2318ae51fe238d0f4f04bce2ed407e7276f7b3a54de86c8e15c1c`.
- [Alkuperätiedot tarkistetussa versiossa](https://github.com/ameveitu/Sammakko/blob/e14c6dcf2c75ef451e93b278dceb8c9b6d5a99ac/audio/provenance/speech/lite.PHY79-ACCEL-CALC.katsotaan-vastaus-a-4-0-m-s--405afc.json).

Havainto on dokumentoitu; nykyistä puhetekstiä tai tallennetta ei muuteta tämän suunnitelman yhteydessä.

## 4. Korjaussuunnitelma erissä

Suunnitelmassa ei aseteta kalenteria eikä oleteta ulkopuolisia katselmoijia. Korjauserän alkaessa yksilöidään sen repliikit, tavoitteet ja kustannusraja. Ihmiskatselmointi voidaan aloittaa 181-julkaisun jälkeen saatavilla olevin resurssein; koko kirjaston valmistuminen ei ole ensimmäisen korjauserän ehto.

| Erä | Ajankohta ja sisältö | Valmis, kun |
|---|---|---|
| B0 — lähtötilanne | Dokumentointi nyt: omistajan päätös, tunnetut luokat, tarkka lähdeversio ja teknisen työn erottelu. | Päätös löytyy julkaisu- ja äänen käyttöohjeesta; avoimet havainnot säilyvät avoimina. |
| B1 — havaintojen ryhmittely | 181-julkaisun jälkeen: 113 vertailupoikkeamaa, käyttäjäpalautteet ja automaattisen vertailun rajat. | Jokainen käsitelty tapaus on luokiteltu; saman juurisyyn vaikutuspiiri on listattu. |
| B2 — merkitys ja puhemuodot | Myöhempi 690-valmistelun korjauserä: sulut, laskurakenne, luvut, yksiköt, taivutukset ja ohjeiden merkitys. | Sovittu vaikutusjoukko on korjattu ja sille on kohdennettu tekninen näyttö; tehty ihmiskatselmointi kirjataan vain todellisessa laajuudessaan. |
| B3 — artikulaatio ja pakkaus | Myöhempi laatu-erä: äänteet, nimet, rytmi ja valittu pakkausvertailu. | Sovitun otoksen havainnot, vaihdetut otot ja mahdollinen uudelleenpakkaus on kirjattu. |
| B4 — 690-tilannekuva | 690-julkaisun valmistelu: yhdistä korjauserien tulokset ja uudet sisältöperheet. | Raportti erottaa korjatut, avoimet, automaattisesti tarkistetut ja ihmisen arvioimat kohdat. |
| B5 — täyden Sammakon ihmisbeta | Täyden Sammakon vaiheessa, kun osallistujat ja toteutustapa ovat olemassa. | Vaiheen oma käytettävyys- ja pedagoginen arviointisuunnitelma sekä todelliset tulokset on dokumentoitu. Ei 181:n ennakkoehto. |

Uusintatuotanto rajataan muuttuneisiin puheskripteihin tai epäonnistuneisiin ottoihin. Pelkkä pakkausmuutos tehdään olemassa olevasta masterista. Hyväksyttyjä muuttumattomia raitoja ei tuoteta samalla uudelleen. Jokaiseen erään kirjataan kustannusarvio, toteutunut kulu ja säilytettävän vanhan version tunniste.

## 5. Erillinen tekninen korjausjono

Nämä ovat lähdeversiossa `e14c6dc` havaittuja toiminnallisia tai tuotantotyökalujen puutteita. Äänenlaadun salliminen ei väitä niitä korjatuiksi. Priorisointi tehdään teknisessä työssä; tästä taulukosta ei muodosteta uutta ihmishyväksynnän porttia.

| Tunnus | Havainto / todisteen taso | Rajattu jatkotyö |
|---|---|---|
| T-01 | Uusi `unavailable`-ohje palautuu ennen vanhan puheen peruutusta. Vahvistettu lähdekoodista ja mock-audiolla. | Peruuta vanha puhe riippumatta uuden repliikin saatavuudesta. |
| T-02 | Watchdog voi vapauttaa puhekanavan pysäyttämättä mediaelementtiä. Vahvistettu lähdekoodista ja mock-audiolla. | Pysäytä ja irrota mediaelementti kaikissa loppupoluissa ennen kanavan vapauttamista. |
| T-03 | Hiljaisen tilan painike voi näyttää väärää toimintoa ilman suomenkielistä selainääntä. Lähdekoodista vahvistettu. | Perusta painike käyttäjän mykistysvalintaan; pidä repliikin saatavuus erillään. |
| T-04 | Valitun tiedoston latausvirhe päättyy `failed`-tilaan ilman selainvaratoistoa. Lähdekoodihavainto; erillistä toistoreproa ei tehty. | Täsmennä ja testaa ennen puheen alkua tapahtuvan virheen varatoisto sekä kesken repliikin katkeaminen. |
| T-05 | CI #86 ja #87: lähderevision arviointitila on `stale`, testi odottaa `pending`. | Korjaa todellisen revision sidonta säilyttäen ihmisarvioinnin odottava tila. Tarkista sisältö- ja alignment-arvioiden todellinen perusta erikseen. |
| T-06 | CI #85: julkaisutestin ajuri kirjasi 4 vastausta odotetun 6 sijasta. Tarkka syy selvittämättä. | Selvitä ajurin/ajoituksen syy ja toista rajattu regressio sekä normaali julkaisuportti. Ei näyttöä oppijan edistymisen muuttumisesta. |
| T-07 | Audio lukee kuvatuotannon kulut; kuvatuotanto ei vähennä audiokuluja. Eri prosessien varauksilla ei ole yhteistä lukkoa. | Yhteinen kulukirjanpito ja lukittu varaus, tai eksplisiittiset erilliset osuudet kokonaisbudjetista. |
| T-08 | WAV-masterit ovat kehittäjän paikallisessa tilakansiossa. Pysyvää etäarkistoa ja palautuspolkua ei ole osoitettu repossa. | Dokumentoi säilytys ja palautus. Paikallisen varmuuskopion olemassaolosta ei tehdä oletusta. |
| T-09 | Toteutusraportissa on eri kierrosten tiloja. Kaikki vanhat testit, määrät ja pilot-maininnat eivät kuvaa nykyistä versiota. | Säilytä historiallinen näyttö ja nimeä uusi tilannekuva lähdeversioineen. |

Lähteet: [soitin](../../lite/src/audio/player.ts), [puhekerros](../../lite/src/ui/speech.ts), [tehtävänäkymä](../../lite/src/ui/lesson.ts), [puhemuunnos](../../tools/audiogen/lib/spoken.mjs), [litterointivertailu](../../tools/audiogen/lib/text.mjs), [audiobudjetti](../../tools/audiogen/lib/state.mjs), [kuvabudjetti](../../tools/imagegen/lib/core.mjs), [CI #87](https://github.com/ameveitu/Sammakko/actions/runs/41476954763), [CI #85](https://github.com/ameveitu/Sammakko/actions/runs/41455862084).

## 6. Yhden korjaushavainnon kirjaus

Jokaisesta myöhemmin käsiteltävästä havainnosta kirjataan:

- tunnus ja virheluokka sekä toisiinsa liittyvät tapaukset;
- lähdecommit, KC/repliikki-ID, tiedostopolku ja sisällön tiiviste;
- näyttöteksti, nykyinen puheteksti ja havaittu ongelma;
- havaintolähde: automaattinen vertailu, lähdekoodikatselmus, toistokoe tai todellinen ihmiskuuntelu;
- vaikutus: merkitys, ymmärrettävyys, toiminnallisuus tai viimeistely;
- korjauserä, vastuuhenkilö vasta kun sovittu, tila ja korjatun version tunniste;
- suoritetut tarkistukset ja niiden rajat sekä tuotannon kustannus.

Tilat: kirjattu → luokiteltu → erään valittu → korjattu → tarkistettu sovitussa laajuudessa. Ihmisen tekemä tarkistus kirjataan omaksi tiedokseen. Automaattinen tulos ei muutu ihmishavainnoksi.

Tämä rekisteri toimii myös muiden 690-laajennuksessa toistuvien sisältövirheiden pohjana. Uudet havainnot liitetään samaan virheperheeseen silloin, kun juurisyy on yhteinen; yhden korjauksen vaikutusjoukko dokumentoidaan ennen koko katalogin uudelleentuotantoa.

## 7. Tilannepäivitys 2.11.2026 (ilta, ääni-istunto)

Tämä on toteuttajan kirjaus. Alla olevat tarkistukset ovat automaattisia, eikä mitään ole kuunneltu. Puhemuotoja (A-01, A-02) eikä litterointivertailun sanarajaa (A-04) ole muutettu. Ne on siirretty myöhemmäksi omistajan päätöksen mukaisesti.

| Tunnus | Tila | Mitä tehtiin |
|---|---|---|
| T-01 | korjattu, tarkistettu testeillä | Uusi, ei-jonossa oleva repliikki pysäyttää vanhan puheen myös silloin, kun uutta ei voi kuulla. Jonoon tuleva (`after`) kuulumaton repliikki ei pysäytä nykyistä. |
| T-02 | korjattu, tarkistettu testeillä | Mediaelementti pysäytetään ja irrotetaan kaikissa päättymispoluissa: loppu, virhe, vahtiajastin ja pysäytys. Selainäänen vahtiajastin peruu äänen. |
| T-03 | korjattu | Hiljaisen tilan painikkeet (kartta ja oppitunti) näyttävät ja vaihtavat vain lapsen oman valinnan. Puuttuva selainääni näkyy edelleen omana ilmoituksenaan. |
| T-04 | korjattu, tarkistettu testeillä | Jos tiedosto epäonnistuu ennen kuin mitään on kuulunut, selaimen ääni lukee repliikin. Kesken repliikin katkennutta tiedostoa ei jatketa selainäänellä. Estetty automaattitoisto (`blocked`) ei siirry selainäänelle. |
| T-05 | korjattu, tarkistettu paikallisesti | Juurisyy: ääni-istunnon lähdesidonnat (commitit 88b7083b ja 980f42b3) ajettiin ilman `finalize-reviews --apply`-vaihetta, joten nykyiselle revisiolle ei kirjattu arviointeja. Nyt ajettu järjestyksessä `sync-current-sources --apply` → `carry-forward-binding --apply` → `finalize-reviews --apply`. Ihmisarviointi on edelleen `pending`. Testit `test-audience` 8/8 ja `test-launch-review-gate` 4/4 sekä `verify` menevät läpi. |
| T-06 | avoin | Ei toistunut paikallisesti (launch-konfiguraatio: chromium ja firefox 22/22, scope 2/2). WebKit puuttuu tältä koneelta. CI-lokia ei voitu lukea. |
| A-03 | luokiteltu | Kaikista 113 poikkeamasta tehtiin uusi otto (0,38 $). Niistä 101 vastasi tekstiä, eli poikkeama johtui yksittäisestä otosta. Jäljelle jääneet 12 ovat pääosin ääntämisvirheitä (A-05), esimerkiksi ”nollon”, ”sekaisiin”, ”kahdeksankymmentäviis”, ”neljälle” sanan ”neljällä” sijaan ja ”kymppisenttit”. Ne eivät ole paketissa, ja ne soivat selaimen äänellä. |

Pilottipaketissa on nyt 3 465 oppituntirepliikkiä 3 479:stä (ks. §8).

## 8. Hiljaiset MP3-tiedostot ja julkaisutestin tukipolku (2.11.2026, myöhäisilta)

Tämä on toteuttajan kirjaus. Tarkistukset ovat automaattisia, eikä mitään ole kuunneltu.

| Tunnus | Tila | Mitä tehtiin |
|---|---|---|
| T-07 | korjattu, tarkistettu dekoodaamalla | Juurisyy: lamejs valitsee 32 kbps:llä 22,05 kHz:n taajuuden, ja sen oma 24 → 22,05 kHz -muunnos tuotti pelkkää hiljaisuutta. Koko jakelupaketin skannaus (`afconvert`-dekoodaus) näytti, että hiljaisia oli kaikki 3 467 oppituntitiedostoa, ei vain kolme tutkittua. Ydinkirjaston 58 tiedostoa (80 kbps, 24 kHz) olivat kunnossa. Pakkaaja muuntaa nyt taajuuden itse ennen lamejs:ää. Kaikki tiedostot pakattiin uudelleen mastereista. Uusintaskannauksessa yksikään tiedosto ei jää alle −45 dB:n. |
| T-08 | lisätty | Signaalitarkistus putkeen: `pack` dekoodaa jokaisen MP3:n ja keskeyttää, jos taso poikkeaa masterista yli 3 dB tai kesto yli 0,3 s. Mittaus tallentuu alkuperätietoon (`asset.decoded`). `verify` tarkistaa mittaukset, ja `verify --signal` dekoodaa kaiken uudelleen. Yksikkötesti vaatii mittauksen jokaiselta manifestin puhetiedostolta. |
| T-09 | korjattu, uusi otto | Tarkistuksessa löytyi lisäksi 38 masteria, jotka API oli palauttanut tyhjinä (60 ms) tai katkenneina (alle 50 ms kirjainta kohden; mediaani on noin 88 ms), vaikka litterointi täsmäsi. Litterointi tulee mallilta, ei äänestä, joten se ei paljasta tätä. Uusi vartija (`takeProblem`) hylkää tällaisen oton ehdokasvaiheessa, `provisional`-vaiheessa ja `pack`-vaiheessa. Uudet otot maksoivat 0,12 $. 36 ottoa onnistui (yksikirjaiminen ”T” vasta kolmannella yrityksellä). Kaksi uutta ottoa ei vastannut tekstiä, joten ne soivat selaimen äänellä. |
| T-10 | korjattu, tarkistettu paikallisesti | Julkaisutestin ajuri (`visual-polish-lite.spec.ts`) painaa tukinäkymässä ”Yritä uudelleen avun kanssa” ja jatkaa kuuden vastauksen loppuun. Koristeet päällä ja pois -vertailu säilyy. Paikallinen jakelupaketti (`package-site.mjs` + `serve-site.mjs`) on testattu: chromium ja firefox 22/22. WebKit puuttuu tältä koneelta. |

Ääniprojektin kulut ovat nyt yhteensä 10,38 $ (katto 20 $). Pilottipaketissa on 3 465 oppituntirepliikkiä 3 479:stä. Loput 14 lukee selaimen ääni. Erillinen dekoodausskannaus koko paketista: 0/3 523 tiedostoa alle −45 dB:n.
