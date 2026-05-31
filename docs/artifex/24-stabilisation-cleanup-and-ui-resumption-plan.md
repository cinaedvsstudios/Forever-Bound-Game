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

### Active now: Phase 1 — Archive and hotfix consolidation inventory

The next step is a **read-only inventory** of active apps and shared utilities. It must identify unused/superseded files and map active patch/hotfix/wrapper behaviour to the permanent module that should own it.

No files are to be moved, archived, rewritten or deleted in this phase.

Target output:

```text
artifex/shared/todo-guide/audits/2026-06-01-archive-and-hotfix-inventory.md
```

### Not yet authorised

```text
- Scene Editor consolidation implementation.
- Any archive moves.
- Any hotfix integration work.
- Any UI implementation pass.
- Any merge or reuse of PR #9, PR #17 or PR #20.
```

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
```

App-local docs remain useful, but any conflict with the authority set must be flagged and decided rather than silently followed.

## Non-Negotiable Working Controls

1. **Current `main` is the only implementation baseline.** Old PRs and branches may be inspected as evidence, but may not be used as implementation bases unless the user explicitly approves an exception.
2. **Audit work is read-only.** Audits must not edit files, update docs, create branches, merge PRs or perform cleanup while investigating.
3. **Implementation occurs only after the user approves a named pass.** Each pass must state the app, exact purpose, permitted file area, prohibited changes and manual acceptance checks before edits begin.
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

## Phase 0 Outcome Summary

### Open PR classification

| PR | Area | Classification | Handling rule |
|---|---|---|---|
| #9 | Project Editor / historical Project Manager task-workspace and inspector work | Requires diff-based salvage review | Do not merge as-is. Compare only later if Project Editor is selected for stabilisation. |
| #17 | Effect Editor index2 integration | Historical evidence only | Do not merge. Use only to understand intended index2 direction if required. |
| #20 | Creation Guide / Project Editor cleanup | Unsafe / abandoned | Do not merge or use as a base. Recreate approved ideas only from fresh current `main`. |

### App-level implementation safety

| Area | Current direction | UI discussion | UI implementation status |
|---|---|---:|---:|
| Scene Editor | First later stabilisation pass: consolidate Object Inspector and transform ownership | Allowed | **Blocked** pending accepted correctness repair |
| Archetype Object Creator | Validate V1.35 project save/sound integration and identify wrapper/archive candidates | Allowed | **Blocked** pending validation |
| Effect Editor | Decide primary route versus index2 accepted baseline; identify rescue/archive debt | Allowed | Hold |
| Creation Guide | Confirm current baseline and any residual package/wrapper work from current `main`; do not use PR #20 | Allowed | Hold pending baseline |
| Project Editor | Inventory naming, save boundary and wrapper composition; do not use PR #9/#20 as implementation bases | Allowed | Hold pending baseline |
| Puzzle Creator | Quick baseline check before narrow visual work | Allowed | Likely early safe UI lane after check |
| Sound Generator preview | Quick preview smoke test only; do not expand caller integration | Allowed | Likely early safe UI lane after check |
| Quest Builder | Quick baseline check before presentation-only work | Allowed | Possible safe UI lane after check |
| Hub | Quick link/version baseline check | Allowed | Possible safe UI lane after check |

## Phase 1 — Archive and Hotfix Consolidation Inventory

### Purpose

Identify dead files and active repair layers without moving or rewriting anything prematurely. This phase must produce the evidence needed for safe archiving and safe consolidation.

### What must be inspected

Each active app and shared utility must be inspected for:

```text
- unused files not imported or referenced by the current entry point;
- superseded versioned helpers;
- files named or functioning as patch, fix, override, rescue, restore or wrapper layers;
- duplicate UI injection, event-binding, rendering or save paths;
- docs/test harnesses intentionally retained but not runtime code;
- files that appear unused but may be loaded dynamically or referenced by project data.
```

### Required inventory fields

| Field | Meaning |
|---|---|
| File path | Existing location on current `main` |
| App/shared area | Which surface owns or loads it |
| Classification | active owner / active transitional wrapper / unused / superseded / uncertain / evidence-only |
| Referenced by | Imports, HTML script tags, dynamic loading, docs or project data |
| Behaviour contained | What must not be lost if retired |
| Permanent owner | Where retained behaviour belongs if consolidated |
| Proposed action | retain / consolidate then archive / archive only / investigate further |
| Archive destination | Proposed destination if later approved |
| Test required | How absence or replacement will be proven safe |
| Priority | blocker / high / medium / low |

No file is eligible for archiving merely because its filename contains `patch`, `old`, `v12`, `fix` or `legacy`. It must be shown to be unused or safely replaced first.

### Phase 1 app priority

The inventory must cover all active apps and shared utilities, but should prioritise evidence in this order:

1. **Scene Editor**, because its current runtime has a confirmed correctness failure and known duplicated behaviour ownership.
2. **Archetype Object Creator**, because V1.35 is on `main` but explicitly unverified.
3. **Effect Editor**, because its route and rescue-module baseline is unclear.
4. **Creation Guide** and **Project Editor**, because PR #20 is not reusable and both require current-main-only decisions.
5. **Puzzle Creator**, **Sound Generator**, **Quest Builder** and **Hub**, to identify the first safe UI-only lane.
6. **Shared utilities**, including project-folder, active-project, health/todo and registered-content surfaces.

### Phase 1 deliverable and gate

Deliverable:

```text
artifex/shared/todo-guide/audits/2026-06-01-archive-and-hotfix-inventory.md
```

Approval gate:

```text
After the inventory is reviewed, the user chooses either:
- one app-specific consolidation implementation pass; or
- one app confirmed safe enough for a restricted UI-only baseline pass.
```

## Phase 2 — Archive Verified Unused and Superseded Files

This phase begins only after the Phase 1 inventory has been reviewed and individual moves approved.

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

## Phase 3 — Integrate Small Hotfixes into Permanent Owners

This phase converts temporary repair architecture into maintainable runtime ownership.

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

The currently expected first stabilisation implementation pass is **Scene Editor: consolidate Object Inspector and transform ownership**, but this remains subject to review of the Phase 1 inventory before approval.

## Phase 4 — Resolve Only Integration Blockers That Prevent Chosen UI Work

Not every contract mismatch blocks visual development. Resolve only blockers that make the chosen UI work unreliable or likely to be overwritten.

Blockers include:

```text
- selected-item controls affect the wrong object;
- visible UI is still inserted by competing wrappers;
- app entry point or live baseline is unclear;
- unreviewed branch work overlaps the same active files;
- proposed UI requires save/load behaviour that is not settled.
```

Non-blocking later work for an unrelated UI pass may include wider Project Editor connected-folder adoption, stale wording in another app or a future cross-app feature unrelated to the chosen UI surface.

## Phase 5 — Reopen Controlled UI Changes App-by-App

Once one app satisfies the stability rules:

1. The user chooses one app and one visible design goal.
2. A baseline screenshot/test URL and version are recorded before edits.
3. The implementation brief prohibits schema, save, integration and architecture changes unless explicitly approved.
4. Changes are made in permanent owning UI/CSS modules only; no patch files are added.
5. The agent reports every changed file, checks run and an exact live test URL.
6. The user accepts or rejects the pass before more work starts.

## Current Next Step

Run the Phase 1 read-only archive and hotfix consolidation inventory from current `main`. Do not modify files or create cleanup commits during that audit. The inventory must be reviewed before any app-specific consolidation or archive work is authorised.

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
