(() => {
  const VERSION = 'v0.12h';
  const BACKUP_KEY = 'artifex.sceneEditor.workingCopy.v1';
  const DOWNLOAD_KEY = 'artifex.sceneEditor.lastDownload.v1';
  let queued = false;
  let lastSnapshot = '';

  function toast(message) {
    document.querySelector('.artifex-toast')?.remove();
    const node = document.createElement('div');
    node.className = 'artifex-toast';
    node.textContent = VERSION + ': ' + message;
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 2200);
  }

  function safeParse(text, fallback = null) {
    try { return JSON.parse(text); }
    catch { return fallback; }
  }

  function fmt(ts) {
    if (!ts) return 'Not recorded';
    try {
      return new Date(ts).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return String(ts);
    }
  }

  function readBackup() {
    return safeParse(localStorage.getItem(BACKUP_KEY), null);
  }

  function readDownload() {
    return safeParse(localStorage.getItem(DOWNLOAD_KEY), null);
  }

  function currentSceneFromPreview() {
    const pre = document.querySelector('.json-preview');
    if (!pre) return null;
    const scene = safeParse(pre.textContent, null);
    if (!scene || typeof scene !== 'object') return null;
    return scene;
  }

  function currentFileName() {
    const pill = document.querySelector('.file-pill');
    const text = pill ? pill.childNodes[0]?.textContent || pill.textContent || '' : '';
    const clean = text.trim();
    return clean && clean !== 'No file loaded' ? clean : '';
  }

  function saveWorkingCopy(reason = 'autosave') {
    const scene = currentSceneFromPreview();
    if (!scene) return;
    const fileName = currentFileName() || scene.id || scene.name || 'Untitled JSON';
    const payload = {
      fileName,
      scene,
      savedAt: new Date().toISOString(),
      reason
    };
    const snapshot = JSON.stringify(payload);
    if (snapshot === lastSnapshot) return;
    lastSnapshot = snapshot;
    localStorage.setItem(BACKUP_KEY, snapshot);
    updateFilePill();
  }

  function markDownloaded() {
    const backup = readBackup();
    const fileName = currentFileName() || backup?.fileName || 'Untitled JSON';
    localStorage.setItem(DOWNLOAD_KEY, JSON.stringify({ fileName, downloadedAt: new Date().toISOString() }));
    updateFilePill();
  }

  function updateFilePill() {
    const pill = document.querySelector('.file-pill');
    if (!pill || pill.dataset.v12hMeta === 'true') return;
    const backup = readBackup();
    const download = readDownload();
    const name = currentFileName() || backup?.fileName || 'Untitled JSON';
    if (!name || name === 'No file loaded') return;
    pill.dataset.v12hMeta = 'true';
    pill.innerHTML = `<span class="file-pill-name">${escapeHtml(name)}</span><span class="file-pill-meta">Local backup: ${escapeHtml(fmt(backup?.savedAt))}</span><span class="file-pill-meta">Last downloaded: ${escapeHtml(fmt(download?.downloadedAt))}</span>`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function showResumeCard() {
    const blank = document.querySelector('.blank-message > div');
    if (!blank || blank.dataset.v12hResume === 'true') return;
    const backup = readBackup();
    if (!backup?.scene) return;
    const download = readDownload();
    blank.dataset.v12hResume = 'true';
    blank.innerHTML = `
      <strong>Blank Scene Editor</strong>
      <div class="resume-card-inline">
        <h3>Start where you left off?</h3>
        <p>You were last working on:</p>
        <strong>${escapeHtml(backup.fileName || backup.scene.id || 'Untitled JSON')}</strong>
        <p>Last local backup: ${escapeHtml(fmt(backup.savedAt))}</p>
        <p>Last downloaded: ${escapeHtml(fmt(download?.downloadedAt))}</p>
        <div class="resume-actions">
          <button class="btn" id="openLocalBackup" type="button">Open local backup</button>
          <button class="btn" id="ignoreLocalBackup" type="button">Ignore</button>
        </div>
      </div>
    `;
    document.getElementById('openLocalBackup')?.addEventListener('click', () => openBackup());
    document.getElementById('ignoreLocalBackup')?.addEventListener('click', () => {
      const card = document.querySelector('.resume-card-inline');
      if (card) card.remove();
      toast('Local backup ignored');
    });
  }

  function openBackup() {
    const backup = readBackup();
    if (!backup?.scene) return toast('No local backup found');
    const blob = new Blob([JSON.stringify(backup.scene, null, 2)], { type: 'application/json' });
    const file = new File([blob], backup.fileName || 'local-backup.json', { type: 'application/json' });
    const input = document.getElementById('jsonFile');
    if (!input) return toast('Import input not found');
    const transfer = new DataTransfer();
    transfer.items.add(file);
    input.files = transfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    toast('Local backup opened');
  }

  function queue(reason = 'autosave') {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      queued = false;
      showResumeCard();
      saveWorkingCopy(reason);
      updateFilePill();
    }));
  }

  function bind() {
    if (document.body.dataset.v12hBackup === 'true') return;
    document.body.dataset.v12hBackup = 'true';

    document.addEventListener('input', () => queue('input'), true);
    document.addEventListener('change', () => queue('change'), true);
    document.addEventListener('pointerup', () => queue('pointerup'), true);
    document.addEventListener('click', (event) => {
      if (event.target.closest?.('#downloadJson')) setTimeout(markDownloaded, 120);
      queue('click');
    }, true);

    setInterval(() => queue('interval'), 2500);
  }

  window.addEventListener('load', () => {
    bind();
    queue('load');
  });
  bind();
  queue('initial');
})();
