import type { PageDraw } from '../pages';
import { cards, escape, fireTriangle, flow, hazards } from '../figures';

const SIGN_AND_GUIDE = cards({ cards: [{ icon: '⚠️', title: 'varoitusmerkki', text: 'millainen vaara', tone: 'warm' }, { icon: '📄', title: 'käyttöohje', text: 'miten toimitaan', tone: 'cool' }], label: 'Merkki kertoo vaaran, ohje kertoo miten toimitaan' });
const KEEP = cards({ cards: [{ icon: '📦', title: 'alkuperäinen pakkaus', mark: 'ok' }, { icon: '🍞', title: 'erillään ruoasta', mark: 'ok' }, { icon: '🔒', title: 'lasten ulottumattomissa', mark: 'ok' }], label: 'Kemikaalit alkuperäispakkauksessa, erillään ruoasta ja lasten ulottumattomissa' });

/** Safety: what to do, in a few clear steps; warning signs and the fire triangle. */
export const DRAW: Record<string, () => PageDraw> = {
  'ENV-CHEM-CHEMICAL-SAFE-01': () => ({ beats: [
    cards({ cards: [{ icon: '🧃', title: 'näyttää juomalta', tone: 'plain' }, { icon: '❓', title: 'mitä sisällä?', text: 'ei nimeä eikä ohjetta', tone: 'warm' }], label: 'Nimetön pullo: muoto ei kerro sisältöä' }),
    cards({ cards: [{ icon: '👃', title: 'ei haisteta', mark: 'no' }, { icon: '👅', title: 'ei maisteta', mark: 'no' }, { icon: '✋', title: 'ei kosketa', mark: 'no' }, { icon: '🧑', title: 'kerro aikuiselle', mark: 'ok' }], label: 'Tuntematonta ainetta ei haisteta, maisteta eikä kosketa. Kerro aikuiselle.' }),
    cards({ cards: [{ icon: '🏷️', title: 'oma pakkaus', text: 'nimi ja käyttöohje', mark: 'ok' }, { icon: '🧃', title: 'juomapullo', text: 'ei kemikaaleille', mark: 'no' }], label: 'Kemikaali omassa pakkauksessaan, ei juomapullossa' }),
  ] }),
  'ENV-CHEM-POISON-SAFE-01': () => ({ beats: [
    cards({ cards: [{ icon: '🧺', title: 'eväät', tone: 'plain' }, { icon: '↔️', title: 'erillään', tone: 'plain' }, { icon: '🧴', title: 'kemikaali', tone: 'warm' }], label: 'Kemikaalit pidetään erillään ruoasta' }),
    flow({ steps: [{ icon: '👄', text: 'ainetta suuhun?' }, { icon: '🧑', text: 'kerro heti aikuiselle', mark: 'ok' }, { icon: '🚫', text: 'ei omaa hoitoa', sub: 'ei oksenneta' }], label: 'Jos ainetta meni suuhun: kerro heti aikuiselle, ei omaa hoitoa' }),
    cards({ cards: [{ icon: '☎️', title: '0800 147 111', text: 'Myrkytystietokeskus', tone: 'cool' }, { icon: '🚑', title: '112', text: 'jos henki on vaarassa', tone: 'warm' }], label: 'Myrkytystietokeskus 0800 147 111, hätänumero 112' }),
  ] }),
  'ENV-CHEM-FIRE-SAFE-01': () => ({ beats: [
    escape({ label: 'Savuton reitti vie kokoontumispaikalle, savua kohti ei mennä' }),
    cards({ cards: [{ icon: '📞', title: '112', text: 'turvallisesta paikasta', mark: 'ok' }, { icon: '🎒', title: 'tavaroita ei haeta', mark: 'no' }, { icon: '⏳', title: 'odota lupaa', tone: 'plain' }], label: 'Turvallisesta paikasta soitetaan 112, tavaroita ei haeta' }),
  ] }),
  'ENV-CHEM-HOMECHEM-SAFE-01': () => ({ beats: [
    cards({ cards: [{ icon: '🧴', title: 'nimetön pullo' }, { icon: '👄', title: 'ainetta suuhun' }, { icon: '💨', title: 'savua' }], label: 'Kolme tilannetta: nimetön pullo, ainetta suuhun ja savu' }),
    cards({ cards: [{ icon: '🧴', title: 'nimetön pullo', text: 'jätä rauhaan' }, { icon: '☎️', title: 'suuhun meni', text: 'aikuinen soittaa 0800 147 111' }], label: 'Nimetön pullo jätetään rauhaan. Suuhun mennyt aine: aikuinen soittaa Myrkytystietokeskukseen.' }),
    escape({ label: 'Savua nähdessä savutonta reittiä kokoontumispaikalle' }),
  ] }),
  'PHY79-SAFE-01': () => ({ beats: [
    cards({ cards: [{ icon: '🛡️', title: 'katso suojan takaa', mark: 'ok' }, { icon: '✋', title: 'kädet liikkuvissa osissa', mark: 'no' }], label: 'Liikkuvaa osaa katsotaan kiinteän suojan takaa' }),
    flow({ steps: [{ icon: '⏹️', text: 'pysäytä laite' }, { icon: '👀', text: 'varmista, että pysähtyi' }, { icon: '🔧', text: 'vasta sitten säädä' }], label: 'Ensin pysäytys ja varmistus, sitten säätö' }),
    flow({ steps: [{ icon: '📄', text: 'lue työohje' }, { icon: '🥽', text: 'suojaimet' }, { icon: '▶️', text: 'aloita' }, { icon: '⏹️', text: 'outoa? pysäytä', sub: 'kerro opettajalle' }], label: 'Työohje, suojaimet, aloitus. Odottamaton tilanne: pysäytä ja kerro.' }),
  ] }),
  'PHY79-ELEC-SAFE': () => ({ beats: [
    flow({ steps: [{ icon: '🔌', text: 'eristys rikki' }, { icon: '✋', text: 'kosketus' }, { icon: '⚡', text: 'virta kehon läpi', mark: 'no' }], label: 'Rikkinäinen eristys: kosketus voi viedä virran kehon läpi' }),
    cards({ cards: [{ icon: '⚡', title: 'sähköisku', text: 'ilman kipinöitäkin', tone: 'warm' }, { icon: '🔥', title: 'palo', text: 'johto voi kuumentua', tone: 'warm' }], label: 'Vaurio on vaarallinen ilman kipinöitäkin: sähköisku tai palo' }),
    flow({ steps: [{ icon: '🚫', text: 'älä koske' }, { icon: '📢', text: 'varoita muita' }, { icon: '🧑', text: 'kerro aikuiselle' }, { icon: '👷', text: 'korjaaja', sub: 'ammattilainen' }], label: 'Älä koske, varoita, kerro aikuiselle, ammattilainen korjaa' }),
  ] }),
  'CHEM79-SAFE-01': () => ({ beats: [
    flow({ steps: [{ icon: '📄', text: 'työohje' }, { icon: '🥽', text: 'suojalasit' }, { icon: '🏷️', text: 'tunniste tarkistettu' }], label: 'Ennen työtä: ohje, suojaimet ja näytteen tunniste' }),
    cards({ cards: [{ icon: '🧪', title: 'kanna vain', text: 'sen verran kuin hallitset', tone: 'plain' }, { icon: '📣', title: 'kaatui tai rikkoutui?', text: 'kerro heti opettajalle', tone: 'warm' }], label: 'Kanna vain sen verran kuin hallitset, ja kerro heti, jos jotain kaatuu' }),
  ] }),
  'CHEM79-CHEMICAL-USE-SAFE': () => ({ beats: [
    cards({ cards: [{ icon: '🧴', title: 'aine 1', text: 'oma ohje' }, { icon: '🧴', title: 'aine 2', text: 'oma ohje' }], label: 'Samannäköiset pakkaukset, eri ohjeet' }),
    flow({ steps: [{ icon: '🧴', text: 'klooripitoinen' }, { icon: '🍋', text: 'hapan' }, { icon: '☠️', text: 'kloorikaasua', mark: 'no' }], arrows: ['+', '='], label: 'Klooripitoinen ja hapan aine yhdessä: myrkyllistä kloorikaasua' }),
    cards({ cards: [{ icon: '📦', title: 'alkuperäinen pakkaus' }, { icon: '🌬️', title: 'ilmanvaihto' }, { icon: '🍞', title: 'erillään ruoasta' }], label: 'Ohjeen kohtia: alkuperäispakkaus, ilmanvaihto, erillään elintarvikkeista' }),
  ] }),
  'CHEM79-HAZARD-LABEL': () => ({ beats: [
    hazards({ kinds: ['flame', 'gas'], label: 'Liekki: syttyvä. Kaasupullo: paineen alainen kaasu.' }),
    hazards({ kinds: ['skull', 'corrosive', 'env'], label: 'Pääkallo: myrkyllinen. Syöpyvä käsi: syövyttävä. Kala ja puu: ympäristövaara.' }),
    SIGN_AND_GUIDE,
  ] }),
  'CHEM79-CHEMICAL-SAFE': () => ({ beats: [
    SIGN_AND_GUIDE,
    flow({ steps: [{ icon: '🔥', text: 'lämpö' }, { icon: '⬆️', text: 'paine kasvaa' }, { icon: '💥', text: 'pakkaus voi haljeta', mark: 'no' }], label: 'Lämpö kasvattaa painetta: siksi pois lämmöstä' }),
    KEEP,
  ] }),
  'CHEM79-FIRE-CONDITIONS': () => ({ beats: [
    fireTriangle({ label: 'Palokolmio: palava aine, happi ja korkea lämpötila' }),
    fireTriangle({ remove: 'heat', how: 'vesi jäähdyttää', label: 'Yksi ehto pois: vesi vie lämmön, ja palaminen loppuu' }),
  ] }),
  'CHEM79-FIRE-ACTION': () => ({ beats: [
    escape({ label: 'Kivipolulla savua: ryhmä kulkee savutonta Rantapolkua' }),
    cards({ cards: [{ icon: '🔥', title: 'liekkejä ei lähestytä', mark: 'no' }, { icon: '🎒', title: 'tavaroita ei haeta', mark: 'no' }, { icon: '💨', title: 'savu vie tajun', tone: 'warm' }], label: 'Liekkejä ei lähestytä, tavaroita ei haeta: savu on vaarallista' }),
    cards({ cards: [{ icon: '📞', title: '112', text: 'turvallisesta paikasta', mark: 'ok' }, { icon: '⏳', title: 'odota lupaa', text: 'pelastajilta', tone: 'plain' }], label: '112 turvallisesta paikasta, paluu vasta luvalla' }),
  ] }),
};
