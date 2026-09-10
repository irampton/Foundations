/** Deterministic, one-second simulation and atomic player economy actions. */

import { BASIC_RESOURCES, CATALOG, JOBS } from './catalog.js';
import { nextPosition } from './placement.js';

const STARTING_BUILDINGS = Object.freeze([
  ['barn', -8, 0],
  ['woodStockpile', 0, 8],
  ['stoneStockpile', 8, 0],
]);
const DEATH_ORDER = Object.freeze(['unemployed', 'miner', 'woodcutter', 'farmer']);

function validQuantity(quantity) {
  return Number.isSafeInteger(quantity) && quantity > 0;
}

function result(ok, message, extra = {}) {
  return { ok, message, ...extra };
}

function buildingCost(type, quantity) {
  return Object.fromEntries(
    Object.entries(CATALOG.buildings[type].cost).map(([resource, amount]) => [
      resource,
      amount * quantity,
    ]),
  );
}

function canAfford(state, cost) {
  return Object.entries(cost).every(([resource, amount]) => state.resources[resource] >= amount);
}

export function createGame(seed = 1) {
  if (!Number.isSafeInteger(seed)) throw new TypeError('Seed must be a safe integer');
  return {
    version: 2,
    seconds: 0,
    seed,
    rngState: seed >>> 0,
    layoutVersion: 1,
    nextBuildingId: 4,
    nextWorkerId: 1,
    resources: { food: 200, wood: 200, stone: 200, skins: 0 },
    buildings: STARTING_BUILDINGS.map(([type, x, z], index) => ({
      id: index + 1,
      type,
      x,
      z,
      builtAt: -10,
    })),
    workers: [],
    corpses: 0,
    shortageSeconds: 0,
    nextStarvationAt: 30,
  };
}

export function housing(state) {
  return state.buildings.reduce(
    (total, building) => total + (CATALOG.buildings[building.type]?.housing ?? 0),
    0,
  );
}

export function capacity(state, resource) {
  if (!BASIC_RESOURCES.includes(resource)) return Infinity;
  return state.buildings.reduce(
    (total, building) => total + (CATALOG.buildings[building.type]?.storage?.[resource] ?? 0),
    0,
  );
}

export function jobCount(state, job) {
  return state.workers.reduce((count, worker) => count + Number(worker.job === job), 0);
}

export function unemployed(state) {
  return jobCount(state, 'unemployed');
}

export function happiness(state) {
  const population = state.workers.length;
  const homes = housing(state);
  if (population === 0 || homes === 0) return 100;
  const crowding = 50 * Math.max(0, (population / homes - 0.8) / 0.2);
  return Math.max(0, Math.min(100, 100 - crowding));
}

export function rates(state) {
  const multiplier = 0.5 + happiness(state) / 200;
  const consumption = state.workers.length * 0.1;
  const foodGross = jobCount(state, 'farmer') * 0.2 * multiplier;
  const woodGross = jobCount(state, 'woodcutter') * 0.2 * multiplier;
  const stoneGross = jobCount(state, 'miner') * 0.2 * multiplier;
  return {
    food: { gross: foodGross, consumption, net: foodGross - consumption },
    wood: { gross: woodGross, consumption: 0, net: woodGross },
    stone: { gross: stoneGross, consumption: 0, net: stoneGross },
  };
}

export function gather(state, resource) {
  if (!BASIC_RESOURCES.includes(resource))
    return result(false, 'That resource cannot be gathered manually');
  const room = capacity(state, resource) - state.resources[resource];
  if (room <= 0) return result(false, `${CATALOG.resources[resource].label} storage is full`);
  const amount = Math.min(1, room);
  state.resources[resource] += amount;
  return result(true, `Gathered ${amount} ${resource}`, { amount });
}

export function build(state, type, quantity = 1) {
  if (!Object.hasOwn(CATALOG.buildings, type)) return result(false, 'Unknown building type');
  const definition = CATALOG.buildings[type];
  if (!definition) return result(false, 'Unknown building type');
  if (!validQuantity(quantity)) return result(false, 'Quantity must be a positive integer');
  if (state.buildings.length + quantity > 10000)
    return result(false, 'This prototype supports up to 10,000 buildings');
  if (!definition.available) return result(false, definition.lockedReason);
  const cost = buildingCost(type, quantity);
  if (!canAfford(state, cost)) return result(false, 'Insufficient resources');

  for (const [resource, amount] of Object.entries(cost)) state.resources[resource] -= amount;
  const built = [];
  for (let index = 0; index < quantity; index += 1) {
    const [x, z] = nextPosition(state.buildings);
    const building = { id: state.nextBuildingId++, type, x, z, builtAt: state.seconds };
    state.buildings.push(building);
    built.push(building);
  }
  return result(true, `Built ${quantity} ${definition.label}`, { buildings: built, cost });
}

export function createWorkers(state, quantity = 1) {
  if (!validQuantity(quantity)) return result(false, 'Quantity must be a positive integer');
  if (state.workers.length + quantity > 10000)
    return result(false, 'This prototype supports up to 10,000 workers');
  const cost = quantity * 20;
  if (state.resources.food < cost) return result(false, 'Insufficient food');
  if (state.workers.length + quantity > housing(state))
    return result(false, 'Insufficient housing');
  state.resources.food -= cost;
  const workers = [];
  for (let index = 0; index < quantity; index += 1) {
    const worker = { id: state.nextWorkerId++, job: 'unemployed' };
    state.workers.push(worker);
    workers.push(worker);
  }
  return result(true, `Created ${quantity} worker${quantity === 1 ? '' : 's'}`, { workers, cost });
}

export function assign(state, job, signedQuantity) {
  if (!JOBS.includes(job)) return result(false, 'Unknown job');
  if (!Number.isSafeInteger(signedQuantity) || signedQuantity === 0) {
    return result(false, 'Assignment quantity must be a nonzero integer');
  }
  const sourceJob = signedQuantity > 0 ? 'unemployed' : job;
  const targetJob = signedQuantity > 0 ? job : 'unemployed';
  const requested = Math.abs(signedQuantity);
  const candidates = state.workers.filter((worker) => worker.job === sourceJob);
  const amount = Math.min(requested, candidates.length);
  for (let index = 0; index < amount; index += 1) candidates[index].job = targetJob;
  return result(
    true,
    amount ? `Reassigned ${amount} worker${amount === 1 ? '' : 's'}` : 'No workers available',
    { amount },
  );
}

function killWorker(state) {
  for (const job of DEATH_ORDER) {
    const index = state.workers.findIndex((worker) => worker.job === job);
    if (index >= 0) {
      const [worker] = state.workers.splice(index, 1);
      state.corpses += 1;
      return worker;
    }
  }
  return null;
}

export function tick(state) {
  const currentRates = rates(state);
  state.resources.wood = Math.min(
    capacity(state, 'wood'),
    state.resources.wood + currentRates.wood.gross,
  );
  state.resources.stone = Math.min(
    capacity(state, 'stone'),
    state.resources.stone + currentRates.stone.gross,
  );

  const availableFood = state.resources.food + currentRates.food.gross;
  if (availableFood >= currentRates.food.consumption) {
    state.resources.food = Math.min(
      capacity(state, 'food'),
      availableFood - currentRates.food.consumption,
    );
    state.shortageSeconds = 0;
    state.nextStarvationAt = 30;
  } else {
    state.resources.food = 0;
    state.shortageSeconds += 1;
    if (state.workers.length && state.shortageSeconds >= state.nextStarvationAt) {
      killWorker(state);
      state.nextStarvationAt += 10;
    }
  }
  state.seconds += 1;
  return { rates: currentRates };
}
