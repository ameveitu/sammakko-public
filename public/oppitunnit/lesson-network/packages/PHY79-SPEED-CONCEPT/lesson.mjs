// Contexts borrow one live workbench; each preset keeps its own in-memory state.
// Returning restores the original work without submitting an answer or replaying motion.
function lessonContexts(read, write, start) {
  const saved = new Map(); let active = null, origin = null;
  return {
    change({action, key, preset}) {
      if (action === 'enter') {
        if (!preset || active === key) return;
        if (active !== null) throw new Error('Close the active lesson context first');
        const before = read();
        try { if (saved.has(key)) write(saved.get(key)); else start(preset); }
        catch (error) { write(before); throw error; }
        origin = before; active = key;
      } else if (action === 'leave' && active === key) {
        const state = read(), previous = origin;
        saved.set(key, state); active = null; origin = null; write(previous);
      }
    },
    clear() { saved.clear(); active = null; origin = null; }
  };
}
function contextFeedback(element) {
  return {text: element.textContent, attributes: ['data-result', 'data-verdict', 'data-code'].map(name => [name, element.getAttribute(name)])};
}
function restoreContextFeedback(element, state) {
  element.textContent = state.text;
  for (const [name, value] of state.attributes) if (value === null) element.removeAttribute(name); else element.setAttribute(name, value);
}

/* global document, requestAnimationFrame, cancelAnimationFrame */
export const scenarios={different:{label:'Eri matkat ja ajat — vertaa vauhteja',duration:10,range:20,a:{distance:12,duration:3},b:{distance:20,duration:10}},sameTime:{label:'Sama aika',duration:4,range:12,a:{distance:8,duration:4},b:{distance:12,duration:4}},sameDistance:{label:'Sama matka',duration:6,range:12,a:{distance:12,duration:4},b:{distance:12,duration:6}},equal:{label:'Vertailu: eri matkat',duration:3,range:12,a:{distance:8,duration:2},b:{distance:12,duration:3}},pause:{label:'Tauko mukana',duration:6,range:12,a:{distance:12,duration:6,moving:3},b:{distance:12,duration:6}}};
export function scenarioFor(key){if(typeof key!=='string'||!Object.hasOwn(scenarios,key))throw new RangeError('Unsupported speed scenario');return scenarios[key];}
export function positionAt(lane,time){if(!Number.isFinite(time)||time<0)throw Error('Invalid time');return lane.distance*Math.min(time/(lane.moving??lane.duration),1);}
export function average(lane){return lane.distance/lane.duration;}
export function compare(a,b){return Math.sign(a.distance*b.duration-b.distance*a.duration);}
export function mount(host){
 const lab=host.closest('#lesson-body').querySelector('[data-speed-lab]');lab.replaceChildren();
 const make=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e;};
 const label=make('label','Vertailu '),select=make('select');select.dataset.speedScenario='';for(const [id,s]of Object.entries(scenarios)){const o=make('option',s.label);o.value=id;select.append(o);}label.append(select);lab.append(label);
 const view=make('div'),readout=make('p');readout.dataset.speedReadout='';readout.setAttribute('aria-live','off');lab.append(view,readout);
 const controls=make('div');for(const [action,text]of [['play','Käynnistä'],['pause','Pysäytä'],['reset','Alkuun'],['step','+1 sekunti']]){const b=make('button',text);b.dataset.speedAction=action;controls.append(b);}lab.append(controls);
 const timeline=make('input');timeline.type='range';timeline.min='0';timeline.step='0.1';timeline.value='0';timeline.setAttribute('aria-label','Simulaation aika sekunteina');lab.append(timeline);
 const question=make('p'),practice=make('div'),feedback=make('p');feedback.setAttribute('aria-live','polite');feedback.dataset.speedFeedback='';lab.append(question,practice,feedback);
 select.value='sameTime';
 let selected='sameTime',t=0,running=false,frame=0,last=0,disposed=false;
 const fmt=n=>n.toLocaleString('fi-FI',{maximumFractionDigits:1});
 const stop=()=>{running=false;cancelAnimationFrame(frame);};
 function render(){const s=scenarioFor(selected);timeline.max=String(s.duration);timeline.value=String(t);const x=l=>80+positionAt(l,t)/s.range*480;
 view.innerHTML=`<svg viewBox="0 0 640 230" role="img" aria-label="Vaunujen paikat samassa matka-asteikossa"><g fill="none" stroke="#49645c"><path d="M80 75H560M80 145H560M80 40V175"/></g><g fill="#183e36" font-family="sans-serif" font-size="20"><text x="20" y="80">A</text><text x="20" y="150">B</text><text x="70" y="210">0 m</text><text x="310" y="210">${s.range/2} m</text><text x="535" y="210">${s.range} m</text></g><rect x="${x(s.a)-16}" y="51" width="32" height="24" rx="5" fill="#245f4c"/><rect x="${x(s.b)-16}" y="121" width="32" height="24" rx="5" fill="#97562f"/></svg>`;
 readout.textContent=`Kellon aika ${fmt(t)} s. A: ${fmt(positionAt(s.a,t))} m / ${fmt(Math.min(t,s.a.duration))} s${t>=s.a.duration?' (suoritus valmis)':''}; B: ${fmt(positionAt(s.b,t))} m / ${fmt(Math.min(t,s.b.duration))} s${t>=s.b.duration?' (suoritus valmis)':''}.`;
 question.textContent=`Vertaile kokonaisia suorituksia: A ${s.a.distance} m / ${s.a.duration} s, B ${s.b.distance} m / ${s.b.duration} s. Kumman keskinopeus on suurempi?`;
 }
 function tick(now){if(!running||disposed)return;if(last)t=Math.min(scenarioFor(selected).duration,t+(now-last)/1000);last=now;render();if(t>=scenarioFor(selected).duration)stop();else frame=requestAnimationFrame(tick);}
 function choose(){
  if(disposed)return false;
  const next=select.value;
  try{scenarioFor(next);}catch{stop();feedback.textContent='Valitse jokin annetuista vertailuista.';return false;}
  if(next!==selected){stop();selected=next;t=0;feedback.textContent='';render();}
  return true;
 }
 function control(e){const action=e.target.closest('[data-speed-action]')?.dataset.speedAction;if(action===undefined||!choose())return;if(action==='play'){if(t>=scenarioFor(selected).duration)t=0;if(!running){running=true;last=0;frame=requestAnimationFrame(tick);}}if(action==='pause')stop();if(action==='reset'){stop();t=0;feedback.textContent='';render();}if(action==='step'){stop();t=Math.min(t+1,scenarioFor(selected).duration);render();}}
 function scrub(){const requested=Number(timeline.value);if(!choose())return;stop();t=Math.max(0,Math.min(requested,scenarioFor(selected).duration));render();}
 for(const [answer,text]of [['1','A'],['-1','B'],['0','Sama keskinopeus']]){const b=make('button',text);b.dataset.speedAnswer=answer;practice.append(b);}
 function check(e){const value=e.target.closest('[data-speed-answer]')?.dataset.speedAnswer;if(value===undefined||!choose())return;const s=scenarioFor(selected),right=compare(s.a,s.b);feedback.textContent=(Number(value)===right?'Oikein. ':'Tutki vielä koko matkaa ja koko aikaa. ')+`A:n keskinopeus on ${fmt(average(s.a))} m/s, B:n ${fmt(average(s.b))} m/s.`+(selected==='pause'?' A:n tauko kuuluu kuuteen sekuntiin.':'');}
 const contexts=lessonContexts(
  ()=>({selected,t,feedback:contextFeedback(feedback)}),
  state=>{stop();selected=state.selected;select.value=selected;t=state.t;render();restoreContextFeedback(feedback,state.feedback);},
  preset=>{if(preset!=='different')throw new RangeError('Unsupported speed context');stop();selected='different';select.value=selected;t=0;feedback.textContent='';render();}
 );
 select.addEventListener('input',choose);select.addEventListener('change',choose);controls.addEventListener('click',control);timeline.addEventListener('input',scrub);timeline.addEventListener('change',scrub);practice.addEventListener('click',check);render();
 return {pause:stop,resume(){/* Explicit play restarts; visibility never auto-starts demonstration. */},context(request){if(!disposed)contexts.change(request);},reset(){contexts.clear();stop();selected='sameTime';select.value=selected;t=0;feedback.textContent='';render();},dispose(){contexts.clear();disposed=true;stop();select.removeEventListener('input',choose);select.removeEventListener('change',choose);controls.removeEventListener('click',control);timeline.removeEventListener('input',scrub);timeline.removeEventListener('change',scrub);practice.removeEventListener('click',check);lab.replaceChildren();}};
}
