export interface PowerContext {
  title: string;
  skills: readonly string[];
  rules: readonly string[];
}

export interface FactorTree { value: number; children?: readonly [FactorTree, FactorTree] }
export type PrimeClass = 'prime' | 'composite' | 'one';
export type Rule = 'sum' | 'difference' | 'multiply' | 'keep';
export type Restriction = 'nonzero' | 'any';
export type RelationToOne = 'less' | 'equal' | 'greater';
export type Power = { kind: 'power'; base: string; exponent: number };
export type PowerExpression = Power
  | { kind: 'nested'; inner: Power; exponent: number }
  | { kind: 'product' | 'quotient'; left: PowerExpression; right: PowerExpression };
export type Focus = readonly ('left' | 'right')[];
export type RewriteStep = { rule: Rule | null; exponent: number | null };

export type PowerMode =
  | { mode: 'division'; dividend: number; divisor: number; draft?: number }
  | { mode: 'prime'; numbers: readonly number[] }
  | { mode: 'factor-tree'; number: number; givenPair?: readonly [number, number]; avoidPair?: readonly [number, number] }
  | { mode: 'expansion'; base: string; exponent: number; view: 'symbol' | 'factors' | 'signed' | 'grid'; outsideMinus?: boolean; identify: boolean; compareExponent?: number; compareBase?: string; compareOutsideMinus?: boolean }
  | { mode: 'exponent-table'; base: string; exponent: number; view: 'steps' | 'quotient' | 'symbol'; comparisonBase?: string }
  | { mode: 'rewrite'; source: PowerExpression; focuses: readonly Focus[]; counterexample?: Power; visual?: 'join' | 'cancel' | 'repeat' };

export type PowerRuleTask = PowerMode & {
  kind: 'power-rules';
  context: PowerContext;
  givens: readonly { label: string; value: string }[];
};

type Work =
  | { mode: 'division'; quotient: number; remainder: number; divisible: boolean | null }
  | { mode: 'prime'; rows: { classification: PrimeClass | null; divisor: number | null; divisorCount: number | null }[] }
  | { mode: 'factor-tree'; tree: FactorTree; product: number }
  | { mode: 'expansion'; base: string; exponent: number; factors: string[]; value: string; comparison: RelationToOne | null }
  | { mode: 'exponent-table'; value: string; divisor: string; reciprocalBase: string; positiveExponent: number; otherValue: string; restriction: Restriction | null; comparison: RelationToOne | null }
  | { mode: 'rewrite'; steps: RewriteStep[]; finalBase: string; finalExponent: number | null; restriction: Restriction | null; sourceValue: string; proposedValue: string; actions: number };
export type PowerRuleResponse = Work & { kind: 'power-rules' };

type Rational = readonly [bigint, bigint];

function rational(text: string): Rational | undefined {
  if (typeof text !== 'string') return;
  const input = text.trim().replaceAll('−', '-').replaceAll(' ', '').replace(/^(?:\(([^()]*)\))$/, '$1');
  const frac = /^([+-]?\d{1,8})\/([+-]?\d{1,8})$/.exec(input);
  if (frac) {
    const n = BigInt(frac[1]!), d = BigInt(frac[2]!);
    if (d !== 0n) return d < 0n ? [-n, -d] : [n, d];
    return;
  }
  const decimal = /^([+-]?)(\d{1,8})(?:[,.](\d{1,8}))?$/.exec(input);
  if (!decimal) return;
  const tail = decimal[3] ?? '';
  return [(decimal[1] === '-' ? -1n : 1n) * BigInt(decimal[2]! + tail), 10n ** BigInt(tail.length)];
}

const equal = (a: Rational, b: Rational) => a[0] * b[1] === b[0] * a[1];
function sameBase(input: string, base: string) {
  if (typeof input !== 'string') return false;
  const parsed = rational(input), expected = rational(base);
  return expected ? !!parsed && equal(parsed, expected) : input.trim() === base;
}
const equalsValue = (input: string, expected: Rational) => {
  const parsed = rational(input);
  return !!parsed && equal(parsed, expected);
};

function gcd(a: bigint, b: bigint): bigint {
  return b === 0n ? (a < 0n ? -a : a) : gcd(b, a % b);
}

function exactPower(base: string, exponent: number): Rational | undefined {
  const value = rational(base);
  if (!value || !Number.isSafeInteger(exponent) || Math.abs(exponent) > 24 || (value[0] === 0n && exponent <= 0)) return;
  const count = BigInt(Math.abs(exponent)), [n, d] = [value[0] ** count, value[1] ** count];
  if (exponent >= 0) return [n, d];
  return n < 0n ? [-d, -n] : [d, n];
}

function display([n, d]: Rational) {
  const divisor = gcd(n, d);
  const bottom = d / divisor;
  return bottom === 1n ? String(n / divisor) : `${n / divisor}/${bottom}`;
}

export function powerValue(base: string, exponent: number, outsideMinus = false): string | undefined {
  const value = exactPower(base, exponent);
  return value && display([outsideMinus ? -value[0] : value[0], value[1]]);
}

export const power = (base: string, exponent: number): Power => ({ kind: 'power', base, exponent });

const superscript = (n: number) => String(n).replace(/[0-9-]/g, ch => ch === '-' ? '⁻' : '⁰¹²³⁴⁵⁶⁷⁸⁹'[Number(ch)]!);
export function powerLabel(base: string, exponent: number) {
  return `${/^[-−]|\//.test(base) ? `(${base})` : base}${superscript(exponent)}`.replaceAll('-', '−');
}

export function expressionLabel(expression: PowerExpression): string {
  switch (expression.kind) {
    case 'power': return powerLabel(expression.base, expression.exponent);
    case 'nested': return `(${expressionLabel(expression.inner)})${superscript(expression.exponent)}`;
    case 'product': return `(${expressionLabel(expression.left)} × ${expressionLabel(expression.right)})`;
    case 'quotient': return `(${expressionLabel(expression.left)} ÷ ${expressionLabel(expression.right)})`;
  }
}

export function divisionParts(dividend: number, divisor: number): { quotient: number; remainder: number } | undefined {
  if (!Number.isSafeInteger(dividend) || !Number.isSafeInteger(divisor) || divisor === 0) return;
  const n = BigInt(dividend), d = BigInt(divisor), magnitude = d < 0n ? -d : d;
  const remainder = ((n % magnitude) + magnitude) % magnitude;
  return { quotient: Number((n - remainder) / d), remainder: Number(remainder) };
}

export function primeDivisor(value: number): number | undefined {
  if (!Number.isSafeInteger(value) || value < 2 || value > 10000) return;
  for (let d = 2; d * d <= value; d++) if (BigInt(value) % BigInt(d) === 0n) return d;
  return undefined;
}

const isPrime = (value: number) => Number.isSafeInteger(value) && value >= 2 && value <= 10000 && primeDivisor(value) === undefined;
const samePair = (a: number, b: number, [x, y]: readonly [number, number]) => (a === x && b === y) || (a === y && b === x);

function validTree(node: FactorTree, max: number, depth = 0): boolean {
  if (!node || !Number.isSafeInteger(node.value) || node.value < 2 || node.value > max || depth > 12) return false;
  if (node.children === undefined) return isPrime(node.value);
  if (!Array.isArray(node.children) || node.children.length !== 2) return false;
  const [a, b] = node.children;
  return validTree(a, node.value - 1, depth + 1) && validTree(b, node.value - 1, depth + 1)
    && BigInt(a.value) * BigInt(b.value) === BigInt(node.value);
}

function solutionTree(value: number, given?: readonly [number, number], avoid?: readonly [number, number]): FactorTree {
  if (isPrime(value)) return { value };
  const pair = given ?? Array.from({ length: value - 2 }, (_, i) => i + 2).find(d => value % d === 0 && d <= value / d && (!avoid || !samePair(d, value / d, avoid)));
  if (pair === undefined) return { value };
  const [a, b] = typeof pair === 'number' ? [pair, value / pair] : pair;
  return { value, children: [solutionTree(a), solutionTree(b)] };
}

export function focused(expression: PowerExpression, focus: Focus): PowerExpression {
  const [side, ...rest] = focus;
  if (!side) return expression;
  if (expression.kind !== 'product' && expression.kind !== 'quotient') throw new Error('Potenssivaihe puuttuu.');
  return focused(expression[side], rest);
}

function replaceFocus(expression: PowerExpression, focus: Focus, value: PowerExpression): PowerExpression {
  const [side, ...rest] = focus;
  if (!side) return value;
  if (expression.kind !== 'product' && expression.kind !== 'quotient') throw new Error('Potenssivaihe puuttuu.');
  return { ...expression, [side]: replaceFocus(expression[side], rest, value) };
}

function decide(expression: PowerExpression): { rule: Rule; exponent: number | null; base: string } {
  if (expression.kind === 'nested') {
    return { rule: 'multiply', exponent: expression.inner.exponent * expression.exponent, base: expression.inner.base };
  }
  if (expression.kind === 'power' || expression.left.kind !== 'power' || expression.right.kind !== 'power') throw new Error('Potenssivaihe tarvitsee valmiit osat.');
  const { left, right } = expression;
  if (!sameBase(left.base, right.base)) return { rule: 'keep', exponent: null, base: '' };
  return expression.kind === 'product' ? { rule: 'sum', exponent: left.exponent + right.exponent, base: left.base }
    : { rule: 'difference', exponent: left.exponent - right.exponent, base: left.base };
}

export function requiredPowerActions(task: Extract<PowerRuleTask, { mode: 'rewrite' }>): number {
  const { source } = task;
  if (task.visual === 'join') return 1;
  if (task.visual === 'repeat' && source.kind === 'nested') return source.exponent;
  if (task.visual === 'cancel' && source.kind === 'quotient' && source.left.kind === 'power' && source.right.kind === 'power') {
    return Math.min(source.left.exponent, source.right.exponent);
  }
  return 0;
}

export function applyPowerStep(expression: PowerExpression, focus: Focus, exponent: number | null): PowerExpression {
  const current = focused(expression, focus);
  const base = current.kind === 'nested' ? current.inner.base
    : current.kind !== 'power' && current.left.kind === 'power' ? current.left.base : '';
  return exponent === null || !base ? expression : replaceFocus(expression, focus, power(base, exponent));
}

function needsNonzero(expression: PowerExpression): boolean {
  switch (expression.kind) {
    case 'power': return expression.exponent <= 0;
    case 'nested': return expression.exponent <= 0 || needsNonzero(expression.inner);
    case 'product': return needsNonzero(expression.left) || needsNonzero(expression.right);
    case 'quotient': return true;
  }
}

function hasValidNumericDomain(expression: PowerExpression, nonzero = false): boolean {
  switch (expression.kind) {
    case 'power': return rational(expression.base)?.[0] !== 0n || (!nonzero && expression.exponent > 0);
    case 'nested': return hasValidNumericDomain(expression.inner, nonzero || expression.exponent <= 0);
    case 'product': return hasValidNumericDomain(expression.left, nonzero) && hasValidNumericDomain(expression.right, nonzero);
    case 'quotient': return hasValidNumericDomain(expression.left, nonzero) && hasValidNumericDomain(expression.right, true);
  }
}

function rewriteSolution(task: Extract<PowerRuleTask, { mode: 'rewrite' }>) {
  let expression = task.source;
  const steps = task.focuses.map(focus => {
    const { rule, exponent } = decide(focused(expression, focus));
    expression = applyPowerStep(expression, focus, exponent);
    return { rule, exponent };
  });
  return { steps, expression, restriction: needsNonzero(task.source) ? 'nonzero' as const : 'any' as const };
}

const chooseRelation = (left: Rational, right: Rational): RelationToOne => {
  const a = left[0] * right[1], b = right[0] * left[1];
  return a < b ? 'less' : a > b ? 'greater' : 'equal';
};
const one: Rational = [1n, 1n];
const yes = { ok: true };
const no = (why: string) => ({ ok: false, why });
const response = <T extends Work>(answer: T): T & { kind: 'power-rules' } => ({ kind: 'power-rules', ...answer });

export function checkPowerRule(task: PowerRuleTask, answer: PowerRuleResponse): { ok: boolean; why?: string } {
  if (answer.mode !== task.mode) return no('Täydennä tämän työpöydän merkinnät.');
  switch (task.mode) {
    case 'division': {
      const parts = divisionParts(task.dividend, task.divisor);
      if (!parts || answer.mode !== 'division' || answer.quotient !== parts.quotient || answer.remainder !== parts.remainder) {
        return no('Tarkista kertorivi ja jakojäännös. Jäännös on vähintään 0 ja pienempi kuin jakajan itseisarvo.');
      }
      return answer.divisible === (parts.remainder === 0) ? yes : no('Luku on jaollinen annetulla jakajalla juuri silloin, kun jäännös on nolla.');
    }
    case 'prime': {
      if (answer.mode !== 'prime' || !Array.isArray(answer.rows) || answer.rows.length !== task.numbers.length) return no('Luokittele jokainen luku.');
      const wrong = task.numbers.findIndex((n, i) => {
        const row = answer.rows[i];
        if (!row) return true;
        if (n === 1) return row.classification !== 'one' || row.divisor !== null || row.divisorCount !== 1;
        if (isPrime(n)) return row.classification !== 'prime' || row.divisor !== null;
        const d = row.divisor;
        return row.classification !== 'composite' || d === null || !Number.isSafeInteger(d) || d <= 1 || d >= n || BigInt(n) % BigInt(d) !== 0n;
      });
      return wrong < 0 ? yes : no(task.numbers[wrong] === 1 ? 'Ykkösellä on yksi positiivinen jakaja. Alkuluvulla on tasan kaksi.'
        : `Tarkista luvun ${task.numbers[wrong]} jakajat. Yhdistetylle luvulle tarvitaan jakaja yhden ja luvun itsensä välistä.`);
    }
    case 'factor-tree': {
      if (answer.mode !== 'factor-tree' || answer.tree?.value !== task.number || !validTree(answer.tree, task.number)) {
        return no('Jokaisen haaran tekijöiden tulon pitää olla sen emoluku. Jatka, kunnes jokainen lehti on alkuluku.');
      }
      if (!answer.tree.children) return no('Hajota juuriluku ensin kahteen tekijään.');
      const [a, b] = answer.tree.children;
      if (task.givenPair && !samePair(a.value, b.value, task.givenPair)) return no('Säilytä taulun ensimmäinen tekijäpari ja jatka sen haaroista.');
      if (task.avoidPair && samePair(a.value, b.value, task.avoidPair)) return no('Aloita tällä kertaa toisella tekijäparilla. Alkutekijät pysyvät samoina.');
      return answer.product === task.number ? yes : no('Kerro kaikki alkulukulehdet, myös toistuvat tekijät.');
    }
    case 'expansion': {
      if (answer.mode !== 'expansion') return no('Kokoa potenssin tekijät.');
      if (task.identify && (!sameBase(answer.base, task.base) || answer.exponent !== task.exponent)) {
        return no('Kanta on toistuva tekijä. Eksponentti kertoo, montako kertaa tekijä on jonossa.');
      }
      if (!Array.isArray(answer.factors) || answer.factors.length !== task.exponent || !answer.factors.every(factor => sameBase(factor, task.base))) {
        return no('Toista kantaa kerran jokaista eksponentin askelta kohti. Kanta kerrotaan itsellään.');
      }
      const value = exactPower(task.base, task.exponent)!;
      const expected: Rational = [task.outsideMinus ? -value[0] : value[0], value[1]];
      if (!equalsValue(answer.value, expected)) return no(task.view === 'signed'
        ? 'Suluissa miinus kuuluu toistuvaan kantaan. Sulkujen ulkopuolinen miinus vaikuttaa vasta kertolaskun jälkeen.'
        : 'Laske tekijäjonon tulo.');
      const against = task.compareExponent === undefined ? undefined : exactPower(task.compareBase ?? task.base, task.compareExponent);
      if (against && answer.comparison !== chooseRelation(expected, [task.compareOutsideMinus ? -against[0] : against[0], against[1]])) {
        return no('Vertaa oman tekijäjonon arvoa toisen merkinnän arvoon. Tarkista tekijöiden määrä ja mahdollinen etumerkki.');
      }
      return yes;
    }
    case 'exponent-table': {
      if (answer.mode !== 'exponent-table') return no('Täydennä asteikko.');
      const expected = exactPower(task.base, task.exponent);
      if (!expected || answer.restriction !== 'nonzero') return no('Tässä säännössä kanta ei saa olla nolla. Se jää myös nollaeksponenttisäännön ulkopuolelle.');
      if (task.exponent === 0) {
        const divisor = exactPower(task.base, task.view === 'quotient' ? 2 : 1)!;
        if (!equalsValue(answer.divisor, divisor)) return no(task.view === 'quotient'
          ? 'Muodosta saman potenssin osamäärä. Jakaja on sama nollasta poikkeava arvo kuin osoittaja.'
          : 'Kun eksponentti laskee yhdellä, jaa edellinen arvo kannalla.');
      }
      if (task.exponent < 0 && (!sameBase(answer.reciprocalBase, task.base) || answer.positiveExponent !== -task.exponent)) {
        return no('Käänteispotenssin nimittäjässä on sama kanta ja positiivinen eksponentti.');
      }
      if (!equalsValue(answer.value, expected)) return no(task.exponent === 0 ? 'Nollasta poikkeava luku jaettuna itsellään antaa yhden.'
        : 'Laske positiivisen eksponentin potenssin käänteisluku. Negatiivinen eksponentti ei määrää arvon etumerkkiä.');
      if (task.comparisonBase && !equalsValue(answer.otherValue, exactPower(task.comparisonBase, task.exponent)!)) {
        return no('Laske myös toisen kannan käänteispotenssi. Sama eksponentti voi antaa eri puolille ykköstä osuvat arvot.');
      }
      if (task.exponent < 0 && answer.comparison !== chooseRelation(expected, one)) return no('Vertaa tulosta ykköseen. Murto-osakanta voi antaa yhtä suuremman arvon.');
      return yes;
    }
    case 'rewrite': {
      if (answer.mode !== 'rewrite' || !hasValidNumericDomain(task.source)) return no('Tarkista lausekkeen määrittelyehdot.');
      const model = rewriteSolution(task);
      if (answer.actions !== requiredPowerActions(task)) return no(task.visual === 'cancel'
        ? 'Yhdistä supistuspareiksi saman kannan yksi tekijä kummaltakin riviltä.'
        : task.visual === 'repeat' ? 'Kokoa yhtä monta sisäistä ryhmää kuin ulompi eksponentti kertoo.'
          : 'Liitä saman kannan tekijäjonot yhteen.');
      if (answer.restriction !== model.restriction) return no(model.restriction === 'nonzero'
        ? 'Jakaja tai nolla- tai negatiivinen eksponentti vaatii tässä nollasta poikkeavan kannan.'
        : 'Tässä on vain positiivisia eksponentteja sekä kertolaskua. Nollakin voi olla kanta.');
      if (!Array.isArray(answer.steps) || answer.steps.length !== model.steps.length) return no('Merkitse jokainen välivaihe.');
      const wrong = model.steps.findIndex(({ rule, exponent }, i) => rule !== answer.steps[i]?.rule || exponent !== answer.steps[i]?.exponent);
      if (wrong >= 0) return no(`Tarkista vaihe ${wrong + 1}. Saman kannan tulossa eksponentit yhdistetään summana, osamäärässä erotuksena ja sisäkkäisessä potenssissa tulona. Eri kantoihin samaa summasääntöä ei voi käyttää.`);
      if (task.counterexample && task.source.kind === 'product' && task.source.left.kind === 'power' && task.source.right.kind === 'power') {
        const a = exactPower(task.source.left.base, task.source.left.exponent)!, b = exactPower(task.source.right.base, task.source.right.exponent)!;
        const proposed = exactPower(task.counterexample.base, task.counterexample.exponent)!;
        if (!equalsValue(answer.sourceValue, [a[0] * b[0], a[1] * b[1]]) || !equalsValue(answer.proposedValue, proposed)) {
          return no('Laske alkuperäinen tulo ja ehdotettu potenssi erikseen. Tässä niiden arvot eroavat.');
        }
      }
      if (model.expression.kind !== 'power') return answer.finalBase === '' && answer.finalExponent === null ? yes : no('Säilytä eri kannat erillisinä.');
      return sameBase(answer.finalBase, model.expression.base) && answer.finalExponent === model.expression.exponent
        ? yes : no('Kirjoita viimeiseksi jäljelle jäänyt kanta ja eksponentti.');
    }
  }
}

export function solutionPowerRule(task: PowerRuleTask): PowerRuleResponse {
  switch (task.mode) {
    case 'division': {
      const parts = divisionParts(task.dividend, task.divisor)!;
      return response({ mode: 'division', ...parts, divisible: parts.remainder === 0 });
    }
    case 'prime': return response({ mode: 'prime', rows: task.numbers.map(n => ({ classification: n === 1 ? 'one' : isPrime(n) ? 'prime' : 'composite',
      divisor: primeDivisor(n) ?? null, divisorCount: n === 1 ? 1 : null })) });
    case 'factor-tree': return response({ mode: 'factor-tree', tree: solutionTree(task.number, task.givenPair, task.avoidPair), product: task.number });
    case 'expansion': {
      const value = powerValue(task.base, task.exponent, task.outsideMinus)!;
      return response({ mode: 'expansion', base: task.base, exponent: task.exponent, factors: Array<string>(task.exponent).fill(task.base), value,
        comparison: task.compareExponent === undefined ? null : chooseRelation(rational(value)!,
          rational(powerValue(task.compareBase ?? task.base, task.compareExponent, task.compareOutsideMinus)!)!) });
    }
    case 'exponent-table': {
      const expected = exactPower(task.base, task.exponent)!;
      return response({ mode: 'exponent-table', value: display(expected), divisor: powerValue(task.base, task.view === 'quotient' ? 2 : 1)!, reciprocalBase: task.base,
        otherValue: task.comparisonBase ? powerValue(task.comparisonBase, task.exponent)! : '', positiveExponent: -task.exponent, restriction: 'nonzero', comparison: task.exponent < 0 ? chooseRelation(expected, one) : null });
    }
    case 'rewrite': {
      const { steps, expression, restriction } = rewriteSolution(task);
      const left = task.source.kind === 'product' && task.source.left.kind === 'power' ? exactPower(task.source.left.base, task.source.left.exponent) : undefined;
      const right = task.source.kind === 'product' && task.source.right.kind === 'power' ? exactPower(task.source.right.base, task.source.right.exponent) : undefined;
      const sourceValue = task.counterexample && left && right ? display([left[0] * right[0], left[1] * right[1]]) : '';
      const proposedValue = task.counterexample ? powerValue(task.counterexample.base, task.counterexample.exponent)! : '';
      return response({ mode: 'rewrite', steps, restriction, sourceValue, proposedValue, actions: requiredPowerActions(task), finalBase: expression.kind === 'power' ? expression.base : '',
        finalExponent: expression.kind === 'power' ? expression.exponent : null });
    }
  }
}

export function wrongPowerRuleResponses(task: PowerRuleTask): PowerRuleResponse[] {
  const answer = solutionPowerRule(task);
  switch (answer.mode) {
    case 'division': return [{ ...answer, remainder: -1 }, { ...answer, divisible: !answer.divisible }];
    case 'prime': return [{ ...answer, rows: answer.rows.map(() => ({ classification: 'prime', divisor: 1, divisorCount: null })) }];
    case 'factor-tree': return [{ ...answer, tree: { value: answer.tree.value } }, { ...answer, product: answer.product - 1 }];
    case 'expansion': return [{ ...answer, factors: answer.factors.slice(1) }, { ...answer, value: '999999' }];
    case 'exponent-table': return [{ ...answer, restriction: 'any' }, { ...answer, value: '0' }];
    case 'rewrite': return [{ ...answer, steps: [] }, { ...answer, restriction: answer.restriction === 'nonzero' ? 'any' : 'nonzero' }];
  }
}
