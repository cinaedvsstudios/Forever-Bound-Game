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
    if (id === 'itemW' || id === 'itemH' || name.includes('width') || name.includes('height')) return { min: 1, max: 100, step: 0.25 };
    if (id === 'itemX' || id === 'itemY' || name.includes('axis')) return { min: 0, max: 100, step: 0.25 };

    const explicitMin = input.getAttribute('min');
    const explicitMax = input.getAttribute('max');
    const explicitStep = input.getAttribute('step');
    return {
      min: explicitMin !== null ? Number(explicitMin) : Math.min(0, current - 50),
      max: explicitMax !== null ? Number(explicitMax) : Math.max(100, current + 50),
      step: explicitStep !== null && explicitStep !== 'any' ? Number(explicitStep) : 1
    };
  }

  function closeOtherSliders(except) {
    document.querySelectorAll('.value-slider-popover-v18.is-open').forEach((node) => {
      if (node !== except) node.classList.remove('is-open');
    });
    document.querySelectorAll('.value-slider-dot-v18.is-open').forEach((node) => {
      if (!except || node !== except.previousElementSibling) node.classList.remove('is-open');
    });
  }

  function setInputValue(input, value) {
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function syncSlider(input) {
    const field = input.closest('.value-slider-field-v18');
    const slider = field?.querySelector('.value-slider-range-v18');
    const readout = field?.querySelector('.value-slider-readout-v18');
    if (!slider) return;
    slider.value = input.value || 0;
    if (readout) readout.textContent = input.value || '0';
  }

  function decorate(input) {
    if (!input || ignoredIds.has(input.id) || input.dataset.v18ValueSlider === 'true') return;
    const field = input.closest('.field');
    if (!field) return;
    input.dataset.v18ValueSlider = 'true';
    field.classList.add('value-slider-field-v18');

    const cfg = configFor(input);
    input.setAttribute('step', String(cfg.step));
    if (!input.hasAttribute('min')) input.setAttribute('min', String(cfg.min));
    if (!input.hasAttribute('max')) input.setAttribute('max', String(cfg.max));

    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'value-slider-dot-v18';
    dot.title = 'Open value slider';
    dot.setAttribute('aria-label', 'Open value slider');

    const popover = document.createElement('div');
    popover.className = 'value-slider-popover-v18';
    popover.innerHTML = '<input class="value-slider-range-v18" type="range"><span class="value-slider-readout-v18"></span>';

    const slider = popover.querySelector('.value-slider-range-v18');
    slider.min = String(cfg.min);
    slider.max = String(cfg.max);
    slider.step = String(cfg.step);
    slider.value = input.value || 0;

    dot.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const willOpen = !popover.classList.contains('is-open');
      closeOtherSliders(popover);
      popover.classList.toggle('is-open', willOpen);
      dot.classList.toggle('is-open', willOpen);
      syncSlider(input);
    });

    slider.addEventListener('input', () => {
      setInputValue(input, slider.value);
      syncSlider(input);
    });
    slider.addEventListener('change', () => {
      setInputValue(input, slider.value);
      syncSlider(input);
    });
    input.addEventListener('input', () => syncSlider(input));
    input.addEventListener('change', () => syncSlider(input));

    field.appendChild(dot);
    field.appendChild(popover);
    syncSlider(input);
  }

  function decorateAll() {
    document.querySelectorAll(NUMERIC_SELECTORS).forEach(decorate);
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
