import './ui/style.css';
import { GRAPH_SHA, KCS, kc, MANIFEST, ORDER, isUnlocked, requiredOf } from './engine/graph';
import { BACKUP_KEY, exportData, store, type World } from './engine/store';
import { SOL_SHA, SOL_STATUS_TEXT, solCard } from './content/sol';
import { CONTENT_REV, NODES } from './content';
import { chaptersFor, nextNode, PRIZES, worldInfo, WORLDS } from './content/world';
import { ICON, svg } from './ui/art';
import { btn, h } from './ui/dom';
import { hasFinnish, hush, onVoices, quiet, say } from './ui/speech';
import { avatarArt, CHAPTER_COLOR, modeFor, worldIds, worldMap } from './ui/worldmap';
import { adultGraph } from './ui/adultgraph';
import { worldOverview } from './ui/worldlinks';
import { lesson, type Mode } from './ui/lesson';
import { paja } from './ui/paja';
import { flight } from './ui/flight';
import type { SceneId } from './game';

const app = document.getElementById('app')!;

function route() {
  hush();
  document.querySelector('.sheet-back')?.remove();
  if (location.hash === '#aikuiselle') return adult();
  if (location.hash === '#alueet') return chooseWorld();
  if (location.hash.startsWith('#paja')) {
    const sc = location.hash.slice(6);
    if (sc === 'lento') return flight(app);
    return paja(app, (['ranta', 'rata', 'torni'] as const).find((x) => x === sc) ?? 'paja', { lesson: openMission });
  }
  const w = store.get().world;
  if (!w) return chooseWorld();
  map(w);
}
window.addEventListener('hashchange', route);

/** Switch area (keeping everything) and optionally scroll the map to one chapter. */
function goTo(w: World, chapter?: string) {
  store.update((s) => { s.world = w; });
  if (location.hash) location.hash = ''; else route();
  window.scrollTo(0, 0);
  if (chapter) requestAnimationFrame(() => document.getElementById(`alue-${chapter}`)?.scrollIntoView({ block: 'start' }));
}

function open(id: string, mode: Mode, from?: string, fast = false) {
  toldNow = null;
  window.scrollTo(0, 0);
  const w = store.get().world ?? 'ranta';
  lesson(app, id, mode, {
    home: route,
    next: () => {
      const n = nextNode(w);
      if (!n) return route();
      open(n.node, n.retrieval ? 'retrieval' : modeFor(w, n.node));
    },
    // A support detour returns to the original topic in its normal mode.
    open: (to, m, f) => open(to, m === 'learn' ? modeFor(w, to) : m, f),
    fast,
  }, from);
}

/** A lesson opened from a Lentopaja mission: answers carry the mission id, and every way out
 *  returns to the scene it came from. The lesson itself is the ordinary one. */
function openMission(id: string, mode: Mode, mission: string, back: SceneId, from?: string) {
  window.scrollTo(0, 0);
  const ret = () => { const to = back === 'paja' ? '#paja' : `#paja/${back}`; if (location.hash === to) route(); else location.hash = to; };
  lesson(app, id, mode, { home: ret, next: ret, open: (to, m, f) => openMission(to, m === 'learn' ? 'learn' : m, mission, back, f), mission, homeLabel: back === 'paja' ? 'Takaisin pajaan' : 'Takaisin tehtävän luo' }, from);
}

/** Truthful notices: nothing can be saved here, the save had to be repaired or could not be read,
 *  or tester mode is on. `detail` adds the adult's explanation. */
function storageNotice(detail = false) {
  const warn = (t: string) => h('p', { class: 'small warn', role: 'status' }, t);
  const note = store.note();
  const out: HTMLElement[] = [];
  if (store.storage() === 'memory' || note === 'readonly')
    out.push(warn('⚠️ Tämä selain ei salli tallentamista. Edistyminen katoaa, kun sivu suljetaan. Aikuinen voi viedä tiedot talteen Aikuiselle-sivulla.'));
  if (note === 'repaired')
    out.push(warn(`⚠️ Tallennuksessa oli rikkinäisiä kohtia. Ehjät vastaukset säilyivät, rikkinäiset jätettiin pois.${detail ? ` Alkuperäinen tallenne on tallessa tällä laitteella (avain ${BACKUP_KEY}).` : ' Lisätietoa Aikuiselle-sivulla.'}`));
  if (note === 'unreadable')
    out.push(warn(`⚠️ Aiempaa tallennusta ei voitu lukea, joten aloitettiin tyhjästä.${detail ? ` Alkuperäinen on tallessa tällä laitteella (avain ${BACKUP_KEY}); sitä ei poisteta.` : ' Lisätietoa Aikuiselle-sivulla.'}`));
  if (store.get().tester)
    out.push(warn('🧪 Testaajatila on päällä. Vastaukset merkitään testidataksi. Ota tila pois Aikuiselle-sivulla ennen lapsen pelaamista.'));
  return out.length ? h('div', { class: 'stack notices', style: 'gap:6px' }, ...out) : null;
}

// ---------------------------------------------------------------- world choice
function chooseWorld() {
  const pick = (w: World) => { store.update((s) => { s.world = w; }); if (location.hash) location.hash = ''; else route(); };
  app.replaceChildren(h('div', { class: 'stack' },
    h('h1', {}, 'Sammakko'),
    h('p', { class: 'muted' }, 'Valitse alue. Aluetta voi vaihtaa milloin vain, eikä mikään katoa.'),
    storageNotice(),
    h('div', { class: 'worlds' }, ...WORLDS.map((W) =>
      h('button', { class: `world ${W.id}`, onclick: () => pick(W.id) },
        h('div', { html: svg(96, 80, `<g transform="translate(-2 2) scale(1.45)">${avatarArt(W.id)}</g>`) }),
        h('div', {}, h('h2', {}, W.name), h('p', { class: 'muted small' }, `${W.grade}. ${W.blurb}`), h('p', { class: 'small' }, W.quest),
          h('p', { class: 'small muted' }, `${worldIds(W.id).filter(store.lit).length}/${worldIds(W.id).length} paikkaa loistaa`))))),
    h('a', { href: '#paja', class: 'card paja-card' }, h('b', {}, '🛠️ Lentopaja'), h('span', { class: 'small muted' }, ' Rakenna lentolaite Loikan ja Aavan kanssa ja lennä saarelle. Kartta ja oppitunnit pysyvät käytössä.')),
    h('h2', {}, '🗺️ Koko maailma'),
    h('p', { class: 'small muted' }, 'Kolme aluetta rinnakkain. Merireitit näyttävät, minkä luvun taitoja tarvitaan toisella alueella. Paksumpi reitti = enemmän yhteyksiä.'),
    worldOverview(CHAPTER_COLOR, goTo),
    !hasFinnish() ? h('p', { class: 'small muted' }, 'Huom: tästä selaimesta ei löytynyt suomenkielistä puheääntä. Ohjeet näkyvät tekstinä.') : null));
}

// ---------------------------------------------------------------- map
function map(w: World) {
  const n = nextNode(w);
  const chapters = chaptersFor(w);
  const total = worldIds(w);
  const lit = total.filter(store.lit).length;
  const inferredN = total.filter((id) => !store.lit(id) && store.inferred(id)).length;
  const known = total.filter(store.known).length;
  const q = quiet();
  const go = n
    ? btn(ICON.next, n.retrieval ? 'Muistatko vielä?' : 'Jatka seikkailua', () => open(n.node, n.retrieval ? 'retrieval' : modeFor(w, n.node)), 'primary big wide')
    : h('p', { class: 'card' }, 'Kaikki paikat on käyty! Palaa huomenna kertaamaan.');
  // Fast route: one tap from the map to the first task of the next place (two from the world choice).
  const fastMode = n && !n.retrieval ? modeFor(w, n.node) : undefined;
  const fastBtn = n && (fastMode === 'learn' || fastMode === 'leap' || fastMode === 'quick')
    ? btn(ICON.bolt, 'Suoraan tehtävään', () => open(n.node, fastMode, undefined, true), 'big wide fast-btn')
    : null;
  const m = worldMap(w, n?.node, { open, refresh: route, go: goTo });
  const unheard = !taleSeen(w);
  const firstVisit = unheard || toldNow === w;
  app.replaceChildren(h('div', { class: 'stack' },
    h('div', { class: 'top' },
      h('div', { html: svg(56, 50, `<g transform="translate(-2 -4)">${avatarArt(w)}</g>`), style: 'width:56px' }),
      h('div', { class: 'title' }, worldInfo(w).name, h('div', { class: 'small muted', style: 'font-weight:600' }, `✨ ${lit}/${total.length}${inferredN ? ` · ☆ ${inferredN}` : ''}`)),
      !hasFinnish() ? null : h('button', {
        class: `icon-btn quiet-btn${q ? ' on' : ''}`, 'aria-pressed': String(q), html: q ? ICON.mute : ICON.speaker,
        'aria-label': q ? 'Hiljainen tila päällä' : 'En voi nyt kuunnella',
        title: q ? (store.quiet() ? 'Hiljainen tila: kuuntelutehtävät näytetään tekstinä' : 'Tästä selaimesta puuttuu suomenkielinen puheääni') : 'En voi nyt kuunnella',
        onclick: () => { hush(); store.update((x) => { x.quietUntil = store.quiet() ? 0 : Date.now() + 3 * 3600e3; }); route(); },
      }),
      h('a', { href: '#paja', class: 'small paja-link', 'aria-label': 'Lentopaja: rakenna lentolaite Aavan kanssa' }, '🛠️ Lentopaja'),
      h('a', { href: '#alueet', class: 'small muted', 'aria-label': 'Vaihda aluetta' }, 'Alueet'),
      h('a', { href: '#aikuiselle', class: 'small muted' }, 'Aikuiselle')),
    storageNotice(),
    h('div', { class: 'progress-strip', role: 'img', 'aria-label': `${lit} / ${total.length} paikkaa loistaa` },
      h('i', { class: 'lit', style: `width:${(100 * lit) / total.length}%` }),
      h('i', { class: 'inf', style: `width:${(100 * inferredN) / total.length}%` })),
    q ? h('p', { class: 'small hint' }, store.quiet() ? '🔇 Hiljainen tila: ohjeita ei lueta ääneen, eikä kuuntelutehtäviä ehdoteta. Ne näkyvät tekstinä.' : '🔇 Tästä selaimesta puuttuu suomenkielinen puheääni, joten ohjeet näkyvät tekstinä ja kuuntelutehtävät ohitetaan.') : null,
    storyCard(w, total.length - known, firstVisit),
    backpack(chapters),
    h('div', { class: 'legend', 'aria-label': 'Siirry kartalla' }, ...chapters.map((c) => {
      const k = c.nodes.filter(store.lit).length;
      const here = !!n && c.nodes.includes(n.node);
      return h('button', {
        type: 'button', class: `${here ? 'here' : ''}${k === c.nodes.length ? ' done' : ''}`, style: `--ch:${CHAPTER_COLOR[c.id]}`,
        'aria-label': `${c.name}, ${k}/${c.nodes.length} paikkaa. Siirry kartalla.`,
        onclick: () => { document.getElementById(`alue-${c.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); say(`${c.name}. ${c.story}`); },
      }, h('i'), `${c.name} ${k}/${c.nodes.length}`);
    })),
    m,
    h('p', { class: 'small muted' }, `Paina luvun nimeä, niin kartta vierii sinne. Tiet näyttävät taitojen järjestyksen: ensin tien yläpää, sitten alapää.${worldInfo(w).islands ? ' Lautta vie saarelta toiselle.' : ''} Tähti ⭐ = osasit itse, 🤝 = harjoittelit avun kanssa, ☆ = päätelty myöhemmästä paikasta, ! = viime aikoina vaikeaa, 🕒 = jätetty myöhemmäksi. Tuntemattomat paikat ovat pilven alla. Lukittuun paikkaan voi hypätä, jos uskaltaa.`),
    h('div', { class: 'go-bar' }, go, fastBtn)));
  const target = m.querySelector('.place.next');
  if (!firstVisit && target && target.getBoundingClientRect().top > window.innerHeight * 0.6) target.scrollIntoView({ block: 'center' });
  // Read the tale once, when a voice is there; keep it on screen until a lesson opens.
  if (unheard && hasFinnish()) { markTale(w); toldNow = w; say(worldInfo(w).tale); }
  else if (!firstVisit && n) say(n.retrieval ? 'Muistatko vielä? Paina vihreää nappia.' : 'Paina vihreää nappia ja jatketaan.');
}

/** Finds from finished chapters stay on the map: a persistent trace of the journey. */
function backpack(chapters: ReturnType<typeof chaptersFor>) {
  const got = chapters.filter((c) => c.nodes.every(store.known));
  return h('div', { class: 'backpack', 'aria-label': `Reppu: ${got.length}/${chapters.length} löytöä` },
    h('b', { class: 'small' }, `🎒 Reppu ${got.length}/${chapters.length}`),
    ...chapters.map((c) => {
      const p = PRIZES[c.id] ?? { icon: '⭐', name: c.name };
      const has = got.includes(c);
      return h('span', { class: `find${has ? ' got' : ''}`, title: has ? `${p.name} (${c.name})` : `${c.name}: löytö odottaa`, 'aria-label': has ? p.name : `${c.name}: löytö odottaa` }, has ? p.icon : '?');
    }));
}

/** The frame story: in full on the first visit, afterwards the goal and how much fog is left. */
function storyCard(w: World, foggy: number, full: boolean) {
  const W = worldInfo(w);
  const fog = foggy === 0 ? W.finale : `☁️ Sumussa vielä ${foggy} ${foggy === 1 ? 'paikka' : 'paikkaa'}.`;
  const body = h('div', { class: 'stack', style: 'gap:6px' },
    full ? h('p', {}, W.tale) : null,
    h('p', { class: 'quest' }, `🎯 ${W.quest}`),
    h('p', { class: 'small muted' }, fog),
    full ? null : h('button', { type: 'button', class: 'linklike small', onclick: () => say(W.tale, true) }, 'Kuuntele tarina'));
  return h('div', { class: 'card story-card' }, h('div', { html: svg(56, 50, `<g transform="translate(-2 -4)">${avatarArt(w)}</g>`), style: 'width:56px;flex:none' }), body);
}
const TALE_KEY = 'sammakko-lite-tale';
/** The world whose tale is shown in full during this visit (until a lesson opens). */
let toldNow: World | null = null;
function taleSeen(w: World) { try { return (JSON.parse(localStorage.getItem(TALE_KEY) ?? '[]') as string[]).includes(w); } catch { return false; } }
function markTale(w: World) { try { const s = new Set(JSON.parse(localStorage.getItem(TALE_KEY) ?? '[]') as string[]); s.add(w); localStorage.setItem(TALE_KEY, JSON.stringify([...s])); } catch { /* storage unavailable */ } }

// ---------------------------------------------------------------- adult view
const fmt = (t?: number) => (t ? new Date(t).toLocaleString('fi-FI', { dateStyle: 'short', timeStyle: 'short' }) : '');

/** The adult's status words. Never a probability; unknown is not weak. */
function statusOf(id: string): { key: string; text: string } {
  const st = store.state(id);
  if (st.checked) return { key: st.retained !== undefined ? 'retained' : 'checked', text: st.retained !== undefined ? 'tarkistettu + muistettu tauon jälkeen' : st.quick ? 'tarkistettu (pika)' : 'tarkistettu' };
  if (st.helped) return { key: 'helped', text: 'harjoiteltu avun kanssa' };
  const src = store.inferredFrom(id);
  if (src.length) return { key: 'inferred', text: `päätelty: ${src.slice(0, 3).map((s) => NODES[s]!.stop).join(', ')}${src.length > 3 ? ' …' : ''}` };
  if (store.prior(id)) return { key: 'prior', text: 'aiemmassa versiossa tehty (ei nykyinen tarkistus)' };
  if (store.deferred(id)) return { key: 'deferred', text: 'jätetty myöhemmäksi' };
  return { key: 'unchecked', text: store.attemptsOf(id).length ? 'ei vielä tarkistettu' : isUnlocked(id, store.known) ? 'ei vielä yritetty' : 'ei vielä yritetty (polun takana)' };
}

/** Sol's design card for this lesson, if any: a design note for the adult, not lesson content. */
function solNote(id: string) {
  const c = solCard(id);
  if (!c) return null;
  return h('details', { class: 'sol-note' }, h('summary', {}, SOL_STATUS_TEXT[c.status] ?? 'Sol-kortti'),
    c.goal ? h('div', {}, h('b', {}, 'Tavoite: '), c.goal) : null,
    c.example ? h('div', {}, h('b', {}, 'Esimerkki: '), c.example) : null,
    c.task ? h('div', {}, h('b', {}, 'Tehtävä: '), c.task) : null,
    c.feedback ? h('div', {}, h('b', {}, 'Palaute: '), c.feedback) : null,
    h('div', { class: 'muted' }, `Lähde: ${c.source.path}${c.source.line ? `:${c.source.line}` : ''} · ${c.research.join(', ')}`));
}

function download() {
  const summary = Object.fromEntries(ORDER.map((id) => {
    const st = store.state(id);
    return [id, { status: statusOf(id).key, difficulty: st.difficulty, recallFailed: st.recallFailed, inferredFrom: store.inferredFrom(id), deferred: store.deferred(id), prior: store.prior(id), ...(solCard(id) ? { sol: solCard(id)!.status } : {}) }];
  }));
  const data = exportData({ manifest: { nodes: ORDER.length, ...(MANIFEST as object), solCards: SOL_SHA }, summary });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `sammakko-lite-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function adult() {
  const s = store.get();
  const counts: Record<string, number> = {};
  for (const id of ORDER) { const k = statusOf(id).key; counts[k] = (counts[k] ?? 0) + 1; }
  const hard = ORDER.filter((id) => store.state(id).difficulty);
  const rows = ORDER.map((id) => {
    const k = kc(id), st = store.state(id), stat = statusOf(id);
    const at = store.attemptsOf(id);
    const indep = at.filter((a) => a.phase === 'independent' || a.phase === 'transfer');
    const n = (p: string) => at.filter((a) => a.phase === p).length;
    return h('tr', {},
      h('td', {}, h('code', {}, id), h('div', { class: 'small' }, k.title), h('div', { class: 'small muted' }, `${NODES[id]!.icon} ${NODES[id]!.stop} · ${k.grade} lk`)),
      h('td', {}, h('span', { class: `pill ${stat.key}` }, stat.text),
        st.difficulty ? h('div', { class: 'small bad-text' }, 'viime aikoina vaikeaa') : null,
        st.recallFailed ? h('div', { class: 'small bad-text' }, st.difficulty ? 'muistihaku epäonnistui' : 'muistihaku epäonnistui, harjoiteltu sen jälkeen') : null,
        st.dueAt && st.retained === undefined ? h('div', { class: 'small muted' }, `muistihaku aikaisintaan ${fmt(st.dueAt)}`) : null),
      h('td', { class: 'small' }, at.length ? null : h('div', { class: 'muted' }, 'ei vastauksia'),
        indep.length ? h('div', {}, `${indep.filter((a) => a.ok).length}/${indep.length} itsenäistä`) : null,
        n('guided') ? h('div', {}, `${n('guided')} ohjattua`) : null,
        n('practice') ? h('div', {}, `${n('practice')} harjoitusta`) : null,
        n('quick') ? h('div', {}, `${at.filter((a) => a.phase === 'quick' && a.ok).length}/${n('quick')} pika`) : null,
        n('retrieval') ? h('div', {}, `${at.filter((a) => a.phase === 'retrieval' && a.ok).length}/${n('retrieval')} muistihakua`) : null,
        at.length ? h('div', { class: 'muted' }, `viimeksi ${fmt(at.at(-1)!.at)}`) : null),
      h('td', { class: 'small' },
        requiredOf(id).length ? h('div', {}, 'Esitiedot: ', requiredOf(id).map((p) => NODES[p]!.stop).join(', ')) : h('div', { class: 'muted' }, 'Ei esitietoja'),
        solNote(id)));
  });
  const events = s.events.filter((e) => e.type === 'confusing' || e.type === 'note').slice().reverse();
  const note = h('textarea', { rows: '3', placeholder: 'Esim. "Desimaaliluvut sujuivat, mutta pilkun paikka hämmensi."', 'aria-label': 'Aikuisen muistiinpano' });
  app.replaceChildren(h('div', { class: 'stack adult' },
    h('div', { class: 'top' },
      h('a', { class: 'icon-btn', href: '#', 'aria-label': 'Takaisin', html: ICON.back }),
      h('div', { class: 'title' }, 'Aikuiselle')),
    storageNotice(true),
    h('div', { class: 'card small stack', style: 'gap:6px' },
      h('p', {}, h('b', {}, 'Mitä tilat tarkoittavat. '),
        'Tarkistettu = 3 peräkkäistä oikeaa itsenäistä vastausta vähintään kahdesta tehtävätyypistä ja sen jälkeen yksi oikein ratkaistu uusi tilanne (tai pikatarkistuksessa 2 oikein peräkkäin). ',
        'Harjoiteltu avun kanssa = vähintään 2 oikeaa vastausta esimerkin tai vihjeen tuella; kerryttää kartan valoa, mutta ei ole tarkistus. ',
        'Päätelty = myöhempi paikka, joka vaatii tämän taidon (pakollinen esitieto), on tarkistettu; tätä ei ole kysytty erikseen. ',
        'Muistettu = oikea muistihaku vähintään 20 tunnin tauon jälkeen. Heti perään harjoiteltu ei ole muistamista. ',
        'Aiemmassa versiossa tehty = tehtävä on sittemmin muuttunut; vanha suoritus näkyy kartalla, mutta se ei ole nykyinen tarkistus. ',
        'Ei vielä yritetty ei tarkoita heikkoa osaamista. Avaaminen, ohittaminen ja "Myöhemmin" eivät koskaan kerrytä suoritusta.'),
      h('p', {}, `${ORDER.length} aihetta: ${counts.retained ?? 0} muistettu, ${counts.checked ?? 0} tarkistettu, ${counts.helped ?? 0} avun kanssa, ${counts.inferred ?? 0} päätelty, ${counts.prior ? `${counts.prior} aiemmassa versiossa tehty, ` : ''}${counts.deferred ?? 0} myöhemmäksi, ${counts.unchecked ?? 0} ei vielä tarkistettu. Viime aikoina vaikeaa: ${hard.length ? hard.map((id) => NODES[id]!.stop).join(', ') : 'ei mitään'}.`),
      h('p', { class: 'muted' }, store.storage() === 'local' ? 'Tiedot ovat vain tämän laitteen selaimessa.' : 'Tiedot ovat vain tämän välilehden muistissa.')),
    h('div', { class: 'row' },
      ...WORLDS.filter((W) => W.id !== (s.world ?? 'ranta')).map((W) =>
        btn('', `Vaihda: ${W.name}`, () => { store.update((x) => { x.world = W.id; }); location.hash = ''; })),
      btn('', 'Vie tiedot (JSON)', download),
      btn('', s.tester ? 'Lopeta testaajatila' : 'Testaajatila', () => { store.update((x) => { x.tester = !x.tester; }); adult(); }),
      s.attempts.some((a) => a.syn) || s.events.some((e) => e.syn) || s.testerGame
        ? btn('', 'Nollaa testidata', () => { if (confirm('Poistetaanko testaajatilan vastaukset ja testipeli? Lapsen omat tiedot säilyvät.')) { store.resetTester(); adult(); } })
        : null,
      store.devClock ? btn('', 'Kello +1 vrk (kehitys)', () => { store.update((x) => { x.clockOffset += 24 * 3600e3; }); adult(); }) : null,
      btn('', 'Nollaa kaikki', () => { if (confirm('Poistetaanko kaikki edistyminen tästä laitteesta? Vie tiedot ensin talteen, jos haluat säilyttää ne.')) { store.reset(); location.hash = ''; } })),
    h('h2', {}, 'Palaute ja muistiinpanot'),
    h('div', { class: 'stack', style: 'gap:6px' }, note,
      btn('', 'Tallenna muistiinpano', () => { const t = note.value.trim(); if (t) { store.log({ type: 'note', text: t }); adult(); } }, 'small-btn')),
    events.length ? h('ul', { class: 'small events' }, ...events.slice(0, 40).map((e) => h('li', {},
      `${fmt(e.at)} · `, e.type === 'confusing' ? `🤔 Hämmentävää: ${NODES[e.node!]?.stop ?? e.node} (${e.text ?? ''}, siemen ${e.seed ?? '-'})` : `📝 ${e.text}`, e.syn ? ' · testi' : '')))
      : h('p', { class: 'small muted' }, 'Ei vielä palautetta. Lapsi voi painaa tehtävän alla "Tämä oli hämmentävää".'),
    adultGraph((id) => { location.hash = ''; setTimeout(() => open(id, 'learn')); }),
    h('h2', {}, 'Aiheet taulukkona'),
    h('div', { class: 'table-wrap' }, h('table', {},
      h('thead', {}, h('tr', {}, h('th', {}, 'Aihe'), h('th', {}, 'Tila'), h('th', {}, 'Näyttö'), h('th', {}, 'Graafi'))),
      h('tbody', {}, ...rows))),
    h('p', { class: 'small muted' }, `${KCS.length} aihetta · graafin tarkiste ${GRAPH_SHA.slice(0, 12)} · Sol-kortit ${SOL_SHA.slice(0, 12)} · sisältöversio ${CONTENT_REV} · tallennemuoto v${s.v} · ${s.attempts.length} vastausta (${s.attempts.filter((a) => a.syn).length} testidataa)`)));
}

route();
// The Finnish voice may load after the first paint: refresh the map, never a running lesson.
// Voices often arrive after the first render: redraw the map or the world choice so the notices are right.
onVoices(() => { if (document.querySelector('.wmap, .worlds')) route(); });
