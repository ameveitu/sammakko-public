# Closed-subgraph Lite MVP acceptance

These are implementation requirements, not claims that the new game already exists. Structural reference verification and actual runtime/content acceptance are separate.

## Deliverables

- Runnable Lite source/branch and production build.
- README with audience, actual curriculum count, entry assumptions and save behavior.
- One coverage row for every ID in the final manifest.
- Canonical closure and task-coverage reports, including reasons for additions.
- Sol integration note with consumed material/revisions and pending content.
- Actual representative browser QA evidence and screenshots.
- Feedback export and a participant first-impressions template.
- Final status distinguishing completed implementation, remaining gaps and feedback not yet collected.

## Coverage report

Columns: KC ID; original-seed/addition status; inclusion reason; content source/revision; region/chapter; learner objective; task/domain; activity family; help/example; direct check or bounded observable outcome; wrong-answer feedback; replay; world consequence; contextual skill uses; verification status; limitations.

Every included ID appears exactly once. No title, stub, automatic demo completion or unreviewed placeholder counts as a completed lesson. A co-taught KC may reuse an interaction, but needs an explicit teaching/checking path appropriate to that KC.

## Closure and content

- Preserve every original107 ID.
- Reproduce the recommended manifest and its recursive required/strong canonical closure.
- Every required/strong relationship of every included node resolves inside the set; no external “assumed” mathematical support remains.
- Preserve relation types, prerequisite-group semantics, entry roles, dynamic rules and safety metadata.
- Keep activity-specific coverage relationships separate from canonical prerequisite edges; incidental story content does not create a skill requirement.
- Closure membership does not automatically award inferred knowledge, especially across representation/process support or operational-safety edges.
- Instantiate every dynamic rule using actual task families and named in-scope skills.
- Review every admitted generator family and its parameter range for unprovided concepts or operations.
- New justified dependencies enter the manifest with their required/strong closure; do not suppress them to hold a count.
- No unnecessary advanced demand is introduced merely by a decorative game mechanic.
- Topic registry, progress denominators, world navigation and lesson content agree with the manifest.

Canonical graph closure does not independently prove pedagogical completeness. Show both the structural result and the per-family content audit. The bundled verifier checks the supplied planning inputs; verify the actual changed runtime separately.

## Semantic checks

For objectively checkable tasks, check correct answers independently of the same answer field/checker when meaningful. For process/reflection activities, verify feedback against an explicit observable outcome without inventing a uniquely correct personal response. Review valid alternatives, zero, signs, repeated digits, equal values, fractions, decimal division, units, graph axes and supported parameter bounds.

Verify that the intended skill is exercised, the interface does not supply what it calls independent evidence, and feedback explains the relevant error. Task labels alone do not establish transfer or mastery.

A response about tool safety or selecting an instrument must not be reported as observed physical tool-use competence.

## Decisive learner journeys

| Scenario | Acceptance |
| --- | --- |
| New child starts | Understandable purpose, usable activity, feedback and continuation |
| Knowledgeable learner opens advanced topic | Direct challenge without compulsory prerequisite replay |
| Advanced challenge succeeds | Direct result recorded; inferred ancestors remain distinct |
| Check skipped/deferred | Access remains; no fabricated pass and no automatic “weak” label |
| Guided activity succeeds | World/activity progress may be earned; support recorded |
| One mistake | Local feedback, no broad diagnosis |
| Repeated specific difficulty | Relevant optional support/retry/later; no forced repair loop |
| Support detour | Full support lesson and direct return to original topic |
| Completed lesson replayed | Real new practice and new attempts |
| Later check fails then immediate retry succeeds | Practice/recovery, not new delayed-retention evidence |
| Earlier success followed by trouble | History retained and recent difficulty recorded |
| Region changes | Clear navigation, no pretend learner-profile switch |
| Reload | World state, progress and deferred choices persist |
| Corrupt/unavailable storage | Usable truthful fallback |
| Confusing item reported | Reproducible task identity and material revision |

## World and ordinary usability

Each region has a purpose, short quests, meaningful interaction and persistent visible changes. Added support nodes are discoverable; the product is not only a technical graph with reward overlays.

Test ordinary mouse/touch use at 1280×900 and390×844, with readable text, usable controls, no blocking horizontal overflow or runtime errors, brief skippable dialogue and clear return paths. Quiet mode behaves consistently.

Comprehensive screen-reader, keyboard-only, non-reader and disability-accommodation demonstrations are outside this MVP's acceptance. Preserve existing useful controls and ordinary product quality.

## Build and handoff

Use current repository scripts and locked dependencies. The audited snapshot used `npm run check` and `npm run build`; verify current commands. Add targeted tests for progress/evidence changes, closure and risky task domains. Avoid a redundant test suite that merely mirrors implementation.

Hide time-travel/debug controls in the ordinary build. Do not merge synthetic attempts into human reports. Describe only environments and journeys actually tested.

Report human feedback as not yet collected, collected with described participants, or incorporated with linked observations. Pilot-ready can be delivered without participants; student-tested, teacher-approved and efficacy claims require corresponding evidence.

