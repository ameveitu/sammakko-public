export const ITEMS = Object.freeze([
  Object.freeze({ image: 'leaf', statement: 'Lehdessä on reikä.', category: 'visible', yes: 'Reikä näkyy lehden pinnassa. Voit osoittaa sen.', no: 'Katso lehden pintaa. Reiän voi osoittaa: se näkyy kuvassa.' }),
  Object.freeze({ image: 'leaf', statement: 'Toukka teki reiän.', category: 'unknown', yes: 'Reikä näkyy, mutta tekijää ei näy. Toukka on mahdollinen selitys. Tarvitaan lisää havaintoja.', no: 'Kuvassa näkyy reikä. Toukkaa tai reiän syntyä ei näy. Selitys voi olla tosi, mutta kuva ei kerro sitä.' }),
  Object.freeze({ image: 'cup', statement: 'Muki tuntuu kylmältä.', category: 'unknown', yes: 'Kuvan pisarat näkyvät. Kylmyyttä ei voi tuntea kuvasta. Sitä ei vielä tiedetä.', no: 'Pisarat eivät kerro varmasti lämpötilaa. Kuvasta ei voi tuntea kylmyyttä.' }),
  Object.freeze({ image: 'cup', statement: 'Mukin pinnalla on pisaroita.', category: 'visible', yes: 'Pisarat näkyvät mukin ulkopinnalla. Niiden syytä kuva ei kerro.', no: 'Katso mukin pintaa. Pisarat voi osoittaa: ne näkyvät kuvassa.' })
]);
export function check(index, category) {
  if (!Number.isInteger(index) || !ITEMS[index] || !['visible', 'unknown'].includes(category)) throw new RangeError('Invalid observation practice input');
  const item = ITEMS[index], ok = item.category === category;
  return { ok, text: (ok ? 'Kyllä. ' : '') + (ok ? item.yes : item.no) };
}
export function leafScene(side = 'front') {
  const back = side === 'back';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 270" width="640" height="270" role="img" aria-label="Lehden ${back ? 'toinen puoli: reikä ja ruskea täplä' : 'etupuoli: reikä näkyy'}.">
  <rect width="640" height="270" fill="#fffdf6"/>
  <path d="M100 223 Q65 45 360 25 Q405 210 100 223Z" fill="#7cad60" stroke="#315b3d" stroke-width="4"/>
  <path d="M90 242 L335 50 M160 187 L142 101 M226 132 L215 65 M221 137 L323 148" fill="none" stroke="#315b3d" stroke-width="4"/>
  <circle cx="274" cy="93" r="22" fill="#fffdf6" stroke="#315b3d" stroke-width="3"/>
  ${back ? '<ellipse cx="177" cy="166" rx="19" ry="13" fill="#805331"/>' : ''}
  <text x="420" y="110" font-size="32" fill="#183e36">${back ? 'Toinen puoli' : 'Etupuoli'}</text>
  <text x="420" y="150" font-size="32" fill="#183e36">Sama lehti</text></svg>`;
}
export function cupScene() {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 260" width="640" height="260" role="img" aria-label="Mukin ulkopinnalla on pisaroita. Lämpötilaa ei ole näytetty."><rect width="640" height="260" fill="#fffdf6"/><path d="M176 60 H368 V197 Q272 239 176 197Z" fill="#e8ddc6" stroke="#5a4c38" stroke-width="5"/><path d="M368 91 C460 55 465 205 368 178" fill="none" stroke="#5a4c38" stroke-width="12"/><ellipse cx="272" cy="60" rx="96" ry="19" fill="#fffdf6" stroke="#5a4c38" stroke-width="5"/>${[[213,112],[279,145],[334,106]].map(([x,y])=>`<path d="M${x} ${y-18} Q${x-22} ${y+17} ${x} ${y+20} Q${x+22} ${y+17} ${x} ${y-18}Z" fill="#568bb5" stroke="#264c72" stroke-width="2"/>`).join('')}<text x="465" y="143" font-size="32" fill="#183e36">pisaroita</text></svg>`;
}
export function mount(host) {
  const root = host.closest('#lesson-body')?.querySelector('[data-observe-lesson]');
  if (!root) throw new Error('SCI-ENV-OBSERVE-01 lesson root missing');
  const area = root.querySelector('[data-observe-interactive]');
  const controls = area.querySelector('[data-controls]');
  const visual = area.querySelector('[data-observe-scene]');
  const practiceVisual = area.querySelector('[data-practice-scene]');
  const result = area.querySelector('[data-observe-feedback]');
  let index = 0, side = 'front', paused = false, disposed = false;
  function view() {
    visual.innerHTML = leafScene(side);
    area.querySelectorAll('[data-view]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === side)));
    area.querySelector('[data-view-note]').textContent = side === 'front' ? 'Reikä näkyy. Lehden toista puolta ei vielä näy.' : 'Reikä ja ruskea täplä näkyvät tällä puolella. Reiän tekijää ei näy.';
  }
  function practice() {
    const item = ITEMS[index];
    practiceVisual.innerHTML = item.image === 'leaf' ? leafScene('front') : cupScene();
    area.querySelector('[data-statement]').textContent = item.statement;
    result.textContent = 'Valitse, kun olet katsonut.';
  }
  function onClick(event) {
    if (paused || disposed) return;
    const button = event.target.closest('button');
    if (!button || !area.contains(button)) return;
    if (button.dataset.view) { side = button.dataset.view; view(); }
    else if (button.dataset.category) result.textContent = check(index, button.dataset.category).text;
    else if (button.dataset.action === 'next') { index = (index + 1) % ITEMS.length; practice(); }
  }
  area.hidden = false; area.addEventListener('click', onClick); view(); practice();
  return {
    pause() { if (!disposed) { paused = true; controls.disabled = true; } },
    resume() { if (!disposed) { paused = false; controls.disabled = false; } },
    reset() { if (!disposed) { index = 0; side = 'front'; view(); practice(); } },
    dispose() { if (disposed) return; disposed = true; area.removeEventListener('click', onClick); area.hidden = true; visual.replaceChildren(); practiceVisual.replaceChildren(); }
  };
}
