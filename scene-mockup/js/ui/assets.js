import { dataUrlFromFile, imageFromSource, isGlbFile, isImageFile } from '../core/utils.js';
import { makeAsset, makeLayer } from '../core/scene-model.js';
import { mutate, getState } from '../core/store.js';
import { createGlbThumbnail } from '../features/glb-preview.js';
import { loadRepositoryCatalogue, categoryLabel } from '../features/asset-catalogue.js';
import {
  getAssetBrowserState,
  getAssetGridTargets,
  getAssetSearchQuery,
  mountAssetBrowser,
  setAssetLibraryView,
  syncAssetBrowser
} from './asset-browser.js';
import { dom, toast } from './dom.js';

let libraryView = 'assets';
let catalogueLoad = null;

export function setupAssetImport() {
  mountAssetBrowser({
    onChange: renderAssets,
    onRefresh: () => hydrateRepositoryAssets({ force: true })
  });

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
      setAssetLibraryView(libraryView);
      document.querySelectorAll('[data-library-view]').forEach((item) => item.classList.toggle('is-active', item === button));
      renderAssets();
    });
  });

  hydrateRepositoryAssets();
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
        asset = makeAsset({
          name: file.name,
          kind: 'image',
          dataUrl,
          width: image.naturalWidth,
          height: image.naturalHeight,
          category: 'imports',
          origin: 'local'
        });
      } else {
        const thumbnail = await createGlbThumbnail(file);
        asset = makeAsset({
          name: file.name,
          kind: 'glb',
          dataUrl: thumbnail,
          sourceDataUrl: thumbnail,
          width: 700,
          height: 500,
          category: 'imports',
          origin: 'local'
        });
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

export async function addAssetToScene(assetId, { asBackground = false } = {}) {
  let asset = getState().assets.find((item) => item.id === assetId);
  if (!asset) return;

  if (asset.kind === 'image' && (!asset.width || !asset.height)) {
    try {
      const image = await imageFromSource(asset.dataUrl);
      asset = { ...asset, width: image.naturalWidth, height: image.naturalHeight };
      mutate('Read asset dimensions', (state) => {
        const target = state.assets.find((item) => item.id === asset.id);
        if (target) {
          target.width = asset.width;
          target.height = asset.height;
        }
      }, { record: false });
    } catch (error) {
      console.warn(`Could not read dimensions for ${asset.name}.`, error);
    }
  }

  mutate(`Add ${asset.name}`, (state) => {
    const sceneAsset = state.assets.find((item) => item.id === asset.id);
    if (!sceneAsset) return;

    const layer = makeLayer(sceneAsset, state.canvas, asBackground ? {
      isBackground: true,
      name: `Background — ${sceneAsset.name.replace(/\.[^.]+$/, '')}`,
      x: 0,
      y: 0,
      width: state.canvas.width,
      height: state.canvas.height
    } : {});

    if (asBackground) {
      state.layers = state.layers.filter((item) => !item.isBackground);
      state.layers.unshift(layer);
    } else {
      state.layers.push(layer);
    }

    state.selectedLayerId = layer.id;
    state.selectedAssetId = sceneAsset.id;
  });
}

export function renderAssets() {
  const state = getState();
  const browser = getAssetBrowserState();
  const source = libraryView === 'assets'
    ? state.assets
    : state.layers.map((layer) => ({
      id: layer.id,
      name: layer.name,
      kind: layer.kind,
      dataUrl: layer.dataUrl,
      category: layer.isBackground ? 'backgrounds' : 'scene',
      layer: true
    }));

  const query = getAssetSearchQuery();
  const assets = source.filter((asset) => {
    const matchesCategory = browser.category === 'all' || asset.category === browser.category;
    const searchText = `${asset.name} ${asset.category ?? ''} ${asset.kind ?? ''}`.toLocaleLowerCase();
    return matchesCategory && (!query || searchText.includes(query));
  });

  syncAssetBrowser({ visibleCount: assets.length, libraryView });
  getAssetGridTargets().forEach((target) => renderAssetGrid(target, assets));
}

async function hydrateRepositoryAssets({ force = false } = {}) {
  if (catalogueLoad) return catalogueLoad;

  catalogueLoad = loadRepositoryCatalogue({ force })
    .then((catalogue) => {
      mutate('Load repository asset library', (state) => {
        state.assets = state.assets.filter((asset) => asset.origin !== 'repository' && asset.origin !== 'manifest');
        state.assets.push(...catalogue);
      }, { record: false });

      if (force) {
        toast(catalogue.length
          ? `Library refreshed: ${catalogue.length} repository asset${catalogue.length === 1 ? '' : 's'} found.`
          : 'No supported files are in the repository asset folders yet.');
      }
      return catalogue;
    })
    .catch((error) => {
      console.error(error);
      toast('Could not refresh repository assets. Local imports are still available.', { error: true });
      return [];
    })
    .finally(() => {
      catalogueLoad = null;
    });

  return catalogueLoad;
}

function renderAssetGrid(container, assets) {
  container.innerHTML = '';
  if (!assets.length) {
    const empty = document.createElement('p');
    empty.className = 'empty-inspector asset-empty-state';
    empty.textContent = libraryView === 'assets'
      ? 'No assets match this search. Add files to assets/backgrounds, assets/people or assets/objects, then refresh.'
      : 'No layers in this scene match the current search.';
    container.append(empty);
    return;
  }

  assets.forEach((asset) => {
    const card = dom.assetCardTemplate.content.firstElementChild.cloneNode(true);
    const image = card.querySelector('img');
    image.src = asset.dataUrl;
    image.alt = `${asset.name} preview`;
    card.querySelector('strong').textContent = asset.name;
    card.querySelector('small').textContent = asset.layer
      ? 'Scene layer'
      : asset.kind === 'glb'
        ? `${categoryLabel(asset.category)} · GLB`
        : `${categoryLabel(asset.category)} · Image`;

    card.addEventListener('click', () => {
      if (asset.layer) {
        mutate('Select layer', (state) => { state.selectedLayerId = asset.id; });
      } else {
        addAssetToScene(asset.id);
      }
    });

    card.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      if (!asset.layer) addAssetToScene(asset.id, { asBackground: true });
    });

    card.title = asset.layer ? 'Select layer' : 'Click to add. Right-click to set as background.';
    container.append(card);
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
  const asset = makeAsset({
    name: `Placeholder ${getState().assets.length + 1}`,
    kind: 'image',
    dataUrl,
    width: canvas.width,
    height: canvas.height,
    category: 'imports',
    origin: 'generated'
  });
  mutate('Add placeholder', (state) => state.assets.push(asset));
  addAssetToScene(asset.id);
  toast('Placeholder added to the scene.');
}
