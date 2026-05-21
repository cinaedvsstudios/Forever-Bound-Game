(() => {
  const VERSION = 'v0.14';
  const LOCK_KEY = 'artifex.sceneEditor.layerLocks.v1';
  let queued = false;
  let draggingRow = null;

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = `${VERSION}: ${message}`;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  function readLocks() {
    try { return JSON.parse(localStorage.getItem(LOCK_KEY) || '{}'); }
    catch { return {}; }
  }

  function writeLocks(locks) {
    try { localStorage.setItem(LOCK_KEY, JSON.stringify(locks)); }
    catch {}
  }

  function rows() {
    return Array.from(document.querySelectorAll('.layer-stack-table-v14 .item-row[data-select-id]'));
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

  async function applyCleanLayersFromDom() {
    const currentRows = rows();
    if (!currentRows.length) return;
    const locks = readLocks();
    const unlocked = currentRows.filter((row) => locks[row.dataset.selectId] !== true);
    const locked = currentRows.filter((row) => locks[row.dataset.selectId] === true);
    const total = currentRows.length;
    const assignments = [];

    locked.forEach((row) => {
      const slot = Number(row.closest('.layer-stack-row')?.dataset.slot || 0) || currentRows.indexOf(row) + 1;
      assignments.push({ row, layer: total - slot + 1 });
    });

    let nextUnlocked = 0;
    for (let slot = 1; slot <= total; slot += 1) {
      const lockedAtSlot = assignments.some((entry) => entry.layer === total - slot + 1);
      if (lockedAtSlot) continue;
      const row = unlocked[nextUnlocked++];
      if (row) assignments.push({ row, layer: total - slot + 1 });
    }

    const selectedBefore = document.querySelector('.item-row.is-selected')?.dataset.selectId;
    for (const entry of assignments) {
      selectRow(entry.row);
      await new Promise((resolve) => requestAnimationFrame(resolve));
      setLayerForSelected(entry.layer);
      await new Promise((resolve) => requestAnimationFrame(resolve));
    }
    if (selectedBefore) {
      const old = document.querySelector(`.item-row[data-select-id="${CSS.escape(selectedBefore)}"]`);
      if (old) selectRow(old);
    }
    toast('Layers cleaned');
  }

  function toggleLock(row) {
    const id = row?.dataset.selectId;
    if (!id) return;
    const locks = readLocks();
    locks[id] = !locks[id];
    writeLocks(locks);
    queue();
    toast(locks[id] ? 'Layer locked' : 'Layer unlocked');
  }

  function wrapRows() {
    const list = document.querySelector('[data-card-id="elements"] .item-list');
    if (!list || list.dataset.v14Stack === 'true') return;
    const itemRows = Array.from(list.querySelectorAll('.item-row[data-select-id]'));
    if (!itemRows.length) return;
    const locks = readLocks();
    list.dataset.v14Stack = 'true';
    list.classList.add('layer-stack-table-v14');
    const total = itemRows.length;

    itemRows.forEach((row, index) => {
      const wrapper = document.createElement('div');
      wrapper.className = 'layer-stack-row';
      wrapper.dataset.slot = String(index + 1);
      wrapper.draggable = true;
      row.draggable = false;
      const id = row.dataset.selectId;
      row.classList.add('layer-stack-pill');
      row.textContent = row.textContent.replace(/^\s*\d+\.\s*z?-?\d+\s*·\s*/i, '').replace(/^\s*\d+\.\s*/i, '');
      const lock = document.createElement('button');
      lock.type = 'button';
      lock.className = 'layer-lock-btn';
      lock.textContent = locks[id] ? '🔒' : '🔓';
      lock.title = locks[id] ? 'Unlock layer slot' : 'Lock layer slot';
      const slot = document.createElement('span');
      slot.className = 'layer-slot-number';
      slot.textContent = String(index + 1);
      wrapper.append(slot, row, lock);
      list.appendChild(wrapper);
    });

    list.querySelectorAll(':scope > .item-row').forEach((node) => node.remove());
  }

  function wireLayerStack() {
    const list = document.querySelector('.layer-stack-table-v14');
    if (!list || list.dataset.v14Wired === 'true') return;
    list.dataset.v14Wired = 'true';

    list.addEventListener('click', (event) => {
      const lock = event.target.closest('.layer-lock-btn');
      if (lock) {
        event.preventDefault();
        event.stopPropagation();
        toggleLock(lock.closest('.layer-stack-row')?.querySelector('.item-row'));
      }
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
      draggingRow.classList.remove('is-dragging');
      draggingRow = null;
      renumberSlots();
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

  function addCleanButton() {
    const controls = document.querySelector('[data-card-id="elements"] .elements-controls-group .layer-control-row');
    if (!controls || controls.querySelector('#cleanLayersBtn')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'cleanLayersBtn';
    button.className = 'btn clean-layers-btn';
    button.textContent = '🧹 Layers';
    button.title = 'Clean/recalculate layer numbers';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      applyCleanLayersFromDom();
    });
    controls.appendChild(button);
  }

  function patch() {
    queued = false;
    wrapRows();
    addCleanButton();
    wireLayerStack();
  }

  function queue() {
    if (queued || draggingRow) return;
    queued = true;
    requestAnimationFrame(() => requestAnimationFrame(patch));
  }

  window.addEventListener('load', () => { patch(); toast('Layer stack loaded'); });
  document.addEventListener('click', queue, true);
  document.addEventListener('change', queue, true);
  document.addEventListener('pointerup', queue, true);
  setInterval(queue, 900);
  patch();
})();
