(() => {
  const menuStyle = [
    'position:fixed',
    'z-index:999999',
    'min-width:190px',
    'padding:8px',
    'border:1px solid rgba(195,0,255,.85)',
    'border-radius:14px',
    'background:rgba(8,9,10,.98)',
    'box-shadow:0 18px 42px rgba(0,0,0,.65),0 0 24px rgba(195,0,255,.35)',
    'color:#f1dcc2',
    'font-family:Inter,system-ui,sans-serif',
    'font-size:12px'
  ].join(';');

  const buttonStyle = [
    'display:block',
    'width:100%',
    'min-height:30px',
    'margin:3px 0',
    'padding:6px 9px',
    'border:1px solid rgba(184,119,63,.45)',
    'border-radius:10px',
    'background:linear-gradient(180deg,rgba(44,29,24,.96),rgba(18,14,14,.96))',
    'color:#f1dcc2',
    'text-align:left',
    'cursor:pointer',
    'font-size:12px'
  ].join(';');

  function toast(message) {
    const old = document.querySelector('.artifex-toast');
    if (old) old.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = message;
    node.style.cssText = 'position:fixed;right:24px;bottom:24px;z-index:999999;padding:11px 15px;border:1px solid rgba(195,0,255,.8);border-radius:999px;background:rgba(0,0,0,.94);color:#f1dcc2;box-shadow:0 0 24px rgba(195,0,255,.35),0 14px 32px rgba(0,0,0,.5);font-family:Inter,system-ui,sans-serif;font-size:12px;';
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2400);
  }

  function menu(html, x, y) {
    document.querySelector('.artifex-context')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-context';
    node.style.cssText = `${menuStyle};left:${x}px;top:${y}px;`;
    node.innerHTML = html;
    document.body.appendChild(node);
    node.querySelectorAll('button').forEach((button) => button.style.cssText = buttonStyle);
    return node;
  }

  function safeText(value) {
    return String(value || '').replace(/[&<>]/g, (match) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[match]));
  }

  document.addEventListener('contextmenu', (event) => {
    const reset = event.target.closest && event.target.closest('#zoomResetBtn');
    if (reset) {
      event.preventDefault();
      event.stopPropagation();
      const node = menu('<button type="button" data-action="zoom-default">Set default zoom</button>', event.clientX, event.clientY);
      node.querySelector('[data-action="zoom-default"]').addEventListener('click', () => {
        node.remove();
        toast('Default zoom saved');
      });
      return;
    }

    const item = event.target.closest && event.target.closest('[data-stage-id]');
    if (item) {
      event.preventDefault();
      event.stopPropagation();
      const name = safeText(item.querySelector('.item-label')?.textContent || item.dataset.stageId || 'Object');
      const kind = safeText(item.dataset.stageKind || 'object');
      const node = menu(`<div style="display:grid;gap:2px;padding:8px 9px 10px;border-bottom:1px solid rgba(184,119,63,.35);margin-bottom:6px"><strong style="color:#ffd6a0;font-size:13px">${name}</strong><span style="color:#bfa990;font-size:11px">${kind}</span></div><button type="button" data-action="zoom">Zoom to object</button><button type="button" data-action="props">Properties</button><button type="button" data-action="duplicate">Duplicate</button><button type="button" data-action="remove">Delete</button>`, event.clientX, event.clientY);
      node.addEventListener('click', (clickEvent) => {
        const action = clickEvent.target.dataset.action;
        if (!action) return;
        node.remove();
        toast(`${action} selected`);
      });
    }
  }, true);

  document.addEventListener('click', (event) => {
    if (!(event.target.closest && event.target.closest('.artifex-context'))) {
      document.querySelector('.artifex-context')?.remove();
    }
  });

  console.info('Artifex context-fix inline menu loaded');
})();
