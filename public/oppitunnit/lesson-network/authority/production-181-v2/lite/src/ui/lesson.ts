// One lesson ("KC oppitunti") from its goal to the reward: worked example, guided
// tries, independent tries, one new situation (transfer), and later a recall.
// Every answer is recorded with the item seed, response, help and mode, so that an
// adult can see exactly what happened. Opening, skipping or deferring never counts.
import { check, solution, wrongs } from '../engine/check';
import { RULES, type AttemptPhase, type Help } from '../engine/evidence';
import { ancestors, dependents, isUnlocked } from '../engine/graph';
import { newSeed, rng } from '../engine/rng';
import { store } from '../engine/store';
import type { Item, NodeSpec, Phase, Response } from '../engine/types';
import { NODES, revOf } from '../content';
import { chapterIn, chapterOf, chaptersFor, PRIZES, supportFor, worldInfo } from '../content/world';
import { duck, frog, ICON, svg } from './art';
import { btn, h, wait } from './dom';
import { hasFinnish, hush, quiet, say } from './speech';
import { MOTION_CFG, scnRecord, type MotionPaint } from './motion';
import { mount } from './widgets';

const scnOf = (it: Item) => { const c = (it.scene as MotionPaint | undefined)?.[MOTION_CFG]; return c ? scnRecord(c) : it.scn!; };

/**
 * learn: the normal path. leap: a place whose background is not known yet (chosen on the map).
 * retrieval: a delayed recall. quick: foundation check (2 in a row). preview: example only.
 * practice: 5 more tasks on a checked place. support: a detour to a prerequisite, then back.
 */
export type Mode = 'learn' | 'leap' | 'retrieval' | 'quick' | 'preview' | 'practice' | 'support';

export interface LessonHooks {
  home(): void;
  next(): void;
  open(id: string, mode: Mode, from?: string): void;
  /** Lentopaja mission this lesson was opened from (recorded with every answer). */
  mission?: string;
  /** Label for the way out (default: back to the map). */
  homeLabel?: string;
  /** Fast route: open straight on the first task (a guided one, so help is right there). */
  fast?: boolean;
}

const QUIET_MS = 3 * 3600e3;
const PRACTICE = 5;
const PRAISE = ['Oikein!', 'Hienoa!', 'Juuri niin!', 'Mahtavaa!', 'Hyvä!'];

/** Runs one lesson. `from`: in a support detour, the topic to return to. */
export function lesson(root: HTMLElement, id: string, startMode: Mode, hooks: LessonHooks, from?: string) {
  let mode = startMode;
  const spec: NodeSpec = NODES[id]!;
  const back = from ? NODES[from] : undefined;
  const lab = chapterOf(id).world !== 'ranta' || mode === 'quick';
  const demoRng = rng(newSeed());
  let cleanup: (() => void) | void;
  // A scene is painted while frame()'s arguments are built, before frame()
  // clears the previous screen, so it waits here until frame() adopts it.
  let painted: (() => void) | void;
  let wrongRun = 0;
  let quickWrong = 0;
  let sawDemo = false;
  /** How the learner entered: 'direct' = "Osaan jo" without the example. */
  let entry: 'demo' | 'direct' | 'start' = 'start';
  let helpedShown = store.lit(id);
  const wasKnown = store.known(id);
  let practiceLeft = 0, practiceOk = 0;

  function frame(sayText: string, ...body: (Node | null)[]) {
    cleanup?.();
    cleanup = painted;
    painted = undefined;
    const st = store.state(id);
    const dots = (mode === 'learn' || mode === 'leap' || mode === 'support') && !st.checked
      ? h('div', { class: 'progress', 'aria-label': `Edistyminen ${Math.min(st.streak, RULES.streak)}/${RULES.streak}` },
        ...Array.from({ length: RULES.streak }, (_, i) => h('i', { class: i < st.streak ? 'on' : '' })),
        h('i', { class: `t${st.transfer > 0 ? ' on' : ''}` }))
      : null;
    root.replaceChildren(h('div', { class: `stack${lab ? ' lab' : ''}` },
      h('div', { class: 'top' },
        h('button', { class: 'icon-btn', 'aria-label': hooks.homeLabel ?? 'Kartalle', html: ICON.back, onclick: () => { hush(); cleanup?.(); hooks.home(); } }),
        h('div', { class: 'title' }, `${spec.icon} ${spec.stop}`),
        dots,
        !hasFinnish() ? null : h('button', {
          class: `icon-btn quiet-btn${quiet() ? ' on' : ''}`, 'aria-pressed': String(quiet()),
          'aria-label': quiet() ? 'Hiljainen tila päällä. Paina, niin ääni palaa.' : 'En voi nyt kuunnella',
          html: quiet() ? ICON.mute : ICON.speaker,
          onclick: () => setQuiet(!store.quiet()),
        })),
      back ? h('div', { class: 'detour' },
        h('span', {}, `🧭 Tukiretki. Sitten palataan: ${back.icon} ${back.stop}`),
        h('button', { type: 'button', class: 'linklike small', onclick: () => { hush(); cleanup?.(); hooks.open(from!, 'learn'); } }, 'Palaa nyt')) : null,
      h('div', { class: 'say' },
        hasFinnish() ? h('button', { class: 'icon-btn speak', 'aria-label': 'Kuuntele ohje', html: ICON.speaker, onclick: () => say(sayText, true) }) : null,
        h('p', {}, sayText)),
      ...body));
    say(sayText);
  }

  function scene(paint?: Item['scene']) {
    const el = h('div', { class: 'scene' });
    if (paint) painted = paint(el);
    return el;
  }

  // The goal card carries the objective; keep the spoken intro free of a repeat.
  const intro = spec.goal && spec.intro.includes(spec.goal) ? spec.intro.replace(spec.goal, '').trim() : spec.intro;
  const goal = () => h('p', { class: 'goal' }, h('b', {}, '🎯 Tavoite: '), spec.goal ?? '');

  // Quiet mode toggled mid-lesson: redraw the current screen in the new mode.
  let redraw = () => start();
  function setQuiet(on: boolean) {
    hush();
    store.update((s) => { s.quietUntil = on ? Date.now() + QUIET_MS : 0; });
    redraw();
  }

  /** "Later": recorded as deferred, never as a pass. The place stays open on the map. */
  function defer() {
    hush();
    store.log({ type: 'defer', node: id });
    cleanup?.();
    hooks.home();
  }
  const laterBtn = () => btn('', 'Myöhemmin', defer, 'wide');

  // ---- start
  function start() {
    redraw = start;
    if (mode === 'retrieval') {
      frame(`Muistatko vielä? ${intro}`, goal(),
        btn(ICON.next, 'Aloita', () => item('retrieval'), 'primary big wide'), laterBtn());
      return;
    }
    if (mode === 'quick') {
      frame(`Pikatarkistus: ${spec.stop}. Kaksi oikein peräkkäin riittää.`, goal(),
        btn(ICON.next, 'Aloita', () => item('independent'), 'primary big wide'),
        btn(ICON.eye, 'Näytä ensin esimerkki', () => { mode = 'learn'; demo(0); }, 'big wide'), laterBtn());
      return;
    }
    if (mode === 'preview') {
      frame(intro, goal(), h('p', { class: 'muted' }, 'Tämä paikka on vielä polun takana. Voit katsoa esimerkin.'),
        btn(ICON.eye, 'Katso esimerkki', () => demo(0), 'primary big wide'));
      return;
    }
    if (mode === 'practice') {
      frame(`Harjoitellaan lisää: ${spec.stop}. Tulossa ${PRACTICE} tehtävää.`, goal(),
        btn(ICON.next, 'Aloita harjoitus', () => practice(), 'primary big wide'),
        btn(ICON.eye, 'Katso ensin esimerkki', () => demo(0), 'big wide'));
      return;
    }
    const skipped = ancestors(id).filter((a) => !store.known(a)).length;
    frame(intro,
      goal(),
      mode === 'leap' && skipped ? h('p', { class: 'hint' }, '🦘 Hyppy! Kokeile rohkeasti. Jos tämä tuntuu vaikealta, voit palata polulle.') : null,
      h('div', { class: 'scene', html: svg(220, 90, frog(70, 50, 30) + duck(160, 48, 24)) }),
      btn(ICON.eye, 'Näytä ensin', () => { entry = 'demo'; demo(0); }, 'primary big wide'),
      btn(ICON.bolt, 'Osaan jo', () => { entry = 'direct'; next(); }, 'big wide'),
      laterBtn());
  }

  // ---- worked example
  const steps = spec.demo(demoRng);
  function demo(i: number) {
    redraw = () => demo(i);
    sawDemo = true;
    const s = steps[i]!;
    const last = i === steps.length - 1;
    frame(s.say, scene(s.scene), btn(ICON.next, last ? (mode === 'preview' ? 'Takaisin kartalle' : 'Kokeile itse') : 'Seuraava', () => {
      if (!last) demo(i + 1);
      else if (mode === 'preview') hooks.home();
      else if (mode === 'practice') practice();
      else item('guided', 1);
    }, 'primary big wide'));
  }

  // ---- what next?
  function next() {
    const st = store.state(id);
    if (st.checked) return reward();
    // Practising with help lit the place: say so honestly, once.
    if (!helpedShown && store.lit(id)) { helpedShown = true; return helpedBeat(); }
    const transfer = st.streak >= RULES.streak && st.tags >= RULES.distinctTags;
    item(transfer ? 'transfer' : 'independent');
  }

  function helpedBeat() {
    redraw = helpedBeat;
    frame('Paikka alkaa loistaa, koska harjoittelit sitä avun kanssa. Kokeile nyt itse, niin saat tähden.',
      h('div', { class: 'reward stack' }, h('div', { class: 'helped-mark', 'aria-hidden': 'true' }, '🤝'), news()),
      back ? btn(ICON.back, `Palaa: ${back.icon} ${back.stop}`, () => { hush(); cleanup?.(); hooks.open(from!, 'learn'); }, 'primary big wide') : null,
      btn(ICON.next, 'Kokeilen itse', () => next(), back ? 'big wide' : 'primary big wide'),
      btn('', hooks.homeLabel ?? 'Kartalle', () => hooks.home(), 'big wide'));
  }

  // ---- practice: a fixed number of fresh tasks, then a summary
  function practice() {
    mode = 'practice';
    practiceLeft = PRACTICE; practiceOk = 0;
    practiceStep();
  }
  function practiceStep() {
    if (practiceLeft <= 0) return practiceDone();
    practiceLeft--;
    item(practiceLeft === 0 ? 'transfer' : 'independent');
  }
  function practiceDone() {
    redraw = practiceDone;
    const st = store.state(id);
    frame(`Harjoitus valmis: ${practiceOk}/${PRACTICE} oikein.`,
      h('div', { class: 'reward stack' },
        h('div', { class: 'score' }, `${practiceOk}/${PRACTICE}`),
        st.difficulty ? h('p', { class: 'small' }, 'Tässä oli vielä vähän vaikeaa. Se näkyy kartalla huutomerkkinä, kunnes menee taas sujuvasti.') : h('p', { class: 'small' }, 'Hyvin sujui!'),
        news()),
      btn(ICON.replay, 'Harjoittele vielä', () => practice(), 'big wide'),
      btn(ICON.next, 'Seuraava paikka', () => hooks.next(), 'primary big wide'),
      btn('', hooks.homeLabel ?? 'Kartalle', () => hooks.home(), 'big wide'));
  }

  // ---- one task. guidedLeft: how many guided tasks remain after this one.
  function draw(phase: Phase, fixedSeed?: number): { it: Item; seed: number } {
    const p = phase === 'retrieval' ? 'independent' : phase;
    if (fixedSeed !== undefined) return { it: spec.item(rng(fixedSeed), p), seed: fixedSeed };
    let seed = newSeed();
    let it = spec.item(rng(seed), p);
    if (!quiet()) return { it, seed };
    // Quiet mode: avoid listening tasks, unless one is needed to cover a second case.
    const st = store.state(id);
    const needCase = !st.checked && st.streak >= RULES.streak - 1 && st.tags < RULES.distinctTags;
    for (let i = 0; i < 12 && it.listen && !needCase; i++) { seed = newSeed(); it = spec.item(rng(seed), p); }
    return { it, seed };
  }

  /** sameSeed: show the same task again (after a procedure-only miss). */
  function item(phase: Phase, guidedLeft = 0, retry = false, sameSeed?: number) {
    redraw = () => item(phase, guidedLeft, retry, sameSeed);
    const { it, seed } = draw(phase, sameSeed);
    const guided = phase === 'guided';
    const feedback = h('div', {});
    const area = h('div', { class: 'stack' });
    const q = quiet();
    const showHint = guided && !!it.hint;
    const confusing = h('button', {
      type: 'button', class: 'linklike small confusing',
      onclick: () => {
        store.log({ type: 'confusing', node: id, seed, text: `${phase}/${it.tag}` });
        confusing.textContent = 'Kiitos! Aikuinen näkee tämän.';
        confusing.setAttribute('disabled', '');
      },
    }, '🤔 Tämä oli hämmentävää');
    frame(q && it.listen ? it.listen.say : it.say,
      it.listen && !q ? btn(ICON.mute, 'En voi nyt kuunnella', () => setQuiet(true), 'small-btn') : null,
      phase === 'transfer' ? h('p', { class: 'hint' }, '✨ Uusi tilanne') : null,
      it.scene ? scene(it.scene) : null,
      showHint ? h('p', { class: 'hint' }, it.hint!) : null,
      area, feedback, confusing);
    // Development builds only: browser QA answers through the same path as a tap.
    if (import.meta.env.DEV) (window as unknown as { __qa: unknown }).__qa = { id, phase, seed, tag: it.tag, answer: (ok: boolean) => onResp(ok ? solution(it.task) : wrongs(it.task)[0]!) };
    const onResp = (resp: Response) => {
      const v = check(it.task, resp);
      const recPhase: AttemptPhase = mode === 'quick' ? 'quick' : mode === 'practice' ? 'practice' : phase;
      const help: Help[] = [];
      if (guided && sawDemo) help.push('demo');
      if (showHint) help.push('hint');
      if (retry) help.push('retry');
      if (from) help.push('support');
      if (it.task.kind === 'tapcount' && it.task.words) help.push('words');
      store.record({
        node: id, phase: recPhase, ok: v.ok, tag: it.tag, seed, rev: revOf(id),
        resp: JSON.stringify(resp).slice(0, 400),
        ...(it.scn ? { scn: scnOf(it) } : {}),
        ...(hooks.mission ? { mission: hooks.mission } : {}),
        ...(help.length ? { help } : {}),
        ...(v.math !== undefined ? { math: v.math } : {}),
        ...(v.proc !== undefined ? { proc: v.proc } : {}),
        ...(sameSeed !== undefined ? { replay: true } : {}),
        mode: mode === 'learn' && entry === 'direct' ? 'direct' : mode,
        ...(from ? { from } : {}),
      });
      if (!v.ok && v.math === true && v.proc === false) {
        // Right total, marking practice not finished: acknowledged, never a mathematical miss.
        // Neutral for the evidence; the same task comes back so the marking can be finished.
        w.reveal();
        feedback.replaceChildren(h('div', { class: 'feedback note' },
          h('p', {}, h('b', {}, 'Lukumäärä on oikein! '), (v.why ?? '').replace(/^Lukumäärä \d+ on oikein\. /, '')),
          btn(ICON.replay, 'Merkitse uudelleen', () => item(phase, guidedLeft, retry, seed), 'primary big wide'),
          btn(ICON.next, 'Seuraava tehtävä', () => (guided ? item('guided', guidedLeft, retry) : mode === 'practice' ? practiceStep() : next()), 'big wide')));
        say(`Lukumäärä on oikein! ${v.why ?? ''}`, false, true);
        requestAnimationFrame(() => feedback.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }));
        return;
      }
      if (v.ok) {
        wrongRun = 0;
        if (mode === 'practice') practiceOk++;
        const p = PRAISE[seed % PRAISE.length]!;
        feedback.replaceChildren(h('div', { class: 'feedback ok' }, h('div', { class: 'art', html: svg(80, 70, frog(40, 38, 22)) }), h('p', {}, h('b', {}, p))));
        say(p, false, true);
        wait(1100).then(() => {
          if (!feedback.isConnected) return;
          if (guided) return guidedLeft > 0 ? item('guided', guidedLeft - 1, retry) : next();
          if (mode === 'retrieval') return reward();
          if (mode === 'practice') return practiceStep();
          if (mode === 'quick') return store.checked(id) ? reward() : item('independent');
          next();
        });
      } else {
        w.reveal();
        const why = v.why ? `${v.why}\n` : '';
        const msg = `${why}${it.explain}`;
        const box = h('div', { class: 'feedback bad' }, h('p', {}, h('b', {}, 'Katsotaan yhdessä. '), msg));
        if (guided) {
          // Repeated difficulty, even with help: offer a choice instead of looping.
          wrongRun++;
          if (wrongRun >= 2) box.append(...stuck(it.tag));
          else box.append(btn(ICON.next, 'Jatka', () => item('guided', guidedLeft, retry), 'primary big wide'));
        }
        else if (mode === 'quick') {
          quickWrong++;
          if (quickWrong >= 2) {
            box.append(h('p', { class: 'small' }, 'Tämä ei ollutkaan pikatarkistus. Opetellaan se rauhassa esimerkin kanssa.'),
              btn(ICON.next, 'Katso esimerkki', () => { mode = 'learn'; entry = 'demo'; demo(0); }, 'primary big wide'), laterBtn());
          } else box.append(btn(ICON.next, 'Jatka', () => item('independent'), 'primary big wide'));
        } else if (mode === 'retrieval') {
          // A failed recall stays visible. Practising now is offered, never forced, and
          // practising right away is not a new recall: retention needs another pause.
          box.append(h('p', { class: 'small' }, 'Tämä oli unohtunut vähän. Se on ihan tavallista. Harjoitellaan, niin kysyn tätä taas myöhemmin.'),
            btn(ICON.replay, 'Harjoittele nyt', () => practice(), 'primary big wide'),
            laterBtn());
        } else if (mode === 'practice') {
          box.append(btn(ICON.next, 'Jatka', () => practiceStep(), 'primary big wide'));
        } else {
          wrongRun++;
          if (wrongRun >= 2) box.append(...stuck(it.tag));
          else box.append(btn(ICON.next, 'Jatka', () => next(), 'primary big wide'));
        }
        feedback.replaceChildren(box);
        say(msg, false, true);
      }
      // Feedback can land below the fold on a phone: bring it into view.
      requestAnimationFrame(() => feedback.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' }));
    };
    const w = mount(it.task, area, onResp);
  }

  /** Two misses in a row: the learner chooses. Nothing is forced. */
  function stuck(tag: string): Node[] {
    const sups = supportFor(id, tag);
    return [
      h('p', { class: 'small' }, 'Tämä on vielä vaikea. Mitä tehdään?'),
      btn(ICON.replay, 'Yritä uudelleen avun kanssa', () => { wrongRun = 0; item('guided', 1, true); }, 'primary big wide'),
      ...sups.map((sup) => {
        const s = NODES[sup]!;
        return btn(ICON.next, `Kertaa avuksi: ${s.icon} ${s.stop}`, () => {
          hush();
          store.log({ type: 'support', node: sup, text: `${id}/${tag}` });
          cleanup?.();
          hooks.open(sup, 'support', id);
        }, 'big wide');
      }),
      laterBtn(),
    ];
  }

  /** Story beat after a first success: which places opened, and whether a chapter is done. */
  function news() {
    const w = store.get().world;
    if (wasKnown || !w || !store.known(id)) return null;
    const chs = chaptersFor(w), ids = chs.flatMap((c) => c.nodes);
    const opened = dependents(id).filter((d) => ids.includes(d) && !store.known(d) && isUnlocked(d, store.known));
    const ch = chapterIn(w, id);
    const done = ch && ch.nodes.every(store.known);
    const after = done ? chs.find((c) => c.nodes.some((n) => !store.known(n))) : undefined;
    if (!opened.length && !done) return null;
    return h('div', { class: 'news card' },
      done ? h('p', {}, h('b', {}, `🏁 ${ch.name} valmis!`), PRIZES[ch.id] ? ` Löysit: ${PRIZES[ch.id]!.icon} ${PRIZES[ch.id]!.name}. Se jää reppuun.` : '') : null,
      done ? h('p', {}, after ? `Seuraavaksi ${after.name}: ${after.story}` : worldInfo(w).finale) : null,
      opened.length ? h('p', {}, h('b', {}, opened.length === 1 ? 'Uusi paikka aukesi: ' : 'Uusia paikkoja aukesi: '),
        opened.map((d) => `${NODES[d]!.icon} ${NODES[d]!.stop}`).join(', ')) : null);
  }

  function reward() {
    redraw = reward;
    const st = store.state(id);
    const recalled = mode === 'retrieval' && st.retained !== undefined;
    // Honest inference: only all_of ancestors whose inference comes from this place.
    const inferred = startMode === 'leap' ? ancestors(id).filter((a) => !store.lit(a) && store.inferredFrom(a).includes(id)).length : 0;
    hush();
    const text = recalled ? 'Muistit! Tämä taito on nyt vahva.'
      : inferred ? `${spec.reward} Koska osasit tämän, ${inferred === 1 ? 'yksi ohitettu paikka merkitään päätellyksi' : `${inferred} ohitettua paikkaa merkitään päätellyiksi`} ☆. Niitä ei tarkistettu erikseen.`
        : spec.reward;
    frame(text,
      h('div', { class: 'reward stack' },
        h('div', { class: 'stars' }, h('span', { html: ICON.star }), recalled ? h('span', { html: ICON.star }) : null),
        h('div', { html: svg(200, 90, frog(60, 48, 28) + duck(150, 46, 24)) }),
        news(),
        !recalled && !st.quick && st.retained === undefined ? h('p', { class: 'muted small' }, 'Palataan tähän huomenna: muistatko vielä?') : null),
      back ? btn(ICON.back, `Palaa: ${back.icon} ${back.stop}`, () => hooks.open(from!, 'learn'), 'primary big wide') : null,
      btn(ICON.next, 'Seuraava paikka', () => hooks.next(), back ? 'big wide' : 'primary big wide'),
      btn('', hooks.homeLabel ?? 'Kartalle', () => hooks.home(), 'big wide'));
  }

  // Fast route: the first task straight away; the example and "Osaan jo" stay a tap away on the map.
  if (hooks.fast && (mode === 'learn' || mode === 'leap') && !store.state(id).checked) item('guided', 1);
  else if (hooks.fast && mode === 'quick') item('independent');
  else start();
}
