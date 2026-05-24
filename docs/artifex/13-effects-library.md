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
data/fx/plate-projects/
data/projects/<project-id>/fx/
data/scenes/<scene-id>.json
```

Suggested meaning:

```text
assets/fx/ = PNGs, particle textures, masks, sprite sheets, image sequences.
data/fx/archetypes/ = global reusable FX Archetype JSON.
data/fx/presets/ = saved settings variants.
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
```

## Summary

The Artifex FX Editor is both a game-building tool and a production tool.

For games, it creates reusable FX Archetypes that can be placed as FX Instances and rendered by the Runtime Engine.

For video production, it uses a reference video as an FX Plate and exports only the transparent effect layer as an FX Pass.

The reference video is only a guide. The exported FX Pass is what gets composited over final footage in an external editor.

This keeps Artifex modular, reusable, and useful across games, trailers, websites, and production videos.
