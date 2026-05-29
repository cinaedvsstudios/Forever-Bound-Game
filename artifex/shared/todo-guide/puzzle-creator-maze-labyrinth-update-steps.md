# Puzzle Creator · Maze / Labyrinth Update Steps

Status: V1.27 live test required; stable module consolidation complete
Owner: Puzzle Creator
Related modules: Project Manager, Scene Editor, Quest Builder, Archetype Object Creator, Build Game
Last updated: 2026-05-29
Related global design: `artifex/shared/todo-guide/global-portal-endpoint-registry-design-2026-05-29.md`

## Stable module rule

The Maze / Labyrinth editor now loads permanent named modules only. The former numbered patch files are no longer in the live Maze loader import chain. Do not add numbered fixes or wrappers.

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
src/js/engines/maze-organic-wall-renderer.js
```

## Implemented and awaiting live verification

Completed through V1.26:

- `Puzzle Type` and `Integration Context` are removed from the Maze workflow by stable Game Logic code.
- Solution shows live quick analysis and uses maker-only Show/Hide Solution behaviour.
- Features appears beneath Solution and can currently add Collect, Door and Portal content.
- Collection object rows can be placed on valid Overview path cells.
- Doors and local Portal pairs can be placed and tested in Walk Test.
- Completion Rules appear at the bottom of Quest Data and list added features so the maker can define which are mandatory.
- Foe, Hazard and Traboule are visible as planned feature types but disabled until real behaviour exists.

Completed in V1.27, requiring visual testing:

- Removed the misleading **Close Warped Gaps** control as the proposed curved-wall solution.
- Added a permanent **Wall Form** renderer module in Surface + Edit.
- Added three visual modes: **Blocks**, **Rounded**, **Organic**.
- Rounded/Organic redraw the playable preview as joined wall surfaces while leaving the underlying grid, solution, feature placement and collision model unchanged.
- Organic mode uses Warp to bend joined wall runs into flowing edges rather than displaced individual cubes.
- Wall Form is included in exported visual-rendering metadata.

## Still unimplemented

- Archetype Object linking for collected items, doors, foes or hazards.
- Walk Test enforcement for mandatory Completion Rules.
- Door asset/image selection.
- Foe and Hazard feature setup and runtime behaviour.
- Traboule collision override behaviour.
- Global Portal Registry integration.
- Scatter decorations/lights.
- Tunnel Mode and helper pendant/crystal.
- Real 3D/first-person renderer.
- Texture-aware rendering inside joined Rounded/Organic wall surfaces, if required after testing.

## Core workflow: Features first, Completion Rules second

### Features

The Features card belongs beneath Solution in `03 · Quest Data / Game Logic`. Features define content placed inside the maze:

- Collection objects
- Doors
- Portals
- Foes, when implemented
- Hazards, when implemented
- Traboules, when implemented

A setup card must not appear before its feature has been added.

### Completion Rules

Completion Rules belongs at the bottom of Quest Data. Rules are derived from features already added:

- Reach Exit is always mandatory.
- If Collection objects exist, list Collect all objects with an optional/mandatory toggle.
- If a Door or Portal exists, list that specific connection with an optional/mandatory toggle.
- Later Foe/Hazard/Traboule conditions should only appear when their placed feature and runtime meaning exist.

A Door or Portal may exist as optional route content without being mandatory for completion.

## Removed Maze fields

- **Puzzle Type:** removed because the selected engine already is Maze / Labyrinth and the field did not alter puzzle behaviour.
- **Integration Context:** removed because use within a scene, quest or route belongs to the app that places/references the reusable puzzle.

## Solution and difficulty display

Solution should display directly:

- difficulty setting
- target meaningful-route count
- route exists: yes/no
- minimum path length
- branch cell count
- dead-end count
- whether the maker-only solution overlay is visible

Rules:

- No separate Analyse Difficulty button once this data is in Solution.
- Show the solution route by default for the maker/editor only.
- Use Show Solution / Hide Solution for the maker-only overlay.
- Do not export the overlay as player-visible guidance.
- Portal transfer should not count as a normal alternate walking route unless an explicit later difficulty option permits it.

## Feature specifications

### Collection objects

Current state: placement exists; Archetype Object linking and gameplay enforcement are pending.

Required controls/validation:

- object count and one setup row per object
- Place on valid Overview path cell
- future Link Archetype Object and thumbnail/label
- clear/reset placement
- reject entrance, exit, other collection objects and Door/Portal endpoint cells
- Completion Rules determine whether collecting objects is mandatory

### Door

Current state: local pair placement and Walk Test transfer exist; visual asset selection is pending.

- visible local connection with Entry and Exit
- one-way/two-way transfer
- later door asset selector from library/uploaded assets
- appears in Completion Rules only after it exists

### Traboule

Current state: disabled future feature only; no false paired-teleport behaviour is exposed.

- hidden pass-through wall, not a Door or Portal
- place on wall cell/segment
- renders as normal wall while collision becomes non-solid
- needs its own feature card and runtime collision logic

### Portal

Current state: local paired placement and Walk Test transfer exist as an interim function; global linking is labelled pending.

- game-wide endpoint mechanic
- future visual image/effect selection
- local or registry-linked destination
- ultimately registers in shared project Portal Registry
- supports unresolved endpoints and one-way/two-way validation

Global contract:

```text
artifex/shared/todo-guide/global-portal-endpoint-registry-design-2026-05-29.md
```

### Foe and Hazard

Foe and Hazard belong in Features, not unexplained Completion Rule checkboxes. They remain disabled until actual placement, archetype linkage, runtime behaviour and mandatory/optional meaning are defined.

## 04 · Surface + Edit

### Wall Form renderer

The earlier Close Warped Gaps idea was not sufficient: it only covered seams between displaced block tiles, whereas the required design is continuous curved wall surfaces.

V1.27 introduces Wall Form:

- **Blocks:** retains the individual tile preview.
- **Rounded:** joins adjacent wall cells into clean softened continuous wall runs.
- **Organic:** joins walls and applies Warp-driven curved bends for hedge/cave/organic corridor appearance.

Important constraints:

- This is currently a playable-preview visual layer; the Overview remains the precise construction grid.
- Grid data, collision, route solving and feature cell placement stay cell-based and unchanged.
- Test whether pan/zoom, Walk Test, solution overlay, Door/Portal markers and Collect markers remain visually aligned in Rounded/Organic modes.
- If texture fill or stronger geometry smoothing is needed after the visual test, extend this stable renderer rather than adding a patch.

### Scatter card

Still pending. It will contain decoration only:

- decorative light asset selection with density/placement preference
- up to five decorative image slots
- amount/density and random seed/regenerate
- no collision
- avoid entrance, exit, collection items and connection endpoints

## Tunnel Mode design required before implementation

Still pending design confirmation:

- construction toggle location
- gameplay visibility versus editor Overview
- styles: Square Tunnel, Natural Cave, Pipe, Prism
- real first-person/3D renderer requirements
- decorative lighting so tunnel play is usable
- appearance of Doors, Portals, Traboules and collection objects
- helper pendant/crystal behaviour

## Helper pendant / crystal

Not implemented. Build only after feature objectives, Completion Rules and connection routing are stable.

Proposed later modes: Off / Subtle / Normal / Strong; pulse toward current mandatory target; dim on wrong branches; recalculate after mandatory objects or connections are satisfied.

## Live test checklist for V1.27

1. Hard refresh and confirm visible version is V1.27.
2. Confirm previously approved V1.26 workflow still works: Features, Completion Rules, Collection placement, Door/Portal placement and Show/Hide Solution.
3. Open Surface + Edit and confirm **Close Warped Gaps** is no longer presented as the wall-curving feature.
4. Confirm a new **Wall Form** card appears with Blocks, Rounded and Organic.
5. Set Warp high, switch between Blocks, Rounded and Organic and confirm Rounded/Organic look like joined surfaces rather than separated warped cubes.
6. Check that the solution line remains correctly aligned in Rounded and Organic.
7. Check a placed Collect item and Door/Portal marker remain aligned in Rounded and Organic.
8. Enter Walk Test in Rounded and Organic and check the player position/movement remains visually aligned.
9. Check pan and zoom in Rounded and Organic.

## Next implementation order after V1.27 test

1. Correct any Wall Form visual/alignment/performance issue found in live testing.
2. Delete/archive obsolete numbered patch files after the stable path is confirmed working.
3. Add Archetype Object/asset linking for collection objects and Doors.
4. Implement Scatter decorations/lights in a stable module.
5. Implement Traboule as a hidden collision override.
6. Implement global Portal Registry integration across apps.
7. Define and implement Foe/Hazard feature behaviour.
8. Resolve Tunnel Mode design, then implement the renderer/lighting workflow.
9. Build helper pendant/crystal after mandatory objective tracking works.

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
src/js/engines/maze-organic-wall-renderer.js
src/js/engines/maze-scatter-decorations.js
src/js/engines/maze-traboules.js
src/js/engines/maze-portal-endpoints.js
src/js/engines/maze-tunnel-mode.js
src/js/engines/maze-helper-system.js
```

## Implementation warning

Do not make label-only changes unless the underlying behaviour exists or the control clearly states why it is disabled. Features define what exists in the maze; Completion Rules define which existing features are required. Rounded/Organic Wall Form must remain visual rendering of the stable cell-based model, not silently alter route or collision data.
