# Sammakon kuvitus

Hakemisto sisältää Aavan ja Loikan asentosarjat, taustat, tekstuurit ja kuvakkeet. Käytössä olevat kuvat ja niiden alkuperätiedot löytyvät tiedostoista `manifest.json` ja `runtime-manifest.json`. Hahmojen 3D-mallit ja esikatselukuvat ovat hakemistossa `characters-3d/`. Pelin koonti kopioi valitut mallit ja kuvat Liten resursseihin. Tarkista aineisto projektin juuresta.

```sh
node art/build.mjs --check
node art/check-runtime.mjs
```
