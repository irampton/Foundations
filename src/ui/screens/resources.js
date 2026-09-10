// Production ledger complements the inventory HUD without repeating stock balances.
import { CATALOG, RESOURCE_KEYS } from '../../game/catalog.js';
import { rates } from '../../game/simulation.js';
import { signed } from '../format.js';

export function renderResources(state) {
  const output = rates(state);
  return `<table class="resource-ledger"><thead><tr><th>Resource</th><th title="Production per second before storage limits">In/s</th><th title="Consumption per second">Out/s</th><th>Net/s</th></tr></thead><tbody>
    ${RESOURCE_KEYS.map((key) => `<tr class="ledger-card"><th scope="row">${CATALOG.resources[key].label} <small>${Number.isFinite(state.resources[key]) ? state.resources[key].toFixed(2) : ''}</small></th><td>+${output[key].gross.toFixed(2)}</td><td>−${output[key].consumption.toFixed(2)}</td><td class="${output[key].net < 0 ? 'negative' : ''}">${signed(output[key].net)}</td></tr>`).join('')}
  </tbody></table>`;
}
