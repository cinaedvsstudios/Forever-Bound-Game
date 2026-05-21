(() => {
  const VERSION = 'v0.11';
  const ASSET_MANIFEST = '../../assets-library/asset-library.json';
  let assetManifest = null;
  let pickerTarget = 'item';
  let patchQueued = false;
  let importWarningBypass = false;
  let dirty = false;

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = `${VERSION}: ${message}`;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2600);
  }

  function setTip(message) {
    const status = document.getElementById('hoverStatus');
    if (status) status.textContent = `${VERSION}: ${message}`;
  }

  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[char]));
  }

  function assetDisplayPath(asset) {
    return `artifex/assets-library/${asset.path}`;
  }

  function assetPreviewPath(asset) {
    return `../../assets-library/${asset.path}`;
  }

  function queuePatch() {
    if (patchQueued) return;
    patchQueued = true;
    requestAnimationFrame(() => requestAnimationFrame(patch));
  }

  function markDirty(reason = 'changed') {
    dirty = true;
    setTip(`Unsaved changes: ${reason}.`);
  }

  function markClean(reason = 'loaded') {
    dirty = false;
    setTip(`Scene ${reason}.`);
  }

  async function loadManifest() {
    if (assetManifest) return assetManifest;
    toast('Loading asset library...');
    const response = await fetch(`${ASSET_MANIFEST}?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error(`Asset manifest ${response.status}`);
    assetManifest = await response.json();
    return assetManifest;
  }

  function addAssetsOptionToPathMenus() {
    document.querySelectorAll('.path-menu').forEach((menu) => {
      const toggle = menu.querySelector('[data-path-menu]');
      const target = toggle?.dataset.pathMenu || 'item';
      const dropdown = menu.querySelector('.path-dropdown');
      if (!dropdown || dropdown.querySelector('[data-assets]')) return;
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.assets = target;
      button.textContent = 'Assets';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        pickerTarget = target;
        showAssetPicker(target);
      });
      dropdown.appendChild(button);
    });
  }

  function assetPreview(asset) {
    const src = esc(assetPreviewPath(asset));
    if (asset.category === 'videos' || asset.format === 'mp4') {
      return `<video src="${src}" muted loop playsinline preload="metadata"></video>`;
    }
    if (asset.category === 'animation-frames') {
      return `<span class="frame-fallback">🎞️</span>`;
    }
    return `<img src="${src}" alt="${esc(asset.name || asset.id)}">`;
  }

  function renderAssetGrid(filterText = '', filterCategory = 'all', filterType = 'all') {
    const grid = document.querySelector('.asset-picker-grid');
    if (!grid || !assetManifest) return;
    const query = filterText.trim().toLowerCase();
    const assets = (assetManifest.assets || []).filter((asset) => {
      const haystack = [asset.id, asset.name, asset.category, asset.type, asset.path, ...(asset.tags || [])].join(' ').toLowerCase();
      const categoryOk = filterCategory === 'all' || asset.category === filterCategory;
      const typeOk = filterType === 'all' || asset.type === filterType || asset.format === filterType;
      return categoryOk && typeOk && (!query || haystack.includes(query));
    });

    grid.innerHTML = assets.length ? assets.map((asset) => `
      <button class="asset-card-btn" type="button" data-asset-id="${esc(asset.id)}">
        <span class="asset-preview">${assetPreview(asset)}</span>
        <span class="asset-card-title">${esc(asset.name || asset.id)}</span>
        <span class="asset-card-meta">${esc(asset.category)} · ${esc(asset.format)} · ${esc((asset.tags || []).slice(0, 4).join(', '))}</span>
      </button>
    `).join('') : '<div class="asset-empty-message">No assets match this search.</div>';

    grid.querySelectorAll('[data-asset-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const asset = (assetManifest.assets || []).find((item) => item.id === button.dataset.assetId);
        if (!asset) return;
        applyAssetToPath(pickerTarget, asset);
        document.querySelector('.asset-picker-popup')?.remove();
      });
    });
  }

  async function showAssetPicker(target = 'item') {
    try {
      pickerTarget = target;
      const manifest = await loadManifest();
      document.querySelector('.asset-picker-popup')?.remove();
      const categories = ['all', ...(manifest.categories || []).map((category) => category.id)];
      const types = ['all', ...new Set((manifest.assets || []).flatMap((asset) => [asset.type, asset.format]).filter(Boolean))];
      const popup = document.createElement('div');
      popup.className = 'asset-picker-popup floating-side-popup';
      popup.innerHTML = `
        <div class="floating-side-popup-head"><strong>Asset Library</strong><button type="button" data-close>×</button></div>
        <div class="asset-picker-toolbar">
          <input id="assetSearch" type="search" placeholder="Search assets, tags, names...">
          <select id="assetCategory">${categories.map((category) => `<option value="${esc(category)}">${esc(category)}</option>`).join('')}</select>
          <select id="assetType">${types.map((type) => `<option value="${esc(type)}">${esc(type)}</option>`).join('')}</select>
          <button type="button" id="assetClear">Clear</button>
          <button type="button" id="assetReload">Reload</button>
        </div>
        <div class="asset-picker-grid"></div>
      `;
      document.body.appendChild(popup);
      popup.querySelector('[data-close]')?.addEventListener('click', () => popup.remove());
      popup.querySelector('#assetClear')?.addEventListener('click', () => {
        popup.querySelector('#assetSearch').value = '';
        popup.querySelector('#assetCategory').value = 'all';
        popup.querySelector('#assetType').value = 'all';
        renderAssetGrid('', 'all', 'all');
      });
      popup.querySelector('#assetReload')?.addEventListener('click', async () => {
        assetManifest = null;
        await loadManifest();
        renderAssetGrid(popup.querySelector('#assetSearch').value, popup.querySelector('#assetCategory').value, popup.querySelector('#assetType').value);
      });
      ['assetSearch', 'assetCategory', 'assetType'].forEach((id) => {
        popup.querySelector(`#${id}`)?.addEventListener('input', () => {
          renderAssetGrid(popup.querySelector('#assetSearch').value, popup.querySelector('#assetCategory').value, popup.querySelector('#assetType').value);
        });
      });
      wirePopupDrag(popup);
      renderAssetGrid();
      popup.querySelectorAll('video').forEach((video) => video.play?.().catch(() => {}));
      toast('Asset Library opened');
    } catch (error) {
      toast(`Asset Library failed: ${error.message}`);
    }
  }

  function applyAssetToPath(target, asset) {
    const path = assetDisplayPath(asset);
    const input = target === 'background' ? document.getElementById('sceneBg') : document.getElementById('itemImage');
    if (!input) return;
    input.value = path;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    markDirty(`asset selected: ${asset.id}`);
    toast(`Asset selected: ${asset.id}`);
    queuePatch();
  }

  function addWrapImageButton() {
    const widthField = document.getElementById('itemW')?.closest('.field');
    const heightField = document.getElementById('itemH')?.closest('.field');
    if (!widthField || !heightField || heightField.parentElement?.classList.contains('fit-tools-row')) return;
    const row = heightField.parentElement;
    if (!row || !row.classList.contains('field-row')) return;
    row.classList.add('fit-tools-row');
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wrap-image-btn';
    button.textContent = '📐 Wrap Image';
    button.title = 'Match this object box to the selected image aspect ratio.';
    button.addEventListener('click', wrapSelectedImage);
    row.appendChild(button);
  }

  function stageSelectedImage() {
    const id = document.getElementById('itemId')?.value;
    if (!id) return null;
    return document.querySelector(`.scene-item[data-stage-id="${CSS.escape(id)}"] img`);
  }

  function wrapSelectedImage() {
    const imageInput = document.getElementById('itemImage');
    const widthInput = document.getElementById('itemW');
    const heightInput = document.getElementById('itemH');
    if (!imageInput || !widthInput || !heightInput) return toast('No selected image to wrap');

    const stageImg = stageSelectedImage();
    const image = new Image();
    image.onload = () => {
      const naturalW = image.naturalWidth || stageImg?.naturalWidth;
      const naturalH = image.naturalHeight || stageImg?.naturalHeight;
      if (!naturalW || !naturalH) return toast('Could not read image size');
      const ratio = naturalW / naturalH;
      const currentW = Number(widthInput.value || 10);
      const currentH = Number(heightInput.value || 10);
      if (ratio >= 1) {
        heightInput.value = Math.max(1, +(currentW / ratio).toFixed(3));
      } else {
        widthInput.value = Math.max(1, +(currentH * ratio).toFixed(3));
      }
      widthInput.dispatchEvent(new Event('input', { bubbles: true }));
      heightInput.dispatchEvent(new Event('input', { bubbles: true }));
      widthInput.dispatchEvent(new Event('change', { bubbles: true }));
      heightInput.dispatchEvent(new Event('change', { bubbles: true }));
      markDirty('wrapped image dimensions');
      toast(`Wrapped image ratio ${naturalW}×${naturalH}`);
      queuePatch();
    };
    image.onerror = () => toast('Could not load selected image for wrap');
    image.src = stageImg?.src || imageInput.value;
  }

  function wireImportWarning() {
    const importButton = document.getElementById('importBtn');
    if (importButton && importButton.dataset.v11Warn !== 'true') {
      importButton.dataset.v11Warn = 'true';
      importButton.addEventListener('click', (event) => {
        if (!dirty || importWarningBypass) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        showImportWarning(() => {
          importWarningBypass = true;
          importButton.click();
          setTimeout(() => { importWarningBypass = false; }, 0);
        });
      }, true);
    }

    document.querySelectorAll('#jsonFile, [data-template-file]').forEach((node) => {
      if (node.dataset.v11Clean === 'true') return;
      node.dataset.v11Clean = 'true';
      node.addEventListener('change', () => markClean('loaded'));
      node.addEventListener('click', () => markClean('loading'));
    });
  }

  function showImportWarning(onContinue) {
    document.querySelector('.unsaved-import-warning')?.remove();
    const popup = document.createElement('div');
    popup.className = 'unsaved-import-warning floating-side-popup';
    popup.innerHTML = `
      <div class="floating-side-popup-head"><strong>Unsaved changes</strong><button type="button" data-close>×</button></div>
      <p>Importing another file may replace the current scene. Download JSON first if you want to keep it.</p>
      <div class="asset-warning-actions">
        <button type="button" data-continue>Continue Import</button>
        <button type="button" data-cancel>Cancel</button>
        <button type="button" data-download>Download JSON</button>
      </div>
    `;
    popup.querySelector('[data-close]')?.addEventListener('click', () => popup.remove());
    popup.querySelector('[data-cancel]')?.addEventListener('click', () => popup.remove());
    popup.querySelector('[data-download]')?.addEventListener('click', () => document.getElementById('downloadJson')?.click());
    popup.querySelector('[data-continue]')?.addEventListener('click', () => {
      popup.remove();
      onContinue?.();
    });
    document.body.appendChild(popup);
    wirePopupDrag(popup);
    toast('Unsaved import warning');
  }

  function wireCleanOnDownload() {
    const button = document.getElementById('downloadJson');
    if (!button || button.dataset.v11CleanDownload === 'true') return;
    button.dataset.v11CleanDownload = 'true';
    button.addEventListener('click', () => setTimeout(() => markClean('downloaded'), 150));
  }

  function wireDirtyTracking() {
    if (document.body.dataset.v11DirtyTracking === 'true') return;
    document.body.dataset.v11DirtyTracking = 'true';
    document.addEventListener('input', (event) => {
      if (event.target?.closest?.('#editor-app') && !event.target?.matches?.('#jsonFile')) markDirty('field edited');
    }, true);
    document.addEventListener('change', (event) => {
      if (event.target?.closest?.('#editor-app') && !event.target?.matches?.('#jsonFile')) markDirty('field changed');
    }, true);
    document.addEventListener('click', (event) => {
      if (event.target?.closest?.('#blankBtn, #downloadJson, #importBtn')) return;
      if (event.target?.closest?.('#addElement, #addLayer, #deleteItem, [data-action="duplicate"], [data-action="remove"], .path-dropdown button, .asset-card-btn, .wrap-image-btn')) markDirty('object changed');
    }, true);
  }

  function wirePopupDrag(popup) {
    const handle = popup.querySelector('.floating-side-popup-head');
    if (!handle || popup.dataset.v11Drag === 'true') return;
    popup.dataset.v11Drag = 'true';
    handle.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      const rect = popup.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const move = (moveEvent) => {
        popup.style.left = `${Math.max(8, Math.min(window.innerWidth - 80, rect.left + moveEvent.clientX - startX))}px`;
        popup.style.top = `${Math.max(8, Math.min(window.innerHeight - 60, rect.top + moveEvent.clientY - startY))}px`;
        popup.style.right = 'auto';
      };
      const up = () => {
        popup.classList.remove('is-dragging');
        document.removeEventListener('pointermove', move);
        document.removeEventListener('pointerup', up);
      };
      popup.classList.add('is-dragging');
      document.addEventListener('pointermove', move);
      document.addEventListener('pointerup', up);
    });
  }

  function patch() {
    patchQueued = false;
    addAssetsOptionToPathMenus();
    addWrapImageButton();
    wireImportWarning();
    wireCleanOnDownload();
    wireDirtyTracking();
    document.querySelectorAll('.floating-side-popup').forEach(wirePopupDrag);
  }

  window.addEventListener('load', () => {
    patch();
    toast('Asset picker + wrap image loaded');
  });

  document.addEventListener('click', queuePatch, true);
  document.addEventListener('change', queuePatch, true);
  document.addEventListener('pointerup', queuePatch, true);
  setInterval(queuePatch, 1400);
  patch();
})();
