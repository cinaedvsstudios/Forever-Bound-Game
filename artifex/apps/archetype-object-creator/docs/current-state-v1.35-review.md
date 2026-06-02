# Archetype Object Creator — Current State After V1.35 Review

Date recorded: 2026-05-31  
Historical status: V1.35 was reviewed as active code on `main` but unverified and not accepted as clean integration.  
Follow-up status: V1.36 merged from PR #38 on 2 June 2026; see the follow-up section at the end of this document for current validation state.

## Why This Note Exists

V1.35 was implemented as an extended repair/integration pass after the approved V1.34 Step 5 persistence and layout work. The pass made project-folder save and Sound Generator integration changes without first completing the required architecture review and without completing browser or disposable-project verification.

This note is the historical V1.35 current-state handover. Do not treat its V1.35 findings as the description of the current V1.36 runtime; use the follow-up section for what happened next.

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

Verification still required at the time of the V1.35 review: completion/ready persistence, frame persistence, drag-order persistence, saved-session resume, layout overflow, and Frame Fix behaviour in the live app.

## V1.35 Changes Present In Code But Not Yet Accepted At Review Time

The following additions or behaviour changes were active during the V1.35 review and required audit/testing before being treated as approved:

### Save workflow and project-folder integration

- A new active module was added: `v1/src/object-project-storage.js`.
- The File menu was changed to include `Connect Project Folder` and `Save Object to Project`.
- Step 5 toolbar wording was changed to `Save Draft`, `Save Project` and `Finish`.
- `Save Project` was intended to write an object record under `archetypes/objects/` and update `archetypes/object-index.json`.
- The project-save implementation saved a browser draft before attempting the project write.
- The project-save implementation stripped browser frame `dataUrl` content from the saved project record and wrote provisional `previewOnly` / `draftSourceName` handling for uploaded frame previews.

The final uploaded-frame/asset-promotion workflow was not approved during the V1.35 review. It required a proper final asset/register flow or deliberate blocking until required Asset IDs were assigned.

### Step 5 UI changes

- The lower Step 5 controls were changed to show `Add Images`, `Add Empty Frame Slot` and `Backup ZIP`, with equal-size styling intended.
- ZIP wording was changed to present it as backup/fallback rather than normal save.
- The selected-task state label was changed to `Mark Task Ready`.

At review time, the meaning of `Mark Task Ready` was not approved: it behaved as a manual checklist flag and did not itself prove that all required assets/configuration existed.

### Procedural Sound Generator integration

- A `🎛️` control was added beside Step 5 Sound Events.
- Step 5 was changed to attempt to open the shared Procedural Sound Generator and assign a returned `asset_sfx_...` ID into the selected task.
- Sound-event fields were shifted toward registered asset-ID semantics rather than raw sound paths.

The shared contract in `docs/artifex/22-sound-archetype-generator.md` remains the intended rule: the generator owns recipe creation/registration, and Object Creator stores only returned `asset_` IDs. Sound target assignment remains part of the V1.36 post-merge validation work listed below.

## Architecture Risk Identified In The V1.35 Pass

At V1.35, Step 5 was vulnerable to layering problems because its final UI was assembled across multiple modules:

- `object-wizard-build-checklist.js` rendered base Step 5 markup and save controls.
- `object-wizard-step5.js` used observer-driven DOM enhancement for fields, Action Behaviour, Sound Events and the Sound Generator button.
- `object-wizard-step5-layout.js` separately rearranged the detail panel and injected layout rules.
- `object-wizard-asset-package.js` separately added ZIP controls and action-button sizing styles.
- `object-project-storage.js` separately introduced the new direct-save workflow.

PR #38 addressed the touched Step 5 ownership rather than adding another overlay/patch layer. Future corrections must continue to extend named owners rather than reintroducing installer/observer patch stacking.

## Temporary Files Created And Removed During V1.35 Work

The following were created during the pass and then removed rather than remaining active modules:

- `v1/src/object-wizard-sound-integration.js`
- `v1/src/object-wizard-step5-tools.js`
- `artifex/shared/sound-generator/sound-generator-ui.js`

Do not recreate these as new layering modules. Any future correction must be integrated into approved owners.

## Historical V1.35 Verification Checklist

The following checklist records what had to be investigated after the V1.35 review. Current actionable testing is stated in the V1.36 follow-up section below.

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

## V1.36 PR #38 follow-up — updated 2 June 2026 after merge

PR #38 was merged into `main` on 2 June 2026 at merge commit `ef4f37ebe5850c6367db59e57c01e2bb89949384`. V1.36 is therefore the current Object Creator runtime on `main`; it is no longer an open preview implementation.

The creator manually confirmed these visible UI changes in the PR preview before merge, and they are now accepted on `main`:

- repaired Step 5 Action Behaviour layout with no visible control/text overlap;
- working **Add Frame Event** row creation;
- click-to-fill behaviour for **Add Empty Frame Slot** while preserving slot order;
- enlarged saved-wizard crystal-ball icon without the unwanted circular button border/background.

The broader V1.36 save/finalisation lifecycle was merged before its full disposable-project validation was completed. It remains implemented on `main` but **requires post-merge validation before new Object Creator feature work**:

- Save Project (In Progress) must stage uploaded images without stripping visible/editable previews from the current browser session.
- File → Open Project Object must restore staged frame previews for continued Step 5 editing.
- Invalid Finish / Mark Object Ready must refuse readiness without writing final asset files or ready records.
- Valid finalisation must promote/register media and correctly map primary gameplay/portrait asset IDs to top-level visual fields.
- Multiple primary Gameplay Sprite or Dialogue Portrait images must be refused before fixed-path final output can overwrite files.
- Sound Generator stale-target assignment and per-frame correction persistence must be checked.
- Console/module health and absence of duplicate Step 5 controls must be checked.

This document remains the historical V1.35 review plus the dated V1.36 outcome; it does not claim that untested V1.36 lifecycle behaviour has passed.