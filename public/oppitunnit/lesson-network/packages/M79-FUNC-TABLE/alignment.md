# Lite-yhteensovitus — M79-FUNC-TABLE

NodeSpec algebra79b.ts, audit1-2026-10-28. Muuttumaton vertailulähde, ei hyväksytty pedagoginen auktoriteetti.

- rule: choice; valitsee oikean vaihtoehdon; vihje: Paljonko y kasvaa joka rivillä? Mikä y on, kun x = 0?; selitys: Kun x kasvaa yhdellä, y kasvaa 2: kerroin on 2. Kun x = 0, y = 2.
- table: choice; valitsee oikean vaihtoehdon; vihje: Laske itse y, kun x = 0, 1 ja 2, ja vertaa.; selitys: Lasketaan: 0 → 2, 1 → 4, 2 → 6.
- detect: place; sijoittaa osat oikeille paikoille; vihje: Kasvu on kahden peräkkäisen y:n erotus. Ennusteessa muista lisätä vakio.; selitys: Sääntö on y = 3x + 2, joten x = 5 antaa 17.
- fill: numeric; kirjoittaa luvun; vihje: Sijoita x = 3 sääntöön, tai lisää 2 edellisen rivin y-arvoon.; selitys: Kun x = 3: 2 · 3 + 4 = 10.
- transfer: plot; piirtää pisteet kuvaajaan; vihje: Laske ensin y jokaiselle x:lle. Piste (x, y): ensin oikealle x, sitten ylös y.; selitys: Pisteet: (0, 0), (1, 1), (2, 2), (3, 3).

index.ts yhdistää ALGEBRA79B_NODES ja täydentää GOALS-puutteet; molemmilla oma audit1-revisio ja tavoite. SIMS ei sisällä kumpaakaan KC:tä. families.ts yhdistää manifestin ja node/*/tag-deklaraatiot; effective family()-rivit inventoitu. Dynaamista kanonista sääntöä ei ole.

LESSON_AUDIT: staattinen arvotaulukko korvattu tableFillScene-demolla, lisätty negatiivinen demo, kohdennetut vihjeet/whyAt ja detect. COVERAGE on vanhentunut: vain yksi demo ja ei detect/place; todellinen lähde ratkaisee.

Demot: [{"say": "Funktio y on kaksi x plus yksi. Jokainen x lasketaan säännöllä vuorotellen, ja tulos kirjataan omalle rivilleen. Lopuksi katsotaan, mitä taulukko kertoo säännöstä.", "label": "arvotaulukon täyttö", "seconds": 13.3, "finalCaption": "Kun x = 0, y = 1. Se on säännön vakio. Taulukosta näkee säännön."}, {"say": "Sama toimii negatiivisilla luvuilla: y on kolme x miinus kaksi. Kun x on miinus yksi, y on miinus viisi. Kerroin näkyy kasvuna, vakio rivillä x on nolla.", "label": "arvotaulukon täyttö", "seconds": 11.8, "finalCaption": "Kun x = 0, y = −2. Se on säännön vakio. Taulukosta näkee säännön."}]

Oma käsittely: Annetut säännöt 2x+1, 8−x ja 4; harjoituksen syötteet 0,2,5, kontekstin sallittu alue kokonaisluvut 0–5. Kolme manuaalisesti kirjattua tulosta muodostaa kokonaisen taulukon. Rivin järjestys ei muuta paria. Vakiofunktion toistuvat tulokset ovat päteviä. Äärellinen taulukko ei määrää yleistä sääntöä yksikäsitteisesti. Negatiivinen sijoitus selitetään lisäesimerkissä, ei tarkistetussa kontekstissa. Kuvaajan piirtäminen ei kuulu tarkistukseen.

Rajaus ja sovitusehdotus: Liten detect sanoo yhden lapun jäävän yli, mutta siinä on viisi lappua ja kolme paikkaa eli kaksi yli. Tätä sanamuotoa ei kopioida. Peräkkäisillä x-arvoilla +k-askel toimii, muulloin ei. Äärellisten rivien pohjalta ei väitetä löydetyn ainoaa yleistä sääntöä. Liten graafinen transfer kuvataan inventaariossa, mutta sitä ei väitetä harjoitelluksi tässä. Ei Lite-muutoksia.

Lite-demojen ja tehtävien lähdekatselmus ei ole hyväksyntä. Alkuperäistä Liteä ei muutettu.
Tunnistaminen ei yksin osoita taulukon rakentamista; oma harjoitus kirjaa kaikki kolme riviä.

Täydellinen tehokas perherekisteri, yksi todellinen tehtävä/vihje/selitys jokaisesta perheestä, lähdetiivisteet ja vaihevalinta ovat lesson.json alignment-tietueessa. Historiallisia Lite-auditin testituloksia ei väitetä tämän paketin tuloksiksi.
