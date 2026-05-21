(() => {
  const VERSION = 'v0.13c';
  const WORKING_COPY_KEY = 'artifex.sceneEditor.workingCopy.v1';
  const DOWNLOAD_KEY = 'artifex.sceneEditor.lastDownload.v1';
  let queued = false;

  function safeParse(text, fallback = null) {
    try { return JSON.parse(text); }
    catch { return fallback; }
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function formatStamp(iso) {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${String(date.getFullYear()).slice(-2)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function cleanFileName(value) {
    let text = String(value || '').trim();
    text = text.replace(/[📁💾🏗️]/g, '').trim();
    text = text.replace(/\|\s*LOCAL\s*:[\s\S]*$/i, '').trim();
    text = text.replace(/LOCAL\s*:[\s\S]*$/i, '').trim();
    text = text.replace(/HDD\s*:[\s\S]*$/i, '').trim();
    text = text.replace(/Local backup\s*:[\s\S]*$/i, '').trim();
    text = text.replace(/Last downloaded\s*:[\s\S]*$/i, '').trim();
    text = text.replace(/\s{2,}/g, ' ').trim();
    return text || 'Untitled JSON';
  }

  function readWorking() {
    return safeParse(localStorage.getItem(WORKING_COPY_KEY), null);
  }

  function readDownloaded() {
    return safeParse(localStorage.getItem(DOWNLOAD_KEY), null);
  }

  function field(id) {
    return document.getElementById(id)?.closest('.field') || null;
  }

  function group(columns, className = '') {
    const node = document.createElement('div');
    node.className = `card-layout-group card-layout-${columns} ${className}`.trim();
    return node;
  }

  function cell(node, extra = '') {
    const wrapper = document.createElement('div');
    wrapper.className = `card-layout-cell ${extra}`.trim();
    if (node) wrapper.appendChild(node);
    return wrapper;
  }

  function moveAll(parent, nodes) {
    nodes.filter(Boolean).forEach((node) => parent.appendChild(cell(node)));
  }

  function divider() {
    const node = document.createElement('div');
    node.className = 'card-layout-divider';
    return node;
  }

  function labelCell(text, extra = '') {
    const node = document.createElement('div');
    node.className = `metric-label-cell ${extra}`.trim();
    node.textContent = text || '';
    return node;
  }

  function valueCell(node, extra = '') {
    const wrapper = document.createElement('div');
    wrapper.className = `metric-value-cell ${extra}`.trim();
    if (node) wrapper.appendChild(node);
    return wrapper;
  }

  function stripFieldLabel(node) {
    if (!node) return node;
    const label = node.querySelector(':scope > label');
    if (label) label.classList.add('metric-internal-label-hidden');
    return node;
  }

  function cleanEmptyRows(scope) {
    scope.querySelectorAll('.field-row').forEach((row) => {
      if (!row.querySelector('.field, .wrap-image-btn, .scale-control-stack, .check-row, .button-row')) row.remove();
    });
  }

  function polishFilePill() {
    const pill = document.querySelector('.file-pill');
    if (!pill || pill.textContent.trim() === 'No file loaded') return;

    const working = readWorking();
    const downloaded = readDownloaded();
    const name = cleanFileName(
      working?.fileName ||
      pill.querySelector('.file-pill-name')?.textContent ||
      pill.querySelector('.file-pill-title')?.textContent ||
      pill.dataset.cleanFileName ||
      pill.textContent ||
      'Untitled JSON'
    );

    pill.dataset.cleanFileName = name;
    pill.classList.add('file-pill-v13');
    const html = `<span class="file-pill-project">Forever Bound Game</span><span class="file-pill-title">${escapeHtml(name)}</span><span class="file-pill-bottom"><span class="file-pill-action-icons" aria-hidden="true">📁 💾 🏗️</span><span class="file-pill-time">| LOCAL: ${escapeHtml(formatStamp(working?.savedAt))} | HDD: ${escapeHtml(formatStamp(downloaded?.downloadedAt))} |</span></span>`;
    if (pill.dataset.v13Html === html) return;
    pill.dataset.v13Html = html;
    pill.innerHTML = html;
  }

  function convertBasics() {
    const body = document.querySelector('[data-card-id="basics"] .card-body');
    if (!body || body.dataset.v13Layout === 'true') return;
    const sceneId = field('sceneId');
    const sceneName = field('sceneName');
    const sceneType = field('sceneType');
    const bg = field('sceneBg');
    const cols = field('gridCols');
    const rows = field('gridRows');
    const show = document.getElementById('gridShow')?.closest('.check-row') || null;
    if (!sceneId || !sceneName || !sceneType || !bg || !cols || !rows) return;

    const identity = group(1, 'basics-identity-group');
    moveAll(identity, [sceneId, sceneName, sceneType, bg]);

    const grid = group(2, 'basics-grid-group');
    moveAll(grid, [cols, rows]);

    const toggles = group(1, 'basics-toggle-group');
    if (show) toggles.appendChild(cell(show, 'cell-inline'));

    body.innerHTML = '';
    body.append(identity, grid, toggles);
    body.dataset.v13Layout = 'true';
  }

  function convertElements() {
    const body = document.querySelector('[data-card-id="elements"] .card-body');
    if (!body || body.dataset.v13Layout === 'true') return;
    const layerRow = body.querySelector('.layer-control-row');
    const list = body.querySelector('.item-list');
    if (!layerRow || !list) return;

    const controls = group(1, 'elements-controls-group');
    controls.appendChild(cell(layerRow, 'cell-inline'));

    const listGroup = group(1, 'elements-list-group');
    listGroup.appendChild(cell(list));

    body.innerHTML = '';
    body.append(controls, listGroup);
    body.dataset.v13Layout = 'true';
  }

  function wireScaleButton(button, delta) {
    if (!button || button.dataset.v13Scale === 'true') return;
    button.dataset.v13Scale = 'true';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const w = document.getElementById('itemW');
      const h = document.getElementById('itemH');
      if (!w || !h) return;
      w.value = Math.max(1, Number(w.value || 0) + delta);
      h.value = Math.max(1, Number(h.value || 0) + delta);
      w.dispatchEvent(new Event('input', { bubbles: true }));
      h.dispatchEvent(new Event('input', { bubbles: true }));
      w.dispatchEvent(new Event('change', { bubbles: true }));
      h.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function wireWrapButton(button) {
    if (!button || button.dataset.v13Wrap === 'true') return;
    button.dataset.v13Wrap = 'true';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const w = document.getElementById('itemW');
      const h = document.getElementById('itemH');
      const imgPath = document.getElementById('itemImage')?.value || document.querySelector('.scene-item.is-selected img')?.src || '';
      if (!w || !h || !imgPath) return;
      const img = new Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        if (!ratio || !Number.isFinite(ratio)) return;
        if (ratio >= 1) h.value = Math.max(1, +(Number(w.value || 1) / ratio).toFixed(3));
        else w.value = Math.max(1, +(Number(h.value || 1) * ratio).toFixed(3));
        w.dispatchEvent(new Event('input', { bubbles: true }));
        h.dispatchEvent(new Event('input', { bubbles: true }));
        w.dispatchEvent(new Event('change', { bubbles: true }));
        h.dispatchEvent(new Event('change', { bubbles: true }));
      };
      img.src = imgPath;
    });
  }

  function makeScaleControls() {
    let stack = document.querySelector('.scale-control-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'scale-control-stack selected-scale-stack-v13';
    }

    let up = stack.querySelector('.scale-up-btn');
    let wrap = stack.querySelector('.wrap-image-btn');
    let down = stack.querySelector('.scale-down-btn');

    if (!up) {
      up = document.createElement('button');
      up.type = 'button';
      up.className = 'scale-step-btn scale-up-btn';
      up.textContent = '⬆️';
      up.title = 'Scale width and height up by 2';
    }
    if (!wrap) {
      wrap = document.createElement('button');
      wrap.type = 'button';
      wrap.className = 'wrap-image-btn';
      wrap.textContent = '📐';
      wrap.title = 'Wrap image to aspect ratio';
    }
    if (!down) {
      down = document.createElement('button');
      down.type = 'button';
      down.className = 'scale-step-btn scale-down-btn';
      down.textContent = '⬇️';
      down.title = 'Scale width and height down by 2';
    }

    stack.innerHTML = '';
    stack.append(up, wrap, down);
    wireScaleButton(up, 2);
    wireWrapButton(wrap);
    wireScaleButton(down, -2);
    return stack;
  }

  function rebuildMetricsGrid() {
    const x = stripFieldLabel(field('itemX'));
    const y = stripFieldLabel(field('itemY'));
    const z = stripFieldLabel(field('itemZ'));
    const height = stripFieldLabel(field('itemH'));
    const width = stripFieldLabel(field('itemW'));
    const layer = stripFieldLabel(field('itemLayer'));
    if (!x || !y || !z || !height || !width || !layer) return null;

    const stack = makeScaleControls();
    const metrics = document.createElement('div');
    metrics.className = 'selected-metric-table-v13c';
    metrics.dataset.v13Built = 'true';

    metrics.append(labelCell('X Axis'), labelCell('Scale', 'metric-label-center'), labelCell('Height'));
    metrics.append(valueCell(x), valueCell(stack, 'metric-scale-value'), valueCell(height));
    metrics.append(labelCell('Y Axis'), labelCell('', 'metric-label-center'), labelCell('Width'));
    metrics.append(valueCell(y), valueCell(null, 'metric-blank-value'), valueCell(width));
    metrics.append(labelCell('Z / Depth'), labelCell('', 'metric-label-center'), labelCell('Layer'));
    metrics.append(valueCell(z), valueCell(null, 'metric-blank-value'), valueCell(layer));

    return metrics;
  }

  function placeholderSelect(label, options) {
    const field = document.createElement('div');
    field.className = 'field visual-placeholder-field';
    field.innerHTML = `<label>${escapeHtml(label)}</label><select disabled>${options.map((option) => `<option>${escapeHtml(option)}</option>`).join('')}</select>`;
    return field;
  }

  function placeholderInput(label, value = '') {
    const field = document.createElement('div');
    field.className = 'field visual-placeholder-field';
    field.innerHTML = `<label>${escapeHtml(label)}</label><input disabled value="${escapeHtml(value)}">`;
    return field;
  }

  function buildVisualPlaceholder() {
    const wrap = group(2, 'visual-effects-placeholder-group');
    const note = document.createElement('div');
    note.className = 'card-layout-note cell-span-2 visual-effects-note';
    note.textContent = 'Visual treatment placeholders for later: blend mode, opacity, transparent colour key, brightness, contrast, and saturation.';
    wrap.appendChild(cell(note, 'cell-span-2'));
    moveAll(wrap, [
      placeholderSelect('Blend Mode', ['normal', 'screen', 'multiply', 'lighter', 'darken']),
      placeholderInput('Opacity', '100%'),
      placeholderInput('Transparent Colour', '#000000'),
      placeholderInput('Brightness', '100%'),
      placeholderInput('Contrast', '100%'),
      placeholderInput('Saturation', '100%')
    ]);
    return wrap;
  }

  function convertSelected() {
    const body = document.querySelector('[data-card-id="selected"] .card-body');
    if (!body) return;
    if (body.dataset.v13Layout === 'true' && body.querySelector('.selected-metric-table-v13c')) return;

    const id = field('itemId');
    const name = field('itemName');
    const type = field('itemType');
    const image = field('itemImage');
    const text = field('itemText');
    if (!id || !name || !type || !image || !text) return;

    const identity = group(1, 'selected-identity-group');
    moveAll(identity, [id, name, type, image, text]);

    const metrics = rebuildMetricsGrid();
    const tags = field('itemTags');
    const tagGroup = group(1, 'selected-tags-group');
    if (tags) tagGroup.appendChild(cell(tags));

    const tools = body.querySelector('.selected-bottom-tools');
    const toolsGroup = group(1, 'selected-tools-layout-group');
    if (tools) toolsGroup.appendChild(cell(tools, 'cell-inline'));
    else {
      const deleteBtn = document.getElementById('deleteItem')?.closest('.button-row') || document.getElementById('deleteItem');
      const visible = document.getElementById('itemVisible')?.closest('.check-row');
      const border = document.getElementById('itemBorderVisible')?.closest('label') || body.querySelector('.border-toggle-row');
      const row = document.createElement('div');
      row.className = 'selected-bottom-tools';
      [deleteBtn, visible, border].filter(Boolean).forEach((node) => row.appendChild(node));
      if (row.children.length) toolsGroup.appendChild(cell(row, 'cell-inline'));
    }

    body.innerHTML = '';
    body.append(identity, divider());
    if (metrics) body.append(metrics);
    body.append(divider(), tagGroup, buildVisualPlaceholder(), toolsGroup);
    cleanEmptyRows(body);
    body.dataset.v13Layout = 'true';
  }

  function patch() {
    queued = false;
    polishFilePill();
    convertBasics();
    convertElements();
    convertSelected();
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
  setInterval(queue, 450);
  queue();
})();
