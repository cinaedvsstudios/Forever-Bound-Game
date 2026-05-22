(() => {
  'use strict';

  const BLEND_MODES = ['normal', 'screen', 'multiply', 'overlay', 'lighter', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'luminosity'];
  const DEFAULTS = {
    blendMode: 'normal',
    opacity: 100,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    vibrance: 0,
    exposure: 0,
    shadowStrength: 0,
    glowStrength: 0
  };

  let applying = false;

  function api() {
    return window.ArtifexSceneEditorCore || null;
  }

  function selectedItem() {
    return api()?.getSelectedItem?.() || null;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value || 0)));
  }

  function ensureVisual(item) {
    if (!item) return null;
    if (!item.visual || typeof item.visual !== 'object' || Array.isArray(item.visual)) item.visual = {};
    Object.entries(DEFAULTS).forEach(([key, value]) => {
      if (item.visual[key] === undefined || item.visual[key] === null || item.visual[key] === '') item.visual[key] = value;
    });
    return item.visual;
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function selectMarkup(id, label, value, options) {
    return `<div class="field visual-live-field-v21"><label for="${id}">${esc(label)}</label><select id="${id}" data-visual-key="${id.replace('visual', '').replace('V21', '')}">${options.map((option) => `<option value="${esc(option)}" ${option === value ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select></div>`;
  }

  function numberMarkup(id, label, value, min, max, step = 1) {
    return `<div class="field visual-live-field-v21"><label for="${id}">${esc(label)}</label><input id="${id}" type="number" min="${min}" max="${max}" step="${step}" value="${esc(value)}"></div>`;
  }

  function cardMarkup(visual) {
    return `
      <div class="v15-card-content visual-card-content-v15 visual-live-controls-v21">
        <p class="card-layout-note visual-note-v21">Live visual controls. Vibrance is approximated through extra saturation because CSS has no native vibrance filter; Exposure is applied as an extra brightness offset.</p>
        <div class="card-layout-group card-layout-2 visual-effects-live-group-v21">
          ${selectMarkup('visualBlendModeV21', 'Blend Mode', visual.blendMode, BLEND_MODES)}
          ${numberMarkup('visualOpacityV21', 'Opacity', visual.opacity, 0, 100, 1)}
          ${numberMarkup('visualBrightnessV21', 'Brightness', visual.brightness, 0, 250, 1)}
          ${numberMarkup('visualContrastV21', 'Contrast', visual.contrast, 0, 250, 1)}
          ${numberMarkup('visualSaturationV21', 'Saturation', visual.saturation, 0, 250, 1)}
          ${numberMarkup('visualHueV21', 'Hue', visual.hue, -180, 180, 1)}
          ${numberMarkup('visualVibranceV21', 'Vibrance', visual.vibrance, -100, 100, 1)}
          ${numberMarkup('visualExposureV21', 'Exposure', visual.exposure, -100, 100, 1)}
          ${numberMarkup('visualShadowStrengthV21', 'Shadow Strength', visual.shadowStrength, 0, 100, 1)}
          ${numberMarkup('visualGlowStrengthV21', 'Glow Strength', visual.glowStrength, 0, 100, 1)}
        </div>
      </div>`;
  }

  function targetForNode(node) {
    return node.querySelector(':scope > img') || node.querySelector(':scope > .small') || node;
  }

  function visualForRead(item) {
    const visual = { ...DEFAULTS, ...(item?.visual || {}) };
    visual.blendMode = BLEND_MODES.includes(visual.blendMode) ? visual.blendMode : 'normal';
    return visual;
  }

  function applyVisualToNode(node, item) {
    const visual = visualForRead(item);
    const target = targetForNode(node);
    const brightness = clamp(Number(visual.brightness) + Number(visual.exposure || 0), 0, 300);
    const contrast = clamp(visual.contrast, 0, 300);
    const saturation = clamp(Number(visual.saturation) + Number(visual.vibrance || 0) * 0.35, 0, 300);
    const hue = clamp(visual.hue, -360, 360);
    const opacity = clamp(visual.opacity, 0, 100) / 100;
    const shadow = clamp(visual.shadowStrength, 0, 100);
    const glow = clamp(visual.glowStrength, 0, 100);
    const filters = [
      `brightness(${brightness}%)`,
      `contrast(${contrast}%)`,
      `saturate(${saturation}%)`,
      `hue-rotate(${hue}deg)`
    ];

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

    target.style.filter = filters.join(' ');
    target.style.opacity = String(opacity);
    node.style.mixBlendMode = visual.blendMode || 'normal';
  }

  function applyVisuals() {
    const editor = api();
    if (!editor) return;
    document.querySelectorAll('.scene-item[data-stage-id]').forEach((node) => {
      const item = editor.getAllItems?.().find((entry) => entry.id === node.dataset.stageId);
      if (item) applyVisualToNode(node, item);
    });
  }

  function setInputValue(id, value) {
    const input = document.getElementById(id);
    if (input && document.activeElement !== input) input.value = value;
  }

  function syncControls(item) {
    const visual = ensureVisual(item);
    if (!visual) return;
    setInputValue('visualBlendModeV21', visual.blendMode);
    setInputValue('visualOpacityV21', visual.opacity);
    setInputValue('visualBrightnessV21', visual.brightness);
    setInputValue('visualContrastV21', visual.contrast);
    setInputValue('visualSaturationV21', visual.saturation);
    setInputValue('visualHueV21', visual.hue);
    setInputValue('visualVibranceV21', visual.vibrance);
    setInputValue('visualExposureV21', visual.exposure);
    setInputValue('visualShadowStrengthV21', visual.shadowStrength);
    setInputValue('visualGlowStrengthV21', visual.glowStrength);
  }

  function bindVisualControls(body) {
    if (body.dataset.v21VisualBound === 'true') return;
    body.dataset.v21VisualBound = 'true';
    body.addEventListener('input', (event) => {
      const input = event.target.closest?.('input, select');
      if (!input) return;
      const item = selectedItem();
      const visual = ensureVisual(item);
      if (!visual) return;

      if (input.id === 'visualBlendModeV21') visual.blendMode = input.value || 'normal';
      if (input.id === 'visualOpacityV21') visual.opacity = clamp(input.value, 0, 100);
      if (input.id === 'visualBrightnessV21') visual.brightness = clamp(input.value, 0, 250);
      if (input.id === 'visualContrastV21') visual.contrast = clamp(input.value, 0, 250);
      if (input.id === 'visualSaturationV21') visual.saturation = clamp(input.value, 0, 250);
      if (input.id === 'visualHueV21') visual.hue = clamp(input.value, -180, 180);
      if (input.id === 'visualVibranceV21') visual.vibrance = clamp(input.value, -100, 100);
      if (input.id === 'visualExposureV21') visual.exposure = clamp(input.value, -100, 100);
      if (input.id === 'visualShadowStrengthV21') visual.shadowStrength = clamp(input.value, 0, 100);
      if (input.id === 'visualGlowStrengthV21') visual.glowStrength = clamp(input.value, 0, 100);

      applyVisuals();
      api()?.saveWorkingCopySoon?.('visual adjustment');
    }, true);
    body.addEventListener('change', () => api()?.saveWorkingCopySoon?.('visual adjustment'), true);
  }

  function installVisualControls() {
    if (applying) return;
    applying = true;
    try {
      const item = selectedItem();
      const card = document.querySelector('[data-card-id="visual-v15"]');
      const body = card?.querySelector('.card-body');
      if (!item || !card || !body) return;
      const visual = ensureVisual(item);
      if (!body.querySelector('.visual-live-controls-v21') || body.dataset.v21Object !== item.id) {
        body.innerHTML = cardMarkup(visual);
        body.dataset.v21Object = item.id || '';
        body.dataset.v21VisualBound = '';
      }
      bindVisualControls(body);
      syncControls(item);
      applyVisuals();
    } finally {
      applying = false;
    }
  }

  function schedule() {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      installVisualControls();
      applyVisuals();
    }));
  }

  window.addEventListener('load', schedule);
  document.addEventListener('click', schedule, true);
  document.addEventListener('change', schedule, true);
  document.addEventListener('input', (event) => {
    if (!event.target.closest?.('.visual-live-controls-v21')) schedule();
  }, true);
  document.addEventListener('pointerup', schedule, true);
  setInterval(schedule, 900);
  schedule();
})();
