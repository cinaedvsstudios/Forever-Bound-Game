# Effect Editor Clean Rebuild Tracker

Branch: `fb-effect-split1`
Base branch: `fb-effect-base`
Base commit: `fed68ad0526bca288f6ba41f1bcc0413de5355d0`

This branch starts from the last known working Effect Editor render baseline.

## Test URL

`https://raw.githack.com/cinaedvsstudios/Forever-Bound-Game/fb-effect-split1/artifex/apps/effect-editor/index.html`

## Current status

The confirmed working base is preserved on `fb-effect-base`.

`fb-effect-split1` is the first modularisation branch. Stages 1 and 2 add extracted module scaffolds while leaving the live `index.html` render path untouched.

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
- `src/editor-library.js`
- `src/editor-io.js`
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

These are safe scaffold modules. `index.html` is intentionally not wired to them yet, so the live page behaviour should remain identical to the confirmed working base.

## Next step

After confirming the `fb-effect-split1` URL still behaves exactly like `fb-effect-base`, wire only a tiny non-render module loader/check or a single registry read. Do not touch renderer, canvas, resize, grid, or particle math.

## Reapply later

Use the existing comparison docs to restore the newer UI features in order: branding, menus, archetype library, thumbnails, local files, quick edits, brush controls, noise, emitter targeting, resolution presets, then performance.

Do not touch render math or resolution logic until the renderer is isolated.
