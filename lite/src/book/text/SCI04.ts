import type { PageText } from '../text';

/** SCI04 Lämpövuoren retkiasema: temperature, thermal energy and the ways heat moves. */
export const TEXT: Record<string, PageText> = {
  'ENV-PHY-THERMAL-01': {
    beats: [
      { text: 'Aurinko on lämmittänyt kallion pinnan 35 asteeseen. Pinnan vieressä on eväskivi, joka on vain 15 °C.', pic: 0, figure: false },
      { text: 'Lämmin pinta lämmittää kiveä: energiaa siirtyy lämpimämmästä kylmempään. Kivi lämpenee, koska siihen siirtyy energiaa.', pic: 0, figure: false },
      { text: 'Sama toisin päin: kuuma kuppi jäähtyy viileässä ilmassa. Silloin energiaa siirtyy kupista ympäristöön.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kuuma kaakaomuki jäähtyy pöydällä. Mihin suuntaan energiaa siirtyy?',
      options: ['Mukista huoneen ilmaan', 'Huoneen ilmasta mukiin', 'Energiaa ei siirry'],
      answer: 0,
      explain: 'Energiaa siirtyy lämpimämmästä kylmempään. Muki on ilmaa lämpimämpi, joten energiaa lähtee mukista ja kaakao jäähtyy.',
      why: [null, 'Silloin muki lämpenisi. Kylmyys ei virtaa mukiin, vaan energia lähtee siitä.', 'Muki jäähtyy, joten siitä lähtee energiaa.'],
    },
  },
  'ENV-PHY-TEMP-01': {
    beats: [
      { text: 'Lämpötila mitataan lämpömittarilla. Mittari laitetaan veteen ja luetaan vasta, kun lukema ei enää muutu.', pic: 0, figure: false },
      { text: 'Lämpötilan yksikkö on celsiusaste, °C. Kun kummankin kupin vesi on mitattu, lukemia voi verrata: suurempi luku on lämpimämpi.', pic: 0, figure: false },
    ],
    try: {
      say: 'Mittari on vedessä, ja lukema nousee vielä: 18, 21, 23 °C… Milloin lukema kirjataan?',
      options: ['Kun lukema pysyy samana', 'Heti ensimmäinen lukema 18 °C', 'Kun mittari on nostettu vedestä'],
      answer: 0,
      explain: 'Mittarin pitää ensin lämmetä veden lämpöiseksi. Kun lukema pysyy samana, se kertoo veden lämpötilan.',
      why: [null, 'Mittari ei ollut vielä ehtinyt veden lämpöiseksi.', 'Vedestä nostettu mittari alkaa näyttää ilman lämpötilaa.'],
    },
  },
  'PHY79-TEMP-HEAT': {
    beats: [
      { text: 'Kaksi vesierää on aluksi 15 °C: A on 80 g ja B 160 g. Kummankin lämpötila nostetaan 8 °C, eli 23 asteeseen.', pic: 0, figure: false },
      { text: 'B tarvitsee kaksi kertaa enemmän energiaa, koska vettä on kaksi kertaa enemmän. Q = cmΔT: A 4,2 · 80 · 8 = 2688 J, B 5376 J.', more: 'Veden ominaislämpökapasiteetti c on noin 4,2 J/(g·°C): yhden gramman lämmittäminen yhdellä asteella vaatii 4,2 J.', pic: 0, figure: false },
      { text: 'Lämpötila kertoo, kuinka lämmintä aine on, mutta ei sen kokonaisenergiaa. Lämpö on energiaa, joka siirtyy lämpötilaeron vuoksi.', more: 'Sisäenergia on aineen hiukkasten energioiden summa. Samanlämpöisessä suuremmassa vesierässä sitä on enemmän.', pic: 0, figure: false },
    ],
    try: {
      say: 'Kylpyammeessa on 100 kg ja kupissa 0,2 kg vettä, molemmat 40 °C. Kummassa on enemmän sisäenergiaa?',
      options: ['Kylpyammeen vedessä', 'Kupin vedessä', 'Yhtä paljon, koska lämpötila on sama'],
      answer: 0,
      explain: 'Lämpötila on sama, mutta ammeessa on 500 kertaa enemmän vettä. Siksi siinä on paljon enemmän sisäenergiaa.',
      why: [null, 'Kupin vesi on yhtä lämmintä, mutta sitä on paljon vähemmän.', 'Sama lämpötila ei tarkoita samaa energiaa: myös aineen määrä vaikuttaa.'],
    },
  },
  'PHY79-HEATFLOW': {
    beats: [
      { text: 'Eristetyssä mallissa kappale A on 45 °C ja B 15 °C, ja niitä yhdistää sauva. Energiaa siirtyy A:sta B:hen, koska A on lämpimämpi.', pic: 0, figure: false },
      { text: 'A jäähtyy ja B lämpenee, joten lämpötilat lähenevät toisiaan. Kun ne ovat yhtä suuret, nettosiirto loppuu.', more: 'Nettosiirto on kumpaankin suuntaan siirtyvän energian erotus. Samanlämpöisillä kappaleilla se on nolla.', pic: 0, figure: false },
      { text: 'Kylmyys ei ole ainetta, joka virtaisi B:stä A:han. Vain energia siirtyy, aina lämpimämmästä kylmempään.', pic: 0, figure: false },
    ],
    try: {
      say: '60-asteinen kivi laitetaan 10-asteiseen veteen eristettyyn astiaan. Mitä tapahtuu?',
      options: ['Kivi jäähtyy ja vesi lämpenee, kunnes ne ovat yhtä lämpimät', 'Vedestä virtaa kylmyyttä kiveen', 'Ei mitään, koska astia on eristetty'],
      answer: 0,
      explain: 'Energiaa siirtyy kivestä veteen, kunnes lämpötilat ovat samat. Eriste vain estää energiaa karkaamasta ympäristöön.',
      why: [null, 'Kylmyys ei ole ainetta. Energia siirtyy lämpimästä kivestä viileään veteen.', 'Eriste estää vaihdon ympäristön kanssa, ei kiven ja veden välillä.'],
    },
  },
  'PHY79-HEAT-CONDUCTION': {
    beats: [
      { text: 'Kahden sillan päät ovat 60 °C ja 20 °C. Vain sillan aine vaihtuu: A johtaa lämpöä neljä kertaa paremmin kuin B.', more: 'Mallissa A:n johtavuus on 20 W/°C ja B:n 5 W/°C. Alkulämpötilat, lämpökapasiteetit ja aika 6 s ovat samat.', pic: 0, figure: false },
      { text: 'Samassa ajassa A:n viileä pää lämpenee enemmän. Energia kulkee aineen läpi hiukkaselta toiselle, vaikka silta itse pysyy paikallaan.', pic: 0, figure: false },
      { text: 'Tätä sanotaan johtumiseksi. Metallit johtavat lämpöä hyvin, puu ja ilma huonosti.', pic: 0, figure: false },
    ],
    try: {
      say: 'Metallinen ja puinen lusikka ovat samassa kuumassa keitossa. Kumman varsi lämpenee nopeammin?',
      options: ['Metallilusikan', 'Puulusikan', 'Yhtä nopeasti'],
      answer: 0,
      explain: 'Metalli johtaa lämpöä paljon paremmin kuin puu, joten energia kulkee metallin läpi varteen nopeammin.',
      why: [null, 'Puu johtaa lämpöä huonosti, siksi puulusikan varsi pysyy viileänä.', 'Lusikat ovat eri ainetta, ja aine vaikuttaa johtumiseen.'],
    },
  },
  'PHY79-HEAT-CONVECTION': {
    beats: [
      { text: 'Suljetussa mallissa lämmin puoli on 25 °C ja viileä 10 °C. Merkkihiukkaset näyttävät, miten ilma kiertää.', pic: 0, figure: false },
      { text: 'Lämmennyt ilma laajenee ja nousee, viilennyt ilma laskeutuu. Liikkuva ilma kuljettaa energiaa mukanaan: tämä on kuljettuminen.', pic: 0, figure: false },
      { text: 'Kuljettumista tapahtuu nesteissä ja kaasuissa, koska ne voivat virrata. Merkit kuvaavat aineen liikettä, eivät lämpöä aineena.', pic: 0, figure: false },
    ],
    try: {
      say: 'Patteri on ikkunan alla. Miten sen lämpö leviää koko huoneeseen?',
      options: ['Lämmennyt ilma nousee ja kiertää huoneessa', 'Lämmennyt ilma laskeutuu lattialle', 'Lämpö on ainetta, joka nousee itsestään'],
      answer: 0,
      explain: 'Patteri lämmittää viereisen ilman, joka nousee ja kuljettaa energiaa mukanaan. Viileämpi ilma laskeutuu tilalle, ja syntyy kierto.',
      why: [null, 'Lämmennyt ilma on harvempaa kuin viileä ilma, joten se nousee.', 'Lämpö ei ole ainetta. Liikkuva ilma kuljettaa energiaa.'],
    },
  },
  'PHY79-HEAT-RADIATION': {
    beats: [
      { text: 'Kaksi samanlaista kiveä on yhtä kaukana lähteestä. Toisen edessä on läpinäkymätön varjostin.', pic: 0, figure: false },
      { text: 'Avoimen näkymän kivi saa säteilyä ja lämpenee. Varjostin estää suoran reitin, joten toinen kivi ei saa lähteen säteilyä.', pic: 0, figure: false },
      { text: 'Säteily ei tarvitse ainetta väliinsä, vaan kulkee myös tyhjiössä. Siksi Auringon energia tulee Maahan avaruuden halki.', pic: 0, figure: false },
    ],
    try: {
      say: 'Auringon ja Maan välissä on lähes tyhjää avaruutta. Miten Auringon energia pääsee Maahan?',
      options: ['Säteilynä', 'Johtumalla', 'Kuljettumalla'],
      answer: 0,
      explain: 'Säteily ei tarvitse väliainetta, joten se kulkee tyhjiön läpi. Johtuminen ja kuljettuminen tarvitsevat ainetta.',
      why: [null, 'Johtuminen tarvitsee ainetta, jonka läpi energia kulkee.', 'Kuljettuminen tarvitsee liikkuvaa nestettä tai kaasua.'],
    },
  },
  'PHY79-HEAT-MECH': {
    beats: [
      { text: 'Mökissä lämmin kohta on 25 °C ja viileä 10 °C. Energiaa siirtyy kolmea reittiä yhtä aikaa.', pic: 0, figure: false },
      { text: 'Kiinteän seinän läpi energia siirtyy johtumalla, liikkuvan ilman mukana kuljettumalla. Lähteestä se tulee säteilynä ilman kosketusta.', pic: 0, figure: false },
      { text: 'Kaikissa reiteissä energia siirtyy lämpimämmästä kylmempään. Kylmyys ei virtaa mihinkään.', pic: 0, figure: false },
    ],
    try: {
      say: 'Nuotion ääressä kasvot lämpenevät, vaikka tuuli vie savun toiseen suuntaan. Mikä lämmittää kasvoja?',
      options: ['Säteily', 'Kuljettuminen', 'Johtuminen'],
      answer: 0,
      explain: 'Nuotio säteilee energiaa suoraan kasvoihin. Lämmin ilma kulkee tuulen mukana muualle, eikä ilma johda lämpöä hyvin.',
      why: [null, 'Lämmin ilma kulkee tuulen mukana poispäin, ei kasvoja kohti.', 'Kasvot eivät kosketa nuotiota, ja ilma johtaa lämpöä huonosti.'],
    },
  },
};
