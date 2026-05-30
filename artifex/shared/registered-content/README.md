# Artifex Shared Registered Content

## Purpose

This shared dependency supplies canonical final-record reading, validation and selection UI for authoring apps that need to select already registered project content.

It exists so Puzzle Creator, Scene Editor, Quest Builder, Archetype Object Creator and later tools can select the same real project-backed records instead of creating separate local pickers that accept raw uploads or incompatible IDs.

## Ownership boundary

This shared folder does not create assets or archetypes and does not decide gameplay behaviour.

It reads and presents registered records produced by their owning modules:

```text
assets/asset-index.json                 owned by Asset Library/import promotion workflow
archetypes/object-index.json            owned by Archetype Object Creator
archetypes/effect-index.json            owned by Effect Editor
```

The authoring app that opens the picker still decides where the selected stable reference is stored and what that reference means in its own authored data.

## Current implementation

```text
registered-content-reader.js
registered-content-picker.js
```

### `registered-content-reader.js`

The reader:

- defines the canonical index path, schema, ID prefix and collection for assets, object archetypes and effect archetypes;
- reads indexes through a supplied JSON reader or `window.ArtifexProjectFolder.readJson`;
- returns clear statuses for empty, invalid, missing or unreadable indexes;
- excludes records that do not use canonical stable IDs;
- excludes intake paths, legacy `artifex/assets-library/` references, absolute/external URLs and browser/data/blob references;
- provides normalized records for picker UIs;
- creates minimal stable reference payloads only from accepted final records.

### `registered-content-picker.js`

The picker controller:

- opens a reusable Artifex-themed modal selection panel;
- supports Final Assets, Archetype Objects and Archetype Effects tabs;
- reads each selected index through the shared reader rather than bypassing validation;
- supports search by ID, name, type, final path, status and tags;
- displays empty, missing, invalid, unreadable and partially-rejected states honestly;
- shows selected record details before confirmation;
- only returns a stable reference after a validated final record is selected;
- offers no raw upload button and no free-text final-link field.

Typical app integration direction:

```js
import { openRegisteredContentPicker } from '../../../shared/registered-content/registered-content-picker.js';

openRegisteredContentPicker({
  initialKind: 'archetype-objects',
  kinds: ['archetype-objects'],
  title: 'Link Collect Object',
  selectLabel: 'Link Object',
  onSelect: ({ reference, item }) => {
    // The owning authoring app stores reference.archetypeObjectId.
  }
});
```

The importing app must use the correct relative path for its own folder depth and must only expose a visible active selection control when the resulting reference is stored correctly in its own data model.

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

The reusable reader and picker controller now exist, but Puzzle Creator is not yet importing them. The next Maze integration stage can wire one genuine consumer at a time:

- Collect rows select registered `archobj_` object archetypes and store `archetypeObjectId` in the placed item record.
- Door connections select registered `asset_` visual assets and store `visualAssetId` in the connection record.
- Portal endpoints may later select registered `asset_` visuals and optional `archeffect_` effects, while global endpoint relationships remain owned by the Portal Registry contract.
- Scatter decorations may select registered `asset_` visuals only.

Until an individual Maze control is wired to store its reference and export it correctly, that visible control must remain disabled/pending.
