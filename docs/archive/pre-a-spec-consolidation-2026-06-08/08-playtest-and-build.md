# Playtest and Build Game

## Purpose

This document defines how Artifex should test and package a project.

Playtest helps the creator check scenes, routes, quests, and the whole game before export.

Build Game packages the finished playable browser game.

## Playtest

Playtest lets the creator test the project directly inside Artifex.

It should support:

- play from start
- play selected screen
- play selected scene
- play selected Flatplan node/station
- play selected quest
- play route from point A to point B
- test with fake flags/items enabled
- reset playtest state

## Preview Scene

Preview Scene is a smaller test mode inside the Scene Editor.

It tests one scene visually/functionally without needing to run the whole game structure.

## Project Editor Playtest

The Project Editor / Flatplan should support broader playtesting.

Possible options:

- play from start
- play from selected Station/Node
- play selected Route
- play from Depot
- play from Junction
- play route from A to B
- play with selected flags/items enabled

## Quest Builder Playtest

The Quest Builder should eventually include Test Quest.

Possible options:

- test selected Quest
- test selected Branch / Side Quest
- reset quest state
- fake required items
- fake required flags
- jump to relevant Station/Node

## Build Game

Build Game is the final packaging step.

Other possible names:

- compile
- export
- publish
- package

Build Game should gather the Runtime Engine, project data, scenes, screens, assets, quests, audio, and settings into a playable browser game.

## Pre-Build Validation

Before building, Artifex should check:

- are all required files present?
- is the start screen valid?
- are all referenced assets available?
- are there broken scene links?
- are there invalid quest references?
- can the game be played from start to at least one endpoint?
- are there duplicate IDs?
- are there missing route targets?
- are there unconnected required Stations/Nodes?

## Backup / Snapshot

Backup/snapshot is not a first-priority module.

A later simple option such as Export Project Backup ZIP may be useful, but it does not need to be part of the first version.

The creator can also manage backups through normal file copies or version control.
