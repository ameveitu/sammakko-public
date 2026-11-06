# Sol-integraatio

Päivitetty 27.10.2026. Sisältöversio `lite181-2026-10-27`.

## Tila lyhyesti

- **Solin suunnittelukortit (slice52) on tuotu huomautuksina, ei sisältönä.** `node tools/import-sol.mjs <slice52_design_cards.json>`
  kirjoittaa `src/data/sol-annotations.json` (lähteen sha256 `0e1d7c521773…`): 52 korttia, joista 44 on pelkkiä
  suunnittelukortteja (ei tuotantolupaa) ja 8 korjausehdotuksia nykyisiin oppitunteihin. Kaikki 52 ovat näiden 181
  noodin joukossa, ja niiden muuttumattomiksi ilmoitetut ryhmät vastaavat graafia (testi). Aikuiselle-sivu näyttää kortin
  noodin rivillä ja alatunniste lähteen tiivisteen; vienti kirjaa sen. **Yhtään oppituntia ei ole muutettu korttien perusteella.**
- Sol 6.1:n mikropeliehdotuksia (690 KC) ei ole vastaanotettu. Kaikki 181 oppituntia ovat tämän MVP:n omaa, kilpailevaa pedagogista sisältöä
  ("KC oppitunteina"). Lähteet on kuvattu tiedostossa [docs/PEDAGOGY_REFERENCES.md](docs/PEDAGOGY_REFERENCES.md).
- Solin auditointiaineistosta on luettu vain yleiset periaatteet: hyväksymisrubriikki (06) ja yhteiset
  korjausperiaatteet X01–X07 (07). Niitä on käytetty tarkistuslistana, ei sisältönä.
- Puuttuva Sol-erä ei estä ajonaikaista työtä. Peli toimii ilman sitä.

## Vastuunjako

| Sol omistaa | Lite (Opus) omistaa |
|---|---|
| Tavoitteet, selitykset ja käsitteiden merkitys | Sovellus, maailmat, kartta ja tarina |
| Esimerkit ja vastausten perustelut | Vuorovaikutustyypit ja tarkistus (`check.ts`) |
| Virhekäsitykset ja tukioletukset | Näyttösäännöt, eteneminen ja päättely (`evidence.ts`, `store.ts`) |
| Aktiviteettiehdotukset (mikropelit) | Sovitin Solin materiaalista `NodeSpec`-muotoon, palaute ja vienti |

Jos Solin ja Liten sisältö on ristiriidassa pedagogisessa kysymyksessä, Solin materiaali voittaa.
Liten oma sisältö jää vertailukohdaksi.

## Liitosavaimet

- **KC-tunniste** (esim. `M-NUM-01`) on pysyvä avain. Se on sama kuin kanonisessa 690 noodin graafissa.
- **Sisältöversio**: `CONTENT_REV` (`src/content/index.ts`) ja noodikohtainen `NodeSpec.rev`.
  Jokainen vastaus kirjaa version kenttään `rev`, joten vanhan ja uuden materiaalin vastaukset erottuvat
  viennissä.
- Kun Solin materiaali otetaan noodiin käyttöön, noodin `rev` vaihdetaan muotoon `sol-<erä>-<pvm>`.

## Sovittimen raja

Solin materiaali tuodaan sisään vain tämän rajapinnan kautta (`src/engine/types.ts`):

- `NodeSpec`: `stop`, `icon`, `intro`, `reward`, `goal`, `rev`, `demo(r)` ja `item(r, phase)`.
- `Item`: `say`, `scene`, `task`, `hint`, `explain`, `tag` ja valinnainen `listen`.
- `Task` on yksi kahdeksasta vuorovaikutustyypistä: choice, multi, tapcount, place, ribbons, numeric, line ja plot.
  Tarkistus tehdään aina `check.ts`:ssä, ei sisällössä.
- `tag` on tehtäväperhe. Tarkistettu tila vaatii vähintään kaksi eri perhettä, joten Solin
  aktiviteettien täytyy nimetä perheensä.

## Integraatio-oletukset

1. Solin tuotoksen tarkka muoto tarkistetaan ennen sovittimen kirjoittamista. Muotoa ei arvata etukäteen.
2. Solin selitykset ja virhekäsitykset korvaavat noodin `explain`- ja `hint`-tekstit. Vuorovaikutus säilyy,
   ellei Sol ehdota tyyppiä, joka sopii johonkin kahdeksasta.
3. Uusi vuorovaikutustyyppi on oma, erikseen testattava muutos. Sitä ei lisätä sovittimen sisällä.
4. Kanoniset kaaret pysyvät graafin omistuksessa. Solin aktiviteetti, joka käyttää toista taitoa, kirjataan
   tehtävätason kattavuusriviksi (kuten nykyiset 11 riviä), ei uudeksi esitietokaareksi.
5. Turvallisuusnoodi pysyy virtuaalisena. Fyysistä osaamista ei väitetä, vaikka Sol ehdottaisi käytännön työtä.
6. Solin ehdotukset muille kuin näille 181 noodille eivät avaa uusia noodeja. Ne odottavat seuraavaa laajennusta.

## Periaatteet X01–X07 Litessä

| Periaate | Miten Lite vastaa nyt | Mitä puuttuu |
|---|---|---|
| X01 Opetusjakso ei ole arviointisivu | Jokaisessa oppitunnissa on esittely, malliesimerkki ("Näytä ensin"), ohjattu vaihe, itsenäinen vaihe ja siirtotehtävä | Opettajan tarkistus |
| X02 Tukipolku ei ole helpompi koe | Ohjatussa vaiheessa näkyy vihje (83 noodissa valmis vihje), ja väärä vastaus näyttää päättelyn. Tukiretki vie esitietoon ja takaisin | Vihje puuttuu 94 noodin ohjatusta vaiheesta |
| X03 Näkyvä matemaattinen toiminta | Kuvat, nauhat, lukusuora ja raahaaminen noin 30 noodissa. Muissa valinta tai numeronäppäimistö | Monessa noodissa toiminta on valinta |
| X04 Kohderyhmä ja sanasto | Kohderyhmä on lukeva lapsi, ääni on valinnainen. Lapselle näkyvät paikkojen nimet, ei opetussuunnitelman termejä | Ymmärrettävyyskierros lasten kanssa |
| X05 Tekninen näyttö ei ole vaikuttavuutta | Tilat nimetään varovasti ("tarkistettu", ei "osaa"). Aikuisen näkymä erottaa avun, päättelyn ja vaikeuden | Pilotti (PILOT.md) |
| X06 Uusi tarina ei ole uusi näyttö | Näyttö lasketaan perheistä (`tag`), ei tehtävän tunnisteesta tai tarinasta | – |
| X07 Muiden KC:iden luettelo ei ole oppikirja | Lisätyt 70 noodia ovat omia oppitunteja, eivät linkkilistoja | – |

## Tehdyt materiaalikorjaukset (omat, ei Solin)

- Kierrokset 1–3 (ARVIO.md): ääni, tarina, sumu ja navigointi.
- Kierros 4: 70 uutta oppituntia sulkeumaan, virhekäsityksiin perustuvat väärät vaihtoehdot
  (desimaalit, kirjallinen laskeminen, algebra), tukiretki ja paluu, reppu ja luvun löydöt.

## Odottaa

- Sol 6.1:n mikropeliehdotukset näille 181 noodille ja muodon tarkistus.
- Päätös 8 korjausehdotuksen toteuttamisesta (jokainen oma muutos, uusi `rev`).
- Sisältösovitin, kun mikropelien muoto tunnetaan (nykyinen `src/content/sol.ts` lukee vain huomautukset).
- Opettajan tai sisältöasiantuntijan tarkistus (rubriikin vaihe 2).
- Ymmärrettävyyskierros lasten kanssa (rubriikin vaihe 3): **ei vielä kerätty**.
