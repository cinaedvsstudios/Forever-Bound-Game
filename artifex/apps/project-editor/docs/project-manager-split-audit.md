# Project Manager split and patch audit

Status: second audit / Phase 2 verification pass  
Scope: Project Manager / Project Editor  
Current Project Manager version: `v0.1.31 TASKS`  
Source tasks: `todo_project_manager_15_project_manager_split_patch_audit`, `todo_project_manager_16_project_tasks_workspace`

## Current structure

The Project Manager is running the split module structure below on `main`:

- `index.html` — thin loader shell with the `v0.1.31 TASKS` title, theme loader, and `project-app.v7.js?v=0.1.31-tasks` module entry.
- `src/project-shell.js` — header, top menus, sidebar shell, View menu workspace entries, and workspace containers including `tasksWorkspace`.
- `src/project-app.v7.js` — bootstrap, version badge assignment, module wiring, and workspace refresh routing.
- `src/project-state.js` — project state and persistence helpers.
- `src/project-canvas.js` — pan, zoom, node drag, and viewport controls.
- `src/project-renderer.js` — graph node and route rendering.
- `src/project-ui.js` — workspace coordinator that delegates focused rendering to smaller modules.
- `src/project-ui-helpers.js` — shared UI utilities and local preference helpers.
- `src/project-sidebar-ui.js` — sidebar/catalog rendering.
- `src/project-inspector-ui.js` — selected-node/route inspector, inspector drag, and reset-position behaviour.
- `src/project-json-preview-ui.js` — JSON / Split State Preview floating panel.
- `src/project-menu-ui.js` — dropdown menu behaviour and library menu routing.
- `src/project-asset-linking.js` — library-item-to-node link helpers.
- `src/project-integration-ui.js` — Asset Browser workspace integration and search/preview behaviour.
- `src/project-node-links-ui.js` — linked-library inspector section.
- `src/project-health-ui.js` — Getting Started bridge to the shared Health Guide.
- `src/project-io.js` — ZIP import/export and package files.
- `src/project-buildprep.js` — Build Prep and shared health/todo export.
- `src/project-tasks-ui.js` — Project Tasks / To-Do Board workspace rendering, filtering, and detail panel.
- `src/project-stitcher.js` — route editing workspace.
- `src/project-route-types.js` — route type definitions.
- `src/project-library-indexes.js` — library index adapter.

## Completed split status

The second audit confirms these splits are complete for the current Project Manager scope:

- Sidebar/catalogue split is complete; `project-sidebar-ui.js` owns catalogue rendering.
- Inspector split is complete; `project-inspector-ui.js` owns selected-node/route inspector rendering, drag, and reset behaviour.
- JSON / Split State Preview split is complete; `project-json-preview-ui.js` owns the floating preview panel and hide/reset controls.
- Menu behaviour split is complete; `project-menu-ui.js` owns menu open/close behaviour and library target routing.
- Asset linking split is complete; `project-asset-linking.js` owns library link data changes while `project-node-links-ui.js` renders the selected-node link section.
- Project Tasks / To-Do Board workspace is implemented as a standalone workspace.

## Project Tasks workspace ownership

The Project Tasks / To-Do Board is not inside the selected-node inspector. It is a standalone workspace opened from the View menu.

- `project-tasks-ui.js` owns task-board rendering, task generation from the shared Health Guide, filter controls, task card selection, and the selected-task detail panel.
- `project-ui.js` only keeps the `tasksWorkspace` reference, wires workspace switching, sets the `PROJECT TASKS` label, and delegates task rendering through `renderTasksWorkspace()`.
- `project-shell.js` owns the `tasksWorkspace` container and the View menu entry for `Project Tasks / To-Do Board`.
- `project-app.v7.js` keeps bootstrap and refresh routing only; it does not add a wrapper or enhancer layer for the task board.

## Phase 2 verification notes

The Phase 2 verification pass exercised the live `v0.1.31 TASKS` page and then re-tested the targeted cleanup fixes locally. The task board opened, displayed generated tasks, filters worked, and selecting a task updated the detail panel. Verification also found and fixed small runtime issues in the linked-library inspector injection and inspector reset click path.

## Wrapper / patch status

No new global enhancer layer was added for the task workspace. The existing composition remains:

1. `createProjectUI(...)`
2. `enhanceNodeLinkInspector(...)`
3. `enhanceProjectUI(...)`
4. `enhanceProjectHealthUI(...)`
5. `enhanceProjectIO(...)`

New substantial Project Manager work should continue in focused modules rather than new wrapper layers.

## Remaining future work

- Split remaining Manifest/workspace/toolbar logic only if it grows.
- Split `project-integration-ui.js` further later, especially if Asset Browser rendering expands.
- Later consider renaming `project-app.v7.js` to `project-app.js` once entry-file naming is stable.
- Later optionally mirror node-specific tasks into the selected-node inspector.
- Continue broader Project Manager feature work in focused modules, not new wrapper layers.

## Verification status

Target version for this pass is `v0.1.31 TASKS` using cache key `0.1.31-tasks`. Phase 2 repository checks confirm the task workspace files and loader cache keys are present on `main`. Full automated browser verification passed locally after the targeted fixes. The global todo statuses are left in `review` rather than `done` so the user can complete any desired manual review after deployment.
