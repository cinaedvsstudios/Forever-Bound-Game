# Artifex Active Documentation Index and Control Map

Status: Active consolidation index  
Intended role: the single active index identifying authoritative Artifex documentation, module/service specifications, task source and archive policy.  
Backlog source: `docs/artifex/2A-global-to-do.md`  
Universal contract: `docs/artifex/1A-project-file-contracts.md`

## Purpose

This index prevents Artifex documentation from becoming a group of overlapping current-state files, task files, implementation reports and app-specific plans that all attempt to describe the same project.

Artifex is the reusable game-building system. Forever Bound / Artifacts Adventures is a production project authored through Artifex and must not be confused with the tool platform itself.

The controlled active-document structure is:

```text
One universal contract:
  docs/artifex/1A-project-file-contracts.md

One specification document per actual module or maintained shared service:
  only that module/service's permanent unique role, ownership, route/baseline and interface

One human-readable active backlog:
  docs/artifex/2A-global-to-do.md

Archive:
  old audits, status reports, completed-pass records, superseded handovers,
  old per-app todo files and other historical implementation evidence
```

Older documents remain source evidence until their valid information is transferred and the archive decision is approved. A document is not archived merely because its filename is old; the transfer must be checked first.

## Authority Order

| Priority | Document type | Authority |
|---:|---|---|
| 1 | Master contract | Universal Artifex rules applying across modules/services. |
| 2 | Module/service specification | Fixed information unique to one module/service. |
| 3 | Subordinate technical schema/reference | Detailed implementation shape for its bounded subject only. |
| 4 | `docs/artifex/2A-global-to-do.md` | Outstanding/current/blocked/future work. It does not redefine contract rules. |
| 5 | Archive | History and evidence only. Not implementation authority. |

If two active documents contain the same rule, status statement or task, consolidate it into its single correct authority instead of maintaining both.

## Active Foundation Documents

| File | Active role | Status |
|---|---|---|
| `docs/artifex/0A-index-of-files.md` | This controlled active-document index. | Active. |
| `docs/artifex/1A-project-file-contracts.md` | Master Artifex contract: universal platform, ownership, save, path, asset, branding and documentation-control rules. | Active. |
| `docs/artifex/2A-global-to-do.md` | Single human-readable global active backlog. | Active. |
| `docs/artifex/19a-project-starter-file-schemas.md` | Subordinate exact schema reference for canonical starter JSON and typed index shapes. | Active subordinate reference. |

## Active Module and Service Specifications

| Order | File | Module / service | Current status |
|---:|---|---|---|
| 3 | `docs/artifex/3A-hub-artifex-portal.md` | Hub / Artifex Portal | Extracted; current verified implementation was Hub V1.1.4. |
| 4 | `docs/artifex/4A-creation-guide.md` | Creation Guide | Extracted; current verified implementation was V1.1.12. |
| 5 | `docs/artifex/5A-project-editor.md` | Project Editor | Extracted; current verified implementation was v0.1.32 CONTRACT. |
| 6 | `docs/artifex/6A-scene-editor.md` | Scene Editor | Extracted; accepted current implementation was v0.37-control-state-inspector-retention. |
| 7 | `docs/artifex/7A-quest-builder.md` | Quest Builder | Extracted; current verified implementation was V1.2.12. |
| 8 | `docs/artifex/8A-archetype-object-creator.md` | Archetype Object Creator | Extracted; V1.36 implementation captured with lifecycle validation retained in `2A`. |
| 9 | `docs/artifex/9A-effect-editor.md` | Effect Editor | Extracted; accepted route is `index2.html` / INDEX2-CLEAN-0.2.6. |
| 10 | `docs/artifex/10A-asset-library.md` | Asset Library | Extracted as final registered-asset ownership layer; no standalone complete UI route verified. |
| 11 | `docs/artifex/11A-shared-connected-project-folder-service.md` | Shared Connected Project Folder Service | Extracted as shared browser folder/permission/read-write infrastructure. |
| 12 | `docs/artifex/12A-shared-active-project-service.md` | Shared Active Project Service | Extracted as shared active-project selection/context layer. |
| 13 | `docs/artifex/13A-registered-content-service-picker.md` | Registered Content Service / Picker | Extracted as shared final-record reader/picker. |
| 14 | `docs/artifex/14A-shared-health-guide-project-audit.md` | Shared Health Guide / Project Audit | Extracted as shared diagnostic/audit layer. |
| 15 | `docs/artifex/15A-build-game.md` | Build Game | Extracted as future packaging/build-output owner; no complete standalone build route verified. |
| 16 | `docs/artifex/16A-runtime-engine-playtest.md` | Runtime Engine / Playtest | Extracted as shared runtime/preview/playtest boundary; not a completed runtime app. |
| 17 | `docs/artifex/17A-puzzle-creator.md` | Puzzle Creator | Extracted; V1.35 baseline captured with Labyrinth Maze as current implemented workflow and other modules as planning placeholders. |
| 18 | `docs/artifex/18A-sound-generator-sound-library.md` | Sound Generator / Sound Library | Extracted as new `A` spec; old `22-sound-archetype-generator.md` remains source evidence pending archive. |

## Completed Extraction Sequence

The intended extraction sequence has now been completed:

```text
1A  Universal Artifex contract
2A  Global active backlog
3A  Hub / Artifex Portal
4A  Creation Guide
5A  Project Editor
6A  Scene Editor
7A  Quest Builder
8A  Archetype Object Creator
9A  Effect Editor
10A Asset Library
11A Shared Connected Project Folder Service
12A Shared Active Project Service
13A Registered Content Service / Picker
14A Shared Health Guide / Project Audit
15A Build Game
16A Runtime Engine / Playtest
17A Puzzle Creator
18A Sound Generator / Sound Library
```

Any future module/service specification should receive the next `A` number only after confirming that it represents a real maintained module/service boundary and not merely a helper file.

## Global To-Do Source

The sole human-readable active task source is:

```text
docs/artifex/2A-global-to-do.md
```

Universal permanent rules do not belong in the global to-do. Module baselines should appear there only when necessary to protect active work from obsolete assumptions.

Machine-readable or project-specific task files may exist where runtime/app compatibility requires them, but they must not become independent human-maintained backlogs competing with `2A`.

Examples of project/runtime task files that require dependency checks before retirement:

```text
artifex/shared/todo-guide/all-apps-todos.json
todos/project-manager-todos.json
todos/project-editor-todos.json
```

## Source and Archive Classification

The following documents are source evidence or archive candidates after their valid information has been transferred into active `A` specs, `1A`, or `2A`.

| Existing file / area | Valid information destination | Intended treatment |
|---|---|---|
| `docs/artifex/00-index.md` | Active index material moved into `0A`. | Supersede/archive. |
| `docs/GLOBAL_TODO.md` | Still-live tasks moved into `2A`. | Archive after verification. |
| `docs/artifex/02-module-architecture.md` | Universal rules into `1A`; module boundaries into relevant specs. | Archive after verification. |
| `docs/artifex/04-scene-editor.md` | Scene Editor rules into `6A`; open work into `2A`. | Archive/source evidence. |
| `docs/artifex/05-creation-guide.md` and `05a-creation-guide-v119-implementation-notes.md` | Creation Guide facts into `4A`; open work into `2A`. | Archive/source evidence. |
| `docs/artifex/06-object-library.md` and Object Creator local README/current-state/todo files | Object Creator rules into `8A`; validation/follow-up into `2A`. | Archive or minimal local pointer after approval. |
| `artifex/apps/archetype-object-creator/APPLY_INSTRUCTIONS.txt` and `archive/legacy-patches/README.md` | Historical-only Object Creator evidence; no-restore-patches rule in `8A`. | Archive evidence only. |
| `docs/artifex/07-quest-builder.md`, `07a-quest-builder-structured-authoring.md`, `07b-puzzle-creator-quest-integration.md` and Quest Builder README/structure/taxonomy/todo | Quest Builder rules into `7A`; Puzzle handoff also reflected in `17A`; open work into `2A`. | Archive or minimal local pointer. |
| `docs/artifex/08-playtest-and-build.md` | Runtime/Playtest boundary into `16A`; Build boundary into `15A`. | Archive/source evidence. |
| `docs/artifex/13-effects-library.md` and Effect Editor docs/todos/phase notes/audits | Effect Editor rules into `9A`; open work into `2A`. | Archive or minimal local pointer. |
| `artifex/apps/effect-editor/debug/atmosphere-volume/README.md` | Prototype boundary noted in `9A`; not live Index2 feature. | Retain as prototype evidence until production decision. |
| `docs/artifex/20-asset-intake-workflow.md` | Creation Guide intake into `4A`; Object Creator finalisation into `8A`; Asset Library promotion into `10A`. | Archive or reduce after approval. |
| `artifex/shared/registered-content/README.md` | Shared reader/picker rules into `13A`. | Archive/source evidence or local pointer. |
| `docs/artifex/22-sound-archetype-generator.md` | Sound Generator / Sound Library rules into `18A`. | Archive/source evidence; do not replace as active spec. |
| `docs/artifex/23-current-main-scan-and-pr20-recovery.md` | Any live tasks into `2A`; history remains history. | Archive. |
| `docs/artifex/24-stabilisation-cleanup-and-ui-resumption-plan.md` | Permanent process rules into `1A`; live work into `2A`. | Archive. |
| `artifex/shared/todo-guide/README.md` and `artifex/shared/todo-guide/audits/**` | Rules into `1A`; module facts into specs; live tasks into `2A`. | Archive after dependency checks. |
| Open PR #40 Scene/Effect status refresh | Useful Effect Index2 evidence captured in `9A`; Scene portion superseded by `6A`. | Reconcile/close rather than merge as competing authority. |
| Open PR #44 Puzzle V1.34 documentation refresh | Superseded by V1.35 and `17A`; useful boundary material captured. | Reconcile/close rather than merge as competing authority. |
| Open PR #46 Sound Library / Create Synth work | Provisional Sound work reflected in `18A` and `2A`; not accepted baseline until merged/approved. | Keep protected. |
| Merged PR #38 | Object Creator V1.36 baseline evidence for `8A`. | Historical evidence. |
| Merged PR #45 | Scene Editor v0.37 accepted baseline evidence for `6A`. | Historical evidence. |
| Merged PR #48 | Puzzle Creator V1.35 baseline evidence for `17A`. | Historical evidence. |
| Merged PR #49 | Atmosphere Volume prototype evidence for `9A`. | Prototype evidence. |

## Current Duplication Rules to Remove

The following practices are no longer acceptable in the controlled documentation model:

- maintaining active app-specific `todo.md` files alongside `2A`;
- writing new current-state/status documents that become competing authorities;
- copying universal save/path/branding/ownership rules into every module spec;
- using dated audit reports as implementation baselines instead of checking current `main`;
- replacing old non-`A` docs instead of creating/using the controlled `A` file;
- keeping old design notes in the active instruction chain after their valid content is transferred.

## Archive Policy

Archive rather than delete once active information has been safely transferred.

Archive candidates include:

```text
old per-app todo files
status refreshes and current-state reviews
dated baseline matrices and read-only audit reports
failed-acceptance plans
old implementation/update-step histories
handover records
PR-specific documentation records
superseded contract/index files
superseded non-A module specs
```

Archived files remain evidence only. Active specs and `2A` must not cite archived files as the current rule or baseline.

## Consolidation Implementation Notes

This controlled documentation set does not itself:

- delete or archive old files;
- change runtime routes;
- change schemas;
- merge open runtime PRs;
- retire machine-readable task files before dependency checks;
- validate Object Creator runtime lifecycle;
- accept PR #46 Sound Library work;
- turn planning placeholder Puzzle modules into completed engines.

Those remain explicit tasks in `2A`.
