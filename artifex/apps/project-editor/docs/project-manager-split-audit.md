# Project Manager split and patch audit

Status: second audit / Phase 2 verification pass
Scope: Project Manager / Project Editor
Current Project Manager version: `v0.1.31 TASKS`
Source task: `todo_project_manager_15_project_manager_split_patch_audit`

## Current structure

The Project Manager is split into focused modules with the Project Tasks / To-Do Board implemented as a standalone workspace:

- `index.html` — thin loader shell.
- `src/project-shell.js` — header, menus, sidebar shell, View menu entry, and workspace containers including the Project Tasks workspace container.
- `src/project-app.v7.js` — bootstrap and module wiring only.
- `src/project-state.js` — project state and persistence helpers.
- `src/project-canvas.js` — pan, zoom, and drag controls.
- `src/project-renderer.js` — graph node and route rendering.
- `src/project-ui.js` — delegates rendering to focused UI modules and manages workspace switching.
- `src/project-ui-helpers.js` — shared UI utilities.
- `src/project-sidebar-ui.js` — catalogue/sidebar rendering.
- `src/project-inspector-ui.js` — selected-node/route inspector and drag/reset behaviour.
- `src/project-json-preview-ui.js` — Split State Preview / JSON preview panel.
- `src/project-menu-ui.js` — dropdown behaviour and library menu routing.
- `src/project-asset-linking.js` — library-item-to-node link helpers.
- `src/project-integration-ui.js` — Asset Browser display and search behaviour.
- `src/project-node-links-ui.js` — linked-library inspector section.
- `src/project-health-ui.js` — Getting Started bridge to shared Health Guide.
- `src/project-io.js` — ZIP import/export and package files.
- `src/project-buildprep.js` — Build Prep and health/todo export.
- `src/project-tasks-ui.js` — task-board rendering, filtering, and selected-task details for the Project Tasks / To-Do Board workspace.
- `src/project-stitcher.js` — route editing workspace.
- `src/project-route-types.js` — route type definitions.
- `src/project-library-indexes.js` — library index adapter.

## Completed split verification

Verified for this Phase 2 pass:

- Sidebar split complete.
- Inspector split complete.
- JSON / Split State Preview split complete.
- Menu behaviour split complete.
- Asset linking split complete.
- Project Tasks / To-Do Board workspace complete as a standalone workspace.
- `project-tasks-ui.js` owns task-board rendering, filtering, and task details.
- `project-ui.js` delegates task rendering and manages workspace switching.
- `project-shell.js` owns the View menu entry and workspace container for Project Tasks.

## Project Tasks workspace

`src/project-tasks-ui.js` provides the main task browser outside the selected-node inspector. It reads saved `stateManager.state.projectTodos` when present or generates tasks through the shared Health Guide and todo-output modules.

It displays generated date, title, description, status, priority, effort, fix owner, related modules, source, task ID, and tags. It includes filters for status, owner/module, and priority, a selected-task detail panel, and a regenerate action.

## Wrapper / patch status

No new global enhancer layer was added for the task workspace. The existing composition remains:

1. `createProjectUI(...)`
2. `enhanceNodeLinkInspector(...)`
3. `enhanceProjectUI(...)`
4. `enhanceProjectHealthUI(...)`
5. `enhanceProjectIO(...)`

New substantial functionality should continue to be added through focused modules rather than another wrapper layer.

## Remaining future work

- Split remaining Manifest/workspace/toolbar logic only if `project-ui.js` grows again.
- Split `project-integration-ui.js` further later if Asset Browser display, preview, or search logic grows.
- Possibly rename `project-app.v7.js` to `project-app.js` later once entry-file naming is stable.
- Optionally mirror node-specific tasks into the selected-node inspector later.
- Continue implementing new work in focused modules, not additional wrapper layers.

## Verification note

This audit records the Phase 2 local verification target for `v0.1.31 TASKS` using cache key `0.1.31-tasks`. Live deployment verification remains outside this proposed-change pass until the reviewed diff is merged.
