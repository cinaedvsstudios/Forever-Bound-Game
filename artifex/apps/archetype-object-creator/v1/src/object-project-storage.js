import '../../../../shared/project-folder/project-folder-client.js?v=0.1.1';
import { AUTHORING_STATUS, editorState, loadArchetype, objectExportTarget, onStateChange, updateArchetype } from './editor-state.js';
import { saveCurrentLocal } from './editor-io.js';
import { validateRegisteredContentRecord } from '../../../../shared/registered-content/registered-content-reader.js';

const OBJECT_INDEX_PATH = 'archetypes/object-index.json';
const OBJECT_INDEX_SCHEMA = 'artifex.archetypes.objects.index.v1';
const ASSET_INDEX_PATH = 'assets/asset-index.json';
const ASSET_INDEX_SCHEMA = 'artifex.assets.index.v1';
const VERSION = '1.36';
const PRIMARY_GAMEPLAY_REQUIREMENT = 'asset:gameplay_sprite';
const PRIMARY_PORTRAIT_REQUIREMENT = 'asset:dialogue_portrait';
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

export async function saveCurrentObjectToProject({ allowConnect = true, ready = false } = {}) {
  if (projectSaveRunning) return false;
  projectSaveRunning = true;
  try {
    saveCurrentLocal();
    const client = await obtainWritableProjectFolder(allowConnect);
    if (!client) {
      toast('Saved as a browser recovery draft only. Connect a project folder to write in-progress project files.', 'warn');
      return false;
    }
    if (ready) {
      const result = await buildReadyProjectArchetype(client);
      const prepared = await prepareObjectAndIndex(client, result.value, result.authoringStatus);
      for (const write of result.mediaWrites) await writeBytes(client, write.path, write.bytes);
      await client.writeJson(ASSET_INDEX_PATH, result.assetIndex);
      await writePreparedObjectAndIndex(client, result.value, prepared);
      updateArchetype({ authoringStatus: result.authoringStatus, visual: result.value.visual, productionAssets: result.value.productionAssets });
      renderProjectFolderStatus();
      toast(result.message, 'success');
      return true;
    }
    const result = await buildInProgressProjectArchetype(client);
    await writeObjectAndIndex(client, result.value, result.authoringStatus);
    updateArchetype({ authoringStatus: result.authoringStatus, productionAssets: mergeStagingIntoLiveProductionAssets(editorState.archetype.productionAssets, result.value.productionAssets) });
    renderProjectFolderStatus();
    toast(result.message, 'warn');
    return true;
  } catch (error) {
    toast(`${ready ? 'Object finalisation' : 'Project save'} failed: ${error.message || String(error)}`, 'error');
    renderProjectFolderStatus();
    return false;
  } finally {
    projectSaveRunning = false;
    suppressDraftMark = false;
  }
}

export async function markCurrentObjectReady(options = {}) {
  return saveCurrentObjectToProject({ ...options, ready: true });
}

async function buildInProgressProjectArchetype(client) {
  const value = clone(editorState.archetype);
  value.authoringStatus = AUTHORING_STATUS.IN_PROGRESS;
  value.productionAssets = normalizeProductionAssetsForWrite(value.productionAssets);
  const staged = await stageUploadedFrames(client, value);
  stripBrowserOnlyFields(value, { keepStaging: true });
  return {
    value,
    authoringStatus: AUTHORING_STATUS.IN_PROGRESS,
    message: staged
      ? `Saved in-progress object to the project folder and staged ${staged} uploaded frame${staged === 1 ? '' : 's'} under intake/objects/. Your open previews remain available. Finish / Mark Object Ready is still required.`
      : 'Saved in-progress object to the connected project folder. Finish / Mark Object Ready is still required.'
  };
}

async function buildReadyProjectArchetype(client) {
  const value = clone(editorState.archetype);
  value.productionAssets = normalizeProductionAssetsForWrite(value.productionAssets);
  const assetIndex = clone(await readAssetIndex(client));
  const promotion = await planFramesForFinalAssets(client, value, assetIndex);
  mapPrimaryAssetReferences(value);
  stripBrowserOnlyFields(value, { keepStaging: false });
  validateReadyObject(value, assetIndex);
  value.authoringStatus = AUTHORING_STATUS.READY;
  return {
    value,
    assetIndex,
    mediaWrites: promotion.mediaWrites,
    authoringStatus: AUTHORING_STATUS.READY,
    message: promotion.promoted
      ? `Object marked ready. Promoted ${promotion.promoted} frame asset${promotion.promoted === 1 ? '' : 's'} and updated the project asset index.`
      : 'Object marked ready using existing registered asset IDs.'
  };
}

async function prepareObjectAndIndex(client, item, authoringStatus) {
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
    authoringStatus,
    updatedAt: new Date().toISOString()
  };
  const validation = validateRegisteredContentRecord('archetype-objects', record);
  if (!validation.valid) throw new Error(validation.errors.join(' '));
  if (existingIndex >= 0) index.objects[existingIndex] = record;
  else index.objects.push(record);
  return { index, objectPath };
}

async function writeObjectAndIndex(client, item, authoringStatus) {
  return writePreparedObjectAndIndex(client, item, await prepareObjectAndIndex(client, item, authoringStatus));
}

async function writePreparedObjectAndIndex(client, item, prepared) {
  suppressDraftMark = true;
  await client.writeJson(prepared.objectPath, item);
  await client.writeJson(OBJECT_INDEX_PATH, prepared.index);
}

async function stageUploadedFrames(client, item) {
  let staged = 0;
  for (const [requirementId, requirement] of Object.entries(item.productionAssets?.requirements || {})) {
    if (!Array.isArray(requirement.frames)) continue;
    const action = actionIdFromRequirement(requirementId);
    for (let index = 0; index < requirement.frames.length; index += 1) {
      const frame = requirement.frames[index];
      if (!frame || isRegisteredAssetId(frame.assetId)) continue;
      if (!frame.dataUrl && frame.staging?.path) continue;
      if (!frame.dataUrl) continue;
      const path = stagingFramePath(item.id, action, frame, index);
      await writeBytes(client, path, dataUrlToBytes(frame.dataUrl));
      frame.assetId = '';
      frame.staging = {
        path,
        originalName: frame.name || `frame_${index + 1}`,
        mimeType: mimeTypeFromDataUrl(frame.dataUrl) || mimeTypeFromName(frame.name),
        stagedAt: new Date().toISOString()
      };
      delete frame.previewOnly;
      delete frame.draftSourceName;
      staged += 1;
    }
  }
  return staged;
}

function mergeStagingIntoLiveProductionAssets(liveProductionAssets, savedProductionAssets) {
  const live = normalizeProductionAssetsForWrite(liveProductionAssets);
  for (const [requirementId, savedRequirement] of Object.entries(savedProductionAssets?.requirements || {})) {
    const liveRequirement = live.requirements?.[requirementId];
    if (!liveRequirement || !Array.isArray(liveRequirement.frames) || !Array.isArray(savedRequirement.frames)) continue;
    savedRequirement.frames.forEach((savedFrame, index) => {
      const liveFrame = liveRequirement.frames[index];
      if (!liveFrame || !savedFrame) return;
      if (savedFrame.staging?.path) liveFrame.staging = clone(savedFrame.staging);
      if (isRegisteredAssetId(savedFrame.assetId)) liveFrame.assetId = savedFrame.assetId;
      delete liveFrame.previewOnly;
      delete liveFrame.draftSourceName;
    });
  }
  return live;
}

async function planFramesForFinalAssets(client, item, assetIndex) {
  const mediaWrites = [];
  const plannedPaths = new Set();
  let promoted = 0;
  for (const [requirementId, requirement] of Object.entries(item.productionAssets?.requirements || {})) {
    if (!Array.isArray(requirement.frames)) continue;
    validatePrimaryRequirementFrameCount(requirementId, requirement.frames);
    const action = actionIdFromRequirement(requirementId);
    for (let index = 0; index < requirement.frames.length; index += 1) {
      const frame = requirement.frames[index];
      if (!frame) continue;
      if (isRegisteredAssetId(frame.assetId)) {
        assertAssetRegistered(assetIndex, frame.assetId);
        continue;
      }
      const bytes = await bytesForFrame(client, frame);
      if (!bytes?.length) throw new Error(`Frame ${index + 1} for ${action} has no staged/uploaded media to promote.`);
      const finalPath = finalFramePath(item, requirementId, frame, index);
      if (plannedPaths.has(finalPath)) throw new Error(`Finalisation would overwrite more than one frame at ${finalPath}.`);
      plannedPaths.add(finalPath);
      const assetId = frameAssetId(item.id, action, index, frame.name || frame.staging?.originalName);
      upsertAssetRecord(assetIndex, {
        id: assetId,
        name: `${item.name || item.id} ${humanize(action)} Frame ${index + 1}`,
        type: 'image',
        assetKind: 'object-frame',
        file: finalPath,
        status: 'ready',
        tags: ['object-archetype', item.id, action].filter(Boolean),
        source: { createdBy: 'archetype-object-creator', originalName: frame.name || frame.staging?.originalName || '' },
        updatedAt: new Date().toISOString()
      });
      mediaWrites.push({ path: finalPath, bytes });
      frame.assetId = assetId;
      frame.finalPath = finalPath;
      delete frame.staging;
      delete frame.dataUrl;
      delete frame.previewOnly;
      delete frame.draftSourceName;
      promoted += 1;
    }
  }
  return { mediaWrites, promoted };
}

function validatePrimaryRequirementFrameCount(requirementId, frames) {
  if ((requirementId === PRIMARY_GAMEPLAY_REQUIREMENT || requirementId === PRIMARY_PORTRAIT_REQUIREMENT) && frames.filter(Boolean).length > 1) {
    const label = requirementId === PRIMARY_GAMEPLAY_REQUIREMENT ? 'Gameplay Sprite Asset' : 'Dialogue Portrait Asset';
    throw new Error(`${label} accepts one primary image or sprite sheet only. Use action tasks for multiple animation frames.`);
  }
}

function mapPrimaryAssetReferences(item) {
  const requirements = item.productionAssets?.requirements || {};
  assignPrimaryAssetReference(item.visual, 'spriteAssetId', requirements[PRIMARY_GAMEPLAY_REQUIREMENT]);
  assignPrimaryAssetReference(item.visual, 'portraitAssetId', requirements[PRIMARY_PORTRAIT_REQUIREMENT]);
}

function assignPrimaryAssetReference(visual, field, requirement) {
  if (!requirement) return;
  const existing = String(requirement.spriteSheetAssetId || '').trim();
  const frameId = Array.isArray(requirement.frames) ? requirement.frames.map((frame) => String(frame?.assetId || '').trim()).find(isRegisteredAssetId) : '';
  const selected = isRegisteredAssetId(existing) ? existing : frameId;
  if (selected) {
    requirement.spriteSheetAssetId = selected;
    visual[field] = selected;
  }
}

function validateReadyObject(item, assetIndex) {
  const problems = [];
  if (!item.id?.startsWith('archobj_')) problems.push('Object ID must start with archobj_.');
  if (!item.name) problems.push('Object name is required.');
  if (!isRegisteredAssetId(item.visual?.spriteAssetId)) problems.push('Gameplay Sprite Asset ID must be a registered asset_ ID before marking ready.');
  if (item.visual?.portraitAssetId && !isRegisteredAssetId(item.visual.portraitAssetId)) problems.push('Dialogue Portrait Asset ID must be a registered asset_ ID or blank.');
  const requirements = item.productionAssets?.requirements || {};
  Object.entries(requirements).forEach(([requirementId, requirement]) => {
    const mode = requirement?.mode || 'metadata';
    const frames = Array.isArray(requirement?.frames) ? requirement.frames : [];
    if (mode !== 'metadata' && !frames.length && !isRegisteredAssetId(requirement?.spriteSheetAssetId)) problems.push(`${requirementId} has no final frames or registered primary asset.`);
    frames.forEach((frame, index) => {
      if (!isRegisteredAssetId(frame?.assetId)) problems.push(`${requirementId} frame ${index + 1} has no final registered asset ID.`);
      else assertAssetRegistered(assetIndex, frame.assetId, problems);
      if (frame?.dataUrl || frame?.previewOnly || frame?.draftSourceName || frame?.staging?.path) problems.push(`${requirementId} frame ${index + 1} still depends on browser preview or intake staging data.`);
    });
    if (requirement?.spriteSheetAssetId && !isRegisteredAssetId(requirement.spriteSheetAssetId)) problems.push(`${requirementId} primary asset is not a registered asset_ ID.`);
    if (requirement?.soundAssetId) String(requirement.soundAssetId).split(/\n|,/).map((asset) => asset.trim()).filter(Boolean).forEach((assetId) => assertAssetRegistered(assetIndex, assetId, problems));
    (requirement?.soundEvents || []).forEach((event, index) => {
      if (event?.assetId) assertAssetRegistered(assetIndex, event.assetId, problems);
      else if (event?.frame || event?.trigger) problems.push(`${requirementId} sound event ${index + 1} has no registered asset ID.`);
    });
  });
  assertAssetRegistered(assetIndex, item.visual?.spriteAssetId, problems);
  if (item.visual?.portraitAssetId) assertAssetRegistered(assetIndex, item.visual.portraitAssetId, problems);
  if (problems.length) throw new Error(`Cannot mark object ready: ${problems.join(' ')}`);
}

function normalizeProductionAssetsForWrite(productionAssets = {}) {
  const output = clone(productionAssets || { version: VERSION, requirements: {}, requirementOrder: [] });
  output.version = VERSION;
  output.requirements = output.requirements && typeof output.requirements === 'object' ? output.requirements : {};
  Object.values(output.requirements).forEach((requirement) => {
    requirement.frameCorrections = normalizeFrameCorrections(requirement);
    delete requirement.correction;
  });
  output.requirementOrder = Array.isArray(output.requirementOrder) ? output.requirementOrder : [];
  return output;
}

function normalizeFrameCorrections(requirement = {}) {
  const output = {};
  Object.entries(requirement.frameCorrections || {}).forEach(([index, value]) => { output[String(Math.max(0, Number(index) || 0))] = normalizeCorrection(value); });
  if (!Object.keys(output).length && requirement.correction) {
    const count = Math.max(1, requirement.frames?.length || 0);
    for (let index = 0; index < count; index += 1) output[String(index)] = normalizeCorrection(requirement.correction);
  }
  return output;
}

function stripBrowserOnlyFields(item, { keepStaging }) {
  Object.values(item.productionAssets?.requirements || {}).forEach((requirement) => {
    delete requirement.correction;
    (requirement.frames || []).forEach((frame) => {
      delete frame.dataUrl;
      delete frame.previewOnly;
      if (keepStaging && !frame.staging?.path && !frame.assetId) frame.draftSourceName = frame.draftSourceName || frame.name || '';
      else delete frame.draftSourceName;
      if (!keepStaging) delete frame.staging;
    });
  });
}

function upsertAssetRecord(index, record) {
  const validation = validateRegisteredContentRecord('assets', record);
  if (!validation.valid) throw new Error(validation.errors.join(' '));
  const existingIndex = index.assets.findIndex((asset) => asset?.id === record.id);
  if (existingIndex >= 0) index.assets[existingIndex] = { ...index.assets[existingIndex], ...record };
  else index.assets.push(record);
}

function assertAssetRegistered(index, assetId, problems = null) {
  if (!isRegisteredAssetId(assetId)) {
    if (problems) problems.push(`${assetId || 'Blank asset'} is not a registered asset ID.`);
    else throw new Error(`${assetId || 'Blank asset'} is not a registered asset ID.`);
    return false;
  }
  if (!index.assets.some((asset) => asset?.id === assetId)) {
    const message = `${assetId} is not present in ${ASSET_INDEX_PATH}.`;
    if (problems) problems.push(message);
    else throw new Error(message);
    return false;
  }
  return true;
}

async function bytesForFrame(client, frame) {
  if (frame.dataUrl) return dataUrlToBytes(frame.dataUrl);
  if (frame.staging?.path) {
    if (typeof client.readBytes === 'function') return client.readBytes(frame.staging.path);
    throw new Error('Project-folder client cannot read staged frame bytes for finalisation.');
  }
  return new Uint8Array();
}

async function writeBytes(client, path, bytes) {
  if (typeof client.writeBytes === 'function') return client.writeBytes(path, bytes);
  if (typeof client.writeBlob === 'function') return client.writeBlob(path, new Blob([bytes]));
  throw new Error('Project-folder client cannot write binary frame files.');
}

function readObjectIndex(client) {
  return client.readJson(OBJECT_INDEX_PATH).then((index) => {
    if (!index || index.schemaVersion !== OBJECT_INDEX_SCHEMA || !Array.isArray(index.objects)) throw new Error(`Expected ${OBJECT_INDEX_PATH} with schema ${OBJECT_INDEX_SCHEMA} and an objects array.`);
    return index;
  }, (error) => {
    if (error?.name === 'NotFoundError') throw new Error(`The project is missing ${OBJECT_INDEX_PATH}. Create the starter structure in Creation Guide first.`);
    throw error;
  });
}

function readAssetIndex(client) {
  return client.readJson(ASSET_INDEX_PATH).then((index) => {
    if (!index || index.schemaVersion !== ASSET_INDEX_SCHEMA || !Array.isArray(index.assets)) throw new Error(`Expected ${ASSET_INDEX_PATH} with schema ${ASSET_INDEX_SCHEMA} and an assets array.`);
    return index;
  });
}

function bindProjectFileActions() {
  document.getElementById('connect-project-folder-button')?.addEventListener('click', async () => {
    try { await connectOrReauthoriseFolder(); renderProjectFolderStatus(); }
    catch (error) { toast(error.message || 'Could not connect the project folder.', 'error'); }
  });
  document.getElementById('save-project-button')?.addEventListener('click', async () => { await saveCurrentObjectToProject({ allowConnect: true }); });
  document.getElementById('open-project-object-button')?.addEventListener('click', async () => { await openProjectObjectsDialog(); });
}

async function openProjectObjectsDialog() {
  try {
    const client = await obtainWritableProjectFolder(true);
    if (!client) return;
    const index = await readObjectIndex(client);
    const dialog = document.getElementById('project-object-dialog');
    const output = document.getElementById('project-object-files-output');
    if (!dialog || !output) return;
    output.innerHTML = '';
    const records = [...index.objects].sort((left, right) => String(left.name || left.id).localeCompare(String(right.name || right.id)));
    if (!records.length) output.innerHTML = '<p class="hint">No project object archetypes found.</p>';
    records.forEach((record) => {
      const card = document.createElement('article');
      card.className = 'template-card';
      const status = record.authoringStatus === AUTHORING_STATUS.READY ? 'Ready' : 'In Progress';
      card.innerHTML = `<div class="template-card-body"><h4>${escapeHtml(record.name || record.id || 'Unnamed Object')}</h4><p>${escapeHtml(record.id || '')} · ${status}</p></div>`;
      const load = document.createElement('button');
      load.type = 'button';
      load.textContent = 'Open';
      load.addEventListener('click', async () => {
        try {
          const item = await client.readJson(record.file || objectExportTarget(record.id));
          await hydrateStagedFramePreviews(client, item);
          loadArchetype(item);
          dialog.close();
          toast(`Opened project object: ${item.name || item.id}.`, 'success');
        } catch (error) { toast(`Could not open project object: ${error.message || String(error)}`, 'error'); }
      });
      card.appendChild(load);
      output.appendChild(card);
    });
    dialog.showModal();
  } catch (error) { toast(`Could not list project objects: ${error.message || String(error)}`, 'error'); }
}

async function hydrateStagedFramePreviews(client, item) {
  for (const requirement of Object.values(item.productionAssets?.requirements || {})) {
    for (const frame of requirement?.frames || []) {
      if (frame?.dataUrl || !frame?.staging?.path) continue;
      const bytes = await client.readBytes(frame.staging.path);
      frame.dataUrl = await bytesToDataUrl(bytes, frame.staging.mimeType || mimeTypeFromName(frame.staging.originalName || frame.name));
    }
  }
}

function bytesToDataUrl(bytes, mimeType) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(reader.error || new Error('Could not restore staged image preview.'));
    reader.readAsDataURL(new Blob([bytes], { type: mimeType || 'image/png' }));
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

function injectProjectStorageStyles() {
  if (document.getElementById('object-project-storage-styles')) return;
  const style = document.createElement('style');
  style.id = 'object-project-storage-styles';
  style.textContent = `.object-project-folder-status{margin:6px 10px 7px;padding:7px 9px;border:1px solid rgba(226,204,167,.18);border-radius:9px;color:rgba(255,240,206,.7);font-size:10px;line-height:1.35}.object-project-folder-status.is-connected{color:#83d799;border-color:rgba(72,192,113,.38);background:rgba(72,192,113,.11)}.object-project-folder-status.is-warning{color:#e1c073;border-color:rgba(225,192,115,.34);background:rgba(225,192,115,.1)}`;
  document.head.appendChild(style);
}

function renderProjectFolderStatus() {
  const statusNode = document.getElementById('object-project-folder-status');
  if (!statusNode) return;
  const state = window.ArtifexProjectFolder?.getState?.() || { saveStatus: 'No Folder Connected', folderStatus: 'no-folder-connected' };
  const lifecycle = editorState.archetype?.authoringStatus === AUTHORING_STATUS.READY ? 'Ready' : 'In Progress';
  statusNode.textContent = state.folderStatus === 'connected' && state.folderName ? `${state.saveStatus} · ${lifecycle} · ${state.folderName}` : state.saveStatus || 'No Folder Connected';
  statusNode.className = `object-project-folder-status ${state.folderStatus === 'connected' ? 'is-connected' : state.folderStatus === 'permission-required' ? 'is-warning' : ''}`;
}

function stagingFramePath(objectId, actionId, frame, index) { return `intake/objects/${safeId(objectId)}/${safeId(actionId)}/${stableFrameFilename(frame, index)}`; }
function finalFramePath(item, requirementId, frame, index) {
  const action = actionIdFromRequirement(requirementId);
  const ext = extensionFromName(frame.name || frame.staging?.originalName) || extensionFromMime(frame.staging?.mimeType) || extensionFromDataUrl(frame.dataUrl) || 'png';
  const padded = String(index + 1).padStart(3, '0');
  const folder = objectAssetFolder(item);
  if (requirementId === PRIMARY_GAMEPLAY_REQUIREMENT) return `${folder}/sprites/${safeId(item.id)}_gameplay_sheet.${ext}`;
  if (requirementId === PRIMARY_PORTRAIT_REQUIREMENT) return `${folder}/portraits/${safeId(item.id)}_portrait.${ext}`;
  const mode = requirementId.startsWith('portrait:') ? 'portraits' : 'animations';
  return `${folder}/${mode}/${safeId(action)}/${padded}_${safeId(removeExtension(frame.name || frame.staging?.originalName || action))}.${ext}`;
}
function stableFrameFilename(frame, index) {
  const ext = extensionFromName(frame.name) || extensionFromDataUrl(frame.dataUrl) || extensionFromMime(frame.staging?.mimeType) || 'png';
  return `${String(index + 1).padStart(3, '0')}_${safeId(removeExtension(frame.name || `frame_${index + 1}`))}.${ext}`;
}
function frameAssetId(objectId, actionId, index, name) { return `asset_object_${safeId(objectId).replace(/^archobj_/, '')}_${safeId(actionId)}_${String(index + 1).padStart(3, '0')}_${safeId(removeExtension(name || 'frame'))}`.slice(0, 96); }
function objectAssetFolder(item) {
  const id = safeId(item.id || item.name || 'object_archetype');
  const category = String(item.category || '').toLowerCase();
  const role = String(item.role || '').toLowerCase();
  if (category.includes('npc') || category.includes('character') || role.startsWith('person_')) return `assets/characters/${id}`;
  if (category.includes('enemy') || category.includes('foe')) return `assets/foes/${id}`;
  if (category.includes('creature')) return `assets/creatures/${id}`;
  if (role.includes('boss') || category.includes('boss')) return `assets/bosses/${id}`;
  return `assets/objects/${id}`;
}
function isRegisteredAssetId(value) { return String(value || '').startsWith('asset_'); }
function actionIdFromRequirement(requirementId) { return String(requirementId || '').split(':')[1] || String(requirementId || 'asset'); }
function clone(value) { return JSON.parse(JSON.stringify(value || {})); }
function normalizeCorrection(value = {}) { return { scale: Number(value.scale || 0), x: Number(value.x || 0), y: Number(value.y || 0), brightness: Number(value.brightness || 0) }; }
function dataUrlToBytes(dataUrl) {
  const [, meta = '', data = ''] = String(dataUrl).match(/^data:([^,]*),(.*)$/) || [];
  if (!data) return new Uint8Array();
  if (meta.includes(';base64')) {
    const raw = atob(data); const bytes = new Uint8Array(raw.length);
    for (let index = 0; index < raw.length; index += 1) bytes[index] = raw.charCodeAt(index);
    return bytes;
  }
  return new TextEncoder().encode(decodeURIComponent(data));
}
function mimeTypeFromDataUrl(dataUrl) { return String(dataUrl || '').match(/^data:([^;,]+)/)?.[1] || ''; }
function mimeTypeFromName(name = '') { const ext = extensionFromName(name); return ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'webp' ? 'image/webp' : ext === 'gif' ? 'image/gif' : 'image/png'; }
function extensionFromDataUrl(dataUrl) { return extensionFromMime(mimeTypeFromDataUrl(dataUrl)); }
function extensionFromMime(mime = '') { if (mime.includes('jpeg')) return 'jpg'; if (mime.includes('webp')) return 'webp'; if (mime.includes('gif')) return 'gif'; if (mime.includes('png')) return 'png'; return ''; }
function extensionFromName(name = '') { return String(name).split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || ''; }
function removeExtension(name = '') { return String(name).replace(/\.[^.]+$/, ''); }
function safeId(value) { return String(value || 'object').trim().toLowerCase().replace(/[^a-z0-9_\-]+/g, '_').replace(/^_+|_+$/g, '') || 'object'; }
function humanize(value) { return String(value || '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()); }
function escapeHtml(value) { return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char])); }
function toast(message, type = 'success') { window.dispatchEvent(new CustomEvent('artifex:toast', { detail: { message, type } })); }
