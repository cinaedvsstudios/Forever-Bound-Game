# CG Effects Library

## Purpose

The CG Effects Library is a future Artifex utility for creating, previewing, configuring, saving, and reusing visual effects.

The portal proved that Artifex can generate atmospheric effects using browser code and math.

Examples already proven in the portal:

```text
Fog / mist particles
Sparks / embers
Firelight flicker
Hover glow
Magic pulse
Procedural audio effects
```

Instead of manually coding fog, sparks, magic swirls, glowing particles, rain, smoke, etc. every time, the creator should be able to choose an effect from a library and attach it to a scene.

## Possible Effects

```text
Fog
Mist
Sparks
Embers
Magic Swirls
Purple Arcane Glow
Firelight Flicker
Rain
Snow
Dust
Floating Pollen
Smoke
Lightning Pulse
Portal Glow
Water Shimmer
Heat Haze
```

## Editable Settings

Each effect should have editable settings:

```text
Particle count
Speed
Direction
Colour
Opacity
Size range
Spawn area
Blend mode
Loop behaviour
Layer/depth
Trigger condition
Preview on/off
```

## Recommended Architecture

```text
artifex/apps/effects-library/
artifex/effects/
```

Possible reusable effect files:

```text
artifex/effects/fx_fog.js
artifex/effects/fx_sparks.js
artifex/effects/fx_magic_swirl.js
artifex/effects/fx_firelight.js
artifex/effects/fx_portal_glow.js
artifex/effects/fx_rain.js
artifex/effects/fx_snow.js
artifex/effects/fx_dust.js
```

Each effect module should expose a predictable interface:

```js
export function createEffect(config) {
  return {
    update(deltaTime) {},
    draw(ctx) {},
    destroy() {}
  };
}
```

## Example Effect JSON

```json
{
  "id": "forest_mist_low",
  "type": "fog",
  "label": "Low Forest Mist",
  "enabled": true,
  "layer": 4,
  "settings": {
    "particleCount": 40,
    "colour": "rgba(200, 210, 230, 0.12)",
    "speedX": 0.8,
    "speedY": 0.05,
    "sizeMin": 80,
    "sizeMax": 220,
    "blendMode": "screen",
    "spawn": "left"
  }
}
```

## Example Scene JSON Effect Block

```json
{
  "effects": [
    {
      "id": "forest_low_mist",
      "type": "fog",
      "module": "fx_fog",
      "layer": 6,
      "enabled": true,
      "bounds": { "x": 0, "y": 420, "width": 1280, "height": 300 },
      "settings": {
        "particleCount": 40,
        "speedX": 0.8,
        "speedY": 0.05,
        "opacity": 0.12,
        "sizeMin": 80,
        "sizeMax": 220,
        "colour": "rgba(200, 210, 230, 0.12)",
        "blendMode": "screen"
      }
    }
  ]
}
```

## Scene Editor Integration

The Scene Editor should eventually allow:

```text
Add CG Effect
Add Effect
Choose from library
Choose effect type
Preview live
Preview effect live
Edit settings
Edit settings sliders
Set layer
Set spawn bounds
Save into scene JSON
Save effect config into scene JSON
Export effect preset
Import effect preset
```

The CG Effects Library should store reusable presets so the same fog, sparks, or magic swirl can be reused across multiple scenes.

This turns visual atmosphere into reusable data, not one-off custom code.
