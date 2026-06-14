// Obstacle Course Asset Debug V4.1.0
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
  if (asset.type === 'json' && OC.groundPathMap) return 'loaded';
  if (asset.type === 'audio' && !OC.optionalFailures?.includes(asset.url)) return OC.loadingDone ? 'available' : 'pending';
  if (OC.images?.has(asset.url) || OC.glbTemplates?.has(asset.url)) return 'loaded';
  if (OC.failures?.includes(asset.url) || OC.optionalFailures?.includes(asset.url)) return 'failed';
  return 'pending';
}

function thumbFor(asset) {
  if (asset.type === 'image') return `<img src="${asset.url}?v=${OC.cacheVersion}" alt="" style="width:54px;height:38px;object-fit:cover;border:1px solid rgba(238,196,90,.35);border-radius:4px">`;
  if (asset.type === 'glb') return `<span style="display:grid;place-items:center;width:54px;height:38px;border:1px solid rgba(238,196,90,.35);border-radius:4px;color:#eec45a">3D</span>`;
  if (asset.type === 'audio') return `<span style="display:grid;place-items:center;width:54px;height:38px;border:1px solid rgba(238,196,90,.35);border-radius:4px;color:#9ee6a4">♪</span>`;
  if (asset.type === 'json') return `<span style="display:grid;place-items:center;width:54px;height:38px;border:1px solid rgba(238,196,90,.35);border-radius:4px;color:#9ecbff">JSON</span>`;
  return '';
}

function openPanel() {
  let panel = document.getElementById('horse-asset-debug-panel');
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'horse-asset-debug-panel';
    panel.style.cssText = 'position:fixed;right:18px;top:110px;z-index:9999;width:min(780px,92vw);max-height:76vh;overflow:auto;background:#070b10;color:#f4ead4;border:1px solid #eec45a;border-radius:12px;padding:14px;font:12px/1.35 monospace;box-shadow:0 20px 60px rgba(0,0,0,.5)';
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
  table.style.borderCollapse = 'collapse';
  [...requiredAssetList(), ...optionalAssetList()].forEach((asset) => {
    const row = document.createElement('tr');
    const thumb = document.createElement('td');
    thumb.innerHTML = thumbFor(asset);
    thumb.style.padding = '4px 8px 4px 0';
    row.appendChild(thumb);
    [asset.required ? 'required' : 'optional', asset.type, statusFor(asset), asset.url].forEach((value) => {
      const cell = document.createElement('td');
      cell.textContent = value;
      cell.style.padding = '4px 8px';
      if (value === 'failed') cell.style.color = '#ff8f8f';
      if (value === 'loaded' || value === 'available') cell.style.color = '#9ee6a4';
      row.appendChild(cell);
    });
    table.appendChild(row);
  });
  const ui = document.createElement('section');
  ui.innerHTML = `<h3>UI Elements</h3><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:8px">${['obstacle-start','obstacle-pause','obstacle-reset-run','obstacle-speed-badge','obstacle-distance-readout','obstacle-score-readout','oc-offpath-arrow','oc-loading-horse','hf-overview','hf-layer-select'].map((id) => `<div style="border:1px solid rgba(238,196,90,.3);border-radius:6px;padding:6px"><strong>${id}</strong><br><span style="color:${document.getElementById(id) ? '#9ee6a4' : '#ff8f8f'}">${document.getElementById(id) ? 'present' : 'missing'}</span></div>`).join('')}</div>`;
  panel.append(close, title, table, ui);
}

new MutationObserver(ensureButton).observe(document.documentElement, { childList: true, subtree: true });
ensureButton();
