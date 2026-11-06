/** Two branches share nodes A and B on an ideal constant-voltage source. Currents are measurements. */
export interface ParallelCircuit {
  kind: 'parallel-circuit';
  title: string;
  voltage: number;
  currentsMa: [number, number];
  lights: [string, string];
  layout: 'horizontal' | 'vertical';
}

export function parallelReadings(circuit: ParallelCircuit) {
  const [first, second] = circuit.currentsMa;
  return {
    branchVolts: [circuit.voltage, circuit.voltage] as const,
    totalCurrentMa: first + second,
  };
}
