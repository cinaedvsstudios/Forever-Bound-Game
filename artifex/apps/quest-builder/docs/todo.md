# Quest Builder To-Do / Change Plan

## Required reference files before editing

Before changing Quest Builder, always inspect:

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
artifex/apps/quest-builder/docs/structure.md
artifex/apps/quest-builder/docs/block-taxonomy.md
```

Use the global all-apps to-do list for changes that affect every Artifex app. Use this file only for Quest Builder-specific work.

## Current repository status

Current Quest Builder live-app version in repository: `V1.2.12`

Current browser confirmation status:

- `V1.2.9` was tested sufficiently to confirm the live version badge loaded, pencil edit opened the correct block popup, and cards could be manually moved in the central workspace.
- `V1.2.10` was tested in GitHub Pages and confirmed to load, display explicit coloured connector lines and visible connector ports. Testing identified that unused port circles were cluttered and stacked line routing needed refinement.
- The user's V1.2.11 live screenshot confirmed the cleaned connector interface was loaded, including the per-card link action and reduced connector clutter. The screenshot also identified the next problem: vertically stacked connected cards were still using left/right attachments rather than the shortest top/bottom route.
- The user's V1.2.12 live screenshot and reply confirmed the fine-grid/smart-routing presentation appeared acceptable, including visible top/bottom connection routing and the new snap control. Full checklist regression testing was not separately reported for every action.

Documentation-only decisions added after the V1.2.12 build do not alter the live-app version. The current documentation now locks structured Quest authoring, Quest-scoped dialogue direction, Project Editor naming and the Puzzle Creator-to-Quest Builder handoff before later implementation begins.

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

## Locked naming direction

The structural/Flatplan app is named **Project Editor** in user-facing UI and documentation.

- Do not add new user-facing **Project Manager** labels.
- The current live Quest Builder Module flyout still displays **Project Manager** and must be corrected in a later normal versioned app edit.
- Historical code identifiers, stored todo filenames and machine-readable task IDs using `project-manager` require deliberate migration/compatibility handling; do not bulk rename them without checking reads/writes.

## Ownership boundary

Quest Builder owns Quest and Side Quest records, branches, player/game-event operations, progression conditions/flags, rewards/unlocks, Quest-specific UI/Capra assignments, Quest-scoped dialogue records, and meaningful linked puzzle steps that reference a saved `puzzleId`.

Quest Builder does not own scene/screen visual layout, Scene Editor object placement, Project Editor Flatplan positioning/routes, object archetype definitions, FX archetype definitions, reusable promoted portrait/voice/audio assets, final reusable media asset ownership, or the internal authored definition of a puzzle.

First-version dialogue ownership decision:

- Quest-specific NPC dialogue, Mel dialogue, narration and Capra feedback are edited contextually inside Quest Builder.
- Do not create a separate top-level Dialogue Library / Dialogue Editor app merely to author dialogue for a Quest.
- Reusable portrait/audio media remain registered external assets rather than being duplicated inside Quest data.
- A global reusable dialogue library is a later option only if cross-Quest reuse, localisation or voice-management requirements prove it necessary.

Puzzle handoff decision:

- Puzzle Creator authors a self-contained challenge and eventually registers it as `puzzles/puzzle_<slug>.json` in `puzzles/puzzle-index.json`.
- Quest Builder must eventually provide a meaningful `Puzzle` flow block using a stable `puzzleId` selected from the real puzzle index.
- The Quest block owns Quest-level requirements and outcomes around the challenge; it must not copy maze cells, symbol layouts, puzzle features or full puzzle data.
- Project Editor may consume public Quest/flag/puzzle completion results only when wider route structure needs them.

## Export target

Quest Builder's eventual connected-folder save targets are:

```text
quests/quest-index.json
quests/quest_<slug>.json
sidequests/sidequest-index.json
sidequests/sidequest_<slug>.json
```

The selected connected folder is already the project root. Do not use `projects/<project-id>/...` as the direct-save destination. Project Editor may reference Quest and Side Quest IDs, completion flags and public result references; it must not author Quest internals directly.

Quest Builder may later read `puzzles/puzzle-index.json` to select and validate linked puzzles. It must not write `puzzles/` content.

## Completed phases summary

### V1.0.9 to V1.2.2 — foundation, shell, editing and export

Status: complete/browser-confirmed where previously recorded.

- Split the app into responsibility-based active modules.
- Established the approved core Module flyout, simplified File menu, contextual left inspector, dark/green visual shell, popup editors and block taxonomy.
- Added bundle export, export self-check, export summary and split Quest Builder project-file downloads.
- User confirmed the project-file export produces the existing quest/sidequest-owned downloads; canonical connected-folder schema/path alignment remains separate pending implementation work.

### V1.2.3 — floating Quest Flow drag ordering

Status: built; retain as a separate list-order behaviour.

- Floating Quest Flow cards can be dragged to reorder the block list.
- This must remain separate from workspace positioning and explicit logical connection editing.

### V1.2.4 to V1.2.8 — workspace visual density, endpoints and edit actions

Status: complete/browser-confirmed for pencil action fix.

- Reduced panel/control density.
- Changed START/END to dark circular icon nodes using custom endpoint assets.
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

Status: displayed in live browser screenshot; further routing improvement requested and addressed in V1.2.12.

- Removed permanently displayed spare connector-circle clutter; only attached connector circles are shown.
- Added a `🔗` connect action beside the pencil on each workspace card.
- Added a START connection handle.
- Made attached connector circles directly removable while retaining Delete/Backspace line removal.
- Allowed new links to create required destination attachment circles automatically.

### V1.2.12 — fine grid, snap mode and smart shortest-edge connectors

Status: live presentation accepted by user; full regression checklist remains available if later debugging is needed.

Implemented:

- Finer `40` design-pixel grid with slightly stronger lines every `80` pixels.
- Compact `🧲` Snap to Grid control beside the hand/pan control.
- Saved `snapToGrid` layout preference, defaulting off so existing positions are not unexpectedly rearranged.
- Card snap behaviour during dragging, with positions clamped inside the current fixed canvas.
- Normal `connection-routing.js` module for visual connector routing.
- Smart connector routing evaluating left, right, top and bottom edges and selecting the shortest visible connection for each logical connection.
- Connector colour retained from the source block.
- Existing `🔗` link creation and attached-circle disconnection behaviour retained.
- Logical connections kept separate from visual routing through `routingMode: "smart-shortest"` export metadata.

Not implemented in this pass:

- Dynamic workspace/canvas expansion near lower or right edges.
- Moveable/saved START and END positions.
- Insert Space horizontal guide tool.
- Obstacle-avoiding connector routing around unrelated cards.
- Manual connector-side override where a shortest route is visually undesirable.

### Documentation decision — structured authoring and dialogue inside Quest Builder

Status: documented; no live UI implementation yet.

Documentation:

```text
docs/artifex/07a-quest-builder-structured-authoring.md
artifex/apps/quest-builder/docs/block-taxonomy.md
artifex/apps/quest-builder/docs/structure.md
artifex/apps/quest-builder/docs/todo.md
```

Locked direction:

- No separate Dialogue Library / Dialogue Editor app for the first version.
- A Quest block remains a meaningful progression event; dialogue lines, conditions, outcomes and most failed-attempt responses live inside the relevant block editor rather than becoming automatic canvas cards.
- The selected block editor should eventually provide structured Action, Requirements / Conditions, Success Outcomes, Failure / Capra Feedback, Dialogue / Presentation, Linked Assets and Validation sections.
- An **Open Dialogue / Feedback** screen may open from a block but remains inside Quest Builder.
- Reusable portrait/audio assets remain external registered references.
- Exact export-safe JSON for actions, outcomes and dialogue records must be defined during implementation with validation.

### Documentation decision — Puzzle Creator handoff and Project Editor terminology

Status: documented; no live Quest Builder Puzzle block or navigation-label implementation yet.

Documentation:

```text
docs/artifex/07b-puzzle-creator-quest-integration.md
docs/artifex/02-module-architecture.md
docs/artifex/07-quest-builder.md
docs/artifex/10-artifex-tool-hierarchy.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
artifex/apps/puzzle-creator/README.md
artifex/apps/quest-builder/docs/block-taxonomy.md
artifex/apps/quest-builder/docs/structure.md
```

Locked direction:

- User-facing module name is **Project Editor**, not Project Manager.
- Puzzle Creator owns self-contained puzzle definitions and future canonical `puzzle_` records.
- Quest Builder must eventually insert a completed saved puzzle as a meaningful `Puzzle` flow block with `puzzleId`.
- Quest Builder owns progression/story outcomes around puzzle completion, not the puzzle's internal mechanics.
- Audio assigned by Quest or Puzzle data resolves through registered `asset_` IDs; do not create an `archsound_` system.
- Blank Starter schema examples use `startScreenId: null`, matching the shared initializer.

## Remaining UI/code implementation tracks

Do not merge the tracks below into one uncontrolled pass.

### Track A — workspace layout improvements

Candidate later version:

```text
V1.2.13 — dynamic workspace expansion and manual layout space management
```

Required work:

- Grow the logical workspace when cards approach lower/right boundaries and keep comfortable blank padding.
- Allow START/END endpoints to be positioned consistently in expanded workspace without inferring Quest logic from position.
- Add a horizontal `Insert Space` guide that moves nodes below it downward while preserving connections.
- Consider vertical equivalent or obstacle-avoiding routing only after tested need.

### Track B — structured Quest authoring

Required stages:

1. Define export-safe structured data for operations, requirements, outcomes and Quest-scoped dialogue/Capra records.
2. Replace vague free-text block editing with contextual sections in the existing Quest Builder editing flow.
3. Add in-app **Open Dialogue / Feedback** authoring from relevant blocks.
4. Validate target IDs, dialogue references, empty dialogue records, feedback and completion conditions.
5. Align Quest/Sidequest saving with canonical connected-project-root typed indexes.
6. Only reconsider a shared Dialogue Library after repeated real reuse justifies it.

### Track C — linked Puzzle blocks

Required stages:

1. Wait until Puzzle Creator has canonical connected-project registration/loading for `puzzles/puzzle-index.json` and `puzzles/puzzle_<slug>.json`, or coordinate that prerequisite in a clearly staged cross-app pass.
2. Add a Quest Builder `Puzzle` block type with `puzzleId` primary/required field.
3. Read/select real registered puzzles from the active connected project.
4. Author Quest-level requirements, success outcomes and failure/story feedback around the linked puzzle without copying its internal record.
5. Add missing-puzzle and invalid-public-result validation.
6. Confirm Project Editor can consume public Quest/puzzle results only for wider route gating.

### Track D — terminology and live navigation migration

Required stages:

1. Change the live Quest Builder Module flyout from **Project Manager** to **Project Editor** in a versioned app pass.
2. Audit other active app UI for user-visible **Project Manager** labels and update each app through its own versioned/tested pass.
3. Safely migrate any stored todo filename or machine-readable internal identifier only where reading/writing compatibility is preserved; do not bulk rename project data blindly.

## Version rule

Every live Quest Builder app code/UI edit must increase the visible version by `0.01` and update the page title, visible version badge, CSS cache key, JavaScript/module cache keys, renderer asset keys and loaded/fallback text where present.

Documentation-only edits that do not change the loaded app do not require a visible app version increment.