/*
  GLB Asset Normaliser - browser folder-picker version.
  Static GLB props only. No external libraries.

  What it does:
  - asks the browser for a local folder with read/write permission
  - lists folders and .glb files on the left
  - reads GLB 2.0 files directly in the browser
  - previews sampled POSITION vertices and bounds
  - wraps the original scene in FB_NormalisedRoot
  - offsets original root nodes so the bottom-centre point becomes the origin/pivot
  - applies uniform scale on FB_NormalisedRoot
  - writes copies, overwrites originals, and creates backups through the browser file API
*/

const state = {
  rootHandle: null,
  currentHandle: null,
  stack: [],
  entries: [],
  selectedEntry: null,
  selectedRows: new Map(),
  preview: null,
  analysis: null,
  yaw: -0.65,
  pitch: 0.42,
  zoom: 1,
  activeAxis: 'Z',
  pivotPoint: null,
  previewQuality: 35,
  qualityDebounce: null,
  lastFolderHandle: null,
  dragging: null,
  lastMouse: null,
  lastStarScreen: null,
};

const el = id => document.getElementById(id);
const rootPath = el('rootPath');
const currentFolder = el('currentFolder');
const fileList = el('fileList');
const upBtn = el('upBtn');
const chooseFolderBtn = el('chooseFolderBtn');
const restoreFolderBtn = el('restoreFolderBtn');
const supportNote = el('supportNote');
const fileTitle = el('fileTitle');
const fileSub = el('fileSub');
const scaleInput = el('scaleInput');
const targetModeSelect = el('targetModeSelect');
const targetSizeInput = el('targetSizeInput');
const scaleReadout = el('scaleReadout');
const axisSelect = el('axisSelect');
const backupCheck = el('backupCheck');
const qualitySlider = el('qualitySlider');
const qualityLabel = el('qualityLabel');
const statsBox = el('statsBox');
const logBox = el('logBox');
const canvas = el('previewCanvas');
const ctx = canvas.getContext('2d');
const saveCopyBtn = el('saveCopyBtn');
const overwriteBtn = el('overwriteBtn');
const batchCopyBtn = el('batchCopyBtn');
const batchOverwriteBtn = el('batchOverwriteBtn');

function fmtBytes(bytes) {
  if (!Number.isFinite(bytes)) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function fmtVec(v) {
  if (!Array.isArray(v)) return '—';
  return v.map(n => Number(n).toFixed(4)).join(', ');
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}

function log(message, type = '') {
  const line = document.createElement('div');
  if (type) line.className = type;
  line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
  logBox.prepend(line);
}

function assertFolderPickerSupport() {
  if (!('showDirectoryPicker' in window)) {
    supportNote.classList.add('bad');
    supportNote.textContent = 'This browser does not expose showDirectoryPicker(). Use current Chrome or Edge.';
    chooseFolderBtn.disabled = true;
    return false;
  }
  supportNote.textContent = 'Chrome or Edge recommended. The browser will ask for read/write permission.';
  return true;
}

const DB_NAME = 'fb-glb-asset-normaliser';
const DB_STORE = 'handles';
const LAST_FOLDER_ID = 'last-folder-handle';
const LAST_FOLDER_NAME_KEY = 'fbGlbLastFolderName';
const TARGET_MODE_KEY = 'fbGlbTargetMode';
const TARGET_SIZE_KEY = 'fbGlbTargetSize';
const MANUAL_SCALE_KEY = 'fbGlbManualRootScale';

function openHandleDb() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(DB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open local folder memory.'));
  });
}

async function putStoredHandle(key, handle) {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readwrite');
    tx.objectStore(DB_STORE).put(handle, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Could not remember the folder handle.'));
  });
}

async function getStoredHandle(key) {
  const db = await openHandleDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(DB_STORE, 'readonly');
    const request = tx.objectStore(DB_STORE).get(key);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error || new Error('Could not read remembered folder handle.'));
  });
}

async function rememberFolderHandle(handle) {
  try {
    await putStoredHandle(LAST_FOLDER_ID, handle);
    localStorage.setItem(LAST_FOLDER_NAME_KEY, handle.name || 'Selected folder');
    state.lastFolderHandle = handle;
    restoreFolderBtn.disabled = false;
  } catch (err) {
    log(`Could not remember folder: ${err.message || String(err)}`, 'bad');
  }
}

async function initialiseRememberedFolder() {
  const rememberedName = localStorage.getItem(LAST_FOLDER_NAME_KEY);
  if (rememberedName) {
    rootPath.textContent = `Last folder: ${rememberedName}`;
    restoreFolderBtn.disabled = false;
  }

  try {
    const handle = await getStoredHandle(LAST_FOLDER_ID);
    if (!handle) return;
    state.lastFolderHandle = handle;
    restoreFolderBtn.disabled = false;
    const permission = await handle.queryPermission({ mode: 'readwrite' });
    if (permission === 'granted') {
      await openFolderHandle(handle, { remembered: true });
    } else {
      supportNote.textContent = `Last folder remembered: ${handle.name}. Click Restore last folder to grant access again.`;
    }
  } catch (err) {
    log(`Could not restore remembered folder: ${err.message || String(err)}`, 'bad');
  }
}

async function openFolderHandle(handle, options = {}) {
  const ok = await verifyPermission(handle, true);
  if (!ok) throw new Error('The folder was selected, but read/write permission was not granted.');
  state.rootHandle = handle;
  state.currentHandle = handle;
  state.stack = [{ name: handle.name || 'Selected folder', handle }];
  rootPath.textContent = handle.name || 'Selected folder';
  await rememberFolderHandle(handle);
  clearSelection();
  await loadCurrentFolder();
  log(options.remembered ? `Restored folder: ${handle.name}` : `Folder selected: ${handle.name}`, 'ok');
}

async function restoreRememberedFolder() {
  try {
    const handle = state.lastFolderHandle || await getStoredHandle(LAST_FOLDER_ID);
    if (!handle) throw new Error('No remembered folder found yet. Choose a GLB folder first.');
    await openFolderHandle(handle, { remembered: true });
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    log(err.message || String(err), 'bad');
  }
}

async function verifyPermission(handle, write) {
  const options = { mode: write ? 'readwrite' : 'read' };
  if ((await handle.queryPermission(options)) === 'granted') return true;
  return (await handle.requestPermission(options)) === 'granted';
}

async function chooseFolder() {
  try {
    if (!assertFolderPickerSupport()) return;
    const handle = await window.showDirectoryPicker({
      id: 'forever-bound-glb-normaliser',
      mode: 'readwrite',
      startIn: 'documents',
    });
    await openFolderHandle(handle);
  } catch (err) {
    if (err && err.name === 'AbortError') return;
    log(err.message || String(err), 'bad');
  }
}

function getCurrentPath() {
  if (!state.stack.length) return '/';
  const parts = state.stack.slice(1).map(x => x.name);
  return parts.length ? `/${parts.join('/')}` : '/';
}

function pathForName(name) {
  const base = getCurrentPath();
  return `${base === '/' ? '' : base}/${name}`;
}

async function loadCurrentFolder() {
  if (!state.currentHandle) {
    fileList.innerHTML = '<div class="empty-list">Click “Choose GLB Folder” to load a local folder from your HDD.</div>';
    currentFolder.textContent = '/';
    upBtn.disabled = true;
    return;
  }

  currentFolder.textContent = getCurrentPath();
  upBtn.disabled = state.stack.length <= 1;
  fileList.innerHTML = '';
  state.selectedRows.clear();
  updateBatchButtons();

  const entries = [];
  for await (const [name, handle] of state.currentHandle.entries()) {
    if (name.startsWith('.')) continue;
    if (handle.kind === 'directory') {
      entries.push({ name, type: 'dir', handle, path: pathForName(name) });
    } else if (/\.glb$/i.test(name)) {
      let size = 0;
      let mtime = 0;
      try {
        const file = await handle.getFile();
        size = file.size;
        mtime = file.lastModified;
      } catch {
        // Keep listing even if metadata fails.
      }
      entries.push({ name, type: 'file', handle, parentHandle: state.currentHandle, path: pathForName(name), size, mtime });
    }
  }

  entries.sort((a, b) => {
    if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
    return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
  });

  state.entries = entries;
  if (!entries.length) {
    fileList.innerHTML = '<div class="empty-list">No folders or .glb files found here.</div>';
    return;
  }

  for (const entry of entries) {
    const row = document.createElement('div');
    row.className = 'file-row';
    if (state.selectedEntry && entry.path === state.selectedEntry.path) row.classList.add('active');

    if (entry.type === 'dir') {
      row.innerHTML = `<div class="folder-icon">▸</div><div><div class="name">${escapeHtml(entry.name)}</div><div class="meta">folder</div></div>`;
      row.addEventListener('click', async () => {
        state.stack.push({ name: entry.name, handle: entry.handle });
        state.currentHandle = entry.handle;
        await loadCurrentFolder();
      });
    } else {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.addEventListener('click', (ev) => {
        ev.stopPropagation();
        if (checkbox.checked) state.selectedRows.set(entry.path, entry);
        else state.selectedRows.delete(entry.path);
        updateBatchButtons();
      });
      const info = document.createElement('div');
      info.innerHTML = `<div class="name"><span class="file-icon">◆</span> ${escapeHtml(entry.name)}</div><div class="meta">${fmtBytes(entry.size)}</div>`;
      row.appendChild(checkbox);
      row.appendChild(info);
      row.addEventListener('click', () => selectFile(entry));
    }
    fileList.appendChild(row);
  }
}

async function goUp() {
  if (state.stack.length <= 1) return;
  state.stack.pop();
  state.currentHandle = state.stack[state.stack.length - 1].handle;
  await loadCurrentFolder();
}

function clearSelection() {
  state.selectedEntry = null;
  state.selectedRows.clear();
  state.preview = null;
  state.analysis = null;
  state.pivotPoint = null;
  fileTitle.textContent = 'Choose a .glb file';
  fileSub.textContent = 'Static props only. Save copy first, then overwrite once tested.';
  statsBox.className = 'stats empty';
  statsBox.textContent = 'No file selected.';
  saveCopyBtn.disabled = true;
  overwriteBtn.disabled = true;
  updateScaleReadout();
  updateBatchButtons();
  drawPreview();
}

async function readEntryBuffer(entry) {
  const file = await entry.handle.getFile();
  const arrayBuffer = await file.arrayBuffer();
  return { file, arrayBuffer };
}

async function selectFile(entry, options = {}) {
  try {
    state.selectedEntry = entry;
    fileTitle.textContent = entry.name;
    fileSub.textContent = entry.path;
    statsBox.className = 'stats empty';
    statsBox.textContent = 'Loading…';
    saveCopyBtn.disabled = true;
    overwriteBtn.disabled = true;

    const previousPivot = Array.isArray(state.pivotPoint) ? state.pivotPoint.slice() : null;
    const { file, arrayBuffer } = await readEntryBuffer(entry);
    const analysis = analyseArrayBuffer(entry.name, entry.path, file.size, arrayBuffer, getPreviewOptions());
    state.analysis = analysis;
    state.preview = analysis;
    state.pivotPoint = options.preservePivot && previousPivot ? previousPivot : analysis.bbox.bottomCenter.slice();
    renderStats(analysis);
    if (options.preserveView) drawPreview();
    else fitView();
    saveCopyBtn.disabled = false;
    overwriteBtn.disabled = false;
    if (!options.quiet) log(`Opened ${entry.path}`, 'ok');
    await loadCurrentFolder();
  } catch (err) {
    log(err.message || String(err), 'bad');
    statsBox.className = 'stats empty';
    statsBox.textContent = err.message || String(err);
  }
}

function renderStats(data) {
  const warnings = (data.warnings || []).map(w => `<div class="warning">⚠ ${escapeHtml(w)}</div>`).join('');
  const previewModeText = data.renderMode === 'solid'
    ? 'solid (' + (data.counts.previewTriangles || 0).toLocaleString() + ' / ' + (data.counts.totalTriangles || 0).toLocaleString() + ' triangles)'
    : 'points (' + (data.counts.previewVertices || 0).toLocaleString() + ' shown)';
  const normalisedText = data.normalisedRoot?.found ? 'yes, scale ' + fmtVec(data.normalisedRoot.scale) : 'no';
  statsBox.className = 'stats';
  statsBox.innerHTML = `
    ${row('File size', fmtBytes(data.bytes))}
    ${row('Vertices', data.counts.vertices.toLocaleString())}
    ${row('Preview mode', previewModeText)}
    ${row('Meshes', data.counts.meshes)}
    ${row('Mesh nodes', data.counts.meshNodes)}
    ${row('Materials', data.counts.materials)}
    ${row('Images', data.counts.images)}
    ${row('Textured primitives', data.counts.texturedPrimitives || 0)}
    ${row('Animations', data.counts.animations)}
    ${row('Skins', data.counts.skins)}
    ${row('Bounds size', fmtVec(data.bbox.size))}
    ${row('World size', formatSizeLine(data, true))}
    ${row('Scale plan', currentScalePlanLabel(data))}
    ${row('After save size', formatAfterSaveLine(data))}
    ${row('Bottom centre', fmtVec(data.bbox.bottomCenter))}
    ${row('Pivot star', fmtVec(state.pivotPoint || data.bbox.bottomCenter))}
    ${row('Normalised root', normalisedText)}
    ${warnings}
  `;
  updateScaleReadout();
}

function row(label, value) {
  return `<div class="stat-row"><span>${escapeHtml(label)}</span><span>${escapeHtml(value)}</span></div>`;
}

function getPreviewQuality() {
  const q = Number(qualitySlider?.value || state.previewQuality || 35);
  return Math.max(1, Math.min(100, Number.isFinite(q) ? q : 35));
}

function qualityToMaxVertices(q) {
  if (q >= 100) return 120000;
  return Math.round(500 + Math.pow(q / 100, 2.15) * 80000);
}

function qualityToMaxTriangles(q) {
  if (q >= 100) return 90000;
  return Math.round(5000 + Math.pow(q / 100, 2) * 50000);
}

function getPreviewOptions() {
  const q = getPreviewQuality();
  return {
    axis: axisSelect.value,
    maxPreviewVertices: qualityToMaxVertices(q),
    includeTriangles: q >= 100,
    maxPreviewTriangles: qualityToMaxTriangles(q),
    quality: q,
  };
}

function updateQualityLabel() {
  const q = getPreviewQuality();
  state.previewQuality = q;
  const mode = q >= 100 ? 'solid mesh render' : 'point cloud';
  const detail = q >= 100 ? `up to ${qualityToMaxTriangles(q).toLocaleString()} triangles` : `up to ${qualityToMaxVertices(q).toLocaleString()} points`;
  qualityLabel.textContent = `${q} · ${mode} · ${detail}`;
}

async function refreshSelectedForQuality() {
  updateQualityLabel();
  if (!state.selectedEntry) {
    drawPreview();
    return;
  }
  clearTimeout(state.qualityDebounce);
  state.qualityDebounce = setTimeout(async () => {
    try {
      await selectFile(state.selectedEntry, { preservePivot: true, preserveView: true, quiet: true });
    } catch (err) {
      log(err.message || String(err), 'bad');
    }
  }, 180);
}

function axisDimensionMap(axis) {
  if (axis === 'Z') return { height: 2, width: 0, depth: 1, labels: ['X width', 'Y depth', 'Z height'] };
  if (axis === 'X') return { height: 0, width: 1, depth: 2, labels: ['X height', 'Y width', 'Z depth'] };
  return { height: 1, width: 0, depth: 2, labels: ['X width', 'Y height', 'Z depth'] };
}

function uniformRootScale(data) {
  const scale = data?.normalisedRoot?.found ? data.normalisedRoot.scale : null;
  if (!Array.isArray(scale) || scale.length < 3) return 1;
  const values = scale.map(Number).filter(Number.isFinite);
  if (values.length < 3) return 1;
  if (Math.abs(values[0] - values[1]) > 1e-8 || Math.abs(values[0] - values[2]) > 1e-8) return 1;
  return values[0] > 0 ? values[0] : 1;
}

function selectedTargetMode() {
  return targetModeSelect?.value || 'height';
}

function selectedTargetSize() {
  const value = Number(targetSizeInput?.value);
  if (!Number.isFinite(value) || value <= 0) throw new Error('Target size must be a positive number.');
  return value;
}

function dimensionForMode(data, mode) {
  const size = data?.bbox?.size || [0, 0, 0];
  const map = axisDimensionMap(axisSelect.value);
  if (mode === 'width') return size[map.width];
  if (mode === 'depth') return size[map.depth];
  if (mode === 'longest') return Math.max(size[0], size[1], size[2]);
  return size[map.height];
}

function scalePlanForData(data) {
  const mode = selectedTargetMode();
  const existingRoot = uniformRootScale(data);
  if (mode === 'manual') {
    const rootScale = Number(scaleInput.value);
    if (!Number.isFinite(rootScale) || rootScale <= 0) throw new Error('Root scale must be a positive number.');
    return { mode, existingRoot, rootScale, relativeScale: rootScale / existingRoot, target: null, currentDim: null };
  }

  const target = selectedTargetSize();
  const currentDim = dimensionForMode(data, mode);
  if (!Number.isFinite(currentDim) || currentDim <= 0) throw new Error('Could not calculate this asset dimension.');
  const rootScale = existingRoot * (target / currentDim);
  return { mode, existingRoot, rootScale, relativeScale: rootScale / existingRoot, target, currentDim };
}

function getScaleForData(data) {
  const plan = scalePlanForData(data);
  return plan.rootScale;
}

function currentScalePlanLabel(data) {
  if (!data?.bbox) return '—';
  try {
    const plan = scalePlanForData(data);
    if (plan.mode === 'manual') return `write root scale ${formatNumber(plan.rootScale)} (${formatNumber(plan.relativeScale)}× current)`;
    return `${plan.mode} ${formatNumber(plan.currentDim)}m → ${formatNumber(plan.target)}m; root scale ${formatNumber(plan.rootScale)}`;
  } catch (err) {
    return err.message || String(err);
  }
}

function formatNumber(value, digits = 4) {
  if (!Number.isFinite(value)) return '—';
  const fixed = Number(value).toFixed(digits);
  return fixed.replace(/\.?0+$/, '');
}

function formatSizeLine(data, includeLabels = false) {
  if (!data?.bbox?.size) return '—';
  const labels = axisDimensionMap(axisSelect.value).labels;
  return data.bbox.size.map((v, i) => includeLabels ? `${labels[i]} ${formatNumber(v)}m` : `${formatNumber(v)}m`).join(' / ');
}

function formatAfterSaveLine(data) {
  if (!data?.bbox?.size) return '—';
  try {
    const plan = scalePlanForData(data);
    const after = data.bbox.size.map(v => v * plan.relativeScale);
    const labels = axisDimensionMap(axisSelect.value).labels;
    return after.map((v, i) => `${labels[i]} ${formatNumber(v)}m`).join(' / ');
  } catch (err) {
    return err.message || String(err);
  }
}

function updateScaleReadout() {
  if (!scaleReadout) return;
  const data = state.analysis;
  const manual = selectedTargetMode() === 'manual';
  if (targetSizeInput) targetSizeInput.disabled = manual;
  if (scaleInput) scaleInput.readOnly = !manual;
  if (!data?.bbox) {
    scaleReadout.textContent = manual
      ? 'Manual mode: type the root scale to write.'
      : 'Current size appears after a GLB is selected. Default app unit: 1 metre.';
    return;
  }

  try {
    const plan = scalePlanForData(data);
    if (!manual && scaleInput) scaleInput.value = formatNumber(plan.rootScale, 6);
    const modeText = manual ? 'manual root scale' : `${plan.mode} target`;
    scaleReadout.innerHTML = `<strong>Current:</strong> ${escapeHtml(formatSizeLine(data, true))} &nbsp; | &nbsp; <strong>${escapeHtml(modeText)}:</strong> ${escapeHtml(currentScalePlanLabel(data))} &nbsp; | &nbsp; <strong>After save:</strong> ${escapeHtml(formatAfterSaveLine(data))}`;
  } catch (err) {
    scaleReadout.textContent = err.message || String(err);
  }
}

function pivotForSave(data, pivotPoint) {
  if (!Array.isArray(pivotPoint)) return null;
  const existingRoot = uniformRootScale(data);
  if (!data?.normalisedRoot?.found || Math.abs(existingRoot - 1) < 1e-12) return pivotPoint.slice();
  return pivotPoint.map(v => v / existingRoot);
}

function normalisedCopyName(name) {
  return name.replace(/\.glb$/i, '.normalised.glb');
}

function backupName(name) {
  return name.replace(/\.glb$/i, `.bak-${timestampForFile()}.glb`);
}

async function writeFileHandle(fileHandle, bytes) {
  const writable = await fileHandle.createWritable();
  await writable.write(new Blob([bytes], { type: 'model/gltf-binary' }));
  await writable.close();
}

async function save(mode) {
  try {
    if (!state.selectedEntry) throw new Error('No GLB selected.');
    const entry = state.selectedEntry;
    const { arrayBuffer } = await readEntryBuffer(entry);
    const originalBytes = new Uint8Array(arrayBuffer.slice(0));
    const result = normaliseArrayBuffer(arrayBuffer, { scale: getScaleForData(state.analysis), axis: axisSelect.value, pivotPoint: pivotForSave(state.analysis, state.pivotPoint) });

    if (mode === 'copy') {
      const outName = normalisedCopyName(entry.name);
      const outHandle = await entry.parentHandle.getFileHandle(outName, { create: true });
      await writeFileHandle(outHandle, result.bytes);
      log(`Saved copy: ${outName}`, 'ok');
    } else if (mode === 'overwrite') {
      if (backupCheck.checked) {
        const bakName = backupName(entry.name);
        const bakHandle = await entry.parentHandle.getFileHandle(bakName, { create: true });
        await writeFileHandle(bakHandle, originalBytes);
        log(`Backup created: ${bakName}`, 'ok');
      }
      await writeFileHandle(entry.handle, result.bytes);
      log(`Overwrote original: ${entry.name}`, 'ok');
    } else {
      throw new Error(`Unknown save mode: ${mode}`);
    }

    log(`Shift applied: ${fmtVec(result.result.shift)} | scale ${result.result.scale}`, 'ok');
    await loadCurrentFolder();
    if (mode === 'overwrite') {
      const refreshed = state.entries.find(e => e.type === 'file' && e.name === entry.name);
      if (refreshed) await selectFile(refreshed);
    }
  } catch (err) {
    log(err.message || String(err), 'bad');
  }
}

async function batch(mode) {
  try {
    const entries = [...state.selectedRows.values()];
    if (!entries.length) throw new Error('No GLBs checked in the left list.');
    const axis = axisSelect.value;

    for (const entry of entries) {
      try {
        const { arrayBuffer } = await readEntryBuffer(entry);
        const originalBytes = new Uint8Array(arrayBuffer.slice(0));
        const batchAnalysis = analyseArrayBuffer(entry.name, entry.path, originalBytes.byteLength, arrayBuffer, { maxPreviewVertices: 1, axis });
        const result = normaliseArrayBuffer(arrayBuffer, { scale: getScaleForData(batchAnalysis), axis });

        if (mode === 'copy') {
          const outName = normalisedCopyName(entry.name);
          const outHandle = await entry.parentHandle.getFileHandle(outName, { create: true });
          await writeFileHandle(outHandle, result.bytes);
          log(`Batch copy OK: ${entry.name} → ${outName}`, 'ok');
        } else if (mode === 'overwrite') {
          if (backupCheck.checked) {
            const bakName = backupName(entry.name);
            const bakHandle = await entry.parentHandle.getFileHandle(bakName, { create: true });
            await writeFileHandle(bakHandle, originalBytes);
          }
          await writeFileHandle(entry.handle, result.bytes);
          log(`Batch overwrite OK: ${entry.name}`, 'ok');
        }
      } catch (err) {
        log(`Batch FAILED: ${entry.name} → ${err.message || String(err)}`, 'bad');
      }
    }
    await loadCurrentFolder();
  } catch (err) {
    log(err.message || String(err), 'bad');
  }
}

function updateBatchButtons() {
  const enabled = state.selectedRows.size > 0;
  batchCopyBtn.disabled = !enabled;
  batchOverwriteBtn.disabled = !enabled;
}

function timestampForFile() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function analyseArrayBuffer(fileName, filePath, bytes, arrayBuffer, previewOptions = {}) {
  const parsed = parseGLB(arrayBuffer);
  const bin = getBinChunk(parsed);
  if (!bin) throw new Error('GLB has no embedded BIN chunk.');
  const stats = computeStatsAndPreview(parsed.json, bin, previewOptions);
  const warnings = [];
  if (stats.counts.animations > 0) warnings.push('Animations detected. This tool is intended for static assets.');
  if (stats.counts.skins > 0) warnings.push('Skins detected. This tool is intended for non-skinned static assets.');
  if (stats.counts.skippedPrimitives > 0) warnings.push(`${stats.counts.skippedPrimitives} primitive(s) could not be inspected.`);
  return { file: fileName, path: filePath, bytes, ...stats, warnings };
}

function normaliseArrayBuffer(arrayBuffer, options) {
  const parsed = parseGLB(arrayBuffer);
  const bin = getBinChunk(parsed);
  if (!bin) throw new Error('GLB has no embedded BIN chunk.');
  const warnings = [];
  if (parsed.json.animations?.length) warnings.push('Animations detected. This file was still processed, but static assets are safer.');
  if (parsed.json.skins?.length) warnings.push('Skins detected. This file was still processed, but static assets are safer.');
  const result = ensureNormalisedRootAndApply(parsed.json, bin, options);
  const bytes = writeGLB(parsed.json, parsed.chunks);
  return { bytes, result, warnings };
}

function parseGLB(arrayBuffer) {
  const bytes = arrayBuffer instanceof Uint8Array ? arrayBuffer : new Uint8Array(arrayBuffer);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.byteLength < 20) throw new Error('File is too small to be a GLB.');
  const magic = view.getUint32(0, true);
  const version = view.getUint32(4, true);
  const totalLength = view.getUint32(8, true);
  if (magic !== 0x46546c67) throw new Error('Not a GLB file. Magic header does not match glTF.');
  if (version !== 2) throw new Error(`Unsupported GLB version ${version}. This tool expects GLB 2.0.`);
  if (totalLength > bytes.byteLength) throw new Error('GLB declares a longer length than the file contains.');

  const chunks = [];
  let json = null;
  let offset = 12;
  while (offset + 8 <= totalLength) {
    const chunkLength = view.getUint32(offset, true);
    const chunkType = view.getUint32(offset + 4, true);
    const chunkStart = offset + 8;
    const chunkEnd = chunkStart + chunkLength;
    if (chunkEnd > bytes.byteLength) throw new Error('GLB chunk extends beyond file length.');
    const data = bytes.slice(chunkStart, chunkEnd);
    chunks.push({ type: chunkType, data });
    if (chunkType === 0x4e4f534a) {
      const text = new TextDecoder('utf-8').decode(data).replace(/[\u0000\u0020\t\r\n]+$/g, '');
      json = JSON.parse(text);
    }
    offset = chunkEnd;
  }
  if (!json) throw new Error('GLB does not contain a JSON chunk.');
  return { json, chunks };
}

function pad4(bytes, padByte = 0x20) {
  const mod = bytes.length % 4;
  if (mod === 0) return bytes;
  const out = new Uint8Array(bytes.length + (4 - mod));
  out.set(bytes, 0);
  out.fill(padByte, bytes.length);
  return out;
}

function writeGLB(json, originalChunks) {
  const jsonBytes = pad4(new TextEncoder().encode(JSON.stringify(json)), 0x20);
  const chunks = [{ type: 0x4e4f534a, data: jsonBytes }];
  for (const chunk of originalChunks) {
    if (chunk.type === 0x4e4f534a) continue;
    chunks.push({ type: chunk.type, data: pad4(chunk.data, 0x00) });
  }
  const totalLength = 12 + chunks.reduce((sum, chunk) => sum + 8 + chunk.data.length, 0);
  const out = new Uint8Array(totalLength);
  const view = new DataView(out.buffer);
  view.setUint32(0, 0x46546c67, true);
  view.setUint32(4, 2, true);
  view.setUint32(8, totalLength, true);
  let offset = 12;
  for (const chunk of chunks) {
    view.setUint32(offset, chunk.data.length, true);
    view.setUint32(offset + 4, chunk.type, true);
    out.set(chunk.data, offset + 8);
    offset += 8 + chunk.data.length;
  }
  return out;
}

function getBinChunk(parsed) {
  const bin = parsed.chunks.find(c => c.type === 0x004e4942);
  return bin ? bin.data : null;
}

function componentSize(componentType) {
  switch (componentType) {
    case 5120:
    case 5121:
      return 1;
    case 5122:
    case 5123:
      return 2;
    case 5125:
    case 5126:
      return 4;
    default:
      throw new Error(`Unsupported accessor component type ${componentType}.`);
  }
}

function numComponents(type) {
  switch (type) {
    case 'SCALAR': return 1;
    case 'VEC2': return 2;
    case 'VEC3': return 3;
    case 'VEC4': return 4;
    case 'MAT2': return 4;
    case 'MAT3': return 9;
    case 'MAT4': return 16;
    default: throw new Error(`Unsupported accessor type ${type}.`);
  }
}

function readComponent(view, offset, componentType) {
  switch (componentType) {
    case 5120: return view.getInt8(offset);
    case 5121: return view.getUint8(offset);
    case 5122: return view.getInt16(offset, true);
    case 5123: return view.getUint16(offset, true);
    case 5125: return view.getUint32(offset, true);
    case 5126: return view.getFloat32(offset, true);
    default: throw new Error(`Unsupported component type ${componentType}.`);
  }
}

function getAccessorReader(json, bin, accessorIndex) {
  const accessor = json.accessors?.[accessorIndex];
  if (!accessor) throw new Error(`Missing accessor ${accessorIndex}.`);
  const viewDef = json.bufferViews?.[accessor.bufferView];
  if (!viewDef) throw new Error(`Accessor ${accessorIndex} has no bufferView.`);
  if (viewDef.buffer && viewDef.buffer !== 0) throw new Error('This tool currently expects embedded GLB binary buffer 0.');
  const compSize = componentSize(accessor.componentType);
  const comps = numComponents(accessor.type);
  const stride = viewDef.byteStride || (compSize * comps);
  const baseOffset = (viewDef.byteOffset || 0) + (accessor.byteOffset || 0);
  const dataView = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);

  return {
    accessor,
    viewDef,
    count: accessor.count || 0,
    comps,
    read(index) {
      const p = baseOffset + index * stride;
      const out = [];
      for (let c = 0; c < comps; c++) {
        out.push(readComponent(dataView, p + c * compSize, accessor.componentType));
      }
      return out;
    },
  };
}

function mat4Identity() {
  return [1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1];
}

function mat4Translation(x, y, z) {
  return [1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1];
}

function mat4Scale(x, y, z) {
  return [x,0,0,0, 0,y,0,0, 0,0,z,0, 0,0,0,1];
}

function mat4FromQuat(q) {
  const [x, y, z, w] = q;
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;
  return [
    1 - (yy + zz), xy + wz, xz - wy, 0,
    xy - wz, 1 - (xx + zz), yz + wx, 0,
    xz + wy, yz - wx, 1 - (xx + yy), 0,
    0, 0, 0, 1,
  ];
}

function mat4Multiply(a, b) {
  const out = new Array(16).fill(0);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] =
        a[0 * 4 + row] * b[col * 4 + 0] +
        a[1 * 4 + row] * b[col * 4 + 1] +
        a[2 * 4 + row] * b[col * 4 + 2] +
        a[3 * 4 + row] * b[col * 4 + 3];
    }
  }
  return out;
}

function nodeLocalMatrix(node, overrideScale) {
  if (Array.isArray(node.matrix) && node.matrix.length === 16) return node.matrix.slice();
  const t = node.translation || [0, 0, 0];
  const r = node.rotation || [0, 0, 0, 1];
  const s = overrideScale || node.scale || [1, 1, 1];
  return mat4Multiply(mat4Multiply(mat4Translation(t[0], t[1], t[2]), mat4FromQuat(r)), mat4Scale(s[0], s[1], s[2]));
}

function transformPoint(m, p) {
  const x = p[0], y = p[1], z = p[2];
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}

function detectNormalisedRoot(json, scene) {
  const nodes = scene?.nodes || [];
  if (nodes.length !== 1) return null;
  const idx = nodes[0];
  const node = json.nodes?.[idx];
  if (!node || node.name !== 'FB_NormalisedRoot') return null;
  return { index: idx, node };
}

function getScene(json) {
  const sceneIndex = Number.isInteger(json.scene) ? json.scene : 0;
  const scene = json.scenes?.[sceneIndex];
  if (!scene) throw new Error('GLB has no readable scene.');
  if (!Array.isArray(scene.nodes) || scene.nodes.length === 0) throw new Error('Scene has no root nodes.');
  return { sceneIndex, scene };
}

function getIndexReader(json, bin, accessorIndex) {
  if (!Number.isInteger(accessorIndex)) return null;
  const reader = getAccessorReader(json, bin, accessorIndex);
  if (reader.comps !== 1) throw new Error('Index accessor is not SCALAR.');
  return {
    count: reader.count,
    read(index) { return reader.read(index)[0]; },
  };
}

function primitiveBaseColor(json, primitive) {
  const material = Number.isInteger(primitive.material) ? json.materials?.[primitive.material] : null;
  const pbr = material?.pbrMetallicRoughness || {};
  const factor = Array.isArray(pbr.baseColorFactor) ? pbr.baseColorFactor : [0.78, 0.72, 0.62, 1];
  return {
    r: Math.max(0, Math.min(255, Math.round((factor[0] ?? 0.78) * 255))),
    g: Math.max(0, Math.min(255, Math.round((factor[1] ?? 0.72) * 255))),
    b: Math.max(0, Math.min(255, Math.round((factor[2] ?? 0.62) * 255))),
    a: Math.max(0.08, Math.min(1, factor[3] ?? 1)),
    hasTexture: Number.isInteger(pbr.baseColorTexture?.index),
    alphaMode: material?.alphaMode || 'OPAQUE',
  };
}

function computeStatsAndPreview(json, bin, options = {}) {
  const maxPreviewVertices = options.maxPreviewVertices || 9000;
  const includeTriangles = !!options.includeTriangles;
  const maxPreviewTriangles = options.maxPreviewTriangles || 60000;
  const quality = options.quality || 35;
  const axis = options.axis || 'Y';
  const { scene } = getScene(json);
  const normalisedRoot = detectNormalisedRoot(json, scene);
  const preview = [];
  const triangles = [];
  const bbox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  let vertexTotal = 0;
  let totalTriangleCount = 0;
  let vertexCount = 0;
  let primitiveCount = 0;
  let meshNodeCount = 0;
  let skippedPrimitives = 0;
  let texturedPrimitiveCount = 0;
  let sampleEvery = 1;
  let triangleEvery = 1;
  let triangleSerial = 0;

  function inspectNode(nodeIndex) {
    const node = json.nodes?.[nodeIndex];
    if (!node) return;
    if (Number.isInteger(node.mesh)) {
      const mesh = json.meshes?.[node.mesh];
      for (const primitive of mesh?.primitives || []) {
        const posIdx = primitive.attributes?.POSITION;
        if (Number.isInteger(posIdx)) {
          const accessor = json.accessors?.[posIdx];
          if (accessor?.count) {
            vertexTotal += accessor.count;
            const mode = primitive.mode ?? 4;
            if (mode === 4) {
              if (Number.isInteger(primitive.indices)) {
                const idxAccessor = json.accessors?.[primitive.indices];
                totalTriangleCount += Math.floor((idxAccessor?.count || 0) / 3);
              } else {
                totalTriangleCount += Math.floor(accessor.count / 3);
              }
            }
          }
        }
        const color = primitiveBaseColor(json, primitive);
        if (color.hasTexture) texturedPrimitiveCount++;
      }
    }
    for (const child of node.children || []) inspectNode(child);
  }

  for (const n of scene.nodes || []) inspectNode(n);
  sampleEvery = Math.max(1, Math.ceil(vertexTotal / maxPreviewVertices));
  triangleEvery = Math.max(1, Math.ceil(totalTriangleCount / maxPreviewTriangles));

  function visit(nodeIndex, parentMatrix) {
    const node = json.nodes?.[nodeIndex];
    if (!node) return;
    const local = nodeLocalMatrix(node);
    const world = mat4Multiply(parentMatrix, local);

    if (Number.isInteger(node.mesh)) {
      meshNodeCount++;
      const mesh = json.meshes?.[node.mesh];
      for (const primitive of mesh?.primitives || []) {
        primitiveCount++;
        const posIdx = primitive.attributes?.POSITION;
        if (!Number.isInteger(posIdx)) {
          skippedPrimitives++;
          continue;
        }
        try {
          const reader = getAccessorReader(json, bin, posIdx);
          for (let i = 0; i < reader.count; i++) {
            const localPosition = reader.read(i);
            if (localPosition.length < 3) continue;
            const p = transformPoint(world, localPosition);
            bbox.min[0] = Math.min(bbox.min[0], p[0]);
            bbox.min[1] = Math.min(bbox.min[1], p[1]);
            bbox.min[2] = Math.min(bbox.min[2], p[2]);
            bbox.max[0] = Math.max(bbox.max[0], p[0]);
            bbox.max[1] = Math.max(bbox.max[1], p[1]);
            bbox.max[2] = Math.max(bbox.max[2], p[2]);
            if (vertexCount % sampleEvery === 0) preview.push(roundPoint(p));
            vertexCount++;
          }

          if (includeTriangles && (primitive.mode ?? 4) === 4) {
            const idxReader = getIndexReader(json, bin, primitive.indices);
            const color = primitiveBaseColor(json, primitive);
            const makeTri = (i0, i1, i2) => {
              triangleSerial++;
              if ((triangleSerial - 1) % triangleEvery !== 0) return;
              const a = transformPoint(world, reader.read(i0));
              const b = transformPoint(world, reader.read(i1));
              const c = transformPoint(world, reader.read(i2));
              triangles.push({ a: roundPoint(a), b: roundPoint(b), c: roundPoint(c), color });
            };
            if (idxReader) {
              for (let i = 0; i + 2 < idxReader.count; i += 3) {
                makeTri(idxReader.read(i), idxReader.read(i + 1), idxReader.read(i + 2));
              }
            } else {
              for (let i = 0; i + 2 < reader.count; i += 3) makeTri(i, i + 1, i + 2);
            }
          }
        } catch {
          skippedPrimitives++;
        }
      }
    }
    for (const child of node.children || []) visit(child, world);
  }

  for (const n of scene.nodes || []) visit(n, mat4Identity());
  if (!Number.isFinite(bbox.min[0])) throw new Error('No readable POSITION geometry found in this GLB.');

  const size = [bbox.max[0] - bbox.min[0], bbox.max[1] - bbox.min[1], bbox.max[2] - bbox.min[2]];
  const center = [(bbox.min[0] + bbox.max[0]) / 2, (bbox.min[1] + bbox.max[1]) / 2, (bbox.min[2] + bbox.max[2]) / 2];
  const bottomCenter = bottomCenterForAxis(bbox, axis);

  return {
    bbox: { min: roundPoint(bbox.min), max: roundPoint(bbox.max), size: roundPoint(size), center: roundPoint(center), bottomCenter: roundPoint(bottomCenter) },
    preview,
    triangles,
    renderMode: includeTriangles ? 'solid' : 'points',
    renderQuality: quality,
    counts: {
      vertices: vertexCount,
      previewVertices: preview.length,
      totalTriangles: totalTriangleCount,
      previewTriangles: triangles.length,
      meshes: json.meshes?.length || 0,
      meshNodes: meshNodeCount,
      primitives: primitiveCount,
      skippedPrimitives,
      texturedPrimitives: texturedPrimitiveCount,
      nodes: json.nodes?.length || 0,
      materials: json.materials?.length || 0,
      images: json.images?.length || 0,
      animations: json.animations?.length || 0,
      skins: json.skins?.length || 0,
    },
    normalisedRoot: normalisedRoot ? {
      found: true,
      scale: normalisedRoot.node.scale || [1, 1, 1],
      children: normalisedRoot.node.children || [],
    } : { found: false },
  };
}

function bottomCenterForAxis(bbox, axis) {
  if (axis === 'Z') return [(bbox.min[0] + bbox.max[0]) / 2, (bbox.min[1] + bbox.max[1]) / 2, bbox.min[2]];
  if (axis === 'X') return [bbox.min[0], (bbox.min[1] + bbox.max[1]) / 2, (bbox.min[2] + bbox.max[2]) / 2];
  return [(bbox.min[0] + bbox.max[0]) / 2, bbox.min[1], (bbox.min[2] + bbox.max[2]) / 2];
}

function roundPoint(p) {
  return p.map(v => Math.abs(v) < 1e-10 ? 0 : Number(v.toFixed(6)));
}

function setNodeMatrix(node, matrix) {
  node.matrix = matrix.map(v => Math.abs(v) < 1e-12 ? 0 : Number(v.toFixed(12)));
  delete node.translation;
  delete node.rotation;
  delete node.scale;
}

function leftMultiplyNodeMatrix(node, leftMatrix) {
  const current = nodeLocalMatrix(node);
  setNodeMatrix(node, mat4Multiply(leftMatrix, current));
}

function ensureNormalisedRootAndApply(json, bin, { scale = 1, axis = 'Y', pivotPoint = null }) {
  const { scene } = getScene(json);
  let root = detectNormalisedRoot(json, scene);

  if (!root) {
    const originalRoots = (scene.nodes || []).slice();
    const rootNode = {
      name: 'FB_NormalisedRoot',
      children: originalRoots,
      translation: [0, 0, 0],
      scale: [1, 1, 1],
      extras: {
        fbTool: 'GLB Asset Normaliser',
        note: 'Root origin is used as bottom-centre pivot. Child nodes hold the pivot offset.',
      },
    };
    json.nodes = json.nodes || [];
    const rootIndex = json.nodes.length;
    json.nodes.push(rootNode);
    scene.nodes = [rootIndex];
    root = { index: rootIndex, node: rootNode };
  }

  delete root.node.matrix;
  root.node.translation = [0, 0, 0];
  root.node.rotation = [0, 0, 0, 1];
  root.node.scale = [1, 1, 1];

  const bottomCenter = computeStatsAndPreview(json, bin, { maxPreviewVertices: 1, axis }).bbox.bottomCenter;
  const pivot = Array.isArray(pivotPoint) ? pivotPoint.map(Number) : bottomCenter;
  const shift = [-pivot[0], -pivot[1], -pivot[2]];
  const shiftMagnitude = Math.hypot(shift[0], shift[1], shift[2]);
  if (shiftMagnitude > 1e-9) {
    const t = mat4Translation(shift[0], shift[1], shift[2]);
    for (const childIndex of root.node.children || []) {
      const child = json.nodes?.[childIndex];
      if (child) leftMultiplyNodeMatrix(child, t);
    }
  }

  delete root.node.matrix;
  root.node.translation = [0, 0, 0];
  root.node.rotation = [0, 0, 0, 1];
  root.node.scale = [scale, scale, scale];
  root.node.extras = Object.assign({}, root.node.extras || {}, {
    fbNormalised: true,
    fbNormalisedAt: new Date().toISOString(),
    fbBottomAxis: axis,
    fbPivotPoint: roundPoint(pivot),
    fbRootScale: scale,
  });
  return { shift: roundPoint(shift), pivot: roundPoint(pivot), scale, axis };
}

function fitView() {
  state.zoom = 1;
  drawPreview();
}

function setView(name) {
  if (name === 'x') { state.activeAxis = 'X'; state.yaw = 0; state.pitch = 0; }
  if (name === 'y') { state.activeAxis = 'Y'; state.yaw = 0; state.pitch = 0; }
  if (name === 'z') { state.activeAxis = 'Z'; state.yaw = Math.PI / 2; state.pitch = 0; }
  if (name === 'iso') { state.yaw = -0.65; state.pitch = 0.42; }
  updateViewButtons();
  drawPreview();
}

function updateViewButtons() {
  for (const [id, axis] of [['frontViewBtn','Z'], ['sideViewBtn','X'], ['topViewBtn','Y']]) {
    const button = el(id);
    if (button) button.classList.toggle('active', state.activeAxis === axis);
  }
}

function resizeCanvasToDisplay() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.max(300, Math.floor(rect.width * dpr));
  const h = Math.max(220, Math.floor(rect.height * dpr));
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w;
    canvas.height = h;
  }
}

function rotatePoint(p) {
  const cy = Math.cos(state.yaw), sy = Math.sin(state.yaw);
  const cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
  let x = p[0], y = p[1], z = p[2];
  const x1 = x * cy - z * sy;
  const z1 = x * sy + z * cy;
  x = x1; z = z1;
  const y2 = y * cp - z * sp;
  const z2 = y * sp + z * cp;
  y = y2; z = z2;
  return [x, y, z];
}

function getProjection() {
  resizeCanvasToDisplay();
  const preview = state.preview;
  if (!preview || !preview.bbox) return null;
  const w = canvas.width, h = canvas.height;
  const bbox = preview.bbox;
  const center = bbox.center;
  const size = bbox.size;
  const maxDim = Math.max(size[0], size[1], size[2], 0.0001);
  const scale = Math.min(w, h) * 0.58 / maxDim * state.zoom;
  const project = (p) => {
    const shifted = [p[0] - center[0], p[1] - center[1], p[2] - center[2]];
    const r = rotatePoint(shifted);
    return [w / 2 + r[0] * scale, h / 2 - r[1] * scale, r[2]];
  };
  return { w, h, bbox, maxDim, scale, project };
}

function drawPreview() {
  resizeCanvasToDisplay();
  const w = canvas.width, h = canvas.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = '#09080d';
  ctx.fillRect(0, 0, w, h);

  const projection = getProjection();
  if (!projection) {
    ctx.fillStyle = '#b8a98f';
    ctx.font = `${Math.max(16, w / 60)}px Arial`;
    ctx.textAlign = 'center';
    ctx.fillText('Choose a folder, then select a GLB file from the left.', w / 2, h / 2);
    state.lastStarScreen = null;
    return;
  }

  const preview = state.preview;
  const { bbox, maxDim, project } = projection;
  drawGrid(project, bbox);
  if (preview.renderMode === 'solid' && preview.triangles?.length) {
    drawSolidTriangles(project, preview.triangles);
  } else {
    drawPoints(project, preview.preview || []);
  }
  drawBox(project, bbox);
  drawAxes(project, maxDim);
  drawAxisGuide(project, bbox, maxDim);
  drawOriginCross(project);
  drawPivotStar(project);

  ctx.fillStyle = '#b8a98f';
  ctx.font = `${Math.max(11, w / 120)}px Arial`;
  ctx.textAlign = 'left';
  const renderText = preview.renderMode === 'solid'
    ? `${preview.counts.vertices.toLocaleString()} vertices | solid mesh preview ${preview.counts.previewTriangles.toLocaleString()} / ${preview.counts.totalTriangles.toLocaleString()} triangles`
    : `${preview.counts.vertices.toLocaleString()} vertices | showing ${preview.counts.previewVertices.toLocaleString()} sample points`;
  ctx.fillText(renderText, 14, 22);
  ctx.fillText(`Pivot edit axis: ${state.activeAxis} | drag the star to move pivot on ${state.activeAxis} only`, 14, 42);
}

function drawPoints(project, points) {
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = '#e7ddca';
  const projected = points.map(p => project(p)).sort((a, b) => a[2] - b[2]);
  const dot = Math.max(1, Math.min(2.4, canvas.width / 700));
  for (const p of projected) ctx.fillRect(p[0], p[1], dot, dot);
  ctx.restore();
}

function vecSub(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function vecCross(a, b) {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function vecDot(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function vecNorm(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}

function solidColorString(color, shade) {
  const r = Math.max(0, Math.min(255, Math.round(color.r * shade)));
  const g = Math.max(0, Math.min(255, Math.round(color.g * shade)));
  const b = Math.max(0, Math.min(255, Math.round(color.b * shade)));
  const a = Math.max(0.18, Math.min(1, color.a ?? 1));
  return `rgba(${r},${g},${b},${a})`;
}

function drawSolidTriangles(project, triangles) {
  const light = vecNorm([-0.25, 0.55, 0.80]);
  const projected = [];
  for (const tri of triangles) {
    const pa = project(tri.a);
    const pb = project(tri.b);
    const pc = project(tri.c);
    const area = Math.abs((pb[0] - pa[0]) * (pc[1] - pa[1]) - (pc[0] - pa[0]) * (pb[1] - pa[1]));
    if (area < 0.08) continue;

    const ab = rotatePoint(vecSub(tri.b, tri.a));
    const ac = rotatePoint(vecSub(tri.c, tri.a));
    const n = vecNorm(vecCross(ab, ac));
    const lit = Math.abs(vecDot(n, light));
    const shade = 0.30 + lit * 0.82;
    projected.push({ pa, pb, pc, depth: (pa[2] + pb[2] + pc[2]) / 3, color: solidColorString(tri.color, shade) });
  }

  projected.sort((a, b) => a.depth - b.depth);
  ctx.save();
  ctx.lineWidth = 0.6;
  for (const tri of projected) {
    ctx.beginPath();
    ctx.moveTo(tri.pa[0], tri.pa[1]);
    ctx.lineTo(tri.pb[0], tri.pb[1]);
    ctx.lineTo(tri.pc[0], tri.pc[1]);
    ctx.closePath();
    ctx.fillStyle = tri.color;
    ctx.fill();
  }
  ctx.restore();
}

function drawBox(project, bbox) {
  const [minX, minY, minZ] = bbox.min;
  const [maxX, maxY, maxZ] = bbox.max;
  const c = [[minX,minY,minZ], [maxX,minY,minZ], [maxX,maxY,minZ], [minX,maxY,minZ], [minX,minY,maxZ], [maxX,minY,maxZ], [maxX,maxY,maxZ], [minX,maxY,maxZ]];
  const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  ctx.strokeStyle = '#c8a455';
  ctx.lineWidth = Math.max(1, canvas.width / 800);
  ctx.beginPath();
  for (const [a,b] of edges) {
    const p1 = project(c[a]);
    const p2 = project(c[b]);
    ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]);
  }
  ctx.stroke();
}

function drawOriginCross(project) {
  const p = project([0, 0, 0]);
  const r = Math.max(5, canvas.width / 190);
  ctx.save();
  ctx.strokeStyle = 'rgba(116, 210, 138, .85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p[0] - r, p[1]);
  ctx.lineTo(p[0] + r, p[1]);
  ctx.moveTo(p[0], p[1] - r);
  ctx.lineTo(p[0], p[1] + r);
  ctx.stroke();
  ctx.restore();
}

function drawPivotStar(project) {
  if (!state.pivotPoint) return;
  const p = project(state.pivotPoint);
  state.lastStarScreen = p;
  const outer = Math.max(12, canvas.width / 95);
  const inner = outer * 0.45;
  ctx.save();
  ctx.translate(p[0], p[1]);
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + i * Math.PI / 5;
    const r = i % 2 === 0 ? outer : inner;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = '#ead389';
  ctx.strokeStyle = '#2a183f';
  ctx.lineWidth = Math.max(2, canvas.width / 420);
  ctx.shadowColor = 'rgba(234,211,137,.55)';
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.stroke();
  ctx.restore();
}

function drawAxisGuide(project, bbox, maxDim) {
  if (!state.pivotPoint) return;
  const idx = axisIndex(state.activeAxis);
  const start = state.pivotPoint.slice();
  const end = state.pivotPoint.slice();
  const pad = maxDim * 0.25;
  start[idx] = bbox.min[idx] - pad;
  end[idx] = bbox.max[idx] + pad;
  ctx.save();
  ctx.strokeStyle = 'rgba(234, 211, 137, .78)';
  ctx.lineWidth = Math.max(2, canvas.width / 500);
  ctx.setLineDash([10, 7]);
  const a = project(start);
  const b = project(end);
  ctx.beginPath();
  ctx.moveTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = '#ead389';
  ctx.font = `${Math.max(12, canvas.width / 100)}px Arial`;
  ctx.fillText(`${state.activeAxis} pivot drag line`, b[0] + 8, b[1] + 6);
  ctx.restore();
}

function drawAxes(project, maxDim) {
  const len = maxDim * 0.42;
  const axes = [
    { end: [len, 0, 0], label: 'X', color: '#ff7070' },
    { end: [0, len, 0], label: 'Y', color: '#70ff8a' },
    { end: [0, 0, len], label: 'Z', color: '#70a0ff' },
  ];
  for (const axis of axes) {
    const a = project([0,0,0]);
    const b = project(axis.end);
    ctx.strokeStyle = axis.color;
    ctx.lineWidth = axis.label === state.activeAxis ? 4 : 2;
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.fillStyle = axis.color;
    ctx.font = `${Math.max(12, canvas.width / 95)}px Arial`;
    ctx.fillText(axis.label, b[0] + 6, b[1] + 6);
  }
}

function drawGrid(project, bbox) {
  const size = Math.max(...bbox.size, 1);
  const step = size / 8;
  ctx.save();
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = -8; i <= 8; i++) {
    const a = project([i * step, 0, -8 * step]);
    const b = project([i * step, 0, 8 * step]);
    const c = project([-8 * step, 0, i * step]);
    const d = project([8 * step, 0, i * step]);
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(c[0], c[1]); ctx.lineTo(d[0], d[1]); ctx.stroke();
  }
  ctx.restore();
}

function axisIndex(axis) {
  return axis === 'X' ? 0 : axis === 'Y' ? 1 : 2;
}

function axisVector(axis) {
  return axis === 'X' ? [1, 0, 0] : axis === 'Y' ? [0, 1, 0] : [0, 0, 1];
}

function pointerOnCanvas(ev) {
  const rect = canvas.getBoundingClientRect();
  const sx = canvas.width / rect.width;
  const sy = canvas.height / rect.height;
  return [(ev.clientX - rect.left) * sx, (ev.clientY - rect.top) * sy];
}

function dragPivot(ev) {
  if (!state.pivotPoint) return;
  const projection = getProjection();
  if (!projection) return;
  const next = pointerOnCanvas(ev);
  const dx = next[0] - state.lastMouse[0];
  const dy = next[1] - state.lastMouse[1];
  state.lastMouse = next;

  const axis = state.activeAxis;
  const idx = axisIndex(axis);
  const v = axisVector(axis);
  const base = state.pivotPoint.slice();
  const one = [base[0] + v[0], base[1] + v[1], base[2] + v[2]];
  const p0 = projection.project(base);
  const p1 = projection.project(one);
  const ax = p1[0] - p0[0];
  const ay = p1[1] - p0[1];
  const denom = ax * ax + ay * ay;
  if (denom < 1e-9) return;
  const worldDelta = (dx * ax + dy * ay) / denom;
  state.pivotPoint[idx] = roundPoint([state.pivotPoint[idx] + worldDelta])[0];
  if (state.analysis) renderStats(state.analysis);
  drawPreview();
}

function resetPivotToBottomCentre() {
  if (!state.preview?.bbox?.bottomCenter) return;
  state.pivotPoint = state.preview.bbox.bottomCenter.slice();
  if (state.analysis) renderStats(state.analysis);
  drawPreview();
  log('Pivot star reset to current bottom centre.', 'ok');
}

chooseFolderBtn.addEventListener('click', chooseFolder);
restoreFolderBtn.addEventListener('click', restoreRememberedFolder);
upBtn.addEventListener('click', goUp);
targetModeSelect.addEventListener('change', () => {
  localStorage.setItem(TARGET_MODE_KEY, targetModeSelect.value);
  updateScaleReadout();
  if (state.analysis) renderStats(state.analysis);
});
targetSizeInput.addEventListener('input', () => {
  localStorage.setItem(TARGET_SIZE_KEY, targetSizeInput.value);
  updateScaleReadout();
  if (state.analysis) renderStats(state.analysis);
});
scaleInput.addEventListener('input', () => {
  localStorage.setItem(MANUAL_SCALE_KEY, scaleInput.value);
  updateScaleReadout();
  if (selectedTargetMode() === 'manual' && state.analysis) renderStats(state.analysis);
});
axisSelect.addEventListener('change', async () => {
  updateScaleReadout();
  if (state.selectedEntry) await selectFile(state.selectedEntry);
});
qualitySlider.addEventListener('input', refreshSelectedForQuality);
saveCopyBtn.addEventListener('click', () => save('copy'));
overwriteBtn.addEventListener('click', () => {
  if (confirm('Overwrite the original GLB? A backup will be created if the backup box is checked.')) save('overwrite');
});
batchCopyBtn.addEventListener('click', () => batch('copy'));
batchOverwriteBtn.addEventListener('click', () => {
  if (confirm(`Overwrite ${state.selectedRows.size} selected GLB file(s)? Backups will be created if enabled.`)) batch('overwrite');
});
el('frontViewBtn').addEventListener('click', () => setView('z'));
el('sideViewBtn').addEventListener('click', () => setView('x'));
el('topViewBtn').addEventListener('click', () => setView('y'));
el('isoViewBtn').addEventListener('click', () => setView('iso'));
el('fitViewBtn').addEventListener('click', fitView);
el('resetPivotBtn').addEventListener('click', resetPivotToBottomCentre);

canvas.addEventListener('mousedown', ev => {
  const pos = pointerOnCanvas(ev);
  if (state.lastStarScreen) {
    const d = Math.hypot(pos[0] - state.lastStarScreen[0], pos[1] - state.lastStarScreen[1]);
    if (d <= Math.max(24, canvas.width / 55)) {
      state.dragging = 'pivot';
      state.lastMouse = pos;
      canvas.classList.add('dragging-star');
      return;
    }
  }
  state.dragging = 'orbit';
  state.lastMouse = [ev.clientX, ev.clientY];
});
window.addEventListener('mouseup', () => {
  state.dragging = null;
  canvas.classList.remove('dragging-star');
});
window.addEventListener('mousemove', ev => {
  if (!state.dragging || !state.lastMouse) return;
  if (state.dragging === 'pivot') {
    dragPivot(ev);
    return;
  }
  const dx = ev.clientX - state.lastMouse[0];
  const dy = ev.clientY - state.lastMouse[1];
  state.lastMouse = [ev.clientX, ev.clientY];
  state.yaw += dx * 0.008;
  state.pitch += dy * 0.008;
  state.pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, state.pitch));
  drawPreview();
});
canvas.addEventListener('wheel', ev => {
  ev.preventDefault();
  state.zoom *= ev.deltaY > 0 ? 0.9 : 1.1;
  state.zoom = Math.max(0.05, Math.min(40, state.zoom));
  drawPreview();
}, { passive: false });
window.addEventListener('resize', drawPreview);


function initialiseScaleControls() {
  const savedMode = localStorage.getItem(TARGET_MODE_KEY);
  const savedTarget = localStorage.getItem(TARGET_SIZE_KEY);
  const savedManualScale = localStorage.getItem(MANUAL_SCALE_KEY);
  if (savedMode && targetModeSelect && [...targetModeSelect.options].some(o => o.value === savedMode)) targetModeSelect.value = savedMode;
  if (savedTarget && targetSizeInput && Number(savedTarget) > 0) targetSizeInput.value = savedTarget;
  if (savedManualScale && scaleInput && Number(savedManualScale) > 0) scaleInput.value = savedManualScale;
  updateScaleReadout();
}

assertFolderPickerSupport();
initialiseScaleControls();
updateQualityLabel();
updateViewButtons();
drawPreview();
initialiseRememberedFolder();
