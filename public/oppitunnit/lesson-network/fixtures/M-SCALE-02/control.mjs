/* global document */
export function mount(host){
 const button=document.createElement('button'),value=document.createElement('output');button.textContent='Tekninen askel';button.dataset.fixtureStep='';value.dataset.fixtureValue='';let count=0,paused=false;
 const show=()=>value.textContent=String(count);const click=()=>{if(!paused){count++;show();}};button.addEventListener('click',click);host.append(button,value);show();
 return {pause(){paused=true;},resume(){paused=false;},reset(){count=0;paused=false;show();},dispose(){button.removeEventListener('click',click);button.remove();value.remove();}};
}
