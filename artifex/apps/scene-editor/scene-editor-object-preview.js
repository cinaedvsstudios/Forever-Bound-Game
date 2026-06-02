(() => {
  'use strict';

  const STATE = { open: false, bg: 'black', modal: null, button: null, clearButton: null, zoom: 1, panX: 0, panY: 0, panning: null };

  function api() { return window.ArtifexSceneEditorCore || null; }
  function selectedItem() { return api()?.getSelectedItem?.() || null; }
  function selectedNode() {
    const id = api()?.getSelectedId?.();
    if (!id) return document.querySelector('.scene-item.is-selected');
    return Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find((node) => node.dataset.stageId === id) || document.querySelector('.scene-item.is-selected');
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value || 0))); }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
  function visualFor(item) { return item?.visual || {}; }

  function filterFor(item) {
    const visual = visualFor(item);
    const brightness = clamp(Number(visual.brightness ?? 100) + Number(visual.exposure ?? 0), 0, 300);
    const contrast = clamp(visual.contrast ?? 100, 0, 300);
    const saturation = clamp(Number(visual.saturation ?? 100) + Number(visual.vibrance ?? 0) * 0.35, 0, 300);
    const hue = clamp(visual.hue ?? 0, -360, 360);
    const shadow = clamp(visual.shadowStrength ?? 0, 0, 100);
    const glow = clamp(visual.glowStrength ?? 0, 0, 100);
    const filters = [`brightness(${brightness}%)`, `contrast(${contrast}%)`, `saturate(${saturation}%)`, `hue-rotate(${hue}deg)`];
    if (shadow > 0) filters.push(`drop-shadow(${Math.round(shadow * 0.04)}px ${Math.round(2 + shadow * 0.05)}px ${Math.round(2 + shadow * 0.18)}px rgba(0,0,0,${clamp(0.18 + shadow / 140, 0, 0.92)}))`);
    if (glow > 0) filters.push(`drop-shadow(0 0 ${Math.round(3 + glow * 0.24)}px rgba(195,0,255,${clamp(0.2 + glow / 130, 0, 0.95)}))`);
    return filters.join(' ');
  }

  function transformFor(item) {
    const stageTransform = selectedNode()?.style?.transform || '';
    const baseScale = stageTransform.match(/scale\(([^)]+)\)/)?.[1] || '';
    const scale = baseScale ? Number(baseScale.split(',')[0]) || 1 : clamp(1 + Number(item?.zDepth || 0) * 0.035, 0.45, 2.15);
    const sx = item?.flipX ? -scale : scale;
    const sy = item?.flipY ? -scale : scale;
    return `scale(${sx}, ${sy}) rotate(${Number(item?.rotation || 0)}deg) skew(${Number(item?.skewX || 0)}deg, ${Number(item?.skewY || 0)}deg)`;
  }

  function objectSize(item) {
    const node = selectedNode();
    const rect = node?.getBoundingClientRect?.();
    if (rect?.width && rect?.height) {
      const maxW = Math.min(500, (window.innerWidth || 1200) * 0.42);
      const maxH = Math.min(400, (window.innerHeight || 850) * 0.46);
      const fit = Math.min(1, maxW / rect.width, maxH / rect.height);
      return { w: Math.max(12, rect.width * fit), h: Math.max(12, rect.height * fit) };
    }
    return { w: Math.max(12, Math.min(480, Number(item?.width || 12) * 5.2)), h: Math.max(12, Math.min(390, Number(item?.height || 12) * 5.2)) };
  }

  function resolveAssetPath(path) {
    if (!path) return '';
    if (/^(https?:|data:|blob:|\/|\.\.\/)/i.test(path)) return path;
    const prefix = location.pathname.includes('/Forever-Bound-Game/') ? '/Forever-Bound-Game/' : '/';
    return prefix + String(path).replace(/^\.\//, '');
  }

  function imageSourceFor(item) {
    const candidates = [item?.image, item?.sprite, item?.src, item?.path, item?.asset, item?.assetPath, item?.imagePath].filter(Boolean);
    const stageImg = selectedNode()?.querySelector('img');
    if (stageImg?.currentSrc) candidates.unshift(stageImg.currentSrc);
    if (stageImg?.src) candidates.unshift(stageImg.src);
    return resolveAssetPath(candidates.find(Boolean) || '');
  }

  function applyPanZoom() {
    const layer = STATE.modal?.querySelector('.object-preview-pan-layer-v24');
    if (layer) layer.style.transform = `translate(${STATE.panX}px, ${STATE.panY}px) scale(${STATE.zoom})`;
    const slider = STATE.modal?.querySelector('#objectPreviewZoomV24');
    const label = STATE.modal?.querySelector('.object-preview-zoom-readout-v24');
    if (slider && document.activeElement !== slider) slider.value = String(STATE.zoom);
    if (label) label.textContent = `${Math.round(STATE.zoom * 100)}%`;
  }

  function setBackground(bg) {
    STATE.bg = bg;
    const stage = STATE.modal?.querySelector('.object-preview-stage-v24');
    if (stage) stage.dataset.bg = bg;
    STATE.modal?.querySelectorAll('.object-preview-bg-v24').forEach((button) => button.classList.toggle('is-active-v24', button.dataset.bg === bg));
  }

  function closePreview() {
    STATE.open = false;
    STATE.modal?.remove();
    STATE.modal = null;
    STATE.button?.classList.remove('is-active-v24');
  }

  function clearSelection() {
    closePreview();
    api()?.select?.('element', '');
    api()?.toast?.('Selection cleared');
  }

  function modalMarkup() {
    return `<div class="object-preview-modal-v24" role="dialog" aria-label="Selected object preview"><div class="object-preview-titlebar-v24"><div class="object-preview-title-v24">Selected Object Preview</div><div class="object-preview-actions-v24"><label class="object-preview-zoom-v24" title="Preview zoom"><span class="object-preview-zoom-readout-v24">100%</span><input id="objectPreviewZoomV24" type="range" min="0.25" max="3" step="0.05" value="1"></label><button type="button" class="object-preview-bg-v24" data-bg="black" title="Black background">B</button><button type="button" class="object-preview-bg-v24" data-bg="white" title="White background">W</button><button type="button" class="object-preview-bg-v24" data-bg="green" title="Green background">G</button><button type="button" class="object-preview-close-v24" title="Close preview">×</button></div></div><div class="object-preview-stage-v24" data-bg="${esc(STATE.bg)}"></div></div>`;
  }

  function openPreview() {
    const item = selectedItem();
    if (!item) return;
    closePreview();
    STATE.zoom = 1;
    STATE.panX = 0;
    STATE.panY = 0;
    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalMarkup();
    STATE.modal = wrapper.firstElementChild;
    document.body.appendChild(STATE.modal);
    STATE.open = true;
    STATE.button?.classList.add('is-active-v24');
    STATE.modal.querySelector('.object-preview-close-v24')?.addEventListener('click', closePreview);
    STATE.modal.querySelectorAll('.object-preview-bg-v24').forEach((button) => button.addEventListener('click', () => setBackground(button.dataset.bg || 'black')));
    STATE.modal.querySelector('#objectPreviewZoomV24')?.addEventListener('input', (event) => { STATE.zoom = Number(event.target.value) || 1; applyPanZoom(); });
    const stage = STATE.modal.querySelector('.object-preview-stage-v24');
    stage?.addEventListener('pointerdown', beginPan, true);
    setBackground(STATE.bg);
    renderPreview();
  }

  function beginPan(event) {
    if (event.button !== 1) return;
    const stage = STATE.modal?.querySelector('.object-preview-stage-v24');
    if (!stage) return;
    STATE.panning = { x: event.clientX, y: event.clientY, panX: STATE.panX, panY: STATE.panY };
    stage.classList.add('is-panning-v24');
    const move = (moveEvent) => {
      if (!STATE.panning) return;
      STATE.panX = STATE.panning.panX + (moveEvent.clientX - STATE.panning.x);
      STATE.panY = STATE.panning.panY + (moveEvent.clientY - STATE.panning.y);
      applyPanZoom();
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
    };
    const end = () => {
      STATE.panning = null;
      stage.classList.remove('is-panning-v24');
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', end, true);
      window.removeEventListener('pointercancel', end, true);
    };
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', end, true);
    window.addEventListener('pointercancel', end, true);
    event.preventDefault();
    event.stopPropagation();
  }

  function renderPreview() {
    if (!STATE.open || !STATE.modal || STATE.panning) return;
    const item = selectedItem();
    const stage = STATE.modal.querySelector('.object-preview-stage-v24');
    const title = STATE.modal.querySelector('.object-preview-title-v24');
    if (!stage) return;
    if (!item) {
      stage.innerHTML = '<div class="object-preview-empty-v24">Select an object to preview it cleanly.</div>';
      if (title) title.textContent = 'Selected Object Preview';
      return;
    }
    if (title) title.textContent = item.name || item.label || item.id || 'Selected Object Preview';
    const { w, h } = objectSize(item);
    const visual = visualFor(item);
    const image = imageSourceFor(item);
    const content = image ? `<img src="${esc(image)}" alt="${esc(item.name || item.label || item.id || '')}" data-preview-img-v24="true">` : `<div class="object-preview-text-v24">${esc(item.text || item.name || item.label || item.id || 'Object')}</div>`;
    stage.innerHTML = `<div class="object-preview-pan-layer-v24"><div class="object-preview-object-v24">${content}</div></div>`;
    const node = stage.querySelector('.object-preview-object-v24');
    if (!node) return;
    node.style.width = `${w}px`;
    node.style.height = `${h}px`;
    node.style.opacity = String(clamp(visual.opacity ?? item.opacity ?? 100, 0, 100) / 100);
    node.style.filter = filterFor(item);
    node.style.transform = transformFor(item);
    node.style.mixBlendMode = visual.blendMode || 'normal';
    const previewImg = node.querySelector('[data-preview-img-v24]');
    if (previewImg) previewImg.onerror = () => { stage.innerHTML = `<div class="object-preview-error-v24">Preview image path did not load.<br>${esc(image)}</div>`; };
    applyPanZoom();
  }

  function bindClearSelectionButton(previewButton) {
    const wrap = previewButton?.closest('.stage-wrap');
    if (!wrap) return;
    let button = wrap.querySelector('.clear-selection-btn-v36');
    if (!button) {
      button = document.createElement('button');
      button.type = 'button';
      button.className = 'clear-selection-btn-v36';
      button.title = 'Clear selection and view the clean scene';
      button.setAttribute('aria-label', 'Clear selection and view the clean scene');
      button.textContent = '⌧';
      previewButton.insertAdjacentElement('afterend', button);
    }
    STATE.clearButton = button;
    button.disabled = !selectedItem();
    if (button.dataset.clearSelectionBound === 'true') return;
    button.dataset.clearSelectionBound = 'true';
    button.addEventListener('click', clearSelection);
  }

  function bindButton() {
    const button = document.querySelector('.object-preview-btn-v24');
    if (!button) return;
    STATE.button = button;
    STATE.button.disabled = !selectedItem();
    bindClearSelectionButton(button);
    if (button.dataset.previewOwnerBound === 'true') return;
    button.dataset.previewOwnerBound = 'true';
    button.addEventListener('click', () => { if (STATE.open) closePreview(); else openPreview(); });
  }

  function syncPreview() { bindButton(); if (STATE.open) renderPreview(); }
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape' && STATE.open) closePreview(); }, true);
  window.addEventListener('load', syncPreview);
  document.addEventListener('click', () => requestAnimationFrame(syncPreview), true);
  document.addEventListener('input', () => requestAnimationFrame(syncPreview), true);
  document.addEventListener('change', () => requestAnimationFrame(syncPreview), true);
  document.addEventListener('pointerup', () => requestAnimationFrame(syncPreview), true);
  requestAnimationFrame(syncPreview);
})();