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

## Local JSON Scene Editor Behaviour

The earlier local JSON editor patch added a browser editor that could import a scene JSON file, show it over a background preview, let the user drag Mel's start position and object markers, then download the edited JSON.

Important behaviour from that editor:

- It does not use a GitHub token.
- It does not save directly to GitHub.
- It only saves a temporary local draft in the browser.
- The user manually downloads the edited JSON.
- The user manually uploads/replaces the JSON in the repository.

Earlier editor files:

```text
editor.html
src/editor.ts / src/editor.js
src/editor.css
data/scenes/ch00_q00_forest_route_scene.json
```

Earlier workflow:

1. Open `editor.html`.
2. Click `Import scene JSON`.
3. Choose the scene JSON from the computer.
4. Click `Preview background image` if the background does not show from the repo path.
5. Drag Mel / objects / walkable area.
6. Click `Download edited JSON`.
7. Upload the downloaded JSON back into the same GitHub folder, replacing the old one.

Important rule:

This editor edits data only. It does not edit PNGs, TypeScript game code, or GitHub automatically.

## Editor v3 Patch Notes To Preserve

Earlier editor v3 notes included these changes:

### Main game title screen changes

- Corrects visible studio name to CINAEDVS Studios.
- Makes the studio mark a hyperlink to the CINAEDVS site.
- Replaces the short subtitle with the longer story tagline.
- Makes the main logo larger.
- Adds a title footer with copyright, Forever Bound website link, and GitHub project link.
- Keeps the Scene Editor button on the title screen.

### Editor changes

- Moves File, View, GitHub, and Help controls into a top bar.
- Keeps scene/object editing in the left side panel.
- Adds hover tooltips through browser title text.
- Adds a persistent help modal opened with the question mark button.
- Help stays open until closed.
- Clicking a selected scene/UI item while help is open moves the help focus to the relevant section.
- Toggle buttons use purple active styling.
- Adds JSON Preview on/off.
- Keeps grid/snap controls in the top bar.
- Keeps wide background preview in the top bar and scene controls.
- Adds shadow controls for selected items, especially Mel.

Important note:

The editor still uses the safe download-and-reupload workflow. It does not write directly to GitHub.

## Migration Notes

The current editor engine becomes:

```text
artifex/apps/scene-editor/
```

Current initial setup:

```text
artifex/apps/scene-editor/index.html
artifex/apps/scene-editor/README.md
```

The current Scene Editor route loads the existing standalone editor engine from the repo root.

Needs testing:

- confirm Scene wedge opens the editor.
- confirm editor CSS loads.
- confirm editor JS loads.
- confirm the editor can render.
- confirm JSON import/download still work.
- confirm image/asset paths inside the editor still resolve correctly.

Main challenge:

Fixing relative file paths. Current paths may assume repo root:

```text
assets/
data/
src/
```

After migration these may need path handling or a proper path resolver system.

## Preview Scene

The Scene Editor should have a Preview Scene button.

Preview Scene tests one scene visually/functionally without needing to run the whole game structure.

Full route/game testing belongs to the Playtest tools in the Project Editor/Flatplan area.
