/*
 * Artifex Effect Editor module bootstrap.
 *
 * Split stage 5 scaffold: imports the extracted modules and exposes them as one
 * grouped object for the later live index.html wiring pass.
 *
 * This file is not loaded by index.html yet. It gives us a single, stable module
 * entrypoint to wire when the live page is ready.
 */

import * as Library from './editor-library.js';
import * as State from './editor-state.js';
import * as Runtime from './fx-runtime.js';
import * as Renderer from './editor-renderer.js';
import * as UI from './editor-ui.js';
import * as IO from './editor-io.js';

export const ArtifexEffectEditorModules = Object.freeze({
    Library,
    State,
    Runtime,
    Renderer,
    UI,
    IO
});

export function installArtifexModules(target = window) {
    if (!target) return ArtifexEffectEditorModules;
    target.ArtifexEffectEditorModules = ArtifexEffectEditorModules;
    return ArtifexEffectEditorModules;
}

export default ArtifexEffectEditorModules;
