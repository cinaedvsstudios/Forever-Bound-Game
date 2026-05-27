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

Current Quest Builder version: `V1.1.1`

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
V1.1.2  left panel refinement
V1.1.3  viewing panel and flow card refinement
V1.1.4  block taxonomy and validation pass
V1.1.5  editor popup redesign
V1.1.6  export JSON and validation
```

## V1.1.2 — Left panel refinement

Goal: make the left panel a proper Quest control surface, not repeated cards.

Required layout:

- Sticky status strip at top.
- One main `Selected Quest` card.
- Thumbnail/icon.
- Inline editable quest name.
- Quest type.
- Chronicle ID.
- Calling text.
- Info fields.
- Quest list underneath.
- Add Quest / Add Block actions.

Required controls:

- Collapse button on long cards.
- Lock/unlock button.
- Text editable only when unlocked.
- Locked state should make fields display-only.
- Left panel width remains resizable and remembered.

Acceptance checks:

- Remove any old duplicated `Quest File`, `Quests`, and `Selected` cards if still present.
- Remove old `Edit File Info` button pattern from the main side panel.
- Quest list rows include edit icons.
- Inline fields update the current quest state.
- Inline field updates should not fight with render refreshes while typing.

## V1.1.3 — Viewing panel and flow card refinement

Goal: make the canvas read like a quest flow, not a generic builder diagram.

Viewing panel should show:

- Quest thumbnail.
- Quest name.
- Chronicle/type/block-count metadata.
- Calling pill with edit icon.
- START card.
- Flow cards.
- END card.

Each flow card should show:

- Thumbnail/icon.
- Block name.
- Block type.
- Edit icon.
- Linked ID summary.
- Missing-data warning if required fields are missing.
- Border colour based on block type/source.

Acceptance checks:

- No leftover generic `QUEST BUILDER` title inside the canvas.
- START is visually top-left.
- END is visually bottom-right.
- Blocks reflow between START and END.
- Canvas still supports zoom and pan.

## V1.1.4 — Block taxonomy and validation pass

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

## V1.1.5 — Better editor popup

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

## V1.1.6 — Export JSON and validation

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
  },
  {
    "taskId": "todo_quest_builder_left_panel_typing_stability",
    "scope": "specific-app",
    "owningModule": "quest-builder",
    "title": "Make inline left-panel editing stable while typing",
    "status": "open",
    "priority": 4,
    "effort": 3,
    "source": "left-panel-refinement",
    "fixOwner": "quest-builder"
  }
]
```
