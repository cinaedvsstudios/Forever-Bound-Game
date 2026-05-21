(() => {
  const VERSION = 'v0.12f';
  const BORDER_KEY = 'artifex.sceneEditor.borderHidden.v1';
  let queued = false;

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = VERSION + ': ' + message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  function readState() {
    try { return JSON.parse(localStorage.getItem(BORDER_KEY) || '{}'); }
    catch (error) { return {}; }
  }

  function writeState(state) {
    try { localStorage.setItem(BORDER_KEY, JSON.stringify(state)); }
    catch (error) {}
  }

  function selectedId() {
    const input = document.getElementById('itemId');
    return input ? input.value : '';
  }

  function field(id) {
    const input = document.getElementById(id);
    return input ? input.closest('.field') : null;
  }

  function stageImageForSelected() {
    const id = selectedId();
    if (!id) return null;
    const nodes = document.querySelectorAll('.scene-item[data-stage-id]');
    for (const node of nodes) {
      if (node.getAttribute('data-stage-id') === id) return node.querySelector('img');
    }
    return null;
  }

  function dispatchNumberChange(input) {
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function scaleSelected(delta) {
    const w = document.getElementById('itemW');
    const h = document.getElementById('itemH');
    if (!w || !h) return toast('No selected object to scale');
    const nextW = Math.max(1, +(Number(w.value || 0) + delta).toFixed(3));
    const nextH = Math.max(1, +(Number(h.value || 0) + delta).toFixed(3));
    w.value = nextW;
    h.value = nextH;
    dispatchNumberChange(w);
    dispatchNumberChange(h);
    toast(delta > 0 ? 'Scaled up +2' : 'Scaled down -2');
    queue();
  }

  function wrapImage() {
    const w = document.getElementById('itemW');
    const h = document.getElementById('itemH');
    const imageInput = document.getElementById('itemImage');
    const stageImg = stageImageForSelected();
    const src = stageImg?.src || imageInput?.value || '';
    if (!w || !h || !src) return toast('No selected image to wrap');

    const img = new Image();
    img.onload = function () {
      const nw = img.naturalWidth;
      const nh = img.naturalHeight;
      if (!nw || !nh) return toast('Could not read image size');
      const ratio = nw / nh;
      const currentW = Number(w.value || 10);
      const currentH = Number(h.value || 10);
      if (ratio >= 1) h.value = Math.max(1, +(currentW / ratio).toFixed(3));
      else w.value = Math.max(1, +(currentH * ratio).toFixed(3));
      dispatchNumberChange(w);
      dispatchNumberChange(h);
      toast('Wrapped image ' + nw + '×' + nh);
    };
    img.onerror = function () { toast('Could not load image for wrap'); };
    img.src = src;
  }

  function ensureWrapButton() {
    let button = document.querySelector('.wrap-image-btn');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'wrap-image-btn';
      button.textContent = '📐';
      button.title = 'Wrap image to aspect ratio';
    }
    if (button.getAttribute('data-v12f') !== 'true') {
      button.setAttribute('data-v12f', 'true');
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        wrapImage();
      });
    }
    return button;
  }

  function ensureScaleControls() {
    let stack = document.querySelector('.scale-control-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'scale-control-stack';
      const up = document.createElement('button');
      up.type = 'button';
      up.className = 'scale-step-btn scale-up-btn';
      up.textContent = '⬆️';
      up.title = 'Scale width and height up by 2';
      const down = document.createElement('button');
      down.type = 'button';
      down.className = 'scale-step-btn scale-down-btn';
      down.textContent = '⬇️';
      down.title = 'Scale width and height down by 2';
      stack.append(up, ensureWrapButton(), down);
    } else {
      const wrap = ensureWrapButton();
      if (wrap.parentElement !== stack) {
        const down = stack.querySelector('.scale-down-btn');
        stack.insertBefore(wrap, down || null);
      }
    }

    const up = stack.querySelector('.scale-up-btn');
    const down = stack.querySelector('.scale-down-btn');
    if (up && up.getAttribute('data-v12f') !== 'true') {
      up.setAttribute('data-v12f', 'true');
      up.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        scaleSelected(2);
      });
    }
    if (down && down.getAttribute('data-v12f') !== 'true') {
      down.setAttribute('data-v12f', 'true');
      down.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        scaleSelected(-2);
      });
    }
    return stack;
  }

  function removeEmptyRows(rows) {
    rows.forEach(function (row) {
      if (!row || !row.classList || !row.classList.contains('field-row')) return;
      if (!row.querySelector('.field') && !row.querySelector('.wrap-image-btn') && !row.querySelector('.scale-control-stack')) row.remove();
    });
  }

  function ensureMetricsDivider(grid) {
    if (!grid) return;
    let divider = document.querySelector('.selected-metrics-divider');
    if (!divider) {
      divider = document.createElement('div');
      divider.className = 'selected-metrics-divider';
    }
    if (divider.previousElementSibling !== grid) grid.after(divider);
  }

  function buildMetricsGrid() {
    const body = document.querySelector('[data-card-id="selected"] .card-body');
    const x = field('itemX');
    const y = field('itemY');
    const width = field('itemW');
    const height = field('itemH');
    const layer = field('itemLayer');
    const zInput = document.getElementById('itemZ');
    const z = zInput ? zInput.closest('.field') : null;
    if (!body || !x || !y || !width || !height || !layer || !z) return;

    const scaleControls = ensureScaleControls();
    let grid = body.querySelector('.selected-metrics-grid');
    const rows = [x, y, width, height, layer, z, scaleControls].map(function (node) {
      return node && node.closest ? node.closest('.field-row') : null;
    }).filter(Boolean);

    if (!grid) {
      grid = document.createElement('div');
      grid.className = 'selected-metrics-grid';
      body.insertBefore(grid, rows[0] || x);
    }

    if (grid.parentElement !== body) body.insertBefore(grid, rows[0] || x);

    x.classList.add('metric-x');
    y.classList.add('metric-y');
    z.classList.add('metric-z');
    height.classList.add('metric-height');
    width.classList.add('metric-width');
    layer.classList.add('metric-layer');

    grid.appendChild(x);
    grid.appendChild(scaleControls);
    grid.appendChild(height);
    grid.appendChild(y);
    grid.appendChild(width);
    grid.appendChild(z);
    grid.appendChild(layer);

    removeEmptyRows(Array.from(new Set(rows)));
    ensureMetricsDivider(grid);
  }

  function buildBorderToggle() {
    const body = document.querySelector('[data-card-id="selected"] .card-body');
    const tags = field('itemTags');
    const visible = document.getElementById('itemVisible');
    const visibleRow = visible ? visible.closest('.check-row') : null;
    const deleteButton = document.getElementById('deleteItem');
    const deleteRow = deleteButton ? deleteButton.closest('.button-row') : null;
    if (!body || !tags || !visibleRow || !deleteRow) return;

    let tools = body.querySelector('.selected-bottom-tools');
    if (!tools) {
      const divider = document.createElement('div');
      divider.className = 'selected-card-divider';
      tools = document.createElement('div');
      tools.className = 'selected-bottom-tools';
      tags.after(divider, tools);
    }

    if (deleteRow.parentElement !== tools) tools.appendChild(deleteRow);
    if (visibleRow.parentElement !== tools) tools.appendChild(visibleRow);

    let borderLabel = document.getElementById('itemBorderVisible')?.closest('label');
    if (!borderLabel) {
      borderLabel = document.createElement('label');
      borderLabel.className = 'border-toggle-row';
      borderLabel.innerHTML = '<input id="itemBorderVisible" type="checkbox"> Border';
      tools.appendChild(borderLabel);
    } else if (borderLabel.parentElement !== tools) {
      tools.appendChild(borderLabel);
    }

    wireBorderToggle();
  }

  function wireBorderToggle() {
    const checkbox = document.getElementById('itemBorderVisible');
    if (!checkbox) return;
    const id = selectedId();
    const state = readState();
    checkbox.checked = !state[id];
    if (checkbox.getAttribute('data-v12f') === 'true') return;
    checkbox.setAttribute('data-v12f', 'true');
    checkbox.addEventListener('change', function () {
      const current = selectedId();
      const next = readState();
      next[current] = !checkbox.checked;
      writeState(next);
      applyBorders();
      toast(checkbox.checked ? 'Border shown' : 'Border hidden');
    });
  }

  function applyBorders() {
    const state = readState();
    document.querySelectorAll('.scene-item[data-stage-id]').forEach(function (item) {
      const id = item.getAttribute('data-stage-id');
      item.classList.toggle('border-hidden', !!state[id]);
    });
    const checkbox = document.getElementById('itemBorderVisible');
    const id = selectedId();
    if (checkbox && id) checkbox.checked = !state[id];
  }

  function parseZoom() {
    const scale = document.querySelector('.stage-scale');
    const text = scale ? scale.style.transform || '' : '';
    const match = text.match(/scale\(([^)]+)\)/);
    return match ? Number(match[1]) || 1 : 1;
  }

  function zoomToSelectedObject() {
    const selected = document.querySelector('.scene-item.is-selected');
    const id = selected ? selected.getAttribute('data-stage-id') : selectedId();
    if (!id) return toast('No selected object to zoom to');
    let current = parseZoom();
    let safety = 0;
    while (current < 1.55 && safety < 12) {
      const btn = document.getElementById('zoomIn');
      if (!btn) break;
      btn.click();
      current += 0.1;
      safety += 1;
    }
    setTimeout(function () {
      const nodes = document.querySelectorAll('.scene-item[data-stage-id]');
      let node = null;
      for (const item of nodes) {
        if (item.getAttribute('data-stage-id') === id) node = item;
      }
      if (node) node.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
      document.querySelectorAll('.context-menu').forEach(function (menu) { menu.remove(); });
      toast('Zoomed to object');
    }, 120);
  }

  function interceptZoomToObject() {
    if (document.body.getAttribute('data-v12f-zoom') === 'true') return;
    document.body.setAttribute('data-v12f-zoom', 'true');
    document.addEventListener('click', function (event) {
      const button = event.target.closest ? event.target.closest('[data-action="zoomObject"]') : null;
      if (!button) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      zoomToSelectedObject();
    }, true);
  }

  function patch() {
    queued = false;
    buildMetricsGrid();
    buildBorderToggle();
    applyBorders();
    interceptZoomToObject();
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(function () { requestAnimationFrame(patch); });
  }

  window.addEventListener('load', queue);
  document.addEventListener('click', queue, true);
  document.addEventListener('change', queue, true);
  document.addEventListener('input', queue, true);
  document.addEventListener('pointerup', queue, true);
  setInterval(queue, 1200);
  patch();
})();
