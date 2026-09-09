/** Public Three.js settlement view: lifecycle, camera controls, synchronization, and cleanup. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createPalette, disposeGeometries, disposeObject } from './materials.js';
import { createBuilding, updateConstruction } from './buildings.js';
import {
  createOverflowHamlet,
  createRoad,
  createScenery,
  createWorker,
  updateWorker,
} from './environment.js';
import { advanceDisplayTime, partitionBuildings, requiredTerrainRadius } from './layout.js';

const MAX_BUILDINGS = 180;
const MAX_WORKERS = 48;

export function createSettlementView(container, { reducedMotion = false } = {}) {
  if (!container) throw new TypeError('createSettlementView requires a container element.');
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
  } catch (error) {
    const fallback = document.createElement('p');
    fallback.className = 'settlement-renderer-fallback';
    fallback.textContent =
      'The 3D settlement could not start. Try enabling hardware acceleration or using a WebGL-compatible browser.';
    container.append(fallback);
    return {
      update() {},
      resetView() {},
      setReducedMotion() {},
      dispose() {
        fallback.remove();
      },
    };
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xb8d2cf);
  scene.fog = new THREE.Fog(0xb8d2cf, 30, 62);
  const camera = new THREE.OrthographicCamera(-14, 14, 14, -14, 0.1, 160);
  const homePosition = new THREE.Vector3(16, 15, 18);
  camera.position.copy(homePosition);
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = !reducedMotion;
  controls.dampingFactor = 0.08;
  controls.enableRotate = true;
  controls.enablePan = true;
  controls.enableZoom = true;
  controls.minZoom = 0.22;
  controls.maxZoom = 2.3;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.target.set(0, 0, 0);
  controls.update();

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.setAttribute(
    'aria-label',
    'Interactive three-dimensional view of the settlement',
  );
  renderer.domElement.setAttribute(
    'aria-description',
    'Use arrow keys to pan, drag to orbit, and scroll to zoom.',
  );
  renderer.domElement.tabIndex = 0;
  container.append(renderer.domElement);

  const palette = createPalette();
  const hemisphere = new THREE.HemisphereLight(0xfff3d4, 0x4e6651, 2.2);
  scene.add(hemisphere);
  const sun = new THREE.DirectionalLight(0xffd5a0, 3.4);
  sun.position.set(-10, 18, 11);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.camera.left = -24;
  sun.shadow.camera.right = 24;
  sun.shadow.camera.top = 24;
  sun.shadow.camera.bottom = -24;
  scene.add(sun);

  const world = new THREE.Group();
  scene.add(world);
  let ground = new THREE.Mesh(new THREE.CircleGeometry(24, 64), palette.grass);
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  world.add(ground);
  let scenery = createScenery(palette, 1);
  world.add(scenery);
  const buildingLayer = new THREE.Group();
  const roadLayer = new THREE.Group();
  const workerLayer = new THREE.Group();
  const overflowHamlet = createOverflowHamlet(palette);
  world.add(roadLayer, buildingLayer, workerLayer, overflowHamlet);
  const buildings = new Map();
  const workers = new Map();
  let terrainRadius = 24;
  let contentRadius = 12;
  let currentSeed = 1;
  let motionReduced = reducedMotion;
  let disposed = false;
  let visualTime = 0;
  let displayTimeInitialized = false;
  let previousState = null;
  controls.listenToKeyEvents(renderer.domElement);

  const resize = () => {
    const width = Math.max(1, container.clientWidth);
    const height = Math.max(1, container.clientHeight);
    const aspect = width / height;
    const span = 14;
    camera.left = -span * aspect;
    camera.right = span * aspect;
    camera.top = span;
    camera.bottom = -span;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(resize);
  observer?.observe(container);
  if (!observer) window.addEventListener('resize', resize);
  resize();

  function resetView() {
    camera.position.copy(homePosition);
    camera.zoom = Math.max(controls.minZoom, Math.min(1, 12 / contentRadius));
    controls.target.set(0, 0, 0);
    camera.updateProjectionMatrix();
    controls.update();
    renderer.render(scene, camera);
  }

  function update(state = {}, deltaSeconds = 0, paused = false) {
    if (disposed) return;
    const buildingPartition = partitionBuildings(state.buildings, MAX_BUILDINGS);
    const stateBuildings = buildingPartition.visible;
    const stateWorkers = Array.isArray(state.workers) ? state.workers.slice(0, MAX_WORKERS) : [];
    const time = Number.isFinite(state.time) ? state.time : 0;
    // A loaded session must start at its saved visual time, even when the menu was paused.
    if (state !== previousState) displayTimeInitialized = false;
    previousState = state;
    visualTime = advanceDisplayTime(visualTime, time, deltaSeconds, displayTimeInitialized, paused);
    displayTimeInitialized = true;
    const seed = Number.isFinite(state.seed) ? state.seed : 1;
    if (seed !== currentSeed) {
      world.remove(scenery);
      disposeGeometries(scenery);
      scenery = createScenery(palette, seed);
      world.add(scenery);
      currentSeed = seed;
    }

    const liveBuildings = new Set();
    stateBuildings.forEach((data) => {
      const key = String(data.id);
      liveBuildings.add(key);
      let entry = buildings.get(key);
      if (!entry || entry.type !== data.type) {
        if (entry) {
          buildingLayer.remove(entry.model);
          roadLayer.remove(entry.road);
          disposeGeometries(entry.model);
          disposeGeometries(entry.road);
        }
        const model = createBuilding(data.type, palette);
        const road = createRoad(data.x, data.z, palette);
        buildingLayer.add(model);
        roadLayer.add(road);
        entry = { model, road, type: data.type, roadX: data.x, roadZ: data.z };
        buildings.set(key, entry);
      } else if (entry.roadX !== data.x || entry.roadZ !== data.z) {
        roadLayer.remove(entry.road);
        disposeGeometries(entry.road);
        entry.road = createRoad(data.x, data.z, palette);
        entry.roadX = data.x;
        entry.roadZ = data.z;
        roadLayer.add(entry.road);
      }
      entry.model.position.set(data.x, 0.06, data.z);
      updateConstruction(entry.model, visualTime - (data.builtAt ?? -10), motionReduced);
    });
    buildings.forEach((entry, key) => {
      if (!liveBuildings.has(key)) {
        buildingLayer.remove(entry.model);
        roadLayer.remove(entry.road);
        disposeGeometries(entry.model);
        disposeGeometries(entry.road);
        buildings.delete(key);
      }
    });
    scenery.children.forEach((object) => {
      if (object.userData.tree)
        object.visible = !stateBuildings.some(
          ({ x, z }) => Math.hypot(object.position.x - x, object.position.z - z) < 3,
        );
    });
    overflowHamlet.visible = buildingPartition.overflow > 0;
    overflowHamlet.scale.setScalar(
      Math.min(2.2, 1 + Math.log10(Math.max(1, buildingPartition.overflow)) * 0.35),
    );

    const liveWorkers = new Set();
    stateWorkers.forEach((data) => {
      const key = String(data.id);
      liveWorkers.add(key);
      let model = workers.get(key);
      if (!model) {
        model = createWorker(palette, data.id);
        workers.set(key, model);
        workerLayer.add(model);
      }
      updateWorker(model, data, visualTime, motionReduced);
    });
    workers.forEach((model, key) => {
      if (!liveWorkers.has(key)) {
        workerLayer.remove(model);
        disposeGeometries(model);
        workers.delete(key);
      }
    });

    contentRadius = Math.max(
      12,
      requiredTerrainRadius(Array.isArray(state.buildings) ? state.buildings : [], 4, 3),
    );
    const neededRadius = requiredTerrainRadius(
      Array.isArray(state.buildings) ? state.buildings : [],
    );
    if (neededRadius > terrainRadius + 2) {
      world.remove(ground);
      ground.geometry.dispose();
      ground = new THREE.Mesh(new THREE.CircleGeometry(neededRadius, 64), palette.grass);
      ground.rotation.x = -Math.PI / 2;
      ground.receiveShadow = true;
      world.add(ground);
      ground.renderOrder = -1;
      terrainRadius = neededRadius;
    }
    controls.update();
    renderer.render(scene, camera);
  }

  return {
    update,
    resetView,
    setReducedMotion(value) {
      motionReduced = Boolean(value);
      controls.enableDamping = !motionReduced;
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      observer?.disconnect();
      if (!observer) window.removeEventListener('resize', resize);
      controls.stopListenToKeyEvents();
      controls.dispose();
      disposeObject(scene);
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
