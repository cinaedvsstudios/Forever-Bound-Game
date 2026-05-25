# FX Editor Phase 9J — Resolution, Noise, Snap, Helpers

## Added

- File > Settings now includes Scene / FX Resolution.
- Default logical FX resolution is 1280 x 720.
- Presets include 1120 x 630, 1920 x 1080, 1080 x 1080, 720 x 720, and 1080 x 1920.
- Exported editor projects and Effect Archetype Assets now include resolution metadata.
- Thumbnail capture now respects viewport zoom/pan. If the user zooms in before capturing, the thumbnail is captured from the zoomed viewport.
- View menu now includes Snap To Grid.
- Toolbar controls are icon-only with mouseover titles.
- Toolbar now has a helper visibility toggle next to view cycle.
- Effect Layer Dynamics now has Noise Grain controls for tiny dots/noise.
- Noise Grain includes enabled, density, dot size, alpha, color A, and color B.
- Runtime gravity now treats UI gravity as editor-scale gravity and internally multiplies it down, so 0.05 increments are useful and 1.0 behaves like a practical full gravity setting rather than an explosive per-frame force.

## Confirmed existing structure

- Shape Mode remains Shape / Brush / Custom.
- Effect Archetype Assets browser remains available as the thumbnail library window.
