export const TASKS = Object.freeze([
  Object.freeze({groups: 4, size: 3, context: 'Neljä tarjotinta, jokaisella kolme palikkaa.'}),
  Object.freeze({groups: 3, size: 2, context: 'Kolme hyllyä, jokaisella kaksi purkkia.'})
]);
export function sumValue(terms) { return terms.reduce((total, term) => total + term, 0); }
export function checkConnection(task, terms, groups, size) {
  if (!Array.isArray(terms) || !Number.isFinite(groups) || !Number.isFinite(size)) throw new RangeError('Dense numeric terms and finite factor values required');
  for (let index = 0; index < terms.length; index++) if (!Object.hasOwn(terms, index) || !Number.isFinite(terms[index])) throw new RangeError('Each sum term must be a finite number');
  const total = task.groups * task.size;
  if (terms.length !== task.groups || terms.some(term => term !== task.size)) {
    const same = terms.length > 0 && sumValue(terms) === total;
    return {ok: false, text: (same ? 'Summasi antaa saman kokonaismäärän. ' : '') + `Tässä rakennamme kuvan ryhmät: ${task.groups} ryhmää, jokaisessa ${task.size}. Lisää yksi ${task.size} jokaista ryhmää kohti.`};
  }
  if (groups !== task.groups || size !== task.size) {
    return {ok: false, text: (groups * size === total ? 'Kertolaskusi antaa saman määrän. ' : '') + `Kuvan ryhmityksessä ensimmäinen luku kertoo ryhmien määrän (${task.groups}) ja toinen yhden ryhmän koon (${task.size}). Näytä nämä kuvan mukaan.`};
  }
  return {ok: true, text: `${terms.join(' + ')} = ${groups} × ${size} = ${total}. Yksi summan luku kertoo yhden ryhmän koon. Kertolaskun ensimmäinen luku kertoo, montako tällaista ryhmää on.`};
}
export function counterPositions(task, step) {
  const fraction = Math.max(0, Math.min(4, step)) / 4;
  return Array.from({length: task.groups * task.size}, (_, id) => {
    const group = Math.floor(id / task.size), item = id % task.size;
    const startX = 38 + group * (244 / Math.max(1, task.groups - 1)) + (item - (task.size - 1) / 2) * 14;
    const endX = 130 + item * 28;
    return {id, group, x: startX * (1 - fraction) + endX * fraction, y: 62 * (1 - fraction) + (45 + group * 38) * fraction};
  });
}
export function counterScene(task, step) {
  const colours = ['#285eaa', '#87522d', '#2a7158', '#99506b'];
  const counters = counterPositions(task, step).map(p => `<circle data-counter="${p.id}" cx="${p.x}" cy="${p.y}" r="5" fill="${colours[p.group]}"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 225" width="320" height="225" role="img" aria-label="${task.groups} ryhmää, joissa kussakin ${task.size} esinettä. Vaihe ${step}."><rect width="320" height="225" fill="#fffdf6"/>${counters}<text x="160" y="210" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#183e36">Samat ryhmät, uusi järjestys</text></svg>`;
}
export function mount(host) {
  const root = host.closest('#lesson-body')?.querySelector('[data-connection-lesson]');
  if (!root) throw new Error('M-TH-08 root missing');
  const area = root.querySelector('[data-connection-practice]'), controls = area.querySelector('fieldset');
  let index = 0, step = 0, terms = [], paused = false, disposed = false;
  const q = selector => area.querySelector(selector);
  const feedback = (text, ok) => { q('[data-feedback]').textContent = text; q('[data-feedback]').dataset.result = ok === undefined ? 'support' : ok ? 'correct' : 'retry'; };
  function render() {
    const task = TASKS[index];
    q('[data-context]').textContent = task.context;
    q('[data-scene]').innerHTML = counterScene(task, step);
    q('[data-sum]').textContent = terms.length ? terms.join(' + ') : 'Summassa ei vielä ole ryhmiä.';
    q('[data-step-note]').textContent = step === 4 ? 'Samat ryhmät ovat nyt riveinä. Yhtäkään esinettä ei lisätty tai poistettu.' : 'Voit siirtää samat ryhmät riveiksi neljässä vaiheessa.';
    q('[data-action="step"]').disabled = step === 4;
    q('[data-action="undo"]').disabled = terms.length === 0;
    controls.disabled = paused;
  }
  function clearPractice() { terms = []; q('[data-groups]').value = ''; q('[data-size]').value = ''; feedback('Rakenna kuvan ryhmät summaksi ja kertolaskuksi.'); render(); }
  function click(event) {
    if (paused || disposed) return;
    const b = event.target.closest('button'); if (!b || !area.contains(b)) return;
    if (b.dataset.term) {
      if (terms.length < 6) terms.push(Number(b.dataset.term));
      feedback('Summan yksi luku vastaa yhtä kuvan ryhmää. Voit poistaa viimeisen.');
    } else if (b.dataset.action === 'undo') { terms.pop(); feedback('Voit korjata summaa.'); }
    else if (b.dataset.action === 'step') step = Math.min(4, step + 1);
    else if (b.dataset.action === 'rewind') step = 0;
    else if (b.dataset.action === 'clear') { clearPractice(); return; }
    else if (b.dataset.action === 'next') { index = (index + 1) % TASKS.length; step = 0; clearPractice(); return; }
    else if (b.dataset.action === 'check') { const result = checkConnection(TASKS[index], terms, Number(q('[data-groups]').value), Number(q('[data-size]').value)); feedback(result.text, result.ok); }
    render();
  }
  function change() { if (!paused && !disposed) feedback('Kertolaskun luvut muuttuivat. Voit tarkistaa uuden vastauksen.'); }
  area.hidden = false; area.addEventListener('click', click); area.addEventListener('change', change); clearPractice();
  return {pause() { if (!disposed) { paused = true; controls.disabled = true; } }, resume() { if (!disposed) { paused = false; controls.disabled = false; } }, reset() { if (!disposed) { index = 0; step = 0; clearPractice(); } }, dispose() { if (disposed) return; disposed = true; area.removeEventListener('click', click); area.removeEventListener('change', change); area.hidden = true; q('[data-scene]').replaceChildren(); }};
}
