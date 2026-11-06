// Speech inventory from Lite's TypeScript sources (AST, via Lite's own typescript package).
// Counts are source occurrences, not deduplicated lines or coverage.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { normText } from './text.mjs';

const FIELDS = ['intro', 'say', 'explain', 'story', 'tale', 'finale', 'quest', 'reward', 'hint'];
const SPEAKERS = new Set(['Aava', 'Loikka', 'Sulka']);

export function loadTs(repo) {
  const req = createRequire(path.join(repo, 'lite', 'package.json'));
  return req('typescript');
}

const lit = (ts, n) => n && (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) ? n.text : null;
/** Literal strings an argument can be: 'a' or cond ? 'a' : 'b'. */
const lits = (ts, n) => {
  if (!n) return [];
  if (ts.isParenthesizedExpression(n)) return lits(ts, n.expression);
  if (ts.isConditionalExpression(n)) { const a = lits(ts, n.whenTrue), b = lits(ts, n.whenFalse); return a.length && b.length ? [...a, ...b] : []; }
  const t = lit(ts, n); return t === null ? [] : [t];
};
const propName = (ts, p) => p.name && (ts.isIdentifier(p.name) || ts.isStringLiteral(p.name)) ? p.name.text : null;

/** Field counts over lite/src/content and fixed spoken lines over content + ui. */
export function inventory(repo) {
  const ts = loadTs(repo);
  const counts = {};
  const lines = new Map(); // key speaker|text → entry
  const addLine = (speaker, text, ref, kind) => {
    const t = normText(text); if (!t) return;
    const k = `${speaker}|${t}`;
    const e = lines.get(k) ?? { speaker, displayText: t, kind, refs: [] };
    if (!e.refs.includes(ref)) e.refs.push(ref);
    lines.set(k, e);
  };
  const files = [
    ...fs.readdirSync(path.join(repo, 'lite/src/content')).filter((f) => f.endsWith('.ts')).map((f) => `lite/src/content/${f}`),
    ...['lite/src/main.ts', ...fs.readdirSync(path.join(repo, 'lite/src/ui')).filter((f) => f.endsWith('.ts')).map((f) => `lite/src/ui/${f}`)],
  ];
  for (const rel of files) {
    const src = ts.createSourceFile(rel, fs.readFileSync(path.join(repo, rel), 'utf8'), ts.ScriptTarget.Latest, true);
    const content = rel.includes('/content/');
    const at = (n) => `${rel}:${src.getLineAndCharacterOfPosition(n.getStart()).line + 1}`;
    const visit = (n) => {
      if (content && ts.isPropertyAssignment(n)) {
        const name = propName(ts, n);
        if (name && FIELDS.includes(name)) {
          const c = (counts[name] ??= { literal: 0, literalChars: 0, computed: 0 });
          const t = lit(ts, n.initializer);
          if (t !== null) { c.literal++; c.literalChars += t.length; } else c.computed++;
          if (t !== null && ['tale', 'finale'].includes(name)) addLine('narrator', t, at(n), `world.${name}`);
        }
      }
      // World chapters: "<name>. <story>" is what the map reads.
      if (content && ts.isObjectLiteralExpression(n)) {
        const get = (k) => { const p = n.properties.find((q) => ts.isPropertyAssignment(q) && propName(ts, q) === k); return p ? lit(ts, p.initializer) : null; };
        const nm = get('name'), story = get('story');
        if (nm && story) addLine('narrator', `${nm}. ${story}`, at(n), 'world.chapter');
        // Lesson places: the map reads "<stop>. <intro>" (phase C material, not in the v1 core).
        const stop = get('stop'), intro = get('intro');
        if (stop && intro) addLine('narrator', `${stop}. ${intro}`, at(n), 'content.intro');
      }
      if (!content) {
        // say('…'), say("…", …), sayAs('Aava', '…'), talk('Aava', '…')
        if (ts.isCallExpression(n) && ts.isIdentifier(n.expression)) {
          const fn = n.expression.text, a = n.arguments;
          if (fn === 'say') for (const t of lits(ts, a[0])) addLine('narrator', t, at(n), 'ui.say');
          if ((fn === 'talk' || fn === 'sayAs') && SPEAKERS.has(lit(ts, a[0])) && lit(ts, a[1]) !== null) addLine(lit(ts, a[0]), lit(ts, a[1]), at(n), `ui.${fn}`);
        }
        // Scripted steps: ['Aava', art, 'text']
        if (ts.isArrayLiteralExpression(n) && n.elements.length === 3 && SPEAKERS.has(lit(ts, n.elements[0])) && lit(ts, n.elements[2]) !== null) addLine(lit(ts, n.elements[0]), lit(ts, n.elements[2]), at(n), 'ui.script');
        // const PRAISE = ['Oikein!', …]
        if (ts.isVariableDeclaration(n) && ts.isIdentifier(n.name) && n.name.text === 'PRAISE' && n.initializer && ts.isArrayLiteralExpression(n.initializer))
          for (const e of n.initializer.elements) if (lit(ts, e) !== null) addLine('narrator', lit(ts, e), at(e), 'ui.praise');
      }
      ts.forEachChild(n, visit);
    };
    visit(src);
  }
  return { counts, lines: [...lines.values()].sort((a, b) => a.kind.localeCompare(b.kind) || a.displayText.localeCompare(b.displayText, 'fi')) };
}

/** Text that needs a reviewed spoken form before it may be produced (numbers, maths, units). */
export const needsSpokenReview = (t) => /[0-9□×·÷/=+−<>%€°^²³]|(?<!\p{L})-(?=\d)/u.test(t);
