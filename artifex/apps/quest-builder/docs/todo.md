# Quest Builder To-Do / Change Plan

## Required reference files before editing

Before changing Quest Builder, always inspect these files first:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
artifex/apps/quest-builder/docs/structure.md
```

Use the global all-apps to-do list for changes that affect every Artifex app. Use this file only for Quest Builder-specific work.

## Current live status

Current Quest Builder version: `V1.1.3`

Current live app files:

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

Older V1.0.8 files remain in the repo for reference but should not be loaded by the live app:

```text
artifex/apps/quest-builder/v1/quest-builder-v108.css
artifex/apps/quest-builder/v1/quest-builder-v108.js
```

## Completed

### V1.0.9 — Structure cleanup only

Status: complete.

Completed changes:

- `index.html` loads the split module entry instead of the old single script.
- App behaviour has been split into responsibility-based modules.
- `docs/structure.md` defines what belongs in each Quest Builder file.
- Export helpers and validation helpers were moved into `export-json.js`.
- Block taxonomy was moved into `block-types.js`.
- Demo data and schema helpers were moved into `quest-schema.js`.
- Layout persistence was moved into `layout-state.js`.
- Canvas drawing was moved into `canvas-renderer.js`.
- Dialog/wizard behaviour was moved into `dialog-editors.js`.
- UI wiring was moved into `ui-bindings.js`.
- Live GitHub Pages import test passed: user confirmed the V1.0.9 split loaded and looked fine.

### V1.1.0 — Module menu / shared shell alignment

Status: complete.

Completed changes/checks:

- Page title, visible version badge, CSS cache key, JS module cache key, and module config now use `V1.1.0` / `1.1.0`.
- `File ▾ → Module ▸` remains a side flyout, not a flat list inside File.
- The flyout includes only the core modules: Hub, Creation Guide, Project Manager, Scene Editor, Quest Builder, Puzzle Creator, Effect Editor, Archetype Object Creator.
- Utility tools such as Sprite Wizard, Font Packer, Frame Extractor, and Onda are not included.
- The module list is also stored in `v1/src/module-config.js`, so future standardisation can read from one config source instead of scattering the order randomly.
- The header remains aligned with the shared Artifex rule: logo/app title area, version pill, divider/menu area, compact pill menu buttons.
- Quest Builder keeps green as the module accent while retaining the dark Artifex shell.

### V1.1.1 — File menu simplification

Status: complete.

Completed changes:

- File menu now groups actions into short flyouts instead of showing a long flat list.
- `File ▾ → New ▸` contains `New Quest Wizard` and `New Quest`.
- `File ▾ → Save ▸` contains `Export JSON` and `Save Locally in Browser`.
- `Import JSON` remains directly in File because it is a single immediate file action.
- `File ▾ → Module ▸` remains the core-module side flyout.
- Removed the confusing `New Quest File` item from the File menu.
- Updated action wiring so `New Quest` creates a quest instead of resetting the whole quest file.
- Page title, visible version badge, CSS cache key, JS module cache key, stylesheet entry, and module config now use `V1.1.1` / `1.1.1`.

### V1.1.2 — Left panel refinement

Status: complete.

Completed changes:

- Left panel remains one main `Selected Quest` card with thumbnail, inline quest name, quest type, Calling, info fields, actions, and Quest List.
- Added title tooltips to important left-panel inputs and actions.
- Preserved resizable left panel behaviour.
- Added small CSS refinements for the selected quest card, quest list rows, and locked state.
- Stabilised inline editing so render refreshes do not overwrite the active input while the user is typing.
- Quest and block list rows now include tooltip text for selection/edit actions.
- Removed the open `todo_quest_builder_left_panel_typing_stability` task from the specific-app open list.
- Page title, visible version badge, CSS cache key, JS module cache key, stylesheet entry, and module config now use `V1.1.2` / `1.1.2`.

### V1.1.3 — Contextual inspector and status actions

Status: complete.

Completed changes:

- Left panel is now treated as a contextual status/inspector panel, not a duplicate quest summary.
- Clicking the quest header or Calling pill in the viewing canvas selects the quest for the left inspector.
- Clicking a flow card in the viewing canvas selects that block for the left inspector.
- The inspector switches between Quest fields and Block fields depending on what is selected.
- The green status strip now contains emoji action buttons for New Quest Wizard, Add Quest, Add Block, and Save Locally.
- The older side-panel Add Quest/Add Block row and Quest List section are hidden from the main panel chrome.
- Canvas renderer now creates hit zones for the quest header, Calling pill, and flow cards.
- Canvas click hit-testing accounts for zoom and pan.
- Page title, visible version badge, CSS cache key, JS module cache key, stylesheet entry, and module config now use `V1.1.3` / `1.1.3`.

## Ownership boundary

Quest Builder owns:

- Quest library records
- Side quest records
- Quest branches
- Player action steps inside quests
- Conditions and flags
- Rewards and unlocks
- Progression logic
- Quest-specific UI overlays and Capra feedback assignments
- Links from quest blocks to scene IDs, object IDs, dialogue IDs, audio IDs, puzzle IDs, route IDs, Codice IDs, and reward IDs

Quest Builder does not own:

- Scene/screen visual layout
- Scene Editor object placement
- Flatplan map positioning
- Object archetype definitions
- FX archetype definitions
- Raw dialogue text library ownership if a future Dialogue Editor owns that content
- Raw audio asset ownership

## Export target

Quest Builder should eventually export:

```text
projects/<project-id>/quests/quest-index.json
projects/<project-id>/quests/quest_<slug>.json
projects/<project-id>/sidequests/sidequest-index.json
projects/<project-id>/sidequests/sidequest_<slug>.json
```

Project Manager should reference quest and side quest IDs. It should not author quest internals directly.

## Version plan

Every Quest Builder edit should increase the visible version by `0.01` and update:

- Page title
- Visible version badge
- CSS cache key
- JS/module cache key
- Loaded/fallback text where present

Next versions:

```text
V1.1.4  viewing panel warnings and flow card polish
V1.1.5  block taxonomy and validation pass
V1.1.6  editor popup redesign
V1.1.7  export JSON and validation
```

## V1.1.4 — Viewing panel warnings and flow card polish

Goal: finish the remaining viewing panel behaviours after the contextual inspector change.

Required:

- Selected card should remain visually obvious after clicking the canvas.
- Flow cards should show missing-data warnings where required fields are missing.
- Flow cards should show linked ID summaries more clearly.
- START and END should remain readable even when blocks wrap.
- Canvas still supports zoom and pan.

## V1.1.5 — Block taxonomy and validation pass

Goal: stop block names being vague and separate gameplay actions from linked content.

Core block distinction:

- `action` = what the player does.
- `scene` = where it happens.
- `dialogue` = linked text/audio asset.
- `object` = object-specific interaction.
- `condition` = logic gate.
- `ui` / `capra` = feedback overlays.
- `reward`, `codice`, `route` = outcomes/unlocks.

Example rule:

`Speak With Vitus` should be a `Player Action` block with optional linked dialogue/audio fields, not only a Dialogue block.

Suggested source/type colour meanings:

```text
scene/screen: purple
dialogue: red
action: amber/orange
object: teal
condition/flag: blue
Capra/UI: green
Codice/lore: parchment/gold
reward: gold
combat/foe: crimson
route/map unlock: emerald
start/end: neutral gold/white
```

Acceptance checks:

- Block type list includes required fields per type.
- Cards show warnings for missing required references.
- Existing demo data uses `action` for `Speak With Vitus`.
- Dialogue/audio are linked content, not confused with the player action itself.

## V1.1.6 — Better editor popup

Goal: replace the giant field list with a proper editor layout.

Suggested sections/tabs:

```text
Basics
Links
Dialogue / Audio
Conditions & Actions
UI / Capra / Rewards
Notes / JSON
```

Required fields:

- Thumbnail/icon field.
- Block name.
- Block type.
- Scene ID.
- Object/NPC ID.
- Dialogue ID.
- Audio ID/file reference.
- Condition.
- Action/outcome.
- UI overlay.
- Capra feedback.
- Notes.

Acceptance checks:

- Dialog is not one endless field stack.
- Required fields are visually clear.
- Optional fields are grouped logically.
- Thumbnail/icon is saved into the block data.

## V1.1.7 — Export JSON and validation

Goal: produce stable game-readable JSON, not only local editor state.

Export should separate:

- Quest metadata.
- Editor layout data.
- Quest flow blocks.
- Gameplay actions.
- Linked scene/object/dialogue/audio references.
- Conditions and flags.
- UI overlays.
- Rewards and unlocks.
- Validation warnings.

Validation should catch:

- Missing scene ID on scene block.
- Missing object/NPC ID on action/object block where required.
- Dialogue block without dialogue ID.
- Action block without action/outcome.
- Completion block without condition or completion flag.
- Missing linked IDs that Project Manager will need to resolve.

Acceptance checks:

- Export writes `quest-index.json` shape and individual `quest_<slug>.json` shape.
- Side quests are separated from main quests where needed.
- Project Manager can consume exported IDs instead of authoring internals.
- Editor-only layout state does not pollute reusable quest runtime data.

## Specific-app tasks

```json
[
  {
    "taskId": "todo_quest_builder_define_export_contract",
    "scope": "specific-app",
    "owningModule": "quest-builder",
    "title": "Define Quest Builder export contract",
    "status": "open",
    "priority": 5,
    "effort": 4,
    "source": "project-file-contracts",
    "fixOwner": "quest-builder"
  },
  {
    "taskId": "todo_quest_builder_block_taxonomy_validation",
    "scope": "specific-app",
    "owningModule": "quest-builder",
    "title": "Lock block taxonomy and validation rules",
    "status": "open",
    "priority": 4,
    "effort": 4,
    "source": "quest-builder-ui-pass",
    "fixOwner": "quest-builder"
  }
]
```
