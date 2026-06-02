import { appendNote, clampNumber, escapeHtml } from './object-wizard-helpers.js?v=1.36';

const DEFAULT_CORRECTION = Object.freeze({ scale: 0, x: 0, y: 0, brightness: 0 });

export function createObjectWizardFrameTasks({ wizardState, content, getRequirementData, setRequirementData, findRequirementById, renderRequirementDetail }) {
  function renderFrames(requirementId) {
    const strip = content()?.querySelector('[data-frame-strip]');
    if (!strip) return;
    const data = ensureFrameCorrections(requirementId);
    const frames = data.frames || [];
    strip.innerHTML = '';
    if (!frames.length) strip.innerHTML = '<p class="hint">No frames yet.</p>';
    frames.forEach((frame, index) => {
      const box = document.createElement('div');
      box.className = `wizard-frame-box ${index === Number(data.currentFrameIndex || 0) ? 'is-current' : ''}`;
      box.draggable = true;
      const correction = correctionForFrame(data, index);
      const empty = isEmptyFrameSlot(frame);
      const thumbnail = frame.dataUrl
        ? `<img src="${frame.dataUrl}" style="${correctionStyle(correction)}" alt="${escapeHtml(frame.name || `Frame ${index + 1}`)}" />`
        : empty
          ? `<button type="button" data-fill-empty title="Choose an image for this frame" style="width:100%;height:100%;padding:7px;display:grid;place-items:center;gap:4px;background:transparent;border:1px dashed rgba(226,204,167,.32);border-radius:8px;color:rgba(255,240,206,.82);font-size:10px"><span>${escapeHtml(frame.name || `Frame ${index + 1}`)}</span><strong style="font-size:10px">Click to add image</strong></button>`
          : `<span>${escapeHtml(frame.name || frame.staging?.originalName || frame.assetId || `Frame ${index + 1}`)}</span>`;
      box.innerHTML = `<div class="wizard-frame-thumb">${thumbnail}</div><div class="wizard-frame-meta"><button type="button" data-left>‹</button><button type="button" data-remove>×</button><button type="button" data-right>›</button></div>`;
      box.querySelector('[data-left]').addEventListener('click', (event) => { event.stopPropagation(); moveFrame(requirementId, index, index - 1); });
      box.querySelector('[data-right]').addEventListener('click', (event) => { event.stopPropagation(); moveFrame(requirementId, index, index + 1); });
      box.querySelector('[data-remove]').addEventListener('click', (event) => { event.stopPropagation(); removeFrame(requirementId, index); });
      box.querySelector('[data-fill-empty]')?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        setCurrentFrame(requirementId, index);
        openFrameSlotPicker(requirementId, index);
      });
      box.addEventListener('click', () => setCurrentFrame(requirementId, index));
      box.addEventListener('dragstart', (event) => event.dataTransfer.setData('text/plain', String(index)));
      box.addEventListener('dragover', (event) => { event.preventDefault(); box.classList.add('is-drag-over'); });
      box.addEventListener('dragleave', () => box.classList.remove('is-drag-over'));
      box.addEventListener('drop', (event) => {
        event.preventDefault();
        box.classList.remove('is-drag-over');
        const imageFile = [...event.dataTransfer.files].find((file) => file.type.startsWith('image/'));
        if (empty && imageFile) {
          fillFrameSlot(requirementId, index, imageFile);
          return;
        }
        const from = Number(event.dataTransfer.getData('text/plain'));
        if (Number.isFinite(from)) moveFrame(requirementId, from, index);
      });
      strip.appendChild(box);
    });
  }

  function handleFrameFiles(requirementId, files) {
    Promise.all(files.map(readFrameFile)).then((newFrames) => {
      const data = ensureFrameCorrections(requirementId);
      const frames = [...(data.frames || []), ...newFrames];
      setRequirementData(requirementId, { ...withoutLegacyCorrection(data), frames, frameCount: frames.length, imageAssetIds: imageAssetSummary(frames) });
      renderRequirementDetail(findRequirementById(requirementId));
    });
  }

  function readFrameFile(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve({ id: `frame_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`, name: file.name, assetId: '', dataUrl: String(reader.result || '') });
      reader.readAsDataURL(file);
    });
  }

  function addEmptyFrame(requirementId) {
    const data = ensureFrameCorrections(requirementId);
    const frames = [...(data.frames || []), { id: `frame_${Date.now().toString(36)}`, name: `Frame ${(data.frames || []).length + 1}`, assetId: '', dataUrl: '' }];
    setRequirementData(requirementId, { ...withoutLegacyCorrection(data), frames, frameCount: frames.length, currentFrameIndex: frames.length - 1 });
    renderFrames(requirementId);
    paintPreviewFrame(requirementId);
  }

  function openFrameSlotPicker(requirementId, index) {
    const picker = document.createElement('input');
    picker.type = 'file';
    picker.accept = 'image/*';
    picker.hidden = true;
    picker.addEventListener('change', () => {
      const file = picker.files?.[0];
      if (file) fillFrameSlot(requirementId, index, file);
      picker.remove();
    }, { once: true });
    document.body.appendChild(picker);
    picker.click();
  }

  async function fillFrameSlot(requirementId, index, file) {
    const data = ensureFrameCorrections(requirementId);
    const frames = [...(data.frames || [])];
    if (!frames[index] || !isEmptyFrameSlot(frames[index])) return;
    const replacement = await readFrameFile(file);
    frames[index] = { ...replacement, id: frames[index].id || replacement.id };
    setRequirementData(requirementId, { ...withoutLegacyCorrection(data), frames, frameCount: frames.length, currentFrameIndex: index, imageAssetIds: imageAssetSummary(frames) });
    renderRequirementDetail(findRequirementById(requirementId));
    toast(`Added ${file.name} to frame ${index + 1}.`, 'success');
  }

  function isEmptyFrameSlot(frame) {
    return !frame?.dataUrl && !frame?.assetId && !frame?.staging?.path;
  }

  function imageAssetSummary(frames) {
    return frames.map((frame) => frame.name || frame.assetId).filter(Boolean).join(', ');
  }

  function moveFrame(requirementId, from, to) {
    const data = ensureFrameCorrections(requirementId);
    const frames = [...(data.frames || [])];
    if (to < 0 || to >= frames.length || from === to) return;
    const [frame] = frames.splice(from, 1);
    frames.splice(to, 0, frame);
    const frameCorrections = remapCorrectionsAfterMove(data.frameCorrections || {}, from, to, frames.length);
    setRequirementData(requirementId, { ...withoutLegacyCorrection(data), frames, frameCorrections, imageAssetIds: imageAssetSummary(frames) });
    renderFrames(requirementId);
    paintPreviewFrame(requirementId);
  }

  function removeFrame(requirementId, index) {
    const data = ensureFrameCorrections(requirementId);
    const frames = [...(data.frames || [])];
    frames.splice(index, 1);
    const frameCorrections = {};
    Object.entries(data.frameCorrections || {}).forEach(([key, value]) => {
      const oldIndex = Number(key);
      if (oldIndex < index) frameCorrections[oldIndex] = value;
      if (oldIndex > index) frameCorrections[oldIndex - 1] = value;
    });
    setRequirementData(requirementId, { ...withoutLegacyCorrection(data), frames, frameCorrections, frameCount: frames.length, currentFrameIndex: Math.min(index, Math.max(0, frames.length - 1)), imageAssetIds: imageAssetSummary(frames) });
    renderFrames(requirementId);
    paintPreviewFrame(requirementId);
  }

  function setCurrentFrame(requirementId, index) {
    setRequirementData(requirementId, { ...withoutLegacyCorrection(ensureFrameCorrections(requirementId)), currentFrameIndex: index });
    loadFrameCorrection(requirementId);
    paintPreviewFrame(requirementId);
    renderFrames(requirementId);
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
    const data = ensureFrameCorrections(requirementId);
    const frames = data.frames || [];
    if (!frames.length) return;
    const next = (clampNumber(data.currentFrameIndex, 0, 0, frames.length - 1) + direction + frames.length) % frames.length;
    setRequirementData(requirementId, { ...withoutLegacyCorrection(data), currentFrameIndex: next });
    loadFrameCorrection(requirementId);
    paintPreviewFrame(requirementId);
    renderFrames(requirementId);
  }

  function paintPreviewFrame(requirementId) {
    const data = ensureFrameCorrections(requirementId);
    const frames = data.frames || [];
    const stage = content()?.querySelector('[data-preview-stage]');
    const readout = content()?.querySelector('[data-frame-readout]');
    if (!stage) return;
    const index = clampNumber(data.currentFrameIndex, 0, 0, Math.max(0, frames.length - 1));
    if (readout) readout.textContent = `${frames.length ? index + 1 : 0}/${frames.length}`;
    const frame = frames[index];
    const correction = correctionForFrame(data, index);
    stage.innerHTML = frame?.dataUrl ? `<img src="${frame.dataUrl}" style="${correctionStyle(correction)}" alt="${escapeHtml(frame.name || 'Preview frame')}" />` : '<span class="hint">Preview appears here.</span>';
  }

  function updateCorrection(requirementId, key, value) {
    const data = ensureFrameCorrections(requirementId);
    const frameIndex = currentFrameIndex(data);
    const frameCorrections = { ...(data.frameCorrections || {}) };
    frameCorrections[frameIndex] = { ...DEFAULT_CORRECTION, ...(frameCorrections[frameIndex] || {}), [key]: Number(value) || 0 };
    setRequirementData(requirementId, { ...withoutLegacyCorrection(data), frameCorrections });
    syncCorrectionInputs(requirementId);
    paintPreviewFrame(requirementId);
    renderFrames(requirementId);
  }

  function resetCurrentFrameCorrection(requirementId) {
    const data = ensureFrameCorrections(requirementId);
    const frameCorrections = { ...(data.frameCorrections || {}) };
    frameCorrections[currentFrameIndex(data)] = { ...DEFAULT_CORRECTION };
    setRequirementData(requirementId, { ...withoutLegacyCorrection(data), frameCorrections });
    syncCorrectionInputs(requirementId);
    paintPreviewFrame(requirementId);
    renderFrames(requirementId);
  }

  async function matchBrightness(requirementId) {
    const data = ensureFrameCorrections(requirementId);
    const frames = data.frames || [];
    const readableFrames = frames.filter((frame) => frame.dataUrl);
    if (readableFrames.length < 2) {
      toast('Add at least two image frames before matching brightness.', 'warning');
      return;
    }
    try {
      const averages = await Promise.all(frames.map((frame) => frame.dataUrl ? averageBrightness(frame.dataUrl) : Promise.resolve(null)));
      const valid = averages.filter((value) => typeof value === 'number' && Number.isFinite(value));
      const target = valid.reduce((sum, value) => sum + value, 0) / valid.length;
      const frameCorrections = { ...(data.frameCorrections || {}) };
      averages.forEach((average, index) => {
        if (typeof average !== 'number') return;
        const current = { ...DEFAULT_CORRECTION, ...(frameCorrections[index] || {}) };
        const adjustment = clampNumber(Math.round(((target - average) / Math.max(average, 1)) * 100), 0, -50, 50);
        frameCorrections[index] = { ...current, brightness: adjustment };
      });
      setRequirementData(requirementId, { ...withoutLegacyCorrection(data), frameCorrections, brightnessMatch: { target: Math.round(target), generatedAt: new Date().toISOString() }, notes: appendNote(data.notes, 'Brightness matching requested. Full processing will run when frames are exported.') });
      syncCorrectionInputs(requirementId);
      paintPreviewFrame(requirementId);
      renderFrames(requirementId);
      toast('Brightness matched and stored per frame.', 'success');
    } catch (error) {
      toast(`Could not match brightness: ${error.message}`, 'error');
    }
  }

  function loadFrameCorrection(requirementId) {
    syncCorrectionInputs(requirementId);
    paintPreviewFrame(requirementId);
    renderFrames(requirementId);
  }

  function bindCorrectionControls(requirementId) {
    const root = content();
    root?.querySelector('[data-frame-correct-toggle]')?.addEventListener('click', () => {
      const popover = root.querySelector('[data-frame-correction-panel]');
      if (popover) popover.hidden = !popover.hidden;
      syncCorrectionInputs(requirementId);
    });
    root?.querySelector('[data-close-correction]')?.addEventListener('click', () => {
      const popover = root.querySelector('[data-frame-correction-panel]');
      if (popover) popover.hidden = true;
    });
    root?.querySelector('[data-reset-correction]')?.addEventListener('click', () => resetCurrentFrameCorrection(requirementId));
    root?.querySelectorAll('[data-correct]').forEach((input) => {
      input.addEventListener('input', () => updateCorrection(requirementId, input.dataset.correct, Number(input.value)));
    });
    syncCorrectionInputs(requirementId);
  }

  function syncCorrectionInputs(requirementId) {
    const root = content();
    const data = ensureFrameCorrections(requirementId);
    const frameIndex = currentFrameIndex(data);
    const correction = correctionForFrame(data, frameIndex);
    const title = root?.querySelector('[data-correction-title]');
    if (title) title.textContent = `Frame Correction – Frame ${String(frameIndex + 1).padStart(2, '0')}`;
    root?.querySelectorAll('[data-correct]').forEach((input) => {
      input.value = String(correction[input.dataset.correct] ?? 0);
      const output = input.closest('label')?.querySelector('output');
      if (output) output.textContent = input.value;
    });
  }

  function ensureFrameCorrections(requirementId) {
    const data = getRequirementData(requirementId) || {};
    if (!data.correction) return data;
    const frames = data.frames || [];
    const frameCorrections = { ...(data.frameCorrections || {}) };
    const correction = normalizeCorrection(data.correction);
    const count = Math.max(1, frames.length || Number(data.frameCount) || 0);
    for (let index = 0; index < count; index += 1) {
      if (!frameCorrections[index]) frameCorrections[index] = { ...correction };
    }
    const next = { ...withoutLegacyCorrection(data), frameCorrections };
    setRequirementData(requirementId, next);
    return next;
  }

  function correctionForFrame(data, index) {
    return { ...DEFAULT_CORRECTION, ...((data.frameCorrections || {})[index] || {}) };
  }

  function currentFrameIndex(data) {
    return clampNumber(data.currentFrameIndex, 0, 0, Math.max(0, (data.frames || []).length - 1));
  }

  function withoutLegacyCorrection(data) {
    const next = { ...(data || {}) };
    delete next.correction;
    return next;
  }

  function correctionStyle(correction = {}) {
    const scale = 1 + Number(correction.scale || 0) / 100;
    const x = Number(correction.x || 0);
    const y = Number(correction.y || 0);
    const brightness = 1 + Number(correction.brightness || 0) / 100;
    return `transform:translate(${x}px, ${y}px) scale(${scale});transform-origin:center center;filter:brightness(${brightness});`;
  }

  function remapCorrectionsAfterMove(source, from, to, length) {
    const ordered = Array.from({ length }, (_, index) => source[index] || null);
    const [item] = ordered.splice(from, 1);
    ordered.splice(to, 0, item);
    const output = {};
    ordered.forEach((correction, index) => { if (correction) output[index] = correction; });
    return output;
  }

  function normalizeCorrection(value = {}) {
    return { scale: Number(value.scale || 0), x: Number(value.x || 0), y: Number(value.y || 0), brightness: Number(value.brightness || 0) };
  }

  function averageBrightness(dataUrl) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const max = 96;
        const scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight));
        canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) return resolve(128);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
        let total = 0;
        let count = 0;
        for (let index = 0; index < pixels.length; index += 4) {
          const alpha = pixels[index + 3];
          if (alpha < 24) continue;
          total += (0.2126 * pixels[index]) + (0.7152 * pixels[index + 1]) + (0.0722 * pixels[index + 2]);
          count += 1;
        }
        resolve(count ? total / count : 128);
      };
      image.onerror = () => reject(new Error('frame image could not be read'));
      image.src = dataUrl;
    });
  }

  function toast(message, type = 'info') { window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } })); }

  return { addEmptyFrame, bindCorrectionControls, handleFrameFiles, loadFrameCorrection, matchBrightness, paintPreviewFrame, renderFrames, stepPreviewFrame, stopPreview, togglePreview, updateCorrection };
}
