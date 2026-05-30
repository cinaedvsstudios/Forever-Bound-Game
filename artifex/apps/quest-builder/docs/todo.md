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

Current Quest Builder version in repository: `V1.2.10`

Current browser confirmation status:

- `V1.2.9` was tested sufficiently to confirm that the live version badge loaded, the editor pencil action still opened the correct block popup, and cards could be manually moved in the central workspace.
- Testing exposed that ordered automatic lines were not a valid long-term flow model once blocks could be manually arranged and branched.
- `V1.2.10` has now been built in the repository as the first explicit-connection foundation pass and still requires GitHub Pages/browser testing.

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

Status: built in repository; awaiting browser testing.

Purpose: replace automatic sequence-line assumptions with deliberate node connections without introducing a patch layer or refactoring the app shell.

Implemented:

- Added `connections` to the quest data model in `quest-schema.js`, plus `START` and `END` node IDs and stable connection creation helper.
- Converted the demo `Recover the Chalice` flow into explicit saved connections, including a conditional wrong-cup feedback branch and return link.
- Replaced ordered automatic connector drawing in `canvas-renderer.js` with explicit connection rendering.
- Added visible input/output connector circles around nodes, including available spare ports for creating additional links.
- Added thicker connector lines that inherit the colour of the source block.
- Added drag-from-output-port to input-port authoring in `quest-builder-app.js`.
- Added line selection and Delete/Backspace removal of a selected connection.
- Kept moving cards as layout-only behaviour; movement does not rewire connections.
- Kept floating Quest Flow list dragging separate; changing list order does not rewire connections.
- New blocks and template-created blocks now begin loose and unconnected, with guidance text/toasts explaining how to connect them.
- Removing a block removes only connections that directly reference that deleted block.
- Runtime export now includes `flow.connections`, while block array order is treated only as `displayOrder` rather than inferred flow logic.
- Validation now reports missing START/END routes, broken connection references, unconnected blocks, unreachable blocks and completion blocks not linked to END.
- Updated page/version/cache references to `V1.2.10` / `1.2.10`.

Not implemented in this pass:

- Dynamic workspace/canvas expansion near lower or right edges.
- Moveable/saved START and END positions.
- Insert Space horizontal guide tool.
- Advanced line routing around overlapping cards or route labels shown on the canvas.

## V1.2.10 browser test checklist

Open the new fresh test URL after GitHub Pages updates and verify:

1. The badge shows `V1.2.10`.
2. The page loads without a blank canvas or obvious JavaScript failure.
3. The demo flow is no longer a single ordered chain: the lines show the deliberate connections and the wrong-cup branch.
4. Connector lines are thicker and match the colour of the source block.
5. Visible connector circles appear on START, END and the flow cards.
6. Drag from an unused output connector circle on one block to an input connector circle on another block; a new line should appear.
7. Click a connector line and press Delete; only that connection should disappear.
8. Add a new block; it should appear loose/unconnected rather than automatically joining the flow.
9. Move a card; existing connections should follow the card but not change their logical source/destination.
10. Pencil editor controls should still open the correct block editor.
11. Hand/pan mode should still pan instead of moving cards or creating connections.
12. JSON Preview and Export Project Files should include explicit `flow.connections` data and validation warnings for loose blocks where applicable.
13. View → Reset Saved Layout should reset visual positions but must not delete explicit quest connections.

## Next specific-app work after V1.2.10 testing

Only proceed after browser test results are reported.

Likely next version if the foundation works:

```text
V1.2.11 — dynamic workspace expansion and manual layout space management
```

Required remaining Quest Builder-specific work:

- Grow the logical workspace when cards approach the lower/right boundary and keep comfortable blank padding.
- Allow START/END endpoints to be positioned consistently in the expanded workspace, without inferring quest logic from position.
- Add a horizontal `Insert Space` tool: place/drag a temporary guide line, then move every node below that line downward together while preserving connections.
- Consider a vertical equivalent only after the horizontal tool is tested and useful.
- Improve connector routing only where crowded diagrams make the current paths unreadable.

## Version rule

Every Quest Builder app edit must increase the visible version by `0.01` and update the page title, visible version badge, CSS cache key, JavaScript/module cache keys, renderer asset keys and loaded/fallback text where present.
