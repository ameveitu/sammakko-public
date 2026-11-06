import { parseMeasure } from './spatial-measures';

export type SolidBase =
  | { kind: 'circle'; radius: number }
  | { kind: 'rectangle'; width: number; depth: number }
  | { kind: 'right-triangle'; width: number; depth: number; diagonal: number };
export type AdvancedShape =
  | { kind: 'column'; base: SolidBase; height: number; caps: 0 | 1 | 2 }
  | { kind: 'cone'; base: SolidBase; height: number; slant?: number; caps: 0 | 1 }
  | { kind: 'sphere'; radius: number }
  | { kind: 'ellipsoid'; radii: readonly [number, number, number] }
  | { kind: 'frustum'; lower: number; upper: number; height: number }
  | { kind: 'flat'; base: SolidBase };
export type SolidGroup = 'column' | 'cone' | 'sphere' | 'flat' | 'other';
export type SolidPose = 'upright' | 'horizontal' | 'tilted';
export type SolidView = 'body' | 'section' | 'net';
export type SurfaceUnit = 'cm' | 'm';
export type VolumeUnit = 'mm³' | 'cm³' | 'dm³' | 'm³' | 'l';
export type Comparison = 'less' | 'same' | 'greater';
export interface AdvancedFigure { id: string; shape: AdvancedShape; pose: SolidPose; color: string }
type CircularMeasureShape = Extract<AdvancedShape, { kind: 'column' | 'cone' | 'sphere' }>;
type Identify = { mode: 'identify'; figures: readonly AdvancedFigure[]; target: SolidGroup | 'all'; firstView: SolidView };
type Measure = {
  mode: 'measure'; figure: AdvancedFigure & { shape: CircularMeasureShape };
  target: 'surface' | 'volume' | 'height'; unit: SurfaceUnit; radiusGiven?: 'radius' | 'diameter';
  givenVolume?: number; // Coefficient of π for a circular base, plain volume for a polygon.
  compare?: { earlierRadius?: number; earlierHeight?: number; factor: boolean };
  demoFill?: 'cone-to-column' | 'layers'; result: 'exact' | 'approx' | 'either';
  context?: { kind: 'solid-base'; base: 'circle' | 'polygon' };
};
type Convert = { mode: 'convert'; from: VolumeUnit; to: VolumeUnit; amount: number };
export type AdvancedSolidsTask = (Identify | Measure | Convert) & { kind: 'advanced-solids'; title: string };

export interface SolidWitness {
  group?: SolidGroup;
  bases?: string;
  tips?: string;
  equalBases?: boolean;
  radii?: readonly string[];
}
export type MeasurementField = 'radius' | 'perimeter' | 'baseArea' | 'slant' | 'lateral' | 'caps' | 'power' | 'factor' | 'total' | 'scale';
export type AdvancedSolidsResponse =
  | { kind: 'advanced-solids'; mode: 'identify'; view?: SolidView; choices: Readonly<Record<string, SolidWitness>> }
  | { kind: 'advanced-solids'; mode: 'measure'; view?: SolidView; values: Readonly<Partial<Record<MeasurementField, string>>>;
      unit: string; notation?: 'exact' | 'approx'; rounded?: string; prediction?: Comparison; locked?: boolean; fillStep?: number }
  | { kind: 'advanced-solids'; mode: 'convert'; view?: SolidView; axes: readonly string[];
      operation?: 'times' | 'divide' | 'same'; factor?: string; value?: string; unit: string };

export interface AdvancedSolidsScene {
  kind: 'advanced-solids'; mode: AdvancedSolidsTask['mode']; title: string; view: SolidView;
  figures: readonly AdvancedFigure[]; target?: Measure['target']; demoFill?: Measure['demoFill'];
  fillStep?: number; grid?: { subdivisions: number; from: VolumeUnit; to: VolumeUnit };
  comparisonOpen?: boolean;
}
export function debugAdvancedSolidsScene(scene: AdvancedSolidsScene) {
  return {
    kind: scene.kind, mode: scene.mode, title: scene.title, view: scene.view,
    figures: scene.figures.map(({ id, pose }) => ({ id, pose })),
    target: scene.target, demoFill: scene.demoFill, fillStep: scene.fillStep,
    grid: scene.grid && { from: scene.grid.from, to: scene.grid.to },
    comparisonOpen: !!scene.comparisonOpen,
  };
}

type Q = readonly [numerator: bigint, denominator: bigint];
const integer = (n: number): Q => [BigInt(n), 1n];
const multiply = ([a,b]: Q, [c,d]: Q): Q => [a*c,b*d];
const add = ([a,b]: Q, [c,d]: Q): Q => [a*d+b*c,b*d];
const divide = ([a,b]: Q, [c,d]: Q): Q => [a*d,b*c];
const square = (value: Q) => multiply(value, value);
const cube = (value: Q) => multiply(square(value), value);
const number = (value: Q) => Number(value[0]) / Number(value[1]);
const rational = (value: number): Q => Number.isInteger(value) ? integer(value) : [BigInt(value * 2), 2n];
const text = ([n,d]: Q) => n % d === 0n ? String(n/d) : `${n}/${d}`;
const math = (value: unknown) => typeof value === 'string' && value.length <= 32 ? parseMeasure(value) : undefined;
const has = (given: unknown, [a,b]: Q) => {
  const parsed = math(given);
  return !!parsed && parsed[0]*b === parsed[1]*a;
};
export const solidNumericInput = (value: string) => math(value) ? value.trim() : '';

export const solidGroupLabel: Readonly<Record<SolidGroup, string>> = {
  column: 'Lieriö', cone: 'Kartio', sphere: 'Pallo', flat: 'Tasokuvio', other: 'Muu kappale',
};
export const solidGroups = ['column','cone','sphere','flat','other'] as const;
export function advancedShapeClass(shape: AdvancedShape): SolidGroup {
  switch (shape.kind) {
    case 'column': case 'cone': case 'sphere': case 'flat': return shape.kind;
    case 'ellipsoid': case 'frustum': return 'other';
  }
}
const groupOf = (figure: AdvancedFigure) => advancedShapeClass(figure.shape);
export function orthogonalRadii(shape: AdvancedShape): readonly [number, number, number] | undefined {
  if (shape.kind === 'sphere') return [shape.radius, shape.radius, shape.radius];
  if (shape.kind === 'ellipsoid') return shape.radii;
  return undefined;
}
function solutionWitness(figure: AdvancedFigure, target: Identify['target']): SolidWitness {
  const group = groupOf(figure);
  const selected = target === 'all' || group === target;
  if (!selected) return { group: 'other' };
  if (group === 'cone') return { group, bases: '1', tips: '1' };
  if (group === 'column') return { group, bases: '2', equalBases: true };
  if (group === 'sphere') return { group, radii: orthogonalRadii(figure.shape)!.map(String) };
  return { group };
}
function validWitness(figure: AdvancedFigure, target: Identify['target'], actual: SolidWitness) {
  const expected = solutionWitness(figure, target);
  if (actual.group !== expected.group) return false;
  if (expected.bases !== undefined && (!own(actual,'bases') || !has(actual.bases, integer(Number(expected.bases))))) return false;
  if (expected.tips !== undefined && (!own(actual,'tips') || !has(actual.tips, integer(Number(expected.tips))))) return false;
  if (expected.equalBases !== undefined && (!own(actual,'equalBases') || actual.equalBases !== expected.equalBases)) return false;
  if (!expected.radii) return true;
  const radii = actual.radii;
  return own(actual,'radii') && Array.isArray(radii) && radii.length === 3 && expected.radii.every((r,i) => has(radii[i], rational(Number(r))));
}
function expectedBase(base: SolidBase): { area: Q; perimeter: Q; pi: boolean } {
  if (base.kind === 'circle') {
    const r = rational(base.radius);
    return { area: square(r), perimeter: multiply(integer(2),r), pi: true };
  }
  if (base.kind === 'rectangle') return { area: integer(base.width*base.depth), perimeter: integer(2*(base.width+base.depth)), pi: false };
  return { area: [BigInt(base.width*base.depth),2n], perimeter: integer(base.width+base.depth+base.diagonal), pi: false };
}

export interface MeasurementRequirement { key: MeasurementField; label: string; exact: Q; pi?: boolean }
export interface MeasurementPlan {
  requirements: readonly MeasurementRequirement[];
  answer: Q; pi: boolean; unit: string; comparison?: Comparison;
}
export function advancedMeasurementPlan(task: Measure): MeasurementPlan {
  const { shape } = task.figure;
  const requirements: MeasurementRequirement[] = [];
  const addField = (key: MeasurementField, label: string, exact: Q, pi = false) =>
    requirements.push({ key, label, exact, ...(pi ? { pi: true } : {}) });
  const surface = task.target === 'surface';
  const radius = shape.kind === 'sphere' ? shape.radius : shape.base.kind === 'circle' ? shape.base.radius : undefined;
  if (radius !== undefined) addField('radius','Säde',rational(radius));
  let answer: Q, pi: boolean;
  if (shape.kind === 'sphere') {
    const r = rational(shape.radius), power = surface ? square(r) : cube(r);
    addField('power',surface ? 'Säteen neliö' : 'Säteen kuutio',power);
    answer = multiply(power,surface ? integer(4) : [4n,3n]); pi = true;
  } else {
    const base = expectedBase(shape.base);
    pi = base.pi;
    if (task.target !== 'surface' || shape.caps > 0) addField('baseArea','Yhden pohjan ala',base.area,pi);
    if (surface) {
      let lateral: Q;
      if (shape.kind === 'column') {
        addField('perimeter','Pohjan ympärysmitta',base.perimeter,pi);
        lateral = multiply(base.perimeter,rational(shape.height));
      } else {
        const slant = rational(shape.slant!);
        addField('slant','Vaipan sivujana',slant);
        lateral = multiply(rational(radius!),slant);
      }
      addField('lateral','Vaipan ala',lateral,pi);
      addField('caps','Mukaan tulevat pohjat',integer(shape.caps));
      answer = add(lateral,multiply(base.area,integer(shape.caps)));
    } else if (task.target === 'height') {
      answer = divide(rational(task.givenVolume!),base.area); pi = false;
    } else {
      if (shape.kind === 'cone') addField('factor','Osuus vertailulieriöstä',[1n,3n]);
      answer = multiply(multiply(base.area,rational(shape.height)),shape.kind === 'cone' ? [1n,3n] : integer(1));
    }
  }
  let comparison: Comparison | undefined;
  if (task.compare) {
    const ratioR = task.compare.earlierRadius === undefined ? integer(1) : divide(rational(radius!),rational(task.compare.earlierRadius));
    const ratioH = task.compare.earlierHeight === undefined || shape.kind === 'sphere' ? integer(1)
      : divide(rational(shape.height),rational(task.compare.earlierHeight));
    const scale = shape.kind === 'sphere' && !surface ? cube(ratioR) : multiply(square(ratioR),ratioH);
    comparison = scale[0] === scale[1] ? 'same' : scale[0] > scale[1] ? 'greater' : 'less';
    if (task.compare.factor) addField('scale','Uuden ja entisen suhde',scale);
  }
  addField('total',task.target === 'height' ? 'Kohtisuora korkeus' : surface ? 'Koko pinta-ala' : 'Tilavuus',answer,pi);
  return { requirements,answer,pi,unit:task.unit+(task.target==='height'?'':surface?'²':'³'),comparison };
}
export function approximationAdvancedSolid(plan: MeasurementPlan): string {
  return (number(plan.answer)*(plan.pi?Math.PI:1)).toFixed(2);
}

const lengthsMm: Readonly<Record<VolumeUnit, number>> = { 'mm³':1,'cm³':10,'dm³':100,'m³':1000,l:100 };
export function volumeConversion(task: Convert) {
  const from = lengthsMm[task.from], to = lengthsMm[task.to];
  const step = Math.max(from,to)/Math.min(from,to);
  const direction = from > to ? 'times' : from < to ? 'divide' : 'same';
  const factor = integer(step**3);
  const result = direction === 'times' ? multiply(rational(task.amount),factor) : divide(rational(task.amount),factor);
  return { step, direction, factor, result } as const;
}
const pass = { ok:true };
const fail = (why:string) => ({ ok:false,why });
function own(record: object, key: PropertyKey) {
  return Object.prototype.hasOwnProperty.call(record,key);
}
export function checkAdvancedSolids(task: AdvancedSolidsTask, response: AdvancedSolidsResponse): { ok: boolean; why?: string } {
  if (!response || response.kind !== 'advanced-solids' || response.mode !== task.mode) return fail('Täydennä tämän pajan merkinnät.');
  if (task.mode === 'identify' && response.mode === 'identify') {
    if (!response.choices || typeof response.choices !== 'object' || Object.keys(response.choices).length !== task.figures.length)
      return fail('Luokittele jokainen kappale.');
    for (const figure of task.figures) {
      const witness = own(response.choices,figure.id) ? response.choices[figure.id] : undefined;
      if (!witness || !own(witness,'group') || !validWitness(figure,task.target,witness))
        return fail(`Tarkista malli ${figure.id}. Katso pohjat, mahdollinen yhteinen huippu tai keskus–pinta-mitat.`);
    }
  } else if (task.mode === 'measure' && response.mode === 'measure') {
    const plan = advancedMeasurementPlan(task);
    if (plan.comparison && (response.locked !== true || response.prediction !== plan.comparison))
      return fail('Lukitse oma ennuste ensin. Vertaa, mikä mitta muuttui ja mitä se tekee pinta-alalle tai tilavuudelle.');
    if (task.demoFill && response.fillStep !== 3) return fail('Tutki kaikki kolme täyttövaihetta ennen kuin kirjaat havaintosi.');
    if (!response.values || typeof response.values !== 'object') return fail('Täydennä laskurivin mitat.');
    for (const required of plan.requirements) {
      if (!own(response.values,required.key) || !has(response.values[required.key],required.exact))
        return fail(required.key === 'slant' ? 'Vaipan mitassa käytetään kartion sivujanaa. Kohtisuora korkeus kuuluu tilavuuslaskuun.'
          : required.key === 'caps' ? 'Laske vain ne pohjat ja kannet, jotka kuuluvat tähän kuoreen.'
          : required.key === 'factor' ? 'Vertailulieriön pohja ja korkeus ovat samat. Katso yhden täyden kaadon osuus.'
          : `Tarkista laskurivi ”${required.label}”.`);
    }
    if (response.unit !== plan.unit) return fail('Pituus, pinta-ala ja tilavuus tarvitsevat eri yksiköt.');
    if (plan.pi) {
      if (response.notation !== 'exact' && response.notation !== 'approx' || task.result !== 'either' && response.notation !== task.result)
        return fail('Valitse tarkka π-muoto tai pyydetty kahden desimaalin likiarvo.');
      if (response.notation === 'approx' && !has(response.rounded,parseMeasure(approximationAdvancedSolid(plan))!))
        return fail('Kerro tarkka kerroin piillä ja pyöristä vasta lopussa kahteen desimaaliin.');
    }
  } else if (task.mode === 'convert' && response.mode === 'convert') {
    const { step,direction,factor,result } = volumeConversion(task);
    if (!Array.isArray(response.axes) || response.axes.length !== 3 || ![0,1,2].every(i=>has(response.axes[i],integer(step))))
      return fail('Vertaa suuren yksikkökuution jokaista särmää pienen kuution särmään.');
    if (!has(response.factor,factor) || response.operation !== direction)
      return fail('Kuutioi yhden särmän kerroin ja valitse kertominen tai jakaminen yksikön koon mukaan.');
    if (!has(response.value,result) || response.unit !== task.to) return fail('Sama tilavuus merkitään uudella lukuarvolla ja uudella yksiköllä.');
  }
  return pass;
}

export function solutionAdvancedSolids(task: AdvancedSolidsTask): AdvancedSolidsResponse {
  const kind = 'advanced-solids';
  if (task.mode === 'identify') return { kind,mode:'identify',choices:Object.fromEntries(task.figures.map(f=>[f.id,solutionWitness(f,task.target)])) };
  if (task.mode === 'measure') {
    const plan = advancedMeasurementPlan(task);
    return { kind,mode:'measure',values:Object.fromEntries(plan.requirements.map(field=>[field.key,text(field.exact)])),
      unit:plan.unit,notation:task.result==='approx'?'approx':'exact',rounded:approximationAdvancedSolid(plan),
      prediction:plan.comparison,locked:!!plan.comparison,fillStep:task.demoFill?3:undefined };
  }
  const { step,direction,factor,result } = volumeConversion(task);
  return { kind,mode:'convert',axes:Array(3).fill(String(step)),operation:direction,factor:text(factor),value:text(result),unit:task.to };
}
export function wrongAdvancedSolidsResponses(task: AdvancedSolidsTask): AdvancedSolidsResponse[] {
  const r = solutionAdvancedSolids(task);
  if (r.mode === 'identify') return [{ ...r,choices:{} }];
  if (r.mode === 'measure') return [{ ...r,values:{ ...r.values,total:'0' } },{ ...r,unit:'cm⁴' }];
  return [{ ...r,factor:'0' },{ ...r,axes:['0','0','0'] }];
}

export function comparisonFigure(task: Measure): AdvancedFigure | undefined {
  if (!task.compare) return;
  const { shape } = task.figure;
  if (shape.kind === 'sphere') return { ...task.figure,id:'Ennen',shape:{ ...shape,radius:task.compare.earlierRadius! } };
  if (shape.base.kind !== 'circle') return;
  return { ...task.figure,id:'Ennen',shape:{ ...shape,height:task.compare.earlierHeight??shape.height,
    base:{ ...shape.base,radius:task.compare.earlierRadius??shape.base.radius } } };
}
