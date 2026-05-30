# Artifex Shared Registered Content

## Purpose

This shared dependency supplies canonical final-record reading and validation for authoring apps that need to select already registered project content.

It exists so Puzzle Creator, Scene Editor, Quest Builder, Archetype Object Creator and later tools can select the same real project-backed records instead of creating separate local pickers that accept raw uploads or incompatible IDs.

## Ownership boundary

This shared folder does not create assets or archetypes and does not decide gameplay behaviour.

It reads and validates registered records produced by their owning modules:

```text
assets/asset-index.json                 owned by Asset Library/import promotion workflow
archetypes/object-index.json            owned by Archetype Object Creator
archetypes/effect-index.json            owned by Effect Editor
```

It may later provide reusable picker UI around those records. The owning editor still decides where the selected reference is stored.

## Current implementation

```text
registered-content-reader.js
```

The reader currently:

- defines the canonical index path, schema, ID prefix and collection for assets, object archetypes and effect archetypes;
- reads indexes through a supplied JSON reader or `window.ArtifexProjectFolder.readJson`;
- returns clear statuses for empty, invalid, missing or unreadable indexes;
- excludes records that do not use canonical stable IDs;
- excludes intake paths, legacy `artifex/assets-library/` references, absolute/external URLs and browser/data/blob references;
- provides normalized records for future picker UIs;
- creates minimal stable reference payloads only from accepted final records.

## Accepted record types

### Final visual/audio asset

```json
{
  "id": "asset_door_stone_archway",
  "name": "Stone Archway Door",
  "type": "prop",
  "file": "assets/images/props/door_stone_archway.png",
  "tags": ["door", "maze"]
}
```

### Object archetype

```json
{
  "id": "archobj_sacred_key",
  "name": "Sacred Key",
  "file": "archetypes/objects/archobj_sacred_key.json",
  "tags": ["collectible", "key"]
}
```

### Effect archetype

```json
{
  "id": "archeffect_portal_blue_ring",
  "name": "Blue Portal Ring",
  "file": "archetypes/effects/archeffect_portal_blue_ring.json",
  "tags": ["portal", "magic"]
}
```

## Deliberately rejected as final project links

```text
intake/objects/key.png
artifex/assets-library/animated/crystal1.gif
blob:...
data:image/...
https://...
C:/... or /Users/...
```

Those may be useful sources or previews, but they are not valid permanent gameplay references until promoted into the canonical project indexes.

## Puzzle Creator integration direction

When a future Maze feature picker consumes this dependency:

- Collect rows may select registered `archobj_` object archetypes.
- Door connections may select registered `asset_` visual assets.
- Portal endpoints may later select registered `asset_` visuals and optional `archeffect_` effects, while global endpoint relationships remain owned by the Portal Registry contract.
- Scatter decorations may select registered `asset_` visuals only.

Until the relevant picker UI is wired and supplied with actual project-backed index records, existing disabled or pending controls in Puzzle Creator must remain disabled/pending.
