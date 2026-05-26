# Artifex Creation Guide V1

## Purpose

The Creation Guide is the Artifex wizard, assignment planner, milestone tracker, checklist surface, progress dashboard, and health-check module.

It helps a creator start a new Artifex Adventure project from the starter template, then track what still needs to be changed, confirmed, built, tested, reviewed, blocked, or fixed.

The Creation Guide should function as production mission control. It does not replace the individual Artifex tools. It tells the creator what needs to be done next and which tool owns the work.

## Core Object: Assignment

The main production object is an Assignment.

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

Example:

```text
[violet stripe] Create First Forest Scene
Scene Editor · Chronicle 0 · Forest Route · Priority 4 · Effort 3 · 5/7 subtasks
```

## Assignment Detail Popup

Clicking an Assignment opens a detail popup.

The popup uses the Assignment primary module accent colour in the header, border, action buttons, and progress bar.

The popup should contain:

- title
- icon
- description
- owning module
- related modules
- workflow state
- owner
- priority default and override
- effort default and override
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

The dashboard should answer:

```text
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

## Main Views

Planned views:

1. Dashboard
2. Assignment Board
3. Assignment List
4. Zone / Scene / Screen View
5. Milestone View
6. Archive View

## V1 Scope

This first version is intentionally practical and small. It adapts the Artifex Blank Module Boilerplate into a real Creation Guide module with:

- project setup fields
- enabled module selection
- starter production timeline
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

V1 does not directly write to GitHub, create real project folders, edit Flatplans, open JSON files directly, or validate live asset paths from the repository.

Those features belong to later versions after the core workflow is proven.

## Relationship To Other Modules

Creation Guide points the creator to the correct tool. It does not replace them.

- Project Editor owns the Manifest, Flatplan, routes, catalog, Stitcher, and map projection.
- Scene Editor builds scene JSON and visual layout.
- Quest Builder handles Chronicle, Quest, Calling, objective, and completion-condition structure.
- Object Creator builds archetype objects, NPCs, props, pickups, doors, caches, Foes, interactables, vendors, and job objects.
- Effect Editor builds FX, particles, overlays, glow, weather, transitions, damage flashes, and magic effects.
- Object Library and Asset Library provide reusable runtime objects and files.

## Data Model

The module exports one Creation Guide JSON document:

```json
{
  "id": "creation_xxxxx",
  "name": "Artifex Adventure Creation Guide",
  "moduleKind": "creation-guide",
  "version": "V1.0",
  "setup": {},
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

## First Version Rule

This module should first prove one working guide document before it becomes a full project creation system.

The first reliable version should focus on Assignments, workflow states, subtasks, priority, effort, module colours, and dashboard filtering.
