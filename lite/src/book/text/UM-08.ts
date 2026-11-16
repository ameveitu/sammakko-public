import type { PageText } from '../text';

/** UM-08 Muuttujien telakka: the roles of a letter, expressions, terms and calculating with polynomials. */
export const TEXT: Record<string, PageText> = {
  'M79-VAR-VARYING': {
    beats: [
      {
        text: 'Jäätelöt maksavat yhteensä 2n euroa, kun n on jäätelöiden määrä. Kun n kasvaa yhdellä, hinta kasvaa 2 €: 0 €, 2 €, 4 €, 6 € ja niin edelleen.',
        more: 'Kirjainta, joka voi saada monta arvoa, sanotaan muuttujaksi. Lausekkeen 2n arvo muuttuu, kun n muuttuu.',
        pic: 0,
      },
      {
        text: 'Taksimatka maksaa 3n + 4 euroa, kun n on kilometrien määrä. Jokainen kilometri lisää hintaan 3 €, mutta aloitusmaksu 4 € pysyy samana.',
        pic: 1,
      },
    ],
    try: 'auto',
  },
  'M79-VAR-UNKNOWN': {
    beats: [
      {
        text: 'Yhtälössä x + 5 = 12 kirjain x on yksi tietty luku, jota ei vielä tiedetä. Kokeillaan: 4 on liian vähän, 9 liian paljon ja 7 tasapainottaa vaa’an.',
        pic: 0,
      },
      {
        text: 'Hintalapussa lukee a €. Kirjain a ei ole omena vaan luku, omenan hinta euroina: kun a = 2, kolme omenaa maksaa 3a = 6 €.',
        pic: 1,
      },
      {
        text: 'Pussi ja 4 kg painavat yhtä paljon kuin 10 kg. Kun molemmilta puolilta otetaan 4 kg, vaaka pysyy suorassa, ja pussin paino on 6 kg.',
        pic: 2,
      },
    ],
    try: 'auto',
  },
  'M79-VAR-01': {
    beats: [
      {
        text: 'Yhtälössä x + 4 = 9 vain yksi luku toimii: 5. Säännössä hinta = 3n kelpaa jokainen n, ja jokainen antaa oman hinnan.',
        more: 'Yhtälössä kirjain on tuntematon luku. Säännössä se on muuttuja, joka voi saada monta arvoa.',
        pic: 0,
      },
      {
        text: 'Samassa yhtälössä sama kirjain on aina sama luku. Yhtälöön x + x = 10 eivät käy luvut 3 ja 7, vaan vain 5 ja 5.',
        more: 'Eri kirjaimet saavat olla eri lukuja: yhtälöön a + b = 10 käyvät myös 3 ja 7.',
        pic: 1,
      },
    ],
    try: 'auto',
  },
  'M79-EXPR-EVAL': {
    beats: [
      {
        example: 'Laske 3x + 2, kun x = 4.',
        text: 'Merkintä 3x tarkoittaa 3 · x, joten 3x + 2 = 3 · 4 + 2 = 12 + 2 = 14. Kun x = 4, 3x ei siis ole 34 vaan 12.',
        pic: 0,
      },
      { text: '2(a + 5), kun a = 3: sulut lasketaan ensin, 3 + 5 = 8. Sitten 2 · 8 = 16.', pic: 1 },
      { text: 'Negatiivinen luku sijoitetaan sulkeisiin. Kun x = −2, lauseke 4x + 9 on 4 · (−2) + 9 = −8 + 9 = 1.', pic: 2 },
    ],
    try: 'auto',
  },
  'M79-EXPR-FORM': {
    beats: [
      { text: 'Luku n kerrotaan ensin kolmella, ja sitten siihen lisätään 5. Lauseke on 3n + 5.', pic: 0 },
      {
        text: 'Jos ensin lisätään 5 ja sitten koko summa kerrotaan kolmella, tarvitaan sulut: 3(n + 5). Kun n = 2, lausekkeet antavat 11 ja 21, joten ne ovat eri.',
        pic: 1,
      },
      {
        text: 'Tulitikkurivin ensimmäinen neliö vie 4 tikkua, ja jokainen uusi neliö tuo 3 lisää. Kun neliöitä on n, tikkuja on 3n + 1.',
        more: 'Tarkista lauseke laskemalla: 3 neliötä vie 3 · 3 + 1 = 10 tikkua, ja rivistä voi laskea saman: 4 + 3 + 3 = 10.',
        pic: 2,
      },
    ],
    try: 'auto',
  },
  'M79-TERM-01': {
    beats: [
      {
        text: 'Lausekkeessa 2x − 3x² + 4 on kolme termiä: 2x, −3x² ja 4. Termit erottuvat plus- ja miinusmerkkien kohdalta, ja merkki kuuluu termiin.',
        pic: 0,
      },
      {
        text: 'Termissä −3x² luku −3 on kerroin ja x² muuttujaosa. Termi 4 on vakiotermi, koska siinä ei ole muuttujaa.',
        more: 'Termin 2x kerroin on 2. Jos kerrointa ei näy, kuten termissä x², kerroin on 1.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mikä on termin −4x kerroin lausekkeessa x² − 4x + 7?',
      options: ['−4', '4', '7'],
      answer: 0,
      explain: 'Kerroin on muuttujaosan x edessä oleva luku, ja miinusmerkki kuuluu siihen. Siksi kerroin on −4.',
      why: [null, 'Miinusmerkki kuuluu termiin, joten kerroin on negatiivinen.', '7 on vakiotermi, koska siinä ei ole muuttujaa.'],
    },
  },
  'M79-POLY-CONCEPT': {
    beats: [
      {
        text: 'Polynomi on termien summa, joissa muuttujan eksponentit ovat 0, 1, 2 ja niin edelleen. Piirustuksen A lauseke x² + 3 on polynomi.',
        more: 'Vakio 3 on myös polynomin termi: siinä x:n eksponentti on 0, koska x⁰ = 1.',
        pic: 0,
      },
      {
        text: 'Piirustuksen B lausekkeessa 2/x + 3 muuttuja on nimittäjässä. Muuttujalla jakaminen ei kuulu polynomiin, joten B ei ole polynomi.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mikä lausekkeista on polynomi?',
      options: ['5x³ − x + 1', '4/x + 2', 'x² + 3/x'],
      answer: 0,
      explain: 'Lausekkeessa 5x³ − x + 1 muuttujan eksponentit ovat 3, 1 ja 0, eikä muuttujalla jaeta. Siksi se on polynomi.',
      why: [null, 'Muuttuja on nimittäjässä, joten lauseke ei ole polynomi.', 'Termi 3/x jakaa muuttujalla, joten koko lauseke ei ole polynomi.'],
    },
  },
  'M79-EXPR-SIMPLIFY': {
    beats: [
      {
        text: 'Lausekkeessa 2x + 3 + x termit 2x ja x ovat samanlaisia, koska niillä on sama muuttujaosa x. Ne yhdistetään: 2x + x = 3x.',
        pic: 0,
      },
      {
        text: 'Vakiotermi 3 jää omaksi termikseen, joten 2x + 3 + x = 3x + 3. Arvo ei muutu: kun x = 1, molemmat ovat 6.',
        more: 'Kun x = 3, molemmat ovat 12. Kokeilut havainnollistavat, mutta sääntö perustuu siihen, että samanlaisten termien kertoimet lasketaan yhteen.',
        pic: 0,
      },
    ],
    try: {
      say: 'Sievennä 4x + 2 + 3x.',
      options: ['7x + 2', '9x', '7x² + 2'],
      answer: 0,
      explain: 'Samanlaiset termit 4x ja 3x yhdistetään: 7x. Vakio 2 jää omaksi termikseen, joten tulos on 7x + 2.',
      why: [null, 'Vakiota 2 ei voi yhdistää x-termeihin, koska siinä ei ole muuttujaosaa.', 'Yhteenlaskussa muuttujaosa ei muutu: 4x + 3x = 7x, ei 7x².'],
    },
  },
  'M79-POLY-01': {
    beats: [
      { text: 'Lausekkeessa 0x² + 3 termin 0x² kerroin on nolla. Termi on siis 0, oli x mikä tahansa.', pic: 0 },
      {
        text: 'Kun nollatermi jätetään pois, jäljelle jää vakiotermi 3. Lauseke 0x² + 3 on siis sama polynomi kuin 3.',
        more: 'Polynomin aste on suurin eksponentti niissä termeissä, joiden kerroin ei ole nolla. Siksi 0x² + 3 ei ole toisen asteen polynomi.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mikä on lausekkeen 0x² + 5x − 1 sievin muoto?',
      options: ['5x − 1', 'x² + 5x − 1', '4x'],
      answer: 0,
      explain: '0x² = 0 kaikilla x:n arvoilla, joten termi jätetään pois. Jäljelle jää 5x − 1.',
      why: [null, 'Kerroin 0 ei ole sama kuin kerroin 1: 0x² on nolla.', 'Termejä 5x ja −1 ei voi yhdistää, koska −1 on vakio.'],
    },
  },
  'M79-POLY-MUL-MONO': {
    beats: [
      {
        example: 'Kerro −2x · (x + 3).',
        text: 'Monomi −2x kerrotaan jokaisella sulkujen termillä: −2x · x = −2x² ja −2x · 3 = −6x.',
        pic: 0,
      },
      {
        text: 'Tulos on −2x² − 6x. Merkit tarkistetaan erikseen: negatiivinen kertaa positiivinen on negatiivinen.',
        more: 'Jos kertoo vain ensimmäisen termin, saa virheellisen tuloksen −2x² + 3. Jokainen sulkujen termi saa oman osatulonsa.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mikä on 3x(x − 2)?',
      options: ['3x² − 6x', '3x² − 2', '3x² + 6x'],
      answer: 0,
      explain: '3x · x = 3x² ja 3x · (−2) = −6x. Tulos on 3x² − 6x.',
      why: [null, 'Myös −2 pitää kertoa 3x:llä: 3x · (−2) = −6x.', 'Positiivinen kertaa negatiivinen on negatiivinen, joten termi on −6x.'],
    },
  },
  'M79-POLY-MUL': {
    beats: [
      {
        example: 'Kerro (x + 2)(x − 2).',
        text: 'Jokainen ensimmäisen sulun termi kerrotaan jokaisella toisen sulun termillä. Ruudukkoon tulee neljä osatuloa: x², −2x, 2x ja −4.',
        pic: 0,
      },
      {
        text: 'Osatulot lasketaan yhteen: x² − 2x + 2x − 4. Termit −2x ja 2x kumoavat toisensa, joten tulos on x² − 4.',
        more: 'Tarkistus luvulla x = 3: (3 + 2)(3 − 2) = 5 · 1 = 5 ja 3² − 4 = 5.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mikä on (x + 3)(x + 1)?',
      options: ['x² + 4x + 3', 'x² + 3', 'x² + 3x + 3'],
      answer: 0,
      explain: 'Osatulot ovat x², x, 3x ja 3. Kun x ja 3x yhdistetään, tulos on x² + 4x + 3.',
      why: [null, 'Kaksi osatuloa jäi pois: x · 1 = x ja 3 · x = 3x.', 'Osatulo x · 1 = x jäi pois. Termit x ja 3x antavat yhdessä 4x.'],
    },
  },
  'M79-POLY-ADD': {
    beats: [
      {
        text: 'Tilaukset A = 2x² + 3 ja B = 3x − 3 lasketaan yhteen. Laatat kootaan samaan riviin, ja samanlaiset termit yhdistetään.',
        pic: 0,
      },
      {
        text: 'Vakiot 3 ja −3 kumoavat toisensa, koska 3 + (−3) = 0. Termit 2x² ja 3x ovat erilaisia, joten summa on 2x² + 3x.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mikä on (x² + 2x) + (3x² − 2x)?',
      options: ['4x²', '4x² + 4x', '4x⁴'],
      answer: 0,
      explain: 'x² + 3x² = 4x², ja 2x + (−2x) = 0. Summa on 4x².',
      why: [null, '2x ja −2x kumoavat toisensa, joten x-termiä ei jää.', 'Yhteenlaskussa eksponentti ei muutu: x² + 3x² = 4x².'],
    },
  },
  'M79-POLY-SUBTRACT': {
    beats: [
      {
        text: 'Lähtöerästä A = 2x² + 3 vähennetään erä B = 2x + 3. Vastaavat termit vähennetään toisistaan: vakioista 3 − 3 = 0.',
        more: 'x²-termi on vain A:ssa, joten 2x² jää sellaisenaan.',
        pic: 0,
      },
      {
        text: 'A:ssa ei ole x-termiä, eli siinä on 0x. Siksi 0x − 2x = −2x, ja erotus on 2x² − 2x.',
        pic: 0,
      },
    ],
    try: {
      say: 'Mikä on (5x² + 4) − (x + 4)?',
      options: ['5x² − x', '5x² + x', '4x² + 4'],
      answer: 0,
      explain: 'Ensimmäisessä polynomissa on 0x, joten 0x − x = −x. Vakiot: 4 − 4 = 0. Erotus on 5x² − x.',
      why: [null, 'x vähennetään nollasta: 0x − x = −x.', 'x ja x² ovat erilaisia termejä, eikä niitä voi vähentää toisistaan.'],
    },
  },
  'M79-SIGN-PARENS': {
    beats: [
      {
        example: 'Avaa sulut: −(2x − 3).',
        text: 'Miinusmerkki sulkujen edessä vaihtaa jokaisen sulkujen termin merkin. Termi 2x muuttuu −2x:ksi ja −3 muuttuu +3:ksi.',
        pic: 0,
      },
      {
        text: 'Tulos on −2x + 3. Tavallisin virhe on vaihtaa vain ensimmäisen termin merkki.',
        more: 'Tarkistus luvulla x = 1: −(2 · 1 − 3) = −(−1) = 1 ja −2 · 1 + 3 = 1.',
        pic: 0,
      },
    ],
    try: {
      say: 'Avaa sulut: −(4x + 5).',
      options: ['−4x − 5', '−4x + 5', '4x − 5'],
      answer: 0,
      explain: 'Miinus sulkujen edessä vaihtaa jokaisen termin merkin: 4x muuttuu −4x:ksi ja +5 muuttuu −5:ksi.',
      why: [null, 'Myös +5 vaihtaa merkkiä, joten se muuttuu −5:ksi.', 'Ensimmäinenkin termi vaihtaa merkkiä: 4x muuttuu −4x:ksi.'],
    },
  },
  'M79-POLY-SUB': {
    beats: [
      {
        example: 'Laske (2x² + 3) − (−2x + 3).',
        text: 'Vähennettävän sulut avataan vaihtamalla jokaisen termin merkki: −2x muuttuu +2x:ksi ja +3 muuttuu −3:ksi.',
        pic: 0,
      },
      {
        text: 'Avattu rivi on 2x² + 3 + 2x − 3. Vakiot kumoavat toisensa, joten erotus on 2x² + 2x.',
        pic: 0,
      },
    ],
    try: {
      say: 'Laske (x² + 4x) − (x² − x).',
      options: ['5x', '3x', '2x² + 3x'],
      answer: 0,
      explain: 'Sulut avataan: x² + 4x − x² + x. Termit x² ja −x² kumoavat toisensa, ja 4x + x = 5x.',
      why: [null, '−x muuttuu sulkuja avattaessa +x:ksi, joten 4x + x = 5x.', 'Myös x² vaihtaa merkkiä: x² − x² = 0.'],
    },
  },
};
