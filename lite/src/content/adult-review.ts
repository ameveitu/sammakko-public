import type { Task } from '../engine/types';

/** Adult review is opt-in. Off (the default), a task's attached adult-observed explanation is left out,
 *  so the automatically checked part decides the answer. Pure explanation tasks keep their own form;
 *  the UI turns them into a self-check that never counts as independent evidence. */
export function withoutAdultReview<T extends Task>(task: T): T {
  if (task.kind === 'observed-explanation' || !Object.hasOwn(task, 'review')) return task;
  const { review: _review, ...rest } = task as T & { review?: unknown };
  return rest as T;
}

export const hasAdultReview = (task: Task) => task.kind === 'observed-explanation' || (Object.hasOwn(task, 'review') && (task as { review?: unknown }).review !== undefined);
