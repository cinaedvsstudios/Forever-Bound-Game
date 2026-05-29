# Artifex Asset Intake Workflow

## Purpose

This document defines the simple creator-facing folder where people can drop new artwork, icons, music, dialogue, sound effects, and other source assets before Artifex sorts them into the final project package.

The intake folder is not the final game/library folder structure. It is a temporary staging area for unfinished or newly supplied files.

A creator should be able to make a file, save it into one obvious bucket, and let Artifex handle the later admin: review, rename, copy, index, group, and reference it correctly.

## Core idea

Creators should not need to understand every final Artifex folder while they are making assets.

They should place new files into:

```text
artifex/templates/artifex-adventures/intake/
```

Then Artifex can later:

1. read the dropped file;
2. ask or infer what kind of asset it is;
3. preserve the original filename in metadata;
4. assign a stable `asset_` ID;
5. rename the file safely;
6. copy the approved file into the correct final `assets/` folder;
7. update `assets/asset-index.json`;
8. create an `assets/groups/assetgroup_<slug>.json` record if the files belong together;
9. update scenes, screens, object archetypes, effects, quests, or runtime settings to reference the new clean asset path or ID.

## Simple intake folders

Use only these first-level buckets:

```text
artifex/templates/artifex-adventures/intake/backgrounds/
artifex/templates/artifex-adventures/intake/characters/
artifex/templates/artifex-adventures/intake/objects/
artifex/templates/artifex-adventures/intake/icons-ui/
artifex/templates/artifex-adventures/intake/music/
artifex/templates/artifex-adventures/intake/dialogue-sfx/
```

These buckets are intentionally broad. The app can do the finer sorting later.

## What goes where

| Intake folder | What users should put there |
|---|---|
| `backgrounds/` | Full scene backgrounds, title/ending backgrounds, train interiors, station platforms, corridors, scenery loops, window tiles, parallax plates, environmental plates. |
| `characters/` | Hero art, NPC art, villains, enemies, portraits, turnarounds, sprite sheets, animation frames, character references. |
| `objects/` | Props, clue items, Great Omar fragments, postcards, journals, tickets, disguises, doors, drawers, cabinet overlays, suitcase states, pickups, interactable object art. |
| `icons-ui/` | Inventory icons, action icons, interact prompts, menu icons, HUD pieces, buttons, panels, UI frames, status symbols. |
| `music/` | Theme music, location music, tension cues, victory music, menu music, stingers if they are musical rather than sound effects. |
| `dialogue-sfx/` | Voice lines, narration, dialogue audio, footsteps, train ambience, door clicks, drawer sounds, item pickup sounds, UI beeps, environmental sound effects. |

If something feels ambiguous, choose the closest bucket. The importer can ask for confirmation before promoting it into the final project package.

## Artifex Adventures intake folder

For the current template game, the active intake folder is:

```text
artifex/templates/artifex-adventures/intake/
```

This is where Chris or any asset creator should dump files while making Artifex Adventures assets.

## Final folder promotion examples

A user drops:

```text
intake/music/Artifex Hero Theme Final FINAL.mp3
```

Artifex promotes it to:

```text
assets/audio/music/music_artifex_adventures_hero_theme.mp3
```

and creates an asset record similar to:

```json
{
  "id": "asset_music_artifex_adventures_hero_theme",
  "name": "Artifex Adventures Hero Theme",
  "type": "music",
  "file": "assets/audio/music/music_artifex_adventures_hero_theme.mp3",
  "sourceFileName": "Artifex Hero Theme Final FINAL.mp3",
  "status": "draft",
  "tags": ["artifex-adventures", "hero-theme", "music", "orchestral"]
}
```

A user drops:

```text
intake/backgrounds/compartment with missing drawer.png
```

Artifex promotes it to:

```text
assets/backgrounds/scenes/compartment_4b/scene_compartment_4b_base.png
```

and the Scene Editor later references that final path from:

```text
scenes/scene_compartment_4b.json
```

A user drops:

```text
intake/objects/drawer open 50 black bg.png
```

Artifex promotes it to a proper object/scene-layer asset path such as:

```text
assets/backgrounds/scenes/compartment_4b/overlay_compartment_fixtures_open_50.png
```

or, if it becomes a reusable object, to:

```text
assets/objects/scene_props/overlay_compartment_fixtures_open_50.png
```

depending on the final Asset Library decision.

## What intake files are not

Files in `intake/` are not final game references.

Scene JSON, object archetypes, quest records, and runtime settings should not permanently point at `intake/` files.

The intake folder is allowed to be messy. The final `assets/` and data folders should be clean, stable, indexed, and referenced by IDs.

## Relationship to the project file contract

The project file contract keeps Artifex split into module-owned files and stable IDs. The Asset Library owns raw asset metadata and asset groups. The Scene Editor owns scene and screen placement. The Archetype Object Creator owns reusable object definitions. The Effect Editor owns reusable effect definitions. Quest Builder owns quests, flags, conditions, rewards, branches, and unlocks. Project Manager links the full project together.

The intake folder sits before all of that. It is the practical drop zone for files before they are promoted into the proper module-owned structure.
