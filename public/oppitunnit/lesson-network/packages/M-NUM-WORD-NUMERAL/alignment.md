# M-NUM-WORD-NUMERAL: Lite-yhteensovitus

NodeSpec.id `M-NUM-WORD-NUMERAL`, NodeSpec.rev AUDIT_REV=`audit1-2026-10-28`, koko rekisterin CONTENT_REV=`lite181-2026-10-27`. Todellisen lähteen tiivisteet lesson.json/alignment/sourceFiles-kentässä.

{
  "intro": "Jokaisella laskusanalla oma numero; etsitään parit.",
  "demo": [
    "numeralTrain(0,10): nimi ja syttyvä symboli",
    "6/9,1/7 muodon ero; SHAPE lisäksi 2/5 ja 3/8"
  ],
  "families": {
    "w2n": "0–10, LOOKALIKE-häiriö; num + near; erityinen muotopalaute",
    "n2w": "1–10, suuri numeromerkki; spoken-vaihtoehdot ja listen-tekstivastine",
    "pairs": "kolme eri lukua 1–10; place: sanat numeropaikoille",
    "transfer": "12–19: numeral vs digit reversal vs n−10"
  },
  "hints": [
    "pairs: sano numeron nimi ja etsi sana; ei pakollista puheentunnistusta",
    "w2n/n2w/transfer: ei erillistä hint-kenttää"
  ],
  "explanations": [
    "w2n: sana kirjoitetaan n",
    "n2w: n on sana",
    "pairs: jokainen sanapari",
    "transfer: kymppi ja ykköset"
  ],
  "audit": "LESSON_AUDIT.md §M-NUM-WORD-NUMERAL: kaksi mallia, lookalikes, pairs, väärinpäin/kymppi-palaute; historialliset testit eivät ole tämän paketin näyttöä."
}

## Rekisteri ja rooli

{
  "declarations": "No node/node-wildcard/per-family DECL overrides for these IDs in families.ts.",
  "coverageOverlays": [],
  "manifestDynamicRule": null,
  "runtimeOverlay": "index.ts fills GOALS fallback and revision policy; SIMS/motionsims has no entry for these three IDs; no motion phase replacement.",
  "familyDefaults": [
    "place: places tokens in slots",
    "choice: chooses an option"
  ],
  "rolePreservation": "process",
  "noHardLock": "groups are empty; strong relations retained as support only."
}

Kanoniset prerequisite_groups=[]. Vahva tuki ei muutu required-portiksi. PERHEET ovat todellisia cases-generaattorin avaimia; transfer on erillinen haara. Kit.cases käyttää muita perheitä guided/independent/retrieval-vaiheissa. Generaattoreita ei ajettu lähdearkiston tilaan.

## Peritty ja rajattu

Perii lukusana↔symboli-parit, lookalike 6/9 ja pairs-rakentamisen. Kaksi kosketusta korvaa raahaamisen. Numerokortit ovat konkreettinen lähtökohta, nuoliparit esitys. Ei määräkuvia. Lite transfer 12–19 sisältää paikka-arvoselitystä; tässä siirto uuteen numerolappukontekstiin pysyy saman prosessin rajoissa.

## Opukselle: ei muutosta Liteen

Coverage ilmoittaa vain w2n/n2w ja vanhan lite181-revision; numbers.ts sisältää myös pairs ja AUDIT_REV. Kirjaa Opuksen coverage-päivitysehdotus. 12–19-siirron paikka-arvovaatimus rajattava, ettei sitä tulkita tämän prosessin välttämättömäksi osaksi.

Ero on suora lähdehavainto, ei väitetty satunnaissiementesti. PEDAGOGY_REFERENCES on historiallinen verrokkiluettelo, ei tämän tuotoksen vaikuttavuusnäyttö.

## Tulkinnan rajat

Sanaparien rakentaminen on prosessiharjoitus, ei kardinaliteettinäyttö, puheentunnistus tai numeron kirjoitustesti. Aikuinen voi lukea sanat. Säilytetään draft; erillinen riippumaton katselmus ja ihmistestaus odottavat. Peli-URL:ia tai julkista käyttöä ei luvata. Verkoston navigaatio ja vahvojen tukien esitys jäävät pääajon muuttumattomalle kuorelle.

Tekninen tarkistus ajetaan omilla tests.mjs-testeillä, eristetyllä loadPackages-hausta ja lähteistä muistissa koostetulla Chromium-harnessilla. Yhteistä buildiä ei käynnistetä.

## Kirjoittajan rajattu tekninen tarkistus 2026-10-29

Oma skeema, resurssitiivisteet, kanoniset roolit/ryhmät/vahvat tuet ja puhdas toimintalogiikka tarkistettu. Chromium-lähdeharness 390/1280: omat harjoituspolut, oikea/väärä/korjaus, ryhmäsäännön vaihto tai vaihtoehtoinen esimerkkipari asianomaisessa paketissa, kuvat, vähintään 44 px ohjaimet, ei vaakaylivuotoa, tauko/alustus/dispose/uusi mount sekä staattinen opetussisältö ilman JavaScriptiä. Puhelinkuvat tarkastettu. Moduuleissa ei ajastimia tai ulkoisia riippuvuuksia. Riippumattomat ja ihmiskatselmukset ovat erikseen avoinna. Ei yhteistä buildiä tai shared-state-kirjoituksia.
