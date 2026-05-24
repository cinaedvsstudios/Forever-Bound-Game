# FX Editor UI Controls Pass

## Changed

- Moved the top menu further right after the Artifex logo/title divider.
- Added a new sidebar card: `Quick Edit Presets`.
- Added one-click quick edit helpers for selected layers:
  - Soft Glow
  - Sharp Sparks
  - Fade In/Out
  - Bright Add
  - Slow Drift
  - Burst Out
  - Rise Up
  - Tight Trail
- Added `Rotate Shape` control under `Colour, Size & Finish`.
- Added runtime support for `visual.rotation` on built-in shapes and PNG texture sprites.
- Replaced the two overlapping blur controls with one `Particle Softness` slider.
- Capped live blur to max `5` for performance.
- Forced legacy `edgeBlur` to `0` in UI normalization so it no longer stacks with blur.
- Expanded blend modes beyond the original three options.
- Reworked colour rows so each colour has:
  - Start Alpha
  - End Alpha
- Added runtime support for `visual.alphaStarts` and `visual.alphaEnds`.
- Added info icons to the main subsection headers with explanatory tooltips.

## Testing checklist

1. Open the editor and confirm File/Edit/View/Insert/Help are shifted further right.
2. Confirm Quick Edit Presets appears under the archetype card.
3. Insert or select a layer, then test the Quick Edit buttons.
4. Test Rotate Shape with a spear, shard, capsule, or custom PNG.
5. Confirm there is only one softness/blur slider and it stops at 5.
6. Confirm blend mode dropdown has the expanded options.
7. Confirm each colour row has Start Alpha and End Alpha.
8. Confirm no red console errors.
