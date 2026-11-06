# Sisi — hyväksytty sisiliskokonsepti v1

Tila: käyttäjä hyväksyi tämän vihreän, unisen sisiliskon jatkotuotannon lähtökohdaksi 2026-11-05 ja antoi nimeksi **Sisi**. Tarkka vastaus: ”Hyväksyn, nimi on Sisi”. Hyväksyntä koskee tiedoston `sleepy-lizard-v1.png` konseptia ja nimeä. Sen perusteella mallin, rigin ja animaatioiden tuotanto voi jatkua. Valmis 3D-toteutus tarkastetaan erikseen.

Lähteet: käyttäjän alkuperäinen piirros `docs/lite-690/source/references/sisilisko_kayttajan_alkuperainen.jpg`; tyyliviite hyväksytty `art/characters/aava/sit.png`. Tuotettu sisäisellä image_gen-työkalulla 2026-11-05. Alkuperäistä piirrosta ja Aavaa ei muutettu.

Promptin tarkoitus: säilytä suuri pyöreä pää, uninen matala luomi, pieni pyöreä kuono, lyhyt roikkuva käsi, pyöreä pystyvartalo, pehmeä sahalaitainen selkä sekä maassa lepäävä kaartuva häntä. Kolme konseptiasentoa samalla luonnonvalkoisella arkilla. Kirkas lehti-/sammalenvihreä, vaalea limevatsa, tumma sinivihreä ääriviiva, Aavan värikynämäinen pinta. Ei nimiä, vaatteita, hampaita, realistisia suomuja, muovista 3D-pintaa tai uutta oheishahmoa.

Tarkastettu visuaalisesti: hahmo on tunnistettavasti alkuperäisen piirroksen vihreä jatko. Kolmen asennon konsepti toimii hyväksyttynä muotokielen ja värien lähtökohtana. Alkuperäinen ASTRA_HANDOFF.md säilyy muuttumattomana historiatietona; sen vaatima tämän hahmon konkreettinen konseptihyväksyntä on saatu. Valinnainen pöllö ei sisälly tähän hyväksyntään.

Tarkka kuvan SHA-256 ja hyväksynnän rajaus: [APPROVAL.json](APPROVAL.json). Tuotantotyömääräin: [Sisi 3D](../../../../docs/lite-690/work-orders/sisi-3d.md).

## Etukuvaviite `front-reference-v1.png` (apukuva, ei hyväksytty konsepti)

Käyttäjä pyysi 2026-11-05 tekemään Sisistä ensin etukuvan kuvatyökalulla, jotta 3D-mallin edestä katsottu muoto saadaan oikeaksi. `front-reference-v1.png` on tuotettu `tools/imagegen`-työkalulla kahdessa vaiheessa: ensin etukuva sivukuvasta (`front-reference-v1.base.provenance.json`), sitten suun ja kielen korjaus sivukuvan mukaiseksi (`front-reference-v1.provenance.json`). Tiedostojen SHA-256, malli ja promptit ovat provenance-tiedostoissa.

Kuva on 3D-mallin mittaviite: se määrää pään, vartalon, jalkojen ja hännän leveyden edestä katsottuna (`tools/characters-3d/profile/sisi_parts.py`). Sivukuva `sleepy-lizard-v1.png` määrää edelleen kaiken sivulta näkyvän. Etukuvaa ei ole hyväksytty hahmokonseptiksi, eikä se laajenna `APPROVAL.json`-hyväksyntää. Etukuvan selän piikit ja punainen kieli poikkeavat sivukuvasta; 3D-malli seuraa niissä sivukuvaa.
