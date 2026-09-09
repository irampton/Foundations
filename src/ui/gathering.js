// Persistent gather buttons and the single inventory readout in the top bar.
import { CATALOG } from '../game/catalog.js';
import { capacity } from '../game/simulation.js';
import { icon } from './icons.js';

export const resources = ['food', 'wood', 'stone'];
export const symbols = { food: 'leaf', wood: 'wood', stone: 'stone' };

export function gatherCards(state) {
  return `<div class="gather-grid">${resources
    .map((key, index) => {
      const full = state.resources[key] >= capacity(state, key);
      return `<button class="gather-button" data-action="gather" data-resource="${key}" aria-label="${['Gather food', 'Cut wood', 'Mine stone'][index]}" title="${full ? 'Storage full' : `Gather +1 ${key} (${index + 1})`}" ${full ? 'disabled' : ''}>${icon(symbols[key])}${CATALOG.resources[key].label} +1</button>`;
    })
    .join('')}</div>`;
}

export function resourceStats(state, number) {
  return resources
    .map(
      (key) =>
        `<div class="top-resource" title="${CATALOG.resources[key].label}: stored / capacity">${icon(symbols[key])}<span>${CATALOG.resources[key].label}</span><strong>${number(state.resources[key])}<small> / ${capacity(state, key)}</small></strong></div>`,
    )
    .join('');
}
