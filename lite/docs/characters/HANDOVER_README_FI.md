# Aava ja Loikka — PNG-kirjasto 2.0

## Käyttöresurssit

`aava/png/` ja `loikka/png/` sisältävät kumpikin 12 oikeaa RGBA-PNG-kuvaa. Hahmokehys on 256 × 256 px. Kaikki hahmot on erotettu yhtenäisestä generoidusta kuvasta samalla 0,90-mittakaavalla; yksittäisiä poseja ei ole sovitettu eri kokoisiksi. Jalka-ankkuri on (128, 238), uinnin vesilinja-ankkuri (128, 208). Tarkat rajat, lähdekomponentti ja ankkurit ovat `sprites.json`-tiedostossa.

Hahmojen lähdekuvan nominalisen ruudukon rajat eivät kaikkialla erottaneet hahmoja: uimarin jalat ja Loikan loikan raaja ylittivät solurajan. Ne erotettiin alfa-alueiden perusteella, jotta viereisen hahmon palasia tai katkenneita raajoja ei siirtynyt spriteihin. Puheposeen irralliset keltaiset merkkiviivat jätettiin pois; ne eivät ole osa hahmoa. Värikynäpinta ja kasvojen varsinaiset pikselit säilytettiin.

`environment/png/` sisältää yhdeksän onnistuneesta konseptitaulusta erotettua ympäristöelementtiä. Ne ovat pääosin 128 × 128 px kehystettyjä, vesi 192 × 128 px. Alkuperäinen kuvan tarkkuus on säilytetty; näistä ei ole tehty näennäisiä suurresoluutioisia vektoriversioita. Käytä niitä pieninä koristeina tai esineinä, ei esimerkiksi koko ruudun suuruisena aurinkona.

`atlases/aava.png` ja `atlases/loikka.png` sisältävät samat PNG-pikselit 6 × 2 kehysruudukossa. JSON on yksinkertainen dokumentoitu kehyskartta, ei väite jonkin pelimoottorin erityisformaatin täydestä yhteensopivuudesta. Yksittäiset PNG:t ovat helpoin integraatio.

## Avainposet

| Hahmo | Tiedostot |
|---|---|
| Aava | idle, blink, wave, talk, curious, map, walk_01…04, swim, swim_blink |
| Loikka | idle, blink, wave, happy, curious, map, crouch, leap, airborne, land, walk_01…02 |

`animations.json` määrittää vain todellisiin kuviin perustuvat jaksot. Uinti sisältää pienen kohottelun ja räpäytyksen. Kävely on avainposejen vaihtelua, ei täydellinen nivelletty kävelyanimaatio. Hypyn neljä vaihetta ja koko hahmon liike yhdistetään kevyeksi loikaksi. Erillisiä sukellus-, kieli-, työkalu- tai lentäjäspritejä ei tässä luvata.

## Riippuvuudeton soitin

Tavalliset script-tiedostot välttävät fetch-/moduulilatauksen paikallistiedostorajoitukset. Tässä ympäristössä file- ja localhost-navigointi estettiin selainpolitiikalla; toiminta testattiin selaimeen muistissa koostettuna, ei tavallisena file-käynnistyksenä:

```html
<img id="aava" alt="Aava" width="160" height="160">
<script src="assets/catalog.js"></script>
<script src="assets/sprite-player.js"></script>
<script>
  const player = new SammakkoSpritePlayer(document.getElementById('aava'), {
    actor: 'aava', baseUrl: ''
  });
  player.play('wave');
  // player.pause(); player.resume(); player.reset();
  // player.setPose('map');
  // Kun oppitunti poistuu: player.dispose();
</script>
```

`baseUrl` osoittaa paketin juureen: demo-hakemistosta se on `../`. Opettajaoppitunnissa resurssit voi sijoittaa oman yhteisen polun alle. Älä kopioi koko kirjastoa 181 kertaa; tee jaettu resurssipolku.

Soitin pysäyttää liikkeen piilotetulla sivulla ja vähennetyn liikkeen asetuksessa. Se ei kirjoita oppimisevidenssiä, suorita pedagogista kelloa tai ansaitse palkintoja. Hahmon liikkumissuunta voidaan kääntää ulommassa elementissä; älä kumoa soittimen omaa transformia samassa img-elementissä.

Näytä nimi ensimmäisen esiintymisen yhteydessä. Aava ja Loikka saavat auttaa, yllättyä ja tutkia; älä käytä voimakkaita häpeän tai rangaistuksen reaktioita virhevastauksiin. Piilota tai pysäytä koristeellinen liike, kun opettaja esittelee mitattavaa ilmiötä.

## Alkuperä ja versiot

Käyttäjän piirrokset ovat reference-hakemistossa. Uusi hahmotaulu on generoitu tässä keskustelussa ja leikattu PNG:iksi; ympäristöelementit ovat aiemmasta onnistuneesta generoidusta konseptitaulusta. Tämän paketin metadata ei väitä uusia kuvia käyttäjän käsin piirtämiksi eikä myönnä niille oletettua kolmannen osapuolen lisenssiä. Julkaisuprojektin lisensointi tehdään omistajan päätöksellä.

Täysi kuva- ja tyylivertailu: `../qa/STYLE_REVIEW_FI.md`. `source/generated-character-sheet.png` sisältää alkuperäisen RGBA-generoinnin. Katseluohjelma, joka sivuuttaa alfa-kanavan, voi näyttää sen taustalla värejä; PNG:n todellinen tausta on läpinäkyvä. Käyttökehysten nolla-alfan RGB on siivottu nollaksi.

Korvattua SVG-kirjastoa ei ole runtime-hakemistossa. Pieni vertailukuva näyttää sen vain regressioesimerkkinä.
