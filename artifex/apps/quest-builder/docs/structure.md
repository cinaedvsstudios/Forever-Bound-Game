# Quest Builder Structure Guide

## Required references before editing

Before changing this app, inspect:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
artifex/apps/quest-builder/docs/todo.md
```

## Active app entry

```text
artifex/apps/quest-builder/index.html
artifex/apps/quest-builder/v1/quest-builder.css
artifex/apps/quest-builder/v1/src/quest-builder-app.js
```

`index.html` must stay thin. It owns the static shell only: header, menus, panels, workspace, dialogs, and imports.

## Module responsibilities

### `v1/quest-builder.css`

Styling entry point only. It may import older style files while the visual shell is being stabilized, but new layout/style work should move into this file or clearly named CSS modules, not into JavaScript.

### `v1/src/quest-builder-app.js`

Main app orchestrator. It may create app state, connect modules, call boot/render, and expose the shared `app` object passed to other modules.

It should not grow into the full app again. If a feature has a clear domain, move it into the relevant module below.

### `v1/src/module-config.js`

Version, app labels, storage keys, design size, theme accent, thumbnail list, and shared core Module menu list.

No renderer code, no dialog code, no quest data mutation.

### `v1/src/block-types.js`

Block taxonomy only: block names, emojis, colours, source module mapping, required fields, helper lookup, and title-case helper.

No UI binding and no canvas drawing.

### `v1/src/quest-schema.js`

Quest file, quest, and block defaults. Also small schema-safe helpers such as list parsing and HTML escaping.

No DOM binding and no rendering.

### `v1/src/layout-state.js`

Saved UI layout state only: left panel width, Quest Flow window position/size, vertical/horizontal mode, collapse state, zoom, pan, and clamp helper.

No quest data and no dialog code.

### `v1/src/ui-bindings.js`

DOM events and controls: menus, buttons, inline editing, panel resize, floating Quest Flow drag/resize, workspace pan, lock/collapse controls, and standard action wiring.

Keep heavy rendering and schema definitions out of this file.

### `v1/src/canvas-renderer.js`

Viewing panel only: quest header, Calling pill, START/END nodes, flow cards, colours used while drawing, canvas transform, and draw helpers.

No localStorage and no dialog behaviour.

### `v1/src/dialog-editors.js`

Quest/block editor dialog and New Quest Wizard behaviour.

No canvas drawing and no global layout persistence.

### `v1/src/export-json.js`

Game-readable export and validation warnings. This is where the future `quest-index.json`, `quest_<slug>.json`, `sidequest-index.json`, and `sidequest_<slug>.json` export shapes should be defined.

No UI drawing.

## Rule for future changes

If a requested change touches more than one responsibility, split it into separate edits rather than dumping all logic into one file.

If a file grows over roughly 500 lines or mixes unrelated work, split it before adding new features.

Quest Builder should not add active patch layers unless there is no other option. If a patch is added, it must be tracked in `todo.md` with a removal/integration plan.
