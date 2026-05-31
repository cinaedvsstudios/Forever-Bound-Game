(() => {
  'use strict';

  const PAN_KEY = 'artifex.sceneEditor.workspacePan.v1';
  let workspacePan = readWorkspacePan();

  function readWorkspacePan() {
    try {
      const saved = JSON.parse(localStorage.getItem(PAN_KEY) || '{}');
      return { x: Number(saved.x || 0), y: Number(saved.y || 0) };
    } catch {
      return { x: 0, y: 0 };
    }
  }

  function saveWorkspacePan() {
    try { localStorage.setItem(PAN_KEY, JSON.stringify(workspacePan)); } catch {}
  }

  function applyWorkspacePan() {
    const scale = document.querySelector('.stage-scale');
    if (scale) scale.style.translate = `${workspacePan.x}px ${workspacePan.y}px`;
  }

  function stageNodeFor(id) {
    return Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find(node => node.dataset.stageId === id) || null;
  }

  function syncNumericField(id, value) {
    const source = document.getElementById(id);
    if (!source) return;
    source.value = value;
    const control = source.closest('.value-slider-field-v18');
    const readout = control?.querySelector('.value-slider-readout-v18');
    const range = control?.querySelector('.value-slider-range-v18');
    if (readout && document.activeElement !== readout) readout.value = value;
    if (range) range.value = value;
  }

  function syncSelectedInputs(item) {
    syncNumericField('itemX', item.x ?? 0);
    syncNumericField('itemY', item.y ?? 0);
  }

  function createCoreMoveDragController(deps) {
    let drag = null;
    let panDrag = null;

    function start(event, node) {
      if (event.button !== 0) return;
      deps.selectSilently(node.dataset.stageKind || 'element', node.dataset.stageId || '');
      const item = deps.getSelectedItem();
      if (!item) return;
      deps.clearContext();
      drag = { item, id: deps.getSelectedId(), kind: deps.getSelectedKind(), pointerId: event.pointerId };
      document.body.classList.add('is-handle-moving', 'v13e-centre-dragging');
      document.querySelectorAll('.scene-item.is-selected').forEach(selected => selected.classList.remove('is-selected'));
      document.querySelectorAll('.move-handle.is-dragging, .scene-item.is-handle-moving').forEach(active => active.classList.remove('is-dragging', 'is-handle-moving'));
      node.classList.add('is-selected', 'is-handle-moving');
      event.target.closest?.('.move-handle')?.classList.add('is-dragging');
      try { node.setPointerCapture?.(event.pointerId); } catch {}
      update(event);
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }

    function update(event) {
      if (!drag?.item) return;
      const stage = document.getElementById('stage');
      if (!stage) return;
      const rect = stage.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const width = Number(drag.item.width || 0);
      const height = Number(drag.item.height || 0);
      const nextX = deps.clamp(((event.clientX - rect.left) / rect.width) * 100 - width / 2, 0, 100);
      const nextY = deps.clamp(((event.clientY - rect.top) / rect.height) * 100 - height / 2, 0, 100);
      drag.item.x = Number(nextX.toFixed(3));
      drag.item.y = Number(nextY.toFixed(3));
      const node = stageNodeFor(drag.id);
      if (node) {
        node.style.left = `${drag.item.x}%`;
        node.style.top = `${drag.item.y}%`;
      }
      syncSelectedInputs(drag.item);
      deps.saveWorkingCopySoon('drag');
    }

    function end(event, shouldRender = true) {
      if (!drag) return;
      const active = drag;
      const node = stageNodeFor(active.id);
      try { node?.releasePointerCapture?.(active.pointerId); } catch {}
      drag = null;
      document.body.classList.remove('is-handle-moving', 'v13e-centre-dragging');
      document.querySelectorAll('.move-handle.is-dragging, .scene-item.is-handle-moving').forEach(activeNode => activeNode.classList.remove('is-dragging', 'is-handle-moving'));
      deps.saveWorkingCopySoon('drag');
      if (shouldRender) deps.render();
    }

    function beginPan(event) {
      if (event.button !== 1 || !event.target.closest?.('.stage-wrap')) return false;
      panDrag = { startX: event.clientX, startY: event.clientY, x: workspacePan.x, y: workspacePan.y };
      document.querySelector('.stage-wrap')?.classList.add('is-panning');
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return true;
    }

    function movePan(event) {
      if (!panDrag) return false;
      workspacePan.x = Number((panDrag.x + event.clientX - panDrag.startX).toFixed(2));
      workspacePan.y = Number((panDrag.y + event.clientY - panDrag.startY).toFixed(2));
      applyWorkspacePan();
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return true;
    }

    function endPan(event) {
      if (!panDrag) return false;
      panDrag = null;
      saveWorkspacePan();
      document.querySelector('.stage-wrap')?.classList.remove('is-panning');
      event?.preventDefault?.();
      event?.stopPropagation?.();
      event?.stopImmediatePropagation?.();
      return true;
    }

    function wire() {
      if (document.body.dataset.artifexCoreMoveEvents === 'true') return;
      document.body.dataset.artifexCoreMoveEvents = 'true';
      applyWorkspacePan();
      const app = document.getElementById('editor-app');
      if (app && app.dataset.workspacePanObserver !== 'true') {
        app.dataset.workspacePanObserver = 'true';
        new MutationObserver(() => applyWorkspacePan()).observe(app, { childList: true, subtree: true });
      }
      document.addEventListener('auxclick', event => {
        if (event.button === 1 && event.target.closest?.('.stage-wrap')) event.preventDefault();
      }, true);
      document.addEventListener('pointerdown', event => {
        if (beginPan(event)) return;
        const handle = event.target.closest?.('.move-handle');
        const node = handle?.closest?.('.scene-item[data-stage-id]');
        if (handle && node) start(event, node);
      }, true);
      document.addEventListener('pointermove', event => {
        if (movePan(event)) return;
        if (!drag) return;
        update(event);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }, true);
      document.addEventListener('pointerup', event => {
        if (endPan(event)) return;
        end(event);
      }, true);
      document.addEventListener('pointercancel', event => {
        if (endPan(event)) return;
        end(event);
      }, true);
      document.addEventListener('mouseleave', event => {
        if (event.target === document || event.target === document.documentElement) {
          endPan(event);
          end(event);
        }
      }, true);
      window.addEventListener('blur', () => { endPan(null); end(null); });
    }

    return { wire, end };
  }

  window.ArtifexSceneEditorStageDrag = Object.freeze({ createCoreMoveDragController, stageNodeFor, syncSelectedInputs });
})();