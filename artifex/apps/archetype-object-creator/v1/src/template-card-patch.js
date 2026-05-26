import { ROLE_TEMPLATES } from './templates.js';

const ICON_BASE_PATH = './v1/icons/object-archetypes/';

export const TEMPLATE_COLOUR_GROUPS = {
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

export const TEMPLATE_ICON_FILES = Object.fromEntries(
  Object.keys(TEMPLATE_COLOUR_GROUPS).map((id) => [id, `${id}.png`])
);

const FALLBACK_SYMBOLS = {
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

function decorateTemplateCards() {
  document.querySelectorAll('.template-card, .library-card').forEach((card) => {
    const templateId = readTemplateId(card);
    if (!templateId || !ROLE_TEMPLATES[templateId]) return;

    card.dataset.templateId = templateId;
    card.dataset.templateGroup = TEMPLATE_COLOUR_GROUPS[templateId] || 'default';
    card.classList.add('object-template-card');

    let visual = card.querySelector('.template-visual, .library-card-preview, .template-icon');
    if (!visual) {
      visual = document.createElement('div');
      visual.className = 'template-visual';
      card.prepend(visual);
    }

    visual.dataset.templateGroup = TEMPLATE_COLOUR_GROUPS[templateId] || 'default';
    visual.innerHTML = '';

    const image = document.createElement('img');
    image.className = 'template-icon-img';
    image.alt = `${ROLE_TEMPLATES[templateId].label} icon`;
    image.src = `${ICON_BASE_PATH}${TEMPLATE_ICON_FILES[templateId]}`;
    image.onerror = () => {
      image.remove();
      if (!visual.querySelector('.template-icon-fallback')) {
        const fallback = document.createElement('span');
        fallback.className = 'template-icon-fallback';
        fallback.textContent = FALLBACK_SYMBOLS[templateId] || '⬡';
        visual.appendChild(fallback);
      }
    };
    visual.appendChild(image);
  });
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

const observer = new MutationObserver(() => decorateTemplateCards());

window.addEventListener('DOMContentLoaded', () => {
  decorateTemplateCards();
  observer.observe(document.body, { childList: true, subtree: true });
});