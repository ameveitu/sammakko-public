export const PAIRS = Object.freeze([
  Object.freeze({ a: 240, b: 300, offsetA: 150, offsetB: 0, name: 'Eri alut' }),
  Object.freeze({ a: 260, b: 260, offsetA: 0, offsetB: 110, name: 'Toinen vertailu' }),
  Object.freeze({ a: 310, b: 210, offsetA: 0, offsetB: 150, name: 'Uusi vertailu' })
]);
export function positions(pair, step) {
  const fraction = Math.max(0, Math.min(4, step)) / 4;
  return { a: 72 + pair.offsetA * (1 - fraction), b: 72 + pair.offsetB * (1 - fraction), widthA: pair.a, widthB: pair.b };
}
export function compare(a, b) { return a === b ? 'same' : a > b ? 'A' : 'B'; }
export function feedback(pair, answer) {
  const correct = compare(pair.a, pair.b);
  if (answer === correct) return correct === 'same'
    ? 'Kyllä. Kun alut ovat kohdakkain, loputkin osuvat samaan kohtaan. Nauhat ovat yhtä pitkät.'
    : `Kyllä. ${correct} ulottuu kauemmas, kun alut ovat kohdakkain. Se on pidempi.`;
  if (correct === 'same') return 'Eri aloituskohta voi hämätä. Kohdista alut: loput osuvat samaan kohtaan. Pituudet ovat samat.';
  if (answer === 'same') return `Kohdista alut. Loppupäät eivät osu samaan kohtaan: ${correct} ulottuu kauemmas.`;
  return `Pelkkä loppupään paikka voi hämätä. Siirrä alut kohdakkain. ${correct} on silloin pidempi; siirto ei muuta pituutta.`;
}
export function scene(pair, step) {
  const p = positions(pair, step);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 230" width="640" height="230" role="img" aria-label="Ylempi nauha A, alempi nauha B. Katkoviiva osoittaa yhteisen alun paikan. ${step === 4 ? 'Alut ovat kohdakkain.' : 'Alut ovat eri kohdissa.'}">
  <rect width="640" height="230" fill="#fffdf6"/>
  <text x="18" y="77" font-size="32" fill="#183e36">A</text><text x="18" y="157" font-size="32" fill="#183e36">B</text>
  <line x1="72" y1="24" x2="72" y2="185" stroke="#183e36" stroke-width="3" stroke-dasharray="6 6"/>
  <rect data-ribbon="A" x="${p.a}" y="48" width="${p.widthA}" height="40" fill="#b84837"/>
  <rect data-ribbon="B" x="${p.b}" y="128" width="${p.widthB}" height="40" fill="#285eaa"/>
  <text x="72" y="214" font-size="32" fill="#183e36">yhteinen alku</text></svg>`;
}
export function mount(host) {
  const root = host.closest('#lesson-body')?.querySelector('[data-measure-lesson]');
  if (!root) throw new Error('M-MEAS-00 lesson root missing');
  const area = root.querySelector('[data-measure-interactive]');
  const controls = area.querySelector('[data-controls]');
  const visual = area.querySelector('[data-measure-scene]');
  const result = area.querySelector('[data-measure-feedback]');
  let index = 0, step = 0, paused = false, disposed = false;
  function render() {
    const pair = PAIRS[index];
    area.querySelector('[data-pair-label]').textContent = pair.name;
    visual.innerHTML = scene(pair, step);
    area.querySelector('[data-position-note]').textContent = step === 4 ? 'Alut ovat samalla viivalla. Katso loppupäitä.' : 'Alut ovat eri kohdissa. Nauhaa voi siirtää venyttämättä.';
    area.querySelector('[data-action="step"]').disabled = step === 4;
    area.querySelector('[data-action="align"]').disabled = step === 4;
    controls.disabled = paused;
  }
  function clear() { result.textContent = 'Valitse vastaus, kun haluat.'; }
  function onClick(event) {
    if (paused || disposed) return;
    const button = event.target.closest('button');
    if (!button || !area.contains(button)) return;
    if (button.dataset.answer) { result.textContent = feedback(PAIRS[index], button.dataset.answer); return; }
    const action = button.dataset.action;
    if (action === 'step') step = Math.min(4, step + 1);
    else if (action === 'align') step = 4;
    else if (action === 'rewind') step = 0;
    else if (action === 'next') { index = (index + 1) % PAIRS.length; step = 0; }
    else return;
    clear(); render();
  }
  area.hidden = false; area.addEventListener('click', onClick); render();
  return {
    pause() { if (!disposed) { paused = true; controls.disabled = true; } },
    resume() { if (!disposed) { paused = false; controls.disabled = false; } },
    reset() { if (!disposed) { index = 0; step = 0; clear(); render(); } },
    dispose() { if (disposed) return; disposed = true; area.removeEventListener('click', onClick); area.hidden = true; visual.replaceChildren(); }
  };
}
