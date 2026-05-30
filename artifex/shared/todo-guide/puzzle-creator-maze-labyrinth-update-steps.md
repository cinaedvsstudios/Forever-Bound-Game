# Puzzle Creator · Maze / Labyrinth Update Steps

Status: V1.29 live test required — Collect Archetype Object linking wired through shared registered-content picker
Owner: Puzzle Creator
Related modules: Project Manager, Scene Editor, Quest Builder, Archetype Object Creator, Asset Library, Build Game
Last updated: 2026-05-30
Related global design: `artifex/shared/todo-guide/global-portal-endpoint-registry-design-2026-05-29.md`

## Stable module rule

The Maze / Labyrinth editor loads permanent named modules only. Do not add numbered fix files, temporary wrappers or overlay hacks.

Current stable Maze modules:

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

## Approved baseline through V1.28

- Solution contains the live route/difficulty information and maker-only Show/Hide Solution behaviour.
- Features appears below Solution and Completion Rules remains a separate card derived from added features.
- Collect placement works on valid Overview path cells.
- Door and local Portal pairs can be placed and transferred through in Walk Test.
- Foe, Hazard and Traboule remain disabled until real runtime behaviour exists.
- Wall Form provides Blocks, Rounded and Organic; Organic is visibly distinct from Rounded.
- Rounded/Organic Walk Test does not flash back to the square-grid rendering layer.
- The old patch architecture and misleading Close Warped Gaps control are removed.

## V1.29 implemented — live test required

### Shared registered-content dependency

Permanent shared files now exist:

```text
artifex/shared/registered-content/registered-content-reader.js
artifex/shared/registered-content/registered-content-picker.js
artifex/shared/registered-content/README.md
```

These use the canonical final project content indexes:

```text
assets/asset-index.json                 final assets using asset_ IDs
archetypes/object-index.json            reusable gameplay objects using archobj_ IDs
archetypes/effect-index.json            reusable effects using archeffect_ IDs
```

The reader validates index schema, stable ID prefixes and final project-relative paths. It rejects intake files, external/browser URLs and legacy `artifex/assets-library/` catalogue paths as final game links.

The shared picker:

- opens a reusable Artifex-themed modal;
- searches accepted records by ID, name, type, final path, status and tags;
- reports missing/empty/invalid/unreadable/rejected record states honestly;
- includes Connect Folder / Authorise Folder / Folder Connected behaviour through `ArtifexProjectFolder`;
- returns a stable reference only after selecting a valid registered record;
- provides no raw upload or manual free-text final-link shortcut.

### Collect Archetype Object linking

`maze-features.js` now consumes the shared picker for Collect objects only.

Implemented behaviour:

- Each Collect row now has active **Link** functionality.
- Link opens the shared picker restricted to registered Archetype Objects.
- The picker can connect or reauthorise an Artifex project folder.
- A valid selection stores `archetypeObjectId`, display label and `archetypeReferenceSource` on that placed collection item.
- A linked row displays the selected object label and stable `archobj_` ID.
- A linked row offers **Replace** and **Unlink**.
- **Clear** removes the maze cell placement without silently removing the object link.
- Export now includes the linked reference fields and reports no-links, partial-links or complete-links status.
- No object reference is stored when the project folder/index is missing, empty or invalid.

### V1.29 test target

Test only this new visible stage before moving on to Door visuals:

1. Open Game Logic and add **Collect**.
2. Confirm each row has **Place**, **Link** and **Clear**, and the row initially states that no Archetype Object is linked.
3. Click **Link** and confirm the registered-content picker opens without a blank page or console-breaking module error.
4. Without a project folder connected, confirm the picker does not invent selectable objects and provides a **Connect Folder** action.
5. Connect an Artifex project folder. If `archetypes/object-index.json` is empty, confirm the picker honestly reports no registered objects.
6. If a project folder containing a valid `archobj_` indexed object is available, select it and confirm the Collect row displays its name/ID, then test **Replace** and **Unlink**.
7. Download JSON after a valid selection and verify the collection item contains `archetypeObjectId` and `archetypeReferenceSource: "archetypes/object-index.json"`.
8. Briefly confirm existing Place behaviour, Door/local Portal Walk Test transfer and Rounded/Organic Wall Form remain unbroken.

## Still unimplemented

- Door visual asset selection through registered `asset_` records.
- Portal registered visual/effect selection and shared global Portal Registry integration.
- Project production/promotion workflows that populate final asset/archetype indexes where missing.
- Completion Rule enforcement during Walk Test/game runtime.
- Foe and Hazard placement/setup/runtime behaviour.
- Traboule as a hidden pass-through wall collision override.
- Scatter decorations and lights.
- Tunnel Mode, first-person/3D renderer and helper pendant/crystal.
- Texture-aware joined Rounded/Organic surfaces, if later testing requires it.

## Ownership and linking contracts

### Collect objects

A placed Collect item stores its maze cell and a stable `archetypeObjectId` resolving to an `archobj_` record. The Archetype Object owns gameplay identity and linked visual assets. It must never resolve directly to a temporary upload or intake file.

### Doors

Door movement remains owned by `maze-connections.js`. The next linking stage may store `visualAssetId` resolving to a registered `asset_` record. A Door does not need to become a Portal or a global endpoint.

### Portals

Portal transfer is currently local/interim. Later, an endpoint may store registered `asset_` visual and optional `archeffect_` effect references, while destination relationships belong to the shared global Portal Registry.

### Scatter decorations

Scatter is later visual decoration only and should store registered `asset_` visual references, not object archetypes.

## Core workflow rule: Features first, Completion Rules second

Features define content added to the maze: Collection objects, Doors, Portals, later Foes, Hazards and Traboules. A feature-specific setup card must not appear until that feature has been added.

Completion Rules remains at the bottom of Quest Data and derives from existing features. Reach Exit is always mandatory. Collection, Door or Portal requirements only appear after those features exist, and the creator chooses whether they are mandatory.

## Feature specifications after V1.29

### Collection objects

Current state: placement and registered Archetype Object linking implemented; live test pending. Completion enforcement is still pending.

Required preserved behaviour:

- set object count and display one row per item;
- place on valid Overview path cells only;
- reject entrance, exit, other collection objects and Door/Portal endpoints;
- select only registered `archobj_` records through the shared picker;
- allow replacing/unlinking a reference without corrupting placement;
- let Completion Rules determine whether collection is mandatory.

### Door

Current state: local pair placement and Walk Test transfer implemented; visual asset selection is next after V1.29 Collect test passes.

### Portal

Current state: local paired placement and Walk Test transfer implemented as an interim function; global linking remains explicitly pending.

### Traboule

Current state: disabled. Later implementation must be a secret pass-through wall, not a Door subtype, Portal subtype or teleport pair.

### Foe and Hazard

Current state: disabled. They require real placement, archetype linkage, runtime behaviour and meaningful completion-rule integration before activation.

## Surface + Edit / Wall Form constraints

V1.28 Wall Form remains the approved presentation baseline:

- **Blocks** retains individual tile preview.
- **Rounded** shows joined softened continuous wall surfaces.
- **Organic** shows Warp-influenced flowing hedge/cave-like walls and must remain visibly distinct from Rounded.
- Wall Form changes visual presentation only; collision, route solving and feature placement remain cell-based.
- Rounded/Organic must remain opaque in Walk Test so the base square grid does not flash through.

## Future design notes

### Scatter card

Later decoration-only work may include light asset selection, up to five decorative image slots, density/seed/regenerate controls, and collision-free placement that avoids entrance, exit, collection items and connection endpoints.

### Tunnel Mode

Still requires design resolution for construction toggle location, gameplay visibility versus editor Overview, styles (Square Tunnel, Natural Cave, Pipe, Prism), real first-person/3D rendering, lighting, and the behaviour/appearance of Doors, Portals, Traboules and Collect objects.

### Helper pendant / crystal

Do not implement until mandatory objective tracking works. Later intended behaviour is to pulse toward the current mandatory target, dim on wrong branches and recalculate after required objects or connection events are satisfied.

## Next implementation order after V1.29 test

1. Verify Collect Link picker, empty state, valid selection, Unlink/Replace and JSON export.
2. Implement Door visual asset linking using registered `asset_` records.
3. Implement Scatter decorations/lights in a permanent Maze module using registered visual assets only.
4. Implement Traboule as a hidden collision override.
5. Implement shared/global Portal Registry integration across apps.
6. Define and implement Foe/Hazard feature behaviour.
7. Resolve Tunnel Mode design and implement renderer/lighting workflow.
8. Implement helper pendant/crystal after mandatory objective tracking works.

## Preserved baseline for every future stage

- No numbered patch files or transitional wrapper modules may reappear.
- Features and Completion Rules remain separate.
- Door and local Portal transfer must remain functional in Walk Test.
- Foe, Hazard and Traboule remain disabled unless real behaviour exists.
- Organic remains visibly distinct from Rounded.
- Rounded/Organic Walk Test must not flash the underlying square grid.
- Final gameplay records must not reference intake assets, arbitrary browser uploads or legacy unpromoted catalogue items as if they were project-final content.
