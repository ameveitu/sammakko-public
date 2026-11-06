export interface ArithmeticContext { title: string; skills: readonly string[] }
export type Operation = '+' | '−' | '×';
export type Finding = 'below' | 'fits' | 'above';
export type SequenceRule = { operation: '+' | '−' | '×'; operand: number };
export type Mark = { row: number; column: number };
export type Membership = { relation: 'multiple' | 'divisor'; of: number };
export type Trace =
  | { method: 'partition'; first: number; second: number; intermediate: number }
  | { method: 'adjust'; anchor: number; correction: number; intermediate: number }
  | { method: 'columns'; digits: number[]; exchanges: number[] };

export type ArithmeticMode =
  | { mode: 'split'; rows: number; columns: number; axis: 'rows' | 'columns'; avoidCut?: number }
  | { mode: 'group'; a: number; b: number; c: number; draft?: 'left' | 'right' }
  | { mode: 'rotate'; rows: number; columns: number; focus: Mark; clockwise: boolean; abstract?: boolean; inverse?: boolean }
  | { mode: 'relation'; divisor: number; multiple: number; view: 'array' | 'rebuild' | 'symbol' }
  | { mode: 'membership'; numbers: readonly number[]; rules: readonly Membership[] }
  | { mode: 'round'; value: number; unit: number; view: 'line' | 'place' | 'symbol' }
  | { mode: 'estimate'; a: number; b: number; operation: Operation; units: readonly number[] }
  | { mode: 'audit'; a: readonly [number, number]; b: readonly [number, number]; operation: Operation; proposed: number }
  | { mode: 'strategy'; a: number; b: number; operation: '+' | '−' }
  | { mode: 'sequence'; shown: readonly number[]; rules: readonly SequenceRule[]; recognize: boolean; count: number }
  | { mode: 'hunt'; a: number; b: number; target: number; min: number; max: number; start: number };

export type ArithmeticReasoningTask = ArithmeticMode & {
  kind: 'arithmetic-reasoning';
  context: ArithmeticContext;
  givens: readonly { label: string; value: string }[];
};

type Work =
  | { mode: 'split'; cut: number; first: number; second: number; total: number }
  | { mode: 'group'; seen: number[]; leftInner: number; rightInner: number; leftTotal: number; rightTotal: number }
  | { mode: 'rotate'; turned: boolean; before: Mark; after: Mark; landed: Mark }
  | { mode: 'relation'; divisor: number; multiple: number; groups: number }
  | { mode: 'membership'; memberships: number[][] }
  | { mode: 'round'; lower: number; upper: number; rounded: number }
  | { mode: 'estimate'; unit: number; first: number; second: number; estimate: number; symbol: '=' | '≈' | null }
  | { mode: 'audit'; lower: number; upper: number; finding: Finding | null }
  | { mode: 'strategy'; trace: Trace | null; total: number }
  | { mode: 'sequence'; rule: number; extension: number[] }
  | { mode: 'hunt'; trials: { input: number; finding: Finding }[]; solution: number; substitution: number };
export type ArithmeticReasoningResponse = Work & { kind: 'arithmetic-reasoning' };

const yes = { ok: true };
const no = (why: string) => ({ ok: false, why });
const response = <T extends Work>(value: T): T & { kind: 'arithmetic-reasoning' } => ({ kind: 'arithmetic-reasoning', ...value });

export const operate = (a: number, op: Operation, b: number) => op === '+' ? a + b : op === '−' ? a - b : a * b;
export const compare = (n: number, low: number, high = low): Finding => n < low ? 'below' : n > high ? 'above' : 'fits';
export const ruleLabel = (rule: SequenceRule) => rule.operation === '+' ? `Lisää aina ${rule.operand}`
  : rule.operation === '−' ? `Vähennä aina ${rule.operand}` : `Kerro aina luvulla ${rule.operand}`;

export function rotatedMark(rows: number, columns: number, focus: Mark, clockwise: boolean): Mark {
  return clockwise ? { row: focus.column, column: rows + 1 - focus.row } : { row: columns + 1 - focus.column, column: focus.row };
}

export function rounding(value: number, unit: number) {
  const low = value - value % unit, high = low + unit;
  return { low, high, rounded: value - low < high - value ? low : high };
}

export function boundOperation(a: readonly [number, number], op: Operation, b: readonly [number, number]) {
  const corners = a.flatMap(x => b.map(y => operate(x, op, y)));
  return { low: Math.min(...corners), high: Math.max(...corners) };
}

function belongs(n: number, rule: Membership): boolean {
  return rule.relation === 'multiple' ? rule.of > 0 && n % rule.of === 0 : n > 0 && rule.of % n === 0;
}

const next = (n: number, rule: SequenceRule) => operate(n, rule.operation, rule.operand);
function fitsPrefix(rule: SequenceRule, shown: readonly number[]) {
  return shown.slice(1).every((n, i) => next(shown[i]!, rule) === n);
}
function extend(rule: SequenceRule, last: number, count: number): number[] {
  return Array.from({ length: count }, () => (last = next(last, rule)));
}

export const columnCount = (a: number, b: number) => String(Math.max(a, b)).length;
function columnWork(a: number, b: number, operation: '+' | '−') {
  let exchange = 0;
  const digits: number[] = [], exchanges: number[] = [];
  for (let i = 0; i < columnCount(a, b); i++) {
    const unit = 10 ** i;
    const left = Math.floor(a / unit) % 10, right = Math.floor(b / unit) % 10;
    const total = operation === '+' ? left + right + exchange : left - right - exchange;
    exchange = Number(operation === '+' ? total >= 10 : total < 0);
    digits.push((total + 10) % 10);
    exchanges.push(exchange);
  }
  return { digits, exchanges };
}

function validStrategy(task: Extract<ArithmeticMode, { mode: 'strategy' }>, trace: Trace | null) {
  if (!trace) return false;
  const { a, b, operation } = task;
  switch (trace.method) {
    case 'partition':
      return Number.isSafeInteger(trace.first) && trace.first > 0 && trace.second > 0 && trace.first + trace.second === b
        && trace.intermediate === operate(a, operation, trace.first);
    case 'adjust':
      return Number.isSafeInteger(trace.anchor) && trace.anchor > 0 && trace.anchor % 10 === 0 && Math.abs(trace.correction) <= 9
        && trace.anchor + trace.correction === b && trace.intermediate === operate(a, operation, trace.anchor);
    case 'columns': {
      const expected = columnWork(a, b, operation);
      return expected.digits.length === trace.digits?.length && expected.exchanges.length === trace.exchanges?.length
        && expected.digits.every((digit, i) => digit === trace.digits[i] && expected.exchanges[i] === trace.exchanges[i]);
    }
  }
}

export const substituted = (task: Extract<ArithmeticMode, { mode: 'hunt' }>, value: number) => task.a * value + task.b;
export function huntBounds(min: number, max: number, input: number, finding: Finding): readonly [number, number] {
  return finding === 'below' ? [input + 1, max] : finding === 'above' ? [min, input - 1] : [input, input];
}

export function checkArithmeticReasoning(task: ArithmeticReasoningTask, answer: ArithmeticReasoningResponse): { ok: boolean; why?: string } {
  if (task.mode !== answer.mode) return no('Täydennä tämän tehtävän merkinnät.');
  switch (task.mode) {
    case 'split': {
      if (answer.mode !== 'split') return no('Merkitse ositus.');
      const length = task.axis === 'rows' ? task.rows : task.columns;
      const other = task.axis === 'rows' ? task.columns : task.rows;
      if (!Number.isSafeInteger(answer.cut) || answer.cut < 1 || answer.cut >= length || answer.cut === task.avoidCut) {
        return no('Jaa ruudukko kahteen epätyhjään osaan. Siirrossa valitse esimerkistä poikkeava jakokohta.');
      }
      return answer.first === other * answer.cut && answer.second === other * (length - answer.cut) && answer.total === task.rows * task.columns
        ? yes : no('Laske kummankin lohkon paikat omana kertolaskunaan. Lopuksi laske osat yhteen.');
    }
    case 'group':
      return answer.mode === 'group' && Array.isArray(answer.seen) && answer.seen.includes(0) && answer.seen.includes(1) && answer.leftInner === task.a * task.b &&
        answer.rightInner === task.b * task.c && answer.leftTotal === task.a * task.b * task.c && answer.rightTotal === answer.leftTotal
        ? yes : no('Avaa molemmat ryhmittelyt. Laske ensin sulkujen tulo ja sitten kaikki kolme tekijää.');
    case 'rotate': {
      if (answer.mode !== 'rotate' || !answer.turned || answer.before?.row !== task.rows || answer.before?.column !== task.columns ||
          answer.after?.row !== task.columns || answer.after?.column !== task.rows) return no('Käännä ruudukko ja vaihda rivien sekä sarakkeiden roolit.');
      const place = task.inverse ? task.focus : rotatedMark(task.rows, task.columns, task.focus, task.clockwise);
      return answer.landed?.row === place.row && answer.landed?.column === place.column ? yes : no('Seuraa merkittyä paikkaa. Se vaihtaa sijaintia, mutta pysyy samana istuimena.');
    }
    case 'relation':
      return answer.mode === 'relation' && task.divisor > 0 && answer.divisor === task.divisor && answer.multiple === task.multiple &&
        Number.isSafeInteger(answer.groups) && answer.groups * task.divisor === task.multiple
        ? yes : no('Kerro ryhmäkoko täysien ryhmien määrällä. Ryhmäkoko on jakaja ja tulos on sen monikerta.');
    case 'membership':
      if (answer.mode !== 'membership' || !Array.isArray(answer.memberships) || answer.memberships.length !== task.numbers.length) {
        return no('Luokittele jokainen luku.');
      }
      return task.numbers.every((n, i) => {
        const selected = answer.memberships[i];
        const matches = task.rules.flatMap((rule, j) => belongs(n, rule) ? [j] : []);
        const expected = matches.length ? matches : [-1];
        return Array.isArray(selected) && selected.length === expected.length && expected.every(j => selected.includes(j));
      }) ? yes : no('Tarkista kumpikin ryhmä erikseen. Sama luku voi kuulua molempiin. Nolla on positiivisen luvun monikerta, ja jakaja on tässä aina positiivinen.');
    case 'round': {
      const { low, high, rounded } = rounding(task.value, task.unit);
      if (answer.mode !== 'round' || answer.lower !== low || answer.upper !== high) return no('Etsi pyydetyn lukuyksikön peräkkäiset kerrannaiset luvun ympäriltä.');
      return answer.rounded === rounded ? yes : no('Valitse lähempi rajaluku. Jos etäisyydet ovat samat, valitse suurempi.');
    }
    case 'estimate': {
      if (answer.mode !== 'estimate' || !task.units.includes(answer.unit)) return no('Valitse tehtävän sallima likiarvon tarkkuus.');
      const a = rounding(task.a, answer.unit).rounded, b = rounding(task.b, answer.unit).rounded;
      if (answer.first !== a || answer.second !== b) return no('Pyöristä molemmat lähtöluvut valitsemaasi lukuyksikköön.');
      return answer.estimate === operate(a, task.operation, b) && answer.symbol === '≈' ? yes
        : no('Laske pyöristetyillä luvuilla ja käytä alkuperäiseen laskuun verratessa likiarvomerkkiä ≈.');
    }
    case 'audit': {
      const { low, high } = boundOperation(task.a, task.operation, task.b);
      if (answer.mode !== 'audit' || answer.lower !== low || answer.upper !== high) return no('Muodosta alkuperäisten lukujen väljistä rajoista tuloksen ala- ja yläraja.');
      return answer.finding === compare(task.proposed, low, high) ? yes : no('Vertaa ehdotusta kumpaankin rajaan. Alueen sisällä oleva luku on mahdollinen arvio, mutta tarkka vastaus vaatii laskun.');
    }
    case 'strategy':
      return answer.mode === 'strategy' && validStrategy(task, answer.trace) && answer.total === operate(task.a, task.operation, task.b)
        ? yes : no('Tarkista valitsemasi tavan työjälki ja lopputulos. Vaihtoehtoiset toimivat menetelmät käyvät.');
    case 'sequence': {
      if (answer.mode !== 'sequence') return no('Täydennä jono.');
      const rule = task.rules[answer.rule];
      if (!rule || !fitsPrefix(rule, task.shown)) return no('Kokeile sääntöä jokaiseen näkyvään siirtymään. Yksi sopiva askel ei vielä riitä.');
      const expected = extend(rule, task.shown.at(-1)!, task.count);
      return Array.isArray(answer.extension) && answer.extension.length === expected.length && expected.every((n, i) => answer.extension[i] === n)
        ? yes : no('Jatka aina edellisestä luvusta. Tarkista jokainen pyydetty uusi askel.');
    }
    case 'hunt': {
      if (answer.mode !== 'hunt' || !Array.isArray(answer.trials) || answer.trials.length < 2 || answer.trials[0]?.input !== task.start) {
        return no('Tee ensin annettu aloituskoe ja käytä sen tulosta seuraavan kokeen rajaamiseen.');
      }
      let low = task.min, high = task.max;
      for (const [i, trial] of answer.trials.entries()) {
        if (!trial || !Number.isSafeInteger(trial.input) || trial.input < low || trial.input > high ||
            trial.finding !== compare(substituted(task, trial.input), task.target) || (trial.finding === 'fits' && i !== answer.trials.length - 1)) {
          return no('Tulkitse jokainen koetulos. Liian pieni tulos nostaa alarajaa ja liian suuri laskee ylärajaa. Älä toista hylättyä arvoa.');
        }
        [low, high] = huntBounds(low, high, trial.input, trial.finding);
      }
      const last = answer.trials.at(-1)!;
      return last.finding === 'fits' && answer.solution === last.input && answer.substitution === substituted(task, answer.solution)
        ? yes : no('Tee sopiva koesijoitus ja tarkista se vielä kirjoittamalla ratkaisu sekä vasemman puolen arvo.');
    }
  }
}

export function solutionArithmeticReasoning(task: ArithmeticReasoningTask): ArithmeticReasoningResponse {
  switch (task.mode) {
    case 'split': {
      const length = task.axis === 'rows' ? task.rows : task.columns, other = task.axis === 'rows' ? task.columns : task.rows;
      const cut = task.avoidCut === 1 ? 2 : 1;
      return response({ mode: 'split', cut, first: other * cut, second: other * (length - cut), total: task.rows * task.columns });
    }
    case 'group': return response({ mode: 'group', seen: [0, 1], leftInner: task.a * task.b, rightInner: task.b * task.c,
      leftTotal: task.a * task.b * task.c, rightTotal: task.a * task.b * task.c });
    case 'rotate': return response({ mode: 'rotate', turned: true, before: { row: task.rows, column: task.columns },
      after: { row: task.columns, column: task.rows }, landed: task.inverse ? task.focus : rotatedMark(task.rows, task.columns, task.focus, task.clockwise) });
    case 'relation': return response({ mode: 'relation', divisor: task.divisor, multiple: task.multiple, groups: task.multiple / task.divisor });
    case 'membership': return response({ mode: 'membership', memberships: task.numbers.map(n => {
      const matches = task.rules.flatMap((rule, i) => belongs(n, rule) ? [i] : []);
      return matches.length ? matches : [-1];
    }) });
    case 'round': {
      const { low, high, rounded } = rounding(task.value, task.unit);
      return response({ mode: 'round', lower: low, upper: high, rounded });
    }
    case 'estimate': {
      const unit = task.units[0]!, first = rounding(task.a, unit).rounded, second = rounding(task.b, unit).rounded;
      return response({ mode: 'estimate', unit, first, second, estimate: operate(first, task.operation, second), symbol: '≈' });
    }
    case 'audit': {
      const { low, high } = boundOperation(task.a, task.operation, task.b);
      return response({ mode: 'audit', lower: low, upper: high, finding: compare(task.proposed, low, high) });
    }
    case 'strategy': return response({ mode: 'strategy', trace: { method: 'columns', ...columnWork(task.a, task.b, task.operation) },
      total: operate(task.a, task.operation, task.b) });
    case 'sequence': {
      const rule = task.rules.findIndex(rule => fitsPrefix(rule, task.shown));
      return response({ mode: 'sequence', rule, extension: extend(task.rules[rule]!, task.shown.at(-1)!, task.count) });
    }
    case 'hunt': {
      const solution = (task.target - task.b) / task.a;
      return response({ mode: 'hunt', trials: [{ input: task.start, finding: compare(substituted(task, task.start), task.target) },
        { input: solution, finding: 'fits' }], solution, substitution: task.target });
    }
  }
}

export function wrongArithmeticReasoningResponses(task: ArithmeticReasoningTask): ArithmeticReasoningResponse[] {
  const answer = solutionArithmeticReasoning(task);
  switch (answer.mode) {
    case 'split': return [{ ...answer, cut: 0 }, { ...answer, second: 0 }];
    case 'group': return [{ ...answer, seen: [0] }, { ...answer, rightInner: 0 }];
    case 'rotate': return [{ ...answer, turned: false }, { ...answer, landed: { row: 0, column: 0 } }];
    case 'relation': return [{ ...answer, groups: -1 }, { ...answer, divisor: 0 }];
    case 'membership': return [{ ...answer, memberships: [] }];
    case 'round': return [{ ...answer, rounded: -1 }, { ...answer, upper: answer.lower }];
    case 'estimate': return [{ ...answer, symbol: '=' }, { ...answer, first: -1 }];
    case 'audit': return [{ ...answer, lower: -1 }, { ...answer, finding: null }];
    case 'strategy': return [{ ...answer, trace: null }, { ...answer, total: -1 }];
    case 'sequence': return [{ ...answer, rule: -1 }, { ...answer, extension: answer.extension.slice(1) }];
    case 'hunt': return [{ ...answer, trials: answer.trials.slice(1) }, { ...answer, substitution: -1 }];
  }
}
