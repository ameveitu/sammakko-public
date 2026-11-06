// A tiny parser for the token expressions learners build: numbers (decimal comma),
// one-letter variables, + − · × : ÷ /, brackets and one "=". Implicit products such as
// 4s, 2(x + 1) and (x + 1)2 are understood. Used to accept equivalent answers.

type Tok = { t: 'num'; v: number } | { t: 'var'; v: string } | { t: 'op'; v: string };

export function tokenize(src: string): Tok[] | null {
  const out: Tok[] = [];
  const s = src.replace(/\s+/g, '');
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    const num = /^\d+(,\d+)?/.exec(s.slice(i));
    if (num) { out.push({ t: 'num', v: Number(num[0].replace(',', '.')) }); i += num[0].length; continue; }
    if (/[a-zäö]/i.test(c)) { out.push({ t: 'var', v: c.toLowerCase() }); i++; continue; }
    const op = ({ '+': '+', '−': '-', '-': '-', '·': '*', '×': '*', '*': '*', ':': '/', '÷': '/', '/': '/', '(': '(', ')': ')', '=': '=' } as Record<string, string>)[c];
    if (!op) return null;
    out.push({ t: 'op', v: op });
    i++;
  }
  // Implicit multiplication: 4s, 2(, )x, )(, s(.
  const res: Tok[] = [];
  for (const tk of out) {
    const prev = res[res.length - 1];
    const prevEnds = prev && (prev.t === 'num' || prev.t === 'var' || (prev.t === 'op' && prev.v === ')'));
    const startsFactor = tk.t === 'num' || tk.t === 'var' || (tk.t === 'op' && tk.v === '(');
    if (prevEnds && startsFactor && !(prev.t === 'num' && tk.t === 'num')) res.push({ t: 'op', v: '*' });
    res.push(tk);
  }
  return res;
}

type Env = Record<string, number>;
type Fn = (env: Env) => number;

/** Compile an expression (no "="). Returns null when it does not parse. */
export function compile(src: string | Tok[]): Fn | null {
  const maybe = typeof src === 'string' ? tokenize(src) : src;
  if (!maybe || !maybe.length) return null;
  const toks: Tok[] = maybe;
  let i = 0;
  const peek = () => toks[i];
  const isOp = (v: string) => { const p = peek(); return p?.t === 'op' && p.v === v; };
  function expr(): Fn | null {
    let left = term(); if (!left) return null;
    while (isOp('+') || isOp('-')) {
      const op = (toks[i++] as { v: string }).v; const right = term(); if (!right) return null;
      const l: Fn = left; left = op === '+' ? (e: Env) => l(e) + right(e) : (e: Env) => l(e) - right(e);
    }
    return left;
  }
  function term(): Fn | null {
    let left = unary(); if (!left) return null;
    while (isOp('*') || isOp('/')) {
      const op = (toks[i++] as { v: string }).v; const right = unary(); if (!right) return null;
      const l: Fn = left; left = op === '*' ? (e: Env) => l(e) * right(e) : (e: Env) => l(e) / right(e);
    }
    return left;
  }
  function unary(): Fn | null {
    if (isOp('-')) { i++; const f = unary(); return f ? (e) => -f(e) : null; }
    return atom();
  }
  function atom(): Fn | null {
    const p = peek();
    if (!p) return null;
    if (p.t === 'num') { i++; const v = p.v; return () => v; }
    if (p.t === 'var') { i++; const v = p.v; return (e) => e[v] ?? NaN; }
    if (isOp('(')) { i++; const f = expr(); if (!f || !isOp(')')) return null; i++; return f; }
    return null;
  }
  const f = expr();
  return f && i === toks.length ? f : null;
}

/** Split an equation at its single "=". */
export function sides(src: string): [Fn, Fn] | null {
  const toks = tokenize(src);
  if (!toks) return null;
  const at = toks.findIndex((t) => t.t === 'op' && t.v === '=');
  if (at < 0 || toks.findIndex((t, j) => j > at && t.t === 'op' && t.v === '=') >= 0) return null;
  const l = compile(toks.slice(0, at)), r = compile(toks.slice(at + 1));
  return l && r ? [l, r] : null;
}

const PROBES = [1.3, 2.7, -0.6, 4.1];
const near = (a: number, b: number) => Math.abs(a - b) <= 1e-7 * Math.max(1, Math.abs(a), Math.abs(b));
const envs = (vars: string[]) => PROBES.map((p, k) => Object.fromEntries(vars.map((v, j) => [v, p + j * 0.37 + k * 0.01])));
export const varsIn = (src: string) => [...new Set((tokenize(src) ?? []).filter((t) => t.t === 'var').map((t) => t.v as string))];

/** Same value for every probe of the variables. */
export function sameExpr(a: string, b: string): boolean {
  const fa = compile(a), fb = compile(b);
  if (!fa || !fb) return false;
  const vs = [...new Set([...varsIn(a), ...varsIn(b)])];
  return envs(vs).every((e) => near(fa(e), fb(e)));
}

/** Equivalent linear equations: L−R of one is a non-zero multiple of the other's. */
export function sameEquation(a: string, b: string): boolean {
  const A = sides(a), B = sides(b);
  if (!A || !B) return false;
  const vs = [...new Set([...varsIn(a), ...varsIn(b)])];
  const da = (e: Env) => A[0](e) - A[1](e), db = (e: Env) => B[0](e) - B[1](e);
  let k: number | undefined;
  for (const e of envs(vs)) {
    const x = da(e), y = db(e);
    if (!Number.isFinite(x) || !Number.isFinite(y)) return false;
    if (near(y, 0)) { if (!near(x, 0)) return false; continue; }
    const r = x / y;
    if (k === undefined) k = r; else if (!near(k, r)) return false;
  }
  return k !== undefined && !near(k, 0);
}

/** A true number sentence with the same numbers and operations as the target (2 + 4 = 6 ~ 4 + 2 = 6 ~ 6 = 2 + 4). */
export function sameFact(a: string, b: string): boolean {
  const A = sides(a);
  if (!A || !sides(b) || varsIn(a).length) return false;
  if (!near(A[0]({}), A[1]({}))) return false;
  const bag = (s: string) => (tokenize(s) ?? []).filter((t) => t.t !== 'op' || !/[()=]/.test(t.v)).map((t) => `${t.t}:${t.v}`).sort().join('|');
  return bag(a) === bag(b);
}
