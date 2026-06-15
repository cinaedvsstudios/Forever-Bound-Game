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

async function loadCurrentFolder(options = {}) {
  const preserveScroll = Boolean(options.preserveScroll);
  const preserveChecks = Boolean(options.preserveChecks);
  const previousScrollTop = preserveScroll ? fileList.scrollTop : 0;
  const previousCheckedPaths = preserveChecks ? new Set(state.selectedRows.keys()) : new Set();

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
    row.dataset.path = entry.path;
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
      if (previousCheckedPaths.has(entry.path)) {
        checkbox.checked = true;
        state.selectedRows.set(entry.path, entry);
      }
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

  updateBatchButtons();
  if (preserveScroll) {
    requestAnimationFrame(() => {
      fileList.scrollTop = previousScrollTop;
    });
  }
}

function updateActiveFileRow() {
  const selectedPath = state.selectedEntry?.path || '';
  fileList.querySelectorAll('.file-row[data-path]').forEach(row => {
    row.classList.toggle('active', row.dataset.path === selectedPath);
  });
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
    updateActiveFileRow();
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
    ${warnings}
    <div class="stat-row"><span>File size</span><span>${fmtBytes(data.bytes)}</span></div>
    <div class="stat-row"><span>Vertices</span><span>${data.counts.vertices.toLocaleString()}</span></div>
    <div class="stat-row"><span>Meshes</span><span>${data.counts.meshes.toLocaleString()}</span></div>
    <div class="stat-row"><span>Mesh nodes</span><span>${data.counts.meshNodes.toLocaleString()}</span></div>
    <div class="stat-row"><span>Materials</span><span>${data.counts.materials.toLocaleString()}</span></div>
    <div class="stat-row"><span>Images</span><span>${data.counts.images.toLocaleString()}</span></div>
    <div class="stat-row"><span>Animations</span><span>${data.counts.animations.toLocaleString()}</span></div>
    <div class="stat-row"><span>Skins</span><span>${data.counts.skins.toLocaleString()}</span></div>
    <div class="stat-row"><span>Current size X/Y/Z</span><span>${fmtVec(data.bbox.size)} m</span></div>
    <div class="stat-row"><span>Height by ${axisSelect.value}</span><span>${sizeForMode(data, 'height').toFixed(4)} m</span></div>
    <div class="stat-row"><span>Longest side</span><span>${sizeForMode(data, 'longest').toFixed(4)} m</span></div>
    <div class="stat-row"><span>Pivot star</span><span>${fmtVec(state.pivotPoint)}</span></div>
    <div class="stat-row"><span>Bottom centre</span><span>${fmtVec(data.bbox.bottomCenter)}</span></div>
    <div class="stat-row"><span>Normalised root</span><span>${normalisedText}</span></div>
    <div class="stat-row"><span>Preview mode</span><span>${previewModeText}</span></div>
  `;
  updateScaleReadout();
}

function getPreviewOptions() {
  const quality = clamp(Number(qualitySlider.value) || 35, 1, 100);
  state.previewQuality = quality;
  if (quality >= 100) {
    return { renderMode: 'solid', maxPreviewTriangles: 65000, maxPreviewVertices: 50000, axis: axisSelect.value };
  }
  if (quality >= 85) {
    return { renderMode: 'solid', maxPreviewTriangles: 30000, maxPreviewVertices: 30000, axis: axisSelect.value };
  }
  const maxPreviewVertices = Math.round(400 + Math.pow(quality / 100, 2.15) * 70000);
  return { renderMode: 'points', maxPreviewVertices, axis: axisSelect.value };
}

function updateQualityLabel() {
  const quality = clamp(Number(qualitySlider.value) || 35, 1, 100);
  if (quality >= 100) qualityLabel.textContent = `${quality} · normal solid render`;
  else if (quality >= 85) qualityLabel.textContent = `${quality} · solid preview`;
  else qualityLabel.textContent = `${quality} · point cloud`;
}

function refreshSelectedForQuality() {
  updateQualityLabel();
  if (!state.selectedEntry) return;
  clearTimeout(state.qualityDebounce);
  state.qualityDebounce = setTimeout(async () => {
    await selectFile(state.selectedEntry, { preservePivot: true, preserveView: true, quiet: true });
  }, 120);
}

function selectedTargetMode() {
  return targetModeSelect.value || 'height';
}

function selectedTargetSize() {
  const v = Number(targetSizeInput.value);
  return Number.isFinite(v) && v > 0 ? v : 1;
}

function currentSizeByAxis(data) {
  if (!data?.bbox?.size) return 1;
  const idx = axisIndex(axisSelect.value);
  return Math.abs(data.bbox.size[idx]) || 1;
}

function sizeForMode(data, mode = selectedTargetMode()) {
  if (!data?.bbox?.size) return 1;
  const size = data.bbox.size.map(v => Math.abs(v));
  if (mode === 'height') return currentSizeByAxis(data);
  if (mode === 'width') return size[0] || 1;
  if (mode === 'depth') {
    const up = axisSelect.value;
    if (up === 'Y') return size[2] || 1;
    if (up === 'Z') return size[1] || 1;
    return size[2] || 1;
  }
  if (mode === 'longest') return Math.max(size[0] || 0, size[1] || 0, size[2] || 0) || 1;
  return 1;
}

function calculatedScaleForData(data) {
  const mode = selectedTargetMode();
  if (mode === 'manual') {
    const manual = Number(scaleInput.value);
    return Number.isFinite(manual) && manual > 0 ? manual : 1;
  }
  const current = sizeForMode(data, mode);
  return selectedTargetSize() / current;
}

function getScaleForData(data) {
  const scale = calculatedScaleForData(data);
  return Number.isFinite(scale) && scale > 0 ? scale : 1;
}

function updateScaleReadout() {
  if (!state.analysis) {
    scaleReadout.textContent = 'Current size appears after a GLB is selected.';
    return;
  }
  const mode = selectedTargetMode();
  const current = sizeForMode(state.analysis, mode);
  const target = mode === 'manual' ? current : selectedTargetSize();
  const scale = getScaleForData(state.analysis);
  if (mode !== 'manual') scaleInput.value = String(round(scale, 6));
  const after = state.analysis.bbox.size.map(v => Math.abs(v * scale));
  const basisText = mode === 'height' ? `height by ${axisSelect.value}` : mode;
  scaleReadout.innerHTML = `Current ${basisText}: <strong>${current.toFixed(4)} m</strong> · Target: <strong>${target.toFixed(4)} m</strong> · Scale to write: <strong>${round(scale, 6)}</strong> · After save X/Y/Z: <strong>${after.map(v => v.toFixed(4)).join(' / ')} m</strong>`;
}

function round(n, dp = 4) {
  const f = Math.pow(10, dp);
  return Math.round((Number(n) + Number.EPSILON) * f) / f;
}

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function readJsonChunk(dataView, offset, length) {
  const bytes = new Uint8Array(dataView.buffer, dataView.byteOffset + offset, length);
  return JSON.parse(new TextDecoder().decode(bytes));
}

function parseGLB(arrayBuffer) {
  const dv = new DataView(arrayBuffer);
  if (dv.byteLength < 20) throw new Error('File is too small to be a GLB.');
  const magic = dv.getUint32(0, true);
  const version = dv.getUint32(4, true);
  const length = dv.getUint32(8, true);
  if (magic !== 0x46546c67) throw new Error('Not a GLB file.');
  if (version !== 2) throw new Error(`Unsupported GLB version ${version}; expected 2.`);
  if (length !== dv.byteLength) throw new Error('GLB length header does not match file size.');

  let offset = 12;
  let json = null;
  let bin = null;
  const chunks = [];
  while (offset + 8 <= dv.byteLength) {
    const chunkLength = dv.getUint32(offset, true);
    const chunkType = dv.getUint32(offset + 4, true);
    offset += 8;
    if (offset + chunkLength > dv.byteLength) throw new Error('GLB chunk extends beyond file length.');
    chunks.push({ type: chunkType, offset, length: chunkLength });
    if (chunkType === 0x4e4f534a) json = readJsonChunk(dv, offset, chunkLength);
    if (chunkType === 0x004e4942) bin = new Uint8Array(arrayBuffer, offset, chunkLength);
    offset += chunkLength;
  }
  if (!json) throw new Error('GLB has no JSON chunk.');
  return { json, bin, chunks };
}

function getBinChunk(parsed) {
  return parsed.bin;
}

function accessorComponentCount(type) {
  return ({ SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT2: 4, MAT3: 9, MAT4: 16 }[type] || 1);
}

function componentSize(componentType) {
  return ({ 5120: 1, 5121: 1, 5122: 2, 5123: 2, 5125: 4, 5126: 4 }[componentType] || 0);
}

function componentRead(dv, byteOffset, componentType) {
  switch (componentType) {
    case 5120: return dv.getInt8(byteOffset);
    case 5121: return dv.getUint8(byteOffset);
    case 5122: return dv.getInt16(byteOffset, true);
    case 5123: return dv.getUint16(byteOffset, true);
    case 5125: return dv.getUint32(byteOffset, true);
    case 5126: return dv.getFloat32(byteOffset, true);
    default: throw new Error(`Unsupported component type ${componentType}`);
  }
}

function componentWrite(dv, byteOffset, componentType, value) {
  switch (componentType) {
    case 5120: dv.setInt8(byteOffset, value); break;
    case 5121: dv.setUint8(byteOffset, value); break;
    case 5122: dv.setInt16(byteOffset, value, true); break;
    case 5123: dv.setUint16(byteOffset, value, true); break;
    case 5125: dv.setUint32(byteOffset, value, true); break;
    case 5126: dv.setFloat32(byteOffset, value, true); break;
    default: throw new Error(`Unsupported component type ${componentType}`);
  }
}

function getAccessorLayout(json, bin, accessorIndex) {
  const accessor = json.accessors?.[accessorIndex];
  if (!accessor) throw new Error(`Missing accessor ${accessorIndex}.`);
  if (accessor.sparse) throw new Error('Sparse accessors are not supported by this tool yet.');
  const view = json.bufferViews?.[accessor.bufferView];
  if (!view) throw new Error(`Missing bufferView ${accessor.bufferView}.`);
  if (view.buffer !== 0 && view.buffer !== undefined) throw new Error('Only single-buffer GLBs are supported.');
  const count = accessor.count || 0;
  const comps = accessorComponentCount(accessor.type);
  const cSize = componentSize(accessor.componentType);
  const packedStride = comps * cSize;
  const stride = view.byteStride || packedStride;
  const base = (view.byteOffset || 0) + (accessor.byteOffset || 0);
  if (base + (count - 1) * stride + packedStride > bin.byteLength) throw new Error('Accessor data extends beyond BIN chunk.');
  return { accessor, view, count, comps, cSize, stride, packedStride, base };
}

function readVec3At(dv, layout, index) {
  const offset = layout.base + index * layout.stride;
  return [
    componentRead(dv, offset, layout.accessor.componentType),
    componentRead(dv, offset + layout.cSize, layout.accessor.componentType),
    componentRead(dv, offset + layout.cSize * 2, layout.accessor.componentType),
  ];
}

function writeVec3At(dv, layout, index, v) {
  const offset = layout.base + index * layout.stride;
  componentWrite(dv, offset, layout.accessor.componentType, v[0]);
  componentWrite(dv, offset + layout.cSize, layout.accessor.componentType, v[1]);
  componentWrite(dv, offset + layout.cSize * 2, layout.accessor.componentType, v[2]);
}

function readIndexAt(dv, layout, index) {
  const offset = layout.base + index * layout.stride;
  return componentRead(dv, offset, layout.accessor.componentType);
}

function transformPoint(m, p) {
  const x = p[0], y = p[1], z = p[2];
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}

function identityMat4() {
  return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1];
}

function multiplyMat4(a, b) {
  const out = new Array(16).fill(0);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      for (let k = 0; k < 4; k++) out[col * 4 + row] += a[k * 4 + row] * b[col * 4 + k];
    }
  }
  return out;
}

function translationMat4(t) {
  const m = identityMat4();
  m[12] = t[0];
  m[13] = t[1];
  m[14] = t[2];
  return m;
}

function scaleMat4(s) {
  const m = identityMat4();
  m[0] = s[0];
  m[5] = s[1];
  m[10] = s[2];
  return m;
}

function quaternionMat4(q) {
  const x = q[0], y = q[1], z = q[2], w = q[3];
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

function nodeLocalMatrix(node) {
  if (node.matrix) return node.matrix.slice();
  const t = node.translation || [0, 0, 0];
  const r = node.rotation || [0, 0, 0, 1];
  const s = node.scale || [1, 1, 1];
  return multiplyMat4(multiplyMat4(translationMat4(t), quaternionMat4(r)), scaleMat4(s));
}

function collectNodeWorlds(json) {
  const nodes = json.nodes || [];
  const parents = new Set();
  nodes.forEach(n => (n.children || []).forEach(c => parents.add(c)));
  const roots = [];
  nodes.forEach((_, i) => { if (!parents.has(i)) roots.push(i); });
  const worlds = Array(nodes.length).fill(null);
  function visit(idx, parent) {
    const local = nodeLocalMatrix(nodes[idx] || {});
    const world = multiplyMat4(parent, local);
    worlds[idx] = world;
    for (const child of nodes[idx]?.children || []) visit(child, world);
  }
  roots.forEach(r => visit(r, identityMat4()));
  return worlds;
}

function computeStatsAndPreview(json, bin, options = {}) {
  const counts = {
    vertices: 0,
    meshes: (json.meshes || []).length,
    meshNodes: 0,
    materials: (json.materials || []).length,
    images: (json.images || []).length,
    animations: (json.animations || []).length,
    skins: (json.skins || []).length,
    skippedPrimitives: 0,
    previewVertices: 0,
    totalTriangles: 0,
    previewTriangles: 0,
  };
  const bbox = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  const points = [];
  const triangles = [];
  const maxPreviewVertices = Math.max(1, options.maxPreviewVertices || 12000);
  const maxPreviewTriangles = Math.max(1, options.maxPreviewTriangles || 20000);
  const worlds = collectNodeWorlds(json);
  const dv = new DataView(bin.buffer, bin.byteOffset, bin.byteLength);

  const meshToNodes = new Map();
  (json.nodes || []).forEach((node, idx) => {
    if (node.mesh !== undefined) {
      if (!meshToNodes.has(node.mesh)) meshToNodes.set(node.mesh, []);
      meshToNodes.get(node.mesh).push(idx);
      counts.meshNodes++;
    }
  });

  for (const [meshIndex, nodeIndices] of meshToNodes.entries()) {
    const mesh = json.meshes?.[meshIndex];
    if (!mesh) continue;
    for (const nodeIndex of nodeIndices) {
      const world = worlds[nodeIndex] || identityMat4();
      for (const primitive of mesh.primitives || []) {
        const posIndex = primitive.attributes?.POSITION;
        if (posIndex === undefined) { counts.skippedPrimitives++; continue; }
        let layout;
        try {
          layout = getAccessorLayout(json, bin, posIndex);
          if (layout.accessor.type !== 'VEC3' || layout.accessor.componentType !== 5126) throw new Error('POSITION must be float VEC3.');
        } catch {
          counts.skippedPrimitives++;
          continue;
        }
        counts.vertices += layout.count;
        const sampleStep = Math.max(1, Math.ceil(layout.count / Math.max(1, maxPreviewVertices - points.length)));
        for (let i = 0; i < layout.count; i++) {
          const wp = transformPoint(world, readVec3At(dv, layout, i));
          for (let k = 0; k < 3; k++) {
            if (wp[k] < bbox.min[k]) bbox.min[k] = wp[k];
            if (wp[k] > bbox.max[k]) bbox.max[k] = wp[k];
          }
          if (points.length < maxPreviewVertices && i % sampleStep === 0) points.push(wp);
        }

        if (options.renderMode === 'solid' && triangles.length < maxPreviewTriangles) {
          const mode = primitive.mode === undefined ? 4 : primitive.mode;
          if (mode === 4) {
            const positionCache = new Map();
            const getPos = (i) => {
              if (!positionCache.has(i)) positionCache.set(i, transformPoint(world, readVec3At(dv, layout, i)));
              return positionCache.get(i);
            };
            if (primitive.indices !== undefined) {
              try {
                const indexLayout = getAccessorLayout(json, bin, primitive.indices);
                counts.totalTriangles += Math.floor(indexLayout.count / 3);
                const triStep = Math.max(1, Math.ceil(Math.floor(indexLayout.count / 3) / Math.max(1, maxPreviewTriangles - triangles.length)));
                for (let i = 0, tri = 0; i + 2 < indexLayout.count && triangles.length < maxPreviewTriangles; i += 3, tri++) {
                  if (tri % triStep !== 0) continue;
                  triangles.push([getPos(readIndexAt(dv, indexLayout, i)), getPos(readIndexAt(dv, indexLayout, i + 1)), getPos(readIndexAt(dv, indexLayout, i + 2))]);
                }
              } catch {
                counts.skippedPrimitives++;
              }
            } else {
              counts.totalTriangles += Math.floor(layout.count / 3);
              const triStep = Math.max(1, Math.ceil(Math.floor(layout.count / 3) / Math.max(1, maxPreviewTriangles - triangles.length)));
              for (let i = 0, tri = 0; i + 2 < layout.count && triangles.length < maxPreviewTriangles; i += 3, tri++) {
                if (tri % triStep !== 0) continue;
                triangles.push([getPos(i), getPos(i + 1), getPos(i + 2)]);
              }
            }
          }
        }
      }
    }
  }

  if (!Number.isFinite(bbox.min[0])) throw new Error('No readable POSITION vertices found.');
  bbox.size = [bbox.max[0] - bbox.min[0], bbox.max[1] - bbox.min[1], bbox.max[2] - bbox.min[2]];
  const axis = options.axis || axisSelect.value || 'Y';
  bbox.bottomCenter = computeBottomCenterFromBounds(bbox, axis);
  counts.previewVertices = points.length;
  counts.previewTriangles = triangles.length;
  return { counts, bbox, points, triangles, renderMode: options.renderMode || 'points' };
}

function detectNormalisedRoot(json) {
  const nodes = json.nodes || [];
  const idx = nodes.findIndex(n => n.name === 'FB_NormalisedRoot');
  if (idx < 0) return { found: false, index: -1, scale: [1, 1, 1] };
  return { found: true, index: idx, scale: nodes[idx].scale || [1, 1, 1] };
}

function uniformRootScale(data) {
  const scale = data?.normalisedRoot?.scale;
  if (!Array.isArray(scale) || !scale.length) return 1;
  return Number(scale[0]) || 1;
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
  return { fileName, filePath, bytes, ...stats, warnings, normalisedRoot: detectNormalisedRoot(parsed.json) };
}

function axisIndex(axis) {
  return ({ X: 0, Y: 1, Z: 2 }[axis] ?? 1);
}

function axisVector(axis) {
  return axis === 'X' ? [1, 0, 0] : axis === 'Z' ? [0, 0, 1] : [0, 1, 0];
}

function computeBottomCenterFromBounds(bbox, axis = 'Y') {
  const centre = [
    (bbox.min[0] + bbox.max[0]) / 2,
    (bbox.min[1] + bbox.max[1]) / 2,
    (bbox.min[2] + bbox.max[2]) / 2,
  ];
  const idx = axisIndex(axis);
  centre[idx] = bbox.min[idx];
  return centre;
}

function normaliseArrayBuffer(arrayBuffer, options) {
  const parsed = parseGLB(arrayBuffer);
  const json = structuredClone(parsed.json);
  const bin = new Uint8Array(parsed.bin);
  const stats = computeStatsAndPreview(json, bin, { axis: options.axis || 'Y' });
  const pivot = Array.isArray(options.pivotPoint) ? options.pivotPoint.slice() : stats.bbox.bottomCenter;
  const shift = pivot.map(v => -v);
  const scale = Number(options.scale) || 1;

  json.nodes = json.nodes || [];
  json.scenes = json.scenes || [{ nodes: [] }];
  json.scene = json.scene ?? 0;
  const scene = json.scenes[json.scene];
  scene.nodes = scene.nodes || [];

  const existingRootIndex = json.nodes.findIndex(n => n.name === 'FB_NormalisedRoot');
  if (existingRootIndex >= 0) {
    const root = json.nodes[existingRootIndex];
    root.scale = [scale, scale, scale];
    for (const childIdx of root.children || []) {
      const child = json.nodes[childIdx];
      if (!child) continue;
      child.translation = addVec3(child.translation || [0, 0, 0], shift);
    }
  } else {
    const oldRoots = [...scene.nodes];
    const movedRoots = oldRoots.map(idx => {
      const node = json.nodes[idx];
      if (node) node.translation = addVec3(node.translation || [0, 0, 0], shift);
      return idx;
    });
    const rootNode = { name: 'FB_NormalisedRoot', scale: [scale, scale, scale], children: movedRoots };
    const rootIndex = json.nodes.push(rootNode) - 1;
    scene.nodes = [rootIndex];
  }

  json.asset = json.asset || { version: '2.0' };
  json.asset.generator = 'Forever Bound GLB Asset Normaliser';

  const bytes = buildGLB(json, bin);
  return { bytes, result: { shift, scale, pivot } };
}

function addVec3(a, b) {
  return [round((a[0] || 0) + b[0], 8), round((a[1] || 0) + b[1], 8), round((a[2] || 0) + b[2], 8)];
}

function padTo4BytesUint8(bytes, padByte) {
  const extra = (4 - (bytes.length % 4)) % 4;
  if (!extra) return bytes;
  const out = new Uint8Array(bytes.length + extra);
  out.set(bytes);
  out.fill(padByte, bytes.length);
  return out;
}

function buildGLB(json, bin) {
  const jsonText = JSON.stringify(json);
  const jsonBytes = padTo4BytesUint8(new TextEncoder().encode(jsonText), 0x20);
  const binBytes = padTo4BytesUint8(bin, 0x00);
  const totalLength = 12 + 8 + jsonBytes.length + 8 + binBytes.length;
  const out = new ArrayBuffer(totalLength);
  const dv = new DataView(out);
  let offset = 0;
  dv.setUint32(offset, 0x46546c67, true); offset += 4;
  dv.setUint32(offset, 2, true); offset += 4;
  dv.setUint32(offset, totalLength, true); offset += 4;
  dv.setUint32(offset, jsonBytes.length, true); offset += 4;
  dv.setUint32(offset, 0x4e4f534a, true); offset += 4;
  new Uint8Array(out, offset, jsonBytes.length).set(jsonBytes); offset += jsonBytes.length;
  dv.setUint32(offset, binBytes.length, true); offset += 4;
  dv.setUint32(offset, 0x004e4942, true); offset += 4;
  new Uint8Array(out, offset, binBytes.length).set(binBytes);
  return new Uint8Array(out);
}

function timestampForFile() {
  const d = new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function backupName(name) {
  return name.replace(/\.glb$/i, `.bak-${timestampForFile()}.glb`);
}

function normalisedCopyName(name) {
  return name.replace(/\.glb$/i, '.normalised.glb');
}

async function writeFileHandle(fileHandle, bytes) {
  const writable = await fileHandle.createWritable();
  await writable.write(new Blob([bytes], { type: 'model/gltf-binary' }));
  await writable.close();
}

function pivotForSave(data, pivotPoint) {
  if (!Array.isArray(pivotPoint)) return null;
  const existingRoot = uniformRootScale(data);
  if (!data?.normalisedRoot?.found || Math.abs(existingRoot - 1) < 1e-12) return pivotPoint.slice();
  return pivotPoint.map(v => v / existingRoot);
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
    await loadCurrentFolder({ preserveScroll: true, preserveChecks: true });
    if (mode === 'overwrite') {
      const refreshed = state.entries.find(e => e.type === 'file' && e.name === entry.name);
      if (refreshed) await selectFile(refreshed, { preserveView: true, quiet: true });
    } else {
      updateActiveFileRow();
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
    await loadCurrentFolder({ preserveScroll: true, preserveChecks: true });
    updateActiveFileRow();
  } catch (err) {
    log(err.message || String(err), 'bad');
  }
}

function updateBatchButtons() {
  const enabled = state.selectedRows.size > 0;
  batchCopyBtn.disabled = !enabled;
  batchOverwriteBtn.disabled = !enabled;
}

function resizeCanvasToDisplaySize() {
  const rect = canvas.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(600, Math.floor(rect.width * dpr));
  const height = Math.max(360, Math.floor(rect.height * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
}

function setView(view) {
  if (view === 'z') {
    state.activeAxis = 'Z';
    state.yaw = 0;
    state.pitch = 0;
  } else if (view === 'x') {
    state.activeAxis = 'X';
    state.yaw = Math.PI / 2;
    state.pitch = 0;
  } else if (view === 'y') {
    state.activeAxis = 'Y';
    state.yaw = 0;
    state.pitch = Math.PI / 2;
  } else if (view === 'iso') {
    state.yaw = -0.65;
    state.pitch = 0.42;
  }
  updateViewButtons();
  fitView();
}

function updateViewButtons() {
  el('frontViewBtn').classList.toggle('active', state.activeAxis === 'Z');
  el('sideViewBtn').classList.toggle('active', state.activeAxis === 'X');
  el('topViewBtn').classList.toggle('active', state.activeAxis === 'Y');
}

function getRotatedProjection() {
  const cy = Math.cos(state.yaw), sy = Math.sin(state.yaw);
  const cp = Math.cos(state.pitch), sp = Math.sin(state.pitch);
  const cx = canvas.width / 2;
  const cyv = canvas.height / 2;
  const bounds = state.preview?.bbox;
  const size = bounds ? Math.max(...bounds.size.map(Math.abs), 0.0001) : 2;
  const scale = Math.min(canvas.width, canvas.height) * 0.62 * state.zoom / size;
  const center = bounds ? [(bounds.min[0] + bounds.max[0]) / 2, (bounds.min[1] + bounds.max[1]) / 2, (bounds.min[2] + bounds.max[2]) / 2] : [0, 0, 0];

  function rotate(p) {
    const x = p[0] - center[0];
    const y = p[1] - center[1];
    const z = p[2] - center[2];
    const x1 = cy * x - sy * z;
    const z1 = sy * x + cy * z;
    const y2 = cp * y - sp * z1;
    const z2 = sp * y + cp * z1;
    return [x1, y2, z2];
  }
  function project(p) {
    const r = rotate(p);
    return [cx + r[0] * scale, cyv - r[1] * scale, r[2]];
  }
  return { project, rotate, scale, center };
}

function fitView() {
  state.zoom = 1;
  drawPreview();
}

function drawPreview() {
  resizeCanvasToDisplaySize();
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#07060a';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  state.lastStarScreen = null;

  if (!state.preview) {
    ctx.fillStyle = '#b8a98f';
    ctx.font = '18px Arial';
    ctx.fillText('Choose a GLB file to preview geometry.', 28, 42);
    return;
  }

  const projection = getRotatedProjection();
  drawAxes(projection);
  drawBounds(projection, state.preview.bbox);

  if (state.preview.renderMode === 'solid' && state.preview.triangles?.length) drawSolidTriangles(projection);
  else drawPoints(projection);

  drawPivotAxis(projection);
  drawOrigin(projection);
  drawPivotStar(projection);

  ctx.fillStyle = '#ead389';
  ctx.font = '12px Arial';
  const label = state.preview.renderMode === 'solid'
    ? `${state.preview.counts.vertices.toLocaleString()} vertices | solid preview ${state.preview.counts.previewTriangles.toLocaleString()} triangles`
    : `${state.preview.counts.vertices.toLocaleString()} vertices | showing ${state.preview.counts.previewVertices.toLocaleString()} sample points`;
  ctx.fillText(label, 14, 24);
}

function drawPoints(projection) {
  ctx.fillStyle = '#d7ccb8';
  for (const p of state.preview.points) {
    const [x, y] = projection.project(p);
    ctx.fillRect(x, y, 1.5, 1.5);
  }
}

function drawSolidTriangles(projection) {
  const tris = state.preview.triangles.map(tri => {
    const pts = tri.map(p => projection.project(p));
    const depth = (pts[0][2] + pts[1][2] + pts[2][2]) / 3;
    return { pts, depth };
  }).sort((a, b) => a.depth - b.depth);
  ctx.lineWidth = 0.45;
  for (const tri of tris) {
    const brightness = clamp(0.46 + tri.depth * 0.02, 0.28, 0.78);
    const v = Math.round(225 * brightness);
    ctx.fillStyle = `rgb(${v},${Math.round(v * 0.92)},${Math.round(v * 0.72)})`;
    ctx.strokeStyle = 'rgba(10,8,14,.16)';
    ctx.beginPath();
    ctx.moveTo(tri.pts[0][0], tri.pts[0][1]);
    ctx.lineTo(tri.pts[1][0], tri.pts[1][1]);
    ctx.lineTo(tri.pts[2][0], tri.pts[2][1]);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function drawBounds(projection, bbox) {
  const [min, max] = [bbox.min, bbox.max];
  const c = [
    [min[0], min[1], min[2]], [max[0], min[1], min[2]], [max[0], max[1], min[2]], [min[0], max[1], min[2]],
    [min[0], min[1], max[2]], [max[0], min[1], max[2]], [max[0], max[1], max[2]], [min[0], max[1], max[2]],
  ].map(p => projection.project(p));
  const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
  ctx.strokeStyle = 'rgba(234,211,137,.65)';
  ctx.lineWidth = 1.4;
  for (const [a,b] of edges) {
    ctx.beginPath();
    ctx.moveTo(c[a][0], c[a][1]);
    ctx.lineTo(c[b][0], c[b][1]);
    ctx.stroke();
  }
}

function drawAxes(projection) {
  const len = state.preview ? Math.max(...state.preview.bbox.size.map(Math.abs)) * 0.58 : 1;
  const axes = [
    { name: 'X', color: '#ff7b7b', v: [len, 0, 0] },
    { name: 'Y', color: '#67e08e', v: [0, len, 0] },
    { name: 'Z', color: '#6da4ff', v: [0, 0, len] },
  ];
  const origin = projection.project([0,0,0]);
  ctx.lineWidth = 1.5;
  for (const axis of axes) {
    const end = projection.project(axis.v);
    ctx.strokeStyle = axis.color;
    ctx.beginPath();
    ctx.moveTo(origin[0], origin[1]);
    ctx.lineTo(end[0], end[1]);
    ctx.stroke();
    ctx.fillStyle = axis.color;
    ctx.font = '12px Arial';
    ctx.fillText(axis.name, end[0] + 4, end[1] + 4);
  }
}

function drawOrigin(projection) {
  const [x,y] = projection.project([0,0,0]);
  ctx.fillStyle = '#35d07f';
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

function drawPivotAxis(projection) {
  if (!state.pivotPoint || !state.preview) return;
  const axis = axisVector(state.activeAxis);
  const len = Math.max(...state.preview.bbox.size.map(Math.abs)) * 1.1;
  const a = [state.pivotPoint[0] - axis[0] * len, state.pivotPoint[1] - axis[1] * len, state.pivotPoint[2] - axis[2] * len];
  const b = [state.pivotPoint[0] + axis[0] * len, state.pivotPoint[1] + axis[1] * len, state.pivotPoint[2] + axis[2] * len];
  const pa = projection.project(a);
  const pb = projection.project(b);
  ctx.save();
  ctx.strokeStyle = 'rgba(234,211,137,.75)';
  ctx.setLineDash([7, 7]);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(pa[0], pa[1]);
  ctx.lineTo(pb[0], pb[1]);
  ctx.stroke();
  ctx.restore();
}

function drawPivotStar(projection) {
  if (!state.pivotPoint) return;
  const [x,y] = projection.project(state.pivotPoint);
  state.lastStarScreen = [x, y];
  const spikes = 5;
  const outer = 14;
  const inner = 6;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(-Math.PI / 2);
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = i * Math.PI / spikes;
    const px = Math.cos(a) * r;
    const py = Math.sin(a) * r;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = '#ffe38c';
  ctx.strokeStyle = '#4b3210';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function pointerOnCanvas(ev) {
  const rect = canvas.getBoundingClientRect();
  const dprX = canvas.width / rect.width;
  const dprY = canvas.height / rect.height;
  return [(ev.clientX - rect.left) * dprX, (ev.clientY - rect.top) * dprY];
}

function distance2(a, b) {
  const dx = a[0] - b[0];
  const dy = a[1] - b[1];
  return dx * dx + dy * dy;
}

canvas.addEventListener('pointerdown', ev => {
  if (!state.lastStarScreen || !state.pivotPoint) return;
  const p = pointerOnCanvas(ev);
  if (distance2(p, state.lastStarScreen) > 28 * 28) return;
  state.dragging = 'star';
  state.lastMouse = p;
  canvas.classList.add('dragging-star');
  canvas.setPointerCapture(ev.pointerId);
});

canvas.addEventListener('pointermove', ev => {
  if (state.dragging === 'star') dragPivot(ev);
});

canvas.addEventListener('pointerup', ev => {
  state.dragging = null;
  canvas.classList.remove('dragging-star');
  try { canvas.releasePointerCapture(ev.pointerId); } catch {}
});

canvas.addEventListener('wheel', ev => {
  ev.preventDefault();
  state.zoom = clamp(state.zoom * (ev.deltaY < 0 ? 1.12 : 0.9), 0.15, 10);
  drawPreview();
}, { passive: false });

function roundPoint(v) {
  return v.map(n => round(n, 5));
}

function dragPivot(ev) {
  const projection = getRotatedProjection();
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
window.addEventListener('resize', drawPreview);

function loadSavedScaleUi() {
  const savedMode = localStorage.getItem(TARGET_MODE_KEY);
  const savedTarget = localStorage.getItem(TARGET_SIZE_KEY);
  const savedManual = localStorage.getItem(MANUAL_SCALE_KEY);
  if (savedMode) targetModeSelect.value = savedMode;
  if (savedTarget) targetSizeInput.value = savedTarget;
  if (savedManual) scaleInput.value = savedManual;
}

assertFolderPickerSupport();
loadSavedScaleUi();
updateQualityLabel();
updateViewButtons();
updateScaleReadout();
drawPreview();
initialiseRememberedFolder();
