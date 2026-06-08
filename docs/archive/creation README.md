# Artifex Creation Guide V1.1.10

## Purpose

The Creation Guide is the Artifex project-onboarding, Project Overview, setup guidance, assignment-planning and health-check module.

The live V1.1.10 app currently lets a creator create/open a browser-registered project, complete the current setup fields, set the active project, export a starter ZIP, open assignments and review the current Health panel.

The documented target workflow expands this role: Creation Guide becomes the starting point for connecting the real project folder, initialising starter project files/folders, explaining the `intake/` staging area, reporting starting-media readiness and setting the active project for every Artifex authoring app.

## Required Companion Documentation

Read this README together with:

```text
docs/artifex/05-creation-guide.md
docs/artifex/05a-creation-guide-v119-implementation-notes.md
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/20-asset-intake-workflow.md
artifex/shared/todo-guide/all-apps-todos.json
```

`docs/artifex/19-project-file-contracts.md` defines the target connected-folder/direct-save contract and canonical project package. `docs/artifex/20-asset-intake-workflow.md` defines the source-asset intake folder and recommended starting-media checklist.

## Current Live Version and Script Stack

Visible version:

```text
V1.1.10
```

Live shell:

```text
artifex/apps/creation-guide/index.html
```

Live Creation Guide scripts:

```text
v1/src/app-bootstrap.js
v1/src/onboarding-guide.js
v1/src/project-flow.js
v1/src/project-health.js
v1/src/health-actions.js
```

The final source split is complete. Do not restore or import these retired files:

```text
v1/src/project-flow-health.js
v1/src/module-project-flow-v113.js
v1/src/module-app-v108.js
v1/src/module-guide-onboarding-v112.js
v1/src/module-health-actions-v118.js
```

## What the Live V1.1.10 App Currently Does

Current visible functionality includes:

- Project Overview as the main right-side view.
- Collapsed project setup panel on the left.
- Setup coach inside the Project Overview hero panel.
- Floating module-intro/help popup with hide/reopen behaviour.
- Guided New / Open modal.
- Setup fields for project name, slug, creator, planned local path, optional GitHub path and deployed URL.
- Starter ZIP export.
- Set Active Project through browser project storage.
- Assignments popup.
- Health panel, Refresh, Export Health JSON and Create Fix Assignments.
- Clear Test Data for browser testing.

Current browser storage keys include:

```text
artifex.projectLibrary
artifex.activeProjectId
artifex.creationGuide.hideModuleIntro
artifex.creationGuide.healthAssignmentsCreated.<project-id>
```

## Current Live Limitation

The live app does not yet write directly to the real project folder on the user's computer. It currently registers projects and active-project selection in browser storage and provides ZIP export.

The intended production workflow is now different: once the shared folder service is implemented, the connected real project folder becomes the editable source of truth; `localStorage` remains a recovery-draft layer; ZIP export remains backup, transfer and no-permission fallback only.

## Target Connected Project Folder Workflow

Future intended Creation Guide flow:

```text
Create or open project
→ Connect Project Folder / Re-authorise Project Folder
→ select the real project root and grant read/write access
→ Creation Guide initialises or validates starter files/folders
→ complete or skip the visible Initial Asset Intake Setup section
→ register/set active project
→ Artifex authoring apps load their owned real project files
→ local drafts protect editing work
→ deliberate Save actions write to the connected project folder
→ Health/Audit/Build validates the saved project data
```

Folder handles and permissions are browser/device-specific and must be stored only through the shared IndexedDB-backed folder service. Project files must contain project-relative paths only and must never store private absolute HDD paths.

Future save status UI should expose:

```text
Saved to Project Folder
Local Draft Only
Project File Changed
Conflict
Permission Required
No Folder Connected
Save Failed
```

## Project Overview Target Setup Sections

The planned setup/readiness sections are:

1. Define Project Identity, including an optional project logo/title mark.
2. Connect/Re-authorise Project Folder.
3. Create primary `project.json` file.
4. Initialise/validate starter folder structure.
5. Initial Asset Intake Setup, with explanations, **Create Intake Folders** and **Skip for Now**.
6. Recommended Starting Media checklist.
7. Create/register starter structural files and indexes.
8. Choose enabled modules.
9. Set active project.
10. Run project readiness/health check.

The New / Open flow should eventually support:

```text
Blank Project
Artifex Adventures Template Game
Open Existing Project
```

The Artifex Adventures template option must remain future work until that template game is actually complete and validated.

## Canonical Target Project Folder Structure

Creation Guide should eventually initialise or validate this project-relative structure through the shared connected-folder service:

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

## Intake Setup and Media Readiness

`intake/` is the source-material drop zone. It is separate from final registered `assets/` content. Permanent scene, screen, quest, archetype or runtime records must not reference source files in `intake/` directly.

Creation Guide should explain the intake buckets as follows:

| Folder | Put this here |
|---|---|
| `intake/backgrounds/` | Scene backgrounds, interiors, landscapes, title/ending backgrounds and environmental plates. |
| `intake/characters/` | Player character, NPCs, interactive characters, enemies, portraits and sprite/animation sheets. |
| `intake/objects/` | Props, pickups, doors, passages, transitions, furniture, clue items and interactable object art. |
| `intake/icons-ui/` | Project logo/title mark, inventory/action icons, markers, HUD/menu elements and UI frames. |
| `intake/music/` | Music tracks and musical stingers. |
| `intake/dialogue-sfx/` | Voice/dialogue, narration, ambience, footsteps, UI sounds and environmental SFX. |

Recommended first-scene media checklist:

| Item | Intake destination |
|---|---|
| Project logo or temporary title mark | `intake/icons-ui/` |
| At least 1 scene background | `intake/backgrounds/` |
| At least 1 player-character asset | `intake/characters/` |
| At least 1 NPC asset | `intake/characters/` |
| At least 1 interactable object or pickup | `intake/objects/` |
| At least 1 door/passage/transition object | `intake/objects/` |
| At least 1 icon/UI placeholder set | `intake/icons-ui/` |

This checklist reports readiness and does not block creating a project.

## Module Ownership Boundary

Creation Guide owns:

- initial project creation;
- project registration/selection;
- starter folder/file initialisation once direct folder saving is implemented;
- intake setup explanation and readiness reporting;
- assignments, milestones and setup-health reporting;
- starter input-map data.

Creation Guide does not own:

- Project Editor structural authoring after starter creation;
- Scene Editor scene/screen visual layout;
- Quest Builder quest/condition internals;
- Archetype Object Creator reusable object definitions;
- Effect Editor reusable FX definitions;
- Asset Library promotion/classification of approved intake source files into final assets;
- Build Game runtime packaging.

## Remaining Creation Guide Work

In practical order:

1. Record Creation Guide-specific task items for the new requirements.
2. Adopt the shared connected-project-folder service once its all-app foundation exists.
3. Add Connect/Re-authorise Project Folder and save-state display.
4. Initialise/validate the canonical project folder/file structure.
5. Add Initial Asset Intake Setup with folder explanations and Skip for Now.
6. Add Recommended Starting Media checklist.
7. Add project-logo selection/import/final-reference display.
8. Extend Health for connected folder, local draft, intake, media and logo checks.
9. Add the Artifex Adventures Template Game choice only once its project is validated.
10. Reuse shared Health Guide checks as the shared system becomes available.

## Final-Split QA URL

```text
https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/creation-guide/?fresh=creation-guide-1.1.10-final-split-complete
```

The page should request:

```text
app-bootstrap.js
onboarding-guide.js
project-flow.js
project-health.js
health-actions.js
```

It must not request:

```text
project-flow-health.js
module-project-flow-v113.js
```
