# Scene Editor Specification

Status: Active module specification draft during documentation consolidation  
Owning module: Scene Editor  
Active route: `artifex/apps/scene-editor/index.html`  
Current verified implementation baseline: `Artifex Scene Editor · v0.37-control-state-inspector-retention` on current `main` commit `fecd879f0b04c02550a7fbb9a63f8a2733cd6f23`  
Accepted-baseline evidence: implementation PR #43 and merged accepted-baseline record PR #45  
Governing universal contract: `docs/artifex/1A-project-file-contracts.md`  
Outstanding work source: `docs/artifex/2A-global-to-do.md`

## Purpose

Scene Editor is the Artifex visual scene-and-screen authoring surface. It creates and edits the visual/layout content of scenes and screens: background presentation, layers, placed elements, UI elements, scene-level visual/audio settings and selected-object positioning, transform and appearance adjustments.

This specification owns permanent information unique to Scene Editor. Universal project-file, connected-folder, final registered-asset, cross-module reference, save-state and documentation-control rules remain owned by the master contract and later confirmed shared-service specifications.

## Ownership Boundary

Scene Editor owns:

- authored scene and screen visual/layout content;
- scene backgrounds, foreground/overlay layers, UI layout objects and placed scene elements;
- scene-level grid/presentation settings and scene-level audio-reference fields used by the visual scene record;
- selected-item placement, layer order, rotation, resizing, aspect handling, visibility and visual-adjustment presentation within the scene editor;
- local scene JSON import/template loading/download and browser working-copy presentation while those remain the implemented editing workflow;
- later writing its owned scene/screen files and typed scene/screen index entries once connected-project saving is implemented.

Scene Editor must not:

- define project-level navigation, route conditions, structural gates or start-flow meaning owned by Project Editor;
- author quest/sidequest internals, puzzle definitions, reusable object/effect archetype definitions or final Asset Library records;
- treat its fixed asset picker manifest as the final connected-project asset ownership system;
- treat its browser working copy or JSON download workflow as the permanent connected-project save mechanism;
- implement game-wide runtime/build behaviour merely because a scene is visually previewable;
- re-open completed v0.35–v0.37 ownership/stabilisation repairs as future feature work unless a new verified regression is found.

## Active Baseline

The live `artifex/apps/scene-editor/index.html` title and cache labels identify **v0.37-control-state-inspector-retention**. It loads the modular Scene Editor implementation through configuration, storage, scene model, IO, stage-drag, renderer, bindings, core API and app/bootstrap modules, followed by its current owned control/presentation modules.

The accepted-baseline record establishes that v0.37 supersedes status wording which treated `v0.34-live-acceptance-repair` as current or said ownership consolidation was still awaiting implementation. The accepted delivery chain is:

| Accepted delivery | Outcome now protected as complete |
|---|---|
| PR #37 / `v0.35-owner-consolidation` | Consolidated Object Inspector, transform, movement and UI ownership after the earlier wrong-object acceptance failure. |
| PR #41 / `v0.36-selection-display-clear-selection` | Corrected selected-object artwork display distortion and added Clear Selection. |
| PR #43 / `v0.37-control-state-inspector-retention` | Added colour-only Aspect Ratio Lock active-state feedback and retained Object Inspector scroll position while changing selected objects. |

| Current area | Baseline status | Current implementation fact |
|---|---|---|
| Modular live editor route | Implemented and accepted | `index.html` loads separated Scene Editor modules rather than the earlier single-page/legacy-helper arrangement. |
| Scene/screen data editing | Implemented in local JSON workflow | Scene model supports scene identity/type/tags, grid, background, layers, elements, UI collection and scene audio fields. |
| Stage and object placement | Implemented and stabilised | Placed visual items can be selected, moved, duplicated/deleted and organised in the scene. |
| Object Inspector / transforms | Implemented and stabilised | Current owner supports selected-item rotation/origin, resizing, wrap bounding box, aspect lock, skew/flip/depth and border presentation. |
| Visual adjustment/control presentation | Implemented | Current editor displays scene/object visual controls within the visual-authoring workflow. |
| Local working copy | Implemented | Browser localStorage stores settings, current working copy, download time and retained inspector layout state. |
| Import/template/download | Implemented | Imports JSON from hard drive or URL, loads editor templates and downloads edited scene JSON. |
| Active-project indicator | Partly implemented as presentation | Reads the shared active-project client for visible project context and a route back to choose a project; it does not save scene data into the active connected project. |
| Asset picker | Implemented against existing fixed manifest | Picks image assets from `../../assets-library/asset-library.json`; it is not yet a connected-project final registered-asset picker. |
| Direct connected-project scene/screen save and index registration | Not implemented | Remains integration work. |
| Project-file versus local-draft save state | Not implemented as canonical shared status | The visible editor currently reports local backup/download information rather than connected-folder save truth. |
| Scene Events / Triggers / portal contract | Not implemented | Remains later cross-app work after save/reference foundations exist. |

## Current Implemented Interfaces

### Current scene record editing model

The current scene model normalises or creates a scene record with visual-authoring areas including:

```text
id
name
mode / screenType
tags
background
backgroundScroll
grid
layers[]
elements[]
ui[]
audio { ambience, music, volume, loop, fadeIn, fadeOut }
```

This is current implementation evidence for what Scene Editor visibly edits. Canonical connected-project scene/screen file and index contracts must be confirmed through the project-file and module-integration work rather than inferred from the local editing model alone.

### Local workspace and draft state

The active implementation currently uses browser localStorage for local workflow information, including:

```text
artifex.sceneEditor.settings.v1
artifex.sceneEditor.workingCopy.v1
artifex.sceneEditor.lastDownload.v1
artifex.sceneEditor.objectInspector.layout.v1
artifex.sceneEditor.borderHidden.v1
```

The editor provides local backup restoration and records the last JSON download. These are valid current user-workflow features, but they do not represent a successful save into a connected project folder.

### Import, templates and JSON download

The current editor supports:

```text
New Blank Scene
New from Template
Import JSON from hard drive
Import JSON from URL
Download JSON
```

It also warns before replacing dirty scene state through a new import and offers download before continuing. This is current local-authoring/backup behaviour and must remain distinguishable from future direct project-folder save and conflict-handling behaviour.

### Existing asset-path selection interface

The current visual editor offers background/item asset-path selection and an Asset Library popup backed by:

```text
../../assets-library/asset-library.json
```

When an asset is selected, the editor writes its displayed path into the background or selected-item image path field and marks the local scene dirty. This picker is currently a visual placement convenience over the existing static manifest; it does not prove final registered-asset selection from the active connected project's `assets/asset-index.json`.

### Active project presentation boundary

The live route loads `../../shared/active-project/active-project-client.js` and the Scene Editor displays the selected project name/id when available. If no active project is present, it presents a choose-project action. The current implementation still performs local working-copy and download saving, not connected-project scene writes.

Scene Editor therefore has an active-project *presentation* interface in its accepted baseline, while active connected-project scene/screen loading, save-state reporting, direct owned-file writing and index registration remain open integration work.

## Current Compatibility and Transition Notes

`docs/artifex/04-scene-editor.md` contains valid high-level purpose/boundary material for visual scenes and screens, but it also carries older migration notes, earlier local-editor workflow descriptions and v3 patch notes that cannot act as the current runtime baseline after the accepted v0.37 implementation.

`artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md` and `artifex/apps/scene-editor/scene-editor-v034-failed-acceptance-and-consolidation-plan-2026-05-31.md` document intermediate modularisation and failed-acceptance/repair history. Their earlier blocker and consolidation requirements have been superseded by the accepted v0.37 chain and must not be reopened as pending work.

`artifex/apps/scene-editor/scene-editor-v037-accepted-baseline-2026-06-02.md` is the accurate accepted-baseline evidence used for this extraction. Once this single Scene Editor specification is approved and its still-live work remains in `2A`, the dated baseline/status record should be retained as historical evidence only or archived according to the approved documentation policy, rather than remaining a parallel current specification.

The currently visible editor can store scene audio paths and visual object/image paths, but stable final Asset Library/Sound Library references must be implemented under the shared connected-project/reference rules. Current path fields must not be mistaken for completion of registered-reference integration.

## Remaining Work

All current and future Scene Editor tasks are owned by `docs/artifex/2A-global-to-do.md`. This specification must not accumulate task checklists.