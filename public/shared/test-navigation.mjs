import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {navigation, renderSiteHeader, renderLandingHeader, staticPages, updateStaticNavigation, buildStaticNavigation} from './navigation.mjs';

const read = relative => readFile(new URL(relative, import.meta.url), 'utf8');
const headerOf = html => html.match(/<header\b[^>]*class="(?:site-header|saaristo-header)"[^>]*>[\s\S]*?<\/header>/)?.[0];
const navLinks = html => [...html.match(/<nav id="site-nav"[^>]*>([\s\S]*?)<\/nav>/)[1].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)].map(match => ({
  href: match[1].match(/\bhref="([^"]+)"/)[1],
  label: match[2],
  current: /\baria-current="page"/.test(match[1]),
}));

test('one stable set of website destinations, labels and explicit Lite entry points', () => {
  assert.deepEqual(navigation.sections.map(({label, href}) => [label, href]), [
    ['Etusivu', '/'], ['Oppitunnit', '/oppitunnit/'], ['Oppimisverkko', '/oppimisverkko/'],
    ['Whitepaper', '/whitepaper/'], ['Tietoa', '/tietoa/'],
  ]);
  assert.equal(new Set(navigation.sections.map(item => item.id)).size, navigation.sections.length);
  assert.deepEqual(navigation.lite, {label: 'Avaa Sammakko Lite', href: '/lite/'});
  assert.deepEqual(navigation.workshop, {label: 'Avaa Lentopaja', href: '/lite/#paja'});
});

test('every website section has the same ordered links and exactly one active destination', () => {
  for (const section of navigation.sections) {
    const header = renderSiteHeader(section.id);
    const links = navLinks(header);
    assert.deepEqual(links.map(({href, label}) => ({href, label})), [...navigation.sections.filter(item => item.nav !== false).map(({href, label}) => ({href, label})), navigation.lite]);
    assert.deepEqual(links.filter(item => item.current).map(item => item.href), section.nav === false ? [] : [section.href]);
    if (section.nav === false) assert.doesNotMatch(header, new RegExp(`href="${section.href}"`));
    assert.match(header, /aria-controls="site-nav" aria-expanded="false"/);
    assert.doesNotMatch(header, /target=|role="tab/);
  }
  assert.throws(() => renderSiteHeader('missing'), /Unknown site section/);
});

test('authored pages and generated whitepaper cannot drift from the shared header', async () => {
  await buildStaticNavigation({check: true});
  for (const page of staticPages) {
    const html = await read(page.file);
    assert.equal(headerOf(html), page.landing ? renderLandingHeader(page.active) : renderSiteHeader(page.active), page.file);
    assert.equal(updateStaticNavigation(html, page.active, page), html, `${page.file} generation is idempotent`);
  }
  assert.equal(headerOf(await read('../whitepaper/index.html')), renderSiteHeader('whitepaper'));
});

test('the homepage is the pond: shared section links beside the sound and motion chips, Lite entries normalized', async () => {
  const html = await read('../kotisivu/index.html');
  const header = headerOf(html);
  assert.equal(header, renderLandingHeader('home'));
  assert.deepEqual(navLinks(header).map(item => item.href), [navigation.lite.href, navigation.workshop.href, ...navigation.sections.filter(item => item.nav !== false).map(item => item.href), '/tietoa/#yhteystiedot', '#main']);
  const panel = header.match(/<nav id="site-nav"[^>]*>([\s\S]*?)<\/nav>/)[1];
  for (const attr of ['data-saaristo-sound', 'data-saaristo-pause', 'data-throw-menu-slot']) {
    assert.equal(header.split(attr).length, 2);
    assert.ok(panel.includes(attr));
  }
  assert.ok(header.indexOf('data-menu-toggle') < header.indexOf('id="site-nav"'));
  assert.match(header, /<small>Hulluttelulaboratorio<\/small>/);
  assert.doesNotMatch(html, /href="\/oppitunnit/);
  assert.doesNotMatch(html, /data-topic-panel|Mikä saa sinut uteliaaksi/);
  const actions = [...html.matchAll(/<a\b([^>]*)href="\/lite\/(?:[^"]*)"[^>]*>([\s\S]*?)<\/a>/g)];
  assert.equal(actions.length, 5);
  for (const match of actions) assert.match(match[1], /data-lite-entry="(?:start|workshop)"/);
  assert.match(html, /data-lite-entry="workshop" href="\/lite\/#paja">Avaa Lentopaja/);
  assert.doesNotMatch(await read('../kotisivu/tietoa/index.html'), /Aloita Aavan kanssa/);
});

test('generation rejects ambiguous headers and malformed topic links instead of losing a target', () => {
  assert.throws(() => updateStaticNavigation('<main>no header</main>', 'home'), /Expected one site header/);
  const header = renderSiteHeader('home');
  assert.throws(() => updateStaticNavigation(header + header, 'home'), /found 2/);
  assert.throws(() => updateStaticNavigation(header + '<a data-lite-entry="topic" href="/lite/">Topic</a>', 'home'), /canonical KC destination/);
});

test('the graph keeps its topic route and announces its existing new-tab action', async () => {
  const source = await read('../oppimisverkko/network.js');
  assert(source.includes(navigation.topicPracticeLabel));
  assert.match(source, /href="\/lite\/#kc\/\$\{encodeURIComponent\(n\.id\)\}" target="_blank" rel="noopener"/);
  assert.match(source, /\(uusi välilehti\)/);
});

test('standalone Lite source has no publication marker; shared data is bundled only as navigation input', async () => {
  assert.doesNotMatch(await read('../../lite/index.html'), /name="sammakko-publication"/);
  assert.match(await read('../../lite/src/publication.ts'), /\.\.\/\.\.\/public\/shared\/navigation\.json/);
});
