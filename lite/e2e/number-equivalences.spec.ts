import { expect, test, type Page } from '@playwright/test';

const ids = ['M79-ABS-01', 'M79-OPPOSITE-01', 'M79-DEC-ADD', 'M79-DEC-SUB', 'M79-DEC-ADD-SUB', 'M79-DEC-MUL', 'M79-PROP-SOLVE'] as const;
type Id = typeof ids[number];
type State = { family: string; phase: string; progress: { checked: boolean } };
const board = (page: Page) => page.locator('[data-equiv-workbench]');
const field = (page: Page, name: string) => board(page).getByRole('textbox', { name, exact: true });
const menu = (page: Page, name: string) => board(page).getByRole('combobox', { name, exact: true });
const btn = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const snapshot = (page: Page): Promise<State> => page.evaluate(() => JSON.parse(
  (window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const evidence = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const num = (s: string) => Number(s.replaceAll('−', '-').replace(',', '.'));
async function open(page: Page, id: Id, seed = 1) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await btn(page, 'Kokeilen itse').click();
  await expect(board(page)).toBeVisible();
}
async function finish(page: Page, correct: boolean) {
  await btn(page, 'Tarkista merkinnät').press('Enter');
  await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', String(correct));
}
const q = (raw: string) => {
  const [n, d = '1'] = raw.split('/');
  return [BigInt(n!), BigInt(d)] as const;
};
const product = ([a, b]: readonly bigint[], [c, d]: readonly bigint[]) => [a! * c!, b! * d!] as const;
const ratio = ([a, b]: readonly bigint[], [c, d]: readonly bigint[]) => [a! * d!, b! * c!] as const;
const formatted = ([a, b]: readonly bigint[]) => `${a}/${b}`;
const ticks = (raw: string, precision: number) => {
  const [whole, decimals = ''] = raw.split(',');
  return Number(whole) * 10 ** precision + Number(decimals.padEnd(precision, '0'));
};
async function places(page: Page, all = true, mistake = false) {
  const timeline = page.locator('[data-equiv-timeline]');
  const [first, ...events] = await timeline.locator('strong,span').allTextContents();
  const [firstText] = first!.match(/[\d]+(?:,[\d]+)?/) ?? [];
  const data = events.map(event => {
    const [, words, amount] = /^\d+\. ([^\d]+) ([\d]+(?:,[\d]+)?)/.exec(event)!;
    const op = /Ilta|Liitettävä|Liitetään|lisää/.test(words!) ? 'add' : 'sub';
    return { op, amount: amount! } as const;
  });
  const precision = /\b\d+,\d{3}\b/.test([first, ...events].join(' ')) ? 3 : 2, factor = 10 ** precision;
  let result = ticks(firstText!, precision);
  if (data.length === 2) {
    await expect(board(page).locator('[data-equiv-place-row]').first()).toBeHidden();
    const end = data.reduce((a, { op, amount }) => a + (op === 'add' ? 1 : -1) * ticks(amount, precision), result);
    await field(page, 'Arvion alempi kokonaisluku').fill(String(Math.floor(end / factor)));
    await field(page, 'Arvion ylempi kokonaisluku').fill(String(Math.ceil(end / factor)));
    await btn(page, 'Lukitse suuruusarvio').press('Enter');
    await expect(board(page).locator('[data-equiv-locked-estimate]')).toBeVisible();
    await expect(board(page).locator('input[aria-label="Arvion alempi kokonaisluku"]')).toBeDisabled();
  }
  for (const [i, { op, amount }] of data.entries()) {
    if (!all && i > 0) break;
    const start = result, b = ticks(amount, precision);
    result += (op === 'add' ? 1 : -1) * b;
    const [x, y] = op === 'sub' && result < 0 ? [b, start] : [start, b];
    if (data.length === 2) await btn(page, `Laskuvaihe ${i + 1}`).press('Enter');
    const prefix = `Vaihe ${i + 1}`;
    await menu(page, `${prefix}, laskutoimitus`).selectOption(op);
    const labels = ['kokonaiset', 'kymmenesosat', 'sadasosat', 'tuhannesosat'].slice(0, precision + 1);
    for (const [j, place] of labels.entries()) {
      const mod = 10 ** (precision - j);
      const digits = (n: number) => Math.floor(n / mod) % (j ? 10 : 1000);
      await field(page, `${prefix}, ensimmäinen luku, ${place}`).fill(String(digits(x)));
      await field(page, `${prefix}, toinen luku, ${place}`).fill(String(digits(y)));
      if (j) {
        const width = mod * 10;
        const move = Number(op === 'add' ? (x % width) + (y % width) >= width : x % width < y % width);
        await field(page, `${prefix}, siirto sarakkeesta ${place}`).fill(String(mistake && j === 1 ? 1 - move : move));
      }
    }
    await field(page, `${prefix}, tulos`).fill((result / factor).toFixed(precision + 1).replace('.', ','));
    if (op === 'sub') await field(page, `${prefix}, tarkistussumma`).fill(`${start}/${factor}`);
  }
  return { result, precision };
}
async function markPosition(page: Page) {
  return board(page).locator('svg').evaluate(svg => {
    const d = svg.querySelector('[data-equiv-focus]')!.getAttribute('d')!;
    const x = Number(d.split(' ')[1]) + 7;
    return Number([...svg.querySelectorAll('text')].find(t => Math.abs(Number(t.getAttribute('x')) - x) < .01)!.textContent!.replace('−', '-'));
  });
}
async function dragOpposite(page: Page, from: number, to: number) {
  const points = await board(page).locator('svg').evaluate((node, [from, to]) => {
    const svg = node as SVGSVGElement;
    return [from, to].map(value => {
      const t = [...svg.querySelectorAll('text')].find(t => Number(t.textContent!.replace('−', '-')) === value)!;
      const p = svg.createSVGPoint(); p.x = Number(t.getAttribute('x')); p.y = Number(t.getAttribute('y')) - 23;
      const q = p.matrixTransform(svg.getScreenCTM()!); return [q.x, q.y] as const;
    });
  }, [from, to]);
  await page.mouse.move(...points[0]!); await page.mouse.down();
  await page.mouse.move(...points[1]!, { steps: 6 }); await page.mouse.up();
}
async function multiply(page: Page, wrong = false) {
  const text = await board(page).locator('[data-equiv-factors]').innerText();
  const [a, b] = [...text.matchAll(/\b\d+,\d+\b/g)].map(m => m[0]);
  const scaled = (x: string) => Number(x.replace(',', ''));
  const denominator = 10 ** (a!.split(',')[1]!.length + b!.split(',')[1]!.length);
  const n = scaled(a!), m = scaled(b!);
  const k = num(b!);
  await expect(board(page).locator('[data-equiv-product-area]')).toHaveCount(0);
  await menu(page, 'Suuruusennuste').selectOption(k < 1 ? 'smaller' : k > 1 ? 'larger' : 'same');
  await btn(page, 'Lukitse suuruusennuste').press('Enter');
  if (text.includes('Leveys')) await expect(board(page).locator('[data-equiv-product-area]')).toHaveCount(1);
  await field(page, 'Ensimmäisen kertoimen osat').fill(String(n));
  await field(page, 'Toisen kertoimen osat').fill(String(m));
  await field(page, 'Osamäärien kokonaislukutulo').fill(String(n * m));
  await field(page, 'Kokonaisen jakaja').fill(String(wrong ? denominator / 10 : denominator));
  await field(page, 'Kertolaskun tulos').fill(`${n * m}/${denominator}`);
  await menu(page, 'Tuloksen yksikkö').selectOption(text.includes('Leveys') ? 'm²' : 'km');
}
async function proportion(page: Page, wrong = false) {
  const table = await board(page).locator('[data-equiv-ratio-table] tbody tr').evaluateAll(rows =>
    rows.map(row => [...row.querySelectorAll('td')].map(cell => cell.textContent!)));
  const a = [table[0]![0]!, table[1]![0]!], b = [table[0]![1]!, table[1]![1]!];
  const known = b[0] === 'x' ? 1 : 0;
  const factor = ratio(q(b[known]!), q(a[known]!)), x = product(q(a[1 - known]!), factor);
  for (const [name, pair] of [['Vasen', b], ['Oikea', a]] as const) {
    await field(page, `${name} suhde, osoittaja`).fill(pair[1]!);
    await field(page, `${name} suhde, nimittäjä`).fill(pair[0]!);
  }
  if (await menu(page, 'Ratkaisumenetelmä').isVisible()) await menu(page, 'Ratkaisumenetelmä').selectOption('algebra');
  if (await menu(page, 'Skaalauksen suunta').isVisible()) {
    await menu(page, 'Skaalauksen suunta').selectOption('backward');
    await field(page, 'Skaalauskerroin').fill(formatted([factor[1], factor[0]]));
  } else {
    await field(page, 'Yhtälörivin x-kerroin').fill(String(-3n * x[1]));
    await field(page, 'Yhtälörivin oikea puoli').fill(String(-3n * x[0]));
  }
  await field(page, 'Puuttuva mitta').fill(wrong ? '0' : formatted(x));
  const check = formatted(ratio(q(a[1]!), q(a[0]!)));
  await field(page, 'Vasemman suhteen tarkistusarvo').fill(check);
  await field(page, 'Oikean suhteen tarkistusarvo').fill(check);
  return known;
}

test.describe('Lukujen vastaavuudet ja tarkka paikka-arvo', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });
  test('places all points at a distance, including the single zero', async ({ page }) => {
    let d = -1;
    for (let seed = 1; seed < 41 && d !== 0; seed++) {
      await open(page, 'M79-ABS-01', seed);
      d = Number((await board(page).innerText()).match(/Annettu etäisyys (\d+)/)?.[1] ?? -1);
    }
    expect(d).toBe(0);
    await field(page, 'Etäisyys nollasta').fill('0');
    await field(page, 'Saman etäisyyden paikka 1').fill('0');
    await finish(page, true);
  });
  test('drags the opposite to the opposite side while retaining the same distance', async ({ page }) => {
    await open(page, 'M79-OPPOSITE-01', 7);
    const p = await markPosition(page), side = p > 0 ? 'left' : p < 0 ? 'right' : 'zero';
    await dragOpposite(page, p, -p);
    await expect(field(page, 'Vastaluvun paikka')).toHaveValue(String(-p));
    await field(page, 'Merkityn paikan luku').fill(String(p));
    await field(page, 'Etäisyys nollasta').fill(String(Math.abs(p)));
    await field(page, 'Paikkalukujen summa').fill('0');
    await menu(page, 'Vastaluvun puoli').selectOption(side);
    const draft = (await board(page).innerText()).match(/Onko ([−\d]+) vastaluku/);
    if (draft) await menu(page, 'Onko ehdotus vastaluku?').selectOption(num(draft[1]!) === -p ? 'yes' : 'no');
    await finish(page, true);
  });
  test('rejects a missing carry, then records guided recovery without raw input', async ({ page }) => {
    await open(page, 'M79-DEC-ADD');
    await places(page, true, true);
    await field(page, 'Vaihe 1, tulos').fill('yksityinen huomautus');
    await finish(page, false);
    expect(JSON.stringify(await evidence(page))).not.toContain('yksityinen huomautus');
    await btn(page, 'Näytä ja selitä').click();
    await btn(page, 'Uusi yhteinen kokeilu').click();
    await places(page); await finish(page, true);
    expect((await evidence(page)).attempts.at(-1)).toMatchObject({ ok: true, phase: 'guided' });
  });
  test('checks both stages and transfers to a new unit and more decimal places', async ({ page }) => {
    await open(page, 'M79-DEC-ADD-SUB', 7);
    const keys = new Set<string>();
    for (let i = 0; i < 4; i++) {
      const result = await places(page);
      if (i === 3) { expect((await snapshot(page)).phase).toBe('transfer'); expect(result.precision).toBe(3); }
      await finish(page, true); keys.add((await evidence(page)).attempts.at(-1).itemKey);
      if (i < 2) await btn(page, 'Seuraava kokeilu').click();
      if (i === 2) await btn(page, 'Kokeile uudessa tilanteessa').click();
    }
    expect(keys.size).toBe(4);
    expect((await evidence(page)).events).toEqual([expect.objectContaining({ node: 'M79-DEC-ADD-SUB', assisted: false })]);
  });
  test('locks multiplication magnitude before displaying area and rejects a wrong place divisor', async ({ page }) => {
    await open(page, 'M79-DEC-MUL');
    await multiply(page, true); await finish(page, false);
    await btn(page, 'Uusi kokeilu').click();
    await multiply(page); await finish(page, true);
  });
  test('uses reversible ratios and a distinct denominator transfer with both checks', async ({ page }) => {
    await open(page, 'M79-PROP-SOLVE', 7);
    await proportion(page, true); await finish(page, false);
    await btn(page, 'Uusi kokeilu').click();
    for (let i = 0; i < 4; i++) {
      const known = await proportion(page);
      if (i === 3) { expect((await snapshot(page)).phase).toBe('transfer'); expect(known).toBe(0); }
      await finish(page, true);
      if (i < 2) await btn(page, 'Seuraava kokeilu').click();
      if (i === 2) await btn(page, 'Kokeile uudessa tilanteessa').click();
    }
    expect((await snapshot(page)).progress.checked).toBe(true);
  });
  for (const [name, viewport] of [['desktop', { width: 1366, height: 768 }], ['tablet', { width: 768, height: 1024 }]] as const) {
    test(`shows all 14 families with their controls and givens on ${name}`, async ({ page }, info) => {
      test.setTimeout(95_000);
      await page.setViewportSize(viewport);
      const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await snapshot(page)).family);
          if (id === 'M79-DEC-ADD-SUB' || id === 'M79-DEC-SUB') await places(page);
          if (id === 'M79-DEC-MUL') await multiply(page);
          await expect(board(page), id).toBeInViewport({ ratio: 1 });
          await expect(page.locator('[data-equiv-givens]'), id).toBeInViewport({ ratio: 1 });
          for (const control of await board(page).locator('input:visible,select:visible,button:visible').all()) {
            const box = (await control.boundingBox())!;
            expect(box.height, id).toBeGreaterThanOrEqual(44);
            expect(box.width, id).toBeGreaterThanOrEqual(44);
          }
        }
        expect(families.size, id).toBe(2);
        if (['M79-OPPOSITE-01', 'M79-DEC-ADD-SUB', 'M79-DEC-MUL', 'M79-PROP-SOLVE'].includes(id))
          await page.screenshot({ path: info.outputPath(`${id}-${name}.png`) });
      }
      expect(errors).toEqual([]);
    });
  }
});
