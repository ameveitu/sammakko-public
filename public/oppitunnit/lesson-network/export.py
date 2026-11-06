"""Export this runnable subsystem from selected committed HEAD paths when Git is available."""
from pathlib import Path, PurePosixPath
import hashlib
import json
import subprocess
import zipfile
import sys
import re
import tarfile
import tempfile

SELECTION = ('lesson-network', 'canonical', 'content-design', 'baseline',
             'package.json', 'package-lock.json', 'CONTENT_STATUS.yaml', 'AUTONOMOUS_52_STATE.json')


def unpack_snapshot(archive_path, destination, expected):
    """Extract only expected regular files/directories; works without Python 3.12 tar filters."""
    directories = {str(parent) for name in expected for parent in PurePosixPath(name).parents
                   if str(parent) != '.'}
    seen, files = set(), set()
    destination.mkdir()
    with tarfile.open(archive_path, 'r:') as archive:
        for member in archive:
            name = member.name.rstrip('/')
            if ('\\' in name or '\x00' in name or
                    any(part in ('', '.', '..') for part in name.split('/')) or
                    PurePosixPath(name).is_absolute() or name in seen):
                raise ValueError('Unsafe/duplicate Git archive path: ' + repr(member.name))
            seen.add(name)
            target = destination.joinpath(*name.split('/'))
            if member.isdir() and name in directories:
                target.mkdir(parents=True, exist_ok=True)
            elif member.isfile() and name in expected:
                target.parent.mkdir(parents=True, exist_ok=True)
                oid = expected[name]
                algorithm = {40: 'sha1', 64: 'sha256'}.get(len(oid))
                if algorithm is None:
                    raise ValueError('Unsupported Git object format')
                digest = hashlib.new(algorithm)
                digest.update(('blob ' + str(member.size) + '\0').encode('ascii'))
                with archive.extractfile(member) as source, target.open('xb') as output:
                    while True:
                        chunk = source.read(1024 * 1024)
                        if not chunk:
                            break
                        output.write(chunk)
                        digest.update(chunk)
                if digest.hexdigest() != oid:
                    raise ValueError('Git archive differs from committed blob: ' + name)
                files.add(name)
            else:
                raise ValueError('Unsupported/unexpected Git archive entry: ' + repr(member.name))
    if files != set(expected):
        raise ValueError('Git archive omitted committed selected files')


def source_snapshot(project_root, temporary):
    try:
        git_root = Path(subprocess.check_output(
            ['git', 'rev-parse', '--show-toplevel'], cwd=project_root, text=True,
            stderr=subprocess.DEVNULL).strip()).resolve()
        relative_root = project_root.resolve().relative_to(git_root)
        revision = subprocess.check_output(
            ['git', 'rev-parse', '--verify', 'HEAD^{commit}'], cwd=project_root,
            text=True, stderr=subprocess.DEVNULL).strip()
        subtree = relative_root.as_posix()
        treeish = revision if subtree == '.' else revision + ':' + subtree
        # An untracked extracted folder must not inherit an unrelated enclosing HEAD.
        if subtree != '.':
            kind = subprocess.check_output(['git', 'cat-file', '-t', treeish],
                                           cwd=git_root, text=True, stderr=subprocess.DEVNULL).strip()
            if kind != 'tree':
                raise ValueError('Project subdirectory is not a committed tree')
    except (subprocess.CalledProcessError, FileNotFoundError, ValueError):
        original = project_root / 'EXPORT_MANIFEST.json'
        if not original.is_file():
            raise SystemExit('No project Git root or original EXPORT_MANIFEST.json; cannot invent source provenance')
        revision = json.loads(original.read_text())['sourceRevision']
        if not isinstance(revision, str) or not revision.strip():
            raise SystemExit('Original EXPORT_MANIFEST.json has no source revision')
        return project_root, revision, 'original_export_revision_not_current_git', 'extracted_manifest_fallback_working_files'
    # Pin one commit before enumerating or archiving. Never fall back after a snapshot failure.
    tree = subprocess.check_output(
        ['git', 'ls-tree', '-r', '-z', '--full-tree', treeish, '--', *SELECTION], cwd=git_root)
    expected = {}
    for entry in tree.split(b'\0'):
        if not entry:
            continue
        info, name = entry.split(b'\t', 1)
        mode, kind, oid = info.decode('ascii').split()
        if mode not in ('100644', '100755') or kind != 'blob':
            raise ValueError('Selected Git tree contains unsupported link/submodule: ' + repr(name))
        expected[name.decode('utf-8')] = oid
    if not expected:
        raise ValueError('Committed selected source tree is empty')
    existing = sorted({PurePosixPath(name).parts[0] for name in expected})
    archive_path = temporary / 'head.tar'
    with archive_path.open('xb') as output:
        subprocess.run(['git', 'archive', '--format=tar', treeish, '--', *existing],
                       cwd=git_root, stdout=output, check=True)
    snapshot = temporary / 'source'
    unpack_snapshot(archive_path, snapshot, expected)
    snapshot_kind = 'committed_git_tree' if subtree == '.' else 'committed_git_subtree:' + subtree
    return snapshot, revision, 'project_git_head', snapshot_kind


def export_tree(root, destination, checkpoint, revision, provenance, snapshot_kind):
    # Existing export selection/compression/history policy, applied to the snapshot.
    paths = []
    for directory in SELECTION[:4]:
        paths.extend(p for p in (root / directory).rglob('*') if p.is_file() and
                     not any(x in p.parts for x in ('__pycache__',)) and not p.name.endswith('.tmp'))
    paths.extend(root / name for name in SELECTION[4:])
    paths = sorted(set(paths))
    current_batch = re.match(r'(B[0-9]+)(?:_|$)', checkpoint)
    historical, selected = [], []
    for p in paths:
        relative = p.relative_to(root).as_posix()
        old_binary = (current_batch is not None and relative.startswith('lesson-network/evidence/')
                      and p.suffix.lower() in ('.png', '.jpg', '.jpeg', '.webm', '.mp4', '.zip', '.trace')
                      and (not relative.startswith('lesson-network/evidence/production/' + current_batch.group(1) + '/')
                           or relative.startswith('lesson-network/evidence/production/' + current_batch.group(1) + '/history/')))
        if old_binary:
            data = p.read_bytes()
            historical.append({'path': relative, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest(),
                               'disposition': 'preserved in authoritative repository; omitted historical binary observation, not runtime/test input'})
        else:
            selected.append(p)
    paths = selected
    manifest = {'sourceRevision': revision, 'provenance': provenance, 'sourceSnapshot': snapshot_kind,
                'snapshotSelection': list(SELECTION),
                'scope': 'Runnable lesson-network subsystem, source inputs and current evidence; historical binary observations explicitly indexed separately; not all Git-tracked files',
                'excludedHistoricalBinaryFiles': len(historical),
                'excludedHistoricalBinaryBytes': sum(x['bytes'] for x in historical), 'files': []}
    with zipfile.ZipFile(destination, 'x', compression=zipfile.ZIP_DEFLATED, compresslevel=9) as archive:
        for p in paths:
            data = p.read_bytes()
            relative = p.relative_to(root).as_posix()
            archive.writestr(relative, data)
            manifest['files'].append({'path': relative, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
        archive.writestr('HISTORICAL_EVIDENCE_INDEX.json', json.dumps({'currentBatch': current_batch.group(1) if current_batch else None, 'excludedFiles': historical, 'requiredEvidencePolicy': 'All fixture/test inputs, text/JSON compatibility receipts and current/representative failure images included. Current-batch history/ binaries are explicitly superseded observations, indexed and retained locally; never runtime/test inputs. Original historical evidence is not deleted or rewritten.'}, ensure_ascii=False, indent=2))
        archive.writestr('EXPORT_MANIFEST.json', json.dumps(manifest, ensure_ascii=False, indent=2))
    with zipfile.ZipFile(destination) as archive:
        assert archive.testzip() is None
        for item in manifest['files']:
            assert hashlib.sha256(archive.read(item['path'])).hexdigest() == item['sha256']
    digest = hashlib.sha256(destination.read_bytes()).hexdigest()
    destination.with_suffix('.zip.sha256').write_text(digest + '  ' + destination.name + '\n')
    print(json.dumps({'path': str(destination), 'bytes': destination.stat().st_size, 'sha256': digest,
                      'sourceRevision': revision, 'provenance': provenance,
                      'sourceSnapshot': snapshot_kind, 'files': len(paths)}, indent=2))


def main():
    root = Path(__file__).resolve().parent.parent
    checkpoint = sys.argv[1] if len(sys.argv) > 1 else 'working'
    if not re.fullmatch(r'[A-Za-z0-9_-]+', checkpoint):
        raise SystemExit('Checkpoint name must contain only letters, digits, hyphen and underscore')
    destination = root / 'exports' / ('Sammakko_181_' + checkpoint + '.zip')
    destination.parent.mkdir(exist_ok=True)
    if destination.exists():
        raise SystemExit('Refusing to overwrite sealed archive: ' + str(destination))
    with tempfile.TemporaryDirectory(prefix='sammakko-export-head-') as directory:
        source, revision, provenance, kind = source_snapshot(root, Path(directory))
        export_tree(source, destination, checkpoint, revision, provenance, kind)


if __name__ == '__main__':
    main()
