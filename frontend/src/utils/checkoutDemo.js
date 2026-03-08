/** Simulated checkout order ref for the demo payment flow — not cryptographic. */
export function buildDemoOrderReference() {
  return `CTH-${Date.now().toString(36).toUpperCase()}`;
}
