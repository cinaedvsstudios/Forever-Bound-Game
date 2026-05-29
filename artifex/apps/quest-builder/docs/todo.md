# Quest Builder To-Do / Change Plan

## Required reference files before editing

Before changing Quest Builder, always inspect:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
artifex/apps/quest-builder/docs/structure.md
artifex/apps/quest-builder/docs/block-taxonomy.md
```

Use the global all-apps to-do list for changes that affect every Artifex app. Use this file only for Quest Builder-specific work.

## Current live status

Current Quest Builder version in repository: `V1.2.4`

Current live confirmation status: awaiting GitHub Pages/browser confirmation for `V1.2.4`.

Current app files:

```text
artifex/apps/quest-builder/index.html
artifex/apps/quest-builder/v1/quest-builder.css
artifex/apps/quest-builder/v1/src/quest-builder-app.js
artifex/apps/quest-builder/v1/src/module-config.js
artifex/apps/quest-builder/v1/src/block-types.js
artifex/apps/quest-builder/v1/src/quest-schema.js
artifex/apps/quest-builder/v1/src/layout-state.js
artifex/apps/quest-builder/v1/src/ui-bindings.js
artifex/apps/quest-builder/v1/src/canvas-renderer.js
artifex/apps/quest-builder/v1/src/dialog-editors.js
artifex/apps/quest-builder/v1/src/export-json.js
```

Older V1.0.8 files remain only as imported base styling/reference; no old V1.0.8 JavaScript should be loaded by the live app:

```text
artifex/apps/quest-builder/v1/quest-builder-v108.css
artifex/apps/quest-builder/v1/quest-builder-v108.js
```

## Completed phases

### V1.0.9 — Structure cleanup

Status: complete.

- Split behaviour into responsibility-based modules.
- Kept `index.html` as the shell and moved taxonomy, schema, layout, rendering, dialogs, UI wiring, and export behaviour into named modules.
- User confirmed the split app loaded correctly in GitHub Pages.

### V1.1.0 — Module menu / shared shell alignment

Status: complete.

- Added `File ▾ → Module ▸` as a side flyout containing only the core modules: Hub, Creation Guide, Project Manager, Scene Editor, Quest Builder, Puzzle Creator, Effect Editor, and Archetype Object Creator.
- Excluded utility tools such as Sprite Wizard, Font Packer, Frame Extractor, and Onda.
- Kept green as the Quest Builder accent on the dark Artifex shell.

### V1.1.1 — File menu simplification

Status: complete.

- Grouped New and Save commands into flyouts.
- Kept Import JSON as an immediate File action.
- Changed New Quest so it adds a quest rather than resetting the quest file.

### V1.1.2 — Left panel refinement

Status: complete.

- Added useful tooltips, retained resizing, and stabilised inline editing while typing.
- Added selection/edit affordances to list rows.

### V1.1.3 — Contextual inspector and status actions

Status: complete.

- Changed the left panel into a contextual inspector for the selected quest or block.
- Added quick emoji actions in the green status strip.
- Added canvas selection hit-testing compatible with zoom and pan.

### V1.1.4 — Viewing panel warnings and flow card polish

Status: complete.

- Improved selected states, linked summaries, missing-field warnings, ready/audio states, START/END anchors, and connector arrows.

### V1.1.5 — Block taxonomy and validation

Status: complete.

- Added `docs/block-taxonomy.md`.
- Locked block names, colours, emojis, source modules, primary fields, required fields, and validation behaviour.
- Connected taxonomy to inspector fields, template defaults, JSON validation, and the Block Type List.

### V1.1.6 — Better editor popup

Status: complete.

- Replaced the large field stack with grouped tabbed editor sections.
- Added thumbnail/icon inputs for quests and blocks.

### V1.1.7 — Export JSON and validation

Status: complete.

- Export now produces the `artifex.questExportBundle.v1` shape.
- Added quest/sidequest index and runtime file targets.
- Separated runtime metadata, links, flow blocks, gameplay, feedback, and validation warnings.

### V1.1.8 — Post-export verification / bugfix

Status: complete.

- Added `exportSelfCheck`.
- Tightened missing Project Manager-resolvable link and targeted-action warnings.

### V1.1.9 — Export summary UI

Status: complete.

- JSON Preview now shows bundle summary, warning/check counts, generated paths, and roles.

### V1.2.0 — Verification and next-phase planning

Status: complete.

- Reconfirmed active split files and promoted functional work into V1.2.x.

### V1.2.1 — Split-file export/package download

Status: complete.

- Kept `Export JSON Bundle` for one review/transfer bundle.
- Added `Export Project Files` under `File ▾ → Save ▸`.
- Downloads loose project-package JSON files using double-underscore filename paths.
- Added `splitExportPlan`; deliberately deferred ZIP packaging to a future shared exporter.

### V1.2.2 — Split export verification

Status: complete.

- User confirmed the current demo quest produces the correct three project quest files: quest index, empty sidequest index, and the main quest runtime file.
- Confirmed Quest Builder only exports the quest/sidequest slice of the project package.

### V1.2.3 — Quest Flow drag ordering

Status: built, awaiting direct browser interaction confirmation.

- Quest Flow list cards can be dragged onto another card to reorder the selected quest block array.
- Added the `↕` drag indicator, drop-target highlight, automatic workspace redraw, retained selected block, and movement confirmation toast.
- Kept reordering in the floating Quest Flow list; canvas blocks remain the visual workspace.
- Stabilised drag start so selecting a block does not interrupt the drag gesture.

### V1.2.4 — Viewing-panel density and endpoint polish

Status: built, awaiting GitHub Pages/browser confirmation and optional custom icon assets.

- Reduced oversized text and spacing in the left contextual inspector.
- Reduced the viewport zoom/pan/reset control footprint.
- Merged the quest heading and Calling content into one cleaner canvas header card.
- Changed START and END from large rectangular boxes to solid circular endpoint nodes with labels underneath.
- Added image-loading support for custom endpoint assets at:
  - `artifex/apps/quest-builder/icons/start.png`
  - `artifex/apps/quest-builder/icons/finish.png`
- Added safe fallback symbols when those PNG files are not yet present in GitHub.
- Updated module imports/cache keys, CSS entry, page title, visible version badge, and module config to `V1.2.4` / `1.2.4`.

## Ownership boundary

Quest Builder owns quest library records, side quest records, branches, player action steps, conditions/flags, rewards/unlocks, progression logic, quest-specific UI/Capra assignments, and links from quest blocks to relevant module IDs.

Quest Builder does not own scene/screen visual layout, Scene Editor object placement, Flatplan map positioning, object archetype definitions, FX archetype definitions, raw dialogue library ownership, or raw audio asset ownership.

## Export target

Quest Builder exports the quest package targets:

```text
projects/<project-id>/quests/quest-index.json
projects/<project-id>/quests/quest_<slug>.json
projects/<project-id>/sidequests/sidequest-index.json
projects/<project-id>/sidequests/sidequest_<slug>.json
```

Project Manager should reference quest and side quest IDs. It should not author quest internals directly.

## Version plan

Every Quest Builder edit must increase the visible version by `0.01` and update the page title, visible version badge, CSS cache key, JS/module cache key, and loaded/fallback text where present.

Next version after confirmation:

```text
V1.2.5  finish endpoint-icon integration and drag-ordering polish, if required by browser testing
```

## Current checks needed

- Confirm the app loads as `V1.2.4`.
- Confirm the side-panel text and viewport controls are more compact.
- Confirm the canvas header now contains title, metadata, and Calling content in one card.
- Confirm START and END render as solid circular endpoint nodes.
- Add the real `start.png` and `finish.png` files to the GitHub path above if the custom endpoint art should appear instead of fallback symbols.
- Test dragging a Quest Flow card onto another card and confirm the main canvas redraws in the new order.

## Specific-app tasks

```json
[]
```
