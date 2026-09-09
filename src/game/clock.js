// A foreground-only fixed-step clock; discarded pauses never turn into offline production.
export function createClock() {
  let last = null;
  let accumulated = 0;
  return {
    reset() {
      last = null;
      accumulated = 0;
    },
    advance(now, paused) {
      if (last === null || paused) {
        last = now;
        accumulated = 0;
        return { ticks: 0, delta: 0 };
      }
      // Long browser stalls are dropped instead of causing a burst of catch-up ticks.
      const delta = Math.max(0, Math.min((now - last) / 1000, 0.25));
      last = now;
      accumulated += delta;
      const ticks = Math.floor(accumulated + 1e-9);
      accumulated -= ticks;
      return { ticks, delta };
    },
  };
}
