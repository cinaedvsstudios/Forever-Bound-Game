# Puzzle Creator and Quest Builder Integration Contract

## Purpose

This document defines how a completed puzzle created in **Puzzle Creator** is used in **Quest Builder** and, where needed, referenced by **Project Editor**.

A puzzle is a self-contained playable challenge. A Quest may contain one or more puzzles as meaningful flow steps, but Quest Builder must not absorb or duplicate a puzzle's internal authored mechanics.

This is a design and integration contract. It does not mean the currently live Quest Builder V1.2.12 already exposes a Puzzle block or that Puzzle Creator V1.34 already writes canonical connected-project files.

## Locked Module Names

Use these user-facing names in documentation and UI:

```text
Project Editor
Quest Builder
Puzzle Creator
```

Do not use **Project Manager** as the user-facing name. Existing code identifiers, historical documents or project-file names that still use `project-manager` are migration work and must be changed deliberately rather than silently treated as the preferred terminology.

## Core Ownership Rule

```text
Puzzle Creator = builds and saves the self-contained puzzle.
Quest Builder = places that saved puzzle into a Quest flow and controls story/progression outcomes around it.
Project Editor = connects the wider world/route structure and may reference puzzle or Quest completion gates.
```

### Puzzle Creator owns

- puzzle type/engine and internal playable configuration;
- puzzle layout, cells, start/exit, object placements, internal doors or internal transitions where the puzzle engine supports them;
- puzzle-local features, mandatory completion requirements and internal evaluation;
- referenced final assets/archetypes/effects used inside the puzzle;
- puzzle index records and puzzle content files.

### Quest Builder owns

- a meaningful `Puzzle` flow block that references an existing `puzzleId`;
- the Quest reason for entering/starting the puzzle;
- Quest-level requirements before the puzzle is attempted;
- the flow branch that follows puzzle completion or an authored failure/cancel event;
- Quest outcomes resulting from puzzle completion, such as flags, rewards, Codice updates, dialogue, Capra responses or unlocking the next Quest step;
- validation that a referenced puzzle exists in the connected project's puzzle index.

### Project Editor owns

- the project-level route/Flatplan structure around scenes, routes and wider gates;
- structural use of public results such as `quest complete`, `flag true` or, where intentionally supported, `puzzle complete`;
- validation/display of whether a world route references a missing puzzle/Quest result.

It does not author the inside of either a Quest or a puzzle.

## Why Puzzle Creator Is Related to Quest Builder but Remains Separate

Puzzle Creator is similar to Quest Builder because it defines an interactive sequence with conditions and completion. The difference is scope:

- a **Quest** coordinates story/progression across scenes, objects, dialogue, rewards, branches and multiple events;
- a **Puzzle** is a contained gameplay challenge that can be inserted into that progression as one meaningful event.

For example:

```text
Quest: Recover the Chalice
  Enter Chapel
  Speak With Vitus
  Solve Chalice Pedestal Puzzle  → references puzzle_chalice_pedestal
  Receive Correct Chalice
  Return to Vitus
  Calling Fulfilled
```

The Quest records that the puzzle happens and what completion unlocks. The Puzzle file records how the pedestal puzzle itself behaves.

## Canonical Project Files

Puzzle Creator writes its own project-root content:

```text
puzzles/puzzle-index.json
puzzles/puzzle_<slug>.json
```

The canonical empty puzzle index created by Creation Guide is:

```json
{
  "schemaVersion": "artifex.puzzles.index.v1",
  "projectId": "project_forever_bound",
  "puzzles": []
}
```

Quest Builder writes only its Quest-owned content:

```text
quests/quest-index.json
quests/quest_<slug>.json
sidequests/sidequest-index.json
sidequests/sidequest_<slug>.json
```

A Quest must reference the stable `puzzle_` ID. It must not copy the maze grid, symbol-board configuration, puzzle features or full puzzle JSON into the Quest file.

## Quest Builder Puzzle Block

Quest Builder must eventually provide a dedicated meaningful flow block type:

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

## Public Puzzle Results and Quest Outcomes

Puzzle Creator determines whether its internal completion rules have been met. Quest Builder consumes the public completion result and then continues the Quest flow.

A puzzle may expose a simple result such as:

```text
puzzle complete: puzzle_chalice_pedestal
```

Quest Builder can then author surrounding outcomes, for example:

```text
on puzzle completed
  → set flag: flag_chalice_pedestal_solved
  → trigger dialogue: dialogue_chalice_revealed
  → grant item: archobj_sacred_chalice
  → continue to Return to Vitus block
```

The same result may be referenced by Project Editor only where a world route genuinely needs a puzzle-level gate. Where the route depends on completion of the overall Quest rather than the puzzle alone, Project Editor should use the Quest result instead.

## Conditions and Flags Boundary

Quest Builder owns story/progression flags that are created because a Quest event happened. Puzzle Creator owns internal puzzle checks required to solve its own challenge.

Examples:

| Data | Owner |
|---|---|
| Exit reached, required puzzle collect found, correct symbol sequence entered | Puzzle Creator internal completion rules |
| `flag_chalice_pedestal_solved` set after the puzzle resolves in the Quest | Quest Builder |
| A world route unlocks when `flag_chalice_pedestal_solved` is true | Project Editor consumes Quest Builder result |

A puzzle's internal completion rule should not become a collection of hand-written free-text rules inside the Quest block.

## Dialogue, Capra and Rewards Around Puzzles

Puzzle Creator may own puzzle-local feedback required during an attempt, such as a wrong-input sound, correct-input visual response or internal helper marker.

Quest Builder owns story-facing feedback around that puzzle's role in the Quest, such as:

- the dialogue that introduces the challenge;
- Capra explaining why this challenge matters;
- the dialogue shown after the puzzle is solved;
- Quest-level rewards, Codice updates or next-step unlocks;
- a branching Quest response if the puzzle allows a deliberate alternate outcome.

When a particular Capra response is purely an immediate internal puzzle hint, it may remain part of the puzzle's feedback configuration. When it changes or narrates Quest progression, it belongs in Quest Builder.

## Asset and Audio References

Puzzle Creator and Quest Builder follow the same final-asset rule:

- they may reference registered `asset_` IDs for images, voice, sound or generated audio recipes;
- they may reference `archobj_` or `archeffect_` records where the owning module provides those definitions;
- they must not store direct permanent references to `intake/` source files;
- they must not create an `archsound_` library or duplicate generated sound recipes into puzzle/quest files.

## Required Quest Builder UI Direction

A future versioned Quest Builder implementation should add:

1. A `Puzzle` block type in the block menu/taxonomy.
2. A linked Puzzle field that selects a real record from `puzzles/puzzle-index.json`.
3. An action to open the linked puzzle in Puzzle Creator for editing, when connected-project routing is available.
4. Contextual sections for Quest-level prerequisites and success/failure outcomes around the puzzle.
5. Validation for missing `puzzleId`, missing puzzle index record, missing required completion route and unresolved external references.

The current V1.2.12 Quest Builder does not yet implement this. Adding it is a future live-app change and must increment the visible app version.

## Current Puzzle Creator Status Relevant to Integration

Puzzle Creator V1.34 is the accepted live UI-shell and Maze / Labyrinth authoring baseline on `main`, merged in PR #42 on 2026-06-02. It surfaces six puzzle-type choices on a landing screen: Maze / Labyrinth, Arena Trial, Obstacle Course, Symbol Assembly, Item Order Puzzle and Hazard Puzzle. It opens a selected workflow with consistent labelled navigation stages of **Setup**, **Display**, **Logic** and **Colors**.

Maze / Labyrinth remains the currently developed playable editor and retains the accepted V1.33 Maze behaviour, including the organised **Walls → Scatter → Colours** panel and clearer **Place Markers** Scatter workflow. The remaining listed puzzle types continue to represent their existing early workflow state, not completed playable engines.

V1.34 changes navigation and presentation only. It does not implement new puzzle gameplay engines, connected-project puzzle saving or Quest linking.

The current Puzzle Creator is not yet canonical connected-project integration for Quest Builder:

- it still operates as its own exported/downloaded JSON workflow;
- its current naming uses module-oriented/export-oriented fields rather than a confirmed canonical `puzzle_` project record workflow;
- it must eventually save/register its content under `puzzles/puzzle-index.json` and `puzzles/puzzle_<slug>.json` before Quest Builder can reliably pick saved puzzles from the connected project.

## Required Implementation Order

1. Keep the accepted V1.34 puzzle editor shell and Maze workflow stable; do not bolt Quest flow into Puzzle Creator itself.
2. Define/align Puzzle Creator canonical saved-file and index output under `puzzles/`.
3. Add Puzzle Builder/Quest Builder connected-project loading of the real puzzle index.
4. Add the Quest Builder `Puzzle` flow block and linked-puzzle selector.
5. Validate missing puzzle references and public completion results through Health/Build when those systems are integrated.
6. Let Project Editor consume Quest/puzzle public completion references only for wider route structure.

## Scope Protection

Do not:

- copy a whole puzzle definition into a Quest block;
- make Quest Builder edit maze cells, symbol boards or internal puzzle feature configuration;
- make Puzzle Creator author whole Quest chains, dialogue sequences or Quest rewards;
- make Project Editor author the internals of either module;
- create direct final links to temporary/intake files;
- treat the live integration as complete until the relevant app version is implemented and browser-tested.
