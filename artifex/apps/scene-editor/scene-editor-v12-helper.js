(() => {
  const VERSION = 'v0.13c-legacy-safe';
  const BORDER_KEY = 'artifex.sceneEditor.borderHidden.v1';
  let queued = false;

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = VERSION + ': ' + message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  function readState() {
    try { return JSON.parse(localStorage.getItem(BORDER_KEY) || '{}'); }
    catch { return {}; }
  }

  function writeState(state) {
    try { localStorage.setItem(BORDER_KEY, JSON.stringify(state)); }
    catch {}
  }

  function selectedId() {
    const input = document.getElementById('itemId');
    return input ? input.value : '';
  }

  function field(id) {
    const input = document.getElementById(id);
    return input ? input.closest('.field') : null;
  }

  function buildBorderToggle() {
    const body = document.querySelector('[data-card-id="selected"] .card-body');
    const tags = field('itemTags');
    const visible = document.getElementById('itemVisible');
    const visibleRow = visible ? visible.closest('.check-row') : null;
    const deleteButton = document.getElementById('deleteItem');
    const deleteRow = deleteButton ? deleteButton.closest('.button-row') : null;
    if (!body || !tags || !visibleRow || !deleteRow) return;

    let tools = body.querySelector('.selected-bottom-tools');
    if (!tools) {
      tools = document.createElement('div');
      tools.className = 'selected-bottom-tools';
      tags.after(tools);
    }

    if (deleteRow.parentElement !== tools) tools.appendChild(deleteRow);
    if (visibleRow.parentElement !== tools) tools.appendChild(visibleRow);

    let borderLabel = document.getElementById('itemBorderVisible')?.closest('label');
    if (!borderLabel) {
      borderLabel = document.createElement('label');
      borderLabel.className = 'border-toggle-row';
      borderLabel.innerHTML = '<input id="itemBorderVisible" type="checkbox"> Border';
      tools.appendChild(borderLabel);
    } else if (borderLabel.parentElement !== tools) {
      tools.appendChild(borderLabel);
    }

    wireBorderToggle();
  }

  function wireBorderToggle() {
    const checkbox = document.getElementById('itemBorderVisible');
    if (!checkbox) return;
    const id = selectedId();
    const state = readState();
    checkbox.checked = !state[id];
    if (checkbox.getAttribute('data-border-wire') === 'true') return;
    checkbox.setAttribute('data-border-wire', 'true');
    checkbox.addEventListener('change', function () {
      const current = selectedId();
      const next = readState();
      next[current] = !checkbox.checked;
      writeState(next);
      applyBorders();
      toast(checkbox.checked ? 'Border shown' : 'Border hidden');
    });
  }

  function applyBorders() {
    const state = readState();
    document.querySelectorAll('.scene-item[data-stage-id]').forEach(function (item) {
      const id = item.getAttribute('data-stage-id');
      item.classList.toggle('border-hidden', !!state[id]);
    });
    const checkbox = document.getElementById('itemBorderVisible');
    const id = selectedId();
    if (checkbox && id) checkbox.checked = !state[id];
  }

  function patch() {
    queued = false;
    buildBorderToggle();
    applyBorders();
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { requestAnimationFrame(patch); });
  }

  window.addEventListener('load', queue);
  document.addEventListener('click', queue, true);
  document.addEventListener('change', queue, true);
  document.addEventListener('input', queue, true);
  document.addEventListener('pointerup', queue, true);
  setInterval(queue, 1200);
  patch();
})();
