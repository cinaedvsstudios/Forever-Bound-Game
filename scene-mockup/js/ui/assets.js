import { dataUrlFromFile, imageFromSource, isGlbFile, isImageFile } from '../core/utils.js';
import { makeAsset, makeLayer } from '../core/scene-model.js';
import { mutate, getState } from '../core/store.js';
import { createGlbThumbnail } from '../features/glb-preview.js';
import { dom, toast } from './dom.js';

let libraryView = 'assets';

export function setupAssetImport() {
  dom.assetImportButton.addEventListener('click', () => dom.assetInput.click());
  document.querySelector('#placeholder-button').addEventListener('click', addPlaceholderAsset);
  dom.importFromZoneButton.addEventListener('click', () => dom.assetInput.click());
  dom.assetInput.addEventListener('change', async (event) => {
    await importFiles([...event.target.files]);
    event.target.value = '';
  });

  for (const eventName of ['dragenter', 'dragover']) {
    dom.assetDropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dom.assetDropZone.classList.add('is-dragging');
    });
  }
  for (const eventName of ['dragleave', 'drop']) {
    dom.assetDropZone.addEventListener(eventName, (event) => {
      event.preventDefault();
      dom.assetDropZone.classList.remove('is-dragging');
    });
  }
  dom.assetDropZone.addEventListener('drop', async (event) => importFiles([...event.dataTransfer.files]));
  dom.assetDropZone.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') dom.assetInput.click();
  });

  document.querySelectorAll('[data-library-view]').forEach((button) => {
    button.addEventListener('click', () => {
      libraryView = button.dataset.libraryView;
      document.querySelectorAll('[data-library-view]').forEach((item) => item.classList.toggle('is-active', item === button));
      renderAssets();
    });
  });
}

export async function importFiles(files) {
  const accepted = files.filter((file) => isImageFile(file) || isGlbFile(file));
  const skipped = files.length - accepted.length;
  if (!accepted.length) {
    toast('Choose PNG, JPG, WEBP or GLB files.', { error: true });
    return;
  }

  for (const file of accepted) {
    try {
      let asset;
      if (isImageFile(file)) {
        const dataUrl = await dataUrlFromFile(file);
        const image = await imageFromSource(dataUrl);
        asset = makeAsset({ name: file.name, kind: 'image', dataUrl, width: image.naturalWidth, height: image.naturalHeight });
      } else {
        const thumbnail = await createGlbThumbnail(file);
        asset = makeAsset({ name: file.name, kind: 'glb', dataUrl: thumbnail, sourceDataUrl: thumbnail, width: 700, height: 500 });
      }
      mutate(`Import ${file.name}`, (state) => state.assets.push(asset));
    } catch (error) {
      console.error(error);
      toast(`Could not import ${file.name}.`, { error: true });
    }
  }
  if (skipped) toast(`${skipped} unsupported file${skipped === 1 ? '' : 's'} skipped.`, { error: true });
  toast(`${accepted.length} asset${accepted.length === 1 ? '' : 's'} imported.`);
}

export function addAssetToScene(assetId, { asBackground = false } = {}) {
  const state = getState();
  const asset = state.assets.find((item) => item.id === assetId);
  if (!asset) return;
  mutate(`Add ${asset.name}`, (nextState) => {
    const layer = makeLayer(asset, nextState.canvas, asBackground ? {
      isBackground: true,
      name: `Background — ${asset.name.replace(/\.[^.]+$/, '')}`,
      x: 0, y: 0, width: nextState.canvas.width, height: nextState.canvas.height
    } : {});
    if (asBackground) {
      nextState.layers = nextState.layers.filter((item) => !item.isBackground);
      nextState.layers.unshift(layer);
    } else {
      nextState.layers.push(layer);
    }
    nextState.selectedLayerId = layer.id;
    nextState.selectedAssetId = asset.id;
  });
}

export function renderAssets() {
  const state = getState();
  const assets = libraryView === 'assets'
    ? state.assets
    : state.layers.map((layer) => ({ id: layer.id, name: layer.name, kind: layer.kind, dataUrl: layer.dataUrl, layer: true }));
  dom.assetGrid.innerHTML = '';
  if (!assets.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-inspector';
    empty.textContent = libraryView === 'assets' ? 'Import your first sprite, background or GLB.' : 'No layers in this scene yet.';
    dom.assetGrid.append(empty);
    return;
  }

  assets.forEach((asset) => {
    const card = dom.assetCardTemplate.content.firstElementChild.cloneNode(true);
    const image = card.querySelector('img');
    image.src = asset.dataUrl;
    card.querySelector('strong').textContent = asset.name;
    card.querySelector('small').textContent = asset.layer ? 'Scene layer' : asset.kind === 'glb' ? 'GLB render' : 'Image asset';
    card.addEventListener('click', () => {
      if (asset.layer) {
        mutate('Select layer', (nextState) => { nextState.selectedLayerId = asset.id; });
      } else addAssetToScene(asset.id);
    });
    card.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      if (!asset.layer) addAssetToScene(asset.id, { asBackground: true });
    });
    card.title = asset.layer ? 'Select layer' : 'Click to add. Right-click to set as background.';
    dom.assetGrid.append(card);
  });
}


function addPlaceholderAsset() {
  const canvas = document.createElement('canvas');
  canvas.width = 960;
  canvas.height = 540;
  const context = canvas.getContext('2d');
  context.fillStyle = '#28384f';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#7cb9e8';
  context.setLineDash([16, 10]);
  context.lineWidth = 5;
  context.strokeRect(28, 28, canvas.width - 56, canvas.height - 56);
  context.setLineDash([]);
  context.fillStyle = '#d9efff';
  context.textAlign = 'center';
  context.font = '700 48px system-ui';
  context.fillText('PLACEHOLDER', canvas.width / 2, canvas.height / 2 - 10);
  context.fillStyle = '#9db9d5';
  context.font = '400 23px system-ui';
  context.fillText('Scene image or later render', canvas.width / 2, canvas.height / 2 + 38);
  const dataUrl = canvas.toDataURL('image/png');
  const asset = makeAsset({ name: `Placeholder ${getState().assets.length + 1}`, kind: 'image', dataUrl, width: canvas.width, height: canvas.height });
  mutate('Add placeholder', (state) => state.assets.push(asset));
  addAssetToScene(asset.id);
  toast('Placeholder added to the scene.');
}
