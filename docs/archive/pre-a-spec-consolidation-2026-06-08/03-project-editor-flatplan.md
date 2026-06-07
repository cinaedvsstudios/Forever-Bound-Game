# Project Editor and Flatplan

## Purpose

The Project Editor is the higher-level game-structure editor.

It is where separate screens, scenes, quests, branches, and project files become a connected playable game.

The Project Editor should contain:

- Project Manifest
- Flatplan
- Flatplan Catalog
- Stitcher / connection logic
- Routes
- game structure
- start screen assignment
- player map projection if needed
- project-level import/export for structure data
- structure-level Build Prep

The Scene Editor creates visual scenes and screens. The Project Editor connects those completed pieces into the wider game structure.

## Module Boundary

The Project Editor is the central wiring board, but it is not the whole game builder by itself.

It should reference content created in other modules:

- Screens and Scenes from the Scene Editor.
- Archetypes from the Object Library.
- Quests, Branches, Flags, and Conditions from the Quest Builder.
- Milestone/checklist status from the Creation Guide.

It should not fully own or replace those modules.

## Suggested Project Editor Workspaces

The Project Editor should use a workspace switcher rather than a simple binary toggle.

Suggested workspaces:

```text
Manifest | Flatplan | Stitcher | Build Prep
```

### Manifest Workspace

The setup/index workspace.

It handles project metadata, file references, start screen, enabled modules, project indexes, and structure file references.

### Flatplan Workspace

The visual canvas workspace.

It handles the train-map-style canvas, Flatplan Catalog, Stations/Nodes, Depots, Junctions, Waypoints, Routes, Map Projection overlay, and contextual playtest buttons.

### Stitcher Workspace

The route/logic workspace.

It handles route logic, triggers, conditions, unlocks, item gates, quest gates, button actions, entry rules, and exit rules.

### Build Prep Workspace

The structure-review workspace.

It handles Project Editor-level validation and structure export/import before final Build Game packaging.

This is not the same as the Creation Guide and not the same as the final Build Game app.

Build Prep asks: is the Flatplan/project structure coherent enough to hand to the runtime/build process?

## Diagnosis / Validation Split

Avoid using one vague “Diagnosis” workspace for everything.

Use this split instead:

- **Creation Guide health summary** = what still needs doing, what milestones are incomplete, what setup is missing.
- **Project Editor Build Prep** = whether the Flatplan/project structure is coherent enough to hand to the runtime/build process.
- **Build Game validation** = whether the final playable package can be generated safely.

Examples:

- Creation Guide: title screen not reviewed, first scene not complete, milestone missing.
- Project Editor: route points nowhere, no start node, station has no linked scene, impossible progression.
- Build Game: missing files, invalid JSON, unresolved assets, export package not ready.

## Core Principle

A Scene is visual/layout data.

A completed Scene or Screen can be added to the Project Editor’s Flatplan Catalog.

Once placed on the Flatplan and given functional logic, that Scene/Screen becomes a Station/Node.

The Project Editor should not replace the Scene Editor. It should sit above it and decide how finished scenes, screens, quests, branches, and routes connect together.

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
- asset/catalog data
- export/build settings

The Manifest is not the same as the Flatplan. The Manifest is the project index. The Flatplan is the visual structure map.

## Flatplan

The Flatplan is the creator-facing structure view of the whole game.

It is not the player’s in-game map.

It should be visualized like a train map rather than a straight linear timeline. It can show a main quest path, optional branches, side quests, dead ends, loops, depots, junctions, waypoints, locked areas, hidden areas, and endings.

The Flatplan should show how all major game parts connect.

## Flatplan Catalog

The Project Editor sidebar should use the term **Flatplan Catalog**, not Asset Manager.

The Flatplan Catalog is the list of things that can be placed onto the Flatplan.

It can include:

- completed screens from the Scene Editor
- completed playable scenes from the Scene Editor
- title screens
- menu screens
- ending screens
- quests from the Quest Builder
- side quests / branches from the Quest Builder
- depots
- junctions
- waypoints
- route templates
- placeholder structures
- reusable Flatplan elements
- compound nodes / macro structures if added later

The Flatplan Catalog is different from the Scene Editor Asset Library.

- **Asset Library** = raw files such as images, audio, sprites, backgrounds, icons, and UI pieces.
- **Object Library** = reusable game things and behaviours, such as characters, enemies, items, doors, props, and markers.
- **Flatplan Catalog** = completed project structures that can be placed onto the Flatplan.

## Station / Node Concept

The name is not locked yet.

A basic visual Scene becomes a Station/Node once it is placed into the Flatplan and given game logic.

A Scene is visual/layout data.

A Station/Node is that scene once it has connections, conditions, quest relevance, routes, entry/exit logic, or progression meaning.

Example:

- `forest_path.scene` is a Scene.
- When placed on the Flatplan, connected to other scenes, and given entry/exit logic, it becomes a Station/Node.

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

Map Projection should live inside the Flatplan Workspace as a layer/toggle rather than becoming a separate module.

## Playtest Entry Points

The Project Editor should expose contextual playtest entry points without owning the whole Playtest module.

Examples:

- Play from selected Station/Node.
- Test selected Route.
- Play from Depot.
- Play from Junction.
- Test route from A to B.
- Play with selected fake flags/items enabled.

The shared Playtest module should perform the actual testing.

## Relationship To Object Library

The Project Editor references Object Library archetypes when it needs reusable things in structure logic.

Example:

- Object Library defines `bronze_key` as an Item Archetype.
- Project Editor uses `bronze_key` as a requirement on a locked Route.

The Project Editor should not be where the Bronze Key is fully authored. That belongs in Object Library.

## Relationship To Quest Builder

The Project Editor references Quest Builder data when it needs quest/progression logic.

Example:

- Quest Builder defines `q01_find_key` and the flag `key_collected`.
- Project Editor uses `quest_complete:q01_find_key` or `flag_true:key_collected` as a Route condition.

The Project Editor should not be where the full Quest is authored. That belongs in Quest Builder.

## Relationship To Creation Guide

The Project Editor can report status to the Creation Guide and receive task/milestone context from it.

Example:

- Creation Guide says “connect first route” is incomplete.
- User opens Project Editor.
- User connects the first two Stations.
- Creation Guide can mark that Milestone as complete.

The Creation Guide guides and tracks work. The Project Editor edits structure.

## Data Architecture

The Project Editor should separate logic from layout so the visual Flatplan is stable and AI/tools can edit game logic without scrambling the canvas.

A possible structure is:

- `project.json` — project manifest and high-level project metadata.
- `logic.json` — Flatplan relationships, node types, route conditions, quest links, and functional metadata.
- `layout.json` — canvas positions, zoom, pan, collapsed states, and visual display settings.
- `registry.json` — reusable compound nodes, macro structures, or saved Flatplan patterns.
- `catalog.json` — Flatplan Catalog entries available for placement, including completed screens/scenes, quests, branches, placeholder structures, thumbnails, and route templates.

### logic.json

Stores logical relationships and metadata.

It should avoid canvas coordinates.

This is the clean file that can be passed to AI or other logic tools.

Example data:

```json
{
  "projectId": "example-game",
  "nodes": [
    {
      "id": "node_station_01",
      "type": "Station",
      "properties": {
        "name": "Forest Entrance",
        "linkedSceneId": "scene_forest_entrance",
        "onEnterTrigger": "intro_seen"
      }
    }
  ],
  "routes": [
    {
      "id": "route_01",
      "source": "node_station_01",
      "target": "node_junction_01",
      "type": "Quest",
      "conditions": ["quest_started:q01"]
    }
  ]
}
```

### layout.json

Stores the visual canvas layout.

It should include positions, zoom, pan, colour choices, collapsed states, and display settings.

This file should not need to change when AI edits logic.

Example data:

```json
{
  "camera": {
    "zoom": 1.2,
    "panX": -150,
    "panY": 210
  },
  "nodes": [
    {
      "id": "node_station_01",
      "position": { "x": 120, "y": 250 },
      "visual": {
        "color": "violet",
        "isCollapsed": false
      }
    }
  ]
}
```

### registry.json

Stores reusable compound Flatplan structures.

This is for later, not first priority.

A compound structure could be a saved mini-network of nodes and routes that can be reused in multiple projects.

Examples:

- side quest pattern
- locked door + key pattern
- depot with three branch routes
- choice junction with two outcomes
- intro sequence pattern

### catalog.json

Stores the Flatplan Catalog entries available to place on the Flatplan.

This is not just raw assets.

It should include references to completed screens, scenes, quests, branches, depots, junctions, waypoints, route templates, placeholders, thumbnails, and saved macro structures.

## AI-Safe Logic Workflow

The Project Editor should eventually support an AI-safe workflow.

The important rule is: AI can edit logic without destroying layout.

Possible workflow:

1. User exports `logic.json`.
2. Artifex optionally copies prompt instructions that explain the Flatplan terminology and rules.
3. User gives the logic file and instructions to AI.
4. AI refines names, checks route logic, improves conditions, writes documentation, or suggests structure improvements.
5. User imports the modified `logic.json`.
6. Artifex merges logical updates back into the project while preserving `layout.json`.
7. Existing nodes remain where they are on the canvas.

This is useful, but it should come after the basic Project Editor works.

## Canvas and Interaction Rules

The Flatplan canvas should support:

- infinite or large panning workspace
- mouse/touch panning
- zoom in/out/reset
- drag/drop from the Flatplan Catalog
- selecting nodes/routes
- editing selected properties in an inspector
- live JSON preview
- drawing routes between nodes
- moving nodes without breaking route logic
- route lines updating when nodes move
- placeholder view and real/project view if useful

Connections can initially be flexible. Strict validation can happen through Project Health Check or Build Game validation.

## UI Layout

The Project Editor should visually match the rest of Artifex.

Suggested layout:

- top bar for project metadata, import/download, view switching, and global actions
- workspace switcher for Manifest / Flatplan / Stitcher / Build Prep
- left sidebar for Flatplan Catalog, selected item inspector, and JSON preview
- main canvas for the Flatplan graph
- floating zoom controls on the canvas

The sidebar should not be called Asset Manager. It should be called Flatplan Catalog.

## Development Roadmap

### Phase 1: Data State

- define initial Project Editor schemas
- create state container for project/flatplan data
- support local autosave if practical
- separate logic data from layout data

### Phase 2: UI Shell

- build Project Editor folder/app shell
- add top bar
- add workspace switcher
- add Flatplan Catalog sidebar
- add selected item inspector
- add JSON preview
- match Artifex visual style

### Phase 3: Canvas Engine

- implement panning
- implement zooming
- render nodes on canvas
- render route lines
- keep route lines connected when nodes move

### Phase 4: Core Interactions

- drag items from Flatplan Catalog onto canvas
- move nodes
- select nodes/routes
- edit node properties
- connect nodes with routes
- delete nodes/routes

### Phase 5: Data Binding

- connect inspector fields to node/route data
- update JSON preview live
- save project editor state
- separate logic changes from layout changes

### Phase 6: Import / Export / AI Workflow

- export logic data
- import logic data
- merge imported logic without changing layout
- create prompt/instruction helper for AI review

This phase should come after the basic local Project Editor is usable.

## Current Transport-Style Logic

The current metaphor is:

- The Flatplan contains Stations connected by Routes.
- Some Stations are Depots.
- Some Stations are Junctions.
- Some points are Waypoints.
- A Quest is the main playable objective path through selected Stations and Routes.
- A Branch is an optional side quest/path.
- The Stitcher/Route Builder defines how those connections work.

## Notes To Keep In Mind

Do not let the Project Editor become a full visual programming language before the basic structure editor works.

The first usable version should focus on:

- placing completed screens/scenes on the Flatplan
- connecting them with routes
- identifying depots/junctions/waypoints
- assigning start screen
- connecting quests/branches at a basic level
- exporting a readable structure file

Compound nodes, macro structures, and AI-safe merge are useful later features, but should not block the first version.