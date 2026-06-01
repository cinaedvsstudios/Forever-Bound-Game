# Artifex Stabilisation, Cleanup and UI Resumption Plan

## Purpose

This document is the current progress tracker and decision gate for restoring safe Artifex UI work after the large mixed integration period on 31 May 2026.

The objective is not to pause all development until every app is perfect. The objective is to ensure that work resumes app-by-app from a known current-main baseline, without silently stacking new UI work over broken behaviour, ambiguous save paths, obsolete files or temporary patch layers.

Central cleanup goals:

1. Move genuinely unused, superseded and obsolete files into documented archive folders rather than leaving dead code mixed with active runtime code.
2. Integrate active hotfixes, patch layers and transitional wrappers into permanent owning modules only after their behaviour is understood and tested.
3. Reopen UI-only work only in apps whose current baseline is known and whose initial UI scope explicitly excludes unapproved schema, save, integration and architectural changes.

This plan does not authorise implementation by itself. Each new pass requires explicit user approval.

## Current Progress Status — Updated 1 June 2026

### Completed: Phase 0 — Preserve current truth and stop hidden drift

Recorded audit files:

```text
artifex/shared/todo-guide/audits/2026-06-01-change-timeline.md
artifex/shared/todo-guide/audits/2026-06-01-current-main-baseline-matrix.md
```

Confirmed outcome:

```text
- A large mixed merge on 31 May brought runtime, shared-service, documentation and asset work into main across several apps.
- Scene Editor v0.34 reached main but failed manual acceptance and requires ownership consolidation before UI work there.
- Archetype Object Creator V1.35 reached main but remains unverified.
- Effect Editor has unresolved baseline ambiguity between its emergency primary route and index2 clean-route candidate.
- PR #20 is unsafe/abandoned as a merge target and must not be used as a development base.
- PR #9 is diff-based salvage evidence only if Project Editor is selected later.
- PR #17 is historical Effect Editor evidence only and should not be merged.
```

### Completed: Phase 1 — Archive and hotfix consolidation inventory

Recorded audit file:

```text
artifex/shared/todo-guide/audits/2026-06-01-archive-and-hotfix-inventory.md
```

Confirmed outcome:

```text
- Scene Editor contains live overlapping ownership across inspector structure, transform input, aspect/wrap, movement, numeric sliders and card/visual rendering; these modules cannot simply be archived.
- Archetype Object Creator has active Step 5 enhancement/layout/frame/package layers and must be validated before consolidation or UI implementation.
- Effect Editor must receive an accepted-route decision before rescue-layer consolidation or UI implementation.
- Creation Guide has live current-main wrapper debt independently of abandoned PR #20.
- Project Editor, Quest Builder and Puzzle Creator each contained narrow inactive/superseded archive candidates suitable for separately verified archive-only passes.
- Sound Generator preview/shared popup is intentional retained code and remains a likely small UI-only lane after a smoke check.
```

Important limitation retained from the Phase 1 audit: Codex reported no local `main` ref or remotes in that checkout. Every implementation/archive pass was therefore required to re-check its named files from the current GitHub baseline before movement or code change.

### Completed: Phase 2A — Project Editor archive-only pass 01

PR #22, **Archive superseded Project Editor static files**, was reviewed and merged into `main` on 1 June 2026.

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

PR #23, **Archive inactive Quest Builder legacy files (v1.0.8 + pre-v1.2.12 module-app)**, was reviewed and merged into `main` on 1 June 2026.

```text
PR: #23
Merge commit: c0a82d69f08338a19447e26d28ba7fbcbbb5be28
Scope: archive-only; no active runtime behaviour change.
```

Archived:

```text
artifex/apps/quest-builder/v1/quest-builder-v108.js
  → artifex/apps/quest-builder/archive/v108-monolith/quest-builder-v108.js
artifex/apps/quest-builder/v1/styles.css
  → artifex/apps/quest-builder/archive/pre-v1212-module-app/styles.css
artifex/apps/quest-builder/v1/src/module-app.js
  → artifex/apps/quest-builder/archive/pre-v1212-module-app/module-app.js
artifex/apps/quest-builder/v1/src/module-io.js
  → artifex/apps/quest-builder/archive/pre-v1212-module-app/module-io.js
artifex/apps/quest-builder/v1/src/module-renderer.js
  → artifex/apps/quest-builder/archive/pre-v1212-module-app/module-renderer.js
artifex/apps/quest-builder/v1/src/module-state.js
  → artifex/apps/quest-builder/archive/pre-v1212-module-app/module-state.js
```

Deliberately retained as active:

```text
artifex/apps/quest-builder/v1/quest-builder-v108.css
artifex/apps/quest-builder/v1/src/module-config.js
```

### Completed: Phase 2C — Puzzle Creator archive-only pass 01

PR #24, **Archive superseded Puzzle Creator maze patch files (pre-v1.32)**, was reviewed and merged into `main` on 1 June 2026.

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

The active Puzzle Creator route remains V1.32 with `src/js/main.js?v=1.28` and `src/js/engines/maze-labyrinth-consolidation-loader.js?v=1.32`. JavaScript syntax checks and a Puzzle Creator-specific Vite production build passed during this archive-only pass.

### Completed: Phase 3 — Corrected master rules-compliance and stability analysis

Recorded audit file:

```text
artifex/shared/todo-guide/audits/2026-06-01-master-rules-compliance-and-stability-audit.md
```

This master audit reconciles the global display/file-contract review with the accepted current-main baseline and completed archive passes. It confirms:

```text
- Three archive-only passes are complete and should not be expanded or treated as behavioural fixes.
- Scene Editor is still the first required behavioural repair and is blocked from UI redesign until selected-object ownership is fixed and tested.
- Effect Editor still requires a read-only route/feature-parity decision before UI work.
- Archetype Object Creator V1.35 still requires functional validation before changes.
- Creation Guide and Project Editor still require app-specific wrapper/save/contract verification when selected, but do not block independent safe UI lanes.
- Puzzle Creator V1.32 is the recommended first fuller UI-only lane after a quick baseline check.
- Sound Generator preview/shared popup is the recommended smallest low-risk UI-only lane after a quick baseline check, with save/asset-index/caller integration explicitly excluded.
```

## Current Authority Set

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
```

App-local docs remain useful, but any conflict with this authority set must be flagged and decided rather than silently followed.

## Remaining Read-Only Analysis Work

The master audit is complete, but focused analysis is still needed before work begins in particular unresolved apps:

| Priority | Surface | Required read-only work | Blocks UI where? | Recommended owner |
|---:|---|---|---|---|
| 1 | Effect Editor | Compare `index.html` V3.38 Emergency with `index2.html` INDEX2-CLEAN-0.2.3 for routing and feature parity; recommend accepted baseline. | Effect Editor only. | Agent/research. |
| 2 | Archetype Object Creator | Validate V1.35 wizard flow, save/index update, browser recovery and Sound Generator callback behaviour. | Object Creator only. | Agent plus manual testing. |
| 3 | Project Editor | Verify current save/export behaviour and remaining user-facing Project Manager terminology drift. | Project Editor expansion only. | Agent/research. |
| 4 | Hub | Check module links, current route targets, version labels and project-selection behaviour. | Hub UI only. | Agent/research. |
| 5 | Creation Guide | Verify starter ZIP/package output and starter-schema alignment from current main. | Creation Guide/project-start reliability only; not unrelated UI lanes. | Agent/research. |

## First Required Behavioural Repair

Scene Editor remains the first required functional repair:

```text
Scene Editor: consolidate Object Inspector and transform ownership to repair the selected-object / wrong-object failure.
```

This pass must not be mixed with visual redesign or broad save-contract changes. It must establish stable selected-object ownership and pass the recorded ball-versus-box acceptance gate:

```text
- Editing the ball changes only the ball.
- Editing the box changes only the box.
- Alternating selections does not apply stale values to the wrong object.
- Move, resize, rotate, skew, aspect-lock and wrap-to-image affect only the selected item.
- Visual adjustments remain selected-object specific.
- Inspector cards render once without accumulated repair controls.
- Save/autosave, reload and preview remain functional.
- No replacement patch/helper/wrapper layer is introduced.
```

## Safe UI-Only Resumption Lanes

| Candidate | Required gate | Initial allowed scope | Initial prohibited scope | Decision |
|---|---|---|---|---|
| Puzzle Creator V1.32 | Short current-main visual/manual baseline with version/entry route recorded. | Panel layout, spacing, typography, card/toolbar/button/icon presentation and visible wording corrections. | Maze engine, active loader consolidation, schemas, save paths, project-folder/registered-content integration and new wrappers. | **Recommended first fuller UI-only lane.** |
| Sound Generator preview/shared popup V1.00 | Short modal/control/preview smoke test. | Popup/card layout, typography, spacing, control readability and visual accessibility. | Project-folder recipe save, asset-index registration, JSON import/export behaviour, Save and Assign callback and Object Creator integration. | **Recommended smallest low-risk UI-only lane.** |
| Quest Builder V1.2.12 | Quick entry/runtime/style and visible-flow check. | Presentation-only cards/flow/menu/control styling. | Schema, connection logic, export/save integration and new wrappers. | Later safe visual lane. |
| Hub V1.1.4 | Link/version/project-selection baseline. | Branding, spacing, typography and app-card presentation. | Route restructuring and active-project/local-storage behaviour. | Later small UI candidate. |

## Current Decision Point — No New Implementation Authorised Yet

The stabilisation audit and initial archive cleanup stage is complete. The user must now choose the next separately scoped pass:

```text
A. Reopen visible UI work through a quick Puzzle Creator V1.32 baseline check, followed by a UI-only pass if accepted.
B. Reopen the smallest visual UI lane through a Sound Generator preview/shared-popup baseline check, followed by a visual-only pass if accepted.
C. Begin the first required behavioural repair: Scene Editor Object Inspector and transform ownership consolidation, with full manual acceptance testing.
D. Continue focused read-only analysis for one unresolved app, such as Effect Editor route selection or Object Creator V1.35 validation.
```

Recommendation after the audit stage:

```text
- For visible progress: choose Puzzle Creator baseline/UI-only work.
- For highest-priority functional stabilisation: choose Scene Editor ownership repair.
- Do not continue archive cleanup by default.
```

## Non-Negotiable Working Controls

1. Current `main` is the only implementation baseline. Old PRs and branches may be inspected as evidence but must not be used as implementation bases unless explicitly approved.
2. Audit work is read-only. It must not edit files, create branches, merge PRs or perform cleanup while investigating.
3. Implementation occurs only after the user approves a named pass, permitted file area, prohibited changes and acceptance checks.
4. One app and one concern per implementation pass. UI, save-contract integration, schema work and hotfix consolidation are separate workstreams unless explicitly approved as unavoidable.
5. No new patch/hotfix/wrapper files as the normal fix route. Valid behaviour moves into permanent ownership.
6. No silent multi-hour implementation. Every pass stops with a report and review gate.
7. Archive rather than delete obsolete work initially, and only after verified inactivity or successful replacement.
8. A manual acceptance gate is required before another implementation pass begins.

## What Is Explicitly Not Authorised

```text
- a repo-wide automatic cleanup;
- moving old-looking files into archive without reference/behaviour evidence;
- deleting old implementations instead of initially archiving them;
- merging PR #20 or using it as a development base;
- blindly merging PR #9 or PR #17;
- a mass save-schema or connected-folder rewrite;
- bundling architecture work into a UI-only pass;
- continuing implementation work without a stop-and-report checkpoint.
```
