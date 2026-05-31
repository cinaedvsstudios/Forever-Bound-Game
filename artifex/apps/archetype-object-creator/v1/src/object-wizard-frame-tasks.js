import { appendNote, clampNumber, escapeHtml } from './object-wizard-helpers.js?v=1.35';

export function createObjectWizardFrameTasks({ wizardState, content, getRequirementData, setRequirementData, findRequirementById, renderRequirementDetail }) {
  function renderFrames(requirementId) {
    const strip = content()?.querySelector('[data-frame-strip]');
    const data = getRequirementData(requirementId);
    const frames = data.frames || [];
    strip.innerHTML = '';
    if (!frames.length) strip.innerHTML = '<p class="hint">No frames yet.</p>';
    frames.forEach((frame, index) => {
      const box = document.createElement('div');
      box.className = 'wizard-frame-box';
      box.draggable = true;
      box.innerHTML = `<div class="wizard-frame-thumb">${frame.dataUrl ? `<img src="${frame.dataUrl}" style="${correctionStyle(data.correction)}" alt="${escapeHtml(frame.name || `Frame ${index + 1}`)}" />` : `<span>${escapeHtml(frame.name || `Frame ${index + 1}`)}</span>`}</div><div class="wizard-frame-meta"><button type="button" data-left>‹</button><button type="button" data-remove>×</button><button type="button" data-right>›</button></div>`;
      box.querySelector('[data-left]').addEventListener('click', () => moveFrame(requirementId, index, index - 1));
      box.querySelector('[data-right]').addEventListener('click', () => moveFrame(requirementId, index, index + 1));
      box.querySelector('[data-remove]').addEventListener('click', () => removeFrame(requirementId, index));
      box.addEventListener('click', () => setCurrentFrame(requirementId, index));
      box.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', String(index)));
      box.addEventListener('dragover', (event) => { event.preventDefault(); box.classList.add('is-drag-over'); });
      box.addEventListener('dragleave', () => box.classList.remove('is-drag-over'));
      box.addEventListener('drop', (event) => {
        event.preventDefault();
        box.classList.remove('is-drag-over');
        const from = Number(event.dataTransfer.getData('text/plain'));
        if (Number.isFinite(from)) moveFrame(requirementId, from, index);
      });
      strip.appendChild(box);
    });
  }

  function handleFrameFiles(requirementId, files) {
    Promise.all(files.map(readFrameFile)).then((newFrames) => {
      const data = getRequirementData(requirementId);
      const frames = [...(data.frames || []), ...newFrames];
      setRequirementData(requirementId, { ...data, frames, frameCount: frames.length, imageAssetIds: frames.map((frame) => frame.name).join(', ') });
      renderRequirementDetail(findRequirementById(requirementId));
    });
  }

  function readFrameFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: `frame_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, name: file.name, assetId: file.name, dataUrl: String(reader.result || '') });
      reader.readAsDataURL(file);
    });
  }

  function addEmptyFrame(requirementId) {
    const data = getRequirementData(requirementId);
    const frames = [...(data.frames || []), { id: `frame_${Date.now().toString(36)}`, name: `Frame ${(data.frames || []).length + 1}`, assetId: '', dataUrl: '' }];
    setRequirementData(requirementId, { ...data, frames, frameCount: frames.length });
    renderFrames(requirementId);
    paintPreviewFrame(requirementId);
  }

  function moveFrame(requirementId, from, to) {
    const data = getRequirementData(requirementId);
    const frames = [...(data.frames || [])];
    if (to < 0 || to >= frames.length || from === to) return;
    const [frame] = frames.splice(from, 1);
    frames.splice(to, 0, frame);
    setRequirementData(requirementId, { ...data, frames, imageAssetIds: frames.map((item) => item.name || item.assetId).filter(Boolean).join(', ') });
    renderFrames(requirementId);
    paintPreviewFrame(requirementId);
  }

  function removeFrame(requirementId, index) {
    const data = getRequirementData(requirementId);
    const frames = [...(data.frames || [])];
    frames.splice(index, 1);
    setRequirementData(requirementId, { ...data, frames, frameCount: frames.length, currentFrameIndex: Math.min(index, Math.max(0, frames.length - 1)), imageAssetIds: frames.map((item) => item.name || item.assetId).filter(Boolean).join(', ') });
    renderFrames(requirementId);
    paintPreviewFrame(requirementId);
  }

  function setCurrentFrame(requirementId, index) {
    setRequirementData(requirementId, { ...getRequirementData(requirementId), currentFrameIndex: index });
    paintPreviewFrame(requirementId);
  }

  function togglePreview(requirementId) {
    wizardState.previewPlaying ? stopPreview() : startPreview(requirementId);
    renderRequirementDetail(findRequirementById(requirementId));
  }

  function startPreview(requirementId) {
    stopPreview(false);
    const frames = (getRequirementData(requirementId).frames || []).filter((frame) => frame.dataUrl);
    if (!frames.length) return;
    const fps = Math.max(1, Number(getRequirementData(requirementId).fps) || 8);
    wizardState.previewPlaying = true;
    wizardState.previewTimer = window.setInterval(() => stepPreviewFrame(requirementId, 1, false), 1000 / fps);
  }

  function stopPreview(repaint = true) {
    if (wizardState.previewTimer) window.clearInterval(wizardState.previewTimer);
    wizardState.previewTimer = null;
    wizardState.previewPlaying = false;
    if (repaint && wizardState.selectedRequirementId) paintPreviewFrame(wizardState.selectedRequirementId);
  }

  function stepPreviewFrame(requirementId, direction) {
    const data = getRequirementData(requirementId);
    const frames = data.frames || [];
    if (!frames.length) return;
    const next = (clampNumber(data.currentFrameIndex, 0, 0, frames.length - 1) + direction + frames.length) % frames.length;
    setRequirementData(requirementId, { ...data, currentFrameIndex: next });
    paintPreviewFrame(requirementId);
    renderFrames(requirementId);
  }

  function paintPreviewFrame(requirementId) {
    const data = getRequirementData(requirementId);
    const frames = data.frames || [];
    const stage = content()?.querySelector('[data-preview-stage]');
    const readout = content()?.querySelector('[data-frame-readout]');
    if (!stage) return;
    const index = clampNumber(data.currentFrameIndex, 0, 0, Math.max(0, frames.length - 1));
    if (readout) readout.textContent = `${frames.length ? index + 1 : 0}/${frames.length}`;
    const frame = frames[index];
    stage.innerHTML = frame?.dataUrl ? `<img src="${frame.dataUrl}" style="${correctionStyle(data.correction)}" alt="${escapeHtml(frame.name || 'Preview frame')}" />` : '<span class="hint">Preview appears here.</span>';
  }

  function updateCorrection(requirementId, key, value) {
    const data = getRequirementData(requirementId);
    const correction = { scale: 0, x: 0, y: 0, ...(data.correction || {}), [key]: value };
    setRequirementData(requirementId, { ...data, correction });
    paintPreviewFrame(requirementId);
    renderFrames(requirementId);
  }

  function correctionStyle(correction = {}) {
    const scale = 1 + Number(correction.scale || 0) / 100;
    const x = Number(correction.x || 0);
    const y = Number(correction.y || 0);
    return `transform:translate(${x}px, ${y}px) scale(${scale});transform-origin:center center;`;
  }

  function matchBrightness(requirementId) {
    const data = getRequirementData(requirementId);
    setRequirementData(requirementId, { ...data, notes: appendNote(data.notes, 'Brightness matching requested. Full processing will run when frames are exported.') });
  }

  return { addEmptyFrame, handleFrameFiles, matchBrightness, paintPreviewFrame, renderFrames, stepPreviewFrame, stopPreview, togglePreview, updateCorrection };
}
