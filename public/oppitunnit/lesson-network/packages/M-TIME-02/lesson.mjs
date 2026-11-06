const WORDS=Object.freeze(['','yksi','kaksi','kolme','neljä','viisi','kuusi','seitsemän','kahdeksan','yhdeksän','kymmenen','yksitoista','kaksitoista']);
export function clock(h,m){
 if(!Number.isInteger(h)||h<1||h>12||!Number.isInteger(m)||m<0||m>59)throw new RangeError('Unsupported clock time');
 const next=h===12?1:h+1;
 return Object.freeze({h,m,hourAngle:(h%12)*30+m/2,minuteAngle:m*6,key:`${h}:${m}`,digital:`${h}.${String(m).padStart(2,'0')}`,words:m===0?`kello ${WORDS[h]}`:m===30?`puoli ${WORDS[next]}`:`${h}.${String(m).padStart(2,'0')}`});
}
export function atMinute(h,elapsed){
 clock(h,0);if(!Number.isInteger(elapsed)||elapsed<0||elapsed>60)throw new RangeError('Unsupported model minute');
 return clock((h-1+Math.floor(elapsed/60))%12+1,elapsed%60);
}
export const READINGS=Object.freeze([Object.freeze({h:4,m:0}),Object.freeze({h:7,m:30}),Object.freeze({h:12,m:30}),Object.freeze({h:9,m:0})]);
export function reading(index){if(!Number.isInteger(index)||index<0||index>=READINGS.length)throw new RangeError('Unsupported reading');return clock(READINGS[index].h,READINGS[index].m);}
export function checkClock(h,m,target){
 if(typeof target!=='string'||!/^(?:[1-9]|1[0-2]):(?:0|30)$/.test(target))throw new RangeError('Unsupported clock target');
 try{return clock(h,m).key===target;}catch{return false;}
}
export function clockSVG(h,m){
 const s=clock(h,m),point=(a,r)=>[150+Math.sin(a*Math.PI/180)*r,150-Math.cos(a*Math.PI/180)*r];
 const hand=(angle,r,w,colour)=>{const[x,y]=point(angle,r);return `<line x1="150" y1="150" x2="${x}" y2="${y}" stroke="${colour}" stroke-width="${w}" stroke-linecap="round"/>`;};
 const labels=Array.from({length:12},(_,i)=>{const n=i+1,[x,y]=point(n*30,114);return `<text x="${x}" y="${y+7}" text-anchor="middle" font-size="22" fill="#163d39">${n}</text>`;}).join('');
 return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" role="img" aria-label="Kellotaulu: lyhyt paksu tuntiviisari ${m===0?`luvussa ${h}`:`lukujen ${h} ja ${h===12?1:h+1} välissä, ${m} minuuttia tasan jälkeen`}. Pitkä ohut minuuttiviisari ${m===0?'luvussa 12':m===30?'luvussa 6':`minuuttikohdassa${m}`}"><circle cx="150" cy="150" r="144" fill="#fffdf6" stroke="#346d62" stroke-width="3"/>${labels}${hand(s.minuteAngle,91,4,'#526b94')}${hand(s.hourAngle,63,10,'#224b40')}<circle cx="150" cy="150" r="8" fill="#224b40"/></svg>`;
}
export function practiceClockSVG(h,m){return clockSVG(h,m).replace(/lukujen (\d+) ja (\d+) välissä, 30 minuuttia tasan jälkeen/,'lukujen $1 ja $2 puolivälissä');}
const mounted=new WeakMap();
export function mount(host){
 const area=host.closest?.('#lesson-body')??host,root=area.matches?.('[data-clock-lesson]')?area:area.querySelector('[data-clock-lesson]');if(!root)throw Error('Missing clock lesson body');mounted.get(root)?.dispose();
 const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)],lab=q('[data-clock-live]');let active=true,disposed=false,timer=null,elapsed=0,start=3,caseIndex=0;
 const pick=(selector,values)=>{const raw=q(selector).value;return typeof raw==='string'&&values.includes(raw)?Number(raw):null;};
 lab.innerHTML='<div data-clock-model-image></div><p data-clock-readout aria-live="polite"></p>';
 const stop=()=>{if(timer!==null){globalThis.clearInterval(timer);timer=null;}};
 const render=()=>{const s=atMinute(start,elapsed);q('[data-clock-model-image]').innerHTML=clockSVG(s.h,s.m);q('[data-clock-readout]').textContent=`${s.words} — ${s.digital}. Mallissa kulunut ${elapsed} min.`;};
 const clear=selector=>{q(selector).textContent='Tarkista, kun olet valmis.';q(selector).removeAttribute('data-result');};
 const syncStart=()=>{const next=pick('[data-clock-start]',['3','9','12']);if(next===null){stop();q('[data-clock-model-image]').replaceChildren();q('[data-clock-readout]').textContent='Valitse lähtötunti 3, 9 tai 12.';return false;}if(start!==next){stop();start=next;elapsed=0;}render();return true;};
 const syncCase=(force=false)=>{const next=pick('[data-clock-case]',['0','1','2','3']);if(next===null){caseIndex=null;q('[data-clock-practice-image]').replaceChildren();clear('[data-clock-feedback]');q('[data-clock-feedback]').textContent='Valitse jokin neljästä kellosta.';return false;}if(force||caseIndex!==next){caseIndex=next;q('[data-clock-practice-image]').innerHTML=practiceClockSVG(reading(next).h,reading(next).m);clear('[data-clock-feedback]');}return true;};
 const settings=()=>{const h=pick('[data-clock-set-hour]',['3','4','5','6','12']),m=pick('[data-clock-set-minute]',['0','30']);clear('[data-clock-set-feedback]');if(h===null||m===null){q('[data-clock-set-image]').replaceChildren();q('[data-clock-set-feedback]').textContent='Valitse sekä tunti että minuutit.';return null;}q('[data-clock-set-image]').innerHTML=clockSVG(h,m);return{h,m};};
 const listeners=[],on=(e,type,fn)=>{e.addEventListener(type,fn);listeners.push(()=>e.removeEventListener(type,fn));},allowed=fn=>()=>{if(active&&!disposed)fn();};
 on(q('[data-clock-step]'),'click',allowed(()=>{stop();if(!syncStart())return;elapsed=Math.min(60,elapsed+30);render();}));
 on(q('[data-clock-play]'),'click',allowed(()=>{stop();if(!syncStart())return;if(elapsed===60)elapsed=0;render();timer=globalThis.setInterval(()=>{if(!active||disposed){stop();return;}const next=pick('[data-clock-start]',['3','9','12']);if(next===null||next!==start){syncStart();stop();return;}elapsed++;render();if(elapsed>=60)stop();},100);}));
 on(q('[data-clock-stop]'),'click',allowed(stop));
 for(const t of['input','change'])on(q('[data-clock-start]'),t,allowed(syncStart));
 on(q('[data-clock-rewind]'),'click',allowed(()=>{stop();if(!syncStart())return;elapsed=0;render();}));
 for(const t of['input','change'])on(q('[data-clock-case]'),t,allowed(()=>syncCase()));
 for(const b of all('[data-clock-answer]'))on(b,'click',allowed(()=>{if(!syncCase())return;const[h,m]=b.dataset.clockAnswer.split(':').map(Number),s=reading(caseIndex),ok=checkClock(h,m,s.key),o=q('[data-clock-feedback]');o.dataset.result=ok?'correct':'retry';o.textContent=ok?`Kyllä. ${s.words} eli ${s.digital}.`:`Katso lyhyttä ja pitkää viisaria yhdessä. Tässä on ${s.words} eli ${s.digital}. Puoli nimeää seuraavan tasatunnin.`;}));
 for(const e of all('[data-clock-set-hour],[data-clock-set-minute]'))for(const type of['input','change'])on(e,type,allowed(settings));
 on(q('[data-clock-set-check]'),'click',allowed(()=>{const s=settings(),o=q('[data-clock-set-feedback]');if(!s){o.dataset.result='missing';return;}const ok=checkClock(s.h,s.m,'5:30');o.dataset.result=ok?'correct':'retry';o.textContent=ok?'Kyllä. Puoli kuusi on 5.30: tuntiviisari viiden ja kuuden välissä.':'Puoli kuusi: seuraava tasatunti on kuusi. Aseta tunniksi 5 ja minuuteiksi 30. Lyhyt viisari jää viiden ja kuuden väliin.';}));
 const controls=all('button,select,input'),setActive=v=>{active=v;stop();controls.forEach(e=>e.disabled=!v);};
 const reset=()=>{stop();start=3;elapsed=0;caseIndex=null;q('[data-clock-start]').value='3';q('[data-clock-case]').value='0';q('[data-clock-set-hour]').value='3';q('[data-clock-set-minute]').value='0';render();syncCase(true);settings();};
 reset();setActive(true);root.dataset.ready='true';
 const api={pause(){if(!disposed)setActive(false);},resume(){if(!disposed)setActive(true);},reset(){if(!disposed)reset();},dispose(){if(disposed)return;disposed=true;setActive(false);listeners.forEach(off=>off());if(mounted.get(root)===api){mounted.delete(root);root.dataset.ready='false';}}};mounted.set(root,api);return api;
}
