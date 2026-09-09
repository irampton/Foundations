/** Unit tests for the pure layout and simulation-time behavior used by the Three.js settlement. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advanceDisplayTime,
  partitionBuildings,
  requiredTerrainRadius,
} from '../src/scene/layout.js';

test('display time interpolates discrete ticks and freezes while paused', () => {
  assert.equal(advanceDisplayTime(3, 4, 0.016, true, false), 3.016);
  assert.equal(advanceDisplayTime(3, 4, 0.016, true, true), 3);
  assert.equal(advanceDisplayTime(3.98, 4, 0.05, true, false), 4);
});

test('display time initializes and follows a reloaded earlier save', () => {
  assert.equal(advanceDisplayTime(0, 40, 0.016, false, false), 40);
  assert.equal(advanceDisplayTime(40, 7, 0.016, true, false), 7);
  assert.equal(advanceDisplayTime(40, 7, 0.016, true, true), 7);
});

test('building partition reports overflow without mutating input', () => {
  const buildings = Array.from({ length: 5 }, (_, id) => ({ id }));
  const result = partitionBuildings(buildings, 3);
  assert.deepEqual(
    result.visible.map(({ id }) => id),
    [0, 1, 2],
  );
  assert.equal(result.overflow, 2);
  assert.equal(buildings.length, 5);
});

test('terrain radius includes distant buildings and respects its minimum', () => {
  assert.equal(requiredTerrainRadius([], 24, 8), 24);
  assert.equal(requiredTerrainRadius([{ x: 3, z: 4 }], 4, 3), 8);
});
