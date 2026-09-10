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
  else if (type === 'house') home(group, p, 1.9, 1);
  else if (type === 'mansion') home(group, p, 2.5, 1.25);
  else if (type === 'barn') {
    group.add(box(2.3, 1.35, 1.75, p.roof));
    group.add(roof(2.55, 2, 1.08, p.roofDark, 1.88));
    const doors = box(0.9, 0.95, 0.07, p.darkWood, 0.48);
    doors.position.z = 0.91;
    group.add(doors);
  } else if (type === 'woodStockpile') pile(group, p.wood, false);
  else if (type === 'stoneStockpile') pile(group, p.stone, true);
  else if (type === 'mill') {
    group.add(box(1.4, 1.7, 1.4, p.cream));
    const hub = prepareMesh(
      new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.25, 8), p.darkWood),
    );
    hub.rotation.x = Math.PI / 2;
    hub.position.set(0, 1.45, 0.83);
    group.add(hub);
    for (let i = 0; i < 4; i++) {
      const sail = box(0.18, 1.25, 0.06, p.canvas, 0.62);
      sail.position.set(
        Math.sin((i * Math.PI) / 2) * 0.55,
        1.45 + Math.cos((i * Math.PI) / 2) * 0.55,
        0.98,
      );
      sail.rotation.z = (-i * Math.PI) / 2;
      group.add(sail);
    }
  } else if (type === 'graveyard') {
    group.add(box(2.2, 0.08, 1.8, p.stone, 0.04));
    for (let i = 0; i < 6; i++) {
      const marker = box(0.18, 0.55, 0.12, p.stone, 0.28);
      marker.position.set(((i % 3) - 0.9) * 0.65, 0.28, (Math.floor(i / 3) - 0.5) * 0.65);
      group.add(marker);
    }
  } else {
    const civic = ['temple', 'library', 'apothecary'].includes(type);
    group.add(box(civic ? 2 : 1.7, civic ? 1.35 : 1, 1.5, civic ? p.cream : p.stone));
    group.add(roof(civic ? 2.2 : 1.9, 1.7, 0.75, civic ? p.roof : p.roofDark, civic ? 1.72 : 1.35));
  }

  return group;
}

export function updateConstruction(group, seconds, reducedMotion = false) {
  const pose = plopPose(seconds, reducedMotion);
  group.scale.set(pose.xz, pose.y, pose.xz);
  group.position.y = 0.06 + pose.lift;
}
