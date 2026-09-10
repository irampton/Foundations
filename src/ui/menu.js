// Compact local save-history menu and session settings.
import { escapeHtml } from './format.js';

function savedTime(savedSeconds) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(savedSeconds * 1000),
  );
}

export function menuContent(history, hasSession, reducedMotion, mode = 'main') {
  const { saves, recovered, error } = history;
  return `<div class="menu-content">
    <h1 id="menu-title">Foundations</h1>
    ${hasSession ? '<button class="button primary full" data-action="resume">Resume</button>' : ''}
    <div class="menu-buttons"><button class="button" data-action="show-new-game">New game</button><button class="button" data-action="show-load" ${saves.length ? '' : 'disabled'}>Load save</button></div>
    <section id="new-game-panel" class="menu-panel" ${mode === 'new' ? '' : 'hidden'}>
      <label class="field-label" for="settlement-name">Settlement name</label>
      <input id="settlement-name" maxlength="60" autocomplete="off" placeholder="Foundations Settlement" />
      <button class="button primary full" data-action="new-game">Start new game</button>
    </section>
    <section id="load-panel" class="menu-panel" ${mode === 'load' ? '' : 'hidden'} aria-label="Saved settlements">
      ${saves.map((save) => `<button class="save-entry" data-action="load" data-save-id="${escapeHtml(save.id)}"><span>${escapeHtml(save.name)}</span><time datetime="${new Date(save.savedSeconds * 1000).toISOString()}">${escapeHtml(savedTime(save.savedSeconds))}</time></button>`).join('')}
    </section>
    <p id="menu-notice" role="status" aria-live="polite">${escapeHtml(error || (recovered ? 'Save history recovered from backup.' : ''))}</p>
    <div class="menu-buttons"><button class="button" data-action="export" ${saves.length || hasSession ? '' : 'disabled'}>Export current</button><button class="button" data-action="import">Import</button></div>
    <label class="setting" title="Disable worker movement and construction animation"><input id="reduced-motion" type="checkbox" ${reducedMotion ? 'checked' : ''}/> Reduce motion</label>
  </div>`;
}
