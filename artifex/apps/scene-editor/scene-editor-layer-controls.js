(() => {
  'use strict';

  const LAYER_LOCK_KEY = 'artifex.sceneEditor.layerLocks.v1';
  let draggingLayerRow = null;
  let applyingLayers = false;

  function api() { return window.ArtifexSceneEditorCore || null; }
  function toast(message) { api()?.toast?.(message); }
  function locks() { try { return JSON.parse(localStorage.getItem(LAYER_LOCK_KEY) || '{}'); } catch { return {}; } }
  function saveLocks(next) { try { localStorage.setItem(LAYER_LOCK_KEY, JSON.stringify(next)); } catch {} }
  function layerRows() { return Array.from(document.querySelectorAll('.layer-stack-table-v14 .layer-stack-row')); }
  function liveItems() {
    const scene = api()?.getScene?.();
    if (!scene) return [];
    return [...(scene.layers || []), ...(scene.elements || []), ...(scene.ui || [])];
  }
  function renumberLayerSlots() {
    layerRows().forEach((row, index) => {
      row.dataset.slot = String(index + 1);
      const slot = row.querySelector('.layer-slot-number');
      if (slot) slot.textContent = String(index + 1);
    });
  }
  function setLayerForItem(id, layer) {
    const item = liveItems().find((entry) => entry.id === id);
    if (!item) return;
    item.layer = layer;
    item.z = layer;
  }
  function applyRecalculateLayers() {
    if (applyingLayers) return;
    const rows = layerRows();
    if (!rows.length) return;
    applyingLayers = true;
    const lockMap = locks();
    const total = rows.length;
    const rowData = rows.map((row, index) => ({
      id: row.querySelector('.item-row')?.dataset.selectId || '',
      slot: Number(row.dataset.slot || index + 1),
      locked: lockMap[row.querySelector('.item-row')?.dataset.selectId || ''] === true
    })).filter((row) => row.id);
    const assignments = [];
    rowData.filter((row) => row.locked).forEach((row) => assignments.push({ id: row.id, layer: total - row.slot + 1 }));
    let nextUnlocked = 0;
    const unlocked = rowData.filter((row) => !row.locked);
    for (let slot = 1; slot <= total; slot += 1) {
      const layer = total - slot + 1;
      if (assignments.some((entry) => entry.layer === layer)) continue;
      const row = unlocked[nextUnlocked++];
      if (row) assignments.push({ id: row.id, layer });
    }
    assignments.forEach((entry) => setLayerForItem(entry.id, entry.layer));
    api()?.saveWorkingCopySoon?.('recalculate layers');
    toast('Layers recalculated');
    applyingLayers = false;
    api()?.render?.();
  }
  function toggleLayerLock(row) {
    const id = row?.querySelector('.item-row')?.dataset.selectId;
    if (!id) return;
    const next = locks();
    next[id] = !next[id];
    saveLocks(next);
    api()?.render?.();
    toast(next[id] ? 'Layer locked' : 'Layer unlocked');
  }
  function wireLayerStack() {
    const list = document.querySelector('.layer-stack-table-v14');
    if (!list || list.dataset.layerOwnerBound === 'true') return;
    list.dataset.layerOwnerBound = 'true';
    list.addEventListener('click', (event) => {
      const lock = event.target.closest?.('.layer-lock-btn');
      if (!lock) return;
      event.preventDefault();
      event.stopPropagation();
      toggleLayerLock(lock.closest('.layer-stack-row'));
    }, true);
    list.addEventListener('dragstart', (event) => {
      const row = event.target.closest?.('.layer-stack-row');
      if (!row) return;
      const id = row.querySelector('.item-row')?.dataset.selectId;
      if (locks()[id]) {
        event.preventDefault();
        toast('Locked layers stay fixed');
        return;
      }
      draggingLayerRow = row;
      row.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
    });
    list.addEventListener('dragover', (event) => {
      if (!draggingLayerRow) return;
      event.preventDefault();
      const over = event.target.closest?.('.layer-stack-row');
      if (!over || over === draggingLayerRow) return;
      const overId = over.querySelector('.item-row')?.dataset.selectId;
      if (locks()[overId]) return;
      const rect = over.getBoundingClientRect();
      list.insertBefore(draggingLayerRow, event.clientY < rect.top + rect.height / 2 ? over : over.nextSibling);
      renumberLayerSlots();
    });
    list.addEventListener('dragend', () => {
      if (!draggingLayerRow) return;
      draggingLayerRow.classList.remove('is-dragging');
      draggingLayerRow = null;
      renumberLayerSlots();
      applyRecalculateLayers();
    });
  }
  function bind() {
    wireLayerStack();
    const recalc = document.getElementById('recalculateLayersBtn');
    if (recalc && recalc.dataset.layerOwnerBound !== 'true') {
      recalc.dataset.layerOwnerBound = 'true';
      recalc.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); applyRecalculateLayers(); });
    }
    const pill = document.getElementById('layerPill');
    if (pill && pill.dataset.layerOwnerBound !== 'true') {
      pill.dataset.layerOwnerBound = 'true';
      pill.addEventListener('change', (event) => {
        const item = api()?.getSelectedItem?.();
        if (!item) return;
        item.layer = Number(event.target.value || 0);
        item.z = item.layer;
        api()?.saveWorkingCopySoon?.('layer pill');
        api()?.render?.();
      });
    }
    const itemLayer = document.getElementById('itemLayer');
    if (itemLayer && itemLayer.dataset.layerOwnerBound !== 'true') {
      itemLayer.dataset.layerOwnerBound = 'true';
      itemLayer.addEventListener('input', (event) => {
        const item = api()?.getSelectedItem?.();
        if (!item) return;
        item.layer = Number(event.target.value || 0);
        item.z = item.layer;
        const node = Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find((candidate) => candidate.dataset.stageId === item.id);
        if (node) node.style.zIndex = String(item.layer);
        api()?.saveWorkingCopySoon?.('layer field');
      });
    }
  }
  document.addEventListener('click', () => requestAnimationFrame(bind), true);
  document.addEventListener('change', () => requestAnimationFrame(bind), true);
  window.addEventListener('load', bind);
  bind();
})();
