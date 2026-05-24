# FX Repair Pass 1 — Runtime Upgrade

## Goal

Fix the core renderer problems that made several presets look cheap or misleading.

This pass does not re-add the removed bad base presets yet. It upgrades the renderer first so the existing composite effects can be checked, then the repaired base presets can be reintroduced deliberately.

## Changed files

```text
index.html
src/fx-runtime.js
```

Do not replace `src/presets.js` for this pass. Keep the current cleaned preset library.

## Runtime improvements

### True procedural ring / shockwave rendering

`effectType: "ring"` no longer depends on spraying circle particles. The runtime draws expanding stroked rings directly with glow, fading alpha, and looping pulse timing.

This should improve:

```text
Healing rings
Shield rings
Ground impact rings
Power-up ground rings
Shockwave-style composite layers
```

### True procedural ribbon rendering

`effectType: "ribbon"` now draws flowing tapered magic trails directly instead of relying on spark particles.

This should improve:

```text
Cyclone ribbon layers
Future magic trail presets
Slash/trail style effects
```

### Soft sprite smoke/gas rendering

`effectType: "gas"` now uses a cached radial soft particle sprite instead of solid circles plus expensive live blur.

This should improve:

```text
Smoke
Mist
Fog
Fire smoke
Shadow mist
Cursed fog
```

### Heat shimmer placeholder

`effectType: "refraction"` now draws subtle warm wavy lines as a cheap fake shimmer instead of blue mist. It is still not a real distortion shader, but it should no longer be completely conceptually wrong.

### Lens flare procedural rendering

`effectType: "lensflare"` now draws a horizontal flare streak with a bright centre glow instead of only star particles.

### Edge blur performance

The runtime now avoids expensive large blur filters on normal built-in shapes and gas particles. The better long-term direction is cached soft sprites or PNG textures, not live per-particle blur.

## What to test

```text
Page loads.
No red console errors.
Composite effects still load.
Ring layers look like rings/waves, not bursts of circles.
Ribbon layers look like flowing trails, not random particles.
Gas/smoke layers look softer and less dense.
Performance is better with smoke/gas than before.
Lens flare looks more horizontal/optical.
Export/import still works.
```

## After this passes

Re-add repaired base presets for:

```text
Magic Trail / Ribbon
Shockwave Ring
Soft Fog
Toxic Gas
Heat Shimmer
Lens Flare
```
