/* global document */
export function readInteger(value) {
  if (typeof value !== 'string' || !/^\d+$/.test(value.trim())) return null;
  const n = Number(value.trim());
  return Number.isSafeInteger(n) ? n : null;
}
export function packTotal(n) { return Number.isInteger(n) && n >= 0 && n <= 6 ? 3 * n : null; }
const fail = (code, message) => ({ok: false, code, message});
export function checkPlans(plans) {
  if (!Array.isArray(plans) || plans.length !== 2) return fail('shape', 'Tee kaksi eri suunnitelmaa.');
  const seen = new Set();
  for (let i = 0; i < 2; i++) {
    if (!Object.hasOwn(plans, i)) return fail('shape', 'Toinen suunnitelma puuttuu.');
    const plan = plans[i];
    if (!Array.isArray(plan) || plan.length !== 2 || !Object.hasOwn(plan, 0) || !Object.hasOwn(plan, 1)) return fail('shape', 'Suunnitelmaan tarvitaan n ja yhteismäärä K.');
    const [n, total] = plan;
    if (packTotal(n) === null) return fail('domain', `Suunnitelma ${i + 1}: valitse n kokonaisluvuista 0–6. Se on korttien määrä yhdessä pussissa.`);
    if (!Number.isSafeInteger(total)) return fail('missing', `Suunnitelma ${i + 1}: kirjoita korttien yhteismäärä K.`);
    if (total !== packTotal(n)) return fail('total', `Suunnitelma ${i + 1}: jokaisessa kolmessa pussissa on ${n} korttia. K = ${n} + ${n} + ${n} = ${packTotal(n)}.`);
    if (seen.has(n)) return fail('distinct', 'Molemmat suunnitelmat toimivat, mutta niissä on sama n. Valitse toiseen eri määrä: silloin näet, että n voi vaihdella.');
    seen.add(n);
  }
  return {ok: true, code: 'ok', message: 'Kaksi eri suunnitelmaa toimii. n voi vaihtua suunnitelmien välillä. Yhden suunnitelman jokaisessa pussissa n on sama.'};
}
export function checkOrder(n, target) {
  if (target !== 12 && target !== 15) return fail('target', 'Käytä annettua tilausta: 12 tai 15 korttia.');
  if (packTotal(n) === null) return fail('domain', 'Kirjoita n kokonaisluvuista 0–6. Tässä ehdotat jo pakatun pussin sisältöä.');
  if (packTotal(n) !== target) return fail('total', `Ehdotus n = ${n} antaa yhteensä ${packTotal(n)} korttia, mutta tilauksessa on ${target}. Sama n on kaikissa kolmessa pussissa. Kokeile ${target} ÷ 3.`);
  return {ok: true, code: 'ok', message: `Tilauksen tuntematon on n = ${n}: ${n} + ${n} + ${n} = ${target}. Ehdotus löysi annetun sisällön; se ei muuttanut tilausta.`};
}
export function checkIntegration(plans, n, target) {
  const planning = checkPlans(plans), order = checkOrder(n, target);
  return {ok: planning.ok && order.ok, planning, order, message: planning.ok && order.ok ? 'Sovelsit samaa n:ää kahdessa roolissa: suunnitelmissa se sai eri arvoja, annetussa tilauksessa sen arvo piti löytää.' : 'Tarkista alla erikseen vapaat suunnitelmat ja annettu tilaus. Koko työ tarvitsee molemmat.'};
}
const mounts = new WeakMap();
export function mount(host) {
  const body = host.closest('#lesson-body') ?? host;
  const root = body.querySelector('[data-variable-integration]');
  if (!root) throw new Error('Muuttujan integraation lähdemerkintä puuttuu');
  mounts.get(root)?.dispose();
  let paused = false, disposed = false;
  const query = selector => root.querySelector(selector);
  const outputs = {planning: query('[data-plan-feedback]'), order: query('[data-order-feedback]'), all: query('[data-all-feedback]')};
  const neutral = key => { outputs[key].dataset.verdict = 'neutral'; outputs[key].textContent = 'Vastausta on muokattu. Tarkista nykyinen työ.'; };
  const value = selector => readInteger(query(selector).value);
  const renderModel = () => {
    const n = readInteger(query('[data-explore-n]').value);
    const total = packTotal(n);
    const picture = query('[data-packs]'); picture.replaceChildren();
    if (total === null) { query('[data-explore-text]').textContent = 'Valitse malliin kokonaisluku 0–6.'; return; }
    for (let group = 0; group < 3; group++) {
      const bag = document.createElement('div'); bag.className = 'vi-bag';
      const label = document.createElement('strong'); label.textContent = `n = ${n}`; bag.append(label);
      const dots = document.createElement('span'); dots.textContent = n ? Array(n).fill('●').join(' ') : 'tyhjä'; dots.setAttribute('aria-hidden', 'true'); bag.append(dots); picture.append(bag);
    }
    picture.setAttribute('aria-label', `Kolme pussia, jokaisessa ${n} korttia, yhteensä ${total}`);
    query('[data-explore-text]').textContent = `${n} + ${n} + ${n} = ${total}. Kun vaihdat n:ää, sama muutos koskee kaikkia kolmea pussia.`;
  };
  const onCommit = event => {
    if (paused || disposed) return;
    if (event.target.matches('[data-explore-n]')) { renderModel(); return; }
    if (event.target.matches('[data-plan-n], [data-plan-total]')) { neutral('planning'); neutral('all'); }
    if (event.target.matches('[data-order-n]')) { neutral('order'); neutral('all'); }
    if (event.target.matches('[data-target]')) {
      query('[data-target-text]').textContent = event.target.value;
      // The new target changes the unknown problem, not the two free plans.
      neutral('order'); neutral('all');
    }
  };
  const show = (key, result) => { outputs[key].textContent = result.message; outputs[key].dataset.verdict = result.ok ? 'correct' : 'retry'; };
  const onClick = event => {
    if (paused || disposed || !event.target.closest('[data-check-integration]')) return;
    query('[data-target-text]').textContent = query('[data-target]').value;
    const plans = [0, 1].map(i => [value(`[data-plan-n="${i}"]`), value(`[data-plan-total="${i}"]`)]);
    const result = checkIntegration(plans, value('[data-order-n]'), value('[data-target]'));
    show('planning', result.planning); show('order', result.order); show('all', result);
  };
  root.addEventListener('input', onCommit); root.addEventListener('change', onCommit); root.addEventListener('click', onClick);
  const controls = () => root.querySelectorAll('button, input, select');
  const reset = () => {
    if (disposed) return;
    for (const input of root.querySelectorAll('[data-plan-n], [data-plan-total], [data-order-n]')) input.value = '';
    query('[data-target]').value = '12'; query('[data-target-text]').textContent = '12'; query('[data-explore-n]').value = '2'; renderModel();
    for (const [key, output] of Object.entries(outputs)) { output.dataset.verdict = 'neutral'; output.textContent = key === 'all' ? 'Tee kaksi eri suunnitelmaa ja ratkaise annettu tilaus. Tarkista sitten koko työ.' : 'Odottaa vastausta.'; }
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
