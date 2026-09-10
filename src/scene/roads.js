// Shared orthogonal streets: block edges join the nearest existing street junction.
import * as THREE from 'three';

const key = ([x, z]) => `${x},${z}`;
export function roadSegments(buildings, farms = []) {
  const edges = new Map();
  const junctions = new Map();
  function edge(a, b) {
    if (key(a) === key(b)) return;
    const id = [key(a), key(b)].sort().join('|');
    edges.set(id, { a, b });
    junctions.set(key(a), a);
    junctions.set(key(b), b);
  }
  function connect(point) {
    if (!junctions.size) {
      junctions.set(key(point), point);
      return;
    }
    if (junctions.has(key(point))) return;
    const nearest = [...junctions.values()].sort(
      (a, b) =>
        Math.abs(a[0] - point[0]) +
          Math.abs(a[1] - point[1]) -
          Math.abs(b[0] - point[0]) -
          Math.abs(b[1] - point[1]) ||
        a[0] - b[0] ||
        a[1] - b[1],
    )[0];
    let current = [...point];
    for (const axis of [0, 1]) {
      while (current[axis] !== nearest[axis]) {
        const next = [...current];
        next[axis] +=
          Math.sign(nearest[axis] - current[axis]) *
          Math.min(4, Math.abs(nearest[axis] - current[axis]));
        edge(current, next);
        current = next;
      }
    }
  }
  for (const { x, z } of [...buildings].sort((a, b) => a.id - b.id)) {
    const corners = [
      [x - 2, z - 2],
      [x + 2, z - 2],
      [x + 2, z + 2],
      [x - 2, z + 2],
    ];
    connect(corners[0]);
    for (let i = 0; i < 4; i++) edge(corners[i], corners[(i + 1) % 4]);
  }
  // Farm lanes lie outside the crop beds and join the same settlement network.
  for (const farm of farms) connect([farm.x - 4, farm.z + 4]);
  return [...edges.values()];
}

export function createRoadNetwork(segments, palette) {
  const group = new THREE.Group();
  for (const { a, b } of segments) {
    const dx = b[0] - a[0],
      dz = b[1] - a[1];
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(Math.abs(dx) + 0.38, 0.025, Math.abs(dz) + 0.38),
      palette.road,
    );
    mesh.position.set((a[0] + b[0]) / 2, 0.025, (a[1] + b[1]) / 2);
    mesh.receiveShadow = true;
    group.add(mesh);
  }
  return group;
}
