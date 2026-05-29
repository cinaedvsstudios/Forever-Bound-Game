# Scene Editor cleanup and core split report — 2026-05-29

## Starting state

- Repository branch: `work`.
- Starting HEAD before this task's edits: `4cc73b0 Index2 v0.1.5 add file search and effect controls`.
- Baseline live version supplied by task: `v0.29-title-cache-sync`.
- Baseline live URL supplied by task: `https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.29-title-cache-sync-restore-core`.
- Existing archive folder reused: `artifex/apps/scene-editor/archive/legacy-2026-05-28/`.

## Task commits

1. `8041e97 Archive unused scene editor legacy files`
2. `af31c50 Split scene editor core modules`

## Changed files

- `artifex/apps/scene-editor/index.html`
- `artifex/apps/scene-editor/scene-editor-config.js`
- `artifex/apps/scene-editor/scene-editor-storage.js`
- `artifex/apps/scene-editor/scene-editor-v2.js`
- `artifex/apps/scene-editor/scene-editor-scene-model.js`
- `artifex/apps/scene-editor/scene-editor-io.js`
- `artifex/apps/scene-editor/scene-editor-stage-drag.js`
- `artifex/apps/scene-editor/scene-editor-renderer.js`
- `artifex/apps/scene-editor/scene-editor-bindings.js`
- `artifex/apps/scene-editor/scene-editor-core-api.js`
- `artifex/apps/scene-editor/scene-editor-app.js`
- `artifex/apps/scene-editor/scene-editor-core-split-todos.json`
- `artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md`
- Archived legacy files listed below.

## Archived files

Moved to `artifex/apps/scene-editor/archive/legacy-2026-05-28/`:

- `dropdown-fix.js`
- `scene-editor.js`
- `scene-editor-v3-helper.js`
- `scene-editor-v13-helper.js`
- `scene-editor-v13e-helper.js`
- `scene-editor-v14-helper.js`
- `scene-editor-v14c-helper.js`
- `recovered-proposed-feature-list.md`

Already archived before this task and left there:

- `context-fix.js`
- `scene-editor-v12-helper.js`
- `scene-editor-v12b-helper.js`
- `scene-editor-v13d-helper.js`
- `scene-editor-v23-aspect-controls.css`

## Created modules

- `scene-editor-scene-model.js` — scene data helpers, normalisation, collection lookup, selected-item lookup, background path data mutation, defaults, duplicate/remove, path application.
- `scene-editor-io.js` — local file import, URL import, template manifest load, template load, JSON download, date formatting.
- `scene-editor-stage-drag.js` — existing core move-handle/centre-drag wiring and pointer lifecycle.
- `scene-editor-renderer.js` — markup/render helpers, shell, stage/work area, cards, context menu, template modal, file pill, resume markup.
- `scene-editor-bindings.js` — DOM event and form bindings.
- `scene-editor-core-api.js` — stable `window.ArtifexSceneEditorCore` compatibility bridge factory.
- `scene-editor-app.js` — app/state coordinator that consumes config, storage, model, IO, renderer, bindings, stage drag, and core API modules.

`scene-editor-v2.js` remains loaded as a small bootstrap/compatibility shell.

## Renamed modules

No active runtime modules were renamed in this task.

## Deleted active-folder files

The only files removed from the active app folder were archived unused legacy files. No file loaded by `index.html` was deleted or archived.

## Final index.html active load list

CSS:

1. `./scene-editor.css?v=v0.30-scene-core-split`
2. `./context-menu.css?v=v0.30-scene-core-split`
3. `./scene-editor-panel-stage.css?v=v0.30-scene-core-split`
4. `./scene-editor-control-cards.css?v=v0.30-scene-core-split`
5. `./scene-editor-value-sliders.css?v=v0.30-scene-core-split`
6. `./scene-editor-ui-polish.css?v=v0.30-scene-core-split`

JavaScript:

1. `../../shared/active-project/active-project-client.js?v=1.0.0`
2. `./scene-editor-config.js?v=v0.30-scene-core-split`
3. `./scene-editor-storage.js?v=v0.30-scene-core-split`
4. `./scene-editor-scene-model.js?v=v0.30-scene-core-split`
5. `./scene-editor-io.js?v=v0.30-scene-core-split`
6. `./scene-editor-stage-drag.js?v=v0.30-scene-core-split`
7. `./scene-editor-renderer.js?v=v0.30-scene-core-split`
8. `./scene-editor-bindings.js?v=v0.30-scene-core-split`
9. `./scene-editor-core-api.js?v=v0.30-scene-core-split`
10. `./scene-editor-app.js?v=v0.30-scene-core-split`
11. `./scene-editor-v2.js?v=v0.30-scene-core-split`
12. `./scene-editor-v11-helper.js?v=v0.30-scene-core-split`
13. `./scene-editor-transform-controls.js?v=v0.30-scene-core-split`
14. `./scene-editor-v15-helper.js?v=v0.30-scene-core-split`
15. `./scene-editor-value-sliders.js?v=v0.30-scene-core-split`
16. `./scene-editor-v20-card-controller.js?v=v0.30-scene-core-split`
17. `./scene-editor-v21-visual-adjustments.js?v=v0.30-scene-core-split`
18. `./scene-editor-offscreen-placement.js?v=v0.30-scene-core-split`
19. `./scene-editor-v23-aspect-controls.js?v=v0.30-scene-core-split`
20. `./scene-editor-v24-object-preview.js?v=v0.30-scene-core-split`
21. `./scene-editor-menu-controller.js?v=v0.30-scene-core-split`

## Active numbered runtime module audit

| File | Responsibility | Uses `window.ArtifexSceneEditorCore` | Renderer ID/class dependencies | Recommendation |
| --- | --- | --- | --- | --- |
| `scene-editor-v11-helper.js` | Asset library picker, image path helper buttons, wrap image, import warning/dirty markers. | No direct core API usage found; mostly DOM based. | Depends on path-menu, image fields, import controls, selected item/stage selectors, toast/status classes. | Retain for now; later rename/integrate as asset-picker/path-tools module. |
| `scene-editor-v15-helper.js` | Layer controls, layer locks/border state, asset/layer UI enhancements. | No direct `ArtifexSceneEditorCore` reference found in audit grep; mostly DOM/localStorage based. | Depends on side panel cards, selected/stage item fields, object rows, layer controls, stage selectors. | Retain for now; later split permanent layer controller from asset/UI extras. |
| `scene-editor-v20-card-controller.js` | Card collapse/controller behaviour and selected-card affordances. | Reads selected ID via `window.ArtifexSceneEditorCore?.getSelectedId?.()` fallback. | Depends on panel-card/card-toggle/card body/selected item field selectors. | Retain for now; later integrate into bindings/renderer card controller. |
| `scene-editor-v21-visual-adjustments.js` | Visual adjustment controls and persistence for selected object visual properties. | Uses `getSelectedItem()` and `saveWorkingCopySoon()`. | Depends on selected card/card body, stage selected node, visual control IDs/classes. | Retain for now; later rename to permanent visual-adjustments module or integrate selected-object panel. |
| `scene-editor-v23-aspect-controls.js` | Aspect ratio lock, resize helpers, bounding box wrap controls. | Uses `getSelectedItem()`, `getSelectedId()`, and `saveWorkingCopySoon()`. | Depends on stage selected node, item width/height/image fields, aspect-control classes/buttons. | Retain for now; later rename to permanent aspect/resize module after transform audit. |
| `scene-editor-v24-object-preview.js` | Floating selected object preview modal. | Uses `getSelectedItem()` and `getSelectedId()`. | Depends on `.stage-wrap`, `.scene-item`, selected node, preview modal classes. | Retain for now; later rename to object-preview module. |

## Tests and checks run

- `git status --short`
- `git branch --show-current`
- `git log --oneline -12`
- `find artifex/apps/scene-editor -maxdepth 3 -type f | sort`
- `rg "scene-editor-" -n artifex/apps/scene-editor artifex/shared docs/artifex`
- `node --check` over active Scene Editor/shared JS files.
- `npm run dev -- --host 127.0.0.1`
- `curl` index check at `http://127.0.0.1:5173/artifex/apps/scene-editor/index.html?fresh=v0.30-scene-core-split`
- `curl`/Python active CSS/JS asset check from `index.html` — all linked active assets returned HTTP 200.
- `curl` template manifest check at `http://127.0.0.1:5173/artifex/templates/templates.json` — HTTP 200.
- Temporary Playwright setup in `/tmp/pwtest` plus browser dependency installation; no package or lockfile changes committed.
- Temporary Playwright smoke script verified render, import menu class toggle, local backup resume, object selection, value fields, zoom button, manual local save, and the public core API version/scene/selection/all-items bridge.

## HTTP checks

Succeeded. The final served URL used for checks was:

`http://127.0.0.1:5173/artifex/apps/scene-editor/index.html?fresh=v0.30-scene-core-split`

## Browser automation availability

Available after temporary Playwright install and browser dependency installation outside tracked repo files. A headless smoke test passed, but it is not a full visual regression and does not replace user visual review.

## Visual tests still required before merge

The user should visually verify before merge:

- Page layout and styling against the known stable version.
- Import menu behavior and template modal appearance.
- Local backup prompt and restoration flow.
- Object selection.
- Move handle drag.
- Resize handles.
- Rotate handle.
- Origin marker.
- Value sliders.
- Context menu actions.
- Download JSON.
- Any visual helper overlays from active numbered modules.

## Failed or reverted stages

No code stage was reverted. A temporary Playwright invocation initially failed until browser system dependencies were installed, then the browser smoke check passed.

## Blockers

No blocker remains for the core split itself. Cross-app linking remains a follow-up and was not implemented in this cleanup pass.

## Next recommendation

Perform user visual regression testing in the Codex/GitHub review flow. If accepted, deploy/cache-bust the Scene Editor as `v0.30-scene-core-split`; then plan a follow-up to rename/integrate the retained numbered runtime modules without changing behavior.
