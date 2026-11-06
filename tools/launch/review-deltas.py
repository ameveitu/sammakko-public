"""Capture a bounded lesson-source delta for review; never grant approval."""
import difflib
import hashlib
import json
import pathlib
import subprocess
import sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parents[2]
BASE = 'c056b8e05a9e88f7719b0946f6475999811f813c'


class Text(HTMLParser):
    def __init__(self):
        super().__init__()
        self.words = []

    def handle_data(self, data):
        self.words.extend(data.split())


def words(source):
    parser = Text()
    parser.feed(source)
    return parser.words


batch = sys.argv[1]
if batch not in [f'LR04-B{i:02}' for i in range(1, 12)]:
    raise SystemExit('Choose a declared LR04-B01 through B11 partition')
manifest = (ROOT / 'docs/releases/launch/lessons/LR04-B01/plan.json' if batch == 'LR04-B01'
            else ROOT / 'docs/releases/launch/lessons/LR04-partitions' / f'{batch}.json')
rows = []
for kc in json.loads(manifest.read_text())['ids']:
    directory = pathlib.Path('public/oppitunnit/lesson-network/packages') / kc
    body = directory / 'body.html'
    old = words(subprocess.check_output(['git', 'show', f'{BASE}:{body}'], cwd=ROOT, text=True))
    new = words((ROOT / body).read_text())
    delta = [{'before': ' '.join(old[a:b]), 'after': ' '.join(new[c:d])}
             for op, a, b, c, d in difflib.SequenceMatcher(None, old, new, autojunk=False).get_opcodes()
             if op != 'equal']
    sources = {str(p.relative_to(ROOT)): hashlib.sha256(p.read_bytes()).hexdigest()
               for p in sorted((ROOT / directory).iterdir()) if p.is_file()}
    changed = subprocess.check_output(['git', 'diff', '--name-only', BASE, '--', str(directory)], cwd=ROOT, text=True).splitlines()
    rows.append({'kc': kc, 'sourceSha256': sources, 'plainTextDelta': delta,
                 'changedFiles': changed, 'decision': 'requires_explicit_reviewer_decision'})
output = ROOT / 'docs/releases/launch/lessons' / batch / 'root-delta-capture.json'
serialized = json.dumps({'baseCommit': BASE, 'batch': batch,
                             'meaning': 'Mechanical source comparison, not approval or human validation.',
                             'nodes': rows}, ensure_ascii=False, indent=2) + '\n'
if output.exists() and output.read_text() != serialized:
    previous = output.read_bytes()
    archive = output.with_name('root-delta-capture.' + hashlib.sha256(previous).hexdigest()[:12] + '.json')
    if not archive.exists():
        archive.write_bytes(previous)
output.write_text(serialized)
print(json.dumps({'batch': batch, 'nodes': len(rows), 'capture': str(output)}))
