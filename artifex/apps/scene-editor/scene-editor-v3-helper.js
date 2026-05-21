(() => {
  const VERSION = 'v0.10';
  const LOCK_KEY = 'artifex.sceneEditor.lockedElements.v1';
  const RECENT_KEY = 'artifex.sceneEditor.recentProjects.v1';
  let panning = null;
  let popupDrag = null;
  let downloadBypass = false;
  let blankBypass = false;
  let patchQueued = false;
  let dirty = false;

  function readLocks() {
    try { return JSON.parse(localStorage.getItem(LOCK_KEY) || '{}'); }
    catch { return {}; }
  }

  function writeLocks(locks) {
    try { localStorage.setItem(LOCK_KEY, JSON.stringify(locks)); }
    catch {}
  }

  function readRecent() {
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]'); }
    catch { return []; }
  }

  function writeRecent(items) {
    try { localStorage.setItem(RECENT_KEY, JSON.stringify(items.slice(0, 12))); }
    catch {}
  }

  function addRecent(item) {
    if (!item || !item.label) return;
    const current = readRecent().filter((entry) => !(entry.label === item.label && entry.type === item.type && entry.value === item.value));
    current.unshift({ ...item, at: new Date().toISOString() });
    writeRecent(current);
  }

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

  function markDirty(reason = 'changed') {
    dirty = true;
    setTip(`Unsaved changes: ${reason}.`);
  }

  function markClean(reason = 'saved') {
    dirty = false;
    setTip(`Scene ${reason}.`);
  }

  function safeFilename(value) {
    return String(value || 'asset').trim().replace(/[^a-z0-9_\-.]+/gi, '_').replace(/^_+|_+$/g, '') || 'asset';
  }

  function extensionFromMime(type) {
    const map = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'image/svg+xml': '.svg',
      'image/avif': '.avif'
    };
    return map[String(type || '').toLowerCase()] || '';
  }

  function extensionFromUrl(url) {
    try {
      const path = new URL(url, location.href).pathname;
      const match = path.match(/\.([a-z0-9]{2,5})$/i);
      return match ? `.${match[1].toLowerCase()}` : '';
    } catch {
      const match = String(url || '').match(/\.([a-z0-9]{2,5})(?:[?#].*)?$/i);
      return match ? `.${match[1].toLowerCase()}` : '';
    }
  }

  function closeImportDropdownSoon() {
    setTimeout(() => {
      document.getElementById('importMenu')?.classList.remove('is-open');
      queuePatch();
    }, 80);
    setTimeout(() => {
      document.getElementById('importMenu')?.classList.remove('is-open');
      queuePatch();
    }, 450);
  }

  function enhanceElementsHeader() {
    const elementsCard = document.querySelector('[data-card-id="elements"]');
    if (!elementsCard) return;
    const heading = elementsCard.querySelector('h2');
    if (!heading) return;

    const title = heading.querySelector('span');
    if (title) title.classList.add('card-title-main');

    let actions = heading.querySelector('.card-header-actions');
    if (!actions) {
      actions = document.createElement('span');
      actions.className = 'card-header-actions';
      const toggle = heading.querySelector('.card-toggle');
      heading.insertBefore(actions, toggle || null);
    }

    if (actions.dataset.v10 !== 'true') {
      actions.innerHTML = `
        <button class="header-icon-btn" type="button" data-proxy="addElement" title="Add Element">➕</button>
        <button class="header-icon-btn" type="button" data-proxy="addLayer" title="Add Layer">🖼️</button>
        <button class="header-icon-btn" type="button" data-proxy="highlightBtn" title="Toggle Highlight">🖍️</button>
      `;
      actions.querySelectorAll('[data-proxy]').forEach((button) => {
        button.addEventListener('mouseenter', () => setTip(button.title));
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          document.getElementById(button.dataset.proxy)?.click();
          if (button.dataset.proxy !== 'highlightBtn') markDirty(button.title);
          queuePatch();
        });
      });
      actions.dataset.v10 = 'true';
    }
  }

  function revealLayerRowAndHideOldActionButtons() {
    const elementsCard = document.querySelector('[data-card-id="elements"]');
    if (!elementsCard) return;
    const bodyActions = elementsCard.querySelector('.card-body .compact-actions');
    if (!bodyActions) return;
    bodyActions.style.display = 'flex';
    bodyActions.classList.add('layer-only-row');
    bodyActions.querySelectorAll('.icon-btn').forEach((button) => { button.style.display = 'none'; });
  }

  function normalizeCollapseIcons() {
    document.querySelectorAll('.card-toggle').forEach((button) => {
      if (button.textContent.trim() !== '↕️') button.textContent = '↕️';
    });
  }

  function enhanceFilePill() {
    const pill = document.querySelector('.file-pill');
    if (!pill) return;
    if (pill.dataset.v10FileTools === 'true') return;
    const label = pill.textContent.trim();
    pill.textContent = '';
    const text = document.createElement('span');
    text.className = 'file-pill-text';
    text.textContent = label;
    const tools = document.createElement('span');
    tools.className = 'file-pill-tools';
    tools.innerHTML = `<button type="button" title="Open / Import">📂</button><button type="button" title="Save / Download">💾</button>`;
    pill.append(text, tools);
    tools.querySelector('[title="Open / Import"]')?.addEventListener('click', (event) => {
      event.stopPropagation();
      document.getElementById('importBtn')?.click();
      queuePatch();
    });
    tools.querySelector('[title="Save / Download"]')?.addEventListener('click', (event) => {
      event.stopPropagation();
      document.getElementById('downloadJson')?.click();
    });
    pill.dataset.v10FileTools = 'true';
  }

  function enhanceElementRows() {
    const locks = readLocks();
    document.querySelectorAll('.item-row[data-select-id]').forEach((row) => {
      const id = row.dataset.selectId;
      if (!id) return;
      let lock = row.querySelector('.element-lock-toggle');
      if (!lock) {
        lock = document.createElement('span');
        lock.className = 'element-lock-toggle';
        lock.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const next = readLocks();
          next[id] = !next[id];
          writeLocks(next);
          toast(next[id] ? `Locked ${id}` : `Unlocked ${id}`);
          queuePatch();
        });
        row.append(lock);
      }
      lock.textContent = locks[id] ? '🔒' : '🔓';
      lock.title = locks[id] ? 'Unlock element' : 'Lock element';
      row.classList.toggle('is-locked', !!locks[id]);
    });
  }

  function blockLockedDragging() {
    const locks = readLocks();
    document.querySelectorAll('.scene-item[data-stage-id]').forEach((item) => {
      const id = item.dataset.stageId;
      item.classList.toggle('is-locked', !!locks[id]);
      if (item.dataset.v10LockBlock === 'true') return;
      item.addEventListener('pointerdown', (event) => {
        const currentLocks = readLocks();
        if (!currentLocks[item.dataset.stageId]) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        toast(`Locked: ${item.dataset.stageId}`);
      }, true);
      item.dataset.v10LockBlock = 'true';
    });
  }

  function enhanceTagsField() {
    const field = document.getElementById('itemTags')?.closest('.field');
    if (!field || field.dataset.v10Tags === 'true') return;
    const label = field.querySelector('label');
    if (!label) return;
    const eye = document.createElement('button');
    eye.className = 'tag-eye-btn';
    eye.type = 'button';
    eye.title = 'Show tag pills';
    eye.textContent = '👁️';
    eye.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      showTagPopup();
    });
    label.appendChild(eye);
    field.dataset.v10Tags = 'true';
  }

  function currentTags() {
    return (document.getElementById('itemTags')?.value || '').split(',').map((tag) => tag.trim()).filter(Boolean);
  }

  function collectTags() {
    const tags = new Set(['character', 'prop', 'pickup', 'exit', 'door', 'background', 'foreground', 'overlay', 'fx', 'vfx', 'fire', 'fog', 'magic', 'water', 'npc', 'foe', 'searchable', 'locked', 'temporary', 'blob']);
    currentTags().forEach((tag) => tags.add(tag));
    return [...tags].sort();
  }

  function showTagPopup() {
    document.querySelector('.tag-pill-popup')?.remove();
    const input = document.getElementById('itemTags');
    if (!input) return;
    const popup = document.createElement('div');
    popup.className = 'tag-pill-popup floating-side-popup';
    popup.innerHTML = `<div class="floating-side-popup-head"><strong>Tags</strong><button type="button" data-close>×</button></div><div class="tag-pill-list"></div>`;
    const list = popup.querySelector('.tag-pill-list');
    const renderTags = () => {
      const active = new Set(currentTags());
      list.innerHTML = collectTags().map((tag) => `<span class="tag-pill ${active.has(tag) ? 'is-active' : ''}" data-tag="${tag}">${tag}<button type="button" data-remove="${tag}">×</button></span>`).join('');
      list.querySelectorAll('[data-tag]').forEach((pill) => {
        pill.addEventListener('click', (event) => {
          if (event.target.matches('[data-remove]')) return;
          const next = new Set(currentTags());
          next.add(pill.dataset.tag);
          input.value = [...next].join(', ');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          markDirty('tags changed');
          renderTags();
        });
      });
      list.querySelectorAll('[data-remove]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          const next = currentTags().filter((tag) => tag !== button.dataset.remove);
          input.value = next.join(', ');
          input.dispatchEvent(new Event('input', { bubbles: true }));
          markDirty('tags changed');
          renderTags();
        });
      });
    };
    popup.querySelector('[data-close]')?.addEventListener('click', () => popup.remove());
    document.body.appendChild(popup);
    wirePopupDrag(popup);
    renderTags();
  }

  function findRiskyImages() {
    const risky = [];
    document.querySelectorAll('.scene-item[data-stage-id] img').forEach((img) => {
      const src = img.getAttribute('src') || '';
      const actual = img.src || src;
      if (/^(blob:|data:|file:)/i.test(actual) || /^(blob:|data:|file:)/i.test(src)) {
        const item = img.closest('.scene-item');
        risky.push({ id: item?.dataset.stageId || 'unknown_asset', src: actual || src, reason: actual.startsWith('blob:') ? 'temporary blob image' : 'temporary/local image' });
      }
    });
    ['sceneBg', 'itemImage'].forEach((id) => {
      const input = document.getElementById(id);
      const value = input?.value || '';
      if (/^(blob:|data:|file:)/i.test(value)) risky.push({ id, src: value, reason: 'temporary input path' });
    });
    return risky.filter((item, index, arr) => arr.findIndex((other) => other.id === item.id && other.src === item.src) === index);
  }

  function selectAsset(id) {
    const stageItem = document.querySelector(`.scene-item[data-stage-id="${CSS.escape(id)}"]`);
    if (stageItem) {
      stageItem.click();
      stageItem.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
      queuePatch();
      return;
    }
    const row = document.querySelector(`.item-row[data-select-id="${CSS.escape(id)}"]`);
    if (row) row.click();
    queuePatch();
  }

  async function downloadOneRiskyAsset(asset, index) {
    const base = safeFilename(asset.id || `asset_${index + 1}`);
    try {
      const response = await fetch(asset.src);
      if (!response.ok) throw new Error(String(response.status));
      const blob = await response.blob();
      const ext = extensionFromMime(blob.type) || extensionFromUrl(asset.src) || '.png';
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${base}${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      const a = document.createElement('a');
      a.href = asset.src;
      a.download = `${base}${extensionFromUrl(asset.src) || '.png'}`;
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  async function downloadRiskyAssets(assets) {
    for (let index = 0; index < assets.length; index += 1) await downloadOneRiskyAsset(assets[index], index);
    toast(`Download started for ${assets.length} asset(s), named by element ID`);
  }

  function wirePopupDrag(popup) {
    const handle = popup.querySelector('.floating-side-popup-head');
    if (!handle || popup.dataset.v10Drag === 'true') return;
    popup.dataset.v10Drag = 'true';
    handle.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      const rect = popup.getBoundingClientRect();
      popupDrag = { popup, startX: event.clientX, startY: event.clientY, left: rect.left, top: rect.top };
      popup.classList.add('is-dragging');
      popup.style.left = `${rect.left}px`;
      popup.style.top = `${rect.top}px`;
      popup.style.right = 'auto';
    });
  }

  function showAssetWarning(assets) {
    document.querySelector('.asset-warning-popup')?.remove();
    const popup = document.createElement('div');
    popup.className = 'asset-warning-popup floating-side-popup';
    popup.innerHTML = `
      <div class="floating-side-popup-head"><strong>Unsaved images</strong><button type="button" data-close>×</button></div>
      <p>This scene contains temporary image links. Blob images will not reload later unless you save/download them and replace the path with a real asset-library path.</p>
      <div class="asset-warning-actions">
        <button type="button" data-continue>Continue JSON download</button>
        <button type="button" data-cancel>Cancel</button>
        <button type="button" data-download>Download all shown images</button>
      </div>
      <div class="asset-warning-list">${assets.map((asset) => `<button type="button" data-asset-id="${asset.id}"><strong>${asset.id}</strong><span>${asset.reason}</span></button>`).join('')}</div>
    `;
    popup.querySelector('[data-close]')?.addEventListener('click', () => popup.remove());
    popup.querySelector('[data-cancel]')?.addEventListener('click', () => popup.remove());
    popup.querySelector('[data-download]')?.addEventListener('click', () => downloadRiskyAssets(assets));
    popup.querySelector('[data-continue]')?.addEventListener('click', () => {
      popup.remove();
      downloadBypass = true;
      document.getElementById('downloadJson')?.click();
      markClean('downloaded');
      setTimeout(() => { downloadBypass = false; }, 0);
    });
    popup.querySelectorAll('[data-asset-id]').forEach((button) => button.addEventListener('click', () => selectAsset(button.dataset.assetId)));
    document.body.appendChild(popup);
    wirePopupDrag(popup);
  }

  function showBlankWarning() {
    document.querySelector('.unsaved-blank-warning')?.remove();
    const popup = document.createElement('div');
    popup.className = 'unsaved-blank-warning floating-side-popup';
    popup.innerHTML = `
      <div class="floating-side-popup-head"><strong>Unsaved changes</strong><button type="button" data-close>×</button></div>
      <p>Blank Screen will clear the current scene from the editor. Download JSON first if you want to keep it.</p>
      <div class="asset-warning-actions">
        <button type="button" data-continue>Continue</button>
        <button type="button" data-cancel>Cancel</button>
        <button type="button" data-download>Download JSON</button>
      </div>
    `;
    popup.querySelector('[data-close]')?.addEventListener('click', () => popup.remove());
    popup.querySelector('[data-cancel]')?.addEventListener('click', () => popup.remove());
    popup.querySelector('[data-download]')?.addEventListener('click', () => document.getElementById('downloadJson')?.click());
    popup.querySelector('[data-continue]')?.addEventListener('click', () => {
      popup.remove();
      blankBypass = true;
      dirty = false;
      document.getElementById('blankBtn')?.click();
      setTimeout(() => { blankBypass = false; }, 0);
    });
    document.body.appendChild(popup);
    wirePopupDrag(popup);
  }

  function wireDownloadWarning() {
    const button = document.getElementById('downloadJson');
    if (!button || button.dataset.v10DownloadWarning === 'true') return;
    button.dataset.v10DownloadWarning = 'true';
    button.addEventListener('click', (event) => {
      if (downloadBypass) { markClean('downloaded'); return; }
      const assets = findRiskyImages();
      if (!assets.length) {
        setTimeout(() => markClean('downloaded'), 50);
        return;
      }
      event.preventDefault();
      event.stopImmediatePropagation();
      showAssetWarning(assets);
      toast(`Warning: ${assets.length} unsaved image asset(s)`);
    }, true);
  }

  function wireBlankWarning() {
    const button = document.getElementById('blankBtn');
    if (!button || button.dataset.v10BlankWarning === 'true') return;
    button.dataset.v10BlankWarning = 'true';
    button.addEventListener('click', (event) => {
      if (blankBypass || !dirty) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      showBlankWarning();
      toast('Unsaved changes warning');
    }, true);
  }

  function wireImportTracking() {
    const jsonFile = document.getElementById('jsonFile');
    if (jsonFile && jsonFile.dataset.v10Track !== 'true') {
      jsonFile.dataset.v10Track = 'true';
      jsonFile.addEventListener('change', (event) => {
        const file = event.target.files?.[0];
        if (file) addRecent({ type: 'local', label: file.name, value: file.name });
        markClean('loaded');
        closeImportDropdownSoon();
      });
    }

    document.querySelectorAll('[data-template-file]').forEach((button) => {
      if (button.dataset.v10Track === 'true') return;
      button.dataset.v10Track = 'true';
      button.addEventListener('click', () => {
        addRecent({ type: 'template', label: button.dataset.templateFile, value: button.dataset.templateFile });
        markClean('loaded');
        closeImportDropdownSoon();
      });
    });
  }

  function enhanceImportRecent() {
    const dropdown = document.querySelector('#importMenu .import-dropdown');
    if (!dropdown || dropdown.dataset.v10Recent === 'true') return;
    const recent = document.createElement('button');
    recent.className = 'btn';
    recent.type = 'button';
    recent.textContent = 'Recent Projects';
    recent.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      showRecentProjects();
    });
    dropdown.appendChild(recent);
    dropdown.dataset.v10Recent = 'true';
  }

  function showRecentProjects() {
    document.querySelector('.recent-projects-popup')?.remove();
    const items = readRecent();
    const popup = document.createElement('div');
    popup.className = 'recent-projects-popup floating-side-popup';
    popup.innerHTML = `<div class="floating-side-popup-head"><strong>Recent Projects</strong><button type="button" data-close>×</button></div><div class="recent-projects-list">${items.length ? items.map((item) => `<button type="button" data-type="${item.type}" data-value="${item.value}"><strong>${item.label}</strong><small>${item.type === 'local' ? 'Local files must be re-imported from hard drive.' : item.type}</small></button>`).join('') : '<p>No recent projects yet.</p>'}</div>`;
    popup.querySelector('[data-close]')?.addEventListener('click', () => popup.remove());
    popup.querySelectorAll('[data-type="template"]').forEach((button) => {
      button.addEventListener('click', () => {
        popup.remove();
        const templateButton = document.querySelector(`[data-template-file="${CSS.escape(button.dataset.value)}"]`);
        if (templateButton) templateButton.click();
        else toast('Open Import > From templates first to load the template list.');
      });
    });
    document.body.appendChild(popup);
    wirePopupDrag(popup);
  }

  function enhanceBlankVersion() {
    const blank = document.querySelector('.blank-message');
    if (!blank || blank.querySelector('.artifex-version-marker-v10')) return;
    const marker = document.createElement('div');
    marker.className = 'artifex-version-marker-v10';
    marker.textContent = `${VERSION} warning + texture build`;
    marker.style.cssText = 'margin-top:12px;color:#bfa990;font-size:12px;letter-spacing:.04em;';
    blank.appendChild(marker);
  }

  function wireMiddleMousePanning() {
    const wrap = document.querySelector('.stage-wrap');
    if (!wrap || wrap.dataset.v10Panning === 'true') return;
    wrap.dataset.v10Panning = 'true';
    wrap.addEventListener('pointerdown', (event) => {
      if (event.button !== 1) return;
      event.preventDefault();
      panning = { startX: event.clientX, startY: event.clientY, left: wrap.scrollLeft, top: wrap.scrollTop, wrap };
      wrap.classList.add('is-panning');
      setTip('Middle mouse drag: panning Work Area view.');
    });
    wrap.addEventListener('pointermove', (event) => {
      if (!panning || panning.wrap !== wrap) return;
      event.preventDefault();
      wrap.scrollLeft = panning.left - (event.clientX - panning.startX);
      wrap.scrollTop = panning.top - (event.clientY - panning.startY);
    });
    wrap.addEventListener('auxclick', (event) => { if (event.button === 1) event.preventDefault(); });
  }

  function stopPanning() {
    if (!panning) return;
    panning.wrap?.classList.remove('is-panning');
    panning = null;
  }

  function stopPopupDrag() {
    if (!popupDrag) return;
    popupDrag.popup?.classList.remove('is-dragging');
    popupDrag = null;
  }

  function patch() {
    patchQueued = false;
    enhanceElementsHeader();
    revealLayerRowAndHideOldActionButtons();
    normalizeCollapseIcons();
    enhanceFilePill();
    enhanceElementRows();
    blockLockedDragging();
    enhanceTagsField();
    enhanceBlankVersion();
    wireMiddleMousePanning();
    wireDownloadWarning();
    wireBlankWarning();
    wireImportTracking();
    enhanceImportRecent();
    document.querySelectorAll('.floating-side-popup').forEach(wirePopupDrag);
  }

  function queuePatch() {
    if (patchQueued) return;
    patchQueued = true;
    requestAnimationFrame(() => requestAnimationFrame(patch));
  }

  document.addEventListener('pointermove', (event) => {
    if (!popupDrag) return;
    const left = popupDrag.left + (event.clientX - popupDrag.startX);
    const top = popupDrag.top + (event.clientY - popupDrag.startY);
    popupDrag.popup.style.left = `${Math.max(8, Math.min(window.innerWidth - 80, left))}px`;
    popupDrag.popup.style.top = `${Math.max(8, Math.min(window.innerHeight - 60, top))}px`;
  });
  document.addEventListener('pointerup', () => { stopPanning(); stopPopupDrag(); queuePatch(); });
  document.addEventListener('pointercancel', () => { stopPanning(); stopPopupDrag(); queuePatch(); });
  document.addEventListener('click', (event) => {
    const target = event.target;
    if (target?.closest?.('#addElement, #addLayer, #deleteItem, [data-action="duplicate"], [data-action="remove"]')) markDirty('object list changed');
    queuePatch();
  }, true);
  document.addEventListener('change', (event) => {
    if (event.target?.matches?.('#jsonFile')) return;
    if (event.target?.closest?.('#editor-app')) markDirty('field changed');
    queuePatch();
  }, true);
  document.addEventListener('input', (event) => {
    if (event.target?.closest?.('#editor-app')) markDirty('field edited');
    if (event.target?.matches?.('input[type="text"], textarea')) return;
    queuePatch();
  }, true);
  document.addEventListener('mouseenter', (event) => {
    const tipNode = event.target.closest?.('[data-tip], [title]');
    if (!tipNode) return;
    setTip(tipNode.dataset.tip || tipNode.title || 'Ready.');
  }, true);

  window.addEventListener('load', () => {
    patch();
    toast('Scene Editor warning + texture helper loaded');
  });

  patch();
  setInterval(queuePatch, 1200);
})();
