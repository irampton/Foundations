// Browser persistence adapter: three isolated slots, validated snapshots, and one backup per slot.
import { serialize, deserialize } from './save.js';

const key = (slot) => `foundations.slot.${slot}`;
const validSlot = (slot) => {
  if (![1, 2, 3].includes(slot)) throw new Error('Choose a save slot from 1 to 3.');
};

function exactKeys(value, expected) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
  const actual = Object.keys(value).sort();
  const wanted = [...expected].sort();
  return actual.length === wanted.length && actual.every((field, index) => field === wanted[index]);
}

function decode(text) {
  if (!text) return null;
  const envelope = JSON.parse(text);
  // Read the old date-based metadata only at the compatibility boundary.
  if (exactKeys(envelope, ['name', 'savedAt', 'game'])) {
    envelope.savedSeconds = Date.parse(envelope.savedAt) / 1000;
    delete envelope.savedAt;
  }
  if (!exactKeys(envelope, ['name', 'savedSeconds', 'game'])) throw new Error('Invalid save slot.');
  if (typeof envelope.name !== 'string' || [...envelope.name].length > 60 || !envelope.name.trim())
    throw new Error('Invalid save slot.');
  if (!Number.isFinite(envelope.savedSeconds) || envelope.savedSeconds < 0)
    throw new Error('Invalid save slot.');
  if (typeof envelope.game !== 'string') throw new Error('Invalid save slot.');
  return { ...envelope, state: deserialize(envelope.game) };
}

export function readSlot(slot, storage = localStorage) {
  validSlot(slot);
  const primary = storage.getItem(key(slot));
  try {
    const decoded = decode(primary);
    if (decoded) return decoded;
  } catch {
    /* A corrupt primary can be recovered from the last validated snapshot. */
  }
  const backup = decode(storage.getItem(`${key(slot)}.backup`));
  if (backup) return { ...backup, recovered: true };
  if (primary) throw new Error('This slot is damaged. Import a valid exported save.');
  return null;
}

export function saveSlot(slot, state, name = 'Foundations Settlement', storage = localStorage) {
  validSlot(slot);
  const game = serialize(state);
  deserialize(game);
  const snapshot = JSON.stringify({
    name: name.trim().slice(0, 60) || 'Foundations Settlement',
    savedSeconds: Date.now() / 1000,
    game,
  });
  const previous = storage.getItem(key(slot));
  if (previous) {
    try {
      decode(previous);
      storage.setItem(`${key(slot)}.backup`, previous);
    } catch (error) {
      if (error.name === 'QuotaExceededError') throw error;
    }
  }
  storage.setItem(key(slot), snapshot);
}

export function listSlots(storage = localStorage) {
  return [1, 2, 3].map((slot) => {
    try {
      return { slot, data: readSlot(slot, storage), error: null };
    } catch (error) {
      return { slot, data: null, error: error.message };
    }
  });
}
