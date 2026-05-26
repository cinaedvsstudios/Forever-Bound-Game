# Artifex Maze Maker

This is a cleaned-up, split-file version of the uploaded `maze.html` prototype, rebuilt as an Artifex Puzzle Maker module for Forever Bound.

## What it does

- Loads or generates a 2D maze.
- Parses image regions into wall/path cells.
- Shows a 2D analyzer matrix.
- Builds a Three.js 3D preview.
- Allows simple paint, section paint, and draw/erase editing.
- Solves the maze with breadth-first search.
- Exports game-readable JSON using schema `cinaedvs.artifex.maze.v1`.
- Keeps the exported JSON data-driven so the game can read the grid, completion trigger, collision, render hints, start point, exit point, and optional solution path.

## File structure

```text
index.html
src/css/artifex-theme.css
src/js/config.js
src/js/state.js
src/js/dom.js
src/js/textures.js
src/js/maze-generator.js
src/js/maze-parser.js
src/js/renderer.js
src/js/solver.js
src/js/editor-tools.js
src/js/exporter.js
src/js/ui.js
src/js/main.js
data/maze-artifex.schema.json
data/sample-maze.json
```

## How to run

Because the app uses JavaScript modules, open it through a local server rather than double-clicking the HTML file.

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Game-readable export

Use **Download Game JSON**. The exported file contains:

- `schema`
- `moduleId`
- `gameplayMode`
- `puzzle.type`
- `puzzle.callingText`
- `puzzle.completionCondition.flag`
- `grid.matrix`
- `collision`
- `renderHints`
- `entities` for entry and exit
- optional BFS `solution.path`

The game engine can treat `grid.matrix[y][x] === 1` as solid wall collision and `0` as navigable path.

## Notes

This version intentionally avoids direct GitHub writing. It follows the manual Artifex workflow: edit visually, download JSON, upload the JSON into the repo, then test in the game.

## 2026-05-26 typography pass

Updated the Artifex interface typography scale so the tool follows a clearer production-editor hierarchy:

- Added Cinzel for titles and Inter for UI text, with safe fallbacks.
- Added central typography tokens in `src/css/artifex-theme.css`.
- Increased labels, buttons, helper text, output values, panel headings, status pills, legends, and mobile controls.
- Added larger coarse-pointer touch targets while keeping the desktop workspace compact.
- Kept the existing game-readable maze JSON export format unchanged.

## 2026-05-26 layout update

- Reworked the interface into the requested top title bar, left control panel, and right preview panel.
- Added a sticky icon bar at the top of the left panel.
- Moved Build Maze into the first left-panel card and combined source generation with parser controls.
- Reduced image upload from a main feature to a secondary “Use image as map reference” button.
- Split controls into Build, Display, Game Logic, Materials, Paint/Edit, and Help sections.
- Kept the game-readable JSON export schema unchanged.
