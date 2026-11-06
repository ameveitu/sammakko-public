import * as THREE from 'three';
import { familyWorldPilots } from '../content/family-worlds';
import { familyAnchorNodes } from './family-worlds/anchors';
import { familyMilieus, milieuAtmosphere } from './family-worlds/milieus';

export const FAMILY_IMPLEMENTED_EFFECT_IDS = Object.freeze([
  "world.M-TH-01.resolved",
  "world.M-PS-02.resolved",
  "world.M-NUM-13.resolved",
  "world.M-NUM-16.resolved",
  "world.M-ALG-09.resolved",
  "world.M-DATA-12.resolved",
  "world.M-WORK-02.resolved",
  "world.M-DATA-02.resolved",
  "world.M-PROG-03.resolved",
  "world.M-PROB-05.resolved",
  "world.M-TH-04.resolved",
  "world.M-TH-05.resolved",
  "world.SCI-ENV-EXP-01.resolved",
  "world.SCI-ENV-SAFE-01.resolved",
  "world.CHEM79-DATA-01.resolved",
  "world.CHEM79-SUSTAIN.resolved",
  "world.PHY79-RAD-SAFE.resolved",
  "world.PHY79-ENERGY-IMPACT.resolved",
  "world.M79-PROOF-01.resolved",
  "world.M79-SQRT-03.resolved",
  "world.M79-POWER-ZERO.resolved",
  "world.M79-LOGIC-02.resolved",
  "world.M79-PROG-02.resolved",
  "world.M79-TECH-01.resolved",
  "world.SCI-ENV-CONCL-01.resolved",
  "world.SCI-ENV-EVAL-01.resolved",
  "world.CHEM79-OBS-01.resolved",
  "world.PHY79-CONCL-01.resolved",
  "world.PHY79-SAFE-01.resolved",
  "world.PHY79-ELEC-SAFE.resolved",
  "world.ENV-PHY-LIGHT-01.resolved",
  "world.PHY79-SERIES.resolved",
  "world.PHY79-WORK-CALC.resolved",
  "world.PHY79-POWER-CALC.resolved",
  "world.M79-PRIMEFACT-01.resolved",
  "world.M79-CONE-SA.resolved",
  "world.M79-THALES.resolved",
  "world.M79-CYL-SA.resolved",
  "world.M79-SPHERE-SA.resolved",
  "world.CHEM79-STATECHANGE.resolved",
  "world.M79-TEXT-02.resolved",
  "world.M79-PCT-BASE.resolved",
  "world.M79-POLY-MUL.resolved",
  "world.M79-EXPR-SIMPLIFY.resolved",
  "world.M79-PARABOLA-GRAPH.resolved",
  "world.M79-POWER-PROD.resolved",
  "world.M79-POWER-SIMPLIFY.resolved",
  "world.M79-TRIG-CALC.resolved",
  "world.M-FRAC-14.resolved",
  "world.M-GEO-16.resolved",
  "world.M-TH-06.resolved",
  "world.M-TH-03.resolved",
  "world.M-TH-08.resolved",
  "world.M-WORK-03.resolved",
  "world.CHEM79-CONCL-01.resolved",
  "world.CHEM79-QUESTION-01.resolved",
  "world.PHY79-QUESTION-01.resolved",
  "world.PHY79-PLAN-01.resolved",
  "world.M-PS-01.resolved",
  "world.M-PS-04.resolved",
  "world.M-REP-03.resolved",
  "world.M-REP-04.resolved",
  "world.M-MUL-02.resolved",
  "world.M-NUM-14.resolved",
  "world.PHY79-POTENTIAL.resolved",
  "world.PHY79-GENERATION.resolved",
  "world.M79-OPPOSITE-01.resolved",
  "world.M79-ABS-01.resolved",
  "world.M79-EQ1-CHECK.resolved",
  "world.M79-PCT-CHANGED.resolved",
  "world.M79-SYSTEM-ALG.resolved",
  "world.M-PS-06.resolved",
  "world.M-TH-07.resolved",
  "world.M79-CONSTRUCT.resolved",
  "world.M79-PROP-SOLVE.resolved",
  "world.CHEM79-EXOENDO.resolved",
  "world.CHEM79-CARBON-PHOTO.resolved",
  "world.ENV-CHEM-WATERCYCLE-01.resolved",
  "world.CHEM79-NUTRIENT-PROT.resolved",
  "world.M-TH-02.resolved",
  "world.M-WORK-01.resolved",
  "world.CHEM79-ELEM-PROP.resolved",
  "world.CHEM79-NUTRIENT-CARB.resolved",
  "world.M-GEO-18.resolved",
  "world.M79-CONE-V.resolved",
  "world.PHY79-HEAT-MECH.resolved",
  "world.CHEM79-CHEMICAL-SAFE.resolved",
  "world.PHY79-SI-01.resolved",
  "world.PHY79-UNIVERSE-SCALE.resolved",
  "world.M-MEAS-10.resolved",
  "world.M-MEAS-07.resolved",
  "world.M79-PYTH-CALC.resolved",
  "world.M-GEO-07.resolved",
  "world.M79-CYL-V.resolved",
  "world.M79-SPHERE-V.resolved",
  "world.M-UNIT-06.resolved",
  "world.M-ADD-COMM.resolved",
  "world.M-ADD-ASSOC.resolved",
  "world.M-MUL-ASSOC.resolved",
  "world.M-MUL-COMM.resolved",
  "world.M-NUM-15.resolved",
  "world.M-NUM-17.resolved",
  "world.M-NUM-11.resolved",
  "world.M-FRAC-08.resolved",
  "world.M-FRAC-09.resolved",
  "world.M-FRAC-16.resolved",
  "world.M-FRAC-05.resolved",
  "world.M-FRAC-10.resolved",
  "world.M-MEAS-12.resolved",
  "world.M-MEAS-13.resolved",
  "world.M-MEAS-14.resolved",
  "world.M-MEAS-16.resolved",
  "world.M-NEG-03.resolved",
  "world.M-PROB-03.resolved",
  "world.M-EST-02.resolved",
  "world.M-SYM-03.resolved",
  "world.M79-ARC.resolved",
  "world.M79-SECTOR.resolved",
  "world.M79-SLOPE.resolved",
  "world.M79-ROUND-01.resolved",
  "world.M79-PCT-PP.resolved",
  "world.M79-PCT-SHARE.resolved",
  "world.M79-PCT-COMP.resolved",
  "world.M79-UNIT-LIN.resolved",
  "world.M79-UNIT-AREA.resolved",
  "world.M79-PROB-EMP.resolved",
  "world.M79-POWER-NEG.resolved",
  "world.M79-POWER-QUOT.resolved",
  "world.M79-DEC-ADD-SUB.resolved",
  "world.M79-DEC-DIV.resolved",
  "world.M79-DEC-MUL.resolved",
  "world.M79-FRAC-DIV.resolved",
  "world.M79-TEXT-01.resolved",
  "world.M79-DIRECTPROP.resolved",
  "world.M79-INVERSEPROP.resolved",
  "world.M79-GRAPH-MONO.resolved",
  "world.M-GEO-03.resolved",
  "world.M-DATA-05.resolved",
  "world.M-DATA-08.resolved",
  "world.M-DATA-11.resolved",
  "world.M-GEO-23.resolved",
  "world.M-GEO-24.resolved",
  "world.M-GEO-08.resolved",
  "world.M-GEO-09.resolved",
  "world.M-GEO-12.resolved",
  "world.M-DIVIS-03.resolved",
  "world.M-DIVIS-02.resolved",
  "world.M-DIV-FACT-01.resolved",
  "world.M-NUM-04.resolved",
  "world.M-NUM-05.resolved",
  "world.M-NEG-04.resolved",
  "world.M-ALG-02.resolved",
  "world.M-FRAC-04.resolved",
  "world.M-NUM-09.resolved",
  "world.M-NUM-12.resolved",
  "world.M-DEC-05.resolved",
  "world.M-PS-03.resolved",
  "world.M-PS-05.resolved",
  "world.M-REP-01.resolved",
  "world.M-REP-05.resolved",
  "world.M-MENTAL-01.resolved",
  "world.M-ADD-SUB-SELECT.resolved",
  "world.M-EXPR-01.resolved",
  "world.M-WRADD.resolved",
  "world.M-WRSUB.resolved",
  "world.M-WRMUL.resolved",
  "world.M-WRDIV.resolved",
  "world.M-SYM-01.resolved",
  "world.M-SYM-02.resolved",
  "world.M-SCALE-02.resolved",
  "world.M-DEC-06.resolved",
  "world.M-TIME-02.resolved",
  "world.M-UNIT-03.resolved",
  "world.M-UNIT-05.resolved",
  "world.M-STAT-01.resolved",
  "world.M-STAT-02.resolved",
  "world.M-PROB-06.resolved",
  "world.PHY79-SUPPORT.resolved",
  "world.PHY79-WEIGHT.resolved",
  "world.PHY79-FRICTION.resolved",
  "world.PHY79-KINETIC.resolved",
  "world.PHY79-ELEC-ENERGY.resolved",
  "world.CHEM79-INDICATOR.resolved",
  "world.CHEM79-PH.resolved",
  "world.CHEM79-CARBON-BURN.resolved",
  "world.CHEM79-ELECTRON.resolved",
  "world.CHEM79-NEUTRON.resolved",
  "world.M-CALC-STRAT.resolved",
  "world.M-ALG-08.resolved",
  "world.M79-CONG-CRIT.resolved",
  "world.M79-CURVE.resolved",
  "world.M79-DIAGRAM-INTERP.resolved",
  "world.M79-DIAGRAM-PROD.resolved",
  "world.M79-INT-DIV.resolved",
  "world.M79-INT-MUL.resolved",
  "world.M79-INTERCEPT.resolved",
  "world.M79-MEAN.resolved",
  "world.ENV-PHY-DEVICE-01.resolved",
  "world.M79-MEDIAN.resolved",
  "world.M79-MODE.resolved",
  "world.M79-SPREAD.resolved",
  "world.M79-PROB-CLASSIC.resolved",
  "world.M79-REAL-02.resolved",
  "world.M79-RAY.resolved",
  "world.M79-SIM-CRIT.resolved",
  "world.M79-SIMILAR-SCALE.resolved",
  "world.M79-UNIT-VOL.resolved",
  "world.M79-EXPR-EVAL.resolved",
  "world.M79-POLY-ANGLES.resolved",
  "world.M79-POLY-PERIM.resolved",
  "world.M79-EQ1-FORM.resolved",
  "world.M79-INEQ-SOLVE.resolved",
  "world.M79-TRI-ANGLE-SUM.resolved",
  "world.M79-ANGLE-REL.resolved",
  "world.CHEM79-SUBSCRIPT.resolved",
  "world.CHEM79-MIX-HOM.resolved",
  "world.CHEM79-SEPARATE-02.resolved",
  "world.CHEM79-WATERFAT-SOL.resolved",
  "world.CHEM79-PERIOD-GROUP.resolved",
  "world.M-PROG-07.resolved",
  "world.M79-SEQ-01.resolved",
  "world.M79-TRIG-01.resolved",
  "world.M79-TRUTH-01.resolved",
  "world.M79-POLY-ADD.resolved",
  "world.M79-POLY-SUB.resolved",
  "world.M79-ZERO.resolved",
  "world.PHY79-CHARGING.resolved",
  "world.ENV-PHY-SOUND-01.resolved",
  "world.ENV-PHY-CAUSE-MOTION-01.resolved",
  "world.PHY79-ACCEL-CALC.resolved",
  "world.PHY79-ACCEL-GRAPH.resolved",
  "world.PHY79-SPEED-REARR.resolved",
  "world.PHY79-SPEED-MIXED.resolved",
  "world.PHY79-ST-GRAPH.resolved",
  "world.PHY79-VT-GRAPH.resolved",
  "world.PHY79-PREDICT-01.resolved",
  "world.SCI-ENV-OBS-01.resolved",
  "world.PHY79-PREC-01.resolved",
  "world.CHEM79-CONC-COMP.resolved",
  "world.CHEM79-NUTRIENT-FAT.resolved",
  "world.CHEM79-ORG-GROUP.resolved",
  "world.CHEM79-ATOMICNUM.resolved",
  "world.CHEM79-REACTION-MODEL.resolved",
  "world.CHEM79-SCALE.resolved",
  "world.CHEM79-RATE-CONC.resolved",
  "world.CHEM79-RATE-SURF.resolved",
  "world.CHEM79-RATE-TEMP.resolved",
  "world.CHEM79-LAB-01.resolved",
  "world.CHEM79-MEAS-01.resolved",
  "world.PHY79-OHM.resolved",
  "world.M79-PYTH-CONVERSE.resolved",
  "world.M79-QUAD-INCOMP-02.resolved",
  "world.M79-SYSTEM-GRAPH.resolved",
  "world.M79-COMB-01.resolved",
  "world.CHEM79-BALANCE.resolved",
  "world.CHEM79-CONC-CALC.resolved"
]);
const outcomeFamily = {
  "M-TH-01": "LM01",
  "M-PS-02": "LM02",
  "M-NUM-13": "LM03",
  "M-NUM-16": "LM04",
  "M-ALG-09": "LM11",
  "M-DATA-12": "LM20",
  "M-WORK-02": "LM01",
  "M-DATA-02": "LM20",
  "M-PROG-03": "LM22",
  "M-PROB-05": "LM21",
  "M-TH-04": "LM01",
  "M-TH-05": "LM01",
  "SCI-ENV-EXP-01": "SCI02",
  "SCI-ENV-SAFE-01": "SCI08",
  "CHEM79-DATA-01": "SCI14",
  "CHEM79-SUSTAIN": "SCI22",
  "PHY79-RAD-SAFE": "SCI13",
  "PHY79-ENERGY-IMPACT": "SCI11",
  "M79-PROOF-01": "UM-01",
  "M79-SQRT-03": "UM-06",
  "M79-POWER-ZERO": "UM-05",
  "M79-LOGIC-02": "UM-01",
  "M79-PROG-02": "UM-02",
  "M79-TECH-01": "UM-02",
  "SCI-ENV-CONCL-01": "SCI02",
  "SCI-ENV-EVAL-01": "SCI02",
  "CHEM79-OBS-01": "SCI14",
  "PHY79-CONCL-01": "SCI09",
  "PHY79-SAFE-01": "SCI08",
  "PHY79-ELEC-SAFE": "SCI08",
  "ENV-PHY-LIGHT-01": "SCI05",
  "PHY79-SERIES": "SCI12",
  "PHY79-WORK-CALC": "SCI10",
  "PHY79-POWER-CALC": "SCI10",
  "M79-PRIMEFACT-01": "UM-05",
  "M79-CONE-SA": "UM-17",
  "M79-THALES": "UM-15",
  "M79-CYL-SA": "UM-17",
  "M79-SPHERE-SA": "UM-17",
  "CHEM79-STATECHANGE": "SCI16",
  "M79-TEXT-02": "UM-01",
  "M79-PCT-BASE": "UM-07",
  "M79-POLY-MUL": "UM-08",
  "M79-EXPR-SIMPLIFY": "UM-08",
  "M79-PARABOLA-GRAPH": "UM-11",
  "M79-POWER-PROD": "UM-05",
  "M79-POWER-SIMPLIFY": "UM-05",
  "M79-TRIG-CALC": "UM-14",
  "M-FRAC-14": "LM08",
  "M-GEO-16": "LM14",
  "M-TH-06": "LM01",
  "M-TH-03": "LM01",
  "M-TH-08": "LM01",
  "M-WORK-03": "LM01",
  "CHEM79-CONCL-01": "SCI14",
  "CHEM79-QUESTION-01": "SCI14",
  "PHY79-QUESTION-01": "SCI09",
  "PHY79-PLAN-01": "SCI09",
  "M-PS-01": "LM02",
  "M-PS-04": "LM02",
  "M-REP-03": "LM02",
  "M-REP-04": "LM02",
  "M-MUL-02": "LM06",
  "M-NUM-14": "LM03",
  "PHY79-POTENTIAL": "SCI11",
  "PHY79-GENERATION": "SCI12",
  "M79-OPPOSITE-01": "UM-03",
  "M79-ABS-01": "UM-03",
  "M79-EQ1-CHECK": "UM-09",
  "M79-PCT-CHANGED": "UM-07",
  "M79-SYSTEM-ALG": "UM-10",
  "M-PS-06": "LM02",
  "M-TH-07": "LM01",
  "M79-CONSTRUCT": "UM-13",
  "M79-PROP-SOLVE": "UM-10",
  "CHEM79-EXOENDO": "SCI18",
  "CHEM79-CARBON-PHOTO": "SCI20",
  "ENV-CHEM-WATERCYCLE-01": "SCI20",
  "CHEM79-NUTRIENT-PROT": "SCI21",
  "M-TH-02": "LM01",
  "M-WORK-01": "LM01",
  "CHEM79-ELEM-PROP": "SCI16",
  "CHEM79-NUTRIENT-CARB": "SCI21",
  "M-GEO-18": "LM14",
  "M79-CONE-V": "UM-17",
  "PHY79-HEAT-MECH": "SCI04",
  "CHEM79-CHEMICAL-SAFE": "SCI08",
  "PHY79-SI-01": "SCI09",
  "PHY79-UNIVERSE-SCALE": "SCI06",
  "M-MEAS-10": "LM18",
  "M-MEAS-07": "LM18",
  "M79-PYTH-CALC": "UM-14",
  "M-GEO-07": "LM14",
  "M79-CYL-V": "UM-17",
  "M79-SPHERE-V": "UM-17",
  "M-UNIT-06": "LM19",
  "M-ADD-COMM": "LM05",
  "M-ADD-ASSOC": "LM05",
  "M-MUL-ASSOC": "LM06",
  "M-MUL-COMM": "LM06",
  "M-NUM-15": "LM04",
  "M-NUM-17": "LM04",
  "M-NUM-11": "LM03",
  "M-FRAC-08": "LM08",
  "M-FRAC-09": "LM08",
  "M-FRAC-16": "LM08",
  "M-FRAC-05": "LM08",
  "M-FRAC-10": "LM08",
  "M-MEAS-12": "LM18",
  "M-MEAS-13": "LM18",
  "M-MEAS-14": "LM18",
  "M-MEAS-16": "LM18",
  "M-NEG-03": "LM10",
  "M-PROB-03": "LM21",
  "M-EST-02": "LM07",
  "M-SYM-03": "LM15",
  "M79-ARC": "UM-15",
  "M79-SECTOR": "UM-15",
  "M79-SLOPE": "UM-12",
  "M79-ROUND-01": "UM-06",
  "M79-PCT-PP": "UM-07",
  "M79-PCT-SHARE": "UM-07",
  "M79-PCT-COMP": "UM-07",
  "M79-UNIT-LIN": "UM-16",
  "M79-UNIT-AREA": "UM-16",
  "M79-PROB-EMP": "UM-18",
  "M79-POWER-NEG": "UM-05",
  "M79-POWER-QUOT": "UM-05",
  "M79-DEC-ADD-SUB": "UM-04",
  "M79-DEC-DIV": "UM-04",
  "M79-DEC-MUL": "UM-04",
  "M79-FRAC-DIV": "UM-04",
  "M79-TEXT-01": "UM-01",
  "M79-DIRECTPROP": "UM-10",
  "M79-INVERSEPROP": "UM-10",
  "M79-GRAPH-MONO": "UM-11",
  "M-GEO-03": "LM12",
  "M-DATA-05": "LM20",
  "M-DATA-08": "LM20",
  "M-DATA-11": "LM20",
  "M-GEO-23": "LM15",
  "M-GEO-24": "LM15",
  "M-GEO-08": "LM14",
  "M-GEO-09": "LM14",
  "M-GEO-12": "LM13",
  "M-DIVIS-03": "LM06",
  "M-DIVIS-02": "LM06",
  "M-DIV-FACT-01": "LM06",
  "M-NUM-04": "LM03",
  "M-NUM-05": "LM03",
  "M-NEG-04": "LM10",
  "M-ALG-02": "LM11",
  "M-FRAC-04": "LM08",
  "M-NUM-09": "LM03",
  "M-NUM-12": "LM03",
  "M-DEC-05": "LM09",
  "M-PS-03": "LM02",
  "M-PS-05": "LM02",
  "M-REP-01": "LM02",
  "M-REP-05": "LM02",
  "M-MENTAL-01": "LM05",
  "M-ADD-SUB-SELECT": "LM05",
  "M-EXPR-01": "LM07",
  "M-WRADD": "LM07",
  "M-WRSUB": "LM07",
  "M-WRMUL": "LM07",
  "M-WRDIV": "LM07",
  "M-SYM-01": "LM15",
  "M-SYM-02": "LM15",
  "M-SCALE-02": "LM16",
  "M-DEC-06": "LM09",
  "M-TIME-02": "LM19",
  "M-UNIT-03": "LM19",
  "M-UNIT-05": "LM19",
  "M-STAT-01": "LM21",
  "M-STAT-02": "LM21",
  "M-PROB-06": "LM21",
  "PHY79-SUPPORT": "SCI10",
  "PHY79-WEIGHT": "SCI10",
  "PHY79-FRICTION": "SCI10",
  "PHY79-KINETIC": "SCI11",
  "PHY79-ELEC-ENERGY": "SCI12",
  "CHEM79-INDICATOR": "SCI19",
  "CHEM79-PH": "SCI19",
  "CHEM79-CARBON-BURN": "SCI20",
  "CHEM79-ELECTRON": "SCI16",
  "CHEM79-NEUTRON": "SCI16",
  "M-CALC-STRAT": "LM07",
  "M-ALG-08": "LM11",
  "M79-CONG-CRIT": "UM-13",
  "M79-CURVE": "UM-13",
  "M79-DIAGRAM-INTERP": "UM-18",
  "M79-DIAGRAM-PROD": "UM-18",
  "M79-INT-DIV": "UM-03",
  "M79-INT-MUL": "UM-03",
  "M79-INTERCEPT": "UM-12",
  "M79-MEAN": "UM-18",
  "ENV-PHY-DEVICE-01": "SCI12",
  "M79-MEDIAN": "UM-18",
  "M79-MODE": "UM-18",
  "M79-SPREAD": "UM-18",
  "M79-PROB-CLASSIC": "UM-18",
  "M79-REAL-02": "UM-06",
  "M79-RAY": "UM-13",
  "M79-SIM-CRIT": "UM-13",
  "M79-SIMILAR-SCALE": "UM-13",
  "M79-UNIT-VOL": "UM-17",
  "M79-EXPR-EVAL": "UM-08",
  "M79-POLY-ANGLES": "UM-13",
  "M79-POLY-PERIM": "UM-16",
  "M79-EQ1-FORM": "UM-09",
  "M79-INEQ-SOLVE": "UM-09",
  "M79-TRI-ANGLE-SUM": "UM-13",
  "M79-ANGLE-REL": "UM-13",
  "CHEM79-SUBSCRIPT": "SCI17",
  "CHEM79-MIX-HOM": "SCI15",
  "CHEM79-SEPARATE-02": "SCI15",
  "CHEM79-WATERFAT-SOL": "SCI15",
  "CHEM79-PERIOD-GROUP": "SCI16",
  "M-PROG-07": "LM22",
  "M79-SEQ-01": "UM-11",
  "M79-TRIG-01": "UM-14",
  "M79-TRUTH-01": "UM-01",
  "M79-POLY-ADD": "UM-08",
  "M79-POLY-SUB": "UM-08",
  "M79-ZERO": "UM-12",
  "PHY79-CHARGING": "SCI12",
  "ENV-PHY-SOUND-01": "SCI05",
  "ENV-PHY-CAUSE-MOTION-01": "SCI03",
  "PHY79-ACCEL-CALC": "SCI03",
  "PHY79-ACCEL-GRAPH": "SCI03",
  "PHY79-SPEED-REARR": "SCI03",
  "PHY79-SPEED-MIXED": "SCI03",
  "PHY79-ST-GRAPH": "SCI03",
  "PHY79-VT-GRAPH": "SCI03",
  "PHY79-PREDICT-01": "SCI09",
  "SCI-ENV-OBS-01": "SCI01",
  "PHY79-PREC-01": "SCI09",
  "CHEM79-CONC-COMP": "SCI19",
  "CHEM79-NUTRIENT-FAT": "SCI21",
  "CHEM79-ORG-GROUP": "SCI21",
  "CHEM79-ATOMICNUM": "SCI16",
  "CHEM79-REACTION-MODEL": "SCI18",
  "CHEM79-SCALE": "SCI16",
  "CHEM79-RATE-CONC": "SCI18",
  "CHEM79-RATE-SURF": "SCI18",
  "CHEM79-RATE-TEMP": "SCI18",
  "CHEM79-LAB-01": "SCI14",
  "CHEM79-MEAS-01": "SCI14",
  "PHY79-OHM": "SCI12",
  "M79-PYTH-CONVERSE": "UM-14",
  "M79-QUAD-INCOMP-02": "UM-09",
  "M79-SYSTEM-GRAPH": "UM-10",
  "M79-COMB-01": "UM-01",
  "CHEM79-BALANCE": "SCI17",
  "CHEM79-CONC-CALC": "SCI19"
};
const outcomeText = {
  "M-TH-01": "Lehtivene asettuu rantakivien suojaan.",
  "M-PS-02": "Telttaköysi kiinnittyy ja teltta pysyy paikallaan.",
  "M-NUM-13": "Aavan vene saapuu vuoropaikkaansa laiturille.",
  "M-NUM-16": "Lastikirja siirtyy kaislakimppujen varastolle.",
  "M-ALG-09": "Pajan laatikko avautuu rauhallisesti.",
  "M-DATA-12": "Majakan havaintoviesti lähtee rannalle.",
  "M-WORK-02": "Tutkimuspaikka saa oman kysymyskyltin.",
  "M-DATA-02": "Laiturin tapahtumat tallentuvat havaintovihkoon.",
  "M-PROG-03": "Testattu ohje asetetaan lautan ohjetelineeseen.",
  "M-PROB-05": "Luodon leikkiviesti lähtee matkaan.",
  "M-TH-04": "Rantapolun merkit avautuvat levähdyspaikalle.",
  "M-TH-05": "Vene kulkee poukamaan ja jättää vesijäljen.",
  "SCI-ENV-EXP-01": "Mallivene tekee hallitun kaarroksen ja palaa rannalle.",
  "SCI-ENV-SAFE-01": "Yhteinen virtuaalinen tutkimuspiste avautuu.",
  "CHEM79-DATA-01": "Havaintojen näyttelyikkuna avautuu.",
  "CHEM79-SUSTAIN": "Korjaustelakan yhteinen varuste palautuu käyttöön.",
  "PHY79-RAD-SAFE": "Observatorion virtuaalinen kupoli avautuu.",
  "PHY79-ENERGY-IMPACT": "Majakan malli valaistuu ja pesimäluoto pysyy rauhallisena.",
  "M79-PROOF-01": "Pienoissilta kannattelee retkikoria.",
  "M79-SQRT-03": "Katoksen tuet kohtaavat ja lukupaikka saa suojan.",
  "M79-POWER-ZERO": "Yksi koelyhty jää tornin perustaan.",
  "M79-LOGIC-02": "Vastarannan majakka vastaa viestiin.",
  "M79-PROG-02": "Reittivalo ohjaa malliveneen laituriin.",
  "M79-TECH-01": "Yhteinen tutkimuspöytä avautuu.",
  "SCI-ENV-CONCL-01": "Taimikorin uusi lehti avautuu kuvitteellisessa aikasiirrossa.",
  "SCI-ENV-EVAL-01": "Tarkistettu havainto päätyy löytöjen näyttelyyn.",
  "CHEM79-OBS-01": "Virtuaalinäytteen havaintokortti vaihtuu avoimeksi kysymykseksi.",
  "PHY79-CONCL-01": "Tutkimusneuvoston näköalatasanteen malli avautuu.",
  "PHY79-SAFE-01": "Kuvitteellisen tutkimuspaikan havaintoikkuna avautuu.",
  "PHY79-ELEC-SAFE": "Aikuinen on hoitanut kuvitteellisen laituritilanteen; tutkimusreitti avautuu.",
  "ENV-PHY-LIGHT-01": "Valon ja varjon pienoisteatteri avautuu.",
  "PHY79-SERIES": "Virtuaalisen sarjapiirin tutkimus palautuu.",
  "PHY79-WORK-CALC": "Vinssin mallikuorma siirtyy suunnitellusti.",
  "PHY79-POWER-CALC": "Vinssin mallikori nousee tasanteelle.",
  "M79-PRIMEFACT-01": "Kivimerkin osat liittyvät ja karttahuone avautuu.",
  "M79-CONE-SA": "Mallikatos peittää lukupaikan.",
  "M79-THALES": "Observatorion malliin löytyy suorakulmainen merkki.",
  "M79-CYL-SA": "Suojakuoren malli sulkeutuu säiliön ympärille.",
  "M79-SPHERE-SA": "Mallipallo saa pinnan ja kotisaaren merkin.",
  "CHEM79-STATECHANGE": "Virtuaalinen jää muuttuu vesimalliksi.",
  "M79-TEXT-02": "Viestivene saapuu ja nostaa kiitoslipun.",
  "M79-PCT-BASE": "Uusi sopimuslappu korvaa kastuneen.",
  "M79-POLY-MUL": "Yhteinen katos avautuu työpaikan suojaksi.",
  "M79-EXPR-SIMPLIFY": "Tiivis piirustus asettuu puukylttiin.",
  "M79-PARABOLA-GRAPH": "Kasvihuoneen ikkuna avautuu ja sisäpihalle tulee valoa.",
  "M79-POWER-PROD": "Yhdistetty valokuvio syttyy pajan holviin.",
  "M79-POWER-SIMPLIFY": "Tähtiviesti pääsee observatorion viestitelineeseen.",
  "M79-TRIG-CALC": "Kallion merkkivalo vastaa retkiryhmälle.",
  "M-FRAC-14": "Pienoismallin putous avautuu.",
  "M-GEO-16": "Majakan torni asettuu paikalleen ja sen ikkuna valaistuu.",
  "M-TH-06": "Ystävät kiinnittävät malliveneen rantaan.",
  "M-TH-03": "Keppipolku avautuu veneen luo.",
  "M-TH-08": "Vihkoon ilmestyy yhteinen reittimerkki.",
  "M-WORK-03": "Polun opasteen rinnalle jää kysymysmerkki.",
  "CHEM79-CONCL-01": "Tutkimusraportti avautuu näyttelytelineeseen.",
  "CHEM79-QUESTION-01": "Oman kysymyksen virtuaalinen tutkimusikkuna avautuu.",
  "PHY79-QUESTION-01": "Tuulitunnelin kysymysikkuna avautuu.",
  "PHY79-PLAN-01": "Vertailun kaksi virtuaalista tutkimuspaikkaa avautuvat.",
  "M-PS-01": "Köyden suunnitelma avautuu tutkimustelineeseen.",
  "M-PS-04": "Kaksi selityskorttia asettuu yhteiselle telttakankaalle.",
  "M-REP-03": "Havaintovihko kääntyy kuulijaa kohti.",
  "M-REP-04": "Lyhyt viestilappu siirtyy laiturin telineeseen.",
  "M-MUL-02": "Laivueen suunnitelma asettuu työohjeeseen.",
  "M-NUM-14": "Mittalappu siirtyy rakennussuunnitelman viereen.",
  "PHY79-POTENTIAL": "Korin korkeus ja valittu vertailutaso näkyvät samassa mallissa.",
  "PHY79-GENERATION": "Virtuaaligeneraattorin tutkimuspaikka palautuu.",
  "M79-OPPOSITE-01": "Vastakkaiset mallimerkit kohtaavat nollalaiturissa.",
  "M79-ABS-01": "Ystävien kaksi merkkiä ovat yhtä kaukana kotipisteestä.",
  "M79-EQ1-CHECK": "Tarkistettu koesulku avautuu.",
  "M79-PCT-CHANGED": "Sivuportin pienoismalli asettuu paikalleen.",
  "M79-SYSTEM-ALG": "Yhteisen sopimuksen koesulku avautuu.",
  "M-PS-06": "Telttakylän katkennut mallipolku liittyy laiturille.",
  "M-TH-07": "Rannan pienet viirit asettuvat yhteiseen näyttelyyn.",
  "M79-CONSTRUCT": "Havainnollinen mallikohta asettuu yhtä kauas kahdesta lähtöpisteestä.",
  "M79-PROP-SOLVE": "Pienoissilta liittyy kummallekin rannalle.",
  "CHEM79-EXOENDO": "Mallin nuolet erottavat ympäristöön ja reaktioon siirtyvän energian.",
  "CHEM79-CARBON-PHOTO": "Hiilen mallireitti kulkee ilmasta kasvin lehteen.",
  "ENV-CHEM-WATERCYCLE-01": "Veden seurantamallin tutkimuspaikka jää näkyviin.",
  "CHEM79-NUTRIENT-PROT": "Proteiinin ketjumalli avautuu näyttelyyn.",
  "M-TH-02": "Lehdet muodostavat suojan rantapenkille.",
  "M-WORK-01": "Havaintokortti asettuu pöydälle ja köysi yltää malliveneeseen.",
  "CHEM79-ELEM-PROP": "Tutkimusgallerian näytevitriini avautuu.",
  "CHEM79-NUTRIENT-CARB": "Hiilihydraattien pieni näyttelypöytä avautuu.",
  "M-GEO-18": "Vuoristomajan katos antaa lyhdylle suojan.",
  "M79-CONE-V": "Suppilovaraston malli liittyy pajan vesiuomaan.",
  "PHY79-HEAT-MECH": "Retkiaseman eväsliina avautuu.",
  "CHEM79-CHEMICAL-SAFE": "Kuvitteellisen varaston ovi sulkeutuu aikuisen tarkistuksen jälkeen.",
  "PHY79-SI-01": "Tutkimusviesti kulkee majakan ja vastarannan välillä.",
  "PHY79-UNIVERSE-SCALE": "Tähtikartalle avautuu uusi tutkimuskysymys.",
  "M-MEAS-10": "Retkikannun mallitäyttö asettuu mittauksen mukaiseen tasoon.",
  "M-MEAS-07": "Punnituksen malli asettuu mittauspaikalle.",
  "M79-PYTH-CALC": "Malliköysi liittyy kahden tasanteen väliin.",
  "M-GEO-07": "Rakennelman pienoismalli asettuu paikalleen.",
  "M79-CYL-V": "Säiliön pienoismalli liittyy koepuroon.",
  "M79-SPHERE-V": "Pallon sisätilan pienoismalli asettuu näyttelyyn.",
  "M-UNIT-06": "Mittapöydän kuutiomalli näyttää toteutetun nestemäärän.",
  "M-ADD-COMM": "Kaksi toimitusvenettä kohtaa satamassa.",
  "M-ADD-ASSOC": "Yhteinen lasti asettuu veneen suojaan.",
  "M-MUL-ASSOC": "Eväskori asettuu retkiveneeseen.",
  "M-MUL-COMM": "Lautan malli liittyy laituriin.",
  "M-NUM-15": "Vieraille avautuu rantapenkkien levähdyspaikka.",
  "M-NUM-17": "Yhteisen eväshetken korit saapuvat.",
  "M-NUM-11": "Rantareitin opaste asettuu paikalleen.",
  "M-FRAC-08": "Yhteinen sopimuslappu kiinnittyy pesän opastauluun.",
  "M-FRAC-09": "Sopimuspöytä avautuu neuvottelijoille.",
  "M-FRAC-16": "Sivu-uoman mallin sulku avautuu.",
  "M-FRAC-05": "Varausneuvottelun sopimuskirja avautuu.",
  "M-FRAC-10": "Mallialtaan hanan vipu avautuu.",
  "M-MEAS-12": "Mittaretken välinelaukku avautuu.",
  "M-MEAS-13": "Mittalappu siirtyy vastaanottajan pöydälle.",
  "M-MEAS-14": "Mittausvihko asettuu suurennuslasin alle.",
  "M-MEAS-16": "Suunnitelmapöydän mittakehys asettuu paikalleen.",
  "M-NEG-03": "Virheellinen hälytyslippu lasketaan.",
  "M-PROB-03": "Havaintovuoron viesti lähtee luodolta.",
  "M-EST-02": "Ylimääräistä nollaa kuvaava merkki poistuu lastisuunnitelmasta.",
  "M-SYM-03": "Rantareitin viesti asettuu opasteeseen.",
  "M79-ARC": "Havaintopaikan merkkilyhdyn luukku avautuu.",
  "M79-SECTOR": "Lukupaikan kangassuoja avautuu.",
  "M79-SLOPE": "Majakan suunnittelukortti asettuu telineeseen.",
  "M79-ROUND-01": "Mittaviesti saapuu vastaanottajan laiturille.",
  "M79-PCT-PP": "Sivuhaaran pienoissulku avautuu.",
  "M79-PCT-SHARE": "Sopimuslappu asettuu uoman viereen.",
  "M79-PCT-COMP": "Vertailun tutkimuspöytä avautuu.",
  "M79-UNIT-LIN": "Telakan mittanauha asettuu työpöydälle.",
  "M79-UNIT-AREA": "Puutarhan taimi pääsee kasvupaikalle.",
  "M79-PROB-EMP": "Tutkimusvihko avautuu havaintoillan lopuksi.",
  "M79-POWER-NEG": "Yöaseman polkulyhdyn suoja avautuu.",
  "M79-POWER-QUOT": "Yöpolun viittalyhdyn luukku avautuu.",
  "M79-DEC-ADD-SUB": "Varustelaatikon kansi sulkeutuu.",
  "M79-DEC-DIV": "Reittitolpan viiri asettuu paikalleen.",
  "M79-DEC-MUL": "Purjeen korjauslappu kiinnittyy kankaaseen.",
  "M79-FRAC-DIV": "Retkiviiri nostetaan reittimerkkiin.",
  "M79-TEXT-01": "Varustepaketti saapuu vastaanottajan laiturille.",
  "M79-DIRECTPROP": "Näytekori asettuu kuljetusveneeseen.",
  "M79-INVERSEPROP": "Koemallin säiliön venttiili avautuu.",
  "M79-GRAPH-MONO": "Seurantapaikan viestiteline avautuu.",
  "M-GEO-03": "Rantapenkin kohtaamispaikka avautuu.",
  "M-DATA-05": "Majakan viestiluukku avautuu.",
  "M-DATA-08": "Retkisuunnitelma avautuu tutkimuspöydälle.",
  "M-DATA-11": "Majakan viestiviiri nostetaan.",
  "M-GEO-23": "Kallion opastetaulun kansi avautuu.",
  "M-GEO-24": "Heijastimen tutkimusteline asettuu paikalleen.",
  "M-GEO-08": "Työpajan piirustusteline avautuu.",
  "M-GEO-09": "Varaston hyllyovi avautuu.",
  "M-GEO-12": "Aluksen ikkunan verho avautuu poukamaan.",
  "M-DIVIS-03": "Varaston lastausluukku avautuu.",
  "M-DIVIS-02": "Lastivaraston yhteinen kylttiteline avautuu.",
  "M-DIV-FACT-01": "Lastausveneen kiinnitysköysi irtoaa.",
  "M-NUM-04": "Lautan lastaussilta asettuu laiturille.",
  "M-NUM-05": "Keräyskorin kantokahva nousee.",
  "M-NEG-04": "Mittausvihko avautuu seurantapaikalle.",
  "M-ALG-02": "Pajan pieni mekanismi lähtee liikkeelle.",
  "M-FRAC-04": "Sopimuspaikan muistivihko avautuu.",
  "M-NUM-09": "Sivupolun kaide asettuu paikalleen.",
  "M-NUM-12": "Vastaanottopaikan kangassuoja avautuu.",
  "M-DEC-05": "Viestiaseman lähetysluukku avautuu.",
  "M-PS-03": "Tarvikevene saapuu telttarantaan.",
  "M-PS-05": "Ylimääräinen jättikori poistuu suunnitelmapöydältä.",
  "M-REP-01": "Pöydän eväsliina avautuu.",
  "M-REP-05": "Rakennusvuoron pienoissulku asettuu uomaan.",
  "M-MENTAL-01": "Lastisuunnitelman viesti asettuu sataman telineeseen.",
  "M-ADD-SUB-SELECT": "Lastauspaikan puomi avautuu.",
  "M-EXPR-01": "Laivan lastausvinssi laskee kuorman kannelle.",
  "M-WRADD": "Yhteistilauksen varastoluukku avautuu.",
  "M-WRSUB": "Toimitusvene irtoaa varastorannasta.",
  "M-WRMUL": "Tukikohdan varustepaketti kiinnittyy kuljetukseen.",
  "M-WRDIV": "Jakelupaikan luukku avautuu.",
  "M-SYM-01": "Vesipeilin tutkimusluukku avautuu.",
  "M-SYM-02": "Tuulimerkin tuulisukka nousee.",
  "M-SCALE-02": "Leiripiirroksen opastaulu avautuu.",
  "M-DEC-06": "Viestireitin mittapöydän suojakansi avautuu.",
  "M-TIME-02": "Kohtaamispaikan kellon suoja avautuu.",
  "M-UNIT-03": "Vastaanottorannan pakettiviesti saapuu.",
  "M-UNIT-05": "Tapaamispaikan ajanottoväline asettuu pöydälle.",
  "M-STAT-01": "Retkisuunnitelma asettuu tutkimuslasin alle.",
  "M-STAT-02": "Havaintotaulun suojaluukku avautuu.",
  "M-PROB-06": "Luodon tutkimussuojan ikkuna avautuu.",
  "PHY79-SUPPORT": "Retkilaatikko asettuu pienoistasanteelle.",
  "PHY79-WEIGHT": "Kuorman tutkimuspöytä avautuu.",
  "PHY79-FRICTION": "Kuljetuspinnan tutkimus avautuu.",
  "PHY79-KINETIC": "Koeradan pysäytysalue valmistuu.",
  "PHY79-ELEC-ENERGY": "Valosuunnitelman lyhtykansi avautuu.",
  "CHEM79-INDICATOR": "Näytteen tutkimusikkuna avautuu.",
  "CHEM79-PH": "Puutarhan tutkimuspenkki avautuu.",
  "CHEM79-CARBON-BURN": "Hiilivaraston tutkimuskartta avautuu.",
  "CHEM79-ELECTRON": "Atomimallin elektroniverhon alue avautuu.",
  "CHEM79-NEUTRON": "Neutraalin hiukkasen mallikortti avautuu.",
  "M-CALC-STRAT": "Toimitusvene saapuu laskupajan laituriin.",
  "M-ALG-08": "Pajan mekanismilaatikko avautuu.",
  "M79-CONG-CRIT": "Varaosapaketti saapuu retkimajan laituriin.",
  "M79-CURVE": "Retkikartta avautuu suunnittelupöydälle.",
  "M79-DIAGRAM-INTERP": "Sataman näyttelyluukku avautuu.",
  "M79-DIAGRAM-PROD": "Havaintotaulun suojakansi avautuu.",
  "M79-INT-DIV": "Sumun havaintopoiju nousee näkyviin.",
  "M79-INT-MUL": "Mittalaitteen viestiluukku avautuu.",
  "M79-INTERCEPT": "Veneen koeloki avautuu tarkistuspöydälle.",
  "M79-MEAN": "Sataman havaintoraportti avautuu.",
  "ENV-PHY-DEVICE-01": "Virtuaalilaitteen tutkimuspaikka avautuu.",
  "M79-MEDIAN": "Sataman havaintokirja avautuu.",
  "M79-MODE": "Retkikortti asettuu näyttelytelineeseen.",
  "M79-SPREAD": "Havaintopaikan kangassuoja avautuu.",
  "M79-PROB-CLASSIC": "Havaintovuoron viiri nousee.",
  "M79-REAL-02": "Näköalapoukaman polkusuoja avautuu.",
  "M79-RAY": "Näköalapaikan opasteteline avautuu.",
  "M79-SIM-CRIT": "Pienoismallin näyttelykansi avautuu.",
  "M79-SIMILAR-SCALE": "Näköalapaikan piirustuspöytä avautuu.",
  "M79-UNIT-VOL": "Säiliömallin mittausluukku avautuu.",
  "M79-EXPR-EVAL": "Varustelaatikon nimilappu asettuu paikalleen.",
  "M79-POLY-ANGLES": "Kattosuunnitelman piirustuspöytä avautuu.",
  "M79-POLY-PERIM": "Rajaköyden kerä avautuu retkipaikalle.",
  "M79-EQ1-FORM": "Sulun kysymysteline avautuu.",
  "M79-INEQ-SOLVE": "Koelaitteen tutkimusluukku avautuu.",
  "M79-TRI-ANGLE-SUM": "Majan piirustusteline avautuu.",
  "M79-ANGLE-REL": "Risteyksen opasteteline avautuu.",
  "CHEM79-SUBSCRIPT": "Kaavakirjan sivut avautuvat yhteiseen tarkasteluun.",
  "CHEM79-MIX-HOM": "Seostutkimuksen näyteluukku avautuu.",
  "CHEM79-SEPARATE-02": "Talteenottopöydän suojakansi avautuu.",
  "CHEM79-WATERFAT-SOL": "Jakautumistutkimuksen näyttö avautuu.",
  "CHEM79-PERIOD-GROUP": "Alkuainegallerian näyteluukku avautuu.",
  "M-PROG-07": "Lauttalaiturin toimitusluukku avautuu.",
  "M79-SEQ-01": "Pajan ikkunaluukku avautuu.",
  "M79-TRIG-01": "Sillan mittauskortin suojakansi avautuu.",
  "M79-TRUTH-01": "Näköalapaikan viestiteline avautuu.",
  "M79-POLY-ADD": "Yhteistilauksen lastauspuomi avautuu.",
  "M79-POLY-SUB": "Sopimusvihko asettuu venekuntien pöydälle.",
  "M79-ZERO": "Majakan merkkivalon luukku avautuu.",
  "PHY79-CHARGING": "Varausmallin tutkimuslaite avautuu.",
  "ENV-PHY-SOUND-01": "Konserttiseinän värähtelevä mallilähde avautuu.",
  "ENV-PHY-CAUSE-MOTION-01": "Koeveneen rantakiinnike avautuu.",
  "PHY79-ACCEL-CALC": "Koeveneen lähtölaiturin portti avautuu.",
  "PHY79-ACCEL-GRAPH": "Matkakartan tutkimusteline avautuu.",
  "PHY79-SPEED-REARR": "Viestiveneen tapaamispaikan viiri nousee.",
  "PHY79-SPEED-MIXED": "Saarien yhteinen viestitaulu avautuu.",
  "PHY79-ST-GRAPH": "Eväsniemen levähdyspaikan suoja avautuu.",
  "PHY79-VT-GRAPH": "Matkan havaintolyhdyn luukku avautuu.",
  "PHY79-PREDICT-01": "Ennusteen tutkimuspaikan havaintoluukku avautuu.",
  "SCI-ENV-OBS-01": "Rantajäljen tutkimuslasin suoja avautuu.",
  "PHY79-PREC-01": "Havaintoraportti asettuu tarkistuspöydälle.",
  "CHEM79-CONC-COMP": "Näytteiden vertailupöytä avautuu.",
  "CHEM79-NUTRIENT-FAT": "Evästutkimuksen näyttelyliina avautuu.",
  "CHEM79-ORG-GROUP": "Ravintoainetutkimuksen vitriini avautuu.",
  "CHEM79-ATOMICNUM": "Alkuainegallerian näytevitriini avautuu.",
  "CHEM79-REACTION-MODEL": "Muutosmallin tutkimuskammio avautuu.",
  "CHEM79-SCALE": "Ainetasojen näyttelyteline avautuu.",
  "CHEM79-RATE-CONC": "Virtuaalinäytteiden vertailuluukku avautuu.",
  "CHEM79-RATE-SURF": "Pintatutkimuksen työpöydän kansi avautuu.",
  "CHEM79-RATE-TEMP": "Lämpötilavertailun mittarisuojus avautuu.",
  "CHEM79-LAB-01": "Virtuaalisten tutkimusvälineiden laukku avautuu.",
  "CHEM79-MEAS-01": "Näytemittauksen vertailupöytä avautuu.",
  "PHY79-OHM": "Koelyhdyn mittalaitteen suojakansi avautuu.",
  "M79-PYTH-CONVERSE": "Tukikolmion tutkimusmalli asettuu pöydälle.",
  "M79-QUAD-INCOMP-02": "Ratkaisujoukon tutkimuspiste avautuu.",
  "M79-SYSTEM-GRAPH": "Kahden mittaehdon kuvaajapöytä avautuu.",
  "M79-COMB-01": "Saapumisvaihtoehtojen juhlaportti avautuu.",
  "CHEM79-BALANCE": "Ainekirjan vertailupöytä avautuu.",
  "CHEM79-CONC-CALC": "Näytteen massakirjan tutkimuspöytä avautuu."
};

/** Procedural environmental pilots. The original scene and task geometry remain independent. */
export function mountFamilyWorlds(world, options = {}) {
  const root = new THREE.Group(); root.name = 'family-world-pilot';
  root.position.set(.6,.2,6); const memory=new THREE.Group();memory.name='family-world-effects';memory.position.copy(root.position);world.scene?.add(root,memory);
  const effects=new Map();let reducedMotion=!!options.reducedMotion;
  let family = null, node = null, phase = null, elapsed = 0, paused = false, disposed = false;
  const quality = ['full','balanced','light'].includes(options.quality) ? options.quality : 'balanced';
  const materials = {
    wood: new THREE.MeshStandardMaterial({color:0x816247,roughness:.94}),
    pale: new THREE.MeshStandardMaterial({color:0xe7d8ad,roughness:1}),
    cloth: new THREE.MeshStandardMaterial({color:0xe8d9b4,emissive:0x443721,emissiveIntensity:.24,transparent:true,opacity:.86,side:THREE.DoubleSide,roughness:1,depthWrite:false}),
    reed: new THREE.MeshStandardMaterial({color:0x687f54,roughness:1}),
    reedTip: new THREE.MeshStandardMaterial({color:0x71513a,roughness:1}),
    water: new THREE.MeshBasicMaterial({color:0x68aead}),
    lightWater: new THREE.MeshBasicMaterial({color:0xb1d6cf}),
    rock: new THREE.MeshStandardMaterial({color:0x86918a,roughness:1}),
    terrain: new THREE.MeshStandardMaterial({color:0xffffff,vertexColors:true,roughness:1}),
    frost: new THREE.MeshStandardMaterial({color:0xb7d8d6,roughness:.92}),
    moss: new THREE.MeshStandardMaterial({color:0x61785e,roughness:1}),
    pine: new THREE.MeshStandardMaterial({color:0x425f54,roughness:1}),
    mountain: new THREE.MeshStandardMaterial({color:0x9ba9a1,emissive:0x253a38,emissiveIntensity:.45,roughness:1}),
    dark: new THREE.MeshStandardMaterial({color:0x465d59,roughness:1}),
    roof: new THREE.MeshStandardMaterial({color:0xb27657,roughness:.95}),
    gold: new THREE.MeshStandardMaterial({color:0xc9a966,roughness:.75}),
    glow: new THREE.MeshStandardMaterial({color:0xffd77a,emissive:0xffb04c,emissiveIntensity:.8,roughness:.85}),
  };
  function mesh(geo,mat,x,y,z,parent=root) {const m=new THREE.Mesh(geo,materials[mat]);m.position.set(x,y,z);parent.add(m);return m;}
  function box(x,y,z,w,h,d,mat,parent=root){return mesh(new THREE.BoxGeometry(w,h,d),mat,x,y,z,parent);}
  function ball(x,y,z,w,h,d,mat,parent=root){const m=mesh(new THREE.SphereGeometry(1,12,8),mat,x,y,z,parent);m.scale.set(w,h,d);return m;}
  function rod(a,b,r,mat,parent=root){const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A);if(!v.length())return;const m=mesh(new THREE.CylinderGeometry(r,r,v.length(),8),mat,...A.clone().add(B).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
  function stone(x,y,z,s){ball(x,y,z,s,s*.56,s*.8,'rock');}
  function reeds(x,z,count) {for(let i=0;i<count;i++){const xx=x+(i%3)*.17,zz=z+Math.floor(i/3)*.16,h=1.6+(i%4)*.18;rod([xx,0,zz],[xx+.12,h,zz],.035,'reed');ball(xx+.12,h-.14,zz,.075,.27,.075,'reedTip');}}
  function ring(x,y,z,r){const m=mesh(new THREE.TorusGeometry(r,.035,6,32),'lightWater',x,y,z);m.rotation.x=Math.PI/2;return m;}
  function ridge(x,z,w,h,mat){const m=mesh(new THREE.ConeGeometry(w,h,4),mat,x,h/2-.05,z);m.rotation.y=Math.PI/4;return m;}
  // Shared low-poly scenery: irregular, vertex-tinted land and individually jointed planks.
  function islet(x,z,w,d,variation=0,withStones=true){
    const geo=new THREE.SphereGeometry(1,20,10),p=geo.attributes.position,colors=[];
    for(let i=0;i<p.count;i++){
      const px=p.getX(i),py=p.getY(i),pz=p.getZ(i),angle=Math.atan2(pz,px);
      const r=1+.10*Math.sin(3*angle+variation)+.05*Math.cos(5*angle-variation);
      p.setXYZ(i,px*r*w,py*.22,pz*r*d);
      const t=THREE.MathUtils.clamp((py+1)/2,0,1),c=new THREE.Color().setRGB(.35+.20*t,.32+.19*t,.25+.14*t);colors.push(c.r,c.g,c.b);
    }
    geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();mesh(geo,'terrain',x,-.08,z);
    if(withStones)for(const [dx,dz,r] of [[-.65,-.2,.20],[.55,.3,.16],[.1,.6,.12]])stone(x+dx*w*.75,.10,z+dz*d*.7,r);
  }
  function curvedTimber(points,r=.045){const c=new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a)));return mesh(new THREE.TubeGeometry(c,12,r,6,false),'wood',0,0,0);}
  function plankWalk(x1,x2,z,count=10){
    const length=(x2-x1)/count;
    for(let i=0;i<count;i++){const t=(i+.5)/count,x=x1+(x2-x1)*t,y=.18+.045*Math.sin(Math.PI*t);const plank=box(x,y,z,length*.93,.08,.62,i%3===0?'pale':'wood');plank.rotation.y=(i%2?1:-1)*.012;}
    for(const dz of [-.25,.25])curvedTimber([[x1,.12,z+dz],[(x1+x2)/2,.18,z+dz],[x2,.12,z+dz]],.04);
  }
  function shelter(cx,z,width=1.7){
    const h=1.22,half=width/2,front=z+.48,back=z-.48;
    for(const x of [cx-half,cx+half])for(const zz of [front,back])rod([x,.12,zz],[x,h,zz],.05,'wood');
    for(const side of [-1,1]){
      const g=new THREE.BufferGeometry(),a=new Float32Array([cx,h+.42,front,cx+side*half,h,front,cx,h+.42,back,cx+side*half,h,back]);
      g.setAttribute('position',new THREE.BufferAttribute(a,3));g.setIndex([0,1,2,1,3,2]);g.computeVertexNormals();mesh(g,'cloth',0,0,0);
      rod([cx,h+.42,front],[cx+side*half,h,front],.045,'wood');
    }
    box(cx,.35,back,width,.42,.07,'wood');
    for(let j=0;j<4;j++)box(cx,.18,front-.15+j*.2,width*.94,.05,.17,'wood');
  }

  // Peripheral habitat silhouettes support the family landmark without covering the activity.
  function buildMilieu(id){
    const type=familyMilieus[id];if(!type)return;
    const edge=(side,x)=>side*x;
    if(type==='reed'){
      for(const side of [-1,1]){reeds(edge(side,5.7),-4.25,5);reeds(edge(side,5.25),-3.65,2);stone(edge(side,5.35),.1,-2.6,.28);}
    } else if(type==='rocky'){
      for(const side of [-1,1]){ball(edge(side,5.1),.55,-4.1,.95,.65,.7,'rock');ball(edge(side,5.35),.35,-3.1,.65,.42,.5,'mountain');stone(edge(side,4.8),.12,-4.8,.27);ball(edge(side,5.25),1.05,-4.3,.38,.16,.35,'moss');}
    } else if(type==='workshop'){
      shelter(-4.75,-4.45,1.75);for(const side of [-1,1]){rod([edge(side,5.2),.08,-3.4],[edge(side,5.2),.85,-3.4],.045,'wood');ball(edge(side,5.2),.95,-3.4,.1,.1,.1,'gold');}
    } else if(type==='ice'){
      for(const side of [-1,1]){ball(edge(side,5.05),.18,-4.05,1.25,.24,1.05,'frost');ball(edge(side,5.2),.6,-4.45,.7,.7,.58,'frost');ball(edge(side,4.75),.22,-3.1,.65,.2,.45,'pale');}
    } else if(type==='cave'){
      for(const side of [-1,1]){ball(edge(side,5.15),1.0,-4.3,1.1,1.25,.72,'mountain');ball(edge(side,4.7),.55,-4.05,.65,.7,.45,'rock');ball(edge(side,4.1),.24,-4.05,.32,.25,.3,'rock');}const curve=new THREE.CatmullRomCurve3([[-5.4,.45,-4.7],[-4.75,1.9,-4.8],[-3.1,2.9,-4.8],[-.2,3.25,-4.9],[2.8,2.85,-4.8],[4.7,1.8,-4.7],[5.4,.4,-4.65]].map(v=>new THREE.Vector3(...v))),segments=48,sides=10,geometry=new THREE.TubeGeometry(curve,segments,.48,sides,false),positions=geometry.attributes.position,colors=[];
      for(let i=0;i<=segments;i++){const center=curve.getPointAt(i/segments),rough=1+.27*Math.sin(i*.63)+.13*Math.cos(i*1.31);for(let j=0;j<=sides;j++){const index=i*(sides+1)+j,v=new THREE.Vector3().fromBufferAttribute(positions,index).sub(center).multiplyScalar(rough).add(center);positions.setXYZ(index,v.x,v.y,v.z);const light=.4+.055*Math.sin(i*.41+j*.9);colors.push(light*.8,light*.91,light);}}
      geometry.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geometry.computeVertexNormals();const rim=mesh(geometry,'terrain',0,0,0);rim.name='cave-rock-rim';
    } else if(type==='mountain'){
      for(const side of [-1,1]){ball(edge(side,5.05),.8,-4.7,1.05,1.15,.7,'mountain');ball(edge(side,4.6),.45,-4.25,.7,.65,.55,'rock');ball(edge(side,5.05),1.65,-4.7,.47,.19,.4,'frost');}
    } else if(type==='garden'){
      for(const side of [-1,1]){ball(edge(side,5.05),.12,-4.15,.95,.17,.7,'moss');rod([edge(side,5.05),.14,-4.15],[edge(side,5.05),1.5,-4.15],.05,'wood');ball(edge(side,4.72),1.15,-4.15,.5,.18,.28,'reed');ball(edge(side,5.37),.93,-4.15,.48,.18,.28,'moss');ball(edge(side,4.8),.52,-4.15,.4,.14,.22,'reed');ball(edge(side,5.05),1.6,-4.15,.16,.14,.15,'roof');}
    } else if(type==='observatory'){
      for(const side of [-1,1]){mesh(new THREE.CylinderGeometry(.47,.55,.55,16),'pale',edge(side,4.9),.34,-4.35);const dome=mesh(new THREE.SphereGeometry(.5,16,8,0,Math.PI*2,0,Math.PI/2),'mountain',edge(side,4.9),.62,-4.35);dome.name='observatory-dome';ball(edge(side,5.3),1.65,-4.5,.06,.06,.06,'gold');}
    }
  }

  function build(id){
    buildMilieu(id);
    if(id==='LM01'){
      for(const side of [-1,1])for(const [index,z] of [-2.3,-.9,.5].entries())islet(side*(4.36+(index===1?.16:0)),z,.7,.95,index+side*.6,false);
      reeds(-6.4,-3.2,5);reeds(6.0,-3.2,5);ring(-4.95,.12,1.0,.38);
      // Open notebook sits at the edge, away from task labels and controls.
      box(-4.05,.27,-1.35,1.15,.10,.72,'wood');box(-4.32,.33,-1.35,.48,.025,.6,'pale');box(-3.8,.33,-1.35,.48,.025,.6,'pale');
      for(const x of [-4.5,4.3])reeds(x,-2.7,6);
    } else if(id==='LM02'){
      // Two small shelters flank the work area; canvas is an environmental screen.
      for(const x of [-4.0,4.0]){
        ball(x,-.11,-2.65,1.25,.24,1.18,'rock');
        for(const dx of [-.72,.72])rod([x+dx,.05,-1.9],[x,1.55,-1.9],.055,'wood');
        rod([x,1.55,-1.9],[x,1.55,-3.35],.055,'wood');
        for(const sign of [-1,1]){
          const vertices=new Float32Array([x,1.55,-1.9,x+sign*.82,.18,-1.9,x,1.55,-3.35,x+sign*.82,.18,-3.35]);
          const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.BufferAttribute(vertices,3));geo.setIndex([0,1,2,1,3,2]);geo.computeVertexNormals();mesh(geo,'cloth',0,0,0);
        }
        for(const z of [-1.7,-2.25,-2.8])stone(x+(x<0?.95:-.95),.13,z,.21);
      }
      for(const x of [-2,-1,0,1,2])ball(x,.07,-2.8,.31,.055,.22,'pale');
    } else if(id==='LM03'){
      // Empty leaf landings frame the exact quantity task without supplying a counted answer.
      for(const x of [-4.25,4.25]){
        ball(x,-.1,-1.8,1.2,.24,1.1,'rock');reeds(x+(x<0?-.55:.55),-2.65,6);
        for(let j=0;j<4;j++)box(x,.16,-1.85+j*.36,1.05,.09,.30,'wood');
        for(const dx of [-.48,.48])rod([x+dx,.2,-2.48],[x+dx,.84,-2.48],.045,'wood');
        rod([x-.48,.84,-2.48],[x+.48,.84,-2.48],.045,'wood');
      }
    } else if(id==='LM04'){
      // Reeds bound together at one bank, a roofed boat store at the other.
      ball(-4,-.1,-2.25,1.25,.24,1.05,'rock');ball(4,-.1,-2.25,1.25,.24,1.05,'rock');
      for(let j=0;j<9;j++){const x=-4.3+(j%3)*.2,z=-2.65+Math.floor(j/3)*.18;rod([x,.15,z],[x+.07,1.5,z],.045,'reed');}
      const binding=mesh(new THREE.TorusGeometry(.34,.04,6,20),'gold',-4.03,.85,-2.45);binding.rotation.x=Math.PI/2;
      for(const x of [3.3,4.7])for(const z of [-1.8,-3.1])rod([x,.1,z],[x,1.15,z],.07,'wood');
      const roof=mesh(new THREE.ConeGeometry(1.25,.85,4),'roof',4,1.4,-2.45);roof.rotation.y=Math.PI/4;
      const hull=ball(4,.25,-1.25,.75,.18,.35,'wood');hull.rotation.y=-.2;
      for(const x of [3.55,4.45])stone(x,.1,-1,.19);
    } else if(id==='LM05'){
      islet(-3.4,-2.6,1.45,1.15,.2);islet(3.35,-2.25,1.65,1.25,1.1);
      islet(.2,-3.4,2.3,.85,2.1);plankWalk(-3,3,-2.9,11);shelter(.1,-3.15,1.7);
      reeds(-4.3,-2.75,3);reeds(4.25,-2.2,3);
    } else if(id==='LM06'){
      islet(-3.35,-2.35,1.6,1.25,1.4);islet(3.25,-2.85,1.8,1.05,2.6);
      plankWalk(-2.8,2.8,-3.1,12);shelter(3.1,-3.05,1.55);
      for(let j=0;j<3;j++){const z=-2.8+j*.42;for(let k=0;k<3;k++)box(-3.3,.2,-2.9+j*.42+k*.09,1.05,.07,.075,'wood');rod([-3.85,.24,z],[-2.75,.24,z],.022,'gold');}
      for(let j=0;j<4;j++)rod([2.6,.4+j*.2,-2.55],[3.55,.4+j*.2,-2.55],.024,'gold');
    } else if(id==='LM07'){
      ball(-2.7,-.3,-3.35,2.6,.65,1.15,'rock');ball(2.8,-.35,-3.35,2.5,.7,1.15,'rock');
      for(let j=0;j<5;j++)box(-2.0+j*.9,.12+j*.12,-3.25,.8,.14,.8,'wood');
      ball(-4,-.1,-2.3,1.25,.26,1.15,'rock');ball(4,-.1,-2.2,1.25,.24,1.1,'rock');
      for(let j=0;j<3;j++)box(-4,.2+j*.33,-2.3,1.1-j*.18,.27,.65,'wood');
      for(const x of [3.3,4.7])rod([x,.1,-2.8],[x,1.35,-2.8],.06,'wood');box(4,1.43,-2.8,1.8,.16,.85,'roof');
      for(const [dx,dy] of [[-.35,.3],[.35,.3],[0,.75]])box(4+dx,dy,-2.15,.55,.5,.48,'pale');
    } else if(id==='LM09'){
      islet(-3.35,-2.45,1.75,1.25,.9);islet(3.5,-2.9,1.45,1.0,2.2);
      const shell=ball(-3.35,.38,-2.35,1.1,.25,.75,'pale');shell.rotation.z=.13;
      const lid=ball(-3.35,.85,-2.85,1.05,.22,.7,'pale');lid.rotation.x=-.82;
      ball(-3.35,.68,-2.27,.29,.29,.29,'lightWater');
      for(let j=-3;j<=3;j++)curvedTimber([[-3.35,.42,-2.9],[-3.35+j*.18,.55,-2.55],[-3.35+j*.28,.39,-2.05]],.012);
      rod([3.5,.15,-2.65],[3.5,1.58,-2.65],.055,'wood');
      const lens=mesh(new THREE.TorusGeometry(.58,.05,8,32),'gold',3.5,1.21,-2.58);lens.rotation.y=.12;
      reeds(4.5,-3.05,3);
    } else if(id==='LM10'){
      ball(0,-.24,-3.1,4.2,.28,1.4,'lightWater');
      for(const x of [-4.1,4.1]){ball(x,-.1,-2.3,1.25,.24,1.05,'lightWater');rod([x,.1,-2.5],[x,1.45,-2.5],.07,'pale');}
      const arch=mesh(new THREE.TorusGeometry(.78,.12,8,28,Math.PI),'lightWater',-4.1,1.02,-2.5);arch.rotation.z=0;
      box(4.1,1.08,-2.5,1.15,.14,.08,'dark');for(const x of [3.7,4.1,4.5])box(x,1.08,-2.42,.045,.34,.035,'gold');
    } else if(id==='LM11'){
      islet(-3.35,-2.55,1.65,1.2,.6);islet(3.3,-2.8,1.7,1.15,1.9);
      plankWalk(-2.5,2.5,-3.3,9);shelter(2.95,-2.95,1.75);
      rod([-3.35,.15,-2.5],[-3.35,1.52,-2.5],.055,'wood');
      curvedTimber([[-4.2,1.32,-2.5],[-3.35,1.39,-2.5],[-2.5,1.32,-2.5]],.045);
      for(const x of [-4.05,-2.65]){rod([x,1.32,-2.5],[x,.74,-2.5],.024,'wood');ball(x,.71,-2.5,.33,.065,.24,'pale');}
      box(3,.43,-2.45,.85,.6,.65,'wood');box(3,.76,-2.45,.95,.08,.72,'gold');
    } else if(id==='LM12'){
      ball(-2,-.25,-3.0,2.7,.5,1.35,'reed');
      ball(-4,.12,-2.2,1.15,.34,.85,'reed');for(const [x,z] of [[-4.4,-2.1],[-3.7,-2.5]])stone(x,.34,z,.22);
      ball(4,-.1,-2.2,1.2,.24,1.05,'rock');box(4,.44,-2.2,1.45,.13,1,'wood');box(4,.52,-2.2,1.28,.035,.82,'pale');
      rod([4.65,.15,-2.8],[4.65,1.3,-2.8],.045,'wood');ball(4.65,1.35,-2.8,.14,.14,.14,'gold');
    } else if(id==='LM13'){
      ball(0,-.24,-3.2,4.1,.3,1.05,'rock');
      for(const x of [-4.6,-3.4,3.4,4.6])rod([x,.1,-2.7],[x,1.65,-2.7],.045,'wood');
      for(const side of [-1,1]){const x=side*4;rod([x-.65,1.65,-2.7],[x+.65,1.65,-2.7],.035,'wood');
        const sail=mesh(new THREE.ConeGeometry(.45,.85,3),'reed',x,1.03,-2.7);sail.rotation.z=side*.18;}
      ball(4,-.1,-1.65,1.1,.24,.9,'rock');ball(4,.22,-1.65,.7,.14,.27,'wood');
      ball(-4,-.1,-1.65,1.1,.24,.9,'rock');
    } else if(id==='LM15'){
      ball(-3.8,-.18,-2.7,2.0,.4,1.3,'rock');ball(-3.8,.21,-2.5,1.15,.06,.75,'water');
      ball(3.5,-.2,-3.0,2,.45,1.4,'rock');rod([3.15,.1,-2.7],[3.15,1.5,-2.7],.06,'wood');
      const mirror=mesh(new THREE.CircleGeometry(.65,32),'lightWater',3.15,1.1,-2.65);mirror.rotation.y=.1;
      rod([2.45,.55,-2.7],[3.8,.55,-2.7],.025,'gold');
    } else if(id==='LM16'){
      ball(-3.65,-.2,-2.8,1.8,.4,1.3,'rock');for(const x of [-4.3,-3])rod([x,.1,-2.7],[x,1.45,-2.7],.06,'wood');
      box(-3.65,1.05,-2.68,1.55,.88,.055,'pale');
      for(let j=0;j<4;j++){rod([-4.35+j*.42,.65,-2.63],[-4.35+j*.42,1.45,-2.63],.012,'dark');rod([-4.35,.65+j*.25,-2.63],[-3.0,.65+j*.25,-2.63],.012,'dark');}
      ball(3.4,-.16,-2.7,1.75,.35,1.1,'rock');rod([3.4,.1,-2.65],[3.4,1.25,-2.65],.05,'wood');
      const compass=mesh(new THREE.TorusGeometry(.36,.035,7,24),'gold',3.4,1.2,-2.62);compass.rotation.y=.12;
    } else if(id==='LM17'){
      ball(-3.7,-.2,-2.9,2.1,.38,1.25,'rock');ball(3.5,-.2,-2.9,2,.38,1.25,'rock');
      for(const x of [-4.5,-2.8])rod([x,.12,-2.7],[x,.62,-2.7],.045,'wood');rod([-4.5,.58,-2.7],[-2.8,.58,-2.7],.035,'gold');
      box(3.45,.35,-2.7,1.5,.38,1,'wood');box(3.45,.57,-2.7,1.35,.07,.88,'pale');
      for(let j=0;j<3;j++)rod([2.85+j*.6,.62,-3.1],[2.85+j*.6,.62,-2.3],.02,'dark');
    } else if(id==='LM18'){
      ball(-3.7,-.2,-2.7,2,.38,1.2,'rock');ball(3.5,-.2,-2.7,1.85,.35,1.15,'rock');
      for(let j=0;j<4;j++)box(-3.7,.15,-3+j*.3,1.45,.08,.25,'wood');
      box(3.35,.45,-2.6,1,.62,.55,'wood');box(3.35,.8,-2.6,1.08,.08,.6,'gold');
      rod([4.2,.1,-3.1],[4.2,1.65,-3.1],.065,'pale');for(let j=0;j<5;j++)box(4.2, .35+j*.25,-3.03,.25,.025,.035,'dark');
    } else if(id==='LM19'){
      ball(-3.7,-.2,-2.8,2,.4,1.3,'rock');ball(3.4,-.2,-2.7,1.8,.35,1.15,'rock');
      mesh(new THREE.CylinderGeometry(.48,.65,2.05,12),'pale',-3.7,1.08,-2.85);
      mesh(new THREE.ConeGeometry(.72,.6,12),'roof',-3.7,2.38,-2.85);
      const clock=mesh(new THREE.CircleGeometry(.32,24),'gold',-3.7,1.65,-2.35);rod([-3.7,1.65,-2.32],[-3.7,1.86,-2.32],.02,'dark');
      for(const x of [3,3.8]){rod([x,.1,-2.7],[x,1.4,-2.7],.055,'wood');box(x,1,-2.66,.6,.72,.05,'pale');}
    } else if(id==='LM20'){
      ball(-3.7,-.2,-2.75,1.95,.4,1.2,'rock');mesh(new THREE.CylinderGeometry(.35,.55,1.8,12),'pale',-3.7,1,-2.75);
      mesh(new THREE.ConeGeometry(.6,.55,12),'roof',-3.7,2.15,-2.75);ball(-3.7,1.72,-2.4,.16,.16,.10,'gold');
      ball(3.5,-.2,-2.8,1.9,.4,1.2,'rock');for(const x of [2.8,4.2])rod([x,.1,-2.8],[x,1.45,-2.8],.06,'wood');
      box(3.5,1,-2.75,1.5,.8,.06,'pale');for(const [x,y] of [[3, .85],[3.4,1.15],[3.85,.95]])ball(x,y,-2.69,.08,.08,.035,'roof');
    } else if(id==='LM21'){
      ball(-3.7,-.2,-2.8,1.9,.4,1.2,'rock');rod([-3.7,.1,-2.8],[-3.7,1.45,-2.8],.06,'wood');
      const wheel=mesh(new THREE.TorusGeometry(.58,.07,8,32),'gold',-3.7,1.1,-2.73);for(let j=0;j<5;j++){const a=j*Math.PI*2/5;rod([-3.7,1.1,-2.7],[-3.7+.5*Math.cos(a),1.1+.5*Math.sin(a),-2.7],.018,'dark');}
      ball(3.5,-.2,-2.8,1.9,.4,1.2,'rock');for(const [x,y,z] of [[3.1,.2,-2.8],[3.5,.2,-2.8],[3.9,.2,-2.8],[3.3,.45,-2.8],[3.7,.45,-2.8]])stone(x,y,z,.22);
    } else if(id==='LM22'){
      ball(-3.7,-.2,-2.8,1.9,.4,1.2,'rock');for(const x of [-4.35,-3.05])rod([x,.1,-2.8],[x,1.3,-2.8],.055,'wood');
      box(-3.7,.95,-2.75,1.5,.7,.06,'pale');for(let j=0;j<3;j++)box(-3.7,.68+j*.25,-2.68,1.1,.025,.02,'dark');
      ball(3.45,.05,-2.2,1.1,.2,.5,'wood');box(3.45,.3,-2.2,1.15,.22,.55,'pale');
      rod([3.1,.45,-2.2],[3.8,.45,-2.2],.03,'gold');ring(2.2,.08,-1.8,.35);ring(1.6,.08,-1.8,.22);
    } else if(id==='UM-01'){
      islet(-3.5,-2.55,1.7,1.25,.5);islet(3.4,-2.9,1.7,1.1,1.8);plankWalk(-2.6,2.6,-3.1,10);shelter(-3.4,-2.75,1.5);
      for(const [x,z,r] of [[2.7,-2.7,.28],[3.25,-2.45,.21],[3.8,-2.8,.25]])stone(x,.2,z,r);
      rod([4,.15,-3.1],[4,1.05,-3.1],.045,'wood');ball(4,1.1,-3.1,.12,.12,.12,'gold');
    } else if(id==='UM-02'){
      islet(-3.5,-2.6,1.75,1.2,.8);islet(3.4,-2.75,1.55,1.2,2);shelter(-3.45,-2.8,1.9);
      rod([-3.45,.2,-2.5],[-3.45,1.1,-2.5],.06,'wood');ball(-3.45,1.2,-2.5,.2,.2,.2,'gold');
      box(3.4,.32,-2.75,1.4,.12,.9,'wood');for(const dx of [-.3,.3])box(3.4+dx,.4,-2.75,.55,.025,.72,'pale');
    } else if(id==='UM-03'){
      islet(-3.45,-2.6,1.6,1.2,1);islet(3.4,-2.8,1.65,1.15,2.1);plankWalk(-2.6,2.5,-3.1,9);
      for(const x of [-3.95,-2.95]){rod([x,.1,-2.65],[x,1.1,-2.65],.045,'wood');ball(x,1.15,-2.65,.15,.15,.15,'lightWater');}
      rod([3.4,1.35,-2.8],[3.4,.35,-2.8],.025,'gold');box(3.4,.25,-2.8,.7,.32,.6,'wood');
    } else if(id==='UM-04'){
      islet(-3.45,-2.6,1.8,1.15,.3);islet(3.4,-2.75,1.55,1.25,2.2);shelter(-3.45,-2.8,1.75);
      for(const x of [2.8,4])rod([x,.12,-2.7],[x,1.55,-2.7],.05,'wood');rod([2.8,1.55,-2.7],[4,1.55,-2.7],.035,'wood');
      const sail=mesh(new THREE.ConeGeometry(.48,.95,3),'cloth',3.4,.96,-2.67);sail.rotation.z=-.15;
    } else if(id==='UM-05'){
      islet(-3.45,-2.65,1.8,1.2,.4);islet(3.45,-2.75,1.6,1.1,1.5);
      mesh(new THREE.CylinderGeometry(.34,.56,1.8,10),'pale',-3.45,1.03,-2.7);mesh(new THREE.ConeGeometry(.58,.52,10),'roof',-3.45,2.17,-2.7);
      rod([3.4,.15,-2.75],[3.4,1.45,-2.75],.055,'wood');for(const dx of [-.65,.65]){rod([3.4,1.3,-2.75],[3.4+dx,.65,-2.75],.03,'wood');ball(3.4+dx,.62,-2.75,.12,.12,.12,'gold');}
    } else if(id==='UM-06'){
      islet(-3.45,-2.65,1.8,1.2,.7);islet(3.45,-2.75,1.65,1.15,2.1);
      for(const x of [-4.15,-2.75])rod([x,.1,-2.75],[x,1.4,-2.75],.08,'rock');curvedTimber([[-4.15,1.4,-2.75],[-3.45,1.8,-2.75],[-2.75,1.4,-2.75]],.08);
      box(3.45,.17,-2.7,1.5,.06,1,'reed');for(let j=0;j<4;j++)rod([2.8+j*.42,.22,-3.1],[2.8+j*.42,.22,-2.3],.018,'pale');
    } else if(id==='UM-07'){
      islet(-3.45,-2.6,1.75,1.2,.4);islet(3.45,-2.8,1.75,1.15,1.9);shelter(-3.45,-2.8,1.85);
      for(const x of [3.05,3.85])box(x,.2,-2.65,.45,.04,1.3,'water');
      for(const x of [2.75,4.15])rod([x,.1,-2.85],[x,1.1,-2.85],.055,'wood');rod([2.75,1.1,-2.85],[4.15,1.1,-2.85],.045,'wood');
    } else if(id==='UM-08'){
      islet(-3.45,-2.55,1.75,1.2,.2);islet(3.45,-2.85,1.75,1.1,2.2);plankWalk(-2.7,2.6,-3.1,10);shelter(3.45,-3,1.85);
      ball(-3.45,.23,-2.4,1,.18,.38,'wood');rod([-3.45,.25,-2.4],[-3.45,1.3,-2.4],.045,'wood');
      box(3.4,.48,-2.5,1.1,.12,.75,'wood');box(3.4,.56,-2.5,.9,.025,.6,'pale');
    } else if(id==='UM-09'){
      islet(-3.5,-2.6,1.7,1.1,.8);islet(3.4,-2.8,1.7,1.1,2.2);plankWalk(-2.7,2.5,-3.1,10);
      for(const x of [-4.1,-2.9])rod([x,.15,-2.65],[x,1.3,-2.65],.055,'wood');for(let j=0;j<4;j++)rod([-4.1,.35+j*.22,-2.65],[-2.9,.35+j*.22,-2.65],.035,'wood');
      rod([3.4,.15,-2.8],[3.4,1.4,-2.8],.05,'wood');curvedTimber([[2.7,1.25,-2.8],[3.4,1.3,-2.8],[4.1,1.25,-2.8]],.04);
    } else if(id==='UM-10'){
      islet(-3.5,-2.6,1.65,1.15,.4);islet(3.45,-2.8,1.7,1.1,2.3);shelter(3.4,-2.9,1.7);
      for(const x of [-3.9,-3.1])box(x,.19,-2.6,.55,.035,1.5,'water');
      box(3.4,.48,-2.5,1.1,.12,.7,'wood');box(3.4,.56,-2.5,.9,.025,.55,'pale');
    } else if(id==='UM-11'){
      islet(-3.45,-2.6,1.75,1.2,1);islet(3.45,-2.8,1.7,1.1,2.2);shelter(-3.45,-2.85,1.8);
      for(const x of [-4.05,-3.65,-3.25,-2.85])rod([x,.2,-2.3],[x,1.2,-2.3],.025,'gold');
      box(3.4,.25,-2.7,1.4,.2,.85,'wood');for(const x of [2.9,3.4,3.9]){rod([x,.35,-2.7],[x,.75,-2.7],.035,'reed');ball(x,.78,-2.7,.16,.1,.11,'reed');}
    } else if(id==='UM-12'){
      islet(-3.45,-2.6,1.7,1.15,.8);islet(3.45,-2.8,1.6,1.1,1.8);
      mesh(new THREE.CylinderGeometry(.25,.4,1.3,12),'pale',-3.45,.8,-2.65);mesh(new THREE.ConeGeometry(.45,.45,12),'roof',-3.45,1.65,-2.65);ball(-3.45,1.4,-2.25,.12,.12,.08,'gold');
      box(3.45,.4,-2.7,1.5,.13,.95,'wood');box(3.45,.49,-2.7,1.3,.025,.8,'pale');
      rod([2.95,.52,-2.9],[3.95,.52,-2.45],.025,'roof');
    } else if(id==='UM-13'){
      islet(-3.45,-2.6,1.75,1.2,.4);islet(3.45,-2.8,1.7,1.1,1.8);
      rod([-3.45,.1,-2.65],[-3.45,1.75,-2.65],.055,'wood');box(-3.1,1.55,-2.65,.7,.26,.04,'roof');
      for(const x of [2.8,4.1])rod([x,.1,-2.8],[x,1.2,-2.8],.07,'rock');curvedTimber([[2.8,1.2,-2.8],[3.45,1.65,-2.8],[4.1,1.2,-2.8]],.07);
    } else if(id==='UM-14'){
      islet(-3.45,-2.6,1.6,1.15,.4);islet(3.45,-2.8,1.6,1.1,2.2);plankWalk(-2.7,2.65,-3.1,13);
      for(const x of [-2.6,2.6])rod([x,.1,-3.1],[x,1.35,-3.1],.055,'wood');curvedTimber([[-2.6,1.35,-3.1],[0,.9,-3.1],[2.6,1.35,-3.1]],.03);
      box(3.45,.3,-2.5,.7,.4,.6,'wood');ball(-3.45,1.25,-2.5,.13,.13,.13,'gold');
    } else if(id==='UM-15'){
      islet(-3.45,-2.6,1.75,1.2,.6);islet(3.45,-2.8,1.65,1.1,1.8);
      const pool=mesh(new THREE.TorusGeometry(.9,.1,8,32),'lightWater',-3.45,.2,-2.65);pool.rotation.x=Math.PI/2;
      ball(-3.45,.22,-2.65,.13,.13,.13,'gold');rod([3.45,.1,-2.8],[3.45,1.35,-2.8],.05,'wood');ball(3.45,1.45,-2.8,.18,.18,.18,'gold');
    } else if(id==='UM-16'){
      islet(-3.45,-2.6,1.7,1.2,.7);islet(3.45,-2.8,1.7,1.1,2);shelter(3.45,-2.95,1.65);
      for(const x of [-4.15,-2.75])rod([x,.1,-2.6],[x,.7,-2.6],.05,'wood');curvedTimber([[-4.15,.65,-2.6],[-3.45,.52,-2.6],[-2.75,.65,-2.6]],.035);
      box(-3.45,.18,-2.9,1.1,.035,.75,'reed');
    } else if(id==='UM-17'){
      islet(-3.45,-2.6,1.75,1.2,.5);islet(3.45,-2.8,1.7,1.1,1.9);
      const dome=mesh(new THREE.SphereGeometry(.82,16,10,0,Math.PI*2,0,Math.PI/2),'cloth',-3.45,.2,-2.65);
      for(const x of [2.85,4.05])rod([x,.1,-2.8],[x,1.45,-2.8],.045,'wood');
      box(3.45,.8,-2.75,1.3,.7,.05,'pale');rod([3.45,.45,-2.7],[3.45,1.15,-2.7],.02,'dark');
    } else if(id==='UM-18'){
      islet(-3.45,-2.6,1.7,1.2,.7);islet(3.45,-2.8,1.7,1.1,2.1);shelter(-3.45,-2.85,1.8);plankWalk(-2.5,2.5,-3.1,10);
      for(const x of [2.8,4.1])rod([x,.1,-2.75],[x,1.45,-2.75],.05,'wood');box(3.45,.95,-2.7,1.4,.65,.06,'pale');
      rod([4.15,.1,-3.2],[4.15,1.75,-3.2],.045,'wood');box(4.4,1.6,-3.2,.5,.18,.05,'roof');
    } else if(id==='SCI01'){
      islet(-3.45,-2.6,1.75,1.2,.4);islet(3.45,-2.8,1.65,1.1,2);
      const pond=mesh(new THREE.CircleGeometry(.8,24),'water',-3.45,.2,-2.65);pond.rotation.x=-Math.PI/2;ring(-3.45,.23,-2.65,.48);
      const drop=ball(-3.45,.75,-2.65,.17,.3,.17,'lightWater');drop.scale.y=.3;
      box(3.45,.3,-2.7,1.25,.1,.8,'wood');for(const dx of [-.3,.3])box(3.45+dx,.37,-2.7,.55,.025,.7,'pale');
    } else if(id==='SCI02'){
      islet(-3.45,-2.6,1.6,1.1,.4);islet(3.45,-2.8,1.7,1.1,1.8);plankWalk(-2.6,2.6,-3.1,10);shelter(-3.45,-2.85,1.85);
      rod([3.45,.1,-2.8],[3.45,1.65,-2.8],.05,'wood');box(3.75,1.5,-2.8,.6,.2,.04,'roof');
      for(const x of [3.05,3.85])box(x,.2,-2.55,.45,.035,1.15,'water');
    } else if(id==='SCI03'){
      islet(-3.45,-2.6,1.7,1.2,.6);islet(3.45,-2.8,1.6,1.1,2);plankWalk(-2.5,2.5,-3.1,10);
      ball(-3.45,.22,-2.45,.75,.15,.3,'wood');rod([-3.45,.3,-2.45],[-3.45,1.2,-2.45],.045,'wood');box(-3.2,1.08,-2.45,.5,.28,.035,'roof');
      stone(3.45,.25,-2.7,.42);rod([4,.1,-2.8],[4,1.4,-2.8],.05,'wood');ball(4,1.48,-2.8,.15,.15,.15,'gold');
    } else if(id==='SCI04'){
      islet(-3.45,-2.6,1.75,1.2,.7);islet(3.45,-2.8,1.7,1.1,2.1);shelter(-3.45,-2.85,1.85);
      box(-3.45,.92,-2.28,.75,.55,.035,'lightWater');for(let j=0;j<3;j++)box(-3.7+j*.25,.9,-2.24,.06,.38,.02,'pale');
      for(const [x,z] of [[2.75,-2.4],[3.35,-2.8],[4,-2.45]])stone(x,.2,z,.27);
      rod([3.8,.15,-3],[3.8,1.4,-3],.055,'wood');ball(3.8,1.5,-3,.12,.12,.12,'roof');
    } else if(id==='SCI05'){
      islet(-3.45,-2.6,1.75,1.2,.5);islet(3.45,-2.8,1.65,1.1,2);
      for(const x of [-4.1,-2.8])ball(x,.75,-2.65,.55,.9,.45,'rock');curvedTimber([[-4.1,1.3,-2.65],[-3.45,1.8,-2.65],[-2.8,1.3,-2.65]],.14);
      box(3.45,.85,-2.8,1.2,1.3,.08,'pale');ring(3.45,.2,-2.5,.5);
    } else if(id==='SCI06'){
      islet(-3.45,-2.6,1.7,1.2,.8);islet(3.45,-2.8,1.65,1.1,1.7);shelter(-3.45,-2.85,1.7);
      ball(-3.45,.55,-2.4,.22,.22,.22,'gold');
      rod([3.45,.15,-2.8],[3.45,1.45,-2.8],.05,'wood');const star=mesh(new THREE.TorusGeometry(.58,.045,8,32),'gold',3.45,1.1,-2.75);
      for(const [x,y] of [[3.15,.95],[3.55,1.33],[3.75,.92]])ball(x,y,-2.7,.055,.055,.035,'pale');
    } else if(id==='SCI07'){
      islet(-3.45,-2.6,1.75,1.2,.4);islet(3.45,-2.8,1.65,1.1,1.9);shelter(3.45,-2.95,1.8);
      curvedTimber([[-4.15,.25,-2.7],[-3.45,.38,-2.5],[-2.75,.25,-2.7]],.11);
      for(const [x,z,r] of [[-4,-2.5,.25],[-3.45,-2.25,.18],[-2.9,-2.5,.23]])stone(x,.2,z,r);
      box(3.45,.45,-2.45,1.1,.14,.7,'wood');ball(3.45,.6,-2.45,.2,.13,.17,'lightWater');
    } else if(id==='SCI08'){
      islet(-3.45,-2.6,1.8,1.2,.6);islet(3.45,-2.8,1.65,1.1,1.9);
      rod([-3.45,.15,-2.7],[-3.45,1.4,-2.7],.16,'wood');for(const [x,y,z] of [[-3.9,1.5,-2.7],[-3.45,1.85,-2.7],[-3,1.5,-2.7]])ball(x,y,z,.62,.48,.5,'reed');
      const circle=mesh(new THREE.TorusGeometry(.7,.035,6,32),'pale',3.45,.2,-2.7);circle.rotation.x=Math.PI/2;stone(3.45,.17,-2.7,.17);
    } else if(id==='SCI09'){
      islet(-3.45,-2.6,1.75,1.2,.5);islet(3.45,-2.8,1.65,1.1,1.9);
      mesh(new THREE.CylinderGeometry(.35,.55,1.65,12),'pale',-3.45,.96,-2.65);mesh(new THREE.ConeGeometry(.6,.55,12),'roof',-3.45,2.05,-2.65);box(-3.45,1.2,-2.08,.3,.4,.04,'gold');
      shelter(3.45,-2.9,1.65);box(3.45,.5,-2.45,1,.06,.65,'pale');
    } else if(id==='SCI10'){
      islet(-3.45,-2.6,1.75,1.2,.4);islet(3.45,-2.8,1.7,1.1,2.1);
      for(const x of [-3.45,3.45])rod([x,.1,-2.8],[x,1.65,-2.8],.065,'wood');
      curvedTimber([[-3.45,1.6,-2.8],[0,1.1,-2.8],[3.45,1.6,-2.8]],.035);box(0,.85,-2.8,.7,.4,.55,'wood');
    } else if(id==='SCI11'){
      islet(-3.45,-2.6,1.7,1.2,.5);islet(3.45,-2.8,1.65,1.1,1.9);
      mesh(new THREE.CylinderGeometry(.25,.4,1.35,12),'pale',-3.45,.8,-2.7);mesh(new THREE.ConeGeometry(.45,.4,12),'roof',-3.45,1.65,-2.7);ball(-3.45,1.42,-2.3,.13,.13,.09,'gold');
      for(const [x,z] of [[2.9,-2.6],[3.4,-2.9],[4,-2.55]])reeds(x,z,3);
    } else if(id==='SCI12'){
      islet(-3.45,-2.6,1.7,1.15,.5);islet(3.45,-2.8,1.7,1.15,2);plankWalk(-2.6,2.6,-3.1,10);
      for(const x of [-3.45,3.45]){rod([x,.1,-2.7],[x,1.25,-2.7],.05,'wood');ball(x,1.34,-2.7,.18,.18,.18,'gold');}
    } else if(id==='SCI13'){
      islet(-3.45,-2.6,1.75,1.2,.6);islet(3.45,-2.8,1.65,1.1,1.8);shelter(-3.45,-2.9,1.8);
      box(-3.45,.95,-2.25,1.05,.62,.04,'dark');for(const x of [-3.8,-3.45,-3.1])ball(x,.95,-2.2,.08,.08,.03,'gold');
      for(const x of [2.8,4.1])rod([x,.1,-2.8],[x,1.4,-2.8],.05,'wood');box(3.45,.95,-2.75,1.35,.7,.05,'pale');
    } else if(id==='SCI14'){
      islet(-3.45,-2.6,1.75,1.2,.4);islet(3.45,-2.8,1.7,1.1,2);shelter(-3.45,-2.9,1.8);
      for(const x of [-4,-3.6,-3.2,-2.8])rod([x,.4,-2.3],[x,1.2,-2.3],.025,'gold');
      box(3.45,.38,-2.7,1.25,.12,.8,'wood');for(const x of [3.05,3.45,3.85])mesh(new THREE.CylinderGeometry(.1,.1,.32,12),'lightWater',x,.6,-2.7);
    } else if(id==='SCI15'){
      islet(-3.45,-2.6,1.75,1.2,.5);islet(3.45,-2.8,1.7,1.1,2);shelter(3.45,-2.95,1.75);
      for(const [x,z] of [[-4,-2.5],[-3.5,-2.8],[-3,-2.45]]){const crystal=mesh(new THREE.OctahedronGeometry(.3,0),'lightWater',x,.36,z);crystal.scale.set(.6,1.5,.6);}
      box(3.45,.38,-2.45,1.2,.12,.75,'wood');box(3.45,.47,-2.45,.95,.04,.55,'pale');
    } else if(id==='SCI16'){
      islet(-3.45,-2.6,1.7,1.2,.6);islet(3.45,-2.8,1.7,1.1,2);
      for(const x of [-4.1,-2.8])ball(x,.75,-2.65,.5,.9,.45,'rock');curvedTimber([[-4.1,1.25,-2.65],[-3.45,1.75,-2.65],[-2.8,1.25,-2.65]],.13);
      for(const x of [3.05,3.85]){rod([x,.1,-2.8],[x,1.35,-2.8],.04,'wood');box(x,.9,-2.75,.65,.7,.05,'pale');}
    } else if(id==='SCI17'){
      islet(-3.45,-2.6,1.75,1.2,.6);islet(3.45,-2.8,1.65,1.1,1.9);shelter(-3.45,-2.9,1.9);
      for(let j=0;j<3;j++)box(-3.45,.48+j*.26,-2.27,1.2,.09,.12,'wood');
      rod([3.45,.1,-2.8],[3.45,1.05,-2.8],.06,'wood');box(3.45,1.05,-2.8,1.2,.12,.75,'wood');box(3.45,1.13,-2.8,1,.025,.6,'pale');
    } else if(id==='SCI18'){
      islet(-3.45,-2.6,1.75,1.2,.4);islet(3.45,-2.8,1.65,1.1,1.9);shelter(-3.45,-2.9,1.85);
      box(-3.45,.65,-2.4,.85,.8,.65,'dark');box(-3.45,1.08,-2.4,.95,.1,.72,'gold');
      box(3.45,.35,-2.7,1.25,.1,.8,'wood');for(const dx of [-.3,.3])box(3.45+dx,.42,-2.7,.55,.025,.7,'pale');
    } else if(id==='SCI19'){
      islet(-3.45,-2.6,1.75,1.2,.6);islet(3.45,-2.8,1.7,1.1,2);
      box(-3.45,.18,-2.6,.72,.035,1.5,'water');for(const x of [-4.1,-2.8])for(const z of [-3.15,-2.65,-2.15])stone(x,.2,z,.16);
      box(3.45,.38,-2.65,1.25,.12,.85,'wood');for(const x of [3.1,3.8])mesh(new THREE.CylinderGeometry(.13,.16,.5,12),'lightWater',x,.68,-2.65);
    } else if(id==='SCI20'){
      islet(-3.45,-2.6,1.8,1.2,.4);islet(3.45,-2.8,1.7,1.1,2);plankWalk(-2.5,2.5,-3.1,9);
      ball(-3.45,.4,-2.7,1.05,.7,.8,'rock');box(-3.45,.2,-2.05,.45,.04,1.05,'water');
      for(const x of [3.05,3.8]){rod([x,.15,-2.8],[x,1.05,-2.8],.08,'wood');ball(x,1.2,-2.8,.45,.45,.4,'reed');}
    } else if(id==='SCI21'){
      islet(-3.45,-2.6,1.75,1.2,.5);islet(3.45,-2.8,1.65,1.1,1.9);shelter(3.45,-2.95,1.8);
      mesh(new THREE.CylinderGeometry(.8,.8,.12,24),'wood',-3.45,.65,-2.65);rod([-3.45,.1,-2.65],[-3.45,.6,-2.65],.1,'wood');
      for(const [x,z] of [[-4,-2.5],[-3,-2.3],[-3.1,-3]])ball(x,.74,z,.12,.12,.12,'gold');
    } else if(id==='SCI22'){
      islet(-3.45,-2.6,1.75,1.2,.4);islet(3.45,-2.8,1.7,1.1,2);plankWalk(-2.6,2.5,-3.1,10);shelter(-3.45,-2.85,1.75);
      ball(3.45,.25,-2.55,.85,.2,.35,'wood');rod([3.2,.34,-2.85],[3.2,.34,-2.25],.035,'pale');
      rod([4.2,.1,-2.8],[4.2,1.25,-2.8],.05,'wood');ball(4.2,1.35,-2.8,.16,.16,.16,'gold');
    } else if(id==='LM08'){
      // The twin channels are symbolic dressing, not a quantitative fluid model.
      // A broad painted water ribbon splits around the work area. It is an illustrative backdrop.
      function waterRibbon(points,width) {
        const curve=new THREE.CatmullRomCurve3(points.map(([x,z])=>new THREE.Vector3(x,.18,z))), vertices=[],indices=[];
        for(let i=0;i<=28;i++){const t=i/28,p=curve.getPoint(t),v=curve.getTangent(t),n=new THREE.Vector3(-v.z,0,v.x).normalize().multiplyScalar(width/2);vertices.push(p.x+n.x,p.y,p.z+n.z,p.x-n.x,p.y,p.z-n.z);if(i<28){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}}
        const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();mesh(geo,'water',0,0,0);
      }
      waterRibbon([[0,-4],[0,-2.9],[-1.3,-2.45],[-4.35,-1.7]],.88);
      waterRibbon([[0,-4],[0,-2.9],[1.3,-2.45],[4.35,-1.7]],.88);
      for(const x of [-2.3,0,2.3])ball(x,-.12,-2.65,1.65,.27,1.05,'rock');
      for(const x of [-4.35,4.35]){ball(x,-.12,-.35,1.1,.27,1.9,'rock');box(x,.17,-.35,.95,.025,2.9,'water');stone(x-.65,.17,.65,.3);}
      for(const x of [-4.5,4.5])reeds(x,-2.7,3);
      for(const x of [-4.35,4.35])for(let z=-1.4;z<1.1;z+=.55)stone(x+(z>0?.58:-.55),.16,z,.2);
      box(4.35,.12,-1.85,.85,.45,.045,'lightWater');
      for(const x of [-4.5,4.5])for(let j=0;j<3;j++)stone(x+(j-1)*.24,.18,1.0,.18);
    } else if(id==='LM14'){
      for(const [x,y,z,w,h,d] of [[-5,-.35,-4.3,2.2,2.5,1.0],[5,-.3,-4.5,2.1,2.7,1.1],[-4.1,-.35,-5,1.4,1.8,.8],[4,-.35,-5,1.5,1.9,.8]])ball(x,y,z,w,h,d,'mountain');
      for(const x of [-4.4,4.4]){stone(x,.16,.5,.42);rod([x,0,-2],[x,1.65,-2],.07,'wood');}
      for(const x of [-4.4,4.4])stone(x,.1,-2,.65);
      const tower=mesh(new THREE.CylinderGeometry(.35,.46,1.65,12),'pale',-4.35,1.0,-2.25);
      mesh(new THREE.ConeGeometry(.55,.56,12),'roof',-4.35,2.08,-2.25);
      box(-4.35,1.65,-1.88,.25,.32,.035,'gold');
      for(const x of [4.1,4.5,4.9])rod([x,.18,-.6],[x,.95,-.6],.055,'wood');
      rod([4.05,.95,-.6],[4.95,.95,-.6],.06,'gold');
    }
  }
  function release(){const geometries=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});for(const geometry of geometries)geometry.dispose();root.clear();}
  function anchorFor(e){
    const index=(familyAnchorNodes[e.family]??[]).indexOf(e.id);if(index<0)return null;
    const side=index%2===0?-1:1,row=Math.floor(index/2);
    return {id:`${e.family}:${e.id}`,position:e.family==='LM01'?[side*3.4,.18,1.0-row*.75]:[side*4.0,.12,1.0-row*.75]};
  }
  function visibility(){
    for(const e of effects.values())if(e.group){
      e.group.visible=family===e.family;
      if(e.id===node&&e.elapsed<e.duration){e.group.position.copy(e.basePosition);e.group.scale.copy(e.baseScale);}
      else{const anchor=anchorFor(e);if(anchor){e.group.position.set(...anchor.position);e.group.scale.setScalar(e.memoryScale??.3);}}
    }
  }
  function clear(){if(disposed)return;release();family=null;node=null;phase=null;elapsed=0;world.setAtmosphere?.('default');visibility();world.invalidate();}
  function enter(id,settings={}) {if(disposed||!Object.hasOwn(familyWorldPilots,id))return false;if(settings.nodeId && !familyWorldPilots[id].nodeIds.includes(settings.nodeId))return false;release();family=id;world.setAtmosphere?.(milieuAtmosphere[familyMilieus[id]]??'default');node=typeof settings.nodeId==='string'?settings.nodeId:null;phase=['arrival','work','consequence'].includes(settings.phase)?settings.phase:'arrival';elapsed=0;root.scale.x=id==='LM14'?1:.78;if(world.scene)build(id);visibility();world.invalidate();return true;}
  function setPhase(value){if(disposed||!family||!['arrival','work','consequence'].includes(value))return false;phase=value;elapsed=0;world.invalidate();return true;}
  // Event geometry is a local story consequence; it never decides the assessed response.
  function curvedTimberLocal(parent,points,r=.045,material='wood'){const c=new THREE.CatmullRomCurve3(points.map(a=>new THREE.Vector3(...a)));return mesh(new THREE.TubeGeometry(c,12,r,6,false),material,0,0,0,parent);}
  function questionMark(parent,x,y,z){
    const g=new THREE.Group();parent.add(g);g.position.set(x,y,z);
    curvedTimberLocal(g,[[-.12,.08,0],[-.05,.17,0],[.1,.12,0],[.1,.03,0],[0,-.05,0]],.016);
    ball(0,-.13,0,.024,.024,.024,'dark',g);return g;
  }
  function createEffect(id, initial, lessonModel) {
    const group=world.scene?new THREE.Group():null;
    const data={id,family:outcomeFamily[id],group,elapsed:initial?2500:0,duration:2500,parts:{},modelBound:false};
    if(!group)return data;
    group.name=`family-effect-${id}`;memory.add(group);
    if(id==='M-TH-01') {
      group.position.set(-2.8,.24,-1.55);
      const boat=new THREE.Group();boat.name='leaf-boat';boat.position.y=.18;group.add(boat);
      const leaf=new THREE.Shape();leaf.moveTo(-.6,0);leaf.quadraticCurveTo(-.08,-.36,.58,0);leaf.quadraticCurveTo(-.08,.36,-.6,0);
      const blade=mesh(new THREE.ShapeGeometry(leaf,16),'reed',0,0,0,boat);blade.rotation.x=-Math.PI/2;
      rod([-.45,.018,0],[.43,.018,0],.018,'pale',boat);
      data.parts.subject=boat;
      for(const x of [-.45,.45])ball(x,.08,0,.18,.08,.18,'rock',group);
    } else if(id==='M79-PYTH-CONVERSE') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.65,.1,1,'wood',group);const triangles=lessonModel?.kind==='family-lesson'&&lessonModel.nodeId===id&&lessonModel.activity==='triangle-converse'?lessonModel.triangles:null;
      const valid=Array.isArray(triangles)&&triangles.length>0&&triangles.length<=6&&Array.from(triangles).every(t=>t&&['acute','right','obtuse'].includes(t.classification)&&Array.isArray(t.vertices)&&t.vertices.length===3&&Array.from(t.vertices).every(p=>Array.isArray(p)&&p.length===2&&Array.from(p).every(n=>Number.isFinite(n)&&Math.abs(n)<=10000)));
      if(valid){const diagrams=new THREE.Group();diagrams.name='checked-triangles';group.add(diagrams);data.parts.subject=diagrams;data.modelBound=true;
       triangles.forEach((triangle,i)=>{const xs=triangle.vertices.map(p=>p[0]),ys=triangle.vertices.map(p=>p[1]),span=Math.max(Math.max(...xs)-Math.min(...xs),Math.max(...ys)-Math.min(...ys));if(!(span>0))return;
        const unit=Math.min(.55/span,1),cx=(Math.max(...xs)+Math.min(...xs))/2,cy=(Math.max(...ys)+Math.min(...ys))/2,xbase=(i-(triangles.length-1)/2)*(1.4/Math.max(1,triangles.length));
        const points=triangle.vertices.map(p=>new THREE.Vector3(xbase+(p[0]-cx)*unit,.2+(p[1]-Math.min(...ys))*unit,0));
        const drawing=new THREE.Group();drawing.name='triangle-'+triangle.classification;drawing.userData.classification=triangle.classification;diagrams.add(drawing);for(let j=0;j<3;j++)rod(points[j].toArray(),points[(j+1)%3].toArray(),.02,'pale',drawing);
        if(triangle.classification==='right'){let best=0,bestDot=Infinity;for(let j=0;j<3;j++){const a=points[(j+1)%3].clone().sub(points[j]).normalize(),b=points[(j+2)%3].clone().sub(points[j]).normalize(),dot=Math.abs(a.dot(b));if(dot<bestDot){bestDot=dot;best=j;}}
         const p=points[best],a=points[(best+1)%3].clone().sub(p).normalize().multiplyScalar(.08),b=points[(best+2)%3].clone().sub(p).normalize().multiplyScalar(.08);rod(p.clone().add(a).toArray(),p.clone().add(a).add(b).toArray(),.012,'gold',drawing);rod(p.clone().add(b).toArray(),p.clone().add(a).add(b).toArray(),.012,'gold',drawing);drawing.userData.rightMarker=true;}});}
    } else if(id==='M79-QUAD-INCOMP-02') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.6,.1,.8,'wood',group);const m=lessonModel?.kind==='family-lesson'&&lessonModel.nodeId===id&&lessonModel.activity==='square-roots'?lessonModel:null;
      const valid=m&&Number.isFinite(m.radicand)&&Array.isArray(m.roots)&&m.roots.length<=2&&Array.from(m.roots).every(Number.isFinite)&&((m.radicand<0&&m.roots.length===0)||(m.radicand===0&&m.roots.length===1)||(m.radicand>0&&m.roots.length===2));
      if(valid){const marks=new THREE.Group();marks.name='checked-root-marks';marks.userData.result=m.roots.length?'roots':'none';group.add(marks);data.parts.subject=marks;data.modelBound=true;rod([-.65,.2,0],[.65,.2,0],.02,'pale',marks);
       const max=Math.max(1,...m.roots.map(Math.abs));for(const value of m.roots){const x=.55*value/max;const pin=ball(x,.27,0,.09,.09,.09,'gold',marks);pin.userData.value=value;}if(!m.roots.length){const cover=box(0,.28,0,.38,.12,.3,'wood',marks);cover.name='no-root-detour';}}
    } else if(id==='M79-SYSTEM-GRAPH') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.6,.1,.9,'wood',group);const m=lessonModel?.kind==='family-lesson'&&lessonModel.nodeId===id&&lessonModel.activity==='system-graph'?lessonModel:null;
      const valid=m&&['one','none','many'].includes(m.relation)&&Array.isArray(m.equations)&&m.equations.length===2&&Array.from(m.equations).every(e=>Array.isArray(e)&&e.length===3&&Array.from(e).every(Number.isFinite)&&Math.hypot(e[0],e[1])>0)&&Array.isArray(m.points)&&Array.from(m.points).every(p=>Array.isArray(p)&&p.length===2&&Array.from(p).every(Number.isFinite))&&((m.relation==='one'&&m.points.length===1)||(m.relation!=='one'&&m.points.length===2));
      if(valid){box(0,.8,-.06,1.4,1,.05,'dark',group);const graph=new THREE.Group();graph.name='checked-system-graph';graph.userData.relation=m.relation;group.add(graph);data.parts.subject=graph;data.modelBound=true;const extent=Math.max(4,...m.points.flat().map(Math.abs),...m.equations.map(([a,b,c])=>Math.abs(c)/Math.hypot(a,b)))*1.25;
       m.equations.forEach(([a,b,c],i)=>{const norm=a*a+b*b,p=[a*c/norm,b*c/norm],d=[-b,a];let lo=-Infinity,hi=Infinity;for(let k=0;k<2;k++){if(Math.abs(d[k])<1e-10)continue;const u=(-extent-p[k])/d[k],v=(extent-p[k])/d[k];lo=Math.max(lo,Math.min(u,v));hi=Math.min(hi,Math.max(u,v));}if(lo<=hi&&Number.isFinite(lo)&&Number.isFinite(hi)){const point=t=>[(p[0]+d[0]*t)/extent*.45,.8+(p[1]+d[1]*t)/extent*.45,i*.012];const line=rod(point(lo),point(hi),.018,i?'lightWater':'gold',graph);line.userData.equationIndex=i;}});
       if(m.relation==='one'){const p=m.points[0],mark=ball(p[0]/extent*.45,.8+p[1]/extent*.45,.04,.065,.065,.065,'roof',graph);mark.name='system-intersection';}}
    } else if(id==='M79-COMB-01') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.7,.7])rod([x,.05,0],[x,1,0],.04,'wood',group);rod([-.7,1,0],[.7,1,0],.035,'wood',group);const m=lessonModel?.kind==='family-lesson'&&lessonModel.nodeId===id&&lessonModel.activity==='combinations'?lessonModel:null;
      const valid=m&&Array.isArray(m.factors)&&m.factors.length===2&&Array.from(m.factors).every(a=>Array.isArray(a)&&a.length>0&&a.length<=6&&Array.from(a).every(x=>typeof x==='string'))&&Array.isArray(m.rows)&&m.rows.length<=24&&m.count===m.rows.length&&Array.from(m.rows).every(r=>Array.isArray(r)&&r.length===2&&m.factors[0].includes(r[0])&&m.factors[1].includes(r[1]))&&new Set(m.rows.map(r=>r.join('|'))).size===m.rows.length&&Array.isArray(m.forbidden)&&Array.from(m.forbidden).every(r=>Array.isArray(r)&&r.length===2&&m.factors[0].includes(r[0])&&m.factors[1].includes(r[1]))&&new Set(m.forbidden.map(r=>r.join('|'))).size===m.forbidden.length&&m.rows.every(r=>!m.forbidden.some(f=>f[0]===r[0]&&f[1]===r[1]))&&m.rows.length===m.factors[0].length*m.factors[1].length-m.forbidden.length;
      if(valid){const flags=new THREE.Group();flags.name='checked-combination-flags';group.add(flags);data.parts.subject=flags;data.modelBound=true;for(const row of m.rows){const i=m.factors[0].indexOf(row[0]),j=m.factors[1].indexOf(row[1]),x=(i-(m.factors[0].length-1)/2)*.3,z=(j-(m.factors[1].length-1)/2)*.18;rod([x,.1,z],[x,.55,z],.014,'wood',flags);const flag=box(x+.08,.5,z,.16,.1,.02,(i+j)%2?'pale':'roof',flags);flag.userData.pair=[...row];}}
    } else if(id==='CHEM79-BALANCE') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.65,.1,.9,'wood',group);const m=lessonModel?.kind==='family-lesson'&&lessonModel.nodeId===id&&lessonModel.activity==='chemical-balance'?lessonModel:null;
      const valid=m&&Array.isArray(m.atoms)&&m.atoms.length>0&&m.atoms.length<=8&&Array.from(m.atoms).every(a=>a&&typeof a.element==='string'&&Number.isSafeInteger(a.left)&&a.left>0&&a.left===a.right&&a.left<=100000);
      if(valid){const bars=new THREE.Group();bars.name='checked-atom-ledger';group.add(bars);data.parts.subject=bars;data.modelBound=true;const max=Math.max(...m.atoms.map(a=>a.left));m.atoms.forEach((a,i)=>{const z=(i-(m.atoms.length-1)/2)*.17,w=.55*a.left/max;for(const side of [-1,1]){const bar=box(side*(.1+w/2),.22,z,w,.06,.11,i%2?'pale':'gold',bars);bar.userData.element=a.element;bar.userData.count=side<0?a.left:a.right;}});}
    } else if(id==='CHEM79-CONC-CALC') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.65,.1,.9,'wood',group);const m=lessonModel?.kind==='family-lesson'&&lessonModel.nodeId===id&&lessonModel.activity==='concentration'?lessonModel:null;
      const valid=m&&m.unit==='g'&&m.basis==='mass-mass'&&['none','dilute','aliquot'].includes(m.operation)&&[m.solute,m.total,m.percent,m.retainedSolute,m.retainedTotal].every(Number.isFinite)&&m.total>0&&m.solute>=0&&m.solute<=m.total&&m.retainedTotal>=0&&m.retainedSolute>=0&&m.retainedSolute<=m.retainedTotal&&Math.abs(m.percent-100*m.solute/m.total)<.051;
      if(valid){const ledger=new THREE.Group();ledger.name='checked-solution-ledger';group.add(ledger);data.parts.subject=ledger;data.modelBound=true;const rows=[{total:m.total,solute:m.solute,kind:'target'},...(m.operation!=='none'&&m.retainedTotal>0?[{total:m.retainedTotal,solute:m.retainedSolute,kind:'retained'}]:[])],max=Math.max(...rows.map(r=>r.total));
       rows.forEach((r,i)=>{const w=1.2*r.total/max,x=-.6+w/2,z=(i-(rows.length-1)/2)*.22;const whole=box(x,.21,z,w,.055,.14,'pale',ledger);whole.userData.mass=r.total;whole.userData.role=r.kind;const portion=w*r.solute/r.total;if(portion>0){const part=box(-.6+portion/2,.25,z,portion,.025,.12,'water',ledger);part.userData.solute=r.solute;part.userData.role=r.kind;}});}
    } else if(id==='CHEM79-CONC-COMP') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,.6,0],.045,'wood',group);const table=box(0,.65,0,1.2,.1,.7,'wood',group);table.name='sample-comparison-table';data.parts.subject=table;
    } else if(id==='CHEM79-NUTRIENT-FAT') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.2,.1,.7,'wood',group);const cloth=box(0,.19,0,.95,.025,.55,'cloth',group);cloth.name='food-study-cloth';data.parts.subject=cloth;
    } else if(id==='CHEM79-ORG-GROUP') {
      group.position.set(2.55,.2,-2.3);box(0,.55,0,1.1,.9,.55,'wood',group);const door=new THREE.Group();door.position.set(-.55,.55,.3);group.add(door);box(.55,0,0,1.1,.85,.04,'pale',door);door.name='nutrient-exhibit-door';data.parts.subject=door;
    } else if(id==='CHEM79-ATOMICNUM') {
      group.position.set(2.55,.2,-2.3);box(0,.55,0,1,.9,.55,'wood',group);const door=new THREE.Group();door.position.set(-.5,.55,.3);group.add(door);box(.5,0,0,1,.85,.04,'pale',door);door.name='atomic-number-vitrine';data.parts.subject=door;
    } else if(id==='CHEM79-REACTION-MODEL') {
      group.position.set(2.55,.2,-2.3);box(0,.5,0,1.15,.8,.65,'dark',group);const hatch=new THREE.Group();hatch.position.set(-.57,.5,.34);group.add(hatch);box(.57,0,0,1.14,.75,.04,'pale',hatch);hatch.name='reaction-model-chamber';data.parts.subject=hatch;
    } else if(id==='CHEM79-SCALE') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.55,.55])rod([x,.05,0],[x,1.1,0],.045,'wood',group);const board=box(0,.8,0,1.25,.5,.05,'pale',group);board.name='matter-scale-display';data.parts.subject=board;
    } else if(id==='CHEM79-RATE-CONC') {
      group.position.set(2.55,.2,-2.3);box(0,.55,0,1.1,.9,.55,'wood',group);const hatch=new THREE.Group();hatch.position.set(-.55,.55,.3);group.add(hatch);box(.55,0,0,1.1,.85,.04,'pale',hatch);hatch.name='concentration-study-hatch';data.parts.subject=hatch;
    } else if(id==='CHEM79-RATE-SURF') {
      group.position.set(2.55,.2,-2.3);box(0,.15,0,1.3,.2,.75,'wood',group);const lid=new THREE.Group();lid.position.set(0,.27,-.38);group.add(lid);box(0,0,.38,1.3,.05,.75,'pale',lid);lid.name='surface-study-lid';data.parts.subject=lid;
    } else if(id==='CHEM79-RATE-TEMP') {
      group.position.set(2.55,.2,-2.3);box(0,.55,0,.9,.9,.55,'wood',group);const cover=new THREE.Group();cover.position.set(-.45,.55,.3);group.add(cover);box(.45,0,0,.9,.85,.04,'pale',cover);cover.name='temperature-study-cover';data.parts.subject=cover;
    } else if(id==='CHEM79-LAB-01') {
      group.position.set(2.55,.2,-2.3);box(0,.25,0,.95,.38,.6,'wood',group);const lid=new THREE.Group();lid.position.set(0,.47,-.3);group.add(lid);box(0,0,.3,.98,.07,.63,'pale',lid);lid.name='virtual-lab-case';data.parts.subject=lid;
    } else if(id==='CHEM79-MEAS-01') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,.6,0],.045,'wood',group);const table=box(0,.65,0,1.2,.1,.7,'wood',group);table.name='sample-measure-table';data.parts.subject=table;
    } else if(id==='PHY79-OHM') {
      group.position.set(2.55,.2,-2.3);box(0,.5,0,1,.8,.55,'wood',group);const lid=new THREE.Group();lid.position.set(-.5,.55,.3);group.add(lid);box(.5,0,0,1,.75,.04,'pale',lid);lid.name='ohm-meter-cover';data.parts.subject=lid;
    } else if(id==='ENV-PHY-CAUSE-MOTION-01') {
      group.position.set(2.55,.2,-2.3);ball(0,.15,0,.65,.12,.25,'wood',group);rod([.65,.05,.1],[.65,.5,.1],.045,'wood',group);const line=rod([.35,.18,.1],[.65,.25,.1],.025,'gold',group);line.name='test-boat-mooring';data.parts.subject=line;
    } else if(id==='PHY79-ACCEL-CALC') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.4,.1,.7,'wood',group);rod([-.55,.18,0],[-.55,1,0],.045,'wood',group);const gate=new THREE.Group();gate.position.set(-.55,.95,0);group.add(gate);rod([0,0,0],[1.1,0,0],.035,'pale',gate);gate.name='departure-dock-gate';data.parts.subject=gate;
    } else if(id==='PHY79-ACCEL-GRAPH') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.05,0],.045,'wood',group);const map=box(0,.8,0,1.15,.5,.05,'pale',group);map.name='journey-chart-board';data.parts.subject=map;
    } else if(id==='PHY79-SPEED-REARR') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.2,0],.045,'wood',group);const flag=box(.22,.28,0,.45,.25,.04,'pale',group);flag.name='meeting-pennant';data.parts.subject=flag;
    } else if(id==='PHY79-SPEED-MIXED') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.05,0],.045,'wood',group);box(0,.8,0,1.15,.5,.05,'wood',group);const cover=new THREE.Group();cover.position.set(-.57,.8,.04);group.add(cover);box(.57,0,0,1.14,.48,.04,'pale',cover);cover.name='island-message-cover';data.parts.subject=cover;
    } else if(id==='PHY79-ST-GRAPH') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.55,.55])rod([x,.05,0],[x,.9,0],.04,'wood',group);const canopy=box(0,.95,0,1.3,.05,.8,'cloth',group);canopy.name='picnic-cove-canopy';data.parts.subject=canopy;
    } else if(id==='PHY79-VT-GRAPH') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1,0],.045,'wood',group);ball(0,1.14,0,.17,.17,.17,'gold',group);const hatch=new THREE.Group();hatch.position.set(-.2,1.14,.18);group.add(hatch);box(.2,0,0,.4,.4,.04,'wood',hatch);hatch.name='journey-lantern-hatch';data.parts.subject=hatch;
    } else if(id==='PHY79-PREDICT-01') {
      group.position.set(2.55,.2,-2.3);box(0,.5,0,.95,.8,.55,'wood',group);const cover=new THREE.Group();cover.position.set(-.48,.55,.3);group.add(cover);box(.48,0,0,.95,.6,.04,'pale',cover);cover.name='prediction-observation-hatch';data.parts.subject=cover;
    } else if(id==='SCI-ENV-OBS-01') {
      group.position.set(2.55,.2,-2.3);ball(0,.2,0,.65,.18,.45,'rock',group);const lens=new THREE.Group();lens.name='shore-trace-lens';group.add(lens);data.parts.subject=lens;const ring=mesh(new THREE.TorusGeometry(.22,.025,8,24),'gold',0,.45,0,lens);ring.rotation.x=Math.PI/2;rod([.15,.45,.15],[.4,.45,.4],.03,'wood',lens);
    } else if(id==='PHY79-PREC-01') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.2,.1,.75,'wood',group);const report=box(0,.2,0,.8,.03,.5,'pale',group);report.name='precision-report';data.parts.subject=report;
    } else if(id==='CHEM79-PERIOD-GROUP') {
      group.position.set(2.55,.2,-2.3);box(0,.58,0,1.1,1,.5,'wood',group);const door=new THREE.Group();door.position.set(-.55,.58,.27);group.add(door);box(.55,0,0,1.1,.9,.04,'pale',door);door.name='element-gallery-door';data.parts.subject=door;
    } else if(id==='M-PROG-07') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.4,.1,.7,'wood',group);rod([-.5,.16,0],[-.5,.9,0],.05,'wood',group);const barrier=new THREE.Group();barrier.position.set(-.5,.86,0);group.add(barrier);rod([0,0,0],[1,0,0],.035,'pale',barrier);barrier.name='ferry-loading-gate';data.parts.subject=barrier;
    } else if(id==='M79-SEQ-01') {
      group.position.set(2.55,.2,-2.3);box(0,.65,0,1.2,1.1,.35,'wood',group);const shutter=new THREE.Group();shutter.position.set(-.35,.75,.2);group.add(shutter);box(.35,0,0,.7,.55,.04,'pale',shutter);shutter.name='workshop-window-shutter';data.parts.subject=shutter;
    } else if(id==='M79-TRIG-01') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.05,0],.045,'wood',group);box(0,.8,0,1.1,.5,.05,'wood',group);const cover=new THREE.Group();cover.position.set(-.55,.8,.04);group.add(cover);box(.55,0,0,1.1,.5,.04,'pale',cover);cover.name='bridge-measure-cover';data.parts.subject=cover;
    } else if(id==='M79-TRUTH-01') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1,0],.045,'wood',group);const sign=box(0,.82,0,1,.3,.05,'pale',group);sign.name='lookout-message-board';data.parts.subject=sign;
    } else if(id==='M79-POLY-ADD') {
      group.position.set(2.55,.2,-2.3);rod([-.55,.05,0],[-.55,1,0],.05,'wood',group);const arm=new THREE.Group();arm.position.set(-.55,.95,0);group.add(arm);rod([0,0,0],[1.2,0,0],.04,'pale',arm);arm.name='joint-order-barrier';data.parts.subject=arm;
    } else if(id==='M79-POLY-SUB') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.2,.1,.75,'wood',group);const book=new THREE.Group();book.name='boat-agreement-book';group.add(book);data.parts.subject=book;box(-.25,.24,0,.46,.05,.5,'pale',book);box(.25,.24,0,.46,.05,.5,'pale',book);rod([0,.27,-.25],[0,.27,.25],.018,'dark',book);
    } else if(id==='M79-ZERO') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.05,0],.045,'wood',group);ball(0,1.18,0,.17,.17,.17,'gold',group);const door=new THREE.Group();door.position.set(-.2,1.18,.18);group.add(door);box(.2,0,0,.4,.4,.04,'wood',door);door.name='beacon-zero-hatch';data.parts.subject=door;
    } else if(id==='PHY79-CHARGING') {
      group.position.set(2.55,.2,-2.3);box(0,.45,0,1,.7,.6,'wood',group);const door=new THREE.Group();door.position.set(-.5,.45,.32);group.add(door);box(.5,0,0,1,.65,.04,'pale',door);door.name='charge-study-hatch';data.parts.subject=door;
    } else if(id==='ENV-PHY-SOUND-01') {
      group.position.set(2.55,.2,-2.3);box(0,.55,0,1.25,.9,.18,'wood',group);const source=mesh(new THREE.CircleGeometry(.28,24),'pale',0,.58,.11,group);source.name='sound-vibration-source';data.parts.subject=source;
    } else if(id==='M79-POLY-ANGLES') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,.6,0],.045,'wood',group);box(0,.65,0,1.2,.1,.7,'wood',group);const sheet=box(0,.72,0,.85,.03,.5,'pale',group);sheet.name='roof-plan-sheet';data.parts.subject=sheet;
    } else if(id==='M79-POLY-PERIM') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.2,.1,.7,'wood',group);const reel=new THREE.Group();reel.name='boundary-rope-reel';group.add(reel);data.parts.subject=reel;const ring=mesh(new THREE.TorusGeometry(.25,.04,8,24),'gold',0,.28,0,reel);ring.rotation.x=Math.PI/2;
    } else if(id==='M79-EQ1-FORM') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.05,0],.045,'wood',group);const board=box(0,.85,0,1,.4,.05,'pale',group);board.name='sluice-question-board';data.parts.subject=board;
    } else if(id==='M79-INEQ-SOLVE') {
      group.position.set(2.55,.2,-2.3);box(0,.55,0,1,.9,.55,'wood',group);const door=new THREE.Group();door.position.set(-.5,.55,.3);group.add(door);box(.5,0,0,1,.85,.04,'pale',door);door.name='control-study-hatch';data.parts.subject=door;
    } else if(id==='M79-TRI-ANGLE-SUM') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1,0],.04,'wood',group);const board=box(0,.75,0,1.15,.45,.05,'pale',group);board.name='gable-drawing-board';data.parts.subject=board;
    } else if(id==='M79-ANGLE-REL') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.05,0],.045,'wood',group);const sign=box(0,.85,0,1,.28,.05,'pale',group);sign.name='junction-sign';data.parts.subject=sign;
    } else if(id==='CHEM79-SUBSCRIPT') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.4,.12,.9,'wood',group);const book=new THREE.Group();book.name='formula-book';group.add(book);data.parts.subject=book;box(-.3,.24,0,.56,.06,.65,'pale',book);box(.3,.24,0,.56,.06,.65,'pale',book);rod([0,.27,-.33],[0,.27,.33],.022,'dark',book);
    } else if(id==='CHEM79-MIX-HOM') {
      group.position.set(2.55,.2,-2.3);box(0,.55,0,1,.9,.55,'wood',group);const door=new THREE.Group();door.position.set(-.5,.55,.3);group.add(door);box(.5,0,0,1,.85,.04,'pale',door);door.name='mixture-sample-door';data.parts.subject=door;
    } else if(id==='CHEM79-SEPARATE-02') {
      group.position.set(2.55,.2,-2.3);box(0,.15,0,1.3,.2,.75,'wood',group);const lid=new THREE.Group();lid.position.set(0,.27,-.38);group.add(lid);box(0,0,.38,1.3,.05,.75,'pale',lid);lid.name='recovery-table-lid';data.parts.subject=lid;
    } else if(id==='CHEM79-WATERFAT-SOL') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.05,0],.045,'wood',group);const screen=box(0,.8,0,1.15,.5,.05,'pale',group);screen.name='partition-study-screen';data.parts.subject=screen;
    } else if(id==='M79-MEDIAN') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.2,.1,.75,'wood',group);const book=new THREE.Group();book.name='harbor-observation-book';group.add(book);data.parts.subject=book;box(-.25,.23,0,.46,.05,.5,'pale',book);box(.25,.23,0,.46,.05,.5,'pale',book);rod([0,.26,-.25],[0,.26,.25],.018,'dark',book);
    } else if(id==='M79-MODE') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.45,.45])rod([x,.05,0],[x,1.05,0],.04,'wood',group);box(0,.8,0,1.05,.4,.05,'wood',group);const card=box(0,.8,.04,.65,.28,.025,'pale',group);card.name='outing-summary-card';data.parts.subject=card;
    } else if(id==='M79-SPREAD') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.6,.6])rod([x,.05,0],[x,.95,0],.045,'wood',group);const canopy=box(0,1,0,1.4,.05,.85,'cloth',group);canopy.name='observation-canopy';data.parts.subject=canopy;
    } else if(id==='M79-PROB-CLASSIC') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.25,0],.045,'wood',group);const flag=box(.22,.28,0,.45,.26,.04,'pale',group);flag.name='observation-turn-flag';data.parts.subject=flag;
    } else if(id==='M79-REAL-02') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.55,.55])rod([x,.05,0],[x,.9,0],.04,'wood',group);const canopy=box(0,.95,0,1.3,.05,.8,'cloth',group);canopy.name='lookout-path-canopy';data.parts.subject=canopy;
    } else if(id==='M79-RAY') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1,0],.045,'wood',group);const sign=box(0,.82,0,.8,.3,.05,'pale',group);sign.name='lookout-route-sign';data.parts.subject=sign;
    } else if(id==='M79-SIM-CRIT') {
      group.position.set(2.55,.2,-2.3);box(0,.25,0,1.1,.4,.7,'wood',group);const lid=new THREE.Group();lid.position.set(0,.48,-.35);group.add(lid);box(0,0,.35,1.12,.06,.7,'pale',lid);lid.name='scale-model-case-lid';data.parts.subject=lid;
    } else if(id==='M79-SIMILAR-SCALE') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,.6,0],.045,'wood',group);box(0,.65,0,1.2,.1,.7,'wood',group);const sheet=box(0,.72,0,.85,.03,.5,'pale',group);sheet.name='lookout-drawing-sheet';data.parts.subject=sheet;
    } else if(id==='M79-UNIT-VOL') {
      group.position.set(2.55,.2,-2.3);mesh(new THREE.CylinderGeometry(.4,.4,.8,18,1,true),'pale',0,.55,0,group);const hatch=new THREE.Group();hatch.position.set(-.25,.8,.4);group.add(hatch);box(.25,0,0,.5,.35,.04,'wood',hatch);hatch.name='volume-tank-hatch';data.parts.subject=hatch;
    } else if(id==='M79-EXPR-EVAL') {
      group.position.set(2.55,.2,-2.3);box(0,.3,0,1,.5,.7,'wood',group);const tag=box(0,.4,.37,.55,.28,.03,'pale',group);tag.name='supply-label';data.parts.subject=tag;
    } else if(id==='ENV-PHY-DEVICE-01') {
      group.position.set(2.55,.2,-2.3);ball(0,.04,0,.7,.08,.55,'rock',group);const observed=lessonModel?.kind==='electricity-harbor'&&lessonModel.mode==='device'&&lessonModel.observed===true&&['lantern','beacon'].includes(lessonModel.given?.device)&&Array.isArray(lessonModel.outcome?.observation)&&lessonModel.outcome.observation.length===1&&['lamp-on','lamp-off'].includes(lessonModel.outcome.observation[0]);
      const model=new THREE.Group();model.name='virtual-device';group.add(model);data.parts.subject=model;if(observed)data.modelBound=true;
      if(observed&&lessonModel.given.device==='beacon'){box(0,.48,0,.65,.6,.4,'wood',model);const lens=ball(0,.53,.24,.17,.17,.06,'dark',model);lens.name='device-lens';data.parts.lens=lens;}
      else{rod([0,.15,0],[0,.55,0],.05,'wood',model);const bulb=ball(0,.75,0,.2,.2,.2,'dark',model);bulb.name='device-lens';data.parts.lens=bulb;for(const x of [-.22,.22])rod([x,.56,0],[x,.96,0],.02,'gold',model);curvedTimberLocal(model,[[-.22,.96,0],[0,1.12,0],[.22,.96,0]],.025,'wood');}
      data.parts.lampOn=!!observed&&lessonModel.outcome.observation[0]==='lamp-on';if(data.parts.lampOn){const light=new THREE.PointLight(0xffc873,0,2.5);light.position.set(0,.7,.3);model.add(light);data.parts.light=light;}
    } else if(id==='M-CALC-STRAT') {
      group.position.set(2.55,.2,-2.3);box(.55,.13,0,.7,.1,.5,'wood',group);const boat=new THREE.Group();boat.position.set(-.8,.12,0);boat.name='strategy-delivery-boat';group.add(boat);ball(0,0,0,.42,.1,.22,'wood',boat);box(0,.18,0,.3,.25,.25,'pale',boat);data.parts.subject=boat;
    } else if(id==='M-ALG-08') {
      group.position.set(2.55,.2,-2.3);box(0,.3,0,.9,.5,.6,'wood',group);const lid=new THREE.Group();lid.position.set(0,.58,-.3);group.add(lid);box(0,0,.3,.95,.07,.62,'pale',lid);lid.name='mechanism-box-lid';data.parts.subject=lid;
    } else if(id==='M79-CONG-CRIT') {
      group.position.set(2.55,.2,-2.3);box(.55,.13,0,.75,.1,.5,'wood',group);const boat=new THREE.Group();boat.position.set(-.8,.12,0);boat.name='spare-part-boat';group.add(boat);ball(0,0,0,.42,.1,.22,'wood',boat);box(0,.18,0,.32,.25,.25,'pale',boat);data.parts.subject=boat;
    } else if(id==='M79-CURVE') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.3,.1,.8,'wood',group);const map=box(0,.2,0,.9,.025,.6,'pale',group);map.name='route-map';data.parts.subject=map;
    } else if(id==='M79-DIAGRAM-INTERP') {
      group.position.set(2.55,.2,-2.3);box(0,.7,0,1.15,1.1,.5,'wood',group);const door=new THREE.Group();door.position.set(-.55,.7,.27);group.add(door);box(.55,0,0,1.1,.85,.04,'pale',door);door.name='harbor-exhibit-door';data.parts.subject=door;
    } else if(id==='M79-DIAGRAM-PROD') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.55,.55])rod([x,.05,0],[x,1.1,0],.045,'wood',group);box(0,.8,0,1.25,.5,.05,'wood',group);const cover=new THREE.Group();cover.position.set(-.62,.8,.04);group.add(cover);box(.62,0,0,1.24,.5,.04,'pale',cover);cover.name='observations-board-cover';data.parts.subject=cover;
    } else if(id==='M79-INT-DIV') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.2,.035,.8,'water',group);const buoy=new THREE.Group();buoy.name='measurement-buoy';group.add(buoy);ball(0,.35,0,.24,.18,.24,'roof',buoy);rod([0,.5,0],[0,.9,0],.03,'wood',buoy);data.parts.subject=buoy;
    } else if(id==='M79-INT-MUL') {
      group.position.set(2.55,.2,-2.3);box(0,.5,0,.8,.8,.55,'wood',group);const hatch=new THREE.Group();hatch.position.set(-.3,.55,.3);group.add(hatch);box(.3,0,0,.6,.45,.04,'pale',hatch);hatch.name='measurement-device-hatch';data.parts.subject=hatch;
    } else if(id==='M79-INTERCEPT') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.15,.1,.7,'wood',group);const book=new THREE.Group();book.name='boat-test-log';group.add(book);data.parts.subject=book;box(-.25,.24,0,.46,.05,.5,'pale',book);box(.25,.24,0,.46,.05,.5,'pale',book);rod([0,.27,-.25],[0,.27,.25],.018,'dark',book);
    } else if(id==='M79-MEAN') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,.6,0],.045,'wood',group);box(0,.65,0,1.2,.1,.7,'wood',group);const report=box(0,.72,0,.82,.03,.5,'pale',group);report.name='harbor-mean-report';data.parts.subject=report;
    } else if(id==='PHY79-SUPPORT') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,.4,0],.055,'wood',group);box(0,.45,0,1.2,.1,.65,'wood',group);const load=box(0,.78,0,.65,.55,.5,'pale',group);load.name='supported-load';data.parts.subject=load;
    } else if(id==='PHY79-WEIGHT') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.2,.12,.8,'wood',group);const scale=new THREE.Group();scale.name='weight-research-scale';group.add(scale);data.parts.subject=scale;rod([0,.15,0],[0,.8,0],.05,'gold',scale);rod([-.5,.8,0],[.5,.8,0],.035,'gold',scale);for(const x of [-.5,.5]){rod([x,.8,0],[x,.45,0],.018,'wood',scale);box(x,.42,0,.35,.04,.3,'pale',scale);}
    } else if(id==='PHY79-FRICTION') {
      group.position.set(2.55,.2,-2.3);const track=box(0,.12,0,1.5,.1,.65,'wood',group);track.name='friction-track';const load=box(0,.35,0,.55,.35,.4,'pale',group);load.name='friction-load';data.parts.subject=load;
      if(lessonModel?.kind==='force-workshop'&&lessonModel.surfaceOptions===true&&['rough','smooth'].includes(lessonModel.surfaceView)){data.modelBound=true;if(lessonModel.surfaceView==='rough')for(let x=-.6;x<=.6;x+=.15)rod([x,.19,-.25],[x,.19,.25],.012,'dark',group);}
    } else if(id==='PHY79-KINETIC') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.6,.1,.7,'wood',group);box(.65,.3,0,.12,.4,.75,'cloth',group);
      const context=lessonModel?.kind==='energy-islands'&&lessonModel.mode==='kinetic'&&lessonModel.observed===true?lessonModel.given?.context:null;
      if(['boat','cart'].includes(context)){const vehicle=new THREE.Group();vehicle.name=context==='boat'?'stopped-model-boat':'stopped-model-cart';group.add(vehicle);data.parts.subject=vehicle;data.modelBound=true;if(context==='boat')ball(0,.3,0,.48,.13,.24,'wood',vehicle);else{box(0,.38,0,.7,.25,.4,'pale',vehicle);for(const x of [-.25,.25])for(const z of [-.23,.23]){const wheel=mesh(new THREE.CylinderGeometry(.11,.11,.07,12),'dark',x,.2,z,vehicle);wheel.rotation.x=Math.PI/2;}}}
    } else if(id==='PHY79-ELEC-ENERGY') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1,0],.045,'wood',group);ball(0,1.12,0,.18,.18,.18,'gold',group);const hatch=new THREE.Group();hatch.position.set(-.2,1.12,.18);group.add(hatch);box(.2,0,0,.4,.4,.04,'wood',hatch);hatch.name='energy-lantern-hatch';data.parts.subject=hatch;
    } else if(id==='CHEM79-INDICATOR') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.05,0],.04,'wood',group);box(0,.72,0,1.2,.6,.05,'wood',group);const shutter=new THREE.Group();shutter.position.set(-.6,.72,.04);group.add(shutter);box(.6,0,0,1.2,.6,.04,'pale',shutter);shutter.name='indicator-window';data.parts.subject=shutter;
    } else if(id==='CHEM79-PH') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.4,.12,.8,'wood',group);const plant=new THREE.Group();plant.name='ph-garden-plant';group.add(plant);data.parts.subject=plant;rod([0,.18,0],[0,.8,0],.035,'reed',plant);ball(.2,.6,0,.28,.1,.15,'reed',plant);ball(-.2,.45,0,.28,.1,.15,'reed',plant);
    } else if(id==='CHEM79-CARBON-BURN') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.3,.1,.8,'wood',group);const map=box(0,.21,0,.9,.03,.6,'pale',group);map.name='carbon-research-map';data.parts.subject=map;
    } else if(id==='CHEM79-ELECTRON') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,.55,0],.045,'wood',group);ball(0,.85,0,.14,.14,.14,'dark',group);const cloud=ball(0,.85,0,.45,.45,.45,'cloth',group);cloud.name='electron-cloud-region';data.parts.subject=cloud;
    } else if(id==='CHEM79-NEUTRON') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.2,.1,.7,'wood',group);const card=new THREE.Group();card.name='neutral-particle-card';group.add(card);data.parts.subject=card;box(0,.23,0,.7,.05,.5,'pale',card);const zero=mesh(new THREE.TorusGeometry(.12,.02,6,20),'dark',0,.27,0,card);zero.rotation.x=Math.PI/2;
    } else if(id==='M-SYM-01') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.1,.1,.8,'wood',group);box(0,.2,0,.8,.03,.55,'water',group);const cover=new THREE.Group();cover.position.set(-.4,.22,0);group.add(cover);box(.4,0,0,.8,.05,.55,'pale',cover);cover.name='mirror-cover';data.parts.subject=cover;
    } else if(id==='M-SYM-02') {
      group.position.set(2.55,.2,-2.3);ball(0,.04,0,.35,.08,.3,'rock',group);rod([0,.05,0],[0,1.2,0],.045,'wood',group);const windsock=new THREE.Group();windsock.position.set(0,1.1,0);windsock.name='windsock';group.add(windsock);const cloth=mesh(new THREE.ConeGeometry(.18,.55,12,1,true),'cloth',.3,0,0,windsock);cloth.rotation.z=Math.PI/2;rod([.56,0,0],[.9,.04,.04],.018,'roof',windsock);rod([.56,-.08,0],[.86,-.13,-.04],.018,'pale',windsock);data.parts.subject=windsock;
    } else if(id==='M-SCALE-02') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.05,0],.04,'wood',group);const board=box(0,.8,0,1.2,.5,.06,'pale',group);board.name='camp-map-board';data.parts.subject=board;
    } else if(id==='M-DEC-06') {
      group.position.set(2.55,.2,-2.3);box(0,.15,0,1.1,.18,.6,'wood',group);const lid=new THREE.Group();lid.position.set(0,.26,-.3);group.add(lid);box(0,0,.3,1.12,.06,.6,'pale',lid);lid.name='precision-table-lid';data.parts.subject=lid;
    } else if(id==='M-TIME-02') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.15,0],.05,'wood',group);ball(0,1.2,0,.22,.22,.12,'gold',group);const cover=new THREE.Group();cover.position.set(-.23,1.2,.13);group.add(cover);box(.23,0,0,.46,.45,.04,'wood',cover);cover.name='meeting-clock-cover';data.parts.subject=cover;
    } else if(id==='M-UNIT-03') {
      group.position.set(2.55,.2,-2.3);box(.55,.13,0,.8,.1,.5,'wood',group);const boat=new THREE.Group();boat.position.set(-.8,.12,0);boat.name='unit-message-boat';group.add(boat);ball(0,0,0,.42,.1,.22,'wood',boat);box(0,.18,0,.28,.25,.25,'pale',boat);data.parts.subject=boat;
    } else if(id==='M-UNIT-05') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.15,.1,.7,'wood',group);const timer=new THREE.Group();timer.name='meeting-timer';group.add(timer);data.parts.subject=timer;mesh(new THREE.ConeGeometry(.16,.25,12),'pale',0,.29,0,timer);const lower=mesh(new THREE.ConeGeometry(.16,.25,12),'pale',0,.55,0,timer);lower.rotation.z=Math.PI;
    } else if(id==='M-STAT-01') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.2,.1,.75,'wood',group);box(0,.2,0,.7,.035,.5,'pale',group);const lens=new THREE.Group();lens.name='plan-inspection-lens';group.add(lens);data.parts.subject=lens;const ring=mesh(new THREE.TorusGeometry(.2,.025,8,24),'gold',0,.44,0,lens);ring.rotation.x=Math.PI/2;rod([.14,.44,.14],[.38,.44,.38],.03,'wood',lens);
    } else if(id==='M-STAT-02') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1,0],.045,'wood',group);box(0,.75,0,1.1,.5,.05,'wood',group);const hatch=new THREE.Group();hatch.position.set(-.55,.75,.04);group.add(hatch);box(.55,0,0,1.1,.5,.04,'pale',hatch);hatch.name='observations-hatch';data.parts.subject=hatch;
    } else if(id==='M-PROB-06') {
      group.position.set(2.55,.2,-2.3);box(0,.55,0,1.15,.95,.6,'wood',group);const shutter=new THREE.Group();shutter.position.set(-.3,.75,.32);group.add(shutter);box(.3,0,0,.6,.45,.04,'pale',shutter);shutter.name='islet-study-window';data.parts.subject=shutter;
    } else if(id==='M-PS-03') {
      group.position.set(2.55,.2,-2.3);box(.6,.12,-.48,.7,.1,.5,'wood',group);const boat=new THREE.Group();boat.position.set(-.8,.12,0);boat.name='tent-supply-boat';group.add(boat);ball(0,0,0,.48,.12,.24,'wood',boat);box(0,.19,0,.3,.26,.25,'pale',boat);rod([-.15,.1,0],[-.15,.82,0],.035,'wood',boat);const sail=new THREE.Shape();sail.moveTo(-.13,.72);sail.lineTo(.32,.18);sail.lineTo(-.13,.18);sail.closePath();mesh(new THREE.ShapeGeometry(sail),'cloth',0,0,.025,boat);const wake=mesh(new THREE.TorusGeometry(.32,.02,6,24),'lightWater',-.32,-.03,0,boat);wake.rotation.x=Math.PI/2;data.parts.subject=boat;
    } else if(id==='M-PS-05') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.45,.1,.8,'wood',group);mesh(new THREE.CylinderGeometry(.25,.2,.3,12),'reed',.48,.3,0,group);const oversized=mesh(new THREE.CylinderGeometry(.48,.4,.62,12),'reed',-.35,.46,0,group);oversized.name='oversized-proposal-basket';data.parts.subject=oversized;
    } else if(id==='M-REP-01') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,.6,0],.045,'wood',group);box(0,.65,0,1.2,.1,.7,'wood',group);const cloth=box(0,.72,0,.9,.025,.52,'cloth',group);cloth.name='shared-tablecloth';data.parts.subject=cloth;
    } else if(id==='M-REP-05') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.5,.04,.65,'water',group);for(const z of [-.34,.34]){rod([-.65,.15,z],[.65,.15,z],.04,'wood',group);rod([0,.1,z],[0,1.05,z],.035,'wood',group);}const barrier=box(0,.6,0,.1,.45,.65,'wood',group);barrier.name='beaver-work-gate';data.parts.subject=barrier;
    } else if(id==='M-MENTAL-01') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.05,0],.04,'wood',group);box(0,.8,0,1.15,.45,.05,'wood',group);const card=box(0,.8,.04,.75,.3,.025,'pale',group);card.name='cargo-plan-card';data.parts.subject=card;
    } else if(id==='M-ADD-SUB-SELECT') {
      group.position.set(2.55,.2,-2.3);rod([-.55,.05,0],[-.55,1,0],.05,'wood',group);const arm=new THREE.Group();arm.position.set(-.55,.95,0);group.add(arm);rod([0,0,0],[1.2,0,0],.045,'pale',arm);arm.name='loading-barrier';data.parts.subject=arm;
    } else if(id==='M-EXPR-01') {
      group.position.set(2.55,.2,-2.3);ball(.15,.13,0,.8,.13,.3,'wood',group);rod([-.6,.1,0],[-.6,1.2,0],.06,'wood',group);rod([-.6,1.2,0],[.15,1.2,0],.04,'wood',group);const cargo=box(.15,.85,0,.35,.3,.3,'pale',group);cargo.name='hoisted-cargo';data.parts.subject=cargo;const geometry=new THREE.CylinderGeometry(.018,.018,1,8);geometry.translate(0,-.5,0);const cable=mesh(geometry,'gold',.15,1.2,0,group);cable.name='cargo-cable';data.parts.cable=cable;
    } else if(id==='M-WRADD') {
      group.position.set(2.55,.2,-2.3);box(0,.55,0,1.1,.95,.6,'wood',group);const door=new THREE.Group();door.position.set(-.55,.55,.32);group.add(door);box(.55,0,0,1.1,.9,.05,'pale',door);door.name='order-store-door';data.parts.subject=door;
    } else if(id==='M-WRSUB') {
      group.position.set(2.55,.2,-2.3);box(-.7,.3,0,.75,.45,.55,'wood',group);const boat=new THREE.Group();boat.position.set(-.25,.13,.55);boat.name='outbound-delivery';group.add(boat);ball(0,0,0,.42,.1,.22,'wood',boat);box(0,.18,0,.3,.25,.25,'pale',boat);data.parts.subject=boat;
    } else if(id==='M-WRMUL') {
      group.position.set(2.55,.2,-2.3);ball(0,.13,0,.75,.12,.27,'wood',group);const packet=new THREE.Group();packet.name='secured-supply-packet';group.add(packet);box(0,.36,0,.55,.38,.4,'pale',packet);curvedTimberLocal(packet,[[-.3,.56,0],[0,.6,0],[.3,.56,0]],.025,'gold');data.parts.subject=packet;
    } else if(id==='M-WRDIV') {
      group.position.set(2.55,.2,-2.3);box(0,.55,0,1,.95,.55,'wood',group);const hatch=new THREE.Group();hatch.position.set(0,.9,.3);group.add(hatch);box(0,-.2,0,.7,.4,.04,'pale',hatch);hatch.name='distribution-hatch';data.parts.subject=hatch;
    } else if(id==='M-DIVIS-02') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.05,0],.045,'wood',group);const board=box(0,.86,0,1.05,.4,.05,'pale',group);board.name='cargo-sign';data.parts.subject=board;
    } else if(id==='M-DIV-FACT-01') {
      group.position.set(2.55,.2,-2.3);ball(0,.15,0,.75,.14,.27,'wood',group);rod([.8,.05,.15],[.8,.42,.15],.045,'wood',group);const line=rod([.35,.2,.15],[.8,.25,.15],.025,'gold',group);line.name='loading-mooring';data.parts.subject=line;
    } else if(id==='M-NUM-04') {
      group.position.set(2.55,.2,-2.3);ball(-.45,.12,0,.65,.12,.3,'wood',group);box(.65,.15,0,.7,.1,.55,'wood',group);const ramp=box(.1,.25,0,.8,.08,.3,'pale',group);ramp.name='raft-loading-ramp';data.parts.subject=ramp;
    } else if(id==='M-NUM-05') {
      group.position.set(2.55,.2,-2.3);mesh(new THREE.CylinderGeometry(.4,.32,.45,16),'reed',0,.28,0,group);const handle=new THREE.Group();handle.name='collection-basket-handle';group.add(handle);data.parts.subject=handle;curvedTimberLocal(handle,[[-.32,.52,0],[0,.9,0],[.32,.52,0]],.03,'wood');
    } else if(id==='M-NEG-04') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.15,.1,.7,'wood',group);const book=new THREE.Group();book.name='measurement-journal';group.add(book);data.parts.subject=book;box(-.25,.24,0,.46,.05,.5,'pale',book);box(.25,.24,0,.46,.05,.5,'pale',book);rod([0,.27,-.25],[0,.27,.25],.018,'dark',book);
    } else if(id==='M-ALG-02') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.2,.12,.75,'wood',group);rod([0,.15,0],[0,.8,0],.06,'wood',group);const wheel=new THREE.Group();wheel.position.set(0,.8,.04);wheel.name='workshop-wheel';group.add(wheel);mesh(new THREE.TorusGeometry(.28,.045,8,24),'gold',0,0,0,wheel);rod([-.25,0,0],[.25,0,0],.022,'wood',wheel);rod([0,-.25,0],[0,.25,0],.022,'wood',wheel);data.parts.subject=wheel;
    } else if(id==='M-FRAC-04') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.15,.1,.7,'wood',group);const book=new THREE.Group();book.name='agreement-journal';group.add(book);data.parts.subject=book;box(-.25,.24,0,.46,.05,.5,'pale',book);box(.25,.24,0,.46,.05,.5,'pale',book);rod([0,.27,-.25],[0,.27,.25],.018,'dark',book);
    } else if(id==='M-NUM-09') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.55,.55])rod([x,.05,0],[x,.65,0],.045,'wood',group);const rail=rod([-.55,.65,0],[.55,.65,0],.045,'pale',group);rail.name='sidepath-railing';data.parts.subject=rail;
    } else if(id==='M-NUM-12') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.55,.55])rod([x,.05,0],[x,.9,0],.04,'wood',group);const canopy=box(0,.95,0,1.3,.05,.8,'cloth',group);canopy.name='arrival-shelter';data.parts.subject=canopy;
    } else if(id==='M-DEC-05') {
      group.position.set(2.55,.2,-2.3);box(0,.55,0,.9,.95,.55,'wood',group);const flap=new THREE.Group();flap.position.set(0,.9,.3);group.add(flap);box(0,-.2,0,.65,.4,.04,'pale',flap);flap.name='dispatch-hatch';data.parts.subject=flap;
    } else if(id==='M-GEO-03') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,.4,0],.05,'wood',group);const bench=box(0,.45,0,1.2,.09,.45,'wood',group);bench.name='meeting-bench';data.parts.subject=bench;rod([-.55,.75,-.2],[.55,.75,-.2],.04,'wood',group);
    } else if(id==='M-DATA-05') {
      group.position.set(2.55,.2,-2.3);box(0,.7,0,.75,1.3,.6,'pale',group);ball(0,1.48,0,.2,.2,.2,'gold',group);const hatch=new THREE.Group();hatch.position.set(-.25,1.45,.25);group.add(hatch);box(.25,0,0,.5,.45,.05,'wood',hatch);hatch.name='beacon-message-hatch';data.parts.subject=hatch;
    } else if(id==='M-DATA-08') {
      group.position.set(2.55,.2,-2.3);ball(0,.04,0,.75,.08,.45,'rock',group);for(const x of [-.65,.65])rod([x,.05,0],[x,1.4,0],.05,'wood',group);box(0,1.05,0,1.5,.7,.07,'wood',group);const map=box(0,1.05,.05,1.2,.5,.025,'pale',group);map.name='journey-plan';data.parts.subject=map;const marks=new THREE.Group();marks.name='decorative-coastline';group.add(marks);data.parts.mapMarks=marks;const shore=new THREE.Shape();shore.moveTo(-.5,.86);shore.quadraticCurveTo(-.55,1.13,-.32,1.18);shore.quadraticCurveTo(-.1,1.3,.1,1.18);shore.quadraticCurveTo(.38,1.23,.5,1.08);shore.lineTo(.47,.86);shore.closePath();mesh(new THREE.ShapeGeometry(shore,12),'reed',0,0,.068,marks);curvedTimberLocal(marks,[[-.5,.9,.075],[-.3,1.02,.075],[-.08,.94,.075],[.14,1.13,.075],[.4,1.1,.075]],.012,'lightWater');const compass=mesh(new THREE.TorusGeometry(.07,.012,6,16),'dark',.46,1.18,.08,marks);
    } else if(id==='M-DATA-11') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.25,0],.045,'wood',group);const flag=box(.25,.28,0,.5,.3,.04,'pale',group);flag.name='beacon-message-flag';data.parts.subject=flag;
    } else if(id==='M-GEO-23') {
      group.position.set(2.55,.2,-2.3);ball(0,.3,0,.7,.3,.45,'rock',group);box(0,.7,.2,.9,.6,.08,'wood',group);const lid=new THREE.Group();lid.position.set(-.45,.7,.25);group.add(lid);box(.45,0,0,.9,.6,.05,'pale',lid);lid.name='cliff-board-lid';data.parts.subject=lid;
    } else if(id==='M-GEO-24') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,.85,0],.05,'wood',group);const reflector=mesh(new THREE.CircleGeometry(.25,20),'pale',0,.9,.06,group);reflector.name='reflector';data.parts.subject=reflector;
    } else if(id==='M-GEO-08') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.55,.55])rod([x,.05,0],[x,1.05,0],.045,'wood',group);const panel=box(0,.8,0,1.25,.5,.06,'pale',group);panel.name='workshop-drawing-board';data.parts.subject=panel;
    } else if(id==='M-GEO-09') {
      group.position.set(2.55,.2,-2.3);box(0,.65,0,1.1,1.1,.5,'wood',group);const door=new THREE.Group();door.position.set(-.55,.65,.27);group.add(door);box(.55,0,0,1.1,1,.05,'pale',door);door.name='solid-storage-door';data.parts.subject=door;
    } else if(id==='M-GEO-12') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.2,0],.04,'wood',group);rod([-.5,1.2,0],[.5,1.2,0],.04,'wood',group);const curtain=box(0,.77,.03,.9,.8,.04,'cloth',group);curtain.name='ship-window-curtain';data.parts.subject=curtain;
    } else if(id==='M-DIVIS-03') {
      group.position.set(2.55,.2,-2.3);box(0,.55,0,1.2,.95,.65,'wood',group);const door=new THREE.Group();door.position.set(-.6,.55,.35);group.add(door);box(.6,0,0,1.2,.9,.05,'pale',door);door.name='loading-door';data.parts.subject=door;
    } else if(id==='M79-POWER-NEG') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.65,0],.04,'wood',group);ball(0,1.12,0,.18,.18,.18,'gold',group);const hood=mesh(new THREE.ConeGeometry(.3,.28,12,1,true),'wood',0,1.3,0,group);hood.name='night-lantern-hood';data.parts.subject=hood;
    } else if(id==='M79-POWER-QUOT') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.1,0],.04,'wood',group);ball(0,1.15,0,.15,.15,.15,'gold',group);const door=new THREE.Group();door.position.set(-.18,1.15,.18);group.add(door);box(.18,0,0,.36,.36,.04,'pale',door);door.name='way-lantern-door';data.parts.subject=door;
    } else if(id==='M79-DEC-ADD-SUB') {
      group.position.set(2.55,.2,-2.3);box(0,.3,0,1,.5,.7,'wood',group);const lid=new THREE.Group();lid.position.set(0,.58,-.35);group.add(lid);box(0,0,.35,1.05,.08,.72,'pale',lid);lid.name='equipment-chest-lid';data.parts.subject=lid;
    } else if(id==='M79-DEC-DIV') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.25,0],.045,'wood',group);const flag=box(.22,1.08,0,.45,.25,.04,'roof',group);flag.name='decimal-route-pennant';data.parts.subject=flag;
    } else if(id==='M79-DEC-MUL') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.3,0],.045,'wood',group);const sail=box(.3,.8,0,.65,.9,.04,'cloth',group);const patch=box(.3,.8,.04,.22,.22,.025,'roof',group);patch.name='sail-repair-patch';data.parts.subject=patch;
    } else if(id==='M79-FRAC-DIV') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.25,0],.045,'wood',group);const flag=box(.24,.3,0,.48,.28,.04,'pale',group);flag.name='fraction-route-pennant';data.parts.subject=flag;
    } else if(id==='M79-TEXT-01') {
      group.position.set(2.55,.2,-2.3);box(.6,.13,0,.8,.1,.5,'wood',group);const packet=new THREE.Group();packet.position.set(-.8,.12,0);packet.name='delivered-equipment';group.add(packet);ball(0,0,0,.42,.11,.23,'wood',packet);box(0,.2,0,.4,.3,.32,'pale',packet);data.parts.subject=packet;
    } else if(id==='M79-DIRECTPROP') {
      group.position.set(2.55,.2,-2.3);ball(0,.15,0,.75,.13,.27,'wood',group);const basket=new THREE.Group();basket.name='sample-basket';group.add(basket);mesh(new THREE.CylinderGeometry(.28,.22,.33,12),'reed',0,.4,0,basket);curvedTimberLocal(basket,[[-.22,.57,0],[0,.78,0],[.22,.57,0]],.02,'wood');data.parts.subject=basket;
    } else if(id==='M79-INVERSEPROP') {
      group.position.set(2.55,.2,-2.3);mesh(new THREE.CylinderGeometry(.4,.4,.8,18,1,true),'pale',0,.55,0,group);rod([.4,.2,0],[.8,.2,0],.06,'wood',group);const tap=new THREE.Group();tap.position.set(.65,.2,0);group.add(tap);rod([0,0,0],[0,.35,0],.035,'gold',tap);tap.name='tank-valve';data.parts.subject=tap;
    } else if(id==='M79-GRAPH-MONO') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.1,0],.04,'wood',group);const panel=box(0,.8,0,1.15,.48,.06,'pale',group);panel.name='observation-panel';data.parts.subject=panel;
    } else if(id==='M79-ARC') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.0,0],.05,'wood',group);ball(0,1.15,0,.2,.2,.2,'gold',group);const shutter=new THREE.Group();shutter.position.set(-.21,1.15,.21);shutter.name='observation-shutter';group.add(shutter);box(.21,0,0,.42,.42,.05,'wood',shutter);data.parts.subject=shutter;
    } else if(id==='M79-SECTOR') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.6,.6])rod([x,.05,0],[x,1,0],.04,'wood',group);const canopy=box(0,1.03,0,1.45,.05,.85,'cloth',group);canopy.name='reading-canopy';data.parts.subject=canopy;
    } else if(id==='M79-SLOPE') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.4,.4])rod([x,.05,0],[x,1,0],.04,'wood',group);box(0,.65,0,1,.5,.08,'wood',group);const card=box(0,.65,.06,.72,.35,.03,'pale',group);card.name='slope-planning-card';data.parts.subject=card;
    } else if(id==='M79-ROUND-01') {
      group.position.set(2.55,.2,-2.3);box(.55,.15,0,.7,.1,.6,'wood',group);const boat=new THREE.Group();boat.position.set(-.9,.16,.45);boat.name='measurement-message-boat';group.add(boat);ball(0,0,0,.42,.12,.23,'wood',boat);box(0,.16,0,.24,.16,.18,'pale',boat);data.parts.subject=boat;
    } else if(id==='M79-PCT-PP') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.4,.04,.6,'water',group);for(const z of [-.35,.35]){rod([-.65,.14,z],[.65,.14,z],.04,'wood',group);rod([0,.1,z],[0,1.05,z],.035,'wood',group);}const gate=box(0,.33,0,.08,.48,.65,'wood',group);gate.name='side-channel-gate';data.parts.subject=gate;const stream=box(.38,.14,0,.7,.02,.15,'lightWater',group);stream.name='side-channel-flow';data.parts.stream=stream;
    } else if(id==='M79-PCT-SHARE') {
      group.position.set(2.55,.2,-2.3);ball(-.5,.1,0,.4,.1,.3,'rock',group);ball(.5,.1,0,.4,.1,.3,'rock',group);rod([0,.1,0],[0,1.05,0],.04,'wood',group);const card=box(0,.88,.05,.7,.34,.05,'pale',group);card.name='stream-agreement-card';data.parts.subject=card;
    } else if(id==='M79-PCT-COMP') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,.6,0],.04,'wood',group);const top=box(0,.65,0,1.3,.1,.7,'wood',group);top.name='comparison-worktable';data.parts.subject=top;
    } else if(id==='M79-UNIT-LIN') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.4,.1,.7,'wood',group);const reel=mesh(new THREE.CylinderGeometry(.18,.18,.1,16),'gold',-.35,.28,0,group);reel.rotation.x=Math.PI/2;const tape=box(.1,.25,0,.9,.025,.12,'pale',group);tape.name='measuring-tape';data.parts.subject=tape;
    } else if(id==='M79-UNIT-AREA') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.25,.12,.8,'wood',group);const plant=new THREE.Group();plant.name='garden-seedling';group.add(plant);data.parts.subject=plant;rod([0,.16,0],[0,.68,0],.035,'reed',plant);ball(.18,.57,0,.25,.09,.12,'reed',plant);ball(-.18,.45,0,.25,.09,.12,'reed',plant);
    } else if(id==='M79-PROB-EMP') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.2,.1,.75,'wood',group);const book=new THREE.Group();book.name='field-study-book';group.add(book);data.parts.subject=book;box(-.25,.23,0,.46,.05,.55,'pale',book);box(.25,.23,0,.46,.05,.55,'pale',book);rod([0,.26,-.28],[0,.26,.28],.02,'dark',book);
    } else if(id==='M-FRAC-05') {
      group.position.set(2.55,.2,-2.3);box(0,.15,0,1.2,.1,.7,'wood',group);const book=box(0,.28,0,.75,.08,.5,'pale',group);book.name='reservation-book';data.parts.subject=book;rod([0,.33,-.25],[0,.33,.25],.018,'dark',group);
    } else if(id==='M-FRAC-10') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.4,.08,.9,'wood',group);mesh(new THREE.CylinderGeometry(.45,.38,.25,20,1,true),'pale',0,.28,0,group);const tap=new THREE.Group();tap.position.set(.55,.45,0);tap.name='model-basin-tap';group.add(tap);rod([0,0,0],[0,.35,0],.035,'gold',tap);data.parts.subject=tap;
    } else if(id==='M-MEAS-12') {
      group.position.set(2.55,.2,-2.3);box(0,.25,0,.95,.38,.6,'wood',group);const hinge=new THREE.Group();hinge.position.set(0,.47,-.3);group.add(hinge);box(0,0,.3,.98,.07,.63,'pale',hinge);hinge.name='instrument-case-lid';data.parts.subject=hinge;
    } else if(id==='M-MEAS-13') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.65,.65])box(x,.1,0,.55,.1,.5,'wood',group);const note=box(-.65,.25,0,.36,.035,.24,'pale',group);note.name='measurement-note';data.parts.subject=note;
    } else if(id==='M-MEAS-14') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.2,.1,.75,'wood',group);box(0,.2,0,.7,.035,.5,'pale',group);const lens=new THREE.Group();lens.name='inspection-lens';group.add(lens);data.parts.subject=lens;const ring=mesh(new THREE.TorusGeometry(.2,.025,8,24),'gold',0,.44,0,lens);ring.rotation.x=Math.PI/2;rod([.14,.44,.14],[.38,.44,.38],.03,'wood',lens);
    } else if(id==='M-MEAS-16') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.25,.1,.8,'wood',group);box(0,.2,0,.9,.03,.6,'pale',group);const compass=new THREE.Group();compass.name='drafting-compass';group.add(compass);data.parts.subject=compass;rod([0,.65,0],[-.3,.22,0],.025,'gold',compass);rod([0,.65,0],[.3,.22,0],.025,'gold',compass);
    } else if(id==='M-NEG-03') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.25,0],.045,'wood',group);const flag=box(.25,1.1,0,.5,.28,.04,'roof',group);flag.name='lowered-alarm-flag';data.parts.subject=flag;
    } else if(id==='M-PROB-03') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1.1,0],.045,'wood',group);const pennant=box(.22,.9,0,.45,.26,.04,'cloth',group);pennant.name='observation-pennant';data.parts.subject=pennant;
    } else if(id==='M-EST-02') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.2,.1,.7,'wood',group);const zero=mesh(new THREE.TorusGeometry(.25,.055,8,24),'roof',0,.48,0,group);zero.name='extra-zero';data.parts.subject=zero;
    } else if(id==='M-SYM-03') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.55,.55])rod([x,.05,0],[x,.8,0],.045,'wood',group);const board=box(0,.74,0,1.25,.32,.06,'pale',group);board.name='shore-pattern-board';data.parts.subject=board;
    } else if(id==='M-ADD-COMM') {
      group.position.set(2.55,.2,-2.3);const boats=new THREE.Group();boats.name='meeting-delivery-boats';group.add(boats);data.parts.subject=boats;
      for(const x of [-.55,.55]){ball(x,.18,0,.42,.12,.21,'wood',boats);rod([x,.25,0],[x,.8,0],.025,'wood',boats);}
    } else if(id==='M-ADD-ASSOC') {
      group.position.set(2.55,.2,-2.3);ball(0,.15,0,.8,.15,.3,'wood',group);const cargo=ball(0,.38,0,.48,.23,.24,'cloth',group);cargo.name='covered-cargo';data.parts.subject=cargo;
    } else if(id==='M-MUL-ASSOC') {
      group.position.set(2.55,.2,-2.3);ball(0,.15,0,.78,.13,.27,'wood',group);const basket=new THREE.Group();basket.name='provision-basket';group.add(basket);mesh(new THREE.CylinderGeometry(.3,.22,.35,12),'reed',0,.39,0,basket);curvedTimberLocal(basket,[[-.25,.56,0],[0,.85,0],[.25,.56,0]],.025,'wood');data.parts.subject=basket;
    } else if(id==='M-MUL-COMM') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.6,.6])rod([x,.05,0],[x,.48,0],.06,'wood',group);box(0,.5,0,1.4,.12,.6,'wood',group);
      const raft=box(-.9,.14,.65,.75,.1,.48,'pale',group);raft.name='arriving-raft';data.parts.subject=raft;
    } else if(id==='M-NUM-15') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.45,.45])rod([x,.05,0],[x,.4,0],.055,'wood',group);const bench=box(0,.45,0,1.1,.1,.45,'wood',group);bench.name='resting-bench';data.parts.subject=bench;
    } else if(id==='M-NUM-17') {
      group.position.set(2.55,.2,-2.3);const pair=new THREE.Group();pair.name='shared-picnic-baskets';group.add(pair);data.parts.subject=pair;
      for(const x of [-.45,.45]){mesh(new THREE.CylinderGeometry(.25,.2,.3,12),'reed',x,.2,0,pair);curvedTimberLocal(pair,[[x-.2,.35,0],[x,.55,0],[x+.2,.35,0]],.02,'wood');}
    } else if(id==='M-NUM-11') {
      group.position.set(2.55,.2,-2.3);rod([0,.05,0],[0,1,0],.045,'wood',group);const sign=box(.3,.85,0,.7,.22,.06,'pale',group);sign.name='shore-route-sign';data.parts.subject=sign;
    } else if(id==='M-FRAC-08') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.05,0],.04,'wood',group);box(0,.75,0,1.15,.55,.08,'wood',group);const note=box(0,.75,.06,.6,.38,.03,'pale',group);note.name='burrow-agreement';data.parts.subject=note;
    } else if(id==='M-FRAC-09') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,.65,0],.045,'wood',group);box(0,.7,0,1.25,.1,.65,'wood',group);const scroll=mesh(new THREE.CylinderGeometry(.08,.08,.65,12),'pale',0,.8,0,group);scroll.rotation.z=Math.PI/2;scroll.name='agreement-scroll';data.parts.subject=scroll;
    } else if(id==='M-FRAC-16') {
      group.position.set(2.55,.2,-2.3);for(const z of [-.38,.38]){ball(0,.08,z,.9,.1,.22,'rock',group);rod([0,.1,z],[0,1.05,z],.035,'wood',group);}const waterShape=new THREE.Shape();waterShape.moveTo(-.8,-.2);waterShape.quadraticCurveTo(0,-.36,.8,-.17);waterShape.lineTo(.8,.18);waterShape.quadraticCurveTo(0,.34,-.8,.2);waterShape.closePath();const water=mesh(new THREE.ShapeGeometry(waterShape,16),'water',0,.12,0,group);water.rotation.x=-Math.PI/2;const gate=box(0,.32,0,.08,.45,.7,'wood',group);gate.name='channel-gate';data.parts.subject=gate;const flowShape=new THREE.Shape();flowShape.moveTo(.08,-.08);flowShape.quadraticCurveTo(.42,-.14,.75,-.05);flowShape.lineTo(.75,.05);flowShape.quadraticCurveTo(.42,.1,.08,.08);flowShape.closePath();const stream=mesh(new THREE.ShapeGeometry(flowShape,12),'lightWater',0,.15,0,group);stream.rotation.x=-Math.PI/2;stream.name='opened-channel-flow';data.parts.stream=stream;
    } else if(id==='M-UNIT-06') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.6,.1,.8,'wood',group);
      const valid=lessonModel?.kind==='measurement-station'&&lessonModel.mode==='cube'&&Number.isSafeInteger(lessonModel.cubes)&&lessonModel.cubes>=1&&lessonModel.cubes<=3&&Number.isSafeInteger(lessonModel.filled)&&lessonModel.filled>=0&&lessonModel.filled<=lessonModel.cubes&&Number.isFinite(lessonModel.partial)&&lessonModel.partial>=0&&lessonModel.partial<1&&!(lessonModel.filled===lessonModel.cubes&&lessonModel.partial>0);
      if(valid){const cubes=new THREE.Group();cubes.name='measured-unit-cubes';group.add(cubes);data.parts.subject=cubes;data.modelBound=true;
       for(let i=0;i<lessonModel.cubes;i++){const x=(i-(lessonModel.cubes-1)/2)*.52,r=.2,y=.37;for(const dy of [-r,r])for(const dz of [-r,r])rod([x-r,y+dy,dz],[x+r,y+dy,dz],.012,'gold',cubes);for(const dx of [-r,r])for(const dz of [-r,r])rod([x+dx,y-r,dz],[x+dx,y+r,dz],.012,'gold',cubes);for(const dx of [-r,r])for(const dy of [-r,r])rod([x+dx,y+dy,-r],[x+dx,y+dy,r],.012,'gold',cubes);
        const f=i<lessonModel.filled?1:i===lessonModel.filled?lessonModel.partial:0;if(f>0){const fill=box(x,y-r+.4*f/2,0,.38,.4*f,.38,'water',cubes);fill.name='unit-cube-fill';fill.userData.fraction=f;}}}
    } else if(id==='M79-SPHERE-V') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.5,.12,.8,'wood',group);
      const figures=lessonModel?.kind==='advanced-solids'&&lessonModel.mode==='measure'&&Array.isArray(lessonModel.figures)?lessonModel.figures:[],valid=figures.length>0&&figures.length<=2&&Array.from(figures).every(f=>f?.shape?.kind==='sphere'&&Number.isFinite(f.shape.radius)&&f.shape.radius>0&&f.shape.radius<=10000);
      if(valid){const largest=Math.max(...figures.map(f=>f.shape.radius)),spheres=new THREE.Group();spheres.name='observed-spheres';group.add(spheres);data.parts.subject=spheres;data.modelBound=true;
       for(const [i,f] of figures.entries()){const r=.32*f.shape.radius/largest;ball((i-(figures.length-1)/2)*.8,.16+r,0,r,r,r,'water',spheres);}}
    } else if(id==='M79-CYL-V') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.4,.12,1,'wood',group);box(.7,.15,0,.6,.05,.2,'wood',group);
      const figures=lessonModel?.kind==='advanced-solids'&&lessonModel.mode==='measure'&&Array.isArray(lessonModel.figures)?lessonModel.figures:[],shape=(figures.find(f=>f?.id==='Uusi')??(figures.length===1?figures[0]:null))?.shape,base=shape?.base;
      const positive=n=>Number.isFinite(n)&&n>0&&n<=10000,valid=shape?.kind==='column'&&positive(shape.height)&&((base?.kind==='circle'&&positive(base.radius))||(['rectangle','right-triangle'].includes(base?.kind)&&positive(base.width)&&positive(base.depth)));
      if(valid){const width=base.kind==='circle'?2*base.radius:base.width,depth=base.kind==='circle'?2*base.radius:base.depth,unit=Math.min(1/width,.75/depth,.85/shape.height),height=shape.height*unit;
       let geometry;if(base.kind==='circle')geometry=new THREE.CylinderGeometry(base.radius*unit,base.radius*unit,height,20,1,false);else{const w=base.width*unit,d=base.depth*unit,path=new THREE.Shape();path.moveTo(-w/2,-d/2);path.lineTo(w/2,-d/2);if(base.kind==='rectangle')path.lineTo(w/2,d/2);path.lineTo(-w/2,d/2);path.closePath();geometry=new THREE.ExtrudeGeometry(path,{depth:height,bevelEnabled:false});geometry.rotateX(-Math.PI/2);geometry.translate(0,-height/2,0);}
       const container=mesh(geometry,lessonModel.demoFill==='layers'&&lessonModel.fillStep===3?'water':'cloth',0,.16+height/2,0,group);container.name='observed-column';data.parts.subject=container;data.modelBound=true;if(lessonModel.demoFill==='layers'&&lessonModel.fillStep===3)box(.7,.19,0,.55,.02,.13,'lightWater',group);}
    } else if(id==='M-GEO-07') {
      group.position.set(2.55,.2,-2.3);box(0,.1,0,1.3,.1,1,'wood',group);
      const grid=lessonModel?.kind==='solid-construction'?lessonModel.grid:null,cells=lessonModel?.previewCells;
      const valid=Array.isArray(grid)&&grid.length===3&&Array.from(grid).every(n=>Number.isSafeInteger(n)&&n>0&&n<=12)&&Array.isArray(cells)&&cells.length>0&&cells.length<=128&&Array.from(cells).every(c=>Array.isArray(c)&&c.length===3&&Array.from(c).every((n,i)=>Number.isSafeInteger(n)&&n>=0&&n<grid[i]))&&new Set(cells.map(c=>c.join(','))).size===cells.length;
      if(valid){const unit=Math.min(.24,1.15/Math.max(...grid)),model=new THREE.Group();model.name='built-cells';model.rotation.y=lessonModel.view==='angled'?(lessonModel.pose==='horizontal'?.66:-.36):lessonModel.view==='side'?-Math.PI/2:0;group.add(model);data.parts.subject=model;data.modelBound=true;
       for(const [x,y,z] of cells){const cube=box((x-(grid[0]-1)/2)*unit,.16+(y+.5)*unit,(z-(grid[2]-1)/2)*unit,unit*.95,unit*.95,unit*.95,'pale',model);cube.userData.cell=[x,y,z];}}
      else{const tool=new THREE.Group();tool.name='construction-tools';group.add(tool);rod([-.25,.17,-.16],[.25,.17,-.16],.035,'gold',tool);rod([-.25,.17,-.16],[-.25,.17,.21],.035,'gold',tool);}
    } else if(id==='M79-PYTH-CALC') {
      group.position.set(2.55,.2,-1.7);const vertices=lessonModel?.kind==='right-triangle'&&lessonModel.mode==='rope'?lessonModel.vertices:null,right=lessonModel?.right;
      const valid=Array.isArray(vertices)&&vertices.length===3&&Array.from(vertices).every(p=>Array.isArray(p)&&p.length===3&&Array.from(p).every(n=>Number.isFinite(n)&&Math.abs(n)<=20))&&Number.isInteger(right)&&right>=0&&right<3;
      if(valid){const points=vertices.filter((_,i)=>i!==right).map(p=>new THREE.Vector3(p[0]*.38,.2+p[1]*.38,p[2]*.38));const delta=points[1].clone().sub(points[0]);
       if(delta.length()>.001&&delta.length()<5){for(const p of points){ball(p.x,.1,p.z,.22,.1,.2,'rock',group);rod([p.x,.15,p.z],[p.x,p.y,p.z],.045,'wood',group);ball(p.x,p.y,p.z,.09,.09,.09,'pale',group);}const pivot=new THREE.Group();pivot.position.copy(points[0]);pivot.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());group.add(pivot);
        const geometry=new THREE.CylinderGeometry(.025,.025,delta.length(),8);geometry.translate(0,delta.length()/2,0);const rope=mesh(geometry,'gold',0,0,0,pivot);rope.name='measured-rope';data.parts.subject=rope;data.modelBound=true;}}
      if(!data.modelBound){ball(-.55,.15,0,.22,.1,.2,'rock',group);ball(.55,.15,0,.22,.1,.2,'rock',group);const coil=mesh(new THREE.TorusGeometry(.2,.025,6,20),'gold',0,.16,0,group);coil.name='unmeasured-rope-coil';coil.rotation.x=Math.PI/2;}
    } else if(id==='M-MEAS-07') {
      group.position.set(2.55,.2,-2.3);const valid=lessonModel?.kind==='measurement-station'&&lessonModel.mode==='mass'&&['beam','digital'].includes(lessonModel.display)&&typeof lessonModel.basket==='boolean'&&typeof lessonModel.loaded==='boolean'&&Number.isFinite(lessonModel.needle)&&lessonModel.needle>=0&&lessonModel.needle<=1;
      ball(0,.04,0,.95,.08,.6,'rock',group);const instrument=new THREE.Group();instrument.name='settling-scale';group.add(instrument);data.parts.instrument=instrument;
      for(const x of [-.62,.62])for(const z of [-.3,.3])rod([x,.08,z],[x,.22,z],.04,'wood',instrument);box(0,.24,0,1.5,.1,.8,'wood',instrument);box(0,.32,0,1.1,.06,.55,'pale',instrument);
      if(!valid||lessonModel.basket){const basket=new THREE.Group();basket.name='measured-basket';instrument.add(basket);mesh(new THREE.CylinderGeometry(.32,.24,.3,16),'reed',0,.5,0,basket);for(const y of [.4,.52,.62]){const band=mesh(new THREE.TorusGeometry(.29,.014,6,24),'gold',0,y,0,basket);band.rotation.x=Math.PI/2;}curvedTimberLocal(basket,[[-.28,.65,0],[0,.88,0],[.28,.65,0]],.022,'wood');if(valid&&lessonModel.loaded)ball(0,.7,0,.18,.15,.15,'cloth',basket);}
      if(valid){data.modelBound=true;if(lessonModel.display==='beam'){box(0,.22,.42,.7,.05,.03,'dark',instrument);const mark=box(-.33+.66*lessonModel.needle,.25,.45,.035,.12,.03,'gold',instrument);mark.name='mass-beam-mark';data.parts.subject=mark;}}
    } else if(id==='M-MEAS-10') {
      group.position.set(2.55,.2,-2.3);const valid=lessonModel?.kind==='measurement-station'&&lessonModel.mode==='liquid'&&['cylinder','flared'].includes(lessonModel.vessel)&&Number.isFinite(lessonModel.fillHeight)&&lessonModel.fillHeight>=0&&lessonModel.fillHeight<=1;
      const flared=valid&&lessonModel.vessel==='flared',bottom=.25,top=flared ? .43 : .25;
      const vessel=mesh(new THREE.CylinderGeometry(top,bottom,.9,20,1,true),'cloth',0,.55,0,group);vessel.name='measured-vessel';
      if(valid){const f=lessonModel.fillHeight,height=.8*f,water=mesh(new THREE.CylinderGeometry(bottom+(top-bottom)*f,bottom,Math.max(.001,height),20),'water',0,.11+height/2,0,group);water.name='observed-fill';data.parts.subject=water;data.parts.fillHeight=height;data.modelBound=true;}
    } else if(id==='PHY79-SI-01') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.72,.72]){rod([x,.04,0],[x,1.1,0],.05,'wood',group);ball(x,1.2,0,.15,.15,.15,'pale',group);}
      const signal=ball(-.72,1.2,.15,.11,.11,.11,'gold',group);signal.name='signal-between-shores';data.parts.subject=signal;
    } else if(id==='PHY79-UNIVERSE-SCALE') {
      group.position.set(2.55,.2,-2.3);box(0,.22,0,1.4,.12,.9,'wood',group);ball(.35,.35,0,.12,.12,.12,'gold',group);
      const mark=questionMark(group,.35,.8,0);mark.name='stellar-question';data.parts.subject=mark;
    } else if(id==='PHY79-HEAT-MECH') {
      group.position.set(2.55,.2,-2.3);const cloth=box(0,.13,0,1.4,.06,.9,'cloth',group);cloth.name='picnic-cloth';data.parts.subject=cloth;
      ball(.3,.27,.05,.24,.15,.18,'wood',group);
    } else if(id==='CHEM79-CHEMICAL-SAFE') {
      group.position.set(2.55,.2,-2.3);box(0,.6,0,1,1.1,.45,'wood',group);
      const hinge=new THREE.Group();hinge.position.set(-.5,.6,.25);group.add(hinge);box(.5,0,0,1,1,.08,'pale',hinge);hinge.name='storage-door';data.parts.subject=hinge;
    } else if(id==='M-GEO-18') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.55,.55])for(const z of [-.32,.32])rod([x,.04,z],[x,.8,z],.045,'wood',group);
      ball(0,.47,0,.16,.19,.16,'gold',group);const roof=new THREE.Group();roof.name='mountain-shelter-roof';group.add(roof);data.parts.subject=roof;
      const left=box(-.27,.97,0,.7,.09,.9,'roof',roof),right=box(.27,.97,0,.7,.09,.9,'roof',roof);left.rotation.z=.45;right.rotation.z=-.45;
    } else if(id==='M79-CONE-V') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.35,0],.04,'wood',group);
      const figures=lessonModel?.kind==='advanced-solids'&&lessonModel.mode==='measure'&&Array.isArray(lessonModel.figures)?lessonModel.figures:[];const shape=(figures.find(f=>f?.id==='Uusi')??(figures.length===1?figures[0]:null))?.shape;
      const valid=shape?.kind==='cone'&&shape.base?.kind==='circle'&&Number.isFinite(shape.base.radius)&&shape.base.radius>0&&Number.isFinite(shape.height)&&shape.height>0;
      const unit=valid?Math.min(.55/shape.base.radius,.8/shape.height):1,radius=valid?shape.base.radius*unit:.4,height=valid?shape.height*unit:.65;
      const funnel=mesh(new THREE.CylinderGeometry(radius,0,height,16,1,true),'pale',0,.4+height/2,0,group);funnel.name='funnel-store';data.parts.subject=funnel;data.modelBound=!!valid;
      rod([0,.4,0],[0,.18,0],.07,'wood',group);box(.48,.12,0,1,.06,.3,'wood',group);if(valid&&lessonModel.demoFill==='cone-to-column'&&lessonModel.fillStep===3){const water=box(.48,.17,0,.95,.025,.2,'lightWater',group);water.name='observed-cone-outflow';}
    } else if(id==='CHEM79-ELEM-PROP') {
      group.position.set(2.55,.2,-2.3);box(0,.42,0,.95,.7,.6,'wood',group);
      const door=box(0,.8,0,1,.08,.65,'cloth',group);data.parts.subject=door;
    } else if(id==='CHEM79-NUTRIENT-CARB') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.45,.45])rod([x,.05,0],[x,.65,0],.05,'wood',group);
      const display=box(0,.7,0,1.1,.1,.65,'wood',group);data.parts.subject=display;
    } else if(id==='M-TH-02') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.45,.45])rod([x,.05,0],[x,.85,0],.045,'wood',group);box(0,.3,0,1,.1,.45,'wood',group);
      const leaves=new THREE.Group();group.add(leaves);data.parts.subject=leaves;
      for(const x of [-.28,.28]){const leaf=ball(x,.98,0,.37,.09,.24,'reed',leaves);leaf.rotation.z=x<0?.15:-.15;}
    } else if(id==='M-WORK-01') {
      group.position.set(2.55,.2,-2.3);box(-.45,.2,0,.75,.1,.55,'wood',group);ball(.65,.15,0,.38,.12,.22,'wood',group);
      const card=box(-1,.3,0,.35,.035,.25,'pale',group);data.parts.subject=card;
      const geometry=new THREE.CylinderGeometry(.02,.02,1,8);geometry.translate(0,.5,0);const rope=mesh(geometry,'gold',-.05,.2,0,group);rope.rotation.z=-Math.PI/2;data.parts.rope=rope;
    } else if(id==='M-PS-06') {
      group.position.set(2.55,.2,-2.3);ball(-.8,.08,0,.4,.1,.3,'rock',group);ball(.8,.08,0,.4,.1,.3,'rock',group);
      const bridge=new THREE.Group();bridge.name='bridge-deck';group.add(bridge);data.parts.subject=bridge;
      for(let i=0;i<6;i++)box(-.625+i*.25,.22,0,.23,.09,.48,'wood',bridge);for(const z of [-.25,.25]){rod([-.7,.24,z],[-.7,.55,z],.035,'wood',bridge);rod([.7,.24,z],[.7,.55,z],.035,'wood',bridge);rod([-.7,.55,z],[.7,.55,z],.025,'gold',bridge);}
      rod([-1.8,.08,0],[-1.8,.5,0],.05,'wood',group);const spool=mesh(new THREE.TorusGeometry(.12,.025,6,20),'gold',-1.8,.5,0,group);spool.name='bridge-winch';data.parts.crank=spool;
      const ropeGeometry=new THREE.CylinderGeometry(.018,.018,1,8);ropeGeometry.translate(0,.5,0);const rope=mesh(ropeGeometry,'gold',-1.8,.5,0,group);rope.name='bridge-cable';data.parts.cable=rope;
    } else if(id==='M-TH-07') {
      group.position.set(2.55,.2,-2.3);const flags=new THREE.Group();group.add(flags);data.parts.subject=flags;
      for(const x of [-.35,.35]){rod([x,.05,0],[x,1.1,0],.04,'wood',flags);box(x+.18,.98,0,.36,.22,.04,'roof',flags);}
    } else if(id==='M79-CONSTRUCT') {
      group.position.set(2.55,.2,-2.3);ball(-.65,.15,0,.13,.13,.13,'wood',group);ball(.65,.15,0,.13,.13,.13,'wood',group);
      const point=ball(0,.5,0,.13,.13,.13,'gold',group);data.parts.subject=point;
      rod([-.65,.15,0],[0,.5,0],.02,'pale',group);rod([.65,.15,0],[0,.5,0],.02,'pale',group);
    } else if(id==='M79-PROP-SOLVE') {
      group.position.set(2.55,.2,-2.3);ball(-.85,.1,0,.35,.12,.3,'rock',group);ball(.85,.1,0,.35,.12,.3,'rock',group);
      const bridge=box(0,.25,0,1.5,.1,.4,'wood',group);data.parts.subject=bridge;
    } else if(id==='CHEM79-EXOENDO') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.45,.45])box(x,.55,0,.55,.6,.45,'dark',group);
      const arrows=new THREE.Group();group.add(arrows);data.parts.subject=arrows;
      rod([-.45,.55,.25],[-.9,.55,.25],.035,'roof',arrows);const a=mesh(new THREE.ConeGeometry(.1,.18,10),'roof',-.9,.55,.25,arrows);a.rotation.z=Math.PI/2;
      rod([.9,.55,.25],[.45,.55,.25],.035,'lightWater',arrows);const b=mesh(new THREE.ConeGeometry(.1,.18,10),'lightWater',.45,.55,.25,arrows);b.rotation.z=Math.PI/2;
    } else if(id==='CHEM79-CARBON-PHOTO') {
      group.position.set(2.55,.2,-2.3);rod([0,.1,0],[0,.7,0],.045,'reed',group);ball(.22,.65,0,.32,.14,.14,'reed',group);
      const arrow=new THREE.Group();group.add(arrow);data.parts.subject=arrow;rod([.22,1.3,0],[.22,.92,0],.025,'pale',arrow);const tip=mesh(new THREE.ConeGeometry(.08,.16,10),'pale',.22,.92,0,arrow);tip.rotation.z=Math.PI;
    } else if(id==='ENV-CHEM-WATERCYCLE-01') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.5,.05,.8,'water',group);ball(0,1.35,0,.5,.18,.28,'pale',group);
      const reservoirs=lessonModel?.kind==='matter-cycles'&&lessonModel.mode==='water-path'&&lessonModel.locked===true?lessonModel.reservoirs:null,transfers=lessonModel?.transfers;
      const valid=Array.isArray(reservoirs)&&reservoirs.length>0&&reservoirs.length<=20&&Array.from(reservoirs).every(r=>r&&typeof r.id==='string'&&r.id.length>0&&Number.isFinite(r.x)&&r.x>=0&&r.x<=400&&Number.isFinite(r.y)&&r.y>=0&&r.y<=400)&&new Set(reservoirs.map(r=>r.id)).size===reservoirs.length&&Array.isArray(transfers)&&transfers.length>0&&transfers.length<=20&&Array.from(transfers).every(v=>v&&reservoirs.some(r=>r.id===v.from)&&reservoirs.some(r=>r.id===v.to) );
      if(valid){const map=new Map(reservoirs.map(r=>[r.id,new THREE.Vector3((r.x-140)*.005,.25+(140-r.y)*.006,.2)]));const route=new THREE.Group();route.name='observed-water-route';group.add(route);data.parts.subject=route;data.modelBound=true;
       for(const r of reservoirs){const p=map.get(r.id);const mark=ball(p.x,p.y,p.z,.07,.07,.07,r.kind==='cloud'?'pale':'lightWater',route);mark.userData.reservoirId=r.id;}
       for(const t of transfers){const a=map.get(t.from),b=map.get(t.to),d=b.clone().sub(a);if(d.length()<.001){const loop=mesh(new THREE.TorusGeometry(.11,.018,6,20),'gold',a.x,a.y,a.z,route);loop.rotation.x=Math.PI/2;loop.userData.from=t.from;loop.userData.to=t.to;continue;}const path=rod(a.toArray(),b.toArray(),.018,'lightWater',route);path.userData.from=t.from;path.userData.to=t.to;const arrow=mesh(new THREE.ConeGeometry(.055,.13,8),'gold',b.x,b.y,b.z,route);arrow.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());}}
    } else if(id==='CHEM79-NUTRIENT-PROT') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.5,.1,.6,'wood',group);const chain=new THREE.Group();group.add(chain);data.parts.subject=chain;
      for(let j=0;j<5;j++){const x=-.6+j*.3,y=.45+(j%2)*.12;ball(x,y,0,.12,.12,.12,'pale',chain);if(j)rod([x-.3,.45+((j-1)%2)*.12,0],[x,y,0],.025,'gold',chain);}
    } else if(id==='M79-OPPOSITE-01') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.6,.1,.65,'wood',group);
      const a=new THREE.Group(),b=new THREE.Group();a.name='left-marker';b.name='right-marker';a.position.set(-.65,.3,0);b.position.set(.65,.3,0);group.add(a,b);data.parts.left=a;data.parts.right=b;
      ball(0,0,0,.15,.15,.15,'roof',a);ball(0,0,0,.15,.15,.15,'water',b);
      for(const parent of [a,b])rod([-.075,0,.14],[.075,0,.14],.015,'pale',parent);rod([0,-.075,.14],[0,.075,.14],.015,'pale',a);
      rod([0,.15,0],[0,.6,0],.035,'pale',group);
    } else if(id==='M79-ABS-01') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.6,.1,.65,'wood',group);ball(0,.25,0,.15,.15,.15,'gold',group);
      const left=ball(-.75,.25,0,.14,.14,.14,'roof',group),right=ball(.75,.25,0,.14,.14,.14,'water',group);left.name='left-marker';right.name='right-marker';data.parts.left=left;data.parts.right=right;
    } else if(id==='M79-EQ1-CHECK'||id==='M79-SYSTEM-ALG') {
      group.position.set(id==='M79-EQ1-CHECK'?2.55:-2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.15,0],.05,'wood',group);
      const gate=box(0,.55,0,.9,.55,.06,'wood',group);data.parts.subject=gate;
    } else if(id==='M79-PCT-CHANGED') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.05,0],[x,1.1,0],.05,'wood',group);
      const gate=box(0,.65,0,.9,.48,.06,'wood',group);data.parts.subject=gate;
    } else if(id==='PHY79-GENERATION') {
      group.position.set(2.4,.2,-2.3);box(0,.1,0,1.8,.12,.7,'wood',group);
      const model=lessonModel?.kind==='electricity-harbor'&&lessonModel.mode==='generation'&&lessonModel.observed===true?lessonModel:null;
      const control=model?.control,source=model?.given?.source,speed=model?.given?.speed,observation=model?.outcome?.observation;
      if(model&&['on','off'].includes(control)&&['water','wind','hand'].includes(source)&&Number.isFinite(speed)&&speed>0&&speed<=20&&Array.isArray(observation)&&observation.length===1&&observation[0]===(control==='on'?'input-generates':'no-input')){
        const rotor=new THREE.Group();rotor.name='generator-rotor';rotor.position.set(-.35,.5,0);group.add(rotor);const ring=mesh(new THREE.TorusGeometry(.28,.045,6,24),'gold',0,0,0,rotor);
        for(let j=0;j<4;j++){const a=j*Math.PI/2;rod([0,0,0],[.25*Math.cos(a),.25*Math.sin(a),0],.025,'wood',rotor);}
        const lamp=ball(.55,.45,0,.17,.17,.17,'dark',group);lamp.name='generator-lamp';data.parts.subject=rotor;data.parts.lamp=lamp;data.parts.running=control==='on';data.parts.speed=speed;data.modelBound=true;
        if(source==='water')box(-.8,.55,0,.18,.8,.05,'lightWater',group);
        else if(source==='wind')rod([-.8,.3,0],[-.8,1,0],.04,'wood',group);
        else rod([-.8,.42,0],[-.55,.62,0],.045,'wood',group);
      }else{
        const outline=mesh(new THREE.TorusGeometry(.28,.045,6,24),'dark',-.35,.5,0,group);ball(.55,.45,0,.17,.17,.17,'dark',group);
      }
    } else if(id==='PHY79-POTENTIAL') {
      group.position.set(2.55,.2,-2.3);rod([-.55,.05,0],[-.55,1.45,0],.05,'wood',group);rod([.55,.05,0],[.55,1.45,0],.05,'wood',group);
      const initial=lessonModel?.kind==='energy-islands'&&lessonModel.mode==='potential'&&lessonModel.observed===true?lessonModel.given:null,controls=lessonModel?.controls;
      if(initial&&controls&&[initial.height,initial.reference,controls.height,controls.reference].every(v=>Number.isFinite(v)&&v>=0&&v<=10)){
        data.parts.initialHeight=initial.height;data.parts.height=controls.height;data.parts.initialReference=initial.reference;data.parts.reference=controls.reference;
        const basket=box(0,.2,0,.48,.3,.4,'wood',group),level=box(0,.2,0,1.1,.025,.5,'lightWater',group);basket.name='potential-basket';level.name='potential-reference';data.parts.subject=basket;data.parts.level=level;data.modelBound=true;
      }
    } else if(id==='M-PS-01') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.1,0],[x,1.1,0],.05,'wood',group);
      const plan=box(0,.85,0,.85,.52,.04,'pale',group);data.parts.subject=plan;
      curvedTimberLocal(group,[[-.32,.72,.04],[0,.95,.04],[.32,.72,.04]],.025);
    } else if(id==='M-PS-04') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.65,.65])rod([x,.1,0],[x,1.2,0],.05,'wood',group);
      box(0,.92,0,1.2,.65,.05,'cloth',group);const cards=new THREE.Group();group.add(cards);data.parts.subject=cards;
      for(const x of [-.3,.3])box(x,.92,.04,.46,.35,.03,'pale',cards);
    } else if(id==='M-REP-03') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.2,.1,.8,'wood',group);
      const book=new THREE.Group();book.position.y=.23;group.add(book);data.parts.subject=book;
      for(const x of [-.25,.25])box(x,0,0,.48,.04,.55,'pale',book);
    } else if(id==='M-REP-04') {
      group.position.set(2.55,.2,-2.3);rod([0,.1,0],[0,1.1,0],.05,'wood',group);box(0,.9,0,.85,.5,.05,'wood',group);
      const note=box(-.8,.9,.04,.55,.3,.025,'pale',group);data.parts.subject=note;
    } else if(id==='M-MUL-02') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.1,.1,.75,'wood',group);
      const page=box(-.8,.22,0,.7,.04,.5,'pale',group);data.parts.subject=page;
    } else if(id==='M-NUM-14') {
      group.position.set(2.55,.2,-2.3);box(0,.12,0,1.1,.1,.75,'wood',group);box(0,.19,0,.85,.025,.6,'pale',group);
      const label=box(-.8,.25,0,.5,.04,.18,'gold',group);data.parts.subject=label;
    } else if(id==='M-TH-06') {
      group.position.set(2.55,.2,-2.1);const boat=ball(-.65,.15,0,.5,.13,.25,'wood',group);data.parts.subject=boat;
      rod([.1,.1,0],[.1,.75,0],.045,'wood',group);const ropeGeometry=new THREE.CylinderGeometry(.025,.025,1,8);ropeGeometry.translate(0,.5,0);
      const rope=mesh(ropeGeometry,'gold',.1,.7,0,group);data.parts.rope=rope;
    } else if(id==='M-TH-03') {
      group.position.set(0,.15,-2.2);const path=new THREE.Group();group.add(path);data.parts.subject=path;
      for(let j=0;j<4;j++)box(-1.2+j*.8,.09+j*.06,0,.62,.08,.35,'wood',path);
    } else if(id==='M-TH-08') {
      group.position.set(-2.65,.2,-2.3);box(0,.12,0,1,.1,.7,'wood',group);box(0,.2,0,.88,.03,.6,'pale',group);
      const route=mesh(new THREE.TorusGeometry(.2,.022,6,20,Math.PI*1.5),'dark',0,.23,0,group);route.rotation.x=Math.PI/2;data.parts.subject=route;
    } else if(id==='M-WORK-03') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.4,.4])rod([x,.1,0],[x,1.1,0],.04,'wood',group);
      box(-.4,.9,0,.5,.35,.04,'pale',group);box(.4,.9,0,.5,.35,.04,'pale',group);
      const sign=questionMark(group,.4,.9,.04);data.parts.subject=sign;
    } else if(id==='CHEM79-CONCL-01') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.1,0],[x,1.2,0],.05,'wood',group);
      const report=box(0,.9,0,.9,.55,.04,'pale',group);data.parts.subject=report;
    } else if(id==='CHEM79-QUESTION-01'||id==='PHY79-QUESTION-01') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.1,0],[x,1.2,0],.05,'wood',group);
      const screen=box(0,.9,0,.9,.55,.04,id==='CHEM79-QUESTION-01'?'lightWater':'pale',group);data.parts.subject=screen;data.parts.mark=questionMark(group,0,.9,.04);
    } else if(id==='PHY79-PLAN-01') {
      group.position.set(2.55,.2,-2.3);const stations=new THREE.Group();group.add(stations);data.parts.subject=stations;
      for(const x of [-.45,.45]){box(x,.2,0,.7,.12,.55,'wood',stations);rod([x,.27,0],[x,.9,0],.04,'wood',stations);}
    } else if(id==='PHY79-WORK-CALC'||id==='PHY79-POWER-CALC') {
      group.position.set(2.4,.2,-2.25);box(0,.12,0,1.6,.1,.8,'wood',group);
      for(const x of [-.65,.65])rod([x,.18,0],[x,1.45,0],.045,'wood',group);rod([-.65,1.45,0],[.65,1.45,0],.04,'wood',group);
      const lift=lessonModel?.kind==='work-power'&&Array.isArray(lessonModel.lifts)&&lessonModel.lifts.length===1?lessonModel.lifts[0]:null;
      if(lift&&Number.isFinite(lift.distanceM)&&lift.distanceM>=0&&lift.distanceM<=5&&Number.isFinite(lift.durationS)&&lift.durationS>0&&lift.durationS<=10&&['parallel','horizontal','perpendicular','hold'].includes(lift.direction)){
        const cart=box(-.5,.35,0,.4,.35,.35,'pale',group);data.parts.subject=cart;data.parts.distance=lift.distanceM;data.parts.direction=lift.direction;data.duration=lift.durationS*1000;data.modelBound=true;
        const rg=new THREE.CylinderGeometry(.018,.018,1,8);rg.translate(0,.5,0);
        const rope=mesh(rg,'gold',0,0,0,group);rope.name='model-lift-rope';data.parts.rope=rope;
        if(lift.direction==='horizontal'||lift.direction==='perpendicular'){rope.position.set(.7,.35,0);rope.rotation.z=Math.PI/2;}
        else{rope.position.set(-.5,1.45,0);rope.rotation.z=Math.PI;}

        if(initial)data.elapsed=data.duration;
      }
    } else if(id==='M79-PRIMEFACT-01') {
      group.position.set(2.55,.2,-2.3);const left=ball(-.8,.2,0,.4,.18,.3,'rock',group),right=ball(.8,.2,0,.4,.18,.3,'rock',group);data.parts.left=left;data.parts.right=right;
      const window=box(0,.9,0,.6,.55,.04,'pale',group);data.parts.subject=window;
    } else if(id==='M79-CONE-SA') {
      group.position.set(2.55,.2,-2.3);ball(0,.08,0,.8,.1,.6,'rock',group);
      const roof=mesh(new THREE.ConeGeometry(.7,.9,20),'cloth',0,.75,0,group);data.parts.subject=roof;
    } else if(id==='M79-THALES') {
      group.position.set(2.55,.2,-2.3);const ring=mesh(new THREE.TorusGeometry(.62,.035,6,28),'gold',0,.2,0,group);ring.rotation.x=Math.PI/2;
      const angle=new THREE.Group();group.add(angle);rod([-.15,.23,-.15],[.15,.23,-.15],.025,'pale',angle);rod([.15,.23,-.15],[.15,.23,.15],.025,'pale',angle);data.parts.subject=angle;
    } else if(id==='M79-CYL-SA') {
      group.position.set(2.55,.2,-2.3);mesh(new THREE.CylinderGeometry(.35,.35,.9,20),'water',0,.5,0,group);
      const cover=mesh(new THREE.CylinderGeometry(.45,.45,1,20,1,true),'cloth',0,.55,0,group);data.parts.subject=cover;data.parts.ends=[];for(const y of [.05,1.05]){const end=mesh(new THREE.CircleGeometry(.45,24),'cloth',0,y,0,group);end.rotation.x=Math.PI/2;data.parts.ends.push(end);}
    } else if(id==='M79-SPHERE-SA') {
      group.position.set(2.55,.2,-2.3);const globe=ball(0,.65,0,.55,.55,.55,'water',group);data.parts.subject=globe;
      const island=ball(0,.9,.42,.13,.06,.08,'reed',group);data.parts.island=island;
    } else if(id==='CHEM79-STATECHANGE') {
      group.position.set(2.55,.2,-2.3);const material=box(0,.5,0,.55,.55,.55,'lightWater',group);data.parts.subject=material;
    } else if(id==='PHY79-SERIES') {
      group.position.set(2.4,.2,-2.3);box(0,.1,0,1.8,.1,.55,'wood',group);
      const circuit=lessonModel?.kind==='circuit-workshop'&&lessonModel.observed===true&&lessonModel.given?.topology==='series'?lessonModel.circuit:null;
      const lit=lessonModel?.outcome?.lit,resistances=lessonModel?.given?.resistances;
      if(circuit&&Array.isArray(resistances)&&resistances.length===2&&Array.isArray(circuit.edges)&&circuit.edges.length<=2&&Array.from(circuit.edges).every(e=>e?.id==='r0'||e?.id==='r1')&&new Set(circuit.edges.map(e=>e.id)).size===circuit.edges.length&&Array.isArray(lit)&&Array.from(lit).every(id=>Array.from(circuit.edges).some(e=>e?.id===id))&&new Set(lit).size===lit.length){
        data.parts.lamps=[];const present=new Set(circuit.edges.map(e=>e.id));
        for(let i=0;i<2;i++){const x=-.35+i*.7;if(present.has(`r${i}`)){const bulb=ball(x,.35,0,.18,.18,.18,'dark',group);data.parts.lamps.push({bulb,lit:lit.includes(`r${i}`)});}}
        rod([-.9,.35,0],[-.53,.35,0],.025,'gold',group);rod([-.17,.35,0],[.17,.35,0],.025,'gold',group);rod([.53,.35,0],[.9,.35,0],.025,'gold',group);
        rod([-.9,.35,0],[-.9,.35,-.35],.025,'gold',group);rod([.9,.35,0],[.9,.35,-.35],.025,'gold',group);rod([-.9,.35,-.35],[-.2,.35,-.35],.025,'gold',group);rod([.2,.35,-.35],[.9,.35,-.35],.025,'gold',group);box(0,.35,-.35,.4,.22,.2,'pale',group);
        data.modelBound=true;
      }else{for(const x of [-.35,.35]){const socket=mesh(new THREE.TorusGeometry(.18,.03,6,20),'dark',x,.35,0,group);socket.rotation.x=Math.PI/2;}}
    } else if(id==='M79-TEXT-02') {
      group.position.set(2.5,.2,-2.3);const boat=ball(-.8,.15,0,.45,.14,.24,'wood',group);data.parts.subject=boat;
      rod([.15,.1,0],[.15,1.0,0],.04,'wood',group);const flag=box(.37,.87,0,.44,.26,.04,'pale',group);data.parts.flag=flag;
    } else if(id==='M79-PCT-BASE') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.1,0],[x,1.1,0],.045,'wood',group);
      const paper=box(0,.85,0,.9,.48,.045,'pale',group);data.parts.subject=paper;
    } else if(id==='M79-POLY-MUL') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.65,.65])rod([x,.1,0],[x,1.05,0],.05,'wood',group);
      const roof=mesh(new THREE.ConeGeometry(.95,.55,4),'cloth',0,1.32,0,group);roof.rotation.y=Math.PI/4;data.parts.subject=roof;
    } else if(id==='M79-EXPR-SIMPLIFY') {
      group.position.set(-2.7,.2,-2.3);rod([0,.1,0],[0,1.15,0],.05,'wood',group);box(0,.92,0,.95,.5,.08,'wood',group);
      const drawing=box(0,.92,.05,.76,.36,.025,'pale',group);data.parts.subject=drawing;
    } else if(id==='M79-PARABOLA-GRAPH') {
      group.position.set(2.6,.2,-2.25);for(const x of [-.55,.55])rod([x,.1,0],[x,1.25,0],.05,'wood',group);
      const window=box(0,.92,0,.95,.55,.04,'lightWater',group);data.parts.subject=window;
      rod([0,.08,.4],[0,.5,.4],.035,'reed',group);ball(0,.56,.4,.2,.14,.14,'reed',group);
    } else if(id==='M79-POWER-PROD') {
      group.position.set(-2.6,.2,-2.3);curvedTimberLocal(group,[[-.65,.9,0],[0,1.35,0],[.65,.9,0]],.045);
      const lights=new THREE.Group();group.add(lights);for(const x of [-.4,0,.4])ball(x,1.12,0,.1,.1,.1,'gold',lights);data.parts.subject=lights;
    } else if(id==='M79-POWER-SIMPLIFY') {
      group.position.set(2.6,.2,-2.3);rod([0,.1,0],[0,1.15,0],.05,'wood',group);
      const note=box(0,.94,0,.6,.42,.04,'pale',group);data.parts.subject=note;
    } else if(id==='M79-TRIG-CALC') {
      group.position.set(2.6,.2,-2.3);ball(0,.12,0,.55,.12,.4,'rock',group);rod([0,.2,0],[0,1.2,0],.05,'wood',group);
      const lamp=ball(0,1.3,0,.2,.2,.2,'gold',group);data.parts.subject=lamp;
    } else if(id==='ENV-PHY-LIGHT-01') {
      group.position.set(2.55,.2,-2.3);group.rotation.y=.72;box(0,.15,0,1.3,.12,.7,'wood',group);
      const wall=box(.4,.9,0,.06,1.4,.65,'pale',group);data.parts.subject=wall;
      const obs=lessonModel?.kind==='waves-observatory'?lessonModel.observation:null;
      const values=lessonModel&&[lessonModel.sourceX,lessonModel.objectX,lessonModel.screenX,lessonModel.sourceY,lessonModel.objectY,lessonModel.objectHalf];
      if(obs&&obs.kind==='light'&&['round','square'].includes(lessonModel.shape)&&['sun','lamp'].includes(lessonModel.context)&&Array.isArray(values)&&values.every(Number.isFinite)&&lessonModel.sourceX<lessonModel.objectX&&lessonModel.objectX<lessonModel.screenX&&lessonModel.objectHalf>0&&Math.abs(lessonModel.sourceY)<=5&&Math.abs(lessonModel.objectY)+lessonModel.objectHalf<=5&&typeof obs.shadowLow==='number'&&typeof obs.shadowHigh==='number'&&Number.isFinite(obs.shadowLow)&&Number.isFinite(obs.shadowHigh)&&obs.shadowLow<obs.shadowHigh&&Math.abs(obs.shadowLow)<=5&&Math.abs(obs.shadowHigh)<=5){
        const low=obs.shadowLow,high=obs.shadowHigh,height=(high-low)*.06,middle=(low+high)*.03;
        const sx=-.55,wx=.4,ox=sx+(lessonModel.objectX-lessonModel.sourceX)/(lessonModel.screenX-lessonModel.sourceX)*(wx-sx);
        const sy=.9+lessonModel.sourceY*.06,oy=.9+lessonModel.objectY*.06,half=lessonModel.objectHalf*.06;
        let shadow;
        if(lessonModel.shape==='round'){shadow=mesh(new THREE.CircleGeometry(1,24),'dark',.36,.9+middle,0,group);shadow.rotation.y=-Math.PI/2;shadow.scale.set(.11,height/2,1);}
        else shadow=box(.36,.9+middle,0,.025,height,.22,'dark',group);
        shadow.name='observed-shadow';data.parts.shadow=shadow;
        if(lessonModel.shape==='round')ball(ox,oy,0,.08,half,.08,'dark',group);else box(ox,oy,0,.1,2*half,.16,'dark',group);
        if(lessonModel.context==='lamp')ball(sx,sy,0,.08,.08,.08,'gold',group);else rod([sx,.3,0],[sx,1.45,0],.035,'gold',group);
        for(const [edge,bound] of [[-1,low],[1,high]]){
          const originY=lessonModel.context==='sun'?oy+edge*half-(lessonModel.objectX-lessonModel.sourceX)*lessonModel.sourceY/10*.06:sy;
          rod([sx,originY,0],[ox,oy+edge*half,0],.012,'gold',group);rod([ox,oy+edge*half,0],[.35,.9+bound*.06,0],.012,'gold',group);
        }
        data.modelBound=true;
      }
    } else if(id==='SCI-ENV-CONCL-01') {
      group.position.set(2.6,.2,-2.3);ball(0,.04,0,.5,.08,.4,'rock',group);mesh(new THREE.CylinderGeometry(.3,.25,.35,16),'wood',0,.25,0,group);rod([0,.42,0],[0,.92,0],.035,'reed',group);
      const leafShape=new THREE.Shape();leafShape.moveTo(-1,0);leafShape.quadraticCurveTo(0,.9,1,0);leafShape.quadraticCurveTo(0,-.9,-1,0);const leaf=mesh(new THREE.ShapeGeometry(leafShape,12),'reed',.16,.89,0,group);leaf.scale.set(.28,.12,.12);leaf.name='new-leaf';data.parts.subject=leaf;const second=mesh(new THREE.ShapeGeometry(leafShape,12),'moss',-.16,.73,.015,group);second.scale.set(.24,.1,.12);second.rotation.z=-.25;second.name='second-leaf';data.parts.secondLeaf=second;
    } else if(id==='SCI-ENV-EVAL-01') {
      group.position.set(-2.7,.2,-2.3);for(const x of [-.55,.55])rod([x,.05,0],[x,1.25,0],.05,'wood',group);
      const card=box(0,.95,0,.95,.5,.05,'pale',group);data.parts.subject=card;
    } else if(id==='CHEM79-OBS-01') {
      group.position.set(2.6,.2,-2.25);box(0,.15,0,1.1,.1,.7,'wood',group);mesh(new THREE.CylinderGeometry(.17,.17,.48,12),'lightWater',0,.45,0,group);
      const card=box(.5,.7,0,.45,.35,.04,'pale',group);data.parts.subject=card;data.parts.mark=questionMark(group,.5,.7,.04);
    } else if(id==='PHY79-CONCL-01') {
      group.position.set(2.55,.2,-2.25);for(const x of [-.6,.6])ball(x,.06,0,.22,.1,.2,'rock',group);
      const deck=box(0,.3,0,1.5,.1,.7,'wood',group);data.parts.subject=deck;
    } else if(id==='PHY79-SAFE-01') {
      group.position.set(2.6,.2,-2.25);for(const x of [-.5,.5])rod([x,.1,0],[x,1.25,0],.05,'wood',group);
      const window=box(0,.95,0,.95,.55,.04,'lightWater',group);data.parts.subject=window;
    } else if(id==='PHY79-ELEC-SAFE') {
      group.position.set(2.6,.2,-2.25);for(const x of [-.55,.55])rod([x,.1,0],[x,1.15,0],.05,'wood',group);
      const gate=box(0,.65,0,1,.35,.05,'wood',group);data.parts.subject=gate;
    } else if(id==='M79-PROOF-01') {
      group.position.set(0,.2,-2.3);for(const x of [-1,1])ball(x,.05,0,.3,.1,.3,'rock',group);
      const bridge=box(0,.25,0,2,.12,.45,'wood',group);data.parts.subject=bridge;data.parts.basket=box(0,.48,0,.35,.3,.3,'pale',group);
    } else if(id==='M79-SQRT-03') {
      group.position.set(2.5,.2,-2.4);for(const x of [-.65,.65])rod([x,.05,0],[x,1.1,0],.05,'wood',group);
      const roof=mesh(new THREE.ConeGeometry(.92,.5,4),'cloth',0,1.33,0,group);roof.rotation.y=Math.PI/4;data.parts.subject=roof;
    } else if(id==='M79-POWER-ZERO') {
      group.position.set(-2.7,.2,-2.1);rod([0,.05,0],[0,.8,0],.06,'wood',group);const lamp=ball(0,.95,0,.22,.22,.22,'gold',group);data.parts.subject=lamp;
    } else if(id==='M79-LOGIC-02') {
      group.position.set(2.75,.2,-2.25);rod([0,.1,0],[0,1.1,0],.055,'wood',group);const lamp=ball(0,1.2,0,.2,.2,.2,'gold',group);data.parts.subject=lamp;
    } else if(id==='M79-PROG-02') {
      group.position.set(2.3,.18,-1.8);rod([.6,.1,0],[.6,1.05,0],.045,'wood',group);ball(.6,1.15,0,.16,.16,.16,'gold',group);
      const boat=ball(-.8,.16,.15,.42,.12,.22,'wood',group);data.parts.subject=boat;
    } else if(id==='M79-TECH-01') {
      group.position.set(2.55,.2,-2.25);for(const x of [-.5,.5])rod([x,.05,0],[x,.6,0],.06,'wood',group);
      const tabletop=box(0,.65,0,1.25,.1,.75,'wood',group);data.parts.subject=tabletop;
    } else if(id==='SCI-ENV-EXP-01') {
      group.position.set(-2.4,.18,-1.9);const boat=ball(0,.15,0,.48,.13,.25,'wood',group);data.parts.subject=boat;
      const wake=mesh(new THREE.TorusGeometry(.4,.025,6,24),'lightWater',0,.08,0,group);wake.rotation.x=Math.PI/2;data.parts.wake=wake;
    } else if(id==='SCI-ENV-SAFE-01') {
      group.position.set(2.7,.2,-2.25);rod([0,.1,0],[0,1.1,0],.05,'wood',group);
      const screen=box(0,1,0,.85,.5,.04,'pale',group);data.parts.subject=screen;
    } else if(id==='CHEM79-DATA-01') {
      group.position.set(2.55,.2,-2.3);for(const x of [-.5,.5])rod([x,.1,0],[x,1.2,0],.045,'wood',group);
      const display=box(0,.95,0,.95,.5,.04,'pale',group);data.parts.subject=display;
    } else if(id==='CHEM79-SUSTAIN') {
      group.position.set(2.55,.2,-2.2);ball(0,.18,0,.8,.17,.35,'wood',group);
      const patch=box(0,.35,0,.18,.32,.04,'pale',group);data.parts.subject=patch;
    } else if(id==='PHY79-RAD-SAFE') {
      group.position.set(-2.65,.2,-2.3);const base=mesh(new THREE.CylinderGeometry(.45,.5,.5,16),'pale',0,.3,0,group);
      const dome=mesh(new THREE.SphereGeometry(.5,16,10,0,Math.PI*2,0,Math.PI/2),'cloth',0,.55,0,group);data.parts.subject=dome;
    } else if(id==='PHY79-ENERGY-IMPACT') {
      group.position.set(-2.6,.2,-2.2);rod([0,.1,0],[0,1.1,0],.05,'wood',group);
      const lamp=ball(0,1.2,0,.22,.22,.22,'gold',group);data.parts.subject=lamp;
      ball(.9,.12,0,.45,.1,.3,'reed',group);
    } else if(id==='M-WORK-02') {
      group.position.set(-2.8,.15,-1.9);rod([0,.1,0],[0,1.1,0],.045,'wood',group);
      const sign=box(0,1.0,0,.78,.42,.055,'pale',group);data.parts.subject=sign;data.parts.mark=questionMark(group,0,1.0,.04);
    } else if(id==='M-DATA-02') {
      group.position.set(2.8,.18,-2.15);box(0,.1,0,1,.12,.7,'wood',group);
      const book=box(0,.28,0,.72,.08,.5,'pale',group);data.parts.subject=book;
    } else if(id==='M-PROG-03') {
      group.position.set(-2.75,.18,-2.3);rod([0,.1,0],[0,1.15,0],.045,'wood',group);
      const card=box(0,1.0,0,.75,.48,.045,'pale',group);data.parts.subject=card;
      // The learner's checked ferry trace is used only if the safe scene model actually carries it.
      const board=lessonModel?.kind==='programming-ferry'?lessonModel.board:null,path=lessonModel?.path;
      if(board&&Number.isInteger(board.width)&&board.width>0&&board.width<=16&&Number.isInteger(board.height)&&board.height>0&&board.height<=16&&Array.isArray(path)&&path.length>0&&path.length<=64&&path.every(c=>Number.isInteger(c?.x)&&Number.isInteger(c?.y)&&c.x>=0&&c.y>=0&&c.x<board.width&&c.y<board.height)){
        const spacing=Math.min(1.2/board.width,.8/board.height);data.parts.path=path.map(c=>new THREE.Vector3((c.x-(board.width-1)/2)*spacing,.14,(c.y-(board.height-1)/2)*spacing));
        const vessel=ball(0,.14,0,.13,.07,.09,'wood',group);data.parts.vessel=vessel;data.modelBound=true;
      }
    } else if(id==='M-PROB-05') {
      group.position.set(2.55,.25,-2.2);rod([0,.1,0],[0,1.2,0],.045,'wood',group);
      const flag=box(.24,1.04,0,.48,.3,.04,'roof',group);data.parts.subject=flag;
    } else if(id==='M-TH-04') {
      group.position.set(0,.15,-2.1);const markers=new THREE.Group();group.add(markers);data.parts.subject=markers;
      for(let j=0;j<4;j++)ball(-1.5+j*.95,.05,-.12*j,.21,.055,.15,'pale',markers);
    } else if(id==='M-TH-05') {
      group.position.set(2.5,.18,-2);const boat=ball(-1,.1,.2,.5,.13,.24,'reed',group);data.parts.subject=boat;
      const wake=mesh(new THREE.TorusGeometry(.42,.025,6,24),'lightWater',-.65,.07,.2,group);wake.rotation.x=Math.PI/2;data.parts.wake=wake;
    } else if(id==='M-ALG-09') {
      group.position.set(2.55,.2,-2.2);box(0,.3,0,.72,.55,.6,'wood',group);
      const hinge=new THREE.Group();hinge.position.set(0,.62,-.3);group.add(hinge);
      box(0,0,.3,.8,.07,.65,'gold',hinge);data.parts.subject=hinge;
    } else if(id==='M-DATA-12') {
      group.position.set(-2.65,1.75,-2.4);const beam=mesh(new THREE.ConeGeometry(.2,1.5,12),'gold',.65,0,0,group);
      beam.rotation.z=-Math.PI/2;data.parts.subject=beam;
    } else if(id==='M-NUM-16') {
      group.position.set(-3.12,.25,-1.7);
      const ledger=box(1.0,.15,.2,.54,.08,.36,'pale',group);data.parts.subject=ledger;
      box(-.8,.04,.2,.8,.08,.55,'wood',group);
    } else if(id==='M-NUM-13') {
      group.position.set(2.65,.17,-1.2);
      const boat=ball(-1.1,.16,.4,.42,.12,.22,'wood',group);data.parts.subject=boat;
      rod([-.12,.05,0],[-.12,.5,0],.035,'wood',group);
    } else if(id==='M-PS-02') {
      group.position.set(-3.12,.17,-1.9);
      const pivot=new THREE.Group();pivot.position.set(0,1.55,0);group.add(pivot);
      const delta=new THREE.Vector3(-1.1,-1.38,.7);pivot.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.clone().normalize());
      const g=new THREE.CylinderGeometry(.025,.025,delta.length(),8);g.translate(0,delta.length()/2,0);
      const rope=mesh(g,'gold',0,0,0,pivot);data.parts.subject=rope;
      rod([-1.1,.02,.7],[-1.1,.27,.7],.045,'wood',group);
    } else if(id==='M-FRAC-14') {
      group.position.set(3.42,.05,-1.2);
      ball(0,.3,0,.7,.56,.4,'rock',group);
      const sheet=box(0,.35,.42,.38,.6,.035,'lightWater',group);
      sheet.geometry.translate(0,.3,0);data.parts.subject=sheet;
    } else if(id==='M-GEO-16') {
      group.position.set(-3.6,.1,-2.4);
      ball(0,.05,0,.65,.12,.5,'rock',group);
      const tower=mesh(new THREE.CylinderGeometry(.28,.38,1.1,12),'pale',0,.55,0,group);
      data.parts.subject=tower;
      const window=box(0,.78,.29,.17,.22,.04,'gold',group);data.parts.window=window;
    }
    // Fit the current consequence into a bounded foreground volume. Memories use their own edge anchors.
    group.updateWorldMatrix(true,true);const bounds=new THREE.Box3().setFromObject(group),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3()),origin=group.getWorldPosition(new THREE.Vector3());
    if(!bounds.isEmpty()&&[size.x,size.y,size.z,center.x,center.y,center.z].every(Number.isFinite)){
      const emphasis={'M-PS-06':1.15,'SCI-ENV-CONCL-01':.9,'M-PS-03':1.1,'M-MEAS-07':.65,'M-DATA-08':.7,'M-SYM-02':.85,'M-FRAC-16':.7,'ENV-PHY-DEVICE-01':.85}[id]??.8;const factor=Math.min(5,5.5/Math.max(.01,size.x),3.5/Math.max(.01,size.y),3.5/Math.max(.01,size.z))*emphasis;
      data.memoryScale=Math.min(1.2,1.2/Math.max(.01,size.x),1.3/Math.max(.01,size.y),.7/Math.max(.01,size.z));
      group.scale.setScalar(factor);group.position.set(-(center.x-origin.x)*factor,.12-(bounds.min.y-origin.y)*factor,1.0-(center.z-origin.z)*factor);
    }
    data.basePosition=group.position.clone();data.baseScale=group.scale.clone();
    return data;
  }
  const stagedActions=new Set(['M-PS-06','SCI-ENV-CONCL-01','M-PS-03','M-MEAS-07','M-DATA-08','M-SYM-02','M-FRAC-16','ENV-PHY-DEVICE-01']);
  function applyEffect(e) {
    if(!e.group)return;
    const raw=Math.min(1,e.elapsed/e.duration),t=stagedActions.has(e.id)?THREE.MathUtils.clamp((raw-.2)/.6,0,1):raw;
    const grow=subject=>{if(!e.parts.baseScale)e.parts.baseScale=subject.scale.clone();subject.scale.copy(e.parts.baseScale).multiplyScalar(Math.max(.02,t));};
    if(e.id==='M-TH-01')e.parts.subject.position.x=-.7*(1-t);
    if(['M-GEO-18','M79-CONE-V','PHY79-HEAT-MECH','PHY79-UNIVERSE-SCALE'].includes(e.id))grow(e.parts.subject);
    if(e.id==='ENV-CHEM-WATERCYCLE-01'&&e.modelBound)grow(e.parts.subject);
    if(['M79-TRUTH-01','M79-POLY-SUB'].includes(e.id))grow(e.parts.subject);
    if(['CHEM79-PERIOD-GROUP','M79-SEQ-01','M79-TRIG-01','M79-ZERO','PHY79-CHARGING'].includes(e.id))e.parts.subject.rotation.y=-Math.PI*.5*t;
    if(['M-PROG-07','M79-POLY-ADD'].includes(e.id))e.parts.subject.rotation.z=.65*t;
    if(e.id==='ENV-PHY-SOUND-01')e.parts.subject.scale.setScalar(1+.12*Math.sin(8*Math.PI*t)*(1-t));
    if(['M79-POLY-ANGLES','M79-POLY-PERIM','M79-EQ1-FORM','M79-TRI-ANGLE-SUM','M79-ANGLE-REL','CHEM79-SUBSCRIPT','CHEM79-WATERFAT-SOL'].includes(e.id))grow(e.parts.subject);
    if(['M79-INEQ-SOLVE','CHEM79-MIX-HOM'].includes(e.id))e.parts.subject.rotation.y=-Math.PI*.5*t;
    if(e.id==='CHEM79-SEPARATE-02')e.parts.subject.rotation.x=-Math.PI*.55*t;
    if(['M79-PYTH-CONVERSE','M79-QUAD-INCOMP-02','M79-SYSTEM-GRAPH','M79-COMB-01','CHEM79-BALANCE','CHEM79-CONC-CALC'].includes(e.id)&&e.modelBound)grow(e.parts.subject);
    if(['CHEM79-CONC-COMP','CHEM79-NUTRIENT-FAT','CHEM79-SCALE','CHEM79-MEAS-01'].includes(e.id))grow(e.parts.subject);
    if(['CHEM79-ORG-GROUP','CHEM79-ATOMICNUM','CHEM79-REACTION-MODEL','CHEM79-RATE-CONC','CHEM79-RATE-TEMP','PHY79-OHM'].includes(e.id))e.parts.subject.rotation.y=-Math.PI*.5*t;
    if(['CHEM79-RATE-SURF','CHEM79-LAB-01'].includes(e.id))e.parts.subject.rotation.x=-Math.PI*.55*t;
    if(['PHY79-ACCEL-GRAPH','PHY79-ST-GRAPH','SCI-ENV-OBS-01','PHY79-PREC-01'].includes(e.id))grow(e.parts.subject);
    if(e.id==='ENV-PHY-CAUSE-MOTION-01')e.parts.subject.scale.y=Math.max(.001,1-t);
    if(e.id==='PHY79-ACCEL-CALC')e.parts.subject.rotation.z=.65*t;
    if(e.id==='PHY79-SPEED-REARR')e.parts.subject.position.y=.28+.8*t;
    if(['PHY79-SPEED-MIXED','PHY79-VT-GRAPH','PHY79-PREDICT-01'].includes(e.id))e.parts.subject.rotation.y=-Math.PI*.5*t;
    if(['M79-MEDIAN','M79-MODE','M79-SPREAD','M79-REAL-02','M79-RAY','M79-SIMILAR-SCALE','M79-EXPR-EVAL'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M79-PROB-CLASSIC')e.parts.subject.position.y=.28+.8*t;
    if(e.id==='M79-SIM-CRIT')e.parts.subject.rotation.x=-Math.PI*.55*t;
    if(e.id==='M79-UNIT-VOL')e.parts.subject.rotation.y=-Math.PI*.5*t;
    if(e.id==='ENV-PHY-DEVICE-01'){e.parts.lens.material=e.parts.lampOn&&t>=1?materials.glow:materials.dark;if(e.parts.light)e.parts.light.intensity=e.elapsed<e.duration?.55*t:0;}
    if(['M79-CURVE','M79-INTERCEPT','M79-MEAN'].includes(e.id))grow(e.parts.subject);
    if(['M-CALC-STRAT','M79-CONG-CRIT'].includes(e.id))e.parts.subject.position.x=-.8+1.35*t;
    if(e.id==='M-ALG-08')e.parts.subject.rotation.x=-Math.PI*.55*t;
    if(['M79-DIAGRAM-INTERP','M79-DIAGRAM-PROD','M79-INT-MUL'].includes(e.id))e.parts.subject.rotation.y=-Math.PI*.5*t;
    if(e.id==='M79-INT-DIV')e.parts.subject.position.y=-.4+.4*t;
    if(['PHY79-SUPPORT','PHY79-WEIGHT','PHY79-FRICTION','CHEM79-PH','CHEM79-CARBON-BURN','CHEM79-ELECTRON','CHEM79-NEUTRON'].includes(e.id))grow(e.parts.subject);
    if(e.id==='PHY79-KINETIC'&&e.modelBound)grow(e.parts.subject);
    if(['PHY79-ELEC-ENERGY','CHEM79-INDICATOR'].includes(e.id))e.parts.subject.rotation.y=-Math.PI*.5*t;
    if(['M-SCALE-02','M-UNIT-05','M-STAT-01'].includes(e.id))grow(e.parts.subject);
    if(['M-SYM-01','M-TIME-02','M-STAT-02','M-PROB-06'].includes(e.id))e.parts.subject.rotation.y=-Math.PI*.5*t;
    if(e.id==='M-DEC-06')e.parts.subject.rotation.x=-Math.PI*.55*t;
    if(e.id==='M-UNIT-03')e.parts.subject.position.x=-.8+1.35*t;
    if(['M-REP-01','M-MENTAL-01','M-WRMUL'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M-PS-03')e.parts.subject.position.x=-.8+1.4*t;
    if(e.id==='M-PS-05')e.parts.subject.scale.setScalar(Math.max(.001,1-t));
    if(e.id==='M-REP-05')e.parts.subject.position.y=.6-.3*t;
    if(e.id==='M-ADD-SUB-SELECT')e.parts.subject.rotation.z=.65*t;
    if(e.id==='M-EXPR-01'){e.parts.subject.position.y=.85-.5*t;e.parts.cable.scale.y=.2+.5*t;}
    if(e.id==='M-WRADD')e.parts.subject.rotation.y=-Math.PI*.5*t;
    if(e.id==='M-WRSUB')e.parts.subject.position.x=-.25+.8*t;
    if(e.id==='M-WRDIV')e.parts.subject.rotation.x=-Math.PI*.5*t;
    if(['M-DIVIS-02','M-NUM-04','M-NUM-05','M-NEG-04','M-FRAC-04','M-NUM-09','M-NUM-12'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M-DIV-FACT-01')e.parts.subject.scale.y=Math.max(.001,1-t);
    if(e.id==='M-ALG-02')e.parts.subject.rotation.z=Math.PI*2*t;
    if(e.id==='M-DEC-05')e.parts.subject.rotation.x=-Math.PI*.5*t;
    if(['M-GEO-03','M-DATA-08','M-GEO-24','M-GEO-08'].includes(e.id))grow(e.parts.subject);
    if(['M-DATA-05','M-GEO-23','M-GEO-09','M-DIVIS-03'].includes(e.id))e.parts.subject.rotation.y=-Math.PI*.5*t;
    if(e.id==='M-DATA-11')e.parts.subject.position.y=.28+.8*t;
    if(e.id==='M-GEO-12')e.parts.subject.scale.x=Math.max(.15,1-.85*t);
    if(['M79-DEC-DIV','M79-DEC-MUL','M79-DIRECTPROP','M79-GRAPH-MONO'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M79-POWER-NEG')e.parts.subject.position.y=1.3+.18*t;
    if(e.id==='M79-POWER-QUOT')e.parts.subject.rotation.y=-Math.PI*.5*t;
    if(e.id==='M79-DEC-ADD-SUB')e.parts.subject.rotation.x=-Math.PI*.55*(1-t);
    if(e.id==='M79-FRAC-DIV')e.parts.subject.position.y=.3+.78*t;
    if(e.id==='M79-TEXT-01')e.parts.subject.position.x=-.8+1.4*t;
    if(e.id==='M79-INVERSEPROP')e.parts.subject.rotation.z=-.6*t;
    if(['M79-SECTOR','M79-SLOPE','M79-PCT-SHARE','M79-PCT-COMP','M79-UNIT-LIN','M79-UNIT-AREA','M79-PROB-EMP'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M79-ARC')e.parts.subject.rotation.y=-Math.PI*.5*t;
    if(e.id==='M79-ROUND-01')e.parts.subject.position.x=-.9+1.1*t;
    if(e.id==='M79-PCT-PP'){e.parts.subject.position.y=.33+.5*t;e.parts.stream.visible=t>=1;}
    if(['M-FRAC-05','M-MEAS-14','M-MEAS-16','M-PROB-03','M-SYM-03'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M-FRAC-10')e.parts.subject.rotation.z=-.6*t;
    if(e.id==='M-MEAS-12')e.parts.subject.rotation.x=-Math.PI*.55*t;
    if(e.id==='M-MEAS-13')e.parts.subject.position.x=-.65+1.3*t;
    if(e.id==='M-NEG-03')e.parts.subject.position.y=1.1-.8*t;
    if(e.id==='M-EST-02')e.parts.subject.scale.setScalar(Math.max(.001,1-t));
    if(['M-ADD-COMM','M-ADD-ASSOC','M-MUL-ASSOC','M-NUM-15','M-NUM-17','M-NUM-11','M-FRAC-08','M-FRAC-09'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M-MUL-COMM')e.parts.subject.position.x=-.9+.9*t;
    if(e.id==='M-FRAC-16'){e.parts.subject.position.y=.32+.5*t;e.parts.stream.visible=t>=1;}
    if(['M79-CYL-V','M79-SPHERE-V','M-UNIT-06'].includes(e.id)&&e.modelBound)grow(e.parts.subject);
    if(e.id==='M-GEO-07'&&e.modelBound)grow(e.parts.subject);
    if(e.id==='M79-PYTH-CALC'&&e.modelBound)e.parts.subject.scale.y=Math.max(.001,t);
    if(e.id==='M-MEAS-10'&&e.modelBound)e.parts.subject.visible=t>=1&&e.parts.fillHeight>0;
    if(e.id==='PHY79-SI-01')e.parts.subject.position.x=-.72+1.44*t;
    if(e.id==='CHEM79-CHEMICAL-SAFE')e.parts.subject.rotation.y=-Math.PI*.48*(1-t);
    if(e.id==='CHEM79-ELEM-PROP')e.parts.subject.position.y=.8+.4*t;
    if(e.id==='CHEM79-NUTRIENT-CARB')grow(e.parts.subject);
    if(e.id==='M-TH-02')grow(e.parts.subject);
    if(e.id==='M-WORK-01'){e.parts.subject.position.x=-1+.55*t;e.parts.rope.scale.y=Math.max(.02,.7*t);}
    if(['M-TH-07','M79-CONSTRUCT','M79-PROP-SOLVE','CHEM79-EXOENDO','CHEM79-CARBON-PHOTO','CHEM79-NUTRIENT-PROT'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M79-OPPOSITE-01'){e.parts.left.position.x=-.65+.5*t;e.parts.right.position.x=.65-.5*t;}
    if(e.id==='M79-ABS-01'){e.parts.left.position.x=-.75+.15*t;e.parts.right.position.x=.75-.15*t;}
    if(['M79-EQ1-CHECK','M79-SYSTEM-ALG'].includes(e.id))e.parts.subject.position.y=.55+.65*t;
    if(e.id==='M79-PCT-CHANGED')grow(e.parts.subject);
    if(e.id==='PHY79-GENERATION'&&e.modelBound){if(e.parts.running)e.parts.subject.rotation.z=t*e.parts.speed*Math.PI;e.parts.lamp.material=t>=1&&e.parts.running?materials.gold:materials.dark;}
    if(e.id==='PHY79-POTENTIAL'&&e.modelBound){e.parts.subject.position.y=.35+.1*(e.parts.initialHeight+(e.parts.height-e.parts.initialHeight)*t);e.parts.level.position.y=.2+.1*(e.parts.initialReference+(e.parts.reference-e.parts.initialReference)*t);}
    if(['M-PS-01','M-PS-04'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M-REP-03')e.parts.subject.rotation.y=Math.PI*.48*t;
    if(['M-REP-04','M-MUL-02','M-NUM-14'].includes(e.id))e.parts.subject.position.x=-.8+.8*t;
    if(['M-TH-03','M-TH-08','M-WORK-03','CHEM79-CONCL-01','CHEM79-QUESTION-01','PHY79-QUESTION-01','PHY79-PLAN-01'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M-TH-06'){e.parts.subject.position.x=-.65+.55*t;const delta=new THREE.Vector3(e.parts.subject.position.x+.5-.1,.15-.7,0);e.parts.rope.scale.y=delta.length();e.parts.rope.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());}
    if(['PHY79-WORK-CALC','PHY79-POWER-CALC'].includes(e.id)&&e.modelBound){const d=e.parts.distance*.18*t;if(e.parts.direction==='horizontal'||e.parts.direction==='perpendicular'){e.parts.subject.position.x=-.5+d;e.parts.rope.scale.y=Math.max(.01,1-d);}else{e.parts.subject.position.y=.35+d;e.parts.rope.scale.y=Math.max(.01,.925-d);}}
    if(e.id==='M79-PRIMEFACT-01'){e.parts.left.position.x=-.8+.5*t;e.parts.right.position.x=.8-.5*t;e.parts.subject.scale.y=Math.max(.02,t);}
    if(['M79-CONE-SA','M79-THALES','M79-CYL-SA','M79-SPHERE-SA'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M79-CYL-SA')e.parts.ends.forEach(end=>{end.visible=t>=1;});
    if(e.id==='M79-SPHERE-SA')e.parts.island.visible=t>=1;
    if(e.id==='CHEM79-STATECHANGE'){const width=1+.4*t;e.parts.subject.scale.set(width,1/(width*width),width);e.parts.subject.position.y=.225+.275/(width*width);}
    if(e.id==='PHY79-SERIES'&&e.modelBound)for(const lamp of e.parts.lamps)lamp.bulb.material=t>=1&&lamp.lit?materials.gold:materials.dark;
    if(['M79-PCT-BASE','M79-POLY-MUL','M79-EXPR-SIMPLIFY','M79-PARABOLA-GRAPH','M79-POWER-PROD','M79-POWER-SIMPLIFY','M79-TRIG-CALC'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M79-TEXT-02'){e.parts.subject.position.x=-.8+.95*t;e.parts.flag.visible=t>=1;}
    if(e.id==='ENV-PHY-LIGHT-01'){e.parts.subject.scale.y=Math.max(.02,t);if(e.parts.shadow)e.parts.shadow.visible=t>=1;}
    if(e.id==='M-PS-06'){e.parts.subject.position.x=-.8+.8*t;e.parts.crank.rotation.z=Math.PI*2*t;const delta=new THREE.Vector3(e.parts.subject.position.x-.75+1.8,.22-.5,0);e.parts.cable.scale.y=delta.length();e.parts.cable.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());}
    if(e.id==='SCI-ENV-CONCL-01'){grow(e.parts.subject);e.parts.secondLeaf.scale.set(.24*Math.max(.02,t),.1*Math.max(.02,t),.12*Math.max(.02,t));}
    if(e.id==='M-MEAS-07')e.parts.instrument.position.y=.38*(1-t);
    if(e.id==='M-SYM-02')e.parts.subject.rotation.y=.16*Math.sin(Math.PI*t);
    if(e.id==='M-DATA-08')e.parts.mapMarks.visible=t>=1;
    if(['SCI-ENV-EVAL-01','CHEM79-OBS-01','PHY79-CONCL-01','PHY79-SAFE-01'].includes(e.id))grow(e.parts.subject);
    if(e.id==='PHY79-ELEC-SAFE')e.parts.subject.rotation.y=-Math.PI/2*t;
    if(e.id==='M79-PROOF-01')e.parts.basket.visible=t>=1;
    if(['M79-PROOF-01','M79-SQRT-03','M79-POWER-ZERO','M79-LOGIC-02','M79-TECH-01'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M79-PROG-02')e.parts.subject.position.x=-.8+1.4*t;
    if(e.id==='SCI-ENV-EXP-01'){e.parts.subject.position.set(.7*Math.sin(Math.PI*t),.15,.4*Math.sin(2*Math.PI*t));e.parts.wake.scale.setScalar(Math.max(.02,t));}
    if(['SCI-ENV-SAFE-01','CHEM79-DATA-01','CHEM79-SUSTAIN','PHY79-ENERGY-IMPACT'].includes(e.id))grow(e.parts.subject);
    if(e.id==='PHY79-RAD-SAFE')e.parts.subject.position.y=.55+.48*t;
    if(e.id==='M-PROG-03'&&e.modelBound){const points=e.parts.path,at=t*(points.length-1),index=Math.floor(at),next=Math.min(index+1,points.length-1);e.parts.vessel.position.lerpVectors(points[index],points[next],at-index);}
    if(e.parts.mark)e.parts.mark.visible=t>=1;
    if(['M-WORK-02','M-DATA-02','M-PROG-03','M-PROB-05'].includes(e.id))grow(e.parts.subject);
    if(e.id==='M-TH-04')e.parts.subject.children.forEach((part,i)=>{part.visible=t>=(i+1)/5;});
    if(e.id==='M-TH-05'){e.parts.subject.position.x=-1+t;e.parts.wake.scale.setScalar(Math.max(.02,t));}
    if(e.id==='M-ALG-09')e.parts.subject.rotation.x=-1.15*t;
    if(e.id==='M-DATA-12')e.parts.subject.scale.y=Math.max(.02,t);
    if(e.id==='M-NUM-16')e.parts.subject.position.x=1-1.8*t;
    if(e.id==='M-NUM-13')e.parts.subject.position.x=-1.1+1.1*t;
    if(e.id==='M-PS-02')e.parts.subject.scale.y=Math.max(.02,t);
    if(e.id==='M-FRAC-14')e.parts.subject.scale.y=Math.max(.02,t);
    if(e.id==='M-GEO-16'){e.parts.subject.position.y=-.55+1.1*t;e.parts.window.visible=t>=1;}
  }
  function resolve(id,settings={}) {
    const effectId=`world.${id}.resolved`;
    if(disposed||!Object.hasOwn(outcomeFamily,id)||settings.eventId!==effectId||effects.has(effectId)||family!==outcomeFamily[id]||(node!==null&&node!==id))return false;
    const effect=createEffect(id,false,settings.lessonModel);effects.set(effectId,effect);if(reducedMotion)effect.elapsed=effect.duration;applyEffect(effect);visibility();phase='consequence';world.invalidate();return true;
  }
  function restoreEffects(ids) {
    if(disposed||!Array.isArray(ids))return;
    const wanted=new Set(ids.filter(id=>FAMILY_IMPLEMENTED_EFFECT_IDS.includes(id)));
    for(const [id,e] of effects)if(!wanted.has(id)){if(e.group){e.group.traverse(o=>o.geometry?.dispose());e.group.removeFromParent();}effects.delete(id);}
    for(const id of wanted)if(!effects.has(id)){const e=createEffect(id.slice(6,-9),true);effects.set(id,e);applyEffect(e);}
    visibility();world.invalidate();
  }
  function advanceTime(ms){if(disposed||paused||!family||reducedMotion||world.state?.lost||globalThis.document?.hidden||!Number.isFinite(ms)||ms<=0)return;elapsed=Math.min(elapsed+ms,Math.max(2500,...[...effects.values()].filter(e=>e.family===family).map(e=>e.duration)));let changed=false;for(const e of effects.values())if(e.family===family&&e.elapsed<e.duration){e.elapsed=Math.min(e.duration,e.elapsed+ms);applyEffect(e);changed=true;}if(changed){visibility();world.invalidate();}}
  function skipToEnd(){if(disposed)return;for(const e of effects.values())if(e.family===family){e.elapsed=e.duration;applyEffect(e);}visibility();world.invalidate();}
  function setReducedMotion(value){reducedMotion=!!value;if(reducedMotion)skipToEnd();}

  function snapshot(){return {familyId:family,nodeId:node,composition:family?familyWorldPilots[family].composition:null,milieu:family?familyMilieus[family]:null,visibleObjects:family&&world.scene&&!world.state?.lost?[...familyWorldPilots[family].landmarks]:[],phase,elapsed,quality,renderer:world.scene&&!world.state?.lost?'webgl':'fallback',effects:[...effects.keys()].sort(),anchors:[...effects.values()].map(e=>({effectId:`world.${e.id}.resolved`,familyId:e.family,anchorId:anchorFor(e)?.id??null,position:anchorFor(e)?.position??null,mode:e.family===family?(e.id===node&&e.elapsed<e.duration?'active':'memory'):'hidden'})).sort((a,b)=>a.effectId.localeCompare(b.effectId)),modelBoundEffects:[...effects].filter(([,e])=>e.modelBound).map(([id])=>id).sort(),consequence:node&&effects.has(`world.${node}.resolved`)?outcomeText[node]:null,actionPhase:(()=>{const e=node?effects.get(`world.${node}.resolved`):null;if(!e||!stagedActions.has(e.id))return null;const t=e.elapsed/e.duration;return t<.2?'before':t<.8?'action':'after';})(),remaining:Math.max(0,...[...effects.values()].filter(e=>e.family===family).map(e=>e.duration-e.elapsed)),reducedMotion,paused};}
  function dispose(){if(disposed)return;clear();for(const e of effects.values())if(e.group)e.group.traverse(o=>o.geometry?.dispose());effects.clear();memory.removeFromParent();disposed=true;root.removeFromParent();for(const material of Object.values(materials))material.dispose();world.invalidate();}
  return {enter,setPhase,resolve,restoreEffects,advanceTime,skipToEnd,setReducedMotion,setPaused(value){paused=!!value;},clear,snapshot,dispose};
}
