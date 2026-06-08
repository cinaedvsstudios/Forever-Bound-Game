# FX Editor Phase 9F – Brush Quick Edit Repair

## What changed

- Top bar and side panel now use `charcolbg.jpg` from the same folder as `index.html`.
- Quick Edit Presets now avoid live blur and rely on brush PNG texture softness where possible.
- Brush PNGs with black backgrounds are converted at runtime into transparency using luminance/brightness alpha, so they no longer render as black or coloured square blocks.
- Added a Texture Contrast slider in the texture panel for brush/custom texture tuning.
- Added White Fog and Sooty Smoke as Appearance Helpers instead of keeping Smoke as a colour helper.
- Colour Helpers remain colour-only; they do not change layer speed, emitter, brush, or dynamics.
- Tight Trail now uses a smoother procedural ribbon with a glowing origin/head ball and longer fading tail.

## Brush requirement

The brush PNG folder should sit beside `index.html`:

```text
artifex/apps/effect-editor/brushes/
```

The editor expects filenames such as `Fog001.png`, `Fog2001.png`, `Particle02.png`, `Spark002.png`, `Line01.png`, `Line02.png`, `Burst01.png`, and `Wind.png`.
