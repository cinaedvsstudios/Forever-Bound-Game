# Puzzle Creator · Maze / Labyrinth Update Steps

Status: planned
Owner: Puzzle Creator
Related modules: Quest Builder, Scene Editor, Archetype Object Creator, Project Manager
Last updated: 2026-05-27

This document records the agreed update plan for the Maze / Labyrinth engine inside Puzzle Creator. It exists because the Maze engine is no longer just a canvas preview; it needs to become a graph-based puzzle editor with visual decoration layered on top.

## Confirmed design corrections

- Maze / Labyrinth and Arena Trial are separate puzzle engines.
- Route Style should be removed from Maze / Labyrinth because textures, painting, tunnel style, and visual presets already own that job.
- There should always be exactly one entrance.
- Multiple exits may be allowed later, but Difficulty Matching should be disabled or warned when more than one exit exists.
- Escape paths means meaningful alternate routes through the maze, not separate exit doors and not tiny variations around one cell.
- Decorative lights and scattered objects should not require archetype objects. They are decoration-only placements, similar to non-interactive background props in Scene Editor.
- Other puzzle engines remain placeholders until detailed engine documents are provided.

## Pass 1 · Maze shell and basic construction cleanup

1. Remove Route Style from the Maze / Labyrinth engine fields.
2. Rename Grid Resolution to Size.
3. Replace raw grid values with Size 1–5:
   - 1 = 11
   - 2 = 15
   - 3 = 20
   - 4 = 25
   - 5 = 30
4. Interpret Size by shape:
   - Triangle: side length
   - Square: width and height
   - Pentagon: longest side-to-side span before stretch
   - Hexagon: longest side-to-side span before stretch
   - Circle: longest diameter before stretch
5. Replace Layout Shape with named shape choices:
   - Triangle
   - Square
   - Pentagon
   - Hexagon
   - Circle
6. Add Stretch X and Stretch Y controls.
7. Keep Warp as a separate distortion control, applied after shape and stretch.
8. Add Start Blank.
9. When Start Blank is used, lock advanced options until there is a valid entrance-to-exit route.
10. Regenerate entrance and exit whenever Size, Shape, Stretch X, or Stretch Y changes.

## Pass 2 · Walk Test and player movement

1. Fix Walk Test so clicking the button switches into real playable movement mode.
2. Ensure keyboard focus is captured reliably.
3. Support WASD and arrow keys.
4. Move the player marker/camera through open cells only.
5. Prevent movement through walls and invalid masked-out shape areas.
6. Highlight the matching on-screen D-pad key when the physical keyboard key is pressed.
7. Reset player position to the entrance when the maze is regenerated or the shape changes.

## Pass 3 · Difficulty analysis and report-based fixing

1. Replace silent difficulty mutation with a report-and-fix flow.
2. When a difficulty target is selected, analyse the current maze and report:
   - current meaningful route count
   - target route count
   - whether portals were excluded
   - whether multiple exits disable difficulty matching
   - what changes are required
3. Difficulty mapping:
   - 5 = 1 meaningful route
   - 4 = 2 meaningful routes
   - 3 = 3 meaningful routes
   - 2 = 4 meaningful routes
   - 1 = 5 meaningful routes
4. Meaningful route alternatives should only count if they differ from another route by a configured threshold, likely 20–30% of route cells.
5. Tiny detours around one cube should not count as separate escape paths.
6. Suggested report actions should include:
   - add blocking walls to side branches
   - remove blocks to open additional meaningful branches
   - convert branches into dead ends
   - cancel and leave maze unchanged
7. Do not apply route changes until the user chooses a report action.

## Pass 4 · Completion rule builder

1. Replace the simple completion dropdown with a rule builder.
2. Base completion rule: Reach exit.
3. Optional requirements:
   - Collect objects, then reach exit
   - Unlock door, then reach exit
   - Collect objects and unlock door, then reach exit
   - Use required portal
   - Survive or avoid hazard
   - Defeat foe
   - Custom flag condition
4. Reuse Place Object logic for collectable objects.
5. Use objects from the Archetype Object library where gameplay matters.
6. For locked doors, reuse locked-door archetype objects where possible.
7. If Collect is enabled, add an Items tab/icon.
8. If Unlock is enabled, add a Locks tab/icon.
9. Required tabs should glow red/yellow/green based on completion state.

## Pass 5 · Portals

1. Add a Portals section in Game Logic.
2. Add portal pairs by clicking the Overview grid:
   - click entry cell
   - click exit cell
3. Each pair should have:
   - label, such as A, B, C
   - entry cell
   - exit cell
   - one-way or two-way setting
   - visible door / hidden passage / magic portal setting
   - optional required object/key
   - optional Capra hint text
   - whether it is required or optional
4. Portal routes should be excluded from Difficulty Matching by default.
5. Add a later option to include portals in route analysis only if explicitly enabled.

## Pass 6 · Tunnel Mode

1. Add a Tunnel Mode toggle in Construction.
2. Tunnel Mode rules:
   - adds a roof
   - forces first-person / Walk Test for gameplay
   - hides the full layout during play
   - keeps Overview available during construction
   - exports tunnel/covered metadata
3. Add tunnel style choices:
   - Square Tunnel
   - Natural Cave
   - Pipe
   - Prism
4. Natural Cave should fake uneven rock walls and roof.
5. Pipe should fake a rounded tunnel.
6. Prism should fake angular faceted surfaces.
7. A dedicated tunnel runtime should be added later for a better first-person preview.

## Pass 7 · Tunnel lights

1. Add tunnel light controls:
   - enable lights
   - light spacing every X cells
   - light style selector
   - upload custom light PNG
   - light colour
   - light intensity
   - pulse/flicker toggle
2. Default light styles:
   - Torch
   - Lantern
   - Aetheris Glow
   - Runestone Glow
   - Underworld Pulse
3. Auto-place lights along corridors by spacing.
4. Avoid entrance and exit cells unless allowed.
5. Export lights as decorative placements, not archetype objects unless promoted later.

## Pass 8 · Decorative scatter objects

1. Add Scatter Objects as a decorative system.
2. Decorations should not require archetype objects.
3. Controls:
   - upload decoration PNGs
   - choose default decoration images
   - scatter density
   - placement rule: path only / wall edges / corners / dead ends / open spaces
   - avoid entrance
   - avoid exit
   - avoid required object cells
   - optionally avoid main solution path
   - random seed
   - clear scattered objects
4. Export decorations as lightweight visual placements:
   - asset source
   - cell position
   - offset
   - scale
   - rotation
   - layer
   - collision false

## Pass 9 · Helper system

1. Add helper guidance modes:
   - Off
   - Subtle
   - Normal
   - Strong
2. Helper should glow when the player is on a meaningful solution route.
3. Helper should pulse brighter when getting closer to the current objective.
4. Helper should dim when moving away or entering a wrong branch.
5. Helper should recalculate objective order:
   - required objects first
   - locks/doors next
   - required portal if applicable
   - exit last
6. Helper logic depends on Walk Test and path analysis, so it should not be built before those work.

## Pass 10 · Other puzzle engines

1. Keep these engines as placeholders until detailed documents are provided:
   - Arena Trial
   - Obstacle Course
   - Symbol Assembly
   - Item Order Puzzle
   - Hazard Puzzle
2. After documents are provided, each engine should get:
   - dedicated engine metadata file
   - dedicated runtime file
   - export contract
   - validation rules
   - preview/render behaviour

## Required file structure direction

The Puzzle Creator should avoid giant files.

Recommended split:

```text
index.html
src/js/main.js
src/js/engines-ui.js
src/js/engines/maze-labyrinth.js
src/js/engines/maze-labyrinth-runtime.js
src/js/engines/maze-shape-generator.js
src/js/engines/maze-route-analyzer.js
src/js/engines/maze-difficulty-report.js
src/js/engines/maze-completion-rules.js
src/js/engines/maze-portals.js
src/js/engines/maze-tunnel-mode.js
src/js/engines/maze-decorations.js
src/js/engines/maze-helper-system.js
```

## Implementation warning

Do not make label-only changes unless the underlying behaviour is also implemented or clearly marked as placeholder metadata. Every visible control should either work, be hidden, or be explicitly disabled with an explanation.
