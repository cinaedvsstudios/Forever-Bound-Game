# Creation Guide V1.1.9 Implementation Notes

Date: 2026-05-27

These notes describe the current working Creation Guide implementation after the V1.1.9 integration pass.

## Current Live Purpose

Creation Guide is currently the Artifex project setup and production-control surface. It starts with project onboarding, then moves into Project Overview, setup guidance, active-project saving, assignments, and project readiness checks.

The app is not yet the full shared project runtime. It creates and tracks project metadata, exports starter files, and stores the active project in browser storage, but the other apps still need their own internal active-project integration work.

## Current Live Files

The live app shell is:

```text
artifex/apps/creation-guide/index.html
```

The current live script stack is intentionally kept to three active scripts:

```text
artifex/apps/creation-guide/v1/src/module-app-v108.js
artifex/apps/creation-guide/v1/src/module-guide-onboarding-v112.js
artifex/apps/creation-guide/v1/src/module-project-flow-v113.js
```

The separate health-actions patch file was removed after the health actions were integrated into `module-project-flow-v113.js`.

## Current Version

Current visible version:

```text
V1.1.9
```

The version should appear consistently in:

```text
index.html page title
visible version badge
module-project-flow-v113.js runtime version override
script cache key
```

## Current User Flow

1. Open Creation Guide.
2. If the module intro is not hidden, the floating module intro appears.
3. The creator can step through the Artifex module explanations.
4. The creator can tick **Don’t show this module intro again**.
5. The intro can always be reopened from **Help > What are the modules?**.
6. The creator moves into Project Setup.
7. The setup coach opens the left panel and walks through the fields.
8. Project Overview remains the main right-side viewing panel.
9. The creator can create/open projects through the guided New/Open popup.
10. The creator can export the starter project folder ZIP.
11. The creator can save and set the active project.
12. The creator can open Assignments as a popup window.
13. The creator can run/read the Health Check panel.
14. The creator can create fix assignments from missing Health Check items.
15. The creator can export a Health JSON report.

## Module Intro

The module intro is a floating popup because it contains enough text that it should not live inside the Project Overview hero box.

It currently explains:

```text
Artifex Hub
Creation Guide
Project Editor
Scene Editor
Quest Builder
Object Creator
Effect Editor
Asset + Object Libraries
Build Game
```

Controls:

```text
Back
More detail
Skip intro
Next module / Set up project
Don’t show this module intro again
```

The expanded More Detail content scrolls inside its own inner box rather than scrolling the whole popup.

The hide preference is stored as:

```text
artifex.creationGuide.hideModuleIntro
```

## Setup Coach

The Project Setup coach lives in the Project Overview info box.

The top row contains compact icon controls:

```text
← Back
☰ / 📍 Open panel or Show me where
ℹ️ More info
🧭 Module intro
→ Next
✓ Done on final step
```

The step counter is pinned to the bottom-right corner of the info box so it does not collide with the Ready / Needs Input pill.

Each setup step has a More Info panel opened by the `ℹ️` button.

## Project Overview Toolbar

The toolbar uses small buttons with emoji labels.

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

The old `Project Overview` text label was removed from the toolbar.

## Guided New / Open Project Flow

The `New / Open` flow is a modal popup.

New Project collects:

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

Open Existing reads the browser Project Library and sets the selected project as active.

The shared browser storage keys are:

```text
artifex.projectLibrary
artifex.activeProjectId
```

## Project Health Panel

The Project Health panel is a readiness view inside Project Overview.

Current checks:

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

The health score counts required items separately from optional warnings.

The cross-app project loading item intentionally remains a warning because Hub and Creation Guide can set the active project, but the other apps still need to map that project into their own real state.

## Health Actions

The Health Check panel currently supports:

```text
📋 Create Fix Assignments
⬇️ Export Health JSON
🔄 Refresh
```

Create Fix Assignments turns missing/warning health items into normal Creation Guide assignments.

Duplicate health assignments are avoided per project using browser storage:

```text
artifex.creationGuide.healthAssignmentsCreated.<project-id>
```

Export Health JSON downloads a report shaped as:

```text
artifex.health-report.v1
```

## Active Project Boundary

Creation Guide and Hub now handle active-project selection.

However, this does not mean every app really opens the selected project yet.

The global task for that is:

```text
todo_all_apps_active_project_runtime_integration
```

That task lives in:

```text
artifex/shared/todo-guide/all-apps-todos.json
```

The important distinction is:

```text
Shared active-project client can identify the project.
Each app must still adopt that project into its own real runtime state.
```

Scene Editor exposed this issue first: it can show or receive the active project, but its internal editor state still needs to load the correct project scenes/indexes instead of default/demo data.

## Current Technical Debt

The app is stable enough for current testing, but the file names still show their patch history:

```text
module-app-v108.js
module-guide-onboarding-v112.js
module-project-flow-v113.js
```

Next cleanup should rename/reorganise these into normal module names before more feature work piles up.

Suggested future structure:

```text
v1/src/app-shell.js
v1/src/project-model.js
v1/src/project-library.js
v1/src/project-export.js
v1/src/assignment-model.js
v1/src/assignment-ui.js
v1/src/onboarding-guide.js
v1/src/project-flow.js
v1/src/project-health.js
v1/src/health-actions.js
v1/src/ui-bindings.js
```

## Next Practical Steps

1. Test V1.1.9 live after cache refresh.
2. Confirm health actions still work after integration.
3. Confirm no separate `module-health-actions-v118.js` is loaded.
4. Rename/restructure Creation Guide source files into normal module names.
5. Move Project Health logic toward shared Health Guide once the UI is stable.
6. Keep active-project runtime integration as a separate all-apps task.
