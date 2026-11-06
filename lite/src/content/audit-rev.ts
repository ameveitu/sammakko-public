// Revision for lessons rebuilt in the per-lesson audit (audit/LESSON_AUDIT.md). A lesson whose
// items changed meaning gets this revision; older answers stay in the history as prior progress.
export const AUDIT_REV = 'audit1-2026-10-28';
/** Launch review: remove misconception keys that coincide with a correct value.
 * Earlier answers retain their validity; numerical tasks and their targets are unchanged. */
export const LAUNCH_REV = 'launch1-2026-11-01';
/** Review-fix revision (review L181): answers under it must also meet the production rule
 *  (NodeSpec.produce). Answers under AUDIT_REV stay valid evidence and are reported narrower. */
export const REVIEW_REV = 'review1-2026-10-29';
/** Second review round (U02, U06, U08): changed item realisations and the narrowed production rule.
 *  The rule now counts only answers the learner built, recorded, listed or calculated. Earlier answers
 *  stay valid evidence; a check earned under an older revision without such an answer is reported as
 *  recognition (NodeState.produced false). */
export const REVIEW2_REV = 'review2-2026-10-29';
/** Lighter numbers (user request 2026-11-06): smaller dividends, friendlier decimal divisors and
 *  smaller ranges in the 181 lessons. Earlier answers stay valid evidence. */
export const LIGHT_REV = 'light1-2026-11-06';
