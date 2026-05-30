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

Current Quest Builder version in repository: `V1.2.9`

Current live confirmation status: awaiting GitHub Pages/browser confirmation for draggable workspace cards and saved positions.

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
artifex/apps/quest-builder/icons/start.png
artifex/apps/quest-builder/icons/finish.png
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
- Added quick emoji actions in the status strip.
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

### V1.2.4 — Viewing-panel density and endpoint polish

Status: complete.

- Reduced oversized text and spacing in the left contextual inspector.
- Reduced the viewport zoom/pan/reset control footprint.
- Merged the quest heading and Calling content into one canvas header card.
- Converted START and END into circular endpoint nodes.

### V1.2.5 — Custom endpoint icon display

Status: complete.

- Integrated the committed custom `start.png` and `finish.png` endpoint artwork.
- Reduced icon size, moved START/END labels inside their nodes, and darkened the endpoint surfaces to match the canvas header.

### V1.2.6 — Status-strip styling alignment

Status: complete.

- Replaced the bright green left-panel Editing strip with the dark green/charcoal treatment used by the canvas header and endpoint circles.
- Kept the actions visible as compact green-accent controls.

### V1.2.7 — Workspace pencil edit controls initial pass

Status: superseded by V1.2.8 bugfix.

- Added interactive pencil hit zones for the canvas quest header and each large canvas block card.
- Added pencil actions in the floating Quest Flow rows and quest list.
- Browser test failed: visible pencil icons still did not open the editor reliably.

### V1.2.8 — Workspace pencil interaction bugfix

Status: complete.

- Corrected canvas hit testing at transformed zoom/pan display sizes, avoiding double application of canvas transforms.
- Pencil actions run before pan-mode selection blocking, so hand/pan mode no longer suppresses edit clicks.
- Canvas and list pencil actions call the existing editor popup directly for the correct selected quest or block.
- User confirmed the pencil actions work in the browser.

### V1.2.9 — Draggable workspace cards and saved positions

Status: built, awaiting browser confirmation.

- Large canvas flow cards can now be dragged directly around the viewing workspace when hand/pan mode is off.
- Added `blockPositions` to saved layout state, keyed by quest ID and block ID, so each moved card restores to its saved location after refresh.
- Manual positioning is a view/layout setting only; it does not change quest sequence or runtime export order.
- Quest Flow list drag ordering remains the way to change logical block sequence.
- Reworked connector rendering so lines follow the manual card locations from START through each ordered card to END.
- Added a small drag-handle mark to each large canvas card.
- `View ▾ → Reset Saved Layout` now also clears saved card positions through the existing layout reset.
- Updated page entry, displayed version, stylesheet cache key, JavaScript/module cache keys, renderer asset keys and schema imports to `V1.2.9` / `1.2.9`.

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

Every Quest Builder edit must increase the visible version by `0.01` and update the page title, visible version badge, CSS cache key, JS/module cache keys, renderer asset keys and loaded/fallback text where present.

Next version after confirmation:

```text
V1.2.10  draggable workspace browser verification and usability polish, if required
```

## Current checks needed

- Confirm the app loads as `V1.2.9`.
- With the hand button off, drag a large canvas flow card to a different place; the connector lines should redraw to it.
- Refresh the page using the same URL; the moved card should remain in its saved position.
- Turn the hand/pan button on; dragging the workspace should still pan rather than moving an individual card.
- Click a card pencil after moving it; the correct block editor should still open.
- Drag a Quest Flow list item if you want to test logical ordering separately from visual placement.

## Specific-app tasks

```json
[]
```
