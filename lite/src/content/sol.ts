// Sol design cards as registry annotations. They sit beside a lesson; they never replace its
// goal, intro, example or tasks. Import: node tools/import-sol.mjs <slice52_design_cards.json>.
import data from '../data/sol-annotations.json';

export interface SolCard {
  id: string; role: string; status: string;
  goal: string; example: string; task: string; expected: string; feedback: string; boundary: string;
  research: string[]; findings: string[];
  groups: ({ all: string[] } | { any: string[] })[];
  source: { path: string; line: number | null; sha256: string };
}

export const SOL_SHA: string = data.sha256;
export const SOL_CARDS: SolCard[] = data.cards as SolCard[];
const byId = new Map(SOL_CARDS.map((c) => [c.id, c]));

export const solCard = (id: string): SolCard | undefined => byId.get(id);

/** The adult's words for a card's status. Nothing here is a production approval. */
export const SOL_STATUS_TEXT: Record<string, string> = {
  deferred_design_only_not_production_authorized: 'Sol-suunnittelukortti (ei käytössä oppitunnissa)',
  existing_pack_repair_proposal: 'Sol-korjausehdotus nykyiseen oppituntiin (ei vielä tehty)',
};
