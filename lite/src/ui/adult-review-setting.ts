// Adult review of own explanations is opt-in (off by default) so that a learner can play alone.
// A per-device preference only; it never changes recorded evidence.
const KEY = 'sammakko-saaristo-adult-review';

export function adultReviewOn(): boolean {
  try { return localStorage.getItem(KEY) === 'on'; } catch { return false; }
}
export function setAdultReview(on: boolean): void {
  try { if (on) localStorage.setItem(KEY, 'on'); else localStorage.removeItem(KEY); } catch { /* private mode: stays off */ }
}
