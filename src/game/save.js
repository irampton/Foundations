/** Versioned JSON save serialization with strict simulation-state validation. */

import { BASIC_RESOURCES, CATALOG, JOBS, RESOURCE_KEYS, TECHNOLOGY_IDS } from './catalog.js';
import { capacity, housing } from './simulation.js';

export const SAVE_LIMITS = Object.freeze({
  buildings: 10_000,
  workers: 10_000,
  coordinateMagnitude: 100_000,
});
const STATE_KEYS = Object.freeze([
  'version',
  'seconds',
  'seed',
  'rngState',
  'layoutVersion',
  'nextBuildingId',
  'nextWorkerId',
  'resources',
  'buildings',
  'workers',
  'technologies',
  'age',
  'corpses',
  'shortageSeconds',
  'nextStarvationAt',
  'burialWork',
  'healingWork',
  'occupiedGraves',
  'nextEventAt',
  'lastEvent',
]);

function fail(message) {
  throw new TypeError(`Invalid save: ${message}`);
}

function exactKeys(value, keys, label) {
  const actual = Object.keys(value).sort();
  const expected = [...keys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(`${label} has unexpected fields`);
  }
}

function own(object, key) {
  return Object.hasOwn(object, key);
}

function finiteNonnegative(value, label) {
  if (!Number.isFinite(value) || value < 0) fail(`${label} must be finite and nonnegative`);
}

function nonnegativeInteger(value, label) {
  if (!Number.isSafeInteger(value) || value < 0) fail(`${label} must be a nonnegative integer`);
}

export function validateState(state) {
  if (!state || typeof state !== 'object' || Array.isArray(state)) fail('root must be an object');
  exactKeys(state, STATE_KEYS, 'root');
  if (state.version !== 4 || state.layoutVersion !== 1) fail('unsupported version');
  nonnegativeInteger(state.age, 'age');
  if (state.age > 4) fail('invalid age');
  if (
    !Array.isArray(state.technologies) ||
    new Set(state.technologies).size !== state.technologies.length
  )
    fail('technologies must be a unique array');
  for (const technology of state.technologies)
    if (!TECHNOLOGY_IDS.includes(technology)) fail('unknown technology');
  nonnegativeInteger(state.seconds, 'seconds');
  if (!Number.isSafeInteger(state.seed)) fail('seed must be a safe integer');
  nonnegativeInteger(state.rngState, 'rngState');
  if (state.rngState > 0xffff_ffff) fail('rngState must be an unsigned 32-bit integer');
  nonnegativeInteger(state.corpses, 'corpses');
  nonnegativeInteger(state.shortageSeconds, 'shortageSeconds');
  nonnegativeInteger(state.nextStarvationAt, 'nextStarvationAt');
  if (state.nextStarvationAt < 30 || state.nextStarvationAt % 10 !== 0)
    fail('invalid starvation threshold');
  finiteNonnegative(state.burialWork, 'burialWork');
  finiteNonnegative(state.healingWork, 'healingWork');
  nonnegativeInteger(state.occupiedGraves, 'occupiedGraves');
  nonnegativeInteger(state.nextEventAt, 'nextEventAt');
  if (
    state.occupiedGraves >
    state.buildings?.filter?.((building) => building.type === 'graveyard').length * 100
  )
    fail('occupied graves exceed capacity');
  if (state.lastEvent !== null) {
    if (
      !state.lastEvent ||
      typeof state.lastEvent !== 'object' ||
      !['sickness', 'wolves'].includes(state.lastEvent.type)
    )
      fail('invalid last event');
    nonnegativeInteger(state.lastEvent.affected, 'lastEvent.affected');
    nonnegativeInteger(state.lastEvent.at, 'lastEvent.at');
    if (state.lastEvent.type === 'wolves')
      nonnegativeInteger(state.lastEvent.defended, 'lastEvent.defended');
  }
  nonnegativeInteger(state.nextBuildingId, 'nextBuildingId');
  nonnegativeInteger(state.nextWorkerId, 'nextWorkerId');

  if (!state.resources || typeof state.resources !== 'object' || Array.isArray(state.resources))
    fail('resources must be an object');
  exactKeys(state.resources, RESOURCE_KEYS, 'resources');
  for (const key of RESOURCE_KEYS) finiteNonnegative(state.resources[key], `resources.${key}`);

  if (!Array.isArray(state.buildings)) fail('buildings must be an array');
  if (state.buildings.length > SAVE_LIMITS.buildings) fail('too many buildings');
  const buildingIds = new Set();
  const coordinates = new Set();
  const storageBuildings = { barn: 0, woodStockpile: 0, stoneStockpile: 0 };
  let greatestBuildingId = 0;
  for (const building of state.buildings) {
    if (!building || typeof building !== 'object' || Array.isArray(building))
      fail('building must be an object');
    exactKeys(building, ['id', 'type', 'x', 'z', 'builtAt'], 'building');
    if (!Number.isSafeInteger(building.id) || building.id < 1 || buildingIds.has(building.id))
      fail('building IDs must be unique positive integers');
    if (typeof building.type !== 'string' || !own(CATALOG.buildings, building.type))
      fail('unknown building type');
    const requirement = CATALOG.buildings[building.type].requires;
    if (requirement && !state.technologies.includes(requirement))
      fail('building technology requirement is missing');
    if (!Number.isFinite(building.x) || !Number.isFinite(building.z))
      fail('building coordinates must be finite');
    if (
      Math.abs(building.x) > SAVE_LIMITS.coordinateMagnitude ||
      Math.abs(building.z) > SAVE_LIMITS.coordinateMagnitude
    )
      fail('building coordinates exceed world bounds');
    if (!Number.isFinite(building.builtAt) || building.builtAt > state.seconds)
      fail('invalid building seconds');
    const coordinate = `${building.x},${building.z}`;
    if (coordinates.has(coordinate)) fail('building coordinates must be unique');
    coordinates.add(coordinate);
    buildingIds.add(building.id);
    greatestBuildingId = Math.max(greatestBuildingId, building.id);
    if (own(storageBuildings, building.type)) storageBuildings[building.type] += 1;
  }
  if (state.nextBuildingId <= greatestBuildingId)
    fail('nextBuildingId is not ahead of existing IDs');
  if (Object.values(storageBuildings).some((count) => count < 1))
    fail('required starter storage is missing');

  if (!Array.isArray(state.workers)) fail('workers must be an array');
  if (state.workers.length > SAVE_LIMITS.workers) fail('too many workers');
  const workerIds = new Set();
  let greatestWorkerId = 0;
  for (const worker of state.workers) {
    if (!worker || typeof worker !== 'object' || Array.isArray(worker))
      fail('worker must be an object');
    exactKeys(worker, ['id', 'job', 'sick', 'sickSeconds'], 'worker');
    if (!Number.isSafeInteger(worker.id) || worker.id < 1 || workerIds.has(worker.id))
      fail('worker IDs must be unique positive integers');
    if (worker.job !== 'unemployed' && !JOBS.includes(worker.job)) fail('unknown worker job');
    if (typeof worker.sick !== 'boolean') fail('worker sickness must be boolean');
    nonnegativeInteger(worker.sickSeconds, 'worker.sickSeconds');
    if (!worker.sick && worker.sickSeconds !== 0) fail('healthy worker has sickness time');
    workerIds.add(worker.id);
    greatestWorkerId = Math.max(greatestWorkerId, worker.id);
  }
  if (state.nextWorkerId <= greatestWorkerId) fail('nextWorkerId is not ahead of existing IDs');
  if (state.workers.length > housing(state)) fail('workers exceed housing');
  for (const resource of BASIC_RESOURCES) {
    if (state.resources[resource] > capacity(state, resource))
      fail(`${resource} exceeds storage capacity`);
  }
  return state;
}

export function serialize(state) {
  validateState(state);
  return JSON.stringify(state);
}

export function deserialize(text) {
  if (typeof text !== 'string') fail('save data must be text');
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    fail('malformed JSON');
  }
  // Compatibility boundaries for both prototype save schemas.
  if (parsed?.version === 1 && Object.hasOwn(parsed, 'time') && !Object.hasOwn(parsed, 'seconds')) {
    const { time: seconds, ...legacy } = parsed;
    parsed = { ...legacy, version: 2, seconds };
  }
  if (parsed?.version === 2) {
    parsed = {
      ...parsed,
      version: 3,
      age: 0,
      technologies: [],
      resources: Object.fromEntries(
        RESOURCE_KEYS.map((key) => [key, parsed.resources?.[key] ?? 0]),
      ),
    };
  }
  if (parsed?.version === 3) {
    parsed = {
      ...parsed,
      version: 4,
      workers: parsed.workers.map((worker) => ({ ...worker, sick: false, sickSeconds: 0 })),
      burialWork: 0,
      healingWork: 0,
      occupiedGraves: 0,
      nextEventAt: Math.floor(parsed.seconds / 60 + 1) * 60,
      lastEvent: null,
    };
  }
  return validateState(parsed);
}
