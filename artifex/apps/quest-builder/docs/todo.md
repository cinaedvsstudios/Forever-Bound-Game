# Quest Builder To-Do / Change Plan

## Required reference files before editing

Before changing Quest Builder, always inspect these files first:

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

Current Quest Builder version: `V1.1.6`

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

- `File ▾ → Module ▸` remains a side flyout, not a flat list inside File.
- The flyout includes only the core modules: Hub, Creation Guide, Project Manager, Scene Editor, Quest Builder, Puzzle Creator, Effect Editor, Archetype Object Creator.
- Utility tools such as Sprite Wizard, Font Packer, Frame Extractor, and Onda are not included.
- The module list is stored in `v1/src/module-config.js`.
- Quest Builder keeps green as the module accent while retaining the dark Artifex shell.

### V1.1.1 — File menu simplification

Status: complete.

- File menu now groups actions into short flyouts instead of showing a long flat list.
- `File ▾ → New ▸` contains `New Quest Wizard` and `New Quest`.
- `File ▾ → Save ▸` contains `Export JSON` and `Save Locally in Browser`.
- `Import JSON` remains directly in File because it is a single immediate file action.
- `File ▾ → Module ▸` remains the core-module side flyout.
- Removed the confusing `New Quest File` item from the File menu.
- Updated action wiring so `New Quest` creates a quest instead of resetting the whole quest file.

### V1.1.2 — Left panel refinement

Status: complete.

- Added title tooltips to important left-panel inputs and actions.
- Preserved resizable left panel behaviour.
- Stabilised inline editing so render refreshes do not overwrite the active input while the user is typing.
- Quest and block list rows now include tooltip text for selection/edit actions.

### V1.1.3 — Contextual inspector and status actions

Status: complete.

- Left panel is now treated as a contextual status/inspector panel, not a duplicate quest summary.
- Clicking the quest header or Calling pill in the viewing canvas selects the quest for the left inspector.
- Clicking a flow card in the viewing canvas selects that block for the left inspector.
- The inspector switches between Quest fields and Block fields depending on what is selected.
- The green status strip now contains emoji action buttons for New Quest Wizard, Add Quest, Add Block, and Save Locally.
- Canvas renderer creates hit zones for the quest header, Calling pill, and flow cards.
- Canvas click hit-testing accounts for zoom and pan.

### V1.1.4 — Viewing panel warnings and flow card polish

Status: complete.

- Selected quest header, Calling pill, and selected flow card now get stronger visual selection styling.
- Flow cards now show clearer linked summaries using scene/object/dialogue/condition/action/UI labels.
- Flow cards now show warning text when required fields are missing.
- Flow cards show a ready/audio line when required fields are satisfied.
- START and END nodes now include small helper text so they stay readable as flow anchors.
- Flow connector arrows are more explicit between cards.
- Canvas still uses the existing hit zones, zoom, and pan support.

### V1.1.5 — Block taxonomy and validation pass

Status: complete.

- Added `docs/block-taxonomy.md` as the human-readable block taxonomy contract.
- Locked each block type with category, source module, primary field, linked fields, required fields, colour, emoji, and hint.
- The inspector now uses each block type's `primaryField` instead of guessing the primary quick-edit field.
- The inspector now displays taxonomy metadata: block category, primary field, and required fields.
- Block type dropdowns are now populated for both the popup editor and the left contextual inspector.
- Template blocks now include required fields so new template blocks do not immediately show false warnings.
- Export validation now catches missing block type, missing Calling text, required fields, completion requirements, and dialogue/action misuse hints.
- The Block Type List now shows category, primary field, required fields, and hint.
- Removed the open `todo_quest_builder_block_taxonomy_validation` task from the specific-app open list.

### V1.1.6 — Better editor popup

Status: complete.

- Replaced the giant single field stack with tabbed editor sections.
- Quest editing now has grouped panels for Quest Basics, Quest Links, Rewards / Unlocks, and Notes.
- Block editing now has grouped panels for Basics, Links, Dialogue / Audio, Conditions & Actions, UI / Capra / Rewards, and Notes.
- Added thumbnail/icon inputs for quests and blocks.
- Thumbnail/icon input values are now saved back into quest and block data.
- Editor tabs are wired from `dialog-editors.js` and initial tab selection is context-aware when editing a quest or block.
- Dialog styling now has tab buttons, active panel styling, helper text, and compact thumbnail/name/type layout.
- Page title, visible version badge, CSS cache key, JS module cache key, stylesheet entry, and module config now use `V1.1.6` / `1.1.6`.

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

Next version:

```text
V1.1.7  export JSON and validation
```

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
  }
]
```
