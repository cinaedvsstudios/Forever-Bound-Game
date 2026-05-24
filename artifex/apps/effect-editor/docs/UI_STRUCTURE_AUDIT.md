# Artifex Effect Editor UI Structure Audit

## Purpose

This note reviews the current Gemini-built Effect Editor UI structure before deeper refactoring.

The current editor works as a prototype, but some controls are grouped by visual convenience rather than by creator logic. The next UI pass should make the tool feel like a visual FX composer instead of a tactical/defensive dashboard.

## Current High-Level Layout

The current layout has:

```text
Top header/menu bar
Left inspector/sidebar with tabs
Main canvas preview area
Bottom panel under the canvas
Modal windows for saving and help
```

This structure is workable. The issue is not the broad layout. The issue is that several controls are in the wrong conceptual area, and some labels make the app feel like a defensive/tactical grid system rather than a creative FX editor.

## What Currently Makes Sense

### Top Menu

Current top menu groups:

```text
File
Edit
View
Insert
Help
```

This is mostly sensible.

Recommended meaning:

```text
File = new, import, export, settings
Edit = layer operations, undo/redo later, delete/copy/paste
View = preview overlays, HUD, zoom/display options
Insert = base effects, composite effects, custom saved effects, imported effects
Help = guide/about
```

This part should stay, but File needs the new export split later:

```text
Export Raw Composition
Export Editor Project
Export Artifex FX Asset
```

### Left Sidebar / Inspector

The left sidebar is a good place for editable settings. It already has useful tabs:

```text
Parameters
JSON
Boilerplate
```

This is logical. The left sidebar should remain the main inspector.

### Canvas Area

The main canvas preview is correct. It should stay central and large.

The pause/play overlay and zoom control are acceptable as canvas controls, although the naming and placement can be softened later.

### Effect Layers

The layer system is the correct concept. Multi-layer effects are central to the editor.

The current layer list is in the bottom panel. That can work, but it needs to be presented as a layer strip / timeline-style compositor strip, not as a tactical control area.

## Main Problems

## 1. Particle Shape Is in the Wrong Card

Currently, `Particle Shape` is inside `Transform Dynamics`.

That is not logical.

Particle Shape is a visual/rendering property, not a physics/dynamics property.

Move it to:

```text
Visual Configuration
```

Recommended Visual Configuration grouping:

```text
Shape Mode
Particle Shape
Custom PNG / Texture Sprite picker
Texture Preview
Use Texture Alpha
Tint Mode
Fit Mode
Edge Softness / Blur
Growth Size
Color & Alpha Sequence
Glow Radius
Composite Blend
```

The `Transform Dynamics` card should only contain movement/physics:

```text
Speed Limits
Projection Angle
Angle Spread
Gravity
Friction
Vortex Orbit
Future: turbulence / wind / drag / drift
```

## 2. Blur Naming Needs Cleaning

The current Visual Configuration card has `Blur Filter Amount`.

This should be split conceptually into:

```text
Edge Softness
Overall Blur
```

For first version, one control is fine, but the label should probably become:

```text
Edge Softness / Blur
```

This connects to the built-in SVG shape plan.

## 3. Composite Effect Card Is Too Hidden / Incomplete

The `Composite Effect` card currently has:

```text
Load Composition
Composition ID
Last Saved
Save New Version
```

The hidden Composition Name and Tags inputs are awkward because the modal also asks for name/tags.

Recommended split:

```text
Composition / FX Asset
- Effect Name
- Effect ID
- Tags
- Scope: global / project
- Project ID
- Thumbnail preview
- Capture Thumbnail button
- Load Preset
- Save New Version
- Export buttons later
```

The current hidden name/tags fields should either be visible and useful, or removed from this card and only handled in the save/export modal.

## 4. Emitter Options Mostly Make Sense

The Emitter card is mostly correct.

It should contain:

```text
Emitter Type
Emitter X/Y
Emitter Width
Emission Rate
Center H / Center V
```

Future additions should go here:

```text
point emitter
line emitter
area emitter
ring emitter
path emitter
object-attached emitter
character-attached emitter
screen-space emitter
```

The current X/Y controls and emitter width/rate are fine here.

## 5. Active Layer Settings Makes Sense, But Rename Some Terms

Current card:

```text
Active Layer Settings
Layer Identifier Name
Engine Architecture
Load Base Style
```

This is basically right, but the language is a bit heavy.

Recommended wording:

```text
Layer Settings
Layer Name
Effect Engine
Base Style / Preset
```

`Engine Architecture` sounds too technical for a normal creator. `Effect Engine` is clearer.

## 6. Temporal Duration Makes Sense

The duration card is correct.

It should eventually contain:

```text
Lifespan Frames
Start Delay
Loop Mode
Burst / Continuous
Fade In
Fade Out
```

For now, `Lifespan Frames` is fine.

## 7. Thumbnail Camera Capture

Add a camera/snapshot option to the editor.

Purpose:

```text
Capture a square preview image of the current effect only.
Use that image as the thumbnail shown in the FX Library cards.
```

This is not the same as exporting the effect itself. It is only the library/card preview image.

Recommended UI locations:

```text
Canvas overlay: small camera button near play/pause and zoom controls.
Composition / FX Asset card: thumbnail preview + Capture Thumbnail button.
Save New Version modal: optional captured thumbnail preview before saving.
```

Recommended behaviour:

```text
User plays or pauses the effect at a nice moment.
User clicks Camera.
Editor captures the current canvas as a square image.
Editor stores the thumbnail data/path with the saved composition.
FX Library cards use this thumbnail instead of a generic icon.
```

Recommended capture format:

```text
JPEG for normal library thumbnails.
512 x 512 square by default.
Background-filled because JPEG has no transparency.
Optional PNG later if transparent thumbnails are needed.
```

Important JPEG note:

```text
JPEG cannot store transparency.
If the effect canvas is transparent, the editor must composite the thumbnail over a background colour before exporting.
Default thumbnail background should match the editor dark preview background.
```

Recommended thumbnail settings:

```text
thumbnail.size = 512
thumbnail.format = image/jpeg
thumbnail.quality = 0.86
thumbnail.background = #0f0c0b
thumbnail.fit = contain
thumbnail.padding = 32
```

Recommended saved composition metadata:

```json
{
  "thumbnail": {
    "type": "image/jpeg",
    "width": 512,
    "height": 512,
    "background": "#0f0c0b",
    "dataUrl": "data:image/jpeg;base64,..."
  }
}
```

For GitHub/project storage, the later preferred structure should be:

```text
assets/fx/thumbnails/fx_effect_id.jpg
```

And the FX JSON should store:

```json
{
  "thumbnail": "assets/fx/thumbnails/fx_effect_id.jpg"
}
```

Do not store huge base64 thumbnails inside final runtime FX JSON if avoidable. Base64 is acceptable for localStorage/editor drafts, but saved project assets should prefer a real `.jpg` file path.

## Bottom Panel Review

The bottom panel is the biggest conceptual problem.

Current bottom panel columns:

```text
Layer Diagnostics
Active View Filters
Effect Layers
Workspace Tools
Diagnostics
```

This works technically, but it feels like a tactical/defensive control dashboard. It also duplicates controls that already belong in the top menu or inspector.

## Bottom Panel Should Become a Composer Strip

Recommended bottom panel purpose:

```text
show the selected layer context
manage layers
show timeline/preview controls later
show lightweight status only
```

Recommended bottom panel groups:

```text
1. Active Layer Summary
2. Layer Stack / Layer Strip
3. Playback / Preview Controls
4. Compact Status
```

Not recommended:

```text
large diagnostics block
heavy defensive/tactical wording
duplicate workspace tools
view filters as major bottom-panel controls
```

## Column-by-Column Bottom Panel Recommendations

### Current Column 1: Active View Filters

Current controls:

```text
Mouse Lock
HUD Reticle
Floor Bounce
```

These are view/preview controls. They should probably move to the View menu or a small canvas overlay, not take prime space in the bottom panel.

Better location:

```text
View menu
Canvas overlay settings popover
Small preview-options button
```

Better wording:

```text
Mouse Lock -> Emitter Follows Mouse
HUD Reticle -> Show Emitter Guide
Floor Bounce -> Preview Floor Collision
```

### Current Column 2: Effect Layers

This is the most important bottom-panel item.

It should be promoted visually and probably occupy more width.

Recommended new name:

```text
Layer Stack
```

Possible future form:

```text
horizontal layer strip
vertical compact list
mini timeline rows
visibility toggle
duplicate
move up/down
delete
paste
```

This belongs in the bottom panel.

### Current Column 3: Workspace Tools

Current controls:

```text
Clear Particles
Center Emitter
Wipe Composition
```

These are useful, but this is not the right main placement.

Better locations:

```text
Clear Particles -> top toolbar or canvas preview controls
Center Emitter -> Emitter Options card
Wipe Composition -> File menu / New Empty Composition
```

This column can be removed later to make room for timeline or layer controls.

### Current Column 4: Diagnostics

Current diagnostics:

```text
Active Layers
Total Particles
Scale
Performance
```

These are useful, but they should be compact.

Recommended location:

```text
small status line at bottom-right
collapsible Diagnostics drawer
View > Show Diagnostics
```

It should not take an entire quarter of the lower panel.

## Wording That Feels Too Tactical / Defensive

These labels and descriptions make the app feel like a tactical or defensive structure:

```text
Tactical HUD
Active Grid
Layer Diagnostics
HUD Reticle
Projection Angle
Target Schema
Interactive Coordinate Grid
cell columns from 1 to 16
row levels from A to I
```

Some of these are technically useful, but the language should be softened.

Recommended replacements:

```text
Tactical HUD -> Preview Guides
Active Grid -> Preview Grid
Layer Diagnostics -> Active Layer Summary
HUD Reticle -> Emitter Guide
Projection Angle -> Direction
Target Schema -> JSON Output
Interactive Coordinate Grid -> Preview Grid
```

## Suggested New UI Organization

### Left Sidebar Cards

Recommended order:

```text
1. FX Asset / Composition
2. Layer Settings
3. Emitter
4. Motion / Dynamics
5. Visuals
6. Timing
7. Advanced / Debug collapsed
```

### Visuals Card

Move Particle Shape here.

```text
Shape Mode
Built-In Shape / Custom PNG
Shape Picker
Texture Picker
Texture Preview
Tint Mode
Fit Mode
Edge Softness / Blur
Size Start / End
Color & Alpha Sequence
Glow
Blend Mode
```

### Bottom Panel

Recommended replacement:

```text
Active Layer Summary bar
Layer Stack / Layer Strip
Preview controls
Compact FPS / particle count status
```

### Canvas Overlay

Recommended canvas overlay controls:

```text
Play / pause
Camera / Capture Thumbnail
Zoom
Reset zoom
Preview options popover
```

The camera button should be visually near the playback controls because users will pause the effect at the desired frame and then capture it.

### View Menu

Move these into View:

```text
Show Preview Grid
Show Emitter Guide
Emitter Follows Mouse
Preview Floor Collision
Video Overlay Mode
Show Diagnostics
```

### File Menu

Add later:

```text
Import JSON
Import Effekseer Effect
Export Raw Composition
Export Editor Project
Export Artifex FX Asset
```

## Refactor Priority

Do this after the safe module scaffolding is complete:

```text
1. Move Particle Shape from Dynamics to Visual Configuration.
2. Rename confusing card/control labels.
3. Turn the bottom panel into a Layer Stack / Preview strip.
4. Move duplicated workspace tools to File/View/Emitter locations.
5. Collapse diagnostics into a smaller status area.
6. Add textureSprite/custom PNG controls to Visual Configuration.
7. Add Camera / Capture Thumbnail button and thumbnail metadata.
```

## Short Verdict

The current app structure is not bad, but Gemini grouped things by where they fit visually rather than by what they mean.

The left inspector should become a clean effect-authoring panel.

The bottom panel should become a layer/timeline/composer strip.

View filters and diagnostics should not dominate the lower panel.

The overall tone should shift away from tactical/defensive language and toward creative FX composition language.
