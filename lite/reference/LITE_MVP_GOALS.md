# Sammakko Lite closed-subgraph MVP goals

## Outcome

Deliver an enjoyable, freely explorable Finnish-language learning adventure whose selected curriculum is complete down to its declared pedagogical roots. Start from Lite's existing 107 KCs and include every required and strong prerequisite recursively, together with the additional skills actually used or taught in the shipped activities and their supporting closure.

The count follows the curriculum. Do not preserve 107 by omitting strong relationships, assuming missing mathematics, weakening canonical dependencies or narrowing existing lessons solely to fit that number.

A child in the intended audience can choose a topic, learn or demonstrate something through meaningful interaction, receive useful feedback, see a consequence in the world and continue at a suitable pace. A knowledgeable child can jump ahead. Earlier skills may remain unchecked or provisionally inferred without becoming compulsory remedial work.

## Audience

Lite MVP serves children who can already read ordinary Finnish lowercase instructions, understand concise written task directions and use familiar browser-game controls by touch or mouse. Reading comprehension and ordinary device use are explicit entry assumptions, not evidence that the mathematical skills are already known.

Required instructions and feedback work as written text. Optional existing narration may remain, but a Finnish speech voice is not required.

Special-support teaching, non-reader pathways, disability accommodations and demonstrations or certification of comprehensive accessibility are outside this MVP. Do not import the earlier accessibility audit as a release gate. Preserve useful existing controls and readable text, contrast and practical touch targets as ordinary product quality. Full Sammakko can later provide additional means and methods.

Child-facing language is Finnish; engineering handoffs may be English. Describe Lite as an exploratory lesson/game pilot for this audience, not a validated whole-curriculum diagnostic instrument.

## Curriculum and completeness

The recommended starting manifest has **177 KCs: 145 mathematics, 21 physics and 11 science**. It retains all 107 current nodes and adds 70 supporting nodes. The all-typed required/strong canonical closure alone is 141; explicit coverage of skills used or taught in the current activities expands that to 177 after their dependencies are closed. All seven canonical foundation entries are present. These counts are verified against the frozen candidate catalogue; teaching quality and actual playable coverage remain implementation acceptance work.

### Two closures

First compute canonical closure: recursively follow every incoming relation with strength `required` or `strong`, preserving its type. Include prerequisite, representation-support, process-support and operational-safety relationships present in the source. Checking only edges literally named `prerequisite` leaves some strong supports outside the product.

Then account for activity content: inspect instructions, representations, answer formats, arithmetic, examples and transfer tasks. If a shipped activity uses or explicitly teaches another canonical skill, record that relationship in an activity-level coverage map and include an appropriate lesson/support activity for that KC. Recompute its canonical required/strong ancestors. Include a KC when participation actually assumes its knowledge, the activity deliberately teaches it, or a response meaningfully exercises it. An incidental story word, picture or event does not by itself create KC coverage or a dependency.

Keep these records separate. A comparison or addition activity embedded in a lesson about fractions does not justify rewriting the canonical graph to make a downstream addition KC a global prerequisite of the fraction concept. It does justify explicit content coverage and honest interpretation of the activity.

The frozen proposed set and reasons are in `reference/mvp-scope.json` and the scope report. This is the implementation baseline. A justified new task dependency may enlarge it; an arbitrary numeric target may not shrink it.

### What completion means

Every node in the agreed manifest has a complete playable learning activity with relevant help, feedback and a bounded check or observable outcome. Every canonical required/strong dependency resolves inside the manifest. Dynamic rules are instantiated against actual task families, not ignored because they are not fixed graph edges.

For example, an equation family that requires signed division needs the signed-division content. A speed conversion using division by 3.6 needs decimal arithmetic, not merely a decimal-reading lesson. A generic connection-making activity can use two specified in-scope concepts; it does not require every possible pair in the 690-node catalogue.

Review the newly added lessons for their own task demands as they are authored. Simplify irrelevant game-mechanic complexity when that would otherwise introduce an unnecessary dependency. Do not remove a relevant mathematical capability just to keep the scope count small.

Declared domain entries, dynamic entries and operational entries are not all general pedagogical foundations. Preserve their canonical roles, and specify the in-scope contexts for dynamic activities. The game can be one coherent world without pretending its curriculum is a single rooted tree.

A complete product manifest is distinct from comprehensive validation of the curriculum theory. The source catalogue is a candidate baseline; real pedagogical review and participant feedback still matter.

### Availability does not force sequence

Both required and strong relations determine which supporting lessons must exist in Lite. They do not automatically become navigation locks or mandatory checks for each child.

Preserve required/strong distinctions for recommendations and explanations. A successful advanced learner can continue while ancestors remain unchecked or inferred. Every supporting lesson is directly reachable and can be offered when useful. Earlier-world teaching remains available even when a quick foundation check provides a shortcut.

### Safety node

Include the operational safety node brought in by the closure. It can be taught through short on-screen situations about following given instructions and recognizing when to ask for adult help. The MVP remains virtual-only and does not certify physical tool-use competence or assign real experiments.

A virtual response is evidence of that response. Do not turn a knowledge-inference shortcut into a claim that a real-world operational safety condition has been satisfied.

## Playable world and story

Build on Rantaretki, Aarresaaristo, Lampilaboratorio and the Loikka/Aava setting. Improve the existing lightweight application instead of beginning an unrelated engine or narrative.

Choose one understandable purpose for the adventure. Restoring the pond's routes and research stations is one possible direction. Opus can choose a better coherent direction grounded in the existing world.

Each region needs a local purpose, short quest arcs, discoverable places, a recognizable visual identity and persistent visible consequences. Activities can restore equipment, construct something, gather observations or change a location. Keep dialogue brief and skippable, and make the next action clear.

The new supporting lessons can become workshops, side activities and optional detours within the existing regions. They must be discoverable and meaningful, not an invisible pile of remedial worksheets. They do not each need a new chapter or bespoke story scene.

Use a small number of reusable interaction families: arranging, grouping, counting, comparing, measuring, manipulating quantities/balances, working with tables and plotting or interpreting representations. A multiple-choice task is appropriate when the response actually exercises the skill. The target is not one custom engine per KC.

Direct topic selection and suggested quests both work. Do not render every prerequisite relation as a mandatory locked road. Once a topic is selected, its fast route should normally reach the first direct challenge within two navigation actions. Explanation, guided practice and celebration must not slow every knowledgeable learner.

Rewards and world changes may reflect activity completion. They must not create knowledge evidence for unplayed nodes. Progress denominators, navigation and coverage reports read the manifest; do not hardcode 107 or any later count throughout the application.

## Complete lesson definition

A node is complete when it has:

1. A concise learner-facing objective and meaningful reason to act.
2. A useful explanation/example available through its learning/help route.
3. A meaningful action exercising the intended skill.
4. Correct answer handling and useful error feedback for objectively checkable tasks; for process/reflection activities, feedback tied to an explicit observable outcome without inventing a uniquely correct personal response.
5. An appropriate direct check or accurately bounded observable outcome for a process/operational activity.
6. Working replay/practice.
7. A world-progress contribution and clean continuation/return.
8. Stable KC/material/task identifiers and explicit supported task domains.

Existing sound material may be reused. Sol's new material can replace or improve it in batches. Reusing one activity family is welcome; reusing an activity without ensuring it exercises the new KC is not sufficient.

If an activity supplies the answer, classify it as supported practice or change the interaction. A task tagged “transfer” must genuinely ask for a relevant new application; a different random number alone is not enough.

## Lightweight progress and voluntary gaps

Keep activity history, direct observations and routing assumptions separate.

| Information | Meaning | Use |
| --- | --- | --- |
| Activity history | Played, completed or replayed | Rewards, world changes and resume |
| Direct observations | A particular response/check, with or without help | Honest summary and targeted assistance |
| Routing assumptions | Why proceeding seems reasonable | Inferred placement and fast navigation |

A deferred check means “left for later,” not “weak.” Inference cites a downstream success supporting continued exploration; it is not an independent demonstration of all ancestors. Inclusion in the required/strong closure does not itself justify inference. Do not automatically propagate inferred progress over every strong representation/process support or operational-safety edge.

A compact details/adult view can distinguish not checked, practised with help, checked here, inferred, deferred and recent difficulty. The child view may use fewer labels with a clear legend.

Behavior:

- Opening or skipping never records a pass.
- Success ahead permits continuation without automatic ancestor replay.
- Unchecked, inferred or deferred status alone does not create a mandatory repair queue or override the child's route.
- One error receives local feedback; it does not diagnose an entire weak prerequisite chain.
- Repeated specific difficulty can offer one relevant support activity, retry or “later.”
- A support detour has a direct return to the original topic.
- Historical completion and world rewards can remain while later difficulty is also recorded.
- Optional later checks are dated observations. An immediate retry after failure is practice, not newly demonstrated delayed retention.

No full Sammakko learner-model migration, mastery probabilities, forgetting curves or global gap diagnosis is required.

## Opus and Sol ownership

Sol continues the full 690-KC pedagogical material and preliminary microgame suggestions. Ask that the final Lite closure be prioritized in coherent batches, without restarting or reducing the 690 task.

Sol owns objectives, explanations, domain meaning, examples, answer reasoning, misconceptions, support assumptions and activity suggestions. Opus owns the application, world/story, interaction implementations, content adapter, task submission/checking integration, local progress and feedback.

Inspect Sol's actual output format and revision conventions before building the adapter. Stable KC IDs and lesson/material revisions are the join keys. Do not impose a speculative replacement schema on work already underway. Existing NodeSpec/Item/Task/Response/check boundaries are a sensible starting point.

Runtime generators can remain in code, but their mathematical semantics must agree with the shared material. Use one response → check → record boundary; individual games must not award knowledge independently.

Use separate branches/worktrees where needed. Treat Sol's authored material and the canonical catalogues as read-only inputs. Fix obvious existing Lite content defects and document them for reconciliation; do not create a competing 690-lesson catalogue.

Proceed now using sound existing Lite content. Missing Sol batches do not block world/runtime work. Track content status separately from runtime readiness; a placeholder is not a completed lesson.

Full Sammakko is unchanged by this implementation task. Compatibility means stable pedagogical meaning and interpretable records; Lite rewards do not automatically become full-model mastery.

## Records, feedback and persistence

Use a small versioned local save. Preserve/translate existing progress conservatively, without inventing evidence for newly included nodes. Distinguish one local learner from world selection. Show a truthful session-only notice if durable storage fails.

Record KC, lesson/content revision, task family/template, per-item seed or resolved parameters, response summary/result, assistance, phase and session/time. Include route/context when needed to reproduce the task. A session seed alone is not sufficient if prior RNG calls change later items.

Provide a simple confusing-task report, adult/tester note and local export. Keep synthetic QA distinct from learner records. No accounts, cloud analytics or school administration infrastructure is needed.

Prepare a first-impressions template and short pilot protocol. Real child/teacher feedback requires actual participants; developer/agent observations must remain labelled. Feedback-ready implementation is deliverable before human feedback is collected.

## Delivery sequence

1. Reproduce the proposed closure, reconcile the current branch and Sol interface, and record actual source revisions.
2. Fix obvious correctness/progress defects and deliver a polished representative chapter with exploration, direct jump, optional support, return and a persistent world consequence.
3. Extend reusable mechanics and integrate content across the complete manifest, including all added supporting lessons.
4. Verify generator domains, concrete learner journeys, local saving and feedback. Deliver the full coverage report and runnable build.

The representative chapter is an early milestone, not the final task. Continue until the agreed complete subgraph is playable. If an external input blocks a specific item, finish unaffected work and name the exact remaining gap.

## Non-goals

Do not expand into unrelated parts of the 690-node curriculum; only the selected experience and its complete support closure are in scope. Also outside scope: full learner-model migration, comprehensive disability/accessibility demonstrations, non-reader design, global diagnosis, cloud accounts/synchronization, school/parent administration dashboards, one custom game engine per KC, a full application rewrite, public deployment and proven educational efficacy claims.

