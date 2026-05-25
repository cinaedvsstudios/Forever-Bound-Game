/*
 * Artifex Effect Editor module entrypoint.
 * Step 1 target: expose extracted preset registries for the live editor while the monolith is being split.
 */

import { PRESETS_REGISTRY } from './presets/base-effects.js';
import { COMPOSITES_REGISTRY } from './presets/composite-effects.js';

window.PRESETS_REGISTRY = PRESETS_REGISTRY;
window.COMPOSITES_REGISTRY = COMPOSITES_REGISTRY;

window.ArtifexEffectEditorModules = {
  ...(window.ArtifexEffectEditorModules || {}),
  presets: {
    PRESETS_REGISTRY,
    COMPOSITES_REGISTRY
  }
};

console.info('Artifex Effect Editor Step 1 preset modules loaded.');
