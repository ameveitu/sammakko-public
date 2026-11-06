/** Locally authored visual pilot recipes. These are environmental dressing, not learning evidence. */
export const familyWorldPilots = {
  LM01: { nodeIds: ['M-TH-01', 'M-TH-02', 'M-TH-03', 'M-TH-04', 'M-TH-05', 'M-TH-06', 'M-TH-07', 'M-TH-08', 'M-WORK-01', 'M-WORK-02', 'M-WORK-03'], title: 'Kaislarannan havaintoreitti', composition: 'reed-windows', landmarks: ['reed-window','pond-ring','observation-book'] },
  LM02: { nodeIds: ["M-PS-01", "M-PS-02", "M-PS-03", "M-PS-04", "M-PS-05", "M-PS-06", "M-REP-01", "M-REP-02", "M-REP-03", "M-REP-04", "M-REP-05"], title: 'Selitysten telttakylä', composition: 'canopy-crossroads', landmarks: ['leaf-canopy','canvas-screen','shore-path'] },
  LM03: { nodeIds: ["M-NUM-01", "M-NUM-02", "M-NUM-03", "M-NUM-04", "M-NUM-05", "M-NUM-06", "M-NUM-07", "M-NUM-08", "M-NUM-09", "M-NUM-10", "M-NUM-11", "M-NUM-12", "M-NUM-13", "M-NUM-14", "M-NUM-STABLE-ORDER", "M-NUM-1TO1", "M-NUM-QTY-WORD", "M-NUM-QTY-NUMERAL", "M-NUM-WORD-NUMERAL"], title: 'Lukusanojen ruovikko', composition: 'leaf-dock', landmarks: ['leaf-dock','reed-gate','mooring-rail'] },
  LM04: { nodeIds: ["M-NUM-15", "M-NUM-16", "M-NUM-17", "M-NUM-18", "M-PLACE-01", "M-PLACE-02", "M-PLACE-03", "M-PLACE-04", "M-PLACE-05", "M-NUM-EQUALSTEP-SEQ", "M-NUM-MULTIPLE-INTRO"], title: 'Kimppujen venevaja', composition: 'bundle-boathouse', landmarks: ['boathouse','reed-bundle','moored-boat'] },
  LM05: { nodeIds: ["M-ARITH-01", "M-ADD-01", "M-SUB-01", "M-SUB-02", "M-ADD-SUB-01", "M-ADD-FACT-01", "M-ADD-20", "M-SUB-20", "M-MENTAL-01", "M-ADD-100", "M-SUB-100", "M-ADD-COMM", "M-ADD-ASSOC", "M-ADD-SUB-SELECT", "M-SYM-PLUS", "M-SYM-MINUS", "M-SYM-EQUAL", "M-ADD-FACT-10", "M-SUB-FACT-10"], title: "Yhdistämisen satama", composition: 'harbor-crossing', landmarks: ["harbor-canopy", "two-paths", "shared-mat"] },
  LM06: { nodeIds: ["M-MUL-01", "M-MUL-02", "M-MUL-COMM", "M-MUL-ASSOC", "M-MULTAB-LOW", "M-DIV-01", "M-DIV-02", "M-MULDIV-01", "M-DIV-FACT-01", "M-MULTAB-HIGH", "M-MULTAB-ALL", "M-DISTRIB", "M-MULTREL-01", "M-DIVIS-01", "M-DIVIS-02", "M-DIVIS-03"], title: "Lauttarivien veistämö", composition: 'raft-workshop', landmarks: ["workshop-roof", "raft-row", "grid-rack"] },
  LM07: { nodeIds: ["M-ROUND-01", "M-EST-01", "M-EST-02", "M-WRADD", "M-WRSUB", "M-WRMUL", "M-WRDIV", "M-EXPR-01", "M-CALC-STRAT"], title: "Suurten lastien laskupaja", composition: 'counting-workshop', landmarks: ["hillside-workshop", "crate-stack", "workbench"] },
  LM09: { nodeIds: ["M-DEC-01", "M-DEC-02", "M-DEC-03", "M-DEC-04", "M-DEC-05", "M-DEC-06", "M-DEC-07", "M-DEC-08", "M-DEC-09", "M-FRACDEC-01", "M-PCT-01", "M-PCT-02", "M-PCT-03", "M-PCT-04", "M-PCT-05", "M-RATREP-01", "M-DEC-READ", "M-DEC-WRITE", "M-DEC-DECOMPOSE", "M-DEC-ADD", "M-DEC-SUB", "M-RATREP-FRAC-DEC", "M-RATREP-FRAC-PCT", "M-RATREP-DEC-PCT"], title: "Helmisimpukan tarkkuusasema", composition: 'pearl-station', landmarks: ["shell", "lens-stand", "grid-window"] },
  LM10: { nodeIds: ["M-NEG-01", "M-NEG-02", "M-NEG-03", "M-NEG-04"], title: "Nollatason jäälahti", composition: 'ice-bay', landmarks: ["ice-arch", "zero-post", "two-way-scale"] },
  LM11: { nodeIds: ["M-ALG-01", "M-ALG-02", "M-ALG-03", "M-ALG-04", "M-ALG-05", "M-ALG-06", "M-ALG-07", "M-ALG-08", "M-ALG-09"], title: "Tuntemattoman työpaja", composition: 'unknown-workshop', landmarks: ["balance-frame", "closed-box", "wooden-shelter"] },
  LM12: { nodeIds: ["M-GEO-01", "M-GEO-02", "M-GEO-03"], title: "Askelpolkujen pienoissaari", composition: 'mini-island', landmarks: ["island-landmark", "map-stand", "compass-post"] },
  LM13: { nodeIds: ["M-GEO-04", "M-GEO-06", "M-GEO-10", "M-GEO-11", "M-GEO-12", "M-GEO-13", "M-GEO-2D-PROP-NAME", "M-GEO-2D-CLASSIFY", "M-GEO-TRI-PROP", "M-GEO-TRI-CLASS", "M-GEO-QUAD-PROP", "M-GEO-QUAD-CLASS", "M-GEO-CIRCLE-ID", "M-GEO-CIRCLE-PROP"], title: "Lehtipurjeiden kuviopoukama", composition: 'sail-cove', landmarks: ["leaf-sails", "sail-line", "boat-dock"] },
  LM15: { nodeIds: ["M-GEO-19", "M-GEO-20", "M-GEO-21", "M-GEO-22", "M-GEO-23", "M-GEO-24", "M-GEO-25", "M-SYM-01", "M-SYM-02", "M-SYM-03"], title: "Peilien ja kulmien kallio", composition: 'mirror-cliff', landmarks: ["reflecting-pool", "mirror-cliff", "drawn-line"] },
  LM16: { nodeIds: ["M-COORD-01", "M-COORD-02", "M-SCALE-01", "M-SCALE-02", "M-SCALE-03", "M-COORD-READ-Q1", "M-COORD-PLOT-Q1"], title: "Kartanlukijoiden saaristo", composition: 'map-archipelago', landmarks: ["chart-stand", "map-grid", "compass"] },
  LM17: { nodeIds: ["M-GMEAS-01", "M-GMEAS-02", "M-GMEAS-03", "M-GMEAS-04", "M-GMEAS-05", "M-GMEAS-06"], title: "Rantapenkereiden rakennuspiha", composition: 'embankment-yard', landmarks: ["building-yard", "boundary-rope", "layer-crate"] },
  LM18: { nodeIds: ["M-MEAS-00", "M-MEAS-01", "M-MEAS-02", "M-MEAS-03", "M-MEAS-04", "M-MEAS-05", "M-MEAS-06", "M-MEAS-07", "M-MEAS-08", "M-MEAS-09", "M-MEAS-10", "M-MEAS-11", "M-MEAS-12", "M-MEAS-13", "M-MEAS-14", "M-MEAS-15", "M-MEAS-16"], title: "Mittaretkien jokilaakso", composition: 'river-measure', landmarks: ["river-pier", "instrument-bag", "measure-post"] },
  LM19: { nodeIds: ["M-TIME-01", "M-TIME-02", "M-TIME-03", "M-UNIT-01", "M-UNIT-02", "M-UNIT-03", "M-UNIT-04", "M-UNIT-05", "M-UNIT-06"], title: "Yhteisten mittojen kellotorni", composition: 'clock-ridge', landmarks: ["clock-tower", "two-scales", "ridge"] },
  LM20: { nodeIds: ["M-DATA-01", "M-DATA-02", "M-DATA-03", "M-DATA-04", "M-DATA-05", "M-DATA-06", "M-DATA-07", "M-DATA-08", "M-DATA-09", "M-DATA-10", "M-DATA-11", "M-DATA-12"], title: "Havaintojen majakka", composition: 'observation-beacon', landmarks: ["beacon", "observation-board", "shore-post"] },
  LM21: { nodeIds: ["M-STAT-01", "M-STAT-02", "M-STAT-03", "M-STAT-04", "M-STAT-05", "M-PROB-01", "M-PROB-02", "M-PROB-03", "M-PROB-04", "M-PROB-05", "M-PROB-06"], title: "Vaihtoehtojen tuuliluoto", composition: 'wind-islet', landmarks: ["wind-islet", "choice-wheel", "stone-piles"] },
  LM22: { nodeIds: ["M-PROG-01", "M-PROG-02", "M-PROG-03", "M-PROG-04", "M-PROG-05", "M-PROG-06", "M-PROG-07", "M-PROG-TEST", "M-PROG-EVALUATE"], title: "Ohjelmoitujen lauttojen poukama", composition: 'ferry-cove', landmarks: ["ferry", "command-stand", "wake"] },
  "UM-01": { nodeIds: ["M79-LOGIC-01", "M79-LOGIC-02", "M79-COMB-01", "M79-ARG-01", "M79-TEXT-01", "M79-TEXT-02", "M79-PROOF-01", "M79-TRUTH-01"], title: "Vihjeiden neuvosto", composition: 'reasoning-pier', landmarks: ["council-pier", "reasoning-stones", "message-mooring"] },
  "UM-02": { nodeIds: ["M79-ALGTH-01", "M79-PROG-01", "M79-PROG-CLEAR", "M79-PROG-TEST", "M79-PROG-PRACTICE", "M79-PROG-02", "M79-TECH-01"], title: "Lyhtyjen konepaja", composition: 'lantern-workshop', landmarks: ["lantern-shelter", "test-lantern", "instruction-book"] },
  "UM-03": { nodeIds: ["M79-INT-ORDER", "M79-INT-DIST", "M79-INT-01", "M79-INT-ADD", "M79-INT-SUB", "M79-INT-MUL", "M79-INT-DIV", "M79-OPPOSITE-01", "M79-ABS-01"], title: "Nollalaiturin syvänne", composition: 'zero-depth', landmarks: ["zero-pier", "depth-basket", "opposing-lights"] },
  "UM-04": { nodeIds: ["M79-RECIP-01", "M79-FRAC-MUL", "M79-FRAC-DIV", "M79-DEC-ADD", "M79-DEC-SUB", "M79-DEC-ADD-SUB", "M79-DEC-MUL", "M79-DEC-DIV"], title: "Osuuksien purjehdus", composition: 'sail-repair', landmarks: ["repair-cove", "sail-frame", "whole-frame"] },
  "UM-05": { nodeIds: ["M79-DIVIS-01", "M79-PRIME-01", "M79-PRIMEFACT-01", "M79-POWER-01", "M79-POWER-POS", "M79-POWER-ZERO", "M79-POWER-NEG", "M79-POWER-PROD", "M79-POWER-QUOT", "M79-POWER-POWER", "M79-POWER-SIMPLIFY"], title: "Kivien salainen tähtitorni", composition: 'factor-observatory', landmarks: ["star-tower", "factor-tree", "base-lamp"] },
  "UM-06": { nodeIds: ["M79-SQRT-01", "M79-SQRT-EXACT", "M79-SQRT-EST", "M79-SQRT-02", "M79-SQRT-03", "M79-REAL-01", "M79-REAL-02", "M79-EXACTAPPROX-01", "M79-ROUND-01"], title: "Juuriportin mittarit", composition: 'root-garden', landmarks: ["stone-gate", "square-garden", "estimate-board"] },
  "UM-07": { nodeIds: ["M79-PCT-REFBASE", "M79-PCT-SHARE", "M79-PCT-AMOUNT", "M79-PCT-BASE", "M79-PCT-CHANGED", "M79-PCT-CHANGE", "M79-PCT-COMP", "M79-PCT-PP"], title: "Satasaaren vesineuvosto", composition: 'hundred-water', landmarks: ["water-council", "side-gate", "two-paths"] },
  "UM-08": { nodeIds: ["M79-VAR-VARYING", "M79-VAR-UNKNOWN", "M79-VAR-01", "M79-EXPR-EVAL", "M79-EXPR-FORM", "M79-EXPR-SIMPLIFY", "M79-TERM-01", "M79-POLY-CONCEPT", "M79-POLY-01", "M79-POLY-ADD", "M79-POLY-SUBTRACT", "M79-SIGN-PARENS", "M79-POLY-SUB", "M79-POLY-MUL-MONO", "M79-POLY-MUL"], title: "Muuttujien telakka", composition: 'variable-dock', landmarks: ["boat-dock", "drawing-stand", "shared-canopy"] },
  "UM-09": { nodeIds: ["M79-EQ1-FORM", "M79-EQ1-SOLVE", "M79-EQ1-CHECK", "M79-INEQ-01", "M79-INEQ-SOLVE", "M79-QUAD-INCOMP-01", "M79-QUAD-INCOMP-02"], title: "Tasapainon sulku", composition: 'balance-lock', landmarks: ["lock-gate", "balance-platform", "boundary-post"] },
  "UM-10": { nodeIds: ["M79-SYSTEM-01", "M79-SYSTEM-GRAPH", "M79-SYSTEM-ALG", "M79-PROP-01", "M79-PROP-SOLVE", "M79-DIRECTPROP", "M79-INVERSEPROP"], title: "Kahden virran sopimus", composition: 'two-streams', landmarks: ["two-streams", "planning-table", "meeting-point"] },
  "UM-11": { nodeIds: ["M79-DEP-01", "M79-FUNC-01", "M79-FUNC-TABLE", "M79-FUNC-GRAPH", "M79-SEQ-STRUCTURE", "M79-SEQ-RULE", "M79-SEQ-01", "M79-GRAPH-MONO", "M79-PARABOLA", "M79-PARABOLA-GRAPH"], title: "Kasvihuoneen säännöt", composition: 'glasshouse', landmarks: ["glasshouse", "window-row", "seedling-tray"] },
  "UM-12": { nodeIds: ["M79-LINE-GRAPH", "M79-SLOPE", "M79-INTERCEPT", "M79-ZERO-GRAPH", "M79-ZERO-CALC", "M79-ZERO"], title: "Majakkaviivan kartta", composition: 'beacon-line', landmarks: ["line-map", "beacon", "measure-arrows"] },
  "UM-13": { nodeIds: ["M79-RAY", "M79-CURVE", "M79-LINEREL", "M79-VERTICAL-ANGLES", "M79-SUPPLEMENTARY-ANGLES", "M79-ANGLE-REL", "M79-POLY-ANGLES", "M79-CONGRUENCE", "M79-SIMILARITY", "M79-SIMILAR-SCALE", "M79-CONSTRUCT", "M79-TRI-ANGLE-SUM", "M79-CONG-CRIT", "M79-SIM-CRIT"], title: "Kulmatuulen niemimaa", composition: 'angle-headland', landmarks: ["headland", "wind-vane", "arch-window"] },
  "UM-14": { nodeIds: ["M79-PYTH-01", "M79-PYTH-CALC", "M79-PYTH-CONVERSE", "M79-SIN", "M79-COS", "M79-TAN", "M79-TRIG-01", "M79-TRIG-SIDE", "M79-TRIG-ANGLE", "M79-TRIG-CALC"], title: "Köysisillan mittausretki", composition: 'rope-bridge', landmarks: ["rope-bridge", "research-basket", "signal-post"] },
  "UM-15": { nodeIds: ["M79-CIRCLE-RADIUS", "M79-CIRCLE-DIAMETER", "M79-CIRCLE-CIRCUMFERENCE-CONCEPT", "M79-CIRCLE-ARC", "M79-CIRCLE-BASIC", "M79-CENTRAL-ANGLE", "M79-INSCRIBED-ANGLE-CONCEPT", "M79-INSCRIBED-CENTRAL-REL", "M79-INSCRIBED-ANGLE", "M79-THALES", "M79-CIRCLE-CIRC", "M79-ARC", "M79-CIRCLE-AREA", "M79-SECTOR"], title: "Kehäpuiston observatorio", composition: 'ring-observatory', landmarks: ["ring-pond", "center-marker", "star-lamp"] },
  "UM-16": { nodeIds: ["M79-POLY-PERIM", "M79-TRI-AREA", "M79-QUAD-AREA", "M79-POLY-AREA", "M79-UNIT-LIN", "M79-UNIT-AREA"], title: "Leiripihan pinta-alapuutarha", composition: 'camp-garden', landmarks: ["camp-garden", "boundary-rope", "square-mat"] },
  "UM-17": { nodeIds: ["M79-CYLINDER-ID", "M79-CONE-ID", "M79-SPHERE-ID", "M79-SOLID-01", "M79-CYL-SA", "M79-CYL-V", "M79-CONE-SA", "M79-CONE-V", "M79-SPHERE-SA", "M79-SPHERE-V", "M79-UNIT-VOL"], title: "Kuppelikaupungin rakennuslaatikko", composition: 'dome-harbor', landmarks: ["dome-city", "unfolding-net", "harbor-model"] },
  "UM-18": { nodeIds: ["M79-DATA-COLLECT", "M79-DATA-STRUCT", "M79-FREQ", "M79-RELFREQ", "M79-MEAN", "M79-MODE", "M79-MEDIAN", "M79-SPREAD", "M79-DIAGRAM-INTERP", "M79-DIAGRAM-PROD", "M79-PROB-SPACE", "M79-PROB-CLASSIC", "M79-PROB-EMP"], title: "Säähavaintojen satama", composition: 'weather-harbor', landmarks: ["weather-harbor", "observation-board", "wind-vane"] },
  "SCI01": { nodeIds: ["SCI-ENV-OBS-01", "SCI-ENV-COMPARE-01", "SCI-ENV-RECORD-01", "SCI-ENV-OBSERVE-01", "SCI-ENV-DESCRIBE-01", "SCI-ENV-COMPARE-02", "SCI-ENV-CLASSIFY-01", "SCI-ENV-RECORD-DATA-01", "SCI-ENV-PRESENT-DATA-01"], title: "Havaintojen laguuni", composition: 'observation-lagoon', landmarks: ["clear-lagoon", "droplet-marker", "field-book"] },
  "SCI02": { nodeIds: ["SCI-ENV-QUESTION-01", "SCI-ENV-TOOL-01", "SCI-ENV-EXP-01", "SCI-ENV-CAUSE-01", "SCI-ENV-PLAN-01", "SCI-ENV-MEAS-01", "SCI-ENV-DATA-01", "SCI-ENV-CONCL-01", "SCI-ENV-EVAL-01", "SCI-ENV-MODEL-01", "SCI-ENV-MODEL-02", "SCI-ENV-MODEL-CREATE-01", "SCI-ENV-MODEL-REVISE-01"], title: "Sulan tutkimusasema", composition: 'research-station', landmarks: ["pontoon-station", "wind-vane", "split-stream"] },
  "SCI03": { nodeIds: ["ENV-PHY-MOTION-01", "ENV-PHY-CAUSE-MOTION-01", "ENV-PHY-MOTION-OBS-01", "ENV-PHY-MOTION-CHANGE-01", "PHY79-MOTION-REF", "PHY79-DIST-TIME", "PHY79-SPEED-CONCEPT", "PHY79-SPEED-CALC", "PHY79-SPEED-UNIT", "PHY79-SPEED-MIXED", "PHY79-SPEED-REARR", "PHY79-ST-GRAPH", "PHY79-VT-GRAPH", "PHY79-ACCEL-CONCEPT", "PHY79-ACCEL-CALC", "PHY79-ACCEL-GRAPH", "PHY79-ACCEL-MOTION-GRAPH", "PHY79-ACCEL-VT-GRAPH"], title: "Viestiveneiden lahti", composition: 'message-bay', landmarks: ["message-dock", "measuring-stone", "beacon-line"] },
  "SCI04": { nodeIds: ["ENV-PHY-TEMP-01", "ENV-PHY-THERMAL-01", "PHY79-TEMP-HEAT", "PHY79-HEATFLOW", "PHY79-HEAT-MECH", "PHY79-HEAT-CONDUCTION", "PHY79-HEAT-CONVECTION", "PHY79-HEAT-RADIATION"], title: "Lämpövuoren retkiasema", composition: 'thermal-mountain', landmarks: ["frost-window", "mountain-station", "material-path"] },
  "SCI05": { nodeIds: ["ENV-PHY-LIGHT-01", "ENV-PHY-SOUND-01", "ENV-PHY-LIGHT-OBS-01", "ENV-PHY-LIGHT-EXPLAIN-01", "ENV-PHY-SOUND-OBS-01", "ENV-PHY-SOUND-EXPLAIN-01"], title: "Valon ja kaiun luolat", composition: 'light-echo-cave', landmarks: ["cave-mouth", "shadow-wall", "wave-ring"] },
  "SCI06": { nodeIds: ["ENV-PHY-SPACE-01", "ENV-PHY-SPACE-NEAR-01", "ENV-PHY-DAYNIGHT-01", "ENV-PHY-SEASONS-01", "PHY79-UNIVERSE-SCALE", "PHY79-UNIVERSE-STRUCT"], title: "Taivaan karttahuone", composition: 'sky-map-room', landmarks: ["sky-room", "home-lamp", "sky-chart"] },
  "SCI07": { nodeIds: ["ENV-CHEM-MATERIAL-01", "ENV-CHEM-PROP-01", "ENV-CHEM-STATE-01", "ENV-CHEM-STATECHANGE-01", "ENV-CHEM-MATERIAL-ID-01", "ENV-CHEM-MATERIAL-COMPARE-01", "CHEM79-SUBSTANCE-01"], title: "Aineiden rantapaja", composition: 'materials-shore', landmarks: ["shore-workshop", "smooth-wood", "sample-table"] },
  "SCI08": { nodeIds: ["SCI-ENV-SAFE-01", "ENV-PHY-ELECSAFE-01", "ENV-CHEM-HOMECHEM-SAFE-01", "ENV-CHEM-CHEMICAL-SAFE-01", "ENV-CHEM-POISON-SAFE-01", "ENV-CHEM-FIRE-SAFE-01", "PHY79-SAFE-01", "PHY79-ELEC-SAFE", "CHEM79-SAFE-01", "CHEM79-CHEMICAL-SAFE", "CHEM79-FIRE-SAFE", "CHEM79-CHEMICAL-USE-SAFE", "CHEM79-HAZARD-LABEL", "CHEM79-FIRE-CONDITIONS", "CHEM79-FIRE-ACTION"], title: "Turvaniemen yhteinen piiri", composition: 'safety-grove', landmarks: ["wide-tree", "safe-circle", "path-marker"] },
  "SCI09": { nodeIds: ["PHY79-QUESTION-01", "PHY79-PLAN-01", "PHY79-QTY-01", "PHY79-SI-01", "PHY79-UNIT-CONV", "PHY79-MEAS-01", "PHY79-PREC-01", "PHY79-DATA-01", "PHY79-GRAPH-01", "PHY79-REL-01", "PHY79-MODEL-01", "PHY79-CONCL-01", "PHY79-PREDICT-01", "PHY79-QTY-CONCEPT", "PHY79-NUMVALUE", "PHY79-UNIT-CONCEPT", "PHY79-MEAS-PRECISION", "PHY79-REPORTED-DIGITS", "PHY79-RESULT-EVAL", "PHY79-CONCLUSION-JUSTIFY"], title: "Mittausvuoren majakka", composition: 'measurement-beacon', landmarks: ["beacon-window", "measurement-card", "question-marker"] },
  "SCI10": { nodeIds: ["ENV-PHY-FORCE-01", "PHY79-INTERACT", "PHY79-FORCE-01", "PHY79-FORCE-DIAG", "PHY79-NETFORCE", "PHY79-FORCE-MOTION", "PHY79-WEIGHT", "PHY79-FRICTION", "PHY79-SUPPORT", "PHY79-ACTIONPAIR", "PHY79-WORK-CONCEPT", "PHY79-WORK-CALC", "PHY79-POWER-CONCEPT", "PHY79-POWER-CALC", "PHY79-FORCE-MAGNITUDE", "PHY79-FORCE-DIRECTION"], title: "Köysiradan vuoristo", composition: 'cable-mountain', landmarks: ["cable-station", "research-basket", "rope-route"] },
  "SCI11": { nodeIds: ["ENV-PHY-ENERGYFORM-01", "ENV-PHY-ENERGYTRANS-01", "ENV-PHY-ENERGYCONS-01", "PHY79-ENERGY-01", "PHY79-ENERGY-TRANSFER", "PHY79-KINETIC", "PHY79-POTENTIAL", "PHY79-ENERGY-SOURCE", "PHY79-RENEW", "PHY79-ENERGY-IMPACT"], title: "Tuulien voimaluodot", composition: 'wind-islands', landmarks: ["wind-harbor", "nest-island", "wind-vane"] },
  "SCI12": { nodeIds: ["ENV-PHY-DEVICE-01", "PHY79-CHARGE", "PHY79-CHARGING", "PHY79-CIRCUIT-01", "PHY79-CURRENT", "PHY79-VOLTAGE", "PHY79-MEAS-I", "PHY79-MEAS-U", "PHY79-UI-REL", "PHY79-RESISTANCE", "PHY79-OHM", "PHY79-SERIES", "PHY79-PARALLEL", "PHY79-ELEC-POWER", "PHY79-ELEC-ENERGY", "PHY79-MAGNET", "PHY79-ELECTROMAG", "PHY79-GENERATION", "PHY79-CIRCUIT-CLOSED", "PHY79-CIRCUIT-COMPONENTS", "PHY79-SERIES-CURRENT", "PHY79-SERIES-VOLTAGE", "PHY79-PARALLEL-CURRENT", "PHY79-PARALLEL-VOLTAGE"], title: "Valomerkkien satama", composition: 'signal-harbor', landmarks: ["signal-docks", "two-lamps", "source-board"] },
  "SCI13": { nodeIds: ["PHY79-RAD-EM", "PHY79-RAD-PARTICLE", "PHY79-RAD-ION", "PHY79-RAD-SAFE", "PHY79-RAD-ION-CLASS", "PHY79-RAD-ION-SAFETY"], title: "Näkymättömien viestien observatorio", composition: 'spectrum-observatory', landmarks: ["observation-window", "model-label", "instrument-stand"] },
  "SCI14": { nodeIds: ["CHEM79-LAB-01", "CHEM79-QUESTION-01", "CHEM79-PLAN-01", "CHEM79-OBS-01", "CHEM79-MEAS-01", "CHEM79-DATA-01", "CHEM79-CONCL-01", "CHEM79-DATA-COLLECT", "CHEM79-DATA-PRESENT", "CHEM79-CONCLUSION", "CHEM79-INVESTIGATION-EVAL"], title: "Sulan lasilaboratorio", composition: 'glass-laboratory', landmarks: ["glass-lab", "sample-stand", "evidence-path"] },
  "SCI15": { nodeIds: ["CHEM79-PURE-MIX", "CHEM79-MIX-HOM", "CHEM79-SOLUBILITY", "CHEM79-WATERFAT-SOL", "CHEM79-SEPARATE-01", "CHEM79-SEPARATE-02", "CHEM79-SOLUTION", "CHEM79-FILTRATION", "CHEM79-EVAPORATION", "CHEM79-DECANTING"], title: "Kristallilahden erottamo", composition: 'crystal-separator', landmarks: ["crystal-shore", "separation-stand", "sample-tray"] },
  "SCI16": { nodeIds: ["CHEM79-MODEL-01", "CHEM79-STATE-01", "CHEM79-STATECHANGE", "CHEM79-ELEMENT", "CHEM79-ATOM-01", "CHEM79-ATOM-NUCLEUS", "CHEM79-PROTON", "CHEM79-ELECTRON", "CHEM79-NEUTRON", "CHEM79-ATOMICNUM", "CHEM79-PERIODIC-01", "CHEM79-PERIOD-GROUP", "CHEM79-ELEM-PROP", "CHEM79-COMPOUND", "CHEM79-COMP-MODEL", "CHEM79-SCALE", "CHEM79-PARTICLE-MODEL-USE", "CHEM79-STRUCTURE-MODEL-USE"], title: "Pienten rakenteiden luolat", composition: 'particle-cave', landmarks: ["cave-arch", "observation-window", "model-window"] },
  "SCI17": { nodeIds: ["CHEM79-SYMBOL", "CHEM79-FORMULA", "CHEM79-SUBSCRIPT", "CHEM79-REACTION-EQ-01", "CHEM79-COEFF", "CHEM79-BALANCE", "CHEM79-FORMULA-ELEMENTS", "CHEM79-FORMULA-RATIO"], title: "Ainekirjainten kirjasto", composition: 'element-library', landmarks: ["library-shelter", "label-wall", "bookstand"] },
  "SCI18": { nodeIds: ["ENV-CHEM-BURN-01", "CHEM79-CHANGE-PHYS", "CHEM79-REACTION-01", "CHEM79-REACT-PROD", "CHEM79-MATTER-CONS", "CHEM79-REACTION-MODEL", "CHEM79-REACTION-ENERGY", "CHEM79-EXOENDO", "CHEM79-RATE-01", "CHEM79-RATE-FACTOR", "CHEM79-RATE-TEMP", "CHEM79-RATE-CONC", "CHEM79-RATE-SURF"], title: "Muutosten kidepaja", composition: 'crystal-workshop', landmarks: ["crystal-workshop", "closed-chamber", "ledger"] },
  "SCI19": { nodeIds: ["CHEM79-CONC-01", "CHEM79-CONC-COMP", "CHEM79-CONC-CALC", "CHEM79-ACIDBASE", "CHEM79-PH", "CHEM79-INDICATOR"], title: "Lähteiden tutkimuspuutarha", composition: 'spring-garden', landmarks: ["spring-channel", "sample-bottles", "garden"] },
  "SCI20": { nodeIds: ["ENV-CHEM-PHOTOSYN-01", "ENV-CHEM-MATTERCONS-01", "ENV-CHEM-WATERCYCLE-01", "ENV-CHEM-CYCLE-01", "ENV-CHEM-CYCLE-BURN-01", "ENV-CHEM-CYCLE-PHOTO-01", "ENV-CHEM-CYCLE-MATTER-01", "CHEM79-CARBONCYCLE", "CHEM79-CARBON-BURN", "CHEM79-CARBON-PHOTO", "CHEM79-CARBON-RESERVOIRS", "CHEM79-CARBON-TRANSFERS"], title: "Hiilen ja veden kiertosaari", composition: 'cycle-island', landmarks: ["mountain-stream", "forest-path", "cycle-map"] },
  "SCI21": { nodeIds: ["CHEM79-CARBON", "CHEM79-CARBON-COMPOUND", "CHEM79-NUTRIENT-01", "CHEM79-NUTRIENT-CARB", "CHEM79-NUTRIENT-FAT", "CHEM79-NUTRIENT-PROT", "CHEM79-ORG-GROUP"], title: "Hiilen elävä puutarha", composition: 'carbon-garden', landmarks: ["round-table", "garden-canopy", "food-groups"] },
  "SCI22": { nodeIds: ["CHEM79-RESOURCE", "CHEM79-LIFECYCLE", "CHEM79-SUSTAIN", "CHEM79-LIFECYCLE-STAGES", "CHEM79-LIFECYCLE-FLOWS", "CHEM79-SUSTAIN-COMPARE", "CHEM79-SUSTAIN-MATTER-FLOW", "CHEM79-SUSTAIN-ENERGY-FLOW"], title: "Uudelleen rakentuvan rannan telakka", composition: 'repair-harbor', landmarks: ["repair-dock", "mended-boat", "lantern"] },
  LM08: { nodeIds: ['M-FRAC-01', 'M-FRAC-02', 'M-FRAC-03', 'M-FRAC-04', 'M-FRAC-05', 'M-FRAC-06', 'M-FRAC-07', 'M-FRAC-08', 'M-FRAC-09', 'M-FRAC-10', 'M-FRAC-11', 'M-FRAC-12', 'M-FRAC-13', 'M-FRAC-14', 'M-FRAC-15', 'M-FRAC-16'], title: 'Majavan sivu-uoman sopimus', composition: 'painted-channel-table', landmarks: ['channel-pair','stone-banks','waterfall'] },
  LM14: { nodeIds: ['M-GEO-05', 'M-GEO-07', 'M-GEO-08', 'M-GEO-09', 'M-GEO-14', 'M-GEO-15', 'M-GEO-16', 'M-GEO-17', 'M-GEO-18', 'M-GEO-3D-PROP-NAME', 'M-GEO-3D-CLASSIFY', 'M-GEO-RECTPRISM-ID', 'M-GEO-RECTPRISM-PROP', 'M-GEO-CYLINDER-ID', 'M-GEO-CYLINDER-PROP', 'M-GEO-CONE-ID', 'M-GEO-CONE-PROP', 'M-GEO-PYRAMID-ID', 'M-GEO-PYRAMID-PROP'], title: 'Majakkarakentajien kappalesaari', composition: 'mountain-workshop', landmarks: ['mountain-ridge','lighthouse-workshop','workshop-rail'] },
} as const;
export type FamilyWorldPilotId = keyof typeof familyWorldPilots;

/** Source-authored family briefs and required-leaf treatment contracts. Presence is not an implementation claim. */
export const familyWorldBriefs = [
  {
    "id": "LM01",
    "title": "Kaislarannan havaintoreitti",
    "theme": "Vertailu, luokittelu, säännöt ja perusteltu havaitseminen",
    "motif": "Veteen piirtyvä rengas ja Aavan avoin havaintovihko",
    "world": "Kaislat kasvavat lammen matalassa päässä kuin pitkän talon seinät. Niiden väleissä on pieniä ikkunoita: yksi näyttää sileitä kiviä, toinen pisaroita ja kolmas veden pinnalla kelluvia lehtiä. Aava kulkee rauhallisesti ikkunalta toiselle. Loikka tahtoisi nimetä kaiken heti, mutta ranta vastaa kiireeseen yllätyksellä: suuri lehti voi olla kevyt ja pieni kivi painava. Tässä paikassa oivallus alkaa luvasta katsoa uudestaan.\n\nJokainen tutkimuspiste on oma pieni näyttämönsä. Kaikki vertailtavat kohteet ovat näkyvissä, ja epäolennainen liike vaimenee, kun tehtävä alkaa. Suurennus on valmiiksi rajattu; pelaajan ei tarvitse metsästää vastausta ruovikosta. Luokittelussa esineet siirtyvät pesiin, järjestämisessä ne muodostavat pitkospuut ja perustellussa päätelmässä havainto saa oman kuvamerkkinsä. Kuvamerkit eivät väitä oppijan hallitsevan kaikkea: ne muistuttavat juuri tehdystä paikallisesta havainnosta.\n\nPerheen yhteinen tunne on utelias rauha. Aava saa olla epävarma, ja Loikan ensimmäinen arvaus voi muuttua ilman nolostumista. Humoristinen yksityiskohta on sama itsepäinen tuulen kuljettama lehti: joskus sen väri auttaa luokittelemaan, joskus sillä ei ole asian kanssa mitään tekemistä. Rannan varsinainen aarre on ero näkemisen, kysymisen ja tietämisen välillä. Tämä ero kantaa myöhemmin tutkimusasemille, mutta mikään havaintopiste ei vaadi niiden tarinoiden tuntemista.",
    "payoff": "Rannalle syntyy havaintopolku, jolla jokainen merkki kertoo todistetun asian.",
    "nodeIds": [
      "M-TH-01",
      "M-TH-02",
      "M-TH-03",
      "M-TH-04",
      "M-TH-05",
      "M-TH-06",
      "M-TH-07",
      "M-TH-08",
      "M-WORK-01",
      "M-WORK-02",
      "M-WORK-03"
    ]
  },
  {
    "id": "LM02",
    "title": "Selitysten telttakylä",
    "theme": "Ongelmanratkaisu, strategiat ja matemaattinen esittäminen",
    "motif": "Läpinäkyvä telttakangas, jonka molemmille puolille voi piirtää",
    "world": "Telttakylä on pystytetty kohtaan, jossa useat rantapolut kohtaavat. Yhden teltan katto on tehty lehdistä, toisen vanhasta purjekankaasta. Keskellä on pöytä, jonka ympärille mahtuvat yhtä hyvin majavan piirustus kuin Sulkan tarkka mittausvihko. Aava pitää pöydällä yhtä kysymystä kerrallaan. Loikka tuo kiviä havainnollistamaan ajatustaan ja huomaa, ettei pitkä selitys aina kerro samaa kuin pieni hyvin valittu kuva.\n\nPaikan draama syntyy väärinymmärryksistä, jotka ovat korjattavissa. Kukaan ei piilota tärkeää tietoa, eikä arvoituksen ratkaiseminen vaadi tarinavitsien tuntemista. Annetut tiedot, tavoite, valitut välineet ja oma ratkaisu näkyvät samassa työtilassa. Oppija voi kokeilla, palata ja verrata kahta reittiä ilman ajastinta. Kun strategia toimii, peli näyttää miksi: köysi riittää, eväät jakautuvat tai reittikuva todella johtaa toivottuun paikkaan.\n\nTämä perhe ei opeta kaikkia matemaattisia sisältöjä uudelleen. Tehtävä valitsee tutun sisältöalueen ja tutun esitysmuodon, jotta huomio kohdistuu ajattelun tekemiseen näkyväksi. Jos tarkoitus on harjoitella suullista selittämistä, oma ääni pysyy vapaaehtoisessa paikallisessa käytössä ja aikuisen arvioitavana; valmiin perustelun valinta saa eri näyttömerkinnän. Telttakylän palkinto on kuulluksi tuleminen. Ystävät voivat lopulta sanoa toisilleen: nyt ymmärrän, miten sinä ajattelit, vaikka ratkaisin itse toisin.",
    "payoff": "Telttakylästä tulee yhteinen neuvottelupaikka, jossa jokaisen perustelu on nähtävissä.",
    "nodeIds": [
      "M-PS-01",
      "M-PS-02",
      "M-PS-03",
      "M-PS-04",
      "M-PS-05",
      "M-PS-06",
      "M-REP-01",
      "M-REP-02",
      "M-REP-03",
      "M-REP-04",
      "M-REP-05"
    ]
  },
  {
    "id": "LM03",
    "title": "Lukusanojen ruovikko",
    "theme": "Laskemisen periaatteet, lukumäärä, lukujonot ja lukujen käyttötarkoitukset",
    "motif": "Lehtipaikka, joka syttyy kerran ja pysyy mukana",
    "world": "Lukusanojen ruovikko on matala, lämmin ja läpikuultava. Veden pohjassa näkyvät sileät kivet, ja kelluvat lehdet muodostavat pieniä levähdyspaikkoja. Aava tuntee paikan tavan: kun joku saapuu laiturille, hänelle annetaan oma paikka. Loikka osaa hypätä nopeasti, mutta juuri täällä nopeus ei auta, jos sama lehti saa kaksi nimeä ja toinen jää kokonaan huomaamatta.\n\nLaskettavat asiat ovat aina kokonaan näkyvissä. Ne saavat hiljaisen valomerkin käsittelyn jälkeen, mutta eivät katoa ennen kuin koko määrää on tarkasteltu. Rannan tarina opettaa, että viimeinen lukusana kertoo joukon eikä vain viimeisen esineen nimeä. Lukumäärä, lukusana ja numeromerkintä kulkevat rinnakkain erillisinä taitoina. Niiden yhdistämiselle on oma tehtävänsä, jossa tuttukin määrä saa uuden asettelun. Nolla on oikea tyhjä odotuspaikka, ei puuttuva tai epäonnistunut vastaus.\n\nPerheen huipennukset ovat pieniä mutta tuntuvia: jokainen vieras saa paikan, viesti menee oikealle laiturille ja retkiseurue voi lähteä rauhassa. Lukujonoissa edetään myös takaisin, mutta tämä ei käännä saariston tapahtumia taaksepäin; kyseessä on paikallinen askelpolku. Puhe on kuunneltava lisätuki, eikä mikään vastauspainike piiloudu äänen taakse. Yhtenäinen kuvallinen rytmi tekee numeroista ympäristön ymmärtämisen välineitä. Lapsi saa kokea olevansa se, joka huomaa kaikki, myös aivan viimeisen pienen tulijan.",
    "payoff": "Ruovikon pieni retkiseurue löytää paikkansa yhteiselle laiturille.",
    "nodeIds": [
      "M-NUM-01",
      "M-NUM-02",
      "M-NUM-03",
      "M-NUM-04",
      "M-NUM-05",
      "M-NUM-06",
      "M-NUM-07",
      "M-NUM-08",
      "M-NUM-09",
      "M-NUM-10",
      "M-NUM-11",
      "M-NUM-12",
      "M-NUM-13",
      "M-NUM-14",
      "M-NUM-STABLE-ORDER",
      "M-NUM-1TO1",
      "M-NUM-QTY-WORD",
      "M-NUM-QTY-NUMERAL",
      "M-NUM-WORD-NUMERAL"
    ]
  },
  {
    "id": "LM04",
    "title": "Kimppujen venevaja",
    "theme": "Parillisuus, hajotelmat, monikerrat ja kymmenjärjestelmä",
    "motif": "Avattava kaislakimppu, jonka sisältö ei katoa",
    "world": "Venevaja tuoksuu kuivalta kaislalta ja kostealta puulta. Sen seinillä riippuu kimppuja, joiden nauhat ovat erivärisiä, mutta nauhan väri ei kerro vastauksia. Aava esittelee tärkeämmän säännön: jokaisen kimppumerkin takana on oikea näkyvä määrä. Loikka saa avata kimpun ja sitoa sen uudelleen, jolloin hän huomaa määrän säilyvän, vaikka sen esittämisen tapa vaihtuu.\n\nLattialle on maalattu kymmenjärjestelmän työmatto. Ykköset, kymmenet ja suuremmat yksiköt pysyvät omissa nimetyissä paikoissaan. Kun tyhjä sarake tarvitaan, se ei painu kasaan; nollan paikka näkyy varastossa yhtä tärkeänä kuin täysi lokero. Parillisuus näkyy pareina, puolittaminen kahtena tasaisena lastina ja hajotelmat saman kokonaisuuden erilaisina jakamisina. Monikertoja tutkitaan toistuvilla yhtä suurilla lastauksilla. Niiden muoto ei vaadi kertotaulujen ulkoa osaamista etukäteen.\n\nVenevajan yllätys on, että suuri määrä voi muuttua helpoksi kuljettaa ilman että yhtään osaa katoaa. Oppija ei vain valitse numeroa: hän kokoaa, avaa, vaihtaa tai järjestää sen osoittaman rakenteen. Paikalliset palkinnot ovat valmiita lastilaatikoita ja tasapainoisia lähtöryhmiä. Ne voivat liittyä mihin tahansa saariston rakennustyöhön ilman pakollista tapahtumajärjestystä. Aavan toistuva kysymys on lempeä ja täsmällinen: muuttuiko määrä vai vain tapa, jolla sen näimme?",
    "payoff": "Venevajan varastoon syntyy ymmärrettävä järjestys ja jokainen rakennusosa löytyy oikeasta paikasta.",
    "nodeIds": [
      "M-NUM-15",
      "M-NUM-16",
      "M-NUM-17",
      "M-NUM-18",
      "M-PLACE-01",
      "M-PLACE-02",
      "M-PLACE-03",
      "M-PLACE-04",
      "M-PLACE-05",
      "M-NUM-EQUALSTEP-SEQ",
      "M-NUM-MULTIPLE-INTRO"
    ]
  },
  {
    "id": "LM05",
    "title": "Yhdistämisen satama",
    "theme": "Yhteenlasku, vähennyslasku, niiden merkit ja joustavat perusstrategiat",
    "motif": "Kaksi rantapolkua ja niiden yhteinen laskumatto",
    "world": "Satamassa kulkee kaksi polkua samaan laiturikatokseen. Toiselta tuodaan kaisloja, toiselta eväitä, ja kolmatta pitkin tavaraa lähtee pieniin retkiin. Aava ei pidä varastokirjaa saadakseen ystäviä kiirehtimään. Hän haluaa tietää, riittääkö kaikille ja missä puuttuva osa todella on. Loikka huomaa pian, että vähentäminen voi kuvata myös kahden määrän eroa, vaikka yksikään kori ei poistu paikaltaan.\n\nSataman työmatto näyttää muutoksen alun, teon ja lopun. Merkit opetetaan merkityksellisinä: plus yhdistää tai lisää, miinus kuvaa poistamista tai eroa ja yhtäsuuruus yhdistää samanarvoiset esitykset. Kun lasku muuttuu symbolisemmaksi, oppija voi edelleen avata mallin, mutta tuettu ratkaisu kirjataan tuetuksi. Sujuvuutta harjoitellaan vaihtelevissa pienissä tilanteissa ilman pakollista kelloa. Kympin ylityksessä näkyy oikea väliryhmittely; se ei ole salainen temppu, jonka onnistuminen palkitaan ilman selitystä.\n\nSataman huumori syntyy Loikan tavasta tehdä ensin liian mutkikas kuljetusreitti. Aava ehdottaa, että osa matkasta voidaan nähdä yhdellä tutulla kymppiparilla. Palkinto on havaittava helpotus: kori täyttyy, sovittu ero tasoittuu tai lastikirjan kaksi puolta kertovat saman asian. Jokainen tällainen päätös valmistuu paikallisesti. Satama ei edellytä, että jokin toinen saari olisi jo pelastettu, mutta sen työn jälki voi näkyä yhteisen saariston muistokirjassa.",
    "payoff": "Sataman pieni retkikunta saa oikean määrän tarvikkeita ja ymmärrettävän lastikirjan.",
    "nodeIds": [
      "M-ARITH-01",
      "M-ADD-01",
      "M-SUB-01",
      "M-SUB-02",
      "M-ADD-SUB-01",
      "M-ADD-FACT-01",
      "M-ADD-20",
      "M-SUB-20",
      "M-MENTAL-01",
      "M-ADD-100",
      "M-SUB-100",
      "M-ADD-COMM",
      "M-ADD-ASSOC",
      "M-ADD-SUB-SELECT",
      "M-SYM-PLUS",
      "M-SYM-MINUS",
      "M-SYM-EQUAL",
      "M-ADD-FACT-10",
      "M-SUB-FACT-10"
    ]
  },
  {
    "id": "LM06",
    "title": "Lauttarivien veistämö",
    "theme": "Yhtä suuret ryhmät, kerto- ja jakolasku, laskulait ja jaollisuus",
    "motif": "Saman kokoiset penkkirivit ja niistä kääntyvä ruudukko",
    "world": "Veistämön lahdenpohjukassa kelluu rinnakkain pieniä lauttoja. Jokaisessa on yhtä monta merkittyä paikkaa, mutta koko laivueen muoto voi vaihtua. Aava tarkistaa, että paikat jaetaan sovitusti. Loikka pyörittää piirustusta ja hämmästyy: rivien ja sarakkeiden vaihtaminen voi säilyttää kokonaismäärän, vaikka laivue näyttää aivan erilaiselta.\n\nTyöpöytä ei peitä toistuvia ryhmiä pelkillä kertolaskumerkeillä. Ryhmän koko, ryhmien määrä ja kokonaismäärä ovat aluksi käsin kosketeltavia. Ositusjaossa annetaan vastaanottajien määrä, sisältöjaossa yhden kuorman koko. Tehtävän kysymys pysyy näkyvissä, jotta nämä kaksi tilannetta eivät sulautuisi yhdeksi ulkoa opituksi toimitukseksi. Faktaharjoittelu saa tukea rivimalleista, mutta itsenäinen näyttö käyttää myös uutta esitystä. Pakollista nopeuspeliä tai esiintymisvuoroa ei ole.\n\nVeistämössä on myös arkinen jännite: täytyykö viimeiseen veneeseen jättää tyhjä paikka, vai voidaanko koko lasti jakaa ehjiin samanlaisiin ryhmiin? Jaollisuus vastaa tähän täsmällisesti. Ylijäämä ei ole hahmon epäonnistuminen, vaan tietoa suunnitelmasta. Oppija näkee ratkaisunsa seurauksen laivueessa, eväskoreissa tai rakenteen osissa. Jokainen valmistunut paikallinen retki on kokonainen palkinto, eikä kaikkien kertotaulujen suorittaminen ole ystävien auttamisen ehtona.",
    "payoff": "Veistämö kokoaa yhteiselle retkelle sopivat vene- ja eväsryhmät ilman hukkaosia.",
    "nodeIds": [
      "M-MUL-01",
      "M-MUL-02",
      "M-MUL-COMM",
      "M-MUL-ASSOC",
      "M-MULTAB-LOW",
      "M-DIV-01",
      "M-DIV-02",
      "M-MULDIV-01",
      "M-DIV-FACT-01",
      "M-MULTAB-HIGH",
      "M-MULTAB-ALL",
      "M-DISTRIB",
      "M-MULTREL-01",
      "M-DIVIS-01",
      "M-DIVIS-02",
      "M-DIVIS-03"
    ]
  },
  {
    "id": "LM07",
    "title": "Suurten lastien laskupaja",
    "theme": "Kirjalliset laskut, lausekkeet, pyöristäminen ja menetelmän valinta",
    "motif": "Läpinäkyvät lukuyksikkölaatikot ja tarkistettava työjälki",
    "world": "Laskupaja kohoaa sataman taakse puisen rinteen päälle. Sen ikkunoista näkyvät suuret lastit, mutta pöydällä on kerrallaan vain yksi ratkaistava toimitus. Aava varmistaa, että numeroiden sarakkeet kertovat samoista lukuyksiköistä. Loikka saa työntää kymmenen pientä laatikkoa yhdeksi suureksi ja avata suuren takaisin pieniksi. Kirjallinen laskutapa on näin tiivis muistiinpano todellisesta suhteesta, ei salainen liikemalli.\n\nPajan tehtävät näyttävät sekä luvut että toiminnan tarkoituksen. Muistinumero seuraa oikeaa ryhmittelyä, lainaaminen on näkyvä vaihto ja jakamisessa seurataan annettua kokonaismäärää lukuyksikkö kerrallaan. Jokainen tarpeellinen välivaihe on saatavilla ilman vieritystä. Kun oppija jo osaa, hän voi käyttää tiivistä merkintää; mallin avaaminen tarjoaa tukea ja muuttaa näyttömerkinnän sen mukaisesti.\n\nLikiarvopöytä on pajan avoin parveke. Sieltä katsotaan suurta kokonaisuutta ennen tarkkaa laskua. Aava muistuttaa, että lähimpään kymmeneen pyöristäminen ja riittävän materiaalimäärän varaaminen ovat eri päätöksiä. Tehtävä kertoo, kumpaa tarvitaan. Pajan huipennus on onnistunut suunnitelma, jonka järkevyyden ystävät ymmärtävät. Oppija saa valita perustellun laskutavan eikä yhtä muotomenetelmää julisteta kaikkien tilanteiden ainoaksi oikeaksi reitiksi. Näin suuri lasti voi tuntua hallittavalta myös silloin, kun sen yksittäisiä esineitä ei voisi mitenkään piirtää ruudulle.",
    "payoff": "Iso kuljetussuunnitelma valmistuu ilman että sen merkitys katoaa numeroiden taakse.",
    "nodeIds": [
      "M-ROUND-01",
      "M-EST-01",
      "M-EST-02",
      "M-WRADD",
      "M-WRSUB",
      "M-WRMUL",
      "M-WRDIV",
      "M-EXPR-01",
      "M-CALC-STRAT"
    ]
  },
  {
    "id": "LM08",
    "title": "Majavan sivu-uoman sopimus",
    "theme": "Murtoluvun suuruus, saman kokonaisen osat, ekvivalenssi ja laskutoimitukset",
    "motif": "Kaksi pientä vesireittiä ja samaa kokonaista kuvaava sininen mittapalkki",
    "world": "Joen haarassa majavalla on huoli: hänen kotinsa tarvitsee rauhallisen veden, mutta lammen putous on hiljentynyt. Aava ei tule syyttämään rakentajaa. Hän tuo leveän piirustuspöydän, jolle mahtuvat sekä pesälahti että putouksen reitti. Loikka piirtää ensin mutkan ja hymyilee, kun sivu-uoma tarjoaa ratkaisun, jota kukaan ei nähnyt väittelemällä vain kahdesta vastakkaisesta tarpeesta.\n\nOppimisen näyttämö on tarkka malliallas. Sen kokonainen ja yksikkö pysyvät näkyvissä. Osuuksia voidaan jakaa uudelleen muuttamatta veden kokonaismäärää, ja lukusuora näyttää saman osuuden lukuna. Malli kuvaa sovittuja määriä; sitä ei väitetä realistiseksi sulkuportin ja virtaaman fysiikaksi. Majavan varsinainen rakentaminen on ratkaisuun sidottu tarinallinen seuraus, jonka ei tarvitse opettaa hydrodynamiikkaa väärin.\n\nJokaisella solmulla on oma pieni sopimuskohta: yhtä suuret osat, osuuden nimeäminen, suuruusvertailu tai sovittujen määrien yhdistäminen. Tehtävä ei oleta muiden sopimuskohtien tapahtuneen, vaan tarvittava paikallinen lähtötilanne annetaan näkyvästi. Perheen tunnekaari kulkee omasta osuudesta jaettuun ymmärrykseen. Huipennuksessa majavan kodin ikkuna jää rauhallisen veden ääreen ja putouksen mallissa kuuluu taas lempeä solina. Ystävät eivät voita toisiaan vaan ongelman, joka pieneni heidän opittuaan kuvaamaan sitä samalla tavalla.",
    "payoff": "Majava hyväksyy oman sivu-uomansa paikallisen suunnitelman; vesiputouksen pienoismalli saa virtansa ja sopimus sinetöidään yhdessä.",
    "nodeIds": [
      "M-FRAC-01",
      "M-FRAC-02",
      "M-FRAC-03",
      "M-FRAC-04",
      "M-FRAC-05",
      "M-FRAC-06",
      "M-FRAC-07",
      "M-FRAC-08",
      "M-FRAC-09",
      "M-FRAC-10",
      "M-FRAC-11",
      "M-FRAC-12",
      "M-FRAC-13",
      "M-FRAC-14",
      "M-FRAC-15",
      "M-FRAC-16"
    ]
  },
  {
    "id": "LM09",
    "title": "Helmisimpukan tarkkuusasema",
    "theme": "Desimaalit, prosentit ja rationaalilukujen esitysten yhteydet",
    "motif": "Helmi suurennuskehyksessä ja läpinäkyvä sadan ruudun ikkuna",
    "world": "Helmisimpukan asemalla meri näyttää eri tarkkuudella erilaiselta. Kaukaa helmi on vain kirkas piste, läheltä sen pintaan mahtuu kokonainen kiiltävä maisema. Aava käyttää tätä näkyä kysymykseen, joka kantaa koko perhettä: muuttuiko asia vai tarkkuus, jolla sitä katsomme? Loikka oppii, että kymmenesosa, sadasosa ja tuhannesosa kuuluvat samaan nimettyyn kokonaiseen, vaikka suurennus nostaa pienen osan koko ruudun kokoiseksi.\n\nAseman tärkein työkalu on liikkumaton paikka-arvopöytä. Desimaalipilkku pysyy paikallaan ja tyhjät lukuyksiköt näkyvät. Jokainen suurennos säilyttää näkyvän yhteyden alkuperäiseen kokonaiseen. Näin 0,3 ja 0,30 voivat näyttää saman määrän ja 0,07 pysyy erillisenä 0,7:stä. Laskutoimituksissa yhdistetään samanarvoisia osia; luvun tekstipituus ei määrää arvoa. Prosentti esitellään sadasosana, ja prosenttiluku erotetaan sen kuvaamasta todellisesta määrästä.\n\nTarinassa asema auttaa eri saaria ymmärtämään samoja viestejä. Yksi käyttää murtolukuja, toinen desimaaleja, kolmas prosentteja. Viestit eivät saa muuttua matkalla. Paikallinen huipennus voi olla onnistunut varaus, selvä tilannekuva tai kahden aluksi ristiriitaiselta näyttäneen tiedon yhteensopivuus. Palkinto on viestiyhteys, joka toimii ilman että kenenkään tarvitsee luopua ymmärtämästään esitystavasta. Tehtävän luvut ja yksiköt pysyvät näkyvissä myös silloin, kun aseman maalattu meri välähtää kaukana taustalla.",
    "payoff": "Tarkkuusasema lähettää saman ymmärrettävän tiedon eri saarien vastaanottajille.",
    "nodeIds": [
      "M-DEC-01",
      "M-DEC-02",
      "M-DEC-03",
      "M-DEC-04",
      "M-DEC-05",
      "M-DEC-06",
      "M-DEC-07",
      "M-DEC-08",
      "M-DEC-09",
      "M-FRACDEC-01",
      "M-PCT-01",
      "M-PCT-02",
      "M-PCT-03",
      "M-PCT-04",
      "M-PCT-05",
      "M-RATREP-01",
      "M-DEC-READ",
      "M-DEC-WRITE",
      "M-DEC-DECOMPOSE",
      "M-DEC-ADD",
      "M-DEC-SUB",
      "M-RATREP-FRAC-DEC",
      "M-RATREP-FRAC-PCT",
      "M-RATREP-DEC-PCT"
    ]
  },
  {
    "id": "LM10",
    "title": "Nollatason jäälahti",
    "theme": "Negatiiviset luvut, lukusuora ja suunnatut muutokset",
    "motif": "Selvästi merkitty nollaviiva ja kahteen suuntaan jatkuva rantamitta",
    "world": "Jäälahden rannalla Aava löytää mittataulun, jonka keskellä on nolla. Loikka luulee aluksi, että taulun pitäisi päättyä siihen. Läpinäkyvässä jäässä näkyy kuitenkin selvä jatko: jotkin arvot ovat nollan toisella puolella. Kylmä lahti on rauhallinen tutkimuspaikka, ei vaarallinen suorituskoe. Hahmot pysyvät tukevalla havaintolaiturilla, ja kaikki tarkasteltavat arvot tulevat luettavaksi pöydälle.\n\nPerhe käyttää johdonmukaista suunnan ja vertailukohdan mallia. Negatiivinen luku ei ole esineitä sisältävä miinuskori, vaan nollatasoon suhteutettu arvo. Lukusuoran vasen puoli, lämpötila ja korkeuden suhde merkittyyn tasoon auttavat tarkastelemaan samaa ideaa eri tilanteissa. Samalla ne erotetaan toisistaan niin, ettei lämpötilaa ja etäisyyttä sekoiteta saman suureen väitteeksi. Mitattu ominaisuus ja yksikkö ovat aina näkyvissä.\n\nAavan ja Loikan pieni yllätys on, että kauempana nollasta oleva negatiivinen arvo voi olla pienempi. Tämä oivallus näkyy paikallisessa tehtävässä, jossa väärä mittalappu korjataan ja rantataulu muuttuu ymmärrettäväksi. Muutoksia tutkitaan lähtöarvon ja suunnan avulla; pelaajan ei tarvitse osata myöhempien luokkien merkkisääntöjä ennakolta. Jäälahden palkinto on turvallinen, tarkka suunnistaminen käsitteessä, joka aluksi näytti mahdottomalta. Sen voi löytää omana sivuretkenään missä tahansa saariston polkujen välissä.",
    "payoff": "Jäälahden mittaustaulu kuvaa sekä nollan alapuoliset tilanteet että paluun kohti lämpimämpää.",
    "nodeIds": [
      "M-NEG-01",
      "M-NEG-02",
      "M-NEG-03",
      "M-NEG-04"
    ]
  },
  {
    "id": "LM11",
    "title": "Tuntemattoman työpaja",
    "theme": "Lukujonojen säännöt, tuntematon, yhtäsuuruus ja ensimmäiset yhtälöt",
    "motif": "Suljettu laatikko ja tasapainossa pysyvä työpöytä",
    "world": "Tuntemattoman työpajassa kaikkea ei näe suoraan, mutta mitään ratkaisemiseen tarvittavaa ei piiloteta käyttöliittymän ulkopuolelle. Aava nostaa pöydälle suljetun laatikon ja kertoo, mitä sen suhteesta muihin osiin tiedetään. Loikka ymmärtää, että laatikon sisällön voi joskus päätellä avaamatta sitä. Tämä on tietoinen matemaattinen tuntematon, ei aarteenetsinnän kamerakulmapulma.\n\nPajan toisella seinällä kulkee koristejono, jonka sääntöjä voidaan tutkia. Jokin toistuu, jokin kasvaa, ja selityksen pitää toimia myös seuraavassa kohdassa. Tarjottu jatko testataan, ei hyväksytä pelkäksi mieluisaksi kuvioksi. Yhtälöpöytä näyttää molemmat puolet jatkuvasti. Yhtäsuuruus tarkoittaa samaa arvoa, ja tuntematon saa saman merkityksen koko tehtävän ajan. Annetun ratkaisuehdotuksen kokeileminen on oma taitonsa, eri asia kuin ratkaisun löytäminen.\n\nPajan jännitys on lempeää odotusta: mitä laatikossa pitäisi olla, jotta suunnitelma toimii? Kun oppija perustelee valinnan, laatikko avautuu tai rakenne asettuu paikalleen. Avaaminen on seuraus, ei ainoa todiste osaamisesta. Järjestelmällinen kokeilu saa pitää yritysjäljet näkyvissä, jotta työ ei muutu muistipeliksi. Oppija voi onnistua päättelemällä tai tarkoituksenmukaisella kokeilulla, kun tehtävä kertoo mitä taitoa harjoitellaan. Ystävien luottamus kasvaa siitä, että aluksi tuntematon voi muuttua ymmärrettäväksi yhteisten tietojen avulla.",
    "payoff": "Pajan paikallinen rakennelma saa puuttuvan osansa perustellun ratkaisun avulla.",
    "nodeIds": [
      "M-ALG-01",
      "M-ALG-02",
      "M-ALG-03",
      "M-ALG-04",
      "M-ALG-05",
      "M-ALG-06",
      "M-ALG-07",
      "M-ALG-08",
      "M-ALG-09"
    ]
  },
  {
    "id": "LM12",
    "title": "Askelpolkujen pienoissaari",
    "theme": "Taso, kolmiulotteinen tila, sijainti ja suunta",
    "motif": "Pöydälle nostettava saari ja sen tasainen kartta",
    "world": "Pienoissaari nousee Aavan työpöydästä kuin pehmeä maalaus, joka on saanut korkeuden. Siinä on yksi silta, matala kumpu, pieni laiturikatos ja selvästi nimetty rantapenkki. Vieressä on samasta saaresta tasainen kartta. Loikka saa tutkia, mikä karttaan mahtuu suoraan ja mikä pitää ymmärtää korkeuden tai kohteiden välisen suhteen kautta.\n\nMaailma on tarkoituksella rajattu. Pelaaja ei voi eksyä kauas eikä tarpeellinen esine jää rakennuksen taakse. Kamera vaihtuu ennalta nimettyihin katselupaikkoihin ja osoittaa, kenen suunnasta vasen tai oikea tulkitaan. Jos tehtävä kysyy kohteen olevan sillan alla, näyttö avaa sillan läpinäkyväksi tai nostaa sivukuvan valmiiksi. Se ei anna sijaintikäsitteen oikeaa vastausta, mutta poistaa tarpeettoman näkymän etsimisen.\n\nSaaren draama on kohtaaminen. Aava ja Loikka ovat toisinaan eri puolilla kumpua, mutta näkyvät molemmat, ja heidän on kuvattava yhteinen paikka ymmärrettävästi. Onnistuminen saa heidät saapumaan sovitulle penkille tai viemään pienen paketin oikeaan kohtaan. Tehtävien asettelut vaihtuvat niin, ettei ruudun vasenta reunaa voi opetella ulkoa. Kolmiulotteisuus on täällä oppimisen kohde, ei ylimääräinen koriste. Tasainen maalaus toimii vertailuna ja vaihtoehtoisena ohjauspintana, jolla sama tilasuhde on saavutettavissa myös ilman vapaata kameran pyörittämistä.",
    "payoff": "Aava ja Loikka kohtaavat sovitulla levähdyspaikalla ymmärrettävien sijainti- ja suuntaohjeiden avulla.",
    "nodeIds": [
      "M-GEO-01",
      "M-GEO-02",
      "M-GEO-03"
    ]
  },
  {
    "id": "LM13",
    "title": "Lehtipurjeiden kuviopoukama",
    "theme": "Tasokuvioiden tunnistaminen, rakentaminen, ominaisuudet ja luokittelu",
    "motif": "Purjekangas, joka kääntyy mutta säilyttää ominaisuutensa",
    "world": "Kuviopoukaman vaijereilla kuivuu erimuotoisia lehtipurjeita. Osa riippuu kärki ylöspäin, osa vinossa, ja yksi aivan tavallinen kolmio näyttää Loikasta ensin oudolta, koska sen sivut eivät ole yhtä pitkiä. Aava nostaa purjeen tasaiselle työpöydälle. Kun ympäristön väri ja asento eivät enää häiritse, kuvion omat ominaisuudet alkavat puhua.\n\nPöydällä voi seurata sivua, merkitä kärjen tai sovittaa läpinäkyvän mallin kuvion päälle. Yksi tehtävä opettaa tunnistamaan, toinen nimeämään ominaisuuden ja kolmas luokittelemaan sen perusteella. Integraatiotehtävä yhdistää nämä erikseen opetetut asiat uuteen kokonaisuuteen. Neliö voi kuulua useaan tarkoituksenmukaiseen luokkaan; luokittelua ei opeteta vääräksi joko–tai-peliksi, jos luokat ovat sisäkkäisiä. Ympyrää tarkastellaan tasokuviona, ei pallon kuvana.\n\nMaailman runollinen motiivi on tuuli, joka muuttaa asentoa mutta ei kuviota. Tehtävän aikana tuuli pysähtyy, jotta havainto voidaan tehdä rauhassa. Sen jälkeen oikein valittu purje voi avautua laiturin pienessä veneessä. Jokaisella työpisteellä on oma paikallinen tarkoituksensa: ikkuna sopii aukkoon, kyltti tunnistetaan tai purjeen luokka perustellaan. Peli ei arvioi piirustuksen kauneutta eikä edellytä tarkkaa sormipiirtoa; pisteiden valinta ja napautettava rakentaminen tuottavat saman matemaattisen työn saavutettavasti.",
    "payoff": "Poukaman oma pieni alus saa tarkoitukseen sopivat purjeet, ikkunat ja kuviokyltit.",
    "nodeIds": [
      "M-GEO-04",
      "M-GEO-06",
      "M-GEO-10",
      "M-GEO-11",
      "M-GEO-12",
      "M-GEO-13",
      "M-GEO-2D-PROP-NAME",
      "M-GEO-2D-CLASSIFY",
      "M-GEO-TRI-PROP",
      "M-GEO-TRI-CLASS",
      "M-GEO-QUAD-PROP",
      "M-GEO-QUAD-CLASS",
      "M-GEO-CIRCLE-ID",
      "M-GEO-CIRCLE-PROP"
    ]
  },
  {
    "id": "LM14",
    "title": "Majakkarakentajien kappalesaari",
    "theme": "Kappaleiden tunnistaminen, rakentaminen, ominaisuudet ja luokittelu",
    "motif": "Kääntyvä rakennusosa ja sen näkyvä läpileikkaus",
    "world": "Kappalesaaren laiturilla odottaa majakan pienoismalli, johon saa tutustua pala kerrallaan. Aava nostaa rakennusosan ilmaan ja kääntää sen ennalta määrättyihin katseluasentoihin. Loikka huomaa, ettei etupuolen näkeminen kerro kaikkea: takana voi olla toinen samanlainen pohja ja sisällä tila, jota tasainen siluetti ei paljasta. Tehtävä näyttää nämä tiedot tarkoituksella, ei piilota niitä kameran hallinnan taakse.\n\nRakentelupöydällä ovat rinnakkain esine, sen yksinkertaistettu kappalemalli ja tarvittaessa tasokuvio. Pohja, tahko, särmä, kärki ja kaareva vaippa nimetään kohteeseen sopivasti. Lieriöiden ja kartioiden laajat geometriset luokat eivät rajaudu vain pyöreisiin esineisiin. Kun tehtävä koskee nimenomaan ympyrälieriötä tai ympyräpohjaista kartiota, tämä sanotaan täsmällisesti. Pyramidin ominaisuudet riippuvat sen pohjasta; kaikki pyramidit eivät ole samanlaisia nelisivuisia kattoja.\n\nSaaren tunnekaari rakentuu näkymättömän ymmärtämisestä. Oppija saa tarvittavat näkymät, mutta hänen on itse pääteltävä, mikä niissä säilyy. Hienomotorinen pinonta ei ole oikean vastauksen ehto: osat napsahtavat sallittuihin paikkoihin myös napauttamalla tai näppäimistöltä. Paikalliset huipennukset ovat oikean muotoisia rakennusosia, joiden merkitys näkyy majakassa. Sen valo voi olla kaunis palkinto, mutta onnistumisen todellinen näyttö on kappaleen ominaisuuksiin perustuva valinta tai rakennelma, joka vastaa annettua mallia.",
    "payoff": "Pienen paikallisen majakan runko, varasto ja suojakatto löytävät geometrisesti perustellut muodot.",
    "nodeIds": [
      "M-GEO-05",
      "M-GEO-07",
      "M-GEO-08",
      "M-GEO-09",
      "M-GEO-14",
      "M-GEO-15",
      "M-GEO-16",
      "M-GEO-17",
      "M-GEO-18",
      "M-GEO-3D-PROP-NAME",
      "M-GEO-3D-CLASSIFY",
      "M-GEO-RECTPRISM-ID",
      "M-GEO-RECTPRISM-PROP",
      "M-GEO-CYLINDER-ID",
      "M-GEO-CYLINDER-PROP",
      "M-GEO-CONE-ID",
      "M-GEO-CONE-PROP",
      "M-GEO-PYRAMID-ID",
      "M-GEO-PYRAMID-PROP"
    ]
  },
  {
    "id": "LM15",
    "title": "Peilien ja kulmien kallio",
    "theme": "Piste, jana, suora, kulmat ja symmetriat",
    "motif": "Pysäytetty vedenpeili ja kallioon piirretty tarkka viiva",
    "world": "Peilikallion edessä vesi on tehtävän ajaksi aivan tyyni. Aava käyttää pintaa näyttämönä, jolla kuviot voivat peilautua, kiertyä ja siirtyä. Loikka huomaa, että joskus uusi kuva peittää alkuperäisen täsmälleen, joskus vain näyttää melkein samalta. Kallion taulu ei anna koristeellisen veden vääristää tätä eroa: varsinainen vertailu tapahtuu tasaisella, tarkalla opetuspinnalla.\n\nGeometrian peruskäsitteet saavat paikallisen merkityksen. Piste nimeää paikan, jana kahden päätepisteen välisen suoran osan ja suora jatkuu kuvassa näkyvän alueen ulkopuolelle. Näytölle piirretyn pisteen koko on vain merkki eikä matemaattisen pisteen ominaisuus. Kulmassa huomio on suuntien välisessä avautumisessa, ei kylkien pituudessa. Kulmamitta asettuu selvästi kärkeen ja nollasuuntaan. Tarkka sormiasettelu voidaan korvata napautus- ja askelohjaimilla.\n\nPerheen huipennukset näkyvät viestimerkeissä ja suojapaikan kuvioissa: peilin toinen puoli täydentyy, tuuliviirin kierto toistuu tai heijastinkuvion kulma vastaa suunnitelmaa. Vaikka maailmassa voi näkyä vapaasti huojuvaa vettä ja tuulta, niitä ei käytetä mittausaineistona. Oppija saa täsmällisen geometrian ja elävän maiseman yhtä aikaa. Kallio opettaa katsomaan muodon pysyvyyttä liikkeen läpi, mikä tekee sen pienistä yllätyksistä sekä matemaattisia että visuaalisia.",
    "payoff": "Kallion oma viestimerkki ja heijastin löytävät perustellun geometrian, jonka ystävät tunnistavat molemmilta rannoilta.",
    "nodeIds": [
      "M-GEO-19",
      "M-GEO-20",
      "M-GEO-21",
      "M-GEO-22",
      "M-GEO-23",
      "M-GEO-24",
      "M-GEO-25",
      "M-SYM-01",
      "M-SYM-02",
      "M-SYM-03"
    ]
  },
  {
    "id": "LM16",
    "title": "Kartanlukijoiden saaristo",
    "theme": "Koordinaatit, mittakaava ja kartan etäisyydet",
    "motif": "Ristikkäinen karttaverkko ja muuttumaton mittakaavajana",
    "world": "Kartanlukijoiden saaret ovat kuin maalatut palat merestä nostetussa atlaslehdessä. Aava levittää kartan tasaiseksi, jotta sen viivat eivät muutu aallokon mukana. Loikka katsoo ensin kaunista maisemaa, mutta oppii kiinnittämään huomion siihen, mistä koordinaatit alkavat, kumpi suunta luetaan ensin ja mitä yksi kartan yksikkö tarkoittaa. Kaunis saaristo antaa syyn löytää paikka, tarkka kartta antaa keinon.\n\nJokaisessa tehtävässä lähtöpiste, akselien nimet, yksiköt ja tarvittava kohde ovat näkyvissä. Koordinaattien lukeminen ja pisteen merkitseminen harjoitellaan erikseen ennen niiden yhteistä tehtävää. Kun kartta laajenee kaikkiin neljänneksiin, negatiivinen suunta on selvästi merkitty eikä sitä arvata maiseman väristä. Mittakaavassa kartan pituus ja todellinen pituus liittyvät samaan nimettyyn suhteeseen. Koko kartan zoomaaminen ei muuta painettua mittakaavaa huomaamatta: ruudun pikselit eivät ole oppimistehtävän mittayksiköitä.\n\nPerheen huipennus voi olla eväspaketin löytäminen, tutkimuspaikan nimeäminen tai retkireitin pituuden perusteltu arvio. Tarina kuljettaa ystäviä ratkaisun jälkeen, mutta matka on ohitettava ja se pysähtyy tarvittaessa. Lapsen ei tarvitse osua liikkuvaan kohteeseen tai muistaa reittiä hetkellisen kameran lennon perusteella. Kun karttamerkki on ymmärretty, maailma saa avautua palkinnoksi. Aava kiittää täsmällisestä viestistä, jonka avulla toinenkin voi löytää saman paikan.",
    "payoff": "Paikallinen löytöretki saavuttaa nimetyn kohteen kartan avulla, ja oppijan merkit jäävät yhteiseen retkivihkoon.",
    "nodeIds": [
      "M-COORD-01",
      "M-COORD-02",
      "M-SCALE-01",
      "M-SCALE-02",
      "M-SCALE-03",
      "M-COORD-READ-Q1",
      "M-COORD-PLOT-Q1"
    ]
  },
  {
    "id": "LM17",
    "title": "Rantapenkereiden rakennuspiha",
    "theme": "Piiri, pinta-ala, tilavuus ja pinta-alayksiköt",
    "motif": "Sama rakenne reunaviivana, ruutumattona ja kuutiokerroksina",
    "world": "Rantapenkereiden pihalla Aava suunnittelee pientä kuivaa levähdyspaikkaa. Loikka tuo köyttä reunaan, laattoja pinnalle ja kuutiopaloja varastolaatikkoon. Kaikki kolme toimitusta koskevat samaa paikkaa, mutta niiden kysymykset ovat erilaisia. Pihan ensimmäinen opetus on juuri tämä: ympäri kulkeminen, pinnan peittäminen ja tilan täyttäminen eivät mittaa samaa asiaa.\n\nPiirin työpöytä seuraa reunaviivaa. Pinta-alan työpöytä näyttää saman kokoiset yksikköruudut ilman rakoja tai päällekkäisyyttä. Tilavuuden malli nousee kolmiulotteiseksi, ja sen kerrokset voidaan avata niin, ettei sisälle jäävien kuutioiden määrä muutu arvailuksi. Kaikki tarvittavat mitat näkyvät mallin vieressä. Kamera ei peitä takareunaa, ja vaihtoehtoinen kerrosnäkymä kertoo samat suhteet selkeällä tasopiirroksella.\n\nPihan tarinallinen palkinto on käyttöön sopiva paikka. Reunus voi valmistua paikallisena tehtävänä, vaikka pintalaattojen toinen haara olisi oppijalle vielä tutkimatta. Mitään sisarhaaran valmistumista ei oleteta. Kun pinta-alayksiköt vaihtuvat, oppija näkee yhden suuren ruudun jakautuvan kahteen suuntaan; pituuksien muuntokerroin ei siirry sellaisenaan pinta-alaan. Yllätys syntyy myös siitä, että eri muotoiset pinnat voivat olla yhtä suuria. Aava arvostaa ratkaisua, joka selittää tarvitun määrän, ja Loikka pääsee kokeilemaan valmiin paikallisen levähdyspaikan yhtä näkyvää osaa.",
    "payoff": "Paikallinen levähdyspaikka saa sopivan reunuksen, suojapinnan tai varastotilan ilman määrien sekoittumista.",
    "nodeIds": [
      "M-GMEAS-01",
      "M-GMEAS-02",
      "M-GMEAS-03",
      "M-GMEAS-04",
      "M-GMEAS-05",
      "M-GMEAS-06"
    ]
  },
  {
    "id": "LM18",
    "title": "Mittaretkien jokilaakso",
    "theme": "Suureet, mittausvälineet, yksiköt, tarkkuus ja tulosten arviointi",
    "motif": "Yhteinen nollakohta ja näkyvä mittaustulos yksikköineen",
    "world": "Jokilaakson mittaretkellä Aava kantaa välinelaukkua, joka avautuu juuri oikeaan kohtaan näyttöä. Loikka saa kokeilla, mikä ominaisuus milloinkin kiinnostaa: köyden pituus, retkikorin massa vai astian sisältämä määrä. Maisemassa virtaa vesi, mutta tehtävän mittaväline ei huku siihen. Asteikon lähikuva, kohde ja vastaus pysyvät yhtä aikaa näkyvissä, ja kolmiulotteinen liike pysähtyy tarkastelun ajaksi.\n\nMittauksen periaate rakennetaan näkyvästi. Sovittu yksikkö toistuu ilman välejä, vaaka vertaa massoja ja nesteen määrä ei määräydy yksin astian korkeudesta. Punnitseminen ja kaataminen ovat deterministisen mallin toimintoja, eivät koristeellisen fysiikan arvaamattomia tuloksia. Näytön lukemista harjoitellaan erikseen välineen valinnasta. Virtuaalinen onnistuminen tarkoittaa vain tehtävässä havaittua taitoa; se ei todista fyysisen mittavälineen käsittelyn hallintaa.\n\nTarinan pulmat ovat käytännöllisiä ja paikallisia. Liian lyhyt köysi korvataan oikealla, retkikorin massa merkitään oikein tai astiaan saadaan sovittu määrä. Ennakkoarvio ja tuloksen järkevyys suojaavat mekaaniselta numeron kopioinnilta. Mittauksen uusiminen voi paljastaa aloituskohdan virheen ilman että oppijaa moititaan. Aava näyttää esimerkkiä: luotettava tutkija saa korjata mittauksensa. Jokilaakson huipennus on pieni suunnitelma, joka toimii, koska sen yksi tärkeä mitta on todella ymmärretty.",
    "payoff": "Jokilaakson paikallinen rakennus- tai retkitarve saa luotettavan mittauksen ja sopivan välineen.",
    "nodeIds": [
      "M-MEAS-00",
      "M-MEAS-01",
      "M-MEAS-02",
      "M-MEAS-03",
      "M-MEAS-04",
      "M-MEAS-05",
      "M-MEAS-06",
      "M-MEAS-07",
      "M-MEAS-08",
      "M-MEAS-09",
      "M-MEAS-10",
      "M-MEAS-11",
      "M-MEAS-12",
      "M-MEAS-13",
      "M-MEAS-14",
      "M-MEAS-15",
      "M-MEAS-16"
    ]
  },
  {
    "id": "LM19",
    "title": "Yhteisten mittojen kellotorni",
    "theme": "Ajan suure, kellonaika, kesto ja yksikköjärjestelmien yhteydet",
    "motif": "Kaksi eri asteikkoa, yksi näkyvä tapahtuma",
    "world": "Kellotorni seisoo kahden lahden välisellä harjanteella. Sen toinen taulu näyttää hetken, toinen tapahtuman keston, ja alhaalla kulkee pituuksien, massojen sekä tilavuuksien viestipöytä. Aava vastaanottaa eri yksiköillä kirjoitettuja tietoja ja varmistaa, että ne tarkoittavat samaa asiaa. Loikka huomaa tärkeän poikkeuksen: kaikkia yksiköitä ei voi käsitellä samalla kymmenaskeleisella portaikolla, sillä ajan yksiköt noudattavat omia suhteitaan.\n\nTorni ei juoksuta lasta kellon mukana. Tapahtuman voi pysäyttää ja toistaa, ja mittaus perustuu yhteiseen mallikelloon. Näin ajan ymmärtäminen ei muutu reaktiokykytehtäväksi. Kellonaika nimeää hetken, kesto kertoo kahden hetken välin. Molemmat ovat tarpeellisia, kun ystävät sopivat kohtaamisesta, mutta ne harjoitellaan selkeästi erotellen. Yksikkömuunnoksissa suure pysyy samana ja vain lukuarvo sekä yksikkö muuttuvat toisiaan vastaavasti.\n\nPerheen jännite on viestin väärinymmärryksen mahdollisuus: samalta näyttävä luku voi tarkoittaa aivan eri määrää eri yksikössä. Ratkaisu ei synny pelkästä pilkun siirtämisestä, vaan näkyvästä suhteesta. Litran ja kuutiodesimetrin kohtaaminen saa erityisen pienoismallin, jossa astian kapasiteetti ja täytettävä tila liittyvät toisiinsa. Jokainen onnistunut paikallinen viesti mahdollistaa yhden retken, toimituksen tai tapaamisen. Tornin kellonlyönti on vapaaehtoinen tunnelmaääni; kaikki tärkeä tieto näkyy myös hiljaisuudessa.",
    "payoff": "Paikallisen retken aikataulu tai toimitusmitta ymmärretään samalla tavoin molemmilla rannoilla.",
    "nodeIds": [
      "M-TIME-01",
      "M-TIME-02",
      "M-TIME-03",
      "M-UNIT-01",
      "M-UNIT-02",
      "M-UNIT-03",
      "M-UNIT-04",
      "M-UNIT-05",
      "M-UNIT-06"
    ]
  },
  {
    "id": "LM20",
    "title": "Havaintojen majakka",
    "theme": "Aineiston kerääminen, taulukointi ja diagrammit",
    "motif": "Havaintomerkki, joka säilyttää alkuperäisen paikkansa myös diagrammissa",
    "world": "Havaintojen majakan valo ei syty arvausten voimalla. Sen pöydälle tuodaan pieniä tietoja: kuinka monta lehtivenettä saapui, mitä reittiä ne kulkivat tai miten nimetyn paikan mittaus muuttui. Aava kysyy ensin, mitä halutaan tietää. Loikka oppii, ettei kaunis pylväs yksin auta, jos sen taustalla olevat havainnot on kerätty eri säännöillä.\n\nJokainen havainto saa jäljitettävän merkin. Se voidaan viedä taulukkoon ja edelleen diagrammiin kadottamatta sitä, mistä arvo tuli. Taulukon otsikot eivät katoa vieritettäessä, eikä vastaaminen vaadi usean ikkunan välillä muistamista. Diagrammien asteikkojen ja yksiköiden pitää olla luettavia; tehtävän ratkaisu ei perustu pikselin tarkkaan arvioon. Kun luvut muuttuvat, kuva muuttuu niiden mukana samasta tietomallista. Koristeelliset valopisteet eivät koskaan esitä mittausdataa.\n\nPerheen tarinallinen huipennus voi olla paikallisen retkiryhmän avuntarpeen selviäminen tai kahden keskenään ristiriitaiselta tuntuneen kertomuksen tarkentuminen. Peli ei väitä, että pienestä aineistosta voisi päätellä koko saariston tulevaisuuden. Aava voi sanoa: tämän aineiston perusteella tiedämme tämän, muuta meidän pitää vielä tutkia. Kun tilannekuva valmistuu, majakka lähettää ymmärrettävän viestin. Oppijan tekemä taulukko tai diagrammi on sen todellinen sisältö, ja maiseman syttyvä valo tekee tämän sisällön merkityksen näkyväksi myös tarinassa.",
    "payoff": "Majakan paikallinen tilannekuva antaa ystäville perustellun tiedon retkipaikasta, tarvittavista tarvikkeista tai muutoksesta.",
    "nodeIds": [
      "M-DATA-01",
      "M-DATA-02",
      "M-DATA-03",
      "M-DATA-04",
      "M-DATA-05",
      "M-DATA-06",
      "M-DATA-07",
      "M-DATA-08",
      "M-DATA-09",
      "M-DATA-10",
      "M-DATA-11",
      "M-DATA-12"
    ]
  },
  {
    "id": "LM21",
    "title": "Vaihtoehtojen tuuliluoto",
    "theme": "Tunnusluvut, keskiarvo ja todennäköisyyden perusideat",
    "motif": "Tasattavat kivikasat ja läpinäkyvä mahdollisuuksien pyörä",
    "world": "Tuuliluodolla Aava ja Loikka suunnittelevat pieniä retkiä vaihtelevissa tilanteissa. Pöydällä on havaintoja, joiden suurin, pienin tai tavallisin arvo voi auttaa eri kysymyksissä. Keskellä on tasattavia kivikasoja, joiden avulla keskiarvo saa määrällisen merkityksen. Aava ei esittele keskiarvoa tyypillisenä yksittäisenä tapauksena väkisin: tasattu arvo voi olla sellainen, ettei sitä ollut alkuperäisessä aineistossa lainkaan.\n\nLuodon toisella pöydällä on läpinäkyvä satunnaismalli. Kaikki mahdolliset tulokset näkyvät, ja niiden oletukset kerrotaan. Yhden pyöräytyksen tulos ei todista yleistä sääntöä, eikä epätodennäköinen tulos tarkoita väärää oppilasvastausta. Kun tehtävä käyttää yhtä todennäköisiä vaihtoehtoja, tämä kuuluu malliin, ei piiloon jäävään oletukseen. Kokeilut voi toistaa, mutta voittamiseen sidottua sattumapalkintoa tai pakkotoistoa ei ole.\n\nPerheen tarinallinen jännite on rakentava epävarmuus. Ystävät voivat valita mallin perusteella lupaavamman paikallisen vaihtoehdon ja silti valmistautua muuhunkin lopputulokseen. Peli palkitsee perustelun, ei onnekasta sattumaa. Mahdoton, mahdollinen ja varma erotetaan annetuissa olosuhteissa, eikä pelin pyörää esitetä todellisen sään ennustimena. Tuuliluodon huipennuksessa Aava sanoo ääneen sekä sen, mitä tiedetään, että sen, mitä ei voida luvata. Yhteinen päätös tuntuu luotettavalta juuri tämän rehellisyyden vuoksi.",
    "payoff": "Ystävät tekevät paikallisen, perustellun valinnan ja osaavat sanoa myös sen epävarmuuden.",
    "nodeIds": [
      "M-STAT-01",
      "M-STAT-02",
      "M-STAT-03",
      "M-STAT-04",
      "M-STAT-05",
      "M-PROB-01",
      "M-PROB-02",
      "M-PROB-03",
      "M-PROB-04",
      "M-PROB-05",
      "M-PROB-06"
    ]
  },
  {
    "id": "LM22",
    "title": "Ohjelmoitujen lauttojen poukama",
    "theme": "Algoritmit, graafinen ohjelmointi, testaaminen ja arviointi",
    "motif": "Ohjekortti, sen näkyvä suoritusaskel ja jälki vedessä",
    "world": "Ohjelmoitujen lauttojen poukamassa pieni kuljetuslautta odottaa kärsivällisesti. Se ei osaa arvata, mitä Aava tarkoittaa, mutta seuraa annettuja käskyjä johdonmukaisesti. Loikka rakentaa ohjeita näkyvistä korteista ja huomaa, että ystävällinen aikomus ei yksin vie pakettia oikeaan rantaan. Ohjeen järjestys, lähtötilanne ja tavoite pitää ilmaista riittävän täsmällisesti.\n\nPoukaman koko tehtäväalue näkyy rajatussa katselussa. Komennot ja niiden vaikutukset ovat samalla näytöllä, aktiivinen askel korostuu ja suoritus voidaan pysäyttää tai edetä yksi askel kerrallaan. Kameran vapaa liikuttaminen ei ole ohjelmoinnin edellytys. Mahdollinen törmäys on turvallinen mallin pysähtyminen, ei hahmon vahingoittuminen tai tavaroiden menetys. Sama lähtötila ja ohjelma tuottavat saman matemaattisen tapahtumaketjun.\n\nTestaaminen erotetaan arvioinnista. Yksi taito suorittaa ohjeen järjestelmällisesti, toinen vertaa tulosta tavoitteen ehtoihin. Valmiin ohjelman ymmärtäminen ja oman ohjelman rakentaminen ovat vaihtoehtoisia reittejä silloin, kun kanoninen riippuvuus on any_of. Tarina ei vaadi molempia. Huipennuksessa paikallinen paketti saapuu perille ja lautta jättää veteen lyhyen, vähennettävissä olevan valojäljen. Aava kiittää myös löydetystä virheestä, sillä sen korjaaminen teki ohjeesta ymmärrettävän. Oppijan työ näkyy sekä onnistuneessa matkassa että säilyneessä, tarkistettavassa ohjelmassa.",
    "payoff": "Poukaman paikallinen kuljetus onnistuu testatulla ohjeella, jonka tarkoituksen oppija osaa selittää.",
    "nodeIds": [
      "M-PROG-01",
      "M-PROG-02",
      "M-PROG-03",
      "M-PROG-04",
      "M-PROG-05",
      "M-PROG-06",
      "M-PROG-07",
      "M-PROG-TEST",
      "M-PROG-EVALUATE"
    ]
  },
  {
    "id": "UM-01",
    "title": "Vihjeiden neuvosto",
    "theme": "Looginen päättely, matemaattinen kieli, perusteleminen ja kattava luettelointi",
    "motif": "Väite, perustelukivi ja vastarannalta saapuva vastaus.",
    "world": "Sumun keskellä oleva puinen neuvostolaituri ei ole oikeussali, vaan paikka, jossa ystävät opettelevat ymmärtämään toisiaan. Pöydällä on märkiä kirjeitä, lyhtyjen koemerkkejä ja kartta, jonka jokaisen väitteen viereen voi asettaa perustelun. Aava ottaa tulijan vastaan kysymällä: ”Mitä oikeastaan tiedämme?” Loikka uskaltaa arvata, mutta nauraa lempeästi omalle liian nopealle päätelmälleen. Majava ei ole vastustaja; hänen epäilyksensä antaa todistamiselle inhimillisen syyn. Hän tarvitsee ymmärrettävän lupauksen kotinsa turvasta. Elävä maalaus hengittää reunoiltaan. Sumun paljastama puunsyy, veden heijastus ja kaukainen lyhty antavat tilan tunnun, mutta itse päättelypöytä on tyyni. Kuvalliset väitteet, lyhyet tekstit ja symbolit voidaan avata vierekkäin. Lapsen oma perustelu saa aikaa; äänekkyys, kirjoitusnopeus tai valmiin lauseen tunnistaminen ei korvaa sen merkitystä. Lyhtyjen kirkastuminen osoittaa yhteisymmärryksen syntymistä, ei järjestelmän lupausta täydellisestä osaamisesta. Perheen pienissä huipennuksissa viesti saavuttaa toisen rannan, epäselvä sopimus muuttuu reiluksi tai perusteltu silta kantaa ensimmäisen retkikorin. Jokainen retki alkaa omasta kysymyksestään. Neuvoston lämpö syntyy siitä, että virheestä voi palata yhteiseen tutkimiseen ilman kasvojen menettämistä. Oivallus on tämän näyttämön voimakkain tehoste.",
    "payoff": "Paikallinen viesti tai perusteltu sopimus synnyttää näkyvän kohtaamisen; jokainen latva ratkaisee oman neuvottelunsa.",
    "nodeIds": [
      "M79-LOGIC-01",
      "M79-LOGIC-02",
      "M79-COMB-01",
      "M79-ARG-01",
      "M79-TEXT-01",
      "M79-TEXT-02",
      "M79-PROOF-01",
      "M79-TRUTH-01"
    ]
  },
  {
    "id": "UM-02",
    "title": "Lyhtyjen konepaja",
    "theme": "Algoritmien pilkkominen, ohjelmointi, testaus, selkeys ja tutkimustyökalut",
    "motif": "Pieni koelyhty, näkyvä suoritusaskel ja avoin ohjekirja.",
    "world": "Konepaja seisoo ruovikon reunalla, ja sen ikkunat muistuttavat pienen teatterin näyttämöitä. Yhdessä liikkuu näytevene, toisessa lyhtyrivi, kolmannessa kasvaa laskurin ruudukko. Kaikkia ohjaa ymmärrettävä, askel kerrallaan seurattava ohjelma. Sulka tuntee koneet, mutta Aava huolehtii seuraavasta käyttäjästä: voiko hän ymmärtää, mitä täällä tapahtuu? Loikka saa kokeilla ja erehtyä, ja kone noudattaa huvittavan kirjaimellisesti väärääkin ohjetta. Virhe ei kuitenkaan riko saarta eikä kuluta palkintoja. Työpöydän kolme aluetta ovat ohjelma, näkyvät arvot ja tulos. Kun suoritus pysäytetään, kaikki jää tarkasteltavaksi. Tyhjä syöte on yhtä arvokas tutkimuskohde kuin suuri juhlaväkijoukko. Selkeä nimi on pieni ystävällinen teko tulevalle rakentajalle. Testauksen tarkoitus on etsiä myös omaa arvausta vastaan puhuva tapaus, ei vain kerätä vihreitä valoja. Pajan huipennus on rauhallinen luottamus: jokin yhteinen laite voi jatkaa tehtäväänsä ystävien levätessä. Myöhäinen vene löytää valoon, näytekorit palaavat oikeille paikoille tai toinen käyttäjä osaa jatkaa keskeneräistä tutkimusta. Ohjelman ja maailman näkymät liittyvät samaan selitettävään malliin. Koristeellinen rattaan pyörähdys jää palkkioksi, ei arvioinnin kelloksi. Oppija saa tuntuman siihen, että hyvä ohjelma on myös huolenpitoa toisesta ihmisestä.",
    "payoff": "Yön reittivalo auttaa paikallisen veneen perille; toisella latvareitillä tutkimustyökalu tuottaa perustellun uuden havainnon.",
    "nodeIds": [
      "M79-ALGTH-01",
      "M79-PROG-01",
      "M79-PROG-CLEAR",
      "M79-PROG-TEST",
      "M79-PROG-PRACTICE",
      "M79-PROG-02",
      "M79-TECH-01"
    ]
  },
  {
    "id": "UM-03",
    "title": "Nollalaiturin syvänne",
    "theme": "Kokonaislukujen järjestys, etäisyys, laskutoimitukset, vastaluku ja itseisarvo",
    "motif": "Nollalaituri, vastakkaiset merkkivalot ja pintaan nouseva tutkimuskori.",
    "world": "Nollalaituri kelluu kirkkaan veden rajassa. Sen alla näkyvät tummemmat tutkimusmerkit, yläpuolella kallion mittapisteet. Aava tuntee pinnan, Loikka viihtyy myös sen alapuolella, ja molemmat voivat olla yhtä kaukana yhteisestä lähtöpaikasta. Maailman tärkeä havainto on, ettei alhaalla tarkoita huonoa eikä negatiivinen tarkoita epäonnistumista. Luvun merkki kertoo sovitusta suunnasta. Kylmä aamu, pinnankorkeuden muutos ja etäisyys ovat eri tilanteita, jotka tekevät samat lukusuhteet ymmärrettäviksi. Tehtävät avautuvat tyynenä maalattuna poikkileikkauksena. Lukusuoran nolla, mittaväli ja kaikki vastaamiseen tarvittavat merkit näkyvät yhtä aikaa. Syvyys ei piilota numeroita eikä vaadi sukellusohjausta. Reunan kalan varjo voi kulkea ohi, mutta mittauksen alkaessa se rauhoittuu. Aava asettaa lähtöarvon, Loikka muutoksen, ja oppija erottaa sijainnin, suunnan sekä matkan pituuden toisistaan. Huipennuksissa tutkimuskori saadaan pinnalle, poijun viesti löydetään tai ystävät kohtaavat nollalaiturissa. Tunteellinen ydin on sama: eri puolilla oleminen ei estä yhteistä mittaa eikä tapaamista. Kokonaislukujen kertolaskun negatiivinen kerroin käsitellään taulukon rakenteena, jotta tarina ei opeta mahdotonta kirjaimellista ”negatiivista toistamista”. Aavalla ja Loikalla on aina näkyvä koti, johon suunnat voidaan suhteuttaa.",
    "payoff": "Kunkin latvan oikea suunnan tai etäisyyden tulkinta ratkaisee oman tutkimuskorin, poijun tai kohtaamisen tehtävän.",
    "nodeIds": [
      "M79-INT-ORDER",
      "M79-INT-DIST",
      "M79-INT-01",
      "M79-INT-ADD",
      "M79-INT-SUB",
      "M79-INT-MUL",
      "M79-INT-DIV",
      "M79-OPPOSITE-01",
      "M79-ABS-01"
    ]
  },
  {
    "id": "UM-04",
    "title": "Osuuksien purjehdus",
    "theme": "Murtolukujen kertominen ja jakaminen sekä desimaalilaskujen varmentaminen",
    "motif": "Läpinäkyvä kokonaisen kehys, viirinauha ja tuulen täyttämä pieni purje.",
    "world": "Purjeiden korjauspoukama on hiljainen värien ja kankaiden maailma. Aavan pöydälle mahtuvat kokonainen purje, siitä merkitty osuus ja osasta tarvittava uusi pala. Loikka kantaa nauhakeloja, joista viirejä leikataan samanmittaisiksi. Näissä töissä luvut eivät jää irtonaisiksi symboleiksi: lasku kertoo, kuinka suuri osa kokonaisesta muuttuu tai kuinka monta sovittua palaa siihen mahtuu. Purjevene odottaa rannassa ystävällisesti; tehtävän virhe ei vie sitä myrskyyn. Kokonaisen määritelmä on näkyvissä joka vaiheessa. Ruudukko, lukusuora ja paikka-arvotaulu tuodaan esiin vain silloin, kun ne auttavat ymmärtämään kyseistä suhdetta. Käänteisluku palauttaa skaalauksen yhteen, ja alle yhdellä kertominen tai jakaminen saa konkreettisen vertailukohteen. Kauniit kangaskuviot ovat taustalla; laskun kannalta samanarvoiset palat eivät eroa värin perusteella. Huipennukset valmistavat täsmällisen paikallisen esineen: viirit ulottuvat koko merkittyyn kohtaan, purje sopii mastoon tai retkilaatikon määrät täsmäävät. Aava nostaa valmiin työn valoa vasten, ja Loikka löytää siitä pienen yhteisen merkin. Veneen lähtö on lyhyt hengähdys työpöydän jälkeen. Sama taito palaa siirtotehtävässä ilman kangasta, jotta oivallus voi irrota tutusta kuvituksesta ja kulkea mukana muuallakin saaristossa.",
    "payoff": "Paikallisen latvan valmistama purje, viiri tai täsmällinen varuste avaa oman lyhyen koepurjehduksen.",
    "nodeIds": [
      "M79-RECIP-01",
      "M79-FRAC-MUL",
      "M79-FRAC-DIV",
      "M79-DEC-ADD",
      "M79-DEC-SUB",
      "M79-DEC-ADD-SUB",
      "M79-DEC-MUL",
      "M79-DEC-DIV"
    ]
  },
  {
    "id": "UM-05",
    "title": "Kivien salainen tähtitorni",
    "theme": "Jaollisuus, alkutekijät, potenssit ja potenssisääntöjen rakenteet",
    "motif": "Tekijäpuu, yksi perustalamppu ja kerroksittain avautuva tähtitorni.",
    "world": "Vuoripolun kivissä on pieniä reikiä, joihin lyhdyt voidaan asettaa riveiksi. Osa kivimääristä järjestyy monella tavalla, osa vain yhteen pitkään riviin. Aava ei kutsu niitä itsepäisiksi, vaan kiinnostaviksi. Loikka avaa suurten lukujen rakennetta tekijäpuiksi ja kulkee siitä toistuvan kertomisen lyhtytorniin. Yksi kerros voi sisältää kokonaisia samanlaisia ryhmiä, ja valojen nopeasti kasvava määrä antaa voimakkaan elämyksen ilman, että oppijan täytyy laskea jokaista pistettä käsin. Tornin varsinainen työpinta on rauhallinen, maalattu rakennekuva. Tekijät, ryhmät ja eksponentit pysyvät näkyvissä, vaikka taustalla avautuu suuri yömaisema. Nollakerroksen yksi lamppu on pieni yllätys, joka jää muistoon. Lyhdyn mallissa kanta on suurempi kuin yksi, joten negatiiviset eksponentit kuvaavat pienempiä osuuksia. Yleinen käänteispotenssin sääntö tutkitaan erikseen myös muilla nollasta poikkeavilla kannoilla; negatiivinen eksponentti ei aina pienennä arvoa. Jokainen tehtävä antaa oman taulukkonsa eikä vaadi toisen potenssikohtauksen näkemistä. Säännöt palautetaan tarvittaessa tekijöihin; lyhyt symbolimerkintä ansaitsee merkityksensä. Perheen huipennukset eivät ole lukkojen yhdistelmäkoodeja. Tiivis lauseke lähettää oikean mittaisen viestin, tekijärakenne kokoaa ehjän karttamerkin ja tarpeeksi pieni valomäärä säilyttää yöeläinten rauhan. Jokaisella työllä on oma paikallinen onnistumisensa. Katse voi lopuksi nousta tornista tähtitaivaaseen: samat selkeät rakenteet auttavat kuvaamaan valtavia määriä, mutta tässä oppimisessa yksikään laskusääntö ei synny pelkästä tähtisateesta.",
    "payoff": "Kukin latva päättää oman valoviestin tai rakenteen; tornin näyttävä valaistus on paikallinen palkkio, ei kaikkien potenssihaarojen portti.",
    "nodeIds": [
      "M79-DIVIS-01",
      "M79-PRIME-01",
      "M79-PRIMEFACT-01",
      "M79-POWER-01",
      "M79-POWER-POS",
      "M79-POWER-ZERO",
      "M79-POWER-NEG",
      "M79-POWER-PROD",
      "M79-POWER-QUOT",
      "M79-POWER-POWER",
      "M79-POWER-SIMPLIFY"
    ]
  },
  {
    "id": "UM-06",
    "title": "Juuriportin mittarit",
    "theme": "Neliöjuuret, reaaliluvut, tarkat arvot ja tarkoituksenmukainen likiarvo",
    "motif": "Neliöruutu, kahden tunnetun koon väli ja vierekkäiset = sekä ≈ -merkit.",
    "world": "Juuriportti on kallioon rakennettu puutarha, jonka neliöalat loistavat sateen jälkeen. Aava tietää, kuinka paljon maata tarvitaan, mutta portin rakentaminen kysyy sivun pituutta. Loikka oppii kulkemaan neliöinnistä takaisin juuriin ja erottamaan täsmälleen sopivan mitan perustellusta arviosta. Joitakin kohtia ei voi nimetä lyhyellä päättyvällä desimaalilla, mutta ne eivät silti ole epämääräisiä. Karttaan jää tarkka symboli ja tarvittaessa käytännöllinen arvio sen viereen. Maailmassa on erityinen lempeä hiljaisuus. Valo liikkuu kiven pinnalla, mutta työpöydän neliöt ja lukusuorat pysyvät vakaina. Kahden tutun neliön väliin asettuva uusi koko tekee arvioinnista näkyvän tutkimuksen. Laskimen antama näyttö ei saa teeskennellä olevansa koko luku. Aavan kysymys ”Kuinka tarkasti meidän täytyy tietää?” erottaa matemaattisen täsmällisyyden ja rakentajan tarpeen toisistaan. Huipennuksissa katos sulkeutuu, portti saa oikean mittansa tai kartan koordinaatti löytyy. Loikka voi onnistua yhtä arvokkaasti tarkalla juurimerkinnällä kuin tilanteeseen sopivalla likiarvolla, kun hän tietää niiden eron. Puutarhan viimeinen kukka ei odota kaikkia rinnakkaisia juuritehtäviä; jokainen pieni suunnitelma antaa oman lopetuksensa. Kiven reunaan jää näkyvä ≈ tai = muistoksi siitä, kuinka huolellinen kieli voi olla kaunista.",
    "payoff": "Paikallisen mitan ratkaisu sulkee katoksen tai avaa portin; täsmällisyys ja arvio saavat kumpikin tarkoitukseensa sopivan päätöksen.",
    "nodeIds": [
      "M79-SQRT-01",
      "M79-SQRT-EXACT",
      "M79-SQRT-EST",
      "M79-SQRT-02",
      "M79-SQRT-03",
      "M79-REAL-01",
      "M79-REAL-02",
      "M79-EXACTAPPROX-01",
      "M79-ROUND-01"
    ]
  },
  {
    "id": "UM-07",
    "title": "Satasaaren vesineuvosto",
    "theme": "Prosentin vertailuperusta, osuus, määrä, muutos ja prosenttiyksikkö",
    "motif": "Sadan osan vesipalkki, kaksi tasavertaista allekirjoitusta ja paikallinen sivuportti.",
    "world": "Majavan koti tarvitsee vettä, ja Aava kaipaa lammen vanhan putouksen ääntä. Satasaaren vesineuvosto näyttää, miten kaksi toivetta voi olla yhtä aikaa järkeviä. Suuri maalattu vesikartta jakautuu selvästi nimettyihin kokonaisuuksiin. Loikka huomaa, että sama luku voi kuulostaa ristiriitaiselta, jos ystävät puhuvat eri perusarvosta. Kertomuksen yllätys ei ole paha majava vaan väärinymmärrys: molemmat ovat kuulleet sanan ”osuus” eri tavalla. Pöydällä oleva koepuro on matemaattinen malli, jonka valitut kokonaismäärät ja prosenttiosuudet on annettu näkyviin. Se ei väitä kuvaavansa oikean valuma-alueen hydrologiaa. Osuus, muutos ja uusi kokonaisuus saavat eri paikat samassa kuvassa. Aava nimeää vertailuperustan ääneen, ja Loikka antaa majavan tarkistaa saman lauseen omasta näkökulmastaan. Allekirjoitus on kohtaaminen, ei palkinto painostamisesta. Jokainen latva ratkaisee yhden paikallisen sopimusehdon tai oman sivuhaaran koejärjestelyn. Näin osuuden laskeminen, vertailuprosentti ja prosenttiyksikkö voivat kukin johtaa valmiiseen kohtaukseen ilman keskinäistä pakkojärjestystä. Pieni portti kääntyy, pesän vesi rauhoittuu ja putouksen yhdestä uomasta kuuluu solina. Aavan ilo ja majavan helpotus näkyvät rinnakkain. Laajempi vesiputouskohtaus voi muistella nähtyjä sopimuksia, mutta yksikään ratkaisematon sisartehtävä ei mitätöi jo saavutettua yhteisymmärrystä.",
    "payoff": "Jokainen prosenttilatva tuottaa oman ymmärretyn osasopimuksensa ja näkyvän paikallisen virran palautumisen.",
    "nodeIds": [
      "M79-PCT-REFBASE",
      "M79-PCT-SHARE",
      "M79-PCT-AMOUNT",
      "M79-PCT-BASE",
      "M79-PCT-CHANGED",
      "M79-PCT-CHANGE",
      "M79-PCT-COMP",
      "M79-PCT-PP"
    ]
  },
  {
    "id": "UM-08",
    "title": "Muuttujien telakka",
    "theme": "Muuttujan roolit, lausekkeet, termit ja polynomien laskurakenteet",
    "motif": "Piirustuspaperi, etumerkkinsä säilyttävä termilappu ja yhteinen katos.",
    "world": "Muuttujien telakalla ei rakenneta vain yhtä oikeankokoista venettä. Aava haluaa ohjeita, jotka auttavat erilaisia retkikuntia, ja Loikka huomaa kirjaimen säästävän kokonaisen pinon uusia piirustuksia. Sama x voi tarkoittaa valittavaa mittaa tai yhdessä tilanteessa vielä tuntematonta lukua. Se ei ole naulan, laudan tai omenan nimi. Telakan lämpimän puun keskellä muuttujan abstrakti luonne saa konkreettisen syyn: hyvä suunnitelma voi palvella monia erilaisia tarpeita. Työpöydällä olevat lausekkeet muistuttavat selkeitä rakennuspiirustuksia. Termit rajataan etumerkkeineen, osatulot asettuvat ruudukkoon ja sulut kertovat, mikä kuuluu samaan kokonaisuuteen. Aava ei kiirehdi Loikkaa; ennen jokaisen muunnoksen hyväksymistä kysytään, säilyykö arvo. Algebralliset laatat ovat merkittyjä malleja, joten negatiivinen termi ei muutu tarinassa mahdottomaksi negatiiviseksi lautapinnaksi. Perheen huipennuksissa yhteinen tilaus valmistuu, väärinkäsitys korjaantuu tai suuri katos kokoaa ystävät kuivaan työtilaan. Näyttämön tärkein esine on piirustus, jota toinenkin voi käyttää. Lyhentäminen ei merkitse merkityksen katoamista vaan sen säilymistä vähäisemmällä toistolla. Jokainen polynomiretki ratkaisee oman tilauksensa eikä vaadi rinnakkaista laskutoimitusta tarinaportiksi. Aava ripustaa valmiin ohjeen pajan seinään, ja Loikka huomaa oman ajattelunsa muuttuneen yhteiseksi työkaluksi.",
    "payoff": "Kunkin latvan valmis lasku toteuttaa oman tilauksen; polynomien tulon reitti huipentuu pajan suuren katoksen valmistumiseen.",
    "nodeIds": [
      "M79-VAR-VARYING",
      "M79-VAR-UNKNOWN",
      "M79-VAR-01",
      "M79-EXPR-EVAL",
      "M79-EXPR-FORM",
      "M79-EXPR-SIMPLIFY",
      "M79-TERM-01",
      "M79-POLY-CONCEPT",
      "M79-POLY-01",
      "M79-POLY-ADD",
      "M79-POLY-SUBTRACT",
      "M79-SIGN-PARENS",
      "M79-POLY-SUB",
      "M79-POLY-MUL-MONO",
      "M79-POLY-MUL"
    ]
  },
  {
    "id": "UM-09",
    "title": "Tasapainon sulku",
    "theme": "Yhtälön muodostaminen, ratkaiseminen, tarkistus, epäyhtälöt ja vaillinainen toisen asteen yhtälö",
    "motif": "Kaksi säilyvää puolta, rajamerkki ja vasta kokeiltuna avautuva sulku.",
    "world": "Tasapainon sulku on pieni koemaailma lammen sivussa. Siellä säädöt voidaan esittää kahdella eri tavalla, mutta niiden on tarkoitettava samaa. Aava pitää näkyvissä alkuperäisen kysymyksen, Loikka kokeilee sallittuja muutoksia ja Sulka muistuttaa tarkistamaan tuloksen. Yhtälö avautuu, kun oppija ymmärtää koko ratkaisujoukon säilymisen: esimerkiksi saman luvun lisäämisen molemmille puolille tai puolten kertomisen ja jakamisen samalla nollasta poikkeavalla luvulla. Veden liike alkaa vasta vastauksen jälkeen eikä johda arvaamalla oikeaan numeroon. Epäyhtälön alueella sankarillinen oivallus on, että kelvollisia vastauksia voi olla monta. Lukusuoran avoin tai suljettu pääte kertoo, kuuluuko rajakohta mukaan. Neliöehdon portilla taas sama neliö voi syntyä kahdesta vastakkaisesta luvusta. Aava ei pyyhi toista ratkaisua pois siksi, että maisemassa näkyisi vain yksi fyysinen reitti; matemaattinen ratkaisujoukko ja valittu pelillinen reitti pidetään erillään. Huipennukset antavat oikealle asetukselle tarkoituksen. Koesulku avaa paikallisen uoman, kuormaraja tekee mallisillan suunnitelmasta kelvollisen tai kaksi mahdollista porttipaikkaa antaa ystäville valinnan. Jokainen tapaus on itsenäinen pieni tutkimus, jonka lähtöehdot löytyvät heti ruudulta. Kertaus ei sulje jo avattua maailman uomaa: se palaa koepöydän uuteen malliin. Näin tarkkuus, luottamus ja tutkimisen vapaus mahtuvat samaan tarinaan.",
    "payoff": "Paikallinen sulku tai portti avautuu perustellulla ja tarkistetulla ratkaisulla; epäyhtälössä palkitaan myös kaikkien sallittujen vaihtoehtojen ymmärtäminen.",
    "nodeIds": [
      "M79-EQ1-FORM",
      "M79-EQ1-SOLVE",
      "M79-EQ1-CHECK",
      "M79-INEQ-01",
      "M79-INEQ-SOLVE",
      "M79-QUAD-INCOMP-01",
      "M79-QUAD-INCOMP-02"
    ]
  },
  {
    "id": "UM-10",
    "title": "Kahden virran sopimus",
    "theme": "Yhtälöparit, verrannot sekä suora ja kääntäen verrannollisuus",
    "motif": "Kaksi ehtolappua, niiden yhteinen kohta ja vastaavat mittaparit.",
    "world": "Kaksi pientä koepuroa kohtaa saariston yhteisellä suunnittelupöydällä. Aava tarvitsee vettä yhteen tarkoitukseen, majava toiseen, ja Loikka etsii ratkaisua, joka noudattaa molempia ehtoja. Toinen toive ei syrjäytä toista, eikä yhteinen vastaus synny kahdesta eri lukuparista. Yhtälöparin käsite saa siten ystävyyden muodon: sama suunnitelma täytyy pystyä lukemaan kummankin näkökulmasta. Jos ratkaisu puuttuu, ehdot tarkistetaan lempeästi; kukaan ei ole sen vuoksi paha tai huono. Verrantojen reitillä pienoismalli kasvaa tai pienenee säilyttäen suhteensa. Toisessa osassa tutkimuspöytää sama määrä jakautuu eri tavoin, ja vakiotulo tuo esiin kääntäen verrannollisuuden. Mallien ihanne-ehdot ilmoitetaan lyhyesti. Esimerkiksi lisäpumput eivät tarinassa automaattisesti puolita kaikkien oikeiden töiden aikaa; näin käyttäytyy juuri tässä annettu malli. Elävä maalaus näyttää koko neuvottelupöydän, arvoparit ja vaihtoehdot yhtä aikaa. Leikkauspiste voi saada taakseen lyhyen maisemakuvan, mutta tarkka ratkaisu luetaan tasokoordinaatistosta. Huipennuksessa yksi paikallinen koesuunnitelma alkaa toimia, majava ja Aava allekirjoittavat sen ja Loikka kuljettaa viestin eteenpäin. Samaan yhteiseen sopimusmaailmaan kuuluu monta itsenäistä tapausta. Ne eivät vaadi toistensa ratkaisuja, mutta jokainen vahvistaa tarinan ajatusta yhdessä sovitettavista tarpeista.",
    "payoff": "Jokainen latva ratkaisee oman koesuunnitelman: yhteinen lukupari, mittasuhde tai vakiona säilyvä rakenne saa näkyvän paikallisen toteutuksen.",
    "nodeIds": [
      "M79-SYSTEM-01",
      "M79-SYSTEM-GRAPH",
      "M79-SYSTEM-ALG",
      "M79-PROP-01",
      "M79-PROP-SOLVE",
      "M79-DIRECTPROP",
      "M79-INVERSEPROP"
    ]
  },
  {
    "id": "UM-11",
    "title": "Kasvihuoneen säännöt",
    "theme": "Riippuvuus, funktion käsite ja esitykset, lukujonot sekä paraabelit",
    "motif": "Kasvava ikkunarivi, sama syöte–tulospari ja lämmin valo.",
    "world": "Kasvihuoneen lasiseinien takana näkyy huurteinen vuori, mutta sisällä valo on lämmin. Aava hoitaa tutkimuspöytää ja Loikka kokeilee sääntöjä, jotka yhdistävät syötteen tulokseen. Kasvien oikea kasvu ei ole yksinkertainen tehtäväkaava; siksi pöydän mallit merkitään selvästi kuvitteellisiksi laskusäännöiksi tai rajatuiksi havaintoaineistoiksi. Ystävät voivat tutkia rakennetta ilman, että maalaus väittää yhden liu'un selittävän koko luonnon. Ikkunarivien kuviot kasvavat loogisesti, ja niiden rinnalla näkyvät vaiheiden numerot. Funktiokone palauttaa yhdelle syötteelle yhden arvon, mutta kaksi eri syötettä saa aivan hyvin päätyä samaan tulokseen. Taulukko, arvoparit ja kuvaaja ovat eri ikkunoita samaan suhteeseen. Aava kysyy, mitä esityksestä voi nähdä helposti, ja Loikka huomaa, miksi hyvä kuva ei saa piilottaa akselien merkitystä. Lukujonojen huipennus valaisee kokonaisen uuden ikkunarivin. Kuvaajan tulkinta antaa yhteiselle havainnoinnille sopivan ajankohdan. Paraabelireitti avaa malliin kaarevan valoikkunan, jonka tarkat pisteet ovat oppijan rakentamia. Näitä tapahtumia voi kohdata eri järjestyksissä: kasvihuoneessa on useita itsenäisiä siipiä. Maailman yhtenäisyys syntyy valosta, tutkimusvihkoista ja ystävien uteliaisuudesta. Jokaisen uuden säännön vieressä on myös kysymys siitä, missä sen käyttökelpoisuus päättyy.",
    "payoff": "Perheen paikalliset latvat avaavat oman valoikkunan, havaintoajan tai uuden ikkunarivin; jokainen ratkaisu valmistaa yhden kokonaisen tutkimuksen.",
    "nodeIds": [
      "M79-DEP-01",
      "M79-FUNC-01",
      "M79-FUNC-TABLE",
      "M79-FUNC-GRAPH",
      "M79-SEQ-STRUCTURE",
      "M79-SEQ-RULE",
      "M79-SEQ-01",
      "M79-GRAPH-MONO",
      "M79-PARABOLA",
      "M79-PARABOLA-GRAPH"
    ]
  },
  {
    "id": "UM-12",
    "title": "Majakkaviivan kartta",
    "theme": "Lineaarisen funktion kuvaaja, kulmakerroin, vakiotermi ja nollakohta",
    "motif": "Majakan lähtövalo, kaksi mittanuolta ja x-akselin kohtaamismerkki.",
    "world": "Majakkaviivan kartta on pöydälle levitetty näköala saaristoon. Sen yläpuolella todellinen majakka loistaa pehmeästi, mutta tehtävien akselit pysyvät täsmällisinä. Aava merkitsee karttaan sen, mistä muutos alkaa, ja Loikka kysyy, kuinka paljon yksi askel muuttaa arvoa. He oppivat, että jyrkkä kuva ei yksin kerro kulmakerrointa, jos asteikko vaihtuu. Myös lähes vaakasuora viiva voi edustaa suurta muutosta toisessa mittakaavassa. Perheen näkyvä draama on kohtaaminen. Missä reitin mallisuure saavuttaa sovitun nollatason? Kuvaaja näyttää paikan, lasku voi täsmentää sen ja tarkistus kertoo, ovatko ne sopusoinnussa. Y-akselin alkuarvo ja x-akselin nollakohta saavat tarkoituksella eri esineet ja nimet, jotta niiden ero jää mieleen. Väri tukee erottelua, mutta merkinnät tekevät saman ilman värinäköäkin. Työalueessa ovat yhtälö, akselit ja tarvittavat pisteet. Oppija ei joudu seuraamaan liikkuvaa venettä saadakseen luvun talteen. Valmiin ratkaisun jälkeen kamera voi näyttää paikallisen majakan ja veneen valojen kohtaamisen. Tällainen pieni näytös antaa abstraktille nollakohdalle tunnetta ilman, että oppimisen totuus riippuu näyttävästä animaatiosta. Jokainen latva rakentaa oman kohtaamisensa tai lähtömerkkinsä; myöhempi kertaus säilyttää nämä muistot ja tutkii uutta karttaa.",
    "payoff": "Nollakohdan integraatio päättyy paikalliseen valomerkkien kohtaamiseen; kulmakerroin ja alkuarvo ratkaisevat omat karttatehtävänsä.",
    "nodeIds": [
      "M79-LINE-GRAPH",
      "M79-SLOPE",
      "M79-INTERCEPT",
      "M79-ZERO-GRAPH",
      "M79-ZERO-CALC",
      "M79-ZERO"
    ]
  },
  {
    "id": "UM-13",
    "title": "Kulmatuulen niemimaa",
    "theme": "Tasogeometrian käsitteet, kulmasuhteet, yhtenevyys, yhdenmuotoisuus ja konstruktiot",
    "motif": "Tuuliviiri, näkyvä rakennuskaari ja oikeaan aukkoon sopiva ikkuna.",
    "world": "Kulmatuulen niemimaa kohoaa merestä loivina kallioina. Tuuliviirit, polkuristeykset ja pienten retkimajojen ikkunat tarjoavat kokoelman muotoja, mutta jokainen tarkka geometrinen kysymys avataan tyynelle karttapöydälle. Aava löytää kulmien suhteista järjestystä, ja Loikka oppii varomaan silmämääräistä arvausta. Se mikä näyttää vaakasuoralta tai samanmuotoiselta, täytyy vielä tutkia ehtojen avulla. Maisema on kutsu katsomaan, ei vastaus itsessään. Niemimaan arkkitehtuurissa toistuvat samat muodot eri asennoissa ja koossa. Yhtenevä varaikkuna mahtuu aukkoon kierron tai peilauksen jälkeen. Yhdenmuotoinen piirros säilyttää suhteet mutta tarvitsee toisen mittakaavan. Konstruoinnin kaaret jäävät näkyviin kuin maalauksen valmistavat luonnosviivat: niiden avulla oppija voi selittää, miksi rakennettu kohta täyttää ehdon. Huipennuksissa reittiviitat osoittavat oikein, retkimajan katto sulkeutuu tai puuttuva varaikkuna tuo lämmön takaisin lukupaikkaan. Jokainen rakennus on paikallinen, jotta eri kulmahaarat eivät pakota toisiaan kronologiseen järjestykseen. Aava antaa Loikalle aikaa kääntää kuviota rauhassa. Oivallus siitä, että ominaisuus säilyy asennon vaihtuessa, saa maailmassa kauniin muodon: kotia kohti osoittava merkki on sama merkki, vaikka sitä katsoisi toiselta rannalta. Päätöshetki on usein pieni yhteinen istahdus rakennetun suojan alle.",
    "payoff": "Kukin latva valmistaa oman reittimerkin, katto-osan tai varaikkunan; kuvion ominaisuus näkyy toimivana yhteisenä suojana.",
    "nodeIds": [
      "M79-RAY",
      "M79-CURVE",
      "M79-LINEREL",
      "M79-VERTICAL-ANGLES",
      "M79-SUPPLEMENTARY-ANGLES",
      "M79-ANGLE-REL",
      "M79-POLY-ANGLES",
      "M79-CONGRUENCE",
      "M79-SIMILARITY",
      "M79-SIMILAR-SCALE",
      "M79-CONSTRUCT",
      "M79-TRI-ANGLE-SUM",
      "M79-CONG-CRIT",
      "M79-SIM-CRIT"
    ]
  },
  {
    "id": "UM-14",
    "title": "Köysisillan mittausretki",
    "theme": "Pythagoraan lause, sen käänteislause ja trigonometriset sivu- sekä kulmasuhteet",
    "motif": "Kolme neliötä, nimetty näkökulma ja vastarannan merkkivalo.",
    "world": "Kallioiden välisessä poukamassa tarvitaan tutkimuskorille reitti. Aava ja Loikka toimivat pienoismallin ja etämittauksen avulla, eikä oppijan tarvitse tehdä vaarallista hyppyä. Maisema antaa korkeudelle, vaakamatkalle ja näkölinjalle välittömän merkityksen. Samaan aikaan näkyvä tarkka kolmio kertoo, mitä mitataan. Reittikamera on valmiiksi asetettu; mikään tarvittava sivu ei katoa kallion taakse eikä oikea luku riipu hiiren vakaudesta. Pythagoraan lauseen aloituspöydässä kolme neliötä tekee suhteen havaittavaksi. Neliöjuuri tulee mukaan vasta, kun sivun pituutta ratkaistaan. Sinin, kosinin ja tangentin reiteillä valittu kulma määrää sivujen roolit. Aava voi siirtää katsettaan toiseen terävään kulmaan, jolloin Loikka huomaa saman sivun nimen muuttuvan. Tässä on pieni draamallinen yllätys: rakenne on sama, näkökulma vaihtuu. Huipennuksessa oikein mitoitettu malliköysi ylittää paikallisen välin tai havaintoputken suunta kohtaa kaukaisen merkkivalon. Ystävien yhteistyö näkyy tavassa, jolla toinen pitää lähtötiedot esillä ja toinen perustelee ratkaisun. Suuri sillanäkymä voi olla hengästyttävän kaunis, mutta laskua varten vesi, tuuli ja taustapartikkelit rauhoittuvat. Oppijan onnistumista juhlistaa yhteys, ei uhasta viime sekunnilla selviytyminen. Tarvittaessa koko tehtävä toimii samalla tarkalla tasomallilla.",
    "payoff": "Sivu- ja kulmalatvat avaavat oman korikuljetuksen tai viestiyhteyden; integraatio kokoaa paikallisen kallioyhteyden.",
    "nodeIds": [
      "M79-PYTH-01",
      "M79-PYTH-CALC",
      "M79-PYTH-CONVERSE",
      "M79-SIN",
      "M79-COS",
      "M79-TAN",
      "M79-TRIG-01",
      "M79-TRIG-SIDE",
      "M79-TRIG-ANGLE",
      "M79-TRIG-CALC"
    ]
  },
  {
    "id": "UM-15",
    "title": "Kehäpuiston observatorio",
    "theme": "Ympyrän osat, kulmasuhteet, kehän ja kaaren pituus sekä ympyrän ja sektorin ala",
    "motif": "Keskus ja kehä, reunavalon nauha sekä yhteinen tähtitaivas.",
    "world": "Kehäpuisto on pyöreä havaintopiha, jonka maalattu lampi heijastaa iltataivasta. Aava kutsuu ystävät katsomaan samaa kaarta eri paikoista. Keskuksessa ja kehällä olevat havaitsijat näkevät eri kulman, mutta heidän välillään on tarkka suhde. Loikka saa vaihtaa paikkaansa rauhallisesti ja löytää säilyvän ominaisuuden. Taivaan tähdet ovat tunnelmaa; ympyrän geometriset pisteet ovat aina nimettyjä ja luettavia, eivät etsittäviä välkähdyksiä. Puiston kartta erottaa reunaa pitkin kulkevan matkan peitettävästä pinta-alasta. Reunavalon nauha, pyöreän pihan peite ja rajatun sektorin lukupaikka ovat eri tarpeita. Säde ja halkaisija eivät vaihdu toisikseen kuvan katseen suunnan mukana, koska tehtävät käsitellään täsmällisinä tasopiirroksina. Piin merkintä voi säilyä tarkkana laskun loppuun asti, ja käytännöllinen likiarvo nimetään sellaiseksi. Huipennuksissa sovittu reunakaari syttyy, lukupaikka peittyy oikein tai Thaleen erityistapaus antaa varman suoran kulman. Koko puisto ei odota kaikkien ympyräreittien suorittamista; jokainen havaintopaikka on oma valmis pieni näyttämönsä. Aava ja Loikka voivat istua yhden valmistuneen sektorin sisään ja huomata, että sama taivas kuuluu eri puolilla kehää oleville ystäville. Tästä syntyy luonnollinen visuaalinen kaiku myöhempään avaruusretkeen ilman uutta pakollista esitietoa.",
    "payoff": "Kaaren, sektorin ja Thaleen latvat valmistavat omat havaintopaikkansa; palkkio on yhdessä nähty taivas.",
    "nodeIds": [
      "M79-CIRCLE-RADIUS",
      "M79-CIRCLE-DIAMETER",
      "M79-CIRCLE-CIRCUMFERENCE-CONCEPT",
      "M79-CIRCLE-ARC",
      "M79-CIRCLE-BASIC",
      "M79-CENTRAL-ANGLE",
      "M79-INSCRIBED-ANGLE-CONCEPT",
      "M79-INSCRIBED-CENTRAL-REL",
      "M79-INSCRIBED-ANGLE",
      "M79-THALES",
      "M79-CIRCLE-CIRC",
      "M79-ARC",
      "M79-CIRCLE-AREA",
      "M79-SECTOR"
    ]
  },
  {
    "id": "UM-16",
    "title": "Leiripihan pinta-alapuutarha",
    "theme": "Monikulmioiden piiri, kolmioiden ja nelikulmioiden alat sekä pituus- ja pinta-alayksiköt",
    "motif": "Rajaköysi, alueen täyttävä peite ja pienistä ruuduista muodostuva suurempi ruutu.",
    "world": "Leiripiha levittäytyy maaston pehmeään notkelmaan. Aava toivoo yhteistä paikkaa, johon jokainen mahtuu istumaan, ja Loikka tuo karttapöydälle rajaköysiä, peitteitä ja kasvualustan paloja. Piiri ja pinta-ala saavat omat tehtävänsä: köysi kulkee reunaa, peite täyttää sisäpuolen. Maailma tekee näistä eroista hyödyllisiä ennen kuin ne muuttuvat laskukaavoiksi. Erikoisenmuotoinen piha ei ole ansa vaan kutsu löytää järkevä ositus. Työpöydällä kaikki reunat ja mitat näkyvät, myös ne, jotka maastokuvassa jäisivät kasvin alle. Kolmion korkeus piirretään kohtisuoraksi, tarvittaessa kuvion ulkopuolelle. Nelikulmion osia saa siirtää pinta-alaa säilyttäen, ja oppija voi valita useamman kelvollisen laskureitin. Yksikköruudukot näyttävät, miksi pituuden kerroin ja pinta-alan kerroin eivät ole sama asia. Pelkkä pilkun siirtäminen ei riitä selitykseksi. Huipennus on yhteinen tila, jonka oppija on auttanut mitoittamaan: rajaköysi kohtaa alkupäänsä, peite jättää kasvupaikan aukon oikein tai puutarhan tilaus vastaa todellista alaa. Aava levittää eväät vasta näkyvän ratkaisun jälkeen, ja Loikka huomaa, kuinka abstrakti neliöyksikkö muuttuu tilaksi ystävälle. Jokainen leiripihan osa voi valmistua itsenäisenä paikallisena retkenä. Kertaus käyttää uutta piirrosta eikä revi jo saavutettua suojaa pois.",
    "payoff": "Paikalliset latvat sulkevat reunaköyden tai saavat materiaalitilauksen täsmäämään; yhteinen retkihetki antaa mittaukselle merkityksen.",
    "nodeIds": [
      "M79-POLY-PERIM",
      "M79-TRI-AREA",
      "M79-QUAD-AREA",
      "M79-POLY-AREA",
      "M79-UNIT-LIN",
      "M79-UNIT-AREA"
    ]
  },
  {
    "id": "UM-17",
    "title": "Kuppelikaupungin rakennuslaatikko",
    "theme": "Avaruusgeometriset kappaleet, pinta-alat, tilavuudet ja tilavuusyksiköt",
    "motif": "Avautuva verkko, läpinäkyvä täyttökerros ja kotisaaren merkki mallipallossa.",
    "world": "Kuppelikaupunki on Sulkan tutkimuspöydälle rakentuva pieni tulevaisuuden satama. Sen säiliöt, katokset ja pallomaiset tutkimusmallit kutsuvat katsomaan myös pintojen taakse. Aava pitää huolen, että kappaleita voi tarkastella valmiista suunnista ilman vapaata kamerataistelua. Loikka avaa lieriön verkoksi, nostaa kerroksia läpinäkyvästä säiliöstä ja vertaa samankorkuisia kartio- sekä lieriömalleja. Kolmas ulottuvuus on täällä opetuksen väline eikä vain näyttävä tausta. Pinnan peittäminen ja sisätilan täyttäminen esitetään eri toimintoina. Kansi voidaan avata, mutta yksikään tehtävän kannalta olennainen mitoitus ei katoa sen mukana. Säde, sivujana ja kohtisuora korkeus ovat nimettyjä. Pallon pinnasta ei luvata vääristymätöntä tasoverkkoa; sen kaava ja näkyvä pinta yhdistetään rehellisesti. Pienistä kuutioista rakennettu suuri kuutio avataan leikkauksella, jotta kaikki kolme mittasuuntaa ovat havaittavissa. Huipennuksissa valmis kuori suojaa yhteistä varastoa, oikeankokoinen säiliö palvelee mallipuroa tai pallomainen tutkimusallas saa sisämerensä. Ne ovat omia rakennusprojektejaan, eivät pakollisia osia yhdestä kaikkien tehtävien lukitsemasta raketista. Taustalla näkyvä avaruushylly antaa silti kuville yhteisen unelman: samat muodot voivat auttaa rakentamaan myös kauas suuntautuvia tutkimusvälineitä. Aava merkitsee yhteen palloon kotisaaren, ja Loikka katsoo sitä hetken tavallista pidempään.",
    "payoff": "Jokainen tilavuus- tai pintalatva valmistaa oman näkyvän rakennusosan ja näyttää, mihin yhteiseen tarpeeseen se sopii.",
    "nodeIds": [
      "M79-CYLINDER-ID",
      "M79-CONE-ID",
      "M79-SPHERE-ID",
      "M79-SOLID-01",
      "M79-CYL-SA",
      "M79-CYL-V",
      "M79-CONE-SA",
      "M79-CONE-V",
      "M79-SPHERE-SA",
      "M79-SPHERE-V",
      "M79-UNIT-VOL"
    ]
  },
  {
    "id": "UM-18",
    "title": "Säähavaintojen satama",
    "theme": "Aineiston keruu ja esittäminen, tunnusluvut, vaihtelu ja todennäköisyyden tulkinta",
    "motif": "Havaintolappu, reilu asteikko ja eri rannoilta samaan pöytään saapuvat merkit.",
    "world": "Säähavaintojen satama on paikka, jossa saariston monet pienet kokemukset tuodaan yhteiseen pöytään. Aava kysyy, kenen ranta pääsi mukaan havaintoihin, ja Loikka huomaa, ettei oman lempipaikan loki kerro kaikkea. Tutkimus käyttää kuvitteellisia havaintoja, eikä lapsen tarvitse antaa henkilötietoja päästäkseen mukaan. Tilallinen havaintokartta paljastaa valintojen kattavuuden; sen jälkeen aineisto siirtyy rauhalliseen maalattuun työpöytään. Keskiarvo, mediaani ja tyyppiarvo näyttävät eri puolia samasta joukosta. Sama keskiarvo voi kätkeä aivan erilaisen vaihtelun, ja dramaattinen juliste voi liioitella pientä muutosta katkaistulla asteikolla. Aava ei palkitse huolestuttavinta otsikkoa, vaan tarkkaa ja reilua tulkintaa. Oma diagrammi tuotetaan kysymystä varten, ei koristeeksi. Todennäköisyyskokeissa monta yritystä saadaan yhdellä valinnalla, eikä onni muutu taitotodisteeksi tai ostettavaksi palkinnoksi. Huipennuksessa sataman neuvosto saa ymmärrettävän raportin, retken havaintoaikaa voidaan suunnitella tai vuorot jaetaan perustellusti reilulla säännöllä. Jännitys syntyy epävarmuuden kohtaamisesta: emme tiedä seuraavaa yksittäistä tulosta, mutta voimme silti toimia viisaammin. Ystävät päättävät havaintoillan katsomalla veden heijastuksia. Kaikkea ei tarvitse luvata varmasti, jotta yhteinen päätös olisi hyvä. Tämä asenne kantaa tarinan suuria pelastustehtäviä ilman väitettä, että muutama virtuaalihavainto ennustaisi todellisen vaaran varmasti.",
    "payoff": "Jokainen tilastollinen latva ratkaisee oman raportin, jaon tai suunnitelman; päätös näyttää myös epävarmuuden eikä lupaa varmaa seuraavaa tulosta.",
    "nodeIds": [
      "M79-DATA-COLLECT",
      "M79-DATA-STRUCT",
      "M79-FREQ",
      "M79-RELFREQ",
      "M79-MEAN",
      "M79-MODE",
      "M79-MEDIAN",
      "M79-SPREAD",
      "M79-DIAGRAM-INTERP",
      "M79-DIAGRAM-PROD",
      "M79-PROB-SPACE",
      "M79-PROB-CLASSIC",
      "M79-PROB-EMP"
    ]
  },
  {
    "id": "SCI01",
    "title": "Havaintojen laguuni",
    "theme": "Havaitseminen, kuvaaminen, vertaaminen ja tiedon tallentaminen",
    "motif": "Pisara ja sen vierelle piirtyvä tarkka merkintä.",
    "world": "Laguunin vesi on niin kirkasta, että Aavan keltainen heijastus näyttää toiselta pieneltä ystävältä. Lumpeen alla kulkee varjo, rantahiekassa on painauma ja kaislan kärjessä pisara. Mikään niistä ei vielä kerro koko tarinaansa. Loikka keksii innokkaasti selityksiä, mutta Aava opettaa ystävällisen pysähdyksen: katsotaan ensin, mitä todella näkyy. Sulan retkivihko odottaa kuivalla kivellä. Sen sivut ovat eläviä maalauksia, joissa tuuli liikuttaa vain reunojen kasvillisuutta ja tutkittava kohta pysyy paikallaan.\n\nLaguunissa kerätään havaintojen pieniä aarteita: muotoja, määriä, pintoja, samankaltaisuuksia ja eroja. Tarkan kuvauksen ansiosta toinen ystävä löytää saman kohteen ilman että hänen tarvitsee arvata kertojan ajatuksia. Kirjattu havainto kulkee pienen paperiveneen mukana tutkimuslaiturille; tiedon esittäminen tuntuu viestin antamiselta toiselle ihmiselle. Hiekan jälki ei muutu syytökseksi, eikä tuntemattomuus merkitse epäonnistumista.\n\nJokainen vierailu alkaa omasta valmiista rantatilanteestaan. Onnistuminen avaa yhden paikallisen kohtaamisen: oikea näyte löytyy, ystävän viesti ymmärretään tai lähikuvan tausta paljastaa aiemmin huomaamatta jääneen yksityiskohdan. Perheen tunne on maailman lempeä suureneminen. Lapsen havainto osoittautuu tärkeäksi ennen kuin tarina vaatii häneltä suuria pelastustekoja. Veden välke ja lintujen äänet saavat olla nautittavia, mutta niiden sammuttaminen jättää jokaisen havainnon ja vastauskeinon täysin näkyviin.",
    "payoff": "Havaintovihkon oma sivu avautuu eläväksi lähikuvaksi, jonka ystävät ymmärtävät yhdessä.",
    "nodeIds": [
      "SCI-ENV-OBS-01",
      "SCI-ENV-COMPARE-01",
      "SCI-ENV-RECORD-01",
      "SCI-ENV-OBSERVE-01",
      "SCI-ENV-DESCRIBE-01",
      "SCI-ENV-COMPARE-02",
      "SCI-ENV-CLASSIFY-01",
      "SCI-ENV-RECORD-DATA-01",
      "SCI-ENV-PRESENT-DATA-01"
    ]
  },
  {
    "id": "SCI02",
    "title": "Sulan tutkimusasema",
    "theme": "Kysymys, tutkimuksen suunnittelu, johtopäätös ja mallin korjaaminen",
    "motif": "Tuuliviiri, kysymysmerkki ja kaksi eri suuntaan virtaavaa uomaa.",
    "world": "Tutkimusasema lepää puisten ponttonien varassa kohdassa, jossa pieni puro jakautuu kahteen haaraan. Sen katolla pyörii tuuliviiri, tiskillä kuivuu tutkimuslaseja ja oven vieressä on kyltin sijasta kysymysmerkki. Sulka ei pidä asemaa vastausten varastona. Hän pitää sitä paikkana, jossa hyvä kysymys saa työkalut ympärilleen. Aava ottaa vieraan vastaan, ja Loikka tarjoaa ensimmäiseksi omaa teoriaansa, jonka saa muuttaa ilman häpeää.\n\nYhdellä pöydällä koetellaan malliveneen kaarta, toisella vertaillaan taimien paikkoja. Mittausten ja päätelmien välillä kulkee näkyvä yhteys: mikään näyttävä loppukuva ei korvaa perustelua. Epävarma tulos voi johtaa uuteen kysymykseen, ja sekin saa ystäviltä arvostusta. Mallien nurkkauksessa pienoispuro näyttää veden haarautumisen, mutta sen rajat ovat merkittyjä; maaston kaunis ulkonäkö ei yksin takaa oikeaa ennustetta.\n\nAseman suuri paikallinen sovellus on majavan tapaaminen. Majava tarvitsee pesälleen rauhallisen veden, kun Aava kaipaa pienen lammen putousta. Molempien tarpeet tulevat näkyville ennen ratkaisun etsimistä. Mallia muutetaan uuden havaintotiedon perusteella, kunnes sivuhaaraa koskeva ehdotus kestää annetut ehdot. Sopimukseen painetaan tassunjäljet, ja paikallinen loppukohtaus näyttää yhteistyön seurauksen. Tämä vierailu sisältää kaikki omat tilannetietonsa: se ei edellytä muiden tutkimusten, rakennushankkeiden tai saariston pelastuskohtauksien suorittamista. Paluu vanhaan tehtävään avaa tutkimusmuiston eikä pura saavutettua sopua.",
    "payoff": "Majava hyväksyy koetellun sivuhaaraehdotuksen; hänen kotinsa rauhoittuu ja paikallinen putous saa virtansa.",
    "nodeIds": [
      "SCI-ENV-QUESTION-01",
      "SCI-ENV-TOOL-01",
      "SCI-ENV-EXP-01",
      "SCI-ENV-CAUSE-01",
      "SCI-ENV-PLAN-01",
      "SCI-ENV-MEAS-01",
      "SCI-ENV-DATA-01",
      "SCI-ENV-CONCL-01",
      "SCI-ENV-EVAL-01",
      "SCI-ENV-MODEL-01",
      "SCI-ENV-MODEL-02",
      "SCI-ENV-MODEL-CREATE-01",
      "SCI-ENV-MODEL-REVISE-01"
    ]
  },
  {
    "id": "SCI03",
    "title": "Viestiveneiden lahti",
    "theme": "Liike, vertailukohta, nopeus, kiihtyvyys ja liikekuvaajat",
    "motif": "Viestiviiri, laiturin mittakivi ja majakan matkaviiva.",
    "world": "Viestiveneiden lahden talot tervehtivät toisiaan eri värisillä viireillä, mutta viestien perille saapuminen ei ole värien varassa. Laiturien kivissä on näkyvät etäisyysmerkit. Aava odottaa ystävää Eväsniemelle, Loikka tutkii veneiden lähtöjä, ja majakan ikkunassa Sulka kokoaa matkoista täsmällisiä kertomuksia. Lahdella ei tarvitse ajaa kilpaa. Tärkeä kysymys on, mitä liikkeestä voidaan päätellä ja milloin kaksi matkalaista voivat todella tavata.\n\nLähellä rantaa liike näkyy paikan muuttumisena valittuun vertailukohtaan nähden. Kauempana matkakertomus vaihtaa esitystapaa: taulukko, etäisyys–aika-kuvaaja ja nopeus–aika-kuvaaja kertovat eri puolia samasta ilmiöstä. Pysähdys ei riko tarinaa, vaan antaa sille hengähdyksen. Kiihtyminen ja hidastuminen auttavat ymmärtämään lähtöä ja saapumista. Loikan hupaisa oikaisuehdotus paljastaa ajoittain virhekäsityksen, jonka Aava korjaa tutkimalla tietoja yhdessä hänen kanssaan.\n\nTämän perheen nykyiset tehtävät säilyvät omilla hyväksymisehdoillaan ja käyttöliittymillään. Satama, vene ja tapaamisen hetki toimivat niiden ulkopuolisina alku- ja loppukuvina. Yhtäkään laskua ei korvata koristeellisella ajelulla. Jokainen tapaus tarjoaa oman matkansa tiedot; toisen veneen tehtävä ei ole kronologinen edellytys. Kun osaamisnäyttö onnistuu, loppukuva antaa laskulle inhimillisen merkityksen: viesti saapuu, yhteinen eväshetki löytyy tai kaksi eri merkintätapaa kertovat viimein samaa matkaa. Vanha matka säilyy majakan muistikirjassa myös uuden seikkailun alkaessa.",
    "payoff": "Oikein tulkittu paikallinen matka päättyy ystävien tapaamiseen tai ymmärrettyyn viestiin.",
    "nodeIds": [
      "ENV-PHY-MOTION-01",
      "ENV-PHY-CAUSE-MOTION-01",
      "ENV-PHY-MOTION-OBS-01",
      "ENV-PHY-MOTION-CHANGE-01",
      "PHY79-MOTION-REF",
      "PHY79-DIST-TIME",
      "PHY79-SPEED-CONCEPT",
      "PHY79-SPEED-CALC",
      "PHY79-SPEED-UNIT",
      "PHY79-SPEED-MIXED",
      "PHY79-SPEED-REARR",
      "PHY79-ST-GRAPH",
      "PHY79-VT-GRAPH",
      "PHY79-ACCEL-CONCEPT",
      "PHY79-ACCEL-CALC",
      "PHY79-ACCEL-GRAPH",
      "PHY79-ACCEL-MOTION-GRAPH",
      "PHY79-ACCEL-VT-GRAPH"
    ]
  },
  {
    "id": "SCI04",
    "title": "Lämpövuoren retkiasema",
    "theme": "Lämpötila, lämpöenergia ja lämmön siirtymisen mekanismit",
    "motif": "Huurteinen ikkuna ja sen reunaan avautuva kirkas kohta.",
    "world": "Lämpövuoren rinteessä sumu tarttuu mäntyihin ja retkiaseman ikkuna heijastaa kaukana välkkyvää merta. Sisällä on puupenkki, tutkimuskuppi ja kädenlevyinen pienoistalo. Aava haluaa rakentaa ystäville miellyttävän lepopaikan. Loikka huomaa, että kylmältä tuntuva metallipinta ja puinen pinta voivat antaa saman lämpötilalukeman. Sulka kutsuu tutkimaan eroa eikä pyydä luottamaan pelkkään tuntemukseen.\n\nVuoren havaintopöydillä lämpötilaa verrataan mittaustietona. Lämpö ja lämpöenergia erotetaan toisistaan sekä lämpötilasta, ja siirtymistä katsotaan aina kahden alueen välillä. Yhdessä ikkunassa kiinteän aineen malli näyttää johtumista. Toisessa nesteen tai kaasun liike tekee kuljettumisen näkyväksi. Kolmas ikkuna avautuu säteilyn tarkasteluun, jota ei esitetä vain punaisina lämpönuolina. Pienoismallit sisältävät tarvitsemansa olosuhdetiedot, joten vuoren tutkimukseen voi saapua eri oppimispoluilta.\n\nRetkiaseman yhteinen sovellus on majan lämpötilanteen selittäminen. Oppija valitsee annettujen tietojen perusteella mekanismit ja perustelee tarkoituksenmukaisen muutoksen. Vasta sitten paikallinen maja muuttuu mukavaksi pysähdyspaikaksi: ikkunan huurre vetäytyy, pöydälle avautuu eväsliina ja ystävät asettuvat lähelle toisiaan. Kohtaus ei palkitse kuumimman mahdollisen ratkaisun tekemisestä vaan tilanteen ymmärtämisestä. Tarvittavat lämpötilat, siirtymisen suunnat ja vastauskeinot pysyvät näkyvissä myös silloin, kun ympärillä hengittävä vuoristomaisema on visuaalisesti runsas. Mittaushetken aikana koristeellinen liike rauhoittuu.",
    "payoff": "Mekanismit oikein yhdistävä ratkaisu muuttaa paikallisen mallimajan ystävien yhteiseksi retkipaikaksi.",
    "nodeIds": [
      "ENV-PHY-TEMP-01",
      "ENV-PHY-THERMAL-01",
      "PHY79-TEMP-HEAT",
      "PHY79-HEATFLOW",
      "PHY79-HEAT-MECH",
      "PHY79-HEAT-CONDUCTION",
      "PHY79-HEAT-CONVECTION",
      "PHY79-HEAT-RADIATION"
    ]
  },
  {
    "id": "SCI05",
    "title": "Valon ja kaiun luolat",
    "theme": "Valon kulku, varjot, värähtely ja äänen selittäminen",
    "motif": "Pieni hahmo ja suuri varjo; näkyvä värähtelyrengas.",
    "world": "Luolan suu näyttää illalla jättiläisen hymyltä. Sisällä katto on sininen, seinällä liikkuu valtava varjo ja vesi vastaa askeliin pehmeällä kaiulla. Aava pysähtyy katsomaan. Loikka huomaa vähitellen, että suuri hahmo seuraa hänen pientä omaa liikettään. Luolan arvoitus ratkeaa tarkastelemalla valon, esteen ja pinnan keskinäistä paikkaa. Jännitys muuttuu nauruksi ilman että ketään nolataan.\n\nValon tutkimusnurkassa lähde, esine ja varjopinta näkyvät samanaikaisesti. Niitä siirretään askelittain tai valitaan valmiit asennot, jolloin ratkaisu ei riipu kameran ohjaamisesta. Ennuste tehdään ennen mallin muutosta, ja valojuovat näyttävät perustellun yhteyden. Luolan toinen syvennys on rauhallisempi. Siellä ääni saa näkyvän värähtelykuvan, ja liikkuva pinta yhdistyy äänen syntymiseen. Äänettömäksi asetettu peli tarjoaa täsmälleen saman tiedon ja onnistumisen mahdollisuuden.\n\nPaikalliset huipennukset muodostavat luolalle kaksi erilaista juhlaa. Varjojen näyttämöllä pelottava muoto osoittautuu ystävän tutuksi siluetiksi. Äänen seinällä syntyy yhteinen kuvallinen konsertti, jossa värähtelyt järjestyvät havaittaviksi suhteiksi. Niitä ei tarvitse ansaita toistensa kautta. Kummassakin kohtauksessa tunne seuraa oivalluksesta: maailma ei menetä ihmettään, kun sen toimintaa ymmärtää, vaan siitä tulee turvallisempi tutkia. Luolan maalatut reunat ja heijastukset elävät hitaasti; mittaus, selitys ja vastaus eivät koskaan huku kaikuun, pimeyteen tai liikkuvaan valosäteeseen.",
    "payoff": "Varjon hirviö paljastuu Loikan siluetiksi, ja erillinen äänitehtävä päättyy kaikille saavutettavaan kuvakonserttiin.",
    "nodeIds": [
      "ENV-PHY-LIGHT-01",
      "ENV-PHY-SOUND-01",
      "ENV-PHY-LIGHT-OBS-01",
      "ENV-PHY-LIGHT-EXPLAIN-01",
      "ENV-PHY-SOUND-OBS-01",
      "ENV-PHY-SOUND-EXPLAIN-01"
    ]
  },
  {
    "id": "SCI06",
    "title": "Taivaan karttahuone",
    "theme": "Lähiavaruus, päivä ja yö, vuodenajat sekä maailmankaikkeuden rakenne ja mittakaavat",
    "motif": "Kotisaaren lyhty pysyy karttamerkkinä mittakaavan vaihtuessa.",
    "world": "Korkean kallion observatoriossa on pyöreä huone, jonka lattiaan on maalattu kotisaaren ääriviiva. Katon voi avata tähtitaivaaksi. Sulan lainattava tutkimushytti seisoo huoneen laidalla valmiina jokaista vierailijaa varten; sen käyttäminen ei odota toisen haaran raketin rakentamista. Aava merkitsee kotiin pienen lyhdyn, ja Loikka kysyy, miksi samassa maailmassa voi olla yhtä aikaa aamu ja ilta.\n\nKarttapallo näyttää Maan pyörimisen, valon suunnan ja akselin kallistuksen erillisinä tarkasteltavina asioina. Vuodenajan muutosta ei piiloteta vääristyneeseen kiertorataan. Aurinkokunnan retkessä planeettojen koot ja etäisyydet esitetään eri nimetyissä mittakaavatiloissa. Maan kuu ja Marsin kuut ovat tutkittavia kohteita, eivät keskenään samanlaisia koristelamppuja. Oppija ennustaa, vertaa ja selittää; lentävän kameran taitava käsittely ei ole tutkimuksen ehto.\n\nLaajempi karttahuone hiljenee. Tähtien väliset etäisyydet tarvitsevat uuden mittakaavan, ja galaksin rakenne tarvitsee oman mallinsa. Kotisaari säilyy merkkinä, vaikka se katoaa valitun mittakaavan näkyvistä. Paikallinen huipennus voi olla Aurinkokunnan tutkimuspanoraama, kaukaiselle tähdelle jätetty kysymys tai kodin koko kosminen osoite. Niistä mikään ei väitä mallihypyn olevan todellinen matka-aika. Loikan myöhempi lähtö uusiin tähtijärjestelmiin kuuluu erilliseen tulevaisuuden fantasiaepilogiin. Oppimiskohtauksessa ihmetys kasvaa juuri siitä, että todellisen avaruuden mittasuhteet ja tutkimuksen rajat otetaan vakavasti.",
    "payoff": "Tutkimuskupoli avaa Aurinkokunnan retken; omat mittakaava- ja rakennehaarat päättyvät kodin paikan löytymiseen tähtien joukosta.",
    "nodeIds": [
      "ENV-PHY-SPACE-01",
      "ENV-PHY-SPACE-NEAR-01",
      "ENV-PHY-DAYNIGHT-01",
      "ENV-PHY-SEASONS-01",
      "PHY79-UNIVERSE-SCALE",
      "PHY79-UNIVERSE-STRUCT"
    ]
  },
  {
    "id": "SCI07",
    "title": "Aineiden rantapaja",
    "theme": "Materiaalien tunnistaminen, ominaisuudet, olomuodot ja aineen käsite",
    "motif": "Rantaan hioutunut kappale ja sille löytyvä tarkoitus.",
    "world": "Rantapaja seisoo kohdassa, jossa meri on hionut puunkappaleet sileiksi ja jättänyt kivien väliin lasimaisen kirkasta vettä. Pajan pöydällä on puuta, metallia, kangasta ja erilaisia turvallisesti kuvattuja näytteitä. Aava tarvitsee retkikotelon, joka suojaa sisältöään, ja Loikka haluaisi valita aina kiiltävimmän kappaleen. Sulka ehdottaa, että ulkonäön lisäksi tutkitaan käyttöön liittyviä ominaisuuksia.\n\nNäytteet eivät ole etsintäpelin piilotettuja esineitä. Ne ovat kerralla näkyvissä, tunnistettavissa ja vertailtavissa. Muoto, pinta, joustavuus, veden kanssa käyttäytyminen ja muut annetut ominaisuudet yhdistyvät tarkoitukseen. Aine ja esine erotetaan: sama esine voidaan valmistaa eri aineista, ja samaa ainetta voi esiintyä eri esineissä. Olomuotojen nurkkauksessa vesi esiintyy jäänä, nesteenä ja selvästi merkityssä kaasumallissa. Näkyvää pilveä ei nimetä vesihöyryksi ilman erottelua.\n\nPajan pienet ratkaisut muuttavat konkreettista ympäristöä. Sopiva kotelo sulkeutuu, näyte löytää oman paikkansa tai vesi saa ymmärrettävän jatkumon olomuotojen välillä. Jokainen työ alkaa omista annetuista materiaaleistaan; retkikori ei edellytä aiempaa rakentelutehtävää. Huumori syntyy Loikan liian suuresta käärepaperista tai siitä, että kaksi samannäköistä kappaletta käyttäytyy eri tavalla. Maailma pysyy lämminsävyisenä ja käsin tehdyn tuntuisena, mutta ominaisuuksia koskeva tieto ei ole vain taiteilijan tekstuurin varassa. Tavoitteena on oppia kysymään, millainen aine tähän tarkoitukseen sopii ja millä havainnolla valintaa voidaan perustella.",
    "payoff": "Perusteltu materiaalivalinta muuttuu toimivaksi paikalliseksi retkiesineeksi tai ymmärretyksi ainehavainnoksi.",
    "nodeIds": [
      "ENV-CHEM-MATERIAL-01",
      "ENV-CHEM-PROP-01",
      "ENV-CHEM-STATE-01",
      "ENV-CHEM-STATECHANGE-01",
      "ENV-CHEM-MATERIAL-ID-01",
      "ENV-CHEM-MATERIAL-COMPARE-01",
      "CHEM79-SUBSTANCE-01"
    ]
  },
  {
    "id": "SCI08",
    "title": "Turvaniemen yhteinen piiri",
    "theme": "Turvallinen tutkiminen, sähkö- ja kemikaaliturvallisuus sekä palotilanteen ymmärtäminen",
    "motif": "Yhteisen puun varjo ja jokaiselle löytyvä paikka piirissä.",
    "world": "Turvaniemellä kasvaa leveä puu, jonka alle mahtuu koko retkiseurue. Sen vieressä on selkeä kokoontumispaikka, aikuisen hoitama välinevarasto ja kartta, josta tarvittavat paikat näkee kerralla. Aava laskee katseellaan ystävät mukaan. Loikka huomaa, ettei rohkeus aina tarkoita lähemmäs menemistä: joskus rohkea teko on pysähtyä, kertoa havainnosta ja pyytää apua.\n\nNiemen tehtävissä on paikallisia valmiita tilannekuvia. Sähkölaitteen vioittuminen, nimettömän kemikaalipakkauksen löytyminen ja väärä säilytyspaikka tutkitaan kuvien sekä annettujen tietojen avulla. Oppija yhdistää vaaran tunnistamisen turvalliseen päätökseen. Aikuinen vastaa korjaamisesta ja aineiden käsittelystä. Palamisen edellytyksiä voidaan selittää erillisellä mallilla, mutta selityksen osaaminen ei muutu luvaksi sammuttaa tulta itse.\n\nPerheen jännittävin kohtaus alkaa kaukaisesta savuhavainnosta ja Sulan rauhallisesta kutsusta. Aava auttaa ystäviä pysymään turvassa ja välittää havainnot aikuisten pelastusryhmälle. Oppijan työpinnalla näkyvät tarvittavat tiedot, turvallinen päätös ja ilmoittamisen merkitys; kiireinen animaatio ei peitä niitä. Virhe pysäyttää harjoituksen selitykseen eikä vahingoita ystävää. Ratkaisu päättyy turvaniemen yhteiseen kuvaan: aikuiset ovat hoitaneet tilanteen, metsän reuna on suojattu ja jokainen on mukana. Paluuta odotetaan luvan kanssa. Tämä pelastus on oma kokonainen paikallinen tarinansa. Se ei oleta majavan sopimusta, energialaitosta tai toista palotehtävää jo tapahtuneeksi, eikä se lukitse niiden etenemistä.",
    "payoff": "Aikuisten hoitama kuvitteellinen palotilanne rauhoittuu; ystävät näkevät suojellun metsäsaarekkeen turvalliselta kokoontumispaikalta.",
    "nodeIds": [
      "SCI-ENV-SAFE-01",
      "ENV-PHY-ELECSAFE-01",
      "ENV-CHEM-HOMECHEM-SAFE-01",
      "ENV-CHEM-CHEMICAL-SAFE-01",
      "ENV-CHEM-POISON-SAFE-01",
      "ENV-CHEM-FIRE-SAFE-01",
      "PHY79-SAFE-01",
      "PHY79-ELEC-SAFE",
      "CHEM79-SAFE-01",
      "CHEM79-CHEMICAL-SAFE",
      "CHEM79-FIRE-SAFE",
      "CHEM79-CHEMICAL-USE-SAFE",
      "CHEM79-HAZARD-LABEL",
      "CHEM79-FIRE-CONDITIONS",
      "CHEM79-FIRE-ACTION"
    ]
  },
  {
    "id": "SCI09",
    "title": "Mittausvuoren majakka",
    "theme": "Suureet, yksiköt, mittaaminen, kuvaajat, tutkimuksen tulkinta ja perustelu",
    "motif": "Ikkunan valoviiva, mittakortti ja rehellinen kysymysmerkki.",
    "world": "Mittausvuoren majakka katsoo koko saariston yli, mutta sen tärkein huone on vaatimaton pöytä ikkunan alla. Siinä on mittakortteja, huolella merkittyjä suureita ja muistiinpanoja, joiden marginaaliin Sulka on piirtänyt pieniä kysymysmerkkejä. Aava haluaa lähettää toiselle saarelle tiedon, jota siellä voi käyttää. Loikka huomaa, ettei pelkkä numero kerro, onko mitattu aikaa, matkaa vai jotakin muuta.\n\nMajakka kokoaa havainnoista yhteistä kieltä. Suureen merkitys, lukuarvo ja yksikkö pysyvät sidoksissa toisiinsa. Mittausväline valitaan tarkoituksen mukaan, ja lukutarkkuutta tarkastellaan rehellisesti. Taulukko ei ole varasto irrallisille luvuille vaan yhteys mittauksen ja kysymyksen välillä. Kuvaaja auttaa näkemään suhteita, malli tekemään rajattuja ennusteita ja johtopäätös vastaamaan kysymykseen. Sulka hyväksyy myös perustellun epävarmuuden; tarkoitus ei ole saada kaikkia tuloksia näyttämään ennalta odotetuilta.\n\nJokainen vierailu alkaa valmiilla paikallisella aineistolla tai välineillä. Ennuste voi koskea majakan ohittavaa venettä, tutkimuksen arviointi näköalatasanteen suunnitelmaa. Ne eivät edellytä muiden majakkatehtävien tarinatilaa. Nykyisten sisältöjen laskut ja näytöt säilyvät ennallaan, ja ulkoinen tarina antaa niiden tulokselle vastaanottajan. Kun tieto on ymmärrettävää ja perusteltua, toinen ranta vastaa valotervehdyksellä. Isommassa paikallisessa päätöksessä turvallinen näköalatasanne avautuu ystäville. Majakan huipulle ei nousta arvaamalla oikeaa numeroa: oivallus syntyy siitä, että ystävä voi tarkistaa, mitä numero tarkoittaa ja miksi päätelmään luotetaan.",
    "payoff": "Ymmärrettävä tutkimusviesti saa vastauksen; soveltava päätös avaa paikallisen näköalatasanteen ystäville.",
    "nodeIds": [
      "PHY79-QUESTION-01",
      "PHY79-PLAN-01",
      "PHY79-QTY-01",
      "PHY79-SI-01",
      "PHY79-UNIT-CONV",
      "PHY79-MEAS-01",
      "PHY79-PREC-01",
      "PHY79-DATA-01",
      "PHY79-GRAPH-01",
      "PHY79-REL-01",
      "PHY79-MODEL-01",
      "PHY79-CONCL-01",
      "PHY79-PREDICT-01",
      "PHY79-QTY-CONCEPT",
      "PHY79-NUMVALUE",
      "PHY79-UNIT-CONCEPT",
      "PHY79-MEAS-PRECISION",
      "PHY79-REPORTED-DIGITS",
      "PHY79-RESULT-EVAL",
      "PHY79-CONCLUSION-JUSTIFY"
    ]
  },
  {
    "id": "SCI10",
    "title": "Köysiradan vuoristo",
    "theme": "Vuorovaikutus, voimat, liike, työ ja teho",
    "motif": "Retkikori ja siihen näkyvästi liittyvät voimanuolet.",
    "world": "Vuoriston kahden kallion välissä kulkee köysirata, jonka pienoismalli odottaa jo valmiina Sulan pihalla. Alhaalla puro nauraa kiville, ylhäällä tasanne on juuri sopiva yhteiselle eväshetkelle. Aava haluaa kuljettaa retkikorin perille. Loikka tarjoutuu vetämään, mutta huomaa pian, että voiman suunta ja vaikutuskohde merkitsevät enemmän kuin pelkkä innokkuus.\n\nVuoriston tutkimusikkunoissa yksi kappale valitaan kerrallaan tarkasteluun. Voimanuolet sidotaan siihen kohdistuviin vuorovaikutuksiin. Tuki ja kitka saavat yhtä tärkeän roolin kuin näkyvä vetäminen. Paino erotetaan massasta, kokonaisvoima liikkeen muuttumisesta ja voiman vastavoima saman kappaleen tasapainottavista voimista. Pienoismalli antaa tarkoituksella tilanteita, joissa liike jatkuu ilman liikkeensuuntaista kokonaisvoimaa. Loikan yllätys on kutsu ennustamaan uudelleen, ei epäonnistumisen leima.\n\nTyön ja tehon sovelluksissa hissin kuorma, korkeusero ja toimintatiedot annetaan valmiina. Oppija tekee kunkin taidon vaatiman päätelmän näkyvässä työpinnassa, minkä jälkeen malli näyttää seurauksen. Retkikori ei putoa väärästä vastauksesta; koe palautuu turvalliseen tarkastelukohtaan. Kukin paikallinen onnistuminen rakentaa ymmärrettävän kuljetushetken: pito pitää, vaunu hidastuu, työmäärä täsmää tai kori nousee annetulla teholla. Näköalatasanteen yhteinen ateria voi siten olla monen itsenäisen oppimishaaran oma loppukuva. Se ei vaadi kaikkien voimien, laskujen ja energiatehtävien ketjuttamista samaan pakolliseen rakentelujärjestykseen.",
    "payoff": "Paikallisen voima-, työ- tai tehoratkaisun jälkeen malli kuljettaa yhteisen eväskorin tasanteelle.",
    "nodeIds": [
      "ENV-PHY-FORCE-01",
      "PHY79-INTERACT",
      "PHY79-FORCE-01",
      "PHY79-FORCE-DIAG",
      "PHY79-NETFORCE",
      "PHY79-FORCE-MOTION",
      "PHY79-WEIGHT",
      "PHY79-FRICTION",
      "PHY79-SUPPORT",
      "PHY79-ACTIONPAIR",
      "PHY79-WORK-CONCEPT",
      "PHY79-WORK-CALC",
      "PHY79-POWER-CONCEPT",
      "PHY79-POWER-CALC",
      "PHY79-FORCE-MAGNITUDE",
      "PHY79-FORCE-DIRECTION"
    ]
  },
  {
    "id": "SCI11",
    "title": "Tuulien voimaluodot",
    "theme": "Energian muodot, siirtyminen, säilyminen, energialähteet ja ympäristövaikutukset",
    "motif": "Majakan valo ja sen rinnalla pimeänä rauhoitettu pesimäluoto.",
    "world": "Tuulien luodoilla ruohot taipuvat samaan suuntaan kuin purjeet, mutta lähimmän pesimäsaaren yllä on tarkoituksella rauhallista. Aava haluaa pitää paikallisen majakan valon näkyvissä. Loikka näkee vedessä ja tuulessa suuren mahdollisuuden. Sulka tuo neuvostoon myös tiedot kulutuksesta, maisemasta ja eliöiden tarpeista. Hyvä ratkaisu ei synny katsomalla vain kirkkainta lamppua.\n\nLuotojen mallipöydät seuraavat energiaa tarkasti. Liike, sijainti, lämpeneminen ja muut muodot liittyvät tilanteisiin, joissa energian reitti voidaan selittää. Ympäristö on mukana tarkastelussa, eikä käyttämättä jäävää energiaa julisteta kadonneeksi. Korkealla oleva vesikori ja koeradalla liikkuva vaunu tarjoavat omat lähtötilanteensa potentiaali- ja liike-energian tutkimiseen. Ne ovat valmiita lainamalleja, joten toisen rakenteluhaaran suoritus ei ole niihin pääsyn ehto.\n\nEnergialähteiden vertailussa uusiutuvuus erotetaan vaikutuksettomuudesta. Oppija näkee annetun käytön, paikalliset olosuhteet ja vaihtoehtojen rajat samassa päätöstaulussa. Neuvoston huipennus on yhteinen perusteltu valinta: majakka saa mallissa tarvitsemansa energian ja pesimäluodon rauha on otettu päätöksessä huomioon. Maisemaan ei ilmesty kaikkivoipaa konetta, joka ratkaisee kaiken pysyvästi. Sen sijaan yksi paikallinen tarve täyttyy ymmärrettävällä tavalla. Ystävät katsovat valoa rannalta ja huomaavat, että huolenpito voi tarkoittaa sekä rakentamista että paikan jättämistä rauhaan. Perheen juhla on harkitun toiminnan seuraus, ei suurimman kulutuksen palkinto.",
    "payoff": "Paikallinen energianeuvosto löytää perustellun ratkaisun, joka täyttää valontarpeen ja huomioi annetut ympäristöehdot.",
    "nodeIds": [
      "ENV-PHY-ENERGYFORM-01",
      "ENV-PHY-ENERGYTRANS-01",
      "ENV-PHY-ENERGYCONS-01",
      "PHY79-ENERGY-01",
      "PHY79-ENERGY-TRANSFER",
      "PHY79-KINETIC",
      "PHY79-POTENTIAL",
      "PHY79-ENERGY-SOURCE",
      "PHY79-RENEW",
      "PHY79-ENERGY-IMPACT"
    ]
  },
  {
    "id": "SCI12",
    "title": "Valomerkkien satama",
    "theme": "Sähkövaraus, virtapiirit, sähköiset suureet, magnetismi ja sähköntuotanto",
    "motif": "Kahden rannan valot, jotka vastaavat toisilleen.",
    "world": "Valomerkkien satamassa on kaksi vastakkaista laituria, joiden välillä kulkee valotervehdys. Aava seisoo toisella, Loikka toisella, ja Sulka tuo heidän väliinsä turvallisen virtuaalisen laitepöydän. Jokainen valaisin on ensin mallin osa. Oikeita verkkolaitteita ei pureta eikä lapsi joudu arvaamaan, mitä johtoa saa koskea. Tutkimuspöytä näyttää tarvittavat osat, kytkennän ja selkeän eron mallin ja käyttöesineen välillä.\n\nSataman eri syvennykset tutkivat eri ilmiöitä. Varausmallissa paperiviiri antaa yllättävän vastauksen. Virtapiirissä suljettu reitti, komponenttien tehtävät ja mittausten tarkoitus avautuvat yksitellen. Virtaa ei esitetä polttoaineena, joka vain kuluu ensimmäiseen lamppuun, eikä jännitettä nimetä toiseksi sanaksi virralle. Sarja- ja rinnankytkentä saavat omat pienoissatamansa, joissa kaikki tarvittavat lähtötiedot ovat valmiina.\n\nMagnetismin työpöydällä näkymätön vuorovaikutus muuttuu havaittavaksi vaikutukseksi. Generaattorin mallissa liike liittyy sähköntuotantoon ja energia voidaan jäljittää lähteeseen. Pienen malliputouksen käynnistämä vastarannan valo tarjoaa yhden paikallisen huipennuksen; se ei oleta majavan sopimushaaran vesistön jo muuttuneen. Toinen haara voi päättyä rinnakkaisten rantavalojen tervehtimiseen, kolmas yön käyttöajan perusteltuun energiasuunnitelmaan. Sataman yhteinen tunne on yhteyden syntyminen etäisyyden yli. Valo sanoo ystävälle, että olet siellä ja minä näen sinut, mutta osaamisnäyttö tulee aina ilmiön ennustamisesta, mittaamisesta tai selittämisestä.",
    "payoff": "Kunkin paikallisen sähkömallin ratkaisu sytyttää oman tervehdysvalonsa; generaattorimalli näyttää energian koko ketjun.",
    "nodeIds": [
      "ENV-PHY-DEVICE-01",
      "PHY79-CHARGE",
      "PHY79-CHARGING",
      "PHY79-CIRCUIT-01",
      "PHY79-CURRENT",
      "PHY79-VOLTAGE",
      "PHY79-MEAS-I",
      "PHY79-MEAS-U",
      "PHY79-UI-REL",
      "PHY79-RESISTANCE",
      "PHY79-OHM",
      "PHY79-SERIES",
      "PHY79-PARALLEL",
      "PHY79-ELEC-POWER",
      "PHY79-ELEC-ENERGY",
      "PHY79-MAGNET",
      "PHY79-ELECTROMAG",
      "PHY79-GENERATION",
      "PHY79-CIRCUIT-CLOSED",
      "PHY79-CIRCUIT-COMPONENTS",
      "PHY79-SERIES-CURRENT",
      "PHY79-SERIES-VOLTAGE",
      "PHY79-PARALLEL-CURRENT",
      "PHY79-PARALLEL-VOLTAGE"
    ]
  },
  {
    "id": "SCI13",
    "title": "Näkymättömien viestien observatorio",
    "theme": "Säteilylajit, ionisoivuus ja turvallisen tarkastelun periaatteet",
    "motif": "Havaintoikkuna, jonka vieressä mallin selite pysyy auki.",
    "world": "Observatorion sivusalissa ei ole kaukoputkea vaan joukko nimettyjä havaintoikkunoita. Aava etsii viestejä, joita silmä ei sellaisenaan näe. Loikka odottaa säteilyn loistavan vihreänä, mutta Sulka näyttää, että näkyvä kuvatehoste olisi vain esityksen valinta. Ilmiö tunnistetaan annetuista ominaisuuksista. Salin seinällä kulkevat erikseen sähkömagneettista säteilyä ja hiukkassäteilyä kuvaavat mallit, joiden legendat pysyvät avoimina.\n\nOppija luokittelee tietoa, yhdistää ominaisuuksia ja selittää turvallisuutta rajatuissa tilanteissa. Ionisoivuus ei tarkoita säteilyn näkyvyyttä tai sitä, että kaikki säteily olisi samanlaista. Ionisoivan säteilyn haaroihin voidaan tulla vaihtoehtoisista asiaankuuluvista pohjatiedoista; kummankin rinnakkaisen säteilylajiperheen suorittamista ei lisätä tarinalliseksi portiksi. Sulka antaa tarvittavan mallin ja tilannekuvan jokaisella vierailulla.\n\nTurvallisuutta koskeva kohtaus sijoittuu havaintopaikan valintaan. Aava ja Loikka arvioivat annettujen ohjeiden perusteella, mistä ilmiötä voidaan tarkastella ja milloin asia kuuluu aikuiselle tai ammattilaiselle. Pelin tehtävä ei anna lääketieteellisiä annosohjeita eikä tee vaarallisesta lähteestä keräilyesinettä. Paikallinen onnistuminen avaa observatorion kupolin tähtinäytökseen: näkymättömien ilmiöiden tutkiminen liittyy samaan uteliaisuuteen kuin taivaan katsominen. Jännitys muuttuu rauhalliseksi tarkkuudeksi. Kauniit aallot, hiukkasmerkit ja valojuovat ovat rajattuja opetusesityksiä, ja niiden sammuttaminen jättää luokittelun perusteet, turvaohjeet ja vastauskeinot kokonaan näkyviin. Tiedon saaminen ei vaadi kohteen luo menemistä.",
    "payoff": "Perusteltu turvallinen havaintopaikka avaa kupolin yhteiseen tähtinäytökseen.",
    "nodeIds": [
      "PHY79-RAD-EM",
      "PHY79-RAD-PARTICLE",
      "PHY79-RAD-ION",
      "PHY79-RAD-SAFE",
      "PHY79-RAD-ION-CLASS",
      "PHY79-RAD-ION-SAFETY"
    ]
  },
  {
    "id": "SCI14",
    "title": "Sulan lasilaboratorio",
    "theme": "Kemiallinen tutkimus, välineet, mittaaminen, aineisto, johtopäätös ja arviointi",
    "motif": "Näytteen nimilappu ja väitteeseen johtava näkyvä havaintopolku.",
    "world": "Lasilaboratorion ikkunat ovat pieniä kasvihuoneen ruutuja, joiden takaa näkyy meri. Jokaisella näytteellä on oma paikka, ja työpöydän lasi heijastaa Aavan uteliaat kasvot. Sulka ojentaa hänelle kysymyksen, ei valmista vastausta. Loikka innostuu kuplasta niin paljon, että haluaisi nimetä uuden kaasun heti. Ystävät palaavat kuitenkin katsomaan, mikä oli havainto ja mikä vasta mahdollinen selitys.\n\nLaboratorio on kokonaan virtuaalinen tutkimuspaikka. Välineiden valinta ja käyttö perustuvat tehtävän tarkoitukseen, ja tarvittava turvallinen menettely annetaan. Näytetunniste, olosuhde, mittaustulos ja yksikkö pysyvät yhdessä. Taulukko tai kuvaaja ei saa muuttaa hankalaa tulosta mukavammaksi. Jos etiketti on epäselvä, tutkimus kertoo epävarmuudesta; siitä ei rangaista eikä puuttuvaa arvoa keksitä. Aava oppii myös esittämään kysymyksen niin, että siihen voi saada havaittavan vastauksen.\n\nJokainen tutkimusvaihe voidaan harjoitella omasta valmiista aineistostaan. Kysymystehtävä ei odota toisen näytteen mittaamista, eikä johtopäätös oleta, että pelaaja olisi tehnyt rinnakkaisen kokeen. Kokonaisnäytössä Sulka antaa uuden tapauksen, jossa tulos ja sen luotettavuus täytyy yhdistää. Huipennus on avoimen näyttelyn avautuminen ystäville: jokainen voi seurata, mistä väite tulee. Tutkimusraportin yhteiset nimikirjoitukset tuntuvat lupaukselta puhua totta myös silloin, kun vastaus on keskeneräinen. Mereltä tuleva iltavalo saa lasit hohtamaan, mutta näyttelyn arvokkain asia on tarkistettavaksi jätetty ajatus.",
    "payoff": "Lasilaboratorion näyttely ja perusteltu yhteinen raportti avautuvat retkeläisille.",
    "nodeIds": [
      "CHEM79-LAB-01",
      "CHEM79-QUESTION-01",
      "CHEM79-PLAN-01",
      "CHEM79-OBS-01",
      "CHEM79-MEAS-01",
      "CHEM79-DATA-01",
      "CHEM79-CONCL-01",
      "CHEM79-DATA-COLLECT",
      "CHEM79-DATA-PRESENT",
      "CHEM79-CONCLUSION",
      "CHEM79-INVESTIGATION-EVAL"
    ]
  },
  {
    "id": "SCI15",
    "title": "Kristallilahden erottamo",
    "theme": "Puhtaat aineet, seokset, liukoisuus, liuokset ja erotusmenetelmät",
    "motif": "Näkymätön kide löytyy uudelleen nimetystä mallista.",
    "world": "Kristallilahden veden alla kivet näyttävät tavallista suuremmilta. Rannalla Sulka on rakentanut virtuaalisen erottamon, jonka pöydällä eri näytteet voivat näyttää aivan samoilta ja silti sisältää eri aineita. Aava haluaa ottaa käyttökelpoiset materiaalit talteen. Loikka olisi tyytyväinen heti, kun vesi näyttää kirkkaalta, mutta koostumuskortti kertoo myös siitä, mitä silmä ei näe.\n\nErottamon ensimmäinen arvoitus koskee puhtautta ja sekoittumista. Alkuaine, yhdiste ja seos eivät asetu laatikoihin pelkän värin tai kirkkauden perusteella. Eri kohdista otetut mallinäytteet auttavat tutkimaan koostumuksen tasaisuutta. Liukenemisessa kide voi kadota makrokuvasta, mutta sen aine löytyy edelleen merkitystä hiukkasmallista. Liuotin nimetään aina; veden ja rasvan kanssa käyttäytyminen ei ole automaattinen hyvän tai vaarallisen aineen luokitus.\n\nTalteenoton työpöydällä menetelmä valitaan aineiden ominaisuuksista ja tavoitellusta osasta. Suodatin jättää tietyt hiukkaset taakseen, haihtuminen muuttaa liuottimen paikkaa ja dekantointi käyttää erottuneita kerroksia tai laskeumaa. Näitä katsotaan vain annettuina virtuaalisina menettelyinä. Kirkas lopputulos ei saa juomakelpoisuuden lupausta. Kokonaistehtävän loppukuvassa hiekka, kiteet ja erotettu kerros löytävät kukin oman talteenottopaikkansa. Aava näkee, että ennen hankalalta näyttänyt seos sisältää monta erilaista mahdollisuutta. Jokainen menetelmätehtävä saa oman näytteensä; niiden välillä ei tarvitse kuljettaa tavaroita eikä suorittaa sisarhaaroja määrätyssä järjestyksessä. Talteen saatu paikallinen tulos jää lahden näyttelyyn muistoksi.",
    "payoff": "Annetun seoksen osat saadaan perustellulla menettelyllä omille paikoilleen erottamon talteenottopöydälle.",
    "nodeIds": [
      "CHEM79-PURE-MIX",
      "CHEM79-MIX-HOM",
      "CHEM79-SOLUBILITY",
      "CHEM79-WATERFAT-SOL",
      "CHEM79-SEPARATE-01",
      "CHEM79-SEPARATE-02",
      "CHEM79-SOLUTION",
      "CHEM79-FILTRATION",
      "CHEM79-EVAPORATION",
      "CHEM79-DECANTING"
    ]
  },
  {
    "id": "SCI16",
    "title": "Pienten rakenteiden luolat",
    "theme": "Kemialliset mallit, mittakaava, hiukkaset, atomit, alkuaineet ja yhdisteet",
    "motif": "Kaksi rinnakkaista ikkunaa: havainto ja nimetty selitysmalli.",
    "world": "Vuoren sisällä on luola, jonka seinät näyttävät ensin pelkältä kiveltä. Sulka avaa yhden havaintoikkunan, ja kiven rinnalle ilmestyy selvästi merkitty rakennekuva. Aava ei pienene atomien kokoiseksi eikä astu kirjaimelliseen pienoisavaruuteen. Hän kulkee näyttelyssä, jossa eri esitykset auttavat selittämään samaa ainetta. Loikka yrittää välillä etsiä pallomallin väristä ainetta oikeasta näytteestä ja saa huomata, mihin mallin vertaus päättyy.\n\nLuolan saleissa liike, järjestys ja rakenne saavat eri ikkunat. Kiinteä aine ei ole hiukkastasolla täysin liikkumaton. Sulaminen ei muuta vesimolekyylejä uusiksi alkuaineiksi. Atomin ydin ja elektroniverho erotetaan ilman planeettaratojen harhaanjohtavaa kuvastoa. Hiukkasten varaukset ja sijainnit nimetään täsmällisesti, ja protonien määrä antaa alkuaineelle tunnisteen. Suuren seinäkartan rivit ja sarakkeet muuttavat yksittäiset näytteet jaksolliseksi järjestelmäksi.\n\nYhdisteiden holvissa erilaiset atomilajit liittyvät samaan aineeseen. Mukana on sekä molekyylimalleja että hilamalleja, jotta yksi tuttu kuva ei muutu kaikkia aineita koskevaksi oletukseksi. Paikalliset huipennukset paljastavat salin jonkin rakenteen: nimetön näyte löytää paikkansa, ennustettu ominaisuus saa aineistosta vahvistuksen tai kideholvin toistuva järjestys tulee näkyviin. Jokainen näyttelyikkuna tuo omat tarvittavat tietonsa. Alkuaineeseen voidaan tutustua myös aineiden luokittelun kautta; atomimallin vahvaa tukisuhdetta ei tehdä uudeksi pakkoportiksi. Luolan ihme on näkymättömän selitettävyyttä, ei näennäisen tarkan mallin sekoittamista todellisuuden valokuvaksi.",
    "payoff": "Kideholvin, atomikartan tai olomuotosalin paikallinen arvoitus avautuu perustellun mallin avulla.",
    "nodeIds": [
      "CHEM79-MODEL-01",
      "CHEM79-STATE-01",
      "CHEM79-STATECHANGE",
      "CHEM79-ELEMENT",
      "CHEM79-ATOM-01",
      "CHEM79-ATOM-NUCLEUS",
      "CHEM79-PROTON",
      "CHEM79-ELECTRON",
      "CHEM79-NEUTRON",
      "CHEM79-ATOMICNUM",
      "CHEM79-PERIODIC-01",
      "CHEM79-PERIOD-GROUP",
      "CHEM79-ELEM-PROP",
      "CHEM79-COMPOUND",
      "CHEM79-COMP-MODEL",
      "CHEM79-SCALE",
      "CHEM79-PARTICLE-MODEL-USE",
      "CHEM79-STRUCTURE-MODEL-USE"
    ]
  },
  {
    "id": "SCI17",
    "title": "Ainekirjainten kirjasto",
    "theme": "Kemialliset merkit, kaavat, alaindeksit, kertoimet ja reaktioyhtälöt",
    "motif": "Pieni numero, jonka oikea paikka muuttaa koko lukutavan.",
    "world": "Ainekirjainten kirjasto on rakennettu luolan kuivaan syvennykseen. Hyllyjen välissä riippuu läpikuultavia sivuja, mutta työpöydän teksti pysyy vakaana ja terävänä. Aava löytää näytekortin, johon mahtuu vain muutama merkki. Loikka ihmettelee, miten niin pieni kirjoitus voi kertoa kokonaisesta aineesta. Sulka näyttää, että kirjainkoko, alaindeksin paikka ja kaavan edessä oleva kerroin kantavat eri merkityksiä.\n\nKirjastossa ei tarvitse opetella uusia kirjoitusasentoja joka tehtävään. Kaava, merkkiselite ja laskettava malli näkyvät rinnakkain. Yksi sivu kysyy atomilajeja, toinen niiden lukusuhdetta. Kolmas auttaa erottamaan kokonaisen hiukkasryhmän määrän ryhmän sisäisestä rakenteesta. Kauniit kirjaimet eivät saa toimia arvattavana salakielenä; tarvittava taulukko ja selite ovat aina saatavilla. Tekstin rinnalla annetut malliosat tekevät abstraktista merkinnästä tarkistettavan.\n\nMuutoskirjan suurella aukeamalla reaktioyhtälön vasen ja oikea puoli ovat kaksi nimettyä rantaa. Lähtöaineista tulee tuotteita, mutta tavallisen kemiallisen reaktion atomilajit ja määrät säilyvät. Tasapainotuksessa aineiden kaavat pysyvät lukittuina ja kertoimia voidaan muuttaa. Huipennuksessa yksikään atomi ei jää rannalle: laskentataulu täsmää, muutosesitys järjestyy ja kirjan sinetti sulkeutuu. Muut haarat saavat omat pienet päättymisensä, kuten kadonneen alaindeksin oikean lukutavan löytymisen. Kirjaston vierailut ovat itsenäisiä tutkimussivuja; niiden avautuminen ei väitä, että kaikki muut kaavat tai rinnakkaiset kemiantehtävät olisi jo opittu.",
    "payoff": "Tasapainotettu paikallinen muutosesitys yhdistää kaksi rantaa samoilla atomimäärillä ja sulkee muutoskirjan sinetin.",
    "nodeIds": [
      "CHEM79-SYMBOL",
      "CHEM79-FORMULA",
      "CHEM79-SUBSCRIPT",
      "CHEM79-REACTION-EQ-01",
      "CHEM79-COEFF",
      "CHEM79-BALANCE",
      "CHEM79-FORMULA-ELEMENTS",
      "CHEM79-FORMULA-RATIO"
    ]
  },
  {
    "id": "SCI18",
    "title": "Muutosten kidepaja",
    "theme": "Fysikaalinen ja kemiallinen muutos, reaktiot, säilyminen, energia ja reaktionnopeus",
    "motif": "Suljettu kammio ja sen ulkopuolella pysyvä aine- tai energiatili.",
    "world": "Kidepajan lattian läpi näkyy hiljainen maanalainen virta. Pöydillä on suljettuja virtuaalisia kammioita, joiden sisällä aineet voivat muuttua turvallisesti tarkasteltaviksi malleiksi. Aava haluaa tietää, milloin aine vain vaihtaa muotoa ja milloin syntyy uutta ainetta. Loikka pitää jokaista kuplaa suurena löytönä, mutta Sulka tuo rinnalle koostumustiedot ja kysyy, mitä ne todella osoittavat.\n\nPajan eri tutkimusikkunat eivät ole yksi vaarallinen työohje. Palamista katsotaan tallenteena ja ainevirtamallina. Olomuodon muutoksen ja reaktion vertailu saa omat valmiit lähtötietonsa, joten vaihtoehtoisia pohjapolkuja ei vaadita molempia. Reaktiomallissa atomit järjestyvät uudelleen ja suljetun järjestelmän aine säilyy myös kaasujen kuuluessa kokonaisuuteen. Energian siirtymisen suunta merkitään suhteessa ympäristöön; pajan valo ei kerro yksin reaktion energialuonnetta.\n\nNopeustutkimuksen sali muistuttaa rauhallista konetta, jonka yhtä asetusta voi muuttaa kerrallaan. Lämpötila, pitoisuus ja palakoko saavat kukin oman paikallisen vertailunsa. Samat alkuolosuhteet ja näkyvä data tekevät muutoksesta tutkimuksen. Oppija ei lämmitä oikeaa ainetta tai valmista reaktiivista seosta. Huipennuksissa malliseinä paljastaa syyn: uudet pinnat avautuvat, hiukkaskohtaamisten ero näkyy tai energiamosaiikki järjestyy kahteen suuntaan. Pajan tunne on muutoksen ymmärtäminen ilman tuhoamisen hurmosta. Aava ja Loikka voivat katsoa odottamatonta tulosta rauhassa, korjata selitystään ja jättää tutkimuskammioon pysyvän merkinnän siitä, mitä kyseisessä tilanteessa havaittiin.",
    "payoff": "Paikallisen reaktiomallin arvoitus ratkeaa: rakenne järjestyy uudelleen, energian suunta selviää tai nopeuseron syy paljastuu.",
    "nodeIds": [
      "ENV-CHEM-BURN-01",
      "CHEM79-CHANGE-PHYS",
      "CHEM79-REACTION-01",
      "CHEM79-REACT-PROD",
      "CHEM79-MATTER-CONS",
      "CHEM79-REACTION-MODEL",
      "CHEM79-REACTION-ENERGY",
      "CHEM79-EXOENDO",
      "CHEM79-RATE-01",
      "CHEM79-RATE-FACTOR",
      "CHEM79-RATE-TEMP",
      "CHEM79-RATE-CONC",
      "CHEM79-RATE-SURF"
    ]
  },
  {
    "id": "SCI19",
    "title": "Lähteiden tutkimuspuutarha",
    "theme": "Pitoisuus, prosenttipitoisuus, happamuus, pH ja indikaattorit",
    "motif": "Kaksi erikokoista pulloa ja samaan suhteeseen osuva merkintä.",
    "world": "Lähteiden tutkimuspuutarhassa vesi kulkee matalien kivireunojen välissä, mutta näytteitä tutkitaan erillisellä virtuaalipöydällä. Aava asettaa vierekkäin suuren ja pienen pullon. Loikka valitsisi suuremman väkeväksi, kunnes Sulka näyttää molempien koostumuksen. Puutarhan ensimmäinen yllätys on, että koko ja aineosan suhteellinen määrä kertovat eri asioita.\n\nPitoisuutta tutkitaan yhteisellä mittakaavalla. Aineosan määrä ja koko liuoksen määrä näkyvät samalla kertaa, ja prosenttilaskussa määritelmä nimetään. Massaprosentin nimittäjä ei vaihdu huomaamatta pelkäksi liuottimen massaksi. Näytteet ovat malliaineistoa, joten laskusta ei muodostu kemikaalin valmistusohjetta. Valmiin etiketin merkitys on auttaa toista tutkijaa ymmärtämään koostumus oikein.\n\nPuutarhan toisella puolella kolme penkkiä kuvaa happamaa, neutraalia ja emäksistä vesiliuosta. Mittaustieto ratkaisee paikan, eikä näytettä maisteta. pH-asteikko kertoo happamuudesta annetuissa oloissa; sitä ei esitetä lineaarisena viivoittimena tai yleisenä vaarallisuuslukuna. Indikaattorin väri saa aina rinnalleen tekstin, symbolin ja juuri kyseisen indikaattorin oman selitteen. Huipennuksessa nimetön näyte löytää perustellun luokan tai vaihteluvälin ja yksi tutkimusikkuna avautuu lähteen heijastukseen. Oppija ei puhdista oikeaa vesistöä happoja sekoittamalla. Puutarhan ihme syntyy siitä, että ulkonäöltään samanlaiset nesteet voivat kertoa eri tarinan, kun niiden tietoja opitaan lukemaan tarkasti ja rajatusti.",
    "payoff": "Tuntematon paikallinen näyte saa oikein rajatun koostumus- tai happamuuskuvauksen ja sen tutkimusikkuna avautuu.",
    "nodeIds": [
      "CHEM79-CONC-01",
      "CHEM79-CONC-COMP",
      "CHEM79-CONC-CALC",
      "CHEM79-ACIDBASE",
      "CHEM79-PH",
      "CHEM79-INDICATOR"
    ]
  },
  {
    "id": "SCI20",
    "title": "Hiilen ja veden kiertosaari",
    "theme": "Veden kierto, aineen säilyminen, yhteyttäminen, palaminen ja hiilen varastot sekä siirtymät",
    "motif": "Merkitty pisara ja hiilen merkki kulkevat omissa nimetyissä kartoissaan.",
    "world": "Kiertosaarella vuoren puro kulkee metsän läpi mereen, ja pilven varjo liikkuu hitaasti samoilla rinteillä. Aava seuraa pisaraa, Loikka lehden varjoa. Sulka avaa maiseman viereen tutkimuskartan, jossa veden ja hiilen reitit voidaan nähdä sekoittamatta niitä toisiinsa. Saari ei ole yksi suljettu putki, vaan monien varastojen, viiveiden ja vaihtoehtoisten reittien kohtaaminen.\n\nPisaran matka näyttää haihtumisen, tiivistymisen, sateen ja valunnan sekä sen, että vesi voi viipyä lumessa tai maan alla. Hiilen matkassa näkymätön ilman aine liittyy kasvin kasvuun. Valo tulee malliin energiana, vesi ja hiilidioksidi aineina. Hajottajat ja eliöiden muut aineensiirtymät estävät metsää muuttumasta pelkäksi kahden nuolen kuvaksi. Palamisen tallenne osoittaa hiilen siirtymistä ilmaan ilman että lapsi ohjataan tulen äärelle.\n\nPaikalliset tutkimukset saavat valmiit varastot ja tilanteet. Yhteyttämisen haara ei oleta metsän palaneen, eikä palamismalli odota toisen tehtävän kasvattamaa puuta. Kokonaiskohtauksessa hiilen saarineuvosto avaa suuren elävän kartan, jossa meri, metsä, ilma ja geologiset varastot liittyvät toisiinsa nimettyjen prosessien kautta. Aineen kierto ei lupaa, että muutoksen vaikutus korjaantuu heti. Eri aikajänteet ja virtojen suuruudet ovat näkyvissä. Huipennuksen tunne on kuuluminen: kotisaaren lehti liittyy valtavaan aineiden maailmaan, ja sen tutkiminen auttaa ymmärtämään sekä luonnon jatkuvuutta että sen herkkiä suhteita.",
    "payoff": "Saarineuvoston elävä kiertokartta yhdistää paikallisen metsän, meren ja ilman; pisaran oma haara saa täydellisen mutta vaihtoehdot näyttävän retken.",
    "nodeIds": [
      "ENV-CHEM-PHOTOSYN-01",
      "ENV-CHEM-MATTERCONS-01",
      "ENV-CHEM-WATERCYCLE-01",
      "ENV-CHEM-CYCLE-01",
      "ENV-CHEM-CYCLE-BURN-01",
      "ENV-CHEM-CYCLE-PHOTO-01",
      "ENV-CHEM-CYCLE-MATTER-01",
      "CHEM79-CARBONCYCLE",
      "CHEM79-CARBON-BURN",
      "CHEM79-CARBON-PHOTO",
      "CHEM79-CARBON-RESERVOIRS",
      "CHEM79-CARBON-TRANSFERS"
    ]
  },
  {
    "id": "SCI21",
    "title": "Hiilen elävä puutarha",
    "theme": "Hiiliyhdisteet, ravintoaineiden kemialliset ryhmät ja paikallisesti valittu orgaaninen yhdisteryhmä",
    "motif": "Pyöreä eväspöytä ja sen yllä eri aineryhmien rinnakkaiset tunnukset.",
    "world": "Hiilipuutarhan pöydät ovat pyöreitä, jotta jokainen ystävä mahtuu samaan eväshetkeen. Lehtien välistä roikkuu näyttelykortteja, joissa tuttu ruoka saa rinnalleen koostumustiedon. Aava avaa korin, ja Loikka etsii aineista tuttuja nimiä. Sulka näyttää, että kemiallinen aine ei tarkoita automaattisesti keinotekoista eikä ruoka kuulu vain yhteen aineryhmään.\n\nPuutarhan rakennesalissa hiili löytyy monenlaisista yhdisteistä. Atomilajit ja liittyminen auttavat vertaamaan rakenteita, mutta mallia ei käsitellä täydellisenä ominaisuuksien ennustuskoneena. Hiilihydraattien, rasvojen ja proteiinien omat ikkunat näyttävät ryhmien esimerkkejä. Makeus ei tunnista kaikkia hiilihydraatteja, näkyvä rasvalammikko ei määritä kaikkea rasvaa, ja proteiinia löytyy erilaisten ruokien koostumuksista. Näyttely ei anna lapselle ruokavaliomääräyksiä tai jaa aterioita moraalisesti hyviin ja huonoihin.\n\nPaikallisen puutarhurin tutkimuslaatikko on tarkoituksella nimetty vasta opetussuunnitelmaprofiilin mukaan. Se sisältää valitun orgaanisen yhdisteryhmän vertailuaineiston ja sen edellyttämän osaamisnäytön. Kaikille ei oleteta samaa ryhmää, eikä tyhjä profiili voi tuottaa valmista osaamismerkintää. Perheen yhteinen huipennus on eväspöydän avautuminen: monipuoliset koostumuskortit antavat tutuille annoksille uuden ymmärrettävän kerroksen, ja ystävät jakavat aterian. Yksittäisen ravintoaineryhmän tehtävä voi päättyä omaan pieneen näyttelyhetkeensä samassa puutarhassa. Mikään eväs ei vaadi toisen haaran valmistamista, ja kaikki tutkimiseen tarvittavat tiedot ovat valmiiksi näkyvillä.",
    "payoff": "Yhteinen eväspöytä avautuu kemiallisesti ymmärrettävänä kokonaisuutena; paikallinen yhdisteryhmä saa oman aineistoon perustuvan näyttelynsä.",
    "nodeIds": [
      "CHEM79-CARBON",
      "CHEM79-CARBON-COMPOUND",
      "CHEM79-NUTRIENT-01",
      "CHEM79-NUTRIENT-CARB",
      "CHEM79-NUTRIENT-FAT",
      "CHEM79-NUTRIENT-PROT",
      "CHEM79-ORG-GROUP"
    ]
  },
  {
    "id": "SCI22",
    "title": "Uudelleen rakentuvan rannan telakka",
    "theme": "Luonnonvarat, tuotteiden elinkaari, aine- ja energiavirrat sekä kestävyyden vertailu",
    "motif": "Korjatun kohdan näkyvä sauma ja uudelleen syttyvä lyhty.",
    "world": "Korjaustelakan rannassa kelluu vene, jonka kyljessä näkyy sekä vanhaa että uutta puuta. Sisällä riippuu retkilyhty, odottaa käyttökelpoinen kangas ja lepää laatikollinen osia, joilla on vielä tehtävä. Aava kysyy, mistä kaikki tämä on tullut. Sulka avaa materiaalien alkuperäpassit. Loikka huomaa, että esineen tarina alkaa kauan ennen sen saamista omaan käteen.\n\nTelakan kartta seuraa luonnonvaraa jalostukseen, valmistukseen, kuljetukseen ja käyttöön. Huolto, uudelleenkäyttö ja kierrätys piirtävät paluureittejä, mutta sivuvirrat, päästöt ja hävikki eivät katoa kuvasta. Materiaalin ja energian kulkua tutkitaan erikseen, jotta toisen parantuminen ei peitä toisen kasvavaa tarvetta. Vertailuun annetaan sama toiminnallinen tarve, käyttöaika ja tarkasteluraja. Tietojen puutteet saa nimetä; vihreä ulkoasu ei yksin ratkaise kestävyyttä.\n\nJokainen korjaustapaus alkaa lainatusta esineestä ja valmiista tilanneaineistosta. Rakennus-, energialähde- tai materiaalitehtävien sisarhaaroja ei vaadita ensin suoritettaviksi. Yksi paikallinen huipennus sytyttää korjatun lyhdyn telakan ikkunaan. Toinen palauttaa käyttökelpoisen ainevirran tarkoituksenmukaiseen käyttöön. Soveltava kokonaistehtävä päättyy saariston korjausjuhlaan, jossa yhteinen retkivaruste otetaan uudelleen käyttöön perustellun valinnan jälkeen. Juhlan kauneus syntyy näkyvästä historiasta: korjattu kohta saa jäädä esiin. Aava ja Loikka kasvavat ymmärtämään, ettei huolenpito ole vain uuden rakentamista. Se on myös olemassa olevan työn, aineiden ja toisten tarpeiden näkemistä sekä rajallisten ratkaisujen tekemistä mahdollisimman hyvin.",
    "payoff": "Paikallinen ratkaisu palauttaa retkivarusteen käyttöön ja telakan lyhtyjen alla vietetään korjausjuhlaa.",
    "nodeIds": [
      "CHEM79-RESOURCE",
      "CHEM79-LIFECYCLE",
      "CHEM79-SUSTAIN",
      "CHEM79-LIFECYCLE-STAGES",
      "CHEM79-LIFECYCLE-FLOWS",
      "CHEM79-SUSTAIN-COMPARE",
      "CHEM79-SUSTAIN-MATTER-FLOW",
      "CHEM79-SUSTAIN-ENERGY-FLOW"
    ]
  }
] as const;
export const familyLeafTreatments = [
  {
    "id": "CHEM79-CONCL-01",
    "familyId": "SCI14",
    "scene": "Lasilaboratorion yhteinen päätös",
    "action": "Muodosta tulosten tukema johtopäätös ja arvioi erikseen sen luotettavuus; nimeä yksi perusteltu rajaus.",
    "success": "Neuvosto hyväksyy läpinäkyvän tutkimusraportin, ja lasilaboratorion näyttely saa ystävien nimikirjoitukset.",
    "effectId": "world.CHEM79-CONCL-01.resolved"
  },
  {
    "id": "CHEM79-ELEM-PROP",
    "familyId": "SCI16",
    "scene": "Kartta, joka vihjaa ominaisuuksista",
    "action": "Vertaa annettuja ominaisuuksia ja paikkoja taulukossa; tee aineiston sallima laadullinen ennuste uudesta saman ryhmän esimerkistä.",
    "success": "Sulan valmis tutkimustieto vahvistaa rajatun ennusteen uudesta näytteestä. Gallerian tuntematon vitriini avautuu ja Aava saa kertoa, mikä kartan vihje auttoi.",
    "effectId": "world.CHEM79-ELEM-PROP.resolved"
  },
  {
    "id": "CHEM79-PERIOD-GROUP",
    "familyId": "SCI16",
    "scene": "Vaakarivi ja pystyperhe",
    "action": "Osoita alkuaineen jakso ja ryhmä annetussa numeroidussa taulukossa sekä erota vaakarivi pystysarakkeesta.",
    "success": "Kadonneen näytteen osoite löytyy oikeasta ryhmästä ja jaksosta. Gallerian kaksi opastavaa viivaa kohtaavat sen kohdalla ja hyllyn nimilaatta avautuu.",
    "effectId": "world.CHEM79-PERIOD-GROUP.resolved"
  },
  {
    "id": "CHEM79-SUSTAIN",
    "familyId": "SCI22",
    "scene": "Saariston korjausjuhla",
    "action": "Vertaile uuden tuotteen tai prosessin kestävyyttä aine- ja energiavirtojen sekä yhteisen tarpeen pohjalta; perustele ratkaisu ja yksi epävarmuus.",
    "success": "Korjaustelakka avaa yhteisen retkivarusteen uudelleen käyttöön, ja ystävät viettävät lyhtyjen alla aineiden ja työn arvon juhlaa.",
    "effectId": "world.CHEM79-SUSTAIN.resolved"
  },
  {
    "id": "CHEM79-CARBON-PHOTO",
    "familyId": "SCI20",
    "scene": "Lehden hiilitili",
    "action": "Yhdistä yhteyttäminen hiilen siirtymiseen ilmakehästä eliöihin ja tulkitse annettu paikallinen hiilivirta muiden siirtymien rinnalla.",
    "success": "Lehden ja ilman väliin avautuu mallissa jäljitettävä hiilen reitti. Aava näkee kasvin uuden kasvun annetussa aikasiirrossa ja osaa kertoa, mistä sen hiili tuli.",
    "effectId": "world.CHEM79-CARBON-PHOTO.resolved"
  },
  {
    "id": "CHEM79-CHEMICAL-SAFE",
    "familyId": "SCI08",
    "scene": "Retkivaraston selkeä sopimus",
    "action": "Tulkitse merkintä ja sovella juuri kyseistä ohjetta samaan virtuaalitilanteeseen; kumpikin osa tarvitsee näkyvän perustelun.",
    "success": "Huoltaja hyväksyy varaston järjestelyn, ja retkeläiset voivat käyttää muuta tilaa turvallisesti.",
    "effectId": "world.CHEM79-CHEMICAL-SAFE.resolved"
  },
  {
    "id": "ENV-PHY-DEVICE-01",
    "familyId": "SCI12",
    "scene": "Lyhdyn avautuva salaisuus",
    "action": "Tutki osien roolit, ennusta yhden osan muutoksen seuraus ja yhdistä havainto laitteen toimintaperiaatteeseen; sähkömalli antaa tarvittavat tiedot.",
    "success": "Lyhdyn osat asettuvat ymmärrettäväksi kokonaisuudeksi ja sen valo tervehtii Aavaa.",
    "effectId": "world.ENV-PHY-DEVICE-01.resolved"
  },
  {
    "id": "M-CALC-STRAT",
    "familyId": "LM07",
    "scene": "Aavan vapaa työkalupöytä",
    "action": "Valitse päässälasku tai kirjallinen tapa ja toteuta ratkaisu; hyväksy vaihtoehtoiset perustellut menetelmät tehtävän operaatiodomainissa.",
    "success": "Toimitus valmistuu valitulla ymmärrettävällä tavalla ja ratkaisujälki jää tarkistettavaksi.",
    "effectId": "world.M-CALC-STRAT.resolved"
  },
  {
    "id": "M-DATA-05",
    "familyId": "LM20",
    "scene": "Aavan kysymys yhdestä solusta",
    "action": "Lue pyydetty tieto taulukosta ja liitä se oikeaan kohteeseen sekä yksikköön.",
    "success": "Majakka lähettää juuri kysytyn paikallisen tiedon.",
    "effectId": "world.M-DATA-05.resolved"
  },
  {
    "id": "M-DATA-08",
    "familyId": "LM20",
    "scene": "Mitä pylväät todella näyttävät?",
    "action": "Tulkitse pylväsdiagrammista pyydetty arvo tai perusteltu vertailu; käytä vain aineiston tukemaa päätelmää.",
    "success": "Paikallinen retkisuunnitelma ottaa huomioon todellisen havaintoeron.",
    "effectId": "world.M-DATA-08.resolved"
  },
  {
    "id": "M-DATA-11",
    "familyId": "LM20",
    "scene": "Kysymykseen sopiva kuva",
    "action": "Valitse aineistoon ja kysymykseen tarkoituksenmukainen diagrammi ja rakenna se oikeilla nimillä sekä asteikolla.",
    "success": "Majakan viesti tekee juuri halutun suhteen ymmärrettäväksi.",
    "effectId": "world.M-DATA-11.resolved"
  },
  {
    "id": "M-DATA-12",
    "familyId": "LM20",
    "scene": "Majakan erilaiset ikkunat",
    "action": "Tulkitse opetetun diagrammityypin arvot ja suhteet sen omasta asteikosta; tuntematon esitystapa opetetaan ennen arviointia.",
    "success": "Majakka lähettää aineiston tukeman paikallisen viestin ilman väärää yleistystä.",
    "effectId": "world.M-DATA-12.resolved"
  },
  {
    "id": "M-FRAC-05",
    "familyId": "LM08",
    "scene": "Samanlaiset osat vertailussa",
    "action": "Vertaa samannimisiä murtolukuja saman kokonaisen malleilla ja osoita suurempi osuus.",
    "success": "Suurempi varaus tunnistetaan ja paikallinen sopimus voidaan perustella.",
    "effectId": "world.M-FRAC-05.resolved"
  },
  {
    "id": "M-FRAC-08",
    "familyId": "LM08",
    "scene": "Turhan tiheät viivat",
    "action": "Supista murtoluku ryhmittelemällä osoittajan ja nimittäjän osat samalla tekijällä; näytä suuruuden säilyminen.",
    "success": "Selkeämpi sopimus mahtuu majavan pesän ovikyltiksi.",
    "effectId": "world.M-FRAC-08.resolved"
  },
  {
    "id": "M-FRAC-09",
    "familyId": "LM08",
    "scene": "Kumpi ehdotus antaa enemmän?",
    "action": "Vertaa erinimisiä murtolukuja käyttäen opetettua vertailutapaa: vertailulukua, lukusuoraa tai yhteistä jakoa; strategia kirjataan.",
    "success": "Sopimus valitaan osuuksien todellisen koon perusteella ja molemmat ymmärtävät eron.",
    "effectId": "world.M-FRAC-09.resolved"
  },
  {
    "id": "M-FRAC-10",
    "familyId": "LM08",
    "scene": "Yksi allas ja vähän lisää",
    "action": "Muunna sekaluku epämurtoluvuksi ja takaisin käyttäen samaa näkyvää yksikkökokonaista.",
    "success": "Mallialtaan tarvittava täyttömäärä voidaan lukea kummallakin merkintätavalla.",
    "effectId": "world.M-FRAC-10.resolved"
  },
  {
    "id": "M-GEO-03",
    "familyId": "LM12",
    "scene": "Kummasta suunnasta tulet?",
    "action": "Toteuta ja tulkitse suuntakäsitteitä määrätyssä viitekehyksessä; tarkista reitti muuttuvasta lähtöasennosta.",
    "success": "Ystävät kohtaavat sovitulla rantapenkillä ilman arvailua.",
    "effectId": "world.M-GEO-03.resolved"
  },
  {
    "id": "M-GEO-06",
    "familyId": "LM13",
    "scene": "Aavan mallipurje",
    "action": "Rakenna tai piirrä mallin mukainen tasokuvio säilyttäen sen olennaiset ominaisuudet; hienomotoriikka ei määritä hyväksyntää.",
    "success": "Purje sopii paikallisen veneen näkyvään kiinnitysmalliin.",
    "effectId": "world.M-GEO-06.resolved"
  },
  {
    "id": "M-GEO-07",
    "familyId": "LM14",
    "scene": "Malli muuttuu rakennelmaksi",
    "action": "Kokoa mallin mukainen kappalerakenne napsahtavista osista ja tarkista myös syvyys; tarvittavat peittyvät osat näytetään.",
    "success": "Majakan työpiste saa mallia vastaavan pienen rakennelman.",
    "effectId": "world.M-GEO-07.resolved"
  },
  {
    "id": "M-GEO-23",
    "familyId": "LM15",
    "scene": "Aavan piirretty kulma",
    "action": "Piirrä kulma annetusta kärjestä ja alkusuunnasta, käyttäen napautuksia tai asteaskelia; mittatarkkuuden toleranssi on näkyvä.",
    "success": "Valmis kulmamerkki sopii kallion opastauluun.",
    "effectId": "world.M-GEO-23.resolved"
  },
  {
    "id": "M-GEO-09",
    "familyId": "LM14",
    "scene": "Kaksi hyllyjärjestelmää",
    "action": "Luokittele tasokuviot ja kappaleet asianmukaisilla säännöillä, perustele kummankin ryhmän yksi rajatapaus.",
    "success": "Varasto saa järjestyksen, jossa jokainen piirros ja rakennusosa löytyy tarkoitukseensa.",
    "effectId": "world.M-GEO-09.resolved"
  },
  {
    "id": "M-GEO-08",
    "familyId": "LM14",
    "scene": "Kuva ja kappale samalla pöydällä",
    "action": "Nimeä tasokuvion ja kappaleen ominaisuudet uudessa integraatiotehtävässä ja erottele sivu, tahko sekä särmä.",
    "success": "Työohje ei enää sekoita piirroksen reunaa rakennusosan pintaan.",
    "effectId": "world.M-GEO-08.resolved"
  },
  {
    "id": "M-GEO-17",
    "familyId": "LM14",
    "scene": "Majakan kartiokatto",
    "action": "Tunnista kartio ja kuvaa sen määrittävät ominaisuudet samassa uudessa tehtävässä.",
    "success": "Paikallisen majakkamallin katto suojaa pientä valohuonetta.",
    "effectId": "world.M-GEO-17.resolved"
  },
  {
    "id": "M-GEO-16",
    "familyId": "LM14",
    "scene": "Torni jonka muoto ymmärretään",
    "action": "Yhdistä ympyrälieriön tunnistaminen ja sen pohjien sekä vaipan kuvaaminen uudessa tehtävässä.",
    "success": "Paikallisen majakan torni asettuu malliin ja sen ikkuna valaistuu.",
    "effectId": "world.M-GEO-16.resolved"
  },
  {
    "id": "M-GEO-18",
    "familyId": "LM14",
    "scene": "Vuoristomajan huippu",
    "action": "Yhdistä pyramidin tunnistaminen ja ominaisuuksien kuvaaminen epätyypillisestä mallista.",
    "success": "Vuoristomajan pieni suojakatto asettuu paikalleen ja lyhty syttyy sen alle.",
    "effectId": "world.M-GEO-18.resolved"
  },
  {
    "id": "M-GEO-12",
    "familyId": "LM13",
    "scene": "Oikea ikkuna oikeaan suunnitelmaan",
    "action": "Yhdistä nelikulmion ominaisuuksien tunnistaminen ja luokittelu yhdeksi perustelluksi valinnaksi.",
    "success": "Ikkunamalli asettuu suunnitelmaan ja avaa näkymän poukamaan.",
    "effectId": "world.M-GEO-12.resolved"
  },
  {
    "id": "M-GEO-24",
    "familyId": "LM15",
    "scene": "Mitta kärjen kohdalle",
    "action": "Aseta kulmamitta oikein ja lue kulman suuruus oikealta asteikolta; kohdistus voi napsahtaa geometriseen kohtaan.",
    "success": "Heijastinmerkin suunnitelma saa oikean kulmatiedon.",
    "effectId": "world.M-GEO-24.resolved"
  },
  {
    "id": "M-MEAS-07",
    "familyId": "LM18",
    "scene": "Retkikorin punnitus",
    "action": "Suorita simuloitu punnitus annetuilla välineillä ja ilmaise massa yksikköineen; käytännön käsittelyosaamista ei päätellä tästä.",
    "success": "Korin todellinen mallimassa merkitään kuljetussuunnitelmaan.",
    "effectId": "world.M-MEAS-07.resolved"
  },
  {
    "id": "M-MEAS-10",
    "familyId": "LM18",
    "scene": "Sovittu määrä retkikannuun",
    "action": "Mittaa annettu nestemäärä virtuaalisella mitta-astialla; lue asteikko oikeasta kohdasta ja ilmoita yksikkö.",
    "success": "Retkikannu saa sovitun paikallisen määrän ilman ylitäyttöä.",
    "effectId": "world.M-MEAS-10.resolved"
  },
  {
    "id": "M-MEAS-12",
    "familyId": "LM18",
    "scene": "Oikea väline oikeaan kysymykseen",
    "action": "Valitse suureeseen tarkoituksenmukainen mittaväline ja perustele sen mittaama ominaisuus; dynaaminen suure-esitieto tarkistetaan.",
    "success": "Paikallinen mittaus pääsee alkamaan sopivalla välineellä.",
    "effectId": "world.M-MEAS-12.resolved"
  },
  {
    "id": "M-MEAS-13",
    "familyId": "LM18",
    "scene": "Yksikkö tekee tiedosta ymmärrettävän",
    "action": "Valitse kohteeseen sopiva opetettu mittayksikkö ja tunnista, miten yksikkö antaa lukuarvolle merkityksen.",
    "success": "Mittalappu muuttuu toisellekin rakentajalle käyttökelpoiseksi.",
    "effectId": "world.M-MEAS-13.resolved"
  },
  {
    "id": "M-MEAS-14",
    "familyId": "LM18",
    "scene": "Kuinka tarkasti mittari kertoo?",
    "action": "Tunnista asteikon sallima mittaustarkkuus ja anna tulos sen mukaisella tarkkuudella.",
    "success": "Retkivihkon mittatieto saa perustellun tarkkuuden.",
    "effectId": "world.M-MEAS-14.resolved"
  },
  {
    "id": "M-MEAS-16",
    "familyId": "LM18",
    "scene": "Aavan toinen tarkistus",
    "action": "Tarkista mittaus uusimalla tai vaihtoehtoisella sopivalla menetelmällä ja paikanna mahdollinen asetelmavirhe.",
    "success": "Paikalliseen rakennussuunnitelmaan jää perustellusti tarkistettu mitta.",
    "effectId": "world.M-MEAS-16.resolved"
  },
  {
    "id": "M-ADD-ASSOC",
    "familyId": "LM05",
    "scene": "Kolmen korin yhteinen tauko",
    "action": "Ryhmittele kolme yhteenlaskettavaa kahdella tavalla ja osoita sama kokonaismäärä.",
    "success": "Ystävät löytävät kätevän väliryhmän ja lastaavat kaiken samaan veneeseen.",
    "effectId": "world.M-ADD-ASSOC.resolved"
  },
  {
    "id": "M-ADD-COMM",
    "familyId": "LM05",
    "scene": "Kumpi kori ensin?",
    "action": "Vaihda yhteenlaskettavien järjestys ja tunnista summan säilyminen; perustele määrämallilla.",
    "success": "Satama hyväksyy kummankin saapumisjärjestyksen yhtä oikeaksi lastiksi.",
    "effectId": "world.M-ADD-COMM.resolved"
  },
  {
    "id": "M-DIVIS-02",
    "familyId": "LM06",
    "scene": "Sama suhde kahdesta suunnasta",
    "action": "Yhdistä jakaja ja monikerta samaan ryhmämalliin ja tulkitse suhde molempiin suuntiin.",
    "success": "Kimpun ja koko lastin kyltit muodostavat ymmärrettävän parin.",
    "effectId": "world.M-DIVIS-02.resolved"
  },
  {
    "id": "M-DIVIS-03",
    "familyId": "LM06",
    "scene": "Veistämön sopivat lastit",
    "action": "Luokittele lukuja annetun jaollisuusominaisuuden mukaan ja tarkista rajatapaukset; päällekkäiset luokat sallitaan.",
    "success": "Varasto löytää useita toimivia lastaustapoja yhteiselle retkelle.",
    "effectId": "world.M-DIVIS-03.resolved"
  },
  {
    "id": "M-FRAC-16",
    "familyId": "LM08",
    "scene": "Pieni osuus jaetaan reilusti",
    "action": "Jaa murtoluku positiivisella kokonaisluvulla n≥1 ja osoita uuden osuuden suhde alkuperäiseen kokonaiseen.",
    "success": "Pienet mallikanavat saavat tasaiset osuudet ja sopimuspöytä hiljenee tyytyväiseen solinaan.",
    "effectId": "world.M-FRAC-16.resolved"
  },
  {
    "id": "M-FRAC-13",
    "familyId": "LM08",
    "scene": "Erilaiset annokset samaan uomaan",
    "action": "Muodosta yhteinen jako ja laske erinimisten murtolukujen summa; osoita alkuperäisten osuuksien säilyminen.",
    "success": "Sivu-uoman sovittu yhteisannos näkyy täsmällisesti ja majava aloittaa paikallisen rakennusvuoronsa.",
    "effectId": "world.M-FRAC-13.resolved"
  },
  {
    "id": "M-GMEAS-05",
    "familyId": "LM17",
    "scene": "Kolmen mitan laatikko",
    "action": "Laske suorakulmaisen särmiön tilavuus samassa pituusyksikössä annetuista kolmesta mitasta, ilmoita kuutioyksikkö ja perustele kertolasku kerrosrakenteella.",
    "success": "Oikeankokoinen varastolaatikko valmistuu retkipaikalle.",
    "effectId": "world.M-GMEAS-05.resolved"
  },
  {
    "id": "M-MUL-ASSOC",
    "familyId": "LM06",
    "scene": "Korit veneissä",
    "action": "Ryhmittele kolmen tekijän rakenne kahdella tavalla ja yhdistä molemmat samaan kokonaismäärään.",
    "success": "Retkieväät pakataan kätevällä ryhmittelyllä kaikkiin veneisiin.",
    "effectId": "world.M-MUL-ASSOC.resolved"
  },
  {
    "id": "M-MUL-COMM",
    "familyId": "LM06",
    "scene": "Rivit kääntyvät",
    "action": "Käännä rivimallia ja muodosta molemmat kertolaskut; todista kokonaismäärän säilyminen kohdevastaavuudella.",
    "success": "Lautan piirustus sopii uuteen laituriin menettämättä istuimia.",
    "effectId": "world.M-MUL-COMM.resolved"
  },
  {
    "id": "M-DIV-FACT-01",
    "familyId": "LM06",
    "scene": "Puuttuva venemäärä",
    "action": "Ratkaise helppo jakolasku tunnettua kertolaskufaktaa hyödyntäen ja valitse sitä todentava kertolasku.",
    "success": "Tarvittavat veneet löytyvät ja lasti voidaan jakaa valmiiksi.",
    "effectId": "world.M-DIV-FACT-01.resolved"
  },
  {
    "id": "M-NUM-04",
    "familyId": "LM03",
    "scene": "Viiden lehden salaisuus",
    "action": "Tunnista näkyvän ryhmittelyn kokonaismäärä ja valitse sitä vastaava ositus; ryhmät eivät peitä toisiaan.",
    "success": "Loikka täyttää sopivan kokoisen lautan yhdellä harkitulla siirrolla.",
    "effectId": "world.M-NUM-04.resolved"
  },
  {
    "id": "M-NUM-05",
    "familyId": "LM03",
    "scene": "Sopivan kokoinen lehtikori",
    "action": "Valitse selvästi erottuvista määräalueista uskottava arvio ja vertaa sitä myöhemmin näkyvään ryhmittelyyn.",
    "success": "Riittävän kokoinen kori odottaa kerääjiä ja arvio saa havaintoon perustuvan tarkennuksen.",
    "effectId": "world.M-NUM-05.resolved"
  },
  {
    "id": "M-NUM-17",
    "familyId": "LM04",
    "scene": "Kaksi yhtä iloista koria",
    "action": "Jaa parillinen lukumäärä kahteen yhtä suureen joukkoon ja tarkista osien sekä kokonaisuuden suhde.",
    "success": "Molemmat retkikorit saavat yhtä paljon ja ystävät vaihtavat tyytyväiset tervehdykset.",
    "effectId": "world.M-NUM-17.resolved"
  },
  {
    "id": "M-DATA-02",
    "familyId": "LM20",
    "scene": "Yksi havainto, yksi merkintä",
    "action": "Tallenna yksittäiset havainnot kerran ja oikeaan luokkaan; tapahtuman voi pysäyttää tai toistaa.",
    "success": "Pienen laiturin tapahtumat säilyvät tarkistettavana muistina.",
    "effectId": "world.M-DATA-02.resolved"
  },
  {
    "id": "M-NEG-04",
    "familyId": "LM10",
    "scene": "Aavan muuttuva mittaus",
    "action": "Siirry lukusuoralla annetusta lähtöarvosta suunnatun kokonaislukumuutoksen verran ja ilmaise uusi arvo.",
    "success": "Paikallinen mittausketju muodostaa ymmärrettävän muutostarinan.",
    "effectId": "world.M-NEG-04.resolved"
  },
  {
    "id": "M-ALG-02",
    "familyId": "LM11",
    "scene": "Sääntö toiselle kerrottuna",
    "action": "Muodosta lukujonon sääntö sanallisesti ja tarkista, että se tuottaa annetut siirtymät; valittu selitys erotetaan omasta tuotoksesta.",
    "success": "Aava jatkaa pajan merkkejä Loikan ymmärrettävän ohjeen mukaan.",
    "effectId": "world.M-ALG-02.resolved"
  },
  {
    "id": "M-FRAC-04",
    "familyId": "LM08",
    "scene": "Veden osuus lukusuoralla",
    "action": "Sijoita murtoluku oikein jaettuun lukusuoran yksikköväliin, myös kokonaisen ylittävissä tehtävissä opetetulla alueella.",
    "success": "Sopimusmerkki löytyy samasta kohdasta kuvassa ja lukusuoralla.",
    "effectId": "world.M-FRAC-04.resolved"
  },
  {
    "id": "M-NUM-09",
    "familyId": "LM03",
    "scene": "Keskimmäisen kiven naapurit",
    "action": "Täydennä annetun luvun edeltäjä ja seuraaja, myös silloin kun keskimmäinen luku vaihtuu.",
    "success": "Puuttuvat naapurikivet täydentävät pienen sivupolun ilman koko jonon toistoa.",
    "effectId": "world.M-NUM-09.resolved"
  },
  {
    "id": "M-NEG-03",
    "familyId": "LM10",
    "scene": "Kumpi arvo on pienempi?",
    "action": "Vertaa ja järjestä negatiivisia kokonaislukuja lukusuoran avulla ja myöhemmin itsenäisesti.",
    "success": "Havaintotaulu saa oikean suuruusjärjestyksen ja virheellinen hälytysmerkki poistuu.",
    "effectId": "world.M-NEG-03.resolved"
  },
  {
    "id": "M-NUM-11",
    "familyId": "LM03",
    "scene": "Laiturien rauhallinen jono",
    "action": "Järjestä useita luonnollisia lukuja suuruuden mukaan ja tarkista vierekkäiset parit.",
    "success": "Rantakierroksen kyltit asettuvat selkeäksi reitiksi, jota seurue voi seurata.",
    "effectId": "world.M-NUM-11.resolved"
  },
  {
    "id": "M-NUM-12",
    "familyId": "LM03",
    "scene": "Mitä kolme kertoo?",
    "action": "Valitse tilanteet, joissa luku ilmaisee määrää, ja rakenna yhtä tapausta vastaava joukko.",
    "success": "Oikea määrä paikkoja valmistuu viestin mukaisesti.",
    "effectId": "world.M-NUM-12.resolved"
  },
  {
    "id": "M-NUM-13",
    "familyId": "LM03",
    "scene": "Aavan paikka jonossa",
    "action": "Osoita annettu järjestysnumero nimetystä aloituspäästä ja kerro kohteen paikka muuttuneessa jonossa.",
    "success": "Aavan vene sujahtaa oikeaan vuoropaikkaan ja odotus pysyy reiluna.",
    "effectId": "world.M-NUM-13.resolved"
  },
  {
    "id": "M-NUM-14",
    "familyId": "LM03",
    "scene": "Mitä neljä mittakeppiä kertoo?",
    "action": "Liitä näkyvään mittaukseen lukuarvo ja yksikkö; erottele mittaustulos esineiden pelkästä lukumäärästä.",
    "success": "Laiturin mittalappu löytää paikkansa rakennussuunnitelmasta.",
    "effectId": "world.M-NUM-14.resolved"
  },
  {
    "id": "M-NUM-15",
    "familyId": "LM04",
    "scene": "Vierasparit laiturilla",
    "action": "Muodosta parit ja luokittele määrä parilliseksi tai parittomaksi; perustelu näkyy mahdollisessa yksittäisessä merkissä.",
    "success": "Vieraat löytävät paripaikat ja yksittäiselle tulijalle valmistuu oma mukava istuin.",
    "effectId": "world.M-NUM-15.resolved"
  },
  {
    "id": "M-NUM-16",
    "familyId": "LM04",
    "scene": "Tasatahtiset kaislalastit",
    "action": "Jatka tasavälistä jonoa ja osoita, miten sen arvot syntyvät saman perusmäärän monikerroista.",
    "success": "Lautan lastikirja ja varaston kimput vastaavat toisiaan.",
    "effectId": "world.M-NUM-16.resolved"
  },
  {
    "id": "M-DEC-05",
    "familyId": "LM09",
    "scene": "Lyhyempi luku voi olla suurempi",
    "action": "Vertaa ja järjestä desimaalilukuja paikka-arvon tai saman kokonaisen mallin perusteella, myös loppunollilla.",
    "success": "Asema ohjaa suuremman varauksen oikeaan lähetyslokeroon.",
    "effectId": "world.M-DEC-05.resolved"
  },
  {
    "id": "M-DEC-06",
    "familyId": "LM09",
    "scene": "Pilkullinen kohta reitillä",
    "action": "Sijoita desimaaliluku lukusuoralle säilyttäen yksikkövälin ja asteikon arvot.",
    "success": "Tarkkuusmerkki asettuu oikealle kohdalle viestireittiä.",
    "effectId": "world.M-DEC-06.resolved"
  },
  {
    "id": "M-MENTAL-01",
    "familyId": "LM05",
    "scene": "Loikan lyhyempi laskureitti",
    "action": "Valitse luvulle laskemista helpottava hajotelma ja käytä sitä annetussa tehtävässä; hyväksy useita perusteltuja tapoja.",
    "success": "Loikka ratkaisee lastin määrän ymmärrettävällä oikoreitillä ja näyttää sen Aavalle.",
    "effectId": "world.M-MENTAL-01.resolved"
  },
  {
    "id": "M-PROB-03",
    "familyId": "LM21",
    "scene": "Toivotut merkit kaikkien joukossa",
    "action": "Merkitse suotuisat ja kaikki mahdolliset alkeistulokset sekä niiden määrät; älä oleta tarpeetonta prosenttilaskua.",
    "success": "Toivottua viestiä koskeva paikallinen arvio perustuu oikeaan tulosjoukkoon.",
    "effectId": "world.M-PROB-03.resolved"
  },
  {
    "id": "M-PROB-05",
    "familyId": "LM21",
    "scene": "Luodon perusteltu valinta",
    "action": "Valitse todennäköisin vaihtoehto vertaamalla annettuja jakaumia; palaute arvioi perustelun, ei yhtä satunnaista tulosta.",
    "success": "Luodon oma leikkiviesti lähetetään perustellulla valinnalla, ja sattumalle jää tilaa.",
    "effectId": "world.M-PROB-05.resolved"
  },
  {
    "id": "M-PROB-06",
    "familyId": "LM21",
    "scene": "Mitä tapahtuu jos ei tätä?",
    "action": "Muodosta tapahtuman vastatapahtuma samassa tulosjoukossa ja tarkista kattavuus sekä päällekkäisyyden puuttuminen.",
    "success": "Luodon suunnitelma huomioi myös kaikki muut mahdolliset lopputulokset.",
    "effectId": "world.M-PROB-06.resolved"
  },
  {
    "id": "M-PROG-07",
    "familyId": "LM22",
    "scene": "Poukaman luotettava kuljetus",
    "action": "Testaa ohjelmaa suhteessa kaikkiin tavoitteen ehtoihin ja korjaa havaittu virhe; annettu ja itse tuotettu ohjelma ovat kanoniset vaihtoehtoiset reitit.",
    "success": "Paikallinen toimitus onnistuu, Aava vastaanottaa paketin ja lautta palaa sovitusti vain jos se kuuluu tavoitteeseen.",
    "effectId": "world.M-PROG-07.resolved"
  },
  {
    "id": "M-PROG-03",
    "familyId": "LM22",
    "scene": "Testistä perusteltuun päätökseen",
    "action": "Suorita ohje järjestelmällisesti ja arvioi sen toimivuus tavoitteeseen nähden uudessa integraatiotehtävässä.",
    "success": "Testattu paikallinen ohje hyväksytään käyttöön ja paketti saa luotettavan reitin.",
    "effectId": "world.M-PROG-03.resolved"
  },
  {
    "id": "M-PS-01",
    "familyId": "LM02",
    "scene": "Köysipulman kaksi taskua",
    "action": "Siirrä annetut tiedot ja kysymys omiin näkyviin taskuihinsa; merkitse vasta myöhemmin ratkaistava tuntematon.",
    "success": "Köyden suunnitelmasta tulee ymmärrettävä ja ystävät löytävät oikean työvaiheen.",
    "effectId": "world.M-PS-01.resolved"
  },
  {
    "id": "M-PS-02",
    "familyId": "LM02",
    "scene": "Kivien koerakennelma",
    "action": "Kokeile yhtä rajattua ratkaisustrategiaa, kirjaa sen tuottama havainto ja valitse perusteltu seuraava yritys.",
    "success": "Toimiva kokeilu pitää teltan paikallaan ja myös hylätty yritys säilyy hyödyllisenä luonnoksena.",
    "effectId": "world.M-PS-02.resolved"
  },
  {
    "id": "M-PS-03",
    "familyId": "LM02",
    "scene": "Reitti ilman turhaa kantamista",
    "action": "Valitse annettuun tuttuun ongelmaan toimiva strategia ja suorita sen ratkaiseva askel; perustele sopivuus tavoitteen kautta.",
    "success": "Tarvikkeet saapuvat teltalle suunnitellusti ja pelaajan valitsema tapa näkyy kuljetusjäljessä.",
    "effectId": "world.M-PS-03.resolved"
  },
  {
    "id": "M-PS-04",
    "familyId": "LM02",
    "scene": "Kaksi siltaa samaan vastaukseen",
    "action": "Vertaile kahden toimivan strategian vaiheita; tunnista sama tulos ja tilanteesta riippuva etu ilman nopeuskilpailua.",
    "success": "Ystävät liittävät molemmat selitykset yhteiseen telttaseinään ja sopivat tilanteeseen sopivan valinnan.",
    "effectId": "world.M-PS-04.resolved"
  },
  {
    "id": "M-PS-05",
    "familyId": "LM02",
    "scene": "Liian suuri eväskori",
    "action": "Valitse perusteltu arvioalue ja vertaa ehdotettua tulosta siihen; tarkka lasku ei ole ensimmäinen pakollinen askel.",
    "success": "Ylimääräinen jättikori katoaa suunnitelmasta ja oikean kokoinen retkikori jää käyttöön.",
    "effectId": "world.M-PS-05.resolved"
  },
  {
    "id": "M-PS-06",
    "familyId": "LM02",
    "scene": "Minne laskupolku kääntyi?",
    "action": "Merkitse ensimmäinen perustelematon vaihe ja korjaa ratkaisun suunta; hyväksyntä vaatii prosessin arviointia, ei vain lopputulosta.",
    "success": "Suunnitelman katkennut yhteys korjautuu ja telttakylän reitti johtaa oikealle laiturille.",
    "effectId": "world.M-PS-06.resolved"
  },
  {
    "id": "M-REP-01",
    "familyId": "LM02",
    "scene": "Kivet kertovat ajatuksen",
    "action": "Rakenna tunnetusta matemaattisesta tilanteesta välinemalli; tarkistetaan määrien ja suhteiden vastaavuus, ei asetelman kauneus.",
    "success": "Aava pystyy jatkamaan mallin avulla ja kattaa pienen pöydän oikein.",
    "effectId": "world.M-REP-01.resolved"
  },
  {
    "id": "M-REP-02",
    "familyId": "LM02",
    "scene": "Kartta jonka toinen ymmärtää",
    "action": "Piirrä tai rakenna pisteistä tilanteen malli ja yhdistä sen osat annettuihin määriin; koristeita ei arvioida.",
    "success": "Vihkon kuva toimii viestinä ja Aava toteuttaa sen mukaisen jaon.",
    "effectId": "world.M-REP-02.resolved"
  },
  {
    "id": "M-REP-03",
    "familyId": "LM02",
    "scene": "Kerro miten tiesit",
    "action": "Muodosta oma suullinen selitys tutulle ratkaisulle; aikuisen arvio erotetaan valmiin perustelun tunnistamisesta, eikä äänentunnistus päätä osaamista.",
    "success": "Aava kääntää vihkon kuulijaa kohti ja ystävät saavat rauhallisen hetken oman ajatuksen jakamiseen; ymmärrettävyyden arvio kuuluu ihmiselle.",
    "effectId": "world.M-REP-03.resolved"
  },
  {
    "id": "M-REP-04",
    "familyId": "LM02",
    "scene": "Ajatus pieneksi merkiksi",
    "action": "Rakenna tilanteesta symboliesitys vain opetetulla merkkisanastolla ja osoita yhden merkin vastine tilanteessa.",
    "success": "Lyhyt merkintä mahtuu laiturin viestilappuun ja toinen hahmo tulkitsee sen oikein.",
    "effectId": "world.M-REP-04.resolved"
  },
  {
    "id": "M-REP-05",
    "familyId": "LM02",
    "scene": "Majavan ymmärrettävä viesti",
    "action": "Valitse vähintään yhdestä opetetusta esitystavasta tilanteeseen sopiva ja osoita, mitä se näyttää selkeästi vastaanottajalle.",
    "success": "Majava nyökkää viestille ja toteuttaa oman paikallisen rakennusvuoronsa.",
    "effectId": "world.M-REP-05.resolved"
  },
  {
    "id": "M-EST-02",
    "familyId": "LM07",
    "scene": "Onko laivalasti mahdollinen?",
    "action": "Arvioi laskutuloksen suuruusluokka ja tunnista olennainen poikkeama; perustele se alkuperäisten lukujen avulla.",
    "success": "Virheellinen ylimääräinen nolla poistuu suunnitelmasta ja lasti saa järkevän koon.",
    "effectId": "world.M-EST-02.resolved"
  },
  {
    "id": "M-SCALE-02",
    "familyId": "LM16",
    "scene": "Saaren kuva vaihtaa kokoa",
    "action": "Tee suurennos tai pienennös annetulla mittakaavalla ja tarkista vastaavat pituudet.",
    "success": "Leiripiirros sopii uudelle opastaululle muotonsa säilyttäen.",
    "effectId": "world.M-SCALE-02.resolved"
  },
  {
    "id": "M-SCALE-03",
    "familyId": "LM16",
    "scene": "Matka kartasta rantaan",
    "action": "Mittaa tai lue kartalta annettu reittipituus ja muunna se todelliseksi etäisyydeksi näkyvän mittakaavan avulla.",
    "success": "Matkan pituus merkitään retkikarttaan ja ystävät saapuvat paikalliselle havaintopaikalle; tarinamatka ei vaadi uusia laskutaitoja.",
    "effectId": "world.M-SCALE-03.resolved"
  },
  {
    "id": "M-STAT-01",
    "familyId": "LM21",
    "scene": "Aineiston pienin merkki",
    "action": "Määritä aineiston pienin arvo ja osoita sitä vastaava havainto; huomioi mahdolliset tasatulokset.",
    "success": "Paikallisen retkisuunnitelman pienin havaittu arvo saa oikean merkinnän.",
    "effectId": "world.M-STAT-01.resolved"
  },
  {
    "id": "M-STAT-02",
    "familyId": "LM21",
    "scene": "Aineiston korkein havainto",
    "action": "Määritä aineiston suurin arvo ja liitä se havaintoon sekä yksikköön.",
    "success": "Luodon havaintotaulun yläraja vastaa todellista kirjattua arvoa.",
    "effectId": "world.M-STAT-02.resolved"
  },
  {
    "id": "M-FRAC-14",
    "familyId": "LM08",
    "scene": "Mikä osuus kuuluu putoukselle?",
    "action": "Tee osuuksista vertailukelpoisia ja vähennä erinimiset murtoluvut; näytä jäljelle jäävä määrä samasta kokonaisesta.",
    "success": "Putouksen paikalliseen pienoismalliin päätyy oikea osuus ja sen solina käynnistyy rauhallisena.",
    "effectId": "world.M-FRAC-14.resolved"
  },
  {
    "id": "M-ADD-SUB-SELECT",
    "familyId": "LM05",
    "scene": "Mitä satamassa tapahtui?",
    "action": "Valitse tilanteeseen yhteen- tai vähennyslasku ja liitä laskun luvut näkyviin osiin; avainsana yksin ei ratkaise.",
    "success": "Oikea laskumalli ohjaa pyydetyn paikallisen lastauksen loppuun.",
    "effectId": "world.M-ADD-SUB-SELECT.resolved"
  },
  {
    "id": "M-SYM-01",
    "familyId": "LM15",
    "scene": "Vedenpeilin toinen puoli",
    "action": "Tunnista tai rakenna peilaussymmetria annetun suoran suhteen; mukana myös vino akseli.",
    "success": "Rannan oma viestikuvio täydentyy vedenpeilin molemmin puolin.",
    "effectId": "world.M-SYM-01.resolved"
  },
  {
    "id": "M-SYM-02",
    "familyId": "LM15",
    "scene": "Tuulimerkin palaava asento",
    "action": "Tunnista kiertosymmetria testaamalla sallittuja kiertoja alle täyden kierroksen; keskipiste pysyy näkyvissä.",
    "success": "Tuulimerkin toistuva kierto muodostaa tunnistettavan oman tunnuksen.",
    "effectId": "world.M-SYM-02.resolved"
  },
  {
    "id": "M-SYM-03",
    "familyId": "LM15",
    "scene": "Saman kuvion rantakaista",
    "action": "Tunnista siirtosymmetria ja rakenna kuvion jatko samalla siirtovektorilla.",
    "success": "Rantakaista muodostaa ehjän opasteen levähdyspaikalle.",
    "effectId": "world.M-SYM-03.resolved"
  },
  {
    "id": "M-ALG-08",
    "familyId": "LM11",
    "scene": "Puuttuva osa päätellään",
    "action": "Ratkaise yksinkertainen yhtälö päättelemällä ja tarkista ratkaisu sijoittamalla; käytetty lukualue ilmoitetaan.",
    "success": "Laatikon sisältö sopii rakennelmaan ja pajan pieni mekanismi valmistuu.",
    "effectId": "world.M-ALG-08.resolved"
  },
  {
    "id": "M-ALG-09",
    "familyId": "LM11",
    "scene": "Loikan järjestelmälliset kokeet",
    "action": "Kokeile arvoja järjestelmällisesti, tulkitse kokeen tulos ja rajaa hakua; lopuksi varmista ratkaisu sijoittamalla.",
    "success": "Oikea osa löytyy perustellulla haulla ja laatikko avautuu rauhallisesti.",
    "effectId": "world.M-ALG-09.resolved"
  },
  {
    "id": "M-EXPR-01",
    "familyId": "LM07",
    "scene": "Lastauksen laskujärjestys",
    "action": "Tulkkaa usean laskutoimituksen lauseke ja ratkaise sen rakenne; tehtävä käyttää vain erikseen opetettuja operaatiotaitoja.",
    "success": "Laiva saa juuri suunnitellun kokonaislastin.",
    "effectId": "world.M-EXPR-01.resolved"
  },
  {
    "id": "M-MUL-02",
    "familyId": "LM06",
    "scene": "Laivueen lyhyt merkintä",
    "action": "Muodosta kertolaskulauseke näkyvästä ryhmämallista ja osoita kummankin tekijän merkitys käytetyssä sopimuksessa.",
    "success": "Laivueen suunnitelma mahtuu pieneen työohjeeseen.",
    "effectId": "world.M-MUL-02.resolved"
  },
  {
    "id": "M-TH-01",
    "familyId": "LM01",
    "scene": "Kaksi kiveä, yksi salaisuus",
    "action": "Merkitse yksi yhteinen ja yksi eroava havaittava ominaisuus; hyväksyntä perustuu kohteiden ominaisuuksiin, ei koristeväriin.",
    "success": "Lehtivene asettuu valittujen tukien varaan ja Aava huomaa aiemmin piiloon jääneen kuvion.",
    "effectId": "world.M-TH-01.resolved"
  },
  {
    "id": "M-TH-02",
    "familyId": "LM01",
    "scene": "Lehtien odotushuone",
    "action": "Lajittele lehdet annetun muodon tai reunakuvion mukaan; perustele myös yksi rajatapaus näkyvällä ominaisuudella.",
    "success": "Oikeisiin ryhmiin päätyneet lehdet muodostavat kuivan suojan pienelle rantapenkille.",
    "effectId": "world.M-TH-02.resolved"
  },
  {
    "id": "M-TH-03",
    "familyId": "LM01",
    "scene": "Pitkospuiden askelrivi",
    "action": "Aseta näkyvät kepit pituusjärjestykseen samasta alkukohdasta; kahden vierekkäisen vaihtoa saa kokeilla ilman rangaistusta.",
    "success": "Keppirivistä avautuu tasaisesti nouseva kulkureitti veneen luo.",
    "effectId": "world.M-TH-03.resolved"
  },
  {
    "id": "M-TH-04",
    "familyId": "LM01",
    "scene": "Ruovikon rytmi",
    "action": "Valitse puuttuva kuvio ja jatka sääntöä kahdella kohdalla; vaihtuva tehtävä erottaa toiston kasvavasta säännöstä.",
    "success": "Askelmerkit jatkuvat lahden turvalliselle levähdyspaikalle ja Loikka kokeilee reittiä.",
    "effectId": "world.M-TH-04.resolved"
  },
  {
    "id": "M-TH-05",
    "familyId": "LM01",
    "scene": "Kourun pieni koe",
    "action": "Ennusta, muuta yhden kourun suuntaa ja vertaa veneen reittiä; nimeä muuttunut tekijä ja havaittu seuraus.",
    "success": "Vene pääsee omaan pieneen poukamaansa ja reitti jää näkyviin vesijälkenä.",
    "effectId": "world.M-TH-05.resolved"
  },
  {
    "id": "M-TH-06",
    "familyId": "LM01",
    "scene": "Loikan ja Aavan sama laituri",
    "action": "Vaihda kahden nimetyn katselupisteen välillä ja yhdistä sama kohde molemmista näkymistä; kuvaa muuttuva ja säilyvä suhde.",
    "success": "Ystävät tunnistavat yhteisen kiinnityskohdan ja vetävät veneen yhdessä rantaan.",
    "effectId": "world.M-TH-06.resolved"
  },
  {
    "id": "M-TH-07",
    "familyId": "LM01",
    "scene": "Kaikki viirit mukaan",
    "action": "Rakenna kaikki mahdolliset muoto–kuvio-parit järjestelmälliseen ruudukkoon; näyttö edellyttää puuttumattomuutta ja toistojen välttämistä.",
    "success": "Viirit muodostavat kokonaisen pienen näyttelyn, josta ystävät valitsevat omansa.",
    "effectId": "world.M-TH-07.resolved"
  },
  {
    "id": "M-TH-08",
    "familyId": "LM01",
    "scene": "Kaksi tapaa löytää sama",
    "action": "Valitse kaksi todella aiemmin opetettua sisältötaitoa tehtäväkohtaisesta rekisteristä ja osoita niiden yhteys; perustele yhdellä näkyvällä esimerkillä.",
    "success": "Vihkon sivujen väliin piirtyy yhteinen reittimerkki ja pulman ratkaisu näkyy rannalla.",
    "effectId": "world.M-TH-08.resolved"
  },
  {
    "id": "M-TIME-02",
    "familyId": "LM19",
    "scene": "Aavan sovittu tapaamishetki",
    "action": "Lue kellonajan perusidea ja tehtävässä opetettu kellotaulun tarkkuus; tunnista viisareiden tai numeroiden tehtävät.",
    "success": "Kohtaamisen merkki asettuu oikeaan hetkeen retkitaululla.",
    "effectId": "world.M-TIME-02.resolved"
  },
  {
    "id": "M-UNIT-03",
    "familyId": "LM19",
    "scene": "Retkikorin kaksi massalappua",
    "action": "Muunna opetettuja massayksiköitä ja perustele lukuarvon muutos yksikön koon kautta.",
    "success": "Retkikorin toimitusmerkintä ymmärretään oikein vastaanottavalla rannalla.",
    "effectId": "world.M-UNIT-03.resolved"
  },
  {
    "id": "M-UNIT-05",
    "familyId": "LM19",
    "scene": "Aikaviesti oikeassa yksikössä",
    "action": "Muunna aikayksiköitä ja valitse muuntosuunnan vaatima opetettu kerto- tai jakotaito; kymmenjärjestelmää ei oleteta.",
    "success": "Yhteinen tapaamissuunnitelma käyttää samaa todellista kestoa.",
    "effectId": "world.M-UNIT-05.resolved"
  },
  {
    "id": "M-UNIT-06",
    "familyId": "LM19",
    "scene": "Litra kuution sisällä",
    "action": "Osoita litran ja kuutiodesimetrin vastaavuus sekä säilytä yhteys kolmiulotteiseen tilaan.",
    "success": "Kellotornin mittapöytä yhdistää kaksi erilaista mutta samaa määrää kuvaavaa viestiä.",
    "effectId": "world.M-UNIT-06.resolved"
  },
  {
    "id": "M-WORK-01",
    "familyId": "LM01",
    "scene": "Mikä tässä auttaa?",
    "action": "Valitse tehtävän kannalta olennainen havainto ja sulje pois houkutteleva sivuseikka; vastauksen perustana on annettu tavoite.",
    "success": "Oikea havainto nostetaan työpöydän keskelle ja sopiva köysi yltää veneeseen.",
    "effectId": "world.M-WORK-01.resolved"
  },
  {
    "id": "M-WORK-02",
    "familyId": "LM01",
    "scene": "Aavan ensimmäinen kysymys",
    "action": "Muodosta tilanteesta matemaattisesti mielekäs kysymys valittavista osista; osoita mitä pitäisi laskea, verrata tai mitata.",
    "success": "Aava ripustaa kysymyksen tutkimuspaikan kyltiksi ja valmistaa sille tarvittavat välineet.",
    "effectId": "world.M-WORK-02.resolved"
  },
  {
    "id": "M-WORK-03",
    "familyId": "LM01",
    "scene": "Jälki märässä hiekassa",
    "action": "Valitse havainnon tukema päätelmä ja liitä siihen todiste; liian vahva johtopäätös jätetään avoimeksi.",
    "success": "Polun viereen asetetaan luotettava opaste ja epävarma kohta jää kysymysmerkiksi.",
    "effectId": "world.M-WORK-03.resolved"
  },
  {
    "id": "M-WRADD",
    "familyId": "LM07",
    "scene": "Vajan yhteinen tilaus",
    "action": "Suorita kirjallinen yhteenlasku ja osoita siirtyvän lukuyksikön arvo; tarkistus koskee sekä vaiheita että summaa.",
    "success": "Suuri yhteistilaus saa oikean määrän laatikoita.",
    "effectId": "world.M-WRADD.resolved"
  },
  {
    "id": "M-WRDIV",
    "familyId": "LM07",
    "scene": "Suuri lasti jaetaan lukuyksiköittäin",
    "action": "Jaa lukuyksiköittäin, pidä osamäärän paikat näkyvinä ja perustele uudelleenryhmittely; tehtävän lukuala on ilmoitettu.",
    "success": "Jokainen toimitus saa saman määrän ja jako voidaan tarkistaa kertomalla.",
    "effectId": "world.M-WRDIV.resolved"
  },
  {
    "id": "M-WRMUL",
    "familyId": "LM07",
    "scene": "Monta samanlaista suurtilausta",
    "action": "Suorita kirjallinen kertolasku ja yhdistä osatulokset tekijän lukuyksiköihin; osoita lopullisen summan muodostuminen.",
    "success": "Tukikohtien samanlaiset tilaukset valmistuvat oikean suuruisiksi.",
    "effectId": "world.M-WRMUL.resolved"
  },
  {
    "id": "M-WRSUB",
    "familyId": "LM07",
    "scene": "Avaa yksi suuri laatikko",
    "action": "Ratkaise kirjallinen vähennyslasku säilyttäen määrä jokaisessa vaihdossa; mukaan myös nollan yli tehtävä vaihto.",
    "success": "Toimitus ja jäljelle jäävä varasto täsmäävät alkuperäiseen lastiin.",
    "effectId": "world.M-WRSUB.resolved"
  },
  {
    "id": "M79-ARC",
    "familyId": "UM-15",
    "scene": "Vain osa valonauhasta",
    "action": "Laske kaaren pituus osuutena koko kehästä; osoita keskuskulma ja säilytä pituusyksikkö.",
    "success": "Sovittu reunakaari syttyy ja ohjaa vieraat oikealle havaintopaikalle.",
    "effectId": "world.M79-ARC.resolved"
  },
  {
    "id": "M79-COMB-01",
    "familyId": "UM-01",
    "scene": "Kaikki reitit juhlapöytään",
    "action": "Muodosta puu tai taulukko kaikista sallituista yhdistelmistä; tunnista toisto ja perustele, miksi listaus on kattava.",
    "success": "Jokainen saapumisreitti saa oman kutsuviirin ja retkijuhlan portti avautuu.",
    "effectId": "world.M79-COMB-01.resolved"
  },
  {
    "id": "M79-CONG-CRIT",
    "familyId": "UM-13",
    "scene": "Varaosan riittävät tiedot",
    "action": "Tunnista ja perustele riittävä yhtenevyyskriteeri; vertaa riittämättömään tietojoukkoon, joka sallii erikokoisia tai eri muotoisia kolmioita.",
    "success": "Lähetetyt mitat tuovat täsmälleen sopivan varaosan retkimajaan.",
    "effectId": "world.M79-CONG-CRIT.resolved"
  },
  {
    "id": "M79-CONSTRUCT",
    "familyId": "UM-13",
    "scene": "Kompassin rauhallinen kaari",
    "action": "Toteuta annettujen ehtojen mukainen geometrinen konstruktio, esimerkiksi janan keskinormaali; näytä työvaiheet ja tarkista ominaisuus, älä pelkkää silmämääräistä paikkaa.",
    "success": "Rakennettu kohta yhdistää polun tasapuolisesti kahteen lähtöpaikkaan.",
    "effectId": "world.M79-CONSTRUCT.resolved"
  },
  {
    "id": "M79-CURVE",
    "familyId": "UM-13",
    "scene": "Polkujen kolme luonnetta",
    "action": "Erota suora viiva, murtoviiva ja kaareva viiva; täsmennä viiva yläkäsitteeksi, jotta arkinen sanapari ei opeta virheellistä luokitusta.",
    "success": "Polkujen selitteet muuttuvat ymmärrettäviksi ja uusi retkikartta avautuu.",
    "effectId": "world.M79-CURVE.resolved"
  },
  {
    "id": "M79-DEC-DIV",
    "familyId": "UM-04",
    "scene": "Pienten merkkipalojen määrä",
    "action": "Muunna jaettava ja jakaja samalla kertoimella kokonaislukumittaan, ratkaise osamäärä ja tarkista palamallilla.",
    "success": "Merkkipalat riittävät jokaiselle näkyvälle reittitolpalle.",
    "effectId": "world.M79-DEC-DIV.resolved"
  },
  {
    "id": "M79-DEC-MUL",
    "familyId": "UM-04",
    "scene": "Pienennetyn purjeen pinta",
    "action": "Kerro desimaaliluvut ruudukkomallin avulla ja perustele tuloksen suuruus; mukaan sekä alle että yli yhden olevat kertoimet.",
    "success": "Purjeen korjausmateriaali leikataan oikean kokoiseksi ja vene on valmis kokeeseen.",
    "effectId": "world.M79-DEC-MUL.resolved"
  },
  {
    "id": "M79-DEC-ADD-SUB",
    "familyId": "UM-04",
    "scene": "Retkilaatikon tarkka luettelo",
    "action": "Muodosta uusi kahden operaation desimaalilasku, suorita se ja arvioi lopputuloksen suuruus; kirjataan integraation oma ratkaisu.",
    "success": "Varustelaatikon ilmoitettu sisältö täsmää, ja ystävät sulkevat kannen yhteiselle retkelle.",
    "effectId": "world.M79-DEC-ADD-SUB.resolved"
  },
  {
    "id": "M79-DIAGRAM-INTERP",
    "familyId": "UM-18",
    "scene": "Liian hurja otsikko",
    "action": "Tulkitse eri diagrammeja, tunnista katkaistu asteikko tai epäselvä perusjoukko ja muotoile aineiston tukema rajattu johtopäätös.",
    "success": "Juliste saa reilun selitteen ja sataman neuvosto tekee päätöksen oikean tiedon varassa.",
    "effectId": "world.M79-DIAGRAM-INTERP.resolved"
  },
  {
    "id": "M79-DIAGRAM-PROD",
    "familyId": "UM-18",
    "scene": "Reilu kuva saaristolle",
    "action": "Tuota aineistoon sopiva diagrammi valitsemalla tyyppi, akselit, asteikko ja arvot; perustele valinta ja arvioi valmis esitys kriteeristöllä.",
    "success": "Rannat saavat luettavan yhteisen havaintotaulun, jossa kukaan ei jää harhaanjohtavan kuvan varaan.",
    "effectId": "world.M79-DIAGRAM-PROD.resolved"
  },
  {
    "id": "M79-DIRECTPROP",
    "familyId": "UM-10",
    "scene": "Samaa tahtia kasvavat korit",
    "action": "Tunnista suora verrannollisuus taulukosta ja mallista: suhde y/x on vakio, kun x≠0. Tarkista erikseen nollan syötteen nollatulos, kun nolla kuuluu syötejoukkoon; torju nollasta poikkeava kiinteä alkulisä.",
    "success": "Näytekorit järjestyvät oikeaksi määräksi ja kuljetus voidaan suunnitella.",
    "effectId": "world.M79-DIRECTPROP.resolved"
  },
  {
    "id": "M79-EQ1-CHECK",
    "familyId": "UM-09",
    "scene": "Avain pitää kokeilla",
    "action": "Sijoita ehdokas alkuperäisen yhtälön molemmille puolille ja päätä, ovatko arvot samat; tarkista myös väärä ehdokas.",
    "success": "Koeteltu sulkuasetus saa luottamusmerkin ja vesi löytää sovitun uoman.",
    "effectId": "world.M79-EQ1-CHECK.resolved"
  },
  {
    "id": "M79-GRAPH-MONO",
    "familyId": "UM-11",
    "scene": "Milloin vedenpinta nousee",
    "action": "Merkitse funktion kasvamis-, vähenemis- ja vakiojaksot x-suunnassa sekä erota ne arvon positiivisuudesta.",
    "success": "Seurantakyltti kertoo oikeat jaksot ja ystävät ajoittavat havainnot.",
    "effectId": "world.M79-GRAPH-MONO.resolved"
  },
  {
    "id": "M79-ABS-01",
    "familyId": "UM-03",
    "scene": "Kuinka kaukana kodista",
    "action": "Yhdistä luku itseisarvoonsa ja valitse kaikki paikat, joilla on annettu etäisyys nollasta; käsittele myös nollan yksi paikka.",
    "success": "Ystävät huomaavat olevansa yhtä lähellä kotia ja kohtaavat laiturilla.",
    "effectId": "world.M79-ABS-01.resolved"
  },
  {
    "id": "M79-INT-DIV",
    "familyId": "UM-03",
    "scene": "Virran yksi askel",
    "action": "Ratkaise suunnatun muutoksen jakolasku ja etumerkki, sitten tarkista jakaja kertaa osamäärä; mukana negatiivinen jakaja.",
    "success": "Mittarin askelkoko kalibroituu ja sumun alainen poiju löytyy.",
    "effectId": "world.M79-INT-DIV.resolved"
  },
  {
    "id": "M79-INT-MUL",
    "familyId": "UM-03",
    "scene": "Tasaiset syvyysaskeleet",
    "action": "Jatka johdonmukaista tulotaulukkoa, ennusta etumerkki ja laske tulo; negatiivinen kerroin selitetään rakenteen kautta.",
    "success": "Laite tulkitsee suunnan oikein ja lähettää luettavan mittausviestin.",
    "effectId": "world.M79-INT-MUL.resolved"
  },
  {
    "id": "M79-INVERSEPROP",
    "familyId": "UM-10",
    "scene": "Sama työ eri määrällä",
    "action": "Tunnista kääntäen verrannollisuus vakiotulosta, vertaa määrän ja ajan pareja ja nimeä mallin vakioehdot.",
    "success": "Koemallin säiliö tyhjenee suunnitellussa ajassa ja tutkimusretki pääsee liikkeelle.",
    "effectId": "world.M79-INVERSEPROP.resolved"
  },
  {
    "id": "M79-INTERCEPT",
    "familyId": "UM-12",
    "scene": "Mistä matka alkaa",
    "action": "Tunnista vakiotermi funktion arvona kohdassa x=0 ja yhdistä se y-akselin leikkaukseen sekä tilanteen alkuarvoon.",
    "success": "Lähtötaso merkitään karttaan ja veneen koeloki saa oikean alun.",
    "effectId": "world.M79-INTERCEPT.resolved"
  },
  {
    "id": "M79-LOGIC-02",
    "familyId": "UM-01",
    "scene": "Majakan täsmällinen viesti",
    "action": "Rakenna täsmällinen sanallinen tai symbolinen sääntö ja sovella sitä uuteen syötteeseen; palaute osoittaa puuttuvan ehdon.",
    "success": "Majakan vastaus kertoo, että viesti ymmärrettiin myös toisella rannalla.",
    "effectId": "world.M79-LOGIC-02.resolved"
  },
  {
    "id": "M79-MEAN",
    "familyId": "UM-18",
    "scene": "Sataman yhteinen keskimitta",
    "action": "Laske ja tulkitse keskiarvo, tarkista havaintojen määrä ja tutki yhden poikkeavan arvon vaikutus; rajaa johtopäätös aineistoon.",
    "success": "Sataman havaintoraportti kertoo keskimäärän ilman lupausta jokaisesta päivästä.",
    "effectId": "world.M79-MEAN.resolved"
  },
  {
    "id": "M79-MEDIAN",
    "familyId": "UM-18",
    "scene": "Havaintojonon keskellä",
    "action": "Järjestä aineisto ja määritä mediaani sekä parittomalla että parillisella havaintomäärällä; tulkitse keskikohta.",
    "success": "Sataman raportti saa toisen perustellun näkökulman tavalliseen mittaan.",
    "effectId": "world.M79-MEDIAN.resolved"
  },
  {
    "id": "M79-MODE",
    "familyId": "UM-18",
    "scene": "Yleisin retkivalinta",
    "action": "Määritä tyyppiarvo frekvensseistä ja tulkitse se; hyväksy useampi tyyppiarvo tai sovitun määritelmän mukainen puuttuva yksikäsitteinen tyyppiarvo.",
    "success": "Retkikorttien yhteenveto näyttää yleisyyden rehellisesti ja Aava valmistelee sopivia opasteita.",
    "effectId": "world.M79-MODE.resolved"
  },
  {
    "id": "M79-OPPOSITE-01",
    "familyId": "UM-03",
    "scene": "Kahden rannan tervehdys",
    "action": "Valitse annetun luvun vastaluku ja perustele yhtä suuri etäisyys nollasta sekä vastakkainen suunta.",
    "success": "Vastakkaisten merkkien viesti kohtaa nollalaiturissa tasapainossa.",
    "effectId": "world.M79-OPPOSITE-01.resolved"
  },
  {
    "id": "M79-PCT-CHANGED",
    "familyId": "UM-07",
    "scene": "Sadekausivaran suunnitelma",
    "action": "Laske muuttunut arvo ja nimeä, mihin lähtöarvoon muutos perustuu; vertaa lisäystä ja vähennystä.",
    "success": "Varaston suunnitelma mahtuu sovittuun tilaan ja majava rakentaa malliin pienen sivuportin.",
    "effectId": "world.M79-PCT-CHANGED.resolved"
  },
  {
    "id": "M79-PCT-BASE",
    "familyId": "UM-07",
    "scene": "Kokonainen piilossa",
    "action": "Ratkaise perusarvo tunnetusta prosenttiarvosta ja prosenttiluvusta; tarkista palauttamalla annettu osuus.",
    "success": "Kastunut lappu korvataan ja neuvoston kaikki osapuolet näkevät saman kokonaisuuden.",
    "effectId": "world.M79-PCT-BASE.resolved"
  },
  {
    "id": "M79-PCT-COMP",
    "familyId": "UM-07",
    "scene": "Kahden haaran reilu vertailu",
    "action": "Laske, kuinka monta prosenttia toinen määrä on suurempi tai pienempi kuin nimetty vertailuarvo; osoita perusarvo kummassakin suunnassa.",
    "success": "Paikalliseen koemalliehdotukseen kirjataan täsmällinen vertailu ilman kumpaakaan vähättelevää ilmaisua.",
    "effectId": "world.M79-PCT-COMP.resolved"
  },
  {
    "id": "M79-PCT-PP",
    "familyId": "UM-07",
    "scene": "Sopimuksen kaksi mittaa",
    "action": "Laske prosenttiosuuksien ero prosenttiyksikköinä ja suhteellinen muutos prosentteina; liitä kumpikin oikeaan lauseeseen.",
    "success": "Majava allekirjoittaa ymmärretyn osasopimuksen ja sivuhaaran koepato jättää putoukselle virtaa.",
    "effectId": "world.M79-PCT-PP.resolved"
  },
  {
    "id": "M79-PCT-SHARE",
    "familyId": "UM-07",
    "scene": "Sivuhaaran osuus",
    "action": "Muodosta osan ja kokonaisuuden suhde ja ilmaise se prosentteina; nimeä perusarvo.",
    "success": "Sivuhaaran kyltti kertoo sovitun osuuden ja majava saa ymmärrettävän lupauksen.",
    "effectId": "world.M79-PCT-SHARE.resolved"
  },
  {
    "id": "M79-POLY-ANGLES",
    "familyId": "UM-13",
    "scene": "Monikulmaisen majan katto",
    "action": "Jaa yksinkertainen kupera monikulmio kolmioihin, päättele sisäkulmien summa ja tutki säännöllisen tapauksen kulmaa erikseen.",
    "success": "Majan kattopiirros sulkeutuu ja retkikorille löytyy suojapaikka.",
    "effectId": "world.M79-POLY-ANGLES.resolved"
  },
  {
    "id": "M79-POLY-PERIM",
    "familyId": "UM-16",
    "scene": "Retkipaikan reunaköysi",
    "action": "Laske monikulmion piiri, mukaan lukien perustellusti pääteltävä sivu; erottele sisäinen apuviiva ulkoreunasta.",
    "success": "Rajaköysi kohtaa alkupäänsä ja turvallinen malliretkitila valmistuu.",
    "effectId": "world.M79-POLY-PERIM.resolved"
  },
  {
    "id": "M79-PARABOLA-GRAPH",
    "familyId": "UM-11",
    "scene": "Kaari valoa varten",
    "action": "Laske tai lue arvotaulukon pisteet, sijoita ne ja hahmota sileä paraabeli; huippu ja symmetriset pisteet auttavat tarkistusta.",
    "success": "Malli-ikkuna avautuu ja sisäpihan kasveille tulee leveä valokaari.",
    "effectId": "world.M79-PARABOLA-GRAPH.resolved"
  },
  {
    "id": "M79-POWER-POWER",
    "familyId": "UM-05",
    "scene": "Tornin sisäiset kerrokset",
    "action": "Muunna potenssin potenssi toistetuiksi potensseiksi ja sievennä eksponenttien tuloksi; vertaa eksponenttien summaan.",
    "success": "Kerrostettu koetorni asettuu suunnitelmaan ilman yllättävää ylikasvua.",
    "effectId": "world.M79-POWER-POWER.resolved"
  },
  {
    "id": "M79-POWER-PROD",
    "familyId": "UM-05",
    "scene": "Kahden valopuun liitos",
    "action": "Sievennä saman kantaluvun potenssien tulo tekijäjonon avulla; perustele eksponenttien summa ja torju eri kantojen väärä yhdistäminen.",
    "success": "Yhdistetty valokuvio syttyy ehjänä pajan holviin.",
    "effectId": "world.M79-POWER-PROD.resolved"
  },
  {
    "id": "M79-POWER-QUOT",
    "familyId": "UM-05",
    "scene": "Turhien kerrosten purku",
    "action": "Sievennä saman nollasta poikkeavan kantaluvun potenssien osamäärä ja selitä supistuminen; rajaa negatiivinen eksponentti opetettuun kontekstiin.",
    "success": "Sopiva pienennys jättää yöpolulle juuri tarvittavan valon.",
    "effectId": "world.M79-POWER-QUOT.resolved"
  },
  {
    "id": "M79-POWER-SIMPLIFY",
    "familyId": "UM-05",
    "scene": "Tähtikartan tiivis kieli",
    "action": "Sievennä yhdistelmälauseke käyttäen vain tehtäväinstanssin opetettuja potenssisääntöjä; merkitse välivaiheen perustelu ja määrittelyehdot.",
    "success": "Tiivis mutta täsmällinen tähtimerkintä mahtuu viestiin ja pääsee observatoriolle.",
    "effectId": "world.M79-POWER-SIMPLIFY.resolved"
  },
  {
    "id": "M79-POWER-ZERO",
    "familyId": "UM-05",
    "scene": "Yhden valon kerros",
    "action": "Täydennä nollasta poikkeavan kantaluvun potenssitaulukko nollaeksponenttiin ja perustele tulos jakosuhteella; 0⁰ jätetään tämän säännön ulkopuolelle.",
    "success": "Yksi yhteinen lamppu jää palamaan tornin perustaan.",
    "effectId": "world.M79-POWER-ZERO.resolved"
  },
  {
    "id": "M79-PRIMEFACT-01",
    "familyId": "UM-05",
    "scene": "Vuoren kiven sukupuu",
    "action": "Rakenna tekijäpuu, jatka yhdistettyjä tekijöitä ja tarkista alkutekijöiden tulo; eri puut hyväksytään.",
    "success": "Kivimerkin osat sopivat toisiinsa ja vuoren karttahuone avaa uuden ikkunan.",
    "effectId": "world.M79-PRIMEFACT-01.resolved"
  },
  {
    "id": "M79-PROB-CLASSIC",
    "familyId": "UM-18",
    "scene": "Reilu valinta havaintovuoroon",
    "action": "Laske tapahtuman todennäköisyys suotuisten ja kaikkien yhtä mahdollisten alkeistulosten suhteena; nimeä tasatodennäköisyyden ehto.",
    "success": "Havaintovuoro jaetaan ymmärrettävällä reilulla säännöllä, ilman ostettavia palkintoja.",
    "effectId": "world.M79-PROB-CLASSIC.resolved"
  },
  {
    "id": "M79-PROG-02",
    "familyId": "UM-02",
    "scene": "Yön yli palava reittivalo",
    "action": "Muokkaa pieni ohjelma ymmärrettäväksi, tuota tarkoituksenmukaiset testit ja perustele käytännöt samassa uudessa tehtävässä; kirjataan integraation oma näyttö.",
    "success": "Reittivalo johtaa myöhäisen veneen turvalaituriin ja ystävät voivat istahtaa teelle.",
    "effectId": "world.M79-PROG-02.resolved"
  },
  {
    "id": "M79-PROOF-01",
    "familyId": "UM-01",
    "scene": "Sillan syyketju",
    "action": "Järjestä annetuista oletuksista johtopäätökseen etenevä ketju ja selitä omin sanoin yksi välivaihe; hylkää kehämäinen perustelu. Erottele ketjun tunnistaminen oman todistuksen tuottamisesta.",
    "success": "Tarkistettu pienoissilta kannattelee retkikorin ja ystävät ylittävät sen rauhallisesti.",
    "effectId": "world.M79-PROOF-01.resolved"
  },
  {
    "id": "M79-PROP-SOLVE",
    "familyId": "UM-10",
    "scene": "Puuttuva karttamitta",
    "action": "Ratkaise verrannon tuntematon perustellulla skaalaamisella tai algebralla ja tarkista suhteiden yhtäsuuruus.",
    "success": "Puuttuva mitta täydentyy ja mallisilta kohtaa molemmat rannat.",
    "effectId": "world.M79-PROP-SOLVE.resolved"
  },
  {
    "id": "M79-PYTH-CONVERSE",
    "familyId": "UM-14",
    "scene": "Onko kulma todella suora",
    "action": "Valitse pisin sivu, vertaa sen neliötä kahden muun neliöiden summaan ja päättele suorakulmaisuus käänteislauseesta.",
    "success": "Oikeaksi todettu tukikolmio saa paikan sillan mallissa ja ylitysreitti varmistuu.",
    "effectId": "world.M79-PYTH-CONVERSE.resolved"
  },
  {
    "id": "M79-RAY",
    "familyId": "UM-13",
    "scene": "Näköalapaikan suuntamerkki",
    "action": "Tunnista puolisuora sen alkupisteestä ja yhdestä rajattomasta suunnasta; rakenna se kahden näkyvän pisteen avulla.",
    "success": "Kartan suuntamerkki auttaa ystäviä löytämään näköalatasanteen.",
    "effectId": "world.M79-RAY.resolved"
  },
  {
    "id": "M79-REAL-02",
    "familyId": "UM-06",
    "scene": "Paikka lukujen rannikolla",
    "action": "Sijoita reaaliluvut lukusuoralle käyttäen annettuja tarkkoja vertailurajoja tai perusteltua arviota; ilmoita, mikä sijoitus on likimääräinen.",
    "success": "Karttamerkit ohjaavat retkikunnan oikeaan näköalapoukamaan.",
    "effectId": "world.M79-REAL-02.resolved"
  },
  {
    "id": "M79-FRAC-DIV",
    "familyId": "UM-04",
    "scene": "Nauhasta monta viiriä",
    "action": "Aseta jakajan mittaiset palat jaettavan päälle, tulkitse jäljelle jäävä osuus ja muodosta jakolaskun arvo.",
    "success": "Retkiviirit riittävät juuri sovittuun reittimerkintään.",
    "effectId": "world.M79-FRAC-DIV.resolved"
  },
  {
    "id": "M79-POWER-NEG",
    "familyId": "UM-05",
    "scene": "Lyhdyn käänteinen asteikko",
    "action": "Yhdistä negatiivinen kokonaislukueksponentti vastaavaan käänteispotenssiin ja täydennä arvo, kun kanta a≠0. Erota yleinen sääntö lyhtymallista, jossa a>1; välillä 0<a<1 negatiivinen eksponentti voi antaa yhtä suuremman arvon.",
    "success": "Koelyhdyn asteikko vastaa annettua käänteisskaalausta. Ystävät saavat yöaseman polulle sovitun valaistuksen ja jättävät eläimille rauhalliset varjopaikat.",
    "effectId": "world.M79-POWER-NEG.resolved"
  },
  {
    "id": "M79-PROB-EMP",
    "familyId": "UM-18",
    "scene": "Mitä monta koetta kertoo",
    "action": "Vertaa suhteellisia frekvenssejä erikokoisissa simuloiduissa otoksissa ja tulkitse ne kokeelliseksi todennäköisyysarvioksi; näytä vaihtelu ja riippumattoman kokeen raja.",
    "success": "Tutkimuskortti tunnistaa sekä havaitun taipumuksen että epävarmuuden, ja ystävät päättävät havaintoillan.",
    "effectId": "world.M79-PROB-EMP.resolved"
  },
  {
    "id": "M79-ROUND-01",
    "familyId": "UM-06",
    "scene": "Viesti, jossa tarkkuus riittää",
    "action": "Pyöristä ilmoitettuun tarkkuuteen, perustele suuruus ja säilytä alkuperäinen luku näkyvissä; erota tarvittaessa tavallinen pyöristys kokonaiskappaleiden tarpeesta.",
    "success": "Selkeä mittaviesti saapuu perille ja oikeankokoinen osa asettuu paikalleen.",
    "effectId": "world.M79-ROUND-01.resolved"
  },
  {
    "id": "M79-SECTOR",
    "familyId": "UM-15",
    "scene": "Tähtipihan oma nurkka",
    "action": "Määritä sektorin pinta-ala keskuskulman osuutena koko ympyrän alasta ja erottele se kaaren pituudesta.",
    "success": "Lukupaikan peite asettuu paikalleen ja ystävät katsovat saman taivaan alle.",
    "effectId": "world.M79-SECTOR.resolved"
  },
  {
    "id": "M79-SEQ-01",
    "familyId": "UM-11",
    "scene": "Valoa koko seinälle",
    "action": "Tunnista rakennemalli, muodosta sääntö ja ennusta sillä etäinen annettu vaihe; integraation näyttö erotetaan osataitojen historiasta.",
    "success": "Ikkunarivi valmistuu ja valo kulkee koko uuteen siipeen.",
    "effectId": "world.M79-SEQ-01.resolved"
  },
  {
    "id": "M79-SIM-CRIT",
    "familyId": "UM-13",
    "scene": "Varjon kelvollinen malli",
    "action": "Valitse riittävä yhdenmuotoisuuskriteeri ja nimeä vastaavat sivut tai kulmat; torju sopivalta näyttävä mutta riittämätön tieto.",
    "success": "Luotettava pienoismalli antaa retkikunnalle käyttökelpoisen suunnitelman.",
    "effectId": "world.M79-SIM-CRIT.resolved"
  },
  {
    "id": "M79-SIMILAR-SCALE",
    "familyId": "UM-13",
    "scene": "Näköalapaviljongin suurennos",
    "action": "Määritä mittakaavakerroin ja laske vastaava pituus; erota pituuskerroin pinta-alan tai tilavuuden muutoksesta.",
    "success": "Suurennettu piirros sopii näköalapaikalle ja ystäville jää tilaa istua vierekkäin.",
    "effectId": "world.M79-SIMILAR-SCALE.resolved"
  },
  {
    "id": "M79-SLOPE",
    "familyId": "UM-12",
    "scene": "Nousu joka askeleella",
    "action": "Määritä kulmakerroin kahden pisteen muutossuhteena, huomioi etumerkki ja vertaile eri mittakaavojen esityksiä.",
    "success": "Majakan suunnittelukortti kertoo reittiviivan nousun luotettavasti.",
    "effectId": "world.M79-SLOPE.resolved"
  },
  {
    "id": "M79-CONE-SA",
    "familyId": "UM-17",
    "scene": "Teltan avoin pohja",
    "action": "Laske suoran ympyräkartion vaipan ja tarvittaessa pohjan pinta-ala; kaikki tarvittavat mitat annetaan, ellei niiden ratkaisu ole opetettu.",
    "success": "Malliteltta peittää lukupaikan ja Aava istahtaa sen kuivaan varjoon.",
    "effectId": "world.M79-CONE-SA.resolved"
  },
  {
    "id": "M79-CONE-V",
    "familyId": "UM-17",
    "scene": "Kolmen kaadon yllätys",
    "action": "Laske kartion tilavuus ja yhdistä kolmasosakerroin saman pohjan ja korkeuden vertailuun; virtuaalitäyttö perustuu tarkkaan malliin.",
    "success": "Oikeankokoinen suppilovarasto täydentää pajan vesimallin.",
    "effectId": "world.M79-CONE-V.resolved"
  },
  {
    "id": "M79-CYL-V",
    "familyId": "UM-17",
    "scene": "Vettä koko kerrokseen",
    "action": "Laske lieriön tilavuus pohjan alan ja korkeuden tulona; nimeä kuutioyksikkö ja tarkista tehtävän pohjamuodon edellyttämä taito.",
    "success": "Mallisäiliöön mahtuva vesimäärä riittää sovittuun koepuroon.",
    "effectId": "world.M79-CYL-V.resolved"
  },
  {
    "id": "M79-SPHERE-SA",
    "familyId": "UM-17",
    "scene": "Maailman ohut kuori",
    "action": "Laske pallon pinta-ala kaavalla 4πr², tunnista säde ja neliöyksikkö; vertaa säteen muuttamisen vaikutusta.",
    "success": "Mallimaailma saa eheän pinnan ja Aava lisää siihen kotisaaren merkin.",
    "effectId": "world.M79-SPHERE-SA.resolved"
  },
  {
    "id": "M79-SPHERE-V",
    "familyId": "UM-17",
    "scene": "Pallon sisäinen meri",
    "action": "Laske pallon tilavuus kaavalla 4πr³/3, käytä kuutioyksikköä ja arvioi säteen muutoksen vaikutus.",
    "success": "Säiliön suunniteltu sisämeri valmistuu ja tutkimusmalli kelluu paikallaan.",
    "effectId": "world.M79-SPHERE-V.resolved"
  },
  {
    "id": "M79-SPREAD",
    "familyId": "UM-18",
    "scene": "Sama keskiarvo, eri hajonta",
    "action": "Vertaa aineistojen vaihtelua näkyvistä pistejakaumista ja perustele hajonnan ero; käytä vaihteluväliä vain nimettynä yhtenä kuvauksena.",
    "success": "Retkisuunnitelma huomioi vaihtelun, ja ystävät varaavat joustavan havaintoajan.",
    "effectId": "world.M79-SPREAD.resolved"
  },
  {
    "id": "M79-PYTH-CALC",
    "familyId": "UM-14",
    "scene": "Köysi yli kallion",
    "action": "Tunnista suorakulmainen kolmio kiinteästä sivunäkymästä, muodosta oikea neliöyhtälö ja ratkaise puuttuva sivu; mittaluvut ovat aina näkyvissä.",
    "success": "Oikean pituinen malliköysi yhdistää tasanteet ja retkikorit kulkevat yli.",
    "effectId": "world.M79-PYTH-CALC.resolved"
  },
  {
    "id": "M79-SQRT-03",
    "familyId": "UM-06",
    "scene": "Kaksi yhtä pitkää tukea",
    "action": "Käytä neliöjuurta laskutoimituksessa, säilytä tarkka muoto sovitussa laajuudessa ja arvioi lopuksi tarvittaessa.",
    "success": "Katoksen kaksi tukea kohtaavat ja lukupaikka saa sateensuojan.",
    "effectId": "world.M79-SQRT-03.resolved"
  },
  {
    "id": "M79-SYSTEM-ALG",
    "familyId": "UM-10",
    "scene": "Sopimuksen kaksi tuntematonta",
    "action": "Ratkaise yhtälöpari algebrallisesti opetetun menetelmän mukaan ja tarkista sama pari molemmissa alkuperäisissä yhtälöissä.",
    "success": "Täsmällinen osasopimus saadaan paperille ja koesulku avaa yhteisen vesireitin.",
    "effectId": "world.M79-SYSTEM-ALG.resolved"
  },
  {
    "id": "M79-SYSTEM-GRAPH",
    "familyId": "UM-10",
    "scene": "Suorien leikkauspiste",
    "action": "Lue suorien leikkauspiste annetusta täsmällisestä koordinaatistosta ja tarkista lukuparin sopivuus; käsittele myös yhdensuuntaiset tai samat suorat.",
    "success": "Kartan kohta osoittaa yhteisen koesulun paikan, ja molemmat rannat saavat oman merkkinsä.",
    "effectId": "world.M79-SYSTEM-GRAPH.resolved"
  },
  {
    "id": "M79-TECH-01",
    "familyId": "UM-02",
    "scene": "Sulkan kokeilupöytä",
    "action": "Valitse sopiva ohjelmatyökalu, muuta yhtä parametria ja tallenna vertailu; perustele johtopäätös näkyvillä tuloksilla sekä mallin rajalla.",
    "success": "Ystävät löytävät toimivan pienoissuunnitelman ja avaavat tutkimuspöydän muidenkin kokeiltavaksi.",
    "effectId": "world.M79-TECH-01.resolved"
  },
  {
    "id": "M79-TEXT-01",
    "familyId": "UM-01",
    "scene": "Pullopostin tarkka pyyntö",
    "action": "Poimi annetut tiedot, tavoite ja ehtosanat lyhyestä tekstistä; yhdistä ne oikeaan malliin ilman ylimääräisen laskun vaatimusta.",
    "success": "Pakkauksen sisältö vastaa tilausta ja vastaanottaja saa tarvitsemansa varusteet.",
    "effectId": "world.M79-TEXT-01.resolved"
  },
  {
    "id": "M79-TEXT-02",
    "familyId": "UM-01",
    "scene": "Viesti seuraavalle retkelle",
    "action": "Kirjoita tai sanele oma lyhyt ratkaisuteksti: suure, suhde, yksikkö ja johtopäätös; arvioi merkitys kriteeristöllä, tarvittaessa opettajan havainnolla. Valmiit lauseet ovat tuettu harjoitus, eivät itsenäisen tekstintuottamisen näyttö.",
    "success": "Seuraava vene vastaa toteuttaneensa ohjeen ja ripustaa kiitoslipun.",
    "effectId": "world.M79-TEXT-02.resolved"
  },
  {
    "id": "M79-THALES",
    "familyId": "UM-15",
    "scene": "Puoliympyrän yllätys",
    "action": "Tunnista puoliympyrän kehäkulman tapaus ja perustele 90 astetta keskuskulman avulla; erottele ei-halkaisijaan tukeutuva vertailu.",
    "success": "Observatorion malliin löytyy suora kulma ilman asteikolla arvaamista.",
    "effectId": "world.M79-THALES.resolved"
  },
  {
    "id": "M79-TRI-ANGLE-SUM",
    "familyId": "UM-13",
    "scene": "Kolme kulmaa yhteen",
    "action": "Perustele kolmion kulmien 180 asteen summa mallilla ja ratkaise puuttuva kulma; tarkista annettujen kulmien kelpoisuus.",
    "success": "Kolmion puuttuva kulmalappu löytyy ja majan uusi pääty valmistuu.",
    "effectId": "world.M79-TRI-ANGLE-SUM.resolved"
  },
  {
    "id": "M79-CYL-SA",
    "familyId": "UM-17",
    "scene": "Säiliön koko kuori",
    "action": "Laske lieriön pinta-ala annetun geometrian mukaan, yhdistä vaippa ja tarpeelliset pohjat; ympyräpohjan osaaminen tarkistetaan kyseisessä tehtävässä.",
    "success": "Suojakuori sulkeutuu säiliön ympärille ja varastoon saadaan kuiva säilytyspaikka.",
    "effectId": "world.M79-CYL-SA.resolved"
  },
  {
    "id": "M79-TRIG-01",
    "familyId": "UM-14",
    "scene": "Kolme ikkunaa samaan kolmioon",
    "action": "Valitse ja perustele oikea trigonometrinen suhde kolmessa uudessa sivuparitilanteessa; yhdistetty näyttö ei synny vain osataitojen kirjauksista.",
    "success": "Sillan yhteinen mittauskortti avautuu kolmesta suunnasta ymmärrettäväksi.",
    "effectId": "world.M79-TRIG-01.resolved"
  },
  {
    "id": "M79-TRIG-CALC",
    "familyId": "UM-14",
    "scene": "Kallion viestiyhteys",
    "action": "Ratkaise uudessa tilallisessa suunnitelmassa yksi sivu ja yksi kulma oikeilla suhteilla; anna erillinen integraation näyttö ja tarkista malliehdot.",
    "success": "Kallion paikallinen viestiyhteys toimii ja retkiryhmä vastaa kaukaa valomerkeillä.",
    "effectId": "world.M79-TRIG-CALC.resolved"
  },
  {
    "id": "M79-TRUTH-01",
    "familyId": "UM-01",
    "scene": "Totuuden merkkikivet",
    "action": "Arvioi määrättyjen väitelauseiden totuusarvo ja valitse sen osoittava tapaus tai lasku; erota väite avoimesta kysymyksestä.",
    "success": "Todet kyltit ohjaavat vieraat näköalapaikalle, virheellinen kyltti korjataan ystävällisesti.",
    "effectId": "world.M79-TRUTH-01.resolved"
  },
  {
    "id": "M79-UNIT-AREA",
    "familyId": "UM-16",
    "scene": "Pieni ruutu suuren sisällä",
    "action": "Muunna pinta-alayksikkö kertomalla pituuden muunnoskerroin itsellään; tarkista ruudukolla ja neliöyksiköllä.",
    "success": "Puutarhan materiaalitilaus vastaa samaa alaa kummassakin yksikössä.",
    "effectId": "world.M79-UNIT-AREA.resolved"
  },
  {
    "id": "M79-UNIT-LIN",
    "familyId": "UM-16",
    "scene": "Kartan eri mittakielet",
    "action": "Muunna pituusyksiköitä perustellulla kertoimella, arvioi tuloksen suuruus ja tunnista suurenemisen suunta.",
    "success": "Kartan mittalaput täsmäävät ja telakka valmistaa oikean malliosan.",
    "effectId": "world.M79-UNIT-LIN.resolved"
  },
  {
    "id": "M79-UNIT-VOL",
    "familyId": "UM-17",
    "scene": "Tuhat pientä kuutiota",
    "action": "Johda tilavuusyksikön muunnos pituuskertoimen kuutiosta ja muunna määrä; näytä kerrosten, rivien ja syvyyden vaikutus.",
    "success": "Säiliön eri yksikkölaput kertovat saman tilavuuden ja vesimalli voidaan yhdistää oikein.",
    "effectId": "world.M79-UNIT-VOL.resolved"
  },
  {
    "id": "M79-EXPR-EVAL",
    "familyId": "UM-08",
    "scene": "Varustelaatikon laskulappu",
    "action": "Sijoita annettu arvo lausekkeeseen näkyvin sulkein ja suorita laskujärjestys; mukaan negatiivinen arvo vain opetetussa laskualueessa.",
    "success": "Laatikkolappu näyttää oikean tarpeen, eikä kenenkään varuste unohdu.",
    "effectId": "world.M79-EXPR-EVAL.resolved"
  },
  {
    "id": "M79-EQ1-FORM",
    "familyId": "UM-09",
    "scene": "Sulun tuntematon mitta",
    "action": "Nimeä tuntematon ja muodosta tilanteen ehdot säilyttävä ensimmäisen asteen yhtälö; ratkaisemista ei vaadita vielä näytöksi.",
    "success": "Sulun mittaongelma muuttuu yhteiseksi selkeäksi kysymykseksi.",
    "effectId": "world.M79-EQ1-FORM.resolved"
  },
  {
    "id": "M79-EXPR-SIMPLIFY",
    "familyId": "UM-08",
    "scene": "Lyhyempi piirustus",
    "action": "Yhdistä samanlaiset termit ja käytä perusteltuja muunnoksia; tarkista ehdokas kahdella muuttujan arvolla ilman, että kokeilu korvaa yleisen säännön.",
    "success": "Tiivis piirustus mahtuu pieneen puukylttiin ja ohje säilyy oikein.",
    "effectId": "world.M79-EXPR-SIMPLIFY.resolved"
  },
  {
    "id": "M79-INEQ-SOLVE",
    "familyId": "UM-09",
    "scene": "Rajan oikea puoli",
    "action": "Ratkaise ensimmäisen asteen epäyhtälö ja esitä ratkaisujoukko; perustele suunnan vaihto negatiivisessa kertomisessa tai jakamisessa.",
    "success": "Laite pysyy sallitulla alueella ja koepuro jatkaa ilman ylivuotoa.",
    "effectId": "world.M79-INEQ-SOLVE.resolved"
  },
  {
    "id": "M79-POLY-ADD",
    "familyId": "UM-08",
    "scene": "Kahden veneen yhteinen tilaus",
    "action": "Laske polynomien summa kokoamalla samanlaiset termit ja laskemalla niiden kertoimet; säilytä muut termit.",
    "success": "Yhteinen tilaus kokoaa materiaalit oikein, ja molemmat veneet saavat osansa.",
    "effectId": "world.M79-POLY-ADD.resolved"
  },
  {
    "id": "M79-POLY-MUL",
    "familyId": "UM-08",
    "scene": "Telakan suuri katos",
    "action": "Kerro polynomi polynomilla näkyvän tuloruudukon avulla, kokoa kaikki osatulot ja sievennä; etumerkkiset laskulaatat ovat mallia, eivät negatiivista pinta-alaa.",
    "success": "Katos kokoaa ystävät samaan kuivaan työtilaan ja telakka saa juhlaillan katon.",
    "effectId": "world.M79-POLY-MUL.resolved"
  },
  {
    "id": "M79-QUAD-INCOMP-02",
    "familyId": "UM-09",
    "scene": "Portin mahdolliset paikat",
    "action": "Ratkaise x²=a reaaliluvuissa: kaksi ratkaisua kun a>0, yksi kun a=0, ei reaaliratkaisua kun a<0; erota neliöjuurifunktion pääarvo.",
    "success": "Sallitut paikat merkitään ja niihin sopiva portti rakentuu. Jos reaaliratkaisua ei ole, virheellinen piirros siirtyy korjattavaksi ja ystävät käyttävät valmiiksi annettua turvallista kiertoreittiä.",
    "effectId": "world.M79-QUAD-INCOMP-02.resolved"
  },
  {
    "id": "M79-POLY-SUB",
    "familyId": "UM-08",
    "scene": "Kaksi sopimusta, yksi erotus",
    "action": "Ratkaise uusi polynomien erotus, jossa yhdistyvät sulkumerkin vaikutus ja termien vähentäminen; näytä yksi perusteltu välivaihe.",
    "success": "Korjattu sopimus jättää molemmille venekunnille juuri sovitut varat.",
    "effectId": "world.M79-POLY-SUB.resolved"
  },
  {
    "id": "M79-ANGLE-REL",
    "familyId": "UM-13",
    "scene": "Risteyksen koko salaisuus",
    "action": "Päättele uuden risteyksen puuttuvat kulmat yhdistämällä molemmat säännöt ja nimeä käytetty peruste; integraatio arvioidaan erikseen.",
    "success": "Risteyksen kaikki viitat näyttävät sovittuihin suuntiin ja ystävät kohtaavat levähdyspaikalla.",
    "effectId": "world.M79-ANGLE-REL.resolved"
  },
  {
    "id": "M79-ZERO",
    "familyId": "UM-12",
    "scene": "Majakan kohtaamishetki",
    "action": "Tunnista nollakohta kuvaajasta, määritä se laskennallisesti ja selitä esitysten yhteys uudessa tilanteessa.",
    "success": "Majakan paikallinen merkkivalo ja vene kohtaavat sovitussa kohdassa, ja ystävät vilkuttavat.",
    "effectId": "world.M79-ZERO.resolved"
  },
  {
    "id": "PHY79-CHARGING",
    "familyId": "SCI12",
    "scene": "Mihin elektronit siirtyivät?",
    "action": "Siirrä elektronimerkkejä kappaleiden välillä ja päättele nettovaraus säilyttäen kokonaisvaraus; positiivinen ydin ei siirry mukana.",
    "success": "Varausmallin ennuste toteutuu: paperiviiri kääntyy annettujen varaustietojen mukaisesti. Loikan näkymättömäksi taikomiseksi luulema temppu saa ymmärrettävän selityksen.",
    "effectId": "world.PHY79-CHARGING.resolved"
  },
  {
    "id": "PHY79-ELEC-SAFE",
    "familyId": "SCI08",
    "scene": "Miksi vaurioitunutta johtoa ei kosketa?",
    "action": "Liitä vaurio ja mahdollinen virtareitti sähköiskun tai kuumenemisen riskiin; valitse todellisessa tilanteessa aikuisen hoitama turvallinen toiminta.",
    "success": "Aava välittää perustellun vaarahavainnon huoltajalle. Aikuinen korjaa kuvitteellisen laituritilanteen, ja ystävät pääsevät luvan saatuaan jatkamaan turvallista tutkimusvierailua.",
    "effectId": "world.PHY79-ELEC-SAFE.resolved"
  },
  {
    "id": "PHY79-KINETIC",
    "familyId": "SCI11",
    "scene": "Kaksi vaunua pehmeällä koeradalla",
    "action": "Muuta yhtä tekijää kerrallaan, vertaa energiamittaria ja ennusta uusi tapaus; nopeuden vaikutusta ei esitetä pelkäksi lineaariseksi säännöksi.",
    "success": "Koeradan energiatieto selittää annetun mallipysäytyksen. Vaunu saapuu pehmeään pysäytysalueeseen ja retkikorin kuvitteellinen kuorma pysyy kokonaisena.",
    "effectId": "world.PHY79-KINETIC.resolved"
  },
  {
    "id": "PHY79-POTENTIAL",
    "familyId": "SCI11",
    "scene": "Ylempänä odottava vesikori",
    "action": "Muuta massaa tai korkeutta vuorotellen ja ennusta painovoimaan liittyvän potentiaalienergian muutos samassa gravitaatiokentässä.",
    "success": "Vesikorin sijaintiin liittyvä energiatieto löytää paikkansa annetussa mallissa. Korkeuseron merkitys avautuu vuoristopajan läpileikkauksessa ja Aava osoittaa, mikä vertailussa muuttui.",
    "effectId": "world.PHY79-POTENTIAL.resolved"
  },
  {
    "id": "PHY79-RAD-SAFE",
    "familyId": "SCI13",
    "scene": "Observatorion rauhallinen päätös",
    "action": "Vertaa riskiä annettujen tietojen ja ohjeiden perusteella, tunnista puuttuva tieto ja valitse asiantunteva apu epäselvässä tilanteessa.",
    "success": "Ystävät valitsevat turvallisen havaintopaikan ja observatorion kupoli avautuu tähtinäytökseen.",
    "effectId": "world.PHY79-RAD-SAFE.resolved"
  },
  {
    "id": "PHY79-ENERGY-IMPACT",
    "familyId": "SCI11",
    "scene": "Majakan energia ja pesimäluoto",
    "action": "Vertaa samaan tarpeeseen soveltuvia ratkaisuja usealla annetulla kriteerillä ja perustele valinta sekä sen kompromissi.",
    "success": "Energianeuvosto hyväksyy paikallisen ratkaisun: majakka palaa ja pesimäluodon rauha näkyy suunnitelmassa.",
    "effectId": "world.PHY79-ENERGY-IMPACT.resolved"
  },
  {
    "id": "PHY79-CONCL-01",
    "familyId": "SCI09",
    "scene": "Majakan tutkimusneuvosto",
    "action": "Arvioi aineiston luotettavuus ja perustele johtopäätös tuetuilla havainnoilla; puuttuva tieto voi johtaa lisätutkimukseen.",
    "success": "Tutkimusneuvosto hyväksyy perustellun paikallisen suunnitelman ja avaa turvallisen näköalatasanteen ystäville.",
    "effectId": "world.PHY79-CONCL-01.resolved"
  },
  {
    "id": "PHY79-SAFE-01",
    "familyId": "SCI08",
    "scene": "Tuulitunnelin suojattu ikkuna",
    "action": "Valitse tehtävän turvallinen valmistelu, suojattu havaintotapa ja pysäytyksen oikea käyttö; toimintaportti ei muutu käsitteelliseksi esitiedoksi.",
    "success": "Tutkimuspaikan kuvitteelliset riskit on tunnistettu ja oikeat turvapäätökset tehty. Sulka avaa valmiin havaintoikkunan, ja ystävät voivat tutkia ilmiötä turvallisesti yhdessä.",
    "effectId": "world.PHY79-SAFE-01.resolved"
  },
  {
    "id": "PHY79-GENERATION",
    "familyId": "SCI12",
    "scene": "Pienen putouksen sähkötervehdys",
    "action": "Yhdistä liike, muuttuva magneettinen tilanne ja sähköinen energiansiirto; selitä, miksi generaattori tarvitsee energiansyötön.",
    "success": "Pienen malliputouksen energia sytyttää vastarannan tervehdysvalon; Aava ja Loikka näkevät yhteyden yli veden.",
    "effectId": "world.PHY79-GENERATION.resolved"
  },
  {
    "id": "PHY79-SI-01",
    "familyId": "SCI09",
    "scene": "Saarien yhteinen mittakieli",
    "action": "Yhdistä käytössä olevat suureet SI-yksiköihin ja oikeisiin tunnuksiin; tunnista, että kaikki tutut arkiyksiköt eivät ole SI-yksiköitä.",
    "success": "Saarien erilaiset mittaviestit saavat yhteisen yksikkökielen. Majakan ja vastarannan tiedot asettuvat rinnakkain, ja ensimmäinen ymmärretty havaintoviesti saa valotervehdyksen.",
    "effectId": "world.PHY79-SI-01.resolved"
  },
  {
    "id": "PHY79-UNIVERSE-SCALE",
    "familyId": "SCI06",
    "scene": "Matka, jota kartta ei mahdu näyttämään",
    "action": "Järjestä kohteet suuruusluokkiin ja vaihda merkittyä mittakaavaa; yhdistä planeettaväli, tähtiväli ja galaksimitta oikeisiin tasoihin.",
    "success": "Karttapöytä avautuu hiljaiseksi tähtien mereksi; Loikka jättää tutkimuskysymyksen kaukaisen tähden viereen.",
    "effectId": "world.PHY79-UNIVERSE-SCALE.resolved"
  },
  {
    "id": "PHY79-UNIVERSE-STRUCT",
    "familyId": "SCI06",
    "scene": "Tähden osoite",
    "action": "Kokoa hierarkia kuusta ja planeetasta planeettakuntaan sekä galaksiin; erota tähtijoukko ja galaksi annetuissa esimerkeissä.",
    "success": "Kotisaaren osoite löytää paikkansa galaksin tutkimusarkistossa, ja ystävät katsovat samaa tähtitaivasta uusin silmin.",
    "effectId": "world.PHY79-UNIVERSE-STRUCT.resolved"
  },
  {
    "id": "PHY79-PARALLEL",
    "familyId": "SCI12",
    "scene": "Kaksi rantaa, yhteinen lähde",
    "action": "Päättele laadullisesti, että samojen kahden solmun rinnakkaishaaroilla on sama jännite ja kokonaisvirta on haaravirtojen summa. Perustele molemmat samasta uudesta piiristä annettujen mittausarvojen avulla.",
    "success": "Sataman pienoismallin kaksi rantaa valaistuvat ja ystävät löytävät toisensa vastakkaisilta laitureilta.",
    "effectId": "world.PHY79-PARALLEL.resolved"
  },
  {
    "id": "PHY79-SERIES",
    "familyId": "SCI12",
    "scene": "Peräkkäisten lyhtyjen yhteys",
    "action": "Selitä saman sarjapiirin virta- ja jännitekäyttäytyminen mittaustiedoilla; yksi oikea sääntö ei korvaa toista.",
    "success": "Kaksi koelyhtyä valaisee sataman pienoiskulkureitin ymmärrettävänä sarjakokonaisuutena.",
    "effectId": "world.PHY79-SERIES.resolved"
  },
  {
    "id": "SCI-ENV-EVAL-01",
    "familyId": "SCI02",
    "scene": "Liian pitkä pikkusimpukka",
    "action": "Vertaa tulosta näkyvään kokoluokkaan ja muihin mittauksiin; valitse tarkistus ja korjaa vain todettu kirjaus- tai mittausvirhe.",
    "success": "Tarkistettu simpukkahavainto palauttaa pienen löydön oikeaan mittasuhteeseen. Loikka uskaltaa kertoa virheestään, ja Aava lisää kuvan heidän yhteiseen rehellisten löytöjen näyttelyyn.",
    "effectId": "world.SCI-ENV-EVAL-01.resolved"
  },
  {
    "id": "SCI-ENV-EXP-01",
    "familyId": "SCI02",
    "scene": "Tuulen pieni koepurje",
    "action": "Toteuta annetut vaiheet: ennusta, aseta purje, käynnistä mallipuhallin ja vertaa liikettä ennusteeseen; vaiheita ei tarvitse etsiä valikoista.",
    "success": "Mallivene tekee ensimmäisen hallitun kaartonsa ja palaa Aavan vierelle.",
    "effectId": "world.SCI-ENV-EXP-01.resolved"
  },
  {
    "id": "CHEM79-OBS-01",
    "familyId": "SCI14",
    "scene": "Kupla vai valmis selitys?",
    "action": "Lajittele kupliminen ja värinmuutos havainnoiksi, aineen syntyä koskevat väitteet tulkinnoiksi; tunnista lisänäytön tarve.",
    "success": "Kuplivan näytteen ylle ehdotettu liian varma nimilappu muuttuu tarkaksi havainnoksi ja avoimeksi kysymykseksi. Sulka hyväksyy rehellisen näyttelykortin, ja Aava saa pysäyttää hätiköidyn päätelmän.",
    "effectId": "world.CHEM79-OBS-01.resolved"
  },
  {
    "id": "ENV-PHY-LIGHT-01",
    "familyId": "SCI05",
    "scene": "Luolan ystävällinen näyttämö",
    "action": "Havaitse valotilanteen muutos ja rakenna sitä selittävä lähde–este–pinta-malli; perustele yksi uusi ennuste.",
    "success": "Luolan seinälle avautuu yhteinen varjonäytelmä ja suuri pelottava muoto osoittautuu pieneksi ystäväksi.",
    "effectId": "world.ENV-PHY-LIGHT-01.resolved"
  },
  {
    "id": "ENV-PHY-CAUSE-MOTION-01",
    "familyId": "SCI03",
    "scene": "Tuulen ja veden kädenjälki",
    "action": "Vertaa samaa venettä tuulen ollessa päällä ja poissa; liitä havaittu suunnanmuutos mallissa muuttuneeseen vuorovaikutukseen.",
    "success": "Loikka ohjaa koeveneen rauhalliseen sivupoukamaan ja antaa tuulelle osan kunniasta.",
    "effectId": "world.ENV-PHY-CAUSE-MOTION-01.resolved"
  },
  {
    "id": "ENV-PHY-SOUND-01",
    "familyId": "SCI05",
    "scene": "Äänetönkin konsertti",
    "action": "Havaitse lähteen värähtely ja selitä häiriön välittyminen annetussa mallissa; tee uusi ennuste ilman pakollista kuuntelua.",
    "success": "Konserttiseinä syttyy liikkeen kuvioiksi, ja myös mykistetty peli näyttää yhteisen musiikkihetken.",
    "effectId": "world.ENV-PHY-SOUND-01.resolved"
  },
  {
    "id": "PHY79-ACTIONPAIR",
    "familyId": "SCI10",
    "scene": "Airo ja vesi vastaavat",
    "action": "Yhdistä yhtä suuret vastakkaissuuntaiset voimat niiden eri kohdekappaleisiin; pidä pari erillään yhden kappaleen voimatasapainosta.",
    "success": "Mallivene irtoaa rannasta, ja ystävät ymmärtävät liikkeen yhteistyönä veden kanssa.",
    "effectId": "world.PHY79-ACTIONPAIR.resolved"
  },
  {
    "id": "PHY79-FRICTION",
    "familyId": "SCI10",
    "scene": "Turvallinen pito kalliorinteellä",
    "action": "Muuta vain pintaparia, ennusta liikkeen tai pidon muutos ja perustele kitkan vastustama suhteellinen liike.",
    "success": "Malliin valittu tarkoituksenmukainen pinta pitää retkikorin kuljetuksen hallittuna. Loikka näyttää erikseen, missä kitkasta on apua ja missä se vastustaa liikettä.",
    "effectId": "world.PHY79-FRICTION.resolved"
  },
  {
    "id": "PHY79-FORCE-MOTION",
    "familyId": "SCI10",
    "scene": "Vaunu, joka jatkaa matkaa",
    "action": "Yhdistä kokonaisvoima liikkeen muuttumiseen; tunnista, että nollakokonaisvoimalla voi esiintyä myös tasaista suoraviivaista liikettä.",
    "success": "Vuoristokuljetus saa ymmärrettävän hallintasuunnitelman ja vaunu pysähtyy perustellulla vastavaikutuksella.",
    "effectId": "world.PHY79-FORCE-MOTION.resolved"
  },
  {
    "id": "PHY79-ACCEL-CALC",
    "familyId": "SCI03",
    "scene": "Lähtökiihdytyksen mitta",
    "action": "Säilytä nykyinen kiihtyvyyslasku ja hyväksymisehto; tarinakehys käyttää nopeuden muutoksesta ja ajasta saatua tulosta.",
    "success": "Hyväksytyn nykytehtävän jälkeen veneen lähtö nähdään uudessa loppukuvassa. Kaksi nopeushavaintoa ja laskettu keskimääräinen kiihtyvyys kertovat, miten vene pääsi Aavan luo.",
    "effectId": "world.PHY79-ACCEL-CALC.resolved"
  },
  {
    "id": "PHY79-ACCEL-GRAPH",
    "familyId": "SCI03",
    "scene": "Kaksi kuvaa samasta matkasta",
    "action": "Nykyinen integraatiotehtävä säilyy; onnistuminen edellyttää sen nykyistä näyttöä kummankin kuvaajatyypin tulkinnasta samassa tilanteessa.",
    "success": "Majakan suuri matkakartta herää yhtenäiseksi kertomukseksi, ja viestivene näkyy sen oikeissa vaiheissa.",
    "effectId": "world.PHY79-ACCEL-GRAPH.resolved"
  },
  {
    "id": "PHY79-SPEED-REARR",
    "familyId": "SCI03",
    "scene": "Milloin posti ehtii perille?",
    "action": "Nykyinen nopeussuhteen muokkaustehtävä säilyy; kehys käyttää hyväksyttyä puuttuvan suureen ratkaisua saapumisen kuvaukseen.",
    "success": "Viestiveneelle syntyy perusteltu matkasuunnitelma ja ystävät löytävät yhteisen tapaamishetken.",
    "effectId": "world.PHY79-SPEED-REARR.resolved"
  },
  {
    "id": "PHY79-SPEED-MIXED",
    "familyId": "SCI03",
    "scene": "Kahden saaren mittakielet",
    "action": "Säilytä nykyinen sekayksikkötehtävä ja sen dynaaminen yksikköportti; näytöksi tarvitaan yhtenäistys ennen nopeuslaskua.",
    "success": "Saarien matkaviestit muuttuvat vertailukelpoisiksi, ja yhteinen reittitaulu valmistuu.",
    "effectId": "world.PHY79-SPEED-MIXED.resolved"
  },
  {
    "id": "PHY79-SUPPORT",
    "familyId": "SCI10",
    "scene": "Kivi, joka kannattelee",
    "action": "Tunnista pinnan kappaleeseen kohdistama tukivoima ja sen suunta; vertaa vaakatasoa ja kaltevaa pintaa.",
    "success": "Lepäävän retkilaatikon voimakuva saa perustellun tukivoiman. Vuoristopajan tasanne pysyy rauhallisena ja Loikka huomaa, ettei paikallaanolo tarkoita voimien puuttumista.",
    "effectId": "world.PHY79-SUPPORT.resolved"
  },
  {
    "id": "PHY79-WEIGHT",
    "familyId": "SCI10",
    "scene": "Kuorman ja Maan yhteys",
    "action": "Tunnista paino Maan ja kappaleen vuorovaikutukseen liittyväksi voimaksi, osoita sen suunta ja erota kilogramma newtonista.",
    "success": "Saman kuorman massa ja siihen kohdistuva paino erotetaan oikein. Maan ja annetun Kuun mallin rinnakkaiskuva paljastaa, mikä muuttui, ja Loikka saa kummallekin suureelle oikean nimen.",
    "effectId": "world.PHY79-WEIGHT.resolved"
  },
  {
    "id": "PHY79-ELEC-ENERGY",
    "familyId": "SCI12",
    "scene": "Yön pituinen valovuoro",
    "action": "Laske tai vertaile E=Pt annetuilla yhteensopivilla yksiköillä; erota wattitunti ja watti.",
    "success": "Yön valosuunnitelma valmistuu ja majakan energia riittää mallissa sovittuun käyttöön.",
    "effectId": "world.PHY79-ELEC-ENERGY.resolved"
  },
  {
    "id": "PHY79-POWER-CALC",
    "familyId": "SCI10",
    "scene": "Vinssin toimintakortti",
    "action": "Laske P=W/t ja ilmoita tulos watteina; tarkista vertailutapauksella, että sama työ lyhyemmässä ajassa kasvattaa tehoa.",
    "success": "Vuoristohissi saa perustellun toimintakortin ja kuljettaa yhteisen retkikorin näköalatasanteelle.",
    "effectId": "world.PHY79-POWER-CALC.resolved"
  },
  {
    "id": "PHY79-WORK-CALC",
    "familyId": "SCI10",
    "scene": "Hissin nostotyön määrä",
    "action": "Laske W=Fs tilanteessa, jossa voima on vakio ja siirtymän suuntainen; ilmoita työ jouleina.",
    "success": "Hissin suunnittelukortti saa oikean työmäärän ja kuorma saavuttaa mallitasanteen.",
    "effectId": "world.PHY79-WORK-CALC.resolved"
  },
  {
    "id": "CHEM79-MIX-HOM",
    "familyId": "SCI15",
    "scene": "Sama näyte ylhäältä ja alhaalta",
    "action": "Vertaa näytteiden koostumusta ja erotettavia faaseja; luokittele seos tasa- tai sekakoosteiseksi annetuissa oloissa.",
    "success": "Eri kohdista otetut näytteet avaavat seoksen koostumuksen. Kristallilahden läpileikkaus paljastaa, missä sisältö on samanlaista ja missä erilliset faasit löytyvät.",
    "effectId": "world.CHEM79-MIX-HOM.resolved"
  },
  {
    "id": "CHEM79-SEPARATE-02",
    "familyId": "SCI15",
    "scene": "Kolmen työpöydän talteenotto",
    "action": "Erota suodatus, haihdutus ja dekantointi sekä ennusta niiden tuotteet annetuissa seoksissa; toimintanimet eivät yksin riitä.",
    "success": "Kristallilahden talteenottopöydälle ilmestyvät erikseen hiekka, kiteet ja erotettu yläkerros, jokainen omalla selityksellään.",
    "effectId": "world.CHEM79-SEPARATE-02.resolved"
  },
  {
    "id": "CHEM79-CONC-CALC",
    "familyId": "SCI19",
    "scene": "Virtuaalietiketin puuttuva prosentti",
    "action": "Laske massaprosentti aineosan massa jaettuna koko liuoksen massalla kertaa sata; nimeä käytetty pitoisuusmääritelmä.",
    "success": "Näyte saa oikein lasketun massaprosentin. Aava sulkee tutkimusnäyttelyn etikettiaukon, ja Loikka pystyy nyt lukemaan koostumuksen arvaamatta astian koosta.",
    "effectId": "world.CHEM79-CONC-CALC.resolved"
  },
  {
    "id": "CHEM79-CONC-COMP",
    "familyId": "SCI19",
    "scene": "Kaksi erikokoista näytepulloa",
    "action": "Vertaa kahden liuoksen pitoisuutta annetulla samalla pitoisuusmäärittelyllä; perustele vertailu suhteilla, ei pelkällä aineosan määrällä.",
    "success": "Suurten ja pienten pullojen arvoitus ratkeaa: yhtä väkevät näytteet asettuvat rinnakkain. Puutarhan suhteita näyttävä mosaiikki paljastaa niiden yhteisen koostumuksen.",
    "effectId": "world.CHEM79-CONC-COMP.resolved"
  },
  {
    "id": "CHEM79-INDICATOR",
    "familyId": "SCI19",
    "scene": "Värin kertoma rajattu viesti",
    "action": "Päättele näytteen happamuus annetun indikaattorin oman selitteen avulla; valitse tuloksen sallima luokka tai pH-alue.",
    "success": "Nimettömän näytteen happamuusalue löytyy juuri sen indikaattorin selitteestä. Tutkimusikkuna avautuu lähteen heijastukseen, ja Aava esittelee myös tuloksen tarkkuusrajan.",
    "effectId": "world.CHEM79-INDICATOR.resolved"
  },
  {
    "id": "CHEM79-PH",
    "familyId": "SCI19",
    "scene": "Asteikko, joka ei ole tavallinen viivoitin",
    "action": "Tunnista happaman, neutraalin ja emäksisen alueet annetussa tilanteessa sekä päättele happamuuden suunta; vältä pH:n sekoittamista yleiseksi vaarallisuusmittariksi.",
    "success": "Näytteet löytävät perustellut paikkansa pH-kartalla. Puutarhan happaman, neutraalin ja emäksisen tutkimuspenkit paljastuvat yhtenä näkymänä ilman maistamista tai vaarallisuusarvausta.",
    "effectId": "world.CHEM79-PH.resolved"
  },
  {
    "id": "CHEM79-WATERFAT-SOL",
    "familyId": "SCI15",
    "scene": "Kaksi erilaista vesistöä mallipöydällä",
    "action": "Vertaa aineiden liukenemista veteen ja rasvaan havaintotiedoilla; valitse aineelle oikea liukoisuuskuvaus.",
    "success": "Kahden faasin arvoitus ratkeaa annetuista jakautumistiedoista. Aava avaa läpileikkausnäytön, jossa aineiden eri paikat selittyvät liukoisuudella eivätkä niiden väreillä.",
    "effectId": "world.CHEM79-WATERFAT-SOL.resolved"
  },
  {
    "id": "CHEM79-CARBON-BURN",
    "familyId": "SCI20",
    "scene": "Varastosta ilmaan",
    "action": "Selitä palamisen hiilivirta lähtöaineesta ilmakehän tuotteisiin ja tunnista fossiilisen varaston siirtymän ero lyhyen kierron aineistoon.",
    "success": "Metsäneuvosto jäljittää ilmaan päätyneen hiilen oikeaan lähtövarastoon. Kartan pitkä ja lyhyt aikajänne erottuvat, ja väärä väite välittömästä palautumisesta korjataan yhteisesti.",
    "effectId": "world.CHEM79-CARBON-BURN.resolved"
  },
  {
    "id": "CHEM79-FIRE-SAFE",
    "familyId": "SCI08",
    "scene": "Metsän yhteinen turvapiiri",
    "action": "Tunnista palamisen ehdot sekä perustele erikseen turvallinen poistumis- ja ilmoittamispäätös; sammuttamista ei ohjata lapselle.",
    "success": "Aikuisten hoitama kuvitteellinen palotilanne rauhoittuu; turvaniemen ystävät näkevät suojellun metsäsaarekkeen ja odottavat lupaa palata.",
    "effectId": "world.CHEM79-FIRE-SAFE.resolved"
  },
  {
    "id": "CHEM79-EXOENDO",
    "familyId": "SCI18",
    "scene": "Lämmin ja viileä mallipaja",
    "action": "Luokittele annettujen energiatietojen perusteella reaktio eksotermiseksi tai endotermiseksi ja yhdistä termi ympäristöön suuntautuvaan tai sieltä tulevaan energiansiirtoon.",
    "success": "Pajan kaksiosainen lämpömosaiikki valmistuu. Yhdellä puolella energia kulkee ympäristöön, toisella reaktioon, ja ystävät esittävät vastakkaiset muutokset yhteisessä mallinäytöksessä.",
    "effectId": "world.CHEM79-EXOENDO.resolved"
  },
  {
    "id": "ENV-CHEM-WATERCYCLE-01",
    "familyId": "SCI20",
    "scene": "Vuoren pisaran retki",
    "action": "Yhdistä haihtuminen, tiivistyminen, sade ja valunta veden kierron paikkoihin; tunnista myös varastoituminen ja vaihtoehtoiset reitit.",
    "success": "Pisaran reitti yhdistää meren, vuoren ja puron eläväksi kiertokuluksi.",
    "effectId": "world.ENV-CHEM-WATERCYCLE-01.resolved"
  },
  {
    "id": "SCI-ENV-CONCL-01",
    "familyId": "SCI02",
    "scene": "Kenelle aurinkoinen paikka?",
    "action": "Valitse aineiston tukema johtopäätös ja osoita sitä tukeva havainto; hyväksy rajaus vain tutkittuihin paikkoihin.",
    "success": "Taimikorit saavat perustellun paikan, ja ensimmäinen uusi lehti avautuu kuvitteellisessa aikasiirtymässä.",
    "effectId": "world.SCI-ENV-CONCL-01.resolved"
  },
  {
    "id": "CHEM79-ELECTRON",
    "familyId": "SCI16",
    "scene": "Elektroniverhon miinusmerkki",
    "action": "Tunnista elektronin negatiivinen varaus ja elektroniverhoon liittyvä sijaintikuvaus; erota se ytimen hiukkasista.",
    "success": "Aava sijoittaa elektronin tiedot oikeaan mallialueeseen. Gallerian verho avautuu elektroniverhon esitykseksi, ja Loikka erottaa sen ytimestä ilman planeettaratojen arvausta.",
    "effectId": "world.CHEM79-ELECTRON.resolved"
  },
  {
    "id": "CHEM79-NEUTRON",
    "familyId": "SCI16",
    "scene": "Ytimen hiljainen merkki",
    "action": "Yhdistä neutroni ytimeen ja nollavaraukseen; vertaa sen varaustietoa protoniin ja elektroniin annetuilla korteilla.",
    "success": "Neutroni saa ytimestä oikean paikan ja varauksettoman tunnisteen. Suuri atomilyhty näyttää erilliset alueet ja nimet, ja Loikka löytää viimeisen puuttuneen hiukkaskortin.",
    "effectId": "world.CHEM79-NEUTRON.resolved"
  },
  {
    "id": "CHEM79-NUTRIENT-CARB",
    "familyId": "SCI21",
    "scene": "Eväskorin hiilihydraatit",
    "action": "Tunnista annetut sokerit ja tärkkelys hiilihydraattien ryhmän esimerkeiksi ja liitä ryhmä koostumustietoon ilman ruoan arvottamista.",
    "success": "Eväskorin makeuteen perustunut arvaus korjaantuu: myös ei-makea aine-esimerkki löytää hiilihydraattien paikan. Aava avaa tämän ryhmän pienen näyttelypöydän ystäville.",
    "effectId": "world.CHEM79-NUTRIENT-CARB.resolved"
  },
  {
    "id": "CHEM79-NUTRIENT-FAT",
    "familyId": "SCI21",
    "scene": "Rasvan monet muodot",
    "action": "Tunnista rasvat kemialliseksi ravintoaineryhmäksi annetun rakenne- ja koostumustiedon perusteella; erottele ryhmä arkisesta ulkonäöstä.",
    "success": "Näkyvän ulkonäön taakse kätkeytyneet rasvaryhmän esimerkit löytyvät koostumustiedoista. Eväspajan oma tutkimusliina avautuu, ja Loikka esittelee ryhmän kaksi erilaista esimerkkiä.",
    "effectId": "world.CHEM79-NUTRIENT-FAT.resolved"
  },
  {
    "id": "CHEM79-NUTRIENT-PROT",
    "familyId": "SCI21",
    "scene": "Proteiinin rakentuvat ketjut",
    "action": "Tunnista proteiinit ravintoaineiden kemialliseksi ryhmäksi ja yhdistä ne annetussa mallissa aminohapporakenteeseen; löydä ryhmä eri ruoka-aineiden tiedoista.",
    "success": "Proteiinimalli avautuu ketjuksi ja liittyy annettuihin eri ruokien koostumuksiin. Aava tuo näyttelyyn myös kasvipohjaisen esimerkin, ja ystävien yhteinen pöytä saa uuden ymmärrettävän osan.",
    "effectId": "world.CHEM79-NUTRIENT-PROT.resolved"
  },
  {
    "id": "CHEM79-ORG-GROUP",
    "familyId": "SCI21",
    "scene": "Paikallisen puutarhurin tutkimuslaatikko",
    "action": "Tunnista valitun ryhmän rakennepiirre, vertaa vähintään kahta esimerkkiä ja perustele aineistoon rajattu rakenne–ominaisuus-yhteys; profiili määrittää tehtävän ja näytön.",
    "success": "Puutarhan paikallinen näyttely avautuu kyseisen ryhmän tutkimustuloksille vasta määritetyn osaamisnäytön jälkeen.",
    "effectId": "world.CHEM79-ORG-GROUP.resolved"
  },
  {
    "id": "CHEM79-ATOMICNUM",
    "familyId": "SCI16",
    "scene": "Alkuaineen henkilöllisyyskortti",
    "action": "Laske protonit ja yhdistä määrä järjestyslukuun sekä alkuaineeseen annetulla taulukolla.",
    "success": "Nimetön näyte palautuu oikean alkuaineen vitriiniin. Sen kadonnut nimi ilmestyy gallerian kartalle, ja Aava saa esitellä löydön Sulalle.",
    "effectId": "world.CHEM79-ATOMICNUM.resolved"
  },
  {
    "id": "CHEM79-BALANCE",
    "familyId": "SCI17",
    "scene": "Yksikään atomi ei jää rannalle",
    "action": "Tasapainota yksinkertainen reaktioyhtälö positiivisilla kokonaislukukertoimilla kaavoja muuttamatta ja tarkista jokainen atomilaji molemmilta puolilta. Tunnista myös tasapainoinen yhteinen kerrannainen; pienin kokonaislukusuhde viimeistellään erillisenä esitystapana.",
    "success": "Esityksen kaksi rantaa yhdistyvät: kaikki atomit saavat paikkansa ja muutoskirjan sinetti sulkeutuu.",
    "effectId": "world.CHEM79-BALANCE.resolved"
  },
  {
    "id": "CHEM79-REACTION-MODEL",
    "familyId": "SCI18",
    "scene": "Atomien uusi järjestys",
    "action": "Rakenna annetun reaktion hiukkasmalli atomilajit ja atomimäärät säilyttäen; muuta niiden liittymistä annettujen tuotetietojen mukaisesti.",
    "success": "Muutospajan näyttämö järjestyy uudeksi ainekokoonpanoksi samoista atomiosista.",
    "effectId": "world.CHEM79-REACTION-MODEL.resolved"
  },
  {
    "id": "CHEM79-SCALE",
    "familyId": "SCI16",
    "scene": "Kallion pinnasta hiukkasikkunaan",
    "action": "Järjestä makro-, rakenne- ja hiukkastason esitykset ja yhdistä sama ilmiö niiden välillä; merkitse mallitasolle siirtyminen.",
    "success": "Kallion, rakenteen ja hiukkasmallin ikkunat asettuvat oikeaan suhteeseen. Aava kulkee gallerian selityspolun ja osoittaa kohdan, jossa havaintokuvasta siirrytään malliin.",
    "effectId": "world.CHEM79-SCALE.resolved"
  },
  {
    "id": "CHEM79-STATECHANGE",
    "familyId": "SCI16",
    "scene": "Jään avautuva järjestys",
    "action": "Kuvaa olomuodon muutosta hiukkasten liikkeen, järjestyksen ja keskinäisten etäisyyksien muutoksena; älä muuta hiukkaslajia.",
    "success": "Jääikkuna muuttuu liikkuvaksi vesipeiliksi ja Aava löytää samat rakenneosat uudelleen.",
    "effectId": "world.CHEM79-STATECHANGE.resolved"
  },
  {
    "id": "CHEM79-SUBSCRIPT",
    "familyId": "SCI17",
    "scene": "Pieni numero, suuri ero",
    "action": "Osoita, mihin atomilajiin alaindeksi kuuluu ja mitä lukumäärää tai lukusuhdetta se kuvaa; tunnista näkymätön ykkönen.",
    "success": "Väärään paikkaan luettu pieni numero saa oikean merkityksensä. Sulan kaavakirjan mallikuva ja kaava vastaavat taas toisiaan, ja Aava korjaa näyttelyn ennen vieraiden saapumista.",
    "effectId": "world.CHEM79-SUBSCRIPT.resolved"
  },
  {
    "id": "PHY79-PREDICT-01",
    "familyId": "SCI09",
    "scene": "Viesti ennen venettä",
    "action": "Käytä annettua mallia uuteen tilanteeseen sen pätevyysalueella ja vertaa ennustetta havaintoon; tunnista perusteeton ulottaminen alueen ulkopuolelle.",
    "success": "Majakan lyhty tervehtii venettä ennustetussa kohdassa, ja poikkeama saa selityskysymyksen.",
    "effectId": "world.PHY79-PREDICT-01.resolved"
  },
  {
    "id": "SCI-ENV-OBS-01",
    "familyId": "SCI01",
    "scene": "Kuka kävi rantapolulla?",
    "action": "Osoita jäljestä kaksi todellista piirrettä ja kokoa niitä vastaava kuvaus; eläimen arvaaminen ei korvaa havaintoa.",
    "success": "Tarkka havaintokortti avaa rantajäljen suurennetun tutkimuskuvan. Aava ja Loikka näkevät yhdessä, mitä jäljestä todella tiedetään, ja jättävät tekijän ystävällisesti vielä tuntemattomaksi.",
    "effectId": "world.SCI-ENV-OBS-01.resolved"
  },
  {
    "id": "CHEM79-QUESTION-01",
    "familyId": "SCI14",
    "scene": "Mikä liukenee ja mihin?",
    "action": "Muodosta aineeseen, liuottimeen tai olosuhteeseen rajattu tutkittava kysymys ja nimeä havaittava vastaus.",
    "success": "Aavan oma kysymys saa juuri siihen vastaavan havaintoikkunan. Sulka avaa rajatun virtuaalisen tutkimustapauksen, ja uteliaisuus muuttuu näkyväksi selvitettäväksi asiaksi.",
    "effectId": "world.CHEM79-QUESTION-01.resolved"
  },
  {
    "id": "PHY79-QUESTION-01",
    "familyId": "SCI09",
    "scene": "Tuulen mitattava arvoitus",
    "action": "Valitse muutettava tekijä, mitattava suure ja rajattu koetilanne; erota fysikaalinen kysymys mieltymyksestä.",
    "success": "Tuulitunneliin avautuu juuri Aavan rajaamaa kysymystä vastaava koeikkuna. Loikka saa nähdä, millä havainnolla kysymykseen voidaan vastata, ja oma tutkimus alkaa.",
    "effectId": "world.PHY79-QUESTION-01.resolved"
  },
  {
    "id": "CHEM79-RATE-CONC",
    "familyId": "SCI18",
    "scene": "Tiheämmin kohtaavat mallihiukkaset",
    "action": "Muuta yhtä lähtöainepitoisuutta muiden ehtojen pysyessä samoina ja yhdistä annettu nopeusvaikutus mallin kohtaamisiin.",
    "success": "Kahden virtuaalinäytteen erilainen tahti saa datan tukeman selityksen. Pajan kohtaamisseinä avautuu rinnakkaiseksi hiukkasnäytökseksi, jossa pitoisuuden merkitys tulee näkyväksi.",
    "effectId": "world.CHEM79-RATE-CONC.resolved"
  },
  {
    "id": "CHEM79-RATE-SURF",
    "familyId": "SCI18",
    "scene": "Yksi kappale, monta pintaa",
    "action": "Vertaa samaa massaa eri palakoossa, tunnista kokonaispinnan muutos ja yhdistä se kontrolloidun mallin reaktionnopeuteen.",
    "success": "Yhtenäiseltä näyttänyt kappale jakautuu mallissa osiin, joiden uudet pinnat näkyvät. Pintamosaiikin arvoitus ratkeaa ja Aava pystyy näyttämään nopeuseron syyn.",
    "effectId": "world.CHEM79-RATE-SURF.resolved"
  },
  {
    "id": "CHEM79-RATE-TEMP",
    "familyId": "SCI18",
    "scene": "Mallinäytteiden eri lämpötilat",
    "action": "Ennusta ja tarkista annetun reaktion nopeuden muutos lämpötilan vaihtuessa; perustele tulkinta vertailudatalla eikä yleisellä aina-väitteellä.",
    "success": "Lämpötilavertailun etenemisjärjestys täsmää aineistoon. Pajan kaksi mallikelloa näyttävät oman paikallisen reaktionsa tahdin, ja Loikan yllätys muuttuu perustelluksi selitykseksi.",
    "effectId": "world.CHEM79-RATE-TEMP.resolved"
  },
  {
    "id": "PHY79-PLAN-01",
    "familyId": "SCI09",
    "scene": "Tuulitunnelin reilu vertailu",
    "action": "Lukitse muut tekijät, valitse yksi muutettava tekijä sekä mitattava tulos ja toistot; turvallisuustila näkyy valmiina.",
    "success": "Reilun tutkimuksen ehdot asettuvat paikoilleen. Ystävät käynnistävät paikallisen mallivertailun yhdessä, ja ensimmäiset havainnot voidaan nyt tulkita saman kysymyksen vastauksiksi.",
    "effectId": "world.PHY79-PLAN-01.resolved"
  },
  {
    "id": "CHEM79-DATA-01",
    "familyId": "SCI14",
    "scene": "Laboratorion avoin näyttely",
    "action": "Kokoa tunnisteellinen aineisto ja muodosta siitä oikea esitys; osoita, mistä yksi esityksen arvo on peräisin.",
    "success": "Näyttely avautuu niin, että retkeläiset voivat seurata tiedon koko matkaa.",
    "effectId": "world.CHEM79-DATA-01.resolved"
  },
  {
    "id": "PHY79-ST-GRAPH",
    "familyId": "SCI03",
    "scene": "Pysähdys eväsniemellä",
    "action": "Säilytä nykyinen matka–aika-kuvaajatehtävä; kehys tunnistaa siinä osoitetut liike- ja pysähdysjaksot.",
    "success": "Nykytehtävän hyväksytty tulkinta avaa veneen paikallisen matkamuiston. Eväsniemen pysähdys löytyy juuri oikeasta kohdasta ja Aava ehtii jakaa eväshetken Loikan kanssa.",
    "effectId": "world.PHY79-ST-GRAPH.resolved"
  },
  {
    "id": "PHY79-VT-GRAPH",
    "familyId": "SCI03",
    "scene": "Vauhdin oma kertomus",
    "action": "Säilytä nykyinen nopeus–aika-kuvaajan tehtävä; tarinakehys reagoi oikeaan tasaisen ja muuttuvan nopeuden tulkintaan.",
    "success": "Nykytehtävän hyväksytty tulkinta avaa veneen matkan loppukuvan. Rauhallinen jakso ja muuttuva nopeus erottuvat, ja ystävät ymmärtävät, miksi saapuminen tapahtui juuri kuvattuna hetkenä.",
    "effectId": "world.PHY79-VT-GRAPH.resolved"
  },
  {
    "id": "SCI-ENV-SAFE-01",
    "familyId": "SCI08",
    "scene": "Retkiseurueen yhteinen lupaus",
    "action": "Nykyinen turvallisuusohjeiden noudattamisen tehtävä ja toiminnallinen portti säilyvät; tarinakääre reagoi sen hyväksyttyihin valintoihin.",
    "success": "Retkiseurue asettuu yhteiseen lähtökuvaan ja Sulka avaa turvallisen tutkimuspisteen.",
    "effectId": "world.SCI-ENV-SAFE-01.resolved"
  },
  {
    "id": "CHEM79-LAB-01",
    "familyId": "SCI14",
    "scene": "Lasilaboratorion täsmälliset välineet",
    "action": "Yhdistä pipetti, mittalasi ja muu valittu perusväline tarkoitukseensa; suorita sen oikea virtuaalinen käyttövaihe ohjeen mukaan.",
    "success": "Virtuaalipöydän välineet saavat oikeat tehtävänsä. Sulka ja Aava toteuttavat lyhyen mallinäytöksen, jossa näyte päätyy mitattavaksi ja siirrettäväksi tarkoituksenmukaisilla välineillä.",
    "effectId": "world.CHEM79-LAB-01.resolved"
  },
  {
    "id": "CHEM79-MEAS-01",
    "familyId": "SCI14",
    "scene": "Näytteen oikea määrä",
    "action": "Valitse vaaka tai tilavuusväline tehtävän suureelle, käytä nollausta tai oikeaa lukukohtaa ja kirjaa arvo yksiköineen.",
    "success": "Oikein mitattu virtuaalinäyte asettuu vertailupaikalleen. Näennäisesti erikokoisten astioiden arvoitus ratkeaa, kun Aava osoittaa niiden todelliset mittaustiedot.",
    "effectId": "world.CHEM79-MEAS-01.resolved"
  },
  {
    "id": "PHY79-PREC-01",
    "familyId": "SCI09",
    "scene": "Luotettavan mittauksen sinetti",
    "action": "Arvioi välineen sopivuus ja kirjoita tai valitse sen mukainen tulosmerkintä; perustele molemmat erillisestä aineistosta.",
    "success": "Liian tarkaksi väitetty havaintoraportti saa rehellisen tarkkuusmerkinnän. Majakan vastaanottaja pystyy erottamaan varmasti havaitun eron ja epävarmaksi jäävän kohdan.",
    "effectId": "world.PHY79-PREC-01.resolved"
  },
  {
    "id": "PHY79-HEAT-MECH",
    "familyId": "SCI04",
    "scene": "Kolmen lämmön mökki",
    "action": "Yhdistä johtuminen, kuljettuminen ja säteily eri havaintoihin; perustele myös tilanne, jossa useampi mekanismi vaikuttaa yhtä aikaa.",
    "success": "Majan pienoismalli rauhoittuu miellyttäväksi retkipaikaksi ja ystävät levittävät eväsliinan.",
    "effectId": "world.PHY79-HEAT-MECH.resolved"
  },
  {
    "id": "PHY79-OHM",
    "familyId": "SCI12",
    "scene": "Satamalyhdyn laskettava malli",
    "action": "Käytä U=RI-suhdetta puuttuvaan suureeseen ja tarkista tulos annettuun mittausalueeseen; yksiköt säilyvät mukana.",
    "success": "Koelyhdyn laskennallinen asetus vastaa mittausta ja valo syttyy odotetusti.",
    "effectId": "world.PHY79-OHM.resolved"
  }
] as const;

/** Drafted scene directions, not a claim that the renderer has built all 62 places. */
export interface FamilyWorldRecipe {
  id: string; landmark: string; landmarkAt: readonly [number, number, number];
  support: string; supportAt: readonly [number, number, number]; light: string; motion: string;
}
export const familyWorldRecipes: readonly FamilyWorldRecipe[] = [
 {id:'LM01',landmark:'kaislaikkunat',landmarkAt:[-3.6,0,-2.4],support:'avoin havaintovihko ja veden rengas',supportAt:[3.5,0,-1.6],light:'lämmin iltaranta',motion:'ruo’on rajattu huojunta'},
 {id:'LM02',landmark:'lehtiteltta',landmarkAt:[-3.2,0,-2.4],support:'läpikuultava selityskangas ja risteävät polut',supportAt:[3.2,0,-2.4],light:'pehmeä kangasvalo',motion:'telttakankaan pieni liike'},
 {id:'LM03',landmark:'lehtilaituri',landmarkAt:[-3.4,0,-2],support:'kaislaportti ja toinen tyhjä laituri',supportAt:[3.4,0,-2],light:'kirkas matala ranta',motion:'lehtien hidas vedenliike'},
 {id:'LM04',landmark:'kimppujen venevaja',landmarkAt:[-3.5,0,-2.6],support:'avattava kaislakimppu ja veneen kiinnityspaikka',supportAt:[3.4,0,-1.9],light:'kuivan puun lämmin valo',motion:'kimpun varovainen avautuminen'},
 {id:'LM05',landmark:'kahden polun satamakatos',landmarkAt:[-3.7,0,-2.8],support:'yhteinen laskumatto kahden rantapolun välissä',supportAt:[3.5,0,-2],light:'iltasataman kulta',motion:'veden rauhallinen liike'},
 {id:'LM06',landmark:'lauttarivien veistämö',landmarkAt:[-3.4,0,-2.7],support:'kääntyvä ruudukko ja rantapenkki',supportAt:[3.5,0,-2.1],light:'kirkas lahtivalo',motion:'yhden lautan rajattu keinunta'},
 {id:'LM07',landmark:'puurinteelle nouseva laskupaja',landmarkAt:[-3.7,0,-2.8],support:'läpinäkyvät lukuyksikkölaatikot',supportAt:[3.4,0,-2],light:'lämmin pajavalo',motion:'laatikon kannen avaus'},
 {id:'LM08',landmark:'haarautuva sivu-uoma',landmarkAt:[-3.2,0,-2.3],support:'kalliorannan putous ja toinen vesireitti',supportAt:[3.3,0,-2],light:'turkoosi vesi ja iltakallio',motion:'lyhyt putousnauha'},
 {id:'LM09',landmark:'helmisimpukan asema',landmarkAt:[-3.4,0,-2.5],support:'helmen suurennusikkuna ja läpikuultava ruutukehys',supportAt:[3.6,0,-2.2],light:'pehmeä helmiäishohto',motion:'simpukan hidas avautuminen'},
 {id:'LM10',landmark:'jäälahden mittalaituri',landmarkAt:[-3.5,0,-2.6],support:'nollan kahta puolta jatkava rantamitta',supportAt:[3.3,0,-2],light:'viileä jää ja lämmin horisontti',motion:'hillitty jääheijastus'},
 {id:'LM11',landmark:'tuntemattoman työpajan katos',landmarkAt:[-3.6,0,-2.6],support:'suljettu laatikko ja tasapainovaaka',supportAt:[3.4,0,-2],light:'lämmin työvalo',motion:'vaa’an rauhallinen asettuminen'},
 {id:'LM12',landmark:'pöydälle nostettava pienoissaari',landmarkAt:[-3.4,0,-2.5],support:'tasainen karttalehti ja kompassimerkki',supportAt:[3.5,0,-2],light:'aamuinen saarivalo',motion:'saaren hallittu nousu'},
 {id:'LM13',landmark:'lehtipurjeiden kuivausvaijeri',landmarkAt:[-3.5,0,-2.7],support:'poukaman vene ja käännettävä purje',supportAt:[3.5,0,-2],light:'läpikuultava lehtivihreä',motion:'yksi lehtipurje kääntyy'},
 {id:'LM14',landmark:'majakkarakentajien valotorni',landmarkAt:[-3.5,0,-2.6],support:'pyöreä vuorikallio ja rakentelukaide',supportAt:[3.6,0,-2.3],light:'pehmeä vuoristovalo',motion:'rakennusosan hidas kääntö'},
 {id:'LM15',landmark:'peilikallion tyyni allas',landmarkAt:[-3.5,0,-2.5],support:'kallioon piirretty viiva ja peilipinta',supportAt:[3.3,0,-2],light:'viileä heijastus',motion:'pinta pysähtyy työssä'},
 {id:'LM16',landmark:'maalattu saaristoatlas',landmarkAt:[-3.5,0,-2.5],support:'karttaverkko ja mittakaavajana',supportAt:[3.4,0,-2],light:'lämmin paperivalo',motion:'kartan lehden rauhallinen avaus'},
 {id:'LM17',landmark:'rantapenkereen rakennuspiha',landmarkAt:[-3.6,0,-2.6],support:'reunaköysi ja kerroksittainen rakennelaatikko',supportAt:[3.5,0,-2],light:'kirkas rakennuspiha',motion:'yhden rakennekerroksen asettuminen'},
 {id:'LM18',landmark:'jokilaakson mittapiste',landmarkAt:[-3.4,0,-2.5],support:'avoin välinelaukku ja nollamerkki',supportAt:[3.5,0,-2],light:'laakson pehmeä päivävalo',motion:'mittalaitteen kannen avaus'},
 {id:'LM19',landmark:'kahden lahden kellotorni',landmarkAt:[-3.6,0,-2.7],support:'rinnakkaiset asteikkotaulut',supportAt:[3.5,0,-2],light:'tornin lämmin ikkunavalo',motion:'yhden osoittimen rajattu siirtymä'},
 {id:'LM20',landmark:'havaintojen majakka',landmarkAt:[-3.6,0,-2.7],support:'havaintojen laituritaulu',supportAt:[3.5,0,-2],light:'majakan lämmin reunavalo',motion:'yksi havaintomerkki löytää paikan'},
 {id:'LM21',landmark:'tuuliluodon kivipöytä',landmarkAt:[-3.3,0,-2.4],support:'läpinäkyvä mahdollisuuksien pyörä',supportAt:[3.5,0,-2],light:'tuulisen saaren pehmeä valo',motion:'tuuliviirin rajattu kääntö'},
 {id:'LM22',landmark:'ohjelmoidun lautan poukama',landmarkAt:[-3.5,0,-2.6],support:'ohjekorttiteline ja lautan vedenjälki',supportAt:[3.4,0,-2],light:'rauhallinen poukamavalo',motion:'lautan yksi ohjattu askel'},
 {id:'UM-01',landmark:'sumuinen neuvostolaituri',landmarkAt:[-3.4,0,-2.5],support:'perustelukivet ja vastarannan viestipiste',supportAt:[3.5,0,-2],light:'hajavalo sumun läpi',motion:'viestin rauhallinen saapuminen'},
 {id:'UM-02',landmark:'lyhtyjen konepajan ikkuna',landmarkAt:[-3.5,0,-2.6],support:'koelyhty ja avonainen ohjekirja',supportAt:[3.4,0,-2],light:'yhden lyhdyn lämmin valo',motion:'näkyvän askeleen rajattu muutos'},
 {id:'UM-03',landmark:'nollalaiturin syvänne',landmarkAt:[-3.5,0,-2.5],support:'pintaan nouseva tutkimuskori',supportAt:[3.5,0,-2],light:'veden kirkas viileys',motion:'korin hidas nousu'},
 {id:'UM-04',landmark:'purjeiden korjauspoukama',landmarkAt:[-3.5,0,-2.5],support:'kokonaisen kehys ja pieni purje',supportAt:[3.5,0,-2],light:'kangasta läpäisevä lämmin valo',motion:'purjeen pieni täyttyminen'},
 {id:'UM-05',landmark:'kivien tähtitornin siluetti',landmarkAt:[-3.6,0,-2.7],support:'tekijäpuu ja yksi perustalamppu',supportAt:[3.5,0,-2],light:'syvä hämärä ja lämmin lyhty',motion:'kerroksen rauhallinen avautuminen'},
 {id:'UM-06',landmark:'kallioon rakennettu juuriportti',landmarkAt:[-3.5,0,-2.5],support:'sateen jälkeinen neliöruutupuutarha',supportAt:[3.4,0,-2],light:'kostean kiven heijastus',motion:'pienen valopinnan avautuminen'},
 {id:'UM-07',landmark:'satasaaren vesineuvoston pöytä',landmarkAt:[-3.5,0,-2.5],support:'sivuportti ja jakautuva malliuoma',supportAt:[3.5,0,-2],light:'tasainen vesineuvoston valo',motion:'portin paikallinen avaus'},
 {id:'UM-08',landmark:'muuttujien veneentelakka',landmarkAt:[-3.5,0,-2.6],support:'piirustuspaperi ja termilaput katoksen alla',supportAt:[3.4,0,-2],light:'pajan lämmin paperivalo',motion:'venemallin hidas siirto'},
 {id:'UM-09',landmark:'tasapainon sulku',landmarkAt:[-3.5,0,-2.5],support:'kaksi säilyvää puolta ja rajamerkki',supportAt:[3.5,0,-2],light:'kirkas sulkuvesi',motion:'sulun avaus vasta kokeilun jälkeen'},
 {id:'UM-10',landmark:'kahden koepuron kohtaus',landmarkAt:[-3.4,0,-2.5],support:'kaksi ehtokorttia yhteisellä pöydällä',supportAt:[3.4,0,-2],light:'pehmeä virtaava heijastus',motion:'kahden puron rajattu liike'},
 {id:'UM-11',landmark:'lämmin kasvihuone',landmarkAt:[-3.5,0,-2.6],support:'kasvava ikkunarivi ja syöte–tulosmerkki',supportAt:[3.4,0,-2],light:'kasvihuoneen lämmin valo',motion:'yhden ikkunan avaus'},
 {id:'UM-12',landmark:'majakkaviivan kartta',landmarkAt:[-3.5,0,-2.6],support:'lähtövalo ja kaksi mittanuolta',supportAt:[3.4,0,-2],light:'majakkapisteen lämmin valo',motion:'valopisteen rajattu eteneminen'},
 {id:'UM-13',landmark:'kulmatuulen loiva kallio',landmarkAt:[-3.4,0,-2.5],support:'tuuliviiri ja rakennuskaari',supportAt:[3.5,0,-2],light:'kirkas niemimaan ilma',motion:'viirin hidas kääntö'},
 {id:'UM-14',landmark:'köysisillan kallioranta',landmarkAt:[-3.5,0,-2.6],support:'tutkimuskori ja vastarannan merkkivalo',supportAt:[3.5,0,-2],light:'kahden kallion välinen hajavalo',motion:'korin lyhyt hallittu siirtymä'},
 {id:'UM-15',landmark:'kehämäinen havaintopiha',landmarkAt:[-3.5,0,-2.5],support:'keskusmerkki ja reunavalon nauha',supportAt:[3.4,0,-2],light:'yön tähtiheijastus',motion:'valon hidas kulku kehällä'},
 {id:'UM-16',landmark:'leiripihan rajaköysi',landmarkAt:[-3.5,0,-2.5],support:'aluepeite ja ruutumatto',supportAt:[3.4,0,-2],light:'notkelman lämmin valo',motion:'peitteen rajattu avaus'},
 {id:'UM-17',landmark:'kuppelikaupungin pienoissatama',landmarkAt:[-3.5,0,-2.5],support:'avautuva verkko ja läpinäkyvä kerros',supportAt:[3.5,0,-2],light:'kupolin pehmeä tutkimusvalo',motion:'verkon hidas avautuminen'},
 {id:'UM-18',landmark:'säähavaintojen satamakatos',landmarkAt:[-3.5,0,-2.5],support:'havaintolappujen yhteinen pöytä',supportAt:[3.5,0,-2],light:'avoin säävalo',motion:'yhden lapun saapuminen'},
 {id:'SCI01',landmark:'kirkkaan laguuni-ikkunan pisara',landmarkAt:[-3.5,0,-2.5],support:'havaintovihko ja rantakivet',supportAt:[3.4,0,-2],light:'kirkas vedenalainen valo',motion:'yhden renkaan laajeneminen'},
 {id:'SCI02',landmark:'ponttonien tutkimusasema',landmarkAt:[-3.5,0,-2.5],support:'tuuliviiri ja jakautuvat tutkimusuomat',supportAt:[3.5,0,-2],light:'aseman selkeä päivänvalo',motion:'viirin pieni suunnanvaihto'},
 {id:'SCI03',landmark:'viestiveneiden laituri',landmarkAt:[-3.5,0,-2.5],support:'mittakivi ja majakan matkaviiva',supportAt:[3.4,0,-2],light:'lahden kirkas aamu',motion:'veneen rajattu eteneminen'},
 {id:'SCI04',landmark:'lämpövuoren huurteinen ikkuna',landmarkAt:[-3.5,0,-2.6],support:'retkiaseman materiaalipolku',supportAt:[3.4,0,-2],light:'viileä vuori ja lämmin sisävalo',motion:'ikkunaan kirkastuva pieni alue'},
 {id:'SCI05',landmark:'valon ja kaiun luolan suu',landmarkAt:[-3.5,0,-2.6],support:'varjoseinä ja värähtelyrengas',supportAt:[3.4,0,-2],light:'luolan himmeä lämmin valo',motion:'yksi rajattu värähtely'},
 {id:'SCI06',landmark:'taivaan karttahuone',landmarkAt:[-3.5,0,-2.5],support:'kotisaaren lyhty ja pyöreä tähtikartta',supportAt:[3.5,0,-2],light:'sininen yö ja lämmin kotilyhty',motion:'taivaskartan hidas kierto'},
 {id:'SCI07',landmark:'aineiden rantapaja',landmarkAt:[-3.5,0,-2.5],support:'sileä puu ja nimetty materiaalinäyte',supportAt:[3.5,0,-2],light:'veden kirkas heijastus',motion:'näytteen rajattu nosto'},
 {id:'SCI08',landmark:'turvaniemen leveä yhteinen puu',landmarkAt:[-3.5,0,-2.6],support:'rauhallinen kokoontumispaikka',supportAt:[3.4,0,-2],light:'puun lämmin hajavarjo',motion:'yksittäisen lehden pieni liike'},
 {id:'SCI09',landmark:'mittausvuoren majakkaikkuna',landmarkAt:[-3.5,0,-2.6],support:'mittakortti ja kysymysmerkki',supportAt:[3.4,0,-2],light:'ikkunan tarkka valoviiva',motion:'ikkunavalon rajattu siirtymä'},
 {id:'SCI10',landmark:'köysiradan vuoristopiste',landmarkAt:[-3.5,0,-2.6],support:'retkikori ja nimetty voimamallin paikka',supportAt:[3.5,0,-2],light:'kallioiden pehmeä valo',motion:'korin domainmallin määräämä liike'},
 {id:'SCI11',landmark:'tuulien voimaluodon majakka',landmarkAt:[-3.5,0,-2.5],support:'pimeänä säilyvä pesimäluoto',supportAt:[3.5,0,-2],light:'majakan valo ja rauhallinen varjosaari',motion:'hidas rajattu tuuliviiri'},
 {id:'SCI12',landmark:'valomerkkien kaksi laituria',landmarkAt:[-3.5,0,-2.5],support:'vastarannan toinen valopaikka',supportAt:[3.5,0,-2],light:'lämmin satamalyhty',motion:'mallin sallima valon muutos'},
 {id:'SCI13',landmark:'näkymättömien viestien havaintoikkuna',landmarkAt:[-3.5,0,-2.5],support:'auki pysyvä mallin selite',supportAt:[3.4,0,-2],light:'observatorion himmeä reunavalo',motion:'nimetyn ikkunan avaus'},
 {id:'SCI14',landmark:'Sulkan lasilaboratorio',landmarkAt:[-3.5,0,-2.5],support:'nimetty näyte ja tutkimuspolku',supportAt:[3.4,0,-2],light:'kasvihuonemainen merivalo',motion:'näytteen rauhallinen siirtymä'},
 {id:'SCI15',landmark:'kristallilahden erotusasema',landmarkAt:[-3.5,0,-2.5],support:'nimetyn kiteen mallipaikka',supportAt:[3.4,0,-2],light:'kirkas vedenalainen heijastus',motion:'kiteen hidas paljastus'},
 {id:'SCI16',landmark:'pienten rakenteiden luola',landmarkAt:[-3.5,0,-2.6],support:'rinnakkaiset havainto- ja malli-ikkunat',supportAt:[3.5,0,-2],light:'pehmeä luolavalo',motion:'ikkunoiden hallittu vaihto'},
 {id:'SCI17',landmark:'ainekirjainten kirjasto',landmarkAt:[-3.5,0,-2.6],support:'merkintälapun paikka ja kirjastoikkuna',supportAt:[3.4,0,-2],light:'kuivan luolan lämmin valo',motion:'yhden nimilapun siirto'},
 {id:'SCI18',landmark:'muutosten kidepaja',landmarkAt:[-3.5,0,-2.6],support:'suljettu virtuaalikammio ja ainetili',supportAt:[3.4,0,-2],light:'hiljainen maanalainen heijastus',motion:'vain annetun mallin vaihe'},
 {id:'SCI19',landmark:'lähteiden tutkimuspuutarha',landmarkAt:[-3.5,0,-2.5],support:'kiviuoma ja erilliset näytepullot',supportAt:[3.4,0,-2],light:'puutarhan kirkas päivänvalo',motion:'veden vähäinen taustaliike'},
 {id:'SCI20',landmark:'kiertosaaren vuoripuro',landmarkAt:[-3.5,0,-2.6],support:'metsäpolku ja nimettyjen kiertojen kartat',supportAt:[3.5,0,-2],light:'pilven pehmentämä ranta',motion:'hidas pilven varjo'},
 {id:'SCI21',landmark:'hiilipuutarhan pyöreä eväspöytä',landmarkAt:[-3.5,0,-2.5],support:'eri aineryhmien rinnakkaiset tunnukset',supportAt:[3.4,0,-2],light:'rauhallinen puutarhavalo',motion:'yhden lehden hidas heilunta'},
 {id:'SCI22',landmark:'uudelleen rakentuvan rannan telakka',landmarkAt:[-3.5,0,-2.5],support:'korjattu vene ja näkyvä sauma',supportAt:[3.5,0,-2],light:'korjauspajan iltavalo',motion:'vene keinuu kerran rauhallisesti'},
];
