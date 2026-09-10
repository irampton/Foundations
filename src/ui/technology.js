import { AGES, CATALOG } from '../game/catalog.js';
import { technologyLabel, technologyUnlock } from '../game/simulation.js';
export function renderTechnology(state) {
  return `<div class="age-heading">Current Age: <b>${AGES[state.age]}</b></div>${AGES.map(
    (age, index) =>
      `<section class="tech-age"><h3>${age}</h3><div class="tech-list">${Object.entries(
        CATALOG.technologies,
      )
        .filter(([, t]) => t.age === index)
        .map(([id, t]) => {
          const lock = technologyUnlock(state, id),
            affordable = Object.entries(t.cost).every(([k, v]) => state.resources[k] >= v),
            cost = Object.entries(t.cost)
              .map(([k, v]) => `${v} ${CATALOG.resources[k].label}`)
              .join(', ');
          return `<article class="tech-card" title="${t.effect}"><span><b>${technologyLabel(id)}</b><small>${t.effect}</small></span><span class="cost">${cost}</span><button class="button" data-action="research" data-technology="${id}" title="${lock ?? t.effect}" ${lock || !affordable ? 'disabled' : ''}>${state.technologies.includes(id) ? 'Owned' : (lock ?? 'Research')}</button></article>`;
        })
        .join('')}</div></section>`,
  ).join('')}`;
}
