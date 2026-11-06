import {readFile, writeFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';

/** Shared publication copy and routes. Lite imports this same JSON without Node APIs. */
export const navigation = JSON.parse(await readFile(new URL('./navigation.json', import.meta.url), 'utf8'));
const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function renderSiteHeader(activeId) {
  if (!navigation.sections.some(item => item.id === activeId)) throw new Error(`Unknown site section: ${activeId}`);
  // Sections marked nav:false (the lesson library until it is release quality) stay reachable but are not in the header.
  const links = navigation.sections.filter(item => item.nav !== false).map(item => `      <a href="${escape(item.href)}"${item.id === activeId ? ' aria-current="page"' : ''}>${escape(item.label)}</a>`).join('\n');
  return `<header class="site-header" data-site-navigation="${navigation.version}">
  <div class="header-inner wrap">
    <a class="brand-link" href="/" aria-label="Sammakko - etusivu"><img src="${escape(navigation.brand.image)}" alt="" width="40" height="40"><span>${escape(navigation.brand.name)}<small>${escape(navigation.brand.tagline)}</small></span></a>
    <button class="nav-toggle" type="button" data-menu-toggle aria-controls="site-nav" aria-expanded="false">Valikko <span aria-hidden="true">☰</span></button>
    <nav id="site-nav" class="site-nav" aria-label="Päänavigaatio">
${links}
      <a class="nav-play" data-lite-entry="start" href="${escape(navigation.lite.href)}">${escape(navigation.lite.label)}</a>
    </nav>
  </div>
</header>`;
}

/** The homepage header over the live pond: brand, the same section links, then the sound and motion chips. */
export function renderLandingHeader(activeId = 'home') {
  if (!navigation.sections.some(item => item.id === activeId)) throw new Error(`Unknown site section: ${activeId}`);
  const links = navigation.sections.filter(item => item.nav !== false).map(item => `      <a href="${escape(item.href)}"${item.id === activeId ? ' aria-current="page"' : ''}>${escape(item.label)}</a>`).join('\n');
  return `<header class="saaristo-header" data-site-navigation="${navigation.version}">
  <a class="saaristo-brand" href="/" aria-label="Sammakko - etusivu"><img src="${escape(navigation.brand.image)}" alt="" width="36" height="36"><span>${escape(navigation.brand.name)}<small>${escape(navigation.brand.tagline)}</small></span></a>
  <div class="saaristo-actions">
    <nav id="site-nav" class="saaristo-nav" aria-label="Päänavigaatio">
${links}
    </nav>
    <button class="saaristo-chip saaristo-menu" type="button" data-menu-toggle aria-controls="site-nav" aria-expanded="false"><span class="saaristo-chip-label">Valikko</span> <span aria-hidden="true">☰</span></button>
    <button class="saaristo-chip" type="button" data-saaristo-sound aria-pressed="true" title="Tuuli kaislikossa ja laineiden liplatus"><span aria-hidden="true">♪</span> <span class="saaristo-chip-label">Äänimaisema</span></button>
    <button class="saaristo-chip" type="button" data-saaristo-pause aria-pressed="false"><span aria-hidden="true">Ⅱ</span> <span class="saaristo-chip-label">Pysäytä liike</span></button>
  </div>
</header>`;
}

/** Static marketing pages keep their authored body; only marked navigation is generated. */
export const staticPages = [
  {file: '../kotisivu/index.html', active: 'home', landing: true},
  {file: '../kotisivu/tietoa/index.html', active: 'about'},
  {file: '../oppimisverkko/index.html', active: 'network'},
];

export function updateStaticNavigation(html, activeId, {landing = false} = {}) {
  const headers = [...html.matchAll(/<header\b[^>]*class="(?:site-header|saaristo-header)"[^>]*>[\s\S]*?<\/header>/g)];
  if (headers.length !== 1) throw new Error(`Expected one site header in ${activeId}, found ${headers.length}`);
  return html.replace(headers[0][0], landing ? renderLandingHeader(activeId) : renderSiteHeader(activeId)).replace(
    /(<a\b[^>]*\bdata-lite-entry="(start|workshop|topic)"[^>]*>)([\s\S]*?)(<\/a>)/g,
    (_match, opening, kind, _content, closing) => {
      const entry = kind === 'start' ? navigation.lite : kind === 'workshop' ? navigation.workshop : null;
      if (entry) opening = opening.replace(/\bhref="[^"]*"/, `href="${escape(entry.href)}"`);
      else if (!/\bhref="\/lite\/#kc\/[A-Z][A-Z0-9-]+"/.test(opening)) throw new Error('Topic action must preserve an explicit canonical KC destination');
      const arrow = /\bclass="[^"]*\bnav-play\b/.test(opening) ? '' : ' <span aria-hidden="true">→</span>';
      return `${opening}${escape(entry?.label ?? navigation.topicPracticeLabel)}${arrow}${closing}`;
    },
  );
}

export async function buildStaticNavigation({check = false} = {}) {
  for (const page of staticPages) {
    const url = new URL(page.file, import.meta.url);
    const current = await readFile(url, 'utf8');
    const generated = updateStaticNavigation(current, page.active, page);
    if (check && generated !== current) throw new Error(`Navigation is stale in ${page.file}: run node public/shared/navigation.mjs`);
    if (!check && generated !== current) await writeFile(url, generated);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildStaticNavigation({check: process.argv.includes('--check')});
  console.log(process.argv.includes('--check') ? 'Static site navigation matches the shared definition.' : 'Static site navigation generated from navigation.json.');
}
