# Scene Editor cleanup handoff — updated 2026-05-28

## Current app and repo state

App: Artifex Scene Editor

Repo path: `artifex/apps/scene-editor/`

Current loaded cache label in `index.html`: `v0.30-active-project`

Fresh test URL:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.30-active-project`

Latest confirmed user test: the Scene Editor still looks and behaves correctly after the transform controls, offscreen placement, and value slider cleanup batch. User tested the relevant controls after each rename before the old numbered files were deleted.

## Global rules that must still be followed

Before changing any Artifex app, inspect:

- `docs/artifex/18-color-and-display-rules.md`
- `docs/artifex/19-project-file-contracts.md`
- `artifex/shared/todo-guide/README.md`
- `artifex/shared/todo-guide/all-apps-todos.json`

Relevant global tasks already exist in `all-apps-todos.json`:

- reduce active patch layers
- split large app files into clear modules
- standardize visible version numbers and cache keys
- use the shared Module menu order
- keep `index.html` as a shell and avoid giant scripts

Shared Module menu order must be exactly:

1. Hub
2. Creation Guide
3. Project Manager
4. Scene Editor
5. Quest Builder
6. Puzzle Creator
7. Effect Editor
8. Archetype Object Creator

Do not add Sprite Wizard, Font Packer, utility tools, or other names to this core Module menu unless explicitly instructed later.

## Cleanup batch completed

The previous blocked cleanup item is now resolved. The bad placeholder file was removed, the real working modules were copied from user-uploaded source files where needed, and each replacement was tested before the old numbered file was deleted.

Permanent modules now loaded by `index.html`:

- `scene-editor-transform-controls.js`
- `scene-editor-offscreen-placement.js`
- `scene-editor-value-sliders.js`
- `scene-editor-value-sliders.css`

Old numbered files deleted after successful tests:

- `scene-editor-v15-guard.js`
- `scene-editor-v22-offscreen-placement.js`
- `scene-editor-v18-value-sliders.js`
- `scene-editor-v18-value-sliders.css`

The cleanup count for this batch is now 0.

## Current active files loaded by Scene Editor

`index.html` currently loads:

- `scene-editor.css`
- `context-menu.css`
- `scene-editor-panel-stage.css`
- `scene-editor-control-cards.css`
- `scene-editor-value-sliders.css`
- `scene-editor-ui-polish.css`
- `scene-editor-v2.js`
- `scene-editor-v11-helper.js`
- `scene-editor-transform-controls.js`
- `scene-editor-v15-helper.js`
- `scene-editor-value-sliders.js`
- `scene-editor-v20-card-controller.js`
- `scene-editor-v21-visual-adjustments.js`
- `scene-editor-offscreen-placement.js`
- `scene-editor-v23-aspect-controls.js`
- `scene-editor-v24-object-preview.js`
- `scene-editor-menu-controller.js`

## Known follow-up issue

`index.html` uses `v0.30-active-project` cache keys, but `scene-editor-v2.js` still declares:

`const VERSION = 'v0.29-title-cache-sync';`

This means the shell/cache label and the internal UI version label may still be out of sync. The next safe cleanup step should be a small version-sync pass, not another module rename.

Recommended next process:

1. Inspect `index.html` and `scene-editor-v2.js`.
2. Decide whether the official Scene Editor version should be `v0.30-active-project` or a new deliberate bump.
3. Update the `VERSION` constant and any visible fallback/status strings in `scene-editor-v2.js` to match the chosen official version.
4. Keep all cache keys in `index.html` matched to that same version.
5. Test the title, subtitle, status pill, restore toast, local backup flow, and fresh URL.

## Remaining consolidation targets after version sync

The next real consolidation pass should be smaller than the completed cleanup batch. Good candidates:

- Audit `scene-editor-v11-helper.js` to decide whether it is a real permanent asset/path helper or can be merged.
- Audit `scene-editor-v15-helper.js`, which still owns selected-card/Object Layers behaviour and remains a larger helper debt.
- Decide whether `scene-editor-v20-card-controller.js`, `scene-editor-v21-visual-adjustments.js`, `scene-editor-v23-aspect-controls.js`, and `scene-editor-v24-object-preview.js` should stay as permanent modules or be merged later.

## Do not do these things

- Do not recreate placeholder files.
- Do not manually reconstruct large JS files from truncated connector chunks.
- Do not load both old and new copies of the same module.
- Do not delete a working old file before the permanent replacement has been tested.
- Do not add extra apps to the Module menu list.
