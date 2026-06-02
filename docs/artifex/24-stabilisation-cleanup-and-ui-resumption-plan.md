# Artifex Stabilisation, Cleanup and UI Resumption Plan

## Purpose

This document is the current progress tracker and decision gate for restoring safe Artifex UI work after the large mixed integration period on 31 May 2026.

The objective is not to pause development until every app is perfect. The objective is to resume work app-by-app from a known current-main baseline, without silently stacking UI work over broken behaviour, ambiguous save paths, obsolete files or temporary patch layers.

Central controls:

1. Move genuinely unused or superseded files into documented archive folders only after verification.
2. Integrate active hotfixes and transitional wrappers into permanent owning modules only after behaviour is understood and tested.
3. Reopen UI-only work only where the baseline is known and the scope excludes unapproved schema, save, integration and architecture changes.
4. Start implementation only after the user approves a named pass; stop for review after each pass.

## Current Progress Status — Updated 2 June 2026

### Completed: Phase 0 — Preserve current truth and stop hidden drift

Recorded audit files:

```text
artifex/shared/todo-guide/audits/2026-06-01-change-timeline.md
artifex/shared/todo-guide/audits/2026-06-01-current-main-baseline-matrix.md
```

Confirmed outcome at that stage:

```text
- A large mixed merge on 31 May brought runtime, shared-service, documentation and asset work into main across several apps.
- Scene Editor v0.34 reached main but failed manual acceptance and required a later app-specific repair.
- Archetype Object Creator V1.35 reached main but its validation/status remained separate from later Puzzle Creator work.
- Effect Editor had baseline ambiguity between an emergency primary route and an index2 clean-route candidate.
- PR #20 is unsafe/abandoned and must not be used as a development base.
- PR #9 and PR #17 are evidence only and must not be merged blindly.
```

### Completed: Phase 1 — Archive and hotfix consolidation inventory

Recorded audit file:

```text
artifex/shared/todo-guide/audits/2026-06-01-archive-and-hotfix-inventory.md
```

Confirmed outcome at that stage:

```text
- Scene Editor had overlapping ownership across inspector structure, transform input, aspect/wrap, movement, sliders and card/visual behaviour; those active files could not simply be archived.
- Archetype Object Creator had active Step 5 enhancement/layout/frame/package layers requiring separate validation before consolidation or UI implementation.
- Creation Guide had live current-main wrapper debt independently of abandoned PR #20.
- Project Editor, Quest Builder and Puzzle Creator contained narrow inactive archive candidates.
- Sound Generator preview/shared popup was intentional retained code and remained a potential small UI-only lane after a smoke check.
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

The active entry remained `artifex/apps/project-editor/index.html` loading `./src/project-app.v7.js?v=0.1.32-contract` at that archive checkpoint.

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

At that archive-only checkpoint, the active Puzzle Creator route was V1.32 with `src/js/main.js?v=1.28` and `src/js/engines/maze-labyrinth-consolidation-loader.js?v=1.32`. That version has since been superseded by the accepted V1.33 and V1.34 UI passes recorded below.

### Completed: Phase 3 — Corrected master rules-compliance and stability analysis

Recorded audit file:

```text
artifex/shared/todo-guide/audits/2026-06-01-master-rules-compliance-and-stability-audit.md
```

Confirmed outcome at that stage:

```text
- Three archive-only passes were complete and should not be expanded or treated as behavioural fixes.
- Scene Editor was identified as the first required behavioural repair at that audit checkpoint; later Scene Editor work must be read from its later accepted records/current main.
- Archetype Object Creator status remained separate and subject to its own validation/work.
- Creation Guide and Project Editor required focused app-local verification when selected, but did not block independent safe UI lanes.
- Puzzle Creator V1.32 was selected as a recommended fuller UI-only lane after a quick baseline check.
- Sound Generator preview/shared popup remained a small visual-only lane after a quick smoke check, with save/asset-index/caller integration excluded.
```

### Completed: Phase 4 — Effect Editor route decision and Hub cutover

Recorded audit file:

```text
artifex/shared/todo-guide/audits/2026-06-01-effect-editor-route-decision-audit.md
```

The read-only route audit and user manual deployed-browser comparison confirmed that the complete rewrite remained available at `index2.html`, while the default route was still exposing the emergency/repaired version.

Accepted Effect Editor baseline established by that pass and subsequently refreshed in the baseline matrix:

```text
artifex/apps/effect-editor/index2.html
Accepted visible/cache version recorded in refreshed matrix: INDEX2-CLEAN-0.2.6
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

### Completed: Phase 5 — Puzzle Creator UI resumption passes

Puzzle Creator was selected from the safe UI lane identified by the audit. It received a browser-reviewed V1.33 usability pass and a subsequent V1.34 launcher/navigation pass.

```text
PR: #39
Merge commit: 3d956ff33e5f1b59ee9c46728397da5c851d7a62
Scope: Puzzle Creator UI/usability only.
Accepted result: correct module identity; Place Markers action and no-Enter amount handling; Walls → Scatter → Colours presentation order.

PR: #42
Merge commit: db5e03c243a22f49a79d4468f869e77df0208cb0
Scope: Puzzle Creator UI-shell/navigation only plus Puzzle documentation alignment.
Accepted result: V1.34 landing screen, blank view until workflow selection, and labelled Setup / Display / Logic / Colors navigation.
```

Current accepted Puzzle Creator baseline:

```text
Route: artifex/apps/puzzle-creator/index.html
Visible/cache version: V1.34
Playable developed workflow: Maze / Labyrinth
```

V1.34 does not implement canonical `puzzles/` saving, Quest Builder `puzzleId` linking or completed gameplay engines for the other listed puzzle choices. Those remain separate later scopes.

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
artifex/apps/puzzle-creator/README.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
artifex/shared/todo-guide/puzzle-creator-maze-labyrinth-update-steps.md
artifex/shared/todo-guide/audits/2026-06-01-change-timeline.md
artifex/shared/todo-guide/audits/2026-06-01-current-main-baseline-matrix.md
artifex/shared/todo-guide/audits/2026-06-01-archive-and-hotfix-inventory.md
artifex/shared/todo-guide/audits/2026-06-01-master-rules-compliance-and-stability-audit.md
artifex/shared/todo-guide/audits/2026-06-01-effect-editor-route-decision-audit.md
```

## Remaining Focused Read-Only Analysis Work

These entries preserve the earlier tracker structure; each area must be checked against latest accepted app-specific work before implementation.

| Priority | Surface | Required read-only work | Blocks UI where? | Recommended owner |
|---:|---|---|---|---|
| 1 | Archetype Object Creator | Validate the latest accepted/current wizard flow, save/index update, browser recovery and Sound Generator callback behaviour under its own active work stream. | Object Creator only. | Agent plus manual checks. |
| 2 | Project Editor | Verify current save/export behaviour and remaining user-facing Project Manager terminology drift. | Project Editor expansion only. | Agent/research. |
| 3 | Creation Guide | Verify starter ZIP/package output and starter-schema alignment from current main. | Creation Guide/project-start reliability only. | Agent/research. |
| 4 | Hub | Later audit module icons/labels/routes/versions against final accepted module list, when Hub presentation work becomes relevant. | Hub UI only; currently superficial for the user. | Agent/research later. |
| 5 | Effect Editor | Use its accepted Index2 records before selecting any additional feature pass. | Effect Editor feature work only. | Agent or Codex read-only planning. |

## Current App-Specific Repair Position

The earlier Phase 0/Phase 3 conclusion identified Scene Editor as the first required functional repair. Later Scene Editor implementation has now merged separately on `main`; this Puzzle Creator status update does not re-audit or restate Scene Editor's current acceptance position. Any further Scene Editor work must begin from its latest accepted current-main record.

## Safe UI and Feature Resumption Lanes

| Candidate | Required gate | Initial allowed scope | Explicit exclusions | Decision |
|---|---|---|---|---|
| Puzzle Creator V1.34 | Already accepted as current UI-shell baseline. Any next work needs a newly named scope and acceptance check. | Later individually approved Maze feature/UI work, or separately planned save/integration work. | No silent bundling of Maze mechanics, canonical save, Quest integration, Object Creator/sound/shared-service work. | V1.34 accepted; preserve it. |
| Sound Generator preview/shared popup V1.00 | Short modal/control/preview smoke test. | Popup/card layout, typography, spacing, control readability and visual accessibility. | Project-folder recipe save, asset-index registration, JSON import/export, Save and Assign callback and Object Creator integration. | Small visual-only lane when selected. |
| Effect Editor index2 | Check its latest accepted Index2 reference/status record before implementation. | Only separately approved permanent-module work. | Old emergency repair/archive, save-contract integration or broad redesign unless separately scoped. | Accepted baseline exists; choose deliberately. |
| Quest Builder V1.2.12 | Quick entry/runtime/style and visible-flow check. | Presentation-only cards/flow/menu/control styling. | Schema, connection logic, export/save integration and new wrappers. | Later safe visual lane. |
| Hub V1.1.4 | Link/version/icon baseline only when Hub work becomes useful. | Branding, spacing, labels, icon and card presentation. | Route/model restructuring and active-project/local-storage changes. | Not urgent while direct module URLs are being used. |

## Updated Decision Point After Accepted Puzzle Creator Work

The first fuller Puzzle Creator UI lane has been completed and accepted as V1.34. The next pass must be selected separately rather than treating more Puzzle Creator work as automatically authorised.

Potential next separately scoped directions include:

```text
A. A Puzzle Creator Maze enhancement selected from its current to-do record, such as Secondary Light Set, with no save/integration changes.
B. A separate design/planning pass for canonical Puzzle Creator saving and Quest Builder handoff under the project-file contracts.
C. A different app-specific baseline or UI pass, such as Quest Builder or Sound Generator preview.
D. A current-main audit or repair pass in another app based on its latest accepted state.
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
