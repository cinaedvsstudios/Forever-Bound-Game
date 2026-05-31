# Current Main Scan and PR #20 Recovery Handover

## Purpose

This document freezes the position reached on 31 May 2026 before a full Artifex repository scan. It records what happened with the attempted Creation Guide / Project Editor cleanup PR, what is genuinely present on current `main`, what is **not** live, and what should happen after the scan.

This is a status and recovery document only. It is not permission to merge old branches, reapply code blindly, or treat unmerged PR work as implemented.

## Immediate Decision

Stop spending time or Codex allowance trying to rescue **PR #20**:

```text
PR #20
Artifex: Clean base runtime for Creation Guide (V1.1.12) and explicit module composition for Project Editor
branch: codex/clean-up-creation-guide-and-project-editor
```

The PR remains based on an older repository state and is not the source of truth for current Artifex work. It must not be merged manually through GitHub conflict resolution and should not be used as the starting branch for further implementation.

After this status record is made, perform a full scan of current `main`. Only after that scan should any still-needed fixes be recreated on a fresh branch from current `main`.

## What Happened

PR #20 began as two related cleanup efforts:

1. **Creation Guide cleanup**
   - replace the live wrapper/patch bootstrap with a clean base runtime;
   - provide deliberate Project Overview mount points for Connected Project Folder, Initial Asset Intake Setup and Health;
   - clarify canonical Blank Starter file export behaviour;
   - retain `startScreenId: null` for a blank project.

2. **Project Editor composition cleanup**
   - replace nested enhancer/wrapper composition with explicit workspace renderer, inspector extension and IO registration;
   - keep the app schema-aligned while leaving real connected-folder loading/saving for a later task.

While PR #20 was open, substantial new work landed on `main`, including procedural sound-generator work, Sound Generator documentation/asset-contract decisions, Archetype Object Creator sound integration, Puzzle Creator changes and Quest Builder / puzzle-integration documentation. The open PR then conflicted with the newer repository state.

Codex later produced a local reconciled form of the PR and verified its internal code/static checks. That reconciled result was **not published to GitHub**: the environment could not push to the existing PR branch, and the attempted branch-update path was blocked when binary files from newer work were encountered. Therefore, no reconciled PR #20 result is considered live.

## Current Main: Confirmed Truth Before the Full Scan

The following facts were directly inspected on current `main` before this document was created.

### Creation Guide and blank starter structure

Current `main` contains `artifex/shared/project-folder/project-structure-initializer.js`, which:

- creates canonical starter files including `project.json`, `logic.json`, `layout.json`, `registry.json`, `library-links.json`, `input-map.json` and typed empty indexes;
- already writes `startScreenId: null` in both starter `project.json` and starter `logic.json`;
- currently writes `README.md` separately and then iterates `starterFiles(project)`;
- does **not** currently expose or use the PR #20 `starterFilePackage(project)` helper.

Current `main` still loads Creation Guide through:

```text
artifex/apps/creation-guide/v1/src/app-bootstrap.js
```

The PR #20 clean base runtime file `creation-guide-app.js` is not treated as live merely because it existed in the abandoned PR branch.

### Current project/audio contract direction

Current `main` records the procedural sound decision as generated final audio assets through the existing asset library model:

```text
assets/audio/sfx/synth_<slug>.json
assets/asset-index.json → asset_sfx_<slug>
```

It explicitly rejects establishing a separate `archetypes/sound-index.json`, `archetypes/sounds/` or `archsound_` library. Any future scan or cleanup must preserve that current-main decision unless the user deliberately revises it later.

### Current app-integration direction

Current `main` includes newer work and/or documentation around:

- Sound Generator / procedural synth;
- Archetype Object Creator sound assignment integration;
- Puzzle Creator changes;
- Quest Builder connected-project and Puzzle Creator handoff documentation;
- Template Game and connected-project contract documentation.

PR #20 must not be used to overwrite or roll back those newer additions.

## What Was Useful in PR #20 but Is Not Live

The most valuable technical idea verified in the PR was a single shared Blank Starter package builder:

```text
starterFilePackage(project)
```

Its intended benefit was:

```text
Connected-folder Create Starter Structure
  and
Creation Guide Export ZIP backup
  both serialise the exact same canonical starter package
```

That would prevent Creation Guide from creating one JSON shape on disk while exporting an older or different JSON shape in its ZIP backup.

This is a sensible fix to re-evaluate after the full scan, but it is **not implemented on current main** at the time of this handover.

Other PR #20 ideas that may still be worth re-evaluating after the scan are:

- a clean Creation Guide runtime replacing wrapper/patch-style loading;
- deliberate mount points for folder/intake/health sections;
- narrower and clearer folder-gate completion checks;
- explicit Project Editor module composition cleanup.

None of these may be assumed live until confirmed in current `main` or deliberately reapplied in a clean later PR.

## Known Documentation / Tracking Items for the Scan to Check

The full scan should explicitly check for stale status wording and stale tasks rather than trusting older completion labels. Known items to verify include:

1. `docs/artifex/05-creation-guide.md` currently lists resolving the Blank Starter `startScreenId` rule as a next task, even though current-main initializer inspection already shows `startScreenId: null` in both starter `project.json` and `logic.json`.
2. `artifex/shared/todo-guide/all-apps-todos.json` currently contains `todo_creation_guide_blank_starter_start_screen_null` as open, although current-main code appears to contain the implementation; this should be moved to review/done only after the full scan and appropriate validation decide its status.
3. Any statement that the abandoned PR #20 clean runtime or shared package helper is implemented must be rejected unless it appears in current `main` after a clean future PR.
4. Any app or document that restores `archetypes/sound-index.json` or `archsound_` conflicts with the current-main generated-audio contract and should be flagged.
5. Remaining `Project Manager` user-facing names should be inventoried for migration to the locked user-facing name **Project Editor**, without breaking stored legacy paths or identifiers.

## Full Current-Main Scan Required Next

The next action is inspection, not implementation. Start from current `main`, and produce an audit report before authoring or refactoring more runtime code.

The scan should inspect:

```text
docs/artifex/
artifex/shared/
artifex/apps/
artifex/foreverbound/ and other game/template/intake data areas
open PRs/branches only as historical context, not as live code
```

For each active app or shared tool, report:

1. current visible version and entry-point file;
2. whether it loads clean modules, patches/wrappers or obsolete demo state;
3. files/data it owns, reads and must not own;
4. current project paths, JSON schemas and ID prefixes it uses;
5. whether it uses the connected project folder, browser-draft-only state, import/export only or unclear save behaviour;
6. whether it agrees with the canonical contract documents;
7. whether newer work has created duplicate/conflicting approaches;
8. safe next task scope, without immediately making runtime edits.

The scan must include at least:

```text
Creation Guide
Project Editor
Scene Editor
Quest Builder
Puzzle Creator
Archetype Object Creator
Effect Editor
Asset Library / Asset Browser where present
Sound Generator / procedural synth shared tool
Health / Build shared systems
Hub / app-index / module navigation
Template Game and Artifacts Adventures / Forever Bound data locations
```

## Required Contract Documents for the Scan

Use current-main versions of:

```text
docs/artifex/00-index.md
docs/artifex/05-creation-guide.md
docs/artifex/07-quest-builder.md
docs/artifex/07a-quest-builder-structured-authoring.md
docs/artifex/07b-puzzle-creator-quest-integration.md
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/21-template-game-project-contract.md
docs/artifex/22-sound-archetype-generator.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
```

## Work To Do After the Full Scan

Do not decide the final implementation sequence until the scan has confirmed the current codebase. Based on the known issue, the likely clean task sequence is:

### 1. Small Creation Guide consistency PR, only if still needed after the scan

Start from fresh current `main`, not from PR #20. Limit the scope to verified missing Creation Guide fixes, likely including:

- one shared `starterFilePackage(project)` function if the disk/ZIP duplication risk still exists;
- connected-folder initialisation and Export ZIP using that same package builder;
- correction of stale Creation Guide docs/todo status about `startScreenId`;
- no binary assets and no unrelated module implementation.

A clean runtime/bootstrap replacement should be included only if the scan shows it is still required and safe; it must not be bundled automatically just because it existed in PR #20.

### 2. Separate Project Editor tasks

Treat Project Editor independently after scan findings are reviewed:

- architecture/patch cleanup, if still required;
- connected-folder real project read/write integration as a separate later implementation task;
- save-state and browser-draft behaviour through the shared service.

Do not merge these into the small Creation Guide canonical-package correction unless there is a verified unavoidable dependency.

### 3. Remaining cross-app alignment

After Creation Guide / Project Editor foundations are verified, inspect and schedule integration for Quest Builder, Puzzle Creator, Scene Editor, Archetype Object Creator, Effect Editor, Asset Library, Sound Generator and Build/Health systems based on actual current-main gaps.

### 4. Template Game validation

Only after the connected flows are real and audited should Template Game be populated and used to prove cross-app references.

## Do Not Do Before the Scan Is Reviewed

Do not:

- merge PR #20;
- keep attempting to reconcile or publish PR #20;
- use PR #20 as the base for new development;
- manually resolve its conflicts in GitHub;
- overwrite current-main sound, quest, puzzle or object work with older PR content;
- assume a locally verified Codex result was applied to GitHub;
- start Template Game population;
- combine unrelated refactoring and connected-folder integration into one large repair task.

## Scan Deliverable

Write the audit report under:

```text
artifex/shared/todo-guide/audits/2026-05-31-global-app-audit.md
```

or, if completed after midnight in Berlin, use the actual Berlin date in the filename.

The scan report must clearly distinguish:

```text
present on current main
present only in an old PR or local Codex result
verified working in browser
verified only by static/code inspection
planned / documented only
conflicting / needs decision
```

After the scan report is reviewed, create only narrowly scoped clean tasks from current `main`.