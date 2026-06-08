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

The authoring app that opens the picker still decides where the selected stable reference is stored and what that reference means in its authored data.

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
- includes a **Connect Folder / Authorise Folder / Folder Connected** action when the consuming app loads `window.ArtifexProjectFolder`;
- offers no raw upload button and no free-text final-link field.

A consuming app that wants the built-in project folder connection action must load:

```js
import '../../path/to/shared/project-folder/project-folder-client.js';
```

It can then open the picker:

```js
import { openRegisteredContentPicker } from '../../path/to/shared/registered-content/registered-content-picker.js';

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

The importing app must use the correct relative path for its own folder depth and must only expose an active selection control when the resulting reference is stored correctly in its own data model.

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

## Puzzle Creator integration status

Puzzle Creator Maze currently consumes this dependency for two feature-linking workflows:

### V1.29 · Collect Archetype Object linking

- Collect rows open the picker on the **Archetype Objects** source only.
- A selected valid `archobj_` record stores `archetypeObjectId`, its display label and the canonical index source in the Collect item export record.
- Collect supports **Replace** and **Unlink** independently from its placed maze cell.
- When no folder is connected or no final object index records exist, the picker remains honest and no link is stored.

### V1.30 · Door visual asset linking

- A selected Door displays a **Door Visual Asset** control and opens the picker on the **Final Assets** source only.
- A selected valid `asset_` record stores `visualAssetId`, `visualAssetLabel` and `visualAssetReferenceSource` on the Door connection record.
- Door visual linking supports **Replace Visual** and **Unlink** independently from Entry/Exit placement, direction and Walk Test transfer behaviour.
- The selection is an authored reference/export feature only at this stage; the current maze preview continues to show endpoint markers rather than rendering the selected Door image.
- When no folder is connected or no final asset index records exist, the picker remains honest and no visual link is stored.

Still pending:

- Rendering selected Door images in the playable preview, if required by a future visual-rendering stage.
- Portal registered visual/effect selection and global Portal Registry linkage.
- Scatter decoration registered asset selection.
