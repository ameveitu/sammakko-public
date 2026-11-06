import { FINALE_CHAPTERS, FINALE_SECONDS, FINALE_SOUNDS } from './finale';

export interface FinaleNote { id: number; at: number; duration: number; hz: number; level: number; voice: 'felt'|'flute'|'pad'|'bell'|'rumble'; pan: number; endHz?: number }
const hz=(midi:number)=>440*2**((midi-69)/12);
const notes:Omit<FinaleNote,'id'>[]=[];
const add=(at:number,duration:number,midi:number,level:number,voice:FinaleNote['voice'],pan=0)=>{
  if(at>=0&&at<FINALE_SECONDS)notes.push({at,duration:Math.min(duration,FINALE_SECONDS-at),hz:hz(midi),level,voice,pan});
};
// Original small motifs. Their phrasing leaves the choice, embrace and final shell room to breathe.
const aava=[60,62,67,65],loikka=[64,69,71],chords=[[48,55,60],[45,52,60],[41,53,57],[43,55,62]];
for(const chapter of FINALE_CHAPTERS){
  const quiet=['pesä','lähtöniemi','kuori'].includes(chapter.id),credits=chapter.start>=520;
  const step=quiet?12:8;
  for(let at=Math.max(chapter.start+2,8),bar=0;at<chapter.end-3;at+=step,bar++){
    const chord=chords[(bar+Math.floor(chapter.start/55))%chords.length]!;
    for(const [i,note]of chord.entries())add(at+i*.12,quiet?4.5:5.5,note,quiet?.004:.007,'pad',(i-1)*.18);
    if(!quiet||bar%2===0)add(at+.25,3,chord[0]!+12,.021,'felt',-.15);
    if(!quiet&&bar%2===0){
      const theme=chapter.id==='havainto'?loikka:bar%4===0?aava:loikka;
      for(const [i,note]of theme.entries())add(at+1.2+i*.85,1.8,note,credits?.034:.022,'flute',chapter.id==='havainto'?.18:-.12);
    }
  }
}
for(const cue of FINALE_SOUNDS){
  if(cue.cue==='drop')notes.push({at:cue.at,duration:.38,hz:760,endHz:365,level:.065,voice:'bell',pan:0});
  if(cue.cue==='tool'){add(cue.at,.32,75,.045,'bell',.18);add(cue.at+.04,.28,84,.02,'bell',.1);}
  if(cue.cue==='shell')add(cue.at,.16,63,.035,'felt',0);
  if(cue.cue==='launch')notes.push({at:cue.at,duration:4.2,hz:46,endHz:62,level:.065,voice:'rumble',pan:0});
}
// The two themes first overlap after the bill appears; the closing music continues through credits.
for(const [i,note]of aava.entries())add(511+i*.9,2.1,note,.033,'flute',-.18);
for(const [i,note]of loikka.entries())add(511.4+i*.9,2,note,.03,'felt',.18);
export const FINALE_SCORE:readonly FinaleNote[]=Object.freeze(notes.sort((a,b)=>a.at-b.at).map((n,id)=>Object.freeze({...n,id})));

/** Same deterministic PCM for browser playback and the exported film. No provider or sample license. */
export function finaleNotePcm(note:FinaleNote,sampleRate:number):Float32Array {
  const out=new Float32Array(Math.ceil(note.duration*sampleRate));
  const speaking=FINALE_CHAPTERS.some(c=>c.captions.some(line=>note.at>=line.start&&note.at<line.end));
  const level=note.level*(speaking&&note.voice!=='rumble'?.65:1);
  const attack=note.voice==='pad'?.5:note.voice==='flute'?.12:.012;
  for(let i=0;i<out.length;i++){
    const t=i/sampleRate,p=t/note.duration;
    const envelope=Math.min(1,t/attack)*Math.min(1,(note.duration-t)/(note.voice==='pad'?1.2:.22));
    const phase=2*Math.PI*(note.hz*t+(note.endHz===undefined?0:(note.endHz-note.hz)*t*t/(2*note.duration)));
    let wave=Math.sin(phase);
    if(note.voice==='felt')wave=(wave+.24*Math.sin(phase*2)+.08*Math.sin(phase*3))*Math.exp(-p*3.5);
    if(note.voice==='bell')wave=(wave+.3*Math.sin(phase*2.76))*Math.exp(-p*5);
    if(note.voice==='flute')wave=(wave+.1*Math.sin(phase*2))*(.98+.02*Math.sin(2*Math.PI*4.6*t));
    if(note.voice==='pad')wave=(wave+.15*Math.sin(phase*2))*.7;
    if(note.voice==='rumble')wave=(wave+.22*Math.sin(phase*.503)+.12*Math.sin(phase*1.997))*(.85+.15*Math.sin(t*15));
    out[i]=wave*envelope*level;
  }
  return out;
}
export function renderFinaleScore(sampleRate=22050,start=0,duration=FINALE_SECONDS):Float32Array {
  const output=new Float32Array(Math.ceil(sampleRate*duration));
  for(const note of FINALE_SCORE){
    if(note.at>=start+duration||note.at+note.duration<=start)continue;
    const pcm=finaleNotePcm(note,sampleRate),offset=Math.round((note.at-start)*sampleRate);
    for(let i=Math.max(0,-offset);i<pcm.length&&i+offset<output.length;i++)output[i+offset]!+=pcm[i]!;
  }
  return output;
}
