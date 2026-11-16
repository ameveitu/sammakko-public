import type { Paint } from '../../engine/types';

export type SolidKind = 'cylinder' | 'cone' | 'frustum' | 'sphere' | 'disc' | 'ellipsoid' | 'prism3' | 'pyramid4' | 'cube';
export interface Solid {
  kind: SolidKind;
  name?: string;
  /** Lies on its side (a cylinder is still a cylinder). */
  lying?: boolean;
  /** See-through, for showing what is inside. */
  ghost?: boolean;
  /** Measures drawn on the solid: r (radius), h (height), s (slant), three radii of a sphere, an equator disc. */
  dims?: { r?: string; h?: string; s?: string; radii?: boolean; equator?: string };
  /** Water in a see-through cylinder: a share 0–1, or 'pour3' (one cone at a time). */
  water?: number | 'pour3';
  mark?: 'ok' | 'no';
}
/** Slowly turning 3D solids with names under them and measures that follow the turn. */
export declare function solids(o: { items: Solid[]; label: string; sway?: boolean; caption?: string }): Paint;
/** A 10 cm cube built from 1 cm³ cubes: `layers` layers of 100. */
export declare function unitCubes(o: { layers: number; label: string; note?: string }): Paint;
