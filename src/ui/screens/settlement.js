// Building purchase rows: owned quantity, cost, and an action; effects are hover help.
import { CATALOG } from '../../game/catalog.js';

export function renderSettlement(state) {
  return `<div class="building-list">${Object.entries(CATALOG.buildings)
    .map(([type, def]) => {
      const affordable = Object.entries(def.cost).every(
        ([key, amount]) => state.resources[key] >= amount,
      );
      const effect = def.housing
        ? `+${def.housing} housing`
        : `+200 ${Object.keys(def.storage)[0]} storage`;
      const help = def.available ? effect : `${effect}. ${def.lockedReason}`;
      const cost = Object.entries(def.cost)
        .map(([key, amount]) => `${amount} ${CATALOG.resources[key].label}`)
        .join(', ');
      const count = state.buildings.filter((building) => building.type === type).length;
      return `<article class="building-row" title="${help}">
      <span>${def.label} <b class="owned">${count}</b></span>
      <span class="cost">${cost}</span>
      <button class="button" data-action="build" data-building="${type}" aria-label="Build ${def.label}" title="${help}" ${!def.available || !affordable ? 'disabled' : ''}>${def.available ? '+' : 'Locked'}</button>
    </article>`;
    })
    .join('')}</div>`;
}
