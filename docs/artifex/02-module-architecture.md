# Module Architecture

## Purpose

This document defines the main working modules of Artifex.

The goal is to keep Artifex modular without splitting it into too many artificial systems. Several concepts that were originally discussed separately are actually part of the same larger module.

## Current Simplified Module List

1. Runtime Engine.
2. Scene Editor.
3. Project Editor.
4. Creation Guide.
5. Advanced Object Library.
6. Quest Builder.
7. Playtest.
8. Build Game.

## Runtime Engine

The Runtime Engine is the playable browser game layer.

It reads project files and runs the finished game. It should load screens, scenes, characters, objects, quests, dialogue, map connections, audio, and save data from project data files.

The creator should not normally edit the Runtime Engine directly. The editor tools should produce data that the Runtime Engine can read.

## Scene Editor

The Scene Editor is the visual editor that already exists.

It includes what might otherwise be called the editor, scene board, screen designer, and visual editor.

The Scene Editor edits visual scenes and screens. This includes playable scenes, title screens, menu screens, UI layouts, backgrounds, layers, objects, buttons, markers, coordinates, and basic asset placement.

## Project Editor

The Project Editor is the higher-level game-structure editor.

It contains the Project Manifest, Flatplan, Stitcher/connection logic, routes, game structure, start screen assignment, and player map projection if needed.

The Project Editor is where separate scenes become a connected game.

## Creation Guide

The Creation Guide is the combined wizard, timeline, checklist, and health-check system.

It guides the user through creating a new project from Artifex Adventures and tracks project milestones.

## Advanced Object Library

Advanced Object Library is a placeholder name and is not locked yet.

This module defines reusable game things and their behaviour. It is separate from the Scene Editor’s basic asset library, which is mainly for choosing and placing files.

The Advanced Object Library should manage characters, NPCs, enemies, villains, items, keys, pickups, props, markers, doors, interactable objects, reusable object templates, object properties, object behaviours, and metadata.

## Quest Builder

The Quest Builder manages quests, side quests, branches, flags, conditions, rewards, unlocks, and progression logic.

The Flag Manager and Condition Builder should not be separate top-level modules. They should live inside or under the Quest Builder because they are mostly used for progression and unlock logic.

## Playtest

Playtest lets the creator test the game directly from Artifex.

It should be available from multiple places:

- Scene Editor: Preview Scene.
- Project Editor / Flatplan: Play from selected node/station, route, or start point.
- Quest Builder: Test Quest.

The core Playtest system can be shared, but different modules should expose different entry buttons.

## Build Game

Build Game is the final packaging step.

It gathers the Runtime Engine, project data, scenes, screens, assets, quests, audio, and settings into a playable browser game.

Other possible names include compile, export, publish, and package.

## Cross-Module Objects

Some game parts branch across multiple modules.

For example, a title screen is visually created in the Scene Editor, but the Project Editor must define where it sits in the game structure and what the Start button loads.

A scene is visually made in the Scene Editor, but it becomes part of the playable game once it is connected in the Project Editor and/or used by the Quest Builder.

An object can be visually placed in the Scene Editor, but its reusable identity and behaviour should come from the Advanced Object Library.
