// Workforce-sized agricultural plots, placed beyond occupied housing and storage.
import * as THREE from 'three';
import { prepareMesh } from './materials.js';

export function farmLayout(farmers, buildings) {
  if (farmers <= 0) return [];
  const count = Math.min(24, Math.ceil(farmers / 4));
  const columns = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / columns);
  const edge = Math.ceil(Math.max(4, ...buildings.map((b) => b.x)) / 4) * 4 + 8;
  return Array.from({ length: count }, (_, index) => {
    const represented = Math.floor(farmers / count) + (index < farmers % count ? 1 : 0);
    return {
      x: edge + Math.floor(index / rows) * 8,
      z: (index % rows) * 8 - Math.floor(rows / 2) * 8,
      size: Math.min(6, 2 + Math.sqrt(represented)),
      workers: represented,
    };
  });
}

export function createFarms(plots, palette) {
  const group = new THREE.Group();
  for (const plot of plots) {
    const bed = prepareMesh(
      new THREE.Mesh(new THREE.BoxGeometry(plot.size, 0.06, plot.size), palette.soil),
    );
    bed.position.set(plot.x, 0.04, plot.z);
    group.add(bed);
    const rows = Math.floor(plot.size / 0.45);
    for (let x = 0; x < rows; x++)
      for (let z = 0; z < rows; z++) {
        const crop = prepareMesh(
          new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.4, 4), palette.wheat),
        );
        crop.position.set(
          plot.x + (x - (rows - 1) / 2) * 0.45,
          0.25,
          plot.z + (z - (rows - 1) / 2) * 0.45,
        );
        group.add(crop);
      }
  }
  return group;
}
