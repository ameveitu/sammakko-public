export const ITEMS=[
 {shape:'round',striped:true,size:22}, {shape:'angular',striped:false,size:28},
 {shape:'round',striped:false,size:28}, {shape:'angular',striped:true,size:22},
 {shape:'round',striped:true,size:28}, {shape:'angular',striped:false,size:22}
];
export function targetBin(item,rule){return (rule==='striped'?item.striped:item.shape==='round')?'yes':'no';}
export function placeItem(placements,index,bin){if(!Number.isInteger(index)||index<0||index>=ITEMS.length||!['yes','no',null].includes(bin))return [...placements];const next=[...placements];next[index]=bin;return next;}
const description=item=>`${item.size===22?'Pieni':'Iso'} ${item.striped?'raidallinen':'raidaton'} lappu; ${item.shape==='round'?'reuna on kaareva ilman kulmia':'reunassa on neljä kulmaa'}`;
export function checkSort(placements,rule){
 const missing=ITEMS.findIndex((_,i)=>!placements[i]);if(missing>=0)return {ok:false,text:'Lajittele vielä ryhmien ulkopuolella oleva lappu.'};
 const wrong=ITEMS.findIndex((item,i)=>placements[i]!==targetBin(item,rule));
 if(wrong>=0){const item=ITEMS[wrong];return {ok:false,index:wrong,text:`${description(item)} kuuluu ${targetBin(item,rule)==='yes'?(rule==='striped'?'raidallisiin':'pyöreisiin'):'muihin'}. Ohje kysyy ${rule==='striped'?'vain raidoista, ei muodosta':'vain pyöreydestä, ei raidoista'}. Palauta lappu ja siirrä uudelleen.`};}
 return {ok:true,text:`Jokainen lappu on ohjeen mukaisessa ryhmässä. ${rule==='striped'?'Raidat':'Pyöreys'} ratkaisi, vaikka muut ominaisuudet vaihtelivat.`};
}
function picture(item){const r=item.size;let s=item.shape==='round'?`<circle cx="38" cy="38" r="${r}" fill="#dfeae2" stroke="#245f4c" stroke-width="2"/>`:`<rect x="${38-r}" y="${38-r}" width="${r*2}" height="${r*2}" fill="#dfeae2" stroke="#245f4c" stroke-width="2"/>`;if(item.striped)for(const dy of [-8,0,8])s+=`<path d="M24 ${38+dy} H52" stroke="#245f4c" stroke-width="3"/>`;return `<svg xmlns="http://www.w3.org/2000/svg" width="76" height="76" viewBox="0 0 76 76" aria-hidden="true" focusable="false">${s}</svg>`;}
export function mount(host){
 const scope=host.closest('#lesson-body');const root=scope?.querySelector('[data-source-lesson="M-TH-02"]');if(!root)throw new Error('Teaching root missing');
 let rule='striped',placements=ITEMS.map(()=>null),paused=false,disposed=false;
 const feedback=(text,ok)=>{const e=root.querySelector('[data-feedback]');e.textContent=text;e.dataset.result=ok===undefined?'support':ok?'correct':'retry';};
 const render=()=>{
  const label=rule==='striped'?'Raidalliset':'Pyöreät';root.querySelector('[data-rule]').textContent=`Ohje: ${label.toLowerCase()} yhteen, muut toiseen.`;root.querySelector('[data-bin="yes"]').textContent=label;root.querySelector('[data-bin-title]').textContent=label;root.querySelector('[data-action="rule"]').textContent=rule==='striped'?'Vaihda ohje: pyöreät':'Vaihda ohje: raidalliset';
  const current=placements.findIndex(x=>x===null);root.querySelector('[data-current-picture]').innerHTML=current<0?'':picture(ITEMS[current]);root.querySelector('[data-current-description]').textContent=current<0?'Kaikki laput on siirretty. Voit tarkistaa tai palauttaa lapun.':description(ITEMS[current]);root.querySelectorAll('[data-bin]').forEach(b=>b.disabled=current<0);
  for(const bin of ['yes','no'])root.querySelector(`[data-group="${bin}"]`).innerHTML=ITEMS.map((item,i)=>placements[i]===bin?`<button type="button" data-return="${i}" aria-label="Palauta: ${description(item)}">${picture(item)}<br>Palauta</button>`:'').join('');
 };
 const clear=()=>{placements=ITEMS.map(()=>null);render();feedback('Lajittele jokainen lappu annetun ohjeen mukaan.');};
 const reset=()=>{rule='striped';clear();};
 const click=e=>{if(paused||disposed)return;const b=e.target.closest('button');if(!b||!root.contains(b))return;
  if(b.dataset.bin){const index=placements.findIndex(x=>x===null);placements=placeItem(placements,index,b.dataset.bin);render();feedback('Lappu siirrettiin. Voit palauttaa sen ryhmästä, jos haluat korjata.');}
  if(b.dataset.return!==undefined){placements=placeItem(placements,Number(b.dataset.return),null);render();feedback('Lappu palasi vuoroon. Valitse sille ryhmä.');}
  if(b.dataset.action==='clear')clear();
  if(b.dataset.action==='check'){const r=checkSort(placements,rule);feedback(r.text,r.ok);}
  if(b.dataset.action==='rule'){rule=rule==='striped'?'round':'striped';clear();feedback('Uusi ohje. Samat laput palasivat alkuun. Katso nyt uutta ominaisuutta.');}
 };
 root.addEventListener('click',click);reset();root.dataset.moduleReady='true';
 return {pause(){paused=true;},resume(){if(!disposed)paused=false;},reset(){if(!disposed)reset();},dispose(){if(disposed)return;disposed=true;root.removeEventListener('click',click);delete root.dataset.moduleReady;}};
}
