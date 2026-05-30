# Puzzle Creator · Maze / Labyrinth Update Steps

Status: V1.30 live test required — Door visual asset linking is wired through the shared registered-content picker
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
src/js/engines/maze-door-visual-linking.js
src/js/engines/maze-ui-polish.js
src/js/engines/maze-organic-wall-renderer.js
src/js/engines/maze-labyrinth-consolidation-loader.js
```

## Approved baseline through V1.29

- Solution contains the live route/difficulty information and maker-only Show/Hide Solution behaviour.
- Features appears below Solution and Completion Rules remains separate and derived from added features.
- Collect placement works on valid Overview path cells.
- Collect rows can link to registered Archetype Object records through the shared project-backed picker.
- Door and local Portal pairs can be placed and transferred through in Walk Test.
- Foe, Hazard and Traboule remain disabled until real runtime behaviour exists.
- Wall Form provides Blocks, Rounded and Organic; Organic is visibly distinct from Rounded.
- Rounded/Organic Walk Test does not flash back to the square-grid rendering layer.
- The old patch architecture and misleading Close Warped Gaps control are removed.

## Shared registered-content dependency

Permanent shared files:

```text
artifex/shared/registered-content/registered-content-reader.js
artifex/shared/registered-content/registered-content-picker.js
artifex/shared/registered-content/README.md
```

Canonical project-backed indexes:

```text
assets/asset-index.json                 final assets using asset_ IDs
archetypes/object-index.json            reusable gameplay objects using archobj_ IDs
archetypes/effect-index.json            reusable effects using archeffect_ IDs
```

The shared reader validates schemas, stable ID prefixes and final project-relative paths. It excludes intake files, external/browser URLs and legacy `artifex/assets-library/` catalogue paths from final authored links. The picker reports missing, empty or invalid indexes honestly; it does not offer raw upload or free-text final-link shortcuts.

## V1.29 approved · Collect Archetype Object linking

`maze-features.js` consumes the shared picker for Collect objects.

Approved behaviour:

- Each Collect row provides **Link**, **Replace** and **Unlink** as relevant.
- The picker is restricted to registered `archobj_` Archetype Object records.
- A valid selection stores `archetypeObjectId`, display label and `archetypeReferenceSource` on the Collect item.
- **Clear** removes placement without silently removing the selected Archetype Object.
- Export records no-links, partial-links or complete-links state.

Live approval note: the user tested the Collect setup on 2026-05-30 and confirmed it seemed good. Their screenshot showed active Collect linking controls, placed item markers and the approved Organic Wall Form presentation. The screenshot displayed an older visible header because the base GitHub Pages URL was opened without the release fresh-cache query; use a fresh-cache URL for release checks.

## V1.30 implemented · Door visual asset linking live test required

New permanent module:

```text
src/js/engines/maze-door-visual-linking.js
```

This module owns only the registered visual reference attached to an existing Door connection. Door creation, Entry/Exit placement, direction and Walk Test transfer remain owned by `maze-connections.js` and were not replaced.

Implemented behaviour:

- When a Door is selected, its setup card now shows **Door Visual Asset**.
- An unlinked Door states **No visual asset linked** and provides **Link Visual**.
- **Link Visual** opens the shared picker restricted to final registered `asset_` records.
- The picker supports connecting or reauthorising the project folder through the existing project-folder client.
- A valid selection stores `visualAssetId`, `visualAssetLabel` and `visualAssetReferenceSource` on that Door pair.
- A linked Door provides **Replace Visual** and **Unlink**.
- The Door instance list displays a visual-link note when a final asset has been selected.
- The obsolete generic “Image/FX selection later” message is hidden for a selected Door because Door visual selection now exists; Portal pending messaging remains honest and unchanged.
- The Door pair is already exported by `maze-connections.js`, so these stored reference fields flow into the exported Door connection record.

Important limitation: V1.30 links and exports the selected final Door visual asset. It does **not** yet draw the selected Door image over the playable preview; the editor continues showing connection endpoint markers. This is stated directly in the visible Door control and must not be presented as rendered imagery until a rendering pass exists.

### V1.30 focused live test

Use a fresh-cache URL and test only this new stage plus essential regressions:

1. Confirm the header shows **V1.30**.
2. Open Game Logic, add a **Door**, and place its Entry and Exit cells.
3. With the Door selected, confirm a **Door Visual Asset** block appears with **Link Visual** and an honest “No visual asset linked” state.
4. Confirm the old generic Door “Image/FX selection later” message is not shown while a Door is selected; when a Portal is selected, Portal pending/global-registry messaging must remain visible.
5. Click **Link Visual** and confirm the shared picker opens restricted to final assets and includes project-folder connection behaviour.
6. If there are no valid `asset_` index records, confirm the picker reports this honestly and does not create a visual link.
7. If a valid final `asset_` record exists, select it and confirm the Door block changes to **Replace Visual** / **Unlink** and the Door list shows the visual label.
8. Download JSON after linking and verify the Door record contains `visualAssetId` and `visualAssetReferenceSource: "assets/asset-index.json"`.
9. Use **Unlink** and confirm Entry/Exit placement and direction are preserved.
10. Briefly verify Door/local Portal transfer in Walk Test, Collect linking, and Rounded/Organic Wall Form remain unbroken.

## Still unimplemented

- Rendering a selected linked Door image inside the playable preview, if a later visual pass requires it.
- Portal registered visual/effect selection and shared global Portal Registry integration.
- Project production/promotion workflows that populate final asset/archetype indexes where missing.
- Completion Rule enforcement during Walk Test/game runtime.
- Foe and Hazard placement/setup/runtime behaviour.
- Traboule as a hidden pass-through wall collision override.
- Scatter decorations and lights.
- Tunnel Mode, real first-person/3D renderer and helper pendant/crystal.
- Texture-aware joined Rounded/Organic surfaces, if later testing requires it.

## Ownership and linking contracts

### Collect objects

A placed Collect item stores its maze cell and a stable `archetypeObjectId` resolving to an `archobj_` record. The Archetype Object owns gameplay identity and linked visual assets. It must never resolve directly to a temporary upload or intake file.

### Doors

Door behaviour remains owned by `maze-connections.js`. A Door visual stores `visualAssetId` resolving to a registered final `asset_` record; this does not turn the Door into a Portal or global endpoint.

### Portals

Portal transfer is currently local/interim. Later, an endpoint may store registered `asset_` visual and optional `archeffect_` effect references, while destination relationships belong to the shared global Portal Registry.

### Scatter decorations

Scatter is later visual decoration only and should store registered `asset_` visual references, not object archetypes.

## Core workflow rule: Features first, Completion Rules second

Features define content added to the maze: Collection objects, Doors, Portals, later Foes, Hazards and Traboules. A feature-specific setup card must not appear until that feature has been added.

Completion Rules remains at the bottom of Quest Data and derives from existing features. Reach Exit is always mandatory. Collection, Door or Portal requirements only appear after those features exist, and the creator chooses whether they are mandatory.

## Feature status after V1.30

### Collection objects

Current state: placement and registered Archetype Object linking are approved. Completion enforcement remains pending.

### Door

Current state: local pair placement, Walk Test transfer and registered visual asset linking implemented. Live test of visual linking is pending. Linked asset rendering is not yet implemented.

### Portal

Current state: local paired placement and Walk Test transfer implemented as an interim function; global linking and visual/effect selection remain explicitly pending.

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

## Next implementation order after V1.30 test

1. Verify Door Link Visual picker, honest empty state, valid asset selection, Replace/Unlink and JSON export.
2. Implement Scatter decorations/lights in a permanent Maze module using registered visual assets only, unless a separate Door image-rendering pass is prioritised first.
3. Implement Traboule as a hidden collision override.
4. Implement shared/global Portal Registry integration across apps.
5. Define and implement Foe/Hazard feature behaviour.
6. Resolve Tunnel Mode design and implement renderer/lighting workflow.
7. Implement helper pendant/crystal after mandatory objective tracking works.

## Preserved baseline for every future stage

- No numbered patch files or transitional wrapper modules may reappear.
- Features and Completion Rules remain separate.
- Collect placement and registered Archetype Object linking must remain functional.
- Door and local Portal transfer must remain functional in Walk Test.
- Foe, Hazard and Traboule remain disabled unless real behaviour exists.
- Organic remains visibly distinct from Rounded.
- Rounded/Organic Walk Test must not flash the underlying square grid.
- Final gameplay records must not reference intake assets, arbitrary browser uploads or legacy unpromoted catalogue items as if they were project-final content.
