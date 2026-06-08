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

- modular shell;
- browser-draft Flatplan editing;
- imported-index Asset Browser;
- selected-node linking;
- Stitcher route forms;
- Health / Build Prep presentation;
- JSON / ZIP import and backup export;
- visible Project Editor name in the current specification set.

Current Project Editor is not yet a fully connected-folder project-file writer. Connected-folder save/load remains active work in `02A`.

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
- Build Prep presentation is not final Build Game packaging.

## Source Classification

Older Project Editor / Flatplan documents and split-plan documents are source evidence. Their lasting structure/ownership rules are consolidated here. Remaining live work belongs in `02A-global-to-do.md`.

## Remaining Work

All current and future Project Editor work belongs in `docs/artifex/02A-global-to-do.md`. This specification must not become a task list.
