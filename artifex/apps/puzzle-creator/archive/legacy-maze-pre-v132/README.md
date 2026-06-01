# Legacy Maze / Labyrinth pre-V1.32 archive

Archive pass date: `2026-06-01`.

## Files archived

| Archived file | Former location | Reason for archiving |
|---|---|---|
| `maze-v109-controls.js` | `artifex/apps/puzzle-creator/src/js/engines/maze-v109-controls.js` | No active Puzzle Creator entry, import chain, dynamic import, loader, `document.write` path, Hub navigation, app-index route, or documented live test link referenced this versioned patch file. Its regenerate, display-mode, shape-regeneration, 3D-placeholder and overview-summary behaviours are superseded by the current named Maze / Labyrinth modules. |
| `maze-v110-fixes.js` | `artifex/apps/puzzle-creator/src/js/engines/maze-v110-fixes.js` | No active Puzzle Creator entry, import chain, dynamic import, loader, `document.write` path, Hub navigation, app-index route, or documented live test link referenced this versioned patch file. Its button overrides, display modes, generated/blank maze handling, panning, route plotting, difficulty placeholder, preview drawing, 3D-placeholder and overview-summary behaviours are superseded by the current named Maze / Labyrinth modules. |

## Current active replacement

The live Puzzle Creator entry remains `artifex/apps/puzzle-creator/index.html`, visibly labelled `V1.32`. It still loads:

```text
src/js/main.js?v=1.28
src/js/engines/maze-labyrinth-consolidation-loader.js?v=1.32
```

The active Maze / Labyrinth chain remains the V1.32 named-module loader route:

```text
artifex/apps/puzzle-creator/src/js/main.js
artifex/apps/puzzle-creator/src/js/engines/maze-labyrinth-runtime.js
artifex/apps/puzzle-creator/src/js/engines-ui.js
artifex/apps/puzzle-creator/src/js/engines/maze-labyrinth-consolidation-loader.js
artifex/apps/puzzle-creator/src/js/engines/maze-labyrinth-runtime-controls.js
artifex/apps/puzzle-creator/src/js/engines/maze-difficulty-report.js
artifex/apps/puzzle-creator/src/js/engines/maze-preview-default-layout.js
artifex/apps/puzzle-creator/src/js/engines/maze-runtime-status.js
artifex/apps/puzzle-creator/src/js/engines/maze-features.js
artifex/apps/puzzle-creator/src/js/engines/maze-completion-rules.js
artifex/apps/puzzle-creator/src/js/engines/maze-ui-polish.js
artifex/apps/puzzle-creator/src/js/engines/maze-connections.js
artifex/apps/puzzle-creator/src/js/engines/maze-door-visual-linking.js
artifex/apps/puzzle-creator/src/js/engines/maze-organic-wall-renderer.js
artifex/apps/puzzle-creator/src/js/engines/maze-scatter-decorations.js
```

## Excluded candidates

None. Both approved candidates were verified inactive and superseded before being moved.

## Behaviour confirmation

This archive-only pass does not modify the active Puzzle Creator HTML entry, active JavaScript, active CSS, loader chain, schema, save/load/export/import behaviour, quest handoff behaviour, shared services, UI layout, or maze/labyrinth runtime behaviour. Live Puzzle Creator V1.32 behaviour is unchanged because the archived files were not loaded by the active app path.
