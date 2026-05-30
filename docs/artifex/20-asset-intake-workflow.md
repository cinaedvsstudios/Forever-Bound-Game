# Artifex Asset Intake Workflow

## Purpose

This document defines the creator-facing staging area for newly supplied artwork, icons, music, dialogue, sound effects and other source assets before Artifex promotes approved content into final indexed asset locations.

`intake/` is not the final game/library structure. It is the incoming source-material drop zone. A creator can place a file into an obvious bucket, then Artifex later reviews, renames, copies, indexes, groups and references it correctly.

## Related Contracts

Read this together with:

```text
docs/artifex/05-creation-guide.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/21-template-game-project-contract.md
```

## Project-Type Distinction

| Project type | Relationship to intake |
|---|---|
| **Blank Starter Project** | Creation Guide may offer to create an empty root-level `intake/` staging structure as a visible optional setup step. |
| **Template Game** | The later populated connected reference project may contain staged/source examples and final promoted registered assets to prove the intake-to-asset workflow. |
| **Artifacts Adventures** | The real production project uses its own project-root intake area for actual production source material. It is not the Template Game. |

## Folder Location Rule

A project's intake folder belongs inside that project's own connected root:

```text
<project-root>/intake/
```

Do not put a project's live intake folder inside `artifex/templates/`. That location is for generic reusable template resources, not the source-material staging folder of a connected project.

Where an in-repository example or development project exists, its intake area is still relative to that project's own root. The current Artifacts Adventures working location may therefore use:

```text
artifex/artifex-adventures/intake/
```

but that does not make Artifacts Adventures the Template Game.

## Simple Intake Folders

Use these first-level buckets inside a project's `intake/` folder:

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

These buckets are intentionally broad. Fine classification belongs later in the Asset Library/import workflow.

## What Goes Where

| Intake folder | Source material placed here |
|---|---|
| `backgrounds/` | Full scene backgrounds, title/ending backgrounds, interiors, landscapes, scenery loops, parallax plates and environmental plates. |
| `characters/` | Hero/player art, NPCs, interactive characters, enemies, portraits, turnarounds, sprite sheets and animation frames. |
| `objects/` | Props, clue items, collectibles, keys, doors, furniture states, pickups and interactable object art. |
| `icons-ui/` | Project logo/title mark, inventory/action icons, prompts, markers, menu/HUD pieces, frames and status symbols. |
| `music/` | Themes, exploration/location/menu tracks, danger/victory cues and musical stingers. |
| `dialogue-sfx/` | Voice/dialogue, narration, ambience, footsteps, interaction sounds, UI sounds and environmental SFX. |

When a source file is ambiguous, place it in the closest intake bucket; later import/classification can ask for confirmation before promotion.

## Creation Guide Setup Integration

Creation Guide owns the initial explanation and optional creation of intake folders. After a writable project folder is connected, a visible **Initial Asset Intake Setup** section should:

1. Explain that `intake/` is staging, not final runtime asset storage.
2. Show each bucket with a plain-language explanation.
3. Offer **Create Intake Folders**, which writes `intake/README.md` and the six folders in the connected project root.
4. Offer **Skip for Now**, without preventing project creation.
5. Show incomplete/skipped state in Project Overview and Health until deliberately completed or dismissed.
6. Lead into Asset Library/import promotion for approved content.

This section remains future Creation Guide UI work after the V1.1.11 connected-folder/starter-structure feature. It must not be treated as already live until implemented and tested.

## Recommended Starting Media Checklist

Creation Guide should eventually provide a non-blocking checklist for enough source material to assemble a simple first scene:

| Recommended starting asset | Intake destination | Purpose |
|---|---|---|
| Project logo or temporary title mark | `intake/icons-ui/` | Identity and title/menu planning. |
| At least one scene background | `intake/backgrounds/` | First playable/test scene. |
| At least one player-character image or sprite sheet | `intake/characters/` | Playable placeholder/final art. |
| At least one NPC image or sprite sheet | `intake/characters/` | Basic interaction/dialogue testing. |
| At least one interactable object or pickup | `intake/objects/` | Object-interaction testing. |
| At least one door, passage or transition object | `intake/objects/` | Movement/transition planning. |
| At least one icon/UI placeholder set | `intake/icons-ui/` | HUD/menu/prompt testing. |

Useful but not required next additions include music or ambience, a dialogue/SFX sample, enemy/hazard source art and FX source material.

This checklist reports readiness only. It neither blocks project creation nor creates permanent references to intake source files.

## Import and Promotion Rule

Files in `intake/` are staging files only. Permanent scene, screen, quest, puzzle, object, effect and runtime records must not point directly to them.

When a creator approves/imports a source file, the Asset Library/import workflow should:

1. Preserve the original source filename in metadata.
2. Confirm asset type and intended use.
3. Assign a stable `asset_` ID.
4. Copy/rename the approved final file into the appropriate final `assets/` destination.
5. Add or update its record in `assets/asset-index.json`.
6. Create or update an `assets/groups/assetgroup_<slug>.json` record when a related set is needed.
7. Expose the final asset ID/project-relative path to authoring apps.

## Example Promotion

A production creator could drop source music into an Artifacts Adventures project folder:

```text
artifex/artifex-adventures/intake/music/Hero Theme Final FINAL.mp3
```

After approval/import, the final registered copy may be:

```text
artifex/artifex-adventures/assets/audio/music/music_hero_theme.mp3
```

with an asset record such as:

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

Creation Guide owns first-time intake explanation/setup and readiness reporting. Asset Library owns promotion of approved source assets into final asset files, metadata and groups. Scene Editor owns visual placement; Archetype Object Creator owns reusable object definitions; Effect Editor owns reusable effect definitions; Quest Builder owns progression content; Project Editor links structural references. Build Game and Health Guide validate or generate their own output only when invoked.

The intake folder sits before those outputs: it is where creators drop source material before Artifex promotes it into the proper indexed project structure.