# Lite-yhteensovitus: M-NUM-18

{
  "source": "src/content/facts.ts79–138",
  "nodeRevision": "audit1-2026-10-28",
  "validRevs": [
    "audit1-2026-10-28"
  ],
  "ownGoal": true,
  "goal": "Opit, mistä kahdesta osasta luvut 1–10 voi koota.",
  "intro": "Aava piilottaa osan simpukoista kupin alle. Kuinka monta on piilossa?",
  "reward": "Tunnet lukujen osat... — not imported as verified mastery",
  "demos": [
    "tenFillScene(simpukka,7): seven filled, three empty,7+3=10.",
    "splitScene(simpukka,7,[5,4,6]): three distinct ordered decompositions of same7.",
    "cupScene(simpukka,7,4): total7 visible4, hidden3; lift cover after asking."
  ],
  "families": [
    {
      "tag": "hidden",
      "kind": "choice",
      "domain": "whole4..10,visible1..whole-1",
      "premise": "Whole/visible numbers given; cupScene(...,false) never reveals at end, but initially shows all before cover.",
      "hintExplainFeedback": "Count on from known part; distinguish total/known/missing part and one too many. Supplied initial view supports interpretation, not independent hidden-cardinality proof."
    },
    {
      "tag": "pair",
      "kind": "choice",
      "domain": "whole5..10,part1..whole-1; wrong totals n+1/n-1",
      "premise": "Choose one true pair expression; not free decomposition construction.",
      "hintExplainFeedback": "Join parts; different valid splits not offered as wrong options."
    },
    {
      "tag": "ten",
      "kind": "choice",
      "domain": "filled1..9,missing10-filled",
      "premise": "Ten-frame, count empty places.",
      "hintExplainFeedback": "Filled vs empty, one more/less. parts.alts removes numerically correct distractor collisions e.g5+5."
    },
    {
      "tag": "scale",
      "kind": "balance",
      "domain": "whole5..10,known1..whole-2",
      "premise": "left[n],right[a]; learner adds n-a equal model stones.",
      "hintExplainFeedback": "Count on; mathematical test R+added=L. Widget starts0, add/remove, locks on done, speaks count as supplied aid. Not actual physical weighing."
    },
    {
      "tag": "transfer",
      "kind": "choice",
      "domain": "whole5..9,part1..whole-1",
      "premise": "Two pockets; given whole and left pocket, answer right pocket.",
      "hintExplainFeedback": "Whole/known-part confusion and one-too-many; count on."
    }
  ],
  "media": [
    "countanim.ts tenFillScene/splitScene/cupScene fully read/extracted; parts.tenFrame, alts/pickNum read.",
    "pics.balanceBody, widgets.balance, engine.check balance read for actual constructive treatment.",
    "splitScene target-label/current-picture mismatch during transitions: labels use final splits[j] while a is still interpolating from previous split and ring colors use round(a). New model must label current actual partition or explicitly mark target and suppress settled-value claim until transition completes.",
    "New design will not equate counts of arbitrary real stones to mass without equal-weight assumption; missing-part meaning retained without physical-balance certification."
  ],
  "audit": "LESSON_AUDIT377–380: three animated demos, new scale(balance) family; COVERAGE50/238/630–633 omits scale and retains old revision. Other historical validation statements are unapproved source claims.",
  "registry": "Own goal/AUDIT_REV, no SIMS overlay. No explicit families.ts target/wildcard or graph.coverage rows; dynamic null. All4ordinaryfamilies guided/independent/retrieval, transfer separate."
}

## Toteutus

Vapaa kahden lukumäärän rakentaminen, kaikki oikean kokonaisuuden antavat parit ja niiden eri järjestykset sallitaan. Näytetään oppijan nykyinen osapari sekä sen todellinen summa erillään tavoitemäärästä. Puuttuvan osan tehtävissä koko ja tunnettu osa näkyvät aina. Erillinen vaiheittainen siirtomalli säilyttää kaikki merkit ja määrän; paljastus/siirtäminen ei täytä vastausta eikä ole vaatimus.

## Vertailu ja rajat

hidden/pair/ten ja kahden taskun transfer merkityksinä säilyvät; oma vapaa rakentaminen ei ole yhden valmiin expressionvaihtoehdon tunnistamista. scale(balance) on inventoitu mutta sitä ei väitetä toistetuksi fyysiseksi punnitustehtäväksi: sama puuttuvan osan merkitys opetetaan lukumäärillä ilman mielivaltaisten kivien saman massan oletusta.

Tuettu rajattu rakentaminen ja mallin tulkinta ei todista kaikkien hajotelmien muistamista, tiettyä itsenäistä päättelystrategiaa, fyysistä jakamista/punnitsemista tai pysyvyyttä. Ei henkilökohtaista formaalia hallintaa, tutkimusprosessin rubriikkia tai uutta legacy-pelihaaraa.

## Korjattu tai rajattu

Liten splitScene näyttää siirtymän tavoitearvoja ennen kuin interpoloitu jakokohta ja rengasluokat vastaavat niitä. Oma siirtomalli vaihtaa yhden merkin luokkaa yhtenä diskreettinä askeleena; kuva ja lukumäärät vaihtuvat yhdessä. Samanarvoisia pareja ei hylätä, eikä tavoite1 jää pois kahden positiivisen osan rajoituksen vuoksi. Ei täyden hajotelmamuistin reward-väitettä.

Varsinainen Lite, graafi, AND/OR-ryhmät, required/strong-suhteet, legacy-peli ja jaettu tila jäävät muuttumattomiksi. Tarkka NodeSpec, perheiden vihjeet/selitykset, demo/siirtogeneraattori ja immutable-lähdetiivisteet ovat tämän paketin lesson.json alignment-tietueessa; alkuperäiset authority/production-181-v2/lite-polussa. Audit/COVERAGE ovat aiempia väitteitä, eivät tämän sisällön hyväksyntää. Täsmällinen nykyinen katselmointi on erillinen.
