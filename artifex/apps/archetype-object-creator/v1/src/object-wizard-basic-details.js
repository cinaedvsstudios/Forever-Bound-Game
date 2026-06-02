import { editorState, updateArchetype, updateIdentity } from './editor-state.js';
import { escapeHtml } from './object-wizard-helpers.js?v=1.36';

export function createObjectWizardBasicDetails({ setHeader, content, renderAbilityChoice, renderBuildChecklist }) {
  function renderBasicChanges() {
    setHeader('Step 4: make the basic changes');
    const item = editorState.archetype;
    const node = content();
    node.innerHTML = `<p class="hint">Make this starter object become its own new archetype. Sprite and portrait IDs can stay blank here because Step 5 tracks them as setup tasks.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button><button type="button" data-build>Next: setup checklist</button></div><div class="wizard-form-grid"><label>Archetype ID<input data-field="id" value="${escapeHtml(item.id)}" /></label><label>Name<input data-field="name" value="${escapeHtml(item.name)}" /></label><label>Subtype<input data-field="subtype" value="${escapeHtml(item.subtype)}" /></label><label>Tags<input data-field="tags" value="${escapeHtml(item.tags.join(', '))}" /></label><label>Gameplay Sprite Asset ID<input data-field="spriteAssetId" value="${escapeHtml(item.visual.spriteAssetId)}" /></label><label>Dialogue Portrait Asset ID<input data-field="portraitAssetId" value="${escapeHtml(item.visual.portraitAssetId)}" /></label></div>`;
    node.querySelector('[data-back]').addEventListener('click', renderAbilityChoice);
    node.querySelector('[data-build]').addEventListener('click', renderBuildChecklist);
    node.querySelectorAll('[data-field]').forEach((input) => input.addEventListener('input', () => updateBasicField(input.dataset.field, input.value)));
  }

  function updateBasicField(field, value) {
    if (field === 'id') updateIdentity({ id: value });
    if (field === 'name') updateIdentity({ name: value });
    if (field === 'subtype') updateIdentity({ subtype: value });
    if (field === 'tags') updateIdentity({ tags: value });
    if (field === 'spriteAssetId') updateArchetype({ visual: { spriteAssetId: value } });
    if (field === 'portraitAssetId') updateArchetype({ visual: { portraitAssetId: value } });
  }

  return { renderBasicChanges };
}
