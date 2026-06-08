# Effect Editor Preset Library Audit

## Purpose

This file records the current Effect Editor preset naming pass and the behaviour check for each built-in effect library entry.

The names now follow a clearer pattern:

```text
Base · [Effect Type]
[Element/Use] Magic · [Specific Effect]
Power-Up · [Specific Effect]
```

This keeps the Insert menu readable and makes it clearer which entries are primitive base effects versus composed multi-layer effects.

## Important note

This is a configuration-level audit. The values were checked against their intended behaviour by reading the emitter, physics, visual, blend, alpha, and layer settings. A final visual pass in the browser is still recommended because particle effects can feel different from their data once animated.

## Base Effect Library

| ID | Standardised name | Config behaviour | Looks logically correct? | Notes / question |
|---|---|---|---|---|
| `electric-sparks` | `Base · Electric Sparks` | Narrow emitter, fast warm spark particles, downward gravity, additive glow. | Yes | Good primitive for sparks, fire embers, electrical fragments. |
| `sword-slash` | `Base · Ribbon Trail` | Very short-lived blue-white spark/ribbon trail with almost no spread. | Mostly | This is currently still spark-shaped, not a true curved ribbon. Should this be renamed `Base · Slash Trail` or kept as generic ribbon? |
| `shockwave` | `Base · Expanding Shockwave` | Ring-style burst expanding outward with blue-white glow. | Yes | Good base ring/shockwave primitive. |
| `tesla-bolt` | `Base · Electric Discharge` | Short-lived blue-white spark particles with chaotic 360 spread. | Mostly | Reads more like electric discharge/sparks than a continuous lightning bolt. Name now reflects that. |
| `fireball` | `Base · Fireball Core` | Warm glowing projectile core moving horizontally. | Yes | Good base projectile, but not a full fireball trail by itself. |
| `generic-fog` | `Base · Wide Rolling Fog` | Large slow grey-white puffs over a wide emitter with screen blend. | Yes | Good fog/mist base. |
| `toxic-bubble-fog` | `Base · Toxic Gas Bubbles` | Green rising gas/bubble particles with slight orbital drift. | Yes | Good toxic gas primitive. |
| `heat-shimmer` | `Base · Heat Shimmer` | Soft rising screen-blended particles, currently blue-white. | Questionable | The config approximates shimmer, but without distortion/refraction rendering it may look more like blue mist. Should the colour be warmer/transparent instead? |
| `anamorphic-streak` | `Base · Anamorphic Lens Flare` | Blue-white star particles expanding with high glow. | Questionable | It does not yet draw a true horizontal anamorphic streak. Should this become a capsule/line shape instead of star? |

## Composite Effect Library

| ID | Standardised name | Config behaviour | Looks logically correct? | Notes / question |
|---|---|---|---|---|
| `magic-cold` | `Ice Magic · Crystal Mist` | Cold mist base plus rising star-shaped ice motes. | Yes | Clear ice/cold identity. |
| `magic-dark` | `Dark Magic · Void Vortex` | Dark red/purple void core ring plus orbiting shadow mist. | Yes | Strong dark magic/vortex identity. |
| `magic-fire-2` | `Fire Magic · Hellfire Burst` | Impact shockwave, rolling fire smoke, and burning shard particles. | Yes | Good multi-layer fire burst. |
| `magic-heal-1` | `Healing Magic · Green Sparkles` | Green healing ring plus rising cross-star motes. | Yes | Clean healing sparkle effect. |
| `magic-heal-2` | `Holy Magic · Photon Pillars` | Blue-white ring glow with rising capsule photon columns. | Yes | Could be healing or holy light; name now leans holy/light. |
| `magic-water-droplets` | `Water Magic · Aqua Splash` | Water ripple ring plus bouncing droplet beads. | Yes | Good splash effect. |
| `magic-tornade-ribbon` | `Wind Magic · Cyclone Ribbons` | Green rotating ribbon stream with debris particles. | Yes | ID has typo `tornade`; consider changing ID later only if safe. |
| `magic-shield-base` | `Shield Magic · Hex Aegis` | Golden hex shield field plus energy pulse ring. | Yes | Good shield/aegis composition. |
| `powerup-aura-burst` | `Power-Up · Golden Aura Burst` | Golden ground ring plus rising energy beams. | Yes | Reads as buff/power-up, not necessarily magic attack. |
| `magic-thunder-strike` | `Lightning Magic · Divine Strike` | Fast vertical purple-white strike plus ground impact ring. | Mostly | Direction uses angle `90`, which in this engine appears downward. If it should fall from top, this is probably correct. |
| `magic-light-1` | `Light Magic · Falling Spears` | Golden spear projectiles falling downward with sparks. | Yes | Good light/holy attack. |
| `magic-meteo-1` | `Meteor Magic · Shower Lines` | Diagonal orange-red capsule meteors with smoky trail particles. | Yes | ID says `meteo`; consider changing to `magic-meteor-shower` later only if safe. |
| `magic-fire-1` | `Cursed Magic · Pharaoh Fog` | Green-red cursed smoke plus diamond rune particles. | Mostly | Name was previously fire-like ID but behaviour is curse/smoke/runes. New name reflects actual behaviour. |

## Clarification Questions

1. Should `Base · Ribbon Trail` be more specifically called `Base · Slash Trail`, since it is currently a spark-shaped trail rather than a full ribbon mesh?

2. Should `Base · Heat Shimmer` become warmer and more transparent, or stay blue-white as a generic refraction placeholder?

3. Should `Base · Anamorphic Lens Flare` use a capsule/line shape instead of a star so it actually reads as a horizontal flare streak?

4. Do you want to safely rename typo IDs later, such as `magic-tornade-ribbon` and `magic-meteo-1`, or leave IDs stable and only improve display names?

5. Should `Cursed Magic · Pharaoh Fog` stay in the magic/fire family because of its old ID, or should it move into a future cursed/underworld/poison group?
