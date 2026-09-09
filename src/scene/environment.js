/** Decorative terrain, forest, quarry, farm, roads, and animated worker figures. */
import * as THREE from 'three';
import { prepareMesh } from './materials.js';

function rand(seed) {
  let value = seed | 0;
  return () => {
    value = Math.imul(value ^ (value >>> 15), 1 | value);
    value ^= value + Math.imul(value ^ (value >>> 7), 61 | value);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function createScenery(p, seed = 1) {
  const group = new THREE.Group();
  const random = rand(seed);
  for (let i = 0; i < 34; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = 12 + random() * 9;
    const tree = new THREE.Group();
    tree.userData.tree = true;
    tree.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    tree.add(prepareMesh(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.2, 6), p.wood)));
    tree.children[0].position.y = 0.6;
    const crown = prepareMesh(
      new THREE.Mesh(
        new THREE.ConeGeometry(0.75 + random() * 0.3, 2.1, 7),
        i % 3 ? p.leaf : p.leafLight,
      ),
    );
    crown.position.y = 1.75;
    tree.add(crown);
    group.add(tree);
  }
  // Quarry stones and a tilled starter field give job locations a visual identity.
  for (let i = 0; i < 12; i += 1) {
    const rock = prepareMesh(
      new THREE.Mesh(new THREE.DodecahedronGeometry(0.25 + random() * 0.35, 0), p.stone),
    );
    rock.position.set(-9 + random() * 3.5, 0.22, 4 + random() * 3.5);
    rock.rotation.y = random() * 6;
    group.add(rock);
  }
  const field = prepareMesh(new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.08, 3.8), p.soil));
  field.position.set(8, 0.03, 6);
  group.add(field);
  for (let row = 0; row < 6; row += 1)
    for (let col = 0; col < 8; col += 1) {
      const crop = prepareMesh(new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.45, 5), p.wheat));
      crop.position.set(6.2 + col * 0.52, 0.25, 4.7 + row * 0.5);
      group.add(crop);
    }
  return group;
}

export function createRoad(x, z, p) {
  const length = Math.max(0.5, Math.hypot(x, z));
  const road = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.035, length), p.road);
  road.position.set(x / 2, 0.035, z / 2);
  road.rotation.y = Math.atan2(x, z);
  road.receiveShadow = true;
  return road;
}

export function createOverflowHamlet(p) {
  const group = new THREE.Group();
  for (let i = 0; i < 12; i += 1) {
    const building = prepareMesh(
      new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.5, 0.48), i % 3 ? p.cream : p.wood),
    );
    building.position.set((i % 4) * 0.72, 0.25, Math.floor(i / 4) * 0.7);
    const cap = prepareMesh(new THREE.Mesh(new THREE.ConeGeometry(0.43, 0.38, 4), p.roof));
    cap.position.copy(building.position);
    cap.position.y = 0.69;
    cap.rotation.y = Math.PI / 4;
    group.add(building, cap);
  }
  group.position.set(-2.4, 0, -15);
  group.visible = false;
  return group;
}

export function createWorker(p, id) {
  const group = new THREE.Group();
  const body = prepareMesh(new THREE.Mesh(new THREE.CapsuleGeometry(0.15, 0.32, 3, 6), p.shirt));
  body.position.y = 0.48;
  const head = prepareMesh(new THREE.Mesh(new THREE.SphereGeometry(0.14, 7, 5), p.skin));
  head.position.y = 0.86;
  group.add(body, head);
  group.userData.phase = id * 2.399;
  return group;
}

export function updateWorker(group, worker, time, reducedMotion) {
  const phase = group.userData.phase;
  const destinations = { farmer: [8, 6], woodcutter: [12, -3], miner: [-8, 5], unemployed: [0, 0] };
  const [cx, cz] = destinations[worker.job] || destinations.unemployed;
  const speed = worker.job === 'unemployed' ? 0.18 : 0.42;
  const radius = worker.job === 'unemployed' ? 3.2 : 1.8;
  const t = reducedMotion ? phase : time * speed + phase;
  group.position.set(
    cx + Math.cos(t) * radius,
    reducedMotion ? 0 : Math.abs(Math.sin(t * 5)) * 0.035,
    cz + Math.sin(t * 0.83) * radius,
  );
  group.rotation.y = -t;
}
