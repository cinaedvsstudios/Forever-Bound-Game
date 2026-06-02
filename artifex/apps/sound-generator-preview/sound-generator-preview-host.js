import { openSoundLibraryModal } from '../../shared/sound-generator/sound-library.js?v=1.10';

const returnedAsset = document.getElementById('returned-asset');
const capturedTarget = document.getElementById('captured-target');
const externalTarget = document.getElementById('external-target');
const eventLog = document.getElementById('event-log');
const debugPanel = document.querySelector('[data-debug-panel]');
let simulatedExternalTarget = 'Preview Harness > Object Action Sound';
let activeLibrary = null;

function log(message) {
  if (!eventLog) return;
  const item = document.createElement('li');
  item.textContent = `${new Date().toLocaleTimeString()} — ${message}`;
  eventLog.prepend(item);
}

function renderExternalTarget() {
  if (externalTarget) externalTarget.textContent = simulatedExternalTarget;
}

function openLibrary({ sourceLabel = 'Sound Library Preview', debugContext = false } = {}) {
  activeLibrary?.close();
  if (debugContext && capturedTarget) capturedTarget.textContent = sourceLabel;
  if (debugContext) log(`Opened Sound Library for debug captured target: ${sourceLabel}`);
  activeLibrary = openSoundLibraryModal({
    sourceLabel,
    debugContext,
    onAssign: ({ assetId, sourceLabel: returnedSource }) => {
      if (returnedAsset) returnedAsset.textContent = assetId;
      if (debugContext) {
        log(`Callback returned only registered asset ID ${assetId} to captured target ${returnedSource}. External simulated target is currently ${simulatedExternalTarget}.`);
      }
    },
    onClose: () => { activeLibrary = null; }
  });
}

renderExternalTarget();

document.querySelector('[data-open-library]')?.addEventListener('click', () => openLibrary());
document.querySelector('[data-show-debug]')?.addEventListener('click', () => {
  if (debugPanel) debugPanel.hidden = false;
});
document.querySelector('[data-hide-debug]')?.addEventListener('click', () => {
  if (debugPanel) debugPanel.hidden = true;
});

document.querySelectorAll('[data-source]').forEach((button) => {
  button.addEventListener('click', () => {
    openLibrary({ sourceLabel: button.dataset.source, debugContext: true });
  });
});

document.querySelectorAll('[data-change-target]').forEach((button) => {
  button.addEventListener('click', () => {
    simulatedExternalTarget = button.dataset.changeTarget;
    renderExternalTarget();
    log(`External simulated target changed to ${simulatedExternalTarget}. Any open Sound Library must still assign to its captured target.`);
  });
});

openLibrary();