/** Unit coverage for the bounded startup economy and save boundary. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, RESOURCE_KEYS } from '../src/game/catalog.js';
import {
  assign,
  build,
  capacity,
  createGame,
  createWorkers,
  gather,
  happiness,
  housing,
  jobCount,
  rates,
  research,
  buildingCost,
  gatherYield,
  tick,
  unemployed,
} from '../src/game/simulation.js';
import { deserialize, SAVE_LIMITS, serialize } from '../src/game/save.js';

test('new games have deterministic storage and separated starter buildings', () => {
  const state = createGame(42);
  assert.deepEqual(
    state.resources,
    Object.fromEntries(
      RESOURCE_KEYS.map((key) => [key, ['food', 'wood', 'stone'].includes(key) ? 200 : 0]),
    ),
  );
  assert.equal(capacity(state, 'food'), 200);
  assert.equal(capacity(state, 'wood'), 200);
  assert.equal(capacity(state, 'stone'), 200);
  assert.equal(new Set(state.buildings.map(({ x, z }) => `${x},${z}`)).size, 3);
  assert.equal(housing(state), 0);
});

test('manual gathering respects capacity', () => {
  const state = createGame();
  assert.equal(gather(state, 'wood').ok, false);
  state.resources.wood = 199.5;
  assert.equal(gather(state, 'wood').amount, 0.5);
  assert.equal(state.resources.wood, 200);
  assert.equal(gather(state, 'skins').ok, false);
});

test('tents provide housing and workers cost food', () => {
  const state = createGame();
  assert.deepEqual(CATALOG.buildings.tent.cost, { skins: 2, wood: 2 });
  state.resources.skins = 14;
  assert.equal(build(state, 'tent', 2).ok, true);
  assert.equal(housing(state), 2);
  assert.equal(createWorkers(state, 2).ok, true);
  assert.equal(state.resources.food, 160);
  assert.equal(unemployed(state), 2);
  assert.equal(createWorkers(state).ok, false);
});

test('invalid and unaffordable purchases are atomic', () => {
  const state = createGame();
  state.resources.skins = 6;
  const before = structuredClone(state);
  assert.equal(build(state, 'tent', 101).ok, false);
  assert.deepEqual(state, before);
  assert.equal(build(state, 'cottage').ok, false);
  assert.deepEqual(state, before);
  assert.equal(build(state, 'tent', 1.5).ok, false);
  assert.deepEqual(state, before);
  assert.equal(build(state, 'hut', 100).ok, false);
  assert.deepEqual(state, before);
});

test('job changes clamp to idle and current workers', () => {
  const state = createGame();
  state.resources.skins = 14;
  build(state, 'tent', 3);
  createWorkers(state, 3);
  assert.equal(assign(state, 'farmer', 9).amount, 3);
  assert.equal(jobCount(state, 'farmer'), 3);
  assert.equal(assign(state, 'farmer', -2).amount, 2);
  assert.equal(unemployed(state), 2);
  assert.equal(assign(state, 'not-a-job', 1).ok, false);
  assert.equal(assign(state, 'miner', 0).ok, false);
});

test('production, upkeep, fractions, and crowding follow one-second rules', () => {
  const state = createGame();
  state.resources.skins = 14;
  build(state, 'tent', 7);
  createWorkers(state, 5);
  assign(state, 'farmer', 4);
  assert.equal(happiness(state), 100);
  assert.deepEqual(rates(state).food, { gross: 0.8, consumption: 0.5, net: 0.30000000000000004 });
  tick(state);
  assert.equal(state.resources.food, 100.3);

  let tentsKept = 0;
  state.buildings = state.buildings.filter((building) => {
    if (building.type !== 'tent') return true;
    tentsKept += 1;
    return tentsKept <= 5;
  });
  assert.equal(housing(state), 5);
  assert.ok(Math.abs(happiness(state) - 50) < 1e-9);
  assert.ok(Math.abs(rates(state).food.gross - 0.6) < 1e-9);
});

test('empty food immediately kills workers beyond current gross production support', () => {
  const state = createGame();
  state.resources.skins = 10;
  build(state, 'tent', 5);
  createWorkers(state, 5);
  assign(state, 'farmer', 2);
  state.resources.food = 0;
  tick(state);
  assert.equal(state.workers.length, 3);
  assert.equal(state.corpses, 2);
  assert.equal(state.resources.food, 0);
});

test('new storage applies immediately and placement remains collision-free', () => {
  const state = createGame();
  state.resources.wood = 200;
  assert.equal(build(state, 'woodStockpile').ok, true);
  assert.equal(capacity(state, 'wood'), 400);
  assert.equal(gather(state, 'wood').ok, true);
  build(state, 'tent', 20);
  assert.equal(
    new Set(state.buildings.map(({ x, z }) => `${x},${z}`)).size,
    state.buildings.length,
  );
});

test('save round trips and rejects malformed or inconsistent state', () => {
  const state = createGame(987);
  state.resources.skins = 4;
  build(state, 'tent', 2);
  createWorkers(state, 1);
  assign(state, 'miner', 1);
  tick(state);
  assert.deepEqual(deserialize(serialize(state)), state);
  assert.throws(() => deserialize('{'), /malformed JSON/);
  const invalid = structuredClone(state);
  invalid.resources.wood = Infinity;
  assert.throws(() => serialize(invalid), /finite and nonnegative/);
  const duplicate = structuredClone(state);
  duplicate.buildings[1].id = duplicate.buildings[0].id;
  assert.throws(() => deserialize(JSON.stringify(duplicate)), /unique/);
  const futureBuilding = structuredClone(state);
  futureBuilding.buildings.push({ id: 99, type: 'cottage', x: 99, z: 99, builtAt: 0 });
  futureBuilding.nextBuildingId = 100;
  assert.throws(() => deserialize(JSON.stringify(futureBuilding)), /technology requirement/);
});

test('save validation rejects inherited catalog keys', () => {
  for (const type of ['__proto__', 'constructor']) {
    const state = createGame();
    state.buildings.push({ id: state.nextBuildingId++, type, x: 20, z: 20, builtAt: 0 });
    assert.throws(() => serialize(state), /unknown building type|not implemented/);
  }
});

test('save validation bounds untrusted map data and requires starter storage', () => {
  const hugeCoordinate = createGame();
  hugeCoordinate.buildings[0].x = SAVE_LIMITS.coordinateMagnitude + 1;
  assert.throws(() => deserialize(JSON.stringify(hugeCoordinate)), /world bounds/);

  const missingStorage = createGame();
  missingStorage.buildings.shift();
  assert.throws(() => serialize(missingStorage), /starter storage/);

  const tooMany = createGame();
  tooMany.buildings = Array.from({ length: SAVE_LIMITS.buildings + 1 }, (_, index) => ({
    id: index + 1,
    type: 'tent',
    x: index,
    z: 0,
    builtAt: 0,
  }));
  assert.throws(() => serialize(tooMany), /too many buildings/);
});
