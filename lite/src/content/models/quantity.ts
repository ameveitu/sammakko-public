export interface FractionSplit {
  kind: 'fraction-split';
  shape: 'cake' | 'strip';
  n: number;
  d: number;
  recipients: number;
}

export function fractionShare(model: FractionSplit) {
  if (!Number.isInteger(model.recipients) || model.recipients < 1) throw new RangeError('Division needs a positive whole number');
  if (!Number.isInteger(model.n) || model.n < 0 || !Number.isInteger(model.d) || model.d < 1) throw new RangeError('Invalid fraction');
  return model.n % model.recipients === 0
    ? { n: model.n / model.recipients, d: model.d }
    : { n: model.n, d: model.d * model.recipients };
}

export interface EqualLevel {
  kind: 'equal-level';
  values: number[];
  material: 'blocks' | 'strips';
}

export function levelValues(model: EqualLevel) {
  if (!model.values.length) throw new RangeError('The mean needs at least one observation');
  if (model.values.some((n) => !Number.isFinite(n) || n < 0 || (model.material === 'blocks' && !Number.isInteger(n)))) {
    throw new RangeError('Observations must match the material');
  }
  const total = model.values.reduce((sum, n) => sum + n, 0);
  const count = model.values.length;
  if (model.material === 'blocks' && total % count !== 0) throw new RangeError('Use cuttable strips for fractional levels');
  return { total, count, value: total / count };
}

export function percentOf(part: number, base: number) {
  if (!Number.isFinite(base) || base <= 0) throw new RangeError('The reference amount must be positive');
  return part * 100 / base;
}

export function amountOf(percent: number, base: number) {
  return percent * base / 100;
}

export function baseOf(part: number, percent: number) {
  if (!Number.isFinite(percent) || percent <= 0) throw new RangeError('Zero percent does not determine a base');
  return part * 100 / percent;
}

export function percentChange(before: number, after: number) {
  return percentOf(after - before, before);
}

export function percentPlan(before: number, after: number) {
  return { difference: after - before, relative: percentChange(before, after) };
}

export interface QuantityRow {
  label: string;
  amount: number | null;
  /** Draw marked objects within a single existing row. Omit if an amount is unknown. */
  marked?: number;
  markEnd?: boolean;
  /** Total capacity of a known part, on the same scale. */
  extent?: number;
  base?: boolean;
}

export interface QuantityBoard {
  kind: 'quantity-board';
  view: 'tiles' | 'ruler' | 'ledger';
  unit: 'palaa' | 'ruutua' | 'kpl' | 'm²' | 'm' | 'l';
  reference: string;
  givenPercent?: number;
  /** Proportion of the first known amount when the whole has no given amount. */
  referencePartPercent?: number;
  /** A fixed visible scale ceiling, retained across the given and resolved views. */
  scaleMaximum?: number;
  rows: QuantityRow[];
  notes?: string[];
}
