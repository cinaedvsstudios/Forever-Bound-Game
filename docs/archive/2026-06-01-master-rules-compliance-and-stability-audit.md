# Artifex Rules-Compliance and Stability Analysis — Corrected Master Audit

## Status and purpose

Date recorded: 2026-06-01.

This is the accepted corrected master-audit record after the 31 May integration review, the Phase 1 archive/hotfix inventory, and the three approved archive-only cleanup passes. It combines the current-main stability findings with the global Artifex rules/contract review needed to decide which apps are safe for controlled UI work and which require further repair or verification.

This document is a planning and audit record only. It does not authorise implementation, route changes, schema changes, archive moves, wrapper removal or UI redesign.

## Authority and boundaries

The audit must be read alongside:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/21-template-game-project-contract.md
docs/artifex/22-sound-archetype-generator.md
docs/artifex/23-current-main-scan-and-pr20-recovery.md
docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md
artifex/shared/todo-guide/audits/2026-06-01-change-timeline.md
artifex/shared/todo-guide/audits/2026-06-01-current-main-baseline-matrix.md
artifex/shared/todo-guide/audits/2026-06-01-archive-and-hotfix-inventory.md
```

Interpretation rules preserved from the accepted baseline:

```text
- Current main is the only implementation baseline.
- UI-only work must not silently include schemas, save paths, integration or architecture changes.
- A connected project root is the normal editable source of truth only where writable-folder behaviour has been verified and accepted for that app.
- localStorage is a recovery/draft or app-local state layer, not automatic evidence of contract-compliant authoring.
- ZIP/download/export behaviour is backup or fallback behaviour unless separately accepted as the app's current model.
- Stability and UI readiness are assessed app-by-app.
```

## Confirmed completed cleanup already merged into current main

| PR | Area | Merge commit | Scope and accepted result |
|---|---|---|---|
| #22 | Project Editor | `07fb19c7d8d01a8d7068d7f2b00ac5fb7900738d` | Archive-only move of four superseded files plus archive README records. Active entry remains `artifex/apps/project-editor/index.html` loading `./src/project-app.v7.js?v=0.1.32-contract`. |
| #23 | Quest Builder | `c0a82d69f08338a19447e26d28ba7fbcbbb5be28` | Archive-only move of six inactive legacy files plus archive README records. Active `quest-builder-v108.css` and `module-config.js` were deliberately retained because current V1.2.12 still uses them. |
| #24 | Puzzle Creator | `ce26b1c2cd42cd36ec6ba9c341ec360df8261c29` | Archive-only move of `maze-v109-controls.js` and `maze-v110-fixes.js` plus README. Active V1.32 route remains `src/js/main.js?v=1.28` and `maze-labyrinth-consolidation-loader.js?v=1.32`. |

These passes are complete and must not be treated as behavioural fixes or reopened by default.

## Global compliance and stability matrix

| App / surface | Current-main baseline and source status | Remaining debt / risk | UI implementation status | Recommended next step |
|---|---|---|---|---|
| Hub / app index | `artifex/index.html`, Hub V1.1.4; local active-project/library display. | Link/version/project-selection routes have not received a final baseline check; minor branding alignment may remain. | Likely safe only after quick route/version check. | Short read-only link/version baseline before any Hub polish. |
| Creation Guide | `artifex/apps/creation-guide/index.html`, V1.1.12; mixed: connected folder for starter/intake, local storage for library/active-project behaviour, ZIP backup. | `app-bootstrap.js` dynamically loads/patches `module-app.js`; `project-folder-setup.js` is a live transitional setup layer; starter schema/package alignment unverified. | Hold for its own work; does not block unrelated Puzzle/Sound UI lanes. | Dedicated current-main wrapper/contract verification when this app is selected. |
| Project Editor | `artifex/apps/project-editor/index.html`, v0.1.32 CONTRACT, loads `./src/project-app.v7.js?v=0.1.32-contract`; accepted status is mixed/local draft/export; direct project-folder authoring not confirmed live. | Naming drift and save/file-contract verification remain; old PR ideas are not merge candidates. | Hold pending app-specific baseline if selected. | Verify save path and remaining terminology from current main only. |
| Scene Editor | `artifex/apps/scene-editor/index.html`, v0.34-live-acceptance-repair; mixed/unclear local/download and active-project display. | Confirmed selected-object correctness failure; overlapping live ownership across inspector, transform, aspect/wrap, movement, sliders and card/visual behaviours. | **Blocked.** | First required behavioural repair: consolidate Object Inspector and transform ownership. |
| Quest Builder | `artifex/apps/quest-builder/index.html`, V1.2.12; local storage plus import/export/download; connected-project write path not confirmed. | Active older-named CSS/config retained correctly; later export/schema and Project Editor terminology checks remain. | Likely safe for presentation-only work after short baseline. | Baseline check before UI-only changes; keep schema/integration separate. |
| Puzzle Creator | `artifex/apps/puzzle-creator/index.html`, V1.32; active loader route retained; primarily import/export/download with some project-folder/registered-content reading. | Active consolidation loader remains accepted temporary condition; visible wording/branding and later save integration remain separate tasks. | **Recommended first fuller UI lane after quick baseline.** | Record visual/manual baseline, then UI-only changes excluding loader, engine, schema and save behaviour. |
| Archetype Object Creator | `artifex/apps/archetype-object-creator/index.html`, V1.35; intended project-folder save with browser draft/recovery and ZIP backup. | V1.35 explicitly unverified; Step 5 enhancement/layout/reference/frame/package layers and Sound Generator callback/save path require validation. | **Blocked pending validation.** | Validate complete V1.35 flow before UI or consolidation work. |
| Effect Editor | `index.html` V3.38 Emergency and `index2.html` INDEX2-CLEAN-0.2.3; mainly local/import-export; connected-folder writing not confirmed. | Two competing route baselines; primary route loads rescue/cleanup layers; index2 is only a candidate until parity/route review. | **Blocked pending route decision.** | Read-only route and feature-parity assessment before choosing a baseline. |
| Sound Generator preview/shared popup | `artifex/apps/sound-generator-preview/index.html` and `artifex/shared/sound-generator/sound-generator-window.js`, V1.00 preview. | Not save-free: project-folder recipe/index save, JSON import/export fallback, asset-index registration and caller assignment are integration-sensitive; Object Creator caller acceptance remains unverified. | **Recommended smallest low-risk UI lane after quick baseline, visual only.** | Smoke-test modal/controls; exclude save, asset-index and caller callback behaviour from UI polish. |

## Shared services position

| Shared surface | Accepted position | Later treatment |
|---|---|---|
| Shared project-folder service | Contract-critical foundation through `project-folder-client.js` and `project-structure-initializer.js`; not evidence that every app has adopted the file contract. | Test only as required by an approved app integration pass. |
| Shared active-project service | Local-storage active project/library service; app-dependent and not evidence of connected-folder saving. | Include in relevant app baseline checks, especially display injection/state overlap cases. |
| Shared registered-content service | Retained active shared content infrastructure; full adoption/compliance not confirmed by this audit. | Verify only within approved asset/index integration work. |
| Shared health/todo surfaces | Current evidence and output infrastructure; terminology/status cleanup may remain. | Documentation/terminology review later. |
| Shared Sound Generator runtime/store | Active permanent popup/UI/save owners; not archive candidates. | Preserve during visual-only work; do not touch save/index/callback behaviour unless specifically scoped. |

## Focused unresolved applications

### Scene Editor — confirmed blocker and required repair

Scene Editor is the only audited app with an accepted live correctness failure: controls for one selected object can affect another object. Its first implementation pass must repair selected-object ownership, not redesign its UI or merely replace sliders.

| Behaviour area | Live files identified in the accepted inventory | Required ownership direction |
|---|---|---|
| Inspector DOM/card structure | `scene-editor-renderer.js`, `scene-editor-card-controller.js`, `scene-editor-visual-adjustments.js`, `scene-editor-transform-controls.js`, `scene-editor-bindings.js` | `scene-editor-renderer.js` owns stable inspector structure; focused modules bind once to stable controls. |
| Transform inputs | `scene-editor-transform-controls.js`, `scene-editor-value-sliders.js`, `scene-editor-bindings.js`, `scene-editor-stage-drag.js`, `scene-editor-aspect-controls.js` | One selected-object transform/update path; no independent competing writes. |
| Movement/offscreen placement | `scene-editor-stage-drag.js`, `scene-editor-offscreen-placement.js`, `scene-editor-bindings.js` | One movement owner, with retained offscreen capability incorporated only if required. |
| Aspect ratio/wrap-to-image | `scene-editor-aspect-controls.js` | Move valid selected-object behaviour into the permanent transform/resize path. |
| Numeric sliders | `scene-editor-value-sliders.js`, `scene-editor-aspect-controls.js`, `scene-editor-bindings.js` | Slider UI may dispatch input, but the repaired transform path writes object data. |
| Visual adjustments | `scene-editor-visual-adjustments.js` and inspector/card dependencies | Retain valid controls, bind through stable selected-object inspector. |
| Layers/menu/preview | `scene-editor-layer-controls.js`, `scene-editor-menu-controller.js`, `scene-editor-object-preview.js` | Verify individually; consolidate only proven duplicated injected ownership. |

First required implementation scope:

```text
Scene Editor: consolidate Object Inspector and transform ownership to repair selected-object / wrong-object behaviour.
```

Mandatory manual acceptance gate:

```text
- Select and edit the ball: only the ball changes.
- Select and edit the box: only the box changes.
- Alternate selections while editing numeric values/sliders: no stale values are applied to the wrong object.
- Move, resize, rotate, skew, aspect-lock and wrap-to-image changes affect selected item only.
- Visual adjustments remain selected-object specific.
- Inspector cards render once without accumulating repair controls.
- Save/autosave, reload and preview remain functional.
- No replacement patch/helper/wrapper layer is introduced.
```

### Archetype Object Creator — validation before changes

V1.35 is active but not accepted as verified. Current active areas needing validation are:

```text
v1/src/object-wizard-step5.js
v1/src/object-wizard-step5-layout.js
v1/src/object-wizard-reference-panel.js
v1/src/object-wizard-frame-correction.js
v1/src/object-wizard-asset-package.js
v1/src/object-project-storage.js
v1/src/object-wizard-build-checklist.js
```

The Step 5 flow calls the shared Sound Generator popup and the storage path is intended to write object records and update `archetypes/object-index.json`, with browser recovery behaviour where no writable folder is available. This establishes the intended path, not proven acceptance of the full V1.35 workflow.

Required next analysis: validate wizard flow, save/index update, recovery behaviour and Sound Generator callback before approving UI changes or consolidation.

### Effect Editor — route decision before work

```text
Primary:   artifex/apps/effect-editor/index.html  — V3.38 Emergency
Candidate: artifex/apps/effect-editor/index2.html — INDEX2-CLEAN-0.2.3
```

The primary entry loads active emergency/rescue behaviour; index2 appears cleaner but is not accepted as the baseline until feature parity and routing are reviewed. No route should be changed, and no emergency wrapper should be archived, until that decision is made.

Required next analysis: read-only feature-parity and route assessment, followed by a separately approved route decision.

### Creation Guide — app-local wrapper and contract debt

Creation Guide still requires later current-main review of live bootstrap/folder setup wrappers and starter-project/schema output. This matters for reliable future project creation; it does not prevent UI-only work in separately bounded Puzzle Creator or Sound Generator surfaces.

### Project Editor — save-path verification remains

PR #22 cleaned obsolete files but did not establish direct connected-folder authoring. Keep the accepted status:

```text
Mixed/local draft/export; direct project-folder authoring not confirmed live.
```

Later work should verify save/export behaviour, schema alignment and remaining Project Manager terminology from current main only. PR #9 remains comparison-only evidence, not an implementation base.

## UI resumption readiness

| Candidate | Gate still required | Safe UI-only scope | Explicit exclusions | Decision |
|---|---|---|---|---|
| Puzzle Creator V1.32 | Short visual/manual baseline and recorded version/entry route. | Panel layout, spacing, typography, cards, toolbar/button/icon presentation and visible wording corrections. | Maze engine, active loader consolidation, schemas, save paths, project-folder/registered-content integration and new wrappers. | **First fuller UI-only lane.** |
| Sound Generator preview/shared popup V1.00 | Short modal-open/control/preview smoke test. | Popup/card layout, typography, spacing, control readability and visual accessibility. | Project-folder recipe save, asset-index registration, JSON import/export behaviour, save-and-assign callback and Object Creator integration. | **Smallest low-risk UI-only lane.** |
| Quest Builder V1.2.12 | Quick entry/runtime/style and visible-flow check. | Presentation-only card/flow/menu/control styling. | Schema, connection logic, export/save integration and new wrappers. | Suitable later visual lane. |
| Hub V1.1.4 | Link/version/project-selection baseline. | Branding, spacing, typography and app-card presentation. | Route restructuring and active-project/local-storage behaviour. | Small later UI candidate. |

## Prioritised remaining work queue

### Required read-only analysis still remaining

| Priority | Surface | Task | Blocks UI in other apps? | Recommended owner | Scope |
|---:|---|---|---:|---|---:|
| 1 | Effect Editor | Route and feature-parity decision between `index.html` and `index2.html`. | No; blocks Effect Editor only. | Agent/research | Medium |
| 2 | Archetype Object Creator | Validate V1.35 wizard/save/index/Sound Generator callback behaviour. | No; blocks Object Creator only. | Agent plus manual checks | Medium |
| 3 | Project Editor | Verify save/export behaviour and remaining naming drift. | No; blocks functional expansion there. | Agent/research | Small-medium |
| 4 | Hub | Check module routes and visible versions. | No; blocks Hub UI only. | Agent/research | Small |
| 5 | Creation Guide | Verify starter ZIP/package/schema alignment. | No for unrelated visual lanes. | Agent/research | Medium |

### Behavioural and contract implementation work

| Priority | Surface | Task | Recommended owner | Scope |
|---:|---|---|---|---:|
| 1 | Scene Editor | Object Inspector and transform ownership consolidation with ball/box acceptance gate. | Codex after explicit approval | Large |
| 2 | Effect Editor | Implement accepted route decision and consolidate/archive route-specific rescue debt. | Codex after route audit | Medium |
| 3 | Archetype Object Creator | Consolidate validated Step 5 transitional behaviour into permanent ownership. | Codex after validation | Medium |
| 4 | Creation Guide | Align starter/package/export behaviour and consolidate bootstrap/folder ownership. | Codex after contract audit | Medium |
| 5 | Project Editor | Implement only verified required save/file-contract alignment and approved terminology changes. | Codex after save audit | Medium |
| 6 | Quest Builder / Puzzle Creator / Sound Generator | Later contract/save/caller integration work as individually scoped. | Codex after separate verification | Medium |

### Documentation-only and optional archive work

```text
- Verify/correct Sound Generator README references to retained UI filenames.
- Migrate remaining visible Project Manager terminology where approved.
- Correct or confirm Puzzle Creator visible module eyebrow label during an approved UI-only pass.
- Review health/todo stale wording later.
- Do not continue archive cleanup by default; any further archive pass requires a clear app-specific benefit and fresh verification.
```

## Accepted conclusion and next choices

Stable/cleared for consideration:

```text
- Three archive-only passes are merged and recorded.
- Puzzle Creator is suitable for UI-only work after a quick baseline check.
- Sound Generator preview/shared popup is suitable for visual-only work after a quick baseline check, with all save/caller behaviour excluded.
```

Still messy but not cross-app blocking:

```text
- Creation Guide wrapper and schema verification debt.
- Object Creator Step 5 and Sound Generator integration validation debt.
- Quest Builder later save/schema and terminology debt.
- Hub route/version baseline work.
```

Blocked within their own apps:

```text
- Scene Editor: confirmed selected-object correctness failure; repair before UI work there.
- Effect Editor: route/baseline ambiguity; decide route before UI work there.
- Archetype Object Creator: V1.35 validation required before changes there.
```

Next required behavioural repair:

```text
Scene Editor: consolidate Object Inspector and transform ownership.
```

Recommended first fuller UI-only lane:

```text
Puzzle Creator V1.32 after a quick current-main baseline check.
```

Recommended smallest low-risk UI-only lane:

```text
Sound Generator preview/shared popup after a quick visual/control smoke check, excluding save and caller integration.
```
