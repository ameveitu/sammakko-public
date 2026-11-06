export type ExplanationChannel = 'spoken' | 'written';
export type CriterionObservation = 'met' | 'not-yet' | 'unobserved';

export interface ObservedExplanationTask {
  kind: 'observed-explanation';
  channel: ExplanationChannel;
  /** Opt-in for new revisions whose target is the explanation, not a particular medium. */
  allowEitherChannel?: true;
  givens: readonly { label: string; value: string }[];
  prompt: string;
  rubric: readonly { id: string; label: string; guide: string }[];
  model: string;
}

export interface ObservedExplanationResponse {
  kind: 'observed-explanation';
  channel: ExplanationChannel;
  text?: string;
  observations: Partial<Record<string, CriterionObservation>>;
  confirmedByAdult: boolean;
  assistance: 'none' | 'helped';
  note?: string;
}

interface ObservationVerdict {
  ok: boolean;
  why?: string;
  pendingReview?: true;
  observedByAdult?: true;
  assisted?: true;
}

/** A person assesses meaning. The domain validates the origin and completeness of that assessment. */
export function checkObservedExplanation(task: ObservedExplanationTask, response: ObservedExplanationResponse): ObservationVerdict {
  if (!['spoken','written'].includes(response.channel) || (!task.allowEitherChannel && response.channel !== task.channel) || (response.channel === 'spoken' && response.text !== undefined)) {
    return { ok: false, pendingReview: true, why: 'Tämä havainto tarvitaan tehtävässä pyydetyllä vastaustavalla.' };
  }
  if (response.channel === 'written' && (typeof response.text !== 'string' || !response.text.trim())) {
    return { ok: false, pendingReview: true, why: 'Kirjoita ensin oma selityksesi aikuisen luettavaksi.' };
  }
  if (response.confirmedByAdult !== true || !['none', 'helped'].includes(response.assistance)) {
    return { ok: false, pendingReview: true, why: 'Aikuinen vahvistaa havainnon ja kertoo, käytettiinkö apua.' };
  }
  const observations = response.observations;
  if (!task.rubric.length || !observations || Object.keys(observations).length !== task.rubric.length ||
      !task.rubric.every(({ id }) => Object.hasOwn(observations, id) && (observations[id] === 'met' || observations[id] === 'not-yet'))) {
    return { ok: false, pendingReview: true, why: 'Havainto odottaa, kunnes aikuinen on voinut arvioida kaikki kohdat.' };
  }
  const assessor = { observedByAdult: true as const, ...(response.assistance === 'helped' ? { assisted: true as const } : {}) };
  const missing = task.rubric.find(({ id }) => observations[id] === 'not-yet');
  if (missing) return { ok: false, ...assessor, why: `Harjoitellaan vielä tätä kohtaa. ${missing.label}` };
  return { ok: true, ...assessor };
}

/** This model demonstrates an explanation. It never represents an observed attempt. */
export function solutionObservedExplanation(task: ObservedExplanationTask): ObservedExplanationResponse {
  return {
    kind: 'observed-explanation', channel: task.channel,
    observations: {}, confirmedByAdult: false, assistance: 'none',
  };
}

export function wrongObservedExplanationResponses(task: ObservedExplanationTask): ObservedExplanationResponse[] {
  const pending = solutionObservedExplanation(task);
  return [
    pending,
    {
      ...pending,
      ...(task.channel === 'written' ? { text: 'Tulos on tuossa.' } : {}),
      confirmedByAdult: true,
      observations: Object.fromEntries(task.rubric.map(({ id }, index) => [id, index ? 'met' : 'not-yet'])),
    },
  ];
}
