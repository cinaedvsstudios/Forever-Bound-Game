# Scene Editor audit — 2026-05-28

## Version decision

Chosen official version for this pass: `v0.29-title-cache-sync`.

Reason: `scene-editor-v2.js` still owns the runtime `VERSION` constant and already declares `v0.29-title-cache-sync`. To avoid reconstructing or rewriting the large core file just to change one constant, `index.html` was synced back to the internal runtime version. This makes the page title, cache keys, subtitle/status/toast source, and core runtime version agree again.

Fresh test URL:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.29-title-cache-sync`

## Reference docs checked

- `docs/artifex/18-color-and-display-rules.md`
- `docs/artifex/19-project-file-contracts.md`
- `artifex/shared/todo-guide/README.md`
- `artifex/shared/todo-guide/all-apps-todos.json`
- `artifex/shared/todo-guide/scene-editor-cleanup-handoff-2026-05-27.md`

## Current live files checked

- `artifex/apps/scene-editor/index.html`
- `artifex/apps/scene-editor/scene-editor-v2.js`
- `artifex/apps/scene-editor/scene-editor-menu-controller.js`

## Aligned / improved

### 1. Version/cache sync restored

`index.html` now uses `v0.29-title-cache-sync` for the document title, stylesheet cache keys, and script cache keys. This matches the runtime `VERSION` constant in `scene-editor-v2.js`.

### 2. Completed module cleanup remains good

The previous cleanup batch is complete. Permanent files are now loaded for transform controls, offscreen placement, and value sliders:

- `scene-editor-transform-controls.js`
- `scene-editor-offscreen-placement.js`
- `scene-editor-value-sliders.js`
- `scene-editor-value-sliders.css`

The old numbered equivalents were deleted after testing:

- `scene-editor-v15-guard.js`
- `scene-editor-v22-offscreen-placement.js`
- `scene-editor-v18-value-sliders.js`
- `scene-editor-v18-value-sliders.css`

### 3. Entry shell is reasonably thin

`index.html` is now only a shell that loads styles and scripts. That aligns with the project-file contract requirement that active entry files remain thin.

### 4. Visual tone mostly aligns

The Scene Editor still uses the Artifex brand images, dark editor chrome, bronze/copper surfaces, purple module accent behaviour, and compact dense editor controls. This is broadly aligned with the colour/display rules.

## Not aligned / still needs work

### A. Header layout is not yet fully standard

The standard header order is meant to be:

`Logo / app title → version pill → vertical divider → main menu`

Current Scene Editor behaviour still uses the brand image plus a subtitle-style version line rather than a compact version pill immediately after the app title. It also has the manual-save button before the divider. This is acceptable for now because it works, but it is not the final shared app-shell standard.

Recommended fix later: create a proper permanent Scene Editor header shell that puts a compact version pill after the title and before the divider.

### B. Required shared Module menu is missing

The shared Module menu order must be:

1. Hub
2. Creation Guide
3. Project Manager
4. Scene Editor
5. Quest Builder
6. Puzzle Creator
7. Effect Editor
8. Archetype Object Creator

The current `scene-editor-menu-controller.js` creates File, Edit, View, Effects, and Help menus, but it does not create a Module menu or flyout. This is a direct mismatch with the all-apps module-menu standard.

Recommended fix next: add a Module menu/flyout with exactly the required eight entries and no extra utility apps.

### C. Active project integration is not complete

`index.html` loads `../../shared/active-project/active-project-client.js`, but the Scene Editor core still behaves primarily as a local JSON editor. The all-apps todo says every app must actually open/adopt the active project, not merely load or display active-project information.

Recommended fix later: Scene Editor should read the active project via the shared active project client, load/select project scene/screen files, and stop defaulting to loose local JSON behaviour when an active project is available.

### D. Scene/package file contract is not complete

The project-file contract says Scene Editor should output proper scene/screen records into the project package, with scene/screen indexes, stable IDs, and references that Project Manager can consume. Current Scene Editor still imports and downloads loose JSON, and object placement mostly uses loose image paths rather than object archetype instance IDs.

Recommended fix later: add real package export/import support for:

- `scenes/scene-index.json`
- `scenes/scene_<slug>.json`
- `screens/screen-index.json`
- `screens/screen_<slug>.json`
- `objinst_` scene instances that can reference `archobj_` object archetypes
- `fxinst_` scene instances that can reference `archeffect_` effect archetypes

### E. Patch/module debt is reduced but not gone

The worst numbered cleanup files from this batch are gone, but `index.html` still loads several version-numbered helper/controller modules:

- `scene-editor-v11-helper.js`
- `scene-editor-v15-helper.js`
- `scene-editor-v20-card-controller.js`
- `scene-editor-v21-visual-adjustments.js`
- `scene-editor-v23-aspect-controls.js`
- `scene-editor-v24-object-preview.js`

Some of these may now be real feature modules, but their names still look like patch-era files. The project-file contract says temporary patches should be integrated, converted to normal helper/app modules, removed, or archived.

Recommended fix later: audit each remaining numbered helper and either rename it to a permanent feature name or merge it into the correct owning module.

### F. `scene-editor-v2.js` is still a mixed-responsibility core file

The file is under 500 lines, which is not automatically forbidden, but it mixes state, rendering, form binding, local save/restore, import/export, stage rendering, drag logic, and the global core API. This is acceptable as a legacy core for now, but it is not the long-term split-app structure recommended by the project-file contract.

Recommended fix later: split the core into permanent modules such as:

- `scene-editor-state.js`
- `scene-editor-renderer.js`
- `scene-editor-ui-bindings.js`
- `scene-editor-io.js`
- `scene-editor-stage-drag.js`
- `scene-editor-core-api.js`

### G. Tooltips are incomplete

The colour/display rules say every button, icon-only control, slider, select, and important input should have a tooltip via the `title` attribute. Scene Editor uses `data-tip` in some places, but the menu controller creates buttons without `title` attributes.

Recommended fix later: add `title` text to the generated menu buttons/items and gradually audit controls for missing tooltip coverage.

### H. Shared app index still appears missing

The all-apps guide recommends maintaining `artifex/apps/app-index.json`. A repo search currently only finds that file name mentioned in the guide, not an actual app index file.

Recommended fix later: create `artifex/apps/app-index.json` and register active apps, including Scene Editor.

## Recommended next work order

1. Test the fresh URL after the version/cache sync.
2. Add the required Module menu/flyout to Scene Editor, using exactly the shared order and no extra apps.
3. Rename the remaining clearly-permanent numbered helper files one at a time, using the same test-first process.
4. Plan a later active-project integration pass.
5. Plan a later project-package import/export pass.
