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
    shadowBlur: 25,
    glowStrength: 0
  };

  let applying = false;
  let lastInstalledObjectId = '';
  let lastVisualCardBody = null;

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
    return `<div class="field visual-live-field-v21"><label for="${id}">${esc(label)}</label><select id="${id}">${options.map((option) => `<option value="${esc(option)}" ${option === value ? 'selected' : ''}>${esc(option)}</option>`).join('')}</select></div>`;
  }

  function numberMarkup(id, label, value, min, max, step = 1) {
    return `<div class="field visual-live-field-v21"><label for="${id}">${esc(label)}</label><input id="${id}" type="number" min="${min}" max="${max}" step="${step}" value="${esc(value)}"></div>`;
  }

  function cardMarkup(visual) {
    return `
      <div class="v15-card-content visual-card-content-v15 visual-live-controls-v21">
        <p class="card-layout-note visual-note-v21">Live visual controls. Vibrance is boosted through stronger saturation/contrast because CSS has no native vibrance filter; Exposure is applied as extra brightness.</p>
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
          ${numberMarkup('visualShadowBlurV21', 'Shadow Blur', visual.shadowBlur, 0, 100, 1)}
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

  function buildVisualFilter(visual) {
    const vibrance = clamp(visual.vibrance, -100, 100);
    const brightness = clamp(Number(visual.brightness) + Number(visual.exposure || 0), 0, 340);
    const contrast = clamp(Number(visual.contrast) + Math.max(0, vibrance) * 0.38, 0, 340);
    const saturation = clamp(Number(visual.saturation) + vibrance * 1.2, 0, 360);
    const hue = clamp(visual.hue, -360, 360);
    const shadow = clamp(visual.shadowStrength, 0, 100);
    const glow = clamp(visual.glowStrength, 0, 100);
    const filters = [`brightness(${brightness}%)`, `contrast(${contrast}%)`, `saturate(${saturation}%)`, `hue-rotate(${hue}deg)`];

    if (shadow > 0) {
      const offset = Math.round(2 + shadow * 0.11);
      const shadowBlur = clamp(visual.shadowBlur, 0, 100);
      const blur = Math.round(1 + shadowBlur * 0.62);
      const alpha = clamp(0.22 + shadow / 80, 0, 1);
      filters.push(`drop-shadow(${Math.round(shadow * 0.08)}px ${offset}px ${blur}px rgba(0,0,0,${alpha}))`);
      if (shadow > 45) filters.push(`drop-shadow(0 ${Math.round(offset * 0.5)}px ${Math.round(blur * 0.55)}px rgba(0,0,0,${clamp(alpha * 0.75, 0, 0.95)}))`);
    }
    if (glow > 0) {
      const blur1 = Math.round(5 + glow * 0.42);
      const blur2 = Math.round(9 + glow * 0.72);
      const alpha = clamp(0.34 + glow / 70, 0, 1);
      filters.push(`drop-shadow(0 0 ${blur1}px rgba(195,0,255,${alpha}))`);
      if (glow > 35) filters.push(`drop-shadow(0 0 ${blur2}px rgba(255,135,255,${clamp(alpha * 0.72, 0, 0.9)}))`);
    }
    return filters.join(' ');
  }

  function applyVisualToNode(node, item) {
    const visual = visualForRead(item);
    const target = targetForNode(node);
    const opacity = clamp(visual.opacity, 0, 100) / 100;
    target.style.filter = buildVisualFilter(visual);
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
    setInputValue('visualShadowBlurV21', visual.shadowBlur);
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
      if (input.id === 'visualShadowBlurV21') visual.shadowBlur = clamp(input.value, 0, 100);
      if (input.id === 'visualGlowStrengthV21') visual.glowStrength = clamp(input.value, 0, 100);

      applyVisuals();
      api()?.saveWorkingCopySoon?.('visual adjustment');
    }, true);
    body.addEventListener('change', () => api()?.saveWorkingCopySoon?.('visual adjustment'), true);
  }

  function installVisualControls(force = false) {
    if (applying) return;
    applying = true;
    try {
      const item = selectedItem();
      const card = document.querySelector('[data-card-id="visual-v15"]');
      const body = card?.querySelector('.card-body');
      if (!item || !card || !body) return;
      const visual = ensureVisual(item);
      const objectChanged = lastInstalledObjectId !== item.id;
      const bodyChanged = lastVisualCardBody !== body;
      const missingControls = !body.querySelector('.visual-live-controls-v21');

      if (force || objectChanged || bodyChanged || missingControls) {
        body.innerHTML = cardMarkup(visual);
        body.dataset.v21Object = item.id || '';
        body.dataset.v21VisualBound = '';
        lastInstalledObjectId = item.id || '';
        lastVisualCardBody = body;
      }

      bindVisualControls(body);
      syncControls(item);
      applyVisuals();
    } finally {
      applying = false;
    }
  }

  function scheduleInstall() {
    requestAnimationFrame(() => requestAnimationFrame(() => installVisualControls(false)));
  }

  function schedulePaint() {
    requestAnimationFrame(applyVisuals);
  }

  window.addEventListener('load', () => installVisualControls(true));
  document.addEventListener('click', (event) => {
    if (event.target.closest?.('.card-toggle')) {
      schedulePaint();
      return;
    }
    scheduleInstall();
  }, true);
  document.addEventListener('change', (event) => {
    if (!event.target.closest?.('.visual-live-controls-v21')) scheduleInstall();
  }, true);
  document.addEventListener('input', (event) => {
    if (!event.target.closest?.('.visual-live-controls-v21')) scheduleInstall();
  }, true);
  document.addEventListener('pointerup', schedulePaint, true);
  setInterval(() => {
    const item = selectedItem();
    const body = document.querySelector('[data-card-id="visual-v15"] .card-body');
    if (!item || !body) return;
    if (lastInstalledObjectId !== item.id || lastVisualCardBody !== body || !body.querySelector('.visual-live-controls-v21')) installVisualControls(false);
    else applyVisuals();
  }, 1200);
  scheduleInstall();
})();
