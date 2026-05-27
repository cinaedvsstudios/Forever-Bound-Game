# Puzzle Creator · Maze / Labyrinth Update Steps

Status: in progress
Owner: Puzzle Creator
Related modules: Quest Builder, Scene Editor, Archetype Object Creator, Project Manager
Last updated: 2026-05-27

This document records the agreed update plan for the Maze / Labyrinth engine inside Puzzle Creator. It exists because the Maze engine is no longer just a canvas preview; it needs to become a graph-based puzzle editor with visual decoration layered on top.

## Progress log

### V1.08 quick fix

Completed in V1.08:

- Changed the Puzzles selector from a horizontal title-bar bank into a dropdown menu placed before File.
- Kept puzzle options as one-word entries: Maze, Arena, Course, Symbol, Order, Hazard.
- Reduced header layout pressure so the title bar should not push controls off screen.
- Fixed the image reference upload layout so selecting a file should not create a blank space at the bottom of the page.
- Moved the image filename status outside the upload button so the button height stays stable.

Still needs live check:

- Confirm Puzzles dropdown opens cleanly and all six modes still switch correctly.
- Confirm Use image as map reference opens the file picker without adding blank bottom space.
- Confirm the Construction, Display, Logic, and Visuals buttons remain visible after upload.

### V1.07 started

Completed or started in V1.07:

- Moved the puzzle engine buttons into a labelled Puzzles bank beside the title/menu area. **Revised in V1.08: now a dropdown before File.**
- Changed puzzle engine buttons to one-word labels: Maze, Arena, Course, Symbol, Order, Hazard.
- Removed Route Style from the Maze / Labyrinth engine fields.
- Removed Entrances from the Maze / Labyrinth engine fields.
- Renamed Grid Resolution to Size in the UI.
- Added Size scale 1–5 using 1=11, 2=15, 3=20, 4=25, 5=30.
- Added named shape choices: Triangle, Square, Pentagon, Hexagon, Circle.
- Added Stretch X and Stretch Y controls.
- Kept Warp as a separate distortion control after shape and stretch.
- Added Start Blank.
- Added basic Start Blank advanced-lock behaviour for Warp until a valid entrance-to-exit route exists.
- Added initial shape masking for Triangle, Square, Pentagon, Hexagon, and Circle.
- Added entrance/exit regeneration after size and shape changes.
- Hid ugly native file inputs behind styled buttons/labels for image and JSON import. **Revised in V1.08 after upload layout issue.**
- Changed Apply Difficulty to Analyse Difficulty so it does not silently mutate the maze.
- Added a placeholder difficulty analysis alert explaining that the full meaningful-route report/fix tool is a later pass.

Still needs follow-up/testing from Pass 1:

- Verify the new shape masks look clean at all five sizes.
- Verify Triangle is actually triangular and not pentagon-like.
- Verify Start Blank + Draw creates valid manual mazes correctly.
- Verify entrance and exit placement is sensible for every shape.
- Move shape-generation logic into a dedicated `maze-shape-generator.js` file instead of keeping it inside the runtime.
- Confirm V1.08 loads from GitHub Pages without a syntax/runtime error.

## Confirmed design corrections

- Maze / Labyrinth and Arena Trial are separate puzzle engines.
- Route Style should be removed from Maze / Labyrinth because textures, painting, tunnel style, and visual presets already own that job. **Completed in V1.07.**
- There should always be exactly one entrance.
- Multiple exits may be allowed later, but Difficulty Matching should be disabled or warned when more than one exit exists.
- Escape paths means meaningful alternate routes through the maze, not separate exit doors and not tiny variations around one cell.
- Decorative lights and scattered objects should not require archetype objects. They are decoration-only placements, similar to non-interactive background props in Scene Editor.
- Other puzzle engines remain placeholders until detailed engine documents are provided.

## Pass 1 · Maze shell and basic construction cleanup

Status: mostly started/completed in V1.07; V1.08 fixed header/dropdown and upload layout regressions; testing and file split still needed.

Completed:

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
11. Move Puzzles into a dropdown before File.
12. Hide native file inputs behind stable styled controls.

Remaining Pass 1 cleanup:

1. Test all five shapes at all five sizes.
2. Confirm route validation and Start Blank lock behave correctly after manual drawing.
3. Move shape/mask code out of `maze-labyrinth-runtime.js` into `maze-shape-generator.js`.
4. Confirm Shape, Stretch X/Y, and Warp export cleanly and reload from JSON.
5. Confirm the image reference file picker does not create layout gaps or hide buttons.

## Pass 2 · Walk Test and player movement

1. Fix Walk Test so clicking the button switches into real playable movement mode.
2. Ensure keyboard focus is captured reliably.
3. Support WASD and arrow keys. **Partially present before V1.07; needs live test.**
4. Move the player marker/camera through open cells only. **Partially present before V1.07; needs live test.**
5. Prevent movement through walls and invalid masked-out shape areas. **Invalid shape-area check added in V1.07; needs live test.**
6. Highlight the matching on-screen D-pad key when the physical keyboard key is pressed. **Partially present before V1.07; needs live test.**
7. Reset player position to the entrance when the maze is regenerated or the shape changes. **Updated in V1.07; needs live test.**

## Pass 3 · Difficulty analysis and report-based fixing

1. Replace silent difficulty mutation with a report-and-fix flow. **Started in V1.07 by removing silent mutation and adding an Analyse Difficulty placeholder.**
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
