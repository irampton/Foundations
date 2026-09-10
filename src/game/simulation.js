/** Deterministic one-second simulation and atomic economic/research actions. */
import { AGES, BASIC_RESOURCES, CATALOG, JOBS, RESOURCE_KEYS } from './catalog.js';
import { nextPosition } from './placement.js';
const START = [
    ['barn', -8, 0],
    ['woodStockpile', 0, 8],
    ['stoneStockpile', 8, 0],
  ],
  DEATH = [
    'unemployed',
    'librarian',
    'cleric',
    'apothecary',
    'blacksmith',
    'tanner',
    'miner',
    'woodcutter',
    'farmer',
  ];
const has = (s, id) => s.technologies.includes(id),
  valid = (q) => Number.isSafeInteger(q) && q > 0,
  res = (ok, message, x = {}) => ({ ok, message, ...x }),
  afford = (s, c) => Object.entries(c).every(([k, v]) => s.resources[k] >= v),
  bc = (s, t) => s.buildings.reduce((n, b) => n + Number(b.type === t), 0);
export function createGame(seed = 1) {
  if (!Number.isSafeInteger(seed)) throw new TypeError('Seed must be a safe integer');
  return {
    version: 3,
    seconds: 0,
    seed,
    rngState: seed >>> 0,
    layoutVersion: 1,
    nextBuildingId: 4,
    nextWorkerId: 1,
    resources: Object.fromEntries(
      RESOURCE_KEYS.map((k) => [k, BASIC_RESOURCES.includes(k) ? 200 : 0]),
    ),
    buildings: START.map(([type, x, z], i) => ({ id: i + 1, type, x, z, builtAt: -10 })),
    workers: [],
    technologies: [],
    age: 0,
    corpses: 0,
    shortageSeconds: 0,
    nextStarvationAt: 30,
  };
}
export function housing(s) {
  return s.buildings.reduce(
    (n, b) =>
      n +
      (CATALOG.buildings[b.type]?.housing ?? 0) +
      (b.type === 'house' ? 2 * Number(has(s, 'tenements')) + 2 * Number(has(s, 'slums')) : 0),
    0,
  );
}
export function capacity(s, r) {
  if (!BASIC_RESOURCES.includes(r)) return Infinity;
  return s.buildings.reduce(
    (n, b) =>
      n +
      (CATALOG.buildings[b.type]?.storage?.[r] ?? 0) *
        (b.type === 'barn' && has(s, 'granaries') ? 2 : 1),
    0,
  );
}
export const jobCount = (s, j) => s.workers.reduce((n, w) => n + Number(w.job === j), 0);
export const unemployed = (s) => jobCount(s, 'unemployed');
export function jobCapacity(s, j) {
  const capped = Object.values(CATALOG.buildings).some((b) => b.job === j);
  return capped
    ? s.buildings.reduce((n, b) => n + Number(CATALOG.buildings[b.type]?.job === j), 0)
    : Infinity;
}
export function happiness(s) {
  const p = s.workers.length,
    h = housing(s);
  if (!p || !h) return 100;
  let crowd = 50 * Math.max(0, (p / h - 0.8) / 0.2);
  if (has(s, 'codeOfLaws')) crowd /= 2;
  const bonus = has(s, 'aesthetics') ? Math.min(20, 2 * bc(s, 'temple')) : 0;
  return Math.max(0, Math.min(100, 100 - crowd + bonus));
}
const mult = (s, a, b) =>
  2 ** (Number(has(s, a)) + Number(b && has(s, b)) + Number(has(s, 'guilds')));
export function rates(s) {
  const happy = 0.5 + happiness(s) / 200,
    base =
      0.2 +
      0.1 * ['domestication', 'ploughshares', 'irrigation'].filter((x) => has(s, x)).length +
      0.2 * ['cropRotation', 'selectiveBreeding', 'fertilisers'].filter((x) => has(s, x)).length,
    out = Object.fromEntries(RESOURCE_KEYS.map((k) => [k, { gross: 0, consumption: 0, net: 0 }]));
  out.food.gross = jobCount(s, 'farmer') * base * happy * (1 + 0.05 * bc(s, 'mill'));
  out.food.consumption = s.workers.length * 0.1;
  out.wood.gross = jobCount(s, 'woodcutter') * 0.2 * happy;
  out.stone.gross = jobCount(s, 'miner') * 0.2 * happy;
  if (has(s, 'skinning'))
    out.skins.gross = jobCount(s, 'farmer') * 0.01 * mult(s, 'butchering', 'flensing');
  if (has(s, 'harvesting'))
    out.herbs.gross = jobCount(s, 'woodcutter') * 0.01 * mult(s, 'gardening');
  if (has(s, 'prospecting'))
    out.ore.gross = jobCount(s, 'miner') * 0.01 * mult(s, 'extraction', 'macerating');
  const leather = Math.min(jobCount(s, 'tanner') * 0.1, s.resources.skins),
    metal = Math.min(jobCount(s, 'blacksmith') * 0.1, s.resources.ore);
  out.leather.gross = leather;
  out.skins.consumption = leather;
  out.metal.gross = metal;
  out.ore.consumption = metal;
  out.piety.gross = jobCount(s, 'cleric') * 0.05 * (has(s, 'writing') ? 2 : 1);
  out.science.gross = jobCount(s, 'librarian') * 0.1;
  for (const v of Object.values(out)) v.net = v.gross - v.consumption;
  return out;
}
export const gatherYield = (s) =>
  1 +
  Number(has(s, 'civilService')) +
  Number(has(s, 'feudalism')) +
  (has(s, 'serfs') ? Math.floor(unemployed(s) / 100) : 0);
export function gather(s, r) {
  if (!BASIC_RESOURCES.includes(r)) return res(false, 'That resource cannot be gathered manually');
  const amount = Math.min(gatherYield(s), capacity(s, r) - s.resources[r]);
  if (amount <= 0) return res(false, `${CATALOG.resources[r].label} storage is full`);
  s.resources[r] += amount;
  return res(true, `Gathered ${amount} ${r}`, { amount });
}
export function buildingCost(s, type, q = 1) {
  const d = CATALOG.buildings[type];
  if (!d) return null;
  if (d.mill) {
    let total = 0,
      m = bc(s, 'mill');
    for (let i = 0; i < q; i++) total += Math.ceil(100 * (m + i + 1) * 1.05 ** (m + i));
    return { wood: total, stone: total };
  }
  return Object.fromEntries(Object.entries(d.cost).map(([k, v]) => [k, v * q]));
}
export const technologyLabel = (id) =>
  id.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase());
export function buildingUnlock(s, type) {
  const d = CATALOG.buildings[type];
  return d && (!d.requires || has(s, d.requires))
    ? null
    : `Requires ${technologyLabel(d?.requires ?? 'technology')}`;
}
export function build(s, type, q = 1) {
  const d = CATALOG.buildings[type];
  if (!d) return res(false, 'Unknown building type');
  if (!valid(q)) return res(false, 'Quantity must be a positive integer');
  if (s.buildings.length + q > 1e4) return res(false, 'This game supports up to 10,000 buildings');
  const locked = buildingUnlock(s, type);
  if (locked) return res(false, locked);
  const cost = buildingCost(s, type, q);
  if (!afford(s, cost)) return res(false, 'Insufficient resources');
  for (const [k, v] of Object.entries(cost)) s.resources[k] -= v;
  const built = [];
  for (let i = 0; i < q; i++) {
    const [x, z] = nextPosition(s.buildings),
      b = { id: s.nextBuildingId++, type, x, z, builtAt: s.seconds };
    s.buildings.push(b);
    built.push(b);
  }
  return res(true, `Built ${q} ${d.label}`, { buildings: built, cost });
}
export function technologyUnlock(s, id) {
  const t = CATALOG.technologies[id];
  if (!t) return 'Unknown technology';
  if (has(s, id)) return 'Already researched';
  if (s.age < t.age) return `Requires ${AGES[t.age]} Age`;
  if (id === 'worship' && bc(s, 'temple') < 1) return 'Requires 1 Temple';
  const missing = t.prerequisites.filter((x) => !has(s, x));
  return missing.length ? `Requires ${missing.map(technologyLabel).join(', ')}` : null;
}
export function research(s, id) {
  const t = CATALOG.technologies[id];
  if (!t) return res(false, 'Unknown technology');
  const locked = technologyUnlock(s, id);
  if (locked) return res(false, locked);
  if (!afford(s, t.cost)) return res(false, 'Insufficient resources');
  for (const [k, v] of Object.entries(t.cost)) s.resources[k] -= v;
  s.technologies.push(id);
  const age = { masonry: 1, construction: 2, architecture: 3, civilService: 4 }[id];
  if (age) s.age = age;
  return res(true, `Researched ${technologyLabel(id)}`, { cost: t.cost });
}
export function createWorkers(s, q = 1) {
  if (!valid(q)) return res(false, 'Quantity must be a positive integer');
  if (s.workers.length + q > 1e4) return res(false, 'This game supports up to 10,000 workers');
  const cost = q * 20;
  if (s.resources.food < cost) return res(false, 'Insufficient food');
  if (s.workers.length + q > housing(s)) return res(false, 'Insufficient housing');
  s.resources.food -= cost;
  const workers = [];
  for (let i = 0; i < q; i++) {
    const w = { id: s.nextWorkerId++, job: 'unemployed' };
    s.workers.push(w);
    workers.push(w);
  }
  return res(true, `Created ${q} worker${q === 1 ? '' : 's'}`, { workers, cost });
}
export function assign(s, j, q) {
  if (!JOBS.includes(j)) return res(false, 'Unknown job');
  if (!Number.isSafeInteger(q) || !q)
    return res(false, 'Assignment quantity must be a nonzero integer');
  const source = q > 0 ? 'unemployed' : j,
    target = q > 0 ? j : 'unemployed',
    c = s.workers.filter((w) => w.job === source),
    room = q > 0 ? jobCapacity(s, j) - jobCount(s, j) : Infinity,
    amount = Math.min(Math.abs(q), c.length, room);
  for (let i = 0; i < amount; i++) c[i].job = target;
  return res(
    true,
    amount ? `Reassigned ${amount} worker${amount === 1 ? '' : 's'}` : 'No workers available',
    { amount },
  );
}
function kill(s) {
  for (const j of DEATH) {
    const i = s.workers.findIndex((w) => w.job === j);
    if (i >= 0) {
      const [w] = s.workers.splice(i, 1);
      s.corpses++;
      return w;
    }
  }
  return null;
}
export function tick(s) {
  const current = rates(s);
  for (const k of RESOURCE_KEYS) {
    if (k === 'food') continue;
    s.resources[k] = Math.max(0, s.resources[k] + current[k].net);
    if (BASIC_RESOURCES.includes(k)) s.resources[k] = Math.min(capacity(s, k), s.resources[k]);
  }
  const available = s.resources.food + current.food.gross;
  if (available >= current.food.consumption) {
    s.resources.food = Math.min(capacity(s, 'food'), available - current.food.consumption);
    s.shortageSeconds = 0;
    s.nextStarvationAt = 30;
  } else {
    s.resources.food = 0;
    s.shortageSeconds++;
    if (s.workers.length && s.shortageSeconds >= s.nextStarvationAt) {
      kill(s);
      s.nextStarvationAt += 10;
    }
  }
  s.seconds++;
  return { rates: current };
}
