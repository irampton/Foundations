/** Pure scene-layout calculations, kept separate so limits and timing can be unit tested without WebGL. */
export function partitionBuildings(buildings, limit) {
  const source = Array.isArray(buildings) ? buildings : [];
  return { visible: source.slice(0, limit), overflow: Math.max(0, source.length - limit) };
}

export function requiredTerrainRadius(buildings, minimum = 24, margin = 8) {
  return Math.max(minimum, ...buildings.map(({ x = 0, z = 0 }) => Math.hypot(x, z) + margin));
}

export function advanceDisplayTime(displayTime, stateTime, deltaSeconds, initialized, paused) {
  if (!initialized || stateTime < displayTime) return stateTime;
  if (paused) return displayTime;
  return Math.min(stateTime, displayTime + Math.max(0, Math.min(deltaSeconds, 0.1)));
}
