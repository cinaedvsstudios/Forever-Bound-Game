# Artifex Effect Editor — Post-Parity Polish List

Status: based on the modular `v2.3.11 TEXTURE-RENDER` test build, the old `v2.3.0 ALPHA` screenshots, and Chris's latest direction.

The split/rebuild is considered successful. This list is for feature completion, UI polish, and effect-editing clarity.

## Visual identity rule for Artifex modules

The Artifex family should keep one shared visual language: dark fantasy interface, parchment/gold text, copper/brown panels, rounded cards, purple active accents, serif headers, and soft glow.

Each major module should then have its own accent colour so the user can instantly tell which tool is open:

- Effect Editor: cyan/blue accent, because FX editing is technical, energetic, and visual.
- Archetype Editor: red accent, because it is object/archetype definition and feels more structural/asset-focused.
- Project Editor: gold/green accent, because it is broader project/world organization.

Important: accent colours should be secondary, not a total redesign. The base theme stays Artifex. For the Effect Editor, cyan/blue can appear on diagnostics, emitter reticles, coordinate labels, performance numbers, active technical guides, and selected technical pills. It should not replace the whole dark/gold/purple theme.

## Global defaults and confirmed naming decisions

Default resolution should be:

```text
1280×720
```

`View: Dark` should be renamed to:

```text
Background: Dark
```

The old `Reference` naming is conceptually correct but not clear enough. It means an image/video underlay behind the effect, so rename it to one of:

Recommended:

```text
Underlay: Off / Underlay: On
Load Underlay
Background: Underlay
```

Alternative acceptable labels:

```text
Plate: Off / Plate: On
Load Plate
Background: Plate
```

Avoid `Reference` as the main toolbar label because it sounds like documentation rather than a visual image/video underlay.

`Point To Target` means: rotate a directional effect so that it points toward a point clicked on the canvas.

`Reverse Near Target` was the wrong wording. The intended behaviour is not repel/swirl/near-target physics. It means the effect direction is flipped when the origin point is actually the end point, for example a fire shot where the visual should travel back toward the chosen point.

Rename `Reverse Near Target` to:

```text
Reverse Direction
```

Alternative:

```text
Flip Origin / Target
```

Keep `Orbital Force` as-is. Do not rename it to Swirl Force.

Rename `Spawn Rate` / `Particles per Second` to:

```text
Density
```

Gravity should be a user-facing 0–200 scale:

- `0` = no gravity
- `100` = Earth-like normal gravity
- `200` = double gravity

The internal runtime can map this to safe frame acceleration values. The user should not see tiny internal numbers like `0.035` as the main control value.

The old JSON and Boilerplate tabs should not return as main tabs. Put them in the View menu instead:

- View JSON
- Edit JSON
- View Boilerplate
- Export Boilerplate

## Simple / low-risk list

These should be quick and safe because they are mostly labels, menus, styling, or small state patches.

### 1. Module accent colour pass

Add a module accent variable system:

- shared base theme variables
- `--module-accent`
- `--module-accent-soft`
- `--module-accent-strong`
- `--module-glow`

For the Effect Editor, use cyan/blue accent in technical parts only:

- emitter reticle
- coordinate text
- diagnostics
- active guide toggles
- performance readout
- grid labels if desired
- small icon badges

Keep the normal cards/buttons dark/gold/purple.

### 2. Toolbar label cleanup

Change:

- `Snapshot PNG` → `Snapshot` or `Export PNG`
- `Reset Zoom` should not wrap; keep as `Reset Zoom` but fix button width
- `View: Dark` → `Background: Dark`
- `View: Reference` → `Background: Underlay`
- `Reference Off` → `Underlay: Off`
- `Load Reference` → `Load Underlay`
- `Helpers On` → `Guides: On`

### 3. Default resolution

Ensure every new composition starts at:

```text
1280×720
```

### 4. Missing resolution presets

Add:

- 1120×630
- 1080×1080
- 720×720

Already present and should remain:

- 1280×720
- 1920×1080
- 1024×1024
- 1080×1920

### 5. File menu label cleanup

Change:

- `Raw Layer Composition` → `Export Raw Composition JSON`
- `Editor Project` → `Export Editor Project JSON`
- `Effect Archetype Asset` → `Export Effect Archetype JSON`
- `Scene FX Instance` → `Export Scene FX Instance JSON`
- `Save to Local Storage` → `Save Locally in Browser`
- `View Local Files` → `Manage Local Effects`
- `Emergency Backup Save` → `Emergency Backup JSON`

### 6. Move JSON / Boilerplate into View menu

Add View menu actions:

- View JSON
- Edit JSON
- View Boilerplate
- Export Boilerplate

Do not restore these as main top-level tabs unless there is a later reason.

### 7. Basic View menu workflow entries

Add or restore:

- Snap To Grid
- Low Performance Mode
- Emitter Follows Pointer
- Preview Floor Collision
- Clear Underlay
- Show Emitter Guide
- Show Grid
- Show Coordinates

These can be simple toggles first, then wired in later passes.

### 8. Quick Edit basic presets

Add state-patch quick edits first:

- Reset Layer to Default
- Water
- Evil
- White Fog
- Sooty Smoke
- Soft Glow
- Bright Add

These can change colour, opacity, blend mode, glow, size, brush, and density without deeper renderer changes.

### 9. Rename confusing effect controls

Simple label changes:

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

Keep:

- `Orbital Force`

### 10. Conditional visibility for controls

Hide controls that do not apply to the current render mode:

- Shape mode: show Shape; hide Built-in Brush, Custom PNG, Tint Mode, Texture Fit.
- Built-in Brush mode: show Built-in Brush; hide Shape and Custom PNG controls.
- Custom Image Brush mode: show Custom PNG, Tint Mode, Texture Fit, Texture Opacity.

### 11. Cap Soft Edge lower

Current blur/edge blur can get too heavy. Use a safer user-facing range such as:

```text
0–5
```

Advanced mode can later unlock higher values if needed.

## Medium list

These need more UI workflow or state wiring but should still be manageable if done one pass at a time.

### 1. Full Quick Edit Preset restoration

Add tuned versions of:

- Tight Trail
- Sharp Sparks
- Fade In / Fade Out
- Spark
- Burst
- Drift
- Smoke variants
- Ash / dust variants
- better Good Magic / Dark Magic / Evil variants

These need testing so they look useful, not just technically different.

### 2. Click-to-set Origin and Target

Current buttons are simplified.

Desired workflow:

- Click `Set Origin by Click`
- cursor enters origin-pick mode
- click workspace to set emitter/origin
- Escape cancels

And:

- Click `Aim at Target`
- cursor enters target-pick mode
- click workspace
- directional effect rotates toward that point
- Escape cancels

`Reverse Direction` should flip the directional interpretation when the origin is visually the endpoint.

### 3. Snap To Grid

Snap should affect emitter/origin/target placement, not particle movement.

It needs to hook into pointer-to-world conversion and placement tools.

### 4. Local layout persistence

Persist safely in localStorage:

- side panel width
- bottom panel height
- card collapse/expand state
- last workspace background mode
- last zoom
- maybe last selected layer

Clamp restored sizes so a bad previous value cannot hide panels.

### 5. JSON / Boilerplate View menu panels

Add dialog or side drawer views for:

- View JSON
- Edit JSON
- View Boilerplate
- Export Boilerplate

The live visual editor should remain primary.

### 6. Multiple colour stops

Replace simple two-colour gradient with optional stops:

- Colour Stop 1
- Colour Stop 2
- Colour Stop 3
- optional stop positions
- opacity per stop

Renderer needs interpolation across stops.

### 7. Editable number fields beside sliders

Each slider should have a typed number box as well as the slider.

This is important for precise FX tuning.

### 8. Effect Archetype Library improvement

Needed:

- built-in archetype cards
- thumbnail cards
- local/custom saved archetypes shown inside the library
- Load / Insert / Delete local actions
- final cleanup of bad composite presets

## Hard list

These are real render/file-format/performance tasks.

### 1. Real brush PNG folder integration

The modular test can draw custom uploads and procedural built-in brushes, but the old brush folder workflow is not restored.

Needed:

- load named brush PNGs from `brushes/`
- support old expected filenames such as `Fog001.png`, `Spark002.png`, `Line01.png`, `Burst01.png`, `Wind.png`, etc.
- cache images cleanly
- convert black-background brush PNGs into alpha masks
- prevent coloured square blocks
- add Texture Contrast / threshold control

### 2. Video/image underlay rendering

Image underlay exists. Video underlay still needs real rendering.

Needed:

- hidden HTML video element
- draw current video frame into canvas
- play/pause
- previous/next frame stepping
- opacity
- clear underlay
- ensure exports remain effect-only and do not include the underlay unless explicitly requested

### 3. Real Low Performance Mode

The toggle is simple, but real mode should adjust runtime behaviour:

- cap particle count
- lower density
- reduce expensive glow/blur
- reduce underlay redraw cost
- possibly lower preview resolution
- clearly show that performance mode is active

### 4. Full Noise Grain renderer

Current Noise Grain is one intensity control.

Needed:

- Grain Amount
- Grain Density
- Grain Size
- Grain Opacity
- Grain Colour A
- Grain Colour B
- separate microscopic grain render path

### 5. Real Effekseer import

Currently placeholder.

This requires a clear target file format and import mapping.

### 6. Final FX render quality pass

Needed after features are restored:

- better smoke
- better sparks
- better ash/dust
- better magic dust
- better projectile cores
- better lens flares
- better refraction shimmer
- better shockwave rings
- better trail/ribbon behaviour

## Proposed effect-control structure

Recommended card layout after label cleanup:

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

## Key wording decisions

Use `underlay` instead of `reference` in the toolbar/UI.

Use `background` for workspace background mode.

Use `density` instead of spawn rate.

Use `gravity strength` with a 0–200 user range where 100 means Earth gravity.

Use `reverse direction` for the origin/end-point flip.

Keep `Orbital Force`.

Move JSON and Boilerplate features into the View menu.
