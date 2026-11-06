const ONES = ['nolla', 'yksi', 'kaksi', 'kolme', 'neljä', 'viisi', 'kuusi', 'seitsemän', 'kahdeksan', 'yhdeksän', 'kymmenen'];

/** Finnish number word, 0–99. */
export function word(n: number): string {
  if (n <= 10) return ONES[n]!;
  if (n < 20) return `${ONES[n - 10]}toista`;
  const t = Math.floor(n / 10), o = n % 10;
  return `${ONES[t]}kymmentä${o ? ONES[o] : ''}`;
}

/** Displayed values that had to be rounded. A semantic test checks that each of them
 *  is written with ≈, never with =, wherever it appears. */
export const ROUNDED = new Set<string>();

/** Decimal comma for display (at most three decimals). */
export const fmt = (x: number) => {
  const r = Math.round(x * 1000) / 1000;
  const s = String(r).replace('.', ',');
  if (Math.abs(r - x) > 1e-9) ROUNDED.add(s.replace('-', '−')), ROUNDED.add(s);
  return s;
};

/** "= x" when the shown value is exact, "≈ x" when it had to be rounded. */
export const eqv = (x: number) => (Math.abs(Math.round(x * 1000) / 1000 - x) > 1e-9 ? '≈ ' : '= ') + fmt(x).replace('-', '−');
