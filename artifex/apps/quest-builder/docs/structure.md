# Quest Builder Structure Guide

## Required references before editing

Before changing this app, inspect:

```text
docs/artifex/07-quest-builder.md
docs/artifex/07a-quest-builder-structured-authoring.md
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
artifex/apps/quest-builder/docs/todo.md
artifex/apps/quest-builder/docs/block-taxonomy.md
```

`docs/artifex/07a-quest-builder-structured-authoring.md` locks the first-version decision that Quest-specific dialogue and Capra feedback are edited contextually inside Quest Builder, not through a new top-level Dialogue Editor app.

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

Version, app labels, storage keys, design size, grid size, theme accent, thumbnail list, and shared core Module menu list.

No renderer code, no dialog code, no quest data mutation.

### `v1/src/block-types.js`

Block taxonomy only: block names, emojis, colours, source module mapping, required fields, helper lookup, and title-case helper.

Once the structured-authoring implementation begins, this file must reflect the locked ownership decision that Quest-specific dialogue is a Quest Builder-owned record, not a required link to a separate Dialogue Library app.

No UI binding and no canvas drawing.

### `v1/src/quest-schema.js`

Quest file, quest, block and explicit connection defaults. Also small schema-safe helpers such as list parsing and HTML escaping.

When implementation reaches structured authoring, this module may define schema defaults for block actions, requirements, outcomes and Quest-scoped dialogue/Capra records, provided that the final export shape is defined and validated deliberately rather than added as untracked free-text fields.

No DOM binding and no rendering.

### `v1/src/layout-state.js`

Saved UI layout state only: left panel width, Quest Flow window position/size, vertical/horizontal mode, collapse state, zoom, pan, snap-to-grid preference, stored canvas card positions, and clamp helper.

No quest data and no dialog code.

### `v1/src/ui-bindings.js`

DOM events and controls: menus, buttons, inline editing, panel resize, floating Quest Flow drag/resize, workspace pan, snap toggle, lock/collapse controls, and standard action wiring.

Keep heavy rendering and schema definitions out of this file.

### `v1/src/canvas-renderer.js`

Viewing panel only: quest header, Calling pill, START/END nodes, flow cards, visible connector rendering, colours used while drawing, fine grid display, canvas transform, and draw helpers.

The canvas presents meaningful Quest flow blocks. It should not automatically turn every dialogue line, condition check, failure response or outcome into a separate visual card.

No localStorage and no dialog behaviour.

### `v1/src/connection-routing.js`

Connector display routing only: resolve the nearest visible edge between connected nodes and provide attachment points for left, right, top and bottom edges.

This module controls how explicit connections are drawn in the workspace. It must not invent quest connections, change quest order, own saved layout state, or become runtime progression logic.

### `v1/src/dialog-editors.js`

Current Quest/block editor dialog and New Quest Wizard behaviour.

For the next structured-authoring implementation, the existing block editing flow should grow contextual sections for:

```text
Summary
Action
Requirements / Conditions
Success Outcomes
Failure / Capra Feedback
Dialogue / Presentation
Linked Assets and IDs
Validation
```

A larger **Open Dialogue / Feedback** screen may be launched from the selected block when ordered lines need more room, but it remains part of Quest Builder and saves Quest Builder-owned quest dialogue data. It is not a new top-level Dialogue Library / Dialogue Editor module.

If dialogue authoring logic grows beyond this module's responsibility, split it into a normal Quest Builder module such as `dialogue-records.js`; do not add an active patch wrapper.

No canvas drawing and no global layout persistence.

### Future `v1/src/structured-rules.js` or equivalent normal module

Not yet implemented. When required, this module should own editor-safe helpers and validation for structured actions, requirements, conditions, success outcomes and failure outcomes.

It must not control visual canvas routing or project-folder saving.

### Future `v1/src/dialogue-records.js` or equivalent normal module

Not yet implemented. When required, this module should own Quest-scoped dialogue and Capra line editing helpers, record validation and display-mode data used by Quest Builder.

It may store stable references to portraits and audio assets, but it must not create a separate global dialogue library contract or duplicate reusable media files inside Quest data.

### `v1/src/export-json.js`

Game-readable export and validation warnings. This is where the future canonical quest/sidequest export shapes and structured action/dialogue validation should be defined.

The direct project-root targets are:

```text
quests/quest-index.json
quests/quest_<slug>.json
sidequests/sidequest-index.json
sidequests/sidequest_<slug>.json
```

Do not use `projects/<project-id>/...` as the connected-folder save destination; the selected folder is already the project root.

No UI drawing.

## Rule for future changes

If a requested change touches more than one responsibility, split it into separate edits rather than dumping all logic into one file.

If a file grows over roughly 500 lines or mixes unrelated work, split it before adding new features.

Quest Builder should not add active patch layers unless there is no other option. If a patch is added, it must be tracked in `todo.md` with a removal/integration plan.

Documentation-only decisions do not require a live app version increment. Any later runtime/UI implementation edit must follow the app version rule in `todo.md`.