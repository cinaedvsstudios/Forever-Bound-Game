# Artifex Asset Intake Workflow

## Purpose

This document defines the simple creator-facing folder where people can drop new artwork, icons, music, dialogue, sound effects, and other source assets before Artifex sorts them into the final project package.

The intake folder is not the final game/library folder structure. It is a temporary staging area for unfinished or newly supplied files.

A creator should be able to make a file, save it into one obvious bucket, and let Artifex handle the later admin: review, rename, copy, index, group, and reference it correctly.

## Folder Location Rule

A complete playable template game owns its own intake folder inside its own project folder.

Do **not** place a game's intake folder inside `artifex/templates/`, because that folder is reserved for generic blank reusable starter templates such as scene, screen, UI, or SVG/JSON templates.

For Artifex Adventures, the intake folder is:

```text
artifex/artifex-adventures/intake/
```

Generic blank templates remain under:

```text
artifex/templates/
```

## Simple Intake Folders

Use only these first-level buckets inside a game project's `intake/` folder:

```text
intake/
  backgrounds/
  characters/
  objects/
  icons-ui/
  music/
  dialogue-sfx/
```

These buckets are intentionally broad. The app can do the finer sorting later.

## What Goes Where

| Intake folder | What users should put there |
|---|---|
| `backgrounds/` | Full scene backgrounds, title/ending backgrounds, interiors, landscapes, station/platform views, scenery loops, window tiles, parallax plates and environmental plates. |
| `characters/` | Hero art, NPCs, villains, enemies, portraits, turnarounds, sprite sheets, animation frames and character reference images. |
| `objects/` | Props, clue items, collectibles, keys, disguises, doors, drawers, furniture state overlays, pickups and interactable object art. |
| `icons-ui/` | Inventory icons, action icons, interaction prompts, map markers, menu icons, HUD pieces, buttons, panels, UI frames and status symbols. |
| `music/` | Title themes, exploration music, danger cues, location music, victory music, menu music and musical stingers. |
| `dialogue-sfx/` | Voice lines, narration, ambience, footsteps, door/drawer sounds, item pickup sounds, UI sounds and environmental sound effects. |

If an asset is ambiguous, place it in the closest bucket. The importer can ask for confirmation before promoting it into the final project package.

## Import and Promotion Rule

Files in `intake/` are staging files only. Permanent scene, screen, object, quest and runtime records must not point directly to intake files.

When a creator approves/imports a file, Artifex should:

1. Preserve the original source filename in metadata.
2. Ask for or confirm the asset type and intended use.
3. Assign a stable `asset_` ID.
4. Rename the final copy using safe consistent naming.
5. Copy it from `intake/` into the appropriate final `assets/` folder inside that game project.
6. Add or update its Asset Library record in `assets/asset-index.json`.
7. Create or update an `assets/groups/assetgroup_<slug>.json` record when related assets form a set, such as a character sprite group or object-state animation group.
8. Use the final asset ID/path when the Scene Editor, Object Library, Effect Editor, Quest Builder or runtime references it.

## Example Promotion

A creator drops a raw music file into:

```text
artifex/artifex-adventures/intake/music/Hero Theme Final FINAL.mp3
```

After import, Artifex may copy it to:

```text
artifex/artifex-adventures/assets/audio/music/music_hero_theme.mp3
```

and register it as:

```json
{
  "id": "asset_music_hero_theme",
  "name": "Hero Theme",
  "type": "music",
  "file": "assets/audio/music/music_hero_theme.mp3",
  "sourceFileName": "Hero Theme Final FINAL.mp3",
  "status": "draft",
  "tags": ["music", "hero-theme", "orchestral"]
}
```

## Module Ownership Relationship

The Asset Library owns raw asset metadata and asset groups. The Scene Editor owns visual placement in scenes and screens. The Archetype Object Creator owns reusable normal object definitions. The Effect Editor owns reusable effect definitions. Quest Builder owns quests, flags, conditions, rewards, branches and unlocks. Project Manager links the game structure together.

The intake folder sits before those module outputs: it is simply where creators drop source files before Artifex promotes them into the proper indexed project structure.
