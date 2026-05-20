(() => {
  function toast(message) {
    const old = document.querySelector('.artifex-toast');
    if (old) old.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = message;
    document.body.appendChild(node);
    requestAnimationFrame(() => node.classList.add('show'));
    setTimeout(() => node.remove(), 2200);
  }

  function menu(html, x, y) {
    document.querySelector('.artifex-context')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-context';
    node.style.left = `${x}px`;
    node.style.top = `${y}px`;
    node.innerHTML = html;
    document.body.appendChild(node);
    return node;
  }

  document.addEventListener('contextmenu', (event) => {
    const reset = event.target.closest('#zoomResetBtn');
    if (reset) {
      event.preventDefault();
      const node = menu('<button type="button" data-action="zoom-default">Set default zoom</button>', event.clientX, event.clientY);
      node.querySelector('[data-action="zoom-default"]').addEventListener('click', () => {
        node.remove();
        toast('Default zoom saved');
      });
      return;
    }

    const item = event.target.closest('[data-stage-id]');
    if (item) {
      event.preventDefault();
      const name = item.querySelector('.item-label')?.textContent || item.dataset.stageId || 'Object';
      const kind = item.dataset.stageKind || 'object';
      const node = menu(`<div class="artifex-context-head"><strong>${name}</strong><span>${kind}</span></div><button type="button" data-action="zoom">Zoom to object</button><button type="button" data-action="props">Properties</button><button type="button" data-action="duplicate">Duplicate</button><button type="button" data-action="delete">Delete</button>`, event.clientX, event.clientY);
      node.addEventListener('click', (clickEvent) => {
        const action = clickEvent.target.dataset.action;
        if (!action) return;
        node.remove();
        toast(`${action} selected`);
      });
    }
  }, true);

  document.addEventListener('click', (event) => {
    if (!event.target.closest('.artifex-context')) document.querySelector('.artifex-context')?.remove();
  });
})();
