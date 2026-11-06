// Lentopaja: a small playable place beside the topic map. Loikka moves where the child taps,
// Aava builds, Sulka measures. Three scenes and the workshop hub; missions open ordinary
// lessons (guided with Aava, or a direct quick check) and return here. World play (snacks,
// growth, the long hop, the flight) never touches lesson evidence or experiments.
import { NODES } from '../content';
import { PRIZES } from '../content/world';
import { store } from '../engine/store';
import {
  ensureGame, find, game, grant, install, MISSIONS, PENNANTS, ready, saveGame, settle, snack, walkSpeed,
  type GameState, type Mission, type SceneId, type WingId,
} from '../game';
import { craft, duck, frog, ICON, sulka, svg } from './art';
import { btn, h } from './dom';
import type { Mode } from './lesson';
import { motionScene, MOTION_CFG, type MotionPaint } from './motion';
import { hush, say } from './speech';

export interface PajaHooks {
  /** Open a lesson from a mission; it returns to this scene. */
  lesson(id: string, mode: Mode, mission: string, back: SceneId): void;
}

const W = 360, H = 210, GROUND = 168;
const SCENE_NAME: Record<SceneId, string> = { paja: 'Paja', ranta: 'Ranta', rata: 'Mittausrata', torni: 'Näköalapaikka' };
const SCENE_ICON: Record<SceneId, string> = { paja: '🛠️', ranta: '🏖️', rata: '📏', torni: '🔭' };
const PART_NAME: Record<string, string> = { runko: 'runko', siivet: 'siivet', potkuri: 'potkuri' };
/** Object form ("saimme rungon"). */
const PART_OBJ: Record<string, string> = { runko: 'rungon', siivet: 'siivet', potkuri: 'potkurin' };
const ITEM: Record<string, { icon: string; name: string }> = {
  vihko: { icon: '📓', name: 'koevihko' },
  mittanauha: { icon: '📏', name: 'mittanauha' },
  sekuntikello: { icon: '⏱️', name: 'sekuntikello' },
  simpukka: { icon: '🐚', name: 'simpukka' },
  'part:runko': { icon: '🛞', name: 'runko' },
  'part:siivet': { icon: '🪽', name: 'siivet' },
  'part:potkuri': { icon: '🌀', name: 'potkuri' },
};
const itemInfo = (k: string) => ITEM[k] ?? (k.startsWith('prize:') ? { icon: PRIZES[k.slice(6)]?.icon ?? '⭐', name: PRIZES[k.slice(6)]?.name ?? k } : { icon: '❔', name: k });
const ROUTE_TEXT = { guided: 'Aavan kanssa opetellen', direct: 'suoraan haasteella', tester: 'testaajan merkintä' } as const;

/** Mission texts: what Aava or Sulka asks, and what each route opens. */
const M_TEXT: Record<string, { who: 'Aava' | 'Sulka'; ask: string; guided: string; direct: string; done: string }> = {
  'm-runko': { who: 'Aava', ask: 'Romulaatikossa on rungon osia. Lasketaan, montako pyörää ja lautaa saadaan.', guided: 'Laske Aavan kanssa', direct: 'Suoraan: eväspussit (kertominen)', done: 'Runko on tehty. Se rullaa jo!' },
  'm-siivet': { who: 'Sulka', ask: 'Siipien pitää olla oikean pituiset. Mitataan ne mittanauhalla.', guided: 'Mittaa Sulkan kanssa', direct: 'Suoraan: reunan pituus', done: 'Siivet on mitattu ja leikattu.' },
  'm-potkuri': { who: 'Sulka', ask: 'Potkuri testataan radalla: kuinka monta sekuntia koeajo kestää?', guided: 'Ota aikaa Sulkan kanssa', direct: 'Suoraan: kumpi nopeampi? (ralli)', done: 'Potkuri on testattu radalla.' },
};

/** Aava's line depends on what is really saved. */
export function aavaLine(g: GameState): string {
  const has = (p: string) => !!g.inv[`part:${p}`];
  if (g.flights.some((f) => f.arrived)) return 'Me lensimme saarelle! Majakan vartija antoi raketin piirustuksen. Se on seuraava unelma, ei vielä tänään.';
  if (ready(g)) return 'Kaikki kolme osaa ovat paikallaan. Mennään näköalapaikalle ja lennetään saarelle!';
  for (const m of MISSIONS) {
    if (g.slots[m.slot]) continue;
    if (has(m.part)) return `${cap(PART_NAME[m.part]!)} ${m.part === 'siivet' ? 'ovat' : 'on'} repussa. Asennetaan ${m.part === 'siivet' ? 'ne' : 'se'} laitteeseen täällä pajassa!`;
    if (m.slot === 'chassis') return 'Minä olen Aava. Rakennetaan lentolaite ja lennetään tuolle saarelle! Ensin tarvitaan runko. Rannalla on romulaatikko.';
    if (m.slot === 'wings') return 'Runko on paikallaan, ja se rullaa jo! Seuraavaksi siivet. Sulka mittaa niitä mittausradalla.';
    return 'Siivet ovat paikallaan. Vielä potkuri! Se testataan mittausradalla.';
  }
  return 'Mitä kokeillaan seuraavaksi?';
}
const put = (el: Element, ...k: (Node | string | null | false | undefined)[]) => el.replaceChildren(...k.filter((x): x is Node | string => !!x));
const cap = (s: string) => s[0]!.toUpperCase() + s.slice(1);

// ---------------------------------------------------------------- scene art
function background(scene: SceneId, g: GameState) {
  const island = (x: number, y: number, k = 1) => `<ellipse cx="${x}" cy="${y}" rx="${34 * k}" ry="${8 * k}" fill="#d9c08a"/><path d="M${x - 10 * k} ${y - 4 * k} q${8 * k} -${26 * k} ${18 * k} -${4 * k}" fill="#4e9a5a"/><rect x="${x + 12 * k}" y="${y - 24 * k}" width="${5 * k}" height="${18 * k}" fill="#fff" stroke="#c44" stroke-width="${1.5 * k}"/>`;
  const sky = `<rect width="${W}" height="${H}" fill="#cfe9f7"/>`;
  const ground = (c: string) => `<rect y="${GROUND}" width="${W}" height="${H - GROUND}" fill="${c}"/>`;
  if (scene === 'paja') return `${sky}${ground('#c9a978')}
    <path d="M10 ${GROUND} V60 L180 18 L350 60 V${GROUND}" fill="#f3e3c4" stroke="#a87a48" stroke-width="3"/>
    <rect x="252" y="62" width="74" height="42" fill="#cfe9f7" stroke="#a87a48" stroke-width="3"/><rect x="252" y="92" width="74" height="12" fill="#7cc0e0"/>${island(300, 92, 0.45)}
    <rect x="30" y="58" width="70" height="46" fill="#fff8e6" stroke="#a87a48" stroke-width="2"/>
    <path d="M65 98 V70 l6 -10 l6 10 V98Z" fill="${g.flights.some((f) => f.arrived) ? '#e8674a' : 'none'}" stroke="#8a5a2c" stroke-width="1.5" stroke-dasharray="${g.flights.some((f) => f.arrived) ? '0' : '3 2'}"/>
    <text x="65" y="112" font-size="8" text-anchor="middle" fill="#6f4826">raketti?</text>
    <rect x="150" y="${GROUND - 22}" width="150" height="8" fill="#8a5a2c"/><rect x="156" y="${GROUND - 14}" width="6" height="14" fill="#8a5a2c"/><rect x="288" y="${GROUND - 14}" width="6" height="14" fill="#8a5a2c"/>
    <rect x="110" y="70" width="40" height="5" fill="#8a5a2c"/>${g.shelf.map((k, i) => `<text x="${114 + i * 12}" y="69" font-size="11">${itemInfo(k).icon}</text>`).join('')}`;
  if (scene === 'ranta') return `${sky}<rect y="110" width="${W}" height="${GROUND - 110}" fill="#7cc0e0"/>${island(300, 112, 0.6)}${ground('#e6d3a3')}
    ${[30, 44, 58].map((x) => `<path d="M${x} ${GROUND} q-3 -30 2 -44" stroke="#5a8f3c" stroke-width="3" fill="none"/>`).join('')}`;
  if (scene === 'rata') return `${sky}${ground('#a7c98a')}
    <rect x="20" y="${GROUND - 6}" width="320" height="12" fill="#bbb"/><line x1="20" y1="${GROUND}" x2="340" y2="${GROUND}" stroke="#fff" stroke-dasharray="8 6"/>
    ${Array.from({ length: 11 }, (_, i) => `<line x1="${20 + i * 32}" y1="${GROUND + 6}" x2="${20 + i * 32}" y2="${GROUND + (i % 5 ? 10 : 14)}" stroke="#555"/>`).join('')}
    <rect x="236" y="96" width="80" height="34" fill="#fff8e6" stroke="#a87a48" stroke-width="2"/><text x="276" y="117" font-size="10" text-anchor="middle" fill="#6f4826">Sulkan pöytä</text>`;
  return `${sky}<rect y="120" width="${W}" height="${H - 120}" fill="#7cc0e0"/>${island(300, 122, 0.9)}
    <path d="M0 ${GROUND} L0 120 Q60 96 130 112 L150 ${GROUND}Z" fill="#7fb069"/><path d="M90 108 L150 96" stroke="#8a5a2c" stroke-width="5"/>`;
}

interface Thing { id: string; x: number; y: number; label: string; art: string; act: () => void }

/** The workshop and its three scenes. */
export function paja(root: HTMLElement, scene: SceneId, hooks: PajaHooks) {
  hush();
  ensureGame();
  const granted = settle();
  let g = game();
  if (g.pos.scene !== scene) { saveGame((x) => { x.pos = { scene, x: 0.12 }; }); g = game(); }
  const tester = store.get().tester;
  const talkEl = h('div', { class: 'paja-talk', 'aria-live': 'polite' });
  const panel = h('div', { class: 'paja-panel stack' });
  const stage = h('div', { class: 'paja-stage' });
  let busy = false;
  let bugTimer = 0;

  const portrait = (who: 'Loikka' | 'Aava' | 'Sulka') => svg(44, 44, who === 'Loikka' ? frog(22, 24, 14) : who === 'Aava' ? duck(19, 24, 15) : sulka(18, 30, 12), who);
  const talk = (who: 'Loikka' | 'Aava' | 'Sulka', text: string, speak = true) => {
    talkEl.replaceChildren(h('div', { class: 'paja-portrait', html: portrait(who) }), h('div', {}, h('b', {}, who), h('p', {}, text)));
    if (speak) say(text);
  };

  // ------------------------------------------------ things in this scene
  const things = (): Thing[] => {
    const out: Thing[] = [];
    const m = (id: string) => MISSIONS.find((x) => x.id === id)!;
    if (scene === 'paja') {
      out.push({ id: 'craft', x: 0.62, y: GROUND - 22, label: 'Lentolaite', art: craft(225, GROUND - 40, 40, { chassis: !!g.slots.chassis, wings: g.slots.wings ? g.wing : undefined, engine: !!g.slots.engine, pennant: g.pennant }), act: () => craftPanel() });
      out.push({ id: 'plan', x: 0.18, y: 80, label: 'Seinätaulu', art: '', act: () => talk('Aava', g.flights.some((f) => f.arrived) ? 'Raketin piirustus saarelta! Se on iso unelma. Rakennetaan se joskus myöhemmin.' : 'Tähän tulee joskus raketin piirustus. Ensin lentolaite!') });
      out.push({ id: 'aava', x: 0.86, y: GROUND, label: 'Aava', art: '', act: () => talk('Aava', aavaLine(g)) });
    }
    if (scene === 'ranta') {
      const done = !!g.missions['m-runko'];
      out.push({ id: 'crate', x: 0.5, y: GROUND - 8, label: done ? 'Tyhjä romulaatikko' : 'Romulaatikko', art: `<rect x="164" y="${GROUND - 26}" width="40" height="26" fill="#b07a44" stroke="#6f4826" stroke-width="2"/>${done ? '' : '<circle cx="176" cy="' + (GROUND - 30) + '" r="7" fill="#333"/><rect x="184" y="' + (GROUND - 36) + '" width="16" height="6" fill="#c8874a"/>'}`, act: () => missionPanel(m('m-runko')) });
      if (!g.inv.simpukka) out.push({ id: 'shell', x: 0.75, y: GROUND + 14, label: 'Simpukka hiekassa', art: `<path d="M262 ${GROUND + 18} Q270 ${GROUND + 2} 278 ${GROUND + 18}Z" fill="#f2b58e" stroke="#c97c55"/>`, act: () => { saveGame((x) => { find(x, 'simpukka', store.now()); }); g = game(); talk('Loikka', 'Löysin simpukan! Se meni reppuun. Sen voi laittaa pajan hyllylle.'); draw(); } });
      out.push({ id: 'aava', x: 0.3, y: GROUND, label: 'Aava', art: '', act: () => talk('Aava', done ? 'Laatikko on tyhjä: runko on pajassa.' : M_TEXT['m-runko']!.ask) });
    }
    if (scene === 'rata') {
      out.push({ id: 'sulka', x: 0.86, y: GROUND - 10, label: 'Sulka', art: '', act: () => sulkaGreets() });
      out.push({ id: 'bench', x: 0.76, y: 112, label: 'Sulkan mittauspöytä', art: '', act: () => missionPanel(m('m-siivet')) });
      out.push({ id: 'track', x: 0.3, y: GROUND, label: 'Testirata', art: '', act: () => missionPanel(m('m-potkuri')) });
    }
    if (scene === 'torni') {
      out.push({ id: 'ramp', x: 0.33, y: 100, label: 'Lähtöramppi', art: g.slots.chassis ? craft(120, 96, 22, { chassis: true, wings: g.slots.wings ? g.wing : undefined, engine: !!g.slots.engine, pennant: g.pennant }) : '', act: () => launchPanel() });
      out.push({ id: 'aava', x: 0.12, y: GROUND - 50, label: 'Aava', art: '', act: () => talk('Aava', ready(g) ? 'Saari näkyy tuolla. Lähdetään!' : aavaLine(g)) });
    }
    return out;
  };

  // ------------------------------------------------ drawing
  const X = (x: number) => x * W;
  let loikkaX = g.pos.x;
  const draw = () => {
    g = game();
    const T = things();
    const aavaAt = T.find((t) => t.id === 'aava');
    const sulkaAt = T.find((t) => t.id === 'sulka');
    const scale = 1 + 0.12 * g.size;
    const inner = background(scene, g)
      + T.map((t) => t.art ? `<g class="thing" data-id="${t.id}">${t.art}</g>` : t.id === 'aava' || t.id === 'sulka' ? '' : `<rect class="hit" data-id="${t.id}" x="${X(t.x) - 30}" y="${t.y - 34}" width="60" height="44" rx="8"/>`).join('')
      + (aavaAt ? `<g class="actor" id="aava" data-id="aava" style="transform:translate(${X(aavaAt.x)}px,${aavaAt.y - 14}px)"><g class="pose idle">${duck(0, 0, 16)}${scene === 'paja' && !ready(g) ? '<rect x="-24" y="-4" width="14" height="10" fill="#fff" stroke="#999" transform="rotate(-12)"/>' : ''}</g></g>` : '')
      + (sulkaAt ? `<g class="actor" id="sulka" data-id="sulka" style="transform:translate(${X(sulkaAt.x)}px,${sulkaAt.y - 20}px)"><g class="pose idle">${sulka(0, 0, 16)}</g></g>` : '')
      + `<g class="bug" id="bug" style="display:none"><circle r="3.5" fill="#333"/><ellipse cx="-3" cy="-3" rx="4" ry="2.5" fill="#cfe" opacity=".8"/><ellipse cx="3" cy="-3" rx="4" ry="2.5" fill="#cfe" opacity=".8"/></g>`
      + `<line id="tongue" x1="0" y1="0" x2="0" y2="0" stroke="#e05a6a" stroke-width="3" stroke-linecap="round" style="display:none"/>`
      + `<g class="actor" id="loikka" style="transform:translate(${X(loikkaX)}px,${GROUND - 12}px)"><g class="grow" style="transform:scale(${scale})"><g class="pose idle">${frog(0, -8, 14)}</g></g><text class="bang" x="10" y="-36" font-size="16" font-weight="800" fill="#e8674a" style="display:none">!</text></g>`;
    stage.innerHTML = svg(W, H, inner, `${SCENE_NAME[scene]}: Loikka ${T.map((t) => t.label).join(', ')}`);
    const el = stage.querySelector('svg')!;
    el.classList.add('paja-svg');
    el.addEventListener('click', (e) => {
      const tgt = (e.target as Element).closest('[data-id]');
      if (tgt) { const t = T.find((x) => x.id === tgt.getAttribute('data-id')); if (t) { void goAndDo(t); return; } }
      if ((e.target as Element).closest('#bug')) { void catchBug(); return; }
      const p = el.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
      const q = p.matrixTransform(el.getScreenCTM()!.inverse());
      if (!busy) void walk(Math.min(0.95, Math.max(0.05, q.x / W)));
    });
    actions.replaceChildren(...T.map((t) => h('button', { type: 'button', class: 'token', onclick: () => goAndDo(t) }, t.label)));
    renderBag();
    scheduleBug();
  };

  const loikka = () => stage.querySelector<SVGGElement>('#loikka');
  const pose = (who: string, p: string, ms = 0) => {
    const el = stage.querySelector(`#${who} .pose`);
    if (!el) return;
    el.setAttribute('class', `pose ${p}`);
    if (ms) setTimeout(() => el.setAttribute('class', 'pose idle'), ms);
  };
  /** Move Loikka; the time comes from the world walking speed (snacks may raise it). */
  const walk = (to: number) => new Promise<void>((res) => {
    const el = loikka(); if (!el) return res();
    const dur = Math.abs(to - loikkaX) / walkSpeed(g);
    el.style.transition = `transform ${dur.toFixed(2)}s linear`;
    el.style.transform = `translate(${X(to)}px,${GROUND - 12}px)`;
    pose('loikka', 'move');
    loikkaX = to;
    setTimeout(() => { pose('loikka', 'idle'); saveGame((x) => { x.pos = { scene, x: to }; }); res(); }, dur * 1000 + 30);
  });
  const goAndDo = async (t: Thing) => {
    if (busy) return; busy = true;
    try {
      const target = Math.min(0.92, Math.max(0.06, t.x - 0.08));
      await walk(target);
      pose('loikka', 'notice', 700);
      const bang = stage.querySelector<SVGTextElement>('#loikka .bang'); if (bang) { bang.style.display = ''; setTimeout(() => { bang.style.display = 'none'; }, 700); }
      t.act();
    } finally { busy = false; }
  };

  // ------------------------------------------------ snacks: catch a bug with the tongue
  const scheduleBug = () => {
    clearTimeout(bugTimer);
    if (scene === 'rata') return; // the test track stays calm: nothing flies over the course
    bugTimer = window.setTimeout(() => {
      const b = stage.querySelector<SVGGElement>('#bug'); if (!b) return;
      const bx = 0.15 + Math.random() * 0.7, by = 70 + Math.random() * 40;
      b.style.display = ''; b.style.transform = `translate(${X(bx)}px,${by}px)`; b.dataset.x = String(bx); b.dataset.y = String(by);
      b.setAttribute('role', 'button'); b.setAttribute('aria-label', 'Hyönteinen');
    }, 2500);
  };
  const catchBug = async () => {
    const b = stage.querySelector<SVGGElement>('#bug'); if (!b || b.style.display === 'none' || busy) return;
    busy = true;
    const bx = Number(b.dataset.x), by = Number(b.dataset.y);
    await walk(Math.min(0.92, Math.max(0.06, bx - 0.06)));
    const tg = stage.querySelector<SVGLineElement>('#tongue')!;
    const fx = X(loikkaX) + 8, fy = GROUND - 26;
    tg.setAttribute('x1', String(fx)); tg.setAttribute('y1', String(fy)); tg.setAttribute('x2', String(X(bx))); tg.setAttribute('y2', String(by));
    tg.style.display = ''; tg.classList.add('lick');
    setTimeout(() => {
      tg.style.display = 'none'; tg.classList.remove('lick'); b.style.display = 'none';
      const before = g.size;
      saveGame((x) => snack(x)); g = game();
      const grow = stage.querySelector<SVGGElement>('#loikka .grow'); if (grow) grow.style.transform = `scale(${1 + 0.12 * g.size})`;
      pose('loikka', 'celebrate', 1000);
      talk('Loikka', g.size > before ? 'Nam! Minä kasvoin vähän. Nyt jaksan pidemmän loikan, jos haluat.' : 'Nam! Hyvä välipala.', false);
      renderBag();
      busy = false;
      scheduleBug();
    }, 320);
  };

  // ------------------------------------------------ panels
  const sulkaGreets = () => {
    const fresh = !g.inv.mittanauha;
    saveGame((x) => { find(x, 'mittanauha', store.now()); find(x, 'sekuntikello', store.now()); }); g = game();
    talk('Sulka', fresh ? 'Hei, minä olen Sulka, tutkija. Ota mittanauha ja sekuntikello. Niillä mitataan siipiä ja koeajoja.' : 'Mittaanko jotain? Mittanauha ja sekuntikello ovat repussasi.');
    renderBag();
  };

  const missionPanel = (m: Mission) => {
    const t = M_TEXT[m.id]!, done = g.missions[m.id];
    if (m.id !== 'm-runko' && !g.inv.mittanauha) sulkaGreets();
    talk(t.who, done ? `${t.done} Voit silti tehdä tehtävän uudelleen.` : t.ask);
    put(panel, h('h2', {}, `${t.who}: ${cap(PART_NAME[m.part]!)}`),
      done ? h('p', { class: 'small' }, `✔ Tehty ${ROUTE_TEXT[done.route]}. Uusi kierros ei anna toista osaa.`) : null,
      btn(ICON.next, t.guided, () => hooks.lesson(m.guided, 'learn', m.id, scene), 'primary big wide'),
      h('p', { class: 'small muted' }, `Oppitunti: ${NODES[m.guided]!.stop}. Opetellaan esimerkin ja avun kanssa.`),
      btn(ICON.bolt, t.direct, () => hooks.lesson(m.direct, 'quick', m.id, scene), 'big wide'),
      h('p', { class: 'small muted' }, `Pikatarkistus: ${NODES[m.direct]!.stop}. Jos osaat jo, saat saman osan ilman alkeita.`),
      m.id === 'm-potkuri' && g.slots.chassis ? btn(ICON.next, 'Vapaa koeajo radalla', () => testRun(), 'big wide') : null,
      tester && !done ? btn('', '🧪 Testaaja: merkitse tehdyksi', () => { saveGame((x) => { grant(x, m.id, 'tester', store.now()); }); celebrate([m]); }, 'small') : null);
  };

  const testRun = () => {
    const paint = motionScene({ track: { kind: 'straight', L: 20 }, lanes: [{ thing: 'car', legs: [{ dur: Infinity, v: 0 }] }], end: 22, views: ['track', 'ruler', 'watch'], control: { speeds: [1, 2, 4, 5] }, watchStops: true, scn: 'vapaa koeajo' }) as MotionPaint;
    const host = h('div');
    const cleanup = paint(host);
    talk('Sulka', 'Valitse nopeus ja käynnistä. Sekuntikello pysähtyy maalissa. Tämä on vapaata kokeilua, ei koe.');
    put(panel, h('h2', {}, 'Vapaa koeajo'), host,
      btn(ICON.check, 'Kirjaa koevihkoon', () => {
        const last = paint[MOTION_CFG]!.log?.filter((l) => l.includes('v=')).at(-1);
        const v = last ? Number(last.split('v=')[1]) : 0;
        if (!v) return talk('Sulka', 'Valitse ensin nopeus ja aja.');
        saveGame((x) => { x.runs.push({ at: store.now(), v, L: 20, secs: 20 / v }); });
        talk('Sulka', `Kirjattu: ${v} m/s, rata 20 m.`);
      }, 'big wide'),
      btn('', 'Sulje', () => { if (typeof cleanup === 'function') cleanup(); put(panel); }, 'small'));
  };

  const craftPanel = () => {
    talk('Aava', aavaLine(g));
    const slotRow = (m: Mission) => {
      const owned = !!g.inv[`part:${m.part}`], placed = !!g.slots[m.slot];
      return h('div', { class: 'row' }, h('span', {}, `${itemInfo(`part:${m.part}`).icon} ${cap(PART_NAME[m.part]!)}: `),
        placed ? h('b', {}, 'paikallaan') : owned ? btn('', 'Asenna', () => doInstall(m), 'small primary') : h('span', { class: 'muted small' }, `puuttuu (${SCENE_NAME[m.scene]})`));
    };
    put(panel, h('h2', {}, 'Lentolaite'), ...MISSIONS.map(slotRow),
      g.slots.wings ? h('div', { class: 'row' }, h('span', {}, 'Siipien muoto: '), ...(['leveat', 'kapeat'] as WingId[]).map((w) => h('button', { type: 'button', class: `token${g.wing === w ? ' sel' : ''}`, onclick: () => { saveGame((x) => { x.wing = w; }); draw(); craftPanel(); } }, w === 'leveat' ? 'leveät (korkea reitti)' : 'kapeat (matala reitti)'))) : null,
      g.slots.chassis ? h('div', { class: 'row' }, h('span', {}, 'Viiri: '), ...PENNANTS.map((c) => h('button', { type: 'button', class: `swatch${g.pennant === c ? ' sel' : ''}`, style: `background:${c}`, 'aria-label': 'Viirin väri', onclick: () => { saveGame((x) => { x.pennant = c; }); draw(); craftPanel(); } }))) : null,
      g.slots.chassis ? btn(ICON.next, 'Aja runkoa pajassa', () => rollCraft(), 'big wide') : null);
  };
  const doInstall = (m: Mission) => {
    saveGame((x) => { install(x, m); }); g = game();
    pose('aava', 'carry', 900);
    draw(); pose('aava', 'celebrate', 900);
    talk('Aava', m.slot === 'chassis' ? 'Runko on paikallaan! Katso, se rullaa jo.' : m.slot === 'wings' ? 'Siivet ovat paikallaan! Voit valita, ovatko ne leveät vai kapeat.' : 'Potkuri on paikallaan! Nyt laite on valmis.');
    craftPanel();
  };
  /** The chassis already does something: it rolls across the workshop and back. */
  const rollCraft = () => {
    const c = stage.querySelector<SVGGElement>('[data-id="craft"]'); if (!c) return;
    c.style.transition = 'transform 1.2s ease-in-out'; c.style.transform = 'translateX(-120px)';
    setTimeout(() => { c.style.transform = 'translateX(0)'; }, 1300);
    talk('Loikka', 'Wiii! Runko rullaa!', false);
  };

  const launchPanel = () => {
    if (!ready(g)) {
      const miss = MISSIONS.filter((m) => !g.slots[m.slot]).map((m) => PART_NAME[m.part]).join(', ');
      talk('Aava', `Lentolaitteesta puuttuu vielä: ${miss}. Osat tehdään rannalla ja mittausradalla, ja ne asennetaan pajassa.`);
      put(panel);
      return;
    }
    talk('Aava', `Siivet ovat ${g.wing === 'leveat' ? 'leveät, joten lennämme korkealla Lokkikallion yli' : 'kapeat, joten lennämme matalalla Kivikaaren läpi'}. Pidä Ylös-nappia pohjassa, niin laite nousee.`);
    put(panel, btn(ICON.next, 'Lähde lentoon', () => { location.hash = '#paja/lento'; }, 'primary big wide'));
  };

  const celebrate = (ms: Mission[]) => {
    g = game();
    const names = ms.map((m) => PART_OBJ[m.part]).join(' ja ');
    draw();
    pose('aava', 'carry', 1200);
    talk('Aava', `Saimme ${names}! Kannoin ${ms.length > 1 ? 'ne' : 'sen'} pajaan. Asenna ${ms.length > 1 ? 'ne' : 'se'} lentolaitteeseen.`);
    put(panel, btn(ICON.next, 'Pajaan asentamaan', () => { location.hash = '#paja'; }, 'primary big wide'));
  };

  // ------------------------------------------------ backpack
  const bag = h('div', { class: 'backpack paja-bag', 'aria-label': 'Reppu' });
  const notebook = () => {
    const ms = MISSIONS.filter((m) => g.missions[m.id]);
    put(panel, h('h2', {}, '📓 Koevihko'),
      h('p', { class: 'small' }, ms.length ? ms.map((m) => `${cap(PART_NAME[m.part]!)}: ${ROUTE_TEXT[g.missions[m.id]!.route]}`).join(' · ') : 'Vielä ei tehtyjä osia.'),
      h('p', { class: 'small' }, g.runs.length ? `Koeajot: ${g.runs.slice(-5).map((r) => `${r.v} m/s → ${r.L} m ${Math.round(r.secs * 10) / 10} s`.replace('.', ',')).join('; ')}` : 'Ei kirjattuja koeajoja.'),
      h('p', { class: 'small' }, g.flights.length ? `Lennot: ${g.flights.slice(-5).map((f) => `${f.route}, renkaita ${f.rings}/3${f.arrived ? ', perillä' : ''}`).join('; ')}` : 'Ei lentoja vielä.'),
      h('p', { class: 'small muted' }, `Välipaloja ${g.snacks}. Koko ${g.size}/2. Nämä ovat leikkiä: ne eivät muuta tehtäviä eikä koeajoja.`));
  };
  const renderBag = () => {
    g = game();
    const use: Record<string, [string, () => void] | undefined> = {
      vihko: ['Avaa', notebook],
      mittanauha: ['Käytä', () => { if (scene === 'rata') missionPanel(MISSIONS[1]!); else location.hash = '#paja/rata'; }],
      sekuntikello: ['Koeajo', () => { if (!g.slots.chassis) talk('Sulka', 'Koeajoon tarvitaan runko. Se tehdään rannalla.'); else if (scene === 'rata') testRun(); else location.hash = '#paja/rata'; }],
      simpukka: g.shelf.includes('simpukka') ? undefined : ['Hyllylle', () => { if (scene !== 'paja') return talk('Loikka', 'Hylly on pajassa.', false); saveGame((x) => { x.shelf.push('simpukka'); }); draw(); }],
    };
    for (const m of MISSIONS) if (g.inv[`part:${m.part}`] && !g.slots[m.slot]) use[`part:${m.part}`] = ['Asenna', () => { if (scene === 'paja') doInstall(m); else location.hash = '#paja'; }];
    const keys = Object.keys(g.inv).filter((k) => !(k.startsWith('part:') && Object.values(g.slots).includes(k.slice(5))));
    put(bag, h('b', { class: 'small' }, `🎒 Reppu`),
      ...keys.map((k) => {
        const it = itemInfo(k), u = use[k], p = g.inv[k]!;
        const title = `${it.name}${p.from === 'legacy' ? ' (aiemmasta repusta)' : ''}`;
        return u ? h('button', { type: 'button', class: 'find got usable', title, 'aria-label': `${it.name}: ${u[0]}`, onclick: u[1] }, `${it.icon} ${u[0]}`)
          : h('span', { class: 'find got', title, 'aria-label': title }, it.icon);
      }),
      g.size > 0 ? h('button', { type: 'button', class: `find got usable${g.hop === 'long' ? ' sel' : ''}`, 'aria-pressed': String(g.hop === 'long'), onclick: () => { saveGame((x) => { x.hop = x.hop === 'long' ? 'normal' : 'long'; }); g = game(); renderBag(); } }, g.hop === 'long' ? '🐸 Pitkä loikka' : '🐸 Tavallinen loikka') : null);
  };

  // ------------------------------------------------ layout
  const nav = h('nav', { class: 'paja-nav', 'aria-label': 'Paikat' }, ...(['paja', 'ranta', 'rata', 'torni'] as SceneId[]).map((s) =>
    h('a', { href: s === 'paja' ? '#paja' : `#paja/${s}`, class: `token${s === scene ? ' sel' : ''}`, 'aria-current': s === scene ? 'page' : undefined }, `${SCENE_ICON[s]} ${SCENE_NAME[s]}`)));
  const actions = h('div', { class: 'tray paja-actions', 'aria-label': 'Tekemistä täällä' });
  const intro = !g.intro ? introCard(() => { saveGame((x) => { x.intro = true; }); introEl.remove(); talk('Aava', aavaLine(game())); }) : null;
  const introEl = intro ?? h('span');
  root.replaceChildren(h('div', { class: 'stack paja' },
    h('div', { class: 'top' }, h('div', { class: 'title' }, `${SCENE_ICON[scene]} Lentopaja · ${SCENE_NAME[scene]}`),
      h('a', { href: '#', class: 'small muted', onclick: (e: Event) => { e.preventDefault(); location.hash = ''; } }, 'Kartta'),
      h('a', { href: '#aikuiselle', class: 'small muted' }, 'Aikuiselle')),
    tester ? h('p', { class: 'small warn', role: 'status' }, '🧪 Testaajatila: tämä peli on erillinen ja poistuu, kun testidata nollataan.') : null,
    introEl, nav, stage, h('p', { class: 'small muted' }, 'Napauta maata, niin Loikka hyppää sinne. Napauta esinettä tai hahmoa, niin Loikka menee sen luo.'),
    actions, talkEl, panel, bag));
  draw();
  if (granted.length) celebrate(granted);
  else if (g.intro) talk(scene === 'rata' ? 'Sulka' : 'Aava', scene === 'rata' ? 'Täällä mitataan siivet ja testataan potkuri radalla.' : aavaLine(g), false);
  const onHash = () => { clearTimeout(bugTimer); window.removeEventListener('hashchange', onHash); };
  window.addEventListener('hashchange', onHash);
}

/** Opening: who is who, what we build, where we go. Short, skippable, replayable later. */
function introCard(done: () => void) {
  const steps: [string, string, string][] = [
    ['Loikka', svg(120, 70, frog(60, 38, 22)), 'Hei! Minä olen Loikka-sammakko. Minä hyppään sinne, minne napautat.'],
    ['Aava', svg(120, 70, `${duck(48, 38, 22)}<rect x="74" y="26" width="30" height="22" fill="#fff" stroke="#999" transform="rotate(8 89 37)"/><path d="M80 40 h18 M80 34 h12" stroke="#2f6fb3"/>`), 'Minä olen Aava, ankanpoikanen. Minulla on lentolaitteen piirustus, mutta siitä puuttuu vielä kolme osaa.'],
    ['Aava', svg(120, 70, `<rect width="120" height="70" fill="#cfe9f7"/><rect y="44" width="120" height="26" fill="#7cc0e0"/><ellipse cx="88" cy="46" rx="22" ry="5" fill="#d9c08a"/><rect x="95" y="28" width="4" height="14" fill="#fff" stroke="#c44"/>${duck(22, 50, 12)}`), 'Näetkö tuon saaren? Rakennetaan lentolaite ja käydään siellä!'],
  ];
  let k = 0;
  const box = h('div', { class: 'card paja-intro' });
  const show = () => {
    const [who, art, text] = steps[k]!;
    box.replaceChildren(h('div', { html: art, style: 'width:140px' }), h('div', { class: 'stack', style: 'gap:6px' }, h('b', {}, who), h('p', {}, text),
      h('div', { class: 'row' }, btn(ICON.next, k < steps.length - 1 ? 'Seuraava' : 'Aloitetaan', () => { if (++k < steps.length) show(); else done(); }, 'primary'),
        k < steps.length - 1 ? btn('', 'Ohita', done, 'small') : null)));
    say(text);
  };
  show();
  return box;
}
