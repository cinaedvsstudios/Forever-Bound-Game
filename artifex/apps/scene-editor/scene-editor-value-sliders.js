(() => {
  'use strict';

  const NUMERIC_SELECTORS = '.side-panel input[type="number"]';
  const ignoredIds = new Set([]);
  const baselineValues = new Map();
  let resetMenu = null;

  function core() {
    return window.ArtifexSceneEditorCore || null;
  }

  function selectedNode() {
    const id = core()?.getSelectedId?.();
    if (!id) return document.querySelector('.scene-item.is-selected');
    return Array.from(document.querySelectorAll('.scene-item[data-stage-id]')).find((node) => node.dataset.stageId === id) || document.querySelector('.scene-item.is-selected');
  }

  function baselineKeyFor(input) {
    const id = input.id || '';
    const editor = core();
    const selected = editor?.getSelectedItem?.();
    if (id.startsWith('item') || id === 'layerPill') return `${selected?.id || 'selected'}:${id}`;
    return `global:${id}`;
  }

  function rememberBaseline(input) {
    const key = baselineKeyFor(input);
    if (!baselineValues.has(key)) baselineValues.set(key, input.value || '0');
  }

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
    if (id.includes('Hue') || id.includes('Vibrance') || id.includes('Exposure') || id.includes('ShadowStrength') || id.includes('ShadowBlur') || id.includes('GlowStrength')) return { min: id.includes('Hue') ? -180 : id.includes('Vibrance') || id.includes('Exposure') ? -100 : 0, max: id.includes('Hue') ? 180 : 100, step: 1, reset: 0 };

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
    if (cfg.baselineReset) {
      const stored = baselineValues.get(baselineKeyFor(input));
      return stored !== undefined ? stored : input.value || 0;
    }
    return cfg.reset;
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value || 0)));
  }

  function decimalsFor(step) {
    const text = String(step);
    return text.includes('.') ? text.split('.')[1].length : 0;
  }

  function formatValue(value, step) {
    const decimals = Math.max(0, Math.min(4, decimalsFor(step)));
    return Number(value).toFixed(decimals).replace(/\.0+$/, '').replace(/(\.\d*?)0+$/, '$1');
  }


  function escAttr(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function labelFor(input) {
    return input.closest('.field')?.querySelector('label')?.textContent?.trim() || input.id || 'Value';
  }

  function snap(value, cfg) {
    const step = Number(cfg.step || 1);
    const snapped = Math.round((Number(value) - cfg.min) / step) * step + cfg.min;
    return clamp(Number(formatValue(snapped, step)), cfg.min, cfg.max);
  }

  function closeResetMenu() {
    resetMenu?.remove();
    resetMenu = null;
  }

  function closeOtherSliders(except) {
    document.querySelectorAll('.value-slider-popover-v18.is-open').forEach((node) => {
      if (node !== except) node.classList.remove('is-open');
    });
    document.querySelectorAll('.value-slider-dot-v18.is-open').forEach((node) => {
      if (!except || !node.closest('.value-slider-field-v18')?.contains(except)) node.classList.remove('is-open');
    });
  }

  function applyTransformDirect(input, value) {
    const id = input.id || '';
    if (!['itemX', 'itemY', 'itemW', 'itemH', 'itemLayer', 'layerPill', 'itemZ', 'itemRotation', 'itemSkewX', 'itemSkewY'].includes(id)) return;
    const editor = core();
    const item = editor?.getSelectedItem?.();
    if (!item) return;
    const node = selectedNode();
    const numeric = Number(value || 0);

    if (id === 'itemX') {
      item.x = numeric;
      if (node) node.style.left = `${numeric}%`;
    } else if (id === 'itemY') {
      item.y = numeric;
      if (node) node.style.top = `${numeric}%`;
    } else if (id === 'itemW') {
      item.width = numeric;
      if (node) node.style.width = `${numeric}%`;
    } else if (id === 'itemH') {
      item.height = numeric;
      if (node) node.style.height = `${numeric}%`;
    } else if (id === 'itemLayer' || id === 'layerPill') {
      item.layer = numeric;
      item.z = numeric;
      if (node) node.style.zIndex = String(numeric);
      const layer = document.getElementById(id === 'itemLayer' ? 'layerPill' : 'itemLayer');
      if (layer && layer.value !== String(value)) layer.value = value;
    } else if (id === 'itemZ') {
      item.zDepth = numeric;
      const zVal = document.getElementById('zVal');
      if (zVal) zVal.textContent = String(value);
      if (node && !/rotate|skew/i.test(node.style.transform || '')) {
        const scale = clamp(1 + numeric * 0.035, 0.45, 2.15);
        node.style.transform = `scale(${scale})`;
      }
    } else if (id === 'itemRotation') {
      item.rotation = numeric;
    } else if (id === 'itemSkewX') {
      item.skewX = numeric;
    } else if (id === 'itemSkewY') {
      item.skewY = numeric;
    }

    editor?.saveWorkingCopySoon?.('transform slider');
  }

  function setInputValue(input, value) {
    input.value = value;
    applyTransformDirect(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    applyTransformDirect(input, value);
  }

  function resetInput(input) {
    const cfg = configFor(input);
    const raw = resetValueFor(input);
    const value = formatValue(clamp(raw, cfg.min, cfg.max), cfg.step);
    setInputValue(input, value);
    syncSlider(input);
    closeResetMenu();
  }

  function syncSlider(input) {
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
    if (readout) readout.textContent = input.value || '0';
  }

  function valueFromPointer(track, clientX, cfg) {
    const rect = track.getBoundingClientRect();
    if (!rect.width) return cfg.min;
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 1);
    return snap(cfg.min + ratio * (cfg.max - cfg.min), cfg);
  }

  function startCustomDrag(event, input, track) {
    if (event.button === 2) return;
    const cfg = configFor(input);
    const apply = (clientX) => {
      const value = valueFromPointer(track, clientX, cfg);
      setInputValue(input, formatValue(value, cfg.step));
      syncSlider(input);
    };
    apply(event.clientX);
    const move = (moveEvent) => {
      apply(moveEvent.clientX);
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
      moveEvent.stopImmediatePropagation?.();
    };
    const end = () => {
      window.removeEventListener('pointermove', move, true);
      window.removeEventListener('pointerup', end, true);
      window.removeEventListener('pointercancel', end, true);
    };
    window.addEventListener('pointermove', move, true);
    window.addEventListener('pointerup', end, true);
    window.addEventListener('pointercancel', end, true);
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation?.();
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
    if (!input || ignoredIds.has(input.id) || input.dataset.v18ValueSlider === 'true') return;
    const field = input.closest('.field');
    if (!field) return;
    rememberBaseline(input);
    input.dataset.v18ValueSlider = 'true';
    field.classList.add('value-slider-field-v18');

    const cfg = configFor(input);
    input.setAttribute('step', String(cfg.step));
    input.setAttribute('min', String(cfg.min));
    input.setAttribute('max', String(cfg.max));

    const control = document.createElement('div');
    control.className = 'value-slider-control-v18';
    control.innerHTML = `
      <input class="value-slider-range-v18" type="range" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${escAttr(input.value || 0)}" aria-label="${escAttr(labelFor(input))} slider">
      <div class="value-slider-stepper-v18">
        <button class="value-slider-step-v18" type="button" data-step-dir="-1" aria-label="Decrease ${escAttr(labelFor(input))}">&lt;</button>
        <span class="value-slider-readout-v18" aria-live="polite"></span>
        <button class="value-slider-step-v18" type="button" data-step-dir="1" aria-label="Increase ${escAttr(labelFor(input))}">&gt;</button>
      </div>`;

    const range = control.querySelector('.value-slider-range-v18');
    const stepButtons = control.querySelectorAll('.value-slider-step-v18');
    input.classList.add('value-slider-source-v18');
    input.setAttribute('aria-hidden', 'true');
    input.tabIndex = -1;

    range.addEventListener('input', () => {
      setInputValue(input, range.value);
      syncSlider(input);
    });
    range.addEventListener('change', () => {
      setInputValue(input, range.value);
      syncSlider(input);
    });
    range.addEventListener('contextmenu', (event) => showResetMenu(event, input));
    stepButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        const cfgNow = configFor(input);
        const next = snap(Number(input.value || 0) + Number(button.dataset.stepDir || 1) * Number(cfgNow.step || 1), cfgNow);
        setInputValue(input, formatValue(next, cfgNow.step));
        syncSlider(input);
        event.preventDefault();
        event.stopPropagation();
      });
    });

    input.addEventListener('input', () => syncSlider(input));
    input.addEventListener('change', () => syncSlider(input));

    field.appendChild(control);
    syncSlider(input);
  }

  function decorateAll() {
    document.querySelectorAll(NUMERIC_SELECTORS).forEach((input) => {
      decorate(input);
      if (input?.dataset.v18ValueSlider === 'true') {
        rememberBaseline(input);
        syncSlider(input);
      }
    });
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest?.('.value-slider-field-v18')) closeOtherSliders(null);
    if (!event.target.closest?.('.value-slider-reset-menu-v18')) closeResetMenu();
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeOtherSliders(null);
      closeResetMenu();
    }
  }, true);

  window.addEventListener('load', decorateAll);
  document.addEventListener('click', decorateAll, true);
  document.addEventListener('input', decorateAll, true);
  document.addEventListener('change', decorateAll, true);
  document.addEventListener('pointerup', decorateAll, true);
  setInterval(decorateAll, 900);
  decorateAll();
})();
