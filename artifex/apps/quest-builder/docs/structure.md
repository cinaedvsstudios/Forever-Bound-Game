# Quest Builder Structure Guide

## Required references before editing

Before changing this app, inspect:

```text
docs/artifex/07-quest-builder.md
docs/artifex/07a-quest-builder-structured-authoring.md
docs/artifex/07b-puzzle-creator-quest-integration.md
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/21-template-game-project-contract.md
docs/artifex/22-sound-archetype-generator.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
artifex/apps/quest-builder/docs/todo.md
artifex/apps/quest-builder/docs/block-taxonomy.md
```

`07a` locks the first-version decision that Quest-specific dialogue and Capra feedback are edited contextually inside Quest Builder, not through a new top-level Dialogue Editor app.

`07b` locks the Puzzle Creator handoff: a completed saved puzzle may become a meaningful Quest Builder flow block through `puzzleId`, but its internal puzzle definition remains owned by Puzzle Creator.

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

The live Module menu must eventually display **Project Editor**, not **Project Manager**, through a normal versioned app edit.

No renderer code, no dialog code, no quest data mutation.

### `v1/src/block-types.js`

Block taxonomy only: block names, emojis, colours, source module mapping, required fields, helper lookup, and title-case helper.

When the structured-authoring implementation begins, this file must reflect:

- Quest-specific dialogue is Quest Builder-owned, not a required separate Dialogue Library app;
- `puzzle` is a meaningful block type using primary/required field `puzzleId` and referencing a Puzzle Creator-owned record;
- Puzzle internals must never be stored as block type metadata.

No UI binding and no canvas drawing.

### `v1/src/quest-schema.js`

Quest file, quest, block and explicit connection defaults. Also small schema-safe helpers such as list parsing and HTML escaping.

When implementation reaches structured authoring, this module may define schema defaults for block actions, requirements, outcomes, Quest-scoped dialogue/Capra records and linked puzzle-block references. The final export shape must be defined and validated deliberately rather than added as untracked free-text fields.

No DOM binding and no rendering.

### `v1/src/layout-state.js`

Saved UI layout state only: left panel width, Quest Flow window position/size, vertical/horizontal mode, collapse state, zoom, pan, snap-to-grid preference, stored canvas card positions, and clamp helper.

No quest data and no dialog code.

### `v1/src/ui-bindings.js`

DOM events and controls: menus, buttons, inline editing, panel resize, floating Quest Flow drag/resize, workspace pan, snap toggle, lock/collapse controls, and standard action wiring.

Keep heavy rendering and schema definitions out of this file.

### `v1/src/canvas-renderer.js`

Viewing panel only: quest header, Calling pill, START/END nodes, flow cards, visible connector rendering, colours used while drawing, fine grid display, canvas transform, and draw helpers.

The canvas presents meaningful Quest flow blocks. It should not automatically turn every dialogue line, condition check, failure response, puzzle internal rule or outcome into a separate visual card.

No localStorage and no dialog behaviour.

### `v1/src/connection-routing.js`

Connector display routing only: resolve the nearest visible edge between connected nodes and provide attachment points for left, right, top and bottom edges.

This module controls how explicit connections are drawn in the workspace. It must not invent quest connections, change quest order, own saved layout state, or become runtime progression logic.

### `v1/src/dialog-editors.js`

Current Quest/block editor dialog and New Quest Wizard behaviour.

For structured authoring, the existing block editing flow should grow contextual sections for:

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

A larger **Open Dialogue / Feedback** screen may launch from the selected block when ordered lines need more room, but it remains part of Quest Builder and saves Quest Builder-owned dialogue data. It is not a new top-level Dialogue Editor module.

A future `Puzzle` block editor should provide a `puzzleId` selector sourced from the real connected `puzzles/puzzle-index.json`, plus an Open Linked Puzzle action where project navigation supports it. It must not embed Puzzle Creator's internal editor into Quest Builder.

If dialogue or structured-rule authoring grows beyond this module's responsibility, split it into normal Quest Builder modules; do not add active patch wrappers.

No canvas drawing and no global layout persistence.

### Future `v1/src/structured-rules.js` or equivalent normal module

Not yet implemented. When required, this module should own editor-safe helpers and validation for structured actions, requirements, conditions, success outcomes and failure outcomes.

It must not control visual canvas routing or project-folder saving.

### Future `v1/src/dialogue-records.js` or equivalent normal module

Not yet implemented. When required, this module should own Quest-scoped dialogue and Capra line editing helpers, record validation and display-mode data used by Quest Builder.

It may store stable references to portraits and audio assets, but it must not create a separate global dialogue library contract or duplicate reusable media files inside Quest data.

### Future `v1/src/puzzle-links.js` or equivalent normal module

Not yet implemented. If linked-puzzle selection and validation requires sufficient logic, this module should read available registered puzzle records, resolve `puzzleId` display information, and report unresolved references.

It must not save puzzle definitions, author puzzle internals or copy a puzzle's JSON into Quest data.

### `v1/src/export-json.js`

Game-readable export and validation warnings. This is where canonical Quest/Sidequest output, structured action/dialogue validation and linked `puzzleId` validation should be defined.

The direct project-root targets are:

```text
quests/quest-index.json
quests/quest_<slug>.json
sidequests/sidequest-index.json
sidequests/sidequest_<slug>.json
```

It may read `puzzles/puzzle-index.json` for validation once connected-project support exists; it must not write `puzzles/` files.

Do not use `projects/<project-id>/...` as the connected-folder save destination; the selected folder is already the project root.

No UI drawing.

## Rule for future changes

If a requested change touches more than one responsibility, split it into separate edits rather than dumping all logic into one file.

If a file grows over roughly 500 lines or mixes unrelated work, split it before adding new features.

Quest Builder should not add active patch layers unless there is no other option. If a patch is added, it must be tracked in `todo.md` with a removal/integration plan.

Documentation-only decisions do not require a live app version increment. Any runtime/UI implementation edit must follow the app version rule in `todo.md`.