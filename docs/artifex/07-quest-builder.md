# Quest Builder

## Purpose

The Quest Builder is the story/progression authoring module. It manages quests, side quests, branches, flags, conditions, rewards, unlocks, Quest-scoped dialogue/Capra records, linked puzzle steps and progression logic.

It authors the player-facing objective and event flow that **Project Editor** may later reference when connecting the overall game structure.

## Required Companion Documents

Before changing Quest Builder data, save/export behaviour or cross-app links, inspect:

```text
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
```

`19-project-file-contracts.md` defines connected-folder saving and module ownership. `19a-project-starter-file-schemas.md` is binding for typed empty Quest, Sidequest and Puzzle indexes that Creation Guide initialises and every app must preserve. `07a` defines structured actions/dialogue/feedback. `07b` defines the Puzzle Creator handoff.

## Locked Tool Names

Use these user-facing names:

```text
Project Editor
Quest Builder
Puzzle Creator
```

Do not use **Project Manager** as a user-facing alternate name. Historical code identifiers, paths or task-file names still using `project-manager` are migration work only.

## Module Boundary

Quest Builder is its own app. It is not inside Project Editor and it does not replace Puzzle Creator.

```text
Quest Builder = authors quest progression and the story use of scenes, objects and puzzles.
Puzzle Creator = authors the internal workings of a contained puzzle challenge.
Project Editor = connects the wider game/Flatplan/routes using stable outputs.
```

Example:

- Puzzle Creator defines `puzzle_chalice_pedestal`.
- Quest Builder uses that puzzle as the flow step `Solve the Chalice Pedestal`, then sets `flag_chalice_pedestal_solved` and triggers dialogue/reward outcomes.
- Project Editor may use `flag_true:flag_chalice_pedestal_solved` or overall Quest completion as a route gate; it does not edit the puzzle or Quest internals.

## What Quest Builder Owns

Quest Builder owns:

- Quest and Side Quest records;
- flow blocks and explicit Quest connections;
- branches inside Quest progression;
- progression flags and Quest-level conditions;
- structured player/game-event operations and outcomes;
- Quest-specific dialogue, narration and Capra feedback records;
- rewards, Codice update triggers and Quest-created unlock references;
- meaningful Puzzle flow blocks that reference registered `puzzle_` records;
- Quest/Sidequest index registration and content files.

Quest Builder does not own:

- scene/screen visual layout;
- object archetype definitions;
- effect archetype definitions;
- puzzle internal layout, features or completion evaluation;
- final media assets or generated sound recipes;
- Project Editor route/Flatplan structure;
- Health or Build outputs.

## Quest, Side Quest and Branch

A **Quest** is a main structured objective path through the game. A Quest may use multiple scenes, objects, dialogue events, puzzles, conditions and completion events.

A **Side Quest** is player-facing optional quest content stored in `sidequests/`.

A **Branch** is the structural/flow term for an optional offshoot. Quest Builder authors optional Quest flow; Project Editor visualises/connects wider structural Branch routes where relevant.

## Quest Data Direction

A Quest should define:

- stable `quest_` ID or `sidequest_` ID;
- title, type and Calling/objective text;
- start/completion conditions;
- linked scene/screen, object archetype and puzzle IDs where used;
- Quest-scoped dialogue/Capra records and referenced audio/portrait asset IDs where relevant;
- success and failure outcomes;
- rewards, Codice updates and unlock references;
- visual flow blocks and explicit connections used by the Quest Builder workspace.

## Actions, Flags and Conditions

A **Flag** is a saved progression state such as `flag_chalice_pedestal_solved` or `flag_vitus_warning_heard`.

A **Condition** tests whether something can occur, such as an item being present, a flag being true, a Quest being complete or a saved puzzle being complete.

A Quest operation such as `speak`, `collect`, `give`, `solve` or `defeat` is not an `input-map.json` control action. Input-map `action_` IDs define buttons/controls such as Invoke or Use Active Item; Quest Builder structured operations describe the gameplay event caused by using those controls.

The normal editor direction is structured selectors/rule builders, not raw free-text expressions. Advanced/raw representations may exist later only as deliberately validated data.

See `07a-quest-builder-structured-authoring.md` for the detailed block-authoring contract.

## Dialogue and Capra Feedback

Quest-specific dialogue and Capra feedback are authored inside Quest Builder from the relevant block. The first version does not require a separate top-level Dialogue Editor app.

Quest Builder stores text/event use and stable links; it references final registered `asset_` IDs for portrait, voice or other audio resources and does not copy binary media or audio recipes into Quest data.

## Relationship To Puzzle Creator

A saved puzzle is a self-contained gameplay challenge. Quest Builder must eventually expose a meaningful **Puzzle** flow block with primary reference:

```text
puzzleId
```

Examples:

```text
solve puzzle: puzzle_chalice_pedestal
condition: puzzle_complete:puzzle_chalice_pedestal
reward/outcome after puzzle completion
```

Puzzle Creator owns `puzzles/puzzle-index.json`, `puzzles/puzzle_<slug>.json` and the puzzle's internal behaviour. Quest Builder references a stable `puzzle_` ID and authors the surrounding Quest requirements/outcomes. It must not copy the puzzle's internal grid, feature configuration or rules into the Quest file.

See `07b-puzzle-creator-quest-integration.md` for the detailed handoff contract.

## Relationship To Project Editor / Flatplan

Project Editor reads saved Quest/Sidequest indexes and may use stable public outputs such as:

```text
quest IDs
sidequest IDs
completion flags
route/unlock conditions
public puzzle/Quest completion results where structurally required
```

Project Editor must not edit Quest internal flow, Calling text, dialogue records, puzzle internals or reward sequence. Quest Builder must not author or overwrite `logic.json`, `layout.json`, `registry.json` or `library-links.json` during ordinary Quest save.

## Relationship To Scenes and Objects

Quest Builder may reference real registered scene/screen IDs and reusable object archetype IDs, for example:

```text
enter scene: scene_church
speak to character: archobj_vitus
collect item: archobj_sacred_chalice
```

Scene Editor owns the actual visual scene/screen content. Archetype Object Creator owns reusable object definitions. Quest Builder stores only the references needed for Quest progression.

## Audio and Sound Asset Contract

Imported audio files and generated procedural sounds both resolve through the Asset Library using stable `asset_` IDs. A Quest block may assign voice, feedback, reward or completion audio through those registered assets.

For example:

```text
Wrong input / failed condition  → asset_sfx_wrong_input_buzz
Calling Fulfilled               → asset_sfx_quest_complete_chime
Voice line                      → asset_voice_ch01_q03_vitus_warning_01
```

A shared Procedural Sound Generator may later open in context from Quest Builder and return a newly registered `asset_` audio ID. Quest Builder stores only that ID.

Do **not** create:

```text
archetypes/sound-index.json
archetypes/sounds/
archsound_ IDs
```

for this feature. The sound recipe remains in the existing final asset area under `assets/audio/sfx/`, as locked in `docs/artifex/22-sound-archetype-generator.md`.

## Connected Project Ownership and Save Contract

Quest Builder operates inside the connected project root established by Creation Guide. It should eventually use the shared project-folder service rather than treating downloaded JSON as everyday saving.

### Quest Builder reads

```text
project.json
quests/quest-index.json
quests/quest_<slug>.json
sidequests/sidequest-index.json
sidequests/sidequest_<slug>.json
puzzles/puzzle-index.json
puzzles/puzzle_<slug>.json              [only when opening/validating a linked puzzle]
scenes/scene-index.json
screens/screen-index.json
archetypes/object-index.json
archetypes/effect-index.json
assets/asset-index.json
```

Reading related indexes does not transfer ownership to Quest Builder.

### Quest Builder writes

```text
quests/quest-index.json
quests/quest_<slug>.json
sidequests/sidequest-index.json
sidequests/sidequest_<slug>.json
```

It must not write Puzzle Creator content, Project Editor structure, Scene Editor content, object/effect archetypes, final asset library metadata, Health output or Build output merely because a Quest references those things.

### Direct save and draft state

Once connected-folder integration is implemented:

- ordinary editing may autosave a recovery draft to `localStorage`;
- deliberate Save writes Quest Builder-owned files to the connected project root;
- export remains backup/transfer fallback rather than normal daily saving;
- save state must be reported honestly using the shared status contract;
- leaving with local-only unsaved changes must use the shared navigation-save guard once available.

## Canonical Quest and Sidequest Indexes

Quest Builder must preserve the typed collections created by Creation Guide.

`quests/quest-index.json`:

```json
{
  "schemaVersion": "artifex.quests.index.v1",
  "projectId": "project_forever_bound",
  "quests": []
}
```

`sidequests/sidequest-index.json`:

```json
{
  "schemaVersion": "artifex.sidequests.index.v1",
  "projectId": "project_forever_bound",
  "sidequests": []
}
```

Records belong inside `quests` or `sidequests`, not a generic `items` array. Content files live directly under the selected connected project root:

```text
quests/quest_find_chalice.json
sidequests/sidequest_help_vitus.json
```

Do not write or display `projects/<project-id>/quests/...` as the direct-save destination. The selected folder is already `<project-root>/`.

## Current V1.2.12 Implementation Status and Required Alignment Work

The current Quest Builder UI demonstrates editing and visual flow layout, but it is not yet connected-project compliant for real project authoring.

Known required implementation work:

1. Align Quest/Sidequest output indexes with the canonical typed structures.
2. Remove the old `projects/<project-id>/` metadata assumption from future direct-project output.
3. Adopt the shared connected-project-folder client and load real project identity/indexes.
4. Stop treating demo data as opened project content once real project loading exists.
5. Correct the live Module menu label/path from **Project Manager** to **Project Editor** in a versioned app edit.
6. Add structured action/condition/outcome and Quest-scoped dialogue authoring according to `07a`.
7. Add a **Puzzle** block type and real `puzzleId` picker according to `07b` once Puzzle Creator canonical save/index output is available.
8. Add registered `asset_` audio assignment and optional in-context generated-sound popup integration once shared support exists.

## Template Game Integration Proof

When Quest Builder and Puzzle Creator are connected to the canonical project workflow, Template Game should prove:

- one minimal real Quest/Calling saved under `quests/`;
- optionally one small saved Puzzle registered under `puzzles/` and referenced by a Quest Puzzle block;
- Project Editor can see/reference saved Quest outputs and wider route gates;
- Quest references resolve to real registered scene/object/puzzle/asset records where used;
- Health/Build reports unresolved links honestly;
- any sound assigned to a Quest or puzzle resolves through a valid registered `asset_` ID.

## Test Quest

Quest Builder should eventually provide a **Test Quest** action through shared Playtest. It should allow temporary fake flags/items, puzzle-completion test states and scene/node jump points without changing permanent project files.