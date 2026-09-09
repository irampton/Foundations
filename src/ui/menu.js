// Compact local save menu and session settings.
import { escapeHtml } from './format.js';

export function menuContent(slots, selected, hasSession, reducedMotion) {
  return `<div class="menu-content">
    <h1 id="menu-title">Foundations</h1>
    ${hasSession ? '<button class="button primary full" data-action="resume">Resume</button>' : ''}
    <label class="field-label" for="save-slot">Save slot</label>
    <select id="save-slot">${slots.map(({ slot, data, error }) => `<option value="${slot}" ${slot === selected ? 'selected' : ''}>${slot} · ${escapeHtml(error ? 'Unavailable' : data ? data.name : 'Empty')}</option>`).join('')}</select>
    <div class="menu-buttons"><button class="button" data-action="load">Load</button><button class="button" data-action="new-game">New game</button></div>
    <p id="slot-detail" class="small muted"></p>
    <p id="menu-notice" role="status" aria-live="polite"></p>
    <div class="menu-buttons"><button class="button" data-action="export">Export</button><button class="button" data-action="import">Import</button></div>
    <label class="setting" title="Disable worker movement and construction animation"><input id="reduced-motion" type="checkbox" ${reducedMotion ? 'checked' : ''}/> Reduce motion</label>
  </div>`;
}
