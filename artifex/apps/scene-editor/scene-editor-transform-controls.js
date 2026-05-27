(() => {
  const coreFlag = 'artifexCoreMove' + 'Drag';
  const helperFlag = 'v15Centre' + 'Drag';
  if (document.body.dataset[coreFlag] === 'true') {
    document.body.dataset[helperFlag] = 'true';
  }

  const origins = ['centre', 'top-left', 'top-right', 'bottom-left', 'bottom-right'];
  const originPoints = {
    centre: [0.5, 0.5],
    'top-left': [0, 0],
    'top-right': [1, 0],
    'bottom-left': [0, 1],
    'bottom-right': [1, 1]
  };
  let activeSize = null;
  let activeRotate = false;
  let skewPanelOpen = false;

  function api() {
    return window.ArtifexSceneEditorCore || null;
  }

  function selectedItem() {
    return api()?.getSelectedItem?.() || null;
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function originPoint(value) {
    return originPoints[value] || originPoints.centre;
  }

  function originCss(value) {
    return String(value || 'centre').replace('centre', 'center').replace('-', ' ');
  }

  function setField(id, value) {
    const field = document.getElementById(id);
    if (field && document.activeElement !== field) field.value = value;
  }

  function transformFor(item) {
    const scale = clamp(1 + Number(item.zDepth || 0) * 0.035, 0.45, 2.15);
    const sx = item.flipX ? -scale : scale;
    const sy = item.flipY ? -scale : scale;
    const rotation = Number(item.rotation || 0);
    const skewX = Number(item.skewX || 0);
    const skewY = Number(item.skewY || 0);
    return `scale(${sx}, ${sy}) rotate(${rotation}deg) skew(${skewX}deg, ${skewY}deg)`;
  }

  function paintItems() {
    const editor = api();
    if (!editor) return;
    document.querySelectorAll('.scene-item[data-stage-id]').forEach((node) => {
      const item = editor.getAllItems?.().find((entry) => entry.id === node.dataset.stageId);
      if (!item) return;
      const [ox, oy] = originPoint(item.rotationOrigin);
      node.style.left = `${item.x ?? 10}%`;
      node.style.top = `${item.y ?? 10}%`;
      node.style.width = `${item.width ?? 10}%`;
      node.style.height = `${item.height ?? 10}%`;
      node.style.transform = transformFor(item);
      node.style.transformOrigin = originCss(item.rotationOrigin);
      const marker = node.querySelector('.origin-marker-v17');
      if (marker) {
        marker.style.left = `${ox * 100}%`;
        marker.style.top = `${oy * 100}%`;
      }
    });
  }

  function syncFields(item) {
    if (!item) return;
    setField('itemX', item.x ?? 0);
    setField('itemY', item.y ?? 0);
    setField('itemW', item.width ?? 1);
    setField('itemH', item.height ?? 1);
    setField('itemRotation', item.rotation ?? 0);
    setField('itemRotationSlider', item.rotation ?? 0);
    setField('itemRotationOrigin', item.rotationOrigin || 'centre');
    setField('itemSkewX', item.skewX ?? 0);
    setField('itemSkewY', item.skewY ?? 0);
  }

  function installTransformStyle() {
    if (document.getElementById('v17-transform-tools-style')) return;
    const style = document.createElement('style');
    style.id = 'v17-transform-tools-style';
    style.textContent = `
      .scene-item .origin-marker-v17 { position: absolute; width: 18px; height: 18px; transform: translate(-50%, -50%); border: 2px solid rgba(255,255,255,.95); border-radius: 999px; background: #10aee8; box-shadow: 0 0 12px rgba(16,174,232,.82), 0 0 18px rgba(195,0,255,.48); z-index: 26; pointer-events: none; }
      .scene-item .rotate-arm-v17 { position: absolute; left: 50%; top: -48px; width: 2px; height: 42px; transform: translateX(-50%); background: rgba(255,255,255,.72); box-shadow: 0 0 8px rgba(102,199,255,.55); z-index: 25; pointer-events: none; }
      .scene-item .rotate-knob-v17 { position: absolute; left: 50%; top: -62px; width: 24px; height: 24px; transform: translateX(-50%); border: 2px solid rgba(255,255,255,.96); border-radius: 999px; background: #10aee8; box-shadow: 0 0 12px rgba(16,174,232,.82), 0 0 18px rgba(195,0,255,.48); z-index: 27; cursor: grab; }
      .scene-item .rotate-knob-v17:active { cursor: grabbing; }
      .real-rotation-controls-v16 .field { position: relative; }
      #itemRotation { padding-right: 34px; }
      .rotate-slider-dot-v17 { position: absolute; right: 8px; top: 27px; width: 16px; height: 16px; border: 2px solid rgba(255,255,255,.9); border-radius: 999px; background: #e73838; box-shadow: 0 0 10px rgba(231,56,56,.8); cursor: pointer; }
      .rotate-slider-popover-v17 { display: none; position: absolute; right: 0; top: 48px; z-index: 2000; width: 190px; padding: 10px; border: 1px solid rgba(184,119,63,.6); border-radius: 12px; background: rgba(9,10,11,.96); box-shadow: 0 12px 28px rgba(0,0,0,.5), 0 0 18px rgba(195,0,255,.25); }
      .rotate-slider-popover-v17.is-open { display: block; }
      .rotate-slider-popover-v17 input { width: 100%; }
      .skew-controls-v19 { margin-top: 10px; }
      .transform-context-divider-v18 { height: 1px; margin: 6px 0; background: rgba(184,119,63,.32); }
    `;
    document.head.appendChild(style);
  }

  function applyRotationValue(value) {
    const editor = api();
    const current = selectedItem();
    if (!editor || !current) return;
    current.rotation = Number(value || 0);
    syncFields(current);
    paintItems();
    editor.saveWorkingCopySoon?.('rotation');
  }

  function runTransformShell() {
    installTransformStyle();
    const editor = api();
    const item = selectedItem();
    const body = document.querySelector('[data-card-id="transform-v15"] .card-body');
    if (!editor || !item || !body) return;
    item.rotation = Number(item.rotation || 0);
    item.rotationOrigin ||= 'centre';
    item.skewX = Number(item.skewX || 0);
    item.skewY = Number(item.skewY || 0);
    let block = body.querySelector('.real-rotation-controls-v16');
    if (!block) {
      block = document.createElement('div');
      block.className = 'card-layout-group card-layout-2 real-rotation-controls-v16';
      block.innerHTML = '<div class="field rotation-field-v17"><label for="itemRotation">Rotate</label><input id="itemRotation" type="number" step="1"><button type="button" class="rotate-slider-dot-v17" title="Open rotate slider" aria-label="Open rotate slider"></button><div class="rotate-slider-popover-v17"><input id="itemRotationSlider" type="range" min="-180" max="180" step="1"></div></div><div class="field"><label for="itemRotationOrigin">Rotation Origin</label><select id="itemRotationOrigin"></select></div>';
      const old = body.querySelector('.rotate-placeholder-v13e');
      if (old) old.replaceWith(block); else body.appendChild(block);
    }
    const rotation = document.getElementById('itemRotation');
    const origin = document.getElementById('itemRotationOrigin');
    const dot = block.querySelector('.rotate-slider-dot-v17');
    const popover = block.querySelector('.rotate-slider-popover-v17');
    const slider = document.getElementById('itemRotationSlider');
    if (origin && !origin.options.length) {
      origin.innerHTML = origins.map((value) => `<option value="${value}">${value.replace('-', ' ')}</option>`).join('');
    }
    if (dot && dot.dataset.v17Bound !== 'true') {
      dot.dataset.v17Bound = 'true';
      dot.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); popover?.classList.toggle('is-open'); });
    }
    if (slider && slider.dataset.v17Bound !== 'true') {
      slider.dataset.v17Bound = 'true';
      slider.addEventListener('input', () => applyRotationValue(slider.value));
      slider.addEventListener('change', () => applyRotationValue(slider.value));
    }
    if (rotation && rotation.dataset.v16Bound !== 'true') {
      rotation.dataset.v16Bound = 'true';
      rotation.addEventListener('input', () => applyRotationValue(rotation.value));
      rotation.addEventListener('change', () => applyRotationValue(rotation.value));
    }
    if (origin && origin.dataset.v16Bound !== 'true') {
      origin.dataset.v16Bound = 'true';
      origin.addEventListener('change', () => {
        const current = selectedItem();
        if (!current) return;
        current.rotationOrigin = origin.value || 'centre';
        syncFields(current);
        paintItems();
        addVisualHandles();
        editor.saveWorkingCopySoon?.('rotation origin');
      });
    }
    if (skewPanelOpen || item.skewX || item.skewY) addSkewPanel(body, item);
    syncFields(item);
    paintItems();
    addSizeHandles();
    addVisualHandles();
    addContextActions();
  }

  function addSkewPanel(body, item) {
    let panel = body.querySelector('.skew-controls-v19');
    if (!panel) {
      panel = document.createElement('div');
      panel.className = 'card-layout-group card-layout-2 skew-controls-v19';
      panel.innerHTML = '<div class="field"><label for="itemSkewX">Skew X</label><input id="itemSkewX" type="number" step="1"></div><div class="field"><label for="itemSkewY">Skew Y</label><input id="itemSkewY" type="number" step="1"></div><div class="button-row"><button type="button" class="btn" data-v17-action="reset-skew">Reset Skew</button></div>';
      body.appendChild(panel);
    }
    ['itemSkewX', 'itemSkewY'].forEach((id) => {
      const input = document.getElementById(id);
      if (!input || input.dataset.v19Bound === 'true') return;
      input.dataset.v19Bound = 'true';
      input.addEventListener('input', () => {
        const current = selectedItem();
        if (!current) return;
        current.skewX = Number(document.getElementById('itemSkewX')?.value || 0);
        current.skewY = Number(document.getElementById('itemSkewY')?.value || 0);
        paintItems();
        api()?.saveWorkingCopySoon?.('skew');
      });
      input.addEventListener('change', () => api()?.saveWorkingCopySoon?.('skew'));
    });
    syncFields(item);
  }

  function safeRunTransformShell(event) {
    const target = event?.target;
    if (target?.closest?.('.real-rotation-controls-v16, .skew-controls-v19')) return;
    runTransformShell();
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

  function addVisualHandles() {
    document.querySelectorAll('.origin-marker-v17, .rotate-arm-v17, .rotate-knob-v17').forEach((node) => node.remove());
    const selected = document.querySelector('.scene-item.is-selected[data-stage-id]');
    const item = selectedItem();
    if (!selected || !item) return;
    const [ox, oy] = originPoint(item.rotationOrigin);
    const origin = document.createElement('span');
    origin.className = 'origin-marker-v17';
    origin.style.left = `${ox * 100}%`;
    origin.style.top = `${oy * 100}%`;
    selected.appendChild(origin);
    const arm = document.createElement('span');
    arm.className = 'rotate-arm-v17';
    selected.appendChild(arm);
    const knob = document.createElement('button');
    knob.type = 'button';
    knob.className = 'rotate-knob-v17';
    knob.title = 'Drag to rotate';
    selected.appendChild(knob);
  }

  function beginSize(event, handle) {
    const item = selectedItem();
    const stage = document.getElementById('stage');
    const rect = stage?.getBoundingClientRect();
    if (!item || !rect?.width || !rect?.height) return;
    activeSize = { item, dir: handle.dataset.sizeDir || '', startX: ((event.clientX - rect.left) / rect.width) * 100, startY: ((event.clientY - rect.top) / rect.height) * 100, x: Number(item.x || 0), y: Number(item.y || 0), w: Number(item.width || 10), h: Number(item.height || 10) };
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

  function rotationOriginClient(item) {
    const rect = document.getElementById('stage')?.getBoundingClientRect();
    if (!rect) return null;
    const [ox, oy] = originPoint(item.rotationOrigin);
    return { x: rect.left + ((Number(item.x || 0) + Number(item.width || 0) * ox) / 100) * rect.width, y: rect.top + ((Number(item.y || 0) + Number(item.height || 0) * oy) / 100) * rect.height };
  }

  function beginRotate(event) {
    const item = selectedItem();
    if (!item) return;
    activeRotate = true;
    moveRotate(event);
    event.preventDefault();
    event.stopPropagation();
  }

  function moveRotate(event) {
    if (!activeRotate) return;
    const item = selectedItem();
    const origin = item ? rotationOriginClient(item) : null;
    if (!item || !origin) return;
    let angle = Math.atan2(event.clientY - origin.y, event.clientX - origin.x) * 180 / Math.PI + 90;
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    item.rotation = Number(angle.toFixed(1));
    syncFields(item);
    paintItems();
    api()?.saveWorkingCopySoon?.('rotate handle');
    event.preventDefault();
    event.stopPropagation();
  }

  function endRotate() {
    if (!activeRotate) return;
    activeRotate = false;
    api()?.saveWorkingCopySoon?.('rotate handle');
  }

  function addContextActions() {
    const menu = document.querySelector('.context-menu');
    if (!menu || menu.querySelector('.transform-context-actions-v18')) return;
    const block = document.createElement('div');
    block.className = 'transform-context-actions-v18';
    block.innerHTML = '<div class="transform-context-divider-v18"></div><button type="button" data-v17-action="flip-x">Flip Horizontal</button><button type="button" data-v17-action="flip-y">Flip Vertical</button><button type="button" data-v17-action="skew-panel">Skew / Distort</button><button type="button" data-v17-action="reset-transform">Reset Transform</button>';
    menu.appendChild(block);
  }

  function handleTransformAction(event) {
    const button = event.target.closest?.('[data-v17-action]');
    if (!button) return;
    const action = button.dataset.v17Action;
    const item = selectedItem();
    if (!item) return;
    if (action === 'flip-x') item.flipX = !item.flipX;
    if (action === 'flip-y') item.flipY = !item.flipY;
    if (action === 'skew-panel') skewPanelOpen = true;
    if (action === 'reset-skew') { item.skewX = 0; item.skewY = 0; }
    if (action === 'reset-transform') { item.rotation = 0; item.rotationOrigin = 'centre'; item.flipX = false; item.flipY = false; item.skewX = 0; item.skewY = 0; }
    syncFields(item);
    paintItems();
    api()?.saveWorkingCopySoon?.('transform action');
    runTransformShell();
    event.preventDefault();
    event.stopPropagation();
  }

  if (document.body.dataset.v17TransformWired !== 'true') {
    document.body.dataset.v17TransformWired = 'true';
    document.addEventListener('pointerdown', (event) => {
      const resizeHandle = event.target.closest?.('.resize-handle');
      const rotateHandle = event.target.closest?.('.rotate-knob-v17');
      if (rotateHandle) beginRotate(event);
      else if (resizeHandle) beginSize(event, resizeHandle);
    }, true);
    document.addEventListener('pointermove', (event) => { if (activeRotate) moveRotate(event); else moveSize(event); }, true);
    document.addEventListener('pointerup', () => { endRotate(); endSize(); runTransformShell(); }, true);
    document.addEventListener('pointercancel', () => { endRotate(); endSize(); }, true);
    document.addEventListener('click', handleTransformAction, true);
    window.addEventListener('blur', () => { endRotate(); endSize(); });
  }

  window.addEventListener('load', runTransformShell);
  document.addEventListener('click', safeRunTransformShell, true);
  document.addEventListener('input', safeRunTransformShell, true);
  document.addEventListener('change', safeRunTransformShell, true);
  document.addEventListener('pointerup', runTransformShell, true);
  setInterval(runTransformShell, 1000);
  runTransformShell();
})();
