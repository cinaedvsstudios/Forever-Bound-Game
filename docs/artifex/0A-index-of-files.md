# Artifex Active Documentation Index and Control Map

Status: Active consolidation index  
Foundation published on `main`: PR #47 / merge `a475a90f4baca4421ff120c7244563ac283b9dd8`  
Latest baseline checked for this update: `f707beb781a63165da29e145f5b8c4deeeada6ec`  
Intended final role: the single active index identifying authoritative Artifex documentation, module specifications, task source and archive policy.

## Purpose

This index exists to stop Artifex documentation from becoming a group of overlapping current-state files, task files, handovers and audit records that all attempt to describe the same project.

Artifex is a reusable game-building system. Forever Bound / Artifacts Adventures is a production project authored through Artifex and must not be confused with the tool platform itself.

The controlled active-document structure is:

```text
One universal contract:
  docs/artifex/1A-project-file-contracts.md

One specification document per actual module or maintained shared service:
  only that module/service's permanent unique role, ownership, route/baseline and interface

One human-readable task document:
  docs/artifex/2A-global-to-do.md

Archive:
  old audits, status reports, completed-pass records, superseded handovers,
  old per-app todo files and other historical implementation evidence
```

During this consolidation, older documents remain source evidence until their valid information is classified and transferred. A document is not archived merely because its filename is old; the transfer/archive decision must be verified first.

## Authority Order

| Priority | Document type | Authority |
|---:|---|---|
| 1 | Master contract | Owns universal Artifex rules applying across modules/services. |
| 2 | Module/service specification | Owns fixed information unique to one module/service. |
| 3 | Exact technical schema/reference explicitly linked from the contract or a module spec | Owns detailed implementation shape for its bounded subject only. |
| 4 | `docs/artifex/2A-global-to-do.md` | Owns outstanding/current/blocked/future work; it does not redefine contract rules. |
| 5 | Archive | Preserves history/evidence only and is not an implementation authority. |

If two active documents contain the same rule, status statement or task, the information must be consolidated into its single correct authority instead of maintained twice.

## Active Foundation Documents

| File | Intended active role | Status in this consolidation |
|---|---|---|
| `docs/artifex/0A-index-of-files.md` | This controlled active-document index. | Active consolidation index. |
| `docs/artifex/1A-project-file-contracts.md` | Master Artifex contract: universal platform, ownership, save, path, asset, branding and documentation-control rules. | Active foundation; still being refined as each module is extracted. |
| `docs/artifex/2A-global-to-do.md` | The single human-readable global active backlog, divided by All Apps / Shared Platform and each module/service. | Active destination for new outstanding work during consolidation. |
| `docs/artifex/3A-hub-artifex-portal.md` | Hub / Artifex Portal module specification document. | Added during Hub extraction pass. |
| `docs/artifex/19a-project-starter-file-schemas.md` | Subordinate technical reference for exact canonical starter JSON and typed index shapes. | Retain active, subject to link/title cleanup after contract adoption. |
| `docs/artifex/22-sound-archetype-generator.md` | Sound Generator module/service specification document. | Retain active; inspect last because current Sound Generator work is in progress. |

## Target Module / Service Specification Set

Each confirmed real module or maintained shared service must ultimately have one active specification document. The final filename for a module may retain an existing appropriate file or be replaced with one cleanly named specification file after its audit; it is not necessary to create a new file merely to rename a valid existing specification.

| Audit order | Module / service | Target specification role | Current handling |
|---:|---|---|---|
| 1 | Master Artifex Contract / Shared Rules | Universal contract, not a module spec. | Foundation active in `docs/artifex/1A-project-file-contracts.md`; refine only when further universal rules are found. |
| 2 | Hub / Artifex Portal | Module navigation, entry points and Hub-only presentation/route baseline. | Extracted into `docs/artifex/3A-hub-artifex-portal.md`; implementation follow-up remains in `2A`. |
| 3 | Creation Guide | New project setup, starter creation, initial intake/setup and active-project registration boundary. | Next module audit. |
| 4 | Project Editor | Structural/Flatplan/route ownership and Project Editor-only interface/baseline. | Consolidate any historical `Project Manager` material as migration evidence only. |
| 5 | Scene Editor | Scene/screen visual authoring ownership and accepted active baseline. | Extract latest accepted baseline; archive obsolete failed-status records later. |
| 6 | Quest Builder | Quest/progression ownership and its defined use of saved puzzle references. | Avoid copying Puzzle Creator internals. |
| 7 | Archetype Object Creator | Reusable non-FX object archetype authoring and final registered-asset reference workflow. | Preserve latest validation/work status in global to-do, not spec history. |
| 8 | Effect Editor | Reusable FX ownership and accepted Index2 baseline/route. | Protect accepted `index2.html` route. |
| 9 | Asset Library | Promotion and final registration of supplied/generated assets. | Decide whether existing asset workflow content forms this spec. |
| 10 | Shared Connected Project Folder Service | Folder permission/read/write/save-state infrastructure. | Determine whether real maintained service merits its own spec. |
| 11 | Shared Active Project Service | Shared selected-project state and module handoff. | Determine whether separate spec or contract-only boundary. |
| 12 | Registered Content Service / Picker | Shared browsing/selection of registered records. | Determine whether separate service or Asset Library responsibility. |
| 13 | Shared Health Guide / Project Audit | Validation/readiness reporting ownership and no-silent-overwrite rule. | Determine canonical spec file. |
| 14 | Build Game | Validated package/build-output ownership. | Determine canonical spec file. |
| 15 | Runtime Engine / Playtest | Reading/previewing/running authored content. | Determine whether one or two maintained service specs are justified. |
| 16 | Puzzle Creator | Self-contained puzzle authoring ownership and accepted current baseline. | Inspect late because active user work is currently occurring here. |
| 17 | Sound Generator | Procedural sound authoring/preview/registration interface. | Inspect last; `22-sound-archetype-generator.md` is its spec. |

A helper implementation file does not automatically receive its own specification document. A spec exists for a real module/service boundary only.

## Global To-Do Source

The sole human-readable active task source is:

```text
docs/artifex/2A-global-to-do.md
```

Its sections are:

```text
All Apps / Shared Platform
Hub / Artifex Portal
Creation Guide
Project Editor
Scene Editor
Quest Builder
Archetype Object Creator
Effect Editor
Asset Library
Shared Connected Project Folder Service          [only if confirmed as maintained service]
Shared Active Project Service                     [only if confirmed as maintained service]
Registered Content Service / Picker               [only if confirmed as maintained service]
Shared Health Guide / Project Audit
Build Game
Runtime Engine / Playtest                         [once classification is confirmed]
Puzzle Creator
Sound Generator
```

Universal permanent rules do not belong in the global to-do. Module baselines should appear there only when necessary to protect active work from obsolete assumptions.

`artifex/shared/todo-guide/all-apps-todos.json` must be inspected for code dependencies before changing or relocating it. If required by an application, it may be retained temporarily as machine-readable/runtime-linked task data, but it must not remain an independent human-maintained backlog competing with `docs/artifex/2A-global-to-do.md`.

## Current Shared-Rule Source Classification

The following classification records the starting plan for documents that currently include cross-module material. It is not an archive operation; no existing document is removed by this index.

| Current file | Valid information destination | Intended treatment after extraction and verification |
|---|---|---|
| `docs/artifex/00-index.md` | Active file inventory and authoritative-file rules move into this `0A` index. Module-specific pointers remain only where still useful. | Supersede/archive once this controlled index and module specs are complete. |
| `docs/GLOBAL_TODO.md` | Any still-live work not already captured moves into `docs/artifex/2A-global-to-do.md`. | Retain as source evidence until extraction is confirmed; archive later, not delete now. |
| `docs/artifex/02-module-architecture.md` | Universal ownership/boundary principles move into `1A`; unique module descriptions move into the relevant module specs. | Archive after module audit extraction. |
| `docs/artifex/11-portal-hub.md` | Valid Hub purpose/current implementation facts move into `3A`; any still-open implementation work stays in `2A`. | Retain as source evidence now; archive after Hub extraction is accepted. |
| `docs/artifex/12-project-settings.md` | Only still-valid universal active-project/save constraints move into `1A` or a confirmed service spec. Older absolute-path/localStorage-first concepts must not override the current connected-folder contract. | Archive after relevant service/module extraction. |
| `docs/artifex/18-color-and-display-rules.md` | Universal Artifex branding/display/header/accent/control rules move into `1A`. | Archive or retain only as a subordinate visual reference if later inspection proves unique detailed material still needs a separate authority; it must not duplicate `1A`. |
| `docs/artifex/19-project-file-contracts.md` | Its valid central-contract content forms the basis of `1A`. | Supersede/archive after `1A` is approved and all links updated. |
| `docs/artifex/19a-project-starter-file-schemas.md` | Remains the subordinate exact schema technical reference linked from `1A`. | Retain active. |
| `docs/artifex/20-asset-intake-workflow.md` | Universal intake-versus-final-asset rules move into `1A`; Asset Library/Creation Guide-specific workflow belongs in the relevant single specs. | Decide final retain/archive treatment during Asset Library and Creation Guide audits. |
| `docs/artifex/21-template-game-project-contract.md` | Universal three-layer distinction moves into `1A`; unique Template Game/reference-project material may remain as one bounded reference-project specification. | Decide retain/archive treatment after project/reference scope audit. |
| `docs/artifex/22-sound-archetype-generator.md` | Sound Generator-specific permanent information stays in that module/service spec; universal generated-audio asset rule exists once in `1A`. | Retain active and consolidate last because current work is in progress. |
| `docs/artifex/23-current-main-scan-and-pr20-recovery.md` | Any current outstanding work moves to `docs/artifex/2A-global-to-do.md`; historical recovery evidence stays historical. | Archive after extraction. |
| `docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md` | Permanent no-patch/one-scope/verified-archive/process rules move into `1A`; remaining open work moves into `docs/artifex/2A-global-to-do.md`; completed phases remain history. | Archive after extraction. |
| `artifex/shared/todo-guide/README.md` | Valid universal ownership/task/document-control rules move into `1A`; outstanding work moves to `2A`; machine task shape retained only if a real service/code dependency requires it. | Supersede/archive after dependency audit and extraction. |
| `artifex/shared/todo-guide/all-apps-todos.json` | Active human tasks must be represented in `2A`; code-linked machine content remains until safely changed. | Dependency check required before any decision. |
| `artifex/shared/todo-guide/audits/**` | Still-valid current facts go to module specs or `2A`; permanent universal rules go to `1A`. | Archive/history only after extraction. |

## Current Duplication Rules to Remove

The following practices are no longer acceptable for the final controlled documentation model:

- maintaining separate active app-specific `todo.md` files alongside the single `2A` global backlog;
- writing new current-state or baseline documents that become competing status authorities;
- keeping dated audit reports in the active instruction chain after their valid information is transferred;
- copying universal save/path/branding/ownership rules into every module specification;
- using old status documentation as an implementation baseline instead of verifying current `main` and the module's accepted current spec.

## Archive Policy

Archive rather than delete history once its active information has been safely transferred. Archive candidates include:

```text
old per-app todo files
status refreshes and current-state reviews
dated baseline matrices and read-only audit reports
failed-acceptance plans
old implementation/update-step histories
handover records
PR-specific documentation records
superseded contract/index files
```

Archived files remain evidence only. Any active index or module spec must not point to an archived document as the current rule or current baseline.

## Parallel Work Protection

Puzzle Creator and Sound Generator are currently being edited separately. Their documentation must be consolidated only after confirming the latest current `main`, any newly merged or open work and the newest accepted baseline. Do not overwrite their current truth from an earlier audit record.

## Consolidation Implementation Notes

This controlled documentation set does not, by itself:

- archive or delete any current document;
- change any runtime route or app code;
- change application schemas or file loading behaviour;
- retire legacy task sources before extraction is complete;
- authorise merging any unrelated existing PR.

Each following module/service audit should update this controlled map with its chosen single spec file, the information placed in `2A` and the documents eligible for archive after approval.