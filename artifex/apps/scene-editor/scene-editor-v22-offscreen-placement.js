(() => {
  'use strict';

  const MIN_POS = -100;
  const MAX_POS = 200;
  let activeOffscreenDrag = null;

  function api() {
    return window.ArtifexSceneEditorCore || null;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value || 0)));
  }

  function selectedItem() {
    return api()?.getSelectedItem?.() || null;
  }

  function selectedNode() {
    const id = api()?.getSelectedId?.();
    if (!id) return null;
    return Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find((node) => node.dataset.stageId === id) || null;
  }

  function setField(id, value) {
    const field = document.getElementById(id);
    if (field) field.value = value;
  }

  function updateNumberBounds() {
    const x = document.getElementById('itemX');
    const y = document.getElementById('itemY');
    [x, y].forEach((field) => {
      if (!field) return;
      field.min = String(MIN_POS);
      field.max = String(MAX_POS);
      const slider = field.closest('.value-slider-field-v18')?.querySelector('.value-slider-range-v18');
      const readout = field.closest('.value-slider-field-v18')?.querySelector('.value-slider-readout-v18');
      if (slider) {
        slider.min = String(MIN_POS);
        slider.max = String(MAX_POS);
        slider.value = field.value || 0;
      }
      if (readout) readout.textContent = field.value || '0';
    });
  }

  function applyItemPosition(item) {
    const node = selectedNode();
    if (!node || !item) return;
    node.style.left = `${item.x ?? 0}%`;
    node.style.top = `${item.y ?? 0}%`;
    setField('itemX', item.x ?? 0);
    setField('itemY', item.y ?? 0);
    updateNumberBounds();
  }

  function ensureDragStart(item) {
    if (!activeOffscreenDrag || !item) return false;
    if (activeOffscreenDrag.startItemX === null || activeOffscreenDrag.startItemY === null) {
      activeOffscreenDrag.startItemX = Number(item.x || 0);
      activeOffscreenDrag.startItemY = Number(item.y || 0);
    }
    return true;
  }

  function moveSelectedByDelta(event) {
    if (!activeOffscreenDrag) return;
    const item = selectedItem();
    const stage = document.getElementById('stage');
    if (!item || !stage || !ensureDragStart(item)) return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const dx = ((event.clientX - activeOffscreenDrag.startClientX) / rect.width) * 100;
    const dy = ((event.clientY - activeOffscreenDrag.startClientY) / rect.height) * 100;
    item.x = Number(clamp(activeOffscreenDrag.startItemX + dx, MIN_POS, MAX_POS).toFixed(3));
    item.y = Number(clamp(activeOffscreenDrag.startItemY + dy, MIN_POS, MAX_POS).toFixed(3));
    applyItemPosition(item);
    api()?.saveWorkingCopySoon?.('offscreen drag');

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  }

  function begin(event) {
    const handle = event.target.closest?.('.move-handle');
    if (!handle || event.button === 2) return;
    const node = handle.closest?.('.scene-item[data-stage-id]');
    if (!node) return;
    activeOffscreenDrag = {
      id: node.dataset.stageId || '',
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startItemX: null,
      startItemY: null
    };
    updateNumberBounds();
    requestAnimationFrame(() => {
      const item = selectedItem();
      if (item && activeOffscreenDrag) ensureDragStart(item);
    });
  }

  function end() {
    if (!activeOffscreenDrag) return;
    activeOffscreenDrag = null;
    api()?.saveWorkingCopySoon?.('offscreen drag');
    updateNumberBounds();
  }

  function loadHelper(cssHref, scriptSrc) {
    if (cssHref && !document.querySelector(`link[href="${cssHref}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = cssHref;
      document.head.appendChild(link);
    }
    if (scriptSrc && !document.querySelector(`script[src="${scriptSrc}"]`)) {
      const script = document.createElement('script');
      script.src = scriptSrc;
      document.body.appendChild(script);
    }
  }

  function loadAspectControls() {
    loadHelper('./scene-editor-v23-aspect-controls.css', './scene-editor-v23-aspect-controls.js');
  }

  function loadPreviewControls() {
    loadHelper('./scene-editor-v24-object-preview.css', './scene-editor-v24-object-preview.js');
  }

  function install() {
    updateNumberBounds();
    loadAspectControls();
    loadPreviewControls();
  }

  window.addEventListener('pointerdown', begin, true);
  window.addEventListener('pointermove', moveSelectedByDelta, true);
  window.addEventListener('pointerup', () => { end(); install(); }, true);
  window.addEventListener('pointercancel', end, true);
  document.addEventListener('input', install, true);
  document.addEventListener('change', install, true);
  window.addEventListener('blur', end);
  window.addEventListener('load', install);
  setInterval(install, 900);
  install();
})();
