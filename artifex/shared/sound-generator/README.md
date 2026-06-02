# Shared Sound Library and Create Synth Sound

This shared owner contains the Artifex audio-selection foundation:

1. **Sound Library** — an audio-filtered selector view of the existing Asset Library records in `assets/asset-index.json`.
2. **Create Synth Sound** — a game-SFX procedural sound editor opened from Sound Library.
3. **Procedural synth runtime/store/schema** — Web Audio audition and registered generated-audio persistence.

Sound Library is not a new sound-archetype database. It does not create `archetypes/sound-index.json`, `archetypes/sounds/`, `archsound_` IDs or copied recipe data inside caller records. Imported audio files and generated synth recipes are both normal registered Audio Asset Library resources.

## Canonical future workflow

```text
caller app field/event
  -> Sound Library
  -> choose an existing registered audio asset
     OR Create New Synth Sound
  -> save generated synth as a normal Audio Library item
  -> return only the selected registered asset_ ID to the captured caller target
```

This PR exposes the workflow only through the standalone preview harness. Object Creator, Quest Builder, Effect Editor, Puzzle Creator, Scene Editor, Project Editor and Hub routing are not integrated here; their adoption is tracked separately in `artifex/shared/todo-guide/all-apps-todos.json`.

## Files

```text
sound-library.js                 shared Sound Library modal/API
sound-generator-window.js         modal/standalone Create Synth Sound wrapper
sound-generator-ui-v1.js          redesigned game-SFX editor UI
sound-generator-presets.js        Sound Types catalogue and constrained variation profiles
sound-generator-controls.js       persisted audible controls -> synth recipe mapping
procedural-synth-schema.js        generated-audio JSON schema and asset/path IDs
procedural-synth-runtime.js       Web Audio preview engine
sound-generator-store.js          save recipe + asset-index registration helpers
sound-generator.css               shared Sound Library/editor styling
```

## Sound Library API

```js
openSoundLibraryModal({
  sourceLabel: 'Preview Harness > Object Action Sound',
  currentAssetId: 'asset_sfx_optional_current_selection',
  onAssign: ({ assetId }) => {
    // assetId is the only value future caller apps should persist.
  }
});
```

When opened, Sound Library captures the source label and assignment callback. The preview harness includes a simulated target-change test proving that the returned assignment still resolves to the target captured at open time.

## Storage contract

Generated synth storage remains:

```text
assets/audio/sfx/synth_<slug>.json
assets/asset-index.json entry with an asset_sfx_... ID
```

The generated recipe JSON uses:

```text
schemaVersion: artifex.audio.procedural-synth.v1
assetId: asset_sfx_<safe_slug>
assetKind: procedural-synth
resourcePath: assets/audio/sfx/synth_<safe_slug>.json
playbackEngine: web-audio
```

Sound Library reads registered audio through `artifex/shared/registered-content/registered-content-reader.js` and the connected project-folder client. It lists already registered imported WAV/MP3/OGG-style audio files and generated synth recipes together. New external audio import/promotion is intentionally not implemented here because no canonical shared import-new-audio owner was found; that remains an Asset Library todo.

## Create Synth Sound workflow

The normal editor is designed for game SFX creation rather than metadata/JSON editing:

- left **Sound Types** catalogue with search and compact grouped rows;
- selected type summary plus constrained **Random Variation** button;
- Preview/Stop, Previous/Next history, variation counter and favourite comparison list;
- simple audible controls: Tone, Pitch, Length, Brightness, Noise, Echo, Wobble and Impact;
- Advanced Controls only for supported persisted values: pitch movement, repeat pace, preview volume, pattern and loop;
- save metadata appears only in the save-confirmation step.

Every random variation is generated from owned profile data in `sound-generator-presets.js`, so Pickup / Coin stays bright and short, Locked Door stays a refusal cue, Footstep stays a step, Magic Spark stays a shimmer, Portal Loop stays a sustained loop, Quest Complete stays rewarding and Explosion stays noise-heavy with a falling tail.
