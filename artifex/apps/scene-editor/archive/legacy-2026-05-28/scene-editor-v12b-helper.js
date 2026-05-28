(() => {
  const VERSION = 'v0.12b';
  let queued = false;

  function field(id) {
    return document.getElementById(id)?.closest('.field') || null;
  }

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = `${VERSION}: ${message}`;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  function selectedImage() {
    const id = document.getElementById('itemId')?.value || '';
    return id ? document.querySelector(`.scene-item[data-stage-id="${CSS.escape(id)}"] img`) : null;
  }

  function doWrap() {
    const w = document.getElementById('itemW');
    const h = document.getElementById('itemH');
    const source = selectedImage()?.src || document.getElementById('itemImage')?.value || '';
    if (!w || !h || !source) return toast('No selected image to wrap');
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      if (!ratio) return toast('Could not read image size');
      if (ratio >= 1) h.value = Math.max(1, +(Number(w.value || 10) / ratio).toFixed(3));
      else w.value = Math.max(1, +(Number(h.value || 10) * ratio).toFixed(3));
      w.dispatchEvent(new Event('input', { bubbles: true }));
      h.dispatchEvent(new Event('input', { bubbles: true }));
      w.dispatchEvent(new Event('change', { bubbles: true }));
      h.dispatchEvent(new Event('change', { bubbles: true }));
      toast(`Wrapped image ${img.naturalWidth}×${img.naturalHeight}`);
    };
    img.onerror = () => toast('Could not load image for wrap');
    img.src = source;
  }

  function ensureWrap() {
    let button = document.querySelector('.wrap-image-btn');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'wrap-image-btn';
      button.textContent = '📐';
      button.title = 'Wrap image to aspect ratio';
    }
    if (button.dataset.v12b !== 'true') {
      button.dataset.v12b = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        doWrap();
      });
    }
    return button;
  }

  function clearEmptyRows(rows) {
    rows.forEach((row) => {
      if (row?.classList?.contains('field-row') && !row.querySelector('.field') && !row.querySelector('.wrap-image-btn')) row.remove();
    });
  }

  function patch() {
    queued = false;
    const body = document.querySelector('[data-card-id="selected"] .card-body');
    const x = field('itemX');
    const y = field('itemY');
    const z = document.getElementById('itemZ')?.closest('.field') || null;
    const width = field('itemW');
    const height = field('itemH');
    const layer = field('itemLayer');
    if (!body || !x || !y || !z || !width || !height || !layer) return;

    const wrap = ensureWrap();
    let grid = body.querySelector('.selected-metrics-grid');
    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'selected-metrics-grid';
      body.insertBefore(grid, x.closest('.field-row') || x);
    } else if (grid.parentElement !== body) {
      body.insertBefore(grid, x.closest('.field-row') || x);
    }

    x.classList.add('metric-x');
    y.classList.add('metric-y');
    z.classList.add('metric-z');
    height.classList.add('metric-height');
    width.classList.add('metric-width');
    layer.classList.add('metric-layer');

    const rows = [x, y, z, width, height, layer, wrap].map((n) => n.closest?.('.field-row')).filter(Boolean);
    grid.append(x, wrap, height, y, width, z, layer);
    clearEmptyRows(Array.from(new Set(rows)));
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => requestAnimationFrame(patch));
  }

  window.addEventListener('load', queue);
  document.addEventListener('click', queue, true);
  document.addEventListener('change', queue, true);
  document.addEventListener('input', queue, true);
  document.addEventListener('pointerup', queue, true);
  setInterval(queue, 1200);
  patch();
})();