import type { PageText } from '../text';

/** UM-18 Tilastosatama: collecting and structuring data, diagrams, frequencies, averages, spread and probability. */
export const TEXT: Record<string, PageText> = {
  'M79-DATA-COLLECT': {
    beats: [
      { text: 'Tutkimuskysymys koskee kaikkia kolmea laituria aamulla ja illalla. Aineiston pitää siis kattaa jokainen laituri ja molemmat vuorokaudenajat.', pic: 0 },
      { text: 'Muuttuja on laiturikäyntien määrä, ja jokainen käynti lasketaan yhtä pitkän havaintoikkunan ajan. Silloin eri paikkojen ja aikojen luvut ovat vertailukelpoisia.', pic: 0 },
      { text: 'Ruovikkolaiturilla käyntejä oli aamulla 6 ja keskipäivällä 9, Pohjoislaiturilla aamulla 4 ja Kalliolaiturilla illalla 10. Päätelmät koskevat vain näitä käyntejä.', more: 'Jos kaikki käynnit tehtäisiin aamulla, illan tilanne jäisi kokonaan näkemättä. Kattavakaan aineisto ei kerro päivistä, joita ei tutkittu.', pic: 0 },
    ],
    try: {
      say: 'Haluat selvittää, keinutaanko koulun pihalla enemmän aamulla vai iltapäivällä. Miten havainnot kerätään?',
      options: ['Aamulla ja iltapäivällä yhtä pitkään', 'Vain aamulla', 'Aamulla 5 minuuttia, iltapäivällä tunnin'],
      answer: 0,
      explain: 'Molemmat ajat on otettava mukaan, ja havaintoikkunan on oltava yhtä pitkä. Muuten ero voi johtua laskutavasta eikä keinujista.',
      why: [null, 'Iltapäivän tieto puuttuu, joten vertailua ei voi tehdä.', 'Tunnissa kertyy enemmän keinujia kuin viidessä minuutissa, vaikka käyttö olisi sama.'],
    },
  },
  'M79-DIAGRAM-INTERP': {
    beats: [
      { text: 'Julisteessa aamun otoksessa on 42 havaintoa ja illan 46, mutta pystyakseli alkaa luvusta 38. Siksi illan pylväs näyttää kaksi kertaa niin korkealta.', pic: 0 },
      { text: 'Todellinen ero on vain 46 − 42 = 4 havaintoa, alle 10 %. Katkaistu asteikko suurentaa muutoksen vaikutelmaa, joten tarkista aina, mistä akseli alkaa.', pic: 0 },
      { text: 'Toisessa julisteessa aamulla on 16 havaintoa 48:sta ja illalla 13 havaintoa 26:sta. Määrä laski, mutta osuus nousi: 16/48 = 1/3 ja 13/26 = 1/2.', more: 'Kun otoskoot eroavat, pelkät lukumäärät voivat johtaa harhaan. Vertaa silloin osuuksia, ja kerro päätelmässä, että se koskee vain näitä kahta otosta.', pic: 1 },
    ],
    try: {
      say: 'Pystyakseli alkaa luvusta 90, ja pylväät ovat 95 ja 100. Toinen pylväs näyttää kaksi kertaa korkeammalta. Mitä voi päätellä?',
      options: ['Ero on vain 5, noin 5 %', 'Toinen arvo on kaksi kertaa suurempi', 'Katkaistusta asteikosta ei voi lukea arvoja'],
      answer: 0,
      explain: 'Akselilta luetaan arvot 95 ja 100, joten ero on 5 eli noin 5 %. Pylväät näyttävät kaksinkertaisilta vain, koska akseli alkaa luvusta 90.',
      why: [null, 'Pylväiden korkeudet mitataan luvusta 90, eivät nollasta. Arvot ovat 95 ja 100.', 'Arvot voi lukea akselilta. Vain pylväiden korkeuksien suhde harhaanjohtaa.'],
    },
  },
  'M79-DIAGRAM-PROD': {
    beats: [
      { text: 'Kysytään, miten havaintomäärä muuttui päivän mittaan. Taulukossa havaintoja on klo 8.00: 12, klo 10.00: 10, klo 12.00: 7 ja klo 14.00: 5.', pic: 0 },
      { text: 'Muutos ajan kuluessa näkyy parhaiten viivadiagrammina. Vaaka-akselille tulee kellonaika ja pystyakselille havaintojen määrä kappaleina.', pic: 0 },
      { text: 'Pystyakseli alkaa nollasta ja nousee kahden välein 12:een, joten pisteiden korkeudet ovat oikeassa suhteessa. Valmis viiva laskee koko päivän.', more: 'Tarkista lopuksi yksi arvo lähdetaulukosta sekä akselien nimet ja yksikkö. Esimerkiksi kello 8.00 kohdalla pisteen pitää olla korkeudella 12.', pic: 0 },
    ],
    try: {
      say: 'Teet pylväsdiagrammin arvoista 48, 50 ja 52. Mistä pystyakselin pitää alkaa?',
      options: ['Nollasta', 'Luvusta 48', 'Luvusta 47, jotta erot näkyvät'],
      answer: 0,
      explain: 'Pylvään korkeus kuvaa määrää, joten akselin on alettava nollasta. Muuten pienet erot näyttävät suurilta.',
      why: [null, 'Silloin pienimmän arvon pylväs katoaisi kokonaan, ja erot näyttäisivät valtavilta.', 'Katkaistu akseli liioittelee eroja, eivätkä pylväät olisi oikeassa suhteessa.'],
    },
  },
  'M79-PROB-SPACE': {
    beats: [
      { text: 'Pakassa on kortit A, B ja C. Nostetaan kaksi korttia peräkkäin palauttamatta ensimmäistä, ja järjestys merkitsee: A·C ja C·A ovat eri tuloksia.', pic: 0 },
      { example: 'Mitkä ovat kaikki mahdolliset tulokset?', text: 'Ensimmäiseksi voi tulla 3 korttia ja toiseksi jäljellä olevista 2, joten tuloksia on 3 · 2 = 6: A·C, A·B, C·A, C·B, B·A ja B·C.', pic: 0 },
      { text: 'Kaikkien mahdollisten tulosten joukkoa sanotaan alkeistulosjoukoksi. Jos järjestys ei merkitsisi, A·C ja C·A olisivat sama pari, ja tuloksia olisi vain 3.', more: 'Jos ensimmäinen kortti palautettaisiin, sama kortti voisi tulla kahdesti. Silloin mukaan tulisivat myös A·A, B·B ja C·C, ja tuloksia olisi 3 · 3 = 9.', pic: 0 },
    ],
    try: {
      say: 'Kolmesta oppilaasta valitaan puheenjohtaja ja sihteeri, eikä sama voi olla molempia. Montako vaihtoehtoa on?',
      options: ['6', '3', '9'],
      answer: 0,
      explain: 'Puheenjohtajaksi on 3 vaihtoehtoa ja sihteeriksi jäljelle jääneet 2, eli 3 · 2 = 6. Järjestys merkitsee, koska tehtävät ovat erilaiset.',
      why: [null, '3 on parien määrä ilman järjestystä. Tehtävät ovat erilaiset, joten järjestys merkitsee.', '9 sisältäisi parit, joissa sama oppilas on molempia, eikä se ole sallittua.'],
    },
  },
  'M79-DATA-STRUCT': {
    beats: [
      { text: 'Lapuissa on laiturikäyntejä: A Kallio aamu 0, B Kallio ilta puuttuu, C Ruovikko aamu 15 ja D Ruovikko ilta 3. Lappu 5 on lapun 3 kaksoiskappale.', pic: 0 },
      { text: 'Taulukossa jokaisella havainnolla on oma rivi, ja kaksoiskappale jätetään pois. Nolla on mitattu arvo, mutta puuttuva tieto jää tyhjäksi eikä siitä tehdä nollaa.', pic: 0 },
      { text: 'Lukema 15 on sataman tavallisen välin 0–10 ulkopuolella. Sitä ei poisteta eikä korjata, vaan se merkitään tarkistettavaksi.', more: 'Jos puuttuva arvo muutettaisiin nollaksi, keskiarvo pienenisi väärin perustein. Poikkeava arvo voi olla virhe tai aito harvinainen havainto, ja vain tarkistus kertoo, kumpi.', pic: 0 },
    ],
    try: {
      say: 'Havaintovihossa yhden päivän kohdalla lukee "ei mitattu". Mitä taulukkoon merkitään?',
      options: ['Puuttuva tieto, solu jää tyhjäksi', 'Nolla', 'Muiden päivien keskiarvo'],
      answer: 0,
      explain: 'Mittaamatta jäänyt arvo on tuntematon, ei nolla. Kun se merkitään puuttuvaksi, se ei vääristä laskuja.',
      why: [null, 'Nolla tarkoittaa, että mitattiin ja tulos oli 0. Nyt mittausta ei tehty.', 'Keksitty arvo näyttäisi oikealta havainnolta, vaikka sitä ei mitattu.'],
    },
  },
  'M79-MODE': {
    beats: [
      { text: 'Kymmenestä retkivalinnasta Kallio ja Ruovikko esiintyvät kumpikin 4 kertaa ja Laituri 2 kertaa. Yleisintä arvoa sanotaan tyyppiarvoksi.', pic: 0 },
      { text: 'Yleisimpiä arvoja on kaksi, joten tyyppiarvoja ovat sekä Kallio että Ruovikko. Laituri on harvinaisempi, joten se ei ole tyyppiarvo.', pic: 0 },
      { text: 'Tässä on sovittu, että jos kaikki eri arvot ovat yhtä yleisiä, tyyppiarvoa ei nimetä. Silloin mikään arvo ei erotu muita yleisempänä.', more: 'Tyyppiarvo sopii myös sanallisiin aineistoihin, kuten paikkoihin tai väreihin. Niistä ei voi laskea keskiarvoa eikä mediaania.', pic: 0 },
    ],
    try: {
      say: 'Kenkien koot ovat 36, 38, 38, 39, 40, 40 ja 41. Mikä on tyyppiarvo?',
      options: ['38 ja 40', '39', 'Ei ole, koska yleisimpiä on kaksi'],
      answer: 0,
      explain: '38 ja 40 esiintyvät kumpikin kahdesti, muut vain kerran. Molemmat ovat siis tyyppiarvoja.',
      why: [null, '39 on keskimmäinen arvo eli mediaani. Tyyppiarvo on yleisin arvo.', 'Tyyppiarvoja voi olla useita. Sitä ei nimetä vain, jos kaikki arvot ovat yhtä yleisiä.'],
    },
  },
  'M79-PROB-CLASSIC': {
    beats: [
      { text: 'Ensimmäisessä kiekossa on yhtä suuret sektorit A, B ja C, toisessa sektorit 2 ja 1. Kun molempia pyöräytetään, mahdollisia pareja on 3 · 2 = 6.', pic: 0 },
      { example: 'Millä todennäköisyydellä ensimmäinen kiekko näyttää A:ta?', text: 'Suotuisia pareja ovat A·2 ja A·1, eli niitä on 2. Todennäköisyys on suotuisat / kaikki = 2/6 = 1/3.', pic: 0 },
      { text: 'Suhde suotuisat / kaikki pätee vain, kun kaikki tulokset ovat yhtä mahdollisia. Tässä se pätee, koska sektorit ovat yhtä suuret ja pyöräytykset riippumattomia.', more: 'Jos A-sektori olisi puolet kiekosta, parit eivät olisi yhtä todennäköisiä. Silloin pelkkä parien laskeminen ei antaisi oikeaa todennäköisyyttä.', pic: 0 },
    ],
    try: {
      say: 'Heität kolikkoa ja noppaa. Millä todennäköisyydellä saat kruunan ja kuutosen?',
      options: ['1/12', '1/6', '1/8'],
      answer: 0,
      explain: 'Yhtä mahdollisia tuloksia on 2 · 6 = 12, ja vain yksi niistä on kruuna ja kuutonen. Todennäköisyys on siis 1/12.',
      why: [null, '1/6 on pelkän kuutosen todennäköisyys. Kolikon pitää lisäksi näyttää kruunaa.', 'Tulosten määrä saadaan kertomalla, 2 · 6 = 12, ei laskemalla yhteen.'],
    },
  },
  'M79-FREQ': {
    beats: [
      { text: 'Havaintovihossa on 9 lintuhavaintoa: kuikka, sorsa, tiira, sorsa, sorsa, sorsa, tiira, kuikka ja tiira. Lasketaan, montako kertaa kukin laji esiintyy.', pic: 0 },
      { text: 'Esiintymien lukumäärää sanotaan frekvenssiksi: sorsan frekvenssi on 4, tiiran 3 ja kuikan 2. Lokkia ei nähty, joten sen frekvenssi on 0.', pic: 0 },
      { text: 'Frekvenssien summa on aina havaintojen määrä: 4 + 3 + 2 + 0 = 9. Näin tarkistat, ettei yksikään havainto jäänyt laskematta tai tullut laskettua kahdesti.', pic: 0 },
    ],
    try: {
      say: 'Noppaa heitettiin 20 kertaa: ykkösiä tuli 3, kakkosia 4, kolmosia 2, nelosia 5 ja vitosia 4. Montako kuutosta tuli?',
      options: ['2', '18', '0'],
      answer: 0,
      explain: 'Frekvenssien summa on heittojen määrä 20. Muita tuli 3 + 4 + 2 + 5 + 4 = 18, joten kuutosia oli 20 − 18 = 2.',
      why: [null, '18 on muiden silmälukujen yhteismäärä. Kuutoset ovat se, mitä 20:stä jää jäljelle.', 'Jos kuutosia olisi 0, frekvenssien summa olisi 18 eikä 20.'],
    },
  },
  'M79-MEDIAN': {
    beats: [
      { text: 'Viisi havaintoa millimetreinä ovat 9, 13, 5, 11 ja 9. Mediaani on järjestetyn jonon keskimmäinen arvo.', pic: 0 },
      { example: 'Mikä on havaintojen mediaani?', text: 'Järjestetään pienimmästä suurimpaan: 5, 9, 9, 11, 13. Keskimmäinen eli kolmas arvo on 9, joten mediaani on 9 mm.', pic: 0 },
      { text: 'Jos havaintoja on parillinen määrä, mediaani on kahden keskimmäisen keskiarvo. Tässä suurimman arvon 13 vaihtaminen 50:ksi ei muuta mediaania: se on yhä 9 mm.', more: 'Kaksi samansuuruista lukua, kuten 9 ja 9, ovat eri havaintoja. Molemmat pidetään jonossa mukana.', pic: 0 },
    ],
    try: {
      say: 'Havainnot ovat 4, 7, 8 ja 12 cm. Mikä on mediaani?',
      options: ['7,5 cm', '7 cm tai 8 cm', 'Ei mediaania, koska havaintoja on neljä'],
      answer: 0,
      explain: 'Kaksi keskimmäistä ovat 7 ja 8. Mediaani on niiden keskiarvo: (7 + 8) / 2 = 7,5 cm.',
      why: [null, 'Kun keskimmäisiä on kaksi, mediaani on niiden keskiarvo, yksi luku.', 'Parillisellekin määrälle on mediaani: kahden keskimmäisen keskiarvo.'],
    },
  },
  'M79-SPREAD': {
    beats: [
      { text: 'Ruovikon havainnot ovat 7, 8, 9, 9, 10 ja 11 mm, kallion 5, 7, 9, 9, 11 ja 13 mm. Molempien keskiarvo on 54 / 6 = 9 mm.', pic: 0 },
      { text: 'Vaihteluväli ulottuu pienimmästä suurimpaan: ruovikossa 7–11 mm eli leveys 4 mm, kalliolla 5–13 mm eli leveys 8 mm. Kallion havainnot hajoavat enemmän.', pic: 0 },
      { text: 'Keskialueelle 7–11 mm osuu ruovikosta kaikki 6 havaintoa, kalliolta vain 4. Hajonta kertoo, kuinka paljon havainnot vaihtelevat keskiarvon ympärillä.', more: 'Pelkkä keskiarvo ei kerro hajonnasta mitään. Kahdella aineistolla voi olla jopa sama vaihteluväli, mutta havainnot voivat silti keskittyä eri tavoin.', pic: 0 },
    ],
    try: {
      say: 'Kahden luokan koetulosten keskiarvo on 8. Luokassa A tulokset ovat 7–9, luokassa B 4–10. Kummassa tulokset vaihtelevat enemmän?',
      options: ['Luokassa B', 'Luokassa A', 'Yhtä paljon, koska keskiarvo on sama'],
      answer: 0,
      explain: 'B:n vaihteluvälin leveys on 10 − 4 = 6, A:n vain 9 − 7 = 2. Sama keskiarvo ei kerro, kuinka paljon tulokset hajoavat.',
      why: [null, 'A:n tulokset ovat lähellä toisiaan, välillä 7–9.', 'Keskiarvo kertoo vain tason, ei hajontaa.'],
    },
  },
  'M79-RELFREQ': {
    beats: [
      { text: 'Ruovikkopäivänä lokkikäyntejä oli 4 kaikista 20 havainnosta, kalliopäivänä 4 kaikista 10 havainnosta. Frekvenssi on sama, mutta havaintoja kertyi eri määrä.', pic: 0 },
      { text: 'Suhteellinen frekvenssi on frekvenssi jaettuna kaikkien havaintojen määrällä. Ruovikossa se on 4/20 = 1/5 = 20 %, kalliolla 4/10 = 2/5 = 40 %.', pic: 0 },
      { text: 'Kalliopäivänä lokkien osuus oli siis kaksinkertainen, vaikka lokkeja nähtiin yhtä monta. Erikokoisia aineistoja verrataan osuuksilla.', more: 'Myös toisin päin voi käydä: 2/10 ja 4/20 ovat eri frekvenssit, mutta sama osuus 1/5.', pic: 0 },
    ],
    try: {
      say: 'Maanantaina 30 oppilaasta 6 pyöräili kouluun, tiistaina 20 oppilaasta 5. Kumpana päivänä pyöräilijöiden osuus oli suurempi?',
      options: ['Tiistaina', 'Maanantaina, koska pyöräilijöitä oli enemmän', 'Osuudet olivat yhtä suuret'],
      answer: 0,
      explain: 'Maanantaina 6/30 = 20 % ja tiistaina 5/20 = 25 %. Tiistaina osuus oli suurempi, vaikka pyöräilijöitä oli vähemmän.',
      why: [null, 'Maanantaina myös oppilaita oli enemmän. Vertaa osuuksia, ei lukumääriä.', 'Osuudet ovat 20 % ja 25 %, eivätkä ne ole samat.'],
    },
  },
  'M79-PROB-EMP': {
    beats: [
      { text: 'Kiekossa on neljä yhtä suurta sektoria, kaksi sinistä ja kaksi punaista. Mallin mukaan sinisen todennäköisyys on 2/4 = 1/2.', pic: 0 },
      { text: 'Kokeessa A 12 pyöräytyksestä 6 oli sinisiä, eli 6/12 = 50 %. Kokeessa B 60 pyöräytyksestä 22 oli sinisiä, eli noin 37 %.', pic: 0 },
      { text: 'Suhteellinen frekvenssi on kokeellinen todennäköisyys, ja suuri otos on yleensä vakaampi. Tällä kertaa pieni otos osui sattumalta lähemmäs mallin arvoa.', more: 'Aiemmat tulokset eivät muuta seuraavaa pyöräytystä: sinisen todennäköisyys on yhä 2/4. Kiekko ei muista, eikä sininen tule "vuorollaan".', pic: 0 },
    ],
    try: {
      say: 'Kolikko on näyttänyt klaavaa viisi kertaa peräkkäin. Millä todennäköisyydellä seuraava heitto on kruuna?',
      options: ['1/2', 'Yli 1/2, koska kruunan on vuoro tulla', 'Alle 1/2, koska klaava toistuu'],
      answer: 0,
      explain: 'Heitot ovat riippumattomia: kolikko ei muista aiempia tuloksia. Kruunan todennäköisyys on joka heitolla 1/2.',
      why: [null, 'Kolikko ei tasaa tuloksia vuorotellen. Jokainen heitto alkaa alusta.', 'Aiempi sarja ei tee klaavasta todennäköisempää, koska kolikko on edelleen tasapainoinen.'],
    },
  },
  'M79-MEAN': {
    beats: [
      { text: 'Viisi havaintoa ovat 10, 13, 9, 13 ja 12 cm. Keskiarvo on summa jaettuna havaintojen määrällä: 57 / 5 = 11,4 cm.', pic: 0 },
      { example: 'Mitä keskiarvolle tapahtuu, kun mukaan tulee uusi havainto 19 cm?', text: 'Summa on nyt 57 + 19 = 76 ja havaintoja on 6, joten keskiarvo on 76/6 ≈ 12,7 cm. Keskiarvo nousi, vaikka vanhat havainnot eivät muuttuneet.', pic: 0 },
      { text: 'Keskiarvo on tasattu arvo: jos 57 cm jaettaisiin tasan viidelle, kukin saisi 11,4 cm. Yksi suuri poikkeava arvo voi siirtää keskiarvoa paljon.', more: 'Mediaani muuttuu vähemmän. Alussa järjestetty jono on 9, 10, 12, 13, 13 ja mediaani 12. Lisäyksen jälkeen keskimmäiset ovat 12 ja 13, joten mediaani on 12,5.', pic: 0 },
    ],
    try: {
      say: 'Kolmen kurpitsan massat ovat 2 kg, 3 kg ja 7 kg. Mikä on niiden keskiarvo?',
      options: ['4 kg', '3 kg', '12 kg'],
      answer: 0,
      explain: 'Summa on 2 + 3 + 7 = 12 kg, ja se jaetaan kolmella: 12 / 3 = 4 kg.',
      why: [null, '3 kg on keskimmäinen arvo eli mediaani, ei keskiarvo.', '12 kg on summa. Se pitää vielä jakaa havaintojen määrällä.'],
    },
  },
};
