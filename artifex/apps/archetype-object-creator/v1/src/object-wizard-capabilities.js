import { editorState, toggleGameplayAction, togglePortraitAction, updateFlag } from './editor-state.js';
import { GAMEPLAY_ACTIONS, PORTRAIT_ACTIONS, RUNTIME_FLAGS } from './templates.js';
import { escapeHtml } from './object-wizard-helpers.js?v=1.34';

export function createObjectWizardCapabilities({ wizardState, setHeader, content, renderTemplateChoice, renderExistingChoice, renderBasicChanges }) {
  function renderAbilityChoice() {
    setHeader('Step 3: what should it be able to do?');
    const item = editorState.archetype;
    const node = content();
    node.innerHTML = `<p class="hint">Choose runtime behaviour, body actions, and portrait actions. Talk is not a body action.</p><div class="wizard-toolbar"><button type="button" data-back>Back</button><button type="button" data-next>Next: basic changes</button></div><div class="wizard-columns"><section><h3>Runtime Flags</h3><div class="wizard-checks" data-flags></div></section><section><h3>Gameplay Sprite Actions</h3><div class="wizard-checks" data-gameplay></div></section><section><h3>Dialogue Portrait Actions</h3><div class="wizard-checks" data-portrait></div></section></div>`;
    node.querySelector('[data-back]').addEventListener('click', () => wizardState.source === 'existing' ? renderExistingChoice() : renderTemplateChoice());
    node.querySelector('[data-next]').addEventListener('click', renderBasicChanges);
    renderFlagChecks(node.querySelector('[data-flags]'), item);
    renderActionChecks(node.querySelector('[data-gameplay]'), GAMEPLAY_ACTIONS, item.animationProfile?.gameplayActions || [], 'gameplay');
    renderActionChecks(node.querySelector('[data-portrait]'), PORTRAIT_ACTIONS, item.animationProfile?.portraitActions || [], 'portrait');
  }

  function renderFlagChecks(container, item) {
    RUNTIME_FLAGS.forEach((flag) => {
      const row = document.createElement('label');
      row.className = 'wizard-check-row';
      row.innerHTML = `<input type="checkbox" ${item.behaviour?.flags?.[flag.key] ? 'checked' : ''}/> <span>${escapeHtml(flag.label)}</span>`;
      row.querySelector('input').addEventListener('change', (event) => updateFlag(flag.key, event.target.checked));
      container.appendChild(row);
    });
  }

  function renderActionChecks(container, actions, selected, type) {
    actions.forEach((action) => {
      const row = document.createElement('label');
      row.className = 'wizard-check-row';
      row.innerHTML = `<input type="checkbox" ${(selected || []).includes(action.id) ? 'checked' : ''}/> <span>${escapeHtml(action.label)}</span>`;
      row.querySelector('input').addEventListener('change', () => type === 'gameplay' ? toggleGameplayAction(action.id) : togglePortraitAction(action.id));
      container.appendChild(row);
    });
  }

  return { renderAbilityChoice };
}