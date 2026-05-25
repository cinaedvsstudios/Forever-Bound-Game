# Effect Editor Clean Rebuild Tracker

Branch: `fb-effect-split1`
Base branch: `fb-effect-base`
Base commit: `fed68ad0526bca288f6ba41f1bcc0413de5355d0`

This branch starts from the last known working Effect Editor render baseline.

## Test URL

`https://raw.githack.com/cinaedvsstudios/Forever-Bound-Game/fb-effect-split1/artifex/apps/effect-editor/index.html`

## Module smoke test URL

`https://raw.githack.com/cinaedvsstudios/Forever-Bound-Game/fb-effect-split1/artifex/apps/effect-editor/module-smoke-test.html`

## Current status

The confirmed working base is preserved on `fb-effect-base`.

`fb-effect-split1` is the first modularisation branch. Stages 1 through 5 add extracted module scaffolds while leaving the live `index.html` render path untouched.

Module smoke test passed in browser:

- `editor-bootstrap.js` imports successfully.
- Module groups visible: Library, State, Runtime, Renderer, UI, IO.
- Base effect categories visible: 8.
- Composite effect presets visible: 3.
- `window.ArtifexEffectEditorModules` is available on the smoke-test page.

The live editor still works after scaffold extraction.

## First test

1. Open the URL.
2. Confirm the grid appears.
3. Open Insert.
4. Add a base effect.
5. Confirm particles render.
6. Resize the side panel.
7. Resize the bottom panel.
8. Confirm particles and grid labels stay visible.

## Rebuild method

1. Keep this baseline working.
2. Split the editor into smaller files without changing behaviour.
3. Test again after each split.
4. Reapply newer UI features only after the split passes.

## Target files

- `index.html`
- `src/editor-state.js`
- `src/editor-renderer.js`
- `src/fx-runtime.js`
- `src/editor-ui.js`
- `src/editor-io.js`
- `src/editor-bootstrap.js`
- `src/editor-debug.js`
- `src/editor-library.js`
- `src/presets/base-effects.js`
- `src/presets/composite-effects.js`

## Stage 1 completed

Added:

- `src/editor-library.js`

Already present from earlier staged extraction:

- `src/presets/base-effects.js`
- `src/presets/composite-effects.js`

## Stage 2 completed

Added:

- `src/editor-state.js`
- `src/fx-runtime.js`

## Stage 3 completed

Added:

- `src/editor-ui.js`
- `src/editor-io.js`

## Stage 4 completed

Added:

- `src/editor-renderer.js`

## Stage 5 completed

Added:

- `src/editor-bootstrap.js`
- `module-smoke-test.html`

## Debug scaffold completed

Added:

- `src/editor-debug.js`

Planned Help menu debug console behaviour:

- Adds a `Debug Console` entry to the Help menu once wired.
- Captures browser runtime errors and unhandled promise rejections.
- Mirrors `console.error` and `console.warn` into an in-page report.
- Shows module import state, registry counts, canvas size, dropdown count, layer count, devicePixelRatio, and Artifex localStorage keys.
- Includes a `Copy Report` button so the full diagnostic output can be pasted into a chat or issue.

Important: the debug module is not wired into `index.html` yet. The live page remains unchanged until the next tiny wiring pass.

## Next step

Do the first tiny live wiring pass: add module scripts to `index.html` that import `src/editor-bootstrap.js` and `src/editor-debug.js`, exposing `window.ArtifexEffectEditorModules` and adding the Help menu `Debug Console` entry, without replacing live runtime logic.

## Reapply later

Use the existing comparison docs to restore the newer UI features in order: branding, menus, archetype library, thumbnails, local files, quick edits, brush controls, noise, emitter targeting, resolution presets, then performance.

Do not touch render math or resolution logic until the renderer is isolated.
