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
- quest-level Capra/narrative feedback where used;
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
- treat local exports as canonical connected-project saves once connected saving exists.

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

## Dialogue and Structured Authoring

Quest Builder is the correct owner for quest-level dialogue and progression blocks, including structured actions, conditions and outcomes.

Future structured authoring should support clear block types, validation and explicit outcomes rather than unbounded free-text instructions hidden in generic notes.

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
- Sound Library selector support is future/provisional;
- Test Quest depends on shared Runtime/Playtest.

## Source Classification

Older Quest Builder docs, structured authoring docs and Puzzle Creator integration notes are source evidence after this specification. Their lasting Quest rules are consolidated here. Puzzle-specific rules also appear in `17A-puzzle-creator.md`.

## Remaining Work

All current and future Quest Builder work belongs in `docs/artifex/02A-global-to-do.md`. This specification must not become a task list.
