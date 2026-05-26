import { ROLE_TEMPLATES } from './templates.js';

const PATCH_VERSION = '1.04';
const ICON_ATLAS_PATH = `./v1/icons/object-archetypes/icons1.png?v=${PATCH_VERSION}`;
const ATLAS_COLUMNS = 6;
const ATLAS_ROWS = 3;
const ATLAS_CROP_HEIGHT_RATIO = 0.74;
const ATLAS_CROP_TOP_INSET = 5;

const TEMPLATE_ATLAS_POSITIONS = {
  person_static: [0, 0],
  person_npc_basic: [1, 0],
  person_npc_moving: [2, 0],
  person_vendor_job: [3, 0],
  person_companion: [4, 0],
  person_player_full: [5, 0],
  person_foe_human: [0, 1],
  person_thrall: [1, 1],
  person_caster: [2, 1],
  creature_foe: [3, 1],
  boss_bellator: [4, 1],
  static_prop: [5, 1],
  door_exit: [0, 2],
  pickup: [1, 2],
  searchable_cache: [2, 2],
  throwable_object: [3, 2],
  marker: [4, 2],
  hazard: [5, 2]
};

let atlasPromise = null;
let queued = false;
const cropCache = new Map();

function loadAtlas() {
  if (atlasPromise) return atlasPromise;
  atlasPromise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${ICON_ATLAS_PATH}`));
    image.src = ICON_ATLAS_PATH;
  });
  return atlasPromise;
}

function cropIcon(templateId) {
  if (cropCache.has(templateId)) return Promise.resolve(cropCache.get(templateId));
  const position = TEMPLATE_ATLAS_POSITIONS[templateId];
  if (!position) return Promise.resolve('');

  return loadAtlas().then((atlas) => {
    const [column, row] = position;
    const cellWidth = atlas.naturalWidth / ATLAS_COLUMNS;
    const cellHeight = atlas.naturalHeight / ATLAS_ROWS;
    const sourceX = column * cellWidth;
    const sourceY = row * cellHeight + ATLAS_CROP_TOP_INSET;
    const sourceWidth = cellWidth;
    const sourceHeight = cellHeight * ATLAS_CROP_HEIGHT_RATIO;

    const canvas = document.createElement('canvas');
    canvas.width = 304;
    canvas.height = 305;
    const context = canvas.getContext('2d');
    if (!context) return '';

    context.clearRect(0, 0, canvas.width, canvas.height);
    const padding = 2;
    const scale = Math.min((canvas.width - padding * 2) / sourceWidth, (canvas.height - padding * 2) / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const drawX = (canvas.width - drawWidth) / 2;
    const drawY = (canvas.height - drawHeight) / 2;

    context.drawImage(atlas, sourceX, sourceY, sourceWidth, sourceHeight, drawX, drawY, drawWidth, drawHeight);
    const dataUrl = canvas.toDataURL('image/png');
    cropCache.set(templateId, dataUrl);
    return dataUrl;
  });
}

function readTemplateId(card) {
  const direct = card.dataset.templateId || card.dataset.role || card.dataset.template;
  if (direct && ROLE_TEMPLATES[direct]) return direct;
  const text = card.textContent?.trim().toLowerCase() || '';
  return Object.entries(ROLE_TEMPLATES).find(([, template]) => text.includes(String(template.label).toLowerCase()))?.[0] || '';
}

function patchAtlasIcons() {
  document.querySelectorAll('.object-template-card, .template-card, .library-card').forEach((card) => {
    const templateId = readTemplateId(card);
    if (!templateId || card.dataset.iconCropPatch === `${templateId}-${PATCH_VERSION}`) return;
    const visual = card.querySelector(':scope > .template-visual, .template-visual');
    if (!visual) return;

    card.dataset.iconCropPatch = `${templateId}-${PATCH_VERSION}`;
    cropIcon(templateId).then((dataUrl) => {
      if (!dataUrl) return;
      let image = visual.querySelector('.template-icon-img');
      if (!image) {
        image = document.createElement('img');
        image.className = 'template-icon-img';
        image.alt = `${ROLE_TEMPLATES[templateId].label} icon`;
        visual.replaceChildren(image);
      }
      image.src = dataUrl;
    }).catch(() => {});
  });
}

function schedulePatch() {
  if (queued) return;
  queued = true;
  window.requestAnimationFrame(() => {
    queued = false;
    patchAtlasIcons();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  patchAtlasIcons();
  new MutationObserver(schedulePatch).observe(document.body, { childList: true, subtree: true });
});
