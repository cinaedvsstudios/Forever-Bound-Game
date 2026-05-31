import { openSoundGeneratorModal } from '../../shared/sound-generator/sound-generator-window.js?v=1.00';

const returnedAsset = document.getElementById('returned-asset');

document.querySelectorAll('[data-source]').forEach((button) => {
  button.addEventListener('click', () => {
    openSoundGeneratorModal({
      sourceLabel: button.dataset.source,
      onAssign: ({ assetId }) => {
        if (returnedAsset) returnedAsset.textContent = assetId;
      }
    });
  });
});
