const count = n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 10;
const own = (o, k) => typeof k === 'string' && Object.hasOwn(o, k);
export const CASES = Object.freeze({
  snack: Object.freeze({a: 6, b: 2, kind: 'remove', text: 'Lautasella oli 6 marjaa. Niistä syötiin 2. Kirjoita lasku, joka kertoo jäljelle jäävän määrän.'}),
  shells: Object.freeze({a: 3, b: 5, kind: 'compare', text: 'Yhdessä rasiassa on 3 simpukkaa, toisessa 5. Kirjoita lasku, joka kertoo määrien eron. Simpukat pysyvät rasioissa.'}),
  crayons: Object.freeze({a: 7, b: 4, kind: 'compare', text: 'Pöydällä on 7 lyijykynää ja 4 värikynää. Kirjoita lasku: montako lyijykynää on enemmän?'})
});
export function difference(a, b) {return count(a) && count(b) ? Math.abs(a - b) : null;}
export function removal(a, b, removed) {
  return count(a) && count(b) && b <= a && count(removed) && removed <= b ? Object.freeze({initial: a, planned: b, removed, remaining: a - removed}) : null;
}
export function readSubtraction(raw) {
  if (typeof raw !== 'string') return null;
  const m = /^\s*(\d{1,2})\s*[-−]\s*(\d{1,2})\s*$/.exec(raw);
  return m && count(Number(m[1])) && count(Number(m[2])) ? [Number(m[1]), Number(m[2])] : null;
}
export function checkSubtraction(key, raw) {
  if (!own(CASES, key)) return {ok: false, message: 'Valitse kuvan tilanne.'};
  const c = CASES[key], pair = readSubtraction(raw);
  if (!pair) return {ok: false, message: 'Kirjoita kaksi kuvan määrää ja niiden väliin −. Esimerkiksi 4 − 1. Pelkkä tulos ei vielä kuvaa tilannetta.'};
  const a = c.kind === 'remove' ? c.a : Math.max(c.a, c.b), b = c.kind === 'remove' ? c.b : Math.min(c.a, c.b);
  if (pair[0] === a && pair[1] === b) return {ok: true, message: c.kind === 'remove' ? `${a} − ${b}: aluksi ${a}, pois ${b}, jäljelle ${a - b}.` : `${a} − ${b}: pareja tulee ${b}, ilman paria jää ${a - b}. Miinus kertoo eron. Mitään ei oteta pois.`};
  if (pair[0] === b && pair[1] === a) return {ok: false, message: `Tässä ${a} on ${c.kind === 'remove' ? 'alkuperäinen määrä' : 'suurempi määrä'}. Kirjoita se ensin. Miinuksessa lukujen vaihtaminen muuttaa laskua.`};
  return {ok: false, message: pair[0] - pair[1] === a - b ? `Laskusi tulos on ${a - b}. Kuvan tilannetta kuvaavat kuitenkin määrät ${a} ja ${b}. Käytä niitä.` : c.kind === 'remove' ? `Aluksi oli ${a}, pois otettiin ${b}. Jäljelle jäävä määrä ei ole pois otettu määrä.` : `Vertaa määriä ${a} ja ${b}. Etsi suuremmasta määrästä ne, joille ei riitä paria.`};
}
const dots = (n, y, tag) => Array.from({length: n}, (_, i) => `<circle ${tag}="${i}" cx="${55 + i * 35}" cy="${y}" r="9" fill="#4a8f7b" stroke="#24493f" stroke-width="1.5"/>`).join('');
const frame = (label, s) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 200" role="img" aria-label="${label}"><title>${label}</title><g font-family="sans-serif" fill="#183e36">${s}</g></svg>`;
export function modelSvg(mode, step) {
  if (!['remove', 'compare'].includes(mode) || typeof step !== 'number' || !Number.isInteger(step) || step < 0 || step > (mode === 'remove' ? 2 : 3)) return '';
  if (mode === 'remove') return frame(`Aluksi 5 marjaa. Poistettu ${step}. Jäljellä ${5 - step}.`, `<text x="180" y="25" text-anchor="middle" font-size="18">Aluksi 5. Otetaan pois 2.</text>` + dots(5, 75, 'data-initial') + Array.from({length: step}, (_, i) => `<path data-removed="${i}" d="M${55 + (4 - i) * 35 - 12} 63 l24 24 m0 -24 l-24 24" stroke="#9b4538" stroke-width="3"/>`).join('') + `<text x="180" y="136" text-anchor="middle" font-size="21">Nyt jäljellä ${5 - step}</text><text x="180" y="176" text-anchor="middle" font-size="23">${step === 2 ? '5 − 2: jäljelle 3' : 'Poistettuja ei lasketa mukaan.'}</text>`);
  return frame('Viisi ja kolme merkkiä. Parit yhdistyvät yksi kerrallaan. Kaksi jää ilman paria.', `<text x="180" y="24" text-anchor="middle" font-size="18">Yhdessä joukossa 5, toisessa 3.</text>` + Array.from({length: step}, (_, i) => `<path data-pair="${i}" d="M${55 + i * 35} 66 V108" stroke="#668b7a" stroke-width="3"/>`).join('') + dots(5, 55, 'data-top') + dots(3, 120, 'data-bottom') + (step === 3 ? [3, 4].map(i => `<circle data-unpaired="${i}" cx="${55 + i * 35}" cy="55" r="14" fill="none" stroke="#9b4538" stroke-width="2.5"/>`).join('') : '') + `<text x="180" y="178" text-anchor="middle" font-size="22">${step === 3 ? '5 − 3: ero on 2' : 'Kumpaakaan joukkoa ei pienennetä.'}</text>`);
}
export function practiceSvg(key) {
  if (!own(CASES, key)) return '';
  const c = CASES[key];
  if (c.kind === 'remove') return frame('Aluksi kuusi marjaa, joista kaksi on merkitty poistetuiksi.', `<text x="180" y="25" text-anchor="middle" font-size="18">Aluksi ${c.a}, pois ${c.b}</text>` + dots(c.a, 75, 'data-initial') + Array.from({length: c.b}, (_, i) => `<path data-removed="${i}" d="M${55 + (c.a - 1 - i) * 35 - 12} 63 l24 24 m0 -24 l-24 24" stroke="#9b4538" stroke-width="3"/>`).join('') + `<text x="180" y="160" text-anchor="middle" font-size="18">Yksi merkki esittää yhtä marjaa.</text>`);
  return frame(`Ylhäällä ${c.a}, alhaalla ${c.b}. Vertaa lukumääriä.`, `<text x="180" y="25" text-anchor="middle" font-size="18">Ylhäällä ${c.a}, alhaalla ${c.b}</text>` + dots(c.a, 60, 'data-top') + dots(c.b, 120, 'data-bottom') + `<text x="180" y="176" text-anchor="middle" font-size="18">Yksi merkki esittää yhtä esinettä.</text>`);
}
const mounted = new WeakMap();
export function mount(host) {
  mounted.get(host)?.dispose();
  const root = host.closest('#lesson-body')?.querySelector('[data-minus-lesson]');
  if (!root) return {pause(){}, resume(){}, reset(){}, dispose(){}};
  const q = s => root.querySelector(s), fields = [...root.querySelectorAll('fieldset')];
  let disposed = false, paused = false, mode = 'remove', step = 0, signature = '';
  const report = (state, text) => {q('[data-feedback]').dataset.verdict = state; q('[data-feedback]').textContent = text;};
  function model() {
    q('[data-model-title]').textContent = mode === 'remove' ? 'Katso, mikä muuttuu' : 'Vertaa kahta joukkoa';
    q('[data-prediction]').textContent = mode === 'remove' ? 'Mieti ensin: montako marjaa jää, kun 2 on syöty?' : 'Mieti ensin: montako merkkiä suuremmassa joukossa jää ilman paria?';
    q('[data-model-picture]').innerHTML = modelSvg(mode, step);
    q('[data-minus-action="step"]').textContent = mode === 'remove' ? 'Yksi marja pois' : 'Yhdistä yksi pari';
    q('[data-minus-action="step"]').disabled = paused || step === (mode === 'remove' ? 2 : 3);
    q('[data-model-caption]').textContent = mode === 'remove' ? `Pois on otettu ${step} marjaa. Jäljellä ${5 - step}.` : step === 3 ? 'Kolme paria. Kaksi jää ilman paria. Ero on kaksi.' : `Näkyvissä ${step} paria. Kaikki alkuperäiset esineet pysyvät paikoillaan.`;
  }
  function sync() {
    const key = q('[data-case]').value, raw = q('[data-expression]').value, sig = JSON.stringify([key, raw]);
    if (sig !== signature) {signature = sig; report('neutral', 'Tarkista oma laskusi, kun olet valmis.');}
    q('[data-question]').textContent = own(CASES, key) ? CASES[key].text : 'Valitse tilanne.';
    q('[data-practice-picture]').innerHTML = practiceSvg(key); return {key, raw};
  }
  function edit(e) {
    if (disposed || paused) return;
    if (e.target.matches('[data-mode]')) {mode = q('[data-mode]').value; step = 0; model();}
    if (e.target.matches('[data-case],[data-expression]')) sync();
  }
  function click(e) {
    const b = e.target.closest('button[data-minus-action]');
    if (!b || !root.contains(b) || disposed || paused) return;
    if (b.dataset.minusAction === 'check') {const v = sync(), r = checkSubtraction(v.key, v.raw); report(r.ok ? 'correct' : 'retry', r.message);}
    else {const visibleMode = q('[data-mode]').value; if (visibleMode !== mode) {mode = visibleMode; step = 0;} if (b.dataset.minusAction === 'step') step = Math.min(step + 1, mode === 'remove' ? 2 : 3); else step = 0; model();}
  }
  function reset() {if (disposed) return; mode = 'remove'; step = 0; signature = ''; q('[data-mode]').value = mode; q('[data-case]').value = 'snack'; q('[data-expression]').value = ''; sync(); model(); for (const f of fields) f.disabled = paused;}
  root.addEventListener('input', edit); root.addEventListener('change', edit); root.addEventListener('click', click);
  const api = {pause(){if (disposed) return; paused = true; for (const f of fields) f.disabled = true; model();}, resume(){if (disposed) return; paused = false; for (const f of fields) f.disabled = false; sync(); model();}, reset, dispose(){if (disposed) return; disposed = true; root.removeEventListener('input', edit); root.removeEventListener('change', edit); root.removeEventListener('click', click); for (const f of fields) f.disabled = true; if (mounted.get(host) === api) mounted.delete(host);}};
  mounted.set(host, api); reset(); return api;
}
