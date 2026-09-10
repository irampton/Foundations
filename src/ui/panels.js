/**
 * Assembles management screens and exposes the stable panel-rendering API.
 */
import { graveCapacity, housing, sickCount } from '../game/simulation.js';
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
    `<div class="top-resource" title="Population / housing">${icon('people')}<strong>${state.workers.length}<small> / ${housing(state)}</small></strong></div>` +
    `<div class="top-resource" title="Sick workers · unburied corpses · occupied graves"><span>Health</span><strong>${sickCount(state)} sick</strong><small>${state.corpses} corpses · ${state.occupiedGraves}/${graveCapacity(state)} graves</small></div>`
  );
}
/** Returns the active management panel, including any active food shortage alert. */
export function renderPanel(tab, state) {
  const shortage =
    state.shortageSeconds > 0
      ? `<div class="shortage" role="status" title="Gather Food or assign Farmers">Food exhausted: unsupported workers died</div>`
      : '';
  const event = state.lastEvent
    ? `<div class="event-notice" role="status">${state.lastEvent.type === 'wolves' ? `Wolf attack: ${state.lastEvent.affected} killed, ${state.lastEvent.defended} defended` : `Sickness outbreak: ${state.lastEvent.affected} infected`}</div>`
    : '';
  return (
    shortage +
    event +
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
