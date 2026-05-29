# Creation Guide V1.1.10 Final Split Implementation Notes

Date: 2026-05-29

These notes describe the current working Creation Guide implementation after the V1.1.10 source-cleanup pass and final direct script split.

## Current Live Purpose

Creation Guide is currently the Artifex project setup and production-control surface. It starts with project onboarding, then moves into Project Overview, setup guidance, active-project saving, assignments and project readiness checks.

The app is not yet the full shared project runtime. The live V1.1.10 app creates and tracks project metadata, exports starter files and stores the active project in browser storage. The future connected-project-folder workflow, initial intake setup, real direct-save contract, project-logo support and cross-app project loading are documented requirements but are not yet implemented in this live version.

## Current State: Creation Guide V1.1.10 Final Split

The live app shell is:

```text
artifex/apps/creation-guide/index.html
```

The current live Creation Guide script stack is:

```text
artifex/apps/creation-guide/v1/src/app-bootstrap.js
artifex/apps/creation-guide/v1/src/onboarding-guide.js
artifex/apps/creation-guide/v1/src/project-flow.js
artifex/apps/creation-guide/v1/src/project-health.js
artifex/apps/creation-guide/v1/src/health-actions.js
```

`index.html` loads `project-flow.js`, `project-health.js` and `health-actions.js` directly. The previous project-flow/health wrapper and old combined implementation are no longer active and are no longer present in the repository.

## Removed / Retired Files

The following stale or transitional source files have been removed from the live source tree:

```text
artifex/apps/creation-guide/v1/src/project-flow-health.js
artifex/apps/creation-guide/v1/src/module-project-flow-v113.js
artifex/apps/creation-guide/v1/src/module-app-v108.js
artifex/apps/creation-guide/v1/src/module-guide-onboarding-v112.js
artifex/apps/creation-guide/v1/src/module-health-actions-v118.js
```

Do not restore or import these files during future Creation Guide work.

## Current Version

Current visible version:

```text
V1.1.10
```

The version should appear consistently in:

```text
index.html page title
visible version badge
stylesheet cache key
app-bootstrap.js cache key
onboarding-guide.js cache key
project-flow.js cache key
project-health.js cache key
health-actions.js cache key
runtime toast text
```

The live app remains `V1.1.10` until a new user-facing feature is deliberately added.

## Current User Flow

1. Open Creation Guide.
2. If the module intro is not hidden, the floating module intro appears.
3. The creator can step through the Artifex module explanations.
4. The creator can tick **Don’t show this module intro again**.
5. The intro can be reopened from **Help > What are the modules?**.
6. The creator moves into Project Setup.
7. The setup coach opens the left panel and walks through the current fields.
8. Project Overview remains the main right-side viewing panel.
9. The creator can create/open projects through the guided New/Open popup.
10. The creator can export the current starter project ZIP.
11. The creator can save and set the active project in browser storage.
12. The creator can open Assignments as a popup window.
13. The creator can run/read the Health panel.
14. The creator can create fix assignments from missing Health items.
15. The creator can export a Health JSON report.

## Current UI Features

### Module Intro

The floating module-intro popup currently explains the Artifex modules and can be reopened through Help. It provides Back, More Detail, Skip Intro, Next Module/Set Up Project and **Don’t show this module intro again** controls. Expanded detail scrolls inside the popup.

The hide preference is stored as:

```text
artifex.creationGuide.hideModuleIntro
```

### Setup Coach

The Project Setup coach lives in the Project Overview hero/info box. It provides Back, Open Panel/Show Me Where, More Info, Module Intro and Next/Done controls.

### Project Overview Toolbar

Current toolbar actions:

```text
🗂️ New / Open
✅ Set Active
📦 Export ZIP
🩺 Health
📋 Assignments
🧹 Clear Test Data
Dashboard sort dropdown
Status text
```

### Guided New / Open Project Flow

The current New Project modal collects:

```text
Project name
Project ID / slug
Creator / Studio
Local folder / planned path
Use GitHub repo path
GitHub username
Online path preview
Optional deployed URL
```

Open Existing currently reads the browser Project Library and sets the selected project as active.

The current browser storage keys are:

```text
artifex.projectLibrary
artifex.activeProjectId
```

### Project Health Panel

Current health checks include:

```text
Project identity
Creator metadata
Local project folder
GitHub repo path
Deployed URL
Starter files exported
Active project saved
Assignments started
Cross-app project loading
```

The Health panel supports:

```text
📋 Create Fix Assignments
⬇️ Export Health JSON
🔄 Refresh
```

Duplicate generated health assignments are avoided per project using:

```text
artifex.creationGuide.healthAssignmentsCreated.<project-id>
```

Export Health JSON currently downloads a report shaped as:

```text
artifex.health-report.v1
```

## Current Boundaries and Future Contracts

Creation Guide and Hub can currently identify/set the active project in browser storage, but the other authoring apps do not yet load that project's real owned files into their internal runtime state.

The global task for that is:

```text
todo_all_apps_active_project_runtime_integration
```

The newer project-file contract now additionally requires a shared connected-project-folder service. Creation Guide should eventually be the starting surface for connecting a writable project folder, creating/validating starter folders and files, explaining/creating the root-level `intake/` staging area and reporting recommended starting-media readiness.

These are future implementation tasks. The live V1.1.10 app must not be described as already writing directly to the HDD or already displaying the intake/media/logo setup UI.

Relevant specification files:

```text
docs/artifex/05-creation-guide.md
docs/artifex/19-project-file-contracts.md
docs/artifex/20-asset-intake-workflow.md
artifex/shared/todo-guide/all-apps-todos.json
```

## Completed Source-Cleanup Stage

Completed in this pass:

```text
Working Project Overview and onboarding UI retained
Final visible version kept at V1.1.10
Direct project-flow / project-health / health-actions script loading enabled
Transitional project-flow/health wrapper retired
Old combined project-flow implementation retired
Stale earlier onboarding/health/app source files retired
```

## Remaining Creation Guide Tasks

Before adding major UI features, record and work through the remaining Creation Guide-specific tasks in this order:

1. Align the app README and task records with the final split and new connected-folder/intake specification.
2. Adopt the shared connected-project-folder service once that foundation exists: Connect Project Folder, Re-authorise Project Folder and clear save-state display.
3. Implement initial project-folder/file structure creation through the shared service.
4. Add the visible Initial Asset Intake Setup section with folder explanations, Create Intake Folders and Skip for Now.
5. Add the Recommended Starting Media checklist.
6. Add project logo intake/import/final-reference support and display.
7. Extend Health checks for folder permission, local-draft state, intake setup, media readiness and project-logo reference.
8. Add Artifex Adventures Template Game selection only once that template is complete and validated.
9. Reuse shared Health Guide checks as the shared system matures.

## Live QA URL

Use a fresh cache value when checking the final split:

```text
https://cinaedvsstudios.github.io/Forever-Bound-Game/artifex/apps/creation-guide/?fresh=creation-guide-1.1.10-final-split-complete
```

Expected direct requests include:

```text
app-bootstrap.js
onboarding-guide.js
project-flow.js
project-health.js
health-actions.js
```

The page must not request:

```text
project-flow-health.js
module-project-flow-v113.js
```
