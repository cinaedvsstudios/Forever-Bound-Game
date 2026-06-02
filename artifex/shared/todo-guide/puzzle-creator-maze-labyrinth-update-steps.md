# Puzzle Creator · Maze / Labyrinth Update Steps

Status: V1.34 approved — puzzle-type landing screen and labelled shared workflow navigation accepted on `main`; Maze / Labyrinth remains the current playable authoring baseline
Owner: Puzzle Creator
Related modules: Project Manager, Scene Editor, Quest Builder, Archetype Object Creator, Asset Library, Build Game
Last updated: 2026-06-02
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

Implemented behaviour retained through V1.34:

- A **Scatter · Decoration + Light** section appears in the accepted **Colors** stage, beneath Wall Form and before the Colours workflow.
- The section is inactive until the maker clicks **Add**; switching it off clears authored positions.
- A **Decorative Lights** marker slot exists with an amount control and optional registered final visual asset selection.
- Up to five additional **Decoration Assets** marker slots may be added.
- **Place Markers** creates repeatable placeholder markers even when no visual asset has been linked.
- Typed amount and seed values apply when **Place Markers** is clicked without requiring Enter first.
- Optional **Link Light** / **Link Asset** actions use the registered-content picker restricted to final `asset_` records.
- Linking or unlinking a final asset preserves existing authored marker positions.
- Unlinked marker slots display honestly as placeholders pending a final visual asset.
- Scatter positions exclude the entrance, exit, Collect object cells and Door/Portal endpoint cells.
- Scatter has `collision: "none"` in export and never changes maze solving or Walk Test movement.
- Export stores authored slots and cells even while `visualAssetId` is null.

## V1.32 implemented and approved · Scatter placement modes

V1.32 responds to the live test feedback that random placement is inappropriate for functional lighting and can create over-concentrated decorative clusters.

Implemented behaviour:

- Every Scatter slot has its own **Placement** selector.
- **Decorative Lights** defaults to **Equal Distribution**.
- New decoration slots default to **Random**.
- Any light or decoration slot can use one of three modes:
  - **Random** — seeded random distribution that avoids placing the same slot's markers immediately beside one another where enough space exists.
  - **Equal Distribution** — spreads markers across walkable corridors using corridor distance so functional lighting is not bunched into one area.
  - **Around Main Solution Path** — spaces markers along the calculated start-to-exit route, adding nearby markers only where more positions are requested than can be placed directly on the route.
- Around Main Solution Path calculates its route independently of the visible solution overlay, so hiding the maker solution does not disable route-based placement.
- If no valid main route exists, Around Main Solution Path reports that it fell back to Equal Distribution rather than pretending it used a route.
- Placement mode is stored per slot in export as `placementMode`, and the Scatter schema is `artifex.mazeScatter.v2`.

Important limitation: Scatter placements remain authoring markers in **Overview only**. Actual linked asset images and light effects are not yet rendered in the large playable preview.

Approval note: on 2026-05-31 the user tested the V1.32 distribution-mode build and confirmed it was good.

## V1.33 implemented and approved · UI identity and Surface + Edit clarity

V1.33 was accepted on `main` following browser review on 2026-06-02 and is retained within V1.34.

Implemented and accepted behaviour:

- The app header correctly identifies **Artifex Puzzle Creator Module**, rather than incorrectly naming Quest Builder.
- The Scatter placement action is labelled **Place Markers** and uses the typed amount/seed values on click without requiring Enter first.
- The colour/surface stage is ordered as **Walls → Scatter → Colours**, keeping Wall Form and Scatter from interrupting the colour/texture/paint workflow.
- The existing Maze authoring, Walk Test and Scatter marker workflow were retained; no canonical saving or Quest integration was added.

## V1.34 implemented and accepted · puzzle-type landing screen and shared workflow navigation

V1.34 was merged to `main` through PR #42 on 2026-06-02 and is the current accepted Puzzle Creator UI-shell baseline.

Implemented behaviour:

- First opening Puzzle Creator presents a left-side **Choose a Puzzle Type** launcher rather than immediately entering Maze / Labyrinth.
- The right viewing area remains visually blank until a workflow is selected.
- The launcher lists the existing registered choices: **Maze / Labyrinth**, **Arena Trial**, **Obstacle Course**, **Symbol Assembly**, **Item Order Puzzle** and **Hazard Puzzle**.
- Selecting **Maze / Labyrinth** reveals the retained accepted Maze workflow without changing its puzzle mechanics.
- Once a workflow is selected, the navigation rail stays in the same location and uses visible labels beneath its icons: **Setup**, **Display**, **Logic** and **Colors**.
- The **Puzzles** menu offers a return to the chooser without deliberately clearing the currently authored state.
- The other listed puzzle types remain their existing early workflow state; V1.34 does not implement or claim completed gameplay editors for them.

Scope retained:

- no canonical connected-project puzzle saving;
- no Quest Builder `puzzleId` integration;
- no new Maze mechanic or Scatter placement algorithm changes;
- no Object Creator, sound or shared-service changes.

## Queued Scatter enhancement · Secondary Light Set / coverage fill

The next requested Scatter enhancement is a dedicated **second set of lights** for filling illumination gaps. This is not simply a fourth generic placement mode for any decoration: it is an additional functional light layer that depends on the primary **Decorative Lights** set.

Required behaviour:

- Add a control such as **+ Second Light Set** underneath or alongside the primary Decorative Lights slot.
- The second light set control must not be selectable until the primary Decorative Lights set exists with generated/authored light positions.
- The second light set is authored independently: it has its own amount control and optional registered final `asset_` light visual link, while still allowing placeholder-first placement.
- Its default placement behaviour is equal coverage that deliberately avoids areas already covered by the first light set.
- It must never place on the same cells as Light Set 1, start, exit, Collect objects, Door endpoints or Portal endpoints.
- Its placement algorithm should treat the first set's existing light cells as coverage anchors and choose the furthest valid corridor cells first, so it fills gaps rather than doubling up in already-lit areas.
- Where the maze no longer has sufficiently distant unlit space, it may place the furthest remaining valid cells, but the UI should report that full separation is limited by available corridor space.
- Changes to the first light set positions, maze layout or seed must safely regenerate or invalidate the second set so its avoid-first-set guarantee remains true.
- Export must store the second light set separately from the first, including its cells, optional final visual asset reference, and a relationship/placement status showing that it is a secondary coverage layer avoiding the primary light set.
- This remains marker-only authoring until playable-preview image/light rendering exists.

Suggested export direction when implemented:

```json
{
  "light": {
    "id": "scatter_light",
    "placementMode": "equal_distribution"
  },
  "secondaryLight": {
    "id": "scatter_light_secondary",
    "placementMode": "coverage_fill_avoiding_primary",
    "avoidsSlotId": "scatter_light"
  }
}
```

## Still unimplemented

- Secondary Light Set / coverage-fill placement avoiding the primary light set.
- Rendering selected Door images inside the playable preview.
- Rendering Scatter linked asset images or real light effects inside the playable preview.
- Portal registered visual/effect selection and shared global Portal Registry integration.
- Project production/promotion workflows that populate final asset/archetype indexes where missing.
- Completion Rule enforcement during Walk Test/game runtime.
- Foe and Hazard placement/setup/runtime behaviour.
- Traboule as a hidden pass-through wall collision override.
- Tunnel Mode, real first-person/3D renderer and helper pendant/crystal.
- Texture-aware joined Rounded/Organic surfaces, if later testing requires it.
- Canonical puzzle-index/content-file saving and live Quest Builder `puzzleId` handoff.

## Ownership and linking contracts

- **Collect objects:** placed cell plus stable `archetypeObjectId` resolving to a registered `archobj_` gameplay object.
- **Doors:** movement belongs to `maze-connections.js`; optional appearance is a registered final `visualAssetId` resolving to `asset_`.
- **Portals:** local transfer remains interim; later visual/effect references and global endpoint relationships belong to the Portal Registry design.
- **Scatter decorations/lights:** decorative non-collision authored cells may exist as placeholders first; optional later visual references must resolve to registered final `asset_` records. Placement distribution is stored per slot.
- **Secondary Light Set:** a second decorative-light layer only, dependent on existing primary light placements and responsible for filling underlit corridor areas without duplicating the first layer's coverage.

## Core workflow rule: Features first, Completion Rules second

Features define content in the maze. Completion Rules decides which gameplay features are mandatory. Scatter and its light layers do not appear in Completion Rules because they are decorative only.

## Next implementation order after V1.34 approval

1. Implement and test the Secondary Light Set / coverage-fill workflow within `maze-scatter-decorations.js`, only when selected as the next approved Puzzle Creator scope.
2. Implement Traboule as a hidden pass-through wall feature.
3. Implement shared/global Portal Registry integration across apps.
4. Define and implement Foe/Hazard feature behaviour.
5. Resolve Tunnel Mode design and implement renderer/lighting workflow.
6. Implement helper pendant/crystal only after mandatory objective tracking works.
7. Separately plan canonical `puzzles/` saving and Quest Builder integration under the project-file contract.

## Preserved baseline for every future stage

- The V1.34 landing screen and labelled shared workflow navigation remain intact unless deliberately revised.
- Maze / Labyrinth remains the currently developed playable editor until other puzzle engines receive dedicated implementation and acceptance.
- No numbered patch files or transitional wrapper modules may reappear.
- Features and Completion Rules remain separate.
- Scatter remains decoration-only and must not affect collision or completion rules.
- Scatter placeholder positions must remain usable without requiring fake or temporary final asset links.
- Secondary Light Set must not be enabled before primary light positions exist, and must avoid primary light coverage when implemented.
- Collect placement and registered Archetype Object linking remain functional.
- Door and local Portal transfer remain functional in Walk Test.
- Foe, Hazard and Traboule remain disabled unless real behaviour exists.
- Organic remains visibly distinct from Rounded.
- Rounded/Organic Walk Test must not flash the underlying square grid.
- Final gameplay/project records must not reference intake assets, browser-only uploads or legacy unpromoted catalogue items as final linked content.
