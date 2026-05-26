# Project File Contracts and Module Integration Rules

## Purpose

This document defines how Artifex apps should exchange project data without swallowing each other or inventing different file shapes per module.

It was created after reviewing the current Artifex module docs and live app structures for Project Editor, Creation Guide, Scene Editor, Archetype Object Creator, Effect Editor, and the module boilerplate.

The goal is to make the Project Manager / Project Editor work with the rest of Artifex through stable files, stable IDs, and clear ownership rules.

## Core Rule

Each Artifex app owns the files for its own job.

The Project Manager / Project Editor assembles and validates an existing project package. It must not create a brand-new project from nothing. New project creation belongs to the Creation Guide.

The Project Manager can open, inspect, link, route, validate, and export project structure files. It should not become the full authoring tool for scenes, quests, object archetypes, FX archetypes, or raw assets.

## Current App Audit

### Project Editor / Project Manager

Current status: mostly aligned.

The Project Editor is defined as the higher-level game-structure editor. It contains the Manifest, Flatplan, Flatplan Catalog, Stitcher/connection logic, routes, start screen assignment, map projection if needed, and structure-level Build Prep.

Confirmed ownership:

- `project.json`
- `logic.json`
- `layout.json`
- `registry.json`
- `library-links.json`
- Project-level route and structure validation

Needed changes:

- File menu must not offer ordinary New Project creation.
- File menu may offer Open Project Package, Import Project Files, Save Current Project, Export Project Package, Getting Started / Missing Setup Wizard, and Reset Local Editor Cache.
- Build Prep diagnostics should move to a shared health guide module so Creation Guide can display the same checks.
- Asset Browser should be a shared browser window, not six separate library windows.

### Creation Guide

Current status: aligned, but needs shared health/check integration.

The Creation Guide is already described as the wizard, assignment planner, milestone tracker, checklist surface, progress dashboard, and health-check module. It helps a creator start a new Artifex Adventure project from the starter template and tracks what still needs changing, confirming, building, testing, reviewing, blocking, or fixing.

Confirmed ownership:

- New project setup
- Starter project creation
- Assignment/milestone/checklist tracking
- Setup health summaries
- Guidance on which module owns the next piece of work

Needed changes:

- Creation Guide should own Create New Project.
- Creation Guide should import the shared health guide checks.
- Creation Guide should not own Flatplan graph editing or route logic.
- Creation Guide may show Project Manager health results, but should frame them as setup/milestone progress.

### Scene Editor

Current status: conceptually aligned; file output rules need standardisation.

The Scene Editor edits visual scenes and screens. It creates playable scenes, title screens, menu screens, UI layouts, ending screens, backgrounds/foregrounds, visual layers, player start position, scene objects, buttons, markers, interaction zones, layout, coordinates, and basic asset placement.

Confirmed ownership:

- Scene files
- Screen files
- Visual layout data
- Layer/object placement data
- Scene-local asset references

Needed changes:

- Exported scenes/screens must use stable IDs and index files.
- Scene Editor should output scene/screen records into the project package instead of only acting as a loose local JSON editor.
- Project Manager should consume Scene Editor outputs through `scenes/scene-index.json` and `screens/screen-index.json`.
- Scene Editor should place Object Instances that reference Object Archetypes, not just loose image paths, where possible.

### Archetype Object Creator

Current status: strongly aligned.

The Archetype Object Creator creates reusable non-FX Object Archetypes. It is separate from the Asset Library and separate from the FX Editor.

Confirmed ownership:

- Object Archetypes
- Object categories and role metadata
- Linked gameplay sprite asset IDs
- Linked dialogue portrait asset IDs
- Collision defaults
- Interaction defaults
- Runtime behaviour flags
- Placement defaults

Needed changes:

- Its exported target should become `archetypes/object-index.json` plus individual files under `archetypes/objects/`.
- Use the canonical `archobj_` ID prefix.
- Do not write directly into Scene Editor data; Scene Editor should reference object archetype IDs when placing instances.

### Effect Editor

Current status: partially aligned; schema helper is still planned.

The Effect Editor split docs identify `io/artifex-fx-schema.js` as the future helper for Export Editor Project vs Export Artifex FX Asset.

Confirmed ownership:

- FX editor projects
- FX archetype exports
- Effect presets and rendering helpers
- FX-specific metadata

Needed changes:

- Use the canonical `archeffect_` ID prefix.
- Export reusable FX archetypes into `archetypes/effect-index.json` plus individual files under `archetypes/effects/`.
- Keep editor project files separate from final reusable FX archetype files.
- Scene Editor and Project Manager should reference FX archetypes by ID, not copy full FX editor state into scene/project graph files.

### Module Boilerplate

Current status: aligned and useful as the future module standard.

The boilerplate already defines a stable structure: `index.html`, `v1/styles.css`, `v1/src/module-app.js`, `module-state.js`, `module-ui.js`, `module-renderer.js`, `module-io.js`, `module-library.js`, README, and extension notes.

Confirmed ownership:

- Future module shell rules
- Module config constants
- Local browser save/import/export pattern

Needed changes:

- New modules should include a contract section in their README declaring what files they own, read, and reference.
- New modules should not hardcode project-specific data into the app shell.
- New modules should not mix runtime data with Asset Library or Scene Editor data.

### Quest Builder

Current status: conceptually documented but no active app found in the current app scan.

The module architecture and Project Editor docs define Quest Builder as the owner of quests, side quests, branches, flags, conditions, rewards, unlocks, and progression logic.

Confirmed ownership once implemented:

- Quest library
- Side quest library
- Branch definitions
- Flags and conditions
- Rewards/unlocks
- Progression logic

Needed changes:

- Create a real Quest Builder app or module folder when ready.
- Export `quests/quest-index.json` and `sidequests/sidequest-index.json`.
- Project Manager should reference quest/side quest IDs, not author quest internals directly.

### Puzzle Library / Puzzle Builder

Current status: planned from project conversations, but no active app contract found in the current scan.

Needed changes:

- Define Puzzle Builder or Puzzle Library as a real module.
- Export `puzzles/puzzle-index.json` and individual puzzle files under `puzzles/`.
- Use canonical `puzzle_` IDs.
- Project Manager should reference puzzles as route gates, node requirements, scene overlays, or side activity links.

## Project Package Folder Structure

Use separate files. Do not collapse the whole project into one large JSON blob.

Recommended package structure:

```text
projects/<project-id>/
  project.json
  logic.json
  layout.json
  registry.json
  library-links.json
  health-report.json

  scenes/
    scene-index.json
    scene_<slug>.json

  screens/
    screen-index.json
    screen_<slug>.json

  quests/
    quest-index.json
    quest_<slug>.json

  sidequests/
    sidequest-index.json
    sidequest_<slug>.json

  puzzles/
    puzzle-index.json
    puzzle_<slug>.json

  archetypes/
    object-index.json
    effect-index.json
    objects/
      archobj_<slug>.json
    effects/
      archeffect_<slug>.json

  assets/
    asset-index.json
    groups/
      assetgroup_<slug>.json

  health/
    latest-health-report.json
```

## Required Top-Level Files

### `project.json`

Owned by Creation Guide at creation time, then editable/inspectable by Project Manager.

Required fields:

```json
{
  "schemaVersion": "artifex.project.v1",
  "projectId": "project_forever_bound",
  "gameTitle": "Forever Bound",
  "creator": "Cinaedus Studios",
  "version": "0.1.0",
  "createdBy": "creation-guide",
  "startScreenId": "screen_title_main",
  "enabledModules": [],
  "fileRefs": {}
}
```

### `logic.json`

Owned by Project Manager.

Contains graph nodes, routes, route types, locks, conditions, linked scene/screen/quest/puzzle IDs, and project-level structure logic.

### `layout.json`

Owned by Project Manager.

Contains editor-only Flatplan layout state: node positions, camera pan/zoom, collapsed states, route visual styling, and editor annotations.

Runtime should not require this file to play the game unless a future map projection intentionally uses it.

### `registry.json`

Owned by Project Manager, with references from other modules.

Contains the active project registry of modules, available libraries, and loaded indexes.

### `library-links.json`

Owned by Project Manager.

Contains normalized links from project graph nodes/routes to scenes, screens, quests, side quests, puzzles, object archetypes, effect archetypes, and assets.

### `health-report.json`

Generated by the shared Health Guide.

May be displayed by Creation Guide, Project Manager Build Prep, or Build Game validation.

## Canonical ID Prefixes

Use these prefixes across all modules:

```text
project_       Project package ID
scene_         Playable scene
screen_        UI/title/menu/ending screen
node_          Project Manager Flatplan node
route_         Project Manager route/connection
quest_         Quest Builder quest
sidequest_     Quest Builder side quest
branch_        Quest/route branch
flag_          Progression flag
condition_     Condition expression/rule
puzzle_        Puzzle definition
archobj_       Archetype Object Creator object archetype
objinst_       Scene instance of an object archetype
archeffect_    Effect Editor reusable effect archetype
fxinst_        Scene instance of an effect archetype
asset_         Raw asset record
assetgroup_    Asset group or sprite/animation group
template_      Template package or starter structure
health_        Health check/report item
assignment_    Creation Guide work assignment
milestone_     Creation Guide milestone
```

## Library Menu Names

Project Manager Libraries menu must use these labels:

```text
Quest Library
Side Quest Library
Scenes/Screens Library
Puzzle Library
Archetype Object Library
Archetype Effect Library
Asset Browser
```

## Asset Browser Contract

The Asset Browser should be one shared browser window, not separate duplicated browser UIs for every library.

Required layout:

- left vertical icon rail for library type
- shared search field
- common filters
- right-side results area
- optional preview/details panel

Required browser modes:

```text
quests
sidequests
scenes-screens
puzzles
archetype-objects
archetype-effects
assets
```

Every result should expose:

```json
{
  "id": "scene_forest_path",
  "type": "scene",
  "name": "Forest Path",
  "sourceModule": "scene-editor",
  "file": "scenes/scene_forest_path.json",
  "tags": [],
  "status": "ready"
}
```

## Health Guide Contract

Create shared health-check code under:

```text
artifex/shared/health-guide/
```

Shared health checks should be importable by:

- Creation Guide
- Project Manager / Build Prep
- Build Game

Creation Guide should display setup/milestone health.

Project Manager should display structure and Flatplan health.

Build Game should display final package/export health.

## Module Ownership Matrix

| Module | Owns | Reads | Must not own |
|---|---|---|---|
| Creation Guide | new project creation, assignments, milestones, setup health | shared health reports, project package summary | Flatplan graph internals |
| Project Manager | project manifest inspection, Flatplan, routes, library links, structure validation | all module index files | scene art, quest internals, object/FX archetype authoring |
| Scene Editor | scenes, screens, visual layout, object/effect instances | asset index, object archetype index, effect archetype index | Project graph/routes |
| Quest Builder | quests, side quests, branches, flags, conditions, rewards | scene/screen IDs, puzzle IDs, object IDs | visual scene layout |
| Puzzle Builder / Library | puzzle definitions and puzzle index | scene IDs, asset IDs, object IDs | project route graph |
| Archetype Object Creator | reusable non-FX object archetypes | asset IDs | scene instances, FX archetypes |
| Effect Editor | reusable FX archetypes and FX editor projects | asset IDs | object archetypes, scene placement |
| Asset Library | raw asset metadata and asset groups | file paths | gameplay behaviour |
| Build Game | final validation and package/export assembly | all project files | authoring/editing module content |

## Rules For Existing Apps To Adopt

1. Every active app README must include an ownership section: owns, reads, writes/exports, must not own.
2. Every app that exports data must export stable IDs using the canonical prefixes in this doc.
3. Every app must keep editor project state separate from reusable library output.
4. Project Manager must link to module outputs through indexes and IDs.
5. Project Manager must not duplicate large module-owned records unless generating a build snapshot.
6. Creation Guide owns initial project creation and setup wizard flow.
7. Project Manager Getting Started / Missing Setup Wizard inspects the current project package and reports missing files/links.
8. Health checks must move toward the shared `artifex/shared/health-guide/` source.
9. The exported project must stay split into individual files so AI or a human can edit broken files directly.
10. Any new app made from module boilerplate must follow this contract before being linked from the hub.

## Current Conformance Summary

Mostly fine:

- Module boundaries in `docs/artifex/02-module-architecture.md` already match the intended split.
- Creation Guide already owns project setup and production health conceptually.
- Scene Editor already owns scene/screen visual editing.
- Archetype Object Creator already correctly distinguishes raw assets, object archetypes, FX archetypes, and scene instances.
- Module Boilerplate already provides a sensible app structure.

Needs updates:

- Project Manager File menu must remove/disable true New Project creation.
- Project Manager Libraries menu must use the canonical library labels.
- Project Manager Asset Browser shell should use this doc's browser modes.
- Project Manager Build Prep and Creation Guide health should share `artifex/shared/health-guide/`.
- Effect Editor still needs its Artifex FX schema/export helper completed.
- Quest Builder and Puzzle Builder/Library need real app contracts when implemented.
- App READMEs should be updated gradually to include ownership/contract sections.
