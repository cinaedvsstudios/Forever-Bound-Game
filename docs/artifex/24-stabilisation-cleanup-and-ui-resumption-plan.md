# Artifex Stabilisation, Cleanup and UI Resumption Plan

## Purpose

This plan records the controlled path back to safe visible UI work after the large volume of changes and incomplete reporting on 31 May 2026.

The goal is **not** to stop Artifex development or demand a full rewrite before any design work continues. The goal is to restore a known, reviewable baseline so that UI changes can resume without silently stacking more structural debt underneath them.

This is a planning document only. It does not approve runtime edits, PR merges, branch reuse, mass file moves or refactors by itself.

## Why this plan exists

A current-main integration review reported that Artifex has useful foundations already in place, including shared project-folder infrastructure, central contract documents, canonical starter-project structure, and working or partly integrated app surfaces. It also reported drift across live app versions, documentation, Project Manager / Project Editor naming, save-state adoption, wrapper/patch layers, and open PR relevance.

The existing recovery record in `docs/artifex/23-current-main-scan-and-pr20-recovery.md` already locks an important working rule: inspect current `main` first, do not use stale PR branches as the source of truth, and recreate only still-needed changes on fresh branches after review.

The user's priority is now to stabilise the repository enough to safely resume UI design and iteration, while making two cleanup goals central:

1. **Move genuinely unused, superseded and obsolete files into clearly labelled archive folders rather than leaving dead implementation mixed with active runtime code.**
2. **Integrate small hotfixes, patch layers and transitional wrappers into the permanent files/modules that should own that behaviour, then archive the replaced files after verification.**

## Current authority set

Until deliberately superseded, planning and implementation work should check current `main` against these documents:

```text
docs/artifex/00-index.md
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/21-template-game-project-contract.md
docs/artifex/22-sound-archetype-generator.md
docs/artifex/23-current-main-scan-and-pr20-recovery.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
```

App-local docs remain useful, but any conflict with the authority set must be flagged and decided rather than silently followed.

## Non-negotiable working controls

The following controls apply during stabilisation:

1. **Current `main` is the only implementation baseline.** Old PRs and branches may be inspected as evidence or idea sources, but not used as development bases unless the user explicitly approves that exception.
2. **Audit work is read-only.** An audit must not edit files, update docs, create branches, merge PRs or perform cleanup as it investigates.
3. **Implementation occurs only after the user approves a named pass.** Each pass must state the app, exact purpose, permitted file area, prohibited changes and manual acceptance checks before editing begins.
4. **One app and one concern per implementation pass.** UI, save-contract integration, schema work and hotfix consolidation must not be bundled together unless the user explicitly approves the dependency.
5. **No new patch/hotfix/wrapper files as the normal fix route.** Behaviour must move toward a permanent owning module rather than receiving another overlay.
6. **No silent multi-hour implementation.** Every task must stop with a report after the agreed pass, even if further work appears obvious.
7. **Archive rather than delete obsolete work initially.** Archiving keeps history inspectable while clearing active runtime folders. Deletion should be a later deliberate decision only.
8. **A live/manual acceptance gate is required before the next pass starts.** Static checks are useful, but they do not replace the user's review of visible behaviour.

## Definition of stable enough for UI work

An app is stable enough to resume UI-only changes when all of these are true:

```text
- Its current main entry point and visible version are recorded.
- Its core existing function has a short manual smoke test result.
- There is no unresolved runtime blocker that would invalidate the proposed UI work.
- Open branches/PRs overlapping the same code area have been classified.
- Active patch/wrapper files affecting that UI area are either documented as temporary owners or already consolidated.
- The approved UI scope excludes unrelated save/schema/integration refactors.
- A rollback or pre-change baseline is recorded.
```

This does not require every Artifex app to be complete. Stability is approved app-by-app.

## Stabilisation sequence

### Phase 0 — Preserve current truth and stop hidden drift

**Purpose:** establish what is actually on `main`, what happened during the uncontrolled period, and what is only branch/PR debris.

Required read-only outputs:

1. A 31 May 2026 change timeline listing commits, PRs and branches touched, files affected, modules affected, whether changes reached `main`, and whether the change was runtime, documentation, asset, shared service or workflow work.
2. A current-main app/service matrix listing entry point, visible version, project save method, active wrappers/patches, known blockers and safe next action.
3. An open-PR classification: current/useful, historical evidence only, unsafe/abandoned, or requires diff-based salvage review.

Rules:

- No implementation during Phase 0.
- No old PR merges during Phase 0.
- The output must distinguish verified current-main facts from recommendations or inferred risks.

Target record locations:

```text
artifex/shared/todo-guide/audits/2026-06-01-change-timeline.md
artifex/shared/todo-guide/audits/2026-06-01-current-main-baseline-matrix.md
```

### Phase 1 — Create the archive and hotfix consolidation inventory

**Purpose:** identify dead files and patch-layer behaviour without moving or rewriting anything prematurely.

The audit must inspect each active app and shared utility for:

```text
- unused files not imported or referenced by the current entry point;
- superseded versioned helper files;
- old patch, fix, override, rescue, restore or wrapper modules;
- duplicated UI injection, event binding, rendering or save paths;
- docs or test harnesses that are intentionally retained but not runtime code;
- files that look unused but are still loaded dynamically or referenced by old project data.
```

For every candidate, record:

| Field | Meaning |
|---|---|
| File path | Existing current-main location |
| Classification | active owner / active transitional wrapper / unused / superseded / uncertain / evidence-only |
| Referenced by | Imports, HTML script tags, dynamic loading, docs or project data |
| Behaviour contained | What must not be lost |
| Permanent owner | Where retained behaviour belongs if consolidated |
| Proposed action | retain / consolidate then archive / archive only / investigate further |
| Test required | How absence or replacement will be proven safe |

No file is eligible for archiving merely because its filename contains `patch`, `old`, `v12`, `fix` or `legacy`. It must be shown to be unused or safely replaced first.

Target record location:

```text
artifex/shared/todo-guide/audits/2026-06-01-archive-and-hotfix-inventory.md
```

### Phase 2 — Archive genuinely unused and superseded files

**Purpose:** remove dead clutter from active source folders while preserving traceability.

Recommended archive locations:

```text
artifex/apps/<app-slug>/archive/legacy-2026-06-01/
artifex/shared/archive/legacy-2026-06-01/
docs/archive/<area>/
```

Archive rules:

1. Move only files confirmed as unused, superseded or evidence-only.
2. Do not archive an active wrapper until the equivalent permanent implementation has been verified.
3. Keep a README inside each new archive folder listing:
   - files moved;
   - former location;
   - why they were archived;
   - which replacement is active, if any;
   - commit/PR and manual test reference.
4. Update imports, HTML loading and cache references only as part of an approved app-specific pass.
5. Run static reference checks and manual app smoke checks after each archive pass.
6. Archive one app at a time; do not run a mass repo move.

### Phase 3 — Integrate small hotfixes into permanent owners

**Purpose:** convert temporary repair architecture into maintainable runtime ownership.

This is a primary stabilisation goal, not an optional tidying exercise. A UI pass is not safe where two live systems can still render, bind or write the same state.

For each app, produce a consolidation map before editing:

| Current hotfix/wrapper behaviour | Permanent owner module | Files to retire/archive after success | Manual acceptance gate |
|---|---|---|---|
| Example: injected controls after render | real UI renderer / control owner | patch module | controls exist once and affect the selected item only |

Implementation rules:

1. Consolidate behaviour into existing permanent owning modules; do not add a new consolidation wrapper.
2. Preserve existing intended behaviour before changing design or adding new capability.
3. Remove the retired import/script load only after the permanent owner passes tests.
4. Move retired files to the app archive folder in the same reviewed pass or in a dedicated immediately-following archive pass.
5. Record exactly which behaviours moved and which were deliberately removed.
6. Stop for user testing after each app pass.

Priority order for consolidation decisions:

#### Priority A — Scene Editor blocker cleanup

The documented selected-object/control failure means Scene Editor is not currently a safe implementation target for new UI work. Its first task is to consolidate control/inspector/movement ownership so changing one selected object cannot modify another. New UI implementation remains blocked until that baseline is accepted.

#### Priority B — Creation Guide cleanup verification

Confirm its current visible version, starter-structure behaviour, active bootstrap/wrapper status and documentation alignment. Consolidate only verified residual patch/wrapper behaviour. Creation Guide UI work can resume after its baseline is agreed.

#### Priority C — Project Editor ownership and naming cleanup

Inventory the current wrapper composition, remaining `Project Manager` user-facing wording and save-state boundaries. Keep connected-folder read/write integration as a separate explicitly approved structural pass rather than hiding it inside UI polish or hotfix cleanup.

#### Priority D — Effect Editor accepted baseline and PR triage

Confirm the accepted live baseline before changing it. Old PR work should be diffed against `main` and either discarded or deliberately recreated; it must not be blindly merged into a moving app.

#### Priority E — Remaining apps and shared utilities

Quest Builder, Puzzle Creator, Archetype Object Creator, Sound Generator and shared utilities receive smaller baseline/inventory checks. The Sound Generator preview is a likely early candidate for UI discussion or UI-only change once a quick smoke test confirms its present behaviour.

### Phase 4 — Resolve only integration blockers that prevent chosen UI work

**Purpose:** avoid turning stabilisation into an endless structural rewrite.

Not every contract mismatch blocks visual development. For the app selected for the next UI pass, resolve only the blockers that would make the UI work unreliable or likely to be overwritten.

Examples of blockers:

```text
- selected-item controls affect the wrong object;
- the visible UI is still inserted by competing wrappers;
- the app entry point or live baseline is unclear;
- an unreviewed branch is modifying the same active files;
- the proposed UI directly involves save/load behaviour that is not yet defined.
```

Examples of non-blocking later work for an unrelated UI pass:

```text
- broader Project Editor connected-folder adoption while designing Sound Generator visuals;
- stale README wording in another app;
- a future cross-app feature that does not affect the chosen UI surface.
```

### Phase 5 — Reopen controlled UI changes app-by-app

Once an app satisfies the stability definition, UI work can resume under a strict lane:

1. User selects one app and one visible design goal.
2. A baseline screenshot/test URL and version are recorded before edits.
3. The implementation brief explicitly prohibits schema, save, integration and architectural changes unless approved.
4. The implementation edits owning UI/CSS modules only; it does not add patch files.
5. The agent reports every changed file and gives an exact live test URL.
6. The user accepts or rejects the pass before more work starts.

## App-by-app current planning status

This table is a planning classification based on the reported audit and existing recovery record. It must be confirmed by current-main inspection before implementation.

| Area | Immediate handling | UI discussion | UI implementation |
|---|---|---:|---:|
| Sound Generator preview/shared popup | Quick baseline smoke check; record owning UI/CSS files | Allowed now | Likely earliest safe UI lane after check |
| Creation Guide | Confirm live version, starter behaviour and wrapper state; reconcile only verified drift | Allowed | After baseline approval |
| Quest Builder | Confirm export/runtime changes and live load | Allowed | After baseline approval |
| Puzzle Creator | Confirm current app status and overlapping changes | Allowed | After baseline approval |
| Archetype Object Creator | Confirm sound integration and wrapper/archive candidates | Allowed | After baseline approval |
| Project Editor | Inventory wrappers, naming drift and save-state boundary; structural work separately scoped | Allowed | Restrict until overlapping structural scope is clear |
| Scene Editor | Consolidate object-control ownership blocker first | Allowed | Blocked until accepted repair baseline |
| Effect Editor | Determine accepted baseline and classify PR overlap | Allowed | Hold implementation until baseline decision |

## Codex work packages

Codex should be used as a controlled workbench. The user reviews scope and results before implementation continues.

### Package A — Read-only timeline and baseline reports

```text
AUDIT ONLY. Do not modify, create, delete, rename, merge, close, commit, push or update any repository file, branch, pull request, issue, workflow or document.

Starting from current main, produce:
1. A timeline of repository changes on 2026-05-31, showing branches/PRs/commits, files affected, apps affected, whether each change reached main, and whether each change was runtime, docs, shared service, asset or workflow work.
2. A current-main app/service baseline matrix listing entry point, visible version, save source of truth, wrapper/patch debt, known blocker and safe next action.
3. A classification of open PRs/branches as current/useful, historical evidence only, unsafe/abandoned, or needing diff-based salvage review.

Report only. Do not implement or clean anything.
```

### Package B — Read-only archive and hotfix inventory

```text
AUDIT ONLY. Do not move or edit files.

From current main, inspect every active Artifex app and shared utility for unused files, superseded implementations, patch/fix/override/wrapper files, duplicated behaviour owners and obsolete demo/runtime files.

For each candidate, report its current path, references/imports, behaviour contained, permanent owner if the behaviour must be integrated, recommended action, archive destination and tests needed before any move.

The purpose is to prepare a safe archive-and-consolidation plan, not to perform it.
```

### Package C — One approved consolidation implementation pass

Use this only after reviewing the inventory and choosing one app:

```text
IMPLEMENTATION PASS: <one named app> hotfix consolidation only.

Start from fresh current main in a new branch. Read the current global Artifex contract documents first.

Implement only the approved consolidation items for <app>. Move existing valid behaviour from identified hotfix/wrapper files into the stated permanent owning modules. Do not add new patch, override, helper or rescue layers. Do not change unrelated UI design, file schemas, save contracts or other apps.

After replacement is verified, archive only the retired files approved in the plan and add an archive README explaining their former role and replacement.

Run appropriate checks, provide the exact changed-file report and live manual test URL, then stop for user acceptance.
```

### Package D — One approved UI-only pass after stabilisation

```text
IMPLEMENTATION PASS: <one named app> UI only.

Start from the accepted baseline on current main. Read the current global Artifex display and ownership rules first.

Implement only this approved visible design change: <specific UI goal>.

Do not change schemas, project-folder/save behaviour, imports outside this app, cross-app integration, business logic or archived/legacy files. Do not add patch/hotfix/wrapper files. Edit permanent owning UI/CSS files only.

Report changed files, checks run and the exact live test URL. Stop for manual acceptance before any further pass.
```

## Expected deliverables and approval gates

| Deliverable | Type | User approval required before next action? |
|---|---|---:|
| Change timeline and current-main baseline matrix | Read-only report | Yes |
| Archive/hotfix candidate inventory | Read-only report | Yes |
| App-specific consolidation plan | Plan only | Yes |
| One app's hotfix integration/archive pass | Code change | Manual live acceptance required |
| One app's approved stable baseline record | Status record | Yes |
| UI-only pass | Code change | Manual live acceptance required |

## What is explicitly not authorised by this plan

This document does not authorise:

```text
- a repo-wide automatic cleanup;
- moving every file with an old-looking name into archive;
- deleting history or old implementations without an inventory;
- merging PR #20 or using it as a development base;
- blindly merging other open PRs without a current-main diff review;
- a mass save-schema or connected-folder rewrite;
- bundling architecture work into a visual UI pass;
- agents continuing to make changes without a stop-and-report checkpoint.
```

## Practical outcome required before returning to normal UI iteration

Normal UI iteration may resume on an individual app once:

```text
1. its live/current-main baseline is known and manually checkable;
2. overlapping branch/PR work is classified;
3. active hotfix or wrapper debt in the affected UI area has either been consolidated or explicitly accepted as temporary and non-conflicting;
4. unused files affecting that app have been inventoried and safely archived where appropriate;
5. the user approves a UI-only scope with no hidden structural work.
```

The intended end state is not a frozen project. It is a project where active files mean active code, archived files are clearly historical, temporary fixes have been absorbed into proper owners, and each UI improvement can be tested and accepted without discovering an unrelated architectural rewrite underneath it.