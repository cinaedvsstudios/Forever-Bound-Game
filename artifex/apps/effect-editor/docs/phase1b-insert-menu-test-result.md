# Phase 1B Insert Menu Test Result

## What was broken

The Artifex Effect Editor render baseline was restored, but the top Insert menu opened without usable populated entries. The editor UI contained the expected Insert accordion containers (`acc-base`, `acc-comp`, and `acc-cust`), but the menu population path was not reliably loading the preset registries into those containers.

The key cause addressed in this patch is that the preset files are ES module files with `export` statements. The editor was loading them as classic scripts, so the preset registry data was not available to the Insert menu builder.

## Files changed

- `artifex/apps/effect-editor/index.html`
- `artifex/apps/effect-editor/docs/phase1b-insert-menu-test-result.md`

## What was fixed

- Updated visible version text to `v2.3.2 PHASE 1B`.
- Loaded the base preset and composite preset files as modules.
- Added a Phase 1B preset module loader inside `index.html`.
- Made `PRESETS_REGISTRY` and `COMPOSITES_REGISTRY` update from the imported module exports.
- Rebuilt `initPresetLists()` so the Insert menu populates:
  - `Base Layer` with actual clickable base preset entries.
  - `Effect Archetype Assets` with actual composite/archetype entries.
  - `Custom Effect` with saved custom effects or an empty state.
- Added `addLayerFromPreset()` for adding real base preset layers from the Insert menu.
- Added `loadCompositePreset()` for loading real composite/archetype presets from the Insert menu.
- Added `renderCustomMenu()` as the custom effect menu renderer.
- Added clear fallback messages when base presets, archetype assets, or custom effects are unavailable.
- Added dropdown visibility support for the existing menu system without creating wrapper pages or overlay menus.

## Acceptance test steps

1. Open the Phase 1B test URL.
2. Confirm the grid appears.
3. Open `Insert`.
4. Confirm `Base Layer` has visible entries.
5. Click one `Base Layer` entry.
6. Confirm a layer is added to the layer stack.
7. Confirm particles visibly render.
8. Reopen `Insert`.
9. Expand/open `Effect Archetype Assets`.
10. Confirm archetype/composite entries are visible, or a clear fallback/empty state appears.
11. Click an archetype/composite if available.
12. Confirm particles still render.
13. Resize the side panel and bottom panel.
14. Confirm grid labels remain visible.
15. Confirm particles remain visible after resizing.
16. Confirm `File`, `Edit`, `View`, and `Help` still open.
17. Confirm the browser console has no new fatal errors from this Phase 1B change.

## Remaining issues

- Preview performance is still very slow.
- Performance tuning is intentionally postponed and was not attempted in this patch.
- The temporary wrapper file previously added on the branch is not used by this fix. The real app fix is in `index.html`.

## Areas intentionally not touched

This patch intentionally did not modify:

- render loop logic
- canvas scale logic
- resolution logic
- devicePixelRatio logic
- particle math
- particle update logic
- particle drawing logic
- brush rendering
- performance tuning

The goal of Phase 1B was only to restore real Insert menu population while preserving the working render baseline.
