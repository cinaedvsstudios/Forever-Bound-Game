# Artifex Global To Do

Status: Active global backlog after module/service documentation extraction  
Intended role: the single human-readable active task list for Artifex  
Index: `docs/artifex/0A-index-of-files.md`  
Universal contract: `docs/artifex/1A-project-file-contracts.md`

## How this document is used

This file owns outstanding work. It does not own permanent rules or module definitions.

Module/service specifications say what each module is and owns. `1A` says what all modules must obey. This file says what still needs to be done.

Rules:

- Do not reopen completed work only because an old todo or audit mentioned it.
- Do not maintain app-specific todo files as competing human backlogs.
- Treat open PR work as provisional until accepted.
- Keep browser localStorage as workspace/recovery state, not project truth.
- Keep ZIP/download/export as backup/interchange unless a module explicitly has no connected-project save yet.
- Archive old docs only after valid content has been transferred.
- Do not replace old non-`A` specs; create/use the controlled `A` spec and archive the old file later.

## Protected Baselines

| Area | Current controlled position | Protection rule |
|---|---|---|
| Documentation control | Active docs now run from `0A` through `18A`. | Do not create competing index, backlog or status docs. |
| Hub | Hub V1.1.4 captured in `3A`. | Do not treat older radial/wedge Portal plan as current. |
| Creation Guide | V1.1.12 captured in `4A`. | Starter creation and Initial Asset Intake Setup already exist. |
| Project Editor | v0.1.32 CONTRACT captured in `5A`. | Imported-index browser, linking, Stitcher and Health/Build Prep presentation already exist. |
| Scene Editor | v0.37-control-state-inspector-retention captured in `6A`. | Do not revive completed v0.35-v0.37 stabilisation work. |
| Quest Builder | V1.2.12 captured in `7A`. | Do not list current connection/grid/routing/export foundations as missing. |
| Archetype Object Creator | V1.36 captured in `8A`. | Lifecycle implementation exists but still needs disposable-project validation before feature work. |
| Effect Editor | INDEX2-CLEAN-0.2.6 captured in `9A`. | Rotation Direction, Orbital Force, ALL CAPS, Gravity/Boost, Brush/Shape Library and width braces are already present. |
| Asset Library | Contract captured in `10A`. | No complete standalone UI route is verified; treat it as final registered-asset ownership layer. |
| Shared Connected Project Folder Service | Captured in `11A`. | It owns folder/permission/project-relative read-write infrastructure, not module content. |
| Shared Active Project Service | Captured in `12A`. | Active project is selection/context, not proof of connected folder or loaded files. |
| Registered Content Service / Picker | Captured in `13A`. | It reads/selects registered records; it does not create them. |
| Shared Health Guide / Project Audit | Captured in `14A`. | It reports and assigns fix owners; it must not silently repair authored data. |
| Build Game | Captured in `15A`. | No complete standalone Build route is verified yet. |
| Runtime Engine / Playtest | Captured in `16A`. | Current evidence is boundary/planning plus local preview pieces, not completed shared runtime. |
| Puzzle Creator | V1.35 captured in `17A`. | Labyrinth Maze is implemented; other modules are planning placeholders. |
| Sound Generator / Sound Library | Captured in new `18A`; old `22` is source evidence. | PR #46 Sound Library work remains provisional until accepted. |

## All Apps / Shared Platform

Priority: highest  
Status: ongoing

- Use `0A`, `1A`, `2A` and the active `A` specs as the controlled documentation set.
- Archive or reduce old docs only after confirming their valid content is represented in active docs.
- Check code dependencies before retiring machine-readable task files such as `artifex/shared/todo-guide/all-apps-todos.json`.
- Reconcile open documentation PRs #40 and #44 so they do not become parallel current authorities.
- Keep PR #46 protected as active Sound work until accepted/merged or deliberately rejected.
- Standardise shared header/menu/version/chrome behaviour across apps through separate implementation passes.
- Standardise connected-folder save-state, unsaved-navigation guard and local-draft warnings across authoring apps.
- Build shared project-reference indexing so modules can show real usage of assets, objects, effects, scenes, quests, puzzles, routes and portal endpoints.
- Build and validate the populated Template Game connected reference project after connected save/reference systems are reliable.

## Hub / Artifex Portal

Specification: `docs/artifex/3A-hub-artifex-portal.md`

- Rename transitional Hub labels where they imply the wrong module owner, especially Puzzle/Asset wording.
- Resolve final displayed naming for Object Creator / Archetype Object Creator.
- Reconcile browser-local active-project handoff with the Shared Active Project Service.
- Apply shared shell/header refinements later.
- Archive `docs/artifex/11-portal-hub.md` after acceptance and verification.

## Creation Guide

Specification: `docs/artifex/4A-creation-guide.md`

- Add working Recommended Starting Media checklist.
- Add project-logo flow from intake source through Asset Library promotion to registered display reference.
- Extend readiness/Health reporting for real recommended-media and invalid logo-reference status.
- Consolidate layered V1.1.12 implementation only through a focused versioned implementation pass.
- Reconcile browser-local project handoff with Shared Active Project Service.
- Add Template Game choice only after populated connected-reference proof passes.
- Archive or reduce old Creation Guide docs after acceptance.

## Project Editor

Specification: `docs/artifex/5A-project-editor.md`

- Implement connected-folder load/save for Project Editor-owned structural files and indexes.
- Keep browser drafts and ZIP export as recovery/fallback.
- Migrate Project Manager wording/scopes/files through backward-compatible handling.
- Confirm/fix Effect Editor menu destination to protected `index2.html`.
- Extend live connected-reference and gate validation.
- Replace placeholder route-playtest only when Runtime/Playtest interface exists.
- Archive old split-plan docs after acceptance.

## Scene Editor

Specification: `docs/artifex/6A-scene-editor.md`

- Implement connected-project scene/screen loading, direct saving and typed index registration.
- Display canonical project-file/local-draft/conflict/permission status.
- Replace fixed-manifest/path-only placement with stable registered Asset/Object/Effect references.
- Add Sound Library ambience/source/transition selection after Sound foundation acceptance.
- Define Scene Events, Triggers and portal linking after save/reference foundations are reliable.
- Archive old Scene Editor status/plan docs after acceptance.

## Quest Builder

Specification: `docs/artifex/7A-quest-builder.md`

- Align Quest/Sidequest export/index output with canonical typed collections.
- Implement connected-project load/save/save-state/conflict handling.
- Correct live Project Manager navigation wording/route to Project Editor.
- Implement structured action/condition/outcome/dialogue/Capra authoring and validation.
- Add dynamic workspace expansion and Insert Space layout tools.
- After Puzzle Creator canonical saving exists, add real `Puzzle` block using required `puzzleId`.
- Add registered Sound Library selectors after Sound foundation acceptance.
- Add Test Quest only through confirmed Runtime/Playtest support.
- Archive or reduce overlapping Quest Builder docs after acceptance.

## Archetype Object Creator

Specification: `docs/artifex/8A-archetype-object-creator.md`

Mandatory validation before further feature work:

- Test Save Project (In Progress) with uploaded images: project JSON must use staging paths and no browser `dataUrl`.
- Test Open Project Object for an `in_progress` object and staged media rehydration.
- Test invalid Finish / Mark Object Ready and confirm no final writes occur.
- Test valid finalisation and confirm final media promotion, `asset_` registration and top-level gameplay/portrait mapping.
- Test multiple primary Gameplay Sprite or Dialogue Portrait images and confirm refusal before overwrite.
- Test stale-target sound assignment.
- Test per-frame correction persistence through save/reopen/export/import/finalisation.
- Confirm no duplicate Step 5 controls, module-load failures or console errors.

Follow-up:

- Split large `editor-ui.js` only after validation and separately from repair work.
- Complete real Scene/Quest/Puzzle reference listing after shared reference index exists.
- Adopt Sound Library object sounds after Sound foundation acceptance.
- Archive Object Creator old docs and historical patch evidence after acceptance.

## Effect Editor

Specification: `docs/artifex/9A-effect-editor.md`

- Implement canonical connected-project save/status/index workflow for `archetypes/effect-index.json` and `archetypes/effects/archeffect_<slug>.json`.
- Add project-backed Effect Library for saved FX Archetypes.
- Replace session/repository-only texture, overlay, icon and thumbnail dependencies with final registered asset references where required.
- Add visible Degree Range cone/spread guide.
- Decide whether to integrate inactive `v327-my-settings.js` pinned-controls panel.
- Expose visible text Once / Loop / Continuous controls and validate text performance.
- Review Atmosphere Volume prototype before production fog/mist/haze decision.
- Scope additional FX engines and preset polish from current Index2 only.
- Add registered sound cues after Sound foundation and final FX schema owner are confirmed.
- Archive or reduce superseded Effect Editor docs after acceptance.

## Asset Library

Specification: `docs/artifex/10A-asset-library.md`

- Create or confirm Asset Library UI/service for final `asset_` browsing, grouping, promotion and metadata editing.
- Implement safe promotion from `intake/` to final `assets/` files and `assets/asset-index.json`.
- Keep intake references out of permanent authored content.
- Support Creation Guide logo/media readiness.
- Support Object Creator finalisation without making Object Creator the general importer.
- Support Effect Editor registered texture, overlay, icon, brush, thumbnail and audio dependencies.
- Support Scene Editor, Quest Builder and Puzzle Creator registered media selection.
- Add canonical imported-audio promotion for accepted audio formats.
- Ensure Health and Build can validate final asset records and files.
- Archive or reduce `docs/artifex/20-asset-intake-workflow.md` after acceptance.

## Shared Connected Project Folder Service

Specification: `docs/artifex/11A-shared-connected-project-folder-service.md`

- Expand adoption beyond Creation Guide and Object Creator.
- Standardise permission, re-authorisation, save-state and navigation-guard UI.
- Implement project-file changed/conflict detection.
- Ensure all writes use project-relative paths only.
- Prevent modules from silently falling back to local-only saves when connected save is expected.
- Validate `project.json` identity with Shared Active Project Service.

## Shared Active Project Service

Specification: `docs/artifex/12A-shared-active-project-service.md`

- Formalise stable API beyond direct localStorage access.
- Bind active project selection safely to connected folder identity.
- Validate selected project metadata against `project.json`.
- Prevent apps from showing unrelated demo/default state when an active project exists.
- Add project-switch guards for unsaved local-only work.
- Reconcile stale/missing browser project-library entries.
- Standardise visible active project context across apps.

## Registered Content Service / Picker

Specification: `docs/artifex/13A-registered-content-service-picker.md`

- Adopt shared picker consistently in Scene Editor, Quest Builder, Asset Library, Effect Editor and Project Editor where appropriate.
- Add project reference/usage reporting through shared reference index.
- Add file-existence validation where needed without making picker the Health owner.
- Support Portal and scatter-decoration registered selections if approved.
- Keep every new selectable kind tied to an explicit owner and canonical index.

## Shared Health Guide / Project Audit

Specification: `docs/artifex/14A-shared-health-guide-project-audit.md`

- Expand shared checks across all canonical project files and module indexes.
- Integrate Creation Guide readiness checks with shared Health.
- Integrate connected-folder permission/save/conflict state.
- Integrate registered-content validation and shared project reference index.
- Define writing/reading of `health/latest-health-report.json`.
- Migrate task output to Project Editor naming with legacy recovery.
- Feed Build Game validation without making Build Game the authoring owner.
- Display fix owner and next action consistently.

## Build Game

Specification: `docs/artifex/15A-build-game.md`

- Create or confirm Build Game app/service.
- Define `build/runtime-project.json` and `build/build-manifest.json` schemas.
- Consume Shared Health and run stricter final build validation.
- Validate canonical indexes, record references and final assets.
- Reject permanent intake references.
- Detect unsaved local-only or stale source conditions where possible.
- Generate runtime-ready output under `build/`.
- Prove workflow through Template Game before production use.

## Runtime Engine / Playtest

Specification: `docs/artifex/16A-runtime-engine-playtest.md`

- Confirm runtime/playtest route and architecture.
- Define preview/test entry points from Project Editor, Scene Editor, Quest Builder, Puzzle Creator and Build Game.
- Keep Playtest temporary state separate from authored project files.
- Implement safe fake flags/items/location/player-state override system.
- Read saved connected-project content or explicit test packages, not unrelated demo data.
- Support future generated audio playback and registered final assets.
- Prove with Template Game.

## Puzzle Creator

Specification: `docs/artifex/17A-puzzle-creator.md`

- Implement canonical connected-project puzzle save/index registration.
- Define final puzzle record schema and public puzzle result contract.
- Coordinate Quest Builder `Puzzle` block and `puzzleId` selection after saved puzzle records exist.
- Implement Secondary Light Set / coverage fill if still approved.
- Render linked Door visuals and Scatter visual/light assets in playable preview.
- Implement Portal registered visual/effect selection and global endpoint registry integration.
- Implement Completion Rule enforcement in Walk Test/game runtime.
- Implement Traboule, Foe, Hazard, Tunnel Mode, first-person/3D and helper systems only in scoped passes.
- Build non-Maze puzzle engines separately; do not present placeholders as completed editors.
- Add registered sound feedback after Sound foundation acceptance.
- Reconcile open PR #44 rather than merging it as competing authority.

## Sound Generator / Sound Library

Specification: `docs/artifex/18A-sound-generator-sound-library.md`

- Decide and merge or reject PR #46 Sound Library selector architecture.
- Finish/confirm shared Sound Library modal over registered audio assets.
- Finish imported-audio promotion through Asset Library.
- Adopt Choose Sound / Create Synth Sound / Save and Assign Here hooks in Object Creator, Scene Editor, Puzzle Creator, Quest Builder and Effect Editor through separate owner-led passes.
- Validate initiating-target capture in each caller integration.
- Implement runtime/playtest playback of procedural-synth recipe assets where needed.
- Extend Health and Build validation for generated audio.
- Add at least one generated procedural sound to Template Game once involved systems are ready.
- Archive old `docs/artifex/22-sound-archetype-generator.md` after `18A` acceptance and PR #46 reconciliation.

## Documentation / PR Reconciliation Queue

| PR / document area | Current interpretation | Action |
|---|---|---|
| PR #50 | Documentation extraction PR should now cover `3A` through `18A`. | Update title/body and reconcile branch before merge. |
| PR #40 | Scene/Effect status refresh. | Do not merge as parallel authority; capture unique Effect details if any remain. |
| PR #44 | Puzzle V1.34 documentation refresh. | Reconcile/close after `17A`; V1.35 and `17A` supersede it. |
| PR #46 | Sound Library / Create Synth work. | Keep protected; decide after review/merge. |
| Old non-A docs | Source evidence only after extraction. | Archive or reduce to local pointers after acceptance. |

## Completion Checkpoint

The active documentation extraction pass has produced or updated the controlled specifications through Sound Generator / Sound Library. The remaining work is implementation, validation, archive/reconciliation and PR cleanup, not more first-pass module extraction.
