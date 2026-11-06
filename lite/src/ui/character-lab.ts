import { h } from './dom';
import { mountSaaristo } from '../world/saaristo/main';
import { mountCharacterPreview, type CharacterCandidate, type CharacterView } from '../world/character-preview';
import './character-lab.css';

const clipLabels: Record<string, string> = { idle: 'Lepo', walk: 'Kävely', 'gentle-nod': 'Nyökkäys', point: 'Osoitus', leap: 'Hyppy', wave: 'Vilkutus', gesture: 'Selittävä ele', greet: 'Tervehdys', sleep: 'Torkahdus' };
const viewLabels: Record<CharacterView, string> = { front: 'Edestä', 'three-quarter': 'Viistosta', side: 'Sivulta', back: 'Takaa' };

/** A separate review route. It neither reads nor creates learning observations. */
export function characterLab(app: HTMLElement): () => void {
  let disposed = false, choice = 0, available = false, candidates: CharacterCandidate[] = [];
  const controller = new AbortController(), reduce = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = reduce.matches;
  const assets = (name: string) => new URL(name, document.baseURI).href;
  const base = assets('models/characters/');
  const worldHost = h('div', { class: 'character-lab-world', 'aria-hidden': 'true' });
  const poster = h('img', { class: 'character-lab-poster', alt: 'Hahmomallin viistokuva', hidden: true });
  const status = h('p', { role: 'status', class: 'character-lab-status' }, 'Hahmomallit latautuvat…');
  const modelButtons = h('div', { class: 'character-lab-models', role: 'group', 'aria-label': 'Hahmo' });
  const animationButtons = h('div', { class: 'character-lab-actions', role: 'group', 'aria-label': 'Animaatio' });
  const viewButtons = h('div', { class: 'character-lab-actions', role: 'group', 'aria-label': 'Katselukulma' });
  const pose = h('output', { class: 'character-lab-pose', 'aria-live': 'off' }, 'Lepoasento');
  const pause = h('button', { type: 'button', onclick: () => { paused = !paused; syncMotion(); } });
  const step = h('button', { type: 'button', onclick: () => {
    paused = true; syncMotion(); player.advanceTime(250); showPose();
  } }, 'Etene ¼ sekuntia');
  const restart = h('button', { type: 'button', onclick: () => {
    const clip = player.snapshot().clip; if (clip) player.setClip(clip); showPose();
  } }, 'Alkuasento');
  const controls = h('fieldset', { class: 'character-lab-controls', disabled: true },
    h('legend', {}, 'Tutki liikettä'), animationButtons,
    h('div', { class: 'character-lab-actions' }, pause, step, restart), pose,
    h('p', {}, 'Katselukulma'), viewButtons);
  const stats = h('p', { class: 'character-lab-stats' });
  const stage = h('div', { class: 'character-lab-stage' }, worldHost, poster,
    h('div', { class: 'character-lab-caption' }, h('span', {}, 'SAARISTON HAHMOPAJA'), h('h1', {}, 'Hahmo herää liikkeeseen.')));
  const root = h('main', { class: 'character-lab' }, stage,
    h('aside', { class: 'character-lab-panel' }, h('a', { href: '#saaristo' }, '← Takaisin Saaristoon'),
      h('p', { class: 'character-lab-eyebrow' }, 'Mallien katselu'), h('h2', {}, 'Tuttu hahmo, uusi ulottuvuus'),
      h('p', {}, 'Nämä ovat alkuperäisistä hahmokuvista mallinnettuja kokeiluversioita. Voit tutkia siluettia ja liikettä rauhassa.'),
      modelButtons, status, controls, stats,
      h('p', { class: 'character-lab-note' }, 'Kävely esitetään paikallaan. Katselu ei tallenna oppimissuorituksia.')));
  app.classList.add('character-lab-app'); app.replaceChildren(root);
  const world = mountSaaristo({ container: worldHost, assets: { world: assets('world/saaristo'), characters: assets('characters') }, paused,
    interactive: false, onStatus(value) {
      root.dataset.renderer = value.status;
      if (value.status === 'fallback') {
        available = false; controls.disabled = true; poster.hidden = false;
        status.textContent = '3D-näkymä ei ole käytössä. Kuvassa on mallin lepoasento.';
      }
    },
  });
  const player = mountCharacterPreview(world);
  const resize = new ResizeObserver(() => world.resize()); resize.observe(worldHost);
  function showPose() {
    const state = player.snapshot();
    pose.textContent = state.clip ? `${clipLabels[state.clip] ?? state.clip} · ${state.time.toFixed(2)} / ${state.duration.toFixed(2)} s` : 'Lepoasento';
  }
  function syncMotion() {
    player.setPaused(paused); world.setPaused(paused);
    pause.textContent = paused ? 'Toista liike' : 'Pysäytä liike';
    pause.setAttribute('aria-pressed', String(!paused));
    showPose();
  }
  function selected(group: HTMLElement, value: string) {
    for (const button of group.querySelectorAll('button')) button.setAttribute('aria-pressed', String(button.dataset.value === value));
  }
  for (const [view, label] of Object.entries(viewLabels)) viewButtons.append(h('button', {
    type: 'button', 'data-value': view, 'aria-pressed': String(view === 'three-quarter'),
    onclick: () => { player.setView(view as CharacterView); selected(viewButtons, view); },
  }, label));
  async function choose(candidate: CharacterCandidate) {
    const request = ++choice;
    available = false; controls.disabled = true; poster.hidden = false;
    poster.src = new URL(candidate.poster, base).href; poster.alt = `${candidate.name}: 3D-mallin lepoasento viistosta`;
    selected(modelButtons, candidate.id); status.textContent = `${candidate.name} latautuu…`;
    animationButtons.replaceChildren(...candidate.clips.map(clip => h('button', { type: 'button', 'data-value': clip,
      'aria-pressed': String(clip === 'idle'), onclick: () => { player.setClip(clip); selected(animationButtons, clip); showPose(); },
    }, clipLabels[clip] ?? clip)));
    stats.textContent = `${candidate.triangles.toLocaleString('fi-FI')} kolmiota · ${candidate.bones} niveltä · ${Math.round(candidate.bytes / 1024)} kt`;
    const loaded = await player.load(candidate, new URL(candidate.file, base).href);
    if (disposed || request !== choice) return;
    available = loaded; controls.disabled = !loaded; poster.hidden = loaded;
    status.textContent = loaded ? `${candidate.name} on valmis katseltavaksi. Kokeiluversio.` : '3D-mallia ei saatu näkyviin. Kuvassa on mallin lepoasento.';
    syncMotion();
  }
  const previousText = window.render_game_to_text, previousAdvance = window.advanceTime;
  const read = () => JSON.stringify({ mode: 'character-lab', renderer: available && !world.state.lost ? 'webgl' : 'fallback', ...player.snapshot() });
  // Match the visible step control: advance the character and invalidate one frame.
  // A model inspection must not simulate and redraw the entire island at 60 steps/s.
  const advance = (ms: number) => { player.advanceTime(ms); showPose(); };
  window.render_game_to_text = read; window.advanceTime = advance;
  const onMotion = () => { if (reduce.matches) { paused = true; syncMotion(); } };
  reduce.addEventListener('change', onMotion);
  syncMotion();
  void fetch(new URL('manifest.json', base), { signal: controller.signal }).then(async response => {
    if (!response.ok) throw new Error('manifest unavailable');
    const manifest = await response.json() as { version: number; candidates: CharacterCandidate[] };
    if (disposed) return;
    if (manifest.version !== 1 || !Array.isArray(manifest.candidates) || !manifest.candidates.length) throw new Error('invalid manifest');
    candidates = manifest.candidates;
    modelButtons.replaceChildren(...candidates.map(candidate => h('button', { type: 'button', 'data-value': candidate.id,
      'aria-pressed': 'false', onclick: () => { void choose(candidate); },
    }, candidate.name)));
    await choose(candidates[0]!);
  }).catch(() => {
    if (!disposed) { status.textContent = 'Hahmomalleja ei saatu ladattua. Palaa Saaristoon tai lataa sivu uudelleen.'; poster.hidden = true; }
  });
  return () => {
    if (disposed) return;
    disposed = true; choice++; controller.abort(); resize.disconnect(); reduce.removeEventListener('change', onMotion);
    player.dispose(); world.dispose(); app.classList.remove('character-lab-app');
    if (window.render_game_to_text === read) window.render_game_to_text = previousText;
    if (window.advanceTime === advance) window.advanceTime = previousAdvance;
  };
}
