# Registered Content Service / Picker Specification

Status: Active shared-service specification during documentation consolidation  
Owning service: Registered Content Service / Picker  
Active route: no standalone app route; shared reader and picker modules consumed by authoring apps  
Current verified implementation baseline: `artifex/shared/registered-content/registered-content-reader.js` and `artifex/shared/registered-content/registered-content-picker.js` on current `main`  
Related specifications: `docs/artifex/10A-asset-library.md`, `docs/artifex/08A-object-creator.md`, `docs/artifex/09A-effect-editor.md`, `docs/artifex/11A-connected-project-folder.md`  
Governing universal contract: `docs/artifex/01A-project-file-contracts.md`  
Outstanding work source: `docs/artifex/02A-global-to-do.md`

## Purpose

The Registered Content Service / Picker is the shared lookup and selection layer for final project-backed records that are already owned by other Artifex modules.

It lets authoring apps select stable final references without each app inventing its own incompatible local picker, raw upload shortcut, free-text ID field or path picker.

The service reads and presents registered content. It does not create registered content.

## Project Library Role

The broader user-facing idea may be called a Project Library or Registered Content Library. That library view is a cross-owner catalogue. It can show final media assets, generated assets, object archetypes, effect archetypes and later scenes, puzzles, quests, templates, routes and portal endpoints when those record types are ready.

This does not change ownership. Every selectable record still belongs to its owning module or service. The picker/catalogue only reads, validates, filters and returns references.

## Ownership Boundary

The Registered Content Service / Picker owns:

- canonical reading of supported registered indexes;
- validation that selected records use stable final IDs and final project-relative paths;
- rejection of intake, browser-only, external, absolute, data URL, blob URL and legacy unpromoted references;
- normalisation of supported records for display;
- reusable modal picker UI for selecting registered content;
- stable reference payload creation from valid final records;
- honest UI states for missing, empty, invalid, unreadable, partially rejected and ready indexes;
- cross-owner catalogue display conventions such as record type, owner module, status, dependency hints, usage hints and broken-reference warnings where available.

The service must not:

- create assets, object archetypes, effect archetypes, scenes, quests, puzzles, routes, health reports, build output or runtime data;
- promote intake files into final records;
- rewrite registered indexes;
- decide gameplay meaning for a selected record;
- bypass connected-folder access and validation;
- accept raw uploads or free-text final links as if they were registered records;
- own module-specific storage fields;
- create a parallel asset, object, effect, scene, puzzle, quest or sound library.

## Layered Registered Content Model

The current implementation supports only a small subset of the intended project-library model. Future expansion must remain explicit and owner-bound.

| Content kind | Current status | Owner | Canonical index | Stable ID prefix | Returned reference key | Notes |
|---|---|---|---|---|---|---|
| Final Assets | Current supported kind | Asset Library | `assets/asset-index.json` | `asset_` | `assetId` | Media and generated-media records only. |
| Archetype Objects | Current supported kind | Archetype Object Creator | `archetypes/object-index.json` | `archobj_` | `archetypeObjectId` | Composed reusable objects. |
| Archetype Effects | Current supported kind | Effect Editor | `archetypes/effect-index.json` | `archeffect_` | `archetypeEffectId` | Mechanical FX definitions. |
| Scenes / Screens | Future selectable kind | Scene Editor | to be defined by Scene Editor schema | likely `scene_` / screen IDs | to be defined | Add only after canonical scene save/index exists. |
| Puzzles | Future selectable kind | Puzzle Creator | to be defined by Puzzle Creator schema | likely `puzzle_` | `puzzleId` or equivalent | Add only after canonical puzzle save/index exists. |
| Quests / Sidequests | Future selectable kind | Quest Builder | to be defined by Quest Builder schema | likely `quest_` / sidequest IDs | to be defined | Add only when multiple modules need stable quest selection. |
| Templates / Groups | Future selectable kind | Template System or owning module | to be defined | to be defined | to be defined | Add only if template ownership remains active. |
| Routes / Portal endpoints | Future selectable kind | Scene/Project/Portal owner to be defined | to be defined | to be defined | to be defined | Add only after owner and registry are locked. |

New record kinds must never be added casually. A record type should become a shared registered-content kind only when multiple modules need stable selection of already-authored final records.

## Current Verified Implementation

The current shared reader is:

```text
artifex/shared/registered-content/registered-content-reader.js
```

The current shared picker is:

```text
artifex/shared/registered-content/registered-content-picker.js
```

The reader defines the currently supported registered-content kinds:

```text
assets
archetype-objects
archetype-effects
```

The picker provides a reusable Artifex-themed modal UI with tabs for Final Assets, Archetype Objects and Archetype Effects. It reads indexes through the shared reader, supports search, shows status and detail states, and only returns a stable reference after a valid final record is selected.

## Supported Current Indexes

The reader currently supports these canonical project indexes:

```text
assets/asset-index.json
archetypes/object-index.json
archetypes/effect-index.json
```

The supported schema and ID expectations are:

| Kind | Index path | Schema version | Collection | ID prefix | Reference key |
|---|---|---|---|---|---|
| Final Assets | `assets/asset-index.json` | `artifex.assets.index.v1` | `assets` | `asset_` | `assetId` |
| Archetype Objects | `archetypes/object-index.json` | `artifex.archetypes.objects.index.v1` | `objects` | `archobj_` | `archetypeObjectId` |
| Archetype Effects | `archetypes/effect-index.json` | `artifex.archetypes.effects.index.v1` | `effects` | `archeffect_` | `archetypeEffectId` |

This service can be extended later, but supported kinds must be deliberately added with a clear owning module, index path, schema version, collection name, ID prefix, final path expectations, reference key and empty-state wording.

## Accepted Record Role

The service accepts records only after validating that they have:

- a stable ID with the required prefix;
- a final project-relative file path under the correct project area where that record type requires a file;
- the expected index schema and collection shape;
- enough display metadata for a human to choose it safely.

Example valid final asset reference source:

```json
{
  "id": "asset_door_stone_archway",
  "name": "Stone Archway Door",
  "type": "prop",
  "file": "assets/images/props/door_stone_archway.png",
  "tags": ["door", "maze"]
}
```

Example valid object archetype reference source:

```json
{
  "id": "archobj_sacred_key",
  "name": "Sacred Key",
  "file": "archetypes/objects/archobj_sacred_key.json",
  "tags": ["collectible", "key"]
}
```

Example valid effect archetype reference source:

```json
{
  "id": "archeffect_portal_blue_ring",
  "name": "Blue Portal Ring",
  "file": "archetypes/effects/archeffect_portal_blue_ring.json",
  "tags": ["portal", "magic"]
}
```

The exact owning module remains responsible for the record. The picker only returns the stable reference.

## Deliberately Rejected References

The reader rejects references that are not final project-backed registered content.

Rejected examples include:

```text
intake/objects/key.png
artifex/assets-library/animated/crystal1.gif
blob:...
data:image/...
https://...
file:...
/Users/...
C:/...
```

These may be useful source material, previews, references or imported files, but they are not valid permanent authored project references until promoted into canonical project indexes by the owning workflow.

## Status Vocabulary

The reader currently returns these statuses:

```text
ready
empty
partially-rejected
invalid-index
index-not-found
reader-unavailable
read-failed
```

Meaning:

- `ready`: at least one valid final record is available;
- `empty`: the index exists and is valid, but contains no selectable valid records;
- `partially-rejected`: some valid records are available, but invalid or unpromoted records were excluded;
- `invalid-index`: the index exists but does not match the expected schema/collection shape;
- `index-not-found`: the expected project index file is missing;
- `reader-unavailable`: no connected project-folder reader or supplied JSON reader is available;
- `read-failed`: the index could not be read for another reason.

The picker must display these states honestly. It must not quietly create records, invent fake defaults or accept invalid records just to avoid an empty picker.

## Public Reader Functions

The current reader exposes functions for:

```text
getRegisteredContentDefinition(kind)
validateRegisteredContentRecord(kind, record)
normalizeRegisteredContentRecord(kind, record)
buildRegisteredContentIndex(kind, indexValue)
loadRegisteredContentIndex(kind, options)
loadAllRegisteredContent(options)
searchRegisteredContent(indexResult, query)
createRegisteredReference(kind, item)
```

These functions provide the low-level selection contract. Apps that consume the reader must still store the returned reference correctly in their own data model.

## Public Picker Functions

The current picker exposes:

```text
createRegisteredContentPicker(options)
openRegisteredContentPicker(options)
```

The picker can be configured with:

```text
initialKind
kinds
title
selectLabel
contextNote
readJson
projectFolderClient
onSelect
onClose
```

A consuming app may pass a custom `readJson`, or rely on `window.ArtifexProjectFolder.readJson` if the connected project folder service is loaded.

The picker includes a Connect Folder / Authorise Folder / Folder Connected action when a project-folder client is available.

## Consuming-App Responsibility

A consuming authoring app remains responsible for:

- deciding when the picker should be available;
- choosing which content kinds are valid for the current field;
- storing the returned reference in the correct module-owned record;
- preserving existing module semantics;
- marking its own data dirty after selection;
- supporting replace/unlink behaviour where appropriate;
- validating saved references in context;
- saving its own record through its own save workflow.

The picker does not decide what the selection means. It only confirms that the selected content record is valid final registered content.

## Current Puzzle Creator Integration

Puzzle Creator Maze is the currently documented consumer.

The current README records two completed integration tracks:

- Collect Archetype Object linking, where a valid `archobj_` record stores `archetypeObjectId`, display label and canonical index source in a Collect item export record.
- Door visual asset linking, where a valid `asset_` record stores `visualAssetId`, `visualAssetLabel` and `visualAssetReferenceSource` on the Door connection record.

The current README also records that the picker remains honest when no folder is connected or no final records exist, and that it stores no link in those cases.

Pending Puzzle Creator follow-up remains outside this service: rendering selected Door images in playable preview, Portal registered visual/effect selection, global Portal Registry linkage and scatter decoration registered asset selection.

## Relationship to Asset Library

Asset Library owns final `asset_` media/generated-media records and `assets/asset-index.json`.

The Registered Content Service may read final asset records and return an `assetId` reference. It must not import, promote, register, edit, delete or own final assets.

## Relationship to Archetype Object Creator

Archetype Object Creator owns final `archobj_` records and `archetypes/object-index.json`.

The Registered Content Service may read object index records and return an `archetypeObjectId` reference. It must not edit object archetype data, finalise object media or decide object behaviour.

## Relationship to Effect Editor

Effect Editor owns final `archeffect_` records and `archetypes/effect-index.json`.

The Registered Content Service may read effect index records and return an `archetypeEffectId` reference. It must not edit effect archetype composition, preview settings or runtime FX behaviour.

## Relationship to Scene Editor

Scene Editor may use the picker to select final registered assets, object archetypes and effect archetypes for visual scene placement. Scene Editor then owns how those references are stored as scene elements or instance data.

Later, once Scene Editor has canonical scene/screen save and typed indexes, scenes/screens may become selectable registered-content kinds for modules that need to reference an authored scene. The picker must still not place scene elements by itself.

## Relationship to Quest Builder

Quest Builder may use the picker to select registered assets for portraits, audio, icons, rewards, UI or quest presentation, and registered object/effect references where a Quest step needs them.

Later, once Quest Builder has canonical quest/sidequest indexes, quests may become selectable registered-content kinds for Project Editor, Runtime/Playtest, Build Game or cross-reference views. Quest Builder owns the Quest meaning. The picker only returns stable references.

## Relationship to Puzzle Creator

Puzzle Creator may use the picker to select registered media, object archetypes and effect archetypes for puzzle visuals, feedback and puzzle composition.

Later, once Puzzle Creator has canonical puzzle save/index registration and a public result contract, puzzle records may become selectable registered-content kinds for Quest Builder and Scene Editor.

## Relationship to Project Editor

Project Editor may use registered references to display or validate structural links. It must not use the picker to rewrite module-owned records outside Project Editor ownership.

## Relationship to Shared Connected Project Folder Service

The Registered Content Service depends on a JSON reader. In normal connected-project operation, that reader should come from the Shared Connected Project Folder Service.

If no reader is available, the service must report `reader-unavailable`.

The picker may provide a Connect / Authorise Folder action when the project folder client is loaded, but the picker does not own the folder service.

## Relationship to Health and Build

Health should use the same record-validity concepts to report broken references, missing indexes, invalid indexes, unpromoted paths, noncanonical IDs and unusable external/data/blob references.

Build Game should only package final registered content. It must not accept intake files or browser-only references as final build assets.

## Future Extension Rules

New registered-content kinds may be added later, but each new kind must define:

- owning module/service;
- canonical index path;
- schema version;
- collection property;
- stable ID prefix;
- final path prefix or fileless-record rule;
- returned reference key;
- empty-state wording;
- status/dependency display expectations;
- who validates broken references and where those reports appear.

Likely future candidates may include saved puzzles, scenes, screens, quests, templates, routes or portal registries, but those should not be added casually. A record type should become a shared registered-content kind only when multiple modules need stable selection of already-authored final records.

## Current Gaps

Known gaps include:

- only assets, object archetypes and effect archetypes are currently supported;
- the service reads existing indexes but does not validate whether referenced files actually exist;
- reference usage tracking still requires a separate shared project reference index;
- consuming apps still need to adopt the picker consistently;
- Portal visual/effect selection is not complete;
- scatter decoration registered asset selection is not complete;
- Scene Editor registered placement integration remains future work;
- Quest Builder registered selectors remain future work;
- Effect Editor final registered dependency selection remains future work;
- future selectable scene, puzzle, quest, template, route and portal kinds require their owner schemas first;
- broader Health/Build integration around the same validation rules remains future work.

## Source Classification

`artifex/shared/registered-content/README.md` is the current service documentation and records the intended reader/picker ownership boundary and current Puzzle Creator integrations.

`registered-content-reader.js` is the current implementation authority for supported kinds, index paths, schema versions, ID prefixes, validation, normalisation, search, loading and stable reference payloads.

`registered-content-picker.js` is the current implementation authority for the reusable modal picker UI, tabs, search, status display, detail display, folder connection action and selection callback flow.

Module-specific use of returned references belongs in each consuming module's specification and backlog section, not here.

## Required Future Work

The active backlog, not this specification, owns implementation tasks. The main known work is:

- decide whether this remains a shared service specification or later folds into a broader registered project reference system;
- keep the broader Project Library / Registered Content catalogue model owner-bound;
- add consistent adoption in Scene Editor, Quest Builder, Asset Library, Effect Editor and Project Editor where appropriate;
- add reference validation and usage reporting through the future shared project reference index;
- add file-existence validation where needed without making the picker the owner of Health;
- support Portal and scatter-decoration registered selections if those workflows are approved;
- add future scene, puzzle, quest, template, route and portal selectable kinds only after the owning modules have canonical indexes and stable schemas;
- keep all new record kinds tied to explicit owners and canonical indexes.

## Remaining Work

All current and future Registered Content Service / Picker work belongs in `docs/artifex/02A-global-to-do.md`. This specification must not become a task list.
