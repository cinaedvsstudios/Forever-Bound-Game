import { openSoundLibraryModal } from '../../shared/sound-generator/sound-library.js?v=1.10';

const returnedAsset = document.getElementById('returned-asset');
const capturedTarget = document.getElementById('captured-target');
const externalTarget = document.getElementById('external-target');
const eventLog = document.getElementById('event-log');
let simulatedExternalTarget = 'Preview Harness > Object Action Sound';

function log(message) {
  if (!eventLog) return;
  const item = document.createElement('li');
  item.textContent = `${new Date().toLocaleTimeString()} — ${message}`;
  eventLog.prepend(item);
}

function renderExternalTarget() {
  if (externalTarget) externalTarget.textContent = simulatedExternalTarget;
}

renderExternalTarget();

document.querySelectorAll('[data-source]').forEach((button) => {
  button.addEventListener('click', () => {
    const sourceLabel = button.dataset.source;
    if (capturedTarget) capturedTarget.textContent = sourceLabel;
    log(`Opened Sound Library for captured target: ${sourceLabel}`);
    openSoundLibraryModal({
      sourceLabel,
      onAssign: ({ assetId, sourceLabel: returnedSource }) => {
        if (returnedAsset) returnedAsset.textContent = assetId;
        log(`Callback returned only registered asset ID ${assetId} to captured target ${returnedSource}. External simulated target is currently ${simulatedExternalTarget}.`);
      }
    });
  });
});

document.querySelectorAll('[data-change-target]').forEach((button) => {
  button.addEventListener('click', () => {
    simulatedExternalTarget = button.dataset.changeTarget;
    renderExternalTarget();
    log(`External simulated target changed to ${simulatedExternalTarget}. Any open Sound Library must still assign to its captured target.`);
  });
});
