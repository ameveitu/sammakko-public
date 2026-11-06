// @ts-nocheck: node-only developer tool
// Developer tool, skipped in normal runs: print a lesson as text for the per-node audit.
// DUMP_ID=M-TIME-03 npx vitest run tests/zz-lesson-dump.test.ts   (writes audit/dump/<id>.md)
import { it } from 'vitest';
import { mkdirSync, writeFileSync } from 'node:fs';
import { NODES } from '../src/content';
import { allOf, kc } from '../src/engine/graph';
import { rng } from '../src/engine/rng';
import type { Item, Option, Paint, Task } from '../src/engine/types';
import { ANIM } from '../src/ui/anim';
import { MOTION_CFG } from '../src/ui/motion';

const opt = (o: Option) => [o.big, o.text, o.speak && o.speak !== o.text && o.speak !== o.big ? `🔊${o.speak}` : '', o.art ? '[kuva]' : ''].filter(Boolean).join(' ');
const kind = (p?: Paint) => !p ? '' : (p as never)[MOTION_CFG] ? ' [LIIKESOITIN]' : (p as never)[ANIM] ? ` [ANIMAATIO ${(p as never as Record<string, { dur: number }>)[ANIM]!.dur} s]` : ' [staattinen kuva]';
function task(t: Task): string {
  const why = (w?: (string | undefined)[]) => (w ?? []).map((x, i) => x ? `\n      ✗${i}: ${x}` : '').join('');
  switch (t.kind) {
    case 'choice': return t.options.map((o, i) => (i === t.answer ? '✔' : '·') + opt(o)).join(' | ') + why(t.why);
    case 'multi': return t.options.map((o, i) => (t.answer.includes(i) ? '✔' : '·') + opt(o)).join(' | ');
    case 'numeric': return `näppäile ${t.answer}${t.unit ? ' ' + t.unit : ''}`;
    default: return `${t.kind}: ${JSON.stringify(t).slice(0, 220)}`;
  }
}
const line = (it: Item) => `- [${it.tag}] ${it.say}${kind(it.scene)}\n   → ${task(it.task)}\n   hint: ${it.hint ?? '-'}\n   selitys: ${it.explain}`;

it.skipIf(!process.env.DUMP_ID)('dump one lesson', () => {
  const id = process.env.DUMP_ID!, s = NODES[id]!, k = kc(id);
  const out = [`# ${id}: ${s.icon} ${s.stop}`, `${k.title} (${k.grade} lk), esitiedot: ${allOf(id).join(', ') || '–'}`, `TAVOITE: ${s.goal}`, `INTRO: ${s.intro}`, `PALKINTO: ${s.reward}`, `REV: ${s.rev ?? '-'}`, '', '## Esittely'];
  s.demo(rng(1)).forEach((d, i) => out.push(`${i + 1}. ${d.say}${kind(d.scene)}`));
  for (const ph of ['guided', 'independent', 'retrieval', 'transfer'] as const) {
    out.push('', `## ${ph}`);
    const seen = new Map<string, number>();
    for (let seed = 1; seed < 300; seed++) {
      const it = s.item(rng(seed), ph);
      const n = seen.get(it.tag) ?? 0;
      if (n >= 2) continue;
      seen.set(it.tag, n + 1);
      out.push(line(it));
    }
    out.push(`(perheet: ${[...seen.keys()].join(', ')})`);
  }
  mkdirSync('audit/dump', { recursive: true });
  writeFileSync(`audit/dump/${id}.md`, out.join('\n') + '\n');
});
