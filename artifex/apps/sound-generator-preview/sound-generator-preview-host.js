import { openSoundGeneratorModal } from '../../shared/sound-generator/sound-generator-window.js?v=1.17';

function openPreview() {
  openSoundGeneratorModal({
    sourceLabel: 'Sound Generator Preview',
    onAssign: ({ assetId }) => {
      console.log(`Sound Generator Preview assigned ${assetId}`);
    }
  });
}

document.querySelector('[data-open-generator]')?.addEventListener('click', openPreview);

// Open immediately so the preview page behaves like a direct test page.
openPreview();
