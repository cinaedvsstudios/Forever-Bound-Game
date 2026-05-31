# Archetype Object Creator To-Do

This file tracks work that belongs specifically to Archetype Object Creator. Platform-wide work belongs in `artifex/shared/todo-guide/all-apps-todos.json`.

## Open

### Future maintainability cleanup for `editor-ui.js`

Status: open  
Priority: medium  
Source: V1.33 line-count audit

`editor-ui.js` is still 821 lines. It is outside the current wizard-flow split and was not refactored in V1.33 because doing so was not necessary to prevent a regression. Plan a separate focused pass to split general editor UI/menu/dialog/library responsibilities into smaller named modules without changing the accepted UI.

### Future maintainability cleanup for `object-wizard-step5.js`

Status: open  
Priority: low-medium  
Source: V1.33 line-count audit

`object-wizard-step5.js` is a named Step 5 core module rather than a legacy overlay, but a future pass should consider separating Action Behaviour and Sound Events into smaller named modules if the file grows further.

## Done

### Align Step 5 project saving, sound generation, and compact asset controls

Status: done  
Completed in: V1.35  
Source: Step 5 live review after V1.34

Completed changes:

- Made `Add Images`, `Add Empty Frame Slot`, and `Backup ZIP` the same visible size in Step 5, with the ZIP action clearly identified as a backup/fallback export rather than the main save path.
- Replaced the unclear selected-task completion wording with `Mark Task Ready`, including a tooltip clarifying that it affects only the current task and is not the same as Finish or saving the object.
- Added connected project-folder saving for object archetypes, writing the canonical object file under `archetypes/objects/` and updating `archetypes/object-index.json`.
- Kept browser drafts as recovery data and retained Backup ZIP for uploaded preview-frame recovery/export.
- Prevented browser-only image data URLs and temporary filename references from being written as final registered object asset references; final objects wait for registered Asset IDs.
- Added a `🎛️` Create Synth Sound button beside Sound Events and connected it to the shared Sound Generator so generated registered `asset_sfx_` IDs can be assigned back to the selected task.
- Updated Sound Events storage to treat generated sound links as registered asset IDs rather than raw paths.
- Bumped the Object Creator shell and Step 5 modules to V1.35.

### Repair Step 5 persistence contract and compact layout regressions

Status: done  
Completed in: V1.34  
Source: V1.33 checklist module regression / live Step 5 review

Completed changes:

- Repaired the canonical Step 5 persistence contract so task, frame, completion, ordering, and related action data all store under `productionAssets.requirements` with `productionAssets.requirementOrder`.
- Restored `Gameplay Sprite Asset ID` and `Dialogue Portrait Asset ID` wording and made them the initial first two checklist tasks while preserving user-driven reordering.
- Removed the returned Step 5 instruction line and restored compact toolbar button labels with tooltips.
- Separated left-list task labels and metadata into stacked block text.
- Fixed desktop Step 5 horizontal overflow and clipped right-side fields using shrinkable detail columns and compact controls.
- Retained the Frame Fix two-column correction layout, current-frame title, Reset / Close controls, and brightness matching action.

### Split `object-wizard-flow.js` into smaller wizard modules

Status: done  
Completed in: V1.33  
Source: review feedback after V1.32 cleanup

Completed changes:

- Reopened app-local cleanup after the V1.32 `object-wizard-flow.js` file measured 939 lines.
- Split Step 1 and Step 2 source selection into `object-wizard-start.js`.
- Split Step 3 runtime/action capability selection into `object-wizard-capabilities.js`.
- Split Step 4 basic archetype details into `object-wizard-basic-details.js`.
- Split Step 5 base checklist rendering into `object-wizard-build-checklist.js`, requirement/task storage into `object-wizard-build-requirements.js`, and frame/preview mechanics into `object-wizard-frame-tasks.js`.
- Added `object-wizard-helpers.js` for shared wizard constants and helper functions.
- Reduced `object-wizard-flow.js` to a thin 117-line wizard router/orchestrator.
- Bumped the app to V1.33.
- Local browser verification passed for load, menus, wizard source paths, Step 2 icons/colours, Steps 3–5, Frame Fix, Reference safe empty state, Step 5 panels, Save & Resume Later, Finish + Save Local, Finish, reload, and retired-file request checks.

### Split object wizard workflow modules

Status: done  
Completed in: V1.32  
Source: source folder review after V1.30 cleanup

Completed changes:

- Created `object-wizard-flow.js` for the Quick Start Wizard route, template/existing-object choices, Steps 1–4, and the Step 5 build-checklist shell.
- Created `object-wizard-sessions.js` for saved wizard sessions, localStorage persistence, resume/delete behaviour, and the crystal-ball session indicator.
- Created `object-wizard.css` for the wizard shell, session indicator, progress orb, build checklist, frame strip, and responsive wizard layout styles that previously lived in `object-creator-workflows-stable.js`.
- Updated `editor-app.js` to initialise the named flow module instead of importing `object-creator-workflows-stable.js`.
- Removed `object-creator-workflows-stable.js` and the inactive `object-creator-workflows.js` predecessor from the live `v1/src/` folder and recorded both files in the archive manifest.
- Bumped the app to V1.32.
- Local browser verification covered page load, version badge, menus, the template route through Step 5, Step 5 extracted panels, Frame Fix, saved wizard sessions, Finish, and the existing-object empty state.

### Retire `template-card-enhancements.js`

Status: done  
Completed in: V1.31  
Source: source folder review after V1.30 cleanup

Completed changes:

- Confirmed the file duplicated behaviour already owned by `object-template-icons.js`, `object-wizard-step5-layout.js`, `object-wizard-step5.js`, `object-wizard-reference-panel.js`, `object-wizard-frame-correction.js`, and `object-wizard-asset-package.js`.
- Removed the active import from `editor-app.js`.
- Removed `template-card-enhancements.js` from the live `v1/src/` folder and recorded its blob SHA in the archive manifest.
- Bumped the app to V1.31.
- Local browser verification covered page load, version badge, menus, the template route through Step 5, Step 5 extracted panels, Frame Fix, and network requests for retired files.

### Archive or remove old patch files from live source folder

Status: done  
Completed in: V1.31 cleanup  
Source: source folder review after V1.30 cleanup

Completed changes:

- Confirmed the old patch files were no longer imported by the active app entry point.
- Created `artifex/apps/archetype-object-creator/archive/legacy-patches/README.md` as the archive manifest.
- Removed these old patch-layer files from `artifex/apps/archetype-object-creator/v1/src/`:
  - `square-icon-cards-patch.js`
  - `object-build-checklist-wizard-patch.js`
  - `template-card-patch.js`
  - `icon-atlas-crop-patch.js`
  - `right-panel-layout-patch.js`
- Recorded each removed file's blob SHA in the archive manifest so the old code can still be recovered from Git history if needed.

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
