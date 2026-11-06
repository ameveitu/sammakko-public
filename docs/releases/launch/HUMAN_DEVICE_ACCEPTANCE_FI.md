# Opettaja-, oppija- ja laitehyväksyntä

Tila: **odottaa oikeita osallistujia ja laitteita**. Tämä tiedosto on toteutettava koesuunnitelma. Agentin kuvat tai automaatio eivät täytä alla olevia tuloskenttiä. Ohjelmiston tarkistukset ja niiden KC-kohtainen kattavuus löytyvät review-ledger.json-tiedostosta.

## Ennen koetta

Kirjaa tarkistettavan paketin `release.json.sourceCommit`, julkaisupaketin tiiviste, käyttöosoite ja ledger-versio. Käytä vain sitä pakettia, joka läpäisi nykyisen integroidun CI:n. Älä käytä vanhaa onnistunutta ajoa muuttuneen lähteen hyväksyntänä. Kokeen järjestäjä ja aikataulu ovat vielä määrittelemättä.

Suunniteltu kohderyhmä on pieni 3–5 opettajan käytettävyysotos: alkuopetus, 3–6 ja yläkoulu. Oppijakokeet noudattavat [Liten olemassa olevaa protokollaa](../../../lite/PILOT.md). Käytä vapaaehtoista anonyymia osallistujatunnusta. Tallenna annettu apu erikseen; avustettu suoritus ei ole itsenäinen. Osallistuja voi lopettaa milloin tahansa. Älä lisää keskitettyä oppija-analytiikkaa tai julkaise oppijahistoriaa.

## Opettajan tehtäväpolku

Anna opettajalle omaa kouluastetta vastaava aihe ja seuraavat tavoitteet ilman kehittäjän vaiheittaista opastusta:

1. Löydä aihe kotisivulta tai kirjastosta ja valmistele tunti opettajanäkymässä. Avaa myös opettajan muistiinpanot.
2. Avaa esityspinta ja jaa **vain sen välilehti tai ikkuna**. Sovellus ei hallitse työpöydän muiden ikkunoiden näkyvyyttä.
3. Näytä kysymys ja kuva paljastamatta ratkaisua. Siirry seuraavaan vaiheeseen, käytä vihjettä ja paljasta ratkaisu tietoisesti.
4. Käytä demonstraation omia syötteitä ja nuolinäppäimiä; vaihe ei saa vaihtua vahingossa.
5. Kokeile koko näyttöä ja siitä poistumista, vieritä, suurenna ja alusta. Esitystilan pitää säilyä.
6. Avaa saman aiheen Lite-harjoitus ja palaa valmisteluvälilehteen. Tarkista, ettei jaetulla pinnalla näy muistiinpanoja, lähteitä, KC-verkkoa tai hallintatietoja.

Havainnoi löydettävyys, tahattomat paljastukset, ruudunlukijan/fokuksen rajat ja avuntarve. Kirjaa konkreettinen vaihe, odotus ja havainto. Älä päättele oppimisvaikutusta tehtävän onnistumisesta.

## Laite- ja saavutettavuuskokeet

| Koe | Hyväksymisehto | Oikea tulos |
|---|---|---|
| Oikea projektori, 1280×720 ja 1024×768 | Kysymys, mitta-asteikko ja olennainen kuva luettavia luokan takaosasta | odottaa |
| Oikea näytönjako | Esitysvälilehden rajaus säilyy vaiheessa, fullscreenissa, resetissä ja paluussa | odottaa |
| Oikea kosketuslaite | Tehtävät, kartta, paja ja lento toimivat ilman tarkkaa hiiren käyttöä | odottaa |
| Safari/VoiceOver ja käytettävä koulun selain | Fokusjärjestys, nimet, tilailmoitukset; opettajasisältö ei päädy esityspinnan saavutettavuuspuuhun | odottaa |
| Macin fyysinen trackpad | Verkon siirto, pinch, solmun veto ja napautus toimivat nykyversiossa | odottaa |
| Äänetön käyttö ja reduced motion kesken liikkeen | Sisältö ymmärrettävä, koriste rauhoittuu, ilmiön tarkoituksellinen liike ohjattavissa | odottaa |
| 200 % suurennus ja kapea ruutu | Olennainen sisältö ja fokus eivät peity | odottaa |

## Täytettävä havainto

Paketin SHA / lähdecommit: odottaa  
Päivä, anonyymi tunniste ja rooli: odottaa  
Laite, selain, projektori/jakotapa: odottaa  
KC, sisältörevisio, tehtäväperhe, siemen/vaihe: odottaa  
Tehtävä ja odotus: odottaa  
Havaittu toiminta ja annettu apu: odottaa  
Löydöksen vakavuus / omistaja / korjausviite: odottaa  
Uusintakokeen tulos: odottaa  
Hyväksyjä ja otoksen rajat: odottaa

LR06:n ihmisportti jää avoimeksi, kunnes oikeat havainnot on kerätty ja launchin estävät löydökset suljettu.
