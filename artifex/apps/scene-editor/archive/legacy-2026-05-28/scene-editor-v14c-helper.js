(() => {
  const VERSION = 'v0.14c';
  let scheduled = false;
  let applying = false;

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = `${VERSION}: ${message}`;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  function field(id) {
    return document.getElementById(id)?.closest('.field') || null;
  }

  function hideFieldLabel(node) {
    node?.querySelector(':scope > label')?.classList.add('metric-internal-label-hidden');
    return node;
  }

  function dispatchInput(input) {
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function iconButton(className, text, title) {
    const node = document.createElement('button');
    node.type = 'button';
    node.className = `${className} metric-icon-button`;
    node.textContent = text;
    node.title = title;
    return node;
  }

  function wireScale(node, delta) {
    node.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const w = document.getElementById('itemW');
      const h = document.getElementById('itemH');
      if (!w || !h) return;
      w.value = Math.max(1, Number(w.value || 0) + delta);
      h.value = Math.max(1, Number(h.value || 0) + delta);
      dispatchInput(w);
      dispatchInput(h);
    });
  }

  function wireWrap(node) {
    node.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const w = document.getElementById('itemW');
      const h = document.getElementById('itemH');
      const path = document.getElementById('itemImage')?.value || document.querySelector('.scene-item.is-selected img')?.src || '';
      if (!w || !h || !path) return;
      const img = new Image();
      img.onload = () => {
        const ratio = img.naturalWidth / img.naturalHeight;
        if (!ratio || !Number.isFinite(ratio)) return;
        if (ratio >= 1) h.value = Math.max(1, +(Number(w.value || 1) / ratio).toFixed(3));
        else w.value = Math.max(1, +(Number(h.value || 1) * ratio).toFixed(3));
        dispatchInput(w);
        dispatchInput(h);
      };
      img.src = path;
    });
  }

  function label(text, extra = '') {
    const node = document.createElement('div');
    node.className = `metric-label-cell ${extra}`.trim();
    node.textContent = text || '';
    return node;
  }

  function value(node, extra = '') {
    const wrap = document.createElement('div');
    wrap.className = `metric-value-cell ${extra}`.trim();
    if (node) wrap.appendChild(node);
    return wrap;
  }

  function iconRow(...nodes) {
    const row = document.createElement('div');
    row.className = 'metric-icon-row';
    nodes.filter(Boolean).forEach((node) => row.appendChild(node));
    return row;
  }

  function buildMetricTable() {
    const x = hideFieldLabel(field('itemX'));
    const y = hideFieldLabel(field('itemY'));
    const z = hideFieldLabel(field('itemZ'));
    const height = hideFieldLabel(field('itemH'));
    const width = hideFieldLabel(field('itemW'));
    const layer = hideFieldLabel(field('itemLayer'));
    if (!x || !y || !z || !height || !width || !layer) return null;

    const up = iconButton('scale-step-btn scale-up-btn', '↑', 'Scale width and height up by 2');
    const down = iconButton('scale-step-btn scale-down-btn', '↓', 'Scale width and height down by 2');
    const wrap = iconButton('wrap-image-btn', '◺', 'Wrap image to aspect ratio');
    wireScale(up, 2);
    wireScale(down, -2);
    wireWrap(wrap);

    const table = document.createElement('div');
    table.className = 'selected-metric-table-v13c selected-metric-table-v13d';
    table.append(
      label('X Axis'), label('Scale', 'metric-label-center'), label('Height'),
      value(x), value(iconRow(up, down), 'metric-icon-value'), value(height),
      label('Y Axis'), label('', 'metric-label-center'), label('Width'),
      value(y), value(iconRow(wrap), 'metric-icon-value'), value(width),
      label('Z / Depth'), label('', 'metric-label-center'), label('Layer'),
      value(z), value(null, 'metric-blank-value'), value(layer)
    );
    return table;
  }

  function fieldMarkup(label, value = '', kind = 'input', options = []) {
    const control = kind === 'select'
      ? `<select disabled>${options.map((option) => `<option>${esc(option)}</option>`).join('')}</select>`
      : `<input disabled value="${esc(value)}">`;
    return `<div class="field visual-placeholder-field"><label>${esc(label)}</label>${control}</div>`;
  }

  function pathPlaceholder(label) {
    return `<div class="field visual-placeholder-field path-field"><label>${esc(label)}</label><div class="path-row"><input disabled value="none"><button type="button" class="path-menu-toggle v13f-disabled-picker" disabled title="Future file picker">📁</button></div></div>`;
  }

  function ensureCard(id, title, afterNode) {
    let card = document.querySelector(`[data-card-id="${id}"]`);
    if (!card) {
      card = document.createElement('section');
      card.className = 'panel-card card-selected v13f-synthetic-card';
      card.dataset.cardId = id;
      card.innerHTML = `<h2><span>${esc(title)}</span><button class="card-toggle" type="button">↕</button></h2><div class="card-body"></div>`;
      card.querySelector('.card-toggle')?.addEventListener('click', () => card.classList.toggle('is-collapsed'));
    }
    if (afterNode?.nextSibling !== card) afterNode.after(card);
    const span = card.querySelector('h2 span');
    if (span) span.textContent = title;
    return card;
  }

  function makeVisualBody() {
    const wrap = document.createElement('div');
    wrap.className = 'v14b-card-content visual-card-content-v14b';
    wrap.innerHTML = `
      <p class="card-layout-note">Image adjustment, colour adjustment, blend, transparency, glow, shadow, and future filter controls.</p>
      <div class="card-layout-group card-layout-2 visual-effects-placeholder-group v13e-adjustment-grid">
        ${fieldMarkup('Blend Mode', '', 'select', ['normal', 'screen', 'multiply', 'lighter', 'darken', 'overlay', 'color-dodge', 'color-burn'])}
        ${fieldMarkup('Opacity', '100%')}
        ${fieldMarkup('Brightness', '100%')}
        ${fieldMarkup('Contrast', '100%')}
        ${fieldMarkup('Saturation', '100%')}
        ${fieldMarkup('Hue', '0°')}
        ${fieldMarkup('Temperature / Tint', 'neutral')}
        ${fieldMarkup('Vibrance', '0')}
        ${fieldMarkup('Monochrome', 'off')}
        ${fieldMarkup('Transparent Colour', '#000000')}
        ${fieldMarkup('Threshold', 'off')}
        ${fieldMarkup('Threshold Alpha', 'off')}
        ${fieldMarkup('Exposure', '0')}
        ${fieldMarkup('Highlights / Shadows', 'default')}
        ${fieldMarkup('Levels', 'default')}
        ${fieldMarkup('Curves', 'default')}
        ${fieldMarkup('Drop Shadow', 'off')}
        ${fieldMarkup('Shadow Strength', '0')}
        ${fieldMarkup('Outer Glow', 'off')}
        ${fieldMarkup('Glow Strength', '0')}
        ${fieldMarkup('Vignette', 'off')}
        ${fieldMarkup('Vignette Strength', '0')}
      </div>`;
    return wrap;
  }

  function makeAnimationBody() {
    const wrap = document.createElement('div');
    wrap.className = 'v14b-card-content animation-card-content-v14b';
    wrap.innerHTML = `
      <p class="card-layout-note">Future object-linked animation controls and frame-browser entry point.</p>
      <div class="card-layout-group card-layout-2 v13e-adjustment-grid">
        ${pathPlaceholder('Animation File')}
        ${fieldMarkup('Animation Set', 'none')}
        ${fieldMarkup('Frame Source', 'none')}
        ${fieldMarkup('FPS', '12')}
        ${fieldMarkup('Loop Mode', '', 'select', ['loop', 'once', 'ping-pong', 'hold last'])}
        ${fieldMarkup('Start Frame', '0')}
        ${fieldMarkup('Frame Count', '0')}
      </div>`;
    return wrap;
  }

  function makeAudioBody() {
    const wrap = document.createElement('div');
    wrap.className = 'v14b-card-content audio-card-content-v14b';
    wrap.innerHTML = `
      <p class="card-layout-note">Future object-linked dialogue, movement, interaction, and sound-effect controls.</p>
      <div class="card-layout-group card-layout-2 v13e-adjustment-grid">
        ${pathPlaceholder('Audio File')}
        ${fieldMarkup('Dialogue Sound', 'none')}
        ${fieldMarkup('Interact Sound', 'none')}
        ${fieldMarkup('Movement Sound', 'none')}
        ${fieldMarkup('Jump Sound', 'none')}
        ${fieldMarkup('Ambient Loop', 'none')}
        ${fieldMarkup('Volume', '100%')}
      </div>`;
    return wrap;
  }

  function makeRotateBlock() {
    const rotate = document.createElement('div');
    rotate.className = 'card-layout-group card-layout-2 rotate-placeholder-v13e';
    rotate.innerHTML = `${fieldMarkup('Rotate', '0°')}${fieldMarkup('Rotation Origin', 'centre')}`;
    return rotate;
  }

  function enforceSelectedCards() {
    const selected = document.querySelector('[data-card-id="selected"]');
    const body = selected?.querySelector('.card-body');
    if (!selected || !body || !document.getElementById('itemId')) return;

    const title = selected.querySelector('h2 span');
    if (title) title.textContent = 'Object Details';

    const identity = body.querySelector('.selected-identity-group') || document.querySelector('.selected-identity-group');
    if (!identity) return;

    let table = document.querySelector('.selected-metric-table-v13c');
    if (!table) table = buildMetricTable();
    if (!table) return;

    let tags = document.querySelector('.selected-tags-group');
    if (!tags) {
      const tagField = field('itemTags');
      if (tagField) {
        tags = document.createElement('div');
        tags.className = 'card-layout-group card-layout-1 selected-tags-group';
        const cell = document.createElement('div');
        cell.className = 'card-layout-cell';
        cell.appendChild(tagField);
        tags.appendChild(cell);
      }
    }

    let tools = document.querySelector('.selected-tools-layout-group');
    if (!tools) {
      const row = document.querySelector('.selected-bottom-tools') || document.createElement('div');
      row.className = 'selected-bottom-tools';
      const deleteBtn = document.getElementById('deleteItem')?.closest('.button-row') || document.getElementById('deleteItem');
      const visible = document.getElementById('itemVisible')?.closest('.check-row');
      const border = document.getElementById('itemBorderVisible')?.closest('label') || document.querySelector('.border-toggle-row');
      [deleteBtn, visible, border].filter(Boolean).forEach((node) => row.appendChild(node));
      tools = document.createElement('div');
      tools.className = 'card-layout-group card-layout-1 selected-tools-layout-group';
      const c = document.createElement('div');
      c.className = 'card-layout-cell cell-inline';
      c.appendChild(row);
      tools.appendChild(c);
    }

    const transform = ensureCard('transform-v13f', 'Transform', selected);
    const visual = ensureCard('visual-v13f', 'Visual Adjustments', transform);
    const animation = ensureCard('animation-v13f', 'Animation', visual);
    const audio = ensureCard('audio-v13f', 'Audio', animation);

    transform.querySelector('.card-body').replaceChildren(table, makeRotateBlock());
    if (tags) transform.querySelector('.card-body').appendChild(tags);
    if (tools) transform.querySelector('.card-body').appendChild(tools);
    visual.querySelector('.card-body').replaceChildren(makeVisualBody());
    animation.querySelector('.card-body').replaceChildren(makeAnimationBody());
    audio.querySelector('.card-body').replaceChildren(makeAudioBody());
    body.replaceChildren(identity);
  }

  function cleanLayerStack() {
    document.querySelectorAll('.layer-stack-table-v14 .layer-stack-row').forEach((wrapper, index) => {
      wrapper.dataset.slot = String(index + 1);
      const slot = wrapper.querySelector('.layer-slot-number');
      if (slot) slot.textContent = String(index + 1);

      const row = wrapper.querySelector('.item-row[data-select-id]');
      if (row) {
        row.querySelectorAll('.element-lock-toggle').forEach((node) => node.remove());
        row.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) node.textContent = node.textContent.replace(/[🔓🔒]/g, '').replace(/\s{2,}/g, ' ');
        });
        row.textContent = row.textContent.replace(/[🔓🔒]/g, '').replace(/\s{2,}/g, ' ').trim();
      }

      const buttons = Array.from(wrapper.querySelectorAll(':scope > .layer-lock-btn'));
      buttons.slice(1).forEach((button) => button.remove());
    });
  }

  function enforce() {
    if (applying) return;
    applying = true;
    try {
      enforceSelectedCards();
      cleanLayerStack();
    } finally {
      applying = false;
    }
  }

  function schedule() {
    if (scheduled || applying) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      enforce();
    });
  }

  const observer = new MutationObserver(schedule);
  window.addEventListener('load', () => {
    const app = document.getElementById('editor-app') || document.body;
    observer.observe(app, { childList: true, subtree: true, characterData: true });
    enforce();
    toast('Card split and lock pollution guard loaded');
  });
  document.addEventListener('click', schedule, true);
  document.addEventListener('change', schedule, true);
  document.addEventListener('input', schedule, true);
  setInterval(enforce, 300);
  enforce();
})();
