# Project Manager split and patch audit

Status: first audit pass  
Scope: Project Manager / Project Editor  
Source task: `todo_project_manager_15_project_manager_split_patch_audit`

## Current structure

Project Manager has already been split away from a single `index.html` into multiple modules:

- `index.html` — thin loader shell only.
- `src/project-shell.js` — rendered header, menus, sidebar, and workspace containers.
- `src/project-app.v7.js` — app bootstrap and module wiring.
- `src/project-state.js` — project state and storage mutation helpers.
- `src/project-canvas.js` — pan, zoom, drag and canvas controls.
- `src/project-renderer.js` — node and route graph rendering.
- `src/project-ui.js` — base sidebar, catalog, inspector, JSON preview and workspace wiring.
- `src/project-integration-ui.js` — Asset Browser, library mode UI, menu behaviour, and link-to-node behaviour.
- `src/project-node-links-ui.js` — selected-node linked library inspector section.
- `src/project-health-ui.js` — Getting Started / Missing Setup wizard bridge to shared Health Guide.
- `src/project-io.js` — ZIP import/export and project package file handling.
- `src/project-buildprep.js` — Build Prep display using shared Health Guide and todo output.
- `src/project-stitcher.js` — route and Stitcher UI.
- `src/project-route-types.js` — route type definitions.
- `src/project-library-indexes.js` — library index adapter.

## Patch-layer status

No obvious active patch-stack naming is currently being used in Project Manager itself. The risky area is not patch stacking; it is that a few files still have more than one responsibility.

Current active wrapper/enhancer chain in `project-app.v7.js`:

1. `createProjectUI(...)`
2. `enhanceNodeLinkInspector(...)`
3. `enhanceProjectUI(...)`
4. `enhanceProjectHealthUI(...)`
5. `enhanceProjectIO(...)`

This is still acceptable, but it should not keep growing. If another enhancer is needed, split the target module first rather than adding another wrapper layer.

## Files that need follow-up splitting

### `src/project-ui.js`

Risk: high. It still owns several UI concerns at once: catalog/sidebar, inspector, JSON preview, workspace switching, draggable inspector, and top controls.

Recommended split:

- `project-sidebar-ui.js`
- `project-inspector-ui.js`
- `project-json-preview-ui.js`
- `project-workspace-ui.js`
- `project-toolbar-ui.js`

### `src/project-integration-ui.js`

Risk: medium-high. It now owns Asset Browser rendering, menu behaviour, library item preview, search, and link-to-node behaviour.

Recommended split:

- `project-menu-ui.js`
- `project-asset-browser-ui.js`
- `project-asset-linking.js`
- `project-asset-browser-preview.js`

### `src/project-app.v7.js`

Risk: medium. It is currently acceptable as a bootstrap file, but it is versioned as `v7`, which makes it look like a patch-era file even though it is now the active app entry.

Recommended follow-up:

- Rename or replace with `project-app.js` once the app stabilises.
- Keep this file as orchestration only.
- Do not add feature logic here.

## Rules going forward

- Do not add a third active patch/enhancer layer over the Project Manager UI.
- If a file needs another feature, first check whether it belongs in a new focused module.
- Keep `index.html` thin.
- Keep `project-app.v7.js` as bootstrap/orchestration only.
- Keep generated project health and task logic in shared Health Guide modules where possible.
- Do not put Project Tasks / To-Do Board UI inside the selected node inspector by default. That should be a separate workspace with only node-specific tasks mirrored into the inspector later.

## Next recommended implementation tasks

1. Implement `todo_project_manager_16_project_tasks_workspace` as a separate workspace, not inside node inspector.
2. Split `project-integration-ui.js` before adding more Asset Browser logic.
3. Split `project-ui.js` before expanding the inspector per node type.
4. Rename `project-app.v7.js` to a stable active entry once imports/cache keys are settled.
