# audiogen: Sammakon ennalta tuotetut äänet

Kehittäjäkoneen komentorivityökalu. Se tekee puhekatalogin, tuottaa ehdokkaat OpenAI:n Realtime-mallilla, hoitaa kulukirjanpidon ja pakkaa hyväksytyt tiedostot Liten `public/audio/`-kansioon. Koko prosessi, oikeudet ja kuuntelulista on kuvattu tiedostossa [docs/audio/AUDIO_FI.md](../../docs/audio/AUDIO_FI.md).

- Työkalulla ei ole riippuvuuksia. Se tarvitsee Noden (≥ 22) ja macOS:n. AST-inventaario käyttää Liten `typescript`-pakettia, joten `npm ci` ajetaan kansiossa `lite/`.
- Oletuksena dry-run. `--live --budget-usd N` lukee avaimen Keychainista ja käyttää rahaa.
- Budjetti on jaettu kuvageneraattorin kanssa. Kuukausikatto lasketaan yhteen molempien kirjanpidoista.
- Tilakansio on `~/Library/Application Support/sammakko-audiogen/`. Siellä ovat `ledger.jsonl`, `candidates/`, `masters/` ja kuuntelusivu.

```bash
node tools/audiogen/cli.mjs
```

```bash
node --test tools/audiogen/test/audiogen.test.mjs
```

Maailman äänipaketti (CC0-äänitteet, leikkaus, tasot, saumattomat silmukat) tehdään `world`-komennolla, ja `ambient` vie hyväksytyt taustasilmukat Liten äänimaisemaksi (`public/audio/amb/` ja manifestin `ambient`-kohta). Tarkemmin: [AUDIO_FI.md, Äänimaisema](../../docs/audio/AUDIO_FI.md#äänimaisema-tuuli-ja-liplatus-4112026).

```bash
node tools/audiogen/cli.mjs ambient
```

Ympäristömuuttujat (testejä varten): `AUDIOGEN_HOME`, `IMAGEGEN_HOME`, `AUDIOGEN_KEYCHAIN_SERVICE`, `AUDIOGEN_REALTIME_URL`.
