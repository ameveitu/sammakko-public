# Aava ja Loikka: kuvien alkuperä

- **Käytössä olevat kuvat:** `public/characters/aava/*.png` ja `public/characters/loikka/*.png` (12 + 12 RGBA-PNG:tä, 256 × 256). Ne on kopioitu muuttamattomina Sol-luovutuksesta `Sammakko_181_Handover_v2_uusi.zip` (`assets/aava/png`, `assets/loikka/png`), kuvakirjaston versio 2.0.0.
- **Liike:** `src/ui/sprite-data.ts` on kirjattu suoraan luovutuksen tiedostosta `animations.json`, ja se on tallennettu tänne sellaisenaan. Testi `tests/sprites.test.ts` vertaa näitä kahta. Ankkurit ja rajat ovat tiedostossa `sprites.json`.
- **Alkuperäiset piirrokset:** `reference/aava-and-sun-original.jpg` ja `reference/loikka-original.jpg` ovat käyttäjän omia piirroksia. Luovutuksen tyylikonsepti on `reference/approved-style-concept.png`.
- **Generoitu lähde:** Spritet on leikattu generoidusta hahmotaulusta `source/generated-character-sheet.png`. Uudet kuvat eivät ole käyttäjän käsin piirtämiä, eikä tämä paketti myönnä niille kolmannen osapuolen lisenssiä. Julkaisun lisensoinnista päättää omistaja.
- **Luovutuksen alkuperäinen ohje:** `HANDOVER_README_FI.md`.
- **Mitä luovutuksesta ei käytetty:** `catalog.js` ja `sprite-player.js`. Lite käyttää omaa pientä ohjaintaan (`src/ui/sprite.ts`), jossa ei ole ajonaikaisia riippuvuuksia.
- **Sulka** on edelleen oma SVG-hahmonsa. Sulkaa ei piirretä Aavan kuvilla.
