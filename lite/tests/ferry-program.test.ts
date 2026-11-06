import { describe, expect, it } from 'vitest';
import { checkFerryGoal, firstFerryDifference, runFerryProgram, validateFerryBoard, type FerryBoard, type FerryCell, type FerryCommand } from '../src/content/models/ferry-program';

const board: FerryBoard = { width: 5, height: 4, start: { x: 1, y: 2, heading: 'east' }, rocks: [{ x: 3, y: 2 }] };

describe('discrete ferry programming world', () => {
  it('follows each command relative to the current heading and keeps an auditable trace', () => {
    const run = runFerryProgram(board, ['forward', 'left', 'forward', 'right', 'forward']);
    expect(run.steps.map(step => [step.after.x, step.after.y, step.after.heading])).toEqual([
      [2, 2, 'east'], [2, 2, 'north'], [2, 1, 'north'], [2, 1, 'east'], [3, 1, 'east'],
    ]);
    expect(run.status).toBe('complete');
    expect(checkFerryGoal(run, { destination: { x: 3, y: 1 }, heading: 'east', via: [{ x: 2, y: 2 }, { x: 2, y: 1 }] }).ok).toBe(true);
    expect(board.start).toEqual({ x: 1, y: 2, heading: 'east' });
    expect(board.rocks).toEqual([{ x: 3, y: 2 }]);
  });
  it('stops before a rock without teleporting, steering or running later commands', () => {
    const run = runFerryProgram(board, ['forward', 'forward', 'left', 'forward']);
    expect(run.status).toBe('blocked');
    expect(run.final).toEqual({ x: 2, y: 2, heading: 'east' });
    expect(run.steps).toHaveLength(2);
    expect(run.steps[1]?.outcome).toBe('rock');
    expect(checkFerryGoal(run, { destination: { x: 2, y: 2 } })).toMatchObject({ destination: true, completed: false, ok: false });
  });
  it('does not wrap the world and distinguishes a heading from a destination', () => {
    const edge: FerryBoard = { width: 2, height: 2, start: { x: 0, y: 0, heading: 'north' }, rocks: [] };
    expect(runFerryProgram(edge, ['forward']).steps[0]?.outcome).toBe('edge');
    const run = runFerryProgram(edge, ['right', 'forward']);
    expect(checkFerryGoal(run, { destination: { x: 1, y: 0 }, heading: 'south' })).toMatchObject({ destination: true, heading: false, ok: false });
  });
  it('requires ordered intermediate docks rather than any visit in any order', () => {
    const run = runFerryProgram(board, ['forward', 'left', 'forward']);
    expect(checkFerryGoal(run, { destination: { x: 2, y: 1 }, via: [{ x: 2, y: 1 }, { x: 2, y: 2 }] }).ok).toBe(false);
    const waiting = runFerryProgram(board, ['wait', 'left', 'right', 'wait']);
    expect(waiting.visited).toEqual([{ x: 1, y: 2 }]);
    expect(checkFerryGoal(waiting, { destination: board.start, via: [board.start, board.start] }).via).toBe(false);
  });
  it('tests a second initial condition instead of assuming one successful run generalizes', () => {
    const open: FerryBoard = { ...board, rocks: [] };
    const route = ['forward', 'left', 'forward'] as const;
    expect(checkFerryGoal(runFerryProgram(open, route), { destination: { x: 2, y: 1 } }).ok).toBe(true);
    const changed = { ...open, start: { ...open.start, heading: 'south' as const } };
    expect(checkFerryGoal(runFerryProgram(changed, route), { destination: { x: 2, y: 1 } }).ok).toBe(false);
  });
  it('locates the first different command even if both programs eventually return home', () => {
    const a = runFerryProgram(board, ['left', 'right']);
    const b = runFerryProgram(board, ['right', 'left']);
    expect(a.final).toEqual(b.final);
    expect(firstFerryDifference(a, b)).toBe(0);
    expect(firstFerryDifference(a, runFerryProgram(board, ['left', 'right', 'wait']))).toBe(2);
    expect(firstFerryDifference(a, a)).toBeNull();
    expect(firstFerryDifference(runFerryProgram(board, []), runFerryProgram({ ...board, start: { ...board.start, heading: 'north' } }, []))).toBe(-1);
  });
  it('bounds execution and rejects malformed author input', () => {
    const run = runFerryProgram(board, ['wait', 'wait', 'wait'], 2);
    expect(run.status).toBe('limit');
    expect(run.steps).toHaveLength(2);
    expect(checkFerryGoal(run, { destination: board.start }).ok).toBe(false);
    expect(() => validateFerryBoard({ ...board, rocks: [board.start] })).toThrow();
    expect(() => runFerryProgram(board, ['wait'], 0)).toThrow();
    expect(() => runFerryProgram(board, ['teleport' as never])).toThrow();
    expect(() => validateFerryBoard({ ...board, width: NaN })).toThrow();
  });
});

it('rejects unassigned array slots instead of treating them as an implicit wait or empty water', () => {
  const sparseProgram = Array<FerryCommand>(1);
  expect(() => runFerryProgram(board, sparseProgram)).toThrow(RangeError);
  const sparseRocks = Array<FerryCell>(1);
  expect(() => validateFerryBoard({ ...board, rocks: sparseRocks })).toThrow(RangeError);
});
