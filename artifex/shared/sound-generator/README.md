# Shared Procedural Sound Generator Popup

## Purpose

This folder contains the reusable V1.00 **Create Synth Sound** popup and Web Audio preview runtime defined by `docs/artifex/22-sound-archetype-generator.md`.

Generated sounds use the existing Asset Library model. A saved generated sound becomes a normal registered audio asset with an `asset_sfx_` ID and a procedural recipe file under `assets/audio/sfx/`. This tool does not create a separate sound-archetype index or an `archsound_` identifier family.

## Public API

```js
import {
  mountSoundGenerator,
  openSoundGeneratorModal
} from '../../shared/sound-generator/sound-generator-window.js';
```

### Floating caller mode

```js
openSoundGeneratorModal({
  sourceLabel: 'Puzzle Creator > Correct Input',
  onAssign: ({ assetId }) => {
    // Store assetId in the caller's current draft field.
    // The caller remains responsible for saving its own record.
  }
});
```

Closing the popup destroys the preview runtime and stops active or looping sound.

## Active Files

```text
sound-generator-window.js       public mount/open-modal lifecycle API
sound-generator-ui-v1.js        active V1 popup UI and control bindings
sound-generator-controls.js     creator-facing controls and recipe mapping
sound-generator-presets.js      purpose examples and new-sound foundations
procedural-synth-schema.js      generated-audio JSON schema and asset/path IDs
procedural-synth-runtime.js     Web Audio preview engine
sound-generator-store.js        JSON import/export and connected Asset Library save
sound-generator.css             shared popup styling
```

`sound-generator-ui.js` is an earlier compact popup implementation retained during this staged integration pass; the active window entrypoint loads `sound-generator-ui-v1.js`.

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

## V1 Functionality

The active shared popup supports:

```text
Use Example and Start New modes
plain-language Tone, Pitch, Length, Pitch Change, Wobble, Pace,
Brightness, Static, Echo, Pattern, Loop and safe Preview Volume controls
Preview and Stop through Web Audio
Random Sound, Variation and Reset
JSON import and export
connected-folder Asset Library saving
Save and Assign caller callback
```

## Current Integration Boundary

A small browser test harness is available at:

```text
artifex/apps/sound-generator-preview/
```

Current `main` also includes **Archetype Object Creator V1.35** caller integration: its Sound Events area can open this shared popup and receive the registered `asset_sfx_` ID in the current object draft after **Save and Assign Here**. Scene Editor and Puzzle Creator remain later caller integrations.
