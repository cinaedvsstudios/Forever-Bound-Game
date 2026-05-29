(() => {
  'use strict';

  const VERSION = 'v0.23';
  const RATIO_KEY = 'artifex.sceneEditor.aspectControls.v23';
  const MIN_SIZE = 1;
  const MAX_SIZE = 200;
  const MIN_POS = -100;
  const MAX_POS = 200;
  let activeResize = null;

  function api() { return window.ArtifexSceneEditorCore || null; }
  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = `${VERSION}: ${message}`;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }
  function safeRead() { try { return JSON.parse(localStorage.getItem(RATIO_KEY) || '{}'); } catch { return {}; } }
  function safeWrite(value) { try { localStorage.setItem(RATIO_KEY, JSON.stringify(value)); } catch {} }

  const settings = safeRead();
  settings.wrapBoundingBox = !!settings.wrapBoundingBox;
  settings.aspectLock = !!settings.aspectLock;

  function selectedItem() { return api()?.getSelectedItem?.() || null; }
  function selectedNode() {
    const id = api()?.getSelectedId?.();
    if (!id) return null;
    return Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find((node) => node.dataset.stageId === id) || null;
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value || 0))); }
  function dispatchInput(input) {
    input?.dispatchEvent(new Event('input', { bubbles: true }));
    input?.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function setField(id, value) {
    const field = document.getElementById(id);
    if (!field) return;
    field.value = value;
    const wrap = field.closest('.value-slider-field-v18');
    const slider = wrap?.querySelector('.value-slider-range-v18');
    const readout = wrap?.querySelector('.value-slider-readout-v18');
    const track = wrap?.querySelector('.value-slider-track-v18');
    const fill = wrap?.querySelector('.value-slider-fill-v18');
    const thumb = wrap?.querySelector('.value-slider-thumb-v18');
    if (slider) slider.value = value;
    if (readout) readout.textContent = String(value);
    if (track && fill && thumb) {
      const min = Number(field.min || 0);
      const max = Number(field.max || 100);
      const pct = max === min ? 0 : ((Number(value) - min) / (max - min)) * 100;
      fill.style.height = `${clamp(pct, 0, 100)}%`;
      thumb.style.bottom = `${clamp(pct, 0, 100)}%`;
      track.setAttribute('aria-valuenow', String(value));
    }
  }
  function syncBodyClasses() {
    document.body.classList.toggle('aspect-lock-enabled-v23', settings.aspectLock);
    document.body.classList.toggle('wrap-box-enabled-v23', settings.wrapBoundingBox && settings.aspectLock);
  }
  function applyImageFit() {
    syncBodyClasses();
    const fit = settings.aspectLock ? 'contain' : 'fill';
    document.querySelectorAll('.scene-item img').forEach((img) => { img.style.objectFit = fit; });
  }
  function applyItemBox(item) {
    const node = selectedNode();
    if (!item || !node) return;
    node.style.left = `${item.x ?? 0}%`;
    node.style.top = `${item.y ?? 0}%`;
    node.style.width = `${item.width ?? 10}%`;
    node.style.height = `${item.height ?? 10}%`;
    setField('itemX', item.x ?? 0);
    setField('itemY', item.y ?? 0);
    setField('itemW', item.width ?? 10);
    setField('itemH', item.height ?? 10);
    applyImageFit();
  }
  function saveSettings() { safeWrite(settings); }
  function setButtonState() {
    syncBodyClasses();
    document.querySelectorAll('.wrap-image-btn').forEach((button) => {
      button.title = 'Wrap Bounding Box to Image';
      button.setAttribute('aria-label', 'Wrap Bounding Box to Image');
      button.classList.toggle('is-enabled-v23', settings.wrapBoundingBox && settings.aspectLock);
    });
    document.querySelectorAll('.aspect-lock-btn-v23').forEach((button) => {
      button.classList.toggle('is-enabled-v23', settings.aspectLock);
      button.title = 'Aspect Ratio Lock';
      button.setAttribute('aria-label', 'Aspect Ratio Lock');
    });
    applyImageFit();
  }
  function naturalRatio(callback) {
    const path = document.getElementById('itemImage')?.value || document.querySelector('.scene-item.is-selected img')?.src || '';
    if (!path) return;
    const img = new Image();
    img.onload = () => {
      const ratio = img.naturalWidth / img.naturalHeight;
      if (ratio && Number.isFinite(ratio)) callback(ratio);
    };
    img.src = path;
  }
  function wrapBoundingBoxToImage() {
    const w = document.getElementById('itemW');
    const h = document.getElementById('itemH');
    const item = selectedItem();
    if (!w || !h || !item) return;
    naturalRatio((ratio) => {
      const currentW = Number(w.value || item.width || 1);
      const currentH = Number(h.value || item.height || 1);
      if (ratio >= 1) {
        item.width = Number(currentW.toFixed(3));
        item.height = Number(Math.max(MIN_SIZE, currentW / ratio).toFixed(3));
      } else {
        item.height = Number(currentH.toFixed(3));
        item.width = Number(Math.max(MIN_SIZE, currentH * ratio).toFixed(3));
      }
      setField('itemW', item.width);
      setField('itemH', item.height);
      dispatchInput(w);
      dispatchInput(h);
      applyItemBox(item);
      api()?.saveWorkingCopySoon?.('wrap bounding box to image');
    });
  }
  function toggleWrap(event) {
    const button = event.target.closest?.('.wrap-image-btn');
    if (!button) return false;
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
    settings.wrapBoundingBox = !settings.wrapBoundingBox;
    if (settings.wrapBoundingBox && !settings.aspectLock) {
      settings.aspectLock = true;
      toast('Aspect Ratio Lock enabled for Wrap Bounding Box to Image');
    } else {
      toast(`Wrap Bounding Box to Image ${settings.wrapBoundingBox ? 'enabled' : 'disabled'}`);
    }
    saveSettings();
    setButtonState();
    if (settings.wrapBoundingBox) wrapBoundingBoxToImage();
    return true;
  }
  function toggleAspectLock(event) {
    const button = event.target.closest?.('.aspect-lock-btn-v23');
    if (!button) return false;
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
    settings.aspectLock = !settings.aspectLock;
    if (!settings.aspectLock) settings.wrapBoundingBox = false;
    saveSettings();
    setButtonState();
    toast(`Aspect Ratio Lock ${settings.aspectLock ? 'enabled' : 'disabled'}`);
    return true;
  }
  function addAspectButton() {
    const table = document.querySelector('.selected-metric-table-v15');
    if (!table || table.dataset.v23AspectButton === 'true') return;
    table.dataset.v23AspectButton = 'true';
    const label = document.createElement('div');
    label.className = 'metric-label-cell metric-label-center aspect-lock-label-v23';
    label.textContent = 'Aspect';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'aspect-lock-btn-v23 metric-icon-button';
    button.textContent = '⛓';
    button.title = 'Aspect Ratio Lock';
    const value = document.createElement('div');
    value.className = 'metric-value-cell metric-icon-value aspect-lock-cell-v23';
    value.appendChild(button);
    table.append(label, value);
    setButtonState();
  }
  function interceptButtonClicks(event) { if (toggleWrap(event)) return; toggleAspectLock(event); }

  function beginResize(event) {
    const handle = event.target.closest?.('.resize-handle');
    if (!handle || event.button === 2) return;
    const item = selectedItem();
    const stage = document.getElementById('stage');
    const rect = stage?.getBoundingClientRect();
    if (!item || !rect?.width || !rect?.height) return;
    activeResize = {
      item,
      dir: handle.dataset.sizeDir || '',
      startX: ((event.clientX - rect.left) / rect.width) * 100,
      startY: ((event.clientY - rect.top) / rect.height) * 100,
      x: Number(item.x || 0),
      y: Number(item.y || 0),
      w: Math.max(MIN_SIZE, Number(item.width || 10)),
      h: Math.max(MIN_SIZE, Number(item.height || 10)),
      ratio: Math.max(MIN_SIZE, Number(item.width || 10)) / Math.max(MIN_SIZE, Number(item.height || 10))
    };
    document.body.classList.add('is-resizing-object');
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
  }
  function moveResize(event) {
    if (!activeResize) return;
    const rect = document.getElementById('stage')?.getBoundingClientRect();
    if (!rect?.width || !rect?.height) return;
    const dx = ((event.clientX - rect.left) / rect.width) * 100 - activeResize.startX;
    const dy = ((event.clientY - rect.top) / rect.height) * 100 - activeResize.startY;
    const dir = activeResize.dir;
    const ratio = activeResize.ratio || 1;
    let x = activeResize.x, y = activeResize.y, w = activeResize.w, h = activeResize.h;
    if (dir.includes('e')) w = activeResize.w + dx;
    if (dir.includes('w')) w = activeResize.w - dx;
    if (dir.includes('s')) h = activeResize.h + dy;
    if (dir.includes('n')) h = activeResize.h - dy;
    if (settings.aspectLock) {
      if (dir === 'n' || dir === 's') w = h * ratio;
      else if (dir === 'e' || dir === 'w') h = w / ratio;
      else {
        const fromW = Math.abs(w - activeResize.w);
        const fromH = Math.abs(h - activeResize.h);
        if (fromW >= fromH) h = w / ratio;
        else w = h * ratio;
      }
    }
    w = clamp(w, MIN_SIZE, MAX_SIZE);
    h = clamp(h, MIN_SIZE, MAX_SIZE);
    if (dir.includes('w')) x = activeResize.x + (activeResize.w - w);
    if (dir.includes('n')) y = activeResize.y + (activeResize.h - h);
    activeResize.item.x = Number(clamp(x, MIN_POS, MAX_POS).toFixed(3));
    activeResize.item.y = Number(clamp(y, MIN_POS, MAX_POS).toFixed(3));
    activeResize.item.width = Number(w.toFixed(3));
    activeResize.item.height = Number(h.toFixed(3));
    applyItemBox(activeResize.item);
    api()?.saveWorkingCopySoon?.('resize');
    event.preventDefault(); event.stopPropagation(); event.stopImmediatePropagation();
  }
  function endResize(event) {
    if (!activeResize) return;
    activeResize = null;
    document.body.classList.remove('is-resizing-object');
    api()?.saveWorkingCopySoon?.('resize');
    event?.preventDefault?.(); event?.stopPropagation?.(); event?.stopImmediatePropagation?.();
  }
  function enforceWrapAfterSizeInput(event) {
    if (!settings.wrapBoundingBox || !settings.aspectLock) return;
    const input = event.target.closest?.('#itemW, #itemH');
    if (!input || document.body.classList.contains('is-resizing-object')) return;
    window.clearTimeout(enforceWrapAfterSizeInput.timer);
    enforceWrapAfterSizeInput.timer = window.setTimeout(wrapBoundingBoxToImage, 120);
  }
  function install() {
    document.querySelectorAll('.wrap-image-btn').forEach((button) => {
      button.title = 'Wrap Bounding Box to Image';
      button.setAttribute('aria-label', 'Wrap Bounding Box to Image');
    });
    addAspectButton();
    setButtonState();
    applyImageFit();
  }

  document.addEventListener('click', interceptButtonClicks, true);
  document.addEventListener('pointerdown', beginResize, true);
  document.addEventListener('pointermove', moveResize, true);
  document.addEventListener('pointerup', endResize, true);
  document.addEventListener('pointercancel', endResize, true);
  document.addEventListener('input', enforceWrapAfterSizeInput, true);
  document.addEventListener('change', enforceWrapAfterSizeInput, true);
  window.addEventListener('load', install);
  window.addEventListener('blur', endResize);
  setInterval(install, 800);
  install();
})();
