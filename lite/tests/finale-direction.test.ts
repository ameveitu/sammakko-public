import {expect,it} from 'vitest';
import {FINALE_CHAPTERS,FINALE_SECONDS} from '../src/content/finale';
import {finaleDirectionAt} from '../src/content/finale-direction';

it('keeps every screenplay shot reachable with finite camera and cast transforms',()=>{
  const shots=FINALE_CHAPTERS.flatMap(c=>c.shots);expect(shots).toHaveLength(35);
  for(let i=0;i<shots.length;i++)for(const ratio of [0,.2,.7,.999]){
    const shot=shots[i]!,end=shots[i+1]?.start??FINALE_SECONDS,d=finaleDirectionAt(shot.start+(end-shot.start)*ratio);
    expect(d.shotStart).toBe(shot.start);expect(d.art).toBe(shot.art);
    expect([...d.camera.position,...d.camera.target,d.camera.fov,...d.actors.flatMap(a=>[...a.position,a.yaw,a.time])].every(Number.isFinite)).toBe(true);
    expect(new Set(d.actors.map(a=>a.id)).size).toBe(d.actors.length);
  }
});
it('preserves the two voluntary directions and delays the child until the final shot',()=>{
  expect(finaleDirectionAt(184).actors.map(a=>a.id)).toEqual(['aava','loikka']);
  expect(finaleDirectionAt(352).actors.map(a=>a.id)).toEqual(['aava']);
  expect(finaleDirectionAt(410).actors.map(a=>a.id)).toEqual(['aava']);
  expect(finaleDirectionAt(424).actors.map(a=>a.id)).toEqual(['loikka']);
  expect(finaleDirectionAt(470).actors.map(a=>a.id)).toEqual(['aava']);
  for(let t=0;t<=502;t+=.5)expect(finaleDirectionAt(t).props.bill).toBe(0);
  expect(finaleDirectionAt(512).props.bill).toBe(1);
  expect(finaleDirectionAt(520).actors).toEqual([]);
});
it('seeking is history-independent and reduced motion holds a stable composition within each shot',()=>{
  const before=finaleDirectionAt(512);finaleDirectionAt(47);finaleDirectionAt(327);expect(finaleDirectionAt(512)).toEqual(before);
  for(const chapter of FINALE_CHAPTERS)for(let i=0;i<chapter.shots.length;i++){
    const start=chapter.shots[i]!.start,end=chapter.shots[i+1]?.start??chapter.end;
    const a=finaleDirectionAt(start+.1,true),b=finaleDirectionAt(end-.1,true);
    expect(a.camera).toEqual(b.camera);expect(a.actors).toEqual(b.actors);expect(a.props).toEqual(b.props);
  }
});
