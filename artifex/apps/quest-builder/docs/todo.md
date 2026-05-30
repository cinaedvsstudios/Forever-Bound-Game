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

## Current repository status

Current Quest Builder version in repository: `V1.2.11`

Current browser confirmation status:

- `V1.2.9` was tested sufficiently to confirm the live version badge loaded, pencil edit still opened the correct block popup, and cards could be manually moved in the central workspace.
- `V1.2.10` was tested in GitHub Pages and confirmed to load as `V1.2.10`, display explicit coloured connector lines and visible connector ports. User feedback identified that the empty-port display was too crowded, disconnecting was not sufficiently direct, and vertical/near-vertical route attachments needed cleaner left-side routing.
- `V1.2.11` is now built in the repository as a focused connector usability cleanup and requires GitHub Pages/browser confirmation.

Current active app files:

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

Older V1.0.8 files remain only as imported base styling/reference; old V1.0.8 JavaScript must not be loaded by the live app:

```text
artifex/apps/quest-builder/v1/quest-builder-v108.css
artifex/apps/quest-builder/v1/quest-builder-v108.js
```

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

## Completed phases summary

### V1.0.9 to V1.2.2 — foundation, shell, editing and export

Status: complete/browser-confirmed where previously recorded.

- Split the app into responsibility-based active modules.
- Established the approved core Module flyout, simplified File menu, contextual left inspector, dark/green visual shell, popup editors and block taxonomy.
- Added bundle export, export self-check, export summary and split Quest Builder project-file downloads.
- User confirmed the project-file export produces the correct quest/sidequest-owned files.

### V1.2.3 — floating Quest Flow drag ordering

Status: built; retain as a separate list-order behaviour.

- Floating Quest Flow cards can be dragged to reorder the block list.
- This must remain separate from workspace positioning and explicit logical connection editing.

### V1.2.4 to V1.2.8 — workspace visual density, endpoints and edit actions

Status: complete/browser-confirmed for pencil action fix.

- Reduced panel/control density.
- Changed START/END to dark circular icon nodes using the custom endpoint assets.
- Styled the left Editing strip consistently with the dark workspace.
- Added and fixed pencil edit controls; user confirmed the correct block editor opens from the workspace.

### V1.2.9 — draggable workspace cards and saved positions

Status: partially browser-confirmed; superseded as a flow-rendering model by the explicit-connection direction.

- Large canvas cards can be manually positioned as visual layout state only.
- Stored card positions in `layout-state.js` under `blockPositions`.
- User confirmed card movement works in the live screen.
- Testing showed that drawing a line automatically through the ordered blocks is incorrect for branches and manual layouts.

### V1.2.10 — explicit connection foundation

Status: browser-tested; required usability cleanup completed in V1.2.11.

- Added explicit `connections` quest data, plus `START` and `END` flow node IDs.
- Converted the demo quest to explicit saved lines and branch data.
- Replaced automatic sequence-line drawing with explicit source-coloured connector rendering.
- Added connector authoring and runtime/export validation for explicit flow connections.
- User confirmed the new version visibly loaded and the connection model appeared on the live canvas.
- User identified the next corrections: remove unnecessary empty circles, allow directly clearing a connection from its attached circle, add a dedicated per-card connect action, and route vertical stacked connections from the left side rather than through the cards.

### V1.2.11 — connector usability and routing cleanup

Status: built in repository; awaiting browser testing.

Purpose: implement the direct connector feedback from the V1.2.10 browser test without introducing patch files or changing the broader workspace architecture.

Implemented:

- Removed the permanently displayed spare connector-circle clutter. Only circles for connections that actually exist are now drawn.
- Added a `🔗` connect action beside the pencil on each workspace block card.
- Added a START connect handle so a blank/new quest can deliberately begin its first flow connection.
- Changed connection authoring so dragging the `🔗` handle onto another block or END creates the required attachment circle automatically on the destination; a free target circle is no longer required beforehand.
- Made connected attachment circles directly removable: clicking a circle clears that attached connection. Keyboard Delete/Backspace remains available after selecting a line.
- Added saved `sourceSide` and `targetSide` fields to the connection data model and export data.
- Added side-choice logic for new connections: largely vertical/stacked links use left-side routing, while ordinary forward links use right-to-left routing.
- Adjusted the demo connection placement so the stacked Collect Chalice → Update Codice connection routes down the left side rather than drawing through the card interior.
- Preserved the rule that moving cards is visual only and does not alter connection logic.
- Updated page title, badge, stylesheet, main module, internal module cache references and renderer icon cache keys to `V1.2.11` / `1.2.11`.

Not implemented in this pass:

- Dynamic workspace/canvas expansion near lower or right edges.
- Moveable/saved START and END positions.
- Insert Space horizontal guide tool.
- Fully advanced obstacle-avoiding line routing or branch labels displayed on the canvas.

## V1.2.11 browser test checklist

Open the new fresh test URL after GitHub Pages updates and verify:

1. The badge shows `V1.2.11` and the page loads normally.
2. Only connector circles attached to existing lines are visible; the rows of unused empty circles are gone.
3. Each block card now has a `🔗` action beside its pencil.
4. Click an existing attached connector circle; the associated line should be removed immediately.
5. Drag a card's `🔗` action onto another block; a new connector line and required destination circle should appear automatically.
6. Drag a card's `🔗` action onto END; it should connect to END where valid.
7. The Collect Chalice → Update Codice stacked route should run from the left side and no longer cut through the cards in the way shown during the V1.2.10 test.
8. Normal forward routes remain source-coloured and readable.
9. Move a block; the existing lines should follow it without changing logical connections.
10. Pencil icons still open the correct editor popup.
11. Hand/pan mode still pans instead of moving cards or creating links.
12. JSON Preview should contain `flow.connections`, including `sourceSide` and `targetSide` fields.
13. View → Reset Saved Layout should reset visual positions but not delete explicit quest connections.

## Next specific-app work after V1.2.11 testing

Only proceed after browser test results are reported.

Likely next version after the connector interaction is confirmed:

```text
V1.2.12 — dynamic workspace expansion and manual layout space management
```

Required remaining Quest Builder-specific work:

- Grow the logical workspace when cards approach the lower/right boundary and keep comfortable blank padding.
- Allow START/END endpoints to be positioned consistently in the expanded workspace, without inferring quest logic from position.
- Add a horizontal `Insert Space` tool: place/drag a temporary guide line, then move every node below that line downward together while preserving connections.
- Consider a vertical equivalent only after the horizontal tool is tested and useful.
- Improve connector routing only where crowded diagrams make current paths unreadable after testing.

## Version rule

Every Quest Builder app edit must increase the visible version by `0.01` and update the page title, visible version badge, CSS cache key, JavaScript/module cache keys, renderer asset keys and loaded/fallback text where present.
