// Session lifecycle joins pure simulation, browser persistence, and presentation.
import { createGame, gather, build, createWorkers, assign, tick } from './game/simulation.js';
import { serialize, deserialize } from './game/save.js';
import { saveSlot, readSlot, listSlots } from './game/storage.js';
import { createSettlementView } from './scene/settlement.js';
import { renderShell } from './ui/shell.js';
import { renderPanel, renderStats } from './ui/panels.js';
import { menuContent } from './ui/menu.js';
import { icon } from './ui/icons.js';
import { createClock } from './game/clock.js';
import { patchMarkup } from './ui/patch.js';
import { gatherCards } from './ui/gathering.js';

export function startApplication(root) {
  root.innerHTML = renderShell();
  const $ = (selector) => root.querySelector(selector);
  const dialog = $('#menu-dialog');
  const panel = $('#panel');
  let state = createGame(3719);
  let hasSession = false;
  let slot = 1;
  let selectedSlot = 1;
  let name = 'Foundations Settlement';
  let tab = 'settlement';
  let paused = false;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let toastTimer;
  const view = createSettlementView($('#scene'), { reducedMotion });
  const clock = createClock();
  const isPaused = () => !hasSession || paused || dialog.open || document.hidden;

  function notify(message) {
    if (dialog.open && $('#menu-notice')) $('#menu-notice').textContent = message;
    $('#toast').textContent = message;
    $('#toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3500);
  }

  function save() {
    if (!hasSession) return true;
    try {
      saveSlot(slot, state, name);
      $('#save-status').textContent = 'Saved';
      $('#export-recovery').hidden = true;
      return true;
    } catch (error) {
      $('#save-status').textContent = 'Save failed';
      $('#export-recovery').hidden = false;
      notify(`Could not save. Export your settlement to keep it. ${error.message}`);
      return false;
    }
  }

  function refresh() {
    // Keep the same DOM controls alive while counts and availability change.
    const quantity = $('#job-amount')?.value ?? '1';
    const scroll = panel.scrollTop;
    $('#top-stats').innerHTML = renderStats(state);
    patchMarkup($('#gathering'), gatherCards(state));
    patchMarkup(panel, renderPanel(tab, state));
    if ($('#job-amount')) $('#job-amount').value = quantity;
    panel.scrollTop = scroll;
    root
      .querySelectorAll('.tab')
      .forEach((button) =>
        button.setAttribute('aria-current', button.dataset.tab === tab ? 'page' : 'false'),
      );
    refreshStatus();
  }

  function refreshStatus() {
    $('#simulation-status').textContent = isPaused() ? 'Paused' : 'Running';
    $('.live-dot').classList.toggle('paused', isPaused());
    $('#pause-button').innerHTML = icon(paused ? 'play' : 'pause');
    $('#pause-button').setAttribute(
      'aria-label',
      paused ? 'Resume simulation' : 'Pause simulation',
    );
    const constructing = state.buildings.filter(
      (building) => state.seconds - building.builtAt < 2,
    ).length;
    $('#construction-status').textContent = constructing ? `Building: ${constructing}` : '';
    $('#construction-status').hidden = !constructing;
  }

  function slotDetail() {
    selectedSlot = Number($('#save-slot').value);
    const entry = listSlots().find((entry) => entry.slot === selectedSlot);
    $('#slot-detail').textContent =
      entry.error || (entry.data?.recovered ? 'Backup recovered' : '');
    $('[data-action="load"]').disabled = !entry.data;
  }

  function openMenu() {
    if (!save()) return;
    const slots = listSlots();
    if (!hasSession) {
      const latest = slots
        .filter((entry) => entry.data)
        .sort((a, b) => b.data.savedSeconds - a.data.savedSeconds)[0];
      selectedSlot = latest?.slot ?? 1;
    }
    dialog.innerHTML = menuContent(slots, selectedSlot, hasSession, reducedMotion);
    if (!dialog.open) dialog.showModal();
    slotDetail();
    clock.reset();
    refreshStatus();
  }

  function enterSession(nextState, nextSlot, nextName) {
    state = nextState;
    slot = nextSlot;
    selectedSlot = slot;
    name = nextName;
    hasSession = true;
    paused = false;
    tab = 'settlement';
    dialog.close();
    clock.reset();
    view.update(state, 0, true);
    view.resetView();
    refresh();
    $('.tab').focus();
  }

  function mayReplace(targetSlot) {
    const entry = listSlots().find((entry) => entry.slot === targetSlot);
    return (
      (!entry.data && !entry.error) ||
      window.confirm(
        `Replace settlement slot ${targetSlot}? Its current progress will be overwritten. Cancel and export it first if you want to keep a copy.`,
      )
    );
  }

  function transaction(result, persist = false) {
    if (!result.ok) notify(result.message);
    if (result.ok && persist) save();
    refresh();
  }

  root.addEventListener('click', (event) => {
    const button = event.target.closest('[data-action]');
    if (!button || button.disabled) return;
    event.preventDefault();
    const { action } = button.dataset;
    if (action === 'tab') {
      tab = button.dataset.tab;
      panel.scrollTop = 0;
      refresh();
    } else if (action === 'gather' && !isPaused())
      transaction(gather(state, button.dataset.resource));
    else if (action === 'build' && !isPaused())
      transaction(build(state, button.dataset.building), true);
    else if (action === 'hire' && !isPaused()) transaction(createWorkers(state), true);
    else if (action === 'assign' && !isPaused())
      transaction(assign(state, button.dataset.job, Number(button.dataset.amount)), true);
    else if (action === 'assign-custom' && !isPaused()) {
      const quantity = Number($('#job-amount').value);
      if (!Number.isSafeInteger(quantity) || quantity < 1)
        notify('Enter a positive whole assignment amount.');
      else
        transaction(
          assign(state, button.dataset.job, quantity * Number(button.dataset.direction)),
          true,
        );
    } else if (['gather', 'build', 'hire', 'assign', 'assign-custom'].includes(action))
      notify('Resume the settlement to take this action.');
    else if (action === 'pause') {
      paused = !paused;
      clock.reset();
      refreshStatus();
    } else if (action === 'reset-view') view.resetView();
    else if (action === 'save') {
      if (save()) notify('Settlement saved locally.');
    } else if (action === 'menu') {
      openMenu();
    } else if (action === 'resume') {
      dialog.close();
      clock.reset();
      refreshStatus();
    } else if (action === 'new-game') {
      if (!mayReplace(selectedSlot)) return;
      const nextState = createGame(Math.floor(Math.random() * 0xffffffff));
      try {
        saveSlot(selectedSlot, nextState, 'Foundations Settlement');
        enterSession(nextState, selectedSlot, 'Foundations Settlement');
      } catch (error) {
        notify(`New settlement could not be saved: ${error.message}`);
      }
    } else if (action === 'load') {
      try {
        const snapshot = readSlot(selectedSlot);
        if (snapshot) enterSession(snapshot.state, selectedSlot, snapshot.name);
      } catch (error) {
        notify(error.message);
      }
    } else if (action === 'export') {
      try {
        const snapshot = dialog.open ? readSlot(selectedSlot)?.state : hasSession ? state : null;
        if (!snapshot) return notify('Choose a saved settlement to export.');
        const url = URL.createObjectURL(
          new Blob([serialize(snapshot)], { type: 'application/json' }),
        );
        const link = document.createElement('a');
        link.href = url;
        link.download = `foundations-slot-${selectedSlot}.json`;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      } catch (error) {
        notify(error.message);
      }
    } else if (action === 'import') $('#import-file').click();
  });

  root.addEventListener('change', async (event) => {
    if (event.target.id === 'save-slot') slotDetail();
    if (event.target.id === 'reduced-motion') {
      reducedMotion = event.target.checked;
      view.setReducedMotion(reducedMotion);
    }
    if (event.target.id === 'import-file') {
      const file = event.target.files[0];
      event.target.value = '';
      if (!file) return;
      try {
        if (file.size > 10_000_000) throw new Error('Save files must be smaller than 10 MB.');
        const imported = deserialize(await file.text());
        if (!mayReplace(selectedSlot)) return;
        saveSlot(selectedSlot, imported, 'Imported Settlement');
        enterSession(imported, selectedSlot, 'Imported Settlement');
        notify('Settlement imported.');
      } catch (error) {
        notify(`Import failed: ${error.message}`);
      }
    }
  });

  dialog.addEventListener('cancel', (event) => {
    event.preventDefault();
    if (hasSession) {
      dialog.close();
      clock.reset();
      refreshStatus();
    }
  });
  window.addEventListener('keydown', (event) => {
    if (
      event.target.matches('input,select,textarea,button,summary') ||
      event.ctrlKey ||
      event.metaKey ||
      event.altKey
    )
      return;
    if (event.key === 'Escape' && !dialog.open) {
      openMenu();
      return;
    }
    if (dialog.open || !hasSession) return;
    if (event.code === 'Space') {
      event.preventDefault();
      paused = !paused;
      clock.reset();
      refreshStatus();
    }
    if (event.key.toLowerCase() === 'r') view.resetView();
    if (['1', '2', '3'].includes(event.key) && !isPaused())
      transaction(gather(state, ['food', 'wood', 'stone'][Number(event.key) - 1]));
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) save();
    clock.reset();
    refreshStatus();
  });
  window.addEventListener('pagehide', save);
  setInterval(() => {
    if (hasSession && !isPaused()) save();
  }, 30_000);

  function frame(now) {
    const { ticks, delta } = clock.advance(now, isPaused());
    for (let i = 0; i < ticks; i++) tick(state);
    if (ticks) refresh();
    view.update(state, delta, isPaused());
    requestAnimationFrame(frame);
  }
  refresh();
  openMenu();
  requestAnimationFrame(frame);
}
