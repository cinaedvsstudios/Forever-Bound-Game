# Artifex Rules-Compliance and Stability Analysis — Corrected Master Audit

## Status and purpose

Date originally recorded: 2026-06-01.  
Current-main refresh recorded: 2026-06-02.

This is the accepted corrected master-audit record after the 31 May integration review, the Phase 1 archive/hotfix inventory, the approved archive-only cleanup passes and the later accepted Effect Editor and Scene Editor work now present on GitHub `main`.

Current `main` verified for the refresh:

```text
81c7a6df28fa6f0d57b7033076a7ec28c2ca34d7
```

This document is a planning and audit record only. It does not authorise new runtime implementation, schema changes, save-contract changes, archive moves, UI redesign or merging unaccepted work.

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
artifex/shared/todo-guide/audits/2026-06-01-effect-editor-route-decision-audit.md
artifex/shared/todo-guide/audits/2026-06-02-code-vs-documentation-current-main-refresh.md
```

Interpretation rules:

```text
- Current main is the only implementation baseline.
- Older audits remain evidence of why work was needed; later verified refreshes supersede their stale current-status statements.
- UI-only work must not silently include schemas, save paths, integration or architecture changes.
- A connected project root is the normal editable source of truth only where writable-folder behaviour has been verified and accepted for that app.
- localStorage is a recovery/draft or app-local state layer, not automatic evidence of contract-compliant authoring.
- ZIP/download/export behaviour is backup or fallback behaviour unless separately accepted as the app's current model.
- Stability and UI readiness are assessed app-by-app.
- Merged implementation does not equal manual browser acceptance unless the accepted test result is recorded.
```

## Confirmed merged work already present on current main

| PR / set | Area | Scope and accepted current-main result |
|---|---|---|
| #22 | Project Editor | Archive-only move of four superseded files plus archive README records. Active entry remains `artifex/apps/project-editor/index.html` loading `./src/project-app.v7.js?v=0.1.32-contract`. |
| #23 | Quest Builder | Archive-only move of inactive legacy files plus archive README records. Required active V1.2.12 support files were retained. |
| #24 | Puzzle Creator | Archive-only move of `maze-v109-controls.js` and `maze-v110-fixes.js`; active V1.32 loader route remains. |
| #25 | Effect Editor / Hub | Hub cut over to accepted `artifex/apps/effect-editor/index2.html?from=hub`. |
| #27–#33 | Effect Editor | Index2 parity controls and subsequent focused repairs restored Rotation Direction, Orbital Force, ALL CAPS, helper stability, corrected emitter/header UI and Brush / Shape Library, now at `INDEX2-CLEAN-0.2.6`. |
| #34–#36 | Effect Editor docs/status | Backlog/reference records and baseline-matrix refresh for accepted Index2 state. |
| #37 | Scene Editor | Ownership consolidation implementation merged as `v0.35-owner-consolidation`; deployed manual acceptance still requires recording. |

These merges must not be reopened or overwritten by earlier branches by default. Object Creator PR #38 is **not** in this list because it is open and under review.

## Global compliance and stability matrix — refreshed current-main interpretation

| App / surface | Current-main baseline and source status | Remaining debt / risk | UI implementation status | Recommended next step |
|---|---|---|---|---|
| Hub / app index | `artifex/index.html`, Hub V1.1.4; Effect Editor navigation now points to accepted Index2 route. | Broader link/version/project-selection presentation baseline has not received a final check. | Likely safe only after quick route/version check. | Short read-only link/version baseline before Hub polish. |
| Creation Guide | `artifex/apps/creation-guide/index.html`, V1.1.12; mixed connected-folder/local/ZIP behaviour. | Live bootstrap/folder wrappers and starter schema/package alignment remain unverified; PR #20 is not a merge base. | Hold for its own work; does not block unrelated lanes. | Dedicated current-main wrapper/contract verification when selected. |
| Project Editor | `artifex/apps/project-editor/index.html`, v0.1.32 CONTRACT; archive-only cleanup complete. | Naming drift and direct connected-folder save/file-contract verification remain; PR #9 remains comparison-only evidence. | Hold pending app-specific baseline if selected. | Verify save path and terminology from current main only. |
| Scene Editor | `artifex/apps/scene-editor/index.html`, `v0.35-owner-consolidation`; ownership consolidation merged in PR #37. | Required implementation is present, but no checked record confirms a completed deployed manual acceptance run after merge. | **Implementation merged; acceptance pending.** | Run the exact deployed browser acceptance gate before new Scene Editor work. |
| Quest Builder | `artifex/apps/quest-builder/index.html`, V1.2.12; archive-only cleanup complete. | Later export/schema, connected-project handoff and Project Editor terminology checks remain. | Likely safe for presentation-only work after short baseline. | Baseline check before UI-only changes; keep integration separate. |
| Puzzle Creator | `artifex/apps/puzzle-creator/index.html`, V1.32; active loader retained; archive-only cleanup complete. | Active consolidation loader remains a retained condition; README wording and later save integration may require bounded follow-up. | **Current read-only/manual baseline lane is valid.** | Complete the already running Puzzle Creator baseline task before new Puzzle work. |
| Archetype Object Creator | Current `main` remains V1.35/unverified; V1.36 exists only in open PR #38. | PR #38 has recorded P1/P2 review findings affecting promotion/readiness, generated sound assignment persistence and hidden playback/trigger field preservation. | **Blocked/in review.** | Repair and review PR #38; do not describe V1.36 as accepted current main. |
| Effect Editor | `artifex/apps/effect-editor/index2.html`, `INDEX2-CLEAN-0.2.6`; Hub targets Index2. | Save/project-folder integration, Effect Library, guides, real-engine expansion, My Settings and later technical cleanup remain future scoped work. | **Accepted usable baseline; no route/parity blocker.** | Select only a separately approved future feature/save/polish pass. |
| Sound Generator preview/shared popup | V1.00 preview and shared popup retained. | Save/index/caller assignment remain integration-sensitive, especially while Object Creator PR #38 is unresolved. | Potential visual-only lane after smoke test. | Avoid save/index/caller changes outside explicit scope. |

## Shared services position

| Shared surface | Accepted position | Later treatment |
|---|---|---|
| Shared project-folder service | Contract-critical foundation through `project-folder-client.js` and initialisation helpers; not evidence every app has adopted the contract. | Do not modify from this docs pass; Object Creator PR #38 actively touches this area. |
| Shared active-project service | Local-storage active project/library service; app-dependent and not evidence of connected-folder saving. | Include in relevant app baseline checks. |
| Shared registered-content service | Retained active shared content infrastructure; full adoption/compliance not confirmed here. | Verify only within approved asset/index integration work. |
| Shared health/todo surfaces | Current evidence and output infrastructure; some terminology/status cleanup remains. | Keep status records aligned to accepted current-main changes. |
| Shared Sound Generator runtime/store | Active popup/UI/save ownership; not an archive candidate. | Preserve during visual-only work; save/index/callback behaviour requires explicit scope. |

## Focused current application positions

### Scene Editor — implementation delivered, browser acceptance pending

Earlier audit findings correctly identified the required repair: controls for one selected object could affect another because inspector, transform, aspect/wrap, movement, slider and UI-maintenance behaviours had competing owners.

PR #37 implemented the required ownership consolidation and is merged on `main`:

```text
Active version: v0.35-owner-consolidation
Merge commit: d759ae7412779de5689eb202ce9024829af6b58d
```

| Behaviour area | Current active owner after merged PR #37 |
|---|---|
| Permanent Object Inspector structure and controls markup | `scene-editor-renderer.js` |
| Ordinary form/model binding | `scene-editor-bindings.js` |
| Rotation, resize, scale, Wrap Bounding Box, Aspect Ratio Lock and Border binding | `scene-editor-transform-controls.js` |
| Move-handle drag, middle-mouse pan, X/Y sync and offscreen range | `scene-editor-stage-drag.js` |
| Layer ordering, lock and recalculation | `scene-editor-layer-controls.js` |
| Slider UI/readout dispatch | `scene-editor-value-sliders.js` |
| Visual editing | `scene-editor-visual-adjustments.js` |
| Asset selection/path interaction | `scene-editor-asset-path-tools.js` |
| Preview interaction | `scene-editor-object-preview.js` |
| Menu interaction | `scene-editor-menu-controller.js` |
| Border display-state styling | `scene-editor-object-states.css` |

Removed from the active `index.html` load chain after retained behaviour was absorbed into owners:

```text
scene-editor-aspect-controls.js
scene-editor-card-controller.js
scene-editor-offscreen-placement.js
```

Required final manual acceptance gate remains:

```text
- Select ball and test Wrap, Aspect, size and visual changes: only ball changes.
- Select box and repeat: only box changes.
- Confirm a square image wraps to a visually square area on the 16:9 stage.
- Confirm Border is present, visible and object-specific.
- Reorder layers and Recalculate; verify persistence after rerender and save/reload, including locked layers.
- Test move-handle drag, editable X/Y, offscreen positions and middle-mouse pan.
- Test asset picker, object preview, menu actions, import and Download JSON.
- Wait after interaction and confirm no duplicate/reinstalled markup or console errors.
```

Until that gate is recorded as passed, Scene Editor is not a finished stable baseline for new work, but it is also no longer accurately described as awaiting ownership implementation.

### Effect Editor — accepted Index2 baseline, original blocker resolved

The original audit identified route ambiguity and three missing parity features. Those statements are superseded by accepted merged work now on `main`.

```text
Accepted route: artifex/apps/effect-editor/index2.html
Accepted visible/cache version: INDEX2-CLEAN-0.2.6
Hub route: artifex/apps/effect-editor/index2.html?from=hub
```

Confirmed now present:

```text
- Rotation Direction / Degree Range controls and Orbital Force.
- ALL CAPS text action.
- Working layer-delete repair with user-required panel/diagnostics placement restored.
- Required runtime-helper fixes for Dynamics/Quick Edit operation.
- Corrected ARTIFEX rune/header grouping and emitter-control mapping.
- Restored Brush / Shape Library.
- Recorded future Effect Library, save-action, emission-guide, engine and My Settings/pinned-control backlog.
```

The old emergency route remains reference/rollback material only unless separately scoped. Later Effect Editor work must not be described as route rescue or missing original parity implementation.

### Archetype Object Creator — active proposal remains unaccepted

Current `main` still requires the V1.35 validation interpretation. Open PR #38 proposes V1.36 lifecycle/save/Step 5 work but must not be treated as delivered.

Recorded PR #38 findings to resolve before acceptance include:

```text
- Promoted gameplay frames may fail to populate the visual sprite asset ID required by Finish / Mark Object Ready.
- Generated sound assignments in a blank row may be lost after the next visible edit.
- Existing hidden playback/trigger values may be reset when visible Step 5 fields are edited.
```

### Puzzle Creator — approved V1.32 work retained while current baseline task runs

Puzzle Creator V1.32 is live on current `main`, with the active consolidation loader retained and archive-only PR #24 complete. Its detailed Maze/Labyrinth status record already documents approved Scatter placement modes. Any additional app-specific README/status correction should be resolved by the already running Puzzle Creator baseline/documentation task to avoid parallel overlap.

### Creation Guide and Project Editor — still require their own current-main verification

Neither older open PR is an accepted repair route:

```text
PR #9  — Project Editor: compare-only evidence; do not merge as-is.
PR #20 — Creation Guide / Project Editor cleanup: unsafe/abandoned; do not merge or base work on it.
```

## UI resumption readiness

| Candidate | Gate still required | Safe initial scope | Explicit exclusions | Decision |
|---|---|---|---|---|
| Puzzle Creator V1.32 | Complete the running short baseline/manual documentation check. | Later visual-only UI work if that check passes. | Loader/engine/schema/save/project-folder work and new wrappers. | Current independent check is appropriate. |
| Scene Editor v0.35 | Deployed manual acceptance of merged ownership consolidation. | Only after acceptance is recorded. | No new features/UI expansion before the acceptance gate. | Implementation done; acceptance next. |
| Effect Editor Index2 0.2.6 | New approved scope only. | Later feature/save/polish work chosen by user. | No revival of old emergency route; no unscoped save or architecture rewrite. | Accepted baseline available. |
| Sound Generator preview/shared popup V1.00 | Short modal/control/preview smoke test. | Visual presentation only. | Project-folder save, asset registration and Object Creator caller integration. | Potential small later lane. |
| Quest Builder V1.2.12 | Quick entry/runtime/style and visible-flow check. | Presentation only. | Schema, connection logic, save integration and new wrappers. | Later safe visual lane. |

## Prioritised immediate queue

```text
1. Review the running Puzzle Creator baseline/documentation result.
2. Repair/review Object Creator PR #38; do not merge its current reviewed state.
3. Perform Scene Editor v0.35 deployed manual acceptance and record the result.
4. Once Object Creator no longer overlaps it, refresh the shared baseline matrix to remove stale Scene Editor implementation wording.
5. Choose later Effect Editor, Project Editor, Creation Guide, Quest Builder or Sound Generator work only as separate scoped passes.
```

## Documentation overlap note

The current-main baseline matrix has already been correctly refreshed for the Effect Editor through PR #36, but still contains stale pre-PR-#37 Scene Editor implementation language. It is intentionally not edited by this refresh because open Object Creator PR #38 also changes that shared matrix. That remaining correction should be made once the active overlap is resolved.

## Accepted conclusion

```text
- Effect Editor no longer has a route/parity blocker: accepted Index2 0.2.6 is on main.
- Scene Editor no longer awaits its ownership implementation: v0.35-owner-consolidation is on main, with manual acceptance pending.
- Puzzle Creator remains an appropriate current baseline/documentation lane while its running task finishes.
- Object Creator V1.36 remains an open reviewed proposal, not accepted current-main work.
- Creation Guide and Project Editor still require fresh current-main verification rather than old PR reuse.
```
