// Learning support views for a task: the numbers of the instruction on a number line, and where it
// fits a second picture of the same thing (tens and ones, a dot array, groups, fraction parts).
// Built only from the instruction text, so it works for every lesson without lesson code. The views
// show the setting (start, jumps, parts); the asked result stays a "?".

export interface SupportView { key: string; label: string; svg: string }

const W = 320;
const num = (s: string) => Number(s.replace('−', '-').replace(',', '.'));
const fmt = (x: number) => String(Math.round(x * 1000) / 1000).replace('.', ',').replace('-', '−');
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const svg = (h: number, body: string, label: string) =>
  `<svg class="nl" viewBox="0 0 ${W} ${h}" role="img" aria-label="${esc(label)}">${body}</svg>`;

/** A round tick step that gives at most `most` steps over `span`. */
function niceStep(span: number, most = 12) {
  for (const s of [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 5000]) if (span / s <= most) return s;
  return 10000;
}

interface Mark { at: number; text: string; strong?: boolean }
interface Jump { from: number; to: number; text: string }
/** A number line from lo to hi with marks and jump arcs above it. */
function line(lo: number, hi: number, marks: Mark[], jumps: Jump[], label: string) {
  // Labels at most every eighth of the line, so decimals like 0,25 do not run together.
  const step = niceStep(hi - lo, 8), L = 18, R = W - 18, y = jumps.length ? 58 : 34;
  const x = (v: number) => L + ((v - lo) / (hi - lo)) * (R - L);
  let b = `<line x1="${L - 6}" y1="${y}" x2="${R + 6}" y2="${y}" class="nl-axis"/>`;
  const minor = step / (step >= 1 && step <= 10 && hi - lo <= 20 ? step : 1);
  for (let v = Math.ceil(lo / minor) * minor; v <= hi + 1e-9; v += minor) b += `<line x1="${x(v)}" y1="${y - 4}" x2="${x(v)}" y2="${y + 4}" class="nl-tick"/>`;
  for (let v = Math.ceil(lo / step - 1e-9) * step; v <= hi + 1e-9; v += step) {
    b += `<line x1="${x(v)}" y1="${y - 7}" x2="${x(v)}" y2="${y + 7}" class="nl-tick"/>`;
    if (!marks.some((m) => Math.abs(x(m.at) - x(v)) < 16)) b += `<text x="${x(v)}" y="${y + 22}" class="nl-num">${fmt(v)}</text>`;
  }
  jumps.forEach((j, i) => {
    const a = x(j.from), c = x(j.to), top = y - 14 - Math.min(26, Math.abs(c - a) / 3);
    b += `<path d="M${a} ${y - 3} Q${(a + c) / 2} ${top} ${c} ${y - 3}" class="nl-jump"/>`;
    if (jumps.length <= 8 || i === 0) b += `<text x="${(a + c) / 2}" y="${(y - 3 + top) / 2 - 4}" class="nl-jt">${esc(j.text)}</text>`;
  });
  for (const m of marks) b += `<circle cx="${x(m.at)}" cy="${y}" r="5" class="${m.strong ? 'nl-dot q' : 'nl-dot'}"/><text x="${x(m.at)}" y="${y + 22}" class="nl-num b">${esc(m.text)}</text>`;
  return svg(y + 30, b, label);
}

/** A window [lo, hi] around the values, on round numbers, starting at 0 when 0 is near. */
function span(vals: number[]) {
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (lo >= 0 && lo <= (hi - lo) * 1.5) lo = 0;
  const step = niceStep(Math.max(hi - lo, 1e-9) * 1.1);
  lo = Math.floor(lo / step) * step; hi = Math.ceil(hi / step) * step;
  if (hi === lo) hi = lo + step;
  return [lo, hi] as const;
}

function tensOnes(a: number, b: number, op: string) {
  // Tens as rods, ones as dots; the second number in the operation's colour.
  const draw = (n: number, x0: number, cls: string) => {
    let s = '', x = x0;
    for (let t = 0; t < Math.floor(n / 10); t++, x += 9) s += `<rect x="${x}" y="8" width="6" height="50" rx="2" class="${cls}"/>`;
    for (let o = 0; o < n % 10; o++) s += `<circle cx="${x + 5 + (o % 2) * 9}" cy="${13 + Math.floor(o / 2) * 10}" r="4" class="${cls}"/>`;
    return { s, end: x + (n % 10 ? 22 : 0) };
  };
  const A = draw(a, 10, 'nl-a');
  const B = draw(b, A.end + 30, 'nl-b');
  const s = A.s + `<text x="${A.end + 12}" y="38" class="nl-op">${op === '+' ? '+' : '−'}</text>` + B.s;
  return svg(66, s, `Kymmenet ja ykköset: ${a} ${op} ${b}`);
}

function array(rows: number, cols: number) {
  const r = Math.min(13, 56 / rows), s0 = 2 * r + 2;
  let s = '';
  for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) s += `<circle cx="${12 + j * s0 + r}" cy="${6 + i * s0 + r}" r="${r * 0.8}" class="nl-a"/>`;
  return svg(rows * s0 + 12, s, `${rows} riviä, jokaisessa ${cols}`);
}

function groups(total: number, size: number) {
  let s = '', x = 10;
  for (let g = 0; g * size < total; g++) {
    const n = Math.min(size, total - g * size), w = Math.ceil(n / 2) * 9 + 6;
    s += `<rect x="${x - 4}" y="4" width="${w}" height="26" rx="6" class="nl-group"/>`;
    for (let i = 0; i < n; i++) s += `<circle cx="${x + 2 + Math.floor(i / 2) * 9}" cy="${12 + (i % 2) * 10}" r="3.6" class="nl-a"/>`;
    x += w + 6;
  }
  return x > W ? null : svg(36, s, `${total} jaettuna ryhmiin, joissa on ${size}`);
}

/** One bar per fraction, all on the same whole, so they can be compared. */
function bars(fs: [number, number][]) {
  const whole = Math.max(1, ...fs.map(([n, d]) => Math.ceil(n / d))), w = (W - 60) / whole;
  let s = '';
  fs.forEach(([n, d], r) => {
    const y = 6 + r * 34, part = w / d;
    s += `<text x="24" y="${y + 18}" class="nl-num b">${n}/${d}</text>`;
    for (let k = 0; k < whole * d; k++) s += `<rect x="${50 + k * part}" y="${y}" width="${part}" height="26" class="${k < n ? 'nl-fill' : 'nl-empty'}"/>`;
    for (let k = 0; k <= whole; k++) s += `<line x1="${50 + k * w}" y1="${y - 3}" x2="${50 + k * w}" y2="${y + 29}" class="nl-whole"/>`;
  });
  return svg(fs.length * 34 + 8, s, fs.map(([n, d]) => `${n}/${d}: ${n === 1 ? '1 osa' : `${n} osaa`}, kun kokonainen on ${d} osaa`).join('. '));
}

const NUM = String.raw`[−-]?\d+(?:,\d+)?`;
/** a op b, where b may be in brackets: "4 − (−4)". Not inside a fraction or a longer number. */
const EXPR = new RegExp(`(?<![\\d,/])(${NUM})\\s*([+−×·:÷])\\s*(\\(${NUM}\\)|${NUM})(?![\\d,]|\\s*\\/)`);
const UNKNOWN = String.raw`(?:□|\?|\b[xnya]\b)`;
/** "x + 6 = 11", "□ + 6 = 17", "7 + □ = 12": how far from one number to the other. */
const MISSING = new RegExp(`(?:${UNKNOWN}\\s*\\+\\s*(${NUM})|(${NUM})\\s*\\+\\s*${UNKNOWN})\\s*=\\s*(${NUM})(?![\\d,])`);
/** Words that make plain numbers a question about their places: compare, order, distance, round. */
const PLACES = /kumpi|\bvai\b|kaukana|välissä|järjest|suurempi|pienempi|pyöristä|lähempänä|lähin/i;

/** Support views for an instruction, or [] when its numbers give nothing to draw. */
export function supportViews(text: string): SupportView[] {
  const t = text.replace(/<[^>]+>/g, ' ').replace(/(\d)[\u00a0\u202f ](?=\d{3}\b)/g, '$1');
  const out: SupportView[] = [];
  const m = t.match(MISSING);
  if (m) {
    const a = num(m[1] ?? m[2]!), b = num(m[3]!);
    if (b > a && b - a <= 1000) {
      const [lo, hi] = span([a, b]);
      out.push({ key: 'line', label: '📏 Lukusuora', svg: line(lo, hi, [{ at: a, text: fmt(a) }, { at: b, text: fmt(b), strong: true }], [{ from: a, to: b, text: '+ ?' }], `Montako lukua ${fmt(a)}:sta lukuun ${fmt(b)}?`) });
    }
    return out;
  }
  const e = t.match(EXPR);
  if (e) {
    // "12:30" is a clock time; "7 + 3 × 5" and "6 + 0,3 + ?" are chains, and one jump would mislead.
    const after = t.slice(e.index! + e[0].length), before = t.slice(0, e.index);
    if ((e[2] === ':' && /\d:\d/.test(e[0])) || /^\s*[+−×·:÷]/.test(after) || /[+−×·:÷]\s*$/.test(before)) return out;
    const a = num(e[1]!), op = e[2]!, b = num(e[3]!.replace(/[()]/g, ''));
    if (op === '+' || op === '−') {
      const r = op === '+' ? a + b : a - b;
      if (Math.abs(a) <= 10000 && Math.abs(r) <= 10000) {
        const [lo, hi] = span([a, r]);
        const sign = op === '+' ? 1 : -1, o = op === '+' ? '+' : '−';
        // Whole tens first, then the ones (43 + 21: 43 → 53 → 63 → 64), as in mental arithmetic.
        const tens = Number.isInteger(a) && Number.isInteger(b) && b >= 10 && b < 100 ? Math.floor(b / 10) : 0;
        const steps = [...Array<number>(tens).fill(10), ...(tens && b % 10 ? [b % 10] : []), ...(tens ? [] : [b])];
        let at = a;
        const jumps = steps.map((d) => ({ from: at, to: (at += sign * d), text: `${o}${d < 0 ? `(${fmt(d)})` : fmt(d)}` }));
        out.push({ key: 'line', label: '📏 Lukusuora', svg: line(lo, hi, [{ at: a, text: fmt(a) }, { at: r, text: '?', strong: true }], jumps, `Lukusuora: ${fmt(a)} ${op} ${e[3]}`) });
        if (Number.isInteger(a) && Number.isInteger(b) && a > 0 && b > 0 && a <= 99 && b <= 99 && a / 10 + b / 10 < 14) out.push({ key: 'blocks', label: '🧱 Kymmenet', svg: tensOnes(a, b, op) });
      }
    } else if (op === '×' || op === '·') {
      const [k, s] = Number.isInteger(a) && a <= 12 ? [a, b] : [b, a];
      if (Number.isInteger(k) && k >= 1 && k <= 12 && s > 0 && k * s <= 1000) {
        const [lo, hi] = span([0, k * s]);
        const jumps = Array.from({ length: k }, (_, i) => ({ from: i * s, to: (i + 1) * s, text: `+${fmt(s)}` }));
        out.push({ key: 'line', label: '📏 Lukusuora', svg: line(lo, hi, [{ at: 0, text: '0' }, { at: k * s, text: '?', strong: true }], jumps, `${k} hyppyä, jokainen ${fmt(s)}`) });
        if (Number.isInteger(s) && s <= 10 && k <= 10) out.push({ key: 'array', label: '🔲 Ruudukko', svg: array(k, s) });
      }
    } else if (b > 0 && a > 0) {
      const q = a / b;
      if (Math.abs(q - Math.round(q)) < 1e-9 && q >= 1 && q <= 16) {
        const [lo, hi] = span([0, a]);
        const jumps = Array.from({ length: Math.round(q) }, (_, i) => ({ from: i * b, to: (i + 1) * b, text: `${fmt(b)}` }));
        out.push({ key: 'line', label: '📏 Lukusuora', svg: line(lo, hi, [{ at: 0, text: '0' }, { at: a, text: fmt(a), strong: true }], jumps, `Montako ${fmt(b)}:n hyppyä mahtuu lukuun ${fmt(a)}?`) });
        const g = Number.isInteger(a) && Number.isInteger(b) && a <= 60 ? groups(a, b) : null;
        if (g) out.push({ key: 'groups', label: '🫘 Ryhmät', svg: g });
      }
    }
    return out;
  }
  const fs = [...t.matchAll(/(?<![\d,])(\d{1,2})\s*\/\s*(\d{1,2})(?![\d,])/g)].map((f) => [+f[1]!, +f[2]!] as [number, number])
    .filter(([n, d]) => d >= 2 && d <= 12 && n <= 2 * d).slice(0, 3);
  if (fs.length) {
    const uniq = fs.filter(([n, d], i) => fs.findIndex(([n2, d2]) => n2 === n && d2 === d) === i);
    out.push({ key: 'parts', label: '🧩 Osat', svg: bars(uniq) });
    const hi = Math.max(1, ...uniq.map(([n, d]) => Math.ceil(n / d)));
    out.push({ key: 'line', label: '📏 Lukusuora', svg: line(0, hi, uniq.map(([n, d]) => ({ at: n / d, text: `${n}/${d}`, strong: true })), [], `${uniq.map(([n, d]) => `${n}/${d}`).join(' ja ')} lukusuoralla`) });
    return out;
  }
  // Plain numbers: on the line when the question is about their places, or a single decimal to read.
  const ns = [...new Set([...t.matchAll(new RegExp(`(?<![\\d,/:.\\p{L}])${NUM}(?![\\d/:]|,\\d|\\.\\d|\\p{L})`, 'gu'))].map((x) => x[0]))].map((s) => ({ s, v: num(s) }));
  const plain = t.length <= 120 && !/ei vastaa|väärin|virhe|korjaa/i.test(t);
  const ok = plain && (ns.length >= 2 && ns.length <= 5 && PLACES.test(t) || ns.length === 1 && /,/.test(ns[0]!.s));
  if (ok && ns.every((n) => Math.abs(n.v) <= 10000)) {
    const [lo, hi] = span(ns.map((n) => n.v));
    out.push({ key: 'line', label: '📏 Lukusuora', svg: line(lo, hi, ns.map((n) => ({ at: n.v, text: n.s })), [], `Luvut lukusuoralla: ${ns.map((n) => n.s).join(', ')}`) });
  }
  return out;
}
