"""Tile a character's rendered clip frames into one sheet per clip row.

Usage: python contact_sheet.py <id>   (reads art/characters-3d/<id>/<clip>-NN.png, writes clip-contact-sheet.png)
"""
import re, sys
from pathlib import Path
from PIL import Image, ImageDraw
OUT = Path(__file__).resolve().parents[3] / 'art/characters-3d' / sys.argv[1]
rows = {}
for f in sorted(OUT.glob('*-[0-9][0-9].png')):
    m = re.fullmatch(r'(.+)-(\d\d)\.png', f.name)
    rows.setdefault(m[1], []).append((int(m[2]), f))
order = ['walk'] + sorted(k for k in rows if k != 'walk')
cell = 240; cols = max(len(v) for v in rows.values())
sheet = Image.new('RGB', (cols * cell, len(order) * (cell + 22)), 'white'); draw = ImageDraw.Draw(sheet)
for r, clip in enumerate(order):
    for c, (frame, f) in enumerate(sorted(rows[clip])):
        x, y = c * cell, r * (cell + 22)
        sheet.paste(Image.open(f).convert('RGB').resize((cell, cell), Image.LANCZOS), (x, y + 22))
        draw.text((x + 6, y + 5), '%s %d' % (clip, frame), fill=(30, 50, 80))
sheet.save(OUT / 'clip-contact-sheet.png')
print('sheet', OUT / 'clip-contact-sheet.png', {k: len(v) for k, v in rows.items()})
