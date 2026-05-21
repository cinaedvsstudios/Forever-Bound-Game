(() => {
  const VERSION = 'v0.09';
  const LOCK_KEY = 'artifex.sceneEditor.lockedElements.v1';
  let panning = null;
  let popupDrag = null;
  let downloadBypass = false;

  function readLocks() {
    try { return JSON.parse(localStorage.getItem(LOCK_KEY) || '{}'); }
    catch { return {}; }
  }

  function writeLocks(locks) {
    try { localStorage.setItem(LOCK_KEY, JSON.stringify(locks)); }
    catch {}
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

  function enhanceElementsHeader() {
    const elementsCard = document.querySelector('[data-card-id="elements"]');
    if (!elementsCard || elementsCard.dataset.v09Enhanced === 'true') return;
    const heading = elementsCard.querySelector('h2');
    if (!heading) return;

    const title = heading.querySelector('span');
    if (title && !title.classList.contains('card-title-main')) title.classList.add('card-title-main');

    const actions = document.createElement('span');
    actions.className = 'card-header-actions';
    actions.innerHTML = `
      <button class="header-icon-btn" type="button" data-proxy="addElement" title="Add Element">➕</button>
      <button class="header-icon-btn" type="button" data-proxy="addLayer" title="Add Layer">🖼️</button>
      <button class="header-icon-btn" type="button" data-proxy="highlightBtn" title="Toggle Highlight">🖍️</button>
    `;

    const toggle = heading.querySelector('.card-toggle');
    heading.insertBefore(actions, toggle || null);

    actions.querySelectorAll('[data-proxy]').forEach((button) => {
      button.addEventListener('mouseenter', () => setTip(button.title));
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        document.getElementById(button.dataset.proxy)?.click();
      });
    });

    elementsCard.dataset.v09Enhanced = 'true';
  }

  function revealLayerRowAndHideOldActionButtons() {
    const elementsCard = document.querySelector('[data-card-id="elements"]');
    if (!elementsCard) return;
    const bodyActions = elementsCard.querySelector('.card-body .compact-actions');
    if (!bodyActions) return;
    bodyActions.style.display = 'flex';
    bodyActions.querySelectorAll('.icon-btn').forEach((button) => button.style.display = 'none');
    bodyActions.classList.add('layer-only-row');
  }

  function normalizeCollapseIcons() {
    document.querySelectorAll('.card-toggle').forEach((button) => {
      if (button.textContent.trim() !== '↕️') button.textContent = '↕️';
    });
  }

  function enhanceFilePill() {
    const pill = document.querySelector('.file-pill');
    if (!pill || pill.dataset.v09FileTools === 'true') return;
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
    });
    tools.querySelector('[title="Save / Download"]')?.addEventListener('click', (event) => {
      event.stopPropagation();
      document.getElementById('downloadJson')?.click();
    });
    pill.dataset.v09FileTools = 'true';
  }

  function enhanceElementRows() {
    const locks = readLocks();
    document.querySelectorAll('.item-row[data-select-id]').forEach((row) => {
      const id = row.dataset.selectId;
      if (!id) return;
      const old = row.querySelector('.element-lock-toggle');
      if (old) old.remove();
      const lock = document.createElement('span');
      lock.className = 'element-lock-toggle';
      lock.textContent = locks[id] ? '🔒' : '🔓';
      lock.title = locks[id] ? 'Unlock element' : 'Lock element';
      lock.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const next = readLocks();
        next[id] = !next[id];
        writeLocks(next);
        toast(next[id] ? `Locked ${id}` : `Unlocked ${id}`);
        patch();
      });
      row.append(lock);
      row.classList.toggle('is-locked', !!locks[id]);
      row.dataset.v09Lock = 'true';
    });
  }

  function blockLockedDragging() {
    document.querySelectorAll('.scene-item[data-stage-id]').forEach((item) => {
      const id = item.dataset.stageId;
      const locks = readLocks();
      item.classList.toggle('is-locked', !!locks[id]);
      if (item.dataset.v09LockBlock === 'true') return;
      item.addEventListener('pointerdown', (event) => {
        const currentLocks = readLocks();
        if (!currentLocks[item.dataset.stageId]) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        toast(`Locked: ${item.dataset.stageId}`);
      }, true);
      item.dataset.v09LockBlock = 'true';
    });
  }

  function enhanceTagsField() {
    const field = document.getElementById('itemTags')?.closest('.field');
    if (!field || field.dataset.v09Tags === 'true') return;
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
    field.dataset.v09Tags = 'true';
  }

  function currentTags() {
    return (document.getElementById('itemTags')?.value || '').split(',').map((tag) => tag.trim()).filter(Boolean);
  }

  function collectTags() {
    const tags = new Set(['character', 'prop', 'pickup', 'exit', 'door', 'background', 'foreground', 'overlay', 'fx', 'vfx', 'fire', 'fog', 'magic', 'water', 'npc', 'foe', 'searchable', 'locked', 'temporary', 'blob']);
    document.querySelectorAll('.item-row').forEach((row) => {
      String(row.textContent || '').split(/[·\s,]+/).forEach((part) => {
        const cleaned = part.trim().toLowerCase();
        if (cleaned && cleaned.length > 2 && !/^z\d+$/i.test(cleaned)) tags.add(cleaned);
      });
    });
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
          renderTags();
        });
      });
      list.querySelectorAll('[data-remove]').forEach((button) => {
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          const next = currentTags().filter((tag) => tag !== button.dataset.remove);
          input.value = next.join(', ');
          input.dispatchEvent(new Event('input', { bubbles: true }));
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
      return;
    }
    const row = document.querySelector(`.item-row[data-select-id="${CSS.escape(id)}"]`);
    if (row) row.click();
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
    for (let index = 0; index < assets.length; index += 1) {
      await downloadOneRiskyAsset(assets[index], index);
    }
    toast(`Download started for ${assets.length} asset(s), named by element ID`);
  }

  function wirePopupDrag(popup) {
    const handle = popup.querySelector('.floating-side-popup-head');
    if (!handle || popup.dataset.v09Drag === 'true') return;
    popup.dataset.v09Drag = 'true';
    handle.addEventListener('pointerdown', (event) => {
      if (event.target.closest('button')) return;
      const rect = popup.getBoundingClientRect();
      popupDrag = {
        popup,
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        left: rect.left,
        top: rect.top
      };
      popup.classList.add('is-dragging');
      popup.style.left = `${rect.left}px`;
      popup.style.top = `${rect.top}px`;
      popup.style.right = 'auto';
      handle.setPointerCapture?.(event.pointerId);
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
      setTimeout(() => { downloadBypass = false; }, 0);
    });
    popup.querySelectorAll('[data-asset-id]').forEach((button) => button.addEventListener('click', () => selectAsset(button.dataset.assetId)));
    document.body.appendChild(popup);
    wirePopupDrag(popup);
  }

  function wireDownloadWarning() {
    const button = document.getElementById('downloadJson');
    if (!button || button.dataset.v09DownloadWarning === 'true') return;
    button.dataset.v09DownloadWarning = 'true';
    button.addEventListener('click', (event) => {
      if (downloadBypass) return;
      const assets = findRiskyImages();
      if (!assets.length) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      showAssetWarning(assets);
      toast(`Warning: ${assets.length} unsaved image asset(s)`);
    }, true);
  }

  function enhanceBlankVersion() {
    const blank = document.querySelector('.blank-message');
    if (!blank || blank.querySelector('.artifex-version-marker-v09')) return;
    const marker = document.createElement('div');
    marker.className = 'artifex-version-marker-v09';
    marker.textContent = `${VERSION} asset-download naming build`;
    marker.style.cssText = 'margin-top:12px;color:#bfa990;font-size:12px;letter-spacing:.04em;';
    blank.appendChild(marker);
  }

  function wireMiddleMousePanning() {
    const wrap = document.querySelector('.stage-wrap');
    if (!wrap || wrap.dataset.v09Panning === 'true') return;
    wrap.dataset.v09Panning = 'true';

    wrap.addEventListener('pointerdown', (event) => {
      if (event.button !== 1) return;
      event.preventDefault();
      panning = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        left: wrap.scrollLeft,
        top: wrap.scrollTop,
        wrap
      };
      wrap.classList.add('is-panning');
      wrap.setPointerCapture?.(event.pointerId);
      setTip('Middle mouse drag: panning Work Area view.');
    });

    wrap.addEventListener('pointermove', (event) => {
      if (!panning || panning.wrap !== wrap) return;
      event.preventDefault();
      wrap.scrollLeft = panning.left - (event.clientX - panning.startX);
      wrap.scrollTop = panning.top - (event.clientY - panning.startY);
    });

    wrap.addEventListener('auxclick', (event) => {
      if (event.button === 1) event.preventDefault();
    });
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
    document.querySelectorAll('.floating-side-popup').forEach(wirePopupDrag);
  }

  document.addEventListener('pointermove', (event) => {
    if (!popupDrag) return;
    const left = popupDrag.left + (event.clientX - popupDrag.startX);
    const top = popupDrag.top + (event.clientY - popupDrag.startY);
    popupDrag.popup.style.left = `${Math.max(8, Math.min(window.innerWidth - 80, left))}px`;
    popupDrag.popup.style.top = `${Math.max(8, Math.min(window.innerHeight - 60, top))}px`;
  });
  document.addEventListener('pointerup', () => { stopPanning(); stopPopupDrag(); });
  document.addEventListener('pointercancel', () => { stopPanning(); stopPopupDrag(); });
  document.addEventListener('mouseenter', (event) => {
    const tipNode = event.target.closest?.('[data-tip], [title]');
    if (!tipNode) return;
    setTip(tipNode.dataset.tip || tipNode.title || 'Ready.');
  }, true);

  const observer = new MutationObserver(patch);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('load', () => {
    patch();
    toast('Scene Editor asset-download naming loaded');
  });
  patch();
})();
