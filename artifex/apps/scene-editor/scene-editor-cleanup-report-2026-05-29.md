# Scene Editor cleanup and ownership-consolidation report

## Status refresh — 2 June 2026

This report began as the 29 May core-split delivery record. It is now refreshed against current GitHub `main` so it does not stop at obsolete v0.30–v0.33 status language.

Verified current-main state:

```text
GitHub main: 81c7a6df28fa6f0d57b7033076a7ec28c2ca34d7
Current implemented Scene Editor version: v0.35-owner-consolidation
Active entry: artifex/apps/scene-editor/index.html
Latest merged Scene Editor repair: PR #37
Latest merge commit: d759ae7412779de5689eb202ce9024829af6b58d
Acceptance status: implementation merged; deployed manual acceptance still to be recorded
```

This report does not claim that the v0.35 deployed manual acceptance gate has passed. It records delivered code and the remaining test gate.

## Delivery progression

| PR | Version / purpose | Current interpretation |
|---|---|---|
| #6 | `v0.30-scene-core-split` | Merged. Established separate model, IO, renderer, bindings, app and compatibility responsibilities and archived unused legacy files. |
| #11 | `v0.31-runtime-module-cleanup` | Merged. Renamed retained numbered runtime modules to ownership-based filenames and removed stale helper messaging. |
| #13 | `v0.32-controls-resize-search` | Merged. Added the focused controls/search/Shadow Blur pass, but deployed manual acceptance later failed. |
| #16 | `v0.33-inspector-controls-repair` | Merged. Repaired v0.32 regressions and introduced the floating Object Inspector/scene-level organisation. |
| #19 | `v0.34-live-acceptance-repair` | Merged, but failed manual acceptance because controls for the selected ball could affect the box. |
| #37 | `v0.35-owner-consolidation` | Merged. Implements the permanent ownership consolidation required by the v0.34 failure; manual deployed acceptance remains pending. |

## Historical core-split delivery — v0.30

PR #6 delivered the first modular Scene Editor core split and archive cleanup.

```text
Pull request: #6 — Split Scene Editor core into modular files and archive legacy helpers
Merge commit: e5001234b22747269b49856daf200e07a4d70dfc
Delivered version: v0.30-scene-core-split
```

Created permanent core modules included:

```text
scene-editor-scene-model.js
scene-editor-io.js
scene-editor-stage-drag.js
scene-editor-renderer.js
scene-editor-bindings.js
scene-editor-core-api.js
scene-editor-app.js
```

`scene-editor-v2.js` remained as a small bootstrap shell creating and starting the modular application.

Archived into `artifex/apps/scene-editor/archive/legacy-2026-05-28/` during or before the core split:

```text
dropdown-fix.js
scene-editor.js
scene-editor-v3-helper.js
scene-editor-v13-helper.js
scene-editor-v13e-helper.js
scene-editor-v14-helper.js
scene-editor-v14c-helper.js
recovered-proposed-feature-list.md
context-fix.js
scene-editor-v12-helper.js
scene-editor-v12b-helper.js
scene-editor-v13d-helper.js
scene-editor-v23-aspect-controls.css
```

## Historical retained-module cleanup — v0.31

PR #11 converted retained active numbered feature modules into ownership-based names rather than leaving numbered runtime helpers active:

| Older live name | Ownership-based filename delivered in v0.31 |
|---|---|
| `scene-editor-v11-helper.js` | `scene-editor-asset-path-tools.js` |
| `scene-editor-v15-helper.js` | `scene-editor-layer-controls.js` |
| `scene-editor-v20-card-controller.js` | `scene-editor-card-controller.js` |
| `scene-editor-v21-visual-adjustments.js` | `scene-editor-visual-adjustments.js` |
| `scene-editor-v23-aspect-controls.js` | `scene-editor-aspect-controls.js` |
| `scene-editor-v24-object-preview.js` | `scene-editor-object-preview.js` |

At that point `scene-editor-transform-controls.js`, `scene-editor-value-sliders.js`, `scene-editor-offscreen-placement.js` and `scene-editor-menu-controller.js` remained active under ownership-based names.

## Historical acceptance sequence — v0.32 to v0.34

### v0.32 controls, resize and settings search

PR #13 delivered `v0.32-controls-resize-search`, including:

```text
- unlocked aspect-ratio resize work;
- compact left-panel settings search;
- Shadow Blur selected-object visual control;
- updated numeric adjustment styling and controls.
```

Static/served/browser checks were recorded during implementation, but deployed manual acceptance failed for slider dragging, editable numeric value input and visible aspect-off image stretching. v0.32 therefore did not reopen the cross-app integration gate.

### v0.33 inspector and controls repair

PR #16 delivered `v0.33-inspector-controls-repair`, including repairs to the v0.32 failures and reorganisation into a floating selected-object Object Inspector while keeping scene-level controls in the sidebar.

### v0.34 live acceptance repair and failure

PR #19 delivered `v0.34-live-acceptance-repair`, intended to compact the Object Inspector, remove duplicated Active Project presentation, restore workspace panning, correct numeric synchronisation and improve Wrap Bounding Box / Aspect Ratio behaviour.

Deployed manual acceptance then failed because editing controls for the selected ball could affect the box. That failure established that the active architecture still had competing selected-object/inspector/transform ownership and required a consolidated permanent-owner repair.

The detailed failure evidence and resulting plan are retained in:

```text
artifex/apps/scene-editor/scene-editor-v034-failed-acceptance-and-consolidation-plan-2026-05-31.md
```

## Current merged implementation — v0.35 ownership consolidation

PR #37 implements the required consolidation from the v0.34 failure and is merged into current `main`.

```text
Pull request: #37 — Consolidate Scene Editor object, movement and UI ownership
Merge commit: d759ae7412779de5689eb202ce9024829af6b58d
Current version: v0.35-owner-consolidation
```

### Current ownership model

| Behaviour | Active owner after merged v0.35 |
|---|---|
| Object Inspector, menu shell, Object Layers markup, preview entry and permanent controls markup | `scene-editor-renderer.js` |
| Ordinary form/model updates | `scene-editor-bindings.js` |
| Rotation, rotation origin, resize, scale, Wrap Bounding Box, Aspect Ratio Lock and Border toggle binding | `scene-editor-transform-controls.js` |
| Move-handle drag, middle-mouse panning, X/Y sync and offscreen range | `scene-editor-stage-drag.js` |
| Layer order, lock and recalculation | `scene-editor-layer-controls.js` |
| Slider UI/readout dispatch only | `scene-editor-value-sliders.js` |
| Selected-object visual editing | `scene-editor-visual-adjustments.js` |
| Asset path/picker interaction | `scene-editor-asset-path-tools.js` |
| Object preview interaction | `scene-editor-object-preview.js` |
| Menu interaction | `scene-editor-menu-controller.js` |
| Border display state | `scene-editor-object-states.css` |

### Current v0.35 active CSS load list

```text
scene-editor.css
context-menu.css
scene-editor-panel-stage.css
scene-editor-control-cards.css
scene-editor-value-sliders.css
scene-editor-ui-polish.css
scene-editor-object-states.css
```

### Current v0.35 active JavaScript load list

```text
../../shared/active-project/active-project-client.js
scene-editor-config.js
scene-editor-storage.js
scene-editor-scene-model.js
scene-editor-io.js
scene-editor-stage-drag.js
scene-editor-renderer.js
scene-editor-bindings.js
scene-editor-core-api.js
scene-editor-app.js
scene-editor-v2.js
scene-editor-asset-path-tools.js
scene-editor-transform-controls.js
scene-editor-layer-controls.js
scene-editor-value-sliders.js
scene-editor-visual-adjustments.js
scene-editor-object-preview.js
scene-editor-menu-controller.js
```

The following previously loaded ownership-overlap files are no longer in the active `index.html` load chain after the merged implementation:

```text
scene-editor-aspect-controls.js
scene-editor-card-controller.js
scene-editor-offscreen-placement.js
```

## Remaining acceptance gate before further Scene Editor work

No checked current-main status document records that the merged `v0.35-owner-consolidation` version has completed its deployed manual browser acceptance run. Therefore the current status is:

```text
Implementation merged; manual deployed acceptance pending.
```

Required manual test list:

```text
1. Select ball and test Wrap, Aspect, size and visual changes: only ball changes.
2. Select box and repeat: only box changes.
3. Confirm a square image wraps to a visually square area on the 16:9 stage.
4. Confirm Border is present, visibly hides/shows the border and is object-specific.
5. Reorder layers and click Recalculate; verify persistence after rerender and save/reload, including locked layers.
6. Test move-handle drag, editable X/Y, offscreen positions and middle-mouse workspace pan.
7. Test asset picker, object preview, menu actions, import and Download JSON.
8. Wait several seconds after interaction and confirm markup does not duplicate/reinstall and no console errors appear.
```

## Future work held until acceptance

Only after the v0.35 acceptance result is recorded should new Scene Editor or cross-app integration work be scoped, including:

```text
- real connected-project scene/screen save and index handling;
- stable object/effect reference integration;
- shared reference-index work;
- Scene Events / Triggers cross-app contract work;
- additional UI or feature expansion.
```

## Current conclusion

The earlier core split, runtime filename cleanup and subsequent repair work have advanced into a merged ownership-consolidation implementation on current `main`. The correct remaining task is not another Scene Editor ownership implementation pass; it is the deployed manual acceptance check for `v0.35-owner-consolidation` and recording that result before further work begins.
