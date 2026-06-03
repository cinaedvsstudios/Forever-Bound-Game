# Artifex Active Documentation Index and Control Map

Status: Active consolidation index  
Foundation published on `main`: PR #47 / merge `a475a90f4baca4421ff120c7244563ac283b9dd8`  
Latest baseline checked for this update: Archetype Object Creator V1.36 on current `main`, audited 3 June 2026 from merged PR #38 / merge `ef4f37ebe5850c6367db59e57c01e2bb89949384`  
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
| `docs/artifex/4A-creation-guide.md` | Creation Guide module specification document. | Added during Creation Guide extraction pass; verified against current V1.1.12 implementation. |
| `docs/artifex/5A-project-editor.md` | Project Editor module specification document. | Added during Project Editor extraction pass; verified against current v0.1.32 CONTRACT implementation. |
| `docs/artifex/6A-scene-editor.md` | Scene Editor module specification document. | Added during Scene Editor extraction pass; verified against accepted current v0.37 baseline. |
| `docs/artifex/7A-quest-builder.md` | Quest Builder module specification document. | Added during Quest Builder extraction pass; verified against current V1.2.12 implementation. |
| `docs/artifex/8A-archetype-object-creator.md` | Archetype Object Creator module specification document. | Added during Object Creator extraction pass; verified against V1.36 implementation with post-merge lifecycle validation retained in `2A`. |
| `docs/artifex/19a-project-starter-file-schemas.md` | Subordinate technical reference for exact canonical starter JSON and typed index shapes. | Retain active, subject to link/title cleanup after contract adoption. |
| `docs/artifex/22-sound-archetype-generator.md` | Sound Generator module/service specification document. | Retain active; inspect last because current Sound Generator work is in progress. |

## Target Module / Service Specification Set

Each confirmed real module or maintained shared service must ultimately have one active specification document. The final filename for a module may retain an existing appropriate file or be replaced with one cleanly named specification file after its audit; it is not necessary to create a new file merely to rename a valid existing specification.

| Audit order | Module / service | Target specification role | Current handling |
|---:|---|---|---|
| 1 | Master Artifex Contract / Shared Rules | Universal contract, not a module spec. | Foundation active in `docs/artifex/1A-project-file-contracts.md`; refine only when further universal rules are found. |
| 2 | Hub / Artifex Portal | Module navigation, entry points and Hub-only presentation/route baseline. | Extracted into `docs/artifex/3A-hub-artifex-portal.md`; implementation follow-up remains in `2A`. |
| 3 | Creation Guide | New project setup, starter creation, initial intake/setup and active-project registration boundary. | Extracted into `docs/artifex/4A-creation-guide.md`; implementation follow-up remains in `2A`. |
| 4 | Project Editor | Structural/Flatplan/route ownership and Project Editor-only interface/baseline. | Extracted into `docs/artifex/5A-project-editor.md`; implementation follow-up remains in `2A`. |
| 5 | Scene Editor | Scene/screen visual authoring ownership and accepted active baseline. | Extracted into `docs/artifex/6A-scene-editor.md`; implementation follow-up remains in `2A`. |
| 6 | Quest Builder | Quest/progression ownership and its defined use of saved puzzle references. | Extracted into `docs/artifex/7A-quest-builder.md`; implementation follow-up remains in `2A`. |
| 7 | Archetype Object Creator | Reusable non-FX object archetype authoring and final registered-asset reference workflow. | Extracted into `docs/artifex/8A-archetype-object-creator.md`; lifecycle validation and implementation follow-up remain in `2A`. |
| 8 | Effect Editor | Reusable FX ownership and accepted Index2 baseline/route. | Next module audit; protect accepted `index2.html` route. |
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
| `docs/artifex/04-scene-editor.md` | Valid Scene Editor visual-authoring purpose/boundary content moves into `6A`; older migration/local-workflow status content is no longer current authority. | Retain as source evidence now; archive after Scene Editor extraction is accepted. |
| `docs/artifex/05-creation-guide.md` | Valid Creation Guide ownership/current implementation facts move into `4A`; any still-open work stays in `2A`. | Retain as source evidence now; archive after Creation Guide extraction is accepted. |
| `docs/artifex/05a-creation-guide-v119-implementation-notes.md` | Historical V1.1.10 split facts checked against the later V1.1.12 implementation; no longer current authority. | Archive after Creation Guide extraction is accepted. |
| `docs/artifex/06-object-library.md` and `artifex/apps/archetype-object-creator/README.md` | Valid Object Creator purpose, ownership and V1.36 lifecycle facts move into `8A`; live follow-up remains in `2A`. | Retain as source evidence now; archive or replace with a minimal local pointer after `8A` is accepted. |
| `artifex/apps/archetype-object-creator/docs/current-state-v1.35-review.md` and `docs/todo.md` | V1.35 historical/problem evidence and still-live task material have been classified into `8A` / `2A`; neither is a continuing active specification or backlog. | Retain as source evidence now; archive after Object Creator extraction is accepted and lifecycle validation remains represented in `2A`. |
| `artifex/apps/archetype-object-creator/APPLY_INSTRUCTIONS.txt` | Explicitly historical-only early Quick Start/Library handover evidence; lasting portrait-versus-gameplay-action distinction is represented in `8A`. | Archive evidence only; do not use as current implementation guidance. |
| `artifex/apps/archetype-object-creator/archive/legacy-patches/README.md` | Historical list of removed patch layers; its no-restore-patches rule is represented in `8A`. | Retain only as archive evidence; do not restore its listed patch files to live source. |
| `docs/artifex/07-quest-builder.md`, `07a-quest-builder-structured-authoring.md` and `07b-puzzle-creator-quest-integration.md` | Valid permanent Quest Builder purpose, ownership, dialogue and Puzzle handoff rules move into `7A`; open implementation remains in `2A`. | Retain as source evidence now; archive after Quest Builder extraction is accepted and no unique requirement remains. |
| `artifex/apps/quest-builder/README.md`, `docs/structure.md`, `docs/block-taxonomy.md` and `docs/todo.md` | Valid live-baseline and module-specific rules move into `7A`; still-open code work moves into `2A`. | Retain as source evidence now; archive or replace with a minimal local pointer after `7A` is accepted. |
| `artifex/apps/creation-guide/README.md` | Earlier V1.1.10 runtime/readme evidence superseded for current status by V1.1.12 and `4A`. | Decide archive or rewrite-as-local-pointer treatment after `4A` acceptance. |
| `artifex/apps/project-editor/docs/project-editor-real-split-plan.md` | Its enduring Project Editor boundary and modular-live-baseline facts move into `5A`; implementation follow-up stays in `2A`. | Retain as extraction evidence now; archive after Project Editor extraction is accepted. |
| `artifex/apps/scene-editor/scene-editor-v037-accepted-baseline-2026-06-02.md` | Accepted v0.37 baseline evidence and remaining integration boundary move into `6A` / `2A`. | Retain as evidence now; archive or retain as historical acceptance record after `6A` is accepted. |
| `artifex/apps/scene-editor/scene-editor-cleanup-report-2026-05-29.md` and `scene-editor-v034-failed-acceptance-and-consolidation-plan-2026-05-31.md` | Historical intermediate/failed stabilisation evidence; completed v0.35–v0.37 work must not remain live tasks. | Archive after Scene Editor extraction is accepted and no unique open item remains. |
| `docs/artifex/11-portal-hub.md` | Valid Hub purpose/current implementation facts move into `3A`; any still-open implementation work stays in `2A`. | Retain as source evidence now; archive after Hub extraction is accepted. |
| `docs/artifex/12-project-settings.md` | Only still-valid universal active-project/save constraints move into `1A` or a confirmed service spec. Older absolute-path/localStorage-first concepts must not override the current connected-folder contract. | Archive after relevant service/module extraction. |
| `docs/artifex/18-color-and-display-rules.md` | Universal Artifex branding/display/header/accent/control rules move into `1A`. | Archive or retain only as a subordinate visual reference if later inspection proves unique detailed material still needs a separate authority; it must not duplicate `1A`. |
| `docs/artifex/19-project-file-contracts.md` | Its valid central-contract content forms the basis of `1A`. | Supersede/archive after `1A` is approved and all links updated. |
| `docs/artifex/19a-project-starter-file-schemas.md` | Remains the subordinate exact schema technical reference linked from `1A`, `4A`, `5A`, `7A` and `8A`. | Retain active. |
| `docs/artifex/20-asset-intake-workflow.md` | Implemented Creation Guide intake setup facts move into `4A`; Object Creator bounded finalisation/promotion facts move into `8A`; remaining Asset Library-specific promotion workflow is assessed in the Asset Library pass. | Decide final retain/archive treatment during Asset Library audit. |
| `docs/artifex/21-template-game-project-contract.md` | Universal three-layer distinction moves into `1A`; unique Template Game/reference-project material may remain as one bounded reference-project specification. | Decide retain/archive treatment after project/reference scope audit. |
| `docs/artifex/22-sound-archetype-generator.md` | Sound Generator-specific permanent information stays in that module/service spec; universal generated-audio asset rule exists once in `1A`. | Retain active and consolidate last because current Sound Generator work is in progress. |
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