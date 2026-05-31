# Phase 1 Archive and Hotfix Consolidation Inventory — 1 June 2026

## Status and scope

This record preserves the Phase 1 Codex inventory supplied and reviewed on 1 June 2026. It is an **audit record only**. No app code, runtime file, archive folder, branch or pull request was altered by the audit itself.

Important evidence limitation from the audit run: the Codex checkout reported that it had no local `main` ref or remotes available, so it inspected the supplied repository snapshot as the available current-main snapshot. Therefore, every later implementation or archive pass must re-check its named files against GitHub `main` before making changes.

The inventory fulfils the Phase 1 requirement in `docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md`: identify files that appear unused/superseded, identify active repair/wrapper behaviour that cannot simply be removed, and establish what must be checked before any archive or consolidation implementation is approved.

## Executive conclusion

The audit found three different categories of work:

1. **Possible low-risk archive candidates**: mostly old Project Editor and Quest Builder static/bootstrap files that were not found in active entry-point/import chains.
2. **Live hotfix/wrapper layers that must not be archived directly**: especially Scene Editor control/inspector modules, Creation Guide bootstrap/folder overrides, Effect Editor emergency rescue modules and Object Creator V1.35 Step 5 layers.
3. **Ambiguous areas needing later investigation**: mainly Effect Editor old parity/versioned helpers, Effect Editor route choice, app assets that may be data-referenced, and stale documentation references.

The strongest blocker remains **Scene Editor**: its active modules overlap in Object Inspector rendering, transform/aspect/wrap/movement/slider/card behaviour and it already has a documented failed manual acceptance result. The first future consolidation implementation pass should therefore be Scene Editor ownership consolidation, unless the user deliberately chooses to reopen a low-risk UI lane in another app first.

## Candidate archive-only files requiring final GitHub-main verification

These files were reported as not active in the inspected entry-point/import chain. They are candidates for a later archive-only pass, but must be verified against live GitHub `main`, dynamic imports/document writes and hub links before movement.

### Project Editor — recommended first archive-only pass

| File path | Reported classification | Why it is a candidate | Proposed destination | Required check before movement |
|---|---|---|---|---|
| `artifex/apps/project-editor/index.split.html` | Superseded | Older split shell; no live reference found; loads older bootstrap | `artifex/apps/project-editor/archive/pre-v0132-contract/` | Confirm no hub/link/dynamic reference and live `index.html` uses only `project-app.v7.js`. |
| `artifex/apps/project-editor/index.v7.html` | Superseded / evidence-only | Earlier v0.1.7 shell; no live reference found | `artifex/apps/project-editor/archive/pre-v0132-contract/` | Confirm no inbound link. |
| `artifex/apps/project-editor/index.monolith.backup.html` | Superseded / evidence-only | Monolith backup from split process; documentation/evidence only | `artifex/apps/project-editor/archive/pre-split-monolith/` | Confirm it is not used as deployment/test entry point. |
| `artifex/apps/project-editor/src/project-app.js` | Superseded | Older split app bootstrap; reported as referenced only by old split HTML/docs | `artifex/apps/project-editor/archive/pre-v7-split/` | Confirm live page imports only `project-app.v7.js`; archive together with old shell if approved. |

### Quest Builder — separate later archive-only pass

| File path | Reported classification | Why it is a candidate | Proposed destination | Required check before movement |
|---|---|---|---|---|
| `artifex/apps/quest-builder/v1/quest-builder-v108.js` | Superseded | Older V1.08 app not loaded by current entry point | `artifex/apps/quest-builder/archive/v108-monolith/` | Confirm current `index.html` loads current `quest-builder-app.js` only and compare for unique behaviour. |
| `artifex/apps/quest-builder/v1/quest-builder-v108.css` | Superseded | Old V1.08 styling not reported in active stylesheet chain | `artifex/apps/quest-builder/archive/v108-monolith/` | Confirm no active stylesheet reference. |
| `artifex/apps/quest-builder/v1/styles.css` | Superseded / uncertain | Older generic module style not reported in live entry chain | `artifex/apps/quest-builder/archive/pre-v1212-module-app/` | Confirm no live stylesheet link. |
| `artifex/apps/quest-builder/v1/src/module-app.js` | Superseded / uncertain | Older boilerplate-style app not imported by current app | `artifex/apps/quest-builder/archive/pre-v1212-module-app/` | Confirm no dynamic import and compare import/export/schema differences. |
| `artifex/apps/quest-builder/v1/src/module-config.js` | Superseded / uncertain | Associated with older app path | `artifex/apps/quest-builder/archive/pre-v1212-module-app/` | Confirm only used by obsolete app path. |
| `artifex/apps/quest-builder/v1/src/module-io.js` | Superseded / uncertain | Associated with older app path | `artifex/apps/quest-builder/archive/pre-v1212-module-app/` | Confirm only used by obsolete app path. |
| `artifex/apps/quest-builder/v1/src/module-renderer.js` | Superseded / uncertain | Associated with older app path | `artifex/apps/quest-builder/archive/pre-v1212-module-app/` | Confirm only used by obsolete app path. |
| `artifex/apps/quest-builder/v1/src/module-state.js` | Superseded / uncertain | Associated with older app path | `artifex/apps/quest-builder/archive/pre-v1212-module-app/` | Confirm only used by obsolete app path. |

### Lower-priority later candidates

| File path | Area | Reported classification | Handling |
|---|---|---|---|
| `artifex/apps/puzzle-creator/src/js/engines/maze-v109-controls.js` | Puzzle Creator | Unused / superseded | Archive only after confirming no hidden dynamic use and no unique fix absent from current named maze modules. |
| `artifex/apps/puzzle-creator/src/js/engines/maze-v110-fixes.js` | Puzzle Creator | Unused / superseded | Same as above. |
| `artifex/apps/creation-guide/v1/src/module-guide-coach-v109.js` | Creation Guide | Unused / superseded | Archive only after comparing any unique content against current onboarding/guide modules. |
| `artifex/apps/creation-guide/v1/src/module-guide-onboarding-v110.js` | Creation Guide | Unused / superseded | Same as above. |
| `artifex/apps/effect-editor/src/ui/phase2-ui-patch.js` | Effect Editor legacy split area | Superseded | Archive only after route decision and final no-reference check. |
| `artifex/apps/effect-editor/src/fx-runtime (2).js` | Effect Editor legacy split area | Unused / superseded candidate | Compare against other runtime copies before archive. |
| `artifex/.pages-rebuild-20260526-1306.txt` | Hub/deployment marker | Evidence-only / uncertain | Archive only after confirming no deployment/workflow use. |

## Active live layers that must be consolidated before archiving

These files must not be moved simply because they look like fixes or wrappers. The audit found them in active runtime chains or containing currently needed behaviour.

### Scene Editor — blocker priority

The audit identified overlapping active ownership in the current Scene Editor route.

| Behaviour area | Active files identified | Why this blocks simple archive action | Intended permanent direction |
|---|---|---|---|
| Inspector DOM/card structure | `scene-editor-renderer.js`, `scene-editor-card-controller.js`, `scene-editor-visual-adjustments.js`, `scene-editor-transform-controls.js`, `scene-editor-bindings.js` | Multiple modules render, inject, reorder or bind the same inspector surface | Renderer owns final structure; focused behaviour modules bind to it once. |
| Transform inputs | `scene-editor-transform-controls.js`, `scene-editor-value-sliders.js`, `scene-editor-bindings.js`, `scene-editor-stage-drag.js`, `scene-editor-aspect-controls.js` | More than one direct state/style writing path can affect selection state | One transform/input owner plus one movement owner. |
| Aspect and wrap | `scene-editor-aspect-controls.js` | Live behaviour is needed but currently part of the wrong-object failure area | Absorb into permanent selected-object transform/resize owner. |
| Movement/offscreen placement | `scene-editor-stage-drag.js`, `scene-editor-offscreen-placement.js`, `scene-editor-bindings.js` | Multiple position-writing paths | `scene-editor-stage-drag.js` becomes sole movement owner, with retained offscreen capability integrated there. |
| Numeric sliders | `scene-editor-value-sliders.js`, `scene-editor-aspect-controls.js`, `scene-editor-bindings.js` | Sliders and aspect logic both update values/styles | Slider UI dispatches input only; permanent transform path writes object data. |
| Menus/extra preview/layers | `scene-editor-menu-controller.js`, `scene-editor-object-preview.js`, `scene-editor-layer-controls.js` | May be active wrappers or legitimate feature modules; need ownership check | Consolidate injected UI where duplicated; retain legitimate feature ownership where non-conflicting. |

Files proposed for **consolidate then archive**, subject to a later approved Scene Editor implementation pass:

```text
artifex/apps/scene-editor/scene-editor-transform-controls.js
artifex/apps/scene-editor/scene-editor-value-sliders.js
artifex/apps/scene-editor/scene-editor-value-sliders.css
artifex/apps/scene-editor/scene-editor-aspect-controls.js
artifex/apps/scene-editor/scene-editor-card-controller.js
artifex/apps/scene-editor/scene-editor-visual-adjustments.js
artifex/apps/scene-editor/scene-editor-offscreen-placement.js
artifex/apps/scene-editor/scene-editor-menu-controller.js
artifex/apps/scene-editor/scene-editor-layer-controls.js   [requires further ownership verification]
```

Acceptance gate for a later Scene Editor pass:

```text
- selecting and editing the ball changes only the ball;
- selecting and editing the box changes only the box;
- move, resize, rotate, skew, aspect lock and wrap-to-image affect selected item only;
- sliders and visual adjustments remain functional;
- inspector cards render once without duplicate/reorder repair behaviour;
- save/autosave and object preview remain functional;
- no replacement patch/helper layer is added.
```

### Archetype Object Creator — high priority validation before consolidation

| File path | Classification | Active behaviour | Intended handling |
|---|---|---|---|
| `v1/src/object-wizard-step5.js` | Active transitional wrapper | Step 5 enhancement and Sound Generator modal integration | Validate V1.35 behaviour, then absorb into permanent Step 5 owner where appropriate. |
| `v1/src/object-wizard-step5-layout.js` | Active transitional wrapper | Step 5 detail-panel/layout behaviour | Consolidate into permanent Step 5 renderer/layout owner after validation. |
| `v1/src/object-wizard-frame-correction.js` | Active transitional wrapper | Frame correction and task/frame repair behaviour | Validate asset/frame workflow before consolidating. |
| `v1/src/object-wizard-asset-package.js` | Active transitional wrapper | Asset package/ZIP controls and added styling/layout | Consolidate only after verifying backup/export intent. |
| `v1/src/object-project-storage.js` | Active permanent owner candidate | Connected project-folder save and object-index update | Retain and validate; do not archive as a wrapper. |
| `v1/src/object-wizard-build-checklist.js` | Active permanent owner candidate | Base Step 5 controls/state | Retain as likely permanent home for valid Step 5 behaviour. |

### Effect Editor — route decision required before consolidation or archiving

The audit found two current routes:

```text
Primary route:   artifex/apps/effect-editor/index.html       — V3.38 Emergency
Secondary route: artifex/apps/effect-editor/index2.html      — INDEX2-CLEAN-0.2.3
```

The primary route actively loads repair/rescue behaviour:

| File path | Classification | Behaviour | Intended handling |
|---|---|---|---|
| `v3/src/editor-app.js` | Active permanent owner with emergency debt | Primary boot, lite mode, panels, menus/buttons, starter layer | Retain until route decision; consolidate only if primary route remains accepted route. |
| `v3/src/v333-lower-panel-cleanup.js` | Active transitional wrapper | Replaces lower panel and adds action proxies/version label | Consolidate then archive only if primary route remains. |
| `v3/src/v338-menu-grid-rescue.js` | Active transitional wrapper | Forces grid/default menu repair/version handling | Consolidate then archive only if primary route remains. |

The clean route currently appears to use `index2.html`, `v3/src/index2-app.js`, `editor-core.js`, appearance/dynamics/quick-edit/workspace modules. These must be retained pending a deliberate accepted-route decision.

### Creation Guide — current-main wrapper debt confirmed

| File path | Classification | Active behaviour | Intended handling |
|---|---|---|---|
| `v1/src/app-bootstrap.js` | Active transitional wrapper | Dynamically loads legacy `module-app.js`, then patches labels/version/hero/toast | Consolidate into a permanent direct app core only in a dedicated Creation Guide pass. |
| `v1/src/module-app.js` | Active permanent owner but legacy-loaded | Underlying app runtime | Retain until bootstrap consolidation succeeds. |
| `v1/src/project-folder-setup.js` | Active transitional wrapper | Folder-setup UI and override of legacy controls; writes starter files | Consolidate after current behaviour is validated; do not archive directly. |
| `v1/src/intake-setup.js`, `health-actions.js`, `project-health.js`, `project-flow.js`, `onboarding-guide.js` | Active permanent owner candidates | Current feature modules | Retain. |

This confirms Creation Guide wrapper debt exists on current `main` independently of abandoned PR #20.

### Project Editor — live entry retained; obsolete static files separable

| File path | Classification | Active behaviour | Intended handling |
|---|---|---|---|
| `src/project-app.v7.js` | Active current bootstrap with naming debt | Current v0.1.32 module composition | Retain; do not archive. Possible later clean naming/consolidation pass. |
| `src/project-ui.js` and current enhancer modules | Active composition | Live workspace/inspector/task UI | Retain; do not add more wrapper layers. |

The old HTML/bootstrap files listed in the archive-only table appear separable from this live chain, which is why Project Editor is the proposed first archive-only pass.

### Puzzle Creator — current UI lane possible; live loader remains active

| File path | Classification | Active behaviour | Intended handling |
|---|---|---|---|
| `src/js/main.js` | Active permanent owner | Current app bootstrap | Retain. |
| `src/js/engines/maze-labyrinth-consolidation-loader.js` | Active transitional wrapper | Loads named Maze/Labyrinth modules for the V1.32 route | Retain until a deliberate consolidation pass; do not touch during UI-only polish. |
| `src/js/engines/maze-ui-polish.js` | Active owner candidate | Current maze UI polish loaded through stable loader | Retain. |

## Retain as active, intentional or evidence-only content

### Sound Generator preview and shared popup

The report confirms the preview is an intentional browser test harness and not dead app clutter.

| File path | Classification | Handling |
|---|---|---|
| `artifex/apps/sound-generator-preview/index.html` | Intentional test harness | Retain. |
| `artifex/apps/sound-generator-preview/sound-generator-preview-host.js` | Intentional test harness | Retain. |
| `artifex/shared/sound-generator/sound-generator-window.js` | Active public popup API | Retain. |
| `artifex/shared/sound-generator/sound-generator-ui-v1.js` | Active UI owner | Retain. |
| Shared runtime/schema/store/presets/controls/CSS files | Active permanent owners | Retain. |

Documentation follow-up only: the shared Sound Generator README reportedly mentions `sound-generator-ui.js` as retained, while that file was not present in the inspected folder. Verify and correct this documentation statement in a later docs-only pass.

### Shared services

| Area | Active files identified | Handling |
|---|---|---|
| Project folder | `shared/project-folder/project-folder-client.js`, `project-structure-initializer.js` | Retain; contract-critical shared services. |
| Active project | `shared/active-project/active-project-client.js` | Retain; include in app display baseline checks. |
| Registered content | `shared/registered-content/registered-content-reader.js`, `registered-content-picker.js` | Retain. |
| Health/todo | `shared/health-guide/health-checks.js`, `todo-output.js`, shared todo docs/data | Retain; later terminology/compatibility migration is separate work. |
| Audit records | `shared/todo-guide/audits/*` | Retain as evidence. |

### Hub and templates

| File/path | Classification | Handling |
|---|---|---|
| `artifex/index.html` | Active Hub surface | Retain; later quick link/version baseline. |
| `artifex/apps/module-boilerplate/*` | Intentional template utility | Retain; reportedly linked from Creation Guide. |
| Build Game, Playtest and Object Library surfaces | Not fully prioritised by this audit | Later link/app-index pass; do not archive based on this report alone. |

## Uncertain files requiring further investigation

These are not approved archive candidates yet:

```text
Effect Editor:
- v3/src/*-parity.js files
- v3/src/v312-polish.js, v314-polish.js, v315-polish.js, v317-polish.js
- v3/src/v320-file-menu.js, v322-text-controls.js, v326-left-panel-search.js
- v3/src/v327-my-settings.js, v330-boot-recovery.js, v336-safe-controls-bridge.js
- v3/src/v339-label-sync.js, ui-polish-v2.js, workflow-polish.js
- v3/src/index2-clean-controller.js
- src/ legacy split folder as a group
- brushes/* and overlays/*

Puzzle Creator:
- texture files and asset placeholders/data references

Archetype Object Creator:
- sprite/sample files and duplicate README-style material

Hub/app-index:
- Build Game, Playtest, Object Library and remaining link targets
```

## Recommended next passes

### First low-risk archive-only pass — Project Editor obsolete static files

This is the next recommended action because it is narrow, changes one app only and does not alter active app behaviour if the final reference check succeeds.

Scope to verify and, only after successful verification, move into archive with a README:

```text
artifex/apps/project-editor/index.split.html
artifex/apps/project-editor/index.v7.html
artifex/apps/project-editor/index.monolith.backup.html
artifex/apps/project-editor/src/project-app.js
```

The pass must not touch current `index.html`, `src/project-app.v7.js`, live UI modules, naming, save behaviour or application features.

### First app-specific consolidation implementation pass — Scene Editor ownership consolidation

Scene Editor remains the first required correctness repair pass because it has a verified user-facing failure. It should occur when the user is ready to work on/fix Scene Editor, and must be done as a controlled app-only consolidation rather than by merging experimental v0.35 branches or adding new wrappers.

### First possible UI-only lane

After a minimal smoke test:

```text
- Smallest/lowest-risk visual surface: Sound Generator preview/shared popup.
- First fuller app visual surface: Puzzle Creator V1.32.
```

Neither lane permits schema, project-folder/save, integration or new wrapper work in its initial UI-only pass.

## Phase 1 gate conclusion

Phase 1 inventory is complete as an audit. The next recommended implementation step is a single narrow Project Editor archive-only pass, preceded by live GitHub-main reference verification and followed by a manual smoke check. No other archive or consolidation work is approved merely by this inventory.