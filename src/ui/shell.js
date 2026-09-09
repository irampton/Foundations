// Persistent game HUD, camera controls, and management tabs.
import { icon } from './icons.js';

export function renderShell() {
  return `
    <header class="topbar">
      <a class="brand" href="#" data-action="menu" aria-label="Foundations main menu">Foundations</a>
      <div id="top-stats" class="top-stats"></div>
      <div class="top-actions">
        <span id="save-status" class="save-status"></span>
        <button id="export-recovery" class="text-button" data-action="export" hidden>Export backup</button>
        <button class="icon-button" data-action="save" aria-label="Save game" title="Save game">${icon('save')}</button>
        <button class="icon-button" data-action="menu" aria-label="Main menu" title="Menu (Esc)">${icon('menu')}</button>
      </div>
    </header>
    <main class="game-layout">
      <section class="world" aria-label="3D settlement">
        <div id="scene"></div>
        <div class="world-status"><span class="live-dot"></span><span id="simulation-status"></span></div>
        <div class="camera-actions">
          <button class="icon-button" aria-label="Camera controls" title="Drag: orbit · Right-drag / arrows: pan · Scroll: zoom · 1/2/3: gather">?</button>
          <button class="icon-button" data-action="reset-view" aria-label="Reset camera" title="Reset camera (R)">${icon('reset')}</button>
          <button class="icon-button" data-action="pause" aria-label="Pause simulation" title="Pause / resume (Space)" id="pause-button">${icon('pause')}</button>
        </div>
        <div id="construction-status" class="construction-status" aria-live="polite"></div>
      </section>
      <aside class="management" aria-label="Settlement management">
        <div id="gathering" aria-label="Manual gathering"></div>
        <nav class="tabs" aria-label="Management screens">
          ${[
            ['settlement', 'Build'],
            ['workers', 'Workers'],
            ['resources', 'Resources'],
            ['technology', 'Technology'],
          ]
            .map(
              ([id, label]) =>
                `<button data-action="tab" data-tab="${id}" class="tab" aria-current="${id === 'settlement' ? 'page' : 'false'}">${label}</button>`,
            )
            .join('')}
        </nav>
        <div id="panel" class="panel-scroll"></div>
      </aside>
    </main>
    <div id="toast" class="toast" role="status" aria-live="polite"></div>
    <dialog id="menu-dialog" aria-labelledby="menu-title"></dialog>
    <input id="import-file" type="file" accept="application/json,.json" hidden />`;
}
