import { editorState, updateArchetype } from './editor-state.js';

const VERSION = '1.28';
let correctionObserver = null;
let correctionQueued = false;

export function initObjectWizardFrameCorrection() {
  injectFrameCorrectionStyles();
  startCorrectionObserver();
  scheduleCorrectionRefresh();
}

function injectFrameCorrectionStyles() {
  if (document.getElementById('object-wizard-frame-correction-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-wizard-frame-correction-styles';
  style.textContent = `
    #quickstart-dialog .wizard-correction-popover {
      position: relative;
      z-index: 4;
      width: min(100%, 620px);
      max-width: 620px;
      border: 1px solid rgba(226, 204, 167, 0.22);
      border-radius: 16px;
      background: rgba(18, 13, 11, 0.98);
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.55);
      padding: 10px;
    }

    #quickstart-dialog .wizard-correction-head {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
    }

    #quickstart-dialog .wizard-correction-title {
      flex: 1 1 auto;
      color: #fff0ce;
      font-weight: 800;
    }

    #quickstart-dialog .wizard-correction-head button {
      min-height: 28px !important;
      padding: 4px 8px !important;
      font-size: 11px !important;
    }

    #quickstart-dialog .wizard-correction-grid {
      display: grid !important;
      grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
      gap: 10px 12px !important;
      align-items: start !important;
      border-radius: 14px !important;
      padding: 10px !important;
    }

    #quickstart-dialog .wizard-correction-grid label {
      min-width: 0 !important;
      margin: 0 !important;
      display: block !important;
    }

    #quickstart-dialog .wizard-correction-grid input[type="range"] {
      width: 100% !important;
      max-width: 100% !important;
      margin-top: 6px !important;
    }

    #quickstart-dialog .wizard-correction-grid button[data-match-brightness] {
      grid-column: 1 / -1 !important;
      width: 100% !important;
      min-height: 34px !important;
      margin-top: 2px !important;
    }

    #quickstart-dialog .wizard-correction-control {
      display: grid;
      grid-template-columns: 28px 52px 28px;
      gap: 6px;
      align-items: center;
      justify-content: center;
      width: max-content;
      max-width: 100%;
      margin: 6px auto 0;
    }

    #quickstart-dialog .wizard-correction-control button {
      min-height: 25px !important;
      width: 28px !important;
      padding: 2px 6px !important;
      font-size: 13px !important;
    }

    #quickstart-dialog .wizard-correction-control output {
      min-width: 52px;
      text-align: center;
      color: #fff0ce;
      border: 1px solid rgba(226, 204, 167, 0.18);
      border-radius: 999px;
      padding: 3px 7px;
      background: rgba(0, 0, 0, 0.22);
    }

    @media (max-width: 720px) {
      #quickstart-dialog .wizard-correction-grid {
        grid-template-columns: 1fr !important;
      }
    }
  `;
  document.head.appendChild(style);
}

function startCorrectionObserver() {
  if (correctionObserver) return;
  correctionObserver = new MutationObserver(() => scheduleCorrectionRefresh());
  correctionObserver.observe(document.body, { childList: true, subtree: true });
}

function scheduleCorrectionRefresh() {
  if (correctionQueued) return;
  correctionQueued = true;
  window.requestAnimationFrame(() => {
    correctionQueued = false;
    refreshFrameCorrection();
  });
}

function refreshFrameCorrection() {
  const panel = document.querySelector('#quickstart-dialog .wizard-build-detail-panel');
  if (!panel) return;
  const requirementId = selectedRequirementId();
  if (!requirementId) return;
  enhanceCorrectionPopup(panel, requirementId);
}

function enhanceCorrectionPopup(panel, requirementId) {
  const correction = panel.querySelector('.wizard-correction-grid');
  const controls = panel.querySelector('.wizard-preview-controls');
  if (!correction || !controls) return;

  let button = controls.querySelector('.wizard-frame-correct-button');
  let buttonWasCreated = false;
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'wizard-frame-correct-button';
    button.textContent = '🎚️ Frame Fix';
    button.title = 'Adjust the currently selected frame';
    controls.appendChild(button);
    buttonWasCreated = true;
  }

  let popover = controls.querySelector('.wizard-correction-popover');
  if (!popover) {
    popover = document.createElement('div');
    popover.className = 'wizard-correction-popover';
    popover.hidden = true;
    popover.innerHTML = '<div class="wizard-correction-head"><span class="wizard-correction-title">Frame Correction</span><button type="button" data-reset-correction title="Reset this frame correction">↺ Reset</button><button type="button" data-close-correction title="Close frame correction">×</button></div>';
    controls.appendChild(popover);
  }

  if (buttonWasCreated) {
    button.addEventListener('click', () => {
      popover.hidden = !popover.hidden;
      loadFrameCorrection(requirementId);
    });
  }

  const closeButton = popover.querySelector('[data-close-correction]');
  if (closeButton && !closeButton.dataset.boundFrameCorrection) {
    closeButton.dataset.boundFrameCorrection = 'true';
    closeButton.addEventListener('click', () => { popover.hidden = true; });
  }

  const resetButton = popover.querySelector('[data-reset-correction]');
  if (resetButton && resetButton.dataset.boundFor !== requirementId) {
    resetButton.dataset.boundFor = requirementId;
    resetButton.addEventListener('click', () => resetCurrentFrameCorrection(requirementId));
  }

  if (correction.parentElement !== popover) popover.appendChild(correction);
  ensureBrightnessSlider(correction);
  enhanceCorrectionControls(correction, requirementId);
  bindFrameNavigationRefresh(controls, requirementId);
  loadFrameCorrection(requirementId);
}

function ensureBrightnessSlider(correction) {
  if (correction.querySelector('[data-correct="brightness"]')) return;
  const label = document.createElement('label');
  label.textContent = 'Brightness %';
  const input = document.createElement('input');
  input.type = 'range';
  input.min = '-50';
  input.max = '50';
  input.step = '1';
  input.value = '0';
  input.dataset.correct = 'brightness';
  input.title = 'Manual brightness correction for this frame';
  label.appendChild(input);
  correction.insertBefore(label, correction.querySelector('[data-match-brightness]')?.closest('button') || correction.firstChild);
}

function enhanceCorrectionControls(correction, requirementId) {
  correction.querySelectorAll('input[type="range"][data-correct]').forEach((input) => {
    input.title ||= `Adjust ${input.dataset.correct} for the selected frame`;
    if (!input.closest('label')?.querySelector('.wizard-correction-control')) {
      const wrap = document.createElement('div');
      wrap.className = 'wizard-correction-control';
      wrap.innerHTML = '<button type="button" data-step="-1" title="Decrease by 1">‹</button><output></output><button type="button" data-step="1" title="Increase by 1">›</button>';
      input.after(wrap);
      wrap.querySelectorAll('button').forEach((stepButton) => stepButton.addEventListener('click', () => {
        input.value = String(clamp(Number(input.value) + Number(stepButton.dataset.step), Number(input.min), Number(input.max)));
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }));
    }

    if (!input.dataset.boundFrameCorrection) {
      input.dataset.boundFrameCorrection = 'true';
      input.addEventListener('input', () => {
        saveFrameCorrectionFromInputs(requirementId);
        syncCorrectionOutputs(correction);
        applyFrameCorrection(requirementId);
      });
    }
  });

  const matchButton = correction.querySelector('[data-match-brightness]');
  if (matchButton && !matchButton.dataset.boundFrameBrightnessMatch) {
    matchButton.dataset.boundFrameBrightnessMatch = 'true';
    matchButton.title = 'Scan uploaded frames and store brightness offsets per frame';
    matchButton.addEventListener('click', () => matchBrightnessAcrossFrames(requirementId));
  }

  syncCorrectionOutputs(correction);
}

function bindFrameNavigationRefresh(controls, requirementId) {
  controls.querySelectorAll('[data-prev-frame], [data-next-frame], [data-play-toggle]').forEach((control) => {
    if (control.dataset.boundFrameCorrectionNav) return;
    control.dataset.boundFrameCorrectionNav = 'true';
    control.addEventListener('click', () => window.setTimeout(() => loadFrameCorrection(requirementId), 60));
  });
}

function currentFrameIndex() {
  const text = document.querySelector('#quickstart-dialog [data-frame-readout]')?.textContent || '';
  const value = text.split('/')[0] || '1';
  return Math.max(0, Number(value) - 1 || 0);
}

function loadFrameCorrection(requirementId) {
  const correction = document.querySelector('#quickstart-dialog .wizard-correction-grid');
  if (!correction) return;
  const frameNumber = currentFrameIndex() + 1;
  const title = document.querySelector('#quickstart-dialog .wizard-correction-title');
  if (title) title.textContent = `Frame Correction – Frame ${String(frameNumber).padStart(2, '0')}`;
  const data = getRequirementData(requirementId);
  const frameCorrection = (data.frameCorrections || {})[currentFrameIndex()] || data.correction || { scale: 0, x: 0, y: 0, brightness: 0 };
  correction.querySelectorAll('[data-correct]').forEach((input) => {
    const key = input.dataset.correct;
    input.value = String(frameCorrection[key] ?? 0);
  });
  syncCorrectionOutputs(correction);
  applyFrameCorrection(requirementId);
}

function saveFrameCorrectionFromInputs(requirementId) {
  const correction = document.querySelector('#quickstart-dialog .wizard-correction-grid');
  if (!correction) return;
  const data = getRequirementData(requirementId);
  const frameCorrections = { ...(data.frameCorrections || {}) };
  frameCorrections[currentFrameIndex()] = {
    scale: Number(correction.querySelector('[data-correct="scale"]')?.value || 0),
    x: Number(correction.querySelector('[data-correct="x"]')?.value || 0),
    y: Number(correction.querySelector('[data-correct="y"]')?.value || 0),
    brightness: Number(correction.querySelector('[data-correct="brightness"]')?.value || 0)
  };
  writeRequirementData(requirementId, { frameCorrections });
}

function resetCurrentFrameCorrection(requirementId) {
  const data = getRequirementData(requirementId);
  const frameCorrections = { ...(data.frameCorrections || {}) };
  frameCorrections[currentFrameIndex()] = { scale: 0, x: 0, y: 0, brightness: 0 };
  writeRequirementData(requirementId, { frameCorrections });
  loadFrameCorrection(requirementId);
}

function syncCorrectionOutputs(correction) {
  correction.querySelectorAll('input[type="range"][data-correct]').forEach((input) => {
    const output = input.closest('label')?.querySelector('output');
    if (output) output.textContent = input.value;
  });
}

function applyFrameCorrection(requirementId) {
  const data = getRequirementData(requirementId);
  const current = (data.frameCorrections || {})[currentFrameIndex()] || data.correction || {};
  document.querySelectorAll('#quickstart-dialog [data-preview-stage] img, #quickstart-dialog .wizard-preview-stage img').forEach((img) => applyCorrectionToImage(img, current));
  document.querySelectorAll('#quickstart-dialog .wizard-frame-box img').forEach((img, index) => {
    const corr = (data.frameCorrections || {})[index] || data.correction || {};
    applyCorrectionToImage(img, corr);
  });
}

function applyCorrectionToImage(img, correction = {}) {
  const scale = 1 + (Number(correction.scale || 0) / 100);
  const x = Number(correction.x || 0);
  const y = Number(correction.y || 0);
  const brightness = 1 + (Number(correction.brightness || 0) / 100);
  img.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  img.style.transformOrigin = 'center center';
  img.style.filter = `brightness(${brightness})`;
}

async function matchBrightnessAcrossFrames(requirementId) {
  const data = getRequirementData(requirementId);
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
      const current = frameCorrections[index] || { scale: 0, x: 0, y: 0, brightness: 0 };
      const adjustment = clamp(Math.round(((target - average) / Math.max(average, 1)) * 100), -50, 50);
      frameCorrections[index] = { ...current, brightness: adjustment };
    });
    writeRequirementData(requirementId, { frameCorrections, brightnessMatch: { target: Math.round(target), generatedAt: new Date().toISOString() } });
    loadFrameCorrection(requirementId);
    toast('Brightness matched and stored per frame.', 'success');
  } catch (error) {
    toast(`Could not match brightness: ${error.message}`, 'error');
  }
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

function selectedRequirementId() {
  return document.querySelector('#quickstart-dialog .wizard-build-nav button.is-selected')?.dataset.requirementId || '';
}

function getRequirementData(requirementId) {
  return editorState.archetype?.productionAssets?.requirements?.[requirementId] || {};
}

function writeRequirementData(requirementId, updates) {
  if (!requirementId) return;
  const current = editorState.archetype?.productionAssets || { version: VERSION, requirements: {}, requirementOrder: [] };
  const productionAssets = {
    ...current,
    version: VERSION,
    requirements: {
      ...(current.requirements || {}),
      [requirementId]: {
        ...((current.requirements || {})[requirementId] || {}),
        ...updates
      }
    }
  };
  updateArchetype({ productionAssets });
}

function toast(message, type = 'info') {
  window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } }));
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
