# Puzzle Creator · Maze / Labyrinth Update Steps

Status: V1.32 live test required — Scatter supports Random, Equal Distribution and Around Main Solution Path placement modes
Owner: Puzzle Creator
Related modules: Project Manager, Scene Editor, Quest Builder, Archetype Object Creator, Asset Library, Build Game
Last updated: 2026-05-31
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
src/js/engines/maze-scatter-decorations.js
src/js/engines/maze-labyrinth-consolidation-loader.js
```

## Approved baseline through V1.30 correction

- Solution contains live route/difficulty information and maker-only Show/Hide Solution behaviour.
- Features remains separate from Completion Rules.
- Collect placement works and Collect rows may link to registered `archobj_` Archetype Object records through the shared picker.
- Door and local Portal pairs can be placed and transfer through in Walk Test.
- Door endpoint markers now remain aligned with the same cells in Overview and the large preview, including the preview pan/zoom/Warp transform.
- The visible version override no longer forces the header back to V1.28.
- Foe, Hazard and Traboule remain disabled until real runtime behaviour exists.
- Wall Form provides Blocks, Rounded and Organic; Organic remains visibly distinct from Rounded.
- Rounded/Organic Walk Test does not flash back to the square-grid rendering layer.
- No old numbered patch architecture is active.

Approval note: on 2026-05-31 the user confirmed the Door endpoint alignment and version-display correction were good after testing the corrected V1.30 build.

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

The reader/picker validates stable final records and excludes intake files, external/browser URLs and legacy unpromoted catalogue paths. Missing or empty indexes are reported honestly.

## Implemented registered-link features

### Collect Archetype Object linking · V1.29 approved

- Collect rows provide **Link**, **Replace** and **Unlink** as relevant.
- Selection is restricted to valid registered `archobj_` records.
- A valid selection stores `archetypeObjectId`, label and `archetypeReferenceSource`.
- **Clear** removes placement without silently removing its linked Archetype Object.

### Door visual asset linking · V1.30 implemented

- A selected Door provides **Door Visual Asset** with **Link Visual**, **Replace Visual** and **Unlink** as relevant.
- Selection is restricted to final registered `asset_` records.
- A valid selection stores `visualAssetId`, `visualAssetLabel` and `visualAssetReferenceSource` on the Door pair.
- Door movement, placement and Walk Test transfer remain independent from visual selection.
- This is currently a stored/exported visual reference; linked Door artwork is not drawn in the playable preview yet.

The Door endpoint positioning correction has been approved. Full Door visual-picker selection/export can still be confirmed when a suitable registered final `asset_` record is available.

## V1.31 implemented · Scatter placeholder-first authoring

New permanent module:

```text
src/js/engines/maze-scatter-decorations.js
```

Scatter is decoration-only. It does not define objectives, collision, route logic or transfer behaviour.

Implemented behaviour retained in V1.32:

- A **Scatter · Decoration + Light** card appears in **04 · Surface + Edit**, beneath Wall Form.
- The card is inactive until the maker clicks **Add**; switching it off clears authored positions.
- A **Decorative Lights** marker slot exists with an amount control and optional registered final visual asset selection.
- Up to five additional **Decoration Assets** marker slots may be added.
- **Regenerate** creates repeatable placeholder markers even when no visual asset has been linked.
- Optional **Link Light** / **Link Asset** actions use the registered-content picker restricted to final `asset_` records.
- Linking or unlinking a final asset preserves existing authored marker positions.
- Unlinked marker slots display honestly as placeholders pending a final visual asset.
- Scatter positions exclude the entrance, exit, Collect object cells and Door/Portal endpoint cells.
- Scatter has `collision: "none"` in export and never changes maze solving or Walk Test movement.
- Export stores authored slots and cells even while `visualAssetId` is null.

## V1.32 implemented · Scatter placement modes live test required

V1.32 responds to the live test feedback that random placement is inappropriate for functional lighting and can create over-concentrated decorative clusters.

Implemented behaviour:

- Every Scatter slot now has its own **Placement** selector.
- **Decorative Lights** defaults to **Equal Distribution**.
- New decoration slots default to **Random**.
- Any light or decoration slot can use one of three modes:
  - **Random** — seeded random distribution that avoids placing the same slot's markers immediately beside one another where enough space exists.
  - **Equal Distribution** — spreads markers across walkable corridors using corridor distance so functional lighting is not bunched into one area.
  - **Around Main Solution Path** — spaces markers along the calculated start-to-exit route, adding nearby markers only where more positions are requested than can be placed directly on the route.
- Around Main Solution Path calculates its route independently of the visible solution overlay, so hiding the maker solution does not disable route-based placement.
- If no valid main route exists, Around Main Solution Path reports that it fell back to Equal Distribution rather than pretending it used a route.
- Placement mode is stored per slot in export as `placementMode`, and the Scatter schema advances to `artifex.mazeScatter.v2`.

Important limitation: Scatter placements remain authoring markers in **Overview only**. Actual linked asset images and light effects are not yet rendered in the large playable preview.

### V1.32 focused live test

1. Confirm the header displays **V1.32**.
2. Open **Surface + Edit → Scatter · Decoration + Light** and turn Scatter on.
3. Confirm **Decorative Lights** has a **Placement** selector defaulting to **Equal Distribution**.
4. Set lights to a visible amount such as `20` or `30`, regenerate, and confirm the markers are substantially more evenly spread through walkable corridors than the previous clustered random result.
5. Change lights to **Random**, regenerate, and confirm it produces a different, looser seeded scatter pattern.
6. Change lights to **Around Main Solution Path**, regenerate, and confirm the light markers follow the visible solution route pattern rather than covering unrelated branches.
7. Add a Decoration Asset slot and confirm its Placement selector defaults to **Random** and can independently be changed to either other mode.
8. Change the Seed, regenerate, then reuse the same Seed and mode; confirm the generated positions repeat.
9. Confirm markers continue to avoid entrance, exit, Collect items and Door/Portal endpoints.
10. Download JSON and confirm `puzzle.scatterDecorations` uses schema `artifex.mazeScatter.v2` and each slot stores a `placementMode` value.
11. Briefly confirm Door/Portal Walk Test transfer, Collect linking and Rounded/Organic Wall Form remain normal.

## Still unimplemented

- Rendering selected Door images inside the playable preview.
- Rendering Scatter linked asset images or real light effects inside the playable preview.
- Portal registered visual/effect selection and shared global Portal Registry integration.
- Project production/promotion workflows that populate final asset/archetype indexes where missing.
- Completion Rule enforcement during Walk Test/game runtime.
- Foe and Hazard placement/setup/runtime behaviour.
- Traboule as a hidden pass-through wall collision override.
- Tunnel Mode, real first-person/3D renderer and helper pendant/crystal.
- Texture-aware joined Rounded/Organic surfaces, if later testing requires it.

## Ownership and linking contracts

- **Collect objects:** placed cell plus stable `archetypeObjectId` resolving to a registered `archobj_` gameplay object.
- **Doors:** movement belongs to `maze-connections.js`; optional appearance is a registered final `visualAssetId` resolving to `asset_`.
- **Portals:** local transfer remains interim; later visual/effect references and global endpoint relationships belong to the Portal Registry design.
- **Scatter decorations/lights:** decorative non-collision authored cells may exist as placeholders first; optional later visual references must resolve to registered final `asset_` records. Placement distribution is stored per slot.

## Core workflow rule: Features first, Completion Rules second

Features define content in the maze. Completion Rules decides which gameplay features are mandatory. Scatter does not appear in Completion Rules because it is decorative only.

## Next implementation order after V1.32 test

1. Verify Scatter placement modes, placeholder-first placement, deterministic positions, exclusion rules and JSON export.
2. Implement Traboule as a hidden pass-through wall feature.
3. Implement shared/global Portal Registry integration across apps.
4. Define and implement Foe/Hazard feature behaviour.
5. Resolve Tunnel Mode design and implement renderer/lighting workflow.
6. Implement helper pendant/crystal only after mandatory objective tracking works.

## Preserved baseline for every future stage

- No numbered patch files or transitional wrapper modules may reappear.
- Features and Completion Rules remain separate.
- Scatter remains decoration-only and must not affect collision or completion rules.
- Scatter placeholder positions must remain usable without requiring fake or temporary final asset links.
- Collect placement and registered Archetype Object linking remain functional.
- Door and local Portal transfer remain functional in Walk Test.
- Foe, Hazard and Traboule remain disabled unless real behaviour exists.
- Organic remains visibly distinct from Rounded.
- Rounded/Organic Walk Test must not flash the underlying square grid.
- Final gameplay/project records must not reference intake assets, browser-only uploads or legacy unpromoted catalogue items as final linked content.
