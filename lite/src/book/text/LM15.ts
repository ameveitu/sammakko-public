import type { PageText } from '../text';

/** LM15 Peilien ja kulmien kallio: point, segment, line, angles and three kinds of symmetry. */
export const TEXT: Record<string, PageText> = {
  'M-GEO-19': {
    beats: [
      { text: 'Ruudukossa A on lähtömerkki. Yksi askel oikealle on kohta (4, 4), ja se merkitään pisteellä.', pic: 0 },
      { text: 'Piste on yksi tarkka paikka, eikä sillä ole kokoa. Piirretty merkki vain näyttää paikan: isompikin merkki osoittaa saman kohdan.', pic: 0 },
    ],
    try: {
      say: 'Loikka piirtää kohtaan (2, 5) ison pisteen. Aava pyyhkii sen ja piirtää samaan kohtaan pienen. Muuttuiko paikka?',
      options: ['Ei, paikka on yhä (2, 5)', 'Kyllä, paikka pieneni', 'Kyllä, paikka siirtyi'],
      answer: 0,
      explain: 'Piste kertoo vain paikan. Merkin koko auttaa näkemään sen, mutta ei muuta paikkaa.',
      why: [null, 'Pisteellä ei ole kokoa, joten pienempi merkki ei tee paikasta pienempää.', 'Uusi merkki on samassa kohdassa (2, 5), joten paikka on sama.'],
    },
  },
  'M-GEO-20': {
    beats: [
      { text: 'Jana yhdistää pisteet A ja B suoraan. Tässä sen päätepisteet ovat (1, 1) ja (5, 1).', pic: 0 },
      { text: 'Jana alkaa toisesta päätepisteestä ja loppuu toiseen, joten sen pituuden voi mitata. Tämä jana on 4 ruutua pitkä.', more: 'Mutkitteleva köysi tai kaari pisteiden välillä ei ole jana, koska se ei kulje suoraan.', pic: 0 },
    ],
    try: {
      say: 'Mikä näistä on jana?',
      options: ['Suora viiva, jolla on kaksi päätepistettä', 'Suora viiva, joka jatkuu loputtomiin', 'Kaari kahden pisteen välillä'],
      answer: 0,
      explain: 'Jana kulkee suoraan pisteestä toiseen ja loppuu kumpaankin päätepisteeseen.',
      why: [null, 'Loputtomiin jatkuva viiva on suora, ei jana.', 'Kaari kaartuu, mutta jana kulkee suoraan.'],
    },
  },
  'M-GEO-21': {
    beats: [
      { text: 'Kuvassa A on kaari, B on suora ja C on jana. Suoran nuolet kertovat, että viiva jatkuu kuvan ulkopuolelle.', pic: 0 },
      { text: 'Suoralla ei ole päätepisteitä, vaan se jatkuu loputtomiin molempiin suuntiin. Piirros näyttää siitä vain palan.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-22': {
    beats: [
      { text: 'Kulmassa A kaksi kylkeä lähtee samasta pisteestä Q. Piste Q on kulman kärki, ja QR ja QP ovat sen kyljet.', pic: 0 },
      { text: 'Kulman B kyljet ovat lyhyemmät, mutta kulmat aukeavat yhtä paljon. Kulman suuruus riippuu avautumisesta, ei kylkien pituudesta.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-SYM-01': {
    beats: [
      { text: 'Kuvio taitetaan katkoviivaa pitkin. Jos puolikkaat menevät täsmälleen päällekkäin, viiva on symmetria-akseli.', pic: 0 },
      { text: 'Suorakulmion lävistäjä ei ole symmetria-akseli: taitettaessa kulmat eivät osu päällekkäin.', more: 'Neliössä lävistäjä kelpaa, koska neliön kaikki sivut ovat yhtä pitkät ja puolikkaat osuvat päällekkäin.', pic: 1 },
      { text: 'Peilikuvassa jokainen ruutu on yhtä kaukana peiliviivasta kuin alkuperäinen, mutta viivan toisella puolella.', pic: 3 },
    ],
    try: 'auto',
  },
  'M-SYM-02': {
    beats: [
      { text: 'Tuulimerkissä on neljä yhtä pitkää sakaraa. Kun sitä kierretään keskipisteen ympäri neljänneskierros eli 90°, se näyttää täsmälleen samalta.', pic: 0 },
      { text: 'Jos kuvio näyttää samalta jo ennen täyttä kierrosta, sillä on kiertosymmetria. Tämä merkki osuu itseensä kierroilla 90°, 180° ja 270°.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-SYM-03': {
    beats: [
      { text: 'Sama kuvio toistuu rantakaistalla. Jokainen kärki on siirtynyt 4 ruutua oikealle, esimerkiksi kärki 1 kohdasta (1, 2) kohtaan (5, 2).', pic: 0 },
      { text: 'Siirrossa jokainen kohta liikkuu saman matkan samaan suuntaan. Kuvion koko ja asento pysyvät samoina.', more: 'Seuraava kuvio tulee taas 4 ruutua oikealle: sen kärki 1 on kohdassa (9, 2).', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-23': {
    beats: [
      { text: 'Kulma piirretään sinisestä alkukyljestä. Kärki pysyy paikallaan, ja toista kylkeä käännetään, kunnes kyljet ovat 55° päässä toisistaan.', pic: 0 },
      { text: '55° on alle 90°, joten se on terävä kulma. Yli 90° mutta alle 180° kulma on tylppä.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-24': {
    beats: [
      { text: 'Kulmamitan keskipiste asetetaan kulman kärkeen C ja pohjaviiva alkukyljen päälle. Mitassa on kaksi asteikkoa, jotka kulkevat vastakkaisiin suuntiin.', pic: 0 },
      { text: 'Luetaan se asteikko, jonka nolla on alkukyljen kohdalla. Sillä toinen kylki osuu kohtaan 45°.', pic: 0 },
      { text: 'Tarkista silmällä: kulma on terävä, joten 45° sopii. Toisen asteikon 135° olisi tylppä kulma.', pic: 0 },
    ],
    try: 'auto',
  },
  'M-GEO-25': {
    beats: [
      { text: 'Kulmat A, B ja C näyttävät lähes samoilta, mutta asteluvut erottavat ne. C on tasan 90°, joten se on suora kulma.', pic: 0 },
      { text: 'A on 89°, alle suoran kulman, joten se on terävä. B on 91°, yli suoran kulman, joten se on tylppä.', pic: 0 },
      { text: 'Rajoilla on omat nimet: 0° on nollakulma, 90° suora kulma ja 180° oikokulma. Terävä on 0° ja 90° välissä, tylppä 90° ja 180° välissä.', pic: 0 },
    ],
    try: 'auto',
  },
};
