/** Procedural low-poly building models and a two-second arrival animation. */
import * as THREE from 'three';
import { prepareMesh } from './materials.js';
import { plopPose } from './plop.js';

const box = (w, h, d, material, y = h / 2) => {
  const mesh = prepareMesh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material));
  mesh.position.y = y;
  return mesh;
};

function roof(width, depth, height, material, y) {
  const geometry = new THREE.ConeGeometry(Math.hypot(width, depth) * 0.58, height, 4);
  const mesh = prepareMesh(new THREE.Mesh(geometry, material));
  mesh.rotation.y = Math.PI / 4;
  mesh.scale.x = width / depth;
  mesh.position.y = y;
  return mesh;
}

function home(group, p, size, roofHeight) {
  group.add(box(size, size * 0.68, size * 0.82, p.cream));
  group.add(roof(size * 1.1, size * 0.92, roofHeight, p.roof, size * 0.68 + roofHeight / 2));
  const door = box(size * 0.22, size * 0.36, 0.06, p.darkWood, size * 0.18);
  door.position.z = size * 0.44;
  group.add(door);
}

function pile(group, material, stones = false) {
  group.add(box(1.75, 0.12, 1.05, material, 0.06));
  for (let i = 0; i < 8; i += 1) {
    const mesh = prepareMesh(
      new THREE.Mesh(
        stones
          ? new THREE.DodecahedronGeometry(0.22 + (i % 3) * 0.05, 0)
          : new THREE.CylinderGeometry(0.11, 0.13, 0.85, 6),
        material,
      ),
    );
    mesh.position.set(
      ((i % 4) - 1.5) * 0.3,
      stones ? 0.18 + Math.floor(i / 4) * 0.25 : 0.15 + Math.floor(i / 4) * 0.23,
      (i % 2) * 0.3 - 0.15,
    );
    if (!stones) mesh.rotation.z = Math.PI / 2;
    group.add(mesh);
  }
}

export function createBuilding(type, p) {
  const group = new THREE.Group();
  if (type === 'tent') {
    const tent = prepareMesh(new THREE.Mesh(new THREE.ConeGeometry(0.95, 1.35, 4), p.canvas));
    tent.position.y = 0.68;
    tent.rotation.y = Math.PI / 4;
    group.add(tent);
    const openingShape = new THREE.Shape();
    openingShape.moveTo(-0.3, 0);
    openingShape.lineTo(0, 0.62);
    openingShape.lineTo(0.3, 0);
    openingShape.closePath();
    const opening = prepareMesh(new THREE.Mesh(new THREE.ShapeGeometry(openingShape), p.darkWood));
    opening.position.set(0, 0.03, 0.675);
    group.add(opening);
    const ridge = prepareMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.7, 6), p.wood),
    );
    ridge.rotation.z = Math.PI / 2;
    ridge.position.y = 1.3;
    group.add(ridge);
  } else if (type === 'hut') {
    group.add(box(1.45, 0.85, 1.2, p.wood));
    group.add(roof(1.6, 1.38, 0.7, p.roofDark, 1.2));
  } else if (type === 'cottage') home(group, p, 1.65, 0.82);
  else if (type === 'barn') {
    group.add(box(2.3, 1.35, 1.75, p.roof));
    group.add(roof(2.55, 2, 1.08, p.roofDark, 1.88));
    const doors = box(0.9, 0.95, 0.07, p.darkWood, 0.48);
    doors.position.z = 0.91;
    group.add(doors);
  } else if (type === 'woodStockpile') pile(group, p.wood, false);
  else pile(group, p.stone, true);

  return group;
}

export function updateConstruction(group, seconds, reducedMotion = false) {
  const pose = plopPose(seconds, reducedMotion);
  group.scale.set(pose.xz, pose.y, pose.xz);
  group.position.y = 0.06 + pose.lift;
}
