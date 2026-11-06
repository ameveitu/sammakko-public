(() => {
 const area=document.querySelector('#lesson-body'),steps=[...area.querySelectorAll('[data-audience-step]')];
 const count=document.querySelector('[data-step-count]'),previous=document.querySelector('[data-audience-prev]'),next=document.querySelector('[data-audience-next]');
 const tools=document.querySelector('[data-audience-tools]');
 let current=0,paused=false;
 const closeDisclosures=()=>area.querySelectorAll('details').forEach(d=>d.open=false);
 const control=name=>document.dispatchEvent(new CustomEvent('lesson-control',{detail:name}));
 function show(index,{focus=false}={}){
  document.dispatchEvent(new Event('lesson-stage-before-change'));
  const max=Math.max(0,steps.length-1);current=Math.max(0,Math.min(max,index));closeDisclosures();
  if(tools)tools.open=false;
  steps.forEach((s,i)=>{s.hidden=i!==current;s.inert=i!==current;});
  previous.disabled=current===0;next.disabled=current===max;count.textContent=steps.length?`${current+1} / ${steps.length}`:'Opetussisältö';
  const url=new URL(location.href);url.search='';url.hash='';if(current)url.searchParams.set('step',String(current+1));history.replaceState(null,'',url);
  document.dispatchEvent(new Event('lesson-stage-change'));
  if(focus&&steps[current]){steps[current].tabIndex=-1;steps[current].focus({preventScroll:true});}
  area.scrollTop=0;
 }
 const raw=new URL(location.href).searchParams.get('step');show(/^\d+$/.test(raw??'')?Number(raw)-1:0);
 previous.addEventListener('click',()=>show(current-1,{focus:true}));next.addEventListener('click',()=>show(current+1,{focus:true}));
 document.querySelector('[data-audience-reset]').addEventListener('click',()=>{control('reset');control('resume');paused=false;const pause=document.querySelector('[data-audience-pause]');pause.textContent='Tauko';pause.setAttribute('aria-pressed','false');show(0,{focus:true});});
 document.querySelector('[data-audience-pause]').addEventListener('click',e=>{paused=!paused;control(paused?'pause':'resume');e.currentTarget.textContent=paused?'Jatka':'Tauko';e.currentTarget.setAttribute('aria-pressed',String(paused));});
 document.addEventListener('keydown',e=>{
  // Native controls and every lesson-owned interaction retain their keys.
  const owned=e.target.closest('button,a,summary,fieldset,[tabindex],[role]');
  if(e.defaultPrevented||e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||e.target.closest('input,textarea,select,[contenteditable]:not([contenteditable="false"])')||(e.target.closest('#lesson-body')&&owned&&!owned.matches('[data-audience-step]')))return;
  if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();show(current+(e.key==='ArrowRight'?1:-1),{focus:true});}
 });
 area.addEventListener('click',e=>{const a=e.target.closest('a[href^="#"]');if(!a)return;const target=document.getElementById(a.hash.slice(1)),step=target?.closest('[data-audience-step]')??target?.querySelector('[data-audience-step]');if(step){e.preventDefault();show(steps.indexOf(step),{focus:true});}});
 const status=document.querySelector('[data-audience-status]');
 document.querySelector('[data-audience-copy]').addEventListener('click',async()=>{
  const url=new URL(location.pathname,location.origin);if(current)url.searchParams.set('step',String(current+1));
  try{await navigator.clipboard.writeText(url.href);status.textContent='Esityslinkki kopioitu.';}
  catch{status.replaceChildren('Kopioi esityslinkki: ');const input=document.createElement('input');input.readOnly=true;input.value=url.href;input.setAttribute('aria-label','Esityslinkki');status.append(input);input.focus();input.select();}
 });
 const full=document.querySelector('[data-audience-fullscreen]');
 full.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{status.textContent='Koko näyttö ei ole käytettävissä tässä selaimessa. Esitys toimii tässä välilehdessä.';}});
 document.addEventListener('fullscreenchange',()=>{full.setAttribute('aria-pressed',String(!!document.fullscreenElement));full.textContent=document.fullscreenElement?'Poistu koko näytöstä':'Koko näyttö';});
 document.querySelector('[data-audience-close]').addEventListener('click',()=>{window.close();status.textContent='Palaa valmisteluun vaihtamalla alkuperäiseen välilehteen. Voit myös avata oppitunnit tai etusivun Lisätoiminnot-valikosta.';});
 document.addEventListener('keydown',event=>{if(event.key==='Escape'&&tools?.open){tools.open=false;tools.querySelector('summary').focus({preventScroll:true});}});
})();
