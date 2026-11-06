# Sammakko — white paper
## Osaamisverkkoon perustuva adaptiivinen oppimisympäristö suomalaisen perusopetuksen matematiikkaan ja luonnontieteisiin

**Työpaperi v0.1 — verkkoversio päivitetty 1.11.2026**
**Kieli:** suomi  
**Tarkoitus:** kuvata Sammakon pedagoginen, psykologinen, matemaattis-luonnontieteellinen ja tutkimuksellinen perusidea nykyisen Sammakko Lite -demon, oppituntikirjaston ja avoimesti tutkittavan osaamisverkon taustaksi.

**Nykyinen toteutustila:** verkkoversiossa on 690 osaamiskohteen kanoninen STEM-verkko, 1 287 relaatiota, 181 Lite-harjoitteluun kytkettyä aihetta ja 181 teknisesti tarkistettua oppituntiluonnosta. Loput 509 oppituntisivua ovat avoimesti merkittyjä sisältöpohjia, eivät valmiita oppitunteja.  

> **Tutkimus- ja kehitystila.** 690 KC:n verkkoa, sen prerequisite-suhteita, mastery-sääntöjä tai oppimisvaikutusta ei ole empiirisesti validoitu kokonaisuutena. Tekninen tarkistus ei ole oppimistulosnäyttöä eikä Opetushallituksen hyväksyntä.

---

## Tiivistelmä

Sammakko on kehitteillä oleva adaptiivinen oppimisjärjestelmä, jonka käyttöliittymä on peli. Sen lähtökohta ei ole tehdä oppikirjan tehtävistä viihteellisempiä, vaan mallintaa opetussuunnitelman mukainen osaaminen mahdollisimman hienojakoiseksi verkoksi, seurata oppilaan osaamista osaamiskohdekohtaisesti ja valita seuraava oppimistoiminto sen perusteella, mitä oppilas jo osaa, mitä häneltä puuttuu ja millaista näyttöä osaamisesta vielä tarvitaan.

Sammakon tämänhetkinen STEM-baseline sisältää matematiikan vuosiluokkien 1–9 sekä ympäristöopin luonnontieteellisen perustan, fysiikan 7–9 ja kemian 7–9. Sisältö on hajotettu 690 osaamiskohteeseen (Knowledge Component, KC), jotka on kytketty 1 287 relaatiolla osaamisverkoksi. Hard prerequisite -rakenne on suunnattu syklitön verkko (DAG); kaikki tukirelaatiot eivät ole etenemisen portteja. Määrä ei ole tarkoitettu lopulliseksi; tärkeämpää on periaate, jonka mukaan esimerkiksi “desimaaliluvut”, “nopeus” tai “kehäkulma” eivät ole yksi taito, vaan joukko erikseen opetettavia ja arvioitavia käsitteitä, representaatioita ja menettelyjä.

Sammakon tutkimuksellinen ydinkysymys on:

> **Saavuttaako Sammakko saman tai paremman opetussuunnitelman mukaisen osaamisen, kun osaamista arvioidaan sekä viiveellä että uusissa soveltamistilanteissa, mutta lyhyemmällä aktiivisella opiskeluajalla kuin valitulla vertailumenetelmällä?**

Kyse on hypoteesista, ei markkinointiväitteestä.

Sammakon mahdollinen uutuusarvo ei perustu yhteen uuteen pedagogiseen menetelmään. Sen keskeiset osat — mastery learning, älykkäät tutorointijärjestelmät, retrieval practice, spacing, worked examples, tuen asteittainen vähentäminen, pelillisyys ja oppimisanalytiikka — ovat ennestään tutkittuja. Uutuudellinen kulma on niiden systemaattinen yhdistäminen samaan, opetussuunnitelmaan jäljitettävään ja koneellisesti validoitavaan arkkitehtuuriin siten, että yksittäinen opetettava mikrotaito, sen esitiedot, tehtävät, tyypilliset virhekäsitykset, tuki, haastetaso, viivekertaus ja soveltamisnäyttö muodostavat yhden läpinäkyvän kokonaisuuden.

Sammakko pyrkii siis vastaamaan kysymykseen: **mitä tapahtuu, jos opetussuunnitelmaa ei digitalisoida lukuina ja tehtäväsivuina, vaan eksplisiittisenä oppimisen riippuvuusverkkona, jonka läpi jokainen oppilas kulkee oman osaamisensa perusteella?**

---

# 1. Ongelma, johon Sammakko yrittää vastata

Luokkamuotoisessa opetuksessa on väistämätön rakenteellinen kompromissi. Opetus etenee ryhmän, vuosiluokan ja käytettävissä olevan ajan ehdoilla, vaikka oppilaiden esitiedot, oppimisnopeus ja tuen tarve vaihtelevat huomattavasti.

Sama seitsemäsluokkalainen voi esimerkiksi:

- hallita laskutoimitukset mutta kompastua yksiköihin,
- ymmärtää fysiikan ilmiön intuitiivisesti mutta olla epävarma suhteista ja kuvaajista,
- osata jo koko opetettavan asian ja käyttää suuren osan tunnista odottamiseen,
- osata suorittaa tutun tehtävätyypin mutta epäonnistua, kun sama idea esiintyy uudessa kontekstissa,
- hyötyä vaiheistetusta tuesta ilman, että itse oppimistavoitetta tarvitsee laskea.

Perinteinen digitaalinen oppimateriaali ratkaisee osan ongelmasta: tehtäviä voidaan tehdä omaan tahtiin, palaute voidaan automatisoida ja sisältöä voidaan tarjota runsaasti. Silti järjestys on yleensä edelleen pääosin materiaalin laatijan ennalta määräämä: luku 1, tehtävät 1–10, luku 2 ja niin edelleen.

Sammakon lähtökohta on toinen. Oppimisen etenemisen perusyksikkö ei ole oppitunti, kirjan sivu tai vuosiluokka, vaan **osaamiskohde**.

---

# 2. Osaamiskohde: pienin järkevästi opetettava ja arvioitava yksikkö

Osaamiskohde eli KC on yksi riittävän itsenäinen käsite, representaatio, menettely tai prosessitaito, jonka osaamisesta voidaan kerätä erillistä näyttöä.

Esimerkiksi “lukukäsite” voidaan purkaa muun muassa seuraaviin osiin:

- lukusanojen käyttäminen vakaassa järjestyksessä,
- yhden lukusanan kohdistaminen kuhunkin laskettavaan kohteeseen,
- ymmärrys siitä, että viimeinen lukusana kertoo koko joukon lukumäärän eli kardinaliteettiperiaate,
- lukumäärän yhdistäminen lukusanaan,
- lukumäärän yhdistäminen numeromerkintään.

Vastaavasti yläkoulun geometriassa “kehäkulma” voidaan erottaa ainakin:

1. kehäkulman käsitteen tunnistamiseen ja ymmärtämiseen;
2. kehäkulman ja samaa kaarta vastaavan keskuskulman välisen suhteen käyttämiseen.

Tämä granulaatio ei ole itseisarvo. Noodia ei pidä pilkkoa niin pieneksi, ettei sillä enää ole pedagogista merkitystä. Tavoitteena on löytää taso, jolla kaksi asiaa voidaan aidosti osata toisistaan riippumatta ja jolla niiden erottaminen auttaa diagnostiikkaa, opetusta tai palautetta.

---

# 3. Osaamisverkko: oppisisältö puun sijasta DAG:ina

Osaamiskohteet muodostavat suunnatun syklittömän verkon (DAG). Nuoli A → B tarkoittaa, että A on jollakin tavalla B:n esitieto tai tuki.

Kaikki relaatiot eivät ole samanarvoisia. Sammakossa erotetaan esimerkiksi:

- **required prerequisite** — ilman tätä ydinesitietoa B:n hallinta ei ole mielekkäästi saavutettavissa;
- **strong prerequisite** — vahvasti hyödyllinen pohja, mutta ei globaali lukko;
- **representation support** — esimerkiksi lukusuora, taulukko tai diagrammi tukee käsitteen ymmärtämistä;
- **process support** — yleinen päättely-, havainnointi- tai strateginen taito tukee sisältöä;
- **safety gate** — käytännön työskentelyä rajoittava turvallisuusehto, joka ei saa estää käsitteen opiskelua esimerkiksi simulaatiossa.

Tämä ero on tärkeä. Jos jokainen hyödyllinen esitieto mallinnetaan pakolliseksi hard gateksi, järjestelmä muuttuu jäykäksi ja oppilas joutuu helposti turhaan pitkille kiertoteille. Jos taas esitiedot jätetään mallintamatta, järjestelmä ei osaa korjata todellista osaamisaukkoa.

Sammakon tämänhetkisessä refaktorissa erotetaan lisäksi todelliset pedagogiset **foundation-entryt** pelkistä graafiteoreettisista juurista. Se, ettei noodilla ole hard prerequisitea, ei vielä tarkoita, että se olisi hyvä ensimmäinen asia opetettavaksi.

Esimerkiksi “hiukkassäteilyn tunnistaminen säteilylajiksi” voidaan esitellä ilman raskasta laskentaa, mutta se ei silti ole luonnollinen koko fysiikan lähtöpiste. Alakoulun havainto-, liike-, vuorovaikutus- ja energiakäsitteet muodostavat sille hyödyllisen pehmeän pohjan.

---

# 4. Neljä eri asiaa, joita ei saa sekoittaa

Sammakko erottaa neljä kerrosta:

```text
1. NORMATIIVINEN OPETUSSUUNNITELMAVERKKO
   Mitä opetussuunnitelma tavoittelee?

2. OSAAMISVERKKO
   Mitkä pienet taidot ja käsitteet tavoitteen saavuttaminen käytännössä edellyttää?

3. PEDAGOGINEN JÄRJESTYS
   Missä järjestyksessä nämä yleensä kannattaa opettaa?

4. HENKILÖKOHTAINEN OPPIMISPOLKU
   Missä järjestyksessä juuri tämän oppilaan kannattaa edetä?
```

Tämä erottelu on yksi Sammakon keskeisistä rakenteellisista lähtökohdista.

Valtakunnallinen opetussuunnitelma ei ole sama asia kuin optimaalinen yksilöllinen etenemisjärjestys. Vuosiluokka ei ole sama asia kuin taitotaso. Eikä pedagogisesti johdettu prerequisite-suhde ole sama asia kuin Opetushallituksen normatiivinen vaatimus.

Kaikella julkaistulla sisällöllä on tarkoitus säilyttää jäljitettävyys siihen opetussuunnitelman kohtaan tai erikseen merkittyyn pedagogiseen rikastustavoitteeseen, josta se on johdettu.

---

# 5. Miltä yhden noodin oppiminen näyttää?

Sammakon oletusmalli ei ole “lue teoria ja vastaa kymmeneen kysymykseen”. Yhden KC:n ympärille voidaan muodostaa lyhyt oppimissykli:

```text
DIAGNOSTIIKKA
→ KONTEKSTI / UTELIAISUUS
→ ENNUSTA
→ MANIPULOI / HAVAINNOI
→ SELITÄ
→ MALLIRATKAISU
→ TUEN ASTEITTAINEN VÄHENTÄMINEN
→ ITSENÄINEN HARJOITTELU
→ SOVELTAMINEN UUTEEN TILANTEESEEN
→ OSAAMISTARKISTUS
→ VIIPEELLÄ TEHTÄVÄ MUISTIHAKU
```

Kaikkia vaiheita ei suoriteta rituaalinomaisesti jokaisessa noodissa.

Jos oppilas osoittaa diagnostisesti vahvan osaamisen, järjestelmä voi siirtyä suoraan soveltamistehtävään ja edelleen seuraavaan noodiin. Jos taas perusteissa on aukko, järjestelmä palaa prerequisite-noodiin tai antaa enemmän rakennetta.

Tämä on tärkeää kahdesta vastakkaisesta syystä:

- tukea tarvitseva oppilas ei joudu etenemään uuden abstraktion päälle, jos kriittinen pohjataito puuttuu;
- jo osaava oppilas ei joudu käymään läpi pitkää selitystä vain siksi, että materiaali on suunniteltu keskiverto-oppilaalle.

---

# 6. Osaamisen hallinta ei tarkoita yhtä prosenttilukua

Sammakossa yhden oikein ratkaistun tehtävän ei ole tarkoitus tarkoittaa “mastered”.

Osaamisnäyttö erotellaan ainakin käsitteellisesti seuraaviin luokkiin:

- itsenäinen välitön suoritus,
- vihjeellä tuettu suoritus,
- viiveellä saatu näyttö,
- osaamisen soveltaminen uuteen tilanteeseen,
- tehtäväpohjien ja representaatioiden monipuolisuus,
- havaittu tyypillinen virhekäsitys,
- viimeisin harjoitteluaika.

Näin voidaan erottaa esimerkiksi kolme hyvin erilaista tilannetta:

**A.** Oppilas ratkaisee tehtävän vihjeiden avulla. Hän oppii, mutta itsenäistä osaamista ei vielä ole osoitettu.

**B.** Oppilas ratkaisee tutun tehtävätyypin itsenäisesti heti opetuksen jälkeen. Välitön näyttö on vahva, mutta säilyminen ja siirtovaikutus ovat vielä epävarmoja.

**C.** Oppilas ratkaisee myöhemmin uuden kontekstin tehtävän ilman vihjeitä. Tämä on olennaisesti vahvempaa evidenssiä siitä, että opittu rakenne on käytettävissä.

Tässä Sammakko nojaa ajatukseen, että oppimisen arvioinnin pitää kohdistua siihen, mitä halutaan pysyväksi: ei vain harjoitustilanteessa onnistumiseen vaan myöhempään mieleen palauttamiseen ja joustavaan soveltamiseen.

---

# 7. Miksi viive, muistihaku ja soveltaminen ovat keskiössä?

Muistitutkimuksessa retrieval practice eli aktiivinen mieleen palauttaminen on osoittautunut tehokkaaksi myöhemmän säilymisen kannalta. Roedigerin ja Karpicken klassisessa tutkimuksessa toistettu testaus tuotti viiveellä paremman muistamisen kuin pelkkä uudelleenopiskelu, vaikka välitön suoritus saattoi näyttää toisenlaiselta.

Samoin harjoittelun ajallinen hajauttaminen on laajassa meta-analyysissä yhdistetty parempaan pitkäkestoiseen muistamiseen kuin saman harjoittelun kasaaminen yhteen jaksoon.

Matematiikassa myös sekoitettu eli interleaved harjoittelu voi olla hyödyllistä erityisesti silloin, kun oppilaan täytyy itse tunnistaa, mitä menetelmää ongelmaan pitäisi soveltaa.

Sammakon kannalta näiden havaintojen olennainen seuraus on arkkitehtoninen: harjoittelu ei pääty siihen, kun noodi on “läpäisty”. Aiemmin opittu noodi voi palata myöhemmin muistihakuna, ja tehtävä voi esiintyä toisessa kontekstissa ilman, että käyttöliittymä kertoo etukäteen, mitä kaavaa tai strategiaa pitäisi käyttää.

---

# 8. Malliratkaisuista itsenäiseen ongelmanratkaisuun

Aloittelijalle suoraan annettu vaikea ongelma voi kuluttaa suuren osan työmuistista itse ratkaisutavan etsimiseen. Cognitive Load -perinteessä worked examples -tutkimus on osoittanut, että valmiiden ratkaisujen tutkiminen voi alkuvaiheessa tukea skeemojen muodostumista tehokkaammin kuin pelkkä yritys–erehdys-ongelmanratkaisu.

Sammakon mallissa tämä näkyy tuen asteittaisena vähentämisenä:

1. täydellinen malliratkaisu;
2. yksi puuttuva vaihe;
3. useampia puuttuvia vaiheita;
4. itsenäinen ratkaisu;
5. sama rakenne uudessa tilanteessa.

Tärkeää on, ettei tuki jää pysyväksi. Tuen tarkoitus on tehdä osaamisesta itsenäistä.

---

# 9. Lisätuki ei tarkoita alemman tavoitetason oppilasta

Sammakossa tuki mallinnetaan ominaisuuksina, ei diagnoosina.

Oppilas voi esimerkiksi saada:

- pienempiin vaiheisiin pilkotun tehtävän,
- helpommin saatavilla olevat vihjeet,
- matalamman tekstitiheyden,
- vaihtoehtoisen representaation,
- enemmän malliratkaisuja,
- puhe- tai lukutukea,
- vähennettyä animaatiota,
- enemmän aikaa.

Olennaista on, että sama ydintavoite voi säilyä.

Ajatus on lähellä Universal Design for Learning -periaatteita: oppimisen esteitä voidaan vähentää tarjoamalla useita tapoja havaita sisältöä, toimia ja ilmaista osaamista ilman, että oppimistavoitetta tarpeettomasti muutetaan.

Sammakko ei tarvitse oppilaan diagnoosia voidakseen tarjota tällaisia ominaisuuksia.

---

# 10. Haastetaso ei tarkoita suurempia numeroita

Lahjakkaan tai nopeasti etenevän oppilaan eriyttäminen typistyy digitaalisissa materiaaleissa helposti “samaan tehtävään suuremmilla luvuilla”.

Sammakossa haastetaso tarkoittaa ennemmin:

- tiiviimpää etenemistä,
- diagnostista ohittamista,
- vähäisempää scaffoldingia,
- abstraktimpaa representaatiota,
- monivaiheista päättelyä,
- mallintamista,
- uuden tilanteen soveltamista,
- vaihtoehtoisten ratkaisujen vertailua,
- aikaisempaa etenemistä seuraavaan osaamisnoodiin.

Tavoite on vähentää jo hallitun asian päälle käytettyä aikaa, ei vain kasvattaa laskukuormaa.

---

# 11. Pelillisyys on käyttöliittymä, ei oppimistavoite

Sammakko on peli vain siinä mielessä, että oppiminen tapahtuu lämpimässä, reagoivassa ja motivoivassa ympäristössä.

Pelin ei ole tarkoitus palkita:

- mahdollisimman pitkää ruutuaikaa,
- loputonta klikkailua,
- streakin säilyttämistä menettämisen pelolla,
- vihjeiden välttämistä hinnalla millä hyvänsä,
- ensimmäisellä yrityksellä onnistumista tavalla, joka suosii jo ennestään osaavia.

Sen sijaan pelimaailma voi reagoida esimerkiksi:

- uuden taidon hallintaan,
- aiemmin opitun muistamiseen,
- soveltamiseen uuteen tilanteeseen,
- vaikean virhekäsityksen korjaamiseen,
- itsenäistymiseen vihjeistä.

Gamifikaatiotutkimus antaa syytä olettaa, että pelillisyydellä voi olla positiivisia vaikutuksia oppimiseen ja motivaatioon, mutta vaikutus riippuu toteutuksesta. Sammakon kannalta tästä seuraa varovainen periaate: **pelikerros palvelee oppimista, ei päinvastoin**.

Itsemääräämisteorian näkökulmasta tavoiteltavia kokemuksia ovat erityisesti kompetenssi ja autonomia: oppija näkee edistymisensä, saa sopivan haasteen ja pystyy etenemään oman osaamisensa perusteella.

---

# 12. Matemaattis-luonnontieteellisen sisällön erityisvaatimus: oikeellisuuden pitää olla koneellisesti testattavaa

Sammakon yksi tärkeä teknis-pedagoginen lähtökohta on, ettei numeerista tai muodollista oikeellisuutta jätetä generatiivisen kielimallin arvattavaksi.

Tehtäväpohjalla voi olla esimerkiksi:

```text
generate(seed)
solve(params)
validateAnswer(answer, expected)
classifyMisconceptions(...)
```

Matematiikassa tämä voi tarkoittaa eksaktia aritmetiikkaa, ekvivalenssia ja ominaisuustestejä.

Fysiikassa sama domain state voi syöttää:

- laskennallisen oikean vastauksen,
- yksiköt,
- kuvaajan,
- animaation tai simulaation.

Jos kuvaajassa näkyvä liike ei vastaa samaa matemaattista mallia kuin oikea vastaus, visualisointi on pedagogisesti haitallinen.

Kemiassa vastaavasti hiukkastason visualisoinnin, symbolisen esityksen ja mahdollisten aine-/rakenneinvarianssien pitää olla keskenään johdonmukaisia.

Generatiivista tekoälyä voidaan käyttää sisältötuotannon apuna, mutta sen tuotos kulkee skeema-, solver-, lähde- ja validointiporttien läpi.

---

# 13. Canonical Learning Content ja runtime erotetaan toisistaan

Sammakon sisältöarkkitehtuuri voidaan jäsentää näin:

```text
CANONICAL LEARNING CONTENT
│
├─ Curriculum graph
├─ KC graph
├─ LessonBlueprint
├─ AssessmentBlueprint
├─ ItemTemplate
├─ Misconceptions
├─ Support variants
├─ Challenge variants
├─ Simulation spec
└─ provenance
         │
         ▼
   DELIVERY ADAPTER
     ┌───┴────┐
     ▼        ▼
Sammakko    ViLLE /
runtime     muu alusta
```

Tämä erottelu on sekä teknisesti että tutkimuksellisesti tärkeä.

Pedagoginen sisältö voidaan julkaista avoimena ja koneellisesti luettavana aineistona, vaikka Sammakon varsinainen runtime, adaptiivinen scheduler, learner model, pelimaailma ja käyttöliittymä säilyvät erillisenä ohjelmistona.

Tämänhetkinen lisenssisuunta on julkaista Canonical Learning Content vapaasti käytettäväksi ja muokattavaksi esimerkiksi CC BY 4.0 -lisenssillä, kun taas Sammakon runtimeen pidetään erilliset oikeudet. Tämä mahdollistaisi saman opetussisällön käyttämisen esimerkiksi ViLLEssä ilman, että Sammakon tutkimus- tai tuotekehitys olisi riippuvainen yhden jakelukanavan infrastruktuurista.

Samalla avoin sisältö tekisi itse pedagogisesta mallista tutkittavan ja kritisoitavan: prerequisite-edgejä, noodigranulaatiota, lesson blueprinttejä ja tehtäväpohjia voidaan tarkastella riippumatta Sammakon käyttöliittymästä.

---

# 14. Mikä Sammakossa on aidosti uusi kulma?

On tärkeää olla väittämättä liikaa.

Sammakko ei ole ensimmäinen:

- adaptiivinen oppimisjärjestelmä,
- älykäs tutorointijärjestelmä,
- mastery learning -järjestelmä,
- pelillistetty oppimisympäristö,
- prerequisite-graafia käyttävä järjestelmä,
- retrieval practicea tai spacingia käyttävä järjestelmä.

Älykkäistä tutorointijärjestelmistä on jo meta-analyyttistä näyttöä: Ma ym. raportoivat ITS-järjestelmille keskimäärin paremman oppimistuloksen kuin opettajajohtoiselle suurryhmäopetukselle, muulle tietokonepohjaiselle opetukselle ja oppikirja-/työkirjatyöskentelylle, vaikka vaikutukset vaihtelevat vertailuryhmän ja toteutuksen mukaan.

Sammakon mahdollinen uutuus on **integraatiossa ja operationalisoinnissa**.

### 14.1 Opetussuunnitelma muutetaan eksplisiittiseksi osaamisriippuvuusverkoksi

OPS-kytkentä ei jää metadata-tagiksi oppitunnin kylkeen, vaan opetussuunnitelman tavoite puretaan arvioitaviksi mikrotiedoiksi ja -taidoiksi sekä niiden keskinäisiksi riippuvuuksiksi.

### 14.2 Sama graafi ohjaa sekä tukea että kiihdytystä

Prerequisite-graafi ei ole vain heikon oppilaan remediation-työkalu. Sen avulla voidaan myös osoittaa, mitä jo osaava oppilas voi turvallisesti ohittaa.

### 14.3 Mastery määritellään evidenssiprofiilina

Sammakko ei optimoi vain välitöntä oikeellisuutta, vaan erottaa vihjeellisen, itsenäisen, viiveellisen ja soveltavan näytön.

### 14.4 Tutkimusoptimointi kohdistuu aikaan suhteutettuun pysyvään osaamiseen

North Star ei ole “enemmän tehtäviä”, “enemmän pisteitä” tai “enemmän käyttöaikaa”, vaan:

> **mahdollisimman hyvä viiveellä mitattu osaaminen ja kyky soveltaa opittua uusiin tilanteisiin mahdollisimman vähäisellä aktiivisella opiskeluajalla.**

Tämä tekee oppimisnopeudesta falsifioitavan tutkimuskysymyksen.

### 14.5 Matemaattis-luonnontieteellinen totuuskerros on erotettu käyttöliittymästä

Tehtävän numeerinen totuus, yksiköt, kuvaaja ja simulaatio pyritään johtamaan samasta domain-mallista. Tämä on erityisen tärkeää fysiikassa ja kemiassa, joissa näyttävä mutta väärä visualisointi voi opettaa väärän mallin.

### 14.6 Sisältö voidaan erottaa alustasta

Avoin Canonical Learning Content mahdollistaa saman KC:n pedagogisen toteutuksen Sammakon omassa runtimessa, ViLLEssä tai myöhemmin toisessa ympäristössä. Tämä mahdollistaa myös sen tutkimisen, johtuuko mahdollinen vaikutus itse sisältöarkkitehtuurista vai Sammakon runtime-adaptaatiosta.

---

# 15. Mikä Sammakossa voisi olla tutkimisen arvoista?

Tutkimuksellisesti kiinnostavinta ei ehkä ole kysymys “toimiiko oppimispeli?”, vaan useampi tarkempi kysymys.

### 15.1 Vähentääkö prerequisite-pohjainen eteneminen aktiivista opiskeluaikaa?

Jos oppilas saa ohittaa jo hallitut KC:t mutta järjestelmä varmistaa osaamisen soveltamistehtävällä, voidaanko sama tavoitetaso saavuttaa lyhyemmässä aktiivisessa ajassa?

### 15.2 Parantaako KC-tasoinen remediation verrattuna oppitunti- tai lukutason kertaukseen?

Jos virhe paikannetaan esimerkiksi yksikkömuunnokseen eikä koko nopeusaiheeseen, kuinka paljon tarpeetonta uudelleenopiskelua voidaan välttää?

### 15.3 Onko hyöty suurin heterogeenisissä ryhmissä?

Adaptiivisuuden teoreettinen hyöty kasvaa, kun oppilaiden lähtötasot eroavat. Tämä on empiirisesti testattavissa.

### 15.4 Voiko sama tavoitetaso säilyä tukiprofiilista riippumatta?

Voidaan testata, vähentääkö lisätuki keskeytyksiä, virhekäsityksiä tai hint-riippuvuutta ilman, että tavoiteltu osaamistaso madaltuu.

### 15.5 Voidaanko lahjakkaan oppilaan hukka-aikaa mitattavasti vähentää?

Fast path -mekanismi voidaan arvioida erikseen: paljonko opetusaikaa voidaan ohittaa ilman, että viiveellä mitattu osaaminen tai prerequisite-peitto heikkenee?

### 15.6 Kuinka tärkeä itse graafin laatu on?

Tämä on erityisen kiinnostava Sammakko-kysymys.

Prerequisite-edge voi olla:

- oikea,
- turhan tiukka,
- puuttuva,
- väärän vahvuinen.

Siksi osaamisverkko ei ole vain infrastruktuuria vaan itsessään empiirisesti parannettava pedagoginen malli. Oppimisdata voi myöhemmin osoittaa, että jokin oletettu hard prerequisite kannattaa muuttaa softiksi tai että jokin puuttuva välinooodi selittää systemaattista epäonnistumista.

---

# 16. Ehdotettu tutkimushypoteesi ja ensisijaiset päätulosmuuttujat

Sammakon pääkysymys:

> **Saavuttaako Sammakko saman tai paremman opetussuunnitelman mukaisen osaamisen, kun osaamista arvioidaan sekä viiveellä että uusissa soveltamistilanteissa, mutta lyhyemmällä aktiivisella opiskeluajalla kuin valitulla vertailumenetelmällä?**

Tätä ei kannata tiivistää yhdeksi epämääräiseksi “oppimistehokkuusindeksiksi”.

Kaksi ensisijaista päätulosmuuttujaa voisivat olla:

**A. Osaaminen vakioidun aktiivisen opiskeluajan jälkeen**

- viiveellä mitattu suoritus,
- soveltaminen uusiin tilanteisiin,
- opetussuunnitelman mukainen osaaminen.

**B. Aika ennalta määritellyn tavoitellun osaamistason saavuttamiseen**

Näiden lisäksi voidaan mitata esimerkiksi:

- välitön oppimistulos,
- prerequisite-aukkojen määrä,
- vihjeiden käyttö,
- virhekäsitysten korjaantuminen,
- keskeyttäminen,
- koettu kuormitus,
- motivaatio ja koettu autonomia,
- käytettävyys.

Pelkkää sovelluksessa vietettyä aikaa, XP:tä tai välitöntä tehtäväpistemäärää ei pidetä vaikuttavuuden päätuloksena.

---

# 17. Falsifioitavuus: milloin Sammakon perusidea ei saa tukea?

Sammakon tutkimusohjelma on mielekäs vain, jos myös epäonnistuminen on mahdollinen tulos.

Perusidea ei saa vahvaa tukea, jos esimerkiksi:

- samaan viiveellä mitattuun osaamiseen päästään yhtä nopeasti tai nopeammin yksinkertaisemmalla materiaalilla;
- hienojakoinen KC-graafi lisää kitkaa ilman oppimishyötyä;
- diagnostiikan virheet aiheuttavat enemmän väärää ohittamista kuin hyödyllistä nopeutusta;
- prerequisite-edgejen ylläpitokustannus ylittää niiden pedagogisen hyödyn;
- pelillinen käyttöliittymä häiritsee käsitteellistä oppimista;
- tuki tuottaa liiallista vihjeriippuvuutta;
- avoin sisältö osoittautuu hyvin siirrettäväksi mutta Sammakon runtime ei tuo siihen lisäarvoa.

Tällaiset tulokset eivät olisi epäonnistunutta tutkimusta. Ne kertoisivat, missä järjestelmän oletukset ovat väärin.

---

# 18. Tietosuoja ja tutkimusarkkitehtuuri

Sammakon ydintoimintojen on tarkoitus toimia myös paikallisesti ilman pilvitiliä.

Paikallinen versio voi säilyttää:

- oppijamallin,
- harjoitteluhistorian,
- review-jonon,
- asetukset

esimerkiksi selaimen paikallisessa tallennuksessa.

Pilvisynkronointi ja tutkimusdatan luovutus voidaan erottaa tästä opt-in-toiminnoiksi.

Tutkimusvalmiudessa keskeinen periaate on datan minimointi. Oppimistapahtumalla on oltava dokumentoitu käyttötarkoitus; nimeä, sähköpostia, diagnoosia tai muuta tarpeetonta henkilötietoa ei tarvitse sisällyttää itse learning eventiin.

Avoin Canonical Learning Content ja mahdollinen ViLLE-adapteri tarjoavat toisen polun: pedagogista sisältöä voidaan käyttää institutionaalisessa ympäristössä ilman, että Sammakon oman palvelun täytyy olla koulun käyttäjä- ja henkilötietoinfrastruktuurin keskus.

---

# 19. Agenttinen sisältötuotanto ei tarkoita automaattista julkaisemista

690 KC:n ympärille ei ole realistista rakentaa korkeatasoista sisältöä kokonaan käsin yksi kerrallaan, jos jokaisessa pitäisi olla:

- orientaatio,
- visualisointi tai manipulointi,
- selitys,
- malliratkaisu,
- vihjeportaat,
- itsenäisiä tehtäviä,
- soveltamistehtäviä,
- virhekäsitysmalli,
- perustaso,
- lisätuki,
- haastetaso,
- validointi ja lähdejälki.

Siksi Sammakon kehitys on suunniteltu agenttiseksi:

```text
suunnittelu
→ implementointi
→ automaattinen validointi
→ riippumaton review
→ korjaus
→ hyväksyntä
```

Tämä ei tarkoita, että kielimalli saisi päättää opetussuunnitelmasta tai matemaattisesta totuudesta.

Agentti voi tuottaa sisältöehdotuksia, mutta julkaisu edellyttää muun muassa:

- skeemavalidointia,
- prerequisite-validointia,
- determinististä solver-testausta,
- yksikkö- ja invarianssitestejä,
- lähteitä ja jäljitettävyyttä,
- visuaalista tarkistusta,
- tarvittaessa ihmisarviointia.

Tavoitteena ei ole automatisoida opettajaa pois, vaan tehdä laajan, hienojakoisen materiaalin systemaattinen tuottaminen ja ylläpito mahdolliseksi.

---

# 20. Mikä Sammakko ei ole?

Sammakko ei ole:

- chatbot, joka arvaa oppilaan tason keskustelusta;
- oppikirjan PDF pelillisellä kuorella;
- pelkkä tehtävägeneraattori;
- järjestelmä, jossa ensimmäinen oikea vastaus tarkoittaa osaamista;
- tekoäly, joka itse päättää numeerisen vastauksen oikeellisuudesta;
- järjestelmä, joka kerää diagnooseja tarjotakseen tukea;
- “vaikeustaso 3 = samat laskut suuremmilla numeroilla”;
- tutkimusväite siitä, että digitaalinen oppiminen olisi automaattisesti opettajaa parempaa.

Sammakko on yritys rakentaa **läpinäkyvä, testattava ja muokattava oppimisen infrastruktuuri**, jossa opetussuunnitelma, osaamisriippuvuudet, oppilaan näyttö ja pedagoginen toiminta voidaan erottaa toisistaan ja yhdistää uudelleen eksplisiittisin säännöin.

---

# 21. Miksi tämä voisi olla merkityksellistä?

Jos Sammakon hypoteesi ei pidä paikkaansa, syntyy silti mahdollisesti hyödyllinen avoin osaamisverkko, tehtävä- ja lesson blueprint -kokoelma sekä systemaattinen tapa jäljittää digitaalinen STEM-oppimateriaali opetussuunnitelmaan.

Jos hypoteesi pitää osittain paikkansa, voidaan ehkä vähentää:

- jo osatun asian turhaa harjoittelua,
- prerequisite-aukkojen päälle rakentamista,
- yhden tahdin pakkoa,
- tuen ja tavoitteiden tarpeetonta sekoittamista.

Jos se pitää vahvasti paikkansa, kiinnostava tulos ei olisi se, että “peli opettaa paremmin”, vaan että **eksplisiittinen osaamisverkko, evidenssipohjainen adaptointi ja viive-/soveltamisperusteinen mastery voivat parantaa opetussuunnitelman mukaisen osaamisen aika–laatu-suhdetta**.

Juuri tämä on Sammakon tutkimisen arvoinen väite.

---

# 22. Johtopäätös

Sammakon perusajatus voidaan tiivistää yhteen lauseeseen:

> **Älä kysy ensisijaisesti, minkä vuosiluokan materiaalia oppilaan pitäisi tehdä, vaan mikä on seuraava pienin merkityksellinen asia, jonka hänen kannattaa oppia — ja millainen näyttö osoittaa, että se myös säilyy ja siirtyy uuteen tilanteeseen.**

Sammakko pyrkii rakentamaan tämän kysymyksen ympärille kokonaisen järjestelmän:

- opetussuunnitelmaan jäljitettävä osaamisverkko,
- prerequisite-suhteet,
- KC-kohtainen oppijamalli,
- support/core/challenge-polut,
- deterministisesti validoidut STEM-tehtävät ja simulaatiot,
- viivekertaus,
- soveltamistehtävät,
- pelillinen mutta ei manipuloiva käyttöliittymä,
- avoin Canonical Learning Content,
- erillinen Sammakko-runtime.

Sen arvoa ei lopulta ratkaise arkkitehtuurin eleganssi eikä noodien määrä. Sen ratkaisee empiirinen kysymys:

**oppivatko oppilaat paremmin, pysyvämmin ja/tai nopeammin?**

Siksi Sammakon tavoite ei ole ainoastaan rakentaa oppimissovellusta. Tavoitteena on rakentaa järjestelmä, jonka keskeiset pedagogiset oletukset ovat riittävän eksplisiittisiä, jotta niitä voidaan myös tutkia, kumota ja parantaa.

---

# Kirjallisuutta ja taustaa

Atkinson, R. K., Renkl, A. & Merrill, M. M. (2003). *Transitioning From Studying Examples to Solving Problems: Effects of Self-Explanation Prompts and Fading Worked-Out Steps.* Journal of Educational Psychology, 95(4), 774–783. [DOI](https://doi.org/10.1037/0022-0663.95.4.774)

CAST (2024). *Universal Design for Learning Guidelines version 3.0.* [Avaa lähde](https://udlguidelines.cast.org/)

Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T. & Rohrer, D. (2006). *Distributed practice in verbal recall tasks: A review and quantitative synthesis.* Psychological Bulletin, 132(3), 354–380. [DOI](https://doi.org/10.1037/0033-2909.132.3.354)

Ma, W., Adesope, O. O., Nesbit, J. C. & Liu, Q. (2014). *Intelligent tutoring systems and learning outcomes: A meta-analysis.* Journal of Educational Psychology, 106(4), 901–918. [DOI](https://doi.org/10.1037/a0037123)

Renkl, A., Atkinson, R. K. & Große, C. S. (2004). *How Fading Worked Solution Steps Works – A Cognitive Load Perspective.* Instructional Science, 32, 59–82. [DOI](https://doi.org/10.1023/B:TRUC.0000021815.74806.F6)

Roediger, H. L. & Karpicke, J. D. (2006). *Test-Enhanced Learning: Taking Memory Tests Improves Long-Term Retention.* Psychological Science, 17(3), 249–255. [DOI](https://doi.org/10.1111/j.1467-9280.2006.01693.x)

Rohrer, D., Dedrick, R. F., Hartwig, M. K. & Cheung, C.-N. (2020). *A randomized controlled trial of interleaved mathematics practice.* Journal of Educational Psychology, 112(1), 40–52. [DOI](https://doi.org/10.1037/edu0000367)

Ryan, R. M. & Deci, E. L. (2000). *Self-determination theory and the facilitation of intrinsic motivation, social development, and well-being.* American Psychologist, 55(1), 68–78. [DOI](https://doi.org/10.1037/0003-066X.55.1.68)

Sailer, M. & Homner, L. (2020). *The Gamification of Learning: a Meta-analysis.* Educational Psychology Review, 32, 77–112. [DOI](https://doi.org/10.1007/s10648-019-09498-w)

Sweller, J. (1988). *Cognitive Load During Problem Solving: Effects on Learning.* Cognitive Science, 12(2), 257–285. [DOI](https://doi.org/10.1207/s15516709cog1202_4)

VanLehn, K. (2011). *The Relative Effectiveness of Human Tutoring, Intelligent Tutoring Systems, and Other Tutoring Systems.* Educational Psychologist, 46(4), 197–221. [DOI](https://doi.org/10.1080/00461520.2011.611369)

---

## Dokumentin asema

Tämä white paper kuvaa Sammakon nykyistä suunnittelusuuntaa. Se ei ole tutkimustulos, lopullinen tekninen spesifikaatio eikä väite siitä, että nykyinen noin 690 KC:n verkko olisi jo empiirisesti validoitu. Noodit, prerequisite-suhteet, mastery-säännöt ja pedagogiset blueprintit ovat tutkimus- ja kehityshypoteeseja, joita on tarkoitus korjata lähdeauditoinnin, asiantuntija-arvioinnin, käyttäjätestien ja oppimistulosten perusteella.