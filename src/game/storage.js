// Browser persistence adapter: chronological play-session snapshots with validated backup recovery.
import { serialize, deserialize } from './save.js';

const SAVES_KEY = 'foundations.saves';
const BACKUP_KEY = `${SAVES_KEY}.backup`;

function validName(name) {
  return typeof name === 'string' && !!name.trim() && [...name.trim()].length <= 60;
}

function decodeRecord(record) {
  if (!record || typeof record !== 'object' || Array.isArray(record))
    throw new Error('Invalid save history.');
  if (Object.keys(record).sort().join(',') !== 'game,id,name,savedSeconds')
    throw new Error('Invalid save history.');
  if (typeof record.id !== 'string' || !record.id || !validName(record.name))
    throw new Error('Invalid save history.');
  if (!Number.isFinite(record.savedSeconds) || record.savedSeconds < 0)
    throw new Error('Invalid save history.');
  if (typeof record.game !== 'string') throw new Error('Invalid save history.');
  return { ...record, state: deserialize(record.game) };
}

function decodeHistory(text) {
  if (!text) return [];
  const records = JSON.parse(text);
  if (!Array.isArray(records)) throw new Error('Invalid save history.');
  const decoded = records.map(decodeRecord);
  if (new Set(decoded.map(({ id }) => id)).size !== decoded.length)
    throw new Error('Invalid save history.');
  return decoded.sort((a, b) => a.savedSeconds - b.savedSeconds);
}

function migrateSlots(storage) {
  const records = [];
  for (const slot of [1, 2, 3]) {
    const text = storage.getItem(`foundations.slot.${slot}`);
    if (!text) continue;
    try {
      const legacy = JSON.parse(text);
      const savedSeconds = legacy.savedSeconds ?? Date.parse(legacy.savedAt) / 1000;
      records.push(
        decodeRecord({
          id: `legacy-slot-${slot}`,
          name: legacy.name,
          savedSeconds,
          game: legacy.game,
        }),
      );
    } catch {
      // A damaged legacy slot should not hide other valid settlements.
    }
  }
  if (records.length) {
    const encoded = records.map(({ state: _state, ...record }) => record);
    storage.setItem(SAVES_KEY, JSON.stringify(encoded));
  }
  return records;
}

function readHistory(storage) {
  const primary = storage.getItem(SAVES_KEY);
  if (!primary) return { records: migrateSlots(storage), recovered: false };
  try {
    return { records: decodeHistory(primary), recovered: false };
  } catch {
    const backup = decodeHistory(storage.getItem(BACKUP_KEY));
    if (backup.length) return { records: backup, recovered: true };
    throw new Error('Save history is damaged. Import a valid exported save.');
  }
}

function newId(records) {
  let id;
  do id = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  while (records.some((record) => record.id === id));
  return id;
}

export function listSaves(storage = localStorage) {
  try {
    const { records, recovered } = readHistory(storage);
    return { saves: records, recovered, error: null };
  } catch (error) {
    return { saves: [], recovered: false, error: error.message };
  }
}

export function readSave(id, storage = localStorage) {
  const { records, recovered } = readHistory(storage);
  const record = records.find((candidate) => candidate.id === id) ?? null;
  return record ? { ...record, recovered } : null;
}

export function saveGame(state, name, id = null, storage = localStorage) {
  if (!validName(name)) throw new Error('Settlement names must be 1–60 characters.');
  const game = serialize(state);
  deserialize(game);
  const current = readHistory(storage).records;
  const saveId = id && current.some((record) => record.id === id) ? id : newId(current);
  const record = { id: saveId, name: name.trim(), savedSeconds: Date.now() / 1000, game };
  const next = current
    .filter((candidate) => candidate.id !== saveId)
    .map(({ state: _state, ...candidate }) => candidate);
  next.push(record);
  next.sort((a, b) => a.savedSeconds - b.savedSeconds);
  const previous = storage.getItem(SAVES_KEY);
  if (previous) storage.setItem(BACKUP_KEY, previous);
  storage.setItem(SAVES_KEY, JSON.stringify(next));
  return saveId;
}
