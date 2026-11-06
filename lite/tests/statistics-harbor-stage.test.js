import { Group } from 'three';
import { describe, expect, it } from 'vitest';
import { statisticsHarborSpecs } from '../src/content/statistics-harbor';
import { statisticsHarborScene } from '../src/content/models/statistics-harbor-scene';
import { solutionStatisticsHarbor } from '../src/content/models/statistics-harbor';
import { drawStatisticsHarbor } from '../src/world/statistics-harbor-stage';
import { rng } from '../src/engine/rng';

describe('observation harbor scene', () => {
  it('draws every station, then updates planned and visited markers without sending values to the scene', () => {
    const task = statisticsHarborSpecs.find(node => node.id === 'M79-DATA-COLLECT').item(rng(9), 'transfer').task;
    const initial = statisticsHarborScene(task);
    const group = new Group();
    const original = drawStatisticsHarbor(group, initial);
    expect(original.sites).toHaveLength(3);
    expect(original.sites.every(site => site.planned === 0 && site.collected === 0)).toBe(true);
    for (const site of task.sites) {
      const mesh = group.getObjectByName('observation-site-' + site.id);
      expect([mesh.position.x, mesh.position.z]).toEqual([site.x, site.z]);
    }
    const plan = solutionStatisticsHarbor(task);
    const [visited] = plan.plan;
    const input = { ...plan, visits: { [visited]: plan.visits[visited] } };
    const updated = statisticsHarborScene(task, input);
    const changed = new Group();
    const projection = drawStatisticsHarbor(changed, updated);
    expect(projection.sites.reduce((n, site) => n + site.planned, 0)).toBe(4);
    expect(projection.sites.reduce((n, site) => n + site.collected, 0)).toBe(1);
    expect(projection.sites.find(site => site.active).id).toBe(visited[0]);
    expect(JSON.stringify(projection)).not.toContain(plan.visits[visited]);
    expect(JSON.stringify(updated)).not.toContain(plan.visits[visited]);
  });
});
