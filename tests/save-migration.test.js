// Seconds-only saves must preserve settlements created before the field rename.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame, tick } from '../src/game/simulation.js';
import { deserialize } from '../src/game/save.js';
test('legacy seconds counters migrate without changing resources, buildings, or workers', () => {
  const current = createGame();
  tick(current);
  const { seconds, ...old } = current;
  const legacy = { ...old, version: 1, time: seconds };
  assert.deepEqual(deserialize(JSON.stringify(legacy)), current);
  assert.throws(() => deserialize(JSON.stringify({ ...legacy, seconds: 10 })), /unexpected fields/);
});
