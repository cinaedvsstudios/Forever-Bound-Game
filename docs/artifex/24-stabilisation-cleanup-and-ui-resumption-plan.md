# Artifex Stabilisation, Cleanup and UI Resumption Plan

## Purpose

This plan records the controlled path back to safe visible UI work after the large volume of changes and incomplete reporting on 31 May 2026.

The goal is **not** to stop Artifex development or demand a full rewrite before any design work continues. The goal is to restore a known, reviewable baseline so that UI changes can resume without silently stacking more structural debt underneath them.

The two central cleanup goals are:

1. **Move genuinely unused, superseded and obsolete files into clearly labelled archive folders rather than leaving dead implementation mixed with active runtime code.**
2. **Integrate small hotfixes, patch layers and transitional wrappers into the permanent modules that should own that behaviour, then archive the replaced files after verification.**

This document is a plan and progress tracker. It does not authorise a repo-wide automatic cleanup, blind PR merges, mass file moves or hidden implementation work.

## Current Progress Status — Updated 1 June 2026

### Completed: Phase 0 — Preserve current truth and stop hidden drift

The read-only Phase 0 audit has been reviewed and recorded in:

```text
artifex/shared/todo-guide/audits/2026-06-01-change-timeline.md
artifex/shared/todo-guide/audits/2026-06-01-current-main-baseline-matrix.md
```

Phase 0 confirmed:

```text
- A large mixed merge on 31 May brought runtime, shared-service, documentation and asset work into main across several apps.
- Scene Editor v0.34 is on main but failed manual acceptance and requires ownership consolidation before further UI implementation.
- Archetype Object Creator V1.35 is on main but explicitly unverified.
- Effect Editor has baseline ambiguity between its emergency primary route and the index2 clean route.
- PR #20 is unsafe/abandoned as a merge target and must not be used as a development base.
- PR #9 requires diff-based salvage review only if Project Editor stabilisation is selected later.
- PR #17 is historical evidence only and should not be merged.
```

### Completed: Phase 1 — Archive and hotfix consolidation inventory

The read-only Phase 1 inventory has been reviewed and recorded in:

```text
artifex/shared/todo-guide/audits/2026-06-01-archive-and-hotfix-inventory.md
```

Phase 1 confirmed:

```text
- Scene Editor contains live overlapping owners for Object Inspector structure, transform input, aspect/wrap, movement, numeric sliders and card/visual rendering. These files cannot simply be archived; the valid behaviour must first be consolidated into permanent owners.
- Archetype Object Creator V1.35 has active Step 5 enhancement/layout/frame/package layers and must be validated before any consolidation or archive work.
- Effect Editor must first resolve which route is the accepted baseline: index.html V3.38 Emergency or index2.html INDEX2-CLEAN-0.2.3.
- Creation Guide has live wrapper debt on current main independently of abandoned PR #20, including app-bootstrap.js loading/patching module-app.js.
- Project Editor had a live current bootstrap plus superseded old HTML/bootstrap files suitable for a narrow archive-only verification pass.
- Quest Builder had superseded files suitable for archive review, but its older-named CSS and module-config file required active-reference verification before any move.
- Puzzle Creator had two versioned maze patch files suitable for a narrow archive-only verification pass while its active V1.32 loader remained protected from changes.
- Sound Generator preview is intentional test-harness code and must be retained; it is a likely low-risk small UI lane after a smoke check.
```

Important limitation: the Phase 1 Codex run reported no local `main` ref or remotes in its checkout. Therefore, each proposed archive or implementation pass must verify its named file state again against live GitHub `main` before changes are made.

### Completed: Phase 2A — Project Editor archive-only pass 01

PR #22, **Archive superseded Project Editor static files**, was reviewed and merged into `main` on 1 June 2026.

```text
PR: #22
Merge commit: 07fb19c7d8d01a8d7068d7f2b00ac5fb7900738d
Scope: Archive-only; no active runtime behaviour change.
```

Archived files:

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

Archive documentation added:

```text
artifex/apps/project-editor/archive/pre-v0132-contract/README.md
artifex/apps/project-editor/archive/pre-split-monolith/README.md
artifex/apps/project-editor/archive/pre-v7-split/README.md
```

Verification recorded before merge:

```text
- All four moved files were confirmed inactive/superseded before archiving.
- The active Project Editor entry remains artifex/apps/project-editor/index.html.
- The active entry still loads ./src/project-app.v7.js?v=0.1.32-contract.
- No current UI/CSS, schema, save/load behaviour, shared service or other app was changed.
- The PR diff contained only four archive moves and three archive README files.
- An attempted root npm build failed due to pre-existing unrelated root TypeScript/CSS declaration and target-lib issues, not this archive-only pass.
```

### Completed: Phase 2B — Quest Builder archive-only pass 01

PR #23, **Archive inactive Quest Builder legacy files (v1.0.8 + pre-v1.2.12 module-app)**, was reviewed and merged into `main` on 1 June 2026.

```text
PR: #23
Merge commit: c0a82d69f08338a19447e26d28ba7fbcbbb5be28
Scope: Archive-only; no active runtime behaviour change.
```

Archived files:

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

Archive documentation added:

```text
artifex/apps/quest-builder/archive/v108-monolith/README.md
artifex/apps/quest-builder/archive/pre-v1212-module-app/README.md
```

Active files deliberately retained:

```text
artifex/apps/quest-builder/v1/quest-builder-v108.css
  Retained because artifex/apps/quest-builder/v1/quest-builder.css still imports it as active base styling.

artifex/apps/quest-builder/v1/src/module-config.js
  Retained because current V1.2.12 runtime modules still import it.
```

Verification recorded before merge:

```text
- The active Quest Builder entry remains artifex/apps/quest-builder/index.html.
- The active style path remains v1/quest-builder.css?v=1.2.12 → quest-builder-v108.css?v=1.2.12-base.
- The active runtime path remains v1/src/quest-builder-app.js?v=1.2.12.
- The two still-active candidate files were excluded rather than incorrectly archived.
- No active Quest Builder HTML, CSS entry, current runtime module, schema, export/import behaviour, connected-project behaviour, puzzle handoff, dialogue behaviour, shared service or other app was changed.
- The PR diff contained only six archive moves and two archive README files.
- An attempted root npm build failed due to pre-existing unrelated root TypeScript/CSS issues, not this archive-only pass.
```

### Completed: Phase 2C — Puzzle Creator archive-only pass 01

PR #24, **Archive superseded Puzzle Creator maze patch files (pre-v1.32)**, was reviewed and merged into `main` on 1 June 2026.

```text
PR: #24
Merge commit: ce26b1c2cd42cd36ec6ba9c341ec360df8261c29
Scope: Archive-only; no active runtime behaviour change.
```

Archived files:

```text
artifex/apps/puzzle-creator/src/js/engines/maze-v109-controls.js
  → artifex/apps/puzzle-creator/archive/legacy-maze-pre-v132/maze-v109-controls.js

artifex/apps/puzzle-creator/src/js/engines/maze-v110-fixes.js
  → artifex/apps/puzzle-creator/archive/legacy-maze-pre-v132/maze-v110-fixes.js
```

Archive documentation added:

```text
artifex/apps/puzzle-creator/archive/legacy-maze-pre-v132/README.md
```

Verification recorded before merge:

```text
- Both moved files were confirmed inactive and superseded before archiving.
- The active Puzzle Creator entry remains artifex/apps/puzzle-creator/index.html, visibly labelled V1.32.
- The active module route remains src/js/main.js?v=1.28 plus src/js/engines/maze-labyrinth-consolidation-loader.js?v=1.32.
- No active HTML entry, JavaScript, CSS, loader chain, schema, save/load/export/import behaviour, quest handoff, shared service, UI layout or maze/labyrinth runtime behaviour was changed.
- The PR diff contained only two archive moves and one archive README file.
- JavaScript syntax checks and a Puzzle Creator-specific Vite production build passed.
- An attempted root npm build failed due to pre-existing unrelated root TypeScript/CSS issues, not this archive-only pass.
```

### Current decision point — no new work authorised yet

Three low-risk archive passes have now been completed and recorded. The active runtime folders for Project Editor, Quest Builder and Puzzle Creator have been reduced without changing their live behaviour.

The next task must be chosen and separately scoped before any work starts:

```text
A. Begin the first required behavioural stabilisation pass: Scene Editor Object Inspector and transform ownership consolidation.
B. Reopen a tightly restricted UI lane after a quick baseline smoke check:
   - smallest/lowest-risk visual surface: Sound Generator preview/shared popup; or
   - first fuller app visual surface: Puzzle Creator V1.32.
C. Continue limited archive cleanup only if a new app-specific candidate has a clear benefit and is independently verified before movement.
```

Practical recommendation: stop archive cleanup by default now. Puzzle Creator is cleaner and its app-specific build has passed, so it is the stronger candidate for a first fuller UI lane after a short visual/manual baseline check. Scene Editor remains the first functional blocker to repair when ready for a higher-risk tested implementation pass.

## Current Authority Set

All stabilisation and later implementation work must use current `main` and check against:

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
```

App-local docs remain useful, but any conflict with the authority set must be flagged and decided rather than silently followed.

## Non-Negotiable Working Controls

1. **Current `main` is the only implementation baseline.** Old PRs and branches may be inspected as evidence, but may not be used as implementation bases unless the user explicitly approves an exception.
2. **Audit work is read-only.** Audits must not edit files, update docs, create branches, merge PRs or perform cleanup while investigating.
3. **Implementation occurs only after the user approves a named pass.** Each pass must state the app, exact purpose, permitted file area, prohibited changes and manual acceptance checks before editing begins.
4. **One app and one concern per implementation pass.** UI, save-contract integration, schema work and hotfix consolidation are separate workstreams unless an unavoidable dependency is explicitly approved.
5. **No new patch/hotfix/wrapper files as the normal fix route.** Valid behaviour must move into permanent ownership rather than receiving another overlay.
6. **No silent multi-hour implementation.** Every task must stop with a report after the agreed pass.
7. **Archive rather than delete obsolete work initially.** Archiving preserves history while clearing active folders.
8. **A manual acceptance gate is required before the next implementation pass starts.** Static checks do not replace user review of visible behaviour.

## Stable Enough for UI Work

An app may resume UI-only implementation only when:

```text
- Its current-main entry point and visible version are recorded.
- Its core function has a short manual smoke-test result.
- No unresolved runtime blocker invalidates the proposed UI work.
- Overlapping branches/PRs have been classified.
- Active patch/wrapper files affecting the UI area have been consolidated or explicitly accepted as temporary and non-conflicting.
- Unused files affecting the app have been inventoried and archived where approved.
- The UI scope explicitly excludes unrelated save/schema/integration refactors.
- A rollback or pre-change baseline is recorded.
```

Stability is approved app-by-app; the whole platform does not need to be complete before one controlled UI lane reopens.

## Archive Pass Rules

Recommended archive locations:

```text
artifex/apps/<app-slug>/archive/legacy-2026-06-01/
artifex/shared/archive/legacy-2026-06-01/
docs/archive/<area>/
```

Rules:

1. Move only files confirmed as unused, superseded or evidence-only.
2. Do not archive an active wrapper until equivalent permanent behaviour is verified.
3. Keep a README inside each new archive folder listing moved files, former locations, reason for archiving, active replacement if any, and commit/manual-test reference.
4. Update imports, HTML loading and cache references only as part of an approved app-specific pass.
5. Run static reference checks and manual app smoke checks after each archive pass.
6. Archive one app at a time; never run a mass repo move.

## Hotfix Consolidation Rules

For every approved app pass, prepare a consolidation map first:

| Current hotfix/wrapper behaviour | Permanent owner module | Files to retire/archive after success | Manual acceptance gate |
|---|---|---|---|
| Example: controls injected after render | Real UI renderer/control owner | Patch module | Controls exist once and affect selected item only |

Rules:

1. Consolidate behaviour into existing permanent owning modules; do not add a new consolidation wrapper.
2. Preserve intended current behaviour before adding new capability or redesign.
3. Remove the retired import/script load only after the permanent owner passes checks.
4. Move retired files to the approved archive folder in the same reviewed pass or an immediately following archive-only pass.
5. Record exactly which behaviours moved and which were deliberately removed.
6. Stop for user testing after each app pass.

## Reopening Controlled UI Changes App-by-App

Once one app satisfies the stability rules:

1. The user chooses one app and one visible design goal.
2. A baseline screenshot/test URL and version are recorded before edits.
3. The implementation brief prohibits schema, save, integration and architecture changes unless explicitly approved.
4. Changes are made in permanent owning UI/CSS modules only; no patch files are added.
5. The agent reports every changed file, checks run and an exact live test URL.
6. The user accepts or rejects the pass before more work starts.

## What Is Explicitly Not Authorised

```text
- a repo-wide automatic cleanup;
- moving every old-looking file into archive without reference/behaviour evidence;
- deleting old implementations instead of initially archiving them;
- merging PR #20 or using it as a development base;
- blindly merging PR #9 or PR #17;
- a mass save-schema or connected-folder rewrite;
- bundling architecture work into a UI pass;
- continuing implementation work without a stop-and-report checkpoint.
```
