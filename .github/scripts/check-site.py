"""Check the actual delivery tree: hashes, local references and Lite bridge scope.

Uses Python's HTML parser, not a regex, for attributes and fragment targets.
External reference URLs are editorial sources; this check does not crawl them.
"""
from hashlib import sha256
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import json
import re

ROOT = Path(__file__).resolve().parents[2] / '.build' / 'site'
manifest = json.loads((ROOT / 'release.json').read_text())
ORIGIN = manifest['publication']['publicOrigin'] or 'https://sammakko.invalid'
assert manifest['schema'] == 'sammakko-site-release/1'
assert set(manifest['sections']) == {'kotisivu', 'whitepaper', 'oppitunnit', 'oppimisverkko', 'lite'}
assert (manifest['liteKcs'], manifest['lessonPages'], manifest['authoredLessonDrafts'], manifest['lessonScaffolds']) == (181, 690, 181, 509)
assert not any(p.is_symlink() for p in ROOT.rglob('*')), 'Symlink in delivery tree'
actual = {p.relative_to(ROOT).as_posix() for p in ROOT.rglob('*') if p.is_file() and p.name != 'release.json'}
assert actual == set(manifest['files']), 'Release file list differs from delivered files'
for name, expected in manifest['files'].items():
    data = (ROOT / name).read_bytes()
    assert len(data) == expected['bytes'] and sha256(data).hexdigest() == expected['sha256'], f'Hash mismatch: {name}'


class Document(HTMLParser):
    def __init__(self, content):
        super().__init__(convert_charrefs=True)
        self.ids = set()
        self.references = []
        self.h1 = 0
        self.main = 0
        self.lang = None
        self.links = []
        self.feed(content)

    def handle_starttag(self, tag, pairs):
        attrs = dict(pairs)
        if attrs.get('id'):
            self.ids.add(attrs['id'])
        if tag == 'html':
            self.lang = attrs.get('lang')
        self.h1 += tag == 'h1'
        self.main += tag == 'main'
        for key in ('href', 'src', 'poster', 'data-lesson-module'):
            if attrs.get(key):
                self.references.append((key, attrs[key]))
        if attrs.get('srcset'):
            self.references.extend(('srcset', value.strip().split()[0]) for value in attrs['srcset'].split(',') if value.strip())
        if tag == 'a':
            self.links.append(attrs)


documents = {name: Document((ROOT / name).read_text()) for name in sorted(actual) if name.endswith('.html')}
for name in ['index.html', 'tietoa/index.html', 'saaristo/index.html', 'whitepaper/index.html', 'oppimisverkko/index.html', '404.html']:
    doc = documents[name]
    assert doc.lang == 'fi' and doc.h1 == 1 and doc.main == 1, f'Page landmarks/language: {name}'

checked = 0


def check_reference(name, kind, target):
    global checked
    if not target or target.startswith(('data:', 'mailto:', 'tel:')):
        return
    url = urlsplit(urljoin(ORIGIN + '/' + name, target))
    assert url.scheme in ('http', 'https'), f'Unsupported URL scheme: {name} -> {target}'
    if url.netloc != urlsplit(ORIGIN).netloc:
        assert kind == 'href', f'External runtime asset: {name} -> {target}'
        return
    location = unquote(url.path).lstrip('/')
    if not location or location.endswith('/'):
        location += 'index.html'
    file = ROOT / location
    if file.is_dir():
        location += '/index.html'
        file = ROOT / location
    assert file.is_file(), f'Broken local reference: {name} -> {target}'
    if url.fragment and location in documents:
        # Lite owns its hash router. Other documents use normal HTML fragment IDs.
        if location != 'lite/index.html':
            fragment = unquote(url.fragment)
            assert fragment in documents[location].ids, f'Missing anchor: {name} -> {target}'
    checked += 1


for name, doc in documents.items():
    for kind, target in doc.references:
        check_reference(name, kind, target)
for name in actual:
    if name.endswith('.css'):
        for target in re.findall(r'url\(\s*[\"\']?([^\)\"\']+)[\"\']?\s*\)', (ROOT / name).read_text()):
            check_reference(name, 'css', target.strip())

graph = json.loads((ROOT / 'oppimisverkko/data/canonical-690-graph.json').read_text())
assert len(graph.get('nodes', [])) == 690, 'Learning network node count must be 690'
assert sum(len(node.get('relations', [])) for node in graph['nodes']) == 1287, 'Learning network relation count must be 1287'
assert (ROOT / 'oppimisverkko/network.js').is_file(), 'Learning network runtime missing'
for name, doc in documents.items():
    raw = (ROOT / name).read_text()
    assert 'Aava-sammakko' not in raw, f'Mascot regression: {name}'
    assert 'src="/characters/' not in raw and "src='/characters/" not in raw, f'Unpackaged character asset path: {name}'

runtime = json.loads((ROOT / 'lite/lite-runtime.json').read_text())
lite_ids = set(runtime['runtimeAvailability']['ids'])
canonical = set(json.loads((ROOT / 'lite/canonical-ids.json').read_text())['titles'])
lesson_names = {Path(name).stem for name in documents if name.startswith('oppitunnit/lessons/')}
assert len(lite_ids) == 181 and len(canonical) == 690
assert lesson_names == canonical
presentation_names = {Path(name).stem for name in documents if name.startswith('oppitunnit/presentations/')}
assert presentation_names == lite_ids and manifest['presentationPages'] == 181, 'Audience pages must match exact181'
for kc_id in presentation_names:
    name = f'oppitunnit/presentations/{kc_id}.html'
    doc = documents[name]
    assert doc.lang == 'fi' and doc.h1 == 1 and doc.main == 1, f'Audience landmarks/language: {name}'
    assert '<meta name="robots" content="noindex, follow">' in (ROOT / name).read_text(), f'Audience indexing: {name}'
assert '/oppitunnit/presentations/' not in (ROOT / 'sitemap.xml').read_text(), 'Audience duplicates in sitemap'
bridge_ids = set()
for name, doc in documents.items():
    if not name.startswith('oppitunnit/lessons/'):
        continue
    kc_id = Path(name).stem
    opens = [a for a in doc.links if a.get('data-game-action') == 'open' and a.get('href', '').startswith('/lite/')]
    if kc_id in lite_ids:
        assert len(opens) == 1, f'Lesson must have one working Lite launch: {kc_id}'
        assert opens[0]['href'] == '/lite/#kc/' + kc_id, f'Wrong Lite KC route: {kc_id}'
        assert opens[0].get('target') == '_blank' and 'noopener' in opens[0].get('rel', '').split(), f'Unsafe lesson launch: {kc_id}'
        bridge_ids.add(kc_id)
    else:
        assert not opens, f'Unsupported scaffold is linked to Lite: {kc_id}'
assert bridge_ids == lite_ids
print(json.dumps({'files': len(actual), 'htmlPages': len(documents), 'localReferences': checked, 'liteLessonLinks': len(bridge_ids), 'audiencePages': len(presentation_names), 'scaffoldsWithoutLiteLinks': len(canonical - lite_ids), 'manifestHashes': 'pass'}, ensure_ascii=False))

# Release metadata must describe the actual packaged version, including honest TBD preview mode.
from xml.etree import ElementTree
settings = manifest['publication']
assert settings['mode'] in ('preview', 'public')
assert (settings['publicOrigin'] is not None) == (settings['mode'] == 'public')
entries = ElementTree.parse(ROOT / 'sitemap.xml').getroot()
locations = [entry.text for entry in entries.iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]
assert len(locations) == (187 if settings['mode'] == 'public' else 0), 'Wrong sitemap scope'
assert len(set(locations)) == len(locations), 'Duplicate sitemap URL'
if settings['mode'] == 'public':
    assert settings['publicOrigin'] + '/saaristo/' not in locations, 'Redirect in sitemap'
for name in documents:
    raw = (ROOT / name).read_text()
    scaffold = name.startswith('oppitunnit/lessons/') and Path(name).stem not in lite_ids
    if settings['mode'] == 'preview' or scaffold or name in ('404.html', 'saaristo/index.html'):
        assert '<meta name="robots" content="noindex, follow">' in raw, f'Missing noindex: {name}'
    if settings['mode'] == 'public' and name != '404.html':
        assert '<link rel="canonical"' in raw, f'Missing canonical: {name}'
assert (ROOT / 'assets/share.png').read_bytes()[:8] == b'\x89PNG\r\n\x1a\n'
print(json.dumps({'publicationMode': settings['mode'], 'sitemapEntries': len(locations), 'metadata': 'pass'}))
