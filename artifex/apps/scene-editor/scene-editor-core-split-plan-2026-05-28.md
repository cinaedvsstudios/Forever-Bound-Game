# Scene Editor core split plan — 2026-05-28

## Purpose

This plan fixes the remaining Scene Editor architecture debt after the patch/rename cleanup batch.

The completed cleanup removed or renamed several badly named numbered support files, but it did not split the legacy core file:

`artifex/apps/scene-editor/scene-editor-v2.js`

That file is still the main runtime core. It is under the hard danger threshold, but it mixes too many responsibilities: version state, local storage, scene model, rendering, imports, exports, form bindings, stage rendering, drag logic, and the public `window.ArtifexSceneEditorCore` API.

The goal is to split that file into clear permanent modules without breaking the currently working editor.

## Rules for this split

1. No placeholder files.
2. No manual reconstruction from truncated connector output.
3. No third messy attempt after two failures; any blocked item gets marked blocked and moved to agent/local-file workflow.
4. Do not change behaviour while moving code unless that pass explicitly says it is a behaviour change.
5. One small extraction at a time.
6. After each extraction, test the fresh URL before deleting or disabling the old code path.
7. Keep only one owner for a behaviour. Do not leave two active systems doing the same thing.
8. Keep the shared Module menu order exact and do not add utility apps to the core Module menu.
9. Keep version labels and cache keys synchronized after every code change.

## Current known version

Official version for the current stable state:

`v0.29-title-cache-sync`

Fresh test URL:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.29-title-cache-sync`

## Target file structure

The Scene Editor should move toward this permanent structure:

```text
artifex/apps/scene-editor/
  index.html
  scene-editor.css
  context-menu.css
  scene-editor-panel-stage.css
  scene-editor-control-cards.css
  scene-editor-value-sliders.css
  scene-editor-ui-polish.css

  scene-editor-app.js                 # bootstrap / app coordinator
  scene-editor-config.js              # version, constants, paths, type options
  scene-editor-state.js               # scene state, selection state, settings state
  scene-editor-storage.js             # localStorage settings, backup, download stamp
  scene-editor-scene-model.js         # blank scene, normalize, item lookup, object mutations
  scene-editor-renderer.js            # shell rendering, side panel rendering, stage rendering
  scene-editor-bindings.js            # DOM event binding for forms/buttons/menus
  scene-editor-stage-drag.js          # core move-drag only
  scene-editor-io.js                  # import file, import URL, templates, download JSON
  scene-editor-core-api.js            # window.ArtifexSceneEditorCore public bridge

  scene-editor-menu-controller.js
  scene-editor-transform-controls.js
  scene-editor-value-sliders.js
  scene-editor-offscreen-placement.js
  scene-editor-v11-helper.js          # audit/rename later
  scene-editor-v15-helper.js          # audit/rename later
  scene-editor-v20-card-controller.js # audit/rename later
  scene-editor-v21-visual-adjustments.js # audit/rename later
  scene-editor-v23-aspect-controls.js # audit/rename later
  scene-editor-v24-object-preview.js  # audit/rename later
```

The exact filenames can change if a clearer name appears during implementation, but every module needs one clear responsibility.

## Current responsibility map for `scene-editor-v2.js`

### Config / constants

Currently includes:

- `VERSION`
- localStorage key names
- app root lookup
- repo prefix
- brand logo/title paths
- template manifest path
- `typeOptions`

Target module:

`scene-editor-config.js`

### Local storage and persistence

Currently includes:

- `loadSettings()`
- `saveSettings()`
- `safeParse()`
- `readWorkingCopy()`
- `readDownloadStamp()`
- `saveWorkingCopy()`
- `saveWorkingCopySoon()`
- `manualSaveLocal()`
- `markDownloaded()`

Target module:

`scene-editor-storage.js`

### Scene model and mutations

Currently includes:

- `blankScene()`
- `key()`
- `allItems()`
- `real()`
- `bgPath()`
- `setBgPath()`
- `normalize()`
- `addElement()`
- `addLayer()`
- `duplicateSelected()`
- `removeSelected()`
- `applyPath()`

Target module:

`scene-editor-scene-model.js`

### Rendering

Currently includes:

- `render()`
- `renderWorkAreaOnly()`
- `titleBar()`
- `card()`
- `controlPanel()`
- `input()`
- `typeSelect()`
- `pathInput()`
- `basics()`
- `background()`
- `elements()`
- `selectedForm()`
- `workArea()`
- `blankMessage()`
- `gridLabels()`
- `stageItem()`
- `templateModal()`
- `contextMenu()`
- `filePill()`
- `resumeMarkup()`

Target module:

`scene-editor-renderer.js`

### DOM bindings

Currently includes:

- `bind()`
- `bindZoomControls()`
- `bindSceneFields()`
- `bindPathButtons()`
- `bindContextActions()`
- `bindStage()`
- document-level close handlers
- window load toast handler

Target module:

`scene-editor-bindings.js`

### Stage drag

Currently includes:

- `stageNodeFor()`
- `syncSelectedInputs()`
- `startCoreMoveDrag()`
- `updateCoreMoveDrag()`
- `endCoreMoveDrag()`
- `wireCoreMoveDrag()`

Target module:

`scene-editor-stage-drag.js`

### Import/export IO

Currently includes:

- `importFile()`
- `importUrl()`
- `openTemplates()`
- `loadTemplate()`
- `download()`

Target module:

`scene-editor-io.js`

### Public API bridge

Currently includes:

- `window.ArtifexSceneEditorCore = { ... }`

Target module:

`scene-editor-core-api.js`

## Implementation phases

### Phase 0 — stop and verify baseline

Before editing code:

1. Open the fresh URL.
2. Confirm title/subtitle/status/toast show `v0.29-title-cache-sync`.
3. Load or restore a scene.
4. Select, drag, resize, rotate, skew, use value sliders, and download JSON.
5. Confirm no missing-file console errors.

No code changes in this phase.

### Phase 1 — add config module only

Create:

`scene-editor-config.js`

Move only constants that do not mutate:

- version
- storage keys
- app path constants
- brand paths
- template manifest path
- type options

Expose as:

`window.ArtifexSceneEditorConfig`

Then update `scene-editor-v2.js` to read the config object.

Risk: low.

Test after phase:

- page title
- subtitle/status/toast version
- import templates
- brand images
- existing cache keys

### Phase 2 — extract storage helpers

Create:

`scene-editor-storage.js`

Move storage-only helpers:

- settings read/write
- safe JSON parse
- working copy read/write
- download stamp read/write

Expose as:

`window.ArtifexSceneEditorStorage`

Do not move UI toast behaviour yet. `manualSaveLocal()` may stay in core until renderer/state split is ready because it touches status, toast, scene, render, and storage together.

Risk: low to medium.

Test after phase:

- collapse cards survives refresh
- local backup saves
- open local backup still works
- download stamp updates

### Phase 3 — extract scene model helpers

Create:

`scene-editor-scene-model.js`

Move pure or mostly pure scene helpers first:

- blank scene creation
- key lookup
- bg path read/write
- item lookup helpers
- clone/normalize helpers if they can receive state explicitly

Keep UI-touching mutation functions in core until bindings are ready.

Preferred shape:

```js
window.ArtifexSceneEditorModel = {
  blankScene,
  keyForKind,
  allItemsFromScene,
  findItem,
  bgPath,
  setBgPath,
  normalizeScene
};
```

Risk: medium because many functions depend on shared closure state.

Test after phase:

- blank scene
- import file
- import template
- object list
- selected object
- background path

### Phase 4 — extract IO helpers

Create:

`scene-editor-io.js`

Move import/export operations only after model/storage are stable:

- import local file
- import URL
- open template list
- load template
- download JSON

Do not change file format yet. This phase is only moving existing loose JSON behaviour.

Risk: medium.

Test after phase:

- import JSON from disk
- import URL if available
- import template
- download JSON
- local backup after import/download

### Phase 5 — extract stage drag

Create:

`scene-editor-stage-drag.js`

Move only core move-drag behaviour:

- selected node lookup
- sync selected X/Y inputs
- start drag
- update drag
- end drag
- wire drag listeners

It must continue to coordinate cleanly with:

- `scene-editor-offscreen-placement.js`
- `scene-editor-transform-controls.js`
- `scene-editor-value-sliders.js`

Risk: medium to high because drag has event-order interactions.

Test after phase:

- object selection
- move handle drag
- offscreen drag behaviour
- X/Y field updates
- resize handles
- rotate handle
- no duplicate drag conflict

### Phase 6 — extract renderer

Create:

`scene-editor-renderer.js`

Move markup generation in groups:

1. small helpers: `esc`, `input`, `card`, `typeSelect`, `pathInput`
2. side-panel/card renderers
3. stage renderers
4. modal/context renderers
5. full `render()` and `renderWorkAreaOnly()` last

Risk: high because nearly every feature depends on render output IDs/classes.

Test after phase:

- all panels render
- card collapse state
- object list selection
- selected details form
- stage labels/grid
- context menu
- template modal
- no missing controls used by other helper modules

### Phase 7 — extract DOM bindings

Create:

`scene-editor-bindings.js`

Move binding logic only after renderer is stable.

Risk: high because binding depends on generated IDs and event order.

Test after phase:

- import menu
- template modal
- file import
- background path controls
- item fields
- layer pill
- delete selected
- zoom controls
- card toggles
- context menu actions

### Phase 8 — create app coordinator and public API module

Create:

`scene-editor-app.js`

Create:

`scene-editor-core-api.js`

The app coordinator should own boot order and state wiring. The public API module should expose only the stable methods that other modules need:

- `getVersion()`
- `getScene()`
- `getSelectedId()`
- `getSelectedKind()`
- `getSelectedItem()`
- `getAllItems()`
- `select()`
- `render()`
- `renderWorkAreaOnly()`
- `saveWorkingCopy()`
- `saveWorkingCopySoon()`
- `clamp()`
- `toast()`

After this phase, `scene-editor-v2.js` should either be deleted or reduced to a tiny compatibility loader and then renamed permanently.

Risk: high.

Test after phase:

- full regression checklist
- all dependent modules still read `window.ArtifexSceneEditorCore`
- no load-order errors

## Load order target

When the split is complete, `index.html` should load approximately:

```html
<script src="../../shared/active-project/active-project-client.js?v=1.0.0"></script>
<script src="./scene-editor-config.js?v=v0.29-title-cache-sync"></script>
<script src="./scene-editor-storage.js?v=v0.29-title-cache-sync"></script>
<script src="./scene-editor-scene-model.js?v=v0.29-title-cache-sync"></script>
<script src="./scene-editor-renderer.js?v=v0.29-title-cache-sync"></script>
<script src="./scene-editor-io.js?v=v0.29-title-cache-sync"></script>
<script src="./scene-editor-stage-drag.js?v=v0.29-title-cache-sync"></script>
<script src="./scene-editor-bindings.js?v=v0.29-title-cache-sync"></script>
<script src="./scene-editor-core-api.js?v=v0.29-title-cache-sync"></script>
<script src="./scene-editor-app.js?v=v0.29-title-cache-sync"></script>
```

Then existing feature modules can load after the core API exists:

```html
<script src="./scene-editor-transform-controls.js?v=v0.29-title-cache-sync"></script>
<script src="./scene-editor-value-sliders.js?v=v0.29-title-cache-sync"></script>
<script src="./scene-editor-offscreen-placement.js?v=v0.29-title-cache-sync"></script>
<script src="./scene-editor-menu-controller.js?v=v0.29-title-cache-sync"></script>
```

The exact order may need adjustment during testing.

## Regression checklist after every phase

Minimum test set:

1. Load fresh URL.
2. Confirm version in browser title, subtitle, status/toast.
3. Restore local backup if available.
4. Import template.
5. Import local JSON.
6. Select object.
7. Move object with centre/move handle.
8. Drag object partly offscreen.
9. Resize handles work.
10. Rotate handle works.
11. Origin marker remains correct.
12. Red-dot value sliders work.
13. Reset buttons work.
14. X/Y/W/H fields update stage object.
15. Layer/object list selection works.
16. Context menu duplicate/delete works.
17. Download JSON works.
18. Refresh and confirm local backup still appears.
19. Confirm no missing script/style files.
20. Confirm no duplicate behaviour from old and new modules.

## Blocker handling

If a phase cannot be done safely through the GitHub connector because a full file cannot be read or replaced safely:

- stop immediately;
- do not create placeholders;
- mark the phase blocked in this plan or a handoff note;
- use uploaded local full-file copies, agent/Codex mode, or a proper local branch workflow.

## Recommended immediate next step

Start with Phase 1 only: create `scene-editor-config.js`, update `scene-editor-v2.js` to consume it, update `index.html`, test, and stop.

Do not attempt renderer or drag extraction until config and storage extraction are stable.
