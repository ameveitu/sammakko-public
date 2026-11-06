const mounted = new WeakMap();
// This module has no timers: each cut and comparison is controlled by a native button.
export function partWidths(cuts, total = 6) {
  if (!Number.isInteger(total) || total < 2 || !Array.isArray(cuts) || cuts.some(x => !Number.isInteger(x) || x <= 0 || x >= total)) throw new RangeError('Invalid partition');
  const points = [0, ...new Set(cuts)].sort((a, b) => a - b).concat(total);
  return points.slice(1).map((x, i) => x - points[i]);
}
export function checkPartition(cuts, people) {
  const widths = partWidths(cuts);
  if (![2, 3].includes(people)) throw new RangeError('Unsupported group');
  if (widths.length !== people) return { ok: false, code: 'count', widths, message: `Osia on ${widths.length}, mutta jakajia ${people}. Tarvitaan yksi osa jokaiselle. Lisää tai poista viiva.` };
  if (!widths.every(x => x === widths[0])) return { ok: false, code: 'unequal', widths, message: `Osia on sopiva määrä. Ne ovat silti eri kokoisia. Vertaa alla myös päätypaloja: lyhyempi osa jää pienemmäksi. Siirrä viiva poistamalla se ja lisäämällä uusi.` };
  return { ok: true, code: 'equal', widths, message: `Kaikki ${people} osaa ovat yhtä suuria. Alla ne alkavat samasta kohdasta ja päättyvät samaan kohtaan. Koko suikale on käytetty.` };
}
const picture = cuts => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 145" role="img" aria-label="Suikale ja valitut jakoviivat kohdissa ${cuts.length ? cuts.join(', ') : 'ei viivoja'}"><rect x="24" y="24" width="312" height="66" fill="#f5d387" stroke="#203e48" stroke-width="3"/>${[1,2,3,4,5].map(x => `<line x1="${24+x*52}" y1="24" x2="${24+x*52}" y2="90" stroke="${cuts.includes(x)?'#203e48':'#8a704a'}" stroke-width="${cuts.includes(x)?4:1}" ${cuts.includes(x)?'':'stroke-dasharray="3 5"'}/><text x="${24+x*52}" y="119" text-anchor="middle" font-size="18" fill="#203e48">${x}</text>`).join('')}</svg>`;
const comparison = widths => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 ${widths.length*44+20}" role="img" aria-label="Osat vierekkäin samasta alkukohdasta. ${widths.every(x=>x===widths[0])?'Kaikki yhtä pitkiä.':'Pituuksissa on eroa.'}">${widths.map((w,i)=>`<text x="12" y="${i*44+36}" font-size="16" fill="#203e48">${i+1}.</text><rect x="50" y="${i*44+12}" width="${w*46}" height="30" fill="#f5d387" stroke="#203e48" stroke-width="2"/>`).join('')}</svg>`;
export function mount(host) {
  const root = host.closest('#lesson-body');
  const scope = root?.querySelector('[data-frac-work]');
  if (!scope) throw new Error('Missing fraction workspace');
  mounted.get(scope)?.dispose();
  let cuts = [], people = 2, paused = false, disposed = false;
  const out = scope.querySelector('[data-frac-feedback]');
  const compare = scope.querySelector('[data-frac-compare]');
  function render() {
    scope.querySelector('[data-frac-picture]').innerHTML = picture(cuts);
    scope.querySelector('[data-frac-instruction]').textContent = `Jaa suikale ${people === 2 ? 'kahteen' : 'kolmeen'} yhtä suureen osaan. Lisää jakoviivat itse.`;
    for (const b of scope.querySelectorAll('[data-frac-cut]')) b.setAttribute('aria-pressed', String(cuts.includes(Number(b.dataset.fracCut))));
  }
  const clear = () => { cuts=[]; compare.replaceChildren(); out.textContent='Viivat poistettu. Voit tehdä uuden jaon.'; render(); };
  function click(event) {
    const b=event.target.closest('button'); if (!b || !scope.contains(b) || paused || disposed) return;
    if (b.hasAttribute('data-frac-cut')) { const n=Number(b.dataset.fracCut); cuts=cuts.includes(n)?cuts.filter(x=>x!==n):[...cuts,n].sort((a,b)=>a-b); compare.replaceChildren(); out.textContent='Viivaa muutettu. Vertaa osia ja tarkista, kun haluat.'; render(); }
    else if (b.hasAttribute('data-frac-task')) { people=Number(b.dataset.fracTask); clear(); }
    else if (b.hasAttribute('data-frac-clear')) clear();
    else if (b.hasAttribute('data-frac-demo')) { people=2; cuts=[1]; render(); const result=checkPartition(cuts,people); compare.innerHTML=comparison(result.widths); out.textContent='Reunajako: kaksi osaa, mutta eri kokoiset. Pieni pala ei peitä isoa. Kokeile nyt muuttaa jakoa.'; }
    else if (b.hasAttribute('data-frac-check')) { const result=checkPartition(cuts,people); out.textContent=result.message; compare.innerHTML=comparison(result.widths); }
  }
  scope.addEventListener('click',click); render();
  const api = {pause(){paused=true;},resume(){if(!disposed)paused=false;},reset(){if(!disposed){people=2;clear();}},dispose(){disposed=true;scope.removeEventListener('click',click);if(mounted.get(scope)===api)mounted.delete(scope);}};
  mounted.set(scope,api);
  return api;
}
