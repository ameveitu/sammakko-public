# Aava 3D candidate: authoring specification

The approved images `lite/public/characters/aava/idle.png`, `curious.png`, and `art/characters/aava/*.png` are the source of truth; the older text prompt is subordinate. SHA-256 source receipts are in metadata.json.

Exact authoring prompt: “Create Aava, the small butter-yellow duckling in the approved images, as a reviewable 3D character. Match the large round head, smaller pear body, two soft orange bill lobes, large dark eye with pale/cyan rim, pink cheek, short side wings, rear tail, thin orange legs and small webbed feet. Place an eye on each side of the head. Keep profile and three-quarter silhouettes recognizable. Materials are warm and matte. Rig head, body, wings and legs; idle, walk, gentle-nod and point are separate looping or bounded actions. Origin is ground center, metres, GLB +Y up.”

Negative prompt: “No hair tuft, eyebrows, new facial features, generic round yellow toy proportions, shiny plastic, changing bill, visible far-side eye in exact profile, unsupported external resources, or game replacement.”

Local procedural Blender authoring; no paid service. The original 2D ink outline and hand-drawn texture are not replicated by the current matte geometry. Visual acceptance and runtime integration require a separate review; generated preview is not human validation. Private repository source; no redistribution license granted. No invented SPDX license.

Rebuild: `Blender --factory-startup --background --python tools/characters-3d/build_aava.py`; re-import: `Blender --factory-startup --background --python art/characters-3d/aava/inspect_glb.py`. These scripts do not interact with an open Blender session.

Direction: Blender +X is forward (toward the beak); the exported GLB also faces +X, with +Y up.

## v3 profile-matched build (2026-11-05)

The current model is built from the 2D drawing itself: `tools/characters-3d/profile/aava_parts.py` traces the part masks (silhouette, eyes, lids, cheek, upper and lower bill, mouth line) and `build_profile_character.py` turns them into the rigged mesh in headless Blender. Each build renders the model with the drawing's camera and `compare.py` writes the per-feature IoU to `profile-metrics.json`. Outline normals are smoothed and stored as the `outline_normal` attribute; the game adds the navy outline at runtime (`lite/src/world/character-style.js`).

Rebuild (needs numpy, scipy, scikit-image and triangle for the parts step):

    python tools/characters-3d/profile/aava_parts.py
    Blender --factory-startup --background --python tools/characters-3d/profile/build_profile_character.py -- aava
    python tools/characters-3d/profile/compare.py aava
    python tools/characters-3d/profile/contact_sheet.py aava
    Blender --factory-startup --background --python art/characters-3d/aava/inspect_glb.py

Clip frames are in `clip-contact-sheet.png`; `poster.png` are the transparent stills the game uses. The user approved this build for now on 2026-11-05; the deferred polish is listed in `../APPROVAL-2026-11-05.json`. The older text above describes the earlier procedural candidate (`tools/characters-3d/build_aava.py`), which is kept for history.

## 2026-11-06 sphere pass (candidate)

The user asked for an almost perfectly spherical head on both characters (see the Sisi pass on the same day).

- **Head ball:** the head is now an analytic ball (48×22) built from a circle fitted to the drawing's upper head outline. The circle is centred at pixels (605.0, 403.3) with radius 171.3 px, which is about 0.41 m. `AAVA_HEAD_SX` defaults to 1.0 and sets the depth scale.
- **Body:** the body stays inside the ball, and the small bulges at the back of the neck and under the bill are trimmed to the circle.
- **Bill-base ink line:** it now follows only the bill. On the ball's side it read as a stray line on the cheek.
- **Head roundness KPI:** `tools/characters-3d/profile/head_roundness.py` leaves out the appendages listed in `joints.roundness_skip`, which for Aava is the bill. This build passes with worst 1.0 % and rms 0.5 %. The previous build measured 17.9 % and 10.5 %.
- **Metrics:**
  - Mean silhouette IoU against the 8-view sculpting-kit board rose from 0.677 to 0.708 (rendered with the kit's `render_turn.py`).
  - Against the drawing:
    - Silhouette IoU is 0.978; it was 0.995.
    - Upper bill IoU is 0.92; it was 0.97.
    - Lower bill IoU is 0.88; it was 0.98.
  - The drawn head is a slightly tilted oval, so the gap between the ball and the drawn bill base now shows as bill.
  - The GLB has 15553 triangles, 9 bones and 4 clips, and passes `inspect_glb.py`.
- **Comparison image:** `turn-comparison.png` rows show the board, the previous build and this build.
- **Known issues:**
  - The front-view body is narrower than on the board.
  - Small rust stubs remain between the bill lobes.

The user approved this build for the game on 2026-11-06 (`../APPROVAL-2026-11-06.json`); `lite/tools/sync-character-models.mjs` copies it into `lite/public/models/characters/aava/`.
