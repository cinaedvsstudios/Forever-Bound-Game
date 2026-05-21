# Module Architecture

## Purpose

This document defines the main working modules of Artifex.

The goal is to keep Artifex modular without splitting it into too many artificial systems. Several concepts that were originally discussed separately are actually part of the same larger module, but some modules must stay separate so the tool does not become a tangled mess.

## Current Simplified Module List

1. Runtime Engine.
2. Scene Editor.
3. Project Editor.
4. Creation Guide.
5. Advanced Object Library.
6. Quest Builder.
7. Playtest.
8. Build Game.

## Core Boundary Rule

The Project Editor is central, but it does not own everything.

The Project Editor connects completed project pieces into a playable structure.

The Object Library defines reusable game things.

The Quest Builder defines objectives and progression.

The Creation Guide guides the user through setup and tracks milestones.

Build Game validates/packages the finished project.

The modules should talk to each other through shared IDs and data references rather than swallowing each other.

## Runtime Engine

The Runtime Engine is the playable browser game layer.

It reads project files and runs the finished game. It should load screens, scenes, characters, objects, quests, dialogue, map connections, audio, and save data from project data files.

The creator should not normally edit the Runtime Engine directly. The editor tools should produce data that the Runtime Engine can read.

## Scene Editor

The Scene Editor is the visual editor that already exists.

It includes what might otherwise be called the editor, scene board, screen designer, and visual editor.

The Scene Editor edits visual scenes and screens. This includes playable scenes, title screens, menu screens, UI layouts, backgrounds, layers, objects, buttons, markers, coordinates, and basic asset placement.

A Scene or Screen made in the Scene Editor can later become usable in the Project Editor through the Flatplan Catalog.

## Project Editor

The Project Editor is the higher-level game-structure editor.

It contains the Project Manifest, Flatplan, Flatplan Catalog, Stitcher/connection logic, routes, game structure, start screen assignment, player map projection, and structure-level build prep.

The Project Editor is where separate scenes, screens, quests, branches, and routes become a connected game.

The Project Editor should reference Object Library archetypes and Quest Builder quests/conditions, but it should not become the place where those things are fully authored.

Suggested Project Editor workspaces:

1. Manifest.
2. Flatplan.
3. Stitcher.
4. Build Prep.

## Creation Guide

The Creation Guide is the combined wizard, timeline, checklist, milestone, dashboard, and health-summary system.

It guides the user through creating a new project from Artifex Adventures and tracks project milestones.

The Creation Guide is not the Project Editor. It should not own the Flatplan, route logic, or structural graph. It can link to those tools and report whether required work is done.

## Advanced Object Library

Advanced Object Library is a placeholder name and is not locked yet.

This module defines reusable game things and their behaviour. It is separate from the Scene Editor’s basic asset library, which is mainly for choosing and placing files.

The Advanced Object Library should manage characters, NPCs, enemies, villains, items, keys, pickups, props, markers, doors, interactable objects, reusable object templates, object properties, object behaviours, and metadata.

The Project Editor can reference these definitions when defining routes, conditions, gates, and scene logic, but the definitions themselves belong in the Object Library.

## Quest Builder

The Quest Builder manages quests, side quests, branches, flags, conditions, rewards, unlocks, and progression logic.

The Flag Manager and Condition Builder should not be separate top-level modules. They should live inside or under the Quest Builder because they are mostly used for progression and unlock logic.

The Project Editor can reference quests, branches, flags, and conditions when connecting the Flatplan, but the actual authoring of quest/progression logic belongs in the Quest Builder.

## Playtest

Playtest lets the creator test the game directly from Artifex.

It should be available from multiple places:

- Scene Editor: Preview Scene.
- Project Editor / Flatplan: Play from selected node/station, route, or start point.
- Quest Builder: Test Quest.
- Build Game: final pre-export run/check.

The core Playtest system can be shared, but different modules should expose different entry buttons.

## Build Game

Build Game is the final packaging step.

It gathers the Runtime Engine, project data, scenes, screens, assets, quests, audio, and settings into a playable browser game.

Other possible names include compile, export, publish, and package.

Build Game owns final packaging/export validation. The Project Editor can have a Build Prep workspace, but the actual final export belongs to Build Game.

## Diagnosis / Validation Split

Avoid using one vague “Diagnosis” module for everything.

Use this split instead:

- **Creation Guide health summary** = what still needs doing, what milestones are incomplete, what setup is missing.
- **Project Editor Build Prep** = whether the Flatplan/project structure is coherent enough to hand to the runtime/build process.
- **Build Game validation** = whether the final playable package can be generated safely.

Examples:

- Creation Guide: title screen not reviewed, first scene not complete, milestone missing.
- Project Editor: route points nowhere, no start node, station has no linked scene, impossible progression.
- Build Game: missing files, invalid JSON, unresolved assets, export package not ready.

## Cross-Module Objects

Some game parts branch across multiple modules.

For example, a title screen is visually created in the Scene Editor, but the Project Editor must define where it sits in the game structure and what the Start button loads.

A scene is visually made in the Scene Editor, but it becomes part of the playable game once it is connected in the Project Editor and/or used by the Quest Builder.

An object can be visually placed in the Scene Editor, but its reusable identity and behaviour should come from the Advanced Object Library.

A quest can be authored in the Quest Builder, but its playable route through the game is visualized and connected in the Project Editor.
