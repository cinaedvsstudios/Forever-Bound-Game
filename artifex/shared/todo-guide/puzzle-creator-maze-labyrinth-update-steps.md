# Puzzle Creator · Maze / Labyrinth Update Steps

Status: V1.28 live-approved stable baseline; shared registered-content reader and picker controller added, Maze consumer not yet wired
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

## Shared registered-content dependency completed · not yet consumed by Maze UI

Created shared dependency files:

```text
artifex/shared/registered-content/registered-content-reader.js
artifex/shared/registered-content/registered-content-picker.js
artifex/shared/registered-content/README.md
```

The dependency defines and validates the canonical project-backed content sources required by future Maze linking:

```text
assets/asset-index.json                 final registered visual/audio assets using asset_ IDs
archetypes/object-index.json            reusable gameplay object records using archobj_ IDs
archetypes/effect-index.json            reusable effect records using archeffect_ IDs
```

Implemented reader behaviour:

- loads the canonical index types through a provided JSON reader or `window.ArtifexProjectFolder.readJson`;
- validates index schema and typed collection name;
- validates stable ID prefixes and project-relative final record paths;
- filters out intake files, external/browser URLs and legacy `artifex/assets-library/` paths from final selectable records;
- exposes normalized search results and stable minimal reference creation for future picker consumers;
- reports honest empty/missing/invalid/read-failed statuses.

Implemented picker controller behaviour:

- opens a reusable Artifex-themed modal selection panel;
- supports Final Assets, Archetype Objects and Archetype Effects tabs;
- searches valid records by ID, name, type, final path, status and tags;
- shows empty, missing, invalid, unreadable and partially-rejected results honestly;
- shows a selected record's stable ID and final project path before confirmation;
- returns a minimal stable reference only from a record accepted by the reader;
- does not provide uploads or raw-path entry that could bypass project promotion/indexing.

This dependency exists for consuming authoring apps. Puzzle Creator has not yet imported it, no Maze Link button has been enabled, and no current V1.28 visible behaviour has changed.

## Still unimplemented

- Puzzle Creator consumption of the shared picker for Collect and Door records.
- Archetype Object linking for collected items, foes or hazards.
- Door asset/image selection.
- Portal visual asset/FX selection.
- Connected-project production/population workflow that creates real selectable asset and archetype records where required.
- Walk Test enforcement for mandatory Completion Rules.
- Foe and Hazard feature setup and runtime behaviour.
- Traboule collision override behaviour.
- Global Portal Registry integration.
- Scatter decorations/lights.
- Tunnel Mode and helper pendant/crystal.
- Real 3D/first-person renderer.
- Texture-aware rendering inside joined Rounded/Organic wall surfaces, if required after testing.

## Asset/archetype linking dependency decision · 2026-05-30

The project had canonical contract paths but no shared validated picker. That platform dependency now exists as a reader plus reusable picker controller. It does not create final registered content itself, and it does not make any Maze control operational until Puzzle Creator stores and exports the selected reference correctly.

Required linking ownership:

- A placed Collect item stores a placed maze cell plus a stable `archetypeObjectId` resolving to an `archobj_` record. The archetype owns gameplay identity and linked visual assets.
- A Door remains a maze connection record; its visual later stores a final `visualAssetId` resolving to an `asset_` record.
- A Portal eventually stores final visual `asset_` and optional reusable `archeffect_` references, while endpoint/destination linking belongs to the shared global Portal Registry.
- Scatter decoration later stores final visual `asset_` references only, because it is decoration rather than gameplay object behaviour.

Correct next coding move:

1. Consume the shared picker in Puzzle Creator for **Collect** only, opening it from the existing Link action and storing/exporting `archetypeObjectId` when a real `archobj_` record is selected.
2. When no connected project or no registered object records exist, show the picker’s truthful empty/unavailable message rather than pretending a link was created.
3. After Collect wiring is tested, use the same dependency for Door visual `asset_` selection.
4. Keep Portal destination/global linking for the separate shared Portal Registry stage.

Do not store raw local uploads, free-text IDs or legacy asset paths as final Maze feature references.

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

Current state: placement exists; Archetype Object linking is the next Maze consumer stage now that the shared picker controller exists. Gameplay enforcement remains pending.

Required controls/validation:

- object count and one setup row per object
- Place on valid Overview path cell
- Link Archetype Object from registered `archobj_` project records and display selected label/ID where available
- clear/reset placement and linked reference independently where appropriate
- reject entrance, exit, other collection objects and Door/Portal endpoint cells
- Completion Rules determine whether collecting objects is mandatory

### Door

Current state: local pair placement and Walk Test transfer exist; visual asset selection comes after tested Collect picker consumption.

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

## Next implementation order after shared picker dependency

1. Wire Collect Archetype Object linking to the shared picker, storing/exporting only valid `archobj_` references.
2. Implement Door visual asset linking using valid `asset_` records.
3. Implement Scatter decorations/lights in a stable module using final registered visual assets only.
4. Implement Traboule as a hidden collision override.
5. Implement global Portal Registry integration across apps.
6. Define and implement Foe/Hazard feature behaviour.
7. Resolve Tunnel Mode design, then implement the renderer/lighting workflow.
8. Build helper pendant/crystal after mandatory objective tracking works.

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

The shared registered-content files remain platform dependencies rather than Maze-owned feature modules, so they live under `artifex/shared/registered-content/` and are consumed by Puzzle Creator rather than copied into its engine folder.

## Implementation warning

Do not make label-only changes unless the underlying behaviour exists or the control clearly states why it is disabled. Features define what exists in the maze; Completion Rules define which existing features are required. Rounded/Organic Wall Form must remain visual rendering of the stable cell-based model, not silently alter route or collision data. Final gameplay records must not point directly to intake assets, temporary browser uploads or legacy asset-catalogue items that have not been promoted into the project asset index.
