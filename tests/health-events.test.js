/** Death, disease, healing, burial, and wolf-event behavior. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assign,
  build,
  createGame,
  createWorkers,
  graveCapacity,
  research,
  sickCount,
  sicknessSpreadChance,
  tick,
  triggerRandomEvent,
} from '../src/game/simulation.js';

function prepare(count = 12) {
  const s = createGame(123);
  for (const key of Object.keys(s.resources)) s.resources[key] = 100000;
  research(s, 'masonry');
  build(s, 'cottage', Math.ceil(count / 6));
  createWorkers(s, count);
  s.nextEventAt = 1e9;
  return s;
}

test('sick workers leave jobs and produce nothing', () => {
  const s = prepare(2);
  assign(s, 'farmer', 2);
  triggerRandomEvent(s, 'sickness');
  assert.equal(sickCount(s), 1);
  assert.equal(s.workers.filter((w) => w.job === 'farmer').length, 1);
});

test('Apothecaries spend Herbs to cure accumulated sickness work', () => {
  const s = prepare(3);
  build(s, 'apothecary');
  triggerRandomEvent(s, 'sickness');
  assign(s, 'apothecary', 1);
  const herbs = s.resources.herbs;
  for (let i = 0; i < 10; i++) tick(s);
  assert.equal(sickCount(s), 0);
  assert.equal(s.resources.herbs, herbs - 1);
});

test('Clerics require free Graveyard capacity to bury corpses', () => {
  const s = prepare(2);
  build(s, 'temple');
  assign(s, 'cleric', 1);
  s.corpses = 2;
  for (let i = 0; i < 10; i++) tick(s);
  assert.equal(s.corpses, 2);
  build(s, 'graveyard');
  assert.equal(graveCapacity(s), 100);
  for (let i = 0; i < 10; i++) tick(s);
  assert.equal(s.corpses, 1);
  assert.equal(s.occupiedGraves, 1);
});

test('unburied corpses sharply increase disease spread chance', () => {
  const s = prepare(20);
  triggerRandomEvent(s, 'sickness');
  const clean = sicknessSpreadChance(s);
  s.corpses = 20;
  assert.ok(sicknessSpreadChance(s) >= clean + 0.19);
});

test('Soldiers are the only defense against wolf casualties', () => {
  const undefended = prepare(20);
  const before = undefended.workers.length;
  const event = triggerRandomEvent(undefended, 'wolves');
  assert.equal(before - undefended.workers.length, event.affected);
  assert.ok(event.affected > 0);
  const defended = prepare(20);
  assign(defended, 'soldier', 20);
  const guarded = triggerRandomEvent(defended, 'wolves');
  assert.equal(guarded.affected, 0);
  assert.equal(defended.workers.length, 20);
});
