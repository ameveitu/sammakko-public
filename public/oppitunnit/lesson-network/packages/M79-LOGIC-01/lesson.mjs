export const OBSERVATIONS = Object.freeze([{input: 1, output: 5}, {input: 2, output: 8}, {input: 4, output: 14}]);
export function evaluateRule(a, b, input) { return a * input + b; }
export function checkRule(a, b, pairs = OBSERVATIONS) {
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Array.isArray(pairs) || pairs.length === 0) throw new RangeError('Finite rule coefficients and a nonempty observation array required');
  for (let index = 0; index < pairs.length; index++) {
    const pair = pairs[index];
    if (!Object.hasOwn(pairs, index) || !pair || typeof pair !== 'object' || Array.isArray(pair) || !Object.hasOwn(pair, 'input') || !Object.hasOwn(pair, 'output') || !Number.isFinite(pair.input) || !Number.isFinite(pair.output)) throw new RangeError('Each observation must contain finite input and output values');
    if (!Number.isFinite(evaluateRule(a, b, pair.input))) throw new RangeError('Rule result exceeds finite numeric range');
  }
  const failed = pairs.find(p => evaluateRule(a, b, p.input) !== p.output);
  if (failed) return {ok: false, text: `Vastaesimerkki: syötteellä ${failed.input} sääntösi antaa ${a} × ${failed.input} + (${b}) = ${evaluateRule(a, b, failed.input)}. Taulukossa tulos on ${failed.output}. Tämä ehdotus ei sovi kaikkiin annettuihin pareihin.`};
  return {ok: true, text: `Sääntö ${a}x ${b < 0 ? '− ' + -b : '+ ' + b} sopii kaikkiin annettuihin pareihin. Tämä ei yksin todista ainoaa mahdollista sääntöä kaikille luvuille. Rajatuista muodon ax + b säännöistä löytyi sopiva ehdokas.`};
}
export function squareEdges(n) {
  if (!Number.isInteger(n) || n < 1 || n > 8) throw new RangeError('Square count must be 1–8');
  const edges = new Map();
  for (let x = 0; x < n; x++) {
    for (const [x1, y1, x2, y2] of [[x, 0, x + 1, 0], [x, 1, x + 1, 1], [x, 0, x, 1], [x + 1, 0, x + 1, 1]]) {
      const key = `${x1},${y1},${x2},${y2}`;
      if (!edges.has(key)) edges.set(key, {key, x1, y1, x2, y2, addedAt: x + 1});
    }
  }
  return [...edges.values()];
}
export const FORMULAS = Object.freeze({shared: n => 3 * n + 1, first: n => 4 + 3 * (n - 1), separate: n => 4 * n, missing: n => 3 * n});
export function checkFormula(key) {
  if (!Object.hasOwn(FORMULAS, key)) throw new RangeError('Unknown formula');
  for (let n = 1; n <= 8; n++) {
    const actual = squareEdges(n).length, prediction = FORMULAS[key](n);
    if (prediction !== actual) return {ok: false, text: `Tarkista ${n} vierekkäistä neliötä: kaava antaa ${prediction}, kuvassa on ${actual} eri viivanpätkää. Yhteinen sivu käytetään vain kerran. Kaavan pitää vastata koko rakennusohjetta, ei vain yhtä kuvaa.`};
  }
  return {ok: true, text: 'Kaava sopii rakennusohjeeseen: ensimmäiseen neliöön neljä pätkää, jokaiseen seuraavaan kolme lisää. 4 + 3(n − 1) ja 3n + 1 kertovat saman rakenteen, kun n on vähintään 1.'};
}
export function squaresScene(n) {
  const edges = squareEdges(n).map(e => `<line data-edge="${e.key}" x1="${26 + e.x1 * 32}" y1="${35 + e.y1 * 32}" x2="${26 + e.x2 * 32}" y2="${35 + e.y2 * 32}" stroke="${e.addedAt === n ? '#aa482b' : '#285e72'}" stroke-width="4"/>`).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 170" width="320" height="170" role="img" aria-label="${n} vierekkäistä neliötä kaaviokuvana, ${squareEdges(n).length} erillistä sivupätkää. Viimeisen neliön uudet pätkät korostettu."><rect width="320" height="170" fill="#fffdf6"/>${edges}<text x="26" y="143" font-family="sans-serif" font-size="18" fill="#183e36">${n} neliötä: ${squareEdges(n).length} pätkää</text></svg>`;
}
export function mount(host) {
  const root = host.closest('#lesson-body')?.querySelector('[data-rule-lesson]'); if (!root) throw new Error('M79-LOGIC-01 root missing');
  const area = root.querySelector('[data-rule-practice]'), controls = area.querySelector('fieldset');
  const q = s => area.querySelector(s);
  let tested = [], n = 1, paused = false, disposed = false;
  function message(selector, text, ok) { const e = q(selector); e.textContent = text; e.dataset.result = ok === undefined ? 'support' : ok ? 'correct' : 'retry'; }
  const candidate = () => [Number(q('[data-a]').value), Number(q('[data-b]').value)];
  function render() {
    const [a, b] = candidate();
    q('[data-candidate]').textContent = `Ehdotus: kerro syöte luvulla ${a}, lisää ${b < 0 ? '(' + b + ')' : b}.`;
    const table = q('[data-tested]'); table.replaceChildren();
    for (const index of tested) { const pair = OBSERVATIONS[index], value = evaluateRule(a, b, pair.input), li = root.ownerDocument.createElement('li'); li.textContent = `${pair.input} → ${a} × ${pair.input} + (${b}) = ${value}; annettu tulos ${pair.output}. ${value === pair.output ? 'Täsmää.' : 'Ei täsmää.'}`; table.append(li); }
    q('[data-action="step"]').disabled = tested.length === OBSERVATIONS.length;
    q('[data-squares]').innerHTML = squaresScene(n);
    q('[data-action="minus"]').disabled = n === 1; q('[data-action="plus"]').disabled = n === 8;
    q('[data-square-note]').textContent = n === 1 ? 'Ensimmäinen neliö tarvitsee neljä sivupätkää.' : `Viimeinen neliö lisäsi kolme pätkää. Sen vasen sivu oli jo edellisessä kuvassa. Nyt pätkiä on ${3 * n + 1}.`;
    controls.disabled = paused;
  }
  function reset() { tested = []; n = 1; q('[data-a]').value = '1'; q('[data-b]').value = '4'; q('[data-formula]').value = 'separate'; message('[data-feedback]', 'Ehdota ja koettele. Ensimmäinen pari ei riitä.'); message('[data-formula-feedback]', 'Tutki ensin, mitä uusi neliö lisää.'); render(); }
  function change(event) {
    if (paused || disposed) return;
    if (event.target.matches('[data-a], [data-b]')) { tested = []; message('[data-feedback]', 'Ehdotus vaihtui. Aiempien laskujen tulokset tyhjennettiin.'); }
    if (event.target.matches('[data-formula]')) message('[data-formula-feedback]', 'Kaava vaihtui. Tarkista se uudelleen.');
    render();
  }
  function click(event) {
    if (paused || disposed) return;
    const b = event.target.closest('button'); if (!b || !area.contains(b)) return;
    const action = b.dataset.action;
    if (action === 'step') { if (tested.length < OBSERVATIONS.length) tested.push(tested.length); }
    else if (action === 'all') tested = [0, 1, 2];
    else if (action === 'check') { const result = checkRule(...candidate()); message('[data-feedback]', result.text, result.ok); }
    else if (action === 'plus') { n = Math.min(8, n + 1); message('[data-formula-feedback]', 'Kuva muuttui. Voit verrata kaavaa uuteen kuvaan.'); }
    else if (action === 'minus') { n = Math.max(1, n - 1); message('[data-formula-feedback]', 'Kuva muuttui. Voit tutkia rakennetta uudelleen.'); }
    else if (action === 'check-formula') { const result = checkFormula(q('[data-formula]').value); message('[data-formula-feedback]', result.text, result.ok); }
    else if (action === 'reset') { reset(); return; }
    render();
  }
  area.hidden = false; area.addEventListener('click', click); area.addEventListener('change', change); reset();
  return {pause() { if (!disposed) { paused = true; controls.disabled = true; } }, resume() { if (!disposed) { paused = false; controls.disabled = false; } }, reset() { if (!disposed) reset(); }, dispose() { if (disposed) return; disposed = true; area.removeEventListener('click', click); area.removeEventListener('change', change); area.hidden = true; q('[data-tested]').replaceChildren(); q('[data-squares]').replaceChildren(); }};
}
