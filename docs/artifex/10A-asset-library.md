# Asset Library Specification

Status: Active module/service specification during documentation consolidation  
Owning module/service: Asset Library  
Active route: no verified standalone Asset Library app route exists yet  
Current verified baseline: asset ownership contract only; implementation is currently spread across starter schema, intake staging, registered-content readers, and module-specific finalisation handoffs  
Governing universal contract: `docs/artifex/1A-project-file-contracts.md`  
Subordinate schema reference: `docs/artifex/19a-project-starter-file-schemas.md`  
Outstanding work source: `docs/artifex/2A-global-to-do.md`

## Purpose

Asset Library is the final registered-asset ownership layer for Artifex projects.

It owns stable `asset_` records, final asset metadata, final asset grouping, and final asset files after source material has been promoted from staging or created by an approved generator.

The current repository does not prove a finished standalone Asset Library application route. This specification therefore defines the permanent Asset Library contract and ownership boundary. It must not falsely describe a completed Asset Library UI app that has not yet been verified.

## Ownership Boundary

Asset Library owns:

- stable `asset_` identifiers;
- `assets/asset-index.json`;
- final files under `assets/`;
- asset metadata, including type, category, tags, groups, dimensions, duration, format, source/promotion notes, and usage-facing labels;
- promotion from `intake/` staging folders into final indexed project assets;
- final registered image, sprite, portrait, texture, overlay, icon, UI, video-reference, and audio asset records;
- the canonical asset records consumed by Scene Editor, Quest Builder, Puzzle Creator, Archetype Object Creator, Effect Editor, Sound Library, Runtime/Playtest, Health, and Build Game.

Asset Library must not:

- author scene layout, placed scene objects, quest logic, puzzle rules, object archetype definitions, effect archetype definitions, project routes, runtime behaviour, or build output;
- allow modules to reference `intake/` files as permanent authored content;
- allow module-specific preview files, browser drafts, staged uploads, data URLs, or temporary source paths to become final project references;
- create a separate sound-archetype index, `archsound_` identifier family, or parallel generated-audio ownership system;
- silently promote, overwrite, or delete final project assets without a deliberate promotion/registration workflow;
- treat a registered-content picker as the same thing as asset ownership.

## Current Implemented Facts

The canonical starter-project shape includes:

```text
assets/asset-index.json
```

as the project-wide registered asset index.

The `intake/` folders are staging only. They are used for newly supplied source material before review, cleanup, promotion, metadata assignment, and registration. Permanent authored content must reference final registered assets, not raw intake files.

The shared registered-content reader/picker can read existing registered indexes. It may display or select assets, object archetypes, and effect archetypes, but it does not own, create, promote, or rewrite those records.

Archetype Object Creator V1.36 contains a bounded finalisation handoff. During successful object finalisation, it may promote the media required by the object being finished and register resulting final `asset_` records. That handoff exists only so a ready object can safely point to stable final assets. It does not make Object Creator the general Asset Library or a general asset importer.

Sound Library / Sound Generator work must return registered audio `asset_` references. Generated or imported audio must become final registered Asset Library records. Sound Library must not create `archsound_` IDs, `archetypes/sounds/`, or a separate sound index.

Effect Editor currently supports session/repository brush and image resources for preview/editing. A saved project effect that depends on reusable textures, overlays, icons, thumbnails, or audio must ultimately point to stable final registered `asset_` records.

Creation Guide currently creates initial intake folders and starter project structure. That does not mean source media is already promoted or registered. Project-logo and recommended-media readiness require final Asset Library promotion and registered references.

## Canonical Asset Record Role

A final registered asset record is the stable project-facing identity for a reusable media file.

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
video-reference
document/reference
```

The exact schema is governed by the project-file contract and subordinate schema references. This specification owns the module boundary: final media records belong to Asset Library, while other modules store references to those records.

A valid final registered asset reference uses a stable `asset_` ID. Other modules should not store raw intake paths, local file handles, session data URLs, browser cache keys, or ad-hoc copied file paths as permanent references.

## Intake Versus Final Assets

`intake/` is a source-material holding area. It is not a runtime library, final asset library, or permanent reference location.

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

## Relationships to Other Modules

### Creation Guide

Creation Guide may create starter folders and initial intake buckets. It may report recommended starting media or project-logo readiness. Asset Library owns the later promotion and final registered asset references for that media.

Creation Guide must not claim a logo, title mark, player art, NPC art, interactable object image, transition object image, or UI icon set is final merely because source material exists in intake.

### Scene Editor

Scene Editor places visual content in scenes and screens. It should reference final registered assets for backgrounds, overlays, placed images, UI images, ambience, local sound sources, transitions, and any future media-backed scene element.

Scene Editor does not own the final asset records it places.

### Quest Builder

Quest Builder may reference final registered assets for portraits, dialogue/feedback audio, reward icons, UI presentation, quest imagery, and other Quest-facing media.

Quest Builder owns the Quest meaning and progression context. Asset Library owns the reusable media records.

### Archetype Object Creator

Object Creator owns reusable `archobj_` object definitions. Its finalised objects must point to registered final `asset_` records for required gameplay sprites, portrait assets, and object sound references.

Object Creator may perform a bounded finalisation handoff to create required final assets for the object being finished. That handoff is not a general asset-import UI and must not bypass Asset Library ownership rules.

### Effect Editor

Effect Editor owns reusable `archeffect_` FX definitions. Saved FX Archetypes that rely on textures, overlays, icons, thumbnails, image brushes, or audio cues must use stable registered asset references where those dependencies are part of project content.

Session-only image brushes, repository brush files, or preview-only resources are not final Asset Library records unless promoted and registered.

### Puzzle Creator

Puzzle Creator may reference final registered assets for puzzle visuals, icons, sounds, feedback, symbols, UI, and puzzle-specific media.

Puzzle Creator owns puzzle rules and layout. Asset Library owns reusable final media records.

### Sound Library / Sound Generator

Sound Library is an audio-facing selector/generator workflow over registered assets. It must return `asset_` IDs for saved/selected audio.

Generated synth sounds and imported audio files must become final registered Asset Library records if they are used by project content.

### Project Editor

Project Editor may display asset links and structural references, but it does not own final asset records or promote media.

### Shared Registered Content Service / Picker

A shared registered-content picker may read and present Asset Library records, Object Creator records, and Effect Editor records. It is a selection/lookup service, not the owner of the records it displays.

### Health and Build Game

Health may validate missing assets, broken references, duplicate IDs, unused assets, invalid intake references, stale temporary files, and missing registered records.

Build Game may consume final registered asset records while packaging. It must not become the authoring owner of assets.

## Required Future Work

The active backlog, not this specification, owns implementation tasks. The main known Asset Library work is:

- create or confirm the Asset Library UI/service for browsing, grouping, promoting, editing metadata, and registering final project assets;
- implement safe promotion from `intake/` to final `assets/` files and `assets/asset-index.json` records;
- prevent permanent authored content from referencing `intake/` files;
- support Creation Guide project-logo and recommended-media readiness through final registered assets;
- support Archetype Object Creator finalisation without turning Object Creator into the general importer;
- support Effect Editor saved FX dependencies for registered texture, overlay, icon, brush, thumbnail, and audio assets;
- support Scene Editor registered media selection instead of fixed-manifest or path-only placement;
- support Quest Builder registered portrait, icon, reward, feedback, and audio references;
- support Puzzle Creator registered visual/audio feedback references;
- add canonical imported-audio promotion for accepted audio formats such as WAV, MP3, and OGG;
- keep Sound Library as a selector/generator returning registered `asset_` IDs, not as a separate sound-archetype owner;
- expose enough metadata for Health and Build Game to validate final project content.

## Source Classification

`docs/artifex/20-asset-intake-workflow.md` remains useful source evidence for the staging-to-final promotion model. Its Creation Guide intake setup facts are covered by `4A`; Object Creator bounded promotion/finalisation facts are covered by `8A`; this specification captures the Asset Library ownership boundary.

`artifex/shared/registered-content/README.md` remains useful source evidence for the reader/picker boundary. It supports the rule that shared selection tools may read registered records without owning or creating them.

Any future standalone Asset Library app or service implementation must be checked against current `main` before this specification claims it as implemented.

## Remaining Work

All current and future Asset Library work belongs in `docs/artifex/2A-global-to-do.md`. This specification must not become a task list.
