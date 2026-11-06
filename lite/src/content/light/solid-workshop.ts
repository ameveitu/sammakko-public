import type { SolidWorkshopQuestion, SolidWorkshopTask } from '../models/solid-workshop';
import { solidWorkshopPaint } from '../scenes/solid-workshop';
import { askChoice, askNumber, type LightAdapter } from './core';

const lower = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);
const COUNT: Record<string, string> = { Tahkoja: 'tahkoa', Särmiä: 'särmää', Kärkiä: 'kärkeä' };
const pickFigure = (q: SolidWorkshopQuestion) => !q.label.endsWith('?') && !/määrä|^[A-ZÄÖ][a-zäö]+ja$|^[A-ZÄÖ][a-zäö]+iä$/.test(q.label)
  && q.options.length <= 3 && q.options.every(o => /^(Malli )?\d$/.test(o.label));
const pickPart = (q: SolidWorkshopQuestion) => q.options.every(o => /^[A-C]$/.test(o.label));

function question(q: SolidWorkshopQuestion, group?: SolidWorkshopQuestion): string {
  if (pickFigure(q)) return `Mikä malleista on ${lower(q.label)}?`;
  if (pickPart(q)) return `Kuvassa on kirjaimet A, B ja C. Mikä niistä osoittaa: ${lower(q.label)}?`;
  if (COUNT[q.label]) return `Montako ${COUNT[q.label]} kappaleessa on?`;
  if (/määrä pohja mukaan lukien/.test(q.label)) return 'Montako tahkoa kappaleessa on, kun pohja lasketaan mukaan?';
  if (/^Kappale \d$/.test(q.label)) return `Onko ${lower(q.label)} ${q.options.map(o => o.label).join(', ').replace(/, ([^,]*)$/, ' vai $1')}?`;
  if (q.label.endsWith('?')) return q.label;
  const decisive = /^Ratkaiseva havainto mallista (\d)$/.exec(q.label);
  if (decisive) return `Mistä näkee, onko malli ${decisive[1]} tasokuvio vai kappale?`;
  if (/tuntomerkki|rakennesääntö/.test(q.label) && group) return `Mistä ${lower(group.label)} tunnistaa?`;
  if (q.label === 'Havainto valitusta kappaleesta') return 'Mikä havainto kertoo sen?';
  if (q.label === 'Vastakkaisten tahkojen suhde') return 'Millaisia vastakkaiset tahkot ovat?';
  if (q.label === 'Valitun kappaleen sivukuva') return 'Millainen tämän kappaleen sivukuva on?';
  return `Valitse oikea: ${lower(q.label)}.`;
}

export const solidWorkshopLight: LightAdapter<SolidWorkshopTask> = (full, context) => {
  const task = full.task;
  const single = task.questions.filter(q => !q.many && q.answer.length === 1);
  const scene = solidWorkshopPaint(task.scene, task.definitions);
  if (!single.length) {
    // Only "select all" questions: ask how many models belong to the group.
    const q = task.questions.find(x => pickFigure(x)) ?? task.questions[0]!;
    return askNumber(full, {
      say: `Kuinka moni kuvan malleista kuuluu ryhmään: ${lower(q.label)}?`, answer: q.answer.length, scene,
      hint: 'Katso jokaista mallia erikseen: täyttääkö se ehdon?', explain: `Ryhmään kuuluvat mallit: ${q.answer.map(id => q.options.find(o => o.id === id)?.label ?? id).join(', ')}. ${full.explain ?? ''}`.trim(),
    });
  }
  const q = context.phase === 'guided' ? single[0]! : context.phase === 'transfer' ? single.at(-1)! : single[context.r.int(0, single.length - 1)]!;
  const first = task.questions[0]!;
  const lead = q !== first && pickFigure(first) && !first.many && first.answer.length === 1
    ? `Malli ${first.options.find(o => o.id === first.answer[0])?.label.replace('Malli ', '')} on ${lower(first.label)}. ` : '';
  const right = q.options.findIndex(o => o.id === q.answer[0]);
  return askChoice(full, context, {
    say: lead + question(q, pickFigure(first) ? first : undefined), scene,
    ordered: pickFigure(q) || pickPart(q) || q.options.every(o => /^\d+$/.test(o.label)),
    choices: q.options.map((o, i) => ({ text: o.label, why: i === right ? undefined : q.why })),
    correct: right, explain: full.explain ?? q.why,
  });
};
