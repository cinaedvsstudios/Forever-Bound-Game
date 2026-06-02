# Scene Editor v0.34 failed acceptance and v0.35 ownership-consolidation outcome

## Current status refresh — 2 June 2026

This document originally recorded the failure of `v0.34-live-acceptance-repair` and the required consolidation plan. That plan has now been implemented and merged on current `main` through PR #37.

Verified current-main baseline for this refresh:

```text
GitHub main: 81c7a6df28fa6f0d57b7033076a7ec28c2ca34d7
Active entry point: artifex/apps/scene-editor/index.html
Visible/cache version: v0.35-owner-consolidation
Merged PR: #37 — Consolidate Scene Editor object, movement and UI ownership
Merge commit: d759ae7412779de5689eb202ce9024829af6b58d
```

Correct status now:

```text
Ownership-consolidation implementation: MERGED ON MAIN
Post-merge deployed manual acceptance: NOT YET RECORDED IN CHECKED DOCUMENTS
New Scene Editor feature/UI expansion: HOLD UNTIL ACCEPTANCE GATE IS RECORDED
```

This file still preserves why the repair was necessary, but it must no longer be used to claim that the ownership implementation itself is still pending.

## Rules governing further Scene Editor work

1. Fix behaviour in permanent owning modules; do not stack new helper, patch, override or hotfix files over existing behaviour.
2. Each behaviour must have one active owner. Do not leave two live systems writing the same object state or rebuilding the same interface.
3. Do not begin further Scene Editor expansion or cross-app integration until the merged cleaned build is manually accepted.
4. Any later implementation branch must start from the latest `main`, because other Artifex apps are being updated in parallel.
5. A merged implementation is not equivalent to an accepted live baseline unless the deployed manual checks are completed and recorded.

## Delivery history

### Earlier baseline work

| PR | Version / outcome |
|---|---|
| #6 | Delivered modular core split as `v0.30-scene-core-split`. |
| #11 | Delivered runtime module filename cleanup as `v0.31-runtime-module-cleanup`. |
| #13 | Delivered `v0.32-controls-resize-search`, but deployed manual acceptance failed slider dragging, editable numeric value input and aspect-off visible stretching. |
| #16 | Delivered `v0.33-inspector-controls-repair`, including floating Object Inspector/control reorganisation and requested Scene-level cleanup changes. |
| #19 | Delivered `v0.34-live-acceptance-repair`; manual acceptance failed because editing controls for the selected ball could affect the box. |
| #37 | Delivered `v0.35-owner-consolidation`; implementation is merged, with post-merge deployed acceptance still to be recorded. |

### Why v0.34 failed

The deployed `v0.34-live-acceptance-repair` page visibly included several intended UI changes: the v0.34 label, more compact Object Inspector, removal of the duplicate bottom-right Active Project pill and a sidebar `Choose in Hub` action.

However, user acceptance failed when changing object controls for the selected ball could affect the box. The problem was not a cosmetic defect: it established that multiple active owners were affecting selected-object controls and rendering behaviour.

The required response was therefore ownership consolidation in permanent modules, not another small overlay fix.

## Superseded experimental branches

The following earlier investigative branches remain historical evidence only and must not be merged or cherry-picked as shortcuts:

```text
scene-editor-v035-selection-target-fix
scene-editor-v035-inspector-target-core-fix
scene-editor-v035-object-aspect-target-fix-latest, if it appears as an incomplete preparation branch
```

They were created while the diagnosis was incomplete and were superseded by the clean current-main PR #37 implementation.

## v0.35 ownership-consolidation result now merged

PR #37 was implemented from current `main` to resolve the competing ownership identified after the v0.34 failure.

### Current active ownership model

| Behaviour | Active owner on current `main` after PR #37 |
|---|---|
| Object Inspector, menu shell, Object Layers markup, preview entry and permanent control markup | `scene-editor-renderer.js` |
| Ordinary item form-to-model updates | `scene-editor-bindings.js` |
| Rotation, rotation origin, resize, scale, Wrap Bounding Box, per-object Aspect Ratio Lock and Border toggle binding | `scene-editor-transform-controls.js` |
| Move-handle drag, middle-mouse panning, X/Y drag sync and offscreen range | `scene-editor-stage-drag.js` |
| Layer ordering, lock and recalculation | `scene-editor-layer-controls.js` |
| Slider UI/readout dispatch only | `scene-editor-value-sliders.js` |
| Visual state editing and scene-item painting | `scene-editor-visual-adjustments.js` |
| Asset/path selection and picker interaction | `scene-editor-asset-path-tools.js` |
| Object preview interaction | `scene-editor-object-preview.js` |
| Menu interaction | `scene-editor-menu-controller.js` |
| Object display-state styling used by Border visibility | `scene-editor-object-states.css` |

### Implemented changes confirmed from PR #37 and active `index.html`

```text
- Renderer now emits stable floating inspector cards and permanent controls directly.
- Transform controls scope Wrap and Aspect actions to the captured selected object and use rendered stage aspect ratio for percentage-to-visual conversion.
- Border toggle exists in permanent inspector ownership with permanent display-state styling.
- Stage drag retains middle-mouse workspace panning and supports intended offscreen coordinates through its movement route.
- Layer recalculation mutates live stored scene items rather than detached display copies.
- Slider UI no longer writes through a competing custom pointer-drag transform route.
- Visual adjustment, asset/path, menu and preview behaviour no longer require the previously identified competing installation ownership paths.
```

### Files removed from the active load chain

The current `artifex/apps/scene-editor/index.html` no longer loads the following previously active overlapping modules:

```text
scene-editor-aspect-controls.js
scene-editor-card-controller.js
scene-editor-offscreen-placement.js
```

The active page now loads `scene-editor-object-states.css` as the permanent visible Border-state stylesheet.

## Required post-merge manual acceptance gate

This is the remaining gate before Scene Editor can be considered an accepted stable baseline for further work:

```text
1. Select ball and test Wrap, Aspect, size and visual changes: only ball changes.
2. Select box and repeat: only box changes.
3. Confirm a square image wraps to a visibly square area on the 16:9 stage.
4. Confirm Border toggle is present, visibly hides/shows the border and is object-specific.
5. Reorder layers and click Recalculate; verify the result persists after rerender and save/reload, including locked layers.
6. Test move-handle drag, editable X/Y, intended offscreen positions and middle-mouse workspace pan.
7. Test asset picker, object preview, menu actions, import and Download JSON.
8. Wait several seconds after interaction and confirm controls do not duplicate/reinstall and no console errors appear.
```

The checked records do not yet contain a passed result for this post-merge deployed test. Until that is recorded:

```text
- do not say Scene Editor is still waiting for the ownership implementation;
- do not say Scene Editor is fully accepted/stable;
- do say the implementation is merged and manual acceptance is pending.
```

## Future work after acceptance

Only after the v0.35 acceptance gate is completed and recorded should wider Scene Editor integration or new feature work be reopened, including:

```text
- active connected-project scene/screen saving and indexes;
- stable object archetype and effect archetype references;
- shared reference-index integration;
- future Scene Events / Triggers contract work with Object Creator, Effect Editor, Quest Builder and Project Editor.
```

## Relationship to older reports and trackers

This document supersedes any older Scene Editor status language that says:

```text
- v0.32 or v0.33 is awaiting merge as the next repair;
- v0.34 ownership consolidation is still to be implemented;
- Scene Editor still has its original blocker with no merged implementation.
```

The separate older core-split report and task JSON preserve earlier delivery history, but should be read together with this current outcome until their historical tracker fields receive any later dedicated cleanup.
