(() => {
  const VERSION = 'v0.12i';
  let queued = false;

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = VERSION + ': ' + message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  function addMoveHandles() {
    if (document.body.dataset.artifexCoreMoveDrag === 'true') return;
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
    if (document.body.dataset.artifexCoreMoveDrag === 'true') return;
    if (document.body.getAttribute('data-v12i-move-handles') === 'true') return;
    document.body.setAttribute('data-v12i-move-handles', 'true');

    let handleDragActive = false;
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
  }

  window.addEventListener('load', () => {
    bindPointerRules();
    queue();
    if (document.body.dataset.artifexCoreMoveDrag !== 'true') toast('Move handles loaded');
  });
  document.addEventListener('click', queue, true);
  document.addEventListener('pointerup', queue, true);
  document.addEventListener('change', queue, true);
  setInterval(queue, 1000);
  bindPointerRules();
  queue();
})();
