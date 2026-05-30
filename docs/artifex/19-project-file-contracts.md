# Project File Contracts and Module Integration Rules

## Purpose

This document defines how Artifex apps exchange and save project data without swallowing each other or inventing different file shapes per module.

Artifex contains several connected authoring modules: Creation Guide, Project Editor, Scene Editor, Quest Builder, Puzzle Creator, Effect Editor, Archetype Object Creator, Asset Library, Playtest and Build Game. They must all operate on one coherent project folder rather than producing unrelated local JSON files.

The goal is stable file ownership, stable IDs, clear project-relative paths, safe direct saving, recoverable local drafts, a creator-friendly intake area and a clean build/audit path.

## Required Companion Docs

Every app should inspect this contract together with:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/21-template-game-project-contract.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
```

The project file contract defines data ownership, file layout, IDs, module boundaries, app splitting, direct project-folder saving and draft/backup rules.

The asset-intake workflow defines the root-level `intake/` staging area, the folder explanations shown by Creation Guide, recommended starting-media readiness and promotion of approved source files into final `assets/` records.

The Template Game project contract defines the minimum populated connected reference content required to prove cross-app data references before the first real production project begins.

The colour/display rules define the shared Artifex visual language, module accents, typography, control sizing, tooltip rules, header layout and fallback app logo rule.

The to-do guide defines how Project Editor, all-app and specific-app tasks should be separated.

## Core Rules

1. Each Artifex app owns the files for its own job.
2. Unique scene/screen/quest/effect/object content lives in the smallest file that needs it.
3. Reusable project content belongs in project-level indexes and libraries.
4. Cross-project reusable templates and tooling assets belong in Artifex global/shared folders.
5. The selected project folder on the user's computer is the normal editable source of truth once folder access has been granted.
6. `localStorage` is an autosave/recovery draft layer, not the permanent source of truth.
7. IndexedDB may store browser file/directory handles and connection metadata; those handles are local browser state and must never be written into project files.
8. Project files store paths relative to the connected project root only; never store private absolute HDD paths.
9. The root-level `intake/` folder is a creator-facing staging area for new source assets, not a final runtime/library asset location.
10. Permanent scene, screen, quest, object, effect and runtime files must not point directly to files in `intake/`.
11. Build Game validates, resolves and packages modular files into runtime-ready output. It does not replace authoring modules.

The Project Editor assembles and validates an existing project package. Creation Guide owns initial New Project creation, initial folder/file setup, intake explanation and initial readiness guidance. Project Editor may open, inspect, link, route, validate and save project structure files; it must not become the full authoring tool for scenes, quests, object archetypes, FX archetypes or raw assets.

## Connected Project Folder and Direct Save Contract

### Normal Production Workflow

Once implemented, the normal Artifex workflow is:

```text
Create or select project in Creation Guide
→ Connect the real project folder on the computer
→ Initialise or validate starter files, indexes and intake folders
→ Author content in the appropriate Artifex app
→ Autosave recovery drafts locally while editing
→ Press Save / Save All when ready
→ Write changed owned files directly into the connected project folder
→ Run audit/build checks
→ Commit/push approved project-folder changes to GitHub separately
```

Routine work should not require exporting a ZIP and manually replacing project files. ZIP/package export remains useful for full backup, transfer, archival snapshots and browsers where direct folder access is unavailable.

### Required Browser Mechanism

The project-folder connection should use the browser File System Access API.

Expected flow:

```text
Connect Project Folder button
→ window.showDirectoryPicker({ mode: "readwrite" })
→ user selects the project's root folder and grants access
→ Artifex stores the FileSystemDirectoryHandle in IndexedDB
→ Artifex reads/writes files inside that selected folder using project-relative paths
```

Do not attempt to store the handle in `project.json`, `artifex-project.json` or in localStorage JSON. The handle is browser/device-specific and belongs only in IndexedDB.

### Relative Paths Only

Project files must store relative project paths/URLs, not a private absolute computer path.

Good:

```text
scenes/scene_forest_path.json
archetypes/objects/archobj_mel.json
archetypes/effects/archeffect_magic_glow.json
assets/asset-index.json
health/latest-health-report.json
build/runtime-project.json
```

Do not depend on:

```text
E:/Forever Bound/Forever-Bound-Game/...
C:/Users/.../Forever-Bound-Game/...
```

A connected folder handle supplies the root; all Artifex project data resolves relative to that root. This means the same project files work on another computer, backup drive or GitHub checkout.

### Permission and Re-authorisation

A saved directory handle may exist in IndexedDB even if read/write permission is not currently granted.

On project load, the shared project-folder service should:

1. retrieve the saved directory handle from IndexedDB;
2. query current permission for `readwrite` access;
3. display the folder as connected, permission needed or unavailable;
4. require a user click on **Re-authorise Project Folder** before requesting permission again;
5. fall back to import/export if the folder cannot be re-authorised.

No app should silently claim that it saved to disk unless the actual file write succeeded.

### What Apps May Write

An app may directly write only files it owns, plus registration/index changes explicitly required by creating its own records.

Examples:

```text
Creation Guide writes initial project setup files, initial folder structure, intake README/folders, assignments/milestones and starter input-map data.
Scene Editor writes scene/screen files and required scene/screen index entries.
Effect Editor writes FX editor projects and FX archetype files/index entries.
Archetype Object Creator writes object archetype files/index entries.
Quest Builder writes quest/sidequest/flag/condition files and indexes.
Project Editor writes project structure, Flatplan, registry and link files.
Asset Library imports/promotes intake source assets into final assets/ files and index/group entries.
Build Game writes build output and generated audit/health reports.
```

An app must not casually overwrite source code, unrelated documentation or another module's authored internals.

### Template Game Connected Reference Project

The future **Template Game** uses the canonical project hierarchy as a small populated connected reference project. It must demonstrate references across app-owned files without changing the ownership rules in this contract.

Creation Guide starter initialisation remains separate from later app-generated or populated content. `project-structure-initializer.js` creates blank starter structure and empty indexes; Template Game content and generated validation/build outputs appear later through their appropriate owning apps and/or the connected reference generation/validation pass.

Build Game, Health Guide, Project Manager, Scene Editor, Quest Builder, Puzzle Creator, Asset Library, Effect Editor and Archetype Object Creator remain responsible for their owned outputs even when Template Game is generated as a connected example. See `docs/artifex/21-template-game-project-contract.md` for the minimum populated cross-app reference requirements.

## Local Draft, Save and Navigation Guard Contract

### Recovery Drafts

Each authoring app may save a working draft automatically into localStorage while the user edits. This protects work before a deliberate project-folder save.

A recovery record should include at least:

```json
{
  "projectId": "project_forever_bound",
  "owningModule": "scene-editor",
  "fileRef": "scenes/scene_forest_path.json",
  "savedFileHashAtOpen": "...",
  "draftHash": "...",
  "draftUpdatedAt": "...",
  "lastWrittenToProjectFolderAt": null,
  "dirty": true
}
```

Use content hashes for reliable equality checks and timestamps for user-readable information.

### Save Statuses

All apps working on project data should expose a clear save status:

```text
Saved to Project Folder      Local draft and connected file match.
Local Draft Only              Changes exist only in localStorage and are not in project files.
Project File Changed          The connected file is newer/different from the draft baseline.
Conflict                      Both local draft and connected project file changed since last sync.
Permission Required           Folder/file handle exists but must be re-authorised before saving.
No Folder Connected           Only local draft/import/export is currently available.
Save Failed                   A requested write did not complete successfully.
```

### Leaving an App With Unsaved Local-Only Changes

If the user attempts to leave one Artifex app for another module while project changes are only in localStorage, the app must stop navigation and show a save prompt.

Required message meaning:

```text
This work is currently saved only in local storage and has not been written to your project folder. Save it to the project folder before leaving?
```

Required choices:

```text
Save and Continue       Write owned changed files to the connected project folder, then navigate if successful.
Stay Here               Cancel navigation and continue editing.
Continue Without Saving Leave only after explicit confirmation that the changes remain local-draft-only and may be lost/overwritten.
Export Backup           Available fallback when no writable folder is connected or permission cannot be granted.
```

If the folder is not connected or permission is unavailable, the prompt must say that the changes exist only in localStorage and offer connection/re-authorisation or export-backup actions before leaving.

The same protection should apply to page reload/close where browser support permits, using a standard unsaved-changes warning in addition to the in-app module navigation prompt.

### Save Behaviour

Autosave to localStorage may happen frequently and quietly.

Writing to real project files must happen only through a deliberate user action such as:

```text
Save
Save All
Save and Continue
Build Project
Create New Item / Confirm Create, where creation explicitly writes the new registered file
```

Do not continuously overwrite real HDD project files on every field adjustment.

## Folder Connection Service Requirement

Direct folder access is a shared platform capability and must not be separately improvised inside every app.

Create a shared service/module responsible for:

```text
connecting a project folder
storing/retrieving directory handles in IndexedDB
querying/requesting permissions after user action
reading/writing files by project-relative path
creating permitted project subfolders/files
computing hashes/modified metadata
maintaining save status
detecting unsaved local drafts
showing navigation-save guards
providing fallback export/import when necessary
```

All apps should use this shared service so permissions, save prompts and conflict handling behave the same everywhere.

## Asset Intake and Promotion Contract

Every project may have a simple source-material staging folder at its root:

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

Creation Guide owns first-time explanation and creation/validation of this structure. It must provide a visible explanation of what belongs in each bucket and allow **Skip for Now** because a project can be created before source art exists.

`intake/` is not the final asset library. Files can be casually named and unfinished while they remain in intake. When a creator approves/imports an asset, the Asset Library/import workflow must:

1. preserve original source filename metadata;
2. confirm intended asset type/use;
3. assign a stable `asset_` ID;
4. copy/rename the approved final file into an appropriate `assets/` location;
5. update `assets/asset-index.json` and any required asset group record;
6. expose the final asset ID/path to other apps.

Permanent authored/project runtime records refer only to final asset IDs/paths, never to source files under `intake/`.

Creation Guide may report recommended starting-media readiness based on the existence or classification of initial source assets: a logo/title mark, one background, one player character, one NPC, one interactable object, one transition object and a basic icon/UI placeholder set. This is guidance and readiness reporting, not a hard requirement for project creation.

## Module Code Split Contract

Every Artifex app must be split into editable modules. Do not keep growing one huge `index.html`, one huge `app.js`, or one huge patch file until it becomes risky to edit.

The active entry file should be thin. It should load the shell, import modules, create state/controllers, wire the main app and start the app. It should not contain the full UI, data model, renderer, library browser, health checker, import/export logic and patch fixes all in one place.

Recommended module split:

```text
index.html                         thin shell only
v*/src/<app>-app.js                main orchestrator / bootstrap
v*/src/<app>-state.js              state model and mutations
v*/src/<app>-ui.js                 main UI rendering and events
v*/src/<app>-renderer.js           canvas/SVG/WebGL/rendering layer, if needed
v*/src/<app>-io.js                 project-folder read/write and fallback import/export
v*/src/<app>-library.js            library/index browsing helpers, if needed
v*/src/<app>-health.js             app-local checks, if not yet shared
v*/src/data/*.js                   static data, catalog definitions, defaults
v*/src/shared/*.js                 small shared helpers used only inside the app
```

Shared saving and connection behaviour should live outside individual apps, for example:

```text
artifex/shared/project-folder/
  project-folder-client.js
  file-handle-store.js
  file-write-service.js
  draft-status-service.js
  navigation-save-guard.js
```

### File Size Rule

- Under 300 lines: usually fine.
- 300–500 lines: acceptable if the file has one clear responsibility.
- Over 500 lines: review for splitting before adding features.
- Over 800 lines: treat as a refactor risk unless a reason is documented.

### Patch Integration Contract

Temporary patches are allowed, but they must stay temporary. No Artifex app should have more than two active patch layers running over the top of normal code at once.

Every patch must be integrated into the correct module, converted into a normal helper, removed when unnecessary or archived as non-live historical reference.

When inspecting an app, check loaded patches, ownership destination, cache/version clarity and whether inactive old patch files remain in the repo.

## Current Module Ownership

### Creation Guide

Owns initial project creation, starter project folder/file structure, intake setup explanation, assignments, milestones, setup health, recommended-media readiness and starter input-map data.

Required direct-save behaviour:

- Create New Project should create/register the initial split project files in the connected chosen folder when writable access is available.
- Initial setup should offer to create the `intake/` folder, six intake buckets and `intake/README.md`, with a skip option.
- If no folder is connected, the new project is local-draft-only until the user connects a folder or exports a backup.
- It must use the same unsaved-draft navigation guard as other modules.

### Project Editor

Owns project structure files, Flatplan, routes, graph layout, registry, library links, project-level structural validation and connection status display.

Required direct-save behaviour:

- It should provide visible connected-folder/re-authorisation status and access to Project Audit.
- It should load real project indexes from the connected root rather than placeholder/demo data once a project is active.
- It writes its own structure files and approved registration/link updates through the shared folder service.
- It must not author scene interiors, quest internals, object archetype definitions or FX editor project internals.

### Scene Editor

Owns visual scenes and screens, placement/layout data, layers, object instances, FX instances, local transitions and scene-local asset references.

Required direct-save behaviour:

- New Scene creates a new scene file and registers it in `scenes/scene-index.json`.
- New Screen creates a new screen file and registers it in `screens/screen-index.json`.
- Saved changes write directly to its project files when permission is granted.
- Before navigating away with local-draft-only edits, it must prompt Save and Continue / Stay Here / Continue Without Saving / Export Backup.

### Archetype Object Creator

Owns reusable non-FX Object Archetypes, categories, linked sprite assets, portrait assets, animation states, collision/interaction defaults, behaviour flags and placement defaults.

Required output:

```text
archetypes/object-index.json
archetypes/objects/archobj_<slug>.json
```

It creates and saves those records directly into the connected project folder when approved; Scene Editor places object instances referencing those IDs.

### Effect Editor

Owns FX editor projects, reusable FX Archetypes, effect presets, renderer-specific effect metadata and related export/plate tooling.

Required output:

```text
archetypes/effect-index.json
archetypes/effects/archeffect_<slug>.json
```

It writes reusable effects into the connected project folder when saved; Scene Editor and Project Editor reference FX archetype IDs rather than copying complete FX editor state.

### Quest Builder

Owns quests, side quests, branches, flags, conditions, rewards, unlocks and progression logic.

Required output:

```text
quests/quest-index.json
quests/quest_<slug>.json
sidequests/sidequest-index.json
sidequests/sidequest_<slug>.json
```

### Puzzle Creator

Owns puzzle definitions and puzzle index output.

Required output:

```text
puzzles/puzzle-index.json
puzzles/puzzle_<slug>.json
```

### Asset Library / Asset Browser

Owns final asset metadata and asset groups, not gameplay behaviour. It reads source files staged in `intake/`, promotes approved files into final `assets/` locations, and writes registered metadata/group records. Browser views should show project assets and, where allowed, global Artifex assets separately.

### Build Game

Owns final validation, audit output and runtime/package assembly. It reads the connected project files and writes build output only after validation. It does not author module content.

## Canonical Project Package Folder Structure

Use separate files. Do not collapse the whole project into one large JSON blob.

When the user connects a local project folder, that selected folder is treated as `<project-root>/` in this contract. Project files store only paths relative to that root.

```text
<project-root>/
  project.json
  logic.json
  layout.json
  registry.json
  library-links.json
  input-map.json
  README.md

  intake/
    README.md
    backgrounds/
    characters/
    objects/
    icons-ui/
    music/
    dialogue-sfx/

  scenes/
    scene-index.json
    scene_<slug>.json

  screens/
    screen-index.json
    screen_<slug>.json

  quests/
    quest-index.json
    quest_<slug>.json

  sidequests/
    sidequest-index.json
    sidequest_<slug>.json

  puzzles/
    puzzle-index.json
    puzzle_<slug>.json

  archetypes/
    object-index.json
    effect-index.json
    objects/
      archobj_<slug>.json
    effects/
      archeffect_<slug>.json

  assets/
    asset-index.json
    groups/
      assetgroup_<slug>.json
    images/
      backgrounds/
      characters/
      props/
      ui/
    sprites/
      characters/
      objects/
      fx/
    audio/
      music/
      sfx/
      voice/
    fonts/
    video/

  health/
    latest-health-report.json

  build/
    runtime-project.json
    build-manifest.json

  backups/
    backup-manifest.json

  todos/
    creation-guide.json
    project-manager-todos.json
```

`intake/` contains unsorted or unapproved source material. `assets/` contains the final registered assets used by the project. Artifex must copy/promote approved files rather than making runtime content depend on intake paths.

## Required Top-Level Files

### `project.json`

Owned by Creation Guide at creation time, then editable/inspectable where permitted by Project Editor.

```json
{
  "schemaVersion": "artifex.project.v1",
  "projectId": "project_forever_bound",
  "gameTitle": "Forever Bound",
  "creator": "Cinaedvs Studios",
  "version": "0.1.0",
  "createdBy": "creation-guide",
  "projectLogo": "assets/images/ui/project-logo.png",
  "startScreenId": "screen_title_main",
  "enabledModules": [],
  "roots": {
    "intake": "intake/",
    "assets": "assets/",
    "scenes": "scenes/",
    "screens": "screens/",
    "quests": "quests/",
    "sidequests": "sidequests/",
    "puzzles": "puzzles/",
    "archetypes": "archetypes/",
    "health": "health/",
    "build": "build/",
    "backups": "backups/"
  },
  "fileRefs": {
    "sceneIndex": "scenes/scene-index.json",
    "screenIndex": "screens/screen-index.json",
    "questIndex": "quests/quest-index.json",
    "sidequestIndex": "sidequests/sidequest-index.json",
    "puzzleIndex": "puzzles/puzzle-index.json",
    "objectArchetypeIndex": "archetypes/object-index.json",
    "effectArchetypeIndex": "archetypes/effect-index.json",
    "assetIndex": "assets/asset-index.json",
    "healthReport": "health/latest-health-report.json"
  }
}
```

The optional `projectLogo` reference must point to a promoted final asset, never an `intake/` source file. Do not store the user's absolute HDD path or `FileSystemDirectoryHandle` in this file.

### `input-map.json`

Owned by Creation Guide at project creation time, then inspectable/validatable by Project Editor. Contains gameplay action/button mapping.

### `logic.json`

Owned by Project Editor. Contains graph nodes, routes, route types, locks, conditions, linked scene/screen/quest/puzzle IDs and project-level structure logic.

### `layout.json`

Owned by Project Editor. Contains editor-only Flatplan layout state: node positions, camera pan/zoom, collapsed states, route visual styling and editor annotations.

### `registry.json`

Owned by Project Editor, with references from other modules. Contains the active project registry of modules, available libraries and loaded indexes.

### `library-links.json`

Owned by Project Editor. Contains normalized links from project graph nodes/routes to scenes, screens, quests, side quests, puzzles, object archetypes, effect archetypes and assets.

### `health/latest-health-report.json`

Generated by the shared Health Guide. It may be displayed by Creation Guide, Project Editor Build Prep or Build Game validation.

## Canonical ID Prefixes

```text
project_       Project package ID
scene_         Playable scene
screen_        UI/title/menu/ending screen
node_          Project Editor Flatplan node
route_         Project Editor route/connection
quest_         Quest Builder quest
sidequest_     Quest Builder side quest
branch_        Quest/route branch
flag_          Progression flag
condition_     Condition expression/rule
puzzle_        Puzzle definition
action_        Gameplay/input action mapping
archobj_       Archetype Object Creator object archetype
objinst_       Scene instance of an object archetype
archeffect_    Effect Editor reusable effect archetype
fxinst_        Scene instance of an effect archetype
asset_         Final registered asset record
assetgroup_    Asset group or sprite/animation group
template_      Template package or starter structure
health_        Health check/report item
assignment_    Creation Guide work assignment
milestone_     Creation Guide milestone
```

## Shared Module Menu Names

Every Artifex app should use the same Module menu order:

```text
Hub
Creation Guide
Project Editor
Scene Editor
Quest Builder
Puzzle Creator
Effect Editor
Archetype Object Creator
```

Unavailable modules may be disabled, but the order and labels should remain stable.

## Asset Browser Contract

Project Editor should expose one shared browser window, not separate duplicated browser UIs for every library.

Required modes:

```text
quests
sidequests
scenes-screens
puzzles
archetype-objects
archetype-effects
assets
```

A result should expose stable ID, type, name, source module, project-relative file path, tags and status.

## Health, Audit and Backup Contract

Create/import shared checking code under:

```text
artifex/shared/health-guide/
```

Shared checks should be available to Creation Guide, Project Editor/Build Prep and Build Game.

The audit must eventually check:

```text
connected-folder permission and write status
local drafts that have not been saved to project files
files changed outside the current draft baseline
missing registered files
missing or skipped intake setup where relevant
missing recommended starting-media readiness items
invalid project-logo final reference
broken asset/object/effect/quest references
duplicate IDs
unregistered files where detectable
unused assets
out-of-date backup/build metadata
```

The audit warns and reports. It must not silently resolve file conflicts or overwrite source files.

## Module Ownership Matrix

| Module | Owns / writes | Reads | Must not own |
|---|---|---|---|
| Creation Guide | new project creation, initial folder/intake setup, assignments, milestones, setup health, starter input map | shared health reports, project summary, intake readiness | Flatplan graph internals; final asset promotion/classification |
| Project Editor | project manifest inspection, Flatplan, routes, registry, library links, folder/save status, structure validation | all module index files, input map | scene art, quest internals, object/FX archetype authoring |
| Scene Editor | scenes, screens, visual layout, object/effect instances | asset index, object/effect archetype indexes | project graph/routes |
| Quest Builder | quests, side quests, branches, flags, conditions, rewards | scene/screen IDs, puzzle IDs, object IDs | visual scene layout |
| Puzzle Creator | puzzle definitions and puzzle index | scene IDs, asset IDs, object IDs | project route graph |
| Archetype Object Creator | reusable non-FX object archetypes | asset IDs | scene instances, FX archetypes |
| Effect Editor | reusable FX archetypes and FX editor projects | asset IDs | object archetypes, scene placement |
| Asset Library | approved final asset files, metadata and asset groups | project intake source files, project file paths | gameplay behaviour |
| Shared Project Folder Service | directory handle persistence, permission state, reads/writes, draft comparison, navigation save guards | all registered project-relative owned paths | module-authored content decisions |
| Build Game | validation, audit output and package/build assembly | all project files | authoring module content |

## Rules For Existing Apps To Adopt

1. Every active app README must include an ownership section: owns, reads, writes/exports and must not own.
2. Every app that exports or saves data must use stable IDs and project-relative file paths.
3. Every app must keep editor project state separate from reusable library output.
4. Project Editor must link module outputs through indexes and IDs.
5. Project Editor must not duplicate large module-owned records except when generating a build snapshot.
6. Creation Guide owns initial project creation, folder initialisation, intake explanation/setup and setup wizard flow.
7. Asset Library/import workflow owns promotion of approved intake material into final indexed assets.
8. Health checks must move toward shared health-guide code.
9. The project must stay split into individual files so broken content can be edited directly.
10. Every app must follow `docs/artifex/18-color-and-display-rules.md`, `docs/artifex/20-asset-intake-workflow.md` where assets are involved, and this contract.
11. Every app must follow the Module Code Split Contract.
12. No app should run more than two active patch layers over its normal code.
13. Connected project-folder read/write saving is the normal target workflow; ZIP/manual replacement is fallback/backup only.
14. Every app that authors project data must use the shared folder/save service rather than inventing separate write logic.
15. Every app must clearly show whether work is saved to project files or exists only in localStorage.
16. Every app must block module navigation when local-draft-only edits exist and show the required save warning/choices.
17. Folder handles and permission state belong in IndexedDB/browser state, never in committed project JSON.
18. Content files must contain project-relative paths, never absolute private HDD paths.
19. Build Game must audit unsaved local drafts and connected-file conflicts before producing a final build.
20. Intake files are staging files only and may not be permanently referenced by authored/runtime project records.

## Current Conformance Summary

Already conceptually aligned:

- Creation Guide owns project setup and production health conceptually.
- The connected-folder save contract and asset intake workflow are now documented.
- Scene Editor owns scene/screen visual editing.
- Archetype Object Creator distinguishes raw assets, object archetypes, FX archetypes and scene instances.
- The module boilerplate provides a sensible app structure.

Required next foundation work:

- Implement a shared project-folder connection/save service using File System Access API plus IndexedDB handle persistence.
- Add Connect/Re-authorise Project Folder controls and visible save-state indicators.
- Implement Creation Guide initial folder/intake creation, explanation and recommended-media checklist UI.
- Add the unsaved local-draft navigation guard to every authoring app.
- Make all apps open and save the active project's real registered files rather than only demo/localStorage state.
- Update direct authoring actions so they write their owned file plus the correct index entry.
- Add local-draft-versus-project-file checking to Project Audit and Build validation.
- Retain localStorage as recovery autosave and ZIP/package export as backup/fallback, not as the normal data-management route.
- Continue auditing app shells, colours, monolith files, stale patch layers and old loaded patch files.
