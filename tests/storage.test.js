/** Browser-storage adapter tests using isolated, failure-injectable in-memory history. */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../src/game/simulation.js';
import { listSaves, readSave, saveGame } from '../src/game/storage.js';

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

test('autosaves replace one play-session record', () => {
  const storage = new MemoryStorage();
  const id = saveGame(createGame(11), 'Oak Vale', null, storage);
  saveGame(createGame(12), 'Oak Vale', id, storage);
  assert.equal(listSaves(storage).saves.length, 1);
  assert.equal(readSave(id, storage).state.seed, 12);
});

test('loading into a new session creates chronological history', () => {
  const storage = new MemoryStorage();
  const first = saveGame(createGame(1), 'First', null, storage);
  const loaded = readSave(first, storage);
  const second = saveGame(loaded.state, loaded.name, null, storage);
  assert.notEqual(second, first);
  assert.deepEqual(
    listSaves(storage).saves.map(({ name }) => name),
    ['First', 'First'],
  );
});

test('a corrupt primary recovers from a validated backup', () => {
  const storage = new MemoryStorage();
  const id = saveGame(createGame(1), 'Old', null, storage);
  saveGame(createGame(2), 'New', id, storage);
  storage.values.set('foundations.saves', 'broken json');
  const history = listSaves(storage);
  assert.equal(history.recovered, true);
  assert.equal(history.saves[0].state.seed, 1);
});

test('invalid state never replaces valid history', () => {
  const storage = new MemoryStorage();
  const id = saveGame(createGame(7), 'Safe', null, storage);
  const before = storage.getItem('foundations.saves');
  const invalid = createGame(8);
  invalid.resources.food = -1;
  assert.throws(() => saveGame(invalid, 'Bad', id, storage), /Invalid save/);
  assert.equal(storage.getItem('foundations.saves'), before);
});

test('quota failure preserves valid history', () => {
  const storage = new MemoryStorage();
  const id = saveGame(createGame(21), 'Existing', null, storage);
  const before = storage.getItem('foundations.saves');
  storage.failKey = 'foundations.saves';
  assert.throws(() => saveGame(createGame(22), 'Replacement', id, storage), {
    name: 'QuotaExceededError',
  });
  assert.equal(storage.getItem('foundations.saves'), before);
});

test('legacy slots migrate into chronological save history', () => {
  const storage = new MemoryStorage();
  storage.setItem(
    'foundations.slot.2',
    JSON.stringify({
      name: 'Old Town',
      savedSeconds: 123,
      game: JSON.stringify(createGame(42)),
    }),
  );
  const history = listSaves(storage);
  assert.equal(history.saves[0].name, 'Old Town');
  assert.equal(history.saves[0].state.seed, 42);
  assert.ok(storage.getItem('foundations.saves'));
});
