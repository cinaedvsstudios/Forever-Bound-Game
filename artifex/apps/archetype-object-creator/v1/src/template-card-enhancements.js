import { editorState } from './editor-state.js';
import { ROLE_TEMPLATES } from './templates.js';

const VERSION = '1.10';
const ICON_PATHS = [
  `./v1/icons/object-archetypes/icons1.png?v=${VERSION}`,
  `./v1/icons/object-archetypes/icons2.png?v=${VERSION}`,
  `./v1/icons/object-archetypes/icons3.png?v=${VERSION}`
];
const COLUMNS = 6;
const COMBINED_ROWS = 3;
const OUT_W = 304;
const OUT_H = 305;

const GROUPS = {
  person_static: 'people', person_npc_basic: 'people', person_npc_moving: 'people', person_vendor_job: 'people', person_companion: 'people',
  person_player_full: 'hero', person_foe_human: 'hostile-human', person_thrall: 'possessed', person_caster: 'caster', creature_foe: 'creature', boss_bellator: 'boss',
  static_prop: 'prop', door_exit: 'door', pickup: 'pickup', searchable_cache: 'cache', throwable_object: 'interactable', marker: 'marker', hazard: 'hazard'
};

const POSITIONS = {
  person_static: [0, 0], person_npc_basic: [1, 0], person_npc_moving: [2, 0], person_vendor_job: [3, 0], person_companion: [4, 0], person_player_full: [5, 0],
  person_foe_human: [0, 1], person_thrall: [1, 1], person_caster: [2, 1], creature_foe: [3, 1], boss_bellator: [4, 1], static_prop: [5, 1],
  door_exit: [0, 2], pickup: [1, 2], searchable_cache: [2, 2], throwable_object: [3, 2], marker: [4, 2], hazard: [5, 2]
};

const FALLBACK = {
  person_static: '♙', person_npc_basic: '♙', person_npc_moving: '♙', person_vendor_job: '◇', person_companion: '✦', person_player_full: '☥',
  person_foe_human: '⚔', person_thrall: '◎', person_caster: '✧', creature_foe: '♞', boss_bellator: '♛', static_prop: '▣',
  door_exit: '⌂', pickup: '✦', searchable_cache: '▤', throwable_object: '◈', marker: '⬡', hazard: '⚠'
};

const CSS = `
.object-template-card { --template-accent:#e2cca7; --template-soft:rgba(226,204,167,.16); --template-glow:rgba(226,204,167,.28); max-width:186px !important; padding:10px !important; border-color:color-mix(in srgb,var(--template-accent),#382a21 58%) !important; background:radial-gradient(circle at 50% 14%,var(--template-soft),transparent 44%),linear-gradient(180deg,rgba(34,25,20,.98),rgba(16,12,10,.98)) !important; box-shadow:0 10px 22px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,240,206,.03) !important; }
.object-template-card:hover { border-color:var(--template-accent) !important; box-shadow:0 0 0 1px var(--template-soft),0 0 24px var(--template-glow),0 14px 26px rgba(0,0,0,.72) !important; }
.object-template-card[data-template-group='people']{--template-accent:#e2cca7;--template-soft:rgba(226,204,167,.18);--template-glow:rgba(226,204,167,.34)}
.object-template-card[data-template-group='hero']{--template-accent:#d84545;--template-soft:rgba(216,69,69,.22);--template-glow:rgba(216,69,69,.42)}
.object-template-card[data-template-group='hostile-human']{--template-accent:#b83131;--template-soft:rgba(184,49,49,.24);--template-glow:rgba(184,49,49,.42)}
.object-template-card[data-template-group='possessed']{--template-accent:#9e4cff;--template-soft:rgba(158,76,255,.20);--template-glow:rgba(158,76,255,.38)}
.object-template-card[data-template-group='caster']{--template-accent:#f277d5;--template-soft:rgba(242,119,213,.18);--template-glow:rgba(242,119,213,.36)}
.object-template-card[data-template-group='creature']{--template-accent:#9dbb3f;--template-soft:rgba(157,187,63,.18);--template-glow:rgba(157,187,63,.36)}
.object-template-card[data-template-group='boss']{--template-accent:#c35cff;--template-soft:rgba(195,92,255,.22);--template-glow:rgba(195,92,255,.44)}
.object-template-card[data-template-group='prop']{--template-accent:#9f8b74;--template-soft:rgba(159,139,116,.18);--template-glow:rgba(159,139,116,.30)}
.object-template-card[data-template-group='door']{--template-accent:#c9863b;--template-soft:rgba(201,134,59,.18);--template-glow:rgba(201,134,59,.36)}
.object-template-card[data-template-group='pickup']{--template-accent:#f2d36b;--template-soft:rgba(242,211,107,.20);--template-glow:rgba(242,211,107,.40)}
.object-template-card[data-template-group='cache']{--template-accent:#a46c3f;--template-soft:rgba(164,108,63,.20);--template-glow:rgba(164,108,63,.36)}
.object-template-card[data-template-group='interactable']{--template-accent:#57bd8c;--template-soft:rgba(87,189,140,.18);--template-glow:rgba(87,189,140,.36)}
.object-template-card[data-template-group='marker']{--template-accent:#c6d967;--template-soft:rgba(198,217,103,.18);--template-glow:rgba(198,217,103,.36)}
.object-template-card[data-template-group='hazard']{--template-accent:#ff7b3d;--template-soft:rgba(255,123,61,.22);--template-glow:rgba(255,123,61,.42)}
.template-card-grid,.wizard-template-grid,.wizard-existing-grid{grid-template-columns:repeat(auto-fill,minmax(174px,186px)) !important;justify-content:start !important;align-items:start !important;gap:14px !important}
.template-visual{width:100% !important;aspect-ratio:304/305 !important;min-height:0 !important;height:auto !important;display:grid !important;place-items:center !important;overflow:hidden !important;margin:0 0 10px !important;padding:8px !important;border:1px solid color-mix(in srgb,var(--template-accent),#382a21 52%) !important;border-radius:16px !important;background:radial-gradient(circle at 50% 42%,var(--template-soft),transparent 48%),linear-gradient(180deg,rgba(35,26,21,.92),rgba(14,10,9,.95)) !important;box-shadow:inset 0 0 0 1px rgba(255,240,206,.04) !important}
.template-icon-img{width:62% !important;height:62% !important;max-width:none !important;max-height:none !important;object-fit:contain !important;filter:drop-shadow(0 0 12px var(--template-glow)) !important}
.template-icon-fallback{width:40% !important;height:40% !important;display:grid !important;place-items:center !important;border-radius:999px !important;color:#fff0ce !important;background:var(--template-soft) !important;box-shadow:0 0 18px var(--template-glow) !important;font-size:clamp(28px,4vw,46px) !important;line-height:1 !important}
.object-template-card h4{font-size:13px !important;line-height:1.2 !important;margin-bottom:5px !important}.object-template-card p{font-size:11px !important;line-height:1.25 !important}.object-template-card button{width:100% !important;min-height:38px !important;padding:8px 10px !important;font-size:13px !important}.menu-bar{flex:1;justify-content:center}@media(max-width:980px){.menu-bar{justify-content:flex-start}}
body .wizard-session-wrap .wizard-session-button{width:auto!important;height:auto!important;min-width:0!important;min-height:0!important;padding:0 6px!important;border:none!important;background:transparent!important;border-radius:0!important;box-shadow:none!important;color:#fff0ce!important;font-size:30px!important;line-height:1!important;display:flex!important;align-items:center!important;justify-content:center!important;text-shadow:0 0 6px rgba(216,69,69,.90),0 0 16px rgba(216,69,69,.72),0 0 28px rgba(216,69,69,.50),0 0 42px rgba(216,69,69,.28)!important;filter:none!important}body .wizard-session-wrap .wizard-session-button:hover,body .wizard-session-wrap .wizard-session-button:focus{background:transparent!important;border:none!important;box-shadow:none!important;transform:scale(1.12)!important}.wizard-session-wrap{display:none;align-items:center}.wizard-session-wrap.has-sessions{display:flex!important}
#quickstart-dialog.wizard-dialog{width:min(94vw,1400px)!important;max-width:94vw!important;overflow:hidden!important}#quickstart-dialog .dialog-shell{width:100%!important;max-width:100%!important;max-height:92vh!important;overflow:hidden!important}#quickstart-dialog .wizard-content{max-height:calc(92vh - 112px)!important;overflow:auto!important;overflow-x:hidden!important;padding-right:8px!important}#quickstart-dialog .wizard-build-shell{grid-template-columns:minmax(230px,310px) minmax(0,1fr)!important;gap:14px!important;min-height:620px!important;max-width:100%!important;overflow:hidden!important}#quickstart-dialog .wizard-build-left{min-width:0!important}#quickstart-dialog .wizard-build-nav button{grid-template-columns:22px minmax(0,1fr) auto!important}#quickstart-dialog .wizard-build-nav small{display:block!important;margin-top:3px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}#quickstart-dialog .wizard-build-detail-panel{display:grid!important;grid-template-columns:minmax(280px,.82fr) minmax(300px,1.18fr)!important;align-content:start!important;column-gap:16px!important;row-gap:10px!important;min-width:0!important;overflow:hidden!important}#quickstart-dialog .wizard-build-detail-panel>h3,#quickstart-dialog .wizard-build-detail-panel>p.hint{grid-column:1/-1!important;min-width:0!important}#quickstart-dialog .wizard-preview-stage{grid-column:1!important;grid-row:3!important;width:100%!important;max-width:390px!important;margin:2px 0 0!important}#quickstart-dialog .wizard-preview-controls{grid-column:1!important;grid-row:4!important;margin:8px 0 0!important}#quickstart-dialog .wizard-build-fields{grid-column:2!important;grid-row:3!important;grid-template-columns:repeat(2,minmax(130px,1fr))!important;margin:0!important;align-self:start!important;min-width:0!important}#quickstart-dialog .wizard-build-detail-panel>.wizard-notes-field{grid-column:2!important;grid-row:4/span 2!important;align-self:start!important;min-width:0!important}#quickstart-dialog .wizard-build-detail-panel>.wizard-notes-field textarea{min-height:96px!important;resize:vertical!important}#quickstart-dialog .wizard-correction-grid{grid-column:1!important;grid-row:5!important;grid-template-columns:1fr!important;gap:8px!important;align-self:start!important;margin:0!important}#quickstart-dialog .wizard-correction-grid label{grid-template-columns:1fr!important}#quickstart-dialog .wizard-correction-grid button{width:100%!important;min-height:40px!important;text-align:center!important}#quickstart-dialog .wizard-frame-strip{grid-column:1/-1!important;grid-row:6!important;min-height:170px!important;width:100%!important;max-width:100%!important;overflow-x:auto!important;margin-top:4px!important}#quickstart-dialog .wizard-frame-strip.is-drag-over{box-shadow:0 0 0 1px var(--red),0 0 22px rgba(216,69,69,.32)!important}#quickstart-dialog .wizard-frame-strip .hint{margin:auto!important;text-align:center!important}#quickstart-dialog .wizard-build-actions{grid-column:1/-1!important;grid-row:7!important;display:flex!important;flex-wrap:wrap!important;gap:8px!important;margin:0!important}#quickstart-dialog .wizard-download-zip-button{margin-left:auto!important}.wizard-frame-file-table-wrap{grid-column:1/-1!important;grid-row:8!important;border:1px solid rgba(226,204,167,.18);border-radius:14px;background:rgba(0,0,0,.14);overflow:auto;max-width:100%}.wizard-frame-file-table{width:100%;border-collapse:collapse;font-size:11px}.wizard-frame-file-table th,.wizard-frame-file-table td{padding:7px 8px;border-bottom:1px solid rgba(226,204,167,.12);vertical-align:top}.wizard-frame-file-table th{text-align:left;color:#e2cca7;text-transform:uppercase;letter-spacing:.08em;font-size:10px}.wizard-frame-file-table code{white-space:normal;word-break:break-word;color:#fff0ce}.wizard-frame-file-table .muted{color:rgba(255,240,206,.58)}#quickstart-dialog .wizard-frame-box{flex-basis:112px!important;min-height:112px!important}@media(max-width:1100px){#quickstart-dialog.wizard-dialog{width:96vw!important;max-width:96vw!important}#quickstart-dialog .wizard-build-shell{grid-template-columns:1fr!important}#quickstart-dialog .wizard-build-detail-panel{grid-template-columns:1fr!important}#quickstart-dialog .wizard-build-detail-panel>*{grid-column:1!important;grid-row:auto!important}#quickstart-dialog .wizard-build-fields{grid-template-columns:1fr!important}}
`;

const imagePromises = new Map();
const cropCache = new Map();
let observer = null;
let queued = false;
const textEncoder = new TextEncoder();

function injectStyles() {
  if (document.getElementById('object-template-card-enhancements')) return;
  const style = document.createElement('style');
  style.id = 'object-template-card-enhancements';
  style.textContent = CSS;
  document.head.appendChild(style);
}

function loadImage(path) {
  if (imagePromises.has(path)) return imagePromises.get(path);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${path}`));
    image.src = path;
  });
  imagePromises.set(path, promise);
  return promise;
}

function loadBestAtlas(row) {
  return loadImage(ICON_PATHS[row] || ICON_PATHS[0]).catch(() => loadImage(ICON_PATHS[0]));
}

function cropIcon(templateId) {
  if (cropCache.has(templateId)) return Promise.resolve(cropCache.get(templateId));
  const position = POSITIONS[templateId];
  if (!position) return Promise.resolve('');
  const [column, row] = position;

  return loadBestAtlas(row).then((atlas) => {
    const singleCellWidth = atlas.naturalWidth / COLUMNS;
    const looksCombined = atlas.naturalHeight > singleCellWidth * 1.45;
    const sourceCellHeight = looksCombined ? atlas.naturalHeight / COMBINED_ROWS : atlas.naturalHeight;
    const sourceRow = looksCombined ? row : 0;

    const canvas = document.createElement('canvas');
    canvas.width = OUT_W;
    canvas.height = OUT_H;
    const context = canvas.getContext('2d');
    if (!context) return '';

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(atlas, column * singleCellWidth, sourceRow * sourceCellHeight, singleCellWidth, sourceCellHeight, 0, 0, OUT_W, OUT_H);

    const dataUrl = canvas.toDataURL('image/png');
    cropCache.set(templateId, dataUrl);
    return dataUrl;
  });
}

function decorateTemplateCards() {
  document.querySelectorAll('.template-card, .library-card').forEach(decorateTemplateCard);
}

function decorateTemplateCard(card) {
  const templateId = readTemplateId(card);
  if (!templateId || !ROLE_TEMPLATES[templateId]) return;

  card.dataset.templateId = templateId;
  card.dataset.templateGroup = GROUPS[templateId] || 'default';
  card.classList.add('object-template-card');

  let visual = card.querySelector(':scope > .template-visual') || card.querySelector('.template-visual, .library-card-preview, .template-icon');
  if (!visual) {
    visual = document.createElement('div');
    visual.className = 'template-visual';
    card.prepend(visual);
  }

  visual.classList.add('template-visual');
  visual.dataset.templateGroup = GROUPS[templateId] || 'default';
  visual.dataset.iconFor = templateId;

  if (card.dataset.templateIconReady !== `${templateId}-${VERSION}`) {
    showFallbackIcon(visual, templateId);
    card.dataset.templateIconReady = `${templateId}-${VERSION}`;
  }

  cropIcon(templateId).then((dataUrl) => {
    if (!dataUrl || visual.dataset.iconFor !== templateId) return;
    const image = document.createElement('img');
    image.className = 'template-icon-img';
    image.alt = `${ROLE_TEMPLATES[templateId].label} icon`;
    image.src = dataUrl;
    visual.replaceChildren(image);
  }).catch(() => {});
}

function showFallbackIcon(visual, templateId) {
  const fallback = document.createElement('span');
  fallback.className = 'template-icon-fallback';
  fallback.textContent = FALLBACK[templateId] || '⬡';
  visual.replaceChildren(fallback);
}

function readTemplateId(card) {
  const direct = card.dataset.templateId || card.dataset.role || card.dataset.template;
  if (direct && ROLE_TEMPLATES[direct]) return direct;
  const button = card.querySelector('[data-template-id], [data-role], [data-template]');
  const nested = button?.dataset.templateId || button?.dataset.role || button?.dataset.template;
  if (nested && ROLE_TEMPLATES[nested]) return nested;
  const text = card.textContent?.trim().toLowerCase() || '';
  return Object.entries(ROLE_TEMPLATES).find(([, template]) => text.includes(String(template.label).toLowerCase()))?.[0] || '';
}

function enhanceWizardBuildPanel() {
  const panel = document.querySelector('#quickstart-dialog .wizard-build-detail-panel');
  if (!panel) return;

  const notesField = panel.querySelector('textarea[data-build="notes"]')?.closest('label');
  if (notesField) notesField.classList.add('wizard-notes-field');

  const strip = panel.querySelector('[data-frame-strip]');
  if (strip) {
    strip.classList.add('wizard-frame-drop-zone');
    const hint = strip.querySelector('.hint');
    if (hint && !strip.querySelector('.wizard-frame-box')) hint.textContent = 'Drop image files here, or use Add image files below.';
  }

  const actions = panel.querySelector('.wizard-build-actions');
  if (actions && !actions.querySelector('[data-download-asset-zip]')) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'wizard-download-zip-button';
    button.dataset.downloadAssetZip = 'true';
    button.textContent = 'Download asset ZIP';
    button.addEventListener('click', downloadAssetZip);
    actions.appendChild(button);
  }

  renderFramePathTable(panel);
}

function renderFramePathTable(panel) {
  const selectedId = selectedRequirementId();
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

function selectedRequirementId() {
  return document.querySelector('#quickstart-dialog .wizard-build-nav button.is-selected')?.dataset.requirementId || '';
}

function getRequirementData(requirementId) {
  return editorState.archetype?.productionAssets?.requirements?.[requirementId] || {};
}

function expectedFramePath(requirementId, frame, index) {
  const actionId = actionIdFromRequirement(requirementId);
  const folder = objectAssetFolder();
  const padded = String(index + 1).padStart(3, '0');
  const sourceName = frame?.name || `${actionId}_${padded}.png`;
  const ext = extensionFromName(sourceName) || 'png';
  const mode = requirementId.startsWith('portrait:') ? 'portraits' : requirementId.startsWith('asset:') ? 'assets' : requirementId.startsWith('metadata:') ? 'metadata' : 'animations';
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

function actionIdFromRequirement(requirementId) {
  return String(requirementId || '').split(':')[1] || String(requirementId || 'asset');
}

function downloadAssetZip() {
  try {
    const zipBytes = buildAssetZip();
    const blob = new Blob([zipBytes], { type: 'application/zip' });
    const objectId = safeId(editorState.archetype?.id || editorState.archetype?.name || 'object_archetype');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${objectId}_asset_package.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(link.href);
    window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message: 'Asset ZIP created from uploaded frames.', type: 'success' } }));
  } catch (error) {
    window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message: `Could not create ZIP: ${error.message}`, type: 'error' } }));
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
    files: []
  };

  Object.entries(requirements).forEach(([requirementId, data]) => {
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

function dataUrlToBytes(dataUrl) {
  const [, meta = '', data = ''] = String(dataUrl).match(/^data:([^,]*),(.*)$/) || [];
  if (!data) return new Uint8Array();
  if (meta.includes(';base64')) {
    const raw = atob(data);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i += 1) bytes[i] = raw.charCodeAt(i);
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
  parts.forEach((part) => { out.set(part, offset); offset += part.length; });
  return out;
}

let crcTable;
function crc32(bytes) {
  if (!crcTable) crcTable = makeCrcTable();
  let crc = 0 ^ -1;
  for (let i = 0; i < bytes.length; i += 1) crc = (crc >>> 8) ^ crcTable[(crc ^ bytes[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}
function makeCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
}
function dosTime(date = new Date()) { return (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2); }
function dosDate(date = new Date()) { return ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(); }
function extensionFromName(name) { return String(name || '').split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''; }
function removeExtension(name) { return String(name || '').replace(/\.[^.]+$/, ''); }
function safeId(value) { return String(value || 'object').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'object'; }
function escapeHtml(value) { return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char])); }

function scheduleDecorate() {
  if (queued) return;
  queued = true;
  window.requestAnimationFrame(() => {
    queued = false;
    decorateTemplateCards();
    enhanceWizardBuildPanel();
  });
}

function startObserver() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    const shouldScan = mutations.some((mutation) => Array.from(mutation.addedNodes).some((node) => node.nodeType === Node.ELEMENT_NODE));
    if (shouldScan) scheduleDecorate();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

window.addEventListener('DOMContentLoaded', () => {
  injectStyles();
  decorateTemplateCards();
  enhanceWizardBuildPanel();
  startObserver();
});