(() => {
  'use strict';
  const VERSION = 'v0.34-live-acceptance-repair';
  const KEY = 'artifex.sceneEditor.aspectControls.v23';
  const MIN = 1;
  const MAX = 200;
  let resize = null;
  let state = read();
  state.aspectLock = !!state.aspectLock;
  state.wrapBoundingBox = !!state.wrapBoundingBox;
  state.ratios = state.ratioSpace === 'pixels-v034' && state.ratios ? state.ratios : {};
  state.ratioSpace = 'pixels-v034';

  function core() { return window.ArtifexSceneEditorCore || null; }
  function item() { return core()?.getSelectedItem?.() || null; }
  function node() {
    const id = core()?.getSelectedId?.();
    return id ? Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find(n => n.dataset.stageId === id) || null : null;
  }
  function read() { try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch {} }
  function clamp(n, min = MIN, max = MAX) { return Math.max(min, Math.min(max, Number(n || 0))); }
  function stageRatio() { const r = document.getElementById('stage')?.getBoundingClientRect(); return r?.width && r?.height ? r.width / r.height : 1; }
  function toast(text) { core()?.toast?.(text); }
  function shownRatio(selected) { return clamp(selected?.width || 10) * stageRatio() / clamp(selected?.height || 10); }
  function lockedRatio(selected) {
    const id = selected?.id || 'selected';
    if (!Number.isFinite(Number(state.ratios[id]))) state.ratios[id] = shownRatio(selected);
    return Number(state.ratios[id]) || 1;
  }
  function remember(selected, ratio) { if (selected?.id) { state.ratios[selected.id] = ratio || shownRatio(selected); save(); } }
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
  function fit() {
    document.body.classList.toggle('aspect-lock-enabled-v23', state.aspectLock);
    document.body.classList.toggle('wrap-box-enabled-v23', state.wrapBoundingBox && state.aspectLock);
    const preserve = state.aspectLock ? 'xMidYMid meet' : 'none';
    document.querySelectorAll('.scene-item .scene-image-v33').forEach(svg => {
      svg.dataset.aspectFit = state.aspectLock ? 'contain' : 'fill';
      svg.setAttribute('preserveAspectRatio', preserve);
      svg.querySelector('image')?.setAttribute('preserveAspectRatio', preserve);
    });
    document.querySelectorAll('.aspect-lock-btn-v23').forEach(b => b.classList.toggle('is-enabled-v23', state.aspectLock));
    document.querySelectorAll('.wrap-image-btn').forEach(b => b.classList.toggle('is-enabled-v23', state.wrapBoundingBox && state.aspectLock));
  }
  function drawBox(selected) {
    const el = node();
    if (!selected || !el) return;
    el.style.left = `${selected.x ?? 0}%`;
    el.style.top = `${selected.y ?? 0}%`;
    el.style.width = `${selected.width ?? 10}%`;
    el.style.height = `${selected.height ?? 10}%`;
    setField('itemX', selected.x ?? 0); setField('itemY', selected.y ?? 0);
    setField('itemW', selected.width ?? 10); setField('itemH', selected.height ?? 10);
    fit();
  }
  function sourceRatio(done) {
    const source = node()?.querySelector('.scene-image-v33 image')?.getAttribute('href') || node()?.querySelector('img')?.src;
    if (!source) return toast('No image available to wrap');
    const image = new Image();
    image.onload = () => done(image.naturalWidth / image.naturalHeight);
    image.onerror = () => toast('Could not read image proportions');
    image.src = source;
  }
  function wrapBox() {
    const selected = item();
    if (!selected) return;
    sourceRatio(ratio => {
      if (!ratio || !Number.isFinite(ratio)) return;
      const axis = stageRatio();
      const shown = shownRatio(selected);
      if (shown > ratio) selected.width = Number((clamp(selected.height) * ratio / axis).toFixed(3));
      else selected.height = Number((clamp(selected.width) * axis / ratio).toFixed(3));
      remember(selected, ratio);
      drawBox(selected);
      core()?.saveWorkingCopySoon?.('wrap bounding box to image');
      toast('Bounding box wrapped to image');
    });
  }
  function installButton() {
    const slot = document.querySelector('.aspect-lock-slot-v33');
    if (slot && !slot.querySelector('.aspect-lock-btn-v23')) {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'aspect-lock-btn-v23 metric-icon-button'; button.textContent = '⛓'; button.title = 'Aspect Ratio Lock';
      slot.replaceChildren(button);
    }
    fit();
  }
  function click(event) {
    if (event.target.closest?.('.wrap-image-btn')) {
      event.preventDefault(); event.stopImmediatePropagation();
      state.wrapBoundingBox = !state.wrapBoundingBox;
      if (state.wrapBoundingBox) state.aspectLock = true;
      save(); fit(); if (state.wrapBoundingBox) wrapBox();
      return;
    }
    if (event.target.closest?.('.aspect-lock-btn-v23')) {
      event.preventDefault(); event.stopImmediatePropagation();
      state.aspectLock = !state.aspectLock;
      if (state.aspectLock) remember(item()); else state.wrapBoundingBox = false;
      save(); fit(); toast(`Aspect Ratio Lock ${state.aspectLock ? 'enabled' : 'disabled'}`);
    }
  }
  function start(event) {
    const handle = event.target.closest?.('.resize-handle');
    const selected = item();
    const rect = document.getElementById('stage')?.getBoundingClientRect();
    if (!handle || event.button !== 0 || !selected || !rect?.width || !rect?.height) return;
    resize = { selected, dir: handle.dataset.sizeDir || '', sx: event.clientX, sy: event.clientY, x: Number(selected.x || 0), y: Number(selected.y || 0), w: clamp(selected.width || 10), h: clamp(selected.height || 10), ratio: lockedRatio(selected), rect };
    event.preventDefault(); event.stopImmediatePropagation();
  }
  function move(event) {
    if (!resize) return;
    const dx = (event.clientX - resize.sx) / resize.rect.width * 100;
    const dy = (event.clientY - resize.sy) / resize.rect.height * 100;
    let { x, y, w, h } = resize; const d = resize.dir; const axis = stageRatio();
    if (d.includes('e')) w += dx; if (d.includes('w')) w -= dx; if (d.includes('s')) h += dy; if (d.includes('n')) h -= dy;
    if (state.aspectLock) {
      if (d === 'n' || d === 's') w = h * resize.ratio / axis; else h = w * axis / resize.ratio;
    }
    w = clamp(w); h = clamp(h); if (d.includes('w')) x += resize.w - w; if (d.includes('n')) y += resize.h - h;
    Object.assign(resize.selected, { x: Number(x.toFixed(3)), y: Number(y.toFixed(3)), width: Number(w.toFixed(3)), height: Number(h.toFixed(3)) });
    drawBox(resize.selected); event.preventDefault(); event.stopImmediatePropagation();
  }
  function end() { if (resize) { core()?.saveWorkingCopySoon?.('resize'); resize = null; } }
  function lockInput(event) {
    const field = event.target.closest?.('#itemW, #itemH'); const selected = item();
    if (!state.aspectLock || !field || !selected || resize) return;
    const ratio = lockedRatio(selected); const axis = stageRatio();
    if (field.id === 'itemW') selected.height = Number((clamp(selected.width) * axis / ratio).toFixed(3)); else selected.width = Number((clamp(selected.height) * ratio / axis).toFixed(3));
    drawBox(selected); core()?.saveWorkingCopySoon?.('aspect locked size');
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