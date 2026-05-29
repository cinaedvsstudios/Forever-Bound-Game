# Puzzle Creator · Maze / Labyrinth Update Steps

Status: patch consolidation in progress; approved design changes queued after consolidation
Owner: Puzzle Creator
Related modules: Project Manager, Scene Editor, Quest Builder, Archetype Object Creator, Build Game
Last updated: 2026-05-29
Related global design: `artifex/shared/todo-guide/global-portal-endpoint-registry-design-2026-05-29.md`

This document records the current agreed plan for the Maze / Labyrinth engine inside Puzzle Creator. It replaces earlier drafts where Puzzle Type, Integration Context, Hazard/Foe completion rules, or Traboule-as-teleporter were treated as normal Maze editor options.

## Current priority: Finish consolidation first

The current editor reached V1.16 through temporary patch files. Stable replacement modules are now being introduced, but Completion Rules still have one temporary wrapper dependency. No major new feature should be implemented until that wrapper is removed and the current behaviours pass a smoke test.

Current stable module direction:

```text
src/js/engines/maze-labyrinth-runtime-controls.js
src/js/engines/maze-difficulty-report.js
src/js/engines/maze-runtime-status.js
src/js/engines/maze-preview-default-layout.js
src/js/engines/maze-ui-polish.js
src/js/engines/maze-portals-system.js
src/js/engines/maze-completion-rules.js          <- must replace remaining completion wrapper
```

### Consolidation remaining work

1. Inline the existing Completion Rules functionality into `maze-completion-rules.js` and stop using `maze-v114-completion-rules.js` behind a wrapper.
2. Confirm no active `maze-v###-*` module remains in the live import path.
3. Delete or archive versioned patch files after live testing.
4. Smoke test Fresh Random, Start Blank, Clear All, Size, Shape, Stretch, Warp, difficulty display, solution display, Walk Test, Doors/Portals, visuals, export and import.
5. Only after that, begin the newly approved feature changes below.

## Approved UI and logic corrections

### Remove Puzzle Type from Maze / Labyrinth

`Puzzle Type` should be removed from the Maze / Labyrinth workflow. It does not change how the maze is built or played, and it duplicates logic that belongs in Completion Rules or in separate puzzle engines.

Maze / Labyrinth is already the engine type. The app must not show a field that implies this same maze can become unrelated puzzle types merely by changing metadata.

### Remove Integration Context from Puzzle Creator

`Integration Context` should be removed from the Maze / Labyrinth editor UI.

A reusable maze does not need the maker to manually declare whether it is a scene or travel puzzle while authoring the maze. The context is determined later by whichever app places or references the puzzle:

- Scene Editor may insert the maze into a scene/room.
- Quest Builder may require it in an objective.
- Project Manager may link it to a node or route.
- Build Game consumes the final resolved references.

Puzzle Creator should export a reusable maze definition. Placement context belongs to the app that uses that definition.

### Move Completion Rule into Game Logic

Completion Rule currently appearing in Construction is wrong. Move it into **03 · Game Logic**.

For the Maze / Labyrinth engine, Completion Rule should be deliberately simple:

1. **Reach Exit** — always required and cannot be removed.
2. **Collect Objects Before Exit** — optional.

Do not expose Hazard, Foe, Unlock or Required Portal as general Maze completion checkboxes at this stage. Hazards and foes may later be interactive content or belong to their own puzzle engines; doors and portals are route/connection mechanics rather than automatic completion rules.

## Completion Rule: Collect Objects setup

If `Collect Objects Before Exit` is enabled, the Game Logic panel must create a real **Required Objects** setup card rather than a placeholder status chip.

Controls:

- Required object count.
- One setup row/card per required object: `Item 1`, `Item 2`, etc.
- `Place on Map` action for each item; clicking it then clicking a valid path cell places that required pickup.
- `Link Archetype Object` action for each item.
- Display selected archetype/object name and thumbnail when linked.
- Display placed cell position.
- Clear/remove placement action.
- Status per item: Missing, Partially Set, Ready.

Rules:

- Required item cells must be valid reachable path cells.
- Items should not be placed on the entrance, exit, Door/Portal endpoint or another required item unless explicitly allowed later.
- Walk Test later needs to record collected required items and prevent successful exit until all required items are collected.
- JSON export must store required item references, placements and completion order.
- The section icon should be yellow while object configuration is incomplete and green only when every required object is linked/placed and reachable.

## Connections: Door, Traboule and Portal are different systems

### Door

A Door is a visible connection inside the current maze.

- It has an Entry and Exit cell placed in the maze.
- In Walk Test it transfers the player between those cells.
- It needs a visual asset selector: choose a door image from the project/library or upload one into the asset library.
- It may support one-way or two-way behaviour.
- It is local Maze data unless a later wider door/scene-transition contract is approved.

### Traboule

A Traboule is a secret pass-through wall.

- It is not a Door type and is not a Portal type.
- It is not a paired teleport.
- It is placed on a wall cell or defined wall segment.
- The cell still renders like an ordinary wall but becomes non-solid so the player can walk through it.
- It needs its own placement control, e.g. `Add Traboule` then click a valid wall cell.
- It should be hidden during gameplay unless a helper/hint mechanic reveals it later.

### Portal

A Portal is a game-wide endpoint connection.

- It is not limited to Maze / Labyrinth.
- It uses an image/effect selected from project/library assets or uploaded assets.
- It can link to another endpoint in the same maze, another puzzle, a scene, a travel location or another supported game space.
- When a Portal endpoint is created, it must be registered in a shared project Portal Registry so other apps can select it as a destination.
- It must support unresolved endpoints while authoring, plus one-way/two-way linking and validation before build.

Portal cross-app architecture is specified in:

```text
artifex/shared/todo-guide/global-portal-endpoint-registry-design-2026-05-29.md
```

### Connections UI direction

Replace the current paired `Portals` card with a broader **Connections** area containing separate creation actions:

- Add Door
- Add Portal
- Add Traboule

Door fields:

- Label
- Entry cell
- Exit cell
- One-way/two-way
- Door asset image
- Optional hint text

Portal fields:

- Label / stable portal endpoint ID
- Placement cell
- Portal visual asset and optional FX
- Destination: unlinked / existing registry endpoint / create local paired endpoint
- One-way/two-way
- Optional activation flag or hint text later

Traboule fields:

- Label
- Wall placement cell
- Optional hint text later
- Collision override shown only in editor, not visibly in gameplay

## Solution and difficulty display

The Solution information box should show the same useful quick analysis currently provided by **Analyse Difficulty**:

- current difficulty setting
- target meaningful route count
- route exists: yes/no
- main route/minimum path length in cells
- branch cell count
- dead-end count
- note that full meaningful-route matching remains a later algorithm pass until implemented

Changes:

- Remove the `Analyse Difficulty` button after the information is displayed directly in the Solution box.
- The solution route should be visible by default to the puzzle maker/editor.
- Replace `Plot Solution Path` with a toggle button: `Hide Solution` / `Show Solution`.
- The displayed solution is editor-only and must not automatically appear to the player in the exported game.
- Portal endpoints should not be counted as normal route alternatives in difficulty calculation unless a future explicit option enables that.

## 04 · Surface + Edit: Scatter card

Add a **Scatter** card to Surface + Edit for decorative visuals. These items are rendered images only and do not require archetype objects unless the maker deliberately promotes them into interactive content later.

### Lights

Controls:

- Enable decorative lights.
- Choose a light image from library or upload/select an asset.
- Light spacing or density.
- Optional colour/tint, intensity and pulse/flicker settings later.
- Placement preference: along paths, wall edges, corners or dead ends.

### Decorative scatter objects

Controls:

- Up to five decorative image slots.
- Each slot chooses from the asset library or uploads/selects an image asset.
- Density/amount control.
- Placement preferences: path only, wall edge, corner, dead end, open space.
- Random seed / regenerate scatter.
- Clear scatter.
- Avoid entrance, exit, required collect-item cells, Door/Portal placements and other required gameplay cells.

Export each decoration as lightweight visual placement metadata:

```text
assetId/source, cell position, offset, scale, rotation, layer, collision false
```

## Tunnel Mode requires a design pass before implementation

Tunnel Mode has been discussed only at a draft level. Do not build the full feature until these decisions are confirmed.

Current intended direction to discuss/confirm:

- Toggle in Construction to make the maze a roofed/enclosed gameplay space.
- Construction still retains Overview; gameplay should not reveal the full map.
- Tunnel style options under consideration: Square Tunnel, Natural Cave, Pipe and Prism.
- 3D/first-person rendering is required for Tunnel Mode to be meaningful; the current 3D placeholder is not sufficient.
- Decorative lights become important in Tunnel Mode so the player is not walking in unusable darkness.
- Decide whether the helper crystal/pendant is available, optional or required in Tunnel Mode.
- Decide how Door, Portal, Traboule and required collect items appear inside tunnel gameplay.

## Helper crystal / pendant

Not implemented yet.

It should not be built until collect-object objectives, global/local connection behaviour and route evaluation are stable. Intended later behaviour remains:

- Off / Subtle / Normal / Strong guidance levels.
- Pulses or brightens while moving toward the current required objective.
- Dims while moving away or going into an incorrect branch.
- Objective order recalculates as required objects are collected, then directs toward the exit or any required later objective if such a design is approved.

## Existing functional checks to preserve

- Shapes: Square, Pentagon, Hexagon and Circle regenerate cleanly; Triangle remains disabled until fixed.
- Size uses the agreed scale: 1=11, 2=15, 3=20, 4=25, 5=30.
- Shape and Stretch rebuild actual maze geometry rather than colouring or spacing an old square grid.
- Borders remain walls with only defined openings.
- Warp changes visual route line geometry without destroying route validity.
- Close Tile Gaps removes normal tile spacing; fully smoothed warped surfaces remain a later renderer improvement.
- Walk Test uses WASD/arrows, collision and connection testing.
- Overview is draggable/resizable and defaults to the right side.
- Main preview defaults left-aligned so it is not hidden behind Overview.
- JSON export/import must ultimately preserve maze layout, visuals, completion rules, required objects, local Doors/Traboules and Portal endpoint references.

## Updated implementation order

### Active: Consolidation

1. Inline Completion Rules into its stable module.
2. Remove all active versioned patch imports and archive/delete dead patch files.
3. Smoke test current features and export/import.

### Next: Correct Game Logic UI

4. Remove Puzzle Type.
5. Remove Integration Context.
6. Move Completion Rule from Construction into Game Logic.
7. Limit Maze completion rules to Reach Exit plus optional Collect Objects.
8. Move the full analysis information into Solution and convert plotting to a show/hide toggle visible by default to the maker.

### Next: Required object placements

9. Build Required Objects setup cards, map placement and Archetype Object links.
10. Add Walk Test validation and export data for required objects.

### Next: Connections redesign

11. Refactor current Portal card into Connections.
12. Keep local Door paired placement and add door asset selection.
13. Build Traboule as a wall collision override, not a teleport.
14. Build Portal endpoints against the shared global registry contract.

### Next: Visual decoration

15. Add Surface + Edit Scatter card for lights and up to five decorative image slots.
16. Add decoration export and exclusion rules around required gameplay cells.

### Later design/implementation

17. Complete Tunnel Mode design decisions, then implement tunnel renderer/lighting behaviour.
18. Build Helper crystal/pendant only after objective and route logic is reliable.
19. Continue meaningful-route difficulty analysis after connections/objectives are settled.

## Required file structure direction

```text
index.html
src/js/main.js
src/js/engines-ui.js
src/js/engines/maze-labyrinth.js
src/js/engines/maze-labyrinth-runtime-controls.js
src/js/engines/maze-route-analyzer.js
src/js/engines/maze-difficulty-report.js
src/js/engines/maze-completion-rules.js
src/js/engines/maze-required-items.js
src/js/engines/maze-connections.js
src/js/engines/maze-door-connections.js
src/js/engines/maze-traboules.js
src/js/engines/maze-portal-endpoints.js
src/js/engines/maze-ui-polish.js
src/js/engines/maze-scatter-decorations.js
src/js/engines/maze-tunnel-mode.js
src/js/engines/maze-helper-system.js
```

## Implementation warning

Do not make label-only changes unless underlying behaviour is implemented or clearly presented as not yet available. Every visible control should work, be hidden, or be disabled with a precise explanation. In particular, Traboule must not be presented as a paired Portal type, Portal must not be treated as local-only maze data, and unused Puzzle Type / Integration Context controls must not remain visible merely as metadata placeholders.
