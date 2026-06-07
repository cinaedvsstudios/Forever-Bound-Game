# Artifex Stabilisation, Cleanup and UI Resumption Plan

## Purpose

This document is the current progress tracker and decision gate for restoring safe Artifex UI work after the large mixed integration period on 31 May 2026.

The objective is not to pause development until every app is perfect. The objective is to resume work app-by-app from a known current-main baseline, without silently stacking UI work over broken behaviour, ambiguous save paths, obsolete files or temporary patch layers.

Central controls:

1. Move genuinely unused or superseded files into documented archive folders only after verification.
2. Integrate active hotfixes and transitional wrappers into permanent owning modules only after behaviour is understood and tested.
3. Reopen UI-only work only where the baseline is known and the scope excludes unapproved schema, save, integration and architecture changes.
4. Start implementation only after the user approves a named pass; stop for review after each pass.

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
- Effect Editor had baseline ambiguity between an emergency primary route and an index2 clean-route candidate.
- PR #20 is unsafe/abandoned and must not be used as a development base.
- PR #9 and PR #17 are evidence only and must not be merged blindly.
```

### Completed: Phase 1 — Archive and hotfix consolidation inventory

Recorded audit file:

```text
artifex/shared/todo-guide/audits/2026-06-01-archive-and-hotfix-inventory.md
```

Confirmed outcome:

```text
- Scene Editor has overlapping ownership across inspector structure, transform input, aspect/wrap, movement, sliders and card/visual behaviour; these active files cannot simply be archived.
- Archetype Object Creator has active Step 5 enhancement/layout/frame/package layers requiring validation before consolidation or UI implementation.
- Creation Guide has live current-main wrapper debt independently of abandoned PR #20.
- Project Editor, Quest Builder and Puzzle Creator contained narrow inactive archive candidates.
- Sound Generator preview/shared popup is intentional retained code and remains a potential small UI-only lane after a smoke check.
```

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

The active Puzzle Creator route remains V1.32 with `src/js/main.js?v=1.28` and `src/js/engines/maze-labyrinth-consolidation-loader.js?v=1.32`. Puzzle Creator-specific syntax and production-build checks passed during this archive-only pass.

### Completed: Phase 3 — Corrected master rules-compliance and stability analysis

Recorded audit file:

```text
artifex/shared/todo-guide/audits/2026-06-01-master-rules-compliance-and-stability-audit.md
```

Confirmed outcome:

```text
- Three archive-only passes are complete and should not be expanded or treated as behavioural fixes.
- Scene Editor is the first required behavioural repair and is blocked from UI redesign until selected-object ownership is repaired and tested.
- Archetype Object Creator V1.35 requires functional validation before changes.
- Creation Guide and Project Editor require focused app-local verification when selected, but do not block independent safe UI lanes.
- Puzzle Creator V1.32 is a recommended fuller UI-only lane after a quick baseline check.
- Sound Generator preview/shared popup is a small visual-only lane after a quick smoke check, with save/asset-index/caller integration excluded.
```

### Completed: Phase 4 — Effect Editor route decision and Hub cutover

Recorded audit file:

```text
artifex/shared/todo-guide/audits/2026-06-01-effect-editor-route-decision-audit.md
```

The read-only route audit and user manual deployed-browser comparison confirmed that the complete rewrite remained available at `index2.html`, while the default route was still exposing the emergency/repaired version.

Accepted Effect Editor baseline:

```text
artifex/apps/effect-editor/index2.html
Visible label: INDEX2-CLEAN-0.2.3
```

Retained old emergency route for reference/rollback only:

```text
artifex/apps/effect-editor/index.html
Observed deployed label during user comparison: V3.35-EMERGENCY
```

PR #25, **Route Effect Editor hub link to accepted index2 baseline**, was reviewed and merged into `main` on 1 June 2026.

```text
PR: #25
Merge commit: a4a1bc9f03fe1c3e9ed08c066851adb8743bc520
Scope: Hub-link-only route cutover; no Effect Editor implementation files changed.
```

Changed Hub navigation target:

```text
FROM: apps/effect-editor/?from=hub
TO:   apps/effect-editor/index2.html?from=hub
```

Known missing parity features to port in a separate future Effect Editor pass:

```text
- Rotation-direction controls: random rotation, within degree range, lock direction.
- Orbital control.
- Convert text to ALL CAPS.
```

Not authorised by the route decision/cutover:

```text
- Changing, deleting or archiving the old emergency route or rescue files.
- Implementing the three missing parity features.
- Connected-folder save or canonical effect-index integration.
- Broad Effect Editor redesign or global branding/aspect changes.
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
artifex/shared/todo-guide/audits/2026-06-01-effect-editor-route-decision-audit.md
```

## Remaining Focused Read-Only Analysis Work

| Priority | Surface | Required read-only work | Blocks UI where? | Recommended owner |
|---:|---|---|---|---|
| 1 | Archetype Object Creator | Validate V1.35 wizard flow, save/index update, browser recovery and Sound Generator callback behaviour. | Object Creator only. | Agent plus manual checks. |
| 2 | Project Editor | Verify current save/export behaviour and remaining user-facing Project Manager terminology drift. | Project Editor expansion only. | Agent/research. |
| 3 | Creation Guide | Verify starter ZIP/package output and starter-schema alignment from current main. | Creation Guide/project-start reliability only. | Agent/research. |
| 4 | Hub | Later audit module icons/labels/routes/versions against final accepted module list, when Hub presentation work becomes relevant. | Hub UI only; currently superficial for the user. | Agent/research later. |
| 5 | Effect Editor | Before feature implementation, map only the three accepted missing parity behaviours into index2's permanent modules. | Effect Editor parity pass only. | Agent or Codex read-only planning. |

## First Required Behavioural Repair

Scene Editor remains the first confirmed functional repair:

```text
Scene Editor: consolidate Object Inspector and transform ownership to repair selected-object / wrong-object behaviour.
```

Mandatory acceptance gate:

```text
- Editing the ball changes only the ball.
- Editing the box changes only the box.
- Alternating selections does not apply stale values to the wrong object.
- Move, resize, rotate, skew, aspect-lock and wrap-to-image affect only the selected item.
- Visual adjustments remain selected-object specific.
- Inspector cards render once without accumulating repair controls.
- Save/autosave, reload and preview remain functional.
- No replacement patch/helper/wrapper layer is introduced.
```

## Safe UI and Feature Resumption Lanes

| Candidate | Required gate | Initial allowed scope | Explicit exclusions | Decision |
|---|---|---|---|---|
| Puzzle Creator V1.32 | Short current-main visual/manual baseline with version and route recorded. | Panel layout, spacing, typography, cards, toolbar/button/icon presentation and visible wording corrections. | Maze engine, loader consolidation, schemas, save paths, project-folder/registered-content integration and new wrappers. | Recommended first fuller independent UI-only lane. |
| Sound Generator preview/shared popup V1.00 | Short modal/control/preview smoke test. | Popup/card layout, typography, spacing, control readability and visual accessibility. | Project-folder recipe save, asset-index registration, JSON import/export, Save and Assign callback and Object Creator integration. | Smallest low-risk visual-only lane. |
| Effect Editor index2 | Parity mapping for the three accepted missing features, then one separately approved pass. | Port only the agreed controls into index2 permanent ownership; later UI polish can follow. | Old emergency repair/archive, save-contract integration, broad redesign, global aspect/logo changes. | Good rewritten baseline now accepted; useful feature-parity lane if prioritised. |
| Quest Builder V1.2.12 | Quick entry/runtime/style and visible-flow check. | Presentation-only cards/flow/menu/control styling. | Schema, connection logic, export/save integration and new wrappers. | Later safe visual lane. |
| Hub V1.1.4 | Link/version/icon baseline only when Hub work becomes useful. | Branding, spacing, labels, icon and card presentation. | Route/model restructuring and active-project/local-storage changes. | Not urgent while direct module URLs are being used. |

## Current Decision Point — No New Implementation Authorised Yet

Stabilisation analysis, initial archive cleanup and the Effect Editor route rescue are now recorded. The user must choose the next separately scoped pass:

```text
A. Port the three known missing Effect Editor features into the accepted index2 rewrite, starting with a narrow mapping/planning pass.
B. Reopen independent visible UI work through a quick Puzzle Creator V1.32 baseline check, followed by UI-only work if accepted.
C. Begin the first confirmed behavioural repair: Scene Editor Object Inspector and transform ownership consolidation, with full manual testing.
D. Continue read-only validation in Archetype Object Creator, Project Editor or Creation Guide.
```

Practical recommendation:

```text
Because the Effect Editor rewrite has just been recovered and only three visible parity gaps were identified, the most coherent immediate follow-up is a narrow read-only mapping of those three missing controls into index2. Implementation should wait for that map and a fresh Codex allowance. Scene Editor remains the highest-priority broken app, but it is a larger controlled repair.
```

## Non-Negotiable Working Controls

1. Current `main` is the only implementation baseline. Old PRs and branches may be inspected as evidence only unless explicitly approved otherwise.
2. Audit and mapping work is read-only. It must not edit files, create branches, merge PRs or perform cleanup while investigating.
3. Implementation begins only after the user approves a named pass, permitted file area, prohibited changes and acceptance checks.
4. One app and one concern per implementation pass. UI, save-contract integration, schema work, parity work and hotfix consolidation remain separate unless explicitly approved as unavoidable.
5. No new patch/hotfix/wrapper files as the normal fix route. Valid behaviour moves into permanent ownership.
6. No silent multi-hour implementation. Every pass stops with a report and review gate.
7. Archive rather than delete obsolete work initially, and only after verified inactivity or successful replacement.
8. A manual acceptance gate is required before another implementation pass begins.

## What Is Explicitly Not Authorised

```text
- a repo-wide automatic cleanup;
- moving old-looking files into archive without evidence;
- deleting old implementations instead of initially archiving them;
- merging PR #20 or using it as a development base;
- blindly merging PR #9 or PR #17;
- a mass save-schema or connected-folder rewrite;
- bundling architecture work into a UI-only or parity pass;
- continuing implementation work without a stop-and-report checkpoint.
```
