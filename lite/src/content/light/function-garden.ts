import { evaluateGardenCurve, gardenIntervals, type FunctionGardenTask, type GardenDirection } from '../models/function-garden';
import { mountFunctionGarden } from '../scenes/function-garden';
import { askChoice, askNumber, figuresOf, fi, type LightAdapter } from './core';

const picture = (task: FunctionGardenTask, solved = false) => figuresOf(host => {
  const widget = mountFunctionGarden(task, host, () => {});
  if (solved) widget.reveal();
}, task.setting);

const WORDS: Record<GardenDirection, string> = { rising: 'Se nousee.', falling: 'Se laskee.', constant: 'Se pysyy samalla korkeudella.' };
const TEMP: Record<GardenDirection, string> = { rising: 'Lämpötila nousee.', falling: 'Lämpötila laskee.', constant: 'Lämpötila pysyy samana.' };

export const functionGardenLight: LightAdapter<FunctionGardenTask> = (full, context) => {
  const task = full.task;
  const solvedPicture = picture(task, true);
  switch (task.mode) {
    case 'mono': {
      const sections = gardenIntervals(task.points);
      const valueAt = (x: number) => task.points.find(p => p[0] === x)![1];
      // Prefer a stretch where the direction and the side of zero disagree: that is the key idea.
      const tricky = sections.find(s => (s.direction === 'rising' && valueAt(s.to) < 0) || (s.direction === 'falling' && valueAt(s.to) > 0));
      const section = (full.tag.includes('direction') || context.phase === 'transfer') && tricky ? tricky : tricky ?? sections[0]!;
      const temperature = task.axis.yName.startsWith('Lämpötila');
      const words = temperature ? TEMP : WORDS;
      const order: GardenDirection[] = ['rising', 'falling', 'constant'];
      const below = valueAt(section.to) < 0;
      return askChoice(full, context, {
        say: `Katso kuvaajaa kohdasta x = ${fi(section.from)} kohtaan x = ${fi(section.to)}. Mitä ${temperature ? 'lämpötilalle' : 'kuvaajalle'} tapahtuu?`,
        scene: picture(task), afterCorrect: solvedPicture,
        choices: order.map(direction => ({ text: words[direction],
          why: direction === section.direction ? undefined
            : section.direction === 'rising' && below ? 'Kuvaaja on nollan alapuolella, mutta se kulkee ylöspäin. Korkeus ja suunta ovat eri asioita.'
              : section.direction === 'falling' && !below ? 'Kuvaaja on nollan yläpuolella, mutta se kulkee alaspäin. Korkeus ja suunta ovat eri asioita.'
                : 'Seuraa kuvaajaa vasemmalta oikealle ja vertaa alku- ja loppukohdan korkeutta.' })),
        correct: order.indexOf(section.direction), ordered: true,
        hint: 'Kulje sormella kuvaajaa pitkin vasemmalta oikealle. Ylöspäin on nousua, vaikka kuvaaja olisi nollan alapuolella.',
        explain: `Välillä ${fi(section.from)}…${fi(section.to)} kuvaaja ${section.direction === 'rising' ? 'nousee' : section.direction === 'falling' ? 'laskee' : 'pysyy vaakasuorana'}. Suunta kertoo muutoksesta, ja nollaan vertaaminen kertoo vain korkeudesta.`,
      });
    }
    case 'parabola': {
      const right = task.choices.find(c => c.curve.type === 'parabola')!;
      const y = evaluateGardenCurve(task.curve, task.checkX);
      return askChoice(full, context, {
        say: task.view === 'samples'
          ? 'Mikä kaarista kulkee kaikkien taulukon pisteiden kautta?'
          : `Mikä kaarista on paraabeli y = ${formula(task.curve)}?`,
        scene: picture(task), afterCorrect: solvedPicture,
        choices: task.choices.map(c => ({ text: `Kaari ${c.id}`,
          why: c.id === right.id ? undefined : `Kaari ${c.id} näyttää samalta reunoilta, mutta kohdassa x = ${fi(task.checkX)} se ei kulje korkeudella ${fi(y)}.` })),
        correct: task.choices.indexOf(right), ordered: true,
        hint: `Katso kohtaa x = ${fi(task.checkX)}. Paraabelilla y on siinä ${fi(y)}.`,
        explain: `Paraabeli kulkee kohdassa x = ${fi(task.checkX)} korkeudella ${fi(y)}. Muut kaaret ovat samanlaisia reunoilta, mutta eivät kulje tämän pisteen kautta.`,
      });
    }
    case 'parabola-graph': {
      const { h, k } = task.curve;
      const missing = task.table.find(cell => cell.y === undefined);
      if (missing) {
        const mirrorX = 2 * h - missing.x;
        const answer = evaluateGardenCurve(task.curve, missing.x);
        return askNumber(full, {
          say: `Kaari on symmetrinen: huipun molemmin puolin se on samalla korkeudella. Kohdassa x = ${fi(mirrorX)} korkeus on ${fi(answer)}. Mikä on korkeus kohdassa x = ${fi(missing.x)}?`,
          scene: picture(task), afterCorrect: solvedPicture, answer, label: 'y',
          hint: `Huippu on kohdassa x = ${fi(h)}. Kohdat ${fi(missing.x)} ja ${fi(mirrorX)} ovat yhtä kaukana huipusta.`,
          explain: `Kohdat x = ${fi(missing.x)} ja x = ${fi(mirrorX)} ovat yhtä kaukana huipusta, joten kaari on niissä samalla korkeudella: ${fi(answer)}.`,
        });
      }
      const top = task.curve.a < 0;
      return askNumber(full, {
        say: `Taulukon pisteet on merkitty kuvaan. Missä kohdassa x kaari kääntyy${top ? ' alaspäin' : ' ylöspäin'}?`,
        scene: picture(task), afterCorrect: solvedPicture, answer: h, label: 'x',
        whyAt: { [k]: 'Tämä on kääntymiskohdan korkeus y. Kysymys koskee vaakasuuntaista kohtaa x.' },
        hint: 'Etsi taulukosta kaksi kohtaa, joissa korkeus on sama. Kääntymiskohta on niiden puolivälissä.',
        explain: `Kaari kääntyy kohdassa x = ${fi(h)}, jossa korkeus on ${fi(k)}. Sen molemmin puolin korkeudet toistuvat samoina.`,
      });
    }
    case 'sequence': {
      const terms = task.observed;
      const gap = terms[1]!.value - terms[0]!.value;
      const ratio = !terms.every((t, i) => i === 0 || t.value - terms[i - 1]!.value === gap);
      const last = terms.at(-1)!, prev = terms.at(-2)!;
      const step = ratio ? last.value / prev.value : last.value - prev.value;
      const before = context.phase === 'transfer' && task.target === 'structure' && Number.isInteger(ratio ? terms[0]!.value / step : 0);
      const answer = before
        ? (ratio ? terms[0]!.value / step : terms[0]!.value - step)
        : (ratio ? last.value * step : last.value + step);
      const list = terms.map(t => fi(t.value)).join(', ');
      const whyAt: Record<number, string> = {};
      if (ratio && !before) whyAt[last.value + (last.value - prev.value)] = 'Tässä jonossa luvut eivät kasva saman verran. Jokainen luku saadaan kertomalla edellinen samalla luvulla.';
      if (!ratio && !before) whyAt[last.value * 2] = 'Jonossa lisätään joka kerta sama määrä. Tuplaaminen ei sovi aiempiin lukuihin.';
      return askNumber(full, {
        say: before
          ? `Ikkunarivit etenevät samalla säännöllä: ${list}. Mikä luku oli juuri ennen ensimmäistä?`
          : `Ikkunarivit etenevät samalla säännöllä: ${list}. Mikä luku tulee seuraavaksi?`,
        scene: picture(task), afterCorrect: solvedPicture, answer, whyAt,
        hint: ratio ? `Jaa luku edellisellä: ${fi(last.value)} : ${fi(prev.value)} = ${fi(step)}. Sama kerroin toistuu.`
          : `Vähennä luvusta edellinen: ${fi(last.value)} − ${fi(prev.value)} = ${fi(step)}. Sama lisäys toistuu.`,
        explain: ratio
          ? `Jokainen luku on ${fi(step)} kertaa edellinen. ${before ? `Taaksepäin jaetaan: ${fi(terms[0]!.value)} : ${fi(step)} = ${fi(answer)}.` : `${fi(last.value)} · ${fi(step)} = ${fi(answer)}.`}`
          : `Jokainen luku on ${fi(step)} suurempi kuin edellinen. ${before ? `Taaksepäin vähennetään: ${fi(terms[0]!.value)} − ${fi(step)} = ${fi(answer)}.` : `${fi(last.value)} + ${fi(step)} = ${fi(answer)}.`}`,
      });
    }
  }
};

function formula({ a, h, k }: { a: number; h: number; k: number }) {
  const inner = h === 0 ? 'x' : `(x ${h > 0 ? '−' : '+'} ${Math.abs(h)})`;
  const lead = a === 1 ? '' : a === -1 ? '−' : fi(a);
  const tail = k === 0 ? '' : ` ${k > 0 ? '+' : '−'} ${Math.abs(k)}`;
  return `${lead}${inner}²${tail}`;
}
