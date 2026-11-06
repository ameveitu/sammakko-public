# Sisi: local 3D candidate

The user approved the green sleepy-lizard concept and name Sisi on 2026-11-05; the resulting model and animation remain a candidate for separate visual and runtime review. The authority is `art/characters/lizard/concepts/sleepy-lizard-v1.png`; provenance and exact source hashes are in metadata.json.

Authoring specification: “Model Sisi as the approved gentle, sleepy green lizard. Give it a large rounded head, smaller upright pear-shaped body, short round muzzle and tiny forked tongue, low sleepy eyelids with a dark pupil and warm pale lower eye, short hanging arms, small wide feet, light lime belly, and soft green back folds. A thick tail tapers and curves back to a rounded slightly raised tip. Build full three-dimensional volume, matte warm leaf and moss colors, a separate head/body/arms/legs/feet rig, articulated tail and lids; author idle, in-place walk, greet and sleep. Blender +Z up and +X forward, export glTF +Y up and +X forward, meters and ground-centered origin.”

Negative specification: “No sharp dinosaur spikes, teeth, clothes, realistic scales, glossy plastic, alert default expression, broad frog head, unlicensed paid-provider material, new character or replacement of existing PNGs.”

Geometry uses matte untextured materials. The concept’s hand-drawn crayon grain and continuous drawn outline are not reproduced, and this remains a visual limitation. The sleep clip closes the eyes and curls the body and tail forward but remains a forward-leaning pose rather than the concept’s fully floor-curled rest. Head/body and limb intersections are reviewed visually; the bounding-box and ground tests do not establish full collision-free motion. No external paid assets or provider were used. This is private repository source; no redistribution license granted.

Rebuild independently with `/Applications/Blender.app/Contents/MacOS/Blender --factory-startup --background --python tools/characters-3d/build_sisi.py`. Reimport and measure with the same Blender flags and `art/characters-3d/sisi/inspect_glb.py`. See `validation.json`, `contacts.md`, `clip-contact-sheet.png`, and `concept-comparison.png`. The GLB embeds its resources and contains no preview floor, lights or camera. +X is forward, Blender +Z up, glTF +Y up. No game-dev CLI package validation or Three.js runtime acceptance is claimed.

## v3 profile-matched build (2026-11-05)

The current model is built from the 2D drawing itself: `tools/characters-3d/profile/sisi_parts.py` traces the part masks (silhouette, eyes, lids, cheek, tongue) and `build_profile_character.py` turns them into the rigged mesh in headless Blender. Each build renders the model with the drawing's camera and `compare.py` writes the per-feature IoU to `profile-metrics.json`, and `front-metrics.json` against the generated front reference. Outline normals are smoothed and stored as the `outline_normal` attribute; the game adds the navy outline at runtime (`lite/src/world/character-style.js`).

Rebuild (needs numpy, scipy, scikit-image and triangle for the parts step):

    python tools/characters-3d/profile/sisi_parts.py
    Blender --factory-startup --background --python tools/characters-3d/profile/build_profile_character.py -- sisi
    python tools/characters-3d/profile/compare.py sisi
    python tools/characters-3d/profile/contact_sheet.py sisi
    Blender --factory-startup --background --python art/characters-3d/sisi/inspect_glb.py

Clip frames are in `clip-contact-sheet.png`; `poster.png` and `film-sleep.png` are the transparent stills the game uses. The user approved this build for now on 2026-11-05; the deferred polish is listed in `../APPROVAL-2026-11-05.json`. The older text above describes the earlier procedural candidate (`tools/characters-3d/build_sisi.py`), which is kept for history.

## 2026-11-06 turn pass (candidate)

The user's eight-view turnaround (sculpting kit, board 04) shows a rounder head, a fuller body and a back crest of round lobes compared with the generated front reference. `sisi_parts.py` now fits the model's 45° orthographic turn silhouettes to that board. The new parameters, each overridable by environment variable, are:

- `SISI_BODY_W` 1.2 and `SISI_HEAD_W` 1.05: front-width scales.
- `SISI_DOME` 2.2: skull-top rounding.
- `SISI_HEAD_SE` 3.5: superellipse head cross-sections.
- `SISI_CREST_D` .30, `SISI_CREST_R` 55, `SISI_CREST_A` 1300 and `SISI_CREST_S` 6: a deeper, coarser crest.

Measured results:

- Mean silhouette IoU over the eight views rose from 0.764 to 0.789. The 180° view rose from 0.81 to 0.87.
- Profile IoU against the drawing is 0.9944. It was 0.9941.
- Front IoU against the old generated front reference fell from 0.925 to 0.889. This drop is intentional, because board 04 is now the front target.
- The GLB has 19737 triangles and 4 clips and passes `inspect_glb.py`.

`turn-comparison.png` shows the board, the previous model and this model at eight angles. The board's 45° drawings are drawn closer to profile than a true 45°, so those views stay lower by construction.

Remaining issues:

- Faint horizontal shading bands on the back of the head in Workbench renders.
- Language and mouth details on the board were not carried into the model.

The user approved this build for the game on 2026-11-06 (`../APPROVAL-2026-11-06.json`); `lite/tools/sync-character-models.mjs` copies it into `lite/public/models/characters/sisi/`.

## 2026-11-06 sphere pass (candidate)

The user asked for an almost perfectly spherical head with the crest left out of the comparison. They also asked for a separate crest that could jiggle, and for a belly that wobbles during the waddle. They pointed to the board side view as the source, where the crest sits outside the round head, instead of `sleepy-lizard-v1.png`, where the crest runs inside the head outline.

- **Source:** `art/characters/lizard/concepts/turnaround-side-v1.png` is a copy of sculpting-kit cutout `sisi_090.png`, sha256 6c203d01…, matching the kit's SHA256SUMS. `sisi_parts.py` registers it onto the drawing with scale 5.44, dx 32 and dy −37, which gives silhouette IoU 0.876. The crest mask comes from the board.
- **Head:**
  - The head is now an analytic ball (48×22 segments) built from the drawing's head circle: radius about 0.37 m. `SISI_HEAD_SX` defaults to 1.0 and sets the depth scale.
  - The body is clamped inside the ball.
  - There is no longer a superellipse, dome or front-width head.
- **Head roundness KPI (new tool):**
  - `tools/characters-3d/profile/head_roundness.py` renders the rest pose without the crest, decals or tongue from 8 directions.
  - It measures the outline radius over ±105° from the top. Pass: max deviation ≤ 3 % and rms ≤ 1.5 %.
  - Results are in `head-roundness.json` and `.png`. This build passes with worst 1.0 % and rms 0.5 %. The previous build scored 44 % and 17.5 %.
- **Crest:**
  - The crest is a separate part: a thin fin (`SISI_CREST_A` 2000) plus 5 round lobe balls fitted to the board's scallops (`SISI_LOBE_SX` .85).
  - Four chain bones `crest_1..4` (`SISI_CREST_N`) carry the crest. Their parent is the head or the body, and the base stays bound to the head, body or tail.
- **Belly:** a `belly` bone (`SISI_BELLY_W` .8) carries a smooth weight patch on the belly.
- **Secondary motion (baked into idle and walk):**
  - Damped spring followers of the body roll and bob drive the crest wave and the belly wobble.
  - Parameters: `SISI_CREST_GAIN` 2.2 and `SISI_BELLY_GAIN` 1.6, plus the walk waddle roll .05 rad and bob .012 m.
  - Greet and sleep have no jiggle yet.
- **Metrics:**
  - Profile IoU against the drawing is 0.940. It was 0.994; the drop is intentional, because the crest now follows the board.
  - The 8-view board mean IoU is 0.772. It was 0.789.
  - The GLB has 19846 triangles and 23 bones, is 0.75 MB, has 4 clips and passes `inspect_glb.py`.
- **Comparison image:** `turn-comparison.png` rows show the board, the previous build and this build.
- **Known issues:**
  - On the board, the front view of the head is about 20 % wider than tall. The head was kept a ball as the user asked; `SISI_HEAD_SX` can change this.
  - The body sides are lumpy at 45° and 315°.
  - The eyes sit at the sides when seen from the front.
  - The small tail lobes are not balls.

The user approved this build for the game on 2026-11-06 (`../APPROVAL-2026-11-06.json`); `lite/tools/sync-character-models.mjs` copies it into `lite/public/models/characters/sisi/`.
