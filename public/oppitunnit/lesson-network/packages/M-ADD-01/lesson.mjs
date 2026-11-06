// Contexts borrow one live workbench; each preset keeps its own in-memory state.
// Returning restores the original work without submitting an answer or replaying motion.
function lessonContexts(read, write, start) {
  const saved = new Map(); let active = null, origin = null;
  return {
    change({action, key, preset}) {
      if (action === 'enter') {
        if (!preset || active === key) return;
        if (active !== null) throw new Error('Close the active lesson context first');
        const before = read();
        try { if (saved.has(key)) write(saved.get(key)); else start(preset); }
        catch (error) { write(before); throw error; }
        origin = before; active = key;
      } else if (action === 'leave' && active === key) {
        const state = read(), previous = origin;
        saved.set(key, state); active = null; origin = null; write(previous);
      }
    },
    clear() { saved.clear(); active = null; origin = null; }
  };
}
function contextFeedback(element) {
  return {text: element.textContent, attributes: ['data-result', 'data-verdict', 'data-code'].map(name => [name, element.getAttribute(name)])};
}
function restoreContextFeedback(element, state) {
  element.textContent = state.text;
  for (const [name, value] of state.attributes) if (value === null) element.removeAttribute(name); else element.setAttribute(name, value);
}

/* global document,requestAnimationFrame,cancelAnimationFrame */
const mounted = new WeakMap();
export const scenarios = Object.freeze([
  {label: '3 ja 2 samaan koriin', parts: [3, 2], names: ['Loikan', 'Aavan']},
  {label: '2 ja 2: yhtä suuret osat', parts: [2, 2], names: ['Loikan', 'Aavan']},
  {label: '1 ja 4 samaan koriin', parts: [1, 4], names: ['Loikan', 'Aavan']},
  {label: '5 ja 5 samaan koriin', parts: [5, 5], names: ['Loikan', 'Aavan']},
  {label: 'Lisäpohdinta: 2 ja 3 ja vielä 1', parts: [2, 3, 1], names: ['Loikan', 'Aavan', 'Löytynyt']}
].map(s => Object.freeze({...s, parts: Object.freeze(s.parts), names: Object.freeze(s.names)})));

function scenario(index) {
  if (!Number.isInteger(index) || index < 0 || index >= scenarios.length) throw new RangeError('Unsupported joining case');
  return scenarios[index];
}
export function sumParts(parts) {
  if (!Array.isArray(parts) || ![2, 3].includes(parts.length) || Object.keys(parts).length !== parts.length) throw new RangeError('Two or three dense parts required');
  let total = 0;
  for (let i = 0; i < parts.length; i++) {
    if (!Object.hasOwn(parts, i) || !Number.isInteger(parts[i]) || parts[i] < 1 || parts[i] > 6) throw new RangeError('Invalid part');
    total += parts[i];
  }
  if (total > 10) throw new RangeError('This model supports totals up to ten');
  return total;
}
export function joinState(index, progress) {
  const s = scenario(index), total = sumParts(s.parts);
  if (!Number.isFinite(progress) || progress < 0 || progress > total) throw new RangeError('Invalid joining progress');
  let id = 0;
  const pieces = s.parts.flatMap((n, part) => Array.from({length: n}, (_, local) => {
    const i = id++, startX = s.parts.length === 2 ? 42 + part * 220 + (local % 3) * 37 : 34 + part * 140 + (local % 3) * 34;
    const startY = 78 + Math.floor(local / 3) * 34, endX = 104 + (i % 5) * 48, endY = 226 + Math.floor(i / 5) * 39;
    const fraction = Math.max(0, Math.min(1, progress - i));
    return {id: i, part, joined: fraction === 1, fraction, x: startX + (endX - startX) * fraction, y: startY + (endY - startY) * fraction - Math.sin(Math.PI * fraction) * 22};
  }));
  return {total, joined: Math.floor(progress), remaining: total - Math.floor(progress), pieces};
}
export function drawJoin(index, progress) {
  const s = scenario(index), state = joinState(index, progress), colors = ['#9c482f', '#315f87', '#76558d'];
  const headings = s.parts.map((n, i) => `<text x="${s.parts.length === 2 ? 100 + i * 220 : 70 + i * 140}" y="30" text-anchor="middle">${s.names[i]} osa: ${n}</text>`).join('');
  const pieces = state.pieces.map(p => `<g data-piece="${p.id}" data-part="${p.part}" data-joined="${p.joined}"><circle cx="${p.x}" cy="${p.y}" r="13" fill="${colors[p.part]}" stroke="#183e36" stroke-width="2"/></g>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 310" role="img" aria-label="${s.parts.join(' ja ')} palaa yhdistetään. Korissa nyt ${state.joined}, ulkopuolella vielä ${state.remaining}. Yhteensä koko kuvassa ${state.total} palaa."><g font-family="sans-serif" font-size="18" fill="#183e36">${headings}<path d="M64 185H356L340 286H80Z" fill="#f0dfb9" stroke="#725b34" stroke-width="3"/><text x="210" y="173" text-anchor="middle">Yhteinen kori</text>${pieces}<text x="210" y="307" text-anchor="middle">Korissa nyt: ${state.joined}</text></g></svg>`;
}
function missing(value) { return value === null || value === undefined || value === ''; }
function validNumber(value) { return Number.isInteger(value) && value >= 0 && value <= 10; }
export function checkTotal(index, value) {
  const s = scenario(index), total = sumParts(s.parts);
  if (missing(value)) return {ok: false, code: 'missing', text: 'Kirjoita koko määrä. Saat katsoa kuvaa tai käyttää laskemisapua.'};
  if (!validNumber(value)) return {ok: false, code: 'invalid', text: 'Kirjoita kokonainen määrä 0–10.'};
  if (value === total) return {ok: true, code: 'correct', text: `Kyllä. ${s.parts.join(' ja ')} on yhteensä ${total}. Kaikki osat ovat mukana.`};
  return {ok: false, code: 'retry', text: s.parts.includes(value) ? 'Tuo on vain yhden osan määrä. Ota kaikki osat mukaan.' : value === total - 1 ? 'Vastauksesta puuttuu vielä yksi. Tarkista koko joukko.' : value === total + 1 ? 'Vastauksessa on yksi liikaa. Jokainen pala lasketaan vain kerran.' : 'Tarkista kaikkien osien yhteinen määrä. Voit laskea palat tai jatkaa ensimmäisen osan luvusta.'};
}
export function checkSentence(index, operands, result) {
  const s = scenario(index);
  if (!Array.isArray(operands) || operands.length !== s.parts.length || Object.keys(operands).length !== operands.length) throw new RangeError('Exact dense operand slots required');
  for (let i = 0; i < operands.length; i++) if (!Object.hasOwn(operands, i)) throw new RangeError('Missing operand slot');
  if (operands.some(missing) || missing(result)) return {ok: false, code: 'missing', text: 'Täytä osien luvut ja yhteinen määrä. Samaa lukua saa käyttää uudelleen.'};
  if (!operands.every(validNumber) || !validNumber(result)) return {ok: false, code: 'invalid', text: 'Käytä kokonaisia lukuja 0–10.'};
  const sorted = [...operands].sort((a, b) => a - b), required = [...s.parts].sort((a, b) => a - b);
  if (!sorted.every((n, i) => n === required[i])) return {ok: false, code: 'parts', text: `Kuvaa juuri nämä osat: ${s.parts.join(' ja ')}. Niiden järjestyksen saa vaihtaa.`};
  if (result !== sumParts(s.parts)) return {ok: false, code: 'total', text: 'Osien luvut sopivat. Tarkista vielä niiden yhteinen määrä merkin = jälkeen.'};
  return {ok: true, code: 'correct', text: `${operands.join(' + ')} = ${result}. Lasku kuvaa kaikkia osia. Osien järjestyksen saa vaihtaa.`};
}

export function mount(host) {
  const lab = host.closest('#lesson-body').querySelector('[data-add-lab]');
  mounted.get(lab)?.dispose(); lab.replaceChildren();
  const el = (tag, text) => { const e = document.createElement(tag); if (text) e.textContent = text; return e; };
  const button = (action, text) => { const b = el('button', text); b.type = 'button'; b.dataset.addAction = action; return b; };
  let index = 0, progress = 0, paused = false, disposed = false, running = false, frame = 0, last = null, totalKey = null, sentenceKey = null;
  const marked = new Set(), select = el('select'); select.dataset.addCase = ''; select.setAttribute('aria-label', 'Yhdistettävät osat'); select.style.maxWidth = '100%';
  scenarios.forEach((s, i) => { const o = el('option', s.label); o.value = String(i); select.append(o); });
  const view = el('div'), status = el('p'), controls = el('div'); view.dataset.addView = ''; view.style.maxWidth = '30rem'; status.dataset.addProgress = '';
  controls.append(button('play', 'Toista'), button('stop', 'Pysäytä'), button('step', 'Seuraava pala'), button('rewind', 'Esitys alkuun'));
  const totalLabel = el('label', 'Montako palaa kaikista osista tulee yhteensä?'), totalInput = el('input'); totalInput.type = 'number'; totalInput.min = '0'; totalInput.max = '10'; totalInput.step = '1'; totalInput.inputMode = 'numeric'; totalInput.dataset.addTotal = ''; totalInput.style.width = '7rem'; totalInput.style.maxWidth = '100%'; totalLabel.append(totalInput);
  const totalFeedback = el('p'); totalFeedback.dataset.addFeedback = ''; totalFeedback.setAttribute('aria-live', 'polite');
  const helper = el('details'); helper.append(el('summary', 'Laskemisapu, jos haluat')); const marks = el('div'), markStatus = el('p'); marks.dataset.addMarks = ''; markStatus.dataset.addMarked = ''; helper.append(el('p', 'Merkitse halutessasi kukin pala kerran. Merkit eivät ole vastaus, eikä niitä vaadita.'), marks, markStatus, button('clear-marks', 'Poista apumerkit'));
  const sentence = el('details'); sentence.append(el('summary', 'Lisäksi: täydennä lasku'), el('p', 'Plus + yhdistää osat. Merkki = kertoo, että molemmilla puolilla on sama määrä. Valitse osien luvut ja kirjoita yhteinen määrä. Samaa lukua voi käyttää monta kertaa.'));
  const slots = el('div'); slots.dataset.addSentence = ''; const sentenceFeedback = el('p'); sentenceFeedback.dataset.addSentenceFeedback = ''; sentenceFeedback.setAttribute('aria-live', 'polite'); sentence.append(slots, button('sentence-check', 'Tarkista lasku'), button('swap', 'Vaihda osien järjestys'), sentenceFeedback);
  const model=el('details');model.dataset.lessonRole='worked-example';model.append(el('summary','Tutki mallia'),el('p','Paina Toista. Palat siirtyvät samaan koriin. Voit pysäyttää tai siirtää yhden palan kerrallaan. Mikään pala ei katoa eikä tule kahdesti.'),view,status,controls);
  lab.append(select, totalLabel, button('check', 'Tarkista määrä'), totalFeedback, model, helper, sentence);
  const number = input => input.value === '' ? null : Number(input.value);
  const sentenceValues = () => ({operands: Array.from(slots.querySelectorAll('[data-add-operand]'), number), result: number(slots.querySelector('[data-add-result]'))});
  const signatureNumber = value => value === null ? 'missing' : Number.isFinite(value) ? 'number:' + value : 'invalid:' + String(value);
  const totalSignature = () => JSON.stringify([index, signatureNumber(number(totalInput))]);
  const sentenceSignature = () => { const v = sentenceValues(); return JSON.stringify([index, v.operands.map(signatureNumber).sort(), signatureNumber(v.result)]); };
  const neutral = feedback => { feedback.textContent = 'Vastaus muuttui. Tarkista uusi vastaus, kun haluat.'; delete feedback.dataset.result; };
  function invalidate() {
    if (totalKey !== null && totalKey !== totalSignature()) { totalKey = null; neutral(totalFeedback); }
    if (sentenceKey !== null && sentenceKey !== sentenceSignature()) { sentenceKey = null; neutral(sentenceFeedback); }
  }
  function stop() { running = false; cancelAnimationFrame(frame); last = null; }
  function stateControls() {
    for (const e of lab.querySelectorAll('button,input,select')) e.disabled = paused;
    controls.querySelector('[data-add-action=step]').disabled = paused || progress === sumParts(scenario(index).parts);
    controls.querySelector('[data-add-action=stop]').disabled = paused || !running;
  }
  function renderScene() {
    const state = joinState(index, progress); view.innerHTML = drawJoin(index, progress);
    status.textContent = progress === state.total ? `Kaikki ${state.total} palaa ovat korissa. Mitään ei tullut lisää eikä kadonnut.` : `Korissa nyt ${state.joined}. Ulkopuolella on vielä ${state.remaining}. Kysymys koskee kaikkien osien yhteistä määrää.`;
    stateControls();
  }
  function renderMarks() {
    marks.replaceChildren();
    for (const piece of joinState(index, 0).pieces) { const b = button('mark', `Pala ${piece.id + 1}${marked.has(piece.id) ? ' ✓' : ''}`); b.dataset.addPiece = String(piece.id); b.setAttribute('aria-pressed', String(marked.has(piece.id))); marks.append(b); }
    markStatus.textContent = `Apumerkkejä: ${marked.size}. Merkit eivät muuta palojen määrää.`; stateControls();
  }
  function newCase() {
    stop(); progress = 0; select.value = String(index); totalInput.value = ''; totalKey = null; sentenceKey = null; marked.clear();
    totalFeedback.textContent = 'Vastaa suoraan, jos tiedät. Kuvan ja laskemisavun käyttö on sallittu.'; delete totalFeedback.dataset.result;
    sentenceFeedback.textContent = ''; delete sentenceFeedback.dataset.result; slots.replaceChildren();
    scenario(index).parts.forEach((_, i) => { if (i) slots.append(el('span', ' + ')); const label = el('label', `Osan ${i + 1} luku`), input = el('select'); input.dataset.addOperand = String(i); const empty = el('option', 'Valitse'); empty.value = ''; input.append(empty); for (let n = 0; n <= 10; n++) { const o = el('option', String(n)); o.value = String(n); input.append(o); } label.append(input); slots.append(label); });
    slots.append(el('span', ' = ')); const resultLabel = el('label', 'Yhteinen määrä laskussa'), result = el('input'); result.type = 'number'; result.min = '0'; result.max = '10'; result.step = '1'; result.inputMode = 'numeric'; result.dataset.addResult = ''; result.style.width = '7rem'; result.style.maxWidth = '100%'; resultLabel.append(result); slots.append(resultLabel);
    renderScene(); renderMarks();
  }
  function tick(now) {
    if (!running || paused || disposed) return;
    const total = sumParts(scenario(index).parts); if (last !== null) progress = Math.min(total, progress + (now - last) / 1000 * 1.2); last = now;
    if (progress === total) stop(); renderScene(); if (running) frame = requestAnimationFrame(tick);
  }
  const show = (feedback, result) => { feedback.textContent = result.text; feedback.dataset.result = result.ok ? 'correct' : 'retry'; };
  const click = event => {
    if (paused || disposed) return; const target = event.target.closest('[data-add-action]'); if (!target) return; const action = target.dataset.addAction;
    if (action === 'check') { show(totalFeedback, checkTotal(index, number(totalInput))); totalKey = totalSignature(); return; }
    if (action === 'sentence-check') { const v = sentenceValues(); show(sentenceFeedback, checkSentence(index, v.operands, v.result)); sentenceKey = sentenceSignature(); return; }
    if (action === 'swap') { const inputs = Array.from(slots.querySelectorAll('[data-add-operand]')), values = inputs.map(i => i.value).reverse(); inputs.forEach((input, i) => { input.value = values[i]; }); invalidate(); return; }
    if (action === 'mark') { const id = Number(target.dataset.addPiece), hadFocus = document.activeElement === target; if (Number.isInteger(id) && id >= 0 && id < sumParts(scenario(index).parts)) { if (marked.has(id)) marked.delete(id); else marked.add(id); renderMarks(); if (hadFocus) marks.querySelector(`[data-add-piece="${id}"]`)?.focus({preventScroll: true}); } return; }
    if (action === 'clear-marks') { marked.clear(); renderMarks(); return; }
    if (action === 'stop') stop();
    if (action === 'rewind') { stop(); progress = 0; }
    if (action === 'step') { stop(); progress = Math.min(sumParts(scenario(index).parts), Math.floor(progress) + 1); }
    if (action === 'play' && !running) { if (progress === sumParts(scenario(index).parts)) progress = 0; running = true; last = null; frame = requestAnimationFrame(tick); }
    renderScene();
  };
  const edit = event => {
    if (paused || disposed) return;
    if (event.target === select) { const next = Number(select.value); scenario(next); index = next; newCase(); return; }
    if (event.target.matches('[data-add-total],[data-add-operand],[data-add-result]')) invalidate();
  };
  const reset = () => { if (disposed) return; index = 0; helper.open = false; sentence.open = false; newCase(); };
  const contexts = lessonContexts(
    () => ({index, progress, marked: [...marked], total: totalInput.value,
      operands: [...slots.querySelectorAll('[data-add-operand]')].map(input => input.value),
      result: slots.querySelector('[data-add-result]').value, totalKey, sentenceKey,
      totalFeedback: contextFeedback(totalFeedback), sentenceFeedback: contextFeedback(sentenceFeedback)}),
    state => {
      index = state.index; newCase(); progress = state.progress;
      totalInput.value = state.total;
      [...slots.querySelectorAll('[data-add-operand]')].forEach((input, i) => { input.value = state.operands[i]; });
      slots.querySelector('[data-add-result]').value = state.result;
      for (const piece of state.marked) marked.add(piece);
      totalKey = state.totalKey; sentenceKey = state.sentenceKey;
      restoreContextFeedback(totalFeedback, state.totalFeedback);
      restoreContextFeedback(sentenceFeedback, state.sentenceFeedback);
      model.open = helper.open = sentence.open = false; renderScene(); renderMarks();
    },
    preset => {
      const cases = {equal: 1, triple: 4};
      if (!Object.hasOwn(cases, preset)) throw new RangeError('Unsupported joining context');
      index = cases[preset]; model.open = helper.open = sentence.open = false; newCase();
    }
  );
  lab.addEventListener('click', click); lab.addEventListener('input', edit); lab.addEventListener('change', edit); reset();
  const api = {
    pause() { if (disposed) return; paused = true; stop(); stateControls(); },
    resume() { if (disposed) return; select.value = String(index); invalidate(); paused = false; stateControls(); },
    context(request) { if (!disposed) contexts.change(request); },
    reset() { contexts.clear(); reset(); },
    dispose() { if (disposed) return; contexts.clear(); disposed = true; stop(); lab.removeEventListener('click', click); lab.removeEventListener('input', edit); lab.removeEventListener('change', edit); lab.replaceChildren(); if (mounted.get(lab) === api) mounted.delete(lab); }
  };
  mounted.set(lab, api); return api;
}
