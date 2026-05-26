# Creation Guide

## Purpose

The Creation Guide is the Artifex project onboarding screen, project overview, assignment planner, production dashboard, checklist, milestone tracker, and health-check system.

It helps the creator start or open an Artifex project, define the minimum required project structure, create the primary project index files, set the active project for the whole Artifex hub, and then track the work needed to build the game.

The Creation Guide should feel like mission control. It tells the creator what project is active, what still needs to be defined, which setup gates are blocking production, what assignments exist, which Artifex tool owns each piece of work, and whether the project is healthy enough to keep building.

## Naming Decision

Use **Creation Guide** for the project onboarding, overview, assignment, dashboard, milestone, checklist, and health-check module.

Do not use **Project Manager** as a main module name going forward.

Use **Project Editor** for the structural game editor that owns the Manifest, Flatplan, Flatplan Catalog, Stitcher, Routes, and Map Projection.

The Creation Guide can show project status and project setup, but it should not become the full Project Editor.

## Top-Level Architecture

The Artifex workflow should be:

```text
Artifex Hub
  Change / select active project
  Display active project name
  Open Artifex apps into the active project

Creation Guide
  Create/open project
  Show Project Overview
  Create required project files
  Register project in Project Library
  Set active project
  Track assignments, milestones, readiness, and health

Project Editor
  Edit Manifest, Flatplan, Routes, Map Projection, Stitcher, and structural files

Scene Editor / Quest Builder / Object Creator / Effect Editor
  Edit content inside the active project
```

The Hub should eventually replace its centre button with **Change Project**.

The Hub should display the currently selected project name somewhere visible on the hub screen.

Every app opened from the Hub should read the shared active project and automatically open against that project. If no active project is set, the app should ask the creator to select or create one in Creation Guide.

## Shared Project Library

Creation Guide owns the project library and active project selection.

Suggested browser storage keys:

```text
artifex.projectLibrary
artifex.activeProjectId
```

`artifex.projectLibrary` stores known projects.

`artifex.activeProjectId` stores the ID of the currently selected project.

All Artifex apps should read `artifex.activeProjectId` during boot.

A project library entry should contain:

```json
{
  "projectId": "forever-bound",
  "projectName": "Forever Bound",
  "status": "setup",
  "version": "0.1.0",
  "createdAt": "",
  "updatedAt": "",
  "lastOpenedAt": "",
  "localProjectPath": "",
  "onlineProjectPath": "",
  "deployedUrl": "",
  "primaryIndexFile": "artifex-project.json",
  "manifestFile": "manifest.json",
  "flatplanFile": "flatplan.json",
  "assetRoot": "assets/",
  "dataRoot": "data/",
  "exportRoot": "exports/",
  "buildRoot": "builds/",
  "activeChronicleId": "ch00",
  "activeQuestId": "q00",
  "enabledModules": []
}
```

Browser storage cannot silently write files to the local filesystem. In early versions, Creation Guide can create/export the project JSON files for the user to save into the right folder. Later versions may add File System Access API support where browser support allows it.

## Startup Screen: Project Overview

When the user clicks **New Project**, **Open Project**, or opens Creation Guide without an active project, the right viewing panel should start on **Project Overview**.

The left side panel should start collapsed or mostly collapsed. The creator should not be forced into assignment editing before a project exists.

The Project Overview screen should show:

- project name
- project status
- overall setup percentage ring/spinner
- active project ID / slug
- local project path
- online project path or repository path
- deployed URL if available
- primary index file path
- manifest file path
- flatplan file path
- active Chronicle / Quest target
- enabled modules
- readiness warnings
- setup gate buttons

The assignment board is not the starting screen. Assignments are opened from a popup/window after the project overview exists.

## Initial Setup Gates

Before the creator can properly make scenes, characters, quests, objects, or effects, the project needs a minimum structure.

Creation Guide should show these as large setup gate buttons/cards on Project Overview.

### 1. Define Project Identity

Required fields:

- project name
- project ID / slug
- creator or studio name
- version
- short description
- template used
- default language

### 2. Choose Project Storage

Required fields:

- local project path
- online project path or repository path
- deployed URL if available
- export path
- whether the project is local-only, repo-backed, or deployed

### 3. Create Primary Project Index

Creates the top-level file that all tools can discover.

Default filename:

```text
artifex-project.json
```

This file points to all other important project files and root folders.

### 4. Create Folder Structure

Creates or exports the recommended folder hierarchy for project data, assets, exports, builds, and docs.

### 5. Create Manifest Shell

Creates the first manifest file.

Default filename:

```text
manifest.json
```

The manifest defines enabled modules, runtime settings, asset roots, scene roots, quest roots, object roots, effect roots, and build settings.

### 6. Create Flatplan Shell

Creates the first structural flatplan file.

Default filename:

```text
flatplan.json
```

The flatplan shell should include at minimum:

- title screen placeholder
- start screen placeholder
- first playable node placeholder
- one endpoint placeholder
- empty route list

### 7. Create Index Files

Creates registry/index files for the project so tools can find the project content without scanning everything blindly.

Suggested starter indexes:

```text
data/indexes/scene-index.json
data/indexes/quest-index.json
data/indexes/object-index.json
data/indexes/effect-index.json
data/indexes/asset-index.json
data/indexes/assignment-index.json
```

### 8. Choose Enabled Modules

Defines which Artifex apps are active for this project.

Typical modules:

- Creation Guide
- Project Editor
- Scene Editor
- Quest Builder
- Object Creator
- Effect Editor
- Asset Library
- Object Library
- Build Game

### 9. Set Active Project

Writes the project into `artifex.projectLibrary` and sets `artifex.activeProjectId`.

After this step, all other Artifex apps should open against this project automatically.

### 10. Run Project Readiness Check

Confirms the project has enough structure to start creating content.

The project is not considered **Ready for Production** until this passes.

## Recommended Project File Hierarchy

The preferred project hierarchy is:

```text
project-root/
  artifex-project.json
  manifest.json
  flatplan.json
  README.md

  data/
    indexes/
      scene-index.json
      quest-index.json
      object-index.json
      effect-index.json
      asset-index.json
      assignment-index.json

    chronicles/
      ch00/
        chronicle.json

    quests/
      ch00/
        q00/
          quest.json
          callings.json
          objectives.json
          conditions.json

    scenes/
      ch00/
        q00/
          scene-title.json
          scene-start.json

    maps/
      map-index.json
      routes.json
      nodes.json

    objects/
      object-index.json
      archetypes/
      instances/

    effects/
      effect-index.json
      presets/
      instances/

    dialogue/
      dialogue-index.json
      ch00/

    assignments/
      assignment-index.json
      creation-guide.json

  assets/
    images/
      backgrounds/
      characters/
      props/
      ui/

    sprites/
      characters/
      objects/
      fx/

    audio/
      music/
      sfx/
      voice/

    fonts/
    video/

  exports/
    json/
    images/
    builds/

  builds/
    web/
    android/
    archive/

  docs/
    design/
    notes/
    changelog/

  tests/
    playtest-notes/
    validation-reports/
```

This hierarchy is the recommended default, not a hard requirement for every project. The important rule is that `artifex-project.json` and `manifest.json` must clearly tell every Artifex app where the relevant folders and index files live.

## Primary Project Index

`artifex-project.json` is the top-level project pointer file.

Suggested shape:

```json
{
  "projectId": "forever-bound",
  "projectName": "Forever Bound",
  "projectKind": "artifex-adventure",
  "schemaVersion": "1.0.0",
  "status": "setup",
  "paths": {
    "manifest": "manifest.json",
    "flatplan": "flatplan.json",
    "dataRoot": "data/",
    "assetRoot": "assets/",
    "exportRoot": "exports/",
    "buildRoot": "builds/",
    "indexes": "data/indexes/"
  },
  "indexes": {
    "scenes": "data/indexes/scene-index.json",
    "quests": "data/indexes/quest-index.json",
    "objects": "data/indexes/object-index.json",
    "effects": "data/indexes/effect-index.json",
    "assets": "data/indexes/asset-index.json",
    "assignments": "data/indexes/assignment-index.json"
  },
  "activeTargets": {
    "chronicleId": "ch00",
    "questId": "q00",
    "startSceneId": "scene-start"
  }
}
```

## Manifest Shell

`manifest.json` is owned by Project Editor, but Creation Guide should create the starter shell.

Suggested starter shape:

```json
{
  "projectId": "forever-bound",
  "projectName": "Forever Bound",
  "runtime": {
    "aspectRatio": "16:9",
    "defaultResolution": [1280, 720],
    "startScreenId": "scene-title"
  },
  "enabledModules": [
    "creation-guide",
    "project-editor",
    "scene-editor",
    "quest-builder",
    "object-creator",
    "effect-editor"
  ],
  "roots": {
    "scenes": "data/scenes/",
    "quests": "data/quests/",
    "objects": "data/objects/",
    "effects": "data/effects/",
    "dialogue": "data/dialogue/",
    "assets": "assets/"
  }
}
```

## Flatplan Shell

`flatplan.json` is owned by Project Editor, but Creation Guide should create the starter shell.

Suggested starter shape:

```json
{
  "projectId": "forever-bound",
  "flatplanId": "flatplan-main",
  "nodes": [
    {
      "id": "scene-title",
      "type": "title-screen",
      "label": "Title Screen"
    },
    {
      "id": "scene-start",
      "type": "scene",
      "label": "Start Scene"
    },
    {
      "id": "endpoint-demo",
      "type": "endpoint",
      "label": "Demo Endpoint"
    }
  ],
  "routes": [
    {
      "from": "scene-title",
      "to": "scene-start"
    },
    {
      "from": "scene-start",
      "to": "endpoint-demo"
    }
  ]
}
```

## Creation Guide Layout

The Creation Guide app should use a simple two-panel layout.

```text
Top bar
  Brand
  Centered quick icons
    📋 Assignments
    selected assignment detail
    snapshot / utility buttons
  Centered menu bar

Main area
  Left side panel
    collapsed by default on new/open project
    setup sections
    selected assignment inspector
    subtasks

  Right viewing panel
    starts on Project Overview
    shows setup percentage ring/spinner
    shows setup gates
    later shows dashboard / zone / scene / milestone views

Popup windows
  Assignments board/list
  Assignment detail
  Project Library / Change Project
  Local saves / import / export
```

The assignment list should not permanently occupy the bottom of the screen. It should open as a popup/window from the 📋 icon or from the menu.

## Core Object: Assignment

After a project exists, the main production object inside the Creation Guide is an **Assignment**.

An Assignment is a concrete unit of production work that can be owned, started, blocked, reviewed, completed, or archived.

Examples:

- create first forest scene
- define Calling completion condition
- build first Stone Marker route
- add Capra wrong-object feedback
- prepare Mel throw animation
- create Bellator placeholder
- test Quest 0.5 Songspell cooldown
- replace placeholder title screen art

Assignments are smaller than milestones but larger than individual checklist ticks.

A good Assignment should be specific enough that the creator knows what to do, but large enough to contain several subtasks.

## Milestones

Milestones are still used, but they are no longer the smallest task unit.

A Milestone is a production goal or container that groups Assignments together.

Examples:

- Project Setup
- First Playable
- Chronicle 0 Prototype
- Quest 0.5 Expanded Tutorial
- First Scene Complete
- First Quest Complete
- First Route Complete
- First Playtest
- Build Game

A Milestone reaches 100% when its required Assignments are complete, skipped as not-needed, or deliberately confirmed by the creator.

## Assignment Workflow States

Assignments use production workflow states.

These states are separate from module colour and completion percentage.

```text
unassigned - Cards without an owner.
assigned - Cards with an owner but not yet started.
started - Cards currently being worked on.
snoozing - Cards that went quiet for too long.
blocked - Cards waiting on something.
review - Cards ready for feedback.
done - Completed cards.
archived - Archived cards.
undone - Filter only; shows all cards not marked as done.
```

Important rule:

**undone** is not stored as a workflow state. It is a useful dashboard filter.

## Priority and Effort

Every Assignment should have Priority and Effort values.

Both use a 1-5 scale.

Priority means how important the Assignment is.

Effort means how much work the Assignment is expected to take.

Each Assignment should store default and manual values:

```text
priorityDefault
priorityOverride
effortDefault
effortOverride
```

The default values are generated by the Assignment type, owning module, milestone, or template.

The override values are manually set by the creator when the default is wrong.

The dashboard should use the effective values:

```text
effectivePriority = priorityOverride if present, otherwise priorityDefault
effectiveEffort = effortOverride if present, otherwise effortDefault
```

## Module Accent Colour System

Assignments are colour-coded by the Artifex module that owns the work.

This colour system must match the accent colours used inside the Artifex apps.

```text
Effect Editor - cyan
Scene Editor - violet
Project Editor - yellow
Quest Builder - green
Object Creator - red
Unassigned / General - grey-brown
```

The module colour means **which tool owns the Assignment**.

It does not mean workflow state.

Workflow state must be shown separately through column placement, state chip, icon, or label.

Clean rule:

```text
Module colour = what tool owns the work.
Workflow state = where the work is in production.
Priority = how important it is.
Effort = how much work it is.
Completion = how much of the Assignment/subtasks are done.
```

## Assignment Detail Popup

Clicking an Assignment opens a detail popup.

The popup should use the Assignment’s primary module accent colour in the header, border, action buttons, and progress bar.

The popup should contain:

- title
- icon
- description
- owning module
- related modules
- workflow state
- owner
- priority default
- priority override
- effort default
- effort override
- milestone
- Chronicle
- Quest
- Calling
- zone
- scene
- screen
- linked JSON file
- linked assets
- subtasks
- blockers
- notes
- created date
- updated date
- last touched date
- open in relevant Artifex module buttons

## Dashboard Views

The Creation Guide dashboard should answer:

```text
What project is active?
Is the project ready to build content?
What should I do next?
What is blocked?
What is almost complete?
What has gone quiet?
Which tool do I need to open?
```

The To Do area should be orderable by:

- easy wins
- most important
- not touched recently
- milestones almost complete
- blocked
- needs assignment
- high priority / low effort
- by zone
- by scene
- by module
- by Chronicle
- by Quest

## Project Health Check

Project Health Check is the validation part of the Creation Guide.

It should check for:

- no active project selected
- project missing from Project Library
- missing primary project index
- missing manifest
- missing flatplan
- missing index files
- missing required roots
- broken routes
- duplicate IDs
- unconnected Stations/Nodes
- invalid quests
- missing start screen
- broken asset references
- invalid quest conditions
- required template defaults that have not been changed or confirmed
- Assignments that are blocked too long
- Assignments that have gone snoozing
- Milestones that are almost complete but missing one required Assignment
- high-priority Assignments without an owner
- done Assignments with incomplete required subtasks

## Suggested Creation Guide Data Model

The module exports one Creation Guide document linked to a project:

```json
{
  "id": "creation_xxxxx",
  "projectId": "forever-bound",
  "name": "Artifex Adventure Creation Guide",
  "moduleKind": "creation-guide",
  "version": "V1.0",
  "setup": {},
  "projectLibraryEntry": {},
  "setupGates": [],
  "assignments": [],
  "milestones": [],
  "notes": "",
  "projectTree": []
}
```

Suggested Assignment object:

```json
{
  "id": "assignment_xxxxx",
  "title": "Create First Forest Scene",
  "icon": "scene",
  "description": "Build the first playable forest scene shell.",
  "state": "started",
  "owner": "Chris",
  "primaryModule": "scene-editor",
  "relatedModules": ["project-editor", "quest-builder"],
  "moduleAccent": "violet",
  "priorityDefault": 4,
  "priorityOverride": null,
  "effortDefault": 3,
  "effortOverride": null,
  "milestoneId": "milestone_first_playable",
  "chronicleId": "ch00",
  "questId": "q00",
  "callingId": "calling_first_route",
  "zoneId": "forest",
  "sceneId": "ch00_q00_forest_route",
  "screenId": "scene_forest_route",
  "linkedFile": "data/scenes/ch00/ch00_q00_forest_route_scene.json",
  "linkedAssets": [],
  "tags": ["scene", "travel", "prototype"],
  "subtasks": [],
  "blockers": [],
  "createdAt": "",
  "updatedAt": "",
  "lastTouchedAt": "",
  "archived": false
}
```

## Relationship To Other Modules

The Creation Guide does not replace the Scene Editor, Project Editor, Quest Builder, Object Creator, Object Library, Asset Library, or Effect Editor.

It creates/selects the active project, creates the starter file structure, points the creator to the correct tool, and reports whether required setup work is complete.

Intended workflow:

1. Open Artifex Hub.
2. Click Change Project.
3. Create a new project or select an existing project from Project Library.
4. Creation Guide opens Project Overview.
5. Complete the setup gates.
6. Creation Guide creates/exports the primary project files.
7. Creation Guide registers the project in `artifex.projectLibrary`.
8. Creation Guide sets `artifex.activeProjectId`.
9. Return to Hub.
10. Open Scene Editor, Project Editor, Quest Builder, Object Creator, or Effect Editor.
11. The app reads the active project and opens inside that project.
12. Work is tracked as Assignments in Creation Guide.
13. Run Project Health Check.
14. Test in the game.

## First Version Rule

The first reliable project version should prove that one Creation Guide document can create/select one project, display Project Overview, track setup gates, set an active project, and track Assignments.

It does not need to silently write files to GitHub or the local filesystem yet.

The first reliable implementation should focus on Project Overview, Project Library, active project selection, setup gates, exportable project files, Assignments, workflow states, subtasks, priority, effort, module colours, and dashboard filtering.
