# Creation Guide

## Purpose

The Creation Guide is the combined wizard, timeline, checklist, progress dashboard, and health-check system.

It helps the user make a new project from the Artifex Adventures template without getting lost.

It also acts as the production dashboard for tracking what still needs to be built.

## What It Includes

The Creation Guide includes:

- new project wizard
- timeline
- checklist
- milestones
- completion percentages
- project health checks
- warnings for missing or broken pieces
- progress dashboard
- task tracking
- project notes

## Wizard

The Wizard is the guided setup experience.

It should create a new project from Artifex Adventures and ask for basic project information.

Possible setup questions:

- game title
- creator/studio name
- project folder name
- starting character name
- visual style
- default aspect ratio
- enabled gameplay modules

## Timeline

The Timeline is the recommended production order.

This is not the story timeline. It is the creator’s build path.

Example stages:

1. Project Setup.
2. Branding.
3. Hero setup.
4. First Scene.
5. First Interaction.
6. First Item.
7. First Enemy.
8. First Quest.
9. First Route.
10. First Playtest.
11. Build Game.

## Milestones

The tasks inside the Creation Guide are called Milestones.

A Milestone is a required or recommended step inside the project setup/build path.

Examples:

- create project
- replace title screen
- define hero
- connect first route
- create first quest
- test first playable path
- build game

## Checklist

The Checklist is the detailed task tracker inside the Creation Guide.

It shows whether each template item has been:

- changed
- confirmed
- left as template default
- incomplete
- missing
- broken

## Completion Percentages

A milestone reaches 100% when its required template elements have either been changed from the default or deliberately confirmed by the creator.

The percentage should not require a fixed number of scenes.

It should measure whether the user has handled each required starter category at least once.

Example checks:

- project name set
- title screen reviewed
- start button connected
- main character reviewed
- first scene reviewed
- first scene has an exit
- at least one quest exists
- first quest has a completion condition
- required asset paths are valid
- Flatplan has a playable route from start to at least one endpoint

## Production Dashboard / Project Manager Ideas

Earlier notes used the name Project Manager for this planning dashboard. In the current architecture, this belongs mostly inside the Creation Guide, with links out to the Project Editor, Scene Editor, Quest Builder, and Object Library.

Purpose:

The dashboard lets the creator see the whole project structure, plan scenes, track progress, and create tasks.

It should use collapsible nested boxes so the project can be viewed at different levels.

Possible sections:

```text
Project Overview
Chronicles
Quests / Callings
Scenes
Tasks
Asset Needs
Testing Checklist
Bugs / Blockers
Progress Dashboard
```

Example hierarchy:

```text
Forever Bound
  Chapter 00
    Calling 00
      Map Screen
      Travel Scene: Forest Route
      Scene: Mel Intro
      Dialogue Scene: First Encounter
      Battle Scene / Trial Scene
      Reward / Completion Screen
```

Another example hierarchy:

```text
Forever Bound
  Chronicle 0
    Quest 0.0
      Scene: Tutorial Map
      Scene: Forest Travel Route
      Scene: First Stone Marker
      Tasks
    Quest 0.5
      Battle Test
      Officina Test
      Songspell Test
  Chronicle 1
    Quest 1.0
    Quest 1.1
```

Each collapsible item should be able to contain:

```text
Status
Checklist
Notes
Linked JSON file
Linked assets
Assigned tasks
Priority
Completion percentage
Last edited date
Open in Scene Editor
```

Example status values:

```text
Not Started
Planning
In Progress
Needs Review
Blocked
Ready for Test
Complete
```

Example task checklist:

```text
Write scene dialogue
Add background art
Place character sprites
Add fog effect
Add music
Test JSON import
Test in game
```

The dashboard should eventually connect directly to the Scene Editor, so clicking a scene/task can open the relevant JSON file or template.

## Project Health Check

Project Health Check is the validation part of the Creation Guide.

It should check for:

- missing files
- broken routes
- duplicate IDs
- unconnected Stations/Nodes
- invalid quests
- missing start screen
- broken asset references
- invalid quest conditions
- required template defaults that have not been changed or confirmed

## Relationship To Other Modules

The Creation Guide does not replace the Scene Editor, Project Editor, Quest Builder, or Object Library.

It points the creator to those tools in the correct order and reports whether required setup work is complete.

Intended workflow:

1. Select active project in Project Settings.
2. Open the Creation Guide to see what needs to be built.
3. Open a scene task.
4. Launch Scene Editor.
5. Add backgrounds, characters, props, UI, and CG effects from libraries.
6. Save/export the scene JSON.
7. Mark checklist items complete in Creation Guide.
8. Test in the game.
