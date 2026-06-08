# Shared Connected Project Folder Service Specification

Status: Active shared-service specification during documentation consolidation  
Owning service: Shared Connected Project Folder Service  
Active route: no standalone app route; loaded as shared browser infrastructure  
Current verified implementation baseline: `artifex/shared/project-folder/project-folder-client.js` version `0.1.0` and `artifex/shared/project-folder/project-structure-initializer.js` version `0.1.2`  
Known current caller: Creation Guide V1.1.12 project-folder setup flow  
Governing universal contract: `docs/artifex/01A-project-file-contracts.md`  
Subordinate schema reference: `docs/artifex/19A-project-starter-schemas.md`  
Outstanding work source: `docs/artifex/02A-global-to-do.md`

## Purpose

The Shared Connected Project Folder Service is the common browser-side infrastructure for connecting Artifex authoring tools to a real writable project folder.

It exists so modules can read and write canonical project files through one shared folder-access boundary instead of each app inventing its own file picker, path rules, save status, permission handling, or local-storage replacement system.

The service is not a user-facing authoring module. It does not own scenes, quests, assets, object archetypes, effect archetypes, puzzles, build output, health output, or runtime behaviour. It owns the folder connection, permission state, project-relative read/write helpers, and shared save-state vocabulary used by authoring modules.

## Ownership Boundary

The Shared Connected Project Folder Service owns:

- the browser connection to the selected project root folder;
- storage and restoration of the active folder handle in browser IndexedDB;
- permission checking and re-authorisation for the stored folder handle;
- project-relative path validation;
- shared text, JSON, byte, blob, file-exists, directory-exists and ensure-directory helpers;
- shared folder/save status labels;
- the browser event used to report folder state changes;
- starter project folder/file creation helpers used by Creation Guide;
- the rule that connected-folder writes must use project-relative paths only.

The service must not:

- author or interpret module-specific records;
- decide whether a Quest, Scene, Object, Effect, Puzzle, Asset, Health report, Build output, or Runtime state is semantically valid;
- silently overwrite authored project files;
- treat browser localStorage as permanent project truth;
- treat ZIP export/download as the normal project save workflow;
- store absolute local paths in project JSON;
- expose the user's private local file-system path as authored project data;
- become a general backup, build, import, asset-promotion, or schema-migration service.

## Current Verified Implementation

The current shared folder client is:

```text
artifex/shared/project-folder/project-folder-client.js
```

It exposes itself as:

```text
window.ArtifexProjectFolder
```

The current starter-structure helper is:

```text
artifex/shared/project-folder/project-structure-initializer.js
```

It exposes itself as:

```text
window.ArtifexProjectStructure
```

The current Creation Guide caller is:

```text
artifex/apps/creation-guide/v1/src/project-folder-setup.js
```

The shared folder client currently uses the browser File System Access API when available. It stores the active project-folder handle in IndexedDB under a single active connection key. It can connect a folder, restore the remembered folder, re-authorise access, forget the folder, and emit state changes to the page.

The current service is browser-side infrastructure only. It is not a server, cloud storage layer, Git integration, or cross-device sync system.

## Save and Folder Status Vocabulary

The shared folder client defines these save-status strings:

```text
Saved to Project Folder
Local Draft Only
Project File Changed
Conflict
Permission Required
No Folder Connected
Save Failed
```

It also defines these folder-status values:

```text
connected
permission-required
no-folder-connected
unsupported
error
```

These labels are the shared vocabulary for authoring modules. A module may display them in a module-specific way, but it should not invent a separate incompatible save-state model.

Current implementation note: not every status is fully used by every module yet. The vocabulary exists, but broader adoption of project-file change detection, conflict handling, permission-aware navigation guards, and save-state reporting remains outstanding integration work.

## Folder Connection Lifecycle

The current folder lifecycle is:

1. Check whether the browser supports the File System Access API.
2. Let the user select a writable project root folder with `showDirectoryPicker`.
3. Store the chosen folder handle in IndexedDB.
4. Query or request read/write permission on the stored handle.
5. Report `connected`, `permission-required`, `no-folder-connected`, `unsupported`, or `error`.
6. Allow re-authorisation if the browser remembers the handle but permission has expired.
7. Allow the user or calling module to forget the stored folder connection.

The remembered folder handle is browser-local workspace state. It is not project-authored content and must not be written into project JSON.

## Project-Relative Path Contract

The service validates project-relative paths before file access.

Valid paths are relative to the connected project root, for example:

```text
project.json
assets/asset-index.json
scenes/scene-index.json
archetypes/objects/archobj_bronze_key.json
```

Invalid paths include:

```text
/absolute/path/file.json
C:/Users/name/file.json
../outside-project/file.json
https://example.com/file.json
```

A path containing `.` or `..` segments is invalid. A path beginning with a slash, drive letter, or URL scheme is invalid.

This rule is a core safety boundary: Artifex project files must use portable project-relative references only.

## Read and Write Helpers

The current shared folder client provides helpers for:

```text
ensureDirectory(path)
readText(path)
writeText(path, content)
readBytes(path)
writeBytes(path, bytes)
writeBlob(path, content)
readJson(path)
writeJson(path, value)
fileExists(path)
directoryExists(path)
markLocalDraftOnly()
```

These helpers operate against the connected writable project folder. If no writable folder is connected, they must fail rather than silently falling back to a different location.

The service may write bytes, blobs, text, and JSON. It does not decide the schema or meaning of module records. The calling module owns the content it writes.

## State Events

The shared folder client dispatches:

```text
artifex:project-folder-client-ready
artifex:project-folder-state
```

Modules may listen to these events to update UI state, Health state, buttons, save labels, or warnings.

The event payload must be treated as folder/save state only. It is not a project data record.

## Starter Project Structure Helper

The starter project helper creates the canonical base structure used by Creation Guide.

It defines core directories including:

```text
scenes
screens
quests
sidequests
puzzles
archetypes
archetypes/objects
archetypes/effects
assets
assets/groups
assets/images
assets/images/backgrounds
assets/images/characters
assets/images/props
assets/images/ui
assets/sprites
assets/sprites/characters
assets/sprites/objects
assets/sprites/fx
assets/audio
assets/audio/music
assets/audio/sfx
assets/audio/voice
assets/fonts
assets/video
health
build
backups
todos
```

It also defines intake directories including:

```text
intake
intake/backgrounds
intake/characters
intake/objects
intake/icons-ui
intake/music
intake/dialogue-sfx
```

The starter helper writes canonical starter files such as:

```text
project.json
logic.json
layout.json
registry.json
library-links.json
input-map.json
scenes/scene-index.json
screens/screen-index.json
quests/quest-index.json
sidequests/sidequest-index.json
puzzles/puzzle-index.json
archetypes/object-index.json
archetypes/effect-index.json
assets/asset-index.json
README.md
intake/README.md
```

The helper must write missing files only. Existing files must be left unchanged unless a future explicitly authorised migration workflow is created.

## Creation Guide Integration

Creation Guide currently uses the service for:

- Connect Project Folder;
- Re-authorise Folder;
- Create Starter Structure;
- display of folder/save state;
- starter-file creation without overwriting existing files.

The Creation Guide setup flow currently creates the starter project structure through the shared service. It does not mean every other authoring module has adopted connected-folder save yet.

Creation Guide is a caller. It does not own the shared service.

## Relationship to Authoring Modules

Each authoring module must eventually use the shared service to read and write the files it owns.

### Project Editor

Project Editor should use the service to read and write project-level structural files such as:

```text
project.json
logic.json
layout.json
registry.json
library-links.json
input-map.json
```

It should not treat browser draft state or ZIP import/export as normal connected-project saving once direct save is implemented.

### Scene Editor

Scene Editor should use the service to read and write its owned scenes, screens, and indexes. It should distinguish local draft recovery from saved project files.

### Quest Builder

Quest Builder should use the service to read and write Quest and Side Quest records and indexes. Export/download should remain backup or interchange, not normal project save.

### Archetype Object Creator

Object Creator already has an implemented but not yet fully validated connected-project lifecycle. It must continue to use shared folder writes for in-progress object records, staged media, final object records, and final registered asset handoff where applicable.

### Effect Editor

Effect Editor should use the service when canonical connected-project FX Archetype save and index registration are implemented.

### Asset Library

Asset Library should use the service for final asset promotion and `assets/asset-index.json` updates.

### Puzzle Creator

Puzzle Creator should use the service for canonical puzzle records and `puzzles/puzzle-index.json` once connected-project save is implemented.

### Health and Build Game

Health and Build may read project files through the service or a shared project-file reader. They must not silently repair or overwrite authored records unless a separate explicit fix workflow is approved.

## Browser Local Storage Boundary

Browser localStorage is workspace/recovery state, not permanent project truth.

Valid local-only uses include:

- unsaved editor drafts;
- panel layout;
- selected app/view state;
- temporary previews;
- last-opened local workspace state;
- fallback recovery when a connected folder is unavailable.

Invalid local-only uses include:

- pretending a module has saved to the project folder;
- replacing canonical project records;
- becoming the only location for authored project content;
- overwriting connected project data without user confirmation.

A module with unsaved local-only work must report that clearly and should protect navigation where data loss is possible.

## ZIP / Download Boundary

ZIP export, JSON download, and local file import are backup, interchange, migration, or fallback workflows.

They are not the normal permanent save path once connected-folder saving exists for a module.

A module may keep export/download as a safety fallback, but must not label it as equivalent to `Saved to Project Folder`.

## Conflict and External Change Boundary

The shared save-status vocabulary includes `Project File Changed` and `Conflict`, but full cross-module conflict handling is not yet broadly implemented.

The intended future behaviour is:

- detect when a project file changed since the module loaded or last saved it;
- warn before overwriting external changes;
- allow a safe choice such as reload, compare, save as backup, or cancel;
- avoid silent overwrite of authored files;
- report the issue through module UI and Health where appropriate.

The shared service owns the common status language and low-level file access. Modules own file-specific merge or repair logic.

## Permission and Browser Support Boundary

If File System Access is unsupported, modules must explain that direct folder saving is unavailable and keep ZIP/export or local draft fallback where appropriate.

If permission is required, modules should offer re-authorisation rather than failing silently.

If a write fails, the module must report `Save Failed` or equivalent shared status and preserve local recovery where possible.

## Security and Privacy Boundary

The service may store the browser folder handle in IndexedDB so the user can re-authorise the same folder later.

Project JSON must not store:

- absolute local disk paths;
- browser file handles;
- user private folder paths;
- platform-specific path roots;
- permission tokens.

Project files should store only portable project-relative paths and stable record IDs.

## Current Gaps

The current service is useful and real, but adoption is incomplete.

Known gaps include:

- most authoring modules still rely on browser drafts, JSON export, ZIP export, fixed manifests, or imported indexes for some workflows;
- common unsaved-navigation protection is not yet consistently implemented;
- common project-file change/conflict detection is not yet complete;
- project-folder save-state UI is not yet standardised across all apps;
- active connected-project loading is not yet consistently used by every module;
- the relationship between this service and a future Shared Active Project Service still needs to be finalised.

## Source Classification

`artifex/shared/project-folder/project-folder-client.js` is the current implementation authority for the shared browser folder connection, permission, state, and read/write helper layer.

`artifex/shared/project-folder/project-structure-initializer.js` is the current implementation authority for starter project folders and blank starter files created through the shared folder service.

`artifex/apps/creation-guide/v1/src/project-folder-setup.js` is the current Creation Guide caller evidence. It demonstrates that Creation Guide uses the shared service for connected-folder setup and starter structure creation.

Creation Guide-specific UI text and implementation layering belong to the Creation Guide spec, not this shared-service spec.

Module-specific connected-save adoption belongs to each module's own implementation plan and `2A` backlog section.

## Remaining Work

All current and future implementation work belongs in `docs/artifex/02A-global-to-do.md`. This specification must not become a task list.
