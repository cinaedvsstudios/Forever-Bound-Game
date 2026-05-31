# Asset Library

## Purpose

Artifex should include a searchable Asset Library.

The Asset Library stores all usable project assets and makes them searchable by type, tag, character, folder, scene, and usage.

This is different from the Advanced Object Library.

- Asset Library = final usable resource files or generated-resource recipes and their metadata.
- Advanced Object Library = reusable game things and behaviours that refer to assets.
- Flatplan Catalog = completed project structures that can be placed onto the Flatplan.

## Asset Categories

```text
Characters
Character Animations
Props
Backgrounds
UI Elements
Buttons
Frames
Logos
Icons
Audio
Music
Sound Effects
CG Effects
Templates
```

## Basic Asset Record

```json
{
  "id": "barrel_wood_01",
  "name": "Wooden Barrel 01",
  "type": "prop",
  "file": "assets/props/barrel_wood_01.png",
  "tags": ["barrel", "wood", "town", "searchable"],
  "status": "draft",
  "notes": "Reusable searchable object."
}
```

Earlier example:

```json
{
  "id": "mel_idle_right",
  "name": "Mel Idle Right",
  "type": "character_sprite",
  "character": "Mel",
  "file": "assets/characters/mel/mel_idle_right.png",
  "tags": ["mel", "player", "idle", "right", "sprite"],
  "notes": "",
  "usedIn": []
}
```

## Audio Assets: Imported Files and Generated Synth Recipes

Sound resources must appear through one Asset Library selection and reference system, whether they are imported recordings or generated procedural electronic sounds.

Normal imported audio is promoted from `intake/` into a final audio location and registered in `assets/asset-index.json`:

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

A procedural synth sound is created within Artifex and is registered through exactly the same `asset_` library model. Its final resource is a JSON playback recipe rather than an audio recording:

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

Generated synth sounds are not external source material and therefore do not need to pass through `intake/`. The shared Procedural Sound Generator saves an approved recipe under `assets/audio/sfx/` and creates or updates its entry in `assets/asset-index.json`.

In the creator interface these resources may be described as **Sound Archetypes** because they contain reusable generation data. In stored project structure they remain audio assets. Do not create a separate `archetypes/sound-index.json`, `archetypes/sounds/` folder or `archsound_` ID system.

Archetype Object Creator, Scene Editor and Puzzle Creator reference either imported or generated sound resources only through their `asset_` IDs. Detailed UI, recipe and playback rules are defined in `docs/artifex/22-sound-archetype-generator.md`.

## Character Asset Groups

A character should not just be one file. A character should be an asset group.

Example character asset group:

```json
{
  "id": "mel",
  "name": "Mel",
  "type": "character",
  "folder": "assets/characters/mel/",
  "tags": ["player", "witch", "main-character"],
  "animations": {
    "idle": ["mel_idle_01.png"],
    "idle_right": "mel_idle_right.png",
    "idle_left": "mel_idle_left.png",
    "walk_right": [
      "mel_walk_right_01.png",
      "mel_walk_right_02.png",
      "mel_walk_right_03.png"
    ],
    "walk_left": [
      "mel_walk_left_01.png",
      "mel_walk_left_02.png",
      "mel_walk_left_03.png"
    ],
    "jump": "mel_jump.png"
  },
  "portraits": {
    "neutral": "mel_portrait_neutral.png",
    "angry": "mel_portrait_angry.png",
    "sad": "mel_portrait_sad.png"
  },
  "notes": ""
}
```

## Required Features

The Asset Library should support:

```text
Search by name
Search by tag
Filter by type
Filter by status
Filter by project
Filter by character
Filter by scene usage
Preview image/audio
Preview procedural synth audio through its playback engine
Distinguish imported audio files from generated synth recipes while listing them together
Copy file path
Insert/assign in Scene Editor, Object Creator and Puzzle Creator where supported
Add/edit tags
Group related files
Group related files into characters/animation sets
Track usage across scenes and other referring records
Edit an existing generated synth sound through the shared popup
```

## Scene Editor Integration

The Scene Editor should eventually use the Asset Library directly.

When adding an object, character, visual asset or sound, the creator should be able to pick from tagged final registered assets instead of manually typing paths. Where a sound field has no suitable resource, Scene Editor should later be able to call the same shared Procedural Sound Generator popup used by Object Creator and Puzzle Creator.

## Relationship To Project Settings

The selected Project Profile controls which assets appear in the Asset Library.

A project may have its own asset folders, external URLs, templates, effects libraries, and default export folders.
