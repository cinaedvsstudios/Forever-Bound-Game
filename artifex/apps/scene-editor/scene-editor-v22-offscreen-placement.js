(() => {
  'use strict';

  const MIN_POS = -100;
  const MAX_POS = 200;
  let activeOffscreenDrag = false;

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
      if (slider) {
        slider.min = String(MIN_POS);
        slider.max = String(MAX_POS);
      }
    });
  }

  function applyItemPosition(item) {
    const node = selectedNode();
    if (!node || !item) return;
    node.style.left = `${item.x ?? 0}%`;
    node.style.top = `${item.y ?? 0}%`;
    setField('itemX', item.x ?? 0);
    setField('itemY', item.y ?? 0);
    const xSlider = document.getElementById('itemX')?.closest('.value-slider-field-v18')?.querySelector('.value-slider-range-v18');
    const ySlider = document.getElementById('itemY')?.closest('.value-slider-field-v18')?.querySelector('.value-slider-range-v18');
    if (xSlider) xSlider.value = item.x ?? 0;
    if (ySlider) ySlider.value = item.y ?? 0;
  }

  function moveSelectedToPointer(event) {
    if (!activeOffscreenDrag && !document.body.classList.contains('v13e-centre-dragging')) return;
    const item = selectedItem();
    const stage = document.getElementById('stage');
    if (!item || !stage) return;
    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const width = Number(item.width || 0);
    const height = Number(item.height || 0);
    const nextX = ((event.clientX - rect.left) / rect.width) * 100 - width / 2;
    const nextY = ((event.clientY - rect.top) / rect.height) * 100 - height / 2;
    item.x = Number(clamp(nextX, MIN_POS, MAX_POS).toFixed(3));
    item.y = Number(clamp(nextY, MIN_POS, MAX_POS).toFixed(3));
    applyItemPosition(item);
    api()?.saveWorkingCopySoon?.('offscreen drag');
  }

  function begin(event) {
    if (!event.target.closest?.('.move-handle')) return;
    activeOffscreenDrag = true;
    updateNumberBounds();
    requestAnimationFrame(() => moveSelectedToPointer(event));
  }

  function end() {
    if (!activeOffscreenDrag) return;
    activeOffscreenDrag = false;
    api()?.saveWorkingCopySoon?.('offscreen drag');
  }

  function install() {
    updateNumberBounds();
  }

  document.addEventListener('pointerdown', begin, true);
  document.addEventListener('pointermove', moveSelectedToPointer, false);
  document.addEventListener('pointerup', () => { end(); install(); }, false);
  document.addEventListener('pointercancel', end, false);
  document.addEventListener('input', install, true);
  document.addEventListener('change', install, true);
  window.addEventListener('blur', end);
  window.addEventListener('load', install);
  setInterval(install, 900);
  install();
})();
