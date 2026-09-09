/** Shared low-poly materials and safe disposal helpers for the settlement scene. */
import * as THREE from 'three';

export function createPalette() {
  const mat = (color, options = {}) =>
    new THREE.MeshStandardMaterial({
      color,
      roughness: 0.88,
      metalness: 0,
      flatShading: true,
      ...options,
    });

  return {
    grass: mat(0x77965a),
    darkGrass: mat(0x557443),
    soil: mat(0x8d6747),
    road: mat(0xb49a72),
    cream: mat(0xead9b3),
    canvas: mat(0xd8c49a),
    wood: mat(0x744b30),
    darkWood: mat(0x493326),
    roof: mat(0xa64f32),
    roofDark: mat(0x6e382c),
    stone: mat(0x777a72),
    leaf: mat(0x315d3c),
    leafLight: mat(0x4f7a45),
    water: mat(0x739fa0),
    wheat: mat(0xd3aa55),
    skin: mat(0xca8d63),
    shirt: mat(0x496d7a),
    shadow: mat(0x313832),
  };
}

export function prepareMesh(mesh) {
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function disposeObject(root) {
  const geometries = new Set();
  const materials = new Set();
  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
    const list = Array.isArray(object.material) ? object.material : [object.material];
    list.filter(Boolean).forEach((material) => materials.add(material));
  });
  geometries.forEach((geometry) => geometry.dispose());
  materials.forEach((material) => material.dispose());
}

export function disposeGeometries(root) {
  const geometries = new Set();
  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry);
  });
  geometries.forEach((geometry) => geometry.dispose());
}
