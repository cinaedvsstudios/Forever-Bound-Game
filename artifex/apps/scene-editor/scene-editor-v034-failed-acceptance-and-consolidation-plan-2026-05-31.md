# Scene Editor v0.34 failed acceptance and consolidation plan — 2026-05-31

## Purpose

This document supersedes the pending-status sections of the earlier Scene Editor tracker/report until those older files are deliberately consolidated. It records what was delivered after `v0.33-inspector-controls-repair`, what failed during live user acceptance, which unmerged attempts must not be used, and the required cleanup plan before any wider Scene Editor integration work continues.

This is a documentation and planning record only. It does not approve or implement runtime changes.

## Rules that govern the next Scene Editor work

The Scene Editor must follow the existing Artifex rules:

1. Fix behaviour in permanent owning modules; do not stack new helper, patch, override or hotfix files over existing behaviour.
2. Each behaviour must have one active owner. Do not leave two live systems writing the same object state or rebuilding the same interface.
3. No app may keep more than two active transitional patch/wrapper layers; the Scene Editor should be reduced to zero active post-render repair layers during this cleanup.
4. One defined pass at a time: implement one coherent pass, test it, report it, then stop for user acceptance before starting another pass.
5. Do not begin cross-app Scene Editor integration until the cleaned deployed build is manually accepted.
6. Any implementation branch must be created from the latest `main`, because other Artifex apps may be updated at the same time.

## Delivery history and current live status

### Previously delivered baseline work

- PR #6 delivered the Scene Editor modular core split as `v0.30-scene-core-split`.
- PR #11 delivered runtime module filename cleanup as `v0.31-runtime-module-cleanup`.
- PR #13 delivered `v0.32-controls-resize-search`, but deployed manual acceptance failed for slider dragging, editable value input and aspect-off visible stretching.
- PR #16 delivered `v0.33-inspector-controls-repair`, including the floating Object Inspector/controls reorganisation and requested Scene-level cleanup changes.

### PR #19 / `v0.34-live-acceptance-repair`

PR #19 was merged and deployed after live review of v0.33. It attempted to repair the remaining acceptance issues without adding a new runtime helper/patch file.

Files changed in PR #19:

- `artifex/apps/scene-editor/index.html`
- `artifex/apps/scene-editor/scene-editor-config.js`
- `artifex/apps/scene-editor/scene-editor-renderer.js`
- `artifex/apps/scene-editor/scene-editor-stage-drag.js`
- `artifex/apps/scene-editor/scene-editor-offscreen-placement.js`
- `artifex/apps/scene-editor/scene-editor-aspect-controls.js`
- `artifex/apps/scene-editor/scene-editor-panel-stage.css`

Intended delivery:

- compact the floating Object Inspector styling;
- remove the duplicate bottom-right Active Project pill and retain the status/action inside the sidebar project card;
- restore middle-mouse workspace panning;
- repair stale numeric readout synchronisation in drag/offscreen paths;
- improve Wrap Bounding Box / Aspect Ratio handling for the red-ball acceptance case;
- update version/cache labels to `v0.34-live-acceptance-repair`.

### Live acceptance outcome

The deployed `v0.34-live-acceptance-repair` page loaded and visibly showed several intended UI changes: the v0.34 version label, a more compact Object Inspector, no duplicate bottom-right Active Project pill, and `Choose in Hub` in the sidebar status area.

However, user acceptance **failed**. With the ball selected, changing object controls could affect the box instead. Therefore:

- `v0.34-live-acceptance-repair` is the current live build, but it is **not an accepted stable baseline**;
- Scene Editor cross-app integration remains blocked;
- the next task must be consolidation of object-control ownership, not another narrow overlay repair.

Live URL for the failed-acceptance version:

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/scene-editor/index.html?fresh=v0.34-live-acceptance-repair`

## Work performed after the v0.34 failure

After the user reported the ball/box problem, direct investigation began. This investigation should have been stopped and explained sooner; instead, unmerged experimental branches were created while diagnosis was still incomplete.

### Unmerged attempt: `scene-editor-v035-selection-target-fix`

Status: **do not merge, do not cherry-pick**.

This branch is behind current `main` and contains an over-broad speculative attempt touching:

- `scene-editor-aspect-controls.js`
- `scene-editor-bindings.js`
- `scene-editor-visual-adjustments.js`

It explored whether the Object Inspector could display one object while control handlers remained bound to another. It is not an approved fix and should be deleted or ignored once the clean consolidation work is underway.

### Unmerged attempt: `scene-editor-v035-inspector-target-core-fix`

Status: **do not merge, do not cherry-pick**.

This branch is also behind current `main`. It attempted a narrower per-object aspect/wrap change plus version/cache labels in:

- `artifex/apps/scene-editor/index.html`
- `artifex/apps/scene-editor/scene-editor-config.js`
- `artifex/apps/scene-editor/scene-editor-aspect-controls.js`

Although closer to the confirmed symptom, it still leaves the wider duplicate-ownership/patch-layer structure alive and should not be treated as the implementation route.

### Abandoned latest-main branch preparation

A new branch name, `scene-editor-v035-object-aspect-target-fix-latest`, was prepared as a possible latest-`main` continuation, but no approved implementation or PR was delivered from it. It must not be used as a shortcut around the consolidation plan below.

## Confirmed runtime problems in current `main`

The earlier file renaming cleaned up filenames but did not fully remove patch-style architecture. Several permanent-named modules still operate as post-render repair layers or duplicate owners of the same feature.

### 1. Aspect / Wrap state is not safely scoped to one object

Current `scene-editor-aspect-controls.js` stores one shared `aspectLock` and one shared `wrapBoundingBox` state, and its fit path applies that state across rendered scene-item images. This matches the live acceptance failure: changing the selected ball's shape/fit controls can change how another object, such as the box, renders.

Required correction: any stored appearance/fit state must be attached to the individual object it affects, while Wrap Bounding Box should be a one-time action on the currently selected object only.

### 2. Wrap Bounding Box has multiple active implementations

Wrap/image-fit behaviour is distributed across:

- `scene-editor-layer-controls.js`, which creates and wires a Wrap button inside its injected Size / Shape block;
- `scene-editor-asset-path-tools.js`, which creates another Wrap button/handler and contains separate image-ratio logic;
- `scene-editor-aspect-controls.js`, which also handles Wrap/Aspect behaviour.

Required correction: the transform/size owner must contain the only active Wrap/Aspect implementation. Asset path tools must only choose/apply asset paths, and layer controls must only manage layers.

### 3. `scene-editor-layer-controls.js` remains a renamed post-render wrapper

This module currently does work beyond layer ownership, including rebuilding Object Inspector subcards, inserting Size / Shape controls, removing Animation/Audio cards, applying layout changes after render, wiring centre-handle movement, patching the asset browser and rerunning a `patch()` path on a repeating interval.

Required correction: reduce it to layer list/order/lock/recalculate responsibilities. Object Inspector rendering and transform controls must move to their proper permanent owners.

### 4. Movement has competing active owners

Object movement currently passes through more than one implementation:

- `scene-editor-stage-drag.js` handles move-drag and workspace pan;
- `scene-editor-layer-controls.js` wires a separate centre-handle drag path;
- `scene-editor-offscreen-placement.js` also intercepts movement and writes coordinates.

Required correction: `scene-editor-stage-drag.js` must become the sole movement owner. Offscreen range behaviour must be integrated into that proper path or bindings, then the duplicate movement route removed.

### 5. Numeric slider UI writes transform data directly as well as dispatching normal field events

The value-slider path currently both applies transform values directly and sends events into the normal form/binding route. This creates duplicate write paths for a single user edit and increases the risk of editing the wrong object.

Required correction: the slider component must be a UI/input component only; one owning transform/binding route must commit scene object changes.

### 6. Card, visual, asset, preview and menu modules still contain recurring repair/insertion behaviour

Current modules dynamically enforce or install interface pieces after initial render, often on timers:

- `scene-editor-card-controller.js` reorders/deduplicates/enforces Object Inspector cards;
- `scene-editor-visual-adjustments.js` replaces Visual card content after another module renders it;
- `scene-editor-asset-path-tools.js` reruns a patch path for buttons/popups;
- `scene-editor-object-preview.js` repeatedly installs/maintains its preview trigger;
- `scene-editor-menu-controller.js` repeatedly injects/maintains its menu shell.

Required correction: the renderer must render stable UI structure once, while behaviour modules bind to that structure rather than rebuilding it afterward.

## Required implementation plan

The cleanup must be performed as separate controlled passes. Each pass must be implemented on latest `main`, tested, documented and stopped for user review before the next pass begins.

### Pass 1 — Consolidate Object Inspector and transform ownership

Priority: blocker / first implementation task.

Goal: repair the live ball/box failure by removing the duplicate object-control ownership that caused it, rather than adding a new symptom patch.

Required changes:

1. `scene-editor-renderer.js` renders the permanent Object Inspector structure directly:
   - Object Details;
   - Transform;
   - Size / Shape;
   - Visual Adjustments.
2. `scene-editor-layer-controls.js` stops creating/removing/replacing Object Inspector cards and Size / Shape controls. It retains only layer-related functions.
3. `scene-editor-transform-controls.js` becomes the sole owner of rotation, origin, resize handles, scale actions, Wrap Bounding Box and Aspect Ratio behaviour.
4. Absorb the valid Aspect/Wrap logic from `scene-editor-aspect-controls.js` into the transform owner; remove `scene-editor-aspect-controls.js` from active runtime after verified replacement.
5. Remove the separate Wrap implementation from `scene-editor-asset-path-tools.js`.
6. Make object fit/aspect state object-specific where saved display behaviour requires state. A ball action must never update a box.
7. Render Visual Adjustments in the real inspector and make `scene-editor-visual-adjustments.js` bind/update it without replacing HTML through a repair loop.
8. Make `scene-editor-value-sliders.js` UI-only: it may reflect field values and dispatch changes, but only the single owning model-update route writes object data.
9. Remove `scene-editor-card-controller.js` from active runtime once cards/collapse state are rendered/managed by permanent owners.

Acceptance gate after deployment:

- select ball, adjust Wrap/Aspect/size/visual controls: only ball changes;
- select box, repeat: only box changes;
- Wrap Bounding Box fits the selected image only;
- aspect OFF permits visible stretch of selected image only;
- aspect ON maintains selected image proportions only;
- inspector cards render once without reappearing/reordering glitches;
- no extra Object Inspector patch/card-controller/aspect runtime remains active.

Stop after this pass for user testing.

### Pass 2 — Consolidate movement ownership

Start only after Pass 1 is accepted.

Required changes:

1. Make `scene-editor-stage-drag.js` the single owner of object move-handle drag, middle-mouse workspace pan and move-coordinate synchronisation.
2. Remove any remaining centre-handle drag logic from `scene-editor-layer-controls.js`.
3. Absorb the useful offscreen position-range behaviour into the owning movement/binding path.
4. Remove `scene-editor-offscreen-placement.js` from active runtime after replacement is verified.

Acceptance gate after deployment:

- middle mouse drags the workspace only;
- move handle drags the selected object only;
- X/Y readouts remain synchronised and editable;
- offscreen placement remains available where intended;
- no duplicate drag event path remains active.

Stop after this pass for user testing.

### Pass 3 — Remove remaining installation/polling wrappers

Start only after Pass 2 is accepted.

Required changes:

1. Render asset-selection controls/popups from stable renderer/binding ownership and remove recurring patch behaviour from `scene-editor-asset-path-tools.js`.
2. Render the editor menu shell directly; retain only menu interactions in the appropriate behaviour module or bindings.
3. Render the object-preview entry point directly; retain only preview modal/interaction behaviour.
4. Remove recurring post-render enforcement/installation intervals that exist only because UI is being repaired after render.

Acceptance gate after deployment:

- menus, asset picker and preview still work;
- no UI elements appear late, duplicate or re-order themselves during use;
- no active patch/wrapper layer remains in Scene Editor runtime.

Stop after this pass for user testing.

### Pass 4 — Update tracker/report and reopen future integration only after acceptance

After the cleaned build is accepted:

1. Update `scene-editor-core-split-todos.json` to record:
   - PR #16 / v0.33 merged;
   - PR #19 / v0.34 merged but failed manual acceptance;
   - the accepted consolidation deliveries and tests;
   - the actual new accepted live baseline.
2. Update `scene-editor-cleanup-report-2026-05-29.md` or supersede it explicitly with the accepted consolidation outcome.
3. Keep the Scene Events / Triggers contract as later future work.
4. Reopen cross-app Scene Editor integration only once the user has accepted the cleaned runtime.

## Current do-not-merge list

Do not merge or cherry-pick the investigative v0.35 branches:

- `scene-editor-v035-selection-target-fix`
- `scene-editor-v035-inspector-target-core-fix`
- `scene-editor-v035-object-aspect-target-fix-latest` if it appears as an incomplete preparation branch

A future implementation must start from current `main` and apply the consolidation plan cleanly.

## Required working method from this point

For each implementation pass:

1. Confirm latest `main` and the exact files to be touched.
2. State the one pass being implemented before requesting any write authorisation.
3. Make that one pass only; do not branch into additional speculative repairs.
4. Run the relevant static/served/browser checks.
5. Provide one PR and one exact deployed test list.
6. Wait for user acceptance before starting another pass.

This method is mandatory because parallel work is happening elsewhere in the repository and long hidden edit sessions create avoidable conflicts and confusion.
