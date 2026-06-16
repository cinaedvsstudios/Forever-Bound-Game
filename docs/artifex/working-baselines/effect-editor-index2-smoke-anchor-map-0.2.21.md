# Effect Editor Working Baseline — INDEX2-SMOKE-ANCHOR-MAP-0.2.21

Date locked: 2026-06-16

## Purpose

This baseline locks the first accepted smoke integration state after the standalone Smoke Engine behaviour was mapped into Artifex and the marker anchor problem was corrected.

## Version

`INDEX2-SMOKE-ANCHOR-MAP-0.2.21`

## GitHub Pages test URL

`https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/effect-editor/index.html?smoke-anchor-map-043=1`

## Baseline branch

`working/index2-smoke-anchor-021`

## Baseline commit

`de689234d4a069f28b7c21cf62ac88c761d041f6`

## Current accepted behaviour

- Old particle/structured effects still work.
- Prototype effects render visibly.
- Smoke presets use their own smoke mode identities instead of all falling back to Rising Smoke.
- Smoke controls are connected to the visible smoke renderer.
- Smoke marker movement is acceptable again:
  - Rising Smoke uses the marker as its plume centre.
  - Wispy / Incense Smoke uses the marker as its wisp field centre.
  - Smoke Vignette shifts around the marker.
  - Full Screen Smoke shifts its smoke field around the marker.
  - Chimney Smoke uses the marker/source point.
- Pause/play sync remains working for prototype effects.
- Marker sync remains working for shimmer and smoke.

## Relevant commits in this smoke pass

- `8501e7ea438282fb131db999e5309675bd72beb6` — Render smoke modes from original smoke engine logic.
- `8c48104ac10a11a7ddb8b85ef283d232a141a1e4` — Bump Effect Editor version for source smoke renderer.
- `6de4a08ee8ef4e87f074caa50fcac014370cab1c` — Refresh Effect Editor cache for source smoke renderer.
- `83eb8584d4caba9ee1b3484ebf8dbe3d19ae05e9` — Preserve prototype layer fields during normalization.
- `99c6ac1bfa3ec6ef6ef85287160801760f4ec5f5` — Bind smoke mode control to prototype mode.
- `7338dd2564efc761d50bc2d38db25adbddc4112f` — Add anchored smoke prototype renderer.
- `f6c65e6e773a93de13bc30cb9ecada8a8ae4d0b2` — Route prototype rendering through anchored smoke adapter.
- `e8b0b5c91fe109bc37e6f9ed7c790056c07be820` — Bump Effect Editor version for anchored smoke renderer.
- `de689234d4a069f28b7c21cf62ac88c761d041f6` — Restore full Effect Editor index cache.

## Files touched in this pass

- `artifex/apps/effect-editor/index.html`
- `artifex/apps/effect-editor/v3/src/index2-app.js`
- `artifex/apps/effect-editor/v3/src/editor-renderer.js`
- `artifex/apps/effect-editor/v3/src/editor-state.js`
- `artifex/apps/effect-editor/v3/src/prototype-adapters/smoke-controls.js`
- `artifex/apps/effect-editor/v3/src/prototype-adapters/prototype-renderers.js`
- `artifex/apps/effect-editor/v3/src/prototype-adapters/prototype-renderers-anchored.js`

## Warning

Do not revive the rejected `INDEX2-SMOKE-MODE-SHAPES-0.2.19` direction. That pass invented smoke differences instead of preserving the old Smoke Engine logic.

## Next planned work

Step 6: Shimmer / Portal renderer fidelity. Use the accepted standalone `fx-shimmer` prototype as the source of truth. Do not invent portal, wormhole, heat shimmer, or transition tear behaviour manually.
