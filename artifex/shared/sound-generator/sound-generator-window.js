import { createSoundGeneratorUI } from './sound-generator-ui-v1.js?v=1.00';

export function mountSoundGenerator(container, options = {}) {
  if (!container) throw new Error('A host element is required to mount Create Synth Sound.');
  return createSoundGeneratorUI(container, { mode: 'standalone', ...options });
}

export function openSoundGeneratorModal(options = {}) {
  const backdrop = document.createElement('section');
  backdrop.className = 'sound-modal-backdrop';
  backdrop.setAttribute('role', 'presentation');
  const mountPoint = document.createElement('div');
  mountPoint.className = 'sound-modal-mount';
  backdrop.appendChild(mountPoint);
  document.body.appendChild(backdrop);
  let component;
  let closed = false;

  const close = () => {
    if (closed) return;
    closed = true;
    component?.destroy();
    backdrop.remove();
    document.removeEventListener('keydown', keyHandler);
    options.onClose?.();
  };
  const keyHandler = (event) => { if (event.key === 'Escape') close(); };
  backdrop.addEventListener('pointerdown', (event) => { if (event.target === backdrop) close(); });
  document.addEventListener('keydown', keyHandler);
  component = createSoundGeneratorUI(mountPoint, { ...options, mode: 'floating', onClose: close });
  return { close, getRecipe: component.getRecord, stop: component.stop };
}

window.ArtifexSoundGenerator = Object.freeze({
  mount: mountSoundGenerator,
  openModal: openSoundGeneratorModal
});
