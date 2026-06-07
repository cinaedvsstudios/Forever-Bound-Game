# Artifex FX Editor and Effects Library

## Purpose

The Artifex FX Editor is the Artifex utility for creating, previewing, configuring, saving, reusing, placing, and exporting visual effects.

The older name for this area was CG Effects Library. The library concept is still correct, but the full tool is broader than a passive library. The Effects Library stores reusable effects. The FX Editor is the working interface used to create, edit, test, time, export, and place those effects.

The core split is:

```text
The FX Editor creates effects.
The Effects Library stores reusable effects.
The Scene Editor places effects inside scenes.
The Runtime Engine plays effects during the game.
The Plate FX workflow exports effect-only video layers for production use.
```

The portal already proved that Artifex can generate atmospheric effects using browser code, math, canvas animation, layering, and reusable settings.

Examples already proven or planned:

```text
Fog / mist particles
Sparks / embers
Firelight flicker
Hover glow
Magic pulse
Procedural audio effects
Screen overlays
Magic glows
Particle emission
Smoke generation
Portal shimmer
Transition blur
Audio-reactive pulses
```

Instead of manually coding fog, sparks, magic swirls, glowing particles, rain, smoke, distortion, screen pulses, or magical overlays every time, the creator should be able to choose an effect from a library, adjust it visually, save it as a reusable archetype, then attach it to a scene, object, route, transition, UI layer, or video reference plate.

## Current Prototype: Artifex Particle Studio v2.3.0 Alpha

A working single-file prototype currently exists as an HTML/JavaScript application titled Artifex Particle Studio - Web FX Engine.

The prototype already proves several important FX Editor concepts:

```text
multi-layer effect compositions
base effect presets
composite effect presets
canvas particle rendering
emitter controls
physics controls
visual controls
life/duration controls
colour and alpha stop editing
layer visibility
layer duplication
layer reordering
copy/paste layer settings
live JSON view and manual JSON editing
local import/export
custom saved compositions in localStorage
zoom and pan
resizable panels
workspace modes
particle diagnostics
```

The prototype is usable as the foundation for the Artifex FX Editor, but it should not continue growing as one giant single-file app.

The first code task after upload to GitHub should be a preservation refactor: same visual behaviour, cleaner file structure. Do not redesign the UI before the refactor is stable.

### Current Prototype Strengths

```text
The core idea is already working.
The composition/layer model maps naturally to Artifex FX Archetypes.
The emitter/physics/visual/life grouping is clear and editable.
The preset registry proves both base effects and composite effects.
The canvas renderer is simple enough to extract into a reusable runtime.
The live JSON panel makes the data model visible and testable.
The layer list already behaves like a practical mini compositor.
The tool already feels like a real production utility rather than just a particle toy.
```

### Current Prototype Problems

```text
The app is too large for reliable AI editing as one file.
HTML, CSS, state, preset data, runtime engine, UI logic, import/export, and renderer code are mixed together.
Base presets and composite presets are embedded directly inside the page.
The editor runtime and game runtime are not separated.
The exported JSON is editor composition JSON, not yet a stable Artifex FX Archetype JSON.
There is no clear split between editable FX project export and final Artifex FX asset export.
There is not yet a Scene Editor placement adapter.
There is not yet a texture-sprite particle mode for PNG particles.
There is not yet an Effekseer import/conversion workflow.
```

### Required Refactor Plan

Recommended target structure:

```text
artifex/apps/fx-editor/index.html
artifex/apps/fx-editor/styles.css
artifex/apps/fx-editor/src/main.js
artifex/apps/fx-editor/src/state.js
artifex/apps/fx-editor/src/config.js
artifex/apps/fx-editor/src/presets/base-effects.js
artifex/apps/fx-editor/src/presets/composite-effects.js
artifex/apps/fx-editor/src/engine/particle.js
artifex/apps/fx-editor/src/engine/particle-engine.js
artifex/apps/fx-editor/src/engine/shape-renderer.js
artifex/apps/fx-editor/src/engine/texture-cache.js
artifex/apps/fx-editor/src/ui/dropdowns.js
artifex/apps/fx-editor/src/ui/tabs.js
artifex/apps/fx-editor/src/ui/layers-panel.js
artifex/apps/fx-editor/src/ui/controls-panel.js
artifex/apps/fx-editor/src/ui/color-stops.js
artifex/apps/fx-editor/src/ui/shape-picker.js
artifex/apps/fx-editor/src/ui/toasts.js
artifex/apps/fx-editor/src/canvas/canvas-controls.js
artifex/apps/fx-editor/src/canvas/grid.js
artifex/apps/fx-editor/src/io/import-export.js
artifex/apps/fx-editor/src/io/artifex-fx-schema.js
artifex/apps/fx-editor/src/io/effekseer-converter.js
artifex/apps/fx-editor/src/io/image-to-fx-prompt.js
```

Base effects and composite effects should eventually be moved out of large registry arrays and into individual files.

Recommended long-term preset structure:

```text
data/fx/base/particles/electric-sparks.json
data/fx/base/ribbon/sword-slash.json
data/fx/base/ring/shockwave.json
data/fx/base/lightning/tesla-bolt.json
data/fx/base/projectile/fireball.json
data/fx/base/gas/generic-fog.json
data/fx/base/gas/toxic-bubble-fog.json
data/fx/base/refraction/heat-shimmer.json
data/fx/base/lensflare/anamorphic-streak.json

data/fx/composites/magic-cold-crystals.json
data/fx/composites/dark-magic-void.json
data/fx/composites/explosive-hellfire.json
data/fx/composites/kirakira-heal-sparkles.json
data/fx/composites/rising-holy-photons.json
data/fx/composites/splash-aqua-droplets.json
data/fx/composites/cyclone-wind-ribbons.json
data/fx/composites/aegis-hexagon-shield.json
data/fx/composites/aura-power-burst.json
data/fx/composites/divine-judgment-bolt.json
data/fx/composites/heavenly-spear-strike.json
data/fx/composites/meteor-shower-lines.json
data/fx/composites/cursed-pharaohs-fog.json
```

### Export Modes Needed

The editor needs at least two separate export actions:

```text
Export Editor Project
Export Artifex FX Asset
```

#### Export Editor Project

Saves the full editable workspace exactly as the FX Editor needs it.

May include:

```text
composition ID
composition name
tags
editor-only settings
view settings
layers
layer order
selected layer if useful
local notes
reference links
```

This format is allowed to change as the editor evolves.

#### Export Artifex FX Asset

Saves a stable runtime-facing FX Archetype JSON file.

This is the file the Scene Editor and Runtime Engine should treat like an image/sound asset.

It should include:

```text
schema
id
label
type
scope
projectId
engine
engineVersion
tags
assets
composition/layers
runtime settings
compatibility notes
```

The Scene Editor should not need to understand every internal editor-only field. It should be able to browse, preview, and place this FX asset as an FX Instance.

Example wrapper:

```json
{
  "schema": "artifex.fxArchetype.v1",
  "id": "fx_cursed_pharaoh_fog",
  "label": "Cursed Pharaoh Fog",
  "type": "compositeParticleEffect",
  "scope": "project",
  "projectId": "forever-bound",
  "engine": "artifex-particle-studio",
  "engineVersion": "2.3.0-alpha",
  "tags": ["egyptian", "dark", "smoke", "cursed"],
  "assets": {},
  "composition": {
    "layers": []
  }
}
```

## Two Main FX Workflows

The FX Editor has two main workflows.

### 1. Game FX Mode

Game FX Mode creates reusable effects for the Artifex Runtime Engine.

These effects are saved as FX Archetypes in the Effects Library, then placed into scenes as FX Instances.

Examples:

```text
A fog archetype reused in several forest scenes.
A green possession-eye glow attached to any possessed NPC.
A purple Songspell aura attached to the hero while singing.
A blue Aetheris restoration glow attached to a shrine.
A portal shimmer placed above a route exit.
A screen tint used when entering a dream-state.
```

Game FX Mode should export mainly:

```text
FX Archetype JSON
Sprite sheet + JSON where needed
Particle texture references
Reusable runtime configuration
Scene effect instance data
```

### 2. Plate FX Mode

Plate FX Mode creates effect-only production video layers.

In this workflow, the creator uploads a reference video only so the effect can be timed, positioned, and animated against real footage. The uploaded video is a guide layer, not part of the final export.

The output is an FX Pass: an effect-only transparent video, image sequence, animated WebP, or game-ready sprite sheet that can later be placed over high-quality footage in an external video editor.

The workflow is:

```text
Upload reference video.
Scrub, pause, and step through the video frame by frame.
Choose effects from the Effects Library.
Place and animate those effects over the reference video.
Set keyframes for position, scale, rotation, opacity, intensity, timing, and other properties.
Preview the composite inside the FX Editor.
Hide/remove the reference video for export.
Export only the effect layer as an FX Pass.
Import the FX Pass into a video editor and composite it over the final footage.
```

The reference video should never be included in the normal export. It exists only for timing and placement. A separate preview export may include the reference video burned in, but that is only for checking or sharing, not final compositing.

## Recommended Naming

Use these names unless later renamed:

```text
FX Editor
Effects Library
FX Archetype
FX Instance
FX Runtime
FX Driver
FX Plate
Reference Video
FX Plate Project
FX Pass
Transparent FX Pass
Preview Export
Composite Target
Emitter
Effect Layer
Shape Mode
Built-In Shape
Texture Sprite
Effekseer Converter
```

Avoid the term “slated effect” for the main feature because it may be confused with film slate/clapperboard metadata or scheduling. The better production term is FX Plate or Plate FX workflow.

## FX Archetypes and FX Instances

An FX Archetype is the reusable saved effect definition.

An FX Instance is a specific use of that archetype in a scene, object, UI layer, transition, or plate project.

Example:

```text
FX Archetype:
fx_smoke_green_corruption

FX Instance:
Use fx_smoke_green_corruption at x 420, y 280, attached to the Sekhemra stone, layer 5, scale 0.8, active while the scene corruption flag is true.
```

This separation matters because it allows one effect to be updated globally. If scenes stored the full effect definition every time, changing the smoke style everywhere would become messy. Scenes should usually reference archetypes and store only instance overrides.

## Global FX and Project FX

The Effects Library should support both global and project-specific effects.

### Global FX

Global FX are reusable across every Artifex project and template.

Examples:

```text
generic fog
basic sparkle
standard magic pulse
fire flicker
screen fade
portal shimmer
impact burst
cooldown grey overlay
```

### Project FX

Project FX are specific to one project and may not be useful outside that project.

Examples:

```text
Forever Bound Lethemar corruption pulse
Forever Bound Aetheris shrine glow
Forever Bound Songspell wave
A project-specific villain aura
A one-off trailer magic pass
A custom title screen shimmer
```

Project-specific effects may later be promoted into the global library if they become broadly reusable.

## Effect Families

The first practical version should support a limited set of effect families rather than trying to become a full After Effects replacement.

Recommended first effect families:

```text
Screen Overlay FX
Particle FX
Sprite Sheet FX
Glow / Aura FX
Transition FX
Audio-Reactive FX
```

### Screen Overlay FX

Used for full-screen or camera-space effects.

Examples:

```text
Vignette
Colour tint
Blur
Screen shake
Flash
Darkness
Dream-state overlay
Corruption screen pulse
Cooldown grey overlay
```

### Particle FX

Used for generated particles from a point, line, area, object, path, or screen space.

Examples:

```text
Smoke
Dust
Sparks
Embers
Magical glitter
Aetheris motes
Sekhemra spores
Floating pollen
Rain
Snow
```

### Sprite Sheet FX

Used for frame-based animation assets.

Examples:

```text
Fireball
Portal loop
Candle flicker
Impact burst
Magic ring
Lightning pulse
Explosion flash
```

### Glow / Aura FX

Used for object, character, UI, or environment glow.

Examples:

```text
Object glow
Character aura
Possession eye glow
Active relic pulse
Holy restoration glow
Songspell aura
```

### Transition FX

Used to move between scenes, screens, routes, and states.

Examples:

```text
Directional blur
Zoom blur
Fade
Magical dissolve
Doorway transition
Tunnel transition
Map transition
```

### Audio-Reactive FX

Used when effect values react to audio playback or analysed sound data.

Examples:

```text
Vignette intensity driven by bass
Glow opacity driven by mid frequencies
Particle emission driven by treble
Screen shake driven by beat pulse
Distortion intensity driven by music energy
Colour shift driven by a Songspell vocal layer
```

Audio-reactive behaviour should be treated as a driver/modifier rather than as a completely separate effect type.

## Shape and Texture System

The FX Editor should support both procedural built-in shapes and custom/imported PNG texture sprites.

This should be exposed in the UI under Particle Shape, but the internal data should distinguish the source type clearly.

Recommended UI:

```text
Particle Shape
- Built-In Shape
- Custom PNG / Texture Sprite
```

Recommended internal naming:

```text
shapeMode: builtInShape
shapeMode: textureSprite
```

### Built-In SVG Shapes

Built-in shapes should be lightweight vector/procedural shapes. They should be scalable, tintable, and editable without needing image files.

The current prototype already supports a small built-in shape set:

```text
circle
spark
square
triangle
star
cross-star
capsule
spear
shard
ring
hexagon
diamond
```

The intended built-in shape bank should be expanded to include the creator's desired particle silhouettes, including:

```text
hexagon
jagged burst
rounded square
triangle
soft star
scalloped circle
swirl
scribble stroke
pac/open circle
flat hexagon
three-point shard
four-point sparkle
rough blob
solid circle
play triangle
solid square
heart
gear
parallelogram
diamond
pentagon
octagon
teardrop
energy scribble
lightning bolt
flat gem
star
heart variant
cloth/ragged square
flame
small diamond
oval
water drop
map pin drop
thin diamond
cone
cloud/blob
four-point glint
right triangle
flat diamond
trapezoid
house/pentagon block
```

These can be implemented with SVG path definitions for the picker preview and matching canvas path drawing functions for runtime rendering.

Each built-in shape should support:

```text
fill colour from colour ramp
alpha from alpha ramp
optional stroke
optional outline mode
rotation
random rotation
edge blur
scale
aspect ratio stretch if needed
glow
blend/composite mode
```

### Edge Blur and Softness

Built-in shapes should be able to look less hard-edged through an edge blur filter.

The editor should expose:

```text
Edge Softness / Blur
```

Internally this can map to:

```json
"edgeBlur": 1.5
```

When drawing to canvas, the renderer may apply:

```js
ctx.filter = `blur(${edgeBlur}px)`;
```

This should be optional because blur can be performance-heavy at large particle counts.

### Custom PNG / Texture Sprite Mode

Some effects should use PNG particle sprites rather than SVG shapes.

This is especially important for:

```text
soft glows
smoke puffs
blurred particle rings
magic circles
shockwave rings
lightning streaks
photons
lens flares
imported Effekseer textures
custom user particle images
```

The UI should allow:

```text
Choose Custom PNG
Preview texture thumbnail
Replace texture
Clear texture
Use texture alpha
Tint mode
Fit mode
```

Recommended controls:

```text
Texture File
Texture Preview
Fit Mode: contain / cover / stretch
Tint Mode: none / multiply / additive
Use Texture Alpha: on/off
```

Recommended data:

```json
{
  "visual": {
    "shapeMode": "textureSprite",
    "shape": "texture",
    "texture": "assets/fx/shared/Particle03.png",
    "useTextureAlpha": true,
    "tintMode": "additive",
    "fitMode": "contain",
    "edgeBlur": 0,
    "colors": ["#ccfbf1", "#22c55e", "#14532d"],
    "alphas": [0, 0.8, 0],
    "glow": 20,
    "composite": "lighter"
  }
}
```

### Texture Cache

The runtime should not reload an image every time a particle is drawn.

A texture cache should load each texture path once and reuse the same Image object.

Recommended module:

```text
src/engine/texture-cache.js
```

Responsibilities:

```text
load texture paths
cache Image objects
track loaded/error states
provide fallback shape if texture fails
avoid duplicate loads
```

If a texture is missing, the renderer should show a fallback built-in shape and a warning in the editor.

## FX Drivers

An FX Driver is a value source that changes an effect over time.

Possible drivers:

```text
Elapsed time
Manual keyframes
Audio bass
Audio mids
Audio treble
Beat pulse
Music energy
Distance to player
Corruption level
Danger level
Quest flag
World state
Cooldown state
Object state
Scene trigger
Player health
Pointer / touch position
Attached entity movement
```

Examples:

```text
Opacity driven by bass.
Particle emission driven by treble.
Glow intensity driven by corruption level.
Screen tint driven by World State.
Effect start/stop driven by Quest flag.
Emitter position attached to an object.
Vignette scale driven by beat pulse.
```

FX Drivers make effects reusable because the same base archetype can behave differently depending on audio, scene state, story state, object state, or timeline keyframes.

## Emitters

An Emitter is the source that creates or positions an effect.

Emitter types may include:

```text
Point emitter
Line emitter
Area emitter
Path emitter
Object-attached emitter
Character-attached emitter
Screen-space emitter
UI-attached emitter
Manual tracked point
```

A smoke effect might emit from a chimney, a magical object, or a hand position. A sparkle effect might emit from a shrine area. A video FX pass might use a manually tracked point over a reference video.

## Effect Layers

Effects must support clear layer placement.

Possible layer categories:

```text
Behind background overlay
Behind characters
Same layer as object
In front of characters
Foreground fog
Screen overlay
UI overlay
Transition overlay
Export-only plate layer
```

The Scene Editor should place FX Instances into these layers without requiring the user to understand low-level canvas draw order.

## Effekseer Import / Converter

The FX Editor should eventually include an Effekseer-to-Artifex converter.

Effekseer projects may contain useful reusable particle data and texture assets. The goal is not to perfectly emulate every Effekseer feature immediately. The first goal is to convert Effekseer effects into editable Artifex FX JSON approximations.

### Source Files

Effekseer packages may include:

```text
.efkproj project files
.efkefc compiled effect files
PNG textures
materials
models
folders such as Texture/
metadata
```

The tested `MagicTornade.efkproj` example is XML-like/readable and references a texture such as:

```text
Texture/Particle03.png
```

That means at least some Effekseer projects can be parsed directly rather than treated as opaque binary files.

### Converter Goal

Recommended converter output:

```text
fx_magic_tornade.artifex.json
assets/fx/magic_tornade/Particle03.png
```

The resulting Artifex JSON should be editable in the FX Editor and placeable in the Scene Editor.

### Conversion Levels

There are three possible levels of conversion.

#### 1. Wrapper Conversion

Keep the original Effekseer file and create an Artifex wrapper pointing to it.

This is only useful if the Artifex Runtime can play Effekseer files directly.

#### 2. Visual Approximation Conversion

Parse Effekseer data and create a visually similar Artifex FX Archetype using the Artifex particle engine.

This is the recommended first converter target.

#### 3. Exact Conversion

Translate every Effekseer feature perfectly.

This is not a first-version target because Effekseer may support complex 3D nodes, curves, materials, model emitters, distortions, renderer-specific behaviours, and other features not yet present in Artifex.

### Mapping Strategy

Effekseer data should be mapped into Artifex fields where possible.

Possible mapping:

```text
Effekseer node -> Artifex composition layer
node name -> layerName
node renderer type -> effectType / visual mode
texture path -> visual.texture / assets.textures
max generation -> emitter rate or particle count behaviour
life span -> life duration
generation time -> emitter rate/timing
location -> emitter position or movement settings
rotation -> particle rotation settings
scale -> visual sizeStart / sizeEnd
colour ranges -> visual colors / alphas
blend mode -> visual composite
ribbon renderer -> ribbon effectType
ring renderer -> ring effectType
sprite renderer -> textureSprite or particles effectType
model renderer -> unsupported/fallback note
sound track -> future audio event / unsupported note
```

Unsupported fields should not be ignored silently. The converter should preserve notes in the output:

```json
"conversionNotes": [
  "Model renderer not supported; converted to particle approximation.",
  "Texture/Particle03.png used as textureSprite.",
  "Effekseer curve data approximated with linear values."
]
```

### Texture Handling

If the Effekseer project references PNG textures and those textures are available, the converter should keep and copy those PNGs.

PNG textures should be preferred for:

```text
soft glow rings
smoke stamps
shockwave rings
photons
magic circles
streaks
lightning
lens flares
ribbon bodies
```

SVG fallbacks should be used only when:

```text
the texture is missing
the texture is extremely simple
the converter can approximate it cleanly with a built-in shape
```

Example converted texture layer:

```json
{
  "visual": {
    "shapeMode": "textureSprite",
    "shape": "texture",
    "texture": "assets/fx/magic_tornade/Particle03.png",
    "sizeStart": 20,
    "sizeEnd": 60,
    "colors": ["#ccfbf1", "#22c55e", "#14532d"],
    "alphas": [0.0, 0.8, 0.0],
    "blur": 0,
    "glow": 20,
    "composite": "lighter"
  }
}
```

### Converter UI

Recommended UI action:

```text
Import Effekseer Effect
```

The workflow should be:

```text
Upload .efkproj or package folder/zip.
Upload or include referenced Texture folder.
Parse the project.
List discovered nodes.
List referenced textures.
Show unsupported features.
Generate Artifex FX draft.
Preview draft in FX Editor.
Allow user to tweak the result.
Save as Artifex FX Archetype.
```

### Converter Priority

Do not build the converter before the current FX Editor is modular enough.

Recommended order:

```text
Refactor FX Editor into modules.
Add textureSprite rendering.
Add built-in SVG shape bank expansion.
Add Artifex FX Archetype export wrapper.
Add Scene Editor placement adapter.
Then add Effekseer visual approximation converter.
```

## Plate FX Mode Details

Plate FX Mode is one of the most important production uses for the FX Editor.

It allows the creator to make magic, smoke, glow, portal, fireball, energy, distortion, or other effect layers using a video as a reference plate.

The uploaded reference video is temporary. The editor should store the project settings and effect keyframes, but it should not store the video itself inside the normal project JSON.

The saved FX Plate Project should store:

```text
reference video name
reference video duration
reference video resolution
reference video frame rate
timeline start and end
export resolution
export frame rate
used FX Archetype IDs
FX Instances
keyframes
effect settings
drivers
blend preview settings
notes
```

If the reference video is missing later, the editor should ask the creator to re-link it.

### Plate FX UI

Recommended Plate FX interface:

```text
Left panel: FX Library and effect categories.
Centre: reference video preview stage with effect overlay.
Bottom: timeline, keyframes, playback controls, in/out range.
Right panel: selected FX Instance, settings, drivers, export options, blend preview.
```

Required controls:

```text
Upload reference video
Play / pause
Step forward one frame
Step backward one frame
Jump to start / end
Set in point
Set out point
Add effect at current time
Add keyframe
Move keyframe
Delete keyframe
Keyframe position
Keyframe scale
Keyframe rotation
Keyframe opacity
Keyframe intensity
Keyframe particle emission
Fade in / fade out
Manual point tracking
Preview blend mode
Toggle reference video visibility
Export FX only
Export preview with reference burned in
```

### Plate FX Export Formats

Recommended export priority:

```text
PNG Sequence
WebM with alpha
Animated WebP
Sprite Sheet + JSON
MP4 preview only
```

#### PNG Sequence

Best quality and safest alpha workflow. Creates one transparent PNG per frame. File size is large, but it is the most reliable for external video editors.

#### WebM with Alpha

Useful for compact transparent video and web workflows. Support varies between video editors, so it should not be the only export option.

#### Animated WebP

Useful for web previews, websites, UI effects, small loops, and lightweight animated assets. Not the main professional compositing format.

#### Sprite Sheet + JSON

Best when the effect should return to the Artifex Runtime Engine as a game asset.

#### MP4 Preview Only

MP4 should only be used for preview exports because normal MP4 is not reliable for transparent overlay compositing. A preview MP4 may include the reference video and the effect burned together for checking timing.

## Suggested File Structure

Recommended structure:

```text
artifex/apps/fx-editor/
artifex/apps/effects-library/
artifex/effects/
assets/fx/
data/fx/archetypes/
data/fx/presets/
data/fx/base/
data/fx/composites/
data/fx/plate-projects/
data/projects/<project-id>/fx/
data/scenes/<scene-id>.json
```

Suggested meaning:

```text
assets/fx/ = PNGs, particle textures, masks, sprite sheets, image sequences.
data/fx/archetypes/ = global reusable FX Archetype JSON.
data/fx/presets/ = saved settings variants.
data/fx/base/ = one-file-per-base-effect definitions.
data/fx/composites/ = one-file-per-composite-effect definitions.
data/fx/plate-projects/ = editable Plate FX project files.
data/projects/<project-id>/fx/ = project-specific effects.
data/scenes/<scene-id>.json = scene FX Instances only, not full duplicated effect logic.
```

Example names:

```text
fx_vignette_audio_pulse.json
fx_smoke_green_corruption.json
fx_aetheris_sparkle_burst.json
fx_portal_shimmer_blue.json
fx_songspell_wave_purple.json
plate_mel_spell_cast_001.fxplate.json
fxpass_mel_spell_cast_001_png_sequence/
fxpass_mel_spell_cast_001.webm
fxpass_mel_spell_cast_001_spritesheet.png
fxpass_mel_spell_cast_001_spritesheet.json
```

## Example FX Archetype JSON

```json
{
  "id": "fx_vignette_audio_pulse",
  "type": "screenOverlay",
  "label": "Audio Pulse Vignette",
  "scope": "global",
  "enabled": true,
  "defaultLayer": "screenFX",
  "settings": {
    "shape": "vignette",
    "colour": "rgba(30, 0, 55, 1)",
    "baseOpacity": 0.25,
    "minOpacity": 0.15,
    "maxOpacity": 0.65,
    "blendMode": "multiply",
    "smoothing": 0.6,
    "loop": true
  },
  "drivers": [
    {
      "target": "opacity",
      "source": "audioBass",
      "amount": 1,
      "min": 0.15,
      "max": 0.65
    }
  ]
}
```

## Example Scene JSON Effect Instance

```json
{
  "effects": [
    {
      "id": "dream_vignette_instance_01",
      "archetypeId": "fx_vignette_audio_pulse",
      "enabled": true,
      "layer": "screenFX",
      "trigger": {
        "type": "worldState",
        "value": "dreamscape"
      },
      "overrides": {
        "baseOpacity": 0.2,
        "maxOpacity": 0.55
      }
    }
  ]
}
```

## Example Particle FX Archetype JSON

```json
{
  "id": "fx_smoke_green_corruption",
  "type": "particle",
  "label": "Green Corruption Smoke",
  "scope": "project",
  "projectId": "forever-bound",
  "defaultLayer": "frontOfObject",
  "settings": {
    "particleTexture": "assets/fx/smoke_soft_round.png",
    "particleCount": 60,
    "colour": "rgba(40, 180, 85, 0.35)",
    "speedX": 0.15,
    "speedY": -0.4,
    "sizeMin": 24,
    "sizeMax": 120,
    "opacityMin": 0.05,
    "opacityMax": 0.45,
    "lifetimeMin": 1.2,
    "lifetimeMax": 4.5,
    "blendMode": "screen",
    "loop": true
  },
  "emitter": {
    "type": "point",
    "radius": 20
  }
}
```

## Example FX Plate Project JSON

```json
{
  "id": "plate_mel_spell_cast_001",
  "type": "fxPlateProject",
  "label": "Mel Spell Cast FX Pass 001",
  "referenceVideo": {
    "fileName": "mel_spell_cast_reference.mp4",
    "duration": 8.4,
    "width": 1920,
    "height": 1080,
    "frameRate": 25
  },
  "timeline": {
    "start": 0,
    "end": 8.4,
    "exportFrameRate": 25
  },
  "export": {
    "width": 1920,
    "height": 1080,
    "transparent": true,
    "format": "pngSequence"
  },
  "effects": [
    {
      "id": "hand_glow_01",
      "archetypeId": "fx_songspell_wave_purple",
      "startTime": 1.2,
      "endTime": 5.8,
      "blendPreview": "screen",
      "keyframes": [
        {
          "time": 1.2,
          "x": 920,
          "y": 540,
          "scale": 0.4,
          "opacity": 0
        },
        {
          "time": 2.0,
          "x": 940,
          "y": 520,
          "scale": 0.75,
          "opacity": 1
        },
        {
          "time": 5.8,
          "x": 980,
          "y": 500,
          "scale": 1.1,
          "opacity": 0
        }
      ]
    }
  ]
}
```

## Scene Editor Integration

The Scene Editor should eventually allow:

```text
Add FX Instance
Choose from Effects Library
Choose FX Archetype
Preview live in scene
Edit instance overrides
Set layer
Set spawn bounds
Attach to object or marker
Attach to character
Attach to screen layer
Set trigger condition
Set world-state condition
Save FX Instance into scene JSON
Export effect preset
Import effect preset
Open selected effect in FX Editor
```

The Scene Editor should not become the full effect authoring tool. It only needs enough control to place and configure existing effects. Complex authoring belongs in the FX Editor.

## Runtime Engine Integration

The Runtime Engine needs an FX Runtime.

The FX Runtime reads FX Archetype JSON and FX Instance data, then handles:

```text
Loading effect assets
Updating effect time
Drawing effect layers
Applying drivers
Reading audio analysis values
Following attached objects
Starting and stopping effects
Looping effects
Destroying finished effects
Responding to scene triggers
Responding to quest flags
Responding to world state
Rendering screen overlays
Rendering particles
Rendering sprite-sheet effects
Rendering built-in SVG/procedural shapes
Rendering texture sprites
```

The game should not have one-off custom code for every fog layer, sparkle, glow, or portal. The Runtime should play reusable effects from data.

## Video Production Use

The Plate FX workflow makes the Effects Library useful outside the game.

Effects created for the game can also be used for:

```text
production video overlays
trailers
website splash visuals
social clips
title animations
spell effects
smoke overlays
portal overlays
fireball passes
magic glows
corruption pulses
Aetheris light passes
```

This supports a build-once-use-everywhere workflow. The same magic, smoke, fire, portal, glow, or distortion logic can be reused in the game, the website, trailers, production videos, and template projects.

## First-Version Scope

The first version should stay small.

First build target:

```text
Create an FX Archetype.
Choose type: glow, particle, overlay, or sprite animation.
Set colour, opacity, speed, size, loop, and layer.
Preview it on transparent, black, and sample-scene backgrounds.
Save as JSON.
Load it into the Scene Editor.
Place it as an FX Instance.
Export scene JSON.
Have the Runtime Engine render it.
```

Current prototype stabilization target:

```text
Upload the current single-file FX Editor to GitHub.
Refactor it into modules without changing behaviour.
Move base presets and composite presets out of index.html.
Extract the particle runtime from the editor UI.
Add built-in SVG shape bank expansion.
Add custom PNG / texture sprite mode.
Add texture caching.
Add Artifex FX Archetype export wrapper.
Keep editor project export separate from runtime asset export.
```

Plate FX Mode first build target:

```text
Upload a reference video.
Play, pause, and scrub the timeline.
Add one existing FX Archetype over the video.
Set simple keyframes for position, scale, and opacity.
Preview over the reference video.
Export FX only as PNG sequence.
Export preview MP4 with reference burned in.
```

Do not build the massive version first.

Later additions can include:

```text
Audio EQ drivers
Beat detection
Path emitters
Manual motion tracking
Distortion maps
Masks
Blend mode previews
WebM alpha export
Animated WebP export
Sprite sheet export
Timeline curves
Reusable keyframe presets
Multi-layer FX stacks
Batch export
Effekseer visual approximation converter
AI image-to-FX JSON generator
```

## Summary

The Artifex FX Editor is both a game-building tool and a production tool.

For games, it creates reusable FX Archetypes that can be placed as FX Instances and rendered by the Runtime Engine.

For video production, it uses a reference video as an FX Plate and exports only the transparent effect layer as an FX Pass.

For imported third-party/sample effects, it should eventually parse Effekseer data and convert it into editable Artifex FX approximations, copying useful PNG textures where available and falling back to built-in SVG shapes where needed.

The reference video is only a guide. The exported FX Pass is what gets composited over final footage in an external editor.

This keeps Artifex modular, reusable, and useful across games, trailers, websites, imported effect libraries, and production videos.
