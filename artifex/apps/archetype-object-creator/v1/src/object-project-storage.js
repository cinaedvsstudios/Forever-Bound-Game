import '../../../../shared/project-folder/project-folder-client.js?v=0.1.0';
import { editorState, objectExportTarget, onStateChange } from './editor-state.js';
import { saveCurrentLocal } from './editor-io.js';
import { validateRegisteredContentRecord } from '../../../../shared/registered-content/registered-content-reader.js';

const OBJECT_INDEX_PATH = 'archetypes/object-index.json';
const OBJECT_INDEX_SCHEMA = 'artifex.archetypes.objects.index.v1';
let storageInitialised = false;
let projectSaveRunning = false;
let suppressDraftMark = false;

export function initObjectProjectStorage() {
  if (storageInitialised) return;
  storageInitialised = true;
  injectProjectStorageStyles();
  bindProjectFileActions();
  renderProjectFolderStatus();
  window.addEventListener('artifex:project-folder-state', renderProjectFolderStatus);
  onStateChange(() => {
    if (!suppressDraftMark) window.ArtifexProjectFolder?.markLocalDraftOnly?.();
    renderProjectFolderStatus();
  });
}

export async function saveCurrentObjectToProject({ allowConnect = true } = {}) {
  if (projectSaveRunning) return false;
  projectSaveRunning = true;
  try {
    saveCurrentLocal();
    const client = await obtainWritableProjectFolder(allowConnect);
    if (!client) {
      toast('Saved as a browser recovery draft only. Connect a project folder to write the real object file.', 'warn');
      return false;
    }
    const item = editorState.archetype;
    const { value: projectItem, removedPreviewCount } = projectSafeArchetype(item);
    const index = await readObjectIndex(client);
    const objectPath = objectExportTarget(item.id);
    const existingIndex = index.objects.findIndex((record) => record?.id === item.id);
    const previous = existingIndex >= 0 ? index.objects[existingIndex] : {};
    const record = {
      ...previous,
      id: item.id,
      name: item.name,
      type: item.category || item.role || 'object',
      category: item.category,
      role: item.role,
      file: objectPath,
      tags: Array.isArray(item.tags) ? [...item.tags] : [],
      updatedAt: new Date().toISOString()
    };
    const validation = validateRegisteredContentRecord('archetype-objects', record);
    if (!validation.valid) throw new Error(validation.errors.join(' '));
    if (existingIndex >= 0) index.objects[existingIndex] = record;
    else index.objects.push(record);
    suppressDraftMark = true;
    await client.writeJson(objectPath, projectItem);
    await client.writeJson(OBJECT_INDEX_PATH, index);
    suppressDraftMark = false;
    renderProjectFolderStatus();
    if (removedPreviewCount) {
      toast(`Saved ${item.name} to the project folder. ${removedPreviewCount} preview image draft${removedPreviewCount === 1 ? '' : 's'} remain in browser recovery/Backup ZIP until final Asset IDs are assigned.`, 'success');
    } else {
      toast(`Saved ${item.name} to the connected project folder.`, 'success');
    }
    return true;
  } catch (error) {
    suppressDraftMark = false;
    toast(`Project save failed: ${error.message || String(error)}`, 'error');
    renderProjectFolderStatus();
    return false;
  } finally {
    projectSaveRunning = false;
  }
}

function projectSafeArchetype(item) {
  const value = JSON.parse(JSON.stringify(item || {}));
  let removedPreviewCount = 0;
  const requirements = value?.productionAssets?.requirements || {};
  Object.values(requirements).forEach((requirement) => {
    if (!Array.isArray(requirement?.frames)) return;
    requirement.frames = requirement.frames.map((frame) => {
      if (!frame?.dataUrl) return frame;
      removedPreviewCount += 1;
      const { dataUrl: _previewOnlyDataUrl, assetId: _draftAssetId, ...safeFrame } = frame;
      return { ...safeFrame, assetId: '', draftSourceName: frame.name || _draftAssetId || '', previewOnly: true };
    });
  });
  return { value, removedPreviewCount };
}

function bindProjectFileActions() {
  document.getElementById('connect-project-folder-button')?.addEventListener('click', async () => {
    try {
      await connectOrReauthoriseFolder();
      renderProjectFolderStatus();
    } catch (error) {
      toast(error.message || 'Could not connect the project folder.', 'error');
    }
  });
  document.getElementById('save-project-button')?.addEventListener('click', async () => {
    await saveCurrentObjectToProject({ allowConnect: true });
  });
}

async function obtainWritableProjectFolder(allowConnect) {
  const client = window.ArtifexProjectFolder;
  if (!client) throw new Error('Shared project-folder service did not load.');
  let state = client.getState();
  if (state.folderStatus === 'connected') return client;
  if (!allowConnect) return null;
  state = await connectOrReauthoriseFolder();
  return state?.folderStatus === 'connected' ? client : null;
}

async function connectOrReauthoriseFolder() {
  const client = window.ArtifexProjectFolder;
  if (!client) throw new Error('Shared project-folder service did not load.');
  const state = client.getState();
  if (state.folderStatus === 'permission-required') return client.reauthoriseProjectFolder();
  if (state.folderStatus === 'connected') return state;
  return client.connectProjectFolder();
}

async function readObjectIndex(client) {
  let index;
  try {
    index = await client.readJson(OBJECT_INDEX_PATH);
  } catch (error) {
    if (error?.name === 'NotFoundError') {
      throw new Error('The project is missing archetypes/object-index.json. Create the starter structure in Creation Guide first.');
    }
    throw error;
  }
  if (!index || index.schemaVersion !== OBJECT_INDEX_SCHEMA || !Array.isArray(index.objects)) {
    throw new Error(`Expected ${OBJECT_INDEX_PATH} with schema ${OBJECT_INDEX_SCHEMA} and an objects array.`);
  }
  return index;
}

function injectProjectStorageStyles() {
  if (document.getElementById('object-project-storage-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-project-storage-styles';
  style.textContent = `
    .object-project-folder-status { margin: 6px 10px 7px; padding: 7px 9px; border: 1px solid rgba(226,204,167,.18); border-radius: 9px; color: rgba(255,240,206,.7); font-size: 10px; line-height: 1.35; }
    .object-project-folder-status.is-connected { color: #83d799; border-color: rgba(72,192,113,.38); background: rgba(72,192,113,.11); }
    .object-project-folder-status.is-warning { color: #e1c073; border-color: rgba(225,192,115,.34); background: rgba(225,192,115,.1); }
  `;
  document.head.appendChild(style);
}

function renderProjectFolderStatus() {
  const statusNode = document.getElementById('object-project-folder-status');
  if (!statusNode) return;
  const state = window.ArtifexProjectFolder?.getState?.() || { saveStatus: 'No Folder Connected', folderStatus: 'no-folder-connected' };
  statusNode.textContent = state.folderStatus === 'connected' && state.folderName
    ? `${state.saveStatus} · ${state.folderName}`
    : state.saveStatus || 'No Folder Connected';
  statusNode.className = `object-project-folder-status ${state.folderStatus === 'connected' ? 'is-connected' : state.folderStatus === 'permission-required' ? 'is-warning' : ''}`;
}

function toast(message, type = 'success') {
  window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } }));
}
