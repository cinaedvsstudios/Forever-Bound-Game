# Artifex Stabilisation, Cleanup and UI Resumption Plan

## Purpose

This document is the current progress tracker and decision gate for restoring safe Artifex UI work after the large mixed integration period on 31 May 2026.

The objective is not to pause development until every app is perfect. The objective is to resume work app-by-app from a verified current-main baseline, without silently stacking UI work over broken behaviour, ambiguous save paths, obsolete files or temporary patch layers.

Central controls:

1. Move genuinely unused or superseded files into documented archive folders only after verification.
2. Integrate active hotfixes and transitional wrappers into permanent owning modules only after behaviour is understood and tested.
3. Reopen UI-only work only where the baseline is known and the scope excludes unapproved schema, save, integration and architecture changes.
4. Start implementation only after the user approves a named pass; stop for review after each pass.

## Current progress status — refreshed 2 June 2026

Current GitHub `main` verified for this refresh:

```text
81c7a6df28fa6f0d57b7033076a7ec28c2ca34d7
```

This refresh records already-merged work only. Archetype Object Creator PR #38 remains open and under review; its proposed V1.36 state is not treated as current-main completion.

### Completed: Phase 0 — Preserve current truth and stop hidden drift

Recorded audit files:

```text
artifex/shared/todo-guide/audits/2026-06-01-change-timeline.md
artifex/shared/todo-guide/audits/2026-06-01-current-main-baseline-matrix.md
```

Original outcome preserved as historical evidence:

```text
- A large mixed merge on 31 May brought runtime, shared-service, documentation and asset work into main across several apps.
- Scene Editor v0.34 reached main but failed manual acceptance and required ownership consolidation.
- Archetype Object Creator V1.35 reached main but remained unverified.
- Effect Editor initially had baseline ambiguity between an emergency primary route and an index2 clean-route candidate.
- PR #20 was unsafe/abandoned and must not be used as a development base.
- PR #9 and PR #17 were evidence only and must not be merged blindly.
```

Later phases below supersede the original Scene Editor and Effect Editor action conclusions.

### Completed: Phase 1 — Archive and hotfix consolidation inventory

Recorded audit file:

```text
artifex/shared/todo-guide/audits/2026-06-01-archive-and-hotfix-inventory.md
```

The inventory correctly identified the then-live repair debt. It remains useful as evidence of why later consolidation work was needed, but its pre-repair Scene Editor and pre-decision Effect Editor statuses are no longer current.

### Completed: Phase 2A — Project Editor archive-only pass 01

PR #22 was reviewed and merged into `main` on 1 June 2026.

```text
PR: #22
Merge commit: 07fb19c7d8d01a8d7068d7f2b00ac5fb7900738d
Scope: archive-only; no active runtime behaviour change.
```

Archived:

```text
artifex/apps/project-editor/index.split.html
  → artifex/apps/project-editor/archive/pre-v0132-contract/index.split.html
artifex/apps/project-editor/index.v7.html
  → artifex/apps/project-editor/archive/pre-v0132-contract/index.v7.html
artifex/apps/project-editor/index.monolith.backup.html
  → artifex/apps/project-editor/archive/pre-split-monolith/index.monolith.backup.html
artifex/apps/project-editor/src/project-app.js
  → artifex/apps/project-editor/archive/pre-v7-split/project-app.js
```

The active entry remains `artifex/apps/project-editor/index.html` loading `./src/project-app.v7.js?v=0.1.32-contract`.

### Completed: Phase 2B — Quest Builder archive-only pass 01

PR #23 was reviewed and merged into `main` on 1 June 2026.

```text
PR: #23
Merge commit: c0a82d69f08338a19447e26d28ba7fbcbbb5be28
Scope: archive-only; no active runtime behaviour change.
```

Archived:

```text
artifex/apps/quest-builder/v1/quest-builder-v108.js
artifex/apps/quest-builder/v1/styles.css
artifex/apps/quest-builder/v1/src/module-app.js
artifex/apps/quest-builder/v1/src/module-io.js
artifex/apps/quest-builder/v1/src/module-renderer.js
artifex/apps/quest-builder/v1/src/module-state.js
```

Deliberately retained as active:

```text
artifex/apps/quest-builder/v1/quest-builder-v108.css
artifex/apps/quest-builder/v1/src/module-config.js
```

### Completed: Phase 2C — Puzzle Creator archive-only pass 01

PR #24 was reviewed and merged into `main` on 1 June 2026.

```text
PR: #24
Merge commit: ce26b1c2cd42cd36ec6ba9c341ec360df8261c29
Scope: archive-only; no active runtime behaviour change.
```

Archived:

```text
artifex/apps/puzzle-creator/src/js/engines/maze-v109-controls.js
  → artifex/apps/puzzle-creator/archive/legacy-maze-pre-v132/maze-v109-controls.js
artifex/apps/puzzle-creator/src/js/engines/maze-v110-fixes.js
  → artifex/apps/puzzle-creator/archive/legacy-maze-pre-v132/maze-v110-fixes.js
```

The active Puzzle Creator route remains V1.32 with `src/js/main.js?v=1.28` and `src/js/engines/maze-labyrinth-consolidation-loader.js?v=1.32`. Its detailed Maze/Labyrinth status file records V1.32 approval and implemented Scatter placement modes. A parallel Puzzle Creator baseline task is currently responsible for any further Puzzle Creator-specific documentation correction.

### Completed: Phase 3 — Corrected master rules-compliance and stability analysis

Recorded audit file:

```text
artifex/shared/todo-guide/audits/2026-06-01-master-rules-compliance-and-stability-audit.md
```

That audit was accurate at the time it was produced. It has now been refreshed to recognise subsequent merged Effect Editor work and the merged Scene Editor ownership implementation.

### Completed: Phase 4 — Effect Editor route decision and Hub cutover

Recorded audit file:

```text
artifex/shared/todo-guide/audits/2026-06-01-effect-editor-route-decision-audit.md
```

The read-only route audit and user manual deployed-browser comparison confirmed that the clean rewrite remained available at `index2.html`, while the old default route exposed an emergency/repaired version.

PR #25, **Route Effect Editor hub link to accepted index2 baseline**, was reviewed and merged into `main` on 1 June 2026.

```text
PR: #25
Merge commit: a4a1bc9f03fe1c3e9ed08c066851adb8743bc520
Scope: Hub-link-only route cutover; no Effect Editor implementation files changed.
Hub target: apps/effect-editor/index2.html?from=hub
```

### Completed: Phase 5 — Effect Editor Index2 parity and accepted repair sequence

The earlier route decision identified three parity gaps. Those gaps are no longer outstanding: they were implemented into the accepted Index2 route and followed by scoped acceptance repairs.

Merged sequence:

| PR | Result now present on `main` |
|---|---|
| #27 | Ported Rotation Direction modes, Orbital Force and ALL CAPS text control into Index2 permanent modules. |
| #28 | Repaired text-layer/layer-delete behaviour; user-corrected panel/text-default portions were superseded by #29. |
| #29 | Restored required Effect Specific Controls/diagnostics placement and intended Rising Spell Text sample behaviour. |
| #30 | Repaired missing `finite` helper used by Dynamics/Orbital Force synchronisation. |
| #31 | Repaired missing `setText` helper in Dynamics controls. |
| #32 | Corrected ARTIFEX rune/header alignment and Rotate/Degree Range emitter-control wiring. |
| #33 | Restored existing Brush / Shape Library to Index2. |
| #34–#35 | Recorded later Effect Editor backlog and visual/reference/My Settings notes. |
| #36 | Updated the current-main baseline matrix for the accepted Effect Editor Index2 state. |

Accepted Effect Editor baseline on current `main`:

```text
Entry point: artifex/apps/effect-editor/index2.html
Visible/cache version: INDEX2-CLEAN-0.2.6
Hub target: artifex/apps/effect-editor/index2.html?from=hub
```

Remaining Effect Editor work is not route selection or the three original parity gaps. It is separately scoped later work: connected-project save/status and canonical effect-index integration, Effect Library thumbnails/previews, emission guides, real FX engine expansion and preset quality, My Settings/pinned-controls restoration, and later technical cleanup where approved.

### Completed implementation, acceptance pending: Phase 6 — Scene Editor ownership consolidation

The earlier audits correctly required Scene Editor to consolidate Object Inspector and transform ownership. That implementation has now merged through PR #37.

```text
PR: #37 — Consolidate Scene Editor object, movement and UI ownership
Merge commit: d759ae7412779de5689eb202ce9024829af6b58d
Active entry point: artifex/apps/scene-editor/index.html
Visible/cache version: v0.35-owner-consolidation
```

Confirmed implementation now on `main`:

```text
- scene-editor-renderer.js owns permanent inspector/card structure.
- scene-editor-transform-controls.js owns rotation, resize, scale, Wrap Bounding Box, Aspect Ratio Lock and Border binding.
- scene-editor-stage-drag.js owns move-handle drag, middle-mouse pan, X/Y drag sync and offscreen range.
- scene-editor-layer-controls.js is reduced to layer responsibilities.
- scene-editor-value-sliders.js no longer has a separate direct transform mutation route.
- scene-editor-aspect-controls.js, scene-editor-card-controller.js and scene-editor-offscreen-placement.js are removed from the active index.html load chain.
- scene-editor-object-states.css is active for permanent Border display behaviour.
```

No checked current-main document records a completed post-merge deployed manual browser acceptance run. Therefore the correct status is:

```text
Implementation merged; manual acceptance pending.
```

Required final acceptance gate:

```text
- Select and edit the ball: only the ball changes.
- Select and edit the box: only the box changes.
- Confirm a square image wraps as visibly square on the rendered 16:9 stage.
- Confirm Border visibly hides/shows the selected object border only.
- Reorder layers and Recalculate; confirm persistence after rerender and save/reload, including locked layers.
- Test move-handle drag, editable X/Y, offscreen coordinates and middle-mouse workspace pan.
- Test asset picker, object preview, menu actions, import and Download JSON.
- Wait after interaction and confirm no duplicated/reinstalled controls and no console errors.
```

## Current authority set

All later analysis and implementation work must use current `main` and check against:

```text
docs/artifex/00-index.md
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/21-template-game-project-contract.md
docs/artifex/22-sound-archetype-generator.md
docs/artifex/23-current-main-scan-and-pr20-recovery.md
docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
artifex/shared/todo-guide/audits/2026-06-01-change-timeline.md
artifex/shared/todo-guide/audits/2026-06-01-current-main-baseline-matrix.md
artifex/shared/todo-guide/audits/2026-06-01-archive-and-hotfix-inventory.md
artifex/shared/todo-guide/audits/2026-06-01-master-rules-compliance-and-stability-audit.md
artifex/shared/todo-guide/audits/2026-06-01-effect-editor-route-decision-audit.md
artifex/shared/todo-guide/audits/2026-06-02-code-vs-documentation-current-main-refresh.md
```

Note: the baseline matrix is also being touched by active Object Creator PR #38, so it should receive any additional Scene Editor refresh only after that overlap is resolved.

## Current app-by-app position

| Surface | Current verified position | Next permitted/recommended action |
|---|---|---|
| Effect Editor | Accepted `index2.html` / `INDEX2-CLEAN-0.2.6`; original route/parity blocker resolved. | Future scoped save/library/guides/engine/My Settings work only if selected. |
| Scene Editor | `v0.35-owner-consolidation` merged; acceptance not yet recorded. | Run deployed manual acceptance; do not claim stable completion until it passes. |
| Puzzle Creator | V1.32; archive-only cleanup complete; permanent named modules/active loader retained. | Allow the current read-only/manual baseline task to complete before further Puzzle changes. |
| Archetype Object Creator | V1.35 remains current main; V1.36 is proposed in open PR #38 with review findings. | Repair/review PR #38; do not mark complete or merge while findings remain. |
| Sound Generator preview/shared popup | Retained intentional preview/runtime surface; caller acceptance remains tied to Object Creator. | Visual-only smoke/UI pass remains possible only without save/callback work. |
| Quest Builder | Archive-only cleanup complete; later save/schema/terminology and puzzle handoff work remains. | Later bounded baseline/integration work. |
| Project Editor | Archive-only cleanup complete; connected-folder save and terminology verification remains. | Current-main-only analysis later; do not merge PR #9 as-is. |
| Creation Guide | Live wrapper/schema/package verification debt remains. | Current-main-only verification later; do not use PR #20 as a base. |

## Current immediate work lanes

```text
1. Allow the running Puzzle Creator baseline/documentation task to finish and review its findings.
2. Correct and review Object Creator PR #38; it is not accepted current-main work yet.
3. Run the deployed manual acceptance gate for merged Scene Editor v0.35-owner-consolidation.
4. After active Object Creator overlap ends, correct the remaining stale Scene Editor wording in the baseline matrix.
```

## Non-negotiable working controls

1. Current `main` is the only implementation baseline. Old PRs and branches may be inspected as evidence only unless explicitly approved otherwise.
2. Audit and mapping work is read-only unless the user separately authorises a documentation correction or implementation pass.
3. Implementation begins only after the user approves a named pass, permitted file area, prohibited changes and acceptance checks.
4. One app and one concern per implementation pass. UI, save-contract integration, schema work, parity work and hotfix consolidation remain separate unless explicitly approved as unavoidable.
5. No new patch/hotfix/wrapper files as the normal fix route. Valid behaviour moves into permanent ownership.
6. No silent multi-hour implementation. Every pass stops with a report and review gate.
7. Archive rather than delete obsolete work initially, and only after verified inactivity or successful replacement.
8. A manual acceptance gate is required before another implementation pass begins in an app with pending acceptance.

## What is explicitly not authorised

```text
- a repo-wide automatic cleanup;
- moving old-looking files into archive without evidence;
- deleting old implementations instead of initially archiving them;
- merging PR #20 or using it as a development base;
- blindly merging PR #9 or PR #17;
- treating Object Creator PR #38 as accepted before its review findings are resolved and it is merged/accepted;
- a mass save-schema or connected-folder rewrite;
- bundling architecture work into a UI-only or parity pass;
- continuing implementation work without a stop-and-report checkpoint.
```
