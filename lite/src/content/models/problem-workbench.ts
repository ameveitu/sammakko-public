export interface ProblemContentContext {
  title: string;
  skills: readonly string[];
}

type Role = 'given' | 'question' | 'unused';
type Finding = 'short' | 'fits' | 'surplus';
export interface SortProblem {
  mode: 'sort';
  cards: readonly { text: string; role: Role }[];
  unknowns: readonly string[];
  unknown: number;
}
export interface TrialProblem {
  mode: 'trial';
  startingCount: number;
  unitsPerPiece: number;
  fixedUnits: number;
  targetUnits: number;
  piece: string;
  unit: string;
}
export interface StrategyProblem {
  mode: 'strategy';
  methods: readonly {
    label: string;
    steps: readonly { label: string; unit: string }[];
    plan?: { fixed: number; perStep: number; unit: string };
  }[];
  reasons: readonly string[];
  correct: number;
  amounts: readonly number[];
  reason: number;
}
export interface EstimateProblem {
  mode: 'estimate';
  anchors: string;
  ranges: readonly (readonly [number, number])[];
  bounds: readonly [number, number];
  proposed: number;
  unit: string;
}
export interface RepairProblem {
  mode: 'repair';
  chain: readonly string[];
  firstFault: number;
  left: number;
  right: number;
  correctSign: '+' | '−' | '×' | '÷';
  unit: string;
}
export interface RepresentProblem {
  mode: 'represent';
  medium: 'stone' | 'tile' | 'point' | 'square';
  parts: readonly { label: string; count: number }[];
}

type Problem = SortProblem | TrialProblem | StrategyProblem | EstimateProblem | RepairProblem | RepresentProblem;
export type ProblemWorkbenchTask = Problem & {
  kind: 'problem-workbench';
  context: ProblemContentContext;
  givens: readonly { label: string; value: string }[];
};

type Evidence =
  | { mode: 'sort'; roles: (Role | null)[]; unknown: number }
  | { mode: 'trial'; first: number; finding: Finding | null; second: number }
  | { mode: 'strategy'; method: number; steps: number[]; reason: number }
  | { mode: 'estimate'; range: number; comparison: Finding | null }
  | { mode: 'repair'; step: number; sign: RepairProblem['correctSign'] | null; value: number }
  | { mode: 'represent'; groups: { part: number; marks: number }[] };
export type ProblemWorkbenchResponse = Evidence & { kind: 'problem-workbench' };

export const trialUnits = (task: TrialProblem, pieces: number) => task.fixedUnits + task.unitsPerPiece * pieces;
export const compareTo = (value: number, lower: number, upper = lower): Finding => value < lower ? 'short' : value > upper ? 'surplus' : 'fits';

const response = <T extends Evidence>(value: T): T & { kind: 'problem-workbench' } => ({ kind: 'problem-workbench', ...value });
const no = (why: string) => ({ ok: false, why });
const yes = { ok: true };
const boundedCount = (value: number) => Number.isSafeInteger(value) && value >= 0 && value <= 24;
const repairedValue = (task: RepairProblem) => {
  const { left, right, correctSign } = task;
  switch (correctSign) {
    case '+': return left + right;
    case '−': return left - right;
    case '×': return left * right;
    case '÷': return left / right;
  }
};

export function checkProblemWorkbench(task: ProblemWorkbenchTask, answer: ProblemWorkbenchResponse): { ok: boolean; why?: string } {
  switch (task.mode) {
    case 'sort': {
      if (answer.mode !== 'sort' || !Array.isArray(answer.roles) || answer.roles.length !== task.cards.length ||
          !task.cards.every(({ role }, index) => answer.roles[index] === role)) {
        return no('Tarkista taskut. Annettu tieto auttaa ratkaisemaan. Kysymys kertoo, mitä etsitään.');
      }
      return answer.unknown === task.unknown ? yes : no('Merkitse etsittävä määrä. Sen arvo selviää vasta myöhemmin.');
    }
    case 'trial': {
      if (answer.mode !== 'trial' || answer.first !== task.startingCount) return no('Rakenna ensin luonnoksen määrä ja tee siitä koehavainto.');
      const firstUnits = trialUnits(task, answer.first);
      if (answer.finding !== compareTo(firstUnits, task.targetUnits)) {
        return no(`Ensimmäinen koe antoi ${firstUnits} ${task.unit}. Vertaa sitä tavoitteeseen ${task.targetUnits} ${task.unit}.`);
      }
      return boundedCount(answer.second) && trialUnits(task, answer.second) === task.targetUnits
        ? yes : no('Muuta suunnitelmaa koehavainnon suuntaan ja sovita uusi määrä tavoitteeseen.');
    }
    case 'strategy':
      if (answer.mode !== 'strategy' || answer.method !== task.correct) return no('Valitse tapa, jolla tavoite ja toimitusehto voivat toteutua.');
      if (!Array.isArray(answer.steps) || answer.steps.length !== task.amounts.length ||
          !task.amounts.every((amount, index) => answer.steps[index] === amount)) {
        return no('Tarkista valitsemasi tavan ratkaiseva askel työpöydän määristä.');
      }
      return answer.reason === task.reason ? yes : no('Liitä toteutus juuri siihen ehtoon, joka tässä toimituksessa pitää täyttää.');
    case 'estimate': {
      if (answer.mode !== 'estimate') return no('Tee ensin arvioalue mittakaava-ankkureista.');
      const range = task.ranges[answer.range];
      if (!range || range[0] !== task.bounds[0] || range[1] !== task.bounds[1]) {
        return no('Yhdistä annetut alarajat keskenään ja ylärajat keskenään. Niistä saat arvioalueen.');
      }
      return answer.comparison === compareTo(task.proposed, ...range) ? yes : no('Vertaa ehdotusta arvioalueen molempiin päihin.');
    }
    case 'repair':
      if (answer.mode !== 'repair' || answer.step !== task.firstFault) return no('Etsi ensimmäinen vaihe, jossa suunta tai perustelu muuttuu. Tarkista vaiheet alusta.');
      return answer.sign === task.correctSign && answer.value === repairedValue(task)
        ? yes : no('Korjaa juuri tuo vaihe. Valitse laskutoimitus, joka kuvaa tilannetta, ja tee se.');
    case 'represent':
      if (answer.mode !== 'represent' || !Array.isArray(answer.groups) || answer.groups.length !== task.parts.length ||
          new Set(answer.groups.map(group => group?.part)).size !== task.parts.length ||
          !answer.groups.every(group => group && Number.isSafeInteger(group.part) && boundedCount(group.marks) &&
            task.parts[group.part]?.count === group.marks)) {
        return no('Tarkista, että jokaiselle tilanteen osalle on oma nimetty mallin osa ja oikea määrä merkkejä.');
      }
      return yes;
  }
}

export function solutionProblemWorkbench(task: ProblemWorkbenchTask): ProblemWorkbenchResponse {
  switch (task.mode) {
    case 'sort': return response({ mode: 'sort', roles: task.cards.map(card => card.role), unknown: task.unknown });
    case 'trial': return response({
      mode: 'trial', first: task.startingCount, finding: compareTo(trialUnits(task, task.startingCount), task.targetUnits),
      second: (task.targetUnits - task.fixedUnits) / task.unitsPerPiece,
    });
    case 'strategy': return response({ mode: 'strategy', method: task.correct, steps: [...task.amounts], reason: task.reason });
    case 'estimate': return response({
      mode: 'estimate', range: task.ranges.findIndex(([lo, hi]) => lo === task.bounds[0] && hi === task.bounds[1]),
      comparison: compareTo(task.proposed, ...task.bounds),
    });
    case 'repair': return response({ mode: 'repair', step: task.firstFault, sign: task.correctSign, value: repairedValue(task) });
    case 'represent': return response({ mode: 'represent', groups: task.parts.map(({ count }, part) => ({ part, marks: count })) });
  }
}

export function wrongProblemWorkbenchResponses(task: ProblemWorkbenchTask): ProblemWorkbenchResponse[] {
  const right = solutionProblemWorkbench(task);
  switch (right.mode) {
    case 'sort': return [
      { ...right, roles: right.roles.map((role, index) => index === 0 ? null : role) },
      { ...right, unknown: -1 },
    ];
    case 'trial': return [{ ...right, finding: 'fits' }, { ...right, second: right.first }];
    case 'strategy': return [{ ...right, method: -1 }, { ...right, steps: [] }, { ...right, reason: -1 }];
    case 'estimate': return [{ ...right, range: -1 }, { ...right, comparison: null }];
    case 'repair': return [{ ...right, step: -1 }, { ...right, sign: null }];
    case 'represent': return [
      { ...right, groups: right.groups.map(group => ({ ...group, part: 0 })) },
      { ...right, groups: right.groups.map((group, index) => index ? group : { ...group, marks: group.marks + 1 }) },
    ];
  }
}
