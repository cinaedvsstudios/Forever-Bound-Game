import { normalizeControls, controlsToRecipe } from './sound-generator-controls.js';

export const PROCEDURAL_SYNTH_SCHEMA_VERSION = 'artifex.audio.procedural-synth.v1';
export const PROCEDURAL_SYNTH_ENGINE = Object.freeze({ id: 'web-audio', version: '1.0.0' });

export function safeSlug(value) {
  return String(value || 'new-sound')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 52) || 'new_sound';
}

export function makeAudioAssetId(name) {
  return `asset_sfx_${safeSlug(name)}`;
}

export function makeRecipePath(name) {
  return `assets/audio/sfx/synth_${safeSlug(name)}.json`;
}

export function buildProceduralSynthAsset(rawControls, metadata = {}) {
  const controls = normalizeControls(rawControls);
  const now = new Date().toISOString();
  const createdAt = metadata.createdAt || now;
  return {
    schemaVersion: PROCEDURAL_SYNTH_SCHEMA_VERSION,
    assetId: metadata.assetId || makeAudioAssetId(controls.name),
    name: controls.name,
    category: safeSlug(controls.category).replace(/_/g, '-'),
    tags: controls.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
    assetKind: 'procedural-synth',
    playbackEngine: PROCEDURAL_SYNTH_ENGINE.id,
    resourcePath: makeRecipePath(controls.name),
    engine: { ...PROCEDURAL_SYNTH_ENGINE },
    source: {
      createdBy: 'procedural-sound-generator',
      creationMode: metadata.creationMode || 'start-new',
      presetId: metadata.presetId || null,
      assignedFrom: metadata.sourceLabel || null
    },
    editor: {
      controlsVersion: '1.0.0',
      controls
    },
    recipe: controlsToRecipe(controls),
    createdAt,
    updatedAt: now
  };
}

export function validateProceduralSynthAsset(value) {
  const errors = [];
  if (!value || typeof value !== 'object' || Array.isArray(value)) errors.push('The imported JSON must be an object.');
  if (value?.schemaVersion !== PROCEDURAL_SYNTH_SCHEMA_VERSION) errors.push(`Expected schemaVersion "${PROCEDURAL_SYNTH_SCHEMA_VERSION}".`);
  if (!String(value?.assetId || '').startsWith('asset_sfx_')) errors.push('The assetId must begin with "asset_sfx_".');
  if (value?.assetKind !== 'procedural-synth') errors.push('Only procedural-synth audio assets can be opened in this tool.');
  if (!value?.editor?.controls || typeof value.editor.controls !== 'object') errors.push('The JSON has no editable editor.controls data.');
  return errors;
}

export function controlsFromImportedAsset(value) {
  const errors = validateProceduralSynthAsset(value);
  if (errors.length) throw new Error(errors.join(' '));
  return normalizeControls({
    ...value.editor.controls,
    name: value.name || value.editor.controls.name,
    category: value.category || value.editor.controls.category,
    tags: Array.isArray(value.tags) ? value.tags.join(', ') : value.editor.controls.tags
  });
}
