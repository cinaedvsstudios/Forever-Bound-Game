import { ROLE_TEMPLATES } from './templates.js';

const PATCH_VERSION = '1.06';
const ICON_ROW_PATHS = [
  `./v1/icons/object-archetypes/icons1.png?v=${PATCH_VERSION}`,
  `./v1/icons/object-archetypes/icons2.png?v=${PATCH_VERSION}`,
  `./v1/icons/object-archetypes/icons3.png?v=${PATCH_VERSION}`
];
const ATLAS_COLUMNS = 6;
const OUTPUT_WIDTH = 304;
const OUTPUT_HEIGHT = 305;

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

const rowAtlasPromises = new Map();
let queued = false;
const cropCache = new Map();

function loadRowAtlas(row) {
  if (rowAtlasPromises.has(row)) return rowAtlasPromises.get(row);
  const path = ICON_ROW_PATHS[row] || ICON_ROW_PATHS[0];
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load ${path}`));
    image.src = path;
  });
  rowAtlasPromises.set(row, promise);
  return promise;
}

function cropIcon(templateId) {
  if (cropCache.has(templateId)) return Promise.resolve(cropCache.get(templateId));
  const position = TEMPLATE_ATLAS_POSITIONS[templateId];
  if (!position) return Promise.resolve('');

  const [column, row] = position;
  return loadRowAtlas(row).then((atlas) => {
    const cellWidth = atlas.naturalWidth / ATLAS_COLUMNS;
    const cellHeight = atlas.naturalHeight;
    const sourceX = column * cellWidth;
    const sourceY = 0;

    const canvas = document.createElement('canvas');
    canvas.width = OUTPUT_WIDTH;
    canvas.height = OUTPUT_HEIGHT;
    const context = canvas.getContext('2d');
    if (!context) return '';

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(atlas, sourceX, sourceY, cellWidth, cellHeight, 0, 0, OUTPUT_WIDTH, OUTPUT_HEIGHT);
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
