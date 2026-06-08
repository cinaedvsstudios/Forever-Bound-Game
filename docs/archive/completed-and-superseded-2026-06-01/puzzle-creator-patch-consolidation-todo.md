# Puzzle Creator · Patch Consolidation To-Do

Status: completed · stable module chain confirmed and obsolete patch files deleted
Owner: Puzzle Creator
Related document: `artifex/shared/todo-guide/puzzle-creator-maze-labyrinth-update-steps.md`
Related global decision: `artifex/shared/todo-guide/global-portal-endpoint-registry-design-2026-05-29.md`
Started: 2026-05-27
Completed: 2026-05-30

## Outcome

The temporary Maze / Labyrinth patch stack has been removed from the live Puzzle Creator architecture. The tested editor now uses permanent named modules only; no active `maze-v###-*` patch import or wrapper remains.

### Stable live Maze modules

```text
src/js/engines/maze-labyrinth-runtime-controls.js
src/js/engines/maze-difficulty-report.js
src/js/engines/maze-runtime-status.js
src/js/engines/maze-preview-default-layout.js
src/js/engines/maze-features.js
src/js/engines/maze-completion-rules.js
src/js/engines/maze-connections.js
src/js/engines/maze-ui-polish.js
src/js/engines/maze-organic-wall-renderer.js
```

### Deleted obsolete transition files

The following files were removed after the corresponding behaviour had been integrated into stable modules and tested in the live app:

```text
src/js/engines/maze-v111-fixes.js
src/js/engines/maze-v112-modal.js
src/js/engines/maze-v113-polish.js
src/js/engines/maze-v114-completion-rules.js
src/js/engines/maze-v115-ui-polish.js
src/js/engines/maze-v116-portals.js
src/js/engines/maze-completion-system.js
src/js/engines/maze-portals-system.js
```

## Behaviours preserved and verified during consolidation

- Generated maze layouts with valid border/entry/exit behaviour for supported shapes.
- Fresh Random, Start Blank and Clear All.
- Difficulty and live Solution information.
- Maker-only Show/Hide Solution route.
- Features-first Game Logic workflow.
- Collection feature placement on the Overview.
- Door and local Portal placement/Walk Test transfer.
- Completion Rules derived from added Features.
- Wall Form rendering with Blocks, Rounded and Organic modes.
- Organic mode visually differs from Rounded.
- Walk Test no longer visibly flashes the underlying grid when a joined Wall Form is active.

## Remaining feature work, not consolidation debt

These are normal future feature modules and must not be implemented as patch files:

1. Asset/archetype linking for collection objects and Door visuals.
2. Scatter decoration and light placement.
3. Traboule pass-through-wall behaviour.
4. Shared/global Portal Registry implementation.
5. Foe and Hazard feature setup/runtime behaviour.
6. Tunnel Mode design and implementation.
7. Helper pendant/crystal after mandatory objective tracking exists.

## Permanent rule

Do not recreate a numbered Maze patch stack. New behaviour belongs in permanent feature modules, and any temporary emergency fix must be integrated or removed before another patch is added.
