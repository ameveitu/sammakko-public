import type { PageText } from '../text';

/** SCI20 Hiilen ja veden kiertosaari: water cycle, conservation of matter, photosynthesis, burning and the carbon cycle. */
export const TEXT: Record<string, PageText> = {
  'ENV-CHEM-PHOTOSYN-01': {
    beats: [
      { text: 'Kasvi kasvaa, mutta mistä sen uusi aine tulee? Lehti ottaa ilmasta hiilidioksidia, ja juuret imevät maasta vettä.', pic: null },
      { text: 'Valon avulla kasvi rakentaa niistä sokeria, josta se tekee uutta ainetta itselleen. Samalla ilmaan vapautuu happea.', pic: null },
      { text: 'Tätä kutsutaan yhteyttämiseksi. Valo antaa energian, mutta ei ole rakennusaine: kasvin hiili tulee ilman hiilidioksidista.', more: 'Kasvi tarvitsee myös maan kivennäisaineita, mutta niistä ei tule kasvin hiiltä. Pimeässä yhteyttäminen pysähtyy.', pic: null },
    ],
    try: {
      say: 'Iso puu on kasvanut pienestä siemenestä. Mistä sen rungon hiili on peräisin?',
      options: ['Ilmassa olevasta hiilidioksidista', 'Maan mullasta', 'Auringon valosta'],
      answer: 0,
      explain: 'Puu rakentaa itsensä pääosin ilman hiilidioksidista ja vedestä. Valo antaa energian, ja maasta tulee vettä ja vähän kivennäisaineita.',
      why: [null, 'Maasta tulee vettä ja kivennäisaineita, mutta ei rungon hiiltä.', 'Valo on energiaa, ei ainetta. Se ei muutu puun aineeksi.'],
    },
  },
  'ENV-CHEM-MATTERCONS-01': {
    beats: [
      { text: 'Suljetussa kammiossa on 30 mg nestemäistä vettä eikä yhtään vesihöyryä. Kammiota lämmitetään, jolloin osa vedestä haihtuu.', pic: 0 },
      { text: 'Haihtuneet 22 mg ovat nyt näkymätöntä vesihöyryä, ja nestettä on jäljellä 8 mg. Vettä on yhä yhteensä 22 + 8 = 30 mg.', pic: 1, figure: false },
      { text: 'Aine ei katoa, vaikka sitä ei näe, vaan se muuttaa muotoaan. Tätä kutsutaan aineen säilymiseksi.', more: 'Lämmitys tuo kammioon energiaa, joka saa veden haihtumaan. Energia ei muutu aineeksi, eikä aine energiaksi.', pic: 1, figure: false },
    ],
    try: {
      say: 'Suljetussa purkissa on 40 mg vettä, ja siitä 15 mg haihtuu. Paljonko vettä purkissa on yhteensä?',
      options: ['40 mg', '25 mg', '15 mg'],
      answer: 0,
      explain: 'Nesteenä on 25 mg ja vesihöyrynä 15 mg. Yhteensä 25 + 15 = 40 mg, koska suljetusta purkista ei pääse mitään pois.',
      why: [null, '25 mg on vain nestettä. Myös näkymätön vesihöyry on vettä.', '15 mg on vain haihtunut osa. Nestettäkin on vielä jäljellä.'],
    },
  },
  'ENV-CHEM-CYCLE-BURN-01': {
    beats: [
      { text: 'Nuotiossa palaa puuta, ja puun aineessa on paljon hiiltä. Kuvassa hiiltä on kasveissa ja puussa, ilmassa ja vesistössä.', pic: 0 },
      { text: 'Palaessa puun hiili yhtyy ilman happeen, ja syntyy hiilidioksidia, joka nousee ilmaan. Osa siitä voi myöhemmin liueta järveen tai mereen.', pic: 0 },
      { text: 'Palaminen vapauttaa myös lämpöä ja valoa, mutta ne ovat energiaa, eivät ainetta. Hiili ei katoa, vaan siirtyy puusta ilmaan.', pic: 0 },
    ],
    try: {
      say: 'Puu palaa nuotiossa, ja jäljelle jää vähän tuhkaa. Mihin suurin osa puun hiilestä menee?',
      options: ['Ilmaan hiilidioksidina', 'Se muuttuu lämmöksi', 'Se jää tuhkaan'],
      answer: 0,
      explain: 'Palaessa hiili yhtyy happeen ja nousee ilmaan hiilidioksidina. Tuhka on vain pieni osa puun aineesta.',
      why: [null, 'Lämpö on energiaa. Aine ei muutu energiaksi, vaan hiili jatkaa matkaa ilmaan.', 'Tuhkassa on vain pieni osa puun aineesta, lähinnä kivennäisaineita.'],
    },
  },
  'ENV-CHEM-CYCLE-PHOTO-01': {
    beats: [
      { text: 'Ilmaa ei näe, mutta siinä on hiilidioksidia. Lehti ottaa sitä ilmasta ja liittää sen hiilen omaan aineeseensa.', pic: null },
      { text: 'Mallissa lehti sitoo valossa 10 mg hiiltä, mutta pimeässä ei yhtään. Valo antaa yhteyttämiseen tarvittavan energian.', pic: null },
      { text: 'Valo ei silti muutu kasvin aineeksi: hiili tulee ilmasta, ja valo antaa vain energian. Näin hiili siirtyy ilmasta kasveihin.', pic: null },
    ],
    try: {
      say: 'Kasvi on viikon pimeässä kaapissa. Mitä sen yhteyttämiselle tapahtuu?',
      options: ['Se pysähtyy, koska valoa ei ole', 'Se jatkuu, koska hiilidioksidia on', 'Se jatkuu, jos kasvia kastellaan'],
      answer: 0,
      explain: 'Yhteyttäminen tarvitsee valon energiaa. Pimeässä kasvi ei sido ilmasta hiiltä, vaikka hiilidioksidia ja vettä olisi.',
      why: [null, 'Hiilidioksidi on rakennusaine, mutta ilman valon energiaa sitä ei voi käyttää.', 'Vesi on tarpeen, mutta se ei korvaa valoa.'],
    },
  },
  'ENV-CHEM-CYCLE-MATTER-01': {
    beats: [
      { text: 'Kuvan pallot ovat hiilen varastoja: ilma, kasvit, eläimet, kuollut aines, vesistö ja geologinen varasto eli maan syvät kerrokset.', pic: 0 },
      { text: 'Kasvi ottaa hiiltä ilmasta, eläin syö kasvin, ja kuollut eläin päätyy maahan. Hajottajat, kuten sienet ja bakteerit, hajottavat kuolleen aineksen, ja hiili palaa ilmaan.', pic: 1 },
      { text: 'Sama hiili voi kiertää ilmasta kasviin, eläimeen, maahan ja taas ilmaan. Reittejä on monta, ja osa on nopeita, osa hyvin hitaita.', more: 'Kasvi palauttaa osan hiilestä ilmaan myös suoraan, kun se hengittää. Siksi kasvin ja ilman välillä on nuolet kumpaankin suuntaan.', pic: 1 },
    ],
    try: {
      say: 'Lehti putoaa syksyllä maahan ja maatuu. Mikä palauttaa sen hiilen ilmaan?',
      options: ['Hajottajat, kuten sienet ja bakteerit', 'Sadevesi, joka huuhtoo lehden', 'Ei mikään, lehti vain katoaa'],
      answer: 0,
      explain: 'Hajottajat käyttävät kuollutta lehteä ravintonaan. Hengittäessään ne vapauttavat lehden hiilen ilmaan hiilidioksidina.',
      why: [null, 'Vesi voi siirtää lehteä, mutta se ei muuta lehden hiiltä hiilidioksidiksi.', 'Aine ei katoa. Lehden hiili siirtyy hajottajien kautta ilmaan.'],
    },
  },
  'ENV-CHEM-CYCLE-01': {
    beats: [
      { text: 'Metsässä sama hiili voi olla ensin ilmassa, sitten puussa ja lopulta taas ilmassa. Hiiltä ei synny lisää eikä se katoa, se vain vaihtaa paikkaa.', pic: 0 },
      { text: 'Yhteyttäminen vie hiiltä ilmasta kasviin. Palaminen, hengitys ja hajotus palauttavat sen ilmaan hiilidioksidina.', pic: 0 },
      { text: 'Aine kiertää, mutta energia ei kierrä. Auringon valosta kasviin sitoutunut energia vapautuu lopulta lämpönä, kun puu palaa tai eliöt hengittävät.', pic: 0 },
    ],
    try: {
      say: 'Mikä näistä vie hiiltä ilmasta kasveihin?',
      options: ['Yhteyttäminen', 'Palaminen', 'Hajotus'],
      answer: 0,
      explain: 'Yhteyttämisessä kasvi ottaa ilmasta hiilidioksidia ja rakentaa siitä sokeria. Palaminen ja hajotus vievät hiiltä takaisin ilmaan.',
      why: [null, 'Palaminen vie hiiltä kasvista ilmaan, ei ilmasta kasviin.', 'Hajottajat palauttavat kuolleen aineksen hiiltä ilmaan.'],
    },
  },
  'ENV-CHEM-WATERCYCLE-01': {
    beats: [
      { text: 'Auringon lämpö haihduttaa merestä vettä näkymättömäksi vesihöyryksi. Ilmassa höyry jäähtyy ja tiivistyy pilven pieniksi pisaroiksi tai jääkiteiksi.', more: 'Pilvi ei ole vesihöyryä, sillä höyryä ei näe. Pilven näkee, koska siinä on pieniä vesipisaroita tai jääkiteitä.', pic: 0 },
      { text: 'Pilvestä vesi sataa rinteelle, ja puro vie sen takaisin mereen. Osa vedestä imeytyy maahan pohjavedeksi, joka virtaa hitaasti mereen.', pic: 1 },
      { text: 'Vuorella vesi voi odottaa lumena pitkään ennen kuin se sulaa puroon. Kaikki nämä reitit yhdessä ovat veden kiertokulku.', pic: 1 },
    ],
    try: {
      say: 'Taivaalla näkyy valkoinen pilvi. Mitä se on?',
      options: ['Pieniä vesipisaroita tai jääkiteitä', 'Näkymätöntä vesihöyryä', 'Savua tai pölyä'],
      answer: 0,
      explain: 'Vesihöyry on näkymätöntä. Kun se jäähtyy ja tiivistyy pieniksi pisaroiksi tai jääkiteiksi, syntyy näkyvä pilvi.',
      why: [null, 'Vesihöyryä ei näe. Näkyvä pilvi on jo tiivistynyttä vettä.', 'Pilvessä on vettä. Pölyhiukkasten ympärille pisarat vain tiivistyvät.'],
    },
  },
  'CHEM79-CARBON-RESERVOIRS': {
    beats: [
      { text: 'Hiiltä on ilmakehässä hiilidioksidina, eliöissä ja kuolleessa aineksessa orgaanisina yhdisteinä sekä vesistöissä liuenneena. Hiiltä ei siis tarvitse nähdä mustana aineena.', pic: 0 },
      { text: 'Geologisia varastoja ovat esimerkiksi kalkkikivi eli karbonaattikivi sekä fossiiliset polttoaineet: öljy, kivihiili ja maakaasu. Niissä hiili voi pysyä miljoonia vuosia.', pic: 0 },
      { text: 'Varasto on paikka, jossa hiiltä on, ja prosessi siirtää sitä varastosta toiseen. Metsä on varasto, mutta yhteyttäminen on siirtymä.', pic: 1, figure: false },
    ],
    try: {
      say: 'Mikä näistä on hiilen varasto?',
      options: ['Kalkkikivi', 'Yhteyttäminen', 'Puhdas vesi H₂O'],
      answer: 0,
      explain: 'Kalkkikivessä on karbonaattina sitoutunutta hiiltä, joka voi pysyä siinä miljoonia vuosia. Siksi se on geologinen hiilivarasto.',
      why: [null, 'Yhteyttäminen siirtää hiiltä ilmasta kasviin. Se on prosessi, ei varasto.', 'H₂O:ssa on vain vetyä ja happea. Vesistön hiili on siihen liuennutta hiilidioksidia.'],
    },
  },
  'CHEM79-CARBON-TRANSFERS': {
    beats: [
      { text: 'Nuoli kertoo, mistä varastosta hiili lähtee ja mihin se siirtyy. Yhteyttäminen vie hiiltä ilmakehän hiilidioksidista kasvien sokereihin.', more: 'Yhteyttämisen reaktio: 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂. Valo antaa reaktioon tarvittavan energian.', pic: 1 },
      { text: 'Ravintoketjussa hiili siirtyy kasveista eläimiin, ja kuollut aines päätyy maaperään. Hajottajien soluhengitys palauttaa hiilen ilmakehään hiilidioksidina.', pic: 1 },
      { text: 'Soluhengitys kulkee yhteyttämiselle vastakkaiseen suuntaan: eliö hajottaa sokeria ja vapauttaa hiilidioksidia. Siksi kasvien ja ilman välillä on nuolet kumpaankin suuntaan.', pic: 1 },
    ],
    try: {
      say: 'Jänis syö apilaa. Mihin suuntaan hiili siirtyy?',
      options: ['Kasveista eläimiin', 'Eläimistä kasveihin', 'Ilmakehästä eläimiin'],
      answer: 0,
      explain: 'Syödessään jänis saa apilan orgaanisen aineen ja sen hiilen. Nuoli kulkee kasveista eläimiin.',
      why: [null, 'Hiili kulkee syöjään päin, eli apilasta jänikseen.', 'Eläimet eivät sido hiiltä ilmasta. Ne saavat sen ravinnosta.'],
    },
  },
  'CHEM79-CARBONCYCLE': {
    beats: [
      { text: 'Hiilen kierrossa on varastoja ja niiden välisiä siirtymiä. Yhteyttäminen sitoo hiiltä ilmakehästä, ja hengitys, hajotus ja palaminen palauttavat sitä.', pic: 0 },
      { text: 'Osa ilmakehän hiilidioksidista liukenee vesistöihin. Kun fossiilista maakaasua eli metaania poltetaan, ilmakehään tulee hiiltä geologisesta varastosta.', pic: 0 },
      { text: 'Muutos = tulot − lähdöt = 12 − 9 = 3 mg, joten ilmakehän hiilivarasto kasvaa. Jos tulot ja lähdöt ovat yhtä suuret, varasto pysyy ennallaan.', example: 'Ilmakehään tulee 12 mg hiiltä, ja sieltä lähtee 9 mg. Miten varasto muuttuu?', pic: null },
    ],
    try: {
      say: 'Metsä hakataan ja poltetaan, eikä tilalle kasva uutta. Miten ilmakehän hiilivarasto muuttuu?',
      options: ['Kasvaa', 'Pienenee', 'Pysyy samana'],
      answer: 0,
      explain: 'Palaminen siirtää puun hiilen ilmakehään, eikä yhteyttäminen enää sido sitä takaisin. Tulot kasvavat ja lähdöt pienenevät.',
      why: [null, 'Palaminen lisää ilmakehän hiilidioksidia, ei vähennä sitä.', 'Hiiltä siirtyy puista ilmakehään, eikä uusi metsä sido sitä takaisin.'],
    },
  },
  'CHEM79-CARBON-PHOTO': {
    beats: [
      { text: 'Yhteyttämisessä kasvi sitoo ilmakehän hiilidioksidia sokeriksi: 6 CO₂ + 6 H₂O → C₆H₁₂O₆ + 6 O₂. Hiili siirtyy ilmakehästä eliöihin.', more: 'Valo antaa reaktioon energian, mutta hiiliatomit tulevat hiilidioksidista.', pic: 0 },
      { text: 'Samaan aikaan kasvit, hajottajat ja vesistöt palauttavat hiilidioksidia ilmaan. Ilmakehän hiilivaraston muutos riippuu kaikista virroista yhdessä.', pic: 0 },
      { text: 'Pimeässä yhteyttäminen pysähtyy, mutta soluhengitys jatkuu. Siksi kasvi vapauttaa yöllä hiilidioksidia.', pic: 0 },
    ],
    try: {
      say: 'Metsä sitoo vuodessa 20 t hiiltä, ja hengitys ja hajotus vapauttavat 14 t. Miten ilmakehän hiili muuttuu?',
      options: ['Pienenee 6 t', 'Pienenee 20 t', 'Kasvaa 14 t'],
      answer: 0,
      explain: 'Ilmakehästä lähtee 20 t ja sinne palaa 14 t. Muutos on 14 − 20 = −6 t, joten varasto pienenee 6 t.',
      why: [null, 'Hengitys ja hajotus palauttavat osan, joten pelkkä yhteyttäminen ei kerro koko muutosta.', 'Palaava 14 t on pienempi kuin sidottu 20 t, joten varasto pienenee.'],
    },
  },
  'CHEM79-CARBON-BURN': {
    beats: [
      { text: 'Metaani palaa: CH₄ + 2 O₂ → CO₂ + 2 H₂O. Polttoaineen hiili siirtyy ilmakehään hiilidioksidina, ja vety muodostaa vettä.', pic: 0 },
      { text: 'Puun hiili sitoutui ilmasta vasta vuosikymmeniä sitten, ja uusi metsä voi sitoa sen takaisin. Tämä on hiilen lyhyt kierto.', pic: 0 },
      { text: 'Fossiilisen maakaasun, öljyn ja kivihiilen hiili on ollut maan alla miljoonia vuosia. Poltettuna se lisää ilmakehän hiiltä, koska geologiseen varastoon se palaa hyvin hitaasti.', pic: 0 },
    ],
    try: {
      say: 'Kumpi lisää ilmakehän hiiltä pitkällä aikavälillä, kun hakattu metsä kasvaa takaisin?',
      options: ['Maakaasun poltto', 'Puun poltto', 'Molemmat yhtä paljon'],
      answer: 0,
      explain: 'Uusi metsä sitoo puun hiilen takaisin, mutta fossiilisen hiilen paluu geologiseen varastoon kestää miljoonia vuosia. Siksi fossiilinen hiili kertyy ilmakehään.',
      why: [null, 'Puun hiili kiertää lyhyesti: kasvava metsä sitoo sen uudelleen.', 'Kummassakin syntyy hiilidioksidia, mutta vain puun hiili sitoutuu takaisin nopeasti.'],
    },
  },
};
