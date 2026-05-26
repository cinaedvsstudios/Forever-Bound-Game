import { moveActiveLayer } from './editor-state.js';

export function initMenuCleanupParity(showToast = () => {}) {
  wireUnderlayMenu(showToast);
  wireResolutionMenu(showToast);
  wireLayerOrderMenu(showToast);
}

function wireUnderlayMenu(showToast) {
  const button = replaceMenuButtonByText('#menu-view', 'Load Underlay', 'load-underlay-menu-button', 'Load Underlay', 'Load an image/video underlay behind the effect.');
  if (!button) return;
  button.addEventListener('click', () => {
    const input = document.getElementById('reference-file-input');
    if (input) {
      input.click();
      return;
    }
    showToast('Underlay controls are not ready yet. Refresh and try again.', 'warn');
  });
}

function wireResolutionMenu(showToast) {
  const button = replaceMenuButtonByText('#menu-file', 'Settings', 'focus-resolution-menu-button', 'Scene / FX Resolution', 'Jump to the Scene / FX Resolution controls in this menu.');
  if (!button) return;
  button.addEventListener('click', () => {
    const widthInput = document.getElementById('resolution-width-input');
    if (widthInput) {
      widthInput.scrollIntoView({ block: 'center', behavior: 'smooth' });
      widthInput.focus();
      showToast('Scene / FX Resolution controls are open in the File menu.', 'info');
      return;
    }
    showToast('Resolution controls are not ready yet. Refresh and try again.', 'warn');
  });
}

function wireLayerOrderMenu(showToast) {
  const oldButton = findMenuButtonByText('#menu-edit', 'Bring Forward / Send Back');
  if (!oldButton || document.getElementById('move-layer-up-menu-button')) return;
  const wrapper = document.createElement('div');
  wrapper.className = 'menu-button-pair';
  wrapper.innerHTML = `
    <button id="move-layer-up-menu-button" type="button" title="Move selected layer up in the draw stack.">Move Layer Up</button>
    <button id="move-layer-down-menu-button" type="button" title="Move selected layer down in the draw stack.">Move Layer Down</button>
  `;
  oldButton.replaceWith(wrapper);

  document.getElementById('move-layer-up-menu-button')?.addEventListener('click', () => {
    moveActiveLayer(1);
    showToast('Selected layer moved up.', 'success');
  });
  document.getElementById('move-layer-down-menu-button')?.addEventListener('click', () => {
    moveActiveLayer(-1);
    showToast('Selected layer moved down.', 'success');
  });

  injectMenuCleanupStyles();
}

function replaceMenuButtonByText(panelSelector, oldText, id, nextText, title) {
  const oldButton = findMenuButtonByText(panelSelector, oldText);
  if (!oldButton) return null;
  const button = document.createElement('button');
  button.id = id;
  button.type = 'button';
  button.textContent = nextText;
  button.title = title;
  oldButton.replaceWith(button);
  return button;
}

function findMenuButtonByText(panelSelector, text) {
  const panel = document.querySelector(panelSelector);
  if (!panel) return null;
  return Array.from(panel.querySelectorAll('button')).find((button) => button.textContent.trim() === text) || null;
}

function injectMenuCleanupStyles() {
  if (document.getElementById('menu-cleanup-parity-style')) return;
  const style = document.createElement('style');
  style.id = 'menu-cleanup-parity-style';
  style.textContent = `
    .menu-button-pair {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 7px;
    }
    .menu-button-pair button {
      min-height: 34px;
      text-align: center;
    }
  `;
  document.head.append(style);
}
