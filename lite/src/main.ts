import './ui/style.css';
import './ui/mobile-map.css';
import { compactPlay } from './ui/compact-play';
import { GRAPH_SHA, KCS, kc, MANIFEST, ORDER, requiredOf } from './engine/graph';
import { BACKUP_KEY, exportData, store, type World } from './engine/store';
import { independentRatio } from './engine/evidence';
import { statusOf, statusSummary } from './ui/status';
import { kcHash, parseKcHash, type KcRoute } from './route';
import { canonicalTitle } from './canonical';
import { SOL_SHA, SOL_STATUS_TEXT, solCard } from './content/sol';
import { CONTENT_REV, NODES } from './content';
import { chaptersFor, nextNode, PRIZES, worldInfo, WORLDS } from './content/world';
import { ICON, svg } from './ui/art';
import { btn, h } from './ui/dom';
import { canSpeak, hasFinnish, hush, onVoices, quiet, say, speechPossible } from './ui/speech';
import { ambientAssets, hasSpeechAssets, onAudioChange, setSfxOn, sfxOn } from './audio/player';
import { ambientOn, setAmbientOn } from './audio/ambient';
import { avatarArt, CHAPTER_COLOR, modeFor, worldIds, worldMap } from './ui/worldmap';
import { adultGraph } from './ui/adultgraph';
import { worldOverview } from './ui/worldlinks';
import { lesson, stopLesson, type Mode } from './ui/lesson';
import { paja } from './ui/paja';
import { flight } from './ui/flight';
import { autoAnimate, calmByAdult, setCalmByAdult } from './ui/sprite';
import type { SceneId } from './game';
import { hasPublicationNavigation, publicationNavigation } from './publication';

const app = document.getElementById('app')!;
autoAnimate(app);

// The combined publication has a real home and lesson library. Standalone Lite
// previews retain their original navigation and do not point at absent siblings.
// Lessons are reachable only from the network's node panel until they are release quality.
const publicationSections = publicationNavigation.sections.filter(item => ['home', 'network'].includes(item.id));
const publicationAdultLink = h('a', { href: '#aikuiselle' }, 'Aikuiselle');
const publicationNav = hasPublicationNavigation(location.pathname, document.querySelector<HTMLMetaElement>('meta[name="sammakko-publication"]')?.content ?? null)
  ? h('nav', { class: 'publication-nav', 'aria-label': 'Sammakko-sivusto' },
      ...publicationSections.map(item => h('a', { href: item.href, class: item.id === 'home' ? 'publication-home' : '' },
        ...(item.id === 'home' ? [h('img', { src: publicationNavigation.brand.image, width: '28', height: '28', alt: '' })] : []), item.label)),
      publicationAdultLink) : null;
if (publicationNav) {
  app.before(publicationNav);
  const measurePublicationNav = () => document.documentElement.style.setProperty('--publication-nav-height', `${Math.ceil(publicationNav.getBoundingClientRect().height)}px`);
  measurePublicationNav();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measurePublicationNav).observe(publicationNav);
  else window.addEventListener('resize', measurePublicationNav);
}
function updatePublicationNav() {
  if (!publicationNav) return;
  if (location.hash === '#aikuiselle') publicationAdultLink.setAttribute('aria-current', 'page');
  else publicationAdultLink.removeAttribute('aria-current');
}

/** A KC hash this page wrote for the lesson it already shows: its hashchange is not a new route. */
let ownHash: string | null = null;
/** Bumped on every route, so a late async answer can tell it is no longer wanted (review G03). */
let routeSeq = 0;
let stopExpedition: (() => void) | undefined;

function route() {
  routeSeq++;
  updatePublicationNav();
  if (ownHash !== null && location.hash === ownHash) { ownHash = null; return; }
  ownHash = null;
  hush();
  // A lesson left by an address change stops its players and timers (review V4-03).
  stopLesson();
  stopExpedition?.(); stopExpedition = undefined;
  document.querySelector('.sheet-back')?.remove();
  if (location.hash === '#saaristo/hahmot') {
    const seq = routeSeq;
    app.replaceChildren(h('p', { role: 'status' }, 'Hahmopaja avautuu…'));
    void import('./ui/character-lab').then(({ characterLab }) => {
      if (seq === routeSeq) stopExpedition = characterLab(app);
    }).catch(() => {
      if (seq === routeSeq) app.replaceChildren(h('p', { role: 'alert' }, 'Hahmopajaa ei saatu ladattua.'), h('a', { href: '#saaristo' }, 'Takaisin Saaristoon'));
    });
    return;
  }
  if (location.hash === '#saaristo/loppu') {
    const seq = routeSeq;
    app.replaceChildren(h('p', { role: 'status' }, 'Tulevaisuuden tarina avautuu…'));
    void import('./ui/finale').then(({ finale }) => {
      if (seq !== routeSeq) return;
      app.classList.add('finale-app');
      const dispose = finale(app, { onExit: () => { location.hash = 'saaristo'; } });
      stopExpedition = () => { dispose(); app.classList.remove('finale-app'); };
    });
    return;
  }
  if (location.hash === '#saaristo' || location.hash.startsWith('#saaristo/')) {
    const seq = routeSeq;
    const reviewing = location.hash.startsWith('#saaristo/kertaus/');
    const raw = location.hash.slice((reviewing ? '#saaristo/kertaus/' : '#saaristo/').length);
    let id: string | undefined;
    try { id = location.hash.startsWith('#saaristo/') ? decodeURIComponent(raw) : undefined; } catch { id = undefined; }
    app.replaceChildren(h('p', { class: 'card', role: 'status' }, 'Saaristo herää…'));
    void import('./ui/expedition').then(({ expedition }) => {
      if (seq === routeSeq) stopExpedition = expedition(app, id, reviewing);
    }).catch(() => {
      if (seq === routeSeq) app.replaceChildren(h('p', { class: 'card', role: 'alert' }, 'Retkeä ei saatu ladattua. Yritä ladata sivu uudelleen.'), h('a', { href: '#alueet' }, 'Aihevalintaan'));
    });
    return;
  }
  const kr = parseKcHash(location.hash);
  if (kr) return openLink(kr);
  if (location.hash === '#aikuiselle') return adult();
  if (location.hash === '#alueet' || (compactPlay() && location.hash === '#aiheet')) return chooseWorld();
  if (location.hash.startsWith('#paja')) {
    const sc = location.hash.slice(6);
    if (sc === 'lento') return flight(app, () => storageNotice());
    return paja(app, (['ranta', 'rata', 'torni'] as const).find((x) => x === sc) ?? 'paja', { lesson: openMission, notice: () => storageNotice() });
  }
  const w = store.get().world;
  if (!w && !compactPlay()) return chooseWorld();
  map(w ?? 'ranta');
}
window.addEventListener('hashchange', route);
// Another tab saved progress (review G01): redraw overview pages; a lesson in progress is not interrupted.
// The adult page is not redrawn either: a note being typed would be lost.
store.onExternal(() => { if (['', '#', '#alueet'].includes(location.hash)) route(); });

/** Switch area (keeping everything) and optionally scroll the map to one chapter. */
function goTo(w: World, chapter?: string) {
  store.update((s) => { s.world = w; });
  if (location.hash) location.hash = ''; else route();
  window.scrollTo(0, 0);
  if (chapter) requestAnimationFrame(() => document.getElementById(`alue-${chapter}`)?.scrollIntoView({ block: 'start' }));
}

/** Leave a lesson to the map. A KC address is dropped (replaced, so Back does not reopen the lesson). */
function toMap() {
  if (parseKcHash(location.hash)) { ownHash = null; location.replace('#'); } else route();
}

/** The area a lesson belongs to: the current one if it has the lesson, else the first that does. */
function worldOf(id: string): World {
  const cur = store.get().world;
  if (cur && worldIds(cur).includes(id)) return cur;
  return WORLDS.find((W) => worldIds(W.id).includes(id))?.id ?? cur ?? 'ranta';
}

/** Inbound KC link: open that lesson in its ordinary mode, or say clearly why not. Nothing is recorded. */
function openLink(r: Exclude<KcRoute, null>) {
  if (r.kind === 'kc' && NODES[r.id]) {
    const w = worldOf(r.id);
    if (store.get().world !== w) store.update((s) => { s.world = w; });
    return open(r.id, modeFor(w, r.id));
  }
  const hash = location.hash, seq = routeSeq;
  const page = (title: string, text: string, retry?: () => void) => app.replaceChildren(h('div', { class: 'stack' },
    h('div', { class: 'top' }, h('a', { class: 'icon-btn', href: '#', 'aria-label': 'Kartalle', html: ICON.back }), h('div', { class: 'title' }, title)),
    h('p', { class: 'card', role: 'status' }, text),
    h('p', { class: 'small muted' }, 'Mitään ei avattu eikä tallennettu.'),
    h('div', { class: 'row' }, retry ? btn(ICON.replay, 'Yritä uudelleen', retry, 'primary') : null,
      btn(ICON.next, 'Kartalle', toMap, retry ? '' : 'primary'), h('a', { class: 'btn', href: '#alueet' }, 'Valitse aihe'))));
  if (r.kind === 'malformed') return page('Linkki ei toimi', `Linkissä ei ole kelvollista aiheen tunnusta: “${r.raw.slice(0, 80)}”.`);
  // Only the route that asked may draw the answer: a late reply for an earlier link is dropped.
  const still = () => seq === routeSeq && location.hash === hash;
  const lookup = () => {
    page('Haetaan aihetta', `Haetaan tietoa aiheesta ${r.id} …`);
    void canonicalTitle(r.id).then((res) => {
      if (!still()) return;
      if (res.kind === 'failed')
        page('Aiheluetteloa ei saatu ladattua', `Tietoa aiheesta ${r.id} ei saatu ladattua (${res.reason}). Tunnus voi silti olla oikea. Tarkista verkkoyhteys ja yritä uudelleen.`, lookup);
      else if (res.title) page('Aihetta ei ole tässä versiossa', `Aihe ${r.id} (${res.title}) kuuluu Sammakon laajaan aiheverkkoon, mutta ei tähän Lite-versioon. Litessä on ${ORDER.length} aihetta.`);
      else page('Tuntematon aihe', `Tunnusta ${r.id} ei löydy Sammakon aiheista. Tarkista linkki.`);
    });
  };
  lookup();
}

function open(id: string, mode: Mode, from?: string, fast = false) {
  toldNow = null;
  window.scrollTo(0, 0);
  const w = store.get().world ?? 'ranta';
  // The address names the open lesson, so it can be copied or reloaded. Lentopaja missions keep their own address.
  const want = kcHash(id);
  if (!location.hash.startsWith('#paja') && location.hash !== want) {
    ownHash = want;
    if (parseKcHash(location.hash)) location.replace(want); else location.hash = want;
  }
  lesson(app, id, mode, {
    home: toMap,
    next: () => {
      const n = nextNode(w);
      if (!n) return toMap();
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
    out.push(warn(`⚠️ Tallennuksessa oli rikkinäisiä kohtia. Ehjät vastaukset säilyivät, rikkinäiset jätettiin pois.${detail && store.dropped() ? ` Pois jätettiin ${store.dropped()} riviä, joiden muoto oli väärä; niitä ei lasketa osaamiseksi.` : ''}${detail ? (store.backedUp() ? ` Alkuperäinen tallenne on tallessa tällä laitteella (avain ${BACKUP_KEY}).` : ' Alkuperäisestä tallenteesta ei saatu varakopiota.') : ' Lisätietoa Aikuiselle-sivulla.'}`));
  if (note === 'unreadable')
    out.push(warn(`⚠️ Aiempaa tallennusta ei voitu lukea, joten aloitettiin tyhjästä.${detail ? (store.backedUp() ? ` Alkuperäinen on tallessa tällä laitteella (avain ${BACKUP_KEY}); sitä ei poisteta.` : ' Alkuperäistä ei poistettu, mutta siitä ei saatu erillistä varakopiota.') : ' Lisätietoa Aikuiselle-sivulla.'}`));
  if (store.get().tester)
    out.push(warn('🧪 Testaajatila on päällä. Vastaukset merkitään testidataksi. Ota tila pois Aikuiselle-sivulla ennen lapsen pelaamista.'));
  return out.length ? h('div', { class: 'stack notices', style: 'gap:6px' }, ...out) : null;
}

// ---------------------------------------------------------------- world choice
function chooseWorld() {
  const pick = (w: World) => { store.update((s) => { s.world = w; }); if (location.hash) location.hash = ''; else route(); };
  if (compactPlay()) {
    const current = store.get().world ?? 'ranta';
    const W = worldInfo(current);
    const quietButton = h('button', { type: 'button', class: 'btn', 'aria-pressed': String(store.quiet()), onclick: () => {
      hush();
      store.update(s => { s.quietUntil = store.quiet() ? 0 : Date.now() + 3 * 3600e3; });
      quietButton.setAttribute('aria-pressed', String(store.quiet()));
    } }, 'Hiljainen tila');
    app.replaceChildren(h('main', { class: 'lite-destinations stack' },
      h('header', { class: 'lite-map-header' }, h('h1', {}, 'Valitse alue'), h('a', { class: 'btn', href: '#' }, 'Kartalle')),
      h('div', { class: 'worlds' }, ...WORLDS.map(region =>
        h('button', { type: 'button', class: `world ${region.id}`, onclick: () => pick(region.id),
          'aria-current': region.id === current ? 'true' : undefined },
        h('span', { 'aria-hidden': 'true', html: svg(60, 56, avatarArt(region.id)) }),
        h('span', {}, h('b', {}, region.name), h('small', {}, region.grade))))),
      h('nav', { class: 'lite-adventures', 'aria-label': 'Muut seikkailut' },
        h('a', { class: 'btn', href: '#saaristo' }, 'Saaristo 690'), h('a', { class: 'btn', href: '#paja' }, 'Lentopaja')),
      h('details', { class: 'lite-map-options' }, h('summary', {}, 'Kartan tarina ja äänet'),
        h('p', {}, W.tale), quietButton),
      storageNotice()));
    return;
  }
  app.replaceChildren(h('div', { class: 'stack' },
    h('h1', {}, 'Sammakko'),
    h('a', { href: '#saaristo', class: 'card start-opt', style: 'background:#e3eee0;border-color:#93b4a5' }, h('b', {}, 'Aavan matkassa · Saaristo'), h('span', { class: 'small' }, 'Elävä 3D-maailma, juhlapöytä ja yhteiset tutkimusretket.')),
    storageNotice(),
    // Two clear starts (review: Lentopaja entry): the story and building, or a topic straight away.
    h('div', { class: 'start-choice' },
      h('a', { href: '#paja', class: 'card start-opt paja-card' }, h('b', {}, '🛠️ Rakenna Aavan kanssa'),
        h('span', { class: 'small muted' }, 'Rakenna lentolaite Loikan ja Aavan kanssa, kisaa rannalla ja lennä saarelle.')),
      h('a', { href: '#aiheet', class: 'card start-opt', onclick: (e: Event) => { e.preventDefault(); document.getElementById('aiheet')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); } },
        h('b', {}, '🗺️ Valitse aihe'), h('span', { class: 'small muted' }, 'Valitse Lite-harjoittelun alue alta.'))),
    h('p', { class: 'muted', id: 'aiheet' }, 'Valitse alue. Aluetta voi vaihtaa milloin vain, eikä mikään katoa. Lentopaja ja Lite-harjoitukset käyttävät samaa edistymistä.'),
    h('div', { class: 'worlds' }, ...WORLDS.map((W) =>
      h('button', { class: `world ${W.id}`, onclick: () => pick(W.id) },
        h('div', { html: svg(96, 80, `<g transform="translate(-2 2) scale(1.45)">${avatarArt(W.id)}</g>`) }),
        h('div', {}, h('h2', {}, W.name), h('p', { class: 'muted small' }, `${W.grade}. ${W.blurb}`), h('p', { class: 'small' }, W.quest),
          h('p', { class: 'small muted' }, `${worldIds(W.id).filter(store.lit).length}/${worldIds(W.id).length} paikkaa loistaa`))))),
    h('h2', {}, '🗺️ Koko maailma'),
    h('p', { class: 'small muted' }, 'Kolme aluetta rinnakkain. Merireitit näyttävät, minkä luvun taitoja tarvitaan toisella alueella. Paksumpi reitti = enemmän yhteyksiä.'),
    worldOverview(CHAPTER_COLOR, goTo),
    !hasFinnish() ? h('p', { class: 'small muted' }, speechPossible()
      ? 'Huom: tästä selaimesta ei löytynyt suomenkielistä puheääntä. Osa ohjeista kuuluu valmiina äänitteinä, muut näkyvät tekstinä.'
      : 'Huom: tästä selaimesta ei löytynyt suomenkielistä puheääntä. Ohjeet näkyvät tekstinä.') : null));
}

// ---------------------------------------------------------------- map
function map(w: World) {
  const n = nextNode(w);
  if (compactPlay()) {
    const play = (id: string, mode: Mode) => open(id, mode, undefined, true);
    const m = worldMap(w, n?.node, { open: play, refresh: route, go: goTo }, true);
    const scroll = h('div', { class: 'lite-map-scroll', role: 'region', 'aria-label': 'Pelattava kartta' }, m);
    const title = worldInfo(w);
    app.replaceChildren(h('main', { class: 'lite-map' },
      h('header', { class: 'lite-map-header' }, h('h1', {}, title.name),
        n ? h('button', { type: 'button', class: 'btn primary', onclick: () => play(n.node, n.retrieval ? 'retrieval' : modeFor(w, n.node)) }, 'Pelaa') : null,
        h('a', { class: 'btn', href: '#alueet' }, 'Alueet')),
      storageNotice(), scroll));
    const target = m.querySelector('.place.next');
    if (target) {
      const box = scroll.getBoundingClientRect();
      const place = target.getBoundingClientRect();
      if (place.bottom > box.bottom) scroll.scrollTop = place.top - box.top - box.height / 2 + place.height / 2;
    }
    if (!taleSeen(w) && !store.quiet() && canSpeak(title.tale)) {
      void say(title.tale).finished.then(e => { if (e === 'ended') markTale(w); });
    }
    return;
  }
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
      !speechPossible() ? null : h('button', {
        class: `icon-btn quiet-btn${store.quiet() ? ' on' : ''}`, 'aria-pressed': String(store.quiet()), html: store.quiet() ? ICON.mute : ICON.speaker,
        'aria-label': store.quiet() ? 'Hiljainen tila päällä' : 'En voi nyt kuunnella',
        title: store.quiet() ? 'Hiljainen tila: kuuntelutehtävät näytetään tekstinä' : 'En voi nyt kuunnella',
        onclick: () => { hush(); store.update((x) => { x.quietUntil = store.quiet() ? 0 : Date.now() + 3 * 3600e3; }); route(); },
      }),
      h('a', { href: '#paja', class: 'small paja-link', 'aria-label': 'Lentopaja: rakenna lentolaite Aavan kanssa' }, '🛠️ Lentopaja'),
      h('a', { href: '#alueet', class: 'small muted', 'aria-label': 'Vaihda aluetta' }, 'Alueet'),
      h('a', { href: '#aikuiselle', class: 'small muted' }, 'Aikuiselle')),
    storageNotice(),
    h('div', { class: 'progress-strip', role: 'img', 'aria-label': `${lit} / ${total.length} paikkaa loistaa` },
      h('i', { class: 'lit', style: `width:${(100 * lit) / total.length}%` }),
      h('i', { class: 'inf', style: `width:${(100 * inferredN) / total.length}%` })),
    q ? h('p', { class: 'small hint' }, store.quiet() ? '🔇 Hiljainen tila: ohjeita ei lueta ääneen, eikä kuuntelutehtäviä ehdoteta. Ne näkyvät tekstinä.' : (speechPossible() ? '🔇 Tästä selaimesta puuttuu suomenkielinen puheääni. Valmiit äänitteet kuuluvat, muut ohjeet näkyvät tekstinä, ja kuuntelutehtävät ilman ääntä ohitetaan.' : '🔇 Tästä selaimesta puuttuu suomenkielinen puheääni, joten ohjeet näkyvät tekstinä ja kuuntelutehtävät ohitetaan.')) : null,
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
  // Marked as heard only after the whole tale actually played (not on a blocked or cut-off attempt).
  if (unheard && canSpeak(worldInfo(w).tale)) { toldNow = w; void say(worldInfo(w).tale).finished.then((e) => { if (e === 'ended') markTale(w); }); }
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
    return [id, { status: statusOf(id).key, ...(st.produced !== undefined ? { produced: st.produced, produces: NODES[id]!.produceWhat } : {}), difficulty: st.difficulty, recallFailed: st.recallFailed, inferredFrom: store.inferredFrom(id), deferred: store.deferred(id), prior: store.prior(id), ...(solCard(id) ? { sol: solCard(id)!.status } : {}) }];
  }));
  const data = exportData({ manifest: { nodes: ORDER.length, ...(MANIFEST as object), solCards: SOL_SHA }, summary });
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: `sammakko-lite-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

/** Audio notes and switches on the adult page. On a fresh load the audio index arrives after the page is
 *  drawn: the slot fills in then, without redrawing the page, so a note being typed stays. */
function afterAudio(make: () => HTMLElement | null) {
  const slot = h('div', { style: 'display: contents' });
  const fill = () => slot.replaceChildren(...[make()].filter((n): n is HTMLElement => !!n));
  if (!hasSpeechAssets() && !ambientAssets().length) { const off = onAudioChange(() => { off(); fill(); }); }
  fill();
  return slot;
}

function adult() {
  const s = store.get();
  const hard = ORDER.filter((id) => store.state(id).difficulty);
  const rows = ORDER.map((id) => {
    const k = kc(id), st = store.state(id), stat = statusOf(id);
    const at = store.attemptsOf(id);
    // Fresh assessment only: replays of a familiar task and correct-total-but-unfinished-procedure
    // answers are counted apart (review L181-09); the engine treats them as neutral too.
    const ir = independentRatio(at);
    const n = (p: string) => at.filter((a) => a.phase === p).length;
    return h('tr', {},
      h('td', {}, h('code', {}, id), h('div', { class: 'small' }, k.title), h('div', { class: 'small muted' }, `${NODES[id]!.icon} ${NODES[id]!.stop} · ${k.grade} lk`)),
      h('td', {}, h('span', { class: `pill ${stat.key}` }, stat.text),
        st.difficulty ? h('div', { class: 'small bad-text' }, 'viime aikoina vaikeaa') : null,
        st.recallFailed ? h('div', { class: 'small bad-text' }, st.difficulty ? 'muistihaku epäonnistui' : 'muistihaku epäonnistui, harjoiteltu sen jälkeen') : null,
        st.dueAt && st.retained === undefined ? h('div', { class: 'small muted' }, `muistihaku aikaisintaan ${fmt(st.dueAt)}`) : null),
      h('td', { class: 'small' }, at.length ? null : h('div', { class: 'muted' }, 'ei vastauksia'),
        ir.n ? h('div', {}, `${ir.ok}/${ir.n} itsenäistä`) : null,
        ir.neutral ? h('div', { class: 'muted' }, `${ir.neutral} ei laskettu (toisto, merkintä kesken tai vastaus näkyi ennen vastaamista)`) : null,
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
        'Tarkistettu tunnistamalla = tarkistus on tehty, mutta tämän aiheen omaa tuotosta (esim. rakennettua lauseketta tai itse laskettua summaa) ei ole vielä nähty. ',
        'Päätelty = myöhempi paikka, joka vaatii tämän taidon (pakollinen esitieto), on tarkistettu; tätä ei ole kysytty erikseen. ',
        'Muistettu = oikea muistihaku vähintään 20 tunnin tauon jälkeen. Heti perään harjoiteltu ei ole muistamista. ',
        'Aiemmassa versiossa tehty = tehtävä on sittemmin muuttunut; vanha suoritus näkyy kartalla, mutta se ei ole nykyinen tarkistus. ',
        'Ei vielä yritetty ei tarkoita heikkoa osaamista. Avaaminen, ohittaminen ja "Myöhemmin" eivät koskaan kerrytä suoritusta.'),
      h('p', {}, `${statusSummary(ORDER)} Viime aikoina vaikeaa: ${hard.length ? hard.map((id) => NODES[id]!.stop).join(', ') : 'ei mitään'}.`),
      afterAudio(() => (hasSpeechAssets() ? h('p', { class: 'muted' }, 'Hahmojen ja kertojan puhe on tekoälyn tuottamaa (OpenAI). Ääni lukee vain ruudulla näkyvän tekstin. Hiljainen tila hiljentää puheen ja tehosteet.') : null)),
      afterAudio(() => (ambientAssets().length ? h('p', { class: 'muted' }, 'Äänimaisema (tuuli kaislikossa ja laineiden liplatus) on oletuksena pois. Päällä se soi hiljaa taustalla, tehtävissä vielä hiljempaa, ja vaimenee aina puheen ajaksi. Hiljainen tila hiljentää myös sen. Äänitteet ovat vapaasti käytettäviä (CC0) luontoäänitteitä.') : null)),
      h('p', { class: 'muted' }, store.storage() === 'local' ? 'Tiedot ovat vain tämän laitteen selaimessa. Jos peli on auki useassa välilehdessä, kaikkien välilehtien vastaukset tallentuvat; avoinna oleva välilehti näyttää muiden muutokset, kun sivu piirretään uudelleen.' : 'Tiedot ovat vain tämän välilehden muistissa.')),
    h('div', { class: 'row' },
      ...WORLDS.filter((W) => W.id !== (s.world ?? 'ranta')).map((W) =>
        btn('', `Vaihda: ${W.name}`, () => { store.update((x) => { x.world = W.id; }); location.hash = ''; })),
      btn('', 'Vie tiedot (JSON)', download),
      btn('', calmByAdult() ? 'Salli hahmojen liike ja äänet' : 'Pysäytä hahmojen liike ja äänet', () => { setCalmByAdult(!calmByAdult()); adult(); }),
      btn('', sfxOn() ? 'Tehosteäänet pois' : 'Tehosteäänet päälle', () => { setSfxOn(!sfxOn()); adult(); }),
      afterAudio(() => (ambientAssets().length ? btn('', ambientOn() ? 'Äänimaisema pois' : 'Äänimaisema päälle', () => { setAmbientOn(!ambientOn()); adult(); }) : null)),
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
    adultGraph((id) => { location.hash = kcHash(id); }),
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

