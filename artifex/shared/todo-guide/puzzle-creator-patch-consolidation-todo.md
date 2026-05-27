# Puzzle Creator · Patch Consolidation To-Do

Status: active
Owner: Puzzle Creator
Related document: `artifex/shared/todo-guide/puzzle-creator-maze-labyrinth-update-steps.md`
Started: 2026-05-27

This file is the active cleanup list for removing the temporary V1.11–V1.16 patch stack from Puzzle Creator. The current app works better after the patch passes, but it must not keep accumulating versioned fix files.

## Why this cleanup exists

The Maze / Labyrinth editor currently loads several versioned patch files after `main.js`. That was useful for fast recovery while testing, but it violates the file-structure direction for Puzzle Creator and makes future work harder to reason about.

The consolidation rule is now active: no new major feature work should be added until the patch stack is folded into stable modules or converted into clearly named permanent feature modules.

## Current patch stack to remove

Temporary patch files currently in use:

- `src/js/engines/maze-v111-fixes.js`
- `src/js/engines/maze-v112-modal.js`
- `src/js/engines/maze-v113-polish.js`
- `src/js/engines/maze-v114-completion-rules.js`
- `src/js/engines/maze-v115-ui-polish.js`
- `src/js/engines/maze-v116-portals.js`

Phase 0 started with:

- `src/js/engines/maze-labyrinth-consolidation-loader.js`

This loader is only a temporary bridge. It lets `index.html` move toward one Maze entry point while the behaviour is migrated into proper files.

## Outstanding fixes to preserve during consolidation

Do not lose these working behaviours when moving code:

1. Generated mazes must use the selected shape and enforce a border wall ring with entrance/exit openings.
2. Start Blank and Clear All must create a clean editable selected shape with border walls and openings.
3. Plot Solution Path must calculate a route through the current matrix.
4. Walk Test must support WASD and arrow keys without page flashing.
5. Walk Test must move the player through open cells only.
6. Walk Test must block walls and invalid outside-shape cells.
7. Difficulty must influence regeneration.
8. The Solution status box must show route length, target meaningful route count, and branch-cell count.
9. Difficulty changes must auto-regenerate generated mazes after a short delay.
10. Triangle must remain disabled until the triangular route solver/shape grid is repaired.
11. The branded Difficulty Report modal must replace browser alerts.
12. Completion Rules must export `completionRules` metadata.
13. Portal placement must work from Overview clicks.
14. Portal markers must appear on the Overview and main Walk Test preview.
15. Walk Test must teleport the player when the player steps onto or close enough to a portal entry/exit.
16. Portal metadata must export in JSON.
17. The UI polish must remain: emoji build buttons, Size on Display, Stretch X/Y on one row, icon glow, and reduced helper text.

## Consolidation phases

### Phase 0 · Loader bridge

Status: started

Tasks:

- Add `maze-labyrinth-consolidation-loader.js`.
- Move `index.html` from multiple versioned patch script tags to one Maze consolidation loader script.
- Confirm live page still behaves the same after the loader change.

### Phase 1 · Permanent runtime modules

Status: pending

Create or update these stable modules:

- `maze-labyrinth-runtime.js` for core state, generated maze runtime, walk test, player movement, preview drawing, and export hooks.
- `maze-route-analyzer.js` for route solving, branch/dead-end counts, route length, and later meaningful-route analysis.
- `maze-difficulty-report.js` for branded difficulty reporting and report/fix flow.
- `maze-completion-rules.js` for completion rule builder and JSON export.
- `maze-portals.js` for portal UI, marker drawing, teleport logic, and JSON export.
- `maze-ui-polish.js` or merge UI polish into `main.js` / app CSS if it is not Maze-specific.

### Phase 2 · Remove versioned patches

Status: pending

After the stable modules are working:

- Remove all `maze-v###-*` scripts from `index.html`.
- Delete versioned patch files from `src/js/engines/`.
- Keep only permanent modules.
- Confirm no `maze-v` files are loaded by the app.

### Phase 3 · Regression test

Status: pending

Test before moving to new features:

- Fresh Random works.
- Start Blank works.
- Clear All works.
- Square, Pentagon, Hexagon, and Circle regenerate cleanly.
- Triangle remains unavailable/disabled.
- Difficulty auto-regenerates generated mazes.
- Solution status updates.
- Plot Solution Path works.
- Walk Test movement works without flashing.
- Portal placement works.
- Portal teleport works in Walk Test.
- JSON export contains maze data, completion rules, and portals.

## Do not continue until this is true

`index.html` should load a small stable set of scripts, preferably:

```html
<script type="module" src="src/js/main.js?v=..."></script>
<script type="module" src="src/js/engines/maze-labyrinth.js?v=..."></script>
```

or one equivalent permanent Maze entry point.

It should not load a chain of versioned patch files.
