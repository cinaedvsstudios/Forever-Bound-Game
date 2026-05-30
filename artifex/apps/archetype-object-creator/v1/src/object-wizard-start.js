import { applyRoleTemplate, loadArchetype } from './editor-state.js';
import { OBJECT_TEMPLATE_IDS, PEOPLE_TEMPLATE_IDS, ROLE_TEMPLATES } from './templates.js';
import { listLocalArchetypes } from './editor-io.js';
import { escapeHtml, safeId } from './object-wizard-helpers.js?v=1.33';

export function createObjectWizardStart({ wizardState, setHeader, content, renderAbilityChoice }) {
  function renderStartChoice() {
    setHeader('Step 1: choose a starting point');
    const node = content();
    node.innerHTML = `<div class="wizard-choice-grid"><button type="button" class="wizard-choice" data-source="template"><strong>Template</strong><span>Start from a standard object type.</span></button><button type="button" class="wizard-choice" data-source="existing"><strong>Existing Object</strong><span>Copy a saved object and make a new version.</span></button></div>`;
    node.querySelector('[data-source="template"]').addEventListener('click', renderTemplateChoice);
    node.querySelector('[data-source="existing"]').addEventListener('click', renderExistingChoice);
  }

  function renderTemplateChoice() {
    wizardState.source = 'template';
    setHeader('Step 2: what type of object is this?');
    const node = content();
    node.innerHTML = `<p class="hint">Choose the closest starter. You can adjust actions, flags, IDs, and asset links on the next screens.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button></div><div class="template-card-grid wizard-template-grid"></div>`;
    node.querySelector('[data-back]').addEventListener('click', renderStartChoice);
    const grid = node.querySelector('.wizard-template-grid');
    [...PEOPLE_TEMPLATE_IDS, ...OBJECT_TEMPLATE_IDS].forEach((roleId) => grid.appendChild(createTemplateCard(roleId)));
  }

  function renderExistingChoice() {
    wizardState.source = 'existing';
    setHeader('Step 2: choose an existing object to copy');
    const node = content();
    const saved = listLocalArchetypes();
    node.innerHTML = `<p class="hint">This loads a copy with a new ID. The original is not overwritten.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button></div><div class="template-card-grid wizard-existing-grid"></div>`;
    node.querySelector('[data-back]').addEventListener('click', renderStartChoice);
    const grid = node.querySelector('.wizard-existing-grid');
    if (!saved.length) {
      grid.innerHTML = '<p class="hint">No saved local objects yet. Start from a template or save an object locally first.</p>';
      return;
    }
    saved.forEach((item) => grid.appendChild(createExistingCard(item)));
  }

  function createTemplateCard(roleId) {
    const template = ROLE_TEMPLATES[roleId];
    const card = document.createElement('article');
    card.className = 'template-card';
    card.dataset.templateId = roleId;
    card.innerHTML = `<div class="template-card-body"><h4>${escapeHtml(template.label)}</h4><p>${escapeHtml(template.category)} · ${template.gameplayActions.length} gameplay actions</p></div>`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Choose Template';
    button.addEventListener('click', () => {
      applyRoleTemplate(roleId);
      renderAbilityChoice();
    });
    card.appendChild(button);
    return card;
  }

  function createExistingCard(item) {
    const data = item.data || {};
    const roleId = ROLE_TEMPLATES[data.role] ? data.role : 'static_prop';
    const card = document.createElement('article');
    card.className = 'template-card';
    card.dataset.templateId = roleId;
    card.innerHTML = `<div class="template-card-body"><h4>${escapeHtml(data.name || data.id || 'Unnamed Object')}</h4><p>${escapeHtml(data.category || 'unknown')} · ${escapeHtml(data.role || 'no role')}</p></div>`;
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Copy This Object';
    button.addEventListener('click', () => {
      loadArchetype(cloneAsNew(data));
      renderAbilityChoice();
    });
    card.appendChild(button);
    return card;
  }

  return { renderStartChoice, renderTemplateChoice, renderExistingChoice };
}

function cloneAsNew(data) {
  const clone = JSON.parse(JSON.stringify(data || {}));
  const suffix = Date.now().toString(36).slice(-5);
  clone.id = `${safeId(clone.id || clone.name || 'object_archetype')}_variant_${suffix}`;
  clone.name = `${clone.name || 'Object Archetype'} Variant`;
  clone.createdAt = new Date().toISOString();
  clone.updatedAt = new Date().toISOString();
  return clone;
}
