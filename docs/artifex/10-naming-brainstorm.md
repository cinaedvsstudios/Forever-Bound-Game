# Naming Brainstorm

## Purpose

This document stores possible naming sources and replacement words for Artifex terminology.

This is not the final terminology list. Final/current terminology belongs in `09-terminology.md`.

Do not delete possible terms too quickly. Keep them here for comparison and future inspiration.

## Current Terms That Need Better Names

The terms that still need final naming work are:

- Station / Node / Depot / Actor / Entity / Dummy
- Stitcher / Flow Graph / Manifest
- Advanced Object Library
- Archetype / Prefab / Blueprint
- Actor / Entity / Dummy
- Marker / Waypoint
- Build Game / Compile / Export / Publish / Package

## Magazine / Publishing Terms

Possible useful words:

- Flatplan
- spread
- page plan
- dummy
- masthead
- folio
- layout
- issue
- proof
- galley
- paste-up
- run sheet

Potential uses:

- Flatplan works well for the whole-game structure view.
- Dummy can mean a mock-up, but may sound too rough for the UI.
- Proof could be useful for testing/previewing.
- Run sheet may be useful for ordered production steps or build sequences.
- Masthead may fit branding/project identity, but may be too publishing-specific.

## Game Development Terms

Possible useful words:

- scene
- level
- world
- prefab
- blueprint
- actor
- entity
- trigger
- state
- flow graph
- build
- event
- object
- component
- system

Potential uses:

- Scene is already correct for visual scenes.
- Prefab, Blueprint, and Archetype all refer to reusable definitions.
- Actor and Entity are technically useful but may be too engine-like for user-facing UI.
- Trigger is good for invisible logic zones.
- State is useful for save/progression logic.
- Flow Graph is useful for visual logic connections, but may sound technical.
- Build is good for the final exported game.

## Transport / Logistics Terms

Possible useful words:

- route
- line
- branch
- station
- junction
- terminal
- hub
- depot
- waypoint
- manifest
- itinerary
- dispatch
- network
- interchange
- transfer

Potential uses:

- Route is strong for connections between Stations/Nodes.
- Branch is strong for optional side paths or side quests.
- Station may work as a better word than Node, but is not locked yet.
- Junction is good for split/merge points.
- Depot is currently preferred as the replacement for Hub.
- Waypoint is good for navigation points or map markers.
- Manifest is strong for the project index because it lists what belongs to the project.
- Terminal could describe an ending point.
- Interchange could describe a major junction where several routes meet.
- Dispatch may work for build/export, but is less clear than Build Game.

## Current Transport-Style Logic

The current metaphor is:

- The Flatplan contains Stations connected by Routes.
- Some Stations are Depots.
- Some Stations are Junctions.
- Some points are Waypoints.
- A Quest is the main playable objective path through selected Stations and Routes.
- A Branch is an optional side quest/path.
- The Stitcher/Route Builder defines how those connections work.

## Possible Replacement Groups

### Station / Node Group

Current possible words:

- station
- node
- depot
- actor
- entity
- dummy
- stop
- stage
- beat
- story point
- location
- frame

Need to decide whether the official term should be transport-style, game-style, or neutral.

### Stitcher Group

Current possible words:

- stitcher
- flow graph
- manifest
- connector
- route builder
- threader
- pathmaker
- linker

Need a term for the logic system that connects Stations through Routes.

### Advanced Object Library Group

Current possible words:

- Advanced Object Library
- Object Library
- Archetype Library
- Blueprint Library
- Prefab Library
- Object Forge
- Component Library
- Game Object Library
- Object Workshop

Need a term for the module that defines reusable game objects and behaviours.

### Archetype Group

Current possible words:

- archetype
- prefab
- blueprint

Need a term for reusable object definitions.

### Marker / Waypoint Group

Current possible words:

- marker
- waypoint
- checkpoint
- map point
- travel point
- trigger marker

Possible split:

- Waypoint for navigation/map/travel points.
- Marker for general placed trigger objects inside scenes.

### Build Game Group

Current possible words:

- Build Game
- Compile Game
- Export Game
- Publish Build
- Package Game
- Dispatch

Need final user-facing button text for the final playable build/export step.
