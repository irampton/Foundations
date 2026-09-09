/** Placement tests for centered, collision-free four-unit plots. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/game/simulation.js';
import { nextPosition } from '../src/game/placement.js';

test('first placement is near the center and leaves the crossroads open', () => {
  const position = nextPosition(createGame().buildings);
  assert.notDeepEqual(position, [0, 0]);
  assert.ok(Math.max(...position.map(Math.abs)) <= 4);
});

test('starter storage supports more than 200 unique placements', () => {
  const buildings = createGame().buildings.map(({ x, z }) => ({ x, z }));
  const positions = [];
  for (let index = 0; index < 201; index += 1) {
    const [x, z] = nextPosition(buildings);
    positions.push([x, z]);
    buildings.push({ x, z });
  }
  assert.equal(new Set(positions.map(([x, z]) => `${x},${z}`)).size, 201);
});

test('placements maintain at least four units of spacing', () => {
  const buildings = createGame().buildings.map(({ x, z }) => ({ x, z }));
  for (let index = 0; index < 80; index += 1) {
    const [x, z] = nextPosition(buildings);
    for (const building of buildings) {
      const distance = Math.hypot(x - building.x, z - building.z);
      assert.ok(
        distance >= 4,
        `${x},${z} is only ${distance} units from ${building.x},${building.z}`,
      );
    }
    buildings.push({ x, z });
  }
});
