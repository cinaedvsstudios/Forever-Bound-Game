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


Artifex Project Editor & Flatplan Architecture

System Architecture and Functional Specification Document

Version: 1.0.0

Target Suitability: Game Engine Builders / Visual Node Managers

1. Executive Summary & Core Philosophy

The Artifex Project Editor is a visual design environment built specifically for compiling, editing, and mapping structural data for custom game engine ecosystems. At its heart lies the Flatplan—a node-link visualization canvas that treats abstract programming modules, scenes, and paths like a transit system (e.g., main stations, lines, side routes, and loops).

The project is governed by two major architectural principles:

Self-Referential Visual Programming ("Building the chicken inside the egg"): Artifex begins with primitive components. Users link these primitives to define complex, nested logical rules. Once saved, these groups collapse into a single new compound macro node that populates the Asset Manager catalog, enabling the system to recursively design and scale itself using its own output.

AI-in-the-Loop Integration: Decoupled layout and logic models allow users to export clean, coordinate-free logic documents for AI processing. The AI refines script terms, optimizes state routing, or writes developer documentation, and then streams the updated JSON back into Artifex. The system automatically merges the new logic over the spatial coordinates, safely updating the visual node graph without scrambling its physical layout on screen.

2. Visual Footprint & UI Layout

The Flatplan matches the existing dark, high-end visual layout of Artifex, utilizing deep charcoal backdrops and high-contrast neon violet/pink highlights.

+-----------------------------------------------------------------------------------------+
| [PORTAL]  Artifex  |  [Import]  [Download JSON]  [Blank Canvas]   [https://www.canva.com/menus/templates/bar/](https://www.canva.com/menus/templates/bar/)  |
+--------------------+--------------------------------------------------------------------+
| LEFT SIDEBAR       | LOWER-RIGHT VIEWING CANVAS                                         |
|                    |                                                                    |
| > Asset Manager    |   (Infinite Panning & Zoom Grid)                                   |
|   - Placeholders   |                                                                    |
|   - Real Assets    |             [Station: Node_A]                                      |
|                    |                    |                                               |
| > Inspector (Node) |                    | (Route / Quest Path Line)                     |
|   - Name: Station_1|                    v                                               |
|   - Scene: L1_Intro|             [Junction: Node_B]                                     |
|   - Script: init() |             /                \                                     |
|                    |            /                  \                                    |
| > JSON Preview     | [Waypoint: Node_C]      [Depot: Node_D]                            |
|                    |                                                                    |
+--------------------+--------------------------------------------------------------------+


2.1 The Top Bar (Global Controls)

Metadata Panel: Displays the active project ID, active template name (e.g., travel_scene_template.json), and file save targets.

Global Actions: Contains dropdowns for importing templates, downloading the final logic files, wiping the environment, and a textbox for loading remote JSON configurations.

The Portal Switch: Located on the far right. Switches the lower-right canvas view between the standard visual Scene Builder and the Flatplan node graph view.

2.2 The Left Sidebar (Collapsible Accordion Cards)

Asset Manager Card:

Placeholders: Generic shapes and color-coded boxes representing logical templates (e.g., Default Waypoint, Hub Depot) for quick drafting/greyboxing.

Real Assets: Visual elements, specific scene assets (e.g., actual background textures, game maps), and scene-bound logic controllers. Dragging items from here and dropping them on the canvas generates the corresponding node.

Component Inspector Card: Expands dynamically upon selecting any node or path on the canvas, providing input fields to manage properties, script callbacks, and text metadata.

JSON Preview Card: Displays a live, formatted, read-only preview of the active JSON files (logic.json or layout.json), rendering data changes on the fly.

2.3 The Infinite Canvas

Occupies the lower-right workspace.

Supports middle-click drag to pan the board in all directions and mouse-wheel scrolling to zoom.

Features floating canvas zoom widgets (+, O, -) locked in the upper right.

3. Element Taxonomy

To translate game development logic into a spatial transit map, Artifex defines nodes and lines under the following system definitions:

Element Name

Classification

Description / Functional Role

Scene

Visual Base

The visual asset, grid environment, or visual level template (the "egg").

Station

Logic Node

A Scene wrapped in functional scripts, events, triggers, and state constraints (the "chicken").

Depot

Hub Node

A major Station acting as a central hub. Governs global variables and acts as an intersection for multiple paths.

Junction

Utility Node

A specialized Station that splits path progress (player decisions/branches) or merges disparate logic streams.

Waypoint

Anchor Node

A minor navigational or decorative node on the map with minimal logic, used to curve routes.

Route

Connection

A standard visual and logical connection (edge) drawing paths between any two nodes.

Quest

Primary Path

A group of Routes establishing the mandatory storyline progression of the system.

Branch

Optional Path

An alternative side path splitting from a Junction to manage optional activities or optional logic.

Flatplan

Global Graph

The complete visual and logical network map containing all nodes, paths, and configurations.

4. Decoupled Multi-JSON Data Architecture

Artifex achieves clean AI interactions and structural stability by decoupling logic and layout properties into four independent JSON files:

4.1 logic.json (The Blueprint)

Stores only the logical relationships, types, script bindings, and metadata. No coordinate math or display variables are saved here. This clean format is passed to the AI.

{
  "projectId": "forever-bound-game",
  "nodes": [
    {
      "id": "node_station_01",
      "type": "Station",
      "properties": {
        "name": "Central Station Office",
        "description": "Initial starting sequence and database trigger configurations.",
        "onEnterTrigger": "init_level_variables",
        "linkedSceneId": "scene_level1_intro"
      }
    },
    {
      "id": "node_junction_01",
      "type": "Junction",
      "properties": {
        "name": "Story Split Fork",
        "decisionVariable": "player_alignment",
        "choices": ["Route_A_Quest", "Route_B_Branch"]
      }
    }
  ],
  "edges": [
    {
      "id": "edge_01",
      "source": "node_station_01",
      "target": "node_junction_01",
      "type": "Quest",
      "properties": {
        "animated": true,
        "lineColor": "#ff007f",
        "requiredKey": "stage1_complete"
      }
    }
  ]
}


4.2 layout.json (The Viewport)

Maintains absolute positioning, viewport coordinates, zoom/pan states, and style variables.

{
  "camera": {
    "zoom": 1.2,
    "panX": -150.45,
    "panY": 210.8
  },
  "nodes": [
    {
      "id": "node_station_01",
      "position": { "x": 120.0, "y": 250.0 },
      "visual": {
        "color": "neon-violet",
        "isCollapsed": false,
        "usePlaceholder": true
      }
    },
    {
      "id": "node_junction_01",
      "position": { "x": 450.0, "y": 250.0 },
      "visual": {
        "color": "neon-pink",
        "isCollapsed": false,
        "usePlaceholder": true
      }
    }
  ]
}


4.3 registry.json (The Catalog)

Holds the schemas for user-designed custom compound nodes (macros) for self-referential bootstrapping.

{
  "customMacros": [
    {
      "macroId": "macro_sub_depot",
      "label": "Sub-Depot Loop",
      "inputs": ["entry_point", "train_data"],
      "outputs": ["success_route", "fail_route"],
      "internalNodes": ["temp_node_1", "temp_node_2"],
      "internalEdges": ["temp_edge_1"]
    }
  ]
}


4.4 assets.json (The System Schema)

Maintains the file associations, texture paths, and default styles for placeholder nodes and real assets.

{
  "scenes": [
    {
      "assetId": "scene_level1_intro",
      "name": "Level 1 Introduction",
      "filepath": "/assets/scenes/level1_intro.scene",
      "thumbnailUrl": "/assets/thumbnails/l1_intro.png",
      "isPlaceholder": false
    }
  ],
  "placeholders": [
    {
      "placeholderId": "ph_std_station",
      "name": "Default Station Box",
      "defaultColor": "#9900ff"
    }
  ]
}


5. Canvas Interactions & Mechanical Rules

Drag-and-Drop Creation: Assets dragged from the sidebar are evaluated for mouse position on drop. Canvas calculates coordinates relative to panning and zoom factor, then spawns the element on the infinite board.

Aesthetic State Toggle: "Placeholder View" renders lightweight, clean geometric boxes with neon borders. "Real Asset View" instantly replaces placeholders with PNG/SVG textures without altering logical values.

Free-Form Connection Routing: By default, connections can link any node to any node. Logical constraints and connection type checks are deferred to compile-time analysis or flagged by the AI.

Border Snapping Vectors: Paths are drawn using SVG cubic Bezier curves in the background. The start and end positions of connection lines calculate distance to the bounding perimeters of nodes, automatically snapping curves to the nearest side or center point.

6. AI-in-the-Loop Workflow

             +--------------------+
             |   Visual Canvas    | <------------------------+
             +--------------------+                          |
                       |                                     |
              (Downloads logic.json)                 (Safe merge)
                       |                                     |
                       v                                     |
             +--------------------+                          |
             |     logic.json     |                          |
             +--------------------+                          |
                       |                                     |
                  (AI Input)                                 |
                       v                                     |
             +--------------------+                          |
             |   AI Refinement    | --- (Optimized File) ----+
             +--------------------+


Extraction: User downloads the active workspace. The exporter packages only the coordinate-free logical schema (logic.json).

Instruction Injection: Artifex copies custom prompt parameters (ai_instructions.txt) containing the transit taxonomy rules to the user's clipboard.

Execution: The user provides both files to the AI. The AI refines names, fixes logic loops, writes technical documentation, and optimizes route arrays.

Integration: User uploads the modified logic schema. Artifex performs a structural merge: it updates the keys and values inside logic.json while keeping local visual layouts (layout.json) completely intact. Nodes update with their new settings exactly where they sit on the board.

7. Structural Development Roadmap

  Phase 1: State         Phase 2: UI Shell     Phase 3: Viewport
+-------------------+  +-------------------+  +-------------------+
| Schemas, stores,  |  | Left sidebar,     |  | Pan, zoom, SVG    |
| and persistent    |==> accordion cards,  |==> Bezier lines &  |
| localStorage      |  | top control bars  |  | static renderers  |
+-------------------+  +-------------------+  +-------------------+
                                                        ||
  Phase 6: AI/IO         Phase 5: Binding       Phase 4: Drag/Drop
+-------------------+  +-------------------+  +-------------------+
| logic.json merge, |  | Two-way data      |  | Node movement,    |
| extraction, and   |<== inspect variables,|<== drawing routes, |
| prompt templates  |  | live JSON preview |  | asset placement   |
+-------------------+  +-------------------+  +-------------------+


Phase 1: Core Architecture & Data State

Create initial models and schemas for the four multi-JSON files.

Construct the core state-management container to store and read schemas.

Set up silent, reliable browser auto-saving into localStorage.

Phase 2: UI Shell Integration

Draft the CSS layouts matching the dark, neon violet Artifex design footprint.

Construct the global Top Bar, complete with action dropdowns, import forms, and the active view switch portal.

Structure the sidebar accordion tabs (Asset manager, selected property inspector, live code console).

Phase 3: The Canvas Engine (Rendering)

Write event listeners for wheel scaling and pointer coordinate tracking for panning/zooming.

Create the rendering loops to draw HTML <div> nodes inside the viewport matrix.

Set up the absolute-positioned SVG layer to draw smooth, curved connecting routes between coordinates.

Phase 4: Core Interactions

Implement the coordinate math to drag-and-drop elements from sidebar drawers onto the panning stage.

Implement pointer event handlers to handle dragging nodes, instantly triggering SVG path recalculations.

Write line-drawing tools with border-snapping logic to connect stations visually.

Phase 5: Component Logic & Data Binding

Map mouse click selection events to pass selected IDs directly to the Property Inspector.

Implement active binding: editing parameters in the Inspector immediately changes node values, colors, and types.

Feed code output into the live preview code block.

Phase 6: I/O and AI Pipeline

Create export modules to extract logic schemas from spatial coordinates.

Build the merge algorithms that safely stitch logical updates back over the visual grid.

Package the AI templates and instructions generator.
