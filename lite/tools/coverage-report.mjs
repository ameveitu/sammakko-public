// Writes COVERAGE.md from the real content registry: for every node in the 181-node
// manifest, where it lives in the game, which interaction kinds and task families
// (item tags) its generator produces in each phase, and why it is in the manifest.
// Usage: node tools/coverage-report.mjs
import fs from 'node:fs';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createServer } from 'vite';

const root = new URL('..', import.meta.url).pathname;
const vite = await createServer({ root, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' });
try {
  const g = await vite.ssrLoadModule('/src/engine/graph.ts');
  const c = await vite.ssrLoadModule('/src/content/index.ts');
  const w = await vite.ssrLoadModule('/src/content/world.ts');
  const { rng } = await vite.ssrLoadModule('/src/engine/rng.ts');
  const A = await vite.ssrLoadModule('/src/content/audit.ts');

  const SEEDS = 300;
  const phases = ['guided', 'independent', 'transfer'];
  const added = new Map(g.ADDITIONS.map((a) => [a.id, a]));
  const worldName = Object.fromEntries(w.WORLDS.map((x) => [x.id, x.name]));
  const esc = (s) => String(s).replace(/\|/g, '\\|');

  // Historical QA is not fresh browser evidence for the current source.
  const sourceCommit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
  const sourceFiles = execFileSync('git', ['ls-files', 'src/content', 'src/engine', 'tools/coverage-report.mjs'], { cwd: root, encoding: 'utf8' }).trim().split('\n').sort();
  const sourceHash = crypto.createHash('sha256');
  for (const file of sourceFiles) sourceHash.update(file + '\0').update(fs.readFileSync(new URL(file, new URL('..', import.meta.url))));
  const sourceSha256 = sourceHash.digest('hex');
  const usedIn = new Map();
  for (const x of g.COVERAGE) usedIn.set(x.target, [...(usedIn.get(x.target) ?? []), x.uses]);
  const rows = [];
  const lessonRows = [];
  const kindTotals = {};
  for (const id of g.ORDER) {
    const k = g.kc(id);
    const spec = c.NODES[id];
    const ch = w.chapterOf(id);
    const fam = {};
    const kinds = new Set();
    let hints = 0, explains = 0, n = 0, sampleExplain = '';
    for (const p of phases) {
      fam[p] = new Set();
      for (let s = 1; s <= SEEDS; s++) {
        const it = spec.item(rng(s * 7919 + p.length), p);
        fam[p].add(it.tag);
        kinds.add(it.task.kind);
        n++;
        if (p === 'guided' && it.hint) hints++;
        if (it.explain && it.explain.trim()) explains++;
        if (p === 'independent' && !sampleExplain) sampleExplain = it.explain;
      }
    }
    for (const kd of kinds) kindTotals[kd] = (kindTotals[kd] ?? 0) + 1;
    const why = k.original ? 'aiempi 107' : (added.get(id)?.type ?? 'lisätty');
    const groups = k.groups.map((gr) => ('all' in gr ? `all(${gr.all.length})` : `any(${gr.any.length})`)).join(' ') || '–';
    const verified = 'nykyinen generaattori-inventaario';
    const extra = [k.dynamic ? `dyn: ${k.dynamic}` : '', usedIn.has(id) ? `käyttää: ${usedIn.get(id).join(', ')}` : '', g.safetyOf(id).length ? `turvaohje: ${g.safetyOf(id).join(', ')}` : ''].filter(Boolean).join('; ') || '–';
    rows.push(`| \`${id}\` | ${esc(k.title)} | ${k.grade} | ${esc(worldName[ch.world])} / ${esc(ch.name)} | ${spec.icon} ${esc(spec.stop)} | ${[...kinds].join(', ')} | ${[...fam.independent].join(', ')} | ${[...fam.transfer].join(', ')} | ${groups} | ${esc(extra)} | ${spec.rev ?? c.CONTENT_REV} | ${why} | ${verified} |`);
    const prize = w.PRIZES[ch.id];
    lessonRows.push(`| \`${id}\` | ${esc(spec.goal ?? '')} | ${spec.demo(rng(1)).length} mallivaihetta (Näytä ensin)${hints ? `; ohjatussa vaiheessa valmis vihje ${Math.round((100 * hints) / SEEDS)} %:ssa` : ''} | ${Math.round((100 * explains) / n)} % (esim. "${esc(sampleExplain.slice(0, 90))}${sampleExplain.length > 90 ? '…' : ''}") | ${esc(spec.reward)} Luvun löytö: ${prize ? `${prize.icon} ${esc(prize.name)}` : '–'} |`);
  }

  const out = [];
  out.push(`# Kattavuus: ${g.ORDER.length} noodia oppitunteina`, '');
  out.push('Tämä tiedosto on generoitu: `node tools/coverage-report.mjs`. Älä muokkaa käsin.', '');
  out.push(`Lähdecommit: \`${sourceCommit}\`. Luettujen nykyisten lähdetiedostojen SHA-256: \`${sourceSha256}\`. Jos työpuu muuttui commitin jälkeen, tiiviste yksilöi mitatun puun. Tämä ajo inventoi generaattorit; se ei suorita selain- tai ihmisvalidointia.`, '');
  out.push(`- Manifesti: \`reference/mvp-scope-181.json\` (177-pohja + tarkistettu lisäys), sha256 \`${g.MANIFEST.sha256}\`, ${g.ORDER.length} noodia.`);
  out.push(`- Graafin tarkiste (src/data/graph.json): \`${g.GRAPH_SHA}\`. Sisältöversio: \`${c.CONTENT_REV}\`.`);
  out.push(`- Aiemmat 107 noodia: ${g.KCS.filter((k) => k.original).length}/107 mukana. Lisäyksiä: ${g.ADDITIONS.length}.`);
  out.push(`- Jokaiselle noodille on oma oppitunti (\`NodeSpec\`): tavoite, malliesimerkki, ohjattu, itsenäinen ja siirtovaihe, palaute ja selitys. Perheet (tag) on poimittu ajamalla generaattoria ${SEEDS} siemenellä vaihetta kohden.`);
  out.push('');
  out.push('Vuorovaikutustyypit ja niitä käyttävien noodien määrä: ' + Object.entries(kindTotals).sort((a, b) => b[1] - a[1]).map(([kd, n]) => `${kd} ${n}`).join(', ') + '.', '');
  out.push('Sarakkeet: *Ryhmät* = esitietoryhmät (`all` = kaikki vaaditaan ja voidaan päätellä, `any` = yksi riittää eikä päätellä). *Peruste* = miksi noodi on manifestissa.', '');
  out.push('## Noodit oppituntijärjestyksessä', '');
  out.push('| KC | Otsikko | Lk | Maailma / luku | Paikka | Tehtävätyypit | Itsenäiset perheet | Siirtoperheet | Ryhmät | Dynaaminen sääntö / tehtävän taitokäyttö / turvaohje | Versio | Peruste | Tarkistettu |');
  out.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  out.push(...rows, '');
  out.push('## Oppitunnin osat noodeittain', '');
  out.push('Jokaisessa oppitunnissa on lisäksi: itsenäinen tarkistus (3 peräkkäin oikein vähintään kahdesta perheestä + siirtotehtävä, tai pikatarkistus 2 oikein), uusintaharjoitus "Harjoittele lisää" (5 uutta tehtävää), "Myöhemmin" ja paluu kartalle. Väärä vastaus näyttää aina oikean päättelyn; kahden peräkkäisen virheen jälkeen tarjotaan apua, tukiretkeä tai myöhemmin-valintaa.', '');
  out.push('| KC | Tavoite (lapselle) | Apu ja esimerkki | Väärän vastauksen selitys | Seuraus maailmassa |');
  out.push('| --- | --- | --- | --- | --- |');
  out.push(...lessonRows, '');
  out.push('Rajoitukset: rivit on poimittu nykyisistä generaattoreista. Tämä ei ole kaikkien kokemusten käsin pelaamista tai pedagoginen hyväksyntä. Nykyiset erilliset ohjelmisto-, sisältö- ja ihmisarviot ovat docs/releases/launch/review-ledger.json-tiedostossa (repon juuresta). Historiallinen QA säilyy omassa lähdesidonnassaan. 181 oppituntiluonnoksen saman KC:n reitti on toteutettu; reitti ei yksin todista pedagogista yhteensopivuutta.', '');

  out.push(`## Lisäykset ja niiden perusteet (${g.ADDITIONS.length})`, '');
  out.push('Jokainen lisäys tulee manifestin pakollisten/vahvojen suhteiden sulkeumasta. Todiste = ketju aiemmasta noodista lisättyyn.', '');
  out.push('| Lisätty | Tyyppi | Peruste | Todisteketju |', '| --- | --- | --- | --- |');
  for (const a of g.ADDITIONS) out.push(`| \`${a.id}\` | ${a.type} | ${esc(a.reason)} | ${a.witness.map((x) => `\`${x}\``).join(' → ')} |`);
  out.push('');

  out.push('## Tehtävätason kattavuus (ei graafin kaaria)', '');
  out.push(`Nämä ${g.COVERAGE.length} riviä kertovat, missä tehtävä käyttää toista taitoa. Ne pidetään erillään kanonisista esitietokaarista eivätkä ne lukitse tai päättele mitään. Ne ovat osa perherekisteriä (alla), eivät koko auditointi.`, '');
  out.push('| Kohde | Käyttää | Rooli | Perhe | Esimerkki |', '| --- | --- | --- | --- | --- |');
  for (const x of g.COVERAGE) out.push(`| \`${x.target}\` | \`${x.uses}\` | ${x.role} | ${esc(x.family)} | ${esc(x.example)} |`);
  out.push('');

  // ------------------------------------------------ family registry audit
  const fam = A.audit(120);
  const unexplained = fam.filter((r) => r.unexplained.length);
  const declared = fam.filter((r) => r.reg.source[0] !== 'oletus');
  out.push('## Tehtäväperherekisteri', '');
  out.push(`Generoitu rekisteristä \`src/content/families.ts\` ja tunnistimista \`src/content/features.ts\` ajamalla jokaista perhettä 120 siemenellä vaihetta kohden. Perheitä ${fam.length}, joista ${declared.length} on erikseen ilmoitettu (muut oletuksia). **Selittämättömiä vaatimuksia: ${unexplained.length}.**`, '');
  out.push('Vaatimus = tunnistin löysi tehtävästä (teksti, kuva, vastaus) esimerkiksi negatiivisen luvun, desimaaliluvun, kertolaskun, kellonajan, piirin tai yksikkömuunnoksen. Se on selitetty, jos se kuuluu oppitunnin omaan sisältöön, löytyy sen pakollisesta/vahvasta esitietopolusta, on rekisterissä oletettuna tai samalla opetettuna taitona, annetaan tehtävässä, tai on merkitty vain esiintyväksi (ei vaadita). Tunnistimet ovat heuristisia: ne löytävät tavallisimmat muodot, eivät kaikkea.', '');
  out.push('| Perhe | Vaiheet | Tyyppi | Havaittu tulos | Rajaus | Vastausalue | Havaitut vaatimukset ja selitys | Oletetut / samalla opetetut | Apu | Lähde |');
  out.push('| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of fam) {
    const feats = r.features.map((f) => `${f}: ${r.why[f] ?? '**SELITTÄMÄTÖN**'}`).join('; ') || '–';
    const as = [...r.reg.assumed.map((x) => `\`${x}\``), ...r.reg.coTaught.map((c) => `\`${c.kc}\` (${c.where})`)].join(', ') || '–';
    out.push(`| \`${r.node}/${r.tag}\` | ${r.phases.map((p) => p[0]).join('')} | ${r.kinds.join(', ')} | ${esc(r.reg.outcome)} | ${esc(r.reg.limit ?? '–')} | ${r.answer ? `${r.answer[0]}…${r.answer[1]}` : '–'} | ${esc(feats)} | ${esc(as)}${r.reg.rule ? ` · sääntö ${r.reg.rule}` : ''} | ${r.reg.support.map((x) => `\`${x}\``).join(', ') || '–'} | ${esc(r.reg.source.join('; '))} |`);
  }
  out.push('');
  fs.writeFileSync(new URL('COVERAGE.md', new URL('..', import.meta.url)), out.join('\n'));
  console.log(`COVERAGE.md: ${rows.length} nodes, ${g.ADDITIONS.length} additions, ${g.COVERAGE.length} coverage rows, ${fam.length} families, ${unexplained.length} unexplained`);
} finally {
  await vite.close();
}
