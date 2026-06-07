# Core Vision

## Core Direction

Artifex should not be the Forever Bound editor.

Artifex should be a reusable game-building system made from a starter game template, a visual editor, a project editor, a creation guide, logic tools, playtest tools, and a build/export process.

Forever Bound should remain a separate finished game made with Artifex. It may later be referenced as an example of a completed project, but it should not be bundled into Artifex or hardcoded into the template.

## Template Game

The default template game should be called **Artifex Adventures**.

Artifex Adventures should be a very simple working game containing one example of every important system. The creator can then duplicate, replace, rename, and expand those working examples.

The template should include:

- one hero
- one villain
- one title screen
- one map or structure view
- one playable scene
- one travel route
- one dialogue example
- one item
- one enemy
- one marker / waypoint
- one quest
- one side quest / branch example if practical
- one ending or victory screen
- one example of each core interaction system

## Main User Flow

The user should be able to:

1. Open Artifex.
2. Create a new project from Artifex Adventures.
3. Follow the Creation Guide.
4. Replace template content with their own.
5. Duplicate template objects/scenes when needed.
6. Connect scenes and screens in the Project Editor.
7. Define quests and progression.
8. Playtest the project.
9. Build/export a playable browser game.

## Core Principle

Artifex should not ask users to build a game engine from nothing.

The Runtime Engine already exists inside the template/project structure. Users mostly work above that layer by changing project data, replacing assets, duplicating working examples, connecting routes, and configuring quests.

This keeps Artifex realistic, reusable, and easier to build.
