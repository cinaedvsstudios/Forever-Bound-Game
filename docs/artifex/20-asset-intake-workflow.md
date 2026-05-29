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

For any newly created game project, Creation Guide should initialise the same root-level staging folder relative to that selected project root:

```text
<project-root>/intake/
```

Generic blank templates remain under:

```text
artifex/templates/
```

## Simple Intake Folders

Use only these first-level buckets inside a game project's `intake/` folder:

```text
intake/
  README.md
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
| `characters/` | Hero art, NPCs, interactive characters, villains, enemies, portraits, turnarounds, sprite sheets, animation frames and character reference images. |
| `objects/` | Props, clue items, collectibles, keys, disguises, doors, drawers, furniture state overlays, pickups and interactable object art. |
| `icons-ui/` | Inventory icons, action icons, interaction prompts, map markers, menu icons, HUD pieces, buttons, panels, UI frames, logo files and status symbols. |
| `music/` | Title themes, exploration music, danger cues, location music, victory music, menu music and musical stingers. |
| `dialogue-sfx/` | Voice lines, narration, ambience, footsteps, door/drawer sounds, item pickup sounds, UI sounds and environmental sound effects. |

If an asset is ambiguous, place it in the closest bucket. The importer can ask for confirmation before promoting it into the final project package.

## Creation Guide Setup Integration

Creation Guide owns the initial explanation and setup of the intake folders. When a new project is created and the user connects a writable project folder, Creation Guide should offer an **Initial Asset Intake Setup** section that:

1. explains that `intake/` is the source-material drop zone, not the final runtime asset library;
2. shows each intake folder with a plain-language explanation of what belongs there;
3. creates the `intake/` folder, its six buckets and an `intake/README.md` in the connected project folder when the user approves;
4. offers **Skip for Now** without preventing the project from being created;
5. marks intake setup as incomplete/skipped in Project Overview and Health until the user later completes or dismisses it deliberately;
6. links to the final Asset Library/import step, where files are copied into `assets/` and registered.

This setup belongs in its own Creation Guide section. It must not be hidden inside the New Project modal or treated as an unexplained background action.

## Recommended Basic Asset Readiness Checklist

Creation Guide should include a non-blocking **Recommended Starting Media** checklist. It helps the creator know whether enough source material exists to begin a simple first scene. The checklist should initially include:

| Recommended starting asset | Intake destination | Purpose |
|---|---|---|
| Project logo or temporary title mark | `intake/icons-ui/` | Identifies the project in Creation Guide, title/menu planning and exports. |
| At least 1 scene background | `intake/backgrounds/` | Allows a first playable or test scene to be composed. |
| At least 1 player-character source image or sprite sheet | `intake/characters/` | Provides the playable character placeholder or final art. |
| At least 1 NPC source image or sprite sheet | `intake/characters/` | Allows basic interaction/dialogue testing. |
| At least 1 interactable object or pickup | `intake/objects/` | Allows object interaction testing. |
| At least 1 door, passage or transition object | `intake/objects/` | Allows movement between scenes/screens to be planned. |
| At least 1 icon/UI placeholder set | `intake/icons-ui/` | Allows HUD/menu and interaction prompts to be tested. |

The following should be shown as useful next additions, but should not be required for first-scene readiness:

| Useful additional asset | Intake destination |
|---|---|
| Background/area music or ambience | `intake/music/` or `intake/dialogue-sfx/` |
| Dialogue or voice-line sample | `intake/dialogue-sfx/` |
| Enemy or hazard source art | `intake/characters/` or `intake/objects/` |
| FX source sheet or magical overlay | `intake/objects/` until promoted/classified by the importer |

The checklist reports readiness; it does not make permanent references to intake files and does not block project creation.

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

Creation Guide owns first-time intake explanation, project-folder initialisation, media readiness reporting and links into the import workflow. It does not own the final classification or placement of approved assets.

The intake folder sits before those module outputs: it is simply where creators drop source files before Artifex promotes them into the proper indexed project structure.
