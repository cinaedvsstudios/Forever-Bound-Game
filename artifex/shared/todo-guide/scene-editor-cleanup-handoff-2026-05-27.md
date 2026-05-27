# Scene Editor cleanup handoff — 2026-05-27

## Current app and repo state

App: Artifex Scene Editor

Repo path: `artifex/apps/scene-editor/`

Current live/version label: `v0.29-title-cache-sync`

Fresh test URL:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.29-title-cache-sync`

Latest confirmed visual state from user: the live page shows the Artifex title image, the subtitle `SCENE EDITOR · v0.29-title-cache-sync`, the status pill `Scene Editor · v0.29-title-cache-sync`, and the restore toast also uses `v0.29-title-cache-sync`. User confirmed the page looks fine after the last stylesheet cleanup.

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

## Work completed in this chat

### Version/cache/title blocker fixed

The previous live page had mixed stale labels: top status showed `v0.16-transform-core`, while a bottom toast showed `v0.28-consolidation`.

Fixed by updating:

- `scene-editor-v2.js`
- `index.html`

Current official version:

`v0.29-title-cache-sync`

The page title, visible subtitle, status/fallback text, CSS cache keys, and JS cache keys were synchronized to `v0.29-title-cache-sync`.

### Permanent stylesheet cleanup completed

Created and loaded:

- `scene-editor-panel-stage.css`
- `scene-editor-control-cards.css`

Deleted old replaced stylesheets:

- `scene-editor-v3.css`
- `scene-editor-v13.css`

User confirmed the UI still looks fine after both replacements.

## Important mistake / blocked item

A placeholder file was accidentally created:

`artifex/apps/scene-editor/scene-editor-transform-controls.js`

It contains only a safety note and is NOT a real copy of the transform-control module.

It is not currently loaded by `index.html`, so the live app should not be broken by it, but it is repo junk and must be cleaned up before continuing.

Do not load this placeholder file.

## Current active files still loaded by Scene Editor

`index.html` currently loads:

- `scene-editor.css`
- `context-menu.css`
- `scene-editor-panel-stage.css`
- `scene-editor-control-cards.css`
- `scene-editor-v18-value-sliders.css`
- `scene-editor-ui-polish.css`
- `scene-editor-v2.js`
- `scene-editor-v11-helper.js`
- `scene-editor-v15-guard.js`
- `scene-editor-v15-helper.js`
- `scene-editor-v18-value-sliders.js`
- `scene-editor-v20-card-controller.js`
- `scene-editor-v21-visual-adjustments.js`
- `scene-editor-v22-offscreen-placement.js`
- `scene-editor-v23-aspect-controls.js`
- `scene-editor-v24-object-preview.js`
- `scene-editor-menu-controller.js`

The remaining cleanup count is 3 larger cleanup groups, but the next one is blocked until the transform module is handled safely.

## The blocked transform-control cleanup

Target old file:

`scene-editor-v15-guard.js`

This file is badly named. It is not just a guard. It contains the real transform-control system, including object selection/transform behaviour, resize handles, rotation handle, rotation origin, transform actions, and injected transform-related styling.

It must not be deleted until a correct permanent replacement is loaded and tested.

Intended permanent file name:

`scene-editor-transform-controls.js`

The first two attempts failed because:

1. The GitHub connector returned the large JS file in chunks/truncated form, so rebuilding the new file manually from chat output was unsafe.
2. A low-level Git tree/commit attempt failed as not-fast-forward, likely because the base tree/commit was not current.
3. A placeholder file was then created by mistake. It is not loaded but must be deleted or replaced.

## Correct next process

Preferred process now:

1. User uploads their local copy of `scene-editor-v15-guard.js` into the new chat.
2. Use that uploaded file as the source of truth.
3. Replace the placeholder `scene-editor-transform-controls.js` with the exact uploaded contents.
4. Update `index.html` to load `scene-editor-transform-controls.js?v=v0.29-title-cache-sync` instead of `scene-editor-v15-guard.js?v=v0.29-title-cache-sync`.
5. Do NOT change the internal logic yet. This is an exact copy/rename test only.
6. User tests object selection, move handle, resize handles, rotate handle, origin marker, transform menu/actions, drag behaviour, and general selected-object controls.
7. If test passes, archive or delete the old numbered file.

Recommended archive path if not deleting:

`artifex/apps/scene-editor/archive/scene-editor-v15-guard.v0.29.archive.js`

Archiving is safer than leaving the old numbered file in the live app folder, but either archive or delete is acceptable as long as it is not loaded by `index.html`.

## Splitting strategy

Do not split the transform-control file before the exact copy/rename test passes.

Reason: exact rename changes only the filename/loading path. Splitting changes structure, dependency order, function scope, and initialization order, which adds risk.

After the exact renamed version is working, the file can be split into smaller permanent modules in a later pass, for example:

- `scene-editor-transform-controls.js` — coordinator/init bridge
- `scene-editor-transform-handles.js` — resize, rotate, origin handles
- `scene-editor-transform-actions.js` — flip, skew, context/menu transform actions
- `scene-editor-transform-styles.css` — transform CSS currently injected by JS

## Immediate next actions for the new chat

1. Inspect the required global docs and current Scene Editor files.
2. Confirm current `index.html` still does not load the placeholder `scene-editor-transform-controls.js`.
3. Ask the user to upload their local `scene-editor-v15-guard.js` if it is not already attached.
4. Replace the placeholder permanent file with the uploaded real file contents.
5. Switch `index.html` from `scene-editor-v15-guard.js` to `scene-editor-transform-controls.js`.
6. Keep version/cache keys at `v0.29-title-cache-sync` unless a deliberate version bump is chosen.
7. Provide the same fresh test URL.
8. After user confirms it works, archive or delete `scene-editor-v15-guard.js`.
9. Then reduce cleanup count from 3 to 2.

## Do not do these things

- Do not create another placeholder file.
- Do not manually reconstruct a large JS file from truncated connector chunks.
- Do not continue piling new cleanup patches on top of this blocked step.
- Do not split the transform-control module before the exact renamed version works.
- Do not load both the old and new transform-control files at the same time.
- Do not delete `scene-editor-v15-guard.js` before the permanent replacement has been tested.
- Do not add extra apps to the Module menu list.

## Suggested user test checklist after the rename switch

- Load the fresh URL.
- Confirm top subtitle and status still show `v0.29-title-cache-sync`.
- Load or restore a scene.
- Select an object.
- Move the object using the centre/move handle.
- Resize from handles.
- Rotate from the red rotate handle.
- Move or use the rotation origin marker if available.
- Check the selected details panel still updates.
- Confirm no giant handles return.
- Confirm no console-visible breakage if user can inspect console.
