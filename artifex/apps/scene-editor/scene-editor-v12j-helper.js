(() => {
  const VERSION = 'v0.12j';
  const WORKING_COPY_KEY = 'artifex.sceneEditor.workingCopy.v1';
  const DOWNLOAD_KEY = 'artifex.sceneEditor.lastDownload.v1';
  let queued = false;

  function safeParse(text, fallback = null) {
    try { return JSON.parse(text); }
    catch { return fallback; }
  }

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function formatStamp(iso) {
    if (!iso) return '—';
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return '—';
    return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}-${String(date.getFullYear()).slice(-2)} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, (char) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[char]));
  }

  function readWorking() {
    return safeParse(localStorage.getItem(WORKING_COPY_KEY), null);
  }

  function readDownloaded() {
    return safeParse(localStorage.getItem(DOWNLOAD_KEY), null);
  }

  function polishFilePill() {
    const pill = document.querySelector('.file-pill');
    if (!pill || pill.textContent.trim() === 'No file loaded') return;
    const currentName = pill.querySelector('.file-pill-name')?.textContent?.trim()
      || pill.childNodes[0]?.textContent?.trim()
      || pill.textContent.trim()
      || 'Untitled JSON';
    const working = readWorking();
    const downloaded = readDownloaded();
    const localStamp = formatStamp(working?.savedAt);
    const hddStamp = formatStamp(downloaded?.downloadedAt);
    const html = `<span class="file-pill-main"><span class="file-pill-icons" aria-hidden="true">📁 💾</span><span class="file-pill-name">${escapeHtml(currentName)}</span></span><span class="file-pill-meta-line">| LOCAL: ${escapeHtml(localStamp)} | HDD: ${escapeHtml(hddStamp)} |</span>`;
    if (pill.dataset.v12jHtml === html) return;
    pill.dataset.v12jHtml = html;
    pill.innerHTML = html;
  }

  function polishResumePanel() {
    const blankStrong = document.querySelector('.blank-message > div > strong');
    if (blankStrong && blankStrong.textContent.trim() === 'Blank Scene Editor') blankStrong.remove();

    const card = document.querySelector('.resume-card-inline');
    if (!card) return;
    card.classList.add('resume-polished');

    const fileStrong = card.querySelector('p + strong');
    if (fileStrong) fileStrong.classList.add('resume-file-name');

    const openButton = document.getElementById('openLocalBackup');
    if (openButton) openButton.classList.add('resume-open-primary');
  }

  function patch() {
    queued = false;
    polishFilePill();
    polishResumePanel();
  }

  function queue() {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => requestAnimationFrame(patch));
  }

  window.addEventListener('load', queue);
  document.addEventListener('click', queue, true);
  document.addEventListener('input', queue, true);
  document.addEventListener('change', queue, true);
  document.addEventListener('pointerup', queue, true);
  setInterval(queue, 1500);
  queue();
})();
