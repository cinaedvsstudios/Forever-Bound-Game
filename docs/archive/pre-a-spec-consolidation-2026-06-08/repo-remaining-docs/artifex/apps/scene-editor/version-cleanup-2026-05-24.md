# Scene Editor Version Cleanup — 2026-05-24

## Current issue

The visible UI is stable again, but the editor still has a version-label mismatch.

The core editor file still reports an older core version string, while the v15 helper reports `v0.15` in toasts such as layout/helper loaded, layer locked, layer unlocked, and layers recalculated.

This makes it look like the editor has not advanced, even though the current working state is the consolidation pass after the local-save, file-pill, transform-slider, aspect-ratio, and card-layout fixes.

## Target version label

Use one current label for the active consolidation pass:

`v0.28-consolidation`

## Files involved

- `scene-editor-v2.js` currently owns the core editor version, top bar status, local backup, file/status pill, base card render, and scene stage render.
- `scene-editor-v15-helper.js` still owns the split selected-card layout, Transform / Visual / Animation / Audio cards, Object Layers lock/recalculate behaviour, and asset picker polish.

## Required safe change

Do not add another helper.

Patch the existing files only:

1. Update the core `VERSION` in `scene-editor-v2.js` to `v0.28-consolidation`.
2. Remove the hidden HDD markup from the core `filePill()` output so CSS no longer has to hide it.
3. Update the `VERSION` in `scene-editor-v15-helper.js` to `v0.28-consolidation` or make it read from `window.ArtifexSceneEditorCore` once the core exposes the version.
4. Keep the current 3-row file/status pill layout exactly as-is:
   - Project
   - File
   - Local
5. Do not change card layout behaviour in the same patch.

## Reason this is separate

A direct full-file write to `scene-editor-v2.js` was blocked once by the GitHub tool safety check, so this needs to be done as a small, careful core-file patch rather than bundled with layout changes.

## Status

Pending. The UI is stable enough to continue, but this cleanup should happen before the next large helper integration pass.
