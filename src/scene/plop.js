// Two-second arrival: drop, squash, rebound, and settle, without a construction delay.
export const PLOP_SECONDS = 2;
export function advanceArrivalSeconds(seconds, deltaSeconds, paused) {
  return paused ? seconds : Math.min(PLOP_SECONDS, seconds + Math.max(0, deltaSeconds));
}
export function plopPose(seconds, reducedMotion = false) {
  if (reducedMotion || seconds >= PLOP_SECONDS) return { lift: 0, xz: 1, y: 1 };
  const elapsed = Math.max(0, seconds);
  if (elapsed < 0.25) return { lift: 1.6 * (1 - (elapsed / 0.25) ** 2), xz: 1, y: 1 };
  const bounce = elapsed - 0.25;
  const envelope = Math.exp(-4 * bounce) * (1 - bounce / 1.75);
  const squash = 0.22 * Math.cos(bounce * 12) * envelope;
  return {
    lift: Math.max(0, -Math.sin(bounce * 12)) * 0.13 * envelope,
    xz: 1 + squash * 0.55,
    y: 1 - squash,
  };
}
