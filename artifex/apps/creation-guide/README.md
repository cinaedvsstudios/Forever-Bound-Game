# Artifex Creation Guide V1

## Purpose

The Creation Guide is the Artifex project onboarding screen, Project Overview, assignment planner, milestone tracker, checklist surface, progress dashboard, and health-check module.

It helps a creator create or open an Artifex project, define the minimum required project structure, create/export the starter project files, register the project in the Project Library, set the active project for the whole Artifex hub, and then track production work.

The Creation Guide should function as production mission control. It does not replace the individual Artifex tools. It tells the creator what project is active, what needs to be done next, which setup gates are blocking production, and which tool owns each assignment.

## App Startup Behaviour

When the user clicks New Project, Open Project, or opens Creation Guide with no active project, the right viewing panel should start on **Project Overview**.

The left side panel should start collapsed or mostly collapsed.

The Assignment Board should not be permanently visible on the main screen. It should open as a popup/window from the 📋 Assignments icon or menu.

## Hub / Active Project Flow

The Hub should eventually use its centre button as **Change Project**.

The active project name should display somewhere on the Hub.

All Artifex apps should read the same active project value when they start.

Suggested shared browser storage keys:

```text
artifex.projectLibrary
artifex.activeProjectId
```

`artifex.projectLibrary` stores known projects.

`artifex.activeProjectId` stores the currently selected project ID.

Scene Editor, Project Editor, Quest Builder, Object Creator, Effect Editor, Object Library, and Asset Library should all open into the active project automatically.

## Project Overview Fields

The Project Overview should show:

- project name
- project status
- overall setup percentage spinner/ring
- project ID / slug
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

## Setup Gates

Before the creator can properly make scenes, characters, quests, objects, or effects, the project needs a minimum structure.

The Project Overview should show these as large setup gate buttons/cards:

1. Define Project Identity.
2. Choose Project Storage.
3. Create Primary Project Index.
4. Create Folder Structure.
5. Create Manifest Shell.
6. Create Flatplan Shell.
7. Create Index Files.
8. Choose Enabled Modules.
9. Set Active Project.
10. Run Project Readiness Check.

## Recommended Project File Hierarchy

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

## Primary Project Index

The top-level project pointer file should be named:

```text
artifex-project.json
```

Suggested starter shape:

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

## Core Object: Assignment

After a project exists, the main production object is an Assignment.

An Assignment is a concrete unit of work such as:

- create first forest scene
- define Calling completion condition
- add Capra wrong-object feedback
- prepare Mel throw animation
- build Bellator placeholder
- test Quest 0.5 Songspell cooldown

Assignments contain subtasks, workflow state, priority, effort, linked files, owning module, related module badges, and progress.

Milestones are containers for Assignments. Subtasks are checklist items inside Assignments.

## Assignment Workflow States

Assignments use these workflow states:

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

`undone` is not stored as a real state. It is a dashboard filter.

## Priority and Effort

Assignments use two 1-5 values:

```text
Priority = how important the Assignment is.
Effort = how much work the Assignment is expected to take.
```

Each value has a generated default and a manual override:

```text
priorityDefault
priorityOverride
effortDefault
effortOverride
```

The dashboard uses the override when present and otherwise uses the default.

This supports smart sorting while still allowing manual correction.

## Module Accent Colour System

Assignment cards are colour-coded by the Artifex module that owns the work.

```text
Effect Editor - cyan
Scene Editor - violet
Project Editor - yellow
Quest Builder - green
Object Creator - red
Unassigned / General - grey-brown
```

Module colour means which tool owns the work.

Workflow state is shown separately by column, chip, icon, or label.

Clean rule:

```text
Module colour = what tool owns the work.
Workflow state = where the work is in production.
Priority = how important it is.
Effort = how much work it is.
Completion = how much of the Assignment/subtasks are done.
```

## Assignment Cards

Assignment cards should show:

- icon
- title
- owning module colour stripe
- owning module badge
- workflow state
- owner
- milestone
- Chronicle / Quest / Calling if relevant
- zone / scene / screen if relevant
- priority
- effort
- tags
- subtask progress
- last touched date
- blocked or snoozing indicator when relevant

## Assignment Detail Popup

Clicking an Assignment opens a detail popup.

The popup uses the Assignment primary module accent colour in the header, border, action buttons, and progress bar.

## Dashboard Views

The dashboard should answer:

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

## V1 Scope

This first version is intentionally practical and small. It adapts the Artifex Blank Module Boilerplate into a real Creation Guide module with:

- Project Overview startup screen
- project setup fields
- Project Library entry model
- active project selection model
- setup gates
- exportable primary project files
- enabled module selection
- assignment popup/window
- editable assignments
- editable milestones
- editable subtasks
- workflow states
- priority and effort values
- module colour coding
- milestone completion percentage
- overall completion percentage
- project health check warnings
- JSON import/export
- browser local saves
- links out to the Artifex Portal and Scene Editor

## What It Does Not Do Yet

V1 does not silently write to GitHub, create real project folders without user action, edit Flatplans directly, open JSON files directly, or validate every live asset path from the repository.

Those features belong to later versions after the core workflow is proven.

## Relationship To Other Modules

Creation Guide creates/selects the active project and points the creator to the correct tool. It does not replace them.

- Project Editor owns the Manifest, Flatplan, routes, catalog, Stitcher, and map projection.
- Scene Editor builds scene JSON and visual layout.
- Quest Builder handles Chronicle, Quest, Calling, objective, and completion-condition structure.
- Object Creator builds archetype objects, NPCs, props, pickups, doors, caches, Foes, interactables, vendors, and job objects.
- Effect Editor builds FX, particles, overlays, glow, weather, transitions, damage flashes, and magic effects.
- Object Library and Asset Library provide reusable runtime objects and files.

## Data Model

The module exports one Creation Guide JSON document linked to a project:

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

## First Version Rule

This module should first prove one working guide document before it becomes a full project creation system.

The first reliable version should focus on Project Overview, Project Library, active project selection, setup gates, Assignments, workflow states, subtasks, priority, effort, module colours, and dashboard filtering.
