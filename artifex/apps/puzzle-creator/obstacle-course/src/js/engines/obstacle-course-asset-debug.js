// Obstacle Course Asset Debug V4.0.0
import { requiredAssetList, optionalAssetList } from './obstacle-course-assets.js';
import { OC } from './obstacle-course-state.js';

function ensureButton() {
  const slot = document.getElementById('oc-debug-button-slot');
  if (!slot || document.getElementById('horse-asset-debug-button')) return;
  const button = document.createElement('button');
  button.id = 'horse-asset-debug-button';
  button.type = 'button';
  button.textContent = 'Asset Debug';
  button.addEventListener('click', openPanel);
  slot.appendChild(button);
}

function statusFor(asset) {
  if (OC.images?.has(asset.url) || OC.glbTemplates?.has(asset.url)) return 'loaded';
  if (OC.failures?.includes(asset.url) || OC.optionalFailures?.includes(asset.url)) return 'failed';
  return 'pending';
}

function openPanel() {
  let panel = document.getElementById('horse-asset-debug-panel');
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'horse-asset-debug-panel';
    panel.style.cssText = 'position:fixed;right:18px;top:110px;z-index:9999;max-width:620px;max-height:70vh;overflow:auto;background:#070b10;color:#f4ead4;border:1px solid #eec45a;border-radius:12px;padding:14px;font:12px/1.35 monospace;box-shadow:0 20px 60px rgba(0,0,0,.5)';
    document.body.appendChild(panel);
  }
  panel.textContent = '';
  const close = document.createElement('button');
  close.textContent = 'Close';
  close.style.float = 'right';
  close.onclick = () => panel.remove();
  const title = document.createElement('h3');
  title.textContent = 'Obstacle Course Asset Debug';
  const table = document.createElement('table');
  [...requiredAssetList(), ...optionalAssetList()].forEach((asset) => {
    const row = document.createElement('tr');
    [asset.required ? 'required' : 'optional', asset.type, statusFor(asset), asset.url].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      cell.style.padding = '3px 7px';
      row.appendChild(cell);
    });
    table.appendChild(row);
  });
  panel.append(close, title, table);
}

new MutationObserver(ensureButton).observe(document.documentElement, { childList: true, subtree: true });
ensureButton();
