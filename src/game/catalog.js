/** Static economic catalog: resources, jobs, buildings, Ages, and technologies. */
export const BASIC_RESOURCES = Object.freeze(['food', 'wood', 'stone']);
export const RESOURCE_KEYS = Object.freeze([
  ...BASIC_RESOURCES,
  'skins',
  'herbs',
  'ore',
  'leather',
  'metal',
  'science',
  'piety',
  'gold',
]);
export const JOBS = Object.freeze([
  'farmer',
  'woodcutter',
  'miner',
  'tanner',
  'blacksmith',
  'apothecary',
  'cleric',
  'librarian',
]);
export const AGES = Object.freeze(['Settlement', 'Village', 'Town', 'City', 'Developed City']);
const t = (age, cost, effect, prerequisites = []) =>
  Object.freeze({
    age,
    cost: Object.freeze(cost),
    effect,
    prerequisites: Object.freeze(prerequisites),
  });
export const CATALOG = Object.freeze({
  resources: Object.freeze(
    Object.fromEntries(
      RESOURCE_KEYS.map((k) => [k, Object.freeze({ label: k[0].toUpperCase() + k.slice(1) })]),
    ),
  ),
  buildings: Object.freeze({
    tent: { label: 'Tent', cost: { skins: 2, wood: 2 }, housing: 1 },
    hut: { label: 'Wooden Hut', cost: { skins: 1, wood: 20 }, housing: 3 },
    cottage: { label: 'Cottage', cost: { wood: 10, stone: 30 }, housing: 6, requires: 'masonry' },
    house: { label: 'House', cost: { wood: 30, stone: 70 }, housing: 10, requires: 'construction' },
    mansion: {
      label: 'Mansion',
      cost: { wood: 200, stone: 200, leather: 20 },
      housing: 50,
      requires: 'architecture',
    },
    barn: { label: 'Barn', cost: { wood: 100 }, storage: { food: 200 } },
    woodStockpile: { label: 'Wood Stockpile', cost: { wood: 100 }, storage: { wood: 200 } },
    stoneStockpile: { label: 'Stone Stockpile', cost: { wood: 100 }, storage: { stone: 200 } },
    tannery: {
      label: 'Tannery',
      cost: { wood: 30, stone: 70, skins: 2 },
      job: 'tanner',
      requires: 'masonry',
    },
    smithy: {
      label: 'Smithy',
      cost: { wood: 30, stone: 70, ore: 2 },
      job: 'blacksmith',
      requires: 'masonry',
    },
    apothecary: {
      label: 'Apothecary',
      cost: { wood: 30, stone: 70, herbs: 2 },
      job: 'apothecary',
      requires: 'masonry',
    },
    temple: {
      label: 'Temple',
      cost: { wood: 30, stone: 120, herbs: 10 },
      job: 'cleric',
      requires: 'masonry',
    },
    library: {
      label: 'Library',
      cost: { wood: 100, stone: 100 },
      job: 'librarian',
      requires: 'writing',
    },
    graveyard: {
      label: 'Graveyard',
      cost: { wood: 100, stone: 200, herbs: 50 },
      graves: 100,
      requires: 'masonry',
    },
    mill: { label: 'Mill', cost: {}, requires: 'wheel', mill: true },
  }),
  technologies: Object.freeze({
    skinning: t(0, { wood: 10 }, 'Farmers collect 0.01 Skins/s'),
    harvesting: t(0, { wood: 10 }, 'Woodcutters collect 0.01 Herbs/s'),
    prospecting: t(0, { stone: 10 }, 'Miners collect 0.01 Ore/s'),
    masonry: t(0, { wood: 100, stone: 100 }, 'Advance to Village; unlock core buildings'),
    domestication: t(1, { leather: 20 }, '+0.1 Food/s per Farmer', ['masonry']),
    ploughshares: t(1, { metal: 20 }, '+0.1 Food/s per Farmer', ['masonry']),
    irrigation: t(1, { wood: 500, stone: 200 }, '+0.1 Food/s per Farmer', ['masonry']),
    wheel: t(1, { wood: 500, stone: 500 }, 'Unlock Mills', ['masonry']),
    writing: t(1, { skins: 500 }, 'Unlock Libraries; double Cleric Piety', ['masonry']),
    worship: t(1, { piety: 1000 }, 'Unlock deity selection', ['masonry']),
    construction: t(1, { science: 100 }, 'Advance to Town; unlock Houses', ['writing']),
    butchering: t(2, { science: 40 }, 'Double Skins production', ['construction', 'skinning']),
    gardening: t(2, { science: 40 }, 'Double Herbs production', ['construction', 'harvesting']),
    extraction: t(2, { science: 40 }, 'Double Ore production', ['construction', 'prospecting']),
    tenements: t(2, { science: 100 }, '+2 housing per House', ['construction']),
    slums: t(2, { science: 200 }, '+2 more housing per House', ['tenements']),
    granaries: t(2, { science: 200 }, 'Double Barn storage', ['construction']),
    codeOfLaws: t(2, { science: 200 }, 'Halve overcrowding penalty', ['construction', 'writing']),
    administration: t(2, { science: 200 }, 'Unlock percentage workforce controls', [
      'construction',
      'writing',
    ]),
    architecture: t(2, { science: 1000 }, 'Advance to City; unlock Mansions and Wonders', [
      'construction',
    ]),
    flensing: t(3, { science: 500 }, 'Double Skins production again', [
      'architecture',
      'skinning',
      'butchering',
    ]),
    macerating: t(3, { science: 500 }, 'Double Ore production again', [
      'architecture',
      'prospecting',
      'extraction',
    ]),
    cropRotation: t(3, { science: 1000 }, '+0.2 Food/s per Farmer', ['architecture']),
    selectiveBreeding: t(3, { science: 1000 }, '+0.2 Food/s per Farmer', ['architecture']),
    fertilisers: t(3, { science: 1000 }, '+0.2 Food/s per Farmer', ['architecture']),
    aesthetics: t(3, { science: 1000 }, 'Up to +20 Happiness from Temples', [
      'writing',
      'architecture',
    ]),
    civilService: t(3, { science: 2000 }, 'Advance to Developed City; +1 manual gathering', [
      'architecture',
    ]),
    feudalism: t(4, { science: 3000 }, '+1 manual gathering', ['civilService']),
    guilds: t(4, { science: 3000 }, 'Double all secondary production', ['civilService']),
    serfs: t(4, { science: 5000 }, '+1 manual gathering per 100 idle workers', ['civilService']),
  }),
});
export const TECHNOLOGY_IDS = Object.freeze(Object.keys(CATALOG.technologies));
