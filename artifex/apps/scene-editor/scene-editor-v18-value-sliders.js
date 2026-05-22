(() => {
  'use strict';

  const NUMERIC_SELECTORS = '.side-panel input[type="number"]';
  const ignoredIds = new Set([]);

  function configFor(input) {
    const id = input.id || '';
    const label = input.closest('.field')?.querySelector('label')?.textContent || '';
    const name = `${id} ${label}`.toLowerCase();
    const current = Number(input.value || 0);

    if (id === 'itemRotation' || name.includes('rotate')) return { min: -180, max: 180, step: 1 };
    if (id === 'itemSkewX' || id === 'itemSkewY' || name.includes('skew')) return { min: -60, max: 60, step: 1 };
    if (id === 'itemZ' || name.includes('depth')) return { min: -20, max: 20, step: 1 };
    if (id === 'itemLayer' || id === 'layerPill' || name.includes('layer')) return { min: 0, max: 100, step: 1 };
    if (id === 'gridCols' || id === 'gridRows' || name.includes('grid')) return { min: 1, max: 64, step: 1 };
    if (id === 'itemW' || id === 'itemH' || name.includes('width') || name.includes('height')) return { min: 1, max: 200, step: 0.25 };
    if (id === 'itemX' || id === 'itemY' || name.includes('axis')) return { min: -100, max: 200, step: 0.25 };

    const explicitMin = input.getAttribute('min');
    const explicitMax = input.getAttribute('max');
    const explicitStep = input.getAttribute('step');
    return {
      min: explicitMin !== null ? Number(explicitMin) : Math.min(0, current - 50),
      max: explicitMax !== null ? Number(explicitMax) : Math.max(100, current + 50),
      step: explicitStep !== null && explicitStep !== 'any' ? Number(explicitStep) : 1
    };
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

  function snap(value, cfg) {
    const step = Number(cfg.step || 1);
    const snapped = Math.round((Number(value) - cfg.min) / step) * step + cfg.min;
    return clamp(Number(formatValue(snapped, step)), cfg.min, cfg.max);
  }

  function closeOtherSliders(except) {
    document.querySelectorAll('.value-slider-popover-v18.is-open').forEach((node) => {
      if (node !== except) node.classList.remove('is-open');
    });
    document.querySelectorAll('.value-slider-dot-v18.is-open').forEach((node) => {
      if (!except || !node.closest('.value-slider-field-v18')?.contains(except)) node.classList.remove('is-open');
    });
  }

  function setInputValue(input, value) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function syncSlider(input) {
    const field = input.closest('.value-slider-field-v18');
    const track = field?.querySelector('.value-slider-track-v18');
    const fill = field?.querySelector('.value-slider-fill-v18');
    const thumb = field?.querySelector('.value-slider-thumb-v18');
    const readout = field?.querySelector('.value-slider-readout-v18');
    if (!track || !fill || !thumb) return;
    const cfg = configFor(input);
    const value = clamp(Number(input.value || 0), cfg.min, cfg.max);
    const percent = cfg.max === cfg.min ? 0 : ((value - cfg.min) / (cfg.max - cfg.min)) * 100;
    fill.style.height = `${percent}%`;
    thumb.style.bottom = `${percent}%`;
    track.setAttribute('aria-valuemin', String(cfg.min));
    track.setAttribute('aria-valuemax', String(cfg.max));
    track.setAttribute('aria-valuenow', String(value));
    if (readout) readout.textContent = input.value || '0';
  }

  function valueFromPointer(track, clientY, cfg) {
    const rect = track.getBoundingClientRect();
    if (!rect.height) return cfg.min;
    const ratio = clamp((rect.bottom - clientY) / rect.height, 0, 1);
    return snap(cfg.min + ratio * (cfg.max - cfg.min), cfg);
  }

  function startCustomDrag(event, input, track) {
    const cfg = configFor(input);
    const apply = (clientY) => {
      const value = valueFromPointer(track, clientY, cfg);
      setInputValue(input, formatValue(value, cfg.step));
      syncSlider(input);
    };
    apply(event.clientY);
    const move = (moveEvent) => {
      apply(moveEvent.clientY);
      moveEvent.preventDefault();
      moveEvent.stopPropagation();
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
  }

  function decorate(input) {
    if (!input || ignoredIds.has(input.id) || input.dataset.v18ValueSlider === 'true') return;
    const field = input.closest('.field');
    if (!field) return;
    input.dataset.v18ValueSlider = 'true';
    field.classList.add('value-slider-field-v18');

    const cfg = configFor(input);
    input.setAttribute('step', String(cfg.step));
    input.setAttribute('min', String(cfg.min));
    input.setAttribute('max', String(cfg.max));

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'value-slider-dot-v18';
    dot.title = 'Open value slider';
    dot.setAttribute('aria-label', 'Open value slider');

    const popover = document.createElement('div');
    popover.className = 'value-slider-popover-v18';
    popover.innerHTML = '<div class="value-slider-track-v18" role="slider" tabindex="0"><span class="value-slider-fill-v18"></span><span class="value-slider-thumb-v18"></span></div><span class="value-slider-readout-v18"></span>';

    const track = popover.querySelector('.value-slider-track-v18');

    dot.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = !popover.classList.contains('is-open');
      closeOtherSliders(popover);
      popover.classList.toggle('is-open', willOpen);
      dot.classList.toggle('is-open', willOpen);
      syncSlider(input);
    });

    popover.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
    }, true);

    track.addEventListener('pointerdown', (event) => startCustomDrag(event, input, track), true);
    track.addEventListener('keydown', (event) => {
      const cfgNow = configFor(input);
      const step = Number(cfgNow.step || 1);
      let value = Number(input.value || 0);
      if (event.key === 'ArrowUp' || event.key === 'ArrowRight') value += step;
      else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') value -= step;
      else if (event.key === 'Home') value = cfgNow.min;
      else if (event.key === 'End') value = cfgNow.max;
      else return;
      setInputValue(input, formatValue(snap(value, cfgNow), cfgNow.step));
      syncSlider(input);
      event.preventDefault();
      event.stopPropagation();
    });

    input.addEventListener('input', () => syncSlider(input));
    input.addEventListener('change', () => syncSlider(input));

    field.appendChild(dot);
    field.appendChild(popover);
    syncSlider(input);
  }

  function decorateAll() {
    document.querySelectorAll(NUMERIC_SELECTORS).forEach((input) => {
      decorate(input);
      if (input?.dataset.v18ValueSlider === 'true') syncSlider(input);
    });
  }

  document.addEventListener('click', (event) => {
    if (!event.target.closest?.('.value-slider-field-v18')) closeOtherSliders(null);
  }, true);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeOtherSliders(null);
  }, true);

  window.addEventListener('load', decorateAll);
  document.addEventListener('click', decorateAll, true);
  document.addEventListener('input', decorateAll, true);
  document.addEventListener('change', decorateAll, true);
  document.addEventListener('pointerup', decorateAll, true);
  setInterval(decorateAll, 900);
  decorateAll();
})();
