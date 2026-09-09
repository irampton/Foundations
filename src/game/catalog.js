/** Static data for the technology-free economy slice. */

export const BASIC_RESOURCES = Object.freeze(['food', 'wood', 'stone']);

export const JOBS = Object.freeze(['farmer', 'woodcutter', 'miner']);

export const CATALOG = Object.freeze({
  resources: Object.freeze({
    food: Object.freeze({ label: 'Food' }),
    wood: Object.freeze({ label: 'Wood' }),
    stone: Object.freeze({ label: 'Stone' }),
    skins: Object.freeze({ label: 'Skins' }),
  }),
  buildings: Object.freeze({
    tent: Object.freeze({ label: 'Tent', cost: { wood: 2 }, housing: 1, available: true }),
    hut: Object.freeze({
      label: 'Wooden Hut',
      cost: { skins: 1, wood: 20 },
      housing: 3,
      available: false,
      lockedReason: 'Requires a future discovery',
    }),
    barn: Object.freeze({
      label: 'Barn',
      cost: { wood: 100 },
      storage: { food: 200 },
      available: true,
    }),
    woodStockpile: Object.freeze({
      label: 'Wood Stockpile',
      cost: { wood: 100 },
      storage: { wood: 200 },
      available: true,
    }),
    stoneStockpile: Object.freeze({
      label: 'Stone Stockpile',
      cost: { wood: 100 },
      storage: { stone: 200 },
      available: true,
    }),
  }),
});
