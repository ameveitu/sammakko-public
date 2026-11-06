# M-MEAS-02 — Pituus säilyy, paikka voi vaihtua

Versio 1.0, 2026-10-26. **AUTHORED_DESIGN_PENDING_IMPLEMENTATION_REVIEW**. NEW52 / ADR-0019 / B02 PLAN. Alkuperäinen suomalainen suunnitelma, ei riippumaton sisältöhyväksyntä, ihmishyväksyntä, DONE tai toteutuskuitti. Rutiiniratkaisut ovat päätekijän yleisvaltuutuksen nojalla valitsemia tai tässä ehdotettuja, eivät käyttäjän erikseen hyväksymiä.

## Jäädytetty tavoite ja esitieto

**Atomic / concept**, entry_role none. Ainoa required-esitieto M-MEAS-00, myös all_of-ryhmässä. Tavoite ”Pituuden ymmärtäminen suureeksi” on väljä: tässä ehdotetaan pituuden tunnistamista kohteen ominaisuutena, sen vertailua ja säilymisen erottamista aidosta pituuden muutoksesta. Pelkkä kaikkiin kääntöihin annettu ”ei muutu” ei kata tavoitetta. Ei numeromittausta, yksikkömuunnosta, massaa tai pinta-alaa; jäykän suoran kohteen rajaus ei kata mutkalle asetetun köyden kaaripituutta.

OPS: OPH-POPS2014-MATH-VL1-2-S3; peruste 419550 / matematiikka 466344 / kokonaisuus 466963 / S3 469267 / kuvaus.fi kappale 3, live tarkistettu. Pituus kuuluu mainittuihin suureisiin, mutta tämä invarianssitehtävä ja KC-dekompositio ovat pedagogisesti johdettuja. PROD01-OPH-MATH12-S3:n aiempaa vain M-MEAS-01:lle hyväksyttyä soveltamisalaa ei muuteta. Vuosiluokka-alue 1–2; suunta, pituus ja ruudun laajuus ovat mahdollisia käsitteellisiä sekaannuksia.

## Tarve ja aidosti työstetty malli

Aava siirtää Loikan retkitarvikkeita pöydältä kantotelineeseen. Hän haluaa tietää, sopiiko sama suora lista yhä samaan pidikkeeseen. Mallissa lista siirretään oikealle ja käännetään pystyasentoon **venyttämättä**. Ennen/jälkeen-kuvat käyttävät samaa mittakaavaa. Aava asettaa listan alkuperäisen vertailun rinnalle: ”Paikka ja suunta muuttuivat. Pituus ei muuttunut.” Seuraavaksi mallin listan päätä oikeasti pidennetään: nyt se ei enää ole yhtä pitkä. Muuttumisen syy näytetään, ei päätellä animaation näyttävyydestä.

Ohjauksessa alkuperäisen listan vertailuhaamu saa näkyä ja oppija voi siirtää/kääntää itse. Pyydetty apu kohdistaa vertailupäät. Häivytyksessä poistuu ratkaisua korostava haamu ja päätelmäteksti; alkuperäinen ja uusi kohde saavat jäädä vierekkäin vertailua varten. Tavoite on ominaisuuden päättely, ei visuaalisen työmuistin koe.

## Itsenäinen päätös ja vastastrategiat

Yksi yhteinen ohje kaikissa tapauksissa: ”Vertaa listan pituutta ennen ja jälkeen. Onko se lyhyempi, yhtä pitkä vai pidempi?” Oppija valitsee kolmesta laatasta. Käyttöliittymä antaa aidot ennen/jälkeen-tilat ja haluttaessa neutraalin toiston; se ei nimeä arvioitavaa tapahtumaa ”pelkäksi käännöksi” tai näytä invarianssimerkkiä. Ei koordinaattien kirjoittamista. Todellinen siirto/kääntö sekä aito pidennys/lyhennys mallinnetaan domainissa eri asioina.

Vaihtele säilymistä ja muutosta: kaikki-ennallaan-vastaus epäonnistuu pidennykseen, kaikki-liike-muuttaa-vastaus siirtoon. Pitkä kohde voi kääntyä vaaka-asennosta pystyasentoon; ruudun vaakasuuntainen laajuus pienenee pituuden pysyessä. Vaihtele sijaintia, suuntaa ja väriä siten, ettei animaation laji, vastauspaikka tai väri ennusta ratkaisua. Samalle kuvalle erillinen ominaisuuskysymys ”Kumpi kertoo pituudesta?” erottaa sijainnin/korkeuden pituudesta; ei pakollista sanallista perustelulomaketta.

Virheen jälkeinen apu: ”Se nousi ylemmäs, mutta katsotaan sen matkaa päästä päähän. Verrataan samaan listaan.” Tämä on tukea. Päättelyä ei hyväksytä vain siksi, että järjestelmä aina tarjoaa säilyvän kohteen.

## Soveltaminen, myöhempi tarkistus ja seuraus

Sovella uuteen suoraan tarvikkeeseen eri suunnassa samalla asteikolla; oppija päättää, mikä alkuperäisen kanssa yhtä pitkä osa sopii telineeseen. Tarina näyttää valitun osan paikoillaan. Ei oleteta että siirtyminen opettaa standardiyksiköt tai kaikki jatkuvat suureet. Myöhempi uusi ennen/jälkeen-vertailu ilman mallia sisältää sekä säilyvän että oikeasti muuttuneen pituuden ja ominaisuuden tunnistamisen. Viive/minimit ovat versioitavia projektivalintoja, ei 24 h tai kolmen onnistumisen luonnonvakioita. Tuettu onnistuminen säilyttää tarinapanoksen.

Tämä on vielä materiaalinen **tavoitekattavuuden arviointikysymys**: riittävätkö ominaisuuden tunnistus, vertailu ja rigidin pituuden invarianssi jäädytetyn otsikon rajatuksi toteutukseksi? Kortti on ehdotus, ei tämän päätöksen normi. Mainin/sisältöarvioijan on lausuttava hyväksytty rajaus; tätä tietuetta ei lasketa valmiiksi laajemman suurekäsitteen näyttönä.

## Lähdekartta ja pääsy

- [OPH JSON](https://eperusteet.opintopolku.fi/eperusteet-service/api/perusteet/419550/kaikki), live 2026-10-26, yllä oleva S3: pituus suureena, ei täsmällistä invarianssimittaria.
- [R03 / NCETM Measures](https://www.ncetm.org.uk/classroom-resources/ey-measures/), HTML 2026-10-26, johdanto ja Recognising attributes / Comparing amounts: ominaisuuden ja vertailun perusta. Jäykän muunnoksen predikaatti on projektin matemaattinen formalisaatio, ei sivulta kopioitu testi.
- [R01 / IES WWC 2021](https://ies.ed.gov/ncee/wwc/PracticeGuide/26), HTML 2026-10-26, suositukset 1–3: näkyvä ennen/jälkeen-malli ja täsmällinen pituuskieli; ei yleisen suurekäsitteen tehokkuusväitettä.

Näppäimistö ja napautus toistavat samat tilat; reduced motion näyttää erilliset ennen/jälkeen-kuvat. Ääni vapaaehtoinen / pois aluksi. Ei väitettä ei-visuaalisesta vastaavuudesta. Ei lainattuja kuvia/tehtäviä. Tarvitaan oikeiden mittojen ja yhteisen asteikon tarkistus, muutosvastatapaukset sekä 390/1280-renderöinti.
