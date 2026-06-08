# Quest Builder Specification

Status: Active module specification during documentation consolidation  
Owning module: Quest Builder  
Active route: `artifex/apps/quest-builder/index.html`  
Current verified implementation baseline: `Artifex Quest Builder V1.2.12`  
Governing universal contract: `docs/artifex/01A-project-file-contracts.md`  
Subordinate schema reference: `docs/artifex/19A-project-starter-schemas.md`  
Related module: `docs/artifex/17A-puzzle-creator.md`  
Outstanding work source: `docs/artifex/02A-global-to-do.md`

## Purpose

Quest Builder is the Artifex authoring module for Quests, Side Quests, progression flow, dialogue/progression blocks, conditions, outcomes, flags, rewards and quest-level narrative logic.

Quest Builder owns the meaning of player progression. It does not own the internal mechanics of a Puzzle, the visual layout of a Scene, the reusable definition of an Object, or the reusable composition of an Effect.

## Ownership Boundary

Quest Builder owns:

- Quest and Side Quest records;
- quest flow blocks and logical connections;
- quest-level prerequisites, conditions, outcomes, flags and rewards;
- dialogue/progression authoring;
- quest-specific dialogue records and line ordering;
- quest-specific Capra feedback lines and the circumstances in which they appear;
- Calling Fulfilled events, reward grants, Codice update triggers and route/unlock references created by the Quest;
- quest-level references to scenes, screens, puzzles, objects, effects and assets;
- canonical Quest/Side Quest indexes once connected-project saving exists.

Quest Builder must not:

- author puzzle internals;
- copy saved puzzle JSON into Quest blocks;
- author Scene visual contents;
- author Object Archetype internals;
- author Effect Archetype internals;
- promote final assets;
- own Project Editor route/Flatplan records;
- create a separate top-level Dialogue Editor for the first version merely to enter quest dialogue;
- treat local exports as canonical connected-project saves once connected saving exists.

The practical rule is: **Quest Builder owns the script and event use; libraries own reusable asset files or reusable global definitions.**

## Active Baseline

The current verified baseline is:

```text
artifex/apps/quest-builder/index.html
Artifex Quest Builder V1.2.12
```

Current implementation includes:

- modular editor shell;
- Quest/block workspace;
- START and END;
- explicit connections;
- saved workspace layout;
- fine-grid / snap / smart-shortest connector presentation;
- current export workflow;
- validation foundation.

Current implementation does not yet complete canonical connected-project Quest/Side Quest save/index writing.

## Canonical Future Project Files

Quest Builder should eventually read and write:

```text
quests/quest-index.json
quests/quest_<slug>.json
sidequests/sidequest-index.json
sidequests/sidequest_<slug>.json
```

Exact schemas are governed by the project-file contract and schema reference.

For the first implementation, quest-specific dialogue should be stored with the Quest or Side Quest that uses it, or in a Quest Builder-owned companion record explicitly tied to that Quest if file size later requires separation. Do not require a new global `dialogue/` project area merely for first-version authoring.

Recommended initial direction:

```text
quests/quest_<slug>.json
  flow blocks
  actions / conditions / outcomes
  dialogueRecords[]
  capraFeedbackRecords[] or dialogueRecords[] with displayMode: capra
```

This is an authoring direction, not a final locked JSON schema.

## Block Versus Internal Event Rule

The flow canvas is for meaningful progression steps, not every microscopic response.

A Quest block represents a meaningful event in the Quest flow, for example:

```text
Speak With Vitus
Give Chalice to Vitus
Cleanse the Shrine
Defeat the Bellator
Calling Fulfilled
```

Inside a block, the editor may store the action, conditions, success results, failure feedback and dialogue lines needed to execute that event.

Do not force each dialogue line, failed-object response or flag assignment to become a separate flow card unless it genuinely represents a visible progression step or branching event the creator needs to arrange on the canvas.

## Standard Block Authoring Model

Every actionable block should be designed around the same authoring sequence:

```text
Trigger / Action
→ Requirements and Conditions
→ Success Outcomes
→ Failure Outcomes / Feedback
→ Dialogue / Presentation when required
```

A block may leave some sections empty, but the structure should remain consistent so a creator does not need to understand code or type raw logic strings for ordinary work.

## Structured Action Editor

The Action area describes what Mel or the game event does. It should use selectable fields rather than a single vague text field once implemented.

Suggested fields:

| Field | Purpose |
|---|---|
| Action type | `speak`, `inspect`, `collect`, `give`, `use`, `activate`, `enter`, `reach`, `defeat`, `survive`, `hide`, `ritual`, `craft`, `buy`, `pay`, `bribe`, `scavenge`, `trigger` |
| Actor | Usually Mel/player; may be companion or system event when required |
| Target type | NPC, object, Foe, scene, route, puzzle, Codice entry, UI event or none |
| Target ID | Stable referenced ID, selected from the owning module where possible |
| Scene/screen context | Where this action is valid, when location matters |
| Active item/relic required | Optional selected item or Songspell needed for the action |
| Quantity/value | Optional amount for Silver, items or collection requirements |
| Description label | Human-readable summary shown on the block and in authoring UI |

Examples:

```text
actionType: speak       targetId: archobj_vitus
actionType: give        targetId: archobj_vitus        requiredItemId: archobj_sacred_chalice
actionType: defeat      targetId: archobj_bellator_executioner
actionType: scavenge    targetId: objinst_hollow_log_03
actionType: activate    targetId: route_south_gate     requiredItemId: archobj_bronze_key
```

## Conditions and Requirements

A Condition is a test. It decides whether the action is available, whether an outcome occurs, whether a branch becomes usable, or whether a Quest can complete.

The creator should build ordinary conditions through structured controls rather than writing raw code. Export may later produce compact strings or objects, but the editing interface should expose readable fields.

Initial condition types should cover:

```text
flag true / flag false
has item / missing item
has Silver at least
quest complete / quest not complete
scene visited
object collected
Foe defeated
puzzle complete
Codice clue discovered
Songspell unlocked
world state matches
```

Examples:

```text
has item: archobj_sacred_chalice
flag true: flag_vitus_trusts_mel
Silver at least: 20
Foe defeated: archobj_executioner
all of: has chalice + spoke to Vitus
```

## Success Outcomes

An Outcome is a change that happens after the action succeeds. One block may have more than one success outcome.

Initial outcome types should cover:

```text
set flag true / false
give or remove item
give or remove Silver
add ingredient or supply
add Codice clue / advance translation state
unlock route, scene, screen, Stone Marker or next Quest
trigger dialogue
show Calling Fulfilled
show reward or UI notice
begin battle or transition
restore or remove Life Force where story/gameplay requires it
```

Examples:

```text
Give Chalice to Vitus
  success → remove archobj_sacred_chalice
  success → set flag_chalice_returned true
  success → trigger dialogue_ch01_q03_vitus_chalice_returned
  success → add Codice clue
  success → unlock quest_church_crypt
```

## Failure Outcomes and Capra Feedback

A failed action should normally explain why it failed rather than silently doing nothing. Failure feedback is not always a new Quest block; it is usually an event stored inside the attempted block.

Initial failure cases should cover:

```text
wrong object used
required object missing
not enough Silver
wrong location
locked route or inaccessible scene
condition not yet met
magical action blocked by Null Zone
hazardous/corrupted action warning
```

Capra is the normal in-world feedback voice for failed puzzle/item attempts, reminders and warnings. A failed outcome may trigger a Capra line, a normal dialogue line, a status message, an audio cue or a UI notice.

Most failed puzzle attempts should not hurt Mel. Damage is used only where the authored event is intentionally dangerous, such as touching Sekhemra, entering a trap or attempting a harmful magical interaction.

## Dialogue / Feedback Inside Quest Builder

Dialogue required by a Quest is authored from inside Quest Builder.

The creator selects a block and opens its editing interface. Where that block needs NPC speech, Mel dialogue, narration, Capra feedback, or short scripted text, the editor provides a **Dialogue / Feedback** area or an **Open Dialogue Script** sub-screen within Quest Builder.

Do not create a separate top-level Dialogue Library / Dialogue Editor module for the first version merely to enter quest dialogue.

A separate shared dialogue library may be considered later only if repeated dialogue, localisation, global voice recording management, or cross-Quest reuse becomes large enough to justify it.

Dialogue / Feedback fields should support:

| Field | Purpose |
|---|---|
| Dialogue record ID | Stable Quest-scoped ID, such as `dialogue_ch01_q03_vitus_warning` |
| Line ID | Unique line ID used for text/audio matching, such as `ch01_q03_vitus_warning_01` |
| Speaker | Mel, NPC, Capra, narrator or system |
| Speaker/object reference | Stable object/NPC ID where available |
| Text | Displayed dialogue line |
| Portrait reference | Optional registered portrait/asset reference |
| Audio reference | Optional registered voice/audio reference |
| Display mode | Normal dialogue popup, Capra popup, small Capra corner reminder, narration or UI notice |
| Conditions | When this record/line appears, if conditional |
| On complete | Outcomes triggered after the dialogue finishes, when required |

Dialogue presentation rules for the first version:

- dialogue is short and linear;
- Mel's replies are automatic;
- no large branching conversation system is required;
- topic-selection or optional lore questions may be considered later;
- the same system is used for normal NPC dialogue and Capra feedback, with Capra-specific display behaviour where appropriate;
- portraits and audio are referenced assets, not duplicated into quest data.

## Puzzle Creator Handoff

Quest Builder may later include a `Puzzle` block, but it must reference a saved puzzle by stable ID.

Expected future relationship:

```text
Puzzle Creator
  saves puzzle_chalice_pedestal

Quest Builder
  block: Solve the Chalice Pedestal
  puzzleId: puzzle_chalice_pedestal
  on complete: set flag, trigger dialogue, grant item, continue Quest
```

Quest Builder owns prerequisites, dialogue, rewards, flags, Capra feedback and branch outcomes around the puzzle. Puzzle Creator owns the internal puzzle layout, rules, completion evaluation and local feedback.

Quest Builder must not copy a Puzzle Creator grid, symbol board, maze layout or internal rule system into a Quest block.

## Quest Builder Puzzle Block

A future versioned Quest Builder implementation should provide a meaningful flow block type:

```text
Puzzle
```

Required primary link:

```text
puzzleId
```

Suggested block data direction:

```json
{
  "id": "block_solve_chalice_pedestal",
  "type": "puzzle",
  "name": "Solve the Chalice Pedestal",
  "puzzleId": "puzzle_chalice_pedestal",
  "requirements": [],
  "successOutcomes": [
    { "type": "set_flag", "flagId": "flag_chalice_pedestal_solved", "value": true }
  ],
  "failureOutcomes": []
}
```

This is a design direction, not a final locked runtime JSON shape. The final schema must be defined with validation before implementation.

## Potion Match / Item Order Handoff

Potion Match can be used in two ways:

1. **Challenge Potion Puzzle** — a scene or quest puzzle where the player must choose ingredients in the correct order.
2. **Crafting Skill** — a reusable crafting interface where available ingredients come from the character inventory and the completed recipe creates a potion, spell, tool or ability item.

In both cases, Puzzle Creator owns the internal puzzle/crafting interaction. Quest Builder owns the story and progression consequences.

Puzzle Creator owns:

- challenge/crafting mode;
- recipe order and decoy ingredients;
- internal success/failure evaluation;
- local quality/mistake/strict-mode behaviour;
- ingredient definitions for the puzzle authoring context;
- background image and ingredient icon references;
- optional success/failure visual preview, such as a video or Effects Library reference.

Quest Builder owns:

- inventory transactions that happen because a Quest uses the Potion Match puzzle;
- Quest flags and consequences resulting from success/failure;
- story dialogue and Capra responses around the potion use;
- unlocking a route, scene, Quest step, item, spell or ability after completion;
- any Quest-specific reward or penalty.

The Quest must still reference the saved puzzle/crafting definition by stable `puzzleId` or future crafting recipe reference. It must not duplicate the full Potion Match recipe and evaluation system inside the Quest block.

## Internal Quest Rules Versus Referenced Module Content

Quest Builder may reference:

```text
sceneId
screenId
puzzleId
assetId
archetypeObjectId
archetypeEffectId
flagId
questId
sidequestId
```

A reference does not transfer ownership. The referenced module remains the owner of the referenced record.

## Validation Requirements

Before exporting real Quest content, validation should report at least:

```text
missing required target ID for a structured action
missing condition subject/value where required
completion block without a completion condition
outcome referring to an unknown flag, item, quest, route or scene
block referring to a missing dialogue record
dialogue record with no lines
line referring to an unknown portrait/audio asset where asset validation is available
Capra failure feedback with no displayed message
unconnected required flow block
missing puzzleId on a Puzzle block
Puzzle block referring to a puzzle that is not in puzzles/puzzle-index.json
Quest block copying puzzle internals instead of referencing puzzleId
```

The app must distinguish between a missing external referenced asset and missing quest-owned dialogue content.

## Relationships

### Project Editor

Project Editor owns Flatplan/routes. Quest Builder owns Quest progression. Project Editor may link routes to Quest outcomes or gates, but it does not author Quest internals.

### Scene Editor

Scene Editor owns visual scene/screen content. Quest Builder may reference scene/screen IDs and react to progression events.

### Puzzle Creator

Puzzle Creator owns self-contained challenges. Quest Builder references saved puzzles by `puzzleId`.

### Asset Library

Quest Builder may use final registered assets for portraits, icons, rewards, UI and audio. Asset Library owns the `asset_` records.

### Sound Library

Quest Builder may later select registered sound assets for quest start, completion, failure, reward, dialogue, feedback or Capra response. It stores only `asset_` IDs.

### Runtime / Playtest

Test Quest should use a confirmed shared Runtime/Playtest interface. Quest Builder must not invent a private runtime that writes test state into permanent project files.

## Current Gaps

Known gaps include:

- canonical connected-project Quest/Side Quest save/index output is not complete;
- Project Manager naming remains in some paths/UI and needs migration to Project Editor;
- structured action/condition/outcome/dialogue/Capra authoring remains future work;
- dynamic workspace expansion and Insert Space need separate UI work;
- `Puzzle` block with required `puzzleId` depends on Puzzle Creator canonical saving;
- Potion Match / crafting outcome handoff depends on Puzzle Creator canonical saving and recipe/crafting schema decisions;
- Sound Library selector support is future/provisional;
- Test Quest depends on shared Runtime/Playtest.

## Source Classification

Older Quest Builder docs, structured authoring docs and Puzzle Creator integration notes are source evidence after this specification.

These old documents have been consolidated into this active spec and can be archived:

```text
07a-quest-builder-structured-authoring.md
07b-puzzle-creator-quest-integration.md
07C-potion-match-quest-outcome-handoff.md
```

Puzzle-specific rules also appear in `17A-puzzle-creator.md`.

## Remaining Work

All current and future Quest Builder work belongs in `docs/artifex/02A-global-to-do.md`. This specification must not become a task list.
