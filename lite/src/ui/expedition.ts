import { reactionLabScene, debugReactionLabScene } from '../content/scenes/reaction-lab';
import { matterCyclesScene } from '../content/models/matter-cycles-scene';
import { inquiryIslandsScene } from '../content/models/inquiry-islands-scene';
import { carbonKitchenScene } from '../content/models/carbon-kitchen-scene';
import { atomicWorldScene, debugAtomicWorldScene } from '../content/scenes/atomic-world';
import { wavesObservatoryScene } from '../content/models/waves-observatory';
import { logicWorkshopScene } from '../content/models/logic-workshop';
import { chemicalInvestigationScene } from '../content/models/chemical-investigation-scene';
import { physicsInvestigationScene } from '../content/models/physics-investigation';
import { materialsMixturesScene } from '../content/models/materials-mixtures-scene';
import { debugAdvancedSolidsScene } from '../content/models/advanced-solids';
import { advancedSolidsScene } from '../content/scenes/advanced-solids';
import { energyIslandsScene } from '../content/models/energy-islands';
import { circuitWorkshopScene } from '../content/models/circuit-workshop';
import { electricityHarborScene } from '../content/scenes/electricity-harbor';
import { statisticsHarborScene } from '../content/models/statistics-harbor-scene';
import { thermalScene } from '../content/scenes/thermal-station';
import { programmingFerryScene } from '../content/models/programming-ferries';
import { evaluateItemReadiness, type ItemReadinessResult } from '../engine/item-readiness';
import { resolveItemReadinessContext } from '../content/item-readiness-context';
import { measurementStationScene } from '../content/models/measurement-scene';
import { numberRouteScene } from '../content/models/number-route';
import { recordSolidConstruction } from '../content/models/solid-construction';
import './expedition.css';
import { h } from './dom';
import { say, hush } from './speech';
import { mount, type Widget } from './widgets';
import { adultReviewOn, setAdultReview } from './adult-review-setting';
import { hasAdultReview, withoutAdultReview } from '../content/adult-review';
import { mountSelfExplanation } from '../content/scenes/observed-explanations';
import { check } from '../engine/check';
import { CATALOG, FAMILIES, catalogNode, canEnter } from '../engine/catalog';
import { createJourney } from '../engine/journey';
import { itemIdentity } from '../engine/item-identity';
import { newSeed, rng } from '../engine/rng';
import { store as legacy } from '../engine/store';
import type { Help } from '../engine/evidence';
import type { DemoStep, Item, NodeSpec, Phase, Response } from '../engine/types';
import { EXPEDITION_NODES, EXPEDITION_EVIDENCE, SLICE_IDS, expeditionEvidenceLimit, expeditionRevision } from '../content/expedition';
import { type ExpeditionSceneModel } from '../content/expedition-slice';
import { cakeFactors, cakePartition } from '../content/fractions/cake-table';
import { mountSaaristo } from '../world/saaristo/main';
import { checkedFamilyLessonSnapshot } from '../content/models/family-lesson-snapshot';
import { FAMILY_IMPLEMENTED_EFFECT_IDS, mountFamilyWorlds } from '../world/family-worlds';
import { mountExpeditionStage, type StageModel } from '../world/expedition-stage';
import { mountAuthoredClimax, type ClimaxLessonModel } from '../world/authored-climax';
import { AUTHORED_CLIMAX_IDS, authoredClimaxes, hasAuthoredClimax } from '../content/authored-climaxes';
import { authoredClimaxPaint } from '../content/scenes/authored-climax';

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
  }
}

/** The new journey is deliberately isolated from the established 181 evidence stream.
 * Its title, catalog and settings make availability and observation limits inspectable. */
export function expedition(app: HTMLElement, requested?: string): () => void {
  const journey = createJourney();
  const assets = (name: string) => new URL(name, document.baseURI).href;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let disposed = false, userPaused = false, paused = reduced.matches, cleanupPaint: (() => void) | undefined;
  let modal: HTMLElement | null = null, cleanupModal: (() => void) | undefined;
  let spec: NodeSpec | undefined, item: Item | undefined, model: StageModel | undefined;
  let phase: Phase = 'guided', seed = 0, answered = false, lastOk: boolean | undefined;
  let help: Help[] = [], widget: Widget | undefined, demoIndex = 0, demos: DemoStep[] = [];
  // Solo play (adult review off): attached adult reviews are left out, pure explanations become a self-check.
  let reviewSkipped = false, selfCheck = false;
  const solo = (next: Item): Item => adultReviewOn() ? next : { ...next, task: withoutAdultReview(next.task) };
  const selfCheckNode = (node: NodeSpec) => !adultReviewOn() && node.item(rng(0), 'guided').task.kind === 'observed-explanation';
  let mode: 'home' | 'intro' | 'demo' | 'task' | 'result' = 'home';
  const session = `journey-${Date.now().toString(36)}-${newSeed()}`;
  const params = new URLSearchParams(location.search);
  const qaSeed = params.get('seed');
  let deterministicSeed = params.get('qa') === '1' && qaSeed && /^\d+$/.test(qaSeed)
    && Number(qaSeed) <= 0xffffffff ? Number(qaSeed) : undefined;
  const takeSeed = () => {
    if (deterministicSeed === undefined) return newSeed();
    const current = deterministicSeed;
    deterministicSeed = (current + 1) >>> 0;
    return current;
  };
  const observe = (node: NodeSpec) => journey.observation(node.id, node, EXPEDITION_EVIDENCE[node.id]?.families);
  const knownChecked = (id: string) => legacy.checked(id) || (!!EXPEDITION_NODES[id] && observe(EXPEDITION_NODES[id]!).state.checked);
  function itemReadiness(): ItemReadinessResult | null {
    const info = spec ? catalogNode(spec.id) : undefined;
    if (!info?.dynamic || !item) return null;
    return evaluateItemReadiness({ nodeId: info.id, itemAvailable: true, staticGroups: info.groups,
      context: resolveItemReadinessContext(info.id, item), knownChecked });
  }
  app.classList.add('saaristo-app'); document.body.classList.add('on-expedition');

  const root = h('main', { class: 'expedition', 'data-view': 'home' });
  root.style.setProperty('--exp-backdrop', `url("${assets('visual-polish/world/ranta-paiva.webp')}")`);
  const worldHost = h('div', { class: 'exp-world', 'aria-hidden': 'true' });
  const contents = h('div');
  let memoryBefore: HTMLElement | null = null;
  const memoryTitle = h('strong');
  const memoryLine = h('p', { 'aria-live': 'polite' });
  const memoryVisual = h('div', { class: 'exp-memory-visual' });
  const memoryEnd = h('button', { type: 'button', class: 'btn', onclick: () => {
    climax.skipToEnd(); refreshMemory(true); haltStage();
    memoryPanel.querySelector<HTMLButtonElement>('[data-memory-return]')?.focus();
  } }, 'Näytä retkimuiston lopputilanne');
  const memoryPanel = h('section', { class: 'exp-memory', hidden: true, role: 'dialog', tabindex: '-1', 'aria-label': 'Retkimuisto' },
    memoryTitle, memoryLine, memoryVisual, h('div', { class: 'exp-memory-controls' }, memoryEnd,
      h('button', { type: 'button', class: 'btn', 'data-memory-return': '', onclick: () => {
        showStage(mode === 'result' || mode === 'demo');
        if (memoryBefore?.isConnected && !memoryBefore.matches(':disabled')) memoryBefore.focus();
        else contents.querySelector<HTMLElement>('.exp-feedback')?.focus();
      } }, 'Takaisin tutkimukseen')));
  let refreshOnLoss: (() => void) | undefined;
  const pauseButton = h('button', { class: 'exp-tool', type: 'button', onclick: () => {
    userPaused = !userPaused;
    syncMotion();
  } });
  const head = h('header', { class: 'exp-head' },
    h('a', { class: 'exp-brand', href: '#saaristo' }, h('img', { src: assets('characters/aava/idle.png'), alt: '' }), 'Sammakko'),
    h('nav', { class: 'exp-tools', 'aria-label': 'Retken valinnat' },
      pauseButton,
      h('button', { class: 'exp-tool', type: 'button', 'aria-label': 'Retkikartta', onclick: () => openCatalog() }, '⌘'),
      h('button', { class: 'exp-tool', type: 'button', 'aria-label': 'Aikuiselle: retken tiedot', onclick: () => adult() }, 'i'),
      h('a', { class: 'exp-tool', href: '#alueet', 'aria-label': 'Palaa aihevalintaan' }, '↗')));
  root.append(worldHost, head, contents, memoryPanel); app.replaceChildren(root);
  const world = mountSaaristo({ container: worldHost, assets: { world: assets('world/saaristo'), characters: assets('characters') }, paused, interactive: false,
    onStatus(status) { root.dataset.fallback = String(status.status === 'fallback'); if (status.status === 'fallback') refreshOnLoss?.(); },
  });
  root.dataset.fallback = String(!world.scene);
  const stage = mountExpeditionStage(world);
  const familyWorld = mountFamilyWorlds(world, { reducedMotion: reduced.matches, quality: 'balanced' });
  const climax = mountAuthoredClimax(world, { characterBase: assets('models/characters/') });
  const authoredEffects = new Set([...AUTHORED_CLIMAX_IDS.map(id => `world.${id}.resolved`), ...FAMILY_IMPLEMENTED_EFFECT_IDS]);
  stage.restoreEffects(journey.effectIds().filter(id => !authoredEffects.has(id)));
  climax.restoreEffects(journey.effectIds());
  familyWorld.restoreEffects(journey.effectIds());
  let memoryModel: ClimaxLessonModel | undefined, memoryFrame = -1;
  refreshOnLoss = () => { haltStage(); refreshMemory(true); };
  let lastFrame = 0, raf = 0, stageRemaining = 0, familyStageHidden = false;
  function syncFamilyStageVisibility() {
    if (climax.snapshot().activeNode) { familyStageHidden = false; return; }
    const hidden = !world.state.lost && familyWorld.snapshot().remaining > 0;
    if (hidden !== familyStageHidden) { familyStageHidden = hidden; stage.setVisible(!hidden); }
  }
  function haltStage() { cancelAnimationFrame(raf); raf = 0; lastFrame = 0; }
  function scheduleStage() {
    syncFamilyStageVisibility();
    if (!raf && !disposed && !paused && !document.hidden &&
      (stageRemaining > 0 || (!world.state.lost && (climax.snapshot().remaining > 0 || familyWorld.snapshot().remaining > 0)))) raf = requestAnimationFrame(animate);
  }
  function advanceStage(ms: number) {
    if (!Number.isFinite(ms) || ms < 0) return;
    familyWorld.advanceTime(ms);
    syncFamilyStageVisibility();
    if (climax.snapshot().activeNode) { climax.advanceTime(ms); refreshMemory(); }
    else { stage.advanceTime(ms); stageRemaining = Math.max(0, stageRemaining - ms); }
    if (!stageRemaining && !climax.snapshot().remaining && !familyWorld.snapshot().remaining) haltStage();
  }
  function animate(now: number) {
    raf = 0;
    if (disposed || paused || document.hidden) return;
    if (lastFrame) advanceStage(Math.min(50, now - lastFrame));
    lastFrame = now;
    scheduleStage();
  }
  function syncMotion() {
    paused = userPaused || reduced.matches;
    world.setPaused(paused || document.hidden);
    climax.setPaused(paused || document.hidden);
    familyWorld.setReducedMotion(reduced.matches);
    familyWorld.setPaused(userPaused || document.hidden);
    syncFamilyStageVisibility();
    pauseButton.disabled = reduced.matches;
    pauseButton.setAttribute('aria-pressed', String(paused));
    pauseButton.setAttribute('aria-label', reduced.matches ? 'Laitteen asetus vähentää maiseman liikettä' : paused ? 'Jatka maiseman liikettä' : 'Pysäytä maiseman liike');
    pauseButton.textContent = paused ? '▷' : 'Ⅱ';
    if (paused || document.hidden) haltStage(); else scheduleStage();
  }
  function showStage(revealed = false) {
    haltStage();
    world.setWorkMode(mode === 'task' || mode === 'result' || mode === 'demo');
    const familyId = spec && catalogNode(spec.id)?.familyId;
    const familyPhase = mode === 'intro' ? 'arrival' : 'work';
    const currentFamily = familyWorld.snapshot();
    if (!familyId) familyWorld.clear();
    else if (currentFamily.familyId !== familyId || currentFamily.nodeId !== spec!.id) {
      if (!familyWorld.enter(familyId, { nodeId: spec!.id, phase: familyPhase })) familyWorld.clear();
    } else if (currentFamily.phase !== familyPhase) familyWorld.setPhase(familyPhase);
    climax.clear(); memoryModel = undefined; memoryFrame = -1;
    memoryPanel.hidden = true; contents.inert = !!modal; root.dataset.climax = 'false'; familyStageHidden = false; stage.setVisible(true);
    stageRemaining = model?.kind === 'force-track' && revealed ? model.seconds * 1000
      : model?.kind === 'work-power' && revealed ? model.durationS * 1000
      : model?.kind === 'force-workshop' && revealed &&
        (model.inputs?.kind === 'motion' || (model.inputs?.kind === 'friction' && model.surfaceOptions)) ? (model.inputs.durationS ?? 2) * 1000
      : model?.kind === 'reaction-lab' && Number.isFinite(model.motionMs) ? Math.min(2400, Math.max(0, model.motionMs))
      : model?.kind === 'atomic-world' && Number.isFinite(model.motionMs) ? Math.min(8000, Math.max(0, model.motionMs))
      : model?.kind === 'diffusion-model' ? 6000
      : model?.kind === 'thermal-station' && model.observed && (model.mode === 'convection' || model.mode === 'integration') ? 6000
      : model?.kind === 'energy-islands' && model.observed && ['kinetic', 'bounce', 'chain', 'source'].includes(model.mode) ? 6000
      : model?.kind === 'logic-workshop' && model.mode === 'cause' && model.observation ? Math.min(6000, model.observation.durationMs)
      : model?.kind === 'electricity-harbor' && model.mode === 'generation' && model.observed && model.control === 'on' ? 6000 : 0;
    if (model) stage.show(model, { revealed }); else stage.clear();
    if (!model && familyWorld.snapshot().familyId) world.setActivityFocus(true, { target: [.6, .7, 6], span: 10 });
    if (paused && model?.kind === 'logic-workshop' && model.mode === 'cause' && model.observation) {
      stage.advanceTime(stageRemaining); stageRemaining = 0;
    }
    scheduleStage();
  }
  function refreshMemory(force = false) {
    const state = climax.snapshot();
    if (!state.activeNode || disposed) return;
    const frame = Math.floor(state.elapsed / 250);
    if (!force && frame === memoryFrame) return;
    memoryFrame = frame;
    memoryTitle.textContent = authoredClimaxes[state.activeNode].title;
    if (memoryLine.textContent !== state.phaseText) memoryLine.textContent = state.phaseText;
    memoryEnd.disabled = state.remaining === 0;
    memoryVisual.hidden = state.renderer !== 'fallback';
    if (!memoryVisual.hidden) authoredClimaxPaint(state.activeNode, state.elapsed, memoryModel)(memoryVisual);
  }
  function playMemory(nodeId: string, useCurrentModel = false) {
    const event = catalogNode(nodeId)?.eventId;
    if (!event || !journey.hasEvent(event) || !hasAuthoredClimax(nodeId)) return;
    memoryModel = useCurrentModel && model ? model.kind === 'cake' ? {
      kind: 'cake-shares', left: [model.task.left.kept, model.task.left.parts], right: [model.task.right.kept, model.task.right.parts],
    } : model : undefined;
    if (!climax.play(nodeId, { lessonModel: memoryModel })) return;
    world.setWorkMode(false); familyWorld.setPhase('consequence');
    memoryBefore = document.activeElement as HTMLElement | null;
    stageRemaining = 0; stage.setVisible(false); memoryFrame = -1;
    climax.restoreEffects(journey.effectIds()); climax.setPaused(paused || document.hidden);
    memoryPanel.hidden = false; contents.inert = true; root.dataset.climax = 'true';
    memoryPanel.focus();
    refreshMemory(true); world.resize(); scheduleStage();
  }
  reduced.addEventListener('change', syncMotion);
  document.addEventListener('visibilitychange', syncMotion);
  syncMotion();
  const previousText = window.render_game_to_text, previousTime = window.advanceTime;
  window.advanceTime = ms => { advanceStage(ms); world.advanceTime(ms); };
  window.render_game_to_text = () => JSON.stringify({
    screen: 'saaristo', mode, node: spec?.id ?? null, phase, seed,
    coordinates: '3D: x right, y up; task measurements come from the exact model, not pixels.',
    prompt: item?.say ?? spec?.intro ?? 'Aavan matkassa – Yhteisten virtojen saaristo',
    taskKind: item?.task.kind ?? null, family: item?.tag ?? null, help, answered, lastOk,
    light: spec?.light ?? false, basisKind: (item?.basis as { kind?: string } | undefined)?.kind ?? null,
    ...(params.get('qa') === '1' && item && (item.task.kind === 'choice' || item.task.kind === 'numeric') ? { qaAnswer: item.task.answer } : {}),
    contentContext: item && 'context' in item.task ? item.task.context : null,
    itemReadiness: itemReadiness(),
    renderer: root.dataset.fallback === 'true' ? 'painted-fallback' : 'webgl', paused, charactersVisible: world.state.charactersVisible,
    model: model?.kind === 'reaction-lab' ? debugReactionLabScene(model) : model?.kind === 'atomic-world' ? debugAtomicWorldScene(model) : model?.kind === 'chemical-investigation' ? { kind: model.kind, title: model.title, mode: model.mode, instrument: model.instrument, samplePlaced: model.samplePlaced, containerPlaced: model.containerPlaced, eyeLevel: model.eyeLevel, read: model.read, ...(model.read ? { meter: model.meter, liquid: model.liquid, transfer: model.transfer } : {}) } : model?.kind === 'physics-investigation' ? { kind: model.kind, quantity: model.quantity, object: model.object, instrument: model.instrument, placement: model.placement, observation: model.observation } : model?.kind === 'advanced-solids' ? debugAdvancedSolidsScene(model) : model?.kind === 'right-triangle' ? { kind: model.kind, mode: model.mode, title: model.title, right: model.right, focus: model.focus, shownSides: model.shownSides } : model ?? null, quantity: (item as (Item & { quantityModel?: unknown }) | undefined)?.quantityModel ?? null, stage: stage.snapshot(),
    progress: spec ? observe(spec).state : null,
    effects: journey.effectIds(), climax: climax.snapshot(), familyWorld: familyWorld.snapshot(),
    world: { frames: world.state.frames, time: world.state.time ?? 0, workMode: world.state.workMode },
    availableStops: SLICE_IDS.map(id => ({ id, name: EXPEDITION_NODES[id]?.stop })),
  });

  function closeModal() {
    cleanupModal?.(); cleanupModal = undefined; modal?.remove(); modal = null;
    head.inert = false; contents.inert = !memoryPanel.hidden;
  }
  function dialog(title: string, body: HTMLElement) {
    closeModal();
    const before = document.activeElement as HTMLElement | null;
    const close = h('button', { class: 'exp-tool', type: 'button', 'aria-label': 'Sulje', onclick: () => { closeModal(); before?.focus(); } }, '×');
    const panel = h('section', { class: 'exp-dialog', role: 'dialog', 'aria-modal': 'true', 'aria-label': title }, h('header', {}, h('h2', {}, title), close), body);
    modal = h('div', { class: 'exp-overlay' }, panel); root.append(modal);
    head.inert = true; contents.inert = true; close.focus();
    const keydown = (event: KeyboardEvent) => {
      // The shared numeric keypad also listens on document.
      event.stopPropagation();
      if (event.key === 'Escape') { event.preventDefault(); closeModal(); before?.focus(); }
      if (event.key === 'Tab') {
        const nodes = [...panel.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input,summary,[tabindex="0"]')].filter(node => node.getClientRects().length);
        const first = nodes[0], last = nodes.at(-1);
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    };
    panel.addEventListener('keydown', keydown);
    cleanupModal = () => panel.removeEventListener('keydown', keydown);
  }

  function go(id: string) { closeModal(); location.hash = `saaristo/${encodeURIComponent(id)}`; }
  function stopRow(id: string) {
    const node = EXPEDITION_NODES[id], info = catalogNode(id);
    const state = node ? observe(node).state : undefined;
    const recallDue = state?.checked && state.dueAt !== undefined && state.dueAt <= Date.now();
    return h('button', { class: 'exp-stop', type: 'button', disabled: !node, onclick: () => go(id), 'data-node': id },
      h('span', { class: 'exp-stop-icon', 'aria-hidden': 'true' }, node?.icon ?? '·'),
      h('span', { class: 'exp-stop-name' }, node?.stop ?? info?.title ?? id,
        h('small', {}, node ? (recallDue ? 'Voit kokeilla, mitä muistat' : journey.hasEvent(info?.eventId ?? '') ? 'Muisto retkeltä · tutki uudelleen' : info?.title ?? '') : 'Suunnitteilla')),
      node ? h('span', { 'aria-hidden': 'true' }, '↗') : null);
  }
  function openCatalog(unavailableId?: string) {
    const list = h('div', { class: 'exp-catalog-list' });
    const search = h('input', { type: 'search', placeholder: 'Etsi retkeä tai taitoa', 'aria-label': 'Etsi retkeä tai taitoa' });
    const showPlanned = h('input', { type: 'checkbox', id: 'exp-planned', style: 'width:auto;margin:0 8px 0 0' });
    const fill = () => {
      const q = search.value.toLocaleLowerCase('fi');
      const nodes = CATALOG.filter(node => (showPlanned.checked || !!EXPEDITION_NODES[node.id]) && `${node.title} ${EXPEDITION_NODES[node.id]?.stop ?? ''} ${node.id}`.toLocaleLowerCase('fi').includes(q));
      list.replaceChildren(...nodes.map(node => stopRow(node.id)));
    };
    search.addEventListener('input', fill); showPlanned.addEventListener('change', fill); fill();
    const unavailable = unavailableId === undefined ? null : catalogNode(unavailableId);
    const notice = unavailableId === undefined ? null : h('p', { role: 'status' },
      unavailable ? `${unavailable.title} on suunnitteilla.` : 'Tuntematon retki. Voit valita toisen retken kartalta.');
    dialog('Retkikartta', h('div', { class: 'stack' }, notice, search,
      h('label', { class: 'small' }, showPlanned, 'Näytä myös suunnitteilla olevat taidot'), list));
  }
  function reviewToggle() {
    const box = h('input', { type: 'checkbox', 'data-adult-review-toggle': '', style: 'width:20px;height:20px;flex:none' }) as HTMLInputElement;
    box.checked = adultReviewOn();
    const status = h('p', { class: 'small', role: 'status' });
    box.addEventListener('change', () => {
      setAdultReview(box.checked);
      status.textContent = box.checked ? 'Käytössä seuraavasta tehtävästä alkaen.' : 'Pois käytöstä seuraavasta tehtävästä alkaen.';
    });
    return h('details', {}, h('summary', {}, 'Aikuisen arvio omista selityksistä'),
      h('p', { class: 'small' }, 'Osa tehtävistä pyytää lasta selittämään omin sanoin. Kone ei arvioi puhetta tai vapaata tekstiä luotettavasti, joten arvion voi tehdä vieressä oleva aikuinen. Oletuksena arvio on pois päältä, jotta lapsi voi pelata yksin: selitysosa jätetään pois, ja pelkät selitystehtävät ovat itsetarkistusta, joka lasketaan ohjatuksi harjoitteluksi.'),
      h('label', { style: 'display:flex;align-items:center;gap:8px;min-height:44px' }, box, 'Pyydä aikuisen arviota tehtävissä'),
      status);
  }
  function adult() {
    const current = spec ? observe(spec).state : undefined;
    const info = spec ? catalogNode(spec.id) : undefined;
    const note = journey.note();
    const readiness = itemReadiness();
    const contextInfo = !readiness ? 'Valmiutta tarkastellaan, kun konkreettinen tehtävä on avattu.'
      : readiness.dynamic.status === 'ready' ? 'Tämän tehtävän tarvitsemasta sisältökontekstista on itsenäistä näyttöä.'
      : readiness.dynamic.status === 'missing' ? 'Tämän tehtävän sisältökontekstin kaikista tarvittavista taidoista ei vielä ole itsenäistä näyttöä.'
      : 'Tämän tehtävämuodon sisältökontekstia ei vielä pystytä arvioimaan automaattisesti.';
    const contextualSupport = readiness ? [...new Set(readiness.dynamic.missing.flat())].filter(id => !!EXPEDITION_NODES[id]) : [];
    const adultObservations = spec ? journey.get().attempts.filter(attempt => attempt.node === spec!.id && attempt.assessor === 'adult' && !attempt.syn).length : 0;
    const unreviewedAnswers = spec ? journey.get().attempts.filter(attempt => attempt.node === spec!.id && attempt.unreviewed && !attempt.syn).length : 0;
    const download = () => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(journey.export(), null, 2)], { type: 'application/json' }));
      const link = h('a', { href: url, download: 'sammakko-retki.json' }); link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    dialog('Retken tiedot aikuiselle', h('div', { class: 'stack' },
      h('p', {}, 'Uusi Saaristo-retki on kehitysversio. Sen harjoitukset ja tarinamuistot tallentuvat tällä laitteella erillään aiemman Liten edistymisestä.'),
      h('dl', {}, h('dt', {}, 'Saatavilla'), h('dd', {}, `${Object.keys(EXPEDITION_NODES).length} tehtävää; luettelossa 690 taitoa ja ${FAMILIES.length} ympäristöä.`),
        h('dt', {}, 'Esitiedot'), h('dd', {}, 'Suora tutkiminen on sallittu. Se ei merkitse puuttuvia esitietoja opituiksi. Vaihtoehtoiset reitit säilyvät.'),
        h('dt', {}, 'Näyttö'), h('dd', {}, 'Ohjattu onnistuminen voi avata paikallisen tarinan. Itsenäinen näyttö vaatii vähintään kolme oikeaa vastausta, kaikki tehtävässä nimetyt perheet sekä uuden siirtotilanteen. Perheitä on vähintään kaksi; laajemmissa tehtävissä useampia.'),
        h('dt', {}, 'Tallennus'), h('dd', {}, note.mode === 'local' ? 'Tällä laitteella. Alkuperäinen 181 taidon tallennus säilyy.' : 'Vain tämän sivun muistissa; vie tiedot ennen sivun sulkemista.')),
      reviewToggle(),
      note.issue ? h('p', { class: 'small' }, note.issue === 'corrupt' ? 'Retken tallennetta ei voitu lukea. Alkuperäistä ei korvattu oppimisnäytöllä.' : 'Selain ei salli pysyvää tallentamista.') : null,
      spec && current && info ? h('details', { open: true }, h('summary', {}, `${info.title} · ${spec.id}`),
        h('p', {}, `Itsenäinen näyttö: ${current.checked ? 'tämän tehtävämuodon tarkistus täyttyi' : 'ei vielä'}. Ohjattuja onnistumisia: ${current.guidedOk}. Tarinamuisto: ${journey.hasEvent(info.eventId) ? 'koettu' : 'ei koettu'}.`),
        unreviewedAnswers ? h('p', { class: 'small' }, `Ilman aikuisen arviota tehtyjä vastauksia: ${unreviewedAnswers}. Niissä oma selitys jäi arvioimatta; pelkkä itsetarkistus on ohjattua harjoittelua.`) : null,
        adultObservations ? h('p', { class: 'small' }, `Aikuisen arvioimia havaintoja: ${adultObservations}. Ne perustuvat kuultuun tai luettuun omaan selitykseen. Tuki kirjataan erikseen; puhetta tai vastaustekstiä ei tallenneta.`) : null,
        h('p', { class: 'small' }, current.retained !== undefined ? 'Viivehaku onnistui vähintään 20 tunnin tauon jälkeen.' : current.recallFailed ? 'Viimeisin viivehaku jäi avoimeksi. Aiempi näyttö ja tarinamuisto säilyvät.' : 'Viivehaku avautuu tarkistuksen jälkeen, kun tämän taidon harjoittelusta on kulunut vähintään 20 tuntia.'),
        h('p', { class: 'small' }, expeditionEvidenceLimit(spec.id) ?? spec.produceWhat ?? 'Näyttö koskee tämän tehtävän vastausmuotoa; se ei yksin ole laaja osaamisarvio.'),
        h('p', { class: 'small' }, canEnter(spec.id, knownChecked) ? 'Kanoniset kiinteät esitietoryhmät täyttyvät tallennetun näytön perusteella.' : 'Kaikista kanonisista esitiedoista ei ole tallennettua näyttöä. Retki ei päättele niitä opituiksi.'),
        info.dynamic ? h('div', { class: 'exp-readiness' },
          h('p', { class: 'small', 'data-item-readiness': readiness?.dynamic.status ?? 'no-item' }, contextInfo),
          h('p', { class: 'small' }, 'Suora kokeilu säilyy mahdollisena. Sen tulos ei merkitse esitietoja opituiksi eikä pelkkä tarinamuisto todista osaamista.'),
          contextualSupport.length ? h('details', {}, h('summary', {}, 'Aiheeseen liittyviä tutkimuksia'),
            h('p', { class: 'small' }, 'Vaihtoehtoisia tapoja voi olla useita. Tätä luetteloa ei tarvitse suorittaa kokonaan.'),
            ...contextualSupport.map(id => h('a', { href: `#saaristo/${encodeURIComponent(id)}` }, catalogNode(id)?.title ?? id))) : null) : null) : null,
      h('button', { class: 'exp-primary', type: 'button', onclick: download }, 'Vie retken tiedot'),
      h('a', { href: '#aikuiselle' }, 'Aiemman Liten edistyminen ja asetukset'),
      h('a', { href: '#saaristo/hahmot' }, 'Hahmopaja: tutki 3D-kokeiluja')));
  }

  function clearPaint() { cleanupPaint?.(); cleanupPaint = undefined; }
  function paint(step: Pick<Item, 'scene'>, host: HTMLElement) {
    clearPaint();
    const cleanup = step.scene?.(host, { onViewChange(view) {
      if (disposed || !host.isConnected) return;
      if (model?.kind === 'observatory-near' && (view === 'size' || view === 'distance')) model = { ...model, mode: view };
      else if (model?.kind === 'observatory-scale' && (view === 'planet' || view === 'stars' || view === 'galaxy')) model = { ...model, mode: view };
      else if (model?.kind === 'force-workshop' && model.surfaceOptions &&
        (view === 'force-surface:smooth' || view === 'force-surface:rough')) {
        model = { ...model, surfaceView: view === 'force-surface:rough' ? 'rough' : 'smooth' };
      }
      else if ((model?.kind === 'solid-workshop' || model?.kind === 'solid-construction') &&
        (view === 'solid-view:angled' || view === 'solid-view:ends' || view === 'solid-view:side')) {
        const selected = view === 'solid-view:ends' ? 'ends' : view === 'solid-view:side' ? 'side' : 'angled';
        model = { ...model, view: selected };
      }
      else if (model?.kind === 'atomic-world' && view === 'atomic-view:motion') {
        // Replay only the current given/observed scene; never manufacture an observation.
        model = { ...model };
      }
      else return;
      showStage(mode === 'demo' || lastOk === true);
    } });
    if (typeof cleanup === 'function') cleanupPaint = cleanup;
  }
  function setModel(step: Item | DemoStep, revealed = false) {
    const sceneModel = (step as Item & { sceneModel?: ExpeditionSceneModel }).sceneModel;
    model = 'task' in step && step.task.kind === 'cake' ? { kind: 'cake', task: step.task }
      : 'task' in step && step.task.kind === 'number-journey' && step.task.mode === 'route' ? numberRouteScene(step.task) : sceneModel;
    showStage(revealed);
  }
  function characterStory(text: string) {
    return h('aside', { class: 'exp-story' }, h('img', { src: assets('characters/aava/curious.png'), alt: '' }), h('p', {}, text));
  }
  function desk(title: string) {
    root.dataset.view = 'lesson';
    const observation = spec ? observe(spec) : undefined;
    const streak = observation?.streak ?? 0;
    const out = h('section', { class: 'exp-desk', 'aria-label': 'Tutkimuspöytä' }, h('div', { class: 'exp-phase' },
      h('span', {}, mode === 'demo' ? 'Katsotaan yhdessä' : mode === 'intro' ? 'Uusi pieni tutkimus' : phase === 'guided' ? 'Tutkitaan yhdessä' : phase === 'transfer' ? 'Uusi tilanne' : phase === 'retrieval' ? 'Mitä muistan' : 'Kokeilen itse'),
      h('div', { class: 'exp-pips', 'aria-label': `${streak} peräkkäistä itsenäistä onnistumista` },
        ...Array.from({ length: observation?.target ?? 3 }, (_, i) => h('i', { class: streak > i ? 'done' : '' })))),
      h('h1', {}, title));
    contents.replaceChildren(out);
    world.resize();
    return out;
  }

  function home() {
    mode = 'home'; spec = undefined; item = undefined; model = undefined; clearPaint(); showStage(); root.dataset.view = 'home';
    contents.replaceChildren(
      h('section', { class: 'exp-home' }, h('div', { class: 'exp-kicker' }, 'Yhteisten virtojen saaristo'),
        h('h1', {}, 'Aavan matkassa'),
        h('p', {}, 'Pieni havainto. Yhteinen oivallus. Lähde tutkimaan, mitä rannalla voi tapahtua.'),
        h('button', { class: 'exp-primary', type: 'button', onclick: () => go('M-FRAC-13') }, 'Juhlapöydän ääreen', h('span', { 'aria-hidden': 'true' }, '→')),
        h('div', { style: 'margin-top:18px' }, h('button', { class: 'exp-secondary', type: 'button', onclick: () => openCatalog() }, 'Valitse oma retki'))),
      h('aside', { class: 'exp-islands', 'aria-label': 'Retkiä saaristossa' }, h('h2', {}, 'Rannalta tutkimusretkelle'),
        ...['M-NUM-QTY-NUMERAL', 'PHY79-FORCE-MOTION', 'PHY79-PARALLEL', 'ENV-PHY-SPACE-01'].map(stopRow),
        h('button', { class: 'exp-secondary', type: 'button', onclick: () => openCatalog() }, 'Kaikki retket →'),
        h('a', { class: 'exp-secondary', href: '#saaristo/loppu', style: 'display:block;margin-top:8px;font-size:13px' }, 'Tulevaisuuden tarina')));
    world.resize();
  }

  function intro(id: string) {
    spec = EXPEDITION_NODES[id];
    if (!spec) { home(); openCatalog(id); return; }
    mode = 'intro'; item = undefined; clearPaint();
    const out = desk(spec.stop);
    const state = observe(spec).state;
    const recallDue = state.checked && state.dueAt !== undefined && state.dueAt <= Date.now();
    out.append(h('p', { class: 'exp-instruction' }, spec.intro),
      h('p', { class: 'small' }, spec.goal ?? catalogNode(id)?.action ?? ''),
      h('div', { class: 'stack', style: 'margin-top:20px' },
        recallDue ? h('button', { class: 'exp-primary', type: 'button', onclick: () => startTask('retrieval') }, 'Kokeilen, mitä muistan') : null,
        h('button', { class: 'exp-primary', type: 'button', onclick: () => startTask('guided') }, 'Tutkitaan yhdessä'),
        h('button', { class: 'btn', type: 'button', onclick: () => startTask('independent') }, 'Kokeilen itse'),
        h('button', { class: 'exp-secondary', type: 'button', onclick: showDemo }, 'Katso mallia')));
    const hasMemory = journey.hasEvent(catalogNode(id)?.eventId ?? '');
    if (hasMemory && hasAuthoredClimax(id)) out.append(h('button', { type: 'button', class: 'exp-secondary', onclick: () => playMemory(id) }, 'Katso retkimuisto'));
    contents.append(characterStory(hasMemory ? 'Tämän retken muisto säilyy. Voimme palata siihen ja tutkia uuden tilanteen.' : 'Voit pysähtyä, pyytää apua ja kokeilla rauhassa. Aava tutkii kanssasi.'));
    // A representative model establishes the scene without exposing an assessment answer.
    const preview = spec.item(rng(20261105), 'independent'); setModel(preview);
  }

  function showDemo() {
    if (!spec) return;
    demos = spec.demo(rng(takeSeed())); demoIndex = 0; renderDemo();
  }
  function renderDemo() {
    if (!spec) return;
    const step = demos[demoIndex];
    if (!step) { startTask('guided'); return; }
    mode = 'demo'; clearPaint();
    const out = desk(spec.stop), board = h('div', { class: 'exp-exact' });
    out.append(h('p', { class: 'exp-instruction' }, step.say), board);
    setModel(step, true); paint(step, board);
    out.append(h('button', { class: 'exp-primary', type: 'button', onclick: () => { demoIndex++; renderDemo(); } }, demoIndex + 1 < demos.length ? 'Seuraava havainto' : 'Kokeilen yhdessä'),
      h('button', { class: 'exp-secondary', type: 'button', onclick: () => say(step.say, true) }, 'Kuuntele'));
    contents.append(characterStory('Mallissa saa katsoa, mistä ratkaisu syntyy. Sen jälkeen kokeilemme uutta tilannetta yhdessä.'));
  }

  function startTask(nextPhase: Phase) {
    if (!spec || disposed) return;
    const previousItem = item;
    phase = nextPhase; mode = 'task'; answered = false; lastOk = undefined; help = phase === 'guided' ? ['support'] : [];
    clearPaint();
    const observation = observe(spec);
    if (phase === 'transfer' && !observation.readyTransfer) phase = 'independent';
    if (selfCheckNode(spec)) { phase = 'guided'; if (!help.includes('support')) help = ['support']; }
    if (phase === 'retrieval' && (!observation.state.checked || observation.state.dueAt === undefined || observation.state.dueAt > Date.now())) phase = 'independent';
    const revision = expeditionRevision(spec.id);
    const prior = journey.get().attempts.filter(a => a.node === spec!.id && !a.syn && a.rev === revision);
    const usedSeeds = new Set(prior.map(a => a.seed));
    const trackIdentity = catalogNode(spec.id)?.scope === 'new_509_content';
    const usedItems = new Set(prior.map(a => a.itemKey).filter(Boolean));
    const requiredFamilies = EXPEDITION_EVIDENCE[spec.id]?.families ?? [];
    const seen = observation.streakFamilies;
    const missingFamilies = requiredFamilies.filter(family => !seen.has(family));
    // Prefer a fresh item from a family missing in the current streak. If the search finds
    // none, keep a fresh fallback so the task remains usable for arbitrary generators.
    let fallback: { item: Item; seed: number } | undefined;
    let familiar: { item: Item; seed: number } | undefined;
    for (let n = 0; n < 128; n++) {
      seed = takeSeed(); const raw = spec.item(rng(seed), phase, { knownChecked, previousItem }); reviewSkipped = !adultReviewOn() && hasAdultReview(raw.task); item = solo(raw);
      if (usedSeeds.has(seed)) continue;
      familiar ??= { item, seed };
      if (trackIdentity && usedItems.has(itemIdentity(item))) continue;
      fallback ??= { item, seed };
      const newFamilyNeeded = missingFamilies.length > 0 || seen.size < 2;
      const desiredFamily = missingFamilies.length ? missingFamilies.includes(item.tag) : !seen.has(item.tag);
      if (phase !== 'independent' || !newFamilyNeeded || desiredFamily) { fallback = { item, seed }; break; }
    }
    if (fallback ?? familiar) ({ item, seed } = (fallback ?? familiar)!);
    const current = item!;
    selfCheck = current.task.kind === 'observed-explanation' && !adultReviewOn();
    const out = desk(spec.stop), exact = h('div', { class: 'exp-exact' }), task = h('div', { class: 'exp-task', 'data-task-kind': current.task.kind });
    const feedback = h('div', { class: 'exp-feedback', role: 'status', 'aria-live': 'polite' });
    const hint = h('div', { class: 'exp-help', hidden: true });
    out.append(h('p', { class: 'exp-instruction' }, current.say), exact, task, hint, feedback);
    if (trackIdentity && usedItems.has(itemIdentity(current))) {
      task.before(h('p', { class: 'exp-help' }, 'Tämä tilanne on jo tuttu. Voit harjoitella sitä uudelleen. Uusi taitonäyttö tarvitsee uuden tilanteen.'));
    }
    setModel(current); paint(current, exact);
    if (current.task.kind === 'tapcount' && current.task.words) help.push('words');
    const showHint = () => {
      if (answered) return;
      if (!help.includes('hint')) help.push('hint');
      hint.hidden = false;
      hint.textContent = current.hint ?? 'Katso alkuperäisiä määriä ja kokeile yksi muutos kerrallaan. Voit myös katsoa mallia.';
    };
    const hintButton = h('button', { class: 'exp-secondary', type: 'button', onclick: showHint }, 'Pieni vihje');
    widget = selfCheck && current.task.kind === 'observed-explanation'
      ? mountSelfExplanation(current.task, task, response => submit(current, response, feedback, task, hintButton, exact))
      : mount(current.task, task, response => submit(current, response, feedback, task, hintButton, exact), response => {
      if (response.kind === 'reaction-lab' && current.task.kind === 'reaction-lab') {
        model = reactionLabScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'matter-cycles' && current.task.kind === 'matter-cycles') {
        model = matterCyclesScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'inquiry-islands' && current.task.kind === 'inquiry-islands') {
        const next = inquiryIslandsScene(current.task, response);
        if (next) { model = next; showStage(false); }
      } else if (response.kind === 'carbon-kitchen' && current.task.kind === 'carbon-kitchen') {
        model = carbonKitchenScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'atomic-world' && current.task.kind === 'atomic-world') {
        model = atomicWorldScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'logic-workshop' && current.task.kind === 'logic-workshop') {
        model = logicWorkshopScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'chemical-investigation' && current.task.kind === 'chemical-investigation') {
        model = chemicalInvestigationScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'waves-observatory' && current.task.kind === 'waves-observatory') {
        model = wavesObservatoryScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'physics-investigation' && current.task.kind === 'physics-investigation') {
        model = physicsInvestigationScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'materials-mixtures' && current.task.kind === 'materials-mixtures') {
        model = materialsMixturesScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'advanced-solids' && current.task.kind === 'advanced-solids') {
        model = advancedSolidsScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'energy-islands' && current.task.kind === 'energy-islands') {
        model = energyIslandsScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'circuit-workshop' && current.task.kind === 'circuit-workshop') {
        model = circuitWorkshopScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'electricity-harbor' && current.task.kind === 'electricity-harbor') {
        model = electricityHarborScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'statistics-harbor' && current.task.kind === 'statistics-harbor') {
        model = statisticsHarborScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'thermal-station' && current.task.kind === 'thermal-station') {
        model = thermalScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'programming-ferries' && current.task.kind === 'programming-ferries') {
        model = programmingFerryScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'measurement-station' && current.task.kind === 'measurement-station') {
        model = measurementStationScene(current.task, response);
        showStage(false);
      } else if (response.kind === 'space-day' && model?.kind === 'observatory-day') {
        model = { ...model, rotation: response.rotation };
        showStage(false);
      } else if (response.kind === 'solid-construction' && response.activity === 'build' && model?.kind === 'solid-construction') {
        model = { ...model, previewCells: response.cells };
        showStage(false);
      }
    });
    if (phase === 'guided' && current.hint) showHint();
    out.append(h('footer', { class: 'exp-foot' },
      hintButton,
      h('button', { class: 'exp-secondary', type: 'button', onclick: () => say(current.say, true) }, 'Kuuntele'),
      h('button', { class: 'exp-secondary', type: 'button', onclick: showDemo }, 'Katso mallia')));
    contents.append(characterStory(observation.state.checked ? 'Tutkimme uuden tilanteen. Aiempi retki ja sen muisto pysyvät tallessa.' : spec.intro));
    if (model) contents.append(h('div', { class: 'exp-caption' },
      model.kind === 'space' ? 'Taivaankappaleiden koko, etäisyys ja aika tutkitaan eri malleissa.' : model.kind === 'force-track' ? 'Ihanteellinen kitkaton vaakarata · ennusta ensin' : 'Tutkimuksen pienoismalli',
      h('span', { class: 'exp-fallback-note' }, ' · Tarkka havainto näkyy myös tutkimuspöydällä.')));
    world.resize();
  }

  function appendMotionEnd(host: HTMLElement) {
    if (familyWorld.snapshot().remaining > 0) {
      const end = h('button', { class: 'exp-secondary', type: 'button', onclick: () => {
        familyWorld.skipToEnd(); syncFamilyStageVisibility(); end.disabled = true;
        if (!stageRemaining && !climax.snapshot().remaining) haltStage();
      } }, 'Näytä ympäristön muutos');
      host.append(end);
    }
    if (model?.kind === 'force-track' || model?.kind === 'work-power' || (model?.kind === 'force-workshop' &&
      (model.inputs?.kind === 'motion' || (model.inputs?.kind === 'friction' && model.surfaceOptions)))) {
      host.append(h('button', { class: 'exp-secondary', type: 'button', onclick: () => {
        const duration = model?.kind === 'force-track' ? model.seconds
          : model?.kind === 'work-power' ? model.durationS
          : model?.kind === 'force-workshop' && (model.inputs?.kind === 'motion' || model.inputs?.kind === 'friction') ? model.inputs.durationS ?? 2 : 0;
        showStage(true); advanceStage(duration * 1000);
      } }, 'Näytä liikkeen lopputilanne'));
    }
  }

  function submit(current: Item, response: Response, feedback: HTMLElement, taskHost: HTMLElement, hintButton: HTMLButtonElement, exact: HTMLElement) {
    if (disposed || !spec || item !== current || answered || !taskHost.isConnected || modal) return;
    // A solo self-check is practice: always guided, never graded as independent evidence.
    const verdict = selfCheck && response.kind === 'observed-explanation' ? { ok: true } as ReturnType<typeof check> : check(current.task, response);
    if (verdict.pendingReview) {
      feedback.replaceChildren(h('p', {}, verdict.why ?? 'Havainto odottaa aikuisen arviota.'));
      return;
    }
    if (verdict.assisted && !help.includes('support')) help.push('support');
    answered = true; mode = 'result'; lastOk = verdict.ok;
    hintButton.disabled = true;
    taskHost.querySelectorAll<HTMLButtonElement | HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('button,input,select,textarea').forEach(el => { el.disabled = true; });
    const recordedResponse = response.kind === 'observed-explanation' ? {
      kind: response.kind, channel: response.channel, observations: response.observations,
      confirmedByAdult: response.confirmedByAdult, assistance: response.assistance,
    } : response.kind === 'solid-construction' ? recordSolidConstruction(response) : response;
    journey.record({ node: spec.id, phase, ok: verdict.ok, tag: current.tag, seed, at: Date.now(), rev: expeditionRevision(spec.id),
      ...(catalogNode(spec.id)?.scope === 'new_509_content' ? { itemKey: itemIdentity(current) } : {}),
      resp: JSON.stringify(recordedResponse), help: [...help], sess: session, mode: 'saaristo', ...(current.scn ? { scn: current.scn } : {}),
      ...(verdict.observedByAdult ? { assessor: 'adult' as const } : {}),
      ...(reviewSkipped || selfCheck ? { unreviewed: true } : {}),
      ...(verdict.math === undefined ? {} : { math: verdict.math }), ...(verdict.proc === undefined ? {} : { proc: verdict.proc }),
    });
    const { state, readyTransfer, streak } = observe(spec);
    const pips = contents.querySelector('.exp-pips');
    pips?.setAttribute('aria-label', `${streak} peräkkäistä itsenäistä onnistumista`);
    pips?.querySelectorAll('i').forEach((pip, i) => pip.classList.toggle('done', i < streak));
    feedback.dataset.ok = String(verdict.ok);
    feedback.tabIndex = -1;
    if (!verdict.ok) {
      const nextPhase = phase === 'guided' || help.length ? 'guided' : phase;
      feedback.replaceChildren(h('p', {}, verdict.why ?? 'Havainto jäi vielä auki. Voit kokeilla uutta tehtävää tai katsoa selityksen.'),
        h('button', { class: 'exp-primary', type: 'button', onclick: () => startTask(nextPhase) }, 'Uusi kokeilu'),
        h('button', { class: 'exp-secondary', type: 'button', onclick: () => {
          help.push('reveal'); widget?.reveal();
          if (model?.kind === 'force-workshop' && model.surfaceOptions) model = { ...model, surfaceView: 'rough' };
          if (model?.kind !== 'cake') showStage(true);
          if (current.afterCorrect) paint({ scene: current.afterCorrect }, exact);
          feedback.replaceChildren(h('p', {}, current.explain), h('button', { class: 'exp-primary', type: 'button', onclick: () => startTask('guided') }, 'Uusi yhteinen kokeilu'));
          appendMotionEnd(feedback);
          feedback.focus();
        } }, 'Näytä ja selitä'));
      feedback.focus();
      return;
    }
    if (current.task.kind === 'cake' && response.kind === 'cake') {
      model = { kind: 'cake', task: current.task, partitions: cakePartition(current.task, ...cakeFactors(current.task)) };
    }
    if (model?.kind === 'force-workshop' && model.surfaceOptions && response.kind === 'place' && response.map.surface === 'rough') {
      model = { ...model, surfaceView: 'rough' };
    }
    showStage(true);
    if (current.afterCorrect) paint({ scene: current.afterCorrect }, exact);
    const info = catalogNode(spec.id);
    const reached = state.helped || state.checked;
    const newlyResolved = reached && !!info && journey.resolve(spec.id, !state.checked);
    if (newlyResolved && info && !hasAuthoredClimax(spec.id)) {
      if (familyWorld.resolve(spec.id, { eventId: info.effectId, lessonModel: checkedFamilyLessonSnapshot(spec.id, current.task, response) ?? model })) scheduleStage();
      else stage.celebrate(info.effectId);
    }
    const success = phase === 'retrieval' && state.retained !== undefined
      ? 'Muistit tämän myös tauon jälkeen. Retken muisto säilyy.'
      : reached ? spec.reward : selfCheck ? 'Hienoa, vertasit omaa selitystäsi malliin. Kokeillaan vielä toista tilannetta.' : 'Havainto osui kohdalleen. Kokeillaan vielä toista tilannetta.';
    const explain = current.explain;
    feedback.replaceChildren(h('p', {}, success), h('p', { class: 'small' }, explain));
    if (selfCheck && state.helped) {
      feedback.append(h('button', { class: 'exp-primary', type: 'button', onclick: () => openCatalog() }, 'Seuraavalle retkelle'),
        h('button', { class: 'exp-secondary', type: 'button', onclick: () => startTask('guided') }, 'Harjoittelen vielä'));
    } else if (state.checked) {
      feedback.append(h('button', { class: 'exp-primary', type: 'button', onclick: () => openCatalog() }, 'Seuraavalle retkelle'),
        h('button', { class: 'exp-secondary', type: 'button', onclick: () => startTask('independent') }, 'Tutkin vielä'));
    } else if (phase === 'guided' || help.length) {
      feedback.append(h('button', { class: 'exp-primary', type: 'button', onclick: () => startTask(state.helped ? 'independent' : 'guided') }, state.helped ? 'Kokeilen nyt itse' : 'Toinen yhteinen kokeilu'));
    } else {
      feedback.append(h('button', { class: 'exp-primary', type: 'button', onclick: () => startTask(readyTransfer ? 'transfer' : 'independent') }, readyTransfer ? 'Kokeile uudessa tilanteessa' : 'Seuraava kokeilu'));
    }
    appendMotionEnd(feedback);
    if (info && hasAuthoredClimax(spec.id) && journey.hasEvent(info.eventId)) {
      const memoryNode = spec.id;
      feedback.append(h('button', { class: 'exp-secondary', type: 'button', onclick: () => playMemory(memoryNode, true) }, 'Katso retkimuisto'));
      if (newlyResolved) playMemory(memoryNode, true);
    }
    if (memoryPanel.hidden) feedback.focus();
  }

  if (requested) intro(requested); else home();
  const fullscreen = (event: KeyboardEvent) => {
    if (!memoryPanel.hidden && event.key === 'Escape' && !modal) {
      event.preventDefault();
      memoryPanel.querySelector<HTMLButtonElement>('[data-memory-return]')?.click();
      return;
    }
    if (modal || event.key.toLowerCase() !== 'f' || event.ctrlKey || event.metaKey || /INPUT|TEXTAREA|SELECT/.test((event.target as HTMLElement).tagName)) return;
    if (document.fullscreenElement) void document.exitFullscreen(); else void root.requestFullscreen?.();
  };
  window.addEventListener('keydown', fullscreen);
  return () => {
    if (disposed) return; disposed = true; haltStage(); clearPaint(); closeModal(); hush();
    reduced.removeEventListener('change', syncMotion);
    document.removeEventListener('visibilitychange', syncMotion);
    familyWorld.dispose(); climax.dispose(); stage.dispose(); world.dispose(); window.removeEventListener('keydown', fullscreen);
    window.render_game_to_text = previousText; window.advanceTime = previousTime;
    app.classList.remove('saaristo-app'); document.body.classList.remove('on-expedition');
  };
}
