(() => {
  'use strict';

  const BLEND_MODES = ['normal', 'screen', 'multiply', 'overlay', 'lighter', 'darken', 'lighten', 'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'luminosity'];
  const DEFAULTS = { blendMode: 'normal', opacity: 100, brightness: 100, contrast: 100, saturation: 100, hue: 0, vibrance: 0, exposure: 0, shadowStrength: 0, shadowBlur: 25, glowStrength: 0 };

  function api() { return window.ArtifexSceneEditorCore || null; }
  function selectedItem() { return api()?.getSelectedItem?.() || null; }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value || 0))); }
  function ensureVisual(item) {
    if (!item) return null;
    if (!item.visual || typeof item.visual !== 'object' || Array.isArray(item.visual)) item.visual = {};
    Object.entries(DEFAULTS).forEach(([key, value]) => { if (item.visual[key] === undefined || item.visual[key] === null || item.visual[key] === '') item.visual[key] = value; });
    if (!BLEND_MODES.includes(item.visual.blendMode)) item.visual.blendMode = 'normal';
    return item.visual;
  }
  function visualForRead(item) { const visual = { ...DEFAULTS, ...(item?.visual || {}) }; visual.blendMode = BLEND_MODES.includes(visual.blendMode) ? visual.blendMode : 'normal'; return visual; }
  function targetForNode(node) { return node.querySelector(':scope > img') || node.querySelector(':scope > .scene-image-v33') || node.querySelector(':scope > .small') || node; }
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
      const blur = Math.round(1 + clamp(visual.shadowBlur, 0, 100) * 0.62);
      const alpha = clamp(0.22 + shadow / 80, 0, 1);
      filters.push(`drop-shadow(${Math.round(shadow * 0.08)}px ${offset}px ${blur}px rgba(0,0,0,${alpha}))`);
    }
    if (glow > 0) {
      const blur = Math.round(5 + glow * 0.42);
      const alpha = clamp(0.34 + glow / 70, 0, 1);
      filters.push(`drop-shadow(0 0 ${blur}px rgba(255,245,170,${alpha}))`);
    }
    return filters.join(' ');
  }
  function applyVisualToNode(node, item) {
    const visual = visualForRead(item);
    const target = targetForNode(node);
    target.style.filter = buildVisualFilter(visual);
    target.style.opacity = String(clamp(visual.opacity ?? item.opacity ?? 100, 0, 100) / 100);
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
  function setInputValue(id, value) { const input = document.getElementById(id); if (input && document.activeElement !== input) input.value = value; }
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
      const visual = ensureVisual(selectedItem());
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
  function bindVisualCard() {
    const item = selectedItem();
    const body = document.querySelector('[data-card-id="visual-v15"] .card-body');
    if (item) syncControls(item);
    if (body) bindVisualControls(body);
    applyVisuals();
  }

  window.addEventListener('load', bindVisualCard);
  document.addEventListener('click', () => requestAnimationFrame(bindVisualCard), true);
  document.addEventListener('input', (event) => { if (!event.target.closest?.('.visual-live-controls-v21')) requestAnimationFrame(bindVisualCard); }, true);
  document.addEventListener('change', () => requestAnimationFrame(bindVisualCard), true);
  document.addEventListener('pointerup', () => requestAnimationFrame(applyVisuals), true);
  requestAnimationFrame(bindVisualCard);
})();
