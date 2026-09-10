// Street connectivity, farm scaling, and immediate two-second building arrivals.
import test from 'node:test';
import assert from 'node:assert/strict';
import { roadSegments } from '../src/scene/roads.js';
import { farmLayout } from '../src/scene/farms.js';
import { plopPose, advanceArrivalSeconds } from '../src/scene/plop.js';
import { createGame, build } from '../src/game/simulation.js';

test('streets form a connected orthogonal grid without crossing building footprints', () => {
  const state = createGame();
  build(state, 'tent', 50);
  const roads = roadSegments(state.buildings);
  const neighbors = new Map();
  for (const { a, b } of roads) {
    assert.ok(a[0] === b[0] || a[1] === b[1]);
    for (const [u, v] of [
      [a, b],
      [b, a],
    ]) {
      const key = u.join(',');
      if (!neighbors.has(key)) neighbors.set(key, []);
      neighbors.get(key).push(v.join(','));
    }
    for (const building of state.buildings) {
      const x = Math.max(Math.min(building.x, Math.max(a[0], b[0])), Math.min(a[0], b[0]));
      const z = Math.max(Math.min(building.z, Math.max(a[1], b[1])), Math.min(a[1], b[1]));
      assert.ok(Math.hypot(x - building.x, z - building.z) >= 1.8);
    }
  }
  const queue = [neighbors.keys().next().value],
    seen = new Set(queue);
  for (const vertex of queue)
    for (const next of neighbors.get(vertex))
      if (!seen.has(next)) {
        seen.add(next);
        queue.push(next);
      }
  assert.equal(seen.size, neighbors.size);
  assert.equal(
    new Set(roads.map(({ a, b }) => [a.join(','), b.join(',')].sort().join('|'))).size,
    roads.length,
  );
});

test('farms are absent without farmers, grow with assignments, and stay clear of buildings', () => {
  const state = createGame();
  build(state, 'tent', 50);
  assert.deepEqual(farmLayout(0, state.buildings), []);
  assert.ok(farmLayout(4, state.buildings)[0].size > farmLayout(1, state.buildings)[0].size);
  assert.equal(farmLayout(8, state.buildings).length, 2);
  const plots = farmLayout(10000, state.buildings);
  assert.equal(plots.length, 24);
  assert.equal(
    plots.reduce((sum, plot) => sum + plot.workers, 0),
    10000,
  );
  for (const plot of plots)
    for (const building of state.buildings) assert.ok(plot.x - plot.size / 2 > building.x + 2);
  const roads = roadSegments(state.buildings, plots);
  for (const { a, b } of roads)
    for (const plot of plots) {
      const x = Math.max(Math.min(plot.x, Math.max(a[0], b[0])), Math.min(a[0], b[0]));
      const z = Math.max(Math.min(plot.z, Math.max(a[1], b[1])), Math.min(a[1], b[1]));
      assert.ok(Math.abs(x - plot.x) >= plot.size / 2 || Math.abs(z - plot.z) >= plot.size / 2);
    }
});

test('plop begins fully visible immediately, squashes on landing, and settles by two seconds', () => {
  assert.equal(plopPose(0).y, 1);
  assert.ok(plopPose(0).lift > 0);
  assert.ok(plopPose(0.25).y < 1);
  assert.ok(plopPose(0.25).xz > 1);
  assert.deepEqual(plopPose(2), { lift: 0, xz: 1, y: 1 });
  assert.deepEqual(plopPose(0, true), plopPose(2));
  assert.equal(advanceArrivalSeconds(0, 0.016, false), 0.016);
  assert.equal(advanceArrivalSeconds(0.4, 0.1, true), 0.4);
});
