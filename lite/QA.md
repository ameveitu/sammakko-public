# QA: kehittäjän tarkistukset

Päivitetty 27.10.2026, sisältöversio `lite181-2026-10-27` (liikeoppitunnit `motion1-2026-10-27`). Tarkistukset on tehnyt kehittäjä (agentti).
**Tämä ei ole osallistujanäyttöä.** Lasten ja opettajien palautetta ei ole vielä kerätty (ks. PILOT.md).

## Automaattiset tarkistukset

```bash
npm run check                        # tsc + vitest: 11 tiedostoa, 1585 testiä
npm run build                        # tuotantoversio (varoitus: yli 500 kB:n osa)
node tools/build-graph.mjs --check   # graph.json vastaa manifestia (181 noodia)
node tools/coverage-report.mjs       # COVERAGE.md
```

Testit kattavat:

- **manifestin**: 181 tunnistetta (177 + 4 katselmointilisäystä), kaikki 107 aiempaa mukana, sulkeutuneisuus pakollisten ja vahvojen suhteiden suhteen, lisäysten perusteet, ei takaperoisia kaaria;
- **näyttösäännöt** (`tests/engine.test.ts`);
- **etenemisen** (`tests/progress.test.ts`): päättely vain all_of-ryhmistä lähde nimettynä, ohjattu suoritus avun kanssa, myöhemmäksi ei ole suoritus, testaajadata erillään, tukiretket, maailma, tallennus, v1-muunnos ja vienti;
- **pelin** (`tests/game.test.ts`): myöntö vain tehtävän sisällä, idempotenssi, uusinta ja päätelty esivanhempi eivät anna osaa, ohjattu ja suora reitti antavat saman osan eri kirjauksella, vanhat löydöt kopioidaan kerran lähteineen, herkkujen raja, siipivalinta vaihtaa reitin, lento päättyy aina saarelle, koeoppitunnit eivät lue pelin tilaa;
- **liikesoittimen**: yksi kello kaikille näkymille, näkymä vain opetetulle taidolle (21 noodia), skenaario kirjautuu;
- **Sol-kortit** (`tests/sol.test.ts`): 52 korttia, kaikki laajuudessa, ryhmät vastaavat graafia, eivät korvaa sisältöä;
- **jokaisen noodin generaattorin** kaikissa vaiheissa: tehtävät ovat ratkaistavissa, oikea vastaus läpäisee tarkistuksen, ja itsenäisiä perheitä on vähintään kaksi.

## Selainpolut

Kehityspalvelin (`npm run dev`, portti 5200) ja tuotantoesikatselu (portti 5201).
Näkymäkoot 390×844 ja 1280×900. Kuvat ovat hakemistossa `qa/screens/`.

| Polku | Mitä tarkistettiin | Kuva |
|---|---|---|
| Ensikäynti | Alueen valinta → **Jatka seikkailua** → ensimmäinen tehtävä kahdella painalluksella | 390-01 |
| Virhe ja apu | Väärä vastaus näyttää päättelyn. Kahden virheen jälkeen tulee kolme valintaa | 390-03, 1280-03 |
| Tukiretki ja paluu | **Harjoittele pohjaa** vie esitietoon, ja **Palaa: …** tuo alkuperäiseen aiheeseen | 390-04 |
| Uusintaharjoitus | **Harjoittele lisää** antaa 5 uutta tehtävää vaiheella `practice` | 390-05 |
| Hyppy | Vahvistusikkuna nimeää ohitettavat paikat ("ja N muuta") | 390-06 |
| Päätelty esihistoria | Tarkistettu hyppy merkitsee all_of-esivanhemmat ☆:llä ja nimeää lähteen | 390-07, 1280-02 |
| Myöhemmin | 🕒-merkki, paikka siirtyy jonon loppuun eikä loista | 390-08, 1280-02 |
| Tallennus ei onnistu | Huomautus kartalla, peli jatkuu muistissa | 390-09 |
| Hämmentävä tehtävä | Ilmoitus kirjautuu tapahtumaksi, jossa on noodi, siemen ja perhe | 390-10 |
| Testaajatila | Huomautus kartalla ja Aikuiselle-sivulla, vastaukset `syn: true` | 390-11 |
| Maailmanvalinta (työpöytä) | Kolme maailmaa, edistyminen | 1280-01 |
| Aikuisen muistiinpanot ja tapahtumat | Muistiinpano tallentuu, ja tapahtumat näkyvät | 1280-04 |
| Aikuisen graafi | Koko 181 noodin aligraafi tiloineen | 1280-05 |
| Muistihaku epäonnistuu ja yritetään heti uudelleen | Kehityskellolla +1 vrk: väärä haku → heti oikea ei palauta muistettua tilaa, ja "muistihaku epäonnistui" näkyy aikuiselle | ei kuvaa (tarkistettu tekstinä) |
| Uudelleenlataus | Tila säilyy (localStorage `sammakko-lite-2`) | ei kuvaa |
| Vienti | **Vie tiedot (JSON)**: versiot, vastaukset (rev, node, phase, ok, tag, seed, resp, mode, sess, at, help) ja tapahtumat | ei kuvaa |
| Hiljainen tila | 🔇 vaientaa puheen, ja kuuntelutehtävät vältetään | ei kuvaa |
| Alueen vaihto | **Vaihda** säilyttää kaikkien maailmojen tilan | ei kuvaa |
| Aikuisen graafin siirtely | Hiirellä vetäminen siirtää näkymää (testattu: 300 px / 150 px), Ctrl/⌘ + rulla zoomaa osoittimen kohdalta, kosketus vierittää | ei kuvaa (tarkistettu DOMista) |
| Esihistorian korostus | `PHY79-SPEED-CALC` valittuna: 43 esivanhempaa kaikkien suhteiden kautta juuriin asti korostettuna, 5 juurta nimettynä, "Näytä koko esihistoria" sovittaa ne näkyviin | ei kuvaa (tarkistettu DOMista) |
| Merireitit alueen kartalla | Aarresaaristo: "⛵ Rannalta 22" pohjasataman kohdalla, "⛵ n → Labraan" niiden lukujen alla, joiden taitoja tarvitaan labrassa. Reitin ikkuna listaa paikat ja kohteet, ja "Purjehdi" vaihtaa aluetta | ei kuvaa |
| Koko maailma | Aluevalinnassa kolme aluetta rinnakkain, lukujen väliset merireitit (paksuus = yhteyksien määrä), valinta korostaa luvun reitit ja avaa sen kartalla | ei kuvaa |
| Tuotantoversio | Kehitystyökalut (`__qa`, kellonappi) eivät näy | ei kuvaa (bundle tarkistettu) |

### Pelikierros 27.10.2026 (kehityspalvelin, DOM- ja tekstitarkistus)

Näissä ei tallennettu uusia kuvia: kuvakaappaustyökalun mittakaava ja klikkauskoordinaatit olivat epäluotettavia,
joten tila luettiin DOMista ja napautukset tehtiin `dispatchEvent`-kutsuilla.

| Polku | Mitä tarkistettiin |
|---|---|
| Suora reitti | **Suoraan tehtävään**: tehtävä aukeaa yhdellä napautuksella kartalta, kahdella maailmanvalinnasta (myös labran pikatarkistus) |
| Laskeminen | Merkit ovat valinnaisia; väärä määrä antaa palautteen ("Niitä on kuusi") |
| Jumissa-valikko | Vain asiaan liittyvät tuet (Laskuloru, Yksi kerrallaan); tukiretki ja paluu |
| Uusinta | Kirjautuu `replay: true`, ei anna osaa |
| Myöhemmin | Kirjaa defer-tapahtuman, ei anna osaa |
| Hyppyvahvistus | Nimeää 5 ohitettavaa paikkaa |
| Lentopaja | Koko kaari testaajatilassa: intro, reppu (vihko, työkalut, osan asennus), kolme osaa, molemmat siipireitit, lento laskeutuu saarelle; tehtävän oppitunti palaa pajaan ("Takaisin pajaan") |
| Ohjattu myöntö | Toinen ohjattu suoritus ei anna toista osaa |
| Lukukelvoton tallenne | Varoitus kartalla ja Aikuiselle-sivulla, alkuperäinen tallessa varakopiona |
| Nollaa testidata | Poistaa testaajan vastaukset ja `testerGame`-tilan, oikeat vastaukset säilyvät |

Testauksen aikana oppijan tallenteeseen kirjautui oikeita vastauksia; tallenne palautettiin varmuuskopiosta ja
todettiin identtiseksi.

Selaimessa läpi pelatut oppitunnit: `M-NUM-01`, `M-NUM-02`, `M-NUM-1TO1`, `M-ADD-01`, `M-MUL-01` (myös hyppy) ja `PHY79-SPEED-CALC`,
sekä Lentopajan tehtävien oppitunnit.
Muut on tarkistettu generaattoritesteillä (COVERAGE.md, sarake *Tarkistettu*).

## Menetelmät

- **`window.__qa`** on vain kehitysversiossa (`import.meta.env.DEV`, `src/ui/lesson.ts`). Sen avulla
  voi lukea nykyisen tehtävän oikean vastauksen. Tuotantoversiossa sitä ei ole (bundle haettu merkkijonolla).
  Lähdemuutoksen jälkeinen HMR-lataus voi jättää vanhan koukun voimaan, joten sivu ladataan uudelleen ennen jokaista polkua.
- **Tallennuksen puuttuminen** simuloitiin korvaamalla `Storage.prototype.setItem` poikkeuksen heittävällä
  funktiolla ja lataamalla sivu uudelleen. Alkuperäinen palautettiin jälkikäteen.
- **Vienti** luettiin sieppaamalla latauksen Blob-sisältö sivun sisällä. Tiedostoa ei tallennettu levylle.
- **Aika**: kehitysversion **Kello +1 vrk** siirtää pelin kelloa (vain `store.devClock`), jotta viivästettyä
  muistihakua voi testata ilman odottamista.

## Rajoitukset

- Safaria ja Firefoxia ei ole testattu tällä kierroksella.
- Tehtäviä ei ole järjestetty: siipitehtävä on avoinna ennen runkoa.
- Pajasivu näyttää testaajahuomautuksen mutta ei tallenteen varoituksia.
- Ei ihmistestausta. Lukemisen sujuvuutta, ohjeiden ymmärrettävyyttä ja motivaatiota ei ole mitattu.
- Puhetta (fi-FI) ei ole kuunneltu kaikilla laitteilla. Ääni riippuu selaimen puhemoottorista.
- Kuvanumerosta 390-02 ei ole tiedostoa. Joissakin kuvissa on rajausvirhe
  kaappaustyökalun takia. Varsinainen näkymä on tarkistettu tekstinä (`get_page_text`).
- Testattu Chromium-pohjaisessa selaimessa. Safaria ja Firefoxia ei ole testattu.
