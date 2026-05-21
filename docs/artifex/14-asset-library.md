# Asset Library

## Purpose

Artifex should include a searchable Asset Library.

The Asset Library stores all usable project assets and makes them searchable by type, tag, character, folder, scene, and usage.

This is different from the Advanced Object Library.

- Asset Library = raw files and file metadata.
- Advanced Object Library = reusable game things and behaviours.
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
Copy file path
Insert into Scene Editor
Add/edit tags
Group related files
Group related files into characters/animation sets
Track usage across scenes
```

## Scene Editor Integration

The Scene Editor should eventually use the Asset Library directly.

When adding an object or character, the creator should be able to pick from tagged assets instead of manually typing paths.

## Relationship To Project Settings

The selected Project Profile controls which assets appear in the Asset Library.

A project may have its own asset folders, external URLs, templates, effects libraries, and default export folders.
