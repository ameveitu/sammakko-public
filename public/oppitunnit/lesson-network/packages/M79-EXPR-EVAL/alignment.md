# Actual Lite alignment — M79-EXPR-EVAL

Both actual NodeSpecs are revision `audit1-2026-10-28`, valid only at that node revision. Global fallback is `lite181-2026-10-27`. `index.ts` includes RANTA2_NODES and ALGEBRA79B_NODES; PLACE-01 gets its missing goal from GOALS, EXPR-EVAL supplies its own. Neither is in the SIMS overlay. `kit.cases` uses the named ordinary families for guided/independent/retrieval and a separate transfer generator. The effective manifest→node→wildcard→tag merge is captured in inventory.json for every sampled family. Dynamic canonical rules are absent.




Frozen procedure/atomic, grade7–9, required M79-VAR-01; M-EXPR-01 strong support only. Do not promote it to another formal role or convert the lesson into solving an unknown.

Actual algebra79b.ts families:

- `linear`: choice, k2..6,b1..9,x2..9; kx+b. Distractors distinguish concatenation and addition in place of multiplication; special k=x=2 distractor is missing+b rather than an equivalent answer. Mathematical result range5..63.
- `paren`: numeric, k2..5,a1..6,b2..8; k(a+b), result6..70. Feedback covers multiplying only a, treating multiplication as addition, omitting the outer factor and concatenation.
- `neg`: numeric, k2..5,b1..9,x−5..−1; kx+b, result−24..7. Effective registry assumes INT-MUL and INT-ADD, support INT-MUL. Explain these steps or make a clearly supported extension; do not create new hard gates. `wz` drops feedback keys that equal the correct answer.
- `match`: place; k2..4,b1..4,x2..6, regenerate until kx+b,k(x+b),bx+k have different values; one noncolliding distractor. Same supplied x is substituted into all three expressions. This family is missing from COVERAGE.
- `transfer`: numeric; stipulated fare base3..6 + rate2..3 times distance4..12; result11..42. Misconceptions: factor on base+rate, addition instead of multiplication, base omitted, concatenation. It supplies the formula, so formula creation is not evidenced.

Three actual evalScene demos from alg79anim.ts:3x+2 at4→14 (contrasts34+2),2(a+5) at3→16,4x+9 at−2→1. They show the supplied value arriving at the variable, explicit multiplication and ordered simplification. The original teaching model will be manual/stepped and will connect positive groups to the expression before introducing signed symbolic extension.

Audit describes prior static/insufficient substitution and missing feedback; added these3 demos, match and corrected a distractor. COVERAGE still counts2 demos, omits match and underreports numeric ranges. Historical passes are not approval of our future lesson.


## Authored treatment

['Järjestä kolme yhtä suurta merkkiryhmää ja kaksi irtomerkkiä.', 'Kuva näyttää saman rakenteen ja annetun ryhmäkoon.', 'Kirjoita3x+2. Tee kertomerkki näkyväksi ennen laskemista.', 'Käsitteet sijoittaminen, lauseke ja arvo tulevat vasta mallin mukana. Annettu x ei ole ratkaistava tuntematon tässä tehtävässä.']

Kolme nimettyä tapausta: linear, paren ja signed. Annettu x/a ja sijoitettu lasku näkyvät. Oppilas kirjoittaa yhden nimetyn osalaskun arvon sekä koko arvon:12/14,8/16 tai−8/1. Kentät voi täyttää missä järjestyksessä vain. Tarkistus kertoo juuri virheellisen vaiheen ja syyn; oikea toinen kenttä ei peitä väärää tai tyhjää ensimmäistä. Tämä on tuettu laskuketjun täydentäminen, ei väite vapaasta symbolisen sijoituksen kirjoittamisesta. Suora lopputulos ja muut laskutavat voi lisäksi käsitellä paperilla; ketju ei ole ainoa matemaattinen menetelmä.

Required on M79-VAR-01. M-EXPR-01 on vahva tuki, ei uusi lukko. Kertolaskun ja laskujärjestyksen käytetyt vaiheet selitetään. Lite neg olettaa INT-MUL/INT-ADD; oma negatiivinen tuki nimetään eikä siitä tehdä uutta kanonista porttia. procedure/atomic/entry none säilyy. Ei equation-solving-, yleistä merkkijonolaskinta, itsenäisyys-/pysyvyys-/mastery-väitettä tai tallennusta.

The authored activity is a supported bounded task, not formal learner evidence. Full current family task/hint/explanation/registry examples and source hashes are in lesson.json. Original Lite is unedited.
