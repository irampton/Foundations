/** Fixed-step clock tests for foreground elapsed time. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createClock } from '../src/game/clock.js';

test('accumulates fractional seconds into deterministic one-second ticks', () => {
  const clock = createClock();
  assert.deepEqual(clock.advance(0, false), { ticks: 0, delta: 0 });
  assert.deepEqual(clock.advance(200, false), { ticks: 0, delta: 0.2 });
  assert.deepEqual(clock.advance(400, false), { ticks: 0, delta: 0.2 });
  assert.deepEqual(clock.advance(600, false), { ticks: 0, delta: 0.2 });
  assert.deepEqual(clock.advance(800, false), { ticks: 0, delta: 0.2 });
  assert.deepEqual(clock.advance(1000, false), { ticks: 1, delta: 0.2 });
});

test('paused time is excluded from elapsed production', () => {
  const clock = createClock();
  clock.advance(0, false);
  assert.deepEqual(clock.advance(1000, true), { ticks: 0, delta: 0 });
  assert.deepEqual(clock.advance(1200, false), { ticks: 0, delta: 0.2 });
  assert.deepEqual(clock.advance(1400, false), { ticks: 0, delta: 0.2 });
  assert.deepEqual(clock.advance(1600, false), { ticks: 0, delta: 0.2 });
  assert.deepEqual(clock.advance(1800, false), { ticks: 0, delta: 0.2 });
  assert.deepEqual(clock.advance(2000, false), { ticks: 1, delta: 0.2 });
});

test('reset discards the idle or closed gap', () => {
  const clock = createClock();
  clock.advance(100, false);
  clock.reset();
  assert.deepEqual(clock.advance(100000, false), { ticks: 0, delta: 0 });
  assert.deepEqual(clock.advance(100250, false), { ticks: 0, delta: 0.25 });
  assert.deepEqual(clock.advance(100500, false), { ticks: 0, delta: 0.25 });
  assert.deepEqual(clock.advance(100750, false), { ticks: 0, delta: 0.25 });
  assert.deepEqual(clock.advance(101000, false), { ticks: 1, delta: 0.25 });
});

test('long foreground stalls are clamped to a quarter second', () => {
  const clock = createClock();
  clock.advance(0, false);
  assert.deepEqual(clock.advance(10000, false), { ticks: 0, delta: 0.25 });
});

test('backward timestamps do not advance the clock', () => {
  const clock = createClock();
  clock.advance(1000, false);
  assert.deepEqual(clock.advance(500, false), { ticks: 0, delta: 0 });
});
