/** The ferry's discrete world. Presentation time and camera orientation cannot affect a run. */
export type FerryHeading = 'north' | 'east' | 'south' | 'west';
export type FerryCommand = 'forward' | 'left' | 'right' | 'wait';
export interface FerryCell { x: number; y: number }
export interface FerryPose extends FerryCell { heading: FerryHeading }
export interface FerryBoard {
  width: number;
  height: number;
  /** Map x grows to the right and map y down; north decreases y. */
  start: FerryPose;
  rocks: readonly FerryCell[];
}
export interface FerryGoal {
  destination: FerryCell;
  heading?: FerryHeading;
  /** These docks must be visited in order. The departure cell can be the first dock. */
  via?: readonly FerryCell[];
}
export interface FerryStep {
  index: number;
  command: FerryCommand;
  before: FerryPose;
  after: FerryPose;
  outcome: 'done' | 'rock' | 'edge';
}
export interface FerryRun {
  initial: FerryPose;
  final: FerryPose;
  steps: readonly FerryStep[];
  status: 'complete' | 'blocked' | 'limit';
  visited: readonly FerryCell[];
}
export interface FerryGoalCheck {
  destination: boolean;
  heading: boolean;
  via: boolean;
  completed: boolean;
  ok: boolean;
}

const headings: readonly FerryHeading[] = ['north', 'east', 'south', 'west'];
const commands: readonly FerryCommand[] = ['forward', 'left', 'right', 'wait'];
const delta: Record<FerryHeading, FerryCell> = {
  north: { x: 0, y: -1 }, east: { x: 1, y: 0 },
  south: { x: 0, y: 1 }, west: { x: -1, y: 0 },
};
const same = (a: FerryCell, b: FerryCell) => a.x === b.x && a.y === b.y;
const integer = (n: number) => Number.isSafeInteger(n);
function inside(board: FerryBoard, cell: FerryCell): boolean {
  return integer(cell.x) && integer(cell.y) && cell.x >= 0 && cell.y >= 0 && cell.x < board.width && cell.y < board.height;
}
export function isFerryCommand(value: unknown): value is FerryCommand {
  return typeof value === 'string' && (commands as readonly string[]).includes(value);
}

/** Malformed author data is a programming error, never a learner's wrong answer. */
export function validateFerryBoard(board: FerryBoard): void {
  if (!integer(board.width) || !integer(board.height) || board.width < 1 || board.width > 12 || board.height < 1 || board.height > 12
    || !inside(board, board.start) || !headings.includes(board.start.heading)
    || Array.from(board.rocks).some(cell => !cell || !inside(board, cell) || same(cell, board.start))
    || new Set(board.rocks.map(cell => `${cell.x},${cell.y}`)).size !== board.rocks.length) {
    throw new RangeError('Invalid ferry board');
  }
}

/** No eval, randomness, real-time input, implicit steering, or wrap at an edge. */
export function runFerryProgram(board: FerryBoard, program: readonly FerryCommand[], maxSteps = 64): FerryRun {
  validateFerryBoard(board);
  if (!integer(maxSteps) || maxSteps < 1 || maxSteps > 256 || !Array.from(program).every(isFerryCommand)) throw new RangeError('Invalid ferry program');
  let pose: FerryPose = { ...board.start };
  const steps: FerryStep[] = [];
  const visited: FerryCell[] = [{ x: pose.x, y: pose.y }];
  for (let index = 0; index < program.length && index < maxSteps; index++) {
    const command = program[index]!;
    const before = { ...pose };
    let outcome: FerryStep['outcome'] = 'done';
    if (command === 'forward') {
      const movement = delta[pose.heading];
      const next = { ...pose, x: pose.x + movement.x, y: pose.y + movement.y };
      if (!inside(board, next)) outcome = 'edge';
      else if (board.rocks.some(cell => same(cell, next))) outcome = 'rock';
      else { pose = next; visited.push({ x: pose.x, y: pose.y }); }
    } else if (command === 'left' || command === 'right') {
      const turn = command === 'left' ? 3 : 1;
      pose = { ...pose, heading: headings[(headings.indexOf(pose.heading) + turn) % 4]! };
    }
    steps.push({ index, command, before, after: { ...pose }, outcome });
    if (outcome !== 'done') return { initial: { ...board.start }, final: { ...pose }, steps, visited, status: 'blocked' };
  }
  return { initial: { ...board.start }, final: { ...pose }, steps, visited, status: program.length > maxSteps ? 'limit' : 'complete' };
}

/** Reaching the right place with the wrong heading or missing a dock is a different result. */
export function checkFerryGoal(run: FerryRun, goal: FerryGoal): FerryGoalCheck {
  const destination = same(run.final, goal.destination);
  const heading = goal.heading === undefined || run.final.heading === goal.heading;
  let next = 0;
  const via = goal.via ?? [];
  for (const cell of run.visited) if (next < via.length && same(cell, via[next]!)) next++;
  const result = { destination, heading, via: next === via.length, completed: run.status === 'complete' };
  return { ...result, ok: Object.values(result).every(Boolean) };
}

/** -1 means the departure states differ; otherwise returns the first different command index. */
export function firstFerryDifference(actual: FerryRun, reference: FerryRun): number | null {
  if (!same(actual.initial, reference.initial) || actual.initial.heading !== reference.initial.heading) return -1;
  const length = Math.max(actual.steps.length, reference.steps.length);
  for (let i = 0; i < length; i++) {
    const a = actual.steps[i], b = reference.steps[i];
    if (!a || !b || a.command !== b.command || a.outcome !== b.outcome || !same(a.after, b.after) || a.after.heading !== b.after.heading) return i;
  }
  return null;
}
