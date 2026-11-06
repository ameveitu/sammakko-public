(() => {
  // Old presentation URLs open the separate audience document without teacher markup.
  if(new URLSearchParams(location.search).get('mode')==='presentation'&&/\/lessons\/[^/]+\.html$/.test(location.pathname)){
    const launch=document.querySelector('#mode[href]');if(launch)location.replace(new URL(launch.getAttribute('href'),location.href));
  }
  async function copy(text, message='Kopioitu.') {
    const out=document.querySelector('#copy-status');
    try { await navigator.clipboard.writeText(text);out.textContent=message; }
    catch { out.textContent='Kopioi tästä: ';const input=document.createElement('input');input.value=text;input.readOnly=true;input.setAttribute('aria-label','Kopioitava osoite tai tunnus');out.append(input);input.focus();input.select(); }
  }
  document.querySelector('[data-copy-id]')?.addEventListener('click',e=>copy(e.currentTarget.dataset.copyId));
  document.querySelector('#copy-lesson')?.addEventListener('click',()=>{const u=new URL(location.href);u.search='';u.hash='';copy(u.href,document.body.classList.contains('lesson-network')?'Oppituntilinkki kopioitu.':'Esikatselulinkki kopioitu. Oppilasjakelua ei ole varmennettu.');});
  for(const button of document.querySelectorAll('[data-copy-url]')) button.addEventListener('click',()=>copy(new URL(button.dataset.copyUrl,location.href).href));
  document.querySelector('[data-copy-presentation]')?.addEventListener('click',e=>copy(new URL(e.currentTarget.dataset.copyPresentation,location.href).href,'Esityslinkki kopioitu. Jaa vain esitysvälilehti.'));
  const stageBar=document.querySelector('[data-teacher-flow]');
  if(stageBar){
    const stages=[...document.querySelectorAll('#lesson-body [data-teaching-step]')];
    const select=stageBar.querySelector('[data-teacher-step]'),count=stageBar.querySelector('[data-teacher-count]');
    const previous=stageBar.querySelector('[data-teacher-prev]'),next=stageBar.querySelector('[data-teacher-next]');
    const presentation=stageBar.querySelector('[data-teacher-presentation]'),base=new URL(presentation.href,location.href);
    let current=0,scheduled=false;
    for(const [index,stage]of stages.entries()){
      const title=(stage.querySelector('h2,h3,h4,summary')?.textContent??stage.textContent).trim().replace(/\s+/g,' ');
      const option=document.createElement('option');option.value=String(index);option.textContent=`${index+1}. ${title.length>80?title.slice(0,77)+'…':title}`;select.append(option);
    }
    function update(index){
      current=Math.max(0,Math.min(stages.length-1,index));select.value=String(current);
      previous.disabled=current===0;next.disabled=current===stages.length-1;
      count.textContent=`${current+1} / ${stages.length}`;
      const url=new URL(base);url.search='';url.hash='';if(current)url.searchParams.set('step',String(current+1));presentation.href=url.href;
    }
    function move(index,focus){document.dispatchEvent(new Event('lesson-stage-before-change'));update(index);document.dispatchEvent(new Event('lesson-stage-change'));window.SammakkoLessonFlow?.showStage(stages[current],{focus});}
    function followReading(){
      scheduled=false;
      const bar=stageBar.getBoundingClientRect(),edge=Math.max(0,bar.bottom)+16;
      let index=0;
      for(let i=0;i<stages.length;i++)if(stages[i].getBoundingClientRect().top<=edge)index=i;
      if(index!==current)update(index);
    }
    if(stages.length){
      stageBar.hidden=false;update(0);
      const size=()=>document.documentElement.style.setProperty('--lesson-toolbar-height',`${stageBar.getBoundingClientRect().height}px`);
      size();if(typeof ResizeObserver==='function')new ResizeObserver(size).observe(stageBar);
      previous.addEventListener('click',()=>move(current-1,true));next.addEventListener('click',()=>move(current+1,true));
      select.addEventListener('change',()=>move(Number(select.value),false));
      document.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(followReading);}},true);
      addEventListener('resize',()=>{size();followReading();});
      const raw=new URL(location.href).searchParams.get('step');
      if(/^\d+$/.test(raw??''))requestAnimationFrame(()=>move(Number(raw)-1,false));
    }
  }
  const filters=document.querySelector('#filters');
  function filter(){const f=new FormData(filters),q=String(f.get('q')).trim().toLocaleLowerCase('fi');let count=0;for(const row of document.querySelectorAll('#catalogue li')){row.hidden=!row.dataset.search.includes(q)||['subject','grade','role','lite','content'].some(k=>f.get(k)&&f.get(k)!==row.dataset[k]);if(!row.hidden)count++;}document.querySelector('#count').textContent=count+' aihetta';}
  if(filters){const values=new URLSearchParams(location.search);for(const field of filters.querySelectorAll('[name]'))if(values.has(field.name))field.value=values.get(field.name);filter();addEventListener('pageshow',filter);}
  filters?.addEventListener('input',()=>{const u=new URL(location.href);for(const [k,v]of new FormData(filters)){if(v)u.searchParams.set(k,v);else u.searchParams.delete(k);}history.replaceState(null,'',u);filter();});filters?.addEventListener('submit',e=>e.preventDefault());filters?.addEventListener('reset',()=>setTimeout(()=>{const u=new URL(location.href);for(const k of ['q','grade','subject','role','lite','content'])u.searchParams.delete(k);history.replaceState(null,'',u);filter();},0));
})();

