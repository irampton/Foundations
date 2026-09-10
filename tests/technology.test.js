/** Coverage for the complete five-Age technology and advanced economy catalog. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CATALOG, TECHNOLOGY_IDS } from '../src/game/catalog.js';
import {
  assign,
  build,
  buildingCost,
  capacity,
  createGame,
  createWorkers,
  gatherYield,
  housing,
  rates,
  research,
  tick,
} from '../src/game/simulation.js';

const fund = (state, amount = 1_000_000) => {
  for (const key of Object.keys(state.resources)) state.resources[key] = amount;
};
const buy = (state, ids) => {
  for (const id of ids) assert.equal(research(state, id).ok, true, id);
};

test('catalog contains every documented economic technology and building', () => {
  assert.equal(TECHNOLOGY_IDS.length, 30);
  for (const id of ['masonry', 'writing', 'construction', 'architecture', 'civilService', 'serfs'])
    assert.ok(CATALOG.technologies[id]);
  for (const id of [
    'cottage',
    'house',
    'mansion',
    'tannery',
    'smithy',
    'apothecary',
    'temple',
    'library',
    'graveyard',
    'mill',
  ])
    assert.ok(CATALOG.buildings[id]);
});

test('Age gates and prerequisites are enforced and advancement unlocks buildings', () => {
  const state = createGame();
  fund(state);
  assert.match(research(state, 'construction').message, /Village Age/);
  buy(state, ['masonry']);
  assert.equal(state.age, 1);
  assert.equal(build(state, 'cottage').ok, true);
  assert.match(research(state, 'construction').message, /Writing/);
  buy(state, ['writing', 'construction']);
  assert.equal(state.age, 2);
  assert.equal(build(state, 'house').ok, true);
  buy(state, ['architecture']);
  assert.equal(state.age, 3);
  assert.equal(build(state, 'mansion').ok, true);
  buy(state, ['civilService']);
  assert.equal(state.age, 4);
});

test('Worship additionally requires a Temple', () => {
  const state = createGame();
  fund(state);
  buy(state, ['masonry']);
  assert.match(research(state, 'worship').message, /Temple/);
  build(state, 'temple');
  assert.equal(research(state, 'worship').ok, true);
});

test('technology effects apply retroactively to housing, storage, clicks, and production', () => {
  const state = createGame();
  fund(state);
  buy(state, ['masonry', 'writing', 'construction']);
  build(state, 'house');
  assert.equal(housing(state), 10);
  buy(state, ['tenements', 'slums', 'granaries']);
  assert.equal(housing(state), 14);
  assert.equal(capacity(state, 'food'), 400);
  buy(state, ['architecture', 'civilService', 'feudalism']);
  assert.equal(gatherYield(state), 3);
  state.workers = Array.from({ length: 100 }, (_, i) => ({ id: i + 1, job: 'unemployed' }));
  state.nextWorkerId = 101;
  buy(state, ['serfs']);
  assert.equal(gatherYield(state), 4);
});

test('advanced job capacity, fractional conversion, science, and secondary multipliers work', () => {
  const state = createGame();
  fund(state);
  buy(state, ['skinning', 'harvesting', 'prospecting', 'masonry']);
  build(state, 'cottage', 2);
  createWorkers(state, 7);
  assign(state, 'farmer', 2);
  assign(state, 'woodcutter', 1);
  assign(state, 'miner', 1);
  build(state, 'tannery');
  build(state, 'smithy');
  assert.equal(assign(state, 'tanner', 10).amount, 1);
  assert.equal(assign(state, 'blacksmith', 10).amount, 1);
  const before = { skins: state.resources.skins, ore: state.resources.ore };
  tick(state);
  assert.ok(state.resources.leather > 0.09);
  assert.ok(state.resources.metal > 0.09);
  assert.ok(state.resources.skins < before.skins);
  assert.ok(state.resources.ore < before.ore);
  buy(state, ['writing']);
  build(state, 'library');
  assign(state, 'librarian', 1);
  assert.equal(rates(state).science.gross, 0.1);
});

test('Mill prices scale per individual building and bulk cost sums rounded prices', () => {
  const state = createGame();
  fund(state);
  buy(state, ['masonry', 'wheel']);
  assert.deepEqual(buildingCost(state, 'mill', 2), { wood: 310, stone: 310 });
  build(state, 'mill');
  assert.deepEqual(buildingCost(state, 'mill'), { wood: 210, stone: 210 });
});
