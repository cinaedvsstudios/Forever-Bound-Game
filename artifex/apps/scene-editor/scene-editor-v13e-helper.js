(() => {
  const VERSION = 'v0.13e';
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

  function sectionHeading(text, subtext = '') {
    return `<div class="v13e-section-heading"><h3>${esc(text)}</h3>${subtext ? `<p>${esc(subtext)}</p>` : ''}</div>`;
  }

  function dispatchInput(input) {
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function syncDragToCentre(event) {
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
    x.value = clamp(pointerX - width / 2, 0, 100);
    y.value = clamp(pointerY - height / 2, 0, 100);
    dispatchInput(x);
    dispatchInput(y);
  }

  function wireCentreHandleDrag() {
    if (document.body.dataset.v13eCentreDrag === 'true') return;
    document.body.dataset.v13eCentreDrag = 'true';

    document.addEventListener('pointerdown', (event) => {
      const handle = event.target.closest?.('.move-handle');
      if (!handle) return;
      dragHandleActive = true;
      document.body.classList.add('v13e-centre-dragging');
    }, true);

    document.addEventListener('pointermove', (event) => {
      if (!dragHandleActive) return;
      syncDragToCentre(event);
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);

    document.addEventListener('pointerup', () => {
      if (!dragHandleActive) return;
      dragHandleActive = false;
      document.body.classList.remove('v13e-centre-dragging');
      queue();
    }, true);
  }

  function addTransformHeadingAndRotate() {
    const table = document.querySelector('[data-card-id="selected"] .selected-metric-table-v13c');
    if (!table) return;

    if (!table.previousElementSibling?.classList?.contains('transform-heading-v13e')) {
      const heading = document.createElement('div');
      heading.className = 'v13e-section-heading transform-heading-v13e';
      heading.innerHTML = '<h3>Transform</h3><p>Position, scale, depth, layer, and future rotation controls.</p>';
      table.before(heading);
    }

    if (!table.nextElementSibling?.classList?.contains('rotate-placeholder-v13e')) {
      const rotate = document.createElement('div');
      rotate.className = 'card-layout-group card-layout-2 rotate-placeholder-v13e';
      rotate.innerHTML = `${fieldMarkup('Rotate', '0°')}${fieldMarkup('Rotation Origin', 'centre')}`;
      table.after(rotate);
    }
  }

  function makeVisualAdjustments() {
    const section = document.createElement('div');
    section.className = 'v13e-placeholder-section visual-adjustments-v13e';
    section.innerHTML = `
      ${sectionHeading('Visual Adjustments', 'Image adjustment, colour adjustment, blend, transparency, glow, shadow, and future filter controls.')}
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
      </div>
    `;
    return section;
  }

  function makeAnimationSection() {
    const section = document.createElement('div');
    section.className = 'v13e-placeholder-section animation-placeholder-v13e';
    section.innerHTML = `
      ${sectionHeading('Animation', 'Future object-linked animation controls and frame-browser entry point.')}
      <div class="card-layout-group card-layout-2 v13e-adjustment-grid">
        ${fieldMarkup('Animation Set', 'none')}
        ${fieldMarkup('Frame Source', 'none')}
        ${fieldMarkup('FPS', '12')}
        ${fieldMarkup('Loop Mode', '', 'select', ['loop', 'once', 'ping-pong', 'hold last'])}
        ${fieldMarkup('Start Frame', '0')}
        ${fieldMarkup('Frame Count', '0')}
      </div>
    `;
    return section;
  }

  function makeAudioSection() {
    const section = document.createElement('div');
    section.className = 'v13e-placeholder-section audio-placeholder-v13e';
    section.innerHTML = `
      ${sectionHeading('Audio', 'Future object-linked dialogue, movement, interaction, and sound-effect controls.')}
      <div class="card-layout-group card-layout-2 v13e-adjustment-grid">
        ${fieldMarkup('Dialogue Sound', 'none')}
        ${fieldMarkup('Interact Sound', 'none')}
        ${fieldMarkup('Movement Sound', 'none')}
        ${fieldMarkup('Jump Sound', 'none')}
        ${fieldMarkup('Ambient Loop', 'none')}
        ${fieldMarkup('Volume', '100%')}
      </div>
    `;
    return section;
  }

  function rebuildSelectedPlaceholders() {
    const body = document.querySelector('[data-card-id="selected"] .card-body');
    if (!body) return;
    addTransformHeadingAndRotate();

    const tagGroup = body.querySelector('.selected-tags-group') || document.getElementById('itemTags')?.closest('.card-layout-group');
    const toolsGroup = body.querySelector('.selected-tools-layout-group');
    if (!tagGroup || !toolsGroup) return;

    body.querySelectorAll('.visual-effects-placeholder-group, .visual-adjustments-v13e, .animation-placeholder-v13e, .audio-placeholder-v13e, .v13e-after-tags-divider').forEach((node) => node.remove());

    const divider = document.createElement('div');
    divider.className = 'card-layout-divider v13e-after-tags-divider';
    const visual = makeVisualAdjustments();
    const animation = makeAnimationSection();
    const audio = makeAudioSection();
    toolsGroup.before(divider, visual, animation, audio);
  }

  async function loadAssetManifest() {
    if (assetManifest) return assetManifest;
    if (!assetManifestLoading) {
      assetManifestLoading = fetch(`${ASSET_MANIFEST}?v=${Date.now()}`, { cache: 'no-store' })
        .then((response) => {
          if (!response.ok) throw new Error(`Asset manifest ${response.status}`);
          return response.json();
        })
        .then((json) => {
          assetManifest = json;
          return json;
        })
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
      const visible = wanted === 'all' || classifyAsset(asset).has(wanted);
      card.classList.toggle('asset-game-filter-hidden', !visible);
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
      select.innerHTML = `
        <option value="all">all categories</option>
        <option value="characters">characters + animals</option>
        <option value="objects">objects</option>
        <option value="environment">environment</option>
        <option value="doors-exits">doors / exits</option>
        <option value="effects">effects</option>
        <option value="pickups">pickups / relics</option>
        <option value="backgrounds">backgrounds</option>
        <option value="ui">ui</option>
      `;
      search.after(select);
      select.addEventListener('input', () => applyGameCategoryFilter(popup));
      select.addEventListener('change', () => applyGameCategoryFilter(popup));
    }

    if (popup.dataset.v13eAssetFilter !== 'true') {
      popup.dataset.v13eAssetFilter = 'true';
      popup.addEventListener('input', () => setTimeout(() => applyGameCategoryFilter(popup), 0), true);
      popup.addEventListener('change', () => setTimeout(() => applyGameCategoryFilter(popup), 0), true);
      popup.addEventListener('click', (event) => {
        if (event.target.closest('#assetClear')) {
          setTimeout(() => {
            const select = popup.querySelector('#assetGameCategory');
            if (select) select.value = 'all';
            applyGameCategoryFilter(popup);
          }, 0);
        }
        if (event.target.closest('#assetReload')) setTimeout(() => loadAssetManifest().then(() => applyGameCategoryFilter(popup)), 150);
      }, true);
    }

    loadAssetManifest().then(() => applyGameCategoryFilter(popup));
  }

  function patch() {
    queued = false;
    wireCentreHandleDrag();
    rebuildSelectedPlaceholders();
    patchAssetBrowser();
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => requestAnimationFrame(patch));
  }

  window.addEventListener('load', () => {
    patch();
    toast('Transform, visual, animation, audio, and asset browser polish loaded');
  });
  document.addEventListener('click', queue, true);
  document.addEventListener('input', queue, true);
  document.addEventListener('change', queue, true);
  document.addEventListener('pointerup', queue, true);
  setInterval(queue, 700);
  patch();
})();
