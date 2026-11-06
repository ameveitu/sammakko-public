# Lite-yhteensovitus — M79-VAR-01

NodeSpec algebra79b.ts, audit1-2026-10-28. Muuttumaton vertailulähde, ei hyväksytty pedagoginen auktoriteetti.

- same: numeric; kirjoittaa luvun; vihje: Sama kirjain tarkoittaa samaa lukua. Mikä luku 2 kertaa on 6?; selitys: Sama kirjain on sama luku: 2x = 6, joten x = 3.
- can: choice; valitsee oikean vaihtoehdon; vihje: Ovatko kirjaimet samat vai eri? Eri kirjaimet saavat olla eri lukuja.; selitys: Kyllä: 4 + 4 = 8. Eri kirjaimet voivat saada eri arvot.
- roles: sort; lajittelee jokaisen kuvan oikeaan laatikkoon; vihje: Yhtälö, jossa on annettu luku, toteutuu yhdellä luvulla. Sääntö toimii monella arvolla.; selitys: Yhtälössä kirjain on yksi luku, joka voidaan ratkaista. Säännössä kirjain voi saada monta arvoa.
- classify: choice; valitsee oikean vaihtoehdon; vihje: Onko merkinnässä =-merkki ja luku, jonka pitää täsmätä? Vai kertooko se säännön, joka toimii monella arvolla?; selitys: Yhtälössä kirjain on yksi tietty luku, joka voidaan ratkaista.
- transfer: choice; valitsee oikean vaihtoehdon; vihje: Onko piirin pituus annettu? Silloin s on yksi tietty sivu.; selitys: 4s = 12, joten s = 3: yksi luku.

index.ts yhdistää ALGEBRA79B_NODES ja täydentää GOALS-puutteet; molemmilla oma audit1-revisio ja tavoite. SIMS ei sisällä kumpaakaan KC:tä. families.ts yhdistää manifestin ja node/*/tag-deklaraatiot; effective family()-rivit inventoitu. Dynaamista kanonista sääntöä ei ole.

LESSON_AUDIT: roolien rinnakkaiset kokeilut roleScene ja saman kirjaimen sameLetterScene sekä roles-sort ja same-whyAt lisätty. COVERAGE ei sisällä roles-sort-perhettä ja näyttää vanhan fallback-revision; todellinen audit1-lähde ratkaisee.

Demot: [{"say": "Kokeillaan samoja lukuja kahteen paikkaan. Yhtälössä x plus neljä on yhdeksän vain yksi luku toimii: viisi. Säännössä hinta on kolme n jokainen n kelpaa.", "label": "x + 4 = 9 ja hinta = 3n", "seconds": 11, "finalCaption": "Yhtälössä kirjain on yksi tietty luku (5). Säännössä kirjain voi saada monta arvoa."}, {"say": "Kun samassa yhtälössä on kaksi x:ää, ne ovat sama luku. x plus x on kymmenen: kolme ja seitsemän ei käy, mutta viisi ja viisi käy. Eri kirjaimet a ja b saavat olla eri lukuja.", "label": "x + x = 10", "seconds": 13.3, "finalCaption": "x + x = 10 vain, kun x = 5. Jos kirjaimet ovat eri, esimerkiksi a + b = 10, ne voivat olla 3 ja 7."}]

Oma käsittely: Sama kolmen yhtä suuren ryhmän sääntö K=3n kahdessa roolissa. Vapaat suunnitelmat n kokonaisluvuista 0–6; annetut tilaukset 12 ja 15. Tarkistus vaatii kaksi eri pätevää vapaata suunnitelmaa JA tilaukseen sopivan tuntemattoman; kumpikaan vanhempi ei yksin riitä. Neljä yhtä pitkää sivua ja annettu P=4s siirtävät roolieron geometriaan selitettynä, ilman mittausta ruudulta. Yhtälöiden ratkaisumäärän yleistäminen torjutaan.

Rajaus ja sovitusehdotus: Liten yhtälö=aina yksi tuntematon -vihje on liian yleinen. Rooli ratkaistaan tilanteesta; yhtälöt x=x ja x+1=x ovat rajauksen vastaesimerkkejä. Sama kirjain sama luku koskee yhtä kontekstia, eri kirjaimet voivat myös olla samansuuruisia. Perhe can sisältää myös parittoman summan puolikkaita; oma korttimalli ei määrittele yleistä muuttujaa kokonaisluvuksi. Vanhempien AND-ryhmää ei korvata yhdellä luokittelutehtävällä. Ei Lite-muutoksia.

Lite-demojen ja tehtävien lähdekatselmus ei ole hyväksyntä. Alkuperäistä Liteä ei muutettu.
Roolien luokittelu tai yhden tuntemattoman ratkaiseminen ei yksin osoita kanonista integraatiota. Oma työ soveltaa molempia; ei muodollista näyttömerkintää.

Täydellinen tehokas perherekisteri, yksi todellinen tehtävä/vihje/selitys jokaisesta perheestä, lähdetiivisteet ja vaihevalinta ovat lesson.json alignment-tietueessa. Historiallisia Lite-auditin testituloksia ei väitetä tämän paketin tuloksiksi.
