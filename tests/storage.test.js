/** Browser-storage adapter tests using isolated, failure-injectable in-memory slots. */

import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/game/simulation.js';
import { listSlots, readSlot, saveSlot } from '../src/game/storage.js';

class MemoryStorage {
  constructor() {
    this.values = new Map();
    this.failKey = null;
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  setItem(key, value) {
    if (key === this.failKey) {
      const error = new Error('Storage quota exceeded');
      error.name = 'QuotaExceededError';
      throw error;
    }
    this.values.set(key, String(value));
  }
}

test('three save slots remain isolated', () => {
  const storage = new MemoryStorage();
  const first = createGame(11);
  const third = createGame(33);
  saveSlot(1, first, 'First', storage);
  saveSlot(3, third, 'Third', storage);
  assert.equal(readSlot(1, storage).state.seed, 11);
  assert.equal(readSlot(2, storage), null);
  assert.equal(readSlot(3, storage).state.seed, 33);
  assert.deepEqual(
    listSlots(storage).map(({ data }) => data?.name ?? null),
    ['First', null, 'Third'],
  );
});

test('a corrupt primary recovers only from a validated backup', () => {
  const storage = new MemoryStorage();
  saveSlot(1, createGame(1), 'Old', storage);
  saveSlot(1, createGame(2), 'New', storage);
  storage.values.set('foundations.slot.1', 'broken json');
  const recovered = readSlot(1, storage);
  assert.equal(recovered.recovered, true);
  assert.equal(recovered.state.seed, 1);

  storage.values.set(
    'foundations.slot.1.backup',
    JSON.stringify({ name: 'Fake', savedAt: new Date().toISOString(), game: '{}' }),
  );
  assert.throws(() => readSlot(1, storage), /Invalid save/);
});

test('invalid state never replaces an existing valid slot', () => {
  const storage = new MemoryStorage();
  saveSlot(1, createGame(7), 'Safe', storage);
  const before = storage.getItem('foundations.slot.1');
  const invalid = createGame(8);
  invalid.resources.food = -1;
  assert.throws(() => saveSlot(1, invalid, 'Bad', storage), /Invalid save/);
  assert.equal(storage.getItem('foundations.slot.1'), before);
  assert.equal(readSlot(1, storage).state.seed, 7);
});

test('quota failure preserves the valid primary snapshot', () => {
  const storage = new MemoryStorage();
  saveSlot(2, createGame(21), 'Existing', storage);
  const before = storage.getItem('foundations.slot.2');
  storage.failKey = 'foundations.slot.2';
  assert.throws(() => saveSlot(2, createGame(22), 'Replacement', storage), {
    name: 'QuotaExceededError',
  });
  assert.equal(storage.getItem('foundations.slot.2'), before);
  assert.equal(readSlot(2, storage).state.seed, 21);
});
