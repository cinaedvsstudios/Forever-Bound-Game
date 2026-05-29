(() => {
  const VERSION = window.ArtifexSceneEditorCore?.getVersion?.() || window.ArtifexSceneEditorConfig?.VERSION || 'v0.31-runtime-module-cleanup';
  const LAYER_LOCK_KEY = 'artifex.sceneEditor.layerLocks.v1';
  const BORDER_KEY = 'artifex.sceneEditor.borderHidden.v1';
  const ASSET_MANIFEST = '../../assets-library/asset-library.json';

  let queued = false;
  let draggingLayerRow = null;
  let applyingLayers = false;
  let dragHandleActive = false;
  let assetManifest = null;
  let assetManifestLoading = null;

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = `${VERSION}: ${message}`;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function safeJson(key, fallback = {}) {
    try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
    catch { return fallback; }
  }

  function writeJson(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); }
    catch {}
  }

  function field(id) {
    return document.getElementById(id)?.closest('.field') || null;
  }

  function cell(node, className = '') {
    const wrapper = document.createElement('div');
    wrapper.className = `card-layout-cell ${className}`.trim();
    if (node) wrapper.appendChild(node);
    return wrapper;
  }

  function group(columns, className = '') {
    const wrapper = document.createElement('div');
    wrapper.className = `card-layout-group card-layout-${columns} ${className}`.trim();
    return wrapper;
  }

  function dispatchInput(input) {
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function sidePanel() {
    return document.querySelector('.side-panel');
  }

  function saveScrollTop() {
    return sidePanel()?.scrollTop || 0;
  }

  function restoreScrollTop(value) {
    requestAnimationFrame(() => {
      const panel = sidePanel();
      if (panel) panel.scrollTop = value;
      requestAnimationFrame(() => {
        const again = sidePanel();
        if (again) again.scrollTop = value;
      });
    });
  }

  function hideFieldLabel(node) {
    node?.querySelector(':scope > label')?.classList.add('metric-internal-label-hidden');
    return node;
  }

  function iconButton(className, text, title) {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `${className} metric-icon-button`;
    node.textContent = text;
    node.title = title;
    return node;
  }

  function wireScale(node, delta) {
    node.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const w = document.getElementById('itemW');
      const h = document.getElementById('itemH');
      if (!w || !h) return;
      w.value = Math.max(1, Number(w.value || 0) + delta);
      h.value = Math.max(1, Number(h.value || 0) + delta);
      dispatchInput(w);
      dispatchInput(h);
    });
  }

  function wireWrap(node) {
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
        dispatchInput(w);
        dispatchInput(h);
      };
      img.src = path;
    });
  }

  function metricLabel(text, extra = '') {
    const node = document.createElement('div');
    node.className = `metric-label-cell ${extra}`.trim();
    node.textContent = text || '';
    return node;
  }

  function metricValue(node, extra = '') {
    const wrapper = document.createElement('div');
    wrapper.className = `metric-value-cell ${extra}`.trim();
    if (node) wrapper.appendChild(node);
    return wrapper;
  }

  function iconRow(...nodes) {
    const row = document.createElement('div');
    row.className = 'metric-icon-row';
    nodes.filter(Boolean).forEach((node) => row.appendChild(node));
    return row;
  }

  function buildMetricTable() {
    const x = hideFieldLabel(field('itemX'));
    const y = hideFieldLabel(field('itemY'));
    const z = hideFieldLabel(field('itemZ'));
    const height = hideFieldLabel(field('itemH'));
    const width = hideFieldLabel(field('itemW'));
    const layer = hideFieldLabel(field('itemLayer'));
    if (!x || !y || !z || !height || !width || !layer) return null;

    const up = iconButton('scale-step-btn scale-up-btn', '↑', 'Scale width and height up by 2');
    const down = iconButton('scale-step-btn scale-down-btn', '↓', 'Scale width and height down by 2');
    const wrap = iconButton('wrap-image-btn', '◺', 'Wrap image to aspect ratio');
    wireScale(up, 2);
    wireScale(down, -2);
    wireWrap(wrap);

    const table = document.createElement('div');
    table.className = 'selected-metric-table-v13c selected-metric-table-v15';
    table.append(
      metricLabel('X Axis'), metricLabel('Scale', 'metric-label-center'), metricLabel('Height'),
      metricValue(x), metricValue(iconRow(up, down), 'metric-icon-value'), metricValue(height),
      metricLabel('Y Axis'), metricLabel('', 'metric-label-center'), metricLabel('Width'),
      metricValue(y), metricValue(iconRow(wrap), 'metric-icon-value'), metricValue(width),
      metricLabel('Z / Depth'), metricLabel('', 'metric-label-center'), metricLabel('Layer'),
      metricValue(z), metricValue(null, 'metric-blank-value'), metricValue(layer)
    );
    return table;
  }

  function fieldMarkup(label, value = '', kind = 'input', options = []) {
    const control = kind === 'select'
      ? `<select disabled>${options.map((option) => `<option>${esc(option)}</option>`).join('')}</select>`
      : `<input disabled value="${esc(value)}">`;
    return `<div class="field visual-placeholder-field"><label>${esc(label)}</label>${control}</div>`;
  }

  function pathPlaceholder(label) {
    return `<div class="field visual-placeholder-field path-field"><label>${esc(label)}</label><div class="path-row"><input disabled value="none"><button type="button" class="path-menu-toggle v13f-disabled-picker" disabled title="Future file picker">📁</button></div></div>`;
  }

  function buildCard(id, title) {
    let card = document.querySelector(`[data-card-id="${id}"]`);
    if (!card) {
      card = document.createElement('section');
      card.className = 'panel-card card-selected v15-owned-card';
      card.dataset.cardId = id;
      card.innerHTML = `<h2><span>${esc(title)}</span><button class="card-toggle" type="button">↕</button></h2><div class="card-body"></div>`;
      card.querySelector('.card-toggle')?.addEventListener('click', () => card.classList.toggle('is-collapsed'));
    }
    card.querySelector('h2 span').textContent = title;
    return card;
  }

  function visualBody() {
    const wrapper = document.createElement('div');
    wrapper.className = 'v15-card-content visual-card-content-v15';
    wrapper.innerHTML = `
      <p class="card-layout-note">Image adjustment, colour adjustment, blend, transparency, glow, shadow, and future filter controls.</p>
      <div class="card-layout-group card-layout-2 visual-effects-placeholder-group v13e-adjustment-grid">
        ${fieldMarkup('Blend Mode', '', 'select', ['normal', 'screen', 'multiply', 'lighter', 'darken', 'overlay', 'color-dodge', 'color-burn'])}
        ${fieldMarkup('Opacity', '100%')}
        ${fieldMarkup('Brightness', '100%')}
        ${fieldMarkup('Contrast', '100%')}
        ${fieldMarkup('Saturation', '100%')}
        ${fieldMarkup('Hue', '0°')}
        ${fieldMarkup('Temperature / Tint', 'neutral')}
        ${fieldMarkup('Vibrance', '0')}
        ${fieldMarkup('Monochrome', 'off')}
        ${fieldMarkup('Transparent Colour', '#000000')}
        ${fieldMarkup('Threshold', 'off')}
        ${fieldMarkup('Threshold Alpha', 'off')}
        ${fieldMarkup('Exposure', '0')}
        ${fieldMarkup('Highlights / Shadows', 'default')}
        ${fieldMarkup('Levels', 'default')}
        ${fieldMarkup('Curves', 'default')}
        ${fieldMarkup('Drop Shadow', 'off')}
        ${fieldMarkup('Shadow Strength', '0')}
        ${fieldMarkup('Outer Glow', 'off')}
        ${fieldMarkup('Glow Strength', '0')}
        ${fieldMarkup('Vignette', 'off')}
        ${fieldMarkup('Vignette Strength', '0')}
      </div>`;
    return wrapper;
  }

  function animationBody() {
    const wrapper = document.createElement('div');
    wrapper.className = 'v15-card-content animation-card-content-v15';
    wrapper.innerHTML = `
      <p class="card-layout-note">Future object-linked animation controls and frame-browser entry point.</p>
      <div class="card-layout-group card-layout-2 v13e-adjustment-grid">
        ${pathPlaceholder('Animation File')}
        ${fieldMarkup('Animation Set', 'none')}
        ${fieldMarkup('Frame Source', 'none')}
        ${fieldMarkup('FPS', '12')}
        ${fieldMarkup('Loop Mode', '', 'select', ['loop', 'once', 'ping-pong', 'hold last'])}
        ${fieldMarkup('Start Frame', '0')}
        ${fieldMarkup('Frame Count', '0')}
      </div>`;
    return wrapper;
  }

  function audioBody() {
    const wrapper = document.createElement('div');
    wrapper.className = 'v15-card-content audio-card-content-v15';
    wrapper.innerHTML = `
      <p class="card-layout-note">Future object-linked dialogue, movement, interaction, and sound-effect controls.</p>
      <div class="card-layout-group card-layout-2 v13e-adjustment-grid">
        ${pathPlaceholder('Audio File')}
        ${fieldMarkup('Dialogue Sound', 'none')}
        ${fieldMarkup('Interact Sound', 'none')}
        ${fieldMarkup('Movement Sound', 'none')}
        ${fieldMarkup('Jump Sound', 'none')}
        ${fieldMarkup('Ambient Loop', 'none')}
        ${fieldMarkup('Volume', '100%')}
      </div>`;
    return wrapper;
  }

  function rotateBlock() {
    const rotate = group(2, 'rotate-placeholder-v13e');
    rotate.innerHTML = `${fieldMarkup('Rotate', '0°')}${fieldMarkup('Rotation Origin', 'centre')}`;
    return rotate;
  }

  function identityGroup() {
    const existing = document.querySelector('.selected-identity-group');
    if (existing) return existing;
    const ids = ['itemId', 'itemName', 'itemType', 'itemImage', 'itemText'];
    const fields = ids.map(field).filter(Boolean);
    if (!fields.length) return null;
    const wrapper = group(1, 'selected-identity-group');
    fields.forEach((node) => wrapper.appendChild(cell(node)));
    return wrapper;
  }

  function tagsGroup() {
    const existing = document.querySelector('.selected-tags-group');
    if (existing) return existing;
    const tagField = field('itemTags');
    if (!tagField) return null;
    const wrapper = group(1, 'selected-tags-group');
    wrapper.appendChild(cell(tagField));
    return wrapper;
  }

  function wireBorderToggle(label) {
    const checkbox = label?.querySelector('input');
    if (!checkbox || checkbox.dataset.v15Border === 'true') return;
    checkbox.dataset.v15Border = 'true';
    checkbox.addEventListener('change', () => {
      const id = document.getElementById('itemId')?.value || '';
      const state = safeJson(BORDER_KEY, {});
      state[id] = !checkbox.checked;
      writeJson(BORDER_KEY, state);
      applyBorders();
      toast(checkbox.checked ? 'Border shown' : 'Border hidden');
    });
  }

  function applyBorders() {
    const state = safeJson(BORDER_KEY, {});
    document.querySelectorAll('.scene-item[data-stage-id]').forEach((item) => {
      item.classList.toggle('border-hidden', !!state[item.dataset.stageId]);
    });
    const id = document.getElementById('itemId')?.value || '';
    const checkbox = document.getElementById('itemBorderVisible');
    if (checkbox) checkbox.checked = !state[id];
  }

  function toolsGroup() {
    const existing = document.querySelector('.selected-tools-layout-group');
    if (existing) return existing;
    const row = document.querySelector('.selected-bottom-tools') || document.createElement('div');
    row.className = 'selected-bottom-tools';
    const deleteBtn = document.getElementById('deleteItem')?.closest('.button-row') || document.getElementById('deleteItem');
    const visible = document.getElementById('itemVisible')?.closest('.check-row');
    let border = document.getElementById('itemBorderVisible')?.closest('label') || document.querySelector('.border-toggle-row');
    if (!border) {
      border = document.createElement('label');
      border.className = 'border-toggle-row';
      border.innerHTML = '<input id="itemBorderVisible" type="checkbox" checked> Border';
    }
    [deleteBtn, visible, border].filter(Boolean).forEach((node) => row.appendChild(node));
    wireBorderToggle(border);
    const wrapper = group(1, 'selected-tools-layout-group');
    wrapper.appendChild(cell(row, 'cell-inline'));
    return wrapper;
  }

  function enforceSelectedCards() {
    const selected = document.querySelector('[data-card-id="selected"]');
    const selectedBody = selected?.querySelector('.card-body');
    const objectId = document.getElementById('itemId')?.value || '';
    if (!selected || !selectedBody || !objectId) return;

    const alreadyClean = selected.dataset.v15Object === objectId &&
      document.querySelector('[data-card-id="transform-v15"]') &&
      document.querySelector('[data-card-id="visual-v15"]') &&
      document.querySelector('[data-card-id="animation-v15"]') &&
      document.querySelector('[data-card-id="audio-v15"]') &&
      !selectedBody.querySelector('.selected-metric-table-v13c, .visual-effects-placeholder-group, .selected-tags-group, .selected-tools-layout-group');
    if (alreadyClean) return;

    const identity = identityGroup();
    const table = document.querySelector('.selected-metric-table-v13c') || buildMetricTable();
    if (!identity || !table) return;

    const selectedTitle = selected.querySelector('h2 span');
    if (selectedTitle) selectedTitle.textContent = 'Object Details';

    const transform = buildCard('transform-v15', 'Transform');
    const visual = buildCard('visual-v15', 'Visual Adjustments');
    const animation = buildCard('animation-v15', 'Animation');
    const audio = buildCard('audio-v15', 'Audio');
    selected.after(transform, visual, animation, audio);

    const transformBody = transform.querySelector('.card-body');
    transformBody.replaceChildren(table, rotateBlock());
    const tags = tagsGroup();
    const tools = toolsGroup();
    if (tags) transformBody.appendChild(tags);
    if (tools) transformBody.appendChild(tools);
    visual.querySelector('.card-body').replaceChildren(visualBody());
    animation.querySelector('.card-body').replaceChildren(animationBody());
    audio.querySelector('.card-body').replaceChildren(audioBody());
    selectedBody.replaceChildren(identity);
    selected.dataset.v15Object = objectId;
    applyBorders();
  }

  function syncDragToCentre(event, notify = false) {
    if (!dragHandleActive) return;
    const stage = document.getElementById('stage');
    const x = document.getElementById('itemX');
    const y = document.getElementById('itemY');
    const w = document.getElementById('itemW');
    const h = document.getElementById('itemH');
    if (!stage || !x || !y || !w || !h) return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const nextX = clamp(((event.clientX - rect.left) / rect.width) * 100 - Number(w.value || 0) / 2, 0, 100);
    const nextY = clamp(((event.clientY - rect.top) / rect.height) * 100 - Number(h.value || 0) / 2, 0, 100);
    x.value = nextX;
    y.value = nextY;
    const selected = document.querySelector('.scene-item.is-selected');
    if (selected) {
      selected.style.left = `${nextX}%`;
      selected.style.top = `${nextY}%`;
    }
    if (notify) {
      dispatchInput(x);
      dispatchInput(y);
    }
  }

  function wireCentreHandleDrag() {
    if (document.body.dataset.v15CentreDrag === 'true') return;
    document.body.dataset.v15CentreDrag = 'true';
    document.addEventListener('pointerdown', (event) => {
      const handle = event.target.closest?.('.move-handle');
      if (!handle) return;
      dragHandleActive = true;
      document.body.classList.add('v13e-centre-dragging');
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    document.addEventListener('pointermove', (event) => {
      if (!dragHandleActive) return;
      syncDragToCentre(event, false);
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
    document.addEventListener('pointerup', (event) => {
      if (!dragHandleActive) return;
      syncDragToCentre(event, true);
      dragHandleActive = false;
      document.body.classList.remove('v13e-centre-dragging');
      queue();
    }, true);
  }

  function cleanPillText(text) {
    return String(text || '')
      .replace(/[🔓🔒]/g, '')
      .replace(/^\s*\d+\.\s*z?-?\d+\s*·\s*/i, '')
      .replace(/^\s*\d+\.\s*/i, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function layerRows() {
    return Array.from(document.querySelectorAll('.layer-stack-table-v14 .item-row[data-select-id]'));
  }

  function selectLayerRow(row) {
    row?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  }

  function setLayerForSelected(value) {
    const input = document.getElementById('itemLayer');
    const pill = document.getElementById('layerPill');
    if (input) {
      input.value = value;
      dispatchInput(input);
    }
    if (pill) {
      pill.value = value;
      pill.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  async function applyRecalculateLayers() {
    const currentRows = layerRows();
    if (!currentRows.length) return;
    const scrollTop = saveScrollTop();
    applyingLayers = true;
    const locks = safeJson(LAYER_LOCK_KEY, {});
    const total = currentRows.length;
    const rowData = currentRows.map((row, index) => ({ id: row.dataset.selectId, slot: Number(row.closest('.layer-stack-row')?.dataset.slot || index + 1), locked: locks[row.dataset.selectId] === true }));
    const assignments = [];
    rowData.filter((row) => row.locked).forEach((row) => assignments.push({ id: row.id, layer: total - row.slot + 1 }));
    let nextUnlocked = 0;
    const unlocked = rowData.filter((row) => !row.locked);
    for (let slot = 1; slot <= total; slot += 1) {
      const layer = total - slot + 1;
      if (assignments.some((entry) => entry.layer === layer)) continue;
      const row = unlocked[nextUnlocked++];
      if (row) assignments.push({ id: row.id, layer });
    }
    const selectedBefore = document.querySelector('.item-row.is-selected')?.dataset.selectId || document.getElementById('itemId')?.value || '';
    for (const entry of assignments) {
      const fresh = document.querySelector(`.item-row[data-select-id="${CSS.escape(entry.id)}"]`);
      if (!fresh) continue;
      selectLayerRow(fresh);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      restoreScrollTop(scrollTop);
      setLayerForSelected(entry.layer);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      restoreScrollTop(scrollTop);
    }
    if (selectedBefore) {
      const old = document.querySelector(`.item-row[data-select-id="${CSS.escape(selectedBefore)}"]`);
      if (old) selectLayerRow(old);
    }
    applyingLayers = false;
    restoreScrollTop(scrollTop);
    setTimeout(() => { patch(); restoreScrollTop(scrollTop); }, 80);
    toast('Layers recalculated');
  }

  function toggleLayerLock(row) {
    const id = row?.dataset.selectId;
    if (!id) return;
    const locks = safeJson(LAYER_LOCK_KEY, {});
    locks[id] = !locks[id];
    writeJson(LAYER_LOCK_KEY, locks);
    patch();
    toast(locks[id] ? 'Layer locked' : 'Layer unlocked');
  }

  function sanitizeLayerStack(list) {
    const locks = safeJson(LAYER_LOCK_KEY, {});
    list.querySelectorAll('.layer-stack-row').forEach((wrapper, index) => {
      wrapper.dataset.slot = String(index + 1);
      const slot = wrapper.querySelector('.layer-slot-number');
      if (slot) slot.textContent = String(index + 1);
      const row = wrapper.querySelector('.item-row[data-select-id]');
      if (row) {
        row.querySelectorAll('.element-lock-toggle').forEach((node) => node.style.display = 'none');
        row.childNodes.forEach((node) => { if (node.nodeType === Node.TEXT_NODE) node.textContent = cleanPillText(node.textContent); });
      }
      const buttons = Array.from(wrapper.querySelectorAll(':scope > .layer-lock-btn'));
      const id = row?.dataset.selectId;
      buttons.forEach((button, buttonIndex) => {
        if (buttonIndex > 0) button.remove();
        else {
          button.textContent = locks[id] ? '🔒' : '🔓';
          button.title = locks[id] ? 'Unlock layer slot' : 'Lock layer slot';
        }
      });
      if (!buttons.length && row) {
        const lock = document.createElement('button');
        lock.type = 'button';
        lock.className = 'layer-lock-btn';
        lock.textContent = locks[id] ? '🔒' : '🔓';
        lock.title = locks[id] ? 'Unlock layer slot' : 'Lock layer slot';
        wrapper.appendChild(lock);
      }
    });
  }

  function buildLayerStack() {
    const list = document.querySelector('[data-card-id="elements"] .item-list');
    if (!list) return;
    if (list.dataset.v15Stack === 'true') {
      sanitizeLayerStack(list);
      return;
    }
    const itemRows = Array.from(list.querySelectorAll(':scope > .item-row[data-select-id]'));
    if (!itemRows.length) return;
    const locks = safeJson(LAYER_LOCK_KEY, {});
    list.dataset.v15Stack = 'true';
    list.dataset.v14Stack = 'true';
    list.classList.add('layer-stack-table-v14');
    itemRows.forEach((row, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'layer-stack-row';
      wrapper.dataset.slot = String(index + 1);
      wrapper.draggable = true;
      row.draggable = false;
      const id = row.dataset.selectId;
      row.classList.add('layer-stack-pill');
      row.querySelectorAll('.element-lock-toggle').forEach((node) => node.style.display = 'none');
      row.textContent = cleanPillText(row.textContent);
      const slot = document.createElement('span');
      slot.className = 'layer-slot-number';
      slot.textContent = String(index + 1);
      const lock = document.createElement('button');
      lock.type = 'button';
      lock.className = 'layer-lock-btn';
      lock.textContent = locks[id] ? '🔒' : '🔓';
      lock.title = locks[id] ? 'Unlock layer slot' : 'Lock layer slot';
      wrapper.append(slot, row, lock);
      list.appendChild(wrapper);
    });
    list.querySelectorAll(':scope > .item-row').forEach((node) => node.remove());
    sanitizeLayerStack(list);
  }

  function wireLayerStack() {
    const list = document.querySelector('.layer-stack-table-v14');
    if (!list || list.dataset.v15Wired === 'true') return;
    list.dataset.v15Wired = 'true';
    list.addEventListener('click', (event) => {
      const lock = event.target.closest('.layer-lock-btn');
      if (!lock) return;
      event.preventDefault();
      event.stopPropagation();
      toggleLayerLock(lock.closest('.layer-stack-row')?.querySelector('.item-row'));
    }, true);
    list.addEventListener('dragstart', (event) => {
      const row = event.target.closest('.layer-stack-row');
      if (!row) return;
      const item = row.querySelector('.item-row');
      if (safeJson(LAYER_LOCK_KEY, {})[item?.dataset.selectId]) {
        event.preventDefault();
        toast('Locked layers stay fixed');
        return;
      }
      draggingLayerRow = row;
      row.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
    });
    list.addEventListener('dragover', (event) => {
      if (!draggingLayerRow) return;
      event.preventDefault();
      const over = event.target.closest('.layer-stack-row');
      if (!over || over === draggingLayerRow) return;
      const overItem = over.querySelector('.item-row');
      if (safeJson(LAYER_LOCK_KEY, {})[overItem?.dataset.selectId]) return;
      const rect = over.getBoundingClientRect();
      const before = event.clientY < rect.top + rect.height / 2;
      list.insertBefore(draggingLayerRow, before ? over : over.nextSibling);
      renumberLayerSlots();
    });
    list.addEventListener('dragend', () => {
      if (!draggingLayerRow) return;
      const scrollTop = saveScrollTop();
      draggingLayerRow.classList.remove('is-dragging');
      draggingLayerRow = null;
      renumberLayerSlots();
      restoreScrollTop(scrollTop);
      applyRecalculateLayers();
    });
  }

  function renumberLayerSlots() {
    document.querySelectorAll('.layer-stack-table-v14 .layer-stack-row').forEach((row, index) => {
      row.dataset.slot = String(index + 1);
      const slot = row.querySelector('.layer-slot-number');
      if (slot) slot.textContent = String(index + 1);
    });
  }

  function addRecalculateButton() {
    const controls = document.querySelector('[data-card-id="elements"] .layer-control-row');
    if (!controls) return;
    let button = controls.querySelector('#recalculateLayersBtn') || controls.querySelector('#cleanLayersBtn');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.id = 'recalculateLayersBtn';
      button.className = 'btn clean-layers-btn recalculate-layers-btn';
      controls.appendChild(button);
    }
    button.id = 'recalculateLayersBtn';
    button.textContent = '🔁 Recalculate';
    button.title = 'Recalculate layer numbers from the visible stack order';
    if (button.dataset.v15Recalc !== 'true') {
      button.dataset.v15Recalc = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        applyRecalculateLayers();
      });
    }
  }

  async function loadAssetManifest() {
    if (assetManifest) return assetManifest;
    if (!assetManifestLoading) {
      assetManifestLoading = fetch(`${ASSET_MANIFEST}?v=${Date.now()}`, { cache: 'no-store' })
        .then((response) => response.ok ? response.json() : null)
        .then((json) => { assetManifest = json; return json; })
        .catch(() => null)
        .finally(() => { assetManifestLoading = null; });
    }
    return assetManifestLoading;
  }

  function classifyAsset(asset) {
    const text = [asset?.id, asset?.name, asset?.category, asset?.type, asset?.format, asset?.recommendedUse, asset?.path, ...(asset?.tags || [])].join(' ').toLowerCase();
    const cats = new Set(['all']);
    if (/mel|guy|person|people|npc|character|player|creature|animal|bat|bird|foe|enemy/.test(text)) cats.add('characters');
    if (/bat|bird|animal|creature|foe|enemy/.test(text)) cats.add('animals');
    if (/cave|rock|log|tree|forest|environment|background|fg|bg|door|exit|path|wall|ground|water/.test(text)) cats.add('environment');
    if (/door|exit|gate|portal|entrance/.test(text)) cats.add('doors-exits');
    if (/effect|fx|vfx|magic|fire|spark|smoke|glitter|burst|portal|twinkle|explosion|overlay|flame|ring/.test(text)) cats.add('effects');
    if (/ui|button|panel|hud|heart|icon/.test(text)) cats.add('ui');
    if (/background|bg|sky|mountain|scene/.test(text)) cats.add('backgrounds');
    if (/pickup|item|gem|crystal|diamond|prism|orb|heart|treasure|relic/.test(text)) cats.add('pickups');
    if (!['characters','animals','environment','doors-exits','effects','ui','backgrounds','pickups'].some((cat) => cats.has(cat))) cats.add('objects');
    return cats;
  }

  function applyAssetCategoryFilter(popup) {
    const select = popup.querySelector('#assetGameCategory');
    if (!select || !assetManifest) return;
    const wanted = select.value || 'all';
    popup.querySelectorAll('.asset-card-btn[data-asset-id]').forEach((card) => {
      const asset = (assetManifest.assets || []).find((item) => item.id === card.dataset.assetId);
      card.classList.toggle('asset-game-filter-hidden', !(wanted === 'all' || classifyAsset(asset).has(wanted)));
    });
  }

  function patchAssetBrowser() {
    const popup = document.querySelector('.asset-picker-popup');
    if (!popup) return;
    const close = popup.querySelector('[data-close]');
    if (close) { close.textContent = '✖'; close.title = 'Close'; close.classList.add('asset-icon-button'); }
    const clear = popup.querySelector('#assetClear');
    if (clear) { clear.textContent = '🧹'; clear.title = 'Clear filters'; clear.classList.add('asset-icon-button'); }
    const reload = popup.querySelector('#assetReload');
    if (reload) { reload.textContent = '🔄'; reload.title = 'Reload asset manifest'; reload.classList.add('asset-icon-button'); }
    const search = popup.querySelector('#assetSearch');
    if (search && !popup.querySelector('#assetGameCategory')) {
      const select = document.createElement('select');
      select.id = 'assetGameCategory';
      select.title = 'Game category';
      select.innerHTML = '<option value="all">all categories</option><option value="characters">characters + animals</option><option value="objects">objects</option><option value="environment">environment</option><option value="doors-exits">doors / exits</option><option value="effects">effects</option><option value="pickups">pickups / relics</option><option value="backgrounds">backgrounds</option><option value="ui">ui</option>';
      search.after(select);
      select.addEventListener('input', () => applyAssetCategoryFilter(popup));
      select.addEventListener('change', () => applyAssetCategoryFilter(popup));
    }
    if (popup.dataset.v15AssetFilter !== 'true') {
      popup.dataset.v15AssetFilter = 'true';
      popup.addEventListener('input', () => setTimeout(() => applyAssetCategoryFilter(popup), 0), true);
      popup.addEventListener('change', () => setTimeout(() => applyAssetCategoryFilter(popup), 0), true);
      popup.addEventListener('click', (event) => {
        if (event.target.closest('#assetClear')) setTimeout(() => { const select = popup.querySelector('#assetGameCategory'); if (select) select.value = 'all'; applyAssetCategoryFilter(popup); }, 0);
        if (event.target.closest('#assetReload')) setTimeout(() => loadAssetManifest().then(() => applyAssetCategoryFilter(popup)), 150);
      }, true);
    }
    loadAssetManifest().then(() => applyAssetCategoryFilter(popup));
  }

  function patch() {
    queued = false;
    wireCentreHandleDrag();
    enforceSelectedCards();
    buildLayerStack();
    addRecalculateButton();
    wireLayerStack();
    patchAssetBrowser();
    applyBorders();
  }

  function queue() {
    if (queued || draggingLayerRow || applyingLayers || dragHandleActive) return;
    queued = true;
    requestAnimationFrame(() => requestAnimationFrame(patch));
  }

  window.addEventListener('load', () => { patch(); toast('Consolidated layout helper loaded'); });
  document.addEventListener('click', queue, true);
  document.addEventListener('change', queue, true);
  document.addEventListener('input', queue, true);
  document.addEventListener('pointerup', queue, true);
  setInterval(queue, 1200);
  patch();
})();
