import { editorState, validateCurrentArchetype } from './editor-state.js';
import { markCurrentObjectReady, saveCurrentObjectToProject } from './object-project-storage.js?v=1.36';
import { autoSaveWizardSession, saveWizardSession } from './object-wizard-sessions.js?v=1.36';
import { createObjectWizardBuildRequirements } from './object-wizard-build-requirements.js?v=1.36';
import { createObjectWizardFrameTasks } from './object-wizard-frame-tasks.js?v=1.36';
import { bindObjectWizardStep5Detail } from './object-wizard-step5.js?v=1.36';
import { bindObjectWizardAssetPackage } from './object-wizard-asset-package.js?v=1.36';
import { renderObjectWizardReferencePanel } from './object-wizard-reference-panel.js?v=1.36';
import { clampNumber, emojiFor, escapeHtml } from './object-wizard-helpers.js?v=1.36';

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
    if (!wizardState.selectedRequirementId || !activeRequirements.some((item) => item.id === wizardState.selectedRequirementId)) wizardState.selectedRequirementId = activeRequirements[0]?.id || '';
    const node = content();
    node.innerHTML = `<div class="wizard-toolbar wizard-step5-toolbar"><button type="button" data-back title="Return to basic changes">← Back</button><button type="button" data-draft-save title="Browser recovery only; does not write project files">💾 Save Browser Draft</button><button type="button" data-project-save title="Save in-progress work to the connected project folder">📁 Save Project (In Progress)</button><button type="button" data-ready title="Validate, promote staged media, register assets, and mark this object ready">🏁 Finish / Mark Object Ready</button></div><p class="hint wizard-save-hint">Save Browser Draft is recovery only. Save Project writes in-progress authoring files. Finish / Mark Object Ready is the only finalisation path.</p><div class="wizard-build-shell"><aside class="wizard-build-left"><div class="wizard-build-nav"></div></aside><section class="wizard-build-detail-panel"></section></div>`;
    node.querySelector('[data-back]').addEventListener('click', renderBasicChanges);
    node.querySelector('[data-draft-save]').addEventListener('click', saveAndResumeLater);
    node.querySelector('[data-project-save]').addEventListener('click', saveInProgressProject);
    node.querySelector('[data-ready]').addEventListener('click', finishAndMarkReady);
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
      button.addEventListener('click', () => { wizardState.selectedRequirementId = req.id; renderBuildChecklist(); });
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
    panel.innerHTML = `<section class="wizard-step5-left"><div class="wizard-preview-stage" data-preview-stage></div><div class="wizard-preview-controls"><button type="button" data-play-toggle>${wizardState.previewPlaying ? 'Pause' : 'Play'}</button><button type="button" data-prev-frame>‹ Frame</button><span class="wizard-frame-readout" data-frame-readout>${frames.length ? currentFrame + 1 : 0}/${frames.length}</span><button type="button" data-next-frame>Frame ›</button><button type="button" data-frame-correct-toggle>🎚️ Frame Fix</button><div class="wizard-correction-popover" data-frame-correction-panel hidden><div class="wizard-correction-head"><span class="wizard-correction-title" data-correction-title>Frame Correction</span><button type="button" data-reset-correction title="Reset only the current frame correction">↺ Reset</button><button type="button" data-close-correction title="Close frame correction">×</button></div><section class="wizard-correction-grid"><label>Scale correction %<input data-correct="scale" type="range" min="-10" max="10" value="0" /><div class="wizard-correction-control"><output>0</output></div></label><label>Move X px<input data-correct="x" type="range" min="-10" max="10" value="0" /><div class="wizard-correction-control"><output>0</output></div></label><label>Move Y px<input data-correct="y" type="range" min="-10" max="10" value="0" /><div class="wizard-correction-control"><output>0</output></div></label><label>Brightness %<input data-correct="brightness" type="range" min="-50" max="50" value="0" /><div class="wizard-correction-control"><output>0</output></div></label><button type="button" data-match-brightness>✨ Match brightness across frames</button></section></div></div><section class="wizard-reference-panel"><h4>Reference</h4><div class="wizard-reference-scroll"></div></section></section><section class="wizard-step5-right"><h3 class="wizard-build-title">${emojiFor(req.actionId)} ${escapeHtml(req.label)}</h3><p class="wizard-action-info-text"></p><div class="wizard-right-stack"><details class="wizard-action-behaviour-panel" open></details><div class="wizard-build-fields"><label>Asset style<select data-build="mode"><option value="sprite_sheet">Sprite sheet</option><option value="individual_images">Individual images</option><option value="metadata">Metadata / no image</option></select></label><label class="wizard-field-asset-path">Sprite sheet / primary asset ID<input data-build="spriteSheetAssetId" placeholder="asset_character_action" /></label><label>Frame count<input data-build="frameCount" type="number" min="0" /></label><label>FPS<input data-build="fps" type="number" min="0" placeholder="8" /></label><label>Primary Sound Asset ID<input data-build="soundAssetId" placeholder="asset_sfx_object_action" title="Registered sound asset ID from assets/asset-index.json" /></label><label class="wizard-check-row" title="Marks only the selected task as ready; it does not save or finalise the object."><span>Mark Task Ready</span><input data-build="complete" type="checkbox" /></label></div><details class="wizard-sound-list"><summary><span class="wizard-sound-summary-label">🔊 Sound Events</span><button type="button" class="wizard-create-sound-button" title="Create Synth Sound and assign its registered asset ID here" aria-label="Create Synth Sound">🎛️</button></summary><div class="wizard-sound-primary"></div><div class="wizard-sound-rows"></div><button type="button" class="wizard-add-sound-button" title="Add another sound event row">➕ Add Sound</button></details><label class="wizard-notes-field">Notes<textarea data-build="notes" rows="2" placeholder="alignment, frame order, special rules"></textarea></label><div class="wizard-build-actions"><label class="button-like">🖼️ Add Images<input type="file" accept="image/*" multiple hidden data-frame-files /></label><button type="button" data-empty-frame>Add Empty Frame Slot</button><button type="button" data-download-asset-zip class="wizard-download-zip-button" title="Backup/fallback export: download uploaded frames and metadata">📦 Backup ZIP</button></div><section class="wizard-frame-file-table-wrap"></section><div class="wizard-frame-strip wizard-frame-drop-zone" data-frame-strip><p class="hint">Drop image files here, or use 🖼️ Add Images above. Drag boxes sideways to change order.</p></div></div></section>`;
    panel.querySelectorAll('[data-build]').forEach((field) => {
      const key = field.dataset.build;
      if (field.type === 'checkbox') field.checked = Boolean(data[key]);
      else field.value = data[key] ?? (key === 'mode' ? req.defaultMode : '');
      field.addEventListener('input', () => requirements.updateRequirement(req.id, key, field.type === 'checkbox' ? field.checked : field.value));
      field.addEventListener('change', () => requirements.updateRequirement(req.id, key, field.type === 'checkbox' ? field.checked : field.value));
    });
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
    frameTasks.bindCorrectionControls(req.id);
    bindObjectWizardStep5Detail(panel, req.id);
    bindObjectWizardAssetPackage(panel, req.id);
    renderObjectWizardReferencePanel(panel, req.id);
    frameTasks.renderFrames(req.id);
    frameTasks.paintPreviewFrame(req.id);
  }

  function findRequirementById(requirementId) { return requirements.buildRequirements(editorState.archetype).find((item) => item.id === requirementId); }

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

  async function saveInProgressProject() {
    frameTasks.stopPreview(false);
    validateCurrentArchetype();
    await saveCurrentObjectToProject({ allowConnect: true });
  }

  async function finishAndMarkReady() {
    frameTasks.stopPreview(false);
    validateCurrentArchetype();
    await markCurrentObjectReady({ allowConnect: true });
  }

  function saveAndResumeLater() {
    saveWizardSession();
    document.getElementById('quickstart-dialog')?.close();
    window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message: 'Browser recovery draft saved. Resume it from the 🔮 beside File.', type: 'success' } }));
  }

  return { renderBuildChecklist, updateProgressOrb };
}
