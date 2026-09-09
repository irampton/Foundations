// Fill nearby four-unit plots before expanding; saved coordinates remain authoritative on reload.
export function nextPosition(buildings) {
  const occupied = new Set(buildings.map(({ x, z }) => `${x},${z}`));
  // Leave the central crossroads open, including on a fresh map.
  occupied.add('0,0');
  for (let ring = 1; ; ring += 1) {
    for (let z = -ring; z <= ring; z += 1) {
      for (let x = -ring; x <= ring; x += 1) {
        if (Math.max(Math.abs(x), Math.abs(z)) !== ring) continue;
        const candidate = [x * 4, z * 4];
        if (!occupied.has(candidate.join(','))) return candidate;
      }
    }
  }
}
