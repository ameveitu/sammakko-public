# Pedagogiset verrokit

Ennen 70 uuden oppitunnin kirjoittamista haettiin verkosta verrokkitehtäviä ja tutkimusohjeita.
Ne ovat hakujen kautta löydettyjä lähteitä, **eivät järjestelmällinen kirjallisuuskatsaus**.
Lähteistä otettiin rakenne ja virhekäsitykset, ei tehtävätekstejä.

## Yleiset periaatteet

| Lähde | Mitä otettiin |
|---|---|
| IES/WWC Practice Guide 26, *Assisting Students Struggling with Mathematics* (2021). https://ies.ed.gov/ncee/wwc/PracticeGuide/26 | Järjestelmällinen opetus: malliesimerkki → ohjattu → itsenäinen. Lukusuora ja kuvat, sanalliset tehtävät rakenteen kautta, laskusujuvuus päivittäisenä harjoitteluna. |
| IES/WWC Practice Guide 1, *Organizing Instruction and Study to Improve Student Learning* (2007). https://ies.ed.gov/ncee/wwc/PracticeGuide/1 | Hajautettu kertaus ja muistihaku: muistettu-tila vaatii ≥ 20 h tauon. Ratkaistut esimerkit vuorottelevat tehtävien kanssa. |
| IES/WWC Practice Guide 20, *Teaching Strategies for Improving Algebra Knowledge* (2015). https://ies.ed.gov/ncee/wwc/PracticeGuide/20 | Ratkaistujen esimerkkien vertailu, rakenteen huomaaminen ja vaihtoehtoiset ratkaisutavat (Kirjainpaja, Yhtälöt). |
| Opetushallitus, perusopetuksen opetussuunnitelman perusteet (ePerusteet). https://eperusteet.opintopolku.fi/eperusteet-service/api/perusteet/419550/kaikki | Vuosiluokkien sijoittelu ja sanasto (desimaalipilkku, yksiköt). |

## Rantaretki (1.–2. lk)

| Lähde | Luvut | Mitä otettiin |
|---|---|---|
| NCETM Early Years: cardinality and counting. https://www.ncetm.org.uk/classroom-resources/ey-cardinality-and-counting/ | Laskuloru | Viimeinen luku kertoo määrän, yksi yhteen -vastaavuus, laskeminen koskettaen. |
| NCETM Early Years: composition. https://www.ncetm.org.uk/classroom-resources/ey-composition/ | Kymppilautta, Simpukkaranta | Lukujen hajottaminen, kymppikehys ja kymppiparit. |
| NCETM Early Years: measures. https://www.ncetm.org.uk/classroom-resources/ey-measures/ | Mittaripaja | Suora vertailu ennen yksiköitä, yhtä pitkän alkukohdan merkitys. |
| Topmarks: number fact families within 10. https://www.topmarks.co.uk/worksheet/227/number-fact-families-within-10 | Merkkipaja, Kymppilautta | Laskuperheet ja vaihdannaisuus, vähennyslasku yhteenlaskun kautta. |
| AAMT Top Drawer: multiplication generalisations. https://topdrawer.aamt.edu.au/Mental-computation/Good-teaching/Multiplication-and-division/Making-generalisations | Kertopaja | Ryhmät ja suorakulmio, vaihdannaisuus, tuplaukset. |

`src/content/facts.ts`: kymppiparit, vaihdannaisuus, tuplat, kympin ylitys ja "ajattele yhteenlaskua".

## Aarresaaristo (3.–6. lk)

| Lähde | Luvut | Mitä otettiin |
|---|---|---|
| Oak National: column subtraction with regrouping. https://thenational.academy/teachers/programmes/maths-primary-ks2/units/column-subtraction/lessons/subtract-from-a-2-digit-number-using-column-subtraction-with-regrouping | Laivaveistämö (kirjallinen laskeminen) | Lainaus näkyvänä vaihtona. Virhe "pienempi suuremmasta" väärinä vaihtoehtoina. |
| NCETM Year 5, Unit 1: decimal fractions. https://www.ncetm.org.uk/classroom-resources/cp-year-5-unit-1-decimal-fractions/ | Helmisimpukka (desimaalit) | Kymmenesosapalkki ja sadasosaruudukko ennen symboleja. |
| IES REL, fractions grade 6 overview. https://ies.ed.gov/ncee/rel/fractions-grade-6/pdf/PracticeGuideOverview.pdf | Piirakkajuhla | Murtoluku on luku lukusuoralla. Nimittäjien yhteenlasku on yleinen virhe. |
| Oak National: diagonal lines of symmetry. https://thenational.academy/teachers/programmes/maths-primary-ks2/units/symmetry-in-2d-shapes/lessons/diagonal-lines-of-symmetry | Aarresaari (symmetria) | Myös vinot symmetria-akselit. |
| NRICH: Hidden Gems. https://nrich.maths.org/content/id/12872/Hidden | Tutkimusasema | Järjestelmällinen etsiminen. |
| Cambridge Mathematics Espresso 31: introduction to combinations. https://www.cambridgemaths.org/Images/espresso_31_introduction-to-combinations.pdf | Tutkimusasema | Järjestelmällinen luettelointi ennen kertolaskusääntöä. |

`src/content/decimals.ts`: "pidempi on suurempi" (0,45 > 0,5), "0,30 ≠ 0,3", 0,07 vs 0,7 ja oikealle tasaaminen.
`src/content/written.ts`: "pienempi suuremmasta", unohtunut nolla, unohtunut muistinumero, nimittäjien yhteenlasku,
"−7 > −3" (Jäälahti) ja laskeminen tiukasti vasemmalta oikealle.

## Lampilaboratorio (7.–9. lk)

| Lähde | Luvut | Mitä otettiin |
|---|---|---|
| Klingbeil & Moons (2025), *Educational Studies in Mathematics*. 2 220 oppilasta, luokat 7–8. https://link.springer.com/article/10.1007/s10649-025-10428-7 | Kirjainpaja | Kirjain esineenä ("a tarkoittaa omenaa") virhekäsityksenä. Kirjain tuntemattomana ja muuttujana. |
| Warren (1998), MERGA-konferenssi. | Kirjainpaja | "3x, kun x = 4, on 34" ja muut sijoitusvirheet. |
| Manes, *Mathematics for Elementary Teachers*, 6.7 Dividing fractions: meaning. https://math.libretexts.org/Courses/Teachers_College_Columbia_University/Book%3A_Mathematics_for_Elementary_Teachers_(Manes)/06%3A_Fractions/6.07%3A_Dividing_Fractions-_Meaning | Yhtälöt ja verrannot | Jakolasku kysymyksenä "montako ryhmää mahtuu". Virhe "jakaminen pienentää aina". |
| BIPM, SI Brochure. https://www.bipm.org/en/publications/si-brochure | Suureet ja yksiköt | Suure, lukuarvo ja yksikkö sekä yksikkömerkinnät. |
| OpenStax Physics 4.2, Newton's first law. https://openstax.org/books/physics/pages/4-2-newtons-first-law-of-motion-inertia | Liike ja nopeus, Kiihtyvyys | Liikkeen kuvaaminen ennen kaavoja. |
| ACS Middle School Chemistry, chapter 1 lesson 1. https://www.acs.org/middleschoolchemistry/lessonplans/chapter1/lesson1.html | Pakkasloki | Havainnosta selitykseen. |
| IU Pressbooks, *STEM for Educators*: lab safety. https://iu.pressbooks.pub/stemforeducators/?p=333 | Turvallisuusohje (Rantaretki / Havaintovihko) | Ohjeiden lukeminen ennen työtä. **Lite opettaa vain virtuaalisen valinnan eikä väitä fyysistä osaamista.** |

`src/content/algebra79b.ts`: kirjain esineenä, "3x, kun x = 4, on 34", "jakaminen pienentää aina",
nimittäjien yhteenlasku ja merkkisäännöt ilman merkitystä.

## Rajoitukset

- Lähteitä ei ole arvioitu järjestelmällisesti. Valinta perustuu hakuihin ja tunnettuihin virhekäsityksiin.
- Tehtäviä ei ole vielä testattu lapsilla eikä opettaja ole tarkistanut niitä (ks. PILOT.md ja SOL_INTEGRATION.md).
