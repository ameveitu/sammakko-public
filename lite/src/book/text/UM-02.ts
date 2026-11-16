import type { PageText } from '../text';

/** UM-02 Lyhtyjen konepaja: decomposing algorithms, programming, testing, clarity and research tools. */
export const TEXT: Record<string, PageText> = {
  'M79-ALGTH-01': {
    beats: [
      { text: 'Kone saa syötteenä luvun n, esimerkiksi lyhtyjen määrän. Se aloittaa arvosta 2, lisää 3 jokaisesta lyhdystä ja tulostaa lopuksi määrän.', pic: 0, figure: false },
      { text: 'Ongelma pilkotaan vaiheisiin: lue n, toista lisäys n kertaa, tulosta tulos. Jokainen vaihe tekee yhden asian.', more: 'Jos parillisesta lyhtymäärästä tulee lisäbonus, väliin tulee vielä vaihe ”päätä, lisätäänkö bonus”.', pic: 0, figure: false },
      { example: 'Syöte on n = 2. Mitä kone tulostaa?', text: 'Rajapinta kertoo, mitä vaihe saa ja mitä se antaa eteenpäin. Toistovaihe saa alkuarvon 2 ja luvun 2, ja se antaa tulostukselle luvun 2 + 3 + 3 = 8.', pic: 0, figure: false },
    ],
    try: {
      say: 'Lyhtykoneen vaiheet ovat: lue n, toista lisäys n kertaa ja tulosta. Missä järjestyksessä kone tekee ne?',
      options: ['Lue n → toista lisäys → tulosta', 'Toista lisäys → lue n → tulosta', 'Lue n → tulosta → toista lisäys'],
      answer: 0,
      explain: 'Toisto tarvitsee luvun n, joten n luetaan ensin. Tulos tulostetaan vasta, kun kaikki lisäykset on tehty.',
      why: [null, 'Toisto tarvitsee luvun n tietääkseen, montako kertaa lisätään. Siksi n luetaan ensin.', 'Tulos tulostetaan vasta, kun kaikki lisäykset on tehty.'],
    },
  },
  'M79-TECH-01': {
    beats: [
      { text: 'Suorakulmion leveys ja pituus ovat yhteensä 7 yksikköä. Kun leveys on x, pituus on 7 − x ja ala x · (7 − x).', pic: 0, figure: false },
      { text: 'Ohjelma laskee alan leveyksille 1–6: tulokset ovat 6, 10, 12, 12, 10 ja 6. Taulukosta näkyy, että suurin ala 12 saadaan sivuilla 3 ja 4.', pic: 0, figure: false },
      { text: 'Tietokone tekee toistuvat laskut nopeasti, mutta johtopäätöksen rajat pitää kertoa. Tässä tutkittiin vain kokonaislukuleveydet.', more: 'Jos leveys saisi olla 3,5, myös pituus olisi 3,5 ja ala 3,5 · 3,5 = 12,25. Johtopäätös ”suurin ala on 12” koskee siis vain kokonaislukuleveyksiä.', pic: 0, figure: false },
    ],
    try: {
      say: 'Suorakulmion leveys ja pituus ovat yhteensä 7. Millä kokonaislukuleveydellä sen ala on suurin?',
      options: ['3 tai 4', '6', 'Ala on aina sama, koska piiri on sama'],
      answer: 0,
      explain: 'Leveydellä 3 ala on 3 · 4 = 12, ja leveydellä 4 se on 4 · 3 = 12. Sama piiri ei tarkoita samaa alaa.',
      why: [null, 'Silloin pituus on vain 1, ja ala on 6 · 1 = 6.', 'Ala vaihtelee: leveydellä 1 se on 6, leveydellä 3 jo 12.'],
    },
  },
  'M79-PROG-01': {
    beats: [
      { text: 'Ohje ”aloita arvosta 2 ja lisää 3 jokaisesta lyhdystä” kirjoitetaan ohjelmaksi. Ohjelma antaa muuttujalle arvon 2, toistaa lisäyksen n kertaa ja tulostaa tuloksen.', pic: 0, figure: false },
      { text: 'Toisto tekee saman käskyn monta kertaa. Kun n = 3, muuttujan arvo kulkee 2 → 5 → 8 → 11, ja kone tulostaa 11.', pic: 0, figure: false },
      { text: 'Ehto suorittaa käskyn vain, kun ehto on tosi. Käsky ”jos n on parillinen, lisää vielä 1” muuttaa tulosta vain parillisilla syötteillä.', pic: 0, figure: false },
    ],
    try: {
      say: 'Ohjelma: summa = 2, toista n kertaa: summa = summa + 3, tulosta summa. Mitä se tulostaa, kun n = 4?',
      options: ['14', '12', '20', '17'],
      answer: 0,
      explain: 'Summa kulkee 2 → 5 → 8 → 11 → 14. Lisäys tehdään 4 kertaa: 2 + 4 · 3 = 14.',
      why: [null, 'Unohdit alkuarvon: 4 · 3 = 12, ja siihen lisätään vielä 2.', 'Alkuarvoa ei kerrota: 2 + 4 · 3 = 14, ei (2 + 3) · 4.', 'Lisäys tehdään 4 kertaa, ei 5 kertaa.'],
    },
  },
  'M79-PROG-CLEAR': {
    beats: [
      { text: 'Lyhtykoneen muuttujan nimi on a. Kun nimeksi vaihdetaan lyhtyjen_summa, lukija näkee heti, mitä muuttuja laskee.', pic: 0, figure: false },
      { text: 'Selkeässä ohjelmassa on kuvaavat nimet, ja yhteen kuuluvat käskyt on ryhmitelty. Toiminta ei saa muuttua: syötteellä 1 tulos on yhä 5.', pic: 0, figure: false },
      { text: 'Muutoksen jälkeen ohjelma ajetaan samoilla syötteillä kuin ennen. Jos tulokset pysyvät samoina, selkeytys onnistui.', more: 'Toiminnan säilyttävää siistimistä kutsutaan refaktoroinniksi.', pic: 0, figure: false },
    ],
    try: {
      say: 'Teet ohjelmasta selkeämmän. Miten varmistat, ettei sen toiminta muuttunut?',
      options: ['Ajan sen samoilla syötteillä ja vertaan tuloksia', 'Katson, että koodi näyttää siistimmältä', 'Ajan sen kerran, ja jos se ei kaadu, se toimii'],
      answer: 0,
      explain: 'Toiminta on säilynyt, kun samat syötteet antavat samat tulokset kuin ennen muutosta.',
      why: [null, 'Siisti ulkonäkö ei todista, että tulokset pysyivät samoina.', 'Ohjelma voi toimia kaatumatta mutta antaa väärän tuloksen.'],
    },
  },
  'M79-PROG-TEST': {
    beats: [
      { example: 'Koneen pitäisi aloittaa arvosta 2 ja lisätä 3 jokaisesta lyhdystä. Syötteellä 1 se tulostaa 8. Missä vika on?', text: 'Ennuste on 2 + 3 = 5, mutta havainto on 8. Ero on 3 eli yksi lisäys: kone toistaa lisäyksen kerran liikaa.', pic: 0, figure: false },
      { text: 'Testaa järjestelmällisesti: ennusta tulos ensin ja kokeile sitten. Valitse tavallinen syöte, rajatapaus 0 ja virheellinen syöte, kuten −1.', pic: 0, figure: false },
      { text: 'Myös syöte 0 paljastaa vian: tuloksen pitäisi olla 2, mutta kone antaa 5. Virheellisellä syötteellä −1 hyvä ohjelma ilmoittaa virheestä.', pic: 0, figure: false },
    ],
    try: {
      say: 'Koneen pitäisi tulostaa 2 + 3 · n. Syötteellä 2 se tulostaa 11. Mikä vika koneessa on?',
      options: ['Se lisää 3 yhden kerran liikaa', 'Se unohtaa alkuarvon 2', 'Se lisää 4 eikä 3'],
      answer: 0,
      explain: 'Oikea tulos on 2 + 3 · 2 = 8. Kone antaa 11 eli 3 enemmän: se tekee lisäyksen kolme kertaa eikä kaksi.',
      why: [null, 'Silloin tulos olisi 3 · 2 = 6, vähemmän kuin 8.', 'Silloin tulos olisi 2 + 4 + 4 = 10, ei 11.'],
    },
  },
  'M79-PROG-PRACTICE': {
    beats: [
      { text: 'Lyhtykone toimii: syötteellä 1 se tulostaa 5. Nyt sitä muokataan, esimerkiksi muuttuja saa paremman nimen.', pic: 0, figure: false },
      { text: 'Tee yksi pieni muutos kerrallaan ja testaa heti. Jos tulos muuttuu, tiedät, mikä muutos sen aiheutti.', pic: 0, figure: false },
      { text: 'Kerro lopuksi, mitä muutit ja miten testasit. Havainto ”syötteillä 0, 1 ja 5 tulokset 2, 5 ja 17 pysyivät” on hyvä perustelu.', pic: 0, figure: false },
    ],
    try: {
      say: 'Teit ohjelmaan kolme muutosta kerralla, ja nyt tulos on väärä. Mikä olisi auttanut?',
      options: ['Testata jokaisen muutoksen jälkeen', 'Tehdä vielä yksi muutos lisää', 'Testata vasta lopuksi isolla syötteellä'],
      answer: 0,
      explain: 'Kun testaat jokaisen muutoksen jälkeen, näet heti, mikä muutos rikkoi ohjelman.',
      why: [null, 'Uusi muutos ei kerro, mikä vanhoista aiheutti virheen.', 'Silloinkaan ei tiedä, mikä kolmesta muutoksesta aiheutti virheen.'],
    },
  },
  'M79-PROG-02': {
    beats: [
      { text: 'Kokonaiskokeessa rakennetaan koko lyhtykone: aloita arvosta 2, lisää 3 jokaisesta lyhdystä ja tulosta tulos. Syötteellä 1 tuloksen pitää olla 5.', pic: 0, figure: false },
      { text: 'Työ etenee vaiheittain: pilko ongelma, kirjoita ohjelma, anna kuvaavat nimet ja testaa. Jokainen vaihe tarkistetaan ennen seuraavaa.', pic: 0, figure: false },
      { text: 'Valmis ohjelma toimii kaikilla sallituilla syötteillä 0–5, ei vain esimerkillä. Syötteellä 5 tuloksen pitää olla 2 + 3 · 5 = 17.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kone aloittaa 2:sta, lisää 3 jokaisesta lyhdystä ja parillisella lyhtymäärällä vielä 1. Mitä se tulostaa 4 lyhdyllä?',
      options: ['15', '14', '18'],
      answer: 0,
      explain: '2 + 4 · 3 = 14, ja koska 4 on parillinen, lisätään vielä 1. Tulos on 15.',
      why: [null, 'Ehto unohtui: 4 on parillinen, joten lisätään vielä 1.', 'Lisäys 3 tehdään 4 kertaa, ei 5: 2 + 12 + 1 = 15.'],
    },
  },
};
