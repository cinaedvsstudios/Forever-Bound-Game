# Artifex Shimmer / Portal Distortion Engine Preview

V1.24 fixes the Portal Ring line outline and adds Wormhole arm definition.

## V1.24 changes

```text
Portal Ring line outline is now drawn after the cloudy rim/particles so it is no longer hidden by the portal body.
Portal Ring line outline uses source-over for the main coloured stroke so chosen colours/gradients are not washed into cyan.
Portal Ring radial line gradient now uses a conic-style ring gradient when supported, which is visibly meaningful on a circular outline.
Portal Ring line thickness slider now has a 0-300 range and the renderer uses the extended thickness range.
Portal Ring line glow is still additive, but it no longer overrides the selected line colour as the main visible stroke.
Added Arm Definition for Wormhole.
Arm Definition makes wormhole arms sharper/more strand-like so they separate visually from Orbit Clouds.
Heat Shimmer and Transition Tear now hide irrelevant cards such as Portal Line, Arms, Orbit Clouds, Particles, Emission and Overlay.
Control-card visibility updates live when switching effect type.
```

## Test URL after upload

```text
https://raw.githack.com/cinaedvsstudios/Forever-Bound-Game/main/artifex/apps/fx-shimmer-preview/index.html?v=124
```
