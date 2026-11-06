# M-TH-01: Lite-yhteensovitus

NodeSpec.id `M-TH-01`, NodeSpec.rev AUDIT_REV=`audit1-2026-10-28`, koko rekisterin CONTENT_REV=`lite181-2026-10-27`. Todellisen lähteen tiivisteet lesson.json/alignment/sourceFiles-kentässä.

{
  "intro": "Aava vertailee retkiviirejä: samat ja erilainen.",
  "demo": [
    "compareScene: kaksi samaa sinistä isoa kolmiota",
    "compareScene: vain väri eri",
    "compareScene: keltaisilla ympyröillä vain koko eri"
  ],
  "families": {
    "same": "vertailumalli + kolme vaihtoehtoa; kahdessa yksi ominaisuus eri",
    "odd": "kolme identtistä ja yksi, jolla satunnainen ominaisuus eri",
    "which": "kaksi kohdetta ja muoto/väri/koko-valinta",
    "transfer": "sama väri mutta eri muoto; kaksi yhtäaikaista ehtoa"
  },
  "hints": [
    "same/odd: tarkista muoto, väri, koko",
    "which: katso ominaisuudet järjestyksessä",
    "transfer: väri sama, muoto eri"
  ],
  "explanations": [
    "same: kaikki kolme samat",
    "odd: vaihdetun ominaisuuden nimi",
    "which: nimet ja molempien kuvaukset",
    "transfer: väri sama, muoto eri"
  ],
  "audit": "LESSON_AUDIT.md §M-TH-01: vertailun teko näkyviin compareScene; which-perhe ja väärien vaihtoehtojen syyt; kolme mallia."
}

## Rekisteri ja rooli

{
  "declarations": "No node/node-wildcard/per-family DECL overrides for these IDs in families.ts.",
  "coverageOverlays": [],
  "manifestDynamicRule": null,
  "runtimeOverlay": "index.ts fills GOALS fallback and revision policy; SIMS/motionsims has no entry for these three IDs; no motion phase replacement.",
  "familyDefaults": [
    "choice: chooses an option"
  ],
  "rolePreservation": "atomic",
  "noHardLock": "groups are empty; strong relations retained as support only."
}

Kanoniset prerequisite_groups=[]. Vahva tuki ei muutu required-portiksi. PERHEET ovat todellisia cases-generaattorin avaimia; transfer on erillinen haara. Kit.cases käyttää muita perheitä guided/independent/retrieval-vaiheissa. Generaattoreita ei ajettu lähdearkiston tilaan.

## Peritty ja rajattu

Perii yhden ominaisuuden tarkastelun ja samanaikaiset yhtäläisyydet/erot. Oppija rakentaa koko vertailurivin jokaiselle parille. Eri sukkaesimerkki tuo siirron arkeen. Ei kaikkien kohteiden leimaamista vain yleisesti samanlaiseksi tai erilaiseksi.

## Opukselle: ei muutosta Liteen

Coverage listaa same/odd ja kaksi mallia sekä vanhan rev:n; measure.ts sisältää which-perheen, kolme compareScene-mallia ja AUDIT_REV. Päivitä coverage Opuksen puolella. Samanlainen aina nimetyn ominaisuusjoukon suhteen, ei kaikkien reaalimaailman ominaisuuksien identiteetti.

Ero on suora lähdehavainto, ei väitetty satunnaissiementesti. PEDAGOGY_REFERENCES on historiallinen verrokkiluettelo, ei tämän tuotoksen vaikuttavuusnäyttö.

## Tulkinnan rajat

Valmiin kuvan vertailurivit eivät mittaa avoimen havainnon laatua, aistitietoa, yleistä ajattelutaitoa tai pysyvää oppimista. Säilytetään draft; erillinen riippumaton katselmus ja ihmistestaus odottavat. Peli-URL:ia tai julkista käyttöä ei luvata. Verkoston navigaatio ja vahvojen tukien esitys jäävät pääajon muuttumattomalle kuorelle.

Tekninen tarkistus ajetaan omilla tests.mjs-testeillä, eristetyllä loadPackages-hausta ja lähteistä muistissa koostetulla Chromium-harnessilla. Yhteistä buildiä ei käynnistetä.

## Kirjoittajan rajattu tekninen tarkistus 2026-10-29

Oma skeema, resurssitiivisteet, kanoniset roolit/ryhmät/vahvat tuet ja puhdas toimintalogiikka tarkistettu. Chromium-lähdeharness 390/1280: omat harjoituspolut, oikea/väärä/korjaus, ryhmäsäännön vaihto tai vaihtoehtoinen esimerkkipari asianomaisessa paketissa, kuvat, vähintään 44 px ohjaimet, ei vaakaylivuotoa, tauko/alustus/dispose/uusi mount sekä staattinen opetussisältö ilman JavaScriptiä. Puhelinkuvat tarkastettu. Moduuleissa ei ajastimia tai ulkoisia riippuvuuksia. Riippumattomat ja ihmiskatselmukset ovat erikseen avoinna. Ei yhteistä buildiä tai shared-state-kirjoituksia.
