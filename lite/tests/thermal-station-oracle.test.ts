import { expect, it } from 'vitest';
import { contactAt } from '../src/content/models/thermal-station';

it('matches an independent time-stepped energy balance over unequal capacities, reversed gradients and insulation', () => {
  for (const a0 of [-10, 20, 75]) for (const b0 of [0, 20, 50])
    for (const cA of [40, 150]) for (const cB of [60, 300]) for (const k of [0, 3, 12]) {
      const duration = 2.5, steps = 4000, dt = duration / steps;
      let a = a0, b = b0;
      // Midpoint energy exchange is independent of the model's exponential formula.
      for (let n = 0; n < steps; n++) {
        const first = k * (a - b) * dt;
        const energy = k * ((a - first / (2 * cA)) - (b + first / (2 * cB))) * dt;
        a -= energy / cA; b += energy / cB;
      }
      const actual = contactAt(a0, b0, cA, cB, k, duration);
      expect(actual.a).toBeCloseTo(a, 6);
      expect(actual.b).toBeCloseTo(b, 6);
      expect(cA * actual.a + cB * actual.b).toBeCloseTo(cA * a0 + cB * b0, 8);
      expect(actual.a).toBeGreaterThanOrEqual(Math.min(a0, b0));
      expect(actual.a).toBeLessThanOrEqual(Math.max(a0, b0));
      expect(actual.b).toBeGreaterThanOrEqual(Math.min(a0, b0));
      expect(actual.b).toBeLessThanOrEqual(Math.max(a0, b0));
      if (k === 0) expect([actual.a, actual.b]).toEqual([a0, b0]);
    }
});
