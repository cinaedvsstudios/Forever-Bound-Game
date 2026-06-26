import { safeSlug, validateProceduralSynthAsset } from './procedural-synth-schema.js';
import { readAssetIndex, upsertAssetRecord, writeAssetIndex } from '../asset-library/asset-library-service.js';

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
    kind: 'procedural-synth',
    assetKind: 'procedural-synth',
    file: recipeRecord.resourcePath,
    playbackEngine: 'web-audio',
    category: recipeRecord.category,
    status: 'ready',
    tags,
    source: {
      createdBy: recipeRecord.source?.createdBy || 'procedural-sound-generator',
      creationMode: recipeRecord.source?.creationMode || 'start-new',
      generatedRecipe: true
    },
    updatedAt: recipeRecord.updatedAt || new Date().toISOString()
  };
}

export async function saveProceduralSynthToLibrary(recipeRecord) {
  const errors = validateProceduralSynthAsset(recipeRecord);
  if (errors.length) throw new Error(errors.join(' '));
  const client = await obtainProjectClient();
  const index = await readAssetIndex(client, { createIfMissing: true });
  const assetRecord = makeAssetIndexRecord(recipeRecord);
  const nextIndex = upsertAssetRecord(index, assetRecord);
  await client.writeJson(recipeRecord.resourcePath, recipeRecord);
  await writeAssetIndex(client, nextIndex);
  return { assetId: assetRecord.id, record: assetRecord, recipe: recipeRecord };
}
