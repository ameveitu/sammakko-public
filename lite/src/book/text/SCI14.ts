import type { PageText } from '../text';

/** SCI14 Sulan lasilaboratorio: chemical investigation from question and plan to measuring, data, conclusion and evaluation. */
export const TEXT: Record<string, PageText> = {
  'CHEM79-CONCLUSION': {
    beats: [
      { text: 'Kysymys: kummassa liuottimessa aine A liukenee enemmän? Samoissa oloissa liuottimeen 1 liukeni 700 mg ja liuottimeen 2 1100 mg.', pic: null },
      { text: 'Ero on 1100 mg − 700 mg = 400 mg. Johtopäätös: näissä oloissa aine A liukeni liuottimeen 2 enemmän kuin liuottimeen 1.', pic: null },
      { text: 'Johtopäätös rajataan siihen, mitä tutkittiin. Se koskee ainetta A, näitä kahta liuotinta ja näitä oloja, ei kaikkia aineita.', pic: null },
    ],
    try: {
      say: 'Samoissa oloissa liuottimeen 1 liukeni 700 mg ainetta A ja liuottimeen 2 1100 mg. Mikä johtopäätös on perusteltu?',
      options: ['Näissä oloissa A liukeni liuottimeen 2 enemmän.', 'Kaikki aineet liukenevat liuottimeen 2 paremmin.', 'Tuloksista ei voi päätellä mitään.'],
      answer: 0,
      explain: 'Vertailu oli reilu, joten 400 mg:n ero kertoo liuottimen vaikutuksesta. Päätelmä koskee kuitenkin vain ainetta A ja näitä oloja.',
      why: [null, 'Tutkittiin vain ainetta A. Muista aineista nämä tulokset eivät kerro.', 'Muut olot pidettiin samoina, joten ero kertoo liuottimen vaikutuksesta.'],
    },
  },
  'CHEM79-INVESTIGATION-EVAL': {
    beats: [
      { text: 'Aineen liukenemista verrataan kahdessa liuottimessa. Muistiinpanossa lukee, että näytepullon B etiketti on vaihtunut: ei ole varmaa, mitä ainetta pullossa oli.', pic: null },
      { text: 'Lukemien eron voi laskea, mutta siitä ei voi tehdä varmaa johtopäätöstä. Jos B oli eri ainetta, ero voi johtua aineesta eikä liuottimesta.', pic: null },
      { text: 'Parannus kohdistetaan epävarmaan kohtaan: koe B toistetaan varmasti oikealla aineella. Vanhat tulokset säilytetään muistiinpanoineen.', more: 'Alkuperäistä havaintoa ei pyyhitä pois, vaikka se olisi epävarma. Siitä näkee, mitä tutkimuksessa todella tapahtui.', pic: null },
    ],
    try: {
      say: 'Näytteen B pullon etiketti oli vaihtunut. Mikä on paras parannus?',
      options: ['Toistetaan koe B varmasti oikealla aineella.', 'Poistetaan B:n tulos, kuin koetta ei olisi tehty.', 'Toistetaan koe A kolme kertaa.'],
      answer: 0,
      explain: 'Epävarmuus koski näytteen B ainetta, joten juuri se koe toistetaan. Vanha tulos säilytetään ja merkitään epävarmaksi.',
      why: [null, 'Alkuperäistä havaintoa ei hävitetä. Se säilytetään ja merkitään epävarmaksi.', 'Kokeessa A ei ollut ongelmaa. Sen toistaminen ei korjaa B:n etikettivirhettä.'],
    },
  },
  'CHEM79-LAB-01': {
    beats: [
      { text: 'Vettä pitää siirtää 1800 µl, ja mittauksen tarkkuuden pitää olla 100 µl. Pieneen mittapipettiin mahtuu 5000 µl, ja sen asteikon jakoväli on 100 µl.', more: 'µl eli mikrolitra on tuhannesosa millilitrasta.', pic: 0, figure: false },
      { text: 'Väline sopii, kun koko annos mahtuu siihen kerralla ja jakoväli on riittävän pieni. Mittalasin jakoväli on 1000 µl, joten se on tähän liian karkea.', pic: 0, figure: false },
      { text: 'Siirrossa vettä ei katoa: lähteeseen jää 7200 µl − 1800 µl = 5400 µl. Lähteessä, välineessä ja vastaanottajassa on yhteensä koko ajan 7200 µl.', pic: 0, figure: false },
    ],
    try: {
      say: 'Pitää siirtää 1800 µl vettä tarkkuudella 100 µl. Mikä väline sopii?',
      options: ['Pieni mittapipetti (5000 µl, jako 100 µl)', 'Mittalasi (100 000 µl, jako 1000 µl)', 'Suurempi mittapipetti (10 000 µl, jako 500 µl)'],
      answer: 0,
      explain: 'Pieneen mittapipettiin 1800 µl mahtuu kerralla, ja sen jakoväli 100 µl on riittävän pieni. Muiden välineiden asteikot ovat liian karkeita.',
      why: [null, 'Annos mahtuu, mutta jakoväli 1000 µl on paljon suurempi kuin sallittu 100 µl.', 'Annos mahtuu, mutta jakoväli 500 µl on liian karkea.'],
    },
  },
  'CHEM79-OBS-01': {
    beats: [
      { text: 'Ennen astiassa ei ollut kuplia, jälkeen niitä on 10. Lämpömittari näyttää 21 °C.', pic: null },
      { text: 'Nämä ovat havaintoja: ne kertovat, mitä näkyi tai mitä mittari näytti. ”Kuplat ovat varmasti happea” on tulkinta, koska kaasun nimeä ei näe.', pic: null },
      { text: 'Tulkinta tarvitsee lisänäyttöä. Kaasun voi tutkia erikseen tai verrata vertailunäytteeseen, jolle ei tehty samaa muutosta.', pic: null },
    ],
    try: {
      say: 'Mikä näistä on havainto eikä tulkinta?',
      options: ['Näytteessä näkyy 10 kuplaa.', 'Kuplat ovat varmasti happea.', 'Kuplat syntyivät kemiallisesta reaktiosta.'],
      answer: 0,
      explain: 'Kuplat näkee suoraan, joten niiden määrä on havainto. Kaasun nimi ja kuplien syy ovat tulkintoja, jotka tarvitsevat lisänäyttöä.',
      why: [null, 'Kaasun nimeä ei näe kuplista. Se pitää tutkia erikseen.', 'Syytä ei näe suoraan. Kuplia voi syntyä muustakin syystä.'],
    },
  },
  'CHEM79-CONCL-01': {
    beats: [
      { text: 'Raportissa on kaksi osaa: tulos ja arvio sen luotettavuudesta. Tulos: liuottimeen 2 liukeni 400 mg enemmän ainetta A kuin liuottimeen 1.', pic: null },
      { text: 'Arviossa kerrotaan, voiko tulokseen luottaa. Jos liuottimen 2 kokeessa myös lämpötila olisi muuttunut, eron syytä ei voisi tietää.', pic: null },
      { text: 'Lukemat 700 mg ja 710 mg ovat hyvin lähellä toisiaan. Jos kummankin epävarmuus on ±50 mg, eroa ei voi todeta, ja kysymys jää vielä auki.', more: 'Rehellinen ”emme vielä tiedä” on parempi kuin varma väite, jota mittaukset eivät tue.', pic: null },
    ],
    try: {
      say: 'Lukemat ovat 700 mg ja 710 mg, ja kummankin epävarmuus on ±50 mg. Mikä päätelmä on perusteltu?',
      options: ['Eroa ei voi todeta näillä mittauksilla.', 'Liuotin 2 liuottaa selvästi enemmän.', 'Liuottimet ovat varmasti yhtä hyviä.'],
      answer: 0,
      explain: 'Välit 700 ± 50 mg ja 710 ± 50 mg menevät päällekkäin, joten 10 mg:n ero voi johtua mittauksen epätarkkuudesta. Tarvitaan tarkempia mittauksia tai toistoja.',
      why: [null, 'Ero 10 mg on paljon pienempi kuin epävarmuus 50 mg.', 'Sitäkään ei voi tietää: pieni ero voi olla todellinen tai pelkkää epätarkkuutta.'],
    },
  },
  'CHEM79-QUESTION-01': {
    beats: [
      { text: 'Aineen A liukenemista voi verrata kahdessa liuottimessa: vedessä ja rasvassa. Muuttuja on liuotin, ja tuloksena mitataan liuenneen aineen massa.', pic: null },
      { text: 'Tutkittava kysymys rajaa vertailun: ”Liukeneeko aine A enemmän veteen vai rasvaan, kun muut olot ovat samat?” Siihen voi vastata mittaamalla.', pic: null },
      { text: '”Kumpi liuotin on kivempi?” ei ole tutkittava kysymys, koska siihen ei vastata mittaamalla. Hyvä kysymys kertoo, mikä muuttuu ja mitä havaitaan.', pic: null },
    ],
    try: {
      say: 'Mikä näistä on tutkittava kysymys?',
      options: ['Liukeneeko A enemmän veteen kuin rasvaan samoissa oloissa?', 'Kumpi liuotin on kauniimpi?', 'Miksi kaikki aineet liukenevat?'],
      answer: 0,
      explain: 'Kysymykseen voi vastata mittaamalla liuenneen massan molemmissa liuottimissa, kun muut olot pidetään samoina.',
      why: [null, 'Kauneus on mielipide, eikä sitä voi mitata.', 'Kysymys on liian laaja, eivätkä kaikki aineet edes liukene. Yksi koe ei vastaa siihen.'],
    },
  },
  'CHEM79-MEAS-01': {
    beats: [
      { text: 'Vaa’alle asetetaan ensin tyhjä astia, ja vaaka näyttää astian massan. Taaraus eli nollaus muuttaa lukeman nollaksi.', pic: 0, figure: false },
      { text: 'Kun näyte lisätään vasta taarauksen jälkeen, vaaka näyttää pelkän näytteen massan, esimerkiksi 4700 mg. Astian massa ei tule lukemaan mukaan.', more: 'Lukema kirjataan aina yksikön kanssa: pelkkä 4700 ei kerro, onko kyse milligrammoista vai grammoista.', pic: 0, figure: false },
      { text: 'Nesteen pinta kaartuu mitta-astiassa, ja kaarevaa pintaa sanotaan meniskiksi. Veden tilavuus luetaan meniskin alimmasta kohdasta katse samalla korkeudella.', pic: 0, figure: false },
    ],
    try: {
      say: 'Vaaka näyttää 1200 mg, kun tyhjä astia on sen päällä. Mitä tehdään ennen näytteen lisäämistä?',
      options: ['Taarataan vaaka, jolloin lukema on 0 mg.', 'Kirjataan 1200 mg näytteen massaksi.', 'Otetaan astia pois ja laitetaan näyte suoraan vaa’alle.'],
      answer: 0,
      explain: 'Taarauksen jälkeen vaaka näyttää vain sen, mitä astiaan lisätään. Silloin lukema on pelkän näytteen massa.',
      why: [null, '1200 mg on tyhjän astian massa. Näytettä ei ole vielä lisätty.', 'Näytettä ei laiteta suoraan vaa’alle. Se punnitaan astiassa.'],
    },
  },
  'CHEM79-PLAN-01': {
    beats: [
      { text: 'Reilussa vertailussa muutetaan vain yhtä asiaa. Kun vettä ja rasvaa verrataan liuottimina, kaikki muu pidetään samana.', pic: null },
      { text: 'Kumpaankin liuottimeen lisätään esimerkiksi 900 mg ainetta, liuotinta on 11 g, ja lämpötila ja sekoitusaika ovat samat. Muuten ei tiedettäisi, mikä tulokseen vaikutti.', pic: null },
      { text: 'Jokainen koe toistetaan, esimerkiksi kolme kertaa. Toistot paljastavat sattumanvaihtelun, mutta ne eivät korjaa epäreilua vertailua.', more: 'Suunnitelmaan kuuluu myös turvallisuus: suojalasit ja annetun työohjeen noudattaminen.', pic: null },
    ],
    try: {
      say: 'Verrataan, liukeneeko aine A enemmän veteen vai rasvaan. Mikä saa muuttua kokeiden välillä?',
      options: ['Vain liuotin', 'Liuotin ja lämpötila', 'Liuotin ja aineen määrä'],
      answer: 0,
      explain: 'Kun vain liuotin muuttuu, tulosten ero johtuu liuottimesta. Kaikki muu pidetään samana.',
      why: [null, 'Silloin ei tiedetä, johtuuko ero liuottimesta vai lämpötilasta.', 'Silloin ei tiedetä, johtuuko ero liuottimesta vai aineen määrästä.'],
    },
  },
  'CHEM79-DATA-COLLECT': {
    beats: [
      { text: 'Jokaiseen kokeeseen lisättiin 1200 mg ainetta A. Veteen liukeni 300 mg, rasvaan 600 mg ja kolmanteen liuottimeen 900 mg.', more: 'Loput aineesta jäi liukenematta: esimerkiksi vedessä 1200 mg − 300 mg = 900 mg.', pic: null },
      { text: 'Jokainen lukema kirjataan oman näytteen riville tunnuksen, olosuhteen ja yksikön kanssa, esimerkiksi ”M79-1, vesi, 300 mg”. Silloin tuloksen alkuperän voi aina tarkistaa.', pic: null },
      { text: 'Myös odottamaton tulos säilytetään. Puuttuva lukema merkitään kysymysmerkillä, koska 0 tarkoittaisi, että mitattiin nolla.', pic: null },
    ],
    try: {
      say: 'Yhden näytteen lukema jäi saamatta. Mitä taulukkoon kirjataan?',
      options: ['? eli puuttuva lukema', '0 mg', 'Muiden näytteiden keskiarvo'],
      answer: 0,
      explain: 'Puuttuva lukema merkitään puuttuvaksi. Nolla on oikea havainto: se tarkoittaisi, ettei ainetta liuennut lainkaan.',
      why: [null, 'Nolla tarkoittaa mitattua tulosta: mitään ei liuennut. Nyt tulosta ei ole.', 'Keksittyä lukua ei kirjata havainnoksi. Se vääristäisi aineistoa.'],
    },
  },
  'CHEM79-DATA-PRESENT': {
    beats: [
      { text: 'Tulokset voi esittää taulukkona tai diagrammina. Kun liuottimia vertaillaan, sopii pylväsdiagrammi: jokainen liuotin saa oman pylvään.', more: 'Jos vaaka-akselilla on lukuja, kuten lämpötila, käytetään pistekuvaajaa.', pic: null },
      { text: 'Pystyakselin nimeen tulee suure ja yksikkö: liuennut massa (mg). Akseli alkaa nollasta, jotta pylväiden korkeuksia voi verrata reilusti.', pic: null },
      { text: 'Esitykseen käytetään alkuperäisiä lukuja: vesi 300 mg, rasva 600 mg ja kolmas liuotin 900 mg. Lukuja ei muuteta, vaikka jokin tulos yllättäisi.', pic: null },
    ],
    try: {
      say: 'Liuennut massa mitattiin kolmessa eri liuottimessa. Mikä esitys sopii vertailuun parhaiten?',
      options: ['Pylväsdiagrammi', 'Ympyrädiagrammi', 'Yksi keskiarvo kaikista'],
      answer: 0,
      explain: 'Pylväsdiagrammissa jokainen liuotin saa oman pylvään, ja korkeuksia on helppo verrata.',
      why: [null, 'Ympyrädiagrammi näyttää osuuksia kokonaisuudesta. Liuottimien tulokset eivät ole saman kokonaisuuden osia.', 'Keskiarvo hävittää erot, joita juuri haluttiin verrata.'],
    },
  },
  'CHEM79-DATA-01': {
    beats: [
      { text: 'Näyttelytaululla on diagrammi, ja jokaisen pylvään takana on oikea mittaus. Esimerkiksi veden pylväs 300 mg tulee näytteen M79-1 mittauksesta.', pic: null },
      { text: 'Katsoja voi seurata tietopolkua: näyte → mittaus → taulukon rivi → diagrammin pylväs. Jos joku epäilee arvoa, sen alkuperä löytyy.', pic: null },
      { text: 'Yksikkö kulkee mukana joka vaiheessa. Kun taulukossa on milligrammoja, diagrammin akselissakin lukee mg.', pic: null },
    ],
    try: {
      say: 'Diagrammin toinen pylväs näyttää 450 mg. Mistä arvo tulee?',
      options: ['Taulukkoon kirjatusta mittauksesta', 'Kaikkien näytteiden keskiarvosta', 'Diagrammin tekijän arviosta'],
      answer: 0,
      explain: 'Jokainen diagrammin arvo tulee yhdestä kirjatusta mittauksesta. Näytteen tunnuksen avulla sen voi tarkistaa taulukosta.',
      why: [null, 'Keskiarvo olisi eri luku. Pylväs näyttää yhden näytteen tuloksen.', 'Diagrammiin ei arvioida lukuja, vaan siihen siirretään mitatut arvot.'],
    },
  },
};
