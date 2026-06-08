# Artifex Active Documentation Index and Control Map

Status: Active consolidation index  
Intended role: the single active index identifying authoritative Artifex documentation, module/service specifications, task source and archive policy.  
Backlog source: `docs/artifex/02A-global-to-do.md`  
Universal contract: `docs/artifex/01A-project-file-contracts.md`

## Purpose

This index prevents Artifex documentation from becoming a group of overlapping current-state files, task files, implementation reports and app-specific plans that all attempt to describe the same project.

Artifex is the reusable game-building system. Forever Bound / Artifacts Adventures is a production project authored through Artifex and must not be confused with the tool platform itself.

The controlled active-document structure is:

```text
One universal contract:
  docs/artifex/01A-project-file-contracts.md

One human-readable active backlog:
  docs/artifex/02A-global-to-do.md

One specification document per actual module or maintained shared service:
  only that module/service's permanent unique role, ownership, route/baseline and interface

Active subordinate references where needed:
  schema, terminology, Template Game, Template System and visual/style references

Archive:
  old audits, status reports, completed-pass records, superseded handovers,
  old per-app todo files and other historical implementation evidence
```

Older documents remain source evidence after their valid information has been transferred. Archived documents are not current implementation authority.

## Authority Order

| Priority | Document type | Authority |
|---:|---|---|
| 1 | Master contract | Universal Artifex rules applying across modules/services. |
| 2 | Module/service specification | Fixed information unique to one module/service. |
| 3 | Subordinate technical/reference document | Detailed implementation or reference material for its bounded subject only. |
| 4 | `docs/artifex/02A-global-to-do.md` | Outstanding/current/blocked/future work. It does not redefine contract rules. |
| 5 | Archive | History and evidence only. Not implementation authority. |

If two active documents contain the same rule, status statement or task, consolidate it into its single correct authority instead of maintaining both.

## Active Foundation Documents

| File | Active role | Status |
|---|---|---|
| `docs/artifex/00A-index.md` | This controlled active-document index. | Active. |
| `docs/artifex/01A-project-file-contracts.md` | Master Artifex contract: universal platform, ownership, save, path, asset, branding and documentation-control rules. | Active. |
| `docs/artifex/02A-global-to-do.md` | Single human-readable global active backlog. | Active. |

## Active Module and Shared-Service Specifications

| Order | File | Module / service | Current status |
|---:|---|---|---|
| 03 | `docs/artifex/03A-hub.md` | Hub / Artifex Portal | Current verified implementation was Hub V1.1.4. |
| 04 | `docs/artifex/04A-creation-guide.md` | Creation Guide | Current verified implementation was V1.1.12. |
| 05 | `docs/artifex/05A-project-editor.md` | Project Editor | Current verified implementation was v0.1.32 CONTRACT. |
| 06 | `docs/artifex/06A-scene-editor.md` | Scene Editor | Accepted current implementation was v0.37-control-state-inspector-retention. |
| 07 | `docs/artifex/07A-quest-builder.md` | Quest Builder | Current verified implementation was V1.2.12. |
| 08 | `docs/artifex/08A-object-creator.md` | Archetype Object Creator | V1.36 implementation captured with lifecycle validation retained in `02A`. |
| 09 | `docs/artifex/09A-effect-editor.md` | Effect Editor | Accepted route is `index2.html` / INDEX2-CLEAN-0.2.6. |
| 10 | `docs/artifex/10A-asset-library.md` | Asset Library | Final registered-asset ownership layer; no standalone complete UI route verified. |
| 11 | `docs/artifex/11A-connected-project-folder.md` | Shared Connected Project Folder Service | Shared browser folder/permission/read-write infrastructure. |
| 12 | `docs/artifex/12A-active-project.md` | Shared Active Project Service | Shared active-project selection/context layer. |
| 13 | `docs/artifex/13A-registered-content-picker.md` | Registered Content Service / Picker | Shared final-record reader/picker. |
| 14 | `docs/artifex/14A-health-guide.md` | Shared Health Guide / Project Audit | Shared diagnostic/audit layer. |
| 15 | `docs/artifex/15A-build-game.md` | Build Game | Future packaging/build-output owner; no complete standalone build route verified. |
| 16 | `docs/artifex/16A-runtime-playtest.md` | Runtime Engine / Playtest | Shared runtime/preview/playtest boundary; not a completed runtime app. |
| 17 | `docs/artifex/17A-puzzle-creator.md` | Puzzle Creator | V1.35 baseline captured; Labyrinth Maze is current implemented workflow; other modules are planning placeholders. |
| 18 | `docs/artifex/18A-sound-library.md` | Sound Generator / Sound Library | Shared procedural/imported audio workflow over registered `asset_` records; PR #46 remains provisional until accepted. |

## Active Subordinate Reference Documents

| Order | File | Reference subject | Status |
|---:|---|---|---|
| 19 | `docs/artifex/19A-project-starter-schemas.md` | Canonical starter JSON and typed index shapes. | Active subordinate schema reference. |
| 20 | `docs/artifex/20A-terminology-naming.md` | Controlled terminology, naming alternatives and unresolved wording groups. | Active reference. |
| 21 | `docs/artifex/21A-template-game.md` | Populated connected Template Game reference project. | Active reference. |
| 22 | `docs/artifex/22A-template-system.md` | Reusable starter template system. | Active reference/planned service spec. |
| 23 | `docs/artifex/23A-colour-display-rules.md` | Exact colour, display, header, accent and UI styling rules. | Active visual/style reference. |

## Completed Active Sequence

The controlled active documentation set is now:

```text
00A Index
01A Universal Artifex contract
02A Global active backlog
03A Hub / Artifex Portal
04A Creation Guide
05A Project Editor
06A Scene Editor
07A Quest Builder
08A Archetype Object Creator
09A Effect Editor
10A Asset Library
11A Shared Connected Project Folder Service
12A Shared Active Project Service
13A Registered Content Service / Picker
14A Shared Health Guide / Project Audit
15A Build Game
16A Runtime Engine / Playtest
17A Puzzle Creator
18A Sound Generator / Sound Library
19A Project Starter Schemas
20A Terminology and Naming
21A Template Game Reference Project
22A Template System
23A Colour and Display Rules
```

Any future module/service specification should receive the next `A` number only after confirming that it represents a real maintained module/service boundary and not merely a helper note.

## Global To-Do Source

The sole human-readable active task source is:

```text
docs/artifex/02A-global-to-do.md
```

Universal permanent rules do not belong in the global to-do. Module baselines should appear there only when necessary to protect active work from obsolete assumptions.

Machine-readable or project-specific task files may exist where runtime/app compatibility requires them, but they must not become independent human-maintained backlogs competing with `02A`.

Examples of project/runtime task files that require dependency checks before retirement:

```text
artifex/shared/todo-guide/all-apps-todos.json
todos/project-manager-todos.json
todos/project-editor-todos.json
```

## Source and Archive Classification

The following old files are source evidence or archive candidates after their valid information has been transferred into the active documents above.

| Existing old file / area | Valid information destination | Intended treatment |
|---|---|---|
| `00-index.md` | Active index material moved into `00A`. | Archive. |
| `GLOBAL_TODO.md` | Still-live tasks moved into `02A`. | Archive after verification. |
| `01-core-vision.md` | Universal system/layer rules moved into `01A`, `21A` and relevant module specs. | Archive. |
| `02-module-architecture.md` | Universal rules into `01A`; module boundaries into relevant specs. | Archive. |
| `03-project-editor-flatplan.md` | Project Editor material into `05A`; terminology into `20A`. | Archive. |
| `04-scene-editor.md` | Scene Editor rules into `06A`; open work into `02A`. | Archive. |
| `05-creation-guide.md` and `05a-creation-guide-v119-implementation-notes.md` | Creation Guide facts into `04A`; open work into `02A`. | Archive. |
| `06-object-library.md` and Object Creator local docs | Object Creator rules into `08A`; validation/follow-up into `02A`. | Archive or minimal local pointer after approval. |
| `07-quest-builder.md`, `07a-quest-builder-structured-authoring.md`, `07b-puzzle-creator-quest-integration.md`, `07C-potion-match-quest-outcome-handoff.md` and Quest Builder local docs | Quest Builder rules into `07A`; Puzzle handoff also reflected in `17A`; open work into `02A`. | Archive. |
| `08-playtest-and-build.md` | Runtime/Playtest boundary into `16A`; Build boundary into `15A`. | Archive. |
| `09-terminology.md` and `10-naming-brainstorm.md` | Terminology and naming decisions into `20A`. | Archive. |
| `11-portal-hub.md` | Hub rules into `03A`. | Archive. |
| `12-project-settings.md` | Active Project and Connected Folder concepts into `11A` and `12A`. | Archive after dependency check. |
| `13-effects-library.md` and Effect Editor docs/todos/phase notes/audits | Effect Editor rules into `09A`; open work into `02A`. | Archive or minimal local pointer. |
| `14-asset-library.md` | Asset Library feature detail into `10A`; open work into `02A`. | Archive. |
| `15-template-system.md` | Template System reference into `22A`. | Archive. |
| `16-dev-status-and-risks.md` | Still-live process risks into `01A` / `02A`. | Archive. |
| `17-codex-prompts.md` | Prompt history only. | Archive. |
| `18-color-and-display-rules.md` | Exact visual rules into `23A`. | Archive. |
| `19-project-file-contracts.md` | Universal project-file contract into `01A`; schema detail into `19A`. | Archive. |
| `19a-project-starter-file-schemas.md` | Renamed and retained as `19A-project-starter-schemas.md`. | Remove old lowercase duplicate after rename. |
| `20-asset-intake-workflow.md` | Creation Guide intake into `04A`; Object Creator finalisation into `08A`; Asset Library promotion into `10A`. | Archive. |
| `21-template-game-project-contract.md` | Template Game reference project into `21A`. | Archive. |
| `22-sound-archetype-generator.md` | Sound Generator / Sound Library rules into `18A`. | Archive/source evidence. |
| `23-current-main-scan-and-pr20-recovery.md` | Any live tasks into `02A`; history remains history. | Archive. |
| `24-stabilisation-cleanup-and-ui-resumption-plan.md` | Permanent process rules into `01A`; live work into `02A`. | Archive. |
| `CONTROL_FILE_UPDATES.md` | Helper note only; guidance absorbed into `00A` and `02A`. | Archive or delete after applying. |

## Current Duplication Rules to Remove

The following practices are no longer acceptable in the controlled documentation model:

- maintaining active app-specific `todo.md` files alongside `02A`;
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

Archived files remain evidence only. Active specs and `02A` must not cite archived files as the current rule or baseline.

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

Those remain explicit tasks in `02A`.
