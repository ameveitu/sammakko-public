export const TARGETS=Object.freeze([{spot:'A',text:'Tutki paperin kohtaa A. Etsi näkymä, jossa pienet pisteet erottuvat.'},{spot:'B',text:'Tutki kankaan kohtaa B. Etsi näkymä, jossa risteävät langat erottuvat.'}]);
export function moveFocus(value,delta){return Math.max(0,Math.min(2,value+delta));}
export function checkView(target,spot,focus){
 if(!['A','B'].includes(target)||!['A','B'].includes(spot)||![0,1,2].includes(focus))throw new RangeError('Invalid tool view');
 if(spot!==target)return {ok:false,text:`Näkymä on kohdasta ${spot}. Tehtävä pyytää kohtaa ${target}. Kohdista lasi ensin siihen.`};
 if(focus===0)return {ok:false,text:'Lasi on tässä mallissa aivan lähellä pintaa. Siirrä sitä vähän kauemmas paperista ja katso uudelleen.'};
 if(focus===2)return {ok:false,text:'Näkymä on tässä mallissa sumea. Siirrä lasia vähän lähemmäs paperia ja katso uudelleen.'};
 return {ok:true,text:spot==='A'?'Nyt katsot pyydettyä kohtaa ja pisteet erottuvat. Paperi ei kasvanut; sen kuva näkyy suurempana.':'Nyt katsot pyydettyä kohtaa ja langat erottuvat. Langat olivat kankaassa jo ennen suurentamista.'};
}
// Both views use exactly the same local features; only the group scale changes.
export function featureMarkup(spot){
 if(spot==='A')return [[-10,-10],[10,-10],[-10,10],[10,10]].map(([x,y])=>`<circle data-feature="dot" cx="${x}" cy="${y}" r="4" fill="#183e36"/>`).join('');
 return [-10,10].map(y=>`<line data-feature="horizontal" x1="-30" y1="${y}" x2="30" y2="${y}" stroke="#315474" stroke-width="4"/>`).join('')+[-12,12].map(x=>`<line data-feature="vertical" x1="${x}" y1="-25" x2="${x}" y2="25" stroke="#815439" stroke-width="4"/>`).join('');
}
export function featureView(spot,view,x,y,scale){return `<g data-features="${view}" data-pattern="${spot}" transform="translate(${x} ${y}) scale(${scale})">${featureMarkup(spot)}</g>`;}
export function viewScene(spot,focus){
 const clear=focus===1;
 const marks=featureView(spot,'zoom',410,144,2.5);
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 280" width="600" height="280" role="img" aria-label="Lasin kohta ${spot}. ${clear?(spot==='A'?'Samat neljä pistettä erottuvat suurempina.':'Samat kaksi poikittaista ja kaksi pitkittäistä lankaa erottuvat suurempina.'):'Yksityiskohdat eivät erotu tässä näkymässä.'}"><rect width="600" height="280" fill="#fffdf6"/><rect x="24" y="45" width="230" height="180" fill="#f5e8c8" stroke="#183e36" stroke-width="3"/><text x="52" y="86" font-size="32">A</text><text x="172" y="86" font-size="32">B</text>${featureView('A','base-A',76,139,1)}${featureView('B','base-B',187,139,1)}<circle cx="${spot==='A'?76:187}" cy="139" r="44" fill="none" stroke="#b2572e" stroke-width="7"/><path d="M${spot==='A'?103:214} 172 l23 25" stroke="#b2572e" stroke-width="14"/><circle cx="410" cy="144" r="92" fill="#f5e8c8" stroke="#b2572e" stroke-width="7"/>${clear?marks:'<ellipse cx="410" cy="144" rx="57" ry="43" fill="#b8b5aa"/>'}<text x="325" y="258" font-size="30">${clear?'Selkeä näkymä':'Ei erotu vielä'}</text></svg>`;
}
export function mount(host){
 const root=host.closest('#lesson-body')?.querySelector('[data-tool-lesson]');if(!root)throw new Error('Tool root missing');
 const area=root.querySelector('[data-tool-practice]'),controls=area.querySelector('[data-controls]'),visual=area.querySelector('[data-tool-scene]'),result=area.querySelector('[data-feedback]');
 let index=0,spot='B',focus=0,paused=false,disposed=false;
 function render(){area.querySelector('[data-task]').textContent=TARGETS[index].text;visual.innerHTML=viewScene(spot,focus);area.querySelector('[data-distance]').textContent=['Lasi on aivan lähellä pintaa.','Lasi on vähän irti pinnasta.','Lasi on tässä mallissa liian kaukana.'][focus];area.querySelectorAll('[data-spot]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.spot===spot)));area.querySelector('[data-action="closer"]').disabled=focus===0;area.querySelector('[data-action="farther"]').disabled=focus===2;controls.disabled=paused;}
 function onClick(event){if(paused||disposed)return;const b=event.target.closest('button');if(!b||!area.contains(b))return;
  if(b.dataset.action==='check'){result.textContent=checkView(TARGETS[index].spot,spot,focus).text;return;}
  if(b.dataset.spot)spot=b.dataset.spot;
  else if(b.dataset.action==='closer')focus=moveFocus(focus,-1);
  else if(b.dataset.action==='farther')focus=moveFocus(focus,1);
  else if(b.dataset.action==='target'){index=(index+1)%TARGETS.length;spot=index===0?'B':'A';focus=0;}
  else return;render();result.textContent='Katso uutta näkymää. Voit tarkistaa, kun haluat.';
 }
 area.hidden=false;area.addEventListener('click',onClick);render();
 return {pause(){if(!disposed){paused=true;controls.disabled=true;}},resume(){if(!disposed){paused=false;controls.disabled=false;}},reset(){if(!disposed){index=0;spot='B';focus=0;render();result.textContent='Voit kokeilla rauhassa.';}},dispose(){if(disposed)return;disposed=true;area.removeEventListener('click',onClick);area.hidden=true;visual.replaceChildren();}};
}
