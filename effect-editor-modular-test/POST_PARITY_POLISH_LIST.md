# Artifex Effect Editor — Post-Parity Polish Steps

Status: based on the modular `v2.3.11 TEXTURE-RENDER` test build, the old `v2.3.0 ALPHA` screenshots, and Chris's latest direction.

The split/rebuild is complete. This document is now a minimal step plan for the post-parity polish phase.

## Core direction

The Artifex family should keep one shared visual language: dark fantasy interface, parchment/gold text, copper/brown panels, rounded cards, purple active accents, serif headers, and soft glow.

Each major module should have a secondary accent colour so the user can instantly tell which tool is open:

- Effect Editor: cyan/blue accent.
- Archetype Editor: red accent.
- Project Editor: gold/green accent.

Accent colour is not a full redesign. The base Artifex theme stays consistent. In the Effect Editor, cyan/blue should be used for technical and FX-specific feedback only: emitter reticles, coordinate labels, diagnostics, active guide toggles, performance numbers, grid labels if useful, and small icon badges.

Default resolution remains:

```text
1280×720
```

## Confirmed wording decisions

Use `Underlay` instead of `Reference` for image/video plates behind the effect.

Use `Background` for workspace background mode.

Use `Density` instead of Spawn Rate or Particles per Second.

Use `Gravity Strength` with a user-facing 0–200 range:

- `0` = no gravity
- `100` = Earth-like normal gravity
- `200` = double gravity

Use `Reverse Direction` for the origin/end-point flip used by directional effects.

Keep `Orbital Force`.

Move JSON and Boilerplate features into the View menu. Do not restore them as main top-level tabs.

## Minimal implementation steps

Use these as versioned passes. Each step should be tested in the browser before moving to the next one. If particles disappear, revert only that step.

## Step 1 — UI identity, labels, and defaults

Purpose: make the editor feel final and remove confusing wording before adding more behaviour.

This is the safest first polish pass because it mostly touches labels, CSS variables, default values, menu text, and small layout issues.

### Include

Add module accent variables:

- `--module-accent`
- `--module-accent-soft`
- `--module-accent-strong`
- `--module-glow`

For the Effect Editor, use cyan/blue only for technical FX accents while keeping the Artifex dark/gold/copper/purple base.

Clean up toolbar labels:

- `Snapshot PNG` → `Snapshot` or `Export PNG`
- keep `Reset Zoom`, but prevent wrapping
- `View: Dark` → `Background: Dark`
- `View: Reference` → `Background: Underlay`
- `Reference Off` → `Underlay: Off`
- `Load Reference` → `Load Underlay`
- `Helpers On` → `Guides: On`

Clean up File menu labels:

- `Raw Layer Composition` → `Export Raw Composition JSON`
- `Editor Project` → `Export Editor Project JSON`
- `Effect Archetype Asset` → `Export Effect Archetype JSON`
- `Scene FX Instance` → `Export Scene FX Instance JSON`
- `Save to Local Storage` → `Save Locally in Browser`
- `View Local Files` → `Manage Local Effects`
- `Emergency Backup Save` → `Emergency Backup JSON`

Add missing resolution presets:

- 1120×630
- 1080×1080
- 720×720

Keep current presets:

- 1280×720
- 1920×1080
- 1024×1024
- 1080×1920

Move JSON / Boilerplate access into View menu:

- View JSON
- Edit JSON
- View Boilerplate
- Export Boilerplate

Rename confusing effect controls:

- `Mode` → `Particle Render Mode`
- `Particle Shape` → `Shape`
- `Texture Alpha` → `Texture Opacity`
- `Edge Blur` → `Soft Edge`
- `Glow` → `Glow Strength`
- `Color A` → `Start Colour`
- `Color B` → `End Colour`
- `Alpha Start` → `Start Opacity`
- `Alpha End` → `End Opacity`
- `Size Start` → `Start Size`
- `Size End` → `End Size`
- `Reverse Colour Direction` → `Reverse Colour Gradient`
- `Emitter Width` → `Spawn Width`
- `Width Unit` → `Spawn Width Unit`
- `Emitter Rotation` → `Spawn Line Rotation`
- `Target X` → `Target Point X`
- `Target Y` → `Target Point Y`
- `Point To Target` → `Aim at Target`
- `Set Origin Center` → `Center Origin`
- `Reverse Near Target` → `Reverse Direction`
- `Friction` → `Drag / Slowdown`
- `Lifetime Min` → `Min Life`
- `Lifetime Max` → `Max Life`
- `Spawn Rate` → `Density`
- `Gravity` → `Gravity Strength`

Keep this label unchanged:

- `Orbital Force`

Set `Soft Edge` to a safer user-facing range:

```text
0–5
```

### Acceptance checks

- page loads
- particles render
- toolbar does not wrap badly
- default new composition is 1280×720
- File, View, Insert, Help menus still open
- Effect Editor has subtle cyan/blue technical accents without losing the Artifex theme

## Step 2 — Control behaviour and editor workflow

Purpose: make the editor easier to use, not just better labelled.

This step is mostly UI logic and pointer workflow. It is more involved than Step 1 but still not a deep renderer rewrite.

### Include

Conditional visibility for appearance controls:

- Shape mode: show Shape; hide Built-in Brush, Custom PNG, Tint Mode, Texture Fit.
- Built-in Brush mode: show Built-in Brush; hide Shape and Custom PNG controls.
- Custom Image Brush mode: show Custom PNG, Tint Mode, Texture Fit, Texture Opacity.

Add basic View menu workflow toggles:

- Snap To Grid
- Low Performance Mode
- Emitter Follows Pointer
- Preview Floor Collision
- Clear Underlay
- Show Emitter Guide
- Show Grid
- Show Coordinates

Click-to-set origin and target workflow:

- `Set Origin by Click` enters origin-pick mode
- click workspace to set emitter/origin
- Escape cancels
- `Aim at Target` enters target-pick mode
- click workspace to set target and rotate the directional effect toward it
- Escape cancels
- `Reverse Direction` flips the origin/end-point interpretation for directional effects

Snap To Grid should affect emitter/origin/target placement only. It must not quantize particle movement.

Gravity UI mapping:

- display `Gravity Strength` as 0–200
- internally map this to safe frame acceleration
- 100 should feel like normal Earth-like downward gravity

Add editable number fields beside sliders. Important sliders should have both a slider and a typed value box for precision.

### Acceptance checks

- changing render mode hides irrelevant controls
- emitter dragging still works
- Set Origin by Click works
- Aim at Target rotates directional effects toward the clicked point
- Reverse Direction visibly flips directional orientation
- Snap To Grid affects placement only
- Gravity Strength 0, 100, and 200 feel meaningfully different but not insane

## Step 3 — Presets, saving, local management, and library

Purpose: make the editor practical for building and reusing effects.

This step groups the remaining editor/productivity tools. It should not require heavy particle renderer changes except for preset tuning.

### Include

Restore Quick Edit presets.

Basic state-patch presets:

- Reset Layer to Default
- Water
- Evil
- White Fog
- Sooty Smoke
- Soft Glow
- Bright Add

Tuned presets:

- Tight Trail
- Sharp Sparks
- Fade In / Fade Out
- Spark
- Burst
- Drift
- Smoke variants
- Ash / dust variants
- better Good Magic / Dark Magic / Evil variants

Improve save and thumbnail rules:

- normal save should require a thumbnail
- show a clear message if no thumbnail exists
- Emergency Backup JSON remains the bypass
- clarify intended thumbnail destination: `assets/archetype-thumbnails/[archetype-id].jpg`
- keep thumbnail download separate from archetype save confirmation

Improve local management:

- persist side panel width
- persist bottom panel height
- persist expanded/collapsed card state
- persist last background mode
- persist last zoom
- possibly persist last selected layer
- safely clamp restored layout sizes
- support selecting multiple local effects for export

Improve Effect Archetype Library:

- built-in archetype cards
- thumbnail cards
- local/custom saved archetypes inside the library
- Load / Insert / Delete local actions
- final cleanup of bad composite presets
- proper built-in thumbnail paths

Add JSON / Boilerplate View menu panels:

- View JSON
- Edit JSON
- View Boilerplate
- Export Boilerplate

The visual editor remains primary; JSON and Boilerplate are utility panels, not main tabs.

### Acceptance checks

- all quick presets visibly change the active effect
- normal save blocks or warns when no thumbnail exists
- Emergency Backup JSON still works without thumbnail
- local saved effects can be loaded, exported, deleted, and bundled
- layout persists after reload
- library can show built-in and local/custom effects
- JSON/Boilerplate tools open from View menu

## Step 4 — Render assets, underlay video, noise, and final quality

Purpose: finish the hard visual/rendering work after the editor UI is stable.

This is the heaviest step and should only happen after Steps 1–3 are stable.

### Include

Real brush PNG folder integration:

- load named brush PNGs from `brushes/`
- support expected filenames such as `Fog001.png`, `Spark002.png`, `Line01.png`, `Burst01.png`, `Wind.png`, etc.
- cache images cleanly
- convert black-background brush PNGs into alpha masks
- prevent coloured square blocks
- add Texture Contrast / threshold control

Video/image underlay rendering:

- image underlay already exists; keep it
- add hidden HTML video element
- draw current video frame into canvas
- play/pause
- previous/next frame stepping
- opacity
- clear underlay
- ensure exports remain effect-only and do not include the underlay unless explicitly requested

Real Low Performance Mode:

- cap particle count
- lower density
- reduce expensive glow/blur
- reduce underlay redraw cost
- optionally lower preview resolution
- clearly show when performance mode is active

Full Noise Grain renderer:

- Grain Amount
- Grain Density
- Grain Size
- Grain Opacity
- Grain Colour A
- Grain Colour B
- separate microscopic grain render path

Real Effekseer import:

- only attempt after the target file format and mapping rules are defined

Final FX render quality pass:

- better smoke
- better sparks
- better ash/dust
- better magic dust
- better projectile cores
- better lens flares
- better refraction shimmer
- better shockwave rings
- better trail/ribbon behaviour

### Acceptance checks

- named brush PNGs render without black boxes
- Texture Contrast helps remove black-background artifacts
- custom and built-in brushes still work
- image and video underlays work
- video frame stepping works
- exports remain effect-only unless underlay export is deliberately requested
- Low Performance Mode improves FPS on heavy effects
- Noise Grain looks like fine grain, not chunky particles
- effect presets look visually useful, not just technically different

## Final control structure target

### Effect Archetype Assets

- Archetype ID
- Layer Name
- Engine Type
- Thumbnail Preview

### Quick Edit Presets

- Reset Layer
- Fire
- Ice
- Water
- Good Magic
- Dark Magic
- Evil
- White Fog
- Sooty Smoke
- Tight Trail
- Sharp Sparks
- Soft Glow
- Bright Add

### Effect Layer Appearance

- Start Colour
- End Colour
- Start Opacity
- End Opacity
- Start Size
- End Size
- Glow Strength
- Particle Render Mode
- Shape
- Built-in Brush
- Custom Image Brush
- Tint Mode
- Texture Fit
- Texture Opacity
- Soft Edge
- Reverse Colour Gradient

### Effect Layer Dynamics

- Origin X
- Origin Y
- Center Origin
- Set Origin by Click
- Aim at Target
- Target Point X
- Target Point Y
- Reverse Direction
- Density
- Speed Min
- Speed Max
- Direction Angle
- Spread
- Spawn Width
- Spawn Width Unit
- Spawn Line Rotation
- Gravity Strength
- Drag / Slowdown
- Orbital Force
- Min Life
- Max Life
- Noise Grain section
