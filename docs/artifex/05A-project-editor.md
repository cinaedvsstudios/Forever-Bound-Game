# Project Editor Specification

Status: Active module specification during documentation consolidation  
Owning module: Project Editor  
Active route: `artifex/apps/project-editor/index.html`  
Current verified implementation baseline: `Artifex Project Editor v0.1.32 CONTRACT - Flatplan`  
Governing universal contract: `docs/artifex/01A-project-file-contracts.md`  
Subordinate schema reference: `docs/artifex/19A-project-starter-schemas.md`  
Outstanding work source: `docs/artifex/02A-global-to-do.md`

## Purpose

Project Editor is the high-level structural editor for an Artifex project.

It owns project structure, Flatplan presentation, high-level route/station relationships, project-level structural files, route forms, imported index browsing for reference, and build/readiness presentation where it consumes shared Health.

Project Editor is the official name. Older **Project Manager** wording is legacy terminology and should be handled as compatibility/migration only.

## Ownership Boundary

Project Editor owns:

- project structure and Flatplan authoring;
- high-level project route and station/node relationships;
- structural project files such as `project.json`, `logic.json`, `layout.json`, `registry.json`, `library-links.json` and `input-map.json` where those files are project-structure records;
- route/stitcher forms and route metadata;
- high-level linking between screens, scenes, quests and project routes;
- imported-index browsing for reference display;
- Build Prep / Health presentation as a consumer of Shared Health results.

Project Editor must not:

- author scenes or screens visually;
- author Quest internals, Puzzle internals, Object Archetype internals, Effect Archetype internals or final Asset Library records;
- promote assets from intake;
- package the runtime build itself;
- silently repair module-owned files;
- treat browser drafts or ZIP exports as permanent project truth once connected-folder saving exists.

## Active Baseline

The current verified baseline is:

```text
artifex/apps/project-editor/index.html
Artifex Project Editor v0.1.32 CONTRACT - Flatplan
```

The current implementation includes:

- thin loader shell and focused module files rather than a giant monolithic `index.html`;
- browser-draft Flatplan editing;
- imported-index Asset Browser;
- selected-node linking;
- Stitcher route forms;
- Project Tasks / To-Do Board workspace;
- Health / Build Prep presentation;
- JSON / ZIP import and backup export;
- visible Project Editor name in the current specification set.

Current Project Editor is not yet a fully connected-folder project-file writer. Connected-folder save/load remains active work in `02A`.


### Current split/module structure

The Project Editor real-split pass is treated as implemented source evidence, not as an active plan to repeat. The current architecture is a thin `index.html` shell that loads focused modules. The editor must not be reverted to a giant monolithic page, wrapped in an iframe, or replaced with scaffold files that are not wired into the live editor.

The current split evidence includes focused owners for:

```text
src/project-shell.js
src/project-app.v7.js
src/project-state.js
src/project-canvas.js
src/project-renderer.js
src/project-ui.js
src/project-ui-helpers.js
src/project-sidebar-ui.js
src/project-inspector-ui.js
src/project-json-preview-ui.js
src/project-menu-ui.js
src/project-asset-linking.js
src/project-integration-ui.js
src/project-node-links-ui.js
src/project-health-ui.js
src/project-io.js
src/project-buildprep.js
src/project-tasks-ui.js
src/project-stitcher.js
src/project-route-types.js
src/project-library-indexes.js
```

New Project Editor work should extend these focused owners or create a clear new focused owner. It should not add another broad wrapper/enhancer layer merely to patch behaviour.

### Project Tasks / To-Do Board workspace

The Project Tasks / To-Do Board workspace is an implemented Project Editor workspace, not a missing future feature. It is owned by `src/project-tasks-ui.js`, with shell/workspace integration through `project-shell.js` and `project-ui.js`.

It may read saved `stateManager.state.projectTodos` or generated tasks from Shared Health / todo-output modules. It displays generated date, title, description, status, priority, effort, fix owner, related modules, source, task ID and tags, with status/owner/priority filters and selected-task detail.

Future task-board work should remain module-owned and should not create a second global human backlog that competes with `02A-global-to-do.md`.

### Project Editor branding

Project Editor uses a gold / amber module accent for active states, selected borders, helper glows, workspace identity and primary module UI. Soft green may be used for valid/online/coherent status. Bronze, copper and parchment remain the Artifex base frame.

The detailed cross-app palette and display rules live in `docs/artifex/23A-colour-display-rules.md`.

## Current Implemented Areas

### Flatplan / structure editing

Project Editor supports the high-level map/Flatplan view and node/route relationship editing. It is the place where the creator sees the whole project structure, not the place where they visually compose a scene or write Quest internals.

### Imported-index browser

Project Editor can browse imported/indexed references for other content areas. That does not transfer ownership of those records into Project Editor. It may inspect or link, but the owning module still edits the record.

### Stitcher / route forms

Project Editor owns project route forms and route metadata where those relate to project flow. Runtime playtest from routes is not yet complete and should wait for the Runtime / Playtest specification to be implemented.

### Build Prep / Health presentation

Project Editor currently presents Build Prep and Shared Health Guide information. It consumes shared Health output; it is not the full Build Game implementation.

## Canonical Future Project Files

Project Editor should eventually read and write its owned connected-project files directly through the Shared Connected Project Folder Service.

The relevant project-level files include:

```text
project.json
logic.json
layout.json
registry.json
library-links.json
input-map.json
```

Exact schema details belong to the project-file contract and schema reference, not this specification.

## Relationships

### Creation Guide

Creation Guide creates the blank starter project and initial connected-folder setup. Project Editor takes over high-level structure editing once the project exists.

### Scene Editor

Scene Editor owns visual scene/screen authoring. Project Editor may link to scenes/screens, but it must not edit their visual contents.

### Quest Builder

Quest Builder owns Quest and Side Quest logic. Project Editor may link routes or structural nodes to Quest outcomes, but it must not duplicate Quest internals.

### Puzzle Creator

Puzzle Creator owns self-contained puzzle rules. Project Editor may consume public puzzle/Quest outcomes only after saved puzzle records and Quest links exist.

### Asset Library

Asset Library owns final `asset_` records. Project Editor may display or link assets, but it does not promote or own them.

### Shared Health and Build Game

Shared Health reports project readiness and fix owners. Build Game packages validated output. Project Editor may surface these states but must not become the Build Game owner.

## Current Gaps

Known gaps include:

- connected-folder load and direct save are not complete;
- browser draft and ZIP export still exist as recovery/fallback;
- older Project Manager naming remains in some code/output and needs compatible migration;
- Effect Editor menu destination should point to the protected current route;
- live connected-reference/gate validation is incomplete;
- route playtest is placeholder until Runtime / Playtest exists;
- Build Prep presentation is not final Build Game packaging;
- remaining Manifest/workspace/toolbar logic may be split later only if the focused UI modules grow again;
- `project-integration-ui.js` may be split later if Asset Browser display, preview or search logic grows;
- `project-app.v7.js` may be renamed to `project-app.js` later once entry-file naming is stable;
- node-specific task mirroring into the selected-node inspector is optional future work.

## Source Classification

Older Project Editor / Flatplan documents and split-plan documents are source evidence. Their lasting structure/ownership rules are consolidated here. `project-editor-real-split-plan.md` is now historical because the real split requirement is represented by the implemented split/module contract above. `project-manager-split-audit.md` is historical evidence for the focused module structure and Project Tasks workspace; remaining follow-up work belongs in `02A-global-to-do.md`.

## Remaining Work

All current and future Project Editor work belongs in `docs/artifex/02A-global-to-do.md`. This specification must not become a task list.
