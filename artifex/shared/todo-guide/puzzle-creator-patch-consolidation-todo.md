# Puzzle Creator · Patch Consolidation To-Do

Status: active · one temporary wrapper remaining
Owner: Puzzle Creator
Related document: `artifex/shared/todo-guide/puzzle-creator-maze-labyrinth-update-steps.md`
Related global decision: `artifex/shared/todo-guide/global-portal-endpoint-registry-design-2026-05-29.md`
Started: 2026-05-27
Updated: 2026-05-29

This file is the active cleanup list for removing the temporary V1.11–V1.16 patch stack from Puzzle Creator. The app works better after the patch passes, but it must not keep accumulating versioned fix files.

## Why this cleanup exists

The Maze / Labyrinth editor was assembled through several versioned patch files after `main.js`. That was useful for fast recovery while testing, but it violates the file-structure direction for Puzzle Creator and makes future changes harder to reason about.

The consolidation rule remains active: do not start the newly approved major feature work until the remaining Completion Rules wrapper has been folded into a stable module and the current editor passes smoke testing.

## Current consolidation status

### Stable live modules now created or routed

- `src/js/engines/maze-labyrinth-runtime-controls.js`
- `src/js/engines/maze-difficulty-report.js`
- `src/js/engines/maze-runtime-status.js`
- `src/js/engines/maze-preview-default-layout.js`
- `src/js/engines/maze-ui-polish.js`
- `src/js/engines/maze-portals-system.js`

### One temporary transition remains

- `src/js/engines/maze-completion-system.js` still wraps `maze-v114-completion-rules.js`.

This must be replaced by a real stable Completion Rules module before new feature work begins.

### Versioned patch files to archive/delete after testing

- `src/js/engines/maze-v111-fixes.js`
- `src/js/engines/maze-v112-modal.js`
- `src/js/engines/maze-v113-polish.js`
- `src/js/engines/maze-v114-completion-rules.js`
- `src/js/engines/maze-v115-ui-polish.js`
- `src/js/engines/maze-v116-portals.js`

## Working behaviours that must survive consolidation

1. Generated mazes use the selected shape and enforce a border wall ring with defined entrance/exit openings.
2. Start Blank and Clear All create a clean editable selected shape with border walls and openings.
3. Walk Test supports WASD and arrow keys without page flashing.
4. Walk Test moves through open cells only and blocks walls/outside-shape cells.
5. Difficulty influences generation.
6. Solution status shows route analysis information.
7. Difficulty changes auto-regenerate generated mazes after a short delay.
8. Triangle remains disabled until its triangular route solver/shape grid is repaired.
9. Branded Difficulty Report behaviour is preserved until its content is merged directly into the Solution card.
10. Completion Rules export metadata is preserved during the stable rewrite.
11. Door/Portal placement works from Overview clicks.
12. Door/Portal markers appear on Overview and main Walk Test preview.
13. Walk Test transfer fires when the player steps onto a connected endpoint.
14. Connection metadata exports in JSON.
15. UI polish remains: emoji build buttons, Size on Display, Stretch X/Y on one row, icon glow, sticky icon area, smaller button text, default Overview position and tile-gap cleanup.

## Consolidation phases

### Phase 0 · Loader bridge

Status: completed

- Added `maze-labyrinth-consolidation-loader.js`.
- Moved `index.html` toward one Maze entrypoint.

### Phase 1 · Stable runtime and presentation modules

Status: mostly completed

Completed:

- Stable runtime/control module.
- Stable difficulty report module.
- Stable runtime status module.
- Stable preview default layout module.
- Stable UI polish module.
- Stable Doors/Portals system implementation.

Still required:

- Replace Completion Rules wrapper with an actual stable module.

### Phase 2 · Remove versioned patches

Status: pending final Completion Rules move and regression test

- Confirm no active `maze-v###-*` module remains in the live import chain.
- Delete or archive versioned patch files.
- Keep only permanent named modules.

### Phase 3 · Regression test

Status: pending

Test before implementing the approved redesign queue:

- Fresh Random, Start Blank and Clear All.
- Square, Pentagon, Hexagon and Circle regeneration; Triangle remains unavailable.
- Difficulty regeneration and solution status.
- Walk Test movement/collision.
- Doors/Portals placement and Walk Test transfer.
- Overview default positioning, resizing and drag/pan.
- Visual colours/textures and Close Tile Gaps.
- JSON export/import contains current maze, completion and connection data.

## Approved redesign queue after consolidation

The following changes have been approved in principle but should not be built as more temporary patches.

### Game Logic correction

1. Remove `Puzzle Type` from Maze / Labyrinth because it is metadata that does not alter the Maze engine and duplicates Completion Rules or separate puzzle engines.
2. Remove `Integration Context` because reusable Puzzle Creator output should not decide whether a puzzle is later used by a scene, quest or travel route.
3. Move Completion Rule out of Construction and into `03 · Game Logic`.
4. Limit Maze completion rules to required **Reach Exit** plus optional **Collect Objects Before Exit**.
5. Replace the current placeholder Items chip with real required-item setup rows, map placement and Archetype Object linking.

### Solution correction

6. Place the useful analysis content directly in the Solution card and remove the separate Analyse Difficulty button.
7. Show solution route by default for the maker/editor only.
8. Replace Plot Solution Path with `Show Solution` / `Hide Solution`.

### Connections redesign

9. Replace the current generic Portals card with **Connections**.
10. Doors remain visible paired local connections and require a door asset picker.
11. Traboules become separate hidden pass-through wall placements and must not be treated as a paired teleport type.
12. Portals become shared game-wide endpoints governed by the global Portal Registry design.

### Surface + Edit additions

13. Add a Scatter card for decorative lights and up to five decorative image slots.
14. Scatter items are image-only decoration with collision false and must avoid required gameplay cells.

### Later design work

15. Resolve Tunnel Mode decisions before implementing the roofed/first-person renderer and lighting workflow.
16. Build the helper crystal/pendant only after required-item objectives and connection routing are reliable.

## Do not continue until this is true

The live app should import stable modules only. It must not depend on versioned patch files after the Completion Rules move. Newly approved features must be implemented in permanent feature modules, not in additional numbered fixes or wrappers.
