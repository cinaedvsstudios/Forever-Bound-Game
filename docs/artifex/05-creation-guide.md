# Creation Guide

## Purpose

The Creation Guide is the Artifex project onboarding screen, project overview, assignment planner, production dashboard, checklist, milestone tracker and health-check system.

It helps the creator start or open an Artifex project, connect and initialise the real project folder, define the minimum required project structure, create the primary project/index files, set the active project for the whole Artifex hub, prepare source assets through an intake area, and track the work needed to build the game.

The Creation Guide should feel like mission control. It tells the creator what project is active, whether the real project folder is connected and writable, what still needs to be defined, which setup gates are blocking production, what recommended media is available, which Artifex tool owns each piece of work and whether the project is healthy enough to keep building.

## Required Companion Docs

Creation Guide design and implementation must be read together with:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/20-asset-intake-workflow.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
```

`19-project-file-contracts.md` is the source of truth for connected-folder saving, file ownership, relative paths, drafts and save-state rules. `20-asset-intake-workflow.md` is the source of truth for the creator-facing `intake/` drop folders and promotion into final registered assets.

## Naming Decision

Use **Creation Guide** for the project onboarding, overview, assignment, dashboard, milestone, checklist and health-check module.

Use **Project Editor** for the structural game editor that owns the Manifest, Flatplan, Flatplan Catalog, Stitcher, Routes and Map Projection. The Creation Guide can create starter structure and report project health, but it should not become the full Project Editor.

## Top-Level Architecture

The Artifex workflow should be:

```text
Artifex Hub
  Change/select active project
  Display active project name and logo where available
  Open Artifex apps into the active project

Creation Guide
  Create/open project
  Connect or re-authorise the real project folder
  Initialise the starter folder/file structure
  Explain and create intake folders
  Show Project Overview and recommended-media readiness
  Register project in Project Library
  Set active project
  Track assignments, milestones, readiness and health
  Offer ZIP backup/export fallback when needed

Project Editor
  Edit Manifest, Flatplan, Routes, Map Projection, Stitcher and structural files

Scene Editor / Quest Builder / Archetype Object Creator / Effect Editor
  Load and edit owned content inside the connected active project
  Keep recovery drafts locally until deliberately saved to project files
```

Every app opened from the Hub should eventually read the shared active project and open its real registered files. If no active project is set, the app should ask the creator to select or create one in Creation Guide.

## Connected Project Folder Is the Normal Save Workflow

Creation Guide owns first-time folder connection and initial project creation. The normal intended workflow is:

```text
Create or open project
→ Connect Project Folder
→ user chooses the real project root and grants read/write access
→ Creation Guide creates/validates starter folders and files
→ Artifex apps edit against the active project
→ localStorage keeps temporary recovery drafts while editing
→ Save / Save All writes owned changed files into the connected project folder
→ Health/Audit/Build validates the real folder contents
→ approved changes can be committed or pushed to GitHub separately
```

The shared project-folder service must use the browser File System Access API and persist the browser-specific directory handle/permission metadata in IndexedDB. Project files store only project-relative paths. They must never store an absolute hard-drive path or a browser file handle.

ZIP export is retained for full backups, transfer, archival snapshots and fallback when the project folder is not connected or write access is unavailable. It is not the normal daily save method once direct folder access is implemented.

Creation Guide should show the current folder/save state clearly:

```text
Saved to Project Folder
Local Draft Only
Project File Changed
Conflict
Permission Required
No Folder Connected
Save Failed
```

## Shared Project Library

Creation Guide owns project registration and active project selection.

Suggested browser storage keys:

```text
artifex.projectLibrary
artifex.activeProjectId
```

`artifex.projectLibrary` stores known project summaries for selection. `artifex.activeProjectId` stores the currently selected project ID. Neither replaces the editable project files in the connected folder.

A project library entry should contain portable project metadata and relative file references:

```json
{
  "projectId": "project_forever_bound",
  "projectName": "Forever Bound",
  "projectLogo": "assets/images/ui/project-logo.png",
  "status": "setup",
  "version": "0.1.0",
  "createdAt": "",
  "updatedAt": "",
  "lastOpenedAt": "",
  "onlineProjectPath": "",
  "deployedUrl": "",
  "primaryIndexFile": "project.json",
  "manifestFile": "logic.json",
  "layoutFile": "layout.json",
  "intakeRoot": "intake/",
  "assetRoot": "assets/",
  "buildRoot": "build/",
  "backupRoot": "backups/",
  "enabledModules": []
}
```

The project library entry may indicate that a folder has previously been connected, but the actual directory handle and permissions belong in IndexedDB/browser state only.

## Startup Screen: Project Overview

When the user clicks **New Project**, **Open Project**, or opens Creation Guide without an active project, the right viewing panel should start on **Project Overview**. The left setup panel should start collapsed or mostly collapsed.

The Project Overview screen should show:

- project name and optional project logo;
- project status and setup percentage;
- active project ID/slug;
- connected-folder state and Save status;
- online repository/deployed URL if available;
- primary file/index paths;
- active Chronicle/Quest target where relevant;
- enabled modules;
- intake setup state;
- recommended-media readiness checklist;
- readiness warnings and setup actions.

The assignment board is not the starting screen. Assignments open from a popup/window after the project overview exists.

## New / Open Project Choice

The New / Open workflow should eventually support:

```text
Blank Project
Artifex Adventures Template Game
Open Existing Project
```

**Artifex Adventures Template Game** must not appear as a functioning choice until the playable template project has been built and validated. Once available, it provides a learn-by-editing starter project containing working examples and its own `intake/` area.

## Initial Setup Gates

Before the creator can properly make scenes, characters, quests, objects or effects, the project needs a minimum structure. Creation Guide should show these as setup gate cards in Project Overview.

### 1. Define Project Identity

Required information:

- project name;
- project ID/slug;
- creator or studio name;
- version;
- short description;
- template used;
- default language.

Optional but recommended:

- project logo or temporary title mark, stored as a final asset path after promotion/import.

The project logo should be able to display beside the project title in Creation Guide and in other Artifex project selectors where practical.

### 2. Connect Project Folder

Creation Guide should provide **Connect Project Folder** and **Re-authorise Project Folder** actions through the shared folder service.

When writable access exists, Creation Guide can initialise missing permitted project folders/files. When access is not available, the project may exist as a local draft and offer backup export, but the UI must not claim that files were saved to disk.

### 3. Create Primary Project File

Creation Guide creates the top-level project pointer file that all tools can discover:

```text
project.json
```

The file points to the other important project files, roots and indexes using relative paths only.

### 4. Create Folder Structure

Creation Guide creates or validates the recommended folder hierarchy in the connected root, including data/module output folders, final assets, health/build/backups and the source-material `intake/` area.

### 5. Initial Asset Intake Setup

This must be its own visible section, not an unexplained background action. Creation Guide should explain that `intake/` is the simple incoming drop zone for source material before Artifex imports, renames, indexes and copies files into final `assets/` locations.

The setup should show and offer to create:

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

Plain-language explanation shown to the creator:

| Folder | Put this here |
|---|---|
| `backgrounds/` | Scene backgrounds, interiors, landscapes, title/ending backgrounds and environmental plates. |
| `characters/` | Player character, NPCs, interactive characters, enemies, portraits, reference art and sprite/animation sheets. |
| `objects/` | Props, pickups, doors, transitions, furniture, clue items and interactable object art. |
| `icons-ui/` | Project logo, inventory/action icons, map markers, HUD/menu elements and UI frames. |
| `music/` | Music tracks and musical stingers. |
| `dialogue-sfx/` | Voice/dialogue, ambience, footsteps, UI sounds and environmental sound effects. |

The section must offer **Create Intake Folders** and **Skip for Now**. Skipping does not block project creation, but Project Overview/Health should show that intake setup was skipped or remains unfinished until deliberately completed/dismissed.

No permanent scene, quest, object or runtime file may reference an `intake/` file directly. Approved files are promoted into final `assets/` paths and registered by the asset workflow.

### 6. Recommended Starting Media Checklist

This is a readiness checklist, not a hard block on project creation. It should report whether the creator has enough starting material to plan a simple first scene.

| Recommended item | Intake destination | Initial readiness purpose |
|---|---|---|
| Project logo or temporary title mark | `intake/icons-ui/` | Project identity and title/menu planning. |
| At least 1 scene background | `intake/backgrounds/` | First playable/test scene. |
| At least 1 player-character image or sprite sheet | `intake/characters/` | Playable character placeholder/final art. |
| At least 1 NPC image or sprite sheet | `intake/characters/` | Basic interaction/dialogue test. |
| At least 1 interactable object or pickup | `intake/objects/` | Object interaction test. |
| At least 1 door/passage/transition object | `intake/objects/` | Scene movement/transition planning. |
| At least 1 icon/UI placeholder set | `intake/icons-ui/` | HUD/menu/prompt test. |

Useful additions after the initial minimum include music or ambience, dialogue/SFX samples, enemy/hazard art and FX source art.

### 7. Create Starter Structural Files

Creation Guide should create starter shells or register their creation for:

```text
logic.json
layout.json
registry.json
library-links.json
input-map.json
```

Project Editor becomes the owner of structural editing after starter creation.

### 8. Create Index Files

Suggested starter indexes include:

```text
scenes/scene-index.json
screens/screen-index.json
quests/quest-index.json
sidequests/sidequest-index.json
puzzles/puzzle-index.json
archetypes/object-index.json
archetypes/effect-index.json
assets/asset-index.json
```

### 9. Choose Enabled Modules

Typical modules:

- Creation Guide;
- Project Editor;
- Scene Editor;
- Quest Builder;
- Puzzle Creator;
- Archetype Object Creator;
- Effect Editor;
- Asset Library;
- Build Game.

### 10. Set Active Project

Writes the project summary into `artifex.projectLibrary` and sets `artifex.activeProjectId`. Other Artifex apps must eventually load their real state from the active connected project rather than only showing its name.

### 11. Run Project Readiness Check

Confirms project structure, folder/save state and starting requirements. A project may be created without completing optional media/intake work, but it should not be shown as fully ready without acknowledging outstanding setup.

## Canonical Recommended Project Folder Hierarchy

For new projects, Creation Guide should initialise or validate this project-relative structure through the shared folder service:

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

`intake/` is intentionally separate from `assets/`. Intake contains incoming source material; final asset files and records live under `assets/` after review/import/promotion.

This hierarchy is a recommended default. The binding rule is that `project.json` and related registries tell every app where files live using project-relative paths only.

## Primary Project File

`project.json` is owned by Creation Guide at creation time, then inspectable/editable where allowed by Project Editor.

Suggested starter shape:

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
    "puzzleIndex": "puzzles/puzzle-index.json",
    "objectArchetypeIndex": "archetypes/object-index.json",
    "effectArchetypeIndex": "archetypes/effect-index.json",
    "assetIndex": "assets/asset-index.json",
    "healthReport": "health/latest-health-report.json"
  }
}
```

The optional `projectLogo` value is a final promoted asset path. A temporary source image may begin in `intake/icons-ui/`, but the final project reference must not point into `intake/`.

## Creation Guide Layout

The Creation Guide app should use a simple two-panel layout:

```text
Top bar
  Brand, module title and visible version
  Project identity/logo where supported
  Quick icons and menu bar

Main area
  Left setup panel
    collapsed by default on new/open project
    setup fields and selected assignment inspector

  Right viewing panel
    Project Overview by default
    setup coach
    setup gates and readiness sections
    Health section

Popup windows
  New / Open Project
  Assignments
  Assignment detail
  Project Library / Change Project
  Module intro/help
```

## Core Object: Assignment

After a project exists, the main production object inside the Creation Guide is an **Assignment**: a concrete unit of production work that can be assigned, started, blocked, reviewed, completed or archived.

Examples include: create first forest scene; define Calling completion condition; prepare Mel throw animation; add initial intake folder guidance; provide a project logo; connect the real project folder; create Bellator placeholder; replace placeholder title-screen art.

Assignments are smaller than milestones but larger than individual checklist ticks.

## Milestones and Assignment Workflow

Example milestones:

- Project Setup;
- First Playable;
- Chronicle 0 Prototype;
- First Scene Complete;
- First Quest Complete;
- First Playtest;
- Build Game.

Workflow states:

```text
unassigned
assigned
started
snoozing
blocked
review
done
archived
```

`undone` is a dashboard filter, not a stored workflow state.

Assignments should retain priority and effort values on a 1–5 scale, with optional manual overrides. Module colour indicates which app owns the work; workflow state, priority, effort and completion must be displayed separately.

## Project Health Check

Project Health is the validation portion of Creation Guide. It should eventually check:

- no active project selected or active project not found;
- no connected folder, permission required, save failed or conflicts;
- local drafts that have not been written to project files;
- missing `project.json`, starter structural files, registered index files or required roots;
- missing or intentionally skipped `intake/` setup;
- missing recommended starting media items;
- missing/invalid project logo final reference where one is configured;
- broken routes, duplicate IDs and broken asset/object/effect/quest references;
- blocked or snoozing assignments;
- high-priority assignments without an owner;
- completed assignments with incomplete required subtasks;
- outdated backup/build metadata.

Health reports warn and generate actions; they must not silently overwrite project files or resolve conflicts.

## Suggested Creation Guide Data Model

The module exports one Creation Guide document linked to a project:

```json
{
  "id": "creation_xxxxx",
  "projectId": "project_forever_bound",
  "name": "Artifex Adventure Creation Guide",
  "moduleKind": "creation-guide",
  "version": "V1.1.10",
  "setup": {
    "folderConnection": {},
    "intakeSetup": {},
    "recommendedMedia": {},
    "projectLogo": null
  },
  "projectLibraryEntry": {},
  "setupGates": [],
  "assignments": [],
  "milestones": [],
  "notes": "",
  "projectTree": []
}
```

A linked Assignment should use stable IDs, primary/related module ownership, workflow status, priority, effort, milestone links, relative linked-file paths, linked asset IDs, subtasks, blockers and created/updated/last-touched dates.

## Relationship to Other Modules

The Creation Guide does not replace Scene Editor, Project Editor, Quest Builder, Puzzle Creator, Archetype Object Creator, Asset Library or Effect Editor.

It creates/selects the active project, connects/initialises the real project folder, creates starter file structure, explains source-asset intake, reports recommended-media readiness, points the creator to the correct tool and reports whether required setup work is complete.

Intended workflow:

1. Open Artifex Hub and choose Change Project.
2. Create a new project, start from a validated Artifex Adventures template when available, or open an existing project.
3. Creation Guide opens Project Overview.
4. Connect or re-authorise the real project folder.
5. Complete project identity and initial folder/file setup.
6. Complete or skip the visible `intake/` explanation/setup step.
7. Add recommended starting source material and import/promote approved assets into final `assets/` paths.
8. Creation Guide registers the project and sets it active.
9. Other apps open their owned real files from the active connected project.
10. While editing, recovery drafts are retained locally; deliberate saves write through the shared folder service.
11. Run Health/Audit/Build checks against the real project folder.
12. Use ZIP export only for backup, transfer or fallback where direct folder saving is unavailable.

## Current Implementation and Future Tasks

The live Creation Guide V1.1.10 currently proves Project Overview, setup coaching, project registration in browser storage, active project selection, ZIP starter export, assignments and Health UI. Direct project-folder connection, initial folder creation, intake checklist UI, project logo support and Artifex Adventures template choice are future implementation tasks and must not be described as already working in the live app.
