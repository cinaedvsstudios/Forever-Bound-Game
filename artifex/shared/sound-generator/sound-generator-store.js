import { safeSlug, validateProceduralSynthAsset } from './procedural-synth-schema.js';

const ASSET_INDEX_PATH = 'assets/asset-index.json';
const ASSET_INDEX_SCHEMA = 'artifex.assets.index.v1';

export function proceduralSynthToJson(record) {
  return `${JSON.stringify(record, null, 2)}\n`;
}

export function downloadProceduralSynthRecipe(record) {
  const blob = new Blob([proceduralSynthToJson(record)], { type: 'application/json;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `synth_${safeSlug(record.name)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(link.href), 300);
}

export async function readImportedProceduralSynth(file) {
  if (!file) throw new Error('Choose a procedural synth JSON file first.');
  let value;
  try {
    value = JSON.parse(await file.text());
  } catch (_error) {
    throw new Error('The selected file is not valid JSON.');
  }
  const errors = validateProceduralSynthAsset(value);
  if (errors.length) throw new Error(errors.join(' '));
  return value;
}

async function obtainProjectClient() {
  const client = window.ArtifexProjectFolder;
  if (!client) throw new Error('Project-folder service is unavailable.');
  let state = client.getState();
  if (state.folderStatus === client.folderStatus.PERMISSION_REQUIRED) state = await client.reauthoriseProjectFolder();
  else if (state.folderStatus !== client.folderStatus.CONNECTED) state = await client.connectProjectFolder();
  if (state.folderStatus !== client.folderStatus.CONNECTED) throw new Error('Connect a writable project folder first.');
  return client;
}

function makeAssetIndexRecord(recipeRecord) {
  const tags = Array.from(new Set(['sound-effect', 'procedural', ...(recipeRecord.tags || [])]));
  return {
    id: recipeRecord.assetId,
    name: recipeRecord.name,
    type: 'sound-effect',
    assetKind: 'procedural-synth',
    file: recipeRecord.resourcePath,
    playbackEngine: 'web-audio',
    category: recipeRecord.category,
    status: 'ready',
    tags
  };
}

export async function saveProceduralSynthToLibrary(recipeRecord) {
  const errors = validateProceduralSynthAsset(recipeRecord);
  if (errors.length) throw new Error(errors.join(' '));
  const client = await obtainProjectClient();
  const index = await client.readJson(ASSET_INDEX_PATH);
  if (!index || index.schemaVersion !== ASSET_INDEX_SCHEMA || !Array.isArray(index.assets)) {
    throw new Error(`Expected ${ASSET_INDEX_PATH} with schema ${ASSET_INDEX_SCHEMA} and an assets array.`);
  }
  const assetRecord = makeAssetIndexRecord(recipeRecord);
  const existingIndex = index.assets.findIndex((item) => item?.id === assetRecord.id);
  if (existingIndex >= 0) index.assets[existingIndex] = assetRecord;
  else index.assets.push(assetRecord);
  await client.writeJson(recipeRecord.resourcePath, recipeRecord);
  await client.writeJson(ASSET_INDEX_PATH, index);
  return { assetId: assetRecord.id, record: assetRecord, recipe: recipeRecord };
}
