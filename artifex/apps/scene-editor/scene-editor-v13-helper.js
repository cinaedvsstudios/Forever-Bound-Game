(() => {
  const VERSION = 'v0.13';
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

  function cleanFileName(value) {
    let text = String(value || '').trim();
    text = text.replace(/[📁💾🏗️]/g, '').trim();
    text = text.replace(/\|\s*LOCAL\s*:[\s\S]*$/i, '').trim();
    text = text.replace(/LOCAL\s*:[\s\S]*$/i, '').trim();
    text = text.replace(/HDD\s*:[\s\S]*$/i, '').trim();
    text = text.replace(/Local backup\s*:[\s\S]*$/i, '').trim();
    text = text.replace(/Last downloaded\s*:[\s\S]*$/i, '').trim();
    text = text.replace(/\s{2,}/g, ' ').trim();
    return text || 'Untitled JSON';
  }

  function readWorking() {
    return safeParse(localStorage.getItem(WORKING_COPY_KEY), null);
  }

  function readDownloaded() {
    return safeParse(localStorage.getItem(DOWNLOAD_KEY), null);
  }

  function field(id) {
    return document.getElementById(id)?.closest('.field') || null;
  }

  function group(columns, className = '') {
    const node = document.createElement('div');
    node.className = `card-layout-group card-layout-${columns} ${className}`.trim();
    return node;
  }

  function cell(node, extra = '') {
    const wrapper = document.createElement('div');
    wrapper.className = `card-layout-cell ${extra}`.trim();
    if (node) wrapper.appendChild(node);
    return wrapper;
  }

  function moveAll(parent, nodes) {
    nodes.filter(Boolean).forEach((node) => parent.appendChild(cell(node)));
  }

  function divider() {
    const node = document.createElement('div');
    node.className = 'card-layout-divider';
    return node;
  }

  function cleanEmptyRows(scope) {
    scope.querySelectorAll('.field-row').forEach((row) => {
      if (!row.querySelector('.field, .wrap-image-btn, .scale-control-stack, .check-row, .button-row')) row.remove();
    });
  }

  function polishFilePill() {
    const pill = document.querySelector('.file-pill');
    if (!pill || pill.textContent.trim() === 'No file loaded') return;

    const working = readWorking();
    const downloaded = readDownloaded();
    const name = cleanFileName(
      working?.fileName ||
      pill.querySelector('.file-pill-name')?.textContent ||
      pill.querySelector('.file-pill-title')?.textContent ||
      pill.dataset.cleanFileName ||
      pill.textContent ||
      'Untitled JSON'
    );

    pill.dataset.cleanFileName = name;
    pill.classList.add('file-pill-v13');
    const html = `<span class="file-pill-project">Forever Bound Game</span><span class="file-pill-title">${escapeHtml(name)}</span><span class="file-pill-bottom"><span class="file-pill-action-icons" aria-hidden="true">📁 💾 🏗️</span><span class="file-pill-time">| LOCAL: ${escapeHtml(formatStamp(working?.savedAt))} | HDD: ${escapeHtml(formatStamp(downloaded?.downloadedAt))} |</span></span>`;
    if (pill.dataset.v13Html === html) return;
    pill.dataset.v13Html = html;
    pill.innerHTML = html;
  }

  function convertBasics() {
    const body = document.querySelector('[data-card-id="basics"] .card-body');
    if (!body || body.dataset.v13Layout === 'true') return;
    const sceneId = field('sceneId');
    const sceneName = field('sceneName');
    const sceneType = field('sceneType');
    const bg = field('sceneBg');
    const cols = field('gridCols');
    const rows = field('gridRows');
    const show = document.getElementById('gridShow')?.closest('.check-row') || null;
    if (!sceneId || !sceneName || !sceneType || !bg || !cols || !rows) return;

    const identity = group(1, 'basics-identity-group');
    moveAll(identity, [sceneId, sceneName, sceneType, bg]);

    const grid = group(2, 'basics-grid-group');
    moveAll(grid, [cols, rows]);

    const toggles = group(1, 'basics-toggle-group');
    if (show) toggles.appendChild(cell(show, 'cell-inline'));

    body.innerHTML = '';
    body.append(identity, grid, toggles);
    body.dataset.v13Layout = 'true';
  }

  function convertElements() {
    const body = document.querySelector('[data-card-id="elements"] .card-body');
    if (!body || body.dataset.v13Layout === 'true') return;
    const layerRow = body.querySelector('.layer-control-row');
    const list = body.querySelector('.item-list');
    if (!layerRow || !list) return;

    const controls = group(1, 'elements-controls-group');
    controls.appendChild(cell(layerRow, 'cell-inline'));

    const listGroup = group(1, 'elements-list-group');
    listGroup.appendChild(cell(list));

    body.innerHTML = '';
    body.append(controls, listGroup);
    body.dataset.v13Layout = 'true';
  }

  function convertSelected() {
    const body = document.querySelector('[data-card-id="selected"] .card-body');
    if (!body || body.dataset.v13Layout === 'true') return;
    const id = field('itemId');
    const name = field('itemName');
    const type = field('itemType');
    const image = field('itemImage');
    const text = field('itemText');
    if (!id || !name || !type || !image || !text) return;

    const identity = group(1, 'selected-identity-group');
    moveAll(identity, [id, name, type, image, text]);

    const metrics = body.querySelector('.selected-metrics-grid');
    const tags = field('itemTags');
    const tools = body.querySelector('.selected-bottom-tools');
    const fallbackMetrics = group(3, 'selected-metrics-fallback-group');

    if (!metrics) {
      moveAll(fallbackMetrics, [field('itemX'), field('itemY'), field('itemZ'), field('itemH'), field('itemW'), field('itemLayer')]);
    }

    const tagGroup = group(1, 'selected-tags-group');
    if (tags) tagGroup.appendChild(cell(tags));

    const toolsGroup = group(1, 'selected-tools-layout-group');
    if (tools) toolsGroup.appendChild(cell(tools, 'cell-inline'));

    body.innerHTML = '';
    body.append(identity, divider());
    if (metrics) body.append(metrics);
    else body.append(fallbackMetrics);
    body.append(divider(), tagGroup, toolsGroup);
    cleanEmptyRows(body);
    body.dataset.v13Layout = 'true';
  }

  function patch() {
    queued = false;
    polishFilePill();
    convertBasics();
    convertElements();
    convertSelected();
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
  setInterval(queue, 900);
  queue();
})();
