/** Exact hundredths used by the workbench. Floats are only used at display coordinates. */
export function decimalLabel(hundredths: number, places: 1 | 2 = 2): string {
  if (!Number.isSafeInteger(hundredths) || (places === 1 && hundredths % 10 !== 0)) {
    throw new RangeError('Decimal must fit the requested place values exactly');
  }
  const magnitude = Math.abs(hundredths);
  const whole = Math.floor(magnitude / 100);
  const remainder = magnitude % 100;
  return `${hundredths < 0 ? '−' : ''}${whole},${places === 1 ? remainder / 10 : String(remainder).padStart(2, '0')}`;
}

export type DecimalChange = { direction: '+' | '−'; hundredths: number };

export function ledger(start: number, changes: readonly DecimalChange[]): number[] {
  let value = start;
  return changes.map(({ direction, hundredths }) => {
    value += direction === '+' ? hundredths : -hundredths;
    return value;
  });
}

/** A hundredth may need a tenth to be exchanged, even when both inputs have two places. */
export function columnExchanges(before: number, removed: number) {
  const hundredths = before % 10 < removed % 10;
  const availableTenths = Math.floor(before / 10) % 10 - Number(hundredths);
  return { hundredths, tenths: availableTenths < Math.floor(removed / 10) % 10 };
}

export function fractionInHundredths(n: number, d: number): number {
  if (!Number.isSafeInteger(n) || !Number.isSafeInteger(d) || !Number.isSafeInteger(100 * n) || d <= 0 || (100 * n) % d !== 0) {
    throw new RangeError('Fraction is outside the exact hundredths domain');
  }
  return 100 * n / d;
}

export function percentAmount(rate: number, whole: number): number {
  const units = rate * whole;
  if (!Number.isSafeInteger(rate) || !Number.isSafeInteger(whole) || !Number.isSafeInteger(units) || units % 100 !== 0) {
    throw new RangeError('Percentage is outside the exact whole-unit domain');
  }
  return units / 100;
}

export interface DecimalTickRange {
  min: number;
  max: number;
  step: number;
  target: number;
}

export function decimalTicks(min: number, max: number, step: number, target: number): DecimalTickRange {
  if (![min, max, step, target].every(Number.isSafeInteger) || step <= 0 || max <= min || target < min || target > max ||
      (max - min) % step !== 0 || (target - min) % step !== 0) {
    throw new RangeError('Target and endpoints must be exact ticks');
  }
  return { min, max, step, target };
}
