// Obstacle Course Asset Debug V3.7
// Separate debug helper. Checks live obstacle course images, modular path WEBPs, GLBs, and planned audio.

const ASSET_ROOT = './assets/';
const STYLE_ID = 'horse-asset-debug-v3-style';
const MODAL_ID = 'horse-asset-debug-modal';
const BUTTON_ID = 'horse-asset-debug-button';

const ASSETS = [
  ['Backgrounds','image','Main forest ride background','backgrounds/horseridebg.jpg',false],
  ['Foreground','image','Horse 7-frame sprite sheet','foreground/horse.png',false],
  ['Ground','image','Forest ground Z-tile texture','ground/forest_ground.webp',false],
  ['Path segments','image','Path straight','path-segments/pathstraight.webp',false],
  ['Path segments','image','Path kink','path-segments/pathkink.webp',false],
  ['Path segments','image','Path left','path-segments/pathleft.webp',false],
  ['Path segments','image','Path right','path-segments/pathright.webp',false],
  ['Path segments','image','Path left to straight','path-segments/pathlefttostraight.webp',false],
  ['Path segments','image','Right to straight','path-segments/righttostraight.webp',false],
  ['3D trees','glb','Dead tree','3d/dead_tree.glb',false],
  ['3D trees','glb','Hill top tree','3d/hill_top_tree.glb',false],
  ['3D details','glb','Low poly fern','3d/low_poly_fern.glb',false],
  ['3D trees','glb','Oak trees','3d/oak_trees.glb',false],
  ['3D trees','glb','Pine tree','3d/pine_tree.glb',false],
  ['3D trees','glb','Pine tree PS1 low poly','3d/pine_tree__ps1_low_poly.glb',false],
  ['3D trees','glb','Pine with awkward teenage face','3d/pine_with_awkward_teenage_face.glb',false],
  ['3D rocks','glb','Low-poly rock','3d/rock_low-poly.glb',false],
  ['3D trees','glb','Small pine','3d/small_pine.glb',false],
  ['3D rocks','glb','Low-poly stone','3d/stone_low-poly.glb',false],
  ['3D collectibles','glb','Stylized glowing mushrooms','3d/stylized_glowing_mushrooms.glb',false],
  ['3D collectibles','glb','Moneysack collectible','3d/moneysack.glb',false],
  ['3D trees','glb','Tree','3d/tree.glb',false],
  ['3D trees','glb','Tree gn','3d/tree_gn.glb',false],
  ['3D trees','glb','Low-poly tree','3d/tree_low-poly.glb',false],
  ['Shared UI','image','Default icons sheet','../../../shared/ui/defaulticons.webp',true],
  ['Shared UI','image','Default arrows sheet','../../../shared/ui/defaultarrows.webp',true],
  ['Audio','audio','Slow gallop loop','audio/horse_gallop_slow.mp3',false],
  ['Audio','audio','Full gallop loop','audio/horse_gallop_full.mp3',false],
  ['Audio','audio','Landing','audio/horse_land.mp3',false],
  ['Audio','audio','Horse neigh','audio/horse_neigh.mp3',false],
  ['Audio','audio','Horse snort','audio/horse_snort.wav',false],
  ['Audio','audio','Forest ambience','audio/forest_ambience.mp3',false],
  ['Audio','audio','Bush rustle','audio/bush.mp3',false]
].map(([group,type,name,path,optional]) => ({ group, type, name, path, optional }));

function injectStyles() {
  ['horse-asset-debug-v1-style','horse-asset-debug-v2-style'].forEach((id) => document.getElementById(id)?.remove());
  if (document.getElementById(STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = `
    .hf-asset-debug-button{min-height:34px;border:1px solid rgba(144,192,255,.45);border-radius:9px;background:rgba(36,62,92,.72);color:var(--cream,#f4ead4);font-weight:900;cursor:pointer;margin:0;padding:0 11px}
    .hf-asset-modal{position:fixed;inset:42px;z-index:99999;border:1px solid rgba(238,196,90,.55);border-radius:18px;background:rgba(5,10,16,.98);color:#f4ead4;box-shadow:0 24px 80px rgba(0,0,0,.7);display:flex;flex-direction:column;overflow:hidden}.hf-asset-modal[hidden]{display:none!important}
    .hf-asset-head{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:14px 16px;border-bottom:1px solid rgba(238,196,90,.22);background:rgba(22,29,40,.96)}.hf-asset-head h2{margin:0;font-size:1rem;font-family:Georgia,serif}.hf-asset-head button{border:1px solid rgba(238,196,90,.4);border-radius:9px;background:rgba(82,55,10,.72);color:#f4ead4;font-weight:900;padding:8px 10px;cursor:pointer}
    .hf-asset-body{padding:12px 14px;overflow:auto}.hf-asset-toolbar{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px;color:#c9bfae;font-size:.75rem}.hf-asset-table{width:100%;border-collapse:collapse;font-size:.72rem}.hf-asset-table th,.hf-asset-table td{border-bottom:1px solid rgba(238,196,90,.14);padding:7px 6px;text-align:left;vertical-align:top}.hf-asset-table th{position:sticky;top:0;background:#101722;z-index:1;color:#eec45a}.hf-asset-status{font-weight:900}.hf-asset-status.ok{color:#9ee6a4}.hf-asset-status.fail{color:#ff9a84}.hf-asset-status.pending{color:#eec45a}.hf-asset-preview img{max-width:92px;max-height:52px;object-fit:cover;border:1px solid rgba(255,255,255,.18);border-radius:6px;background:#111}.hf-asset-path{font-family:monospace;color:#c9bfae;word-break:break-all}.hf-asset-small{color:#c9bfae;font-size:.66rem;line-height:1.25}
    @media(max-width:1120px){.hf-asset-modal{inset:12px}}
  `;
  document.head.appendChild(style);
}

function urlOf(asset) { return asset.path.startsWith('../') ? asset.path : `${ASSET_ROOT}${asset.path}`; }
function bytes(n) { if (!Number.isFinite(n)) return ''; if (n < 1024) return `${n} B`; if (n < 1048576) return `${(n / 1024).toFixed(1)} KB`; return `${(n / 1048576).toFixed(2)} MB`; }
function setRow(row, status, detail, cls) { const statusNode = row.querySelector('.hf-asset-status'); statusNode.textContent = status; statusNode.className = `hf-asset-status ${cls}`; row.querySelector('.hf-asset-detail').textContent = detail || ''; }

async function fetchAsset(asset, label) {
  const response = await fetch(`${urlOf(asset)}?assetDebug=${Date.now()}`, { cache: 'no-store' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const blob = await response.blob();
  return { response, blob, detail: `${bytes(blob.size)} · ${response.headers.get('content-type') || label} request ok` };
}

async function checkImage(asset, row) {
  try {
    const { blob, detail } = await fetchAsset(asset, 'image');
    const objectUrl = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      row.querySelector('.hf-asset-preview').replaceChildren(img);
      setRow(row, asset.optional ? 'loaded optional' : 'loaded', `${detail} · ${img.naturalWidth} × ${img.naturalHeight}`, 'ok');
      setTimeout(() => URL.revokeObjectURL(objectUrl), 30000);
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setRow(row, asset.optional ? 'decode failed optional' : 'decode failed', `${detail} · browser could not decode image`, asset.optional ? 'pending' : 'fail');
    };
    img.src = objectUrl;
  } catch (error) {
    setRow(row, asset.optional ? 'missing optional' : 'failed', error.message, asset.optional ? 'pending' : 'fail');
  }
}

async function checkRequest(asset, row, label) {
  try {
    const { blob, response } = await fetchAsset(asset, label);
    setRow(row, asset.optional ? 'found optional' : 'found', `${bytes(blob.size)} · ${response.headers.get('content-type') || label} request ok`, 'ok');
    return blob;
  } catch (error) {
    setRow(row, asset.optional ? 'missing optional' : 'failed', error.message, asset.optional ? 'pending' : 'fail');
    return null;
  }
}

async function checkGlb(asset, row) {
  const blob = await checkRequest(asset, row, 'GLB');
  if (!blob) return;
  try {
    const buffer = await blob.arrayBuffer();
    const header = new TextDecoder().decode(new Uint8Array(buffer.slice(0, 4)));
    let detail = `${bytes(buffer.byteLength)} · header ${header}`;
    if (header !== 'glTF') detail += ' · WARNING: not binary GLB';
    try {
      const THREE = await import('https://cdn.jsdelivr.net/npm/three@0.128.0/build/three.module.js');
      const { GLTFLoader } = await import('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/jsm/loaders/GLTFLoader.js');
      const gltf = await new Promise((resolve, reject) => new GLTFLoader().parse(buffer, '', resolve, reject));
      let meshes = 0;
      const materials = new Set();
      const box = new THREE.Box3();
      gltf.scene.traverse((obj) => {
        if (obj.isMesh) {
          meshes += 1;
          if (obj.material) materials.add(obj.material.uuid || obj.material.name || meshes);
        }
      });
      box.setFromObject(gltf.scene);
      const size = box.getSize(new THREE.Vector3());
      detail += ` · parsed · meshes ${meshes} · materials ${materials.size} · box ${size.x.toFixed(2)}×${size.y.toFixed(2)}×${size.z.toFixed(2)}`;
    } catch (error) {
      detail += ` · parser failed: ${error.message}`;
    }
    setRow(row, asset.optional ? 'loaded optional' : 'loaded', detail, 'ok');
  } catch (error) {
    setRow(row, asset.optional ? 'failed optional' : 'failed', error.message, asset.optional ? 'pending' : 'fail');
  }
}

function createModal() {
  const modal = document.createElement('section');
  modal.id = MODAL_ID;
  modal.className = 'hf-asset-modal';
  modal.hidden = true;
  modal.innerHTML = `<div class="hf-asset-head"><div><h2>Horse Forest Asset Debug</h2><div class="hf-asset-small">Checks live images, path WEBPs, audio requests, and GLB request/parse status. Optional reference/planned assets may be missing.</div></div><div><button id="hf-asset-rerun" type="button">Recheck</button> <button id="hf-asset-close" type="button">Close</button></div></div><div class="hf-asset-body"><div class="hf-asset-toolbar"><span id="hf-asset-summary">Ready.</span><span class="hf-asset-path">Root: ${ASSET_ROOT}</span></div><table class="hf-asset-table"><thead><tr><th>Group</th><th>Asset</th><th>Type</th><th>Status</th><th>Preview</th><th>Path / Details</th></tr></thead><tbody id="hf-asset-rows"></tbody></table></div>`;
  document.body.appendChild(modal);
  modal.querySelector('#hf-asset-close').addEventListener('click', () => { modal.hidden = true; });
  modal.querySelector('#hf-asset-rerun').addEventListener('click', runChecks);
  return modal;
}

function runChecks() {
  const rows = document.getElementById('hf-asset-rows');
  const summary = document.getElementById('hf-asset-summary');
  if (!rows || !summary) return;
  rows.innerHTML = '';
  summary.textContent = `Checking ${ASSETS.length} assets...`;
  ASSETS.forEach((asset) => {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${asset.group}</td><td>${asset.name}${asset.optional ? '<div class="hf-asset-small">optional/reference</div>' : ''}</td><td>${asset.type}</td><td><span class="hf-asset-status pending">pending</span></td><td class="hf-asset-preview"></td><td><div class="hf-asset-path">${urlOf(asset)}</div><div class="hf-asset-small hf-asset-detail"></div></td>`;
    rows.appendChild(row);
    if (asset.type === 'image') checkImage(asset, row);
    else if (asset.type === 'glb') checkGlb(asset, row);
    else checkRequest(asset, row, 'audio');
  });
  setTimeout(() => {
    const ok = rows.querySelectorAll('.hf-asset-status.ok').length;
    const fail = rows.querySelectorAll('.hf-asset-status.fail').length;
    const pending = rows.querySelectorAll('.hf-asset-status.pending').length;
    summary.textContent = `Checked: ${ok} ok · ${fail} failed · ${pending} optional/pending`;
  }, 3500);
}

function openModal() {
  const modal = document.getElementById(MODAL_ID) || createModal();
  modal.hidden = false;
  runChecks();
}

function ensureButton() {
  if (!document.body.classList.contains('is-obstacle-course')) return;
  let button = document.getElementById(BUTTON_ID);
  const slot = document.getElementById('oc-debug-button-slot');
  const legacyAnchor = document.getElementById('hf-export-json') || document.querySelector('.obstacle-side-card .hf-button-row:first-child');
  const anchor = slot || legacyAnchor;
  if (!anchor) return;

  if (!button) {
    button = document.createElement('button');
    button.id = BUTTON_ID;
    button.className = 'hf-asset-debug-button';
    button.type = 'button';
    button.textContent = 'Asset Debug';
    button.addEventListener('click', openModal);
  }

  if (slot && button.parentElement !== slot) slot.appendChild(button);
  else if (!slot && legacyAnchor && button.parentElement !== legacyAnchor.parentElement) legacyAnchor.insertAdjacentElement('afterend', button);
}

function boot() {
  injectStyles();
  const observer = new MutationObserver(ensureButton);
  observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'hidden'] });
  document.addEventListener('click', () => requestAnimationFrame(ensureButton), true);
  setInterval(ensureButton, 600);
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
else boot();
