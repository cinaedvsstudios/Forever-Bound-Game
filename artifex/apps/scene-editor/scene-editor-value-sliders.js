(() => {
  'use strict';

  const NUMERIC_SELECTORS = '.side-panel input[type="number"], .object-inspector input[type="number"]';
  const baselineValues = new Map();
  let resetMenu = null;

  function core() { return window.ArtifexSceneEditorCore || null; }
  function baselineKeyFor(input) {
    const id = input.id || '';
    const selected = core()?.getSelectedItem?.();
    if (id.startsWith('item') || id === 'layerPill') return `${selected?.id || 'selected'}:${id}`;
    return `global:${id}`;
  }
  function rememberBaseline(input) {
    const key = baselineKeyFor(input);
    if (!baselineValues.has(key)) baselineValues.set(key, input.value || '0');
  }
  function clamp(value, min, max) { return Math.max(min, Math.min(max, Number(value || 0))); }
  function configFor(input) {
    const id = input.id || '';
    const label = input.closest('.field')?.querySelector('label')?.textContent || '';
    const name = `${id} ${label}`.toLowerCase();
    const current = Number(input.value || 0);
    if (id === 'itemRotation' || name.includes('rotate')) return { min: -180, max: 180, step: 1, reset: 0 };
    if (id === 'itemSkewX' || id === 'itemSkewY' || name.includes('skew')) return { min: -60, max: 60, step: 1, reset: 0 };
    if (id === 'itemZ' || name.includes('depth')) return { min: -20, max: 20, step: 1, reset: 0 };
    if (id === 'itemLayer' || id === 'layerPill' || name.includes('layer')) return { min: 0, max: 100, step: 1, reset: 10 };
    if (id === 'gridCols' || name.includes('grid columns')) return { min: 1, max: 64, step: 1, reset: 16 };
    if (id === 'gridRows' || name.includes('grid rows')) return { min: 1, max: 64, step: 1, reset: 9 };
    if (id === 'itemW' || name.includes('width')) return { min: 1, max: 200, step: 0.25, reset: null, baselineReset: true };
    if (id === 'itemH' || name.includes('height')) return { min: 1, max: 200, step: 0.25, reset: null, baselineReset: true };
    if (id === 'itemX' || name.includes('x axis')) return { min: -100, max: 200, step: 0.25, reset: 0 };
    if (id === 'itemY' || name.includes('y axis')) return { min: -100, max: 200, step: 0.25, reset: 0 };
    if (id.includes('Opacity')) return { min: 0, max: 100, step: 1, reset: 100 };
    if (id.includes('Brightness') || id.includes('Contrast') || id.includes('Saturation')) return { min: 0, max: 250, step: 1, reset: 100 };
    if (id.includes('ShadowBlur')) return { min: 0, max: 100, step: 1, reset: 25 };
    if (id.includes('Hue') || id.includes('Vibrance') || id.includes('Exposure') || id.includes('ShadowStrength') || id.includes('GlowStrength')) return { min: id.includes('Hue') ? -180 : id.includes('Vibrance') || id.includes('Exposure') ? -100 : 0, max: id.includes('Hue') ? 180 : 100, step: 1, reset: 0 };
    const explicitMin = input.getAttribute('min');
    const explicitMax = input.getAttribute('max');
    const explicitStep = input.getAttribute('step');
    return {
      min: explicitMin !== null ? Number(explicitMin) : Math.min(0, current - 50),
      max: explicitMax !== null ? Number(explicitMax) : Math.max(100, current + 50),
      step: explicitStep !== null && explicitStep !== 'any' ? Number(explicitStep) : 1,
      reset: explicitMin !== null && explicitMax !== null ? clamp(0, Number(explicitMin), Number(explicitMax)) : 0
    };
  }
  function resetValueFor(input) {
    const cfg = configFor(input);
    if (!cfg.baselineReset) return cfg.reset;
    const stored = baselineValues.get(baselineKeyFor(input));
    return stored !== undefined ? stored : input.value || 0;
  }
  function decimalsFor(step) { const text = String(step); return text.includes('.') ? text.split('.')[1].length : 0; }
  function formatValue(value, step) { return Number(value).toFixed(Math.max(0, Math.min(4, decimalsFor(step)))).replace(/(?:\.0+|(\.\d+?)0+)$/, '$1'); }
  function escAttr(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
  function labelFor(input) { return input.closest('.field')?.querySelector('label')?.textContent?.trim() || input.id || 'Value'; }
  function snap(value, cfg) { return clamp(Number(formatValue(Math.round((Number(value) - cfg.min) / cfg.step) * cfg.step + cfg.min, cfg.step)), cfg.min, cfg.max); }
  function closeResetMenu() { resetMenu?.remove(); resetMenu = null; }
  function closeOtherSliders(except) {
    document.querySelectorAll('.value-slider-popover-v18.is-open').forEach((node) => { if (node !== except) node.classList.remove('is-open'); });
    document.querySelectorAll('.value-slider-dot-v18.is-open').forEach((node) => { if (!except || !node.closest('.value-slider-field-v18')?.contains(except)) node.classList.remove('is-open'); });
  }
  function syncSlider(input, options = {}) {
    const field = input.closest('.value-slider-field-v18');
    const range = field?.querySelector('.value-slider-range-v18');
    const readout = field?.querySelector('.value-slider-readout-v18');
    if (!range) return;
    const cfg = configFor(input);
    const value = clamp(Number(input.value || 0), cfg.min, cfg.max);
    range.min = String(cfg.min);
    range.max = String(cfg.max);
    range.step = String(cfg.step);
    range.value = formatValue(value, cfg.step);
    range.setAttribute('aria-valuemin', String(cfg.min));
    range.setAttribute('aria-valuemax', String(cfg.max));
    range.setAttribute('aria-valuenow', String(value));
    range.style.setProperty('--value-slider-percent', `${cfg.max === cfg.min ? 0 : ((value - cfg.min) / (cfg.max - cfg.min)) * 100}%`);
    if (readout) {
      readout.min = String(cfg.min);
      readout.max = String(cfg.max);
      readout.step = 'any';
      if (options.forceReadout || (document.activeElement !== readout && readout.dataset.userTyping !== 'true')) readout.value = input.value || '0';
    }
  }
  function isCompleteNumericText(value) {
    const text = String(value || '').trim();
    if (!text || text === '-' || text === '+' || text.endsWith('.')) return false;
    return /^[+-]?(?:\d+|\d*\.\d+)$/.test(text) && Number.isFinite(Number(text));
  }
  function setInputValue(input, value, options = {}) {
    input.value = value;
    if (options.live !== false) input.dispatchEvent(new Event('input', { bubbles: true }));
    if (options.commit === true) input.dispatchEvent(new Event('change', { bubbles: true }));
  }
  function commitReadout(input, readout) {
    const cfg = configFor(input);
    delete readout.dataset.userTyping;
    const raw = String(readout.value || '').trim();
    const numeric = isCompleteNumericText(raw) ? Number(raw) : Number(input.value || resetValueFor(input) || 0);
    const value = formatValue(snap(clamp(numeric, cfg.min, cfg.max), cfg), cfg.step);
    const alreadyCommitted = readout.dataset.lastCommitted === value && String(input.value) === value;
    if (!alreadyCommitted) setInputValue(input, value, { live: String(input.value) !== value, commit: true });
    readout.dataset.lastCommitted = value;
    syncSlider(input, { forceReadout: true });
    readout.type = 'number';
  }
  function resetInput(input) {
    const cfg = configFor(input);
    const value = formatValue(clamp(resetValueFor(input), cfg.min, cfg.max), cfg.step);
    setInputValue(input, value, { live: true, commit: true });
    syncSlider(input);
    closeResetMenu();
  }
  function showResetMenu(event, input) {
    closeResetMenu();
    resetMenu = document.createElement('div');
    resetMenu.className = 'value-slider-reset-menu-v18';
    resetMenu.style.left = `${event.clientX}px`;
    resetMenu.style.top = `${event.clientY}px`;
    resetMenu.innerHTML = '<button type="button">Reset</button>';
    resetMenu.querySelector('button')?.addEventListener('click', () => resetInput(input));
    document.body.appendChild(resetMenu);
    event.preventDefault();
    event.stopPropagation();
  }
  function decorate(input) {
    if (!input || input.classList.contains('value-slider-readout-v18') || input.closest('.value-slider-control-v18') || input.dataset.v18ValueSlider === 'true') return;
    const field = input.closest('.field');
    if (!field) return;
    field.querySelectorAll(':scope > .value-slider-control-v18').forEach((node) => node.remove());
    rememberBaseline(input);
    input.dataset.v18ValueSlider = 'true';
    field.classList.add('value-slider-field-v18');
    const cfg = configFor(input);
    const label = labelFor(input);
    const escapedLabel = escAttr(label);
    input.setAttribute('step', String(cfg.step));
    input.setAttribute('min', String(cfg.min));
    input.setAttribute('max', String(cfg.max));
    const control = document.createElement('div');
    control.className = 'value-slider-control-v18';
    control.innerHTML = `<input class="value-slider-range-v18" type="range" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${escAttr(input.value || 0)}" aria-label="${escapedLabel} slider" title="Adjust ${escapedLabel}"><div class="value-slider-stepper-v18"><button class="value-slider-step-v18" type="button" data-step-dir="-1" aria-label="Decrease ${escapedLabel}" title="Decrease ${escapedLabel}">&lt;</button><input class="value-slider-readout-v18" type="number" inputmode="decimal" aria-label="${escapedLabel} exact value"><button class="value-slider-step-v18" type="button" data-step-dir="1" aria-label="Increase ${escapedLabel}" title="Increase ${escapedLabel}">&gt;</button></div>`;
    const range = control.querySelector('.value-slider-range-v18');
    const readoutInput = control.querySelector('.value-slider-readout-v18');
    const stepButtons = control.querySelectorAll('.value-slider-step-v18');
    input.classList.add('value-slider-source-v18');
    input.setAttribute('aria-hidden', 'true');
    input.tabIndex = -1;
    readoutInput?.addEventListener('focus', () => { readoutInput.type = 'text'; readoutInput.inputMode = 'decimal'; readoutInput.dataset.userTyping = 'true'; delete readoutInput.dataset.lastCommitted; });
    range.addEventListener('input', () => { setInputValue(input, range.value, { live: true, commit: false }); syncSlider(input); });
    range.addEventListener('change', () => { setInputValue(input, range.value, { live: false, commit: true }); syncSlider(input); });
    range.addEventListener('contextmenu', (event) => showResetMenu(event, input));
    readoutInput?.addEventListener('input', () => {
      if (!isCompleteNumericText(readoutInput.value)) return;
      readoutInput.dataset.userTyping = 'true';
      const typedValue = readoutInput.value;
      const cfgNow = configFor(input);
      setInputValue(input, String(clamp(Number(typedValue), cfgNow.min, cfgNow.max)), { live: true, commit: false });
      syncSlider(input);
      if (document.activeElement === readoutInput) readoutInput.value = typedValue;
    });
    readoutInput?.addEventListener('change', () => commitReadout(input, readoutInput));
    readoutInput?.addEventListener('blur', () => commitReadout(input, readoutInput));
    readoutInput?.addEventListener('keydown', (event) => { if (event.key === 'Enter') { commitReadout(input, readoutInput); readoutInput.blur(); } });
    stepButtons.forEach((button) => button.addEventListener('click', (event) => {
      const cfgNow = configFor(input);
      const next = snap(Number(input.value || 0) + Number(button.dataset.stepDir || 1) * Number(cfgNow.step || 1), cfgNow);
      setInputValue(input, formatValue(next, cfgNow.step), { live: true, commit: true });
      syncSlider(input);
      event.preventDefault();
      event.stopPropagation();
    }));
    input.addEventListener('input', () => syncSlider(input));
    input.addEventListener('change', () => syncSlider(input));
    field.appendChild(control);
    syncSlider(input);
  }
  function decorateAll() {
    document.querySelectorAll(NUMERIC_SELECTORS).forEach((input) => { decorate(input); if (input?.dataset.v18ValueSlider === 'true') { rememberBaseline(input); syncSlider(input); } });
  }
  document.addEventListener('click', (event) => { if (!event.target.closest?.('.value-slider-field-v18')) closeOtherSliders(null); if (!event.target.closest?.('.value-slider-reset-menu-v18')) closeResetMenu(); }, true);
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeOtherSliders(null); closeResetMenu(); } }, true);
  window.addEventListener('load', decorateAll);
  document.addEventListener('click', decorateAll, true);
  document.addEventListener('input', (event) => { if (!event.target.closest?.('.value-slider-control-v18')) requestAnimationFrame(decorateAll); }, true);
  document.addEventListener('change', (event) => { if (!event.target.closest?.('.value-slider-control-v18')) requestAnimationFrame(decorateAll); }, true);
  document.addEventListener('pointerup', decorateAll, true);
  decorateAll();
})();
