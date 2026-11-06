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

/* global document,requestAnimationFrame,cancelAnimationFrame */
const mounted=new WeakMap();
export const scenarios=Object.freeze({together:{label:'Yhdessä alkuun',a:{on:0,duration:3},b:{on:0,duration:5}},later:{label:'Toinen aloittaa myöhemmin',a:{on:0,duration:5},b:{on:3,duration:3}},equal:{label:'Tapahtuma C',a:{on:0,duration:4},b:{on:0,duration:4}},equalLater:{label:'Tapahtuma D',a:{on:0,duration:3},b:{on:2,duration:3}}});
export function stateAt(key,playbackSeconds){if(!Object.hasOwn(scenarios,key))throw new RangeError('Unsupported event model');const s=scenarios[key],end=Math.max(s.a.on+s.a.duration,s.b.on+s.b.duration);if(!Number.isFinite(playbackSeconds)||playbackSeconds<0||playbackSeconds>end)throw new RangeError('Invalid playback time');const lane=l=>{const elapsed=Math.min(l.duration,Math.max(0,playbackSeconds-l.on));return{elapsed,remaining:96-12*elapsed,active:playbackSeconds>=l.on&&playbackSeconds<l.on+l.duration,begun:playbackSeconds>=l.on};};return{a:lane(s.a),b:lane(s.b),end};}
export function compare(key){if(!Object.hasOwn(scenarios,key))throw new RangeError('Unsupported event model');const s=scenarios[key];return s.a.duration>s.b.duration?'a':s.a.duration<s.b.duration?'b':'equal';}
export function mount(host){const lab=host.closest('#lesson-body').querySelector('[data-duration-lab]');mounted.get(lab)?.dispose();lab.replaceChildren();const el=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e;};let key='together',t=0,running=false,paused=false,disposed=false,frame=0,last=null;const select=el('select');select.style.maxWidth='100%';select.dataset.durationCase='';select.setAttribute('aria-label','Katsottava tapahtuma');for(const[k,s]of Object.entries(scenarios)){const o=el('option',s.label);o.value=k;select.append(o);}const view=el('div'),status=el('p'),controls=el('div'),question=el('p','Kumpi paloi koko esityksessä kauemmin?'),answers=el('div'),feedback=el('p');view.dataset.durationView='';status.dataset.durationStatus='';feedback.dataset.durationFeedback='';feedback.setAttribute('aria-live','polite');for(const[action,text]of [['play','Toista'],['stop','Pysäytä'],['step','Seuraava hetki'],['reset','Alkuun']]){const b=el('button',text);b.dataset.durationAction=action;controls.append(b);}for(const[answer,text]of [['a','A'],['b','B'],['equal','Yhtä kauan']]){const b=el('button',text);b.dataset.durationAnswer=answer;answers.append(b);}lab.append(select,view,status,controls,question,answers,feedback);
 const stop=()=>{running=false;cancelAnimationFrame(frame);last=null;};
 function render(){const s=stateAt(key,t);const candle=(lane,x,color,name)=>{const top=200-lane.remaining;return `<g><path d="M${x} 104H${x+48}" stroke="#49645c" stroke-dasharray="4 4"/><rect x="${x}" y="${top}" width="48" height="${lane.remaining}" fill="${color}" stroke="#183e36" stroke-width="2"/>${lane.active?`<path d="M${x+24} ${top-32}Q${x+6} ${top-9} ${x+24} ${top-4}Q${x+41} ${top-8} ${x+24} ${top-32}" fill="#e2a326" stroke="#8b4c12"/>`:''}<text x="${x+24}" y="232" text-anchor="middle">${name}</text></g>`;};view.innerHTML=`<svg viewBox="0 0 360 255" role="img" aria-label="Kuvan kynttilät: A ${s.a.active?'palaa':s.a.begun?'sammunut':'odottaa'}, B ${s.b.active?'palaa':s.b.begun?'sammunut':'odottaa'}. Samalla lähtöpituudella lyhyemmäksi palanut paloi tässä mallissa kauemmin."><g font-family="sans-serif" font-size="24" fill="#183e36">${candle(s.a,70,'#b96044','A')}${candle(s.b,240,'#4f7aa5','B')}</g><path d="M45 202H315" stroke="#183e36" stroke-width="3"/></svg>`;status.textContent=`A: ${s.a.active?'palaa':s.a.begun?'sammunut':'ei vielä syttynyt'}. B: ${s.b.active?'palaa':s.b.begun?'sammunut':'ei vielä syttynyt'}.`+(t===s.end?' Esitys on lopussa. Voit toistaa sen.':'');for(const e of lab.querySelectorAll('button,select'))e.disabled=paused;lab.querySelector('[data-duration-action=step]').disabled=paused||t===s.end;}
 function reset(){if(disposed)return;stop();t=0;feedback.textContent='';delete feedback.dataset.result;render();}
 function tick(now){if(!running||paused||disposed)return;const end=stateAt(key,t).end;if(last!==null)t=Math.min(end,t+(now-last)/1000);last=now;render();if(t===end)stop();else frame=requestAnimationFrame(tick);}
 const change=()=>{if(paused||disposed)return;key=select.value;reset();};const control=e=>{if(paused||disposed)return;const action=e.target.closest('[data-duration-action]')?.dataset.durationAction;if(action==='stop')stop();if(action==='reset')reset();if(action==='step'){stop();t=Math.min(stateAt(key,t).end,t+1);render();}if(action==='play'&&!running){if(t===stateAt(key,t).end)t=0;running=true;last=null;frame=requestAnimationFrame(tick);}};const answer=e=>{if(paused||disposed)return;const a=e.target.closest('[data-duration-answer]')?.dataset.durationAnswer;if(!a)return;const truth=compare(key);feedback.dataset.result=a===truth?'correct':'retry';feedback.textContent=(a===truth?'Kyllä. ':'Katso esitys vielä. ')+(truth==='equal'?'Kumpikin paloi yhtä kauan. Ne lyhenivät yhtä paljon.':`${truth==='a'?'A':'B'} paloi kauemmin. Se lyheni tässä mallissa enemmän.`)+(['later','equalLater'].includes(key)?' Myöhempi sammuminen ei yksin kerro pidemmästä kestosta: katso myös syttymistä.':' Kynttilät syttyivät yhdessä.');};
 const contexts=lessonContexts(
  ()=>({key,t,feedback:contextFeedback(feedback)}),
  state=>{stop();key=state.key;select.value=key;t=state.t;render();restoreContextFeedback(feedback,state.feedback);},
  preset=>{if(!['together','later','equalLater'].includes(preset))throw new RangeError('Unsupported duration context');key=preset;select.value=key;reset();}
 );
 select.addEventListener('change',change);controls.addEventListener('click',control);answers.addEventListener('click',answer);render();const api={pause(){if(disposed)return;paused=true;stop();render();},resume(){if(disposed)return;paused=false;render();},context(request){if(!disposed)contexts.change(request);},reset(){contexts.clear();key='together';select.value=key;reset();},dispose(){if(disposed)return;contexts.clear();disposed=true;stop();select.removeEventListener('change',change);controls.removeEventListener('click',control);answers.removeEventListener('click',answer);lab.replaceChildren();if(mounted.get(lab)===api)mounted.delete(lab);}};mounted.set(lab,api);return api;
}
