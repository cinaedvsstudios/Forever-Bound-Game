# Creation Guide

## Purpose

The Creation Guide is the Artifex project-onboarding, Project Overview, setup guidance, assignment-planning and early-health module. It creates or opens a project, connects the real writable project folder, creates the initial blank project structure, sets the active project, explains later asset intake requirements and directs remaining production work to the correct owning apps.

Creation Guide is not the full structural editor, asset importer, scene authoring app, quest authoring app, FX editor, build system or runtime engine.

## Required Companion Documents

Creation Guide design and implementation must be read together with:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/21-template-game-project-contract.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
```

- `19-project-file-contracts.md` defines ownership, connected-folder saving, relative paths, drafts and cross-app rules.
- `19a-project-starter-file-schemas.md` is the source of truth for exact starter JSON shapes. Do not duplicate incomplete JSON definitions in this document.
- `20-asset-intake-workflow.md` defines `intake/` staging and final asset promotion.
- `21-template-game-project-contract.md` defines the later populated reference project used to prove cross-app integration.

## Three Separate Project Concepts

| Term | Meaning | Creation Guide responsibility |
|---|---|---|
| **Blank Starter Project** | An empty valid project structure: starter structural JSON, directories and empty indexes. | Create and initialise it in a connected folder. |
| **Template Game** | A later small populated connected reference project proving that all Artifex apps read and reference the same project files correctly. | Eventually offer it as a new-project option only after it exists and validates. |
| **Artifacts Adventures** | The first real production project authored through Artifex after the Template Game flow works. | Onboard it as a real project; do not treat it as the Template Game. |

## Current Live State

Current visible Creation Guide version:

```text
V1.1.12
```

The live V1.1.12 implementation currently provides a clean base runtime (`creation-guide-app.js`) instead of the old `app-bootstrap.js` → `module-app.js` compatibility chain. It directly renders the current shell, Project Overview, canonical setup gates and toolbar controls. It provides:

- Project Overview and collapsed left setup panel;
- setup coach and module-intro popup;
- New / Open browser-project flow;
- Set Active Project, Assignments and Health views;
- Export ZIP as backup/fallback;
- **Project Folder** toolbar access;
- **Connect Project Folder** through the shared folder service;
- **Re-authorise Folder** support;
- **Create Starter Structure** writing canonical starter folders/files to the connected project root without overwriting existing files;
- visible working/status feedback while starter structure writes are running;
- **Initial Asset Intake Setup** with Create Intake Folders, Skip for Now and health reporting for ready/skipped/not-set-up states.

The connected-folder/starter-structure and intake setup features have been browser-smoke-tested against the clean V1.1.12 runtime. The active script stack no longer loads `app-bootstrap.js` or `module-app.js`; those legacy files remain only as inactive historical reference until a later confirmed deletion pass.

Still future Creation Guide UI work:

- Recommended Starting Media checklist;
- project logo intake/promotion/display support;
- Template Game choice once the reference project exists;
- expanded shared Health integration and full cross-app active-project runtime loading.

## Top-Level Workflow

```text
Artifex Hub
  Choose or change active project
  Open apps into that active project

Creation Guide
  Create/open project
  Connect or re-authorise the real project folder
  Create the Blank Starter Project structure
  Explain/create optional intake staging folders
  Report starting-media readiness
  Register/set the active project
  Track assignments and early health
  Offer backup ZIP only when useful

Project Editor
  Load and edit structural project files such as logic/layout/registry

Scene Editor / Quest Builder / Puzzle Creator / Archetype Object Creator / Effect Editor / Asset Library
  Load and edit owned files inside the connected active project
  Keep recovery drafts locally until deliberate save

Build Game / Health Guide
  Generate validation/build outputs from the saved project data
```

## Connected Project Folder Is the Normal Save Direction

The intended production workflow is:

```text
Create or open project
→ Connect Project Folder
→ choose the real project root and grant read/write permission
→ Creation Guide creates missing blank starter files and folders
→ apps load/edit their owned project files
→ localStorage protects temporary drafts while editing
→ explicit Save actions write owned files into the connected project folder
→ Health/Audit/Build checks saved data
→ approved changes may be backed up or pushed to GitHub separately
```

The directory handle and browser permission metadata belong in IndexedDB/browser state. Project files must store only project-relative paths. They must never store an absolute private HDD path or a browser directory handle.

Save/folder state language across apps should use:

```text
Saved to Project Folder
Local Draft Only
Project File Changed
Conflict
Permission Required
No Folder Connected
Save Failed
```

ZIP export remains useful for backup, transfer and no-permission fallback. It is not the eventual normal daily save method.

## Shared Project Library

Creation Guide owns browser project registration and active-project selection using:

```text
artifex.projectLibrary
artifex.activeProjectId
```

These store portable summary/selection information only. They do not replace editable project files in the connected folder and do not store the directory handle.

A project-library summary may contain:

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
  "logicFile": "logic.json",
  "layoutFile": "layout.json",
  "intakeRoot": "intake/",
  "assetRoot": "assets/",
  "buildRoot": "build/",
  "backupRoot": "backups/",
  "enabledModules": []
}
```

`projectLogo`, when set, must be a final promoted asset reference under `assets/`, never an `intake/` source file.

## Project Overview Screen

The right viewing panel should start on Project Overview, with the left setup panel collapsed or mostly collapsed. Project Overview should show:

- project name and optional promoted logo;
- project status and setup percentage;
- active project ID/slug;
- connected-folder and save state;
- online repository/deployed URL if supplied;
- key project/index paths;
- enabled modules;
- intake setup state;
- recommended-media readiness;
- warnings, setup actions and Health information.

Assignments remain a popup/work view accessed after Project Overview exists.

## New / Open Choices

The intended New / Open options are:

```text
Blank Starter Project
Template Game
Open Existing Project
```

`Template Game` must not appear as a functioning project choice until the small populated connected-reference project exists and has passed its cross-app validation checklist. It is not Artifacts Adventures.

## Initial Setup Gates

Creation Guide setup should cover these steps:

1. **Define Project Identity** — project name, ID/slug, creator/studio, version, optional description/language, optional project logo reference later.
2. **Connect Project Folder** — connect or re-authorise the writable project root.
3. **Create Blank Starter Project Structure** — create missing starter structural files, directories and empty indexes only.
4. **Initial Asset Intake Setup** — explain and optionally create `intake/` and its six drop buckets; provide **Skip for Now**.
5. **Recommended Starting Media** — non-blocking readiness checklist.
6. **Choose Enabled Modules** — record which apps/features are relevant.
7. **Set Active Project** — register summary and active project selection.
8. **Run Project Readiness Check** — report incomplete setup honestly.

## Blank Starter Project Output

Creation Guide owns initial creation of the following top-level starter files:

```text
project.json
logic.json
layout.json
registry.json
library-links.json
input-map.json
README.md
```

It also creates required directories and empty index files:

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

The exact JSON fields and shapes are canonical only in:

```text
docs/artifex/19a-project-starter-file-schemas.md
```

Creation Guide must not independently populate later app-owned records simply because their folders exist. A blank starter structure is not a populated game.

## Canonical Project Folder Hierarchy

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

The complete hierarchy lists possible project-owned/generated locations. Immediately after a Blank Starter Project is created, Creation Guide creates starter files, required directories and empty indexes only. Health reports, build outputs, backup manifests and app-authored todo/content files are generated later by their owning systems when required.

## Intake and Media Readiness

`intake/` is a staging area, not final runtime storage. The planned visible intake setup section should offer:

```text
Create Intake Folders
Skip for Now
```

and explain:

| Folder | Source material placed here |
|---|---|
| `intake/backgrounds/` | Scene backgrounds, interiors, landscapes, title/ending backgrounds and plates. |
| `intake/characters/` | Player/NPC/interactive/enemy art, portraits and animation/sprite sheets. |
| `intake/objects/` | Props, pickups, doors, transitions, furniture and interactable object art. |
| `intake/icons-ui/` | Logo/title mark, inventory/action icons, markers, HUD/menu elements and frames. |
| `intake/music/` | Music tracks and stingers. |
| `intake/dialogue-sfx/` | Dialogue/voice, ambience, footsteps, UI sounds and SFX. |

Recommended starting-media readiness should remain non-blocking and check for a logo/title mark, background, player asset, NPC asset, interactable object, transition object and icon/UI placeholders.

No permanent scene, screen, quest, archetype or runtime file may reference an intake file directly. Approved source files must be promoted and registered under final `assets/` paths.

## Ownership Boundary

Creation Guide owns:

- initial project onboarding and project summary registration;
- active-project selection;
- initial connected-folder setup actions;
- initial blank structural files/directories/empty indexes;
- future intake explanation/readiness reporting;
- assignments and setup-facing Health information.

Creation Guide does not own populated output from:

- Project Editor structural authoring after initial creation;
- Scene Editor scene/screen content;
- Quest Builder quest content;
- Puzzle Creator puzzle content;
- Archetype Object Creator object records;
- Effect Editor FX records;
- Asset Library promotion/final asset registration;
- Health Guide generated reports;
- Build Game runtime/build output;
- backup generation beyond its own explicit backup/export action.

## Project Health Direction

Creation Guide Health should report, without silently overwriting files:

- missing/invalid project identity;
- missing connected folder or permission required;
- local-draft-only state or conflicts once shared support exists;
- missing starter files/directories/indexes;
- missing or skipped intake setup;
- missing recommended starting media;
- invalid final project-logo reference if configured;
- unresolved links surfaced by shared Health Guide checks;
- assignment blockers and setup actions.

## Current Next Tasks

In order:

1. Resolve the Blank Starter Project `startScreenId` rule: an empty starter should not reference a screen which does not yet exist.
2. Add the visible Initial Asset Intake Setup section and optional intake-folder creation.
3. Add Recommended Starting Media readiness.
4. Add project-logo promotion/reference/display support.
5. Add Template Game choice only after the populated reference project exists and validates.
6. Continue shared Health and all-app active-project/direct-save integration work.