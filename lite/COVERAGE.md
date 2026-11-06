# Kattavuus: 181 noodia oppitunteina

Tämä tiedosto on generoitu: `node tools/coverage-report.mjs`. Älä muokkaa käsin.

Lähdecommit: `c056b8e05a9e88f7719b0946f6475999811f813c`. Luettujen nykyisten lähdetiedostojen SHA-256: `71dc79c8870ae15007b98f00e5fc38930c3b7f69ac348e0b795923fd47d3d424`. Jos työpuu muuttui commitin jälkeen, tiiviste yksilöi mitatun puun. Tämä ajo inventoi generaattorit; se ei suorita selain- tai ihmisvalidointia.

- Manifesti: `reference/mvp-scope-181.json` (177-pohja + tarkistettu lisäys), sha256 `58f7ca8bb7868dde2a4e4189259871e83d18681510f7841dad22e4eae2114ab8`, 181 noodia.
- Graafin tarkiste (src/data/graph.json): `551d6a2ebd541a30785040cee458ca49132a0756e313ce45f1799ed2d6a7be11`. Sisältöversio: `lite181-2026-10-27`.
- Aiemmat 107 noodia: 107/107 mukana. Lisäyksiä: 74.
- Jokaiselle noodille on oma oppitunti (`NodeSpec`): tavoite, malliesimerkki, ohjattu, itsenäinen ja siirtovaihe, palaute ja selitys. Perheet (tag) on poimittu ajamalla generaattoria 300 siemenellä vaihetta kohden.

Vuorovaikutustyypit ja niitä käyttävien noodien määrä: choice 166, numeric 81, place 76, sort 42, build 15, multi 13, line 10, plot 8, reeds 4, pack 3, tapcount 2, balance 2, bagup 2, extend 1, ribbons 1, combos 1, iterate 1, deal 1, clock 1, grid 1, stack 1, bundle 1, cut 1, weigh 1, grams 1, pourtest 1, fill 1, tally 1, frac 1.

Sarakkeet: *Ryhmät* = esitietoryhmät (`all` = kaikki vaaditaan ja voidaan päätellä, `any` = yksi riittää eikä päätellä). *Peruste* = miksi noodi on manifestissa.

## Noodit oppituntijärjestyksessä

| KC | Otsikko | Lk | Maailma / luku | Paikka | Tehtävätyypit | Itsenäiset perheet | Siirtoperheet | Ryhmät | Dynaaminen sääntö / tehtävän taitokäyttö / turvaohje | Versio | Peruste | Tarkistettu |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `M-GEO-01` | Tason ja kolmiulotteisen ympäristön erottaminen | 1-2 | Rantaretki / Lajittelulaituri | 🧊 Litteä vai kappale? | choice, sort | sort, solid, flat, print | transfer | – | – | launch1-2026-11-01 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-REP-04` | Matemaattisen ajatuksen esittäminen symbolein ja merkinnöin | 1-6 | Rantaretki / Merkkipaja | ✍️ Merkkikieli | choice, build | build, add, compare, words | transfer | – | dyn: requires_relevant_content_symbol_knowledge | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-TH-08` | Kahden opitun matemaattisen asian välisen yhteyden tunnistaminen | 3-6 | Aarresaaristo / Kertomajakka | 🔗 Sama asia, eri tapa | place, choice, numeric | areaMul, mulAdd, pairs, fracDiv | transfer | – | dyn: requires_any_two_mastered_content_nodes; käyttää: M-GMEAS-01 | review2-2026-10-29 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `SCI-ENV-SAFE-01` | Annettujen turvallisuusohjeiden noudattaminen | 1-2 | Rantaretki / Havaintovihko | 🦺 Turvallinen tutkija | choice, place, sort | sort, s0, s2, s3, s4, order, s5, s1 | transfer | – | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-GEO-04` | Tasokuvion tunnistaminen | 1-2 | Rantaretki / Lajittelulaituri | 🔺 Muotojen nimet | choice, sort | corners, find, name, sort | transfer | all(1) | – | launch1-2026-11-01 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-NUM-1TO1` | Yhden lukusanan kohdistaminen kuhunkin laskettavaan kohteeseen | 1-2 | Rantaretki / Laskuloru | 👆 Yksi kerrallaan | tapcount, choice | judge, tap | transfer | – | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-SYM-01` | Peilaussymmetrian tunnistaminen suoran suhteen | 3-6 | Aarresaaristo / Aarresaari | 🪞 Jääpeili | choice, multi, plot | paint, axis, grid, complete | transfer | all(1) | – | launch1-2026-11-01 | task_context_coverage_seed | nykyinen generaattori-inventaario |
| `M-NUM-STABLE-ORDER` | Lukusanojen käyttäminen vakaassa järjestyksessä | 1-2 | Rantaretki / Laskuloru | 🎵 Laskuloru | choice, build | rhyme, next, swap, spot | transfer | – | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-WORD-NUMERAL` | Lukusanan yhdistäminen sitä vastaavaan numeromerkintään | 1-2 | Rantaretki / Laskuloru | 🔤 Sana ja numero | choice, place | pairs, w2n, n2w | transfer | – | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-TH-01` | Yhtäläisyyksien ja erojen havaitseminen | 1-6 | Rantaretki / Mittaripaja | 🔺 Sama ja eri | choice | which, same, odd | transfer | – | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-TH-02` | Kohteiden luokittelu annetun ominaisuuden mukaan | 1-6 | Rantaretki / Lajittelulaituri | 🗃️ Lajittelulaatikot | sort, multi, choice | odd, color, shape, boxes, rule | transfer | – | – | launch1-2026-11-01 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-TH-03` | Kohteiden järjestäminen annetun ominaisuuden mukaan | 1-6 | Rantaretki / Lajittelulaituri | 📏 Jonoon järjestys | place, choice | fix, sticks, numbers, middle | transfer | – | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-TH-04` | Toistuvan tai muuttuvan säännönmukaisuuden havaitseminen | 1-6 | Rantaretki / Lajittelulaituri | 🔁 Toistuvat kuviot | extend, choice | dots, repeat, extend, grow | transfer | – | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-WORK-01` | Matemaattisesti olennaisen havainnon tekeminen tilanteesta | 1-6 | Rantaretki / Lajittelulaituri | 🔍 Tarkka havainto | choice, sort | sieve, extra, need, notice | transfer | – | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-MEAS-00` | Mitattavien ominaisuuksien suora vertaaminen | 1-2 | Rantaretki / Mittaripaja | 🎀 Kumpi pidempi | ribbons, choice | heavy, aligned, tricky, equal | transfer | – | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-TH-07` | Vaihtoehtojen järjestelmällinen etsiminen | 3-6 | Aarresaaristo / Tutkimusasema | 🧮 Kaikki vaihtoehdot | choice, sort, numeric, combos | list, outfits, digits, system, valid | transfer | – | – | review2-2026-10-29 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M79-LOGIC-01` | Säännön tai riippuvuuden löytäminen | 7-9 | Lampilaboratorio / Funktiot ja suorat | 🕵️ Säännön jäljillä | numeric, choice, sort | rules, rule, next, test | transfer | – | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `SCI-ENV-OBSERVE-01` | Havainnon tekeminen ilmiöstä tai kohteesta | 1-2 | Rantaretki / Havaintovihko | 🔎 Tarkka silmä | choice, sort | sort, match, feature, colour | transfer | – | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-MEAS-02` | Pituuden ymmärtäminen suureeksi | 1-2 | Rantaretki / Mittaripaja | 〰️ Nauhan pituus | choice | path, bend, thick | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-TIME-01` | Ajan ymmärtäminen mitattavana suureena | 1-2 | Rantaretki / Mittaripaja | ⏳ Kumpi kestää | choice | equal, sim, diff, life | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-01` | Kohteiden laskeminen yksi yhteen -vastaavuudella | 1-2 | Rantaretki / Laskuloru | 🔢 Laske kaikki | tapcount | circle, line, scatter | transfer | all(2) | – | count2-2026-10-27 | aiempi 107 | nykyinen generaattori-inventaario |
| `ENV-PHY-MOTION-OBS-01` | Liikkeen havainnointi | 1-2 | Rantaretki / Havaintovihko | 🍃 Liikkuiko? | choice, multi | still, sim, moved, colour, spot | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-TIME-03` | Aikayksiköiden ja keston yhteyden ymmärtäminen | 1-2 | Rantaretki / Mittaripaja | ⏱️ Sekunnit | numeric, choice | compare, sim, lamp, unit | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-MEAS-01` | Mittaaminen suureen vertaamisena sovittuun yksikköön | 1-2 | Rantaretki / Mittaripaja | 📎 Klemmarimittari | iterate, choice | judge, count, lay | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-02` | Laskennan viimeinen lukusana kertoo koko joukon lukumäärän | 1-2 | Rantaretki / Laskuloru | 🧺 Montako kaikkiaan | choice, multi | give, howmany | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-17` | Lukumäärän puolittaminen kahteen yhtä suureen osaan | 1-2 | Rantaretki / Eväsretki | ✂️ Puolikkaat | deal, choice | number, share, deal, fair | transfer | all(1) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `ENV-PHY-MOTION-CHANGE-01` | Liikkeen muutoksen havainnointi | 1-2 | Rantaretki / Havaintovihko | 🔄 Mikä muuttui? | choice, place | turn, sim, stop, faster, steady, next | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-ADD-01` | Yhteenlasku kahden määrän yhdistämisenä | 1-2 | Rantaretki / Eväsretki | 🧺 Yhteinen kori | choice, build | sentence, join, expr | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-QTY-NUMERAL` | Lukumäärän yhdistäminen sitä vastaavaan numeromerkintään | 1-2 | Rantaretki / Laskuloru | 🏷️ Rasian lappu | choice, multi, place | fill, q2n, n2q | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-QTY-WORD` | Lukumäärän yhdistäminen sitä vastaavaan lukusanaan | 1-2 | Rantaretki / Laskuloru | 🗣️ Määrä ja sana | choice | spread, q2w, w2q | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `ENV-PHY-MOTION-01` | Liikkeen ja liikkeen muutoksen havainnointi | 1-2 | Rantaretki / Havaintovihko | 🦆 Liikkeen tarkkailija | choice | faster, sim, which, still, describe | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-03` | Lukumäärän, lukusanan ja numeromerkinnän yhdistäminen | 1-2 | Rantaretki / Laskuloru | 🎯 Kolme tapaa | place, choice | fromNumeral, fromQty | transfer | all(3) | – | lite181-2026-10-27 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-18` | Lukujen 1–10 hajotelmien ymmärtäminen | 1-2 | Rantaretki / Simpukkaranta | 🐚 Simpukkaparit | choice, balance | scale, hidden, pair, ten | transfer | all(2) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `PHY79-MOTION-REF` | Liikkeen kuvaaminen suhteessa valittuun tarkastelukohteeseen | 7-9 | Lampilaboratorio / Liike ja nopeus | 🚤 Mistä katsoen? | choice, sort | train, sim, boat, walk, sort | transfer | all(1) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-07` | Lukujonon jatkaminen eteenpäin | 1-2 | Rantaretki / Hyppykivet | 🪨 Numerokivet | choice, build | order, small, teen, big | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-08` | Lukujonon jatkaminen taaksepäin | 1-2 | Rantaretki / Hyppykivet | ⏪ Takaperin | line, choice | gap, next, hop, before | transfer | all(1) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-NUM-10` | Kahden luonnollisen luvun suuruuden vertaaminen | 1-2 | Rantaretki / Laskuloru | ⚖️ Kumpi enemmän? | choice, place | order, bigger, tens, symbol | transfer | all(1) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-TIME-02` | Kellonajan lukemisen perusidea | 1-2 | Rantaretki / Mittaripaja | 🕒 Kellotaulu | choice, clock | hands, full, half, set | transfer | all(2) | – | launch1-2026-11-01 | activity_context_use | nykyinen generaattori-inventaario |
| `M-NUM-14` | Luvun käyttäminen mittaustuloksen ilmaisemiseen | 1-2 | Rantaretki / Mittaripaja | 📏 Mittausluku | choice | unit, read, make | transfer | all(1) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-QTY-CONCEPT` | Fysikaalisen suureen käsitteen ymmärtäminen | 7-9 | Lampilaboratorio / Suureet ja yksiköt | 📏 Mitattava ominaisuus | choice, sort | sort, pick, tool, unitVs | transfer | all(1) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-NUMVALUE` | Suureen lukuarvon erottaminen suureesta ja yksiköstä | 7-9 | Lampilaboratorio / Suureet ja yksiköt | 🔢 Lukuarvo | choice, numeric, sort | sort, plain, symbol, type | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-UNIT-CONCEPT` | Fysikaalisen yksikön roolin ymmärtäminen | 7-9 | Lampilaboratorio / Suureet ja yksiköt | 📐 Yksikkö | choice, place | fill, pick, fit | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-QTY-01` | Fysikaalisen suureen, lukuarvon ja yksikön erottaminen | 7-9 | Lampilaboratorio / Suureet ja yksiköt | 🧩 Suure, luku, yksikkö | choice, place | which, sort, whole | transfer | all(3) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-DIST-TIME` | Matkan ja ajan tunnistaminen liikkeen mitattaviksi suureiksi | 7-9 | Lampilaboratorio / Liike ja nopeus | ⏱️ Matka ja aika | numeric, multi, choice | time, sim, dist, tool, read | transfer | all(2) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-EQUALSTEP-SEQ` | Tasavälisen lukujonon tunnistaminen ja jatkaminen | 1-2 | Rantaretki / Hyppykivet | 🐸 Hyppyjono | choice, build | which, step2, step5, step10, rule, extend | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-MULTIPLE-INTRO` | Monikerran käsitteen alku | 1-2 | Rantaretki / Hyppykivet | 🦘 Loikan hypyt | choice, line, multi | hits, k2, k3, k5, nth | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-16` | Tasavälisen lukujonon ja monikerran alun tunnistaminen | 1-2 | Rantaretki / Hyppykivet | 🔍 Hyppyjen salaisuus | build, choice | next, step, gaps | transfer | all(2) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-MUL-01` | Kertolasku yhtä suurten ryhmien toistumisena | 1-2 | Rantaretki / Eväsretki | 🎒 Eväspussit | choice, pack | equal, total, expr, pack | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-MULTAB-LOW` | Kertotaulufaktat 1–5 ja 10 | 1-2 | Rantaretki / Kertopaja | ✖️ Kertopaja | choice, numeric, grid | grid, fact, array, strategy | transfer | all(1) | – | audit1-2026-10-28 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-DIV-02` | Sisältöjako: selvitetään montako annettua ryhmää määrään mahtuu | 1-2 | Rantaretki / Eväsretki | 🛍️ Montako pussia | bagup, choice | story, pic, fill | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-MULTAB-HIGH` | Kertotaulufaktat 6–9 | 3-6 | Aarresaaristo / Kertomajakka | 9️⃣ Isot kertotaulut | numeric, choice | fact, nine, six, trick | transfer | all(1) | – | launch1-2026-11-01 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-MULTAB-ALL` | Kertotaulujen 1–10 sujuva hallinta | 3-6 | Aarresaaristo / Kertomajakka | 🏅 Kertotaulumestari | numeric, place, choice | neighbour, mixed, factor, row | transfer | all(2) | – | launch1-2026-11-01 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-MULTREL-01` | Multiplikatiivinen vertailu: x kertaa niin paljon | 3-6 | Rantaretki / Eväsretki | 🏰 Kertaa niin paljon | stack, choice | howMany, times, build | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-SPEED-CONCEPT` | Keskinopeuden ymmärtäminen matkan ja ajan suhteena | 7-9 | Lampilaboratorio / Liike ja nopeus | 🐸 Kumpi nopeampi? | choice, place | sameT, sim, sameS, equal, rank | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-ACCEL-CONCEPT` | Kiihtyvyyden ymmärtäminen nopeuden muutoksena ajassa | 7-9 | Lampilaboratorio / Kiihtyvyys | 🛥️ Kiihtyvyys | choice, sort, numeric | meaning, sim, which, table, gain, change | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `SCI-ENV-PRESENT-DATA-01` | Havaintojen esittäminen tarkoituksenmukaisella tavalla | 1-2 | Rantaretki / Havaintovihko | 🖼️ Kerro kuvalla | choice, place | complete, pick, read, most | transfer | all(1) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `SCI-ENV-RECORD-DATA-01` | Havaintojen taltioiminen | 1-2 | Rantaretki / Havaintovihko | 📒 Havainto talteen | place | fix, two, three | transfer | all(1) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `SCI-ENV-RECORD-01` | Havaintojen taltioiminen ja esittäminen | 1-2 | Rantaretki / Havaintovihko | 📓 Retkivihko | place, choice | check, build, count | transfer | all(2) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NUM-06` | Nollan ymmärtäminen lukumääränä ja lukuna | 1-2 | Rantaretki / Laskuloru | 🪺 Tyhjä pesä | choice | takeAll, empty, count | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-PLACE-01` | Kymmenen ykkösen ryhmittäminen yhdeksi kymmeneksi | 1-2 | Rantaretki / Kymppilautta | 🌾 Kaislanippu | choice, bundle | bundles, enough, missing, tie | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-PLACE-02` | Ykkösten ja kymmenten paikka-arvo | 1-2 | Rantaretki / Kymppilautta | 🪵 Nipputori | choice, reeds | digit, picToNum, numToPic, order | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-PLACE-03` | Luvun rakentaminen ja hajottaminen ykkösiin ja kymmeniin | 1-2 | Rantaretki / Kymppilautta | 🛶 Lautan rakentaja | choice, reeds | open, compose, split, build | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-MENTAL-01` | Luvun hajottaminen laskemista helpottavaan muotoon | 1-2 | Rantaretki / Kymppilautta | 🧩 Fiksu jako | choice, numeric, cut | cut, toTen, tensOnes, use | transfer | all(2) | – | launch1-2026-11-01 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-SUB-01` | Vähennyslasku määrän vähentämisenä | 1-2 | Rantaretki / Merkkipaja | 🌊 Aallon vietävää | choice, line | back, picture, story, expr | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-ADD-SUB-01` | Yhteen- ja vähennyslaskun käänteinen yhteys | 1-2 | Rantaretki / Simpukkaranta | 👨‍👩‍👧 Lukuperhe | numeric, choice, build | write, family, undo, check | transfer | all(2) | – | launch1-2026-11-01 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-ADD-FACT-10` | Yhteenlaskun perusfaktat lukualueella 0–10 | 1-2 | Rantaretki / Simpukkaranta | ➕ Plussasimpukat | choice, numeric, line | race, fact, turn, double | transfer | all(1) | – | audit1-2026-10-28 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-DIV-01` | Ositusjako: määrä jaetaan annettuun määrään yhtä suuria ryhmiä | 1-2 | Rantaretki / Eväsretki | 🍓 Reilu jako | choice, pack | story, deal, fair, share | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-SUB-FACT-10` | Vähennyslaskun perusfaktat lukualueella 0–10 | 1-2 | Rantaretki / Simpukkaranta | ➖ Miinussimpukat | choice, numeric | up, fact, think, left | transfer | all(1) | – | launch1-2026-11-01 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-ADD-FACT-01` | Yhteen- ja vähennyslaskun perusfaktat lukualueella 0–10 | 1-2 | Rantaretki / Simpukkaranta | 🏁 Simpukkakisa | choice, numeric | missing, mixed, story, sign | transfer | all(2) | – | audit1-2026-10-28 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-DIVIS-01` | Jaollisuuden käsitteen ymmärtäminen | 3-6 | Aarresaaristo / Kertomajakka | 🔢 Jakautuuko tasan? | multi, sort, choice | meaning, lastDigit, threes, tags | transfer | any(2) | – | launch1-2026-11-01 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-MULDIV-01` | Kerto- ja jakolaskun käänteinen yhteys | 1-2 | Rantaretki / Kertopaja | 🔄 Jakoperhe | numeric, choice, bagup | repack, family, factor, check | transfer | all(3) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-ADD-20` | Yhteenlasku lukualueella 0–20 | 1-2 | Rantaretki / Simpukkaranta | 🌉 Kympin yli | numeric, choice, build | chain, bridge, teen, split | transfer | all(1) | – | launch1-2026-11-01 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-DIV-FACT-01` | Helpon jakolaskun ratkaiseminen kertotaulun avulla | 1-2 | Rantaretki / Kertopaja | ➗ Jakopaja | choice, numeric, pack | deal, fact, think, share | transfer | all(2) | – | audit1-2026-10-28 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-FRAC-01` | Kokonaisen jakaminen yhtä suuriin osiin | 1-2 | Aarresaaristo / Piirakkajuhla | 🥧 Reilut palat | choice, sort | sortfair, equal, count, fair | transfer | – | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-SUB-20` | Vähennyslasku lukualueella 0–20 | 1-2 | Rantaretki / Simpukkaranta | 🪜 Kympin ali | numeric, choice, build | steps, bridge, noBridge, think | transfer | all(1) | – | launch1-2026-11-01 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-ADD-100` | Yhteenlasku lukualueella 0–100 | 1-2 | Rantaretki / Kymppilautta | 🛶 Isot lautat | choice, numeric, reeds | raft, noCarry, carry, tens | transfer | all(2) | – | launch1-2026-11-01 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-SUB-100` | Vähennyslasku lukualueella 0–100 | 1-2 | Rantaretki / Kymppilautta | 🌾 Kaislat käyttöön | choice, reeds, numeric | check, noBorrow, borrow, take | transfer | all(2) | – | audit1-2026-10-28 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-GEO-02` | Sijaintikäsitteiden käyttäminen | 1-2 | Aarresaaristo / Aarresaari | 🧭 Saaren hylly | choice, place | build, leftRight, aboveBelow, between | transfer | – | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-MEAS-03` | Metri ja senttimetri pituuden yksikköinä | 1-2 | Rantaretki / Mittaripaja | 📏 Mittanauha | choice, line | ruler, unit, estimate, mark | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-MEAS-04` | Pituuden mittaaminen yksikön avulla | 1-2 | Rantaretki / Mittaripaja | 📐 Mittaa yksiköllä | numeric, choice | unitSize, units, offset | transfer | all(1) | – | audit1-2026-10-28 | canonical_ancestor_of_activity_use | nykyinen generaattori-inventaario |
| `M-GMEAS-01` | Kuvion piirin ymmärtäminen reunaviivan kokonaispituudeksi | 3-6 | Aarresaaristo / Laivaveistämö | 🔲 Reunan pituus | numeric, sort, choice | meaning, rect, grid, same | transfer | all(2) | – | audit1-2026-10-28 | activity_context_use | nykyinen generaattori-inventaario |
| `M-MEAS-05` | Massan ymmärtäminen suureeksi | 1-2 | Rantaretki / Rantakioski | ⚖️ Kioskin vaaka | choice, weigh | weigh, balance, size, equal | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-MEAS-06` | Kilogramma ja gramma massan yksikköinä | 1-2 | Rantaretki / Rantakioski | 🍎 Marjapunnitus | choice, grams | scale, unit, estimate, thousand | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-MEAS-08` | Astian sisältämän määrän hahmottaminen mitattavana suureena | 1-2 | Rantaretki / Rantakioski | 🧃 Mehukannu | choice, pourtest | test, pour, cups, conserve | transfer | all(1) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-MEAS-09` | Litra ja desilitra yksikköinä | 1-2 | Rantaretki / Rantakioski | 🥛 Litra ja desi | choice, fill | fill, unit, ten, compare | transfer | all(2) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-DATA-01` | Tiedon kerääminen määritellystä aiheesta | 1-2 | Aarresaaristo / Tutkimusasema | ✏️ Havaintolista | multi, choice | question, collect | transfer | – | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-DATA-02` | Yksittäisten havaintojen tallentaminen | 1-2 | Aarresaaristo / Tutkimusasema | 📝 Havaintoviivat | choice, tally | fix, pick, count, add, record | transfer | all(2) | – | review2-2026-10-29 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-DATA-03` | Yksinkertaisen taulukon rakenteen ymmärtäminen | 1-2 | Aarresaaristo / Tutkimusasema | 📋 Taulukon lukija | choice, place, numeric | cells, read, twoWay, fewest | transfer | – | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-DATA-05` | Tiedon lukeminen yksinkertaisesta taulukosta | 1-2 | Aarresaaristo / Tutkimusasema | 📊 Taulukon tieto | choice, numeric, place | rank, cell, most, diff | transfer | all(1) | – | launch1-2026-11-01 | task_context_coverage_seed | nykyinen generaattori-inventaario |
| `M-DATA-04` | Yksinkertaisen taulukon laatiminen | 1-2 | Aarresaaristo / Tutkimusasema | 🧾 Taulukon tekijä | place, choice, numeric | total, fromTally, fromList, header | transfer | all(1) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-SYM-PLUS` | Plusmerkin merkityksen ymmärtäminen | 1-2 | Rantaretki / Merkkipaja | ➕ Plusmerkki | choice, build | write, picToSign, story, meaning | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-SYM-MINUS` | Miinusmerkin merkityksen ymmärtäminen | 1-2 | Rantaretki / Merkkipaja | ➖ Miinusmerkki | choice, build | write, picToSign, story, meaning | transfer | all(1) | – | review1-2026-10-29 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-SYM-EQUAL` | Yhtäsuuruusmerkin merkityksen ymmärtäminen | 1-2 | Rantaretki / Merkkipaja | 🟰 Tasapainokivi | choice, balance | level, trueFalse, fillLeft, plates | transfer | all(1) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-ARITH-01` | Merkkien +, − ja = perusmerkitys | 1-2 | Rantaretki / Merkkipaja | 🔣 Merkkien kieli | choice, build | write, missingSign, story, trueFalse | transfer | all(3) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-MUL-02` | Kertolaskutilanteen kirjoittaminen kertolaskulausekkeeksi | 1-2 | Rantaretki / Kertopaja | 📝 Kertolaskuksi | choice, build | write, sum, picture, story | transfer | all(2) | – | audit1-2026-10-28 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-EXPR-01` | Useita laskutoimituksia sisältävän lausekkeen tulkitseminen | 3-6 | Aarresaaristo / Laivaveistämö | 📜 Laskujärjestys | numeric, place, choice | sub, mulFirst, paren, steps | transfer | all(1) | dyn: requires_operation_knowledge_for_operations_present_in_item | audit1-2026-10-28 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `SCI-ENV-TOOL-01` | Yksinkertaisen tutkimus- tai mittausvälineen käyttäminen | 1-2 | Aarresaaristo / Tutkimusasema | 🔧 Välinevaja | numeric, choice, sort | pick, tool, use, read, tare | transfer | – | turvaohje: SCI-ENV-SAFE-01 | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-PLACE-04` | Satojen, tuhansien ja suurempien lukuyksiköiden paikka-arvo | 3-6 | Aarresaaristo / Laivaveistämö | 💰 Torin kassa | choice, place | till, value, compose, compare | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-PLACE-05` | Luonnollisen luvun hajottaminen lukuyksiköihin | 3-6 | Aarresaaristo / Laivaveistämö | 🧱 Lukujen purku | numeric, choice, place | split, expand, missing, regroup | transfer | all(1) | – | review2-2026-10-29 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-NEG-01` | Negatiivisen luvun käsitteen ymmärtäminen | 3-6 | Aarresaaristo / Jäälahti | 🌡️ Pakkasaamu | choice, place | order, thermo, colder, meaning | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-WRADD` | Kirjallinen yhteenlaskualgoritmi | 3-6 | Aarresaaristo / Laivaveistämö | 🧮 Allekkain yhteen | choice, numeric | where, column, ones, check, step | transfer | all(2) | – | review2-2026-10-29 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-WRDIV` | Lukuyksiköittäin jakaminen | 3-6 | Aarresaaristo / Kertomajakka | ➗ Jako paikoittain | numeric, choice, multi | step, exch, byPlace, exchange, check | transfer | all(3) | – | audit1-2026-10-28 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-WRMUL` | Kirjallinen kertolaskualgoritmi | 3-6 | Aarresaaristo / Kertomajakka | ✖️ Allekkain kertominen | numeric, choice, place | step, partial, parts, column, check | transfer | all(2) | – | audit1-2026-10-28 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-WRSUB` | Kirjallinen vähennyslaskualgoritmi | 3-6 | Aarresaaristo / Laivaveistämö | 🔻 Allekkain vähennys | choice, numeric, multi | needs, column, flip, check, step | transfer | all(2) | – | audit1-2026-10-28 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-NEG-02` | Negatiivisten kokonaislukujen sijoittaminen lukusuoralle | 3-6 | Aarresaaristo / Jäälahti | ❄️ Jään lukusuora | choice, line, place | sort, place, read, order | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-NEG-03` | Negatiivisten kokonaislukujen vertaaminen ja järjestäminen | 3-6 | Aarresaaristo / Jäälahti | 🥶 Kylmin aamu | place, choice | symbol, bigger, order, colder | transfer | all(2) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-FRAC-02` | Murtoluku yhtä suurten osien lukumäärän kuvaajana | 3-6 | Aarresaaristo / Piirakkajuhla | 🍰 Murtoluku | choice, place | build, name, trap, shade | transfer | all(1) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-DEC-01` | Kymmenesosan ymmärtäminen paikka-arvona | 3-6 | Aarresaaristo / Helmisimpukka | 🦪 Kymmenesosat | place, line, choice | over, bar, names, line | transfer | all(1) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-FRAC-06` | Samansuuruisten murtolukujen tunnistaminen | 3-6 | Aarresaaristo / Piirakkajuhla | 🟰 Yhtä isot palat | choice, numeric, sort | family, same, pick, missing | transfer | all(1) | – | audit1-2026-10-28 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-DEC-02` | Sadasosan ymmärtäminen paikka-arvona | 3-6 | Aarresaaristo / Helmisimpukka | 💯 Sadasosat | choice, multi, numeric | same, grid, digit, equal | transfer | all(1) | – | launch1-2026-11-01 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-FRAC-03` | Osoittajan ja nimittäjän merkitys | 3-6 | Aarresaaristo / Piirakkajuhla | ✂️ Osoittaja ja nimittäjä | choice, place | order, meaning, unit, same | transfer | all(1) | käyttää: M-FRAC-05, M-FRAC-11 | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-FRAC-08` | Murtoluvun supistaminen | 3-6 | Aarresaaristo / Piirakkajuhla | 🔽 Supistus | choice, place | reduce, simplify, factor, simplest | transfer | all(1) | – | audit1-2026-10-28 | task_context_coverage_seed | nykyinen generaattori-inventaario |
| `M-DEC-03` | Tuhannesosan ymmärtäminen paikka-arvona | 3-6 | Aarresaaristo / Helmisimpukka | 📐 Tuhannesosat | choice, place | write, mm, digit, mmPair | transfer | all(1) | – | review1-2026-10-29 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-FRAC-05` | Samannimisten murtolukujen vertaaminen | 3-6 | Aarresaaristo / Piirakkajuhla | 🥧 Palavertailu | choice, place, sort | half, pick, symbol, order | transfer | all(1) | – | audit1-2026-10-28 | task_context_coverage_seed | nykyinen generaattori-inventaario |
| `M-FRAC-11` | Samannimisten murtolukujen yhteenlasku | 3-6 | Aarresaaristo / Piirakkajuhla | ➕ Palat yhteen | numeric, choice, place | sums, add, picture, missing | transfer | all(2) | käyttää: M-FRAC-12 | audit1-2026-10-28 | task_context_coverage_seed | nykyinen generaattori-inventaario |
| `M-FRAC-12` | Samannimisten murtolukujen vähennyslasku | 3-6 | Aarresaaristo / Piirakkajuhla | ➖ Palat pois | numeric, choice, place | diffs, sub, picture, whole | transfer | all(2) | – | audit1-2026-10-28 | activity_context_use | nykyinen generaattori-inventaario |
| `M79-RECIP-01` | Käänteisluvun käsite | 7-9 | Lampilaboratorio / Yhtälöt ja verrannot | 🔄 Käänteisluku | numeric, choice, sort | pairs, pick, missing, whole | transfer | all(1) | – | audit1-2026-10-28 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M-DEC-DECOMPOSE` | Desimaaliluvun hajottaminen lukuyksiköihin | 3-6 | Aarresaaristo / Helmisimpukka | 🧩 Pura osiin | choice, numeric, place | parts, missing, pick, compose | transfer | all(3) | – | launch1-2026-11-01 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-DEC-READ` | Desimaaliluvun lukeminen | 3-6 | Aarresaaristo / Helmisimpukka | 🗣️ Lue desimaaliluku | choice, sort | fromWords, tenths, hundredths, unit | transfer | all(3) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-DEC-WRITE` | Desimaaliluvun kirjoittaminen | 3-6 | Aarresaaristo / Helmisimpukka | ✏️ Kirjoita desimaaliluku | numeric, place | teens, tenths, hundredths, build | transfer | all(3) | – | review1-2026-10-29 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-FRAC-15` | Murtoluvun kertominen luonnollisella luvulla | 3-6 | Aarresaaristo / Piirakkajuhla | 🏭 Piirakkatehdas | numeric, choice, place | line, repeat, count, whole | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-DEC-04` | Desimaaliluvun lukeminen, kirjoittaminen ja hajottaminen lukuyksiköihin | 3-6 | Aarresaaristo / Helmisimpukka | 🧩 Sama määrä eri esityksissä | place | repair, words, numeral | transfer | all(3) | – | launch1-2026-11-01 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-ALG-04` | Tuntemattoman suureen tai puuttuvan luvun käsitteen ymmärtäminen | 3-6 | Aarresaaristo / Vaakasaari | 👜 Arvoituspussi | multi, place, choice | same, meaning, known, match | transfer | – | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-DEC-08` | Desimaaliluvun kertominen luonnollisella luvulla | 3-6 | Aarresaaristo / Helmisimpukka | ✖️ Helmikertolasku | numeric, place, choice | repeated, whole, tens, shift | transfer | all(2) | – | audit1-2026-10-28 | task_context_coverage_seed | nykyinen generaattori-inventaario |
| `M-DEC-09` | Desimaaliluvun jakaminen luonnollisella luvulla | 3-6 | Aarresaaristo / Helmisimpukka | ➗ Helmijako | choice, numeric, place | steps, share, tens, money | transfer | all(2) | – | audit1-2026-10-28 | task_context_coverage_seed | nykyinen generaattori-inventaario |
| `M-DEC-ADD` | Desimaalilukujen yhteenlasku | 3-6 | Aarresaaristo / Helmisimpukka | ➕ Helmien yhteenlasku | choice, sort, numeric | sub, tenths, mixed, detective | transfer | all(3) | – | audit1-2026-10-28 | task_context_coverage_seed | nykyinen generaattori-inventaario |
| `M-ALG-05` | Yhtäsuuruusmerkin ymmärtäminen kahden yhtä suuren arvon suhteena | 3-6 | Aarresaaristo / Vaakasaari | ⚖️ Tasapainolauta | choice, numeric, place | level, both, truth, balance | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-VAR-UNKNOWN` | Muuttujan ymmärtäminen tuntemattomana lukuna | 7-9 | Lampilaboratorio / Kirjainpaja | 🔤 Kirjain on luku | numeric, choice, sort | sort, solve, meaning, tags, bags | transfer | all(1) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M79-VAR-VARYING` | Muuttujan ymmärtäminen muuttuvana suureena | 7-9 | Lampilaboratorio / Kirjainpaja | 📈 Muuttuva määrä | numeric, choice, place | grow, step, fill, which | transfer | all(1) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-ALG-06` | Yhtälön tunnistaminen yhtäsuuruudeksi, jossa on tuntematon | 3-6 | Aarresaaristo / Vaakasaari | 🔍 Yhtälön tunnistaja | choice, sort | check, which, fromBalance, spot | transfer | all(2) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-VAR-01` | Muuttujan käsite muuttuvana tai tuntemattomana lukuna | 7-9 | Lampilaboratorio / Kirjainpaja | 🧭 Tuntematon vai muuttuja? | numeric, choice, sort | roles, classify, same, can | transfer | all(2) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-ALG-07` | Ehdotetun ratkaisun testaaminen yhtälössä | 3-6 | Aarresaaristo / Vaakasaari | 🧪 Kokeile ja tarkista | choice, sort | steer, test, which, balance | transfer | all(1) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M79-EXPR-EVAL` | Lausekkeen arvon laskeminen muuttujan arvolla | 7-9 | Lampilaboratorio / Kirjainpaja | 🧷 Sijoita ja laske | numeric, choice, place | match, linear, paren, neg | transfer | all(1) | – | audit1-2026-10-28 | task_context_coverage_seed | nykyinen generaattori-inventaario |
| `M79-EXPR-FORM` | Lausekkeen muodostaminen sanallisesta tilanteesta | 7-9 | Lampilaboratorio / Kirjainpaja | 🖊️ Kirjoita lauseke | choice, build, place | translate, words, price, shape, build | transfer | all(1) | käyttää: M-GMEAS-01 | review2-2026-10-29 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-ALG-08` | Yksinkertaisen yhtälön ratkaiseminen päättelemällä | 3-6 | Aarresaaristo / Vaakasaari | 🧠 Päättele puuttuva | numeric, place | undo, add, mul, sub | transfer | all(1) any(2) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-UNIT-01` | Metrijärjestelmän kymmenkantaisen rakenteen ymmärtäminen | 3-6 | Aarresaaristo / Saaren tori | 🪜 Yksikkörappuset | choice, place | build, prefix, steps, other | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-EQ1-FORM` | Ensimmäisen asteen yhtälön muodostaminen tilanteesta | 7-9 | Lampilaboratorio / Kirjainpaja | 📝 Tilanteesta yhtälöksi | choice, build, place | parts, shop, age, balance, build | transfer | all(2) | käyttää: M-GMEAS-01 | review2-2026-10-29 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M-UNIT-02` | Yleisimpien pituusyksiköiden muuntaminen | 3-6 | Aarresaaristo / Saaren tori | 🪵 Lankkukauppa | numeric, sort, place | match, m-cm-0, km-m-2, cm-m-3, sense, mm-cm-4, cm-mm-1 | transfer | all(2) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-UNIT-03` | Yleisimpien massayksiköiden muuntaminen | 3-6 | Aarresaaristo / Saaren tori | 🌾 Jauhopussit | numeric, sort, place | match, kg-g-0, t-kg-1, g-kg-2, kg-g-3, sense | transfer | all(2) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-UNIT-04` | Yleisimpien vetomittojen tai tilavuusyksiköiden muuntaminen | 3-6 | Aarresaaristo / Saaren tori | 🧃 Mehuasema | numeric, sort, place | match, l-dl-0, dl-ml-2, dl-l-3, sense, l-cl-4, l-ml-1 | transfer | all(2) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-UNIT-05` | Aikayksiköiden muuntaminen | 3-6 | Aarresaaristo / Saaren tori | ⛴️ Lauttaaikataulu | numeric, place, choice | hhmm, hmin, mins, mixed, back, day | transfer | all(1) | dyn: requires_multiplication_or_division_according_to_conversion_direction; käyttää: M-TIME-02 | review1-2026-10-29 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-SPEED-UNIT` | Nopeuden yksikön johtaminen matkan ja ajan yksiköistä | 7-9 | Lampilaboratorio / Liike ja nopeus | 📎 Nopeuden yksikkö | choice, place | kmh, sim, ms, meaning, factory | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-DATA-09` | Tiedon järjestelmällinen kerääminen | 3-6 | Aarresaaristo / Tutkimusasema | 🗂️ Järjestelmällinen tutkija | choice, place | compare, method, fix, order, steps | transfer | all(1) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-DATA-10` | Havaintoaineiston järjestäminen taulukoksi | 3-6 | Aarresaaristo / Tutkimusasema | 🗃️ Taulukon kokoaja | numeric, choice, place | fill, listToTable, cell, shape | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-COORD-READ-Q1` | Pisteen koordinaattien lukeminen koordinaatiston I neljänneksessä | 3-6 | Aarresaaristo / Aarresaari | 🗺️ Aarrekartta | choice, place | label, read, whichPin, axis | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-COORD-PLOT-Q1` | Annettujen koordinaattien mukaisen pisteen merkitseminen I neljännekseen | 3-6 | Aarresaaristo / Aarresaari | 📍 Kätke aarre | plot | fromShip, plot, onAxis, story | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-COORD-01` | Pisteen lukeminen ja merkitseminen koordinaatiston I neljänneksessä | 3-6 | Aarresaaristo / Aarresaari | 🏝️ Saaren rakentaja | choice, plot | build, corner, readPoly, move | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M-COORD-02` | Koordinaatiston kaikkien neljännesten käyttäminen | 3-6 | Aarresaaristo / Jäälahti | 🧭 Koko meren kartta | choice, plot, sort | sortQ, plot, read, quadrant | transfer | all(2) | käyttää: M-SYM-01 | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `SCI-ENV-MEAS-01` | Mittauksen tekeminen tarkoituksenmukaisella välineellä | 3-6 | Aarresaaristo / Tutkimusasema | 🎯 Tarkka mittaaja | choice, numeric, place | fit, toolUnit, unit, repeat, scale | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `SCI-ENV-DATA-01` | Mittausten ja havaintojen kokoaminen aineistoksi | 3-6 | Rantaretki / Havaintovihko | 📊 Havaintoaineisto | choice, place | total, fill, table, most | transfer | all(1) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-DATA-01` | Mittaustulosten kokoaminen taulukkoon | 7-9 | Lampilaboratorio / Mittausdata ja kuvaajat | 🗒️ Mittaustaulukko | numeric, choice, place | header, sim, table, fill | transfer | all(1) | käyttää: M-DATA-05 | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-FRAC-MUL` | Murtoluvun kertominen murtoluvulla | 7-9 | Lampilaboratorio / Yhtälöt ja verrannot | 🧁 Reseptin pienennys | choice, place | match, area, calc, half | transfer | all(2) | käyttää: M-FRAC-08 | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-FRAC-DIV` | Murtoluvun jakaminen murtoluvulla | 7-9 | Lampilaboratorio / Yhtälöt ja verrannot | 🥤 Montako mahtuu? | choice, sort, numeric, frac | calc, groups, fracFrac, rule, bigger, grow | transfer | all(2) | – | review2-2026-10-29 | canonical_ancestor_of_task_context_seed | nykyinen generaattori-inventaario |
| `M79-DEC-DIV` | Desimaalilukujen jakolaskun syventäminen | 7-9 | Lampilaboratorio / Yhtälöt ja verrannot | 🔬 Desimaalijakaja | numeric, choice, place | shift, scale, compute, grows | transfer | all(1) | – | audit1-2026-10-28 | task_context_coverage_seed | nykyinen generaattori-inventaario |
| `M79-PROP-01` | Verrannon rakenteen ymmärtäminen kahden suhteen yhtäsuuruutena | 7-9 | Lampilaboratorio / Yhtälöt ja verrannot | 🔗 Verranto | numeric, sort, choice | check, missing, recipe, taste | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-SPEED-CALC` | Keskinopeuden laskeminen v=s/t | 7-9 | Lampilaboratorio / Liike ja nopeus | 🧮 Laske nopeus | numeric, place | kmh, sim, ms, slot | transfer | all(1) | käyttää: M-DEC-ADD | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-DEP-01` | Kahden muuttuvan suureen riippuvuuden tunnistaminen | 7-9 | Lampilaboratorio / Funktiot ja suorat | 🔀 Riippuuko? | choice, sort | sort, depends, which, pattern | transfer | – | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-FUNC-01` | Funktion käsite: jokaiselle syötteelle määräytyy arvo | 7-9 | Lampilaboratorio / Funktiot ja suorat | ⚙️ Funktiokone | choice, sort | pairs, run, rule, isFunc | transfer | all(1) | käyttää: M79-EXPR-EVAL | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-FUNC-TABLE` | Funktion esittäminen arvotaulukkona | 7-9 | Lampilaboratorio / Funktiot ja suorat | 🗂️ Arvotaulukko | choice, numeric, place, plot | detect, fill, rule, table | transfer | all(1) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M79-FUNC-GRAPH` | Funktion esittäminen koordinaatistossa | 7-9 | Lampilaboratorio / Funktiot ja suorat | 📈 Funktio kuvaajaksi | numeric, choice, plot, sort | onIt, plot, read, match | transfer | all(2) | – | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-GRAPH-01` | Mittaustulosten esittäminen kuvaajana | 7-9 | Lampilaboratorio / Mittausdata ja kuvaajat | 📈 Pisteet kuvaajaan | numeric, plot, place, choice | pick, sim, plot, rows | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-VT-GRAPH` | Nopeus–aika-kuvaajan tulkitseminen tasaisessa ja muuttuvassa liikkeessä | 7-9 | Lampilaboratorio / Mittausdata ja kuvaajat | 🚀 Nopeus–aika-kuvaaja | choice, place, numeric | steady, sim, rest, accel, decel, phases | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-UNIT-LIN` | Pituusyksiköiden muunnosten varmentaminen ja laajentaminen | 7-9 | Lampilaboratorio / Suureet ja yksiköt | 📐 Desimaalimittari | numeric, place, choice | stairs, mcm, mmm, kmm, cmm | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-UNIT-CONV` | Yksikkömuunnoksen tekeminen ennen fysikaalista laskua | 7-9 | Lampilaboratorio / Suureet ja yksiköt | 🔁 Yksikkömuunnos | numeric, place, choice | match, kmM, minS, hMin, cmM | transfer | all(1) | dyn: requires_quantity_specific_unit_conversion_skill_for_item_instance; käyttää: M-DEC-08, M-DEC-09 | launch1-2026-11-01 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-SPEED-MIXED` | Nopeuslasku sekayksiköillä yksiköt ensin yhtenäistäen | 7-9 | Lampilaboratorio / Liike ja nopeus | ⚖️ Sekayksiköt | numeric, sort, choice | mMin, sim, kmMin, kmh, ready | transfer | all(3) | käyttää: M79-DEC-DIV | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-INT-ORDER` | Kokonaislukujen järjestyksen ymmärtäminen lukusuoralla | 7-9 | Lampilaboratorio / Pakkasloki | 🌡️ Pakkasjärjestys | choice, line, sort | split, compare, sign, order, place | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-INT-DIST` | Kokonaislukujen välisen etäisyyden ymmärtäminen lukusuoralla | 7-9 | Lampilaboratorio / Pakkasloki | 📏 Etäisyys jäällä | numeric, place | pairs, across, same, abs | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-INT-01` | Kokonaislukujen järjestys ja etäisyys lukusuoralla | 7-9 | Lampilaboratorio / Pakkasloki | 🎯 Lukusuoran mestari | numeric, choice, line, place | land, jump, mid, closer | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-INT-ADD` | Kokonaislukujen yhteenlasku | 7-9 | Lampilaboratorio / Pakkasloki | 🐸 Hypyt lukusuoralla | numeric, choice, line, sort | sign, line, negneg, mixed | transfer | all(2) | – | launch1-2026-11-01 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M79-INT-MUL` | Kokonaislukujen kertolasku ja merkkisääntö | 7-9 | Lampilaboratorio / Pakkasloki | ✖️ Merkkisääntö kertolaskussa | choice, numeric, sort | signs, pattern, sign, negneg | transfer | all(2) | – | audit1-2026-10-28 | canonical_required_strong_support | nykyinen generaattori-inventaario |
| `M79-EQ1-SOLVE` | Ensimmäisen asteen yhtälön ratkaiseminen tasapainoperiaatteella | 7-9 | Lampilaboratorio / Yhtälöt ja verrannot | ⚖️ Tasapainoyhtälö | numeric, sort | moves, one, two, both | transfer | all(1) | dyn: requires_arithmetic_operations_present_in_equation_item; käyttää: M79-INT-DIV | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-SPEED-REARR` | Matkan tai ajan ratkaiseminen nopeussuhteesta | 7-9 | Lampilaboratorio / Liike ja nopeus | ↔️ Matka tai aika | numeric, sort | time, sim, dist, which | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-LINE-GRAPH` | Suoran piirtäminen koordinaatistoon yhtälöstä | 7-9 | Lampilaboratorio / Funktiot ja suorat | 📉 Suoran yhtälö | choice, plot, place, numeric | lines, which, intercept, draw | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-SLOPE` | Kulmakertoimen ymmärtäminen muutoksen suhteena | 7-9 | Lampilaboratorio / Funktiot ja suorat | ⛰️ Kulmakerroin | choice, numeric, place | rank, points, table, sign, steeper | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-ST-GRAPH` | Matka–aika-kuvaajan tulkitseminen liikkeen mallina | 7-9 | Lampilaboratorio / Mittausdata ja kuvaajat | 📉 Matka–aika-kuvaaja | choice, place, numeric | flat, sim, steeper, read, story | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-ACCEL-MOTION-GRAPH` | Muuttuvan liikkeen tunnistaminen paikka–aika- tai liikekuvaajasta | 7-9 | Lampilaboratorio / Kiihtyvyys | 〰️ Kaareva kuvaaja | choice, sort | steady, sim, rest, accel, decel, steps | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-ACCEL-VT-GRAPH` | Muuttuvan liikkeen tunnistaminen nopeus–aika-kuvaajasta | 7-9 | Lampilaboratorio / Kiihtyvyys | 📐 Kiihtyvyys kuvaajasta | numeric, place, choice | read, sim, steeper, sign, slopes | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-ACCEL-GRAPH` | Muuttuvan liikkeen tunnistaminen liike- ja nopeuskuvaajista | 7-9 | Lampilaboratorio / Kiihtyvyys | 🔗 Kaksi kuvaajaa | choice, sort | steady, sim, rest, accel, pairs | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `M79-INT-DIV` | Kokonaislukujen jakolasku ja merkkisääntö | 7-9 | Lampilaboratorio / Pakkasloki | ➗ Merkkisääntö jakolaskussa | numeric, choice, place | quot, sign, negneg, check | transfer | all(2) | – | launch1-2026-11-01 | task_context_coverage_seed | nykyinen generaattori-inventaario |
| `M79-INT-SUB` | Kokonaislukujen vähennyslasku | 7-9 | Lampilaboratorio / Pakkasloki | ➖ Muutoksen laskija | numeric, place | rewrite, subNeg, down, change | transfer | all(2) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |
| `PHY79-ACCEL-CALC` | Keskimääräisen kiihtyvyyden laskeminen nopeuden muutoksesta ja ajasta | 7-9 | Lampilaboratorio / Kiihtyvyys | 🧮 Laske kiihtyvyys | numeric, place | moving, sim, rest, build | transfer | all(1) | – | audit1-2026-10-28 | aiempi 107 | nykyinen generaattori-inventaario |

## Oppitunnin osat noodeittain

Jokaisessa oppitunnissa on lisäksi: itsenäinen tarkistus (3 peräkkäin oikein vähintään kahdesta perheestä + siirtotehtävä, tai pikatarkistus 2 oikein), uusintaharjoitus "Harjoittele lisää" (5 uutta tehtävää), "Myöhemmin" ja paluu kartalle. Väärä vastaus näyttää aina oikean päättelyn; kahden peräkkäisen virheen jälkeen tarjotaan apua, tukiretkeä tai myöhemmin-valintaa.

| KC | Tavoite (lapselle) | Apu ja esimerkki | Väärän vastauksen selitys | Seuraus maailmassa |
| --- | --- | --- | --- | --- |
| `M-GEO-01` | Opit erottamaan litteät tasokuviot ja tilaa vievät kappaleet. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kappaleilla on paksuus, ja niitä voi pidellä. Litteät kuviot ovat kuin piirroksia paperill…") | Erotat litteät kuviot ja kappaleet! Luvun löytö: 🧩 lajittelulaatikko |
| `M-REP-04` | Opit kirjoittamaan tilanteen lyhyesti numeroilla ja merkeillä. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "6 − 1 = 5.") | Kirjoitat tilanteita merkkikielellä! Luvun löytö: 🚩 merkkiviiri |
| `M-TH-08` | Opit huomaamaan, että kaksi opittua asiaa kertovat samasta asiasta. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3 riviä, joissa 3: 3 × 3 = 9.") | Löydät yhteydet: yksi asia, monta esitystapaa! Luvun löytö: 💡 majakan valo |
| `SCI-ENV-SAFE-01` | Opit tunnistamaan turvallisen tavan toimia tutkimuksessa. Oikeita välineitä käytetään aina aikuisen kanssa. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Turvallista: odotan luvan ennen aloittamista, kerron aikuiselle, kun jotain sattuu, kuunte…") | Tunnistat turvalliset toimintatavat. Muista: oikeassa tutkimuksessa aikuinen on aina mukana. Luvun löytö: 📓 havaintovihko |
| `M-GEO-04` | Opit tunnistamaan kolmion, neliön, suorakulmion ja ympyrän, vaikka ne olisivat käännettyinä. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Neliössä on neljä kulmaa.") | Tunnistat tasokuviot, käännettyinäkin! Luvun löytö: 🧩 lajittelulaatikko |
| `M-NUM-1TO1` | Opit antamaan jokaiselle esineelle täsmälleen yhden laskusanan. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Yksi esine sai kaksi sanaa. Loikka sanoi viisi, mutta niitä on neljä.") | Jokainen esine sai yhden merkin. Hienoa tarkkaa laskemista! Luvun löytö: 🎵 laskuloru-pilli |
| `M-SYM-01` | Opit tunnistamaan, onko viiva kuvion symmetria-akseli, ja tekemään peilikuvan. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Jokainen vasemman puolen ruutu saa parin yhtä kauas viivan oikealle puolelle samalle rivil…") | Tunnistat symmetrian ja teet peilikuvia! Luvun löytö: 🗺️ aarrekartan pala |
| `M-NUM-STABLE-ORDER` | Opit sanomaan lukusanat aina samassa järjestyksessä: yksi, kaksi, kolme… | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Loru menee näin: yksi, kaksi, kolme, neljä, viisi.") | Loikan laskuloru toimii! Nyt voidaan laskea retkitavarat. Luvun löytö: 🎵 laskuloru-pilli |
| `M-NUM-WORD-NUMERAL` | Opit yhdistämään lukusanan ja sen numeron, esimerkiksi viisi ja 5. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 35 %:ssa | 100 % (esim. "1 on yksi, 8 on kahdeksan, 9 on yhdeksän.") | Tunnet numerot nimeltä! Luvun löytö: 🎵 laskuloru-pilli |
| `M-TH-01` | Opit huomaamaan, mikä on samaa ja mikä erilaista. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Koko on eri: pieni punainen neliö ja iso punainen neliö.") | Huomaat pienetkin erot! Luvun löytö: 📏 oma mittanauha |
| `M-TH-02` | Opit lajittelemaan asioita annetun ominaisuuden mukaan. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Muut ovat siniset. Tämä on eri värinen.") | Lajittelet ohjeen mukaan, vaikka muut ominaisuudet hämäävät! Luvun löytö: 🧩 lajittelulaatikko |
| `M-TH-03` | Opit järjestämään asioita annetun ominaisuuden mukaan. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "27 ja 25 olivat väärin päin. Oikein: 21, 24, 25, 27.") | Järjestät asiat jonoon sääntöä noudattaen! Luvun löytö: 🧩 lajittelulaatikko |
| `M-TH-04` | Opit huomaamaan, miten kuvio toistuu tai kasvaa, ja jatkamaan sitä. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Joka kuvassa tulee 2 pistettä lisää: 5 + 2 = 7.") | Löydät säännön ja jatkat kuviota! Luvun löytö: 🧩 lajittelulaatikko |
| `M-WORK-01` | Opit huomaamaan, mikä tieto on tärkeää laskemisen kannalta ja mikä ei. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Tarvitaan vain simpukkatiedot: 6 − 2 = 4. Kivet ja muut tiedot eivät vaikuta.") | Huomaat tärkeän tiedon ja jätät turhan pois! Luvun löytö: 🧩 lajittelulaatikko |
| `M-MEAS-00` | Opit vertaamaan kahta esinettä suoraan: kumpi on pidempi tai painavampi. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Vaaka on suorassa: kirja ja kirja ovat yhtä painavat.") | Nauhat on verrattu. Viiri valmistuu! Luvun löytö: 📏 oma mittanauha |
| `M-TH-07` | Opit etsimään kaikki vaihtoehdot järjestelmällisesti, ettei mikään jää pois. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Pidä yksi hattu paikallaan ja käy läpi kaikki huivit, sitten seuraava hattu: 6 asua.") | Löydät kaikki vaihtoehdot järjestyksessä! Luvun löytö: 💎 tutkimusaseman aarre |
| `M79-LOGIC-01` | Opit löytämään säännön, joka pätee kaikkiin esimerkkeihin, ei vain ensimmäiseen. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Pätevä sääntö on 3x + 1, kirjoitettiinpa se missä järjestyksessä tahansa. Muut kaatuvat jo…") | Löydät säännön ja testaat sen kaikilla esimerkeillä! Luvun löytö: 📟 yhden arvon mittari |
| `SCI-ENV-OBSERVE-01` | Opit katsomaan tarkasti ja kertomaan, mitä näit. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kuvasta näkyy: Simpukka on oranssi. Simpukassa ei ole raitoja. Muut ovat arvauksia.") | Huomasit tarkasti. Havainto vihkoon! Luvun löytö: 📓 havaintovihko |
| `M-MEAS-02` | Opit, että pituus ei muutu, vaikka nauhaa taivuttaa tai siirtää. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Mutkitteleva polku on pidempi, vaikka päät ovat yhtä kaukana.") | Tiedät, mitä pituus tarkoittaa! Luvun löytö: 📏 oma mittanauha |
| `M-TIME-01` | Opit vertaamaan, kumpi kestää kauemmin. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Kynttilät sammuivat yhtä aikaa: ne paloivat yhtä kauan.") | Huomaat, mikä kestää kauemmin! Luvun löytö: 📏 oma mittanauha |
| `M-NUM-01` | Opit laskemaan esineet niin, ettei yksikään jää laskematta tai tule laskettua kahdesti. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 35 %:ssa | 100 % (esim. "Niitä on kuusi. Ringissä pitää muistaa aloituskohta.") | Kaikki tavarat on laskettu! Luvun löytö: 🎵 laskuloru-pilli |
| `ENV-PHY-MOTION-OBS-01` | Opit päättelemään kuvista, liikkuiko jokin. | 5 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Lehti on samassa kohdassa kiveen nähden.") | Huomaat liikkeen! Luvun löytö: 📓 havaintovihko |
| `M-TIME-03` | Opit, että aikaa mitataan sovituilla yksiköillä, kuten sekunneilla. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 26 %:ssa | 100 % (esim. "Sininen lyhty paloi 5 s ja punainen 2 s. 5 s on pidempi aika.") | Osaat kertoa keston sekunteina! Luvun löytö: 📏 oma mittanauha |
| `M-MEAS-01` | Opit mittaamaan pituuden laskemalla, montako yhtä pitkää palaa siihen mahtuu. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Oikein mitatessa palat ovat samankokoisia, peräkkäin, ilman rakoja ja päällekkäisyyksiä.") | Mittaat kuin oikea mittari! Luvun löytö: 📏 oma mittanauha |
| `M-NUM-02` | Opit, että viimeinen laskusana kertoo, montako esinettä on kaikkiaan. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Lasketaan: yksi, kaksi, kolme. Kun sanot kolme, lopeta.") | Viimeinen sana kertoo määrän. Nyt tiedät sen! Luvun löytö: 🎵 laskuloru-pilli |
| `M-NUM-17` | Opit jakamaan joukon kahteen yhtä suureen osaan. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "5 + 5 = 10, joten puolet luvusta 10 on 5.") | Jaoit reilusti kahtia: puolet kummallekin! Luvun löytö: 🧺 eväskori |
| `ENV-PHY-MOTION-CHANGE-01` | Opit huomaamaan, nopeutuuko vai hidastuuko liike. | 5 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Ankka meni ensin oikealle ja sitten takaisin vasemmalle.") | Näet, miten liike muuttuu! Luvun löytö: 📓 havaintovihko |
| `M-ADD-01` | Opit, että yhteenlasku yhdistää kaksi määrää yhdeksi. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "2 + 1 = 3: kaksi ja yksi yhteen on kolme.") | Kaikki eväät ovat korissa! Luvun löytö: 🧺 eväskori |
| `M-NUM-QTY-NUMERAL` | Opit valitsemaan määrälle oikean numeron. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 68 %:ssa | 100 % (esim. "Numero 4 on neljä: rasiaan neljä simpukkaa.") | Kaikissa rasioissa on oikea lappu. Retkivarusteet ovat valmiina! Luvun löytö: 🎵 laskuloru-pilli |
| `M-NUM-QTY-WORD` | Opit valitsemaan määrälle oikean lukusanan. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 68 %:ssa | 100 % (esim. "Niitä on yhä viisi. Siirtäminen ei muuta määrää.") | Osaat sanoa, montako niitä on! Luvun löytö: 🎵 laskuloru-pilli |
| `ENV-PHY-MOTION-01` | Opit vertaamaan kahden liikkujan liikettä. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Nopeampi ankka ehtii samassa ajassa pidemmälle, joten sen välit ovat pidemmät.") | Olet tarkka liikkeen tarkkailija! Luvun löytö: 📓 havaintovihko |
| `M-NUM-03` | Opit, että sama määrä voidaan näyttää esineinä, numerona ja sanana. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "4 on neljä, ja siihen kuuluu neljä esinettä.") | Esineet, numero ja sana kertovat saman. Olet laskumestari! Luvun löytö: 🎵 laskuloru-pilli |
| `M-NUM-18` | Opit, mistä kahdesta osasta luvut 1–10 voi koota. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "7 = 1 + 6. Toinen osa on 6.") | Tunnet lukujen osat: piilossa olevat simpukat eivät jää arvoitukseksi! Luvun löytö: 🐚 simpukkakaulakoru |
| `PHY79-MOTION-REF` | Opit päättelemään, liikkuuko kappale, katsomalla muuttuuko sen paikka valittuun vertailukohtaan nähden. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Penkki liikkuu matkustajan mukana.") | Valitset aina vertailukohdan! Luvun löytö: ⏱️ kisakello |
| `M-NUM-07` | Opit jatkamaan lukujonoa eteenpäin. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "8, 9, 10, 11, 12: joka kivellä yksi enemmän, myös kymmenen yli.") | Loikka pääsi lammen yli! Luvun löytö: 🪨 hyppykivipolku |
| `M-NUM-08` | Opit jatkamaan lukujonoa taaksepäin. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 75 %:ssa | 100 % (esim. "16, 15, 14, 13.") | Loikka pääsi takaperin takaisin rantaan! Luvun löytö: 🪨 hyppykivipolku |
| `M-NUM-10` | Opit päättelemään, kumpi kahdesta luvusta on suurempi. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 74 %:ssa | 100 % (esim. "44 < 46 < 52. Kympit ensin, sitten ykköset.") | Osaat verrata lukuja: ensin kympit, sitten ykköset! Luvun löytö: 🎵 laskuloru-pilli |
| `M-TIME-02` | Opit lukemaan kellosta tasatunnit ja puolet tunnit: lyhyt viisari näyttää tunnin, pitkä minuutit. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 47 %:ssa | 100 % (esim. "Lyhyt viisari näyttää tunnin, pitkä minuutit.") | Luet kellosta tasat ja puolet! Luvun löytö: 📏 oma mittanauha |
| `M-NUM-14` | Opit, että mittaustuloksen luku kertoo, montako mittapalaa esine on. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Nauha on sama. Isoja paloja tarvittiin vähemmän kuin pieniä.") | Osaat kertoa mittauksen luvulla! Luvun löytö: 📏 oma mittanauha |
| `PHY79-QTY-CONCEPT` | Opit tunnistamaan suureen: ominaisuuden, jonka voi mitata ja ilmaista luvulla ja yksiköllä. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Pituus, massa, aika ja lämpötila ovat tämän mallin suureita. Nimi, suosikkiväri ja tunnus …") | Tunnistat suureet! Luvun löytö: 🧪 kalibroitu mittalasi |
| `PHY79-NUMVALUE` | Opit erottamaan mittaustuloksesta lukuarvon: koko luvun, desimaaliosa mukaan lukien. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Lukuarvot ovat 90 ja 18.") | Löydät lukuarvon mistä tahansa tuloksesta! Luvun löytö: 🧪 kalibroitu mittalasi |
| `PHY79-UNIT-CONCEPT` | Opit, että yksikkö kertoo, mihin mittausta verrattiin, eikä tulos ole valmis ilman sitä. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Uimaveden lämpötila 21 °C, Loikkakisan aika 12 s, Järven pituus 3 km.") | Yksiköt hallussa! Luvun löytö: 🧪 kalibroitu mittalasi |
| `PHY79-QTY-01` | Opit purkamaan mittaustuloksen osiin ja kirjoittamaan sen kokonaisena: suure, lukuarvo ja yksikkö. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Lukuarvo on 0,4.") | Puret jokaisen mittaustuloksen! Luvun löytö: 🧪 kalibroitu mittalasi |
| `PHY79-DIST-TIME` | Opit erottamaan matkan (kuinka pitkälle, m tai km) ja ajan (kuinka kauan, s, min tai h) sekä niiden mittavälineet. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Ajan yksiköitä ovat s, min ja h: 35 s, 1,5 h.") | Erotat matkan ja ajan! Luvun löytö: ⏱️ kisakello |
| `M-NUM-EQUALSTEP-SEQ` | Opit tunnistamaan jonon, jossa hypyt ovat yhtä pitkiä, ja jatkamaan sitä. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "2, 4, 6, 8: joka kerta + 2.") | Löysit hyppyjen säännön! Luvun löytö: 🪨 hyppykivipolku |
| `M-NUM-MULTIPLE-INTRO` | Opit, mihin lukuihin päädyt, kun hyppäät nollasta aina saman verran. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3, 6: 5 jää väliin.") | Tiedät, mihin Loikka osuu! Luvun löytö: 🪨 hyppykivipolku |
| `M-NUM-16` | Opit päättelemään lukujonosta, kuinka pitkiä hypyt ovat. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3, 6, 9, 12: joka kerta + 3.") | Ratkaisit hyppyjen salaisuuden! Luvun löytö: 🪨 hyppykivipolku |
| `M-MUL-01` | Opit, että kertolasku tarkoittaa monta yhtä suurta ryhmää. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Oikeassa kuvassa jokaisessa pussissa on 3.") | Pussit on pakattu tasan! Luvun löytö: 🧺 eväskori |
| `M-MULTAB-LOW` | Opit kertotaulut 1, 2, 3, 4, 5 ja 10. | 5 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3 riviä, joissa 3: 3 × 3 = 9.") | Kertotaulut 1–5 ja 10 ovat hallussa! Luvun löytö: 🪵 lautan hirsikansi |
| `M-DIV-02` | Opit selvittämään, montako yhtä suurta ryhmää määrästä saa. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3 + 3 = 6. Tarvitaan 2 pussia.") | Pussit riittivät juuri sopivasti! Luvun löytö: 🧺 eväskori |
| `M-MULTAB-HIGH` | Opit kertotaulut 6–9 helpompien taulujen avulla: 9 × 7 = 10 × 7 − 7 ja 6 × 7 = 5 × 7 + 7. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "7 × 4 = 5 × 4 + 2 × 4 = 20 + 8 = 28.") | Osaat isot kertotaulut ja niiden temput! Luvun löytö: 💡 majakan valo |
| `M-MULTAB-ALL` | Opit kaikki kertotaulut 1–10 sujuvasti ja osaat päätellä puuttuvan tekijän. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Yksi 7 vähemmän: 28 − 7 = 21.") | Kertotaulut sujuvat ja osaat päätellä naapureita! Luvun löytö: 💡 majakan valo |
| `M-MULTREL-01` | Opit vertaamaan määriä: kolme kertaa niin paljon. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Aavan torni (2) mahtuu Loikan torniin (4) 2 kertaa.") | Loikan torni on valmis! Luvun löytö: 🧺 eväskori |
| `PHY79-SPEED-CONCEPT` | Opit vertaamaan nopeuksia: sama matka lyhyemmässä ajassa tai pidempi matka samassa ajassa on nopeampi, ja yleisesti nopeus on metrejä sekunnissa. | 5 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Nopeus on matka jaettuna ajalla: A 20 m / 4 s = 5 m/s, B 30 m / 4 s = 7,5 m/s.") | Ymmärrät, mitä nopeus tarkoittaa! Luvun löytö: ⏱️ kisakello |
| `PHY79-ACCEL-CONCEPT` | Opit, että kiihtyvyys kertoo, kuinka paljon nopeus muuttuu joka sekunti – ja että myös jarrutus on kiihtyvyyttä. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "2 m/s² = nopeus muuttuu 2 m/s sekunnissa.") | Ymmärrät kiihtyvyyden! Luvun löytö: 🏆 loikkakisan pokaali |
| `SCI-ENV-PRESENT-DATA-01` | Opit valitsemaan kuvan, joka näyttää havainnot oikein. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Simpukka kuuluu paikan niitty alle.") | Loikka ymmärsi kuvasta kaiken! Luvun löytö: 📓 havaintovihko |
| `SCI-ENV-RECORD-DATA-01` | Opit merkitsemään havainnot muistiin, ettei mitään unohdu. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "kallio: kivi, niitty: simpukka.") | Havainnot ovat tallessa vihkossa! Luvun löytö: 📓 havaintovihko |
| `SCI-ENV-RECORD-01` | Opit kirjaamaan koko retken havainnot ja näyttämään ne muille. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Oikealla sivulla jokainen havainto on oman paikkansa alla oikea määrä.") | Retkivihko on valmis! Luvun löytö: 📓 havaintovihko |
| `M-NUM-06` | Opit, että nolla tarkoittaa: ei yhtään. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Kaikki kaksi syötiin, joten jäi nolla.") | Nolla on luku: se tarkoittaa, ettei ole yhtään! Luvun löytö: 🎵 laskuloru-pilli |
| `M-PLACE-01` | Opit niputtamaan kymmenen ykköstä yhdeksi kymppinipuksi. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "10 + 10 + 10 = 30. Nippuja on 3.") | Kymmenen yksittäistä on yksi kymppi! Luvun löytö: 🛶 kaislalautta |
| `M-PLACE-02` | Opit, että luvun ensimmäinen numero kertoo kympit ja viimeinen ykköset. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "2 on ykkösten paikalla: 2 irtokaislaa.") | Luvun numerot kertovat niput ja irtokaislat! Luvun löytö: 🛶 kaislalautta |
| `M-PLACE-03` | Opit kokoamaan ja purkamaan luvun kymppeihin ja ykkösiin. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "31 = 20 + 11: 2 nippua ja 11 irtokaislaa.") | Lautta on valmis! Osaat koota ja purkaa lukuja. Luvun löytö: 🛶 kaislalautta |
| `M-MENTAL-01` | Opit hajottamaan luvun niin, että laskeminen helpottuu. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "64 − 4 = 60, sitten vielä 1 pois: 59.") | Jaat luvut fiksusti: päässälasku helpottuu! Luvun löytö: 🛶 kaislalautta |
| `M-SUB-01` | Opit, että vähennyslasku kertoo, montako jää, kun osa otetaan pois. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "7 − 2 = 5: 6, 5.") | Osaat vähentää: pois otettu ei enää ole mukana! Luvun löytö: 🚩 merkkiviiri |
| `M-ADD-SUB-01` | Opit, että vähennyslasku purkaa yhteenlaskun ja päinvastoin. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "7 − 3 = 4 ja 7 − 4 = 3 kuuluvat molemmat perheeseen.") | Tunnet lukuperheet: yhdestä laskusta saat kolme muuta! Luvun löytö: 🐚 simpukkakaulakoru |
| `M-ADD-FACT-10` | Opit yhteenlaskut kymmeneen asti nopeasti ja varmasti. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "5 + 2 = 7: 6, 7.") | Pienet plussalaskut sujuvat: niillä rakennat isommat! Luvun löytö: 🐚 simpukkakaulakoru |
| `M-DIV-01` | Opit jakamaan määrän reilusti: jokainen saa yhtä monta. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "4 jaettuna 2 poikaselle: kukin saa 2, koska 2 + 2 = 4.") | Jako meni reilusti: kaikki saivat yhtä monta! Luvun löytö: 🧺 eväskori |
| `M-SUB-FACT-10` | Opit vähennyslaskut kymmeneen asti ajattelemalla yhteenlaskua. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3 + 4 = 7, joten 7 − 3 = 4.") | Pienet miinuslaskut sujuvat: ajattelet yhteenlaskua! Luvun löytö: 🐚 simpukkakaulakoru |
| `M-ADD-FACT-01` | Opit valitsemaan plussan tai miinuksen ja laskemaan sen varmasti. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "4 + 1 = 5. Sen voi laskea myös: 5 − 4 = 1.") | Plussat ja miinukset sujuvat sekaisinkin! Luvun löytö: 🐚 simpukkakaulakoru |
| `M-DIVIS-01` | Opit, mitä jaollinen tarkoittaa: luku jakautuu tasan ilman jakojäännöstä. Opit myös luvuilla 2, 5 ja 10 jaollisuuden tunnusmerkit. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "19 : 4 = 4, jakojäännös 3.") | Tunnistat jaollisuuden ja sen merkit! Luvun löytö: 💡 majakan valo |
| `M-MULDIV-01` | Opit, että jakolasku purkaa kertolaskun. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Pusseja tuli 2: 6 : 3 = 2, koska 2 × 3 = 6.") | Tunnet kerto- ja jakolaskun perheet! Luvun löytö: 🪵 lautan hirsikansi |
| `M-ADD-20` | Opit yhteenlaskut 20:een asti täydentämällä ensin kymppiin. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "7 + 4 = 7 + 3 + 1 = 10 + 1 = 11.") | Hyppäät kympin yli varmasti! Luvun löytö: 🐚 simpukkakaulakoru |
| `M-DIV-FACT-01` | Opit laskemaan helppoja jakolaskuja kertotaulun avulla. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Jokainen sai 2: 6 : 3 = 2, koska 3 × 2 = 6.") | Jakolaskut ratkeavat kertotaululla! Luvun löytö: 🪵 lautan hirsikansi |
| `M-FRAC-01` | Opit jakamaan kokonaisen yhtä suuriin osiin. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Reiluissa jaoissa palat peittäisivät toisensa täsmälleen, muissa jokin pala on isompi.") | Osaat jakaa reilusti yhtä suuriin osiin! Luvun löytö: 🥧 mustikkapiirakka |
| `M-SUB-20` | Opit vähennyslaskut 20:een asti menemällä ensin kymppiin. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "13 − 4 = 13 − 3 − 1 = 10 − 1 = 9.") | Laskeudut kympin ali varmasti! Luvun löytö: 🐚 simpukkakaulakoru |
| `M-ADD-100` | Opit yhteenlaskut sataan asti: kympit kymppeihin, ykköset ykkösiin. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "23 + 39 = 62: 6 nippua ja 2 irtokaislaa.") | Lasket yhteen sataan asti! Luvun löytö: 🛶 kaislalautta |
| `M-SUB-100` | Opit vähennyslaskut sataan asti ja purat kympin, kun ykköset eivät riitä. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "43 + 18 = 61. Vastaus on oikein.") | Vähennät sataan asti ja osaat purkaa kympin! Luvun löytö: 🛶 kaislalautta |
| `M-GEO-02` | Opit käyttämään sanoja vasen, oikea, ylä, ala ja välissä. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Vasemmalta oikealle: meritähti, kivi, kukka. Marja ei kuulu hyllyyn.") | Osaat kertoa tarkasti, missä jokin on! Luvun löytö: 🗺️ aarrekartan pala |
| `M-MEAS-03` | Opit mittaamaan senttimetreinä ja metreinä. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kohdasta 0 kohtaan 3 on 3 väliä: 3 cm.") | Osaat valita metrin tai sentin ja lukea viivoitinta! Luvun löytö: 📏 oma mittanauha |
| `M-MEAS-04` | Opit mittaamaan pituuden toistamalla samaa yksikköä alusta loppuun ja kertomaan tuloksen luvulla ja yksiköllä. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Pienempiä paloja tarvitaan enemmän: 4 pientä palaa. Siksi tulokseen kirjoitetaan aina myös…") | Mittaat pituuden yksiköllä, alusta loppuun! Luvun löytö: 📏 oma mittanauha |
| `M-GMEAS-01` | Opit, että piiri on kuvion reunaviivan koko pituus, ja lasket sen sivujen pituuksista. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Piiri on reunaviiva, joka kiertää koko kuvion.") | Tiedät, mitä piiri tarkoittaa, ja lasket sen! Luvun löytö: ⛵ pieni purjevene |
| `M-MEAS-05` | Opit vertaamaan vaa’alla, kumpi on painavampi. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Painavin on A. Se painui alas kummankin muun paketin kanssa.") | Osaat lukea vaakaa: painavampi painuu alas! Luvun löytö: 🫐 marjarasia |
| `M-MEAS-06` | Opit valitsemaan, punnitaanko grammoina vai kilogrammoina. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 75 %:ssa | 100 % (esim. "200 g = 100 g + 100 g.") | Kilo on tuhat grammaa: osaat punnita kuin kauppias! Luvun löytö: 🫐 marjarasia |
| `M-MEAS-08` | Opit vertaamaan, mihin astiaan mahtuu eniten. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kannu on isompi: siihen mahtuu enemmän.") | Osaat vertailla, mihin mahtuu enemmän! Luvun löytö: 🫐 marjarasia |
| `M-MEAS-09` | Opit valitsemaan, mitataanko litroina vai desilitroina. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "1 l = 10 dl.") | Litrassa on kymmenen desiä: mehukauppa pyörii! Luvun löytö: 🫐 marjarasia |
| `M-DATA-01` | Opit keräämään annetuista korteista kaikki sovittuun aiheeseen kuuluvat havainnot. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. ""Miten tulit tänään kouluun?" kysyy juuri sitä, mitä halutaan tietää.") | Keräsit sovittuun aiheeseen kuuluvat havaintokortit! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-DATA-02` | Opit merkitsemään havainnot muistiin yksi kerrallaan, esimerkiksi viivoilla. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "kala: havaintoja 4, viivoja 3. Yksi puuttuu.") | Merkitset havainnot tarkasti ja korjaat virheet! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-DATA-03` | Opit lukemaan taulukon rivejä ja sarakkeita. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "sammakko ma: 3 · sammakko ti: 7 · lokki ma: 9") | Osaat lukea taulukkoa riveittäin ja sarakkeittain! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-DATA-05` | Opit lukemaan taulukosta: etsi oikea rivi ja oikea sarake. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "etana: 2 · sorsa: 8 · lokki: 6") | Löydät taulukosta kysytyn tiedon! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-DATA-04` | Opit tekemään taulukon: jokaiselle asialle oma rivi. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Keruuvihon etana-rivillä on 3. Sama määrä kuuluu taulukon samalle riville. Vapaaehtoinen t…") | Teit selkeän taulukon! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-SYM-PLUS` | Opit, että plusmerkki tarkoittaa: tulee lisää. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "2 + 3: alussa 2, ja tuli lisää 3.") | Plus tarkoittaa: lisää tai yhdessä! Luvun löytö: 🚩 merkkiviiri |
| `M-SYM-MINUS` | Opit, että miinusmerkki tarkoittaa: otetaan pois. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "4 − 3: alussa 4, ja 3 otettiin pois.") | Miinus tarkoittaa: pois tai vähemmän! Luvun löytö: 🚩 merkkiviiri |
| `M-SYM-EQUAL` | Opit, että yhtä suuri -merkki tarkoittaa: molemmilla puolilla on yhtä paljon. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3 + 1 = 2 + 2. Molemmilla puolilla on 4.") | Merkki = tarkoittaa: molemmilla puolilla on yhtä paljon! Luvun löytö: 🚩 merkkiviiri |
| `M-ARITH-01` | Opit kirjoittamaan laskulauseen merkeillä +, − ja =. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "5 + 3 = 8.") | Osaat kirjoittaa laskun merkeillä! Luvun löytö: 🚩 merkkiviiri |
| `M-MUL-02` | Opit kirjoittamaan yhtä suurten ryhmien tilanteen kertolaskuksi. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "4 + 4 + 4 = 3 × 4 = 12.") | Kirjoitat ryhmät lyhyesti kertolaskuna! Luvun löytö: 🪵 lautan hirsikansi |
| `M-EXPR-01` | Opit laskujärjestyksen: ensin sulut, sitten kerto- ja jakolaskut, viimeisenä yhteen- ja vähennyslaskut. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kertolasku ensin: 3 × 2 = 6. Sitten 16 − 6 = 10.") | Lasket pitkät lausekkeet oikeassa järjestyksessä! Luvun löytö: ⛵ pieni purjevene |
| `SCI-ENV-TOOL-01` | Opit valitsemaan oikean välineen mittaukseen. Oikeita välineitä käytetään aikuisen kanssa. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Pituus viivottimella, massa vaa’alla ja lämpötila lämpömittarilla.") | Osaat valita sopivan mittausvälineen ja lukea sen lukeman kuvasta. Oikeaa välinettä käytetään aikuisen kanssa. Luvun löytö: 💎 tutkimusaseman aarre |
| `M-PLACE-04` | Opit, mitä sadat ja tuhannet tarkoittavat luvussa. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "8 tuhannet, 0 sadat, 1 kymmenet, 9 ykköset: 8019.") | Kassa täsmää: osaat isojen lukujen paikka-arvon! Luvun löytö: ⛵ pieni purjevene |
| `M-PLACE-05` | Opit purkamaan luvun tuhansiin, satoihin, kymppeihin ja ykkösiin, ja kokoamaan sen takaisin. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3094 = 3000 + 0 + 90 + 4.") | Purat ja kokoat lukuja, nollat paikoillaan! Luvun löytö: ⛵ pieni purjevene |
| `M-NEG-01` | Opit, että nollan alapuolella on negatiivisia lukuja. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kylmimmästä lämpimimpään: −7 °C, −1 °C, 5 °C.") | Osaat lukea pakkasasteita: miinus tarkoittaa nollan alapuolta! Luvun löytö: ⛸️ luistimet |
| `M-WRADD` | Opit laskemaan yhteen allekkain: ensin ykköset, sitten kymmenet, ja muistinumero mukaan. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kymppien summa oli yli 10, joten sadat-sarakkeeseen olisi pitänyt lisätä muistinumero 1. O…") | Laskit summat itse ja tunnistit, mihin muistinumero kuuluu! Luvun löytö: ⛵ pieni purjevene |
| `M-WRDIV` | Opit jakamaan luvun osa kerrallaan: ensin sadat, sitten kymmenet, sitten ykköset. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "5 kymppiä : 4 = 1, ja 1 kymppiä jää. Ne vaihdetaan ykkösiksi: 16 ykköstä : 4 = 4. Vastaus …") | Jaat isoja lukuja paikka kerrallaan ja vaihdat ylijäämän! Luvun löytö: 💡 majakan valo |
| `M-WRMUL` | Opit kertomaan moninumeroisen luvun yksinumeroisella: osa kerrallaan tai allekkain. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "5 × 3 = 15, ja muistista 2: 17. Kymppien paikalle 7. Koko tulo 175.") | Kerrot isoja lukuja osa kerrallaan! Luvun löytö: 💡 majakan valo |
| `M-WRSUB` | Opit vähentämään allekkain. Kun ylempi numero on pienempi, vaihdetaan kymppi kymmeneksi ykköseksi. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Vaihto tarvitaan: kymmenet. 554 − 160 = 394.") | Vähennät allekkain ja vaihdat oikein! Luvun löytö: ⛵ pieni purjevene |
| `M-NEG-02` | Opit sijoittamaan negatiiviset luvut lukusuoralle nollan vasemmalle puolelle. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Vasemmalta oikealle: −7 < −3 < −2 < 6.") | Osaat sijoittaa negatiiviset luvut lukusuoralle! Luvun löytö: ⛸️ luistimet |
| `M-NEG-03` | Opit vertaamaan ja järjestämään negatiivisia lukuja: lukusuoralla oikealla on aina suurempi. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "−5 = −5.") | Vertaat negatiivisia lukuja varmasti! Luvun löytö: ⛸️ luistimet |
| `M-FRAC-02` | Opit, että murtoluku kertoo, kuinka suuri osa kokonaisesta otettiin. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "1/5: 1 väritettyä 5:stä osasta. 4 jäi yli: se on värittämättömien määrä.") | Osaat nimetä palat murtoluvuilla! Luvun löytö: 🥧 mustikkapiirakka |
| `M-DEC-01` | Opit, että kokonainen voidaan jakaa kymmeneen osaan ja yksi osa on 0,1. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Yksi kokonainen ja 4 kymmenesosaa: 1,4.") | Tunnet kymmenesosat: 0,1 on yksi kymmenestä osasta! Luvun löytö: 🫧 helmipussi |
| `M-FRAC-06` | Opit tunnistamaan, milloin kaksi murtolukua ovat yhtä suuria, vaikka niissä on eri luvut. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Yhtä suuria kuin 1/3: 4/12, 3/9. Muut syntyivät lisäämällä tai kertomalla vain toisen luvu…") | Tunnistat samansuuruiset murtoluvut! Luvun löytö: 🥧 mustikkapiirakka |
| `M-DEC-02` | Opit sadasosat: kun kokonainen jaetaan sataan osaan, yksi osa on 0,01. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "0,4 = 0,40: 4 saraketta, joissa kussakin 10 ruutua, on 40 sadasosaa.") | Tunnet sadasosat ja tiedät, että 0,3 = 0,30! Luvun löytö: 🫧 helmipussi |
| `M-FRAC-03` | Opit, mitä murtoluvun osoittaja ja nimittäjä kertovat. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "1/3 > 1/6 > 1/8.") | Osaat lukea murtoluvun kumpaakin lukua! Luvun löytö: 🥧 mustikkapiirakka |
| `M-FRAC-08` | Opit supistamaan murtoluvun: jaetaan osoittaja ja nimittäjä samalla luvulla. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "12/16 = 3/4, 6/15 = 2/5, 2/6 = 1/3. Ylimääräinen kortti syntyy vähentämällä tai jakamalla …") | Supistat murtolukuja! Luvun löytö: 🥧 mustikkapiirakka |
| `M-DEC-03` | Opit tuhannesosat: kolmas numero pilkun jälkeen. Millimetri on tuhannesosa metristä. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Tuhannesosat ovat kolmannella paikalla pilkun jälkeen: 0,004.") | Tunnet tuhannesosat ja muunnat millimetrit metreiksi! Luvun löytö: 🫧 helmipussi |
| `M-FRAC-05` | Opit vertaamaan murtolukuja, joilla on sama nimittäjä: palat ovat samankokoisia, joten enemmän paloja on enemmän. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Puolet = 4/8. 1/8 alle, 3/8 alle, 6/8 yli, 7/8 yli.") | Vertaat samannimisiä murtolukuja! Luvun löytö: 🥧 mustikkapiirakka |
| `M-FRAC-11` | Opit laskemaan yhteen murtolukuja, joilla on sama nimittäjä: palat lasketaan yhteen, palan koko pysyy. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "5/8 + 1/8 = 6/8, 4/8 + 3/8 = 7/8, 1/8 + 2/8 = 3/8. 6/16 syntyy, jos nimittäjätkin lasketaa…") | Lasket samannimisiä murtolukuja yhteen! Luvun löytö: 🥧 mustikkapiirakka |
| `M-FRAC-12` | Opit vähentämään murtolukuja, joilla on sama nimittäjä: palat vähennetään, palan koko pysyy. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "8/8 − 3/8 = 5/8, 8/8 − 2/8 = 6/8, 3/8 − 1/8 = 2/8. 11/8 on harhautus: se syntyy, jos palat…") | Vähennät samannimisiä murtolukuja! Luvun löytö: 🥧 mustikkapiirakka |
| `M79-RECIP-01` | Opit, että luvun ja sen käänteisluvun tulo on yksi: 3/5 ja 5/3 ovat toistensa käänteislukuja. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Käänteislukujen tulo on aina yksi. Vastalukujen summa on nolla, se on eri asia.") | Tunnet käänteisluvut ja tiedät, että niiden tulo on yksi! Luvun löytö: 🔬 laboratorion vaaka |
| `M-DEC-DECOMPOSE` | Opit purkamaan desimaaliluvun kokonaisiin, kymmenesosiin ja sadasosiin. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "4,26 = 4 + 0,2 + 0,06.") | Purat desimaaliluvut osiin ja kokoat ne takaisin! Luvun löytö: 🫧 helmipussi |
| `M-DEC-READ` | Opit lukemaan desimaaliluvun ääneen niin, että kuulija tietää osien koon. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Sadasosat ovat toisella paikalla pilkun jälkeen. Kymmenesosia ei ole, joten ensin tulee no…") | Luet desimaaliluvut oikein! Luvun löytö: 🫧 helmipussi |
| `M-DEC-WRITE` | Opit kirjoittamaan desimaaliluvun, kun kuulet tai luet sen sanoina. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "25 sadasosaa = 0,25. Yhteensä 4,25.") | Kirjoitat desimaaliluvut oikein, nollat oikeille paikoille! Luvun löytö: 🫧 helmipussi |
| `M-FRAC-15` | Opit kertomaan murtoluvun kokonaisluvulla: monta samanlaista palaa yhteen. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3 × 2/3 = 6/3, 4 × 1/5 = 4/5, 3 × 1/4 = 3/4. 6/9 syntyy, jos nimittäjäkin kerrotaan.") | Tehdas toimii: osaat kertoa murtoluvun! Luvun löytö: 🥧 mustikkapiirakka |
| `M-DEC-04` | Opit yhdistämään saman desimaalimäärän lukukortin, sanallisen kuvauksen ja lukuyksiköt annetuista korteista. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "1,09 tarkoittaa yksi kokonainen, nolla kymmenesosaa, yhdeksän sadasosaa. Nämä lukuyksiköt …") | Yhdistit saman määrän eri esitykset! Luvun löytö: 🫧 helmipussi |
| `M-ALG-04` | Opit erottamaan annetun luvun siitä määrästä tai luvusta, jota ei vielä tiedetä. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Samaa muuttumatonta sisältöä tarkoittava ruutu viittaa samaan lukumäärään. Tiedon puuttumi…") | Erotat annetun tiedon tuntemattomasta määrästä! Luvun löytö: 🎒 vaakasaaren pussi |
| `M-DEC-08` | Opit kertomaan desimaaliluvun kokonaisluvulla sekä luvuilla 10, 100 ja 1000. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "2 × 0,4 m = 0,8 m.") | Kerrot desimaalilukuja ja siirrät pilkkua oikein! Luvun löytö: 🫧 helmipussi |
| `M-DEC-09` | Opit jakamaan desimaaliluvun kokonaisluvulla sekä luvuilla 10, 100 ja 1000. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "6 : 4 = 1,5.") | Jaat desimaalilukuja tasan ja siirrät pilkkua oikein! Luvun löytö: 🫧 helmipussi |
| `M-DEC-ADD` | Opit laskemaan desimaalilukuja yhteen ja vähentämään niitä: samat osat kohdakkain. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "5,0 − 3,9 = 1,1. Tarkistus: 1,1 + 3,9 = 5,0.") | Lasket desimaaliluvut yhteen ja vähennät, pilkut kohdakkain! Luvun löytö: 🫧 helmipussi |
| `M-ALG-05` | Opit, että yhtä suuri -merkin molemmilla puolilla on yhtä paljon. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "5 + 3 = 4 + 4, 9 + 4 = 7 + 6, 9 + 6 = 14 + 1. 8 on "vastaus tähän" -virhe.") | Ymmärrät yhtäsuuruusmerkin kuin vaaka! Luvun löytö: 🎒 vaakasaaren pussi |
| `M79-VAR-UNKNOWN` | Opit, että kirjain yhtälössä tarkoittaa tiettyä lukua, jota ei vielä tiedetä, ei esinettä. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kirjain tarkoittaa aina lukua: hintaa, pituutta, määrää tai aikaa. Ei itse esinettä.") | Tiedät, että kirjain on luku, jonka voi päätellä! Luvun löytö: ✏️ Sulkan kynä |
| `M79-VAR-VARYING` | Opit, että kirjain voi kertoa määrän, joka muuttuu: kun n kasvaa, myös lausekkeen arvo muuttuu. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "n = 1: 3, n = 3: 9, n = 6: 18. Kun n kasvaa yhdellä, arvo kasvaa 3.") | Ymmärrät, miten lausekkeen arvo muuttuu, kun muuttuja muuttuu! Luvun löytö: ✏️ Sulkan kynä |
| `M-ALG-06` | Opit tunnistamaan yhtälön: siinä on yhtä suuri -merkki ja tuntematon. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "5 + 5 = 10. Pitäisi olla 8: ei ratkaisu.") | Tunnistat yhtälön ja sen ratkaisun! Luvun löytö: 🎒 vaakasaaren pussi |
| `M79-VAR-01` | Opit erottamaan, onko kirjain yksi tuntematon luku vai muuttuva määrä. Sama kirjain tarkoittaa samassa lausekkeessa samaa lukua. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Yhtälössä kirjain on yksi luku, joka voidaan ratkaista. Säännössä kirjain voi saada monta …") | Tunnistat kirjaimen roolin ja tiedät, että sama kirjain on sama luku! Luvun löytö: ✏️ Sulkan kynä |
| `M-ALG-07` | Opit testaamaan, ratkaiseeko luku yhtälön: sijoita luku ja katso, ovatko puolet yhtä suuret. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "2 + 5 = 7, 1 + 5 = 6, 7 + 5 = 12, 4 + 5 = 9. Ratkaisu on 4.") | Testaat ehdotuksia ja tiedät, milloin luku on ratkaisu! Luvun löytö: 🎒 vaakasaaren pussi |
| `M79-EXPR-EVAL` | Opit laskemaan lausekkeen arvon, kun muuttujan tilalle sijoitetaan luku. Muista: 3x tarkoittaa 3 · x. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3x + 1 = 13, 3(x + 1) = 15, x + 3 = 7.") | Sijoitat lukuja lausekkeisiin ja lasket oikein! Luvun löytö: ✏️ Sulkan kynä |
| `M79-EXPR-FORM` | Opit kirjoittamaan lausekkeen sanallisesta tilanteesta. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3n + 2, 3(n + 2), n − 2. 2 − n olisi luvusta 2 vähennetty n.") | Kirjoitat lausekkeita tilanteista! Luvun löytö: ✏️ Sulkan kynä |
| `M-ALG-08` | Opit ratkaisemaan yksinkertaisen yhtälön päättelemällä käänteisen laskun avulla. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "× 9 ↔ : 9, : 4 ↔ × 4, + 5 ↔ − 5.") | Ratkaiset yhtälöitä päättelemällä! Luvun löytö: 🎒 vaakasaaren pussi |
| `M-UNIT-01` | Opit, että pituusyksiköt ovat portaat, joissa jokainen askel on kymmenkertainen. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "kg > g > mg.") | Rappuset ovat hallussa: kilo, desi, sentti ja milli! Luvun löytö: ⚖️ torivaaka |
| `M79-EQ1-FORM` | Opit muodostamaan yhtälön tilanteesta: tuntematon kirjaimeksi ja kaksi yhtä suurta asiaa yhtäsuuruusmerkin eri puolille. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3x + 6 = 12.") | Muodostat yhtälöitä tilanteista! Luvun löytö: ✏️ Sulkan kynä |
| `M-UNIT-02` | Opit muuntamaan metrejä, senttimetrejä ja millimetrejä toisikseen. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "400 cm = 4 m, 4 km = 4000 m, 280 mm = 28 cm. 0,4 m jäi yli.") | Osaat muuntaa pituuksia! Luvun löytö: ⚖️ torivaaka |
| `M-UNIT-03` | Opit muuntamaan kilogrammoja ja grammoja toisikseen. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "9000 g = 9 kg, 2 kg = 2000 g, 4 kg = 4000 g. 0,9 kg jäi yli.") | Osaat muuntaa massoja! Luvun löytö: ⚖️ torivaaka |
| `M-UNIT-04` | Opit muuntamaan litroja ja desilitroja toisikseen. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "40 dl = 4 l, 4 dl = 400 ml, 5 l = 500 cl. 0,4 l jäi yli.") | Osaat muuntaa tilavuuksia! Luvun löytö: ⚖️ torivaaka |
| `M-UNIT-05` | Opit muuntamaan tunteja, minuutteja ja sekunteja: tunnissa on 60 minuuttia. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "70 min = 1 h 10 min, 105 min = 1 h 45 min, 150 min = 2 h 30 min. 1 h 75 min on ansa: 105 m…") | Ehdit lautalle! Osaat muuntaa aikoja. Luvun löytö: ⚖️ torivaaka |
| `PHY79-SPEED-UNIT` | Opit muodostamaan nopeuden yksikön: matkan yksikkö jaettuna ajan yksiköllä, esim. m/s, km/h tai cm/min. | 5 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "v = s / t, joten yksikkö on km/h.") | Johdat nopeuden yksikön! Luvun löytö: ⏱️ kisakello |
| `M-DATA-09` | Opit keräämään tietoa aina samalla tavalla, jotta tulokset ovat vertailukelpoisia. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kestot olivat 10 ja 30 minuuttia. Nämä jaksot eivät osoita koko päivien käyntimääriä.") | Tunnistit järjestelmällisen keruun suunnitelman! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-DATA-10` | Opit järjestämään havaintolistan taulukoksi. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "🐦 ma: 0 · 🐦 ti: 3 · 🐸 ma: 2 · 🐸 ti: 4") | Järjestit havainnot selkeäksi taulukoksi! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-COORD-READ-Q1` | Opit lukemaan pisteen paikan ruudukosta kahdella luvulla. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "A (3, 1), B (4, 5), C (6, 3). Kortti (1, 3) on väärin päin.") | Osaat lukea aarrekarttaa! Luvun löytö: 🗺️ aarrekartan pala |
| `M-COORD-PLOT-Q1` | Opit merkitsemään pisteen ruudukkoon, kun sen luvut annetaan. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "x: 1 + 3 = 4, y: 0 + 6 = 6. Aarre on kohdassa (4, 6).") | Aarteet on kätketty juuri oikeisiin paikkoihin! Luvun löytö: 🗺️ aarrekartan pala |
| `M-COORD-01` | Opit sekä lukemaan että merkitsemään pisteitä koordinaatistoon. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kulmat: (1, 0), (5, 0), (5, 6), (1, 6). Vasemmilla kulmilla x on 1, oikeilla 5. Alakulmill…") | Saari on rakennettu tarkasti! Luvun löytö: 🗺️ aarrekartan pala |
| `M-COORD-02` | Opit käyttämään koordinaatistoa myös negatiivisilla luvuilla. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "(−3, 4) → II, (−3, 1) → II, (3, −2) → IV, (−1, −4) → III, (5, 1) → I.") | Hallitset koko kartan, kaikki neljä neljännestä! Luvun löytö: ⛸️ luistimet |
| `SCI-ENV-MEAS-01` | Opit valitsemaan mittaukseen sopivan välineen ja yksikön. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "🐜 muurahaisen pituus: mm · 🏫 luokan pituus: m · 🛶 matka naapurisaarelle: km") | Luet mittauksen tarkasti kuvasta: nollakohta ja asteikko ovat hallussa! Luvun löytö: 💎 tutkimusaseman aarre |
| `SCI-ENV-DATA-01` | Opit kokoamaan monen päivän havainnot yhteen. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Havaintomerkintöjen annettu yhteismäärä on 6. Vapaaehtoinen tarkistus: 2 + 1 + 3 = 6. Se e…") | Havainnot on koottu aineistoksi! Luvun löytö: 📓 havaintovihko |
| `PHY79-DATA-01` | Opit kirjaamaan mittaukset taulukkoon: otsikkoon suure, tunnus ja yksikkö, jokainen mittaus omalle rivilleen. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Aika sekunteina, matka metreinä: aika t (s), matka s (m).") | Taulukko on selkeä ja oikein! Luvun löytö: 📈 tulostaulu |
| `M79-FRAC-MUL` | Opit kertomaan murtoluvun murtoluvulla: a/b · c/d on osa osasta, ja sen saa kertomalla osoittajat ja nimittäjät keskenään. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "2/3 · 1/2 = 2/6, 2/3 · 2/4 = 4/12, 1/2 · 1/4 = 1/8.") | Osaat ottaa osan osasta! Luvun löytö: 🔬 laboratorion vaaka |
| `M79-FRAC-DIV` | Opit jakamaan murtoluvulla: jakolasku kysyy, montako osaa mahtuu. Jakaminen murtoluvulla on kertomista käänteisluvulla. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kerrotaan käänteisluvulla: 1/4 · 5/4 = 5/16.") | Jaat murtoluvuilla ja tiedät, miksi tulos voi kasvaa! Luvun löytö: 🔬 laboratorion vaaka |
| `M79-DEC-DIV` | Opit jakamaan desimaaliluvulla: kerro jaettava ja jakaja samalla luvulla, niin jakajasta tulee kokonaisluku. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "1,5 : 0,3 = 15 : 3, 3,6 : 0,4 = 36 : 4, 5,4 : 0,6 = 54 : 6.") | Jaat desimaaliluvuilla ja tiedät, että tulos voi kasvaa! Luvun löytö: 🔬 laboratorion vaaka |
| `M79-PROP-01` | Opit, että verrannossa molemmat jäsenet kerrotaan samalla luvulla, ja ratkaiset puuttuvan jäsenen. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "3 · 13 = 39, 4 · 9 = 36: eri suuret.") | Ratkaiset verrantoja! Luvun löytö: 🔬 laboratorion vaaka |
| `PHY79-SPEED-CALC` | Opit laskemaan keskinopeuden kaavalla v = s / t: koko matka jaetaan koko ajalla, tauot mukaan lukien. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "v = 120 km / 3 h = 40 km/h.") | Lasket keskinopeuden! Luvun löytö: ⏱️ kisakello |
| `M79-DEP-01` | Opit tutkimaan, miten kaksi suuretta liittyvät toisiinsa annetussa tilanteessa. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Näissä annetuissa tilanteissa verrataan toisiinsa liittyviä suureita. Tarkastele sovittua …") | Tunnistat riippuvuuden! Luvun löytö: 📟 yhden arvon mittari |
| `M79-FUNC-01` | Opit tunnistamaan funktion: jokaiselle sallitulle syötteelle kuuluu täsmälleen yksi arvo. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Funktio: yksi syöte → yksi arvo. Sama arvo saa toistua, mutta sama syöte ei saa antaa kaht…") | Ymmärrät funktion koneena! Luvun löytö: 📟 yhden arvon mittari |
| `M79-FUNC-TABLE` | Opit tekemään funktiolle arvotaulukon: jokaiselle x:lle lasketaan y sääntöä käyttäen. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Sääntö on y = 3x + 2, joten x = 5 antaa 17.") | Teet arvotaulukoita ja tunnistat säännön taulukosta! Luvun löytö: 📟 yhden arvon mittari |
| `M79-FUNC-GRAPH` | Opit piirtämään funktion kuvaajan arvotaulukosta ja lukemaan kuvaajalta y:n arvon. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Piste on kuvaajalla täsmälleen silloin, kun sen koordinaatit toteuttavat säännön.") | Piirrät funktion kuvaajan! Luvun löytö: 📟 yhden arvon mittari |
| `PHY79-GRAPH-01` | Opit siirtämään mittaustaulukon pisteiksi kuvaajaan: aika vaaka-akselille, matka pystyakselille. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Pisteet (2, 15), (4, 20), (6, 25).") | Kuvaaja on valmis! Luvun löytö: 📈 tulostaulu |
| `PHY79-VT-GRAPH` | Opit lukemaan nopeus–aika-kuvaajasta, kasvaako, pysyykö vai pieneneekö nopeus, ja mikä nopeus on tiettynä hetkenä. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Nopeus pysyy 10 m/s: tasainen liike.") | Luet nopeus–aika-kuvaajaa! Luvun löytö: 📈 tulostaulu |
| `M79-UNIT-LIN` | Opit muuntamaan pituusyksiköitä desimaaliluvuilla: askel yksikköportaissa siirtää pilkkua yhden paikan. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "m → km: : 1000, m → cm: · 100, mm → cm: : 10.") | Muunnat pituuksia desimaaleilla! Luvun löytö: 🧪 kalibroitu mittalasi |
| `PHY79-UNIT-CONV` | Opit muuntamaan yksiköitä annetulla kertoimella: isosta pieneen kerrotaan, pienestä isoon jaetaan. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "250 cm = 2,5 m, 1,5 h = 90 min, 0,5 km = 500 m.") | Muunnat yksiköt varmasti! Luvun löytö: 🧪 kalibroitu mittalasi |
| `PHY79-SPEED-MIXED` | Opit muuntamaan matkan ja ajan sopiviin yksiköihin ennen nopeuden laskemista sekä vaihtamaan m/s ja km/h kertoimella 3,6. | 6 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "4 min = 240 s. v = 480 m / 240 s = 2 m/s.") | Yksiköt ensin, sitten lasku. Hienoa! Luvun löytö: ⏱️ kisakello |
| `M79-INT-ORDER` | Opit vertaamaan ja järjestämään negatiivisia ja positiivisia kokonaislukuja lukusuoran avulla: oikealla on aina suurempi. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Pienempiä: −12, −5. Suurempia: 0, −2, 4.") | Järjestät kokonaisluvut varmasti! Luvun löytö: 🌡️ pakkasmittari |
| `M79-INT-DIST` | Opit laskemaan kahden kokonaisluvun etäisyyden lukusuoralla ja luvun itseisarvon: etäisyys on askelten määrä, ei koskaan negatiivinen. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Lappu 3 jää yli: se tulisi, jos lukujen −4 ja 7 numerot vähennettäisiin toisistaan.") | Mittaat etäisyyksiä lukusuoralla! Luvun löytö: 🌡️ pakkasmittari |
| `M79-INT-01` | Opit hyppimään lukusuoralla nollan yli, etsimään kahden luvun puolivälin ja päättelemään, kumpi luku on lähempänä. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Lappu −2 jää yli: siinä ensimmäisen hypyn tuloksen etumerkki on väärin.") | Lukusuora on hallussasi! Luvun löytö: 🌡️ pakkasmittari |
| `M79-INT-ADD` | Opit laskemaan yhteen negatiivisia lukuja lukusuoran avulla: positiivinen luku vie oikealle, negatiivinen vasemmalle. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Etumerkki tulee siltä, jonka itseisarvo on suurempi. Kaksi negatiivista antaa aina negatii…") | Lasket kokonaislukuja yhteen varmasti! Luvun löytö: 🌡️ pakkasmittari |
| `M79-INT-MUL` | Opit kertomaan kokonaislukuja: eri merkkiset tekijät antavat negatiivisen tulon, samanmerkkiset positiivisen. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Parillinen määrä negatiivisia tekijöitä antaa positiivisen tulon, pariton negatiivisen.") | Osaat merkkisäännön ja ymmärrät, mistä se tulee! Luvun löytö: 🌡️ pakkasmittari |
| `M79-EQ1-SOLVE` | Opit ratkaisemaan yhtälön tasapainoperiaatteella: sama muutos molemmille puolille, ensin vakio pois, sitten jako kertoimella. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Yhtälö säilyy tosena, kun molemmille puolille tehdään sama lisäys, vähennys, kerto tai jak…") | Ratkaiset yhtälöitä tasapainoperiaatteella! Luvun löytö: 🔬 laboratorion vaaka |
| `PHY79-SPEED-REARR` | Opit laskemaan matkan (s = v · t) tai ajan (t = s / v), kun nopeus tunnetaan. | 5 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "t = s / v = 12 m / 2 m/s = 6 s.") | Käännät nopeuden kaavan! Luvun löytö: ⏱️ kisakello |
| `M79-LINE-GRAPH` | Opit lukemaan suoran yhtälöstä y = kx + b, missä suora leikkaa y-akselin (b) ja miten jyrkästi se nousee tai laskee (k). | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "y = 2x + 1, y = 2x − 2 ja y = −2x + 1. Yhtälössä y = x + 2 k ja b ovat vaihtaneet paikkaa.") | Yhdistät suoran yhtälön ja kuvaajan! Luvun löytö: 📟 yhden arvon mittari |
| `M79-SLOPE` | Opit laskemaan kulmakertoimen kahdesta pisteestä k = Δy / Δx ja tulkitsemaan sen merkin ja suuruuden. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kulmakertoimet: −3, 2, −1. Negatiivinen k voi olla jyrkkä: vain suuruus ratkaisee.") | Ymmärrät kulmakertoimen muutoksen suhteena! Luvun löytö: 📟 yhden arvon mittari |
| `PHY79-ST-GRAPH` | Opit lukemaan matka–aika-kuvaajasta, kuka liikkuu nopeammin, milloin kappale lepää ja kuinka suuri nopeus on. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Matka kasvoi 2 s:n kohdalla olleesta 10 m:stä 26 m:iin.") | Luet matka–aika-kuvaajaa! Luvun löytö: 📈 tulostaulu |
| `PHY79-ACCEL-MOTION-GRAPH` | Opit tunnistamaan matka–aika-kuvaajasta, kasvaako vai pieneneekö nopeus: jyrkkenevä kaari = nopeus kasvaa, loivenevä kaari = nopeus pienenee. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Suora: matka kasvaa joka sekunti yhtä paljon.") | Tunnistat muuttuvan liikkeen matka–aika-kuvaajasta! Luvun löytö: 🏆 loikkakisan pokaali |
| `PHY79-ACCEL-VT-GRAPH` | Opit lukemaan kiihtyvyyden nopeus–aika-kuvaajasta: viivan jyrkkyys = nopeuden muutos jaettuna ajalla. Nouseva viiva → a > 0, vaakasuora → a = 0, laskeva → a < 0. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "10 s aikana nopeus kasvaa 5 → 15 m/s eli 10 m/s: a = 10 m/s / 10 s = 1 m/s².") | Luet kiihtyvyyden kuvaajasta! Luvun löytö: 🏆 loikkakisan pokaali |
| `PHY79-ACCEL-GRAPH` | Opit yhdistämään saman liikkeen matka–aika- ja nopeus–aika-kuvaajan: vaakasuora s–t ↔ v = 0, suora s–t ↔ vaakasuora v–t, jyrkkenevä s–t ↔ nouseva v–t, loivenevä s–t ↔ laskeva v–t. | 4 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Matka kasvaa tasaisesti → nopeus pysyy samana.") | Yhdistät liikkeen kuvaajat. Laboratorio on valmis! Luvun löytö: 🏆 loikkakisan pokaali |
| `M79-INT-DIV` | Opit jakamaan kokonaislukuja: merkkisääntö on sama kuin kertolaskussa, koska jakolasku tarkistetaan kertolaskulla. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Lappu 6 jää yli: siinä ensimmäisen jakolaskun etumerkki on väärin.") | Jaat kokonaislukuja ja tarkistat merkin kertolaskulla! Luvun löytö: 🌡️ pakkasmittari |
| `M79-INT-SUB` | Opit vähentämään kokonaislukuja: muutos on loppu − alku, ja negatiivisen luvun vähentäminen on sama kuin vastaluvun lisääminen. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Lappu ”5 + (−3)” jää yli: siinä vastaluku jäi ottamatta, joten se olisi sama kuin 5 − 3.") | Vähennät kokonaislukuja myös miinuksen puolella! Luvun löytö: 🌡️ pakkasmittari |
| `PHY79-ACCEL-CALC` | Opit laskemaan kiihtyvyyden: nopeuden muutos jaettuna ajalla, a = (v_loppu − v_alku) / t – myös jarrutuksessa, jolloin tulos on negatiivinen. | 5 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "a = (10 − 6) m/s / 4 s = 1 m/s².") | Lasket kiihtyvyyden! Luvun löytö: 🏆 loikkakisan pokaali |

Rajoitukset: rivit on poimittu nykyisistä generaattoreista. Tämä ei ole kaikkien kokemusten käsin pelaamista tai pedagoginen hyväksyntä. Nykyiset erilliset ohjelmisto-, sisältö- ja ihmisarviot ovat docs/releases/launch/review-ledger.json-tiedostossa (repon juuresta). Historiallinen QA säilyy omassa lähdesidonnassaan. 181 oppituntiluonnoksen saman KC:n reitti on toteutettu; reitti ei yksin todista pedagogista yhteensopivuutta.

## Lisäykset ja niiden perusteet (74)

Jokainen lisäys tulee manifestin pakollisten/vahvojen suhteiden sulkeumasta. Todiste = ketju aiemmasta noodista lisättyyn.

| Lisätty | Tyyppi | Peruste | Todisteketju |
| --- | --- | --- | --- |
| `M-ADD-100` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-ADD` → `M-WRADD` → `M-ADD-100` |
| `M-ADD-20` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-ADD` → `M-WRADD` → `M-ADD-100` → `M-ADD-20` |
| `M-ADD-FACT-01` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-ADD` → `M-WRADD` → `M-ADD-100` → `M-ADD-20` → `M-ADD-FACT-01` |
| `M-ADD-FACT-10` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-ADD` → `M-WRADD` → `M-ADD-100` → `M-ADD-20` → `M-ADD-FACT-01` → `M-ADD-FACT-10` |
| `M-ADD-SUB-01` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-EQ1-SOLVE` → `M-ALG-08` → `M-ADD-SUB-01` |
| `M-ALG-07` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-EQ1-SOLVE` → `M-ALG-08` → `M-ALG-07` |
| `M-ALG-08` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-EQ1-SOLVE` → `M-ALG-08` |
| `M-DATA-02` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-DATA-03` → `M-DATA-02` |
| `M-DATA-05` | task_context_coverage_seed | The learner must locate a time row and read its distance from a table. Table-reading is also exercised by SCI-ENV-DATA-01 most/total families. | `M-DATA-05` |
| `M-DEC-01` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-UNIT-01` → `M-DEC-04` → `M-DEC-DECOMPOSE` → `M-DEC-01` |
| `M-DEC-02` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-UNIT-01` → `M-DEC-04` → `M-DEC-DECOMPOSE` → `M-DEC-02` |
| `M-DEC-03` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-UNIT-01` → `M-DEC-04` → `M-DEC-DECOMPOSE` → `M-DEC-03` |
| `M-DEC-04` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-UNIT-01` → `M-DEC-04` |
| `M-DEC-08` | task_context_coverage_seed | Generated decimal quantities are multiplied by a natural-number conversion factor. Reading the decimal or receiving the factor alone does not cover the multiplication. | `M-DEC-08` |
| `M-DEC-09` | task_context_coverage_seed | The task divides a quantity by a natural-number conversion factor and requires a decimal quotient. Related decimal division occurs in the selected length-conversion lessons. | `M-DEC-09` |
| `M-DEC-ADD` | task_context_coverage_seed | The existing average-speed transfer combines 0.5 hours of travel and 0.5 hours stopped before computing speed over total elapsed time. | `M-DEC-ADD` |
| `M-DEC-DECOMPOSE` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-UNIT-01` → `M-DEC-04` → `M-DEC-DECOMPOSE` |
| `M-DEC-READ` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-UNIT-01` → `M-DEC-04` → `M-DEC-READ` |
| `M-DEC-WRITE` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-UNIT-01` → `M-DEC-04` → `M-DEC-WRITE` |
| `M-DIV-FACT-01` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M79-EXPR-EVAL` → `M-EXPR-01` → `M-DIV-FACT-01` |
| `M-DIVIS-01` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-FRAC-08` → `M-DIVIS-01` |
| `M-EXPR-01` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M79-EXPR-EVAL` → `M-EXPR-01` |
| `M-FRAC-05` | task_context_coverage_seed | The notation lesson also asks which of two fractions with the same denominator is larger. Attribute this activity to like-denominator comparison as co-taught content; do not create a reverse canonical prerequisite to the notation KC. | `M-FRAC-05` |
| `M-FRAC-06` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-FRAC-08` → `M-FRAC-06` |
| `M-FRAC-08` | task_context_coverage_seed | The existing demonstration explicitly states that the product can be simplified and shows 6/12 = 1/2. This is demonstration coverage, not a claim that the current answer checker requires reduced fractions. Its required parent M-FRAC-06 enters through canonical closure. | `M-FRAC-08` |
| `M-FRAC-11` | task_context_coverage_seed | The notation lesson transfer adds two shares with the same denominator. This is additional taught/exercised content, not a reason to reverse its canonical dependency on fraction notation. | `M-FRAC-11` |
| `M-GEO-01` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-SYM-01` → `M-GEO-04` → `M-GEO-01` |
| `M-GEO-04` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-SYM-01` → `M-GEO-04` |
| `M-MENTAL-01` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-ADD` → `M-WRADD` → `M-ADD-100` → `M-MENTAL-01` |
| `M-MUL-02` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M79-EXPR-EVAL` → `M-EXPR-01` → `M-MUL-02` |
| `M-MULDIV-01` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-EQ1-SOLVE` → `M-ALG-08` → `M-MULDIV-01` |
| `M-MULTAB-ALL` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-08` → `M-WRMUL` → `M-MULTAB-ALL` |
| `M-MULTAB-HIGH` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-08` → `M-WRMUL` → `M-MULTAB-ALL` → `M-MULTAB-HIGH` |
| `M-MULTAB-LOW` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-08` → `M-WRMUL` → `M-MULTAB-ALL` → `M-MULTAB-LOW` |
| `M-NEG-03` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-INT-DIST` → `M-NEG-03` |
| `M-NUM-08` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-NEG-01` → `M-NUM-08` |
| `M-NUM-10` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-INT-DIST` → `M-NEG-03` → `M-NUM-10` |
| `M-NUM-17` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-DIV-01` → `M-NUM-17` |
| `M-NUM-18` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-PLACE-01` → `M-NUM-18` |
| `M-PLACE-05` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-08` → `M-WRMUL` → `M-PLACE-05` |
| `M-REP-04` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-FRAC-03` → `M-REP-04` |
| `M-SUB-100` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-ADD` → `M-WRSUB` → `M-SUB-100` |
| `M-SUB-20` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-ADD` → `M-WRSUB` → `M-SUB-100` → `M-SUB-20` |
| `M-SUB-FACT-10` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-ADD` → `M-WRADD` → `M-ADD-100` → `M-ADD-20` → `M-ADD-FACT-01` → `M-SUB-FACT-10` |
| `M-SYM-01` | task_context_coverage_seed | The coordinate transfer asks the learner to mark a mirror image across the x- or y-axis, adding reflection symmetry to coordinate reading/plotting. The prompt and feedback introduce the reflection relation. | `M-SYM-01` |
| `M-TH-02` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-DATA-09` → `M-TH-07` → `M-TH-02` |
| `M-TH-03` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-DATA-09` → `M-TH-07` → `M-TH-03` |
| `M-TH-04` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-DEP-01` → `M79-LOGIC-01` → `M-TH-04` |
| `M-TH-07` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-DATA-09` → `M-TH-07` |
| `M-TH-08` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-DEP-01` → `M79-LOGIC-01` → `M-TH-08` |
| `M-WORK-01` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M-DATA-01` → `M-WORK-01` |
| `M-WRADD` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-ADD` → `M-WRADD` |
| `M-WRDIV` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-09` → `M-WRDIV` |
| `M-WRMUL` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-08` → `M-WRMUL` |
| `M-WRSUB` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M-DEC-ADD` → `M-WRSUB` |
| `M79-DEC-DIV` | task_context_coverage_seed | Conversion from km/h to m/s explicitly divides the supplied speed by decimal factor 3.6. | `M79-DEC-DIV` |
| `M79-EQ1-FORM` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-EQ1-SOLVE` → `M79-EQ1-FORM` |
| `M79-EXPR-EVAL` | task_context_coverage_seed | The learner substitutes an input into a*x+b or f(x) and calculates its value. The graph family similarly asks for y values before plotting. | `M79-EXPR-EVAL` |
| `M79-EXPR-FORM` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-EQ1-SOLVE` → `M79-EQ1-FORM` → `M79-EXPR-FORM` |
| `M79-FRAC-DIV` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M79-DEC-DIV` → `M79-FRAC-DIV` |
| `M79-FUNC-TABLE` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-FUNC-GRAPH` → `M79-FUNC-TABLE` |
| `M79-INT-ADD` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-EQ1-SOLVE` → `M79-INT-ADD` |
| `M79-INT-DIV` | task_context_coverage_seed | The generator allows a negative solution x and positive coefficient a; solving a*x+b=c can require division of a negative integer by a positive integer. Its allowed parameters can construct 2x - 1 = -9, then -8 / 2. | `M79-INT-DIV` |
| `M79-INT-MUL` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-EQ1-SOLVE` → `M79-INT-MUL` |
| `M79-LOGIC-01` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-DEP-01` → `M79-LOGIC-01` |
| `M79-RECIP-01` | canonical_ancestor_of_task_context_seed | Required/strong canonical parent closure from a source-reviewed task-context coverage seed. | `M79-DEC-DIV` → `M79-FRAC-DIV` → `M79-RECIP-01` |
| `M79-VAR-01` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-DEP-01` → `M79-VAR-01` |
| `M79-VAR-UNKNOWN` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-DEP-01` → `M79-VAR-01` → `M79-VAR-UNKNOWN` |
| `M79-VAR-VARYING` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `M79-DEP-01` → `M79-VAR-01` → `M79-VAR-VARYING` |
| `SCI-ENV-SAFE-01` | canonical_required_strong_support | Required/strong canonical parent closure from an original Lite node. | `SCI-ENV-TOOL-01` → `SCI-ENV-SAFE-01` |
| `M-FRAC-12` | activity_context_use | M-FRAC-11/transfer: The remaining-pie explanation explicitly subtracts same-denominator fractions. Counting unshaded pieces is also possible, so this response does not alone demonstrate the full subtraction KC. | `M-FRAC-11` → `M-FRAC-12` |
| `M-GMEAS-01` | activity_context_use | M-TH-08/transfer: Square perimeter from side length; perimeter meaning is not supplied. M79-EXPR-FORM/shape: Square/equilateral-triangle perimeter expressions. M79-EQ1-FORM/transfer: Rectangle perimeter equation. | `M-TH-08` → `M-GMEAS-01` |
| `M-MEAS-04` | canonical_ancestor_of_activity_use | Required parent of M-GMEAS-01. | `M-GMEAS-01` → `M-MEAS-04` |
| `M-TIME-02` | activity_context_use | M-UNIT-05/transfer: Existing arrival-time task reads departure time and asks for time of day after a duration; source saari1.ts508-514. This addition is due to the retained clock-time context, not the new elapsed stopwatch. | `M-UNIT-05` → `M-TIME-02` |

## Tehtävätason kattavuus (ei graafin kaaria)

Nämä 16 riviä kertovat, missä tehtävä käyttää toista taitoa. Ne pidetään erillään kanonisista esitietokaarista eivätkä ne lukitse tai päättele mitään. Ne ovat osa perherekisteriä (alla), eivät koko auditointi.

| Kohde | Käyttää | Rooli | Perhe | Esimerkki |
| --- | --- | --- | --- | --- |
| `M79-EQ1-SOLVE` | `M79-INT-DIV` | support | two (negative solutions) | 2x - 1 = -9; x = -8 / 2 = -4. |
| `PHY79-UNIT-CONV` | `M-DEC-08` | support | kmM, hMin | 0.8 km * 1000 = 800 m; 1.5 h * 60 = 90 min. |
| `PHY79-UNIT-CONV` | `M-DEC-09` | support | cmM | 250 cm / 100 = 2.5 m; 75 cm / 100 = 0.75 m. |
| `PHY79-SPEED-CALC` | `M-DEC-ADD` | support | transfer (ride plus stop) | 0.5 h + 0.5 h = 1 h. |
| `PHY79-SPEED-MIXED` | `M79-DEC-DIV` | support | kmh | 18 / 3.6 = 5 m/s. |
| `M-FRAC-03` | `M-FRAC-05` | co-taught | same | Compare x/b with y/b for the same b. |
| `M-FRAC-03` | `M-FRAC-11` | co-taught | transfer (two shares of a pie) | a/b + c/b = (a+c)/b. |
| `PHY79-DATA-01` | `M-DATA-05` | responseFormat | transfer (read distance at a given time) | Read the distance corresponding to the row for k seconds. |
| `M79-FUNC-01` | `M79-EXPR-EVAL` | support | run and transfer; related function-graph plot | f(x)=k*x+s: substitute a provided travel distance x and calculate the fare. |
| `M-COORD-02` | `M-SYM-01` | co-taught | transfer (axis reflection) | Reflect (x,y) to (-x,y) or (x,-y), maintaining equal distance from the axis. |
| `M79-FRAC-MUL` | `M-FRAC-08` | co-taught | demo (simplifying the product) | 6/12 = 1/2. |
| `M-TH-08` | `M-GMEAS-01` | context_knowledge | transfer | Square with side 5 cm: perimeter 4 * 5 = 20 cm. |
| `M79-EXPR-FORM` | `M-GMEAS-01` | context_knowledge | shape | Square with side a: perimeter a + a + a + a = 4a. |
| `M79-EQ1-FORM` | `M-GMEAS-01` | context_knowledge | transfer | Rectangle 2x by 3: 2(2x + 3) = 26. |
| `M-FRAC-11` | `M-FRAC-12` | co_taught | transfer | 8/8 - 3/8 = 5/8 of the pie remains. |
| `M-UNIT-05` | `M-TIME-02` | context_knowledge | transfer | Departs at 9.30, sails 2 h: arrives at 11.30. |

## Tehtäväperherekisteri

Generoitu rekisteristä `src/content/families.ts` ja tunnistimista `src/content/features.ts` ajamalla jokaista perhettä 120 siemenellä vaihetta kohden. Perheitä 932, joista 233 on erikseen ilmoitettu (muut oletuksia). **Selittämättömiä vaatimuksia: 0.**

Vaatimus = tunnistin löysi tehtävästä (teksti, kuva, vastaus) esimerkiksi negatiivisen luvun, desimaaliluvun, kertolaskun, kellonajan, piirin tai yksikkömuunnoksen. Se on selitetty, jos se kuuluu oppitunnin omaan sisältöön, löytyy sen pakollisesta/vahvasta esitietopolusta, on rekisterissä oletettuna tai samalla opetettuna taitona, annetaan tehtävässä, tai on merkitty vain esiintyväksi (ei vaadita). Tunnistimet ovat heuristisia: ne löytävät tavallisimmat muodot, eivät kaikkea.

| Perhe | Vaiheet | Tyyppi | Havaittu tulos | Rajaus | Vastausalue | Havaitut vaatimukset ja selitys | Oletetut / samalla opetetut | Apu | Lähde |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `M-GEO-01/print` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-01/flat` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-01/solid` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-01/sort` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M-GEO-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-REP-04/words` | gi | choice | valitsee oikean vaihtoehdon | Tunnistaa tilannetta vastaavan merkinnän ja rakentaa sen merkkipaloista (perhe build); vapaata kirjoittamista ei havaita. | – | – | `M-SYM-PLUS`, `M-SYM-MINUS`, `M-SYM-EQUAL` · sääntö requires_relevant_content_symbol_knowledge | `M-SYM-PLUS`, `M-SYM-MINUS` | families.ts M-REP-04/* |
| `M-REP-04/compare` | gi | choice | valitsee oikean vaihtoehdon | Tunnistaa tilannetta vastaavan merkinnän ja rakentaa sen merkkipaloista (perhe build); vapaata kirjoittamista ei havaita. | – | – | `M-SYM-PLUS`, `M-SYM-MINUS`, `M-SYM-EQUAL` · sääntö requires_relevant_content_symbol_knowledge | `M-SYM-PLUS`, `M-SYM-MINUS` | families.ts M-REP-04/* |
| `M-REP-04/add` | gi | choice | valitsee oikean vaihtoehdon | Tunnistaa tilannetta vastaavan merkinnän ja rakentaa sen merkkipaloista (perhe build); vapaata kirjoittamista ei havaita. | – | – | `M-SYM-PLUS`, `M-SYM-MINUS`, `M-SYM-EQUAL` · sääntö requires_relevant_content_symbol_knowledge | `M-SYM-PLUS`, `M-SYM-MINUS` | families.ts M-REP-04/* |
| `M-REP-04/build` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | Tunnistaa tilannetta vastaavan merkinnän ja rakentaa sen merkkipaloista (perhe build); vapaata kirjoittamista ei havaita. | – | – | `M-SYM-PLUS`, `M-SYM-MINUS`, `M-SYM-EQUAL` · sääntö requires_relevant_content_symbol_knowledge | `M-SYM-PLUS`, `M-SYM-MINUS` | families.ts M-REP-04/* |
| `M-REP-04/transfer` | t | choice | valitsee oikean vaihtoehdon | Tunnistaa tilannetta vastaavan merkinnän ja rakentaa sen merkkipaloista (perhe build); vapaata kirjoittamista ei havaita. | – | multiply: rekisteri: M-MUL-01 | `M-SYM-PLUS`, `M-SYM-MINUS`, `M-SYM-EQUAL`, `M-MUL-01`, `M-MUL-02` · sääntö requires_relevant_content_symbol_knowledge | `M-MUL-02`, `M-MUL-01`, `M-SYM-PLUS`, `M-SYM-MINUS` | families.ts M-REP-04/*; families.ts M-REP-04/transfer |
| `M-TH-08/fracDiv` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: rekisteri: M-FRAC-01; multiply: ei vaadita: Kertolasku on vain väärä vaihtoehto.; divide: rekisteri: M-DIV-01 | `M-FRAC-01`, `M-DIV-01` · sääntö requires_any_two_mastered_content_nodes | `M-FRAC-01`, `M-DIV-01` | families.ts M-TH-08/*; families.ts M-TH-08/fracDiv |
| `M-TH-08/pairs` | gi | place | sijoittaa osat oikeille paikoille | – | – | fraction: rekisteri: M-FRAC-01; multiply: rekisteri: M-MUL-01; divide: rekisteri: M-DIV-01; perimeter: rekisteri: M-GMEAS-01 | `M-MUL-01`, `M-FRAC-01`, `M-DIV-01`, `M-GMEAS-01` · sääntö requires_any_two_mastered_content_nodes | `M-MUL-01`, `M-FRAC-01`, `M-GMEAS-01` | families.ts M-TH-08/*; families.ts M-TH-08/pairs |
| `M-TH-08/mulAdd` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MUL-01 | `M-MUL-01`, `M-ADD-01` · sääntö requires_any_two_mastered_content_nodes | `M-MUL-01` | families.ts M-TH-08/*; families.ts M-TH-08/mulAdd |
| `M-TH-08/areaMul` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MUL-01 | `M-MUL-01`, `M-MULTAB-LOW` · sääntö requires_any_two_mastered_content_nodes | `M-MULTAB-LOW` | families.ts M-TH-08/*; families.ts M-TH-08/areaMul |
| `M-TH-08/transfer` | t | numeric | kirjoittaa luvun | – | 12…36 | multiply: rekisteri: M-MULTAB-LOW; perimeter: rekisteri: M-GMEAS-01 | `M-GMEAS-01`, `M-MULTAB-LOW`, `M-GMEAS-01` (transfer) · sääntö requires_any_two_mastered_content_nodes | `M-GMEAS-01`, `M-MULTAB-LOW` | families.ts M-TH-08/*; families.ts M-TH-08/transfer |
| `SCI-ENV-SAFE-01/s4` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/s2` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/s1` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/s0` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/sort` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/s3` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/order` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/s5` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-04/sort` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M-GEO-04/name` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-04/find` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-04/corners` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-04/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-1TO1/judge` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-1TO1/tap` | gi | tapcount | merkitsee jokaisen esineen täsmälleen kerran; loppumäärää ei vaadita | Lukusanajono annetaan tarvittaessa tukena; itsenäistä loppumäärää tai sanajonon tuottamista ei arvioida. | – | – | – | – | families.ts M-NUM-1TO1/tap |
| `M-NUM-1TO1/transfer` | t | tapcount | merkitsee jokaisen erilaisen esineen täsmälleen kerran; loppumäärää ei vaadita | Näyttö koskee kertamerkintää, ei kardinaliteettia tai itsenäistä lukusanajonoa. | – | – | – | – | families.ts M-NUM-1TO1/transfer |
| `M-SYM-01/complete` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-01/grid` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-01/axis` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-01/paint` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `M-SYM-01/transfer` | t | plot | piirtää pisteet kuvaajaan | – | – | coordinate: rekisteri: M-COORD-PLOT-Q1 | `M-COORD-PLOT-Q1` | `M-COORD-PLOT-Q1` | families.ts M-SYM-01/transfer |
| `M-NUM-STABLE-ORDER/spot` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-STABLE-ORDER/swap` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-STABLE-ORDER/next` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-STABLE-ORDER/rhyme` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | – | – | – | – | – | oletus |
| `M-NUM-STABLE-ORDER/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-WORD-NUMERAL/n2w` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-WORD-NUMERAL/w2n` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-WORD-NUMERAL/pairs` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-NUM-WORD-NUMERAL/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-01/odd` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-01/same` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-01/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-02/boxes` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M-TH-02/shape` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `M-TH-02/color` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `M-TH-02/rule` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M-TH-02/odd` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-03/middle` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-03/numbers` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-TH-03/sticks` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-TH-03/fix` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-TH-03/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-TH-04/grow` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-04/extend` | gi | extend | jatkaa kuviota oikein jokaiseen tyhjään paikkaan | – | – | – | – | – | oletus |
| `M-TH-04/repeat` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-04/dots` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-04/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-WORK-01/notice` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-WORK-01/need` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-WORK-01/extra` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-WORK-01/sieve` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M-WORK-01/transfer` | t | choice | valitsee tarvittavan tiedon; kertolasku näkyy vain vaihtoehdon tekstissä | – | – | – | `M-MUL-01` | `M-MUL-01` | families.ts M-WORK-01/transfer |
| `M-MEAS-00/equal` | gi | ribbons | vertaa kahta pituutta | – | – | – | – | – | oletus |
| `M-MEAS-00/tricky` | gi | ribbons | vertaa kahta pituutta | – | – | – | – | – | oletus |
| `M-MEAS-00/aligned` | gi | ribbons | vertaa kahta pituutta | – | – | – | – | – | oletus |
| `M-MEAS-00/heavy` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-00/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-07/system` | gi | choice | valitsee oikean vaihtoehdon | Perheessä list kaikki yhdistelmät luetellaan ja puuttuvat tai toistuvat tarkistetaan; muissa perheissä vain tulos tai menetelmän tunnistus. | – | multiply: rekisteri: M-MUL-01 | `M-MUL-01` (selitys: rivien lukumäärä × vaihtoehdot) | `M-MUL-01` | families.ts M-TH-07/* |
| `M-TH-07/digits` | gi | choice | valitsee oikean vaihtoehdon | Perheessä list kaikki yhdistelmät luetellaan ja puuttuvat tai toistuvat tarkistetaan; muissa perheissä vain tulos tai menetelmän tunnistus. | – | – | `M-MUL-01` (selitys: rivien lukumäärä × vaihtoehdot) | `M-MUL-01` | families.ts M-TH-07/* |
| `M-TH-07/outfits` | gi | numeric | kirjoittaa luvun | Perheessä list kaikki yhdistelmät luetellaan ja puuttuvat tai toistuvat tarkistetaan; muissa perheissä vain tulos tai menetelmän tunnistus. | 4…16 | multiply: rekisteri: M-MUL-01 | `M-MUL-01` (selitys: rivien lukumäärä × vaihtoehdot) | `M-MUL-01` | families.ts M-TH-07/* |
| `M-TH-07/valid` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | Perheessä list kaikki yhdistelmät luetellaan ja puuttuvat tai toistuvat tarkistetaan; muissa perheissä vain tulos tai menetelmän tunnistus. | – | – | `M-MUL-01` (selitys: rivien lukumäärä × vaihtoehdot) | `M-MUL-01` | families.ts M-TH-07/* |
| `M-TH-07/list` | gi | combos | luettelee kaikki yhdistelmät kerran (puuttuvat ja toistot tarkistetaan) | Perheessä list kaikki yhdistelmät luetellaan ja puuttuvat tai toistuvat tarkistetaan; muissa perheissä vain tulos tai menetelmän tunnistus. | – | – | `M-MUL-01` (selitys: rivien lukumäärä × vaihtoehdot) | `M-MUL-01` | families.ts M-TH-07/* |
| `M-TH-07/transfer` | t | numeric | kirjoittaa luvun | Perheessä list kaikki yhdistelmät luetellaan ja puuttuvat tai toistuvat tarkistetaan; muissa perheissä vain tulos tai menetelmän tunnistus. | 3…10 | – | `M-MUL-01` (selitys: rivien lukumäärä × vaihtoehdot) | `M-MUL-01` | families.ts M-TH-07/* |
| `M79-LOGIC-01/test` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MULTAB-LOW | `M-MULTAB-LOW`, `M79-EXPR-EVAL` | `M79-EXPR-EVAL`, `M-MULTAB-LOW` | families.ts M79-LOGIC-01/* |
| `M79-LOGIC-01/next` | gi | numeric | kirjoittaa luvun | – | 10…29 | – | `M-MULTAB-LOW`, `M79-EXPR-EVAL` | `M79-EXPR-EVAL`, `M-MULTAB-LOW` | families.ts M79-LOGIC-01/* |
| `M79-LOGIC-01/rule` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MULTAB-LOW | `M-MULTAB-LOW`, `M79-EXPR-EVAL` | `M79-EXPR-EVAL`, `M-MULTAB-LOW` | families.ts M79-LOGIC-01/* |
| `M79-LOGIC-01/rules` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | `M-MULTAB-LOW`, `M79-EXPR-EVAL` | `M79-EXPR-EVAL`, `M-MULTAB-LOW` | families.ts M79-LOGIC-01/* |
| `M79-LOGIC-01/transfer` | t | numeric | kirjoittaa luvun | – | 19…37 | multiply: rekisteri: M-MULTAB-LOW | `M-MULTAB-LOW`, `M79-EXPR-EVAL` | `M79-EXPR-EVAL`, `M-MULTAB-LOW` | families.ts M79-LOGIC-01/* |
| `SCI-ENV-OBSERVE-01/colour` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-OBSERVE-01/feature` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-OBSERVE-01/match` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-OBSERVE-01/sort` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `SCI-ENV-OBSERVE-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-02/thick` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-02/bend` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-02/path` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-01/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-01/life` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-01/equal` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-01/diff` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-01/scatter` | gi | tapcount | kertoo lukumäärän (merkintä vaaditaan vain merkintätehtävässä) | – | – | – | – | – | oletus |
| `M-NUM-01/line` | gi | tapcount | kertoo lukumäärän (merkintä vaaditaan vain merkintätehtävässä) | – | – | – | – | – | oletus |
| `M-NUM-01/circle` | gi | tapcount | kertoo lukumäärän (merkintä vaaditaan vain merkintätehtävässä) | – | – | – | – | – | oletus |
| `M-NUM-01/transfer` | t | tapcount | kertoo lukumäärän (merkintä vaaditaan vain merkintätehtävässä) | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-OBS-01/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-OBS-01/spot` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-OBS-01/colour` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-OBS-01/moved` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-OBS-01/still` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-OBS-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-03/sim` | gi | numeric | kirjoittaa luvun | – | 2…6 | – | – | – | oletus |
| `M-TIME-03/unit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-03/compare` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-03/lamp` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-01/lay` | gi | iterate | mittaa latomalla yksikköpaloja peräkkäin nauhan loppuun asti | – | – | – | – | – | oletus |
| `M-MEAS-01/count` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-01/judge` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-02/give` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `M-NUM-02/howmany` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-17/fair` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-17/deal` | gi | deal | jakaa joukon itse vuorotellen kahdelle ja tarkistaa, että kumpikin saa yhtä monta | – | – | – | – | – | oletus |
| `M-NUM-17/share` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-17/number` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-17/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/next` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/steady` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/faster` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/stop` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/turn` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-ADD-01/expr` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-01/join` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-01/sentence` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | – | – | – | – | – | oletus |
| `M-ADD-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-QTY-NUMERAL/n2q` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-QTY-NUMERAL/q2n` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-QTY-NUMERAL/fill` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `M-NUM-QTY-NUMERAL/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-NUM-QTY-WORD/w2q` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-QTY-WORD/q2w` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-QTY-WORD/spread` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-QTY-WORD/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-01/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-01/describe` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-01/still` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-01/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-01/faster` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-03/fromNumeral` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-NUM-03/fromQty` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-NUM-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-18/ten` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-18/pair` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-18/hidden` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-18/scale` | gi | balance | lisää kiviä vaa'an toiselle puolelle, kunnes puolet ovat yhtä painavat (yhtäsuuruus tasapainona) | – | – | – | – | – | oletus |
| `M-NUM-18/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-MOTION-REF/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-MOTION-REF/sort` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `PHY79-MOTION-REF/walk` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-MOTION-REF/boat` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-MOTION-REF/train` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-MOTION-REF/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-07/big` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-07/teen` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-07/small` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-07/order` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | – | – | – | – | – | oletus |
| `M-NUM-07/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-08/before` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-08/hop` | gi | line | merkitsee kohdan lukusuoralle | – | 2…22 | – | – | – | oletus |
| `M-NUM-08/next` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-08/gap` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-08/transfer` | t | line | merkitsee kohdan lukusuoralle | – | 5…15 | – | – | – | oletus |
| `M-NUM-10/symbol` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-10/tens` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-10/bigger` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-10/order` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-NUM-10/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-02/set` | gi | clock | asettaa kellon viisarit annettuun aikaan puolen tunnin askelin | – | – | clock: oma sisältö | – | – | oletus |
| `M-TIME-02/half` | gi | choice | valitsee oikean vaihtoehdon | – | – | clock: oma sisältö | – | – | oletus |
| `M-TIME-02/full` | gi | choice | valitsee oikean vaihtoehdon | – | – | clock: oma sisältö | – | – | oletus |
| `M-TIME-02/hands` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | clock: oma sisältö | – | – | oletus |
| `M-NUM-14/make` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-14/read` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-14/unit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-14/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-QTY-CONCEPT/unitVs` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | families.ts PHY79-QTY-CONCEPT/* |
| `PHY79-QTY-CONCEPT/tool` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | families.ts PHY79-QTY-CONCEPT/* |
| `PHY79-QTY-CONCEPT/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-QTY-CONCEPT/* |
| `PHY79-QTY-CONCEPT/sort` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | families.ts PHY79-QTY-CONCEPT/* |
| `PHY79-QTY-CONCEPT/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-QTY-CONCEPT/* |
| `PHY79-NUMVALUE/type` | gi | numeric | kirjoittaa luvun | – | 0.4…21.5 | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-NUMVALUE/* |
| `PHY79-NUMVALUE/symbol` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-NUMVALUE/* |
| `PHY79-NUMVALUE/plain` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-NUMVALUE/* |
| `PHY79-NUMVALUE/sort` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-NUMVALUE/* |
| `PHY79-NUMVALUE/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-NUMVALUE/* |
| `PHY79-UNIT-CONCEPT/fit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | families.ts PHY79-UNIT-CONCEPT/* |
| `PHY79-UNIT-CONCEPT/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-UNIT-CONCEPT/* |
| `PHY79-UNIT-CONCEPT/fill` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa.; convertLength: ei vaadita: Selitys mainitsee cm ja m; mitään ei muunneta. | – | – | families.ts PHY79-UNIT-CONCEPT/* |
| `PHY79-UNIT-CONCEPT/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | convertLength: ei vaadita: Selitys mainitsee cm ja m; mitään ei muunneta. | – | – | families.ts PHY79-UNIT-CONCEPT/* |
| `PHY79-QTY-01/whole` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-QTY-01/* |
| `PHY79-QTY-01/sort` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-QTY-01/* |
| `PHY79-QTY-01/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-QTY-01/* |
| `PHY79-QTY-01/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | speedUnit: ei vaadita: Yksikkö m/s on vain sijoitettava osa. | – | – | families.ts PHY79-QTY-01/* |
| `PHY79-DIST-TIME/sim` | gi | numeric | kirjoittaa luvun | – | 2…25 | – | – | – | families.ts PHY79-DIST-TIME/* |
| `PHY79-DIST-TIME/read` | gi | numeric | kirjoittaa luvun | – | 3…9 | – | – | – | families.ts PHY79-DIST-TIME/* |
| `PHY79-DIST-TIME/tool` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | families.ts PHY79-DIST-TIME/* |
| `PHY79-DIST-TIME/dist` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | convertLength: ei vaadita: Eri yksiköt ovat luokiteltavina vaihtoehtoina; mitään ei muunneta.; convertTime: ei vaadita: Eri yksiköt ovat luokiteltavina vaihtoehtoina; mitään ei muunneta.; decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-DIST-TIME/* |
| `PHY79-DIST-TIME/time` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa.; convertTime: ei vaadita: Eri yksiköt ovat luokiteltavina vaihtoehtoina; mitään ei muunneta.; convertLength: ei vaadita: Eri yksiköt ovat luokiteltavina vaihtoehtoina; mitään ei muunneta. | – | – | families.ts PHY79-DIST-TIME/* |
| `PHY79-DIST-TIME/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | families.ts PHY79-DIST-TIME/* |
| `M-NUM-EQUALSTEP-SEQ/rule` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-EQUALSTEP-SEQ/step10` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-EQUALSTEP-SEQ/step5` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-EQUALSTEP-SEQ/step2` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-EQUALSTEP-SEQ/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-EQUALSTEP-SEQ/extend` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | – | – | – | – | – | oletus |
| `M-NUM-EQUALSTEP-SEQ/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-MULTIPLE-INTRO/k5` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-MULTIPLE-INTRO/k3` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-MULTIPLE-INTRO/k2` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-MULTIPLE-INTRO/nth` | gi | line | merkitsee kohdan lukusuoralle | – | 4…20 | – | – | – | oletus |
| `M-NUM-MULTIPLE-INTRO/hits` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-MULTIPLE-INTRO/transfer` | t | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `M-NUM-16/gaps` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | – | – | – | – | – | oletus |
| `M-NUM-16/step` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-16/next` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-16/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MUL-01/pack` | gi | pack | pakkaa jokaiseen pussiin yhtä monta (yhtä suuret ryhmät) | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MUL-01/expr` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MUL-01/total` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MUL-01/equal` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MUL-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-LOW/strategy` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-LOW/array` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-LOW/fact` | gi | numeric | kirjoittaa luvun | – | 1…100 | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-LOW/grid` | gi | grid | rakentaa kertolaskua vastaavan rivistön: oikea määrä rivejä ja oikea määrä jokaiseen riviin | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-LOW/transfer` | t | numeric | kirjoittaa luvun | – | 8…90 | multiply: oma sisältö | – | – | oletus |
| `M-DIV-02/fill` | gi | bagup | pakkaa kasan pusseihin ryhmä kerrallaan ja laskee pussit (sisältöjako) | – | – | – | – | – | oletus |
| `M-DIV-02/pic` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DIV-02/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DIV-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MULTAB-HIGH/trick` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-HIGH/six` | gi | numeric | kirjoittaa luvun | – | 18…54 | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-HIGH/nine` | gi | numeric | kirjoittaa luvun | – | 27…81 | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-HIGH/fact` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-HIGH/transfer` | t | numeric | kirjoittaa luvun | – | 24…72 | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-ALL/row` | gi | place | sijoittaa osat oikeille paikoille | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-ALL/factor` | gi | numeric | kirjoittaa luvun | – | 3…9 | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-ALL/mixed` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-ALL/neighbour` | gi | numeric | kirjoittaa luvun | – | 21…81 | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-ALL/transfer` | t | numeric | kirjoittaa luvun | – | 36…81 | multiply: oma sisältö | – | – | oletus |
| `M-MULTREL-01/build` | gi | stack | rakentaa tornin, joka on annetun monta kertaa niin korkea (multiplikatiivinen vertailu) | – | – | – | – | – | oletus |
| `M-MULTREL-01/times` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MULTREL-01/howMany` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MULTREL-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `PHY79-SPEED-CONCEPT/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö | – | – | families.ts PHY79-SPEED-CONCEPT/* |
| `PHY79-SPEED-CONCEPT/rank` | gi | place | sijoittaa osat oikeille paikoille | – | – | speedUnit: oma sisältö | – | – | families.ts PHY79-SPEED-CONCEPT/* |
| `PHY79-SPEED-CONCEPT/equal` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö | – | – | families.ts PHY79-SPEED-CONCEPT/* |
| `PHY79-SPEED-CONCEPT/sameS` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö; decimal: ei vaadita: Selitys näyttää nopeudet; vastaus syntyy vertailemalla matkaa tai aikaa. | – | – | families.ts PHY79-SPEED-CONCEPT/* |
| `PHY79-SPEED-CONCEPT/sameT` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö; decimal: ei vaadita: Selitys näyttää nopeudet; vastaus syntyy vertailemalla matkaa tai aikaa. | – | – | families.ts PHY79-SPEED-CONCEPT/* |
| `PHY79-SPEED-CONCEPT/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö | – | – | families.ts PHY79-SPEED-CONCEPT/* |
| `PHY79-ACCEL-CONCEPT/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-CONCEPT/change` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-CONCEPT/gain` | gi | numeric | kirjoittaa luvun | – | 2…4 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CONCEPT/table` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CONCEPT/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CONCEPT/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CONCEPT/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-PRESENT-DATA-01/most` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-PRESENT-DATA-01/read` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-PRESENT-DATA-01/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-PRESENT-DATA-01/complete` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-PRESENT-DATA-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-DATA-01/three` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-DATA-01/two` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-DATA-01/fix` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-DATA-01/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-01/count` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-01/build` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-01/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-01/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-NUM-06/count` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-06/empty` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-06/takeAll` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-06/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-01/tie` | gi | bundle | kerää kaisloja nippuun napauttamalla ja sitoo nipun, kun siinä on tasan kymmenen (kymmenen ykköstä = yksi kymppi) | – | – | – | – | – | oletus |
| `M-PLACE-01/missing` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-01/enough` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-01/bundles` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-02/order` | gi | reeds | kokoaa tilatun luvun nipuista (kymmenet) ja irtokaisloista (ykköset) tai avaa nipun ykkösiksi | – | – | – | – | – | oletus |
| `M-PLACE-02/numToPic` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-02/picToNum` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-02/digit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-03/build` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-03/split` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-03/compose` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-03/open` | gi | reeds | kokoaa tilatun luvun nipuista (kymmenet) ja irtokaisloista (ykköset) tai avaa nipun ykkösiksi | – | – | – | – | – | oletus |
| `M-PLACE-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MENTAL-01/use` | gi | numeric | kirjoittaa luvun | – | 42…93 | – | – | – | oletus |
| `M-MENTAL-01/tensOnes` | gi | numeric, choice | kirjoittaa luvun | – | 10…10 | – | – | – | oletus |
| `M-MENTAL-01/toTen` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MENTAL-01/cut` | gi | cut | leikkaa luvun kahteen osaan niin, että ensimmäinen osa vie tasakymppiin | – | – | – | – | – | oletus |
| `M-MENTAL-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-01/expr` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-01/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-01/picture` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-01/back` | gi | line | merkitsee kohdan lukusuoralle | – | 1…8 | – | – | – | oletus |
| `M-SUB-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-SUB-01/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-SUB-01/undo` | gi | numeric | kirjoittaa luvun | – | 2…9 | – | – | – | oletus |
| `M-ADD-SUB-01/family` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-SUB-01/write` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | – | – | – | – | – | oletus |
| `M-ADD-SUB-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-FACT-10/double` | gi | numeric | kirjoittaa luvun | – | 2…10 | – | – | – | oletus |
| `M-ADD-FACT-10/turn` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-FACT-10/fact` | gi | numeric | kirjoittaa luvun | – | 1…10 | – | – | – | oletus |
| `M-ADD-FACT-10/race` | gi | line | merkitsee kohdan lukusuoralle | – | 6…10 | – | – | – | oletus |
| `M-ADD-FACT-10/transfer` | t | numeric | kirjoittaa luvun | – | 4…10 | – | – | – | oletus |
| `M-DIV-01/share` | gi | pack | pakkaa jokaiseen pussiin yhtä monta (yhtä suuret ryhmät) | – | – | – | – | – | oletus |
| `M-DIV-01/fair` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DIV-01/deal` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DIV-01/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DIV-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-FACT-10/left` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-FACT-10/think` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-FACT-10/fact` | gi | numeric | kirjoittaa luvun | – | 0…7 | – | – | – | oletus |
| `M-SUB-FACT-10/up` | gi | numeric | kirjoittaa luvun | – | 1…4 | – | – | – | oletus |
| `M-SUB-FACT-10/transfer` | t | numeric | kirjoittaa luvun | – | 1…7 | – | – | – | oletus |
| `M-ADD-FACT-01/sign` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-FACT-01/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-FACT-01/mixed` | gi | numeric | kirjoittaa luvun | – | 0…10 | – | – | – | oletus |
| `M-ADD-FACT-01/missing` | gi | numeric | kirjoittaa luvun | – | 1…9 | – | – | – | oletus |
| `M-ADD-FACT-01/transfer` | t | numeric | kirjoittaa luvun | – | 1…9 | – | – | – | oletus |
| `M-DIVIS-01/tags` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M-DIVIS-01/threes` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `M-DIVIS-01/lastDigit` | gi | choice | valitsee oikean vaihtoehdon | – | – | divide: oma sisältö | – | – | oletus |
| `M-DIVIS-01/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | divide: oma sisältö | – | – | oletus |
| `M-DIVIS-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | divide: oma sisältö | – | – | oletus |
| `M-MULDIV-01/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | oletus |
| `M-MULDIV-01/factor` | gi | numeric | kirjoittaa luvun | – | 2…5 | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | oletus |
| `M-MULDIV-01/family` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | oletus |
| `M-MULDIV-01/repack` | gi | bagup | pakkaa kasan pusseihin ryhmä kerrallaan ja laskee pussit (sisältöjako) | – | – | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | oletus |
| `M-MULDIV-01/transfer` | t | numeric | kirjoittaa luvun | – | 3…8 | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | oletus |
| `M-ADD-20/split` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-20/teen` | gi | numeric | kirjoittaa luvun | – | 13…19 | – | – | – | oletus |
| `M-ADD-20/bridge` | gi | numeric | kirjoittaa luvun | – | 11…18 | – | – | – | oletus |
| `M-ADD-20/chain` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | – | – | – | – | – | oletus |
| `M-ADD-20/transfer` | t | numeric | kirjoittaa luvun | – | 11…18 | – | – | – | oletus |
| `M-DIV-FACT-01/share` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | oletus |
| `M-DIV-FACT-01/think` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | oletus |
| `M-DIV-FACT-01/fact` | gi | numeric | kirjoittaa luvun | – | 1…10 | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | oletus |
| `M-DIV-FACT-01/deal` | gi | pack | pakkaa jokaiseen pussiin yhtä monta (yhtä suuret ryhmät) | – | – | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | oletus |
| `M-DIV-FACT-01/transfer` | t | numeric | kirjoittaa luvun | – | 3…8 | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | oletus |
| `M-FRAC-01/fair` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-FRAC-01/count` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-FRAC-01/equal` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-FRAC-01/sortfair` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M-FRAC-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-20/think` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-20/noBridge` | gi | numeric | kirjoittaa luvun | – | 10…17 | – | – | – | oletus |
| `M-SUB-20/bridge` | gi | numeric | kirjoittaa luvun | – | 2…9 | – | – | – | oletus |
| `M-SUB-20/steps` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | – | – | – | – | – | oletus |
| `M-SUB-20/transfer` | t | numeric | kirjoittaa luvun | – | 3…9 | – | – | – | oletus |
| `M-ADD-100/tens` | gi | numeric | kirjoittaa luvun | – | 29…99 | – | – | – | oletus |
| `M-ADD-100/carry` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-100/noCarry` | gi | numeric | kirjoittaa luvun | – | 25…89 | – | – | – | oletus |
| `M-ADD-100/raft` | gi | reeds | kokoaa tilatun luvun nipuista (kymmenet) ja irtokaisloista (ykköset) tai avaa nipun ykkösiksi | – | – | – | – | – | oletus |
| `M-ADD-100/transfer` | t | numeric | kirjoittaa luvun | – | 42…94 | – | – | – | oletus |
| `M-SUB-100/take` | gi | reeds | kokoaa tilatun luvun nipuista (kymmenet) ja irtokaisloista (ykköset) tai avaa nipun ykkösiksi | – | – | – | – | – | oletus |
| `M-SUB-100/borrow` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-100/noBorrow` | gi | numeric | kirjoittaa luvun | – | 10…75 | – | – | – | oletus |
| `M-SUB-100/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-100/transfer` | t | numeric | kirjoittaa luvun | – | 12…67 | – | – | – | oletus |
| `M-GEO-02/between` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-02/aboveBelow` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-02/leftRight` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-02/build` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-GEO-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-03/mark` | gi | line | merkitsee kohdan lukusuoralle | – | 2…9 | – | – | – | oletus |
| `M-MEAS-03/estimate` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertLength: oma sisältö | – | – | oletus |
| `M-MEAS-03/unit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-03/ruler` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | convertLength: oma sisältö | – | – | oletus |
| `M-MEAS-04/offset` | gi | numeric | kirjoittaa luvun | – | 3…7 | – | – | – | oletus |
| `M-MEAS-04/units` | gi | numeric | kirjoittaa luvun | – | 3…9 | – | – | – | oletus |
| `M-MEAS-04/unitSize` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-04/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GMEAS-01/same` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | perimeter: oma sisältö | – | – | oletus |
| `M-GMEAS-01/grid` | gi | numeric | kirjoittaa luvun | – | 10…14 | perimeter: oma sisältö | – | – | oletus |
| `M-GMEAS-01/rect` | gi | numeric | kirjoittaa luvun | – | 6…22 | perimeter: oma sisältö | – | – | oletus |
| `M-GMEAS-01/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | perimeter: oma sisältö | – | – | oletus |
| `M-GMEAS-01/transfer` | t | numeric | kirjoittaa luvun | – | 12…24 | perimeter: oma sisältö | – | – | oletus |
| `M-MEAS-05/equal` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-05/size` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-05/balance` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-05/weigh` | gi | weigh | punnitsee paketteja pareittain vaa'alla ja päättelee punnituksista painavimman tai kevyimmän | – | – | – | – | – | oletus |
| `M-MEAS-05/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-06/thousand` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertMass: oma sisältö | – | – | oletus |
| `M-MEAS-06/estimate` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertMass: oma sisältö | – | – | oletus |
| `M-MEAS-06/unit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-06/scale` | gi | grams | kokoaa punnuksista vaa'alle tilatun painon ja lukee grammat ja kilogrammat | – | – | convertMass: oma sisältö | – | – | oletus |
| `M-MEAS-06/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | convertMass: oma sisältö | – | – | oletus |
| `M-MEAS-08/conserve` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-08/cups` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-08/pour` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-08/test` | gi | pourtest | kokeilee kaatamalla täyden astian toiseen kumpaankin suuntaan ja päättelee, kumpaan mahtuu enemmän | – | – | – | – | – | oletus |
| `M-MEAS-08/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-09/compare` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertVolume: oma sisältö | – | – | oletus |
| `M-MEAS-09/ten` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertVolume: oma sisältö | – | – | oletus |
| `M-MEAS-09/unit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-09/fill` | gi | fill | kaataa desilitran mitalla kannuun desilitra kerrallaan, kunnes kannussa on pyydetty määrä | – | – | convertVolume: oma sisältö | – | – | oletus |
| `M-MEAS-09/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | convertVolume: oma sisältö | – | – | oletus |
| `M-DATA-01/question` | gi | choice | kerää kaikki sovittuun aiheeseen kuuluvat annetut havaintokortit tai tunnistaa aiheeseen sopivan kysymyksen | Keruu vaaditaan collect/transfer-perheessä; ei oikeaa maastotyötä, lukumäärää tai viivamerkintöjä. | – | – | – | – | families.ts M-DATA-01/* |
| `M-DATA-01/collect` | gi | multi | kerää kaikki sovittuun aiheeseen kuuluvat annetut havaintokortit tai tunnistaa aiheeseen sopivan kysymyksen | Keruu vaaditaan collect/transfer-perheessä; ei oikeaa maastotyötä, lukumäärää tai viivamerkintöjä. | – | – | – | – | families.ts M-DATA-01/* |
| `M-DATA-01/transfer` | t | multi | kerää kaikki sovittuun aiheeseen kuuluvat annetut havaintokortit tai tunnistaa aiheeseen sopivan kysymyksen | Keruu vaaditaan collect/transfer-perheessä; ei oikeaa maastotyötä, lukumäärää tai viivamerkintöjä. | – | – | – | – | families.ts M-DATA-01/* |
| `M-DATA-02/add` | gi | choice | valitsee oikean vaihtoehdon | Perheessä record havainnot kirjataan itse tukkimiehen kirjanpitoon; muut perheet lukevat valmista merkintää. | – | – | – | – | families.ts M-DATA-02/* |
| `M-DATA-02/count` | gi | choice | valitsee oikean vaihtoehdon | Perheessä record havainnot kirjataan itse tukkimiehen kirjanpitoon; muut perheet lukevat valmista merkintää. | – | – | – | – | families.ts M-DATA-02/* |
| `M-DATA-02/pick` | gi | choice | valitsee oikean vaihtoehdon | Perheessä record havainnot kirjataan itse tukkimiehen kirjanpitoon; muut perheet lukevat valmista merkintää. | – | – | – | – | families.ts M-DATA-02/* |
| `M-DATA-02/record` | gi | tally | kirjaa jokaisen havainnon tukkimiehen merkiksi oikeaan luokkaan | Perheessä record havainnot kirjataan itse tukkimiehen kirjanpitoon; muut perheet lukevat valmista merkintää. | – | – | – | – | families.ts M-DATA-02/* |
| `M-DATA-02/fix` | gi | choice | valitsee oikean vaihtoehdon | Perheessä record havainnot kirjataan itse tukkimiehen kirjanpitoon; muut perheet lukevat valmista merkintää. | – | – | – | – | families.ts M-DATA-02/* |
| `M-DATA-02/transfer` | t | choice | valitsee oikean vaihtoehdon | Perheessä record havainnot kirjataan itse tukkimiehen kirjanpitoon; muut perheet lukevat valmista merkintää. | – | – | – | – | families.ts M-DATA-02/* |
| `M-DATA-03/fewest` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-03/twoWay` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-03/read` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-03/cells` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-DATA-03/transfer` | t | numeric | lukee nimetyn rivin Yhteensä-sarakkeen annetun arvon | Yhteenlaskua ei vaadita; merkinnät eivät tarkoita varmasti eri eläinyksilöitä. | 5…23 | – | – | – | families.ts M-DATA-03/transfer |
| `M-DATA-05/diff` | gi | numeric | kirjoittaa luvun | – | 0…10 | – | – | – | oletus |
| `M-DATA-05/most` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-05/cell` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-05/rank` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-DATA-05/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-04/header` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-04/fromList` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-DATA-04/fromTally` | gi | place | sijoittaa annetun numeromäärän saman eläimen taulukkoriville | Viisiryhmien lukemista ei vaadita; viivakuva on vapaaehtoinen rinnakkaisesitys. | – | – | – | – | families.ts M-DATA-04/fromTally |
| `M-DATA-04/total` | gi | numeric | täydentää taulukon rivin keruuvihossa annetulla saman eläimen määrällä | Puuttuvan rivin arvo kopioidaan lähdetiedosta; vähennyslasku ei ole ratkaisuehto. | 2…9 | – | `M-SUB-01` (vain vastauksen jälkeinen vapaaehtoinen summatarkistus) | `M-SUB-01` | families.ts M-DATA-04/total |
| `M-DATA-04/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-SYM-PLUS/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-PLUS/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-PLUS/picToSign` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-PLUS/write` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | – | – | – | – | – | oletus |
| `M-SYM-PLUS/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-MINUS/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-MINUS/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-MINUS/picToSign` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-MINUS/write` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | – | – | – | – | – | oletus |
| `M-SYM-MINUS/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-EQUAL/plates` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-EQUAL/fillLeft` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-EQUAL/trueFalse` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-EQUAL/level` | gi | balance | lisää kiviä vaa'an toiselle puolelle, kunnes puolet ovat yhtä painavat (yhtäsuuruus tasapainona) | – | – | – | – | – | oletus |
| `M-SYM-EQUAL/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ARITH-01/trueFalse` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ARITH-01/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ARITH-01/missingSign` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ARITH-01/write` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | – | – | – | – | – | oletus |
| `M-ARITH-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MUL-02/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MUL-02/picture` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MUL-02/sum` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MUL-02/write` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MUL-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-EXPR-01/steps` | gi | place | sijoittaa osat oikeille paikoille | Valitaan laskutoimitusten järjestys; vastaus ei osoita laskutoimitusten numeerista suorittamista. | – | multiply: polku: M-MUL-02 | `M-ADD-01`, `M-SUB-01` · sääntö requires_operation_knowledge_for_operations_present_in_item | `M-MUL-02`, `M-DIV-FACT-01`, `M-ADD-SUB-01` | families.ts M-EXPR-01/*; families.ts M-EXPR-01/steps |
| `M-EXPR-01/paren` | gi | numeric | kirjoittaa luvun | – | 10…70 | multiply: polku: M-MUL-02 | `M-ADD-01`, `M-SUB-01`, `M-MUL-02` · sääntö requires_operation_knowledge_for_operations_present_in_item | `M-MUL-02`, `M-ADD-SUB-01` | families.ts M-EXPR-01/*; families.ts M-EXPR-01/paren |
| `M-EXPR-01/mulFirst` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-02 | `M-ADD-01`, `M-SUB-01`, `M-MUL-02` · sääntö requires_operation_knowledge_for_operations_present_in_item | `M-MUL-02`, `M-ADD-SUB-01` | families.ts M-EXPR-01/*; families.ts M-EXPR-01/mulFirst |
| `M-EXPR-01/sub` | gi | numeric | kirjoittaa luvun | – | 3…15 | multiply: polku: M-MUL-02 | `M-ADD-01`, `M-SUB-01`, `M-MUL-02` · sääntö requires_operation_knowledge_for_operations_present_in_item | `M-MUL-02`, `M-ADD-SUB-01` | families.ts M-EXPR-01/*; families.ts M-EXPR-01/sub |
| `M-EXPR-01/transfer` | t | choice | valitsee oikean vaihtoehdon | Valitaan tilanteen laskulauseke; vastaus ei osoita kokonaishinnan itsenäistä laskemista. | – | multiply: polku: M-MUL-02 | `M-ADD-01`, `M-SUB-01`, `M-MUL-02` · sääntö requires_operation_knowledge_for_operations_present_in_item | `M-MUL-02`, `M-ADD-SUB-01` | families.ts M-EXPR-01/*; families.ts M-EXPR-01/transfer |
| `SCI-ENV-TOOL-01/read` | gi | numeric | kirjoittaa luvun | – | 3…8 | – | – | – | oletus |
| `SCI-ENV-TOOL-01/use` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-TOOL-01/tool` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-TOOL-01/tare` | gi | numeric | kirjoittaa luvun | – | 150…400 | – | – | – | oletus |
| `SCI-ENV-TOOL-01/pick` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `SCI-ENV-TOOL-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-04/compare` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | `M-MUL-01` (selitys: numero × paikka-arvo) | – | families.ts M-PLACE-04/* |
| `M-PLACE-04/compose` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | `M-MUL-01` (selitys: numero × paikka-arvo) | – | families.ts M-PLACE-04/* |
| `M-PLACE-04/value` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MUL-01 | `M-MUL-01` (selitys: numero × paikka-arvo) | – | families.ts M-PLACE-04/* |
| `M-PLACE-04/till` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | `M-MUL-01` (selitys: numero × paikka-arvo) | – | families.ts M-PLACE-04/* |
| `M-PLACE-04/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MUL-01 | `M-MUL-01` (selitys: numero × paikka-arvo) | – | families.ts M-PLACE-04/* |
| `M-PLACE-05/regroup` | gi | numeric | kirjoittaa luvun | – | 15…980 | multiply: rekisteri: M-MUL-01 | `M-MUL-01` (selitys: 37 × 10) | – | families.ts M-PLACE-05/regroup |
| `M-PLACE-05/missing` | gi | numeric | kirjoittaa luvun | – | 20…900 | – | – | – | oletus |
| `M-PLACE-05/expand` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-05/split` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-PLACE-05/transfer` | t | numeric | kirjoittaa luvun | – | 1211…2435 | – | – | – | oletus |
| `M-NEG-01/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-01/colder` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-01/thermo` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-01/order` | gi | place | sijoittaa osat oikeille paikoille | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-WRADD/check` | gi | choice | valitsee oikean vaihtoehdon | Perheessä column ja perheessä transfer lapsi laskee summan itse: näkyy lopputulos, ei käytetty menetelmä eikä kirjoitettu muistinumero. Perheessä step muistinumero lisätään kymppeihin yhdessä numerossa; perheissä ones, where ja check muistinumeroon liittyvä kohta tunnistetaan valmiista laskusta. | – | – | – | – | families.ts M-WRADD/* |
| `M-WRADD/ones` | gi | choice | valitsee oikean vaihtoehdon | Perheessä column ja perheessä transfer lapsi laskee summan itse: näkyy lopputulos, ei käytetty menetelmä eikä kirjoitettu muistinumero. Perheessä step muistinumero lisätään kymppeihin yhdessä numerossa; perheissä ones, where ja check muistinumeroon liittyvä kohta tunnistetaan valmiista laskusta. | – | – | – | – | families.ts M-WRADD/* |
| `M-WRADD/column` | gi | numeric | kirjoittaa luvun | Perheessä column ja perheessä transfer lapsi laskee summan itse: näkyy lopputulos, ei käytetty menetelmä eikä kirjoitettu muistinumero. Perheessä step muistinumero lisätään kymppeihin yhdessä numerossa; perheissä ones, where ja check muistinumeroon liittyvä kohta tunnistetaan valmiista laskusta. | 333…948 | – | – | – | families.ts M-WRADD/* |
| `M-WRADD/step` | gi | numeric | kirjoittaa luvun | Perheessä column ja perheessä transfer lapsi laskee summan itse: näkyy lopputulos, ei käytetty menetelmä eikä kirjoitettu muistinumero. Perheessä step muistinumero lisätään kymppeihin yhdessä numerossa; perheissä ones, where ja check muistinumeroon liittyvä kohta tunnistetaan valmiista laskusta. | 2…9 | – | – | – | families.ts M-WRADD/* |
| `M-WRADD/where` | gi | choice | valitsee oikean vaihtoehdon | Perheessä column ja perheessä transfer lapsi laskee summan itse: näkyy lopputulos, ei käytetty menetelmä eikä kirjoitettu muistinumero. Perheessä step muistinumero lisätään kymppeihin yhdessä numerossa; perheissä ones, where ja check muistinumeroon liittyvä kohta tunnistetaan valmiista laskusta. | – | – | – | – | families.ts M-WRADD/* |
| `M-WRADD/transfer` | t | numeric | kirjoittaa luvun | Perheessä column ja perheessä transfer lapsi laskee summan itse: näkyy lopputulos, ei käytetty menetelmä eikä kirjoitettu muistinumero. Perheessä step muistinumero lisätään kymppeihin yhdessä numerossa; perheissä ones, where ja check muistinumeroon liittyvä kohta tunnistetaan valmiista laskusta. | 314…941 | – | – | – | families.ts M-WRADD/* |
| `M-WRDIV/exchange` | gi | numeric | kirjoittaa luvun | Perheessä step tarkistetaan ensimmäinen osamäärä ja jakojäännös; muissa vain lopputulos. | 12…27 | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | families.ts M-WRDIV/* |
| `M-WRDIV/byPlace` | gi | numeric | kirjoittaa luvun | Perheessä step tarkistetaan ensimmäinen osamäärä ja jakojäännös; muissa vain lopputulos. | 111…444 | divide: oma sisältö | – | – | families.ts M-WRDIV/* |
| `M-WRDIV/exch` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | Perheessä step tarkistetaan ensimmäinen osamäärä ja jakojäännös; muissa vain lopputulos. | – | divide: oma sisältö | – | – | families.ts M-WRDIV/* |
| `M-WRDIV/check` | gi | choice | valitsee oikean vaihtoehdon | Perheessä step tarkistetaan ensimmäinen osamäärä ja jakojäännös; muissa vain lopputulos. | – | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | families.ts M-WRDIV/* |
| `M-WRDIV/step` | gi | numeric | kirjoittaa luvun | Perheessä step tarkistetaan ensimmäinen osamäärä ja jakojäännös; muissa vain lopputulos. | 1…3 | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | families.ts M-WRDIV/* |
| `M-WRDIV/transfer` | t | numeric | kirjoittaa luvun | Perheessä step tarkistetaan ensimmäinen osamäärä ja jakojäännös; muissa vain lopputulos. | 32…62 | multiply: polku: M-MUL-01; divide: oma sisältö | – | – | families.ts M-WRDIV/* |
| `M-WRMUL/column` | gi | numeric | kirjoittaa luvun | Osatulot näkyvät; perheessä step tarkistetaan muistinumero, muissa vain lopputulos. | 92…729 | multiply: oma sisältö | – | – | families.ts M-WRMUL/* |
| `M-WRMUL/parts` | gi | place | sijoittaa osat oikeille paikoille | Osatulot näkyvät; perheessä step tarkistetaan muistinumero, muissa vain lopputulos. | – | multiply: oma sisältö | – | – | families.ts M-WRMUL/* |
| `M-WRMUL/partial` | gi | numeric | kirjoittaa luvun | Osatulot näkyvät; perheessä step tarkistetaan muistinumero, muissa vain lopputulos. | 378…2322 | multiply: oma sisältö | – | – | families.ts M-WRMUL/* |
| `M-WRMUL/check` | gi | choice | valitsee oikean vaihtoehdon | Osatulot näkyvät; perheessä step tarkistetaan muistinumero, muissa vain lopputulos. | – | multiply: oma sisältö | – | – | families.ts M-WRMUL/* |
| `M-WRMUL/step` | gi | numeric | kirjoittaa luvun | Osatulot näkyvät; perheessä step tarkistetaan muistinumero, muissa vain lopputulos. | 0…9 | multiply: oma sisältö | – | – | families.ts M-WRMUL/* |
| `M-WRMUL/transfer` | t | numeric | kirjoittaa luvun | Osatulot näkyvät; perheessä step tarkistetaan muistinumero, muissa vain lopputulos. | 342…1452 | multiply: oma sisältö | – | – | families.ts M-WRMUL/* |
| `M-WRSUB/check` | gi | choice | valitsee oikean vaihtoehdon | Perheessä step tarkistetaan lainaus; muissa vain lopputulos. | – | – | – | – | families.ts M-WRSUB/* |
| `M-WRSUB/flip` | gi | choice | valitsee oikean vaihtoehdon | Perheessä step tarkistetaan lainaus; muissa vain lopputulos. | – | – | – | – | families.ts M-WRSUB/* |
| `M-WRSUB/column` | gi | numeric | kirjoittaa luvun | Perheessä step tarkistetaan lainaus; muissa vain lopputulos. | 114…763 | – | – | – | families.ts M-WRSUB/* |
| `M-WRSUB/step` | gi | numeric | kirjoittaa luvun | Perheessä step tarkistetaan lainaus; muissa vain lopputulos. | 2…9 | – | – | – | families.ts M-WRSUB/* |
| `M-WRSUB/needs` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | Perheessä step tarkistetaan lainaus; muissa vain lopputulos. | – | – | – | – | families.ts M-WRSUB/* |
| `M-WRSUB/transfer` | t | numeric | kirjoittaa luvun | Perheessä step tarkistetaan lainaus; muissa vain lopputulos. | 7…689 | – | – | – | families.ts M-WRSUB/* |
| `M-NEG-02/order` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-02/read` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-02/place` | gi | line | merkitsee kohdan lukusuoralle | – | -7…-1 | negative: oma sisältö | – | – | oletus |
| `M-NEG-02/sort` | gi | place | sijoittaa osat oikeille paikoille | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-02/transfer` | t | line | merkitsee kohdan lukusuoralle | – | -8…-3 | negative: oma sisältö | – | – | oletus |
| `M-NEG-03/colder` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-03/order` | gi | place | sijoittaa osat oikeille paikoille | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-03/bigger` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-03/symbol` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-FRAC-02/shade` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-02/trap` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-02/name` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-02/build` | gi | place | sijoittaa osat oikeille paikoille | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-DEC-01/line` | gi | line | merkitsee kohdan lukusuoralle | – | 0.1…0.9 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-01/names` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-01/bar` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-01/over` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-01/transfer` | t | line | merkitsee kohdan lukusuoralle | – | 1.1…1.9 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-FRAC-06/missing` | gi | numeric | kirjoittaa luvun | – | 2…12 | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-FRAC-06/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-FRAC-06/same` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-06/family` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-06/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-DEC-02/equal` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-02/digit` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-02/grid` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-02/same` | gi | numeric | kirjoittaa luvun | – | 10…90 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-FRAC-03/same` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | `M-FRAC-05` (same), `M-FRAC-05` (samannimisten vertailu), `M-FRAC-11` (siirtotehtävä: kaksi osaa yhteen) | `M-FRAC-05` | families.ts M-FRAC-03/*; scope manifest M-FRAC-03/same |
| `M-FRAC-03/unit` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | `M-FRAC-05` (samannimisten vertailu), `M-FRAC-11` (siirtotehtävä: kaksi osaa yhteen) | – | families.ts M-FRAC-03/* |
| `M-FRAC-03/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | `M-FRAC-05` (samannimisten vertailu), `M-FRAC-11` (siirtotehtävä: kaksi osaa yhteen) | – | families.ts M-FRAC-03/* |
| `M-FRAC-03/order` | gi | place | sijoittaa osat oikeille paikoille | – | – | fraction: oma sisältö | `M-FRAC-05` (samannimisten vertailu), `M-FRAC-11` (siirtotehtävä: kaksi osaa yhteen) | – | families.ts M-FRAC-03/* |
| `M-FRAC-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | `M-FRAC-11` (transfer (two shares of a pie)), `M-FRAC-05` (samannimisten vertailu), `M-FRAC-11` (siirtotehtävä: kaksi osaa yhteen) | `M-FRAC-11` | families.ts M-FRAC-03/*; scope manifest M-FRAC-03/transfer |
| `M-FRAC-08/simplest` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-08/factor` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; divide: polku: M-DIVIS-01 | – | – | oletus |
| `M-FRAC-08/simplify` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-08/reduce` | gi | place | sijoittaa osat oikeille paikoille | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-08/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-DEC-03/mmPair` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: oma sisältö; convertLength: annettu: Tehtävä kertoo, montako pientä yksikköä on isossa. | – | – | families.ts M-DEC-03/* |
| `M-DEC-03/digit` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | families.ts M-DEC-03/* |
| `M-DEC-03/mm` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02; convertLength: annettu: Tehtävä kertoo, montako pientä yksikköä on isossa. | – | – | families.ts M-DEC-03/* |
| `M-DEC-03/write` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | families.ts M-DEC-03/* |
| `M-DEC-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02; convertMass: annettu: Tehtävä kertoo, montako pientä yksikköä on isossa. | – | – | families.ts M-DEC-03/* |
| `M-FRAC-05/order` | gi | place | sijoittaa osat oikeille paikoille | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-05/symbol` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-05/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-05/half` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-05/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-11/missing` | gi | numeric | kirjoittaa luvun | – | 1…6 | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-11/picture` | gi | numeric | kirjoittaa luvun | – | 2…7 | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-11/add` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-11/sums` | gi | place | sijoittaa osat oikeille paikoille | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-11/transfer` | t | choice | valitsee oikean vaihtoehdon | Jäljelle jäävän osan voi laskea myös kuvan paloista; vastaus ei yksin näytä vähennyslaskutaitoa. | – | fraction: oma sisältö | `M-FRAC-12` (transfer), `M-FRAC-12` (selitys: n/n − (a+b)/n) | `M-FRAC-12` | families.ts M-FRAC-11/transfer |
| `M-FRAC-12/whole` | gi | numeric | kirjoittaa luvun | – | 1…9 | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-12/picture` | gi | numeric | kirjoittaa luvun | – | 1…6 | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-12/sub` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-12/diffs` | gi | place | sijoittaa osat oikeille paikoille | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-12/transfer` | t | numeric | kirjoittaa luvun | – | 1…10 | fraction: oma sisältö | – | – | oletus |
| `M79-RECIP-01/whole` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: ei vaadita: Negatiivinen luku on vain väärä vaihtoehto.; decimal: ei vaadita: Desimaaliluku on vain väärä vaihtoehto.; fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | families.ts M79-RECIP-01/* |
| `M79-RECIP-01/missing` | gi | numeric | kirjoittaa luvun | – | 3…9 | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | families.ts M79-RECIP-01/* |
| `M79-RECIP-01/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: ei vaadita: Negatiivinen luku on vain väärä vaihtoehto.; fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | families.ts M79-RECIP-01/* |
| `M79-RECIP-01/pairs` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | families.ts M79-RECIP-01/* |
| `M79-RECIP-01/transfer` | t | numeric | kirjoittaa luvun | – | 3…10 | fraction: oma sisältö; multiply: polku: M-MUL-01; divide: polku: M-MULDIV-01 | – | – | families.ts M79-RECIP-01/* |
| `M-DEC-DECOMPOSE/compose` | gi | numeric | kirjoittaa luvun | – | 1.05…9.65 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-DECOMPOSE/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö | – | – | oletus |
| `M-DEC-DECOMPOSE/missing` | gi | numeric | kirjoittaa luvun | – | 0.01…0.09 | decimal: oma sisältö | – | – | oletus |
| `M-DEC-DECOMPOSE/parts` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: oma sisältö | – | – | oletus |
| `M-DEC-DECOMPOSE/transfer` | t | numeric | kirjoittaa luvun | – | 1.23…9.84 | decimal: oma sisältö; fraction: polku: M-FRAC-02; multiply: rekisteri: M-MUL-01 | `M-MUL-01` (selitys: kolikoiden määrä × arvo) | – | families.ts M-DEC-DECOMPOSE/transfer |
| `M-DEC-READ/unit` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-READ/hundredths` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-READ/tenths` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-READ/fromWords` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-READ/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-WRITE/build` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-WRITE/hundredths` | gi | numeric | kirjoittaa luvun | – | 1.03…9.09 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-WRITE/tenths` | gi | numeric | kirjoittaa luvun | – | 0.1…9.9 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-WRITE/teens` | gi | numeric | kirjoittaa luvun | – | 1.37…9.76 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-WRITE/transfer` | t | numeric | kirjoittaa luvun | – | 1.02…4.09 | decimal: oma sisältö; fraction: polku: M-FRAC-02; convertLength: annettu: 1 cm = 0,01 m on kerrottu. | – | – | families.ts M-DEC-WRITE/transfer |
| `M-FRAC-15/whole` | gi | numeric | kirjoittaa luvun | – | 1…1 | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-FRAC-15/count` | gi | numeric | kirjoittaa luvun | – | 2…25 | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-FRAC-15/repeat` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-FRAC-15/line` | gi | place | sijoittaa osat oikeille paikoille | – | – | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-FRAC-15/transfer` | t | numeric | kirjoittaa luvun | – | 3…9 | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-DEC-04/numeral` | gi | place | kokoaa annetuista korteista saman määrän numeron, sanallisen kuvauksen ja nimetyt lukuyksiköt | Ei vapaata kirjoitusta, puhetta tai kaikkien atomisten osataitojen itsenäisen hallinnan näyttöä. | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | families.ts M-DEC-04/* |
| `M-DEC-04/words` | gi | place | kokoaa annetuista korteista saman määrän numeron, sanallisen kuvauksen ja nimetyt lukuyksiköt | Ei vapaata kirjoitusta, puhetta tai kaikkien atomisten osataitojen itsenäisen hallinnan näyttöä. | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | families.ts M-DEC-04/* |
| `M-DEC-04/repair` | gi | place | kokoaa annetuista korteista saman määrän numeron, sanallisen kuvauksen ja nimetyt lukuyksiköt | Ei vapaata kirjoitusta, puhetta tai kaikkien atomisten osataitojen itsenäisen hallinnan näyttöä. | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | families.ts M-DEC-04/* |
| `M-DEC-04/transfer` | t | place | kokoaa annetuista korteista saman määrän numeron, sanallisen kuvauksen ja nimetyt lukuyksiköt | Ei vapaata kirjoitusta, puhetta tai kaikkien atomisten osataitojen itsenäisen hallinnan näyttöä. | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | families.ts M-DEC-04/*; families.ts M-DEC-04/transfer |
| `M-ALG-04/match` | gi | place | tunnistaa vielä tuntemattoman määrän tai luvun ja erottaa sen annetusta tiedosta | Ei yhtälönratkaisua tai tuntemattoman lukuarvon tuottamista; valmiiden kuvausten valinta ei todenna fyysistä peittämis- ja paljastamistoimintaa. | – | – | – | – | families.ts M-ALG-04/* |
| `M-ALG-04/known` | gi | multi | tunnistaa vielä tuntemattoman määrän tai luvun ja erottaa sen annetusta tiedosta | Ei yhtälönratkaisua tai tuntemattoman lukuarvon tuottamista; valmiiden kuvausten valinta ei todenna fyysistä peittämis- ja paljastamistoimintaa. | – | – | – | – | families.ts M-ALG-04/* |
| `M-ALG-04/meaning` | gi | choice | tunnistaa vielä tuntemattoman määrän tai luvun ja erottaa sen annetusta tiedosta | Ei yhtälönratkaisua tai tuntemattoman lukuarvon tuottamista; valmiiden kuvausten valinta ei todenna fyysistä peittämis- ja paljastamistoimintaa. | – | – | – | – | families.ts M-ALG-04/* |
| `M-ALG-04/same` | gi | choice | tunnistaa vielä tuntemattoman määrän tai luvun ja erottaa sen annetusta tiedosta | Ei yhtälönratkaisua tai tuntemattoman lukuarvon tuottamista; valmiiden kuvausten valinta ei todenna fyysistä peittämis- ja paljastamistoimintaa. | – | – | – | – | families.ts M-ALG-04/* |
| `M-ALG-04/transfer` | t | choice | tunnistaa vielä tuntemattoman määrän tai luvun ja erottaa sen annetusta tiedosta | Ei yhtälönratkaisua tai tuntemattoman lukuarvon tuottamista; valmiiden kuvausten valinta ei todenna fyysistä peittämis- ja paljastamistoimintaa. | – | – | – | – | families.ts M-ALG-04/* |
| `M-DEC-08/shift` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M-DEC-08/tens` | gi | numeric | kirjoittaa luvun | – | 12.3…9920 | decimal: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M-DEC-08/whole` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02; multiply: oma sisältö | – | – | oletus |
| `M-DEC-08/repeated` | gi | numeric | kirjoittaa luvun | – | 0.4…9 | decimal: oma sisältö; fraction: polku: M-FRAC-02; multiply: oma sisältö | – | – | oletus |
| `M-DEC-08/transfer` | t | numeric | kirjoittaa luvun | – | 30…150 | decimal: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M-DEC-09/money` | gi | numeric | kirjoittaa luvun | – | 0.5…2.5 | decimal: oma sisältö | – | – | oletus |
| `M-DEC-09/tens` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; divide: oma sisältö | – | – | oletus |
| `M-DEC-09/share` | gi | numeric | kirjoittaa luvun | – | 1.1…2.9 | decimal: oma sisältö; fraction: polku: M-FRAC-02; multiply: polku: M-MUL-01; divide: oma sisältö | – | – | oletus |
| `M-DEC-09/steps` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02; divide: oma sisältö | – | – | oletus |
| `M-DEC-09/transfer` | t | numeric | kirjoittaa luvun | – | 0.05…0.95 | decimal: oma sisältö; divide: oma sisältö; convertLength: annettu: Metrissä on 100 senttiä on kerrottu. | – | – | families.ts M-DEC-09/transfer |
| `M-DEC-ADD/detective` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-ADD/mixed` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö | – | – | oletus |
| `M-DEC-ADD/tenths` | gi | numeric | kirjoittaa luvun | – | 0.2…1.8 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-ADD/sub` | gi | numeric | kirjoittaa luvun | – | 0.3…7.1 | decimal: oma sisältö | – | – | oletus |
| `M-DEC-ADD/transfer` | t | numeric | kirjoittaa luvun | – | 0.75…2.25 | decimal: oma sisältö | – | – | oletus |
| `M-ALG-05/balance` | gi | numeric | kirjoittaa luvun | – | 1…12 | – | – | – | oletus |
| `M-ALG-05/truth` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ALG-05/both` | gi | numeric | kirjoittaa luvun | – | 1…13 | – | – | – | oletus |
| `M-ALG-05/level` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-ALG-05/transfer` | t | numeric | kirjoittaa luvun | – | 15…38 | – | – | – | oletus |
| `M79-VAR-UNKNOWN/tags` | gi | numeric | kirjoittaa luvun | – | 4…25 | multiply: rekisteri: M-MULTAB-ALL | `M-MULTAB-ALL` | `M-MULTAB-ALL` | families.ts M79-VAR-UNKNOWN/tags |
| `M79-VAR-UNKNOWN/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-VAR-UNKNOWN/solve` | gi | numeric | kirjoittaa luvun | – | 3…15 | – | – | – | oletus |
| `M79-VAR-UNKNOWN/bags` | gi | numeric | kirjoittaa luvun | – | 3…9 | – | – | – | oletus |
| `M79-VAR-UNKNOWN/sort` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M79-VAR-UNKNOWN/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-VAR-VARYING/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-VAR-VARYING/fill` | gi | numeric | kirjoittaa luvun | – | 5…34 | multiply: rekisteri: M-MULTAB-ALL | `M79-EXPR-EVAL`, `M-MULTAB-ALL` | `M79-EXPR-EVAL` | families.ts M79-VAR-VARYING/fill |
| `M79-VAR-VARYING/step` | gi | numeric | kirjoittaa luvun | – | 2…9 | – | – | – | oletus |
| `M79-VAR-VARYING/grow` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M79-VAR-VARYING/transfer` | t | numeric | kirjoittaa luvun | – | 2…3 | – | – | – | oletus |
| `M-ALG-06/spot` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M-ALG-06/fromBalance` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ALG-06/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ALG-06/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ALG-06/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-VAR-01/can` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-VAR-01/same` | gi | numeric | kirjoittaa luvun | – | 3…12 | – | – | – | oletus |
| `M79-VAR-01/classify` | gi | choice | valitsee oikean vaihtoehdon | – | – | perimeter: annettu: Kaava piiri = 4s on annettu. | – | `M-GMEAS-01` | families.ts M79-VAR-01/classify |
| `M79-VAR-01/roles` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M79-VAR-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | perimeter: annettu: Kaava piiri = 4s on annettu. | – | `M-GMEAS-01` | families.ts M79-VAR-01/transfer |
| `M-ALG-07/balance` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | `M-MULTAB-ALL` | `M-MULTAB-ALL` | families.ts M-ALG-07/* |
| `M-ALG-07/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MULTAB-ALL | `M-MULTAB-ALL` | `M-MULTAB-ALL` | families.ts M-ALG-07/* |
| `M-ALG-07/test` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | `M-MULTAB-ALL` | `M-MULTAB-ALL` | families.ts M-ALG-07/* |
| `M-ALG-07/steer` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | `M-MULTAB-ALL` | `M-MULTAB-ALL` | families.ts M-ALG-07/* |
| `M-ALG-07/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MULTAB-ALL | `M-MULTAB-ALL` | `M-MULTAB-ALL` | families.ts M-ALG-07/* |
| `M79-EXPR-EVAL/neg` | gi | numeric | kirjoittaa luvun | – | -20…6 | negative: rekisteri: M79-INT-MUL; multiply: polku: M-MUL-02 | `M79-INT-MUL`, `M79-INT-ADD` | `M79-INT-MUL` | families.ts M79-EXPR-EVAL/neg |
| `M79-EXPR-EVAL/paren` | gi | numeric | kirjoittaa luvun | – | 8…60 | multiply: polku: M-MUL-02 | – | – | oletus |
| `M79-EXPR-EVAL/linear` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-02 | – | – | oletus |
| `M79-EXPR-EVAL/match` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M79-EXPR-EVAL/transfer` | t | numeric | kirjoittaa luvun | – | 11…42 | multiply: polku: M-MUL-02 | – | – | oletus |
| `M79-EXPR-FORM/shape` | gi | choice | valitsee oikean vaihtoehdon | Valitsee lausekkeen tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | multiply: polku: M-MULTREL-01; perimeter: rekisteri: M-GMEAS-01 | `M-GMEAS-01`, `M-GMEAS-01` (shape) | `M-GMEAS-01` | families.ts M79-EXPR-FORM/*; families.ts M79-EXPR-FORM/shape |
| `M79-EXPR-FORM/price` | gi | choice | valitsee oikean vaihtoehdon | Valitsee lausekkeen tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EXPR-FORM/* |
| `M79-EXPR-FORM/words` | gi | choice | valitsee oikean vaihtoehdon | Valitsee lausekkeen tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EXPR-FORM/* |
| `M79-EXPR-FORM/build` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | Valitsee lausekkeen tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EXPR-FORM/* |
| `M79-EXPR-FORM/translate` | gi | place | sijoittaa osat oikeille paikoille | Valitsee lausekkeen tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EXPR-FORM/* |
| `M79-EXPR-FORM/transfer` | t | choice | valitsee oikean vaihtoehdon | Valitsee lausekkeen tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | multiply: polku: M-MULTREL-01 | – | – | families.ts M79-EXPR-FORM/* |
| `M-ALG-08/sub` | gi | numeric | kirjoittaa luvun | – | 3…24 | – | – | – | oletus |
| `M-ALG-08/mul` | gi | numeric | kirjoittaa luvun | – | 3…9 | multiply: polku: M-MUL-01; divide: polku: M-MULDIV-01 | – | – | oletus |
| `M-ALG-08/add` | gi | numeric | kirjoittaa luvun | – | 3…15 | – | – | – | oletus |
| `M-ALG-08/undo` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-ALG-08/transfer` | t | numeric | kirjoittaa luvun | – | 4…15 | – | – | – | oletus |
| `M-UNIT-01/other` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertVolume: oma sisältö; convertMass: oma sisältö | `M-MUL-01` (kertoimet 10, 100, 1000) | – | families.ts M-UNIT-01/* |
| `M-UNIT-01/steps` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertLength: oma sisältö | `M-MUL-01` (kertoimet 10, 100, 1000) | – | families.ts M-UNIT-01/* |
| `M-UNIT-01/prefix` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: polku: M-DEC-04; fraction: polku: M-FRAC-02; convertLength: oma sisältö | `M-MUL-01` (kertoimet 10, 100, 1000) | – | families.ts M-UNIT-01/* |
| `M-UNIT-01/build` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | `M-MUL-01` (kertoimet 10, 100, 1000) | – | families.ts M-UNIT-01/* |
| `M-UNIT-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | `M-MUL-01` (kertoimet 10, 100, 1000) | – | families.ts M-UNIT-01/* |
| `M79-EQ1-FORM/balance` | gi | choice | valitsee oikean vaihtoehdon | Valitsee yhtälön tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EQ1-FORM/* |
| `M79-EQ1-FORM/age` | gi | choice | valitsee oikean vaihtoehdon | Valitsee yhtälön tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EQ1-FORM/* |
| `M79-EQ1-FORM/shop` | gi | choice | valitsee oikean vaihtoehdon | Valitsee yhtälön tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EQ1-FORM/* |
| `M79-EQ1-FORM/build` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | Valitsee yhtälön tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EQ1-FORM/* |
| `M79-EQ1-FORM/parts` | gi | place | sijoittaa osat oikeille paikoille | Valitsee yhtälön tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EQ1-FORM/* |
| `M79-EQ1-FORM/transfer` | t | choice | valitsee oikean vaihtoehdon | Valitsee yhtälön tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | perimeter: rekisteri: M-GMEAS-01 | `M-GMEAS-01`, `M-GMEAS-01` (transfer) | `M-GMEAS-01` | families.ts M79-EQ1-FORM/*; families.ts M79-EQ1-FORM/transfer |
| `M-UNIT-02/cm-m-3` | gi | numeric | kirjoittaa luvun | – | 1…9 | divide: rekisteri: M-DIV-01; convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-02/km-m-2` | gi | numeric | kirjoittaa luvun | – | 1000…9000 | multiply: rekisteri: M-MUL-01; convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-02/cm-mm-1` | gi | numeric | kirjoittaa luvun | – | 30…400 | multiply: rekisteri: M-MUL-01; convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-02/m-cm-0` | gi | numeric | kirjoittaa luvun | – | 100…900 | multiply: rekisteri: M-MUL-01; convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-02/mm-cm-4` | gi | numeric | kirjoittaa luvun | – | 2…29 | divide: rekisteri: M-DIV-01; convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-02/match` | gi | place | sijoittaa osat oikeille paikoille | – | – | convertLength: oma sisältö; decimal: polku: M-DEC-04 | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-02/sense` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-02/transfer` | t | numeric | kirjoittaa luvun | – | 4…30 | convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-03/kg-g-3` | gi | numeric | kirjoittaa luvun | – | 1000…4000 | multiply: rekisteri: M-MUL-01; convertMass: oma sisältö; decimal: polku: M-DEC-04 | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-06` | families.ts M-UNIT-03/* |
| `M-UNIT-03/g-kg-2` | gi | numeric | kirjoittaa luvun | – | 1…9 | divide: rekisteri: M-DIV-01; convertMass: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-06` | families.ts M-UNIT-03/* |
| `M-UNIT-03/t-kg-1` | gi | numeric | kirjoittaa luvun | – | 1000…5000 | multiply: rekisteri: M-MUL-01 | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-06` | families.ts M-UNIT-03/* |
| `M-UNIT-03/kg-g-0` | gi | numeric | kirjoittaa luvun | – | 1000…9000 | multiply: rekisteri: M-MUL-01; convertMass: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-06` | families.ts M-UNIT-03/* |
| `M-UNIT-03/match` | gi | place | sijoittaa osat oikeille paikoille | – | – | convertMass: oma sisältö; decimal: polku: M-DEC-04 | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-06` | families.ts M-UNIT-03/* |
| `M-UNIT-03/sense` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | convertMass: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-06` | families.ts M-UNIT-03/* |
| `M-UNIT-03/transfer` | t | numeric | kirjoittaa luvun | – | 4…20 | convertMass: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-06` | families.ts M-UNIT-03/* |
| `M-UNIT-04/dl-l-3` | gi | numeric | kirjoittaa luvun | – | 1…9 | divide: rekisteri: M-DIV-01; convertVolume: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-04/dl-ml-2` | gi | numeric | kirjoittaa luvun | – | 100…900 | multiply: rekisteri: M-MUL-01; convertVolume: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-04/l-ml-1` | gi | numeric | kirjoittaa luvun | – | 1000…5000 | multiply: rekisteri: M-MUL-01; convertVolume: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-04/l-dl-0` | gi | numeric | kirjoittaa luvun | – | 10…90 | multiply: rekisteri: M-MUL-01; convertVolume: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-04/l-cl-4` | gi | numeric | kirjoittaa luvun | – | 100…500 | multiply: rekisteri: M-MUL-01 | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-04/match` | gi | place | sijoittaa osat oikeille paikoille | – | – | convertVolume: oma sisältö; decimal: polku: M-DEC-04 | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-04/sense` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | convertVolume: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-04/transfer` | t | numeric | kirjoittaa luvun | – | 5…8 | decimal: polku: M-DEC-04; convertVolume: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-05/back` | gi | numeric | kirjoittaa luvun | – | 2…4 | divide: polku: M-DIV-01 | `M-MUL-01`, `M-DIV-01` · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/* |
| `M-UNIT-05/mixed` | gi | numeric | kirjoittaa luvun | – | 70…225 | convertTime: oma sisältö | `M-MUL-01`, `M-DIV-01` · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/* |
| `M-UNIT-05/mins` | gi | numeric | kirjoittaa luvun | – | 120…360 | multiply: polku: M-MUL-01; convertTime: oma sisältö | `M-MUL-01`, `M-DIV-01` · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/* |
| `M-UNIT-05/hmin` | gi | numeric | kirjoittaa luvun | – | 120…300 | multiply: polku: M-MUL-01; convertTime: oma sisältö | `M-MUL-01`, `M-DIV-01` · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/* |
| `M-UNIT-05/hhmm` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: ei vaadita: Selitys nimeää ansan (1,5 h); tehtävä ratkeaa 60 minuutin paloilla ilman desimaalilaskua.; convertTime: oma sisältö | `M-MUL-01`, `M-DIV-01` · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/*; families.ts M-UNIT-05/hhmm |
| `M-UNIT-05/day` | gi | numeric | kirjoittaa luvun | – | 48…96 | multiply: polku: M-MUL-01 | `M-MUL-01`, `M-DIV-01` · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/* |
| `M-UNIT-05/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | clock: rekisteri: M-TIME-02; convertTime: oma sisältö | `M-MUL-01`, `M-DIV-01`, `M-TIME-02`, `M-TIME-02` (transfer) · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-TIME-02`, `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/*; families.ts M-UNIT-05/transfer |
| `PHY79-SPEED-UNIT/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MULTREL-01; speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-UNIT/factory` | gi | place | sijoittaa osat oikeille paikoille | – | – | speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-UNIT/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-UNIT/ms` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MULTREL-01; speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-UNIT/kmh` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-UNIT/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö | – | – | oletus |
| `M-DATA-09/order` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-09/fix` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-09/method` | gi | choice | valitsee oikean vaihtoehdon | – | – | clock: ei vaadita: Vaihtoehdossa mainitaan kellonaika; sitä ei lueta eikä lasketa. | – | – | families.ts M-DATA-09/method |
| `M-DATA-09/steps` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-DATA-09/compare` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-09/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-10/shape` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-10/cell` | gi | numeric | kirjoittaa luvun | – | 0…4 | – | – | – | oletus |
| `M-DATA-10/listToTable` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-10/fill` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-DATA-10/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-COORD-READ-Q1/axis` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-COORD-READ-Q1/whichPin` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-COORD-READ-Q1/read` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-COORD-READ-Q1/label` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-COORD-READ-Q1/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-COORD-PLOT-Q1/story` | gi | plot | piirtää pisteet kuvaajaan | – | – | coordinate: oma sisältö | – | – | oletus |
| `M-COORD-PLOT-Q1/onAxis` | gi | plot | piirtää pisteet kuvaajaan | – | – | coordinate: oma sisältö | – | – | oletus |
| `M-COORD-PLOT-Q1/plot` | gi | plot | piirtää pisteet kuvaajaan | – | – | coordinate: oma sisältö | – | – | oletus |
| `M-COORD-PLOT-Q1/fromShip` | gi | plot | piirtää pisteet kuvaajaan | – | – | coordinate: oma sisältö | – | – | oletus |
| `M-COORD-PLOT-Q1/transfer` | t | plot | piirtää pisteet kuvaajaan | – | – | coordinate: oma sisältö | – | – | oletus |
| `M-COORD-01/move` | gi | plot | piirtää pisteet kuvaajaan | – | – | coordinate: oma sisältö | – | – | oletus |
| `M-COORD-01/readPoly` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-COORD-01/corner` | gi | plot | piirtää pisteet kuvaajaan | – | – | coordinate: oma sisältö | – | – | oletus |
| `M-COORD-01/build` | gi | plot | piirtää pisteet kuvaajaan | – | – | coordinate: oma sisältö | – | – | oletus |
| `M-COORD-01/transfer` | t | plot | piirtää pisteet kuvaajaan | – | – | coordinate: oma sisältö | – | – | oletus |
| `M-COORD-02/quadrant` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M-COORD-02/read` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M-COORD-02/plot` | gi | plot | piirtää pisteet kuvaajaan | – | – | negative: polku: M-NEG-02; coordinate: oma sisältö | – | – | oletus |
| `M-COORD-02/sortQ` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M-COORD-02/transfer` | t | plot | piirtää pisteet kuvaajaan | – | – | negative: polku: M-NEG-02; coordinate: oma sisältö | `M-SYM-01` (transfer (axis reflection)), `M-SYM-01` (peilaus akselin yli) | `M-SYM-01` | families.ts M-COORD-02/transfer |
| `SCI-ENV-MEAS-01/repeat` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-MEAS-01/unit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-MEAS-01/toolUnit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-MEAS-01/scale` | gi | numeric | kirjoittaa luvun | – | 1…19 | – | – | – | oletus |
| `SCI-ENV-MEAS-01/fit` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-MEAS-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-DATA-01/most` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-DATA-01/table` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-DATA-01/fill` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-DATA-01/total` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-DATA-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-DATA-01/sim` | gi | numeric | kirjoittaa luvun | – | 6…24 | – | – | – | oletus |
| `PHY79-DATA-01/fill` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `PHY79-DATA-01/header` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-DATA-01/table` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-DATA-01/transfer` | t | numeric | kirjoittaa luvun | – | 2…20 | – | `M-DATA-05` | `M-DATA-05` | families.ts PHY79-DATA-01/transfer |
| `M79-FRAC-MUL/half` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; multiply: oma sisältö | `M-FRAC-08` (demo (simplifying the product)), `M-FRAC-08` (malli: tulon supistaminen) | `M-FRAC-08` | families.ts M79-FRAC-MUL/* |
| `M79-FRAC-MUL/calc` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; multiply: oma sisältö | `M-FRAC-08` (demo (simplifying the product)), `M-FRAC-08` (malli: tulon supistaminen) | `M-FRAC-08` | families.ts M79-FRAC-MUL/* |
| `M79-FRAC-MUL/area` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; multiply: oma sisältö | `M-FRAC-08` (demo (simplifying the product)), `M-FRAC-08` (malli: tulon supistaminen) | `M-FRAC-08` | families.ts M79-FRAC-MUL/* |
| `M79-FRAC-MUL/match` | gi | place | sijoittaa osat oikeille paikoille | – | – | fraction: oma sisältö; multiply: oma sisältö | `M-FRAC-08` (demo (simplifying the product)), `M-FRAC-08` (malli: tulon supistaminen) | `M-FRAC-08` | families.ts M79-FRAC-MUL/* |
| `M79-FRAC-MUL/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; multiply: oma sisältö | `M-FRAC-08` (demo (simplifying the product)), `M-FRAC-08` (malli: tulon supistaminen) | `M-FRAC-08` | families.ts M79-FRAC-MUL/* |
| `M79-FRAC-DIV/bigger` | gi | choice | valitsee oikean vaihtoehdon | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | – | decimal: ei vaadita: Selityksen 2,5 havainnollistaa; vertailun voi tehdä ilman desimaalijakoa.; fraction: oma sisältö; divide: oma sisältö | – | – | families.ts M79-FRAC-DIV/*; families.ts M79-FRAC-DIV/bigger |
| `M79-FRAC-DIV/rule` | gi | choice | valitsee oikean vaihtoehdon | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | – | fraction: oma sisältö; divide: oma sisältö | – | – | families.ts M79-FRAC-DIV/* |
| `M79-FRAC-DIV/fracFrac` | gi | numeric | kirjoittaa luvun | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | 2…8 | fraction: oma sisältö; divide: oma sisältö | – | – | families.ts M79-FRAC-DIV/* |
| `M79-FRAC-DIV/groups` | gi | numeric | kirjoittaa luvun | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | 4…25 | fraction: oma sisältö; multiply: polku: M79-FRAC-MUL; divide: oma sisältö | – | – | families.ts M79-FRAC-DIV/* |
| `M79-FRAC-DIV/calc` | gi | frac | kirjoittaa murtoluvun (samanarvoiset murtoluvut hyväksytään) | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | – | fraction: oma sisältö; multiply: polku: M79-FRAC-MUL; divide: oma sisältö | – | – | families.ts M79-FRAC-DIV/* |
| `M79-FRAC-DIV/grow` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | – | – | – | – | families.ts M79-FRAC-DIV/* |
| `M79-FRAC-DIV/transfer` | t | numeric | kirjoittaa luvun | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | 3…7 | fraction: oma sisältö; divide: oma sisältö | – | – | families.ts M79-FRAC-DIV/* |
| `M79-DEC-DIV/grows` | gi | choice | valitsee oikean vaihtoehdon | – | – | divide: oma sisältö; decimal: oma sisältö | – | – | oletus |
| `M79-DEC-DIV/compute` | gi | numeric | kirjoittaa luvun | – | 2…9 | decimal: oma sisältö; divide: oma sisältö | – | – | oletus |
| `M79-DEC-DIV/scale` | gi | numeric | kirjoittaa luvun | – | 2…9 | decimal: oma sisältö; multiply: polku: M-MUL-01; divide: oma sisältö | – | – | oletus |
| `M79-DEC-DIV/shift` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: oma sisältö; divide: oma sisältö | – | – | oletus |
| `M79-DEC-DIV/transfer` | t | numeric | kirjoittaa luvun | – | 5…25 | decimal: oma sisältö; divide: oma sisältö; speedUnit: annettu: Muuntokerroin 3,6 on annettu. | – | `PHY79-SPEED-UNIT` | families.ts M79-DEC-DIV/transfer |
| `M79-PROP-01/taste` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | divide: polku: M-DIV-02 | – | – | oletus |
| `M79-PROP-01/recipe` | gi | numeric | kirjoittaa luvun | – | 4…16 | multiply: polku: M-MULTREL-01 | – | – | oletus |
| `M79-PROP-01/missing` | gi | numeric | kirjoittaa luvun | – | 8…45 | divide: polku: M-DIV-02 | – | – | oletus |
| `M79-PROP-01/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MULTREL-01; divide: polku: M-DIV-02 | – | – | oletus |
| `M79-PROP-01/transfer` | t | numeric | kirjoittaa luvun | – | 18…60 | multiply: polku: M-MULTREL-01; divide: polku: M-DIV-02; decimal: rekisteri: M-DEC-08 | `M-DEC-08` | `M-DEC-08` | families.ts M79-PROP-01/transfer |
| `PHY79-SPEED-CALC/sim` | gi | numeric | kirjoittaa luvun | – | 2…8 | speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-CALC/slot` | gi | place | sijoittaa osat oikeille paikoille | – | – | speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-CALC/kmh` | gi | numeric | kirjoittaa luvun | – | 40…80 | speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-CALC/ms` | gi | numeric | kirjoittaa luvun | – | 2…9 | speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-CALC/transfer` | t | numeric | kirjoittaa luvun | – | 6…10 | decimal: rekisteri: M-DEC-ADD; speedUnit: oma sisältö | `M-DEC-ADD` | `M-DEC-ADD` | families.ts PHY79-SPEED-CALC/transfer |
| `M79-DEP-01/pattern` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-DEP-01/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-DEP-01/depends` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-DEP-01/sort` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M79-DEP-01/transfer` | t | choice | yhdistää annetun ajan sille annettuun vesimäärään | Ei kertolaskua tai taulukon ulkopuolelle ennustamista. | – | – | – | – | families.ts M79-DEP-01/transfer |
| `M79-FUNC-01/isFunc` | gi | choice | lukee annetun arvoparin tai tunnistaa yksi syöte–yksi arvo -ehdon annetulla äärellisellä joukolla | Ei lausekkeen arvon laskemista, vapaata funktion tuottamista tai tuntemattoman koneen yleisen toiminnan todistamista. | – | – | – | – | families.ts M79-FUNC-01/* |
| `M79-FUNC-01/rule` | gi | choice | lukee annetun arvoparin tai tunnistaa yksi syöte–yksi arvo -ehdon annetulla äärellisellä joukolla | Ei lausekkeen arvon laskemista, vapaata funktion tuottamista tai tuntemattoman koneen yleisen toiminnan todistamista. | – | – | – | – | families.ts M79-FUNC-01/* |
| `M79-FUNC-01/run` | gi | choice | lukee sallitulle syötteelle annetun arvon | Ei lausekkeen arvon laskemista, vapaata funktion tuottamista tai tuntemattoman koneen yleisen toiminnan todistamista. | – | – | `M79-EXPR-EVAL` | `M79-EXPR-EVAL` | families.ts M79-FUNC-01/*; families.ts M79-FUNC-01/run |
| `M79-FUNC-01/pairs` | gi | sort | lukee annetun arvoparin tai tunnistaa yksi syöte–yksi arvo -ehdon annetulla äärellisellä joukolla | Ei lausekkeen arvon laskemista, vapaata funktion tuottamista tai tuntemattoman koneen yleisen toiminnan todistamista. | – | – | – | – | families.ts M79-FUNC-01/* |
| `M79-FUNC-01/transfer` | t | choice | lukee annetun arvoparin tai tunnistaa yksi syöte–yksi arvo -ehdon annetulla äärellisellä joukolla | Ei lausekkeen arvon laskemista, vapaata funktion tuottamista tai tuntemattoman koneen yleisen toiminnan todistamista. | – | – | `M79-EXPR-EVAL` | `M79-EXPR-EVAL` | families.ts M79-FUNC-01/*; scope manifest M79-FUNC-01/transfer |
| `M79-FUNC-TABLE/table` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-FUNC-TABLE/rule` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-FUNC-TABLE/fill` | gi | numeric | kirjoittaa luvun | – | 1…20 | multiply: rekisteri: M-MULTAB-ALL; negative: rekisteri: M79-INT-SUB | `M79-EXPR-EVAL`, `M79-INT-SUB`, `M-MULTAB-ALL` | `M79-EXPR-EVAL`, `M79-INT-SUB` | families.ts M79-FUNC-TABLE/fill |
| `M79-FUNC-TABLE/detect` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M79-FUNC-TABLE/transfer` | t | plot | piirtää pisteet kuvaajaan | – | – | coordinate: rekisteri: M-COORD-PLOT-Q1 | `M-COORD-PLOT-Q1` | `M-COORD-PLOT-Q1` | families.ts M79-FUNC-TABLE/transfer |
| `M79-FUNC-GRAPH/match` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-FUNC-GRAPH/read` | gi | numeric | kirjoittaa luvun | – | -4…4 | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-FUNC-GRAPH/plot` | gi | plot | piirtää pisteet kuvaajaan | – | – | negative: polku: M-NEG-02; coordinate: polku: M-COORD-02 | – | – | oletus |
| `M79-FUNC-GRAPH/onIt` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-FUNC-GRAPH/transfer` | t | plot | piirtää pisteet kuvaajaan | – | – | negative: polku: M-NEG-02; coordinate: polku: M-COORD-02 | – | – | oletus |
| `PHY79-GRAPH-01/sim` | gi | numeric | kirjoittaa luvun | – | 4…30 | – | – | – | oletus |
| `PHY79-GRAPH-01/rows` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `PHY79-GRAPH-01/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-GRAPH-01/plot` | gi | plot | piirtää pisteet kuvaajaan | – | – | – | – | – | oletus |
| `PHY79-GRAPH-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-VT-GRAPH/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-VT-GRAPH/phases` | gi | place | sijoittaa osat oikeille paikoille | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-VT-GRAPH/decel` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-VT-GRAPH/accel` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-VT-GRAPH/rest` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-VT-GRAPH/steady` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-VT-GRAPH/transfer` | t | numeric | kirjoittaa luvun | – | 2…12 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `M79-UNIT-LIN/kmm` | gi | numeric | kirjoittaa luvun | – | 1100…8900 | decimal: polku: M-DEC-04; multiply: rekisteri: M-DEC-08; convertLength: oma sisältö | `M-DEC-08`, `M-DEC-09`, `M-UNIT-02` | `M-DEC-08`, `M-DEC-09`, `M-UNIT-02` | families.ts M79-UNIT-LIN/* |
| `M79-UNIT-LIN/mmm` | gi | numeric | kirjoittaa luvun | – | 0.14…0.93 | decimal: polku: M-DEC-04; divide: rekisteri: M-DEC-09; convertLength: oma sisältö | `M-DEC-08`, `M-DEC-09`, `M-UNIT-02` | `M-DEC-08`, `M-DEC-09`, `M-UNIT-02` | families.ts M79-UNIT-LIN/* |
| `M79-UNIT-LIN/mcm` | gi | numeric | kirjoittaa luvun | – | 104…398 | decimal: polku: M-DEC-04; multiply: rekisteri: M-DEC-08; convertLength: oma sisältö | `M-DEC-08`, `M-DEC-09`, `M-UNIT-02` | `M-DEC-08`, `M-DEC-09`, `M-UNIT-02` | families.ts M79-UNIT-LIN/* |
| `M79-UNIT-LIN/cmm` | gi | numeric | kirjoittaa luvun | – | 0.08…0.93 | decimal: polku: M-DEC-04; divide: rekisteri: M-DEC-09 | `M-DEC-08`, `M-DEC-09`, `M-UNIT-02` | `M-DEC-08`, `M-DEC-09`, `M-UNIT-02` | families.ts M79-UNIT-LIN/* |
| `M79-UNIT-LIN/stairs` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | `M-DEC-08`, `M-DEC-09`, `M-UNIT-02` | `M-DEC-08`, `M-DEC-09`, `M-UNIT-02` | families.ts M79-UNIT-LIN/* |
| `M79-UNIT-LIN/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: polku: M-DEC-04; convertLength: oma sisältö | `M-DEC-08`, `M-DEC-09`, `M-UNIT-02` | `M-DEC-08`, `M-DEC-09`, `M-UNIT-02` | families.ts M79-UNIT-LIN/* |
| `PHY79-UNIT-CONV/hMin` | gi | numeric | kirjoittaa luvun | – | 30…180 | multiply: polku: M-MUL-01; convertTime: oma sisältö; decimal: polku: M-DEC-04 | `M-DEC-08`, `M-UNIT-05` · sääntö requires_quantity_specific_unit_conversion_skill_for_item_instance | `M-UNIT-05`, `M-DEC-08`, `M-UNIT-02` | families.ts PHY79-UNIT-CONV/*; families.ts PHY79-UNIT-CONV/hMin |
| `PHY79-UNIT-CONV/minS` | gi | numeric | kirjoittaa luvun | – | 120…360 | multiply: polku: M-MUL-01; convertTime: oma sisältö | `M-UNIT-05` · sääntö requires_quantity_specific_unit_conversion_skill_for_item_instance | `M-UNIT-05`, `M-UNIT-02` | families.ts PHY79-UNIT-CONV/*; families.ts PHY79-UNIT-CONV/minS |
| `PHY79-UNIT-CONV/kmM` | gi | numeric | kirjoittaa luvun | – | 800…4500 | decimal: polku: M-DEC-04; multiply: polku: M-MUL-01; convertLength: oma sisältö | `M-DEC-08`, `M-UNIT-02` · sääntö requires_quantity_specific_unit_conversion_skill_for_item_instance | `M-UNIT-02`, `M-DEC-08`, `M-UNIT-05` | families.ts PHY79-UNIT-CONV/*; families.ts PHY79-UNIT-CONV/kmM |
| `PHY79-UNIT-CONV/cmM` | gi | numeric | kirjoittaa luvun | – | 0.75…3.4 | decimal: polku: M-DEC-04; convertLength: oma sisältö | `M-DEC-09`, `M-UNIT-02` · sääntö requires_quantity_specific_unit_conversion_skill_for_item_instance | `M-DEC-09`, `M-UNIT-02`, `M-UNIT-05` | families.ts PHY79-UNIT-CONV/*; families.ts PHY79-UNIT-CONV/cmM |
| `PHY79-UNIT-CONV/match` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: polku: M-DEC-04; convertLength: oma sisältö; convertTime: oma sisältö | `M-UNIT-02`, `M-UNIT-05`, `M-DEC-08` · sääntö requires_quantity_specific_unit_conversion_skill_for_item_instance | `M-UNIT-02`, `M-UNIT-05`, `M-DEC-08` | families.ts PHY79-UNIT-CONV/*; families.ts PHY79-UNIT-CONV/match |
| `PHY79-UNIT-CONV/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: polku: M-DEC-04; convertLength: oma sisältö | `M-UNIT-02`, `M-DEC-08` · sääntö requires_quantity_specific_unit_conversion_skill_for_item_instance | `M-UNIT-02`, `M-DEC-08`, `M-UNIT-05` | families.ts PHY79-UNIT-CONV/*; families.ts PHY79-UNIT-CONV/transfer |
| `PHY79-SPEED-MIXED/sim` | gi | numeric | kirjoittaa luvun | – | 2…5 | multiply: polku: M-MULTREL-01; convertTime: polku: PHY79-UNIT-CONV; speedUnit: polku: PHY79-SPEED-CALC; decimal: polku: M-DEC-04 | – | – | oletus |
| `PHY79-SPEED-MIXED/ready` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `PHY79-SPEED-MIXED/kmh` | gi | numeric | kirjoittaa luvun | – | 5…20 | decimal: polku: M-DEC-04; speedUnit: polku: PHY79-SPEED-CALC | `M79-DEC-DIV` | `M79-DEC-DIV` | scope manifest PHY79-SPEED-MIXED/kmh |
| `PHY79-SPEED-MIXED/kmMin` | gi | numeric | kirjoittaa luvun | – | 2…6 | decimal: polku: M-DEC-04; convertLength: polku: PHY79-UNIT-CONV; convertTime: polku: PHY79-UNIT-CONV; speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `PHY79-SPEED-MIXED/mMin` | gi | numeric | kirjoittaa luvun | – | 2…5 | convertTime: polku: PHY79-UNIT-CONV; speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `PHY79-SPEED-MIXED/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: polku: M-DEC-04; speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `M79-INT-ORDER/order` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-ORDER/sign` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-ORDER/compare` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-ORDER/place` | gi | line | merkitsee kohdan lukusuoralle | – | -9…-2 | negative: oma sisältö | – | – | oletus |
| `M79-INT-ORDER/split` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-ORDER/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-DIST/abs` | gi | numeric | kirjoittaa luvun | – | 2…15 | negative: oma sisältö | – | – | oletus |
| `M79-INT-DIST/same` | gi | numeric | kirjoittaa luvun | – | 2…11 | negative: oma sisältö | – | – | oletus |
| `M79-INT-DIST/across` | gi | numeric | kirjoittaa luvun | – | 2…16 | negative: oma sisältö | – | – | oletus |
| `M79-INT-DIST/pairs` | gi | place | sijoittaa osat oikeille paikoille | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-DIST/transfer` | t | numeric | kirjoittaa luvun | – | 10…26 | negative: oma sisältö | – | – | oletus |
| `M79-INT-01/closer` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-01/mid` | gi | numeric | kirjoittaa luvun | – | -5…3 | negative: oma sisältö | – | – | oletus |
| `M79-INT-01/jump` | gi | line | merkitsee kohdan lukusuoralle | – | -10…10 | negative: oma sisältö | – | – | oletus |
| `M79-INT-01/land` | gi | place | sijoittaa osat oikeille paikoille | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-01/transfer` | t | numeric | kirjoittaa luvun | – | 6…19 | negative: oma sisältö | – | – | oletus |
| `M79-INT-ADD/mixed` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-ADD/negneg` | gi | numeric | kirjoittaa luvun | – | -18…-5 | negative: oma sisältö | – | – | oletus |
| `M79-INT-ADD/line` | gi | line | merkitsee kohdan lukusuoralle | – | -4…7 | negative: oma sisältö | – | – | oletus |
| `M79-INT-ADD/sign` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M79-INT-ADD/transfer` | t | numeric | kirjoittaa luvun | – | -4…9 | negative: oma sisältö | – | – | oletus |
| `M79-INT-MUL/negneg` | gi | numeric | kirjoittaa luvun | – | 6…81 | negative: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M79-INT-MUL/sign` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M79-INT-MUL/pattern` | gi | numeric | kirjoittaa luvun | – | -15…-2 | negative: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M79-INT-MUL/signs` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `M79-INT-MUL/transfer` | t | numeric | kirjoittaa luvun | – | -30…-4 | negative: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M79-EQ1-SOLVE/both` | gi | numeric | kirjoittaa luvun | – | 1…8 | – | `M79-INT-ADD`, `M79-INT-SUB`, `M79-INT-DIV` · sääntö requires_arithmetic_operations_present_in_equation_item | `M79-INT-DIV`, `M79-INT-SUB` | families.ts M79-EQ1-SOLVE/* |
| `M79-EQ1-SOLVE/two` | gi | numeric | kirjoittaa luvun | – | -4…9 | negative: polku: M79-INT-ADD | `M79-INT-DIV`, `M79-INT-ADD`, `M79-INT-SUB` · sääntö requires_arithmetic_operations_present_in_equation_item | `M79-INT-DIV`, `M79-INT-SUB` | families.ts M79-EQ1-SOLVE/*; scope manifest M79-EQ1-SOLVE/two |
| `M79-EQ1-SOLVE/one` | gi | numeric | kirjoittaa luvun | – | -6…12 | negative: polku: M79-INT-ADD | `M79-INT-ADD`, `M79-INT-SUB`, `M79-INT-DIV` · sääntö requires_arithmetic_operations_present_in_equation_item | `M79-INT-DIV`, `M79-INT-SUB` | families.ts M79-EQ1-SOLVE/* |
| `M79-EQ1-SOLVE/moves` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | `M79-INT-ADD`, `M79-INT-SUB`, `M79-INT-DIV` · sääntö requires_arithmetic_operations_present_in_equation_item | `M79-INT-DIV`, `M79-INT-SUB` | families.ts M79-EQ1-SOLVE/* |
| `M79-EQ1-SOLVE/transfer` | t | numeric | kirjoittaa luvun | – | 2…6 | divide: polku: M-DIV-02 | `M79-INT-ADD`, `M79-INT-SUB`, `M79-INT-DIV` · sääntö requires_arithmetic_operations_present_in_equation_item | `M79-INT-DIV`, `M79-INT-SUB` | families.ts M79-EQ1-SOLVE/* |
| `PHY79-SPEED-REARR/sim` | gi | numeric | kirjoittaa luvun | – | 6…30 | multiply: polku: M-MULTREL-01; speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `PHY79-SPEED-REARR/which` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `PHY79-SPEED-REARR/time` | gi | numeric | kirjoittaa luvun | – | 3…9 | speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `PHY79-SPEED-REARR/dist` | gi | numeric | kirjoittaa luvun | – | 6…81 | multiply: polku: M-MULTREL-01; speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `PHY79-SPEED-REARR/transfer` | t | numeric | kirjoittaa luvun | – | 2.5…2.5 | decimal: rekisteri: M79-DEC-DIV; speedUnit: polku: PHY79-SPEED-CALC | `M79-DEC-DIV` | `M79-DEC-DIV` | families.ts PHY79-SPEED-REARR/transfer |
| `M79-LINE-GRAPH/draw` | gi | plot | piirtää pisteet kuvaajaan | – | – | negative: polku: M-NEG-02; coordinate: polku: M-COORD-02 | – | – | oletus |
| `M79-LINE-GRAPH/intercept` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-LINE-GRAPH/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-LINE-GRAPH/lines` | gi | place | sijoittaa osat oikeille paikoille | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-LINE-GRAPH/transfer` | t | numeric | kirjoittaa luvun | – | -2…2 | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-SLOPE/sign` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-SLOPE/table` | gi | numeric | kirjoittaa luvun | – | -2…5 | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-SLOPE/points` | gi | numeric | kirjoittaa luvun | – | -3…4 | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-SLOPE/steeper` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-SLOPE/rank` | gi | place | sijoittaa osat oikeille paikoille | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-SLOPE/transfer` | t | numeric | kirjoittaa luvun | – | 2…5 | speedUnit: rekisteri: PHY79-SPEED-CONCEPT | `PHY79-SPEED-CONCEPT` (selitys: kulmakerroin on nopeus) | – | families.ts M79-SLOPE/transfer |
| `PHY79-ST-GRAPH/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ST-GRAPH/story` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `PHY79-ST-GRAPH/read` | gi | numeric | kirjoittaa luvun | – | 2…4 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ST-GRAPH/steeper` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ST-GRAPH/flat` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ST-GRAPH/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/steps` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/decel` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/accel` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/rest` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/steady` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-VT-GRAPH/sim` | gi | numeric | kirjoittaa luvun | – | 1…2 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-VT-GRAPH/slopes` | gi | place | sijoittaa osat oikeille paikoille | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-VT-GRAPH/sign` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-VT-GRAPH/steeper` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-VT-GRAPH/read` | gi | numeric | kirjoittaa luvun | – | 1…2 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-VT-GRAPH/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-GRAPH/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-GRAPH/pairs` | gi | sort | lajittelee jokaisen kuvan oikeaan laatikkoon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-GRAPH/accel` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-GRAPH/rest` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-GRAPH/steady` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-GRAPH/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `M79-INT-DIV/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M79-INT-DIV/negneg` | gi | numeric | kirjoittaa luvun | – | 2…9 | negative: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M79-INT-DIV/sign` | gi | numeric | kirjoittaa luvun | – | -9…-2 | negative: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M79-INT-DIV/quot` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M79-INT-DIV/transfer` | t | numeric | kirjoittaa luvun | – | -6…-2 | negative: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M79-INT-SUB/change` | gi | numeric | kirjoittaa luvun | – | -9…9 | negative: oma sisältö | – | – | oletus |
| `M79-INT-SUB/down` | gi | numeric | kirjoittaa luvun | – | -17…-4 | negative: oma sisältö | – | – | oletus |
| `M79-INT-SUB/subNeg` | gi | numeric | kirjoittaa luvun | – | -3…17 | negative: oma sisältö | – | – | oletus |
| `M79-INT-SUB/rewrite` | gi | place | sijoittaa osat oikeille paikoille | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-SUB/transfer` | t | numeric | kirjoittaa luvun | – | 7…19 | negative: oma sisältö | – | – | oletus |
| `PHY79-ACCEL-CALC/sim` | gi | numeric | kirjoittaa luvun | – | 1…3 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CALC/build` | gi | place | sijoittaa osat oikeille paikoille | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CALC/moving` | gi | numeric | kirjoittaa luvun | – | 1…4 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CALC/rest` | gi | numeric | kirjoittaa luvun | – | 1…5 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CALC/transfer` | t | numeric | kirjoittaa luvun | – | -4…-2 | negative: polku: M79-INT-SUB; speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
