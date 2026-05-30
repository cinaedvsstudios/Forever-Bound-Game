import { editorState, validateCurrentArchetype } from './editor-state.js';
import { saveCurrentLocal } from './editor-io.js';
import { autoSaveWizardSession, deleteWizardSession, saveWizardSession } from './object-wizard-sessions.js?v=1.34';
import { createObjectWizardBuildRequirements } from './object-wizard-build-requirements.js?v=1.34';
import { createObjectWizardFrameTasks } from './object-wizard-frame-tasks.js?v=1.34';
import { clampNumber, emojiFor, escapeHtml } from './object-wizard-helpers.js?v=1.34';

export function createObjectWizardBuildChecklist({ wizardState, setHeader, content, renderBasicChanges }) {
  const requirements = createObjectWizardBuildRequirements({ renderBuildChecklist, updateProgressOrb });
  const frameTasks = createObjectWizardFrameTasks({
    wizardState,
    content,
    getRequirementData: requirements.getRequirementData,
    setRequirementData: requirements.setRequirementData,
    findRequirementById,
    renderRequirementDetail,
  });

  function renderBuildChecklist() {
    frameTasks.stopPreview(false);
    setHeader('Step 5: attach files, sounds, and frame order');
    const activeRequirements = requirements.buildRequirements(editorState.archetype);
    requirements.ensureProductionAssets(activeRequirements);
    if (!wizardState.selectedRequirementId || !activeRequirements.some((item) => item.id === wizardState.selectedRequirementId)) {
      wizardState.selectedRequirementId = activeRequirements[0]?.id || '';
    }
    const node = content();
    node.innerHTML = `<div class="wizard-toolbar wizard-step5-toolbar"><button type="button" data-back title="Return to basic changes">← Back</button><button type="button" data-session title="Save this wizard to resume later">💾 Save</button><button type="button" data-save title="Finish and save this object locally">✅ Save Local</button><button type="button" data-finish title="Finish setup without saving a local copy">🏁 Finish</button></div><div class="wizard-build-shell"><aside class="wizard-build-left"><div class="wizard-build-nav"></div></aside><section class="wizard-build-detail-panel"></section></div>`;
    node.querySelector('[data-back]').addEventListener('click', renderBasicChanges);
    node.querySelector('[data-session]').addEventListener('click', saveAndResumeLater);
    node.querySelector('[data-save]').addEventListener('click', () => finishWizard(true));
    node.querySelector('[data-finish]').addEventListener('click', () => finishWizard(false));
    autoSaveWizardSession();
    renderRequirementList(activeRequirements);
    renderRequirementDetail(activeRequirements.find((item) => item.id === wizardState.selectedRequirementId) || activeRequirements[0]);
    updateProgressOrb();
  }

  function renderRequirementList(activeRequirements) {
    const list = content()?.querySelector('.wizard-build-nav');
    list.innerHTML = '';
    requirements.orderedRequirements(activeRequirements).forEach((req, index) => {
      const data = requirements.getRequirementData(req.id);
      const button = document.createElement('button');
      button.type = 'button';
      button.draggable = true;
      button.dataset.requirementId = req.id;
      button.className = `${req.id === wizardState.selectedRequirementId ? 'is-selected' : ''} ${data.complete ? 'is-complete' : ''}`;
      button.innerHTML = `<span class="wizard-task-number">${index + 1}</span><span class="wizard-task-emoji">${emojiFor(req.actionId)}</span><span class="wizard-task-copy"><strong>${escapeHtml(req.label)}</strong><small>${escapeHtml(req.type)} · ${escapeHtml(req.actionId)}</small></span><em>${data.complete ? 'Ready' : 'Needed'}</em>`;
      button.addEventListener('click', () => {
        wizardState.selectedRequirementId = req.id;
        renderBuildChecklist();
      });
      button.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', req.id));
      button.addEventListener('dragover', (event) => { event.preventDefault(); button.classList.add('is-drag-over'); });
      button.addEventListener('dragleave', () => button.classList.remove('is-drag-over'));
      button.addEventListener('drop', (event) => {
        event.preventDefault();
        button.classList.remove('is-drag-over');
        requirements.moveRequirement(event.dataTransfer.getData('text/plain'), req.id, activeRequirements);
      });
      list.appendChild(button);
    });
  }

  function renderRequirementDetail(req) {
    const panel = content()?.querySelector('.wizard-build-detail-panel');
    if (!req) {
      panel.innerHTML = '<p class="hint">No requirements selected.</p>';
      return;
    }
    const data = requirements.getRequirementData(req.id);
    const frames = data.frames || [];
    const currentFrame = clampNumber(data.currentFrameIndex, 0, 0, Math.max(0, frames.length - 1));
    panel.innerHTML = `<h3>${emojiFor(req.actionId)} ${escapeHtml(req.label)}</h3><p class="hint">${escapeHtml(req.type)} · ${escapeHtml(req.actionId)}</p><div class="wizard-preview-stage" data-preview-stage></div><div class="wizard-preview-controls"><button type="button" data-play-toggle>${wizardState.previewPlaying ? 'Pause' : 'Play'}</button><button type="button" data-prev-frame>‹ Frame</button><span class="wizard-frame-readout" data-frame-readout>${frames.length ? currentFrame + 1 : 0}/${frames.length}</span><button type="button" data-next-frame>Frame ›</button></div><div class="wizard-build-fields"><label>Asset style<select data-build="mode"><option value="sprite_sheet">Sprite sheet</option><option value="individual_images">Individual images</option><option value="metadata">Metadata / no image</option></select></label><label>Sprite sheet / primary asset path<input data-build="spriteSheetAssetId" placeholder="assets/characters/mel/mel_walk_sheet.png" /></label><label>Frame count<input data-build="frameCount" type="number" min="0" /></label><label>FPS<input data-build="fps" type="number" min="0" placeholder="8" /></label><label>Sound asset/path<input data-build="soundAssetId" placeholder="assets/audio/sfx/jump.ogg" /></label><label class="wizard-check-row"><span>Mark complete</span><input data-build="complete" type="checkbox" /></label></div><label>Notes<textarea data-build="notes" rows="2" placeholder="alignment, frame order, special rules"></textarea></label><section class="wizard-correction-grid"><label>Scale correction %<input data-correct="scale" type="range" min="-10" max="10" value="${Number(data.correction?.scale || 0)}" /></label><label>Move X px<input data-correct="x" type="range" min="-10" max="10" value="${Number(data.correction?.x || 0)}" /></label><label>Move Y px<input data-correct="y" type="range" min="-10" max="10" value="${Number(data.correction?.y || 0)}" /></label><button type="button" data-match-brightness>Match brightness across frames</button></section><div class="wizard-build-actions"><label class="button-like">Add image files<input type="file" accept="image/*" multiple hidden data-frame-files /></label><button type="button" data-empty-frame>Add empty image slot</button></div><div class="wizard-frame-strip" data-frame-strip><p class="hint">Drop image files here or use Add image files. Drag boxes sideways to change order.</p></div>`;

    panel.querySelectorAll('[data-build]').forEach((field) => {
      const key = field.dataset.build;
      if (field.type === 'checkbox') field.checked = Boolean(data[key]);
      else field.value = data[key] ?? (key === 'mode' ? req.defaultMode : '');
      field.addEventListener('input', () => requirements.updateRequirement(req.id, key, field.type === 'checkbox' ? field.checked : field.value));
      field.addEventListener('change', () => requirements.updateRequirement(req.id, key, field.type === 'checkbox' ? field.checked : field.value));
    });
    panel.querySelectorAll('[data-correct]').forEach((field) => field.addEventListener('input', () => frameTasks.updateCorrection(req.id, field.dataset.correct, Number(field.value))));
    panel.querySelector('[data-frame-files]')?.addEventListener('change', (event) => frameTasks.handleFrameFiles(req.id, [...event.target.files]));
    panel.querySelector('[data-empty-frame]')?.addEventListener('click', () => frameTasks.addEmptyFrame(req.id));
    panel.querySelector('[data-play-toggle]')?.addEventListener('click', () => frameTasks.togglePreview(req.id));
    panel.querySelector('[data-prev-frame]')?.addEventListener('click', () => frameTasks.stepPreviewFrame(req.id, -1));
    panel.querySelector('[data-next-frame]')?.addEventListener('click', () => frameTasks.stepPreviewFrame(req.id, 1));
    panel.querySelector('[data-match-brightness]')?.addEventListener('click', () => frameTasks.matchBrightness(req.id));
    const strip = panel.querySelector('[data-frame-strip]');
    strip.addEventListener('dragover', (event) => { event.preventDefault(); strip.classList.add('is-drag-over'); });
    strip.addEventListener('dragleave', () => strip.classList.remove('is-drag-over'));
    strip.addEventListener('drop', (event) => {
      event.preventDefault();
      strip.classList.remove('is-drag-over');
      const files = [...event.dataTransfer.files].filter((file) => file.type.startsWith('image/'));
      if (files.length) frameTasks.handleFrameFiles(req.id, files);
    });
    frameTasks.renderFrames(req.id);
    frameTasks.paintPreviewFrame(req.id);
  }

  function findRequirementById(requirementId) {
    return requirements.buildRequirements(editorState.archetype).find((item) => item.id === requirementId);
  }

  function updateProgressOrb() {
    const orb = document.getElementById('wizard-progress-orb');
    if (!orb) return;
    const activeRequirements = requirements.buildRequirements(editorState.archetype);
    const total = activeRequirements.length;
    const complete = activeRequirements.filter((req) => requirements.getRequirementData(req.id).complete).length;
    const percent = total ? Math.round((complete / total) * 100) : 0;
    orb.style.setProperty('--progress', `${percent}%`);
    orb.querySelector('span').textContent = `${percent}%`;
  }

  function finishWizard(shouldSave) {
    frameTasks.stopPreview(false);
    validateCurrentArchetype();
    if (shouldSave) saveCurrentLocal();
    deleteWizardSession(wizardState.sessionId);
    document.getElementById('quickstart-dialog')?.close();
    window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message: shouldSave ? 'Object setup saved locally.' : 'Object setup checklist added.', type: 'success' } }));
  }

  function saveAndResumeLater() {
    saveWizardSession();
    document.getElementById('quickstart-dialog')?.close();
    window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message: 'Wizard saved. Resume it from the 🔮 beside File.', type: 'success' } }));
  }

  return { renderBuildChecklist, updateProgressOrb };
}
