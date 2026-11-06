/* global document */
export const INPUTS = Object.freeze([0, 2, 5]);
export const RULES = Object.freeze({
  seats: Object.freeze({text: 'y = 2x + 1', meaning: 'x = pöytien määrä, y = tuolien määrä. Kaksi tuolia joka pöydälle ja yksi ohjaajalle.', hint: 'Kerro pöytien määrä kahdella. Lisää yksi tuoli vain kerran.'}),
  stock: Object.freeze({text: 'y = 8 − x', meaning: 'x = noudetut paketit, y = jäljellä olevat paketit. Aluksi on 8 pakettia.', hint: 'Vähennä noudettujen pakettien määrä kahdeksasta.'}),
  fixed: Object.freeze({text: 'y = 4', meaning: 'x = kävijöiden määrä, y = ilmoitustaulujen määrä. Tässä salissa on aina 4 ilmoitustaulua.', hint: 'Kävijöiden määrä ei muuta ilmoitustaulujen määrää.'}),
});
export function evaluate(rule, x) {
  if (typeof rule !== 'string' || !Object.hasOwn(RULES, rule) || !Number.isInteger(x) || x < 0 || x > 5) return null;
  return rule === 'seats' ? 2 * x + 1 : rule === 'stock' ? 8 - x : 4;
}
export function readInteger(value) {
  if (typeof value !== 'string' || !/^[−-]?\d+$/.test(value.trim())) return null;
  const n = Number(value.trim().replace('−', '-'));
  return Number.isSafeInteger(n) ? n : null;
}
const fail = (code, message) => ({ok: false, code, message});
export function checkTable(rule, rows) {
  if (typeof rule !== 'string' || !Object.hasOwn(RULES, rule)) return fail('rule', 'Valitse annettu sääntö.');
  if (!Array.isArray(rows) || rows.length !== 3) return fail('shape', 'Taulukkoon tarvitaan kolme riviä: syötteet 0, 2 ja 5.');
  const seen = new Set();
  for (let i = 0; i < rows.length; i++) {
    if (!Object.hasOwn(rows, i)) return fail('shape', 'Yksi taulukon riveistä puuttuu.');
    const row = rows[i];
    if (!Array.isArray(row) || row.length !== 2 || !Object.hasOwn(row, 0) || !Object.hasOwn(row, 1)) return fail('shape', 'Jokainen rivi tarvitsee syötteen x ja sen tuloksen y.');
    const [x, y] = row;
    if (!INPUTS.includes(x) || seen.has(x)) return fail('input', 'Kirjaa kukin pyydetty syöte 0, 2 ja 5 täsmälleen kerran.');
    seen.add(x);
    if (!Number.isSafeInteger(y)) return fail('missing', `Kirjoita kokonaisluku riville x = ${x}.`);
    const expected = evaluate(rule, x);
    if (y !== expected) {
      const calculation = rule === 'seats' ? `2 · ${x} + 1 = ${expected}` : rule === 'stock' ? `8 − ${x} = ${expected}` : 'Tässä y = 4 jokaisella sallitulla syötteellä';
      return fail('value', `Rivillä x = ${x} kirjoitit y = ${y}. ${calculation}. Pidä syöte ja sen oma tulos samalla rivillä.`);
    }
  }
  return {ok: true, code: 'ok', message: 'Kaikki kolme syöte–tulosparia vastaavat sääntöä. Jokainen rivi kertoo, mitä juuri tästä syötteestä tulee.'};
}
const mounts = new WeakMap();
export function mount(host) {
  const body = host.closest('#lesson-body') ?? host;
  const root = body.querySelector('[data-func-table]');
  if (!root) throw new Error('Arvotaulukon lähdemerkintä puuttuu');
  mounts.get(root)?.dispose();
  const select = root.querySelector('[data-rule]');
  const rowsHost = root.querySelector('[data-rows]');
  const feedback = root.querySelector('[data-feedback]');
  let rule = 'seats', order = [...INPUTS], values = new Map(), paused = false, disposed = false;
  const clearFeedback = () => { feedback.textContent = 'Taulukkoa on muokattu. Tarkista nykyiset parit.'; feedback.dataset.verdict = 'neutral'; };
  const controls = () => root.querySelectorAll('button, input, select');
  const renderRows = () => {
    rowsHost.replaceChildren();
    for (const x of order) {
      const row = document.createElement('tr');
      const cellX = document.createElement('th'); cellX.scope = 'row'; cellX.textContent = String(x);
      const cellY = document.createElement('td');
      const input = document.createElement('input'); input.type = 'number'; input.step = '1'; input.inputMode = 'numeric'; input.dataset.answerX = String(x); input.setAttribute('aria-label', `Tulos y, kun x on ${x}`); input.value = values.get(x) ?? ''; input.disabled = paused;
      cellY.append(input); row.append(cellX, cellY); rowsHost.append(row);
    }
  };
  const renderRule = () => {
    root.querySelector('[data-rule-text]').textContent = RULES[rule].text;
    root.querySelector('[data-rule-meaning]').textContent = RULES[rule].meaning;
    root.querySelector('[data-help-text]').textContent = RULES[rule].hint;
  };
  const rememberVisibleRows = () => {
    values = new Map(Array.from(rowsHost.querySelectorAll('[data-answer-x]'), input => [Number(input.dataset.answerX), input.value]));
  };
  const onCommit = event => {
    if (paused || disposed) return;
    if (event.target === select) {
      if (select.value === rule) return;
      if (!Object.hasOwn(RULES, select.value)) { clearFeedback(); return; }
      rule = select.value; values = new Map(); renderRule(); renderRows();
      feedback.textContent = 'Sääntö vaihtui. Rakenna sille uusi taulukko.'; feedback.dataset.verdict = 'neutral';
    } else if (event.target.matches('[data-answer-x]')) {
      values.set(Number(event.target.dataset.answerX), event.target.value);
      clearFeedback();
    }
  };
  const onClick = event => {
    const button = event.target.closest('button');
    if (paused || disposed || !button || !root.contains(button)) return;
    if (button.hasAttribute('data-check')) {
      rule = select.value;
      if (Object.hasOwn(RULES, rule)) renderRule();
      rememberVisibleRows();
      const visibleRows = Array.from(rowsHost.querySelectorAll('[data-answer-x]'), input => [Number(input.dataset.answerX), readInteger(input.value)]);
      const result = checkTable(rule, visibleRows);
      feedback.textContent = result.message; feedback.dataset.verdict = result.ok ? 'correct' : 'retry';
    }
    // Reordering rows preserves the x ↔ y associations and any valid verdict.
    if (button.hasAttribute('data-reorder')) { rememberVisibleRows(); order = [...order.slice(1), order[0]]; renderRows(); }
    if (button.hasAttribute('data-clear')) { values = new Map(); renderRows(); clearFeedback(); }
  };
  root.addEventListener('input', onCommit); root.addEventListener('change', onCommit); root.addEventListener('click', onClick);
  const reset = () => {
    if (disposed) return;
    rule = 'seats'; order = [...INPUTS]; values = new Map(); select.value = rule; renderRule(); renderRows();
    feedback.textContent = 'Kirjaa tulokset. Voit käyttää vihjettä tai aloittaa miltä riviltä tahansa.'; feedback.dataset.verdict = 'neutral';
    for (const control of controls()) control.disabled = paused;
  };
  const api = {
    pause() { if (disposed) return; paused = true; for (const control of controls()) control.disabled = true; },
    resume() { if (disposed) return; paused = false; for (const control of controls()) control.disabled = false; },
    reset,
    dispose() { if (disposed) return; disposed = true; root.removeEventListener('input', onCommit); root.removeEventListener('change', onCommit); root.removeEventListener('click', onClick); for (const control of controls()) control.disabled = true; if (mounts.get(root) === api) mounts.delete(root); },
  };
  mounts.set(root, api); reset(); return api;
}
