# Procedural Sound Generator — Shared Generated-Audio Asset Popup Contract

Date: 2026-05-31  
Status: Design contract for future Artifex implementation

## Purpose

The **Procedural Sound Generator** is a small shared popup for creating reusable synthesised game noises at the point where a sound is needed. A creator working in Archetype Object Creator, Scene Editor, Puzzle Creator or a later screen/event editor should be able to create an electronic beep, buzz, hum, pulse or warning sound without leaving that workflow.

In the interface it may be described as creating a **Sound Archetype**, because the sound is reusable and has generation data. In project storage it uses the existing **Asset Library** model: it is a final registered audio asset whose playable resource is a JSON synthesis recipe instead of a WAV, OGG or MP3 file.

```text
Sound: [ None ] [ Choose from Library ] [ Create Synth Sound ]
```

The popup opens in context, previews live browser-generated audio, saves the recipe to the current project, registers it in the same sound-effects library as imported audio, and can immediately assign its `asset_` ID to the field that requested it.

## Locked Design Decisions

1. A generated procedural sound is registered through `assets/asset-index.json`, just like an imported sound file.
2. Its final recipe file is stored under `assets/audio/sfx/`, for example `assets/audio/sfx/synth_locked_door_buzz.json`.
3. Do **not** create `archetypes/sound-index.json`, `archetypes/sounds/` or an `archsound_` ID family for this feature.
4. The creator UI is a shared popup/component callable from multiple editors, not a full separate app that interrupts a current object, scene or puzzle task.
5. A calling object, scene or puzzle stores only the registered `asset_` ID; it does not copy the full sound recipe into its own record.
6. The first implementation uses the browser Web Audio API for preview and runtime playback.
7. The normal controls use understandable game-sound labels. Detailed technical synthesis controls may be added later behind an Advanced section.
8. Replace the unclear label **Direction** with **Pitch Change**, shown as `Drops`, `Steady` and `Rises`.
9. **Save and Assign Here** registers the generated audio asset, saves its recipe, and inserts its ID into the caller's initiating field/task target, even if the caller UI selection changes while the popup is open. The caller's normal Save action remains responsible for writing the object/scene/puzzle record.
10. This design already fits the existing `assets/audio/sfx/` and `assets/asset-index.json` structure. It does not require a new blank-starter folder, empty index or starter initializer change.

## Relationship to Normal Sound Files

Imported and generated sounds are presented through the same library and selected through the same `asset_` references.

```text
Imported source sound
  intake/dialogue-sfx/Door Locked Buzz.wav
    → Asset Library promotion
  assets/audio/sfx/sfx_door_locked_buzz.wav
    → assets/asset-index.json: asset_sfx_door_locked_buzz

Generated synth sound
  Create Synth Sound popup
    → direct approved generated resource
  assets/audio/sfx/synth_locked_door_buzz.json
    → assets/asset-index.json: asset_sfx_locked_door_buzz
```

A generated sound does not need to pass through `intake/`, because it is created and approved inside Artifex rather than supplied as an external source file.

From a selector, both look like sound resources:

```text
▶ Wooden Door Creak        Imported Audio File
▶ Locked Door Buzz         Generated Synth
▶ Correct Sequence Bleep   Generated Synth
```

The difference is playback only:

```text
Audio file asset       → play its WAV/OGG/MP3 resource
Procedural sound asset → execute its JSON recipe through the shared Web Audio runtime
```

## Where the Popup Appears

| Calling app | Example sound fields |
|---|---|
| Archetype Object Creator | On pickup, on interact, on open, on locked, idle/looping machine sound. |
| Scene Editor | On scene enter, ambient loop, local event trigger, portal/machinery area sound. |
| Puzzle Creator | Correct input, failed input, sequence step, timer warning, solved state. |
| Screen/UI editor later | Select, confirm, cancel, warning and menu-transition sounds. |
| Quest/event tools later | Completion sting or triggered electronic cue where appropriate. |

## Popup Window Design

```text
┌───────────────────────────────────────────────────────────────────────────────┐
│ CREATE SYNTH SOUND                         Source: Puzzle > Correct Input     │
│ Name: [ Correct Sequence Bleep____________ ]        [Preview ▶] [Stop ■]      │
├──────────────────────────────┬────────────────────────────────────────────────┤
│ START / EXAMPLES             │ ADJUST SOUND                                   │
│ [Use Example] [Start New]    │                                                │
│                              │ Character                                      │
│ UI & Buttons                 │ Tone       Soft  ─────●─────  Harsh           │
│  ▶ Confirm Chime             │ Pitch      Low   ───────●───  High            │
│  ▶ Error Buzz                │ Length     Short ───●───────  Long            │
│ Doors & Machines             │                                                │
│  ▶ Locked Door Buzz          │ Shape                                          │
│  ▶ Generator Hum             │ Pitch Change [ Drops | Steady | Rises ]       │
│ Puzzle Feedback              │ Wobble     Still ──●────────  Warbling        │
│  ▶ Correct Input             │ Pattern    Single / Double / Triple / Repeat   │
│  ▶ Wrong Input               │ Pace       Slow  ─────●─────  Fast            │
│ Magic & Energy               │                                                │
│  ▶ Portal Pulse              │ Texture                                        │
│ Loops & Atmosphere           │ Brightness Muffled ─────●─── Sharp            │
│  ▶ Machine Hum               │ Static     Clean ───●─────── Noisy            │
│                              │ Echo       Dry   ──●──────── Spacious         │
│ Start New:                   │ Loop       Off / On                            │
│  ○ Blip     ○ Buzz           │                                                │
│  ○ Chime    ○ Pulse          │ [Random Sound] [Random Variation] [Reset]     │
│  ○ Hum      ○ Static Burst   │                                                │
│  ○ Alarm    ○ Empty Tone     │                                                │
├──────────────────────────────┴────────────────────────────────────────────────┤
│ Library category: [Puzzle Feedback ▾] Tags: [correct] [short] [+ Add tag]   │
│                       [Cancel] [Save to Library] [Save and Assign Here]      │
└───────────────────────────────────────────────────────────────────────────────┘
```

## Starting a New Sound

There are two starting modes:

- **Use Example** starts from a game-purpose sound such as `Locked Door Buzz`, `Item Collected`, `Correct Input` or `Portal Pulse`.
- **Start New** starts from a simple sound shape, so the creator can invent something without knowing synthesis terminology.

| Start New shape | Starting sound |
|---|---|
| Blip | One short, clean electronic tone. |
| Buzz | One low, harsher sustained tone. |
| Chime | A clean bright two-step tone. |
| Pulse | A short repeated tone pattern. |
| Hum | A held/loopable low tone. |
| Static Burst | A short noise-led electronic zap. |
| Alarm | A repeating alternating warning pattern. |
| Empty Tone | A neutral single tone with no strong character. |

Built-in examples are popup presets only. They do not become project assets until saved.

## Initial Example Categories

| Category | Suggested examples |
|---|---|
| UI & Buttons | Select Tick, Confirm Chime, Cancel Thud, Error Buzz, Warning Beep. |
| Pickups & Rewards | Item Collected, Key Acquired, Secret Found, Quest Success, Power Restored. |
| Doors & Machines | Door Unlock, Locked Door Buzz, Terminal Input, Machine Activate, Generator Hum. |
| Puzzle Feedback | Correct Input, Wrong Input, Sequence Step, Timer Warning, Puzzle Solved. |
| Magic & Energy | Magic Spark, Spell Charge, Portal Pulse, Energy Barrier, Cursed Object Hum. |
| Alarms & Threats | Detection Beep, Danger Pulse, Countdown Alert, System Failure, Enemy Activation. |
| Loops & Atmosphere | Electronic Hum, Ancient Device Pulse, Underworld Oil Throb, Flickering Machinery, Magical Resonance. |

## User-Facing Controls

| Displayed control | What the creator experiences | Runtime meaning |
|---|---|---|
| Tone | Soft ↔ Harsh | Smooth/rounded versus sharp/buzzy waveform character. |
| Pitch | Low ↔ High | Base generated frequency. |
| Length | Short ↔ Long | Duration and related volume envelope timing. |
| Pitch Change | Drops / Steady / Rises | Pitch envelope across each sound step. |
| Wobble | Still ↔ Warbling | Low-frequency pitch or filter modulation. |
| Pattern | Single / Double / Triple / Repeat | Number/timing of triggered tone steps. |
| Pace | Slow ↔ Fast | Step delay/repeat interval; disabled for a single sound. |
| Brightness | Muffled ↔ Sharp | Filter brightness/resonance mapping. |
| Static | Clean ↔ Noisy | Generated noise layer amount. |
| Echo | Dry ↔ Spacious | Delay/reverb-style wet amount. |
| Loop | Off / On | Repeating or sustained ambience until stopped. |

**Random Sound** creates a new usable result from the chosen broad category or selected basic shape. **Random Variation** keeps the selected sound recognisable while changing its flavour within controlled limits. Random previews must stay within safe volume and duration bounds and loops must always have a visible Stop action.

## Technical Playback Basis

The generator produces live browser audio through a shared Web Audio API runtime:

```text
Generated-audio asset JSON recipe
→ shared procedural-synth runtime
→ AudioContext
→ OscillatorNode plus optional generated noise
→ gain/pitch timing and optional modulation
→ BiquadFilterNode brightness shaping
→ optional delay/echo chain
→ safe-output GainNode
→ speakers
```

An `AudioWorklet` is not required for the first version.

## Shared Tool Code Location

The popup and playback engine are shared platform code, not project content:

```text
artifex/shared/sound-generator/
  sound-generator-window.js
  sound-generator-controls.js
  sound-generator-presets.js
  procedural-synth-runtime.js
  procedural-synth-schema.js
  README.md
```

## Project File Location and Asset Registration

A generated sound lives in the existing final audio asset area:

```text
<project-root>/
  assets/
    asset-index.json
    audio/
      sfx/
        synth_<slug>.json
```

Generated audio asset record:

```json
{
  "id": "asset_sfx_locked_door_buzz",
  "name": "Locked Door Buzz",
  "type": "sound-effect",
  "assetKind": "procedural-synth",
  "file": "assets/audio/sfx/synth_locked_door_buzz.json",
  "playbackEngine": "web-audio",
  "category": "doors-machines",
  "status": "ready",
  "tags": ["sound-effect", "door", "locked", "buzz", "procedural"]
}
```

Imported audio asset record for comparison:

```json
{
  "id": "asset_sfx_wooden_door_creak",
  "name": "Wooden Door Creak",
  "type": "sound-effect",
  "assetKind": "audio-file",
  "file": "assets/audio/sfx/sfx_wooden_door_creak.wav",
  "sourceFileName": "Old Door Creak 03.wav",
  "status": "ready",
  "tags": ["sound-effect", "door", "wood", "creak"]
}
```

Both records appear in the same sound library and both are selected through stable `asset_` IDs.

## Procedural Synth Recipe JSON

The recipe file saves both creator-facing controls and runtime-ready synthesis values. This preserves editable UI state while keeping playback stable if slider mapping changes later.

```json
{
  "schemaVersion": "artifex.audio.procedural-synth.v1",
  "assetId": "asset_sfx_locked_door_buzz",
  "name": "Locked Door Buzz",
  "category": "doors-machines",
  "editor": {
    "startingMode": "example",
    "startingShape": "buzz",
    "startingExample": "locked-door-buzz",
    "controls": {
      "tone": 72,
      "pitch": 24,
      "length": 30,
      "pitchChange": -20,
      "wobble": 10,
      "pattern": "double",
      "pace": 44,
      "brightness": 36,
      "static": 12,
      "echo": 5,
      "loop": false
    }
  },
  "recipe": {
    "masterGain": 0.28,
    "durationMs": 300,
    "tone": {
      "waveform": "sawtooth",
      "startFrequencyHz": 110,
      "endFrequencyHz": 84,
      "attackMs": 8,
      "releaseMs": 60
    },
    "filter": {
      "type": "lowpass",
      "frequencyHz": 520,
      "resonance": 2.5
    },
    "noise": {
      "enabled": true,
      "level": 0.08
    },
    "echo": {
      "enabled": false,
      "mix": 0
    },
    "pattern": {
      "mode": "double",
      "paceMs": 140,
      "loop": false
    }
  }
}
```

## References Stored by Calling Apps

Calling records save only the sound asset ID:

```json
{
  "sounds": {
    "onLocked": "asset_sfx_locked_door_buzz"
  }
}
```

```json
{
  "feedbackSounds": {
    "correct": "asset_sfx_correct_sequence_bleep",
    "incorrect": "asset_sfx_wrong_input_buzz"
  }
}
```

```json
{
  "ambientSoundId": "asset_sfx_machine_hum"
}
```

## Save Workflow

### Save to Library

The shared generator should:

1. Validate the name, category, control state and safe playback bounds.
2. Assign a stable `asset_` ID.
3. Create or update `assets/audio/sfx/synth_<slug>.json`.
4. Create or update the corresponding `assets/asset-index.json` record with `assetKind: "procedural-synth"` and `playbackEngine: "web-audio"`.
5. Refresh any open audio selector so the new resource is immediately available.
6. Report save state through the connected-folder/draft rules used across Artifex.

### Save and Assign Here

The popup performs the library-save steps, returns the new `asset_` ID to its caller and places the ID into the caller's current draft field. It must not silently save the calling object/scene/puzzle record outside that editor's normal deliberate Save action.

### Edit Existing Generated Sound

A generated sound selected in the Asset Library should expose **Edit Synth Sound**, reopening the same popup with its saved control state. When usage tracking exists, changing a shared sound used in multiple places should warn the creator that playback will change in all references.

## Ownership and Contract Impact

| System | Responsibility |
|---|---|
| Shared Procedural Sound Generator | Popup UI, preview engine, presets, randomisation, recipe validation and serialisation. |
| Asset Library | Registers imported and generated final audio resources in the same `assets/asset-index.json`; provides selection, preview, tags and usage. |
| Connected Project Folder Service | Writes recipe/index updates to the connected root after deliberate save and reports permission/save state. |
| Archetype Object Creator | Assigns audio asset IDs to reusable object behaviours/events. |
| Scene Editor | Assigns audio asset IDs to scene/ambient/local-event data. |
| Puzzle Creator | Assigns audio asset IDs to puzzle-feedback events. |
| Health Guide / Build Game | Validates missing asset IDs, recipe files, recipe schemas/playback engines and runtime packaging. |

This design introduces no new starter-project path or new archetype library. `docs/artifex/19a-project-starter-file-schemas.md` and the blank-starter initializer remain unchanged unless a separate future contract decision changes asset index data requirements.

## Implementation Tasks

1. Add the shared popup and Web Audio preview runtime under `artifex/shared/sound-generator/`.
2. Extend Asset Library metadata/preview handling to list `audio-file` and `procedural-synth` sound assets together.
3. Add connected-folder save logic for recipe JSON and `assets/asset-index.json` registration.
4. Add **Choose Sound**, **Create Synth Sound** and **Save and Assign Here** hooks in Archetype Object Creator.
5. Reuse the same hooks in Scene Editor and Puzzle Creator when their sound-field integration is built.
6. Extend Health/Build validation for procedural sound recipes and missing/unsupported sound assets.
7. Include at least one generated procedural sound in Template Game once the involved apps and runtime playback are ready for validation.

## Acceptance Checklist

- [ ] The same popup opens in context from Object Creator, Scene Editor and Puzzle Creator sound fields.
- [ ] The creator can start from an example or a simple basic sound shape.
- [ ] Primary controls use plain labels including **Pitch Change**, not **Direction**.
- [ ] Preview/Stop works reliably with safe output limits.
- [ ] Random Sound and Random Variation produce controlled usable results.
- [ ] Saving creates a JSON recipe under `assets/audio/sfx/`.
- [ ] Saving creates/updates a normal `asset_` audio record in `assets/asset-index.json`.
- [ ] Imported audio files and generated synth recipes appear in the same selector/library.
- [ ] Save and Assign Here returns the registered `asset_` ID to the caller.
- [ ] Calling files contain only the audio asset ID, not copied recipes.
- [ ] No sound-archetype index or blank-starter structural requirement is added.
- [ ] Health/Build can detect invalid or missing generated sound assets when integrated.

## Current shared audio foundation — Sound Library first

The current shared foundation replaces the older direct caller → Create Synth Sound assumption with the canonical future workflow:

```text
Any authoring app that needs a sound
  -> opens Sound Library first
  -> selects an existing registered audio asset
     OR clicks Create New Synth Sound inside Sound Library
  -> a newly saved synth is stored as a normal Audio Asset Library item
  -> the later app-specific pass returns the selected/new asset_ ID to the exact initiating field/event
```

Sound Library is an audio-filtered view of `assets/asset-index.json`. It lists registered imported audio files and generated procedural synth recipes together while marking them as **Audio File** or **Generated Synth**. It returns only registered `asset_` IDs. It does not create `archetypes/sound-index.json`, `archetypes/sounds/`, `archsound_` IDs, copied recipe data inside app records or any separate Sound Library index.

## Create Synth Sound redesign

Create Synth Sound is now a practical game-SFX editor opened from Sound Library. The normal audition layout shows:

- a **Sound Types** catalogue grouped for UI, Puzzle, Objects, Movement, Combat, Magic / FX, World / Ambience and Quest / Dialogue authoring;
- searchable compact starting sounds such as Pickup / Coin, Locked Door, Footstep, Magic Spark, Portal Loop, Quest Complete and Explosion;
- a constrained **Random Variation** action that keeps each sound inside its recognisable profile instead of generating unrelated sounds;
- temporary unsaved variation history with Previous/Next navigation, variation counters and favourites for comparison;
- simple audible controls first: Tone, Pitch, Length, Brightness, Noise, Echo, Wobble and Impact;
- supported Advanced Controls for pitch movement, repeat pace, preview volume, pattern and loop behaviour;
- a focused save confirmation step where Name, Audio category, Tags, derived `asset_sfx_...` ID preview and `assets/audio/sfx/` location appear only when saving.

Normal audition no longer exposes a permanent Generated Sound Asset panel, permanent JSON, final asset ID/path or required name/category/tags. JSON import/export remains secondary under Advanced Controls for procedural recipes.

## Implementation status after this foundation pass

Implemented and testable in the standalone shared preview harness only:

- shared Sound Library modal/API for registered audio selection;
- project-folder/registered-content reading of `assets/asset-index.json`;
- Web Audio preview for generated synth recipes and file-byte preview for registered audio files where the browser can play the format;
- Sound Library-owned Create New Synth Sound launch;
- save to `assets/audio/sfx/synth_<slug>.json` plus `assets/asset-index.json` registration;
- target-capture behaviour in the preview harness proving that an assignment returns to the context captured when Sound Library opened.

Not implemented in this pass: runtime integration in Object Creator, Quest Builder, Effect Editor, Puzzle Creator, Scene Editor, Project Editor or Hub routing. Those app-specific adoptions remain global todo items and must be completed by their active owners in separate scoped passes.
