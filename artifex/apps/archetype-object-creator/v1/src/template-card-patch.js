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

const GROUP_THEME_CSS = `
.object-template-card {
  --template-accent: #e2cca7;
  --template-soft: rgba(226, 204, 167, 0.16);
  --template-glow: rgba(226, 204, 167, 0.28);
  border-color: color-mix(in srgb, var(--template-accent), #382a21 58%);
  background:
    radial-gradient(circle at 50% 14%, var(--template-soft), transparent 44%),
    linear-gradient(180deg, rgba(34, 25, 20, 0.98), rgba(16, 12, 10, 0.98));
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.55), inset 0 0 0 1px rgba(255, 240, 206, 0.03);
}
.object-template-card:hover {
  border-color: var(--template-accent);
  box-shadow: 0 0 0 1px var(--template-soft), 0 0 24px var(--template-glow), 0 14px 26px rgba(0, 0, 0, 0.72);
}
.object-template-card[data-template-group='people'] { --template-accent: #e2cca7; --template-soft: rgba(226, 204, 167, 0.18); --template-glow: rgba(226, 204, 167, 0.34); }
.object-template-card[data-template-group='hero'] { --template-accent: #d84545; --template-soft: rgba(216, 69, 69, 0.22); --template-glow: rgba(216, 69, 69, 0.42); }
.object-template-card[data-template-group='hostile-human'] { --template-accent: #b83131; --template-soft: rgba(184, 49, 49, 0.24); --template-glow: rgba(184, 49, 49, 0.42); }
.object-template-card[data-template-group='possessed'] { --template-accent: #9e4cff; --template-soft: rgba(158, 76, 255, 0.20); --template-glow: rgba(158, 76, 255, 0.38); }
.object-template-card[data-template-group='caster'] { --template-accent: #f277d5; --template-soft: rgba(242, 119, 213, 0.18); --template-glow: rgba(242, 119, 213, 0.36); }
.object-template-card[data-template-group='creature'] { --template-accent: #9dbb3f; --template-soft: rgba(157, 187, 63, 0.18); --template-glow: rgba(157, 187, 63, 0.36); }
.object-template-card[data-template-group='boss'] { --template-accent: #c35cff; --template-soft: rgba(195, 92, 255, 0.22); --template-glow: rgba(195, 92, 255, 0.44); }
.object-template-card[data-template-group='prop'] { --template-accent: #9f8b74; --template-soft: rgba(159, 139, 116, 0.18); --template-glow: rgba(159, 139, 116, 0.30); }
.object-template-card[data-template-group='door'] { --template-accent: #c9863b; --template-soft: rgba(201, 134, 59, 0.18); --template-glow: rgba(201, 134, 59, 0.36); }
.object-template-card[data-template-group='pickup'] { --template-accent: #f2d36b; --template-soft: rgba(242, 211, 107, 0.20); --template-glow: rgba(242, 211, 107, 0.40); }
.object-template-card[data-template-group='cache'] { --template-accent: #a46c3f; --template-soft: rgba(164, 108, 63, 0.20); --template-glow: rgba(164, 108, 63, 0.36); }
.object-template-card[data-template-group='interactable'] { --template-accent: #57bd8c; --template-soft: rgba(87, 189, 140, 0.18); --template-glow: rgba(87, 189, 140, 0.36); }
.object-template-card[data-template-group='marker'] { --template-accent: #c6d967; --template-soft: rgba(198, 217, 103, 0.18); --template-glow: rgba(198, 217, 103, 0.36); }
.object-template-card[data-template-group='hazard'] { --template-accent: #ff7b3d; --template-soft: rgba(255, 123, 61, 0.22); --template-glow: rgba(255, 123, 61, 0.42); }
.template-visual {
  min-height: 116px;
  display: grid;
  place-items: center;
  margin: -2px -2px 14px;
  border: 1px solid color-mix(in srgb, var(--template-accent), #382a21 52%);
  border-radius: 16px;
  background:
    radial-gradient(circle at 50% 42%, var(--template-soft), transparent 48%),
    linear-gradient(180deg, rgba(35, 26, 21, 0.92), rgba(14, 10, 9, 0.95));
  box-shadow: inset 0 0 0 1px rgba(255, 240, 206, 0.04);
}
.template-icon-img {
  max-width: 70px;
  max-height: 70px;
  object-fit: contain;
  filter: drop-shadow(0 0 12px var(--template-glow));
}
.template-icon-fallback {
  width: 70px;
  height: 70px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: #fff0ce;
  background: var(--template-soft);
  box-shadow: 0 0 18px var(--template-glow);
  font-size: 34px;
  line-height: 1;
}
.menu-bar {
  flex: 1;
  justify-content: center;
}
@media (max-width: 980px) {
  .menu-bar { justify-content: flex-start; }
}
`;

function injectTemplateCardStyles() {
  if (document.getElementById('object-template-card-colour-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-template-card-colour-styles';
  style.textContent = GROUP_THEME_CSS;
  document.head.appendChild(style);
}

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
  injectTemplateCardStyles();
  decorateTemplateCards();
  observer.observe(document.body, { childList: true, subtree: true });
});