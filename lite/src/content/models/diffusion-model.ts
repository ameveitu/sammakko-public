/** Closed one-dimensional lattice. Each step retains 1/2 and sends 1/4 each way.
 * At either wall the outward share stays in that edge cell (reflecting boundary).
 * This is a model of an ensemble, not a numerical measurement of a real sample. */
export function diffuse(counts: readonly number[], steps: number): number[] {
  if (!counts.length || !Number.isInteger(steps) || steps < 0 || counts.some(n => !Number.isFinite(n) || n < 0)) throw new RangeError('Invalid closed diffusion state');
  let current = [...counts];
  for (let t = 0; t < steps; t++) {
    const next = Array<number>(current.length).fill(0);
    for (let i = 0; i < current.length; i++) {
      const amount = current[i]!;
      next[i]! += amount / 2;
      next[Math.max(0, i - 1)]! += amount / 4;
      next[Math.min(current.length - 1, i + 1)]! += amount / 4;
    }
    current = next;
  }
  return current;
}
/** A marked individual can move in either direction; an outward step reflects at the wall. */
export function moveMarked(index: number, direction: -1 | 1, cells: number): number {
  if (!Number.isInteger(cells) || cells < 1 || !Number.isInteger(index) || index < 0 || index >= cells) throw new RangeError('Invalid marked particle');
  return Math.max(0, Math.min(cells - 1, index + direction));
}
