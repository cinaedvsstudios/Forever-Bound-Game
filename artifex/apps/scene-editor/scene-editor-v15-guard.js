(() => {
  const coreFlag = 'artifexCoreMove' + 'Drag';
  const helperFlag = 'v15Centre' + 'Drag';
  if (document.body.dataset[coreFlag] === 'true') {
    document.body.dataset[helperFlag] = 'true';
  }

  const origins = ['centre', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
  let activeSize = null;

  function api() {
    return window.ArtifexSceneEditorCore || null;
  }

  function selectedItem() {
    return api()?.getSelectedItem?.() || null;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function originCss(value) {
    return String(value || 'centre').replace('centre', 'center').replace('-', ' ');
  }

  function setField(id, value) {
    const field = document.getElementById(id);
    if (field) field.value = value;
  }

  function paintItems() {
    const editor = api();
    if (!editor) return;
    document.querySelectorAll('.scene-item[data-stage-id]').forEach((node) => {
      const item = editor.getAllItems?.().find((entry) => entry.id === node.dataset.stageId);
      if (!item) return;
      const scale = clamp(1 + Number(item.zDepth || 0) * 0.035, 0.45, 2.15);
      node.style.left = `${item.x ?? 10}%`;
      node.style.top = `${item.y ?? 10}%`;
      node.style.width = `${item.width ?? 10}%`;
      node.style.height = `${item.height ?? 10}%`;
      node.style.transform = `scale(${scale}) rotate(${Number(item.rotation || 0)}deg)`;
      node.style.transformOrigin = originCss(item.rotationOrigin);
    });
  }

  function syncFields(item) {
    if (!item) return;
    setField('itemX', item.x ?? 0);
    setField('itemY', item.y ?? 0);
    setField('itemW', item.width ?? 1);
    setField('itemH', item.height ?? 1);
    setField('itemRotation', item.rotation ?? 0);
    setField('itemRotationOrigin', item.rotationOrigin || 'centre');
  }

  function runTransformShell() {
    const editor = api();
    const item = selectedItem();
    const body = document.querySelector('[data-card-id="transform-v15"] .card-body');
    if (!editor || !item || !body) return;
    item.rotation = Number(item.rotation || 0);
    item.rotationOrigin ||= 'centre';
    let block = body.querySelector('.real-rotation-controls-v16');
    if (!block) {
      block = document.createElement('div');
      block.className = 'card-layout-group card-layout-2 real-rotation-controls-v16';
      block.innerHTML = '<div class="field"><label for="itemRotation">Rotate</label><input id="itemRotation" type="number" step="1"></div><div class="field"><label for="itemRotationOrigin">Rotation Origin</label><select id="itemRotationOrigin"></select></div>';
      const old = body.querySelector('.rotate-placeholder-v13e');
      if (old) old.replaceWith(block); else body.appendChild(block);
    }
    const rotation = document.getElementById('itemRotation');
    const origin = document.getElementById('itemRotationOrigin');
    if (origin && !origin.options.length) {
      origin.innerHTML = origins.map((value) => `<option value="${value}">${value.replace('-', ' ')}</option>`).join('');
    }
    if (rotation && rotation.dataset.v16Bound !== 'true') {
      rotation.dataset.v16Bound = 'true';
      rotation.addEventListener('input', () => {
        const current = selectedItem();
        if (!current) return;
        current.rotation = Number(rotation.value || 0);
        paintItems();
        editor.saveWorkingCopySoon?.('rotation');
      });
      rotation.addEventListener('change', () => editor.renderWorkAreaOnly?.());
    }
    if (origin && origin.dataset.v16Bound !== 'true') {
      origin.dataset.v16Bound = 'true';
      origin.addEventListener('change', () => {
        const current = selectedItem();
        if (!current) return;
        current.rotationOrigin = origin.value || 'centre';
        paintItems();
        editor.saveWorkingCopySoon?.('rotation origin');
      });
    }
    syncFields(item);
    paintItems();
    addSizeHandles();
  }

  function addSizeHandles() {
    document.querySelectorAll('.resize-handle').forEach((node) => node.remove());
    const selected = document.querySelector('.scene-item.is-selected[data-stage-id]');
    if (!selected) return;
    ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'].forEach((dir) => {
      const handle = document.createElement('button');
      handle.type = 'button';
      handle.className = `resize-handle resize-${dir}`;
      handle.dataset.sizeDir = dir;
      selected.appendChild(handle);
    });
  }

  function beginSize(event, handle) {
    const item = selectedItem();
    const stage = document.getElementById('stage');
    const rect = stage?.getBoundingClientRect();
    if (!item || !rect?.width || !rect?.height) return;
    activeSize = {
      item,
      dir: handle.dataset.sizeDir || '',
      startX: ((event.clientX - rect.left) / rect.width) * 100,
      startY: ((event.clientY - rect.top) / rect.height) * 100,
      x: Number(item.x || 0),
      y: Number(item.y || 0),
      w: Number(item.width || 10),
      h: Number(item.height || 10)
    };
    document.body.classList.add('is-resizing-object');
    event.preventDefault();
    event.stopPropagation();
  }

  function moveSize(event) {
    if (!activeSize) return;
    const rect = document.getElementById('stage')?.getBoundingClientRect();
    if (!rect?.width || !rect?.height) return;
    const dx = ((event.clientX - rect.left) / rect.width) * 100 - activeSize.startX;
    const dy = ((event.clientY - rect.top) / rect.height) * 100 - activeSize.startY;
    let x = activeSize.x;
    let y = activeSize.y;
    let w = activeSize.w;
    let h = activeSize.h;
    const dir = activeSize.dir;
    if (dir.includes('e')) w = activeSize.w + dx;
    if (dir.includes('s')) h = activeSize.h + dy;
    if (dir.includes('w')) { x = activeSize.x + dx; w = activeSize.w - dx; }
    if (dir.includes('n')) { y = activeSize.y + dy; h = activeSize.h - dy; }
    if (w < 1) { if (dir.includes('w')) x -= 1 - w; w = 1; }
    if (h < 1) { if (dir.includes('n')) y -= 1 - h; h = 1; }
    activeSize.item.x = Number(clamp(x, 0, 100).toFixed(3));
    activeSize.item.y = Number(clamp(y, 0, 100).toFixed(3));
    activeSize.item.width = Number(clamp(w, 1, 100).toFixed(3));
    activeSize.item.height = Number(clamp(h, 1, 100).toFixed(3));
    syncFields(activeSize.item);
    paintItems();
    api()?.saveWorkingCopySoon?.('resize');
    event.preventDefault();
    event.stopPropagation();
  }

  function endSize() {
    if (!activeSize) return;
    activeSize = null;
    document.body.classList.remove('is-resizing-object');
    api()?.saveWorkingCopySoon?.('resize');
    api()?.renderWorkAreaOnly?.();
  }

  if (document.body.dataset.v16TransformWired !== 'true') {
    document.body.dataset.v16TransformWired = 'true';
    document.addEventListener('pointerdown', (event) => {
      const handle = event.target.closest?.('.resize-handle');
      if (handle) beginSize(event, handle);
    }, true);
    document.addEventListener('pointermove', moveSize, true);
    document.addEventListener('pointerup', endSize, true);
    document.addEventListener('pointercancel', endSize, true);
    window.addEventListener('blur', endSize);
  }

  window.addEventListener('load', runTransformShell);
  document.addEventListener('click', runTransformShell, true);
  document.addEventListener('input', runTransformShell, true);
  document.addEventListener('change', runTransformShell, true);
  document.addEventListener('pointerup', runTransformShell, true);
  setInterval(runTransformShell, 1000);
  runTransformShell();
})();
