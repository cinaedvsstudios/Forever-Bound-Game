# Asset Library Specification

Status: Active module/service specification during documentation consolidation  
Owning module/service: Asset Library  
Active route: no verified standalone Asset Library app route exists yet  
Current verified baseline: asset ownership contract only; implementation is currently spread across starter schema, intake staging, registered-content readers and module-specific finalisation handoffs  
Governing universal contract: `docs/artifex/1A-project-file-contracts.md`  
Subordinate schema reference: `docs/artifex/19a-project-starter-file-schemas.md`  
Outstanding work source: `docs/artifex/2A-global-to-do.md`

## Purpose

Asset Library is the final registered-asset ownership layer for Artifex projects.

It owns stable `asset_` records, final asset metadata, final asset grouping, searchable asset library behaviour and final asset files after source material has been promoted from staging or created by an approved generator.

The current repository does not prove a finished standalone Asset Library application route. This specification therefore defines the permanent Asset Library contract and ownership boundary. It must not falsely describe a completed Asset Library UI app that has not yet been verified.

## Ownership Boundary

Asset Library owns:

- stable `asset_` identifiers;
- `assets/asset-index.json`;
- final files under `assets/`;
- asset metadata, including type, category, tags, groups, dimensions, duration, format, source/promotion notes, status and usage-facing labels;
- searchable and filterable final asset catalogue behaviour;
- promotion from `intake/` staging folders into final indexed project assets;
- final registered image, sprite, portrait, texture, overlay, icon, UI, video-reference, music, sound-effect, voice and procedural-synth asset records;
- asset groups such as character/animation/portrait sets;
- usage information where available through the shared reference index;
- the canonical asset records consumed by Scene Editor, Quest Builder, Puzzle Creator, Archetype Object Creator, Effect Editor, Sound Library, Runtime/Playtest, Health and Build Game.

Asset Library must not:

- author scene layout, placed scene objects, quest logic, puzzle rules, object archetype definitions, effect archetype definitions, project routes, runtime behaviour or build output;
- allow modules to reference `intake/` files as permanent authored content;
- allow module-specific preview files, browser drafts, staged uploads, data URLs or temporary source paths to become final project references;
- create a separate sound-archetype index, `archsound_` identifier family or parallel generated-audio ownership system;
- silently promote, overwrite or delete final project assets without a deliberate promotion/registration workflow;
- treat a registered-content picker as the same thing as asset ownership.

## Asset Categories

Asset Library may catalogue final registered assets such as:

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
Voice
CG / FX Dependencies
Templates / Reference Assets
```

The exact display group names may change, but final reusable media belongs in Asset Library.

## Asset Record Role

A final registered asset record is the stable project-facing identity for a reusable media file or generated media recipe.

A final record may describe media such as:

```text
image
sprite
portrait
texture
overlay
icon
ui
audio
music
sound-effect
voice
procedural-synth
video-reference
document/reference
```

The exact schema is governed by the project-file contract and subordinate schema references. This specification owns the module boundary: final media records belong to Asset Library, while other modules store references to those records.

A valid final registered asset reference uses a stable `asset_` ID. Other modules should not store raw intake paths, local file handles, session data URLs, browser cache keys or ad-hoc copied file paths as permanent references.

## Basic Asset Record Examples

Imported audio file example:

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

Generated procedural synth sound example:

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

Character visual asset example:

```json
{
  "id": "asset_mel_idle_right",
  "name": "Mel Idle Right",
  "type": "character_sprite",
  "character": "Mel",
  "file": "assets/characters/mel/mel_idle_right.png",
  "tags": ["mel", "player", "idle", "right", "sprite"],
  "status": "ready",
  "usedIn": []
}
```

## Asset Groups

A character should not always be treated as one loose file. A character may be represented by an asset group.

Example character asset group:

```json
{
  "id": "assetgroup_mel",
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

Asset grouping is useful for characters, animation sets, portrait sets, UI packs, effect texture packs and related audio groups.

## Intake Versus Final Assets

`intake/` is a source-material holding area. It is not a runtime library, final asset library or permanent reference location.

Valid intake uses include:

- original uploads;
- unsorted source art;
- screenshots or reference files awaiting review;
- audio awaiting cleanup or conversion;
- temporary media staged during a module-specific finalisation flow.

Valid final asset uses include:

- media that has been intentionally promoted;
- metadata that has been assigned or confirmed;
- a stable `asset_` record added to `assets/asset-index.json`;
- final files stored under `assets/`;
- references from other modules to the stable `asset_` ID.

A module may read or stage intake material only where its workflow requires it. It must not treat that intake material as final authored project content.

## Search, Filtering and Preview Requirements

Asset Library should eventually support:

```text
Search by name
Search by tag
Filter by type
Filter by status
Filter by project
Filter by character
Filter by scene usage
Filter by referring record
Preview image/audio
Preview procedural synth audio through its playback engine
Distinguish imported audio files from generated synth recipes while listing them together
Copy file path where safe
Insert/assign in Scene Editor, Object Creator, Puzzle Creator, Quest Builder and Effect Editor where supported
Add/edit tags
Group related files
Group related files into characters/animation/portrait sets
Track usage across scenes and other referring records
Edit an existing generated synth sound through the shared popup where safe
```

Usage tracking should ultimately use the shared project-reference index rather than making Asset Library scan every module in a private incompatible way.

## Audio Assets

Sound resources must appear through one Asset Library selection and reference system, whether they are imported recordings or generated procedural electronic sounds.

Normal imported audio is promoted from `intake/` into a final audio location and registered in `assets/asset-index.json`.

A procedural synth sound is created within Artifex and is registered through the same `asset_` library model. Its final resource is a JSON playback recipe rather than an audio recording.

Generated synth sounds are not external source material and therefore do not need to pass through `intake/`. The shared Sound Generator saves an approved recipe under `assets/audio/sfx/` and creates or updates its entry in `assets/asset-index.json`.

Generated synth resources may be described as **Sound Archetypes** in user-facing creator language because they contain reusable generation data. In stored project structure they remain audio assets. Do not create a separate `archetypes/sound-index.json`, `archetypes/sounds/` folder or `archsound_` ID system.

## Relationships to Other Modules

### Creation Guide

Creation Guide may create starter folders and initial intake buckets. It may report recommended starting media or project-logo readiness. Asset Library owns later promotion and final registered asset references for that media.

### Scene Editor

Scene Editor places visual content in scenes and screens. It should reference final registered assets for backgrounds, overlays, placed images, UI images, ambience, local sound sources, transitions and any future media-backed scene element.

### Quest Builder

Quest Builder may reference final registered assets for portraits, dialogue/feedback audio, reward icons, UI presentation, quest imagery and other Quest-facing media.

### Archetype Object Creator

Object Creator owns reusable `archobj_` object definitions. Its finalised objects must point to registered final `asset_` records for required gameplay sprites, portrait assets and object sound references.

Object Creator may perform a bounded finalisation handoff to create required final assets for the object being finished. That handoff is not a general asset-import UI and must not bypass Asset Library ownership rules.

### Effect Editor

Effect Editor owns reusable `archeffect_` FX definitions. Saved FX Archetypes that rely on textures, overlays, icons, thumbnails, image brushes or audio cues must use stable registered asset references where those dependencies are part of project content.

### Puzzle Creator

Puzzle Creator may reference final registered assets for puzzle visuals, icons, sounds, feedback, symbols, UI and puzzle-specific media.

### Sound Library / Sound Generator

Sound Library is an audio-facing selector/generator workflow over registered assets. It must return `asset_` IDs for saved/selected audio.

Generated synth sounds and imported audio files must become final registered Asset Library records if they are used by project content.

### Registered Content Service / Picker

A shared registered-content picker may read and present Asset Library records. It is a selection/lookup service, not the owner of the records it displays.

### Health and Build Game

Health may validate missing assets, broken references, duplicate IDs, unused assets, invalid intake references, stale temporary files and missing registered records.

Build Game may consume final registered asset records while packaging. It must not become the authoring owner of assets.

## Current Implemented Facts

The canonical starter-project shape includes:

```text
assets/asset-index.json
```

as the project-wide registered asset index.

The shared registered-content reader/picker can read existing registered indexes. It may display or select assets, object archetypes and effect archetypes, but it does not own, create, promote or rewrite those records.

Archetype Object Creator V1.36 contains a bounded finalisation handoff. During successful object finalisation, it may promote the media required by the object being finished and register resulting final `asset_` records. That handoff exists only so a ready object can safely point to stable final assets.

The repository does not yet prove a finished standalone Asset Library UI app route.

## Source Classification

`docs/artifex/14-asset-library.md` remains source evidence only after this file is accepted. Its useful feature details have been consolidated here.

`docs/artifex/20-asset-intake-workflow.md` remains useful source evidence for the staging-to-final promotion model. Its Creation Guide intake setup facts are covered by `4A`; Object Creator bounded promotion/finalisation facts are covered by `8A`; this specification captures the Asset Library ownership boundary.

`artifex/shared/registered-content/README.md` remains useful source evidence for the reader/picker boundary. It supports the rule that shared selection tools may read registered records without owning or creating them.

Any future standalone Asset Library app or service implementation must be checked against current `main` before this specification claims it as implemented.

## Required Future Work

The active backlog, not this specification, owns implementation tasks.

Known work includes:

- create or confirm the Asset Library UI/service for browsing, grouping, promoting, editing metadata and registering final project assets;
- implement safe promotion from `intake/` to final `assets/` files and `assets/asset-index.json` records;
- prevent permanent authored content from referencing `intake/` files;
- support Creation Guide project-logo and recommended-media readiness through final registered assets;
- support Archetype Object Creator finalisation without turning Object Creator into the general importer;
- support Effect Editor saved FX dependencies for registered texture, overlay, icon, brush, thumbnail and audio assets;
- support Scene Editor registered media selection instead of fixed-manifest or path-only placement;
- support Quest Builder registered portrait, icon, reward, feedback and audio references;
- support Puzzle Creator registered visual/audio feedback references;
- add canonical imported-audio promotion for accepted audio formats such as WAV, MP3 and OGG;
- support character asset groups and grouped animation/portrait sets;
- support usage tracking through the shared reference index;
- support procedural-synth preview and safe edit-through-popup flow;
- keep Sound Library as a selector/generator returning registered `asset_` IDs, not as a separate sound-archetype owner;
- expose enough metadata for Health and Build Game to validate final project content.

## Remaining Work

All current and future Asset Library work belongs in `docs/artifex/2A-global-to-do.md`. This specification must not become a task list.
