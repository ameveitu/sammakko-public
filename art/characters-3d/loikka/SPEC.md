# Loikka 3D candidate: authoring specification

The approved `lite/public/characters/loikka/*.png` and `art/characters/loikka/*.png` images are the authority; the older text prompt is subordinate. Source SHA-256 receipts are in metadata.json.

Exact authoring prompt: “Create Loikka, the small sky-blue frog in the approved images, as a reviewable 3D character. Keep the broad head and smaller body, two round raised eyes with warm pale-cream whites and dark pupils, a wide simple smile, pink cheeks, light-blue oval belly, and short arms and legs with rounded toes. Warm matte finish. Rig root, body, head, arms, legs and feet; author separate idle, in-place walk, leap and wave clips. Ground-centered origin, metres, GLB +Y up.”

Negative prompt: “No yellow body, green generic frog, wings, teeth, clothes, new characters, glossy plastic, unlicensed provider asset, external runtime dependencies, or replacement of existing PNGs.”

Local procedural Blender authoring with no paid provider. The original hand-drawn blue outline and crayon texture are not reproduced by current matte geometry. Private repository source; no redistribution license granted. No SPDX license is invented. Visual and runtime acceptance are separate reviews.

Rebuild using `Blender --factory-startup --background --python tools/characters-3d/build_loikka.py`; re-import using `Blender --factory-startup --background --python art/characters-3d/loikka/inspect_glb.py`. These isolated background processes do not modify an open Blender session.

Direction: Blender +X is forward (toward the face); the exported GLB also faces +X, with +Y up.
