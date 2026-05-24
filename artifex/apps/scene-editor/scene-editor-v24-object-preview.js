(() => {
  'use strict';

  const STATE = { open: false, bg: 'black', modal: null, button: null };

  function api() {
    return window.ArtifexSceneEditorCore || null;
  }

  function selectedItem() {
    return api()?.getSelectedItem?.() || null;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value || 0)));
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function visualFor(item) {
    return item?.visual || {};
  }

  function filterFor(item) {
    const visual = visualFor(item);
    const brightness = clamp(Number(visual.brightness ?? 100) + Number(visual.exposure ?? 0), 0, 300);
    const contrast = clamp(visual.contrast ?? 100, 0, 300);
    const saturation = clamp(Number(visual.saturation ?? 100) + Number(visual.vibrance ?? 0) * 0.35, 0, 300);
    const hue = clamp(visual.hue ?? 0, -360, 360);
    const shadow = clamp(visual.shadowStrength ?? 0, 0, 100);
    const glow = clamp(visual.glowStrength ?? 0, 0, 100);
    const filters = [`brightness(${brightness}%)`, `contrast(${contrast}%)`, `saturate(${saturation}%)`, `hue-rotate(${hue}deg)`];

    if (shadow > 0) {
      const blur = Math.round(2 + shadow * 0.18);
      const alpha = clamp(0.18 + shadow / 140, 0, 0.92);
      filters.push(`drop-shadow(${Math.round(shadow * 0.04)}px ${Math.round(2 + shadow * 0.05)}px ${blur}px rgba(0,0,0,${alpha}))`);
    }
    if (glow > 0) {
      const blur = Math.round(3 + glow * 0.24);
      const alpha = clamp(0.2 + glow / 130, 0, 0.95);
      filters.push(`drop-shadow(0 0 ${blur}px rgba(195,0,255,${alpha}))`);
    }
    return filters.join(' ');
  }

  function transformFor(item) {
    const scale = clamp(1 + Number(item?.zDepth || 0) * 0.035, 0.45, 2.15);
    const sx = item?.flipX ? -scale : scale;
    const sy = item?.flipY ? -scale : scale;
    return `scale(${sx}, ${sy}) rotate(${Number(item?.rotation || 0)}deg) skew(${Number(item?.skewX || 0)}deg, ${Number(item?.skewY || 0)}deg)`;
  }

  function objectSize(item) {
    const w = Math.max(34, Math.min(480, Number(item?.width || 12) * 5.2));
    const h = Math.max(34, Math.min(390, Number(item?.height || 12) * 5.2));
    return { w, h };
  }

  function setBackground(bg) {
    STATE.bg = bg;
    const stage = STATE.modal?.querySelector('.object-preview-stage-v24');
    if (stage) stage.dataset.bg = bg;
    STATE.modal?.querySelectorAll('.object-preview-bg-v24').forEach((button) => {
      button.classList.toggle('is-active-v24', button.dataset.bg === bg);
    });
  }

  function closePreview() {
    STATE.open = false;
    STATE.modal?.remove();
    STATE.modal = null;
    STATE.button?.classList.remove('is-active-v24');
  }

  function modalMarkup() {
    return `
      <div class="object-preview-modal-v24" role="dialog" aria-label="Selected object preview">
        <div class="object-preview-titlebar-v24">
          <div class="object-preview-title-v24">Selected Object Preview</div>
          <div class="object-preview-actions-v24">
            <button type="button" class="object-preview-bg-v24" data-bg="black" title="Black background">B</button>
            <button type="button" class="object-preview-bg-v24" data-bg="white" title="White background">W</button>
            <button type="button" class="object-preview-bg-v24" data-bg="green" title="Green background">G</button>
            <button type="button" class="object-preview-close-v24" title="Close preview">×</button>
          </div>
        </div>
        <div class="object-preview-stage-v24" data-bg="${esc(STATE.bg)}"></div>
      </div>`;
  }

  function openPreview() {
    const item = selectedItem();
    if (!item) return;
    closePreview();
    const wrapper = document.createElement('div');
    wrapper.innerHTML = modalMarkup();
    STATE.modal = wrapper.firstElementChild;
    document.body.appendChild(STATE.modal);
    STATE.open = true;
    STATE.button?.classList.add('is-active-v24');

    STATE.modal.querySelector('.object-preview-close-v24')?.addEventListener('click', closePreview);
    STATE.modal.querySelectorAll('.object-preview-bg-v24').forEach((button) => {
      button.addEventListener('click', () => setBackground(button.dataset.bg || 'black'));
    });
    setBackground(STATE.bg);
    renderPreview();
  }

  function renderPreview() {
    if (!STATE.open || !STATE.modal) return;
    const item = selectedItem();
    const stage = STATE.modal.querySelector('.object-preview-stage-v24');
    const title = STATE.modal.querySelector('.object-preview-title-v24');
    if (!stage) return;

    if (!item) {
      stage.innerHTML = '<div class="object-preview-empty-v24">Select an object to preview it cleanly.</div>';
      if (title) title.textContent = 'Selected Object Preview';
      return;
    }

    if (title) title.textContent = item.label || item.id || 'Selected Object Preview';
    const { w, h } = objectSize(item);
    const visual = visualFor(item);
    const image = item.image || item.sprite || '';
    const content = image
      ? `<img src="${esc(image)}" alt="${esc(item.label || item.id || '')}">`
      : `<div class="object-preview-text-v24">${esc(item.text || item.label || item.id || 'Object')}</div>`;

    stage.innerHTML = `<div class="object-preview-object-v24">${content}</div>`;
    const node = stage.querySelector('.object-preview-object-v24');
    if (!node) return;
    node.style.width = `${w}px`;
    node.style.height = `${h}px`;
    node.style.opacity = String(clamp(visual.opacity ?? item.opacity ?? 100, 0, 100) / 100);
    node.style.filter = filterFor(item);
    node.style.transform = transformFor(item);
    node.style.mixBlendMode = visual.blendMode || 'normal';
  }

  function installButton() {
    const wrap = document.getElementById('stageWrap') || document.querySelector('.stage-wrap, .editor-stage-wrap, .work-panel');
    if (!wrap) return;
    if (!STATE.button || !document.body.contains(STATE.button)) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'object-preview-btn-v24';
      button.title = 'Preview selected object cleanly';
      button.setAttribute('aria-label', 'Preview selected object cleanly');
      button.textContent = '👁';
      button.addEventListener('click', () => {
        if (STATE.open) closePreview();
        else openPreview();
      });
      wrap.appendChild(button);
      STATE.button = button;
    }
    STATE.button.disabled = !selectedItem();
  }

  function tick() {
    installButton();
    if (STATE.open) renderPreview();
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && STATE.open) closePreview();
  }, true);
  window.addEventListener('load', tick);
  document.addEventListener('click', () => requestAnimationFrame(tick), true);
  document.addEventListener('input', () => requestAnimationFrame(tick), true);
  document.addEventListener('change', () => requestAnimationFrame(tick), true);
  document.addEventListener('pointerup', () => requestAnimationFrame(tick), true);
  setInterval(tick, 700);
  tick();
})();
