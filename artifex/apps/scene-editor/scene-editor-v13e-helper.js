(() => {
  const VERSION = 'v0.13f';
  const ASSET_MANIFEST = '../../assets-library/asset-library.json';
  let queued = false;
  let dragHandleActive = false;
  let assetManifest = null;
  let assetManifestLoading = null;

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = `${VERSION}: ${message}`;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
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

  function dispatchInput(input) {
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function syncDragToCentre(event, notify = false) {
    if (!dragHandleActive) return;
    const stage = document.getElementById('stage');
    const x = document.getElementById('itemX');
    const y = document.getElementById('itemY');
    const w = document.getElementById('itemW');
    const h = document.getElementById('itemH');
    if (!stage || !x || !y || !w || !h) return;

    const rect = stage.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const pointerX = ((event.clientX - rect.left) / rect.width) * 100;
    const pointerY = ((event.clientY - rect.top) / rect.height) * 100;
    const width = Number(w.value || 0);
    const height = Number(h.value || 0);
    const nextX = clamp(pointerX - width / 2, 0, 100);
    const nextY = clamp(pointerY - height / 2, 0, 100);
    x.value = nextX;
    y.value = nextY;

    const selected = document.querySelector('.scene-item.is-selected');
    if (selected) {
      selected.style.left = `${nextX}%`;
      selected.style.top = `${nextY}%`;
    }

    if (notify) {
      dispatchInput(x);
      dispatchInput(y);
    }
  }

  function wireCentreHandleDrag() {
    if (document.body.dataset.v13fCentreDrag === 'true') return;
    document.body.dataset.v13fCentreDrag = 'true';

    document.addEventListener('pointerdown', (event) => {
      const handle = event.target.closest?.('.move-handle');
      if (!handle) return;
      dragHandleActive = true;
      document.body.classList.add('v13e-centre-dragging');
    }, true);

    document.addEventListener('pointermove', (event) => {
      if (!dragHandleActive) return;
      syncDragToCentre(event, false);
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    document.addEventListener('pointerup', (event) => {
      if (!dragHandleActive) return;
      syncDragToCentre(event, true);
      dragHandleActive = false;
      document.body.classList.remove('v13e-centre-dragging');
      queue();
    }, true);
  }

  function buildCard(id, title) {
    const section = document.createElement('section');
    section.className = 'panel-card card-selected v13f-synthetic-card';
    section.dataset.cardId = id;
    section.innerHTML = `<h2><span>${esc(title)}</span><button class="card-toggle" type="button">↕</button></h2><div class="card-body"></div>`;
    section.querySelector('.card-toggle')?.addEventListener('click', () => section.classList.toggle('is-collapsed'));
    return section;
  }

  function makeVisualBody() {
    const wrap = document.createElement('div');
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

  function ensureRotatePlaceholder() {
    let rotate = document.querySelector('.rotate-placeholder-v13e');
    if (rotate) return rotate;
    rotate = document.createElement('div');
    rotate.className = 'card-layout-group card-layout-2 rotate-placeholder-v13e';
    rotate.innerHTML = `${fieldMarkup('Rotate', '0°')}${fieldMarkup('Rotation Origin', 'centre')}`;
    return rotate;
  }

  function splitSelectedCards() {
    const selected = document.querySelector('[data-card-id="selected"]');
    const body = selected?.querySelector('.card-body');
    if (!selected || !body) return;
    const objectId = document.getElementById('itemId')?.value || '';
    if (selected.dataset.v13fSplit === objectId && document.querySelector('[data-card-id="transform-v13f"]')) return;

    document.querySelectorAll('.v13f-synthetic-card').forEach((node) => node.remove());

    const title = selected.querySelector('h2 span');
    if (title) title.textContent = 'Object Details';

    const identity = body.querySelector('.selected-identity-group');
    const table = body.querySelector('.selected-metric-table-v13c');
    const tags = body.querySelector('.selected-tags-group');
    const tools = body.querySelector('.selected-tools-layout-group');
    if (!identity || !table) return;

    const transform = buildCard('transform-v13f', 'Transform');
    const transformBody = transform.querySelector('.card-body');
    transformBody.appendChild(table);
    transformBody.appendChild(ensureRotatePlaceholder());
    if (tags) transformBody.appendChild(tags);
    if (tools) transformBody.appendChild(tools);

    const visual = buildCard('visual-v13f', 'Visual Adjustments');
    visual.querySelector('.card-body').appendChild(makeVisualBody());

    const animation = buildCard('animation-v13f', 'Animation');
    animation.querySelector('.card-body').appendChild(makeAnimationBody());

    const audio = buildCard('audio-v13f', 'Audio');
    audio.querySelector('.card-body').appendChild(makeAudioBody());

    body.innerHTML = '';
    body.appendChild(identity);
    selected.after(transform, visual, animation, audio);
    selected.dataset.v13fSplit = objectId;
  }

  async function loadAssetManifest() {
    if (assetManifest) return assetManifest;
    if (!assetManifestLoading) {
      assetManifestLoading = fetch(`${ASSET_MANIFEST}?v=${Date.now()}`, { cache: 'no-store' })
        .then((response) => response.ok ? response.json() : null)
        .then((json) => { assetManifest = json; return json; })
        .catch(() => null)
        .finally(() => { assetManifestLoading = null; });
    }
    return assetManifestLoading;
  }

  function classifyAsset(asset) {
    const text = [asset?.id, asset?.name, asset?.category, asset?.type, asset?.format, asset?.recommendedUse, asset?.path, ...(asset?.tags || [])].join(' ').toLowerCase();
    const cats = new Set(['all']);
    if (/mel|guy|person|people|npc|character|player|creature|animal|bat|bird|foe|enemy/.test(text)) cats.add('characters');
    if (/bat|bird|animal|creature|foe|enemy/.test(text)) cats.add('animals');
    if (/cave|rock|log|tree|forest|environment|background|fg|bg|door|exit|path|wall|ground|water/.test(text)) cats.add('environment');
    if (/door|exit|gate|portal|entrance/.test(text)) cats.add('doors-exits');
    if (/effect|fx|vfx|magic|fire|spark|smoke|glitter|burst|portal|twinkle|explosion|overlay|flame|ring/.test(text)) cats.add('effects');
    if (/ui|button|panel|hud|heart|icon/.test(text)) cats.add('ui');
    if (/background|bg|sky|mountain|scene/.test(text)) cats.add('backgrounds');
    if (/pickup|item|gem|crystal|diamond|prism|orb|heart|treasure|relic/.test(text)) cats.add('pickups');
    if (!['characters','animals','environment','doors-exits','effects','ui','backgrounds','pickups'].some((cat) => cats.has(cat))) cats.add('objects');
    return cats;
  }

  function applyGameCategoryFilter(popup) {
    const select = popup.querySelector('#assetGameCategory');
    const manifest = assetManifest;
    if (!select || !manifest) return;
    const wanted = select.value || 'all';
    popup.querySelectorAll('.asset-card-btn[data-asset-id]').forEach((card) => {
      const asset = (manifest.assets || []).find((item) => item.id === card.dataset.assetId);
      card.classList.toggle('asset-game-filter-hidden', !(wanted === 'all' || classifyAsset(asset).has(wanted)));
    });
  }

  function patchAssetBrowser() {
    const popup = document.querySelector('.asset-picker-popup');
    if (!popup) return;
    const close = popup.querySelector('[data-close]');
    if (close) { close.textContent = '✖'; close.title = 'Close'; close.classList.add('asset-icon-button'); }
    const clear = popup.querySelector('#assetClear');
    if (clear) { clear.textContent = '🧹'; clear.title = 'Clear filters'; clear.classList.add('asset-icon-button'); }
    const reload = popup.querySelector('#assetReload');
    if (reload) { reload.textContent = '🔄'; reload.title = 'Reload asset manifest'; reload.classList.add('asset-icon-button'); }

    const search = popup.querySelector('#assetSearch');
    if (search && !popup.querySelector('#assetGameCategory')) {
      const select = document.createElement('select');
      select.id = 'assetGameCategory';
      select.title = 'Game category';
      select.innerHTML = '<option value="all">all categories</option><option value="characters">characters + animals</option><option value="objects">objects</option><option value="environment">environment</option><option value="doors-exits">doors / exits</option><option value="effects">effects</option><option value="pickups">pickups / relics</option><option value="backgrounds">backgrounds</option><option value="ui">ui</option>';
      search.after(select);
      select.addEventListener('input', () => applyGameCategoryFilter(popup));
      select.addEventListener('change', () => applyGameCategoryFilter(popup));
    }

    if (popup.dataset.v13eAssetFilter !== 'true') {
      popup.dataset.v13eAssetFilter = 'true';
      popup.addEventListener('input', () => setTimeout(() => applyGameCategoryFilter(popup), 0), true);
      popup.addEventListener('change', () => setTimeout(() => applyGameCategoryFilter(popup), 0), true);
      popup.addEventListener('click', (event) => {
        if (event.target.closest('#assetClear')) setTimeout(() => { const select = popup.querySelector('#assetGameCategory'); if (select) select.value = 'all'; applyGameCategoryFilter(popup); }, 0);
        if (event.target.closest('#assetReload')) setTimeout(() => loadAssetManifest().then(() => applyGameCategoryFilter(popup)), 150);
      }, true);
    }
    loadAssetManifest().then(() => applyGameCategoryFilter(popup));
  }

  function patch() {
    queued = false;
    wireCentreHandleDrag();
    splitSelectedCards();
    patchAssetBrowser();
  }

  function queue() {
    if (queued || dragHandleActive) return;
    queued = true;
    requestAnimationFrame(() => requestAnimationFrame(patch));
  }

  window.addEventListener('load', () => { patch(); toast('Selected object cards and centre-drag cleanup loaded'); });
  document.addEventListener('click', queue, true);
  document.addEventListener('input', queue, true);
  document.addEventListener('change', queue, true);
  document.addEventListener('pointerup', queue, true);
  setInterval(queue, 900);
  patch();
})();
