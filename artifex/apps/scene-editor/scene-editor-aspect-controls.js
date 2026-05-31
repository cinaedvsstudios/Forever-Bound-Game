(() => {
  'use strict';

  const VERSION = 'v0.35-object-aspect-target-fix';
  const KEY = 'artifex.sceneEditor.aspectControls.v35';
  const MIN = 1;
  const MAX = 200;
  let resize = null;
  let state = read();
  state.objects = state.objects && typeof state.objects === 'object' ? state.objects : {};
  state.ratios = state.ratios && typeof state.ratios === 'object' ? state.ratios : {};

  function core() { return window.ArtifexSceneEditorCore || null; }
  function item() { return core()?.getSelectedItem?.() || null; }
  function selectedId() { return core()?.getSelectedId?.() || ''; }
  function nodeFor(id) {
    return id ? Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find((node) => node.dataset.stageId === id) || null : null;
  }
  function node() { return nodeFor(selectedId()); }
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
  function clamp(n, min = MIN, max = MAX) { return Math.max(min, Math.min(max, Number(n || 0))); }
  function stageRatio() { const rect = document.getElementById('stage')?.getBoundingClientRect(); return rect?.width && rect?.height ? rect.width / rect.height : 1; }
  function toast(text) { core()?.toast?.(text); }
  function optionsFor(id) {
    const options = state.objects[id] || {};
    return { aspectLock: !!options.aspectLock, wrapBoundingBox: !!options.wrapBoundingBox };
  }
  function setOptions(id, patch) {
    if (!id) return;
    state.objects[id] = { ...optionsFor(id), ...patch };
    save();
  }
  function shownRatio(selected) { return clamp(selected?.width || 10) * stageRatio() / clamp(selected?.height || 10); }
  function lockedRatio(selected) {
    const id = selected?.id || '';
    if (!id) return 1;
    if (!Number.isFinite(Number(state.ratios[id]))) {
      state.ratios[id] = shownRatio(selected);
      save();
    }
    return Number(state.ratios[id]) || 1;
  }
  function remember(selected, ratio) {
    if (!selected?.id) return;
    state.ratios[selected.id] = ratio || shownRatio(selected);
    save();
  }
  function setField(id, value) {
    const source = document.getElementById(id);
    if (!source) return;
    source.value = value;
    const field = source.closest('.value-slider-field-v18');
    const range = field?.querySelector('.value-slider-range-v18');
    const readout = field?.querySelector('.value-slider-readout-v18');
    if (range) range.value = value;
    if (readout && document.activeElement !== readout) readout.value = value;
  }
  function applyFit(targetNode, aspectLocked) {
    const svg = targetNode?.querySelector('.scene-image-v33');
    if (!svg) return;
    const preserve = aspectLocked ? 'xMidYMid meet' : 'none';
    svg.dataset.aspectFit = aspectLocked ? 'contain' : 'fill';
    svg.setAttribute('preserveAspectRatio', preserve);
    svg.querySelector('image')?.setAttribute('preserveAspectRatio', preserve);
  }
  function fit() {
    document.body.classList.remove('aspect-lock-enabled-v23', 'wrap-box-enabled-v23');
    document.querySelectorAll('.scene-item[data-stage-id]').forEach((targetNode) => {
      applyFit(targetNode, optionsFor(targetNode.dataset.stageId).aspectLock);
    });
    const options = optionsFor(selectedId());
    document.querySelectorAll('.aspect-lock-btn-v23').forEach((button) => button.classList.toggle('is-enabled-v23', options.aspectLock));
    document.querySelectorAll('.wrap-image-btn').forEach((button) => button.classList.toggle('is-enabled-v23', options.wrapBoundingBox && options.aspectLock));
  }
  function drawBox(targetId, selected) {
    const targetNode = nodeFor(targetId);
    if (!selected || !targetNode) return;
    targetNode.style.left = `${selected.x ?? 0}%`;
    targetNode.style.top = `${selected.y ?? 0}%`;
    targetNode.style.width = `${selected.width ?? 10}%`;
    targetNode.style.height = `${selected.height ?? 10}%`;
    if (targetId === selectedId()) {
      setField('itemX', selected.x ?? 0);
      setField('itemY', selected.y ?? 0);
      setField('itemW', selected.width ?? 10);
      setField('itemH', selected.height ?? 10);
    }
    fit();
  }
  function sourceRatio(targetId, done) {
    const targetNode = nodeFor(targetId);
    const source = targetNode?.querySelector('.scene-image-v33 image')?.getAttribute('href') || targetNode?.querySelector('img')?.src || '';
    if (!source) return toast('No image available to wrap');
    const image = new Image();
    image.onload = () => done(image.naturalWidth / image.naturalHeight);
    image.onerror = () => toast('Could not read image proportions');
    image.src = source;
  }
  function wrapBox() {
    const targetId = selectedId();
    const selected = item();
    if (!targetId || !selected) return;
    sourceRatio(targetId, (ratio) => {
      if (selected.id !== targetId || !ratio || !Number.isFinite(ratio)) return;
      const axis = stageRatio();
      const shown = shownRatio(selected);
      if (shown > ratio) selected.width = Number((clamp(selected.height) * ratio / axis).toFixed(3));
      else selected.height = Number((clamp(selected.width) * axis / ratio).toFixed(3));
      remember(selected, ratio);
      drawBox(targetId, selected);
      core()?.saveWorkingCopySoon?.('wrap bounding box to image');
      toast('Bounding box wrapped to selected image');
    });
  }
  function installButton() {
    const slot = document.querySelector('.aspect-lock-slot-v33');
    if (slot && !slot.querySelector('.aspect-lock-btn-v23')) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'aspect-lock-btn-v23 metric-icon-button';
      button.textContent = '⛓';
      button.title = 'Aspect Ratio Lock';
      slot.replaceChildren(button);
    }
    fit();
  }
  function click(event) {
    const targetId = selectedId();
    const selected = item();
    if (!targetId || !selected) return;
    if (event.target.closest?.('.wrap-image-btn')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const options = optionsFor(targetId);
      const enabled = !options.wrapBoundingBox;
      setOptions(targetId, { wrapBoundingBox: enabled, aspectLock: enabled ? true : options.aspectLock });
      fit();
      if (enabled) wrapBox();
      else toast('Wrap Bounding Box to Image disabled');
      return;
    }
    if (event.target.closest?.('.aspect-lock-btn-v23')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const options = optionsFor(targetId);
      const enabled = !options.aspectLock;
      setOptions(targetId, { aspectLock: enabled, wrapBoundingBox: enabled ? options.wrapBoundingBox : false });
      if (enabled) remember(selected);
      fit();
      toast(`Aspect Ratio Lock ${enabled ? 'enabled' : 'disabled'}`);
    }
  }
  function start(event) {
    const handle = event.target.closest?.('.resize-handle');
    const targetNode = handle?.closest?.('.scene-item[data-stage-id]');
    const selected = item();
    const rect = document.getElementById('stage')?.getBoundingClientRect();
    if (!handle || !targetNode || targetNode.dataset.stageId !== selectedId() || event.button !== 0 || !selected || !rect?.width || !rect?.height) return;
    resize = { id: selected.id, selected, dir: handle.dataset.sizeDir || '', sx: event.clientX, sy: event.clientY, x: Number(selected.x || 0), y: Number(selected.y || 0), w: clamp(selected.width || 10), h: clamp(selected.height || 10), ratio: lockedRatio(selected), rect };
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  function move(event) {
    if (!resize) return;
    const dx = (event.clientX - resize.sx) / resize.rect.width * 100;
    const dy = (event.clientY - resize.sy) / resize.rect.height * 100;
    let { x, y, w, h } = resize;
    const direction = resize.dir;
    const axis = stageRatio();
    if (direction.includes('e')) w += dx;
    if (direction.includes('w')) w -= dx;
    if (direction.includes('s')) h += dy;
    if (direction.includes('n')) h -= dy;
    if (optionsFor(resize.id).aspectLock) {
      if (direction === 'n' || direction === 's') w = h * resize.ratio / axis;
      else h = w * axis / resize.ratio;
    }
    w = clamp(w);
    h = clamp(h);
    if (direction.includes('w')) x += resize.w - w;
    if (direction.includes('n')) y += resize.h - h;
    Object.assign(resize.selected, { x: Number(x.toFixed(3)), y: Number(y.toFixed(3)), width: Number(w.toFixed(3)), height: Number(h.toFixed(3)) });
    drawBox(resize.id, resize.selected);
    event.preventDefault();
    event.stopImmediatePropagation();
  }
  function end() {
    if (!resize) return;
    core()?.saveWorkingCopySoon?.('resize');
    resize = null;
  }
  function lockInput(event) {
    const field = event.target.closest?.('#itemW, #itemH');
    const selected = item();
    const targetId = selectedId();
    if (!field || !selected || !targetId || resize || !optionsFor(targetId).aspectLock) return;
    const ratio = lockedRatio(selected);
    const axis = stageRatio();
    if (field.id === 'itemW') selected.height = Number((clamp(selected.width) * axis / ratio).toFixed(3));
    else selected.width = Number((clamp(selected.height) * ratio / axis).toFixed(3));
    drawBox(targetId, selected);
    core()?.saveWorkingCopySoon?.('aspect locked size');
  }

  document.addEventListener('click', click, true);
  document.addEventListener('pointerdown', start, true);
  document.addEventListener('pointermove', move, true);
  document.addEventListener('pointerup', end, true);
  document.addEventListener('pointercancel', end, true);
  document.addEventListener('input', lockInput, true);
  document.addEventListener('change', lockInput, true);
  window.addEventListener('load', installButton);
  setInterval(installButton, 800);
  installButton();
})();