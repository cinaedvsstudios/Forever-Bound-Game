# Artifex Tool Hierarchy

## Purpose

This document locks the working ownership split between the main Artifex editor tools for the Forever Bound companion game.

The important decision is that Artifex is a wider game-building hub. The Scene Editor is only one module inside it. The **Project Editor** sits above the editor modules and connects the full playable game structure.

## Locked Working Rule

- **Project Editor** = connects the whole game.
- **Scene Editor** = builds scenes and screens.
- **Archetype Object Creator** = creates reusable non-FX objects.
- **Effects Editor** = creates reusable FX archetypes.
- **Quest Builder** = assembles scenes, objects, dialogue, UI overlays, Codice, Capra, rewards, puzzles and completion logic into playable Quest flow.
- **Puzzle Creator** = authors reusable self-contained gameplay challenges that may be linked into Quest flow.

In simple terms:

- Scene Editor = where things are.
- Archetype Object Creator = what normal things are.
- Effects Editor = what visual / magical effects are.
- Puzzle Creator = how a contained challenge works.
- Quest Builder = what those things do in this Quest.
- Project Editor = how all parts connect into the full game.

## Project Editor

The Project Editor is the top-level structural editing hub.

It links the title screen, Map of Ostangavia, Chronicles, main Quests, side Quests / Errands, scenes, UI screens, transition flow, route structure, puzzle references where structurally needed, object libraries, FX libraries, global settings, build status, export tools, and validation.

It is responsible for connecting the whole game structure rather than editing one scene, Quest or puzzle in isolation.

The Project Editor can include or coordinate workspaces such as Manifest, Flatplan, Stitcher / connection logic, player-map projection, route linking, structure validation, and Build Prep.

**Project Editor is the locked user-facing name.** Historical notes, filenames, task IDs or UI still referring to **Project Manager** are migration items to be corrected deliberately; they are not an alternate official module name.

## Scene Editor

The Scene Editor builds physical scenes and screens.

It handles background artwork, foreground layers, parallax, fog, lighting layers, visual scene overlays, walkable areas, collision, exits, Mel start position, placed archetype objects, NPCs, Foes, pickups, Stone Markers, hazards, and scene layout.

The Scene Editor defines where things are.

A scene created here can later be connected by the Project Editor and given Quest meaning by the Quest Builder.

## Archetype Object Creator

The Archetype Object Creator creates reusable non-effect objects for the Object / Archetype Library.

This includes NPCs, companions, vendors, doors, exits, pickups, Quest Relics, searchable caches, Foes, Thralls, hazards, throwable objects, Stone Markers, props, and other reusable gameplay objects.

The Archetype Object Creator defines normal objects before they are placed into scenes or puzzles.

It does not create visual / magical FX archetypes. Those belong to the Effects Editor.

## Effects Editor

The Effects Editor creates reusable FX archetypes for the FX Library.

This includes corruption glows, possession eyes, Aetheris glow, Mel magic effects, damage flashes, grayscale death effects, portal shimmer, fog, particles, fire flicker, transition blur, warning flashes, cooldown overlays, Null Zone suppression effects, and other reusable visual or magical effects.

The Effects Editor is only for effect archetypes, not normal objects.

FX archetypes can later be placed in scenes, attached to objects, triggered by quests or puzzles, or used as transitions and overlays.

## Puzzle Creator

The Puzzle Creator authors a self-contained playable challenge, such as a maze/labyrinth, ritual or item-order challenge, symbol assembly, hazard course or arena trial.

It owns the puzzle's internal layout, challenge rules, placed puzzle features, internal completion requirements and puzzle-specific feedback needed while the player is attempting it.

A completed puzzle is registered under `puzzles/` and can be used by Quest Builder as a meaningful flow block. Puzzle Creator does not author the wider Quest chain, story dialogue surrounding the challenge, Quest rewards or Project Editor routes.

## Quest Builder

The Quest Builder assembles playable Quest flow from scenes, placed archetype objects, linked puzzles, dialogue, Capra feedback, Codice updates, UI overlays, triggers, conditions, rewards, route unlocks, completion flags, and Calling Fulfilled logic.

It does not draw or build scenes and does not author the inside of a puzzle. It gives meaning and behaviour to objects, scenes and saved puzzles already created elsewhere.

The Quest Builder is where a scene object or saved puzzle becomes part of an objective, clue, reward, condition, route unlock, dialogue trigger, Capra response or Codice update.

## Overlay Ownership Rule

Visual scene overlays belong to the Scene Editor.

Examples:

- fog;
- tree layers;
- foreground ferns;
- corruption glow;
- light beams;
- weather layers;
- ambient magical effects.

Quest/UI overlays belong to the Quest Builder / UI system.

Examples:

- dialogue boxes;
- Capra popups;
- Codice update notices;
- Calling Fulfilled screens;
- quest prompts;
- route warnings;
- reward notifications;
- failed-attempt messages.

Puzzle-local attempt feedback belongs to Puzzle Creator when it is required to play or evaluate the contained puzzle. Story-facing feedback before or after that puzzle belongs to Quest Builder.

## Handoff Flow

1. Archetype Object Creator creates reusable non-FX objects.
2. Effects Editor creates reusable FX archetypes.
3. Scene Editor uses backgrounds, objects, and effects to build a scene or screen.
4. Puzzle Creator creates any self-contained challenge and saves/registers its puzzle record.
5. Quest Builder links dialogue, triggers, saved puzzles, Quest logic, Capra feedback, Codice updates, rewards, and UI overlays to scenes and objects.
6. Project Editor connects title screen, map, Quests, side Quests, Chronicles, scenes, screens, routes, validation, and build/export flow.

## Practical Example

A locked door should be created as a reusable object in the Archetype Object Creator.

Its magical glow should be created as an FX archetype in the Effects Editor.

The door should be placed into a scene in the Scene Editor.

A pedestal-symbol puzzle required to open the door should be authored in Puzzle Creator and referenced by stable `puzzle_` ID.

The Quest step requiring Mel to solve the puzzle, the resulting dialogue and the flag that records success should be authored in Quest Builder.

The route that sends the player through the opened door into another scene should be connected in the Project Editor.