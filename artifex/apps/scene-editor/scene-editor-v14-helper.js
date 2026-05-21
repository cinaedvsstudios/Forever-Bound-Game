(() => {
  const VERSION = 'v0.14b';
  const LOCK_KEY = 'artifex.sceneEditor.layerLocks.v1';
  let queued = false;
  let draggingRow = null;
  let applyingLayers = false;

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

  function readLocks() {
    try { return JSON.parse(localStorage.getItem(LOCK_KEY) || '{}'); }
    catch { return {}; }
  }

  function writeLocks(locks) {
    try { localStorage.setItem(LOCK_KEY, JSON.stringify(locks)); }
    catch {}
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

  function rows() {
    return Array.from(document.querySelectorAll('.layer-stack-table-v14 .item-row[data-select-id]'));
  }

  function cleanPillText(text) {
    return String(text || '')
      .replace(/[🔓🔒]/g, '')
      .replace(/^\s*\d+\.\s*z?-?\d+\s*·\s*/i, '')
      .replace(/^\s*\d+\.\s*/i, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  function selectRow(row) {
    row?.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
  }

  function setLayerForSelected(value) {
    const input = document.getElementById('itemLayer');
    const pill = document.getElementById('layerPill');
    if (input) {
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
    if (pill) {
      pill.value = value;
      pill.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  async function waitFrame() {
    await new Promise((resolve) => requestAnimationFrame(resolve));
  }

  function selectedLayerId() {
    return document.querySelector('.item-row.is-selected')?.dataset.selectId || document.getElementById('itemId')?.value || '';
  }

  async function applyCleanLayersFromDom() {
    const currentRows = rows();
    if (!currentRows.length) return;
    const scrollTop = saveScrollTop();
    applyingLayers = true;
    const locks = readLocks();
    const total = currentRows.length;
    const rowData = currentRows.map((row, index) => ({
      id: row.dataset.selectId,
      slot: Number(row.closest('.layer-stack-row')?.dataset.slot || index + 1),
      locked: locks[row.dataset.selectId] === true
    }));
    const locked = rowData.filter((row) => row.locked);
    const unlocked = rowData.filter((row) => !row.locked);
    const assignments = [];

    locked.forEach((row) => assignments.push({ id: row.id, layer: total - row.slot + 1 }));

    let nextUnlocked = 0;
    for (let slot = 1; slot <= total; slot += 1) {
      const layer = total - slot + 1;
      if (assignments.some((entry) => entry.layer === layer)) continue;
      const row = unlocked[nextUnlocked++];
      if (row) assignments.push({ id: row.id, layer });
    }

    const selectedBefore = selectedLayerId();
    for (const entry of assignments) {
      const freshRow = document.querySelector(`.item-row[data-select-id="${CSS.escape(entry.id)}"]`);
      if (!freshRow) continue;
      selectRow(freshRow);
      await waitFrame();
      restoreScrollTop(scrollTop);
      setLayerForSelected(entry.layer);
      await waitFrame();
      restoreScrollTop(scrollTop);
    }

    if (selectedBefore) {
      const old = document.querySelector(`.item-row[data-select-id="${CSS.escape(selectedBefore)}"]`);
      if (old) selectRow(old);
    }
    applyingLayers = false;
    restoreScrollTop(scrollTop);
    setTimeout(() => { patch(); restoreScrollTop(scrollTop); }, 80);
    toast('Layers recalculated');
  }

  function toggleLock(row) {
    const id = row?.dataset.selectId;
    if (!id) return;
    const locks = readLocks();
    locks[id] = !locks[id];
    writeLocks(locks);
    patch();
    toast(locks[id] ? 'Layer locked' : 'Layer unlocked');
  }

  function sanitizeExistingStack(list) {
    const locks = readLocks();
    list.querySelectorAll('.layer-stack-row').forEach((wrapper, index) => {
      wrapper.dataset.slot = String(index + 1);
      const slot = wrapper.querySelector('.layer-slot-number');
      if (slot) slot.textContent = String(index + 1);
      const row = wrapper.querySelector('.item-row[data-select-id]');
      if (row) row.textContent = cleanPillText(row.textContent);
      const buttons = Array.from(wrapper.querySelectorAll('.layer-lock-btn'));
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

  function wrapRows() {
    const list = document.querySelector('[data-card-id="elements"] .item-list');
    if (!list) return;
    if (list.dataset.v14Stack === 'true') {
      sanitizeExistingStack(list);
      return;
    }
    const itemRows = Array.from(list.querySelectorAll(':scope > .item-row[data-select-id]'));
    if (!itemRows.length) return;
    const locks = readLocks();
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
    sanitizeExistingStack(list);
  }

  function wireLayerStack() {
    const list = document.querySelector('.layer-stack-table-v14');
    if (!list || list.dataset.v14bWired === 'true') return;
    list.dataset.v14bWired = 'true';

    list.addEventListener('click', (event) => {
      const lock = event.target.closest('.layer-lock-btn');
      if (!lock) return;
      event.preventDefault();
      event.stopPropagation();
      toggleLock(lock.closest('.layer-stack-row')?.querySelector('.item-row'));
    }, true);

    list.addEventListener('dragstart', (event) => {
      const row = event.target.closest('.layer-stack-row');
      if (!row) return;
      const item = row.querySelector('.item-row');
      if (readLocks()[item?.dataset.selectId]) {
        event.preventDefault();
        toast('Locked layers stay fixed');
        return;
      }
      draggingRow = row;
      row.classList.add('is-dragging');
      event.dataTransfer.effectAllowed = 'move';
    });

    list.addEventListener('dragover', (event) => {
      if (!draggingRow) return;
      event.preventDefault();
      const over = event.target.closest('.layer-stack-row');
      if (!over || over === draggingRow) return;
      const overItem = over.querySelector('.item-row');
      if (readLocks()[overItem?.dataset.selectId]) return;
      const rect = over.getBoundingClientRect();
      const before = event.clientY < rect.top + rect.height / 2;
      list.insertBefore(draggingRow, before ? over : over.nextSibling);
      renumberSlots();
    });

    list.addEventListener('dragend', () => {
      if (!draggingRow) return;
      const scrollTop = saveScrollTop();
      draggingRow.classList.remove('is-dragging');
      draggingRow = null;
      renumberSlots();
      restoreScrollTop(scrollTop);
      applyCleanLayersFromDom();
    });
  }

  function renumberSlots() {
    document.querySelectorAll('.layer-stack-table-v14 .layer-stack-row').forEach((row, index) => {
      row.dataset.slot = String(index + 1);
      const n = row.querySelector('.layer-slot-number');
      if (n) n.textContent = String(index + 1);
    });
  }

  function addRecalculateButton() {
    const controls = document.querySelector('[data-card-id="elements"] .elements-controls-group .layer-control-row');
    if (!controls) return;
    const old = controls.querySelector('#cleanLayersBtn');
    if (old) {
      old.textContent = '🔁 Recalculate';
      old.title = 'Recalculate layer numbers from the visible stack order';
      return;
    }
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'cleanLayersBtn';
    button.className = 'btn clean-layers-btn recalculate-layers-btn';
    button.textContent = '🔁 Recalculate';
    button.title = 'Recalculate layer numbers from the visible stack order';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      applyCleanLayersFromDom();
    });
    controls.appendChild(button);
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
    let section = document.querySelector(`[data-card-id="${id}"]`);
    if (section) return section;
    section = document.createElement('section');
    section.className = 'panel-card card-selected v13f-synthetic-card';
    section.dataset.cardId = id;
    section.innerHTML = `<h2><span>${esc(title)}</span><button class="card-toggle" type="button">↕</button></h2><div class="card-body"></div>`;
    section.querySelector('.card-toggle')?.addEventListener('click', () => section.classList.toggle('is-collapsed'));
    return section;
  }

  function makeVisualBody() {
    const wrap = document.createElement('div');
    wrap.className = 'v14b-card-content visual-card-content-v14b';
    wrap.innerHTML = `
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
    return wrap;
  }

  function makeAnimationBody() {
    const wrap = document.createElement('div');
    wrap.className = 'v14b-card-content animation-card-content-v14b';
    wrap.innerHTML = `
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
    return wrap;
  }

  function makeAudioBody() {
    const wrap = document.createElement('div');
    wrap.className = 'v14b-card-content audio-card-content-v14b';
    wrap.innerHTML = `
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
    return wrap;
  }

  function ensureRotatePlaceholder() {
    let rotate = document.querySelector('.rotate-placeholder-v13e');
    if (rotate) return rotate;
    rotate = document.createElement('div');
    rotate.className = 'card-layout-group card-layout-2 rotate-placeholder-v13e';
    rotate.innerHTML = `${fieldMarkup('Rotate', '0°')}${fieldMarkup('Rotation Origin', 'centre')}`;
    return rotate;
  }

  function splitSelectedCards() {
    const selected = document.querySelector('[data-card-id="selected"]');
    const body = selected?.querySelector('.card-body');
    if (!selected || !body) return;

    const identity = body.querySelector('.selected-identity-group') || document.querySelector('.selected-identity-group');
    const table = document.querySelector('.selected-metric-table-v13c');
    if (!identity || !table) return;

    const title = selected.querySelector('h2 span');
    if (title) title.textContent = 'Object Details';

    const transform = buildCard('transform-v13f', 'Transform');
    const visual = buildCard('visual-v13f', 'Visual Adjustments');
    const animation = buildCard('animation-v13f', 'Animation');
    const audio = buildCard('audio-v13f', 'Audio');
    selected.after(transform, visual, animation, audio);

    const transformBody = transform.querySelector('.card-body');
    const tags = document.querySelector('.selected-tags-group');
    const tools = document.querySelector('.selected-tools-layout-group');
    transformBody.replaceChildren(table, ensureRotatePlaceholder());
    if (tags) transformBody.appendChild(tags);
    if (tools) transformBody.appendChild(tools);

    visual.querySelector('.card-body').replaceChildren(makeVisualBody());
    animation.querySelector('.card-body').replaceChildren(makeAnimationBody());
    audio.querySelector('.card-body').replaceChildren(makeAudioBody());

    body.replaceChildren(identity);
    selected.dataset.v14bClean = document.getElementById('itemId')?.value || 'clean';
  }

  function patch() {
    queued = false;
    splitSelectedCards();
    wrapRows();
    addRecalculateButton();
    wireLayerStack();
  }

  function queue() {
    if (queued || draggingRow || applyingLayers) return;
    queued = true;
    requestAnimationFrame(() => requestAnimationFrame(patch));
  }

  window.addEventListener('load', () => { patch(); toast('Layer/card cleanup loaded'); });
  document.addEventListener('click', queue, true);
  document.addEventListener('change', queue, true);
  document.addEventListener('input', queue, true);
  document.addEventListener('pointerup', queue, true);
  setInterval(queue, 900);
  patch();
})();
