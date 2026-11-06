# Visuaalinen vertailu — hahmokirjasto v2

## Vertailun aineisto ja rajat

Vertailukohtana käytettiin tässä keskustelussa näkyvää onnistunutta kuvakirjastotaulua (`assets/reference/approved-style-concept.png`), alkuperäisiä piirroksia ja aiemman ZIPin SVG-idle-kuvia. Käyttäjän jakama chatgpt.com/s-osoite ei auennut verkkotyökalussa, joten sen sisältöä ei väitetä erikseen noudetuksi tai varmennetuksi. Keskustelussa jo ollut onnistunut kuvataulu on tämän toimituksen nimetty tyylireferenssi.

Uusi yhtenäinen 24-posen kuva luotiin kuvageneraattorilla. Heti sen jälkeen tarkastettiin todellinen RGBA-kuva vaalealle taustalle koostettuna. Tämän jälkeen yksittäiset PNG:t erotettiin, ankkuroitiin ja katsottiin uudelleen. Vertailu koskee toimitettavia pikseleitä, ei pelkkää konseptin kuvausta.

## Miksi aiempi paketti menetti ilmettä?

Aiemmassa Aava-SVG:ssä näkyivät pienet pistemäiset silmät, tasainen väripinta ja geometrinen nokka. Loikan SVG:n suuri yhtenäinen pää/vartalo, yksinkertaistetut raajat ja tekstuuriton pinta olivat selvästi etäämmällä onnistuneen taulun eloisasta hahmosta. Tämä havainto näkyy `STYLE_COMPARISON.png`-kuvassa; se ei ole uusi väite oppimistuloksista.

## Uuden kuvan tarkistus

| Ominaisuus | Havainto |
|---|---|
| Aavan identiteetti | Keltainen poikanen, oranssi pyöreä kaksiosainen nokka, sininen ääriviiva ja suuri ilmeikäs silmä säilyvät. |
| Loikan identiteetti | Sininen sammakko, leveä pehmeä pää, koholla olevat silmät, pieni vartalo ja näkyvät kädet/jalat säilyvät. |
| Värikynämäinen pinta | Uusissa varsinaisissa PNG-tiedostoissa näkyy kynän jälkeä. Niitä ei rakennettu uudelleen SVG-perusmuodoista. |
| Ilmeet | Räpäytykset, uteliaisuus, vilkutus ja Loikan avoin iloinen suu erottuvat. Loikan idle-hymy on alkuperäistä taulua suljetumpi; happy-pose tarjoaa avoimen tervehdyshymyn. |
| Maalla/vedessä | Aavan pystyasennot ja vaakasuorat uintiposet ovat eri kuvia. Uintia ei simuloida vain kiertämällä seisovaa ankkaa. |
| Reunat | Läpinäkyvyys säilyi vaalealla ja tummalla taustalla. Pääkuvioista ei havaittu leikkautuneita raajoja, tekstikatkelmia tai opaakkeja taustalaatikoita. |
| Normalisointi | Yksi yhteinen 0,90 skaala; nimetyt ankkurit ja riittävä kehysmarginaali. Viereisiin ruutuihin ulottuvat jalat erotettiin varsinaisen hahmon perusteella. |
| Pieni käyttökoko | Katsottu 64/96/128/192 px kehyksessä. 64 px soveltuu pieneen merkkiin; hahmon esittelyyn ja ilmeisiin suurempi kuva on selkeämpi. |

Uudet hahmot ovat edelleen uusia tulkintoja. Esimerkiksi poskien väritys ja osa raajojen muodoista poikkeavat alkuperäisestä käsin piirretystä hahmosta. Vertailun perusteella ne ovat lähempänä onnistunutta konseptia kuin aiemmat pelkistetyt SVG:t, mutta tämä ei ole käyttäjän hyväksyntä tai mitattu suloisuusasteikko.

## Tarkistusmateriaalit

- `STYLE_COMPARISON.png`: onnistunut konsepti / vanha toimitettu SVG / uusi toimitettu PNG.
- `CONTACT_SHEET_LIGHT.png` ja `CONTACT_SHEET_DARK.png`: kaikki 24 uutta hahmoposea, koottu käyttö-PNG:istä.
- `GAME_SCALE_CHECK.png`: todelliset kuvat eri näyttökoossa.
- `BROWSER_QA.json` ja selainkuvat: erillisen hahmodemon tekninen toiminta.
- `ASSET_QA.json`: tekniset havainnot, kuvamäärät ja tunnetut rajat.

## Animaation rajaus

Hahmokirjasto riittää seisomiseen, puhe-eleeseen, vilkutukseen, askelvaihteluun, kartan näyttämiseen, uintiin ja Loikan avainposehyppyyn. Kävely on tarkoituksella kevyttä posevaihtelua; täydellistä anatomisesti jatkuvaa kävelysykliä ei väitetä. Sukellus ja kieliele eivät ole mukana, vaikka aiemmassa konseptitaulussa on niihin viittaavia kuvia. Niitä ei kirjattu valmiiksi animaatioiksi.

Seuraavissa generoinneissa ja integraatioissa on käytettävä samaa vertailuporttia: generoitu kuva → todelliset käyttökuvat → pienet koot → vaalea/tumma tausta → liike → ruutukuva varsinaisesta käyttöliittymästä. Epäonnistunutta versiota ei korvata tuotantoon vain siksi, että generaattori palautti kuvan.

## Tarkistuksessa tehty lisäkorjaus

Ensimmäisessä ympäristöelementtien leikkauksessa auringon yläreunaan jäi hento konseptitaulun otsikkopaneelin viiva ja joidenkin elementtien alareunaan pienen tekstin jäämää. Ne havaittiin varsinaisen demon kuvasta, rajaus korjattiin ja kaikki yhdeksän elementtiä katsottiin uudelleen (`PROPS_CHECK.png`). Lopulliset käyttö-PNG:t ja manifestit käyttävät korjattuja rajauksia.

Selainpolitiikka esti tiedosto- ja localhost-navigoinnin. Siksi raportoidut 30 selaintarkistusta koskevat toimitetusta HTML/CSS/JS:stä ja samoista PNG-tavuista muistissa koostettua komponenttinäkymää. Ulkoiset latausviittaukset korvattiin testissä paikallisella sisällöllä/data-osoitteilla. Tämä todentaa kuvat ja ohjauslogiikan, ei tavanomaisen paikallistiedoston käynnistystä tai Lite-integraatiota.
