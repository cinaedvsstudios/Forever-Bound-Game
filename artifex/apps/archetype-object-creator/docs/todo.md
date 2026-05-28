# Archetype Object Creator To-Do

This file tracks work that belongs specifically to Archetype Object Creator. Platform-wide work belongs in `artifex/shared/todo-guide/all-apps-todos.json`.

## Open

### Archive or remove old patch files from live source folder

Status: open  
Priority: high  
Source: source folder review after V1.30 cleanup

Several old `*-patch.js` files are still present in `artifex/apps/archetype-object-creator/v1/src/`. They should not stay mixed into the live source folder if they are no longer part of the active app path.

Files to check:

- `square-icon-cards-patch.js`
- `object-build-checklist-wizard-patch.js`
- `template-card-patch.js`
- `icon-atlas-crop-patch.js`
- `right-panel-layout-patch.js`

Required outcome:

- Confirm whether each file is still imported or used.
- If unused, move it into an archive folder such as `artifex/apps/archetype-object-creator/archive/legacy-patches/` or delete it if it is fully superseded and safe to remove.
- If still useful, rename it as a normal module and document why it remains active.

### Retire or split `template-card-enhancements.js`

Status: open  
Priority: high  
Source: source folder review after V1.30 cleanup

`template-card-enhancements.js` is still imported by `editor-app.js` and is still a large legacy overlay-style file. Much of its behaviour has already been extracted into normal modules, so it should be reviewed and reduced.

Required outcome:

- Identify which behaviour inside `template-card-enhancements.js` is still required.
- Remove duplicated logic already handled by `object-template-icons.js`, `object-wizard-step5-layout.js`, `object-wizard-step5.js`, `object-wizard-reference-panel.js`, `object-wizard-frame-correction.js`, and `object-wizard-asset-package.js`.
- If nothing active remains, remove the import from `editor-app.js` and archive/delete the file.
- If active behaviour remains, split it into properly named modules rather than leaving it as one large enhancement overlay.

### Split or rename `object-creator-workflows-stable.js`

Status: open  
Priority: medium-high  
Source: source folder review after V1.30 cleanup

`object-creator-workflows-stable.js` is still imported by `editor-app.js`. It contains the wizard shell/session flow and a large embedded CSS block. It is stable, but the name and size make it look like another overlay layer rather than normal app architecture.

Required outcome:

- Split wizard session / resume logic into a normal module, for example `object-wizard-sessions.js`.
- Split wizard shell / steps 1–4 into a normal module, for example `object-wizard-flow.js`.
- Move shared wizard shell styles into a CSS file or a clearly named style module.
- Update `editor-app.js` to import the new modules.
- Archive or remove `object-creator-workflows-stable.js` after the split.

## Done

### Complete current overlay module extraction

Status: done  
Completed in: V1.30  
Source: project file contracts / patch-layer rule

Completed changes:

- Created `object-wizard-asset-package.js`.
- Moved ZIP package download, frame path table rendering, expected file path generation, object asset folder rules, data URL byte conversion, browser ZIP creation, CRC32 calculation, and asset manifest generation into the new module.
- Updated `editor-app.js` to initialise the asset package module.
- Bumped the app to V1.30.
- The planned Object Creator module extraction list is now complete.

### Extract wizard Step 5 core module

Status: done  
Completed in: V1.29  
Source: docs/artifex/19-project-file-contracts.md

Completed changes:

- Created `object-wizard-step5.js`.
- Moved Step 5 action title info, mark-complete title placement, field ordering, wizard button labels, Sound Events list, Action Behaviour controls, trigger mapping, playback rules, and frame event rows into the new module.
- Updated `editor-app.js` to initialise the Step 5 core module.
- Bumped the app to V1.29.

### Extract wizard Frame Correction module

Status: done  
Completed in: V1.27  
Source: docs/artifex/19-project-file-contracts.md

Completed changes:

- Created `object-wizard-frame-correction.js`.
- Moved Frame Fix popup setup, brightness slider setup, numeric step controls, selected-frame correction loading, reset logic, preview/thumb correction application, and brightness matching into the new module.
- Updated `editor-app.js` to initialise the Frame Correction module.
- Bumped the app to V1.27.

### Extract wizard Reference panel module

Status: done  
Completed in: V1.26  
Source: docs/artifex/19-project-file-contracts.md

Completed changes:

- Created `object-wizard-reference-panel.js`.
- Moved the Reference panel creation, refresh observer, reference index lookup, localStorage fallback, and safe reference-list rendering into the new module.
- Updated `editor-app.js` to initialise the Reference panel module.
- Bumped the app to V1.26.

### Further tighten object template icon padding

Status: done  
Completed in: V1.25  
Source: template wizard visual review

Completed changes:

- Reduced template card maximum width again.
- Reduced outer card padding again.
- Reduced square icon-box padding to nearly flush.
- Reduced icon card grid gaps.
- Tightened template title, subtext, and button sizing.

### Tighten object template card density

Status: done  
Completed in: V1.24  
Source: template wizard visual review

Completed changes:

- Reduced template card maximum width.
- Reduced card padding and grid gaps.
- Reduced icon display box padding.
- Reduced displayed icon image size by roughly 20% from the V1.23 version.
- Tightened text and button sizing to match the smaller card layout.

### Extract object template icon module

Status: done  
Completed in: V1.23  
Source: docs/artifex/19-project-file-contracts.md

Completed changes:

- Created `object-template-icons.js`.
- Moved the object template icon atlas paths, sheet crop settings, group colour codes, fallback icon glyphs, icon card CSS, image loading, crop caching, and template-card decoration observer into that module.
- Updated `editor-app.js` to initialise the icon module.
- Bumped the app to V1.23.

### Test V1.21 Step 5 wizard and export contract polish

Status: done  
Completed in: V1.21  
Source: V1.18 / V1.19 / V1.21 implementation pass

Confirmed live behaviour:

- Selected action title sits above the right-side control boxes.
- Preview window is pulled up and play/frame buttons are closer to the preview.
- Left column contains preview, play/frame controls, Frame Fix, and Reference.
- Right column contains title, asset fields, Action Behaviour, Sound Events, and Notes.
- Reference box appears below the preview controls, has fixed height, and scrolls.
- Reference box does not invent fake scene links; it waits for a real shared reference index.
- Frame Fix popup title shows `Frame Correction – Frame XX`.
- Frame Fix has Reset and Close controls.
- Frame Fix has scale, X, Y, and brightness controls with visible numeric steppers.
- Match brightness across frames stores per-frame brightness values and shows them in the brightness control.
- Frame corrections apply live to preview and frame thumbnails.
- Bottom controls clearly distinguish `Add Images` from `Add Empty Frame Slot`.
- New object archetypes use the canonical `archobj_` ID prefix.
- Exported object files are named for individual files under `archetypes/objects/` and declare `archetypes/object-index.json` as the index target.

### Start overlay integration cleanup

Status: done  
Completed in: V1.22  
Source: docs/artifex/19-project-file-contracts.md

Completed changes:

- Created `object-wizard-step5-layout.js`.
- Moved Step 5 two-column layout observer, wrapper creation, and layout-specific injected CSS out of `editor-app.js`.
- Updated `editor-app.js` to import and initialise the layout module.
- Bumped the app to V1.22.

### Align object archetype exports with project file contracts

Status: done  
Completed in: V1.19  
Source: docs/artifex/19-project-file-contracts.md

Completed changes:

- New object archetype IDs now use the canonical `archobj_` prefix.
- Older imported/local `object_` IDs are normalised to `archobj_` IDs.
- Reusable object archetypes now declare `archetypes/object-index.json` as the object index target.
- Individual object export paths now resolve to `archetypes/objects/<archobj_id>.json`.
- Exported JSON includes `exportPaths.objectIndex` and `exportPaths.objectFile` for Project Manager / build tooling.

Scene Editor still needs to consume object archetype IDs when placing instances, but that belongs to Scene Editor / shared project integration rather than this app-local export task.

## Blocked by all-apps work

### Real scene/quest/reference listing

Status: blocked  
Priority: high  
Blocked by: `todo_all_apps_project_reference_index`

The Reference panel is present, but real results require the shared project reference index to exist. That index is tracked globally in `artifex/shared/todo-guide/all-apps-todos.json` because Project Manager, Scene Editor, Quest Builder, Effect Editor, Build Game, and Archetype Object Creator all need the same project graph source of truth.
