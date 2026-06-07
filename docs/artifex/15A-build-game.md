# Build Game Specification

Status: Active module/service specification during documentation consolidation  
Owning module/service: Build Game  
Active route: no verified standalone Build Game app route exists yet  
Current verified implementation baseline: Build Game is not yet implemented as a complete packaging module; current evidence exists through project contract paths, Project Editor Build Prep presentation, Shared Health Guide tasks and planned build validation work  
Governing universal contract: `docs/artifex/1A-project-file-contracts.md`  
Related specification: `docs/artifex/14A-shared-health-guide-project-audit.md`  
Outstanding work source: `docs/artifex/2A-global-to-do.md`

## Purpose

Build Game is the Artifex packaging and build-output owner.

It validates canonical project content and produces runtime/build outputs that can be used by the playable game/runtime layer. It consumes authored data; it does not author that data.

Build Game is the final gate after authoring modules, Shared Health, registered-content validation and connected-folder save workflows are reliable.

## Ownership Boundary

Build Game owns:

- build readiness gating;
- packaging project files into runtime-ready output;
- writing build output under the project `build/` folder;
- build manifests;
- runtime project packages;
- reporting unresolved references that block packaging;
- refusing to build when required authored content is missing, invalid, or unsafe;
- recording what project version/files/assets were used for a build.

Build Game must not:

- author project content;
- create scenes, quests, puzzles, object archetypes, effect archetypes or assets;
- fix broken references silently;
- promote intake assets;
- rewrite IDs;
- overwrite module-owned records as part of packaging;
- treat browser localStorage as build source of truth;
- package demo/default state when a connected project is selected;
- package raw `intake/` source files as final assets;
- bypass Shared Health failures without an explicit approved override.

## Current Verified Implementation Status

No complete standalone Build Game route is verified in the current repo audit.

The canonical project contract reserves these build paths:

```text
build/runtime-project.json
build/build-manifest.json
```

The current Project Editor Build Prep view is not Build Game. It consumes Shared Health, displays build-readiness-style diagnostics and logs/exports task output, but its current Stage Build button logs the report rather than producing final build files.

Shared Health current code is a foundation for future build validation, not a full Build Game.

Therefore this specification defines the Build Game ownership boundary and required future behaviour. It must not pretend that packaging is already implemented.

## Build Inputs

Build Game should read from the connected project root and canonical project files, including where applicable:

```text
project.json
logic.json
layout.json
registry.json
library-links.json
input-map.json
scenes/scene-index.json
screens/screen-index.json
quests/quest-index.json
sidequests/sidequest-index.json
puzzles/puzzle-index.json
archetypes/object-index.json
archetypes/effect-index.json
assets/asset-index.json
health/latest-health-report.json
todos/project-editor-todos.json
```

It should also read the module-owned records referenced by those indexes.

Older compatibility input may include:

```text
todos/project-manager-todos.json
```

but new output should use Project Editor naming once the migration is implemented.

## Build Outputs

Build Game owns generated outputs under:

```text
build/
```

Known intended output files include:

```text
build/runtime-project.json
build/build-manifest.json
```

Future build outputs may include packaged asset manifests, runtime lookup tables, export bundles or deployable game data, but those must remain generated build artefacts. They must not become the editable authoring source of truth.

## Build Manifest Role

A build manifest should record enough information to understand what was packaged.

Expected manifest categories include:

```text
buildId
projectId
projectName
generatedAt
sourceFiles
sourceIndexes
assetSummary
moduleRecordSummary
healthSummary
warnings
blockingFailures
runtimeOutputFiles
buildToolVersion
```

The exact schema remains future implementation work.

## Runtime Project Role

`build/runtime-project.json` should be a generated runtime-facing package or summary compiled from canonical authored project files.

It may flatten or resolve references for runtime efficiency, but it must remain generated output. A user should not edit it as the primary authored source.

If canonical source records change, the runtime project output must be regenerated.

## Validation Before Packaging

Build Game should require or run validation for:

- connected folder availability and permission;
- active project/folder identity match;
- required canonical files;
- required typed indexes;
- index schema validity;
- duplicate IDs;
- missing records;
- broken scene/screen/Quest/Puzzle/Object/Effect/Asset references;
- invalid route graph or start target;
- invalid registered-content references;
- `intake/` references in permanent authored content;
- missing final asset files;
- unresolved generated-audio asset references;
- local-only drafts not saved to project folder;
- external file changes/conflicts;
- stale Health report;
- stale previous build output.

Build Game may reuse Shared Health checks, but it may apply stricter "cannot package" rules.

## Relationship to Shared Health Guide

Shared Health is the diagnostic and project-audit layer.

Build Game is the packaging layer.

Build Game should consume Shared Health results and may run a final validation pass. It should not become the owner of Shared Health checks that apply across authoring apps, and it should not silently fix the issues it reports.

If Health reports a fix owner, Build Game should surface that owner.

## Relationship to Authoring Modules

Build Game consumes authored data from:

- Creation Guide starter/project setup;
- Project Editor structure, routes and library links;
- Scene Editor scenes/screens;
- Quest Builder quests/sidequests;
- Puzzle Creator puzzles;
- Archetype Object Creator object archetypes;
- Effect Editor effect archetypes;
- Asset Library registered final assets;
- Sound Library/Generator final registered audio assets.

Build Game does not own any of those authored records.

If a record is invalid, Build Game should block or warn and point the author back to the owning module.

## Relationship to Asset Library

Build Game should package final registered assets from `assets/asset-index.json` and final files under `assets/`.

It must not package raw `intake/` source files as final game assets unless a deliberately approved build setting classifies them as non-runtime reference material.

It should report missing final files, unused assets where relevant, and final asset records that point to invalid paths.

## Relationship to Runtime Engine / Playtest

Build Game produces runtime-ready output.

Runtime Engine / Playtest consumes runtime-ready output or reads canonical project data for preview, depending on the final runtime design.

Build Game should not become the live preview engine. Runtime should not become the packaging author.

A future Playtest may run against unsaved local drafts, but Build Game should package from validated saved project files unless an explicit temporary test mode is defined.

## Relationship to Backups

Backups and build output are separate.

Backups preserve source/project state for recovery or transfer.

Build output is generated runtime/deployable data.

Build Game may record stale backup/build metadata, but it should not treat a backup ZIP as the canonical source if a connected project folder is active.

## Relationship to Template Game

The populated Template Game connected reference project should prove Build Game before production use.

The proof should include at least:

- project identity;
- Project Editor structure and start target;
- scene/screen records;
- asset records and final files;
- object/effect archetype records;
- at least one Quest;
- a saved Puzzle once Puzzle Creator canonical saving exists;
- Health validation;
- Build Game packaging into `build/` output.

The Template Game should not be exposed as a Creation Guide choice until this proof passes.

## Build Blocking Rules

Build Game should block packaging on hard failures such as:

- missing `project.json`;
- active project/folder mismatch;
- invalid required index schema;
- missing start target where runtime requires one;
- broken route graph that prevents traversal;
- missing records referenced by required runtime content;
- final asset records pointing to missing files;
- permanent authored content pointing to `intake/` paths;
- unresolved required Puzzle/Quest/Scene/Object/Effect references;
- unsaved local-only drafts that are newer than project files, where detection exists.

Build Game may allow warnings for optional or non-blocking issues, but the manifest should record them.

## Current Gaps

Known gaps include:

- no complete standalone Build Game app route is verified;
- no final `build/runtime-project.json` generation is verified;
- no final `build/build-manifest.json` generation is verified;
- Shared Health is only a foundation, not full packaging validation;
- many modules still need connected-project saving before builds can trust source files;
- registered-content and project-reference validation are not yet complete;
- Template Game connected-reference proof is not complete;
- Build output schema is not yet finalised;
- deployment/export workflow is not yet defined.

## Source Classification

`docs/artifex/1A-project-file-contracts.md` reserves the canonical `build/` output paths and distinguishes generated Health/Build/backup/task files from blank starter foundations.

`artifex/apps/project-editor/src/project-buildprep.js` is current evidence for Build Prep UI consuming Shared Health, but it is not final Build Game packaging.

`artifex/shared/health-guide/health-checks.js` and `todo-output.js` are current evidence for future Build validation foundations and task output.

`artifex/shared/todo-guide/README.md` and `all-apps-todos.json` contain current evidence that Build Game should validate project folders, references and generated resources without owning authored content.

## Required Future Work

The active backlog, not this specification, owns implementation tasks. The main known Build Game work is:

- create or confirm the Build Game app/service;
- define `build/runtime-project.json` and `build/build-manifest.json` schemas;
- consume Shared Health and run stricter final build validation;
- validate canonical indexes, record references and final assets;
- reject permanent intake references;
- detect unsaved local-only or stale source conditions where possible;
- generate runtime-ready output under `build/`;
- prove the workflow through Template Game before production use.

## Remaining Work

All current and future Build Game work belongs in `docs/artifex/2A-global-to-do.md`. This specification must not become a task list.
