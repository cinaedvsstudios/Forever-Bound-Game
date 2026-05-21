(() => {
  const VERSION = 'v0.12a';
  const BORDER_KEY = 'artifex.sceneEditor.borderHidden.v1';
  let patchQueued = false;

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = `${VERSION}: ${message}`;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2400);
  }

  function readBorderState() {
    try { return JSON.parse(localStorage.getItem(BORDER_KEY) || '{}'); }
    catch { return {}; }
  }

  function writeBorderState(state) {
    try { localStorage.setItem(BORDER_KEY, JSON.stringify(state)); }
    catch {}
  }

  function selectedId() {
    return document.getElementById('itemId')?.value || '';
  }

  function closestField(id) {
    return document.getElementById(id)?.closest('.field') || null;
  }

  function removeEmptyFieldRows(rows) {
    rows.forEach((row) => {
      if (!row || !row.classList || !row.classList.contains('field-row')) return;
      if (!row.querySelector('.field') && !row.querySelector('.wrap-image-btn')) row.remove();
    });
  }

  function makeMetricsGrid() {
    const selectedCardBody = document.querySelector('[data-card-id="selected"] .card-body');
    const x = closestField('itemX');
    const y = closestField('itemY');
    const z = document.getElementById('itemZ')?.closest('.field') || null;
    const width = closestField('itemW');
    const height = closestField('itemH');
    const layer = closestField('itemLayer');
    const wrap = document.querySelector('.wrap-image-btn');
    if (!selectedCardBody || !x || !y || !z || !width || !height || !layer || !wrap) return;
    if (selectedCardBody.querySelector('.selected-metrics-grid')) return;

    const originalRows = [
      x.closest('.field-row'),
      y.closest('.field-row'),
      width.closest('.field-row'),
      height.closest('.field-row'),
      z.closest('.field-row'),
      layer.closest('.field-row'),
      wrap.closest('.field-row')
    ].filter(Boolean);

    const firstRow = originalRows[0] || x;
    const grid = document.createElement('div');
    grid.className = 'selected-metrics-grid';

    x.classList.add('metric-x');
    y.classList.add('metric-y');
    z.classList.add('metric-z');
    height.classList.add('metric-height');
    width.classList.add('metric-width');
    layer.classList.add('metric-layer');

    selectedCardBody.insertBefore(grid, firstRow);
    grid.append(x, wrap, height, y, width, z, layer);
    removeEmptyFieldRows(Array.from(new Set(originalRows)));
  }

  function makeBottomTools() {
    const selectedCard = document.querySelector('[data-card-id="selected"] .card-body');
    const tags = closestField('itemTags');
    const deleteButton = document.getElementById('deleteItem');
    const deleteRow = deleteButton?.closest('.button-row') || null;
    const visibleRow = document.getElementById('itemVisible')?.closest('.check-row') || null;
    if (!selectedCard || !tags || !deleteRow || !visibleRow || selectedCard.querySelector('.selected-bottom-tools')) return;

    const divider = document.createElement('div');
    divider.className = 'selected-card-divider';
    const tools = document.createElement('div');
    tools.className = 'selected-bottom-tools';

    const borderLabel = document.createElement('label');
    borderLabel.className = 'border-toggle-row';
    borderLabel.innerHTML = '<input id="itemBorderVisible" type="checkbox" checked> Border';

    tags.after(divider, tools);
    tools.append(deleteRow, visibleRow, borderLabel);

    wireBorderToggle();
  }

  function wireBorderToggle() {
    const checkbox = document.getElementById('itemBorderVisible');
    if (!checkbox || checkbox.dataset.v12Border === 'true') return;
    const id = selectedId();
    const state = readBorderState();
    checkbox.checked = !state[id];
    checkbox.dataset.v12Border = 'true';
    checkbox.addEventListener('change', () => {
      const next = readBorderState();
      const current = selectedId();
      if (!current) return;
      next[current] = !checkbox.checked;
      writeBorderState(next);
      applyBorderState();
      toast(checkbox.checked ? 'Border shown' : 'Border hidden');
    });
  }

  function applyBorderState() {
    const state = readBorderState();
    document.querySelectorAll('.scene-item[data-stage-id]').forEach((item) => {
      item.classList.toggle('border-hidden', !!state[item.dataset.stageId]);
    });
    const checkbox = document.getElementById('itemBorderVisible');
    const id = selectedId();
    if (checkbox && id) checkbox.checked = !state[id];
  }

  function patch() {
    patchQueued = false;
    makeMetricsGrid();
    makeBottomTools();
    wireBorderToggle();
    applyBorderState();
  }

  function queuePatch() {
    if (patchQueued) return;
    patchQueued = true;
    requestAnimationFrame(() => requestAnimationFrame(patch));
  }

  window.addEventListener('load', () => {
    patch();
    toast('Selected item layout loaded');
  });
  document.addEventListener('click', queuePatch, true);
  document.addEventListener('change', queuePatch, true);
  document.addEventListener('input', queuePatch, true);
  document.addEventListener('pointerup', queuePatch, true);
  setInterval(queuePatch, 1200);
  patch();
})();
