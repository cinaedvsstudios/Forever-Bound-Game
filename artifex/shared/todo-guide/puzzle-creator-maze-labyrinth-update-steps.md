# Puzzle Creator · Maze / Labyrinth Update Steps

Status: V1.28 live-approved stable baseline; registered-content reader foundation added, picker UI not yet wired
Owner: Puzzle Creator
Related modules: Project Manager, Scene Editor, Quest Builder, Archetype Object Creator, Asset Library, Build Game
Last updated: 2026-05-30
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
src/js/engines/maze-labyrinth-consolidation-loader.js
```

## Implemented and live-approved through V1.28

- `Puzzle Type` and `Integration Context` are removed from the Maze workflow by stable Game Logic code.
- Solution shows live quick analysis and uses maker-only Show/Hide Solution behaviour.
- Features appears beneath Solution and can currently add Collect, Door and Portal content.
- Collection object rows can be placed on valid Overview path cells.
- Doors and local Portal pairs can be placed and tested in Walk Test.
- Completion Rules appear at the bottom of Quest Data and list added features so the maker can define which are mandatory.
- Foe, Hazard and Traboule are visible as planned feature types but disabled until real behaviour exists.
- The misleading **Close Warped Gaps** control was removed.
- A permanent **Wall Form** renderer module provides **Blocks**, **Rounded** and **Organic** modes.
- Rounded/Organic redraw the playable preview as joined wall surfaces while leaving the underlying grid, solution, feature placement and collision model unchanged.
- Organic is visibly distinct from Rounded and uses Warp to strengthen flowing natural wall distortion.
- Rounded/Organic Walk Test no longer visibly flashes the underlying square grid between redraws.
- Wall Form is included in exported visual-rendering metadata.

## Shared registered-content foundation added · not yet visible in Maze UI

Created shared dependency files:

```text
artifex/shared/registered-content/registered-content-reader.js
artifex/shared/registered-content/README.md
```

The reader now defines and validates the canonical project-backed content sources required by future Maze linking:

```text
assets/asset-index.json                 final registered visual/audio assets using asset_ IDs
archetypes/object-index.json            reusable gameplay object records using archobj_ IDs
archetypes/effect-index.json            reusable effect records using archeffect_ IDs
```

Implemented foundation behaviour:

- loads the canonical index types through a provided JSON reader or `window.ArtifexProjectFolder.readJson`;
- validates index schema and typed collection name;
- validates stable ID prefixes and project-relative final record paths;
- filters out intake files, external/browser URLs and legacy `artifex/assets-library/` paths from final selectable records;
- exposes normalized search results and stable minimal reference creation for future picker consumers;
- reports honest empty/missing/invalid/read-failed statuses.

This is deliberately a data dependency only. Puzzle Creator has not yet imported it, no Maze Link button has been enabled, and no current V1.28 visible behaviour has changed.

## Still unimplemented

- Reusable registered-content picker UI consuming the shared reader.
- Puzzle Creator consumption of that picker for final `asset_`, `archobj_` and `archeffect_` records.
- Archetype Object linking for collected items, foes or hazards.
- Door asset/image selection.
- Portal visual asset/FX selection.
- Walk Test enforcement for mandatory Completion Rules.
- Foe and Hazard feature setup and runtime behaviour.
- Traboule collision override behaviour.
- Global Portal Registry integration.
- Scatter decorations/lights.
- Tunnel Mode and helper pendant/crystal.
- Real 3D/first-person renderer.
- Texture-aware rendering inside joined Rounded/Organic wall surfaces, if required after testing.

## Asset/archetype linking dependency decision · 2026-05-30

Inspection result: the project has canonical contract paths and partial source modules, but no honest shared picker that Puzzle Creator can use for final project-backed linking yet. The shared reader foundation now removes the first data-validation blocker, but selection UI and owning-module project records are still required before Maze controls can become active.

Existing usable contract direction:

```text
assets/asset-index.json                 final registered visual/audio assets using asset_ IDs
archetypes/object-index.json            reusable gameplay object records using archobj_ IDs
archetypes/effect-index.json            reusable effect records using archeffect_ IDs
```

Remaining dependency gap:

- Project Editor can browse imported index data and link it to Flatplan nodes, but that browser is not a shared field picker for authoring apps.
- Archetype Object Creator defines and exports `archobj_` records, but its current library workflow is template/local-browser based rather than a connected-project picker service.
- Scene Editor has a useful legacy asset picker for `artifex/assets-library/asset-library.json`, but that catalogue is not the project-final `assets/asset-index.json` contract.
- `artifex/apps/object-library/index.html` is currently empty and cannot supply a picker dependency.
- The new shared reader validates final records, but it does not itself create promoted assets, project-backed archetypes or picker UI.

Required linking ownership:

- A placed Collect item must store a placed maze cell plus a stable `archetypeObjectId` resolving to an `archobj_` record. The archetype owns gameplay identity and linked visual assets.
- A Door remains a maze connection record; its visual should later store a final `visualAssetId` resolving to an `asset_` record.
- A Portal eventually stores final visual `asset_` and optional reusable `archeffect_` references, while endpoint/destination linking belongs to the shared global Portal Registry.
- Scatter decoration later stores final visual `asset_` references only, because it is decoration rather than gameplay object behaviour.

Correct next coding move:

1. Add a reusable picker UI/controller around `artifex/shared/registered-content/registered-content-reader.js`.
2. Keep its empty/unavailable state truthful until real connected-project `asset_` / `archobj_` / `archeffect_` index records exist.
3. Only then consume it in Puzzle Creator to enable Collect Archetype Object selection and Door visual selection.
4. Keep Portal destination/global linking for the separate shared Portal Registry stage.

Do not enable a Maze Link button by storing raw local uploads, free-text IDs or legacy asset paths as if they were final project records.

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

Current state: placement exists; Archetype Object linking and gameplay enforcement are pending the registered-content picker UI dependency.

Required controls/validation:

- object count and one setup row per object
- Place on valid Overview path cell
- future Link Archetype Object from registered `archobj_` project records and display thumbnail/label where available
- clear/reset placement
- reject entrance, exit, other collection objects and Door/Portal endpoint cells
- Completion Rules determine whether collecting objects is mandatory

### Door

Current state: local pair placement and Walk Test transfer exist; visual asset selection is pending the registered-content picker UI dependency.

- visible local connection with Entry and Exit
- one-way/two-way transfer
- later final visual asset selector from registered `asset_` project records
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
- future final visual `asset_` and optional reusable `archeffect_` selection
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

V1.27 introduced Wall Form and V1.28 fixed/approved its current presentation:

- **Blocks:** retains the individual tile preview.
- **Rounded:** joins adjacent wall cells into clean softened continuous wall runs.
- **Organic:** joins walls and applies Warp-driven curved bends for hedge/cave/organic corridor appearance.

Important constraints:

- This is currently a playable-preview visual layer; the Overview remains the precise construction grid.
- Grid data, collision, route solving and feature cell placement stay cell-based and unchanged.
- Organic must remain visually distinct from Rounded.
- Walk Test in Rounded/Organic must not reveal the square base-grid layer between movement redraws.
- If texture fill or stronger geometry smoothing is needed after further testing, extend this stable renderer rather than adding a patch.

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

## Preserved V1.28 baseline for future testing

Whenever later feature work changes the Maze editor, retain these already-approved behaviours:

1. Visible version remains V1.28 until a new visible feature stage is deliberately released.
2. Features and Completion Rules remain separate: features add content; rules choose what is mandatory.
3. Collection placement, Door placement and local Portal placement remain valid in Overview.
4. Door and local Portal transfer remain functional in Walk Test.
5. Foe, Hazard and Traboule remain disabled unless actual behaviour exists.
6. Wall Form provides Blocks, Rounded and Organic, with Organic visibly distinct from Rounded.
7. Walk Test in Rounded/Organic does not flash back to the underlying square grid.
8. No numbered patch files or transitional wrapper modules are reintroduced.

## Next implementation order after reader foundation

1. Create a reusable shared registered-content picker UI/controller using the completed reader foundation.
2. Implement Collect Archetype Object linking once real project-backed `archobj_` records can be selected.
3. Implement Door visual asset linking once real project-backed `asset_` records can be selected.
4. Implement Scatter decorations/lights in a stable module using final registered visual assets only.
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

A shared registered-content picker is a platform dependency rather than a Maze-owned feature module, so it should be implemented in a shared Artifex location and consumed by Puzzle Creator rather than copied into this engine folder.

## Implementation warning

Do not make label-only changes unless the underlying behaviour exists or the control clearly states why it is disabled. Features define what exists in the maze; Completion Rules define which existing features are required. Rounded/Organic Wall Form must remain visual rendering of the stable cell-based model, not silently alter route or collision data. Final gameplay records must not point directly to intake assets, temporary browser uploads or legacy asset-catalogue items that have not been promoted into the project asset index.
