const whole = n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 8;
const own = (o, k) => typeof k === 'string' && Object.hasOwn(o, k);
export const CASES = Object.freeze({
  berries: Object.freeze({left: Object.freeze([5]), fixed: 0, initial: 4, text: 'Tee kulhoihin yhtä monta marjaa. Muuta vihreän ryhmän määrää.'}),
  parts: Object.freeze({left: Object.freeze([3, 1]), fixed: 2, initial: 1, text: 'Toisessa joukossa on 3 ja 1 merkkiä. Toisessa on 2 keltaista sekä vihreä ryhmä. Muuta vihreän ryhmän määrää.'}),
  buttons: Object.freeze({left: Object.freeze([2, 3]), fixed: 1, initial: 2, text: 'Uusi tilanne: nappeja on 2 ja 3. Toisessa joukossa on 1 nappi ja vihreä ryhmä. Tee määristä yhtä suuret.'})
});
function dense(a) {return Array.isArray(a) && a.length > 0 && a.length <= 2 && Reflect.ownKeys(a).length === a.length + 1 && Array.from({length: a.length}, (_, i) => Object.hasOwn(a, i)).every(Boolean);}
export function amount(parts) {return dense(parts) && parts.every(whole) && parts.reduce((a, b) => a + b, 0) <= 10 ? parts.reduce((a, b) => a + b, 0) : null;}
export function relation(left, right) {const a = amount(left), b = amount(right); return a === null || b === null ? null : a === b;}
export function readCount(raw) {return typeof raw === 'string' && /^\s*[0-8]\s*$/.test(raw) ? Number(raw.trim()) : NaN;}
export function quantityState(key, n, swapped = false) {
  if (!own(CASES, key) || !whole(n) || typeof swapped !== 'boolean') return null;
  const c = CASES[key], a = [...c.left], b = c.fixed ? [c.fixed, n] : [n];
  const left = swapped ? b : a, right = swapped ? a : b;
  return {left, right, leftTotal: amount(left), rightTotal: amount(right), equal: relation(left, right), n};
}
export function checkEquality(key, n, swapped = false) {
  const s = quantityState(key, n, swapped);
  if (!s) return {ok: false, message: 'Kirjoita vihreän ryhmän määrä kokonaislukuna 0–8.'};
  if (s.equal) return {ok: true, message: `Molemmissa joukoissa on ${s.leftTotal}. Merkki = kertoo, että määrät ovat yhtä suuret. Puolten vaihtaminen säilyttää tämän.`};
  return {ok: false, message: `Joukoissa on ${s.leftTotal} ja ${s.rightTotal}. Määrät eivät ole yhtä suuret. Muuta vain vihreää ryhmää ja vertaa uudelleen.`};
}
export function equalSvg(key, n, swapped = false, spread = false) {
  const s = quantityState(key, n, swapped);
  if (!s || typeof spread !== 'boolean') return '';
  const panel = (parts, offset, tag) => {
    const total = amount(parts);
    const objects = Array.from({length: total}, (_, i) => {
      const editable = tag === (swapped ? 'left' : 'right');
      const changing = editable && (parts.length === 1 || i >= parts[0]);
      return `<circle data-${tag}="${i}" cx="${offset + 27 + (i % 5) * (spread ? 27 : 24)}" cy="${63 + Math.floor(i / 5) * (spread ? 32 : 27)}" r="8" fill="${changing ? '#328372' : '#e0b56a'}" stroke="#24493f" stroke-width="1.5"/>`;
    }).join('');
    return `<rect x="${offset + 5}" y="36" width="146" height="98" rx="11" fill="#edf5ef" stroke="#668b7a"/>${objects}<text x="${offset + 78}" y="157" text-anchor="middle" font-size="22">${parts.join(' + ')}</text><text x="${offset + 78}" y="185" text-anchor="middle" font-size="17">Yhteensä ${total}</text>`;
  };
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 205" role="img" aria-label="Joukoissa on ${s.leftTotal} ja ${s.rightTotal}. ${s.equal ? 'Yhtä monta.' : 'Eri määrät.'}"><title>Vertaa esineiden lukumääriä</title><g font-family="sans-serif" fill="#183e36"><text x="83" y="24" text-anchor="middle" font-size="17">${swapped ? 'Muokattava' : 'Vertailujoukko'}</text><text x="277" y="24" text-anchor="middle" font-size="17">${swapped ? 'Vertailujoukko' : 'Muokattava'}</text>${panel(s.left, 5, 'left')}${panel(s.right, 199, 'right')}<text x="180" y="90" text-anchor="middle" font-size="29">${s.equal ? '=' : '≠'}</text></g></svg>`;
}
const mounted = new WeakMap();
export function mount(host) {
  mounted.get(host)?.dispose();
  const root = host.closest('#lesson-body')?.querySelector('[data-equal-lesson]');
  if (!root) return {pause(){}, resume(){}, reset(){}, dispose(){}};
  const q = s => root.querySelector(s), field = q('fieldset');
  let disposed = false, paused = false, key = 'berries', swapped = false, spread = false, signature = '';
  const report = (state, text) => {q('[data-feedback]').dataset.verdict = state; q('[data-feedback]').textContent = text;};
  function sync(reseed = false) {
    const visibleKey = q('[data-case]').value;
    if (visibleKey !== key) {key = visibleKey; swapped = false; spread = false; if (reseed) q('[data-value]').value = own(CASES, key) ? String(CASES[key].initial) : '';}
    const raw = q('[data-value]').value, n = readCount(raw), sig = JSON.stringify([key, raw]);
    if (sig !== signature) {signature = sig; report('neutral', 'Vertaa kuvia. Tarkista, kun määrät ovat mielestäsi samat.');}
    q('[data-question]').textContent = own(CASES, key) ? CASES[key].text : 'Valitse tilanne.';
    q('[data-picture]').innerHTML = equalSvg(key, n, swapped, spread) || '<p>Kirjoita määrä 0–8, niin kuva päivittyy.</p>';
    q('[data-equal-action="add"]').disabled = paused || !whole(n) || n === 8;
    q('[data-equal-action="remove"]').disabled = paused || !whole(n) || n === 0;
    q('[data-amount-readback]').textContent = whole(n) ? `Muokattavassa ryhmässä: ${n}.` : 'Muokattavan ryhmän määrä puuttuu.';
    return {key, n};
  }
  function edit(e) {if (!disposed && !paused && e.target.matches('[data-case],[data-value]')) sync(e.target.matches('[data-case]'));}
  function click(e) {
    const b = e.target.closest('button[data-equal-action]');
    if (!b || !root.contains(b) || disposed || paused) return;
    const v = sync(), action = b.dataset.equalAction;
    if (action === 'check') {const r = checkEquality(v.key, v.n, swapped); report(r.ok ? 'correct' : 'retry', r.message);}
    else if (action === 'swap') {swapped = !swapped; sync();}
    else if (action === 'spread') {spread = !spread; sync();}
    else if (whole(v.n)) {q('[data-value]').value = String(Math.max(0, Math.min(8, v.n + (action === 'add' ? 1 : -1)))); sync();}
  }
  function reset() {if (disposed) return; key = 'berries'; swapped = false; spread = false; signature = ''; q('[data-case]').value = key; q('[data-value]').value = '4'; sync(); field.disabled = paused;}
  root.addEventListener('input', edit); root.addEventListener('change', edit); root.addEventListener('click', click);
  const api = {pause(){if (disposed) return; paused = true; field.disabled = true; sync();}, resume(){if (disposed) return; paused = false; field.disabled = false; sync();}, reset, dispose(){if (disposed) return; disposed = true; root.removeEventListener('input', edit); root.removeEventListener('change', edit); root.removeEventListener('click', click); field.disabled = true; if (mounted.get(host) === api) mounted.delete(host);}};
  mounted.set(host, api); reset(); return api;
}
