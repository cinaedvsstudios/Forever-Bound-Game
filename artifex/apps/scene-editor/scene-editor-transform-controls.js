(() => {
  'use strict';

  const MIN_POS = -100;
  const MAX_POS = 200;
  const DEFAULT_RATIO = 1;
  const BORDER_KEY = 'artifex.sceneEditor.borderHidden.v1';
  let activeSize = null;
  let activeRotate = null;

  function api() { return window.ArtifexSceneEditorCore || null; }
  function selectedItem() { return api()?.getSelectedItem?.() || null; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value || 0))); }
  function stageRatio() {
    const rect = document.getElementById('stage')?.getBoundingClientRect();
    return rect?.width && rect?.height ? rect.width / rect.height : 1;
  }
  function stageNodeForItem(item) {
    if (!item?.id) return null;
    return Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find((node) => node.dataset.stageId === item.id) || null;
  }
  function originPoint(value) {
    const map = { topLeft: [0, 0], top: [.5, 0], topRight: [1, 0], left: [0, .5], centre: [.5, .5], center: [.5, .5], right: [1, .5], bottomLeft: [0, 1], bottom: [.5, 1], bottomRight: [1, 1] };
    return map[value] || map.centre;
  }
  function transformFor(item) {
    const zDepth = Number(item.zDepth || 0);
    const scale = clamp(1 + zDepth * .035, .45, 2.15);
    const rotate = Number(item.rotation || 0);
    const skewX = Number(item.skewX || 0);
    const skewY = Number(item.skewY || 0);
    const flipX = item.flipX ? -1 : 1;
    const flipY = item.flipY ? -1 : 1;
    return `scale(${scale}) rotate(${rotate}deg) skew(${skewX}deg, ${skewY}deg) scale(${flipX}, ${flipY})`;
  }
  function setField(id, value) {
    const input = document.getElementById(id);
    if (!input || document.activeElement === input) return;
    input.value = value;
    const control = input.closest('.value-slider-field-v18');
    const range = control?.querySelector('.value-slider-range-v18');
    const readout = control?.querySelector('.value-slider-readout-v18');
    if (range) range.value = value;
    if (readout && document.activeElement !== readout) readout.value = value;
  }
  function syncFields(item) {
    if (!item) return;
    setField('itemRotation', item.rotation ?? 0);
    setField('itemRotationOrigin', item.rotationOrigin || 'centre');
    setField('itemX', item.x ?? 10);
    setField('itemY', item.y ?? 10);
    setField('itemW', item.width ?? 10);
    setField('itemH', item.height ?? 10);
    setField('itemZ', item.zDepth ?? 0);
    setField('itemSkewX', item.skewX ?? 0);
    setField('itemSkewY', item.skewY ?? 0);
    const aspect = document.getElementById('itemAspectLock');
    if (aspect) aspect.checked = item.aspectRatioLocked === true;
    const aspectButton = document.querySelector('[data-transform-action="toggle-aspect"]');
    if (aspectButton) {
      aspectButton.classList.toggle('is-active', item.aspectRatioLocked === true);
      aspectButton.setAttribute('aria-pressed', item.aspectRatioLocked === true ? 'true' : 'false');
    }
  }
  function readBorders() { try { return JSON.parse(localStorage.getItem(BORDER_KEY) || '{}'); } catch { return {}; } }
  function writeBorders(state) { try { localStorage.setItem(BORDER_KEY, JSON.stringify(state)); } catch {} }
  function applyBorders() {
    const state = readBorders();
    document.querySelectorAll('.scene-item[data-stage-id]').forEach((node) => node.classList.toggle('border-hidden', !!state[node.dataset.stageId]));
    const item = selectedItem();
    const checkbox = document.getElementById('itemBorderVisible');
    if (checkbox && item) checkbox.checked = !state[item.id];
  }
  function setBorderVisible(item, visible) {
    if (!item?.id) return;
    const state = readBorders();
    state[item.id] = !visible;
    writeBorders(state);
    applyBorders();
    api()?.toast?.(visible ? 'Border shown' : 'Border hidden');
  }
  function paintItem(item) {
    const node = stageNodeForItem(item);
    if (!node || !item) return;
    node.style.left = `${item.x ?? 10}%`;
    node.style.top = `${item.y ?? 10}%`;
    node.style.width = `${item.width ?? 10}%`;
    node.style.height = `${item.height ?? 10}%`;
    node.style.zIndex = String(item.layer ?? item.z ?? 1);
    const [ox, oy] = originPoint(item.rotationOrigin);
    node.style.transformOrigin = `${ox * 100}% ${oy * 100}%`;
    node.style.transform = transformFor(item);
    const preserve = item.aspectRatioLocked === true ? 'xMidYMid meet' : 'none';
    node.querySelectorAll('.scene-image-v33, .scene-image-v33 image').forEach((image) => image.setAttribute('preserveAspectRatio', preserve));
  }
  function paintAll() { api()?.getAllItems?.().forEach(paintItem); applyBorders(); }
  function shownRatio(item) {
    const width = Math.max(1, Number(item?.width || 1));
    const height = Math.max(1, Number(item?.height || 1));
    return width * stageRatio() / height;
  }
  function rememberRatio(item, ratio = shownRatio(item)) {
    if (item && Number.isFinite(Number(ratio)) && Number(ratio) > 0) item.aspectRatio = Number(ratio);
    return Number(item?.aspectRatio) > 0 ? Number(item.aspectRatio) : DEFAULT_RATIO;
  }
  function loadImageSize(item) {
    return new Promise((resolve, reject) => {
      if (!item?.image) { reject(new Error('No selected image to wrap')); return; }
      const node = stageNodeForItem(item);
      const imageHref = node?.querySelector('.scene-image-v33 image')?.getAttribute('href') || item.image;
      const image = new Image();
      image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
      image.onerror = () => reject(new Error('Could not load selected image for wrap'));
      image.src = imageHref;
    });
  }
  function wrapSelectedImage(captured = selectedItem()) {
    const item = captured;
    if (!item) return;
    loadImageSize(item).then(({ width, height }) => {
      if (!width || !height) return;
      const ratio = rememberRatio(item, width / height);
      const axis = stageRatio();
      const currentW = Math.max(1, Number(item.width || 10));
      const currentH = Math.max(1, Number(item.height || 10));
      if (shownRatio(item) > ratio) item.width = Number(Math.max(1, currentH * ratio / axis).toFixed(3));
      else item.height = Number(Math.max(1, currentW * axis / ratio).toFixed(3));
      syncFields(item);
      paintItem(item);
      api()?.saveWorkingCopySoon?.('wrap bounding box');
      api()?.toast?.(`Wrapped selected image ${width}×${height}`);
    }).catch((error) => api()?.toast?.(error.message));
  }
  function scaleSelected(delta, captured = selectedItem()) {
    const item = captured;
    if (!item) return;
    const ratio = item.aspectRatioLocked === true ? rememberRatio(item) : null;
    item.width = Number(Math.max(1, Number(item.width || 10) + delta).toFixed(3));
    if (ratio) item.height = Number(Math.max(1, item.width * stageRatio() / ratio).toFixed(3));
    else item.height = Number(Math.max(1, Number(item.height || 10) + delta).toFixed(3));
    syncFields(item);
    paintItem(item);
    api()?.saveWorkingCopySoon?.('scale selected');
  }
  function toggleAspect(captured = selectedItem()) {
    const item = captured;
    if (!item) return;
    item.aspectRatioLocked = !item.aspectRatioLocked;
    if (item.aspectRatioLocked) rememberRatio(item, shownRatio(item));
    syncFields(item);
    paintItem(item);
    api()?.saveWorkingCopySoon?.('aspect ratio lock');
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
  function bindTransformCard() {
    const card = document.querySelector('[data-card-id="transform-v35"]');
    const item = selectedItem();
    if (!card || !item || card.dataset.transformOwnerBound === 'true') return;
    card.dataset.transformOwnerBound = 'true';
    card.addEventListener('click', (event) => {
      const action = event.target.closest?.('[data-transform-action]')?.dataset.transformAction;
      if (!action) return;
      const captured = selectedItem();
      if (!captured) return;
      event.preventDefault();
      event.stopPropagation();
      if (action === 'scale-up') scaleSelected(1, captured);
      if (action === 'scale-down') scaleSelected(-1, captured);
      if (action === 'wrap-image') wrapSelectedImage(captured);
      if (action === 'toggle-aspect') toggleAspect(captured);
    }, true);
    card.addEventListener('input', (event) => {
      const target = event.target;
      const current = selectedItem();
      if (!current) return;
      if (target.id === 'itemRotation') current.rotation = Number(target.value || 0);
      else if (target.id === 'itemSkewX') current.skewX = Number(target.value || 0);
      else if (target.id === 'itemSkewY') current.skewY = Number(target.value || 0);
      else return;
      syncFields(current);
      paintItem(current);
      addVisualHandles();
      api()?.saveWorkingCopySoon?.('transform controls');
    }, true);
    card.addEventListener('change', (event) => {
      const current = selectedItem();
      if (!current) return;
      if (event.target.id === 'itemRotationOrigin') {
        current.rotationOrigin = event.target.value || 'centre';
        paintItem(current);
        addVisualHandles();
        api()?.saveWorkingCopySoon?.('rotation origin');
      }
      if (event.target.id === 'itemBorderVisible') setBorderVisible(current, event.target.checked);
    }, true);
    syncFields(item);
    applyBorders();
  }
  function handleAspectSizedInput(event) {
    const target = event.target;
    if (!target || !['itemW', 'itemH'].includes(target.id)) return;
    const item = selectedItem();
    if (!item?.aspectRatioLocked) return;
    const ratio = rememberRatio(item);
    const axis = stageRatio();
    event.stopImmediatePropagation();
    if (target.id === 'itemW') {
      item.width = Number(target.value || 1);
      item.height = Number(Math.max(1, item.width * axis / ratio).toFixed(3));
    } else {
      item.height = Number(target.value || 1);
      item.width = Number(Math.max(1, item.height * ratio / axis).toFixed(3));
    }
    syncFields(item);
    paintItem(item);
    api()?.saveWorkingCopySoon?.('aspect-sized transform');
  }
  function beginSize(event, handle) {
    const item = selectedItem();
    const stage = document.getElementById('stage');
    const rect = stage?.getBoundingClientRect();
    if (!item || !rect?.width || !rect?.height) return;
    activeSize = { item, dir: handle.dataset.sizeDir || '', startX: ((event.clientX - rect.left) / rect.width) * 100, startY: ((event.clientY - rect.top) / rect.height) * 100, x: Number(item.x || 0), y: Number(item.y || 0), w: Number(item.width || 10), h: Number(item.height || 10), ratio: item.aspectRatioLocked === true ? rememberRatio(item) : null };
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
    let x = activeSize.x, y = activeSize.y, w = activeSize.w, h = activeSize.h;
    const dir = activeSize.dir;
    if (dir.includes('e')) w = activeSize.w + dx;
    if (dir.includes('s')) h = activeSize.h + dy;
    if (dir.includes('w')) { x = activeSize.x + dx; w = activeSize.w - dx; }
    if (dir.includes('n')) { y = activeSize.y + dy; h = activeSize.h - dy; }
    w = Math.max(1, w); h = Math.max(1, h);
    if (activeSize.ratio) {
      const axis = stageRatio();
      if (dir === 'n' || dir === 's') w = h * activeSize.ratio / axis;
      else h = w * axis / activeSize.ratio;
    }
    activeSize.item.x = Number(clamp(x, MIN_POS, MAX_POS).toFixed(3));
    activeSize.item.y = Number(clamp(y, MIN_POS, MAX_POS).toFixed(3));
    activeSize.item.width = Number(clamp(w, 1, 200).toFixed(3));
    activeSize.item.height = Number(clamp(h, 1, 200).toFixed(3));
    syncFields(activeSize.item);
    paintItem(activeSize.item);
    api()?.saveWorkingCopySoon?.('resize');
    event.preventDefault();
    event.stopPropagation();
  }
  function endSize() {
    if (!activeSize) return;
    activeSize = null;
    document.body.classList.remove('is-resizing-object');
    api()?.saveWorkingCopySoon?.('resize');
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
    activeRotate = { item };
    moveRotate(event);
    event.preventDefault();
    event.stopPropagation();
  }
  function moveRotate(event) {
    if (!activeRotate?.item) return;
    const origin = rotationOriginClient(activeRotate.item);
    if (!origin) return;
    let angle = Math.atan2(event.clientY - origin.y, event.clientX - origin.x) * 180 / Math.PI + 90;
    while (angle > 180) angle -= 360;
    while (angle < -180) angle += 360;
    activeRotate.item.rotation = Number(angle.toFixed(1));
    syncFields(activeRotate.item);
    paintItem(activeRotate.item);
    api()?.saveWorkingCopySoon?.('rotate handle');
    event.preventDefault();
    event.stopPropagation();
  }
  function endRotate() {
    if (!activeRotate) return;
    activeRotate = null;
    api()?.saveWorkingCopySoon?.('rotate handle');
  }
  function handleContextTransformAction(event) {
    const action = event.target.closest?.('[data-context-transform-action]')?.dataset.contextTransformAction;
    if (!action) return;
    const item = selectedItem();
    if (!item) return;
    if (action === 'flip-x') item.flipX = !item.flipX;
    if (action === 'flip-y') item.flipY = !item.flipY;
    if (action === 'reset-transform') {
      item.rotation = 0;
      item.rotationOrigin = 'centre';
      item.flipX = false;
      item.flipY = false;
      item.skewX = 0;
      item.skewY = 0;
    }
    syncFields(item);
    paintItem(item);
    api()?.saveWorkingCopySoon?.('transform action');
    event.preventDefault();
    event.stopPropagation();
  }
  function sync() {
    const item = selectedItem();
    if (item) { syncFields(item); paintAll(); }
    addSizeHandles();
    addVisualHandles();
    bindTransformCard();
  }

  document.addEventListener('pointerdown', (event) => {
    const rotateHandle = event.target.closest?.('.rotate-knob-v17');
    if (rotateHandle) beginRotate(event);
    const resizeHandle = event.target.closest?.('.resize-handle');
    if (resizeHandle) beginSize(event, resizeHandle);
  }, true);
  document.addEventListener('pointermove', (event) => { if (activeRotate) moveRotate(event); if (activeSize) moveSize(event); }, true);
  document.addEventListener('pointerup', () => { endRotate(); endSize(); requestAnimationFrame(sync); }, true);
  document.addEventListener('pointercancel', () => { endRotate(); endSize(); }, true);
  document.addEventListener('input', handleAspectSizedInput, true);
  document.addEventListener('click', (event) => { handleContextTransformAction(event); requestAnimationFrame(sync); }, true);
  document.addEventListener('change', () => requestAnimationFrame(sync), true);
  window.addEventListener('load', sync);
  requestAnimationFrame(sync);
})();
