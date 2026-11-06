import { pointId, type StatisticsHarborResponse, type StatisticsHarborTask } from './statistics-harbor';

export type StatisticsHarborScene = {
  kind: 'statistics-harbor';
  title: string;
  sites: { id: string; label: string; x: number; z: number; planned: number; collected: number; active: boolean }[];
};

export function statisticsHarborScene(task: StatisticsHarborTask, response?: StatisticsHarborResponse): StatisticsHarborScene | undefined {
  if (task.mode !== 'collect') return;
  const state = response?.mode === 'collect' ? response : undefined;
  const last = Object.keys(state?.visits ?? {}).at(-1);
  return { kind: 'statistics-harbor', title: 'Sataman havaintokartta', sites: task.sites.map(site => {
    const points = task.times.map(time => pointId(site.id, time.id));
    return { ...site, planned: points.filter(point => state?.plan.includes(point)).length,
      collected: points.filter(point => state && Object.hasOwn(state.visits, point)).length,
      active: points.some(point => point === last) };
  }) };
}
