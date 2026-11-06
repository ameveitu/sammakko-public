import { expect, test, type Page } from '@playwright/test';

const ids = ['M79-DIRECTPROP', 'M79-INVERSEPROP', 'M79-SYSTEM-01', 'M79-SYSTEM-ALG', 'M79-SYSTEM-GRAPH',
  'M79-INTERCEPT', 'M79-ZERO-CALC', 'M79-ZERO-GRAPH', 'M79-ZERO'] as const;
type Id = typeof ids[number];
type Snapshot = { family: string; phase: string; progress: { checked: boolean } };
type Equation = [number, number, number];
const state = (page: Page): Promise<Snapshot> => page.evaluate(() => JSON.parse(
  (window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const evidence = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const panel = (page: Page) => page.locator('[data-relation-workbench]');
const givens = (page: Page) => page.locator('[data-relation-givens]');
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const input = (page: Page, name: string) => panel(page).getByRole('textbox', { name, exact: true });
const menu = (page: Page, name: string) => panel(page).getByRole('combobox', { name, exact: true });
const number = (value: string): number => value.includes('/') ? value.split('/').map(number).reduce((a, b) => a / b)
  : Number(value.replaceAll('−', '-').replace(',', '.'));
const clean = (s: string) => s.replaceAll('−', '-').replace(/\s+/g, '');
const coef = (text: string, v: 'x' | 'y') => {
  const term = new RegExp(`([+-]?\\d*)${v}`).exec(text)?.[1];
  return term === undefined ? 0 : term === '-' ? -1 : !term || term === '+' ? 1 : Number(term);
};
const table = (page: Page) => panel(page).locator('tbody tr').evaluateAll(rows => rows.map(row => [...row.querySelectorAll('td')].map(cell => cell.textContent!.trim())));

async function open(page: Page, id: Id, seed = 7) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  await expect(panel(page)).toBeVisible();
}
async function finish(page: Page, correct: boolean) {
  await button(page, 'Tarkista merkinnät').press('Enter');
  await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', String(correct));
}
async function lines(page: Page): Promise<[Equation, Equation]> {
  return (await givens(page).locator('[data-relation-equation]').allTextContents()).map(raw => {
    const [left, right] = clean(raw.replace(/^\d+\.\s*/, '')).split('=');
    return [coef(left!, 'x'), coef(left!, 'y'), Number(right)];
  }) as [Equation, Equation];
}
function solve([[a, b, u], [c, d, v]]: readonly [Equation, Equation]): [string, string] {
  return [`${u * d - b * v}/${a * d - b * c}`, `${a * v - u * c}/${a * d - b * c}`];
}
async function fillAlgebra(page: Page, missing = false) {
  const [a, b] = await lines(page);
  if (await menu(page, 'Ratkaisumenetelmä').isVisible()) await menu(page, 'Ratkaisumenetelmä').selectOption('eliminate');
  if (await menu(page, 'Eliminoitava muuttuja').isVisible()) {
    await menu(page, 'Eliminoitava muuttuja').selectOption('y');
    const u = b[1] * 7, v = -a[1] * 7;
    await input(page, 'Ensimmäisen yhtälön kerroin').fill(`${u}/3`);
    await input(page, 'Toisen yhtälön kerroin').fill(`${v}/3`);
    await input(page, 'Syntyneen yhtälön muuttujakerroin').fill(`${u * a[0] + v * b[0]}/3`);
    await input(page, 'Syntyneen yhtälön oikea puoli').fill(`${u * a[2] + v * b[2]}/3`);
  } else {
    await menu(page, 'Yhtälö, josta muuttuja erotetaan').selectOption('1');
    await menu(page, 'Erotettava muuttuja').selectOption('x');
    await input(page, 'Erotetun lausekkeen toisen muuttujan kerroin').fill(`${-b[1]}/${b[0]}`);
    await input(page, 'Erotetun lausekkeen vakio').fill(`${b[2]}/${b[0]}`);
    await input(page, 'Syntyneen yhtälön muuttujakerroin').fill(`${a[1] * b[0] - a[0] * b[1]}/${b[0]}`);
    await input(page, 'Syntyneen yhtälön oikea puoli').fill(`${a[2] * b[0] - a[0] * b[2]}/${b[0]}`);
  }
  const [x, y] = solve([a, b]);
  await input(page, 'Ratkaisupari, x').fill(x);
  await input(page, 'Ratkaisupari, y').fill(y);
  for (const [i, [ax, by, constant]] of [a, b].entries()) {
    await input(page, `Ehto ${i + 1}, x-termin arvo`).fill(String(ax * number(x)));
    await input(page, `Ehto ${i + 1}, y-termin arvo`).fill(String(by * number(y)));
    if (!missing || i === 0) await input(page, `Vasen puoli ${i + 1}`).fill(String(constant));
  }
}
async function graphZeros(page: Page) {
  const details = panel(page).locator('details');
  await details.getByText('Kuvaajan näytepisteet tekstinä').click();
  const values = [...(await details.innerText()).matchAll(/\(([^,]+(?:,\d+)?), ([^)]+)\)/g)];
  await details.getByText('Kuvaajan näytepisteet tekstinä').click();
  return values.filter(row => number(row[2]!) === 0).map(row => row[1]!);
}
async function fillCalculation(page: Page, reverse = false) {
  const raw = clean((await panel(page).locator('[data-relation-formula]').innerText()).split('=')[1]!);
  const parts = raw.startsWith('(') ? [...raw.matchAll(/\(([^()]+)\)/g)].map(m => m[1]!) : [raw];
  const original = parts.map(text => {
    const a = coef(text, 'x');
    const b = Number(text.replace(/([+-]?\d*)x/, '') || '0');
    return [a, b] as const;
  });
  const coefficients = reverse ? [...original].reverse() : original;
  const roots = [];
  for (const [i, [a, b]] of coefficients.entries()) {
    await input(page, `Yhtälö ${i + 1}, x:n kerroin`).fill(String(a));
    await input(page, `Yhtälö ${i + 1}, oikea puoli`).fill(String(-b));
    const value = -b / a || 0;
    if (!roots.includes(value)) {
      roots.push(value);
      await input(page, `Laskettu nollakohta ${roots.length}`).fill(`${-b}/${a}`);
      for (const [j, [coef, shift]] of original.entries()) {
        await input(page, `Nollakohta ${roots.length}, sijoitus ${j + 1}`).fill(String(coef * value + (original.length > 1 ? shift : 0)));
      }
      await input(page, `Sijoituksen tulos ${roots.length}`).fill('0');
    }
  }
  return roots;
}
async function lockGraph(page: Page) {
  await expect(panel(page).locator('[data-relation-formula]')).toHaveCount(0);
  await expect(button(page, 'Tarkista merkinnät')).toBeDisabled();
  const roots = await graphZeros(page);
  expect(roots.length).toBeGreaterThan(0);
  for (const [i, root] of roots.entries()) await input(page, `Kuvaajan nollakohta ${i + 1}`).fill(root);
  await expect(panel(page).locator('[data-relation-mark]')).toHaveCount(roots.length);
  await button(page, 'Lukitse kuvaajan nollakohdat').press('Enter');
  await expect(panel(page).locator('[data-relation-formula]')).toBeVisible();
  await expect(panel(page)).toContainText('Lukittu kuvaajahavainto');
  return roots.map(number);
}

test.describe('Kahden virran ja majakkaviivan työpöytä', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('rejects a fixed starting amount, then calculates all ratios with help recorded', async ({ page }) => {
    for (const seed of [1, 7]) {
      await open(page, 'M79-DIRECTPROP', seed);
      if ((await state(page)).family.includes('fixed')) break;
    }
    const fill = async (force?: string) => {
      const values = await table(page);
      await input(page, 'Nollan syötteen tulos').fill(values[0]![1]!);
      const k = values.slice(1).map(row => number(row[1]!) / number(row[0]!));
      for (const [i, row] of values.slice(1).entries()) await input(page, `Rivi ${i + 2}, suhde y/x`).fill(`${row[1]}/${row[0]}`);
      await menu(page, 'Sopiiko suoraan verrannollisuuteen?').selectOption(force ?? (k.every(v => v === k[0]) && number(values[0]![1]!) === 0 ? 'yes' : 'no'));
    };
    await fill('yes');
    await finish(page, false);
    expect((await evidence(page)).events).toHaveLength(0);
    await button(page, 'Näytä ja selitä').click();
    await button(page, 'Uusi yhteinen kokeilu').click();
    await fill();
    await finish(page, true);
    expect((await evidence(page)).attempts.at(-1)).toMatchObject({ phase: 'guided', ok: true });
  });

  test('checks products and excludes zero even when times decrease', async ({ page }) => {
    await open(page, 'M79-INVERSEPROP');
    const values = await table(page);
    const products = values.map(([x, y]) => number(x!) * number(y!));
    for (const [i, [x, y]] of values.entries()) {
      const [numerator, divisor = '1'] = y!.split('/');
      await input(page, `Rivi ${i + 1}, tulo x·y`).fill(`${number(x!) * number(numerator!)}/${divisor}`);
    }
    await menu(page, 'Onko tulo vakio?').selectOption(products.every(v => Math.abs(v - products[0]!) < 1e-9) ? 'yes' : 'no');
    await menu(page, 'Onko x = 0 suljettu pois?').selectOption('yes');
    await menu(page, 'Mikä pidetään mallissa vakiona?').selectOption('work');
    await finish(page, true);
  });

  test('substitutes each candidate into both original equations and classifies dependent lines', async ({ page }) => {
    for (const seed of [1, 7]) {
      await open(page, 'M79-SYSTEM-01', seed);
      if ((await state(page)).family.includes('dependent')) break;
    }
    const [a, b] = await lines(page);
    const candidates = await panel(page).locator('tbody th').allTextContents();
    for (const [i, text] of candidates.entries()) {
      const [x, y] = text.slice(1, -1).split(', ').map(number);
      const [u, v] = [a, b].map(([a, b]) => a * x! + b * y!);
      await input(page, `Pari ${i + 1}, ehto 1`).fill(String(u));
      await input(page, `Pari ${i + 1}, ehto 2`).fill(String(v));
      await menu(page, `Pari ${i + 1}, sopiiko kumpaankin?`).selectOption(u === a[2] && v === b[2] ? 'yes' : 'no');
    }
    const multiple = b[0] / a[0];
    await menu(page, 'Ratkaisujoukon laji').selectOption(multiple * a[2] === b[2] ? 'many' : 'none');
    await input(page, 'Toisen vasemman puolen kerroin').fill(String(multiple));
    await input(page, 'Skaalattu ensimmäinen oikea puoli').fill(String(multiple * a[2]));
    await finish(page, true);
  });

  test('uses own exact algebra and rejects checking only one original equation', async ({ page }) => {
    await open(page, 'M79-SYSTEM-ALG');
    await fillAlgebra(page, true);
    await finish(page, false);
    await button(page, 'Uusi kokeilu').click();
    await fillAlgebra(page);
    await finish(page, true);
  });

  test('reads a vertical line and verifies an actual intersection in both equations', async ({ page }) => {
    let first: Equation | undefined;
    for (const seed of Array.from({ length: 32 }, (_, i) => i + 1)) {
      await open(page, 'M79-SYSTEM-GRAPH', seed);
      [first] = await lines(page);
      if ((await state(page)).family.includes('shared') && first[1] === 0) break;
    }
    expect(first?.[1]).toBe(0);
    expect((await state(page)).family).toContain('shared');
    const pair = await lines(page), [x, y] = solve(pair);
    const vertical = panel(page).locator('svg g[clip-path] > line').first();
    expect(await vertical.getAttribute('x1')).toBe(await vertical.getAttribute('x2'));
    await menu(page, 'Suorien yhteiset pisteet').selectOption('one');
    const viewportPoint = await panel(page).locator('svg > rect').evaluate((rect, [x, y]) => {
      const chart = rect as SVGRectElement, svg = chart.ownerSVGElement!;
      const svgPoint = svg.createSVGPoint();
      svgPoint.x = chart.x.baseVal.value + chart.width.baseVal.value * (x + 5) / 10;
      svgPoint.y = chart.y.baseVal.value + chart.height.baseVal.value * (6 - y) / 12;
      const screen = svgPoint.matrixTransform(svg.getScreenCTM()!);
      return { x: screen.x, y: screen.y };
    }, [number(x), number(y)] as [number, number]);
    await page.mouse.click(viewportPoint.x, viewportPoint.y);
    expect(number(await input(page, 'Piste 1, x').inputValue())).toBe(number(x));
    expect(number(await input(page, 'Piste 1, y').inputValue())).toBe(number(y));
    await input(page, 'Vasen puoli 1').fill(String(pair[0][2]));
    await input(page, 'Vasen puoli 2').fill(String(pair[1][2]));
    await expect(panel(page).locator('[data-relation-mark]')).toHaveCount(1);
    await finish(page, true);
  });

  test('keeps the initial y-intercept separate from the x-axis zero', async ({ page }) => {
    for (const seed of [1, 7]) {
      await open(page, 'M79-INTERCEPT', seed);
      if ((await state(page)).family.includes('substitute')) break;
    }
    const expression = clean((await givens(page).locator('[data-relation-formula]').innerText()).split('=')[1]!);
    const b = Number(expression.replace(/([+-]?\d*)x/, ''));
    await input(page, 'Funktion arvo f(0)').fill(String(b));
    await input(page, 'Tilanteen alkuarvo').fill(String(b));
    await input(page, 'Y-akselin piste, x').fill('0');
    await input(page, 'Y-akselin piste, y').fill(String(b));
    await menu(page, 'Mitä alkuarvo kuvaa?').selectOption('at-zero');
    await finish(page, true);
  });

  test('uses each factor and identifies a graph with no visible zero', async ({ page }) => {
    for (const seed of [1, 7]) {
      await open(page, 'M79-ZERO-CALC', seed);
      if ((await state(page)).family.includes('product')) break;
    }
    expect(await fillCalculation(page, true)).toHaveLength(2);
    await finish(page, true);
    let roots: string[] = [];
    for (const seed of [1, 7, 2, 3, 4, 5, 6, 8]) {
      await open(page, 'M79-ZERO-GRAPH', seed);
      roots = await graphZeros(page);
      if (!roots.length) break;
    }
    expect(roots).toHaveLength(0);
    await menu(page, 'Näkyykö nollakohtia?').selectOption('none');
    await finish(page, true);
  });

  test('locks independent graphical readings before the formula and transfers to a fractional break-even point', async ({ page }) => {
    await open(page, 'M79-ZERO');
    for (let round = 0; round < 4; round++) {
      const graphical = await lockGraph(page);
      const algebraic = await fillCalculation(page, true);
      expect([...graphical].sort()).toEqual([...algebraic].sort());
      if (round === 3) {
        expect((await state(page)).phase).toBe('transfer');
        expect(algebraic.some(x => x % 1)).toBe(true);
      }
      await finish(page, true);
      if (round < 2) await button(page, 'Seuraava kokeilu').click();
      if (round === 2) await button(page, 'Kokeile uudessa tilanteessa').click();
    }
    expect((await state(page)).progress.checked).toBe(true);
    expect((await evidence(page)).events).toEqual([expect.objectContaining({ node: 'M79-ZERO', assisted: false })]);
  });

  for (const [name, viewport] of [['desktop', { width: 1366, height: 768 }], ['tablet', { width: 768, height: 1024 }]] as const) {
    test(`all 18 families keep equations, graphs and controls visible on ${name}`, async ({ page }, info) => {
      test.setTimeout(90_000);
      await page.setViewportSize(viewport);
      const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await state(page)).family);
          if (id === 'M79-SYSTEM-GRAPH') await menu(page, 'Suorien yhteiset pisteet').selectOption('none');
          if (id === 'M79-SYSTEM-01') await menu(page, 'Ratkaisujoukon laji').selectOption('many');
          if (id === 'M79-ZERO') await lockGraph(page);
          await expect(givens(page), id).toBeInViewport({ ratio: 1 });
          await expect(panel(page), id).toBeInViewport({ ratio: 1 });
          for (const control of await panel(page).locator('input:visible,select:visible,button:visible').all()) {
            expect((await control.boundingBox())!.height, id).toBeGreaterThanOrEqual(44);
          }
        }
        expect(families.size, id).toBe(2);
        if (['M79-SYSTEM-GRAPH', 'M79-SYSTEM-ALG', 'M79-ZERO'].includes(id)) await page.screenshot({ path: info.outputPath(`${id}-${name}.png`) });
      }
      expect(errors).toEqual([]);
    });
  }
});

// Only structured numeric productions belong in the local attempt history.
test('relation numeric fields do not persist arbitrary prose on a rejected response', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return /^webgl/.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
  await open(page, 'M79-INTERCEPT');
  const marker = 'temporary-private-numeric-draft-482';
  await input(page, 'Funktion arvo f(0)').fill(marker);
  await finish(page, false);
  const attempts = (await evidence(page)).attempts;
  expect(attempts).toHaveLength(1);
  expect(attempts[0].ok).toBe(false);
  expect(JSON.stringify(attempts)).not.toContain(marker);
  expect(await page.evaluate(() => JSON.stringify(localStorage))).not.toContain(marker);
});
