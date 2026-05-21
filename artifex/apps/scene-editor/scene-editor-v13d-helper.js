(() => {
  const VERSION = 'v0.13d';
  let queued = false;

  function field(id) {
    return document.getElementById(id)?.closest('.field') || null;
  }

  function hideLabel(node) {
    node?.querySelector(':scope > label')?.classList.add('metric-internal-label-hidden');
    return node;
  }

  function button(className, text, title) {
    let node = document.querySelector(`.${className}`);
    if (!node) {
      node = document.createElement('button');
      node.type = 'button';
      node.className = className;
    }
    node.textContent = text;
    node.title = title;
    node.classList.add('metric-icon-button');
    return node;
  }

  function dispatchMetricInput(input) {
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function wireScale(node, delta) {
    if (!node || node.dataset.v13dScale === String(delta)) return;
    node.dataset.v13dScale = String(delta);
    node.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const w = document.getElementById('itemW');
      const h = document.getElementById('itemH');
      if (!w || !h) return;
      w.value = Math.max(1, Number(w.value || 0) + delta);
      h.value = Math.max(1, Number(h.value || 0) + delta);
      dispatchMetricInput(w);
      dispatchMetricInput(h);
    });
  }

  function wireWrap(node) {
    if (!node || node.dataset.v13dWrap === 'true') return;
    node.dataset.v13dWrap = 'true';
    node.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const w = document.getElementById('itemW');
      const h = document.getElementById('itemH');
      const path = document.getElementById('itemImage')?.value || document.querySelector('.scene-item.is-selected img')?.src || '';
      if (!w || !h || !path) return;
      const img = new Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        if (!ratio || !Number.isFinite(ratio)) return;
        if (ratio >= 1) h.value = Math.max(1, +(Number(w.value || 1) / ratio).toFixed(3));
        else w.value = Math.max(1, +(Number(h.value || 1) * ratio).toFixed(3));
        dispatchMetricInput(w);
        dispatchMetricInput(h);
      };
      img.src = path;
    });
  }

  function label(text, extra = '') {
    const node = document.createElement('div');
    node.className = `metric-label-cell ${extra}`.trim();
    node.textContent = text;
    return node;
  }

  function value(node, extra = '') {
    const wrap = document.createElement('div');
    wrap.className = `metric-value-cell ${extra}`.trim();
    if (node) wrap.appendChild(node);
    return wrap;
  }

  function iconRow(...nodes) {
    const row = document.createElement('div');
    row.className = 'metric-icon-row';
    nodes.filter(Boolean).forEach((node) => row.appendChild(node));
    return row;
  }

  function rebuildMetricTable() {
    const existing = document.querySelector('.selected-metric-table-v13c');
    if (!existing || existing.dataset.v13dLayout === 'true') return;

    const x = hideLabel(field('itemX'));
    const y = hideLabel(field('itemY'));
    const z = hideLabel(field('itemZ'));
    const height = hideLabel(field('itemH'));
    const width = hideLabel(field('itemW'));
    const layer = hideLabel(field('itemLayer'));
    if (!x || !y || !z || !height || !width || !layer) return;

    const up = button('scale-step-btn scale-up-btn', '↑', 'Scale width and height up by 2');
    const down = button('scale-step-btn scale-down-btn', '↓', 'Scale width and height down by 2');
    const wrap = button('wrap-image-btn', '◺', 'Wrap image to aspect ratio');
    wireScale(up, 2);
    wireScale(down, -2);
    wireWrap(wrap);

    existing.innerHTML = '';
    existing.classList.add('selected-metric-table-v13d');
    existing.append(
      label('X Axis'), label('Scale', 'metric-label-center'), label('Height'),
      value(x), value(iconRow(up, down), 'metric-icon-value'), value(height),
      label('Y Axis'), label('', 'metric-label-center'), label('Width'),
      value(y), value(iconRow(wrap), 'metric-icon-value'), value(width),
      label('Z / Depth'), label('', 'metric-label-center'), label('Layer'),
      value(z), value(null, 'metric-blank-value'), value(layer)
    );
    existing.dataset.v13dLayout = 'true';
  }

  function patch() {
    queued = false;
    rebuildMetricTable();
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => requestAnimationFrame(patch));
  }

  window.addEventListener('load', queue);
  document.addEventListener('click', queue, true);
  document.addEventListener('input', queue, true);
  document.addEventListener('change', queue, true);
  document.addEventListener('pointerup', queue, true);
  setInterval(queue, 500);
  queue();
})();
