# Quest Builder

## Purpose

The Quest Builder is the overarching story/progression module.

It manages quests, side quests, branches, flags, conditions, rewards, unlocks and progression logic. It authors the player-facing objectives and event flow that Project Editor may later reference when connecting the overall game structure.

## Required Companion Documents

Before changing Quest Builder data, save/export behaviour or cross-app links, inspect:

```text
docs/artifex/18-color-and-display-rules.md
docs/artifex/19-project-file-contracts.md
docs/artifex/19a-project-starter-file-schemas.md
docs/artifex/20-asset-intake-workflow.md
docs/artifex/21-template-game-project-contract.md
artifex/shared/todo-guide/README.md
artifex/shared/todo-guide/all-apps-todos.json
```

`19-project-file-contracts.md` defines connected-folder saving and module ownership. `19a-project-starter-file-schemas.md` is binding for the typed empty quest and sidequest indexes that Creation Guide initialises and every app must preserve. `21-template-game-project-contract.md` requires a minimal connected quest/calling record when cross-app integration is proven through Template Game.

## Module Boundary

The Quest Builder is its own app/module. It is not inside Project Editor.

Quest Builder owns quest and progression authoring. Project Editor can reference quest IDs, sidequest IDs, flags and conditions when connecting the Flatplan, but it must not become the authoring tool for the inside of a quest.

Example:

- Quest Builder defines `quest_find_key`.
- Quest Builder defines the completion flag `key_collected`.
- Project Editor uses `quest_complete:quest_find_key` or `flag_true:key_collected` as a Route condition.

The quest/progression logic is authored here, then read or referenced by Project Editor, Playtest, Health Guide and Build Game.

## What It Includes

The Quest Builder includes what might otherwise be called:

- Quest Module;
- Side Quest Builder;
- Flag Manager;
- Condition Builder;
- Progression Manager;
- Objective Builder.

The Flag Manager and Condition Builder belong inside or under Quest Builder because they are primarily used for progression, unlocks and event requirements.

## Quest

A Quest is a main structured objective path through the game. A Quest may use multiple scenes, objects, dialogue events, conditions and completion events, and its outcome may open or block Project Editor routes.

Quest is preferred over Line as the official term.

## Side Quest / Branch

A Side Quest is a player-facing optional quest and is stored in the `sidequests/` project area.

A Branch is the structural Flatplan term for an optional offshoot from the main playable route. A Branch may link to a Side Quest or contain optional scenes, lore, rewards, hidden objects, extra fights or alternative routes.

Quest Builder authors Side Quest content. Project Editor visualises and connects relevant structural Branch routes.

## Quest Data

A quest should define:

- stable quest ID using the `quest_` prefix, or stable sidequest ID using `sidequest_`;
- quest title and type;
- Calling/objective text;
- start condition;
- linked scene or screen IDs where the quest uses them;
- linked character, NPC or object archetype IDs;
- linked dialogue/audio/sound references where relevant;
- completion condition and flags set by the quest;
- rewards and unlocks;
- next quest or later progression link where applicable;
- visual flow blocks and connections used by the Quest Builder workspace;
- optional/side quest status.

## Flags

A Flag is a saved true/false state used by gameplay and progression.

Examples:

- `key_collected = true`;
- `villain_defeated = true`;
- `door_unlocked = true`;
- `intro_seen = true`;
- `side_quest_started = true`.

## Conditions

A Condition is a rule that checks whether something can happen.

Examples:

- `has_item:archobj_bronze_key`;
- `quest_complete:quest_find_key`;
- `scene_visited:scene_old_bridge`;
- `flag_true:door_unlocked`;
- `enemy_defeated:archobj_forest_wolf`.

Conditions can control:

- whether a Project Editor route is open;
- whether a quest can start;
- whether a dialogue option appears;
- whether an item can be used;
- whether a scene, object or branch is unlocked;
- whether a puzzle or feedback event is available.

## Rewards and Unlocks

A Reward is something given after a quest, side quest, battle, object interaction or milestone. Rewards may include an item, route unlock, scene unlock, currency, lore, health, powerup or ending access.

An Unlock is a progression change that makes a new route, station, item, quest, branch or screen available.

## Connected Project Ownership and Save Contract

Quest Builder must operate inside the same connected project root that Creation Guide establishes and Project Editor reads. It must use the shared project-folder service rather than inventing a separate project package or treating downloaded JSON as the everyday save workflow.

Normal intended flow:

```text
Creation Guide creates or opens a connected project root
→ Creation Guide initialises valid empty quest/sidequest indexes
→ Quest Builder opens that same connected root
→ Quest Builder reads the project identity, related indexes and existing quest files
→ creator edits quests using local recovery drafts while working
→ deliberate Save writes only Quest Builder-owned files to the project folder
→ Project Editor, Health Guide and Build Game can read the saved quest indexes/files
```

### Quest Builder Reads

Quest Builder should read the following real project files when they exist:

```text
project.json
quests/quest-index.json
quests/quest_<slug>.json
sidequests/sidequest-index.json
sidequests/sidequest_<slug>.json
scenes/scene-index.json
screens/screen-index.json
puzzles/puzzle-index.json
archetypes/object-index.json
archetypes/effect-index.json
assets/asset-index.json
```

It reads `scenes/`, `screens/`, `puzzles/`, object/effect archetypes and assets so the creator can choose valid references for quest blocks. Reading those indexes does not transfer their ownership to Quest Builder.

A future approved Sound Archetype contract may add:

```text
archetypes/sound-index.json
archetypes/sounds/archsound_<slug>.json
```

until that addition is approved through the canonical project contracts, Quest Builder must not silently make it part of Blank Starter Project initialisation.

### Quest Builder Writes

Quest Builder owns and may write only its authored quest content and corresponding registration indexes:

```text
quests/quest-index.json
quests/quest_<slug>.json
sidequests/sidequest-index.json
sidequests/sidequest_<slug>.json
```

It must not write Project Editor structural files, Scene Editor content, Puzzle Creator content, object/effect archetype definitions, final asset library metadata, Health output or Build output merely because a quest references those things.

### Direct Save and Draft State

Once connected-folder integration is implemented:

- ordinary editing may autosave a recovery draft to `localStorage`;
- a deliberate **Save to Project Folder** action writes Quest Builder-owned files into the connected project root;
- JSON/package export remains a backup/transfer fallback rather than normal daily saving;
- the app must report save state honestly: **Saved to Project Folder**, **Local Draft Only**, **Permission Required**, **No Folder Connected**, **Save Failed**, and later conflict/external-change states when shared comparison support exists;
- leaving the app while local-only unsaved changes exist must use the shared navigation-save guard once available.

## Canonical Quest and Sidequest Indexes

Creation Guide already initialises these empty indexes using the canonical typed collection format. Quest Builder must preserve that format when adding records.

`quests/quest-index.json` begins as:

```json
{
  "schemaVersion": "artifex.quests.index.v1",
  "projectId": "project_forever_bound",
  "quests": []
}
```

`sidequests/sidequest-index.json` begins as:

```json
{
  "schemaVersion": "artifex.sidequests.index.v1",
  "projectId": "project_forever_bound",
  "sidequests": []
}
```

When content is added, records belong inside `quests` or `sidequests`, not a generic `items` array. Example registered quest entry:

```json
{
  "id": "quest_find_chalice",
  "slug": "find_chalice",
  "name": "Recover the Chalice",
  "type": "main",
  "file": "quests/quest_find_chalice.json",
  "status": "draft"
}
```

Quest content files live directly under the selected connected project root:

```text
quests/quest_find_chalice.json
sidequests/sidequest_help_vitus.json
```

Do not write or display the old virtual-root assumption `projects/<project-id>/quests/...` as the direct-save destination. The folder selected through the shared folder service is already `<project-root>/`.

## Relationship To Project Editor / Flatplan

Quest Builder connects to the Flatplan because quest progress can unlock or block Flatplan connections.

Project Editor should be able to read the saved quest and sidequest indexes and use stable Quest Builder outputs as structural references:

```text
quest IDs
sidequest IDs
completion flags
route/unlock conditions
required scenes or objects where shown for reference
```

Project Editor may show that a route opens after `quest_find_key` or `flag_true:key_collected`. It must not edit the quest's internal flow blocks, reward sequence, dialogue references or Calling text.

Quest Builder may read Project Editor-linked route IDs where a quest grants or activates a route. It must not author or overwrite `logic.json`, `layout.json`, `registry.json` or `library-links.json` during ordinary quest save.

## Relationship To Scene Editor

Quest Builder may reference scenes or screens required by a quest block, for example:

```text
enter scene: scene_church
visit screen: screen_codice_update
complete action in scene: scene_crypt
```

Scene Editor owns the actual visual scene/screen content. Quest Builder should select real registered scene/screen IDs from their indexes once connected-project browsing is implemented, rather than relying only on free-text IDs.

## Relationship To Archetype Object Creator

Quest Builder references reusable object archetypes for player objectives and event targets.

Examples:

- collect item: `archobj_bronze_key`;
- defeat enemy: `archobj_forest_wolf`;
- speak to character: `archobj_merchant_npc`;
- unlock object: `archobj_locked_door`.

Archetype Object Creator owns those reusable definitions. Quest Builder stores their IDs as references in quest/event content; it must not duplicate their full behaviours into quest files.

## Relationship To Puzzle Creator

A quest may require or react to a puzzle:

```text
solve puzzle: puzzle_chalice_order
condition: puzzle_complete:puzzle_chalice_order
reward after puzzle completion
```

Puzzle Creator owns the puzzle definition and index. Quest Builder references registered puzzle IDs where a quest step depends on a puzzle; it must not become the puzzle-authoring app.

## Relationship To Sound Archetype Generator

A future shared Sound Archetype Generator is intended to provide small reusable procedural synthesised sounds: correct-answer bleeps, locked-door buzzes, warning pulses, completion chimes and similar game-event feedback. It should be callable as the same floating shared generator window from any editor that assigns a sound, including Quest Builder.

Quest Builder already has the concept of audio on a quest block. After the Sound Archetype contract is approved, the block editor should offer an in-context workflow such as:

```text
Sound / Audio: [ None Selected ] [ Choose from Library ] [ Create New Sound ]
```

Examples of Quest Builder events using a Sound Archetype:

```text
Correct input / clue found      → archsound_correct_sequence_bleep
Wrong input / failed condition  → archsound_wrong_input_buzz
Calling fulfilled               → archsound_quest_complete_chime
Reward granted                  → archsound_reward_pickup
Machine or portal activated     → archsound_machine_start
```

Required behaviour:

- **Create New Sound** opens the shared floating Sound Archetype Generator in the context of the selected quest block;
- **Save to Library** saves a reusable procedural sound record without assigning it to the block;
- **Save and Assign Here** saves one reusable `archsound_` record, then places only its stable ID into the current quest-block draft;
- the quest file must never duplicate the complete procedural synthesiser recipe;
- the quest itself is still saved only through Quest Builder's normal deliberate save workflow.

The current V1.2.12 field is named `audioId`. Do not silently redefine that field or change the canonical project structure during a UI-only sound prototype. When Sound Archetypes are formally added to the project contract, decide explicitly whether quest blocks retain a generic `audioId` resolver or gain a distinct `soundArchetypeId` field, and update the relevant contracts and validation at the same time.

## Current V1.2.12 Implementation Status and Required Alignment Work

The current Quest Builder UI demonstrates quest editing and flow layout, but it is not yet connected-project compliant for real project authoring.

Verified current behaviour:

- the app begins with built-in demonstration content via `createDemoQuestFile()` rather than loading real saved quests from the connected project;
- the menu exposes **Export JSON Bundle**, **Export Project Files**, **Save Locally in Browser** and JSON import, rather than connected-folder open/re-authorise/direct-save actions;
- its export paths point to the correct general quest/sidequest folder names but the export metadata still refers to `projects/<project-id>/` rather than treating the connected selected folder as project root;
- its current exported quest/sidequest indexes use older `artifex.questIndex.v1` / `artifex.sidequestIndex.v1` schemas and generic `items`, which must be converted to the canonical typed `artifex.quests.index.v1` / `artifex.sidequests.index.v1` structures with `projectId`, `quests` and `sidequests` collections;
- the current module menu still labels/links **Project Manager**, which should be aligned to **Project Editor** when the app integration pass is performed.

Required next implementation pass for Quest Builder:

1. Align quest and sidequest output indexes with `docs/artifex/19a-project-starter-file-schemas.md`.
2. Remove the old `projects/<project-id>/` destination assumption from direct-project workflow language and output metadata.
3. Adopt the shared connected-project-folder client used by Creation Guide.
4. Open/re-authorise the connected project folder and read real project identity, quest indexes and related browse-only indexes.
5. Do not display built-in demo data as though it belongs to an opened real project; demo/template content may remain an explicit example option only.
6. Write only Quest Builder-owned quest/sidequest files and index entries after deliberate Save.
7. Retain local browser drafts as recovery only and export actions as backup/transfer only.
8. Display real save/folder state and add shared unsaved-navigation protection when available.
9. Correct the module navigation label/path to Project Editor.
10. After the shared Sound Archetype contract is approved, add library browsing and **Create New Sound** to the quest-block sound/audio assignment UI.

## Template Game Integration Proof

When Quest Builder is connected to the canonical project workflow, Template Game should include one minimal real quest/calling registered through:

```text
quests/quest-index.json
quests/quest_<slug>.json
```

That test quest should prove at least:

- Quest Builder loads from and saves to the connected project folder;
- Project Editor can see/reference the saved quest ID or completion flag;
- the quest references a real registered scene and/or object where appropriate;
- unresolved quest links are reported by Health/Build validation;
- if Sound Archetypes have been implemented by then, one quest event may reference a valid `archsound_` ID, and broken sound references must be detectable.

## Test Quest

Quest Builder should eventually provide a **Test Quest** action using the shared Playtest system. It should let the creator test a selected quest with temporary fake flags/items, reset quest state or jump to a relevant linked scene/node without changing permanent project files.
