# FX Editor Phase 9E — Brush Quick Edits + Reference Plate View

## Main changes

- Quick Edit Presets now prefer brush PNGs instead of live blur-heavy procedural shapes.
- Added Reset Layer to Default.
- Added Colour Helpers: Fire, Ice, Water, Dark Magic, Good Magic, Evil, Smoke.
- Tight Trail now uses longer lifespan and a fading ribbon tail instead of a hard cut-off.
- Added a View Cycle button next to Camera: Dark → White → Reference.
- Added View menu option to choose a reference image or video plate.
- When a video reference is loaded, a second control strip appears under the pause/camera/view controls with play/pause, previous frame, and next frame.

## Brush assumptions

The quick edit buttons now reference brush files at:

`artifex/apps/effect-editor/brushes/`

Expected filenames include:

- `Fog001.png`
- `Fog2001.png`
- `Fog3001.png`
- `Fire_Blur.png`
- `Fire_Single.png`
- `Line01.png`
- `Line02.png`
- `Particle01.png`
- `Particle02.png`
- `Burst01.png`
- `Spark002.png`
- `Shockwave.png`
- `Thunder10.png`
- `Thunder_Bold.png`
- `Wind.png`
- `Crystal001.png`
- `kirakira.png`

If the brush folder or filenames are missing, the runtime falls back safely, but the quick edits will not look correct until the PNGs exist at those paths.

## Test checklist

1. Open the FX Editor.
2. Select or insert a layer.
3. Try Reset Layer to Default.
4. Try each Quick Edit button.
5. Confirm the quick edits avoid Particle Softness / live blur.
6. Try the Colour Helpers.
7. Try Tight Trail and check that the trail fades instead of cutting off abruptly.
8. Click the new View Cycle button next to Camera and confirm Dark → White → Reference cycles.
9. In View menu, choose an image reference and confirm it appears behind the effect.
10. In View menu, choose a video reference and confirm video controls appear under the main buttons.
11. Confirm exports remain effect-only and do not include the reference image/video.
