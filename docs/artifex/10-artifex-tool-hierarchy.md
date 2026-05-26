# Artifex Tool Hierarchy

## Purpose

This document locks the working ownership split between the main Artifex editor tools for the Forever Bound companion game.

The important decision is that Artifex is a wider game-building hub. The Scene Editor is only one module inside it. The Project Manager sits above the editor modules and connects the full playable game structure.

## Locked Working Rule

- **Project Manager** = connects the whole game.
- **Scene Editor** = builds scenes and screens.
- **Archetype Object Creator** = creates reusable non-FX objects.
- **Effects Editor** = creates reusable FX archetypes.
- **Quest Builder** = assembles scenes, objects, dialogue, UI overlays, Codice, Capra, rewards, and completion logic into playable Quest flow.

In simple terms:

- Scene Editor = where things are.
- Archetype Object Creator = what normal things are.
- Effects Editor = what visual / magical effects are.
- Quest Builder = what those things do in this Quest.
- Project Manager = how all parts connect into the full game.

## Project Manager

The Project Manager is the top-level control hub.

It links the title screen, Map of Ostangavia, Chronicles, main Quests, side Quests / Errands, scenes, UI screens, transition flow, object libraries, FX libraries, global settings, build status, export tools, and validation.

It is responsible for connecting the whole game structure rather than editing one scene in isolation.

The Project Manager can include or coordinate workspaces such as Manifest, Flatplan, Stitcher / connection logic, player-map projection, route linking, structure validation, and Build Prep.

Older notes may refer to this area as Project Editor. The preferred working name for the top-level hub is now **Project Manager**.

## Scene Editor

The Scene Editor builds physical scenes and screens.

It handles background artwork, foreground layers, parallax, fog, lighting layers, visual scene overlays, walkable areas, collision, exits, Mel start position, placed archetype objects, NPCs, Foes, pickups, Stone Markers, hazards, and scene layout.

The Scene Editor defines where things are.

A scene created here can later be connected by the Project Manager and given Quest meaning by the Quest Builder.

## Archetype Object Creator

The Archetype Object Creator creates reusable non-effect objects for the Object / Archetype Library.

This includes NPCs, companions, vendors, doors, exits, pickups, Quest Relics, searchable caches, Foes, Thralls, hazards, throwable objects, Stone Markers, props, and other reusable gameplay objects.

The Archetype Object Creator defines normal objects before they are placed into scenes.

It does not create visual / magical FX archetypes. Those belong to the Effects Editor.

## Effects Editor

The Effects Editor creates reusable FX archetypes for the FX Library.

This includes corruption glows, possession eyes, Aetheris glow, Mel magic effects, damage flashes, grayscale death effects, portal shimmer, fog, particles, fire flicker, transition blur, warning flashes, cooldown overlays, Null Zone suppression effects, and other reusable visual or magical effects.

The Effects Editor is only for effect archetypes, not normal objects.

FX archetypes can later be placed in scenes, attached to objects, triggered by quests, or used as transitions and overlays.

## Quest Builder

The Quest Builder assembles playable Quest flow from scenes, placed archetype objects, dialogue, Capra feedback, Codice updates, UI overlays, triggers, conditions, rewards, route unlocks, completion flags, and Calling Fulfilled logic.

It does not draw or build scenes. It gives meaning and behaviour to objects and scenes already created elsewhere.

The Quest Builder is where a scene object becomes part of an objective, clue, reward, condition, route unlock, dialogue trigger, Capra response, or Codice update.

## Overlay Ownership Rule

Visual scene overlays belong to the Scene Editor.

Examples:

- fog
- tree layers
- foreground ferns
- corruption glow
- light beams
- weather layers
- ambient magical effects

Quest/UI overlays belong to the Quest Builder / UI system.

Examples:

- dialogue boxes
- Capra popups
- Codice update notices
- Calling Fulfilled screens
- quest prompts
- route warnings
- reward notifications
- failed-attempt messages

## Handoff Flow

1. Archetype Object Creator creates reusable non-FX objects.
2. Effects Editor creates reusable FX archetypes.
3. Scene Editor uses backgrounds, objects, and effects to build a scene or screen.
4. Quest Builder links dialogue, triggers, Quest logic, Capra feedback, Codice updates, rewards, and UI overlays to scenes and objects.
5. Project Manager connects title screen, map, Quests, side Quests, Chronicles, scenes, screens, routes, validation, and build/export flow.

## Practical Example

A locked door should be created as a reusable object in the Archetype Object Creator.

Its magical glow should be created as an FX archetype in the Effects Editor.

The door should be placed into a scene in the Scene Editor.

The condition that it opens after Mel finds a relic should be authored in the Quest Builder.

The route that sends the player through the door into another scene should be connected in the Project Manager.
