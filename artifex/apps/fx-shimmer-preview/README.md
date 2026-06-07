# Artifex Shimmer / Portal Distortion Engine Preview

This is a standalone prototype for the next FX engine after the smoke prototype.

It is intentionally placed in:

```text
artifex/apps/fx-shimmer-preview/
```

It does not replace the real FX Editor yet. It proves the visual/runtime behaviour first.

## What it does

The prototype renders browser-canvas distortion effects for:

```text
Portal shimmer
Heat shimmer / mirage refraction
Dream ripple / limbo overlay
Transition tear / magical fracture
```

The preview includes:

```text
Preset list
Live canvas preview
Shape controls
Distortion controls
Visual/glow controls
Colour controls
Placement/playback controls
Export Editor Project JSON
Export Artifex FX Asset JSON
```

## Test URL after upload

After copying this folder into the repo and pushing to `main`, open:

```text
https://raw.githack.com/cinaedvsstudios/Forever-Bound-Game/main/artifex/apps/fx-shimmer-preview/index.html
```

Add a cache-busting suffix if needed:

```text
https://raw.githack.com/cinaedvsstudios/Forever-Bound-Game/main/artifex/apps/fx-shimmer-preview/index.html?v=1
```

## Future integration note

Later, this should be integrated into the real FX Editor as a reusable engine type:

```text
engine: shimmer-distortion
```

The final editor should save the editable project separately from the runtime-facing FX asset, matching the FX Editor documentation.
