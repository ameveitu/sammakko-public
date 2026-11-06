/** Idealised daylight, solstice and comparison models. Rendering never scores answers.
 * Sources: NASA https://science.nasa.gov/earth/facts/ ;
 * https://science.nasa.gov/earth/earth-observatory/an-epic-view-of-the-seasons/ ;
 * https://science.nasa.gov/photojournal/illustration-comparing-apparent-sizes-of-moons/ ;
 * https://science.nasa.gov/solar-system/solar-system-facts/ ;
 * https://science.nasa.gov/sun/facts/ ;
 * https://science.nasa.gov/astrobiology/learning-resources/alp/how-did-our-solar-system-form/
 */
export type SunState = 'day' | 'night' | 'terminator';
/** Angles in degrees. 0 faces Sun; site offset 180 is the opposite site. */
export function daylight(rotation: number, siteOffset: number): SunState {
  const dot = Math.cos((rotation + siteOffset) * Math.PI / 180);
  return Math.abs(dot) < 1e-10 ? 'terminator' : dot > 0 ? 'day' : 'night';
}
/** Geometric solstice model: spherical Earth, no atmospheric refraction or terrain. */
export function solstice(latitudeDeg: number, month: 'june' | 'december') {
  if (!Number.isFinite(latitudeDeg) || Math.abs(latitudeDeg) > 90) throw new RangeError('Invalid latitude');
  const declination = month === 'june' ? 23.44 : -23.44;
  const phi = latitudeDeg*Math.PI/180, delta=declination*Math.PI/180;
  const noonElevation = Math.max(-90, Math.min(90, 90-Math.abs(latitudeDeg-declination)));
  const q = -Math.tan(phi)*Math.tan(delta);
  const dayHours = q <= -1 ? 24 : q >= 1 ? 0 : 24*Math.acos(q)/Math.PI;
  return {declination, noonElevation, dayHours};
}
export const nearData = {
  earth: {name:'Maa',diameterKm:12742}, moon:{name:'Kuu',diameterKm:3474},
  mars:{name:'Mars',diameterKm:6779}, phobos:{name:'Fobos',diameterKm:22},
  earthMoonKm:384400, marsPhobosKm:9377,
} as const;
export const scaleKey = [
  {id:'planet',label:'Planeettojen välit',example:'1 AU ≈ 150 miljoonaa km',unit:'AU'},
  {id:'stars',label:'Tähtien välit',example:'1 valovuosi ≈ 9,46 biljoonaa km',unit:'valovuosi'},
  {id:'galaxy',label:'Galaksin mitta',example:'1 kpc ≈ 3 260 valovuotta',unit:'kpc'},
] as const;

export interface SpaceDayTask {
  kind:'space-day'; startRotation:0|90|180|270; targetRotation:0|180;
  site: 'A'|'B'; siteOffset:0|180;
}
export interface SpaceDayResponse {kind:'space-day';rotation:number;light?:'day'|'night'}
export function solutionSpaceDay(task:SpaceDayTask): SpaceDayResponse {
  const light=daylight(task.targetRotation,task.siteOffset);
  if(light==='terminator') throw new RangeError('Target must not lie on day/night boundary');
  return {kind:'space-day',rotation:task.targetRotation,light};
}
export function checkSpaceDay(task:SpaceDayTask,response:SpaceDayResponse) {
  if(response.rotation!==task.targetRotation) return {ok:false,why:'Käännä mallia ensin annettuun kulmaan. Auringon suunta pysyy samana.'};
  return response.light===solutionSpaceDay(task).light ? {ok:true} : {ok:false,why:'Katso osoittaako valittu paikka Aurinkoa kohti vai poispäin.'};
}
export function wrongSpaceDay(task:SpaceDayTask):SpaceDayResponse[] {
  const right=solutionSpaceDay(task);
  return [{kind:'space-day',rotation:(task.targetRotation+90)%360,light:right.light},{kind:'space-day',rotation:task.targetRotation,light:right.light==='day'?'night':'day'}];
}
