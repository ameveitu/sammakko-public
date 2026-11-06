export const FACTS = Object.freeze([
  Object.freeze({id: 'start', text: 'Kotelossa on aluksi 4 kynää.'}),
  Object.freeze({id: 'added', text: 'Aava lisää koteloon 2 kynää.'}),
  Object.freeze({id: 'colour', text: 'Kynäkotelo on vihreä.'}),
  Object.freeze({id: 'books', text: 'Pöydällä on 3 kirjaa.'})
]);
export const QUESTIONS = Object.freeze([
  Object.freeze({text: 'Montako kynää kotelossa on lopuksi?', needed: ['start', 'added'], explanation: 'Tarvitaan kynien alkumäärä ja tieto lisätyistä kynistä. Kotelon väri ja kirjojen määrä eivät vastaa tähän kysymykseen.'}),
  Object.freeze({text: 'Minkä värinen kynäkotelo on?', needed: ['colour'], explanation: 'Nyt tarvitaan kotelon väri. Kynien ja kirjojen määrät eivät kerro sitä. Sama väritieto muuttui tarpeelliseksi, koska kysymys vaihtui.'}),
  Object.freeze({text: 'Montako kirjaa pöydällä on?', needed: ['books'], explanation: 'Nyt kysytään kirjojen määrää. Kynätiedot ja kotelon väri eivät vastaa siihen.'})
]);
export function toggleFact(selected, id) {
  if (!FACTS.some(f => f.id === id)) throw new RangeError('Unknown fact');
  return selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id];
}
export function checkFacts(index, selected) {
  const question = QUESTIONS[index];
  if (!question || !Array.isArray(selected) || Array.from(selected).some(id => !FACTS.some(f => f.id === id))) throw new RangeError('Invalid relevance task');
  const extra = selected.find(id => !question.needed.includes(id));
  if (extra) return {ok: false, text: `Tämä tieto ei vastaa nyt kysymykseen: ${FACTS.find(f => f.id === extra).text} Poista se työtilasta ja lue kysymys uudestaan.`};
  const missing = question.needed.filter(id => !selected.includes(id));
  if (missing.length) return {ok: false, text: `Vielä tarvitaan: ${missing.map(id => FACTS.find(f => f.id === id).text).join(' ')} Katso, mitä kysytään ja mitä jo tiedetään.`};
  return {ok: true, text: question.explanation + ' Kokosit tämän kysymyksen tiedot.'};
}
export function mount(host) {
  const root = host.closest('#lesson-body')?.querySelector('[data-relevance-lesson]'); if (!root) throw new Error('M-WORK-01 root missing');
  const area = root.querySelector('[data-relevance-practice]'), controls = area.querySelector('fieldset');
  const q = selector => area.querySelector(selector);
  let index = 0, selected = [], paused = false, disposed = false;
  function feedback(text, ok) { const e = q('[data-feedback]'); e.textContent = text; e.dataset.result = ok === undefined ? 'support' : ok ? 'correct' : 'retry'; }
  function render() {
    q('[data-question]').textContent = QUESTIONS[index].text;
    area.querySelectorAll('[data-fact]').forEach(b => b.setAttribute('aria-pressed', String(selected.includes(b.dataset.fact))));
    const list = q('[data-workspace]'); list.replaceChildren();
    for (const id of selected) { const li = root.ownerDocument.createElement('li'); li.textContent = FACTS.find(f => f.id === id).text; list.append(li); }
    q('[data-empty]').hidden = selected.length > 0; controls.disabled = paused;
  }
  function click(event) {
    if (paused || disposed) return;
    const b = event.target.closest('button'); if (!b || !area.contains(b)) return;
    if (b.dataset.fact) { selected = toggleFact(selected, b.dataset.fact); feedback('Työtila muuttui. Voit tarkistaa tai korjata sitä.'); }
    else if (b.dataset.action === 'check') { const result = checkFacts(index, selected); feedback(result.text, result.ok); }
    else if (b.dataset.action === 'clear') { selected = []; feedback('Työtila on tyhjä. Kysymys säilyi samana.'); }
    else if (b.dataset.action === 'next') { index = (index + 1) % QUESTIONS.length; selected = []; feedback('Kysymys vaihtui. Valitse nyt siihen vastaavat tiedot samasta tilanteesta.'); }
    render();
  }
  area.hidden = false; area.addEventListener('click', click); render(); feedback('Valitse kysymykseen tarvittavat tiedot työtilaan.');
  return {pause() { if (!disposed) { paused = true; controls.disabled = true; } }, resume() { if (!disposed) { paused = false; controls.disabled = false; } }, reset() { if (!disposed) { index = 0; selected = []; render(); feedback('Valitse kysymykseen tarvittavat tiedot työtilaan.'); } }, dispose() { if (disposed) return; disposed = true; area.removeEventListener('click', click); area.hidden = true; q('[data-workspace]').replaceChildren(); }};
}
