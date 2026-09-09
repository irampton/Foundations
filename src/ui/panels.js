/**
 * Assembles management screens and exposes the stable panel-rendering API.
 */
import { housing } from '../game/simulation.js';
import { icon } from './icons.js';
import { number } from './format.js';
import { resourceStats } from './gathering.js';
import { renderResources } from './screens/resources.js';
import { renderSettlement } from './screens/settlement.js';
import { renderWorkers } from './screens/workers.js';
import { renderTechnology } from './technology.js';

/** Returns the compact top-bar resource and population statistics. */
export function renderStats(state) {
  return (
    resourceStats(state, number) +
    `<div class="top-resource" title="Population / housing">${icon('people')}<strong>${state.workers.length}<small> / ${housing(state)}</small></strong></div>`
  );
}
/** Returns the active management panel, including any active food shortage alert. */
export function renderPanel(tab, state) {
  const shortage =
    state.shortageSeconds > 0
      ? `<div class="shortage" role="status" title="Gather Food or assign Farmers">Food shortage: ${state.shortageSeconds}s · Death at ${state.nextStarvationAt}s</div>`
      : '';
  return (
    shortage +
    (
      {
        settlement: renderSettlement,
        workers: renderWorkers,
        resources: renderResources,
        technology: renderTechnology,
      }[tab] || renderSettlement
    )(state)
  );
}
