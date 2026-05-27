import { ROLE_TEMPLATES } from './templates.js';

const VERSION = '1.23';
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
  person_static: 'people',
  person_npc_basic: 'people',
  person_npc_moving: 'people',
  person_vendor_job: 'people',
  person_companion: 'people',
  person_player_full: 'hero',
  person_foe_human: 'hostile-human',
  person_thrall: 'possessed',
  person_caster: 'caster',
  creature_foe: 'creature',
  boss_bellator: 'boss',
  static_prop: 'prop',
  door_exit: 'door',
  pickup: 'pickup',
  searchable_cache: 'cache',
  throwable_object: 'interactable',
  marker: 'marker',
  hazard: 'hazard'
};

const POSITIONS = {
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

const FALLBACK = {
  person_static: '♙',
  person_npc_basic: '♙',
  person_npc_moving: '♙',
  person_vendor_job: '◇',
  person_companion: '✦',
  person_player_full: '☥',
  person_foe_human: '⚔',
  person_thrall: '◎',
  person_caster: '✧',
  creature_foe: '♞',
  boss_bellator: '♛',
  static_prop: '▣',
  door_exit: '⌂',
  pickup: '✦',
  searchable_cache: '▤',
  throwable_object: '◈',
  marker: '⬡',
  hazard: '⚠'
};

const CSS = `
.object-template-card{
  --template-accent:#e2cca7;
  --template-soft:rgba(226,204,167,.16);
  --template-glow:rgba(226,204,167,.28);
  max-width:186px!important;
  padding:10px!important;
  border-color:color-mix(in srgb,var(--template-accent),#382a21 58%)!important;
  background:radial-gradient(circle at 50% 14%,var(--template-soft),transparent 44%),linear-gradient(180deg,rgba(34,25,20,.98),rgba(16,12,10,.98))!important;
  box-shadow:0 10px 22px rgba(0,0,0,.55),inset 0 0 0 1px rgba(255,240,206,.03)!important;
}
.object-template-card:hover{
  border-color:var(--template-accent)!important;
  box-shadow:0 0 0 1px var(--template-soft),0 0 24px var(--template-glow),0 14px 26px rgba(0,0,0,.72)!important;
}
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
.template-card-grid,.wizard-template-grid,.wizard-existing-grid{
  grid-template-columns:repeat(auto-fill,minmax(174px,186px))!important;
  justify-content:start!important;
  align-items:start!important;
  gap:14px!important;
}
.template-visual{
  width:100%!important;
  aspect-ratio:304/305!important;
  min-height:0!important;
  height:auto!important;
  display:grid!important;
  place-items:center!important;
  overflow:hidden!important;
  margin:0 0 10px!important;
  padding:8px!important;
  border:1px solid color-mix(in srgb,var(--template-accent),#382a21 52%)!important;
  border-radius:16px!important;
  background:radial-gradient(circle at 50% 42%,var(--template-soft),transparent 48%),linear-gradient(180deg,rgba(35,26,21,.92),rgba(14,10,9,.95))!important;
  box-shadow:inset 0 0 0 1px rgba(255,240,206,.04)!important;
}
.template-icon-img{
  width:62%!important;
  height:62%!important;
  max-width:none!important;
  max-height:none!important;
  object-fit:contain!important;
  filter:drop-shadow(0 0 12px var(--template-glow))!important;
}
.template-icon-fallback{
  width:40%!important;
  height:40%!important;
  display:grid!important;
  place-items:center!important;
  border-radius:999px!important;
  color:#fff0ce!important;
  background:var(--template-soft)!important;
  box-shadow:0 0 18px var(--template-glow)!important;
  font-size:clamp(28px,4vw,46px)!important;
  line-height:1!important;
}
.object-template-card h4{font-size:13px!important;line-height:1.2!important;margin-bottom:5px!important}
.object-template-card p{font-size:11px!important;line-height:1.25!important}
.object-template-card button{width:100%!important;min-height:38px!important;padding:8px 10px!important;font-size:13px!important}
`;

const imagePromises = new Map();
const cropCache = new Map();
let observer = null;
let queued = false;

export function initObjectTemplateIcons() {
  injectStyles();
  decorateTemplateCards();
  startObserver();
}

function injectStyles() {
  if (document.getElementById('object-template-icons-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-template-icons-styles';
  style.textContent = CSS;
  document.head.appendChild(style);
}

function startObserver() {
  if (observer) return;
  observer = new MutationObserver((mutations) => {
    const shouldScan = mutations.some((mutation) => Array.from(mutation.addedNodes).some((node) => node.nodeType === Node.ELEMENT_NODE));
    if (shouldScan) scheduleDecorate();
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

function scheduleDecorate() {
  if (queued) return;
  queued = true;
  window.requestAnimationFrame(() => {
    queued = false;
    decorateTemplateCards();
  });
}

function decorateTemplateCards() {
  document.querySelectorAll('.template-card,.library-card').forEach(decorateTemplateCard);
}

function decorateTemplateCard(card) {
  const templateId = readTemplateId(card);
  if (!templateId || !ROLE_TEMPLATES[templateId]) return;
  card.dataset.templateId = templateId;
  card.dataset.templateGroup = GROUPS[templateId] || 'default';
  card.classList.add('object-template-card');

  let visual = card.querySelector(':scope > .template-visual') || card.querySelector('.template-visual,.library-card-preview,.template-icon');
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

  const button = card.querySelector('[data-template-id],[data-role],[data-template]');
  const nested = button?.dataset.templateId || button?.dataset.role || button?.dataset.template;
  if (nested && ROLE_TEMPLATES[nested]) return nested;

  const text = card.textContent?.trim().toLowerCase() || '';
  return Object.entries(ROLE_TEMPLATES).find(([, template]) => text.includes(String(template.label).toLowerCase()))?.[0] || '';
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

function loadBestAtlas(row) {
  return loadImage(ICON_PATHS[row] || ICON_PATHS[0]).catch(() => loadImage(ICON_PATHS[0]));
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
