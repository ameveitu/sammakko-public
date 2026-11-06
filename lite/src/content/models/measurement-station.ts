export type MeasureUnit = 'mm' | 'cm' | 'm' | 'g' | 'kg' | 'ml' | 'dl' | 'l';
export type Dimension = 'length' | 'mass' | 'liquid';
export type MeasureTool = 'ruler' | 'tape' | 'scale' | 'platform' | 'jug';
export type ToolReason = 'distance' | 'mass' | 'capacity';
export type Eye = 'above' | 'level' | 'below';
export type Meniscus = 'edge' | 'bottom';
export type Comparison = 'smaller' | 'same' | 'larger';
export type Judgment = 'fits' | 'too-small' | 'too-large' | 'wrong-dimension';
export type RecheckFault = 'origin' | 'gaps' | 'none';

export interface MeasureReading {
  value: string;
  unit: MeasureUnit | null;
}

export const measureUnits = {
  mm: { dimension: 'length', factor: 1 }, cm: { dimension: 'length', factor: 10 }, m: { dimension: 'length', factor: 1000 },
  g: { dimension: 'mass', factor: 1 }, kg: { dimension: 'mass', factor: 1000 },
  ml: { dimension: 'liquid', factor: 1 }, dl: { dimension: 'liquid', factor: 100 }, l: { dimension: 'liquid', factor: 1000 },
} as const satisfies Record<MeasureUnit, { dimension: Dimension; factor: number }>;

export const measureTools = {
  ruler: { label: 'Viivain', dimension: 'length', max: 300, division: 1, unit: 'mm' },
  tape: { label: 'Mittanauha', dimension: 'length', max: 5000, division: 10, unit: 'mm' },
  scale: { label: 'Pöytävaaka', dimension: 'mass', max: 1000, division: 1, unit: 'g' },
  platform: { label: 'Lattiavaaka', dimension: 'mass', max: 6000, division: 50, unit: 'g' },
  jug: { label: 'Mitta-astia', dimension: 'liquid', max: 2000, division: 100, unit: 'ml' },
} as const satisfies Record<MeasureTool, { label: string; dimension: Dimension; max: number; division: number; unit: MeasureUnit }>;
export const instruments = {
  length: { tool: 'tape', reason: 'distance', unit: 'cm' },
  mass: { tool: 'scale', reason: 'mass', unit: 'g' },
  liquid: { tool: 'jug', reason: 'capacity', unit: 'dl' },
} as const;

type Context = { title: string; skills: readonly string[] };
export type MeasurementMode =
  | { mode: 'mass'; object: string; grams: number; offset: number; basket: number; unit: 'g' | 'kg'; display: 'digital' | 'beam' }
  | { mode: 'liquid'; object: string; target: number; initial: number; capacity: number; portion: number; step: number; unit: 'ml' | 'dl' | 'l'; shape: 'cylinder' | 'flared' }
  | { mode: 'estimate'; object: string; reference: string; referenceMm: number; lengthMm: number; rangeMm: readonly [number, number] }
  | { mode: 'tool'; object: string; dimension: Dimension; question: string; maximum: number; resolution: number }
  | { mode: 'unit'; object: string; source: MeasureReading; amount: number; dimension: Dimension; allowedUnits: readonly MeasureUnit[] }
  | { mode: 'precision'; object: string; unit: 'cm' | 'g' | 'dl'; step: number; actual: number; end: number }
  | { mode: 'plausibility'; object: string; dimension: Dimension; expected: readonly [number, number]; reference: string; proposal: MeasureReading }
  | { mode: 'recheck'; object: string; origin: number; segments: number; segmentCm: number; oldRuler: number; oldSegments: number; fault: RecheckFault }
  | { mode: 'cube'; object: string; amount: number; direction: 'from-cubes' | 'from-litres'; portionDl: 2 | 5 | 10 };

export type MeasurementStationTask = MeasurementMode & { kind: 'measurement-station'; context: Context };

type ResponseMode =
  | { mode: 'mass'; zeroed: 'empty' | 'basket' | null; basketPlaced: boolean; placed: boolean; reading: MeasureReading }
  | { mode: 'liquid'; filled: number; eye: Eye | null; meniscus: Meniscus | null; reading: MeasureReading }
  | { mode: 'estimate'; estimate: MeasureReading | null; measured: boolean; reading: MeasureReading; comparison: Comparison | null }
  | { mode: 'tool'; tool: MeasureTool | null; reason: ToolReason | null }
  | { mode: 'unit'; reading: MeasureReading }
  | { mode: 'precision'; step: MeasureReading; reading: MeasureReading; approximate: boolean }
  | { mode: 'plausibility'; judgment: Judgment | null; reading: MeasureReading }
  | { mode: 'recheck'; tape: MeasureReading | null; segmentCount: number | null; fault: RecheckFault | null; reading: MeasureReading }
  | { mode: 'cube'; filled: number; pouredDl: number; edge: MeasureReading; litres: string; cubicDecimetres: string };

export type MeasurementStationResponse = ResponseMode & { kind: 'measurement-station' };

type Rational = { n: bigint; d: bigint };
function parse(text: string): Rational | undefined {
  const digits = /^([+-]?)(\d{1,12})(?:[,.](\d{1,8}))?$/.exec(text.trim());
  if (!digits) return;
  const [, sign, whole, fraction = ''] = digits;
  return { n: BigInt(whole + fraction) * (sign === '-' ? -1n : 1n), d: 10n ** BigInt(fraction.length) };
}
function scaled(reading: MeasureReading | null, dimension: Dimension): Rational | undefined {
  if (!reading?.unit) return;
  const unit = measureUnits[reading.unit];
  const raw = parse(reading.value);
  return unit?.dimension === dimension && raw ? { n: raw.n * BigInt(unit.factor), d: raw.d } : undefined;
}
function equals(raw: Rational | undefined, n: number): boolean {
  return !!raw && raw.n === BigInt(n) * raw.d;
}
function inRange(raw: Rational | undefined, [low, high]: readonly [number, number]): boolean {
  return !!raw && raw.n >= BigInt(low) * raw.d && raw.n <= BigInt(high) * raw.d;
}
export function displayMeasure(amount: number, unit: MeasureUnit): string {
  return String(amount / measureUnits[unit].factor).replace('.', ',');
}
const reading = (amount: number, unit: MeasureUnit): MeasureReading => ({ value: displayMeasure(amount, unit), unit });
function reads(value: MeasureReading, unit: MeasureUnit, amount: number): boolean {
  return value.unit === unit && equals(scaled(value, measureUnits[unit].dimension), amount);
}
export function compareEstimate(estimate: MeasureReading | null, lengthMm: number): Comparison | null {
  const v = scaled(estimate, 'length');
  if (!v) return null;
  const actual = BigInt(lengthMm) * v.d;
  return v.n < actual ? 'smaller' : v.n > actual ? 'larger' : 'same';
}
export function judgeMeasurement(task: Extract<MeasurementMode, { mode: 'plausibility' }>): Judgment {
  const proposed = scaled(task.proposal, task.dimension);
  if (!proposed) return 'wrong-dimension';
  if (proposed.n < BigInt(task.expected[0]) * proposed.d) return 'too-small';
  if (proposed.n > BigInt(task.expected[1]) * proposed.d) return 'too-large';
  return 'fits';
}
function compact(value: MeasureReading, task: Extract<MeasurementMode, { mode: 'unit' }>) {
  const raw = parse(value.value);
  return !!value.unit && task.allowedUnits.includes(value.unit) && !!raw && raw.n % raw.d === 0n
    && inRange(raw, [1, 99]) && equals(scaled(value, task.dimension), task.amount);
}
export function massDisplayGrams(task: Extract<MeasurementMode, { mode: 'mass' }>,
  basketPlaced: boolean, placed: boolean, zeroed: 'empty' | 'basket' | null): number {
  const tare = zeroed === 'basket' ? task.offset + task.basket : zeroed === 'empty' ? task.offset : 0;
  return task.offset + (basketPlaced ? task.basket : 0) + (placed ? task.grams : 0) - tare;
}
export function massBeamMark(grams: number): { first: number; fraction: number } {
  const first = Math.floor(grams / 100) * 100 - 100;
  return { first, fraction: (grams - first) / 300 };
}
export const vesselWidths = { top: 112, base: 54 };
export function liquidHeightFraction(shape: 'cylinder' | 'flared', volume: number, capacity: number): number {
  const fraction = volume / capacity;
  if (shape === 'cylinder') return fraction;
  // In the flared vessel the horizontal width grows linearly with height and the depth is constant.
  const { top, base } = vesselWidths;
  const spread = top - base;
  return (Math.sqrt(base * base + spread * (top + base) * fraction) - base) / spread;
}
export function precisionMark(actual: number, step: number): number {
  const low = actual - actual % step;
  return 2 * (actual - low) < step ? low : low + step;
}
function precisionReading(value: MeasureReading, unit: MeasureUnit, amount: number, step: number): boolean {
  const decimals = (value.value.trim().split(/[,.]/)[1] ?? '').length;
  const displayedDecimals = (displayMeasure(step, unit).split(',')[1] ?? '').length;
  return decimals <= displayedDecimals && reads(value, unit, amount);
}
export function suitableMeasureTool(task: Extract<MeasurementMode, { mode: 'tool' }>, name: MeasureTool | null) {
  const tool = name && measureTools[name];
  return !!tool && tool.dimension === task.dimension && tool.max >= task.maximum && tool.division <= task.resolution;
}
const fail = (why: string) => ({ ok: false, why });
const pass = { ok: true };

export function checkMeasurementStation(task: MeasurementStationTask, answer: MeasurementStationResponse): { ok: boolean; why?: string } {
  if (answer.kind !== 'measurement-station' || answer.mode !== task.mode) return fail('Tämä mittalappu kuuluu toiselle välineelle.');
  switch (answer.mode) {
    case 'mass':
      if (task.mode !== answer.mode) break;
      if (!answer.placed || answer.basketPlaced !== (task.basket > 0) || answer.zeroed !== (task.basket ? 'basket' : 'empty')) {
        return fail('Tarkista vaa’an nollaus mittausta varten ja aseta vasta sitten punnittava kuorma.');
      }
      return reads(answer.reading, task.unit, task.grams) ? pass : fail('Merkitse nollatun vaa’an lukema ja sen yksikkö.');
    case 'liquid':
      if (task.mode !== answer.mode) break;
      if (answer.eye !== 'level' || answer.meniscus !== 'bottom') return fail('Lue veden meniskin alin kohta silmän korkeudelta.');
      if (answer.filled !== task.target || answer.filled % task.portion !== 0) return fail('Tarkista veden pinta tavoitemäärän asteikkoviivasta.');
      return reads(answer.reading, task.unit, task.target) ? pass : fail('Tarkista asteikon lukema ja yksikkö.');
    case 'estimate':
      if (task.mode !== answer.mode) break;
      if (!answer.measured || !answer.estimate) return fail('Lukitse ensin karkea arvio ja mittaa vasta sitten.');
      if (!inRange(scaled(answer.estimate, 'length'), task.rangeMm)) return fail('Vertaa kohdetta tuttuihin vertailumittoihin. Arvio voi poiketa tarkasta mitasta.');
      if (!equals(scaled(answer.reading, 'length'), task.lengthMm)) return fail('Kirjoita mitattu pituus ja yksikkö.');
      return answer.comparison === compareEstimate(answer.estimate, task.lengthMm) ? pass : fail('Vertaa arviota ja mitattua pituutta samassa yksikössä.');
    case 'tool':
      if (task.mode !== answer.mode) break;
      return suitableMeasureTool(task, answer.tool) && answer.reason === instruments[task.dimension].reason
        ? pass : fail('Tarkista kysytty suure, välineen mittausalue ja asteikkoväli. Valitse myös mitä väline vertaa.');
    case 'unit':
      if (task.mode !== answer.mode) break;
      return compact(answer.reading, task) ? pass : fail('Säilytä sama määrä ja valitse yksikkö, jolla lappuun mahtuu kokonaisluku 1–99.');
    case 'precision':
      if (task.mode !== answer.mode) break;
      if (!precisionReading(answer.step, task.unit, task.step, task.step)) return fail('Katso kahden vierekkäisen viivan ero.');
      if (answer.approximate !== (task.actual % task.step !== 0)) return fail('Katso, osuuko osoitin asteikkoviivalle vai jääkö se viivojen väliin.');
      return precisionReading(answer.reading, task.unit, precisionMark(task.actual, task.step), task.step)
        ? pass : fail('Merkitse lähimmän asteikkoviivan arvo. Käytä asteikon tukemia numeroita.');
    case 'plausibility':
      if (task.mode !== answer.mode) break;
      if (answer.judgment !== judgeMeasurement(task)) return fail('Tarkista ensin suure ja sitten lukeman suuruus vertailurajoihin nähden.');
      return inRange(scaled(answer.reading, task.dimension), task.expected) ? pass : fail('Anna uskottava määrä ja sopiva yksikkö.');
    case 'recheck':
      if (task.mode !== answer.mode) break;
      if (!answer.tape || !equals(scaled(answer.tape, 'length'), task.segments * task.segmentCm * 10) || answer.segmentCount !== task.segments) {
        return fail('Käytä mittanauhaa ja täytä sama väli mittapaloilla. Laske nauhan päätepisteiden erotus.');
      }
      return answer.fault === task.fault && equals(scaled(answer.reading, 'length'), task.segments * task.segmentCm * 10)
        ? pass : fail('Vertaa kahta uutta havaintoa aiempiin merkintöihin ja valitse perusteltu mitta.');
    case 'cube':
      if (task.mode !== answer.mode) break;
      if (!reads(answer.edge, 'cm', 100)) return fail('Kuution jokainen särmä on yhden desimetrin eli kymmenen senttimetrin pituinen.');
      return answer.filled === task.amount && answer.pouredDl === task.amount * 10 && answer.pouredDl % task.portionDl === 0 && equals(parse(answer.litres), task.amount) && equals(parse(answer.cubicDecimetres), task.amount)
        ? pass : fail('Jokainen kokonaan täytetty yhden kuutiodesimetrin kuutio vastaa yhtä litraa.');
  }
  return fail('Mittalappu on keskeneräinen.');
}

export function solutionMeasurementStation(task: MeasurementStationTask): MeasurementStationResponse {
  const kind = task.kind;
  switch (task.mode) {
    case 'mass': return { kind, mode: task.mode, zeroed: task.basket ? 'basket' : 'empty', basketPlaced: task.basket > 0, placed: true, reading: reading(task.grams, task.unit) };
    case 'liquid': return { kind, mode: task.mode, filled: task.target, eye: 'level', meniscus: 'bottom', reading: reading(task.target, task.unit) };
    case 'estimate': {
      const rough = task.rangeMm[0];
      return { kind, mode: task.mode, estimate: reading(rough, 'cm'), measured: true,
        reading: reading(task.lengthMm, 'cm'), comparison: compareEstimate(reading(rough, 'cm'), task.lengthMm) };
    }
    case 'tool': return { kind, mode: task.mode, tool: (Object.keys(measureTools) as MeasureTool[]).find(tool => suitableMeasureTool(task, tool)) ?? null, reason: instruments[task.dimension].reason };
    case 'unit': return { kind, mode: task.mode, reading: reading(task.amount, task.allowedUnits.find(unit => compact(reading(task.amount, unit), task))!) };
    case 'precision': return { kind, mode: task.mode, step: reading(task.step, task.unit),
      reading: reading(precisionMark(task.actual, task.step), task.unit), approximate: task.actual % task.step !== 0 };
    case 'plausibility': return { kind, mode: task.mode, judgment: judgeMeasurement(task), reading: reading(task.expected[0], instruments[task.dimension].unit) };
    case 'recheck': {
      const length = reading(task.segments * task.segmentCm * 10, 'cm');
      return { kind, mode: task.mode, tape: length, segmentCount: task.segments, fault: task.fault, reading: length };
    }
    case 'cube': return { kind, mode: task.mode, filled: task.amount, pouredDl: task.amount * 10, edge: reading(100, 'cm'), litres: String(task.amount), cubicDecimetres: String(task.amount) };
  }
}

export function wrongMeasurementStationResponses(task: MeasurementStationTask): MeasurementStationResponse[] {
  const answer = solutionMeasurementStation(task);
  switch (answer.mode) {
    case 'mass': return [{ ...answer, zeroed: null }, { ...answer, placed: false }];
    case 'liquid': return [{ ...answer, eye: 'above' }, { ...answer, meniscus: 'edge' }, { ...answer, filled: answer.filled + 1 }];
    case 'estimate': return [{ ...answer, estimate: null }, { ...answer, measured: false }, { ...answer, comparison: null }];
    case 'tool': return [{ ...answer, tool: null }, { ...answer, reason: null }];
    case 'unit': return [{ ...answer, reading: { ...answer.reading, unit: null } }, { ...answer, reading: { ...answer.reading, value: '0' } }];
    case 'precision': return [{ ...answer, approximate: !answer.approximate }, { ...answer, reading: { ...answer.reading, value: '0,00000000' } }];
    case 'plausibility': return [{ ...answer, judgment: null }, { ...answer, reading: { ...answer.reading, unit: null } }];
    case 'recheck': return [{ ...answer, tape: null }, { ...answer, segmentCount: null }, { ...answer, fault: null }];
    case 'cube': return [{ ...answer, filled: 0 }, { ...answer, pouredDl: answer.pouredDl - 1 }, { ...answer, edge: reading(10, 'mm') }, { ...answer, cubicDecimetres: '0' }];
  }
}
