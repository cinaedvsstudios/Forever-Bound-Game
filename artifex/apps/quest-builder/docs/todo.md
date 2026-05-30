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

Current Quest Builder version in repository: `V1.2.12`

Current browser confirmation status:

- `V1.2.9` was tested sufficiently to confirm the live version badge loaded, pencil edit opened the correct block popup, and cards could be manually moved in the central workspace.
- `V1.2.10` was tested in GitHub Pages and confirmed to load, display explicit coloured connector lines and visible connector ports. Testing identified that unused port circles were cluttered and stacked line routing needed refinement.
- The user's V1.2.11 live screenshot confirmed the cleaned connector interface was loaded, including the per-card link action and reduced connector clutter. The screenshot also identified the next problem: vertically stacked connected cards were still using left/right attachments rather than the shortest top/bottom route.
- `V1.2.12` has now been built in the repository for fine-grid snapping and smart shortest-edge connector display. It requires GitHub Pages/browser confirmation.

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
artifex/apps/quest-builder/v1/src/connection-routing.js
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

Status: partially browser-confirmed; superseded as a flow-rendering model by explicit connections.

- Large canvas cards can be manually positioned as visual layout state only.
- Stored card positions in `layout-state.js` under `blockPositions`.
- User confirmed card movement works in the live screen.
- Testing showed that drawing a line automatically through ordered blocks is incorrect for branches and manual layouts.

### V1.2.10 — explicit connection foundation

Status: browser-tested; required usability cleanup progressed in V1.2.11.

- Added explicit `connections` quest data, plus `START` and `END` flow node IDs.
- Converted the demo quest to explicit saved logical lines and branch data.
- Replaced automatic sequence-line drawing with explicit source-coloured connector rendering.
- Added connector authoring and runtime/export validation for explicit flow connections.
- User confirmed the new connection model appeared on the live canvas.

### V1.2.11 — connector usability and routing cleanup

Status: displayed in live browser screenshot; further routing improvement requested.

- Removed permanently displayed spare connector-circle clutter; only attached connector circles are shown.
- Added a `🔗` connect action beside the pencil on each workspace card.
- Added a START connection handle.
- Made attached connector circles directly removable while retaining Delete/Backspace line removal.
- Allowed new links to create required destination attachment circles automatically.
- Initial left/right side-routing cleanup still did not solve vertically stacked card layouts cleanly.

### V1.2.12 — fine grid, snap mode and smart shortest-edge connectors

Status: built in repository; awaiting browser testing.

Purpose: implement the requested smaller grid and make connector attachment follow the card positions rather than being forced onto left/right edges.

Implemented:

- Changed the visual workspace grid to a finer `40` design-pixel spacing, retaining slightly stronger lines every `80` pixels for readability.
- Added a compact `🧲` Snap to Grid control beside the hand/pan control in the top-right viewport controls.
- Added saved layout preference `snapToGrid`, defaulting to off so existing positions are not unexpectedly rearranged.
- When snap is enabled, cards snap to the smaller grid as they are dragged; existing cards remain where they are until moved.
- Re-clamped snapped positions after rounding so cards cannot be pushed beyond the currently fixed canvas bounds.
- Added normal module `connection-routing.js`, rather than a patch layer, for connector display routing responsibilities.
- Smart connector routing now evaluates left, right, top and bottom edges and chooses the shortest visible edge pair for each existing logical connection.
- Routing recalculates while cards are moved, so a vertical card stack can switch to bottom-to-top connectors and a horizontal relationship can remain side-to-side.
- Kept connector line colour derived from the source block.
- Kept `🔗` link creation and click-attached-circle removal from V1.2.11.
- Kept logical connections separate from visual routing: the export now records each logical connection with `routingMode: "smart-shortest"`, rather than exporting fixed edge/port placement as quest progression data.
- Updated page title, visible badge, CSS cache key, main script key, internal module cache keys, icon asset cache keys and module loaded version text to `V1.2.12` / `1.2.12`.
- Updated `docs/structure.md` to document `connection-routing.js` as visual routing only, not quest logic.

Not implemented in this pass:

- Dynamic workspace/canvas expansion near lower or right edges.
- Moveable/saved START and END positions.
- Insert Space horizontal guide tool.
- Obstacle-avoiding connector routing around unrelated overlapping cards.
- Manual connector side override when a shortest route is visually undesirable.

## V1.2.12 browser test checklist

Open the fresh test URL after GitHub Pages updates and verify:

1. The badge shows `V1.2.12` and the page loads normally.
2. The workspace grid is visibly smaller/finer than V1.2.11.
3. A `🧲` button appears directly beside the hand/pan button and shows an active glow when enabled.
4. With snap off, a dragged card moves freely; with snap on, a dragged card aligns to the smaller grid.
5. Enabling snap does not suddenly rearrange existing cards before they are moved.
6. Vertically arranged connected cards, such as Enter Church / Collect Chalice / Update Codice when stacked, attach using top/bottom edges when those are shortest.
7. Moving a connected card changes its visible connector edge automatically when another edge becomes shortest, without changing the logical source/destination.
8. Horizontal routes remain readable and use the colour of the source block.
9. The `🔗` create-connection action still creates a line, and clicking an attached circle still removes its connection.
10. Pencil edit controls still open the correct editor popup.
11. Hand/pan mode still pans instead of moving cards or creating links.
12. JSON Preview contains logical `flow.connections` with `routingMode: "smart-shortest"`, not fixed side placement used as game logic.
13. View → Reset Saved Layout resets visual positions and snap preference, but does not delete quest connections.

## Next specific-app work after V1.2.12 testing

Only proceed after browser test results are reported.

Likely next version if this interaction works:

```text
V1.2.13 — dynamic workspace expansion and manual layout space management
```

Required remaining Quest Builder-specific work:

- Grow the logical workspace when cards approach the lower/right boundary and keep comfortable blank padding.
- Allow START/END endpoints to be positioned consistently in the expanded workspace, without inferring quest logic from position.
- Add a horizontal `Insert Space` tool: place/drag a temporary guide line, then move every node below that line downward together while preserving connections.
- Consider a vertical equivalent only after the horizontal tool is tested and useful.
- Consider obstacle-avoiding connector routing only if smart nearest-edge routing still creates unacceptable line collisions in realistic layouts.

## Version rule

Every Quest Builder app edit must increase the visible version by `0.01` and update the page title, visible version badge, CSS cache key, JavaScript/module cache keys, renderer asset keys and loaded/fallback text where present.
