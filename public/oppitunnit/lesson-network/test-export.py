"""Portable exporter regressions. Run: python3 -B lesson-network/test-export.py

Only isolated temporary Git repositories/ZIPs are written; the project is read-only.
"""
import ast
import hashlib
import importlib.util
import io
import json
import os
from pathlib import Path
import shutil
import subprocess
import sys
import tarfile
import tempfile
import unittest
from unittest import mock
import zipfile

CANDIDATE = Path(__file__).resolve().with_name('export.py')
ARTIFACTS = Path(tempfile.mkdtemp(prefix='sammakko-export-head-fixtures-'))
os.environ['PYTHONDONTWRITEBYTECODE'] = '1'
sys.dont_write_bytecode = True
ENV = dict(os.environ, GIT_CONFIG_NOSYSTEM='1', GIT_CONFIG_GLOBAL=os.devnull)
SPEC = importlib.util.spec_from_file_location('candidate_export', str(CANDIDATE))
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)


class ExportTests(unittest.TestCase):
    def fixture(self, name):
        root = ARTIFACTS / name
        root.mkdir()
        files = {
            'lesson-network/export.py': CANDIDATE.read_bytes(),
            'lesson-network/test-export.py': Path(__file__).read_bytes(),
            'lesson-network/packages/SEALED/lesson.json': b'{"state":"committed"}\n',
            'lesson-network/site/lessons/SEALED.html': b'committed compiled site\n',
            'lesson-network/evidence/production/B08/current.png': b'current evidence\n',
            'lesson-network/evidence/production/B08/history/old.png': b'historical evidence\n',
            'lesson-network/evidence/production/B07/old.png': b'older evidence\n',
            'lesson-network/evidence/production/B07/receipt.json': b'{"keep":"text"}\n',
            'lesson-network/ignore.tmp': b'old policy excludes tmp\n',
            'canonical/input.txt': b'canonical committed\n',
            'content-design/input.txt': b'content committed\n',
            'baseline/input.txt': b'baseline committed\n',
            'package.json': b'{"name":"fixture"}\n',
            'package-lock.json': b'{}\n',
            'CONTENT_STATUS.yaml': b'committed: true\n',
            'AUTONOMOUS_52_STATE.json': b'{}\n',
            'outside-selection.txt': b'not export scope\n',
        }
        for name, data in files.items():
            target = root / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        self.git(root, 'init', '-q')
        self.git(root, 'add', '.')
        self.git(root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
                 '-c', 'core.hooksPath=' + os.devnull, '-c', 'commit.gpgsign=false', 'commit', '-qm', 'fixture')
        return root, files

    def git(self, root, *args):
        return subprocess.check_output(['git', *args], cwd=str(root), env=ENV, stderr=subprocess.PIPE)

    def export(self, root, checkpoint, success=True):
        result = subprocess.run([sys.executable, '-B', str(root / 'lesson-network/export.py'), checkpoint],
                                cwd=str(root), env=ENV, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        (root / ('run-' + checkpoint + '.json')).write_text(json.dumps(
            {'returncode': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr}, indent=2))
        self.assertEqual(result.returncode == 0, success, result.stderr)
        return result

    def inspect(self, root, checkpoint):
        destination = root / 'exports' / ('Sammakko_181_' + checkpoint + '.zip')
        with zipfile.ZipFile(destination) as archive:
            self.assertIsNone(archive.testzip())
            manifest = json.loads(archive.read('EXPORT_MANIFEST.json'))
            self.assertEqual(len(manifest['files']), len(set(f['path'] for f in manifest['files'])))
            for item in manifest['files']:
                data = archive.read(item['path'])
                self.assertEqual(len(data), item['bytes'])
                self.assertEqual(hashlib.sha256(data).hexdigest(), item['sha256'])
            contents = {name: archive.read(name) for name in archive.namelist()}
        expected = hashlib.sha256(destination.read_bytes()).hexdigest()
        self.assertEqual(destination.with_suffix('.zip.sha256').read_text().split()[0], expected)
        return manifest, contents

    def test_dirty_staged_and_untracked_absent_committed_hashes_intact(self):
        root, files = self.fixture('dirty')
        revision = self.git(root, 'rev-parse', 'HEAD').decode().strip()
        dirty = root / 'lesson-network/packages/SEALED/lesson.json'
        dirty.write_text('dirty staged B09 bytes\n')
        self.git(root, 'add', str(dirty.relative_to(root)))
        dirty.write_text('even newer unstaged bytes\n')
        untracked = root / 'lesson-network/packages/PHY79-GRAPH-01/body.html'
        untracked.parent.mkdir(parents=True)
        untracked.write_text('partial untracked B09\n')
        (root / 'package.json').write_text('dirty package metadata\n')
        (root / 'lesson-network/site/lessons/SEALED.html').write_text('dirty rebuilt site\n')
        script = root / 'lesson-network/export.py'
        script.write_bytes(script.read_bytes() + b'\n# live dirty exporter comment\n')
        self.export(root, 'B08_TEST')
        manifest, contents = self.inspect(root, 'B08_TEST')
        self.assertEqual(manifest['sourceRevision'], revision)
        self.assertEqual(manifest['provenance'], 'project_git_head')
        self.assertEqual(manifest['sourceSnapshot'], 'committed_git_tree')
        self.assertNotIn('lesson-network/packages/PHY79-GRAPH-01/body.html', contents)
        self.assertNotIn('outside-selection.txt', contents)
        self.assertNotIn('lesson-network/ignore.tmp', contents)
        for name in ['lesson-network/packages/SEALED/lesson.json', 'package.json',
                     'lesson-network/site/lessons/SEALED.html', 'lesson-network/export.py', 'canonical/input.txt']:
            self.assertEqual(contents[name], files[name])
        self.assertIn('lesson-network/evidence/production/B08/current.png', contents)
        self.assertNotIn('lesson-network/evidence/production/B08/history/old.png', contents)
        self.assertNotIn('lesson-network/evidence/production/B07/old.png', contents)
        self.assertIn('lesson-network/evidence/production/B07/receipt.json', contents)
        self.assertEqual(manifest['excludedHistoricalBinaryFiles'], 2)
        self.assertEqual(dirty.read_text(), 'even newer unstaged bytes\n')
        self.assertTrue(untracked.is_file())
        before = (root / 'exports/Sammakko_181_B08_TEST.zip').read_bytes()
        self.export(root, 'B08_TEST', success=False)
        self.assertEqual((root / 'exports/Sammakko_181_B08_TEST.zip').read_bytes(), before)

    def test_extracted_manifest_fallback_is_explicit_and_no_false_enclosing_head(self):
        root, _ = self.fixture('fallback-source')
        self.export(root, 'B08_FALLBACK_SOURCE')
        manifest, _ = self.inspect(root, 'B08_FALLBACK_SOURCE')
        extracted = ARTIFACTS / 'extracted'
        with zipfile.ZipFile(root / 'exports/Sammakko_181_B08_FALLBACK_SOURCE.zip') as archive:
            archive.extractall(extracted)
        with tempfile.TemporaryDirectory(dir=str(ARTIFACTS)) as temporary:
            with mock.patch.object(MODULE.subprocess, 'check_output', side_effect=FileNotFoundError('git')):
                source, revision, provenance, kind = MODULE.source_snapshot(extracted, Path(temporary))
            self.assertEqual(source, extracted)
            self.assertEqual(revision, manifest['sourceRevision'])
            self.assertEqual(provenance, 'original_export_revision_not_current_git')
            self.assertEqual(kind, 'extracted_manifest_fallback_working_files')
        self.export(extracted, 'B08_REEXPORT')
        m, _ = self.inspect(extracted, 'B08_REEXPORT')
        self.assertEqual(m['sourceRevision'], manifest['sourceRevision'])
        self.assertEqual(m['provenance'], 'original_export_revision_not_current_git')
        self.assertEqual(m['sourceSnapshot'], 'extracted_manifest_fallback_working_files')
        enclosing = ARTIFACTS / 'enclosing'
        enclosing.mkdir()
        self.git(enclosing, 'init', '-q')
        nested = enclosing / 'nested'
        shutil.copytree(extracted, nested)
        self.export(nested, 'B08_NESTED')
        m, _ = self.inspect(nested, 'B08_NESTED')
        self.assertEqual(m['sourceRevision'], manifest['sourceRevision'])
        self.assertEqual(m['provenance'], 'original_export_revision_not_current_git')
        (nested / 'EXPORT_MANIFEST.json').unlink()
        self.export(nested, 'B08_NO_PROVENANCE', success=False)
        self.assertFalse((nested / 'exports/Sammakko_181_B08_NO_PROVENANCE.zip').exists())

    def test_committed_monorepo_subtree_uses_current_head_and_excludes_siblings(self):
        original, files = self.fixture('monorepo-source')
        enclosing = ARTIFACTS / 'monorepo'
        nested = enclosing / 'public/oppitunnit'
        shutil.copytree(original, nested, ignore=shutil.ignore_patterns('.git'))
        (enclosing / 'lite').mkdir()
        (enclosing / 'lite/private-sibling.txt').write_text('not lesson export')
        (nested / 'EXPORT_MANIFEST.json').write_text('{"sourceRevision":"old_export_not_current"}')
        self.git(enclosing, 'init', '-q')
        self.git(enclosing, 'add', '.')
        self.git(enclosing, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
                 '-c', 'core.hooksPath=' + os.devnull, '-c', 'commit.gpgsign=false', 'commit', '-qm', 'monorepo')
        revision = self.git(enclosing, 'rev-parse', 'HEAD').decode().strip()
        target = nested / 'lesson-network/packages/SEALED/lesson.json'
        target.write_text('dirty staged subtree content')
        self.git(enclosing, 'add', 'public/oppitunnit/lesson-network/packages/SEALED/lesson.json')
        target.write_text('newer unstaged subtree content')
        (nested / 'canonical/untracked.txt').write_text('not committed')
        self.export(nested, 'B08_MONOREPO')
        manifest, contents = self.inspect(nested, 'B08_MONOREPO')
        self.assertEqual(manifest['sourceRevision'], revision)
        self.assertEqual(manifest['provenance'], 'project_git_head')
        self.assertEqual(manifest['sourceSnapshot'], 'committed_git_subtree:public/oppitunnit')
        self.assertEqual(contents['lesson-network/packages/SEALED/lesson.json'],
                         files['lesson-network/packages/SEALED/lesson.json'])
        self.assertEqual(contents['canonical/input.txt'], files['canonical/input.txt'])
        self.assertNotIn('canonical/untracked.txt', contents)
        self.assertFalse(any(n.startswith(('lite/', 'public/')) for n in contents))
        self.assertEqual(target.read_text(), 'newer unstaged subtree content')

    def test_archive_attributes_cannot_silently_omit_or_substitute_committed_bytes(self):
        root, _ = self.fixture('attributes')
        info = root / '.git/info/attributes'
        info.write_text('lesson-network/packages/SEALED/lesson.json export-ignore\n')
        self.export(root, 'B08_OMITTED', success=False)
        self.assertFalse((root / 'exports/Sammakko_181_B08_OMITTED.zip').exists())
        info.write_text('canonical/input.txt export-subst\n')
        (root / 'canonical/input.txt').write_text('$Format:%H$\n')
        self.git(root, 'add', 'canonical/input.txt')
        self.git(root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
                 '-c', 'core.hooksPath=' + os.devnull, '-c', 'commit.gpgsign=false', 'commit', '-qm', 'literal blob')
        self.export(root, 'B08_SUBSTITUTED', success=False)
        self.assertFalse((root / 'exports/Sammakko_181_B08_SUBSTITUTED.zip').exists())

    def test_committed_symlink_rejected_before_export(self):
        root, _ = self.fixture('symlink')
        (root / 'canonical/link').symlink_to('../outside-selection.txt')
        self.git(root, 'add', 'canonical/link')
        self.git(root, '-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid',
                 '-c', 'core.hooksPath=' + os.devnull, '-c', 'commit.gpgsign=false', 'commit', '-qm', 'link')
        self.export(root, 'B08_SYMLINK', success=False)
        self.assertFalse((root / 'exports/Sammakko_181_B08_SYMLINK.zip').exists())

    def test_tar_safety_python39_manual_extraction(self):
        data = b'committed\n'
        oid = hashlib.sha1(b'blob ' + str(len(data)).encode() + b'\0' + data).hexdigest()
        for index, (name, kind, link) in enumerate([
                ('../escape', tarfile.REGTYPE, ''), ('/escape', tarfile.REGTYPE, ''),
                ('lesson-network/../../escape', tarfile.REGTYPE, ''),
                ('lesson-network\\escape', tarfile.REGTYPE, ''),
                ('lesson-network/file', tarfile.SYMTYPE, '/etc/passwd'),
                ('lesson-network/file', tarfile.LNKTYPE, '../escape'),
                ('lesson-network/file', tarfile.FIFOTYPE, ''),
                ('unexpected/file', tarfile.REGTYPE, '')]):
            tarpath = ARTIFACTS / ('unsafe-' + str(index) + '.tar')
            with tarfile.open(tarpath, 'w') as archive:
                member = tarfile.TarInfo(name)
                member.type, member.linkname = kind, link
                member.size = len(data) if kind == tarfile.REGTYPE else 0
                archive.addfile(member, io.BytesIO(data) if member.size else None)
            with self.assertRaises((ValueError, OSError)):
                MODULE.unpack_snapshot(tarpath, ARTIFACTS / ('unsafe-out-' + str(index)), {'lesson-network/file': oid})
        tarpath = ARTIFACTS / 'duplicate.tar'
        with tarfile.open(tarpath, 'w') as archive:
            for _ in range(2):
                member = tarfile.TarInfo('lesson-network/file')
                member.size = len(data)
                archive.addfile(member, io.BytesIO(data))
        with self.assertRaises(ValueError):
            MODULE.unpack_snapshot(tarpath, ARTIFACTS / 'duplicate-out', {'lesson-network/file': oid})
        with self.assertRaises(ValueError):
            MODULE.unpack_snapshot(tarpath, ARTIFACTS / 'blob-mismatch-out', {'lesson-network/file': '0' * 40})
        ast.parse(CANDIDATE.read_text(), feature_version=(3, 9))


if __name__ == '__main__':
    suite = unittest.defaultTestLoader.loadTestsFromTestCase(ExportTests)
    result = unittest.TextTestRunner(verbosity=2).run(suite)
    report = {'status': 'PASS' if result.wasSuccessful() else 'FAIL',
              'python': sys.version, 'testsRun': result.testsRun, 'failures': len(result.failures),
              'errors': len(result.errors), 'source': 'lesson-network/export.py',
              'regressionSource': 'lesson-network/test-export.py',
              'regressionSHA256': hashlib.sha256(Path(__file__).read_bytes()).hexdigest(),
              'sourceSHA256': hashlib.sha256(CANDIDATE.read_bytes()).hexdigest(),
              'fixtureArtifacts': str(ARTIFACTS),
              'scope': 'Regression writes isolated temporary Git fixtures/ZIPs only; no project commit/export, source modification or acceptance.'}
    (ARTIFACTS / 'test-report.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))
    sys.exit(0 if result.wasSuccessful() else 1)
