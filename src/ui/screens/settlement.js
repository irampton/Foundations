// Building purchase rows: owned quantity, exact dynamic cost, unlock, and effect.
import { CATALOG } from '../../game/catalog.js';
import { buildingCost, buildingUnlock } from '../../game/simulation.js';
export function renderSettlement(state) {
  return `<div class="building-list">${Object.entries(CATALOG.buildings)
    .map(([type, def]) => {
      const actual = buildingCost(state, type),
        locked = buildingUnlock(state, type),
        affordable = Object.entries(actual).every(([k, v]) => state.resources[k] >= v),
        effect = def.housing
          ? `+${def.housing} housing`
          : def.storage
            ? `+${Object.values(def.storage)[0]} ${Object.keys(def.storage)[0]} storage`
            : def.job
              ? `Allows 1 ${def.job}`
              : def.graves
                ? '+100 graves'
                : '+5% Farmer output',
        cost = Object.entries(actual)
          .map(([k, v]) => `${v} ${CATALOG.resources[k].label}`)
          .join(', '),
        count = state.buildings.filter((b) => b.type === type).length,
        help = locked ? `${effect}. ${locked}` : effect;
      return `<article class="building-row" title="${help}"><span>${def.label} <b class="owned">${count}</b></span><span class="cost">${cost}</span><button class="button" data-action="build" data-building="${type}" aria-label="Build ${def.label}" title="${help}" ${locked || !affordable ? 'disabled' : ''}>${locked ? 'Locked' : '+'}</button></article>`;
    })
    .join('')}</div>`;
}
