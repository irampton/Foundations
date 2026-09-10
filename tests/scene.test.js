// Pure rendering bounds and aggregation tests.
import test from 'node:test';
import assert from 'node:assert/strict';
import { partitionBuildings, requiredTerrainRadius } from '../src/scene/layout.js';
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
