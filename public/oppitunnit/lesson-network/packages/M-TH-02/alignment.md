# M-TH-02: Lite-yhteensovitus

NodeSpec.id `M-TH-02`, NodeSpec.rev AUDIT_REV=`audit1-2026-10-28`, koko rekisterin CONTENT_REV=`lite181-2026-10-27`. Todellisen lähteen tiivisteet lesson.json/alignment/sourceFiles-kentässä.

{
  "intro": "Rannan kuviokasa lajitellaan laatikoihin ohjeen mukaan.",
  "demo": [
    "sortScene(PILE): punaiset / muut",
    "sortScene(sama PILE): kolmiot / muut; kaari ja kohdekohtainen sääntökysymys"
  ],
  "families": {
    "color": "multi: valitse kaikki oikean väriset 6 kuviosta",
    "shape": "multi: isA-jäsenyys; neliö on myös suorakulmio; väri/asento eivät ratkaise",
    "boxes": "sort: kolme värilaatikkoa, kuusi kohdetta",
    "rule": "sort: annettu väri tai ympyrä/kolmio vs muut",
    "odd": "choice: väriryhmästä poikkeava",
    "transfer": "choice: tunnista jo muodostetun ryhmän väri- tai muotosääntö; koot eroavat"
  },
  "hints": [
    "color/boxes: vain väri",
    "shape: muoto, ei väri/asento",
    "rule: kysy sääntöä jokaiselta",
    "odd: muiden yhteinen väri",
    "transfer: mikä ominaisuus yhteinen"
  ],
  "explanations": [
    "perhekohtainen ratkaiseva ominaisuus",
    "shape: neliöiden inklusiivinen suorakulmiojäsenyys tarvittaessa",
    "rule: kohdekohtaiset sijoitussyyt",
    "transfer: yhteinen väri tai muoto vaihtelusta huolimatta"
  ],
  "audit": "LESSON_AUDIT.md lajittelulaatikko-osio riveillä 478–484: same-pile/two-rules, sort boxes ja rule, kuusi perhettä, kohdekohtaiset syyt."
}

## Rekisteri ja rooli

{
  "declarations": "No node/node-wildcard/per-family DECL overrides for these IDs in families.ts.",
  "coverageOverlays": [],
  "manifestDynamicRule": null,
  "runtimeOverlay": "index.ts fills GOALS fallback and revision policy; SIMS/motionsims has no entry for these three IDs; no motion phase replacement.",
  "familyDefaults": [
    "sort: sorts each picture into the right box",
    "multi: selects exact subset",
    "choice: chooses an option"
  ],
  "rolePreservation": "process",
  "noHardLock": "groups are empty; strong relations retained as support only."
}

Kanoniset prerequisite_groups=[]. Vahva tuki ei muutu required-portiksi. PERHEET ovat todellisia cases-generaattorin avaimia; transfer on erillinen haara. Kit.cases käyttää muita perheitä guided/independent/retrieval-vaiheissa. Generaattoreita ei ajettu lähdearkiston tilaan.

## Peritty ja rajattu

Perii rakentavat sort-perheet sekä saman joukon uuden säännön. Käyttää raidallisuus- ja pyöreysominaisuuksia, jolloin värierottelu tai muodollinen kolmio/neliö/suorakulmio-sanasto ei toimi ylimääräisenä porttina. Siirrot ja palautus näkyvät oikeissa ryhmissä. Sääntö annetaan, ei arvata.

## Opukselle: ei muutosta Liteen

Coverage listaa color/shape/odd ja vanhan rev:n; thinking.ts sisältää lisäksi boxes ja rule, yhteensä kuusi perhettä transfer mukaan luettuna, AUDIT_REV. Säilytä isA inklusiivisuus, jos geometrialuokat tulevat jatkoon; tätä ei muuteta nyt.

Ero on suora lähdehavainto, ei väitetty satunnaissiementesti. PEDAGOGY_REFERENCES on historiallinen verrokkiluettelo, ei tämän tuotoksen vaikuttavuusnäyttö.

## Tulkinnan rajat

Virtuaaliset sijoitukset osoittavat vain tämän annetun säännön noudattamista esimerkkijoukossa. Oikeiden tavaroiden käsittely, säännön itsenäinen keksiminen ja yleistäminen vaativat muuta havainnointia. Säilytetään draft; erillinen riippumaton katselmus ja ihmistestaus odottavat. Peli-URL:ia tai julkista käyttöä ei luvata. Verkoston navigaatio ja vahvojen tukien esitys jäävät pääajon muuttumattomalle kuorelle.

Tekninen tarkistus ajetaan omilla tests.mjs-testeillä, eristetyllä loadPackages-hausta ja lähteistä muistissa koostetulla Chromium-harnessilla. Yhteistä buildiä ei käynnistetä.

## Kirjoittajan rajattu tekninen tarkistus 2026-10-29

Oma skeema, resurssitiivisteet, kanoniset roolit/ryhmät/vahvat tuet ja puhdas toimintalogiikka tarkistettu. Chromium-lähdeharness 390/1280: omat harjoituspolut, oikea/väärä/korjaus, ryhmäsäännön vaihto tai vaihtoehtoinen esimerkkipari asianomaisessa paketissa, kuvat, vähintään 44 px ohjaimet, ei vaakaylivuotoa, tauko/alustus/dispose/uusi mount sekä staattinen opetussisältö ilman JavaScriptiä. Puhelinkuvat tarkastettu. Moduuleissa ei ajastimia tai ulkoisia riippuvuuksia. Riippumattomat ja ihmiskatselmukset ovat erikseen avoinna. Ei yhteistä buildiä tai shared-state-kirjoituksia.
