import { expect, test, type Page } from '@playwright/test';

type Snapshot = { family: string; model: { kind: string; first: [number, number, number]; second: [number, number, number]; target: string }; lastOk?: boolean };
const snapshot = (page: Page): Promise<Snapshot> => page.evaluate(() => JSON.parse(window.render_game_to_text!()));

async function begin(page: Page, id: string, seed: number) {
  await page.goto(`./?qa=1&full=1&seed=${seed}#saaristo/${id}`);
  await page.reload();
  await page.getByRole('button', { name: 'Tutkitaan yhdessä', exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Task and accessibility are also required when the 3D renderer is unavailable.
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return /^webgl/.test(type) ? null : Reflect.apply(original, this, [type, ...args]);
    } as typeof original;
  });
});

// M79-SYSTEM-GRAPH now uses the expanded relation workshop. Keep the original
// visible-givens, input and viewport guarantees on the registered route.
type Equation = [number, number, number];
const relation = (page: Page) => page.locator('[data-relation-workbench]');
async function graphCase(page: Page, negative = false) {
  for (let seed = 0; seed < 64; seed++) {
    await begin(page, 'M79-SYSTEM-GRAPH', seed);
    const equations = (await page.locator('[data-relation-equation]').allTextContents()).map(raw => {
      const [lhs, rhs] = raw.replace(/^\d+\.\s*/, '').replaceAll('−','-').replace(/\s/g,'').split('=');
      const coefficient = (v: string) => { const x = new RegExp(`([+-]?\\d*)${v}`).exec(lhs!)?.[1]; return x === undefined ? 0 : x === '-' ? -1 : x === '' || x === '+' ? 1 : Number(x); };
      return [coefficient('x'), coefficient('y'), Number(rhs)] as Equation;
    });
    const [a,b] = equations as [Equation,Equation], det = a[0]*b[1]-a[1]*b[0];
    if (!det) continue;
    const x = (a[2]*b[1]-a[1]*b[2])/det, y = (a[0]*b[2]-a[2]*b[0])/det;
    if (negative && x >= 0 && y >= 0) continue;
    await relation(page).getByRole('combobox',{name:'Suorien yhteiset pisteet'}).selectOption('one');
    return {equations:[a,b] as [Equation,Equation],x,y};
  }
  throw new Error('No requested graph case among declared generated situations');
}
async function verifyGraph(page: Page, equations: [Equation,Equation], x: number, y: number) {
  for (const [i,[a,b,c]] of equations.entries()) {
    expect(a*x+b*y).toBeCloseTo(c,8);
    await relation(page).getByRole('textbox',{name:`Vasen puoli ${i+1}`,exact:true}).fill(String(a*x+b*y));
  }
  await page.getByRole('button',{name:'Tarkista merkinnät',exact:true}).press('Enter');
  expect((await snapshot(page)).lastOk).toBe(true);
}
test('graph uses both visible conditions and accepts their keyboard-entered shared point', async ({page}) => {
  const {equations,x,y}=await graphCase(page);
  await expect(relation(page).locator('svg g[clip-path] > line')).toHaveCount(2);
  await expect(relation(page).locator('[data-relation-mark]')).toHaveCount(0);
  await relation(page).getByRole('textbox',{name:'Piste 1, x',exact:true}).fill(String(x));
  await relation(page).getByRole('textbox',{name:'Piste 1, y',exact:true}).fill(String(y));
  await expect(relation(page).locator('[data-relation-mark]')).toHaveCount(1);
  await verifyGraph(page,equations,x,y);
});

test('channel revision route now opens the v2 inquiry model workshop', async ({ page }) => {
  // The v1 slot-label revision is historical; v2 (e2e/inquiry-islands.spec.ts) covers the expanded evidence.
  await begin(page, 'SCI-ENV-MODEL-02', 1);
  await expect(page.locator('[data-inquiry-workshop="model"]')).toBeVisible();
  await expect(page.locator('[data-inquiry-editor="channel-map"]')).toBeVisible();
  await expect(page.locator('.exp-task .slot')).toHaveCount(0);
});

test('diffusion separates the observation from an accelerated illustrative model', async ({ page }) => {
  await begin(page, 'CHEM79-PARTICLE-MODEL-USE', 0);
  expect((await snapshot(page)).model.kind).toBe('diffusion-model');
  const given = page.locator('.exp-exact');
  await expect(given).toContainText('Makrohavainto');
  await expect(given).toContainText('Hiukkasmalli');
  await expect(given).toContainText('eivät valokuvia');
  await expect(given).toContainText('nopeutettu');
  await expect(given).toContainText('yhden mahdollisen simuloidun kulkureitin');
  await expect(given).toContainText('Ei oleteta nesteen tai kaasun yhteistä virtausta');
});

test('expanded graph givens and answer board fit desktop and tablet widths', async ({page}) => {
  for(const viewport of [{width:1366,height:768},{width:768,height:1024}]) {
    await page.setViewportSize(viewport);await graphCase(page);
    for(const loc of [page.locator('[data-relation-givens]'),relation(page).locator('svg'),page.getByRole('button',{name:'Tarkista merkinnät',exact:true})]) {
      const box=await loc.boundingBox();expect(box).not.toBeNull();expect(box!.y).toBeGreaterThanOrEqual(0);expect(box!.y+box!.height).toBeLessThanOrEqual(viewport.height);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(viewport.width);
  }
});

test('a tap selects the shared intersection including negative coordinates', async ({page}) => {
  const {equations,x,y}=await graphCase(page,true);
  const screen=await relation(page).locator('svg > rect').evaluate((node,{x,y})=>{
    const rect=node as SVGRectElement,svg=rect.ownerSVGElement!,p=svg.createSVGPoint();
    p.x=rect.x.baseVal.value+rect.width.baseVal.value*(x+5)/10;
    p.y=rect.y.baseVal.value+rect.height.baseVal.value*(6-y)/12;
    const screen=p.matrixTransform(svg.getScreenCTM()!);return {x:screen.x,y:screen.y};
  },{x,y});
  await page.mouse.click(screen.x,screen.y);
  expect(Number((await relation(page).getByRole('textbox',{name:'Piste 1, x',exact:true}).inputValue()).replaceAll('−','-'))).toBe(x);
  expect(Number((await relation(page).getByRole('textbox',{name:'Piste 1, y',exact:true}).inputValue()).replaceAll('−','-'))).toBe(y);
  await verifyGraph(page,equations,x,y);
});

test('legacy plot keeps its plain grid and accepts pointer and keyboard input', async ({ page }) => {
  await begin(page, 'M-COORD-02', 7);
  const board=page.getByRole('group', {name:'Koordinaatisto'});
  await expect(board.locator('.plot-reference')).toHaveCount(0);
  await board.focus(); await board.press('ArrowLeft'); await board.press('Enter');
  await expect(page.locator('.exp-task .answer-state')).toContainText('(-1; 0)');
  const point=await board.evaluate(node=>{const svg=node as SVGSVGElement,p=svg.createSVGPoint();p.x=20+5/10*(340-20-14);p.y=330-20-4/8*(330-20-30);const q=p.matrixTransform(svg.getScreenCTM()!);return {x:q.x,y:q.y}});
  await page.mouse.click(point.x,point.y);
  await expect(page.locator('.exp-task .answer-state')).toContainText('(0; 0)');
});
