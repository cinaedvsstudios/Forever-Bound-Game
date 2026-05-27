# Quest Builder To-Do / Change Plan

## Required reference files before editing

Before changing Quest Builder, always inspect these files first:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
```

Use the global all-apps to-do list for changes that affect every Artifex app. Use this file only for Quest Builder-specific work.

## Current live status

Current Quest Builder version: `V1.0.8`

Current live app files:

```text
artifex/apps/quest-builder/index.html
artifex/apps/quest-builder/v1/quest-builder-v108.css
artifex/apps/quest-builder/v1/quest-builder-v108.js
```

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
V1.0.9  structure cleanup only
V1.1.0  module menu/shared shell alignment if still needed
V1.1.1  left panel refinement
V1.1.2  viewing panel and flow card refinement
V1.1.3  block taxonomy and validation pass
V1.1.4  editor popup redesign
V1.1.5  export JSON and validation
```

## V1.0.9 — Structure cleanup only

No new UI features.

Goal: stop Quest Builder from becoming another giant mixed file.

Split the current script into responsibility-based modules:

```text
index.html                         shell only
v1/quest-builder.css               layout and styling only
v1/src/quest-builder-app.js         bootstrap/orchestration
v1/src/module-config.js             version, paths, app constants, core module list
v1/src/block-types.js               block taxonomy, colours, icons, required fields
v1/src/quest-schema.js              default quest file, quest, and block shapes
v1/src/layout-state.js              localStorage layout preferences
v1/src/ui-bindings.js               menu/buttons/inline editing/collapse/lock controls
v1/src/canvas-renderer.js           viewing panel renderer only
v1/src/dialog-editors.js            quest/block editor and wizard
v1/src/export-json.js               export shape and validation warnings
```

Add or update:

```text
artifex/apps/quest-builder/docs/structure.md
```

That file must define what belongs in each module so future edits do not scatter logic randomly.

Acceptance checks:

- `index.html` stays thin.
- No file mixes renderer, schema, localStorage, dialogs, and export all together.
- Live app still loads after split.
- Version becomes `V1.0.9` everywhere.
- No feature behaviour should change in this pass except bugs caused by the split.

## V1.1.0 — Module menu / shared shell alignment

Quest Builder already has `File ▾ → Module ▸`, but it needs to be checked against the global app standard.

Required Module flyout order:

```text
Hub
Creation Guide
Project Manager
Scene Editor
Quest Builder
Puzzle Creator
Effect Editor
Archetype Object Creator
```

Do not include utility tools such as Sprite Wizard, Font Packer, Frame Extractor, or Onda.

Acceptance checks:

- Module list is a side flyout, not a flat list inside File.
- Links use correct relative paths.
- Header follows the shared Artifex rule: logo/app title → version pill → divider → main menu.
- Quest Builder keeps green accent but does not let green overpower the dark bronze/gold Artifex base.

## V1.1.1 — Left panel refinement

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

## V1.1.2 — Viewing panel and flow card refinement

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

## V1.1.3 — Block taxonomy and validation pass

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

## V1.1.4 — Better editor popup

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

## V1.1.5 — Export JSON and validation

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
    "taskId": "todo_quest_builder_split_v109_modules",
    "scope": "specific-app",
    "owningModule": "quest-builder",
    "title": "Split Quest Builder V1.0.8 into structured modules",
    "status": "open",
    "priority": 5,
    "effort": 5,
    "source": "project-file-contracts",
    "fixOwner": "quest-builder"
  },
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
