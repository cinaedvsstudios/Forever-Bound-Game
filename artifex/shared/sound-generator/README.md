# Shared Procedural Sound Generator Popup

## Purpose

This folder contains the reusable **Create Synth Sound** popup and Web Audio preview runtime defined by `docs/artifex/22-sound-archetype-generator.md`.

Generated sounds use the existing Asset Library model. A saved generated sound becomes a normal registered audio asset with an `asset_sfx_` ID and a procedural recipe file under `assets/audio/sfx/`. This tool does not create a separate sound-archetype index or an `archsound_` identifier family.

## Public API

```js
import {
  mountSoundGenerator,
  openSoundGeneratorModal
} from '../../shared/sound-generator/sound-generator-window.js';
```

## What changed in this replacement set

The popup now uses an SFXR-style procedural control model instead of only a small generic slider set.

The simple controls remain visible for quick editing, but the advanced section now exposes:

```text
Envelope
Frequency
Vibrato
Arpeggiation
Duty Cycle
Retrigger
Flanger
Low-Pass Filter
High-Pass Filter
Output
```

The recipe builder also adds recognisable procedural layers for named sounds. For example:

```text
Locked Door       thud + rattle + refusal buzz
Item Pickup       click + rising sparkle tones
Door Open         thud + scrape/sweep movement
Footstep          low thud + short noise texture
Explosion/Impact  boom + noise + crackle/rattle
Magic/Portal      sweep + shimmer + sparkle
```

## Active Files

```text
sound-generator-window.js       public mount/open-modal lifecycle API
sound-generator-ui-v1.js        active popup UI and control bindings
sound-generator-controls.js     creator-facing controls and recipe mapping
sound-generator-presets.js      purpose examples and new-sound foundations
procedural-synth-schema.js      generated-audio JSON schema and asset/path IDs
procedural-synth-runtime.js     Web Audio preview engine
sound-generator-store.js        JSON import/export and connected Asset Library save
sound-generator.css             shared popup styling
```

## Generated Audio Record

The popup builds recipe documents using:

```text
schemaVersion: artifex.audio.procedural-synth.v1
assetId: asset_sfx_<safe_slug>
assetKind: procedural-synth
resourcePath: assets/audio/sfx/synth_<safe_slug>.json
playbackEngine: web-audio
```

The JSON retains both editable creator controls and runtime-ready synthesis values.

## Save Behaviour

**Save to Library** deliberately writes two connected-project changes through the shared project-folder service:

```text
assets/audio/sfx/synth_<slug>.json        generated procedural recipe
assets/asset-index.json                   normal asset_sfx_ registration record
```

**Save and Assign Here** performs that same save, then returns the registered `asset_sfx_` ID through the caller callback. The popup does not silently write the caller's object, scene or puzzle record.

## Integration Boundary

A small browser test harness is available at:

```text
artifex/apps/sound-generator-preview/
```

Caller editors remain responsible for storing the returned `asset_sfx_` ID in their own draft data.
