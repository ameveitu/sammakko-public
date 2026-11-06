import { expect, test, type Page } from '@playwright/test';

const ids = ['M79-CIRCLE-RADIUS', 'M79-CIRCLE-DIAMETER', 'M79-CIRCLE-CIRCUMFERENCE-CONCEPT', 'M79-CIRCLE-ARC', 'M79-CIRCLE-BASIC',
  'M79-CENTRAL-ANGLE', 'M79-INSCRIBED-ANGLE-CONCEPT', 'M79-INSCRIBED-CENTRAL-REL', 'M79-INSCRIBED-ANGLE',
  'M79-CIRCLE-CIRC', 'M79-ARC', 'M79-CIRCLE-AREA', 'M79-SECTOR', 'M79-THALES'] as const;
type Id = typeof ids[number];
type State = { family: string; phase: string; progress: { checked: boolean } };
type Point = { id: string; x: number; y: number; degrees: number; place: 'rim' | 'inside' | 'centre' };
type Pair = readonly [string, string];
const work = (page: Page) => page.locator('[data-circle-workbench]');
const input = (page: Page, name: string) => work(page).getByRole('textbox', { name, exact: true });
const menu = (page: Page, name: string) => work(page).getByRole('combobox', { name, exact: true });
const button = (page: Page, name: string) => page.getByRole('button', { name, exact: true });
const snapshot = (page: Page): Promise<State> => page.evaluate(() => JSON.parse(
  (window as Window & { render_game_to_text: () => string }).render_game_to_text()));
const evidence = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('sammakko-journey-3') ?? '{"attempts":[],"events":[]}'));
const text = (page: Page) => work(page).innerText();
const turn = (a: number, b: number) => (b - a + 360) % 360;
const halfDegree = (v: number) => Math.round(v * 2) / 2;

async function open(page: Page, id: Id, seed = 1) {
  await page.goto(`./?qa=1&seed=${seed}#saaristo/${id}`);
  await button(page, 'Kokeilen itse').click();
  await expect(work(page)).toBeVisible();
}
async function finish(page: Page, ok: boolean) {
  await button(page, 'Tarkista merkinnät').press('Enter');
  await expect(page.locator('.exp-feedback')).toHaveAttribute('data-ok', String(ok));
}
async function points(page: Page): Promise<Point[]> {
  return work(page).locator('svg').first().evaluate(svg => {
    const boundary = svg.querySelector('circle')!;
    const x = +(boundary.getAttribute('cx') ?? 0), y = +(boundary.getAttribute('cy') ?? 0), r = +(boundary.getAttribute('r') ?? 0);
    return [...svg.querySelectorAll('[data-circle-point]')].map(p => {
      const mark = p.querySelector('circle')!;
      const px = +(mark.getAttribute('cx') ?? 0), py = +(mark.getAttribute('cy') ?? 0);
      const length = Math.hypot(px - x, py - y);
      return { id: p.getAttribute('data-circle-point')!, x: px, y: py, degrees: (Math.round(Math.atan2(py - y, px - x) * 180 / Math.PI) + 360) % 360,
        place: length < 1e-7 ? 'centre' : Math.abs(length - r) < 1e-7 ? 'rim' : 'inside' };
    });
  });
}
const idAt = (points: Point[], id: string) => points.find(p => p.id === id)!;
const rim = (points: Point[]) => points.filter(p => p.place === 'rim');
function arcLength(points: Point[], [a, b]: Pair, v: string) {
  const start = idAt(points, a).degrees, end = idAt(points, b).degrees, through = idAt(points, v).degrees;
  const forward = turn(start, end);
  return turn(start, through) < forward ? forward : 360 - forward;
}
function angle(points: Point[], ends: Pair, v: string) {
  const [a, b, p] = [...ends, v].map(id => idAt(points, id));
  const u = [a!.x - p!.x, a!.y - p!.y], w = [b!.x - p!.x, b!.y - p!.y];
  return halfDegree(Math.atan2(Math.abs(u[0]! * w[1]! - u[1]! * w[0]!), u[0]! * w[0]! + u[1]! * w[1]!) * 180 / Math.PI);
}
function toward(points: Point[], ends: Pair, through: string) {
  const [a, b, c] = [...ends, through].map(id => idAt(points, id).degrees);
  const sweep = turn(a!, b!), selected = turn(a!, c!) < sweep;
  return rim(points).filter(p => !ends.includes(p.id) && (turn(a!, p.degrees) < sweep) === selected);
}
async function pair(page: Page, name: string, ends: Pair) {
  await menu(page, `${name}, pää 1`).selectOption(ends[0]);
  await menu(page, `${name}, pää 2`).selectOption(ends[1]);
}
const parseNum = (value: string | undefined) => Number(value?.replace(',', '.'));
async function mathInputs(page: Page) {
  const given = (await text(page)).match(/(Säde|Halkaisija) (\d+) (cm|m)\./)!;
  const degrees = (await text(page)).match(/keskuskulma (\d+)°/)?.[1];
  const radius = Number(given[2]) / (given[1] === 'Säde' ? 1 : 2);
  const remainder = (await text(page)).includes('Varatun sektorin');
  const part = degrees ? (remainder ? 360 - Number(degrees) : Number(degrees)) : 360;
  return { radius, part, unit: given[3]!, given, degrees };
}
async function fillMeasure(page: Page, area: boolean, wrongUnit = false, approximate = false) {
  const { radius, part, unit, degrees } = await mathInputs(page);
  const exact = (area ? radius * radius : radius * 2) * part;
  await input(page, 'Ympyrän säde').fill(String(radius).replace('.', ','));
  if (degrees) await input(page, 'Osuus täydestä kierroksesta').fill(`${part}/360`);
  if (await menu(page, 'Tuloksen esitystapa').isVisible()) {
    await menu(page, 'Tuloksen esitystapa').selectOption(approximate ? 'approx' : 'exact');
  }
  await input(page, 'Tarkka piin kerroin').fill(`${exact * 4}/1440`);
  await menu(page, 'Tuloksen yksikkö').selectOption(unit + (area === wrongUnit ? '' : '²'));
  if (await input(page, 'Halkaisijoiden määrä, alaraja').isVisible()) {
    await input(page, 'Halkaisijoiden määrä, alaraja').fill('3');
    await input(page, 'Halkaisijoiden määrä, yläraja').fill('4');
  }
  if (await input(page, 'Pyöristetty tulos').isVisible()) {
    const decimals = Number((await text(page)).match(/tulos (\d) desimaalin/)?.[1]);
    await input(page, 'Pyöristetty tulos').fill((exact / 360 * Math.PI).toFixed(decimals).replace('.', ','));
  }
  if (await input(page, 'Uuden pihan tarkka piin kerroin').isVisible())
    await input(page, 'Uuden pihan tarkka piin kerroin').fill(String((radius * 2) ** 2));
}

async function prepThales(page: Page) {
  const p = await points(page);
  const match = (await text(page)).match(/Halkaisija (\w)–(\w)\. Tarkasteltava puoliympyrä kulkee pisteen (\w) kautta\./)!;
  const ends = [match[1]!, match[2]!] as const, through = match[3]!;
  const allowed = rim(p).filter(v => !ends.includes(v.id) && !toward(p, ends, through).some(w => w.id === v.id));
  expect(allowed.length).toBeGreaterThanOrEqual(2);
  await expect(work(page).locator('[data-circle-observation]')).toBeHidden();
  await expect(button(page, 'Tarkista merkinnät')).toBeDisabled();
  await menu(page, 'Ensimmäinen havaintopaikka').selectOption(allowed[0]!.id);
  await menu(page, 'Puoliympyrän välipiste').selectOption(through);
  await input(page, 'Ennustettu keskuskulma').fill('180');
  await input(page, 'Ennustettu kehäkulma').fill('90');
  await button(page, 'Lukitse kulmaennuste').press('Enter');
  await expect(input(page, 'Ennustettu kehäkulma')).toBeDisabled();
  await expect(menu(page, 'Puoliympyrän välipiste')).toBeDisabled();
  await expect(work(page).locator('[data-circle-observation]')).toContainText(`${allowed[0]!.id}: 90°`);
  await menu(page, 'Toinen havaintopaikka').selectOption(allowed[1]!.id);
  await expect(work(page).locator('[data-circle-observation]')).toContainText(`${allowed[1]!.id}: 90°`);
  return { p, allowed, ends, through };
}

test.describe('Ympyräobservatorion tehtävät', () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, type: string, ...args: unknown[]) {
        return /^webgl/.test(type) ? null : Reflect.apply(get, this, [type, ...args]);
      } as typeof get;
    });
  });

  test('rejects a centre-to-interior segment then constructs radii with guided support', async ({ page }) => {
    await open(page, 'M79-CIRCLE-RADIUS');
    async function fill(wrong: boolean) {
      const p = await points(page), origin = p.find(v => v.place === 'centre')!, inner = p.find(v => v.place === 'inside')!;
      await pair(page, 'Säde 1', [origin.id, wrong ? inner.id : rim(p)[0]!.id]);
      await pair(page, 'Säde 2', [rim(p)[1]!.id, origin.id]);
      const value = (await page.locator('[data-circle-givens]').innerText()).match(/säde (\d+)/)![1]!;
      await input(page, 'Säde 1, pituus').fill(value); await input(page, 'Säde 2, pituus').fill(value);
      if (await menu(page, 'Onko luonnos oikein?').isVisible()) {
        const draft = work(page).locator('line[stroke-dasharray="5 4"]').first();
        const ends = await draft.evaluate((element, positions) => ['1', '2'].map(i => positions.find(v =>
          v.x === Number(element.getAttribute('x' + i)) && v.y === Number(element.getAttribute('y' + i)))!), p);
        await menu(page, 'Onko luonnos oikein?').selectOption(ends.some(v => v.place === 'centre') && ends.some(v => v.place === 'rim') ? 'yes' : 'no');
      }
    }
    await fill(true);
    const privateText = 'tähän vahingossa kirjoitettu viesti';
    await input(page, 'Säde 1, pituus').fill(privateText);
    await finish(page, false);
    const rejected = await evidence(page);
    expect(rejected.events).toEqual([]);
    expect(JSON.stringify(rejected)).not.toContain(privateText);
    expect(JSON.parse(rejected.attempts.at(-1).resp).values[0]).toBe('');
    await button(page, 'Näytä ja selitä').click();
    await button(page, 'Uusi yhteinen kokeilu').click();
    await fill(false); await finish(page, true);
    expect((await evidence(page)).attempts.at(-1)).toMatchObject({ phase: 'guided', ok: true });
  });

  test('adds every boundary edge from the artwork and closes in reverse order', async ({ page }) => {
    await open(page, 'M79-CIRCLE-CIRCUMFERENCE-CONCEPT', 7);
    if ((await snapshot(page)).family.includes('repair')) await open(page, 'M79-CIRCLE-CIRCUMFERENCE-CONCEPT', 1);
    expect((await snapshot(page)).family).toBe('trace-closed-boundary');
    const p = rim(await points(page)).sort((a, b) => b.degrees - a.degrees);
    const route = [...p, p[0]!];
    for (const [i, target] of route.entries()) {
      const next = menu(page, 'Seuraava reunamerkki');
      if (i === 0) {
        await next.focus();
        await work(page).locator(`[data-circle-point="${target.id}"] circle`).nth(1).click();
        await expect(next).toHaveValue(target.id);
      } else await next.selectOption(target.id);
      await button(page, 'Lisää kehälle').press('Enter');
    }
    await expect(work(page).locator('[data-circle-route]')).toContainText(route.map(p => p.id).join(' → '));
    await finish(page, true);
  });

  test('constructs the major arc, then compares the opposite-side inscribed angle', async ({ page }) => {
    for (const seed of [1, 7]) {
      await open(page, 'M79-INSCRIBED-CENTRAL-REL', seed);
      if ((await snapshot(page)).family.startsWith('double')) break;
    }
    const match = (await text(page)).match(/kaari kulkee (\w)–(\w)–(\w)\./)!;
    const p = await points(page), ends = [match[1]!, match[3]!] as const, through = match[2]!;
    const sameSide = toward(p, ends, through), other = rim(p).filter(v => !ends.includes(v.id) && !sameSide.includes(v));
    const v = other.at(-1)!.id, sweep = arcLength(p, ends, through);
    expect(sweep).toBeGreaterThan(180);
    await menu(page, 'Kulman kärki').selectOption(v); await pair(page, 'Kulman kyljet', [ends[1], ends[0]]);
    await menu(page, 'Kulman kaaren välipiste').selectOption(sameSide.find(p => p.id !== through)!.id);
    await input(page, 'Keskuskulman asteluku').fill(String(sweep));
    await input(page, 'Kehäkulman asteluku').fill(String(angle(p, ends, v)));
    await menu(page, 'Toisen kaaren välipiste').selectOption(v);
    await input(page, 'Toisen kehäkulman asteluku').fill(String(angle(p, ends, through)));
    await finish(page, true);
  });

  test('distinguishes sector area from its boundary and records a new successful trial', async ({ page }) => {
    await open(page, 'M79-SECTOR');
    await fillMeasure(page, true, true); await finish(page, false);
    await button(page, 'Uusi kokeilu').click();
    await fillMeasure(page, true); await finish(page, true);
  });

  test('keeps three fresh area cases separate from the locked scaling transfer', async ({ page }) => {
    await open(page, 'M79-CIRCLE-AREA');
    const keys = new Set<string>();
    for (let round = 0; round < 4; round++) {
      if (round === 3) {
        expect((await snapshot(page)).phase).toBe('transfer');
        await expect(work(page).locator('[data-circle-calculation]')).toBeHidden();
        await expect(work(page).locator('[data-circle-original-radius]')).toHaveCount(0);
        await expect(button(page, 'Tarkista merkinnät')).toBeDisabled();
        await input(page, 'Ennustettu pinta-alan kerroin').fill('4');
        await button(page, 'Lukitse alan ennuste').press('Enter');
        await expect(input(page, 'Ennustettu pinta-alan kerroin')).toBeDisabled();
        const ratio = await work(page).locator('svg').first().evaluate(svg =>
          Number(svg.querySelector('circle')?.getAttribute('r')) / Number(svg.querySelector('[data-circle-original-radius]')?.getAttribute('r')));
        expect(ratio).toBe(2);
      }
      await fillMeasure(page, true, false, round === 3);
      await finish(page, true);
      const attempt = (await evidence(page)).attempts.at(-1);
      keys.add(attempt.itemKey);
      if (round < 2) await button(page, 'Seuraava kokeilu').click();
      if (round === 2) await button(page, 'Kokeile uudessa tilanteessa').click();
    }
    expect(keys.size).toBe(4);
    expect((await snapshot(page)).progress.checked).toBe(true);
    expect((await evidence(page)).events).toEqual([expect.objectContaining({ node: 'M79-CIRCLE-AREA', assisted: false })]);
  });

  test('locks Thales prediction before moving the vertex and proves a contrasting angle', async ({ page }) => {
    await open(page, 'M79-THALES');
    const { p, allowed } = await prepThales(page);
    if (await menu(page, 'Sopiiko luonnoksen kärki?').isVisible()) {
      const candidate = (await text(page)).match(/Sopiiko (\w)\?/)![1]!;
      await menu(page, 'Sopiiko luonnoksen kärki?').selectOption(allowed.some(p => p.id === candidate) ? 'yes' : 'no');
    }
    const match = (await text(page)).match(/Vertailujänne (\w)–(\w), kärki (\w)\./)!;
    const ends = [match[1]!, match[2]!] as const, vertex = match[3]!;
    const measured = angle(p, ends, vertex);
    expect(measured).not.toBe(90);
    const via = rim(p).find(v => !ends.includes(v.id) && v.id !== vertex && arcLength(p, ends, v.id) === measured * 2)!;
    await menu(page, 'Vertailukaaren välipiste').selectOption(via.id);
    await input(page, 'Vertailun keskuskulma').fill(String(measured * 2));
    await input(page, 'Vertailun kehäkulma').fill(String(measured));
    await finish(page, true);
  });

  for (const [name, viewport] of [['desktop', { width: 1366, height: 768 }], ['tablet', { width: 768, height: 1024 }]] as const) {
    test(`all 28 families keep their drawing and controls visible on ${name}`, async ({ page }, info) => {
      test.setTimeout(110_000);
      await page.setViewportSize(viewport);
      const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
      for (const id of ids) {
        const families = new Set<string>();
        for (const seed of [1, 7]) {
          await open(page, id, seed);
          families.add((await snapshot(page)).family);
          if (id === 'M79-THALES') await prepThales(page);
          await expect(page.locator('[data-circle-givens]'), id).toBeInViewport({ ratio: 1 });
          await expect(work(page), id).toBeInViewport({ ratio: 1 });
          for (const control of await work(page).locator('input:visible,select:visible,button:visible').all()) {
            const box = (await control.boundingBox())!;
            expect(box.height, id).toBeGreaterThanOrEqual(44);
            expect(box.width, id).toBeGreaterThanOrEqual(44);
          }
        }
        expect(families.size, id).toBe(2);
        if (['M79-CIRCLE-BASIC', 'M79-INSCRIBED-CENTRAL-REL', 'M79-THALES'].includes(id))
          await page.screenshot({ path: info.outputPath(`${id}-${name}.png`) });
      }
      expect(errors).toEqual([]);
    });
  }
});
