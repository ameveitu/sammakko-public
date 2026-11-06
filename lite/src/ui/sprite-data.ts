/** Key-pose sequences from the character handover (assets/animations.json, asset version 2.0.0).
 *  Transcribed as data only; poses are the PNG files in public/characters/<actor>/. */
export type Actor = 'aava' | 'loikka';
export interface Frame { pose: string; ms: number; dy: number; rot: number }
export interface Seq { loop: boolean; frames: Frame[] }
export const ASSET_VERSION = '2.0.0';
/** Frame is 256×256; feet rest at (128,238), the swim waterline at (128,208). */
export const FRAME = 256, ANCHOR = { x: 128, y: 238 }, WATERLINE = { x: 128, y: 208 };
export const CANON_SEQS: Record<Actor, Record<string, Seq>> = {
  aava: {
    idle: { loop: true, frames: [{ pose: 'idle', ms: 2300, dy: 0, rot: 0 }, { pose: 'blink', ms: 150, dy: 0, rot: 0 }, { pose: 'idle', ms: 1700, dy: 0, rot: 0 }] },
    walk: { loop: true, frames: [{ pose: 'walk_01', ms: 240, dy: 0, rot: 0 }, { pose: 'walk_03', ms: 240, dy: -2, rot: 0 }, { pose: 'walk_04', ms: 240, dy: 0, rot: 0 }, { pose: 'walk_03', ms: 240, dy: 1, rot: 0 }] },
    wave: { loop: false, frames: [{ pose: 'idle', ms: 150, dy: 0, rot: 0 }, { pose: 'wave', ms: 650, dy: -3, rot: 0 }, { pose: 'wave', ms: 250, dy: 0, rot: 2 }, { pose: 'idle', ms: 300, dy: 0, rot: 0 }] },
    talk: { loop: true, frames: [{ pose: 'idle', ms: 650, dy: 0, rot: 0 }, { pose: 'talk', ms: 320, dy: 0, rot: 0 }, { pose: 'idle', ms: 360, dy: 0, rot: 0 }, { pose: 'talk', ms: 500, dy: 0, rot: 0 }] },
    curious: { loop: false, frames: [{ pose: 'curious', ms: 1000, dy: 0, rot: 0 }] },
    map: { loop: false, frames: [{ pose: 'map', ms: 1000, dy: 0, rot: 0 }] },
    swim: { loop: true, frames: [{ pose: 'swim', ms: 900, dy: 0, rot: 0 }, { pose: 'swim', ms: 900, dy: -2, rot: 0 }, { pose: 'swim_blink', ms: 160, dy: -2, rot: 0 }, { pose: 'swim', ms: 900, dy: 0, rot: 0 }] },
  },
  loikka: {
    idle: { loop: true, frames: [{ pose: 'idle', ms: 2400, dy: 0, rot: 0 }, { pose: 'blink', ms: 150, dy: 0, rot: 0 }, { pose: 'idle', ms: 1800, dy: 0, rot: 0 }] },
    walk: { loop: true, frames: [{ pose: 'walk_01', ms: 220, dy: 0, rot: 0 }, { pose: 'idle', ms: 150, dy: -3, rot: 0 }, { pose: 'walk_02', ms: 220, dy: 0, rot: 0 }, { pose: 'idle', ms: 150, dy: -3, rot: 0 }] },
    wave: { loop: false, frames: [{ pose: 'idle', ms: 180, dy: 0, rot: 0 }, { pose: 'wave', ms: 700, dy: -2, rot: 0 }, { pose: 'wave', ms: 250, dy: 0, rot: 2 }, { pose: 'idle', ms: 300, dy: 0, rot: 0 }] },
    happy: { loop: false, frames: [{ pose: 'happy', ms: 450, dy: -6, rot: 0 }, { pose: 'happy', ms: 450, dy: 0, rot: 0 }, { pose: 'happy', ms: 700, dy: -2, rot: 0 }] },
    curious: { loop: false, frames: [{ pose: 'curious', ms: 1200, dy: 0, rot: 0 }] },
    map: { loop: false, frames: [{ pose: 'map', ms: 1200, dy: 0, rot: 0 }] },
    jump: { loop: false, frames: [{ pose: 'idle', ms: 180, dy: 0, rot: 0 }, { pose: 'crouch', ms: 180, dy: 0, rot: 0 }, { pose: 'leap', ms: 180, dy: -26, rot: 0 }, { pose: 'airborne', ms: 240, dy: -46, rot: 0 }, { pose: 'land', ms: 160, dy: 0, rot: 0 }, { pose: 'idle', ms: 350, dy: 0, rot: 0 }] },
  },
};

/** Selected art actions only; the complete 20-action proposal remains in art/. */
// BEGIN SELECTED ART SEQUENCES (art/prepare-runtime.py)
export const ART_SEQS: Record<Actor, Record<string, Seq>> = {
  "aava": {
    "think": {
      "loop": true,
      "frames": [
        {
          "pose": "think",
          "ms": 2200,
          "dy": 0,
          "rot": 0
        },
        {
          "pose": "think",
          "ms": 600,
          "dy": 0,
          "rot": 2
        }
      ]
    },
    "point": {
      "loop": false,
      "frames": [
        {
          "pose": "idle",
          "ms": 150,
          "dy": 0,
          "rot": 0
        },
        {
          "pose": "point",
          "ms": 1400,
          "dy": 0,
          "rot": 0
        },
        {
          "pose": "idle",
          "ms": 300,
          "dy": 0,
          "rot": 0
        }
      ]
    },
    "read": {
      "loop": true,
      "frames": [
        {
          "pose": "read",
          "ms": 2400,
          "dy": 0,
          "rot": 0
        },
        {
          "pose": "read",
          "ms": 400,
          "dy": 1,
          "rot": 0
        }
      ]
    },
    "celebrate": {
      "loop": false,
      "frames": [
        {
          "pose": "idle",
          "ms": 120,
          "dy": 0,
          "rot": 0
        },
        {
          "pose": "crouch",
          "ms": 140,
          "dy": 0,
          "rot": 0
        },
        {
          "pose": "celebrate",
          "ms": 420,
          "dy": -10,
          "rot": 0
        },
        {
          "pose": "flap_01",
          "ms": 150,
          "dy": -6,
          "rot": 0
        },
        {
          "pose": "flap_02",
          "ms": 150,
          "dy": -2,
          "rot": 0
        },
        {
          "pose": "flap_01",
          "ms": 150,
          "dy": -4,
          "rot": 0
        },
        {
          "pose": "celebrate",
          "ms": 500,
          "dy": 0,
          "rot": 0
        },
        {
          "pose": "idle",
          "ms": 300,
          "dy": 0,
          "rot": 0
        }
      ]
    }
  },
  "loikka": {
    "think": {
      "loop": true,
      "frames": [
        {
          "pose": "think",
          "ms": 2200,
          "dy": 0,
          "rot": 0
        },
        {
          "pose": "think",
          "ms": 600,
          "dy": 0,
          "rot": -2
        }
      ]
    },
    "point": {
      "loop": false,
      "frames": [
        {
          "pose": "point",
          "ms": 1400,
          "dy": 0,
          "rot": 0
        },
        {
          "pose": "idle",
          "ms": 300,
          "dy": 0,
          "rot": 0
        }
      ]
    }
  }
};
// END SELECTED ART SEQUENCES
export const ART_POSES: Record<Actor, ReadonlySet<string>> = {
  aava: new Set(['think', 'point', 'read', 'celebrate', 'crouch', 'flap_01', 'flap_02']),
  loikka: new Set(['think', 'point']),
};
export const SEQS: Record<Actor, Record<string, Seq>> = {
  aava: { ...CANON_SEQS.aava, ...ART_SEQS.aava },
  loikka: { ...CANON_SEQS.loikka, ...ART_SEQS.loikka },
};
