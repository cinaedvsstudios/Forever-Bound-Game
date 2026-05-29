# Puzzle Creator · Maze / Labyrinth Update Steps

Status: V1.26 live test required; stable module consolidation complete
Owner: Puzzle Creator
Related modules: Project Manager, Scene Editor, Quest Builder, Archetype Object Creator, Build Game
Last updated: 2026-05-29
Related global design: `artifex/shared/todo-guide/global-portal-endpoint-registry-design-2026-05-29.md`

## Current implementation status

The Maze / Labyrinth editor now loads permanent named modules only. The former numbered patch files are no longer in the live Maze loader import chain. Do not add further numbered fixes or wrappers.

Current stable modules:

```text
src/js/engines/maze-labyrinth-runtime-controls.js
src/js/engines/maze-difficulty-report.js
src/js/engines/maze-runtime-status.js
src/js/engines/maze-preview-default-layout.js
src/js/engines/maze-features.js
src/js/engines/maze-completion-rules.js
src/js/engines/maze-connections.js
src/js/engines/maze-ui-polish.js
```

Implemented in V1.26 pending live user testing:

- `Puzzle Type` and `Integration Context` are removed from the Maze workflow by the stable Game Logic module.
- Solution shows live quick analysis and has maker-only Show/Hide Solution behaviour.
- A **Features** card appears beneath Solution.
- Features can currently create **Collect**, **Door** and **Portal** content.
- Collection object rows can be placed on valid Overview path cells.
- Doors and local Portal pairs can be placed and tested in Walk Test.
- Completion Rules appear at the bottom of Quest Data and list added features so the maker can define what is mandatory.
- **Foe**, **Hazard** and **Traboule** are shown as future feature types but disabled until their actual behaviour exists.
- **Close Warped Gaps** now expands visual tile coverage based on Warp rather than only changing normal block spacing to `1.00`.

Still unimplemented:

- Archetype Object linking for collected items, doors, foes or hazards.
- Foe and Hazard feature setup and gameplay behaviour.
- Traboule collision override behaviour.
- Global Portal Registry app integration.
- Scatter decorations/lights.
- Tunnel Mode and helper pendant/crystal.
- Real 3D renderer.

## Core workflow decision: Features first, Completion Rules second

The Maze editor must distinguish between content placed in a maze and conditions required to finish it.

### Features card

The **Features** card belongs beneath the **Solution** analysis card in `03 · Quest Data / Game Logic`.

Features are things placed in the maze:

- Collection objects
- Doors
- Portals
- Foes, when implemented
- Hazards, when implemented
- Traboules, when implemented

A setup card should not be visible until its feature has been added. Adding a feature creates or reveals the correct setup controls for that feature.

### Completion Rules card

**Completion Rules** belongs at the bottom of Quest Data, after the feature setup content and the normal quest-data fields.

Rules should be derived from placed/added features rather than presenting a generic list before anything exists.

- **Reach Exit** is always mandatory.
- If Collection objects have been added, list **Collect all objects** with an optional/mandatory toggle.
- If a Door or Portal has been added, list that specific connection with an optional/mandatory toggle controlling whether the player must use it before the exit completes the maze.
- When Foe, Hazard or Traboule features are implemented, their actual placed instances can appear in Completion Rules only where a mandatory completion condition makes sense.

A Door or Portal may exist as an optional shortcut or decorative/gameplay route feature without being mandatory for completion.

## Removed Maze fields

### Puzzle Type

Remove from Maze / Labyrinth. The selected engine is already Maze / Labyrinth; changing generic metadata does not make it a different puzzle.

### Integration Context

Remove from Puzzle Creator. A reusable puzzle is placed into a scene, quest or route later by the app that owns that placement relationship.

## Solution and difficulty display

Solution must show quick analysis directly rather than depending on a separate report button:

- difficulty setting
- target meaningful-route count
- route exists: yes/no
- minimum path length in cells
- branch cell count
- dead-end count
- whether the maker-only solution overlay is visible

Rules:

- Remove `Analyse Difficulty` once the same information appears in Solution.
- Show the solution route by default for the maker/editor only.
- Use `Show Solution` / `Hide Solution` as the maker-only toggle.
- Solution overlay must not export as a player-visible gameplay guide.
- Portal transfer must not be counted as a normal alternate walking route unless a later explicit difficulty option allows it.

## Feature setup specifications

### Collection objects

Collection setup belongs inside Features. It is not automatically mandatory.

Controls required:

- number of collection objects
- one setup row per object
- Place action: select a valid path cell in Overview
- Link Archetype Object action
- selected archetype/object thumbnail and label when linked
- placed cell indicator
- clear/remove placement action

Validation:

- Do not place on entrance, exit, another collection object, or a Door/Portal endpoint.
- Mandatory collection status belongs in Completion Rules.
- Walk Test later needs to record collection state and enforce any mandatory rule.

Current V1.26 state: placement exists; Archetype Object linking and Walk Test objective enforcement are pending.

### Door

A Door is a visible local connection inside the current maze.

- It has Entry and Exit cells.
- It transfers the player between cells in Walk Test.
- It supports one-way/two-way movement.
- It requires a door image selector from project/library assets or uploaded assets in a later pass.
- It appears in Completion Rules only after it exists, where it may be marked optional or mandatory.

Current V1.26 state: local pair placement and Walk Test transfer exist; visual asset selection is pending.

### Traboule

A Traboule is a secret pass-through wall.

- It is not a Door type.
- It is not a Portal type.
- It is not a paired teleport.
- It is placed on a wall cell or wall segment.
- It continues to render like a normal wall while collision is disabled.
- It needs its own feature setup card and placement logic.

Current V1.26 state: visible as disabled future feature only; no false behaviour is exposed.

### Portal

A Portal is a game-wide endpoint mechanic.

- It uses visual image/effect selection in a later asset-linking pass.
- It may connect locally inside the same maze or link to an endpoint in another playable resource.
- Created Portal endpoints must ultimately register in the shared project Portal Registry.
- It supports unresolved endpoints during authoring, plus one-way/two-way validation before build.

Current V1.26 state: local paired placement and Walk Test transfer exist as an interim usable function; the UI states that global registry linking is pending.

Global contract document:

```text
artifex/shared/todo-guide/global-portal-endpoint-registry-design-2026-05-29.md
```

### Foe and Hazard

Foe and Hazard belong in Features, not as unexplained Completion Rule checkboxes.

Future controls should include placement, Archetype Object linking, per-instance configuration and optional/mandatory interpretation where meaningful. They remain disabled until their real design and runtime behaviour are implemented.

## 04 · Surface + Edit

### Close Warped Gaps

This is a visual cleanup feature for warped previews. The original implementation merely moved Block Spacing from `0.98` to `1.00`, which was too small to close gaps made by displaced warped tiles.

V1.26 design:

- When enabled, visual tile coverage expands automatically based on the current Warp level.
- The manual Block Spacing slider is disabled while automatic gap closure controls it.
- Turning it off restores the earlier spacing value.
- This is overlap-based seam hiding; truly merged smooth/curved geometry remains part of a later renderer pass.

### Scatter card

Add a **Scatter** card later for visual decoration only.

Lights:

- choose light image from library/uploaded assets
- density/spacing
- placement preference such as paths, wall edges, corners or dead ends
- optional tint/pulse later

Decorative objects:

- up to five image slots
- amount/density and random seed/regenerate
- placement preference
- no collision
- avoid entrance, exit, collection items and connection endpoints

## Tunnel Mode design required before implementation

Tunnel Mode is not ready to build fully. Decisions still required:

- toggle location in Construction
- gameplay visibility rules versus editor Overview
- styles: Square Tunnel, Natural Cave, Pipe, Prism
- real first-person/3D renderer requirements
- decorative lighting controls so tunnel play is usable
- appearance of Doors, Portals, Traboules and collection objects
- whether helper pendant/crystal is optional, automatic or player-configurable

## Helper pendant / crystal

Not implemented. It should wait until feature objectives, Completion Rules and connection routing are stable.

Proposed later behaviour:

- Off / Subtle / Normal / Strong guidance modes
- glow/pulse toward the current mandatory target
- dim when the player moves into an incorrect branch
- recalculate objective target after mandatory objects are collected or connections used

## Live test checklist for V1.26

1. Hard refresh and confirm visible version is V1.26.
2. Open Game Logic and confirm Puzzle Type and Integration Context are absent.
3. Confirm Solution shows the live information and Hide/Show Solution works.
4. Confirm Features appears beneath Solution.
5. Confirm no collection or connection setup cards appear until the relevant feature is added.
6. Add Collect; place one or more objects on valid Overview path cells.
7. Add Door; place Entry/Exit; test transfer in Walk Test.
8. Add Portal; place Entry/Exit; confirm it currently behaves locally and shows the global-linking-pending message.
9. Confirm Completion Rules at the bottom lists only features that have actually been added and lets them be marked mandatory.
10. In Surface + Edit, apply Warp and enable Close Warped Gaps; confirm gaps visibly close and Block Spacing becomes automatically controlled.

## Next implementation order after V1.26 test

1. Fix any live regression from the Features/Completion Rules split.
2. Delete/archive obsolete numbered patch files after the stable path is confirmed working.
3. Add Archetype Object/asset linking for collection objects and Doors.
4. Implement Scatter decorations/lights in a stable module.
5. Implement Traboule as a hidden collision override.
6. Implement global Portal Registry integration across apps.
7. Define and implement Foe/Hazard feature behaviour.
8. Resolve Tunnel Mode design, then implement the renderer/lighting workflow.
9. Build helper pendant/crystal only after mandatory objective tracking works.

## Required file structure direction

```text
index.html
src/js/main.js
src/js/engines-ui.js
src/js/engines/maze-labyrinth.js
src/js/engines/maze-labyrinth-runtime-controls.js
src/js/engines/maze-runtime-status.js
src/js/engines/maze-features.js
src/js/engines/maze-completion-rules.js
src/js/engines/maze-connections.js
src/js/engines/maze-ui-polish.js
src/js/engines/maze-scatter-decorations.js
src/js/engines/maze-traboules.js
src/js/engines/maze-portal-endpoints.js
src/js/engines/maze-tunnel-mode.js
src/js/engines/maze-helper-system.js
```

## Implementation warning

Do not make label-only changes unless underlying behaviour is implemented or clearly disabled with an accurate explanation. Every visible control must work, be hidden, or state precisely why it is unavailable. Features define what exists in the maze; Completion Rules define which existing features are required to complete it.
