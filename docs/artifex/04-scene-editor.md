# Scene Editor

## Purpose

The Scene Editor is the visual editor that already exists.

It includes what might otherwise be called:

- editor
- scene board
- screen designer
- visual editor

The Scene Editor edits visual scenes and screens.

## What The Scene Editor Edits

The Scene Editor should be used to create and edit:

- playable scenes
- title screens
- menu screens
- UI layouts
- ending screens
- backgrounds and foregrounds
- visual layers
- player start position
- scene objects
- screen buttons
- markers
- interaction zones
- layout and coordinates
- basic asset placement

## Scene

A Scene is the visual/layout version of a game space or screen.

A Scene can be a room, forest path, title screen, menu, battle screen, travel route, shop, or ending screen.

At this stage it is mostly visual/layout data.

A Scene becomes more functional once it is connected to game logic in the Project Editor.

## Screen

A Screen is a non-playable or UI-focused Scene.

Examples:

- title screen
- options screen
- credits screen
- save/profile screen
- inventory screen
- pause menu
- ending screen

## Playable Scene

A Playable Scene is a scene where the player can move, interact, fight, explore, collect objects, or trigger events.

## Title Screen / Game Screen Logic

Title screens and game screens branch across multiple areas.

The Scene Editor creates their visual layout.

The Project Editor and Stitcher/Route logic give them functional meaning.

Example: the Scene Editor can design the title screen visually, but the Project Editor must define what the Start Game button actually loads.

## Basic Asset Library

The Scene Editor already contains a basic asset library.

This built-in asset library is for choosing and assigning image/audio paths while working visually.

It should remain part of the Scene Editor for normal placement work.

The basic Asset Library is different from the Advanced Object Library.

The Asset Library chooses files.

The Advanced Object Library defines reusable game things and their behaviours.

## Preview Scene

The Scene Editor should have a Preview Scene button.

Preview Scene tests one scene visually/functionally without needing to run the whole game structure.

Full route/game testing belongs to the Playtest tools in the Project Editor/Flatplan area.
