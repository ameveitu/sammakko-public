# Sammakko Lite

Kevyt, itsenäinen Sammakko-toteutus 181 noodin suljetulle aligraafille. Jokainen noodi on pelattava
oppitunti kolmessa maailmassa, jotka kulkevat 1. luokalta 9. luokalle.

**Kenelle:** lapsille, jotka lukevat lyhyttä suomenkielistä tekstiä. Ohjeiden ääneen lukeminen on
valinnaista (fi-FI-puheääni). Hiljainen tila 🔇 toimii kokonaan ilman ääntä.

| Maailma | Luokat | Oma luku | Pohjatarkistus | Luvut |
|---|---|---|---|---|
| Rantaretki | 1.–2. | 73 | – | Laskuloru, Mittaripaja, Eväsretki, Hyppykivet, Merkkipaja, Simpukkaranta, Kymppilautta, Kertopaja, Rantakioski, Lajittelulaituri, Havaintovihko |
| Aarresaaristo | 3.–6. | 60 | 22 | Aarresaari, Jäälahti, Laivaveistämö, Kertomajakka, Helmisimpukka, Saaren tori, Piirakkajuhla, Vaakasaari, Tutkimusasema |
| Lampilaboratorio | 7.–9. | 48 | 16 | Suureet ja yksiköt, Liike ja nopeus, Kirjainpaja, Yhtälöt ja verrannot, Funktiot ja suorat, Mittausdata ja kuvaajat, Pakkasloki, Kiihtyvyys |

73 + 60 + 48 = 181. Jokainen noodi kuuluu yhteen lukuun. Pohjatarkistus näyttää saman noodin
uudelleen myöhemmän maailman alussa: se on aina auki, ja se kuitataan pikatarkistuksella (2 oikein).

```bash
npm install
npm run dev      # http://127.0.0.1:5200
npm run check    # tyypit + 1585 testiä
npm run build    # tuotantoversio hakemistoon dist/
node tools/build-graph.mjs --check   # graph.json vastaa jäädytettyä manifestia
node tools/coverage-report.mjs       # kirjoittaa COVERAGE.md:n uudelleen
node tools/import-sol.mjs <slice52_design_cards.json>   # Solin suunnittelukortit merkinnöiksi
```

## Laajuus

- Manifesti: `reference/mvp-scope-181.json`. Se on alkuperäinen 177 noodin manifesti (`reference/mvp-scope.json`,
  sha256 `58f7ca8b…`) ja katselmoinnin lisäys `reference/scope-addendum-181.json`: neljä oppituntia
  (mittaaminen yksiköllä `M-MEAS-04`, kellotaulu `M-TIME-02`, piiri `M-GMEAS-01`, samannimisten murtolukujen vähennys `M-FRAC-12`).
  Alkuperäisessä 177:ssä on kaikki aiemmat 107 ja 70 lisäystä. Lisäykset ovat pakollisten ja vahvojen suhteiden rekursiivinen sulkeuma,
  turvallisuusohje mukaan lukien. Jokaisen lisäyksen peruste ja todisteketju ovat [COVERAGE.md](COVERAGE.md):ssä.
- `src/data/graph.json` rakennetaan manifestista (`tools/build-graph.mjs`). Suhdetyypit, all_of/any_of-ryhmät,
  dynaamiset säännöt ja turvallisuusmetatieto säilyvät. Takaperoisia kaaria ei lisätä.
- Tehtävätason kattavuus (11 riviä, esim. yhtälötehtävä käyttää negatiivista jakolaskua) on erillään
  kanonisista kaarista. Se ei lukitse eikä päättele mitään.
- Turvallisuus on pieni virtuaalinen oppitunti (ohjeiden lukeminen ja valinta). Se ei väitä mitään
  fyysisestä työskentelytaidosta, ei lukitse mitään eikä tule päätellyksi.

## Lähtöoletukset ja eteneminen

- Lapsi valitsee alueen. Ensimmäiseen tehtävään pääsee kahdella painalluksella: alue → **⚡ Suoraan tehtävään** (avaa seuraavan paikan ensimmäisen tehtävän; ohjatussa tehtävässä apu on heti saatavilla). **Jatka seikkailua** kulkee esittelyn ja esimerkin kautta: ensimmäiseen tehtävään on silloin 3–6 painallusta esimerkin pituudesta riippuen. Palaava lapsi pääsee kartalta tehtävään yhdellä painalluksella.
- Alueiden väliset riippuvuudet näkyvät merireitteinä: alueen kartalla luvun alla (⛵ n → Labraan) ja aluevalinnan **Koko maailma** -näkymässä.
- Mikään tie ei ole kokonaan lukossa. Lukittuun paikkaan voi aina hypätä (**Hyppää tänne**) vahvistuksen jälkeen.
- Tilat: *tarkistettu* ⭐, *muistettu* ⭐⭐, *harjoiteltu avulla* 🤝, *päätelty* ☆, *myöhemmäksi* 🕒,
  *viime aikoina vaikeaa* ! ja *ei vielä tarkistettu*. Määritelmät ovat [DESIGN.md](DESIGN.md):ssä.
  Todennäköisyysmallia ei käytetä.
- Avaaminen, ohittaminen ja Myöhemmin eivät koskaan kerrytä suoritusta.

## Lentopaja (pelikaari)

- Kartan yläpalkista tai aluevalinnasta: **🛠️ Lentopaja**. Neljä paikkaa: paja (keskus), ranta, mittausrata ja näköalapaikka.
  Loikka hyppää napautettuun kohtaan. Aava (ankanpoikanen) ja Sulka (harmaasininen haikara, lasit ja laboratoriotakki) ovat eri hahmoja.
- Kolme osaa: runko (ranta, heti hyödyllinen: sillä voi ajaa pajassa), siivet ja potkuri (mittausrata). Jokaisella tehtävällä on kaksi reittiä:
  **ohjattu** (opetellaan oppitunti avun kanssa, 2 oikein tehtävän sisällä) ja **suora** (pikatarkistus myöhemmästä oppitunnista).
  Molemmat antavat saman osan, mutta reitti ja oppitunti kirjataan eri tavalla.
- Kun kaikki osat on asennettu, lennetään saarelle. Siipien valinta vaihtaa reitin (leveät: Lokkikallion yli, kapeat: Kivikaaren läpi).
  Lento on leikkiä, ei fysiikan koe, eikä siitä tallennu osaamista. Raketti on vain seuraava unelma.
- Herkut kasvattavat Loikkaa enintään kaksi kokoa. Nälkää ei ole. Pitkä loikka nopeuttaa vain liikkumista maailmassa, ei koskaan kokeita.
- Pelin tila (`save.game`, testaajalla `save.testerGame`) on erillään vastauksista. Osa annetaan kerran, vain tehtävän sisällä annetuista
  vastauksista. Uusinnat ja päätellyt esivanhemmat eivät anna mitään. Vanhan tallenteen palkinnot kopioidaan kerran `legacy`-merkinnällä.
- Kartta, aiheet ja suora pääsy oppitunteihin säilyvät ennallaan.

## Liike ja aika

- 21 liike- ja aikaoppituntia käyttää yhteistä soitinta (`src/ui/motion.ts`, `src/engine/motion.ts`): rata, sekuntikello, viivain,
  taulukko, nopeusmittari ja kuvaajat lukevat saman skenaarion ajan. Oppitunti näyttää vain näkymiä, joiden taito on jo opetettu.
- Jokainen vastaus kirjaa skenaarion (`scn`), joten tehtävä on jälkikäteen tarkistettavissa. Versio `motion1-2026-10-27`.

## Tallennus

- Tila on vain tämän selaimen localStoragessa (avain `sammakko-lite-2`, tallennemuoto v2). Laitteella on yksi oppija.
- Vanha v1-tallenne muunnetaan varovasti: vastaukset säilyvät `legacy`-merkinnällä ja tilat lasketaan uudelleen.
- Jos tallennus ei onnistu, peli toimii muistissa, ja kartalla näkyy siitä kertova huomautus.
- Jos tallenne on osin rikki, ehjät vastaukset säilytetään. Jos sitä ei voi lukea, aloitetaan tyhjästä. Kummassakin tapauksessa
  alkuperäinen kopioidaan avaimeen `sammakko-lite-2-unreadable`, ja kartta ja Aikuiselle-sivu kertovat siitä.
- **Aikuiselle**-sivulla: tilojen selitys, koko aligraafi (vedä siirtääksesi, valinta korostaa esihistorian juuriin asti), taulukko, muistiinpanot, testaajatila
  (testidata ja testipeli pidetään erillään; **Nollaa testidata** poistaa ne), tila *aiemmassa versiossa tehty*
  (tehtävä on muuttunut, vanha suoritus ei ole nykyinen tarkistus), Solin suunnittelukortit merkintöinä ja **Vie tiedot (JSON)**.
  Viennissä on jokaisen vastauksen KC, sisältöversio, tehtäväperhe (`tag`), siemen, vastaus, vaihe, apu, istunto ja aika.

## Hakemistot

- `src/game/`: Lentopajan tila, tehtävät ja lento (ei näyttöä).
- `src/engine/`: graafi, näyttösäännöt (`evidence.ts`), tarkistus (`check.ts`) ja tallennus (`store.ts`).
- `src/content/`: yksi `NodeSpec` per noodi (tavoite, esittely, malliesimerkki, tehtävägeneraattori, siirtotehtävä
  ja palkinto). `world.ts` sisältää maailmat, luvut, löydöt ja jonon.
- `src/ui/`: kartta, oppitunti, tehtävätyypit, liikesoitin, Lentopaja (`paja.ts`, `flight.ts`), puhe ja aikuisen graafi.
- `reference/`: jäädytetty manifesti, kanoninen 690 noodin graafi ja MVP-tavoitteet (vain luettavaksi).
- `qa/screens/`: selainkuvat. Testausselostus on [QA.md](QA.md):ssä.

Lisää: [DESIGN.md](DESIGN.md) (periaatteet), [COVERAGE.md](COVERAGE.md) (181 noodia),
[SOL_INTEGRATION.md](SOL_INTEGRATION.md) (Sol-materiaalin tila),
[docs/PEDAGOGY_REFERENCES.md](docs/PEDAGOGY_REFERENCES.md) (verrokkitehtävät), [PILOT.md](PILOT.md)
(pilotti ja ensivaikutelmat) ja [ARVIO.md](ARVIO.md) (kierrosarviot).
