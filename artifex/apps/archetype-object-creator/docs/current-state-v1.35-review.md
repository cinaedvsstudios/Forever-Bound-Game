# Archetype Object Creator — Current State After V1.35 Review

Date recorded: 2026-05-31  
Status: Active code exists on `main`, but V1.35 is unverified and not accepted as clean integration.

## Why This Note Exists

V1.35 was implemented as an extended repair/integration pass after the approved V1.34 Step 5 persistence and layout work. The pass made project-folder save and Sound Generator integration changes without first completing the required architecture review and without completing browser or disposable-project verification.

This note is the current-state handover. Do not treat V1.35 as complete merely because the visible badge says V1.35.

## Authoritative Contracts To Read Before Further Editing

- `docs/artifex/18-color-and-display-rules.md`
- `docs/artifex/19-project-file-contracts.md`
- `docs/artifex/19a-project-starter-file-schemas.md`
- `docs/artifex/20-asset-intake-workflow.md`
- `docs/artifex/22-sound-archetype-generator.md`
- `artifex/shared/todo-guide/README.md`
- `artifex/apps/archetype-object-creator/README.md`
- `artifex/apps/archetype-object-creator/docs/todo.md`

The central contract remains:

- Object Creator owns reusable non-FX object archetypes, not scene instances, Quest/Puzzle internals, FX definitions or copied sound recipes.
- Canonical object records belong under `archetypes/objects/archobj_<slug>.json` and are indexed through `archetypes/object-index.json`.
- Final media links in an object record must use registered final `asset_` IDs.
- Connected project-folder save is the intended normal write path once approved and tested.
- Browser/local storage is draft/recovery only.
- ZIP/download export is backup/fallback only.

## V1.34 Changes Present In Code

V1.34 attempted to repair the V1.33 Step 5 split regression and polish the layout:

- Canonical Step 5 requirement data was changed back to `productionAssets.requirements[requirementId]`.
- Requirement ordering was changed back to `productionAssets.requirementOrder`.
- State normalisation was updated to preserve `requirements` and `requirementOrder`.
- The initial checklist order was restored to begin with `Gameplay Sprite Asset ID` and `Dialogue Portrait Asset ID`.
- The Step 5 instruction sentence was removed.
- Left-list task labels and metadata were split into separate displayed lines.
- Desktop Step 5 sizing was adjusted to reduce horizontal overflow/clipping.
- Frame Fix was intended to retain its two-column correction layout.

Verification still required: completion/ready persistence, frame persistence, drag-order persistence, saved-session resume, layout overflow, and Frame Fix behaviour in the live app.

## V1.35 Changes Present In Code But Not Yet Accepted

The following additions or behaviour changes are currently active in the codebase and require audit/testing before being treated as approved:

### Save workflow and project-folder integration

- A new active module was added: `v1/src/object-project-storage.js`.
- The File menu was changed to include `Connect Project Folder` and `Save Object to Project`.
- Step 5 toolbar wording was changed to `Save Draft`, `Save Project` and `Finish`.
- `Save Project` is intended to write an object record under `archetypes/objects/` and update `archetypes/object-index.json`.
- The project-save implementation currently saves a browser draft before attempting the project write.
- The project-save implementation currently strips browser frame `dataUrl` content from the saved project record and writes provisional `previewOnly` / `draftSourceName` handling for uploaded frame previews.

The final uploaded-frame/asset-promotion workflow is not approved. It must either register/promote proper final assets and store their `asset_` IDs, or deliberately block final object save until required Asset IDs are assigned. Do not silently treat provisional fields as a settled schema.

### Step 5 UI changes

- The lower Step 5 controls were changed to show `Add Images`, `Add Empty Frame Slot` and `Backup ZIP`, with equal-size styling intended.
- ZIP wording was changed to present it as backup/fallback rather than normal save.
- The selected-task state label was changed to `Mark Task Ready`.

The meaning of `Mark Task Ready` is not yet approved: it currently behaves as a manual checklist flag and may not prove that all required assets/configuration exist.

### Procedural Sound Generator integration

- A `🎛️` control was added beside Step 5 Sound Events.
- Step 5 was changed to attempt to open the shared Procedural Sound Generator and assign a returned `asset_sfx_...` ID into the selected task.
- Sound-event fields were shifted toward registered asset-ID semantics rather than raw sound paths.

The shared contract in `docs/artifex/22-sound-archetype-generator.md` is the intended rule: the generator owns recipe creation/registration, and Object Creator must store only returned `asset_` IDs. The Object Creator integration and actual callback/save behaviour remain unverified.

## Architecture Risk Introduced By The Pass

The live app is not importing hundreds of separate patch files, but Step 5 remains vulnerable to layering problems because its final UI is assembled across multiple modules:

- `object-wizard-build-checklist.js` renders base Step 5 markup and save controls.
- `object-wizard-step5.js` uses observer-driven DOM enhancement for fields, Action Behaviour, Sound Events and the Sound Generator button.
- `object-wizard-step5-layout.js` separately rearranges the detail panel and injects layout rules.
- `object-wizard-asset-package.js` separately adds ZIP controls and action-button sizing styles.
- `object-project-storage.js` separately introduces the new direct-save workflow.

A cleanup pass must not add another patch/wrapper. It must decide ownership of Step 5 structure, controls, layout and project-save behaviour, then integrate or revert the provisional V1.35 work in those owning modules.

## Temporary Files Created And Removed During V1.35 Work

The following were created during the pass and then removed rather than remaining active modules:

- `v1/src/object-wizard-sound-integration.js`
- `v1/src/object-wizard-step5-tools.js`
- `artifex/shared/sound-generator/sound-generator-ui.js`

Do not recreate these as new layering modules. Any future correction must be integrated into approved owners.

## Required Next Work Before More Features

1. Inspect the current V1.35 imports and active modules; do not add overlays or wrappers.
2. Run syntax checks on every V1.34/V1.35 changed JavaScript file.
3. Browser-test the Step 5 state-contract repair: ready state, frame slots/uploads, order persistence and resume persistence.
4. Decide the final approved Step 5 save language and behaviour before retaining or changing `Save Draft`, `Save Project` and `Finish`.
5. Decide whether `Mark Task Ready` remains a manual checklist control or becomes validation-backed readiness.
6. Audit `object-project-storage.js` against the connected-folder contract and use only a disposable test project for writes.
7. Resolve the final frame/asset workflow; no project record should treat browser preview files as final assets.
8. Verify the shared Sound Generator popup, its asset-index registration, and `Save and Assign Here` callback before accepting the Object Creator hookup.
9. Consolidate Step 5 structure/style ownership without adding a third transitional enhancer layer.
10. Only after verification, change the to-do status from unverified/in review to done.

## Manual Verification Checklist

Use a fresh-cache URL when testing the live app. Test in two phases.

### Safe UI and browser-draft checks

- App loads and version badge reports V1.35.
- Menus work and the File menu labels are visible.
- Quick Start Wizard reaches Step 5.
- Step 5 begins with the two asset-ID tasks.
- Task labels and metadata remain visually separated.
- Step 5 toolbar, `Mark Task Ready`, the three lower buttons and the `🎛️` Sound Events control display correctly.
- No horizontal scrollbar or clipped right-side fields appear at the tested desktop viewport.
- Frame Fix still opens and remains a usable two-column correction panel.
- Mark one task ready, change task, return, and confirm persistence.
- Add a frame slot/upload, change task, return, and confirm persistence.
- Reorder a task, navigate away/back or resume a saved draft, and confirm persistence.
- Console/network shows no module import errors or deleted-module requests.

### Disposable connected-project checks only

- Connect a disposable starter project, never the real project for initial tests.
- Save a simple object with no uploaded preview media and confirm the intended object file/index entry is written without deleting unrelated entries.
- Test a frame-upload object and inspect exactly what the saved object record contains for preview-only frames.
- Test `🎛️` Sound Events creation and confirm whether a synth recipe is registered under `assets/audio/sfx/`, an `asset_sfx_...` record appears in `assets/asset-index.json`, and the same ID is inserted into the Object Creator draft.
- Confirm Backup ZIP still downloads uploaded preview material as the fallback/recovery route.

## Documentation Status

- `artifex/apps/archetype-object-creator/README.md` and `docs/todo.md` must reflect this unverified V1.35 status.
- `APPLY_INSTRUCTIONS.txt` is historical and must not be used as current installation or implementation guidance.
- `docs/artifex/06-object-library.md` should identify Archetype Object Creator as the active authoring module and point here for implementation status.
- `docs/artifex/19-project-file-contracts.md` remains the architecture contract; it is not evidence that V1.35 has passed testing.
- `docs/artifex/22-sound-archetype-generator.md` remains the shared sound contract; Object Creator usage is provisional until verified.


## V1.36 follow-up

A later approved V1.36 implementation pass supersedes the provisional V1.35 runtime behaviour for Step 5 ownership, authoring status, in-progress project save, ready finalisation, sound assignment targeting and frame-correction state. This V1.35 document remains a historical record of the risks that prompted that pass.
