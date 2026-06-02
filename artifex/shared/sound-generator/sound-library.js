import '../project-folder/project-folder-client.js?v=0.1.0';
import { loadRegisteredContentIndex, REGISTERED_CONTENT_STATUS } from '../registered-content/registered-content-reader.js';
import { ProceduralSoundRuntime } from './procedural-synth-runtime.js';
import { openSoundGeneratorModal } from './sound-generator-window.js?v=1.10';

const STYLE_ID = 'artifex-sound-generator-css';
const AUDIO_EXTENSIONS = Object.freeze(['.wav', '.mp3', '.ogg', '.oga', '.flac', '.aac', '.m4a', '.webm']);
const SYNTH_SCHEMA = 'artifex.audio.procedural-synth.v1';
const esc = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const text = (value) => String(value ?? '').trim();

function loadCss() {
  if (document.getElementById(STYLE_ID)) return;
  const link = document.createElement('link');
  link.id = STYLE_ID;
  link.rel = 'stylesheet';
  link.href = new URL('./sound-generator.css?v=1.10', import.meta.url).href;
  document.head.appendChild(link);
}

function getProjectClient() {
  return window.ArtifexProjectFolder || null;
}

function extensionOf(path = '') {
  const lower = String(path).toLowerCase();
  return AUDIO_EXTENSIONS.find((extension) => lower.endsWith(extension)) || '';
}

function isGeneratedSynth(raw = {}) {
  return raw.assetKind === 'procedural-synth' || raw.playbackEngine === 'web-audio' || String(raw.file || raw.path || '').toLowerCase().endsWith('.json') && String(raw.id || raw.assetId || '').startsWith('asset_sfx_');
}

function isAudioFile(raw = {}) {
  const file = raw.file || raw.path || raw.resourcePath || '';
  const lowerType = `${raw.type || ''} ${raw.category || ''} ${raw.mimeType || ''}`.toLowerCase();
  return AUDIO_EXTENSIONS.some((extension) => String(file).toLowerCase().endsWith(extension)) || lowerType.includes('audio');
}

export function normalizeAudioAsset(item) {
  const raw = item?.raw || item || {};
  if (!raw.id && !raw.assetId && !item?.id) return null;
  if (!isGeneratedSynth(raw) && !isAudioFile(raw)) return null;
  const id = text(raw.id || raw.assetId || item.id);
  const file = text(raw.file || raw.path || raw.resourcePath || item.file);
  const generated = isGeneratedSynth(raw);
  return {
    id,
    name: text(raw.name || raw.title || item.name || id),
    category: text(raw.category || raw.type || item.type || 'audio'),
    file,
    tags: Array.isArray(raw.tags) ? raw.tags.map(text).filter(Boolean) : [],
    status: text(raw.status || item.status || 'registered'),
    sourceType: generated ? 'generated-synth' : 'audio-file',
    typeLabel: generated ? 'Generated Synth' : 'Audio File',
    previewLabel: generated ? 'Web Audio synth recipe' : `Registered ${extensionOf(file).replace('.', '').toUpperCase() || 'audio'} file`,
    raw
  };
}

export async function loadRegisteredAudioAssets(options = {}) {
  const result = await loadRegisteredContentIndex('assets', options);
  const assets = (result.items || []).map(normalizeAudioAsset).filter(Boolean);
  return { ...result, audioAssets: assets };
}

function markup(options) {
  return `<section class="sound-modal-backdrop" role="presentation"><div class="sound-library-modal" role="dialog" aria-modal="true" aria-label="Sound Library"><header class="sound-header"><div class="sound-brand"><span class="sound-rune">ᚠ</span><div><p class="sound-kicker">ARTIFEX SHARED SELECTOR</p><h1>Sound Library</h1><p>Audio-filtered Asset Library selector — ${esc(options.sourceLabel || 'No caller context')}</p></div></div><button class="sound-close" type="button" data-library-act="close" title="Close">×</button></header><div class="sound-library-toolbar"><label>Search by name or tag <input type="search" data-library-search placeholder="coin, portal, warning…" /></label><label>Audio type <select data-library-filter><option value="all">All audio</option><option value="audio-file">Audio File</option><option value="generated-synth">Generated Synth</option></select></label><button type="button" data-library-act="refresh">Refresh</button><button type="button" class="primary" data-library-act="create">Create New Synth Sound</button></div><div class="sound-library-status" data-library-status></div><div class="sound-library-list" data-library-list></div><footer class="sound-actions"><div><strong>Captured target:</strong> <span data-captured>${esc(options.sourceLabel || 'Preview Harness')}</span></div><div><button type="button" data-library-act="stop">Stop</button><button type="button" class="assign-action" data-library-act="assign">Choose / Assign in Preview Harness</button></div></footer></div></section>`;
}

export function openSoundLibraryModal(options = {}) {
  loadCss();
  const captured = {
    sourceLabel: options.sourceLabel || 'Preview Harness',
    currentAssetId: options.currentAssetId || '',
    onAssign: typeof options.onAssign === 'function' ? options.onAssign : () => {},
    openedAt: new Date().toISOString()
  };
  const state = { assets: [], selectedId: captured.currentAssetId, status: 'Loading Audio Asset Library…', previewUrl: null, playingId: '' };
  const host = document.createElement('div');
  host.innerHTML = markup(captured);
  const root = host.firstElementChild;
  document.body.appendChild(root);
  const $ = (selector) => root.querySelector(selector);
  const runtime = new ProceduralSoundRuntime(({ message }) => setStatus(message || state.status));
  let audioElement = null;
  let synthModal = null;

  function setStatus(message, kind = '') {
    state.status = message;
    const node = $('[data-library-status]');
    if (node) { node.textContent = message; node.dataset.kind = kind; }
  }

  function filteredAssets() {
    const term = text($('[data-library-search]')?.value).toLowerCase();
    const filter = $('[data-library-filter]')?.value || 'all';
    return state.assets.filter((asset) => {
      if (filter !== 'all' && asset.sourceType !== filter) return false;
      if (!term) return true;
      return [asset.id, asset.name, asset.category, asset.file, asset.typeLabel, ...asset.tags].join(' ').toLowerCase().includes(term);
    });
  }

  function renderList() {
    const list = $('[data-library-list]');
    const assets = filteredAssets();
    if (!assets.length) {
      list.innerHTML = '<p class="sound-empty">No registered audio assets match this view. Create a generated synth sound, or register imported audio through the Asset Library when that workflow is available.</p>';
      return;
    }
    list.innerHTML = assets.map((asset) => `<article class="sound-library-item ${asset.id === state.selectedId ? 'is-selected' : ''}" data-asset-id="${esc(asset.id)}"><div><p class="sound-type-badge ${asset.sourceType}">${esc(asset.typeLabel)}</p><h2>${esc(asset.name)}</h2><p>${esc(asset.previewLabel)}</p><small>${esc(asset.id)} · ${esc(asset.file)}${asset.tags.length ? ` · ${esc(asset.tags.join(', '))}` : ''}</small></div><div class="sound-library-item-actions"><button type="button" data-library-preview="${esc(asset.id)}">Preview</button><button type="button" data-library-select="${esc(asset.id)}">${asset.id === state.selectedId ? 'Selected' : 'Select'}</button></div></article>`).join('');
  }

  async function refresh(selectAssetId = '') {
    const client = getProjectClient();
    const clientState = client?.getState?.();
    if (!client || clientState?.folderStatus !== client.folderStatus.CONNECTED) {
      state.assets = [];
      renderList();
      setStatus('No project connected. Connect a disposable Blank Starter Project folder before reading assets/asset-index.json.', 'warning');
      return;
    }
    setStatus('Reading registered audio assets from assets/asset-index.json…');
    const result = await loadRegisteredAudioAssets({ projectFolderClient: client });
    state.assets = result.audioAssets || [];
    if (selectAssetId) state.selectedId = selectAssetId;
    if (!state.assets.length) {
      renderList();
      const empty = result.status === REGISTERED_CONTENT_STATUS.EMPTY ? 'No registered audio assets are available in assets/asset-index.json.' : result.message;
      setStatus(empty, result.status === REGISTERED_CONTENT_STATUS.READY ? '' : 'warning');
      return;
    }
    if (!state.selectedId || !state.assets.some((asset) => asset.id === state.selectedId)) state.selectedId = state.assets[0].id;
    renderList();
    setStatus(`${state.assets.length} registered audio asset(s) available from assets/asset-index.json.`);
  }

  function stopPreview() {
    runtime.stop();
    if (audioElement) {
      audioElement.pause();
      audioElement.removeAttribute('src');
      audioElement.load();
      audioElement = null;
    }
    if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
    state.previewUrl = null;
    state.playingId = '';
  }

  async function previewAsset(assetId) {
    const asset = state.assets.find((item) => item.id === assetId);
    if (!asset) return;
    stopPreview();
    state.selectedId = asset.id;
    renderList();
    try {
      const client = getProjectClient();
      if (asset.sourceType === 'generated-synth') {
        const record = await client.readJson(asset.file);
        if (record?.schemaVersion !== SYNTH_SCHEMA) throw new Error('The generated synth recipe has an unsupported schema.');
        await runtime.play(record);
        state.playingId = asset.id;
        setStatus(`Previewing generated synth ${asset.id}.`);
      } else {
        const bytes = await client.readBytes(asset.file);
        const mimeType = asset.raw.mimeType || `audio/${extensionOf(asset.file).replace('.', '') || 'mpeg'}`;
        state.previewUrl = URL.createObjectURL(new Blob([bytes], { type: mimeType }));
        audioElement = new Audio(state.previewUrl);
        audioElement.addEventListener('ended', () => setStatus('Audio file preview complete.'));
        await audioElement.play();
        state.playingId = asset.id;
        setStatus(`Previewing registered audio file ${asset.id}.`);
      }
    } catch (error) {
      setStatus(`Preview unavailable for ${asset.id}: ${error.message || String(error)}`, 'warning');
    }
  }

  function assignSelection() {
    if (!state.selectedId) {
      setStatus('Select a registered audio asset before assigning.', 'warning');
      return;
    }
    captured.onAssign({ assetId: state.selectedId, sourceLabel: captured.sourceLabel, openedAt: captured.openedAt });
    close();
  }

  function openCreator() {
    stopPreview();
    root.hidden = true;
    synthModal = openSoundGeneratorModal({
      sourceLabel: `Sound Library > ${captured.sourceLabel}`,
      onBack: () => { synthModal?.close(); synthModal = null; root.hidden = false; refresh(state.selectedId); },
      onSaved: ({ assetId, assignAfterSave }) => {
        if (assignAfterSave) return;
        state.selectedId = assetId;
        synthModal?.close();
        synthModal = null;
        root.hidden = false;
        refresh(assetId);
      },
      onAssign: ({ assetId }) => {
        state.selectedId = assetId;
        captured.onAssign({ assetId, sourceLabel: captured.sourceLabel, openedAt: captured.openedAt });
        synthModal?.close();
        close();
      },
      onClose: () => { synthModal = null; root.hidden = false; refresh(state.selectedId); }
    });
  }

  function close() {
    stopPreview();
    synthModal?.close();
    root.remove();
    document.removeEventListener('keydown', onKeydown);
    options.onClose?.();
  }

  function onKeydown(event) {
    if (event.key === 'Escape' && !root.hidden) close();
  }

  root.addEventListener('click', (event) => {
    if (event.target === root) close();
    const action = event.target.closest('[data-library-act]')?.dataset.libraryAct;
    const previewId = event.target.closest('[data-library-preview]')?.dataset.libraryPreview;
    const selectId = event.target.closest('[data-library-select]')?.dataset.librarySelect;
    const cardId = event.target.closest('[data-asset-id]')?.dataset.assetId;
    if (previewId) previewAsset(previewId);
    else if (selectId) { state.selectedId = selectId; renderList(); setStatus(`Selected ${selectId}.`); }
    else if (cardId && !action) { state.selectedId = cardId; renderList(); }
    if (action === 'close') close();
    if (action === 'refresh') refresh(state.selectedId);
    if (action === 'create') openCreator();
    if (action === 'stop') { stopPreview(); setStatus('Preview stopped.'); }
    if (action === 'assign') assignSelection();
  });
  root.addEventListener('input', (event) => {
    if (event.target.matches('[data-library-search], [data-library-filter]')) renderList();
  });
  root.addEventListener('change', (event) => {
    if (event.target.matches('[data-library-filter]')) renderList();
  });
  document.addEventListener('keydown', onKeydown);
  refresh(captured.currentAssetId);

  return { close, refresh, getSelectedAssetId: () => state.selectedId, getCapturedSourceLabel: () => captured.sourceLabel };
}

window.ArtifexSoundLibrary = Object.freeze({
  openModal: openSoundLibraryModal,
  loadRegisteredAudioAssets
});
