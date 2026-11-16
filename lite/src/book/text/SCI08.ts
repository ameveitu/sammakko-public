import type { PageText } from '../text';

/** SCI08 Turvaniemen yhteinen piiri: safe investigating, chemicals, poisoning, electricity and fire. */
export const TEXT: Record<string, PageText> = {
  'SCI-ENV-SAFE-01': {
    beats: [
      { text: 'Ennen tutkimista Aava kuuntelee ohjeen loppuun ja odottaa lupaa. Sitten hän laittaa suojalasit ja tekee niin kuin ohjeessa sanotaan.', more: 'Pitkät hiukset sidotaan kiinni, jotta ne eivät osu mihinkään.', pic: 0 },
      { text: 'Lasipurkki putoaa ja menee rikki. Pysähdy, älä koske sirpaleisiin, astu kauemmas ja kerro heti aikuiselle.', pic: 1 },
      { text: 'Pöydällä on pullo, jossa ei ole nimeä. Tuntematonta ainetta ei haisteta eikä maisteta, vaan siitä kysytään aikuiselta.', pic: 2 },
    ],
    try: 'auto',
  },
  'ENV-CHEM-CHEMICAL-SAFE-01': {
    beats: [
      { text: 'Varastossa on pullo, jossa ei ole nimeä eikä ohjetta. Se näyttää juomapullolta, mutta muoto ei kerro, mitä sen sisällä on.', pic: 1, figure: false },
      { text: 'Tuntematonta ainetta ei haisteta, maisteta eikä kosketa. Pysy erossa pullosta, varoita ystäviä ja kerro aikuiselle.', pic: 1, figure: false },
      { text: 'Kemikaalit säilytetään omissa pakkauksissaan, joissa on nimi ja käyttöohje. Silloin kukaan ei luule niitä juomaksi.', pic: 1, figure: false },
    ],
    try: {
      say: 'Varastossa on nimetön pullo, joka näyttää mehupullolta. Mitä teet?',
      options: ['Jätän sen rauhaan ja kerron aikuiselle', 'Haistan varovasti, mitä siinä on', 'Maistan pienen tilkan'],
      answer: 0,
      explain: 'Pullon muoto ei kerro sisällöstä. Tuntematon aine jätetään rauhaan, ja aikuinen selvittää, mitä se on.',
      why: [null, 'Haistaminenkin voi olla vaarallista, jos aine on myrkyllistä.', 'Tuntematonta ainetta ei koskaan maisteta.'],
    },
  },
  'ENV-CHEM-POISON-SAFE-01': {
    beats: [
      { text: 'Eväspaikan lähellä on kemikaalipakkaus. Kemikaalit pidetään aina erillään ruoasta, ettei niitä syödä tai juoda vahingossa.', pic: 1, figure: false },
      { text: 'Jos ainetta on ehkä mennyt suuhun, kerro heti aikuiselle. Hoitoa ei kokeilla itse, eikä yritetä oksentaa.', pic: 1, figure: false },
      { text: 'Aikuinen soittaa Myrkytystietokeskukseen numeroon 0800 147 111. Jos henki on vaarassa, soitetaan hätänumeroon 112.', pic: 1, figure: false },
    ],
    try: {
      say: 'Ystävä on ehkä maistanut pesuainetta. Mitä teet ensin?',
      options: ['Kerron heti aikuiselle', 'Yritän saada hänet oksentamaan', 'Odotan, tuleeko hänelle paha olo'],
      answer: 0,
      explain: 'Myrkytysepäily kuuluu heti aikuiselle. Aikuinen soittaa Myrkytystietokeskukseen ja toimii sieltä saatujen ohjeiden mukaan.',
      why: [null, 'Oksentaminen voi pahentaa tilannetta. Hoitoa ei kokeilla itse.', 'Apua haetaan heti, vaikka olo tuntuisi vielä hyvältä.'],
    },
  },
  'ENV-CHEM-FIRE-SAFE-01': {
    beats: [
      { text: 'Retkellä näkyy savua metsästä. Ryhmä menee savutonta reittiä sovitulle kokoontumispaikalle, eikä savua kohti mennä katsomaan.', pic: 1, figure: false },
      { text: 'Turvallisesta paikasta aikuinen soittaa hätänumeroon 112. Tavaroita ei palata hakemaan, vaan paikalla odotetaan lupaa.', more: 'Lapsi ei sammuta paloa eikä mene sen lähelle. Palon hoitavat pelastajat.', pic: 1, figure: false },
    ],
    try: {
      say: 'Reppu jäi leiripaikalle, ja sinne leviää savua. Mitä teet?',
      options: ['Jään kokoontumispaikalle ja kerron aikuiselle', 'Juoksen nopeasti hakemaan repun', 'Menen katsomaan, kuinka iso palo on'],
      answer: 0,
      explain: 'Tavaran voi korvata, ihmistä ei. Savuun ei mennä, ja paluuseen odotetaan aikuisen lupa.',
      why: [null, 'Savu voi viedä tajun nopeasti. Tavaroita ei palata hakemaan.', 'Paloa ei lähestytä. Pelastajat hoitavat sen.'],
    },
  },
  'ENV-CHEM-HOMECHEM-SAFE-01': {
    beats: [
      { text: 'Retkitalossa on kolme eri tilannetta: nimetön pullo, ehkä suuhun mennyt aine ja savu. Jokaisessa toimitaan omalla tavalla, mutta aina kerrotaan aikuiselle.', pic: 1, figure: false },
      { text: 'Nimetön pullo jätetään rauhaan, ja kemikaalit pidetään erillään ruoasta. Jos ainetta on mennyt suuhun, aikuinen soittaa Myrkytystietokeskukseen.', more: 'Myrkytystietokeskuksen numero on 0800 147 111. Jos henki on vaarassa, soitetaan 112.', pic: 1, figure: false },
      { text: 'Savua nähdessä poistutaan savutonta reittiä kokoontumispaikalle. Hätänumeroon 112 soitetaan turvallisesta paikasta.', pic: 1, figure: false },
    ],
    try: {
      say: 'Kaapissa pesuaine ja mehu ovat samalla hyllyllä. Mikä on paras korjaus?',
      options: ['Pesuaine eri paikkaan, lasten ulottumattomiin', 'Pesuaine mehupulloon, niin se on siistimpi', 'Ei mitään, pakkaukset ovat erinäköiset'],
      answer: 0,
      explain: 'Kemikaalit säilytetään omissa pakkauksissaan erillään ruoasta ja lasten ulottumattomissa. Silloin niitä ei oteta vahingossa.',
      why: [null, 'Juomapullossa pesuaine näyttää juomalta. Kemikaali pysyy omassa pakkauksessaan.', 'Kiireessä pakkaukset voi sekoittaa. Kemikaalit pidetään erillään ruoasta.'],
    },
  },
  'PHY79-SAFE-01': {
    beats: [
      { text: 'Tuulitunnelin liikkuva osa voi lyödä tai puristaa. Siksi sitä katsotaan kiinteän suojan takaa, ja kädet pidetään poissa liikkuvista osista.', pic: 1, figure: false },
      { text: 'Ennen säätöä laite pysäytetään ja varmistetaan, että se on todella pysähtynyt. Vasta sitten osiin saa koskea.', pic: 1, figure: false },
      { text: 'Työohje luetaan ennen aloittamista, ja siinä mainitut suojaimet otetaan käyttöön. Jos jotain odottamatonta tapahtuu, laite pysäytetään ja opettajalle kerrotaan.', pic: 1, figure: false },
    ],
    try: {
      say: 'Tuulitunnelin siipeä pitää säätää. Mitä tehdään ensin?',
      options: ['Pysäytetään laite ja varmistetaan, että se on pysähtynyt', 'Säädetään nopeasti laitteen käydessä', 'Kurkistetaan suojan ohi lähempää'],
      answer: 0,
      explain: 'Liikkuva osa voi vahingoittaa kättä. Säätö tehdään vasta, kun laite on pysäytetty ja pysähtyminen varmistettu.',
      why: [null, 'Käynnissä oleva osa voi lyödä tai vetää käden mukaansa.', 'Suoja on siksi, ettei liikkuviin osiin päästä käsiksi.'],
    },
  },
  'PHY79-ELEC-SAFE': {
    beats: [
      { text: 'Johdon eristys estää koskemasta johtimeen. Jos eristys on rikki, ihminen voi joutua osaksi virtapiiriä, jolloin virta kulkee kehon läpi: sähköisku.', pic: 1, figure: false },
      { text: 'Vaurio on vaarallinen, vaikka kipinöitä ei näkyisi. Viallinen johto voi myös kuumentua ja sytyttää palon.', pic: 1, figure: false },
      { text: 'Siksi: älä koske, pysy kaukana ja varoita muita, kerro aikuiselle. Aikuinen katkaisee sähköt, ja sähköalan ammattilainen korjaa vian.', pic: 1, figure: false },
    ],
    try: {
      say: 'Valaisimen johdon kuori on haljennut, mutta kipinöitä ei näy. Mitä teet?',
      options: ['En koske, varoitan muita ja kerron aikuiselle', 'Teippaan johdon itse kiinni', 'Kokeilen, toimiiko valo vielä'],
      answer: 0,
      explain: 'Ehjältä näyttävästäkin vauriosta voi saada sähköiskun. Aikuinen katkaisee sähköt, ja ammattilainen korjaa johdon.',
      why: [null, 'Korjaaminen vaatii koskemista vaurioon. Sähkövian korjaa ammattilainen.', 'Valon kokeileminen päästää virran kulkemaan viallisen johdon läpi.'],
    },
  },
  'CHEM79-SAFE-01': {
    beats: [
      { text: 'Laboratoriossa luetaan ensin työohje ja otetaan sen vaatimat suojaimet, kuten suojalasit. Jokaisen näytteen tunniste tarkistetaan ennen työtä.', pic: 1, figure: false },
      { text: 'Astioita kannetaan vain sen verran kuin hallitaan. Kun jotain kaatuu tai menee rikki, siitä kerrotaan heti opettajalle.', pic: 1, figure: false },
    ],
    try: {
      say: 'Näyteputkesta on irronnut tunniste. Mitä teet?',
      options: ['Kerron opettajalle enkä käytä näytettä', 'Päättelen aineen sen väristä', 'Haistan, mitä putkessa on'],
      answer: 0,
      explain: 'Ilman tunnistetta ainetta ei tiedetä. Opettaja selvittää sen, ja siihen asti näyte jää käyttämättä.',
      why: [null, 'Monet aineet näyttävät samanlaisilta. Väri ei kerro, mikä aine on.', 'Haistaminen voi olla vaarallista, eikä se kerro aineesta varmasti.'],
    },
  },
  'CHEM79-CHEMICAL-USE-SAFE': {
    beats: [
      { text: 'Kaksi puhdistusainepakkausta voi näyttää samalta, mutta niiden ohjeet ovat erilaiset. Jokaista ainetta käytetään oman pakkauksensa ohjeen mukaan.', pic: 1, figure: false },
      { text: 'Aineita ei sekoiteta keskenään. Esimerkiksi klooripitoinen ja hapan puhdistusaine voivat yhdessä muodostaa myrkyllistä kloorikaasua.', pic: 1, figure: false },
      { text: 'Ohjeessa voi lukea esimerkiksi: säilytä alkuperäispakkauksessa, huolehdi ilmanvaihdosta ja pidä erillään elintarvikkeista.', pic: 1, figure: false },
    ],
    try: {
      say: 'Mikä näistä on turvallinen tapa käyttää puhdistusainetta?',
      options: ['Luen juuri tämän pakkauksen ohjeen', 'Sekoitan kahta ainetta tehon lisäämiseksi', 'Käytän samannäköisen pakkauksen ohjetta'],
      answer: 0,
      explain: 'Jokaisella aineella on oma ohjeensa, ja sitä noudatetaan. Aineita ei sekoiteta keskenään.',
      why: [null, 'Aineiden sekoittaminen voi tuottaa myrkyllistä kaasua.', 'Samannäköisessä pakkauksessa voi olla aivan eri aine.'],
    },
  },
  'CHEM79-HAZARD-LABEL': {
    beats: [
      { text: 'Varoitusmerkki on punareunainen vinoneliö, jossa on musta kuva. Kuva kertoo vaaran: liekki tarkoittaa syttyvää ainetta ja kaasupullo paineen alaista kaasua.', pic: 1, figure: false },
      { text: 'Pääkallo varoittaa myrkyllisestä aineesta, ja syövyttävän aineen merkissä aine syövyttää kättä ja pintaa. Kuollut kala ja puu varoittavat ympäristövaarasta.', pic: 1, figure: false },
      { text: 'Merkki kertoo, millainen vaara on. Miten toimitaan, luetaan saman pakkauksen omasta ohjeesta.', more: 'Pakkauksen väri ei kerro vaarasta. Punainen pullo ei ole aina vaarallinen, eikä valkoinen pullo ole aina turvallinen.', pic: 1, figure: false },
    ],
    try: {
      say: 'Pakkauksen varoitusmerkissä on liekki. Mitä merkki kertoo?',
      options: ['Aine syttyy helposti', 'Aine on kuumaa', 'Aine on myrkyllistä'],
      answer: 0,
      explain: 'Liekki varoittaa syttyvästä aineesta. Sellainen pidetään erossa lämmöstä ja avotulesta.',
      why: [null, 'Liekki ei kerro aineen lämpötilasta vaan syttymisvaarasta.', 'Myrkyllisestä aineesta varoittaa pääkallo.'],
    },
  },
  'CHEM79-CHEMICAL-SAFE': {
    beats: [
      { text: 'Pakkauksessa on varoitusmerkki ja käyttöohje. Merkki kertoo vaaran, ja ohje kertoo, miten juuri tätä ainetta käytetään ja säilytetään.', pic: 1, figure: false },
      { text: 'Turvallinen päätös tarvitsee molemmat. Kaasupullo-merkki varoittaa paineesta, ja ohje käskee pitämään pakkauksen erossa lämmöstä, koska lämpö kasvattaa painetta.', pic: 1, figure: false },
      { text: 'Kemikaalit säilytetään alkuperäispakkauksessa, erillään ruoasta ja lasten ulottumattomissa. Varsinaisesta kemikaalityöstä vastaa aikuinen.', pic: 1, figure: false },
    ],
    try: {
      say: 'Pakkauksessa on kaasupullo-merkki. Mikä ohjeen kohta liittyy siihen suoraan?',
      options: ['Säilytä erossa lämmöstä', 'Pese kädet käytön jälkeen', 'Käytä suojakäsineitä'],
      answer: 0,
      explain: 'Kaasupullo-merkki varoittaa paineen alaisesta kaasusta. Lämpö kasvattaa painetta, joten pakkaus pidetään erossa lämmöstä.',
      why: [null, 'Käsien pesu on hyvä tapa, mutta se ei liity paineeseen.', 'Käsineet suojaavat iholle joutuvalta aineelta, eivät paineelta.'],
    },
  },
  'CHEM79-FIRE-CONDITIONS': {
    beats: [
      { text: 'Palaminen tarvitsee kolme asiaa yhtä aikaa: palavaa ainetta, happea ja riittävän korkean lämpötilan. Niitä kutsutaan palokolmioksi.', pic: 1, figure: false },
      { text: 'Jos yksikin ehto poistetaan, palaminen loppuu. Sammutuspeite estää hapen pääsyn liekkeihin, ja vesi jäähdyttää.', more: 'Kolmas keino on poistaa palava aine: kun polttoaine loppuu, palo sammuu.', pic: 1, figure: false },
    ],
    try: {
      say: 'Kattilan rasva syttyy, ja kattilaan nostetaan kansi. Mikä palamisen ehto poistuu?',
      options: ['Happi', 'Palava aine', 'Riittävä lämpötila'],
      answer: 0,
      explain: 'Kansi estää ilman pääsyn liekkeihin, ja ilman happea palaminen loppuu. Rasvapaloon ei koskaan kaadeta vettä.',
      why: [null, 'Rasva jää kattilaan. Kansi ei poista sitä.', 'Kansi ei jäähdytä rasvaa heti. Se katkaisee hapen saannin.'],
    },
  },
  'CHEM79-FIRE-ACTION': {
    beats: [
      { text: 'Lähtöpaikalta vie kolme polkua kokoontumispaikalle. Kivipolulla on savua, joten ryhmä kulkee savutonta Rantapolkua.', pic: 1, figure: false },
      { text: 'Liekkejä ei lähestytä, eikä tavaroita palata hakemaan. Jo muutama hengenveto savua voi viedä tajun.', pic: 1, figure: false },
      { text: 'Hätäilmoitus soitetaan numeroon 112 turvallisesta paikasta. Paikalla odotetaan, kunnes pelastajat antavat luvan palata.', pic: 1, figure: false },
    ],
    try: {
      say: 'Kokoontumispaikalla huomaat, että puhelimesi jäi leiriin. Mitä teet?',
      options: ['Jään paikalleni ja kerron aikuiselle', 'Haen sen nopeasti savuttomaa polkua', 'Pyydän kaveria hakemaan sen'],
      answer: 0,
      explain: 'Vaaran lähelle ei palata ennen pelastajien lupaa. Aikuinen voi soittaa hätänumeroon omalla puhelimellaan.',
      why: [null, 'Tilanne voi muuttua nopeasti, ja savu voi levitä polulle.', 'Kaverikaan ei saa palata vaaran lähelle.'],
    },
  },
  'CHEM79-FIRE-SAFE': {
    beats: [
      { text: 'Retkikatokselta näkyy savua yhdessä suunnassa. Ryhmä lähtee toiseen, savuttomaan suuntaan, ja ryhmän aikuinen soittaa hätänumeroon 112.', more: 'Palon hoitavat pelastajat. Ryhmä pysyy turvapaikalla, kunnes paluuseen annetaan lupa.', pic: 1 },
      { text: 'Palaminen tarvitsee palavaa ainetta, happea ja riittävän lämmön. Mallissa kaikki kolme ovat paikalla, joten palo jatkuu.', pic: 0 },
      { text: 'Sammuttaminen poistaa yhden ehdon: vesi jäähdyttää, sammutuspeite estää hapen pääsyn ja palavan aineen poisto vie palolta polttoaineen.', pic: 0 },
    ],
    try: {
      say: 'Nuotio sammutetaan kaatamalla sen päälle runsaasti vettä. Mikä palamisen ehto poistuu ensisijaisesti?',
      options: ['Riittävä lämpötila', 'Happi', 'Palava aine'],
      answer: 0,
      explain: 'Vesi jäähdyttää puut ja hiilet niin, ettei lämpötila enää riitä palamiseen.',
      why: [null, 'Vesi peittää hetkeksi, mutta sen päävaikutus on jäähdyttäminen.', 'Puut jäävät paikalleen. Vesi ei poista niitä.'],
    },
  },
};
