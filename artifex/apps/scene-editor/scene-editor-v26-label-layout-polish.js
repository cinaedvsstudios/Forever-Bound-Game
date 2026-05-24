(() => {
  'use strict';

  const WORKING_COPY_KEY = 'artifex.sceneEditor.workingCopy.v1';
  const DOWNLOAD_KEY = 'artifex.sceneEditor.lastDownload.v1';
  let patching = false;

  function core() { return window.ArtifexSceneEditorCore || null; }
  function esc(value) { return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
  function readJson(key) { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; } }
  function dateText(iso) { if (!iso) return '—'; try { return new Date(iso).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }); } catch { return String(iso); } }

  function loadFinalCss() {
    const href = './scene-editor-v27-final-polish.css';
    if (document.querySelector(`link[href="${href}"]`)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }

  function title(cardId, text) {
    const node = document.querySelector(`[data-card-id="${cardId}"] h2 span`);
    if (node && node.textContent !== text) node.textContent = text;
  }

  function makeBackgroundCard() {
    const basics = document.querySelector('[data-card-id="basics"]');
    const body = basics?.querySelector('.card-body');
    const bgField = document.getElementById('sceneBg')?.closest('.field');
    if (!basics || !body || !bgField) return;
    let card = document.querySelector('[data-card-id="background-v26"]');
    if (!card) {
      card = document.createElement('section');
      card.className = 'panel-card card-basics is-collapsed';
      card.dataset.cardId = 'background-v26';
      card.innerHTML = '<h2><span>Background</span><button class="card-toggle" type="button" data-v26-bg-toggle="true">↕</button></h2><div class="card-body"></div>';
      basics.after(card);
      card.querySelector('[data-v26-bg-toggle]')?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        card.classList.toggle('is-collapsed');
        patch();
      });
    }
    const cardBody = card.querySelector('.card-body');
    if (!cardBody.contains(bgField)) cardBody.appendChild(bgField);
    cardBody.style.display = card.classList.contains('is-collapsed') ? 'none' : '';
  }

  function patchTitles() {
    title('basics', 'Scene');
    title('elements', 'Object Layers');
    title('selected', 'Selected Details');
    title('transform-v15', 'Transform Selected');
  }

  function fileNameFromPill(pill) {
    const existing = pill?.querySelector('.file-pill-value')?.textContent || pill?.querySelector('.file-pill-name')?.textContent || readJson(WORKING_COPY_KEY)?.fileName || 'Untitled JSON';
    return existing.trim() || 'Untitled JSON';
  }

  function patchFilePill() {
    const pill = document.querySelector('.file-pill');
    if (!pill || pill.textContent.trim() === 'No file loaded') return;
    const working = readJson(WORKING_COPY_KEY);
    const downloaded = readJson(DOWNLOAD_KEY);
    const file = fileNameFromPill(pill);
    pill.dataset.v26FilePill = 'true';
    pill.innerHTML = `<span class="file-pill-line file-pill-project"><span class="file-pill-icon">🏗️</span><span class="file-pill-label">Project:</span> <span class="file-pill-value">Forever Bound Game</span></span><span class="file-pill-line file-pill-file"><span class="file-pill-icon">📁</span><span class="file-pill-label">File:</span> <span class="file-pill-value">${esc(file)}</span></span><span class="file-pill-line file-pill-save"><span class="file-pill-icon">💾</span><span class="file-pill-label">Local:</span> <span class="file-pill-value">${esc(dateText(working?.savedAt))}</span> <span class="file-pill-sep">|</span> <span class="file-pill-label">HDD:</span> <span class="file-pill-value">${esc(dateText(downloaded?.downloadedAt))}</span></span>`;
  }

  function installManualSaveButton() {
    const topBar = document.querySelector('.top-bar');
    const divider = topBar?.querySelector('.title-divider');
    if (!topBar || !divider || topBar.querySelector('#manualLocalSaveV26')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.id = 'manualLocalSaveV26';
    button.className = 'btn manual-local-save-v26';
    button.title = 'Force save to local browser backup';
    button.textContent = '💾';
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const editor = core();
      if (!editor?.getScene?.()) { editor?.toast?.('Nothing to save locally'); return; }
      editor.saveWorkingCopy?.('manual save');
      patching = false;
      patch();
      editor.toast?.('Saved to local backup');
    });
    topBar.insertBefore(button, divider);
  }

  function patch() {
    if (patching) return;
    patching = true;
    try {
      loadFinalCss();
      patchTitles();
      makeBackgroundCard();
      patchFilePill();
      installManualSaveButton();
    } finally {
      patching = false;
    }
  }

  const observer = new MutationObserver(() => patch());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  document.addEventListener('click', () => requestAnimationFrame(patch), true);
  document.addEventListener('input', () => requestAnimationFrame(patch), true);
  document.addEventListener('change', () => requestAnimationFrame(patch), true);
  window.addEventListener('load', patch);
  setInterval(patch, 250);
  patch();
})();
