# Puzzle Creator · Maze / Labyrinth Update Steps

Status: V1.31 live test required — Scatter positions can now be authored before optional final visual asset linking
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

## V1.31 implemented · Scatter decorations and lights live test required

New permanent module:

```text
src/js/engines/maze-scatter-decorations.js
```

Scatter is decoration-only. It does not define objectives, collision, route logic or transfer behaviour.

Implemented behaviour:

- A new **Scatter · Decoration + Light** card appears in **04 · Surface + Edit**, beneath Wall Form.
- The card is inactive until the maker clicks **Add**; switching it off clears authored positions.
- A **Decorative Lights** marker slot exists with an amount control and optional registered final visual asset selection.
- Up to five additional **Decoration Assets** marker slots may be added.
- **Regenerate** creates repeatable placeholder markers from configured amounts even when no visual asset has been linked yet.
- The optional **Link Light** / **Link Asset** actions use the shared registered-content picker restricted to valid final `asset_` records.
- Linking or unlinking a final asset does not delete or move existing authored marker positions.
- Unlinked marker slots display honestly as placeholders pending a final visual asset.
- A deterministic numeric seed and **Regenerate** action place repeatable marker positions on open path cells.
- Scatter positions exclude the entrance, exit, Collect object cells and Door/Portal endpoint cells.
- Scatter has `collision: "none"` in export and never changes maze solving or Walk Test movement.
- **Clear Positions** and turning Scatter off repaint Overview cleanly so old marker positions do not remain visible.
- Export stores the authored light/decoration slots and cells even while `visualAssetId` is null, with `visualLinkStatus: "placeholder_pending_final_asset"`; linked slots store final asset reference fields.

Important limitation: V1.31 displays Scatter placements as small authoring markers in **Overview only**. It does not yet render linked asset images in the large playable preview. This limitation is stated in the visible UI and recorded in export status.

### V1.31 focused live test

1. Confirm the header displays **V1.31**.
2. Open **Surface + Edit** and confirm a **Scatter · Decoration + Light** card appears beneath **Wall Form**.
3. Click **Add** and confirm the Decorative Lights row, Decoration Assets section, Seed, Regenerate and Clear Positions controls appear.
4. Without linking any asset, set the light amount and click **Regenerate**. Confirm placeholder light markers appear in Overview.
5. Add one or more Decoration Assets slots, set their amount and click **Regenerate**. Confirm their placeholder markers appear without requiring an asset link; no more than five decoration slots may exist.
6. Confirm markers do not occupy entrance, exit, Collect markers or Door/Portal endpoint cells.
7. Change the seed and regenerate; confirm marker positions change. Reuse the same seed and confirm positions repeat.
8. Optionally click **Link Light** or **Link Asset** and confirm the shared picker opens restricted to final registered assets, with honest no-folder/no-record behaviour when applicable.
9. Where a valid final `asset_` record exists, link or unlink it and confirm the existing marker positions remain in place.
10. Use **Clear Positions** and toggle Scatter off; confirm removed markers do not remain on Overview.
11. Download JSON and confirm `puzzle.scatterDecorations` contains `collision: "none"`, generated cells and honest null/pending visual links where assets were not selected.
12. Briefly confirm existing Door/Portal Walk Test transfer, Collect linking and Rounded/Organic Wall Form remain unbroken.

## Still unimplemented

- Rendering selected Door images inside the playable preview.
- Rendering Scatter linked asset images/lights inside the playable preview.
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
- **Scatter decorations/lights:** decorative non-collision authored cells may exist as placeholders first; optional later visual references must resolve to registered final `asset_` records.

## Core workflow rule: Features first, Completion Rules second

Features define content in the maze. Completion Rules decides which gameplay features are mandatory. Scatter does not appear in Completion Rules because it is decorative only.

## Next implementation order after V1.31 test

1. Verify Scatter placeholder-first placement, optional final asset linking, deterministic positions, exclusion rules, clearing and JSON export.
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
