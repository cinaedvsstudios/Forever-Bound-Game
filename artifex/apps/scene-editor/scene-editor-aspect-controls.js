(() => {
  'use strict';

  const VERSION = 'v0.35-selection-target-fix';
  const KEY = 'artifex.sceneEditor.aspectControls.v35';
  const MIN = 1;
  const MAX = 200;
  let resize = null;
  let state = read();
  state.objects = state.objects && typeof state.objects === 'object' ? state.objects : {};
  state.ratios = state.ratios && typeof state.ratios === 'object' ? state.ratios : {};

  function core() { return window.ArtifexSceneEditorCore || null; }
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
  function clamp(n, min = MIN, max = MAX) { return Math.max(min, Math.min(max, Number(n || 0))); }
  function stageRatio() { const rect = document.getElementById('stage')?.getBoundingClientRect(); return rect?.width && rect?.height ? rect.width / rect.height : 1; }
  function toast(text) { core()?.toast?.(text); }

  function itemForId(id) {
    const scene = core()?.getScene?.();
    if (!id || !scene) return null;
    return [...(scene.layers || []), ...(scene.elements || []), ...(scene.ui || [])].find((entry) => entry.id === id) || null;
  }

  function inspectorId() {
    return document.getElementById('itemId')?.value || core()?.getSelectedId?.() || '';
  }

  function selectedTarget() {
    const selected = itemForId(inspectorId()) || core()?.getSelectedItem?.() || null;
    return selected ? { id: selected.id, item: selected } : null;
  }

  function nodeFor(id) {
    return id ? Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find((node) => node.dataset.stageId === id) || null : null;
  }

  function optionsFor(id) {
    const saved = state.objects[id] || {};
    return { aspectLock: !!saved.aspectLock, wrapBoundingBox: !!saved.wrapBoundingBox };
  }

  function setOptions(id, patch) {
    if (!id) return;
    state.objects[id] = { ...optionsFor(id), ...patch };
    save();
  }

  function shownRatio(selected) {
    return clamp(selected?.width || 10) * stageRatio() / clamp(selected?.height || 10);
  }

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

  function applyFit(node, aspectLocked) {
    const svg = node?.querySelector('.scene-image-v33');
    if (!svg) return;
    const preserve = aspectLocked ? 'xMidYMid meet' : 'none';
    svg.dataset.aspectFit = aspectLocked ? 'contain' : 'fill';
    svg.setAttribute('preserveAspectRatio', preserve);
    svg.querySelector('image')?.setAttribute('preserveAspectRatio', preserve);
  }

  function fitAll() {
    document.body.classList.remove('aspect-lock-enabled-v23', 'wrap-box-enabled-v23');
    document.querySelectorAll('.scene-item[data-stage-id]').forEach((node) => {
      applyFit(node, optionsFor(node.dataset.stageId).aspectLock);
    });
    const target = selectedTarget();
    const options = optionsFor(target?.id || '');
    document.querySelectorAll('.aspect-lock-btn-v23').forEach((button) => button.classList.toggle('is-enabled-v23', options.aspectLock));
    document.querySelectorAll('.wrap-image-btn').forEach((button) => button.classList.toggle('is-enabled-v23', options.wrapBoundingBox && options.aspectLock));
  }

  function drawBox(target) {
    const node = nodeFor(target?.id);
    const selected = target?.item;
    if (!selected || !node) return;
    node.style.left = `${selected.x ?? 0}%`;
    node.style.top = `${selected.y ?? 0}%`;
    node.style.width = `${selected.width ?? 10}%`;
    node.style.height = `${selected.height ?? 10}%`;
    if (inspectorId() === target.id) {
      setField('itemX', selected.x ?? 0);
      setField('itemY', selected.y ?? 0);
      setField('itemW', selected.width ?? 10);
      setField('itemH', selected.height ?? 10);
    }
    fitAll();
  }

  function sourceRatio(target, done) {
    const selectedNode = nodeFor(target?.id);
    const source = selectedNode?.querySelector('.scene-image-v33 image')?.getAttribute('href') || selectedNode?.querySelector('img')?.src || target?.item?.image || '';
    if (!source) return toast('No image available to wrap');
    const image = new Image();
    image.onload = () => done(image.naturalWidth / image.naturalHeight);
    image.onerror = () => toast('Could not read image proportions');
    image.src = source;
  }

  function wrapBox(target = selectedTarget()) {
    if (!target) return;
    sourceRatio(target, (ratio) => {
      const liveItem = itemForId(target.id);
      if (!liveItem || liveItem !== target.item || !ratio || !Number.isFinite(ratio)) return;
      const axis = stageRatio();
      const shown = shownRatio(liveItem);
      if (shown > ratio) liveItem.width = Number((clamp(liveItem.height) * ratio / axis).toFixed(3));
      else liveItem.height = Number((clamp(liveItem.width) * axis / ratio).toFixed(3));
      remember(liveItem, ratio);
      drawBox({ id: target.id, item: liveItem });
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
    fitAll();
  }

  function click(event) {
    const target = selectedTarget();
    if (!target) return;
    if (event.target.closest?.('.wrap-image-btn')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const options = optionsFor(target.id);
      const enabled = !options.wrapBoundingBox;
      setOptions(target.id, { wrapBoundingBox: enabled, aspectLock: enabled ? true : options.aspectLock });
      fitAll();
      if (enabled) wrapBox(target);
      else toast('Wrap Bounding Box to Image disabled for selected object');
      return;
    }
    if (event.target.closest?.('.aspect-lock-btn-v23')) {
      event.preventDefault();
      event.stopImmediatePropagation();
      const options = optionsFor(target.id);
      const enabled = !options.aspectLock;
      setOptions(target.id, { aspectLock: enabled, wrapBoundingBox: enabled ? options.wrapBoundingBox : false });
      if (enabled) remember(target.item);
      fitAll();
      toast(`Aspect Ratio Lock ${enabled ? 'enabled' : 'disabled'} for selected object`);
    }
  }

  function start(event) {
    const handle = event.target.closest?.('.resize-handle');
    const stageNode = handle?.closest?.('.scene-item[data-stage-id]');
    const selected = itemForId(stageNode?.dataset.stageId) || selectedTarget()?.item || null;
    const rect = document.getElementById('stage')?.getBoundingClientRect();
    if (!handle || event.button !== 0 || !selected || !rect?.width || !rect?.height) return;
    resize = {
      id: selected.id,
      item: selected,
      dir: handle.dataset.sizeDir || '',
      sx: event.clientX,
      sy: event.clientY,
      x: Number(selected.x || 0),
      y: Number(selected.y || 0),
      w: clamp(selected.width || 10),
      h: clamp(selected.height || 10),
      ratio: lockedRatio(selected),
      rect
    };
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
    Object.assign(resize.item, {
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      width: Number(w.toFixed(3)),
      height: Number(h.toFixed(3))
    });
    drawBox({ id: resize.id, item: resize.item });
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
    const target = selectedTarget();
    if (!field || !target || resize || !optionsFor(target.id).aspectLock) return;
    const ratio = lockedRatio(target.item);
    const axis = stageRatio();
    if (field.id === 'itemW') target.item.height = Number((clamp(target.item.width) * axis / ratio).toFixed(3));
    else target.item.width = Number((clamp(target.item.height) * ratio / axis).toFixed(3));
    drawBox(target);
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