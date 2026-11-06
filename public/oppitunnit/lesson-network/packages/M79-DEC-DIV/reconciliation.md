# Lite source-only reconciliation, not runtime mutation

Raw `alg79anim.ts:commaShiftScene` says inputs have at most two decimal places. With a=1.25,b=0.5 the transformed dividend should stay12.5, but its `Math.round(a*10**n)` produces13. The final visible equation is13 :5 =2.5. Exact original frameSHA2569db9162e6d88fcff45b148616c3f0adc70bacb151f61aa3bb5fb2c4cdbff91f9; rawsourceprobe andinput metadata retained under author's temporary evidence. Correctequivalent12.5 :5 =2.5.

This is a counterexample to the raw reusable helper's declared two-decimal input range, not a claim that current three authored demos fail; their chosen transformed dividends are integers. No oldLitebrowser or learner test run. Suggested future correction: preserve exact fractional transformed dividend ratherthan round; separately handle recurring quotient without false equality. New standalone lesson does not copy that rounding.

Lite demo's positive-less-than-one divisor claim is qualified here by positive dividend;0 :0.5 remains0. Oak HTML keyword calling quotient integer result is not adopted. Currentlesson accepts exact partial/recurring quotients. No source/generator/game changes requested or performed.
