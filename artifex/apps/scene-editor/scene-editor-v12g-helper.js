(() => {
  const VERSION = 'v0.12h';
  const TARGET_ZOOM = 2.0;
  let queued = false;
  let handleDragActive = false;

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = VERSION + ': ' + message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  function parseZoom() {
    const scale = document.querySelector('.stage-scale');
    const text = scale ? scale.style.transform || '' : '';
    const match = text.match(/scale\(([^)]+)\)/);
    return match ? Number(match[1]) || 1 : 1;
  }

  function findSelectedItem() {
    const idInput = document.getElementById('itemId');
    const selectedId = idInput ? idInput.value : '';
    if (selectedId) {
      const byId = Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find((item) => item.getAttribute('data-stage-id') === selectedId);
      if (byId) return byId;
    }
    return document.querySelector('.scene-item.is-selected');
  }

  function zoomToSelectedObjectTarget() {
    const selected = findSelectedItem();
    if (!selected) return toast('No selected object to zoom to');
    let current = parseZoom();
    let safety = 0;
    const zoomIn = document.getElementById('zoomIn');
    while (zoomIn && current < TARGET_ZOOM - 0.02 && safety < 16) {
      zoomIn.click();
      current += 0.1;
      safety += 1;
    }
    setTimeout(() => {
      const target = findSelectedItem() || selected;
      target?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
      document.querySelectorAll('.context-menu').forEach((menu) => menu.remove());
      toast('Zoomed to object at 200%');
    }, 180);
  }

  function addMoveHandles() {
    document.querySelectorAll('.scene-item[data-stage-id]').forEach((item) => {
      let handle = item.querySelector(':scope > .move-handle');
      if (!handle) {
        handle = document.createElement('button');
        handle.type = 'button';
        handle.className = 'move-handle';
        handle.title = 'Drag here to move this object';
        handle.setAttribute('aria-label', 'Move object');
        item.appendChild(handle);
      }
      handle.textContent = '';
    });
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      queued = false;
      addMoveHandles();
    }));
  }

  function bindPointerRules() {
    if (document.body.getAttribute('data-v12h-move-handles') === 'true') return;
    document.body.setAttribute('data-v12h-move-handles', 'true');

    document.addEventListener('pointerdown', (event) => {
      const handle = event.target.closest ? event.target.closest('.move-handle') : null;
      const item = event.target.closest ? event.target.closest('.scene-item') : null;
      if (handle && item) {
        handleDragActive = true;
        document.body.classList.add('is-handle-moving');
        item.classList.add('is-handle-moving');
        handle.classList.add('is-dragging');
        return;
      }
      if (item) {
        handleDragActive = false;
        document.body.classList.remove('is-handle-moving');
      }
    }, true);

    document.addEventListener('pointermove', (event) => {
      const stage = event.target.closest ? event.target.closest('#stage') : null;
      if (stage && !handleDragActive) event.stopImmediatePropagation();
    }, true);

    document.addEventListener('pointerup', () => {
      handleDragActive = false;
      document.body.classList.remove('is-handle-moving');
      document.querySelectorAll('.move-handle.is-dragging, .scene-item.is-handle-moving').forEach((node) => node.classList.remove('is-dragging', 'is-handle-moving'));
      queue();
    }, true);

    document.addEventListener('click', (event) => {
      const zoomButton = event.target.closest ? event.target.closest('[data-action="zoomObject"]') : null;
      if (!zoomButton) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      zoomToSelectedObjectTarget();
    }, true);
  }

  window.addEventListener('load', () => {
    bindPointerRules();
    queue();
    toast('Move handles loaded');
  });
  document.addEventListener('click', queue, true);
  document.addEventListener('pointerup', queue, true);
  document.addEventListener('change', queue, true);
  setInterval(queue, 1000);
  bindPointerRules();
  queue();
})();
