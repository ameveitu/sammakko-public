const bounded = n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 10;
const own = (o, k) => typeof k === 'string' && Object.hasOwn(o, k);
export const CASES = Object.freeze({
  shells: Object.freeze({a: 2, b: 4, text: 'Rasiassa on 2 valkoista ja 4 oranssia simpukkaa. Kirjoita, mitkä määrät yhdistetään.', kind: 'union'}),
  birds: Object.freeze({a: 1, b: 3, text: 'Oksalla on 1 lintu. Oksalle tulee 3 lintua lisää. Kirjoita määrät yhdistävä lasku.', kind: 'arrival'}),
  pencils: Object.freeze({a: 4, b: 3, text: 'Kynäkotelossa on 4 lyijykynää ja 3 värikynää. Kirjoita, mitkä määrät yhdistetään.', kind: 'union'})
});
export function union(a, b) {
  return bounded(a) && bounded(b) && a + b <= 10 ? a + b : null;
}
export function readAddition(raw) {
  if (typeof raw !== 'string') return null;
  const m = /^\s*(\d{1,2})\s*\+\s*(\d{1,2})\s*$/.exec(raw);
  if (!m || !bounded(Number(m[1])) || !bounded(Number(m[2]))) return null;
  return [Number(m[1]), Number(m[2])];
}
export function checkAddition(key, raw) {
  if (!own(CASES, key)) return {ok: false, message: 'Valitse kuvan tilanne.'};
  const c = CASES[key], pair = readAddition(raw);
  if (!pair) return {ok: false, message: 'Kirjoita kaksi kuvan määrää ja niiden väliin +. Esimerkiksi 1 + 2. Pelkkä yhteismäärä ei vielä kerro molempia osia.'};
  const [a, b] = pair;
  if ((a === c.a && b === c.b) || (a === c.b && b === c.a)) return {ok: true, message: `${a} + ${b}: molemmat kuvan määrät ovat mukana. Yhteensä ${c.a + c.b}. Myös ${b} + ${a} kertoo saman yhteismäärän.`};
  return {ok: false, message: a + b === c.a + c.b ? `Laskusi yhteismäärä on ${a + b}. Näissä kahdessa kuvan osassa on kuitenkin ${c.a} ja ${c.b}. Kuvaa juuri nämä osat.` : `Kuvan osat ovat ${c.a} ja ${c.b}. Plus yhdistää ne. Tarkista, että kumpikin määrä on mukana kerran.`};
}
const dot = (i, x, y, color, tag = '') => `<circle ${tag} cx="${x + (i % 5) * 25}" cy="${y + Math.floor(i / 5) * 27}" r="8" fill="${color}" stroke="#24493f" stroke-width="1.5"/>`;
const dots = (n, x, y, color, tag = 'data-object') => Array.from({length: n}, (_, i) => dot(i, x, y, color, `${tag}="${i}"`)).join('');
const frame = (label, content) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 190" role="img" aria-label="${label}"><title>${label}</title><g font-family="sans-serif" fill="#183e36">${content}</g></svg>`;
export function modelSvg(mode, step) {
  if (!['arrival', 'union'].includes(mode) || typeof step !== 'number' || !Number.isInteger(step) || step < 0 || step > (mode === 'arrival' ? 2 : 1)) return '';
  const a = 3, b = 2;
  if (mode === 'arrival') return frame(`Aluksi 3 marjaa. ${step} marjaa on tullut lisää, ${2 - step} odottaa.`,
    `<text x="85" y="25" text-anchor="middle" font-size="17">Kulhossa nyt ${a + step}</text><text x="270" y="25" text-anchor="middle" font-size="17">Vielä tulossa ${b - step}</text><rect x="8" y="38" width="155" height="85" rx="10" fill="#edf5ef" stroke="#668b7a"/>` +
    dots(a, 30, 67, '#328372', 'data-initial') + dots(step, 30, 97, '#e0b56a', 'data-arrived') + dots(b - step, 245, 67, '#e0b56a', 'data-waiting') +
    `<path d="M218 92 H180 M190 84 L180 92 L190 100" fill="none" stroke="#24493f" stroke-width="3"/><text x="180" y="160" text-anchor="middle" font-size="23">${step === 2 ? '3 + 2: yhteensä 5' : 'Aluksi 3. Tulossa 2 lisää.'}</text>`);
  return frame('Kolme vihreää ja kaksi keltaista merkkiä yhdistetään. Yhteensä viisi.', step === 0 ?
    `<text x="86" y="25" text-anchor="middle" font-size="18">Ensimmäinen osa: 3</text><text x="273" y="25" text-anchor="middle" font-size="18">Toinen osa: 2</text>${dots(a, 45, 75, '#328372', 'data-first')}${dots(b, 252, 75, '#e0b56a', 'data-part-b')}<text x="180" y="156" text-anchor="middle" font-size="20">Molemmat osat ovat jo tässä.</text>` :
    `<rect x="65" y="40" width="230" height="80" rx="12" fill="#edf5ef" stroke="#668b7a"/><text x="180" y="25" text-anchor="middle" font-size="18">Osat yhdessä</text>${dots(a, 100, 75, '#328372', 'data-first')}${dots(b, 185, 75, '#e0b56a', 'data-part-b')}<text x="180" y="160" text-anchor="middle" font-size="23">3 + 2: yhteensä 5</text>`);
}
export function practiceSvg(key) {
  if (!own(CASES, key)) return '';
  const {a, b} = CASES[key];
  return frame(`Kaksi osaa: ${a} ja ${b}.`, `<text x="85" y="25" text-anchor="middle" font-size="18">Yksi osa: ${a}</text><text x="273" y="25" text-anchor="middle" font-size="18">Toinen osa: ${b}</text>${dots(a, 32, 65, '#328372', 'data-first')}${dots(b, 220, 65, '#e0b56a', 'data-part-b')}<text x="180" y="153" text-anchor="middle" font-size="19">Yksi merkki esittää yhtä esinettä.</text>`);
}
const mounted = new WeakMap();
export function mount(host) {
  mounted.get(host)?.dispose();
  const root = host.closest('#lesson-body')?.querySelector('[data-plus-lesson]');
  if (!root) return {pause(){}, resume(){}, reset(){}, dispose(){}};
  const q = s => root.querySelector(s), fields = [...root.querySelectorAll('fieldset')];
  let disposed = false, paused = false, mode = 'arrival', step = 0, signature = '';
  const report = (state, text) => {q('[data-feedback]').dataset.verdict = state; q('[data-feedback]').textContent = text;};
  function model() {
    q('[data-model-title]').textContent = mode === 'arrival' ? 'Ota yksi marja mukaan' : 'Yhdistä kaksi valmista osaa';
    q('[data-prediction]').textContent = mode === 'arrival' ? 'Mieti ensin: montako marjaa kulhossa on, kun molemmat ovat tulleet?' : 'Mieti ensin: muuttuuko yhteismäärä, kun laitat molemmat osat yhteen?';
    q('[data-model-picture]').innerHTML = modelSvg(mode, step);
    q('[data-plus-action="step"]').textContent = mode === 'arrival' ? 'Yksi marja mukaan' : 'Yhdistä osat';
    q('[data-plus-action="step"]').disabled = paused || step === (mode === 'arrival' ? 2 : 1);
    q('[data-model-caption]').textContent = mode === 'arrival' ? `Aluksi 3 marjaa. Tuli ${step} lisää. Nyt ${3 + step}.` : step ? 'Molemmat osat samassa joukossa. Mitään ei tullut lisää ulkopuolelta.' : 'Kolme ja kaksi ovat eri osissa. Yhdistä ne.';
  }
  function sync() {
    const key = q('[data-case]').value, raw = q('[data-expression]').value;
    const sig = JSON.stringify([key, raw]);
    if (sig !== signature) {signature = sig; report('neutral', 'Tarkista oma laskusi, kun olet valmis.');}
    q('[data-question]').textContent = own(CASES, key) ? CASES[key].text : 'Valitse tilanne.';
    q('[data-practice-picture]').innerHTML = practiceSvg(key);
    return {key, raw};
  }
  function edit(e) {
    if (disposed || paused) return;
    if (e.target.matches('[data-mode]')) {mode = q('[data-mode]').value; step = 0; model();}
    if (e.target.matches('[data-case],[data-expression]')) sync();
  }
  function click(e) {
    const b = e.target.closest('button[data-plus-action]');
    if (!b || !root.contains(b) || disposed || paused) return;
    if (b.dataset.plusAction === 'check') {const v = sync(), r = checkAddition(v.key, v.raw); report(r.ok ? 'correct' : 'retry', r.message);}
    else {const visibleMode = q('[data-mode]').value; if (visibleMode !== mode) {mode = visibleMode; step = 0;} if (b.dataset.plusAction === 'step') step = Math.min(step + 1, mode === 'arrival' ? 2 : 1); else step = 0; model();}
  }
  function reset() {if (disposed) return; mode = 'arrival'; step = 0; signature = ''; q('[data-mode]').value = mode; q('[data-case]').value = 'shells'; q('[data-expression]').value = ''; sync(); model(); for (const f of fields) f.disabled = paused;}
  root.addEventListener('input', edit); root.addEventListener('change', edit); root.addEventListener('click', click);
  const api = {pause(){if (disposed) return; paused = true; for (const f of fields) f.disabled = true; model();}, resume(){if (disposed) return; paused = false; for (const f of fields) f.disabled = false; sync(); model();}, reset, dispose(){if (disposed) return; disposed = true; root.removeEventListener('input', edit); root.removeEventListener('change', edit); root.removeEventListener('click', click); for (const f of fields) f.disabled = true; if (mounted.get(host) === api) mounted.delete(host);}};
  mounted.set(host, api); reset(); return api;
}
