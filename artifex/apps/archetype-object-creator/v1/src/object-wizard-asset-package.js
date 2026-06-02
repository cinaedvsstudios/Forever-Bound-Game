import { editorState } from './editor-state.js';

const VERSION = '1.36';
const textEncoder = new TextEncoder();
let crcTable;

export function initObjectWizardAssetPackage() {
  injectAssetPackageStyles();
}

export function bindObjectWizardAssetPackage(panel, selectedId) {
  if (!panel || !selectedId) return;
  const button = panel.querySelector('[data-download-asset-zip]');
  if (button && !button.dataset.boundAssetZip) {
    button.dataset.boundAssetZip = 'true';
    button.addEventListener('click', downloadAssetZip);
  }
  renderFramePathTable(panel, selectedId);
}

function injectAssetPackageStyles() {
  if (document.getElementById('object-wizard-asset-package-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-wizard-asset-package-styles';
  style.textContent = `
    #quickstart-dialog .wizard-build-actions {
      display: flex !important;
      flex-wrap: wrap !important;
      align-items: stretch !important;
      gap: 9px !important;
    }

    #quickstart-dialog .wizard-build-actions > button,
    #quickstart-dialog .wizard-build-actions > .button-like {
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      width: 188px !important;
      min-width: 188px !important;
      height: 40px !important;
      min-height: 40px !important;
      padding: 7px 12px !important;
      box-sizing: border-box !important;
      white-space: nowrap !important;
      font-size: 11px !important;
      line-height: 1.2 !important;
    }

    #quickstart-dialog .wizard-frame-file-table-wrap {
      grid-column: 1 / -1;
      margin-top: 8px;
      border: 1px solid rgba(226, 204, 167, 0.16);
      border-radius: 14px;
      background: rgba(0, 0, 0, 0.14);
      overflow: auto;
      max-height: 180px;
    }

    #quickstart-dialog .wizard-frame-file-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 11px;
      color: rgba(255, 240, 206, 0.78);
    }

    #quickstart-dialog .wizard-frame-file-table th,
    #quickstart-dialog .wizard-frame-file-table td {
      border-bottom: 1px solid rgba(226, 204, 167, 0.12);
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }

    #quickstart-dialog .wizard-frame-file-table th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: rgba(18, 13, 11, 0.98);
      color: #e2cca7;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      font-size: 10px;
    }

    #quickstart-dialog .wizard-frame-file-table code {
      color: #fff0ce;
      word-break: break-word;
    }

    #quickstart-dialog .wizard-frame-file-table .muted {
      color: rgba(255, 240, 206, 0.52);
      text-align: center;
    }

    #quickstart-dialog .wizard-download-zip-button {
      white-space: nowrap;
    }

    @media (max-width: 680px) {
      #quickstart-dialog .wizard-build-actions > button,
      #quickstart-dialog .wizard-build-actions > .button-like {
        width: 100% !important;
        min-width: 0 !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function renderFramePathTable(panel, selectedId) {
  const actions = panel.querySelector('.wizard-build-actions');
  if (!selectedId || !actions) return;
  let wrap = panel.querySelector('.wizard-frame-file-table-wrap');
  if (!wrap) {
    wrap = document.createElement('section');
    wrap.className = 'wizard-frame-file-table-wrap';
    actions.after(wrap);
  }

  const data = getRequirementData(selectedId);
  const frames = data.frames || [];
  const count = Math.max(frames.length, Number(data.frameCount) || 0);
  const rows = [];
  for (let index = 0; index < count; index += 1) {
    const frame = frames[index] || { name: `Frame ${index + 1}`, assetId: '' };
    rows.push(`<tr><td>${index + 1}</td><td>${escapeHtml(frame.name || `Frame ${index + 1}`)}</td><td><code>${escapeHtml(expectedFramePath(selectedId, frame, index))}</code></td></tr>`);
  }

  wrap.innerHTML = `<table class="wizard-frame-file-table"><thead><tr><th>#</th><th>Frame name</th><th>Expected game folder / file path</th></tr></thead><tbody>${rows.length ? rows.join('') : '<tr><td colspan="3" class="muted">No frame slots yet. Add images or set a frame count.</td></tr>'}</tbody></table>`;
}

function downloadAssetZip() {
  try {
    const zipBytes = buildAssetZip();
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    const objectId = safeId(editorState.archetype?.id || editorState.archetype?.name || 'object_archetype');
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `${objectId}_asset_package.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    toast('Backup ZIP created from uploaded frames.', 'success');
  } catch (error) {
    toast(`Could not create ZIP: ${error.message}`, 'error');
  }
}

function buildAssetZip() {
  const item = editorState.archetype || {};
  const requirements = item.productionAssets?.requirements || {};
  const files = [];
  const manifest = {
    packageType: 'artifex-archetype-object-assets',
    version: VERSION,
    archetypeId: item.id,
    archetypeName: item.name,
    rootFolder: objectAssetFolder(),
    generatedAt: new Date().toISOString(),
    files: [],
    actionSettings: {}
  };

  Object.entries(requirements).forEach(([requirementId, data]) => {
    manifest.actionSettings[requirementId] = {
      playbackRules: data.playbackRules || {},
      triggerMapping: data.triggerMapping || {},
      soundEvents: data.soundEvents || [],
      frameEvents: data.frameEvents || [],
      frameCorrections: data.frameCorrections || {},
      brightnessMatch: data.brightnessMatch || null
    };

    (data.frames || []).forEach((frame, index) => {
      if (!frame.dataUrl) return;
      const path = expectedFramePath(requirementId, frame, index);
      files.push({ path, bytes: dataUrlToBytes(frame.dataUrl) });
      manifest.files.push({ requirementId, frame: index + 1, name: frame.name || `Frame ${index + 1}`, path });
    });
  });

  files.push({ path: `${objectAssetFolder()}/metadata/archetype.json`, bytes: textEncoder.encode(JSON.stringify(item, null, 2)) });
  files.push({ path: `${objectAssetFolder()}/metadata/asset_manifest.json`, bytes: textEncoder.encode(JSON.stringify(manifest, null, 2)) });
  return createZip(files);
}

function expectedFramePath(requirementId, frame, index) {
  const actionId = actionIdFromRequirement(requirementId);
  const folder = objectAssetFolder();
  const padded = String(index + 1).padStart(3, '0');
  const sourceName = frame?.name || `${actionId}_${padded}.png`;
  const ext = extensionFromName(sourceName) || 'png';
  const mode = requirementId.startsWith('portrait:')
    ? 'portraits'
    : requirementId.startsWith('asset:')
      ? 'assets'
      : requirementId.startsWith('metadata:')
        ? 'metadata'
        : 'animations';

  if (requirementId === 'asset:gameplay_sprite') return `${folder}/sprites/${safeId(editorState.archetype?.id || 'object')}_gameplay_sheet.${ext}`;
  if (requirementId === 'asset:dialogue_portrait') return `${folder}/portraits/${safeId(editorState.archetype?.id || 'object')}_portrait_${padded}.${ext}`;
  if (requirementId.startsWith('metadata:')) return `${folder}/metadata/${safeId(actionId)}.json`;
  return `${folder}/${mode}/${safeId(actionId)}/${padded}_${safeId(removeExtension(sourceName))}.${ext}`;
}

function objectAssetFolder() {
  const item = editorState.archetype || {};
  const id = safeId(item.id || item.name || 'object_archetype');
  const category = String(item.category || '').toLowerCase();
  const role = String(item.role || '').toLowerCase();
  if (category.includes('npc') || category.includes('character') || role.startsWith('person_')) return `assets/characters/${id}`;
  if (category.includes('enemy') || category.includes('foe')) return `assets/foes/${id}`;
  if (category.includes('creature')) return `assets/creatures/${id}`;
  if (role.includes('boss') || category.includes('boss')) return `assets/bosses/${id}`;
  return `assets/objects/${id}`;
}

function dataUrlToBytes(dataUrl) {
  const [, meta = '', data = ''] = String(dataUrl).match(/^data:([^,]*),(.*)$/) || [];
  if (!data) return new Uint8Array();
  if (meta.includes(';base64')) {
    const raw = atob(data);
    const bytes = new Uint8Array(raw.length);
    for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
    return bytes;
  }
  return textEncoder.encode(decodeURIComponent(data));
}

function createZip(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;

  files.forEach((file) => {
    const name = textEncoder.encode(file.path.replace(/^\/+/, ''));
    const data = file.bytes instanceof Uint8Array ? file.bytes : new Uint8Array(file.bytes || []);
    const crc = crc32(data);

    const local = new Uint8Array(30 + name.length);
    const view = new DataView(local.buffer);
    view.setUint32(0, 0x04034b50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0, true);
    view.setUint16(8, 0, true);
    view.setUint16(10, dosTime(), true);
    view.setUint16(12, dosDate(), true);
    view.setUint32(14, crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, data.length, true);
    view.setUint16(26, name.length, true);
    view.setUint16(28, 0, true);
    local.set(name, 30);
    localParts.push(local, data);

    const central = new Uint8Array(46 + name.length);
    const cview = new DataView(central.buffer);
    cview.setUint32(0, 0x02014b50, true);
    cview.setUint16(4, 20, true);
    cview.setUint16(6, 20, true);
    cview.setUint16(8, 0, true);
    cview.setUint16(10, 0, true);
    cview.setUint16(12, dosTime(), true);
    cview.setUint16(14, dosDate(), true);
    cview.setUint32(16, crc, true);
    cview.setUint32(20, data.length, true);
    cview.setUint32(24, data.length, true);
    cview.setUint16(28, name.length, true);
    cview.setUint16(30, 0, true);
    cview.setUint16(32, 0, true);
    cview.setUint16(34, 0, true);
    cview.setUint16(36, 0, true);
    cview.setUint32(38, 0, true);
    cview.setUint32(42, offset, true);
    central.set(name, 46);
    centralParts.push(central);
    offset += local.length + data.length;
  });

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const eview = new DataView(end.buffer);
  eview.setUint32(0, 0x06054b50, true);
  eview.setUint16(8, files.length, true);
  eview.setUint16(10, files.length, true);
  eview.setUint32(12, centralSize, true);
  eview.setUint32(16, offset, true);
  return concatUint8([...localParts, ...centralParts, end]);
}

function concatUint8(parts) {
  const total = parts.reduce((sum, part) => sum + part.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  parts.forEach((part) => {
    out.set(part, offset);
    offset += part.length;
  });
  return out;
}

function crc32(bytes) {
  if (!crcTable) crcTable = makeCrcTable();
  let crc = 0 ^ -1;
  for (let index = 0; index < bytes.length; index += 1) crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[index]) & 0xff];
  return (crc ^ -1) >>> 0;
}

function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    table[index] = value >>> 0;
  }
  return table;
}

function selectedRequirementId() {
  return document.querySelector('#quickstart-dialog .wizard-build-nav button.is-selected')?.dataset.requirementId || '';
}

function getRequirementData(requirementId) {
  return editorState.archetype?.productionAssets?.requirements?.[requirementId] || {};
}

function actionIdFromRequirement(requirementId) {
  return String(requirementId || '').split(':')[1] || String(requirementId || 'asset');
}

function extensionFromName(name) {
  return String(name || '').split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || '';
}

function removeExtension(name) {
  return String(name || '').replace(/\.[^.]+$/, '');
}

function dosTime() {
  const now = new Date();
  return (now.getHours() << 11) | (now.getMinutes() << 5) | Math.floor(now.getSeconds() / 2);
}

function dosDate() {
  const now = new Date();
  return ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
}

function safeId(value) {
  return String(value || 'object').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'object';
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
}

function toast(message, type) {
  window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } }));
}
