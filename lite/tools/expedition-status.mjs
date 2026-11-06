#!/usr/bin/env node
/** Inventory executable registrations; never count a treatment as implemented content. */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const docs = new URL('../../docs/lite-690/', import.meta.url);
const registry = JSON.parse(await readFile(new URL('source/data/sammakko_690_story.json', docs), 'utf8'));
const canonicalBytes = await readFile(new URL('../reference/canonical-690-graph.json', import.meta.url));
const canonicalHash = createHash('sha256').update(canonicalBytes).digest('hex');
if (canonicalHash !== '17eca8c1675ffe14aa3d6836e1ce7109020f440b22df09b7a7b15a8e95bb39fb') throw new Error('Canonical source changed; review the semantic diff first');
const check = process.argv.includes('--check');
const server = await createServer({ configFile: false, root, appType: 'custom', server: { middlewareMode: true, hmr: false, ws: false, watch: null } });
try {
  const { NODES, CONTENT_REV } = await server.ssrLoadModule('/src/content/index.ts');
  const { EXPEDITION_ADDITIONS, EXPEDITION_NODES, EXPEDITION_EVIDENCE } = await server.ssrLoadModule('/src/content/expedition.ts');
  const canonicalIds = new Set(registry.nodes.map(node => node.id));
  const addedIds = EXPEDITION_ADDITIONS.map(spec => spec.id);
  if (new Set(addedIds).size !== addedIds.length) throw new Error('Duplicate expedition implementation IDs');
  for (const id of addedIds) {
    if (!canonicalIds.has(id) || NODES[id]) throw new Error(`Unreviewed canonical/181 replacement: ${id}`);
    const spec = EXPEDITION_NODES[id];
    if (!spec.rev || !spec.validRevs?.includes(spec.rev) || !spec.demo || !spec.item) throw new Error(`Incomplete executable registration: ${id}`);
  }
  const rows = registry.nodes.map(node => {
    const spec = EXPEDITION_NODES[node.id];
    return {
      id: node.id, family: node.family_id, title: node.canonical.title,
      status: NODES[node.id] ? 'preserved_181' : spec ? 'implementation_candidate' : 'planned',
      ...(spec ? { route: `#saaristo/${node.id}`, revision: spec.rev ?? CONTENT_REV } : {}),
      ...(EXPEDITION_EVIDENCE[node.id] ? { evidence: EXPEDITION_EVIDENCE[node.id] } : {}),
      requiredLeaf: node.is_required_leaf,
      // A generic persistent marker is implemented; authored leaf cinematics are a separate gate.
      authoredClimaxReviewed: false,
    };
  });
  const available = Object.keys(EXPEDITION_NODES).length;
  const inventory = {
    schema: 'sammakko-expedition-inventory-1', canonicalSha256: canonicalHash,
    counts: { canonical: rows.length, preserved: Object.keys(NODES).length, additions: addedIds.length, available, planned: rows.length - available },
    status: 'Development route; executable availability is not publication or pedagogical approval.',
    nodes: rows,
  };
  const table = registry.families.map(family => {
    const inFamily = rows.filter(node => node.family === family.id);
    const count = status => inFamily.filter(node => node.status === status).length;
    return `| ${family.id} · ${family.title} | ${count('preserved_181')} | ${count('implementation_candidate')} | ${count('planned')} |`;
  });
  const queue = `# Sisältötuotannon työjono\n\nTämä taulukko tuotetaan ajettavien NodeSpec-rekisteröintien perusteella komennolla \`npm run expedition:status\`. JSON-kohtauskorttia ei lasketa tehtäväksi.\n\nSaatavilla kehitysreitillä: **${available}/690**, joista ${Object.keys(NODES).length} on säilytettyjä tehtäviä ja ${addedIds.length} uusia toteutusehdokkaita. **${rows.length - available} uutta tehtävää on vielä toteuttamatta.**\n\n| Perhe | Säilytetty | Uusi toteutusehdokas | Toteuttamatta |\n|---|---:|---:|---:|\n${table.join('\n')}\n\n## Seuraavan erän sopimus\n\n- Lue perheen täydet kanoniset solmut ja tarinakortit. Käytä työmääräimen mallia \`source/prompts/SOL_TASK_TEMPLATE.md\`; työmääräimet ovat \`work-orders/\`-hakemistossa.\n- Omista yksi rajattu sisältömoduuli, täsmällinen malli, esitys ja sen testit. Sovi jaetun moottorin tai käyttöliittymän muutos integraattorin kanssa.\n- Toteuta vähintään kaksi käsitteellisesti erilaista tehtäväperhettä, siirtotehtävä, avun kirjaus, oma sisältöversio ja kanonista tavoitetta vastaava näyttöraja.\n- Tarkista oma generointi riippumattomalla matemaattisella tai tieteellisellä tapauksella. Testaa väärä malli ja toipuminen selaimessa; näytä annetut tiedot ja ohjaimet samassa näkymässä.\n- Rekisteröi vasta toimiva sisältö. Aja erän testit, yhteinen regressio ja tämä inventaario.\n\n## Erilliset avoimet tuotantoportit\n\n- Kaikki 690 tehtävää, 268 yksilöllisesti katselmoitua paikallista huipennusta sekä 62 perheen taiteellinen viimeistely. Pysyvä rantamerkki ja onnistumisteksti eivät yksin täytä huipennusporttia.\n- Dynaamisten valmiussääntöjen tehtäväkohtainen toteutus ja 66 integraatiotavoitteen kattavuus. Luettelo säilyttää lähdetiedon; tämä ei todista kaikkien sääntöjen pelillistä toteutusta.\n- Omaa selitystä, koetta tai turvallista fyysistä työskentelyä vaativien taitojen tuotanto- ja aikuishavaintopolut. Valmiin vastauksen valinta ei riitä.\n- Elokuvan hyväksytyt hahmoskulptuurit, riggaus ja otostuotanto. Nykyinen loppunäytelmä on animatic. Käyttäjä hyväksyi Sisin vihreän unisen sisiliskokonseptin 2026-11-05; sen 3D-kandidaatti ja neljä animaatiota ovat katsottavissa hahmopajassa. Lopullista taidehyväksyntää ei väitetä.\n- Lapsi-/opettajakokeet, laitekohtainen suorituskykymittaus sekä Opus-katselmus. Automaattikokeet eivät korvaa näitä.\n`;
  for (const [file, text] of [['STATUS.json', JSON.stringify(inventory, null, 2) + '\n'], ['TODO.md', queue]]) {
    const path = new URL(file, docs);
    if (check) {
      if (await readFile(path, 'utf8') !== text) throw new Error(`${file} is stale; run npm run expedition:status`);
    } else await writeFile(path, text);
  }
  console.log(JSON.stringify(inventory.counts));
} finally {
  await server.close();
}
