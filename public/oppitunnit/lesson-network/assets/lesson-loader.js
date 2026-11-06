(async()=>{
 const host=document.querySelector('[data-lesson-module]');if(!host)return;
 const status=host.querySelector('[data-module-status]');let instance,disposed=false,manualPause=false,pendingReset=false,frozen=false;const disabled=new Map();
 const labels={mount:'Harjoitus käytettävissä',pause:'Keskeytetty',resume:'Voit jatkaa',reset:'Alustettu',dispose:'Suljettu'};
 const area=host.closest?.('#lesson-body')??host;
 const restore=()=>{for(const [el,value]of disabled)el.disabled=value;disabled.clear();frozen=false;};
 const freeze=()=>{for(const el of area.querySelectorAll?.('[data-context-close]')??[])el.disabled=false;if(frozen)return;for(const el of area.querySelectorAll?.('button,input,select,textarea')??[]){if(el.matches('[data-module-action],[data-context-close]'))continue;disabled.set(el,el.disabled);el.disabled=true;}frozen=true;};
 const apply=()=>{if(disposed||!instance)return;if(manualPause||document.hidden){instance.pause();freeze();status.textContent=labels.pause;}else{restore();instance.resume();status.textContent=labels.resume;}};
 const call=name=>{if(disposed)return;if(name==='pause'){manualPause=true;apply();}else if(name==='resume'){manualPause=false;apply();}else if(name==='reset'){if(!instance){pendingReset=true;return;}document.dispatchEvent(new Event('lesson-before-reset'));restore();instance.reset();if(manualPause||document.hidden){instance.pause();freeze();}status.textContent=labels.reset;}};
 const click=e=>{const button=e.target.closest('[data-module-action]');if(button)call(button.dataset.moduleAction);};
 const visibility=()=>apply();
 const externalControl=e=>call(e.detail);
 const contextChange=e=>{if(disposed||!instance)return;try{if(e.detail.preset&&typeof instance.context!=='function')throw Error('Mallin alkuasetuksia ei tueta');restore();instance.pause({reason:'context-change'});instance.context?.(e.detail);apply();}catch(error){apply();e.detail.error=String(error.message??error);status.dataset.error='true';status.textContent='Mallin avaaminen ei onnistunut: '+e.detail.error;}};
 const stageChange=()=>{if(disposed||!instance)return;instance.pause({reason:'stage-change'});if(manualPause||document.hidden){freeze();}else{restore();instance.resume();}};
 const dispose=()=>{if(disposed)return;disposed=true;host.removeEventListener('click',click);document.removeEventListener('visibilitychange',visibility);document.removeEventListener('lesson-control',externalControl);document.removeEventListener('lesson-stage-change',stageChange);document.removeEventListener('lesson-context-change',contextChange);instance?.dispose?.();disabled.clear();status.textContent=labels.dispose;};
 addEventListener('pagehide',dispose);
 addEventListener('pageshow',e=>{if(e.persisted&&disposed)location.reload();});
 document.addEventListener('visibilitychange',visibility);
 document.addEventListener('lesson-control',externalControl);
 document.addEventListener('lesson-stage-change',stageChange);
 document.addEventListener('lesson-context-change',contextChange);
 try{
  const module=await import(new URL(host.dataset.lessonModule,location.href));
  if(disposed)return;
  if(typeof module.mount!=='function')throw Error('mount puuttuu');
  instance=module.mount(host);
  for(const name of ['pause','resume','reset','dispose'])if(typeof instance?.[name]!=='function')throw Error(name+' puuttuu');
  if(pendingReset){instance.reset();pendingReset=false;}
  host.addEventListener('click',click);status.textContent=labels.mount;if(manualPause||document.hidden)apply();document.dispatchEvent(new Event('lesson-module-ready'));
 }catch(e){dispose();status.dataset.error='true';status.textContent='Moduulivirhe: '+e.message;}
})();
