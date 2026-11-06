# Aavan matkassa — Sammakon kotisivu

Suomenkielinen, riippuvuudeton julkaisusivusto. Lähteet ovat tässä hakemistossa; palvelimelle viedään vain `publication-manifest.json`-tiedoston nimeämät tiedostot osana yhteistä sivustopakettia. Hakemistoa ei julkaista sellaisenaan.

## Sisältö ja käyttötavat

- Etusivu esittelee Aavan, oppimisen saariston ja nykyisen Liten. Yhteinen `Avaa Sammakko Lite` avaa `/lite/`-aloituksen; erikseen nimetty `Avaa Lentopaja` avaa `/lite/#paja`-Lentopajan. Aihe-esimerkit avaavat oikeat 181-joukon KC:t.
- `/tietoa/` kertoo tallennuksesta, yhteiskäytöstä, puheesta, verkkopyynnöistä ja sisältöjen rajoista.
- `404.html` on oikealla HTTP404-tilalla tarjottava virhesivu, ei yleinen SPA-fallback.
- `assets/brand.css` ja `assets/site.js` palvelevat myös whitepaperia ja yhteiseen pakettiin rakennettuja oppitunteja.

Kotisivu ei tarvitse JavaScriptiä tekstin, navigaation, usein kysyttyjen kysymysten tai pelilinkkien lukemiseen. JavaScript supistaa mobiilivalikon ja vaihtaa näkyvää tutustumisaihetta. Se ei tallenna tietoja eikä lähetä oppijatapahtumia. Vähennetty liike huomioidaan.

## Brändi

Päähahmo on Aava, keltainen ankanpoikanen. Sininen Loikka on tukihahmo. Kuvia ei piirretä uudelleen: alkuperäiset 256×256 PNG:t ladataan yhteisen paketin `/lite/characters/`-polusta. Kuvalähteet ja alkuperä ovat `lite/docs/characters/`-dokumentaatiossa. Taustan rannat, saaret ja reitit ovat tässä tehtyjä koristeellisia SVG-muotoja; ne eivät ole osa opetussuunnitelmaverkon kuvausta.

Ilme käyttää lämpimän vaaleaa paperia, syvää vihreää tekstiä, veden sinivihreää, saarten vihreää ja Aavan keltaista. Hahmot kutsuvat tutkimaan; väärästä vastauksesta ei rangaista hahmojen ilmeillä. Julkisessa tekstissä ei luvata todistettua oppimisvaikutusta, täyttä saavutettavuutta, automaattista laitesynkronointia tai olematonta palvelintoimintoa.

## Navigaation lähde

Osiot, linkkien nimet ja kohteet määritellään tiedostossa `../shared/navigation.json`. Päivitä kotisivun, tietosivun ja oppimisverkon otsakkeet komennolla `node public/shared/navigation.mjs` repon juuresta; `--check` hylkää vanhentuneen kopion. Whitepaper ja oppituntigeneraattori käyttävät samaa `renderSiteHeader(activeId)`-funktiota. `data-lite-entry`-merkityt kotisivun pelilinkit käyttävät saman määrittelyn tekstejä; aihelinkkien KC-kohde säilyy.

## Tarkistus ja esikatselu

Rakenna Lite ja oppituntiverkko sekä whitepaper repon ja `docs/DELIVERY_FI.md`-ohjeen mukaan. Paketoi repon juuresta `node .github/scripts/package-site.mjs`. Tarkista paketti `python3 .github/scripts/check-site.py`. Julkaisun selainkokeet ajetaan oikeaa Nginx-palvelinta vasten CI:ssä; yksittäinen tämän hakemiston palvelu ei sisällä Liten tai oppituntien alireittejä.

Sisällön muuttaminen ei muuta repositorion näkyvyyttä tai lisenssiä. Osoitteen, palvelimen ylläpitäjän ja mahdollisen pyyntölokikäytännön lopulliset tiedot kuuluvat palvelimen käyttöönottoon.
