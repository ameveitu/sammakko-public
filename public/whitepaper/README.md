# Sammakon whitepaper

Julkaisun muokattava sisältölähde on `Sammakko_whitepaper_FI.md`. Se kuvaa nykyisen rajatun tuotteen, Aava-painotteisen suunnittelun, oppimismerkintöjen merkityksen, tietojen käsittelyn ja tulevan arvioinnin. Tutkimusviitteet eivät ole Sammakon vaikuttavuusväitteitä. Tarkista lukumäärät ja toimintakuvaukset toteutuksesta aina sisältöä päivitettäessä.

Rakenna HTML repon juuresta:

```sh
node public/whitepaper/build.mjs
node public/whitepaper/build.mjs --check
```

Generaattori käyttää vain Node.js:n vakiokirjastoa. Lähteen tuettu Markdown sisältää dokumentin otsikon ja alaotsikon, metadataosan ennen ensimmäistä erotinta sekä päälukuotsikot (`#`), alaotsikot (`##`/`###`), kappaleet, listat, lainaukset, koodilohkot, lihavoinnit, kursivoinnit ja Markdown-linkit. Otsikkoankkuri johdetaan otsikosta; valinnainen `{#id}` säilyttää ankkurin otsikon muuttuessa. Päällekkäiset ankkurit ja sulkemattomat koodilohkot hylätään. Taulukot eivät kuulu tämän 22-luvun lähteen nykyiseen sopimukseen. `index.html`:ää ei muokata erikseen. `whitepaper.css` sisältää artikkelin ja tulostuksen lisätyylit; yhteinen brändityyli ja navigaatio tulevat poluista `/assets/brand.css` ja `/assets/site.js`.

Palvelinpakettiin kuuluvat vain `index.html`, `whitepaper.css` ja `Sammakko_whitepaper_FI.md`. Markdown on lukijalle ladattava tekstiversio. Sivun Tulosta / tallenna PDF -toiminto käyttää selaimen tulostusta; valmiin ladattavan PDF-tiedoston olemassaoloa ei väitetä. Sivun kuva käyttää muuttumatonta Aava-resurssia Liten jaetusta kuvakirjastosta.

Sisällön toimituslähteet 30.10.2026: Liten `README.md`, `DESIGN.md`, `src/engine/evidence.ts`, `src/engine/store.ts`, `src/ui/speech.ts`, `PILOT.md`; oppituntiverkon `README.md` ja tekninen 181/690/509-tilanne. Lähdecommit ennen julkaisusivujen toteutusta: `4e5217b771c83859ab22db68cae24d12d8798052`. Uuden paketin täsmällinen commit yksilöityy sen `release.json`:ssa.

Sisältökatselmoinnin rajat: ei väitettä oppilasvalidoinnista, täydestä opetussuunnitelmakattavuudesta, todistetusta oppimisvaikutuksesta, kattavasta saavutettavuussertifioinnista tai uudesta lisenssistä. Liten 20 tunnin sääntö on toteutusvalinta. Selaimen puhepalvelu ja verkkopalvelimen lokit kuvataan erillään paikallisesta oppijahistoriasta. Täydelliseen paikallisten tietojen poistoon ohjataan selaimen sivustotietojen tyhjennys, koska pelin nollaus ei yksin poista mahdollisia varmuuskopioavaimia.

Generaattorin regressiot: `node --test public/whitepaper/test-build.mjs` repon juuresta. Latauslinkki ja lähdelinkit koestetaan lisäksi julkaisun varsinaisessa selaintestissä.
