// Compact hiring and workforce rows; one shared quantity drives all assignment buttons.
import { JOBS } from '../../game/catalog.js';
import { happiness, housing, jobCount, unemployed } from '../../game/simulation.js';

const labels = { farmer: 'Farmer', woodcutter: 'Woodcutter', miner: 'Miner' };

export function renderWorkers(state) {
  const idle = unemployed(state);
  const full = state.workers.length >= housing(state);
  return `<div class="worker-summary">
    <span>Idle <b>${idle}</b></span>
    <span title="Crowding above 80% housing occupancy reduces production">Happiness <b>${Math.round(happiness(state))}%</b></span>
  </div>
  <div class="hire-row"><button class="button" data-action="hire" aria-label="Create Worker" title="${full ? 'Build more housing' : 'New workers start unemployed and consume 0.1 Food/s'}" ${full || state.resources.food < 20 ? 'disabled' : ''}>Create worker</button><span class="cost">20 Food</span></div>
  <label class="quantity-field">Amount <input id="job-amount" aria-label="Assignment amount" type="number" min="1" max="1000000" step="1" value="1" /></label>
  <div class="job-list">${JOBS.map(
    (
      job,
    ) => `<article class="job-row" title="${(0.2 * (0.5 + happiness(state) / 200)).toFixed(2)} resources per worker per second">
    <span>${labels[job]} <b class="owned">${jobCount(state, job)}</b></span>
    <div class="assignment-controls">
      <button data-action="assign" data-job="${job}" data-amount="-1000000" aria-label="-All ${labels[job]}" title="Remove all" ${!jobCount(state, job) ? 'disabled' : ''}>−All</button>
      <button data-action="assign-custom" data-job="${job}" data-direction="-1" aria-label="Remove ${labels[job]}" title="Remove amount" ${!jobCount(state, job) ? 'disabled' : ''}>−</button>
      <button data-action="assign-custom" data-job="${job}" data-direction="1" aria-label="Assign ${labels[job]}" title="Assign amount" ${!idle ? 'disabled' : ''}>+</button>
      <button data-action="assign" data-job="${job}" data-amount="1000000" aria-label="Max ${labels[job]}" title="Assign all idle workers" ${!idle ? 'disabled' : ''}>Max</button>
    </div>
  </article>`,
  ).join('')}</div>
  ${state.corpses ? `<div class="losses" title="Workers lost to food shortages">Deaths: ${state.corpses}</div>` : ''}`;
}
