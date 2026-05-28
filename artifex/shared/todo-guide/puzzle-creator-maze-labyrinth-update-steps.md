# Puzzle Creator · Maze / Labyrinth Update Steps

Status: consolidation in progress
Owner: Puzzle Creator
Related modules: Quest Builder, Scene Editor, Archetype Object Creator, Project Manager
Last updated: 2026-05-27

This document records the agreed update plan for the Maze / Labyrinth engine inside Puzzle Creator. The Maze engine is no longer just a canvas preview; it needs to become a graph-based puzzle editor with visual decoration layered on top.

## Current priority: Patch consolidation before new features

The current live editor reached V1.16 through stacked patch files. This was useful for fast testing, but it is now a maintenance risk. No new major feature pass should begin until the patch stack is consolidated into stable module names.

### Consolidation rule

Temporary version files must not keep accumulating. Working behaviour from V1.11–V1.16 should be moved into stable modules, then the version patch files should be removed from `index.html` and eventually deleted.

### Current temporary files to consolidate

- `maze-v111-fixes.js` **replaced in V1.18 by stable module `maze-labyrinth-runtime-controls.js`; keep old file only until V1.18 live smoke test passes.**
  - Generated maze runtime
  - Shape-aware generated maze creation
  - Clear All / Start Blank behaviour
  - Walk Test movement
  - Keyboard handling
  - Basic solver
  - Difficulty influence
  - Preview drawing
- `maze-v112-modal.js`
  - Branded Artifex report modal
  - Difficulty Report modal
- `maze-v113-polish.js`
  - Triangle temporarily disabled
  - Solution status box
  - Auto-regenerate on difficulty change
- `maze-v114-completion-rules.js`
  - Completion rule builder
  - Completion rule JSON export augmentation
- `maze-v115-ui-polish.js`
  - UI text cleanup
  - Emoji build buttons
  - Button tooltips
  - Icon glow cleanup
  - Display card layout adjustments
- `maze-v116-portals.js`
  - Portal builder
  - Portal placement on Overview
  - Portal markers
  - Walk Test teleporting
  - Portal JSON export augmentation

### Stable files to create or update

- `maze-labyrinth-runtime.js`
  - Owns base state, existing editor boot, palettes, and export shell.
- `maze-labyrinth-runtime-controls.js` **created in V1.18**
  - Owns shape-aware maze generation, matrix rebuilding, rendering override, walk test, keyboard movement, solution plotting, and difficulty basics.
- `maze-difficulty-report.js`
  - Owns difficulty report calculation and branded report display wiring.
- `maze-completion-rules.js`
  - Owns completion rule UI, state, validation status, required setup chips, and JSON export section.
- `maze-portals.js`
  - Owns portal state, UI, placement, markers, walk-test teleporting, and JSON export section.
- `maze-ui-polish.js`
  - Owns stable UI layout polish only if that code cannot be moved into CSS/HTML cleanly.
- `maze-shape-generator.js`
  - Keep as the permanent shape helper file.

### Consolidation steps

1. **Completed in V1.17:** add `maze-labyrinth-consolidation-loader.js` so `index.html` loads one Maze entrypoint instead of six separate version patch scripts.
2. **Started in V1.18:** move V1.11 runtime behaviour into stable runtime module `maze-labyrinth-runtime-controls.js` and replace the `maze-v111-fixes.js` import in the loader.
3. Move V1.12 modal behaviour into `maze-difficulty-report.js` or a shared Artifex modal module.
4. Move V1.13 polish behaviour into stable runtime/UI modules.
5. Move V1.14 completion behaviour into `maze-completion-rules.js`.
6. Move V1.15 UI polish into HTML/CSS or `maze-ui-polish.js`.
7. Move V1.16 portal behaviour into `maze-portals.js`.
8. Update `index.html` to load only stable modules.
9. Delete old version patch files after live testing passes.
10. Do a final smoke test: Fresh Random, Start Blank, Clear All, Size, Shape, Stretch, Warp, Difficulty, Plot Solution, Completion Rules, Portals, Walk Test, JSON export/import.

## Progress log

### V1.18 runtime controls consolidation started

Completed or started in V1.18:

- Created `maze-labyrinth-runtime-controls.js` as the stable module for the former V1.11 runtime/control patch behaviour.
- Updated `maze-labyrinth-consolidation-loader.js` to import `maze-labyrinth-runtime-controls.js` instead of `maze-v111-fixes.js`.
- Updated `index.html` to V1.18 cache/version markers.
- Reduced one temporary patch import from the active consolidation loader.

Still needs follow-up from V1.18:

- Confirm V1.18 loads from GitHub Pages.
- Smoke test Fresh Random, Start Blank, Clear All, Size, Shape, Stretch, Warp, Plot Solution, and Walk Test.
- If V1.18 behaves like V1.17/V1.16, delete `maze-v111-fixes.js` or keep it archived only if needed.
- Continue by moving V1.12 modal behaviour into `maze-difficulty-report.js`.

### V1.17 consolidation started

Completed or started in V1.17:

- Added `maze-labyrinth-consolidation-loader.js` as the single Maze entrypoint for the current patch stack.
- Updated `index.html` to V1.17 and reduced the script list to `main.js` plus the consolidation loader.
- Added this consolidation section to the to-do list.
- Marked patch consolidation as the active priority before adding any major new feature.

## Outstanding fixes before continuing features

### Runtime / maze generation

- Triangle is disabled because solution plotting and route solving are unreliable for triangular masks. Keep disabled until a proper triangle-specific route/shape strategy is implemented.
- Shape and Stretch should be native runtime behaviour, not patch-layer behaviour.
- Border walls must remain solid around every generated shape, with only defined entrance/exit openings.
- Start Blank should preserve hand-drawn work and should not auto-destroy manual layouts when display options change.
- Force Regenerate should always rebuild generated layouts reliably.

### Walk Test

- Walk Test should remain the editor movement/collision/path validation mode, not the final 3D simulation.
- Keyboard focus must remain stable and not flash/redraw the screen incorrectly.
- Player should not pass through walls or outside the valid shape area.
- D-pad highlight should match physical keyboard input.
- Portal teleporting should fire reliably when the player steps onto an entry/exit cell.

### Difficulty

- The current difficulty influence is acceptable for now but is still not the final meaningful-route algorithm.
- Full difficulty report should later count meaningful alternative routes, excluding tiny detours.
- Difficulty matching should not silently mutate the maze without a report/action choice.
- Portal routes should be excluded from difficulty matching by default unless explicitly included.

### Completion Rules

- Completion Rules UI is present, but required tabs/sections are placeholders.
- If Collect is enabled, the Items setup section still needs real object placement.
- If Unlock is enabled, the Locks setup section still needs real locked-door/key placement.
- If Portal is required, portal validation should confirm at least one required placed portal pair exists.
- Required setup chips should eventually drive red/yellow/green status on the icon bar.

### Portals

- Portal placement exists, but needs further live testing after consolidation.
- Portal markers should remain visible on Overview and Walk Test preview.
- Teleport status should show clearly when a portal fires.
- Required portals should be included in completion-rule validation.
- Portal routes should be ignored by difficulty analysis unless explicitly included.

### UI / export

- JSON export must include shape, size, stretch, warp, difficulty, completion rules, and portals.
- JSON import must restore those settings cleanly.
- The current inline HTML/CSS is still too dense and should later be split into stable CSS/HTML modules.
- The 3D View button is a placeholder and should either stay clearly marked or be hidden until the real first-person/tunnel renderer exists.

## Confirmed design corrections

- Maze / Labyrinth and Arena Trial are separate puzzle engines.
- Route Style should stay removed from Maze / Labyrinth because textures, painting, tunnel style, and visual presets own that job.
- There should always be exactly one entrance.
- Multiple exits may be allowed later, but Difficulty Matching should be disabled or warned when more than one exit exists.
- Escape paths means meaningful alternate routes through the maze, not separate exit doors and not tiny variations around one cell.
- Decorative lights and scattered objects should not require archetype objects. They are decoration-only placements, similar to non-interactive background props in Scene Editor.
- Other puzzle engines remain placeholders until detailed engine documents are provided.

## Display / testing mode definitions

1. **Diorama**: editor-friendly angled/top-down preview of the maze layout.
2. **Walk Test**: top-down/editor-map movement test for logic validation. It tests movement, collisions, route validity, portals, required objects, locks, helper guidance, and whether the player can reach the current objective.
3. **3D View**: future simulated first-person or 3D preview. This should eventually show tunnel/corridor view, roofed tunnel behaviour, lights, and first-person movement.

Walk Test is not the full 3D simulation. It is a practical editor validation mode. 3D View needs its own runtime pass.

## Pass 1 · Maze shell and construction cleanup

Status: mostly implemented, but still needs consolidation.

Completed or started:

- Removed Route Style.
- Removed Entrances.
- Added Size scale 1–5.
- Added Shape options, with Triangle currently disabled.
- Added Stretch X/Y and Warp.
- Added Start Blank and Clear All.
- Added shape-aware generation, border ring, entrance/exit placement, and solution plotting through patch/runtime work.
- Added Force Regenerate buttons.
- Added active Overview settings summary.

Remaining:

- Fully wire shape/mask code into stable runtime modules.
- Confirm Shape, Stretch X/Y, Warp, and Difficulty export/import cleanly.
- Replace temporary patch files with stable modules.

## Pass 2 · Walk Test and player movement

Status: partially implemented, needs consolidation and live testing.

Remaining:

- Confirm movement is stable after consolidation.
- Confirm portal teleporting fires correctly.
- Confirm D-pad highlight and keyboard input remain stable.
- Confirm player collision does not allow movement through walls or outside valid shape cells.

## Pass 3 · Difficulty analysis and report-based fixing

Status: basic implementation present; full meaningful-route algorithm still pending.

Remaining:

- Count meaningful route alternatives based on route-difference threshold.
- Exclude tiny detours.
- Exclude portal routes by default.
- Provide report actions before mutating the maze.

## Pass 4 · Completion rule builder

Status: UI and export started.

Remaining:

- Add real Items setup.
- Add real Locks setup.
- Validate required portals.
- Connect required setup chips to red/yellow/green status.

## Pass 5 · Portals

Status: UI, placement, markers, export, and Walk Test teleporting started.

Remaining:

- Consolidate into `maze-portals.js`.
- Live test teleporting after consolidation.
- Add validation for required portals.
- Keep portal routes excluded from difficulty unless explicitly included.

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

Keep these engines as placeholders until detailed documents are provided:

- Arena Trial
- Obstacle Course
- Symbol Assembly
- Item Order Puzzle
- Hazard Puzzle

After documents are provided, each engine should get a dedicated metadata file, runtime file, export contract, validation rules, and preview/render behaviour.

## Required file structure direction

```text
index.html
src/js/main.js
src/js/engines-ui.js
src/js/engines/maze-labyrinth.js
src/js/engines/maze-labyrinth-runtime.js
src/js/engines/maze-labyrinth-runtime-controls.js
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
