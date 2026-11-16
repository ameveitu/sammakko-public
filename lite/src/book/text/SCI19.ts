import type { PageText } from '../text';

/** SCI19 Pitoisuuksien ja pH:n tutkimuspöytä: mass concentration, the pH scale and indicators. */
export const TEXT: Record<string, PageText> = {
  'CHEM79-CONC-01': {
    beats: [
      { text: 'Näytteessä A on 63 g liuosta, ja siitä 9 g on liuennutta ainetta. Kuvan tumma osa on tämä aineosa, ja se sisältyy koko liuoksen 63 grammaan.', pic: 0 },
      { text: 'Pitoisuus kertoo aineosan osuuden koko liuoksesta. Massapitoisuus on aineosan massa jaettuna liuoksen massalla: 9 g / 63 g = 1/7.', more: 'Merkintä m/m kertoo, että sekä aineosa että koko liuos on punnittu massoina, tässä grammoina.', pic: 1 },
      { text: 'Jakajana on koko liuos, ei pelkkä vesi. Vettä on 63 g − 9 g = 54 g, mutta 9/54 olisi aineosan ja veden suhde, ei pitoisuus.', more: 'Pitoisuus ei riipu näytteen koosta. Puolikkaassa näytteessä on 4,5 g ainetta 31,5 grammassa liuosta, ja suhde on yhä 1/7.', pic: 0 },
    ],
    try: {
      say: 'Mehua on 200 g, ja siinä on 20 g sokeria. Mikä suhde kuvaa sokerin massapitoisuutta?',
      options: ['20 g / 200 g', '20 g / 180 g', '200 g / 20 g'],
      answer: 0,
      explain: 'Aineosan massa jaetaan koko liuoksen massalla: 20 g / 200 g = 1/10. Sokeri sisältyy mehun 200 grammaan.',
      why: [null, '180 g on mehun muu osa ilman sokeria. Jakajaksi tulee koko liuos.', 'Suhde on käänteinen: aineosa tulee osoittajaan ja koko liuos nimittäjään.'],
    },
  },
  'CHEM79-ACIDBASE': {
    beats: [
      { text: 'Kolmen kirkkaan näytteen pH mitataan 25 °C:ssa: näyte 1 pH 7, näyte 2 pH 3,3 ja näyte 3 pH 10,1. Näytteet näyttävät samalta, joten ero selviää vasta mittaamalla.', pic: 0, figure: false },
      { text: 'pH-asteikolla 7 on neutraali, alle 7 hapan ja yli 7 emäksinen. Näyte 1 on siis neutraali, näyte 2 hapan ja näyte 3 emäksinen.', pic: 1, figure: false },
      { text: 'Esimerkiksi sitruunamehu on hapanta, puhdas vesi neutraalia ja saippuavesi emäksistä. Raja 7 pätee 25 °C:n vesiliuoksiin.', more: 'Lämpötila vaikuttaa siihen, mikä pH-arvo on neutraali. Siksi mittauksen lämpötila kerrotaan aina pH-arvon yhteydessä.', pic: 1, figure: false },
    ],
    try: {
      say: 'Näytteen pH on 8,5 lämpötilassa 25 °C. Millainen liuos on?',
      options: ['Emäksinen', 'Hapan, koska pH-luku on suuri', 'Neutraali'],
      answer: 0,
      explain: 'pH 8,5 on suurempi kuin 7, joten liuos on emäksinen. Happamassa liuoksessa pH on alle 7 ja neutraalissa tasan 7.',
      why: [null, 'Asteikko on toisin päin: mitä pienempi pH, sitä happamampi liuos.', 'Neutraali liuos on tasan pH 7, ja 8,5 on sitä suurempi.'],
    },
  },
  'CHEM79-CONC-COMP': {
    beats: [
      { text: 'Näytteessä A on 9 g ainetta 45 grammassa liuosta, näytteessä B 45 g ainetta 225 grammassa. B:ssä on enemmän ainetta, mutta se on myös paljon suurempi.', pic: 0 },
      { text: 'Pitoisuuksia verrataan suhteina: A 9 g / 45 g = 0,20 ja B 45 g / 225 g = 0,20. Suhteet ovat yhtä suuret, joten liuokset ovat yhtä väkeviä.', pic: 0 },
      { text: 'Molemmissa aineosaa on 20 % liuoksen massasta. B on vain viisi kertaa suurempi annos samanvahvuista liuosta.', more: 'Suhteita voi verrata myös ristiin kertomalla: 9 · 225 = 2025 ja 45 · 45 = 2025. Kun tulot ovat samat, myös suhteet ovat samat.', pic: 0 },
    ],
    try: {
      say: 'Pullossa C on 10 g suolaa 100 grammassa liuosta, pullossa D 30 g suolaa 400 grammassa. Kumpi liuos on suolaisempi?',
      options: ['C', 'D, koska siinä on enemmän suolaa', 'Yhtä suolaiset'],
      answer: 0,
      explain: 'C: 10 g / 100 g = 0,10 eli 10 %. D: 30 g / 400 g = 0,075 eli 7,5 %. C on väkevämpi, vaikka D:ssä on enemmän suolaa.',
      why: [null, 'Suolan kokonaismäärä ei ratkaise, koska D:ssä on myös paljon enemmän liuosta.', 'Suhteet ovat 0,10 ja 0,075, eivätkä ne ole yhtä suuret.'],
    },
  },
  'CHEM79-CONC-CALC': {
    beats: [
      { text: 'Näytteessä on 9 g aineosaa, ja koko liuosta on 63 g. Massaprosentti saadaan, kun aineosan massa jaetaan liuoksen massalla ja kerrotaan sadalla.', pic: 0 },
      { example: 'Mikä on näytteen massaprosentti?', text: '9 g / 63 g = 1/7, ja sadalla kerrottuna 100/7 % ≈ 14,3 %. Prosentti kertoo, montako grammaa ainetta on 100 grammassa liuosta.', pic: 1 },
      { text: 'Sama luku näkyy arjessa etiketeissä. Jos mehussa on 10 % sokeria, 200 grammassa mehua on 0,10 · 200 g = 20 g sokeria.', pic: null },
    ],
    try: {
      say: 'Liuoksessa on 15 g suolaa, ja koko liuosta on 300 g. Mikä on suolan massaprosentti?',
      options: ['5 %', '20 %', '15 %'],
      answer: 0,
      explain: '15 g / 300 g = 0,05, ja sadalla kerrottuna 5 %. Jokaisessa 100 grammassa liuosta on siis 5 g suolaa.',
      why: [null, 'Jaoit väärin päin: 300 / 15 = 20. Aineosa jaetaan koko liuoksella.', 'Suolan massa ei ole sama kuin prosentti. Jaa ensin koko liuoksen massalla.'],
    },
  },
  'CHEM79-PH': {
    beats: [
      { text: 'Kolmen vesiliuoksen pH-arvot ovat: liuos 1 pH 6, liuos 2 pH 11 ja liuos 3 pH 5. Mitä pienempi pH, sitä happamampi liuos.', pic: 0, figure: false },
      { example: 'Missä järjestyksessä liuokset ovat happamimmasta emäksisimpään?', text: 'pH-arvot pienimmästä suurimpaan ovat 5, 6 ja 11. Järjestys on siis liuos 3 → liuos 1 → liuos 2.', pic: 1, figure: false },
      { text: 'pH-asteikko on logaritminen: yhden yksikön ero tarkoittaa kymmenkertaista eroa happamuudessa. Liuos 3 (pH 5) on 10 kertaa happamampi kuin liuos 1 (pH 6).', more: 'Tarkemmin: kun pH laskee yhdellä, oksoniumionien (H₃O⁺) pitoisuus kymmenkertaistuu. Kahden yksikön ero on siis 10 · 10 = 100-kertainen.', pic: 1, figure: false },
    ],
    try: {
      say: 'Liuoksen A pH on 3 ja liuoksen B pH on 5. Montako kertaa happamampi A on?',
      options: ['100 kertaa', '2 kertaa', '10 kertaa'],
      answer: 0,
      explain: 'Ero on kaksi pH-yksikköä, ja jokainen yksikkö on kymmenkertainen ero: 10 · 10 = 100. A on siis 100 kertaa happamampi.',
      why: [null, 'pH-asteikko ei ole tavallinen lukusuora. Jokainen yksikkö on kymmenkertainen ero.', 'Kymmenkertainen ero vastaa yhtä yksikköä. Tässä yksiköitä on kaksi.'],
    },
  },
  'CHEM79-INDICATOR': {
    beats: [
      { text: 'Indikaattori on aine, jonka väri riippuu liuoksen pH:sta. Bromitymolisininen on keltainen, kun pH on alle 6, ja sininen, kun pH on yli 7,6.', pic: 0, figure: false },
      { example: 'Näyte värjää bromitymolisinisen siniseksi. Mitä pH:sta voi sanoa?', text: 'Sininen väri kertoo, että pH on yli 7,6. Näyte on siis emäksinen, mutta tarkkaa pH-arvoa väri ei kerro.', pic: 1, figure: false },
      { text: 'Indikaattori rajaa pH:n välille, ei yhteen lukuun. Välillä 6–7,6 väri muuttuu vähitellen vihreän kautta, joten rajojen lähellä tulkinta on epävarma.', more: 'Tarkempi tulos saadaan toisella indikaattorilla, jonka värinmuutos osuu eri kohtaan, tai pH-mittarilla. Kahden indikaattorin välien yhteinen osa rajaa pH:n kapeammaksi.', pic: 1, figure: false },
    ],
    try: {
      say: 'Bromitymolisininen muuttuu näytteessä keltaiseksi. Mitä näytteestä voi päätellä?',
      options: ['Se on hapan, ja pH on alle 6', 'Sen pH on tasan 6', 'Se on emäksinen'],
      answer: 0,
      explain: 'Keltainen väri tarkoittaa, että pH on alle 6, joten näyte on hapan. Tarkkaa arvoa väri ei kerro: pH voi olla esimerkiksi 2 tai 5.',
      why: [null, 'Väri kertoo vain välin, ei tarkkaa lukua.', 'Emäksisessä näytteessä bromitymolisininen olisi sininen.'],
    },
  },
};
