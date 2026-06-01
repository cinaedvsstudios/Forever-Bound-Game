# Archetype Object Creator To-Do

This file tracks work that belongs specifically to Archetype Object Creator. Platform-wide work belongs in `artifex/shared/todo-guide/all-apps-todos.json`.

Current review/handover document:

```text
artifex/apps/archetype-object-creator/docs/current-state-v1.35-review.md
```

## Current status — V1.36 consolidation delivered

### Audit and either integrate or revert the provisional V1.35 pass

Status: resolved by V1.36 Step 5 ownership and save-lifecycle consolidation
Priority: completed for the confirmed defects
Source: V1.35 implementation review on 2026-05-31

V1.35 is active on `main`, but it is not accepted as clean/stable integration. The code pass added project-folder saving, new Step 5 save semantics, `Mark Task Ready`, equal-size lower action buttons, Backup ZIP wording and a Procedural Sound Generator launch/assignment hook. These changes were made without first completing a clean ownership/integration review and without completing the required browser/disposable-project tests.

Completed V1.36 implementation outcome:

- `object-wizard-build-checklist.js` now owns stable Step 5 DOM, toolbar and left/right layout.
- `object-wizard-step5-layout.js` and `object-wizard-frame-correction.js` are no longer active imports.
- Save Browser Draft, Save Project (In Progress), Finish / Mark Object Ready and Mark Task Ready now have distinct lifecycle meanings.
- Uploaded frames are staged under `intake/objects/<archobj_id>/...` for in-progress saves and promoted to registered final `asset_` records only during readiness finalisation.
- The Sound Events `🎛️` callback captures the initiating requirement target so selection changes cannot redirect assignment.
- Syntax and disposable browser/project validation were run for V1.36.

Verification checklist:

- App loads with no module/console errors and no requests for deleted temporary integration files.
- V1.34 requirement state persists: ready/completion, frame slots/uploads, task ordering and Save Draft/session resume.
- Step 5 displays without horizontal clipping and Frame Fix still opens with its two-column controls.
- The three lower action controls are the intended size and wording.
- `Save Project` writes only the intended object file and object-index entry in a disposable connected project folder and does not remove unrelated entries.
- A frame-upload save is inspected to determine what provisional preview/draft fields are currently written.
- The `🎛️` popup opens; saving a test generated sound registers a recipe/index entry and assigns only its `asset_sfx_...` ID to the object task.
- Backup ZIP remains a functioning fallback/recovery export.

### Verify the V1.34 Step 5 persistence and layout repair

Status: implemented in code / verification still required
Priority: high
Source: V1.33 checklist state-contract regression and Step 5 live review

Implemented changes:

- Repaired the canonical Step 5 persistence contract so task, frame, completion, ordering and related action data store under `productionAssets.requirements` with `productionAssets.requirementOrder`.
- Restored `Gameplay Sprite Asset ID` and `Dialogue Portrait Asset ID` wording and initial default order while preserving user-driven reordering.
- Removed the returned Step 5 instruction line.
- Separated left-list task labels and metadata into stacked display text.
- Adjusted desktop Step 5 sizing to reduce horizontal overflow and clipped fields.
- Intended to retain the Frame Fix two-column correction layout, current-frame title, Reset / Close controls and brightness matching action.

This must be verified with persistence testing, not signed off from screenshots alone.

### Future maintainability cleanup for `editor-ui.js`

Status: open
Priority: medium
Source: V1.33 line-count audit

`editor-ui.js` is still 821 lines. It is outside the current wizard-flow split and was not refactored in V1.33 because doing so was not necessary to prevent a regression. Plan a separate focused pass to split general editor UI/menu/dialog/library responsibilities into smaller named modules without changing the accepted UI.

### Future maintainability cleanup for `object-wizard-step5.js`

Status: open
Priority: high after V1.35 audit
Source: V1.33 line-count audit plus V1.35 integration review

`object-wizard-step5.js` is a named Step 5 core module rather than a legacy overlay, but V1.35 added Sound Events integration and readiness UI into the same observer-driven enhancement module. After deciding what V1.35 behaviour remains, separate or consolidate responsibilities only through a planned ownership cleanup, not by adding patch layers.

## Implemented but not accepted as verified

### V1.35 provisional project save, sound generator and compact-control pass

Status: active in code / unverified / subject to integration or rollback
Implemented in: V1.35
Source: Step 5 live review after V1.34

Changes presently in the codebase:

- Made `Add Images`, `Add Empty Frame Slot` and `Backup ZIP` the intended equal-size controls in Step 5, with ZIP described as backup/fallback rather than normal save.
- Replaced the selected-task completion wording with `Mark Task Ready`, with tooltip text intended to distinguish it from Finish or saving the object.
- Added connected project-folder save code intended to write an object record under `archetypes/objects/` and update `archetypes/object-index.json`.
- Changed the visible save choices toward browser draft recovery versus connected-project save.
- Added a `🎛️` Create Synth Sound control beside Sound Events intended to assign registered `asset_sfx_...` IDs returned from the shared generator.
- Shifted sound-event field semantics toward registered sound asset IDs rather than raw sound paths.
- Bumped the Object Creator shell and relevant Step 5 module cache/version strings to V1.35.

Known concerns:

- The work was applied incrementally rather than as a clean reviewed integration pass.
- `object-project-storage.js` is a new active module and requires contract/testing review.
- The current project-save handling for browser-uploaded preview frames writes provisional sanitised data rather than a confirmed final asset-promotion workflow.
- The Step 5 final DOM/layout is still affected by several modules, increasing conflict risk.
- No successful required browser/disposable-project verification has been recorded for V1.35.

## Completed historical implementation work

### Split `object-wizard-flow.js` into smaller wizard modules

Status: done
Completed in: V1.33
Source: review feedback after V1.32 cleanup

Completed changes:

- Split Step 1 and Step 2 source selection into `object-wizard-start.js`.
- Split Step 3 runtime/action capability selection into `object-wizard-capabilities.js`.
- Split Step 4 basic archetype details into `object-wizard-basic-details.js`.
- Split Step 5 base checklist rendering into `object-wizard-build-checklist.js`, requirement/task storage into `object-wizard-build-requirements.js`, and frame/preview mechanics into `object-wizard-frame-tasks.js`.
- Added `object-wizard-helpers.js` for shared wizard constants and helper functions.
- Reduced `object-wizard-flow.js` to a thin wizard router/orchestrator.
- Bumped the app to V1.33.

Important later finding: the V1.33 split introduced the Step 5 `productionAssets.tasks/order` versus `productionAssets.requirements/requirementOrder` regression addressed in V1.34 code and still requiring verification.

### Split object wizard workflow modules

Status: done
Completed in: V1.32
Source: source folder review after V1.30 cleanup

Completed changes:

- Created `object-wizard-flow.js` for the Quick Start Wizard route and Step 5 shell.
- Created `object-wizard-sessions.js` for saved wizard sessions, localStorage persistence, resume/delete behaviour and the crystal-ball session indicator.
- Created `object-wizard.css` for wizard styles that previously lived in `object-creator-workflows-stable.js`.
- Updated `editor-app.js` to initialise the named flow module.
- Removed `object-creator-workflows-stable.js` and the inactive `object-creator-workflows.js` predecessor from live `v1/src/` and recorded them in the archive manifest.
- Bumped the app to V1.32.

### Retire `template-card-enhancements.js` and older patch files

Status: done
Completed in: V1.31 cleanup
Source: source folder review after V1.30 cleanup

Completed changes:

- Removed the active import and live file `template-card-enhancements.js` after confirming duplicated ownership.
- Created `artifex/apps/archetype-object-creator/archive/legacy-patches/README.md` as the archive manifest.
- Removed old live patch-layer files: `square-icon-cards-patch.js`, `object-build-checklist-wizard-patch.js`, `template-card-patch.js`, `icon-atlas-crop-patch.js` and `right-panel-layout-patch.js`.
- Recorded removed file blob SHAs in the archive manifest.

### Complete current overlay module extraction

Status: done
Completed in: V1.30
Source: project file contracts / patch-layer rule

Completed changes:

- Created `object-wizard-asset-package.js`.
- Moved ZIP package download, frame path table rendering, expected file path generation, object asset folder rules, data URL byte conversion, browser ZIP creation, CRC32 calculation and asset manifest generation into the module.
- Updated `editor-app.js` to initialise the asset-package module.

### Extract wizard Step 5, Frame Correction and Reference modules

Status: done
Completed in: V1.26–V1.29
Source: `docs/artifex/19-project-file-contracts.md`

Completed changes:

- Created `object-wizard-reference-panel.js` for Reference panel rendering and safe no-index behaviour.
- Created `object-wizard-frame-correction.js` for Frame Fix popup and correction application.
- Created `object-wizard-step5.js` for Step 5 title/action/sound/behaviour enhancements.
- Updated `editor-app.js` during those versions to initialise the extracted modules.

### Template icon/card density and export-path work

Status: done
Completed in: V1.19–V1.25

Completed changes:

- New object archetypes use canonical `archobj_` IDs and individual export paths under `archetypes/objects/` with `archetypes/object-index.json` as index target.
- Created `object-template-icons.js` and tightened template icon/card density through V1.25.
- Established the accepted visual Step 5 arrangement and Frame Fix controls before the later V1.33/V1.34/V1.35 work.

## Blocked by all-apps work

### Real scene/quest/reference listing

Status: blocked
Priority: high
Blocked by: `todo_all_apps_project_reference_index`

The Reference panel is present, but real results require the shared project reference index to exist. That index is tracked globally in `artifex/shared/todo-guide/all-apps-todos.json` because Project Editor, Scene Editor, Quest Builder, Effect Editor, Build Game and Archetype Object Creator need the same project graph source of truth.


### V1.36 follow-up acceptance notes

Status: pending user/manual acceptance after PR review
Priority: high

- Manually review the V1.36 browser flow in a real disposable Blank Starter Project folder using the File System Access picker.
- Confirm the new `authoringStatus` wording is acceptable in Object Creator and Object Library contexts.
- Confirm the generated final image asset naming/location under `assets/objects/<archobj_id>/...` is the desired permanent convention before production use.
