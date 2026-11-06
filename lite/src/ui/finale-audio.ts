import { FINALE_SCORE,finaleNotePcm } from '../content/finale-score';

/** Film-clock audio: pause/seek cancels every old voice; enabling audio never starts playback. */
export function createFinaleSound(){
  let context:AudioContext|undefined,last:number|undefined,disposed=false;
  const active=new Set<AudioBufferSourceNode>(),scheduled=new Set<number>();
  function stop(){for(const source of active){try{source.stop();}catch{/* already ended */}}active.clear();scheduled.clear();last=undefined;}
  return {
    enable():boolean{
      if(disposed||typeof AudioContext!=='function')return false;
      try{context??=new AudioContext();void context.resume().catch(()=>{});return true;}catch{return false;}
    },
    sync(seconds:number,playing:boolean){
      if(!playing){stop();return;}if(!context||context.state!=='running'||disposed)return;
      if(last!==undefined&&(seconds<last||seconds-last>1))stop();
      const beginning=last===undefined;last=seconds;
      for(const note of FINALE_SCORE){
        if(scheduled.has(note.id)||note.at>seconds+.3||note.at+note.duration<=seconds||!beginning&&note.at<seconds-.3)continue;
        scheduled.add(note.id);const pcm=finaleNotePcm(note,context.sampleRate),buffer=context.createBuffer(1,pcm.length,context.sampleRate);buffer.getChannelData(0).set(pcm);
        const source=context.createBufferSource(),pan=context.createStereoPanner();source.buffer=buffer;pan.pan.value=note.pan;source.connect(pan).connect(context.destination);
        active.add(source);source.onended=()=>{active.delete(source);source.disconnect();pan.disconnect();};
        source.start(context.currentTime+Math.max(0,note.at-seconds),Math.max(0,seconds-note.at));
      }
    },
    stop,
    snapshot(){return {enabled:!!context,state:context?.state??'unavailable',activeVoices:active.size,scheduledNotes:scheduled.size};},
    dispose(){disposed=true;stop();if(context)void context.close().catch(()=>{});},
  };
}
