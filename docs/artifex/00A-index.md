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

## Remaining Active Markdown Policy

Outside this controlled `docs/artifex/00A`–`23A` set, tracked Markdown files may remain outside archive only when they are a general repository landing page or a genuinely required local implementation README that does not duplicate Artifex specifications, todos, audits, route decisions, split plans, phase notes or module contracts.

As of the final 2026-06-08 repository Markdown consolidation, the intended non-archive Markdown set is:

```text
README.md
docs/artifex/00A-index.md
docs/artifex/01A-project-file-contracts.md
docs/artifex/02A-global-to-do.md
docs/artifex/03A-hub.md
docs/artifex/04A-creation-guide.md
docs/artifex/05A-project-editor.md
docs/artifex/06A-scene-editor.md
docs/artifex/07A-quest-builder.md
docs/artifex/08A-object-creator.md
docs/artifex/09A-effect-editor.md
docs/artifex/10A-asset-library.md
docs/artifex/11A-connected-project-folder.md
docs/artifex/12A-active-project.md
docs/artifex/13A-registered-content-picker.md
docs/artifex/14A-health-guide.md
docs/artifex/15A-build-game.md
docs/artifex/16A-runtime-playtest.md
docs/artifex/17A-puzzle-creator.md
docs/artifex/18A-sound-library.md
docs/artifex/19A-project-starter-schemas.md
docs/artifex/20A-terminology-naming.md
docs/artifex/21A-template-game.md
docs/artifex/22A-template-system.md
docs/artifex/23A-colour-display-rules.md
```

Required local runtime Markdown resources retained outside archive:

```text
artifex/apps/misc/translator/demotic-rules.md
artifex/apps/misc/translator/runispeleus-rules.md
artifex/apps/misc/translator/volkhv-tartessian-rules.md
```

Empty placeholder folders that lost README-only tracking during archive consolidation must be intentionally tracked with `.gitkeep` when the folder itself remains part of a starter/intake contract.

The final audit for repository Markdown files archived during that pass is retained at:

```text
docs/archive/pre-a-spec-consolidation-2026-06-08/repo-remaining-docs/FINAL_MD_ARCHIVE_AUDIT.md
```

## Archive Policy

Archive rather than delete once active information has been safely transferred. Archived files remain evidence only. Active specs and `02A` must not cite archived files as the current rule or baseline.

Archive candidates include old per-app todo files, status refreshes and current-state reviews, dated baseline matrices and read-only audit reports, failed-acceptance plans, old implementation/update-step histories, handover records, PR-specific documentation records, superseded contract/index files, superseded non-`A` module specs and local README-style docs that duplicate active specifications.

## Consolidation Implementation Notes

This controlled documentation set does not itself:

- change runtime routes;
- change schemas;
- merge open runtime PRs;
- retire machine-readable task files before dependency checks;
- validate Object Creator runtime lifecycle;
- accept PR #46 Sound Library work;
- turn planning placeholder Puzzle modules into completed engines.

Those remain explicit tasks in `02A` where still current.
