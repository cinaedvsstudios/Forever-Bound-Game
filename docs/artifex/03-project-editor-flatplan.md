# Project Editor and Flatplan

## Purpose

The Project Editor is the higher-level game-structure editor.

It is where separate screens and scenes become a connected game.

The Project Editor should contain the Project Manifest, Flatplan, Stitcher/connection logic, routes, game structure, start screen assignment, and player map projection if needed.

## Project Manifest

The Project Manifest is the central file that tells Artifex what belongs to a project.

Likely filename: `project.json`.

It should include:

- project ID
- game title
- creator/studio name
- version
- template origin
- start screen
- enabled modules
- main folders
- scene index
- screen index
- quest data
- object data
- asset data
- export/build settings

## Flatplan

The Flatplan is the creator-facing structure view of the whole game.

It is not the player’s in-game map.

It should be visualized like a train map rather than a straight linear timeline. It can show a main quest path, optional branches, side quests, dead ends, loops, depots, junctions, waypoints, locked areas, hidden areas, and endings.

The Flatplan should show how all major game parts connect.

## Station / Node Concept

The name is not locked yet.

A basic visual Scene becomes a Station/Node once it is placed into the Flatplan and given game logic.

A Scene is visual/layout data.

A Station/Node is that scene once it has connections, conditions, quest relevance, routes, entry/exit logic, or progression meaning.

## Route

A Route is a connection between Stations/Nodes.

A Route defines how the player moves from one part of the game to another.

Routes can be:

- open
- locked
- hidden
- one-way
- two-way
- quest-gated
- item-gated
- optional
- part of the main Quest

## Depot

Depot is the current preferred replacement for Hub.

A Depot is a major central Station that connects to many other Routes. It can be a town, home base, central menu, world map area, or recurring location that many parts of the game return to.

## Junction

A Junction is a Station where Routes split, merge, or redirect.

This is useful for choice points, branching paths, alternate routes, or places where the player can choose between different next steps.

## Waypoint

A Waypoint is a smaller navigation point, marker, checkpoint, map point, exit point, save point, or travel trigger.

A Waypoint may exist inside a scene or on the Flatplan/player map.

## Stitcher / Connection Logic

The Stitcher is not a locked name yet.

It is the logic system that connects parts of the Flatplan together.

Examples:

- Start Game button loads the first scene.
- Door exit loads a house interior.
- Forest endpoint loads the bridge.
- Map marker opens a travel route.
- Quest complete unlocks a new route.
- Key collected unlocks a door.
- Villain defeated loads the ending screen.

Possible names include:

- Stitcher
- Flow Graph
- Connector
- Route Builder
- Threader
- Pathmaker
- Linker

## Player Map / Game Map

The player-facing map may be related to the Flatplan, but it is not exactly the same thing.

The Flatplan is the creator’s complete structure view.

The Player Map is what the player sees inside the game.

The Player Map may be generated from selected parts of the Flatplan. Some Stations/Nodes may appear on the Player Map, while hidden or logic-only nodes may not appear until unlocked.

## Map Projection

Map Projection is the subset of the Flatplan that becomes visible on the Player Map.

Hidden Stations, secret Branches, and logic-only nodes may be excluded until unlocked.

## Current Transport-Style Logic

The current metaphor is:

- The Flatplan contains Stations connected by Routes.
- Some Stations are Depots.
- Some Stations are Junctions.
- Some points are Waypoints.
- A Quest is the main playable objective path through selected Stations and Routes.
- A Branch is an optional side quest/path.
- The Stitcher/Route Builder defines how those connections work.
