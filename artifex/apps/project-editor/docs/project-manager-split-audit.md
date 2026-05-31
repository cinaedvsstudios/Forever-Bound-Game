# Project Manager split and patch audit

Status: cleanup consolidation pass complete
Scope: Project Manager / Project Editor
Current Project Editor version: `v0.1.32 CONTRACT`
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

The active Project Editor entry no longer constructs the app through nested enhancer wrappers. `project-app.v7.js` now creates the state/canvas/renderer, registers Asset Browser and Getting Started workspace renderers explicitly, registers the linked-library inspector section through an inspector extension contract, and wires import/browser-draft/backup-export actions in one explicit action wiring stage.

`project-theme-overrides.css` was replaced by `project-theme-styles.css`, a permanent live theme stylesheet for tokens and classes still consumed by current markup. Temporary monolith-compatibility comments and unused purple/pink override blocks were removed.

New substantial functionality should continue to be added through focused modules rather than wrapper layers.

## Remaining future work

- Split remaining Manifest/workspace/toolbar logic only if `project-ui.js` grows again.
- Split `project-integration-ui.js` further later if Asset Browser display, preview, or search logic grows.
- Possibly rename `project-app.v7.js` to `project-app.js` later once entry-file naming is stable.
- Optionally mirror node-specific tasks into the selected-node inspector later.
- Continue implementing new work in focused modules, not wrapper layers.
- Keep connected-folder loading/saving open for the next pass; Project Editor remains browser-draft/backup-ZIP only.

## Verification note

Live deployment verification for `v0.1.31 TASKS` has been completed successfully on the GitHub Pages deployment. The verified pass confirmed that Flatplan, the Project Tasks / To-Do Board workspace, inspector drag/reset, menus, and workspace switching are working. The Asset Browser was verified to open correctly and show its proper empty state because no asset index has yet been imported. No console errors or blank screens were reported. Asset Browser item search/link/unlink remains untested until a real imported index and library item exist; this is untested, not broken.


## 2026-05-31 cleanup verification

Local browser smoke testing used `http://127.0.0.1:4173/artifex/apps/project-editor/?fresh=project-editor-clean-module-composition-test`. The page loaded without local 404s or console errors, kept the `v0.1.32 CONTRACT` title/version, and rendered Asset Browser, Getting Started/shared Health and Project Tasks workspaces after the explicit composition refactor.
