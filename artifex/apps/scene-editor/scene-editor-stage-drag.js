(() => {
  'use strict';

  function stageNodeFor(id) {
    return Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find(node => node.dataset.stageId === id) || null;
  }

  function syncSelectedInputs(item) {
    const x = document.getElementById('itemX');
    const y = document.getElementById('itemY');
    if (x) x.value = item.x ?? 0;
    if (y) y.value = item.y ?? 0;
  }

  function createCoreMoveDragController(deps) {
    let drag = null;

    function start(event, node) {
      if (event.button === 2) return;
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

    function wire() {
      if (document.body.dataset.artifexCoreMoveEvents === 'true') return;
      document.body.dataset.artifexCoreMoveEvents = 'true';
      document.addEventListener('pointerdown', event => {
        const handle = event.target.closest?.('.move-handle');
        const node = handle?.closest?.('.scene-item[data-stage-id]');
        if (handle && node) start(event, node);
      }, true);
      document.addEventListener('pointermove', event => {
        if (!drag) return;
        update(event);
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }, true);
      document.addEventListener('pointerup', event => end(event), true);
      document.addEventListener('pointercancel', event => end(event), true);
      document.addEventListener('mouseleave', event => {
        if (event.target === document || event.target === document.documentElement) end(event);
      }, true);
      window.addEventListener('blur', () => end(null));
    }

    return { wire, end };
  }

  window.ArtifexSceneEditorStageDrag = Object.freeze({
    createCoreMoveDragController,
    stageNodeFor,
    syncSelectedInputs
  });
})();
