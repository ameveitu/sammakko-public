# Oppituntien kriittinen läpikäynti (audit1)

Pyyntö (käyttäjä 2026-10-28): jokainen 181 noodin oppitunti arvioidaan kriittisesti pedagogiikan ja UI/UX:n kannalta.
Jos taso ei riitä, tehdään korjaus- ja laajennussuunnitelma, toteutetaan se ja validoidaan. Kierros per noodi.
Tämä tiedosto on jatkamisen lähde: ensimmäinen rivi, jonka tila on `todo`, on seuraava kierros.

## Kriteerit

- **K1 Tavoite ja kieli**: tavoite on yksi selkeä taito; lauseet lyhyitä ja lapsen kieltä.
- **K2 Esittely näyttää prosessin**: jos käsite on dynaaminen (aika, liike, muutos, yhdistäminen, jakaminen), esittely etenee ajassa (animaatio tai liikesoitin), ei staattinen kuva.
- **K3 Esitys vastaa käsitettä**: kestoa ja nopeutta ei esitetä paikallaan olevilla palikoilla; kuva on mitattava tai laskettava eikä vihjaa vastausta väärin.
- **K4 Tehtävät mittaavat tavoitetta**: vähintään kaksi itsenäistä tehtäväperhettä; siirtotehtävä on uusi tilanne, ei sama kysymys.
- **K5 Palaute**: jokaisella väärällä vaihtoehdolla on oma, virhekäsitykseen osuva selitys.
- **K6 Oppijan toiminta**: tehtävässä on mielekäs teko (katso ja pysäytä, rakenna, mittaa, vertaa), ei pelkkää arvaamista.
- **K7 UI/UX**: luettava 390 px leveydellä, vaihtoehdot lyhyitä, kuva ja kysymys samassa näkymässä.

Arvio: **ok** = ylpeyden tasolla sellaisenaan; **korjattu** = muutokset tehty ja validoitu; **osittain** = parannettu, avoin asia kirjattu.
Kun tehtävien merkitys muuttuu, oppitunnin `rev` nostetaan arvoon `AUDIT_REV` (vanhat vastaukset näkyvät aikuiselle "aiemmassa versiossa").

Validointi joka kierroksella: `npm run check` (tsc + vitest), oppitunnin dumppi (`DUMP_ID=<id> npx vitest run tests/zz-lesson-dump.test.ts`) ja tarvittaessa selaintarkistus.

## Eteneminen

| # | Noodi | Maailma / luku | Tila | Arvio | Muutos |
|---|---|---|---|---|---|
| 1 | M-NUM-STABLE-ORDER | Rantaretki / Laskuloru | tehty | korjattu | Hyppyanimaatio, puuttuvan sanan etsintä, lorun rakentaminen, selitykset |
| 2 | M-NUM-1TO1 | Rantaretki / Laskuloru | tehty | korjattu | Osoituslaskenta-animaatio, mitä tapahtui -diagnoosi, palautteet |
| 3 | M-NUM-01 | Rantaretki / Laskuloru | tehty | korjattu | Animoitu esittely (rivi, rengas, alkuvirhe), suuntapalaute kokonaismäärään |
| 4 | M-NUM-02 | Rantaretki / Laskuloru | tehty | korjattu | Laskuanimaatio + joukon rengas, peittolaatikon animaatio, selitykset |
| 5 | M-NUM-WORD-NUMERAL | Rantaretki / Laskuloru | tehty | korjattu | Numerojuna, samannäköiset numerot + palaute, paritehtävä |
| 6 | M-NUM-QTY-NUMERAL | Rantaretki / Laskuloru | tehty | korjattu | Rasian täyttöanimaatio, täytä rasia -tehtävä, suuntapalaute, selitykset |
| 7 | M-NUM-QTY-WORD | Rantaretki / Laskuloru | tehty | korjattu | Animoitu lasku + säilyminen (spreadRow), uusi spread-perhe, selitykset |
| 8 | M-NUM-03 | Rantaretki / Laskuloru | tehty | korjattu | Esittely animaatioksi (lasku → numero → sana), siirron palaute |
| 9 | M-NUM-06 | Rantaretki / Laskuloru | tehty | korjattu | Syömisanimaatio (takeAway) esittelyyn ja tehtävään, intro yhtenäiseksi |
| 10 | M-NUM-10 | Rantaretki / Laskuloru | tehty | korjattu | tensRace-animaatio, järjestystehtävä, merkkiperusteet |
| 11 | M-TH-01 | Rantaretki / Mittaripaja | tehty | korjattu | vertailuanimaatio, which-perhe, perustelut |
| 12 | M-MEAS-00 | Rantaretki / Mittaripaja | tehty | korjattu | liuku- ja vaaka-animaatiot, heavy-perhe, nauhapalaute |
| 13 | M-MEAS-02 | Rantaretki / Mittaripaja | tehty | korjattu | taivutus-, oikaisu- ja leikkausanimaatiot, perustelut |
| 14 | M-MEAS-01 | Rantaretki / Mittaripaja | tehty | korjattu | iterate-mikropeli, latomisanimaatio, virhetyyppien perustelut |
| 15 | M-NUM-14 | Rantaretki / Mittaripaja | tehty | korjattu | latomis- ja kaksi yksikköä -animaatiot, unit-perhe |
| 16 | M-TIME-01 | Rantaretki / Mittaripaja | tehty | korjattu | kynttiläanimaatio korvaa tikkipalkit, life-perhe |
| 17 | M-TIME-03 | Rantaretki / Mittaripaja | tehty | korjattu | Kaikki perheet oikeassa ajassa (lyhty + sekuntikello), yksikön tarve, uusi siirto |
| 18 | M-MEAS-03 | Rantaretki / Mittaripaja | tehty | korjattu | viivoitin- ja metrianimaatiot, mark-tehtävä, whyAt |
| 19 | M-MEAS-04 | Rantaretki / Mittaripaja | tehty | korjattu | yhteinen measureanim, animoidut esittelyt, numeric whyAt |
| 20 | M-TIME-02 | Rantaretki / Mittaripaja | tehty | korjattu | Kelloanimaatio + Aseta kello -mikropeli, perustelut |
| 21 | M-NUM-17 | Rantaretki / Eväsretki | tehty | korjattu | Jako- ja tasausanimaatio + Jaa itse -mikropeli, perustelut |
| 22 | M-ADD-01 | Rantaretki / Eväsretki | tehty | korjattu | Koriin yhdistämisen animaatio + lauseen rakentaminen, perustelut |
| 23 | M-MUL-01 | Rantaretki / Eväsretki | tehty | korjattu | Pussien täyttöanimaatio + Pakkaa pussit -mikropeli, perustelut |
| 24 | M-DIV-02 | Rantaretki / Eväsretki | tehty | korjattu | Pussitusanimaatio + Pussita-mikropeli, perustelu- ja kielikorjaukset |
| 25 | M-MULTREL-01 | Rantaretki / Eväsretki | tehty | korjattu | Tornikopioanimaatio, plus vs kertaa -animaatio, Rakenna torni -mikropeli |
| 26 | M-DIV-01 | Rantaretki / Eväsretki | tehty | korjattu | Vuorojakoanimaatio + Jaa itse (pack+kasa), kieli- ja perustelukorjaukset |
| 27 | M-NUM-07 | Rantaretki / Hyppykivet | tehty | korjattu | Numerohyppyanimaatiot (kympin ylitys) + Järjestä kivet, perustelut |
| 28 | M-NUM-08 | Rantaretki / Hyppykivet | tehty | korjattu | Lukusuorahyppyanimaatio taaksepäin + hop-perhe lähtökivivirheen palautteella |
| 29 | M-NUM-EQUALSTEP-SEQ | Rantaretki / Hyppykivet | tehty | korjattu | Hyppyanimaatiot +2/+5/+10, rule- ja extend-perheet, perustelut |
| 30 | M-NUM-MULTIPLE-INTRO | Rantaretki / Hyppykivet | tehty | korjattu | Hyppyanimaatiot nollasta, nth- ja hits-perheet, perustelut |
| 31 | M-NUM-16 | Rantaretki / Hyppykivet | tehty | korjattu | diffArcs+twoHoppers-animaatiot, gaps-perhe, miksi-tekstit+vihjeet |
| 32 | M-SYM-PLUS | Rantaretki / Merkkipaja | tehty | korjattu | signScene-animaatio, write-perhe, vihjeet, siirron miksi-tekstit |
| 33 | M-SYM-MINUS | Rantaretki / Merkkipaja | tehty | korjattu | signScene−, pairScene (ero), write-perhe, isot alkukirjaimet, vihjeet |
| 34 | M-SYM-EQUAL | Rantaretki / Merkkipaja | tehty | korjattu | balanceScene, uusi balance-tehtävätyyppi, level-perhe, balanceArt-leikkautumisen korjaus |
| 35 | M-REP-04 | Rantaretki / Merkkipaja | tehty | korjattu | translateScene, pairScene cmp, add ilman paljastavaa merkkiä, miksi+vihjeet |
| 36 | M-ARITH-01 | Rantaretki / Merkkipaja | tehty | korjattu | signScene/translateScene-demot, write-perhe (fact), trueFalse miksi, vihjeet |
| 37 | M-SUB-01 | Rantaretki / Merkkipaja | tehty | korjattu | signScene−/lineHops-demot, back-perhe (line+whyAt), miksi-tekstit kaikkialle |
| 38 | M-NUM-18 | Rantaretki / Simpukkaranta | tehty | korjattu | tenFillScene, splitScene, cupScene, scale-perhe (balance), miksi-tekstit |
| 39 | M-ADD-SUB-01 | Rantaretki / Simpukkaranta | tehty | korjattu | familyScene, lineHops edestakaisin, write-perhe (fact), miksi+vihjeet |
| 40 | M-ADD-FACT-10 | Rantaretki / Simpukkaranta | tehty | korjattu | bigFirstScene-kilpa, doubleScene, race-perhe (line), miksi+vihjeet |
| 41 | M-SUB-FACT-10 | Rantaretki / Simpukkaranta | tehty | korjattu | countUpScene, takeAway-tehtävä, up-perhe, miksi+vihjeet, takeAway-skaalaus |
| 42 | M-ADD-FACT-01 | Rantaretki / Simpukkaranta | tehty | korjattu | signScene ±, translateScene, sign-perhe, cupScene missing-tehtävään, miksi+vihjeet |
| 43 | M-ADD-20 | Rantaretki / Simpukkaranta | tehty | korjattu | bridgeScene, jumpsScene, chain-perhe (build seq), miksi+vihjeet |
| 44 | M-SUB-20 | Rantaretki / Simpukkaranta | tehty | korjattu | bridgeDownScene, jumpsScene ±, steps-perhe, kympin ylitys pakotettu, miksi+vihjeet |
| 45 | M-PLACE-01 | Rantaretki / Kymppilautta | tehty | korjattu | bundleScene, uusi bundle-minipeli (tie-perhe), miksi+vihjeet |
| 46 | M-PLACE-02 | Rantaretki / Kymppilautta | tehty | korjattu | placeScene, reeds-torimiinipeli (order-perhe), miksi+vihjeet |
| 47 | M-PLACE-03 | Rantaretki / Kymppilautta | tehty | korjattu | unbundleScene, Avaa nippu -minipeli (open-perhe), kielioppi, miksi+vihjeet |
| 48 | M-MENTAL-01 | Rantaretki / Kymppilautta | tehty | korjattu | cutScene + hypyt, cut-leikkuuminipeli, use-whyAt, miksi+vihjeet |
| 49 | M-ADD-100 | Rantaretki / Kymppilautta | tehty | korjattu | addReedsScene (niput+sitominen), raft-minipeli, whyAt+vihjeet |
| 50 | M-SUB-100 | Rantaretki / Kymppilautta | tehty | korjattu | subReedsScene (purku+poisotto), take-minipeli, miksi+vihjeet |
| 51 | M-MULTAB-LOW | Rantaretki / Kertopaja | tehty | korjattu | rowsScene/doubleRowsScene/turnScene, grid-rivistöminipeli, whyAt+vihjeet |
| 52 | M-MUL-02 | Rantaretki / Kertopaja | tehty | korjattu | summa→kertolasku-animaatio, kirjoitusminipeli, perustelut ja vihjeet |
| 53 | M-MULDIV-01 | Rantaretki / Kertopaja | tehty | korjattu | purku-animaatio, pakkausminipeli, vihjeet ja whyAt |
| 54 | M-DIV-FACT-01 | Rantaretki / Kertopaja | tehty | korjattu | hyppy- ja jakoanimaatiot, tasajakominipeli, whyAt |
| 55 | M-MEAS-05 | Rantaretki / Rantakioski | tehty | korjattu | heiluva vaaka-animaatio, punnitusminipeli, selitykset ja vihjeet |
| 56 | M-MEAS-06 | Rantaretki / Rantakioski | tehty | korjattu | keittiövaaka-animaatiot, punnusminipeli, perustelut ja vihjeet |
| 57 | M-MEAS-08 | Rantaretki / Rantakioski | tehty | korjattu | kaatoanimaatio, fysikaalisesti johdonmukainen pour, pourtest-minipeli |
| 58 | M-MEAS-09 | Rantaretki / Rantakioski | tehty | korjattu | desilitrakaatoanimaatio, fill-minipeli, vihjeet ja selitykset |
| 59 | M-GEO-01 | Rantaretki / Lajittelulaituri | tehty | korjattu | painallus- ja kääntöanimaatiot, sort-lajittelupeli, kohdekohtaiset selitykset |
| 60 | M-GEO-04 | Rantaretki / Lajittelulaituri | tehty | korjattu | piirto- ja kääntöanimaatiot, kolmen laatikon lajittelupeli, kulmaselitykset |
| 61 | M-TH-02 | Rantaretki / Lajittelulaituri | tehty | korjattu | lajitteluanimaatio (sama kasa, kaksi sääntöä), värilaatikko- ja sääntölajittelupelit |
| 62 | M-TH-03 | Rantaretki / Lajittelulaituri | tehty | korjattu | orderScene-animaatio (etsi lyhyin → siirrä), 3 demoa, fix-mikropeli, whyt+vihjeet |
| 63 | M-TH-04 | Rantaretki / Lajittelulaituri | tehty | korjattu | patternScene+growScene-animaatiot, uusi extend-mikropeli (jatka kuviota), whyt+vihjeet |
| 64 | M-WORK-01 | Rantaretki / Lajittelulaituri | tehty | korjattu | sieveScene (suurennuslasi karsii turhan, luvut lentävät laskuun), sieve-lajittelupeli, whyt+vihjeet, × pois |
| 65 | SCI-ENV-SAFE-01 | Rantaretki / Havaintovihko | tehty | korjattu | prepScene + hazardScene (4 vaaraa, SEIS→kauemmas→aikuinen), järjestys- ja lajittelupelit, vihjeet |
| 66 | SCI-ENV-OBSERVE-01 | Rantaretki / Havaintovihko | tehty | korjattu | havaintoanimaatio + lajittelupeli havainto/arvaus + whyt |
| 67 | SCI-ENV-RECORD-DATA-01 | Rantaretki / Havaintovihko | tehty | korjattu | retkianimaatio + kirjaus itse + paikkakohtaiset whyt + fix |
| 68 | SCI-ENV-PRESENT-DATA-01 | Rantaretki / Havaintovihko | tehty | korjattu | rakentuva esitysanimaatio + lukutehtävät read/most + whyt, ei × |
| 69 | SCI-ENV-RECORD-01 | Rantaretki / Havaintovihko | tehty | korjattu | retki+laskenta→esitys-demo, count-peli määräkorteilla, animoitu check |
| 70 | SCI-ENV-DATA-01 | Rantaretki / Havaintovihko | tehty | korjattu | laskenta→taulukko-animaatio, fill-peli, whyt+taivutus |
| 71 | ENV-PHY-MOTION-OBS-01 | Rantaretki / Havaintovihko | tehty | korjattu | reaaliaikainen lampianimaatio + spot-monivalinta + multi-why moottoriin |
| 72 | ENV-PHY-MOTION-CHANGE-01 | Rantaretki / Havaintovihko | tehty | korjattu | reaaliaikainen uinti joka rakentaa kuvasarjan + välinuolet + next-ennustus + whyt |
| 73 | ENV-PHY-MOTION-01 | Rantaretki / Havaintovihko | tehty | korjattu | duoScene: kaksi ankkaa yhtä aikaa + nopeusvertailupeli, syyt/vihjeet |
| 74 | M-GEO-02 | Aarresaaristo / Aarresaari | tehty | korjattu | shelfScene-animaatio + hyllynjärjestyspeli, syyt/vihjeet |
| 75 | M-COORD-READ-Q1 | Aarresaaristo / Aarresaari | tehty | korjattu | coordWalk-animaatio + koordinaattikorttipeli, tarkat syyt/vihjeet |
| 76 | M-COORD-PLOT-Q1 | Aarresaaristo / Aarresaari | tehty | korjattu | coordWalk-demot (akseli, laivasta), plot-palaute moottoriin, fromShip-perhe |
| 77 | M-COORD-01 | Aarresaaristo / Aarresaari | tehty | korjattu | rakennus-, kulma- ja puolivälianimaatiot + kulmien merkintäpeli |
| 78 | M-SYM-01 | Aarresaaristo / Aarresaari | tehty | korjattu | taittoanimaatio + ruutupeilausanimaatio + maalaa peilikuva -peli |
| 79 | M-NEG-01 | Aarresaaristo / Jäälahti | tehty | korjattu | Animoitu lämpömittari (aste kerrallaan, nollan ohitus), järjestyspeli, vihjeet |
| 80 | M-NEG-02 | Aarresaaristo / Jäälahti | tehty | korjattu | Animoidut askelhypyt lukusuoralla, sort-peli 4 lukua, vihjeet, whyAt |
| 81 | M-NEG-03 | Aarresaaristo / Jäälahti | tehty | korjattu | Animoitu vertailu (hypyt + mittarit), symbol-peli <=>, order-whyt, vihjeet |
| 82 | M-COORD-02 | Aarresaaristo / Jäälahti | tehty | korjattu | Neljän neljänneksen kävelyanimaatiot, peilikävely, sortQ-peli, whyt+vihjeet |
| 83 | M-PLACE-04 | Aarresaaristo / Laivaveistämö | tehty | korjattu | Animoitu setelinvaihto 10→100→1000, kassalokerot + nolla, till-peli, whyt/vihjeet |
| 84 | M-PLACE-05 | Aarresaaristo / Laivaveistämö | tehty | korjattu | Animoitu purku (numero→arvo), satanen→10 kymppiä, split-peli, vihjeet |
| 85 | M-WRADD | Aarresaaristo / Laivaveistämö | tehty | korjattu | Animoitu allekkainlasku sarake kerrallaan + muistinumeron lento, where-diagnoosipeli, vihjeet |
| 86 | M-WRSUB | Aarresaaristo / Laivaveistämö | tehty | korjattu | vaihtoanimaatio + nollan yli + needs-peli |
| 87 | M-EXPR-01 | Aarresaaristo / Laivaveistämö | tehty | korjattu | vihkoanimaatio + steps-peli + whyAt |
| 88 | M-GMEAS-01 | Aarresaaristo / Laivaveistämö | tehty | korjattu | reunakävely + suoristettu nauha + same-peli |
| 89 | M-MULTAB-HIGH | Aarresaaristo / Kertomajakka | tehty | korjattu | pisterivianimaatio + trick-peli + whyAt |
| 90 | M-MULTAB-ALL | Aarresaaristo / Kertomajakka | tehty | korjattu | naapurisarake- ja tekijäanimaatio + row-peli |
| 91 | M-WRMUL | Aarresaaristo / Kertomajakka | tehty | korjattu | osittelu- ja sarakeanimaatio + parts-peli |
| 92 | M-WRDIV | Aarresaaristo / Kertomajakka | tehty | korjattu | jakoanimaatio palat laatikoihin + vaihto, exch-minipeli, whyAt ja vihjeet |
| 93 | M-DIVIS-01 | Aarresaaristo / Kertomajakka | tehty | korjattu | pakkaus- ja hyppytauluanimaatiot, lajittelupeli, vihjeet ja perustelut |
| 94 | M-TH-08 | Aarresaaristo / Kertomajakka | tehty | korjattu | ryhmat-riveiksi- ja jakoanimaatiot, piiri, pairs-peli, vihjeet ja whyAt |
| 95 | M-DEC-01 | Aarresaaristo / Helmisimpukka | tehty | korjattu | nauhan leikkaus- ja tayttoanimaatio lukusuoralla, names-peli, vihjeet |
| 96 | M-DEC-02 | Aarresaaristo / Helmisimpukka | tehty | korjattu | sadasruudukon rakennus- ja 0,3=0,30-animaatiot, equal-peli, vihjeet |
| 97 | M-DEC-03 | Aarresaaristo / Helmisimpukka | tehty | korjattu | metrin zoomausanimaatio dm-cm-mm, mmPair-peli, vihjeet |
| 98 | M-DEC-READ | Aarresaaristo / Helmisimpukka | tehty | korjattu | lukusaantoanimaatio vaiheittain, unit-lajittelupeli, vihjeet |
| 99 | M-DEC-WRITE | Aarresaaristo / Helmisimpukka | tehty | korjattu | kirjoitusanimaatio paikkalaatikoihin, build-peli, vihjeet ja whyAt |
| 100 | M-DEC-DECOMPOSE | Aarresaaristo / Helmisimpukka | tehty | korjattu | purku- ja kokoamisanimaatio, parts-peli, vihjeet ja whyAt |
| 101 | M-DEC-04 | Aarresaaristo / Helmisimpukka | tehty | korjattu | vertailuanimaatio paikka kerrallaan + lukusuora, half-lajittelupeli, vihjeet |
| 102 | M-DEC-ADD | Aarresaaristo / Helmisimpukka | tehty | korjattu | pinolaskuanimaatio pilkut kohdakkain + muistinumero/lainaus, detective-peli, vihjeet ja whyAt |
| 103 | M-DEC-08 | Aarresaaristo / Helmisimpukka | tehty | korjattu | kymmenesosaryhmat + paikka-arvotaulukon siirtoanimaatio, shift-peli, vihjeet |
| 104 | M-DEC-09 | Aarresaaristo / Helmisimpukka | tehty | korjattu | jakoanimaatio lautasille + kokonaisen vaihto, steps-peli, vihjeet |
| 105 | M-UNIT-01 | Aarresaaristo / Saaren tori | tehty | korjattu | rappushyppyanimaatio x10/:10, build-jarjestyspeli, vihjeet ja why |
| 106 | M-UNIT-02 | Aarresaaristo / Saaren tori | tehty | korjattu | stairsScene demos (down, decimal, up), match place game, whyAt direction/step, transfer hint |
| 107 | M-UNIT-03 | Aarresaaristo / Saaren tori | tehty | korjattu | packScene sack-to-bags animation, sense estimation sort, stairs demos, transfer hint/whyAt |
| 108 | M-UNIT-04 | Aarresaaristo / Saaren tori | tehty | korjattu | pourScene jug dl-scale animation, stairs demos, sense+match games, transfer hint/whyAt |
| 109 | M-UNIT-05 | Aarresaaristo / Saaren tori | tehty | korjattu | clockScene real-time minute hand + hour flip, hoursScene 60-min discs, hhmm place game with decimal trap, hints/whyAt |
| 110 | M-FRAC-01 | Aarresaaristo / Piirakkajuhla | tehty | korjattu | cutScene knife cuts + slice-overlay test, sortfair sort game, hints and whys |
| 111 | M-FRAC-02 | Aarresaaristo / Piirakkajuhla | tehty | korjattu | nameScene count-then-colour animation building the fraction, build place game, hints and whys |
| 112 | M-FRAC-03 | Aarresaaristo / Piirakkajuhla | tehty | korjattu | shrinkScene 2-4-8 cuts with size meter, eatTwoScene numerators add, order place game, whys/hints |
| 113 | M-FRAC-05 | Aarresaaristo / Piirakkajuhla | tehty | korjattu | raceScene side-by-side piece race with gap bracket, half sort game, targeted whys, hints |
| 114 | M-FRAC-11 | Aarresaaristo / Piirakkajuhla | tehty | korjattu | mergeScene plates-to-dish with 2n trap pie, sums place game, hints/whyAt; fixed item-level whyAt in M-UNIT-02..05 |
| 115 | M-FRAC-12 | Aarresaaristo / Piirakkajuhla | tehty | korjattu | takeAwayScene eat animation, 1=n/n cut demo, diffs place game, hints, whyAt |
| 116 | M-FRAC-06 | Aarresaaristo / Piirakkajuhla | tehty | korjattu | splitScene knife animation, family sort game, hints, whyAt |
| 117 | M-FRAC-08 | Aarresaaristo / Piirakkajuhla | tehty | korjattu | joinScene grouping animation, reduce place game, hints, whys |
| 118 | M-FRAC-15 | Aarresaaristo / Piirakkajuhla | tehty | korjattu | factoryScene pieces to dishes animation, line place game, hints, whyAt |
| 119 | M-ALG-04 | Aarresaaristo / Vaakasaari | tehty | korjattu | bagScene balance animation with one-side trap, moves sort game, hints, whyAt |
| 120 | M-ALG-05 | Aarresaaristo / Vaakasaari | tehty | korjattu | equalsScene wrong-box tip and count-up animation, level place game, hints, whyAt |
| 121 | M-ALG-06 | Aarresaaristo / Vaakasaari | tehty | korjattu | buildEqScene balance-to-equation with substitution check, spot sort game, hints |
| 122 | M-ALG-07 | Aarresaaristo / Vaakasaari | tehty | korjattu | guessScene guess-and-check table animation, steer sort game, hints |
| 123 | M-ALG-08 | Aarresaaristo / Vaakasaari | tehty | korjattu | machineScene inverse-operation animation, undo place game, whyAt, hints |
| 124 | SCI-ENV-TOOL-01 | Aarresaaristo / Tutkimusasema | tehty | korjattu | match/zero/tare animations, read+tare+sort items, whys+hints |
| 125 | SCI-ENV-MEAS-01 | Aarresaaristo / Tutkimusasema | tehty | korjattu | unit-fit/repeat/scale-read animations, thermometer + unit place items |
| 126 | M-DATA-01 | Aarresaaristo / Tutkimusasema | tehty | korjattu | live tally collection animation, log + tally sort items, whys+hints |
| 127 | M-DATA-02 | Aarresaaristo / Tutkimusasema | tehty | korjattu | live tally + check/fix animation, fix-row game, whys+hints |
| 128 | M-DATA-03 | Aarresaaristo / Tutkimusasema | tehty | korjattu | row/column table-reading animation, cells place game, whys+hints+whyAt |
| 129 | M-DATA-05 | Aarresaaristo / Tutkimusasema | tehty | korjattu | table->bars compare animation, rank place game, distinct values, whyAt |
| 130 | M-DATA-04 | Aarresaaristo / Tutkimusasema | tehty | korjattu | build-table animation with sum check, total item, place whys+hints |
| 131 | M-DATA-09 | Aarresaaristo / Tutkimusasema | tehty | korjattu | fair-count + steps animations, steps place game, compare item, hints |
| 132 | M-DATA-10 | Aarresaaristo / Tutkimusasema | tehty | korjattu | two-way sorting animation, fill place game, cell whyAt, hints |
| 133 | M-TH-07 | Aarresaaristo / Tutkimusasema | tehty | korjattu | 4 real-time scenes (guess vs system outfits, digit tree, handshakes), distinct whys, whyAt, new valid sort game |
| 134 | PHY79-QTY-CONCEPT | Lampilaboratorio / Suureet ja yksiköt | tehty | korjattu | phyanim measureScene (real-time instruments, parts chips), notQtyScene, sort game, whys, hints |
| 135 | PHY79-NUMVALUE | Lampilaboratorio / Suureet ja yksiköt | tehty | korjattu | measureScene focus, partsScene with decimal trap, type item with whyAt, sort game, hints |
| 136 | PHY79-UNIT-CONCEPT | Lampilaboratorio / Suureet ja yksiköt | tehty | korjattu | unitSizeScene to scale, partsScene unit focus, fill place game, whys, hints |
| 137 | PHY79-QTY-01 | Lampilaboratorio / Suureet ja yksiköt | tehty | korjattu | measureScene temperature, partsScene 5 parts scaled, whole-result item, whys on all slots, hints |
| 138 | PHY79-UNIT-CONV | Lampilaboratorio / Suureet ja yksiköt | tehty | korjattu | convScene mul/div with remainder, wq hints+whyAt, match place game, transfer whys |
| 139 | M79-UNIT-LIN | Lampilaboratorio / Suureet ja yksiköt | tehty | korjattu | stairScene comma slides on unit stairs, whyAt, Porraspeli |
| 140 | PHY79-MOTION-REF | Lampilaboratorio / Liike ja nopeus | tehty | korjattu | refScene two camera views, sort game, whys |
| 141 | PHY79-DIST-TIME | Lampilaboratorio / Liike ja nopeus | tehty | korjattu | raceScene tape+stopwatch realtime, read-the-race game, whys |
| 142 | PHY79-SPEED-CONCEPT | Lampilaboratorio / Liike ja nopeus | tehty | korjattu | race + perSecond animations, whys, rank game |
| 143 | PHY79-SPEED-CALC | Lampilaboratorio / Liike ja nopeus | tehty | korjattu | perSecond + avgScene with pause, whyAt, formula slot game |
| 144 | PHY79-SPEED-UNIT | Lampilaboratorio / Liike ja nopeus | tehty | korjattu | unitBuildScene numbers and units split, meaning item, unit factory game |
| 145 | PHY79-SPEED-REARR | Lampilaboratorio / Liike ja nopeus | tehty | korjattu | perSecond s/t modes, triangle animation, whyAt, multiply-or-divide sort |
| 146 | PHY79-SPEED-MIXED | Lampilaboratorio / Liike ja nopeus | tehty | korjattu | hourScene + conv/unitBuild demos, whyAt, ready sort, transfer whys |
| 147 | M79-VAR-UNKNOWN | Lampilaboratorio / Kirjainpaja | tehty | korjattu | guess/priceTag/bag demos, tags item, letter sort, whyAt |
| 148 | M79-VAR-VARYING | Lampilaboratorio / Kirjainpaja | tehty | korjattu | varyScene demos, grow place game, whyAt, hints |
| 149 | M79-VAR-01 | Lampilaboratorio / Kirjainpaja | tehty | korjattu | roleScene + sameLetterScene, roles sort, whyAt, hints |
| 150 | M79-EXPR-EVAL | Lampilaboratorio / Kirjainpaja | tehty | korjattu | evalScene substitution demos, match place game, whyAt, distractor fix |
| 151 | M79-EXPR-FORM | Lampilaboratorio / Kirjainpaja | tehty | korjattu | pipeScene + matchScene demos, translate place game, hints |
| 152 | M79-EQ1-FORM | Lampilaboratorio / Kirjainpaja | tehty | korjattu | eqBuildScene demos, parts place game, hints |
| 153 | M79-FRAC-MUL | Lampilaboratorio / Yhtälöt ja verrannot | tehty | korjattu | partOfPartScene animation, fracChoice whys, match place game, hints, goal |
| 154 | M79-RECIP-01 | Lampilaboratorio / Yhtälöt ja verrannot | tehty | korjattu | flipScene and fitScene animations, missing item, pairs sort game, hints, whyAt |
| 155 | M79-FRAC-DIV | Lampilaboratorio / Yhtälöt ja verrannot | tehty | korjattu | measureScene animation, grow sort game, whyAt, hints |
| 156 | M79-DEC-DIV | Lampilaboratorio / Yhtälöt ja verrannot | tehty | korjattu | commaShiftScene animation, shift place game, whyAt, hints |
| 157 | M79-EQ1-SOLVE | Lampilaboratorio / Yhtälöt ja verrannot | tehty | korjattu | balanceSolveScene animation, moves sort game, whyAt, hints, goal |
| 158 | M79-PROP-01 | Lampilaboratorio / Yhtälöt ja verrannot | tehty | korjattu | mixScene animation, taste sort game, whyAt, hints, goal |
| 159 | M79-LOGIC-01 | Lampilaboratorio / Funktiot ja suorat | tehty | korjattu | rule-hunt animation, rules sort game, aligned whys |
| 160 | M79-DEP-01 | Lampilaboratorio / Funktiot ja suorat | tehty | korjattu | depend animation, depends sort game |
| 161 | M79-FUNC-01 | Lampilaboratorio / Funktiot ja suorat | tehty | korjattu | function machine animation, pairs sort game |
| 162 | M79-FUNC-TABLE | Lampilaboratorio / Funktiot ja suorat | tehty | korjattu | table-fill animation, detect place game |
| 163 | M79-FUNC-GRAPH | Lampilaboratorio / Funktiot ja suorat | tehty | korjattu | plot animation, on-graph sort game |
| 164 | M79-LINE-GRAPH | Lampilaboratorio / Funktiot ja suorat | tehty | korjattu | k/b animation, lines place game |
| 165 | M79-SLOPE | Lampilaboratorio / Funktiot ja suorat | tehty | korjattu | slope stair animation, steepness ranking game |
| 166 | PHY79-DATA-01 | Lampilaboratorio / Mittausdata ja kuvaajat | tehty | korjattu | live logging animation, fill game |
| 167 | PHY79-GRAPH-01 | Lampilaboratorio / Mittausdata ja kuvaajat | tehty | korjattu | plot-data animation, rows place game |
| 168 | PHY79-ST-GRAPH | Lampilaboratorio / Mittausdata ja kuvaajat | tehty | korjattu | live s–t race animation, story game |
| 169 | PHY79-VT-GRAPH | Lampilaboratorio / Mittausdata ja kuvaajat | tehty | korjattu | live v–t animation with speedometer, phases game |
| 170 | M79-INT-ORDER | Lampilaboratorio / Pakkasloki | tehty | korjattu | number-line sort animation, split game |
| 171 | M79-INT-DIST | Lampilaboratorio / Pakkasloki | tehty | korjattu | hop demos, pairs game, whyAt |
| 172 | M79-INT-01 | Lampilaboratorio / Pakkasloki | tehty | korjattu | meet-in-the-middle animation, land game |
| 173 | M79-INT-ADD | Lampilaboratorio / Pakkasloki | tehty | korjattu | hop + zero-pair animations, sign sort game |
| 174 | M79-INT-SUB | Lampilaboratorio / Pakkasloki | tehty | korjattu | thermometer + take-away chip animations, rewrite game |
| 175 | M79-INT-MUL | Lampilaboratorio / Pakkasloki | tehty | korjattu | pattern-on-number-line animation, sign sort game |
| 176 | M79-INT-DIV | Lampilaboratorio / Pakkasloki | tehty | korjattu | chip dealing/bundling animation, quot game |
| 177 | PHY79-ACCEL-CONCEPT | Lampilaboratorio / Kiihtyvyys | tehty | korjattu | Vene/pyörä-kiihtyvyysanimaatio, gain-lasku, lajittelupeli |
| 178 | PHY79-ACCEL-CALC | Lampilaboratorio / Kiihtyvyys | tehty | korjattu | Animoitu kiihdytys+jarrutus, whyAt kaikkiin, build-peli |
| 179 | PHY79-ACCEL-MOTION-GRAPH | Lampilaboratorio / Kiihtyvyys | tehty | korjattu | Live s–t-kaari sekuntimerkeillä, ST_WHY, sekuntimatkojen lajittelupeli |
| 180 | PHY79-ACCEL-VT-GRAPH | Lampilaboratorio / Kiihtyvyys | tehty | korjattu | Live v–t + jyrkkyyskolmio, whyt/whyAt, kiihtyvyyksien sijoittelupeli |
| 181 | PHY79-ACCEL-GRAPH | Lampilaboratorio / Kiihtyvyys | tehty | korjattu | Kaksoiskuvaaja-animaatio, perustelut, v–t-lajittelupeli |

## Kierrokset

### M-TIME-03 Sekunti (korjattu, rev audit1)
- **Löydös** (käyttäjän palaute): "Valo paloi näin kauan" näytti staattisia sekuntipalikoita. Kesto ei kulunut lainkaan (K2, K3 ei täyty). Liikesoitin korvasi vain osan tehtävistä, joten staattiset perheet jäivät.
- **Suunnitelma**: kaikki perheet oikeaan aikaan: lyhty palaa oikeita sekunteja ja sekuntikello käy vain sen palaessa. Esittelyyn mittayksikön tarve (taputukset vaihtelevat, sekunti ei).
- **Toteutus**: uusi yleinen ajastettu kohtaus `src/ui/anim.ts` (Toista/Tauko/Katso uudelleen/Näytä loppu, autoplay paitsi reduced motion, piilotettu sivu pysäyttää). `src/content/timeanim.ts`: lyhty, 10 s kierroksen sekuntikello, `burnScene`, `clapScene`, `hopSwimScene`. Perheet: lamp (kuinka kauan paloi), compare (kaksi lyhtyä, kumpi kauemmin ja kauanko), unit (taputukset vs. sekuntikello), siirto: hyppy + uinti yhteensä.
- **Validointi**: npm run check vihreä; dumppi: kaikki kohtaukset [ANIMAATIO] tai [LIIKESOITIN]; selaimessa animaatio etenee 0 s → 1 s → … ja pysähtyy, kun lyhty sammuu.

### M-NUM-STABLE-ORDER Laskuloru (korjattu, rev audit1)
- **Löydös**: loru on ajassa etenevä asia, mutta esittely oli kaksi staattista sammakkokuvaa (K2). Oppija vain kuunteli ja valitsi (K6). "Mikä sana tulee seuraavaksi" -tehtävän väärillä vaihtoehdoilla ei ollut selityksiä (K5).
- **Suunnitelma ja toteutus**: uusi `hopWords`-animaatio (`src/content/countanim.ts`): Loikka hyppii kiveltä kivelle ja jokainen kivi saa sanansa laskeutuessa; yli hypätty kivi jää punaiseksi kysymysmerkiksi. Esittely näyttää ehjän ja rikkinäisen lorun. Uusi perhe *spot*: katso hyppy ja kerro, mikä sana jäi sanomatta. Uusi perhe *rhyme*: lapsi rakentaa lorun napauttamalla sanat järjestykseen (uusi `build`-tila `seq`, palaute nimeää kohdan: "Kaksi jäi välistä" / "Kohdassa 2 pitäisi olla kaksi"). *next*-perheeseen ja siirtotehtävään selitys jokaiselle väärälle vaihtoehdolle. Kuunteluvertailu *swap* säilyy.
- **Validointi**: npm run check vihreä (+1 testi seq-tarkistukselle; edistymistestit leimaavat vastaukset nykyiseen versioon); selaimessa hyppy etenee ja "?"-kivi näkyy, rakennus antaa oikean palautteen, kuuden sanan rivi rivittyy 360 px:ssä.

### M-NUM-1TO1 Yksi kerrallaan (korjattu, rev audit1)
- **Löydös**: napautustehtävä on hyvä (K6). Esittely ja arviointitehtävä olivat valmiiksi numeroituja kuvia, joten laskemisen *teko* (osoitus esine kerrallaan) ei näkynyt (K2). "Kyllä/Ei"-arvio ei kertonut, mikä meni pieleen, eikä vääriin vastauksiin ollut palautetta (K5).
- **Toteutus**: uusi `countAlong`-animaatio: osoitin siirtyy esineeltä toiselle ja numero ilmestyy, ja kuvateksti kertoo sanotut sanat. Esittely näyttää kolme tapausta: oikein, kahdesti laskettu ja ohitettu (virheet korostetaan vain esittelyssä). Arviointi: "Katso, kun Loikka laskee. Mitä tapahtui?", vaihtoehdot oikein / kaksi sanaa / ilman sanaa. Jokaiselle väärälle vaihtoehdolle on oma palaute, ja selitys vertaa sanottua lukua esineiden määrään.
- **Validointi**: npm run check vihreä; selaimessa osoitin etenee ja tuplalaskenta näkyy (1, 2, 3 samassa marjassa → neljä).

### M-NUM-01 Laske kaikki (korjattu, ei rev-muutosta)
- **Löydös**: tehtävät ovat aktiivisia (napautus ja kokonaismäärä rivissä, ringissä ja hajallaan) ja siirto on sekakasa, eli K4 ja K6 täyttyvät. Esittely kuitenkin puhui napauttamisesta mutta näytti valmiin kuvan (K2), ja ringin tärkein virhe (alku lasketaan uudestaan) jäi näyttämättä. Väärän kokonaismäärän palaute oli yleinen (K5).
- **Toteutus**: esittely on kolme `countAlong`-animaatiota: rivi (viimeinen sana kertoo määrän), rengas ja alkumerkki, sekä rengas, jossa alku lasketaan uudestaan (8 vs. 7). Moottorin kokonaismääräpalaute kertoo suunnan: liian suuri luku viittaa kahdesti laskettuun ja liian pieni laskematta jääneeseen (koskee kaikkia `tapcount`-tehtäviä, joissa merkintä on vapaaehtoista).
- **Validointi**: npm run check vihreä; selaimessa rengas ja "▲ alku" -merkki eivät mene päällekkäin, ja tuplalaskenta päättyy lukuun kahdeksan.

### M-NUM-02 Montako kaikkiaan (korjattu, ei rev-muutosta)
- **Löydös**: antamistehtävä ("Anna Aavalle kolme") on erinomainen kardinaalisuuden testi (K6). Esittely ja "montako"-kuva olivat valmiita numerokuvia (K2), eikä viimeisen sanan muuttumista koko joukon nimeksi näytetty. Siirron laatikko oli pelkkä kysymysmerkki ilman laskemista. Vaihtoehtoon n+1 ei ollut selitystä (K5).
- **Toteutus**: `countAlong`-animaatioon tuli kaksi optiota. `total`: laskun jälkeen joukon ympärille syttyy rengas ja kuvateksti sanoo "Niitä on neljä!". `cover`: laskun jälkeen laatikko laskeutuu esineiden päälle. Esittelyssä ovat molemmat. Montako-tehtävä näyttää laskun ajassa, ja siirrossa nähdään laskettujen esineiden peittyminen. Kaikille väärille vaihtoehdoille on nyt selitys ja vihje.
- **Validointi**: npm run check vihreä; selaimessa rengas ja laatikko animoituvat, ja asettelu pysyy 360 px:n sisällä.

### M-NUM-WORD-NUMERAL Sana ja numero (korjattu, rev audit1)
- **Löydös**: symbolin ja sanan yhdistäminen on luonnostaan staattista, joten animaatio ei ole välttämätön. Esittely oli kuitenkin kaksi irrallista numeroa (K2 heikko). Väärillä vaihtoehdoilla ei ollut selityksiä (K5), eikä tyypillisiä sekaannuksia (6/9, 1/7, 2/5, 3/8) harjoiteltu. Oppija toimi vain valitsemalla (K6).
- **Toteutus**: esittelyyn `numeralTrain` (0–10 syttyy yksi kerrallaan nimen kanssa) ja samannäköisten numeroiden erottaminen. *w2n* käyttää samannäköistä numeroa häiriönä, ja palaute kertoo muodon eron. *n2w*:n jokaisella väärällä vastauksella on selitys. Uusi perhe *pairs*: kolme sanaa raahataan oikeiden numeroiden alle (place). Siirron (12–19) väärin päin ja ilman kymppiä -virheille on omat selitykset.
- **Validointi**: npm run check vihreä; selaimessa juna etenee 0 → 10 ("10" mahtuu), ja paritehtävän isot numerot näkyvät 360 px:ssä. Taivutusvirhe ("seitsemäntoistassa") korjattiin ennen commitia muotoon "Luvussa 17 …".

### M-NUM-QTY-NUMERAL Rasian lappu (korjattu, rev audit1)
- **Löydös**: yksi staattinen esittely. Oppija vain tunnisti (määrä → numero, numero → määrä) eikä tuottanut määrää numerosta (K6). Väärillä vaihtoehdoilla ei ollut selityksiä (K5).
- **Toteutus**: `fillBox`-animaatio: esineet putoavat rasiaan yksi kerrallaan, ja lappu näyttää laskun (esittelyssä molemmat suunnat). Uusi perhe *fill*: numero näkyy, ja lapsi valitsee rasiaan yhtä monta (multi + count). Moottorin multi-count-palaute kertoo nyt suunnan ("Valitsit 4, se on liian monta. Pysähdy luvussa 3."). Koskee myös M-NUM-02:n antamistehtävää. Selitykset q2n- ja n2q-vaihtoehdoille.
- **Validointi**: npm run check vihreä; selaimessa esineet putoavat, lappu kasvaa 1 → 4 ja loppuun tulee "Lappuun tulee 4".

### M-NUM-QTY-WORD Määrä ja sana (korjattu, rev audit1)
- **Löydös**: tehtävät olivat pelkkää tunnistamista staattisista kuvista, eikä vääriin vastauksiin ollut selityksiä (K5). Lukumäärän säilyminen jäi kokonaan käsittelemättä, vaikka se on tämän iän tärkein virhekäsitys ("pidempi rivi = enemmän").
- **Toteutus**: esittely on animoitu lasku ja rengas ("viisi") sekä `spreadRow`, jossa simpukat liukuvat erilleen ja määrä pysyy samana. Uusi perhe *spread*: esineet siirtyvät (erilleen tai yhteen), ja lapsi kertoo, montako niitä on nyt. Houkuttimina ovat suuremmat tai pienemmät luvut, ja palaute sanoo, ettei yhtään tullut lisää tai viety pois. Selitykset q2w:hen (liikaa tai liian vähän → kahdesti laskettu tai jäi laskematta), w2q:hen ja siirron Kyllä/Ei-vastaukseen.
- **Validointi**: npm run check vihreä; selaimessa rivi levenee 1–3 s:n aikana 360 px:n sisällä.

### M-NUM-03 Kolme tapaa (korjattu, ei rev-muutosta)
- **Löydös**: tehtävät ovat vahvoja: kaksi raahausperhettä (esineet → numero + sana ja numero → määrä + sana), slottikohtainen palaute ja siirtona ristiriidan etsintä (K4–K6 täyttyvät). Esittely oli kaksi päällekkäin liimattua kuvaa (K2, K7), ja siirron väärältä vastaukselta puuttui selitys.
- **Toteutus**: `threeWays`-animaatio: marjat lasketaan, sitten kortti "4" ja kortti "neljä" liukuvat esiin, ja kuvateksti etenee laskusta johtopäätökseen. Siirtoon tuli vihje ja selitys väärälle laatikolle.
- **Validointi**: npm run check vihreä; selaimessa kortit ilmestyvät järjestyksessä 360 px:n sisällä.

### M-NUM-06 Tyhjä pesä (korjattu, ei rev-muutosta)
- **Löydös**: palautteet ovat hyviä (K5): "10 sisältää nollan mutta on iso luku" ja muut. Siirto alaspäin laskemiseen on uusi tilanne (K4). Esittely kertoi syömisestä yksi kerrallaan, mutta näytti yliviivatun kuvan (K2). "Syö kaikki" -tehtävä oli samoin staattinen. Intro (pesä ja munat) ei liittynyt esittelyyn (marjat) (K1).
- **Toteutus**: uusi yleinen `takeAway`-animaatio (käytetään myöhemmin myös vähennyslaskussa): Loikka syö lautaselta yhden kerrallaan, ja "Jäljellä"-laskuri pienenee nollaan. Tehtävissä laskuri piilotetaan, jottei se paljasta vastausta. Intro kertoo nyt tyhjästä pesästä ja siitä, miten nolla syntyy.
- **Validointi**: npm run check vihreä; selaimessa animaatio päättyy tyhjään lautaseen ja tekstiin "Jäljellä 0".

### M-NUM-10 Kumpi enemmän? (korjattu, rev audit1)
- Kritiikki: demo oli staattinen vertailukuva; ei ajassa etenevää "ensin kympit, sitten ykköset" -päättelyä. Merkkitehtävästä puuttui luvut näyttävä kortti, väärille vaihtoehdoille ei ollut perusteluja, eikä järjestämistä harjoiteltu.
- Korjaus: uusi animaatio `tensRace` (kymppinipuista ensin, sitten ykköset, suurempi luku hehkuu ja kuvateksti selittää), demot 41/38 ja 52/57; merkkiperhe näyttää kortin "a □ b"; perustelut jokaiselle väärälle valinnalle; uusi perhe `order` (Pienin–Keskimmäinen–Suurin, ansaluvut); siirtotehtävään perustelu ja vihje.
- Validointi: tsc + vitest vihreä; selaimessa 360 px: animaatio etenee ja loppukuva on selkeä, järjestystehtävän paikat mahtuvat.

### M-TH-01 Sama ja eri (korjattu, rev audit1)
- Kritiikki: esittely oli kaksi staattista kuvaa, eikä vertailun järjestystä (muoto → väri → koko) näytetty. Väärille valinnoille ei ollut perusteluja eikä vihjeitä, kuvioilla ei ollut ääneen luettavaa nimeä, eikä eroa harjoiteltu nimeämään.
- Korjaus: uusi animaatio `compareScene` (suurennuslasi käy läpi muodon, värin ja koon, jokainen saa ✓ sama / ✗ eri, ja lopussa johtopäätös). Kolme esittelyä: kaikki sama, väri eri, koko eri. Jokaiselle väärälle valinnalle perustelu ("Tässä väri on eri." / "Tämä on samanlainen kuin kaksi muuta"). Kuvioilla puhuttu nimi, esim. "iso sininen kolmio". Uusi perhe `which` ("Mikä näissä kahdessa on eri?" Muoto/Väri/Koko), jossa väärille perustelu "Väri on sama: molemmat ovat punaisia". Siirtotehtävään kahden ehdon vihje ja perustelut.
- Validointi: tsc ja vitest vihreä. Selaimessa 360 px: animaation loppukuva ja which-tehtävä ok, kuviot rinnakkain.

### M-MEAS-00 Kumpi pidempi (korjattu, rev audit1)
- Kritiikki: tavoite lupasi myös painavuuden vertailun, mutta tehtävissä oli vain nauhoja ja torneja. Esittely oli kaksi staattista kuvaa ennen ja jälkeen, eikä siirtoa näytetty. Väärä nauhavastaus ei saanut perustelua, vaikka "myöhemmin alkava nauha näyttää pidemmältä" on lesson ydinansa. Tornitehtävästä puuttuivat perustelut ja vihje.
- Korjaus: uusi animaatio `alignScene` (alkuviiva ilmestyy, nauha liukuu sen kohdalle ja pidemmän loppupää hehkuu) kahdessa esittelyssä, eri pituiset ja yhtä pitkät. Uusi animaatio `balanceScene` (vaaka kallistuu ajassa) ja uusi perhe `heavy`: isompi esine on kevyempi (ansa "iso ≠ painava"), mukana myös tasapainotapaus. Moottorin nauhatarkistus antaa nyt suuntaavan palautteen ("ulottuu pidemmälle vain siksi, että se alkaa myöhemmin"). Tornitehtävään perustelut ("Jalusta ei kuulu torniin") ja vihje.
- Validointi: tsc ja vitest vihreä, uusi testi nauhapalautteelle. Selaimessa 360 px: liukuanimaation loppukuva ok. Vaa'an kallistussuunta oli aluksi väärin, korjattu ja tarkistettu.

### M-MEAS-02 Nauhan pituus (korjattu, sisältö ennallaan)
- Kritiikki: pysyvyyden käsite (taivutettu nauha on yhtä pitkä) näytettiin kahtena staattisena kuvana, eikä taivutusta ja oikaisua nähty tapahtumana. Polkutehtävästä puuttuivat perustelut ja vihje. Leikkaustehtävä oli kaksi staattista kuvaa ilman perusteluja.
- Korjaus: nauha mallinnetaan yhtä pitkien palojen ketjuna, joten pituus säilyy jokaisessa animaation kuvassa. `bendScene` taivuttaa nauhan aaltoon ja oikaisee sen takaisin, ja päät osuvat haalean vertailunauhan viivoille. `pathScene` oikaisee mutkapolun suoran polun viereen ja näyttää lisämatkan. `cutScene` näyttää saksien leikkauksen, jonka jälkeen puolikas liukuu alle. Tehtävissä taivutus ja leikkaus näkyvät animaationa, ja kaikkiin perheisiin on lisätty perustelut ja vihjeet. Kolmas esittely kertoo, että leveys ei ole pituutta.
- Validointi: tsc ja vitest vihreä. Selaimessa välikuvat t = 2/4/8, polun oikaisu ja leikkaus tarkistettu 340 px leveydellä. Rev ei muuttunut, koska tehtävien merkitys ja perheet pysyivät samoina.

### M-MEAS-01 Klemmarimittari (korjattu, rev audit1)
- Kritiikki: oppilas ei mitannut itse, vaan katsoi valmiiksi ladottuja paloja. Esittelyt olivat staattisia, eikä latomista ja laskemista nähty tapahtumana. Väärille vaihtoehdoille ei ollut perusteluja: miksi rako, päällekkäisyys tai eri kokoiset palat antavat väärän tuloksen.
- Korjaus: uusi tehtävätyyppi ja mikropeli `iterate` "Mittaa paloilla". Oppilas lisää paloja yksi kerrallaan, jokainen pala putoaa paikalleen ja luku sanotaan ääneen. Pala voi ottaa pois, ja "Valmis" tarkistaa. Nauhan yli menevä pala muuttuu punaiseksi, ja palaute kertoo suunnan. Tämä on uusi perhe `lay`. Animaatio `layScene` latoo palat ajassa ja laskee ne, ja rakoversiossa rako korostuu ja kuvateksti kertoo oikean pituuden. Perustelut on lisätty judge-perheen jokaiselle virhetyypille, count-perheen liian vähän / liian monta -tilanteisiin ja siirtotehtävään.
- Validointi: tsc ja vitest vihreä, uusi testi iterate-tarkistukselle. Selaimessa 360 px: pelattu läpi yhdellä ylimääräisellä palalla, jolloin palaute ja punainen pala näkyivät. Esittelyjen välikuvat tarkistettu.

### M-NUM-14 Mittausluku (korjattu, rev audit1)
- Kritiikki: esittely oli yksi staattinen kuva. Mittausluvun ydin jäi näyttämättä: luku syntyy laskemalla ladotut palat, ja luku riippuu palan koosta. Väärille vaihtoehdoille ei ollut perusteluja.
- Korjaus: esittely 1 `layScene(6)` latoo ja laskee palat ajassa. Esittely 2 `twoUnitScene(6, 2)` mittaa saman nauhan ensin pienillä ja sitten isoilla paloilla, tuloksena 6 ja 3. Uusi perhe `unit`: Aavan isompi luku on ansa, koska nauha on sama, ja jokaiselle väärälle vastaukselle on perustelu. read- ja make-perheisiin sekä siirtotehtävään on lisätty perustelut ja vihjeet.
- Validointi: tsc ja vitest vihreä. Selaimessa 360 px tarkistettu twoUnitScenen välikuva ja loppukuva sekä unit-tehtävä.

### M-TIME-01 Kumpi kestää (korjattu, rev audit1)
- Kritiikki: kesto näytettiin tikkipalkkeina. Tämä on juuri se "sekuntipalikka"-esitys, jonka käyttäjä hylkäsi, ja lisäksi se toi yksikön ("tikkiä") tunnille, jossa verrataan suoraan ilman yksikköä. Siirtotehtävän ansaa (myöhemmin syttynyt sammuu viimeisenä) ei voinut todentaa kuvasta ilman palkkeja. Elämänläheinen kestojen vertailu puuttui.
- Korjaus: uusi `candleScene` (timeanim.ts), jossa kynttilät palavat reaaliajassa ja lyhenevät. Lyhentynyt kynttilä on itse kesto, joka säilyy näkyvissä myös eri aikaan sytytettäessä. Kaksi esittelyä: yhtä aikaa syttyvät sekä ansa, jossa myöhemmin syttynyt sammuu viimeisenä. Uusi perhe `life`, joka vertaa arkisia kestoja, esimerkiksi aivastus ja yöuni. Kaikkiin perheisiin perustelut ja vihjeet. Vanhat `timePaint` ja `lamps` poistettu.
- Validointi: tsc ja vitest vihreä. Selaimessa tarkistettu ansaesittelyn välikuva (t=4) ja loppukuva: punainen on lyhyempi, ja kuvateksti kertoo, että se paloi kauemmin.

### M-MEAS-03 Mittanauha (korjattu, rev audit1)
- Kritiikki: viivoittimen lukeminen näytettiin staattisena kuvana, eikä välien laskemista nähty tapahtumana. "Sata senttiä on metri" mainittiin vain ohimennen ilman kuvaa. Oppilas vain valitsi vaihtoehdon eikä itse käyttänyt viivoitinta. Arvioinnin väärille vaihtoehdoille ja siirtotehtävän "yhtä pitkälle" -vastaukselle ei ollut perusteluja.
- Korjaus: `rulerScene` liu'uttaa kepin viivoittimelle, laskee välit numeroiduin kaarin ja korostaa ansan, jossa loppukohta ei kerro pituutta, kun keppi ei ala nollasta. `metreScene` täyttää metrin kymmenellä 10 cm palalla, ja laskuri etenee 10, 20, … 100 cm = 1 m. Uusi perhe `mark`: oppilas napauttaa viivoittimesta kepin loppukohdan, kun alku ja pituus on annettu. Moottoriin lisättiin `whyAt`-palaute lukusuoratehtäviin (aloitettu nollasta / väli jäi laskematta / väli liikaa). Arviointiin yksikköperustelut, siirtotehtävään perustelu ja vihje.
- Validointi: tsc ja vitest vihreä, uusi testi whyAt-palautteelle. Selaimessa tarkistettu viivoitin- ja metrianimaatioiden loppukuvat sekä mark-tehtävä alkukohdalla 2.

### M-MEAS-04 Mittaa yksiköllä (korjattu, rev audit1)
- Kritiikki: esittelyt olivat staattisia kuvia. Yksikön koon vaikutus näytettiin vain tehtävän kuvana, ei esittelyssä. Numerovastaukset eivät antaneet suuntaavaa palautetta yleisimpään virheeseen, jossa loppukohta luetaan pituudeksi.
- Korjaus: mittausanimaatiot siirrettiin yhteiseen moduuliin `measureanim.ts` (layScene, twoUnitScene, rulerScene, metreScene), jota käyttävät M-MEAS-01/03/04 ja M-NUM-14. Kolme ajassa etenevää esittelyä: palojen latominen, viivoittimen välien laskeminen alkukohdasta 2 ja sama rima kahdella yksiköllä. Moottoriin lisättiin `whyAt`-palaute numerovastauksiin, ja tässä se kattaa loppukohdan, viivojen laskemisen ja yhden palan virheen. Vihjeet lisätty unitSize-perheeseen ja siirtotehtävään.
- Validointi: tsc ja vitest vihreä. Selaimessa tarkistettu kaikkien neljän oppitunnin animaatioiden loppukuvatekstit siirron jälkeen. Huomattiin törmäys, kun alku on 1 (loppukohta = viivat), ja loppukohdan perustelu asetettiin etusijalle.

**Kritiikki:** Kellotaulun esittely oli kaksi staattista kuvaa – ajan kuluminen ja viisarien yhteisliike (lyhyt viisari hiipii lukujen välissä) jäi näkymättä. Oppilas vain valitsi kuvia/sanoja, ei koskaan itse asettanut kelloa. Tasatunti- ja siirtotehtävistä puuttuivat virheperustelut ja vihjeet.
**Korjaus:** `clockScene`-animaatio (11,5 s): 3.00 → 3.30 (tauko) → 4.00, digitaalinen lukema ja vaiheittaiset tekstit; lyhyt viisari liikkuu jatkuvasti. Uusi mikropeli `clock` / perhe `set` ("Aseta kello"): oppilas kääntää viisareita ±30 min, molemmat viisarit animoituvat yhdessä; tarkistus erottaa minuutti- ja "puoli = ennen seuraavaa tasaa" -virheen. Perusteluja: `full`-perheeseen ja siirtotehtävän väärille kelloille, vihjeet. Yhteinen `ui/clock.ts`. rev → AUDIT_REV.
**Validointi:** tsc + vitest 1589 ok; selaimessa widget 3×↻ → 1.30 hyväksytty, 2.30 → oikea virheviesti; animaation ruudut 3.00/3.18/3.30/3.48/4.00 tarkastettu.

**Kritiikki:** Esittely kertoi "annetaan vuorotellen", mutta näytti vain staattiset rivit – itse jakotoimintaa ei nähty eikä oppilas päässyt jakamaan. Lukutehtävien väärillä vaihtoehdoilla ei ollut perusteluja, vihjeet puuttuivat (fair, number, siirto).
**Korjaus:** `dealScene` (simpukat lentävät vuorotellen Loikalle ja Aavalle, laskurit kasvavat, lopuksi "4 ja 4 on 8") ja `evenOut` (epäreilu 5/3 tasataan siirtämällä yksi → 4/4). Uusi mikropeli `deal` / perhe `deal`: oppilas jakaa kasan napauttamalla "Loikalle"/"Aavalle", esine lentää; tarkistus: kasaan jäi / ei yhtä monta. Perustelut `w + w = 2w, ei 2h` -muodossa, siirtotehtävän kaikille vääriille, vihjeet kaikkiin perheisiin. rev → AUDIT_REV.
**Validointi:** tsc + vitest ok; selaimessa jako 3/2 + 1 kasassa → "Kasaan jäi vielä 1"; animaatioruudut tarkastettu (jako 1/1, 4/4; tasaus 5/3 → 4/4).

**Kritiikki:** Yhdistämisen ydin – kaksi joukkoa liikkuu yhdeksi ja laskeminen jatkuu eikä ala alusta – näkyi vain kahtena staattisena kuvana. Tarinan ja merkinnän (a + b = c) yhteyttä ei harjoiteltu. Väärillä vaihtoehdoilla ei perusteluja (esim. "vain Loikan osa"), expr- ja siirtotehtävistä puuttuivat vihjeet.
**Korjaus:** `joinScene`: Loikan ja Aavan eväät lentävät yksi kerrallaan koriin, numerot jatkuvat värikoodattuina (Loikan/Aavan), välissä "laskeminen jatkuu, ei ala alusta", lopuksi lause liukuu esiin. Kaksi animoitua esittelyä. Uusi perhe `sentence`: oppilas rakentaa koritarinasta lauseen palapaloilla (vaihdannainen järjestys hyväksytään). Perustelut kaikille vääriille (osa vs. koko, yksi liikaa/liian vähän), vihjeet expr/siirto. rev → AUDIT_REV.
**Validointi:** tsc + vitest ok; selaimessa animaation ruudut 0.5–6.5 s, rakennustehtävä hyväksyy 2 + 3 = 5.

**Kritiikki:** Kertolaskun merkitys (yhtä suuret ryhmät kertyvät) näkyi vain staattisena pussikuvana ja tekstinä "3 × 2 = 6"; tekijöiden roolia (ryhmien määrä vs. ryhmän koko) ei näytetty. Oppilas ei itse muodostanut ryhmiä. expr-perheen väärät ilman perusteluja, total-perheen perustelutaulukko oli kohdistettu väärin suodatuksen jälkeen, vihjeet puuttuivat; siirrossa "yksi irtomarjaa".
**Korjaus:** `packScene`: pussit täyttyvät yksi kerrallaan, kertymä (2, 4, 6) pussien päällä, lopuksi toistuva yhteenlasku ja kertolasku liukuvat esiin; toinen esittely selittää tekijöiden roolit (4 × 3). Uusi mikropeli `pack` / perhe `pack`: oppilas napauttaa pusseja täyttäen jokaiseen g; väärä pussi punaisena + perustelu. Perustelut funktiona arvon mukaan (total, expr), vihjeet kaikkiin, kielikorjaus. Yhteinen `bagGeo`. rev → AUDIT_REV.
**Validointi:** tsc + vitest ok; selaimessa 2/2/3 → "Pussissa 3 on 3…", animaation ruudut tarkastettu.

**Kritiikki:** Sisältöjaon toiminta ("otetaan g kerrallaan, kunnes kasa loppuu, lasketaan pussit") näkyi vain kahtena staattisena kuvana. story-perheen virheperustelu paljasti vastauksen ("Pusseja on 3"). Kielivirheet: "kolme marjan pusseihin", "kahden laatikoihin". Vihjeet puuttuivat story/siirto, osa vääristä ilman perustelua.
**Korjaus:** `bagupScene`: kasasta lentää g kerrallaan uuteen pussiin, pussit numeroituvat, kasan jäljellä oleva määrä kerrotaan; toinen esittely näyttää isomman pussin → vähemmän pusseja. Uusi mikropeli `bagup` / perhe `fill`: oppilas täyttää pusseja itse; liian monta → punainen tyhjä pussi + perustelu, liian vähän → "kasaan jäi". Perustelut korjattu (ei paljasta vastausta) ja täydennetty, vihjeet, kielikorjaukset. Laskuri päivittyy heti (animaatio vain visuaalinen, toimii myös ilman rAF:ia). rev → AUDIT_REV.
**Validointi:** tsc + vitest ok; selaimessa 5 pussia 20/5:stä → punainen pussi + "kasa loppui jo 4 pussin jälkeen"; animaatioruudut tarkastettu.

**Kritiikki:** "Kertaa niin korkea" ja additiivinen ansa (3 × 2 vs 2 + 3) esitettiin staattisena tornikuvana ja tekstinä "3 × 2 = 6, ei 5". Perustelutaulukot oli kohdistettu väärin (suodatuksen jälkeen), howMany-tehtävissä joskus vain kaksi vaihtoehtoa. Siirtotehtävästä puuttuivat perustelut ja vihje; vihjeet puuttuivat kaikkialta.
**Korjaus:** `timesTower`: Aavan torni kopioituu Loikan torniin k kertaa, hakasulkeet 1×, 2×, 3×. `moreVsTimes`: rinnakkain kasvavat "2 + 3" (punaiset lisäpalikat) ja "3 × 2" (kokonaiset tornit). Uusi mikropeli `stack` / perhe `build`: oppilas rakentaa tornin palikka kerrallaan, väri vaihtuu jokaisen Aavan tornin korkeuden kohdalla; tarkistus tunnistaa additiivisen ansan ja vajaan kopion. Perustelut arvon mukaan, kolmas vaihtoehto, vihjeet, siirron perustelut. rev → AUDIT_REV.
**Validointi:** tsc + vitest ok; selaimessa 5 palikkaa (a=2,k=3) → punainen torni + "Aavan torni ja vielä 3 palikkaa (2 + 3)…"; animaatioruudut tarkastettu.

**Kritiikki:** Ositusjaon "yksi kerrallaan jokaiselle vuorotellen" näkyi vain staattisena rivinä ja lautaskuvana; oppilas ei itse jakanut. Kielivirhe "jaetaan tasan kaksi ystävälle". Perustelutaulukot kohdistettu väärin suodatuksen jälkeen (deal, story, siirto); vihjeet puuttuivat fair/story/siirto.
**Korjaus:** `roundRobin`: kasasta lentää yksi kerrallaan kuhunkin pussiin, kierrokset kerrotaan, laskurit pusseissa; toinen esittely näyttää että vähemmälle jaettaessa kukin saa enemmän. Uusi perhe `share`: `pack`-mikropeli rajatulla kasalla (oppilas jakaa itse; "kasaan jäi" / "pussissa N on x"). Allatiivikorjaus (kahdelle/kolmelle/neljälle), perustelut arvon mukaan, vihjeet. rev → AUDIT_REV.
**Validointi:** tsc + vitest ok; selaimessa 2/2/1 + 1 kasassa → "Kasaan jäi vielä 1"; animaatioruudut tarkastettu.

**Kritiikki:** Lukujonon "joka hypyllä yksi lisää" esitettiin staattisina kivirivien kuvina; 19 → 20 -kymmenylitys (big-perheen ydinvaikeus) puuttui esittelystä. Oppilas vain valitsi seuraavan luvun, ei koskaan järjestänyt jonoa. d = 1 -tehtävien väärille ja siirron väärille ei perusteluja; siirrosta puuttui vihje.
**Korjaus:** Kolme animoitua esittelyä `hopWords`-numeroilla: 4–7, 9–12 ja 18–21 (kymmenylitys korostettuna kuvatekstissä). Uusi perhe `order`: sekoitetut numerot järjestetään kiville (build/seq), aloitukset valittu niin, että jono ylittää kympin. Perustelut seqNext d = 1 (hyppäsi yli / jo jonossa) ja siirtoon, vihje siirtoon. rev → AUDIT_REV.
**Validointi:** tsc + vitest ok; selaimessa järjestys 17 18 20 19 21 → "Kohdassa 3 pitäisi olla 19"; animaatioruudut tarkastettu.

**Kritiikki:** Taaksepäin laskeminen esitettiin staattisina kuvina; kymmenylitys taaksepäin (20 → 19) puuttui. Yleisin virhe – lähtökiven laskeminen hypyksi – jäi tunnistamatta lukusuoratehtävässä. gap-perheessä ei perusteluja, before-perheessä n − 2 ilman perustelua, vihjeet puuttuivat.
**Korjaus:** Uusi `lineHops`-animaatio: Loikka hyppää lukusuoralla, jokainen hyppy jättää "−1"-kaaren ja luku sanotaan; esittelyt 8 → 5 ja 21 → 18 (kympin ylitys), kolmas esittely "lähtökivi ei ole hyppy". Uusi perhe `hop`: lukusuoralle napautus `whyAt`-palautteella (lähtökivi laskettu, väärä suunta, ei hypätty); sama palaute siirtoon. Perustelut gap/before, vihjeet. rev → AUDIT_REV.
**Validointi:** tsc + vitest ok; selaimessa animaation ruudut 21 → 20 → 18 ja whyAt-palaute tarkastettu.

**Kritiikki:** Ainoa esittely oli staattinen kivirivi 2–10; hypyn pituutta (sääntöä) ei näytetty liikkeenä eikä harjoiteltu erikseen. which-perheessä ei perusteluja, siirrossa ei perusteluja eikä vihjettä, seqNext d > 1 toinen väärä ilman perustelua.
**Korjaus:** `lineHops` yleistetty hypyn pituudelle ja merkintäväleille; kolme animoitua esittelyä (+2, +5, +10 lukusuoralla, kaaret "+d"). Uudet perheet `rule` (tunnista hypyn pituus, perustelu "jos hyppy olisi x, tulisi…") ja `extend` (rakenna kaksi seuraavaa lukua). Perustelut which/siirto/seqNext, vihjeet. rev → AUDIT_REV.
**Validointi:** tsc + vitest ok; selaimessa kolmen animaation ruudut tarkastettu.

**Kritiikki:** Ainoa esittely oli staattinen hyppykuva; hypyt nollasta ja "muihin kiviin ei osuta" ei näkynyt ajassa. Tehtävät olivat vain valintoja ilman perusteluja; hyppyjen järjestysluvun (monesko hyppy) ja hyppymäärän/hypyn pituuden sekaannusta ei harjoiteltu. Siirrosta puuttui vihje.
**Korjaus:** Kaksi `lineHops`-esittelyä (3 ja 5 kerrallaan, kaaret ja lukusuora). Uudet perheet `nth` (napauta kivi, johon j:s hyppy osuu; whyAt: hyppy liian vähän/liikaa, hyppyjen määrä sekoitettu pituuteen) ja `hits` (osuuko kivelle n? perustelut molempiin suuntiin). Perustelut k-perheiden vääriin ("jää hyppyjen väliin"), vihje siirtoon. rev → AUDIT_REV.
**Validointi:** tsc + vitest ok; dumpista tarkastettu uusien perheiden whyAt-avaimet ja perustelut; lineHops-animaatio tarkastettu edellisellä kierroksella samoilla parametreilla.

**Kritiikki:** Demo oli yksi staattinen kivikuva. Askelperheessä ei ollut miksi-tekstejä eikä vihjettä. Siirtotehtävässä (yhteinen kivi) käsitettä ei näytetty ollenkaan, eikä vääriin vastauksiin annettu selityksiä.
**Korjaus:** Uusi animaatio diffArcs näyttää +k-kaaret kivien väleihin yksi kerrallaan, ja kuvateksti näyttää erotuksen. Uusi animaatio twoHoppers: Loikka hyppää kaksi ja Aava kolme kerrallaan, ja yhteiset kivet 6 ja 12 syttyvät. Askelperheeseen tuli arvokohtaiset miksi-tekstit ja vihje. Lisäsin uuden perheen gaps, jossa puuttuvat luvut täydennetään build-seq-tehtävänä. Siirtotehtävään tuli miksi-tekstit (a+b, pelkkä b, myöhempi yhteinen kivi) ja vihje. Rev nostettu.
**Validointi:** tsc ja vitest: 1589 läpi. Selaimessa tarkistettu molempien animaatioiden alku-, väli- ja loppukuvat sekä kuvatekstit.

**Kritiikki:** Kummassakin demossa oli staattinen kuva, ja toinen niistä oli pelkkä teksti "2 + 1 = 3". Merkin syntyä tilanteesta ei näytetty, eikä yhdessä-merkitystä demonstroitu ollenkaan. Vihjeitä ei ollut missään. Siirtotehtävässä ei ollut miksi-tekstejä. Oppilas ei kirjoittanut itse yhtään laskua.
**Korjaus:** Uusi signScene-animaatio: esineet tulevat yksi kerrallaan (tulee 1, tulee 2…), merkki + ponnahtaa ryhmien väliin ja lause kirjoittuu pala palalta. Demot: kalat 2+1, simpukat 3+2, ja joinScene yhdessä-merkitykselle. picToSign käyttää animaatiota ilman merkin paljastusta. Uusi write-perhe: lasku rakennetaan paloista järjestystä tarkistaen. Lausekemoodi hylättiin, koska se olisi hyväksynyt pelkän summan. Vihjeet lisätty kaikkiin perheisiin. Siirtotehtävä sai arvokohtaiset miksi-tekstit ja vihjeen. Rev nostettu.
**Validointi:** tsc ja vitest: 1589 läpi. Selaimessa tarkistettu +- ja −-animaatioiden ruudut, kuvatekstit ja build-widget.

**Kritiikki:** Demot olivat staattisia, ja toinen oli pelkkä teksti "4 − 1 = 3". Siirtotehtävä käsittelee eroa (vertailua), mutta sitä merkitystä ei opetettu demossa ollenkaan. Siirtotehtävän teksteissä oli kielivirhe: nimet pienellä alkukirjaimella ("aavalla", "loikalla"). Siirron b+b-vaihtoehdolta puuttui miksi-teksti. Vihjeitä ei ollut. Oppilas ei kirjoittanut itse laskua.
**Korjaus:** Demot käyttävät signScene-animaatiota miinusversiona: esineet lähtevät yksi kerrallaan, niiden paikalle jää katkoviivarengas, merkki − ponnahtaa esiin ja lause kirjoittuu. Uusi pairScene: Loikan ja Aavan kivet paritetaan viiva kerrallaan, ja ilman paria jääneet ympyröidään (5 − 3 = 2). Siirtotehtävä käyttää paritusta ilman vastauksen paljastamista. Isot alkukirjaimet korjattu. b+b sai miksi-tekstin. Uusi write-perhe (seq). Vihjeet kaikkiin perheisiin. Rev nostettu.
**Validointi:** tsc ja vitest: 1589 läpi. Selaimessa tarkistettu parituksen ja miinusanimaation ruudut ja kuvatekstit, myös versio, joka ei paljasta vastausta.

**Kritiikki:** Demot olivat staattisia. Vaakakuvassa oli oikealla viisi kiveä, vaikka puheessa sanottiin "neljä ja yksi", eikä mitään tapahtunut. Toinen demo oli pelkkä teksti. Väärinkäsitystä "vastaus tulee perään" ei näytetty. Vaa'an kupit leikkautuivat reunoilta kaikissa balanceArt-kuvissa (25 käyttöä). Oppilas ei saanut itse tasapainottaa vaakaa. fillLeftistä puuttuivat miksi-tekstit, trueFalsesta ja platesista vihjeet ja siirrosta vihje.
**Korjaus:** Uusi balanceScene-animaatio: kivet putoavat oikealle yksi kerrallaan, vaaka kallistuu pehmeästi ja lopussa näkyy = tai ≠ sekä lause. Demot 5 = 4 + 1 ja 3 + 1 = 2 + 2 sekä virhedemo 3 + 1 ≠ 2 + 4. Uusi tehtävätyyppi balance (types, check, widgets, families): ＋/－ kivi -painikkeet, vaaka kallistuu reaaliajassa ja tarkistus tunnistaa virheen "laitoin vasemman summan". Uusi level-perhe. balanceArt-funktion varren pituus korjattu, joten kupit eivät enää leikkaudu, ja funktio hyväksyy nyt jatkuvan kallistuksen. Lisätty miksi-tekstit ja vihjeet. Rev nostettu.
**Validointi:** tsc ja vitest: 1589 läpi. Selaimessa tarkistettu animaation ruudut (alku, tasapaino, liikaa) sekä widget: neljän lisäyksen jälkeen vaaka kallistuu oikealle ja vastaus {n:4} lähtee tarkistukseen.

**Kritiikki:** Demot olivat pelkkiä tekstikortteja ("3 + 2 = 5", "7 > 4"). add-perheen kuvassa oli valmiiksi +-merkki, mikä paljasti vastauksen. Compare-kuvat olivat staattisia rivejä, joita oli vaikea vertailla. words-perheen miksi-tekstit olivat geneerisiä ("Lasku ei pidä paikkaansa"). Vihjeitä ei ollut missään.
**Korjaus:** Demot: signScene (3 + 2), pairScene 'cmp' -tilassa (paritus, ylimääräiset ympyröidään ja lopuksi 7 > 4) ja uusi translateScene, joka kääntää sanat merkeiksi pala kerrallaan (viisi → 5, on → =, …). Pitkät sanat rivitetään ja fontti skaalataan. add-perhe käyttää animaatiota ilman merkkiä. compare-perhe: paritusanimaatio ja kysymys Loikan ja Aavan nimillä, jotta lukujärjestys on yksiselitteinen. words-perheeseen tulivat laskevat miksi-tekstit. Vihjeet lisätty kaikkiin perheisiin ja siirtoon. Rev nostettu.
**Validointi:** tsc ja vitest: 1589 läpi. Selaimessa tarkistettu translateScene (välivaihe ja loppu, tekstin mahtuminen) sekä pairScene 'cmp' -tilassa.

**Kritiikki:** Demot olivat staattisia kuvia, joihin oli liimattu teksti. trueFalse-perheessä ei ollut yhtään miksi-tekstiä (tyhjä taulukko). Storyn c+1-vaihtoehdon miksi-teksti oli epämääräinen. Vihjeitä ei ollut missään. Oppilas ei rakentanut itse kokonaista laskulausetta.
**Korjaus:** Demot: signScene + ja −, sekä translateScene, joka kirjoittaa tarinan laskulauseeksi pala kerrallaan (6 + 3 = 9). translateScene rivittää tekstin ahneesti, ja laatikot ovat nyt korkeampia. trueFalse sai laskevat miksi-tekstit. Story-tehtävän miksi-teksti näyttää oikean tuloksen. Uusi write-perhe: koko laskulause rakennetaan paloista animaation pohjalta (fact-moodi). Vihjeet lisätty kaikkiin perheisiin ja siirtoon. Rev nostettu.
**Validointi:** tsc ja vitest: 1589 läpi. Selaimessa tarkistettu translateScene molemmilla sanapaloilla, ja teksti mahtuu laatikoihin.

**Kritiikki:** Demot olivat staattisia: yliviivauskuva ja tekstikortti. Expr-perheen vihje puhuu taaksepäin laskemisesta, mutta sitä ei näytetty missään. Picture-, story- ja expr-perheistä puuttuivat miksi-tekstit kokonaan. Siirron miksi-teksti oli vain ensimmäisessä kohdassa (positionaalinen), ja kaksi vaihtoehtoa jäi ilman selitystä. Story-perheestä ja siirrosta puuttui vihje.
**Korjaus:** Demot: signScene − (simpukat lähtevät ja lause kirjoittuu) sekä lineHops 5 − 2 ja 9 − 3 (taaksepäin hyppiminen, lähtökivi ei ole hyppy). Uusi back-perhe: lukusuoralle napautetaan kivi, jolle Loikka päätyy, ja whyAt tunnistaa kolme virhettä: lähtökivi laskettu hypyksi, väärä suunta, ei hypätty. Kaikkiin perheisiin tulivat arvokohtaiset miksi-tekstit. Vihjeet lisätty storyyn ja siirtoon. Rev nostettu.
**Validointi:** tsc ja vitest: 1589 läpi. Animaatiokomponentit (signScene −, lineHops) on tarkistettu selaimessa aiemmilla kierroksilla, eikä niihin tehty muutoksia.

**Kritiikki:** Kaikki kolme demoa olivat staattisia. Kupin alle piilottamista luvattiin introssa, mutta kuppia ei näkynyt missään: hidden-perheessä näkyi vain rivi simpukoita. Hidden-, ten- ja siirtotehtävistä puuttuivat miksi-tekstit. Pairista ja siirrosta puuttui vihje. Puuttuvan osan päättelyä ei voinut kokeilla itse.
**Korjaus:** Kolme uutta animaatiota. tenFillScene: kympin ruudukko täyttyy ja tyhjät ruudut lasketaan 1, 2, 3. splitScene: jakoviiva liukuu ja näyttää jaot 7 = 5 + 2, 4 + 3 ja 6 + 1 väreittäin. cupScene: kuppi laskeutuu, kysyy ? ja nousee. Tehtäväversiossa kuppi ei nouse. Hidden-perhe käyttää kuppia. Uusi scale-perhe: puuttuva osa etsitään vaa'alla (balance-tehtävä). pickNum sai linjatut miksi-tekstit kaikkialle. Vihjeet lisätty. Rev nostettu.
**Validointi:** tsc ja vitest: 1589 läpi. Selaimessa tarkistettu kaikkien kolmen animaation välivaiheet ja lopputilat, kupin leveys ja jakoviivan renkaat korjattu.

**Kritiikki:** Lukuperhe esitettiin staattisina kuvina; neljän laskun yhteys (yhdistä → vaihda järjestys → ota pois) ei näkynyt tapahtumana. Miksi-tekstit olivat yleisiä, kirjoitustehtävää ei ollut.
**Korjaus:** Uusi familyScene-animaatio (simpukat yhdistyvät, vaihtavat paikkaa, osat lähtevät vuorotellen; neljä lausetta kertyy kahteen sarakkeeseen ~9 s). lineHops edestakaisin (5+3, 8−3). Arvopohjaiset miksi-tekstit kaikkiin perheisiin, vihjeet, uusi write-perhe (build fact: c − b = a).
**Validointi:** tsc + vitest 1589 ok; selaimessa familyScene-kehykset t=0.3/3.5/5.6/11 — asettelu siisti, ei leikkautumista.

**Kritiikki:** Esittely oli kaksi staattista korttia; strategia "aloita isommasta" ja tuplat vain lueteltiin. Väärille vastauksille ei ollut miksi-tekstejä, turn- ja transfer-tehtävistä puuttuivat vihjeet, eikä strategiaa harjoiteltu toiminnallisesti.
**Korjaus:** Uusi bigFirstScene (kilpa kahdella lukusuoralla: Loikka 2+6 kuudella hypyllä, Aava 6+2 kahdella; molemmat päätyvät 8:aan). Uusi doubleScene (peili tekee kaksoset pari kerrallaan; lähes tupla +1). Tehtävän sisällä reveal=false, jotta vastaus ei paljastu. Uusi race-perhe (line-tehtävä isommasta aloittaen, whyAt lähtökivi- ja väärästä luvusta aloittamisen virheille). whyAt arvopohjaisesti fact/double/transfer-perheisiin (±1, miinusvastaus, vain toinen osa). Lähes tupla rajattu summaan ≤ 9.
**Validointi:** tsc + vitest 1589 ok; selaimessa bigFirstScene t=2.4/9 ja doubleScene 3/5 – a=5 lähes tupla leikkautui → rajaus + tiiviimpi väli; reveal=false ei näytä vastauslausetta.

**Kritiikki:** Esittelyssä oli staattinen laskukortti ja staattinen lukusuora; strategia "ajattele plussaa" ei näkynyt toimintana. left-tehtävä näytti valmiin, jäljelle jääneen määrän kymppiruudukossa ilman pois viemistä. think-perheen miksi-tekstit olivat geneerisiä ("ei liity"), vihjeitä puuttui, ja transferissa ei ollut kuvaa.
**Korjaus:** Uusi countUpScene (c − b → b + ? = c; Loikka hyppää b:stä c:hen, hypyt numeroidaan, lopuksi lause). Esittelyssä takeAway 7−3, countUpScene 9−6 ja lineHops 8−2 taaksepäin. left-perhe käyttää takeAway-animaatiota (Loikka syö) ilman laskuria. Uusi up-perhe (countUpScene ilman numerointia, whyAt maalikivi/lähtökivi/+1). Arvopohjaiset miksi-tekstit fact/think/left/transfer-perheisiin; transferissa pairScene ilman vastausta. takeAway skaalautuu yli 6:lle (ei leikkautumista, koskee myös ranta2-käyttöjä).
**Validointi:** tsc + vitest 1589 ok; selaimessa countUpScene (reveal ja piilotettu), takeAway 7 ja 8, pairScene 8|3 – ei leikkautumista.

**Kritiikki:** Esittely oli kaksi staattista korttia; ero plussan ja miinuksen välillä vain todettiin. Miksi-tekstit olivat geneerisiä ("Toinen luku on väärä"), eikä vihjeitä ollut. Merkin valintaa ei harjoiteltu suoraan, ja kaksivaiheisesta transferista puuttui tuki.
**Korjaus:** Esittelyssä signScene 6+3 ja 6−3 (samat luvut, eri merkki), translateScene tarinasta laskuksi. Uusi sign-perhe (puuttuva merkki, perustelu isompi/pienempi). missing-perhe käyttää cupScene-animaatiota (piilotettu vastaus). whyAt väärän laskutoimituksen vastaukselle (mixed), koko vs. osa (missing), välisumma/unohtunut lisäys (transfer). Vihjeet kaikkiin perheisiin.
**Validointi:** tsc + vitest 1589 ok; selaimessa translateScene (lyhennetyt palat), signScene −, cupScene 9|4 piilotettuna.

**Kritiikki:** Kympin ylitys esitettiin staattisella kymppiruudukolla ja laskukortilla. "Täytä kymppi" -strategian liike (osa täyttää, loput valuvat yli) ei näkynyt. Tehtävän sisäinen ruudukko oli staattinen, split-perheen miksi-tekstit identtisiä, ja teen-, split- ja transfer-perheistä puuttuivat vihjeet.
**Korjaus:** Uusi bridgeScene: tulijat lentävät yksi kerrallaan, kymppi täyttyy (tauko + 10 ✓), loput siirtyvät toiseen ruudukkoon, lopuksi 10 + loput. Uusi jumpsScene: isot nimetyt hypyt kympin kautta, piilotustila. Esittelyssä bridgeScene 8+5, jumpsScene 8→10→13 ja 12+4. bridge-tehtävässä bridgeScene ilman vastausta. Uusi chain-perhe (build seq a + täyttö + loput, hypyt ilman lukuja). Miksi-tekstit arvopohjaisesti (vain loppuosa, ruudukossa ei ollut 10, kymppi kahdesti, yli/ali kympin), vihjeet kaikkiin.
**Validointi:** tsc + vitest 1589 ok; selaimessa bridgeScene 8+5 (alku/tauko/loppu) ja 6+9 piilotettuna, jumpsScene 8+2+3 – asettelu ok, välimerkkikorjaus.

**Kritiikki:** Esittelyssä oli staattinen lukusuora ja laskukortti. bridge-perhe saattoi arpoa laskuja, joissa kympin yli ei mennä lainkaan (b ≤ ykköset). Miksi-tekstejä ei ollut: yleisin virhe, "pienempi pois isommasta" ykkösissä (14 − 6 → 12), jäi selittämättä. Vihjeet puuttuivat.
**Korjaus:** Uusi bridgeDownScene: täysi kymppi ja irralliset; ensin irralliset lähtevät, sitten tauko "tasan 10!", sitten loput kympistä; lopuksi 10 − loput. Esittelyssä jumpsScene taaksepäin 14 → 10 → 8 ja ylöspäin 6 → 10 → 14 (ajattele plussaa). bridge-perhe pakottaa kympin ylityksen ja näyttää bridgeDownScene-animaation ilman vastausta. Uusi steps-perhe (build seq a − o − loput, piilotetut hypyt). whyAt arvopohjaisesti: ykkösten käännetty vähennys, plusvastaus, ±1, unohtunut kymppi. Vihjeet kaikkiin perheisiin.
**Validointi:** tsc + vitest 1589 ok; selaimessa bridgeDownScene 14−6 (vaiheet, tauko, loppu), jumpsScene ±.

**Kritiikki:** Esittelyssä oli kaksi staattista kuvaa (10 kaislaa, valmis nippu). Itse niputtamista, kymmenen ykkösen muuttumista yhdeksi kymmeneksi, ei nähty eikä tehty. Lapsi vain valitsi lukuja. missing-perheestä puuttui vihje, ja kahdelle väärälle vaihtoehdolle ei ollut miksi-tekstiä.
**Korjaus:** Uusi bundleScene: kaislat ilmestyvät ja numeroituvat yksi kerrallaan; kymmenennen kohdalla ne liukuvat yhteen ja punainen side sitoo nipun; loput jäävät irralleen ja lopuksi lause 24 = 10 + 10 + 4. Esittelyssä 10, 13 ja 24. Uusi tehtävälaji bundle (minipeli): lapsi napauttaa kaisloja nippuun (ääni laskee mukana), voi palauttaa ja sitoo nipun. Tarkistus kertoo, montako puuttuu tai on liikaa. Uusi tie-perhe käyttää sitä. Kaikki väärät vaihtoehdot saavat miksi-tekstit, ja vihjeet lisättiin.
**Validointi:** tsc + vitest 1589 ok; selaimessa bundleScene 24 (laskenta, sidonta, loppulause) ja bundle-widget (valinta, palautus, sidonta, submit); check 8 → puuttuu 2, 12 → ota 2 pois. Nippu-tunnisteen päällekkäisyys korjattu, side mitoitettu nipun mukaan.

**Kritiikki:** Kymmenet/ykköset esitettiin staattisina kuvina; numeron ja määrän yhteys (nippu → kymmenten numero) jäi näyttämättä. Ei toiminnallista tehtävää, jossa lapsi itse kokoaa luvun. "1 nippua" -kielioppivirhe. numToPic-perheeltä puuttuivat arvokohtaiset miksi-tekstit.
**Korjaus:** Uusi animaatio placeScene: niput lasketaan kymmenittäin punaisella, irtokaislat ykkösittäin vihreällä, katkoviivat vievät numeroihin (34, 40 – nolla ykkösiä). Uusi tehtävätyyppi `reeds` (torimiinipeli: ＋/− nippu ja kaisla) uudessa order-perheessä; tarkistus tunnistaa vaihdetut kymmenet/ykköset ja epäkanonisen kokoamisen. Kielioppi korjattu, miksi-tekstit ja vihjeet kaikille perheille.
**Validointi:** tsc + vitest 1589 ok. Selaimessa: placeScene(3,4), (4,0), (5,8) loppukuvat – ykkösnumerot porrastettu, ettei päällekkäisyyttä; reeds-widget 3 nippua + 4 kaislaa → ok, vaihdettu ja epäkanoninen saavat oikeat palautteet.

**Kritiikki:** Tunnin ydinidea – nipun avaaminen (46 = 30 + 16) – näytettiin kahtena staattisena kuvana; itse muunnosta ei nähty eikä sitä päässyt tekemään. Kielioppivirhe "Yksi kymppiä / 1 kymppiä". Vain yksi väärä vaihtoehto per tehtävä sai miksi-tekstin, vihjeet puuttuivat. Siirtotehtävän kuva näytti valmiin vastauksen (16 irtokaislaa).
**Korjaus:** Uusi animaatio unbundleScene: nippu tärisee, side lähtee, kymmenen kaislaa lentävät kaarena yksi kerrallaan irtokaislojen luo ja ne lasketaan (7…16); loppu "3 nippua ja 16 irtokaislaa, 46 = 30 + 16" (reveal=false piilottaa laskun ja määrän). Reeds-tehtävään `tens`-rajoite + napit "Avaa nippu" / "Sido nippu": uusi open-perhe, jossa lapsi itse avaa nipun luvun pysyessä samana; tarkistus erottelee "liian monta nippua", "irtokaislat väärin" ja "luku muuttui". Kielioppi korjattu, arvokohtaiset miksi-tekstit kaikille vääriille, vihjeet kaikkiin perheisiin, compose-kuvatuki.
**Validointi:** tsc + vitest 1589 ok. Selaimessa: unbundleScene(4,6) kehykset 2.6 s / 5.5 s / loppu, (2,3), (6,8,piilo) – ei leikkautumista, piiloversio ei paljasta vastausta. Widget 46/tens 3: Avaa nippu → 3 + 16 → ok; 4+6, 3+6, 2+5 antavat oikeat palautteet.

**Kritiikki:** Esittelyt olivat staattisia laskukortteja; itse "jako sopiviin osiin" jäi näkymättä. Ainoa harjoitus oli monivalinta, jossa geneerinen "ei vie tasakymmeniin". use-perhe tuotti b = 20 → "ja vielä 0". Vihjeet puuttuivat lähes kaikista; tasakymppi-tapauksessa ei miksi-tekstejä.
**Korjaus:** Uusi animaatio cutScene: kivet ilmestyvät, sakset leikkaavat tasakymppiin vievän osan (punainen) ja loput (vihreä), osat liukuvat erilleen ja kaksi helppoa askelta kirjoittuvat (+ ja −). Lisäksi jumpsScene-hypyt 38→40→45 ja 46→66→70. Uusi tehtävätyyppi `cut` (minipeli): lapsi napauttaa kivien väliin, näkee heti "57 + 2 = 59, loput 6" ja kokeilee kunnes osuu tasakymppiin; tarkistus kertoo arvon ja oikean leikkauskohdan. Uusi cut-perhe (+ ja −). use: ei tasakymppejä, whyAt (kymppi unohtui / liikaa / vain ykköset / ykköset puuttuu). Arvokohtaiset miksi-tekstit ja vihjeet kaikkiin perheisiin. jumpsScene: kaaren korkeus rajattu, +20-merkintä ei leikkaudu.
**Validointi:** tsc + vitest ok. Selaimessa: cutScene(38,7) kesken ja lopussa, cutScene(53,8,−), jumpsScene(44..72) ja (36..48) – ei leikkautumista. cut-widget 57+8: leikkaus 2 → "57 + 2 = 59, loput 6", tarkistus 3 ok, 2 ja 53−4 oikeat palautteet.

**Kritiikki:** Kahden numeron yhteenlasku esitettiin staattisina kaislakuvina ja laskukorttina; "kymmenestä ykkösestä sidotaan uusi nippu" (muistinumero) mainittiin vain sanana. Kaikki harjoitukset olivat näppäilyä/monivalintaa ilman toiminnallista kokoamista. Näppäilytehtäviltä puuttuivat vihjeet ja arvokohtaiset miksi-tekstit (unohtunut kymppi, kympit ykkösinä).
**Korjaus:** Uusi animaatio addReedsScene: kummankin luvun niput lentävät lautalle ja lasketaan kymmenin, irtokaislat ykkösin; jos ykkösiä ≥ 10, kymmenen niistä saa punaisen siteen ja liukuu nippujen jonoon (47 + 35 → 8 nippua ja 2). Piiloversio carry-tehtävän tukena. Reeds-tehtävään `from`: uusi raft-minipeli, jossa lautalla on valmiina ensimmäinen luku ja lapsi tuo toisen sekä sitoo nipun; tarkistus huomaa sitomatta jääneen nipun ja puuttuvan kympin. whyAt + vihjeet noCarry-, tens- ja transfer-tehtäviin, carry-vaihtoehdoille kaikille miksi; kielioppi (1 kymppi / 1 irtokaisla).
**Validointi:** tsc + vitest ok. Selaimessa: addReedsScene(47,35) nippuvaiheessa, sitomisvaiheessa ja lopussa, (34,25), (49,49, piilo) – ei päällekkäisyyttä. Raft-widget 37 → 61: 5+11 → "sido nippu", 4+11 → "yksi nippu puuttuu", 6+1 → ok.

**Kritiikki:** Kympin purkaminen vähennyksessä (52 − 17) esitettiin staattisena kaislakuvana ja laskukortilla; avaamista ja poisottamista ei nähty. Ei toiminnallista harjoitusta. noBorrow- ja transfer-näppäilyiltä puuttuivat vihjeet ja miksi-tekstit (väärin päin -virhe, kympit unohtuvat); check-perheen kaksi väärää vaihtoehtoa saivat saman geneerisen tekstin; borrow-perheen kolmas vaihtoehto ilman selitystä.
**Korjaus:** Uusi animaatio subReedsScene: jos irtokaislat eivät riitä, nippu tärisee, side lähtee ja kymmenen kaislaa siirtyy ykkösiin; sitten ykköset otetaan pois yksi kerrallaan ("pois: 5") ja niput kymmenin; loppu "3 nippua ja 5 irtokaislaa, 52 − 17 = 35". Piiloversio borrow-tehtäviin. Demot: 68 − 25 (ilman purkua), 52 − 17 (purku), tarkistus. Uusi take-minipeli (reeds from > target): lapsi ottaa itse kaisloja pois ja avaa nipun; tarkistus erottaa "nippu jäi ottamatta" ja "yksi nippu liikaa". whyAt + vihjeet noBorrow- ja transfer-tehtäviin (mm. väärin päin -virhe), check- ja borrow-vaihtoehdoille omat selitykset. Varmistettu, ettei whyAt-avain osu oikeaan vastaukseen (c = e).
**Validointi:** tsc + vitest ok. Selaimessa subReedsScene(52,17) purku-, poisotto- ja loppuvaiheessa, (68,25, piilo); widget 52 → 35 ja tarkistukset 3+5 ok, 4+5, 2+5, 3+9 oikeat palautteet.

**Kritiikki:** Kertotaulujen ydinmallit (rivistö, tupla, tuplan tupla, vaihdannaisuus) olivat staattisia laskukortteja ja yksi kuva. Lapsi ei rakentanut rivistöä itse. fact-näppäilyiltä puuttuivat miksi-tekstit ja osin vihjeet (1, 3, 10), array-perheessä vain yksi selitetty väärä vaihtoehto, transferissa ei vihjettä.
**Korjaus:** Kolme uutta animaatiota: rowsScene (rivit ilmestyvät ja lasketaan hyppäyksin 5, 10, 15 → 3 × 5 = 15), doubleRowsScene (2 riviä kehystetään, kopio liukuu alle: 4 × 6 = 12 + 12) ja turnScene (rivistö kääntyy neljänneskierroksen: 3 × 4 = 4 × 3). Uusi tehtävätyyppi `grid` (rivistön rakentaja): ＋/− rivi ja ＋/− jokaiseen; tarkistus tunnistaa käännetyn rivistön. Uusi grid-perhe. fact: whyAt (yhteenlasku, rivi puuttuu/liikaa) ja vihjeet kaikille tauluille. array: kaikille vaihtoehdoille omat selitykset ja vihje; strategy- ja transfer-vihjeet ja whyAt. fact jätettiin ilman kuvaa, jotta se pysyy muistamisena.
**Validointi:** tsc + vitest ok. Selaimessa: rowsScene(3,5) kesken ja lopussa, turnScene(3,4) kääntymässä ja lopussa, doubleRowsScene(6) – ei leikkautumista. Grid-widget 3 × 4: rakennettu napeilla, tarkistus 3×4 ok, 4×3 → "käännetty", 3×5 → oikea palaute.

**Kritiikki:** Demo oli staattinen kortti "3 + 3 + 3 + 3 = 4 × 3" ja staattinen rivistökuva: muunnos plussasta kertolaskuksi ei näkynyt tapahtumana. Väärien vaihtoehtojen perustelut olivat yleisiä (story-perhe toisti saman lauseen kahdesti), vihjeitä ei ollut, eikä lapsi itse kirjoittanut kertolaskua missään.
**Korjaus:** Uusi animaatio sumToTimesScene: pussit ilmestyvät yksi kerrallaan ja kukin lisää summaan "+ g", aaltosulje kokoaa termit ("k kertaa luku g") ja lopuksi syntyy k × g (= tulos). Neljä demoa (myös rivistö rowsScene ja "4 + 3 ≠ 4 × 3" -varoitus). Uusi minipeli write: lapsi rakentaa kertolaskun paloista (build seq, uusi whyAt-tuki build-tehtävälle: k + g, g × k ja k × tulos saavat omat selityksensä). Tehtävän animaatio ei paljasta vastausta ("? kertaa luku g"). Kaikkiin vääriin vaihtoehtoihin arvokohtaiset perustelut, kaikkiin perheisiin vihjeet.
**Validointi:** tsc + vitest 1589/1589. Selaimessa piirretty sumToTimesScene (4×3 kesken ja lopussa, 5×8, 2×6 simpukat, 3×5 reveal=false) ja rakennuspeli: check "4 + 3", "3 × 4" ja ratkaisu oikein.

**Kritiikki:** Oppitunnin ydinajatus "jakolasku purkaa kertolaskun" näytettiin vain staattisella rivistökuvalla ja korttipinolla, eli purkamista ei nähty tapahtumana. Factor- ja siirtotehtävistä puuttuivat vihjeet ja arvokohtaiset virheselitykset. Perheen väärät vaihtoehdot selitettiin pintapuolisesti, eikä lapsi itse purkanut tai pakannut mitään.
**Korjaus:** Uusi animaatio unpackScene: täydet pussit (a × b = c) tyhjennetään yhdeksi kasaksi, kasa pakataan uudelleen b kerrallaan ja pussit lasketaan (c : b = a), lopuksi c : a = b. Kolme demoa: 3×4, 4×5 simpukoilla ja perhekortti, jossa on sääntö "tulo on jakolaskussa ensimmäisenä". Uusi minipeli repack: lapsi pakkaa puretut marjat itse pusseihin (bagup) ja laskee pussit. Factor- ja siirtotehtävään vihjeet sekä whyAt (tulo, väärä luku, yhden pussin sisältö). Family- ja check-tehtävien väärille vaihtoehdoille tarkistuslaskuun perustuvat selitykset.
**Validointi:** tsc + vitest 1589/1589. Selaimessa piirretty unpackScene vaiheittain (täysi, purettu, pakkaus kesken, valmis) sekä 4×5 ja 5×10 (10 marjaa pussissa mahtuu). whyAt-avaimet on suojattu, joten ne eivät osu oikeaan vastaukseen.

**Kritiikki:** Koko demo oli yksi staattinen kortti "20 : 5 = ? / 5 × 4 = 20". Jakolaskun kaksi merkitystä (montako ryhmää ja paljonko kullekin) eivät näkyneet tapahtumina. Think-tehtävän perustelut olivat lyhyitä, share-tehtävällä oli perustelu vain yhdelle väärälle vastaukselle, ja fact- ja siirtotehtävistä puuttuivat arvokohtaiset virheselitykset. Lapsi ei itse jakanut mitään.
**Korjaus:** Kaksi uutta animaatiota. skipDivScene: Loikka hyppii jakajan verran lukusuoralla, hypyt numeroidaan ja lopuksi syntyy "b hyppyä: a × b = c, joten c : a = b". shareRoundScene: kasa jaetaan kierros kerrallaan ystävien pusseihin. Kolmas demo on vaiheittainen kertotaulukortti "5 × ? = 20". Uusi minipeli deal: tasajako pack-pelillä (pile = a·b). whyAt-selitykset fact-tehtävään (jakaja, jaettava, ±1) ja siirtotehtävään (yhden veneen määrä, ylimääräinen vene). Share-tehtävän kaikille vaihtoehdoille perustelut, ja vihjeet kaikkiin perheisiin.
**Validointi:** tsc + vitest 1589/1589. Selaimessa piirretty skipDivScene (kesken ja valmis, 40 : 4 reveal=false) ja shareRoundScene (kierros 2, 20 : 4 valmis, 30 : 3 reveal=false) sekä pack-minipeli (4 pussia, kasassa 20). Korjattu kierrosteksti ja liian leveä loppurivi.

**Kritiikki:** Vaakaa käsittelevä oppitunti näytti vaa'an vain staattisina kuvina: punnitsemista, eli esineen laskemista kuppiin ja vaa'an kallistumista, ei nähty. Equal-tehtävän ja siirtotehtävän väärät vaihtoehdot jakoivat saman selityksen, vihjeitä ei ollut, eikä lapsi itse punninnut mitään.
**Korjaus:** Uusi animaatio weighScene: esineet putoavat kuppeihin yksi kerrallaan, ja vaaka heilahtaa ja asettuu vaimenevasti jokaisen pudotuksen jälkeen. Kolme demoa: kivi vs. lehti, kolme lehteä vs. kivi (vaaka kääntyy toiselle puolelle) ja tasapaino. Uusi tehtävätyyppi ja minipeli weigh: kolme pakettia, joiden painot ovat piilossa. Lapsi punnitsee niitä pareittain (vaaka heilahtaa, ja loki kertoo kumpi on painavampi) ja valitsee painavimman tai kevyimmän. Väärästä valinnasta tulee palaute, joka kertoo, minkä paketin kanssa punnita. Lisäksi arvokohtaiset selitykset kaikille väärille vaihtoehdoille ja vihjeet kaikkiin perheisiin.
**Validointi:** tsc + vitest 1589/1589. Selaimessa piirretty weighScene-vaiheet (lehdet, kivi putoaa, ylilyönti, asettunut) ja weigh-minipeli: A ja B punnittu, vaaka kallistuu B:n puolelle ja loki näyttää "B on painavampi kuin A". check, solution ja wrongs testattu painavimmalle ja kevyimmälle.

**Kritiikki:** Gramman ja kilogramman demot olivat staattisia: marjan kuva, jonka vieressä luki "1 g", ja pelkkä teksti "1 kg = 1000 g". Kilon kokoontumista tuhannesta grammasta ei nähty. Arviotehtävän vääriltä vaihtoehdoilta puuttuivat perustelut, ja tuhat- ja siirtotehtävän selitykset olivat geneerisiä tai puuttuivat. Vihjeitä ei ollut, eikä lapsi itse punninnut mitään.
**Korjaus:** Uudet keittiövaaka-primitiivit dialBody ja packetArt sekä kaksi animaatiota. kiloScene: kymmenen 100 g:n pussia putoaa vaa'alle yksi kerrallaan, osoitin kiertää ja näyttö laskee 100…1000 g, minkä jälkeen pussit vaihtuvat yhdeksi 1 kg:n pussiksi. onScaleScene: esine vaa'alle, osoitin heilahtaa (marja ≈ 1 g, osoitin tuskin liikkuu; maitopurkki 1000 g). Uusi tehtävätyyppi ja minipeli grams: lapsi kokoaa tilatun painon (esim. "1 kg 300 g") 100 g:n, 500 g:n ja 1 kg:n punnuksista, ja osoitin pyörii jokaisen lisäyksen jälkeen. Palaute kertoo, puuttuuko painoa vai onko sitä liikaa. Arviotehtävän kaikille väärille vaihtoehdoille vertailuperustelut, ja vihjeet kaikkiin perheisiin.
**Validointi:** tsc + vitest 1589/1589. Perhetesti huomasi, että selityksessä oli ×-merkki (kertolaskuvaatimus 1.–2. luokalla), joten se korvattiin yhteenlaskulla. Selaimessa piirretty kiloScene-vaiheet (350 g, 1000 g, 1 kg:n pussi), marja ja maitopurkki sekä grams-peli (1 kg + 100 + 100 + 500 = 1700 g, osoitin ja näyttö oikein). Pussien tekstit ja kellotaulu suurennettu.

**Kritiikki:** Demot olivat staattisia astiakuvia: kaatamista ei nähnyt. `pour`-perheessä ylivuoto arvottiin satunnaisesti, joten tehtävä saattoi väittää, että muki valuu yli kannuun kaadettaessa (fysikaalisesti väärin). Vaihtoehdoilla "Yhtä paljon" ja "Vähemmän" ei ollut omia selityksiä, eikä vihjeitä ollut. Oppilas ei päässyt itse kokeilemaan kaatamista.
**Korjaus:** Uusi `pourScene`-animaatio: astia nousee ja kallistuu, vesi virtaa, kohde täyttyy, ylivuodosta tulee lätäkkö. Demot ovat nyt muki→kannu, kannu→muki (ylivuoto) ja kulho→lasi (vesi säilyy). `pour` käyttää tilavuustaulukkoa (muki 3, pullo 5, kannu 10), joten ylivuoto on aina oikein, ja tehtävässä on kaatoanimaatio. Lisätty vaihtoehtokohtaiset selitykset ja vihjeet. Uusi `pourtest`-minipeli: oppilas kaataa kumpaan suuntaan tahansa, näkee tuloksen ja valitsee sitten isomman astian.
**Validointi:** tsc ja vitest 1589/1 skip. Selaimessa minipeli toimii: pullo→muki valuu yli ja check/solution/wrongs ovat oikein. Palautteen kieli on siistitty. Neljä perhettä tuottuu (cups, conserve, test, pour), ja demojen loppukuvat on tarkistettu.

**Kritiikki:** Demossa oli kaksi staattista astiakuvaa ja tekstikortti "1 l = 10 dl", eli kymmenen desin kaatamista ei nähnyt. Yleisin virhekäsitys (8 dl > 1 l, koska 8 > 1) jäi demossa käsittelemättä. "Yhtä paljon" -vaihtoehdolla ja siirtotehtävän väärällä vastauksella ei ollut omaa selitystä, eikä vihjeitä ollut. Oppilas ei mitannut itse.
**Korjaus:** Uusi `dlFillScene`: desimitta kallistuu ja kaataa kymmenen kertaa, pinta nousee, laskuri etenee 1 dl … 10 dl, ja loppuun tulee "= 1 l". Toinen demo kaataa 8 dl, joka jää viivan alle ("< 1 l"). Uusi `fill`-minipeli ja tehtävätyyppi: mittakannu, jossa on desimerkit ja litraviivat (1 l / 2 l), sekä napit ＋/－ 1 dl. Napautukset jonotetaan. Tavoitteet ovat 5–20 dl (esim. "1 l 2 dl"). Palaute tunnistaa sekaannuksen litra = 1 dl. Lisätty vihjeet kaikkiin perheisiin ja vaihtoehtokohtaiset selitykset.
**Validointi:** tsc ja vitest 1589/1 skip. Selaimessa tarkistettu animaation välikuvat (kallistus, virta, pinta) ja loppukuvat (10, 8, 15 dl). Kaadon ja litramerkinnän päällekkäisyys on korjattu. `fill`: check, wrongs ja jono toimivat.

**Kritiikki:** Demossa oli kaksi staattista kuvaparia (pallo + ympyrä, kuutio + neliö). Litteyden ydinajatus (ei paksuutta) ja painamisen jälki jäivät pelkän puheen varaan. Väärien vaihtoehtojen selitykset olivat geneerisiä ("Tämä on litteä kuvio."), eikä vihjeitä ollut. Jälkitehtävän kuvassa oli pelkkä kappale. Oppilaalla ei ollut aktiivista luokittelutehtävää.
**Korjaus:** Uusi `geoanim.ts`:
- `edgeScene`: pallo nostetaan käteen, paperin ympyrä kääntyy sivuttain ohueksi viivaksi.
- `pressScene`: kappale lasketaan hiekkaan, painetaan ja nostetaan. Jälki nähdään ensin vinosti ja sitten suoraan ylhäältä, jolloin muoto paljastuu. `reveal=false`-versio pysähtyy vinoon kuvaan.

Demot ovat nyt pallo/ympyrä-käännös, kuution painallus ja tölkin painallus. Jälkitehtävä kattaa myös kartion ja pallon ja käyttää animaatiota. Lisätty yleinen `sort`-tehtävätyyppi ja lajittelupeli (napauta kuva ja laatikko, siirtymäanimaatio), johon tulee 3 kappaletta ja 3 kuviota. Selitykset nimeävät kohteen, ja kaikkiin perheisiin on lisätty vihjeet.
**Validointi:** tsc ja vitest 1589/1 skip. Selaimessa tarkistettu painalluksen ja käännön välikuvat. Kappaleen osumakohta ja hiekkalaatikon rajaus on korjattu. `sort`: Valmis on pois käytöstä, kunnes kaikki kuvat on lajiteltu, väärin lajitellusta tulee kohdekohtainen selitys, ja check, solution ja wrongs ovat oikein. Neljä perhettä tuottuu.

**Kritiikki:** Demossa oli staattisia kuviorivejä. Kulmien ja sivujen laskemista ei näytetty, ja käännetty neliö oli pelkkä vino kuva ilman selitystä. Missään valintatehtävässä ei ollut väärien vaihtoehtojen selityksiä, ja vihjeitä oli vähän. Kulmatehtävän kuvasta ei saanut tukea laskemiseen. Aktiivista luokittelua ei ollut.
**Korjaus:** Uudet animaatiot:
- `traceScene`: kynä kiertää reunan sivu kerrallaan. Kulmat syttyvät numeroituina ja kuvio täyttyy. Ympyrässä kynä ei käänny kertaakaan. `reveal=false`-versio näyttää kulmapisteet ilman numeroita.
- `turnScene`: neliö kääntyy 45°, numeroidut kulmat seuraavat mukana, ja loppuun tulee teksti "yhä neliö".

Demot ovat nyt kolmio, suorakulmio (neliö on suorakulmio), ympyrä ja käännetty neliö. Kulmatehtävä käyttää piirtoa. Uusi lajittelupeli: kolmiot, neliöt ja ympyrät eri asennoissa kolmeen laatikkoon. Kaikkiin valintoihin tuli kulmiin perustuvat selitykset (korjattu sijamuodot ja "ei ole kulmia"), ja vihjeet on lisätty kaikkiin perheisiin.
**Validointi:** tsc ja vitest 1589/1 skip. Selaimessa tarkistettu piirron välikuvat (kolmio, käännetty suorakulmio ilman numeroita, ympyrän kaari) sekä käännön loppukuva, jonka mittakaava on korjattu niin, ettei numero osu tekstiin. Lajittelupelin kolme laatikkoa ja selitystekstit on tarkistettu. Viisi perhettä tuottuu.

**Kritiikki:** Solmu on nimeltään "Lajittelulaatikot", mutta mitään ei lajiteltu laatikoihin: demot olivat staattisia kuvarivejä, ja tehtävät olivat monivalintoja. Ydinajatus (sama kasa, eri sääntö, eri ryhmät) jäi näyttämättä. Vihjeitä ei ollut, ja odd-tehtävän väärillä vaihtoehdoilla ei ollut selityksiä.
**Korjaus:** Uusi `sortScene`: kuviot lähtevät kasasta yksi kerrallaan. Kukin korostetaan, tekstitys kysyy sääntökysymyksen ("Sininen ympyrä: onko se punainen? Ei."), ja kuvio liukuu kaarella laatikkoonsa. Kaksi demoa lajittelee saman kasan ensin värin ja sitten muodon mukaan. Uudet `sort`-pelit:
- `boxes`: kolme värilaatikkoa, joissa on värinäytteet;
- `rule`: annettu väri tai muoto vastaan "Muut", kolme kumpaankin, ja toinen ominaisuus voi hämätä.

Selitykset ovat kohdekohtaisia ja vihjeet on lisätty kaikkiin perheisiin.
**Validointi:** tsc ja vitest 1589/1 skip. Selaimessa tarkistettu animaation välikuva (korostus, tekstitys) ja kummankin demon loppukuva. Otsikoiden päällekkäisyys ja ylisuuri värinäyte on korjattu, ja sijamuodot on muotoiltu uudelleen. Kuusi perhettä tuottuu.

**Kritiikki:** Demo oli yksi staattinen kuva valmiiksi järjestetyistä kepeistä. Se ei näyttänyt, *miten* järjestys syntyy. Lukujen ja suurimmasta pienimpään -järjestyksen menetelmää ei näytetty lainkaan. Väärät vastaukset eivät saaneet paikkakohtaista palautetta, vihjeitä ei ollut, eikä mikään tehtävä harjoittanut virheen löytämistä valmiista jonosta.

**Korjaus:**
- Uusi `orderScene` (thinkanim.ts) etenee ajassa. Osoitin käy jäljellä olevat kepit läpi yksi kerrallaan, ja tähänastinen lyhyin hehkuu keltaisena. Löydetty keppi hyppää seuraavalle paikalle, valmis osa merkitään vihreällä, ja lopuksi portaat piirtyvät katkoviivana (~10 s).
- Demossa on kolme kohtausta: kepit, luvut pienimmästä suurimpaan ja luvut suurimmasta pienimpään.
- Uusi mikropeli `fix`: Aavan jonossa kaksi lukua on väärin päin, ja lapsi korjaa sen (place + start).
- Lisätty paikkakohtaiset why-palautteet, vihjeet kaikkiin perheisiin ja täsmennetyt selitykset.

**Validointi:** tsc ja vitest (1589 ok). Selaimessa tarkistettu animaation kehykset (vaihto, portaat, laskeva järjestys), jokaisen perheen solution ok ja wrongs-palautteet, sekä fix-widgetin esitäyttö.

**Kritiikki:** Demo oli staattinen kuvarivi ja korttiteksti ”2, 4, 6, 8”. Toistuvaa osaa ei rajattu, eikä kasvavassa kuviossa näkynyt, mitä joka kerta tulee lisää. Tehtäväkuvat olivat staattisia. Väärät valinnat saivat yleisen tai tyhjän palautteen, eikä mikään tehtävä pyytänyt lasta itse jatkamaan kuviota (vain valitsemaan seuraavan).

**Korjaus:**
- `patternScene`: kuviot asettuvat riviin yksi kerrallaan. Ensimmäinen toistuva osa kehystetään, ja jokainen toisto saa katkoviivakehyksen (”Taas sama osa!”). Kesken jäänyt osa korostetaan keltaisella, kysymyspaikka sykkii ja seuraava kuvio liukuu paikalleen. Tehtävissä käytetään `reveal=false`-versiota.
- `growScene`: jokainen kuva kopioi edellisen, ja d uutta pistettä ponnahtaa keltaisena. Lukumäärät näkyvät kuvien päällä. Pistetehtävässä on `?`-versio.
- Uusi tehtävätyyppi `extend` ja mikropeli: lapsi jatkaa kuviota kolmeen tyhjään paikkaan napauttamalla kuvia paletista (sisältää harhautuskuvion). Paikan voi tyhjentää napauttamalla sitä. Väärästä paikasta tulee paikkakohtainen palaute.
- Whyt kaikkiin perheisiin (lähellä / kasvaa yhdellä / kaksi askelta, kuvio ei kuulu / ei vielä tällä kohtaa), vihjeet ja tarkempi siirtotehtävän selitys. Pistetehtävän d on nyt 2–3, ettei vaihtoehtoja synny satunnaisesti.

**Validointi:** tsc ja vitest (kaikki ok). Selaimessa tarkistettu animaatiokehykset (kehystys, kesken jäänyt osa, paljastus, kasvu, `?`-versio) ja extend-widget (täyttö, tyhjennys, uudelleentäyttö, submit, check ok, reveal), sekä jokaisen perheen solution ok ja whyt.

**Kritiikki:** Demossa oli kaksi staattista korttia, joissa vastaus kerrottiin valmiina. Ajatteluprosessia (lue kysymys → käy tiedot läpi → karsi turha) ei näytetty. Opetus jätti myös virhekäsityksen, että kaikki luvut ovat tärkeitä. Väärät valinnat saivat yleistä palautetta, vihjeitä ei ollut, ja siirtotehtävän selityksessä oli kertomerkki (×) 1.–2. luokan solmussa.

**Korjaus:**
- `sieveScene`: havainnot ilmestyvät rivi kerrallaan, kysymys korostuu, ja suurennuslasi käy rivit läpi. Tarvittavat tiedot muuttuvat vihreiksi ja niiden luvut lentävät laskunauhaan; turhat yliviivataan. Lopuksi muodostuu lasku (~11–13 s).
- Toinen demo opettaa, että lukukin voi olla turha (”Rannalla on 6 kiveä”).
- Uusi mikropeli `sieve` (sort-tyyppi): 4 tietokorttia lajitellaan laatikoihin ”Tarvitaan” ja ”Ei tarvita”. Mukana on aina luku, jota ei tarvita, ja kortille oma why.
- Arvokohtaiset whyt, vihjeet, ja siirtotehtävän selitys toistettuna yhteenlaskuna.
- Sort-widgetin ohje sanoo tekstikorteille ”Napauta korttia”.

**Validointi:** tsc ja vitest (kaikki ok). Selaimessa tarkistettu molempien demojen kehykset ja kuvatekstit, yliviivauksen pituus, sort-kortit ja siirto laatikkoon, sekä jokaisen perheen solution ja whyt.

**Kritiikki:** Demossa oli kaksi emoji-korttia (👂 ✋ 🥽), eikä mikään liikkunut. Turvallista toimintaa ei näytetty tapahtumana (mitä sattuu → seis → kauemmas → kerro aikuiselle). Kaikki tehtävät olivat tekstivalintoja ilman kuvaa tai vihjettä. Työvaiheiden järjestystä ja vaarallisen teon tunnistamista ei harjoiteltu toiminnallisesti.

**Korjaus:**
- Uusi `safeanim.ts`:
  - `prepScene` (~10 s): aikuinen kertoo kolmiosaisen ohjeen, Aava odottaa kellon kanssa luvan (”Nyt saa aloittaa!”), suojalasit liukuvat silmille ja dekantterissa kuplii. Tarkistuslista rastittuu vaihe vaiheelta.
  - `hazardScene` (lasi / pullo / vesi / levy): purkki putoaa ja hajoaa, nimetön pullo, vesi leviää pistokkeen luo tai levy hehkuu. Sitten SEIS-merkki, Aava astuu kauemmas ja huutaa aikuista, ja aikuinen kävelee paikalle.
  - Tehtävissä käytetään `reveal=false`-versiota (”Mitä Aavan pitää tehdä nyt?”).
- Uudet mikropelit:
  - `order` (place): tutkijan työvaiheet järjestykseen, why paikkaa kohden.
  - `sort`: 3 turvallista ja 3 vaarallista tekoa laatikoihin, why korttia kohden.
- Vihjeet kaikkiin tehtäviin.

**Validointi:** tsc ja vitest (kaikki ok). Selaimessa tarkistettu prep-kehykset (ohje, odotus, suojalasit, lista) ja jokaisen vaaran alku- ja loppukehys (SEIS ei peitä aikuista, teksti mahtuu), sekä kaikkien perheiden solution ja whyt.

**Kritiikki:** Ainoa demo oli staattinen lehtikuva. Havainnon ja arvauksen eroa ei näytetty toiminnassa. Match-, feature- ja colour-tehtävistä puuttuivat vihjeet ja vastauskohtaiset palautteet, eikä mikään tehtävä ollut lajittelupeli.
**Korjaus:** Uusi lookScene (10 s): suurennuslasi katsoo ensin värin ja sitten merkin. Kumpikin löytö kirjoittuu havaintovihkoon ja merkki rengastetaan. Sen jälkeen arvauskupla saa leiman "EI NÄY KUVASTA" ja häipyy. Demoja on kaksi (lehti, jossa on reikä, ja sileä sieni, jonka arvaus on "myrkyllinen"). Match-, feature- ja colour-tehtäviin tuli vastauskohtaiset palautteet (eri väri / merkin ero) ja vihjeet. Uusi lajittelupeli jakaa lauseet laatikoihin "Näkyy kuvasta" ja "Arvaus", ja jokaisella lauseella on oma palautteensa. Siirtotehtävään tuli vihje.
**Validointi:** tsc ja vitest (1589 testiä) menivät läpi. Selaimessa tarkistettiin 12 animaatioruutua: kupla ja leima eivät enää mene päällekkäin ja tekstitys pysyy ajastettuna. Lajittelupeli toimii: ratkaisu hyväksytään, väärät vastaukset saavat palautteensa, ja tehtävistä noin 22 % on lajittelupelejä.

**Kritiikki:** Demo oli yksi staattinen kuva (ranta ja simpukka). Tehtäväkuvassa paikka ja löytö näkyivät valmiiksi parina, joten tehtävä oli pelkkää kopiointia. Kirjaamisen ideaa ("merkitse heti oman paikan kohdalle") ei näytetty. Vääristä vastauksista puuttuivat paikkakohtaiset palautteet.
**Korjaus:** Uusi tripScene: Aava kävelee paikasta toiseen, ja jokaisessa paikassa löytö ponnahtaa näkyviin. Demossa löytö lentää heti vihkon oikealle riville ja saa ✓-merkin. Tehtävissä retki näytetään ilman kirjaamista, ja oppilas kirjaa löydöt itse. Paikkalokeroihin tuli nimet ja löytöihin puhe. Jokaisella paikalla on oma palautteensa ("Metsässä Aava näki: käpy."). Uusi fix-tehtävä (2 sekaisin olevaa riviä) ja vihjeet. Demoja on kaksi (2 ja 3 paikkaa).
**Validointi:** tsc ja vitest (1589 testiä) menivät läpi. Selaimessa tarkistettiin ruudut ja tekstitykset. Vihkon leikkautuminen korjattiin: korkeus lasketaan nyt rivimäärästä. Siirtotehtävän ratkaisu hyväksytään, ja väärä vastaus saa paikkakohtaisen palautteen.

**Kritiikki:** Demo oli staattinen kuva. Tehtävissä luki "3 × simpukka", vaikka kertomerkkiä ei ole vielä opetettu 1.–2. luokalla. Kuvaa ei myöskään koskaan luettu, vaikka esityksen tarkoitus on, että toinen ymmärtää sen. Complete-tehtävän palautteet ja kaikki vihjeet puuttuivat.
**Korjaus:** Uusi presentScene: paikat tulevat näkyviin, löydöt putoavat yksi kerrallaan paikkansa alle ja juokseva määrä näkyy, ja lopuksi Loikka lukee sarakkeet ("Rannalla 3 simpukkaa"). Demoja on kaksi. Pick-tehtävän teksti on nyt luonnollista suomea oikeassa sijamuodossa, ja palautteet kertovat tarkasti, onko paikka väärä vai määrä väärä. Uudet tehtävätyypit: read (luetaan määrä animoidusta kuvasta, ja väärä vastaus kertoo, minkä paikan luku se on) ja most (missä eniten). Complete-tehtävään tuli lokerokohtaiset palautteet ja puhe. Vihjeet lisättiin kaikkiin tehtäviin.
**Validointi:** tsc ja vitest (1589 testiä) menivät läpi. Selaimessa tarkistettiin 8 animaatioruutua ja kaikki 4 tehtävätyyppiä: ratkaisu hyväksytään ja palautteet ovat oikein.

**Kritiikki:** Demo oli staattinen esityskuva, eikä siitä näkynyt koko ketjua retkestä vihkon kautta kuvaksi. Check-tehtävän data näytettiin valmiiksi riveinä, ja sen palautteet olivat yleisiä. Mikään tehtävä ei vaatinut määrien kirjaamista, vaikka retkivihko kokoaa määrät.
**Korjaus:** tripScene osaa nyt näyttää määrät: Aava laskee ääneen "1, 2…", ja löydöt lentävät rivilleen. Leveys mukautuu neljään paikkaan, joten siirtotehtäväkin animoituu. Demossa on koko ketju: retki laskien ja sitten presentScene, jossa Loikka lukee kuvan. Uusi count-peli: retki katsotaan ja määräkortit sijoitetaan paikkojen kohdalle. Mukana on yksi harhautuskortti, jossa määrä on väärä, ja jokaisella paikalla on oma palautteensa. Check-tehtävä käyttää nyt retkianimaatiota, ja sen palautteet nimeävät paikan ja määrän. Vihjeet lisättiin.
**Validointi:** tsc ja vitest (1589 testiä) menivät läpi. Selaimessa tarkistettiin ruudut ja tekstitykset sekä neljän paikan siirtotehtävä. Määräkortit tehtiin neliöiksi (48 px:n token), jotta 2 ja 3 erottuvat toisistaan. Kaikki 4 tehtävätyyppiä: ratkaisu hyväksytään ja palautteet ovat oikein.

**Kritiikki:** Demo oli valmis staattinen taulukko, eikä siitä näkynyt, miten havaintosivuista syntyy taulukko. Lajittelu-, most- ja total-tehtävistä puuttuivat vastauskohtaiset palautteet ja vihjeet. Oppilas ei koskaan itse täyttänyt taulukkoa. Tehtäväkuvien pistesivut venyivät koko leveyteen.
**Korjaus:** Uusi dataScene: jokaisen päivän sivun pisteet lasketaan yksi kerrallaan (numerot pisteissä, tekstitys "1, 2…"), luku lentää taulukon riville, ja lopuksi suurimman rivin kehys syttyy ("eniten tiistaina"). Demoja on kaksi. Uusi fill-peli: lukukortit sijoitetaan päivien riveille, mukana yksi harhautusluku, ja jokaisella rivillä on oma palautteensa ("Laske keskiviikon pisteet"). Genetiivi- ja essiivimuodot tulevat taulukoista (keskiviikon, keskiviikkona). Table-, most- ja total-tehtäviin tuli vastauskohtaiset palautteet ja vihjeet. Pistesivujen leveys on nyt kiinteä.
**Validointi:** tsc ja vitest (1589 testiä) menivät läpi. Selaimessa tarkistettiin 6 ruutua ja tekstitykset, fill-pelin näkymä sekä kaikkien 4 tehtävätyypin ratkaisut ja palautteet.

**Kritiikki:** Liikettä käsittelevä oppitunti esitti liikkeen vain kahtena still-kuvana, eikä mikään liikkunut ruudulla. Väärän vastauksen palaute oli yleinen. Tehtävät olivat kaikki samanlaisia kaksivalintoja, eikä yksikään vaatinut seuraamaan liikettä ajan kuluessa (paitsi siirtotehtävä still-kuvina).
**Korjaus:** Uusi pondScene: kolme lehteä kelluu kukin omalla kaistallaan oman kiven vieressä (aallot keinuvat). Lehdet joko ajelehtivat, käyvät kauempana ja palaavat, vaihtavat vain väriä (pehmeä häivytys) tai pysyvät paikallaan. Reveal-tilassa alkupaikat näkyvät katkoviivahaamuina, siirtymä merkitään viivalla, ja jokainen kaista saa merkinnän "liikkui" / "ei liikkunut" tekstityksen kanssa. Demoja on kolme. Uusi spot-peli: lehdet katsotaan animaationa ja valitaan kaikki liikkuneet. Moottoriin lisättiin monivalinnalle valinnainen `why`, joka antaa palautteen ensimmäisestä väärästä vaihtoehdosta. Moved-, still- ja colour-tehtäviin tuli vastauskohtaiset palautteet.
**Validointi:** tsc ja vitest (1589 testiä) menivät läpi. Selaimessa tarkistettiin 12 ruutua kahdesta demosta: haamut, merkinnät ja värin häivytys näkyvät oikein. Spot-pelin ratkaisu hyväksytään, ja molemmat väärät vastaukset saavat lehtikohtaisen palautteen.

**Kritiikki:** Kuvasarjat olivat staattisia, eikä niistä näkynyt, että ne syntyvät yhtä pitkin aikavälein otetuista kuvista, mikä on koko idean ydin. Väärän vastauksen palautteet puuttuivat. Pysähtymis- ja kääntymissarjoissa kuvanumerot menivät päällekkäin ("3/4/5"). Muutoksen ennustamista ei harjoiteltu.
**Korjaus:** Uusi swimScene: ankka ui reaaliajassa paloittain tasaisella nopeudella ja kääntyy menosuuntaansa. Joka tikityksellä välähtää kuva, joka jää haaleana näkyviin numeroineen, eli sarja rakentuu katsottaessa. Reveal-tilassa jokainen väli piirretään nuolena (paluu punaisella, pysähdys merkitään "ei liikettä"), ja tekstitys selittää muutoksen. Demoja on kolme (pysähtyi / nopeutui / kääntyi). Kaikki tehtävät käyttävät animaatiota. CHANGE_WHY-palautteet pätevät aina, kun valittu muutos poikkeaa oikeasta. Uusi next-peli: "Ankka pysähtyy. Missä se on kuvassa 5?" vaihtoehtoisina kuvasarjoina palautteineen. Päällekkäiset numerot pinotaan sekä animaatiossa että stripArtissa. Siirtotehtävän järjestelyyn tuli lokerokohtaiset palautteet ja vihje.
**Validointi:** tsc ja vitest (1589 testiä) menivät läpi. Selaimessa tarkistettiin 12 ruutua ja kolmen demon loppuruudut: numerot pinottu, nuolet erillään. Kaikki 5 tehtävätyyppiä ja siirtotehtävä: ratkaisu hyväksytään ja palautteet ovat oikein.

**Kritiikki:** Noodin nimi lupaa kahden ankan liikkeen vertailun, mutta demo oli kaksi staattista kuvanauhaa. Tehtävissä ei ollut aikaa eikä samanaikaisuutta, `still`- ja `describe`-tehtävistä puuttuivat syyt ja vihjeet, eikä siirtotehtävässä ollut perusteluja.
**Korjaus:** Uusi `duoScene` on reaaliaikainen kahden kaistan animaatio. Molemmat ankat uivat yhtä aikaa, ja yhteinen kamera välähtää ja ottaa kuvan molemmista samalla hetkellä. Lopuksi kumpikin kaista saa tuomiolapun ("liike pysähtyi" tai "nopeampi: pidemmät välit"), ja samaan kohtaan osuneet kuvat näkyvät numeroina muodossa 3·4·5. Demoja on kaksi: muuttunut liike ja nopeusvertailu. `which` käyttää animoitua duoa (Ylempi/Alempi). Uusi `faster`-mikropeli kysyy, kumpi ui nopeammin; vastaus luetaan välien pituudesta samassa ajassa. `still` ja `describe` käyttävät `swimScene`-animaatiota ja saivat syyt (CHANGE_WHY) ja vihjeet. Siirtotehtävä sai syyt ja vihjeen.
**Validointi:** tsc puhdas, vitest 1589/1 skip. Selaimessa tarkistettu demo- ja tehtäväkehykset sekä kuvatekstit. Numerot eivät enää leikkaudu, ja laput eivät peitä ankkoja. 200 siemenellä × 2 vaihetta ratkaisut ovat oikein ja väärillä vastauksilla on syy.

**Kritiikki:** Demot olivat staattisia hyllykuvia, ja koko selitys tuli puheena: lapsi ei nähnyt, mistä katsotaan ja mihin suuntaan. Tehtävät olivat pelkkiä tunnistusvalintoja, joista puuttuivat vihjeet ja useimmat syyt. Siirtotehtävän syyt menivät väärille vaihtoehdoille, kun filter poisti vaihtoehdon. Kukaan ei itse rakentanut sijaintia sanojen perusteella.
**Korjaus:** Uusi `shelfScene` on animoitu hylly. Viitetavara saa katkoviivarenkaan, aurinkomerkki kulkee ruutu kerrallaan kohteeseen ja jättää jäljen, ja sana (oikealla / vasemmalla / välissä / yläpuolella / alapuolella / perillä) ponnahtaa kohteen yläpuolelle. Demoja on kolme: vasen, oikea ja välissä; ylä ja ala; askelkävely vasemmasta alakulmasta. Uusi `build`-mikropeli: järjestä hylly kolmen sanallisen vihjeen mukaan. Vihjeissä on kolme varianttia, slotit ovat vasen, keski ja oikea, mukana on yksi ylimääräinen tavara, ja jokaisella slotilla on oma syy. Kaikki valintatehtävät saivat tarkat syyt ("väärä suunta", "ei suoraan kohdalla", "samalla hyllyllä") ja vihjeet. Siirtotehtävän syyt kulkevat nyt parina vaihtoehtonsa kanssa.
**Validointi:** tsc puhdas, vitest 1589/1 skip. 300 siemenellä × 2 vaihetta ratkaisut ovat oikein, ja jokaisella väärällä valinnalla on syy. Selaimessa tarkistettu animaatiokehykset (renkaat, jälki, laput) ja place-peli.

**Kritiikki:** Demot olivat staattisia ruudukoita, eikä lukujärjestystä (ensin x, sitten y) nähty prosessina. Väärä (2, 4) oli vain toinen piste. Syyt olivat yleisiä ("Laske ruudut uudelleen"), ja whichPin-, axis- ja siirtotehtävästä puuttuivat vihjeet. Origossa näkyi kahdesti piirretty nolla ("00"). Lapsi ei itse kirjoittanut yhtään koordinaattia.
**Korjaus:** Uusi `coordWalk`-animaatio. Merkki kulkee origosta ensin vaakasuunnassa, ja jokainen askel numeroituu sinisellä. Sitten se kulkee pystysuunnassa, ja askeleet numeroituvat oranssilla. Lopuksi rasti putoaa paikalleen ja koordinaatti kirjoitetaan samoilla väreillä (x sininen, y oranssi). Toisessa demossa kävellään sekä (4, 2) että (2, 4): ensimmäinen jää haaleaksi lappuineen vertailuun. `gridParts` erottaa ruudukon geometrian animaatioille. Origon numerot korjattiin kaikkiin ensimmäisen neljänneksen ruudukoihin. Uusi `label`-mikropeli: kirjaa kartan kolme merkkiä oikeille koordinaattikorteille. Mukana on väärin päin oleva harhautuskortti, ja jokaisella slotilla on oma syy. Read-tehtävän syyt kertovat nyt suunnan ("ruudun liian oikealla"). Vihjeet ja syyt ovat kaikissa tehtävissä.
**Validointi:** tsc puhdas, vitest 1589/1 skip. 300 siemenellä × 2 vaihetta ratkaisut ovat oikein, ja jokaisella väärällä valinnalla on syy. Selaimessa tarkistettu kävelyn kehykset (askelnumerot, värikoodattu lappu, vertailu) ja place-peli.

**Kritiikki:** Lekalla oli yksi staattinen demo, jossa valmis rasti oli jo paikallaan, eikä se näyttänyt kulkemista. Väärin merkitystä pisteestä ei kerrottu mitään (plot-tarkistus palautti vain ok/ei). Akseli-, tarina- ja siirtotehtävästä puuttuivat vihjeet. Akselipisteitä ja suhteellista paikkaa (toisesta paikasta käsin) ei opetettu.
**Korjaus:** Kolme `coordWalk`-demoa. Ensimmäinen kulkee kohtaan (3, 5) askel kerrallaan. Toinen vertaa akselipisteitä (4, 0) ja (0, 3). Kolmas lähtee laivasta (1, 2) ja kulkee 3 oikealle ja 2 ylös kohtaan (4, 4) laskutoimituksin. Moottori antaa nyt kaikille plot-tehtäville tarkan palautteen: väärin päin, vain x pielessä, vain y pielessä, väärä pistemäärä tai molemmat luvut pielessä. Uusi `fromShip`-perhe: merkitse aarre laivasta käsin. Vihjeet ovat kaikissa perheissä. Kuvatekstin askellaskuri vastaa nyt piirrettyjä askelia.
**Validointi:** tsc puhdas, vitest 1589/1 skip. 300 siemenellä × 2 vaihetta ratkaisut ovat oikein, ja pisteet pysyvät ruudukossa (≤ 6). Plot-palautteen viisi tapausta tarkistettu. Selaimessa tarkistettu kävelyn kehykset ja kuvatekstit.

**Kritiikki:** Lekalla oli yksi staattinen demo valmiista suorakulmiosta. Siitä ei näkynyt, miksi kulmilla on yhteisiä lukuja, miten puuttuva kulma päätellään tai mitä puoliväli tarkoittaa, vaikka kaikki kolme olivat tehtävinä. Move- ja siirtotehtävästä puuttuivat vihjeet, readPoly-tehtävän toisesta väärästä vaihtoehdosta puuttui syy, eikä corner-tehtävän explain perustellut vastausta.
**Korjaus:** Kolme animaatiota. (1) Saari rakennetaan `coordWalk`-animaatiolla (trace): kulmasta seuraavaan kävellään reunaa pitkin askelnumeroin, reunat piirtyvät, ja lopuksi muoto täyttyy ("vain x muuttui, joten reuna on vaakasuora"). (2) Uusi `cornerScene`: katkoviiva lähtee samalla pystyreunalla olevasta kulmasta (sininen x) ja toinen samalla vaakareunalla olevasta (oranssi y), ja ne kohtaavat puuttuvassa kulmassa. (3) Uusi `midScene`: kaksi merkkiä astelee palmuista toisiaan kohti numeroiduin askelin ja kohtaa puolivälissä. Uusi `build`-mikropeli: merkitse saaren kaikki neljä kulmaa, kun tiedetään vasen alakulma, leveys ja korkeus. Vihjeet ja tarkat syyt ovat kaikissa perheissä, ja explainit perustelevat laskun. Askelnumerot sijoitetaan lähtöpisteestä alle tai vasemmalle, jotta ne eivät peitä lappuja.
**Validointi:** tsc puhdas, vitest 1589/1 skip. 300 siemenellä × 2 vaihetta ratkaisut ovat oikein, pisteet pysyvät ruudukossa, ja jokaisella väärällä valinnalla on syy. Selaimessa tarkistettu kaikkien kolmen animaation kehykset ja kuvatekstit.

**Kritiikki:** Demot sanoivat "Taita ja katso", mutta kuvat olivat staattisia, joten taittamista ei nähnyt. Peilauksen etäisyysperiaate jäi vain puheeksi. Lapsi ei itse tehnyt yhtään peilikuvaa ruudukossa, vaan valitsi vain valmiista vaihtoehdoista. Grid-, complete- ja siirtotehtävästä puuttuivat vihjeet.
**Korjaus:** Uusi `foldScene` on aito taittoanimaatio: puolikas kääntyy viivaa pitkin toisen päälle, ja symmetria-akseli voi olla myös vino. Jos puolikkaat eivät osu päällekkäin, yli jäävät reunat piirtyvät punaisella. Taitos avataan lopuksi. Demoja on kolme: suorakulmion keskiviiva (osuu), suorakulmion lävistäjä (ei osu) ja neliön lävistäjä (osuu). Uusi `mirrorScene`: jokainen ruutu lentää vuorollaan viivan yli, ja etäisyys viivaan näkyy kummallakin puolella (sininen ja oranssi). Uusi `paint`-mikropeli (multi): lapsi maalaa peilikuvan napauttamalla viivan oikean puolen 12 ruudusta oikeat. Ensimmäisessä sarakkeessa näkyy peiliviiva, ja jokainen väärä tai puuttuva ruutu saa rivi- ja etäisyyskohtaisen syyn. Vihjeet ovat kaikissa perheissä.
**Validointi:** tsc puhdas, vitest 1589/1 skip. 300 siemenellä × 2 vaihetta ratkaisut ovat oikein, ja multi-tehtävän tyhjä vastaus saa syyn. Selaimessa tarkistettu taiton kehykset (osuva ja ei-osuva), peilauksen kehykset sekä paint-pelin ulkoasu ja valinta.

**Kritiikki:** Demot olivat staattisia mittaripareja; lämpötilan muutos (nollan ohitus) ei näkynyt prosessina. Colder/meaning/transfer ilman vihjeitä. Ei järjestämispeliä. Staattisen mittarin nimi peitti pallon.
**Korjaus:** Uusi thermoScene: neste liikkuu aste kerrallaan (0,38 s/aste), elävä lukema-pilli pinnan vieressä, kuvateksti "Pinta laskee: −2 °C (pakkasta)" / "nolla, raja!". 3 demoa: 0→−4 vs 0→4, −8 vs −2, 3→−2 nollan ohi (3 − 5 = −2). Vihjeet kaikkiin. Uusi order-peli: kolme päivän mittaria sekoitetussa järjestyksessä → kylmin/keskellä/lämpimin, paikkakohtaiset whyt. thermoArt-nimi siirretty pallon alle.
**Validointi:** tsc ok, vitest 1589/1. 300 siementä × 2 vaihetta: ratkaisut ok, väärillä whyt, vihje kaikissa, tagit meaning/order/thermo/colder/transfer. Selaimessa kehykset t=3/10/9/2,6 ja order-peli tarkistettu (ei vihjaavaa järjestystä).

**Kritiikki:** Demot olivat kaksi staattista lukusuorakuvaa; "askel kerrallaan vasemmalle" ei näkynyt tapahtumana. Read/order/transfer ilman vihjeitä; transferin lukusuorassa ei ollut virhekohtaisia selityksiä. Ei järjestämispeliä useammalle luvulle.
**Korjaus:** Uusi iceHops-animaatio: Loikka hyppää yksi askel kerrallaan (0,55 s/askel), jokainen hyppy jättää kaaren, lukema päivittyy ("Vasemmalle: 0, −1, −2…"), laskeutumispiste merkitään värillä, aiemmat hypyt jäävät haaleina. 3 demoa: −4 vs 4 symmetria, −6 < −2 < 3 järjestys, sukeltaja −2 − 3 = −5. Vihjeet read/order/transfer; transferille whyAt (väärä suunta, positiivinen, lähtökohta). Uusi sort-peli: 4 lukua (kolme negatiivista, ansana −8 vs −2) paikoille pienin→suurin, lukusuora tukena, paikkakohtaiset whyt.
**Validointi:** tsc ok, vitest 1589/1. 300 siementä × 2: ratkaisut ok, väärillä whyt, vihje kaikissa; tagit place/read/order/sort/transfer. Selaimessa kehykset tarkistettu (nimiöt eivät osu sammakkoon), sort-peli renderöityy.

**Kritiikki:** Yksi staattinen lukusuorakuva + kaava. Vertailu ei näkynyt prosessina eikä yhteyttä lämpömittariin. Bigger/colder/transfer ilman vihjeitä; order-pelissä ei paikkakohtaisia selityksiä ja tokenit saattoivat olla valmiiksi järjestyksessä. Ei vertailumerkkitehtävää (<, =, >).
**Korjaus:** Animaatiot siirretty yhteiseen moduuliin neganim.ts (thermoScene, iceHops). Demot: Loikka hyppää 0→−7 ja 0→−3 askel kerrallaan ("−7 < −3, kärki osoittaa pienempään"), sitten lämpömittarit aamu −3 / ilta −7 laskevat elävästi. Vihjeet kaikkiin. Order: paikkakohtaiset whyt, ei valmiiksi järjestettyä tokenjonoa. Uusi symbol-peli: <, =, > kahden negatiivisen luvun välille lukusuoran tuella, virheselitys kertoo suunnan; luvut vähintään 2 askeleen päässä, jotta nimiöt eivät mene päällekkäin.
**Validointi:** tsc ok, vitest 1589/1. 300 siementä × 2: ratkaisut ok, väärillä whyt, vihje kaikissa. Symbol-jakauma < 55 / = 18 / > 67 (600 siementä), ei vierekkäisiä lukuja. Selaimessa demojen loppukehykset ja symbol-peli tarkistettu.

**Kritiikki:** Kaksi staattista kuvaa (piste ja tyhjä I–IV-risti). Negatiivinen suunta ("miinus x = vasemmalle") ei näkynyt liikkeenä, eikä peilausta (transfer-tehtävä) ollut demottu lainkaan. Read-tehtävässä x/y-vaihdolla ei ollut why:tä; quadrant-valinnalla ei whyitä; read/quadrant/transfer ilman vihjeitä.
**Korjaus:** coordWalk laajennettu neljään neljännekseen (xMin/yMin, suuntasanat "Ensin vasemmalle: 1, 2…", "Sitten alas…", quads-numerot). Demot: kävely (−3, 2); neljä kävelyä I→II→III→IV, kukin kertoo merkit (+,+)…(+,−); peilikävely majakasta (2,3) akselin yli (−2,3). Read-whyt kaikille vaihtoehdoille (myös järjestysvirhe), quadrant-whyt merkeistä, vihjeet kaikkiin. Uusi sortQ-peli: 5 kohtaa lajitellaan neljänneksiin I–IV, kohdekohtaiset whyt.
**Validointi:** tsc ok, vitest 1589/1. 300 siementä × 2: ratkaisut ok, väärillä whyt, vihje kaikissa; tagit plot/read/quadrant/sortQ/transfer. Selaimessa välikehys, loppukehys ja peilikävely sekä sort-peli tarkistettu; aiempien solmujen coordWalk-kuvatekstit nyt suuntasanoilla.

**Kritiikki:** Demot olivat staattinen palikkakuva ja taulukko. "Kymmenen kertaa edellinen" ei näkynyt vaihtona, eikä nollan paikanpito näkynyt tyhjänä lokerona. Value-tehtävässä vain yhdellä väärällä vaihtoehdolla oli why; compose-tehtävässä kahdelta puuttui. Vihjeet puuttuivat value-, compare- ja transfer-tehtävistä. Rahakassateemaa ei pelattu lainkaan.
**Korjaus:** Uusi placeanim.ts.
- exchangeScene: kymmenen seteliä tulee yksi kerrallaan juoksevalla summalla (10, 20, …, 100), liukuu yhteen ja muuttuu yhdeksi isommaksi seteliksi (10 × 10 = 100, sitten 10 × 100 = 1000).
- tillScene: summa lajitellaan kassan lokeroihin, ja seteleitä lasketaan lokero kerrallaan. Lokeron alle ilmestyy numero, ja tyhjä lokero saa sykkivän punaisen 0:n.
- Demot: exchange 10 → 100 → 1000, kassa 3405 ja kassa 2061.
- Value: whyt kaikille vaihtoehdoille (pelkkä numero / 10× liian iso / 10× liian pieni).
- Compose: whyt yhteenlaskulle ja kymppien ja ykkösten vaihdolle.
- Vihjeet kaikkiin.
- Uusi till-peli: rahat lokeroissa, numerokortit (yksi nolla ja yksi harhautus) lokeroihin, paikkakohtaiset whyt.

**Validointi:** tsc ok, vitest 1589/1. 300 siementä × 2 vaihetta:
- ratkaisut ok;
- väärillä vaihtoehdoilla on whyt;
- ei päällekkäisiä vaihtoehtoja;
- vihje kaikissa.

Selaimessa tarkistettu vaihdon väli- ja loppukehykset, kassan väli- ja loppukehykset sekä till-pelin näkymä (9 setelin pino mahtuu).

**Kritiikki:** Demot olivat staattinen taulukko ja kaava sekä kaksi korttia. Purkaminen ei näkynyt numero kerrallaan, eikä "34 kymppiä" näkynyt vaihtona. Transferin ylivuoto (yli kymmenen sauvaa) oli demoamatta. Expand- ja regroup-tehtävistä puuttuivat vihjeet. Ei osien sijoittelupeliä.
**Korjaus:** Uudet animaatiot placeanim.ts-tiedostossa.
- expandScene: numero korostetaan, lentää alas omalle paikalleen ja saa nollansa yksi kerrallaan (3 → 3000). Nolla himmenee ("ei mitään"), ja lopuksi kirjoitetaan kaava.
- breakScene: satanen kerrallaan hajoaa kymmeneksi kympiksi juoksevalla laskulla (340 = 34 kymppiä).

Demot:
- expand 3405;
- break 3 sataa + 4 kymppiä;
- exchange 10 kymppiä → sata (ylivuoto).

Tehtävät:
- vihjeet expand- ja regroup-tehtäviin (molemmat haarat);
- uusi split-peli: luvun osat (myös 0) paikoilleen, kaksi houkutusta väärällä nollamäärällä, paikkakohtaiset whyt.

**Validointi:**
- tsc ok, vitest 1589/1.
- 300 siementä × 2: ratkaisut ok, väärillä whyt, vihje kaikissa.
- Selaimessa tarkistettu expandin väli- ja loppukehykset (fontti pienennetty, ettei osu plussaan), breakin väli- ja loppukehykset sekä split-peli.

**Kritiikki:** Demossa oli kaksi staattista allekkainkuvaa (puolivalmis ja valmis). Muistinumeron liike sarakkeesta toiseen ei näkynyt, eikä esimerkkiä ollut ilman muistinumeroa tai uudesta tuhatnumerosta. Ones- ja check-tehtävistä sekä transferista puuttuivat vihjeet. Kun ones-tehtävän vastaus oli 1, satunnaisella vaihtoehdolla ei ollut whytä. Muistinumerovirhettä ei voinut diagnosoida.
**Korjaus:**
- Uusi writtenanim.ts, addColumnScene. Sarake korostuu ja sen summa näytetään ("Kymmenet: 4 + 7 + 1 = 12", ylivuoto punaisella). Ykkösnumero putoaa vastausriville, ja muistinumero 1 kaartaa seuraavan sarakkeen yläpuolelle. Viimeinen muistinumero laskeutuu vastaukseen uudeksi numeroksi, ja valmis vastaus kehystetään.
- Kolme demoa: 348 + 275 (kaksi muistinumeroa), 352 + 136 (ei muistinumeroa) ja 685 + 347 (= 1032).
- Vihjeet kaikkiin tehtäviin. Ones-tehtävään kolmas why-ehdokas (10).
- Uusi where-peli: Loikan väärästä vastauksesta (yksi unohtunut muistinumero) valitaan sarake, jossa virhe on. Whyt kaikille vaihtoehdoille.

**Validointi:**
- tsc ok, vitest 1589/1.
- 300 siementä × 2 vaihetta: ratkaisut ok, väärillä whyt, vihje kaikissa.
- where-pelissä vastaukset jakautuvat kymmenet 25 / sadat 25.
- Selaimessa tarkistettu demon kehykset: sarakkeen korostus, muistinumero ja 1032:n uusi numero.

**Kritiikki:** Demot olivat staattisia (valmis sarakekuva + kortti). Vaihtoa (lainausta) ei nähnyt tapahtuvan, nollan yli vaihtoa ei näytetty lainkaan. flip/check ilman vihjettä. Ei peliä, jossa lapsi itse ennakoi vaihdot.
**Korjaus:** Uusi subColumnScene (writtenanim): sarake kerrallaan, vaihdossa naapurinumero yliviivataan ja pienennetty arvo nousee punaisena yläpuolelle, nolla muuttuu 10→9, sarakkeen lasku kuplana, numero putoaa tulokseen, valmis tulos vihreällä kehyksellä. Demot 352−178, 405−178 (nollan yli) ja tarkistus addColumnScene(174,178). Vihjeet flip/check. Uusi minipeli "needs": valitse kaikki sarakkeet, joissa tarvitaan vaihto (multi, perustelut joka sarakkeelle).
**Validointi:** tsc + vitest 1589/1; 300 siementä × 2 vaihetta: ratkaisu ok, vihje ja perustelut joka kohdassa, multi ei koskaan tyhjä; selaimessa ruudut 405−178 (vaihto 4→3, 0→9, 5→15, tulos 227) ja kuvatekstit tarkistettu.

**Kritiikki:** Demot olivat kaksi staattista korttia; välivaiheiden kirjoittamista allekkain ("= …") ei näytetty, eikä yhtään kolmen laskun lauseketta. Kaikista tehtävistä puuttui vihje, numeeristen virhevastausten (sulut unohdettu, vasemmalta oikealle) perustelut puuttuivat. Ei peliä, jossa lapsi itse järjestää laskut.
**Korjaus:** Uusi exprScene (writtenanim): vihkomalli — seuraavaksi laskettava osa korostuu, sen arvo ilmestyy kaaren alle, ja lyhentynyt lauseke kirjoittuu uudelle riville "= …" (uusi arvo sinisellä), lopuksi vihreä kehys; fontti mukautuu pituuteen. Demot 2 + 3 × 4, (2 + 3) × 4, 18 : (4 − 1) + 2 × 5. Vihjeet kaikkiin, whyAt paren/sub-virheille, mulFirst kolmas kandidaatti. Uusi minipeli "steps": kolme laskutoimitusta järjestykseen (1. ensin / 2. / 3. viimeisenä), perustelu joka paikalle.
**Validointi:** tsc + vitest 1589/1; 300 siementä × 2: ratkaisu ok, vihje, perustelut (2 puuttuvaa korjattu); selaimessa ruudut 18 : (4 − 1) + 2 × 5 → 16 ja 2 + 3 × 4 → 14 tarkistettu, ylivuoto korjattu.

**Kritiikki:** Demo oli staattinen suorakulmio + kaavakortti; "reunaa pitkin kuljetaan" sanottiin mutta ei näytetty. Ruudukkokuvion laskemista ei demottu. Numeerisissa tehtävissä ei perusteluja tyypillisille virheille (puolikierros a+b, pinta-ala a×b, kolmion sivu unohtui); meaning/transfer ilman vihjettä. Ei peliä, joka näyttäisi, että eri kuvioilla voi olla sama piiri.
**Korjaus:** Uusi perimanim.ts: perimScene — Loikka kiertää reunan, punainen nauha jää perään, sivujen pituudet ja juokseva summa ilmestyvät; ruudukossa jokainen reunan ruudun sivu numeroituu 1…P; lopuksi nauha vedetään suoraksi janaksi "12 cm". cellBoundary jäljittää ruutukuvion reunan. Demot: suorakulmio 4×2, L-kuvio ruudukossa, kolmio 3-4-5. whyAt rect (a+b, a·b) ja transfer (sivu unohtui), vihjeet. Uusi minipeli "same": lajittele 4 suorakulmiota piirin mukaan (P1/P2), perustelu jokaiselle.
**Validointi:** tsc + vitest 1589/1 (families-testi vaati, ettei selityksessä käytetä ×-merkkiä — korjattu); 300 siementä × 2: ratkaisu ok, vihje, perustelut, lajittelussa aina 4 kuvaa kahteen ryhmään; selaimessa kaikki 3 demoa loppukuvana ja kesken kävelyn, nimiöiden päällekkäisyydet korjattu.

**Kritiikki:** Temput (10×−1, 5×+1, tuplaus) olivat vain kaavakortteja: lapsi ei nähnyt, miksi 9 × 7 = 70 − 7 (rivi otetaan pois). 7-taulun temppua ei ollut. Numeerisille virheille (10k, 10k−9, 5k+6) ei perusteluja; fact ilman vihjettä ja selitys pelkkä tulos. Ei tehtävää, jossa valitaan oikea temppu.
**Korjaus:** Uusi multanim.ts trickScene(a,k): pisterivit ilmestyvät yksi kerrallaan juoksevalla laskurilla (r × k = …), sitten 9×: viimeinen rivi punaiseksi ja liukuu pois (− k); 6×/7×: vihreät rivit liukuvat lisää (+ k / + 2k); 8×: 4-rivinen lohko kopioituu oranssina alle (+ 24); lopuksi vihreä kehys ja yhtälö. Demot 9×7, 6×7, 8×6, 7×8. whyAt nine/six/transfer, fact-vihje ja temppuselitys. Uusi minipeli "trick": valitse lauseke, joka antaa saman kuin a × k (harhautukset −9 / +6 / +4 jne. perusteluineen, duplikaatit estetty).
**Validointi:** tsc + vitest 1589/1 (content-testi löysi duplikaattivaihtoehdon k = a / 8×4 — korjattu); 300 siementä × 2: ratkaisu ok, vihje, perustelut; selaimessa kaikkien 4 demon väli- ja loppuruudut tarkistettu.

**Kritiikki:** Naapuritulo ja puuttuva tekijä esitettiin pelkkinä kortteina: ei näkynyt, miksi 7 × 9 = 56 + 7 (yksi sarake lisää). mixed-tehtävästä puuttuivat perustelut ja vihje, neighbour/transfer ilman vihjettä, numeerisille virheille ei perusteluja. Ei tehtävää, jossa taulun rakenne (+a joka askel) tulisi esiin.
**Korjaus:** multanim: neighbourScene(a,b,up) — a riviä b:n pisteitä; uusi vihreä sarake liukuu sisään (+a) tai viimeinen sarake punaisena pois (−a), lopuksi kehys ja yhtälö. factorScene(b,prod) — b:n rivejä lisätään yksi kerrallaan juoksevalla taulukolla "k × b = …" kunnes tavoite täyttyy ✓. Demot 7×8→7×9, 6×9→6×8, ?×7=42. Perustelut mixed + vihje, whyAt factor/neighbour/transfer, vihjeet. Uusi minipeli "row": täydennä kertotaulun kolme aukkoa (place, 2 harhautusta, perustelu "edellinen + a").
**Validointi:** tsc + vitest 1589/1; 300 siementä × 2: ratkaisu ok, vihje, perustelut, ei samoja tokeneita; selaimessa ylös/alas/puuttuva tekijä -ruudut, b = 9 ylivuoto korjattu.

**Kritiikki:** Osittelu ja allekkain kertominen olivat staattisia kortteja; muistinumeron synty ja lisääminen kertomisen jälkeen ei näkynyt. Paikka-arvovirhettä (4 × 30 = 12) ei harjoiteltu. check/transfer ilman vihjettä, transferissa ei perustelua (lisättiin eikä kerrottu).
**Korjaus:** writtenanim: partsMulScene(k,n) — k-korkuinen kaistale pilkkoutuu sadoiksi/kymmeniksi/ykkösiksi, osa kerrallaan väri + "k × 200" + tulo, kuvateksti "4 × 2 = 8, ja kaksi nollaa perään", lopuksi osien summa. mulColumnScene(n,k) — sarake kerrallaan kupla "k × d + muisti = p", numero putoaa, muistinumero kaartaa seuraavan sarakkeen yläpuolelle (käytetty himmenee), viimeinen muisti putoaa vastaukseen. Demot 4 × 236 osina ja allekkain, 57 × 8. Uusi minipeli "parts": osatulot paikoilleen (harhautuksina nollat unohtunut: 12, 8…). Vihjeet check/transfer, whyAt transfer.
**Validointi:** tsc + vitest 1589/1; 300 siementä × 2: ratkaisu ok, vihje, perustelut, ei tokenduplikaatteja; selaimessa 4 × 236, 6 × 309 (ei kymppejä), 57 × 8 loppuruudut ja keskivaihe.

**Kritiikki:** Demot olivat staattisia kortteja (684:2, 72:3) – vaihto kympistä ykkösiksi jäi pelkäksi tekstiksi eikä näkynyt. Tarkistus- ja siirtotehtävistä puuttui vihje, siirron väärästä operaatiosta ei saanut selitystä, eikä yksikään tehtävä harjoittanut juuri sitä hetkeä, jolloin vaihto tarvitaan.
**Korjaus:** Uusi dealDivScene: sadat/kympit/ykköset-palat lentävät vuorotellen laatikoihin, ylijäävät muuttuvat punaisiksi ja vaihtuvat 10 seuraavaksi paloiksi, laatikoiden välisummat kasvavat, lopussa yhtälö ja tarkistus. Demot 684:2, 72:3 ja 156:4 (sata ei riitä → vaihto kahdesti). Uusi minipeli "exch" (monivalinta: missä jakolaskuissa kymppi pitää vaihtaa). exchange-tehtävään whyAt unohtuneesta ylijäämästä, check- ja transfer-tehtäviin vihjeet, transferiin whyAt vähennyslaskuvirheelle. Kuvatekstien taivutus korjattu (6 sataa, vaihdetaan 10 kympiksi).
**Validointi:** tsc ok, vitest 1589/1 skip, siemenajo 300×2: 0 virhettä (kaikki tagit esiintyvät), ruudut tarkistettu selaimessa kolmesta demosta (ei päällekkäisyyksiä).

**Kritiikki:** Kaksi staattista korttia (24:4 / 25:4 ja jaollisuuden merkit listana). Jaollisuuden ydinidea – "mitään ei jää yli" – ja viimeisen numeron säännön syy eivät näkyneet. meaning- ja transfer-tehtävistä puuttui vihje, threes-monivalinnasta selitykset vaihtoehdoittain.
**Korjaus:** Uusi divisanim.ts: packScene (pallot lentävät yksi kerrallaan k:n laatikoihin, täydet laatikot vihreiksi, ylijäämä punaiseksi, lopussa yhtälö) ja skipScene (Loikka hyppää k ruutua 1–50-taululla, osumat värjäytyvät, lopuksi viimeisen numeron sarakkeet kehystetään). Demot 24:4, 25:4, 2:n ja 5:n hypyt. Uusi lajittelupeli "tags" (10:llä / 5:llä ei 10:llä / 2:lla ei 5:llä) perusteluineen. Vihjeet meaning- ja transfer-tehtäviin, threes-tehtävään why jokaiselle luvulle.
**Validointi:** tsc ok, vitest 1589/1 skip, siemenajo 300×2: 0 virhettä, lajittelussa aina 6 eri lukua. Selaimessa tarkistettu alku- ja loppuruudut (laatikkonumerot eivät enää mene päällekkäin).

**Kritiikki:** Kaksi tekstikorttia väittivät yhteyden (4 × 3 = 3+3+3+3; ¼ luvusta 12 = 12 : 4) mutta eivät näyttäneet sitä. Kaikista tehtävistä puuttui vihje, siirtotehtävästä whyAt yleisimmille virheille (pinta-ala, 2 sivua), eikä mikään tehtävä pyytänyt itse yhdistämään esitystapoja.
**Korjaus:** Uudet repeatScene (värilliset ryhmät ilmestyvät yhteenlaskuksi juoksevalla summalla, liukuvat sitten allekkain riveiksi → k × g) ja fracShareScene (kivet jaetaan vuorotellen n osaan, yksi osa korostetaan → 1/n = jakolasku). Kolmas demo: neliön piiri perimScenellä (4 × sivu). Uusi place-peli "pairs": yhdistä k × g, 1/n luvusta, neliön piiri kaksoisolentoihinsa, 2 houkutinta (summa, kertolasku, sivu × sivu). Vihjeet kaikkiin, transferiin whyAt s×s, s+4, 2s. families.ts:ään pairs-rivi.
**Validointi:** tsc ok, vitest 1589/1 skip, siemenajo 300×2: 0 virhettä, ei päällekkäisiä token- tai slottitekstejä. Ruudut tarkistettu selaimessa (summarivi ja taulukko eivät enää mene päällekkäin).

**Kritiikki:** Demot olivat valmiiksi väritettyjä nauhakuvia + kaava. Kymmeneen osaan jakaminen, osien laskeminen ja yhteys lukusuoraan eivät näkyneet; 10/10 = 1 -siirtymä jäi lauseeksi. bar-, over- ja transfer-tehtävistä puuttui vihje, eikä mikään tehtävä yhdistänyt sanallista kuvausta, murtolukua ja desimaalilukua.
**Korjaus:** Uusi decanim.ts / tenthsScene: kokonainen nauha leikataan kymmeneen osaan viiva kerrallaan, osat täyttyvät yksi kerrallaan ja punainen merkki kulkee lukusuoralla juoksevalla lukemalla; 10 osan jälkeen nauha kehystyy vihreäksi "1" ja uusi nauha alkaa. Demot 7 ja 13 kymmenesosaa. Uusi place-peli "names": kuvaukset (k kymmenesosaa, k/10, 1 kokonainen ja k kymmenesosaa) → desimaaliluvut, houkuttimina 0,0k ja kokonaisluku. Vihjeet bar-, over- ja transfer-tehtäviin.
**Validointi:** tsc ok, vitest 1589/1 skip, siemenajo 300×2: 0 virhettä, ei päällekkäisiä token-tekstejä. Selaimessa tarkistettu leikkaus-, täyttö- ja loppuruudut (merkin lukema ei osu nauhaan).

**Kritiikki:** Valmiiksi väritetyt satasruudukot ja kaavat. Sarake = kymmenesosa ja ruutu = sadasosa -rakenne ei rakentunut näkyvästi, eikä 0,3 = 0,30 -yhtäsuuruuden syy (sama alue, eri jako) näkynyt. grid-, digit- ja transfer-tehtävistä puuttui vihje, eikä mikään tehtävä harjoittanut useita samanarvoisia esitystapoja.
**Korjaus:** decanim.ts / hundredsScene: build-tila täyttää sarakkeet yksi kerrallaan (0,1-tunnisteet), sitten irtoruudut yksi kerrallaan, oikealla juokseva laskuri (k saraketta = 0,k; m ruutua = 0,0m) ja lopussa värikoodattu 0,km. same-tila: sarakkeet täyttyvät, sitten ruutuviivat ilmestyvät → 30 ruutua = 30 sadasosaa → 0,3 = 0,30. Uusi multi-peli "equal": valitse kaikki yhtä suuret kuin 0,a (0,a0, 10a sadasosaa, a kymmenesosaa vs. 0,0a, a sadasosaa, a), perustelu jokaiselle. Vihjeet grid-, digit- ja transfer-tehtäviin.
**Validointi:** tsc ok, vitest 1589/1 skip, siemenajo 300×2: 0 virhettä, ei päällekkäisiä vaihtoehtoja. Selaimessa tarkistettu väli- ja loppuruudut molemmista tiloista.

**Kritiikki:** Kaksi tekstikorttia (0,375 = 0,3 + 0,07 + 0,005; 1 mm = 0,001 m). Paikka-arvojen "kymmenen kertaa pienempi" -rakenne ja nollan paikanpitäjärooli (48 mm = 0,048 m) eivät näkyneet. Vihjeet puuttuivat kaikista tehtävistä.
**Korjaus:** decanim.ts / zoomScene: metrin jana jaetaan kymmeneen, merkki kävelee kymmenesosat, valittu väli suurennetaan katkoviivasuppilolla seuraavaksi janaksi (sadasosat, cm) ja vielä kerran (tuhannesosat, mm); alareunan lukema rakentuu numero kerrallaan värikoodattuna. Demot 375 mm ja 48 mm (nolla kymmenesosaa). Uusi place-peli "mmPair": 3-, 2- ja 1-numeroiset millimetrimäärät metreiksi, houkuttimina nollan unohtavat 0,5x m / 0,0x m. Vihjeet kaikkiin tehtäviin.
**Validointi:** tsc ok, vitest 1589/1 skip, siemenajo 300×2: 0 virhettä, ei päällekkäisiä token-tekstejä. Selaimessa tarkistettu 375 ja 48 mm loppuruudut (päätyluku piilotetaan, kun merkin lukema osuu sen päälle).

**Kritiikki:** Kaksi tekstikorttia (3,7 ja 3,07 lukutapoineen). Lukusääntö – kokonaiset, pilkun jälkeiset numerot yhtenä lukuna, nimi viimeisen numeron paikasta – ei näkynyt vaiheittain. Vihjeet puuttuivat kaikista tehtävistä, eikä mikään tehtävä harjoittanut nimen päättelyä numeroiden määrästä.
**Korjaus:** decanim.ts / readScene: iso luku, kokonaisten sulkumerkki, paikkanimet värjäävät numerot yksi kerrallaan, viimeinen numero ympyröidään (antaa nimen), pilkun jälkeiset numerot sulutetaan yhdeksi luvuksi (07 → 7), ja alareunan lause rakentuu osa kerrallaan. Demot 3,7 / 3,07 / 2,45. Uusi lajittelupeli "unit": 6 lukua → …kymmenesosaa / …sadasosaa / …tuhannesosaa perusteluineen. Vihjeet kaikkiin tehtäviin; taivutus 1 kokonainen / 1 numero.
**Validointi:** tsc ok, vitest 1589/1 skip, siemenajo 300×2: 0 virhettä, ei päällekkäisiä lajittelulukuja. Selaimessa tarkistettu ruudut (numeroväli levennetty, nimet eivät mene päällekkäin).

**Kritiikki:** Demo oli yksi staattinen kortti; teens- ja transfer-tehtävistä puuttuivat vihjeet ja virheperustelut; ei omaa rakentelupeliä paikka-arvolaatikoille.
**Korjaus:** writeScene-animaatio (3 demoa): kokonaiset lentävät laatikkoon, pilkku ilmestyy, yksikkösana osoittaa viimeistä paikkaa, desimaalinumerot liukuvat oikealta, tyhjät paikat välähtävät ja saavat nollan. Uusi place-peli `build` (kokonaiset / kymmenesosat / sadasosat, 2 houkutinnumeroa). Vihjeet ja whyAt teens- ja transfer-tehtäviin.
**Validointi:** tsc ok, vitest 1589 passed / 1 skipped; 300×2 siemenen sweep 0 virhettä (tagit hundredths, transfer, build, teens, tenths); selainruudut t=3.5, t=6 ja loppu tarkistettu, ei päällekkäisyyksiä.

**Kritiikki:** Demo oli yksi staattinen kortti "4,62 = 4 + 0,6 + 0,02"; purkamisen ja kokoamisen liike puuttui kokonaan; pick- ja compose-tehtävistä puuttuivat vihjeet, ja tyypillisille virheille (0,5 vs 0,05, paikat ristiin, sentti = 0,10) ei ollut virheperusteluja; ei omaa peliä osien lajitteluun.
**Korjaus:** Uusi decomposeScene (decanim.ts): split-tilassa jokainen numero putoaa luvusta omaan osalaatikkoonsa, arvo (4 / 0,6 / 0,02) ja kuvallinen määrä (ruudut, palkit, pisteet) ilmestyvät, plussat ja yhtälö lopuksi; build-tilassa osien numerot lentävät lukuun ja tyhjä kymmenesosapaikka välähtää punaisena ja saa nollan. Kolme demoa (4,62 purku, 7 + 0,3 + 0,08, 3 + 0,05). Uusi place-peli `parts` (3 laatikkoa, 2 houkutinosaa 0,b ja 0,0a). Vihjeet pick/compose/transfer, whyAt missing/compose/transfer.
**Validointi:** tsc ok, vitest 1589 passed / 1 skipped; 300×2 sweep 0 virhettä (tagit pick, compose, parts, missing, transfer); selainruudut tarkistettu, plussien päällekkäisyys korjattu kaventamalla laatikot.

**Kritiikki:** Demot olivat staattinen lukusuorakuva ja kortti "0,50 > 0,45"; paikka kerrallaan vertaamisen prosessi (pilkut kohdakkain, nollan lisäys, ensimmäinen ero) ei näkynyt liikkeenä. trap/symbol/order-tehtävistä puuttuivat vihjeet. Ei peliä, jossa "pidempi = suurempi" -harhaa harjoitellaan useilla luvuilla kerralla.
**Korjaus:** Uusi compareScene (decanim.ts): luvut pilkut kohdakkain, lyhyempään liukuu vihreä nolla, korostussarake kulkee paikka kerrallaan (=, =, ▲/▼) ensimmäiseen eroon, lopuksi molemmat liukuvat lukusuoralle, joka zoomautuu sadasosatarkkuuteen kun luvut ovat lähellä. Kolme demoa: 0,5 vs 0,45, 3,08 vs 3,1, 0,6 = 0,60. Uusi sort-peli `half` (alle/yli 0,5, ansat 0,09, 0,4x, 0,6). Vihjeet trap/symbol/order.
**Validointi:** tsc ok, vitest 1589 passed / 1 skipped; 300×2 sweep 0 virhettä (tagit symbol, transfer, order, half, trap; sortissa aina molemmat kategoriat ja uniikit kortit); selainruudut tarkistettu, lukusuoran tunnisteiden päällekkäisyys ja reunaan jäävä yhtäsuuruuspiste korjattu.

**Kritiikki:** Demot olivat kaksi staattista korttia (valmis pinolasku ja "≠ 3,30"). Pilkkujen kohdistus, nollan lisäys, muistinumero ja lainaus jäivät näyttämättä, vaikka ne ovat koko aiheen ydin. tenths/mixed/transfer-tehtävistä puuttuivat vihjeet, eikä tyypillisille virheille ollut whyAt-palautetta. Ei virheentunnistuspeliä.
**Korjaus:** Uusi decColumnScene (decanim.ts): ensin houkutteleva väärä asettelu punaisena (numerot oikeaan reunaan, ✗), sitten luvut liukuvat pilkut kohdakkain, tyhjä paikka saa vihreän nollan (myös 5 → 5,0 ja pilkku), lasku etenee sarake kerrallaan oikealta korostettuna, muistinumero ja lainaus (yliviivaus, 4 ja 10) näkyvät. Kolme demoa: 2,5 + 1,25, 3,47 + 1,8 (muistinumero), 5 − 1,7 (lainaus). Uusi sort-peli `detective` (oikein/väärin, väärät = oikeaan reunaan kohdistetut summat). Vihjeet tenths/mixed/transfer, whyAt tenths (sadasosat / unohtunut pilkku) ja sub (unohtunut lainaus, vain kun lainaus tapahtuu).
**Validointi:** tsc ok, vitest 1589 passed / 1 skipped; 300×2 sweep 0 virhettä (tagit mixed, transfer, detective, sub, tenths; sortissa uniikit kortit ja molemmat kategoriat); selainruudut ansa-, muistinumero- ja lainausvaiheista tarkistettu; ansa-captionin taivutus korjattu yleiseksi.

**Kritiikki:** Demot olivat kaksi staattista korttia ("4 × 0,3 = 12 kymmenesosaa", "3,45 × 10 = 34,5"). Ryhmien kertyminen ja numeroiden siirtyminen paikka-arvotaulukossa eivät näkyneet. Tutun "pilkku hyppää" -mielikuvan sijaan piti näyttää, että numerot siirtyvät ja pilkku pysyy. whole- ja repeated-tehtävistä puuttuivat vihjeet, tens-tehtävästä vihje ja virhepalaute.
**Korjaus:** timesTenthsScene: k ryhmää kymmenesosia täyttää palkkeja ryhmä kerrallaan eri väreillä; täysi palkki = 1. shiftScene: paikka-arvotaulukko, jossa pilkku pysyy kiinteänä punaisena pisteenä, numerot liukuvat paikka kerrallaan, etunolla häviää ja tyhjät paikat saavat vihreät nollat (toimii myös ÷). Demot 4 × 0,3, 3,45 × 10, 0,7 × 1000. Uusi place-peli `shift` (×10/×100/×1000, houkutin ÷10). Vihjeet whole/tens/repeated, whyAt tens (väärä suunta, liian vähän siirtoja).
**Validointi:** tsc ok, vitest 1589 passed / 1 skipped; 300×2 sweep 0 virhettä (tagit tens, transfer, shift, repeated, whole); selainruudut tarkistettu; korjattu etunollan liukuminen tuhansiin ja ÷-tilan puuttuva ykkösten nolla.

**Kritiikki:** Demot olivat kaksi staattista korttia ("4,8 : 2 = 2,4", "45 : 100 = 0,45"). Jakamisen ydin (kokonaiset ensin, yli jäävän kokonaisen vaihto kymmeneksi kymmenesosaksi) ei näkynyt lainkaan, ja demossa oli vain helppo tapaus ilman vaihtoa. tens/money/transfer-tehtävistä puuttuivat vihjeet.
**Korjaus:** Uusi shareDecScene (decanim.ts): kokonaiset lentävät lautasille kierros kerrallaan, yli jäävät kokonaiset hehkuvat "=10" ja purkautuvat kymmeneksi kymmenesosaksi, sitten kymmenesosat jaetaan; lopuksi jokaisen lautasen tulos ja tarkistus. Demot 4,8 : 2, 5,4 : 3 (vaihto) ja shiftScene 45 ÷ 100. Uusi place-peli `steps` (kokonaisia jokaiselle / jää yli / kymmenesosia vaihdon jälkeen / jokaiselle; houkutin = alkuperäinen kymmenesosamäärä). Vihjeet tens/money/transfer, whyAt transfer (jaettu kymmenellä).
**Validointi:** tsc ok, vitest 1589 passed / 1 skipped; 300×2 sweep 0 virhettä (tagit tens, transfer, money, steps, share; place-korteissa ei duplikaatteja); selainruudut jako-, vaihto- ja loppuvaiheesta tarkistettu; vaihtomerkinnän ja otsikon päällekkäisyys korjattu.

**Kritiikki:** Demot olivat staattinen rappuskuva ja kortti "1 m = 10 dm = 100 cm = 1000 mm". Portaiden askeltaminen (×10 joka porras alas, :10 ylös) jäi oppilaan pääteltäväksi, eikä ylöspäin muuntamista näytetty lainkaan. prefix/other-tehtävistä puuttuivat virheperustelut ja kaikista vihjeet. Ei rappusten rakentamispeliä.
**Korjaus:** Uusi unitanim.ts / stairsScene: sammakko hyppää porras kerrallaan, oikeaan reunaan piirtyy ×10 / :10 -kaari jokaisesta hypystä, iso lukema vaihtuu (1 m → 10 dm → 100 cm) ja alle kasvaa ketjuyhtälö. Demot 1 m → cm, 1 km → m (väliportaat mukana), 2500 g → kg (ylös, jakaminen). Uusi place-peli `build` (yksiköt suurimmasta pienimpään: metri-, gramma- tai litraperhe). Vihjeet kaikkiin, why prefix/other-vaihtoehtoihin.
**Validointi:** tsc ok, vitest 1589 passed / 1 skipped; 300×2 sweep 0 virhettä (tagit steps, transfer, other, build, prefix); selainruudut tarkistettu (tumma teema): sammakon rivisijoitus ja lukulapun ylivuoto korjattu siirtämällä lukema portaiden alla olevaan tyhjään kulmaan.

**Kritiikki:** Demot olivat staattisia porraskuvia + kortteja; ei nähnyt muunnoksen etenemistä porras kerrallaan. Väärään suuntaan muuntamisesta (kerro/jaa) tai yhden portaan virheestä ei tullut kohdennettua palautetta. Siirtotehtävästä puuttui vihje. Ei mikropeliä, joka vertaisi yhtä suuria määriä eri yksiköissä.
**Korjaus:** conv()-demot korvattu stairsScene-animaatioilla (3 m → cm, 2,5 m → cm desimaalina, 150 cm → m ylöspäin). Uusi place-peli `match`: yhdistä samat määrät, yhden portaan päässä oleva houkutin jää yli. whyAt väärälle suunnalle ja yhden portaan virheelle; siirtotehtävään vihje ja whyAt (×10 vs ×100). Porraskuvan loppuvirke selkeytetty ("jaa luvulla 100").
**Validointi:** tsc puhdas, vitest 1589 passed | 1 skipped; 300×2 sweep: 0 virhettä (sol, hint, place-uniikit), tagit cm-mm, cm-m, mm-cm, m-cm, km-m, match, transfer. Ruudut tarkistettu selaimessa (30 dm välivaihe, 250 cm, 1,5 m).

**Kritiikki:** Massamuunnoksissa ei näkynyt, miksi kg → g -kerroin on 1000 (h- ja da-portaat puuttuvat arjesta), eikä siirtotehtävän kaksivaiheisuutta (muunna, sitten jaa) havainnollistettu. Arviointitaito (onko vastaus järkevä) puuttui kokonaan. Yhden portaan virheen palaute viittasi portaisiin myös tonneille, joita portailla ei ole.
**Korjaus:** Uusi packScene-animaatio: säkki 2 kg nimetään uudelleen 2000 g:ksi ja kaadetaan 250 g:n pusseihin yksi kerrallaan, laskuri ja säkin taso etenevät (9,3 s). Uusi sort-peli `sense` (järkevä / ei järkevä mitta, arkiesineet) kaikille muunnossolmuille. Portaat-demot (3 kg → g, 2,5 kg → g, 1500 g → kg) ja match-peli conv()-päivityksestä. whyAt "kerroin on 1000, ei 10" sekä siirtotehtävään vihje + whyAt (kerrottu vs jaettu, 100 vs 1000).
**Validointi:** tsc puhdas, vitest 1589 passed | 1 skipped; 300×2 sweep M-UNIT-03: 0 virhettä, tagit t-kg, kg-g, g-kg, sense, match, transfer. Ruudut tarkistettu (muunnos, 4. pussi, loppu).

**Kritiikki:** Tilavuusmuunnokset esitettiin staattisella porraskuvalla ja kortilla; desilitran suhde litraan (10 dl kannussa) ei näkynyt. Siirtotehtävästä (kannu → lasit) puuttuivat vihje ja virhepalaute. Arviointitaito puuttui.
**Korjaus:** Uusi pourScene-animaatio: 1,5 l kannun kylkeen piirtyy dl-asteikko (1 l = 10 dl), sitten kaadetaan 3 dl:n laseihin yksi kerrallaan, kannun lukema ja laskuri etenevät porrastetusti (9,4 s). Portaat-demot (3 l → dl, 2,5 l → dl, 15 dl → l), match- ja sense-pelit (juomalasi, ämpäri, teelusikka...). Siirtotehtävään vihje ja whyAt (muuntamatta jaettu, kerrottu jakamisen sijaan).
**Validointi:** tsc puhdas, vitest 1589 passed | 1 skipped; 300×2 sweep: 0 virhettä (sol, hint, sort/place-uniikit, whyAt ei osu oikeaan vastaukseen), tagit l-dl, l-ml, dl-ml, dl-l, l-cl, sense, match, transfer. Ruudut tarkistettu selaimessa.

**Kritiikki:** Aikamuunnosten oppitunti oli pelkkiä staattisia kortteja ("1 h = 60 min", "9.45 + 30 min = 10.15"); aika ei kulunut näytöllä lainkaan. Yhdessäkään tehtävässä ei ollut vihjettä eikä kohdennettua palautetta tyypilliseen virheeseen (tunnissa 100 min, 1,5 h = 1 h 50 min, vrk = 12 h). Siirtotehtävän toiseen väärään vaihtoehtoon ei ollut perustelua.
**Korjaus:** Uudet animaatiot: hoursScene (tuntikiekot täyttyvät 60 min kerrallaan, minuuttilaskuri kasvaa, osakiekko 15 min) ja clockScene (analoginen kello: minuuttiviisari kiertää matkan ajan reaaliajassa, kulunut sektori kasvaa, digitaalinäyttö vaihtaa tunnin tasatunnilla välähdyksen kera, loppuun ansa 13.90 yliviivattuna). Uusi place-peli `hhmm`: minuutit → h + min, houkuttimena desimaaliansa (90 min ≠ 1 h 50 min). Vihjeet ja whyAt kaikkiin tehtäviin (×100, unohtuneet minuutit, :100, vrk 12 h / 60), siirtotehtävään vihje ja perustelu molemmille vääriin.
**Validointi:** tsc puhdas, vitest 1589 passed | 1 skipped (families.ts: M-UNIT-05/hhmm incidental decimal). 300×2 sweep: 0 virhettä (sol, hint, choice-why, place-uniikit; duplikaatti 110 min / ansa korjattu). Kellon ja kiekkojen ruudut tarkistettu selaimessa (kesto 6,7–11,9 s).

**Kritiikki:** Reilun jaon demot olivat kaksi staattista piirakkakuvaa; "yhtä suuret osat" jäi väitteeksi ilman keinoa tarkistaa sitä. Laskutehtävän väärillä vastauksilla ei ollut perusteluja, eikä millään tehtävällä ollut vihjettä. Ei mikropeliä, jossa lapsi itse luokittelee jakoja.
**Korjaus:** Uusi fracanim.ts / cutScene: piirakka leikataan veitsellä viiva kerrallaan, palat irtoavat, ja jokainen pala nostetaan kiertäen ensimmäisen palan päälle vertailulautaselle; täsmälleen peittävä saa vihreän ✓, isompi/pienempi punaisen ✗, merkit kertyvät piirakan alle (8,8–10,9 s). Demot: reilu 4, epäreilu 4, reilu 3 (kolmasosa). Uusi sort-peli `sortfair` (piirakat ja levyt: reilu / ei reilu). Vihjeet kaikkiin, laskutehtävän väärille perustelut.
**Validointi:** tsc puhdas, vitest 1589 passed | 1 skipped; 300×2 sweep: 0 virhettä (sol, hint, choice-why, sort uniikit ja molemmat luokat), tagit equal, count, fair, sortfair, transfer. Ruudut tarkistettu (leikkaus, vertailu, ✗-merkit, loppuvirke).

**Kritiikki:** Murtoluvun nimeäminen opetettiin staattisella kuvalla ja sanallisella kaaviolla ("montako otettiin / moneenko osaan jaettu"); lapsi ei nähnyt, mistä luvut syntyvät. Tyypillinen virhe (alas värittämättömien määrä) mainittiin vain tehtävän palautteessa. Vihjeet puuttuivat, ja shade-tehtävän ensimmäisellä väärällä vaihtoehdolla ei ollut perustelua.
**Korjaus:** Uusi nameScene: kaikki osat lasketaan yksi kerrallaan (sininen korostus ja numero) ja määrä nousee nimittäjäksi, sitten väritettävät osat värjäytyvät yksi kerrallaan osoittajaksi; loppuun murtoluku sanoin (fracWords: "kaksi viidesosaa"). Demot: piirakka 2/5, levy 3/8, ansademo 1/4 (1/3 yliviivattuna). Uusi place-peli `build` (osoittaja/nimittäjä paikoilleen, värittämättömien määrä houkuttimena). Vihjeet kaikkiin, shade-perustelut molemmille vääriin.
**Validointi:** tsc puhdas, vitest 1589 passed | 1 skipped; 300×2 sweep: 0 virhettä (sol, hint, choice-why, vaihtoehdot uniikit, place-uniikit), tagit name, trap, shade, build, transfer. Ruudut tarkistettu (laskenta, 3/8, ansa).

**Kritiikki:** Nimittäjän merkitys (suurempi nimittäjä → pienempi pala) esitettiin kolmella rinnakkaisella staattisella piirakalla, osoittaja staattisella levyllä. Siirtotehtävän keskeinen ansa (3/8 + 2/8 = 5/16) jäi ilman havainnollistusta, ja sen toisella väärällä vaihtoehdolla ei ollut perustelua. Merkitystehtävän väärillä vastauksilla ei ollut perusteluja, vihjeet puuttuivat kaikista.
**Korjaus:** Uusi shrinkScene: sama piirakka leikataan 2 → 4 → 8 osaan, korostettu pala kutistuu silmissä ja kokomittari (1/2, 1/4, 1/8) kirjaa koon (10 s). Uusi eatTwoScene: Aava ja Loikka ottavat paloja vuorotellen, yhtälö 3/8 + 2/8 = 5/8 kootaan, nimittäjä korostetaan pysyvänä ja 5/16 yliviivataan (8,6 s). Uusi place-peli `order` (yksikkömurtoluvut suurimmasta pienimpään). Perustelut ja vihjeet kaikkiin.
**Validointi:** tsc puhdas, vitest 1589 passed | 1 skipped; 300×2 sweep: 0 virhettä (sol, hint, choice-why, vaihtoehdot uniikit), tagit meaning, unit, same, order, transfer. Ruudut tarkistettu (leikkausvaihe, mittarit, yhtälö ja ansa).

**Kritiikki:** Ainoa demo oli kaksi staattista piirakkaa ja kaava 3/8 < 5/8; vertailu ei tapahtunut näytöllä. Merkkitehtävän perustelu oli sama kaikille vääriille merkeille, järjestystehtävästä puuttuivat perustelut, ja vihjeet puuttuivat kaikista tehtävistä.
**Korjaus:** Uusi raceScene: kaksi samaan osiin jaettua levyä täyttyvät pala kerrallaan rinnakkain, lyhyempi pysähtyy ("valmis ✓"), ero merkitään hakasella ("2 palaa enemmän") ja merkki ilmestyy (7,2–8,5 s). Demot: 3/8 < 5/8, 5/6 > 2/6, 3/5 = 3/5. Uusi sort-peli `half` (alle / tasan / yli puolet, puolet = n/2 / n). Kohdennetut perustelut merkkitehtävään (= vs väärä suunta), järjestystehtävään perustelut, vihjeet kaikkiin.
**Validointi:** tsc puhdas, vitest 1589 passed | 1 skipped; 300×2 sweep: 0 virhettä (sol, hint, choice-why, sort uniikit ja ≥2 luokkaa), tagit pick, symbol, order, half, transfer. Ruudut tarkistettu (kilpa kesken, ero-hakanen, loppumerkki).

**Kritiikki:** Yhteenlaskun demo oli staattinen levy + kaava ja ansa (5/16) pelkkä kortti; palojen yhdistäminen ja palan koon pysyminen ei näkynyt. Puuttuvan osoittajan tehtävästä puuttuivat vihje ja virhepalaute, add-tehtävästä vihje, siirtotehtävästä vihje.
**Korjaus:** Uusi mergeScene: palat liukuvat kahdelta lautaselta yksi kerrallaan yhteiseen vatiin (kiertyen ja kasvaen oikeaan paikkaan), laskuri etenee, lopuksi kaava ja rinnalle 16-osainen ansapiirakka 5/16 ✗, joka on näkyvästi pienempi (10,7 s). Demot 2/8 + 3/8 ja 1/6 + 4/6. Uusi place-peli `sums` (summat oikeille paikoille, houkuttimena nimittäjät yhteen -ansa). Vihjeet ja whyAt (koko summa / valmis osa; ei osu oikeaan, kun a = b). Samalla korjattu kierrosten 106–109 whyAt-palautteet saari1.ts:ssä: ne olivat item-tasolla, jota moottori ei lue; nyt task.whyAt (wq-apufunktio).
**Validointi:** tsc puhdas, vitest 1589 passed | 1 skipped; 300×2 sweep: 0 virhettä (sol, hint, choice-why, place-uniikit, whyAt ei osu oikeaan). Koko sisältö (181 solmua) tarkistettu: ei item-tason whyAt-kenttiä. M-UNIT-02..05 whyAt nyt aktiivisia (254–522 tehtävää / 600). Ruudut tarkistettu.

**Kritiikki:** Demot olivat staattinen palkki + kortti; vähentäminen ei näkynyt tapahtumana. sub- ja siirtotehtävästä puuttui vihje, whole/picture/siirto ilman kohdennettuja virheselityksiä. Ei mikropeliä.
**Korjaus:** Uusi takeAwayScene (fracanim.ts): Loikka syö palat yksi kerrallaan kaarella suuhunsa, laskuri n/a pienenee, nimittäjä pysyy; lopuksi yliviivattu (a−b)/0-ansa. Whole-tila leikkaa kokonaisen ensin n palaan (1 = n/n). Kolme animoitua demoa (5/8−2/8, 1−3/8, 6/10−4/10). Uusi diffs-sijoittelupeli (3 erotusta + summaharhautus). Vihjeet kaikkiin, task.whyAt picture/whole/siirto (avaimet ehdollisia, ei osu oikeaan vastaukseen).
**Validointi:** tsc ok, vitest 1589/1 skip, 600 tehtävän pyyhkäisy 0 virhettä (5 tagia), ruutukaappaukset alku/lento/loppu/leikkaus tarkistettu.

**Kritiikki:** Yksi staattinen demo (kaksi nauhaa ja kaava); laajentamisen idea ("palat pienenevät, väri pysyy") ei näkynyt prosessina. Vihjeet puuttuivat kaikista, missing-tehtävästä virheselitykset, ei mikropeliä. Siirtotehtävän whyt yleisiä.
**Korjaus:** Uusi splitScene (fracanim.ts): veitsi kulkee nauhan läpi ja leikkaa jokaisen palan k osaan vaiheittain, ketju 1/2 = 2/4 = 4/8 kasvaa, hakasulje "väritetty osa ei muutu" pysyy paikallaan; lopuksi (a+1)/(b+1)-ansa omana nauhana katkoviivavertailulla. Kolme animoitua demoa. Uusi family-lajittelupeli (= / ≠ a/b, harhautuksina +k ja vain toisen luvun kertominen, duplikaatit suodatettu). Vihjeet kaikkiin, missing task.whyAt (lisäys- ja kertomatta-virheet), tarkennetut siirtowhyt.
**Validointi:** tsc ok, vitest 1589/1 skip, 600+600 pyyhkäisy 0 virhettä (sort-duplikaatti löytyi ja korjattiin), ruutukaappaukset leikkaus/ketju/ansa tarkistettu.

**Kritiikki:** Yksi staattinen demo (kaksi nauhaa). Supistaminen jäi kaavaksi: ei näkynyt, että palat yhdistetään ryhmiksi. Vihjeet puuttuivat kaikista, siirtotehtävän väärille vaihtoehdoille ei selityksiä, ei mikropeliä, ei monivaiheista supistusta eikä "vähennä 1" -virhettä kuvana.
**Korjaus:** Uusi joinScene (fracanim.ts): sinihakaset ryhmittelevät k palaa kerrallaan numeroiden laskien, sisäiset väliviivat haalistuvat, ketju 8/12 = 4/6 = 2/3 kasvaa vaiheittain, lopuksi (A−1)/(B−1)-ansanauha katkoviivavertailulla. Kolme animoitua demoa (6/8, kaksivaiheinen 8/12, 6/9 kolmella). Uusi reduce-sijoittelupeli (3 supistusta + arvoltaan erisuuri harhautus). Vihjeet kaikkiin, siirron whyt (enemmän/vähemmän).
**Validointi:** tsc ok, vitest 1589/1 skip, 600 pyyhkäisy 0 virhettä, ruutukaappaukset ryhmittely/kaksivaiheinen/ansa tarkistettu.

**Kritiikki:** Demot staattinen piirakkarivi + kortti "ei 6/15". Toistuva yhteenlasku ei näkynyt tapahtumana, eikä kokonaisiksi täyttyminen. repeat-tehtävän toiselta väärältä vaihtoehdolta puuttui why, vihjeet ja whyAt puuttuivat kaikista, ei mikropeliä.
**Korjaus:** Uusi factoryScene (fracanim.ts): palat lentävät piirakoista vateihin yksi kerrallaan, laskuri "k × a/b + r/b = m/b" päivittyy, täysi vati muuttuu vihreäksi "1 kokonainen", lopuksi yliviivattu na/nb-ansa. Kaksi animoitua demoa (3 × 2/5, 4 × 3/4 = 3 kokonaista). Uusi line-sijoittelupeli (3 kertolaskua + na/nb-harhautus, arvoltaan erilliset). wq-apuri saari2:een; hint + task.whyAt (n+a, a, b, palamäärä vs kokonaiset, vieraiden määrä).
**Validointi:** tsc ok, vitest 1589/1 skip, 600 pyyhkäisy 0 virhettä, ruutukaappaukset lento/lopputila/kolme kokonaista tarkistettu.

**Kritiikki:** Demot staattinen vaakakuva + kortti. Ratkaisuperiaate "sama molemmille puolille" ei näkynyt toimintona, eikä virhettä (vain toiselta puolelta) näytetty. Vihjeet ja virheselitykset puuttuivat kaikista, ei mikropeliä.
**Korjaus:** Uusi alganim.ts / bagScene: paino a+x vaihtuu painoiksi a ja x, a nostetaan ensin vain vasemmalta → vaaka kallistuu (✗) → palautus → nosto molemmilta → vaaka pysyy suorassa (✓), yhtälörivi päivittyy □ + a − a = a + x − a → □ = x, tarkistus. Kolme demoa (2 animoitua + kaavakortti). Uusi moves-lajittelupeli (siirrot: pysyy suorassa / kallistuu, 4 siirtoa joista molempia luokkia). Vihjeet + task.whyAt kaikkiin (lisätty eikä vähennetty, koko oikea puoli, vähennys kertolaskussa jne.).
**Validointi:** tsc ok, vitest 1589/1 skip, 600+600 pyyhkäisy 0 virhettä (2-kortin lajittelu löytyi ja korjattiin), ruutukaappaukset kallistus/molemmilta/lopputila tarkistettu.

**Kritiikki:** Staattinen vaakakuva + kortti "□ = 7, ei 12". Keskeinen väärinkäsitys ("= on vastaus tähän") kerrottiin, mutta sen seurausta ei näytetty. Truth-tehtävästä puuttui vihje, balance/siirto ilman virheselityksiä, ei mikropeliä.
**Korjaus:** Uusi equalsScene (alganim.ts): laatikkoon pudotetaan ensin a+b → vaaka kallistuu, punainen 12 ≠ 17 ✗; sitten laatikon luku kasvaa 1, 2, 3… ja palkki liikkuu askel askeleelta kohti tasapainoa, oikean puolen summa päivittyy, lopuksi ✓ ja a + b = x + c. Kaksi animoitua demoa. Uusi level-sijoittelupeli (3 tasapainotettavaa lautaa + "vastaus tähän" -harhautus). Vihjeet kaikkiin, task.whyAt both/balance/siirto.
**Validointi:** tsc ok, vitest 1589/1 skip, 600 pyyhkäisy 0 virhettä, ruutukaappaukset tyhjä/virhe/laskenta tarkistettu.

**Kritiikki:** Demot kaavakortti ja staattinen vaakakuva. Yhteys vaa'an ja yhtälön merkintöjen välillä ei rakentunut näkyvästi, eikä ratkaisun tarkistamista sijoittamalla näytetty. Vihjeet puuttuivat which/fromBalance/siirrosta, ei mikropeliä.
**Korjaus:** Uusi buildEqScene (alganim.ts): esineet laskeutuvat vaakaan yksi kerrallaan ja yhtälö kirjoittuu samassa tahdissa (pussi → x, paino → + a, suora vaaka → = summa). Sitten sijoitus: väärä arvaus x+1 (pussit vaihtuvat painoiksi, vaaka kallistuu, ≠ ja ✗), oikea x (suorassa, = ja ✓). Kaksi animoitua demoa. Uusi spot-lajittelupeli (yhtälö / ei: lauseke ilman =, lasku ilman x:ää, x oikealla, vähennys). Vihjeet kaikkiin.
**Validointi:** tsc ok, vitest 1589/1 skip, 600 pyyhkäisy 0 virhettä, ruutukaappaukset rakennus/väärä/oikea tarkistettu, ≠ korjattu väärään arvaukseen.

**Kritiikki:** Staattinen vaakakuva + kaksi korttia. "Kokeile ja tarkista" -strategia (arvauksen ohjaaminen tuloksen perusteella) ei näkynyt lainkaan, vain yksittäinen tarkistus. Which/balance ilman vihjettä, ei mikropeliä.
**Korjaus:** Uusi guessScene (alganim.ts): arvaukset laitetaan pussin paikalle vuorotellen, vaaka kallistuu sen mukaan (liian kevyt/painava), taulukko kirjaa x | x+a | ↑/↓/✓ selitteineen, yhtälörivi näyttää ≠/=. Kaksi animoitua demoa (3 ja 4 kokeilua). Uusi steer-lajittelupeli (liian pieni / ratkaisu / liian suuri). Vihjeet which/balance.
**Validointi:** tsc ok, vitest 1589/1 skip, 600 pyyhkäisy 0 virhettä, ruutukaappaukset (kallistussuunnat ja taulukko) tarkistettu.

**Kritiikki:** Kaksi kaavakorttia. Käänteislaskun idea ("kumoaa") jäi sanaksi, ei näkynyt suunnan kääntymisenä. Ei virheselityksiä (sama lasku uudelleen, väärä käänteinen), siirrosta puuttui vihje, ei mikropeliä.
**Korjaus:** Uusi machineScene (alganim.ts): □ kulkee koneen "+7" läpi ja tulee ulos 15:nä; kone kääntyy (leima kääntyy, väri ja nuoli vaihtuvat) muotoon "−7"; 15 kulkee takaisin ja tulee ulos 8:na; tarkistus eteenpäin ✓; lopuksi ansa "sama lasku ei kumoa itseään". Kaksi animoitua demoa (+ ja ×). Uusi undo-sijoittelupeli (kone → kumoava kortti, harhautuksena sama lasku). task.whyAt add/mul/sub/siirto, siirtoon vihje.
**Validointi:** tsc ok, vitest 1589/1 skip, 600 pyyhkäisy 0 virhettä, ruutukaappaukset eteen/kääntö/taakse tarkistettu.

**Kritiikki:** Demot olivat kaksi staattista korttia. Väline-tehtävästä puuttuivat väärien vastausten perustelut ja vihjeet, ja käyttötehtävä antoi tyhjät perustelut. Viivottimen nollakohtaa ja vaa'an nollausta ei näytetty tapahtumana, eikä lukemaa harjoiteltu lainkaan.
**Korjaus:** Uusi toolanim.ts:
- matchToolScene: asiat yhdistetään välineisiin viiva kerrallaan, ja suure ilmestyy asian alle.
- zeroScene: keppi on ensin viivottimen reunassa, jolloin lukema 5.7 cm? on väärin ✗. Sitten keppi liukuu nollaan ja lukema on 7 cm ✓.
- tareScene: tyhjä vaaka näyttää 50 g, ja kivi näyttää 350 g ✗. Vaaka nollataan, ja kivi näyttää 300 g ✓.

Uudet tehtävät:
- read: kepin pituus, kun keppi ei ala nollasta. Virhe-perustelut sille, että lukee vain loppukohdan tai laskee viivat.
- tare: punnitus, kun tyhjä vaaka ei näytä nollaa. Virhe-perustelut vaa'an lukemalle ja virheen lisäämiselle.
- pick: lajittelupeli, jossa asiat jaetaan suureen mukaan pituuteen, massaan ja lämpötilaan.

Lisäksi kaikkiin väärien vastausten vaihtoehtoihin tuli perustelut ja kaikkiin tehtäviin vihjeet.
**Validointi:** tsc ok, vitest 1589 ok. Selainajo 300×2: 0 virhettä, ja kaikki 6 tehtävätyyppiä esiintyvät. Kuvakaappauksissa yhdistämiskohtauksen järjestysvirhe korjattiin (järjestys ei ollut permutaatio).

**Kritiikki:** Palkintoteksti lupasi "nollakohta ja asteikko hallussa", mutta asteikon lukemista ei harjoiteltu ollenkaan. Demoissa oli vain staattinen kortti ja taulukko. toolUnit- ja unit-tehtävistä puuttuivat väärien vastausten perustelut, eikä vihjeitä ollut.
**Korjaus:** toolanim.ts sai kolme uutta kohtausta:
- unitFitScene: samalle asialle kokeillaan ensin hankala yksikkö ✗ ja sitten kätevä ✓ (muurahainen, loikka, matka saarelle).
- repeatScene: kivi mitataan kolmesti. Toisessa mittauksessa osoitin ei osu kiven päähän ✗. Poikkeava lukema yliviivataan, ja uusi mittaus antaa oikean tuloksen ✓.
- readScaleScene: lämpömittarissa ensin etsitään lähin numero, sitten pienet välit lasketaan laskurin avulla (+k).

Uudet tehtävät:
- scale: lämpömittarin lukeminen, jossa numerot ovat vain viiden asteen välein. Virhe-perustelut lähimmän numeron lukemiselle, liian ylös lukemiselle ja kahden asteen välien laskemiselle.
- fit: sijoittelupeli, jossa asiat yhdistetään sopivaan yksikköön ja yksi houkutusyksikkö jää yli.

Lisäksi kaikkiin väärien vastausten vaihtoehtoihin tuli perustelut ja kaikkiin tehtäviin vihjeet.
**Validointi:** tsc ok, vitest 1589 ok. Selainajo 300×2: 0 virhettä, ja kaikki 6 tehtävätyyppiä esiintyvät. Kuvakaappausten jälkeen korjattiin leikkautuneet emojit ja päällekkäiset +1-merkinnät.

**Kritiikki:** Demoissa oli vain kaksi staattista viivakuvaa ja kortti "aihe → kysymys → viivat". Havaintojen keräämistä ei näytetty tapahtumana. most-tehtävästä puuttuivat väärien vastausten perustelut ja vihje. Tally-tehtävän kahden väärän vaihtoehdon perustelut olivat samat. Kirjaamista ei harjoiteltu.
**Korjaus:** Uusi dataanim.ts ja siinä tallyScene:
- havainnot saapuvat yksi kerrallaan ja lentävät omalle rivilleen;
- viiva piirtyy vähitellen, ja viides viiva vedetään vinoon ("5!");
- lopuksi jokainen rivi lasketaan viisiryhmittäin (5, 10, …, yhteensä), ja "Eniten" näytetään.

Demot: eläinhavainnot sekä luokkakysely "Mikä on lempihedelmäsi?".

Uudet tehtävät:
- log: tutkija näkee eläinjonon ja kirjaa vain kysytyn eläimen. Virhe-perustelut kaikkien eläinten laskemiselle ja väärän eläimen laskemiselle.
- sort: lajittelupeli, jossa viivakuvat jaetaan ryhmiin "alle 10" ja "10 tai yli".

Lisäksi:
- most-tehtävään tuli perustelut ja vihje.
- Tally-tehtävän väärien vaihtoehtojen perustelut eroteltiin.
- Kaikkiin tehtäviin tuli vihjeet.
**Validointi:** tsc ok, vitest 1589 ok. Selainajo 300×2: 0 virhettä, ja kaikki 6 tehtävätyyppiä esiintyvät. Kuvakaappaukset tarkistettiin: keruu, viisiryhmä, laskenta ja lopputilanne.

**Kritiikki:** Lopputuloksen vaatima taito ("korjaat virheet") puuttui demoista kokonaan. Ainoa demo oli staattinen tallyArt(7). pick-, count- ja add-tehtävistä puuttuivat vihjeet. count-tehtävän väärille vaihtoehdoille oli vain yksi perustelu, add-tehtävälle ei yhtään. Interaktiivinen record-peli oli hyvä.
**Korjaus:**
- Demo 1: elävä tallyScene, jossa sorsat ja sammakot lentävät riveilleen, viides viiva vedetään vinoon ja lopuksi viivat lasketaan.
- Demo 2: uusi checkTallyScene. Osoitin käy havainnot läpi, ja jokainen sorsa yhdistetään omaan viivaansa. Yhdeltä sorsalta puuttuu viiva ("ei viivaa! ✗"), ja puuttuva viiva piirretään ("Korjattu: 6 viivaa = 6 havaintoa ✓").
- Uusi fix-peli: eläinjono ja kahden rivin viivataulukko. Valitaan rivi, jolta viiva puuttuu, ja väärästä valinnasta kerrotaan, miksi rivi täsmää.
- Väärien vastausten perustelut täydennettiin count- ja add-tehtäviin, ja kaikkiin tehtäviin tuli vihjeet.
**Validointi:** tsc ok, vitest 1589 ok. Selainajo 300×2: 0 virhettä, ja kaikki 6 tehtävätyyppiä esiintyvät. Tarkistusanimaation kuvakaappaukset käytiin läpi viidestä hetkestä.

**Kritiikki:** Ainoa demo oli staattinen taulukko, jossa vastaus oli lihavoitu. Rivin ja sarakkeen risteystä ei näytetty tapahtumana. read-tehtävän kahden väärän vaihtoehdon perustelut olivat identtiset ("toisella rivillä"). fewest-tehtävästä puuttuivat väärien vastausten perustelut, eikä read-, fewest- tai transfer-tehtävissä ollut vihjeitä. Transfer-tehtävässä ei ollut whyAt-palautetta.
**Korjaus:**
- Uusi tableReadScene: kysymys näkyy, rivi syttyy sinisenä, sarake keltaisena, ja risteyksen luku ponnahtaa vihreänä. Kolme kysymystä 3×3-taulukossa ja toinen demo, jossa sama rivi ja eri sarake antavat eri luvun.
- Uusi cells-sijoittelupeli: 2×2-taulukosta vedetään luvut kolmeen rivi+sarake-kysymykseen, ja yksi luku jää yli.
- read-tehtävän perustelut nimeävät nyt rivin. fewest-tehtävään tuli perustelut ja vihje.
- Transfer: wq ja whyAt sille, että laskee toisen rivin summan tai ottaa vain toisen päivän luvun.
**Validointi:** tsc ok, vitest 1589 ok. Selainajo 300×2: 0 virhettä, ja kaikki 5 tehtävätyyppiä esiintyvät. Kuvakaappaukset tarkistettiin (rivi, sarake, osuma, lopputila).

**Kritiikki:** Ainoa demo oli staattinen taulukko. Lopputulos "vertailet niiden lukuja" jäi ilman havainnollistusta: suurinta lukua ja erotusta ei näytetty. cell-tehtävässä rivien arvot saattoivat toistua, ja kahden väärän vaihtoehdon perustelut olivat samat. diff-tehtävästä puuttuivat vihje ja whyAt. most-, cell- ja transfer-tehtävistä puuttuivat vihjeet.
**Korjaus:**
- Demo 1: tableReadScene yhden sarakkeen taulukolla (lokki, kala).
- Demo 2: uusi compareBarsScene. Taulukon luvut kasvavat palkeiksi, pisin palkki korostuu ("eniten"), ja kahden rivin vertailussa lyhyemmän palkin pää merkitään katkoviivalla. Ylijäävä keltainen pala on erotus (7 − 4 = 3).
- Uusi rank-sijoittelupeli: eläimet järjestetään paikoille eniten, 2. ja vähiten.
- cell: arvot ovat nyt erisuuria, ja perustelut nimeävät rivin.
- diff: whyAt yhteenlaskulle ja sille, että ottaa vain isomman luvun; lisäksi vihje.
- Kaikkiin tehtäviin tuli vihjeet.
**Validointi:** tsc ok, vitest 1589 ok. Selainajo 300×2: 0 virhettä, ja kaikki 5 tehtävätyyppiä esiintyvät. Kuvakaappaukset tarkistettiin (palkit, eniten, katkoviiva, erotus).

**Kritiikki:** Ainoa demo oli staattinen valmis taulukko, joten taulukon tekemisen vaiheita ei näytetty. Sijoittelupeleistä (fromTally, fromList, transfer) puuttuivat paikkakohtaiset perustelut. fromTally-, header- ja transfer-tehtävistä puuttuivat vihjeet. Summatarkistusta ("mitään ei jäänyt pois") ei opetettu.
**Korjaus:**
- Uusi buildTableScene: ensin piirtyvät otsikot Eläin ja Määrä, sitten rivit eläin kerrallaan. Havainnot lentävät jonosta omalle rivilleen, ja määrä kasvaa. Lopuksi summarivi 5 + 3 + 2 = 10 ja tarkistus "10 havaintoa ✓".
- Vanha staattinen demo säilyi toisena demona, joka näyttää viivat → luku.
- Uusi total-tehtävä: puuttuva rivi lasketaan kokonaismäärästä. whyAt kokonaismäärälle ja tunnettujen rivien summalle (ehdollinen).
- Kaikkiin sijoittelupeleihin tuli paikkakohtaiset perustelut, ja kaikkiin tehtäviin vihjeet.
**Validointi:** tsc ok, vitest 1589 ok. Selainajo 300×2: 0 virhettä, ja kaikki 5 tehtävätyyppiä esiintyvät. Kuvakaappauksen jälkeen leikkautunut loppuviesti lyhennettiin.

**Kritiikki:** Kumpikin demo oli staattinen tekstikortti. Keskeistä ideaa, että eri pituinen laskenta tuottaa eri luvun saman ilmiön mittaamisesta, ei näytetty, vaan se vain todettiin. Mikään tehtävä ei sisältänyt vihjettä. Vaiheiden järjestys oli pelkkä monivalinta.
**Korjaus:**
- fairCountScene: kaksi laskentaa, joissa linnut käyvät yhtä tiheään. 5 min antaa 2 lintua ja 60 min 24 lintua: kellot pyörivät ja linnut ilmestyvät. Johtopäätös "Tiistaina enemmän? ✗ Ei voi tietää". Sitten molemmat laskennat kestävät 10 min (4 ja 5 lintua): "nyt voi verrata ✓".
- stepsScene: ensin väärä järjestys (taulukko → keruu → kysymys) yliviivataan, sitten vaiheet kysymys → suunnitelma → keruu → taulukko syttyvät nuolineen.
- Uusi steps-sijoittelupeli: neljä vaihetta vedetään järjestykseen, ja jokaiseen paikkaan on perustelu.
- Uusi compare-tehtävä: eri pituisten laskentojen tuloksista ei voi päätellä mitään. Väärille vastauksille on perustelut.
- Kaikkiin tehtäviin tuli vihjeet.
**Validointi:** tsc ok, vitest 1589 ok. Selainajo 300×2: 0 virhettä, ja kaikki 6 tehtävätyyppiä esiintyvät. Kuvakaappausten jälkeen korjattiin täyden kellon katoava sektori, paneelin yli valuneet linnut ja päällekkäiset vaihetekstit.

**Kritiikki:** Ainoa demo oli staattinen lista ja valmis taulukko vierekkäin. Ei näkynyt, miten yksittäinen merkintä löytää paikkansa rivin ja sarakkeen risteyksestä. Mikään tehtävä ei sisältänyt vihjettä. cell-tehtävästä puuttui whyAt, eikä taulukkoa harjoiteltu itse täyttämällä.
**Korjaus:**
- Uusi twoWayScene: merkinnät ("ma 🦆" ja muut) ovat jonossa. Kunkin kohdalla rivi syttyy sinisenä ja sarake keltaisena, merkintä lentää risteysruutuun ja ruudun luku kasvaa. Lopuksi tarkistus "8 merkintää ✓".
- Uusi fill-sijoittelupeli: 2×2-taulukon neljä ruutua täytetään listan perusteella, ja yksi houkutusluku jää yli.
- cell: wq ja whyAt sille, että laskee eläimen molemmilta päiviltä tai toiselta päivältä (molemmat ehdollisia).
- Kaikkiin tehtäviin tuli vihjeet.
**Validointi:** tsc ok, vitest 1589 ok. Selainajo 300×2: 0 virhettä, ja kaikki 5 tehtävätyyppiä esiintyvät. Kuvakaappaukset tarkistettiin: alku, kesken (korostus) ja lopputila.

**Kritiikki:** Demot olivat kaksi staattista tekstikorttia ("2 × 3 = 6", "12, 13 / 21, 23 / 31, 32"). Ne eivät näyttäneet, miksi järjestelmällisyys on tarpeen, eivätkä sitä, miten lista rakentuu. Digits-tehtävän väärien vaihtoehtojen perustelut olivat samat kahdesti, ja täyteluvuilla ei ollut perustelua. System-tehtävästä puuttui vihje. Outfits- ja kättelytehtävissä ei ollut virhekohtaista palautetta.
**Korjaus:** Neljä reaaliaikaista animaatiota.
1. guessOutfitsScene: sattumanvarainen arvonta, jossa toistuva asu yliviivataan ("jo on!") ja puuttuvat asut näkyvät lopuksi ?-paikkoina.
2. systemOutfitsScene: hattu pysyy (📌), huivit vaihtuvat, rivit karttuvat ja lopuksi 2 × 3 = 6.
3. digitTreeScene: numeropuu, jossa sama numero yliviivataan ja luvut kasvavat listaksi.
4. handshakeScene: kättelyviivat piirtyvät henkilö kerrallaan, ja juokseva summa 3 + 2 + 1 = 6 kertyy.

Tehtävien korjaukset:
- digits: kolme eri väärää vaihtoehtoa omin perusteluin (tupla, jo listassa, vieras numero) ja vihje.
- system: vihje.
- outfits: whyAt summalle ja paitojen määrälle.
- Kättelyt: whyAt tuplalaskennalle ja ensimmäisen kättelyille.
- Uusi lajittelupeli valid: Kelpaa / Ei kelpaa (tupla tai vieras numero), jokaiselle perustelu.
**Validointi:** tsc puhdas, vitest 1589 läpi. Selaimessa 600 tehtävää (300 siementä × 2 vaihetta), 0 virhettä; kaikki 6 tagia esiintyivät. Kaikkien neljän animaation väli- ja loppukuvat tarkistettiin kuvakaappauksista, ja kättelykuvan teksti siirrettiin irti solmuista.

**Kritiikki:** Demossa oli kaksi staattista korttia ("massa = 0,4 kg", "väri = vihreä ✗"). Mittaamista ei näkynyt lainkaan, eikä sitä, miksi väri ei ole suure. Pick-tehtävässä molemmilla väärillä vaihtoehdoilla oli sama perustelu. Tool-tehtävästä puuttuivat perustelut kokonaan, eikä yhdessäkään tehtävässä ollut vihjettä. Tavoite (goal) puuttui, ja mikropeliä ei ollut.
**Korjaus:** Uusi phyanim.ts ja kolme animaatiota.
- measureScene('massa', 0,4): sammakko hyppää vaa'alle, näyttö asettuu, ja tulos kootaan osina, kukin omalla värillään (suure / lukuarvo / yksikkö).
- measureScene('aika', 3): sekuntikello käy oikeassa ajassa 3 s, kun sammakko loikkii.
- notQtyScene: jokainen mittari kokeilee väriä, saa "? ✗", ja lopuksi näkyy "ei lukua, ei yksikköä → ei suure".

Tehtäviin lisättiin vihjeet ja kohdekohtaiset perustelut. Uusi lajittelupeli "Suure / Ei suure" (3 suuretta ja 2 ominaisuutta), jokaiselle perustelu. Lisäksi goal.
**Validointi:** tsc puhdas, vitest 1589 läpi, ja 600 tehtävän selainajo ilman virheitä (5 tagia). Kaikista mittaustyypeistä (massa, aika, pituus, lämpötila) tarkistettiin väli- ja loppukuvat. Lämpömittari siirrettiin veteen ja lukema ruudun sisään; osien nimet eivät enää mene päällekkäin.

**Kritiikki:** Ainoa demo oli staattinen kortti "2,5 kg / lukuarvo = 2,5". Desimaaliloukku (12 vs 12,5) näkyi vasta siirtotehtävässä, eikä sitä opetettu. Tehtävissä oli kaksi valintamallia; vihjeitä ei ollut eikä mikropeliä. Perustelut olivat geneerisiä ("Tämä on yksikkö."). Goal puuttui.
**Korjaus:**
- Demo 1: measureScene('massa', 2,5, 'n'). Vaaka punnitsee, ja lukuarvo korostuu.
- Demo 2: uusi partsScene. Merkintä s = 12,5 km puretaan osiin (tunnus / lukuarvo / yksikkö). Ensin kokeillaan pelkkää "12" (yliviivataan), sitten näytetään "koko 12,5 ✓".
- Uusi type-tehtävä: lukuarvo kirjoitetaan itse; kokonaisosalle on whyAt.
- Uusi lajittelupeli: kahden tuloksen palat luokkiin Lukuarvo / Muu osa, jokaiselle perustelu.
- Vihjeet ja yksilöidyt perustelut kaikkiin tehtäviin. Goal lisätty.
**Validointi:** tsc puhdas ja vitest 1589 läpi. Selainajo 600 tehtävällä: 0 virhettä, 5 tagia. partsScene-ruudut (osat, loukku, oikea, fokus) ja mittauksen loppukuva tarkistettiin kuvakaappauksista.

**Kritiikki:** Ainoa demo oli staattinen kortti "5 m ≠ 5 cm". Kokoeroa ei nähnyt. Fit-tehtävässä ei ollut perusteluja, eikä yhdessäkään tehtävässä vihjettä. Mikropeli ja goal puuttuivat.
**Korjaus:**
- unitSizeScene piirtää mittakaavassa ensin 5 cm:n pätkän ja sitten 5 m metri kerrallaan. Lopuksi näkyy "5 m ≠ 5 cm" ja kerroin 100.
- partsScene (t = 40 s, fokus yksikössä).
- Uusi täydennyspeli fill: tuloksista puuttuu yksikkö (pöytä 120 ▢, sammakko 0,4 ▢ jne.), ja yksi harhautusyksikkö. Jokaisella paikalla on perustelu, esimerkiksi "120 m olisi jalkapallokenttää pidempi".
- Kaikkiin tehtäviin lisättiin yksilöidyt perustelut ja vihjeet sekä goal.
**Validointi:** tsc puhdas ja vitest 1589 läpi. Selainajo 600 tehtävällä: 0 virhettä, 4 tagia, ei päällekkäisiä paloja. Animaatioiden välivaiheet ja loppukuvat tarkistettiin.

**Kritiikki:** Demo oli yksi staattinen kortti ("massa = 4 kg"). Sijoittelupelissä vain yksikkö-paikalla oli perustelu. Which-tehtävän perustelut olivat geneerisiä ("Tämä on suure."), eikä vihjeitä ollut. Tunnuksen ja suureen eroa, tai kaksiosaista yksikköä (m/s), ei näytetty. Goal puuttui.
**Korjaus:**
- Demo 1: measureScene('lämpötila', 18). Mittari laskeutuu veteen, pylväs nousee ja tulos kootaan osina.
- Demo 2: partsScene "nopeus v = 6 m/s", jossa suure, tunnus, lukuarvo ja yksikkö kehystetään vuorotellen. Leveät merkinnät skaalautuvat ruutuun.
- Sijoittelupeleissä perustelut kaikille paikoille.
- Which-tehtävän perustelut kertovat osan tehtävän (mitä / kuinka paljon / mihin verrattiin).
- Uusi whole-tehtävä: mikä tulos on kirjoitettu kokonaan ja oikein? Väärät vaihtoehdot ovat puuttuva yksikkö, puuttuva lukuarvo ja väärä yksikkö.
- Vihjeet kaikkiin tehtäviin. Goal lisätty.
**Validointi:** tsc puhdas ja vitest 1589 läpi. Selainajo 600 tehtävällä: 0 virhettä, 4 tagia. Viisiosainen merkintä tarkistettiin kuvakaappauksesta skaalauksen jälkeen.

**Kritiikki:** Demossa oli kaksi staattista laskukorttia. Sitä, miksi isosta pieneen kerrotaan ja pienestä isoon jaetaan, ei näytetty, eikä desimaalijäännöstä (250 cm → 2,5 m) havainnollistettu. Numeerisista tehtävistä puuttuivat vihjeet ja virhekohtainen palaute (väärä suunta, 100 vs 60). Siirtotehtävässä ei ollut perusteluja. Mikropeli ja goal puuttuivat.
**Korjaus:**
- convScene, kolme demoa:
  - 3 km: jokainen kilometri avautuu 1000 metriksi, ja laskuri kasvaa.
  - 250 cm: niputetaan sadan sentin metreiksi, ja jäännös 50 cm = 0,5 m.
  - 3 min = 180 s: minuutissa on 60 sekuntia, ei 100.
- wq-apuri: vihje ja whyAt jokaiseen numeeriseen tehtävään (väärä suunta, kerroin 100/10/1000, yhteenlasku, puuttuva desimaaliosa). Vastauksen kanssa törmäävät avaimet suodatetaan pois.
- Uusi match-sijoittelupeli: kolme määrää ja niiden vastineet sekä houkutteleva harhautus (esim. 300 m). Jokaiselle paikalle perustelu.
- Siirtotehtävään perustelut ja vihje. Goal lisätty.
- families.ts: match-tagin rivi, koska testi sitä vaatii.
**Validointi:** tsc puhdas ja vitest 1589 läpi. Selainajo 600 tehtävällä: 0 virhettä, 6 tagia, ei whyAt-osumia vastauksen toleranssissa. Kolmen muunnoksen loppukuvat ja välivaiheet tarkistettiin, ja otsikkorivien väli korjattiin.

**Kritiikki:** Demo oli staattinen kortti (kolme muunnosta tekstinä). Pilkun siirtyminen ja sen suunta jäivät näyttämättä. Tehtävissä ei ollut vihjeitä eikä virhepalautetta (yksi askel liian vähän, väärä suunta), ja valintatehtävän "Yhtä pitkät" oli ilman perustelua.
**Korjaus:** Uusi stairScene: yksikköportaat km–mm. Sammakko hyppii portaita reaaliajassa, jokainen hyppy näyttää ·10 tai :10. Numerot pysyvät soluissaan ja punainen pilkku liukuu solusta toiseen; tarvittavat nollat ilmestyvät vihreinä ja turhat loppunollat häviävät. Demoissa on kolme muunnosta: 1,25 m → cm, 450 mm → m ja 2,3 km → m. Neljään numeeriseen tehtävään tuli porrasvihje ja whyAt kolmelle tyypilliselle virheelle. Uusi Porraspeli (place) yhdistää muunnoksen kertoimeen, ja mukana on houkutin. Siirtotehtävä sai kaikki perustelut ja vihjeen. Lisäksi goal ja rev.
**Validointi:** tsc puhdas; vitest 1589 läpi; 600 tehtävän ajossa 0 virhettä; kuvakaappauksista tarkistettu alku-, väli- ja loppuruudut neljästä muunnoksesta.

**Kritiikki:** Demo oli staattinen kortti ("vene → Aava: paikallaan"). Liikkeen suhteellisuus jäi pelkäksi väitteeksi, eikä sitä nähnyt. Valintatehtävissä ei ollut perusteluja eikä vihjeitä, ja kaikki tehtävät olivat samaa kyllä/ei-muotoa.
**Korjaus:** Uusi refScene, reaaliaikainen kahden kamerakulman kohtaus. Ensin kuvataan rannalta: vene liukuu ja punainen etäisyysmerkki 🐸 → 🌳 kasvaa, kun taas vihreä 🐸 → masto pysyy 4 metrissä. Lyhyen häivytyksen jälkeen kuvataan veneestä: Loikka pysyy paikallaan ja ranta liukuu taaksepäin. Twin-versiossa kaksi venettä ajaa rinnakkain, ja väli pysyy 5 metrissä. Kaikkiin vääriin valintoihin tuli etäisyysperuste ja jokaiseen tehtävään vihje. Uusi lajittelupeli on "Liikkuu / Paikallaan", jossa kohde ja vertailukohta vaihtelevat. Lisäksi goal ja rev.
**Validointi:** tsc puhdas; vitest 1589 läpi; 600 tehtävän ajossa 0 virhettä; kahdeksan ruutua tarkistettu kuvakaappauksista (merkit korjattu, ettei teksti mene päällekkäin).

**Kritiikki:** Demo oli staattinen kortti ("matka s: 12 m, aika t: 4 s"), joten mittaamista ei nähnyt. Monivalinnoissa (matkat/ajat) ei ollut virhepalautetta eikä vihjeitä, ja välinetehtävän harhautuksilla ei ollut perusteluja. Mikään tehtävä ei vaatinut lukemaan matkaa tai aikaa itse mittauksesta.
**Korjaus:** Uusi raceScene: sammakko loikkii radan, mittanauha kulkee mukana (matka) ja sekuntikello käy oikeita sekunteja ja pysähtyy maalissa (aika). Toisessa demossa kaksi sammakkoa: pidempi aika ei tarkoita pidempää matkaa. Uusi mikropeli "Katso kisa": animaatiosta luetaan matka nauhasta tai aika kellosta (lukema piilotetaan lopussa, ja kisan voi katsoa uudelleen); whyAt tunnistaa, jos vastaukseksi annetaan väärä suure. Monivalinnat saivat perustelun jokaiselle vaihtoehdolle ja vihjeen. Välinetehtävä ja siirtotehtävä saivat perustelut ja vihjeet. Lisäksi goal ja rev.
**Validointi:** tsc puhdas; vitest 1589 läpi (families-testin vuoksi vältetty sanamuoto "Kello + sana"); 600 tehtävän ajossa 0 virhettä; kahdeksan ruutua tarkistettu kuvakaappauksista.

**Kritiikki:** Demoissa oli kaksi staattista korttia ("A: 20 m, 4 s → A nopeampi" ja "v = s / t"), joten nopeutta ei nähnyt liikkeenä. Vertailutehtävissä ei ollut perusteluja (why-taulukko oli tyhjä) eikä vihjeitä, ja kaikki tehtävät olivat samaa A/B-muotoa.
**Korjaus:** Demoissa ja tehtävissä hyödynnetään raceScene-kisaa: sama matka eri ajoissa ja sama aika eri matkoilla, kaksi sammakkoa ja kaksi oikeassa ajassa käyvää kelloa. Uusi perSecondScene leimaa joka täyden sekunnin kohdalle samanmittaisen palan ("5 m", 1. s, 2. s …), joten nopeus nähdään metreinä joka sekunti: v = 5 m/s. Jokaiselle väärälle vaihtoehdolle tuli tilannekohtainen perustelu (enemmän aikaa samaan matkaan / lyhyempi matka samassa ajassa / metrit sekunnissa) ja jokaiselle tilalle vihje. Kisatehtävät näyttävät animaation. Uusi mikropeli on järjestyspeli (place): kolme sammakkoa nopeimmasta hitaimpaan, ja pisin matka ei aina ole nopein. Lisäksi goal ja rev.
**Validointi:** tsc puhdas; vitest 1589 läpi; 600 tehtävän ajossa 0 virhettä; perSecondScene tarkistettu kuvakaappauksista (alku, keskivaihe ja loppu, 20 m/4 s ja 18 m/6 s).

**Kritiikki:** Demo oli yksi staattinen kaavakortti. Keskinopeus ja tauon merkitys (siirtotehtävän ydin) puuttuivat demosta kokonaan. Tehtävissä ei ollut vihjeitä eikä virhepalautetta (kertominen, jakaminen väärin päin, tauon unohtaminen).
**Korjaus:** Demo 1 käyttää perSecondScene-kohtausta: 12 m / 4 s, ja joka sekunti leimautuu 3 metrin pala. Uusi avgScene: ylempi sammakko loikkii ja pitää sitten tauon (matka ei kasva, mutta kello käy), alempi haamusammakko kulkee tasaisesti keskinopeudella, ja molemmat ovat maalissa yhtä aikaa. Siirtotehtävään tuli sama animaatio ilman vastausta (reveal=false). whyAt kattaa kertomisen, yhteen- ja vähennyslaskun, käänteisen jaon, koko matkan ja tauon unohtamisen. Uusi mikropeli: Sijoita kaavaan (place) matka, aika ja nopeus sekä houkutin s·t. Lisäksi vihjeet, goal ja rev.
**Validointi:** tsc puhdas; vitest 1589 läpi; 600 tehtävän ajossa 0 virhettä; avgScene tarkistettu kuvakaappauksista (m/s- ja km/h-versio, tauko ja loppu). Siirtotehtävän animaatiosta piilotettiin vastaus, joka näkyi validoinnissa.

**Kritiikki:** Demo oli yksi staattinen kortti ("s / t → m / s"). Ei näkynyt, että luvut ja yksiköt jaetaan rinnakkain, eikä kerrottu, miten "m/s" luetaan. Vihjeet puuttuivat, ja kaikki tehtävät olivat saman "valitse yksikkö" -muotoisia.
**Korjaus:** Uusi unitBuildScene: murtoluku "12 m / 4 s" hajoaa niin, että luvut lentävät omaan sarakkeeseensa (12/4 = 3) ja yksiköt kaarta pitkin omaansa (m/s). Lopuksi ne yhdistyvät laatikoksi "v = 3 m/s" ja tulee lukutapa "3 metriä joka sekunti". Demoja on kolme: m/s, km/h ja cm/min. Uudet tehtävät: "Mitä tarkoittaa 5 km/h?" (väärin päin luettu ja kahdeksi määräksi luettu vaihtoehto perusteluineen) ja Yksikkötehdas (place, mukana houkutin). Kaikille tehtäville vihje; perustelut tarkennettu. Lisäksi goal ja rev.
**Validointi:** tsc puhdas; vitest 1589 läpi; 600 tehtävän ajossa 0 virhettä; kuvakaappauksista tarkistettu lennon välivaiheet (yksiköt kiertävät lukusarakkeen) ja loppuruutu kahdella yksikköparilla.

**Kritiikki:** Demo oli staattinen kaavakortti. Ei näkynyt, miksi matka saadaan kertomalla ja aika jakamalla. Vihjeet ja virhepalaute puuttuivat, ja desimaalivastaus (2,5 h) jäi ilman tukea.
**Korjaus:** perSecondScene sai tilat 's' ja 't'. Matkatilassa 3 metrin paloja kertyy viisi, 5 · 3 = 15 m. Aikatilassa kello käy, kunnes 16 metriin on mahtunut neljä 4 metrin palaa. Uusi triangleScene: kaavakolmiossa käsi peittää vuorollaan s:n, t:n ja v:n, ja kaava syttyy. whyAt kattaa yhteenlaskun, jakamisen kertomisen sijaan, väärin päin jakamisen ja katkaistun desimaalivastauksen (2 tai 3 h). Uusi lajittelupeli "Kerro vai jaa?" Kaikille tehtäville vihje, lisäksi goal ja rev.
**Validointi:** tsc puhdas; vitest 1589 läpi; 600 tehtävän ajossa 0 virhettä; kuvakaappauksista tarkistettu s- ja t-tilan loppuruudut sekä kolmion neljä vaihetta.

**Kritiikki:** Demo oli yksi staattinen kortti. Kerroin 3,6 esitettiin ulkoa opeteltavana sääntönä ilman perustelua. Numeerisissa tehtävissä ei ollut virhekohtaista palautetta eikä vihjeitä, ja vertailutehtävästä puuttuivat perustelut. Ei mikropeliä.
**Korjaus:** Neljä animoitua demoa: convScene km→m, convScene min→s, unitBuildScene 1200 m / 240 s, ja uusi hourScene. hourScenessä Loikka kulkee 1 m/s ja kello kelataan tuntiin (3600 s → 3600 m = 3,6 km). Lisäksi whyAt tyypillisiin virheisiin (minuutit muuntamatta, 100 s/min, km muuntamatta, kerrottiin 3,6:lla). Uusi `ready`-lajittelupeli ("Valmis: jaa heti" / "Muunna ensin"). Siirtotehtävään perustelut kaikille vaihtoehdoille ja vihje. Mukana myös goal ja rev.
**Validointi:** tsc ok, vitest 1589 ok. Sweep 1200 tehtävää, 0 virhettä. hourScene tarkistettiin kuvakaappauksilla (päällekkäisyys korjattu).

**Kritiikki:** Kaksi staattista korttia. Väärinkäsitys "kirjain on esine" sanottiin, mutta sitä ei näytetty. Numeerisissa tehtävissä ei ollut virhekohtaista palautetta eikä vihjeitä. Ei mikropeliä.
**Korjaus:** Kolme animoitua demoa:
- guessScene: x + 5 = 12 ratkaistaan kokeilemalla ja tarkistamalla vaa'alla;
- uusi priceTagScene: "a = omena?" yliviivataan, hintalaput kääntyvät a € → 3 €, ja summa kertyy, jolloin 3a = 3·2;
- bagScene: pussin paino ratkaistaan tasapainolla.

Lisäksi:
- uusi `tags`-tehtävä animaation kanssa (ka, kun a tunnetaan), whyAt "34-virheelle" (peräkkäin kirjoitus) ja yhteenlaskulle;
- uusi `sort`-mikropeli: "kirjain on luku / esine tai sana" (esim. t = tunti on väärin);
- whyAt solve- ja bags-tehtäviin, vihjeet kaikkiin;
- goal ja rev.

**Validointi:**
- tsc ok, vitest ok;
- sweep: 1200 tehtävää, 0 virhettä;
- priceTagScene tarkistettiin kuvakaappauksilla.

**Kritiikki:** Ainoa demo oli staattinen taulukko, joten muuttumista ei nähty tapahtuvan. Vihjeitä ja virhepalautetta ei ollut. Ei mikropeliä.

**Korjaus:**
- Uusi varyScene-animaatio. n kasvaa askel kerrallaan, ja jokaisella askeleella:
  - uusi esine ilmestyy;
  - mittari kasvaa (+k €);
  - taulukkoon kirjoittuu rivi.
- Lopuksi näkyy "+k joka askel"; aloitusmaksu pysyy samana. Kaksi demoa: 2n ja 3n + 4.
- whyAt-palautteet:
  - step, fill ja transfer-tehtäviin;
  - fill tunnistaa peräkkäinkirjoituksen, unohtuneen b:n, naapuririvin ja yhteenlaskun.
- Uusi `grow`-arvokonepeli (place) houkuttimen kanssa.
- Vihjeet kaikkiin tehtäviin, goal ja rev.

**Validointi:**
- tsc ok, vitest ok;
- sweep: 1200 tehtävää, 0 virhettä;
- varyScene tarkistettiin kuvakaappauksilla.

**Kritiikki:** Kaksi staattista korttia kertoivat kirjaimen roolit, mutta eivät näyttäneet niitä. Vihjeitä ja virhepalautetta puuttui. Ei mikropeliä.

**Korjaus:**
- roleScene: samat luvut 1–8 kokeillaan rinnakkain. Yhtälössä x + 4 = 9 vain 5 käy (✓/✗), säännössä hinta = 3n jokainen n käy.
- sameLetterScene: x + x = 10.
  - 3 ja 7 hylätään (sama kirjain = sama luku);
  - kokeilut 4+4 ✗ ja 5+5 ✓;
  - lopuksi vertailu: a + b = 10 sallii 3 + 7.
- Uusi `roles`-lajittelupeli: yksi luku vs. monta arvoa.
- whyAt same-tehtävään: summa, väärä jakaja.
- Vihjeet kaikkiin tehtäviin, goal ja rev.
- Animaatiota ei laitettu tehtävään, koska se paljastaisi vastauksen.

**Validointi:**
- tsc ok, vitest ok.
- Sweep: 1200 tehtävää, 0 virhettä.
- Kuvakaappaukset molemmista animaatioista.

**Kritiikki:** Kaksi staattista korttia. Sijoitusta itseään (luku menee kirjaimen paikalle, piilotettu kertomerkki näkyviin) ei näytetty. paren-, neg- ja transfer-tehtävistä puuttui virhepalaute. Ei mikropeliä. Bugi: kun k = x = 2, linear-tehtävän yksi vaihtoehto jäi ilman perustelua.
**Korjaus:** Uusi evalScene. Siinä luku lentää kirjaimen paikalle, kertomerkki ilmestyy, "34 + 2" merkitään virheeksi, ja lasku etenee rivi kerrallaan omin selityksin. Demot: 3x + 2 (x = 4), 2(a + 5) (sulut ensin) ja 4x + 9 (x = −2). whyAt-palautteet paren-, neg- ja transfer-tehtäviin: vain a kerrottu, numerot peräkkäin, etumerkki, laskujärjestys, aloitusmaksu unohtui. Uusi `match`-place-peli: sama x kolmeen lausekkeeseen ja houkutin. linear-bugi korjattu. Vihjeet, goal ja rev.
**Validointi:** tsc ok, vitest ok. Sweep: 1200 tehtävää, 0 virhettä. evalScene tarkistettiin kuvakaappauksilla kolmella demolla.

**Kritiikki:** Kaksi staattista korttia. Laskujärjestyksen merkitystä (3n + 5 vs. 3(n + 5)) ei näytetty prosessina. Tulitikkutehtävässä oli vain taulukko. Vihjeet puuttuivat neljästä viidestä tehtävästä. Ei mikropeliä.
**Korjaus:** Uusi pipeScene: n-tiili kulkee "ensin"- ja "sitten"-koneiden läpi, lauseke rakentuu ja sulut syntyvät, kun summa kerrotaan. Lopuksi tarkistus arvolla n = 2 näyttää, että tulokset ovat eri. Uusi matchScene: tikkuneliöt rakentuvat tikku kerrallaan, uudet 3 tikkua korostetaan, ja laskuri etenee 4, 7, 10, 13 → 3n + 1. Uusi `translate`-place-peli (sanat → lauseke, houkuttimena b − n). Vihjeet kaikkiin tehtäviin, goal ja rev.
**Validointi:** tsc ok, vitest ok. Sweep: 1200 tehtävää, 0 virhettä. Kuvakaappaukset: tiilen ja koneen päällekkäisyys korjattu.

**Kritiikki:** Demossa oli yksi kortti ja yksi staattinen vaakakuva, eikä yhteyttä tarinan osista yhtälön osiin näytetty. Vihjeet puuttuivat kaikista viidestä tehtävästä. Ei mikropeliä.

**Korjaus:**
- Uusi eqBuildScene-animaatio:
  - pussit (x) putoavat vaakaan yksi kerrallaan, ja kirjoitettu x, 2x, 3x kasvaa samassa tahdissa;
  - tunnettu paino tuo + b;
  - kun vaaka tasapainottuu, tulee =, ja yhteissumma kirjoittuu oikean kupin alle.
- Demot: rahatarina ja painotarina, sama malli kahdessa yhteydessä.
- Uusi `parts`-place-peli, jossa tarinan palat sijoitetaan yhtälön osiin (tuntematon, kerroin, lisäys, yhteensä) ja mukana on houkutin. Korjattu tapaus k = b.
- Vihjeet kaikkiin tehtäviin, goal ja rev.

**Validointi:**
- tsc ok, vitest ok.
- Sweep: 1200 tehtävää, 0 virhettä.
- Kuvakaappaukset kolmesta vaiheesta.

**Kritiikki:** Demo oli staattinen pinta-alakuva ja kortti; "osa osasta" -ajatus ei näkynyt prosessina. half-tehtävän toiselta vaihtoehdolta puuttui perustelu, ja area/calc-tehtävien filtteri saattoi siirtää perusteluja väärille vaihtoehdoille. Vihjeitä ei ollut lainkaan, ei tavoitetta, ei minipeliä.
**Korjaus:** Uusi partOfPartScene (alg79anim): c/d sarakkeet varjostuvat yksi kerrallaan, sitten a/b rivit vain sinisen osan päälle, päällekkäiset ruudut numeroidaan yksitellen, kaikki ruudut b·d, tulos (a·c)/(b·d) ja supistus. Kaksi demoa (2/3·3/4, 1/2·3/4 kakusta) + sääntökortti. fracChoice-apu pitää perustelut oikeilla vaihtoehdoilla; kaikille vääriille vaihtoehdoille perustelut (myös nimittäjien yhteenlasku). Uusi match-sijoittelupeli (3 kertolaskua → tulo, houkutuslappu). Vihjeet kaikkiin, goal, rev.
**Validointi:** tsc ok, vitest 1590 ok, sweep 1200 tehtävää 0 virhettä (choice 1008, place 192), kuvakaappaukset animaation vaiheista (sarakkeet, rivit, laskenta, lopputulos ja supistus).

**Kritiikki:** Demot olivat kaksi staattista korttia; käänteisluvun merkitys (montako palaa mahtuu yhteen) jäi pelkäksi lauseeksi. product-tehtävän vastaus oli aina 1, joten sen pystyi arvaamaan. Vihjeet puuttuivat pick- ja whole-tehtävistä, eikä numeerisissa tehtävissä ollut whyAt-palautetta. Tavoite oli, mutta rev ja minipeli puuttuivat.
**Korjaus:** Kaksi uutta animaatiota alg79anim-tiedostoon:
- flipScene: luku menee kääntökoneeseen, osoittaja ja nimittäjä vaihtavat paikkaa kaarta pitkin, ja tulo a·b/(b·a) = 1 näytetään.
- fitScene: a/b-paloja liukuu janalle 0…1 yksi kerrallaan, viimeinen pala katkaistaan, ja lopputulos on "yhteen mahtuu b/a palaa".

Muut korjaukset:
- Neljä demoa.
- product korvattiin missing-tehtävällä (a/b · □/a = 1), jossa on whyAt yleisimmille virheille.
- Uusi pairs-lajittelupeli (käänteisluvut vastaan vastaluvut, ykkösen täydennykset ja desimaalihämäykset).
- Vihjeet kaikkiin tehtäviin, whyAt siirtotehtävään ja rev.

**Validointi:** tsc ok, vitest 1590 ok. Sweep: 1200 tehtävää, 0 virhettä (choice 519, numeric 489, sort 192). Animaatioiden kuvakaappauksista korjattiin kerto-merkin paikka koneen sisällä, numeroiden päällekkäisyys käännön aikana ja reunan yli menevä palan merkintä.

**Kritiikki:** Kaksi staattista korttia; "montako mahtuu" -ajatus ja tapaus, jossa tulos on alle yhden, eivät näkyneet. Numeerisista tehtävistä puuttui whyAt-palaute, rule- ja bigger-tehtävistä vihje. Minipeliä ja rev-merkintää ei ollut.
**Korjaus:**
- Uusi measureScene: jaettava väritetään viivaimelle, ja c/e-paloja asetetaan peräkkäin ja numeroidaan. Viimeinen pala katkaistaan jäännökseksi. Kun pala on isompi kuin jaettava, mukaan tulee teksti "mahtuu vain 5/6 palaa". Lopuksi näytetään p/q · e/c.
- Neljä demoa: 3 : 1/4, 3/4 : 1/8, 2/3 : 4/5 ja sääntökortti.
- whyAt-palaute tehtäviin groups, fracFrac ja transfer; vihjeet tehtäviin rule ja bigger.
- Uusi grow-lajittelupeli (tulos yli tai alle jaettavan; jakaja alle tai yli yhden).
- rev-merkintä lisätty.
**Validointi:**
- tsc ok, vitest 1590 ok.
- Sweep: 1200 tehtävää, 0 virhettä (choice, numeric, sort, frac).
- Kuvakaappaukset: korjattu tekstien päällekkäisyys ja muoto "4/1" muotoon "4".

**Kritiikki:** Kaksi staattista korttia. Pilkun siirto molemmissa luvuissa, tyhjän kohdan nolla ja "tulos kasvaa" -ilmiö eivät näkyneet. Numeerisissa tehtävissä ei ollut whyAt-palautetta, eikä vihjettä scale- ja grows-tehtävissä. Minipeliä ja rev-merkintää ei ollut.
**Korjaus:** Uusi commaShiftScene. Siinä pilkku hyppää jaettavassa ja jakajassa askel kerrallaan, ja "molemmat · 10" -merkintä näkyy. Tyhjään kohtaan ilmestyy oranssi nolla, etunolla häivytetään, ja lopuksi tulee osamäärä ja tarkistus kertolaskulla. measureSceneen lisättiin valinnainen palan nimi (0,5). Lisäksi:
- kolme demoa: 4,5 : 0,9, 1,5 : 0,25 ja 3 : 0,5;
- whyAt-palaute: scale, compute ja transfer;
- vihjeet kaikkiin tehtäviin;
- uusi shift-sijoittelupeli (samanarvoinen jakolasku, houkuttimena "vain jakaja kerrottu");
- rev.
**Validointi:** tsc ok, vitest 1590 ok. Sweep: 1200 tehtävää, 0 virhettä. Kuvakaappausten perusteella korjattiin pilkun paikka numeroiden välissä, pilkku kokonaisluvun perässä alussa ja etunollan jättämä aukko.

**Kritiikki:** Demo oli yksi staattinen vaakakuva, jossa ratkaisu näkyi valmiina. Poisto molemmilta puolilta ja jako yhtä suuriin osiin eivät näkyneet tapahtumina. whyAt-palautetta ei ollut, ja one-tehtävästä puuttui vihje. Tavoite, rev ja minipeli puuttuivat.
**Korjaus:**
- Uusi balanceSolveScene:
  - pussit nostetaan pois molemmilta puolilta;
  - vakio jaetaan kahdeksi painoksi ja nostetaan pois molemmilta puolilta;
  - loput jaetaan k:hon yhtä suureen osaan, jolloin yksi pussi vastaa yhtä osaa;
  - yhtälö kasvaa rivi riviltä (| −b, | : k), lopussa tarkistus.
- Kolme demoa: 3x+2=14, 5x+1=2x+10 ja miinuskortti.
- whyAt kaikkiin numeerisiin tehtäviin: väärä suunta, unohtunut jako, oikea puoli vastauksena, etumerkki ja pussit toisella puolella.
- Uusi moves-lajittelupeli: säilyykö tasapaino vai kallistuuko vaaka.
- Vihjeet, tavoite ja rev.
**Validointi:**
- tsc ok, vitest 1590 ok.
- Sweep: 1200 tehtävää, 0 virhettä. Ensimmäinen ajo löysi 60 tehtävää ilman whyAt-palautetta (kun a−c = 1 tai x = 0), korjattu varapalautteilla.
- Kuvakaappausten perusteella korjattu jalustan ja yhtälörivien päällekkäisyys sekä kaksoispussit noston aikana.

**Kritiikki:** Demossa oli staattinen taulukko ja kortti. Yleisin virhe, saman luvun lisääminen molempiin jäseniin, ei näkynyt missään. whyAt-palaute ja vihjeet puuttuivat missing-, recipe- ja transfer-tehtävistä. Tavoitetta, rev-merkintää ja minipeliä ei ollut.
**Korjaus:**
- Uusi mixScene. Kolmeen mehukannuun kaadetaan tiiviste- ja vesikupit yksi kerrallaan, ja kupit sekoittuvat yhdeksi väriksi:
  - kannu 1: alkuperäinen suhde;
  - kannu 2: suhde kerrottuna k:lla, väri sama;
  - kannu 3: kumpaankin lisätty k, väri erottuu selvästi.
  - Kannujen alla näkyy tiivisteen osuus, ja lopuksi ristiintulot.
- whyAt-palaute lisäysvirheelle, väärälle kertoimelle ja muuttamattomalle arvolle.
- Vihjeet kaikkiin tehtäviin.
- Uusi taste-lajittelupeli: sama vai eri maku (kerrottu, lisätty, vaihdettu, vain toinen kerrottu).
- Tavoite ja rev lisätty.
**Validointi:**
- tsc ok, vitest 1590 ok.
- Sweep: 1200 tehtävää, 0 virhettä.
- Kuvakaappausten perusteella värikartta vahvistettiin, koska ero näkyi aluksi huonosti, ja päällekkäiset tekstit jaettiin kahdelle riville.

**Kritiikki:** Demot olivat staattisia konekuvia ja kortti; rule-tehtävän suodatus saattoi siirtää perustelut väärien vaihtoehtojen kohdalle; next- ja tikkusiirtotehtävistä puuttuivat whyAt ja vihjeet; test-tehtävässä ei ollut vihjettä; ei mikropeliä.
**Korjaus:** Uusi ruleHuntScene-animaatio: syötteet lentävät ehdokassäännön sarakkeeseen pari kerrallaan ✓/✗, väärä sääntö yliviivataan, oikea kehystetään (2 demoa, joista toisessa houkutteleva 2x − 1 kaatuu). Rule: perustelut parina vaihtoehtojen kanssa ja kolmas harhautin, joka laskee kaatuvan parin. Uusi rules-lajittelupeli: sama sääntö eri kirjoitusasuissa vs. lähes oikeat säännöt. whyAt ja vihjeet kaikkiin.
**Validointi:** tsc ok, sweep 1200/0 huonoa, vitest 1590 ok, animaation kuvakaappaukset tarkistettu.

**Kritiikki:** Ainoa demo oli staattinen taulukko; goal ja rev puuttuivat; which-tehtävän väärillä vaihtoehdoilla ei ollut perusteluja; vihjeitä ei ollut; YESNO-perustelut olivat yleisiä; siirtotehtävästä puuttui whyAt; ei mikropeliä.
**Korjaus:** Uusi dependScene-animaatio: sama kello kahdessa paneelissa – ämpäri täyttyy ja taulukko kasvaa (+k joka minuutti), viikonpäivä vaihtuu mutta lämpömittari pysyy 100 °C:ssa → "riippuu ajasta ✓ / ei riipu päivästä ✗". Testikortti. DEP_PAIRS-pankki parikohtaisilla perusteluilla; uusi sort-peli Riippuu/Ei riipu; pattern-harhautin k+b (y-arvo vs. muutos); vihjeet ja whyAt kaikkialle.
**Validointi:** tsc ok, sweep 1200/0 huonoa, vitest ok, animaatiokehykset tarkistettu (taulukon tiivistys korjattu).

**Kritiikki:** Demo oli staattinen konekuva ja kortti; funktion ydin ("sama syöte → sama arvo") ei näkynyt toiminnassa; rule-tehtävän perustelut olivat samat geneeriset; run-, isFunc- ja taksitehtävistä puuttuivat vihjeet ja whyAt; goal/rev puuttuivat; ei mikropeliä.
**Korjaus:** Uusi funcMachineScene: syötepallot jonossa → kone tärisee → arvopallo ulos → taulukkoon; toistuva syöte kehystetään ja yhdistetään (sama arvo ✓). Rikkinäinen kone -versio näyttää eri arvon ✗ "ei funktio". Uusi pairs-lajittelupeli sisältää yleisen virhekäsityksen (eri syötteet, sama arvo = silti funktio). Laskukohtaiset perustelut, whyAt (laskujärjestys, merkki, aloitusmaksu), vihjeet.
**Validointi:** tsc ok, sweep 1200/0 huonoa, vitest ok, kehykset tarkistettu (jonon leikkautuminen ja tekstin päällekkäisyys korjattu).

**Kritiikki:** Ainoa demo oli valmis staattinen taulukko, joten taulukon rakentaminen ei näkynyt; rev puuttui; rule-tehtävän molemmilla harhauttimilla oli sama perustelu; table-tehtävän suodatus saattoi siirtää perustelut väärille vaihtoehdoille; vihjeitä ja whyAt-perusteluja ei ollut; ei mikropeliä.
**Korjaus:** Uusi tableFillScene: x lentää sääntöön, lasku näkyy ja y lentää riville; lopuksi +k-kaaret ("kerroin") ja x = 0 -rivin kehys ("vakio"). Kaksi demoa, joista toinen käyttää negatiivisia arvoja. Rule- ja table-tehtävissä perustelut ovat parina vaihtoehtojen kanssa, ja kummassakin on uusi harhautin. Uusi detect-sijoittelupeli: kerroin, vakio ja ennuste x = 5 sekä kaksi houkutuslappua (k + b ja 5k). Lisätty whyAt ja vihjeet.
**Validointi:** tsc ok, sweep 1200/0 huonoa, vitest ok, kehykset tarkistettu.

**Kritiikki:** Demo oli staattinen taulukko ja valmis kuvaaja, joten taulukon rivin muuttuminen pisteeksi ei näkynyt; goal ja rev puuttuivat; read-tehtävästä puuttui whyAt; match- ja siirtotehtävästä puuttui vihje; ei mikropeliä pisteen kuulumisesta kuvaajalle.
**Korjaus:** Uusi graphPlotScene: taulukon rivi korostuu, y ilmestyy, piste nousee tai laskee x-akselilta katkoviivaa pitkin, (x, y) kirjoittuu ja lopuksi suora piirtyy pisteiden läpi. Kaksi demoa: nouseva ja laskeva suora. Uusi onIt-lajittelupeli (kuvaajalla / ei kuvaajalla) sisältää harhauttimen, jossa koordinaatit ovat väärin päin, ja sijoituslaskut perusteluina. Lisätty whyAt (x vs. y, suunta, b) ja vihjeet kaikkialle.
**Validointi:** tsc ok, sweep 1200/0 huonoa, vitest ok, kehykset tarkistettu (akselin otsikko siirretty).

**Kritiikki:** Demo oli staattinen kuvaaja, joten k:n ja b:n merkitys ei näkynyt muutoksena; goal ja rev puuttuivat; which-tehtävän väärällä valinnalla ei ollut perustelua; intercept- ja draw-tehtävistä puuttuivat vihjeet; siirtotehtävästä puuttui whyAt; ei mikropeliä.
**Korjaus:** Uusi kbScene: ensin b muuttuu (0 → 3 → −2 → 1), jolloin suora liukuu ja vihreä leikkauspiste seuraa; sitten k muuttuu (2 → 3 → 1 → −1 → −2), jolloin suora kääntyy pisteen (0, b) ympäri ja oranssi porras näyttää "1 oikealle, k ylös/alas". Uusi lines-sijoittelupeli: kolme kuvausta (nousu ja leikkaus, yhdensuuntainen, laskeva) ja houkutuksena k/b vaihdettuna. Perustelut, vihjeet ja whyAt (b vs. x-leikkaus, merkki, jako k:lla).
**Validointi:** tsc ok, sweep 1200/0 huonoa, vitest ok, kehykset tarkistettu (ruudukkoa siirretty yhtälölaatikon alta).

**Kritiikki:** Demoissa oli vain kaavakortti ja staattinen kuvaaja, joten Δy/Δx ei näkynyt "portaana"; goal ja rev puuttuivat; sign- ja steeper-tehtävien väärillä vastauksilla ei ollut perusteluja; numeerisista tehtävistä puuttuivat whyAt-perustelut; table-, sign- ja steeper-tehtävistä puuttuivat vihjeet; ei mikropeliä.
**Korjaus:** Uusi slopeScene: suora piirtyy, Δx-jana kasvaa laskurin kanssa, Δy-jana kasvaa ylös tai alas, porras jaetaan Δx yksikköaskeleeseen ("1 oikealle, k ylös/alas") ja lopuksi k = Δy / Δx. Kaksi demoa: positiivinen ja negatiivinen k. Uusi rank-sijoittelupeli: kolme pisteparia järjestetään jyrkkyyden mukaan, ja mukana on aina negatiivinen k (|k| ratkaisee). whyAt kertoo Δy:n, väärän merkin, käänteisen suhteen ja b:n; vihjeet ja perustelut kaikkialle.
**Validointi:** tsc ok, sweep 1200/0 huonoa, vitest ok, kehykset tarkistettu (suoran rajaus korjattu).

**Kritiikki:** Ainoa demo oli valmis staattinen taulukko, joten mittaamisen ja kirjaamisen yhteys puuttui; goal ja rev puuttuivat; vihjeitä ei ollut; header-tehtävässä oli vain kaksi harhautinta; siirtotehtävästä puuttui whyAt (naapuririvi, aika vs. matka); ei mikropeliä.
**Korjaus:** Uusi logScene: otsikkorivi kirjoitetaan yksiköt korostettuina, sammakko loikkii mittanauhalla oikeassa ajassa, kello käy ja joka mittaushetkellä lippu putoaa ja pari (t, s) lentää omalle rivilleen. Kaavakortti yksiköistä. Uusi fill-sijoittelupeli: sekainen päiväkirja kirjataan riveille, ja houkutuksena on mittaus hetkeltä, jolle taulukossa ei ole riviä (cm-muunnos jätettiin pois, koska se ei kuulu solmun esitietoihin). Perustelut tarkentuvat, header saa uuden harhauttimen ja whyAt sekä vihjeet lisätään.
**Validointi:** tsc ok, sweep 1200/0 huonoa, vitest ok, kehykset tarkistettu.

**Kritiikki:** Ainoa demo oli valmis staattinen kuvaaja, joten rivin siirtyminen pisteeksi ja akselien merkitys eivät näkyneet; goal ja rev puuttuivat; vihjeitä ei ollut; ei mikropeliä akselijärjestyksestä.
**Korjaus:** Uusi plotDataScene: akselit, asteikot ja nimet piirtyvät ensin; jokainen taulukon rivi korostuu, ja piste kulkee aika-akselia pitkin kohtaan t ja nousee korkeudelle s apuviivoineen. Toisena demona valmis kuvaaja. Uusi rows-sijoittelupeli: rivi yhdistetään kuvaukseen "x oikealle, y ylös", ja houkutuksena on väärin päin oleva lappu. Perustelut tarkentuvat ja vihjeet lisätään kaikkialle.
**Validointi:** tsc ok, sweep 1200/0 huonoa, families ok, vitest ok, kehykset tarkistettu.

**Kritiikki:** Kaksi staattista kuvaajaa, ei goalia eikä revisiota; steeper/flat/read ilman vihjeitä ja väärien vastausten perusteluja; read ilman whyAt-palautetta; nopeuserot aina 2 vs 4.
**Korjaus:** Uusi stLiveScene: sammakot loikkivat reaaliajassa ja kynä piirtää kummankin s–t-käyrän samanaikaisesti (lepo = vaakaviiva, zZ). Toinen demo näyttää nopeuden lukemisen. Uusi `story`-mikropeli: kuvaajan kolme osaa ↔ tarinat (nopea/lepo/hidas, harhautus "palaa lähtöön"). Kaikkiin tehtäviin vihjeet, perustelut ja whyAt; nopeudet 1–4 m/s.
**Validointi:** tsc ok, sweep 1200 tehtävää / 0 virhettä, vitest 1590 ok, animaation ruudut tarkistettu selaimessa.

**Kritiikki:** Kaksi staattista kuvaa, ei goalia eikä revisiota; muodon tunnistuksessa vain yhdellä väärällä vaihtoehdolla oli perustelu; ei vihjeitä; lukutehtävässä ei whyAt-palautetta.
**Korjaus:** Uusi vtLiveScene: sammakko liikkuu reaaliajassa, nopeusmittarin neula ja kuvaajan kynä seuraavat samaa nopeutta, ja sekuntijäljet näyttävät välien pitenemisen tai lyhenemisen. Toinen demo korjaa virhekäsityksen "vaakaviiva = paikallaan". Täysi perustelumatriisi VT_WHY. Uusi `phases`-mikropeli: kolmen osan tarina (5 mallia) ↔ liikkeen kuvaukset, yksi lappu jää yli. Lukutehtävään vihje ja whyAt.
**Validointi:** tsc ok, sweep 1200 / 0 virhettä, vitest 1590 ok, animaation ruudut tarkistettu selaimessa.

**Kritiikki:** Yksi staattinen lukusuorakuva, ei goalia eikä revisiota; merkkitehtävästä puuttuivat perustelut; järjestystehtävän perustelut saattoivat siirtyä väärille vaihtoehdoille (filter ilman parittamista); osasta tehtäviä puuttuivat vihjeet ja lukusuoratehtävästä whyAt.
**Korjaus:** Uusi lineSortScene: korttiluvut lentävät yksi kerrallaan paikoilleen lukusuoralle, ja lamppu pyyhkii vasemmalta oikealle rakentaen ketjun a < b < c. Toinen demo: lämpömittarien pinta laskee reaaliajassa (−3 vs −7). Uusi `split`-lajittelupeli (pienempi/suurempi kuin −p). Perustelut parittain, vihjeet ja whyAt kaikkialle.
**Validointi:** tsc ok, sweep 1200 / 0 virhettä, vitest 1590 ok, animaation ruudut tarkistettu selaimessa.

**Kritiikki:** Staattinen hyppykuva ja kaava-kortti, ei goalia eikä revisiota; vain yhdessä tehtävässä oli vihje; numeerisista tehtävistä puuttui whyAt-palaute tyypillisiin virheisiin (numerot vähennetty eri puolilla nollaa, laskettu yhteen samalla puolella, negatiivinen etäisyys).
**Korjaus:** Kolme reaaliaikaista iceHops-demoa (eri puolilla, samalla puolella, itseisarvo), joissa sammakko hyppää askel kerrallaan. Uusi `pairs`-mikropeli: pari ↔ etäisyys, harhautuksena "numerot vähennetty" -virhe. Kaikkiin tehtäviin vihje ja whyAt.
**Validointi:** tsc ok, sweep 1200 / 0 virhettä, vitest 1590 ok, demoruudut tarkistettu selaimessa.

**Kritiikki:** Yksi staattinen hyppykuva, ei goalia eikä revisiota; closer-tehtävän tasatilanteen haara jäi ilman perusteluja; hypyistä, puolivälistä ja siirtotehtävästä puuttuivat vihjeet ja whyAt.
**Korjaus:** Demo 1 on reaaliaikainen iceHops nollan yli. Uusi midScene: kaksi sammakkoa hyppää yhtä aikaa toisiaan kohti ja kohtaa puolivälissä. Closer yhdistetty yhdeksi haaraksi, jossa on perustelut. Uusi `land`-mikropeli: hyppykuvaus ↔ päätepiste, harhautuksena etumerkkivirhe. Vihjeet ja whyAt kaikkialle (väärä suunta, ±1 askel, puolikas pituus, summa jakamatta).
**Validointi:** tsc ok, sweep 1200 / 0 virhettä, vitest 1590 ok, midScene tarkistettu selaimessa.

**Kritiikki:** Kaksi staattista kuvaa (lukusuora, kaava-kortti) ilman liikettä; numeerisista tehtävistä puuttui whyAt-palaute etumerkki- ja suuntavirheisiin; sekalaskusta puuttui vihje; ei tehtävää, jossa ennakoidaan summan etumerkki.
**Korjaus:** Kaksi reaaliaikaista iceHops-demoa (−3 + 5, −4 + (−3)) ja uusi zeroPairScene: plus- ja miinusnapit putoavat paikoilleen, nollaparit kumoutuvat pari kerrallaan ja jäljelle jäävät napit ovat summa. Uusi `sign`-lajittelupeli: ennakoi etumerkki laskematta. Vihjeet ja whyAt kaikkialle.
**Validointi:** tsc ok, sweep 1200 / 0 virhettä, vitest 1590 ok, zeroPairScene tarkistettu selaimessa.

**Kritiikki:** Kaava-kortti ja staattinen lukusuora; perustelua sille, miksi −(−3) = +3, ei näytetty; yhdessäkään tehtävässä ei ollut vihjettä eikä whyAt-palautetta.
**Korjaus:** Reaaliaikainen thermoScene (−3 → −10, muutos −7) ja uusi takeNegScene: nollaparit lisätään ja miinusnapit nostetaan pois yksi kerrallaan (5 − (−3), −2 − (−5)). Uusi `rewrite`-mikropeli: vähennyslasku ↔ yhteenlasku, harhautuksena "vastaluku jäi ottamatta". Vihjeet ja whyAt kaikkiin tehtäviin (väärä suunta, alku − loppu, vähennetty negatiivinen).
**Validointi:** tsc ok, sweep 1200 / 0 virhettä, vitest 1590 ok, takeNegScene tarkistettu selaimessa.

**Kritiikki:** Merkkisäännön perustelu oli kahtena staattisena kaava-korttina; revisio puuttui; sign-tehtävän kolmannelta väärältä vaihtoehdolta puuttui perustelu ja koko tehtävästä vihje; numeerisista tehtävistä puuttui whyAt.
**Korjaus:** iceHops-demo 3 · (−2) toistuvina hyppyinä ja uusi mulPatternScene: kaavan rivit ilmestyvät, ja tulo hyppää lukusuoralla −k (tai +k) kerrallaan nollan ohi, kun kerroin on 3 ja −3. Uusi `signs`-lajittelupeli: tulon etumerkki miinusten määrästä (myös kolme tekijää). Perustelut, vihjeet ja whyAt kaikkialle.
**Validointi:** tsc ok, sweep 1200 / 0 virhettä, vitest 1590 ok, mulPatternScene tarkistettu selaimessa.

**Kritiikki:** Kaksi staattista kaava-korttia; revisio puuttui; negneg-tehtävästä puuttui vihje ja check-tehtävästä vihje; numeerisista tehtävistä puuttui whyAt etumerkkivirheisiin.
**Korjaus:** Uusi divChipScene: (−12) : 3 jaetaan nappi kerrallaan kolmeen laatikkoon, ja (−20) : (−4) kootaan miinus neljän ryhmiksi, jotka lasketaan. Kolmas demo kokoaa kertolaskutarkistukset, myös tapauksen 12 : (−3). Uusi `quot`-mikropeli: jakolasku ↔ osamäärä, harhautuksena etumerkkivirhe. Vihjeet ja whyAt kaikkialle.
**Validointi:** tsc ok, sweep 1200 / 0 virhettä, vitest 1590 ok, divChipScene tarkistettu selaimessa.

**Kritiikki:** Demo oli staattinen t/v-taulukko – kiihtyvyyden "joka sekunti" ei näkynyt ajassa. Ei goalia, ei vihjeitä, ei jarrutusesimerkkiä demossa, ei numeerista eikä lajittelutehtävää.
**Korjaus:** Uusi accelTableScene: vene kiihtyy veden päällä, vanavesimerkit sekunnin välein, nopeusmittari ja taulukko, johon rivi syntyy joka sekunti "+a m/s"-kaarella; toinen demo jarruttava pyöräilijä (−3 m/s²). Goal, vihjeet kaikkiin, tarkennetut whyt. Uudet tehtävät: gain (lue taulukosta nopeuden kasvu/s, whyAt) ja mikropeli change (lajittele 6 arkitilannetta: kiihtyvyyttä / ei).
**Validointi:** tsc ok, sweep 1200 tehtävää 0 virhettä (choice/numeric/sort), vitest 1590 ok, kuvakaappaukset (0,2,4) ja (12,−3,4,🚲).

**Kritiikki:** Demo oli pelkkä staattinen kaavakortti, ei vihjeitä, ei whyAt-palautetta virhevastauksiin (unohtunut jako, unohtunut alkunopeus, miinusmerkki), ei rakentavaa tehtävää.
**Korjaus:** Goal + rev. Demot: animoitu vene 2→8 m/s (accelTableScene), kaavakortti sanallisella selityksellä, animoitu jarruttava pyörä 12→0 m/s (−4 m/s²). Kaikkiin numeerisiin vihje + whyAt (Δv jakamatta, kerrottu ajalla, loppunopeus, miinusmerkki puuttuu). Uusi mikropeli build: rakenna lasku vetämällä Δv, t ja a paikoilleen, loppunopeus houkutuslappuna.
**Validointi:** tsc ok, sweep 1200 tehtävää 0 virhettä (numeric/place), vitest 1590 ok, kuvakaappaukset loppukehyksistä.

**Kritiikki:** Demo oli staattinen kaavio – miksi kuvaaja kaartuu, ei näkynyt. Väärille vaihtoehdoille ei ollut perusteluja, vihjeitä ei ollut, goal puuttui.
**Korjaus:** stLiveScene sai sekuntimerkit (marks) ja omat tekstitykset. Demot: Tasa vs. kiihdyttävä Kiito (merkit harvenevat, kaari jyrkkenee) ja Tasa vs. hidastuva Hiipu (merkit tihenevät, kaari loivenee). ST_WHY-matriisi perustelee jokaisen väärän tulkinnan. Vihjeet kaikkiin. Uusi mikropeli steps: lajittele sekuntimatkasarjat jyrkkenee / loivenee / suora.
**Validointi:** tsc ok, sweep 1200 tehtävää 0 virhettä (choice/sort), vitest 1590 ok, kuvakaappaukset hetkiltä 7 s ja loppu.

**Kritiikki:** Demo oli staattinen kaavio. Väärille vaihtoehdoille ei ollut perusteluja, vihjeitä ei ollut, numeeriseen tehtävään ei ollut whyAt-palautetta, eikä "jyrkkyys = Δv/Δt" näkynyt kolmiona.
**Korjaus:** vtLiveScene sai jyrkkyyskolmion (tri) ja oman lopputekstin. Demot: tasainen kiihdytys ja kolmio 2–6 s (Δv 8 m/s, Δt 4 s → 2 m/s²); monivaiheinen liike, jossa jarrutuskolmio antaa −3 m/s². Perustelut kaikkiin vääriin vaihtoehtoihin, vihjeet ja whyAt (jakamaton muutos, loppunopeus, asteikon misluku). Uusi mikropeli slopes: vedä kolmen 2 s välin kiihtyvyydet (myös negatiivinen ja 0) paikoilleen, jakamaton 6 m/s² houkutuslappuna.
**Validointi:** tsc ok, sweep 1200 tehtävää 0 virhettä (choice/numeric/place), vitest 1590 ok, kuvakaappaukset loppukehyksistä (Δv-merkinnän leikkautuminen korjattu).

**Kritiikki:** Demo oli kaksi staattista kuvaajaa rinnakkain, eikä näkynyt, että ne syntyvät samasta liikkeestä. Väärille vaihtoehdoille ei ollut perusteluja, vihjeitä ei ollut, goal puuttui.
**Korjaus:** Uusi dualLiveScene: sammakko kulkee lepo–kiihdytys–tasainen–hidastus-profiilin, ja kaksi kynää piirtää s–t- ja v–t-kuvaajan yhtä aikaa; vaiheen mukainen tekstitys kertoo vastaavuuden. Jokaiselle väärälle kuvaajalle perustelu ("tämä tarkoittaa X, mutta kuvaajasta näkyy Y"). Vihjeet kaikkiin. Uusi mikropeli pairs: lajittele s–t-kuvaukset ja sekuntimatkat neljään v–t-muotoon.
**Validointi:** tsc ok, sweep 1200 tehtävää 0 virhettä (choice/sort), vitest 1590 ok, kuvakaappaukset hetkiltä 5 s ja loppu.
