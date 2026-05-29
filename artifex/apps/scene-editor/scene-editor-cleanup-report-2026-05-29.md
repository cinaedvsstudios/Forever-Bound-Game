# Scene Editor cleanup and core split report — 2026-05-29

## Delivered status

The Scene Editor core split is complete, merged, deployed and visually accepted as a working live baseline.

- Current official live version: `v0.30-scene-core-split`
- Live test URL: `https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.30-scene-core-split`
- Pull request: `#6 — Split Scene Editor core into modular files and archive legacy helpers`
- Pull request URL: `https://github.com/cinaedvsstudios/Forever-Bound-Game/pull/6`
- Merge commit: `e5001234b22747269b49856daf200e07a4d70dfc`
- Merged at: `2026-05-29T00:45:41Z`

After merge, the user opened the deployed GitHub Pages build and confirmed it loaded correctly, restored the local `title_screen_template.json` scene, displayed the stage and selected-object transform handles, and seemed fine after the requested live interaction check.

## Starting state

- Baseline live version supplied before this task: `v0.29-title-cache-sync`.
- Baseline live URL: `https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.29-title-cache-sync-restore-core`.
- Existing archive folder reused: `artifex/apps/scene-editor/archive/legacy-2026-05-28/`.
- The previous chat-based attempt to split storage/model logic had regressed on fresh load and was rolled back; the full split was therefore performed in Codex with complete file access and served-browser checks.

## Codex work and delivery

Codex reported these work commits during the task:

1. `8041e97 Archive unused scene editor legacy files`
2. `af31c50 Split scene editor core modules`
3. `ce18824 Document scene editor core split`

The resulting draft PR was created through Codex/GitHub and merged into `main` as merge commit `e5001234b22747269b49856daf200e07a4d70dfc`.

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

Moved to `artifex/apps/scene-editor/archive/legacy-2026-05-28/` during the Codex pass:

- `dropdown-fix.js`
- `scene-editor.js`
- `scene-editor-v3-helper.js`
- `scene-editor-v13-helper.js`
- `scene-editor-v13e-helper.js`
- `scene-editor-v14-helper.js`
- `scene-editor-v14c-helper.js`
- `recovered-proposed-feature-list.md`

Already archived before the Codex pass and left there:

- `context-fix.js`
- `scene-editor-v12-helper.js`
- `scene-editor-v12b-helper.js`
- `scene-editor-v13d-helper.js`
- `scene-editor-v23-aspect-controls.css`

## Created permanent core modules

- `scene-editor-scene-model.js` — scene data helpers, normalisation, collection/item lookup, background path data mutation, defaults, duplicate/remove and path application.
- `scene-editor-io.js` — local file import, URL import, template manifest load, template load, JSON download and date formatting.
- `scene-editor-stage-drag.js` — existing core move-handle/centre-drag wiring and pointer lifecycle.
- `scene-editor-renderer.js` — shell, stage/work area, controls, cards, context menu, template modal, file pill and resume markup.
- `scene-editor-bindings.js` — DOM event and form bindings.
- `scene-editor-core-api.js` — stable `window.ArtifexSceneEditorCore` compatibility bridge factory.
- `scene-editor-app.js` — app/state coordinator consuming config, storage, model, IO, renderer, bindings, stage drag and core API modules.

`scene-editor-v2.js` remains loaded as a small bootstrap shell that creates and starts the modular application.

## Final `index.html` active load list in v0.30

### CSS

1. `./scene-editor.css?v=v0.30-scene-core-split`
2. `./context-menu.css?v=v0.30-scene-core-split`
3. `./scene-editor-panel-stage.css?v=v0.30-scene-core-split`
4. `./scene-editor-control-cards.css?v=v0.30-scene-core-split`
5. `./scene-editor-value-sliders.css?v=v0.30-scene-core-split`
6. `./scene-editor-ui-polish.css?v=v0.30-scene-core-split`

### JavaScript

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

## Active runtime module audit still requiring a final cleanup pass

The core split succeeded, but six still-loaded feature files remain under numbered legacy names. They were audited and retained during the split to avoid additional behaviour/cache risk in the same PR.

| Current live file | Responsibility | Recommended permanent filename |
| --- | --- | --- |
| `scene-editor-v11-helper.js` | Asset library picker, image/path helper buttons, wrap image, import-warning/dirty markers | `scene-editor-asset-path-tools.js` |
| `scene-editor-v15-helper.js` | Layer controls, layer locks/border state and layer/asset UI enhancements | `scene-editor-layer-controls.js` |
| `scene-editor-v20-card-controller.js` | Card collapse/controller behaviour | `scene-editor-card-controller.js` |
| `scene-editor-v21-visual-adjustments.js` | Selected-object visual adjustment controls and persistence | `scene-editor-visual-adjustments.js` |
| `scene-editor-v23-aspect-controls.js` | Aspect-ratio lock, resize helpers and bounding-box wrap controls | `scene-editor-aspect-controls.js` |
| `scene-editor-v24-object-preview.js` | Floating selected-object preview modal | `scene-editor-object-preview.js` |

The active permanent files `scene-editor-transform-controls.js`, `scene-editor-value-sliders.js`, `scene-editor-offscreen-placement.js`, and `scene-editor-menu-controller.js` already have acceptable ownership-based filenames and should remain unless a later integration audit finds duplicate behaviour.

## Confirmed remaining defect

The live v0.30 screen still displays the stale runtime message:

`v0.28-consolidation: Consolidated layout helper loaded`

The old version constant remains in both:

- `scene-editor-v11-helper.js`
- `scene-editor-v15-helper.js`

This is a presentation/cache-label cleanup defect only; the page loads and the modular core is working. The final runtime-module cleanup pass should replace these stale helper version/toast messages with the new live version convention while preserving behaviour.

## Tests and checks completed

Codex reported the following passed checks for the core split:

- `node --check` over active Scene Editor/shared JavaScript files.
- `npm run dev -- --host 127.0.0.1` served the app.
- HTTP checks for the final Scene Editor `index.html` and all linked active CSS/JS assets returned success.
- HTTP fetch of `artifex/templates/templates.json` returned success.
- Temporary Playwright smoke test verified render, import-menu toggle, local backup resume, object selection, selected value fields, zoom, manual local save and the public core API bridge.
- Temporary Playwright/browser dependencies were installed outside tracked project files; no package/lockfile changes were committed for testing.

User live verification after merge:

- Loaded deployed GitHub Pages version `v0.30-scene-core-split`.
- Confirmed header/status version sync and local scene backup restore were visible.
- Confirmed stage/grid/object render and selected-object transform handles were visible.
- Reported the live editor “seems fine” after the requested interaction test.

## Completed outcome

The large Scene Editor core-file risk has been resolved. The app now satisfies the essential module-splitting requirement from `docs/artifex/19-project-file-contracts.md`: it has a thin bootstrap entry plus separate model, IO, renderer, bindings, app and compatibility API responsibilities.

## Remaining Scene Editor work before cross-app integration

1. Use Codex for one final low-risk runtime-module cleanup PR:
   - Rename the six retained numbered live feature modules to permanent ownership-based filenames.
   - Update `index.html` load paths and cache/version strings consistently.
   - Remove stale `v0.28-consolidation` helper version/toast messages.
   - Do not change feature behaviour or transform-control logic.
   - Run static, served HTTP and Playwright smoke checks.
   - User verifies the deployed build again before accepting it as the next stable baseline.

2. After the final runtime-module cleanup is accepted, begin the wider all-app integration pass:
   - active-project adoption inside Scene Editor;
   - scene/screen indexes and stable output contracts;
   - object archetype and effect archetype references;
   - Project Manager/shared reference-index integration.

## Recommended next version

Use `v0.31-runtime-module-cleanup` for the final retained-helper rename/toast-cleanup pass, provided no unrelated feature change is included.