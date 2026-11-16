import './book.css';
import { h } from './dom';
import { say, labelOf } from './speech';
import { compactPlay } from './compact-play';
import { mount, type Widget } from './widgets';
import { check } from '../engine/check';
import { fmt } from '../content/fi';
import type { DemoStep, Item, NodeSpec, Paint, Response, Verdict } from '../engine/types';
import type { Beat, BookPage, BookStage, Try } from '../book/types';
import { splitText } from '../book/default-page';
import { progression } from './progression';

/** What the Saaristo shell lends to the theory-book player. */
export interface BookContext {
  contents: HTMLElement;
  worldHost: HTMLElement;
  root: HTMLElement;
  assets: (path: string) => string;
  reducedMotion: () => boolean;
  /** Makes `id` the current node (world family, state) and returns its spec. */
  enter(id: string): NodeSpec | undefined;
  page(spec: NodeSpec): BookPage;
  familyTitle(id: string): string;
  /** 'demo' while explaining, 'task' while a try is open, 'result' after the answer. */
  setMode(mode: 'demo' | 'task' | 'result'): void;
  setModel(step: Item | DemoStep | undefined, revealed: boolean): void;
  paint(scene: Paint | undefined, host: HTMLElement): void;
  layout(): void;
  usedSeeds(spec: NodeSpec): Set<number>;
  record(spec: NodeSpec, attempt: Try, response: Response, verdict: Verdict): void;
  /** Marks the node passed and returns the next node of the story. */
  advance(spec: NodeSpec): string | undefined;
  hashFor(id: string): string;
  /** Loikka hops and Aava flies to the next spot. */
  travel(): void;
  /** Hides and pauses the pond while an authored stage is shown. */
  coverWorld(covered: boolean): void;
  onChange(): void;
}

export interface BookPlayer {
  open(id: string): void;
  snapshot(): Record<string, unknown> | null;
  dispose(): void;
}

const NEXT = 'Eteenpäin';
/**
 * What a picture can drop after the answer when the feedback would not fit otherwise, in order:
 * first the worked-solution boxes that some scenes add (the feedback says the same),
 * then a motion scene's track and status line (the graphs keep the answer).
 */
const AFTER_ANSWER = ['[data-atomic-worked],[data-logic-worked-model],[data-solution-worked]', '.motion-track,.motion-read,.motion-status'];

/** Buttons that start with these words do something; in a solved picture they are left out. */
const ACTION_WORD = /^(peru|poista|lisää|lukitse|mittaa|aja|avaa|tarkista|palauta|tyhjennä|kokeile|nollaa|kirjaa|tallenna|näytä|piilota|vaihda|jaa|käännä|siirrä|aloita|valmis|vahvista|merkitse|aseta|laske|pyöräytä|heitä|nosta|sekoita|uusi|seuraava|edellinen)(\s|$)/i;
/** A line that tells what to do ("Valitse jonosta…"): in a solved picture there is nothing left to do. */
const INSTRUCTION = /^(valitse|paina|kirjoita|siirrä|merkitse|aseta|vedä|napauta|täydennä|järjestä|rakenna|syötä|klikkaa)\s/i;

export function createBookPlayer(ctx: BookContext): BookPlayer {
  let spec: NodeSpec | undefined, page: BookPage | undefined;
  let step = 0, steps: ('beat' | 'try')[] = [];
  let tries: (Try | undefined)[] = [], attempt: Try | undefined, widget: Widget | undefined, answered = false, lastOk: boolean | undefined, chosen: number | undefined;
  let stage: BookStage | undefined, stageHost: HTMLElement | undefined, leaving = 0, disposed = false;
  let desk: HTMLElement | undefined, pendingDeparture = false;
  let cueWatch: ResizeObserver | undefined;
  let cueContentWatch: MutationObserver | undefined, cueFrame = 0;
  const auto = progression();
  let scheduled: (() => void) | undefined;
  function cancelDeparture() { if (leaving) { clearTimeout(leaving); leaving = 0; desk?.classList.remove('book-leaving'); } pendingDeparture = false; }
  function hold() { auto.pause(); if (leaving) { clearTimeout(leaving); leaving = 0; } desk?.classList.remove('book-leaving'); updatePause(); }
  function updatePause() {
    const button = desk?.querySelector<HTMLButtonElement>('.book-pause');
    if (button) { button.setAttribute('aria-label', auto.paused ? 'Jatka automaattista etenemistä' : 'Keskeytä automaattinen eteneminen'); button.title = button.getAttribute('aria-label')!; button.textContent = auto.paused ? '▶' : 'Ⅱ'; }
  }
  function schedule(text: string, kind: 'beat' | 'correct' | 'wrong', playback: ReturnType<typeof say>) {
    scheduled = () => auto.schedule(text, kind, playback, () => go(1));
    if (document.hidden || ctx.contents.inert) hold();
    if (!auto.paused) scheduled();
  }
  const visibility = () => { if (document.hidden) hold(); };
  document.addEventListener('visibilitychange', visibility);
  const inertWatch = new MutationObserver(() => { if (ctx.contents.inert) hold(); });
  inertWatch.observe(ctx.contents, { attributes: true, attributeFilter: ['inert'] });
  const hiddenForFit = new Map<HTMLElement, string>();
  let fitted: { main: HTMLElement; figure: HTMLElement; parts: HTMLElement[] } | undefined, fitFrame = 0;
  const fitWatch = typeof ResizeObserver === 'function' ? new ResizeObserver(() => refit()) : undefined;

  /**
   * Pictures may shrink to fit; answer text and touch targets retain their authored size.
   * If content still needs room, it scrolls rather than scaling the learner controls.
   */
  function fitFigure(main: HTMLElement, figure: HTMLElement, task?: HTMLElement) {
    fitted = { main, figure, parts: [figure, task].filter((part): part is HTMLElement => !!part?.isConnected) };
    fitWatch?.disconnect();
    fitWatch?.observe(main);
    // Every block of the page, not just the shrinkable parts: the feedback grows after the answer too.
    for (const block of main.children) fitWatch?.observe(block);
    main.addEventListener('toggle', refit, true);
    refit();
  }
  function refit() {
    if (fitFrame) return;
    fitFrame = requestAnimationFrame(() => {
      fitFrame = 0;
      if (!fitted?.main.isConnected) return;
      const { main, figure, parts } = fitted;
      const over = () => main.scrollHeight - main.clientHeight;
      // Reconsider every tier on resize or feedback toggle, preserving any original inline style.
      for (const [box, display] of hiddenForFit) box.style.display = display;
      hiddenForFit.clear();
      // Measured at full size; a part never shrinks under the text that follows it.
      for (const part of parts) { part.style.zoom = ''; part.style.flexShrink = '0'; }
      const hasControls = figure?.querySelector('button:not(:disabled),input:not(:disabled),select:not(:disabled)');
      const order: [HTMLElement | undefined, number][] = [[figure, hasControls ? 1 : 0.75]];
      const shrink = () => {
        for (const [part, least] of order) {
          if (!part || over() <= 1) continue;
          part.style.zoom = String(least);
          if (over() > 1) continue;
          // A grid re-flows when zoomed, so the size is searched, not computed.
          let low = least, high = 1;
          for (let n = 0; n < 6; n++) {
            const mid = (low + high) / 2;
            part.style.zoom = String(mid);
            if (over() > 1) high = mid; else low = mid;
          }
          part.style.zoom = String(Math.floor(low * 1000) / 1000);
        }
      };
      shrink();
      // Still too tall after the answer: parts of the picture that the feedback replaces go, one tier at a time.
      for (const tier of AFTER_ANSWER) {
        const extra = answered && over() > 1 ? figure?.querySelectorAll<HTMLElement>(tier) : undefined;
        if (!extra?.length) continue;
        extra.forEach(box => { hiddenForFit.set(box, box.style.display); box.style.display = 'none'; });
        for (const part of parts) part.style.zoom = '';
        shrink();
      }
    });
  }

  function mountStage() {
    unmountStage();
    if (!page?.stage) { ctx.coverWorld(false); return; }
    stageHost = h('div', { class: 'book-stage' });
    ctx.worldHost.append(stageHost);
    try {
      stage = page.stage(stageHost, { assets: ctx.assets, reducedMotion: ctx.reducedMotion() });
    } catch (error) {
      // No WebGL: the page still reads, and tries fall back to their option buttons.
      console.warn('book stage', error);
      stageHost.remove(); stageHost = undefined;
      ctx.coverWorld(false);
      return;
    }
    ctx.coverWorld(true);
  }
  function unmountStage() {
    stage?.dispose(); stage = undefined; stageHost?.remove(); stageHost = undefined;
  }

  function freshTry(part: number): Try | undefined {
    if (!spec || !page?.makeTry) return undefined;
    const used = ctx.usedSeeds(spec);
    let seed = (Date.now() % 1e9) >>> 0;
    const qa = new URLSearchParams(location.search);
    if (qa.get('qa') === '1' && /^\d+$/.test(qa.get('seed') ?? '')) seed = Number(qa.get('seed'));
    for (let n = 0; n < 12; n++, seed += 7919) {
      if (used.has(seed)) continue;
      const made = page.makeTry(seed, part);
      if (made) return made;
    }
    return page.makeTry(seed, part);
  }

  function open(id: string) {
    if (disposed) return;
    auto.cancel(); scheduled = undefined; cancelDeparture();
    const next = ctx.enter(id);
    if (!next) return;
    spec = next; page = ctx.page(next);
    mountStage();
    tries = Array.from({ length: page.makeTry ? page.tries ?? 1 : 0 }, (_, part) => freshTry(part)).filter(Boolean);
    attempt = tries[0];
    steps = [...page.beats.map(() => 'beat' as const), ...tries.map(() => 'try' as const)];
    step = 0;
    render(true);
  }

  function shell(): { main: HTMLElement; nav: HTMLElement } {
    cueWatch?.disconnect(); cueWatch = undefined; cueContentWatch?.disconnect(); cueContentWatch = undefined;
    cancelAnimationFrame(cueFrame); cueFrame = 0;
    const dots = h('ol', { class: 'book-dots', 'aria-label': `Kohta ${step + 1} / ${steps.length}` },
      ...steps.map((kind, i) => h('li', { class: `${kind}${i === step ? ' now' : i < step ? ' done' : ''}`, 'aria-hidden': 'true' })));
    const main = h('div', { class: 'book-main' });
    const nav = h('footer', { class: 'book-nav' });
    desk = h('section', { class: 'exp-desk book-desk', 'aria-label': 'Teoriakirja', 'data-book-id': spec!.id, 'data-book-step': steps[step] ?? 'beat' },
      h('div', { class: 'book-top' }, h('span', { class: 'book-kicker' }, ctx.familyTitle(spec!.id)), dots),
      h('h1', { tabindex: '-1' }, page?.title ?? spec!.stop), main, nav);
    desk.addEventListener('click', event => { if (event.isTrusted && (steps[step] === 'beat' || answered) && (event.target as HTMLElement).closest('.book-figure .listen,.book-figure .motion-ctl,.book-context .listen')) hold(); }, true);
    ctx.contents.replaceChildren(desk);
    ctx.layout();
    return { main, nav };
  }

  function navButtons(nav: HTMLElement, text: string, primary: boolean) {
    const back = h('button', { class: 'book-icon', type: 'button', 'aria-label': 'Edellinen kohta', title: 'Edellinen kohta', disabled: step === 0, onclick: () => go(-1) }, '←');
    const listen = h('button', { class: 'book-icon', type: 'button', 'aria-label': 'Kuuntele', title: 'Kuuntele', onclick: () => { auto.cancel(); cancelDeparture(); const playback = say(text, true); if (steps[step] === 'beat' || answered) schedule(text, steps[step] === 'beat' ? 'beat' : lastOk ? 'correct' : 'wrong', playback); } }, '🔊');
    const pause = h('button', { class: 'book-icon book-pause', type: 'button', onclick: () => { if (auto.paused) { auto.resume(); updatePause(); if (pendingDeparture) startDeparture(); else scheduled?.(); } else hold(); } }, 'Ⅱ');
    const forward = h('button', { class: primary ? 'exp-primary book-next' : 'exp-secondary book-next book-skip', type: 'button', onclick: () => go(1) },
      primary ? NEXT : 'Ohita', h('span', { 'aria-hidden': 'true' }, '→'));
    nav.replaceChildren(back, listen, pause, h('span', { class: 'book-spacer' }), forward);
    updatePause();
    return forward;
  }

  function render(arriving = false) {
    if (!spec || !page) return;
    const kind = steps[step];
    if (kind === 'try') return renderTry(arriving);
    const beat = page.beats[step]!;
    ctx.setMode('demo');
    const { main, nav } = shell();
    if (arriving) desk!.classList.add('book-arrive');
    if (beat.example) main.append(h('p', { class: 'book-example' }, h('span', {}, 'Esimerkki'), beat.example));
    main.append(h('p', { class: 'book-text' }, beat.text));
    if (beat.more) main.append(h('details', { class: 'book-more' }, h('summary', {}, 'Lisää'), h('p', {}, beat.more)));
    ctx.setModel(beat.step, true);
    if (beat.scene) {
      const figure = h('div', { class: 'exp-exact book-figure' });
      main.append(figure);
      ctx.paint(beat.scene, figure);
      freeze(figure);
      fitFigure(main, figure);
    } else ctx.paint(undefined, main);
    if (beat.view) stage?.show(beat.view);
    const forward = navButtons(nav, [beat.example, beat.text].filter(Boolean).join(' '), true);
    const visibleText = [beat.example, beat.text].filter(Boolean).join(' ');
    const playback = compactPlay() ? say(visibleText) : say('', false);
    schedule(visibleText, 'beat', playback);
    main.querySelector('details')?.addEventListener('toggle', event => { if ((event.currentTarget as HTMLDetailsElement).open) hold(); });
    (arriving ? desk!.querySelector<HTMLElement>('h1') : forward)?.focus({ preventScroll: true });
    ctx.onChange();
  }

  /** Pictures in a beat are for looking: their controls do nothing and leave the tab order. */
  function freeze(host: HTMLElement) {
    for (const el of host.querySelectorAll<HTMLElement>('button,input,select,textarea,[tabindex],[role="button"]')) {
      // Playback, listening and viewpoint controls stay usable; answer controls do not.
      if (el.closest('.motion-ctl,.listen,.solid-views')) continue;
      if ('disabled' in el) (el as HTMLButtonElement).disabled = true;
      el.dataset.frozen = frozenKind(el);
      el.setAttribute('tabindex', '-1');
      el.setAttribute('aria-hidden', 'true');
    }
    if (!host.querySelector('[data-frozen]')) return;
    for (const el of host.querySelectorAll<HTMLElement>('p,b,strong,span,label,div,h3,h4')) {
      if (el.children.length || el.closest('.motion-ctl,.listen,.solid-views')) continue;
      const text = el.textContent?.trim() ?? '';
      if (text.length < 120 && INSTRUCTION.test(text)) el.dataset.frozen = 'action';
    }
  }

  /**
   * How the book draws a frozen control: an action button ("Peru", "+") is left out,
   * a card or a filled field reads as its value, an empty field as a blank.
   */
  function frozenKind(el: HTMLElement): string {
    if (el instanceof HTMLInputElement) {
      if (['checkbox', 'radio', 'range'].includes(el.type)) return '';
      // A whole number from a fraction model reads as a whole number: 9/1 → 9.
      el.value = el.value.replace(/^([−-]?\d+)\/1$/, '$1');
      return el.value ? '' : 'empty';
    }
    if (el instanceof HTMLButtonElement || el.getAttribute('role') === 'button') {
      const label = (el.textContent ?? '').trim();
      return label.length <= 2 || ACTION_WORD.test(label) ? 'action' : '';
    }
    return '';
  }

  function renderTry(arriving = false) {
    attempt = tries[step - (page?.beats.length ?? 0)];
    if (!spec || !attempt) return;
    const item = attempt.item;
    answered = false; lastOk = undefined; chosen = undefined;
    ctx.setMode('task');
    const { main, nav } = shell();
    if (arriving) desk!.classList.add('book-arrive');
    const figure = h('div', { class: 'exp-exact book-figure' });
    const task = h('div', { class: 'exp-task book-task', 'data-task-kind': item.task.kind });
    const feedback = h('div', { class: 'book-feedback', tabindex: '0', role: 'status', 'aria-live': 'polite' });
    const cue = h('span', { class: 'book-scroll-cue', id: 'book-scroll-cue', hidden: true }, 'Vieritä kysymystä alas ↓');
    const context = h('div', { class: 'book-context', tabindex: '0', 'aria-label': 'Kysymys ja kuva' },
      h('p', { class: 'book-q' }, h('span', { class: 'book-label' }, 'Kokeile', cue), item.say), figure);
    const updateCue = () => {
      const more = context.scrollHeight - context.clientHeight - context.scrollTop > 1;
      if (cue.hidden === more) cue.hidden = !more;
      if (more) context.setAttribute('aria-describedby', cue.id);
      else context.removeAttribute('aria-describedby');
    };
    context.addEventListener('scroll', updateCue, { passive: true });
    main.append(context, task, feedback);
    ctx.setModel(item, false);
    if (page!.tryFigure === false) figure.remove();
    else ctx.paint(item.scene, figure);
    widget = mount(item.task, task, response => submit(item, response, task, figure, feedback, nav));
    readableAxes(task);
    sameScale(figure, task);
    fitFigure(main, figure, task);
    cueWatch = typeof ResizeObserver === 'function' ? new ResizeObserver(updateCue) : undefined;
    cueWatch?.observe(context); cueWatch?.observe(main); cueWatch?.observe(figure);
    cueContentWatch = new MutationObserver(updateCue);
    cueContentWatch.observe(context, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['hidden', 'style', 'class'] });
    cueFrame = requestAnimationFrame(() => { cueFrame = 0; updateCue(); });
    if (attempt.view) {
      stage?.show(attempt.view);
      const owned = stage?.arm?.(attempt.view, index => {
        if (item.task.kind !== 'choice' || answered) return;
        const button = task.querySelectorAll<HTMLButtonElement>('.opt')[index];
        button?.classList.add(index === item.task.answer ? 'right' : 'wrong');
        submit(item, { kind: 'choice', index }, task, figure, feedback, nav);
      });
      // The 3D model is the control: the buttons stay for the keyboard (1–9) and screen readers.
      if (owned) task.classList.add('book-task-stage');
    }
    navButtons(nav, item.say, false);
    if (compactPlay()) say(item.say);
    if (arriving) desk!.querySelector<HTMLElement>('h1')?.focus({ preventScroll: true });
    else task.querySelector<HTMLElement>('button,input')?.focus({ preventScroll: true });
    ctx.onChange();
  }

  /** Small graph cards share a readable copy of their existing axis labels. No answer is added. */
  function readableAxes(task: HTMLElement) {
    const options = [...task.querySelectorAll<HTMLElement>('.opt')];
    const labels = options.map(option => [...new Set([...option.querySelectorAll('svg:has(polyline) text')]
      .map(text => text.textContent?.trim() ?? '').filter(text => /^[a-z]\s*\([^)]*\)$|^[xy]$/i.test(text)))].join(' · '));
    if (!labels.length || labels.some(label => !label)) return;
    if (labels.every(label => label === labels[0])) {
      task.prepend(h('p', { class: 'book-axes' }, 'Kuvaajien akselit: ', labels[0]!));
    } else {
      options.forEach((option, index) => option.append(h('span', { class: 'book-axes' }, labels[index]!)));
    }
  }

  /**
   * A question picture and option pictures drawn on the same canvas are shown at the same scale,
   * so "same size" in the picture means the same size on screen.
   */
  function sameScale(figure: HTMLElement, task: HTMLElement) {
    const target = figure.querySelector<SVGSVGElement>(':scope > svg[viewBox]');
    const option = task.querySelector<SVGSVGElement>('.opt svg[viewBox]');
    if (!target || !option || target.getAttribute('viewBox') !== option.getAttribute('viewBox')) return;
    const width = option.getBoundingClientRect().width, room = figure.clientWidth;
    // A share of the figure's width keeps the match when the desk is resized.
    if (width > 0 && room > 0) target.style.cssText += `;width:${(100 * width / room).toFixed(1)}%;height:auto;max-height:none;`;
  }

  function answerText(item: Item): string {
    const task = item.task;
    if (task.kind === 'choice') {
      const option = task.options[task.answer]!;
      // A picture option is named by its picture's own label, or by the green mark the book puts on it.
      const drawn = option.art?.match(/aria-label="([^"]{2,60})"|<title>([^<]{2,60})<\/title>/);
      return labelOf(option) || option.quiet || drawn?.[1] || drawn?.[2] || 'vihreä kortti';
    }
    if (task.kind === 'numeric') return `${task.label ? `${task.label} ` : ''}${fmt(task.answer).replace('-', '−')}${task.unit ? ` ${task.unit}` : ''}`;
    return '';
  }

  function submit(item: Item, response: Response, task: HTMLElement, figure: HTMLElement, feedback: HTMLElement, nav: HTMLElement) {
    if (!spec || !attempt || answered || disposed || attempt.item !== item) return;
    const verdict = check(item.task, response);
    if (verdict.pendingReview) return;
    answered = true; lastOk = verdict.ok;
    chosen = response.kind === 'choice' ? response.index : undefined;
    ctx.setMode('result');
    task.querySelectorAll<HTMLButtonElement | HTMLInputElement>('button,input').forEach(el => { el.disabled = true; });
    // A wrong number stays as the learner typed it, marked wrong: the feedback names the right one.
    // Other widgets show the right answer themselves.
    if (!verdict.ok && item.task.kind === 'numeric') task.querySelector<HTMLElement>('.display')?.classList.add('wrong');
    else if (!verdict.ok) widget?.reveal();
    ctx.record(spec, attempt, response, verdict);
    ctx.setModel(item, true);
    if (item.afterCorrect && figure.isConnected) ctx.paint(item.afterCorrect, figure);
    // A motion scene's controls hide after the answer, so the graphs show the whole run instead of an empty frame.
    else [...figure.querySelectorAll<HTMLButtonElement>('.motion-ctl button')].find(b => b.textContent?.includes('Näytä loppu'))?.click();
    if (item.task.kind === 'choice') stage?.reveal?.(attempt.view ?? '', item.task.answer, chosen ?? -1);
    // The answered cards remain inspectable with the picture, leaving the explanation room.
    task.parentElement?.querySelector('.book-context')?.append(task);
    const explain = splitText(page?.feedbackText?.(item.explain) ?? item.explain);
    // A wrong pick gets its own reason first; the general explanation waits behind "Lisää".
    const why = !verdict.ok && verdict.why ? (page?.feedbackText?.(verdict.why) ?? verdict.why) : '';
    const more = [why ? explain.text : '', explain.more ?? ''].filter(Boolean);
    feedback.dataset.ok = String(verdict.ok);
    feedback.replaceChildren(...[
      verdict.ok
        ? h('p', { class: 'book-verdict' }, h('span', { 'aria-hidden': 'true' }, '✓'), 'Oikein!')
        : h('p', { class: 'book-verdict' }, h('span', { 'aria-hidden': 'true' }, '↺'), h('span', {}, 'Oikea vastaus: ', h('b', {}, answerText(item)))),
      why ? h('p', { class: 'book-why' }, why) : h('p', { class: 'book-explain' }, explain.text),
      more.length ? h('details', { class: 'book-more' }, h('summary', {}, 'Lisää'), ...more.map(text => h('p', {}, text))) : null,
    ].filter((node): node is NonNullable<typeof node> => !!node));
    const spokenFeedback = `${verdict.ok ? 'Oikein!' : `Oikea vastaus: ${answerText(item)}.`} ${why || explain.text}`;
    const forward = navButtons(nav, spokenFeedback, true);
    // Replay stays beside Next even while the explanation or picture is scrolled.
    nav.insertBefore(h('button', { class: 'book-again', type: 'button', onclick: () => {
      auto.cancel(); scheduled = undefined; cancelDeparture();
      const part = step - page!.beats.length;
      tries[part] = freshTry(part) ?? tries[part];
      renderTry();
    } }, 'Toinen kysymys'), forward);
    const playback = say(spokenFeedback);
    schedule(spokenFeedback, verdict.ok ? 'correct' : 'wrong', playback);
    feedback.querySelector('details')?.addEventListener('toggle', event => { if ((event.currentTarget as HTMLDetailsElement).open) hold(); });
    refit();
    forward.focus({ preventScroll: true });
    ctx.onChange();
  }

  function startDeparture() {
    if (!spec || disposed || leaving) return;
    pendingDeparture = true;
    desk?.classList.add('book-leaving');
    ctx.travel();
    leaving = window.setTimeout(() => {
      leaving = 0;
      if (document.hidden || ctx.contents.inert) { hold(); return; }
      if (!pendingDeparture || disposed || !spec) return;
      pendingDeparture = false;
      // A completed departure is the only point at which the stop is recorded.
      const next = ctx.advance(spec);
      if (!next) { location.hash = 'saaristo/loppu'; return; }
      history.pushState(null, '', `#${ctx.hashFor(next)}`);
      open(next);
    }, ctx.reducedMotion() ? 0 : 620);
  }

  function go(delta: number) {
    if (!spec || disposed) return;
    const target = step + delta;
    if (target < 0) return;
    cancelDeparture();
    auto.cancel(); scheduled = undefined;
    if (target < steps.length) { step = target; render(); return; }
    startDeparture();
  }

  const keys = (event: KeyboardEvent) => {
    if (disposed || !desk?.isConnected || event.ctrlKey || event.metaKey || event.altKey) return;
    const target = event.target as HTMLElement;
    if (/INPUT|TEXTAREA|SELECT/.test(target.tagName) || target.closest('.exp-overlay,.exp-memory')) return;
    // A focused scrollport keeps native Space scrolling and nested control activation.
    if (event.key === ' ' && target.closest('.book-context,.book-feedback')) return;
    const inTry = steps[step] === 'try' && !answered;
    if (inTry && attempt?.item.task.kind === 'choice' && /^[1-9]$/.test(event.key)) {
      const button = desk.querySelectorAll<HTMLButtonElement>('.book-task .opt')[Number(event.key) - 1];
      if (button && !button.disabled) { event.preventDefault(); button.click(); }
      return;
    }
    if (inTry && attempt?.item.task.kind === 'numeric') return;
    const onButton = target.closest('button,a,summary');
    if (event.key === 'ArrowRight' || ((event.key === 'Enter' || event.key === ' ') && !onButton)) {
      if (inTry) return;
      event.preventDefault(); go(1);
    } else if (event.key === 'ArrowLeft') { event.preventDefault(); go(-1); }
  };
  window.addEventListener('keydown', keys);
  const onResize = () => stage?.resize();
  window.addEventListener('resize', onResize);

  return {
    open,
    snapshot: () => spec && page ? {
      page: spec.id, step, steps, kind: steps[step], answered, lastOk, chosen,
      beat: steps[step] === 'beat' ? page.beats[step]?.text : null,
      tryKind: attempt?.item.task.kind ?? null, authored: !!page.stage,
      ...(new URLSearchParams(location.search).get('qa') === '1' && attempt && (attempt.item.task.kind === 'choice' || attempt.item.task.kind === 'numeric')
        ? { qaAnswer: attempt.item.task.answer } : {}),
    } : null,
    dispose() {
      disposed = true; auto.dispose(); inertWatch.disconnect(); document.removeEventListener('visibilitychange', visibility); cancelDeparture(); unmountStage();
      fitWatch?.disconnect(); cancelAnimationFrame(fitFrame); fitted = undefined;
      cueWatch?.disconnect(); cueWatch = undefined;
      cueContentWatch?.disconnect(); cueContentWatch = undefined; cancelAnimationFrame(cueFrame);
      window.removeEventListener('keydown', keys); window.removeEventListener('resize', onResize);
    },
  };
}

export type { Beat };
