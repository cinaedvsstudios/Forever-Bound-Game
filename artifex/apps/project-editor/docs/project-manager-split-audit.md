# Project Manager split and patch audit

Status: second audit pass; pending live verification  
Scope: Project Manager / Project Editor  
Source task: `todo_project_manager_15_project_manager_split_patch_audit`

## Current structure

The Project Manager has been split into focused modules:

- `index.html` — thin loader shell.
- `src/project-shell.js` — header, menus, sidebar shell, and workspace containers.
- `src/project-app.v7.js` — bootstrap and module wiring only.
- `src/project-state.js` — project state and persistence helpers.
- `src/project-canvas.js` — pan, zoom, and drag controls.
- `src/project-renderer.js` — graph node and route rendering.
- `src/project-ui.js` — workspace coordinator.
- `src/project-ui-helpers.js` — shared UI utilities.
- `src/project-sidebar-ui.js` — catalogue/sidebar rendering.
- `src/project-inspector-ui.js` — selected-node/route inspector and drag/reset behaviour.
- `src/project-json-preview-ui.js` — Split State Preview panel.
- `src/project-menu-ui.js` — dropdown behaviour and library menu routing.
- `src/project-asset-linking.js` — library-item-to-node link helpers.
- `src/project-integration-ui.js` — Asset Browser display and search behaviour.
- `src/project-node-links-ui.js` — linked-library inspector section.
- `src/project-health-ui.js` — Getting Started bridge to shared Health Guide.
- `src/project-io.js` — ZIP import/export and package files.
- `src/project-buildprep.js` — Build Prep and health/todo export.
- `src/project-tasks-ui.js` — Project Tasks / To-Do Board workspace.
- `src/project-stitcher.js` — route editing workspace.
- `src/project-route-types.js` — route type definitions.
- `src/project-library-indexes.js` — library index adapter.

## Completed in this split pass

Implemented on `main`, awaiting live-page confirmation:

- Shared helper extraction.
- Sidebar/catalogue split.
- Inspector split, including drag and reset position.
- Split State Preview / JSON preview split.
- Menu behaviour split.
- Asset-linking split.
- Project Tasks / To-Do Board as a separate workspace.

## Project Tasks workspace

`src/project-tasks-ui.js` provides the main task browser outside the selected-node inspector. It reads saved `stateManager.state.projectTodos` when present or generates tasks through the shared Health Guide and todo-output modules.

It displays generated date, title, description, status, priority, effort, fix owner, related modules, source, task ID and tags. It includes filters for status, owner/module and priority, a selected-task detail panel, and a regenerate action.

## Wrapper / patch status

No new global enhancer layer was added for the task workspace. The existing composition remains:

1. `createProjectUI(...)`
2. `enhanceNodeLinkInspector(...)`
3. `enhanceProjectUI(...)`
4. `enhanceProjectHealthUI(...)`
5. `enhanceProjectIO(...)`

New substantial functionality should continue to be added through focused modules rather than another wrapper layer.

## Remaining future work

- Split Manifest/workspace/toolbar logic only if `project-ui.js` grows again.
- Split Asset Browser rendering and preview/search logic out of `project-integration-ui.js` in a future cleanup pass.
- Later consider renaming `project-app.v7.js` to `project-app.js` once entry-file naming is stable.
- Later optionally mirror node-specific tasks into the selected-node inspector.

## Verification required

Target version for this pass is `v0.1.31 TASKS` using cache key `0.1.31-tasks`. Before marking related tasks complete, test GitHub Pages with a fresh cache key and confirm the task workspace, filters, detail panel, Flatplan, inspector, menus, and Split State Preview all work without console errors.
