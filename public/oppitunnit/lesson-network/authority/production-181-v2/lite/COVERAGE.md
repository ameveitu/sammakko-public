# Kattavuus: 181 noodia oppitunteina

Tämä tiedosto on generoitu: `node tools/coverage-report.mjs`. Älä muokkaa käsin.

- Manifesti: `reference/mvp-scope-181.json` (177-pohja + tarkistettu lisäys), sha256 `58f7ca8bb7868dde2a4e4189259871e83d18681510f7841dad22e4eae2114ab8`, 181 noodia.
- Graafin tarkiste (src/data/graph.json): `551d6a2ebd541a30785040cee458ca49132a0756e313ce45f1799ed2d6a7be11`. Sisältöversio: `lite181-2026-10-27`.
- Aiemmat 107 noodia: 107/107 mukana. Lisäyksiä: 74.
- Jokaiselle noodille on oma oppitunti (`NodeSpec`): tavoite, malliesimerkki, ohjattu, itsenäinen ja siirtovaihe, palaute ja selitys. Perheet (tag) on poimittu ajamalla generaattoria 300 siemenellä vaihetta kohden.

Vuorovaikutustyypit ja niitä käyttävien noodien määrä: choice 166, numeric 79, place 12, plot 8, line 7, multi 5, build 3, tapcount 2, ribbons 1, combos 1, tally 1, frac 1.

Sarakkeet: *Ryhmät* = esitietoryhmät (`all` = kaikki vaaditaan ja voidaan päätellä, `any` = yksi riittää eikä päätellä). *Peruste* = miksi noodi on manifestissa.

## Noodit oppituntijärjestyksessä

| KC | Otsikko | Lk | Maailma / luku | Paikka | Tehtävätyypit | Itsenäiset perheet | Siirtoperheet | Ryhmät | Dynaaminen sääntö / tehtävän taitokäyttö / turvaohje | Versio | Peruste | Tarkistettu |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `M-GEO-01` | Tason ja kolmiulotteisen ympäristön erottaminen | 1-2 | Rantaretki / Lajittelulaituri | 🧊 Litteä vai kappale? | choice | print, solid, flat | transfer | – | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-REP-04` | Matemaattisen ajatuksen esittäminen symbolein ja merkinnöin | 1-6 | Rantaretki / Merkkipaja | ✍️ Merkkikieli | choice, build | build, add, compare, words | transfer | – | dyn: requires_relevant_content_symbol_knowledge | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-TH-08` | Kahden opitun matemaattisen asian välisen yhteyden tunnistaminen | 3-6 | Aarresaaristo / Kertomajakka | 🔗 Sama asia, eri tapa | choice, numeric | areaMul, mulAdd, fracDiv | transfer | – | dyn: requires_any_two_mastered_content_nodes; käyttää: M-GMEAS-01 | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `SCI-ENV-SAFE-01` | Annettujen turvallisuusohjeiden noudattaminen | 1-2 | Rantaretki / Havaintovihko | 🦺 Turvallinen tutkija | choice | s5, s0, s1, s2, s3, s4 | transfer | – | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-GEO-04` | Tasokuvion tunnistaminen | 1-2 | Rantaretki / Lajittelulaituri | 🔺 Muotojen nimet | choice | corners, find, name | transfer | all(1) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-NUM-1TO1` | Yhden lukusanan kohdistaminen kuhunkin laskettavaan kohteeseen | 1-2 | Rantaretki / Laskuloru | 👆 Yksi kerrallaan | tapcount, choice | judge, tap | transfer | – | – | count2-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-SYM-01` | Peilaussymmetrian tunnistaminen suoran suhteen | 3-6 | Aarresaaristo / Aarresaari | 🪞 Jääpeili | choice, plot | complete, axis, grid | transfer | all(1) | – | lite181-2026-10-27 | task_context_coverage_seed | generaattoritestit |
| `M-NUM-STABLE-ORDER` | Lukusanojen käyttäminen vakaassa järjestyksessä | 1-2 | Rantaretki / Laskuloru | 🎵 Laskuloru | choice | skip, next, swap | transfer | – | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NUM-WORD-NUMERAL` | Lukusanan yhdistäminen sitä vastaavaan numeromerkintään | 1-2 | Rantaretki / Laskuloru | 🔤 Sana ja numero | choice | n2w, w2n | transfer | – | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-TH-01` | Yhtäläisyyksien ja erojen havaitseminen | 1-6 | Rantaretki / Mittaripaja | 🔺 Sama ja eri | choice | odd, same | transfer | – | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-TH-02` | Kohteiden luokittelu annetun ominaisuuden mukaan | 1-6 | Rantaretki / Lajittelulaituri | 🗃️ Lajittelulaatikot | multi, choice | odd, color, shape | transfer | – | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-TH-03` | Kohteiden järjestäminen annetun ominaisuuden mukaan | 1-6 | Rantaretki / Lajittelulaituri | 📏 Jonoon järjestys | place, choice | middle, sticks, numbers | transfer | – | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-TH-04` | Toistuvan tai muuttuvan säännönmukaisuuden havaitseminen | 1-6 | Rantaretki / Lajittelulaituri | 🔁 Toistuvat kuviot | choice | dots, repeat, grow | transfer | – | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-WORK-01` | Matemaattisesti olennaisen havainnon tekeminen tilanteesta | 1-6 | Rantaretki / Lajittelulaituri | 🔍 Tarkka havainto | choice | notice, extra, need | transfer | – | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-MEAS-00` | Mitattavien ominaisuuksien suora vertaaminen | 1-2 | Rantaretki / Mittaripaja | 🎀 Kumpi pidempi | ribbons, choice | equal, aligned, tricky | transfer | – | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-TH-07` | Vaihtoehtojen järjestelmällinen etsiminen | 3-6 | Aarresaaristo / Tutkimusasema | 🧮 Kaikki vaihtoehdot | choice, numeric, combos | list, outfits, digits, system | transfer | – | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M79-LOGIC-01` | Säännön tai riippuvuuden löytäminen | 7-9 | Lampilaboratorio / Funktiot ja suorat | 🕵️ Säännön jäljillä | numeric, choice | test, rule, next | transfer | – | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `SCI-ENV-OBSERVE-01` | Havainnon tekeminen ilmiöstä tai kohteesta | 1-2 | Rantaretki / Havaintovihko | 🔎 Tarkka silmä | choice | colour, match, feature | transfer | – | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-MEAS-02` | Pituuden ymmärtäminen suureeksi | 1-2 | Rantaretki / Mittaripaja | 〰️ Nauhan pituus | choice | path, bend, thick | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-TIME-01` | Ajan ymmärtäminen mitattavana suureena | 1-2 | Rantaretki / Mittaripaja | ⏳ Kumpi kestää | choice | diff, sim, equal | transfer | all(1) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NUM-01` | Kohteiden laskeminen yksi yhteen -vastaavuudella | 1-2 | Rantaretki / Laskuloru | 🔢 Laske kaikki | tapcount | circle, line, scatter | transfer | all(2) | – | count2-2026-10-27 | aiempi 107 | generaattoritestit + pelattu selaimessa |
| `ENV-PHY-MOTION-OBS-01` | Liikkeen havainnointi | 1-2 | Rantaretki / Havaintovihko | 🍃 Liikkuiko? | choice | still, sim, moved, colour | transfer | all(1) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-TIME-03` | Aikayksiköiden ja keston yhteyden ymmärtäminen | 1-2 | Rantaretki / Mittaripaja | ⏱️ Sekunnit | numeric, choice | read, sim, compare | transfer | all(1) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-MEAS-01` | Mittaaminen suureen vertaamisena sovittuun yksikköön | 1-2 | Rantaretki / Mittaripaja | 📎 Klemmarimittari | choice | judge, count | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NUM-02` | Laskennan viimeinen lukusana kertoo koko joukon lukumäärän | 1-2 | Rantaretki / Laskuloru | 🧺 Montako kaikkiaan | choice, multi | give, howmany | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit + pelattu selaimessa |
| `M-NUM-17` | Lukumäärän puolittaminen kahteen yhtä suureen osaan | 1-2 | Rantaretki / Eväsretki | ✂️ Puolikkaat | choice | number, share, fair | transfer | all(1) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `ENV-PHY-MOTION-CHANGE-01` | Liikkeen muutoksen havainnointi | 1-2 | Rantaretki / Havaintovihko | 🔄 Mikä muuttui? | choice, place | turn, sim, stop, faster, steady | transfer | all(2) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-ADD-01` | Yhteenlasku kahden määrän yhdistämisenä | 1-2 | Rantaretki / Eväsretki | 🧺 Yhteinen kori | choice | expr, join | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit + pelattu selaimessa |
| `M-NUM-QTY-NUMERAL` | Lukumäärän yhdistäminen sitä vastaavaan numeromerkintään | 1-2 | Rantaretki / Laskuloru | 🏷️ Rasian lappu | choice, place | n2q, q2n | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NUM-QTY-WORD` | Lukumäärän yhdistäminen sitä vastaavaan lukusanaan | 1-2 | Rantaretki / Laskuloru | 🗣️ Määrä ja sana | choice | w2q, q2w | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `ENV-PHY-MOTION-01` | Liikkeen ja liikkeen muutoksen havainnointi | 1-2 | Rantaretki / Havaintovihko | 🦆 Liikkeen tarkkailija | choice | still, sim, which, describe | transfer | all(2) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NUM-03` | Lukumäärän, lukusanan ja numeromerkinnän yhdistäminen | 1-2 | Rantaretki / Laskuloru | 🎯 Kolme tapaa | place, choice | fromNumeral, fromQty | transfer | all(3) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NUM-18` | Lukujen 1–10 hajotelmien ymmärtäminen | 1-2 | Rantaretki / Simpukkaranta | 🐚 Simpukkaparit | choice | ten, hidden, pair | transfer | all(2) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `PHY79-MOTION-REF` | Liikkeen kuvaaminen suhteessa valittuun tarkastelukohteeseen | 7-9 | Lampilaboratorio / Liike ja nopeus | 🚤 Mistä katsoen? | choice | train, sim, boat, walk | transfer | all(1) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NUM-07` | Lukujonon jatkaminen eteenpäin | 1-2 | Rantaretki / Hyppykivet | 🪨 Numerokivet | choice | big, small, teen | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NUM-08` | Lukujonon jatkaminen taaksepäin | 1-2 | Rantaretki / Hyppykivet | ⏪ Takaperin | choice, line | gap, next, before | transfer | all(1) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-NUM-10` | Kahden luonnollisen luvun suuruuden vertaaminen | 1-2 | Rantaretki / Laskuloru | ⚖️ Kumpi enemmän? | choice | symbol, bigger, tens | transfer | all(1) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-TIME-02` | Kellonajan lukemisen perusidea | 1-2 | Rantaretki / Mittaripaja | 🕒 Kellotaulu | choice | hands, full, half | transfer | all(2) | – | lite181-2026-10-27 | activity_context_use | generaattoritestit |
| `M-NUM-14` | Luvun käyttäminen mittaustuloksen ilmaisemiseen | 1-2 | Rantaretki / Mittaripaja | 📏 Mittausluku | choice | make, read | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-QTY-CONCEPT` | Fysikaalisen suureen käsitteen ymmärtäminen | 7-9 | Lampilaboratorio / Suureet ja yksiköt | 📏 Mitattava ominaisuus | choice | unitVs, pick, tool | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-NUMVALUE` | Suureen lukuarvon erottaminen suureesta ja yksiköstä | 7-9 | Lampilaboratorio / Suureet ja yksiköt | 🔢 Lukuarvo | choice | symbol, plain | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-UNIT-CONCEPT` | Fysikaalisen yksikön roolin ymmärtäminen | 7-9 | Lampilaboratorio / Suureet ja yksiköt | 📐 Yksikkö | choice | fit, pick | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-QTY-01` | Fysikaalisen suureen, lukuarvon ja yksikön erottaminen | 7-9 | Lampilaboratorio / Suureet ja yksiköt | 🧩 Suure, luku, yksikkö | place, choice | which, sort | transfer | all(3) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-DIST-TIME` | Matkan ja ajan tunnistaminen liikkeen mitattaviksi suureiksi | 7-9 | Lampilaboratorio / Liike ja nopeus | ⏱️ Matka ja aika | numeric, multi, choice | time, sim, dist, tool | transfer | all(2) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NUM-EQUALSTEP-SEQ` | Tasavälisen lukujonon tunnistaminen ja jatkaminen | 1-2 | Rantaretki / Hyppykivet | 🐸 Hyppyjono | choice | which, step2, step5, step10 | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NUM-MULTIPLE-INTRO` | Monikerran käsitteen alku | 1-2 | Rantaretki / Hyppykivet | 🦘 Loikan hypyt | choice, multi | k5, k2, k3 | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NUM-16` | Tasavälisen lukujonon ja monikerran alun tunnistaminen | 1-2 | Rantaretki / Hyppykivet | 🔍 Hyppyjen salaisuus | choice | next, step | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-MUL-01` | Kertolasku yhtä suurten ryhmien toistumisena | 1-2 | Rantaretki / Eväsretki | 🎒 Eväspussit | choice | equal, total, expr | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit + pelattu selaimessa |
| `M-MULTAB-LOW` | Kertotaulufaktat 1–5 ja 10 | 1-2 | Rantaretki / Kertopaja | ✖️ Kertopaja | choice, numeric | strategy, fact, array | transfer | all(1) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-DIV-02` | Sisältöjako: selvitetään montako annettua ryhmää määrään mahtuu | 1-2 | Rantaretki / Eväsretki | 🛍️ Montako pussia | choice | story, pic | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-MULTAB-HIGH` | Kertotaulufaktat 6–9 | 3-6 | Aarresaaristo / Kertomajakka | 9️⃣ Isot kertotaulut | numeric, choice | fact, nine, six | transfer | all(1) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-MULTAB-ALL` | Kertotaulujen 1–10 sujuva hallinta | 3-6 | Aarresaaristo / Kertomajakka | 🏅 Kertotaulumestari | numeric, choice | neighbour, mixed, factor | transfer | all(2) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-MULTREL-01` | Multiplikatiivinen vertailu: x kertaa niin paljon | 3-6 | Rantaretki / Eväsretki | 🏰 Kertaa niin paljon | choice | howMany, times | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-SPEED-CONCEPT` | Keskinopeuden ymmärtäminen matkan ja ajan suhteena | 7-9 | Lampilaboratorio / Liike ja nopeus | 🐸 Kumpi nopeampi? | choice | sameT, sim, sameS, equal | transfer | all(1) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-ACCEL-CONCEPT` | Kiihtyvyyden ymmärtäminen nopeuden muutoksena ajassa | 7-9 | Lampilaboratorio / Kiihtyvyys | 🛥️ Kiihtyvyys | choice | meaning, sim, which, table | transfer | all(1) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `SCI-ENV-PRESENT-DATA-01` | Havaintojen esittäminen tarkoituksenmukaisella tavalla | 1-2 | Rantaretki / Havaintovihko | 🖼️ Kerro kuvalla | choice, place | complete, pick | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `SCI-ENV-RECORD-DATA-01` | Havaintojen taltioiminen | 1-2 | Rantaretki / Havaintovihko | 📒 Havainto talteen | place | three, two | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `SCI-ENV-RECORD-01` | Havaintojen taltioiminen ja esittäminen | 1-2 | Rantaretki / Havaintovihko | 📓 Retkivihko | place, choice | check, build | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NUM-06` | Nollan ymmärtäminen lukumääränä ja lukuna | 1-2 | Rantaretki / Laskuloru | 🪺 Tyhjä pesä | choice | takeAll, empty, count | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-PLACE-01` | Kymmenen ykkösen ryhmittäminen yhdeksi kymmeneksi | 1-2 | Rantaretki / Kymppilautta | 🌾 Kaislanippu | choice | bundles, enough, missing | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-PLACE-02` | Ykkösten ja kymmenten paikka-arvo | 1-2 | Rantaretki / Kymppilautta | 🪵 Nipputori | choice | digit, picToNum, numToPic | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-PLACE-03` | Luvun rakentaminen ja hajottaminen ykkösiin ja kymmeniin | 1-2 | Rantaretki / Kymppilautta | 🛶 Lautan rakentaja | choice | build, compose, split | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-MENTAL-01` | Luvun hajottaminen laskemista helpottavaan muotoon | 1-2 | Rantaretki / Kymppilautta | 🧩 Fiksu jako | choice, numeric | use, toTen, tensOnes | transfer | all(2) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-SUB-01` | Vähennyslasku määrän vähentämisenä | 1-2 | Rantaretki / Merkkipaja | 🌊 Aallon vietävää | choice | expr, picture, story | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-ADD-SUB-01` | Yhteen- ja vähennyslaskun käänteinen yhteys | 1-2 | Rantaretki / Simpukkaranta | 👨‍👩‍👧 Lukuperhe | numeric, choice | check, family, undo | transfer | all(2) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-ADD-FACT-10` | Yhteenlaskun perusfaktat lukualueella 0–10 | 1-2 | Rantaretki / Simpukkaranta | ➕ Plussasimpukat | choice, numeric | double, fact, turn | transfer | all(1) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-DIV-01` | Ositusjako: määrä jaetaan annettuun määrään yhtä suuria ryhmiä | 1-2 | Rantaretki / Eväsretki | 🍓 Reilu jako | choice | story, deal, fair | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-SUB-FACT-10` | Vähennyslaskun perusfaktat lukualueella 0–10 | 1-2 | Rantaretki / Simpukkaranta | ➖ Miinussimpukat | choice, numeric | left, fact, think | transfer | all(1) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-ADD-FACT-01` | Yhteen- ja vähennyslaskun perusfaktat lukualueella 0–10 | 1-2 | Rantaretki / Simpukkaranta | 🏁 Simpukkakisa | choice, numeric | missing, mixed, story | transfer | all(2) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-DIVIS-01` | Jaollisuuden käsitteen ymmärtäminen | 3-6 | Aarresaaristo / Kertomajakka | 🔢 Jakautuuko tasan? | multi, choice | meaning, lastDigit, threes | transfer | any(2) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-MULDIV-01` | Kerto- ja jakolaskun käänteinen yhteys | 1-2 | Rantaretki / Kertopaja | 🔄 Jakoperhe | numeric, choice | check, family, factor | transfer | all(3) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-ADD-20` | Yhteenlasku lukualueella 0–20 | 1-2 | Rantaretki / Simpukkaranta | 🌉 Kympin yli | numeric, choice | split, bridge, teen | transfer | all(1) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-DIV-FACT-01` | Helpon jakolaskun ratkaiseminen kertotaulun avulla | 1-2 | Rantaretki / Kertopaja | ➗ Jakopaja | choice, numeric | share, fact, think | transfer | all(2) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-FRAC-01` | Kokonaisen jakaminen yhtä suuriin osiin | 1-2 | Aarresaaristo / Piirakkajuhla | 🥧 Reilut palat | choice | fair, equal, count | transfer | – | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-SUB-20` | Vähennyslasku lukualueella 0–20 | 1-2 | Rantaretki / Simpukkaranta | 🪜 Kympin ali | numeric, choice | think, bridge, noBridge | transfer | all(1) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-ADD-100` | Yhteenlasku lukualueella 0–100 | 1-2 | Rantaretki / Kymppilautta | 🛶 Isot lautat | choice, numeric | tens, noCarry, carry | transfer | all(2) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-SUB-100` | Vähennyslasku lukualueella 0–100 | 1-2 | Rantaretki / Kymppilautta | 🌾 Kaislat käyttöön | choice, numeric | check, noBorrow, borrow | transfer | all(2) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-GEO-02` | Sijaintikäsitteiden käyttäminen | 1-2 | Aarresaaristo / Aarresaari | 🧭 Saaren hylly | choice | between, leftRight, aboveBelow | transfer | – | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-MEAS-03` | Metri ja senttimetri pituuden yksikköinä | 1-2 | Rantaretki / Mittaripaja | 📏 Mittanauha | choice | ruler, unit, estimate | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-MEAS-04` | Pituuden mittaaminen yksikön avulla | 1-2 | Rantaretki / Mittaripaja | 📐 Mittaa yksiköllä | numeric, choice | unitSize, units, offset | transfer | all(1) | – | lite181-2026-10-27 | canonical_ancestor_of_activity_use | generaattoritestit |
| `M-GMEAS-01` | Kuvion piirin ymmärtäminen reunaviivan kokonaispituudeksi | 3-6 | Aarresaaristo / Laivaveistämö | 🔲 Reunan pituus | numeric, choice | meaning, rect, grid | transfer | all(2) | – | lite181-2026-10-27 | activity_context_use | generaattoritestit |
| `M-MEAS-05` | Massan ymmärtäminen suureeksi | 1-2 | Rantaretki / Rantakioski | ⚖️ Kioskin vaaka | choice | equal, balance, size | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-MEAS-06` | Kilogramma ja gramma massan yksikköinä | 1-2 | Rantaretki / Rantakioski | 🍎 Marjapunnitus | choice | thousand, unit, estimate | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-MEAS-08` | Astian sisältämän määrän hahmottaminen mitattavana suureena | 1-2 | Rantaretki / Rantakioski | 🧃 Mehukannu | choice | conserve, pour, cups | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-MEAS-09` | Litra ja desilitra yksikköinä | 1-2 | Rantaretki / Rantakioski | 🥛 Litra ja desi | choice | compare, unit, ten | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-DATA-01` | Tiedon kerääminen määritellystä aiheesta | 1-2 | Aarresaaristo / Tutkimusasema | ✏️ Havaintolista | choice | most, tally, question | transfer | – | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-DATA-02` | Yksittäisten havaintojen tallentaminen | 1-2 | Aarresaaristo / Tutkimusasema | 📝 Havaintoviivat | choice, tally | record, pick, count, add | transfer | all(2) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-DATA-03` | Yksinkertaisen taulukon rakenteen ymmärtäminen | 1-2 | Aarresaaristo / Tutkimusasema | 📋 Taulukon lukija | choice, numeric | fewest, read, twoWay | transfer | – | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-DATA-05` | Tiedon lukeminen yksinkertaisesta taulukosta | 1-2 | Aarresaaristo / Tutkimusasema | 📊 Taulukon tieto | choice, numeric | diff, cell, most | transfer | all(1) | – | lite181-2026-10-27 | task_context_coverage_seed | generaattoritestit |
| `M-DATA-04` | Yksinkertaisen taulukon laatiminen | 1-2 | Aarresaaristo / Tutkimusasema | 🧾 Taulukon tekijä | place, choice | header, fromTally, fromList | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-SYM-PLUS` | Plusmerkin merkityksen ymmärtäminen | 1-2 | Rantaretki / Merkkipaja | ➕ Plusmerkki | choice | meaning, picToSign, story | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-SYM-MINUS` | Miinusmerkin merkityksen ymmärtäminen | 1-2 | Rantaretki / Merkkipaja | ➖ Miinusmerkki | choice | meaning, picToSign, story | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-SYM-EQUAL` | Yhtäsuuruusmerkin merkityksen ymmärtäminen | 1-2 | Rantaretki / Merkkipaja | 🟰 Tasapainokivi | choice | plates, trueFalse, fillLeft | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-ARITH-01` | Merkkien +, − ja = perusmerkitys | 1-2 | Rantaretki / Merkkipaja | 🔣 Merkkien kieli | choice | trueFalse, missingSign, story | transfer | all(3) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-MUL-02` | Kertolaskutilanteen kirjoittaminen kertolaskulausekkeeksi | 1-2 | Rantaretki / Kertopaja | 📝 Kertolaskuksi | choice | story, sum, picture | transfer | all(2) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-EXPR-01` | Useita laskutoimituksia sisältävän lausekkeen tulkitseminen | 3-6 | Aarresaaristo / Laivaveistämö | 📜 Laskujärjestys | numeric, choice | sub, mulFirst, paren | transfer | all(1) | dyn: requires_operation_knowledge_for_operations_present_in_item | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `SCI-ENV-TOOL-01` | Yksinkertaisen tutkimus- tai mittausvälineen käyttäminen | 1-2 | Aarresaaristo / Tutkimusasema | 🔧 Välinevaja | choice | use, tool | transfer | – | turvaohje: SCI-ENV-SAFE-01 | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-PLACE-04` | Satojen, tuhansien ja suurempien lukuyksiköiden paikka-arvo | 3-6 | Aarresaaristo / Laivaveistämö | 💰 Torin kassa | choice | compare, value, compose | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-PLACE-05` | Luonnollisen luvun hajottaminen lukuyksiköihin | 3-6 | Aarresaaristo / Laivaveistämö | 🧱 Lukujen purku | numeric, choice | regroup, expand, missing | transfer | all(1) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-NEG-01` | Negatiivisen luvun käsitteen ymmärtäminen | 3-6 | Aarresaaristo / Jäälahti | 🌡️ Pakkasaamu | choice | meaning, thermo, colder | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-WRADD` | Kirjallinen yhteenlaskualgoritmi | 3-6 | Aarresaaristo / Laivaveistämö | 🧮 Allekkain yhteen | choice, numeric | step, column, ones, check | transfer | all(2) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-WRDIV` | Lukuyksiköittäin jakaminen | 3-6 | Aarresaaristo / Kertomajakka | ➗ Jako paikoittain | numeric, choice | step, byPlace, exchange, check | transfer | all(3) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-WRMUL` | Kirjallinen kertolaskualgoritmi | 3-6 | Aarresaaristo / Kertomajakka | ✖️ Allekkain kertominen | numeric, choice | step, partial, column, check | transfer | all(2) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-WRSUB` | Kirjallinen vähennyslaskualgoritmi | 3-6 | Aarresaaristo / Laivaveistämö | 🔻 Allekkain vähennys | choice, numeric | step, column, flip, check | transfer | all(2) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-NEG-02` | Negatiivisten kokonaislukujen sijoittaminen lukusuoralle | 3-6 | Aarresaaristo / Jäälahti | ❄️ Jään lukusuora | choice, line | order, place, read | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-NEG-03` | Negatiivisten kokonaislukujen vertaaminen ja järjestäminen | 3-6 | Aarresaaristo / Jäälahti | 🥶 Kylmin aamu | place, choice | colder, bigger, order | transfer | all(2) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-FRAC-02` | Murtoluku yhtä suurten osien lukumäärän kuvaajana | 3-6 | Aarresaaristo / Piirakkajuhla | 🍰 Murtoluku | choice | shade, name, trap | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-DEC-01` | Kymmenesosan ymmärtäminen paikka-arvona | 3-6 | Aarresaaristo / Helmisimpukka | 🦪 Kymmenesosat | line, choice | over, bar, line | transfer | all(1) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-FRAC-06` | Samansuuruisten murtolukujen tunnistaminen | 3-6 | Aarresaaristo / Piirakkajuhla | 🟰 Yhtä isot palat | choice, numeric | missing, same, pick | transfer | all(1) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-DEC-02` | Sadasosan ymmärtäminen paikka-arvona | 3-6 | Aarresaaristo / Helmisimpukka | 💯 Sadasosat | choice, numeric | same, grid, digit | transfer | all(1) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-FRAC-03` | Osoittajan ja nimittäjän merkitys | 3-6 | Aarresaaristo / Piirakkajuhla | ✂️ Osoittaja ja nimittäjä | choice | same, meaning, unit | transfer | all(1) | käyttää: M-FRAC-05, M-FRAC-11 | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-FRAC-08` | Murtoluvun supistaminen | 3-6 | Aarresaaristo / Piirakkajuhla | 🔽 Supistus | choice | simplest, simplify, factor | transfer | all(1) | – | lite181-2026-10-27 | task_context_coverage_seed | generaattoritestit |
| `M-DEC-03` | Tuhannesosan ymmärtäminen paikka-arvona | 3-6 | Aarresaaristo / Helmisimpukka | 📐 Tuhannesosat | choice | write, mm, digit | transfer | all(1) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-FRAC-05` | Samannimisten murtolukujen vertaaminen | 3-6 | Aarresaaristo / Piirakkajuhla | 🥧 Palavertailu | choice, place | order, pick, symbol | transfer | all(1) | – | lite181-2026-10-27 | task_context_coverage_seed | generaattoritestit |
| `M-FRAC-11` | Samannimisten murtolukujen yhteenlasku | 3-6 | Aarresaaristo / Piirakkajuhla | ➕ Palat yhteen | numeric, choice | missing, add, picture | transfer | all(2) | käyttää: M-FRAC-12 | lite181-2026-10-27 | task_context_coverage_seed | generaattoritestit |
| `M-FRAC-12` | Samannimisten murtolukujen vähennyslasku | 3-6 | Aarresaaristo / Piirakkajuhla | ➖ Palat pois | numeric, choice | whole, sub, picture | transfer | all(2) | – | lite181-2026-10-27 | activity_context_use | generaattoritestit |
| `M79-RECIP-01` | Käänteisluvun käsite | 7-9 | Lampilaboratorio / Yhtälöt ja verrannot | 🔄 Käänteisluku | numeric, choice | whole, pick, product | transfer | all(1) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M-DEC-DECOMPOSE` | Desimaaliluvun hajottaminen lukuyksiköihin | 3-6 | Aarresaaristo / Helmisimpukka | 🧩 Pura osiin | choice, numeric | compose, missing, pick | transfer | all(3) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-DEC-READ` | Desimaaliluvun lukeminen | 3-6 | Aarresaaristo / Helmisimpukka | 🗣️ Lue desimaaliluku | choice | fromWords, tenths, hundredths | transfer | all(3) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-DEC-WRITE` | Desimaaliluvun kirjoittaminen | 3-6 | Aarresaaristo / Helmisimpukka | ✏️ Kirjoita desimaaliluku | numeric | teens, tenths, hundredths | transfer | all(3) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-FRAC-15` | Murtoluvun kertominen luonnollisella luvulla | 3-6 | Aarresaaristo / Piirakkajuhla | 🏭 Piirakkatehdas | numeric, choice | whole, repeat, count | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-DEC-04` | Desimaaliluvun lukeminen, kirjoittaminen ja hajottaminen lukuyksiköihin | 3-6 | Aarresaaristo / Helmisimpukka | ⚖️ Kumpi helmi on suurempi? | choice, place, line | order, trap, symbol | transfer | all(3) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-ALG-04` | Tuntemattoman suureen tai puuttuvan luvun käsitteen ymmärtäminen | 3-6 | Aarresaaristo / Vaakasaari | 👜 Arvoituspussi | numeric | times, add, bag, sub | transfer | – | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-DEC-08` | Desimaaliluvun kertominen luonnollisella luvulla | 3-6 | Aarresaaristo / Helmisimpukka | ✖️ Helmikertolasku | numeric, choice | repeated, whole, tens | transfer | all(2) | – | lite181-2026-10-27 | task_context_coverage_seed | generaattoritestit |
| `M-DEC-09` | Desimaaliluvun jakaminen luonnollisella luvulla | 3-6 | Aarresaaristo / Helmisimpukka | ➗ Helmijako | choice, numeric | money, share, tens | transfer | all(2) | – | lite181-2026-10-27 | task_context_coverage_seed | generaattoritestit |
| `M-DEC-ADD` | Desimaalilukujen yhteenlasku | 3-6 | Aarresaaristo / Helmisimpukka | ➕ Helmien yhteenlasku | choice, numeric | sub, tenths, mixed | transfer | all(3) | – | lite181-2026-10-27 | task_context_coverage_seed | generaattoritestit |
| `M-ALG-05` | Yhtäsuuruusmerkin ymmärtäminen kahden yhtä suuren arvon suhteena | 3-6 | Aarresaaristo / Vaakasaari | ⚖️ Tasapainolauta | choice, numeric | balance, both, truth | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-VAR-UNKNOWN` | Muuttujan ymmärtäminen tuntemattomana lukuna | 7-9 | Lampilaboratorio / Kirjainpaja | 🔤 Kirjain on luku | choice, numeric | bags, solve, meaning | transfer | all(1) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M79-VAR-VARYING` | Muuttujan ymmärtäminen muuttuvana suureena | 7-9 | Lampilaboratorio / Kirjainpaja | 📈 Muuttuva määrä | numeric, choice | which, step, fill | transfer | all(1) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-ALG-06` | Yhtälön tunnistaminen yhtäsuuruudeksi, jossa on tuntematon | 3-6 | Aarresaaristo / Vaakasaari | 🔍 Yhtälön tunnistaja | choice | check, which, fromBalance | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-VAR-01` | Muuttujan käsite muuttuvana tai tuntemattomana lukuna | 7-9 | Lampilaboratorio / Kirjainpaja | 🧭 Tuntematon vai muuttuja? | numeric, choice | can, classify, same | transfer | all(2) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-ALG-07` | Ehdotetun ratkaisun testaaminen yhtälössä | 3-6 | Aarresaaristo / Vaakasaari | 🧪 Kokeile ja tarkista | choice | balance, test, which | transfer | all(1) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M79-EXPR-EVAL` | Lausekkeen arvon laskeminen muuttujan arvolla | 7-9 | Lampilaboratorio / Kirjainpaja | 🧷 Sijoita ja laske | numeric, choice | neg, linear, paren | transfer | all(1) | – | lite181-2026-10-27 | task_context_coverage_seed | generaattoritestit |
| `M79-EXPR-FORM` | Lausekkeen muodostaminen sanallisesta tilanteesta | 7-9 | Lampilaboratorio / Kirjainpaja | 🖊️ Kirjoita lauseke | choice, build | build, words, price, shape | transfer | all(1) | käyttää: M-GMEAS-01 | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-ALG-08` | Yksinkertaisen yhtälön ratkaiseminen päättelemällä | 3-6 | Aarresaaristo / Vaakasaari | 🧠 Päättele puuttuva | numeric | sub, add, mul | transfer | all(1) any(2) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-UNIT-01` | Metrijärjestelmän kymmenkantaisen rakenteen ymmärtäminen | 3-6 | Aarresaaristo / Saaren tori | 🪜 Yksikkörappuset | choice | other, prefix, steps | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-EQ1-FORM` | Ensimmäisen asteen yhtälön muodostaminen tilanteesta | 7-9 | Lampilaboratorio / Kirjainpaja | 📝 Tilanteesta yhtälöksi | choice, build | build, shop, age, balance | transfer | all(2) | käyttää: M-GMEAS-01 | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M-UNIT-02` | Yleisimpien pituusyksiköiden muuntaminen | 3-6 | Aarresaaristo / Saaren tori | 🪵 Lankkukauppa | numeric | mm-cm-4, m-cm-0, cm-mm-1, km-m-2, cm-m-3 | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-UNIT-03` | Yleisimpien massayksiköiden muuntaminen | 3-6 | Aarresaaristo / Saaren tori | 🌾 Jauhopussit | numeric | kg-g-3, kg-g-0, t-kg-1, g-kg-2 | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-UNIT-04` | Yleisimpien vetomittojen tai tilavuusyksiköiden muuntaminen | 3-6 | Aarresaaristo / Saaren tori | 🧃 Mehuasema | numeric | l-cl-4, l-dl-0, l-ml-1, dl-ml-2, dl-l-3 | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-UNIT-05` | Aikayksiköiden muuntaminen | 3-6 | Aarresaaristo / Saaren tori | ⛴️ Lauttaaikataulu | numeric, choice | day, hmin, mins, mixed, back | transfer | all(1) | dyn: requires_multiplication_or_division_according_to_conversion_direction; käyttää: M-TIME-02 | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-SPEED-UNIT` | Nopeuden yksikön johtaminen matkan ja ajan yksiköistä | 7-9 | Lampilaboratorio / Liike ja nopeus | 📎 Nopeuden yksikkö | choice | ms, sim, kmh | transfer | all(2) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-DATA-09` | Tiedon järjestelmällinen kerääminen | 3-6 | Aarresaaristo / Tutkimusasema | 🗂️ Järjestelmällinen tutkija | choice | order, method, fix | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-DATA-10` | Havaintoaineiston järjestäminen taulukoksi | 3-6 | Aarresaaristo / Tutkimusasema | 🗃️ Taulukon kokoaja | numeric, choice | shape, listToTable, cell | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-COORD-READ-Q1` | Pisteen koordinaattien lukeminen koordinaatiston I neljänneksessä | 3-6 | Aarresaaristo / Aarresaari | 🗺️ Aarrekartta | choice | axis, read, whichPin | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-COORD-PLOT-Q1` | Annettujen koordinaattien mukaisen pisteen merkitseminen I neljännekseen | 3-6 | Aarresaaristo / Aarresaari | 📍 Kätke aarre | plot | story, plot, onAxis | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-COORD-01` | Pisteen lukeminen ja merkitseminen koordinaatiston I neljänneksessä | 3-6 | Aarresaaristo / Aarresaari | 🏝️ Saaren rakentaja | choice, plot | move, corner, readPoly | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M-COORD-02` | Koordinaatiston kaikkien neljännesten käyttäminen | 3-6 | Aarresaaristo / Jäälahti | 🧭 Koko meren kartta | choice, plot | quadrant, plot, read | transfer | all(2) | käyttää: M-SYM-01 | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `SCI-ENV-MEAS-01` | Mittauksen tekeminen tarkoituksenmukaisella välineellä | 3-6 | Aarresaaristo / Tutkimusasema | 🎯 Tarkka mittaaja | choice | repeat, toolUnit, unit | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `SCI-ENV-DATA-01` | Mittausten ja havaintojen kokoaminen aineistoksi | 3-6 | Rantaretki / Havaintovihko | 📊 Havaintoaineisto | choice | total, table, most | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-DATA-01` | Mittaustulosten kokoaminen taulukkoon | 7-9 | Lampilaboratorio / Mittausdata ja kuvaajat | 🗒️ Mittaustaulukko | numeric, choice | table, sim, header | transfer | all(1) | käyttää: M-DATA-05 | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-FRAC-MUL` | Murtoluvun kertominen murtoluvulla | 7-9 | Lampilaboratorio / Yhtälöt ja verrannot | 🧁 Reseptin pienennys | choice | half, area, calc | transfer | all(2) | käyttää: M-FRAC-08 | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-FRAC-DIV` | Murtoluvun jakaminen murtoluvulla | 7-9 | Lampilaboratorio / Yhtälöt ja verrannot | 🥤 Montako mahtuu? | choice, numeric, frac | calc, groups, fracFrac, rule, bigger | transfer | all(2) | – | lite181-2026-10-27 | canonical_ancestor_of_task_context_seed | generaattoritestit |
| `M79-DEC-DIV` | Desimaalilukujen jakolaskun syventäminen | 7-9 | Lampilaboratorio / Yhtälöt ja verrannot | 🔬 Desimaalijakaja | numeric, choice | grows, scale, compute | transfer | all(1) | – | lite181-2026-10-27 | task_context_coverage_seed | generaattoritestit |
| `M79-PROP-01` | Verrannon rakenteen ymmärtäminen kahden suhteen yhtäsuuruutena | 7-9 | Lampilaboratorio / Yhtälöt ja verrannot | 🔗 Verranto | numeric, choice | check, missing, recipe | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-SPEED-CALC` | Keskinopeuden laskeminen v=s/t | 7-9 | Lampilaboratorio / Liike ja nopeus | 🧮 Laske nopeus | numeric | ms, sim, kmh | transfer | all(1) | käyttää: M-DEC-ADD | motion1-2026-10-27 | aiempi 107 | generaattoritestit + pelattu selaimessa |
| `M79-DEP-01` | Kahden muuttuvan suureen riippuvuuden tunnistaminen | 7-9 | Lampilaboratorio / Funktiot ja suorat | 🔀 Riippuuko? | choice, numeric | pattern, depends, which | transfer | – | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-FUNC-01` | Funktion käsite: jokaiselle syötteelle määräytyy arvo | 7-9 | Lampilaboratorio / Funktiot ja suorat | ⚙️ Funktiokone | choice, numeric | isFunc, run, rule | transfer | all(1) | käyttää: M79-EXPR-EVAL | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-FUNC-TABLE` | Funktion esittäminen arvotaulukkona | 7-9 | Lampilaboratorio / Funktiot ja suorat | 🗂️ Arvotaulukko | choice, numeric, plot | table, fill, rule | transfer | all(1) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M79-FUNC-GRAPH` | Funktion esittäminen koordinaatistossa | 7-9 | Lampilaboratorio / Funktiot ja suorat | 📈 Funktio kuvaajaksi | numeric, choice, plot | match, plot, read | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-GRAPH-01` | Mittaustulosten esittäminen kuvaajana | 7-9 | Lampilaboratorio / Mittausdata ja kuvaajat | 📈 Pisteet kuvaajaan | numeric, plot, choice | plot, sim, pick | transfer | all(1) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-VT-GRAPH` | Nopeus–aika-kuvaajan tulkitseminen tasaisessa ja muuttuvassa liikkeessä | 7-9 | Lampilaboratorio / Mittausdata ja kuvaajat | 🚀 Nopeus–aika-kuvaaja | choice, numeric | steady, sim, rest, accel, decel | transfer | all(2) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-UNIT-LIN` | Pituusyksiköiden muunnosten varmentaminen ja laajentaminen | 7-9 | Lampilaboratorio / Suureet ja yksiköt | 📐 Desimaalimittari | numeric, choice | cmm, mcm, mmm, kmm | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-UNIT-CONV` | Yksikkömuunnoksen tekeminen ennen fysikaalista laskua | 7-9 | Lampilaboratorio / Suureet ja yksiköt | 🔁 Yksikkömuunnos | numeric, choice | cmM, kmM, minS, hMin | transfer | all(1) | dyn: requires_quantity_specific_unit_conversion_skill_for_item_instance; käyttää: M-DEC-08, M-DEC-09 | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-SPEED-MIXED` | Nopeuslasku sekayksiköillä yksiköt ensin yhtenäistäen | 7-9 | Lampilaboratorio / Liike ja nopeus | ⚖️ Sekayksiköt | numeric, choice | mMin, sim, kmMin, kmh | transfer | all(3) | käyttää: M79-DEC-DIV | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-INT-ORDER` | Kokonaislukujen järjestyksen ymmärtäminen lukusuoralla | 7-9 | Lampilaboratorio / Pakkasloki | 🌡️ Pakkasjärjestys | choice, line | place, compare, sign, order | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-INT-DIST` | Kokonaislukujen välisen etäisyyden ymmärtäminen lukusuoralla | 7-9 | Lampilaboratorio / Pakkasloki | 📏 Etäisyys jäällä | numeric | abs, across, same | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-INT-01` | Kokonaislukujen järjestys ja etäisyys lukusuoralla | 7-9 | Lampilaboratorio / Pakkasloki | 🎯 Lukusuoran mestari | numeric, choice, line | closer, jump, mid | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-INT-ADD` | Kokonaislukujen yhteenlasku | 7-9 | Lampilaboratorio / Pakkasloki | 🐸 Hypyt lukusuoralla | numeric, choice, line | mixed, line, negneg | transfer | all(2) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M79-INT-MUL` | Kokonaislukujen kertolasku ja merkkisääntö | 7-9 | Lampilaboratorio / Pakkasloki | ✖️ Merkkisääntö kertolaskussa | choice, numeric | negneg, pattern, sign | transfer | all(2) | – | lite181-2026-10-27 | canonical_required_strong_support | generaattoritestit |
| `M79-EQ1-SOLVE` | Ensimmäisen asteen yhtälön ratkaiseminen tasapainoperiaatteella | 7-9 | Lampilaboratorio / Yhtälöt ja verrannot | ⚖️ Tasapainoyhtälö | numeric | both, one, two | transfer | all(1) | dyn: requires_arithmetic_operations_present_in_equation_item; käyttää: M79-INT-DIV | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-SPEED-REARR` | Matkan tai ajan ratkaiseminen nopeussuhteesta | 7-9 | Lampilaboratorio / Liike ja nopeus | ↔️ Matka tai aika | numeric | dist, sim, time | transfer | all(1) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-LINE-GRAPH` | Suoran piirtäminen koordinaatistoon yhtälöstä | 7-9 | Lampilaboratorio / Funktiot ja suorat | 📉 Suoran yhtälö | choice, plot, numeric | draw, which, intercept | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-SLOPE` | Kulmakertoimen ymmärtäminen muutoksen suhteena | 7-9 | Lampilaboratorio / Funktiot ja suorat | ⛰️ Kulmakerroin | numeric, choice | steeper, points, table, sign | transfer | all(1) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-ST-GRAPH` | Matka–aika-kuvaajan tulkitseminen liikkeen mallina | 7-9 | Lampilaboratorio / Mittausdata ja kuvaajat | 📉 Matka–aika-kuvaaja | choice, numeric | flat, sim, steeper, read | transfer | all(2) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-ACCEL-MOTION-GRAPH` | Muuttuvan liikkeen tunnistaminen paikka–aika- tai liikekuvaajasta | 7-9 | Lampilaboratorio / Kiihtyvyys | 〰️ Kaareva kuvaaja | choice | steady, sim, rest, accel, decel | transfer | all(1) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-ACCEL-VT-GRAPH` | Muuttuvan liikkeen tunnistaminen nopeus–aika-kuvaajasta | 7-9 | Lampilaboratorio / Kiihtyvyys | 📐 Kiihtyvyys kuvaajasta | numeric, choice | read, sim, steeper, sign | transfer | all(1) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-ACCEL-GRAPH` | Muuttuvan liikkeen tunnistaminen liike- ja nopeuskuvaajista | 7-9 | Lampilaboratorio / Kiihtyvyys | 🔗 Kaksi kuvaajaa | choice | steady, sim, rest, accel | transfer | all(2) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |
| `M79-INT-DIV` | Kokonaislukujen jakolasku ja merkkisääntö | 7-9 | Lampilaboratorio / Pakkasloki | ➗ Merkkisääntö jakolaskussa | numeric, choice | check, sign, negneg | transfer | all(2) | – | lite181-2026-10-27 | task_context_coverage_seed | generaattoritestit |
| `M79-INT-SUB` | Kokonaislukujen vähennyslasku | 7-9 | Lampilaboratorio / Pakkasloki | ➖ Muutoksen laskija | numeric | change, subNeg, down | transfer | all(2) | – | lite181-2026-10-27 | aiempi 107 | generaattoritestit |
| `PHY79-ACCEL-CALC` | Keskimääräisen kiihtyvyyden laskeminen nopeuden muutoksesta ja ajasta | 7-9 | Lampilaboratorio / Kiihtyvyys | 🧮 Laske kiihtyvyys | numeric | rest, sim, moving | transfer | all(1) | – | motion1-2026-10-27 | aiempi 107 | generaattoritestit |

## Oppitunnin osat noodeittain

Jokaisessa oppitunnissa on lisäksi: itsenäinen tarkistus (3 peräkkäin oikein vähintään kahdesta perheestä + siirtotehtävä, tai pikatarkistus 2 oikein), uusintaharjoitus "Harjoittele lisää" (5 uutta tehtävää), "Myöhemmin" ja paluu kartalle. Väärä vastaus näyttää aina oikean päättelyn; kahden peräkkäisen virheen jälkeen tarjotaan apua, tukiretkeä tai myöhemmin-valintaa.

| KC | Tavoite (lapselle) | Apu ja esimerkki | Väärän vastauksen selitys | Seuraus maailmassa |
| --- | --- | --- | --- | --- |
| `M-GEO-01` | Opit erottamaan litteät tasokuviot ja kappaleet, joita voi pidellä. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Kuution jokainen pinta on neliö.") | Erotat litteät kuviot ja kappaleet! Luvun löytö: 🧩 lajittelulaatikko |
| `M-REP-04` | Opit kirjoittamaan tilanteen lyhyesti numeroilla ja merkeillä. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "6 − 1 = 5.") | Kirjoitat tilanteita merkkikielellä! Luvun löytö: 🚩 merkkiviiri |
| `M-TH-08` | Opit huomaamaan, että kaksi opittua asiaa kertovat samasta asiasta. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "3 riviä, joissa 3: 3 × 3 = 9.") | Löydät yhteydet: yksi asia, monta esitystapaa! Luvun löytö: 💡 majakan valo |
| `SCI-ENV-SAFE-01` | Opit tunnistamaan turvallisen tavan toimia tutkimuksessa. Oikeita välineitä käytetään aina aikuisen kanssa. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Sidon hiukset kiinni ennen työtä. Kädet tarvitaan työhön.") | Tunnistat turvalliset toimintatavat. Muista: oikeassa tutkimuksessa aikuinen on aina mukana. Luvun löytö: 📓 havaintovihko |
| `M-GEO-04` | Opit tunnistamaan kolmion, neliön, suorakulmion ja ympyrän, vaikka ne olisivat käännettyinä. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Neliössä on neljä kulmaa.") | Tunnistat tasokuviot, käännettyinäkin! Luvun löytö: 🧩 lajittelulaatikko |
| `M-NUM-1TO1` | Opit antamaan jokaiselle esineelle täsmälleen yhden laskusanan. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 51 %:ssa | 100 % (esim. "Yksi esine sai kaksi numeroa.") | Jokainen esine sai oman sanansa. Hienoa laskemista! Luvun löytö: 🎵 laskuloru-pilli |
| `M-SYM-01` | Opit tunnistamaan, onko viiva kuvion symmetria-akseli, ja tekemään peilikuvan. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Peilikuvassa viivan vieressä oleva ruutu pysyy viivan vieressä, ja kauimmainen pysyy kauim…") | Tunnistat symmetrian ja teet peilikuvia! Luvun löytö: 🗺️ aarrekartan pala |
| `M-NUM-STABLE-ORDER` | Opit sanomaan lukusanat aina samassa järjestyksessä: yksi, kaksi, kolme… | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Oikea järjestys: yksi, kaksi, kolme, neljä, viisi.") | Loikan laskuloru toimii! Nyt voidaan laskea retkitavarat. Luvun löytö: 🎵 laskuloru-pilli |
| `M-NUM-WORD-NUMERAL` | Opit yhdistämään lukusanan ja sen numeron, esimerkiksi viisi ja 5. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Numero 4 on neljä.") | Tunnet numerot nimeltä! Luvun löytö: 🎵 laskuloru-pilli |
| `M-TH-01` | Opit huomaamaan, mikä on samaa ja mikä erilaista. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Erilaisessa koko on eri.") | Huomaat pienetkin erot! Luvun löytö: 📏 oma mittanauha |
| `M-TH-02` | Opit lajittelemaan asioita annetun ominaisuuden mukaan. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Muut ovat siniset. Tämä on eri värinen.") | Lajittelet ohjeen mukaan, vaikka muut ominaisuudet hämäävät! Luvun löytö: 🧩 lajittelulaatikko |
| `M-TH-03` | Opit järjestämään asioita annetun ominaisuuden mukaan. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Keskimmäinen on pidempi kuin lyhyin mutta lyhyempi kuin pisin.") | Järjestät asiat jonoon sääntöä noudattaen! Luvun löytö: 🧩 lajittelulaatikko |
| `M-TH-04` | Opit huomaamaan, miten kuvio toistuu tai kasvaa, ja jatkamaan sitä. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Joka kuvassa tulee 2 pistettä lisää: 5 + 2 = 7.") | Löydät säännön ja jatkat kuviota! Luvun löytö: 🧩 lajittelulaatikko |
| `M-WORK-01` | Opit huomaamaan, mikä tieto on tärkeää laskemisen kannalta ja mikä ei. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Kaloja on 3, kukkia 4. Kukkia on 1 enemmän.") | Huomaat tärkeän tiedon ja jätät turhan pois! Luvun löytö: 🧩 lajittelulaatikko |
| `M-MEAS-00` | Opit vertaamaan kahta esinettä suoraan: kumpi on pidempi tai painavampi. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Kun alkupäät ovat samassa kohdassa, nauhat ovat yhtä pitkät.") | Nauhat on verrattu. Viiri valmistuu! Luvun löytö: 📏 oma mittanauha |
| `M-TH-07` | Opit etsimään kaikki vaihtoehdot järjestelmällisesti, ettei mikään jää pois. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 52 %:ssa | 100 % (esim. "Pidä yksi hattu paikallaan ja käy läpi kaikki huivit, sitten seuraava hattu: 6 asua.") | Löydät kaikki vaihtoehdot järjestyksessä! Luvun löytö: 💎 tutkimusaseman aarre |
| `M79-LOGIC-01` | Opit löytämään säännön, joka pätee kaikkiin esimerkkeihin, ei vain ensimmäiseen. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Sääntö pätee kahteen ensimmäiseen, mutta ei kolmanteen: 3 · 3 = 9.") | Löydät säännön ja testaat sen kaikilla esimerkeillä! Luvun löytö: 📟 yhden arvon mittari |
| `SCI-ENV-OBSERVE-01` | Opit katsomaan tarkasti ja kertomaan, mitä näit. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Oranssi näkyy kuvasta.") | Huomasit tarkasti. Havainto vihkoon! Luvun löytö: 📓 havaintovihko |
| `M-MEAS-02` | Opit, että pituus ei muutu, vaikka nauhaa taivuttaa tai siirtää. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Mutkitteleva polku on pidempi, vaikka päät ovat yhtä kaukana.") | Tiedät, mitä pituus tarkoittaa! Luvun löytö: 📏 oma mittanauha |
| `M-TIME-01` | Opit vertaamaan, kumpi kestää kauemmin. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Punainen sammui ensin. Sininen paloi kauemmin.") | Huomaat, mikä kestää kauemmin! Luvun löytö: 📏 oma mittanauha |
| `M-NUM-01` | Opit laskemaan esineet niin, ettei yksikään jää laskematta tai tule laskettua kahdesti. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 35 %:ssa | 100 % (esim. "Niitä on kuusi. Ringissä pitää muistaa aloituskohta.") | Kaikki tavarat on laskettu! Luvun löytö: 🎵 laskuloru-pilli |
| `ENV-PHY-MOTION-OBS-01` | Opit päättelemään kuvista, liikkuiko jokin. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 41 %:ssa | 100 % (esim. "Lehti on samassa kohdassa kiveen nähden.") | Huomaat liikkeen! Luvun löytö: 📓 havaintovihko |
| `M-TIME-03` | Opit, että aikaa mitataan sovituilla yksiköillä, kuten sekunneilla. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Palikoita on 3. Valo paloi 3 s eli kolme sekuntia.") | Osaat kertoa keston sekunteina! Luvun löytö: 📏 oma mittanauha |
| `M-MEAS-01` | Opit mittaamaan pituuden laskemalla, montako yhtä pitkää palaa siihen mahtuu. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Oikein mitatessa palat ovat samankokoisia, peräkkäin, ilman rakoja ja päällekkäisyyksiä.") | Mittaat kuin oikea mittari! Luvun löytö: 📏 oma mittanauha |
| `M-NUM-02` | Opit, että viimeinen laskusana kertoo, montako esinettä on kaikkiaan. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 49 %:ssa | 100 % (esim. "Lasketaan: yksi, kaksi, kolme. Kun sanot kolme, lopeta.") | Viimeinen sana kertoo määrän. Nyt tiedät sen! Luvun löytö: 🎵 laskuloru-pilli |
| `M-NUM-17` | Opit jakamaan joukon kahteen yhtä suureen osaan. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "5 + 5 = 10, joten puolet luvusta 10 on 5.") | Jaoit reilusti kahtia: puolet kummallekin! Luvun löytö: 🧺 eväskori |
| `ENV-PHY-MOTION-CHANGE-01` | Opit huomaamaan, nopeutuuko vai hidastuuko liike. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Ankka meni ensin oikealle ja sitten takaisin vasemmalle.") | Näet, miten liike muuttuu! Luvun löytö: 📓 havaintovihko |
| `M-ADD-01` | Opit, että yhteenlasku yhdistää kaksi määrää yhdeksi. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 51 %:ssa | 100 % (esim. "3 + 1 = 4.") | Kaikki eväät ovat korissa! Luvun löytö: 🧺 eväskori |
| `M-NUM-QTY-NUMERAL` | Opit valitsemaan määrälle oikean numeron. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 51 %:ssa | 100 % (esim. "Numero 4 on neljä. Oikeassa rasiassa on neljä simpukkaa.") | Kaikissa rasioissa on oikea lappu. Retkivarusteet ovat valmiina! Luvun löytö: 🎵 laskuloru-pilli |
| `M-NUM-QTY-WORD` | Opit valitsemaan määrälle oikean lukusanan. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Oikeassa kuvassa on neljä simpukkaa.") | Osaat sanoa, montako niitä on! Luvun löytö: 🎵 laskuloru-pilli |
| `ENV-PHY-MOTION-01` | Opit vertaamaan kahden liikkujan liikettä. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Kaikissa kuvissa ankka on samassa kohdassa kiveen nähden.") | Olet tarkka liikkeen tarkkailija! Luvun löytö: 📓 havaintovihko |
| `M-NUM-03` | Opit, että sama määrä voidaan näyttää esineinä, numerona ja sanana. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "4 on neljä, ja siihen kuuluu neljä esinettä.") | Esineet, numero ja sana kertovat saman. Olet laskumestari! Luvun löytö: 🎵 laskuloru-pilli |
| `M-NUM-18` | Opit, mistä kahdesta osasta luvut 1–10 voi koota. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 68 %:ssa | 100 % (esim. "4 + 6 = 10. Tyhjiä ruutuja on 6.") | Tunnet lukujen osat: piilossa olevat simpukat eivät jää arvoitukseksi! Luvun löytö: 🐚 simpukkakaulakoru |
| `PHY79-MOTION-REF` | Opit, että liike kuvataan aina suhteessa johonkin. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Penkki liikkuu matkustajan mukana.") | Valitset aina vertailukohdan! Luvun löytö: ⏱️ kisakello |
| `M-NUM-07` | Opit jatkamaan lukujonoa eteenpäin. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "20, 21, 22, 23: joka kerta + 1.") | Loikka pääsi lammen yli! Luvun löytö: 🪨 hyppykivipolku |
| `M-NUM-08` | Opit jatkamaan lukujonoa taaksepäin. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "16, 15, 14, 13.") | Loikka pääsi takaperin takaisin rantaan! Luvun löytö: 🪨 hyppykivipolku |
| `M-NUM-10` | Opit päättelemään, kumpi kahdesta luvusta on suurempi. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 35 %:ssa | 100 % (esim. "41 < 59: kärki osoittaa pienempää lukua 41.") | Osaat verrata lukuja: ensin kympit, sitten ykköset! Luvun löytö: 🎵 laskuloru-pilli |
| `M-TIME-02` | Opit lukemaan kellosta tasatunnit ja puolet tunnit: lyhyt viisari näyttää tunnin, pitkä minuutit. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Lyhyt viisari näyttää tunnin, pitkä minuutit.") | Luet kellosta tasat ja puolet! Luvun löytö: 📏 oma mittanauha |
| `M-NUM-14` | Opit, että mittaustuloksen luku kertoo, montako mittapalaa esine on. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Oikean nauhan alla on 5 palaa.") | Osaat kertoa mittauksen luvulla! Luvun löytö: 📏 oma mittanauha |
| `PHY79-QTY-CONCEPT` | Opit erottamaan, mikä ominaisuus on mitattava suure ja mikä ei. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "massa: suure. kilogramma: yksikkö. vaaka: väline.") | Tunnistat suureet! Luvun löytö: 🧪 kalibroitu mittalasi |
| `PHY79-NUMVALUE` | Opit löytämään mittaustuloksesta lukuarvon. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "m on suureen tunnus, 0,4 lukuarvo ja kg yksikkö.") | Löydät lukuarvon mistä tahansa tuloksesta! Luvun löytö: 🧪 kalibroitu mittalasi |
| `PHY79-UNIT-CONCEPT` | Opit, miksi mittaustulokseen tarvitaan yksikkö. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "aika: s.") | Yksiköt hallussa! Luvun löytö: 🧪 kalibroitu mittalasi |
| `PHY79-QTY-01` | Opit purkamaan mittaustuloksen osiin: suure, lukuarvo ja yksikkö. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Lukuarvo on 0,4.") | Puret jokaisen mittaustuloksen! Luvun löytö: 🧪 kalibroitu mittalasi |
| `PHY79-DIST-TIME` | Opit tunnistamaan liikkeestä matkan ja ajan. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Ajan yksiköitä ovat s, min ja h: 35 s, 1,5 h.") | Erotat matkan ja ajan! Luvun löytö: ⏱️ kisakello |
| `M-NUM-EQUALSTEP-SEQ` | Opit tunnistamaan jonon, jossa hypyt ovat yhtä pitkiä, ja jatkamaan sitä. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 73 %:ssa | 100 % (esim. "2, 4, 6, 8: joka kerta + 2.") | Löysit hyppyjen säännön! Luvun löytö: 🪨 hyppykivipolku |
| `M-NUM-MULTIPLE-INTRO` | Opit, mihin lukuihin päädyt, kun hyppäät nollasta aina saman verran. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "Hypyt: 5, 10, 15. Loikka osuu kiveen 15.") | Tiedät, mihin Loikka osuu! Luvun löytö: 🪨 hyppykivipolku |
| `M-NUM-16` | Opit päättelemään lukujonosta, kuinka pitkiä hypyt ovat. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 49 %:ssa | 100 % (esim. "3, 6, 9, 12: joka kerta + 3.") | Ratkaisit hyppyjen salaisuuden! Luvun löytö: 🪨 hyppykivipolku |
| `M-MUL-01` | Opit, että kertolasku tarkoittaa monta yhtä suurta ryhmää. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Oikeassa kuvassa jokaisessa pussissa on 3.") | Pussit on pakattu tasan! Luvun löytö: 🧺 eväskori |
| `M-MULTAB-LOW` | Opit kertotaulut 1, 2, 3, 4, 5 ja 10. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 15 %:ssa | 100 % (esim. "4 × 5 on tuplan tupla: 2 × 5 = 10, ja 10 + 10 = 20.") | Kertotaulut 1–5 ja 10 ovat hallussa! Luvun löytö: 🪵 lautan hirsikansi |
| `M-DIV-02` | Opit selvittämään, montako yhtä suurta ryhmää määrästä saa. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 51 %:ssa | 100 % (esim. "3 + 3 = 6. Tarvitaan 2 pussia.") | Pussit riittivät juuri sopivasti! Luvun löytö: 🧺 eväskori |
| `M-MULTAB-HIGH` | Opit kertotaulut 6–9 helpompien taulujen avulla: 9 × 7 = 10 × 7 − 7 ja 6 × 7 = 5 × 7 + 7. | 3 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 65 %:ssa | 100 % (esim. "7 × 4 = 28.") | Osaat isot kertotaulut ja niiden temput! Luvun löytö: 💡 majakan valo |
| `M-MULTAB-ALL` | Opit kaikki kertotaulut 1–10 sujuvasti ja osaat päätellä puuttuvan tekijän. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Yksi 7 vähemmän: 28 − 7 = 21.") | Kertotaulut sujuvat ja osaat päätellä naapureita! Luvun löytö: 💡 majakan valo |
| `M-MULTREL-01` | Opit vertaamaan määriä: kolme kertaa niin paljon. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Aavan torni (2) mahtuu Loikan torniin (4) 2 kertaa.") | Loikan torni on valmis! Luvun löytö: 🧺 eväskori |
| `PHY79-SPEED-CONCEPT` | Opit, että nopeus kertoo matkan ajassa. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Nopeus on matka jaettuna ajalla: A 20 m / 4 s = 5 m/s, B 30 m / 4 s = 7,5 m/s.") | Ymmärrät, mitä nopeus tarkoittaa! Luvun löytö: ⏱️ kisakello |
| `PHY79-ACCEL-CONCEPT` | Opit, että kiihtyvyys kertoo, kuinka nopeasti nopeus muuttuu. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "2 m/s² = nopeus muuttuu 2 m/s sekunnissa.") | Ymmärrät kiihtyvyyden! Luvun löytö: 🏆 loikkakisan pokaali |
| `SCI-ENV-PRESENT-DATA-01` | Opit valitsemaan kuvan, joka näyttää havainnot oikein. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Simpukka kuuluu paikan niitty alle.") | Loikka ymmärsi kuvasta kaiken! Luvun löytö: 📓 havaintovihko |
| `SCI-ENV-RECORD-DATA-01` | Opit merkitsemään havainnot muistiin, ettei mitään unohdu. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "kallio: kivi, niitty: simpukka, ranta: käpy.") | Havainnot ovat tallessa vihkossa! Luvun löytö: 📓 havaintovihko |
| `SCI-ENV-RECORD-01` | Opit kirjaamaan koko retken havainnot ja näyttämään ne muille. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 51 %:ssa | 100 % (esim. "Oikealla sivulla jokainen havainto on oman paikkansa alla oikea määrä.") | Retkivihko on valmis! Luvun löytö: 📓 havaintovihko |
| `M-NUM-06` | Opit, että nolla tarkoittaa: ei yhtään. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Kaikki kaksi syötiin, joten jäi nolla.") | Nolla on luku: se tarkoittaa, ettei ole yhtään! Luvun löytö: 🎵 laskuloru-pilli |
| `M-PLACE-01` | Opit niputtamaan kymmenen ykköstä yhdeksi kymppinipuksi. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 68 %:ssa | 100 % (esim. "10 + 10 + 10 = 30. Nippuja on 3.") | Kymmenen yksittäistä on yksi kymppi! Luvun löytö: 🛶 kaislalautta |
| `M-PLACE-02` | Opit, että luvun ensimmäinen numero kertoo kympit ja viimeinen ykköset. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "2 on ykkösten paikalla: 2 irtokaislaa.") | Luvun numerot kertovat niput ja irtokaislat! Luvun löytö: 🛶 kaislalautta |
| `M-PLACE-03` | Opit kokoamaan ja purkamaan luvun kymppeihin ja ykkösiin. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "23: 2 kymppiä ja 3 ykköstä.") | Lautta on valmis! Osaat koota ja purkaa lukuja. Luvun löytö: 🛶 kaislalautta |
| `M-MENTAL-01` | Opit hajottamaan luvun niin, että laskeminen helpottuu. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 35 %:ssa | 100 % (esim. "41 + 10 = 51, ja vielä 4: 55.") | Jaat luvut fiksusti: päässälasku helpottuu! Luvun löytö: 🛶 kaislalautta |
| `M-SUB-01` | Opit, että vähennyslasku kertoo, montako jää, kun osa otetaan pois. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 68 %:ssa | 100 % (esim. "6 − 1 = 5.") | Osaat vähentää: pois otettu ei enää ole mukana! Luvun löytö: 🚩 merkkiviiri |
| `M-ADD-SUB-01` | Opit, että vähennyslasku purkaa yhteenlaskun ja päinvastoin. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "9 + 3 = 12, joten vähennyslasku oli oikein.") | Tunnet lukuperheet: yhdestä laskusta saat kolme muuta! Luvun löytö: 🐚 simpukkakaulakoru |
| `M-ADD-FACT-10` | Opit yhteenlaskut kymmeneen asti nopeasti ja varmasti. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 52 %:ssa | 100 % (esim. "2 + 2 = 4, ja yksi lisää: 5.") | Pienet plussalaskut sujuvat: niillä rakennat isommat! Luvun löytö: 🐚 simpukkakaulakoru |
| `M-DIV-01` | Opit jakamaan määrän reilusti: jokainen saa yhtä monta. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "4 jaettuna 2 poikaselle: kukin saa 2, koska 2 + 2 = 4.") | Jako meni reilusti: kaikki saivat yhtä monta! Luvun löytö: 🧺 eväskori |
| `M-SUB-FACT-10` | Opit vähennyslaskut kymmeneen asti ajattelemalla yhteenlaskua. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "6 − 1 = 5.") | Pienet miinuslaskut sujuvat: ajattelet yhteenlaskua! Luvun löytö: 🐚 simpukkakaulakoru |
| `M-ADD-FACT-01` | Opit valitsemaan plussan tai miinuksen ja laskemaan sen varmasti. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "4 + 1 = 5. Sen voi laskea myös: 5 − 4 = 1.") | Plussat ja miinukset sujuvat sekaisinkin! Luvun löytö: 🐚 simpukkakaulakoru |
| `M-DIVIS-01` | Opit, mitä jaollinen tarkoittaa: luku jakautuu tasan ilman jakojäännöstä. Opit myös luvuilla 2, 5 ja 10 jaollisuuden tunnusmerkit. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 65 %:ssa | 100 % (esim. "19 : 4 = 4, jakojäännös 3.") | Tunnistat jaollisuuden ja sen merkit! Luvun löytö: 💡 majakan valo |
| `M-MULDIV-01` | Opit, että jakolasku purkaa kertolaskun. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "3 × 3 = 9, joten jakolasku oli oikein.") | Tunnet kerto- ja jakolaskun perheet! Luvun löytö: 🪵 lautan hirsikansi |
| `M-ADD-20` | Opit yhteenlaskut 20:een asti täydentämällä ensin kymppiin. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "7 + 3 = 10. Sitten 10 + 1 = 11.") | Hyppäät kympin yli varmasti! Luvun löytö: 🐚 simpukkakaulakoru |
| `M-DIV-FACT-01` | Opit laskemaan helppoja jakolaskuja kertotaulun avulla. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "6 : 3 = 2, koska 3 × 2 = 6.") | Jakolaskut ratkeavat kertotaululla! Luvun löytö: 🪵 lautan hirsikansi |
| `M-FRAC-01` | Opit jakamaan kokonaisen yhtä suuriin osiin. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Kaikki palat ovat yhtä suuria: jako on reilu.") | Osaat jakaa reilusti yhtä suuriin osiin! Luvun löytö: 🥧 mustikkapiirakka |
| `M-SUB-20` | Opit vähennyslaskut 20:een asti menemällä ensin kymppiin. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "4 + 9 = 13, joten 13 − 4 = 9.") | Laskeudut kympin ali varmasti! Luvun löytö: 🐚 simpukkakaulakoru |
| `M-ADD-100` | Opit yhteenlaskut sataan asti: kympit kymppeihin, ykköset ykkösiin. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Lisätään 1 kymppiä: ykköset eivät muutu. 34 + 10 = 44.") | Lasket yhteen sataan asti! Luvun löytö: 🛶 kaislalautta |
| `M-SUB-100` | Opit vähennyslaskut sataan asti ja purat kympin, kun ykköset eivät riitä. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "43 + 18 = 61. Vastaus on oikein.") | Vähennät sataan asti ja osaat purkaa kympin! Luvun löytö: 🛶 kaislalautta |
| `M-GEO-02` | Opit käyttämään sanoja vasen, oikea, ylä, ala ja välissä. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Välissä on se, joka on kummankin vieressä: meritähti.") | Osaat kertoa tarkasti, missä jokin on! Luvun löytö: 🗺️ aarrekartan pala |
| `M-MEAS-03` | Opit mittaamaan senttimetreinä ja metreinä. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 35 %:ssa | 100 % (esim. "Kohdasta 0 kohtaan 3 on 3 väliä: 3 cm.") | Osaat valita metrin tai sentin ja lukea viivoitinta! Luvun löytö: 📏 oma mittanauha |
| `M-MEAS-04` | Opit mittaamaan pituuden toistamalla samaa yksikköä alusta loppuun ja kertomaan tuloksen luvulla ja yksiköllä. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 65 %:ssa | 100 % (esim. "Pienempiä paloja tarvitaan enemmän: 4 pientä palaa. Siksi tulokseen kirjoitetaan aina myös…") | Mittaat pituuden yksiköllä, alusta loppuun! Luvun löytö: 📏 oma mittanauha |
| `M-GMEAS-01` | Opit, että piiri on kuvion reunaviivan koko pituus, ja lasket sen sivujen pituuksista. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 65 %:ssa | 100 % (esim. "Piiri on reunaviiva, joka kiertää koko kuvion.") | Tiedät, mitä piiri tarkoittaa, ja lasket sen! Luvun löytö: ⛵ pieni purjevene |
| `M-MEAS-05` | Opit vertaamaan vaa’alla, kumpi on painavampi. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Suorassa oleva vaaka tarkoittaa: yhtä painavat.") | Osaat lukea vaakaa: painavampi painuu alas! Luvun löytö: 🫐 marjarasia |
| `M-MEAS-06` | Opit valitsemaan, punnitaanko grammoina vai kilogrammoina. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "1 kg = 1000 g, joten 2 kg = 2000 g.") | Kilo on tuhat grammaa: osaat punnita kuin kauppias! Luvun löytö: 🫐 marjarasia |
| `M-MEAS-08` | Opit vertaamaan, mihin astiaan mahtuu eniten. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Vettä ei lisätty eikä otettu pois. Sen määrä pysyy samana, vaikka astian muoto muuttuu.") | Osaat vertailla, mihin mahtuu enemmän! Luvun löytö: 🫐 marjarasia |
| `M-MEAS-09` | Opit valitsemaan, mitataanko litroina vai desilitroina. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "1 l = 10 dl. Verrataan: 10 dl ja 8 dl.") | Litrassa on kymmenen desiä: mehukauppa pyörii! Luvun löytö: 🫐 marjarasia |
| `M-DATA-01` | Opit keräämään tietoa viivamerkinnöillä. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "lokki 9, sammakko 11, etana 8. Eniten: sammakko.") | Osaat kerätä ja kirjata havaintoja! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-DATA-02` | Opit merkitsemään havainnot muistiin yksi kerrallaan, esimerkiksi viivoilla. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 27 %:ssa | 100 % (esim. "Sammakko: 2, Kala: 3, Etana: 2.") | Merkitset havainnot tarkasti ja korjaat virheet! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-DATA-03` | Opit lukemaan taulukon rivejä ja sarakkeita. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Pienin luku on 5: sammakko.") | Osaat lukea taulukkoa riveittäin ja sarakkeittain! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-DATA-05` | Opit lukemaan taulukosta: etsi oikea rivi ja oikea sarake. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "7 − 6 = 1.") | Luet taulukoita ja vertailet niiden lukuja! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-DATA-04` | Opit tekemään taulukon: jokaiselle asialle oma rivi. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Sarakkeen luvut ovat määriä, joten otsikko kertoo määrän.") | Teit selkeän taulukon! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-SYM-PLUS` | Opit, että plusmerkki tarkoittaa: tulee lisää. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "2 ja tulee lisää 2.") | Plus tarkoittaa: lisää tai yhdessä! Luvun löytö: 🚩 merkkiviiri |
| `M-SYM-MINUS` | Opit, että miinusmerkki tarkoittaa: otetaan pois. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "3, joista 2 otetaan pois.") | Miinus tarkoittaa: pois tai vähemmän! Luvun löytö: 🚩 merkkiviiri |
| `M-SYM-EQUAL` | Opit, että yhtä suuri -merkki tarkoittaa: molemmilla puolilla on yhtä paljon. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Oikeassa kuvassa molemmilla lautasilla on 2.") | Merkki = tarkoittaa: molemmilla puolilla on yhtä paljon! Luvun löytö: 🚩 merkkiviiri |
| `M-ARITH-01` | Opit kirjoittamaan laskulauseen merkeillä +, − ja =. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "3 + 2 on 5. Ei totta.") | Osaat kirjoittaa laskun merkeillä! Luvun löytö: 🚩 merkkiviiri |
| `M-MUL-02` | Opit kirjoittamaan yhtä suurten ryhmien tilanteen kertolaskuksi. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "3 penkkiä × 2 sammakkoa = 6.") | Kirjoitat ryhmät lyhyesti kertolaskuna! Luvun löytö: 🪵 lautan hirsikansi |
| `M-EXPR-01` | Opit laskujärjestyksen: ensin sulut, sitten kerto- ja jakolaskut, viimeisenä yhteen- ja vähennyslaskut. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Kertolasku ensin: 3 × 2 = 6. Sitten 16 − 6 = 10.") | Lasket pitkät lausekkeet oikeassa järjestyksessä! Luvun löytö: ⛵ pieni purjevene |
| `SCI-ENV-TOOL-01` | Opit valitsemaan oikean välineen mittaukseen. Oikeita välineitä käytetään aikuisen kanssa. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Mittari tarvitsee hetken lämmetäkseen tai jäähtyäkseen.") | Osaat valita sopivan mittausvälineen ja lukea sen lukeman kuvasta. Oikeaa välinettä käytetään aikuisen kanssa. Luvun löytö: 💎 tutkimusaseman aarre |
| `M-PLACE-04` | Opit, mitä sadat ja tuhannet tarkoittavat luvussa. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Tuhannet ovat samat. Satoja: 0 ja 9. Suurempi on 4902.") | Kassa täsmää: osaat isojen lukujen paikka-arvon! Luvun löytö: ⛵ pieni purjevene |
| `M-PLACE-05` | Opit purkamaan luvun tuhansiin, satoihin, kymppeihin ja ykkösiin, ja kokoamaan sen takaisin. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "410 = 41 × 10. Satasissakin on kymppejä: yksi sata on kymmenen kymppiä.") | Purat ja kokoat lukuja, nollat paikoillaan! Luvun löytö: ⛵ pieni purjevene |
| `M-NEG-01` | Opit, että nollan alapuolella on negatiivisia lukuja. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Nollan yläpuolella: +3 m eli 3 m.") | Osaat lukea pakkasasteita: miinus tarkoittaa nollan alapuolta! Luvun löytö: ⛸️ luistimet |
| `M-WRADD` | Opit laskemaan yhteen allekkain: ensin ykköset, sitten kymmenet, ja muistinumero mukaan. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 52 %:ssa | 100 % (esim. "Kymmenet: 4 + 4 + muistinumero 1 = 9. Kymppien paikalle 9. Koko summa 591.") | Lasket allekkain yhteen muistinumeroineen! Luvun löytö: ⛵ pieni purjevene |
| `M-WRDIV` | Opit jakamaan luvun osa kerrallaan: ensin sadat, sitten kymmenet, sitten ykköset. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 78 %:ssa | 100 % (esim. "5 kymppiä : 4 = 1, ja 1 kymppiä jää. Ne vaihdetaan ykkösiksi: 16 ykköstä : 4 = 4. Vastaus …") | Jaat isoja lukuja paikka kerrallaan ja vaihdat ylijäämän! Luvun löytö: 💡 majakan valo |
| `M-WRMUL` | Opit kertomaan moninumeroisen luvun yksinumeroisella: osa kerrallaan tai allekkain. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 78 %:ssa | 100 % (esim. "5 × 3 = 15, ja muistista 2: 17. Kymppien paikalle 7. Koko tulo 175.") | Kerrot isoja lukuja osa kerrallaan! Luvun löytö: 💡 majakan valo |
| `M-WRSUB` | Opit vähentämään allekkain. Kun ylempi numero on pienempi, vaihdetaan kymppi kymmeneksi ykköseksi. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 52 %:ssa | 100 % (esim. "Vaihdon jälkeen ykkösiä on 13: 13 − 4 = 9. Kymppejä jää 5. Koko erotus 409.") | Vähennät allekkain ja vaihdat oikein! Luvun löytö: ⛵ pieni purjevene |
| `M-NEG-02` | Opit sijoittamaan negatiiviset luvut lukusuoralle nollan vasemmalle puolelle. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Pienin on se, joka on lukusuoralla kauimpana vasemmalla: −6.") | Osaat sijoittaa negatiiviset luvut lukusuoralle! Luvun löytö: ⛸️ luistimet |
| `M-NEG-03` | Opit vertaamaan ja järjestämään negatiivisia lukuja: lukusuoralla oikealla on aina suurempi. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "−5 < −3, joten −5 °C on kylmempi.") | Vertaat negatiivisia lukuja varmasti! Luvun löytö: ⛸️ luistimet |
| `M-FRAC-02` | Opit, että murtoluku kertoo, kuinka suuri osa kokonaisesta otettiin. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "5 yhtä suurta osaa, 2 väritetty.") | Osaat nimetä palat murtoluvuilla! Luvun löytö: 🥧 mustikkapiirakka |
| `M-DEC-01` | Opit, että kokonainen voidaan jakaa kymmeneen osaan ja yksi osa on 0,1. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Yksi kokonainen ja 4 kymmenesosaa: 1,4.") | Tunnet kymmenesosat: 0,1 on yksi kymmenestä osasta! Luvun löytö: 🫧 helmipussi |
| `M-FRAC-06` | Opit tunnistamaan, milloin kaksi murtolukua ovat yhtä suuria, vaikka niissä on eri luvut. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Nimittäjä kerrottiin luvulla 2, joten osoittajakin: 2 · 2 = 4.") | Tunnistat samansuuruiset murtoluvut! Luvun löytö: 🥧 mustikkapiirakka |
| `M-DEC-02` | Opit sadasosat: kun kokonainen jaetaan sataan osaan, yksi osa on 0,01. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 35 %:ssa | 100 % (esim. "0,4 = 0,40: 4 saraketta, joissa kussakin 10 ruutua, on 40 sadasosaa.") | Tunnet sadasosat ja tiedät, että 0,3 = 0,30! Luvun löytö: 🫧 helmipussi |
| `M-FRAC-03` | Opit, mitä murtoluvun osoittaja ja nimittäjä kertovat. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Samat palat (6-osat): 5 palaa on enemmän kuin 2.") | Osaat lukea murtoluvun kumpaakin lukua! Luvun löytö: 🥧 mustikkapiirakka |
| `M-FRAC-08` | Opit supistamaan murtoluvun: jaetaan osoittaja ja nimittäjä samalla luvulla. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "2/3 ei supistu.") | Supistat murtolukuja! Luvun löytö: 🥧 mustikkapiirakka |
| `M-DEC-03` | Opit tuhannesosat: kolmas numero pilkun jälkeen. Millimetri on tuhannesosa metristä. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Tuhannesosat ovat kolmannella paikalla pilkun jälkeen: 0,004.") | Tunnet tuhannesosat ja muunnat millimetrit metreiksi! Luvun löytö: 🫧 helmipussi |
| `M-FRAC-05` | Opit vertaamaan murtolukuja, joilla on sama nimittäjä: palat ovat samankokoisia, joten enemmän paloja on enemmän. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "1/8 < 3/8 < 6/8.") | Vertaat samannimisiä murtolukuja! Luvun löytö: 🥧 mustikkapiirakka |
| `M-FRAC-11` | Opit laskemaan yhteen murtolukuja, joilla on sama nimittäjä: palat lasketaan yhteen, palan koko pysyy. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "1 + 3 = 4, joten puuttuva osoittaja on 3.") | Lasket samannimisiä murtolukuja yhteen! Luvun löytö: 🥧 mustikkapiirakka |
| `M-FRAC-12` | Opit vähentämään murtolukuja, joilla on sama nimittäjä: palat vähennetään, palan koko pysyy. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 68 %:ssa | 100 % (esim. "Kokonainen on 5/5. 5/5 − 1/5 = 4/5.") | Vähennät samannimisiä murtolukuja! Luvun löytö: 🥧 mustikkapiirakka |
| `M79-RECIP-01` | Opit, että luvun ja sen käänteisluvun tulo on yksi: 3/5 ja 5/3 ovat toistensa käänteislukuja. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "5 · 1/5 = 1.") | Tunnet käänteisluvut ja tiedät, että niiden tulo on yksi! Luvun löytö: 🔬 laboratorion vaaka |
| `M-DEC-DECOMPOSE` | Opit purkamaan desimaaliluvun kokonaisiin, kymmenesosiin ja sadasosiin. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "4,92.") | Purat desimaaliluvut osiin ja kokoat ne takaisin! Luvun löytö: 🫧 helmipussi |
| `M-DEC-READ` | Opit lukemaan desimaaliluvun ääneen niin, että kuulija tietää osien koon. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Sadasosat ovat toisella paikalla pilkun jälkeen. Kymmenesosia ei ole, joten ensin tulee no…") | Luet desimaaliluvut oikein! Luvun löytö: 🫧 helmipussi |
| `M-DEC-WRITE` | Opit kirjoittamaan desimaaliluvun, kun kuulet tai luet sen sanoina. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 65 %:ssa | 100 % (esim. "25 sadasosaa = 0,25. Yhteensä 4,25.") | Kirjoitat desimaaliluvut oikein, nollat oikeille paikoille! Luvun löytö: 🫧 helmipussi |
| `M-FRAC-15` | Opit kertomaan murtoluvun kokonaisluvulla: monta samanlaista palaa yhteen. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "3 palaa, joista jokainen on 1/3: yhteensä 3/3 eli yksi kokonainen.") | Tehdas toimii: osaat kertoa murtoluvun! Luvun löytö: 🥧 mustikkapiirakka |
| `M-DEC-04` | Opit vertaamaan desimaalilukuja: ensin kokonaiset, sitten kymmenesosat, sitten sadasosat. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Lisää nollat, niin kaikissa on kaksi desimaalia: 0,37 < 0,40 < 0,42.") | Vertaat desimaalilukuja paikka kerrallaan, etkä anna pituuden hämätä! Luvun löytö: 🫧 helmipussi |
| `M-ALG-04` | Opit, että piilossa oleva määrä on luku, jonka voi päätellä. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "3 kertaa mikä on 6? 6 : 3 = 2.") | Arvoitus ratkesi: osaat löytää puuttuvan luvun! Luvun löytö: 🎒 vaakasaaren pussi |
| `M-DEC-08` | Opit kertomaan desimaaliluvun kokonaisluvulla sekä luvuilla 10, 100 ja 1000. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "2 × 0,4 m = 0,8 m.") | Kerrot desimaalilukuja ja siirrät pilkkua oikein! Luvun löytö: 🫧 helmipussi |
| `M-DEC-09` | Opit jakamaan desimaaliluvun kokonaisluvulla sekä luvuilla 10, 100 ja 1000. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "1,5 € : 3 = 0,5 €.") | Jaat desimaalilukuja tasan ja siirrät pilkkua oikein! Luvun löytö: 🫧 helmipussi |
| `M-DEC-ADD` | Opit laskemaan desimaalilukuja yhteen ja vähentämään niitä: samat osat kohdakkain. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 35 %:ssa | 100 % (esim. "5,0 − 3,9 = 1,1. Tarkistus: 1,1 + 3,9 = 5,0.") | Lasket desimaaliluvut yhteen ja vähennät, pilkut kohdakkain! Luvun löytö: 🫧 helmipussi |
| `M-ALG-05` | Opit, että yhtä suuri -merkin molemmilla puolilla on yhtä paljon. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Vasemmalla 6 kg. Oikealla jo 3 kg, joten puuttuu 3 kg.") | Ymmärrät yhtäsuuruusmerkin kuin vaaka! Luvun löytö: 🎒 vaakasaaren pussi |
| `M79-VAR-UNKNOWN` | Opit, että kirjain yhtälössä tarkoittaa tiettyä lukua, jota ei vielä tiedetä, ei esinettä. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "2n + 3 = 13, joten 2n = 10 ja n = 5.") | Tiedät, että kirjain on luku, jonka voi päätellä! Luvun löytö: ✏️ Sulkan kynä |
| `M79-VAR-VARYING` | Opit, että kirjain voi kertoa määrän, joka muuttuu: kun n kasvaa, myös lausekkeen arvo muuttuu. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "t kasvaa koko ajan, ja matka 5t kasvaa sen mukana. Luku 5 pysyy samana.") | Ymmärrät, miten lausekkeen arvo muuttuu, kun muuttuja muuttuu! Luvun löytö: ✏️ Sulkan kynä |
| `M-ALG-06` | Opit tunnistamaan yhtälön: siinä on yhtä suuri -merkki ja tuntematon. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 35 %:ssa | 100 % (esim. "5 + 5 = 10. Pitäisi olla 8: ei ratkaisu.") | Tunnistat yhtälön ja sen ratkaisun! Luvun löytö: 🎒 vaakasaaren pussi |
| `M79-VAR-01` | Opit erottamaan, onko kirjain yksi tuntematon luku vai muuttuva määrä. Sama kirjain tarkoittaa samassa lausekkeessa samaa lukua. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Kyllä: 3 + 7 = 10. Eri kirjaimet voivat saada eri arvot.") | Tunnistat kirjaimen roolin ja tiedät, että sama kirjain on sama luku! Luvun löytö: ✏️ Sulkan kynä |
| `M-ALG-07` | Opit testaamaan, ratkaiseeko luku yhtälön: sijoita luku ja katso, ovatko puolet yhtä suuret. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "5 + 1 = 6 ≠ 4. Pussissa on 3.") | Testaat ehdotuksia ja tiedät, milloin luku on ratkaisu! Luvun löytö: 🎒 vaakasaaren pussi |
| `M79-EXPR-EVAL` | Opit laskemaan lausekkeen arvon, kun muuttujan tilalle sijoitetaan luku. Muista: 3x tarkoittaa 3 · x. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 35 %:ssa | 100 % (esim. "3 · (−3) + 2 = −9 + 2 = −7.") | Sijoitat lukuja lausekkeisiin ja lasket oikein! Luvun löytö: ✏️ Sulkan kynä |
| `M79-EXPR-FORM` | Opit kirjoittamaan lausekkeen sanallisesta tilanteesta. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 27 %:ssa | 100 % (esim. "Summa n + 2 kerrotaan: 3(n + 2). Sulut tarvitaan.") | Kirjoitat lausekkeita tilanteista! Luvun löytö: ✏️ Sulkan kynä |
| `M-ALG-08` | Opit ratkaisemaan yksinkertaisen yhtälön päättelemällä käänteisen laskun avulla. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "19 − 5 = 14, joten □ = 19 − 14 = 5.") | Ratkaiset yhtälöitä päättelemällä! Luvun löytö: 🎒 vaakasaaren pussi |
| `M-UNIT-01` | Opit, että pituusyksiköt ovat portaat, joissa jokainen askel on kymmenkertainen. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Samat etuliitteet, samat portaat: 1 kg = 1000 g.") | Rappuset ovat hallussa: kilo, desi, sentti ja milli! Luvun löytö: ⚖️ torivaaka |
| `M79-EQ1-FORM` | Opit muodostamaan yhtälön tilanteesta: tuntematon kirjaimeksi ja kaksi yhtä suurta asiaa yhtäsuuruusmerkin eri puolille. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "3 kynää maksaa 3x, vihko 5 €: 3x + 5 = 11. Myös 11 = 5 + 3x kelpaa.") | Muodostat yhtälöitä tilanteista! Luvun löytö: ✏️ Sulkan kynä |
| `M-UNIT-02` | Opit muuntamaan metrejä, senttimetrejä ja millimetrejä toisikseen. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "1 cm = 10 mm, joten 130 mm = 130 : 10 = 13 cm.") | Osaat muuntaa pituuksia! Luvun löytö: ⚖️ torivaaka |
| `M-UNIT-03` | Opit muuntamaan kilogrammoja ja grammoja toisikseen. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "1 kg = 1000 g, joten 2 kg = 2 × 1000 = 2000 g.") | Osaat muuntaa massoja! Luvun löytö: ⚖️ torivaaka |
| `M-UNIT-04` | Opit muuntamaan litroja ja desilitroja toisikseen. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 100 %:ssa | 100 % (esim. "1 l = 100 cl, joten 2 l = 2 × 100 = 200 cl.") | Osaat muuntaa tilavuuksia! Luvun löytö: ⚖️ torivaaka |
| `M-UNIT-05` | Opit muuntamaan tunteja, minuutteja ja sekunteja: tunnissa on 60 minuuttia. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "3 × 24 h = 72 h.") | Ehdit lautalle! Osaat muuntaa aikoja. Luvun löytö: ⚖️ torivaaka |
| `PHY79-SPEED-UNIT` | Opit muodostamaan nopeuden yksikön matkan ja ajan yksiköistä. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "v = s / t, joten yksikkö on m/s.") | Johdat nopeuden yksikön! Luvun löytö: ⏱️ kisakello |
| `M-DATA-09` | Opit keräämään tietoa aina samalla tavalla, jotta tulokset ovat vertailukelpoisia. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Ensin päätetään, mitä halutaan tietää. Sitten kerätään, ja lopuksi järjestetään taulukoksi…") | Tutkimuksesi on suunniteltu järjestelmällisesti! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-DATA-10` | Opit järjestämään havaintolistan taulukoksi. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Kaksi tietoa: eläimet riveille ja päivät sarakkeisiin.") | Järjestit havainnot selkeäksi taulukoksi! Luvun löytö: 💎 tutkimusaseman aarre |
| `M-COORD-READ-Q1` | Opit lukemaan pisteen paikan ruudukosta kahdella luvulla. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Palmu on 1 oikealla, mutta ei yhtään ylhäällä: (1, 0).") | Osaat lukea aarrekarttaa! Luvun löytö: 🗺️ aarrekartan pala |
| `M-COORD-PLOT-Q1` | Opit merkitsemään pisteen ruudukkoon, kun sen luvut annetaan. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Itään 3 ja pohjoiseen 1: kohta (3, 1).") | Aarteet on kätketty juuri oikeisiin paikkoihin! Luvun löytö: 🗺️ aarrekartan pala |
| `M-COORD-01` | Opit sekä lukemaan että merkitsemään pisteitä koordinaatistoon. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Sivuttain muuttuu x: uusi paikka (4, 3).") | Saari on rakennettu tarkasti! Luvun löytö: 🗺️ aarrekartan pala |
| `M-COORD-02` | Opit käyttämään koordinaatistoa myös negatiivisilla luvuilla. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 68 %:ssa | 100 % (esim. "x on positiivinen (oikea), y positiivinen (ylös): neljännes I.") | Hallitset koko kartan, kaikki neljä neljännestä! Luvun löytö: ⛸️ luistimet |
| `SCI-ENV-MEAS-01` | Opit valitsemaan mittaukseen sopivan välineen ja yksikön. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Kaksi mittausta antoi 12 cm. 18 cm on luultavasti mittausvirhe, joten mitataan uudelleen.") | Luet mittauksen tarkasti kuvasta: nollakohta ja asteikko ovat hallussa! Luvun löytö: 💎 tutkimusaseman aarre |
| `SCI-ENV-DATA-01` | Opit kokoamaan monen päivän havainnot yhteen. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "2 + 1 + 3 = 6.") | Havainnot on koottu aineistoksi! Luvun löytö: 📓 havaintovihko |
| `PHY79-DATA-01` | Opit kokoamaan mittaustulokset taulukkoon. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Otsikoissa suure ja yksikkö, ja jokainen aika samalla rivillä oman matkansa kanssa.") | Taulukko on selkeä ja oikein! Luvun löytö: 📈 tulostaulu |
| `M79-FRAC-MUL` | Opit kertomaan murtoluvun murtoluvulla: osa osasta. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "1/2 × 1/4 = 1/8.") | Osaat ottaa osan osasta! Luvun löytö: 🔬 laboratorion vaaka |
| `M79-FRAC-DIV` | Opit jakamaan murtoluvulla: jakolasku kysyy, montako osaa mahtuu. Jakaminen murtoluvulla on kertomista käänteisluvulla. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 45 %:ssa | 100 % (esim. "Kerrotaan käänteisluvulla: 1/4 · 5/4 = 5/16.") | Jaat murtoluvuilla ja tiedät, miksi tulos voi kasvaa! Luvun löytö: 🔬 laboratorion vaaka |
| `M79-DEC-DIV` | Opit jakamaan desimaaliluvulla: kerro jaettava ja jakaja samalla luvulla, niin jakajasta tulee kokonaisluku. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "5 : 0,2 = 25, enemmän kuin 5.") | Jaat desimaaliluvuilla ja tiedät, että tulos voi kasvaa! Luvun löytö: 🔬 laboratorion vaaka |
| `M79-PROP-01` | Opit, että verrannossa kaksi suhdetta ovat yhtä suuret. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 35 %:ssa | 100 % (esim. "3 · 13 = 39, 4 · 9 = 36: eri suuret.") | Ratkaiset verrantoja! Luvun löytö: 🔬 laboratorion vaaka |
| `PHY79-SPEED-CALC` | Opit laskemaan keskinopeuden: matka jaettuna ajalla. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "v = 15 m / 5 s = 3 m/s.") | Lasket keskinopeuden! Luvun löytö: ⏱️ kisakello |
| `M79-DEP-01` | Opit tunnistamaan, riippuuko kaksi suuretta toisistaan. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "0 → 3 → 6: joka askeleella 3 lisää.") | Tunnistat riippuvuuden! Luvun löytö: 📟 yhden arvon mittari |
| `M79-FUNC-01` | Opit, että funktio antaa jokaiselle syötteelle täsmälleen yhden arvon. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Jokaisella syötteellä on täsmälleen yksi arvo: funktio.") | Ymmärrät funktion koneena! Luvun löytö: 📟 yhden arvon mittari |
| `M79-FUNC-TABLE` | Opit tekemään funktiolle arvotaulukon: jokaiselle x:lle lasketaan y sääntöä käyttäen. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Lasketaan: 0 → 0, 1 → 3, 2 → 6.") | Teet arvotaulukoita ja tunnistat säännön taulukosta! Luvun löytö: 📟 yhden arvon mittari |
| `M79-FUNC-GRAPH` | Opit piirtämään funktion pisteet koordinaatistoon. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Kuvaajasta: (0, −1), (1, −3), (2, −5).") | Piirrät funktion kuvaajan! Luvun löytö: 📟 yhden arvon mittari |
| `PHY79-GRAPH-01` | Opit piirtämään taulukon tuloksista pisteitä kuvaajaan. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Pisteet: (4, 10), (6, 15), (8, 20).") | Kuvaaja on valmis! Luvun löytö: 📈 tulostaulu |
| `PHY79-VT-GRAPH` | Opit lukemaan nopeus–aika-kuvaajasta nopeuden joka hetki. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Nopeus pysyy 10 m/s: tasainen liike.") | Luet nopeus–aika-kuvaajaa! Luvun löytö: 📈 tulostaulu |
| `M79-UNIT-LIN` | Opit muuntamaan pituusyksiköitä desimaaliluvuilla siirtämällä pilkkua. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "39 : 100 = 0,39.") | Muunnat pituuksia desimaaleilla! Luvun löytö: 🧪 kalibroitu mittalasi |
| `PHY79-UNIT-CONV` | Opit muuntamaan yksiköt samoiksi ennen laskemista. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "120 / 100 m = 1,2 m.") | Muunnat yksiköt varmasti! Luvun löytö: 🧪 kalibroitu mittalasi |
| `PHY79-SPEED-MIXED` | Opit laskemaan nopeuden, kun mittaukset ovat eri yksiköissä. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "4 min = 240 s. v = 480 m / 240 s = 2 m/s.") | Yksiköt ensin, sitten lasku. Hienoa! Luvun löytö: ⏱️ kisakello |
| `M79-INT-ORDER` | Opit järjestämään negatiivisia ja positiivisia lukuja lukusuoralla. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 26 %:ssa | 100 % (esim. "−5 on 5 askelta nollasta vasemmalle.") | Järjestät kokonaisluvut varmasti! Luvun löytö: 🌡️ pakkasmittari |
| `M79-INT-DIST` | Opit laskemaan kahden luvun etäisyyden lukusuoralla. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "−7 on 7 askeleen päässä nollasta.") | Mittaat etäisyyksiä lukusuoralla! Luvun löytö: 🌡️ pakkasmittari |
| `M79-INT-01` | Opit yhdistämään järjestyksen ja etäisyyden lukusuoralla. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Etäisyydet: 2 ja 4. Lähempänä on −4.") | Lukusuora on hallussasi! Luvun löytö: 🌡️ pakkasmittari |
| `M79-INT-ADD` | Opit laskemaan yhteen negatiivisia lukuja lukusuoran avulla: positiivinen luku vie oikealle, negatiivinen vasemmalle. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 65 %:ssa | 100 % (esim. "−6:sta 1 oikealle: −5.") | Lasket kokonaislukuja yhteen varmasti! Luvun löytö: 🌡️ pakkasmittari |
| `M79-INT-MUL` | Opit kertomaan kokonaislukuja: eri merkkiset tekijät antavat negatiivisen tulon, samanmerkkiset positiivisen. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 68 %:ssa | 100 % (esim. "Samanmerkkiset tekijät: tulo on positiivinen. 5 · 3 = 15.") | Osaat merkkisäännön ja ymmärrät, mistä se tulee! Luvun löytö: 🌡️ pakkasmittari |
| `M79-EQ1-SOLVE` | Opit ratkaisemaan yhtälön tekemällä saman muutoksen molemmille puolille. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 68 %:ssa | 100 % (esim. "Vähennetään x: 2x + 9 = 17. Vähennetään 9: 2x = 8. x = 4.") | Ratkaiset yhtälöitä tasapainoperiaatteella! Luvun löytö: 🔬 laboratorion vaaka |
| `PHY79-SPEED-REARR` | Opit laskemaan matkan tai ajan, kun nopeus tiedetään. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "s = v · t = 3 m/s · 6 s = 18 m.") | Käännät nopeuden kaavan! Luvun löytö: ⏱️ kisakello |
| `M79-LINE-GRAPH` | Opit piirtämään suoran yhtälöstä y = kx + b. | 1 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "x = 0 → y = −1, x = 2 → y = 1.") | Yhdistät suoran yhtälön ja kuvaajan! Luvun löytö: 📟 yhden arvon mittari |
| `M79-SLOPE` | Opit, että kulmakerroin kertoo, paljonko y muuttuu, kun x kasvaa yhdellä. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 25 %:ssa | 100 % (esim. "Jyrkkyys on kulmakertoimen suuruus: \|1\| ja \|3\|.") | Ymmärrät kulmakertoimen muutoksen suhteena! Luvun löytö: 📟 yhden arvon mittari |
| `PHY79-ST-GRAPH` | Opit lukemaan matka–aika-kuvaajasta, kuinka nopeasti kappale liikkuu. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "Matka kasvoi koko välin ajan.") | Luet matka–aika-kuvaajaa! Luvun löytö: 📈 tulostaulu |
| `PHY79-ACCEL-MOTION-GRAPH` | Opit tunnistamaan kaarevasta kuvaajasta, että nopeus muuttuu. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Suora: matka kasvaa joka sekunti yhtä paljon.") | Tunnistat muuttuvan liikkeen matka–aika-kuvaajasta! Luvun löytö: 🏆 loikkakisan pokaali |
| `PHY79-ACCEL-VT-GRAPH` | Opit lukemaan kiihtyvyyden nopeus–aika-kuvaajan jyrkkyydestä. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "10 s aikana nopeus kasvaa 10 m/s: a = 10 m/s / 10 s = 1 m/s².") | Luet kiihtyvyyden kuvaajasta! Luvun löytö: 🏆 loikkakisan pokaali |
| `PHY79-ACCEL-GRAPH` | Opit yhdistämään saman liikkeen matka–aika- ja nopeus–aika-kuvaajan. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "Matka kasvaa tasaisesti → nopeus pysyy samana.") | Yhdistät liikkeen kuvaajat. Laboratorio on valmis! Luvun löytö: 🏆 loikkakisan pokaali |
| `M79-INT-DIV` | Opit jakamaan kokonaislukuja: merkkisääntö on sama kuin kertolaskussa, koska jakolasku tarkistetaan kertolaskulla. | 2 mallivaihetta (Näytä ensin); ohjatussa vaiheessa valmis vihje 32 %:ssa | 100 % (esim. "Jakaja kertaa osamäärä on jaettava: 2 · (−5) = −10.") | Jaat kokonaislukuja ja tarkistat merkin kertolaskulla! Luvun löytö: 🌡️ pakkasmittari |
| `M79-INT-SUB` | Opit laskemaan muutoksen: loppu miinus alku. | 2 mallivaihetta (Näytä ensin) | 100 % (esim. "−1 − (−4) = 3. Positiivinen: lämpeni.") | Vähennät kokonaislukuja myös miinuksen puolella! Luvun löytö: 🌡️ pakkasmittari |
| `PHY79-ACCEL-CALC` | Opit laskemaan kiihtyvyyden: nopeuden muutos jaettuna ajalla. | 1 mallivaihetta (Näytä ensin) | 100 % (esim. "a = (4 − 0) m/s / 4 s = 1 m/s².") | Lasket kiihtyvyyden! Luvun löytö: 🏆 loikkakisan pokaali |

Rajoitukset: kaikki rivit ovat kehittäjän tarkistamia. Ihmisiltä (lapset, opettajat) kerättyä palautetta ei vielä ole, eikä Solin materiaalia ole vielä yhdistetty (ks. SOL_INTEGRATION.md).

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

Generoitu rekisteristä `src/content/families.ts` ja tunnistimista `src/content/features.ts` ajamalla jokaista perhettä 120 siemenellä vaihetta kohden. Perheitä 747, joista 177 on erikseen ilmoitettu (muut oletuksia). **Selittämättömiä vaatimuksia: 0.**

Vaatimus = tunnistin löysi tehtävästä (teksti, kuva, vastaus) esimerkiksi negatiivisen luvun, desimaaliluvun, kertolaskun, kellonajan, piirin tai yksikkömuunnoksen. Se on selitetty, jos se kuuluu oppitunnin omaan sisältöön, löytyy sen pakollisesta/vahvasta esitietopolusta, on rekisterissä oletettuna tai samalla opetettuna taitona, annetaan tehtävässä, tai on merkitty vain esiintyväksi (ei vaadita). Tunnistimet ovat heuristisia: ne löytävät tavallisimmat muodot, eivät kaikkea.

| Perhe | Vaiheet | Tyyppi | Havaittu tulos | Rajaus | Vastausalue | Havaitut vaatimukset ja selitys | Oletetut / samalla opetetut | Apu | Lähde |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `M-GEO-01/flat` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-01/solid` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-01/print` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-REP-04/words` | gi | choice | valitsee oikean vaihtoehdon | Tunnistaa tilannetta vastaavan merkinnän ja rakentaa sen merkkipaloista (perhe build); vapaata kirjoittamista ei havaita. | – | – | `M-SYM-PLUS`, `M-SYM-MINUS`, `M-SYM-EQUAL` · sääntö requires_relevant_content_symbol_knowledge | `M-SYM-PLUS`, `M-SYM-MINUS` | families.ts M-REP-04/* |
| `M-REP-04/compare` | gi | choice | valitsee oikean vaihtoehdon | Tunnistaa tilannetta vastaavan merkinnän ja rakentaa sen merkkipaloista (perhe build); vapaata kirjoittamista ei havaita. | – | – | `M-SYM-PLUS`, `M-SYM-MINUS`, `M-SYM-EQUAL` · sääntö requires_relevant_content_symbol_knowledge | `M-SYM-PLUS`, `M-SYM-MINUS` | families.ts M-REP-04/* |
| `M-REP-04/add` | gi | choice | valitsee oikean vaihtoehdon | Tunnistaa tilannetta vastaavan merkinnän ja rakentaa sen merkkipaloista (perhe build); vapaata kirjoittamista ei havaita. | – | – | `M-SYM-PLUS`, `M-SYM-MINUS`, `M-SYM-EQUAL` · sääntö requires_relevant_content_symbol_knowledge | `M-SYM-PLUS`, `M-SYM-MINUS` | families.ts M-REP-04/* |
| `M-REP-04/build` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | Tunnistaa tilannetta vastaavan merkinnän ja rakentaa sen merkkipaloista (perhe build); vapaata kirjoittamista ei havaita. | – | – | `M-SYM-PLUS`, `M-SYM-MINUS`, `M-SYM-EQUAL` · sääntö requires_relevant_content_symbol_knowledge | `M-SYM-PLUS`, `M-SYM-MINUS` | families.ts M-REP-04/* |
| `M-REP-04/transfer` | t | choice | valitsee oikean vaihtoehdon | Tunnistaa tilannetta vastaavan merkinnän ja rakentaa sen merkkipaloista (perhe build); vapaata kirjoittamista ei havaita. | – | multiply: rekisteri: M-MUL-01 | `M-SYM-PLUS`, `M-SYM-MINUS`, `M-SYM-EQUAL`, `M-MUL-01`, `M-MUL-02` · sääntö requires_relevant_content_symbol_knowledge | `M-MUL-02`, `M-MUL-01`, `M-SYM-PLUS`, `M-SYM-MINUS` | families.ts M-REP-04/*; families.ts M-REP-04/transfer |
| `M-TH-08/fracDiv` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: rekisteri: M-FRAC-01; multiply: ei vaadita: Kertolasku on vain väärä vaihtoehto. | `M-FRAC-01`, `M-DIV-01` · sääntö requires_any_two_mastered_content_nodes | `M-FRAC-01`, `M-DIV-01` | families.ts M-TH-08/*; families.ts M-TH-08/fracDiv |
| `M-TH-08/mulAdd` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MUL-01 | `M-MUL-01`, `M-ADD-01` · sääntö requires_any_two_mastered_content_nodes | `M-MUL-01` | families.ts M-TH-08/*; families.ts M-TH-08/mulAdd |
| `M-TH-08/areaMul` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MUL-01 | `M-MUL-01`, `M-MULTAB-LOW` · sääntö requires_any_two_mastered_content_nodes | `M-MULTAB-LOW` | families.ts M-TH-08/*; families.ts M-TH-08/areaMul |
| `M-TH-08/transfer` | t | numeric | kirjoittaa luvun | – | 12…36 | multiply: rekisteri: M-MULTAB-LOW; perimeter: rekisteri: M-GMEAS-01 | `M-GMEAS-01`, `M-MULTAB-LOW`, `M-GMEAS-01` (transfer) · sääntö requires_any_two_mastered_content_nodes | `M-GMEAS-01`, `M-MULTAB-LOW` | families.ts M-TH-08/*; families.ts M-TH-08/transfer |
| `SCI-ENV-SAFE-01/s3` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/s2` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/s1` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/s0` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/s5` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/s4` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-SAFE-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-04/name` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-04/find` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-04/corners` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-04/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-1TO1/judge` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-1TO1/tap` | gi | tapcount | kertoo lukumäärän (merkintä vaaditaan vain merkintätehtävässä) | – | – | – | – | – | oletus |
| `M-NUM-1TO1/transfer` | t | tapcount | kertoo lukumäärän (merkintä vaaditaan vain merkintätehtävässä) | – | – | – | – | – | oletus |
| `M-SYM-01/grid` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-01/axis` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-01/complete` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-01/transfer` | t | plot | piirtää pisteet kuvaajaan | – | – | – | – | – | oletus |
| `M-NUM-STABLE-ORDER/swap` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-STABLE-ORDER/next` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-STABLE-ORDER/skip` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-STABLE-ORDER/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-WORD-NUMERAL/n2w` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-WORD-NUMERAL/w2n` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-WORD-NUMERAL/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-01/odd` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-01/same` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-02/shape` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `M-TH-02/color` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `M-TH-02/odd` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-03/numbers` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-TH-03/sticks` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-TH-03/middle` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-03/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-TH-04/grow` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-04/repeat` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-04/dots` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-04/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-WORK-01/need` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-WORK-01/extra` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-WORK-01/notice` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-WORK-01/transfer` | t | choice | valitsee tarvittavan tiedon; kertolasku näkyy vain vaihtoehdon tekstissä | – | – | multiply: rekisteri: M-MUL-01 | `M-MUL-01` | `M-MUL-01` | families.ts M-WORK-01/transfer |
| `M-MEAS-00/tricky` | gi | ribbons | vertaa kahta pituutta | – | – | – | – | – | oletus |
| `M-MEAS-00/aligned` | gi | ribbons | vertaa kahta pituutta | – | – | – | – | – | oletus |
| `M-MEAS-00/equal` | gi | ribbons | vertaa kahta pituutta | – | – | – | – | – | oletus |
| `M-MEAS-00/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TH-07/system` | gi | choice | valitsee oikean vaihtoehdon | Perheessä list kaikki yhdistelmät luetellaan ja puuttuvat tai toistuvat tarkistetaan; muissa perheissä vain tulos tai menetelmän tunnistus. | – | multiply: rekisteri: M-MUL-01 | `M-MUL-01` (selitys: rivien lukumäärä × vaihtoehdot) | `M-MUL-01` | families.ts M-TH-07/* |
| `M-TH-07/digits` | gi | choice | valitsee oikean vaihtoehdon | Perheessä list kaikki yhdistelmät luetellaan ja puuttuvat tai toistuvat tarkistetaan; muissa perheissä vain tulos tai menetelmän tunnistus. | – | – | `M-MUL-01` (selitys: rivien lukumäärä × vaihtoehdot) | `M-MUL-01` | families.ts M-TH-07/* |
| `M-TH-07/outfits` | gi | numeric | kirjoittaa luvun | Perheessä list kaikki yhdistelmät luetellaan ja puuttuvat tai toistuvat tarkistetaan; muissa perheissä vain tulos tai menetelmän tunnistus. | 4…16 | multiply: rekisteri: M-MUL-01 | `M-MUL-01` (selitys: rivien lukumäärä × vaihtoehdot) | `M-MUL-01` | families.ts M-TH-07/* |
| `M-TH-07/list` | gi | combos | luettelee kaikki yhdistelmät kerran (puuttuvat ja toistot tarkistetaan) | Perheessä list kaikki yhdistelmät luetellaan ja puuttuvat tai toistuvat tarkistetaan; muissa perheissä vain tulos tai menetelmän tunnistus. | – | – | `M-MUL-01` (selitys: rivien lukumäärä × vaihtoehdot) | `M-MUL-01` | families.ts M-TH-07/* |
| `M-TH-07/transfer` | t | numeric | kirjoittaa luvun | Perheessä list kaikki yhdistelmät luetellaan ja puuttuvat tai toistuvat tarkistetaan; muissa perheissä vain tulos tai menetelmän tunnistus. | 3…10 | – | `M-MUL-01` (selitys: rivien lukumäärä × vaihtoehdot) | `M-MUL-01` | families.ts M-TH-07/* |
| `M79-LOGIC-01/next` | gi | numeric | kirjoittaa luvun | – | 10…29 | – | `M-MULTAB-LOW`, `M79-EXPR-EVAL` | `M79-EXPR-EVAL`, `M-MULTAB-LOW` | families.ts M79-LOGIC-01/* |
| `M79-LOGIC-01/rule` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MULTAB-LOW | `M-MULTAB-LOW`, `M79-EXPR-EVAL` | `M79-EXPR-EVAL`, `M-MULTAB-LOW` | families.ts M79-LOGIC-01/* |
| `M79-LOGIC-01/test` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MULTAB-LOW | `M-MULTAB-LOW`, `M79-EXPR-EVAL` | `M79-EXPR-EVAL`, `M-MULTAB-LOW` | families.ts M79-LOGIC-01/* |
| `M79-LOGIC-01/transfer` | t | numeric | kirjoittaa luvun | – | 19…37 | multiply: rekisteri: M-MULTAB-LOW | `M-MULTAB-LOW`, `M79-EXPR-EVAL` | `M79-EXPR-EVAL`, `M-MULTAB-LOW` | families.ts M79-LOGIC-01/* |
| `SCI-ENV-OBSERVE-01/feature` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-OBSERVE-01/match` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-OBSERVE-01/colour` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-OBSERVE-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-02/thick` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-02/bend` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-02/path` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-01/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-01/equal` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-01/diff` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-01/scatter` | gi | tapcount | kertoo lukumäärän (merkintä vaaditaan vain merkintätehtävässä) | – | – | – | – | – | oletus |
| `M-NUM-01/line` | gi | tapcount | kertoo lukumäärän (merkintä vaaditaan vain merkintätehtävässä) | – | – | – | – | – | oletus |
| `M-NUM-01/circle` | gi | tapcount | kertoo lukumäärän (merkintä vaaditaan vain merkintätehtävässä) | – | – | – | – | – | oletus |
| `M-NUM-01/transfer` | t | tapcount | kertoo lukumäärän (merkintä vaaditaan vain merkintätehtävässä) | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-OBS-01/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-OBS-01/colour` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-OBS-01/still` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-OBS-01/moved` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-OBS-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-03/sim` | gi | numeric | kirjoittaa luvun | – | 2…6 | – | – | – | oletus |
| `M-TIME-03/compare` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-03/read` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-01/judge` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-01/count` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-02/give` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `M-NUM-02/howmany` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-17/fair` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-17/share` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-17/number` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-17/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/steady` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/faster` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/stop` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/turn` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-CHANGE-01/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-ADD-01/expr` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-01/join` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-QTY-NUMERAL/n2q` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-QTY-NUMERAL/q2n` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-QTY-NUMERAL/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-NUM-QTY-WORD/w2q` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-QTY-WORD/q2w` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-QTY-WORD/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-01/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-01/describe` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-01/still` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-01/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `ENV-PHY-MOTION-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-03/fromNumeral` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-NUM-03/fromQty` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-NUM-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-18/pair` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-18/hidden` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-18/ten` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-18/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-MOTION-REF/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-MOTION-REF/walk` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-MOTION-REF/train` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-MOTION-REF/boat` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-MOTION-REF/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-07/teen` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-07/small` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-07/big` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-07/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-08/before` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-08/next` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-08/gap` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-08/transfer` | t | line | merkitsee kohdan lukusuoralle | – | 5…15 | – | – | – | oletus |
| `M-NUM-10/tens` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-10/bigger` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-10/symbol` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-10/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-02/half` | gi | choice | valitsee oikean vaihtoehdon | – | – | clock: oma sisältö | – | – | oletus |
| `M-TIME-02/full` | gi | choice | valitsee oikean vaihtoehdon | – | – | clock: oma sisältö | – | – | oletus |
| `M-TIME-02/hands` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-TIME-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | clock: oma sisältö | – | – | oletus |
| `M-NUM-14/make` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-14/read` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-14/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-QTY-CONCEPT/tool` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | families.ts PHY79-QTY-CONCEPT/* |
| `PHY79-QTY-CONCEPT/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-QTY-CONCEPT/* |
| `PHY79-QTY-CONCEPT/unitVs` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | families.ts PHY79-QTY-CONCEPT/* |
| `PHY79-QTY-CONCEPT/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-QTY-CONCEPT/* |
| `PHY79-NUMVALUE/symbol` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-NUMVALUE/* |
| `PHY79-NUMVALUE/plain` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-NUMVALUE/* |
| `PHY79-NUMVALUE/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-NUMVALUE/* |
| `PHY79-UNIT-CONCEPT/fit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | families.ts PHY79-UNIT-CONCEPT/* |
| `PHY79-UNIT-CONCEPT/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-UNIT-CONCEPT/* |
| `PHY79-UNIT-CONCEPT/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | convertLength: ei vaadita: Selitys mainitsee cm ja m; mitään ei muunneta. | – | – | families.ts PHY79-UNIT-CONCEPT/* |
| `PHY79-QTY-01/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-QTY-01/* |
| `PHY79-QTY-01/sort` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-QTY-01/* |
| `PHY79-QTY-01/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | speedUnit: ei vaadita: Yksikkö m/s on vain sijoitettava osa. | – | – | families.ts PHY79-QTY-01/* |
| `PHY79-DIST-TIME/sim` | gi | numeric | kirjoittaa luvun | – | 2…25 | – | – | – | families.ts PHY79-DIST-TIME/* |
| `PHY79-DIST-TIME/tool` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | families.ts PHY79-DIST-TIME/* |
| `PHY79-DIST-TIME/time` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa.; convertLength: ei vaadita: Eri yksiköt ovat luokiteltavina vaihtoehtoina; mitään ei muunneta.; convertTime: ei vaadita: Eri yksiköt ovat luokiteltavina vaihtoehtoina; mitään ei muunneta. | – | – | families.ts PHY79-DIST-TIME/* |
| `PHY79-DIST-TIME/dist` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | convertLength: ei vaadita: Eri yksiköt ovat luokiteltavina vaihtoehtoina; mitään ei muunneta.; convertTime: ei vaadita: Eri yksiköt ovat luokiteltavina vaihtoehtoina; mitään ei muunneta.; decimal: ei vaadita: Desimaaliluku on vain tunnistettava tai kopioitava mittaustulos; sillä ei lasketa. | – | – | families.ts PHY79-DIST-TIME/* |
| `PHY79-DIST-TIME/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | families.ts PHY79-DIST-TIME/* |
| `M-NUM-EQUALSTEP-SEQ/step10` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-EQUALSTEP-SEQ/step5` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-EQUALSTEP-SEQ/step2` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-EQUALSTEP-SEQ/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-EQUALSTEP-SEQ/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-MULTIPLE-INTRO/k3` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-MULTIPLE-INTRO/k2` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-MULTIPLE-INTRO/k5` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-MULTIPLE-INTRO/transfer` | t | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `M-NUM-16/next` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-16/step` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-16/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MUL-01/expr` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MUL-01/total` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MUL-01/equal` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MUL-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-LOW/array` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-LOW/fact` | gi | numeric | kirjoittaa luvun | – | 1…100 | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-LOW/strategy` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-LOW/transfer` | t | numeric | kirjoittaa luvun | – | 8…90 | multiply: oma sisältö | – | – | oletus |
| `M-DIV-02/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DIV-02/pic` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DIV-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MULTAB-HIGH/six` | gi | numeric | kirjoittaa luvun | – | 18…54 | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-HIGH/nine` | gi | numeric | kirjoittaa luvun | – | 27…81 | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-HIGH/fact` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-HIGH/transfer` | t | numeric | kirjoittaa luvun | – | 24…72 | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-ALL/factor` | gi | numeric | kirjoittaa luvun | – | 3…9 | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-ALL/mixed` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-ALL/neighbour` | gi | numeric | kirjoittaa luvun | – | 21…81 | multiply: oma sisältö | – | – | oletus |
| `M-MULTAB-ALL/transfer` | t | numeric | kirjoittaa luvun | – | 36…81 | multiply: oma sisältö | – | – | oletus |
| `M-MULTREL-01/howMany` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MULTREL-01/times` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MULTREL-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `PHY79-SPEED-CONCEPT/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö | – | – | families.ts PHY79-SPEED-CONCEPT/* |
| `PHY79-SPEED-CONCEPT/equal` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö | – | – | families.ts PHY79-SPEED-CONCEPT/* |
| `PHY79-SPEED-CONCEPT/sameT` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: ei vaadita: Selitys näyttää nopeudet; vastaus syntyy vertailemalla matkaa tai aikaa.; speedUnit: oma sisältö | – | – | families.ts PHY79-SPEED-CONCEPT/* |
| `PHY79-SPEED-CONCEPT/sameS` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö; decimal: ei vaadita: Selitys näyttää nopeudet; vastaus syntyy vertailemalla matkaa tai aikaa. | – | – | families.ts PHY79-SPEED-CONCEPT/* |
| `PHY79-SPEED-CONCEPT/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö | – | – | families.ts PHY79-SPEED-CONCEPT/* |
| `PHY79-ACCEL-CONCEPT/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-CONCEPT/table` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CONCEPT/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CONCEPT/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CONCEPT/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-PRESENT-DATA-01/complete` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-PRESENT-DATA-01/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-PRESENT-DATA-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-DATA-01/three` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-DATA-01/two` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-DATA-01/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-01/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-01/build` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `SCI-ENV-RECORD-01/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-NUM-06/count` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-06/empty` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-06/takeAll` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-NUM-06/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-01/missing` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-01/enough` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-01/bundles` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-02/numToPic` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-02/picToNum` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-02/digit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-03/split` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-03/compose` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-03/build` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MENTAL-01/tensOnes` | gi | choice, numeric | valitsee oikean vaihtoehdon | – | 10…10 | – | – | – | oletus |
| `M-MENTAL-01/toTen` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MENTAL-01/use` | gi | numeric | kirjoittaa luvun | – | 42…93 | – | – | – | oletus |
| `M-MENTAL-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-01/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-01/picture` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-01/expr` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-SUB-01/undo` | gi | numeric | kirjoittaa luvun | – | 2…9 | – | – | – | oletus |
| `M-ADD-SUB-01/family` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-SUB-01/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-SUB-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-FACT-10/turn` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-FACT-10/fact` | gi | numeric | kirjoittaa luvun | – | 1…10 | – | – | – | oletus |
| `M-ADD-FACT-10/double` | gi | numeric | kirjoittaa luvun | – | 2…11 | – | – | – | oletus |
| `M-ADD-FACT-10/transfer` | t | numeric | kirjoittaa luvun | – | 4…10 | – | – | – | oletus |
| `M-DIV-01/fair` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DIV-01/deal` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DIV-01/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DIV-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-FACT-10/think` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-FACT-10/fact` | gi | numeric | kirjoittaa luvun | – | 0…7 | – | – | – | oletus |
| `M-SUB-FACT-10/left` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-FACT-10/transfer` | t | numeric | kirjoittaa luvun | – | 1…8 | – | – | – | oletus |
| `M-ADD-FACT-01/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-FACT-01/mixed` | gi | numeric | kirjoittaa luvun | – | 0…10 | – | – | – | oletus |
| `M-ADD-FACT-01/missing` | gi | numeric | kirjoittaa luvun | – | 1…9 | – | – | – | oletus |
| `M-ADD-FACT-01/transfer` | t | numeric | kirjoittaa luvun | – | 1…9 | – | – | – | oletus |
| `M-DIVIS-01/threes` | gi | multi | valitsee kaikki oikeat vaihtoehdot eikä muita | – | – | – | – | – | oletus |
| `M-DIVIS-01/lastDigit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DIVIS-01/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DIVIS-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MULDIV-01/factor` | gi | numeric | kirjoittaa luvun | – | 2…5 | multiply: polku: M-MUL-01 | – | – | oletus |
| `M-MULDIV-01/family` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-01 | – | – | oletus |
| `M-MULDIV-01/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-01 | – | – | oletus |
| `M-MULDIV-01/transfer` | t | numeric | kirjoittaa luvun | – | 3…8 | multiply: polku: M-MUL-01 | – | – | oletus |
| `M-ADD-20/teen` | gi | numeric | kirjoittaa luvun | – | 12…19 | – | – | – | oletus |
| `M-ADD-20/bridge` | gi | numeric | kirjoittaa luvun | – | 11…18 | – | – | – | oletus |
| `M-ADD-20/split` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-20/transfer` | t | numeric | kirjoittaa luvun | – | 11…18 | – | – | – | oletus |
| `M-DIV-FACT-01/think` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-01 | – | – | oletus |
| `M-DIV-FACT-01/fact` | gi | numeric | kirjoittaa luvun | – | 1…10 | multiply: polku: M-MUL-01 | – | – | oletus |
| `M-DIV-FACT-01/share` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-01 | – | – | oletus |
| `M-DIV-FACT-01/transfer` | t | numeric | kirjoittaa luvun | – | 3…8 | – | – | – | oletus |
| `M-FRAC-01/count` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-FRAC-01/equal` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-FRAC-01/fair` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-FRAC-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-20/noBridge` | gi | numeric | kirjoittaa luvun | – | 10…18 | – | – | – | oletus |
| `M-SUB-20/bridge` | gi | numeric | kirjoittaa luvun | – | 2…9 | – | – | – | oletus |
| `M-SUB-20/think` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-20/transfer` | t | numeric | kirjoittaa luvun | – | 3…9 | – | – | – | oletus |
| `M-ADD-100/carry` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ADD-100/noCarry` | gi | numeric | kirjoittaa luvun | – | 25…89 | – | – | – | oletus |
| `M-ADD-100/tens` | gi | numeric | kirjoittaa luvun | – | 31…99 | – | – | – | oletus |
| `M-ADD-100/transfer` | t | numeric | kirjoittaa luvun | – | 42…94 | – | – | – | oletus |
| `M-SUB-100/borrow` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-100/noBorrow` | gi | numeric | kirjoittaa luvun | – | 10…75 | – | – | – | oletus |
| `M-SUB-100/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SUB-100/transfer` | t | numeric | kirjoittaa luvun | – | 12…67 | – | – | – | oletus |
| `M-GEO-02/aboveBelow` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-02/leftRight` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-02/between` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GEO-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-03/estimate` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertLength: oma sisältö | – | – | oletus |
| `M-MEAS-03/unit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-03/ruler` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | convertLength: oma sisältö | – | – | oletus |
| `M-MEAS-04/offset` | gi | numeric | kirjoittaa luvun | – | 3…7 | – | – | – | oletus |
| `M-MEAS-04/units` | gi | numeric | kirjoittaa luvun | – | 3…9 | – | – | – | oletus |
| `M-MEAS-04/unitSize` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-04/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-GMEAS-01/grid` | gi | numeric | kirjoittaa luvun | – | 10…14 | perimeter: oma sisältö | – | – | oletus |
| `M-GMEAS-01/rect` | gi | numeric | kirjoittaa luvun | – | 6…22 | perimeter: oma sisältö | – | – | oletus |
| `M-GMEAS-01/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | perimeter: oma sisältö | – | – | oletus |
| `M-GMEAS-01/transfer` | t | numeric | kirjoittaa luvun | – | 12…24 | perimeter: oma sisältö | – | – | oletus |
| `M-MEAS-05/size` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-05/balance` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-05/equal` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-05/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-06/estimate` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertMass: oma sisältö | – | – | oletus |
| `M-MEAS-06/unit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-06/thousand` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertMass: oma sisältö | – | – | oletus |
| `M-MEAS-06/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | convertMass: oma sisältö | – | – | oletus |
| `M-MEAS-08/cups` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-08/pour` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-08/conserve` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-08/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-09/ten` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertVolume: oma sisältö | – | – | oletus |
| `M-MEAS-09/unit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MEAS-09/compare` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertVolume: oma sisältö | – | – | oletus |
| `M-MEAS-09/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | convertVolume: oma sisältö | – | – | oletus |
| `M-DATA-01/question` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-01/tally` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-01/most` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-02/add` | gi | choice | valitsee oikean vaihtoehdon | Perheessä record havainnot kirjataan itse tukkimiehen kirjanpitoon; muut perheet lukevat valmista merkintää. | – | – | – | – | families.ts M-DATA-02/* |
| `M-DATA-02/count` | gi | choice | valitsee oikean vaihtoehdon | Perheessä record havainnot kirjataan itse tukkimiehen kirjanpitoon; muut perheet lukevat valmista merkintää. | – | – | – | – | families.ts M-DATA-02/* |
| `M-DATA-02/pick` | gi | choice | valitsee oikean vaihtoehdon | Perheessä record havainnot kirjataan itse tukkimiehen kirjanpitoon; muut perheet lukevat valmista merkintää. | – | – | – | – | families.ts M-DATA-02/* |
| `M-DATA-02/record` | gi | tally | kirjaa jokaisen havainnon tukkimiehen merkiksi oikeaan luokkaan | Perheessä record havainnot kirjataan itse tukkimiehen kirjanpitoon; muut perheet lukevat valmista merkintää. | – | – | – | – | families.ts M-DATA-02/* |
| `M-DATA-02/transfer` | t | choice | valitsee oikean vaihtoehdon | Perheessä record havainnot kirjataan itse tukkimiehen kirjanpitoon; muut perheet lukevat valmista merkintää. | – | – | – | – | families.ts M-DATA-02/* |
| `M-DATA-03/twoWay` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-03/read` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-03/fewest` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-03/transfer` | t | numeric | kirjoittaa luvun | – | 5…23 | – | – | – | oletus |
| `M-DATA-05/most` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-05/cell` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-05/diff` | gi | numeric | kirjoittaa luvun | – | 1…12 | – | – | – | oletus |
| `M-DATA-05/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-04/fromList` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-DATA-04/fromTally` | gi | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-DATA-04/header` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-04/transfer` | t | place | sijoittaa osat oikeille paikoille | – | – | – | – | – | oletus |
| `M-SYM-PLUS/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-PLUS/picToSign` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-PLUS/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-PLUS/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-MINUS/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-MINUS/picToSign` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-MINUS/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-MINUS/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-EQUAL/fillLeft` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-EQUAL/trueFalse` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-EQUAL/plates` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-SYM-EQUAL/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ARITH-01/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ARITH-01/missingSign` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ARITH-01/trueFalse` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ARITH-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-MUL-02/picture` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MUL-02/sum` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MUL-02/story` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-MUL-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | multiply: oma sisältö | – | – | oletus |
| `M-EXPR-01/paren` | gi | numeric | kirjoittaa luvun | – | 10…70 | multiply: polku: M-MUL-02 | `M-ADD-01`, `M-SUB-01` · sääntö requires_operation_knowledge_for_operations_present_in_item | `M-ADD-SUB-01` | families.ts M-EXPR-01/* |
| `M-EXPR-01/mulFirst` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-02 | `M-ADD-01`, `M-SUB-01` · sääntö requires_operation_knowledge_for_operations_present_in_item | `M-ADD-SUB-01` | families.ts M-EXPR-01/* |
| `M-EXPR-01/sub` | gi | numeric | kirjoittaa luvun | – | 3…15 | multiply: polku: M-MUL-02 | `M-ADD-01`, `M-SUB-01` · sääntö requires_operation_knowledge_for_operations_present_in_item | `M-ADD-SUB-01` | families.ts M-EXPR-01/* |
| `M-EXPR-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-02 | `M-ADD-01`, `M-SUB-01` · sääntö requires_operation_knowledge_for_operations_present_in_item | `M-ADD-SUB-01` | families.ts M-EXPR-01/* |
| `SCI-ENV-TOOL-01/use` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-TOOL-01/tool` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-TOOL-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-04/compose` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | `M-MUL-01` (selitys: numero × paikka-arvo) | – | families.ts M-PLACE-04/* |
| `M-PLACE-04/value` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MUL-01 | `M-MUL-01` (selitys: numero × paikka-arvo) | – | families.ts M-PLACE-04/* |
| `M-PLACE-04/compare` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | `M-MUL-01` (selitys: numero × paikka-arvo) | – | families.ts M-PLACE-04/* |
| `M-PLACE-04/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MUL-01 | `M-MUL-01` (selitys: numero × paikka-arvo) | – | families.ts M-PLACE-04/* |
| `M-PLACE-05/missing` | gi | numeric | kirjoittaa luvun | – | 10…900 | – | – | – | oletus |
| `M-PLACE-05/expand` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-PLACE-05/regroup` | gi | numeric | kirjoittaa luvun | – | 13…980 | multiply: rekisteri: M-MUL-01 | `M-MUL-01` (selitys: 37 × 10) | – | families.ts M-PLACE-05/regroup |
| `M-PLACE-05/transfer` | t | numeric | kirjoittaa luvun | – | 1211…2435 | – | – | – | oletus |
| `M-NEG-01/colder` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-01/thermo` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-01/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-WRADD/check` | gi | choice | valitsee oikean vaihtoehdon | Perheessä step tarkistetaan muistinumero; muissa vain lopputulos. | – | – | – | – | families.ts M-WRADD/* |
| `M-WRADD/ones` | gi | choice | valitsee oikean vaihtoehdon | Perheessä step tarkistetaan muistinumero; muissa vain lopputulos. | – | – | – | – | families.ts M-WRADD/* |
| `M-WRADD/column` | gi | numeric | kirjoittaa luvun | Perheessä step tarkistetaan muistinumero; muissa vain lopputulos. | 333…948 | – | – | – | families.ts M-WRADD/* |
| `M-WRADD/step` | gi | numeric | kirjoittaa luvun | Perheessä step tarkistetaan muistinumero; muissa vain lopputulos. | 2…9 | – | – | – | families.ts M-WRADD/* |
| `M-WRADD/transfer` | t | numeric | kirjoittaa luvun | Perheessä step tarkistetaan muistinumero; muissa vain lopputulos. | 314…941 | – | – | – | families.ts M-WRADD/* |
| `M-WRDIV/check` | gi | choice | valitsee oikean vaihtoehdon | Perheessä step tarkistetaan ensimmäinen osamäärä ja jakojäännös; muissa vain lopputulos. | – | multiply: polku: M-MUL-01 | – | – | families.ts M-WRDIV/* |
| `M-WRDIV/exchange` | gi | numeric | kirjoittaa luvun | Perheessä step tarkistetaan ensimmäinen osamäärä ja jakojäännös; muissa vain lopputulos. | 12…29 | multiply: polku: M-MUL-01 | – | – | families.ts M-WRDIV/* |
| `M-WRDIV/byPlace` | gi | numeric | kirjoittaa luvun | Perheessä step tarkistetaan ensimmäinen osamäärä ja jakojäännös; muissa vain lopputulos. | 112…444 | – | – | – | families.ts M-WRDIV/* |
| `M-WRDIV/step` | gi | numeric | kirjoittaa luvun | Perheessä step tarkistetaan ensimmäinen osamäärä ja jakojäännös; muissa vain lopputulos. | 1…3 | multiply: polku: M-MUL-01 | – | – | families.ts M-WRDIV/* |
| `M-WRDIV/transfer` | t | numeric | kirjoittaa luvun | Perheessä step tarkistetaan ensimmäinen osamäärä ja jakojäännös; muissa vain lopputulos. | 32…62 | multiply: polku: M-MUL-01 | – | – | families.ts M-WRDIV/* |
| `M-WRMUL/check` | gi | choice | valitsee oikean vaihtoehdon | Osatulot näkyvät; perheessä step tarkistetaan muistinumero, muissa vain lopputulos. | – | multiply: oma sisältö | – | – | families.ts M-WRMUL/* |
| `M-WRMUL/column` | gi | numeric | kirjoittaa luvun | Osatulot näkyvät; perheessä step tarkistetaan muistinumero, muissa vain lopputulos. | 92…837 | multiply: oma sisältö | – | – | families.ts M-WRMUL/* |
| `M-WRMUL/partial` | gi | numeric | kirjoittaa luvun | Osatulot näkyvät; perheessä step tarkistetaan muistinumero, muissa vain lopputulos. | 378…2322 | multiply: oma sisältö | – | – | families.ts M-WRMUL/* |
| `M-WRMUL/step` | gi | numeric | kirjoittaa luvun | Osatulot näkyvät; perheessä step tarkistetaan muistinumero, muissa vain lopputulos. | 0…9 | multiply: oma sisältö | – | – | families.ts M-WRMUL/* |
| `M-WRMUL/transfer` | t | numeric | kirjoittaa luvun | Osatulot näkyvät; perheessä step tarkistetaan muistinumero, muissa vain lopputulos. | 342…1452 | multiply: oma sisältö | – | – | families.ts M-WRMUL/* |
| `M-WRSUB/check` | gi | choice | valitsee oikean vaihtoehdon | Perheessä step tarkistetaan lainaus; muissa vain lopputulos. | – | – | – | – | families.ts M-WRSUB/* |
| `M-WRSUB/flip` | gi | choice | valitsee oikean vaihtoehdon | Perheessä step tarkistetaan lainaus; muissa vain lopputulos. | – | – | – | – | families.ts M-WRSUB/* |
| `M-WRSUB/column` | gi | numeric | kirjoittaa luvun | Perheessä step tarkistetaan lainaus; muissa vain lopputulos. | 114…763 | – | – | – | families.ts M-WRSUB/* |
| `M-WRSUB/step` | gi | numeric | kirjoittaa luvun | Perheessä step tarkistetaan lainaus; muissa vain lopputulos. | 1…9 | – | – | – | families.ts M-WRSUB/* |
| `M-WRSUB/transfer` | t | numeric | kirjoittaa luvun | Perheessä step tarkistetaan lainaus; muissa vain lopputulos. | 7…689 | – | – | – | families.ts M-WRSUB/* |
| `M-NEG-02/read` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-02/place` | gi | line | merkitsee kohdan lukusuoralle | – | -7…-1 | negative: oma sisältö | – | – | oletus |
| `M-NEG-02/order` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-02/transfer` | t | line | merkitsee kohdan lukusuoralle | – | -8…-3 | negative: oma sisältö | – | – | oletus |
| `M-NEG-03/order` | gi | place | sijoittaa osat oikeille paikoille | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-03/bigger` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-03/colder` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-NEG-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M-FRAC-02/trap` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-02/name` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-02/shade` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-DEC-01/line` | gi | line | merkitsee kohdan lukusuoralle | – | 0.1…0.9 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-01/bar` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-01/over` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-01/transfer` | t | line | merkitsee kohdan lukusuoralle | – | 1.1…1.9 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-FRAC-06/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-FRAC-06/same` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-06/missing` | gi | numeric | kirjoittaa luvun | – | 2…12 | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-FRAC-06/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-DEC-02/digit` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-02/grid` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö | – | – | oletus |
| `M-DEC-02/same` | gi | numeric | kirjoittaa luvun | – | 10…90 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-02/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-FRAC-03/unit` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | `M-FRAC-05` (samannimisten vertailu), `M-FRAC-11` (siirtotehtävä: kaksi osaa yhteen) | – | families.ts M-FRAC-03/* |
| `M-FRAC-03/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | `M-FRAC-05` (samannimisten vertailu), `M-FRAC-11` (siirtotehtävä: kaksi osaa yhteen) | – | families.ts M-FRAC-03/* |
| `M-FRAC-03/same` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | `M-FRAC-05` (same), `M-FRAC-05` (samannimisten vertailu), `M-FRAC-11` (siirtotehtävä: kaksi osaa yhteen) | `M-FRAC-05` | families.ts M-FRAC-03/*; scope manifest M-FRAC-03/same |
| `M-FRAC-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | `M-FRAC-11` (transfer (two shares of a pie)), `M-FRAC-05` (samannimisten vertailu), `M-FRAC-11` (siirtotehtävä: kaksi osaa yhteen) | `M-FRAC-11` | families.ts M-FRAC-03/*; scope manifest M-FRAC-03/transfer |
| `M-FRAC-08/factor` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-08/simplify` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-08/simplest` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-08/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-DEC-03/digit` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | families.ts M-DEC-03/* |
| `M-DEC-03/mm` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02; convertLength: annettu: Tehtävä kertoo, montako pientä yksikköä on isossa. | – | – | families.ts M-DEC-03/* |
| `M-DEC-03/write` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | families.ts M-DEC-03/* |
| `M-DEC-03/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02; convertMass: annettu: Tehtävä kertoo, montako pientä yksikköä on isossa. | – | – | families.ts M-DEC-03/* |
| `M-FRAC-05/symbol` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-05/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-05/order` | gi | place | sijoittaa osat oikeille paikoille | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-05/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-11/picture` | gi | numeric | kirjoittaa luvun | – | 2…7 | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-11/add` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-11/missing` | gi | numeric | kirjoittaa luvun | – | 1…6 | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-11/transfer` | t | choice | valitsee oikean vaihtoehdon | Jäljelle jäävän osan voi laskea myös kuvan paloista; vastaus ei yksin näytä vähennyslaskutaitoa. | – | fraction: oma sisältö | `M-FRAC-12` (transfer), `M-FRAC-12` (selitys: n/n − (a+b)/n) | `M-FRAC-12` | families.ts M-FRAC-11/transfer |
| `M-FRAC-12/picture` | gi | numeric | kirjoittaa luvun | – | 1…6 | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-12/sub` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-12/whole` | gi | numeric | kirjoittaa luvun | – | 1…9 | fraction: oma sisältö | – | – | oletus |
| `M-FRAC-12/transfer` | t | numeric | kirjoittaa luvun | – | 1…10 | fraction: oma sisältö | – | – | oletus |
| `M79-RECIP-01/product` | gi | numeric | kirjoittaa luvun | – | 1…1 | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | families.ts M79-RECIP-01/* |
| `M79-RECIP-01/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: ei vaadita: Negatiivinen luku on vain väärä vaihtoehto.; fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | families.ts M79-RECIP-01/* |
| `M79-RECIP-01/whole` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: ei vaadita: Negatiivinen luku on vain väärä vaihtoehto.; decimal: ei vaadita: Desimaaliluku on vain väärä vaihtoehto.; fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | families.ts M79-RECIP-01/* |
| `M79-RECIP-01/transfer` | t | numeric | kirjoittaa luvun | – | 3…10 | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | families.ts M79-RECIP-01/* |
| `M-DEC-DECOMPOSE/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö | – | – | oletus |
| `M-DEC-DECOMPOSE/missing` | gi | numeric | kirjoittaa luvun | – | 0.01…0.09 | decimal: oma sisältö | – | – | oletus |
| `M-DEC-DECOMPOSE/compose` | gi | numeric | kirjoittaa luvun | – | 1.03…9.83 | decimal: oma sisältö | – | – | oletus |
| `M-DEC-DECOMPOSE/transfer` | t | numeric | kirjoittaa luvun | – | 1.23…9.84 | decimal: oma sisältö; multiply: rekisteri: M-MUL-01 | `M-MUL-01` (selitys: kolikoiden määrä × arvo) | – | families.ts M-DEC-DECOMPOSE/transfer |
| `M-DEC-READ/hundredths` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-READ/tenths` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-READ/fromWords` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-READ/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-WRITE/hundredths` | gi | numeric | kirjoittaa luvun | – | 1.03…9.09 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-WRITE/tenths` | gi | numeric | kirjoittaa luvun | – | 0.1…9.9 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-WRITE/teens` | gi | numeric | kirjoittaa luvun | – | 1.37…9.76 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-WRITE/transfer` | t | numeric | kirjoittaa luvun | – | 1.02…4.09 | decimal: oma sisältö; fraction: polku: M-FRAC-02; convertLength: annettu: 1 cm = 0,01 m on kerrottu. | – | – | families.ts M-DEC-WRITE/transfer |
| `M-FRAC-15/count` | gi | numeric | kirjoittaa luvun | – | 2…25 | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-FRAC-15/repeat` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-FRAC-15/whole` | gi | numeric | kirjoittaa luvun | – | 1…1 | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-FRAC-15/transfer` | t | numeric | kirjoittaa luvun | – | 3…9 | fraction: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-DEC-04/symbol` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö | – | – | oletus |
| `M-DEC-04/trap` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-04/order` | gi | place | sijoittaa osat oikeille paikoille | – | – | decimal: oma sisältö | – | – | oletus |
| `M-DEC-04/transfer` | t | line | merkitsee kohdan lukusuoralle | – | 0.15…0.85 | decimal: oma sisältö | – | – | oletus |
| `M-ALG-04/sub` | gi | numeric | kirjoittaa luvun | – | 5…19 | – | – | – | oletus |
| `M-ALG-04/bag` | gi | numeric | kirjoittaa luvun | – | 2…9 | – | – | – | oletus |
| `M-ALG-04/add` | gi | numeric | kirjoittaa luvun | – | 2…12 | – | – | – | oletus |
| `M-ALG-04/times` | gi | numeric | kirjoittaa luvun | – | 2…6 | – | `M-MULTAB-LOW` | `M-MULTAB-LOW`, `M-MULDIV-01` | families.ts M-ALG-04/times |
| `M-ALG-04/transfer` | t | numeric | kirjoittaa luvun | – | 3…15 | – | – | – | oletus |
| `M-DEC-08/tens` | gi | numeric | kirjoittaa luvun | – | 12.3…9920 | decimal: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M-DEC-08/whole` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö; fraction: polku: M-FRAC-02; multiply: oma sisältö | – | – | oletus |
| `M-DEC-08/repeated` | gi | numeric | kirjoittaa luvun | – | 0.4…9 | decimal: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M-DEC-08/transfer` | t | numeric | kirjoittaa luvun | – | 30…150 | decimal: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M-DEC-09/tens` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö | – | – | oletus |
| `M-DEC-09/share` | gi | numeric | kirjoittaa luvun | – | 1.1…2.9 | decimal: oma sisältö; fraction: polku: M-FRAC-02; multiply: polku: M-MUL-01 | – | – | oletus |
| `M-DEC-09/money` | gi | numeric | kirjoittaa luvun | – | 0.5…2.5 | decimal: oma sisältö | – | – | oletus |
| `M-DEC-09/transfer` | t | numeric | kirjoittaa luvun | – | 0.05…0.95 | decimal: oma sisältö; convertLength: annettu: Metrissä on 100 senttiä on kerrottu. | – | – | families.ts M-DEC-09/transfer |
| `M-DEC-ADD/mixed` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö | – | – | oletus |
| `M-DEC-ADD/tenths` | gi | numeric | kirjoittaa luvun | – | 0.2…1.8 | decimal: oma sisältö; fraction: polku: M-FRAC-02 | – | – | oletus |
| `M-DEC-ADD/sub` | gi | numeric | kirjoittaa luvun | – | 0.3…7.1 | decimal: oma sisältö | – | – | oletus |
| `M-DEC-ADD/transfer` | t | numeric | kirjoittaa luvun | – | 0.75…2.25 | decimal: oma sisältö | – | – | oletus |
| `M-ALG-05/truth` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ALG-05/both` | gi | numeric | kirjoittaa luvun | – | 1…13 | – | – | – | oletus |
| `M-ALG-05/balance` | gi | numeric | kirjoittaa luvun | – | 1…11 | – | – | – | oletus |
| `M-ALG-05/transfer` | t | numeric | kirjoittaa luvun | – | 15…38 | – | – | – | oletus |
| `M79-VAR-UNKNOWN/meaning` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-VAR-UNKNOWN/solve` | gi | numeric | kirjoittaa luvun | – | 3…15 | – | – | – | oletus |
| `M79-VAR-UNKNOWN/bags` | gi | numeric | kirjoittaa luvun | – | 3…9 | – | – | – | oletus |
| `M79-VAR-UNKNOWN/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-VAR-VARYING/fill` | gi | numeric | kirjoittaa luvun | – | 5…34 | multiply: rekisteri: M-MULTAB-ALL | `M79-EXPR-EVAL`, `M-MULTAB-ALL` | `M79-EXPR-EVAL` | families.ts M79-VAR-VARYING/fill |
| `M79-VAR-VARYING/step` | gi | numeric | kirjoittaa luvun | – | 2…9 | – | – | – | oletus |
| `M79-VAR-VARYING/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-VAR-VARYING/transfer` | t | numeric | kirjoittaa luvun | – | 2…3 | – | – | – | oletus |
| `M-ALG-06/fromBalance` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ALG-06/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ALG-06/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-ALG-06/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-VAR-01/same` | gi | numeric | kirjoittaa luvun | – | 3…12 | – | – | – | oletus |
| `M79-VAR-01/classify` | gi | choice | valitsee oikean vaihtoehdon | – | – | perimeter: annettu: Kaava piiri = 4s on annettu. | – | `M-GMEAS-01` | families.ts M79-VAR-01/classify |
| `M79-VAR-01/can` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-VAR-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | perimeter: annettu: Kaava piiri = 4s on annettu. | – | `M-GMEAS-01` | families.ts M79-VAR-01/transfer |
| `M-ALG-07/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MULTAB-ALL | `M-MULTAB-ALL` | `M-MULTAB-ALL` | families.ts M-ALG-07/* |
| `M-ALG-07/test` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | `M-MULTAB-ALL` | `M-MULTAB-ALL` | families.ts M-ALG-07/* |
| `M-ALG-07/balance` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | `M-MULTAB-ALL` | `M-MULTAB-ALL` | families.ts M-ALG-07/* |
| `M-ALG-07/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MULTAB-ALL | `M-MULTAB-ALL` | `M-MULTAB-ALL` | families.ts M-ALG-07/* |
| `M79-EXPR-EVAL/paren` | gi | numeric | kirjoittaa luvun | – | 8…60 | multiply: polku: M-MUL-02 | – | – | oletus |
| `M79-EXPR-EVAL/linear` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MUL-02 | – | – | oletus |
| `M79-EXPR-EVAL/neg` | gi | numeric | kirjoittaa luvun | – | -23…6 | negative: rekisteri: M79-INT-MUL; multiply: polku: M-MUL-02 | `M79-INT-MUL`, `M79-INT-ADD` | `M79-INT-MUL` | families.ts M79-EXPR-EVAL/neg |
| `M79-EXPR-EVAL/transfer` | t | numeric | kirjoittaa luvun | – | 11…42 | multiply: polku: M-MUL-02 | – | – | oletus |
| `M79-EXPR-FORM/shape` | gi | choice | valitsee oikean vaihtoehdon | Valitsee lausekkeen tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | multiply: polku: M-MULTREL-01; perimeter: rekisteri: M-GMEAS-01 | `M-GMEAS-01`, `M-GMEAS-01` (shape) | `M-GMEAS-01` | families.ts M79-EXPR-FORM/*; families.ts M79-EXPR-FORM/shape |
| `M79-EXPR-FORM/price` | gi | choice | valitsee oikean vaihtoehdon | Valitsee lausekkeen tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EXPR-FORM/* |
| `M79-EXPR-FORM/words` | gi | choice | valitsee oikean vaihtoehdon | Valitsee lausekkeen tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EXPR-FORM/* |
| `M79-EXPR-FORM/build` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | Valitsee lausekkeen tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EXPR-FORM/* |
| `M79-EXPR-FORM/transfer` | t | choice | valitsee oikean vaihtoehdon | Valitsee lausekkeen tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | multiply: polku: M-MULTREL-01 | – | – | families.ts M79-EXPR-FORM/* |
| `M-ALG-08/mul` | gi | numeric | kirjoittaa luvun | – | 3…9 | multiply: polku: M-MUL-01 | – | – | oletus |
| `M-ALG-08/add` | gi | numeric | kirjoittaa luvun | – | 3…15 | – | – | – | oletus |
| `M-ALG-08/sub` | gi | numeric | kirjoittaa luvun | – | 3…24 | – | – | – | oletus |
| `M-ALG-08/transfer` | t | numeric | kirjoittaa luvun | – | 4…15 | – | – | – | oletus |
| `M-UNIT-01/steps` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertLength: oma sisältö | `M-MUL-01` (kertoimet 10, 100, 1000) | – | families.ts M-UNIT-01/* |
| `M-UNIT-01/prefix` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: polku: M-DEC-04; fraction: polku: M-FRAC-02; convertLength: oma sisältö | `M-MUL-01` (kertoimet 10, 100, 1000) | – | families.ts M-UNIT-01/* |
| `M-UNIT-01/other` | gi | choice | valitsee oikean vaihtoehdon | – | – | convertVolume: oma sisältö; convertMass: oma sisältö | `M-MUL-01` (kertoimet 10, 100, 1000) | – | families.ts M-UNIT-01/* |
| `M-UNIT-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | `M-MUL-01` (kertoimet 10, 100, 1000) | – | families.ts M-UNIT-01/* |
| `M79-EQ1-FORM/balance` | gi | choice | valitsee oikean vaihtoehdon | Valitsee yhtälön tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EQ1-FORM/* |
| `M79-EQ1-FORM/age` | gi | choice | valitsee oikean vaihtoehdon | Valitsee yhtälön tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EQ1-FORM/* |
| `M79-EQ1-FORM/shop` | gi | choice | valitsee oikean vaihtoehdon | Valitsee yhtälön tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EQ1-FORM/* |
| `M79-EQ1-FORM/build` | gi | build | rakentaa lausekkeen tai yhtälön merkkipaloista (samanarvoiset muodot hyväksytään) | Valitsee yhtälön tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | – | – | – | families.ts M79-EQ1-FORM/* |
| `M79-EQ1-FORM/transfer` | t | choice | valitsee oikean vaihtoehdon | Valitsee yhtälön tai rakentaa sen merkkipaloista (perhe build); vastaavat muodot hyväksytään. | – | perimeter: rekisteri: M-GMEAS-01 | `M-GMEAS-01`, `M-GMEAS-01` (transfer) | `M-GMEAS-01` | families.ts M79-EQ1-FORM/*; families.ts M79-EQ1-FORM/transfer |
| `M-UNIT-02/km-m-2` | gi | numeric | kirjoittaa luvun | – | 1000…9000 | multiply: rekisteri: M-MUL-01; convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-02/cm-mm-1` | gi | numeric | kirjoittaa luvun | – | 20…390 | multiply: rekisteri: M-MUL-01; convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-02/m-cm-0` | gi | numeric | kirjoittaa luvun | – | 100…900 | multiply: rekisteri: M-MUL-01; convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-02/cm-m-3` | gi | numeric | kirjoittaa luvun | – | 1…9 | convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-02/mm-cm-4` | gi | numeric | kirjoittaa luvun | – | 2…30 | convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-02/transfer` | t | numeric | kirjoittaa luvun | – | 4…30 | convertLength: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01` | families.ts M-UNIT-02/* |
| `M-UNIT-03/g-kg-2` | gi | numeric | kirjoittaa luvun | – | 1…9 | convertMass: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-06` | families.ts M-UNIT-03/* |
| `M-UNIT-03/t-kg-1` | gi | numeric | kirjoittaa luvun | – | 1000…5000 | multiply: rekisteri: M-MUL-01 | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-06` | families.ts M-UNIT-03/* |
| `M-UNIT-03/kg-g-0` | gi | numeric | kirjoittaa luvun | – | 1000…9000 | multiply: rekisteri: M-MUL-01; convertMass: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-06` | families.ts M-UNIT-03/* |
| `M-UNIT-03/kg-g-3` | gi | numeric | kirjoittaa luvun | – | 1000…4000 | multiply: rekisteri: M-MUL-01; convertMass: oma sisältö; decimal: polku: M-DEC-04 | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-06` | families.ts M-UNIT-03/* |
| `M-UNIT-03/transfer` | t | numeric | kirjoittaa luvun | – | 4…20 | convertMass: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-06` | families.ts M-UNIT-03/* |
| `M-UNIT-04/dl-ml-2` | gi | numeric | kirjoittaa luvun | – | 100…900 | multiply: rekisteri: M-MUL-01; convertVolume: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-04/l-ml-1` | gi | numeric | kirjoittaa luvun | – | 1000…5000 | multiply: rekisteri: M-MUL-01; convertVolume: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-04/l-dl-0` | gi | numeric | kirjoittaa luvun | – | 10…90 | multiply: rekisteri: M-MUL-01; convertVolume: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-04/dl-l-3` | gi | numeric | kirjoittaa luvun | – | 1…9 | convertVolume: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-04/l-cl-4` | gi | numeric | kirjoittaa luvun | – | 100…500 | multiply: rekisteri: M-MUL-01 | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-04/transfer` | t | numeric | kirjoittaa luvun | – | 5…8 | decimal: polku: M-DEC-04; convertVolume: oma sisältö | `M-MUL-01`, `M-DIV-01` | `M-UNIT-01`, `M-MEAS-09` | families.ts M-UNIT-04/* |
| `M-UNIT-05/mixed` | gi | numeric | kirjoittaa luvun | – | 70…225 | convertTime: oma sisältö | `M-MUL-01`, `M-DIV-01` · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/* |
| `M-UNIT-05/mins` | gi | numeric | kirjoittaa luvun | – | 120…360 | multiply: polku: M-MUL-01; convertTime: oma sisältö | `M-MUL-01`, `M-DIV-01` · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/* |
| `M-UNIT-05/hmin` | gi | numeric | kirjoittaa luvun | – | 120…300 | multiply: polku: M-MUL-01; convertTime: oma sisältö | `M-MUL-01`, `M-DIV-01` · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/* |
| `M-UNIT-05/back` | gi | numeric | kirjoittaa luvun | – | 2…4 | – | `M-MUL-01`, `M-DIV-01` · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/* |
| `M-UNIT-05/day` | gi | numeric | kirjoittaa luvun | – | 48…96 | multiply: polku: M-MUL-01 | `M-MUL-01`, `M-DIV-01` · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/* |
| `M-UNIT-05/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | clock: rekisteri: M-TIME-02; convertTime: oma sisältö | `M-MUL-01`, `M-DIV-01`, `M-TIME-02`, `M-TIME-02` (transfer) · sääntö requires_multiplication_or_division_according_to_conversion_direction | `M-TIME-02`, `M-MULTAB-ALL`, `M-DIV-01` | families.ts M-UNIT-05/*; families.ts M-UNIT-05/transfer |
| `PHY79-SPEED-UNIT/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MULTREL-01; speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-UNIT/kmh` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-UNIT/ms` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MULTREL-01; speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-UNIT/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: oma sisältö | – | – | oletus |
| `M-DATA-09/fix` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-09/method` | gi | choice | valitsee oikean vaihtoehdon | – | – | clock: ei vaadita: Vaihtoehdossa mainitaan kellonaika; sitä ei lueta eikä lasketa. | – | – | families.ts M-DATA-09/method |
| `M-DATA-09/order` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-09/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-10/cell` | gi | numeric | kirjoittaa luvun | – | 0…4 | – | – | – | oletus |
| `M-DATA-10/listToTable` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-10/shape` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-DATA-10/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-COORD-READ-Q1/whichPin` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-COORD-READ-Q1/read` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-COORD-READ-Q1/axis` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-COORD-READ-Q1/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-COORD-PLOT-Q1/onAxis` | gi | plot | piirtää pisteet kuvaajaan | – | – | – | – | – | oletus |
| `M-COORD-PLOT-Q1/plot` | gi | plot | piirtää pisteet kuvaajaan | – | – | – | – | – | oletus |
| `M-COORD-PLOT-Q1/story` | gi | plot | piirtää pisteet kuvaajaan | – | – | – | – | – | oletus |
| `M-COORD-PLOT-Q1/transfer` | t | plot | piirtää pisteet kuvaajaan | – | – | – | – | – | oletus |
| `M-COORD-01/readPoly` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M-COORD-01/corner` | gi | plot | piirtää pisteet kuvaajaan | – | – | – | – | – | oletus |
| `M-COORD-01/move` | gi | plot | piirtää pisteet kuvaajaan | – | – | – | – | – | oletus |
| `M-COORD-01/transfer` | t | plot | piirtää pisteet kuvaajaan | – | – | – | – | – | oletus |
| `M-COORD-02/read` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M-COORD-02/plot` | gi | plot | piirtää pisteet kuvaajaan | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M-COORD-02/quadrant` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M-COORD-02/transfer` | t | plot | piirtää pisteet kuvaajaan | – | – | negative: polku: M-NEG-02 | `M-SYM-01` (transfer (axis reflection)), `M-SYM-01` (peilaus akselin yli) | `M-SYM-01` | families.ts M-COORD-02/transfer |
| `SCI-ENV-MEAS-01/unit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-MEAS-01/toolUnit` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-MEAS-01/repeat` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-MEAS-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-DATA-01/most` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-DATA-01/table` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-DATA-01/total` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `SCI-ENV-DATA-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-DATA-01/sim` | gi | numeric | kirjoittaa luvun | – | 6…24 | – | – | – | oletus |
| `PHY79-DATA-01/header` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-DATA-01/table` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-DATA-01/transfer` | t | numeric | kirjoittaa luvun | – | 2…20 | – | `M-DATA-05` | `M-DATA-05` | families.ts PHY79-DATA-01/transfer |
| `M79-FRAC-MUL/calc` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; multiply: oma sisältö | `M-FRAC-08` (demo (simplifying the product)), `M-FRAC-08` (malli: tulon supistaminen) | `M-FRAC-08` | families.ts M79-FRAC-MUL/* |
| `M79-FRAC-MUL/area` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; multiply: oma sisältö | `M-FRAC-08` (demo (simplifying the product)), `M-FRAC-08` (malli: tulon supistaminen) | `M-FRAC-08` | families.ts M79-FRAC-MUL/* |
| `M79-FRAC-MUL/half` | gi | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; multiply: oma sisältö | `M-FRAC-08` (demo (simplifying the product)), `M-FRAC-08` (malli: tulon supistaminen) | `M-FRAC-08` | families.ts M79-FRAC-MUL/* |
| `M79-FRAC-MUL/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | fraction: oma sisältö; multiply: oma sisältö | `M-FRAC-08` (demo (simplifying the product)), `M-FRAC-08` (malli: tulon supistaminen) | `M-FRAC-08` | families.ts M79-FRAC-MUL/* |
| `M79-FRAC-DIV/rule` | gi | choice | valitsee oikean vaihtoehdon | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | – | fraction: oma sisältö | – | – | families.ts M79-FRAC-DIV/* |
| `M79-FRAC-DIV/fracFrac` | gi | numeric | kirjoittaa luvun | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | 2…7 | fraction: oma sisältö | – | – | families.ts M79-FRAC-DIV/* |
| `M79-FRAC-DIV/groups` | gi | numeric | kirjoittaa luvun | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | 4…25 | fraction: oma sisältö; multiply: polku: M79-FRAC-MUL | – | – | families.ts M79-FRAC-DIV/* |
| `M79-FRAC-DIV/bigger` | gi | choice | valitsee oikean vaihtoehdon | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | – | fraction: oma sisältö; decimal: ei vaadita: Selityksen 2,5 havainnollistaa; vertailun voi tehdä ilman desimaalijakoa. | – | – | families.ts M79-FRAC-DIV/*; families.ts M79-FRAC-DIV/bigger |
| `M79-FRAC-DIV/calc` | gi | frac | kirjoittaa murtoluvun (samanarvoiset murtoluvut hyväksytään) | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | – | fraction: oma sisältö; multiply: polku: M79-FRAC-MUL | – | – | families.ts M79-FRAC-DIV/* |
| `M79-FRAC-DIV/transfer` | t | numeric | kirjoittaa luvun | Perheessä calc lasketaan erinimisten murtolukujen osamäärä, ja samanarvoiset murtoluvut hyväksytään; käänteisluvun valinta on vain osataito. | 3…7 | fraction: oma sisältö | – | – | families.ts M79-FRAC-DIV/* |
| `M79-DEC-DIV/compute` | gi | numeric | kirjoittaa luvun | – | 2…9 | decimal: oma sisältö | – | – | oletus |
| `M79-DEC-DIV/scale` | gi | numeric | kirjoittaa luvun | – | 2…9 | decimal: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M79-DEC-DIV/grows` | gi | choice | valitsee oikean vaihtoehdon | – | – | decimal: oma sisältö | – | – | oletus |
| `M79-DEC-DIV/transfer` | t | numeric | kirjoittaa luvun | – | 5…25 | decimal: oma sisältö; speedUnit: annettu: Muuntokerroin 3,6 on annettu. | – | `PHY79-SPEED-UNIT` | families.ts M79-DEC-DIV/transfer |
| `M79-PROP-01/recipe` | gi | numeric | kirjoittaa luvun | – | 4…16 | multiply: polku: M-MULTREL-01 | – | – | oletus |
| `M79-PROP-01/missing` | gi | numeric | kirjoittaa luvun | – | 8…45 | – | – | – | oletus |
| `M79-PROP-01/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: polku: M-MULTREL-01 | – | – | oletus |
| `M79-PROP-01/transfer` | t | numeric | kirjoittaa luvun | – | 18…60 | multiply: polku: M-MULTREL-01; decimal: rekisteri: M-DEC-08 | `M-DEC-08` | `M-DEC-08` | families.ts M79-PROP-01/transfer |
| `PHY79-SPEED-CALC/sim` | gi | numeric | kirjoittaa luvun | – | 2…8 | speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-CALC/kmh` | gi | numeric | kirjoittaa luvun | – | 40…80 | speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-CALC/ms` | gi | numeric | kirjoittaa luvun | – | 2…9 | speedUnit: oma sisältö | – | – | oletus |
| `PHY79-SPEED-CALC/transfer` | t | numeric | kirjoittaa luvun | – | 6…10 | decimal: rekisteri: M-DEC-ADD; speedUnit: oma sisältö | `M-DEC-ADD` | `M-DEC-ADD` | families.ts PHY79-SPEED-CALC/transfer |
| `M79-DEP-01/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-DEP-01/depends` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-DEP-01/pattern` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-DEP-01/transfer` | t | numeric | kirjoittaa luvun | – | 15…48 | multiply: rekisteri: M-MUL-01 | `M-MUL-01` | `M-MULTAB-LOW` | families.ts M79-DEP-01/transfer |
| `M79-FUNC-01/rule` | gi | choice | valitsee oikean vaihtoehdon | – | – | multiply: rekisteri: M-MULTAB-ALL | `M79-EXPR-EVAL`, `M-MULTAB-ALL` | `M79-EXPR-EVAL` | families.ts M79-FUNC-01/* |
| `M79-FUNC-01/run` | gi | numeric | kirjoittaa luvun | – | -14…36 | multiply: rekisteri: M-MULTAB-ALL; negative: rekisteri: M79-INT-MUL | `M79-EXPR-EVAL`, `M-MULTAB-ALL`, `M79-INT-MUL`, `M79-INT-ADD` | `M79-INT-MUL`, `M79-EXPR-EVAL` | families.ts M79-FUNC-01/*; families.ts M79-FUNC-01/run |
| `M79-FUNC-01/isFunc` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | `M79-EXPR-EVAL`, `M-MULTAB-ALL` | `M79-EXPR-EVAL` | families.ts M79-FUNC-01/* |
| `M79-FUNC-01/transfer` | t | numeric | kirjoittaa luvun | – | 12…33 | multiply: rekisteri: M-MULTAB-ALL | `M79-EXPR-EVAL`, `M-MULTAB-ALL` | `M79-EXPR-EVAL` | families.ts M79-FUNC-01/*; scope manifest M79-FUNC-01/transfer |
| `M79-FUNC-TABLE/rule` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-FUNC-TABLE/fill` | gi | numeric | kirjoittaa luvun | – | 1…20 | multiply: rekisteri: M-MULTAB-ALL; negative: rekisteri: M79-INT-SUB | `M79-EXPR-EVAL`, `M79-INT-SUB`, `M-MULTAB-ALL` | `M79-EXPR-EVAL`, `M79-INT-SUB` | families.ts M79-FUNC-TABLE/fill |
| `M79-FUNC-TABLE/table` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `M79-FUNC-TABLE/transfer` | t | plot | piirtää pisteet kuvaajaan | – | – | – | – | – | oletus |
| `M79-FUNC-GRAPH/read` | gi | numeric | kirjoittaa luvun | – | -4…4 | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-FUNC-GRAPH/plot` | gi | plot | piirtää pisteet kuvaajaan | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-FUNC-GRAPH/match` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-FUNC-GRAPH/transfer` | t | plot | piirtää pisteet kuvaajaan | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `PHY79-GRAPH-01/sim` | gi | numeric | kirjoittaa luvun | – | 4…30 | – | – | – | oletus |
| `PHY79-GRAPH-01/pick` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-GRAPH-01/plot` | gi | plot | piirtää pisteet kuvaajaan | – | – | – | – | – | oletus |
| `PHY79-GRAPH-01/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-VT-GRAPH/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-VT-GRAPH/decel` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-VT-GRAPH/accel` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-VT-GRAPH/rest` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-VT-GRAPH/steady` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-VT-GRAPH/transfer` | t | numeric | kirjoittaa luvun | – | 2…12 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `M79-UNIT-LIN/kmm` | gi | numeric | kirjoittaa luvun | – | 1100…8900 | decimal: polku: M-DEC-04; multiply: rekisteri: M-DEC-08; convertLength: oma sisältö | `M-DEC-08`, `M-UNIT-02` | `M-DEC-08`, `M-UNIT-02` | families.ts M79-UNIT-LIN/* |
| `M79-UNIT-LIN/mmm` | gi | numeric | kirjoittaa luvun | – | 0.12…0.95 | decimal: polku: M-DEC-04; convertLength: oma sisältö | `M-DEC-08`, `M-UNIT-02` | `M-DEC-08`, `M-UNIT-02` | families.ts M79-UNIT-LIN/* |
| `M79-UNIT-LIN/mcm` | gi | numeric | kirjoittaa luvun | – | 104…398 | decimal: polku: M-DEC-04; multiply: rekisteri: M-DEC-08; convertLength: oma sisältö | `M-DEC-08`, `M-UNIT-02` | `M-DEC-08`, `M-UNIT-02` | families.ts M79-UNIT-LIN/* |
| `M79-UNIT-LIN/cmm` | gi | numeric | kirjoittaa luvun | – | 0.07…0.95 | decimal: polku: M-DEC-04 | `M-DEC-08`, `M-UNIT-02` | `M-DEC-08`, `M-UNIT-02` | families.ts M79-UNIT-LIN/* |
| `M79-UNIT-LIN/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: polku: M-DEC-04; convertLength: oma sisältö | `M-DEC-08`, `M-UNIT-02` | `M-DEC-08`, `M-UNIT-02` | families.ts M79-UNIT-LIN/* |
| `PHY79-UNIT-CONV/hMin` | gi | numeric | kirjoittaa luvun | – | 30…180 | multiply: polku: M-MUL-01; convertTime: oma sisältö; decimal: polku: M-DEC-04 | `M-DEC-08`, `M-UNIT-05` · sääntö requires_quantity_specific_unit_conversion_skill_for_item_instance | `M-UNIT-05`, `M-DEC-08`, `M-UNIT-02` | families.ts PHY79-UNIT-CONV/*; families.ts PHY79-UNIT-CONV/hMin |
| `PHY79-UNIT-CONV/minS` | gi | numeric | kirjoittaa luvun | – | 120…360 | multiply: polku: M-MUL-01; convertTime: oma sisältö | `M-UNIT-05` · sääntö requires_quantity_specific_unit_conversion_skill_for_item_instance | `M-UNIT-05`, `M-UNIT-02` | families.ts PHY79-UNIT-CONV/*; families.ts PHY79-UNIT-CONV/minS |
| `PHY79-UNIT-CONV/kmM` | gi | numeric | kirjoittaa luvun | – | 800…4500 | decimal: polku: M-DEC-04; multiply: polku: M-MUL-01; convertLength: oma sisältö | `M-DEC-08`, `M-UNIT-02` · sääntö requires_quantity_specific_unit_conversion_skill_for_item_instance | `M-UNIT-02`, `M-DEC-08`, `M-UNIT-05` | families.ts PHY79-UNIT-CONV/*; families.ts PHY79-UNIT-CONV/kmM |
| `PHY79-UNIT-CONV/cmM` | gi | numeric | kirjoittaa luvun | – | 0.75…3.4 | decimal: polku: M-DEC-04; convertLength: oma sisältö | `M-DEC-09`, `M-UNIT-02` · sääntö requires_quantity_specific_unit_conversion_skill_for_item_instance | `M-DEC-09`, `M-UNIT-02`, `M-UNIT-05` | families.ts PHY79-UNIT-CONV/*; families.ts PHY79-UNIT-CONV/cmM |
| `PHY79-UNIT-CONV/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: polku: M-DEC-04; convertLength: oma sisältö | `M-UNIT-02`, `M-DEC-08` · sääntö requires_quantity_specific_unit_conversion_skill_for_item_instance | `M-UNIT-02`, `M-DEC-08`, `M-UNIT-05` | families.ts PHY79-UNIT-CONV/*; families.ts PHY79-UNIT-CONV/transfer |
| `PHY79-SPEED-MIXED/sim` | gi | numeric | kirjoittaa luvun | – | 2…5 | multiply: polku: M-MULTREL-01; convertTime: polku: PHY79-UNIT-CONV; speedUnit: polku: PHY79-SPEED-CALC; decimal: polku: M-DEC-04 | – | – | oletus |
| `PHY79-SPEED-MIXED/kmh` | gi | numeric | kirjoittaa luvun | – | 5…20 | decimal: polku: M-DEC-04; speedUnit: polku: PHY79-SPEED-CALC | `M79-DEC-DIV` | `M79-DEC-DIV` | scope manifest PHY79-SPEED-MIXED/kmh |
| `PHY79-SPEED-MIXED/mMin` | gi | numeric | kirjoittaa luvun | – | 2…5 | convertTime: polku: PHY79-UNIT-CONV; speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `PHY79-SPEED-MIXED/kmMin` | gi | numeric | kirjoittaa luvun | – | 2…6 | decimal: polku: M-DEC-04; convertLength: polku: PHY79-UNIT-CONV; convertTime: polku: PHY79-UNIT-CONV; speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `PHY79-SPEED-MIXED/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | decimal: polku: M-DEC-04; speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `M79-INT-ORDER/order` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-ORDER/sign` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-ORDER/compare` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-ORDER/place` | gi | line | merkitsee kohdan lukusuoralle | – | -9…-2 | negative: oma sisältö | – | – | oletus |
| `M79-INT-ORDER/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-DIST/same` | gi | numeric | kirjoittaa luvun | – | 2…11 | negative: oma sisältö | – | – | oletus |
| `M79-INT-DIST/across` | gi | numeric | kirjoittaa luvun | – | 2…16 | negative: oma sisältö | – | – | oletus |
| `M79-INT-DIST/abs` | gi | numeric | kirjoittaa luvun | – | 2…15 | negative: oma sisältö | – | – | oletus |
| `M79-INT-DIST/transfer` | t | numeric | kirjoittaa luvun | – | 10…26 | negative: oma sisältö | – | – | oletus |
| `M79-INT-01/mid` | gi | numeric | kirjoittaa luvun | – | -5…3 | negative: oma sisältö | – | – | oletus |
| `M79-INT-01/jump` | gi | line | merkitsee kohdan lukusuoralle | – | -10…10 | negative: oma sisältö | – | – | oletus |
| `M79-INT-01/closer` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-01/transfer` | t | numeric | kirjoittaa luvun | – | 6…19 | negative: oma sisältö | – | – | oletus |
| `M79-INT-ADD/negneg` | gi | numeric | kirjoittaa luvun | – | -18…-5 | negative: oma sisältö | – | – | oletus |
| `M79-INT-ADD/line` | gi | line | merkitsee kohdan lukusuoralle | – | -4…7 | negative: oma sisältö | – | – | oletus |
| `M79-INT-ADD/mixed` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö | – | – | oletus |
| `M79-INT-ADD/transfer` | t | numeric | kirjoittaa luvun | – | -4…9 | negative: oma sisältö | – | – | oletus |
| `M79-INT-MUL/sign` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M79-INT-MUL/pattern` | gi | numeric | kirjoittaa luvun | – | -15…-2 | negative: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M79-INT-MUL/negneg` | gi | numeric | kirjoittaa luvun | – | 6…81 | negative: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M79-INT-MUL/transfer` | t | numeric | kirjoittaa luvun | – | -30…-4 | negative: oma sisältö; multiply: oma sisältö | – | – | oletus |
| `M79-EQ1-SOLVE/two` | gi | numeric | kirjoittaa luvun | – | -4…9 | negative: polku: M79-INT-ADD | `M79-INT-DIV`, `M79-INT-ADD`, `M79-INT-SUB` · sääntö requires_arithmetic_operations_present_in_equation_item | `M79-INT-DIV`, `M79-INT-SUB` | families.ts M79-EQ1-SOLVE/*; scope manifest M79-EQ1-SOLVE/two |
| `M79-EQ1-SOLVE/one` | gi | numeric | kirjoittaa luvun | – | -6…12 | negative: polku: M79-INT-ADD | `M79-INT-ADD`, `M79-INT-SUB`, `M79-INT-DIV` · sääntö requires_arithmetic_operations_present_in_equation_item | `M79-INT-DIV`, `M79-INT-SUB` | families.ts M79-EQ1-SOLVE/* |
| `M79-EQ1-SOLVE/both` | gi | numeric | kirjoittaa luvun | – | 1…8 | – | `M79-INT-ADD`, `M79-INT-SUB`, `M79-INT-DIV` · sääntö requires_arithmetic_operations_present_in_equation_item | `M79-INT-DIV`, `M79-INT-SUB` | families.ts M79-EQ1-SOLVE/* |
| `M79-EQ1-SOLVE/transfer` | t | numeric | kirjoittaa luvun | – | 2…6 | – | `M79-INT-ADD`, `M79-INT-SUB`, `M79-INT-DIV` · sääntö requires_arithmetic_operations_present_in_equation_item | `M79-INT-DIV`, `M79-INT-SUB` | families.ts M79-EQ1-SOLVE/* |
| `PHY79-SPEED-REARR/sim` | gi | numeric | kirjoittaa luvun | – | 6…30 | multiply: polku: M-MULTREL-01; speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `PHY79-SPEED-REARR/time` | gi | numeric | kirjoittaa luvun | – | 3…9 | speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `PHY79-SPEED-REARR/dist` | gi | numeric | kirjoittaa luvun | – | 6…81 | multiply: polku: M-MULTREL-01; speedUnit: polku: PHY79-SPEED-CALC | – | – | oletus |
| `PHY79-SPEED-REARR/transfer` | t | numeric | kirjoittaa luvun | – | 2.5…2.5 | decimal: rekisteri: M79-DEC-DIV; speedUnit: polku: PHY79-SPEED-CALC | `M79-DEC-DIV` | `M79-DEC-DIV` | families.ts PHY79-SPEED-REARR/transfer |
| `M79-LINE-GRAPH/intercept` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-LINE-GRAPH/which` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-LINE-GRAPH/draw` | gi | plot | piirtää pisteet kuvaajaan | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-LINE-GRAPH/transfer` | t | numeric | kirjoittaa luvun | – | -2…2 | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-SLOPE/sign` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-SLOPE/table` | gi | numeric | kirjoittaa luvun | – | -2…5 | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-SLOPE/points` | gi | numeric | kirjoittaa luvun | – | -3…4 | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-SLOPE/steeper` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: polku: M-NEG-02 | – | – | oletus |
| `M79-SLOPE/transfer` | t | numeric | kirjoittaa luvun | – | 2…5 | speedUnit: rekisteri: PHY79-SPEED-CONCEPT | `PHY79-SPEED-CONCEPT` (selitys: kulmakerroin on nopeus) | – | families.ts M79-SLOPE/transfer |
| `PHY79-ST-GRAPH/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ST-GRAPH/read` | gi | numeric | kirjoittaa luvun | – | 2…4 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ST-GRAPH/flat` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ST-GRAPH/steeper` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ST-GRAPH/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/decel` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/accel` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/rest` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/steady` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-MOTION-GRAPH/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-VT-GRAPH/sim` | gi | numeric | kirjoittaa luvun | – | 1…2 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-VT-GRAPH/sign` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-VT-GRAPH/read` | gi | numeric | kirjoittaa luvun | – | 1…2 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-VT-GRAPH/steeper` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-VT-GRAPH/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-GRAPH/sim` | gi | choice | valitsee oikean vaihtoehdon | – | – | – | – | – | oletus |
| `PHY79-ACCEL-GRAPH/accel` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-GRAPH/steady` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-GRAPH/rest` | gi | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-GRAPH/transfer` | t | choice | valitsee oikean vaihtoehdon | – | – | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `M79-INT-DIV/negneg` | gi | numeric | kirjoittaa luvun | – | 2…9 | negative: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M79-INT-DIV/sign` | gi | numeric | kirjoittaa luvun | – | -9…-2 | negative: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M79-INT-DIV/check` | gi | choice | valitsee oikean vaihtoehdon | – | – | negative: oma sisältö; multiply: polku: M-MUL-01 | – | – | oletus |
| `M79-INT-DIV/transfer` | t | numeric | kirjoittaa luvun | – | -6…-2 | negative: oma sisältö | – | – | oletus |
| `M79-INT-SUB/down` | gi | numeric | kirjoittaa luvun | – | -17…-4 | negative: oma sisältö | – | – | oletus |
| `M79-INT-SUB/subNeg` | gi | numeric | kirjoittaa luvun | – | -3…17 | negative: oma sisältö | – | – | oletus |
| `M79-INT-SUB/change` | gi | numeric | kirjoittaa luvun | – | -9…9 | negative: oma sisältö | – | – | oletus |
| `M79-INT-SUB/transfer` | t | numeric | kirjoittaa luvun | – | 7…19 | negative: oma sisältö | – | – | oletus |
| `PHY79-ACCEL-CALC/sim` | gi | numeric | kirjoittaa luvun | – | 1…3 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CALC/moving` | gi | numeric | kirjoittaa luvun | – | 1…4 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CALC/rest` | gi | numeric | kirjoittaa luvun | – | 1…5 | speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
| `PHY79-ACCEL-CALC/transfer` | t | numeric | kirjoittaa luvun | – | -4…-2 | negative: polku: M79-INT-SUB; speedUnit: polku: PHY79-SPEED-CONCEPT | – | – | oletus |
