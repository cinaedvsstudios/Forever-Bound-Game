# Asset Library Specification

Status: Active module specification draft during documentation consolidation  
Owning module/service: Asset Library  
Active route: no verified standalone Asset Library app route exists yet  
Current verified baseline: asset ownership contract only; implementation is spread across starter schema, intake staging, registered-content readers and module-specific finalisation handoffs  
Governing universal contract: `docs/artifex/1A-project-file-contracts.md`  
Subordinate schema reference: `docs/artifex/19a-project-starter-file-schemas.md`  
Outstanding work source: `docs/artifex/2A-global-to-do.md`

## Purpose

Asset Library is the final registered-asset ownership layer for Artifex projects. It owns stable `asset_` records, final asset metadata and final asset files after source material has been promoted from staging or created by an approved generator.

The current repository does not prove a finished standalone Asset Library application route. This specification therefore defines the permanent Asset Library contract, not a completed UI app.

## Ownership Boundary

Asset Library owns:

- stable `asset_` identifiers;
- `assets/asset-index.json`;
- final files under `assets/`;
- asset metadata, type, category, tags, groups and source/promotion notes;
- promotion from `intake/` staging into final indexed project assets;
- final registered image, sprite, portrait, texture, overlay, icon and audio asset records.

Asset Library must not:

- author scene layout, quests, puzzles, object archetypes, effect archetypes, routes or runtime/build output;
- allow modules to reference `intake/` files as permanent content;
- create a separate sound-archetype index or `archsound_` family;
- treat a module-specific preview, browser draft or staged upload as a final registered asset.

## Current Implemented Facts

The canonical starter project includes `assets/asset-index.json` as the project-wide registered asset index.

`intake/` folders are staging only. They are for newly supplied source material before review, cleanup, promotion and registration.

The shared registered-content reader/picker reads existing registered indexes. It may display/select assets, objects and effects, but it does not own or create those records.

Archetype Object Creator V1.36 contains a bounded finalisation handoff that may promote media required by the object being finished and register final `asset_` records. That does not make Object Creator the general Asset Library.

Sound Library / Sound Generator work must return registered `asset_` audio references. It must not create parallel sound records.

## Required Future Work

The active backlog, not this spec, owns implementation tasks. The main known work is:

- create or confirm the Asset Library UI/service for browsing, grouping, promoting and registering final assets;
- implement safe promotion from `intake/` to final `assets/` records;
- support Creation Guide logo/media readiness;
- support Object Creator finalisation without turning Object Creator into a general importer;
- support Effect Editor registered texture, overlay, icon and thumbnail dependencies;
- support canonical audio import/promotion so Sound Library can select registered audio assets.

## Remaining Work

All current and future Asset Library work belongs in `docs/artifex/2A-global-to-do.md`. This specification must not become a task list.
